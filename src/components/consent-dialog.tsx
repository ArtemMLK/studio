'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

export function ConsentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const consentGiven = sessionStorage.getItem('consentGiven');
    if (!consentGiven) {
      setIsOpen(true);
    }
  }, []);

  const handleContinue = () => {
    if (isChecked) {
      sessionStorage.setItem('consentGiven', 'true');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Подтверждение согласия</DialogTitle>
          <DialogDescription>
            Пожалуйста, ознакомьтесь и примите следующие документы для
            продолжения работы.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              <a href="#" className="underline hover:text-primary">
                Пользовательское соглашение
              </a>
            </li>
            <li>
              <a href="#" className="underline hover:text-primary">
                Политика конфиденциальности
              </a>
            </li>
            <li>
              <a href="#" className="underline hover:text-primary">
                Правила совместных закупок
              </a>
            </li>
          </ul>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="terms"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(Boolean(checked))}
            />
            <Label htmlFor="terms" className="text-sm font-medium leading-none">
              Я прочитал(а) и принимаю все условия
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleContinue} disabled={!isChecked}>
            Продолжить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
