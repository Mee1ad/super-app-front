import React, { createContext, useContext, useState, useEffect } from 'react';
import { PERMISSIONS } from './types';

const AuthContext = createContext<{
  user: {
    id: string;
    email: string;
    username: string;
    is_active: boolean;
    is_superuser: boolean;
    role: {
      id: string;
      name: string;
      description: string;
      permissions: string[];
    };
    created_at: string;
    updated_at: string;
  } | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
} | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUser({
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        is_active: true,
        is_superuser: true,
        role: {
          id: '1',
          name: 'admin',
          description: 'Administrator',
          permissions: Object.values(PERMISSIONS),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('auth_token', token);
    setUser({
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      is_active: true,
      is_superuser: true,
      role: {
        id: '1',
        name: 'admin',
        description: 'Administrator',
        permissions: Object.values(PERMISSIONS),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const hasPermission = (permission) => {
    return !!user && !!user.role && user.role.permissions.includes(permission);
  };

  const hasRole = (roleName) => {
    return !!user && !!user.role && user.role.name === roleName;
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout, hasPermission, hasRole } },
    children
  );
}

export function PermissionGuard(props) {
  const { permission, fallback, children } = props;
  const { hasPermission, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!hasPermission(permission)) return fallback || <div>Access denied</div>;
  return <>{children}</>;
}

export function RoleGuard(props) {
  const { role, fallback, children } = props;
  const { hasRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!hasRole(role)) return fallback || <div>Access denied</div>;
  return <>{children}</>;
}

export {}; 