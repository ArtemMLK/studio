'use client';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  collectionGroup,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import {
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';

// Main hook to get all procurement processes across all branches
export function useProcurementProcesses() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [procurements, setProcurements] = useState<ProcurementProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !user) {
      setLoading(false);
      return;
    }

    const fetchProcurements = async () => {
      setLoading(true);
      try {
        const branchesSnapshot = await getDocs(
          collection(firestore, BRANCHES_COLLECTION)
        );
        const branches = branchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[];
        const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

        const q = collectionGroup(firestore, PROCUREMENT_PROCESSES_COLLECTION);
        const querySnapshot = await getDocs(q);

        const procs = querySnapshot.docs.map((doc) => {
          const data = doc.data() as ProcurementProcess;
          const branchName = branchesMap.get(data.branchId) || 'Неизвестно';
          return {
            ...data,
            id: doc.id,
            branchName,
          };
        });

        setProcurements(procs);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcurements();
  }, [firestore, user]);

  return { data: procurements, loading, error };
}

export function useProcurementProcess(procurementId?: string) {
  // This is a simplified hook. In a real app, you'd need to find which branch this process belongs to.
  // For now, we assume a more complex query would be needed or the branchId would be available.
  const { data: allProcs, loading, error } = useProcurementProcesses();
  const procurement =
    allProcs.find((p) => p.id === procurementId) || null;
  return { data: procurement, loading, error };
}


export async function addProcurementProcess(
  branchId: string,
  procurement: Omit<ProcurementProcess, 'id'>
) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const procCollection = collection(
    firestore,
    BRANCHES_COLLECTION,
    branchId,
    PROCUREMENT_PROCESSES_COLLECTION
  );
  await addDocumentNonBlocking(procCollection, procurement);
}
