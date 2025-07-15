// Permission constants matching the backend
export const PERMISSIONS = {
  // Changelog permissions
  CHANGELOG_VIEW: "changelog:view",
  CHANGELOG_CREATE: "changelog:create",
  CHANGELOG_UPDATE: "changelog:update",
  CHANGELOG_DELETE: "changelog:delete",
  CHANGELOG_PUBLISH: "changelog:publish",
  CHANGELOG_VIEW_DRAFTS: "changelog:view_drafts",
  
  // Role management
  ROLE_VIEW: "role:view",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  
  // User management
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete"
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    PERMISSIONS.CHANGELOG_VIEW,
    PERMISSIONS.CHANGELOG_CREATE,
    PERMISSIONS.CHANGELOG_UPDATE,
    PERMISSIONS.CHANGELOG_DELETE,
    PERMISSIONS.CHANGELOG_PUBLISH,
    PERMISSIONS.CHANGELOG_VIEW_DRAFTS,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
  ],
  editor: [
    PERMISSIONS.CHANGELOG_VIEW,
    PERMISSIONS.CHANGELOG_CREATE,
    PERMISSIONS.CHANGELOG_UPDATE,
    PERMISSIONS.CHANGELOG_DELETE,
    PERMISSIONS.CHANGELOG_VIEW_DRAFTS,
  ],
  viewer: [
    PERMISSIONS.CHANGELOG_VIEW,
  ]
};

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  role_name: string;
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Check if user has a specific permission
export function hasPermission(permission: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Superusers have all permissions
  if (user.is_superuser) return true;
  
  const userRole = user.role_name;
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  
  return permissions.includes(permission as string);
}

// Check if user has a specific role
export function hasRole(roleName: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Superusers can do everything
  if (user.is_superuser) return true;
  
  return user.role_name === roleName;
}

// Get user's role display name
export function getRoleDisplayName(roleName: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer'
  };
  
  return roleNames[roleName] || roleName;
}

// Get user's permissions list
export function getUserPermissions(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Superusers have all permissions
  if (user.is_superuser) {
    return Object.values(PERMISSIONS) as string[];
  }
  
  const userRole = user.role_name;
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return [...permissions];
}

// Check if token is valid
export function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch {
    return false;
  }
}

// Setup automatic logout when token expires
export function setupTokenExpiration(): void {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('access_token');
  if (!token) return;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    
    if (expiresAt <= now) {
      logout();
    } else {
      // Set timeout to logout when token expires
      setTimeout(logout, expiresAt - now);
    }
  } catch {
    // Invalid token, logout immediately
    logout();
  }
}

// Logout function
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Debug user permissions
export function debugUserPermissions(): void {
  const user = getCurrentUser();
  console.log('Current user:', user);
  console.log('User role:', user?.role_name);
  console.log('Is superuser:', user?.is_superuser);
  
  Object.values(PERMISSIONS).forEach(permission => {
    console.log(`${permission}: ${hasPermission(permission)}`);
  });
} 