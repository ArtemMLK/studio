'use client';
import { collection, query, where, Query, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Branch } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { BRANCHES_COLLECTION, USERS_COLLECTION } from '@/lib/constants';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { useMemo, useState, useEffect } from 'react';

export function useBranches(all: boolean = false) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const branchesQuery = useMemo(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    let q: Query | null = collection(firestore, BRANCHES_COLLECTION);
    const userRoles = currentUserData.roles || [];
    const userBranchIds = currentUserData.branchIds || [];

    // If 'all' is requested, only admin can get it.
    if (all) {
      if (userRoles.includes('Администратор')) {
        return q;
      }
      // Non-admin requesting 'all' gets only their own branches.
      if (userBranchIds.length === 0) return null;
      return query(q, where('__name__', 'in', userBranchIds));
    }

    // Default behavior: Admin gets all, others get their assigned branches.
    if (userRoles.includes('Администратор')) {
      return q;
    } else {
      if (userBranchIds.length === 0) return null; // Non-admin with no branches gets nothing.
      return query(q, where('__name__', 'in', userBranchIds));
    }
  }, [firestore, authUser, currentUserData, all]);

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }
    if (!branchesQuery) {
      setBranches([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(branchesQuery, 
      (snapshot) => {
        const brs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
        setBranches(brs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching branches:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [branchesQuery, isUserLoading]);

  const combinedLoading = loading || isUserLoading;
  
  return { data: branches, loading: combinedLoading, error };
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
