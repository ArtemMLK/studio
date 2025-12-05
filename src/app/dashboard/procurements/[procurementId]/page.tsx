'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Box, PlusCircle, MoreHorizontal, Edit } from 'lucide-react';
import Link from 'next/link';

import { useProcurementProcess } from '@/firebase/firestore/procurements';
import { useLotsByProcurement, addLot } from '@/firebase/firestore/lots';
import type { Lot } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddLotDialog } from '@/components/add-lot-dialog';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirestore } from '@/firebase';

export default function ProcurementDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const procurementId = params.procurementId as string;
  const firestore = useFirestore();

  const { data: procurement, loading: procurementLoading } =
    useProcurementProcess(procurementId);
  const { data: lots, loading: lotsLoading } =
    useLotsByProcurement(procurementId);
  const { currentUserData } = useCurrentUserData();

  const canManage =
    currentUserData?.roles.includes('Администратор') ||
    currentUserData?.roles.includes('Менеджер');

  const handleLotAdded = (newLotData: Omit<Lot, 'id' | 'status'>) => {
    // A more robust solution might involve using a placeholder image from a predefined list
    const placeholderImages = [
      'https://images.unsplash.com/photo-1586991339349-10a87b26c632?w=500',
      'https://images.unsplash.com/photo-1560518883-ce09059ee353?w=500',
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500',
    ];
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    addLot(firestore, {
      ...newLotData,
      status: 'Активен',
      imageUrl: newLotData.imageUrl || randomImage,
      imageHint: 'custom lot',
    });
    // Maybe update the lotCount on the procurement doc in the future
  };

  if (procurementLoading) {
    return (
      <>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="grid gap-1.5">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!procurement) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Закупка не найдена</h1>
        <p className="text-muted-foreground">
          Возможно, она была удалена или вы перешли по неверной ссылке.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/procurements">
            <ArrowLeft className="mr-2 h-4 w-4" />К списку закупок
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/procurements">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Назад</span>
            </Link>
          </Button>
          <div className="grid gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {procurement.name}
            </h1>
            <p className="text-muted-foreground">{procurement.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {canManage && (
            <AddLotDialog
                procurementId={procurementId}
                branchId={procurement.branchId}
                onLotAdded={handleLotAdded}
                triggerButton={
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Добавить Лот
                </Button>
                }
            />
            )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Меню действий</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                    {canManage && (
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/procurements/${procurementId}/edit`}>
                             <Edit className="mr-2 h-4 w-4" />
                             Редактировать
                           </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Лоты в закупке</CardTitle>
            <CardDescription>
              Все лоты, относящиеся к данной закупочной процедуре.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lotsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
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
                ))}
              </div>
            ) : lots && lots.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {lots.map((lot) => (
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
                            'border-green-500/50 text-green-400'
                        )}
                      >
                        {lot.status}
                      </Badge>
                       <Link href={`/dashboard/lots/${lot.id}`} className="hover:underline">
                        <h3 className="font-semibold">{lot.title}</h3>
                       </Link>
                      <p className="mt-2 text-xl font-bold">
                        {new Intl.NumberFormat('ru-RU').format(lot.price)}{' '}
                        {lot.currency}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0">
                      <p className="text-xs text-muted-foreground">
                        До: {lot.deadline}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/lots/${lot.id}`}>Подробнее</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                <Box className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">
                  В этой закупке пока нет лотов
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Начните с добавления первого лота.
                </p>
                <div className="mt-4">
                  {canManage && (
                    <AddLotDialog
                      procurementId={procurementId}
                      branchId={procurement.branchId}
                      onLotAdded={handleLotAdded}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
