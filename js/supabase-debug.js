/**
 * Supabase 설정 디버깅 스크립트
 * 경산다육식물농장 관리시스템 - Supabase 설정값 검증
 */

/**
 * Supabase 설정값 검증 및 디버깅
 */
function debugSupabaseConfig() {
    console.log('🔍 Supabase 설정 디버깅 시작...');
    
    // 1. SUPABASE_PRODUCTION_CONFIG 확인
    console.log('📊 SUPABASE_PRODUCTION_CONFIG:', window.SUPABASE_PRODUCTION_CONFIG);
    
    if (window.SUPABASE_PRODUCTION_CONFIG) {
        console.log('✅ SUPABASE_PRODUCTION_CONFIG 존재');
        console.log('🔗 URL:', window.SUPABASE_PRODUCTION_CONFIG.url);
        console.log('🔑 anonKey 길이:', window.SUPABASE_PRODUCTION_CONFIG.anonKey?.length);
        console.log('🔑 anonKey 시작:', window.SUPABASE_PRODUCTION_CONFIG.anonKey?.substring(0, 20) + '...');
    } else {
        console.error('❌ SUPABASE_PRODUCTION_CONFIG가 없습니다.');
    }
    
    // 2. SUPABASE_CONFIG 확인
    console.log('📊 SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
    
    if (window.SUPABASE_CONFIG) {
        console.log('✅ SUPABASE_CONFIG 존재');
        console.log('🔗 URL:', window.SUPABASE_CONFIG.url);
        console.log('🔑 anonKey 길이:', window.SUPABASE_CONFIG.anonKey?.length);
        console.log('🔑 anonKey 시작:', window.SUPABASE_CONFIG.anonKey?.substring(0, 20) + '...');
        console.log('🚫 disabled:', window.SUPABASE_CONFIG.disabled);
    } else {
        console.warn('⚠️ SUPABASE_CONFIG가 없습니다.');
    }
    
    // 3. Supabase 클라이언트 상태 확인
    console.log('📊 window.supabase:', typeof window.supabase);
    if (window.supabase) {
        console.log('✅ window.supabase 존재');
        console.log('🔧 createClient 함수:', typeof window.supabase.createClient);
        console.log('🔧 from 함수:', typeof window.supabase.from);
    } else {
        console.warn('⚠️ window.supabase가 없습니다.');
    }
    
    return {
        hasProductionConfig: !!window.SUPABASE_PRODUCTION_CONFIG,
        hasConfig: !!window.SUPABASE_CONFIG,
        hasSupabaseClient: !!window.supabase,
        productionUrl: window.SUPABASE_PRODUCTION_CONFIG?.url,
        configUrl: window.SUPABASE_CONFIG?.url,
        productionKeyLength: window.SUPABASE_PRODUCTION_CONFIG?.anonKey?.length,
        configKeyLength: window.SUPABASE_CONFIG?.anonKey?.length
    };
}

/**
 * Supabase 설정 동기화
 */
function syncSupabaseConfig() {
    console.log('🔄 Supabase 설정 동기화...');
    
    try {
        // SUPABASE_PRODUCTION_CONFIG가 있으면 SUPABASE_CONFIG로 복사
        if (window.SUPABASE_PRODUCTION_CONFIG && !window.SUPABASE_CONFIG) {
            window.SUPABASE_CONFIG = { ...window.SUPABASE_PRODUCTION_CONFIG };
            console.log('✅ SUPABASE_PRODUCTION_CONFIG를 SUPABASE_CONFIG로 복사');
        }
        
        // SUPABASE_CONFIG가 있으면 SUPABASE_PRODUCTION_CONFIG로 복사
        if (window.SUPABASE_CONFIG && !window.SUPABASE_PRODUCTION_CONFIG) {
            window.SUPABASE_PRODUCTION_CONFIG = { ...window.SUPABASE_CONFIG };
            console.log('✅ SUPABASE_CONFIG를 SUPABASE_PRODUCTION_CONFIG로 복사');
        }
        
        // 설정값 검증
        if (window.SUPABASE_CONFIG) {
            if (!window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
                console.error('❌ SUPABASE_CONFIG에 URL 또는 anonKey가 없습니다.');
                return false;
            }
            
            // URL 형식 검증
            if (!window.SUPABASE_CONFIG.url.startsWith('https://') || !window.SUPABASE_CONFIG.url.includes('.supabase.co')) {
                console.error('❌ SUPABASE_CONFIG URL 형식이 잘못되었습니다:', window.SUPABASE_CONFIG.url);
                return false;
            }
            
            // anonKey 형식 검증 (JWT 토큰은 보통 3개 부분으로 나뉨)
            const keyParts = window.SUPABASE_CONFIG.anonKey.split('.');
            if (keyParts.length !== 3) {
                console.error('❌ SUPABASE_CONFIG anonKey 형식이 잘못되었습니다 (JWT 형식이 아님)');
                return false;
            }
            
            console.log('✅ SUPABASE_CONFIG 검증 통과');
            return true;
        }
        
        console.error('❌ SUPABASE_CONFIG가 없습니다.');
        return false;
        
    } catch (error) {
        console.error('❌ Supabase 설정 동기화 실패:', error);
        return false;
    }
}

/**
 * Supabase 연결 테스트
 */
async function testSupabaseConnection() {
    console.log('🧪 Supabase 연결 테스트...');
    
    try {
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
            return false;
        }
        
        // 간단한 쿼리로 연결 테스트
        const { data, error } = await window.supabase
            .from('farm_customers')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase 연결 테스트 실패:', error);
            console.error('❌ 에러 상세:', error.message);
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
 * 완전한 Supabase 디버깅 및 수정
 */
async function debugAndFixSupabase() {
    console.log('🚀 Supabase 완전 디버깅 및 수정 시작...');
    
    // 1. 설정값 디버깅
    const debugInfo = debugSupabaseConfig();
    console.log('📊 디버깅 정보:', debugInfo);
    
    // 2. 설정 동기화
    const synced = syncSupabaseConfig();
    if (!synced) {
        console.error('❌ 설정 동기화 실패');
        return false;
    }
    
    // 3. Supabase 클라이언트 재초기화
    if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
        try {
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 재초기화 완료');
        } catch (error) {
            console.error('❌ Supabase 클라이언트 재초기화 실패:', error);
            return false;
        }
    }
    
    // 4. 연결 테스트
    const connected = await testSupabaseConnection();
    if (connected) {
        console.log('🎉 Supabase 디버깅 및 수정 완료!');
        return true;
    } else {
        console.error('❌ Supabase 연결 테스트 실패');
        return false;
    }
}

// 전역 함수로 등록
window.debugSupabaseConfig = debugSupabaseConfig;
window.syncSupabaseConfig = syncSupabaseConfig;
window.testSupabaseConnection = testSupabaseConnection;
window.debugAndFixSupabase = debugAndFixSupabase;

// 자동 디버깅 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 자동 Supabase 디버깅 실행...');
    setTimeout(() => {
        debugAndFixSupabase();
    }, 1000);
});

console.log('✅ Supabase 디버깅 스크립트 로드 완료');
console.log('🔍 사용법: debugAndFixSupabase() - 완전한 디버깅 및 수정');
