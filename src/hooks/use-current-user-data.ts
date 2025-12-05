'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { USERS_COLLECTION } from '@/lib/constants';
import type { User } from '@/lib/types';

interface UseCurrentUserDataResult {
  currentUserData: User | null;
  isUserLoading: boolean;
}

/**
 * A hook to get the full Firestore document of the currently authenticated user.
 * It efficiently fetches ONLY the current user's document.
 * @returns An object containing the current user's full data and a loading state.
 */
export function useCurrentUserData(): UseCurrentUserDataResult {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, USERS_COLLECTION, authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUserData, isLoading: isDocLoading } = useDoc<User>(userDocRef);

  // The overall loading state is true if either the auth state or the user document is loading.
  const isUserLoading = isAuthLoading || isDocLoading;

  return { currentUserData, isUserLoading };
}
