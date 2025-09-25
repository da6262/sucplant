/**
 * Supabase 설정 및 초기화
 * 경산다육식물농장 관리시스템 - Supabase 연동 모듈
 */

// Supabase 설정 (프로덕션 모드)
const SUPABASE_CONFIG = {
    // 실제 Supabase 프로젝트 정보
    url: "https://bigjqermlhbipjsnyhmt.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ2pxZXJtbGhiaXBqc255aG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjE5NjIsImV4cCI6MjA3MzgzNzk2Mn0.OF5NshUeFx62ntIL_LrAdxAcSNebLN2ioZGadawl1hE",
    disabled: false, // 프로덕션 모드 활성화
    
    // 테이블 이름 매핑
    tables: {
        customers: 'farm_customers',
        orders: 'farm_orders', 
        products: 'farm_products',
        categories: 'farm_categories',
        waitlist: 'farm_waitlist',
        order_sources: 'farm_channels', // order_sources는 farm_channels 테이블 사용
        channels: 'farm_channels',
        orderStatuses: 'farm_order_statuses',
        shippingRules: 'farm_shipping_rules',
        customerGrades: 'farm_customer_grades'
    }
};

// 전역으로 노출
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// Supabase 클라이언트 초기화
let supabase = null;

/**
 * Supabase 클라이언트 초기화
 */
function initializeSupabase() {
    try {
        // 강제 로컬 모드 체크
        if (window.FORCE_LOCAL_MODE) {
            console.log('🛑 강제 로컬 모드: Supabase API 완전 비활성화');
            SUPABASE_CONFIG.disabled = true;
            return false;
        }
        
        // 모드 스위치 시스템 체크
        if (window.MODE_SWITCH && window.MODE_SWITCH.getCurrentMode() === 'local') {
            console.log('🏠 로컬 모드: Supabase API 비활성화됨');
            SUPABASE_CONFIG.disabled = true;
            return false;
        }
        
        // 로컬 모드 - Supabase 비활성화
        if (SUPABASE_CONFIG.disabled) {
            console.log('🏠 로컬 모드: Supabase API 비활성화됨');
            return false;
        }
        
        // URL과 키가 설정되지 않은 경우
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || 
            SUPABASE_CONFIG.url === 'https://your-project.supabase.co' ||
            SUPABASE_CONFIG.anonKey === 'your-anon-key-here') {
            console.warn('⚠️ Supabase URL 또는 키가 설정되지 않았습니다.');
            console.log('💡 enableSupabaseProduction() 함수를 사용하여 실제 설정을 활성화하세요.');
            SUPABASE_CONFIG.disabled = true;
            return false;
        }
        
        // 이미 초기화된 경우 중복 초기화 방지
        if (window.supabaseClient && window.supabaseClient._isInitialized) {
            console.log('✅ Supabase 클라이언트 이미 초기화됨 - 중복 초기화 방지');
            supabase = window.supabaseClient;
            return true;
        }

        // Supabase 클라이언트가 로드되었는지 확인
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase 클라이언트가 로드되지 않았습니다. CDN 스크립트를 확인하세요.');
            return false;
        }
        
        // createClient를 사용하여 Supabase 클라이언트 생성
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        // 중복 초기화 방지를 위한 플래그 설정
        if (supabase) {
            supabase._isInitialized = true;
            window.supabaseClient = supabase;
        }
        
        console.log('✅ Supabase 클라이언트 초기화 성공');
        console.log('🌐 Supabase URL:', SUPABASE_CONFIG.url);
        return true;
    } catch (error) {
        console.error('❌ Supabase 초기화 실패:', error);
        return false;
    }
}

// 전역으로 노출
window.initializeSupabase = initializeSupabase;

/**
 * Supabase 연결 상태 확인
 */
async function checkSupabaseConnection() {
    if (!supabase) {
        return { connected: false, error: 'Supabase 클라이언트가 초기화되지 않음' };
    }
    
    try {
        // 간단한 쿼리로 연결 테스트
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.customers)
            .select('count')
            .limit(1);
            
        if (error) {
            return { connected: false, error: error.message };
        }
        
        return { connected: true, data };
    } catch (error) {
        return { connected: false, error: error.message };
    }
}

/**
 * 테이블 이름 가져오기
 */
function getTableName(localStorageKey) {
    // localStorage 키를 Supabase 테이블 이름으로 매핑
    const keyMapping = {
        'farm_customers': SUPABASE_CONFIG.tables.customers,
        'farm_orders': SUPABASE_CONFIG.tables.orders,
        'farm_products': SUPABASE_CONFIG.tables.products,
        'farm_categories': SUPABASE_CONFIG.tables.categories,
        'farm_waitlist': SUPABASE_CONFIG.tables.waitlist,
        'order_sources': SUPABASE_CONFIG.tables.order_sources,
        'farm_channels': SUPABASE_CONFIG.tables.channels,
        'farm_order_statuses': SUPABASE_CONFIG.tables.orderStatuses,
        'farm_shipping_rules': SUPABASE_CONFIG.tables.shippingRules,
        'farm_customer_grades': SUPABASE_CONFIG.tables.customerGrades
    };
    
    return keyMapping[localStorageKey] || localStorageKey;
}

// 전역으로 노출
window.SupabaseConfig = {
    config: SUPABASE_CONFIG,
    initialize: initializeSupabase,
    checkConnection: checkSupabaseConnection,
    getTableName: getTableName,
    getClient: () => supabase
};

console.log('📦 Supabase 설정 모듈 로드 완료');

