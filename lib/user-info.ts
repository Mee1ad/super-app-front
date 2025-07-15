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
    const ipResponse = await fetch('https://api.ipify.org?format=json');
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
    
    console.log('User info collected:', {
      ip_address: userInfo.ip_address,
      user_agent: userInfo.user_agent.substring(0, 50) + '...'
    });

    return userInfo;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
}

// Function to clear cache (useful for testing)
export function clearUserInfoCache(): void {
  cachedUserInfo = null;
} 