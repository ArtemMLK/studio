'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Receipt, Lot } from '@/lib/types';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useLots } from '@/firebase/firestore/lots';
import { useToast } from '@/hooks/use-toast';

interface AddReceiptDialogProps {
  onReceiptAdded: (newReceipt: Omit<Receipt, 'id'>) => void;
  triggerButton?: React.ReactNode;
}

const formSchema = z.object({
  lotId: z.string({ required_error: 'Необходимо выбрать лот.' }),
  amount: z.coerce.number().positive('Сумма должна быть положительным числом.'),
  receiptDate: z.date({
    required_error: 'Необходимо указать дату поступления.',
  }),
  currency: z.string().default('RUB'),
});

export function AddReceiptDialog({ onReceiptAdded, triggerButton }: AddReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { data: lots, loading: lotsLoading } = useLots();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      currency: 'RUB',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedLot = lots.find(lot => lot.id === values.lotId);
    if (!selectedLot) {
        toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Выбранный лот не найден. Пожалуйста, попробуйте снова.',
        });
        return;
    }
    
    const newReceiptData = {
      ...values,
      receiptDate: values.receiptDate.toISOString(),
      // Denormalize data from the selected lot
      branchId: selectedLot.branchId,
      procurementId: selectedLot.procurementId,
    };
    onReceiptAdded(newReceiptData);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить поступление
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новое поступление</DialogTitle>
          <DialogDescription>
            Заполните данные для регистрации нового финансового поступления.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="lotId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Лот</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? lots.find(
                                (lot) => lot.id === field.value
                              )?.title
                            : 'Выберите лот'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск лота..." />
                        <CommandList>
                            {lotsLoading && <CommandEmpty>Загрузка...</CommandEmpty>}
                            <CommandEmpty>Лот не найден.</CommandEmpty>
                            <CommandGroup>
                            {lots.map((lot) => (
                                <CommandItem
                                value={lot.title}
                                key={lot.id}
                                onSelect={() => {
                                    form.setValue('lotId', lot.id)
                                    setPopoverOpen(false)
                                }}
                                >
                                <Check
                                    className={cn(
                                    'mr-2 h-4 w-4',
                                    lot.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                />
                                {lot.title}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма</FormLabel>
                  <div className="relative">
                    <Input type="number" placeholder="100000" {...field} className="pr-12" />
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
              name="receiptDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата поступления</FormLabel>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Добавить поступление</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
