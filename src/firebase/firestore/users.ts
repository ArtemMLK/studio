
'use client';
import {
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '..';
import { User } from '@/lib/types';
import { updateDocumentNonBlocking } from '../non-blocking-updates';
import { USERS_COLLECTION } from '@/lib/constants';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useUsers() {
  const firestore = useFirestore();
  
  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, USERS_COLLECTION);
  }, [firestore]);

  return useCollection<User>(usersCollection);
}

// Note: The 'id' is the Firebase Auth UID.
export function addUser(user: Omit<User, 'id'>, id: string) {
  const firestore = useFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const userDocRef = doc(firestore, USERS_COLLECTION, id);
  setDoc(userDocRef, user).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'create',
        requestResourceData: user,
      })
    );
  });
}


export function updateUser(userId: string, data: Partial<User>) {
    const firestore = useFirestore();
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const userDocRef = doc(firestore, USERS_COLLECTION, userId);
    updateDocumentNonBlocking(userDocRef, data);
}
