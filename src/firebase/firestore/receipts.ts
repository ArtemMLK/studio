'use client';
import {
  collection,
  query,
  where,
  Query,
  onSnapshot,
} from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Receipt } from '@/lib/types';
import { RECEIPTS_COLLECTION } from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useLots } from './lots';
import { useBranches } from './branches';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { useCurrentUserData } from '@/hooks/use-current-user-data';

// Main hook to get receipts, filtered by security rules
export function useReceipts() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } = useCurrentUserData();
  const { selectedBranchId } = useBranchSelection();

  // Fetch enrichment data safely
  const { data: lots, loading: lotsLoading } = useLots(); // This now correctly filters lots
  const { data: branches, loading: branchesLoading } = useBranches(); // This now correctly filters branches

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [enrichedReceipts, setEnrichedReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const receiptsQuery = useMemo(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    let q: Query | null = collection(firestore, RECEIPTS_COLLECTION);
    const userRoles = currentUserData.roles || [];
    const userBranchIds = currentUserData.branchIds || [];

    // Build query based on user role and branch selection
    if (!userRoles.includes('Администратор')) {
      if (userBranchIds.length === 0) return null; // No access if no branches
      const accessibleBranches = selectedBranchId && selectedBranchId !== 'all'
        ? (userBranchIds.includes(selectedBranchId) ? [selectedBranchId] : [])
        : userBranchIds;

      if (accessibleBranches.length === 0) return null;
      q = query(q, where('branchId', 'in', accessibleBranches));
    } else {
      // Admin can filter by any branch
      if (selectedBranchId && selectedBranchId !== 'all') {
        q = query(q, where('branchId', '==', selectedBranchId));
      }
    }
    return q;
  }, [firestore, authUser, currentUserData, selectedBranchId]);

  // Effect to fetch raw receipts
  useEffect(() => {
    if (isCurrentUserDataLoading) {
      setLoading(true);
      return;
    }
    if (!receiptsQuery) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(receiptsQuery,
      (snapshot) => {
        const rcp = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receipt));
        setReceipts(rcp);
        setError(null);
        // We set loading false only after enrichment
      },
      (err) => {
        console.error('Error fetching receipts:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [receiptsQuery, isCurrentUserDataLoading]);

  // Effect for enriching receipts
  useEffect(() => {
    if (lotsLoading || branchesLoading || loading) {
        // If still fetching main data, don't enrich yet.
        return;
    }

    if (!receipts || !lots || !branches) {
        setEnrichedReceipts([]);
        setLoading(false);
        return;
    }

    const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
    const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

    const finalReceipts = receipts.map((receipt) => ({
      ...receipt,
      lotTitle: lotsMap.get(receipt.lotId) || 'Неизвестный лот',
      branchName: branchesMap.get(receipt.branchId) || 'Неизвестный филиал',
    }));

    setEnrichedReceipts(finalReceipts);
    setLoading(false); // Final loading state
  }, [receipts, lots, branches, loading, lotsLoading, branchesLoading]);

  const combinedLoading = loading || isCurrentUserDataLoading || lotsLoading || branchesLoading;

  return { data: enrichedReceipts, loading: combinedLoading, error };
}

export function addReceipt(receiptData: Omit<Receipt, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const receiptsCollection = collection(firestore, RECEIPTS_COLLECTION);
  addDocumentNonBlocking(receiptsCollection, receiptData);
}
