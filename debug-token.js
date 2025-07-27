// Debug script to check authentication token
// Run this in your browser console

console.log('🔍 AUTHENTICATION DEBUG');
console.log('================================');

// Check localStorage
const accessToken = localStorage.getItem('auth_access_token');
const refreshToken = localStorage.getItem('auth_refresh_token');
const user = localStorage.getItem('auth_user');

console.log('📝 LocalStorage Check:');
console.log('- auth_access_token:', accessToken ? `${accessToken.substring(0, 50)}...` : '❌ Missing');
console.log('- auth_refresh_token:', refreshToken ? `${refreshToken.substring(0, 50)}...` : '❌ Missing');
console.log('- auth_user:', user ? '✅ Present' : '❌ Missing');

if (accessToken) {
  try {
    // Parse JWT token
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expiresAt <= now;
    
    console.log('\n🔐 Token Analysis:');
    console.log('- Expires at:', expiresAt.toLocaleString());
    console.log('- Is expired:', isExpired ? '❌ YES' : '✅ NO');
    console.log('- Time until expiry:', Math.round((expiresAt - now) / (1000 * 60 * 60 * 24)), 'days');
    console.log('- Token payload:', payload);
  } catch (error) {
    console.error('❌ Error parsing token:', error);
  }
}

// Test API call
console.log('\n🧪 Testing API call...');
fetch('/api/food-entries', {
  headers: {
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ API Response:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  console.log('📄 Response data:', data);
})
.catch(error => {
  console.error('❌ API Error:', error);
});

console.log('\n�� Debug complete!'); 