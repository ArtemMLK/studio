"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserData } from "@/hooks/use-current-user-data";
import { hasAdminRole } from "@/lib/roles";
import { UsersTable } from "@/components/users-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const router = useRouter();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  useEffect(() => {
    // Ждем окончания загрузки данных.
    if (isUserLoading) {
      return;
    }

    // Если после загрузки данных нет или пользователь не админ, перенаправляем.
    if (!currentUserData || !hasAdminRole(currentUserData.roles)) {
      router.replace("/dashboard");
    }
  }, [isUserLoading, currentUserData, router]);


  // Пока идет загрузка или если данные еще не пришли, показываем скелет.
  if (isUserLoading || !currentUserData) {
    return <UsersPageSkeleton />;
  }

  // Если у пользователя нет роли админа (на случай, если редирект еще не сработал),
  // ничего не показываем, чтобы избежать мелькания контента.
  if (!hasAdminRole(currentUserData.roles)) {
    return null;
  }
  
  // Если все проверки пройдены, показываем полноценный компонент таблицы пользователей.
  return <UsersTable />;
}
