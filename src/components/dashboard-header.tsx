'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

export function DashboardHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        {isClient && (
            <Select defaultValue="all">
            <SelectTrigger className="w-full max-w-xs h-9">
                <SelectValue placeholder="Выберите филиал" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Все филиалы</SelectItem>
                <SelectItem value="north">Филиал "Север"</SelectItem>
                <SelectItem value="south">Филиал "Юг"</SelectItem>
                <SelectItem value="west">Филиал "Запад"</SelectItem>
                <SelectItem value="east">Филиал "Восток"</SelectItem>
            </SelectContent>
            </Select>
        )}
      </div>
      {isClient && <UserNav />}
    </header>
  );
}
