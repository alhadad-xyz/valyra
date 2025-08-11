import { ReactElement } from 'react';

export type UserRole = 'seller' | 'buyer';

export interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  isRoleSelected: boolean;
  clearRole: () => void;
}

export interface RoleData {
  title: string;
  description: string;
  icon: ReactElement;
  features: string[];
  route: string;
}