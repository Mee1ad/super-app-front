// Debug script to track authentication issues
// Run this in your browser console to monitor auth state

console.log('🔍 Auth Debug Script Loaded');

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

localStorage.setItem = function(key, value) {
  console.log(`📝 localStorage.setItem: ${key} = ${value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null'}`);
  originalSetItem.apply(this, arguments);
};

localStorage.removeItem = function(key) {
  console.log(`🗑️ localStorage.removeItem: ${key}`);
  originalRemoveItem.apply(this, arguments);
};

// Check current auth state
function checkCurrentAuthState() {
  console.log('\n📋 Current Auth State:');
  
  const accessToken = localStorage.getItem('auth_access_token');
  const refreshToken = localStorage.getItem('auth_refresh_token');
  const user = localStorage.getItem('auth_user');
  
  console.log('- Access Token:', accessToken ? '✅ Present' : '❌ Missing');
  console.log('- Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
  console.log('- User Data:', user ? '✅ Present' : '❌ Missing');
  
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt - now;
      const daysUntilExpiry = timeUntilExpiry / (1000 * 60 * 60 * 24);
      
      console.log('⏰ Token Details:');
      console.log('- Expires at:', expiresAt.toLocaleString());
      console.log('- Days until expiry:', daysUntilExpiry.toFixed(1));
      console.log('- Is expired:', timeUntilExpiry <= 0 ? '❌ Yes' : '✅ No');
    } catch (error) {
      console.error('❌ Error parsing token:', error);
    }
  }
  
  // Check for inconsistent storage keys
  const inconsistentKeys = [
    'access_token',
    'refresh_token', 
    'user',
    'auth_token'
  ];
  
  console.log('\n🔍 Checking for inconsistent storage keys:');
  inconsistentKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`⚠️  Found inconsistent key: ${key} = ${value.substring(0, 50)}...`);
    }
  });
}

// Monitor page reloads
let reloadCount = 0;
const originalReload = window.location.reload;

window.location.reload = function() {
  reloadCount++;
  console.log(`🔄 Page reload #${reloadCount} triggered`);
  console.trace('Reload stack trace');
  originalReload.apply(this, arguments);
};

// Monitor navigation
const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
Object.defineProperty(window.location, 'href', {
  set: function(value) {
    console.log(`🧭 Navigation to: ${value}`);
    originalHref.set.call(this, value);
  },
  get: originalHref.get
});

// Export functions
window.authDebug = {
  checkCurrentAuthState,
  reloadCount: () => reloadCount
};

// Auto-check on load
setTimeout(checkCurrentAuthState, 1000);

console.log('💡 Run window.authDebug.checkCurrentAuthState() to check auth state');
console.log('📊 Reload count:', reloadCount); 