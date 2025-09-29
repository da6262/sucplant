// Supabase 설정 파일
// 데이터베이스 연결 및 인증 설정

// Supabase 클라이언트 설정
export function getSupabaseClient() {
    return window.supabaseClient || window.SupabaseConfig?.getClient();
}

// Supabase 설정 초기화
export function initializeSupabase() {
    console.log('🔧 Supabase 설정 초기화');
    
    // 기존 설정이 있으면 사용
    if (window.supabaseClient) {
        console.log('✅ 기존 Supabase 클라이언트 사용');
        return window.supabaseClient;
    }
    
    // SupabaseConfig가 있으면 사용
    if (window.SupabaseConfig) {
        console.log('✅ SupabaseConfig를 통한 클라이언트 생성');
        return window.SupabaseConfig.getClient();
    }
    
    console.warn('⚠️ Supabase 클라이언트를 찾을 수 없습니다');
    return null;
}
