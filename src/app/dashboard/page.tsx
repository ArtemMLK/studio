'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConsentDialog } from '@/components/consent-dialog';
import { useProcurementProcesses } from '@/firebase/firestore/procurements';
import { useLots } from '@/firebase/firestore/lots';
import { Box, FileClock, ShoppingBasket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranchSelection } from '@/hooks/use-branch-selection.tsx';

export default function Dashboard() {
  const { data: procurements, loading: procurementsLoading } =
    useProcurementProcesses();
  const { data: lots, loading: lotsLoading } = useLots();

  const activeProcurements =
    procurements?.filter((p) => p.status === 'Активен').length || 0;
  const totalLots = lots?.length || 0;
  const totalPlan = lots?.reduce((sum, lot) => sum + lot.plan, 0) || 0;

  const kpis = [
    {
      title: 'Активные закупки',
      value: activeProcurements.toString(),
      icon: ShoppingBasket,
      description: 'Количество текущих закупочных процедур.',
      loading: procurementsLoading,
    },
    {
      title: 'Лоты в системе',
      value: totalLots.toString(),
      icon: Box,
      description: 'Общее количество лотов в системе.',
      loading: lotsLoading,
    },
    {
      title: 'Общий план по лотам',
      value: new Intl.NumberFormat('ru-RU').format(totalPlan),
      icon: FileClock,
      description: 'Суммарное плановое количество по всем лотам.',
      loading: lotsLoading,
    },
  ];

  return (
    <>
      <ConsentDialog />
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {kpi.loading ? (
                <Skeleton className="mt-1 h-7 w-24" />
              ) : (
                <div className="text-2xl font-bold">{kpi.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
