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
  
  const userStr = localStorage.getItem('auth_user');
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
  
  // Prevent multiple calls in quick succession
  if ((window as any).tokenExpirationSetupTime) {
    const timeSinceLastSetup = Date.now() - (window as any).tokenExpirationSetupTime;
    if (timeSinceLastSetup < 1000) { // Less than 1 second
      console.log('⏭️ Skipping token expiration setup - called too recently');
      return;
    }
  }
  
  // Clear any existing timeout to prevent multiple timers
  if ((window as any).tokenExpirationTimer) {
    clearTimeout((window as any).tokenExpirationTimer);
    console.log('🧹 Cleared existing timer');
  }
  
  const token = localStorage.getItem('auth_access_token');
  if (!token) return;
  
  // Mark this setup time
  (window as any).tokenExpirationSetupTime = Date.now();
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    
    // Only check if token is actually expired (no buffer for new tokens)
    if (expiresAt <= now) {
      // Token is actually expired, clear it
      console.log('Token is expired, clearing auth data');
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
      return;
    } else {
      // Set timeout to logout when token expires (with 1-minute buffer)
      const bufferTime = 1 * 60 * 1000; // 1 minute buffer
      const timeUntilExpiry = expiresAt - now - bufferTime;
      console.log(`Token will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
      console.log(`Timer will fire in ${Math.round(timeUntilExpiry / 1000)} seconds`);
      console.log(`Debug values: expiresAt=${expiresAt}, now=${now}, bufferTime=${bufferTime}, timeUntilExpiry=${timeUntilExpiry}`);
      
            // For long durations, use a different approach
      const maxTimeout = 2147483647; // Max 32-bit integer for setTimeout (~24.8 days)
      
      if (timeUntilExpiry > maxTimeout) {
        console.log('⏰ Token expires in more than 24 days, using periodic check instead of timer');
        // For very long durations, just check periodically instead of using setTimeout
        console.log('✅ Token will be checked on next page load');
      } else if (timeUntilExpiry > 0) {
        // Store the timer reference to prevent multiple timers
        (window as any).tokenExpirationTimer = setTimeout(() => {
          console.log('🕐 TIMER FIRED - Token expired, logging out');
          console.log('Timer details:', {
            expiresAt: new Date(expiresAt).toISOString(),
            now: new Date().toISOString(),
            timeUntilExpiry: timeUntilExpiry
          });
          logout();
        }, timeUntilExpiry);
        console.log('✅ Timer set successfully for', Math.round(timeUntilExpiry / 1000 / 60 / 60 / 24), 'days');
      } else {
        console.log('❌ Timer not set - token expires too soon');
        // Token expires too soon, clear auth data
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
      }
    }
  } catch (error) {
    console.error('Error parsing token:', error);
    // Invalid token, clear auth data
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
  }
}

// Clear auth data without redirecting
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_access_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');
}

// Logout function
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  // Clear the token expiration timer
  if ((window as any).tokenExpirationTimer) {
    clearTimeout((window as any).tokenExpirationTimer);
    (window as any).tokenExpirationTimer = null;
  }
  
  clearAuthData();
  window.location.href = '/';
}

// Check and clear expired tokens
export function checkAndClearExpiredTokens(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_access_token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    console.log('🔍 Checking token expiration:', {
      tokenExp: payload.exp,
      now: now,
      isExpired: payload.exp <= now
    });
    
    if (payload.exp <= now) {
      console.log('❌ Found expired token, clearing auth data');
      clearAuthData();
      return true;
    } else {
      console.log('✅ Token is still valid');
    }
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    clearAuthData();
    return true;
  }
  
  return false;
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