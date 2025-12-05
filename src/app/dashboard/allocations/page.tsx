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
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllocations, addAllocation } from '@/firebase/firestore/allocations';
import { AddAllocationDialog } from '@/components/add-allocation-dialog';
import type { Allocation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AllocationsPage() {
  const { data: allocations, loading } = useAllocations();
  const { toast } = useToast();

  const handleAllocationAdded = (newAllocationData: Omit<Allocation, 'id'>) => {
    addAllocation(newAllocationData);
    toast({
        title: 'Распределение добавлено',
        description: `Новое распределение на сумму ${newAllocationData.amount} создано.`
    });
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Распределения</h1>
          <p className="text-muted-foreground">
            Просмотр и управление выдачей по заявкам.
          </p>
        </div>
        <AddAllocationDialog onAllocationAdded={handleAllocationAdded} />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список распределений</CardTitle>
          <CardDescription>Выдача товаров или услуг по заявкам.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : allocations && allocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((alloc) => (
                  <TableRow key={alloc.id}>
                    <TableCell className="font-medium">{alloc.userName}</TableCell>
                    <TableCell>{alloc.lotTitle}</TableCell>
                    <TableCell>{alloc.branchName}</TableCell>
                     <TableCell>
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB', // Assuming RUB, adjust if needed
                      }).format(alloc.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(alloc.allocationDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                       <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Меню</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">Распределений пока нет</h3>
              <p className="text-muted-foreground mt-2">
                Здесь будут отображаться выданные участникам лоты.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
