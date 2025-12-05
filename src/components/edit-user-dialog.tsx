'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { useBranches } from '@/firebase/firestore/branches';

interface EditUserDialogProps {
  user: User;
  onUserUpdated: (userId: string, updatedData: Partial<User>) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать не менее 2 символов.'),
  surname: z
    .string()
    .min(2, 'Фамилия должна содержать не менее 2 символов.'),
  login: z.string(), // Read-only, but keep for structure
  phone: z
    .string()
    .regex(
      /^7\d{10}$/,
      'Неверный формат телефона. Пример: 79991234567'
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
});

export function EditUserDialog({
  user,
  onUserUpdated,
  onOpenChange,
}: EditUserDialogProps) {
  const [open, setOpen] = useState(true);
  const [rolesPopoverOpen, setRolesPopoverOpen] = useState(false);
  const [branchesPopoverOpen, setBranchesPopoverOpen] = useState(false);

  const { data: branchesData, loading: branchesLoading } = useBranches(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      surname: user.surname,
      login: user.login,
      phone: user.phone,
      telegram: user.telegram || '',
      roles: Array.isArray(user.roles) ? user.roles : [user.roles],
      branchIds: user.branchIds,
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      surname: user.surname,
      login: user.login,
      phone: user.phone,
      telegram: user.telegram || '',
      roles: Array.isArray(user.roles) ? user.roles : [user.roles],
      branchIds: user.branchIds,
    });
  }, [user, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // We don't update login (email) or password here
    const { login, ...updateData } = values;
    onUserUpdated(user.id, updateData);
    handleClose();
  }

  const handleClose = () => {
    setOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Измените данные для пользователя {user.name} {user.surname}.
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
                  <FormLabel>Логин (Телефон)</FormLabel>
                  <FormControl>
                    <Input readOnly disabled {...field} />
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
                    <Input placeholder="79991234567" {...field} />
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
                                    form.setValue(
                                      'roles',
                                      currentValue.filter((r) => r !== role),
                                      { shouldValidate: true }
                                    );
                                  } else {
                                    form.setValue(
                                      'roles',
                                      [...currentValue, role],
                                      { shouldValidate: true }
                                    );
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
                          disabled={branchesLoading}
                        >
                          {field.value?.length
                            ? field.value.length > 2
                              ? `${field.value.length} филиалов выбрано`
                              : branchesData
                                  ?.filter((b) => field.value.includes(b.id))
                                  .map((b) => b.name)
                                  .join(', ')
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
                                value={branch.name}
                                key={branch.id}
                                onSelect={() => {
                                  const currentValue =
                                    form.getValues('branchIds');
                                  if (currentValue.includes(branch.id)) {
                                    form.setValue(
                                      'branchIds',
                                      currentValue.filter(
                                        (b) => b !== branch.id
                                      ),
                                      { shouldValidate: true }
                                    );
                                  } else {
                                    form.setValue(
                                      'branchIds',
                                      [...currentValue, branch.id],
                                      { shouldValidate: true }
                                    );
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value.includes(branch.id)
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
               <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit">Сохранить изменения</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
