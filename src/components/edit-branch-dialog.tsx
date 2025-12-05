'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Branch } from '@/lib/types';

import { Button } from '@/components/ui/button';
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

interface EditBranchDialogProps {
  branch: Branch;
  onBranchUpdated: (branchId: string, updatedData: Omit<Branch, 'id' | 'userCount' | 'status'>) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(3, 'Название должно содержать не менее 3 символов.'),
    address: z.string().min(5, 'Адрес должен содержать не менее 5 символов.'),
    head: z.string().min(2, 'ФИО руководителя должно содержать не менее 2 символов.'),
});

export function EditBranchDialog({ branch, onBranchUpdated, onOpenChange }: EditBranchDialogProps) {
  const [open, setOpen] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: branch.name,
      address: branch.address,
      head: branch.head,
    },
  });
  
  useEffect(() => {
      form.reset({
        name: branch.name,
        address: branch.address,
        head: branch.head,
      });
  }, [branch, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onBranchUpdated(branch.id, values);
    handleClose();
  }

  const handleClose = () => {
    setOpen(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать филиал</DialogTitle>
          <DialogDescription>
            Обновите данные для филиала.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder='Филиал "Центр"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input placeholder="г. Москва, ул. Тверская, д. 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="head"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Руководитель</FormLabel>
                  <FormControl>
                    <Input placeholder="Сергеев С.С." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>Отмена</Button>
              <Button type="submit">Сохранить изменения</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
