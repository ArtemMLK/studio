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
    // 1. We do nothing while the user data is loading.
    if (isUserLoading) {
      return;
    }
    
    // 2. After loading, if there's no data or the user is not an admin,
    // we perform a redirect.
    const isAdmin = hasAdminRole(currentUserData?.roles);
    if (!isAdmin) {
       console.log("Redirecting: User is not an admin after loading has finished.");
       router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // While loading, or if the user is not an admin (before useEffect kicks in),
  // show a skeleton. This prevents content flickering.
  const isAdmin = currentUserData ? hasAdminRole(currentUserData.roles) : false;
  if (isUserLoading || !isAdmin) {
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

  // 3. If loading is complete and the user is an admin, show the table.
  return <UsersTable />;
}
