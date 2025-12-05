'use client';

import { ClientOnly } from '@/components/client-only';
import { UsersTable } from '@/components/users-table';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    return (
        <>
            <div className="flex items-center justify-between space-y-2">
                <div className='grid gap-1.5'>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-72" />
                </div>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Роли</TableHead>
                            <TableHead className="hidden md:table-cell">Телефон</TableHead>
                            <TableHead className="hidden md:table-cell">
                            Филиалы
                            </TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>
                                <span className="sr-only">Действия</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="grid gap-1">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
  }

  // If loading is finished AND the user is not an admin, then redirect.
  if (!isUserLoading && !hasAdminRole(currentUserData?.roles)) {
    redirect('/dashboard');
  }

  // If loading is finished and user is an admin, render the page.
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
