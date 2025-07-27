// Script to clear auth data from localStorage
// Run this in your browser console to clear old tokens

console.log('Clearing auth data from localStorage...');

// Clear all auth-related items
localStorage.removeItem('auth_access_token');
localStorage.removeItem('auth_refresh_token');
localStorage.removeItem('auth_user');

console.log('Auth data cleared successfully!');
console.log('You can now try logging in again.');

// Optional: Reload the page
// window.location.reload(); 