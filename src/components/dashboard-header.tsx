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
import { useBranchSelection } from '@/hooks/use-branch-selection';
import { useUser } from '@/firebase';

export function DashboardHeader() {
  const { data: allBranches, loading: branchesLoading } = useBranches(true); // Load all branches for the dropdown
  const { selectedBranchId, setSelectedBranchId } = useBranchSelection();
  const { user } = useUser();
  // TODO: Get user's assigned branches from their user document to filter the dropdown

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <Select
          value={selectedBranchId}
          onValueChange={setSelectedBranchId}
          disabled={branchesLoading || !user}
        >
          <SelectTrigger className="w-full max-w-xs h-9">
            <SelectValue placeholder="Выберите филиал" />
          </SelectTrigger>
          <SelectContent>
            {branchesLoading ? (
              <SelectItem value="loading" disabled>
                Загрузка...
              </SelectItem>
            ) : (
              <>
                <SelectItem value="all">Все филиалы</SelectItem>
                {allBranches.map((branch) => (
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
