'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useProcurementProcess, updateProcurementProcess } from '@/firebase/firestore/procurements';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ProcurementProcess } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(5, 'Название должно содержать не менее 5 символов.'),
  description: z.string().optional(),
});


export default function EditProcurementPage() {
  const params = useParams();
  const procurementId = params.procurementId as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data: procurement, loading: procurementLoading } =
    useProcurementProcess(procurementId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (procurement) {
      form.reset({
        name: procurement.name,
        description: procurement.description || '',
      });
    }
  }, [procurement, form]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!procurement) return;

    updateProcurementProcess(procurement.branchId, procurement.id, values);
    toast({
        title: 'Закупка обновлена',
        description: `Данные закупки "${values.name}" успешно обновлены.`
    });
    router.push(`/dashboard/procurements/${procurement.id}`);
  };


  if (procurementLoading) {
    return (
      <>
        <div className="flex items-center gap-4">
             <Skeleton className="h-9 w-9" />
             <div className="grid gap-1.5">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
             </div>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
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
              Обновите необходимую информацию о закупочной процедуре.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Название закупки</FormLabel>
                        <FormControl>
                            <Input placeholder="Например, 'Закупка канцтоваров на Q3'" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Краткое описание цели и предмета закупки" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button>
                        <Button type="submit">Сохранить изменения</Button>
                    </div>
                </form>
             </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
