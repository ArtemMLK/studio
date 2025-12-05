'use client';

import { useState } from 'react';
import { ShoppingBasket, PlusCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProcurementProcesses,
  addProcurementProcess,
} from '@/firebase/firestore/procurements';
import { AddProcurementDialog } from '@/components/add-procurement-dialog';
import type { ProcurementProcess } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useCurrentUserData } from '@/hooks/use-current-user-data';

export default function ProcurementsPage() {
  const { selectedBranchId } = useBranchSelection();
  const { data: procurements, loading } = useProcurementProcesses();
  const router = useRouter();
  const { currentUserData } = useCurrentUserData();

  const canManage = currentUserData?.roles.includes('Администратор') || currentUserData?.roles.includes('Менеджер');


  const handleProcurementAdded = (
    newProcurementData: Omit<ProcurementProcess, 'id' | 'status' | 'lotCount'>
  ) => {
    addProcurementProcess(newProcurementData.branchId, {
      ...newProcurementData,
      status: 'Активен',
      lotCount: 0,
      startDate: new Date().toISOString(),
      endDate: '', // Can be set later
    });
  };
  
  const handleRowClick = (procurementId: string) => {
    router.push(`/dashboard/procurements/${procurementId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Закупки</h1>
          <p className="text-muted-foreground">
            Закупка — это общее мероприятие (например, тендер), которое объединяет в себе несколько лотов.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center space-x-2">
            <AddProcurementDialog onProcurementAdded={handleProcurementAdded} />
          </div>
        )}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список закупок</CardTitle>
          <CardDescription>
            Выберите закупку, чтобы просмотреть или добавить в нее лоты.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Кол-во лотов</TableHead>
                  <TableHead>Дата начала</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : procurements && procurements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Кол-во лотов</TableHead>
                  <TableHead>Дата начала</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurements.map((proc) => (
                  <TableRow key={proc.id} onClick={() => handleRowClick(proc.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{proc.name}</TableCell>
                    <TableCell>{proc.branchName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          proc.status === 'Активен' ? 'outline' : 'secondary'
                        }
                        className={
                          proc.status === 'Активен'
                            ? 'border-green-500/50 text-green-400'
                            : ''
                        }
                      >
                        {proc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{proc.lotCount}</TableCell>
                    <TableCell>
                      {new Date(proc.startDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Закупок пока нет</h3>
              <p className="text-muted-foreground mt-2">
                Начните с создания новой закупочной процедуры.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
