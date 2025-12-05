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
    // Wait until loading is complete before checking roles
    if (isUserLoading) {
      return;
    }

    // If loading is done and there's still no user data or the user is not an admin, redirect.
    if (!currentUserData || !hasAdminRole(currentUserData.roles)) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // Show a loading state while we verify the user's role
  if (isUserLoading || !currentUserData || !hasAdminRole(currentUserData.roles)) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="h-[500px] w-full mt-6" />
      </div>
    );
  }

  // If we reach here, the user is a verified admin.
  return <UsersTable />;
}
