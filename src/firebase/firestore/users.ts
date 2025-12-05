
'use client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { User } from '@/lib/types';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '../non-blocking-updates';
import { USERS_COLLECTION } from '@/lib/constants';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useUsers() {
  const firestore = useFirestore();
  const { user } = useUser(); // Get the authenticated user
  
  const usersCollection = useMemoFirebase(() => {
    // Only return the collection if the user is authenticated and has loaded
    if (!firestore || !user) return null;
    return collection(firestore, USERS_COLLECTION);
  }, [firestore, user]);

  const { data, isLoading, error } = useCollection<User>(usersCollection);

  // The hook's loading state should reflect the auth state as well.
  // It's loading if we are waiting for the user OR if we are waiting for firestore data.
  return { data: data || [], isLoading: !user || isLoading, error };
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

// This function needs to be improved to handle auth deletion as well.
// For now, it just deletes the Firestore document.
export async function deleteUser(userId: string) {
    const firestore = useFirestore();
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const userDocRef = doc(firestore, USERS_COLLECTION, userId);
    
    // We will await this because we want to show feedback to the user
    // In a real app, you would also need to delete the user from Firebase Auth
    // which is a backend operation.
    await deleteDoc(userDocRef);
}
