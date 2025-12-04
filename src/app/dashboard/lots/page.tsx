'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { AddLotDialog } from '@/components/add-lot-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { lots as initialLots } from '@/lib/mock-data';
import type { Lot } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>(initialLots);

  const handleLotAdded = (newLotData: Omit<Lot, 'id' | 'status' | 'procurementId'>) => {
     const newLot: Lot = {
      ...newLotData,
      id: `L${Math.random().toString(16).slice(2, 8)}`,
      status: 'Активен',
      procurementId: 'ЗАК-2024-002',
      imageHint: 'custom lot',
    };
    setLots((prev) => [newLot, ...prev]);
  };


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Лоты</h1>
          <p className="text-muted-foreground">
            Просмотр и управление доступными лотами.
          </p>
        </div>
        <div className="flex items-center space-x-2">
           <AddLotDialog onLotAdded={handleLotAdded} />
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по лотам..." className="pl-8" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lots.map((lot) => (
          <Card key={lot.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={lot.imageUrl}
                  alt={lot.title}
                  fill
                  className="rounded-t-lg object-cover"
                  data-ai-hint={lot.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <Badge
                variant="outline"
                className={cn(
                  'mb-2',
                  lot.status === 'Активен' &&
                    'border-green-500/50 text-green-400',
                  lot.status === 'Завершен' &&
                    'border-gray-500/50 text-gray-400',
                  lot.status === 'Приостановлен' &&
                    'border-yellow-500/50 text-yellow-400',
                  lot.status === 'Отменен' && 'border-red-500/50 text-red-400'
                )}
              >
                {lot.status}
              </Badge>
              <h3 className="font-semibold">{lot.title}</h3>
              <p className="mt-2 text-xl font-bold">
                {new Intl.NumberFormat('ru-RU').format(lot.price)} {lot.currency}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                До: {lot.deadline}
              </p>
              <Button variant="outline" size="sm">
                Подробнее
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
