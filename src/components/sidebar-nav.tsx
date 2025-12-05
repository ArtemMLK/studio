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

/**
 * A robust role check that handles roles being a string or an array.
 * @param userRoles - The roles from the user document (can be string or array).
 * @param allowedRoles - The roles allowed for a specific navigation item.
 * @returns boolean - True if the user has access.
 */
const hasAccess = (userRoles: UserRole[] | UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRoles) return false;

  // If userRoles is an array, check if any role in the array is in allowedRoles.
  if (Array.isArray(userRoles)) {
    return userRoles.some(role => allowedRoles.includes(role));
  }

  // If userRoles is a single string, check if that string is in allowedRoles.
  return allowedRoles.includes(userRoles as UserRole);
};


export function SidebarNav() {
  const pathname = usePathname();
  const { currentUserData } = useCurrentUserData();

  const navItems = allNavItems.filter(item => {
    // During loading or if there are no roles, show a minimal set for participants.
    if (!currentUserData || !currentUserData.roles) {
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
