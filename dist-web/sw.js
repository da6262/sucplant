// 경산다육식물농장 관리시스템 Service Worker v6.1
// 기본 Service Worker 기능만 사용 (ES6 import 제거)

console.log('🚀 Service Worker 시작 - 경산다육식물농장');

// ============ 기본 캐시 설정 ============

const CACHE_NAME = 'korsucplant-v6.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/force-local-mode.js',
    '/js/clean-console.js',
    '/js/disable-api-errors.js',
    '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker 설치 중...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ 캐시 열림');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ 모든 파일 캐시됨');
                return self.skipWaiting();
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker 활성화 중...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 오래된 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker 활성화 완료');
            return self.clients.claim();
        })
    );
});

// fetch 이벤트
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 캐시에서 반환
                if (response) {
                    return response;
                }
                
                // 캐시에 없으면 네트워크에서 가져오기
                return fetch(event.request)
                    .then((response) => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답을 복제하여 캐시에 저장
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch((error) => {
                                console.warn('캐시 저장 실패:', error);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.warn('네트워크 요청 실패:', error);
                        
                        // 오프라인 폴백 페이지 반환
                        if (event.request.destination === 'document') {
                            return caches.match('/offline-fallback.html');
                        }
                        
                        // API 요청의 경우 빈 응답 반환
                        if (event.request.url.includes('tables/') || event.request.url.includes('/tables/')) {
                            return new Response(JSON.stringify({
                                data: [],
                                total: 0,
                                message: 'offline_mode'
                            }), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        // 기타 요청의 경우 기본 오류 응답
                        return new Response('Network Error', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
            .catch((error) => {
                console.error('캐시 매치 실패:', error);
                
                // 캐시 매치 실패 시 기본 응답 반환
                return new Response('Cache Error', {
                    status: 500,
                    statusText: 'Internal Server Error'
                });
            })
    );
});

console.log('✅ Service Worker 설정 완료');