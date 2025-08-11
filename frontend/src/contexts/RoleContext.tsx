import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, RoleContextType } from '../types/role.types';

const ROLE_STORAGE_KEY = 'valyra_role';

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: React.ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    if (savedRole && (savedRole === 'seller' || savedRole === 'buyer')) {
      setRoleState(savedRole as UserRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  };

  const isRoleSelected = role !== null;

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isRoleSelected,
        clearRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};