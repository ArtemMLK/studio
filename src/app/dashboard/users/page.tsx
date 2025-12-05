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
    // Не делать ничего, пока идет загрузка
    if (isUserLoading) {
      return;
    }

    // После завершения загрузки проверяем права
    const isAdmin = hasAdminRole(currentUserData?.roles);

    if (!isAdmin) {
      console.log('Redirecting...', {
        isUserLoading,
        isAdmin,
        currentUserData,
      });
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // Пока идет загрузка, показываем скелетон.
  // Это также предотвращает мигание контента для не-админов перед редиректом.
  if (isUserLoading) {
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
  // Если не админ, useEffect уже запустил редирект, и здесь будет null,
  // что предотвратит рендер таблицы для обычного пользователя.
  if (hasAdminRole(currentUserData?.roles)) {
    return <UsersTable />;
  }

  // Для не-админов, пока происходит редирект, ничего не показываем
  return null;
}
