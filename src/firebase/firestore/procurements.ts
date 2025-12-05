
'use client';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  collectionGroup,
  getDoc,
  onSnapshot,
  Query,
} from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import {
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useCurrentUserData } from '@/hooks/use-current-user-data';


export function useProcurementProcesses(selectedBranchId?: string | null) {
  const firestore = useFirestore();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  const [procurements, setProcurements] = useState<ProcurementProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queries = useMemo(() => {
    if (!firestore || !currentUserData) return null;

    const userRoles = currentUserData.roles || [];
    const userBranchIds = currentUserData.branchIds || [];
    const isAdmin = userRoles.includes('Администратор');

    let targetBranchIds: string[] = [];

    if (isAdmin) {
      if (selectedBranchId && selectedBranchId !== 'all') {
        targetBranchIds = [selectedBranchId];
      } else {
        // Admin viewing all branches - this is tricky. We'll fetch all branches first.
        // A better approach would be denormalizing roles or having a different structure.
        // For now, we will rely on a separate query to get all branch IDs.
        // This part is handled outside and we assume we get all branches if isAdmin.
        // Let's rely on selectedBranchId for now.
        if (!selectedBranchId || selectedBranchId === 'all') {
            return 'all'; // Special flag for admin to fetch all
        }
        targetBranchIds = [selectedBranchId];
      }
    } else { // Manager, Analyst, etc.
      if (selectedBranchId && selectedBranchId !== 'all') {
        if (userBranchIds.includes(selectedBranchId)) {
          targetBranchIds = [selectedBranchId];
        } else {
          return []; // Empty array means no queries to run
        }
      } else {
        targetBranchIds = userBranchIds;
      }
    }

    if (targetBranchIds.length === 0 && !isAdmin) return [];
    if (queries === 'all') return 'all';

    return targetBranchIds.map(branchId =>
      query(
        collection(
          firestore,
          BRANCHES_COLLECTION,
          branchId,
          PROCUREMENT_PROCESSES_COLLECTION
        )
      )
    );
  }, [firestore, currentUserData, selectedBranchId]);

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }
    if (queries === null) {
      setProcurements([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const fetchData = async () => {
        if (!firestore) return;
        try {
            const branchesSnapshot = await getDocs(collection(firestore, BRANCHES_COLLECTION));
            const branchesMap = new Map(branchesSnapshot.docs.map(doc => [doc.id, doc.data().name]));

            let finalQueries: Query[] = [];

            if(queries === 'all') {
                 finalQueries = branchesSnapshot.docs.map(branchDoc => 
                    query(collection(firestore, BRANCHES_COLLECTION, branchDoc.id, PROCUREMENT_PROCESSES_COLLECTION))
                 );
            } else if (Array.isArray(queries)) {
                finalQueries = queries;
            }


            if (finalQueries.length === 0) {
              setProcurements([]);
              setLoading(false);
              return;
            }
            
            const results = await Promise.all(finalQueries.map(q => getDocs(q)));
            
            const procs = results.flatMap(snapshot => 
                snapshot.docs.map(doc => {
                    const data = doc.data() as ProcurementProcess;
                    return {
                        ...data,
                        id: doc.id,
                        branchName: branchesMap.get(data.branchId) || 'Неизвестно',
                    };
                })
            );
            
            setProcurements(procs);
        } catch (err: any) {
            setError(err);
            console.error("Error fetching procurements:", err);
        } finally {
            setLoading(false);
        }
    };
    
    fetchData();
    
    // Note: Real-time updates with this structure would be complex (many listeners).
    // A fetch-on-demand approach is more suitable here.
    // If real-time is a must, DB structure should be revisited (e.g., top-level procurements collection).

  }, [queries, isUserLoading, firestore]);

  return { data: procurements, loading: isUserLoading || loading, error };
}


// Optimized hook to get a single procurement process
export function useProcurementProcess(procurementId?: string) {
    const firestore = useFirestore();
    const [procurement, setProcurement] = useState<ProcurementProcess | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore || !procurementId) {
            setLoading(false);
            return;
        }

        const findAndFetchProcurement = async () => {
            setLoading(true);
            try {
                // This is not efficient, but it's the only way with the current structure.
                // A better DB structure would be to have a top-level `procurements` collection.
                // We have to query all branches to find which one contains the procurement.
                const branchesSnapshot = await getDocs(collection(firestore, BRANCHES_COLLECTION));
                let foundProc: (ProcurementProcess & { branchName: string }) | null = null;

                for (const branchDoc of branchesSnapshot.docs) {
                    const procDocRef = doc(firestore, BRANCHES_COLLECTION, branchDoc.id, PROCUREMENT_PROCESSES_COLLECTION, procurementId);
                    const procDoc = await getDoc(procDocRef);
                    if (procDoc.exists()) {
                        foundProc = {
                            ...(procDoc.data() as ProcurementProcess),
                            id: procDoc.id,
                            branchName: (branchDoc.data() as Branch).name,
                        };
                        break; // Exit loop once found
                    }
                }
                
                if (foundProc) {
                    setProcurement(foundProc);
                } else {
                     setError(new Error(`Закупка с ID ${procurementId} не найдена`));
                }

            } catch (err: any) {
                console.error("Error fetching single procurement:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        findAndFetchProcurement();
    }, [firestore, procurementId]);
    
    return { data: procurement, loading, error };
}


export async function addProcurementProcess(
  branchId: string,
  procurement: Omit<ProcurementProcess, 'id'>
) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const procCollection = collection(
    firestore,
    BRANCHES_COLLECTION,
    branchId,
    PROCUREMENT_PROCESSES_COLLECTION
  );
  await addDocumentNonBlocking(procCollection, procurement);
}


export function updateProcurementProcess(
  branchId: string,
  procurementId: string,
  data: Partial<Omit<ProcurementProcess, 'id'>>
) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const procDocRef = doc(
    firestore,
    BRANCHES_COLLECTION,
    branchId,
    PROCUREMENT_PROCESSES_COLLECTION,
    procurementId
  );
  updateDocumentNonBlocking(procDocRef, data);
}
