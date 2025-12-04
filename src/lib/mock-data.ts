import type { Kpi, Lot, LotStatus, User } from '@/lib/types';
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

const lotStatuses: LotStatus[] = ['Активен', 'Завершен', 'Приостановлен', 'Отменен'];

export const lots: Lot[] = PlaceHolderImages.map((img, index) => ({
  id: `L00${index + 1}`,
  title: `Лот ${index + 1}: ${img.description}`,
  procurementId: 'ЗАК-2024-001',
  plan: 100,
  price: (Math.random() * (50000 - 5000) + 5000) * (index + 1),
  currency: '₽',
  deadline: new Date(new Date().getTime() + (30 * (index + 1)) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
  status: lotStatuses[index % lotStatuses.length],
  imageUrl: img.imageUrl,
  imageHint: img.imageHint,
}));

export const users: User[] = [
  {
    id: 1,
    login: 'ivanov.i',
    name: 'Иван',
    surname: 'Иванов',
    phone: '+7 (916) 123-45-67',
    telegram: '@ivanov_ivan',
    roles: ['Administrator', 'Manager'],
    branches: ['Центральный офис', 'Филиал "Север"'],
    isBlacklisted: false,
    avatar: 'https://i.pravatar.cc/150?u=ivanov.i',
  },
  {
    id: 2,
    login: 'petrova.e',
    name: 'Елена',
    surname: 'Петрова',
    phone: '+7 (926) 234-56-78',
    telegram: '@petrova_elena',
    roles: ['Manager'],
    branches: ['Филиал "Юг"'],
    isBlacklisted: false,
    avatar: 'https://i.pravatar.cc/150?u=petrova.e',
  },
  {
    id: 3,
    login: 'sidorov.a',
    name: 'Алексей',
    surname: 'Сидоров',
    phone: '+7 (903) 345-67-89',
    telegram: '@sidorov_alex',
    roles: ['Analyst'],
    branches: ['Центральный офис'],
    isBlacklisted: false,
    avatar: 'https://i.pravatar.cc/150?u=sidorov.a',
  },
  {
    id: 4,
    login: 'smirnova.o',
    name: 'Ольга',
    surname: 'Смирнова',
    phone: '+7 (915) 456-78-90',
    telegram: '@smirnova_olga',
    roles: ['Participant'],
    branches: ['Филиал "Запад"'],
    isBlacklisted: false,
    avatar: 'https://i.pravatar.cc/150?u=smirnova.o',
  },
  {
    id: 5,
    login: 'kuznetsov.d',
    name: 'Дмитрий',
    surname: 'Кузнецов',
    phone: '+7 (965) 567-89-01',
    telegram: '@kuznetsov_dmitry',
    roles: ['Participant'],
    branches: ['Филиал "Восток"'],
    isBlacklisted: true,
    avatar: 'https://i.pravatar.cc/150?u=kuznetsov.d',
  },
];
