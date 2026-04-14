/**
 * 긴급 Supabase 초기화 수정 스크립트
 * 경산다육식물농장 관리시스템 - Supabase 클라이언트 초기화 문제 해결
 */

// 긴급 Supabase 초기화 함수
async function emergencySupabaseInit() {
    console.log('🚨 긴급 Supabase 초기화 시작...');
    
    try {
        // 1. Supabase 설정 확인
        if (!window.SUPABASE_CONFIG && window.SUPABASE_PRODUCTION_CONFIG) {
            window.SUPABASE_CONFIG = window.SUPABASE_PRODUCTION_CONFIG;
            console.log('✅ SUPABASE_PRODUCTION_CONFIG를 SUPABASE_CONFIG로 설정');
        }
        
        if (!window.SUPABASE_CONFIG) {
            console.error('❌ Supabase 설정이 없습니다.');
            return false;
        }
        
        // 2. Supabase 클라이언트 수동 초기화
        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
            console.log('🔄 Supabase 클라이언트 수동 초기화...');
            
            // Supabase 클라이언트 스크립트 로드
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3';
            script.onload = () => {
                console.log('✅ Supabase 클라이언트 스크립트 로드 완료');
                
                // 클라이언트 생성
                window.supabase = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                
                console.log('✅ Supabase 클라이언트 초기화 완료');
                
                // 연결 테스트
                testSupabaseConnection();
            };
            document.head.appendChild(script);
            
            return true;
        }
        
        // 3. 기존 클라이언트 재초기화
        if (window.supabase && window.supabase.createClient) {
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 재초기화 완료');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 긴급 Supabase 초기화 실패:', error);
        return false;
    }
}

// Supabase 연결 테스트
async function testSupabaseConnection() {
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase 클라이언트가 없습니다.');
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

// 실시간 동기화 비활성화
function disableRealtimeSync() {
    console.log('🔄 실시간 동기화 비활성화...');
    
    if (window.realtimeSyncManager) {
        window.realtimeSyncManager.destroy();
        console.log('✅ 실시간 동기화 비활성화 완료');
    }
}

// 데이터 마이그레이션 (Supabase 없이)
async function migrateDataWithoutSupabase() {
    console.log('🔄 Supabase 없이 데이터 마이그레이션...');
    
    try {
        const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
        
        for (const table of tables) {
            const key = getLocalStorageKey(table);
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            console.log(`📊 ${table}: ${data.length}개 데이터 확인`);
        }
        
        console.log('✅ 로컬 데이터 확인 완료');
        return true;
    } catch (error) {
        console.error('❌ 데이터 마이그레이션 실패:', error);
        return false;
    }
}

// 긴급 전환 실행
async function emergencyMigration() {
    console.log('🚨 긴급 전환 실행...');
    
    try {
        // 1. 실시간 동기화 비활성화
        disableRealtimeSync();
        
        // 2. Supabase 초기화
        const supabaseReady = await emergencySupabaseInit();
        
        if (supabaseReady) {
            // 3. 연결 테스트
            const connected = await testSupabaseConnection();
            
            if (connected) {
                console.log('✅ Supabase 연결 성공');
                // 4. 데이터 마이그레이션
                if (typeof window.migrateLocalStorageToSupabase === 'function') {
                    await window.migrateLocalStorageToSupabase();
                }
            } else {
                console.warn('⚠️ Supabase 연결 실패, 로컬 모드로 계속');
            }
        }
        
        // 5. 로컬 데이터 확인
        await migrateDataWithoutSupabase();
        
        console.log('🎉 긴급 전환 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ 긴급 전환 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.emergencySupabaseInit = emergencySupabaseInit;
window.testSupabaseConnection = testSupabaseConnection;
window.disableRealtimeSync = disableRealtimeSync;
window.migrateDataWithoutSupabase = migrateDataWithoutSupabase;
window.emergencyMigration = emergencyMigration;

console.log('✅ 긴급 Supabase 수정 스크립트 로드 완료');
console.log('🚨 사용법: emergencyMigration() - 긴급 전환 실행');
