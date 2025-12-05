
'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { AddUserDialog } from '@/components/add-user-dialog';
import { EditUserDialog } from '@/components/edit-user-dialog';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NewUserCredentialsDialog } from './new-user-credentials-dialog';
import { addUser, useUsers, updateUser, deleteUser } from '@/firebase/firestore/users';
import { useBranches } from '@/firebase/firestore/branches';
import { Skeleton } from './ui/skeleton';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { buttonVariants } from './ui/button';

export function UsersTable() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: branches, loading: branchesLoading } = useBranches(true);
  const { currentUserData } = useCurrentUserData();

  const [credentials, setCredentials] = useState<{
    login: string;
    password;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);


  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const isLoading = usersLoading || branchesLoading;
  const canManage = currentUserData?.roles.includes('Администратор');

  const branchNameMap = useMemo(() => {
    if (!branches) return new Map();
    return new Map(branches.map(branch => [branch.id, branch.name]));
  }, [branches]);

  const handleUserAdded = async (newUser: Omit<User, 'id'>, generatedPassword) => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервис аутентификации не инициализирован.',
      });
      return;
    }
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Сервис базы данных не инициализирован.',
        });
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.login, // Assuming login is the email
        generatedPassword
      );
      const firebaseUser = userCredential.user;

      // Now add the user data to Firestore with the UID from Auth
      addUser(firestore, { ...newUser }, firebaseUser.uid);
      
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

  const handleUserUpdated = (userId: string, updatedData: Partial<User>) => {
    if (!firestore) return;
    updateUser(firestore, userId, updatedData);
    setEditingUser(null);
    toast({ title: 'Пользователь обновлен', description: `Данные пользователя успешно обновлены.` });
  };


  const handleResetPassword = (email: string) => {
     if (!auth) return;
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
  
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !firestore) return;
    try {
      // In a real app, you would also need to delete the user from Firebase Auth.
      // This is a backend operation and requires admin privileges.
      await deleteUser(firestore, userToDelete.id);
      toast({
        title: 'Пользователь удален',
        description: `Пользователь ${userToDelete.name} ${userToDelete.surname} был удален.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления пользователя',
        description: 'Не удалось удалить документ пользователя. Убедитесь, что у вас есть права, и проверьте правила безопасности.',
      });
    } finally {
      setUserToDelete(null);
    }
  };


  const toggleUserBlacklist = (userId: string, isBlacklisted: boolean) => {
    if (!firestore) return;
    updateUser(firestore, userId, { blacklisted: !isBlacklisted });
     toast({
        title: 'Статус пользователя обновлен',
        description: `Пользователь был ${!isBlacklisted ? 'заблокирован' : 'разблокирован'}.`
    });
  };

  return (
    <>
       <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">
            Управление учетными записями и ролями.
          </p>
        </div>
        {canManage && (
            <AddUserDialog onUserAdded={handleUserAdded} />
        )}
      </div>
      <Card className="mt-4">
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
                {canManage && (
                  <TableHead>
                    <span className="sr-only">Действия</span>
                  </TableHead>
                )}
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
                    {canManage && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
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
                        {Array.isArray(user.roles) ? user.roles.map((role) => (
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
                        )) : <Badge variant="outline">{(user.roles as any)}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phone}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       {user.branchIds.map(id => branchNameMap.get(id) || id).join(', ')}
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
                    {canManage && (
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
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user.login)}
                            >
                              Сбросить пароль
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={cn(user.blacklisted ? "focus:text-green-400" : "focus:text-yellow-400")}
                              onClick={() => toggleUserBlacklist(user.id, user.blacklisted)}
                            >
                              {user.blacklisted
                                ? 'Разблокировать'
                                : 'Заблокировать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDeleteUser(user)}
                            >
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingUser && canManage && (
        <EditUserDialog
          user={editingUser}
          onUserUpdated={handleUserUpdated}
          onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}
        />
      )}

      {credentials && (
        <NewUserCredentialsDialog
          login={credentials.login}
          password={credentials.password}
          onClose={() => setCredentials(null)}
        />
      )}
       <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Документ пользователя{' '}
              <span className="font-bold">{userToDelete?.name} {userToDelete?.surname}</span> будет
              навсегда удален из базы данных. Аутентификационные данные пользователя останутся, но его можно заблокировать.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className={cn(buttonVariants({ variant: 'destructive' }))}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
