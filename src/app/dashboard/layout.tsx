'use client';

import { Handshake } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard-header';
import { BranchSelectionProvider } from '@/hooks/use-branch-selection.tsx';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BranchSelectionProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Handshake className="h-6 w-6 text-accent" />
              <span className="group-data-[collapsible=icon]:hidden">
                ProcurementFlow
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BranchSelectionProvider>
  );
}
