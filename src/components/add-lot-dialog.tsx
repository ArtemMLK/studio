'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Lot } from '@/lib/types';
import { format, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface AddLotDialogProps {
  onLotAdded: (newLot: Omit<Lot, 'id' | 'status' | 'imageHint'>) => void;
  procurementId: string;
  branchId: string;
  triggerButton?: React.ReactNode;
  editingLot?: Lot; // Make this optional for edit mode
}

const formSchema = z.object({
  title: z.string().min(5, 'Название должно содержать не менее 5 символов.'),
  procurementId: z.string(),
  branchId: z.string(),
  plan: z.coerce.number().positive('План должен быть положительным числом.'),
  price: z.coerce.number().positive('Цена должна быть положительным числом.'),
  deadline: z.date({
    required_error: 'Необходимо указать крайний срок.',
  }),
  imageUrl: z.string().url('Необходимо указать корректный URL изображения.'),
  currency: z.string().default('₽'),
});

export function AddLotDialog({
  onLotAdded,
  procurementId,
  branchId,
  triggerButton,
  editingLot,
}: AddLotDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!editingLot;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const deadlineDate = editingLot?.deadline
      ? parse(editingLot.deadline, 'dd.MM.yyyy', new Date())
      : undefined;

    form.reset({
      title: editingLot?.title || '',
      procurementId: editingLot?.procurementId || procurementId,
      branchId: editingLot?.branchId || branchId,
      plan: editingLot?.plan || 1,
      price: editingLot?.price || 0,
      deadline: deadlineDate,
      imageUrl: editingLot?.imageUrl || '',
      currency: editingLot?.currency || '₽',
    });
  }, [editingLot, procurementId, branchId, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const lotData = {
      ...values,
      deadline: format(values.deadline, 'dd.MM.yyyy'),
    };
    onLotAdded(lotData);
    if (!isEditMode) {
      setOpen(false);
      form.reset();
    }
  }

  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название лота</FormLabel>
              <FormControl>
                <Input
                  placeholder="Например, 'Аренда офиса на год'"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>План (кол-во)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Начальная цена</FormLabel>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="50000"
                    {...field}
                    className="pr-12"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                    {form.watch('currency')}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Крайний срок подачи заявок</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd.MM.yyyy')
                      ) : (
                        <span>Выберите дату</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL изображения</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Вставьте ссылку на изображение для карточки лота.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="procurementId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormLabel>ID Закупки</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormLabel>ID Филиала</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="submit">{isEditMode ? 'Сохранить изменения' : 'Создать лот'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // If in edit mode, render the form directly without a dialog
  if (isEditMode) {
    return (
        <Card>
            <CardContent className="pt-6">
                {dialogContent}
            </CardContent>
        </Card>
    );
  }

  // Otherwise, render the dialog with a trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? (
          triggerButton
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить лот
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый лот</DialogTitle>
          <DialogDescription>
            Заполните данные для создания нового лота.
          </DialogDescription>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}
