// Comprehensive Login Debug Script
// Run this in your browser console to debug login issues

console.log('🔍 LOGIN DEBUG SCRIPT LOADED');
console.log('================================');

// 1. Check current page and URL
console.log('📍 CURRENT PAGE INFO:');
console.log('- URL:', window.location.href);
console.log('- Pathname:', window.location.pathname);
console.log('- Search params:', window.location.search);

// 2. Check localStorage for any auth data
console.log('\n💾 LOCALSTORAGE CHECK:');
const authKeys = [
  'auth_access_token',
  'auth_refresh_token', 
  'auth_user',
  'access_token',
  'refresh_token',
  'user',
  'auth_token'
];

authKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`✅ ${key}:`, value.length > 50 ? value.substring(0, 50) + '...' : value);
  } else {
    console.log(`❌ ${key}: Missing`);
  }
});

// 3. Check if tokens are valid
console.log('\n🔐 TOKEN VALIDATION:');
const accessToken = localStorage.getItem('auth_access_token') || localStorage.getItem('access_token');
if (accessToken) {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt - now;
    const daysUntilExpiry = timeUntilExpiry / (1000 * 60 * 60 * 24);
    
    console.log('✅ Token found and parsed successfully');
    console.log('- Expires at:', expiresAt.toLocaleString());
    console.log('- Days until expiry:', daysUntilExpiry.toFixed(1));
    console.log('- Is expired:', timeUntilExpiry <= 0 ? '❌ YES' : '✅ NO');
    console.log('- Token payload:', payload);
  } catch (error) {
    console.error('❌ Error parsing token:', error);
  }
} else {
  console.log('❌ No access token found');
}

// 4. Check for React components and hooks
console.log('\n⚛️ REACT COMPONENTS CHECK:');
const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
if (reactRoot) {
  console.log('✅ React root found');
} else {
  console.log('❌ React root not found');
}

// 5. Check for any error messages on page
console.log('\n🚨 ERROR CHECK:');
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error, .Error');
if (errorElements.length > 0) {
  console.log('⚠️ Found potential error elements:');
  errorElements.forEach((el, i) => {
    console.log(`- Error ${i + 1}:`, el.textContent?.trim());
  });
} else {
  console.log('✅ No visible error elements found');
}

// 6. Check network requests
console.log('\n🌐 NETWORK CHECK:');
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch request:', args[0]);
  return originalFetch.apply(this, args);
};

// 7. Test functions
window.loginDebug = {
  // Clear all auth data
  clearAll: () => {
    console.log('🧹 Clearing all auth data...');
    authKeys.forEach(key => localStorage.removeItem(key));
    console.log('✅ All auth data cleared');
    window.location.reload();
  },
  
  // Test the specific URL you provided
  testAuthUrl: () => {
    console.log('🧪 Testing auth URL...');
    const testUrl = 'http://localhost:3000/?auth=%7B%22user%22%3A%20%7B%22id%22%3A%20%222b4ee977-6e53-4203-8b61-738ae8cbdeab%22%2C%20%22email%22%3A%20%22soheilravasani%40gmail.com%22%2C%20%22username%22%3A%20%22Soheil%20Rv%22%2C%20%22is_active%22%3A%20true%2C%20%22is_superuser%22%3A%20false%2C%20%22role_name%22%3A%20%22admin%22%7D%2C%20%22tokens%22%3A%20%7B%22access_token%22%3A%20%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjRlZTk3Ny02ZTUzLTQyMDMtOGI2MS03MzhhZThjYmRlYWIiLCJlbWFpbCI6InNvaGVpbHJhdmFzYW5pQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU29oZWlsIFJ2IiwiZXhwIjoxNzU2MjMyMzAwfQ.MiIXO0EjNME_OWwR19d5mMS7JszT8EjUSBvc05wbOx0%22%2C%20%22refresh_token%22%3A%20%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjRlZTk3Ny02ZTUzLTQyMDMtOGI2MS03MzhhZThjYmRlYWIiLCJlbWFpbCI6InNvaGVpbHJhdmFzYW5pQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU29oZWlsIFJ2IiwiZXhwIjoxNzU2MjMyMzAwLCJ0eXBlIjoicmVmcmVzaCJ9.PMRy1TsjEXt_97IBNRvuE-xjo_42mXJxFQDHoH5Iv40%22%2C%20%22token_type%22%3A%20%22bearer%22%2C%20%22expires_in%22%3A%202592000%7D%7D';
    window.location.href = testUrl;
  },
  
  // Manually set auth data
  setAuthData: () => {
    console.log('🔧 Manually setting auth data...');
    const user = {
      id: "2b4ee977-6e53-4203-8b61-738ae8cbdeab",
      email: "soheilravasani@gmail.com",
      username: "Soheil Rv",
      is_active: true,
      is_superuser: false,
      role_name: "admin"
    };
    
    const tokens = {
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjRlZTk3Ny02ZTUzLTQyMDMtOGI2MS03MzhhZThjYmRlYWIiLCJlbWFpbCI6InNvaGVpbHJhdmFzYW5pQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU29oZWlsIFJ2IiwiZXhwIjoxNzU2MjMyMzAwfQ.MiIXO0EjNME_OWwR19d5mMS7JszT8EjUSBvc05wbOx0",
      refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjRlZTk3Ny02ZTUzLTQyMDMtOGI2MS03MzhhZThjYmRlYWIiLCJlbWFpbCI6InNvaGVpbHJhdmFzYW5pQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU29oZWlsIFJ2IiwiZXhwIjoxNzU2MjMyMzAwLCJ0eXBlIjoicmVmcmVzaCJ9.PMRy1TsjEXt_97IBNRvuE-xjo_42mXJxFQDHoH5Iv40"
    };
    
    localStorage.setItem('auth_access_token', tokens.access_token);
    localStorage.setItem('auth_refresh_token', tokens.refresh_token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    console.log('✅ Auth data set manually');
    console.log('🔄 Reloading page...');
    window.location.reload();
  },
  
  // Check what's happening during login
  monitorLogin: () => {
    console.log('👀 Monitoring login process...');
    
    // Monitor localStorage changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      console.log(`📝 SET: ${key} = ${value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null'}`);
      originalSetItem.apply(this, arguments);
    };
    
    // Monitor page reloads
    const originalReload = window.location.reload;
    window.location.reload = function() {
      console.log('🔄 PAGE RELOAD TRIGGERED');
      console.trace('Reload stack trace');
      originalReload.apply(this, arguments);
    };
    
    console.log('✅ Login monitoring active');
  },
  
  // Check backend connectivity
  testBackend: async () => {
    console.log('🔌 Testing backend connectivity...');
    try {
      const response = await fetch('http://localhost:8000/health');
      console.log('✅ Backend health check:', response.status);
    } catch (error) {
      console.error('❌ Backend not reachable:', error.message);
    }
  }
};

console.log('\n🎯 DEBUG COMMANDS AVAILABLE:');
console.log('- window.loginDebug.clearAll() - Clear all auth data');
console.log('- window.loginDebug.testAuthUrl() - Test the auth URL');
console.log('- window.loginDebug.setAuthData() - Manually set auth data');
console.log('- window.loginDebug.monitorLogin() - Monitor login process');
console.log('- window.loginDebug.testBackend() - Test backend connectivity');

console.log('\n�� READY TO DEBUG!'); 