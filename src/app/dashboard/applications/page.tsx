'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useApplications, updateApplicationStatus } from '@/firebase/firestore/applications';
import { useUsers } from '@/firebase/firestore/users';
import { useLots } from '@/firebase/firestore/lots';
import { useBranches } from '@/firebase/firestore/branches';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { ApplicationStatus } from '@/lib/types';
import { useMemo } from 'react';

export default function ApplicationsPage() {
  const { data: applications, loading: applicationsLoading } = useApplications();
  const { toast } = useToast();

  // Fetch enrichment data separately
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: lots, loading: lotsLoading } = useLots();
  const { data: branches, loading: branchesLoading } = useBranches(true);

  const loading = applicationsLoading || usersLoading || lotsLoading || branchesLoading;

  const enrichedApplications = useMemo(() => {
    if (loading || !applications || !users || !lots || !branches) return [];
    
    const usersMap = new Map(users.map((u) => [u.id, `${u.surname} ${u.name}`]));
    const lotsMap = new Map(lots.map((l) => [l.id, l.title]));
    const branchesMap = new Map(branches.map((b) => [b.id, b.name]));

    return applications.map(app => ({
      ...app,
      userName: usersMap.get(app.userId) || 'Неизвестный пользователь',
      lotTitle: lotsMap.get(app.lotId) || 'Неизвестный лот',
      branchName: branchesMap.get(app.branchId) || 'Неизвестный филиал',
    }));
  }, [loading, applications, users, lots, branches]);


  const handleStatusChange = (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    updateApplicationStatus(applicationId, newStatus);
    toast({
      title: 'Статус обновлен',
      description: `Заявка была успешно переведена в статус "${newStatus}".`,
    });
  };

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
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : enrichedApplications && enrichedApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Дата заявки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.userName}</TableCell>
                    <TableCell>{app.lotTitle}</TableCell>
                    <TableCell>{app.branchName}</TableCell>
                    <TableCell>
                      {new Date(app.applicationDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-opacity-50',
                          app.status === 'Новая' &&
                            'border-blue-500 text-blue-400',
                          app.status === 'Принята' &&
                            'border-green-500 text-green-400',
                          app.status === 'Отклонена' &&
                            'border-red-500 text-red-400'
                        )}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Меню</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Изменить статус</DropdownMenuLabel>
                          {app.status !== 'Принята' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(app.id, 'Принята')
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Принять
                            </DropdownMenuItem>
                          )}
                          {app.status !== 'Отклонена' && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleStatusChange(app.id, 'Отклонена')
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Отклонить
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
