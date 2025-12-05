"use client";

import { useCurrentUserData } from "@/hooks/use-current-user-data";
import { hasAdminRole } from "@/lib/roles";
import { UsersTable } from "@/components/users-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";


function UsersPageSkeleton() {
  return (
    <>
       <div className="flex items-center justify-between space-y-2">
        <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <Card className="mt-4">
        <CardHeader>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="mt-1 h-4 w-80" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                 <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                 <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                 <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                 <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                 <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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


export default function UsersPage() {
  const { currentUserData, isUserLoading } = useCurrentUserData();

  if (isUserLoading || !currentUserData) {
    return <UsersPageSkeleton />;
  }

  const isAdmin = hasAdminRole(currentUserData.roles);

  if (!isAdmin) {
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Доступ запрещен</h1>
            <p className="mt-2 text-muted-foreground">
                У вас нет прав для просмотра этой страницы.
            </p>
        </div>
    );
  }

  return <UsersTable />;
}
