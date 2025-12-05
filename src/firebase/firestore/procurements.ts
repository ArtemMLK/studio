
'use client';
import {
  collection,
  doc,
  query,
  getDocs,
  getDoc,
  onSnapshot,
  Query,
} from 'firebase/firestore';
import { useFirestore } from '..';
import { ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import {
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState, useMemo } from 'react';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { useBranches } from './branches';


export function useProcurementProcesses(selectedBranchId?: string | null) {
  const firestore = useFirestore();
  const { currentUserData, isUserLoading } = useCurrentUserData();
  // Используем хук useBranches, который уже учитывает права доступа.
  // Это гарантирует, что мы получим только те филиалы, которые можем видеть.
  const { data: accessibleBranches, loading: branchesLoading } = useBranches();

  const [procurements, setProcurements] = useState<ProcurementProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queries = useMemo(() => {
    if (!firestore || !currentUserData || !accessibleBranches) return null;

    let targetBranchIds: string[] = [];

    // Фильтруем доступные филиалы по `selectedBranchId`
    if (selectedBranchId && selectedBranchId !== 'all') {
      if (accessibleBranches.some(b => b.id === selectedBranchId)) {
        targetBranchIds = [selectedBranchId];
      }
    } else {
      targetBranchIds = accessibleBranches.map(b => b.id);
    }
    
    if (targetBranchIds.length === 0) return [];

    console.log('useProcurementProcesses Queries for branchIds:', targetBranchIds);

    // Создаем отдельные запросы для каждой подколлекции
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
  }, [firestore, currentUserData, accessibleBranches, selectedBranchId]);

  useEffect(() => {
    if (isUserLoading || branchesLoading) {
      setLoading(true);
      return;
    }
    if (queries === null) {
      // Еще не готовы данные для запроса
      setLoading(true);
      return;
    }
    if (queries.length === 0) {
      // Пользователю не доступен ни один филиал
      setProcurements([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Используем onSnapshot для каждого запроса, чтобы получать обновления в реальном времени
    const unsubscribers = queries.map((q, index) => {
        return onSnapshot(q, (snapshot) => {
            const branchId = q.parent.parent!.id;
            const branchName = accessibleBranches?.find(b => b.id === branchId)?.name || 'Неизвестно';

            const procsFromThisBranch = snapshot.docs.map(doc => ({
                ...(doc.data() as ProcurementProcess),
                id: doc.id,
                branchName: branchName,
            }));
            
            // Обновляем общий стейт
            setProcurements(currentProcs => {
                // Удаляем старые данные по этому филиалу и добавляем новые
                const otherProcs = currentProcs.filter(p => p.branchId !== branchId);
                return [...otherProcs, ...procsFromThisBranch];
            });

            // Consider loading finished only when all initial snapshots are received
            // This logic is simplified; a more robust solution might use Promise.all
            setLoading(false);
        }, (err) => {
            console.error(`Error fetching procurements for branch ${q.parent.parent!.id}:`, err);
            setError(err); // Устанавливаем ошибку
            setLoading(false);
        });
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };

  }, [queries, isUserLoading, branchesLoading, accessibleBranches]);

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
