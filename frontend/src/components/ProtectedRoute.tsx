import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useRole } from '../contexts/RoleContext';
import { UserRole } from '../types/role.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: boolean | UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole = true 
}) => {
  const { isAuthenticated } = useAuth();
  const { isRoleSelected, role } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireRole === true && !isRoleSelected) {
    return <Navigate to="/role-selection" replace />;
  }

  if (typeof requireRole === 'string' && role !== requireRole) {
    if (!isRoleSelected) {
      return <Navigate to="/role-selection" replace />;
    }
    // Redirect to the correct dashboard if user has wrong role
    return <Navigate to={`/${role}`} replace />;
  }

  return <>{children}</>;
};