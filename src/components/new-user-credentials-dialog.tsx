'use client';

import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface NewUserCredentialsDialogProps {
  login: string;
  password;
  onClose: () => void;
}

export function NewUserCredentialsDialog({
  login,
  password,
  onClose,
}: NewUserCredentialsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Open the dialog once credentials are available
    if (login && password) {
      setIsOpen(true);
    }
  }, [login, password]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: `${fieldName} скопирован в буфер обмена.`,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    // Delay closing to allow dialog animation
    setTimeout(onClose, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Пользователь создан</DialogTitle>
          <DialogDescription>
            Сохраните и передайте эти данные для входа новому пользователю.
            Пароль больше не будет показан.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="login">Логин</Label>
            <div className="flex items-center gap-2">
              <Input id="login" value={login} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(login, 'Логин')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Временный пароль</Label>
            <div className="flex items-center gap-2">
              <Input id="password" value={password} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password, 'Пароль')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
