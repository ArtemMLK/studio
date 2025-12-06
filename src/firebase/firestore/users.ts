'use client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
  onSnapshot,
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

/**
 * Adds a new user to Firestore with error handling and rollback support.
 * Note: The 'id' is the Firebase Auth UID.
 * 
 * @param firestore - Firestore instance
 * @param user - User data (without _id field)
 * @param id - Firebase Auth UID
 * @throws {Error} If Firestore is not initialized or document creation fails
 */
export async function addUser(
  firestore: Firestore,
  user: Omit<User, '_id'>,
  id: string
): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  const userDocRef = doc(firestore, USERS_COLLECTION, id);
  
  try {
    await setDoc(userDocRef, user);
  } catch (error) {
    // Emit permission error for UI feedback
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'create',
        requestResourceData: user,
      })
    );
    
    // Rollback: attempt to delete the document if it was partially created
    try {
      await deleteDoc(userDocRef);
    } catch (rollbackError) {
      console.error('Rollback failed - could not delete partially created user:', rollbackError);
    }
    
    // Re-throw the original error for caller to handle
    throw error;
  }
}

/**
 * Updates an existing user document in Firestore.
 * Uses non-blocking updates to avoid blocking the UI.
 * 
 * @param firestore - Firestore instance
 * @param userId - Firebase Auth UID
 * @param data - Partial user data to update
 */
export function updateUser(
  firestore: Firestore,
  userId: string,
  data: Partial<User>
): void {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }
  
  const userDocRef = doc(firestore, USERS_COLLECTION, userId);
  updateDocumentNonBlocking(userDocRef, data);
}

/**
 * Deletes a user document from Firestore.
 * 
 * Note: This function only deletes the Firestore document.
 * In a real application, you should also delete the user from Firebase Auth,
 * which requires a backend operation for security reasons.
 * 
 * @param firestore - Firestore instance
 * @param userId - Firebase Auth UID
 * @throws {Error} If Firestore is not initialized or deletion fails
 */
export async function deleteUser(firestore: Firestore, userId: string): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  const userDocRef = doc(firestore, USERS_COLLECTION, userId);
  
  // We await this because we want to show feedback to the user
  // In a real app, you would also need to delete the user from Firebase Auth
  // which is a backend operation.
  try {
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error('Error deleting user document:', error);
    throw error;
  }
}

/**
 * Sets up a real-time listener for user document changes.
 * 
 * @param firestore - Firestore instance
 * @param userId - Firebase Auth UID
 * @param callback - Function called when user data changes
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToUser(
  firestore: Firestore,
  userId: string,
  callback: (user: User | null) => void
): () => void {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  const userDocRef = doc(firestore, USERS_COLLECTION, userId);
  
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as User);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to user:', error);
    errorEmitter.emit('subscription-error', error);
  });
}
