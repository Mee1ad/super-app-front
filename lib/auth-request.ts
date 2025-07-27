// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Make authenticated request with automatic token refresh
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('auth_access_token');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry the request
    return makeAuthenticatedRequest(url, options);
  }

  return response;
}

// Refresh expired tokens
export async function refreshToken(): Promise<void> {
      const refreshToken = localStorage.getItem('auth_refresh_token');
  
  if (!refreshToken) {
    // Clear tokens and throw error
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
    throw new Error('No refresh token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update stored tokens
          localStorage.setItem('auth_access_token', data.access_token);
      localStorage.setItem('auth_refresh_token', data.refresh_token);
    
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens and throw error
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
    throw new Error('Token refresh failed');
  }
}

// Handle OAuth callback and exchange code for tokens
export async function handleAuthCallback(code: string): Promise<{ tokens: { access_token: string; refresh_token: string }; user: { id: string; email: string; username: string; is_active: boolean; is_superuser: boolean; role_name: string } }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const authData = await response.json();
    
    // Store tokens securely
    localStorage.setItem('auth_access_token', authData.tokens.access_token);
    localStorage.setItem('auth_refresh_token', authData.tokens.refresh_token);
    
    // Store user info
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    
    return authData;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

// Get Google OAuth URL
export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/google/url`);
  if (!response.ok) {
    throw new Error('Failed to get Google OAuth URL');
  }
  const data = await response.json();
  return data.auth_url;
} 