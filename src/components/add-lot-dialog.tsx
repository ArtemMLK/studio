'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Lot } from '@/lib/types';
import { format } from 'date-fns';

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
import { Textarea } from './ui/textarea';

interface AddLotDialogProps {
  onLotAdded: (newLot: Omit<Lot, 'id' | 'status' | 'procurementId' | 'imageHint'>) => void;
}

const formSchema = z.object({
  title: z.string().min(5, 'Название должно содержать не менее 5 символов.'),
  price: z.coerce.number().positive('Цена должна быть положительным числом.'),
  deadline: z.date({
    required_error: 'Необходимо указать крайний срок.',
  }),
  imageUrl: z.string().url('Необходимо указать корректный URL изображения.'),
  currency: z.string().default('₽'),
});

export function AddLotDialog({ onLotAdded }: AddLotDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      price: 0,
      imageUrl: '',
      currency: '₽',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newLotData = {
        ...values,
        deadline: format(values.deadline, 'dd.MM.yyyy'),
    };
    onLotAdded(newLotData);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить лот
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Новый лот</DialogTitle>
          <DialogDescription>
            Заполните данные для создания нового лота.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название лота</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, 'Аренда офиса на год'" {...field} />
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
                     <Input type="number" placeholder="50000" {...field} className="pr-12" />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        {form.watch('currency')}
                     </div>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input placeholder="https://images.unsplash.com/..." {...field} />
                  </FormControl>
                   <FormDescription>
                    Вставьте ссылку на изображение для карточки лота.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Создать лот</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
