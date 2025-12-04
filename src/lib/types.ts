export type UserRole = 'Участник' | 'Менеджер' | 'Аналитик' | 'Администратор';

export type User = {
  id: number;
  login: string;
  name: string;
  surname: string;
  phone: string;
  telegram: string;
  roles: UserRole[];
  branches: string[];
  isBlacklisted: boolean;
  avatar: string;
};

export type LotStatus = 'Активен' | 'Завершен' | 'Приостановлен' | 'Отменен';

export type Lot = {
  id: string;
  title: string;
  procurementId: string;
  plan: number;
  price: number;
  currency: string;
  deadline: string;
  status: LotStatus;
  imageUrl: string;
  imageHint: string;
};

export type Kpi = {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

export const userRoles: UserRole[] = ['Администратор', 'Менеджер', 'Аналитик', 'Участник'];

export const branches = [
  'Центральный офис',
  'Филиал "Север"',
  'Филиал "Юг"',
  'Филиал "Запад"',
  'Филиал "Восток"',
];
