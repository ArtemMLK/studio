'use client';
import { collection, query, where, getDocs, Query, addDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '..';
import { Application, Lot, User } from '@/lib/types';
import {
  APPLICATIONS_COLLECTION,
  LOTS_COLLECTION,
  USERS_COLLECTION,
} from '@/lib/constants';
import { useCollection } from './use-collection.tsx';
import { useEffect, useState } from 'react';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useBranches } from './branches';
import { useUsers } from './users';
import { useLots } from './lots';
import { addDocumentNonBlocking } from '../non-blocking-updates';

// Main hook to get applications, enriched with related data
export function useApplications() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { selectedBranchId } = useBranchSelection();

  // Fetch all necessary data for enrichment
  const { data: users } = useUsers();
  const { data: lots } = useLots();
  const { data: branches } = useBranches(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !authUser || !users || !lots || !branches) {
        if (!authUser) setLoading(false); // Only stop loading if auth is resolved and user is null
        return;
    };


    const fetchApplications = async () => {
      setLoading(true);
      try {
        let q: Query = collection(firestore, APPLICATIONS_COLLECTION);

        // Apply filtering based on selected branch
        if (selectedBranchId && selectedBranchId !== 'all') {
          q = query(q, where('branchId', '==', selectedBranchId));
        }

        const querySnapshot = await getDocs(q);

        const usersMap = new Map(users.map((u) => [u.id, `${u.surname} ${u.name}`]));
        const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
        const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

        const enrichedApps = querySnapshot.docs.map((doc) => {
          const app = doc.data() as Application;
          return {
            ...app,
            id: doc.id,
            userName: usersMap.get(app.userId) || 'Неизвестный пользователь',
            lotTitle: lotsMap.get(app.lotId) || 'Неизвестный лот',
            branchName: branchesMap.get(app.branchId) || 'Неизвестный филиал',
          };
        });

        setApplications(enrichedApps);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [firestore, authUser, selectedBranchId, users, lots, branches]);

  return { data: applications, loading, error };
}

export async function addApplication(applicationData: Pick<Application, 'lotId' | 'userId' | 'branchId' | 'procurementId'>) {
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

    await addDocumentNonBlocking(applicationsCollection, newApplication);
}
