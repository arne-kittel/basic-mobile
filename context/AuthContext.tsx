import React, { createContext, useEffect, useState, ReactNode} from 'react';
import { getToken, saveToken, deleteToken } from '@/utils/auth'
import { isTokenValid } from '@/utils/jwt';

import * as SecureStore from 'expo-secure-store';

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  logIn: (token: string) => void;
  logOut: () => void;
};

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  logIn: () => {},
  logOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
  const checkToken = async () => {
    try {
      const token = await getToken();
      if (token && isTokenValid(token)) {
        setIsLoggedIn(true);
      } else {
        await deleteToken();
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to load token', error);
    } finally {
      setIsReady(true); // ← reicht völlig aus
    }
  };

  checkToken();
}, []);

  const logIn = async (token: string) => {
    await SecureStore.setItemAsync('jwt', token);
    setIsLoggedIn(true);
    console.log('User logged in successfully');
    console.log('Token saved:', token);
  };

  const logOut = async () => {
    await deleteToken();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
        value={{
            isLoggedIn,
            isReady,
            logIn,
            logOut,
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};
