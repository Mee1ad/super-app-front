// Comprehensive Food API Test Script
// Run this in your browser console

console.log('🧪 FOOD API COMPREHENSIVE TEST');
console.log('================================');

// Test 1: No authentication (should return mock data)
console.log('\n📋 Test 1: No authentication');
fetch('/api/food-entries')
  .then(response => {
    console.log('✅ Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Data received:', data.entries ? `${data.entries.length} entries` : 'No entries');
    console.log('✅ Using mock data:', data.entries && data.entries.length > 0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });

// Test 2: Invalid token (should return 401)
console.log('\n📋 Test 2: Invalid token');
fetch('/api/food-entries', {
  headers: {
    'Authorization': 'Bearer invalid-token',
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Response:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });

// Test 3: Check current authentication status
console.log('\n📋 Test 3: Current authentication status');
const accessToken = localStorage.getItem('auth_access_token');
const refreshToken = localStorage.getItem('auth_refresh_token');
const user = localStorage.getItem('auth_user');

console.log('🔐 Current auth status:');
console.log('- Access token:', accessToken ? 'Present' : 'Missing');
console.log('- Refresh token:', refreshToken ? 'Present' : 'Missing');
console.log('- User data:', user ? 'Present' : 'Missing');

if (accessToken) {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expiresAt <= now;
    
    console.log('🔐 Token analysis:');
    console.log('- Expires at:', expiresAt.toLocaleString());
    console.log('- Is expired:', isExpired ? '❌ YES' : '✅ NO');
    console.log('- Time until expiry:', Math.round((expiresAt - now) / (1000 * 60 * 60 * 24)), 'days');
  } catch (error) {
    console.error('❌ Error parsing token:', error);
  }
}

// Test 4: With current token (if available)
if (accessToken) {
  console.log('\n📋 Test 4: With current token');
  fetch('/api/food-entries', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('✅ Status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('✅ Response:', data);
      if (data.error) {
        console.log('⚠️ Backend error:', data.error);
      } else {
        console.log('✅ Backend data received successfully');
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
    });
} else {
  console.log('\n📋 Test 4: Skipped (no token available)');
}

console.log('\n🎯 Test complete! Check the results above.'); 