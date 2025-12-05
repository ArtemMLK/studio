'use client';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  collectionGroup,
  getDoc,
} from 'firebase/firestore';
import { useFirestore, useUser } from '..';
import { ProcurementProcess, Branch } from '@/lib/types';
import { addDocumentNonBlocking } from '../non-blocking-updates';
import {
  PROCUREMENT_PROCESSES_COLLECTION,
  BRANCHES_COLLECTION,
} from '@/lib/constants';
import { useEffect, useState } from 'react';

// Main hook to get all procurement processes across all branches
export function useProcurementProcesses(branchId?: string | null) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [procurements, setProcurements] = useState<ProcurementProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !user) {
      setLoading(false);
      return;
    }

    const fetchProcurements = async () => {
      setLoading(true);
      try {
        const branchesSnapshot = await getDocs(
          collection(firestore, BRANCHES_COLLECTION)
        );
        const branches = branchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[];
        const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

        const q =
          branchId && branchId !== 'all'
            ? query(
                collection(
                  firestore,
                  BRANCHES_COLLECTION,
                  branchId,
                  PROCUREMENT_PROCESSES_COLLECTION
                )
              )
            : collectionGroup(firestore, PROCUREMENT_PROCESSES_COLLECTION);

        const querySnapshot = await getDocs(q);

        const procs = querySnapshot.docs.map((doc) => {
          const data = doc.data() as ProcurementProcess;
          const branchName = branchesMap.get(data.branchId) || 'Неизвестно';
          return {
            ...data,
            id: doc.id,
            branchName,
          };
        });

        setProcurements(procs);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcurements();
  }, [firestore, user, branchId]);

  return { data: procurements, loading, error };
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
                // First, query the collection group to find the document by ID.
                const groupQuery = query(collectionGroup(firestore, PROCUREMENT_PROCESSES_COLLECTION), where('__name__', '==', procurementId));
                const querySnapshot = await getDocs(groupQuery);
                
                if (querySnapshot.empty) {
                    throw new Error(`Procurement with ID ${procurementId} not found across branches.`);
                }
                
                const procDoc = querySnapshot.docs[0];
                const procData = procDoc.data() as ProcurementProcess;

                // Now get the branch name
                let branchName = 'Неизвестно';
                if (procData.branchId) {
                    const branchDocRef = doc(firestore, BRANCHES_COLLECTION, procData.branchId);
                    const branchDoc = await getDoc(branchDocRef);
                    if (branchDoc.exists()) {
                        branchName = (branchDoc.data() as Branch).name;
                    }
                }
                
                setProcurement({
                    ...procData,
                    id: procDoc.id,
                    branchName,
                });
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
