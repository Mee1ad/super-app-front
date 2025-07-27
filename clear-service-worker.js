// Script to clear service workers
// Run this in your browser console

console.log('🧹 CLEARING SERVICE WORKERS');
console.log('================================');

// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('📋 Found service worker registrations:', registrations.length);
    
    for(let registration of registrations) {
      console.log('🗑️ Unregistering service worker:', registration.scope);
      registration.unregister();
    }
    
    console.log('✅ All service workers unregistered');
  });
} else {
  console.log('❌ Service workers not supported');
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    console.log('📋 Found caches:', cacheNames.length);
    
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('✅ All caches cleared');
  });
} else {
  console.log('❌ Cache API not supported');
}

console.log('🎯 Service worker cleanup complete!');
console.log('🔄 Please refresh the page and try again.'); 