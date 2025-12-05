'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useLot } from '@/firebase/firestore/lots';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddLotDialog } from '@/components/add-lot-dialog';
import type { Lot } from '@/lib/types';


export default function EditLotPage() {
  const params = useParams();
  const router = useRouter();
  const lotId = params.lotId as string;

  const { data: lot, loading: lotLoading } = useLot(lotId);

  const handleLotUpdated = (updatedLotData: Omit<Lot, 'id' | 'status'>) => {
    // Logic to update the lot will go here
    console.log('Updating lot:', updatedLotData);
    router.push(`/dashboard/lots/${lotId}`);
  };


  if (lotLoading) {
    return (
      <>
        <div className="flex items-center gap-4">
             <Skeleton className="h-9 w-9" />
             <div className="grid gap-1.5">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
             </div>
        </div>
        <div className="mt-6">
            <Skeleton className="h-[500px] w-full" />
        </div>
      </>
    );
  }

  if (!lot) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Лот не найден</h1>
        <p className="text-muted-foreground">
          Не удалось найти данные для редактирования.
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
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Назад</span>
        </Button>
        <div className="grid gap-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Редактировать лот
          </h1>
          <p className="text-muted-foreground">
            Изменение данных для "{lot.title}"
          </p>
        </div>
      </div>
      <div className="mt-6">
        {/* We are reusing the AddLotDialog component in an "edit" mode */}
        <AddLotDialog
            procurementId={lot.procurementId}
            branchId={lot.branchId}
            onLotAdded={handleLotUpdated} // The handler is for updates in this context
            editingLot={lot}
        />
      </div>
    </>
  );
}
