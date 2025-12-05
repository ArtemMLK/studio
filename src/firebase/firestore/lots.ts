'use client';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { Lot, ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { LOTS_COLLECTION, PROCUREMENT_PROCESSES_COLLECTION, BRANCHES_COLLECTION } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useDoc } from './use-doc';

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
    
    if (branchId && branchId !== 'all') {
      return query(q, where('branchId', '==', branchId));
    }

    return q;
  }, [firestore, user, procurementId, branchId]);

  const { data, isLoading, error } = useCollection<Lot>(lotsQuery);

  return { data: data || [], loading: !user || isLoading, error };
}

// Hook to get a single lot and enrich it with procurement and branch names
export function useLot(lotId?: string) {
    const firestore = useFirestore();
    const [lot, setLot] = useState<(Lot & { procurementName?: string, branchName?: string }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const lotDocRef = useMemoFirebase(() => {
        if (!firestore || !lotId) return null;
        return doc(firestore, LOTS_COLLECTION, lotId);
    }, [firestore, lotId]);

    const { data: lotData, isLoading: isLotLoading, error: lotError } = useDoc<Lot>(lotDocRef);

    useEffect(() => {
        if (isLotLoading) {
            setLoading(true);
            return;
        }
        if (lotError) {
            setError(lotError);
            setLoading(false);
            return;
        }
        if (!lotData) {
            setLot(null);
            setLoading(false);
            return;
        }

        const fetchExtraData = async () => {
            if (!firestore) return;
            try {
                let procurementName = 'N/A';
                let branchName = 'N/A';

                // This is complex because procurements are in a subcollection
                // A better structure would have procurements at the top level
                const branchDocRef = doc(firestore, BRANCHES_COLLECTION, lotData.branchId);
                const branchDoc = await getDoc(branchDocRef);
                if (branchDoc.exists()) {
                    branchName = (branchDoc.data() as Branch).name;
                    const procDocRef = doc(branchDocRef, PROCUREMENT_PROCESSES_COLLECTION, lotData.procurementId);
                    const procDoc = await getDoc(procDocRef);
                    if (procDoc.exists()) {
                        procurementName = (procDoc.data() as ProcurementProcess).name;
                    }
                }

                setLot({ ...lotData, procurementName, branchName });
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExtraData();
    }, [lotData, isLotLoading, lotError, firestore]);

    return { data: lot, loading, error };
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

export function updateLot(lotId: string, data: Partial<Omit<Lot, 'id'>>) {
    const firestore = useFirestore();
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const lotDocRef = doc(firestore, LOTS_COLLECTION, lotId);
    updateDocumentNonBlocking(lotDocRef, data);
}
