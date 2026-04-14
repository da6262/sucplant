/**
 * 긴급 Supabase 디버깅 스크립트
 * 경산다육식물농장 관리시스템 - 즉시 실행 가능한 디버깅
 */

// 즉시 실행되는 긴급 디버깅
console.log('🚨 긴급 Supabase 디버깅 시작...');

// 1. 기본 설정 확인
console.log('=== 1. 기본 설정 확인 ===');
console.log('window.SUPABASE_PRODUCTION_CONFIG:', window.SUPABASE_PRODUCTION_CONFIG);
console.log('window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
console.log('window.supabase:', typeof window.supabase);

// 2. 설정값 상세 확인
if (window.SUPABASE_PRODUCTION_CONFIG) {
    console.log('=== 2. SUPABASE_PRODUCTION_CONFIG 상세 ===');
    console.log('URL:', window.SUPABASE_PRODUCTION_CONFIG.url);
    console.log('URL 길이:', window.SUPABASE_PRODUCTION_CONFIG.url?.length);
    console.log('anonKey:', window.SUPABASE_PRODUCTION_CONFIG.anonKey);
    console.log('anonKey 길이:', window.SUPABASE_PRODUCTION_CONFIG.anonKey?.length);
    console.log('anonKey 시작:', window.SUPABASE_PRODUCTION_CONFIG.anonKey?.substring(0, 20));
    console.log('anonKey 끝:', window.SUPABASE_PRODUCTION_CONFIG.anonKey?.substring(-20));
}

if (window.SUPABASE_CONFIG) {
    console.log('=== 3. SUPABASE_CONFIG 상세 ===');
    console.log('URL:', window.SUPABASE_CONFIG.url);
    console.log('URL 길이:', window.SUPABASE_CONFIG.url?.length);
    console.log('anonKey:', window.SUPABASE_CONFIG.anonKey);
    console.log('anonKey 길이:', window.SUPABASE_CONFIG.anonKey?.length);
    console.log('disabled:', window.SUPABASE_CONFIG.disabled);
}

// 3. Supabase 클라이언트 상태 확인
console.log('=== 4. Supabase 클라이언트 상태 ===');
console.log('window.supabase 타입:', typeof window.supabase);
if (window.supabase) {
    console.log('createClient 함수:', typeof window.supabase.createClient);
    console.log('from 함수:', typeof window.supabase.from);
}

// 4. 설정 동기화 시도
console.log('=== 5. 설정 동기화 시도 ===');
if (window.SUPABASE_PRODUCTION_CONFIG && !window.SUPABASE_CONFIG) {
    window.SUPABASE_CONFIG = { ...window.SUPABASE_PRODUCTION_CONFIG };
    window.SUPABASE_CONFIG.disabled = false;
    console.log('✅ SUPABASE_CONFIG로 복사 완료');
    console.log('새로운 URL:', window.SUPABASE_CONFIG.url);
    console.log('새로운 anonKey 길이:', window.SUPABASE_CONFIG.anonKey?.length);
}

// 5. 즉시 연결 테스트
console.log('=== 6. 즉시 연결 테스트 ===');
if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
    try {
        console.log('🔄 createClient 시도...');
        console.log('사용할 URL:', window.SUPABASE_CONFIG.url);
        console.log('사용할 Key:', window.SUPABASE_CONFIG.anonKey?.substring(0, 20) + '...');
        
        const testClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
        
        console.log('✅ createClient 성공!');
        console.log('testClient:', testClient);
        console.log('from 함수:', typeof testClient.from);
        
        // 간단한 테스트 쿼리
        testClient.from('farm_customers').select('count').limit(1).then(result => {
            console.log('✅ 테스트 쿼리 성공:', result);
        }).catch(error => {
            console.error('❌ 테스트 쿼리 실패:', error);
        });
        
    } catch (error) {
        console.error('❌ createClient 실패:', error);
        console.error('에러 상세:', error.message);
    }
} else {
    console.error('❌ 연결 테스트 불가 - 필요한 요소가 없음');
    console.log('supabase 존재:', !!window.supabase);
    console.log('createClient 존재:', !!(window.supabase && window.supabase.createClient));
    console.log('SUPABASE_CONFIG 존재:', !!window.SUPABASE_CONFIG);
}

console.log('🚨 긴급 디버깅 완료');
