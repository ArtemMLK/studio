'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeClientFirebase } from '@/firebase';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
        // We can't easily query by email with client SDK, so we'll use a known ID convention
        // This is a simplification for bootstrapping. A real app might use a Cloud Function.
        const adminId = 'admin_user_predefined_id';
        const userDocRef = doc(firestore, USERS_COLLECTION, adminId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log('Admin user not found, creating...');
          // Create the user in Auth. We'll ignore errors if the user already exists in Auth.
          try {
             await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          } catch (authError: any) {
             if (authError.code !== 'auth/email-already-in-use') {
                console.error("Auth creation failed:", authError);
                return; // Stop if it's not an "already exists" error
             }
             console.log("User already exists in Auth, ensuring Firestore doc is present.");
          }

          // Create the user document in Firestore with the predefined ID
          await setDoc(userDocRef, {
            id: adminId,
            login: adminEmail,
            name: 'Администратор',
            surname: 'Системы',
            phone: '+7 (000) 000-00-00',
            roles: ['Администратор'],
            branchIds: [], // Admin is not tied to a specific branch
            blacklisted: false,
            avatar: `https://i.pravatar.cc/150?u=${adminEmail}`,
          });
          console.log('Admin user created successfully in Firestore.');
        } else {
           console.log('Admin user already exists.');
        }

      } catch (error) {
        console.error('Error bootstrapping admin user:', error);
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
