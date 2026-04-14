/**
 * 긴급 Supabase 클라이언트 로더
 * CDN 로딩 실패 시 대체 로딩 방법
 */

// 긴급 Supabase 클라이언트 로드
async function emergencyLoadSupabase() {
    console.log('🚨 긴급 Supabase 클라이언트 로드 시작...');
    
    try {
        // 1. 기존 스크립트 제거
        const existingScripts = document.querySelectorAll('script[src*="supabase-js"]');
        existingScripts.forEach(script => script.remove());
        
        // 2. 새로운 CDN 시도
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3';
        script.onload = () => {
            console.log('✅ Supabase 클라이언트 로드 성공 (CDN)');
            initializeSupabaseClient();
        };
        script.onerror = () => {
            console.warn('⚠️ CDN 로드 실패, 대체 방법 시도...');
            loadSupabaseFromAlternative();
        };
        document.head.appendChild(script);
        
        return true;
    } catch (error) {
        console.error('❌ 긴급 Supabase 로드 실패:', error);
        return false;
    }
}

// 대체 로딩 방법
function loadSupabaseFromAlternative() {
    console.log('🔄 대체 Supabase 로딩 시도...');
    
    // 다른 CDN 시도
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3';
    script.onload = () => {
        console.log('✅ Supabase 클라이언트 로드 성공 (대체 CDN)');
        initializeSupabaseClient();
    };
    script.onerror = () => {
        console.error('❌ 모든 CDN 로드 실패');
        // 로컬 모드로 전환
        switchToLocalMode();
    };
    document.head.appendChild(script);
}

// Supabase 클라이언트 초기화
function initializeSupabaseClient() {
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 초기화 완료');
            return true;
        } else {
            console.error('❌ Supabase 클라이언트 초기화 실패');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 오류:', error);
        return false;
    }
}

// 로컬 모드로 전환
function switchToLocalMode() {
    console.log('🏠 로컬 모드로 전환...');
    
    // Supabase 비활성화
    if (window.SUPABASE_CONFIG) {
        window.SUPABASE_CONFIG.disabled = true;
    }
    
    // 로컬 데이터만 사용
    console.log('✅ 로컬 모드 활성화 완료');
    return true;
}

// 전역 함수로 등록
window.emergencyLoadSupabase = emergencyLoadSupabase;
window.loadSupabaseFromAlternative = loadSupabaseFromAlternative;
window.initializeSupabaseClient = initializeSupabaseClient;
window.switchToLocalMode = switchToLocalMode;

console.log('✅ 긴급 Supabase 로더 준비 완료');
