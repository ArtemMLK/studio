'use client';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  Query,
  onSnapshot,
} from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Lot, ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import {
  LOTS_COLLECTION,
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useDoc } from './use-doc';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';

// Hook to get lots, filtered by security rules
export function useLots(procurementId?: string) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } =
    useCurrentUserData();
  const { selectedBranchId } = useBranchSelection();

  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const lotsQuery = useMemo(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    let q: Query | null = collection(firestore, LOTS_COLLECTION);
    const whereClauses: any[] = [];

    if (procurementId) {
      whereClauses.push(where('procurementId', '==', procurementId));
    }

    if (selectedBranchId && selectedBranchId !== 'all') {
       whereClauses.push(where('branchId', '==', selectedBranchId));
    }

    if (whereClauses.length > 0) {
        q = query(q, ...whereClauses);
    }
    
    console.log('useLots Query:', {
        path: 'lots',
        filters: whereClauses.map(w => ({
            field: w['_f'], op: w['_op'], value: w['_v']
        }))
    });

    return q;
  }, [
    firestore,
    authUser,
    currentUserData,
    selectedBranchId,
    procurementId,
  ]);

  useEffect(() => {
    if (isCurrentUserDataLoading) {
      setLoading(true);
      return;
    }
    if (!lotsQuery) {
      setLots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      lotsQuery,
      (snapshot) => {
        const lotData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Lot)
        );
        setLots(lotData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching lots:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [lotsQuery, isCurrentUserDataLoading]);
  
  const combinedLoading = loading || isCurrentUserDataLoading;

  return { data: lots, loading: combinedLoading, error };
}

// Hook to get a single lot and enrich it with procurement and branch names
export function useLot(lotId?: string) {
  const firestore = useFirestore();
  const [lot, setLot] =
    useState<(Lot & { procurementName?: string; branchName?: string }) | null>(
      null
    );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const lotDocRef = useMemo(() => {
    if (!firestore || !lotId) return null;
    return doc(firestore, LOTS_COLLECTION, lotId);
  }, [firestore, lotId]);

  const {
    data: lotData,
    isLoading: isLotLoading,
    error: lotError,
  } = useDoc<Lot>(lotDocRef);

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
      setLoading(true);
      try {
        let procurementName = 'N/A';
        let branchName = 'N/A';

        // This is complex because procurements are in a subcollection
        // A better structure would have procurements at the top level
        if (lotData.branchId) {
          const branchDocRef = doc(
            firestore,
            BRANCHES_COLLECTION,
            lotData.branchId
          );
          const branchDoc = await getDoc(branchDocRef);
          if (branchDoc.exists()) {
            branchName = (branchDoc.data() as Branch).name;
            if (lotData.procurementId) {
              const procDocRef = doc(
                branchDocRef,
                PROCUREMENT_PROCESSES_COLLECTION,
                lotData.procurementId
              );
              const procDoc = await getDoc(procDocRef);
              if (procDoc.exists()) {
                procurementName = (procDoc.data() as ProcurementProcess).name;
              }
            }
          }
        }

        setLot({ ...lotData, procurementName, branchName });
      } catch (err: any) {
        console.error('Error enriching lot data: ', err);
        setError(err);
        // Still set the basic lot data even if enrichment fails
        setLot(lotData);
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

export function addLot(lot: Omit<Lot, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const lotsCollection = collection(firestore, LOTS_COLLECTION);
  addDocumentNonBlocking(lotsCollection, lot);
}

export function updateLot(lotId: string, data: Partial<Omit<Lot, 'id'>>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const lotDocRef = doc(firestore, LOTS_COLLECTION, lotId);
  updateDocumentNonBlocking(lotDocRef, data);
}
