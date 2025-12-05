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
    // Ничего не делаем, пока идет любая загрузка.
    if (isUserLoading) {
      return;
    }

    // После завершения загрузки: если данных нет или в них нет роли администратора,
    // тогда перенаправляем.
    if (!currentUserData || !hasAdminRole(currentUserData.roles)) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // Пока идет загрузка, или если пользователь не админ (до того, как сработает useEffect),
  // показываем скелетон. Это предотвращает мелькание контента.
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

  // Если загрузка завершена и пользователь - админ, показываем таблицу.
  return <UsersTable />;
}
