
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
import { userRoles, type User, type UserRole, type Branch } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUsers } from '@/firebase/firestore/users';
import { useBranches } from '@/firebase/firestore/branches';

interface AddUserDialogProps {
  onUserAdded: (newUser: Omit<User, 'id'>, generatedPassword: string) => void;
}

export function AddUserDialog({
  onUserAdded,
}: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [rolesPopoverOpen, setRolesPopoverOpen] = useState(false);
  const [branchesPopoverOpen, setBranchesPopoverOpen] = useState(false);

  const { data: existingUsers } = useUsers();
  const { data: branchesData } = useBranches();
  
  const formSchema = useMemo(() => z.object({
    name: z.string().min(2, 'Имя должно содержать не менее 2 символов.'),
    surname: z
      .string()
      .min(2, 'Фамилия должна содержать не менее 2 символов.'),
    login: z // This is the email now
      .string()
      .email('Некорректный формат email.')
      .refine(
        (value) => !existingUsers?.some((user) => user.login === value),
        'Этот email уже используется.'
      ),
    phone: z
      .string()
      .regex(
        /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
        'Неверный формат телефона. Пример: +7 (999) 123-45-67'
      )
      .refine(
        (value) => !existingUsers?.some((user) => user.phone === value),
        'Этот телефон уже используется.'
      ),
    telegram: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.startsWith('@'),
        'Telegram должен начинаться с @'
      ),
    roles: z
      .array(z.string())
      .min(1, 'Необходимо выбрать хотя бы одну роль.'),
    branchIds: z
      .array(z.string())
      .min(1, 'Необходимо выбрать хотя бы один филиал.'),
  }), [existingUsers]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      login: '',
      phone: '',
      telegram: '',
      roles: [],
      branchIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const generatedPassword = Math.random().toString(36).slice(-8);

    const newUser: Omit<User, 'id'> = {
      ...values,
      roles: values.roles as UserRole[],
      blacklisted: false,
      avatar: `https://i.pravatar.cc/150?u=${values.login}`,
    };

    onUserAdded(newUser, generatedPassword);
    setOpen(false);
    form.reset();
  }

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
            сгенерирован автоматически. Логин должен быть email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фамилия</FormLabel>
                  <FormControl>
                    <Input placeholder="Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Логин (Email)</FormLabel>
                  <FormControl>
                    <Input placeholder="ivan.ivanov@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (999) 123-45-67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Telegram</FormLabel>
                  <FormControl>
                    <Input placeholder="@ivanov_i" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Роли</FormLabel>
                  <Popover
                    open={rolesPopoverOpen}
                    onOpenChange={setRolesPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between',
                            !field.value?.length && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.length
                            ? field.value.join(', ')
                            : 'Выберите роли'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск роли..." />
                        <CommandList>
                          <CommandEmpty>Роль не найдена.</CommandEmpty>
                          <CommandGroup>
                            {userRoles.map((role) => (
                              <CommandItem
                                value={role}
                                key={role}
                                onSelect={() => {
                                  const currentValue = form.getValues('roles');
                                  if (currentValue.includes(role)) {
                                    form.setValue('roles', currentValue.filter(r => r !== role), { shouldValidate: true });
                                  } else {
                                    form.setValue('roles', [...currentValue, role], { shouldValidate: true });
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value.includes(role)
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {role}
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
                            'justify-between',
                            !field.value?.length && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.length
                            ? field.value.length > 2
                              ? `${field.value.length} филиалов выбрано`
                              : field.value.join(', ')
                            : 'Выберите филиалы'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Поиск филиала..."
                        />
                        <CommandList>
                           <CommandEmpty>Филиал не найден.</CommandEmpty>
                          <CommandGroup>
                            {branchesData?.map((branch) => (
                              <CommandItem
                                value={branch.name}
                                key={branch.id}
                                onSelect={() => {
                                   const currentValue = form.getValues('branchIds');
                                   if (currentValue.includes(branch.name)) {
                                     form.setValue('branchIds', currentValue.filter(b => b !== branch.name), { shouldValidate: true });
                                   } else {
                                     form.setValue('branchIds', [...currentValue, branch.name], { shouldValidate: true });
                                   }
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value.includes(branch.name)
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
