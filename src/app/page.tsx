'use client';

import { Handshake } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

import { useAuth, useFirestore } from '@/firebase';
import { USERS_COLLECTION } from '@/lib/constants';

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

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);


  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!phone || !password) {
      setError('Телефон и пароль обязательны.');
      setLoading(false);
      return;
    }
    
    // Transform phone to email format for Firebase Auth
    const email = `${phone.replace(/\D/g, '')}@proflow.com`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After successful sign-in, check the user's document in Firestore
      const userDocRef = doc(firestore, USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data()?.blacklisted === true) {
        await auth.signOut(); // Sign out the blacklisted user immediately
        setError('Ваш аккаунт заблокирован.');
      } else {
        // Successful login, onAuthStateChanged will handle the redirect
      }
    } catch (error: any) {
      console.error('Firebase Auth Error:', error.code, error.message);
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setError('Неверный логин или пароль.');
      } else {
        setError('Произошла ошибка при входе. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

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
              Введите ваш номер телефона и пароль для доступа
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Логин (Телефон)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="79991234567"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
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
