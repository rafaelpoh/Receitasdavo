import { useState, useEffect, useCallback } from 'react';
import type { AuthUser, AuthCredentials } from '../../../types/auth';
import {
  subscribeToAuthState,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getFirebaseIdToken,
} from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    return await loginWithEmail(credentials);
  }, []);

  const register = useCallback(async (credentials: AuthCredentials) => {
    return await registerWithEmail(credentials);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
  }, []);

  const getIdToken = useCallback(async () => {
    return await getFirebaseIdToken();
  }, []);

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    getIdToken,
  };
}
