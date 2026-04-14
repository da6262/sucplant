/**
 * Supabase 전역 클라이언트 수정 스크립트
 * 경산다육식물농장 관리시스템 - Supabase 클라이언트 전역 할당 문제 해결
 */

/**
 * Supabase 클라이언트 전역 할당 보장
 */
async function ensureSupabaseGlobalClient() {
    console.log('🔧 Supabase 전역 클라이언트 할당 보장...');
    
    try {
        // 1. 설정 확인 및 초기화
        if (!window.SUPABASE_CONFIG) {
            console.log('🔄 SUPABASE_CONFIG가 없습니다. SUPABASE_PRODUCTION_CONFIG에서 초기화...');
            if (window.SUPABASE_PRODUCTION_CONFIG) {
                window.SUPABASE_CONFIG = { ...window.SUPABASE_PRODUCTION_CONFIG };
                window.SUPABASE_CONFIG.disabled = false;
                console.log('✅ SUPABASE_CONFIG 초기화 완료');
                console.log('🔗 URL:', window.SUPABASE_CONFIG.url);
                console.log('🔑 anonKey 길이:', window.SUPABASE_CONFIG.anonKey?.length);
            } else {
                console.warn('⚠️ Supabase 설정이 없습니다.');
                return false;
            }
        }
        
        if (window.SUPABASE_CONFIG.disabled) {
            console.warn('⚠️ Supabase 설정이 비활성화되어 있습니다.');
            return false;
        }
        
        // 설정값 검증
        if (!window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
            console.error('❌ SUPABASE_CONFIG에 URL 또는 anonKey가 없습니다.');
            console.error('🔗 URL:', window.SUPABASE_CONFIG.url);
            console.error('🔑 anonKey:', window.SUPABASE_CONFIG.anonKey);
            return false;
        }
        
        // URL 형식 검증
        if (!window.SUPABASE_CONFIG.url.startsWith('https://') || !window.SUPABASE_CONFIG.url.includes('.supabase.co')) {
            console.error('❌ SUPABASE_CONFIG URL 형식이 잘못되었습니다:', window.SUPABASE_CONFIG.url);
            return false;
        }
        
        // anonKey 형식 검증
        const keyParts = window.SUPABASE_CONFIG.anonKey.split('.');
        if (keyParts.length !== 3) {
            console.error('❌ SUPABASE_CONFIG anonKey 형식이 잘못되었습니다 (JWT 형식이 아님)');
            console.error('🔑 anonKey:', window.SUPABASE_CONFIG.anonKey);
            return false;
        }
        
        console.log('✅ SUPABASE_CONFIG 검증 통과');

        // 2. Supabase CDN 로드 확인 및 대기
        if (typeof window.supabase === 'undefined') {
            console.log('🔄 Supabase CDN 로드 대기...');
            await waitForSupabaseCDN();
        }

        // 3. Supabase 클라이언트 생성 및 전역 할당
        if (window.supabase && window.supabase.createClient) {
            // =======================================================
            // 👇 디버깅 코드 추가 - createClient 호출 직전 값 확인
            console.log("===== Supabase 전역 클라이언트 초기화 시도 직전 값 확인 =====");
            console.log("URL:", window.SUPABASE_CONFIG.url);
            console.log("Key:", window.SUPABASE_CONFIG.anonKey);
            console.log("URL 길이:", window.SUPABASE_CONFIG.url?.length);
            console.log("Key 길이:", window.SUPABASE_CONFIG.anonKey?.length);
            console.log("==========================================");
            // =======================================================
            
            const client = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            
            // 전역 할당 보장
            window.supabase = client;
            
            // 추가 검증
            if (typeof window.supabase.from === 'function') {
                console.log('✅ Supabase 클라이언트 전역 할당 완료');
                return true;
            } else {
                console.error('❌ Supabase 클라이언트 할당 후 검증 실패');
                return false;
            }
        } else {
            console.error('❌ Supabase CDN이 로드되지 않았습니다.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Supabase 전역 클라이언트 할당 실패:', error);
        return false;
    }
}

/**
 * Supabase CDN 로드 대기 (다중 CDN 소스 지원)
 */
async function waitForSupabaseCDN() {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase CDN이 이미 로드되어 있습니다.');
            resolve();
            return;
        }

        // HTML에서 이미 로드된 스크립트 확인
        const existingScript = document.querySelector('script[src*="supabase-js"]');
        if (existingScript) {
            console.log('🔄 기존 Supabase 스크립트 감지, 로드 대기...');
            const checkInterval = setInterval(() => {
                if (typeof window.supabase !== 'undefined') {
                    clearInterval(checkInterval);
                    console.log('✅ 기존 Supabase 스크립트 로드 완료');
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ 기존 스크립트 로드 시간 초과, 새로 로드 시도');
                loadSupabaseFromMultipleSources(resolve, reject);
            }, 5000);
            return;
        }

        // 새로 로드 시도
        loadSupabaseFromMultipleSources(resolve, reject);
    });
}

/**
 * 다중 CDN 소스에서 Supabase 로드 시도
 */
