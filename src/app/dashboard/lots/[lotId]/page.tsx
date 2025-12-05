'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Box, Edit, Trash2, Ban } from 'lucide-react';
import Link from 'next/link';

import { useLot } from '@/firebase/firestore/lots';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUserData } from '@/hooks/use-current-user-data';
import { Separator } from '@/components/ui/separator';

export default function LotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const lotId = params.lotId as string;

  const { data: lot, loading: lotLoading } = useLot(lotId);
  const { currentUserData } = useCurrentUserData();

  const canManage = currentUserData?.roles.includes('Администратор') || currentUserData?.roles.includes('Менеджер');


  if (lotLoading) {
    return (
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
             <Skeleton className="h-9 w-9" />
             <div className="grid gap-1.5">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
             </div>
        </div>
        <Card>
            <CardHeader className="p-0 border-b">
                <div className="relative h-64 w-full">
                    <Skeleton className="h-full w-full rounded-t-lg" />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                    <div className="grid gap-2 items-start">
                        <Skeleton className="h-10 w-32 ml-auto" />
                        <Skeleton className="h-10 w-32 ml-auto" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Лот не найден</h1>
        <p className="text-muted-foreground">
          Возможно, он был удален или вы перешли по неверной ссылке.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/lots">
            <ArrowLeft className="mr-2 h-4 w-4" />К списку лотов
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Назад</span>
          </Button>
          <div className="grid gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {lot.title}
            </h1>
            <p className="text-muted-foreground">Детальная информация о лоте</p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/lots/${lot.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Редактировать
                </Link>
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader className="p-0 border-b">
           <div className="relative h-64 w-full">
            <Image
                src={lot.imageUrl}
                alt={lot.title}
                fill
                className="rounded-t-lg object-cover"
                data-ai-hint={lot.imageHint}
            />
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Статус</p>
                        <Badge
                            variant="outline"
                            className={cn(
                            'mt-1',
                            lot.status === 'Активен' && 'border-green-500/50 text-green-400',
                            lot.status === 'Завершен' && 'border-gray-500/50 text-gray-400',
                            lot.status === 'Приостановлен' && 'border-yellow-500/50 text-yellow-400',
                            lot.status === 'Отменен' && 'border-red-500/50 text-red-400'
                            )}
                        >
                            {lot.status}
                        </Badge>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Начальная цена</p>
                        <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('ru-RU').format(lot.price)} {lot.currency}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">План (количество)</p>
                        <p className="font-medium">{lot.plan} шт.</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Крайний срок подачи заявок</p>
                        <p className="font-medium">{lot.deadline}</p>
                    </div>
                </div>
                 <div className="grid gap-4 items-start">
                     <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                         <h3 className="font-semibold mb-2">Принадлежность</h3>
                         <p className="text-sm">
                            <span className="text-muted-foreground">Закупка:</span>{' '}
                            <Link href={`/dashboard/procurements/${lot.procurementId}`} className="font-medium underline hover:text-primary">
                               {lot.procurementName || 'Загрузка...'}
                            </Link>
                         </p>
                         <p className="text-sm">
                            <span className="text-muted-foreground">Филиал:</span>{' '}
                            <span className="font-medium">{lot.branchName || 'Загрузка...'}</span>
                         </p>
                     </div>
                      {canManage && (
                        <>
                         <Separator />
                         <div className="grid gap-2">
                            <h3 className="font-semibold">Действия с лотом</h3>
                            <Button variant="outline">
                                <Ban className="mr-2 h-4 w-4" />
                                Изменить статус
                            </Button>
                             <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить лот
                            </Button>
                         </div>
                        </>
                    )}
                 </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
