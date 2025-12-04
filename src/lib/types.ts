
export type UserRole = 'Участник' | 'Менеджер' | 'Аналитик' | 'Администратор';

export type User = {
  id: string;
  login: string; // This will be the user's email
  name: string;
  surname: string;
  phone: string;
  telegram?: string;
  roles: UserRole[];
  branchIds: string[];
  blacklisted: boolean;
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

export type Branch = {
  id: string;
  name: string;
  address: string;
  head: string;
  userCount: number;
  status: 'Активен' | 'Неактивен';
};


export const userRoles: UserRole[] = ['Администратор', 'Менеджер', 'Аналитик', 'Участник'];

// This is now derived from Firestore, so we remove the static array.
// export const branches = [
//   'Центральный офис',
//   'Филиал "Север"',
//   'Филиал "Юг"',
//   'Филиал "Запад"',
//   'Филиал "Восток"',
// ];
