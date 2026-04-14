/**
 * Supabase 클라이언트 설정 및 초기화
 * 경산다육식물농장 관리시스템 - Supabase 통합
 */

// Supabase 클라이언트 초기화
let supabase = null;

/**
 * Supabase 클라이언트 초기화 (동기식)
 */
function initializeSupabaseClient() {
    try {
        // Supabase 설정 확인
        if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
            console.warn('⚠️ Supabase 설정이 완료되지 않았습니다.');
            return null;
        }

        // Supabase 클라이언트가 이미 로드되어 있는지 확인
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            // =======================================================
            // 👇 디버깅 코드 추가 - createClient 호출 직전 값 확인
            console.log("===== Supabase 초기화 시도 직전 값 확인 =====");
            console.log("URL:", window.SUPABASE_CONFIG.url);
            console.log("Key:", window.SUPABASE_CONFIG.anonKey);
            console.log("URL 길이:", window.SUPABASE_CONFIG.url?.length);
            console.log("Key 길이:", window.SUPABASE_CONFIG.anonKey?.length);
            console.log("==========================================");
            // =======================================================
            
            // 이미 로드된 경우 즉시 클라이언트 생성
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 초기화 완료 (기존)');
            return window.supabase;
        }

        // Supabase 클라이언트가 로드되지 않은 경우
        console.warn('⚠️ Supabase 클라이언트가 로드되지 않았습니다.');
        return null;
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        return null;
    }
}

/**
 * Supabase 클라이언트 비동기 초기화
 */
async function initializeSupabaseClientAsync() {
    try {
        // Supabase 설정 확인
        if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
            console.warn('⚠️ Supabase 설정이 완료되지 않았습니다.');
            return null;
        }

        // Supabase 클라이언트가 이미 로드되어 있는지 확인
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            // =======================================================
            // 👇 디버깅 코드 추가 - createClient 호출 직전 값 확인
            console.log("===== Supabase 비동기 초기화 시도 직전 값 확인 =====");
            console.log("URL:", window.SUPABASE_CONFIG.url);
            console.log("Key:", window.SUPABASE_CONFIG.anonKey);
            console.log("URL 길이:", window.SUPABASE_CONFIG.url?.length);
            console.log("Key 길이:", window.SUPABASE_CONFIG.anonKey?.length);
            console.log("==========================================");
            // =======================================================
            
            window.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase 클라이언트 초기화 완료 (비동기)');
            return window.supabase;
        }

        // Supabase 클라이언트 로드 대기
        console.log('🔄 Supabase 클라이언트 로드 대기 중...');
        
        // 최대 10초 대기
        for (let i = 0; i < 100; i++) {
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                window.supabase = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('✅ Supabase 클라이언트 초기화 완료 (대기 후)');
                return window.supabase;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.error('❌ Supabase 클라이언트 로드 시간 초과');
        return null;
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        return null;
    }
}

/**
 * Supabase 연결 테스트
 */
async function testSupabaseConnection() {
    try {
        if (!window.supabase) {
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
 * 데이터 동기화 (Supabase → LocalStorage)
 */
async function syncFromSupabaseToLocal(tableName) {
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return false;
        }

        console.log(`🔄 ${tableName} 데이터 동기화 시작...`);

        const { data, error } = await window.supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`❌ ${tableName} 데이터 로드 실패:`, error);
            return false;
        }

        // LocalStorage에 저장
        const key = getLocalStorageKey(tableName);
        localStorage.setItem(key, JSON.stringify(data || []));
        
        console.log(`✅ ${tableName} 데이터 동기화 완료: ${data?.length || 0}개`);
        return true;
    } catch (error) {
        console.error(`❌ ${tableName} 동기화 중 오류:`, error);
        return false;
    }
}

/**
 * 데이터 동기화 (LocalStorage → Supabase)
 */
async function syncFromLocalToSupabase(tableName) {
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return false;
        }

        console.log(`🔄 ${tableName} 데이터 업로드 시작...`);

        // LocalStorage에서 데이터 로드
        const key = getLocalStorageKey(tableName);
        const localData = JSON.parse(localStorage.getItem(key) || '[]');

        if (localData.length === 0) {
            console.log(`📋 ${tableName} 로컬 데이터가 없습니다.`);
            return true;
        }

        // Supabase에 업로드 (upsert 사용)
        const { data, error } = await window.supabase
            .from(tableName)
            .upsert(localData, { onConflict: 'id' });

        if (error) {
            console.error(`❌ ${tableName} 데이터 업로드 실패:`, error);
            return false;
        }

        console.log(`✅ ${tableName} 데이터 업로드 완료: ${localData.length}개`);
        return true;
    } catch (error) {
        console.error(`❌ ${tableName} 업로드 중 오류:`, error);
        return false;
    }
}

/**
 * 실시간 동기화 설정
 */
function setupRealtimeSync() {
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];

        tables.forEach(tableName => {
            const channel = window.supabase
                .channel(`${tableName}_changes`)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: tableName 
                    }, 
                    (payload) => {
                        console.log(`🔄 ${tableName} 실시간 변경 감지:`, payload);
                        
                        // LocalStorage 업데이트
                        syncFromSupabaseToLocal(tableName);
                        
                        // UI 새로고침
                        if (window.orderSystem && typeof window.orderSystem.refreshAllTabs === 'function') {
                            window.orderSystem.refreshAllTabs();
                        }
                    }
                )
                .subscribe();

            console.log(`✅ ${tableName} 실시간 동기화 설정 완료`);
        });
    } catch (error) {
        console.error('❌ 실시간 동기화 설정 실패:', error);
    }
}

/**
 * 전체 데이터 동기화
 */
async function syncAllData() {
    try {
        console.log('🔄 전체 데이터 동기화 시작...');

        const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
        let successCount = 0;

        for (const table of tables) {
            const success = await syncFromSupabaseToLocal(table);
            if (success) successCount++;
        }

        console.log(`✅ 전체 데이터 동기화 완료: ${successCount}/${tables.length} 테이블`);
        return successCount === tables.length;
    } catch (error) {
        console.error('❌ 전체 데이터 동기화 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.initializeSupabaseClient = initializeSupabaseClient;
window.initializeSupabaseClientAsync = initializeSupabaseClientAsync;
window.testSupabaseConnection = testSupabaseConnection;
window.syncFromSupabaseToLocal = syncFromSupabaseToLocal;
window.syncFromLocalToSupabase = syncFromLocalToSupabase;
window.setupRealtimeSync = setupRealtimeSync;
window.syncAllData = syncAllData;

console.log('✅ Supabase 클라이언트 모듈 로드 완료');
