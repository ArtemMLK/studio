'use client';
import {
  collection,
  query,
  where,
  getDocs,
  Query,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Allocation } from '@/lib/types';
import { ALLOCATIONS_COLLECTION } from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { useApplications } from './applications';
import { useCurrentUserData } from '@/hooks/use-current-user-data';

// Main hook to get allocations, filtered by security rules
export function useAllocations() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } =
    useCurrentUserData();
  const { selectedBranchId } = useBranchSelection();

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const allocationsQuery = useMemo(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    let q: Query | null = collection(firestore, ALLOCATIONS_COLLECTION);

    const userRoles = currentUserData?.roles || [];
    const userBranchIds = currentUserData?.branchIds || [];
    const whereClauses: any[] = [];

    if (userRoles.includes('Менеджер') && !userRoles.includes('Администратор')) {
      // Manager sees allocations from their branches
      if (selectedBranchId && selectedBranchId !== 'all') {
        if (userBranchIds.includes(selectedBranchId)) {
          whereClauses.push(where('branchId', '==', selectedBranchId));
        } else {
          q = null; // Manager selected a branch they don't have access to
        }
      } else {
        if (userBranchIds.length > 0) {
          whereClauses.push(where('branchId', 'in', userBranchIds));
        } else {
          q = null; // Manager has no branches assigned
        }
      }
    } else if (userRoles.includes('Администратор')) {
      // Admin can filter by branch
      if (selectedBranchId && selectedBranchId !== 'all') {
        whereClauses.push(where('branchId', '==', selectedBranchId));
      }
    } else {
      // Participants shouldn't see allocations directly, this will result in an empty query
      q = null;
    }

    if (q && whereClauses.length > 0) {
      q = query(q, ...whereClauses);
    }

      collection: ALLOCATIONS_COLLECTION,
      filters: whereClauses.map((w) => ({
        field: w['_f'],
        op: w['_op'],
        value: w['_v'],
      })),
    });

    return q;
  }, [firestore, authUser, currentUserData, selectedBranchId]);

  useEffect(() => {
    if (isCurrentUserDataLoading) {
      setLoading(true);
      return;
    }

    if (!allocationsQuery) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      allocationsQuery,
      (snapshot) => {
        const allocs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Allocation)
        );
        setAllocations(allocs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching allocations: ', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [allocationsQuery, isCurrentUserDataLoading]);

  const combinedLoading = loading || isCurrentUserDataLoading;

  return { data: allocations, loading: combinedLoading, error };
}

export function addAllocation(
  firestore: Firestore,
  allocationData: Omit<Allocation, 'id'>
) {
  const allocationsCollection = collection(firestore, ALLOCATIONS_COLLECTION);
  addDocumentNonBlocking(allocationsCollection, allocationData);
}

export function useAcceptedApplications() {
  // This hook now correctly uses the security-rule-filtered applications
  const { data: applications, loading, error } = useApplications();
  const { data: allocations } = useAllocations();

  // This part is client-side filtering, which is now safe because the base data is pre-filtered by security rules
  const allocatedApplicationIds = useMemo(
    () => new Set(allocations?.map((a) => a.applicationId) || []),
    [allocations]
  );

  const acceptedApps = useMemo(() => {
    return (
      applications?.filter(
        (app) =>
          app.status === 'Принята' && !allocatedApplicationIds.has(app.id)
      ) || []
    );
  }, [applications, allocatedApplicationIds]);

  return { data: acceptedApps, loading, error };
}
