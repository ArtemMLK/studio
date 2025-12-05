'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { AddBranchDialog } from '@/components/add-branch-dialog';
import { EditBranchDialog } from '@/components/edit-branch-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { addBranch, updateBranch, useBranches } from '@/firebase/firestore/branches';
import { Branch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';
import { useToast } from '@/hooks/use-toast';

export default function BranchesPage() {
  const { selectedBranchId } = useBranchSelection();
  const { data: branches, loading } = useBranches(false, selectedBranchId);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { toast } = useToast();

  const handleBranchAdded = (newBranchData: Omit<Branch, 'id' | 'userCount' | 'status'>) => {
    const newBranch: Omit<Branch, 'id'> = {
      ...newBranchData,
      userCount: 0,
      status: 'Активен',
    };
    addBranch(newBranch);
    toast({ title: 'Филиал добавлен', description: `Филиал "${newBranch.name}" успешно создан.` });
  };
  
  const handleBranchUpdated = (branchId: string, updatedData: Omit<Branch, 'id' | 'userCount' | 'status'>) => {
    updateBranch(branchId, updatedData);
    setEditingBranch(null);
    toast({ title: 'Филиал обновлен', description: `Данные филиала "${updatedData.name}" успешно обновлены.` });
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Филиалы</h1>
          <p className="text-muted-foreground">Управление филиалами и объектами.</p>
        </div>
        <div className="flex items-center space-x-2">
          <AddBranchDialog onBranchAdded={handleBranchAdded} />
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список филиалов</CardTitle>
          <CardDescription>
            Все зарегистрированные филиалы и объекты.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead className="hidden md:table-cell">Руководитель</TableHead>
                <TableHead className="hidden md:table-cell">Пользователей</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell className="hidden md:table-cell">{branch.head}</TableCell>
                    <TableCell className="hidden md:table-cell">{branch.userCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={branch.status === 'Активен' ? 'outline' : 'destructive'}
                        className={cn(
                          branch.status === 'Активен' && 'border-green-500/50 text-green-400'
                        )}
                      >
                        {branch.status}
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
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingBranch(branch)}>
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem>Деактивировать</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingBranch && (
        <EditBranchDialog
          branch={editingBranch}
          onBranchUpdated={handleBranchUpdated}
          onOpenChange={(isOpen) => !isOpen && setEditingBranch(null)}
        />
      )}
    </>
  );
}
