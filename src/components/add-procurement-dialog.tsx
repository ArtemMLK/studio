'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ProcurementProcess, Branch } from '@/lib/types';
import { useBranches } from '@/firebase/firestore/branches';

import { Button } from '@/components/ui/button';
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
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


interface AddProcurementDialogProps {
  onProcurementAdded: (newProcurement: Omit<ProcurementProcess, 'id' | 'status' | 'lotCount' >) => void;
}

const formSchema = z.object({
  name: z.string().min(5, 'Название должно содержать не менее 5 символов.'),
  description: z.string().optional(),
  branchId: z.string({ required_error: 'Необходимо выбрать филиал.' }),
});

export function AddProcurementDialog({ onProcurementAdded }: AddProcurementDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { data: branches, loading: branchesLoading } = useBranches();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onProcurementAdded(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Новая закупка
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая закупочная процедура</DialogTitle>
          <DialogDescription>
            Заполните данные для создания новой закупки.
          </DialogDescription>
        </DialogHeader>
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
             <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Филиал-организатор</FormLabel>
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
                            ? branches.find(
                                (branch) => branch.id === field.value
                              )?.name
                            : 'Выберите филиал'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск филиала..." />
                        <CommandList>
                            {branchesLoading && <CommandEmpty>Загрузка...</CommandEmpty>}
                            <CommandEmpty>Филиал не найден.</CommandEmpty>
                            <CommandGroup>
                            {branches.map((branch) => (
                                <CommandItem
                                value={branch.name}
                                key={branch.id}
                                onSelect={() => {
                                    form.setValue('branchId', branch.id)
                                    setPopoverOpen(false)
                                }}
                                >
                                <Check
                                    className={cn(
                                    'mr-2 h-4 w-4',
                                    branch.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                />
                                {branch.name}
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
            <DialogFooter className="pt-4">
              <Button type="submit">Создать закупку</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
