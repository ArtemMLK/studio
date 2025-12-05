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
    console.log("UsersPage auth state:", {
      isUserLoading,
      currentUserData,
      roles: currentUserData?.roles,
    });

    // 1. Ничего не делаем, пока данные пользователя загружаются
    if (isUserLoading) {
      return;
    }
    
    const isAdmin = currentUserData ? hasAdminRole(currentUserData.roles) : false;
    console.log("isAdmin check:", isAdmin);

    // 2. Если загрузка завершена, но пользователь не админ, перенаправляем
    if (!isAdmin) {
       console.log("Redirecting: User is not an admin.");
       router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // Пока идет загрузка, или если пользователь не админ (до срабатывания useEffect),
  // показываем скелетон. Это предотвращает мелькание контента.
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

  // 3. Если загрузка завершена и пользователь - админ, показываем таблицу
  return <UsersTable />;
}
