'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useProcurementProcess } from '@/firebase/firestore/procurements';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// We can reuse the AddProcurementDialog or create a dedicated Edit component later
// For now, this is a placeholder page.

export default function EditProcurementPage() {
  const params = useParams();
  const procurementId = params.procurementId as string;
  const router = useRouter();

  const { data: procurement, loading: procurementLoading } =
    useProcurementProcess(procurementId);

  if (procurementLoading) {
    return (
      <>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
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
          Не удалось найти данные для редактирования.
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Назад</span>
        </Button>
        <div className="grid gap-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Редактировать закупку
          </h1>
          <p className="text-muted-foreground">
            Изменение данных для "{procurement.name}"
          </p>
        </div>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Форма редактирования</CardTitle>
            <CardDescription>
              Здесь будет форма для редактирования закупки.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p>Форма в разработке.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
