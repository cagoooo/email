// Service Worker for PWA offline support
// 石門國小 Email 學習遊戲 - 離線支援

const CACHE_NAME = 'smes-email-game-v1.0.2';
const STATIC_CACHE = 'smes-static-v1.0.2';
const DYNAMIC_CACHE = 'smes-dynamic-v1.0.2';

// 需要緩存的靜態資源
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './offline.html',
];

// 需要緩存的 API 端點
const API_ENDPOINTS = [
  '/api/progress',
  '/api/challenges',
  '/api/leaderboard',
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log(' [SW] Installing V1.0.1...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log(' [SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 激活 Service Worker 並清理舊快取
self.addEventListener('activate', (event) => {
  console.log(' [SW] Activating...');
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(' [SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(' [SW] Now ready to handle fetches!');
      return self.clients.claim();
    })
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!request.url.startsWith('http')) return;

  // 1. 處理導航請求 (網路優先)
  if (request.mode === 'navigate') {
    // ⚠️ OAuth 回傳頁面（含 access_token）：直接透傳給瀏覽器，不由 SW 攔截
    // 原因：Hash fragment (#access_token=...) 是瀏覽器端路由，SW fetch 會失敗
    if (request.url.includes('access_token=') || request.url.includes('refresh_token=')) {
      return; // 讓瀏覽器原生處理
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match('./offline.html');
          // 確保一定返回有效 Response，絕不返回 undefined
          return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }


  // 2. 處理 API 與 Supabase 請求 (網路優先)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          if (request.method === 'GET') return caches.match(request);
          return new Response(JSON.stringify({ error: 'offline' }), { status: 503 });
        })
    );
    return;
  }

  // 3. 靜態資源 (快取優先)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    }).catch(() => {
      if (request.destination === 'image') {
        return new Response('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#eee"/><text x="50%" y="50%" text-anchor="middle">Offline</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
      }
    })
  );
});

// 後台同步與推送通知保持原樣 (省略細節或保持原邏輯)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') event.waitUntil(Promise.resolve());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});