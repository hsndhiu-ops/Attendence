import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to their respective authorized portal
    if (currentUser.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    if (currentUser.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (currentUser.role === 'main_admin') {
      return <Navigate to="/main-admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
