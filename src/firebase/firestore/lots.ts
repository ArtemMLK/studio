'use client';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Lot } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { LOTS_COLLECTION } from '@/lib/constants';

// Hook to get lots, optionally filtered by procurementId or branchId
export function useLots(procurementId?: string, branchId?: string) {
  const firestore = useFirestore();
  const { user } = useUser();

  const lotsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    let q = collection(firestore, LOTS_COLLECTION);

    if (procurementId) {
      return query(q, where('procurementId', '==', procurementId));
    }
    
    // If branchId is provided and not 'all', filter by it.
    // Note: This requires a 'branchId' field on the Lot documents.
    // We will assume lots have a branchId for this to work.
    if (branchId && branchId !== 'all') {
      return query(q, where('branchId', '==', branchId));
    }

    return q;
  }, [firestore, user, procurementId, branchId]);

  const { data, isLoading, error } = useCollection<Lot>(lotsQuery);

  return { data: data || [], loading: !user || isLoading, error };
}


export function useLotsByProcurement(procurementId?: string) {
  return useLots(procurementId);
}

export async function addLot(lot: Omit<Lot, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const lotsCollection = collection(firestore, LOTS_COLLECTION);
  await addDocumentNonBlocking(lotsCollection, lot);
}
