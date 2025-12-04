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

const navItems = [
  { href: '/dashboard', label: 'Панель управления', icon: LayoutGrid },
  { href: '/dashboard/procurements', label: 'Закупки', icon: ShoppingBasket },
  { href: '/dashboard/lots', label: 'Лоты', icon: Box },
  { href: '/dashboard/applications', label: 'Заявки', icon: FileText },
  { href: '/dashboard/receipts', label: 'Поступления', icon: Receipt },
  { href: '/dashboard/allocations', label: 'Распределения', icon: PackageCheck },
  { href: '/dashboard/branches', label: 'Филиалы', icon: Building2 },
  { href: '/dashboard/users', label: 'Пользователи', icon: Users },
  { href: '/dashboard/reports', label: 'Отчеты', icon: LineChart },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
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
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/dashboard/settings')}
            tooltip="Настройки"
          >
            <Link href="#">
              <Settings />
              <span>Настройки</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
