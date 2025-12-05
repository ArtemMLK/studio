import { ClientOnly } from '@/components/client-only';
import { UsersTable } from '@/components/users-table';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/types';

const hasAdminRole = (roles: UserRole | UserRole[] | undefined): boolean => {
    if (!roles) return false;
    if (Array.isArray(roles)) {
        return roles.includes('Администратор');
    }
    return roles === 'Администратор';
}


export default function UsersPage() {
  const { currentUserData, isUserLoading } = useCurrentUserData();

  if (isUserLoading) {
    // You can return a loading skeleton here if you want
    return null;
  }

  // If user is not an admin, redirect them away
  if (!hasAdminRole(currentUserData?.roles)) {
    redirect('/dashboard');
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">
            Управление пользователями системы.
          </p>
        </div>
      </div>
      <ClientOnly>
        <UsersTable />
      </ClientOnly>
    </>
  );
}
