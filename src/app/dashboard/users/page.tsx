import { ClientOnly } from '@/components/client-only';
import { UsersTable } from '@/components/users-table';

export default function UsersPage() {
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
