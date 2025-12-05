
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

// This server action is no longer used for login, but kept for logout functionality.

export async function logout() {
  // Client-side sign out is handled by onAuthStateChanged listener,
  // but we can call this to clear the server-side session if any.
  // In this app setup, the main logic is on the client.
  // For a robust app, you'd manage server sessions, but here we just redirect.
  redirect('/');
}
