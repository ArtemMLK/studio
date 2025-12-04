
'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { AddUserDialog } from '@/components/add-user-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NewUserCredentialsDialog } from './new-user-credentials-dialog';
import { addUser, useUsers, updateUser } from '@/firebase/firestore/users';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function UsersTable() {
  const { data: users, isLoading } = useUsers();
  const [credentials, setCredentials] = useState<{
    login: string;
    password;
  } | null>(null);

  const auth = useAuth();
  const { toast } = useToast();

  const handleUserAdded = async (newUser: Omit<User, 'id'>, generatedPassword) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.login, // Assuming login is the email
        generatedPassword
      );
      const firebaseUser = userCredential.user;

      // Now add the user data to Firestore with the UID from Auth
      addUser({ ...newUser }, firebaseUser.uid);
      
      setCredentials({ login: newUser.login, password: generatedPassword });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка создания пользователя',
        description: error.message,
      });
    }
  };

  const handleResetPassword = (email: string) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: 'Письмо для сброса пароля отправлено',
          description: `Инструкции были отправлены на ${email}`,
        });
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error);
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Не удалось отправить письмо для сброса пароля.',
        });
      });
  };

  const toggleUserBlacklist = (userId: string, isBlacklisted: boolean) => {
    updateUser(userId, { blacklisted: !isBlacklisted });
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-2 py-4">
        <AddUserDialog onUserAdded={handleUserAdded} />
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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
                ))
              ) : (
                users?.map((user) => (
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
                            variant={'outline'}
                            className={cn(
                              role === 'Администратор' && 'border-blue-500/50 text-blue-400',
                              role === 'Менеджер' && 'border-purple-500/50 text-purple-400',
                              role === 'Аналитик' && 'border-yellow-500/50 text-yellow-400',
                              role === 'Участник' && 'border-gray-500/50 text-gray-400'
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
                      {user.branchIds.join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.blacklisted ? 'destructive' : 'outline'}
                        className={cn(
                          !user.blacklisted && 'border-green-500/50 text-green-400'
                        )}
                      >
                        {user.blacklisted ? 'Заблокирован' : 'Активен'}
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
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user.login)}
                          >
                            Сбросить пароль
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => toggleUserBlacklist(user.id, user.blacklisted)}
                          >
                            {user.blacklisted
                              ? 'Разблокировать'
                              : 'Заблокировать'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Удалить
                          </DropdownMenuItem>
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
      {credentials && (
        <NewUserCredentialsDialog
          login={credentials.login}
          password={credentials.password}
          onClose={() => setCredentials(null)}
        />
      )}
    </>
  );
}
