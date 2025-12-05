'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { useUsers } from '@/firebase/firestore/users';
import type { User } from '@/lib/types';

interface UseCurrentUserDataResult {
  currentUserData: User | null;
  isUserLoading: boolean;
}

/**
 * A hook to get the full Firestore document of the currently authenticated user.
 * It combines the auth state from `useUser` and the data from `useUsers`.
 * @returns An object containing the current user's full data and a loading state.
 */
export function useCurrentUserData(): UseCurrentUserDataResult {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const { data: usersData, isLoading: isUsersLoading } = useUsers();

  const currentUserData = useMemo(() => {
    if (!authUser || !usersData) return null;
    return usersData.find(u => u.id === authUser.uid) || null;
  }, [authUser, usersData]);

  // The overall loading state is true if either the auth state or the users collection is loading.
  const isUserLoading = isAuthLoading || isUsersLoading;

  return { currentUserData, isUserLoading };
}
