import 'dotenv/config'
import {
  FirebaseApp,
  FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);

    if (process.env.NODE_ENV === 'development') {
      // Point to the emulators running on localhost.
      // Make sure you're running the emulators with `firebase emulators:start`
      // connectAuthEmulator(auth, 'http://localhost:9099', {
      //   disableWarnings: true,
      // });
      // connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
  } else {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };

export * from './provider';
export * from './firestore/use-collection';