function loadSupabaseFromMultipleSources(resolve, reject) {
    const cdnSources = [
        'https://unpkg.com/@supabase/supabase-js@2.39.3',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3',
        'https://cdn.skypack.dev/@supabase/supabase-js@2.39.3'
    ];
    
    let currentIndex = 0;
    
    function tryNextSource() {
        if (currentIndex >= cdnSources.length) {
            console.error('❌ 모든 CDN 소스 로드 실패');
            reject(new Error('모든 CDN 소스 로드 실패'));
            return;
        }
        
        const script = document.createElement('script');
        script.src = cdnSources[currentIndex];
        
        console.log(`🔄 CDN 소스 ${currentIndex + 1}/${cdnSources.length} 시도: ${cdnSources[currentIndex]}`);
        
        script.onload = () => {
            console.log(`✅ CDN 소스 ${currentIndex + 1} 로드 성공`);
            resolve();
        };
        
        script.onerror = () => {
            console.warn(`⚠️ CDN 소스 ${currentIndex + 1} 로드 실패`);
            currentIndex++;
            tryNextSource();
        };
        
        document.head.appendChild(script);
        
        // 타임아웃 설정
        setTimeout(() => {
            console.warn(`⚠️ CDN 소스 ${currentIndex + 1} 로드 시간 초과`);
            currentIndex++;
            tryNextSource();
        }, 8000);
    }
    
    tryNextSource();
}

/**
 * Supabase 클라이언트 상태 검증
 */
function validateSupabaseClient() {
    try {
        if (!window.supabase) {
            console.warn('⚠️ window.supabase가 없습니다.');
            return false;
        }
        
        if (typeof window.supabase.from !== 'function') {
            console.warn('⚠️ window.supabase.from이 함수가 아닙니다.');
            return false;
        }
        
        if (typeof window.supabase.createClient !== 'function') {
            console.warn('⚠️ window.supabase.createClient가 함수가 아닙니다.');
            return false;
        }
        
        console.log('✅ Supabase 클라이언트 상태 검증 통과');
        return true;
    } catch (error) {
        console.error('❌ Supabase 클라이언트 상태 검증 실패:', error);
        return false;
    }
}

/**
 * Supabase 연결 테스트
 */
async function testSupabaseConnection() {
    try {
        if (!validateSupabaseClient()) {
            return false;
        }

        const { data, error } = await window.supabase
            .from('farm_customers')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Supabase 연결 테스트 실패:', error);
            return false;
        }

        console.log('✅ Supabase 연결 테스트 성공');
        return true;
    } catch (error) {
        console.error('❌ Supabase 연결 테스트 중 오류:', error);
        return false;
    }
}

/**
 * 완전한 Supabase 클라이언트 초기화
 */
async function initializeSupabaseClientCompletely() {
    console.log('🚀 완전한 Supabase 클라이언트 초기화...');
    
    try {
        // 1. 전역 클라이언트 할당
        const assigned = await ensureSupabaseGlobalClient();
        if (!assigned) {
            console.error('❌ Supabase 클라이언트 할당 실패');
            // 로컬 모드로 전환
            enableLocalModeFallback();
            return false;
        }

        // 2. 연결 테스트
        const connected = await testSupabaseConnection();
        if (!connected) {
            console.warn('⚠️ Supabase 연결 실패, 로컬 모드로 계속');
            enableLocalModeFallback();
        }

        // 3. 실시간 동기화 재시작
        if (window.realtimeSyncManager) {
            console.log('🔄 실시간 동기화 재시작...');
            window.realtimeSyncManager.setupRealtimeSubscriptions();
        }

        console.log('🎉 Supabase 클라이언트 완전 초기화 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        // 로컬 모드로 전환
        enableLocalModeFallback();
        return false;
    }
}

/**
 * 로컬 모드 폴백 활성화
 */
function enableLocalModeFallback() {
    console.log('🏠 로컬 모드 폴백 활성화...');
    
    // SUPABASE_CONFIG를 로컬 모드로 설정
    if (!window.SUPABASE_CONFIG) {
        window.SUPABASE_CONFIG = {
            disabled: true,
            url: null,
            anonKey: null
        };
    } else {
        window.SUPABASE_CONFIG.disabled = true;
    }
    
    // 실시간 동기화 비활성화
    if (window.realtimeSyncManager) {
        window.realtimeSyncManager.clearRealtimeSubscriptions();
    }
    
    console.log('✅ 로컬 모드 폴백 활성화 완료 - 오프라인 모드로 작동');
}

/**
 * Supabase 클라이언트 강제 재생성
 */
function forceRecreateSupabaseClient() {
    console.log('🔄 Supabase 클라이언트 강제 재생성...');
    
    try {
        if (window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.disabled) {
            // 기존 클라이언트 제거
            delete window.supabase;
            
            // 새 클라이언트 생성
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                window.supabase = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('✅ Supabase 클라이언트 재생성 완료');
                return true;
            }
        }
        
        console.warn('⚠️ Supabase 클라이언트 재생성 불가');
        return false;
    } catch (error) {
        console.error('❌ Supabase 클라이언트 재생성 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.ensureSupabaseGlobalClient = ensureSupabaseGlobalClient;
window.validateSupabaseClient = validateSupabaseClient;
window.testSupabaseConnection = testSupabaseConnection;
window.initializeSupabaseClientCompletely = initializeSupabaseClientCompletely;
window.forceRecreateSupabaseClient = forceRecreateSupabaseClient;
window.enableLocalModeFallback = enableLocalModeFallback;

// 자동 초기화 시도
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 자동 Supabase 클라이언트 초기화 시도...');
    setTimeout(async () => {
        try {
            await initializeSupabaseClientCompletely();
        } catch (error) {
            console.error('❌ 자동 초기화 실패:', error);
        }
    }, 3000);
});

console.log('✅ Supabase 전역 클라이언트 수정 스크립트 로드 완료');
console.log('🚀 사용법: initializeSupabaseClientCompletely() - 완전한 Supabase 초기화');
console.log('🔧 사용법: forceRecreateSupabaseClient() - Supabase 클라이언트 강제 재생성');
