
'use client';

import { CircleUser, LogOut, User as UserIcon } from 'lucide-react';
import { useActionState, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/app/actions';
import { useUser } from '@/firebase'; // Using the central user hook
import { Skeleton } from './components/ui/skeleton';
import { useUsers } from './firebase/firestore/users';
import { useCurrentUserData } from './hooks/use-current-user-data';

export function UserNav() {
  const [_, dispatch] = useActionState(logout, undefined);
  const { currentUserData, isUserLoading } = useCurrentUserData();

  if (isUserLoading) {
    return (
       <Skeleton className="h-9 w-9 rounded-full" />
    );
  }

  if (!currentUserData) {
    // This could happen briefly between auth loading and firestore loading, or if logged out
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUserData.avatar} alt={currentUserData.name} />
            <AvatarFallback>
              <CircleUser />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUserData.name} {currentUserData.surname}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUserData.login}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button type="submit" className="flex w-full items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
