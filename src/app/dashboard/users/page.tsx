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

    // После завершения загрузки, если данных все еще нет, это может быть ошибкой
    // или пользователь вышел. В любом случае, у него нет доступа.
    if (!currentUserData) {
        console.log('Redirecting because currentUserData is missing after load.', { isUserLoading, currentUserData });
        router.replace('/dashboard');
        return;
    }

    // Теперь, когда мы уверены, что данные есть, проверяем роль
    const isAdmin = hasAdminRole(currentUserData.roles);
    if (!isAdmin) {
      console.log('Redirecting because user is not an admin.', {
        isUserLoading,
        isAdmin,
        roles: currentUserData.roles,
      });
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUserData, router]);

  // Пока идет загрузка, показываем скелетон.
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
  // Если не админ, useEffect уже запустил редирект, и здесь будет null
  // (или пустой div), что предотвратит рендер таблицы для обычного пользователя.
  if (currentUserData && hasAdminRole(currentUserData.roles)) {
    return <UsersTable />;
  }

  // Для не-админов, пока происходит редирект, или если данные не загрузились,
  // показываем состояние загрузки или ничего не показываем, чтобы избежать "мигания".
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
