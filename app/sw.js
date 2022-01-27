// Tutorial:
// https://dev.to/zippytyro/how-to-convert-any-website-webpage-into-an-installable-progressive-web-app-pwa-59ai
// https://vaadin.com/learn/tutorials/learn-pwa/turn-website-into-a-pwa
// https://github.com/jakearchibald/wittr/blob/cache-avatars/public/js/sw/index.js
// Cache
const CACHE_NAME = "imcomp-mdc-pwa-v3";
const staticAssets = [
    './',
    './manifest.json',
    './index.html',
    './images/icons/imcomp-512x512.png',
    './images/icons/imcomp-256x256.png',
    './images/icons/imcomp-192x192.png',
    './images/icons/imcomp-128x128.png',
    './images/logo/imcomp-logo-large-path.svg',
    './images/logo/image-compare-1.svg',
    './images/logo/image-compare-2.svg',
    './images/usecases/book/case2-traherne2-a-original.jpg',
    './images/usecases/book/case2-traherne2-b-original.jpg',
    './images/usecases/churchill/case3-churchill-1.jpg',
    './images/usecases/churchill/case3-churchill-2.jpg',
    './images/usecases/painting/giovanni-1.jpg',
    './images/usecases/painting/giovanni-2.jpg',
    './images/usecases/music/case5-music-sheet-1.jpg',
    './images/usecases/music/case5-music-sheet-2.jpg',
    './images/usecases/satellite/Original-Tokyo-2017.jpg',
    './images/usecases/satellite/Original-Tokyo-1986.jpg',
    './images/usecases/puzzle/case6-puzzle-1-a.jpg',
    './images/usecases/puzzle/case6-puzzle-1-b.jpg',
    './js/action.js',
    './js/compare.js',
    './js/main.js',
    './js/samples.js',
    './js/viz.js',
    './js/transform.js',
    'https://unpkg.com/material-components-web@v13.0.0/dist/material-components-web.min.js',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
    'https://fonts.googleapis.com/css?family=Material+Icons&display=block',
    'https://fonts.gstatic.com/s/materialicons/v115/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'https://unpkg.com/material-components-web@v13.0.0/dist/material-components-web.min.css',
]

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('imcomp-mdc-pwa') &&
                           cacheName != CACHE_NAME;
                }).map((cacheName) => {
                    return caches.delete(cacheName)
                })
            );
        })
    );
});

async function cacheFirst(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}

self.addEventListener('fetch', event => {
    event.respondWith(cacheFirst(event.request));
});

self.addEventListener('message', (e) => {
    if (e.data.action == 'skipWaiting') {
        self.skipWaiting();
    }
});
