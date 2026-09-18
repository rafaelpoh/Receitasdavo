import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import type { AuthCredentials, AuthUser } from '../../../types/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcNUdDajjThHBkJJHSmI_gGayVpI8gcMM",
  authDomain: "receitasdavo-46eff.firebaseapp.com",
  projectId: "receitasdavo-46eff",
  storageBucket: "receitasdavo-46eff.firebasestorage.app",
  messagingSenderId: "348920861238",
  appId: "1:348920861238:web:6ce6c90811df73f661be97",
  measurementId: "G-Y34F7F92HP",
};

// Inicialização idempotente do Firebase Client SDK
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function loginWithEmail({ email, password }: AuthCredentials): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: credential.user.uid,
    email: credential.user.email,
  };
}

export async function registerWithEmail({ email, password }: AuthCredentials): Promise<AuthUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return {
    uid: credential.user.uid,
    email: credential.user.email,
  };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

export function subscribeToAuthState(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
      });
    } else {
      callback(null);
    }
  });
}
