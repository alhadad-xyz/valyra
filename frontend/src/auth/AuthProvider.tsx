import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

interface AuthContextType {
  authClient: AuthClient | null;
  identity: Identity | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      setIdentity(identity);
      setIsAuthenticated(true);
    }
  };

  const login = async () => {
    if (!authClient) return;

    await authClient.login({
      identityProvider: process.env.NODE_ENV === 'production' 
        ? 'https://identity.ic0.app'
        : 'http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
      onSuccess: () => {
        const identity = authClient.getIdentity();
        setIdentity(identity);
        setIsAuthenticated(true);
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;

    await authClient.logout();
    setIdentity(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authClient,
        identity,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};