const CACHE_NAME = 'sman68-v3';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline
const urlsToCache = [
    '/',
    '/index.html',
    '/sman68.html',
    '/offline.html',
    '/manifest.json',
    '/68-404.html'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch - Network first, fallback to cache, then offline page
self.addEventListener('fetch', event => {
    // Skip Firebase/Google API requests
    if (event.request.url.includes('firestore') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic') ||
        event.request.url.includes('google.com')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Try cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    // Return offline page for HTML requests
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match(OFFLINE_URL);
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
