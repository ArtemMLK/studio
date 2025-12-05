
'use server';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { initializeFirebase } from '@/firebase/server';
import { USERS_COLLECTION } from '@/lib/constants';

// Initialize Firebase Admin SDK
const { auth, firestore } = initializeFirebase();

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // After successful sign-in, check the user's document in Firestore
    const userDocRef = doc(firestore, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data()?.blacklisted === true) {
      await auth.signOut(); // Sign out the blacklisted user immediately
      return { error: 'Ваш аккаунт заблокирован.' };
    }
    
    // If user doc doesn't exist or user is not blacklisted, proceed to dashboard

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
