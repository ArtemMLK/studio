'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { kpis } from '@/lib/mock-data';
import { ConsentDialog } from '@/components/consent-dialog';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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
  return (
    <>
      <ConsentDialog />
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.slice(0, 3).map((kpi) => (
           <Card key={kpi.title} className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Обзор поступлений и выдач</CardTitle>
             <CardDescription>Динамика за последние 6 месяцев</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend />
                  <Bar dataKey="receipts" fill="hsl(var(--chart-2))" radius={4} />
                  <Bar dataKey="allocations" fill="hsl(var(--chart-5))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
         <div className="col-span-3 grid grid-rows-3 gap-4">
            {kpis.slice(3).map((kpi) => (
              <Card key={kpi.title} className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                   <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
