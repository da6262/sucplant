/**
 * Supabase 초기화 수정 스크립트
 * 경산다육식물농장 관리시스템 - Supabase 클라이언트 초기화 문제 해결
 */

/**
 * Supabase 클라이언트 강제 초기화
 */
async function forceSupabaseInitialization() {
    console.log('🔧 Supabase 클라이언트 강제 초기화 시작...');
    
    try {
        // 1. Supabase 설정 확인 및 초기화
        if (!window.SUPABASE_CONFIG) {
            console.log('🔄 SUPABASE_CONFIG가 없습니다. SUPABASE_PRODUCTION_CONFIG에서 초기화...');
            if (window.SUPABASE_PRODUCTION_CONFIG) {
                window.SUPABASE_CONFIG = { ...window.SUPABASE_PRODUCTION_CONFIG };
                window.SUPABASE_CONFIG.disabled = false;
                console.log('✅ SUPABASE_CONFIG 초기화 완료');
            } else {
                console.warn('⚠️ Supabase 설정이 없습니다.');
                return false;
            }
        }
        
        if (window.SUPABASE_CONFIG.disabled) {
            console.warn('⚠️ Supabase 설정이 비활성화되어 있습니다.');
            return false;
        }

        // 2. Supabase CDN이 로드되었는지 확인
        if (typeof window.supabase === 'undefined') {
            console.log('🔄 Supabase CDN 로드 중...');
            
            // CDN 스크립트 동적 로드
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3';
            
            // CDN 로드 대기
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('✅ Supabase CDN 로드 완료');
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Supabase CDN 로드 실패');
                    reject(new Error('CDN 로드 실패'));
                };
                document.head.appendChild(script);
                
                // 타임아웃 설정
                setTimeout(() => {
                    reject(new Error('CDN 로드 시간 초과'));
                }, 10000);
            });
        }

        // 3. Supabase 클라이언트 초기화
        return initializeSupabaseClient();
        
    } catch (error) {
        console.error('❌ Supabase 강제 초기화 실패:', error);
        return false;
    }
}

/**
 * Supabase 클라이언트 초기화
 */
function initializeSupabaseClient() {
    try {
        // Supabase 클라이언트가 이미 초기화되었는지 확인
        if (window.supabase && typeof window.supabase.from === 'function') {
            console.log('✅ Supabase 클라이언트가 이미 초기화되어 있습니다.');
            return true;
        }

        // Supabase 클라이언트 생성
        if (window.supabase && window.supabase.createClient) {
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 초기화 완료');
            
            // 연결 테스트
            testSupabaseConnection();
            return true;
        } else {
            console.error('❌ Supabase 클라이언트 생성 함수를 찾을 수 없습니다.');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        return false;
    }
}

/**
 * Supabase 연결 테스트
 */
async function testSupabaseConnection() {
    try {
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return false;
        }

        // 간단한 쿼리로 연결 테스트
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
 * 실시간 동기화 재시작
 */
function restartRealtimeSync() {
    try {
        if (window.realtimeSyncManager) {
            console.log('🔄 실시간 동기화 재시작...');
            
            // 기존 구독 해제
            window.realtimeSyncManager.clearRealtimeSubscriptions();
            
            // 새로운 구독 설정
            window.realtimeSyncManager.setupRealtimeSubscriptions();
            
            console.log('✅ 실시간 동기화 재시작 완료');
            return true;
        } else {
            console.warn('⚠️ 실시간 동기화 매니저를 찾을 수 없습니다.');
            return false;
        }
    } catch (error) {
        console.error('❌ 실시간 동기화 재시작 실패:', error);
        return false;
    }
}

/**
 * 완전한 Supabase 초기화 및 재시작
 */
async function completeSupabaseRestart() {
    console.log('🚀 완전한 Supabase 초기화 및 재시작...');
    
    try {
        // 1. Supabase 클라이언트 강제 초기화
        const initialized = await forceSupabaseInitialization();
        if (!initialized) {
            console.error('❌ Supabase 초기화 실패 - 로컬 모드로 계속 진행');
            // 로컬 모드 폴백 활성화
            if (window.enableLocalModeFallback) {
                window.enableLocalModeFallback();
            }
            return false;
        }

        // 2. 연결 테스트
        const connected = await testSupabaseConnection();
        if (!connected) {
            console.warn('⚠️ Supabase 연결 실패, 로컬 모드로 계속');
        } else {
            console.log('✅ Supabase 연결 성공');
        }

        // 3. 실시간 동기화 재시작
        restartRealtimeSync();

        console.log('🎉 Supabase 초기화 및 재시작 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase 초기화 및 재시작 실패:', error);
        console.log('🔄 로컬 모드로 계속 진행합니다.');
        return false;
    }
}

// 전역 함수로 등록
window.forceSupabaseInitialization = forceSupabaseInitialization;
window.initializeSupabaseClient = initializeSupabaseClient;
window.testSupabaseConnection = testSupabaseConnection;
window.restartRealtimeSync = restartRealtimeSync;
window.completeSupabaseRestart = completeSupabaseRestart;

// 자동 초기화 시도
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 자동 Supabase 초기화 시도...');
    setTimeout(async () => {
        try {
            await completeSupabaseRestart();
        } catch (error) {
            console.error('❌ 자동 초기화 실패:', error);
            console.log('🔄 로컬 모드로 계속 진행합니다.');
        }
    }, 2000);
});

// 로컬 모드 폴백 함수
function enableLocalMode() {
    console.log('🏠 로컬 모드 활성화...');
    
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
    
    console.log('✅ 로컬 모드 활성화 완료');
}

// 전역 함수로 등록
window.enableLocalMode = enableLocalMode;

console.log('✅ Supabase 초기화 수정 스크립트 로드 완료');
console.log('🚀 사용법: completeSupabaseRestart() - 완전한 Supabase 재시작');
console.log('🏠 사용법: enableLocalMode() - 로컬 모드 활성화');
