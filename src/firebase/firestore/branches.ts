'use client';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Branch } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { BRANCHES_COLLECTION } from '@/lib/constants';

export function useBranches(all: boolean = false, branchId?: string) {
  const firestore = useFirestore();
  const { user } = useUser();

  const branchesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    let q = collection(firestore, BRANCHES_COLLECTION);

    if (all) {
      return q; // Return all branches if 'all' is true
    }

    if (branchId && branchId !== 'all') {
      return query(q, where('__name__', '==', branchId));
    }
    
    // In a real app with full RBAC, you'd filter by user's assigned branches.
    // For now, if no specific branch is requested, we show all.
    return q;
  }, [firestore, user, all, branchId]);

  const { data, isLoading, error } = useCollection<Branch>(branchesQuery);

  return { data: data || [], loading: !user || isLoading, error };
}

export async function addBranch(branch: Omit<Branch, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const branchesCollection = collection(firestore, BRANCHES_COLLECTION);
  await addDocumentNonBlocking(branchesCollection, branch);
}
