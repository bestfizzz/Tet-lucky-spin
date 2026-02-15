const UIA_CACHE = 'uia-cache-v1';
const UIA_KEY = '/uia-fixed';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept ONLY getUIA
    if (url.pathname === '/api/getUIA') {
        event.respondWith(handleUIARequest(event.request));
    }
});

async function handleUIARequest(request) {
    const cache = await caches.open(UIA_CACHE);

    // Try returning stored version
    const cached = await cache.match(UIA_KEY);
    if (cached) {
        return cached;
    }

    // First time → fetch from network
    const response = await fetch(request);

    // Store using fixed key (ignore query string)
    await cache.put(UIA_KEY, response.clone());

    return response;
}
