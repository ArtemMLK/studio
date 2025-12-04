'use client';
import {
  collection,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Branch } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { BRANCHES_COLLECTION } from '@/lib/constants';


export function useBranches() {
  const firestore = useFirestore();
  const { user } = useUser(); // Get the authenticated user

  const branchesCollection = useMemoFirebase(() => {
    // Only return the collection if the user is authenticated
    if (!firestore || !user) return null;
    return collection(firestore, BRANCHES_COLLECTION);
  }, [firestore, user]);

  const { data, isLoading, error } = useCollection<Branch>(branchesCollection);

  // The hook's loading state should reflect the auth state as well.
  // It's loading if we are waiting for the user OR if we are waiting for firestore data.
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
