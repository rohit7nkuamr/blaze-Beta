// Service Worker for Blaze Restaurant Website
const CACHE_NAME = 'blaze-restaurant-cache-v1';
const urlsToCache = [
  './index.html',
  './pages/menu.html',
  './pages/about.html',
  './pages/contact.html',
  './pages/gourmet-burgers.html',
  './pages/wraps.html',
  './pages/sides.html',
  './pages/pasta.html',
  './pages/main-course.html',
  './pages/chinese.html',
  './pages/og-momos.html',
  './pages/cold-beverages.html',
  './pages/hot-beverages.html',
  './pages/desserts.html',
  './pages/indian.html',
  './script.js',
  './dissolve-animations.css',
  './dissolve-animation.js',
  './3d-animations.css',
  './3d-animation.js',
  './swipe-animations.css',
  './menu-button-fix.css',
  './loading-indicator.css',
  './browser-theme.css',
  './styles.css',
  './assets/Blaze PNG 3.svg',
  './assets/About.svg',
  './assets/CLick.svg',
  './assets/Get D.svg',
  './assets/MAIN.svg',
  './assets/Beautiful Freak Bold.otf',
  './assets/Teko-VariableFont_wght.ttf',
  './assets/menu/GOURMET BURGERS.svg',
  './assets/menu/WRAPS.svg',
  './assets/menu/SIDES.svg',
  './assets/menu/PASTA.svg',
  './assets/menu/MAIN COURSE.svg',
  './assets/menu/CHINESE.svg',
  './assets/menu/momos.svg',
  './assets/menu/COLD BEVERAGES.svg',
  './assets/menu/HOT BEVERAGES.svg',
  './assets/menu/DESSERTS.svg',
  './assets/menu/INDIAN.svg'
];

// Cache SVG files separately with a longer expiration
const SVG_CACHE_NAME = 'blaze-svg-cache-v1';
const SVG_CACHE_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Clean up old SVG caches periodically
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('blaze-svg-cache-') && cacheName !== SVG_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  if (event.request.url.endsWith('.svg')) {
    event.respondWith(
      caches.open(SVG_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          
          // Clone the request because it's a one-time use stream
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest).then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache if it's an API call or external resource
                if (event.request.url.indexOf('http') === 0) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          });
        })
    );
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
function syncData() {
  // Implementation for syncing data when back online
  return Promise.resolve();
}

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'Blaze Restaurant';
  const options = {
    body: event.data.text(),
    icon: '/assets/logo.png',
    badge: '/assets/badge.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});
