'use client';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useCollection } from '..';
import { Branch } from '@/lib/types';
import { useEffect, useMemo } from 'react';

const BRANCHES_COLLECTION = 'branches';

export function useBranches() {
  const firestore = useFirestore();
  const branchesCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, BRANCHES_COLLECTION);
  }, [firestore]);

  const { data, loading, error } = useCollection(branchesCollection, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const branches: Branch[] = useMemo(() => {
    if (!data) return [];
    return data.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Branch));
  }, [data]);

  return { data: branches, loading, error };
}

export async function addBranch(branch: Omit<Branch, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const branchesCollection = collection(firestore, BRANCHES_COLLECTION);
  await addDoc(branchesCollection, branch);
}
