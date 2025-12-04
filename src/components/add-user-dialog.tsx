'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { useState } from 'react';
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
import { branches as initialBranches, userRoles, type User, type UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddUserDialogProps {
  onUserAdded: (newUser: User) => void;
  existingUsers: User[];
}

export function AddUserDialog({
  onUserAdded,
  existingUsers,
}: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [rolesPopoverOpen, setRolesPopoverOpen] = useState(false);
  const [branchesPopoverOpen, setBranchesPopoverOpen] = useState(false);

  const [branches, setBranches] = useState<string[]>(initialBranches);
  const [newBranch, setNewBranch] = useState('');

  const formSchema = z.object({
    name: z.string().min(2, 'Имя должно содержать не менее 2 символов.'),
    surname: z
      .string()
      .min(2, 'Фамилия должна содержать не менее 2 символов.'),
    login: z
      .string()
      .min(3, 'Логин должен содержать не менее 3 символов.')
      .refine(
        (value) => !existingUsers.some((user) => user.login === value),
        'Этот логин уже используется.'
      ),
    phone: z
      .string()
      .regex(
        /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
        'Неверный формат телефона. Пример: +7 (999) 123-45-67'
      )
      .refine(
        (value) => !existingUsers.some((user) => user.phone === value),
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
    branches: z
      .array(z.string())
      .min(1, 'Необходимо выбрать хотя бы один филиал.'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      login: '',
      phone: '',
      telegram: '',
      roles: [],
      branches: [],
    },
  });

  function handleCreateNewBranch() {
    if (newBranch && !branches.includes(newBranch)) {
      const updatedBranches = [...branches, newBranch];
      setBranches(updatedBranches);
      form.setValue('branches', [...form.getValues('branches'), newBranch]);
      setNewBranch('');
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newId = Math.max(...existingUsers.map((u) => u.id), 0) + 1;

    const newUser: User = {
      id: newId,
      ...values,
      roles: values.roles as UserRole[],
      isBlacklisted: false,
      avatar: `https://i.pravatar.cc/150?u=${values.login}`,
    };

    onUserAdded(newUser);
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
            сгенерирован автоматически.
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
                  <FormLabel>Логин</FormLabel>
                  <FormControl>
                    <Input placeholder="ivanov.i" {...field} />
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
                                  const currentRoles = form.getValues('roles');
                                  const newValue = currentRoles.includes(role)
                                    ? currentRoles.filter((r) => r !== role)
                                    : [...currentRoles, role];
                                  form.setValue('roles', newValue);
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
              name="branches"
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
                      <Command onValueChange={setNewBranch} value={newBranch}>
                        <CommandInput placeholder="Поиск или создание..." />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={handleCreateNewBranch}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Создать филиал "{newBranch}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {branches.map((branch) => (
                              <CommandItem
                                value={branch}
                                key={branch}
                                onSelect={() => {
                                  const currentBranches = form.getValues('branches');
                                  const newValue = currentBranches.includes(branch)
                                    ? currentBranches.filter(
                                        (b) => b !== branch
                                      )
                                    : [...currentBranches, branch];
                                  form.setValue('branches', newValue);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value.includes(branch)
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {branch}
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
