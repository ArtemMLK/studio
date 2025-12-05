'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ShoppingBasket,
  Box,
  FileText,
  Building2,
  Users,
  LineChart,
  Settings,
  Receipt,
  PackageCheck,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { UserRole } from '@/lib/types';

const allNavItems = [
  { href: '/dashboard', label: 'Панель управления', icon: LayoutGrid, roles: ['Администратор', 'Менеджер', 'Аналитик', 'Участник'] },
  { href: '/dashboard/procurements', label: 'Закупки', icon: ShoppingBasket, roles: ['Администратор', 'Менеджер', 'Аналитик'] },
  { href: '/dashboard/lots', label: 'Лоты', icon: Box, roles: ['Администратор', 'Менеджер', 'Аналитик', 'Участник'] },
  { href: '/dashboard/applications', label: 'Заявки', icon: FileText, roles: ['Администратор', 'Менеджер', 'Участник'] },
  { href: '/dashboard/receipts', label: 'Поступления', icon: Receipt, roles: ['Администратор', 'Менеджер'] },
  { href: '/dashboard/allocations', label: 'Распределения', icon: PackageCheck, roles: ['Администратор', 'Менеджер'] },
  { href: '/dashboard/branches', label: 'Филиалы', icon: Building2, roles: ['Администратор'] },
  { href: '/dashboard/users', label: 'Пользователи', icon: Users, roles: ['Администратор'] },
  { href: '/dashboard/reports', label: 'Отчеты', icon: LineChart, roles: ['Администратор', 'Аналитик'] },
];

const hasAccess = (userRoles: UserRole[], allowedRoles: UserRole[]) => {
  return userRoles.some(role => allowedRoles.includes(role));
}

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUserData } = useCurrentUserData();

  const navItems = allNavItems.filter(item => {
    if (!currentUserData || currentUserData.roles.length === 0) {
      // Show a minimal set for loading/logged-out state if needed, or nothing
      return item.roles.includes('Участник'); // Default to most restrictive
    }
    return hasAccess(currentUserData.roles, item.roles as UserRole[]);
  });


  return (
    <div className="flex flex-col justify-between h-full">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
