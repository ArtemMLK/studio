'use client';
import {
  collection,
  doc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '..';
import { User } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { USERS_COLLECTION } from '@/lib/constants';

export function useUsers() {
  const firestore = useFirestore();
  
  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, USERS_COLLECTION);
  }, [firestore]);

  return useCollection<User>(usersCollection);
}

export async function addUser(user: Omit<User, 'id'>) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const usersCollection = collection(firestore, USERS_COLLECTION);
  addDocumentNonBlocking(usersCollection, user);
}

export async function updateUser(userId: string, data: Partial<User>) {
    const firestore = useFirestore();
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const userDocRef = doc(firestore, USERS_COLLECTION, userId);
    updateDocumentNonBlocking(userDocRef, data);
}
