'use client';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Branch, User } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { BRANCHES_COLLECTION, USERS_COLLECTION } from '@/lib/constants';
import { useDoc } from '../firestore/use-doc.tsx';
import { doc } from 'firebase/firestore';

export function useBranches(all: boolean = false, branchId?: string) {
  const firestore = useFirestore();
  const { user } = useUser();

  // Get current user's data to check for roles and branchIds
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, USERS_COLLECTION, user.uid);
  }, [firestore, user]);
  const { data: currentUserData } = useDoc<User>(userDocRef);

  const branchesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !currentUserData) return null;

    let q = collection(firestore, BRANCHES_COLLECTION);

    // If 'all' is explicitly requested by an admin, return all branches
    if (all && currentUserData.roles.includes('Администратор')) {
      return q;
    }

    // For a specific branchId, just query for that one if user has access
    if (branchId && branchId !== 'all') {
         if (currentUserData.roles.includes('Администратор') || currentUserData.branchIds.includes(branchId)) {
            return query(q, where('__name__', '==', branchId));
         }
         return null; // User doesn't have access to this specific branch
    }

    // If user is not admin, filter by their assigned branchIds
    if (!currentUserData.roles.includes('Администратор') && currentUserData.branchIds.length > 0) {
        return query(q, where('__name__', 'in', currentUserData.branchIds));
    }
    
    // Admin sees all branches by default, non-admin with no branches sees none.
    if (currentUserData.roles.includes('Администратор')) {
        return q;
    }

    // Return a query that yields no results if a non-admin has no branches.
    return query(q, where('__name__', 'in', ['non-existent-id']));

  }, [firestore, user, currentUserData, all, branchId]);

  const { data, isLoading, error } = useCollection<Branch>(branchesQuery);

  // The loading state depends on auth, user data, and the collection query itself
  const derivedLoading = !user || !currentUserData || isLoading;

  return { data: data || [], loading: derivedLoading, error };
}

export async function addBranch(branch: Omit<Branch, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const branchesCollection = collection(firestore, BRANCHES_COLLECTION);
  await addDocumentNonBlocking(branchesCollection, branch);
}


export function updateBranch(branchId: string, data: Partial<Omit<Branch, 'id'>>) {
    const firestore = useFirestore();
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const branchDocRef = doc(firestore, BRANCHES_COLLECTION, branchId);
    updateDocumentNonBlocking(branchDocRef, data);
}
