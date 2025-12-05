'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { useApplications } from "@/firebase/firestore/applications";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ApplicationsPage() {
  const { data: applications, loading } = useApplications();

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Заявки</h1>
          <p className="text-muted-foreground">
            Просмотр и обработка заявок участников.
          </p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список заявок</CardTitle>
          <CardDescription>Заявки участников на лоты.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Пользователь</TableHead>
                   <TableHead>Лот</TableHead>
                   <TableHead>Филиал</TableHead>
                   <TableHead>Дата заявки</TableHead>
                   <TableHead>Статус</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))}
               </TableBody>
             </Table>
          ) : applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Дата заявки</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.userName}</TableCell>
                    <TableCell>{app.lotTitle}</TableCell>
                    <TableCell>{app.branchName}</TableCell>
                    <TableCell>{new Date(app.applicationDate).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                       <Badge
                        variant="outline"
                        className={cn(
                          app.status === 'Новая' && 'border-blue-500/50 text-blue-400',
                          app.status === 'Принята' && 'border-green-500/50 text-green-400',
                          app.status === 'Отклонена' && 'border-red-500/50 text-red-400',
                        )}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Заявок пока нет</h3>
              <p className="text-muted-foreground mt-2">
                Здесь будут отображаться заявки от участников.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    