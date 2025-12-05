'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Receipt as ReceiptIcon, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceipts, addReceipt } from '@/firebase/firestore/receipts';
import { AddReceiptDialog } from '@/components/add-receipt-dialog';
import type { Receipt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';


export default function ReceiptsPage() {
  const { data: receipts, loading } = useReceipts();
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleReceiptAdded = (newReceiptData: Omit<Receipt, 'id'>) => {
    addReceipt(firestore, newReceiptData);
    toast({
        title: 'Поступление добавлено',
        description: `Новое поступление на сумму ${newReceiptData.amount} ${newReceiptData.currency} зарегистрировано.`
    });
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Поступления</h1>
          <p className="text-muted-foreground">
            Просмотр и учет поступлений по лотам.
          </p>
        </div>
        <AddReceiptDialog onReceiptAdded={handleReceiptAdded} />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список поступлений</CardTitle>
          <CardDescription>
            Денежные средства, полученные по заявкам.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата поступления</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : receipts && receipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Лот</TableHead>
                  <TableHead>Филиал</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата поступления</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.lotTitle}
                    </TableCell>
                    <TableCell>{receipt.branchName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: receipt.currency || 'RUB',
                      }).format(receipt.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(receipt.receiptDate).toLocaleDateString(
                        'ru-RU'
                      )}
                    </TableCell>
                    <TableCell>
                       <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Меню</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <ReceiptIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Поступлений пока нет</h3>
              <p className="text-muted-foreground mt-2">
                Здесь будут отображаться все финансовые поступления.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
