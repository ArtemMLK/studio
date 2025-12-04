'use client';

import { Handshake } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Вход...' : 'Войти'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, dispatch] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-primary">
          <Handshake className="h-8 w-8 text-accent" />
          <h1>ProcurementFlow</h1>
        </div>
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Вход в систему</CardTitle>
            <CardDescription>
              Введите ваш логин и пароль для доступа
            </CardDescription>
          </CardHeader>
          <form action={dispatch}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="ваш-логин"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {state?.error && (
                <p className="text-sm font-medium text-destructive">{state.error}</p>
              )}
            </CardContent>
            <CardFooter>
              <LoginButton />
            </CardFooter>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ProcurementFlow. Все права защищены.
        </p>
      </div>
    </main>
  );
}
