'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

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
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { userRoles, type User, type UserRole, type Branch } from '@/lib/types';
import { useUsers } from '@/firebase/firestore/users';
import { useBranches } from '@/firebase/firestore/branches';

interface AddUserDialogProps {
  onUserAdded: (newUser: Omit<User, 'id'>, generatedPassword: string) => void;
}

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
  roles: z
    .array(z.enum(userRoles))
    .min(1, 'Необходимо выбрать хотя бы одну роль.'),
  branchIds: z
    .array(z.string())
    .min(1, 'Необходимо выбрать хотя бы один филиал.'),
});

const getFinalSchema = (existingUsers: User[] | null) =>
  formSchema.extend({
    phone: formSchema.shape.phone.refine(
      (value) => !existingUsers?.some((user) => user.phone === value),
      'Этот телефон уже используется.'
    ),
  });

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: existingUsers } = useUsers();
  const { data: branchesData } = useBranches(true);

  const finalFormSchema = useMemo(
    () => getFinalSchema(existingUsers),
    [existingUsers]
  );

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
    console.log('SUBMIT values:', values);
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

  const branches: Branch[] = branchesData ?? [];

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
            <Controller
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

            <Controller
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

            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Телефон (Логин)</FormLabel>
                  <FormControl>
                    <Input placeholder="79991234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
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

            {/* Роли: простой мульти-выбор чекбоксами */}
            <Controller
              control={form.control}
              name="roles"
              render={({ field }) => {
                const value = Array.isArray(field.value) ? field.value : [];
                console.log('FIELD ROLES RENDER', value);
                return (
                  <FormItem className="col-span-2">
                    <FormLabel>Роли</FormLabel>
                    <div className="flex flex-col gap-2 rounded-md border p-2">
                      {userRoles.map((role) => {
                        const checked = value.includes(role);
                        return (
                          <label
                            key={role}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => {
                                const updated = checked
                                  ? value.filter((r) => r !== role)
                                  : [...value, role as UserRole];
                                console.log('ROLE TOGGLE', {
                                  role,
                                  before: value,
                                  after: updated,
                                });
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
                );
              }}
            />

            {/* Филиалы: такой же мульти-выбор чекбоксами */}
            <Controller
              control={form.control}
              name="branchIds"
              render={({ field }) => {
                const value = Array.isArray(field.value) ? field.value : [];
                console.log('FIELD BRANCHIDS RENDER', value);
                return (
                  <FormItem className="col-span-2">
                    <FormLabel>Филиалы</FormLabel>
                    <div className="flex flex-col gap-2 rounded-md border p-2 max-h-56 overflow-y-auto">
                      {branches.map((branch) => {
                        const checked = value.includes(branch.id);
                        return (
                          <label
                            key={branch.id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => {
                                const updated = checked
                                  ? value.filter((id) => id !== branch.id)
                                  : [...value, branch.id];
                                console.log('BRANCH TOGGLE', {
                                  id: branch.id,
                                  before: value,
                                  after: updated,
                                });
                                field.onChange(updated);
                              }}
                            />
                            <span>{branch.name}</span>
                          </label>
                        );
                      })}
                      {branches.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Нет доступных филиалов.
                        </span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
