'use client';
import { collection, query, where, getDocs, Query, addDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Allocation, Application, User, Lot, Branch } from '@/lib/types';
import {
  ALLOCATIONS_COLLECTION,
  APPLICATIONS_COLLECTION,
  USERS_COLLECTION,
  LOTS_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { useApplications } from './applications';
import { useUsers } from './users';
import { useLots } from './lots';
import { useBranches } from './branches';


// Main hook to get allocations, enriched with related data
export function useAllocations() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { selectedBranchId } = useBranchSelection();

  // Fetch all necessary data for enrichment
  const { data: applications, loading: applicationsLoading } = useApplications();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: lots, loading: lotsLoading } = useLots();
  const { data: branches, loading: branchesLoading } = useBranches(true);

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !authUser) {
      if (!authUser && !loading) setLoading(false);
      return;
    }

    // Wait until all enrichment data is loaded
    if (applicationsLoading || usersLoading || lotsLoading || branchesLoading) {
      return;
    }

    const fetchAllocations = async () => {
      setLoading(true);
      try {
        let q: Query = collection(firestore, ALLOCATIONS_COLLECTION);

        if (selectedBranchId && selectedBranchId !== 'all') {
          q = query(q, where('branchId', '==', selectedBranchId));
        }

        const querySnapshot = await getDocs(q);

        const appsMap = new Map(applications.map((a) => [a.id, a]));
        const usersMap = new Map(users.map((u) => [u.id, `${u.surname} ${u.name}`]));
        const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
        const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

        const enrichedAllocs = querySnapshot.docs.map((doc) => {
          const alloc = doc.data() as Allocation;
          const app = appsMap.get(alloc.applicationId);
          
          return {
            ...alloc,
            id: doc.id,
            userName: app ? usersMap.get(app.userId) || 'Неизвестно' : 'Неизвестно',
            lotTitle: app ? lotsMap.get(app.lotId) || 'Неизвестно' : 'Неизвестно',
            branchName: app ? branchesMap.get(app.branchId) || 'Неизвестно' : 'Неизвестно',
          };
        });

        setAllocations(enrichedAllocs);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching allocations: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, [firestore, authUser, selectedBranchId, applications, users, lots, branches, applicationsLoading, usersLoading, lotsLoading, branchesLoading]);

  const combinedLoading = loading || applicationsLoading || usersLoading || lotsLoading || branchesLoading;

  return { data: allocations, loading: combinedLoading, error };
}

export function addAllocation(allocationData: Omit<Allocation, 'id'>) {
    const firestore = useFirestore();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const allocationsCollection = collection(firestore, ALLOCATIONS_COLLECTION);
    addDocumentNonBlocking(allocationsCollection, allocationData);
}

export function useAcceptedApplications() {
    const { data: applications, loading, error } = useApplications();
    const acceptedApps = applications?.filter(app => app.status === 'Принята') || [];
    return { data: acceptedApps, loading, error };
}
