
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

export type ProcurementStatus = 'Активен' | 'Завершен' | 'Архив';

export type ProcurementProcess = {
  id: string;
  name: string;
  description: string;
  branchId: string;
  branchName?: string; 
  startDate: string;
  endDate: string;
  status: ProcurementStatus;
  lotCount: number;
};


export const userRoles: UserRole[] = ['Администратор', 'Менеджер', 'Аналитик', 'Участник'];
