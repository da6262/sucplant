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
    
    // 설정 검증
    if (!SUPABASE_PRODUCTION_CONFIG.url || SUPABASE_PRODUCTION_CONFIG.url.includes('your-project')) {
        console.error('❌ Supabase URL이 설정되지 않았습니다');
        alert('❌ Supabase URL을 먼저 설정해주세요.\n\n1. Supabase 프로젝트 생성\n2. 이 파일에서 URL과 API Key 업데이트');
        return false;
    }
    
    if (!SUPABASE_PRODUCTION_CONFIG.anonKey || SUPABASE_PRODUCTION_CONFIG.anonKey.includes('your-anon-key')) {
        console.error('❌ Supabase API Key가 설정되지 않았습니다');
        alert('❌ Supabase API Key를 먼저 설정해주세요.\n\n1. Supabase 프로젝트 생성\n2. 이 파일에서 URL과 API Key 업데이트');
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
    try {
        console.log('🔄 Supabase 프로덕션 설정 비활성화...');
        
        // 백업된 설정으로 복원
        if (window.SUPABASE_CONFIG_BACKUP) {
            Object.assign(window.SUPABASE_CONFIG, window.SUPABASE_CONFIG_BACKUP);
            console.log('✅ Supabase 설정이 백업된 상태로 복원되었습니다');
        } else {
            // 기본 로컬 모드로 설정
            if (window.SUPABASE_CONFIG) {
                window.SUPABASE_CONFIG.disabled = true;
                window.SUPABASE_CONFIG.url = null;
                window.SUPABASE_CONFIG.anonKey = null;
            }
            console.log('✅ Supabase가 로컬 모드로 설정되었습니다');
        }
        
        // 앱 새로고침
        if (window.app) {
            window.app.refreshAllTabs();
        }
        
        alert('🔄 Supabase 프로덕션 설정이 비활성화되었습니다.\n이제 로컬 데이터를 사용합니다.');
        
        return true;
    } catch (error) {
        console.error('❌ Supabase 프로덕션 설정 비활성화 실패:', error);
        alert('❌ 설정 비활성화 실패\n다시 시도해주세요.');
        return false;
    }
};

// Supabase 연결 테스트 함수
window.testSupabaseConnection = async function() {
    try {
        console.log('🧪 Supabase 연결 테스트 시작...');
        
        if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
            console.error('❌ Supabase 설정이 완료되지 않았습니다');
            alert('❌ Supabase 설정을 먼저 완료해주세요.\n\n1. Supabase 프로젝트 생성\n2. URL과 API Key 설정\n3. 테이블 생성');
            return false;
        }
        
        // 간단한 API 호출 테스트
        const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/farm_customers?select=count&limit=1`, {
            headers: {
                'apikey': window.SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Supabase 연결 성공!');
            return true;
        } else {
            console.error('❌ Supabase 연결 실패:', response.status, response.statusText);
            alert(`❌ Supabase 연결 실패\n상태: ${response.status}\n설정을 확인해주세요.`);
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        alert('❌ Supabase 연결 실패\n네트워크 연결과 설정을 확인해주세요.');
        return false;
    }
};