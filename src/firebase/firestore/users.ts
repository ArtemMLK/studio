
'use client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '..';
import { User } from '@/lib/types';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '../non-blocking-updates';
import { USERS_COLLECTION } from '@/lib/constants';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { hasAdminRole } from '@/lib/roles';


export function useUsers() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { currentUserData, isUserLoading: isCurrentUserLoading } = useCurrentUserData();
  
  const usersCollectionQuery = useMemoFirebase(() => {
    if (!firestore || !authUser || !currentUserData) return null;

    // The 'list' operation on the users collection is only allowed for admins.
    // To prevent permission errors for other roles, we only return the query if the user is an admin.
    if (hasAdminRole(currentUserData.roles)) {
      return collection(firestore, USERS_COLLECTION);
    }
    
    // For non-admins, return null. This hook should only be used on pages/components
    // that are restricted to admins.
    return null;
  }, [firestore, authUser, currentUserData]);

  const { data, isLoading, error } = useCollection<User>(usersCollectionQuery);
  
  // If the user is not an admin, we are not fetching data, so we should return an empty array and false for loading.
  const isAdmin = currentUserData ? hasAdminRole(currentUserData.roles) : false;
  const finalIsLoading = isAdmin ? (isCurrentUserLoading || isLoading) : false;
  const finalData = isAdmin ? data : [];

  return { data: finalData || [], isLoading: finalIsLoading, error };
}

// Note: The 'id' is the Firebase Auth UID.
export async function addUser(firestore: Firestore, user: Omit<User, 'id'>, id: string) {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  const userDocRef = doc(firestore, USERS_COLLECTION, id);
  
  try {
    await setDoc(userDocRef, user);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'create',
        requestResourceData: user,
      })
    );
    throw error;
  }
}



export function updateUser(firestore: Firestore, userId: string, data: Partial<User>) {
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const userDocRef = doc(firestore, USERS_COLLECTION, userId);
    updateDocumentNonBlocking(userDocRef, data);
}

// This function needs to be improved to handle auth deletion as well.
// For now, it just deletes the Firestore document.
export async function deleteUser(firestore: Firestore, userId: string) {
    if (!firestore) {
        throw new Error('Firestore is not initialized');
    }
    const userDocRef = doc(firestore, USERS_COLLECTION, userId);
    
    // We will await this because we want to show feedback to the user
    // In a real app, you would also need to delete the user from Firebase Auth
    // which is a backend operation.
    try {
        await deleteDoc(userDocRef);
    } catch (error) {
        console.error("Error deleting user document:", error);
        // We can optionally re-throw or handle it specifically for the UI
        throw error;
    }
}
