'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { userRoles, type User, type UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUsers } from '@/firebase/firestore/users';
import { useBranches } from '@/firebase/firestore/branches';

interface AddUserDialogProps {
  onUserAdded: (newUser: Omit<User, 'id'>, generatedPassword: string) => void;
}

// 1. Обновленная Zod-схема
const formSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать не менее 2 символов.'),
  surname: z
    .string()
    .min(2, 'Фамилия должна содержать не менее 2 символов.'),
  phone: z
    .string()
    .regex(/^7\d{10}$/, 'Неверный формат телефона. Пример: 79991234567'),
  telegram: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.startsWith('@'),
      'Telegram должен начинаться с @'
    ),
  // Zod теперь явно проверяет, что каждая роль в массиве
  // является одной из строк в константе userRoles.
  roles: z.array(z.enum(userRoles)).min(1, 'Необходимо выбрать хотя бы одну роль.'),
  branchIds: z.array(z.string()).min(1, 'Необходимо выбрать хотя бы один филиал.'),
});

// Добавляем проверку на уникальность телефона в схему отдельно,
// так как она зависит от данных, загруженных хуком.
const getFinalSchema = (existingUsers: User[] | null) => {
    return formSchema.extend({
        phone: formSchema.shape.phone.refine(
            (value) => !existingUsers?.some((user) => user.phone === value),
            'Этот телефон уже используется.'
        ),
    });
};


export function AddUserDialog({
  onUserAdded,
}: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [rolesPopoverOpen, setRolesPopoverOpen] = useState(false);
  const [branchesPopoverOpen, setBranchesPopoverOpen] = useState(false);

  const { data: existingUsers } = useUsers();
  const { data: branchesData } = useBranches(true);

  const finalFormSchema = useMemo(() => getFinalSchema(existingUsers), [existingUsers]);

  const form = useForm<z.infer<typeof finalFormSchema>>({
    resolver: zodResolver(finalFormSchema),
    defaultValues: {
      name: '',
      surname: '',
      phone: '',
      telegram: '',
      roles: [],
      branchIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof finalFormSchema>) {
    console.log("SUBMIT values:", values);
    const generatedPassword = Math.random().toString(36).slice(-8);

    const newUser: Omit<User, 'id'> = {
      ...values,
      login: values.phone,
      blacklisted: false,
      avatar: `https://i.pravatar.cc/150?u=${values.phone}`,
    };

    onUserAdded(newUser, generatedPassword);
    setOpen(false);
    form.reset();
  }

  // 2. Переписанные обработчики и JSX
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
          <DialogDescription>
            Заполните данные для создания нового пользователя. Пароль будет
            сгенерирован автоматически. Логином является номер телефона.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4 py-4"
          >
            {/* Поля name, surname, phone, telegram без изменений */}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Имя</FormLabel><FormControl><Input placeholder="Иван" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="surname" render={({ field }) => ( <FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input placeholder="Иванов" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Телефон (Логин)</FormLabel><FormControl><Input placeholder="79991234567" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="telegram" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Telegram</FormLabel><FormControl><Input placeholder="@ivanov_i" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            
            {/* Временная реализация ролей через чекбоксы */}
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => {
                console.log("FIELD ROLES RENDER", field.value);
                return (
                  <FormItem className="col-span-2">
                    <FormLabel>Роли (тест)</FormLabel>
                    <div className="flex flex-col gap-2 rounded-md border p-2">
                      {userRoles.map((role) => {
                        const checked = Array.isArray(field.value) && field.value.includes(role);
                        return (
                          <label key={role} className="flex items-center gap-2 font-normal cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => {
                                const current = Array.isArray(field.value) ? field.value : [];
                                const updated = checked
                                  ? current.filter((r) => r !== role)
                                  : [...current, role];

                                console.log("ROLE CHECKBOX TOGGLE", { role, before: current, after: updated });
                                field.onChange(updated);
                              }}
                            />
                            <span>{role}</span>
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />


            {/* Блок для выбора филиалов */}
            <FormField
              control={form.control}
              name="branchIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Филиалы</FormLabel>
                  <Popover
                    open={branchesPopoverOpen}
                    onOpenChange={setBranchesPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between overflow-hidden text-ellipsis',
                            !field.value?.length && 'text-muted-foreground'
                          )}
                        >
                           {field.value?.length
                            ? field.value.length > 2
                              ? `${field.value.length} филиалов выбрано`
                              : branchesData?.filter(b => field.value.includes(b.id)).map(b => b.name).join(', ')
                            : 'Выберите филиалы'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск филиала..." />
                        <CommandList>
                           <CommandEmpty>Филиал не найден.</CommandEmpty>
                          <CommandGroup>
                            {branchesData?.map((branch) => (
                              <CommandItem
                                value={branch.id}
                                key={branch.id}
                                onSelect={(currentValue) => {
                                   const current = field.value ?? [];
                                   const updated = current.includes(currentValue)
                                    ? current.filter(id => id !== currentValue)
                                    : [...current, currentValue];
                                  
                                   console.log("BRANCH SELECT", { clicked: currentValue, before: current, after: updated });
                                   field.onChange(updated);
                                }}
                                className={cn(
                                  "cursor-pointer",
                                  field.value?.includes(branch.id) && "bg-muted"
                                )}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value?.includes(branch.id)
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

            <DialogFooter className="col-span-2 mt-4">
              <Button type="submit">Создать пользователя</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
