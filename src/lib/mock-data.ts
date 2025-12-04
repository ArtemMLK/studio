import type { Kpi, Lot, LotStatus, User, UserRole } from '@/lib/types';
import {
  Landmark,
  PackageCheck,
  Receipt,
  Wallet,
  FileClock,
  LineChart,
} from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

export const kpis: Kpi[] = [
  {
    title: 'Объем закупок',
    value: '12,450,000 ₽',
    change: '+15.2% с прошлого месяца',
    icon: LineChart,
    description: 'Общая стоимость всех активных закупок.',
  },
  {
    title: 'Поступления',
    value: '8,980,000 ₽',
    change: '+21.0% с прошлого месяца',
    icon: Receipt,
    description: 'Сумма полученных средств по лотам.',
  },
  {
    title: 'Выдачи (аллокации)',
    value: '7,120,000 ₽',
    change: '+5.7% с прошлого месяца',
    icon: PackageCheck,
    description: 'Общая стоимость выданных товаров/услуг.',
  },
  {
    title: 'Остатки',
    value: '1,860,000 ₽',
    change: '-2.1% с прошлого месяца',
    icon: Wallet,
    description: 'Разница между поступлениями и выдачами.',
  },
  {
    title: 'Активные заявки',
    value: '274',
    change: '+32 с прошлого месяца',
    icon: FileClock,
    description: 'Количество заявок в обработке.',
  },
  {
    title: 'Филиалы',
    value: '12',
    change: '+1 новый филиал',
    icon: Landmark,
    description: 'Общее количество подключенных филиалов.',
  },
];
