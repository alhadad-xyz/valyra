import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useRole } from '../contexts/RoleContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole = true 
}) => {
  const { isAuthenticated } = useAuth();
  const { isRoleSelected } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && !isRoleSelected) {
    return <Navigate to="/role-selection" replace />;
  }

  return <>{children}</>;
};