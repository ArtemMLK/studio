'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Allocation } from '@/lib/types';
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
import { useAcceptedApplications } from '@/firebase/firestore/allocations';
import { useToast } from '@/hooks/use-toast';

interface AddAllocationDialogProps {
  onAllocationAdded: (newAllocation: Omit<Allocation, 'id'>) => void;
  triggerButton?: React.ReactNode;
}

const formSchema = z.object({
  applicationId: z.string({ required_error: 'Необходимо выбрать заявку.' }),
  amount: z.coerce.number().positive('Сумма должна быть положительным числом.'),
  allocationDate: z.date({
    required_error: 'Необходимо указать дату распределения.',
  }),
});

export function AddAllocationDialog({ onAllocationAdded, triggerButton }: AddAllocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { data: acceptedApps, loading: appsLoading } = useAcceptedApplications();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!acceptedApps) return;
    const selectedApp = acceptedApps.find(app => app.id === values.applicationId);
    if (!selectedApp) {
        toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Выбранная заявка не найдена. Пожалуйста, попробуйте снова.',
        });
        return;
    }
    
    const newAllocationData = {
      ...values,
      allocationDate: values.allocationDate.toISOString(),
      branchId: selectedApp.branchId,
      procurementId: selectedApp.procurementId,
      lotId: selectedApp.lotId,
    };
    onAllocationAdded(newAllocationData);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить распределение
        </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новое распределение</DialogTitle>
          <DialogDescription>
            Заполните данные для регистрации выдачи по принятой заявке.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="applicationId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Принятая заявка</FormLabel>
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
                            ? `${acceptedApps?.find(app => app.id === field.value)?.lotTitle} - ${acceptedApps?.find(app => app.id === field.value)?.userName}`
                            : 'Выберите заявку'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск по лоту или участнику..." />
                        <CommandList>
                            {appsLoading && <CommandEmpty>Загрузка...</CommandEmpty>}
                            <CommandEmpty>Принятые заявки не найдены.</CommandEmpty>
                            <CommandGroup>
                            {acceptedApps?.map((app) => (
                                <CommandItem
                                value={`${app.lotTitle} ${app.userName}`}
                                key={app.id}
                                onSelect={() => {
                                    form.setValue('applicationId', app.id)
                                    setPopoverOpen(false)
                                }}
                                >
                                <Check
                                    className={cn(
                                    'mr-2 h-4 w-4',
                                    app.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                />
                                {app.lotTitle} ({app.userName})
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
                  <FormLabel>Сумма выдачи</FormLabel>
                   <Input type="number" placeholder="50000" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allocationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата выдачи</FormLabel>
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
              <Button type="submit">Добавить распределение</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
