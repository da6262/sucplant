// Service Worker for 경산다육식물농장 관리시스템 ver 5.0
const CACHE_NAME = 'korsucplant-v5.1.0';
const STATIC_CACHE = 'korsucplant-static-v5.1.0';
const DYNAMIC_CACHE = 'korsucplant-dynamic-v5.1.0';

// 캐시할 정적 자원들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/js/supabase-config.js',
  '/js/supabase-only-mode.js',
  '/js/database.js',
  '/js/app.js',
  '/js/customer-management.js',
  '/js/order-management.js',
  '/main.js',
  '/components/header/header.html',
  '/components/header/header.js',
  '/components/navigation/navigation.js',
  '/components/dashboard/dashboard.html',
  '/components/dashboard/dashboard.js',
  '/features/orders/orderForm.js',
  '/features/orders/orderUI.js',
  '/features/orders/orderData.js',
  '/features/orders/orderSMS.js',
  '/features/customers/customerData.js',
  '/features/customers/customerUI.js',
  '/features/products/productData.js',
  '/features/products/productUI.js',
  '/features/waitlist/waitlistData.js',
  '/features/categories/categoryData.js',
  '/features/categories/categoryUI.js',
  '/components/product-management/product-management.html',
  '/components/product-management/product-management.js',
  '/components/waitlist-management/waitlist-management.html',
  '/components/waitlist-management/waitlist-management.js'
];

// 외부 CDN 리소스들
const EXTERNAL_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
];

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 정적 자원 캐시 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // GET 요청만 처리
  if (request.method !== 'GET') {
    return;
  }
  
  // 외부 CDN 리소스는 네트워크 우선
  if (EXTERNAL_RESOURCES.some(resource => request.url.startsWith(resource))) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Supabase API 요청은 항상 네트워크 우선 (캐시 무효화 필요)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // GET 요청의 성공적인 응답만 캐시에 저장 (단기 캐시)
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 찾기 (오프라인 모드)
          return caches.match(request);
        })
    );
    return;
  }
  
  // 기타 API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/supabase/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 성공적인 응답을 동적 캐시에 저장
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 찾기
          return caches.match(request);
        })
    );
    return;
  }
  
  // 정적 자원은 캐시 우선
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          console.log('📦 캐시에서 제공:', request.url);
          return response;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(request)
          .then(response => {
            // 유효한 응답만 캐시에 저장
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // 오프라인 폴백 페이지
            if (request.destination === 'document') {
              return caches.match('/offline-fallback.html');
            }
            return new Response('오프라인 상태입니다', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('🔄 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 오프라인에서 저장된 데이터 동기화
      syncOfflineData()
    );
  }
});

// 푸시 알림
self.addEventListener('push', event => {
  console.log('📱 푸시 알림 수신');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('경산다육식물농장', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('🔔 알림 클릭:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
  try {
    console.log('🔄 오프라인 데이터 동기화 시작');
    
    // IndexedDB에서 오프라인 데이터 가져오기
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Supabase에 동기화
      for (const data of offlineData) {
        await syncToSupabase(data);
      }
      
      // 동기화 완료 후 오프라인 데이터 삭제
      await clearOfflineData();
      
      console.log('✅ 오프라인 데이터 동기화 완료');
    }
  } catch (error) {
    console.error('❌ 오프라인 데이터 동기화 실패:', error);
  }
}

// IndexedDB에서 오프라인 데이터 가져오기
async function getOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('korsucplant-offline', 1);
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Supabase에 데이터 동기화
async function syncToSupabase(data) {
  try {
    // Supabase 클라이언트가 있는지 확인
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      const { data: result, error } = await supabase
        .from(data.table)
        .insert(data.record);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ 데이터 동기화 성공:', data.table);
    }
  } catch (error) {
    console.error('❌ 데이터 동기화 실패:', error);
    throw error;
  }
}

// 오프라인 데이터 삭제
async function clearOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('korsucplant-offline', 1);
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

console.log('🚀 Service Worker 로드 완료 - ver 5.0');