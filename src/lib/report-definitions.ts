export type ReportField = {
  key: string;
  label: string;
};

export type ReportEntity = {
  key: ReportEntityKey;
  label: string;
  fields: ReportField[];
};

export type ReportEntityKey =
  | 'lots'
  | 'applications'
  | 'receipts'
  | 'allocations'
  | 'users'
  | 'branches';

export const reportEntities: Record<ReportEntityKey, ReportEntity> = {
  lots: {
    key: 'lots',
    label: 'Лоты',
    fields: [
      { key: 'title', label: 'Название' },
      { key: 'status', label: 'Статус' },
      { key: 'price', label: 'Цена' },
      { key: 'currency', label: 'Валюта' },
      { key: 'plan', label: 'План' },
      { key: 'deadline', label: 'Срок' },
      { key: 'branchName', label: 'Филиал' },
      { key: 'procurementName', label: 'Закупка' },
    ],
  },
  applications: {
    key: 'applications',
    label: 'Заявки',
    fields: [
      { key: 'userName', label: 'Пользователь' },
      { key: 'lotTitle', label: 'Лот' },
      { key 'status', label: 'Статус' },
      { key: 'applicationDate', label: 'Дата заявки' },
      { key: 'branchName', label: 'Филиал' },
    ],
  },
  receipts: {
    key: 'receipts',
    label: 'Поступления',
    fields: [
      { key: 'lotTitle', label: 'Лот' },
      { key: 'branchName', label: 'Филиал' },
      { key: 'amount', label: 'Сумма' },
      { key: 'currency', label: 'Валюта' },
      { key: 'receiptDate', label: 'Дата поступления' },
    ],
  },
  allocations: {
    key: 'allocations',
    label: 'Распределения',
    fields: [
      { key: 'userName', label: 'Пользователь' },
      { key: 'lotTitle', label: 'Лот' },
      { key: 'branchName', label: 'Филиал' },
      { key: 'amount', label: 'Сумма' },
      { key: 'allocationDate', label: 'Дата выдачи' },
    ],
  },
  users: {
    key: 'users',
    label: 'Пользователи',
    fields: [
      { key: 'name', label: 'Имя' },
      { key: 'surname', label: 'Фамилия' },
      { key: 'login', label: 'Логин (Email)' },
      { key: 'phone', label: 'Телефон' },
      { key: 'roles', label: 'Роли' },
      { key: 'branchIds', label: 'ID Филиалов' },
      { key: 'blacklisted', label: 'В черном списке' },
    ],
  },
  branches: {
    key: 'branches',
    label: 'Филиалы',
    fields: [
      { key: 'name', label: 'Название' },
      { key: 'address', label: 'Адрес' },
      { key: 'head', label: 'Руководитель' },
      { key: 'userCount', label: 'Кол-во пользователей' },
      { key: 'status', label: 'Статус' },
    ],
  },
};
