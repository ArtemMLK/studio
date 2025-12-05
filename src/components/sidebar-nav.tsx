
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
  { href: '/dashboard', label: 'Панель управления', icon: LayoutGrid, roles: ['Администратор', 'Менеджер', 'Аналитик', 'Участник'] as UserRole[] },
  { href: '/dashboard/procurements', label: 'Закупки', icon: ShoppingBasket, roles: ['Администратор', 'Менеджер', 'Аналитик'] as UserRole[] },
  { href: '/dashboard/lots', label: 'Лоты', icon: Box, roles: ['Администратор', 'Менеджер', 'Аналитик', 'Участник'] as UserRole[] },
  { href: '/dashboard/applications', label: 'Заявки', icon: FileText, roles: ['Администратор', 'Менеджер', 'Участник'] as UserRole[] },
  { href: '/dashboard/receipts', label: 'Поступления', icon: Receipt, roles: ['Администратор', 'Менеджер'] as UserRole[] },
  { href: '/dashboard/allocations', label: 'Распределения', icon: PackageCheck, roles: ['Администратор', 'Менеджер'] as UserRole[] },
  { href: '/dashboard/branches', label: 'Филиалы', icon: Building2, roles: ['Администратор'] as UserRole[] },
  { href: '/dashboard/users', label: 'Пользователи', icon: Users, roles: ['Администратор'] as UserRole[] },
  { href: '/dashboard/reports', label: 'Отчеты', icon: LineChart, roles: ['Администратор', 'Аналитик'] as UserRole[] },
];

const hasAccess = (userRoles: UserRole[], allowedRoles: UserRole[]) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some(role => allowedRoles.includes(role));
}

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUserData } = useCurrentUserData();

  const navItems = allNavItems.filter(item => {
    if (!currentUserData || !currentUserData.roles || currentUserData.roles.length === 0) {
      // Default to most restrictive for loading/logged-out state
      return item.roles.includes('Участник'); 
    }
    return hasAccess(currentUserData.roles, item.roles);
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
