'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeClientFirebase } from '@/firebase';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { USERS_COLLECTION } from '@/lib/constants';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeClientFirebase();
  }, []);

  useEffect(() => {
    const bootstrapAdmin = async () => {
      const { auth, firestore } = firebaseServices;
      const adminEmail = 'admin@proflow.com';
      const adminPassword = 'password';

      try {
        let adminAuthUser: User | null = null;

        // 1. Try to sign in first
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            adminEmail,
            adminPassword
          );
          adminAuthUser = userCredential.user;
          console.log('Admin already exists and is signed in for check.');
        } catch (error: any) {
          // If user does not exist, create them.
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            console.log('Admin user not found in Auth, creating...');
            try {
              const userCredential = await createUserWithEmailAndPassword(
                auth,
                adminEmail,
                adminPassword
              );
              adminAuthUser = userCredential.user;
              console.log('Admin user created in Auth successfully.');
            } catch (createError: any) {
              console.error('Failed to create admin user in Auth:', createError);
              return; // Stop if we can't create the user
            }
          } else {
            // For other sign-in errors, log and exit
            console.error('Error signing in admin for check:', error);
            return;
          }
        }
        
        if (!adminAuthUser) {
            console.error("Could not get admin user object.");
            return;
        }

        // 2. We have an authenticated admin user, check their Firestore document
        const adminUid = adminAuthUser.uid;
        const userDocRef = doc(firestore, USERS_COLLECTION, adminUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log('Admin Firestore document not found, creating...');
          // 3. Create the user document in Firestore with the correct UID
          await setDoc(userDocRef, {
            id: adminUid, // Ensure ID field matches UID
            login: adminEmail,
            name: 'Администратор',
            surname: 'Системы',
            phone: '+7 (000) 000-00-00',
            roles: ['Администратор'],
            branchIds: [], // Admin is not tied to a specific branch
            blacklisted: false,
            avatar: `https://i.pravatar.cc/150?u=${adminEmail}`,
          });
          console.log('Admin Firestore document created successfully.');
        } else {
          console.log('Admin Firestore document already exists.');
        }
        
        // 4. Sign out the user so the app starts fresh
        await auth.signOut();
        console.log("Bootstrap check complete, admin signed out.");

      } catch (error) {
        console.error('Error during admin bootstrap process:', error);
      }
    };

    bootstrapAdmin();
  }, [firebaseServices]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
