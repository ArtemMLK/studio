'use client';
import {
  collection,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '..';
import { Branch } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { BRANCHES_COLLECTION } from '@/lib/constants';


export function useBranches() {
  const firestore = useFirestore();

  const branchesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, BRANCHES_COLLECTION);
  }, [firestore]);

  const { data, isLoading, error } = useCollection<Branch>(branchesCollection);

  return { data: data, loading: isLoading, error };
}

export async function addBranch(branch: Omit<Branch, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const branchesCollection = collection(firestore, BRANCHES_COLLECTION);
  await addDocumentNonBlocking(branchesCollection, branch);
}
