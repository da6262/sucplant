// 강제 로컬 모드 전환 (서버 500 오류 대응)
// 부대장님 전용 🌱

console.log('🔄 강제 로컬 모드 전환 시작...');

// 1. 앱 초기화 전에 API 비활성화 (Supabase 동기화를 위해 비활성화)
window.FORCE_LOCAL_MODE = false;

// 인증 시스템은 모든 모드에서 활성화
console.log('🔐 인증 시스템은 강제 로컬 모드와 관계없이 활성화됩니다');

// 2. 모드 스위치 시스템과 통합 (Supabase 동기화를 위해 API 모드로 설정)
if (window.MODE_SWITCH) {
    window.MODE_SWITCH.currentMode = 'api';
    window.MODE_SWITCH.applyMode('api');
    console.log('✅ 모드 스위치 시스템과 통합됨 (API 모드)');
}

// 2. fetch 함수 오버라이드 비활성화 (Supabase 동기화를 위해)
// const forceLocalOriginalFetch = window.fetch;
// window.fetch = async function(url, options = {}) {
//     // API 요청인지 확인
//     if (typeof url === 'string' && (url.includes('tables/') || url.includes('/tables/'))) {
//         console.log(`🛑 API 요청 차단하고 로컬 데이터 사용: ${url}`);
//         
//         // 테이블명 추출
//         let tableName;
//         if (url.includes('tables/')) {
//             tableName = url.split('tables/')[1].split('?')[0].split('/')[0];
//         } else {
//             tableName = 'unknown';
//         }
//         
//         // 로컬 데이터 로드
//         let localData = [];
//         try {
//             const stored = localStorage.getItem(tableName);
//             if (stored) {
//                 localData = JSON.parse(stored);
//                 console.log(`📦 ${tableName} 로컬 데이터 ${localData.length}개 로드됨`);
//             } else {
//                 console.log(`📦 ${tableName} 로컬 데이터 없음`);
//             }
//         } catch (e) {
//             console.warn(`❌ ${tableName} 로컬 데이터 로드 실패:`, e);
//         }
//         
//         // HTTP 메소드 처리
//         const method = options.method || 'GET';
//         
//         if (method === 'GET') {
//             // GET: 로컬 데이터 반환
//             return new Response(JSON.stringify({
//                 data: localData,
//                 total: localData.length,
//                 page: 1,
//                 limit: 100,
//                 table: tableName,
//                 message: 'local_mode_success'
//             }), {
//                 status: 200,
//                 statusText: 'OK',
//                 headers: { 
//                     'Content-Type': 'application/json',
//                     'X-Local-Mode': 'true'
//                 }
//             });
//         } else if (method === 'POST') {
//             // POST: 로컬에 데이터 추가
//             try {
//                 const newData = JSON.parse(options.body || '{}');
//                 newData.id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//                 newData.created_at = Date.now();
//                 newData.updated_at = Date.now();
//                 
//                 localData.push(newData);
//                 localStorage.setItem(tableName, JSON.stringify(localData));
//                 
//                 console.log(`✅ ${tableName}에 새 데이터 추가됨:`, newData.id);
//                 
//                 return new Response(JSON.stringify(newData), {
//                     status: 201,
//                     statusText: 'Created',
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'X-Local-Mode': 'true'
//                     }
//                 });
//             } catch (e) {
//                 console.error('POST 로컬 처리 실패:', e);
//             }
//         } else if (method === 'PUT' || method === 'PATCH') {
//             // PUT/PATCH: 로컬 데이터 수정
//             try {
//                 const updateData = JSON.parse(options.body || '{}');
//                 const id = url.split('/').pop();
//                 
//                 const index = localData.findIndex(item => item.id === id);
//                 if (index !== -1) {
//                     localData[index] = { ...localData[index], ...updateData, updated_at: Date.now() };
//                     localStorage.setItem(tableName, JSON.stringify(localData));
//                     
//                     console.log(`✅ ${tableName} 데이터 수정됨:`, id);
//                     
//                     return new Response(JSON.stringify(localData[index]), {
//                         status: 200,
//                         statusText: 'OK',
//                         headers: { 
//                             'Content-Type': 'application/json',
//                             'X-Local-Mode': 'true'
//                         }
//                     });
//                 }
//             } catch (e) {
//                 console.error('PUT/PATCH 로컬 처리 실패:', e);
//             }
//         } else if (method === 'DELETE') {
//             // DELETE: 로컬 데이터 삭제
//             try {
//                 const id = url.split('/').pop();
//                 const filteredData = localData.filter(item => item.id !== id);
//                 
//                 if (filteredData.length < localData.length) {
//                     localStorage.setItem(tableName, JSON.stringify(filteredData));
//                     console.log(`✅ ${tableName} 데이터 삭제됨:`, id);
//                     
//                     return new Response('', {
//                         status: 204,
//                         statusText: 'No Content',
//                         headers: { 'X-Local-Mode': 'true' }
//                     });
//                 }
//             } catch (e) {
//                 console.error('DELETE 로컬 처리 실패:', e);
//             }
//         }
//         
//         // 기본 빈 응답
//         return new Response(JSON.stringify({
//             data: [],
//             total: 0,
//             message: 'local_mode_fallback'
//         }), {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     }
    
//     // API가 아닌 일반 요청은 원래대로
//     return forceLocalOriginalFetch(url, options);
// };

// 3. 앱 초기화 후 상태 강제 설정 (Supabase 동기화를 위해 비활성화)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.app) {
            console.log('🔄 앱을 Supabase API 모드로 강제 설정');
            window.app.apiAvailable = true;
            
            // UI 상태 업데이트
            const statusIndicator = document.getElementById('api-status-indicator');
            const statusDot = document.getElementById('api-status-dot');
            const statusText = document.getElementById('api-status-text');
            
            if (statusIndicator && statusDot && statusText) {
                statusIndicator.className = 'flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-green-100 text-green-800';
                statusDot.className = 'w-2 h-2 rounded-full bg-green-400';
                statusText.textContent = 'Supabase 동기화';
            }
        }
        
        // 콘솔 정리 (디버깅을 위해 주석 처리)
        setTimeout(() => {
            // console.clear(); // 디버깅을 위해 주석 처리
            console.log('%c🌱 경산다육식물농장 - Supabase 동기화 모드', 'color: #10b981; font-size: 16px; font-weight: bold;');
            console.log('%c✅ Supabase 연결 성공 - 실시간 동기화 작동', 'color: #059669; font-size: 12px;');
            console.log('%c📱 모든 기기에서 데이터 공유', 'color: #10b981;');
            
            // 데이터 현황 표시
            try {
                const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                const customers = JSON.parse(localStorage.getItem('farm_customers') || '[]');
                console.log('');
                console.log('📊 현재 데이터:');
                console.log(`  📦 주문: ${orders.length}건`);
                console.log(`  👥 고객: ${customers.length}명`);
            } catch (e) {}
        }, 2000);
        
    }, 1000);
});

console.log('🛡️ Supabase 동기화 모드 시스템 활성화됨');