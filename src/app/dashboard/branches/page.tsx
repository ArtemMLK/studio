'use client';

import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AddBranchDialog } from '@/components/add-branch-dialog';
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
import { branches as initialBranches } from '@/lib/types';
import { cn } from '@/lib/utils';

export type Branch = {
  id: number;
  name: string;
  address: string;
  head: string;
  userCount: number;
  status: 'Активен' | 'Неактивен';
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const branchData: Branch[] = initialBranches.map((branchName, index) => ({
      id: index + 1,
      name: branchName,
      address: `г. Город, ул. Улица, д. ${index + 1}`,
      head: ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.'][index % 3],
      userCount: Math.floor(Math.random() * 20) + 1,
      status: Math.random() > 0.2 ? 'Активен' : 'Неактивен',
    }));
    setBranches(branchData);
  }, []);

  const handleBranchAdded = (newBranchData: Omit<Branch, 'id' | 'userCount' | 'status'>) => {
    const newBranch: Branch = {
        ...newBranchData,
        id: Math.max(...branches.map((b) => b.id), 0) + 1,
        userCount: 0,
        status: 'Активен',
    };
    setBranches((prev) => [newBranch, ...prev]);
  };


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
              {branches.map((branch) => (
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
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>Деактивировать</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
