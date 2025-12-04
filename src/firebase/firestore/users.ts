
'use client';
import {
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { User } from '@/lib/types';
import { updateDocumentNonBlocking } from '../non-blocking-updates';
import { USERS_COLLECTION } from '@/lib/constants';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useUsers() {
  const firestore = useFirestore();
  const { user } = useUser(); // Get the authenticated user
  
  const usersCollection = useMemoFirebase(() => {
    // Only return the collection if the user is authenticated
    if (!firestore || !user) return null;
    return collection(firestore, USERS_COLLECTION);
  }, [firestore, user]);

  const { data, isLoading, error } = useCollection<User>(usersCollection);

  // The hook's loading state should reflect the auth state as well.
  // It's loading if we are waiting for the user OR if we are waiting for firestore data.
  return { data: data, isLoading: !user || isLoading, error };
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
