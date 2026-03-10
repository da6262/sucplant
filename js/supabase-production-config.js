/**
 * Supabase 프로덕션 설정
 * 실제 Supabase 프로젝트 정보
 * 경산다육식물농장 관리시스템
 */

// 실제 Supabase 프로젝트 설정
window.SUPABASE_PRODUCTION_CONFIG = window.SUPABASE_PRODUCTION_CONFIG || {
    // ⚠️ 실제 Supabase 프로젝트 정보로 교체 필요
    url: 'https://orodbihdndyzgaushsmy.supabase.co',  // ← 실제 Project URL 입력
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb2RiaWhkbmR5emdhdXNoc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzkwMzgsImV4cCI6MjA3NTY1NTAzOH0.Sv0_rGrWcu14gkPvFBn1r4WLfFGCSowexuWS3egbfag',           // ← 실제 anon key 입력
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb2RiaWhkbmR5emdhdXNoc215Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA3OTAzOCwiZXhwIjoyMDc1NjU1MDM4fQ.seV0po3SU5XHkwtQpPT07UIHux0bhkS621TQWUijWl0',     // ← 서버 사이드용 키
    
    // 전환 모드 설정
    migrationMode: true,  // 마이그레이션 모드 활성화
    autoSync: true,       // 자동 동기화 활성화
    realtimeEnabled: true, // 실시간 동기화 활성화
    
    // 테이블 이름 매핑
    tables: {
        farm_customers: 'farm_customers',
        orders: 'farm_orders', 
        products: 'farm_products',
        categories: 'farm_categories',
        waitlist: 'farm_waitlist',
        channels: 'farm_channels',
        orderStatuses: 'farm_order_statuses',
        shippingRules: 'farm_shipping_rules',
        customerGrades: 'farm_customer_grades'
    }
};

// 프로덕션 설정 활성화 함수
window.enableSupabaseProduction = function() {
    console.log('🚀 Supabase 프로덕션 설정 활성화...');
    
    // 강제 로컬 모드가 활성화된 경우 차단
    if (window.FORCE_LOCAL_MODE) {
        console.warn('🛑 강제 로컬 모드로 인해 Supabase 프로덕션 설정 불가');
        alert('현재 강제 로컬 모드가 활성화되어 있습니다.\nSupabase 프로덕션 설정을 활성화할 수 없습니다.');
        return false;
    }
    
    // 모드 스위치 시스템 체크
    if (window.MODE_SWITCH && window.MODE_SWITCH.getCurrentMode() === 'local') {
        console.warn('🏠 로컬 모드로 인해 Supabase 프로덕션 설정 불가');
        alert('현재 로컬 모드입니다.\nAPI 모드로 전환 후 Supabase 프로덕션 설정을 활성화하세요.');
        return false;
    }
    
    try {
        // 기존 설정 백업
        if (window.SUPABASE_CONFIG) {
            window.SUPABASE_CONFIG_BACKUP = { ...window.SUPABASE_CONFIG };
        }
        
        // 프로덕션 설정 적용
        if (window.SUPABASE_CONFIG) {
            window.SUPABASE_CONFIG.url = SUPABASE_PRODUCTION_CONFIG.url;
            window.SUPABASE_CONFIG.anonKey = SUPABASE_PRODUCTION_CONFIG.anonKey;
            window.SUPABASE_CONFIG.disabled = false;
            window.SUPABASE_CONFIG.tables = SUPABASE_PRODUCTION_CONFIG.tables;
        }
        
        console.log('✅ Supabase 프로덕션 설정 적용 완료');
        
        // Supabase 클라이언트 재초기화
        if (typeof window.initializeSupabase === 'function') {
            window.initializeSupabase();
        }
        
        // 앱 새로고침
        if (window.app) {
            window.app.refreshAllTabs();
        }
        
        alert('🎉 Supabase 프로덕션 설정 활성화 완료!\n이제 실제 서버 데이터를 사용합니다.');
        
        return true;
    } catch (error) {
        console.error('❌ Supabase 프로덕션 설정 실패:', error);
        alert('❌ Supabase 프로덕션 설정 실패\n설정을 확인해주세요.');
        return false;
    }
};

// 프로덕션 설정 비활성화 함수
window.disableSupabaseProduction = function() {
    console.log('🔄 Supabase 프로덕션 설정 비활성화...');
    
    try {
        // 백업된 설정 복원
        if (window.SUPABASE_CONFIG_BACKUP) {
            window.SUPABASE_CONFIG = { ...window.SUPABASE_CONFIG_BACKUP };
            delete window.SUPABASE_CONFIG_BACKUP;
        } else {
            // 기본 로컬 모드 설정
            if (window.SUPABASE_CONFIG) {
                window.SUPABASE_CONFIG.url = null;
                window.SUPABASE_CONFIG.anonKey = null;
                window.SUPABASE_CONFIG.disabled = true;
            }
        }
        
        console.log('✅ Supabase 프로덕션 설정 비활성화 완료');
        
        // 앱 새로고침
        if (window.app) {
            window.app.refreshAllTabs();
        }
        
        return true;
    } catch (error) {
        console.error('❌ Supabase 프로덕션 설정 비활성화 실패:', error);
        return false;
    }
};

// 설정 상태 확인 함수
window.checkSupabaseProductionStatus = function() {
    if (!window.SUPABASE_CONFIG) {
        console.log('❌ Supabase 설정이 없습니다.');
        return false;
    }
    
    const isProduction = !window.SUPABASE_CONFIG.disabled && 
                        window.SUPABASE_CONFIG.url && 
                        window.SUPABASE_CONFIG.url !== 'https://your-project.supabase.co';
    
    console.log(`📊 Supabase 프로덕션 상태: ${isProduction ? '활성화' : '비활성화'}`);
    console.log(`🔗 URL: ${window.SUPABASE_CONFIG.url || '설정되지 않음'}`);
    console.log(`🔑 Key: ${window.SUPABASE_CONFIG.anonKey ? '설정됨' : '설정되지 않음'}`);
    
    return isProduction;
};

console.log('✅ Supabase 프로덕션 설정 모듈 로드 완료');

