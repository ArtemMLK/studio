'use client';
import { collection, query, where, Query } from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { Application, ApplicationStatus } from '@/lib/types';
import {
  APPLICATIONS_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { doc } from 'firebase/firestore';

// Main hook to get applications, filtered according to security rules
export function useApplications() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserDataLoading } = useCurrentUserData();
  const { selectedBranchId } = useBranchSelection();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const applicationsQuery = useMemo(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    let q: Query | null = collection(firestore, APPLICATIONS_COLLECTION);

    const userRoles = currentUserData?.roles || [];
    const userBranchIds = currentUserData?.branchIds || [];

    const whereClauses: any[] = [];

    // Security-rule-aligned querying
    if (userRoles.includes('Участник') && !userRoles.includes('Администратор') && !userRoles.includes('Менеджер')) {
        // Participant sees only their own applications
        whereClauses.push(where('userId', '==', authUser.uid));
    } else if (userRoles.includes('Менеджер') && !userRoles.includes('Администратор')) {
        // Manager sees applications from their branches
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
        // Admin can filter by branch, or see all
        if (selectedBranchId && selectedBranchId !== 'all') {
            whereClauses.push(where('branchId', '==', selectedBranchId));
        }
    } else {
        q = null; // No roles match, should see nothing
    }

    if (q && whereClauses.length > 0) {
        q = query(q, ...whereClauses);
    }
    
    console.log('applications query', {
      collection: APPLICATIONS_COLLECTION,
      filters: whereClauses.map(w => ({
        field: w['_f'],
        op: w['_op'],
        value: w['_v'],
      })),
    });

    return q;
  }, [firestore, authUser, currentUserData, selectedBranchId]);


  // Effect for fetching the data based on the constructed query
  useEffect(() => {
      if (isCurrentUserDataLoading) {
          setLoading(true);
          return;
      }

      if (!applicationsQuery) {
          setApplications([]);
          setLoading(false);
          return;
      }

      const unsubscribe = onSnapshot(applicationsQuery, 
          (snapshot) => {
              const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
              setApplications(apps);
              setLoading(false);
              setError(null);
          },
          (err) => {
              console.error("Error fetching applications: ", err);
              setError(err);
              setLoading(false);
          }
      );

      return () => unsubscribe();
  }, [applicationsQuery, isCurrentUserDataLoading]);


  const combinedLoading = loading || isCurrentUserDataLoading;

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
