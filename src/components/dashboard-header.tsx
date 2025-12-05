'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/user-nav';
import { useBranches } from '@/firebase/firestore/branches';

export function DashboardHeader() {
  const { data: branches, loading } = useBranches();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <Select defaultValue="all" disabled={loading}>
          <SelectTrigger className="w-full max-w-xs h-9">
            <SelectValue placeholder="Выберите филиал" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>
                Загрузка...
              </SelectItem>
            ) : (
              <>
                <SelectItem value="all">Все филиалы</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <UserNav />
    </header>
  );
}
