// Utility to get user's IP address and User-Agent for anonymous changelog tracking

export interface UserInfo {
  ip_address: string;
  user_agent: string;
}

// Cache for user info to avoid repeated API calls
let cachedUserInfo: UserInfo | null = null;

export async function getUserInfo(): Promise<UserInfo | null> {
  // Return cached info if available
  if (cachedUserInfo) {
    return cachedUserInfo;
  }

  try {
    // Get IP address from external service
    const ipResponse = await fetch('https://api.ipify.org?format=json', {
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    });
    
    if (!ipResponse.ok) {
      throw new Error('Failed to get IP address');
    }
    
    const ipData = await ipResponse.json();
    const userInfo: UserInfo = {
      ip_address: ipData.ip,
      user_agent: navigator.userAgent
    };

    // Cache the result
    cachedUserInfo = userInfo;
    
    return userInfo;
  } catch {
    // Silently handle network errors - external service may be unavailable
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('getUserInfo: External service not available, skipping IP detection');
    }
    return null;
  }
}

export function clearUserInfoCache(): void {
  cachedUserInfo = null;
} 