'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConsentDialog } from '@/components/consent-dialog';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useProcurementProcesses } from '@/firebase/firestore/procurements';
import { useLots } from '@/firebase/firestore/lots';
import { Box, FileClock, LineChart, ShoppingBasket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const chartData = [
  { month: 'Январь', receipts: 186, allocations: 80 },
  { month: 'Февраль', receipts: 305, allocations: 200 },
  { month: 'Март', receipts: 237, allocations: 120 },
  { month: 'Апрель', receipts: 273, allocations: 190 },
  { month: 'Май', receipts: 209, allocations: 130 },
  { month: 'Июнь', receipts: 214, allocations: 140 },
];

const chartConfig = {
  receipts: {
    label: 'Поступления',
    color: 'hsl(var(--chart-2))',
  },
  allocations: {
    label: 'Выдачи',
    color: 'hsl(var(--chart-5))',
  },
};

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

  const loading = procurementsLoading || lotsLoading;

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
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Обзор поступлений и выдач</CardTitle>
            <CardDescription>Динамика за последние 6 месяцев</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="receipts"
                    fill="hsl(var(--chart-2))"
                    radius={4}
                  />
                  <Bar
                    dataKey="allocations"
                    fill="hsl(var(--chart-5))"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div> */}
    </>
  );
}
