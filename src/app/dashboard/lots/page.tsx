'use client';

import Image from 'next/image';
import { Search, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Lot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLots } from '@/firebase/firestore/lots';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { addApplication } from '@/firebase/firestore/applications';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LotsPage() {
  const { data: lots, loading } = useLots();
  const { user } = useUser();
  const { toast } = useToast();

  const handleApply = (lot: Lot) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Вы должны быть авторизованы, чтобы подать заявку.',
      });
      return;
    }

    addApplication({
      lotId: lot.id,
      userId: user.uid,
      branchId: lot.branchId,
      procurementId: lot.procurementId,
    });

    toast({
      title: 'Заявка подана',
      description: `Ваша заявка на лот "${lot.title}" успешно отправлена.`,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Все Лоты</h1>
          <p className="text-muted-foreground">
            Просмотр и управление всеми доступными лотами в системе.
          </p>
        </div>
      </div>
      <div className="relative mt-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по всем лотам..." className="pl-8" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <Skeleton className="mb-2 h-5 w-20 rounded-full" />
                  <Skeleton className="mt-2 h-6 w-3/4" />
                  <Skeleton className="mt-2 h-7 w-1/2" />
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))
          : lots?.map((lot) => (
              <Card key={lot.id} className="flex flex-col">
                <CardHeader className="p-0">
                   <Link href={`/dashboard/lots/${lot.id}`}>
                    <div className="relative h-48 w-full">
                        <Image
                        src={lot.imageUrl}
                        alt={lot.title}
                        fill
                        className="cursor-pointer rounded-t-lg object-cover transition-transform hover:scale-105"
                        data-ai-hint={lot.imageHint}
                        />
                    </div>
                   </Link>
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
                      lot.status === 'Отменен' &&
                        'border-red-500/50 text-red-400'
                    )}
                  >
                    {lot.status}
                  </Badge>
                   <Link href={`/dashboard/lots/${lot.id}`} className="hover:underline">
                    <h3 className="font-semibold">{lot.title}</h3>
                   </Link>
                  <p className="mt-2 text-xl font-bold">
                    {new Intl.NumberFormat('ru-RU').format(lot.price)} {lot.currency}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    До: {lot.deadline}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApply(lot)}
                    disabled={!user || lot.status !== 'Активен'}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Подать заявку
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
       {lots && lots.length === 0 && !loading && (
        <div className="col-span-full mt-8 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Лотов пока нет</h3>
          <p className="text-muted-foreground mt-2">
            В системе еще не создано ни одного лота.
          </p>
        </div>
      )}
    </>
  );
}
