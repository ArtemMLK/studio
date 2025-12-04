
'use server';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { redirect } from 'next/navigation';
import { initializeFirebase } from '@/firebase/server';

// Initialize Firebase Admin SDK
const { auth } = initializeFirebase();

export async function login(
  prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('login') as string; // Assuming login is email
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Логин и пароль обязательны.' };
  }

  try {
    // We are using the login field as the email for authentication
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Firebase Auth Error:', error.code, error.message);
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      return { error: 'Неверный логин или пароль.' };
    }
    return { error: 'Произошла ошибка при входе. Попробуйте снова.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  // In a real application, you would invalidate the user's session here.
  // This might involve clearing a session cookie or token.
  await auth.signOut();
  redirect('/');
}
