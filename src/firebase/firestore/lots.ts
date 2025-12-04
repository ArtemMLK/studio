'use client';
import {
  collection,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Lot } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { LOTS_COLLECTION } from '@/lib/constants';


export function useLots() {
  const firestore = useFirestore();
  const { user } = useUser(); // Get the authenticated user

  const lotsCollection = useMemoFirebase(() => {
    // Only return the collection if the user is authenticated
    if (!firestore || !user) return null;
    return collection(firestore, LOTS_COLLECTION);
  }, [firestore, user]);

  const { data, isLoading, error } = useCollection<Lot>(lotsCollection);

  // The hook's loading state should reflect the auth state as well.
  // It's loading if we are waiting for the user OR if we are waiting for firestore data.
  return { data: data || [], loading: !user || isLoading, error };
}

export async function addLot(lot: Omit<Lot, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const lotsCollection = collection(firestore, LOTS_COLLECTION);
  await addDocumentNonBlocking(lotsCollection, lot);
}
