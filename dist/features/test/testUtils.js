// 테스트 및 디버깅 유틸리티 함수들
// features/test/testUtils.js

// 정렬 테스트 함수 (전역)
function testProductSort(sortBy) {
    console.log('🧪 정렬 테스트 함수 호출:', sortBy);
    if (window.orderSystem) {
        window.orderSystem.changeProductSort(sortBy);
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

function testCustomerSort(sortBy) {
    console.log('🧪 고객 정렬 테스트 함수 호출:', sortBy);
    if (window.orderSystem) {
        window.orderSystem.changeCustomerSort(sortBy);
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

function testDashboardRefresh() {
    console.log('🧪 대시보드 새로고침 테스트 함수 호출');
    if (window.orderSystem) {
        window.orderSystem.updateRealtimeData();
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

function resetTestData() {
    console.log('🧪 테스트 데이터 초기화 및 재생성 (Supabase 전용)');
    
    // Supabase에서 데이터 초기화
    if (window.customerDataManager && window.orderDataManager && window.waitlistDataManager) {
        // 새로운 데이터 생성
        if (window.orderSystem) {
            window.orderSystem.createInitialDataIfNeeded();
        }
        
        // 데이터 다시 로드
        window.customerDataManager.loadCustomers();
        window.orderDataManager.loadOrders();
        window.waitlistDataManager.loadWaitlist();
        
        console.log('✅ 테스트 데이터 재생성 완료');
    } else {
        console.error('❌ 필요한 데이터 매니저를 찾을 수 없습니다');
    }
}

// 고객 등록 디버깅 함수 (전역)
function debugCustomerRegistration() {
    console.log('🔍 고객 등록 디버깅 시작...');
    
    if (!window.orderSystem) {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
        return;
    }
    
    // Supabase 전용 - LocalStorage 제거됨
    console.log('📊 Supabase 데이터 상태 확인 중...');
    
    if (window.customerDataManager) {
        const customers = window.customerDataManager.getAllCustomers();
        console.log('📊 Supabase 고객 데이터:', {
            데이터존재: customers.length > 0,
            데이터크기: customers.length
        });
    } else {
        console.log('⚠️ customerDataManager를 찾을 수 없습니다');
    }
    
    // Supabase에서 고객 데이터 확인
    if (window.customerDataManager) {
        const customers = window.customerDataManager.getAllCustomers();
        console.log('👥 현재 고객 목록:', customers);
        console.log('📈 고객 수:', customers.length);
    }
    
    // 테스트 고객 등록
    const testCustomer = {
        id: 'debug_' + Date.now(),
        name: '디버그 테스트 고객',
        phone: '010-1234-5678',
        address: '테스트 주소',
        memo: '디버깅용 테스트 고객',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    console.log('🧪 테스트 고객 등록 시도:', testCustomer);
    
    try {
        // 고객 등록 로직 실행
        if (window.orderSystem.addCustomer) {
            window.orderSystem.addCustomer(testCustomer);
            console.log('✅ 테스트 고객 등록 성공');
        } else {
            console.error('❌ addCustomer 함수를 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 테스트 고객 등록 실패:', error);
    }
}

function checkCustomerData() {
    console.log('🔍 고객 데이터 상태 확인...');
    
    // Supabase에서 고객 데이터 확인
    if (window.customerDataManager) {
        const customers = window.customerDataManager.getAllCustomers();
        console.log('📊 고객 데이터 상태:', {
            총고객수: customers.length,
            최근고객: customers.slice(-3).map(c => ({ name: c.name, phone: c.phone })),
            데이터소스: 'Supabase'
        });
    } else {
        console.log('⚠️ customerDataManager를 찾을 수 없습니다');
    }
}

function initTestData() {
    console.log('🧪 테스트 데이터 초기화 시작... (Supabase 전용)');
    
    // Supabase에서 데이터 초기화
    if (window.productDataManager && window.customerDataManager && window.orderDataManager) {
        // 새로운 테스트 데이터 생성
        if (window.orderSystem) {
            window.orderSystem.createInitialDataIfNeeded();
        }
        
        console.log('✅ 테스트 데이터 초기화 완료');
    } else {
        console.error('❌ 필요한 데이터 매니저를 찾을 수 없습니다!');
    }
}

// 전역 함수로 등록
window.testProductSort = testProductSort;
window.testCustomerSort = testCustomerSort;
window.testDashboardRefresh = testDashboardRefresh;
window.resetTestData = resetTestData;
window.debugCustomerRegistration = debugCustomerRegistration;
window.checkCustomerData = checkCustomerData;
window.initTestData = initTestData;
