'use client';
import { collection, query, where, getDocs, Query, addDoc, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '..';
import { Receipt, Lot, Branch } from '@/lib/types';
import {
  RECEIPTS_COLLECTION,
  LOTS_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useLots } from './lots';
import { useBranches } from './branches';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';

// Main hook to get receipts, enriched with related data
export function useReceipts() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { selectedBranchId } = useBranchSelection();

  // Fetch all necessary data for enrichment
  const { data: lots, isLoading: lotsLoading } = useLots();
  const { data: branches, loading: branchesLoading } = useBranches(true);

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !authUser) {
        if (!authUser && !loading) setLoading(false);
        return;
    };

    // Wait until all enrichment data is loaded
    if (lotsLoading || branchesLoading) {
      return;
    }


    const fetchReceipts = async () => {
      setLoading(true);
      try {
        let q: Query = collection(firestore, RECEIPTS_COLLECTION);

        // Apply filtering based on selected branch
        if (selectedBranchId && selectedBranchId !== 'all') {
          q = query(q, where('branchId', '==', selectedBranchId));
        }

        const querySnapshot = await getDocs(q);

        const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
        const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

        const enrichedReceipts = querySnapshot.docs.map((doc) => {
          const receipt = doc.data() as Receipt;
          return {
            ...receipt,
            id: doc.id,
            lotTitle: lotsMap.get(receipt.lotId) || 'Неизвестный лот',
            branchName: branchesMap.get(receipt.branchId) || 'Неизвестный филиал',
          };
        });

        setReceipts(enrichedReceipts);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching receipts: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [firestore, authUser, selectedBranchId, lots, branches, lotsLoading, branchesLoading]);

  const combinedLoading = loading || lotsLoading || branchesLoading;

  return { data: receipts, loading: combinedLoading, error };
}

export function addReceipt(receiptData: Omit<Receipt, 'id'>) {
    const firestore = useFirestore();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const receiptsCollection = collection(firestore, RECEIPTS_COLLECTION);
    addDocumentNonBlocking(receiptsCollection, receiptData);
}

    