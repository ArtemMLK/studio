'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { AddUserDialog } from '@/components/add-user-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
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
import { users as initialUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleUserAdded = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">
            Управление пользователями системы.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AddUserDialog onUserAdded={handleUserAdded} existingUsers={users} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Все зарегистрированные пользователи системы.
          </CardDescription>
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={user.avatar} alt="Avatar" />
                        <AvatarFallback>
                          {user.surname.charAt(0)}
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">
                          {user.surname} {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.login}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={
                            role === 'Администратор'
                              ? 'default'
                              : role === 'Менеджер'
                                ? 'secondary'
                                : role === 'Аналитик'
                                  ? 'outline'
                                  : 'destructive'
                          }
                          className={cn(
                            role === 'Администратор' &&
                              'bg-blue-600/20 text-blue-800 border-transparent hover:bg-blue-600/30 dark:text-blue-300',
                            role === 'Менеджер' &&
                              'bg-purple-600/20 text-purple-800 border-transparent hover:bg-purple-600/30 dark:text-purple-300',
                            role === 'Аналитик' &&
                              'bg-yellow-600/20 text-yellow-800 border-transparent hover:bg-yellow-600/30 dark:text-yellow-300',
                            role === 'Участник' &&
                              'bg-gray-600/20 text-gray-800 border-transparent hover:bg-gray-600/30 dark:text-gray-300'
                          )}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.phone}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.branches.join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isBlacklisted ? 'destructive' : 'default'}
                      className={cn(
                        !user.isBlacklisted &&
                          'bg-green-600/20 text-green-800 border-transparent hover:bg-green-600/30 dark:text-green-300'
                      )}
                    >
                      {user.isBlacklisted ? 'Заблокирован' : 'Активен'}
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
                        <DropdownMenuItem>Сбросить пароль</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          {user.isBlacklisted
                            ? 'Разблокировать'
                            : 'Заблокировать'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Удалить
                        </DropdownMenuItem>
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
