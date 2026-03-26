// Dynamically determine base path (works for subfolder deployments)
const BASE = self.location.pathname.replace(/\/service-worker\.js$/, '');

const CACHE_NAME = "cer-v1";

// Core files to cache
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/asset-manifest.json`,
  `${BASE}/videos/offline/video_01a_1.mp4`,
  `${BASE}/videos/offline/video_01a_1.vtt`,
  `${BASE}/videos/02.mp4`,
  `${BASE}/videos/02.vtt`,
  `${BASE}/videos/offline/video_03_1.mp4`,
  `${BASE}/videos/offline/video_03_1.vtt`,
  `${BASE}/videos/offline/video_04_1.mp4`,
  `${BASE}/videos/offline/video_04_1.vtt`,
  `${BASE}/videos/offline/video_05_1.mp4`,
  `${BASE}/videos/offline/video_05_1.vtt`,
  `${BASE}/videos/offline/video_06_1.mp4`,
  `${BASE}/videos/offline/video_06_1.vtt`,
  `${BASE}/videos/offline/video_07_1.mp4`,
  `${BASE}/videos/offline/video_07_1.vtt`,
  `${BASE}/videos/08-successful-close.mp4`,
  `${BASE}/videos/08-successful-close.vtt`,
  `${BASE}/videos/08-unsuccessful-close.mp4`,
  `${BASE}/videos/08-unsuccessful-close.vtt`,
  `${BASE}/videos/02-news-reporter-successful.mp4`,
  `${BASE}/videos/02-news-reporter-successful.vtt`,
  `${BASE}/videos/02-news-reporter-unsuccessful.mp4`,
  `${BASE}/videos/02-news-reporter-unsuccessful.vtt`
];

// Install: cache core assets + activate immediately
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache core files
      await Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => console.warn("Failed to cache:", url, err))
        )
      );

      // Cache build assets from asset-manifest.json
      try {
        const response = await fetch(`${BASE}/asset-manifest.json`);
        const data = await response.json();

        const assetUrls = Object.values(data.files || {});
        await Promise.all(
          assetUrls.map(url =>
            cache.add(url).catch(err => console.warn("Failed to cache asset:", url, err))
          )
        );
      } catch (err) {
        console.warn("Asset manifest caching failed:", err);
      }
    })
  );
});

// Activate: take control of all pages immediately
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Fetch: handle navigation + asset requests properly
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Handle SPA navigation (React Router)
    event.respondWith(
      fetch(event.request).catch(() => caches.match(`${BASE}/index.html`))
    );
  } else {
    // Handle assets (JS, CSS, images, etc.)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});