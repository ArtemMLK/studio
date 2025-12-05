
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
  branchId: string; // Added to filter lots by branch
  plan: number;
  price: number;
  currency: string;
  deadline: string;
  status: LotStatus;
  imageUrl: string;
  imageHint: string;
};

export type ApplicationStatus = 'Новая' | 'Принята' | 'Отклонена';

export type Application = {
  id: string;
  lotId: string;
  lotTitle?: string; // Denormalized for display
  userId: string;
  userName?: string; // Denormalized for display
  applicationDate: string;
  status: ApplicationStatus;
  branchId: string; // Denormalized for filtering
  branchName?: string; // Denormalized for display
  procurementId: string; // Denormalized for filtering
};

export type Receipt = {
    id: string;
    lotId: string;
    lotTitle?: string; // Denormalized
    receiptDate: string;
    amount: number;
    currency: string;
    branchId: string; // Denormalized
    branchName?: string; // Denormalized
    procurementId: string; // Denormalized
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

    