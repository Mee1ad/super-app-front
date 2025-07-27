// Test script to verify frontend authentication with 30-day sessions
// Run this in your browser console after logging in

console.log('🔍 Testing Frontend Authentication with 30-day Sessions');

// Check if user is logged in
function checkAuthStatus() {
    const accessToken = localStorage.getItem('auth_access_token');
    const refreshToken = localStorage.getItem('auth_refresh_token');
    const user = localStorage.getItem('auth_user');
    
    console.log('📋 Current Auth Status:');
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
            
            console.log('⏰ Token Expiration:');
            console.log('- Expires at:', expiresAt.toLocaleString());
            console.log('- Days until expiry:', daysUntilExpiry.toFixed(1));
            console.log('- Is expired:', timeUntilExpiry <= 0 ? '❌ Yes' : '✅ No');
            
            if (daysUntilExpiry >= 29) {
                console.log('✅ SUCCESS: Token has 30-day expiration!');
            } else {
                console.log('⚠️  WARNING: Token expiration seems shorter than expected');
            }
        } catch (error) {
            console.error('❌ Error parsing token:', error);
        }
    }
    
    return { accessToken, refreshToken, user };
}

// Test token refresh functionality
async function testTokenRefresh() {
    console.log('\n🔄 Testing Token Refresh...');
    
    const refreshToken = localStorage.getItem('auth_refresh_token');
    if (!refreshToken) {
        console.log('❌ No refresh token available');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token refresh successful');
            console.log('- New access token received');
            console.log('- New refresh token received');
            
            // Update localStorage with new tokens
            localStorage.setItem('auth_access_token', data.access_token);
            localStorage.setItem('auth_refresh_token', data.refresh_token);
            
            console.log('💾 Updated localStorage with new tokens');
        } else {
            console.log('❌ Token refresh failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Error during token refresh:', error);
    }
}

// Test API calls with authentication
async function testAuthenticatedAPI() {
    console.log('\n🌐 Testing Authenticated API Calls...');
    
    const accessToken = localStorage.getItem('auth_access_token');
    if (!accessToken) {
        console.log('❌ No access token available');
        return;
    }
    
    try {
        // Test a simple API call (adjust the endpoint as needed)
        const response = await fetch('/api/diary/entries', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Authenticated API call successful');
        } else if (response.status === 401) {
            console.log('❌ API call failed - Unauthorized (token might be expired)');
        } else {
            console.log('⚠️  API call returned status:', response.status);
        }
    } catch (error) {
        console.error('❌ Error during API call:', error);
    }
}

// Run all tests
function runAuthTests() {
    console.log('🚀 Starting Authentication Tests...\n');
    
    const authStatus = checkAuthStatus();
    
    if (authStatus.accessToken) {
        testTokenRefresh().then(() => {
            testAuthenticatedAPI().then(() => {
                console.log('\n✅ All tests completed!');
            });
        });
    } else {
        console.log('\n❌ Please log in first before running tests');
    }
}

// Export functions for manual testing
window.authTests = {
    checkAuthStatus,
    testTokenRefresh,
    testAuthenticatedAPI,
    runAuthTests
};

console.log('📝 Test functions available as window.authTests');
console.log('💡 Run window.authTests.runAuthTests() to start testing'); 