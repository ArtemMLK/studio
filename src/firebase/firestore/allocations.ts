'use client';
import { collection, query, where, getDocs, Query } from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Allocation } from '@/lib/types';
import {
  ALLOCATIONS_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import { useApplications } from './applications';
import { useUsers } from './users';
import { useLots } from './lots';
import { useBranches } from './branches';
import { useCurrentUserData } from '@/hooks/use-current-user-data';


// Main hook to get allocations, enriched with related data
export function useAllocations() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } = useCurrentUserData();
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
    if (!firestore || !authUser || isCurrentUserDataLoading) {
      if (!isCurrentUserDataLoading && !loading) setLoading(false);
      return;
    }

    if (applicationsLoading || usersLoading || lotsLoading || branchesLoading) {
      return;
    }

    const fetchAllocations = async () => {
      setLoading(true);
      try {
        let q: Query | null = collection(firestore, ALLOCATIONS_COLLECTION);
        const userRoles = currentUserData?.roles || [];
        const userBranchIds = currentUserData?.branchIds || [];

        if (userRoles.includes('Менеджер') && !userRoles.includes('Администратор')) {
            // Manager sees allocations from their branches
             if (selectedBranchId && selectedBranchId !== 'all') {
                if (userBranchIds.includes(selectedBranchId)) {
                    q = query(q, where('branchId', '==', selectedBranchId));
                } else {
                    q = null; // Manager selected a branch they don't have access to
                }
            } else {
                 if (userBranchIds.length > 0) {
                    q = query(q, where('branchId', 'in', userBranchIds));
                 } else {
                    q = null; // Manager has no branches assigned
                 }
            }
        } else if (userRoles.includes('Администратор')) {
            // Admin can filter by branch
            if (selectedBranchId && selectedBranchId !== 'all') {
                q = query(q, where('branchId', '==', selectedBranchId));
            }
        } else {
             // Participants shouldn't see allocations directly, this will result in an empty query
            q = null;
        }

        let enrichedAllocs: Allocation[] = [];
        if (q) {
            const querySnapshot = await getDocs(q);

            const appsMap = new Map(applications.map((a) => [a.id, a]));
            const usersMap = new Map(users.map((u) => [u.id, `${u.surname} ${u.name}`]));
            const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
            const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

            enrichedAllocs = querySnapshot.docs.map((doc) => {
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
        }
        setAllocations(enrichedAllocs);
      } catch (err: any) => {
        setError(err);
        console.error("Error fetching allocations: ", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserData) {
        fetchAllocations();
    }
  }, [firestore, authUser, currentUserData, isCurrentUserDataLoading, selectedBranchId, applications, users, lots, branches, applicationsLoading, usersLoading, lotsLoading, branchesLoading]);

  const combinedLoading = loading || isCurrentUserDataLoading || applicationsLoading || usersLoading || lotsLoading || branchesLoading;

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
    // Also filter out applications that have already been allocated
    const { data: allocations } = useAllocations();
    const allocatedApplicationIds = allocations?.map(a => a.applicationId) || [];
    
    const acceptedApps = applications?.filter(app => app.status === 'Принята' && !allocatedApplicationIds.includes(app.id)) || [];
    
    return { data: acceptedApps, loading, error };
}
