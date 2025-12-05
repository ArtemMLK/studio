'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { hasAdminRole } from '@/lib/roles';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersTable } from '@/components/users-table';

export default function UsersPage() {
  const router = useRouter();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  useEffect(() => {
    // We don't want to do anything until the user's auth state and data are fully resolved.
    if (isUserLoading) {
      return;
    }

    // After loading, if there's no user data at all, or if the user is not an admin, redirect.
    // This is the final, definitive check.
    if (!currentUserData || !hasAdminRole(currentUserData.roles)) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // While loading, or if the user is not an admin (before the redirect happens), show a skeleton.
  // This prevents flashing content for non-admins.
  if (isUserLoading || !currentUserData || !hasAdminRole(currentUserData.roles)) {
    return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </>
    );
  }

  // If loading is complete and the user is an admin, show the full users table.
  return <UsersTable />;
}
