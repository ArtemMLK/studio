'use client';
import {
  collection,
  doc,
  query,
  getDocs,
  getDoc,
  onSnapshot,
  Query,
  Firestore,
} from 'firebase/firestore';
import { useFirestore } from '..';
import { ProcurementProcess, Branch } from '@/lib/types';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '../non-blocking-updates';
import {
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { useBranches } from './branches';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';

export function useProcurementProcesses() {
  const firestore = useFirestore();
  const { currentUserData, isUserLoading } = useCurrentUserData();
  const { data: accessibleBranches, loading: branchesLoading } = useBranches(true);
  const { selectedBranchId } = useBranchSelection();

  const [procurements, setProcurements] = useState<ProcurementProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queries = useMemo(() => {
    if (isUserLoading || branchesLoading || !accessibleBranches || !firestore) {
      return null;
    }

    let targetBranchIds: string[] = [];
    if (selectedBranchId && selectedBranchId !== 'all') {
      // Ensure the selected branch is one the user can access
      if (accessibleBranches.some(b => b.id === selectedBranchId)) {
        targetBranchIds = [selectedBranchId];
      }
    } else {
      // If "all" is selected, use all branches the user has access to
      targetBranchIds = accessibleBranches.map(b => b.id);
    }
    
    if (targetBranchIds.length === 0) return [];

     console.log('useProcurementProcesses Queries for branchIds:', targetBranchIds);

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
  }, [firestore, isUserLoading, branchesLoading, accessibleBranches, selectedBranchId]);

  useEffect(() => {
    if (queries === null) {
      setLoading(true);
      return;
    }
    if (queries.length === 0) {
      setProcurements([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    let activeListeners = queries.length;
    let allProcurements: Record<string, ProcurementProcess> = {};

    const unsubscribers = queries.map((q) => {
        const branchId = q.parent.parent!.id;
        return onSnapshot(q, (snapshot) => {
            const branchName = accessibleBranches?.find(b => b.id === branchId)?.name || 'Неизвестно';

            snapshot.docChanges().forEach(change => {
              if (change.type === "removed") {
                delete allProcurements[change.doc.id];
              } else {
                allProcurements[change.doc.id] = {
                  ...(change.doc.data() as ProcurementProcess),
                  id: change.doc.id,
                  branchName: branchName,
                };
              }
            });
            
            setProcurements(Object.values(allProcurements));

            // A simple way to manage loading state across multiple listeners
            if (activeListeners > 0) {
              activeListeners--;
              if (activeListeners === 0) {
                setLoading(false);
              }
            }
        }, (err) => {
            console.error(`Error fetching procurements for branch ${branchId}:`, err);
            setError(err); 
            setLoading(false);
        });
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };

  }, [queries, accessibleBranches]);

  return { data: procurements, loading: loading, error };
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
                        break; 
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
  firestore: Firestore,
  branchId: string,
  procurement: Omit<ProcurementProcess, 'id'>
) {
  const procCollection = collection(
    firestore,
    BRANCHES_COLLECTION,
    branchId,
    PROCUREMENT_PROCESSES_COLLECTION
  );
  await addDocumentNonBlocking(procCollection, procurement);
}


export function updateProcurementProcess(
  firestore: Firestore,
  branchId: string,
  procurementId: string,
  data: Partial<Omit<ProcurementProcess, 'id'>>
) {
  const procDocRef = doc(
    firestore,
    BRANCHES_COLLECTION,
    branchId,
    PROCUREMENT_PROCESSES_COLLECTION,
    procurementId
  );
  updateDocumentNonBlocking(procDocRef, data);
}
