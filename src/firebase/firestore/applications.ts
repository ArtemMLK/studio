'use client';
import { collection, query, where, getDocs, Query, addDoc, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Application, ApplicationStatus } from '@/lib/types';
import {
  APPLICATIONS_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useBranches } from './branches';
import { useUsers } from './users';
import { useLots } from './lots';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { useCurrentUserData } from '@/hooks/use-current-user-data';

// Main hook to get applications, enriched with related data
export function useApplications() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } = useCurrentUserData();
  const { selectedBranchId } = useBranchSelection();

  // Fetch all necessary data for enrichment
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: lots, loading: lotsLoading } = useLots();
  const { data: branches, loading: branchesLoading } = useBranches(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !authUser || isCurrentUserDataLoading) {
        if (!isCurrentUserDataLoading && !loading) setLoading(false);
        return;
    };

    if (usersLoading || lotsLoading || branchesLoading) {
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        let q: Query | null = collection(firestore, APPLICATIONS_COLLECTION);
        const userRoles = currentUserData?.roles || [];
        const userBranchIds = currentUserData?.branchIds || [];

        if (userRoles.includes('Участник') && !userRoles.includes('Администратор') && !userRoles.includes('Менеджер')) {
            // Participant sees only their own applications
            q = query(q, where('userId', '==', authUser.uid));
        } else if (userRoles.includes('Менеджер') && !userRoles.includes('Администратор')) {
            // Manager sees applications from their branches
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
            q = null; // No roles match, should see nothing
        }


        let enrichedApps: Application[] = [];
        if (q) {
            const querySnapshot = await getDocs(q);
            const usersMap = new Map(users.map((u) => [u.id, `${u.surname} ${u.name}`]));
            const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
            const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

            enrichedApps = querySnapshot.docs.map((doc) => {
              const app = doc.data() as Application;
              return {
                ...app,
                id: doc.id,
                userName: usersMap.get(app.userId) || 'Неизвестный пользователь',
                lotTitle: lotsMap.get(app.lotId) || 'Неизвестный лот',
                branchName: branchesMap.get(app.branchId) || 'Неизвестный филиал',
              };
            });
        }
        
        setApplications(enrichedApps);

      } catch (err: any) {
        setError(err);
        console.error("Error fetching applications: ", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserData) {
        fetchApplications();
    }
  }, [firestore, authUser, currentUserData, isCurrentUserDataLoading, selectedBranchId, users, lots, branches, usersLoading, lotsLoading, branchesLoading]);

  const combinedLoading = loading || isCurrentUserDataLoading || usersLoading || lotsLoading || branchesLoading;

  return { data: applications, loading: combinedLoading, error };
}

export function addApplication(applicationData: Pick<Application, 'lotId' | 'userId' | 'branchId' | 'procurementId'>) {
    const firestore = useFirestore();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const applicationsCollection = collection(firestore, APPLICATIONS_COLLECTION);
    
    const newApplication: Omit<Application, 'id'> = {
        ...applicationData,
        applicationDate: new Date().toISOString(),
        status: 'Новая',
    };

    addDocumentNonBlocking(applicationsCollection, newApplication);
}

export function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const firestore = useFirestore();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const appDocRef = doc(firestore, APPLICATIONS_COLLECTION, applicationId);
    updateDocumentNonBlocking(appDocRef, { status });
}
