'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { hasAdminRole } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const router = useRouter();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  useEffect(() => {
    console.log('UsersPage auth state:', {
      isUserLoading,
      currentUserData,
      roles: currentUserData?.roles,
    });

    if (isUserLoading) {
      console.log('Still loading user data...');
      return;
    }
    if (!currentUserData) {
      console.log('No current user data found, redirecting...');
      router.replace('/dashboard'); // Redirect if no user data after loading
      return;
    }

    const isAdmin = hasAdminRole(currentUserData.roles);
    console.log('isAdmin check result:', isAdmin);

    if (!isAdmin) {
      console.log('User is not admin, redirecting...');
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  if (isUserLoading || !currentUserData) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-72 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const isAdmin = hasAdminRole(currentUserData.roles);

  if (!isAdmin) {
    // This state is temporary before the useEffect triggers the redirect.
    // Returning null is fine to prevent a flash of content.
    return null;
  }

  // If we reach here, the user is an admin and loading is complete.
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Страница пользователей (админ)</h1>
      <p className="mt-2">Проверка прав прошла успешно.</p>
      {/* Здесь будет UsersTable, когда мы убедимся, что редирект исправлен */}
    </div>
  );
}
