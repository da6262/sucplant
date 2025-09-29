// 개발모드 설정
const isDevMode = false; // 프로덕션 배포시 false로 설정

// 개발모드 전용 요소 제거
if (!isDevMode) {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll("[data-dev-only]").forEach(el => el.remove());
        console.log("✅ 프로덕션 모드로 실행됩니다");
    });
}

// 라벨 타입 선택 함수 (전역) - 제거됨, 이제 이벤트 리스너로 처리

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
    console.log('🧪 테스트 데이터 초기화 및 재생성');
    if (window.orderSystem) {
        // 기존 데이터 삭제
        localStorage.removeItem('farm_customers');
        localStorage.removeItem('farm_orders');
        localStorage.removeItem('farm_waitlist');
        
        // 새로운 데이터 생성
        window.orderSystem.createInitialDataIfNeeded();
        
        // 데이터 다시 로드
        window.orderSystem.loadCustomers();
        window.orderSystem.loadOrders();
        window.orderSystem.loadWaitlist();
        
        console.log('✅ 테스트 데이터 재생성 완료');
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

// 고객 등록 디버깅 함수 (전역)
function debugCustomerRegistration() {
    console.log('🔍 고객 등록 디버깅 시작...');
    
    if (!window.orderSystem) {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
        return;
    }
    
    const key = window.orderSystem.getLocalStorageKey('farm_customers');
    const data = localStorage.getItem(key);
    
    console.log('📊 LocalStorage 상태:', {
        키: key,
        데이터존재: !!data,
        데이터크기: data ? data.length : 0
    });
    
    if (data) {
        try {
            const customers = JSON.parse(data);
            console.log('👥 현재 고객 목록:', customers);
            console.log('📈 고객 수:', customers.length);
        } catch (e) {
            console.error('❌ 데이터 파싱 오류:', e);
        }
    }
    
    // 테스트 고객 등록
    const testCustomer = {
        id: 'debug_' + Date.now(),
        name: '디버그테스트고객',
        phone: '010-8888-8888',
        address: '디버그 테스트 주소',
        email: 'debug@test.com',
        grade: 'GENERAL',
        registration_date: new Date().toISOString().split('T')[0],
        memo: '디버그 테스트 등록',
        created_at: new Date().toISOString()
    };
    
    console.log('🧪 테스트 고객 등록 시도:', testCustomer);
    
    try {
        const existingData = localStorage.getItem(key);
        const customers = existingData ? JSON.parse(existingData) : [];
        customers.push(testCustomer);
        localStorage.setItem(key, JSON.stringify(customers));
        
        console.log('✅ 테스트 고객 등록 성공!');
        console.log('📊 등록 후 고객 수:', customers.length);
        
        // 고객 목록 새로고침
        window.orderSystem.loadCustomers();
        
    } catch (error) {
        console.error('❌ 테스트 고객 등록 실패:', error);
    }
}

// 고객 데이터 상태 확인 함수 (전역)
function checkCustomerData() {
    console.log('🔍 고객 데이터 상태 확인...');
    
    if (!window.orderSystem) {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
        return;
    }
    
    const key = window.orderSystem.getLocalStorageKey('farm_customers');
    const data = localStorage.getItem(key);
    
    console.log('📊 LocalStorage 상태:', {
        키: key,
        데이터존재: !!data,
        데이터크기: data ? data.length : 0,
        전체LocalStorage크기: localStorage.length
    });
    
    if (data) {
        try {
            const customers = JSON.parse(data);
            console.log('👥 고객 목록:', customers);
            console.log('📈 고객 수:', customers.length);
            
            // 각 고객의 상세 정보
            customers.forEach((customer, index) => {
                console.log(`${index + 1}. ${customer.name} (${customer.phone})`);
            });
            
        } catch (e) {
            console.error('❌ 데이터 파싱 오류:', e);
        }
    } else {
        console.log('⚠️ 고객 데이터가 없습니다.');
    }
}

// 테스트 데이터 초기화 함수 (전역)
function initTestData() {
    console.log('🧪 테스트 데이터 초기화 시작...');
    if (window.orderSystem) {
        // localStorage 상품 데이터 삭제
        localStorage.removeItem('farm_management_products');
        localStorage.removeItem('farm_management_categories');
        
        // 기본 데이터 재생성
        window.orderSystem.createInitialDataIfNeeded();
        window.orderSystem.loadProducts();
        window.orderSystem.loadCategories();
        
        console.log('✅ 테스트 데이터 초기화 완료!');
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

// 테이블 이름 통일을 위한 매핑 헬퍼
const TABLE_MAP = {
    orders: 'farm_orders',
    products: 'farm_products',
    channels: 'farm_channels',
    categories: 'farm_categories',
    customers: 'farm_customers',
    waitlist: 'farm_waitlist',
    // 이미 farm_* 로 들어오면 그대로 반환
    farm_orders: 'farm_orders',
    farm_products: 'farm_products',
    farm_channels: 'farm_channels',
    farm_categories: 'farm_categories',
    farm_customers: 'farm_customers',
    farm_waitlist: 'farm_waitlist',
};

function mapTable(name) { 
    return TABLE_MAP[name] || name; 
}

// CRUD 작업을 Supabase 직접 호출로 통일
async function saveRow(tableName, row) {
    const t = mapTable(tableName);
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 저장만 수행');
        return null;
    }
    const { data, error } = await supabase.from(t).upsert(row, { onConflict: 'id' }).select();
    if (error) throw error;
    return data;
}

async function deleteRow(tableName, id) {
    const t = mapTable(tableName);
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 삭제만 수행');
        return null;
    }
    const { error } = await supabase.from(t).delete().eq('id', id);
    if (error) throw error;
    return true;
}

async function loadRows(tableName) {
    const t = mapTable(tableName);
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 데이터만 사용');
        return [];
    }
    const { data, error } = await supabase.from(t).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

// 전역 헬퍼 함수: LocalStorage 키 생성
function getLocalStorageKey(tableName) {
    return `farm_management_${tableName}`;
}

// 초기 1회 동기화 + 구독 시작
async function initialSync() {
    const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 초기 동기화 불가');
        return;
    }
    
    const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist', 'farm_channels'];
    console.log('🔄 초기 동기화 시작...');
    
    for (const t of tables) {
        try {
            // 테이블별 정렬 컬럼 분기 처리
            let query = supabase.from(t).select('*');
            
            if (t === 'farm_channels') {
                // farm_channels는 created_at으로 정렬
                query = query.order('created_at', { ascending: true });
            } else if (t === 'farm_categories') {
                // farm_categories는 created_at으로 정렬 (updated_at 없음)
                query = query.order('created_at', { ascending: true });
            } else {
                // 다른 테이블은 updated_at으로 정렬
                query = query.order('updated_at', { ascending: true });
            }
            
            const { data, error } = await query;
            if (error) {
                console.error(`❌ ${t} 초기 로드 실패:`, error);
                // farm_channels 오류 시 기본 데이터 사용
                if (t === 'farm_channels') {
                    console.log('📱 farm_channels 기본 데이터 사용');
                    const defaultChannels = [
                        { id: 1, name: '직접판매', description: '농장에서 직접 판매', icon: 'store', color: 'green', is_active: true },
                        { id: 2, name: '온라인쇼핑몰', description: '온라인 쇼핑몰 판매', icon: 'shopping', color: 'blue', is_active: true },
                        { id: 3, name: '모바일앱', description: '모바일 앱을 통한 판매', icon: 'mobile', color: 'purple', is_active: true }
                    ];
                    localStorage.setItem('channels', JSON.stringify(defaultChannels));
                    console.log(`✅ ${t} 기본 데이터 로드 완료: ${defaultChannels.length}개`);
                }
                continue;
            }
            
            // 로컬 저장 (키 통일)
            const localKey = getLocalStorageKey(t.replace('farm_', ''));
            localStorage.setItem(localKey, JSON.stringify(data || []));
            console.log(`✅ ${t} 초기 로드 완료: ${(data || []).length}개`);
        } catch (error) {
            console.error(`❌ ${t} 초기 로드 오류:`, error);
            // farm_channels 오류 시 기본 데이터 사용
            if (t === 'farm_channels') {
                console.log('📱 farm_channels 기본 데이터 사용');
                const defaultChannels = [
                    { id: 1, name: '직접판매', description: '농장에서 직접 판매', icon: 'store', color: 'green', is_active: true },
                    { id: 2, name: '온라인쇼핑몰', description: '온라인 쇼핑몰 판매', icon: 'shopping', color: 'blue', is_active: true },
                    { id: 3, name: '모바일앱', description: '모바일 앱을 통한 판매', icon: 'mobile', color: 'purple', is_active: true }
                ];
                localStorage.setItem('channels', JSON.stringify(defaultChannels));
                console.log(`✅ ${t} 기본 데이터 로드 완료: ${defaultChannels.length}개`);
            }
        }
    }
    
    console.log('✅ 초기 동기화 완료');
}

// Realtime 구독 설정
function setupRealtime() {
    const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - Realtime 구독 불가');
        return;
    }
    
    const targets = [
        'farm_orders', 'farm_products', 'farm_channels',
        'farm_categories', 'farm_customers', 'farm_waitlist'
    ];
    
    targets.forEach((table) => {
        const ch = supabase.channel(`rt-${table}`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, (p) => {
                console.log(`🟢 ${table} ${p.eventType}`, p.new || p.old);
                applyRealtimeDelta(table, p);
            })
            .subscribe((status) => console.log(`${table} 채널 상태:`, status));
        window[`__rt_${table}`] = ch; // 디버깅용
    });
    
    console.log('✅ Realtime 구독 설정 완료');
}

// Realtime 델타 반영 함수
function applyRealtimeDelta(table, payload) {
    const localKey = table.replace('farm_', '');
    
    console.log(`🔄 Realtime 델타 적용: ${table} ${payload.eventType}`, payload.new || payload.old);
    
    if (payload.eventType === 'DELETE') {
        removeOne(localKey, payload.old.id);
    } else {
        upsertOne(localKey, payload.new);
    }
    
    // UI 업데이트 트리거
    const event = new CustomEvent('realtimeUpdate', {
        detail: { table: localKey, eventType: payload.eventType, data: payload.new || payload.old }
    });
    window.dispatchEvent(event);
    
    // OrderManagementSystem 인스턴스가 있으면 직접 업데이트
    if (window.orderSystem) {
        console.log(`🔄 ${localKey} 테이블 UI 업데이트 트리거`);
        
        // 테이블별 UI 업데이트
        switch (localKey) {
            case 'farm_customers':
                window.orderSystem.loadCustomers();
                break;
            case 'orders':
                window.orderSystem.loadOrders();
                break;
            case 'products':
                window.orderSystem.loadProducts();
                break;
            case 'categories':
                window.orderSystem.loadCategories();
                break;
            case 'farm_waitlist':
                window.orderSystem.loadWaitlist();
                break;
            case 'channels':
                window.orderSystem.loadChannels();
                break;
        }
    }
}

function loadLocal(table) {
    try {
        return JSON.parse(localStorage.getItem(table)) || [];
    } catch {
        return [];
    }
}

function saveLocal(table, rows) {
    localStorage.setItem(table, JSON.stringify(rows));
}

function upsertOne(table, row, key = 'id') {
    const list = loadLocal(table);
    const i = list.findIndex(x => x[key] === row[key]);
    if (i === -1) {
        list.push(row);
    } else {
        list[i] = { ...list[i], ...row };
    }
    saveLocal(table, list);
}

function removeOne(table, id, key = 'id') {
    const list = loadLocal(table).filter(x => x[key] !== id);
    saveLocal(table, list);
}

// 경산다육식물농장 관리시스템
class OrderManagementSystem {
    constructor() {
        this.orders = [];
        this.customers = [];
        this.products = [];
        this.categories = [];
        this.orderSources = [];
        this.farm_waitlist = [];
        this.currentEditingOrder = null;
        this.currentEditingWaitlist = null;
        this.currentShippingFilter = '';
        this.filteredShippingOrders = [];
        this.currentPreviewOrders = null;
        this.currentPreviewType = null;
        // Master-Detail 패턴을 위한 선택된 고객 정보
        this.selectedCustomerId = null;
        this.selectedCustomer = null;
        
        // 대시보드 차트 인스턴스
        this.salesTrendChart = null;
        this.salesChannelChart = null;
        this.categorySalesChart = null;
        this.customerAnalysisChart = null;
        
        // 판매 채널 관리
        this.channels = [];
        this.currentEditingChannel = null;
        
        // 주문 상태 관리
        this.orderStatuses = [];
        this.currentEditingOrderStatus = null;
        
        // 표준 주문 상태 목록 (Single Source of Truth)
        this.standardOrderStatuses = [
            { value: '주문접수', label: '주문접수', color: '#6B7280', description: '새로 접수된 주문' },
            { value: '입금확인', label: '입금확인', color: '#3B82F6', description: '결제가 확인된 주문' },
            { value: '배송준비', label: '배송준비', color: '#F59E0B', description: '포장 및 배송 준비 중' },
            { value: '배송시작', label: '배송시작', color: '#8B5CF6', description: '배송이 시작된 주문' },
            { value: '배송완료', label: '배송완료', color: '#10B981', description: '고객에게 배송 완료된 주문' },
            { value: '주문취소', label: '주문취소', color: '#EF4444', description: '취소된 주문' },
            { value: '환불처리', label: '환불처리', color: '#F97316', description: '환불 처리된 주문' }
        ];
        
        // 페이지네이션 설정
        this.currentProductsPage = 1;
        this.productsPerPage = 20;  // 기본값: 20개
        this.totalProductsPages = 1;
        
        // 정렬 설정
        this.productSortBy = 'newest';  // 기본값: 최근 등록순
        this.customerSortBy = 'newest';  // 기본값: 최근 등록순
        
        try {
            this.init();
            
            // 페이지 완전 로드 후 정렬 이벤트 리스너 다시 설정
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.setupProductSortListener();
                }, 1000);
            });
        } catch (error) {
            console.warn('시스템 초기화 중 오류 발생:', error);
        }
    }

    // API 엔드포인트 헬퍼 함수
    getApiUrl(endpoint) {
        // API 서버 URL 설정
        const baseUrl = this.getApiBaseUrl();
        // endpoint에서 tables/ 제거 (baseUrl에 이미 포함됨)
        const clean = endpoint.startsWith('tables/') ? endpoint.slice(7) : endpoint;
        
        // 쿼리 문자열 분리
        const [rawPath, query = ''] = clean.split('?');
        
        // 테이블명 매핑 적용 (farm_* 변환)
        const mappedPath = mapTable(rawPath);
        
        // 최종 URL 구성
        const fullUrl = `${baseUrl}/${mappedPath}${query ? `?${query}` : ''}`;
        console.log(`🔗 최종 API URL: ${fullUrl}`);
        return fullUrl;
    }

    // 모바일 최적화된 공통 fetch 옵션
    getCommonFetchOptions(method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache'
        };

        if (body && method !== 'GET') {
            options.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        return options;
    }
    
    // API 기본 URL 가져오기
    getApiBaseUrl() {
        // 현재 도메인에 따라 API URL 결정
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        const pathname = window.location.pathname;
        
        console.log(`🌐 현재 호스트: ${hostname}, 프로토콜: ${protocol}, 포트: ${port}, 패스: ${pathname}`);
        
        // 운영 환경 감지 (localhost가 아닌 모든 환경)
        const isProduction = !(hostname === 'localhost' || hostname === '127.0.0.1');
        
        if (isProduction) {
            // 운영 환경에서는 Supabase 경로로 강제 설정
            const supabaseUrl = 'https://bigjqermlhbipjsnyhmt.supabase.co/rest/v1';
            console.log(`🚀 운영 환경 감지 - Supabase API URL: ${supabaseUrl}`);
            return supabaseUrl;
        } else if (hostname.includes('genspark.ai')) {
            // GenSpark 환경에서는 절대 경로 사용
            const apiUrl = '/tables';
            console.log(`🚀 GenSpark API URL: ${apiUrl} (절대 경로)`);
            return apiUrl;
        } else if (hostname.includes('gensparkspace.com')) {
            // GenSparkSpace 배포 환경 - 절대 경로 사용
            const apiUrl = '/tables';
            console.log(`🏠 GenSparkSpace API URL: ${apiUrl} (절대 경로)`);
            return apiUrl;
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 로컬 개발 환경
            const apiUrl = port ? `${protocol}//${hostname}:${port}/tables` : `${protocol}//${hostname}/tables`;
            console.log(`🏠 로컬 API URL: ${apiUrl}`);
            return apiUrl;
        } else {
            // 기타 환경 - 상대 경로 사용
            const apiUrl = 'tables';
            console.log(`🔧 기타 환경 API URL: ${apiUrl} (상대 경로)`);
            return apiUrl;
        }
    }

    // API 연결 테스트
    async testApiConnection() {
        console.log('🧪 API 연결 테스트 시작...');
        
        try {
            // customers 테이블에 GET 요청으로 API 연결 테스트
            const testUrl = this.getApiUrl('farm_customers?limit=1');
            console.log(`📡 테스트 URL: ${testUrl}`);
            
            // 타임아웃 설정을 위한 AbortController 생성
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.log('⏰ API 연결 타임아웃 (10초)');
            }, 10000); // 타임아웃을 10초로 늘림
            
            const fetchOptions = this.getCommonFetchOptions('GET');
            fetchOptions.signal = controller.signal;
            
            const response = await fetch(testUrl, fetchOptions);
            
            clearTimeout(timeoutId);
            
            console.log(`📊 API 응답 상태: ${response.status}`);
            console.log(`📋 API 응답 헤더:`, Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    console.log('📄 텍스트 응답:', text);
                    data = { message: '연결 성공', response: text };
                }
                
                console.log('✅ API 연결 성공!', data);
                return true;
            } else {
                const errorText = await response.text();
                console.log(`❌ API 연결 실패: ${response.status} ${response.statusText}`);
                console.log(`📝 오류 내용:`, errorText);
                return false;
            }
        } catch (error) {
            console.log(`🚫 API 연결 오류:`, error);
            if (error.name === 'AbortError') {
                console.log('⏰ API 연결 타임아웃');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('🌐 네트워크 연결 문제 - 인터넷 연결을 확인해주세요');
            }
            return false;
        }
    }

    // 강제 API 동기화 (LocalStorage → API)
    async forceSyncToApi() {
        console.log('🔄 강제 API 동기화 시작...');
        
        const syncResults = {
            farm_customers: { success: 0, failed: 0 },
            orders: { success: 0, failed: 0 },
            products: { success: 0, failed: 0 },
            categories: { success: 0, failed: 0 }
        };

        try {
            // 고객 동기화
            const customers = this.loadFromLocalStorage('farm_customers');
            console.log(`👥 고객 ${customers.length}개 동기화 시작...`);
            
            for (const customer of customers) {
                try {
                    const response = await fetch(this.getApiUrl('farm_customers'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(customer)
                    });
                    
                    if (response.ok) {
                        syncResults.farm_customers.success++;
                    } else {
                        syncResults.farm_customers.failed++;
                    }
                } catch (error) {
                    syncResults.customers.failed++;
                }
            }

            // 주문 동기화  
            const orders = this.loadFromLocalStorage('orders');
            console.log(`📦 주문 ${orders.length}개 동기화 시작...`);
            
            for (const order of orders) {
                try {
                    const response = await fetch(this.getApiUrl('farm_orders'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(order)
                    });
                    
                    if (response.ok) {
                        syncResults.orders.success++;
                    } else {
                        syncResults.orders.failed++;
                    }
                } catch (error) {
                    syncResults.orders.failed++;
                }
            }

            console.log('🎉 동기화 완료!', syncResults);
            return syncResults;
            
        } catch (error) {
            console.error('💥 동기화 중 오류:', error);
            return syncResults;
        }
    }

    // 브라우저별 데이터 동기화 (API → LocalStorage)
    async syncFromApiToLocal() {
        console.log('🔄 브라우저별 데이터 동기화 시작...');
        
        const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist', 'farm_channels'];
        let totalSynced = 0;
        
        try {
            for (const table of tables) {
                try {
                    console.log(`📡 ${table} 데이터 로드 중...`);
                    const response = await fetch(this.getApiUrl(table));
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.data && result.data.length > 0) {
                            // LocalStorage에 저장 (키 통일)
                            const base = table.replace('farm_', '');
                            localStorage.setItem(this.getLocalStorageKey(base), JSON.stringify(result.data));
                            
                            // 메모리에도 업데이트 (베이스명 기준)
                            if (base === 'farm_customers') this.customers = result.data;
                            else if (base === 'orders') this.orders = result.data;
                            else if (base === 'products') this.products = result.data;
                            else if (base === 'categories') this.categories = result.data;
                            else if (base === 'farm_waitlist') this.farm_waitlist = result.data;
                            
                            totalSynced += result.data.length;
                            console.log(`✅ ${table} 동기화 완료: ${result.data.length}개`);
                        }
                    } else {
                        console.warn(`⚠️ ${table} 로드 실패: ${response.status}`);
                    }
                } catch (error) {
                    console.error(`❌ ${table} 동기화 실패:`, error);
                }
            }
            
            // UI 업데이트
            this.renderOrdersTable();
            this.renderCustomersTable();
            this.renderProductsTable();
            this.updateCategorySelects();
            this.renderWaitlistTable();
            
            console.log(`🎉 브라우저별 데이터 동기화 완료! 총 ${totalSynced}개 데이터 동기화됨`);
            this.showToast(`✅ 브라우저 동기화 완료! (${totalSynced}개 데이터)`, 3000);
            
        } catch (error) {
            console.error('❌ 브라우저별 데이터 동기화 실패:', error);
            this.showToast('❌ 브라우저 동기화 실패', 3000);
        }
    }

    // 스마트 브라우저 동기화 (로컬 + 서버 데이터 병합)
    async smartBrowserSync() {
        console.log('🧠 스마트 브라우저 동기화 시작...');
        
        const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist', 'farm_channels'];
        let totalMerged = 0;
        
        try {
            for (const table of tables) {
                try {
                    console.log(`🔄 ${table} 스마트 동기화 중...`);
                    
                    // 1. 로컬 데이터 로드 (farm_ 제거 후 로드)
                    const baseTable = table.replace('farm_', '');
                    const localData = this.loadFromLocalStorage(baseTable);
                    console.log(`📱 로컬 ${table}: ${localData.length}개`);
                    
                    // 2. 서버 데이터 로드
                    const response = await fetch(this.getApiUrl(table));
                    let serverData = [];
                    if (response.ok) {
                        const result = await response.json();
                        serverData = result.data || [];
                    }
                    console.log(`🌐 서버 ${table}: ${serverData.length}개`);
                    
                    // 3. 데이터 병합 (중복 제거)
                    const mergedData = this.mergeData(localData, serverData, table);
                    console.log(`🔗 병합된 ${table}: ${mergedData.length}개`);
                    
                    // 4. 병합된 데이터를 로컬과 서버에 저장
                    if (mergedData.length > 0) {
                        // 로컬에 저장 (키 통일)
                        const base = table.replace('farm_', '');
                        localStorage.setItem(this.getLocalStorageKey(base), JSON.stringify(mergedData));
                        
                        // 메모리 업데이트
                        if (base === 'farm_customers') this.customers = mergedData;
                        else if (base === 'orders') this.orders = mergedData;
                        else if (base === 'products') this.products = mergedData;
                        else if (base === 'categories') this.categories = mergedData;
                        else if (base === 'farm_waitlist') this.farm_waitlist = mergedData;
                        
                        // 서버에 병합된 데이터 업로드
                        await this.uploadMergedDataToServer(table, mergedData);
                        
                        totalMerged += mergedData.length;
                    }
                    
                } catch (error) {
                    console.error(`❌ ${table} 스마트 동기화 실패:`, error);
                }
            }
            
            // UI 업데이트
            this.renderOrdersTable();
            this.renderCustomersTable();
            this.renderProductsTable();
            this.updateCategorySelects();
            this.renderWaitlistTable();
            
            console.log(`🎉 스마트 브라우저 동기화 완료! 총 ${totalMerged}개 데이터 병합됨`);
            this.showToast(`✅ 스마트 동기화 완료! (${totalMerged}개 데이터 병합)`, 3000);
            
        } catch (error) {
            console.error('❌ 스마트 브라우저 동기화 실패:', error);
            this.showToast('❌ 스마트 동기화 실패', 3000);
        }
    }

    // 데이터 병합 함수 (중복 제거)
    mergeData(localData, serverData, tableName) {
        const merged = [...localData];
        
        // 서버 데이터 중 로컬에 없는 것만 추가
        for (const serverItem of serverData) {
            const exists = merged.find(localItem => {
                // ID로 중복 확인
                if (localItem.id && serverItem.id) {
                    return localItem.id === serverItem.id;
                }
                // 특정 테이블별 고유 키로 중복 확인
                if (tableName === 'farm_customers' && localItem.phone && serverItem.phone) {
                    return localItem.phone === serverItem.phone;
                }
                if (tableName === 'orders' && localItem.order_number && serverItem.order_number) {
                    return localItem.order_number === serverItem.order_number;
                }
                if (tableName === 'products' && localItem.name && serverItem.name) {
                    return localItem.name === serverItem.name;
                }
                return false;
            });
            
            if (!exists) {
                merged.push(serverItem);
            }
        }
        
        return merged;
    }

    // 병합된 데이터를 서버에 업로드
    async uploadMergedDataToServer(tableName, data) {
        try {
            // 기존 서버 데이터 삭제 후 새로 업로드
            for (const item of data) {
                if (item.id && !item.id.startsWith('local_')) {
                    try {
                        await fetch(this.getApiUrl(`${tableName}/${item.id}`), {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(item)
                        });
                    } catch (error) {
                        // PUT 실패 시 POST로 새로 생성
                        await fetch(this.getApiUrl(tableName), {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(item)
                        });
                    }
                } else {
                    // 새 데이터는 POST로 생성
                    await fetch(this.getApiUrl(tableName), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(item)
                    });
                }
            }
            console.log(`✅ ${tableName} 서버 업로드 완료`);
        } catch (error) {
            console.error(`❌ ${tableName} 서버 업로드 실패:`, error);
        }
    }

    // LocalStorage 백업 함수들
    getLocalStorageKey(tableName) {
        return `farm_management_${tableName}`;
    }

    // Supabase 통합 저장 메서드
    async saveToStorage(tableName, data) {
        try {
            // Supabase 통합 모듈이 있으면 사용, 없으면 LocalStorage 폴백
            if (window.supabaseIntegration) {
                const result = await window.supabaseIntegration.saveData(tableName, data);
                if (result.success) {
                    console.log(`💾 Supabase 저장 성공: ${tableName}`, {
                        아이템수: Array.isArray(data) ? data.length : '객체',
                        캐시됨: result.cached
                    });
                    return result;
                } else {
                    console.warn(`⚠️ Supabase 저장 실패, LocalStorage 폴백: ${tableName}`, result.error);
                }
            }
            
            // LocalStorage 폴백
            return this.saveToLocalStorage(tableName, data);
        } catch (error) {
            console.error(`❌ 저장 실패 (${tableName}):`, error);
            // 최종 폴백으로 LocalStorage 사용
            return this.saveToLocalStorage(tableName, data);
        }
    }

    // Supabase 통합 로드 메서드
    async loadFromStorage(tableName, forceRefresh = false) {
        try {
            // Supabase 통합 모듈이 있으면 사용, 없으면 LocalStorage 폴백
            if (window.supabaseIntegration) {
                const result = await window.supabaseIntegration.loadData(tableName, forceRefresh);
                if (result.success) {
                    console.log(`📦 Supabase 로드 성공: ${tableName}`, {
                        아이템수: Array.isArray(result.data) ? result.data.length : '객체',
                        소스: result.source
                    });
                    return result.data;
                } else {
                    console.warn(`⚠️ Supabase 로드 실패, LocalStorage 폴백: ${tableName}`, result.error);
                }
            }
            
            // LocalStorage 폴백
            return this.loadFromLocalStorage(tableName);
        } catch (error) {
            console.error(`❌ 로드 실패 (${tableName}):`, error);
            // 최종 폴백으로 LocalStorage 사용
            return this.loadFromLocalStorage(tableName);
        }
    }

    // 기존 LocalStorage 메서드 (폴백용)
    saveToLocalStorage(tableName, data) {
        try {
            const key = this.getLocalStorageKey(tableName);
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            console.log(`💾 LocalStorage 저장 성공: ${key}`, {
                데이터크기: jsonData.length,
                아이템수: Array.isArray(data) ? data.length : '객체',
                키: key
            });
        } catch (error) {
            console.error('LocalStorage 저장 실패:', error);
            console.error('저장 시도한 데이터:', data);
        }
    }

    loadFromLocalStorage(tableName) {
        try {
            const key = this.getLocalStorageKey(tableName);
            const data = localStorage.getItem(key);
            const parsedData = data ? JSON.parse(data) : [];
            console.log(`📦 LocalStorage 로드: ${key}`, {
                데이터존재: !!data,
                데이터크기: data ? data.length : 0,
                파싱된아이템수: Array.isArray(parsedData) ? parsedData.length : '객체'
            });
            return parsedData;
        } catch (error) {
            console.error('LocalStorage 로드 실패:', error);
            return [];
        }
    }

    async init() {
        // API 연결 테스트 먼저 실행
        this.apiAvailable = await this.testApiConnection();
        
        // API 상태 UI 업데이트
        this.updateApiStatusUI(this.apiAvailable);
        
        if (this.apiAvailable) {
            console.log('🚀 API 연결 성공! API 모드로 실행합니다.');
        } else {
            console.log('📱 API 연결 실패! 로컬 스토리지 모드로 실행합니다.');
        }
        
        // API 연결 상태 주기적 모니터링 시작
        this.startApiMonitoring();
        
        // API 재연결 버튼 이벤트 설정
        this.setupApiReconnectButton();
        
        this.setupEventListeners();
        await this.loadInitialData();
        
        // 실시간 운영 현황 초기화
        this.setupRealtimeDashboard();
        
        // 경영 대시보드 초기화
        this.setupAnalyticsDashboard();
        
        // 피킹/포장 버튼 이벤트는 DOM 완전 로드 후 등록
        setTimeout(() => {
            this.setupPickingPackagingEvents();
            this.setupDebugFunctions();
            // 환경설정 이벤트 리스너도 DOM 완전 로드 후 등록
            this.setupSettingsEventListeners();
        }, 1000);
        
        // API 상태 주기적 체크 (5분마다) - 추후 구현
        /*
        setInterval(async () => {
            const currentApiStatus = await this.testApiConnection();
            if (currentApiStatus !== this.apiAvailable) {
                this.apiAvailable = currentApiStatus;
                this.updateApiStatusUI(this.apiAvailable);
                console.log(`🔄 API 상태 변경: ${this.apiAvailable ? 'API 모드' : '로컬 모드'}`);
            }
        }, 5 * 60 * 1000); // 5분
        */
    }
    
    // API 상태 UI 업데이트
    updateApiStatusUI(isConnected) {
        const statusDot = document.getElementById('api-status-dot');
        const statusText = document.getElementById('api-status-text');
        const reconnectBtn = document.getElementById('api-reconnect-btn');
        
        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.className = 'w-2 h-2 rounded-full bg-green-400';
                statusText.textContent = 'API 연결됨';
                statusText.className = 'text-xs text-green-100';
                if (reconnectBtn) reconnectBtn.classList.add('hidden');
            } else {
                statusDot.className = 'w-2 h-2 rounded-full bg-red-400';
                statusText.textContent = '로컬 모드';
                statusText.className = 'text-xs text-red-100';
                if (reconnectBtn) reconnectBtn.classList.remove('hidden');
            }
        }
    }

    // API 연결 상태 주기적 모니터링
    startApiMonitoring() {
        // 30초마다 API 연결 상태 확인
        this.apiMonitorInterval = setInterval(async () => {
            const wasConnected = this.apiAvailable;
            this.apiAvailable = await this.testApiConnection();
            
            // 연결 상태가 바뀌었을 때만 UI 업데이트
            if (wasConnected !== this.apiAvailable) {
                this.updateApiStatusUI(this.apiAvailable);
                
                if (this.apiAvailable && !wasConnected) {
                    console.log('🔄 API 연결 복구! 데이터 동기화를 시도합니다.');
                    // 연결이 복구되면 로컬 데이터를 API로 동기화
                    await this.forceSyncToApi();
                } else if (!this.apiAvailable && wasConnected) {
                    console.log('⚠️ API 연결 끊어짐! 로컬 모드로 전환합니다.');
                }
            }
        }, 30000); // 30초마다 체크
        
        console.log('🔍 API 모니터링 시작 (30초 주기)');
    }

    // API 모니터링 중지
    stopApiMonitoring() {
        if (this.apiMonitorInterval) {
            clearInterval(this.apiMonitorInterval);
            this.apiMonitorInterval = null;
            console.log('🛑 API 모니터링 중지');
        }
    }

    // API 재연결 버튼 설정
    setupApiReconnectButton() {
        const reconnectBtn = document.getElementById('api-reconnect-btn');
        if (reconnectBtn) {
            reconnectBtn.addEventListener('click', async () => {
                console.log('🔄 사용자가 API 재연결을 요청했습니다.');
                
                // 버튼 비활성화 및 로딩 표시
                reconnectBtn.disabled = true;
                reconnectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                // API 연결 테스트
                const wasConnected = this.apiAvailable;
                this.apiAvailable = await this.testApiConnection();
                
                // UI 업데이트
                this.updateApiStatusUI(this.apiAvailable);
                
                if (this.apiAvailable && !wasConnected) {
                    console.log('✅ API 재연결 성공! 데이터 동기화를 시작합니다.');
                    
                    // 연결이 복구되면 로컬 데이터를 API로 동기화
                    try {
                        await this.forceSyncToApi();
                        console.log('🔄 데이터 동기화 완료');
                    } catch (error) {
                        console.error('🚫 데이터 동기화 실패:', error);
                    }
                } else if (this.apiAvailable) {
                    console.log('✅ API 연결 상태 양호합니다.');
                } else {
                    console.log('❌ API 재연결 실패. 네트워크 상태를 확인해주세요.');
                }
                
                // 버튼 상태 복원
                setTimeout(() => {
                    reconnectBtn.disabled = false;
                    reconnectBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }, 2000);
            });
            
            console.log('🔧 API 재연결 버튼 이벤트 설정 완료');
        }
    }
    
    // 피킹/포장 관련 이벤트 설정
    setupPickingPackagingEvents() {
        try {
            const pickingBtn = document.getElementById('generate-picking-list-btn');
            const packagingBtn = document.getElementById('generate-packaging-labels-btn');
            
            if (pickingBtn) {
                console.log('피킹 리스트 버튼 찾음');
                pickingBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 피킹 리스트 버튼 클릭됨!');
                    console.log('현재 this:', this);
                    console.log('openPickingListModal 함수 존재 여부:', typeof this.openPickingListModal);
                    try {
                        this.openPickingListModal();
                    } catch (error) {
                        console.error('❌ 피킹 리스트 모달 열기 실패:', error);
                        alert('피킹 리스트 기능에 오류가 발생했습니다: ' + error.message);
                    }
                });
                
                // 추가 디버깅: 버튼 클릭 테스트
                console.log('버튼 요소:', pickingBtn);
                console.log('버튼 표시 여부:', pickingBtn.offsetParent !== null);
                console.log('버튼 비활성화 여부:', pickingBtn.disabled);
            } else {
                console.error('피킹 리스트 버튼을 찾을 수 없음');
            }
            
            if (packagingBtn) {
                console.log('포장 라벨 버튼 찾음');
                packagingBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 포장 라벨 버튼 클릭됨!');
                    console.log('현재 this:', this);
                    console.log('openPackagingLabelsModal 함수 존재 여부:', typeof this.openPackagingLabelsModal);
                    try {
                        this.openPackagingLabelsModal();
                    } catch (error) {
                        console.error('❌ 포장 라벨 모달 열기 실패:', error);
                        alert('포장 라벨 기능에 오류가 발생했습니다: ' + error.message);
                    }
                });
                
                // 추가 디버깅: 버튼 클릭 테스트
                console.log('포장 라벨 버튼 요소:', packagingBtn);
                console.log('버튼 표시 여부:', packagingBtn.offsetParent !== null);
                console.log('버튼 비활성화 여부:', packagingBtn.disabled);
            } else {
                console.error('포장 라벨 버튼을 찾을 수 없음');
            }
        } catch (error) {
            console.error('피킹/포장 이벤트 설정 실패:', error);
        }
    }

    setupEventListeners() {
        // 이벤트 리스너 중복 등록 방지
        if (this.eventListenersSetup) {
            console.log('⚠️ 이벤트 리스너가 이미 설정됨 - 중복 등록 방지');
            return;
        }
        
        console.log('🔗 이벤트 리스너 설정 시작...');
        
        // 기존 이벤트 리스너 제거 (안전장치)
        this.removeAllEventListeners();
        
        // 데스크톱 탭 버튼 이벤트
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabId = e.target.id;
                
                // 대시보드 탭 클릭 시 권한 체크
                if (tabId === 'tab-dashboard') {
                    if (!(await this.canSeeDashboard())) {
                        e.preventDefault();
                        alert('대시보드 접근 권한이 없습니다.');
                        this.switchTab('tab-orders'); // 다른 탭으로 돌려보내기
                        return;
                    }
                }
                
                this.switchTab(tabId);
            });
        });

        // 모바일 탭 버튼 이벤트
        document.querySelectorAll('.mobile-tab-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabId = e.currentTarget.id.replace('mobile-', '');
                
                // 대시보드 탭 클릭 시 권한 체크
                if (tabId === 'tab-dashboard') {
                    if (!(await this.canSeeDashboard())) {
                        e.preventDefault();
                        alert('대시보드 접근 권한이 없습니다.');
                        this.switchTab('tab-orders'); // 다른 탭으로 돌려보내기
                        return;
                    }
                }
                
                this.switchTab(tabId);
                this.updateMobileTabState(e.currentTarget);
            });
        });

        // 주문 등록 버튼
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => {
                this.openOrderModal();
            });
        }

        // 고객 등록 버튼
        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => {
                this.customerRegistrationSource = 'customer'; // 고객관리에서 등록
                this.openCustomerModal();
            });
        }

        // 기존 상품 등록 버튼 (모달 방식)
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.openProductModal();
            });
        }

        // 인라인 상품 등록 토글 버튼 (빠른 등록)
        const toggleInlineProductForm = document.getElementById('toggle-inline-product-form');
        if (toggleInlineProductForm) {
            toggleInlineProductForm.addEventListener('click', () => {
                this.toggleInlineProductForm();
            });
        }

        // 인라인 폼 닫기 버튼
        const closeInlineForm = document.getElementById('close-inline-form');
        if (closeInlineForm) {
            closeInlineForm.addEventListener('click', () => {
                this.hideInlineProductForm();
            });
        }

        // 인라인 폼 취소 버튼
        const cancelInlineProduct = document.getElementById('cancel-inline-product');
        if (cancelInlineProduct) {
            cancelInlineProduct.addEventListener('click', () => {
                this.hideInlineProductForm();
            });
        }

        // 인라인 폼 저장 버튼
        const saveInlineProduct = document.getElementById('save-inline-product');
        if (saveInlineProduct) {
            saveInlineProduct.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveInlineProduct();
            });
        }

        // 인라인 폼 제출 이벤트
        const inlineProductFormElement = document.getElementById('inline-product-form-element');
        if (inlineProductFormElement) {
            inlineProductFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveInlineProduct();
            });
        }

        // 빠른 카테고리 추가 기능
        const inlineProductCategory = document.getElementById('inline-product-category');
        if (inlineProductCategory) {
            inlineProductCategory.addEventListener('change', (e) => {
                if (e.target.value === '__ADD_NEW__') {
                    this.showQuickCategoryInput();
                }
            });
        }

        // 인라인 카테고리 빠른 추가 버튼
        const quickAddCategoryInline = document.getElementById('quick-add-category-inline');
        if (quickAddCategoryInline) {
            quickAddCategoryInline.addEventListener('click', () => {
                this.showInlineQuickCategoryInput();
            });
        }

        // 인라인 카테고리 저장 버튼
        const saveInlineQuickCategory = document.getElementById('save-inline-quick-category');
        if (saveInlineQuickCategory) {
            saveInlineQuickCategory.addEventListener('click', () => {
                this.saveInlineQuickCategory();
            });
        }

        // 인라인 카테고리 취소 버튼
        const cancelInlineQuickCategory = document.getElementById('cancel-inline-quick-category');
        if (cancelInlineQuickCategory) {
            cancelInlineQuickCategory.addEventListener('click', () => {
                this.hideInlineQuickCategoryInput();
            });
        }

        // 인라인 카테고리 이름 입력 엔터 키 처리
        const inlineQuickCategoryName = document.getElementById('inline-quick-category-name');
        if (inlineQuickCategoryName) {
            inlineQuickCategoryName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveInlineQuickCategory();
                } else if (e.key === 'Escape') {
                    this.hideInlineQuickCategoryInput();
                }
            });
        }

        // 모달용 빠른 카테고리 추가 기능 (안전한 처리)
        const productFormCategory = document.getElementById('product-form-category');
        if (productFormCategory) {
            productFormCategory.addEventListener('change', (e) => {
                if (e.target.value === '__ADD_NEW__') {
                    this.showModalQuickCategoryInput();
                }
            });
        }

        const modalQuickAddCategoryBtn = document.getElementById('modal-quick-add-category-btn');
        if (modalQuickAddCategoryBtn) {
            modalQuickAddCategoryBtn.addEventListener('click', () => {
                this.showModalQuickCategoryInput();
            });
        }

        const modalSaveQuickCategory = document.getElementById('modal-save-quick-category');
        if (modalSaveQuickCategory) {
            modalSaveQuickCategory.addEventListener('click', () => {
                this.saveModalQuickCategory();
            });
        }

        const modalCancelQuickCategory = document.getElementById('modal-cancel-quick-category');
        if (modalCancelQuickCategory) {
            modalCancelQuickCategory.addEventListener('click', () => {
                this.hideModalQuickCategoryInput();
            });
        }

        // 모달용 엔터 키로 빠른 카테고리 저장
        const modalQuickCategoryName = document.getElementById('modal-quick-category-name');
        if (modalQuickCategoryName) {
            modalQuickCategoryName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveModalQuickCategory();
                } else if (e.key === 'Escape') {
                    this.hideModalQuickCategoryInput();
                }
            });
        }

        // QR 라벨 관련 이벤트 리스너 (안전한 처리)
        const printLabelsBtn = document.getElementById('print-labels-btn');
        if (printLabelsBtn) {
            printLabelsBtn.addEventListener('click', () => {
                console.log('🏷️ 라벨 인쇄 버튼 클릭됨');
                this.handleLabelPrintingFromProductList();
            });
        }

        const selectAllProducts = document.getElementById('select-all-products');
        if (selectAllProducts) {
            selectAllProducts.addEventListener('change', (e) => {
                this.toggleAllProductSelection(e.target.checked);
            });
        }

        const closeQrLabelPreviewModal = document.getElementById('close-qr-label-preview-modal');
        if (closeQrLabelPreviewModal) {
            closeQrLabelPreviewModal.addEventListener('click', () => {
                this.closeQRLabelPreview();
            });
        }

        const closeQrLabelModalBtn = document.getElementById('close-qr-label-modal-btn');
        if (closeQrLabelModalBtn) {
            closeQrLabelModalBtn.addEventListener('click', () => {
                this.closeQRLabelPreview();
            });
        }

        const printQrLabels = document.getElementById('print-qr-labels');
        if (printQrLabels) {
            printQrLabels.addEventListener('click', () => {
                this.printQRLabels();
            });
        }

        // 카테고리 관리 버튼
        const manageCategoriesBtn = document.getElementById('manage-categories-btn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                console.log('카테고리 관리 버튼 클릭됨');
                this.openCategoryModal();
            });
        } else {
            console.warn('카테고리 관리 버튼을 찾을 수 없습니다.');
        }

        // 대기자 등록 버튼
        const addWaitlistBtn = document.getElementById('add-waitlist-btn');
        console.log('🔍 대기자 등록 버튼 확인:', !!addWaitlistBtn);
        if (addWaitlistBtn) {
            addWaitlistBtn.addEventListener('click', () => {
                console.log('🖱️ 대기자 등록 버튼 클릭됨');
                this.openWaitlistModal();
            });
            console.log('✅ 대기자 등록 버튼 이벤트 리스너 등록됨');
        } else {
            console.warn('⚠️ add-waitlist-btn 요소를 찾을 수 없습니다');
        }

        // QR 프린트 기능 (초기화됨)

        // Master-Detail 레이아웃 버튼들
        try {
            // 고객 수정 버튼 (상세 정보 영역)
            const editCustomerBtn = document.getElementById('edit-customer-btn');
            if (editCustomerBtn) {
                editCustomerBtn.addEventListener('click', () => {
                    if (this.selectedCustomerId) {
                        this.editCustomer(this.selectedCustomerId);
                    }
                });
            }

            // 주문이력 버튼은 제거되었으므로 이벤트 리스너도 제거
        } catch (error) {
            console.warn('Master-Detail 버튼 이벤트 설정 실패:', error);
        }

        // 일괄 상태변경 버튼
        const bulkStatusChangeBtn = document.getElementById('bulk-status-change-btn');
        if (bulkStatusChangeBtn) {
            bulkStatusChangeBtn.addEventListener('click', () => {
                this.openBulkStatusChangeModal();
            });
        }

        // 로젠택배 엑셀 내보내기 버튼
        const bulkExportLogenBtn = document.getElementById('bulk-export-logen-btn');
        if (bulkExportLogenBtn) {
            bulkExportLogenBtn.addEventListener('click', () => {
                this.exportToLogenExcel();
            });
        }

        // 피킹 리스트 버튼과 포장 라벨 버튼은 setupPickingPackagingEvents에서 처리

        // 송장번호 일괄입력 버튼
        const bulkTrackingImportBtn = document.getElementById('bulk-tracking-import-btn');
        if (bulkTrackingImportBtn) {
            bulkTrackingImportBtn.addEventListener('click', () => {
                this.openTrackingImportModal();
            });
        }

        // 전체 선택 체크박스
        const selectAllOrders = document.getElementById('select-all-orders');
        if (selectAllOrders) {
            selectAllOrders.addEventListener('change', (e) => {
                this.toggleAllOrders(e.target.checked);
            });
        }

        // 상태별 필터 탭 이벤트 리스너
        document.querySelectorAll('.status-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.id.replace('status-', '');
                this.filterOrdersByStatus(status);
                
                // 탭 활성화 상태 업데이트
                document.querySelectorAll('.status-tab-btn').forEach(tab => {
                    tab.classList.remove('active', 'border-green-600', 'text-green-600', 
                                       'border-yellow-600', 'text-yellow-600',
                                       'border-orange-600', 'text-orange-600',
                                       'border-purple-600', 'text-purple-600',
                                       'border-emerald-600', 'text-emerald-600',
                                       'border-gray-600', 'text-gray-600');
                });
                
                e.currentTarget.classList.add('active');
                
                // 상태별 색상 적용
                if (status === 'all') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (status === '주문접수') {
                    e.currentTarget.classList.add('border-yellow-600', 'text-yellow-600');
                } else if (status === '입금확인') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (status === '배송준비') {
                    e.currentTarget.classList.add('border-orange-600', 'text-orange-600');
                } else if (status === '배송시작') {
                    e.currentTarget.classList.add('border-purple-600', 'text-purple-600');
                } else if (status === '배송완료') {
                    e.currentTarget.classList.add('border-emerald-600', 'text-emerald-600');
                } else if (status === '주문취소') {
                    e.currentTarget.classList.add('border-gray-600', 'text-gray-600');
                }
            });
        });

        // 고객관리 등급별 필터 탭 이벤트 리스너
        try {
            document.querySelectorAll('.customer-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grade = e.currentTarget.id.replace('customer-grade-', '');
                this.filterCustomersByGrade(grade);
                
                // 탭 활성화 상태 업데이트
                document.querySelectorAll('.customer-tab-btn').forEach(tab => {
                    tab.classList.remove('active', 'border-green-600', 'text-green-600',
                                       'border-purple-600', 'text-purple-600',
                                       'border-yellow-600', 'text-yellow-600',
                                       'border-gray-500', 'text-gray-500',
                                       'border-orange-600', 'text-orange-600',
                                       'border-blue-600', 'text-blue-600');
                });
                
                e.currentTarget.classList.add('active');
                
                // 등급별 색상 적용
                if (grade === 'all') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (grade === 'BLACK_DIAMOND') {
                    e.currentTarget.classList.add('border-gray-900', 'text-gray-900');
                } else if (grade === 'PURPLE_EMPEROR') {
                    e.currentTarget.classList.add('border-purple-600', 'text-purple-600');
                } else if (grade === 'RED_RUBY') {
                    e.currentTarget.classList.add('border-red-600', 'text-red-600');
                } else if (grade === 'GREEN_LEAF') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (grade === 'GENERAL') {
                    e.currentTarget.classList.add('border-blue-600', 'text-blue-600');
                }
            });
        });
        } catch (error) {
            console.warn('고객관리 탭 이벤트 리스너 설정 실패:', error);
        }

        // 대기자관리 상태별 필터 탭 이벤트 리스너
        try {
        document.querySelectorAll('.waitlist-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.id.replace('waitlist-status-', '');
                this.filterWaitlistByStatus(status);
                
                // 탭 활성화 상태 업데이트
                document.querySelectorAll('.waitlist-tab-btn').forEach(tab => {
                    tab.classList.remove('active', 'border-orange-600', 'text-orange-600',
                                       'border-blue-600', 'text-blue-600',
                                       'border-green-600', 'text-green-600',
                                       'border-red-600', 'text-red-600');
                });
                
                e.currentTarget.classList.add('active');
                
                // 상태별 색상 적용
                if (status === 'all') {
                    e.currentTarget.classList.add('border-orange-600', 'text-orange-600');
                } else if (status === '대기중') {
                    e.currentTarget.classList.add('border-orange-600', 'text-orange-600');
                } else if (status === '연락완료') {
                    e.currentTarget.classList.add('border-blue-600', 'text-blue-600');
                } else if (status === '주문전환') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (status === '취소') {
                    e.currentTarget.classList.add('border-red-600', 'text-red-600');
                }
            });
        });
        } catch (error) {
            console.warn('대기자관리 탭 이벤트 리스너 설정 실패:', error);
        }

        // 배송관리 상태별 필터 탭 이벤트 리스너
        try {
        document.querySelectorAll('.shipping-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.id.replace('shipping-status-', '');
                this.filterShippingOrdersByStatus(status);
                
                // 탭 활성화 상태 업데이트
                document.querySelectorAll('.shipping-tab-btn').forEach(tab => {
                    tab.classList.remove('active', 'border-blue-600', 'text-blue-600', 
                                       'border-green-600', 'text-green-600',
                                       'border-orange-600', 'text-orange-600',
                                       'border-purple-600', 'text-purple-600',
                                       'border-emerald-600', 'text-emerald-600');
                });
                
                e.currentTarget.classList.add('active');
                
                // 상태별 색상 적용
                if (status === 'all') {
                    e.currentTarget.classList.add('border-blue-600', 'text-blue-600');
                } else if (status === '입금확인') {
                    e.currentTarget.classList.add('border-green-600', 'text-green-600');
                } else if (status === '배송준비') {
                    e.currentTarget.classList.add('border-orange-600', 'text-orange-600');
                } else if (status === '배송시작') {
                    e.currentTarget.classList.add('border-purple-600', 'text-purple-600');
                } else if (status === '배송완료') {
                    e.currentTarget.classList.add('border-emerald-600', 'text-emerald-600');
                }
            });
        });
        } catch (error) {
            console.warn('배송관리 탭 이벤트 리스너 설정 실패:', error);
        }

        // 고객 등급 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[id^="grade-dropdown-"]') && !e.target.closest('button[onclick*="toggleGradeDropdown"]')) {
                const allDropdowns = document.querySelectorAll('[id^="grade-dropdown-"]');
                allDropdowns.forEach(dropdown => {
                    dropdown.classList.add('hidden');
                });
            }
        });

        // 배송관리 기타 이벤트 리스너
        try {
            const trackingBtn = document.getElementById('tracking-search-btn');
            if (trackingBtn) {
                trackingBtn.addEventListener('click', () => {
                    this.searchByTracking();
                });
            }
            
            const clearBtn = document.getElementById('clear-tracking-search');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearTrackingSearch();
                });
            }
        } catch (error) {
            console.warn('배송관리 검색 이벤트 리스너 설정 실패:', error);
        }
        try {
            const selectAllShipping = document.getElementById('select-all-shipping');
            if (selectAllShipping) {
                selectAllShipping.addEventListener('change', (e) => {
                    this.toggleAllShippingOrders(e.target.checked);
                });
            }
            
            const bulkShipBtn = document.getElementById('bulk-ship-ready-btn');
            if (bulkShipBtn) {
                bulkShipBtn.addEventListener('click', () => {
                    this.bulkUpdateShippingStatus('배송준비');
                });
            }
        } catch (error) {
            console.warn('배송관리 일괄처리 이벤트 리스너 설정 실패:', error);
        }
        const bulkStatusChangeShippingBtn = document.getElementById('bulk-status-change-shipping-btn');
        if (bulkStatusChangeShippingBtn) {
            bulkStatusChangeShippingBtn.addEventListener('click', () => {
                this.openBulkStatusChangeModal();
            });
        }
        
        const bulkExportShippingBtn = document.getElementById('bulk-export-shipping-btn');
        if (bulkExportShippingBtn) {
            bulkExportShippingBtn.addEventListener('click', () => {
                this.exportShippingToLogen();
            });
        }
        
        const bulkTrackingShippingBtn = document.getElementById('bulk-tracking-shipping-btn');
        if (bulkTrackingShippingBtn) {
            bulkTrackingShippingBtn.addEventListener('click', () => {
                this.openTrackingImportModal();
            });
        }
        
        const quickExportAllBtn = document.getElementById('quick-export-all-btn');
        if (quickExportAllBtn) {
            quickExportAllBtn.addEventListener('click', () => {
                this.quickExportAllShipping();
            });
        }

        // 일괄 상태변경 모달 이벤트
        const closeBulkStatusModal = document.getElementById('close-bulk-status-modal');
        if (closeBulkStatusModal) {
            closeBulkStatusModal.addEventListener('click', () => {
                this.closeBulkStatusChangeModal();
            });
        }
        
        const cancelBulkStatus = document.getElementById('cancel-bulk-status');
        if (cancelBulkStatus) {
            cancelBulkStatus.addEventListener('click', () => {
                this.closeBulkStatusChangeModal();
            });
        }
        
        const confirmBulkStatus = document.getElementById('confirm-bulk-status');
        if (confirmBulkStatus) {
            confirmBulkStatus.addEventListener('click', () => {
                this.executeBulkStatusChange();
            });
        }

        // 상태 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[id^="status-dropdown-"]') && !e.target.closest('button[onclick*="toggleStatusDropdown"]')) {
                document.querySelectorAll('[id^="status-dropdown-"]').forEach(dropdown => {
                    dropdown.classList.add('hidden');
                });
            }
        });

        // 모달 닫기
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeOrderModal();
            });
        }

        // 송장번호 일괄입력 모달 관련 이벤트
        const closeTrackingImportModal = document.getElementById('close-tracking-import-modal');
        if (closeTrackingImportModal) {
            closeTrackingImportModal.addEventListener('click', () => {
                this.closeTrackingImportModal();
            });
        }
        
        const closeTrackingImportModalBtn = document.getElementById('close-tracking-import-modal-btn');
        if (closeTrackingImportModalBtn) {
            closeTrackingImportModalBtn.addEventListener('click', () => {
                this.closeTrackingImportModal();
            });
        }
        
        const importTrackingNumbers = document.getElementById('import-tracking-numbers');
        if (importTrackingNumbers) {
            importTrackingNumbers.addEventListener('click', () => {
                this.importTrackingNumbers();
            });
        }
        
        // 엑셀 업로드 관련 이벤트들
        const uploadMethodManual = document.getElementById('upload-method-manual');
        if (uploadMethodManual) {
            uploadMethodManual.addEventListener('click', () => {
                this.switchUploadMethod('manual');
            });
        }
        
        const uploadMethodExcel = document.getElementById('upload-method-excel');
        if (uploadMethodExcel) {
            uploadMethodExcel.addEventListener('click', () => {
                this.switchUploadMethod('excel');
            });
        }
        
        const trackingExcelInput = document.getElementById('tracking-excel-input');
        if (trackingExcelInput) {
            trackingExcelInput.addEventListener('change', (e) => {
                this.handleExcelFileUpload(e);
            });
        }

        // 엑셀 미리보기 모달 관련 이벤트
        const closeExcelPreviewModal = document.getElementById('close-excel-preview-modal');
        if (closeExcelPreviewModal) {
            closeExcelPreviewModal.addEventListener('click', () => {
                this.closeExcelPreviewModal();
            });
        }
        
        const cancelExcelExport = document.getElementById('cancel-excel-export');
        if (cancelExcelExport) {
            cancelExcelExport.addEventListener('click', () => {
                this.closeExcelPreviewModal();
            });
        }
        
        const confirmExcelExport = document.getElementById('confirm-excel-export');
        if (confirmExcelExport) {
            confirmExcelExport.addEventListener('click', () => {
                this.confirmExcelExport();
            });
        }

        // SMS 모달 닫기
        const closeSmsModal = document.getElementById('close-sms-modal');
        if (closeSmsModal) {
            closeSmsModal.addEventListener('click', () => {
                this.closeSmsModal();
            });
        }

        // 고객 모달 닫기
        const closeCustomerModal = document.getElementById('close-customer-modal');
        if (closeCustomerModal) {
            closeCustomerModal.addEventListener('click', () => {
                this.closeCustomerModal();
            });
        }

        // ESC 키로 고객 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const customerModal = document.getElementById('customer-modal');
                if (customerModal && !customerModal.classList.contains('hidden')) {
                    this.closeCustomerModal();
                }
            }
        });

        // 고객 주문이력 모달 닫기
        const closeCustomerOrdersModal = document.getElementById('close-customer-orders-modal');
        if (closeCustomerOrdersModal) {
            closeCustomerOrdersModal.addEventListener('click', () => {
                this.closeCustomerOrdersModal();
            });
        }

        // 상품 모달 닫기
        const closeProductModal = document.getElementById('close-product-modal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => {
                this.closeProductModal();
            });
        }

        // 카테고리 모달 닫기
        const closeCategoryModal = document.getElementById('close-category-modal');
        if (closeCategoryModal) {
            closeCategoryModal.addEventListener('click', () => {
                this.closeCategoryModal();
            });
        }

        // 대기자 모달 이벤트
        const closeWaitlistModal = document.getElementById('close-waitlist-modal');
        if (closeWaitlistModal) {
            closeWaitlistModal.addEventListener('click', () => {
                this.closeWaitlistModal();
            });
        }

        // 대기자 검색 및 필터 이벤트
        const waitlistSearch = document.getElementById('waitlist-search');
        if (waitlistSearch) {
            waitlistSearch.addEventListener('input', () => {
                this.filterWaitlist();
            });
        }
        // waitlist-status-filter는 제거되었으므로 주석 처리
        // document.getElementById('waitlist-status-filter').addEventListener('change', () => {
        //     this.filterWaitlist();
        // });
        const resetWaitlistSearch = document.getElementById('reset-waitlist-search');
        if (resetWaitlistSearch) {
            resetWaitlistSearch.addEventListener('click', () => {
                const waitlistSearch = document.getElementById('waitlist-search');
                if (waitlistSearch) {
                    waitlistSearch.value = '';
                }
                // waitlist-status-filter는 제거되었으므로 주석 처리
                // document.getElementById('waitlist-status-filter').value = '';
                this.filterWaitlist();
            });
        }

        // 상품 목록 모달 닫기
        const closeProductListModal = document.getElementById('close-product-list-modal');
        if (closeProductListModal) {
            closeProductListModal.addEventListener('click', () => {
                this.closeProductListModal();
            });
        }

        // 피킹 리스트 모달 닫기
        const closePickingListModal = document.getElementById('close-picking-list-modal');
        if (closePickingListModal) {
            closePickingListModal.addEventListener('click', () => {
                this.closePickingListModal();
            });
        }
        const closePickingListModalBtn = document.getElementById('close-picking-list-modal-btn');
        if (closePickingListModalBtn) {
            closePickingListModalBtn.addEventListener('click', () => {
                this.closePickingListModal();
            });
        }

        // 포장 라벨 모달 닫기
        const closePackagingLabelsModal = document.getElementById('close-packaging-labels-modal');
        if (closePackagingLabelsModal) {
            closePackagingLabelsModal.addEventListener('click', () => {
                this.closePackagingLabelsModal();
            });
        }
        const closePackagingLabelsModalBtn = document.getElementById('close-packaging-labels-modal-btn');
        if (closePackagingLabelsModalBtn) {
            closePackagingLabelsModalBtn.addEventListener('click', () => {
                this.closePackagingLabelsModal();
            });
        }

        // 피킹 리스트 출력
        const printPickingList = document.getElementById('print-picking-list');
        if (printPickingList) {
            printPickingList.addEventListener('click', () => {
                this.printPickingList();
            });
        }

        // QR코드 관련 이벤트
        this.setupQRCodeEvents();

        // 대량 프린트 이벤트
        this.setupBulkPrintEvents();

        // 태그 입력 이벤트
        this.setupTagInputEvents();

        // 포장 라벨 출력
        const printPackagingLabels = document.getElementById('print-packaging-labels');
        if (printPackagingLabels) {
            printPackagingLabels.addEventListener('click', () => {
                this.printPackagingLabels();
            });
        }

        // 상품별 피킹만 출력
        const printPickingOnly = document.getElementById('print-picking-only');
        if (printPickingOnly) {
            printPickingOnly.addEventListener('click', () => {
                console.log('상품별 피킹만 버튼 클릭됨');
                this.printPickingOnly();
            });
        }

        // 고객별 포장만 출력
        const printPackagingOnly = document.getElementById('print-packaging-only');
        if (printPackagingOnly) {
            printPackagingOnly.addEventListener('click', () => {
                console.log('고객별 포장만 버튼 클릭됨');
                this.printPackagingOnly();
            });
        }

        // 미리보기 모달 닫기
        const closePickingPreviewModal = document.getElementById('close-picking-preview-modal');
        if (closePickingPreviewModal) {
            closePickingPreviewModal.addEventListener('click', () => {
                this.closePickingPreviewModal();
            });
        }
        
        const closePickingPreviewModalBtn = document.getElementById('close-picking-preview-modal-btn');
        if (closePickingPreviewModalBtn) {
            closePickingPreviewModalBtn.addEventListener('click', () => {
                this.closePickingPreviewModal();
            });
        }

        // 미리보기 내용 출력
        try {
            const printBtn = document.getElementById('print-preview-content');
            if (printBtn) {
                console.log('출력 버튼 찾음');
                printBtn.addEventListener('click', () => {
                    console.log('출력 버튼 클릭됨');
                    this.printPreviewContent();
                });
            } else {
                console.error('출력 버튼을 찾을 수 없음');
            }
        } catch (error) {
            console.error('출력 버튼 이벤트 등록 실패:', error);
        }

        // 주문서 출력 모달 닫기
        const closeOrderReceiptModal = document.getElementById('close-order-receipt-modal');
        if (closeOrderReceiptModal) {
            closeOrderReceiptModal.addEventListener('click', () => {
                this.closeOrderReceiptModal();
            });
        }
        const closeOrderReceiptModalBtn = document.getElementById('close-order-receipt-modal-btn');
        if (closeOrderReceiptModalBtn) {
            closeOrderReceiptModalBtn.addEventListener('click', () => {
                this.closeOrderReceiptModal();
            });
        }

        // 주문서 출력 (더 안전한 방식)
        document.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'print-order-receipt') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖨️ 주문서 출력 버튼 클릭됨! (이벤트 위임)');
                console.log('currentPrintOrderId:', this.currentPrintOrderId);
                console.log('this.orders 길이:', this.orders ? this.orders.length : '없음');
                
                try {
                    await this.printActualOrderReceipt();
                } catch (error) {
                    console.error('주문서 출력 실패:', error);
                    this.showToast('❌ 주문서 출력 중 오류가 발생했습니다.');
                }
            }
        });

        // QR코드 체크박스 변경 시
        const includeQrCode = document.getElementById('include-qr-code');
        if (includeQrCode) {
            includeQrCode.addEventListener('change', () => {
                const qrSection = document.getElementById('qr-code-section');
                const previewSection = document.getElementById('qr-preview-section');
                const isChecked = includeQrCode.checked;
                
                if (isChecked) {
                    if (qrSection) qrSection.style.display = 'block';
                    if (previewSection) previewSection.style.display = 'block';
                    this.generateQRCodeModalPreview();
                } else {
                    if (qrSection) qrSection.style.display = 'none';
                    if (previewSection) previewSection.style.display = 'none';
                }
            });
        }

        // QR코드 URL 변경 시 미리보기 업데이트
        const qrCodeUrl = document.getElementById('qr-code-url');
        if (qrCodeUrl) {
            qrCodeUrl.addEventListener('input', () => {
                this.generateQRCodeModalPreview();
            });
        }

        // 상품별 피킹 미리보기 모달 닫기
        const closePickingPreviewModal2 = document.getElementById('close-picking-preview-modal');
        if (closePickingPreviewModal2) {
            closePickingPreviewModal2.addEventListener('click', () => {
                this.closePickingPreviewModal();
            });
        }
        const closePickingPreviewModalBtn2 = document.getElementById('close-picking-preview-modal-btn');
        if (closePickingPreviewModalBtn2) {
            closePickingPreviewModalBtn2.addEventListener('click', () => {
                this.closePickingPreviewModal();
            });
        }

        // 고객별 포장 미리보기 모달 닫기
        const closePackagingPreviewModal = document.getElementById('close-packaging-preview-modal');
        if (closePackagingPreviewModal) {
            closePackagingPreviewModal.addEventListener('click', () => {
                this.closePackagingPreviewModal();
            });
        }
        const closePackagingPreviewModalBtn = document.getElementById('close-packaging-preview-modal-btn');
        if (closePackagingPreviewModalBtn) {
            closePackagingPreviewModalBtn.addEventListener('click', () => {
                this.closePackagingPreviewModal();
            });
        }

        // 미리보기에서 출력
        const printPickingPreview = document.getElementById('print-picking-preview');
        if (printPickingPreview) {
            printPickingPreview.addEventListener('click', () => {
                this.printFromPickingPreview();
            });
        }
        const printPackagingPreview = document.getElementById('print-packaging-preview');
        if (printPackagingPreview) {
            printPackagingPreview.addEventListener('click', () => {
                this.printFromPackagingPreview();
            });
        }

        // 라벨 설정 변경 시 미리보기 업데이트
        document.addEventListener('change', (e) => {
            if (e.target.id === 'label-size' || e.target.id === 'labels-per-row') {
                const packagingOrders = this.orders.filter(order => 
                    order.status === '배송준비' || order.order_status === '배송준비'
                );
                if (packagingOrders.length > 0) {
                    this.generatePackagingLabels(packagingOrders);
                }
            }
        });

        // SMS 복사 버튼
        const copySms = document.getElementById('copy-sms');
        if (copySms) {
            copySms.addEventListener('click', () => {
                this.copySmsContent();
            });
        }

        // SMS 솔라피 발송 버튼
        const sendSms = document.getElementById('send-sms');
        if (sendSms) {
            // 기존 이벤트 리스너 제거
            sendSms.replaceWith(sendSms.cloneNode(true));
            
            // 새로운 이벤트 리스너 등록
            const newSendSms = document.getElementById('send-sms');
            newSendSms.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🟢 솔라피 발송 버튼 클릭됨!');
                this.sendSmsFromModal();
            });
            console.log('✅ SMS 솔라피 발송 버튼 이벤트 리스너 등록 완료');
        }

        // 모달 배경 클릭시 닫기
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.addEventListener('click', (e) => {
                if (e.target.id === 'order-modal') {
                    this.closeOrderModal();
                }
            });
        }

        // ESC 키로 주문 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const orderModal = document.getElementById('order-modal');
                if (orderModal && !orderModal.classList.contains('hidden')) {
                    this.closeOrderModal();
                }
            }
        });

        const smsModal = document.getElementById('sms-modal');
        if (smsModal) {
            smsModal.addEventListener('click', (e) => {
                if (e.target.id === 'sms-modal') {
                    this.closeSmsModal();
                }
            });
        }

        const customerModal = document.getElementById('customer-modal');
        if (customerModal) {
            customerModal.addEventListener('click', (e) => {
                if (e.target.id === 'customer-modal') {
                    this.closeCustomerModal();
                }
            });
        }

        const customerOrdersModal = document.getElementById('customer-orders-modal');
        if (customerOrdersModal) {
            customerOrdersModal.addEventListener('click', (e) => {
                if (e.target.id === 'customer-orders-modal') {
                    this.closeCustomerOrdersModal();
                }
            });
        }

        const productModal = document.getElementById('product-modal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target.id === 'product-modal') {
                    this.closeProductModal();
                }
            });
        }

        const productListModal = document.getElementById('product-list-modal');
        if (productListModal) {
            productListModal.addEventListener('click', (e) => {
                if (e.target.id === 'product-list-modal') {
                    this.closeProductListModal();
                }
            });
        }

        const categoryModal = document.getElementById('category-modal');
        if (categoryModal) {
            categoryModal.addEventListener('click', (e) => {
                if (e.target.id === 'category-modal') {
                    this.closeCategoryModal();
                }
            });
        }

        // 고객 검색 (실시간)
        const customerSearch = document.getElementById('customer-search');
        if (customerSearch) {
            customerSearch.addEventListener('input', (e) => {
                this.handleCustomerSearchInput(e.target.value);
            });

            customerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCustomerSearchEnter();
                }
            });

            customerSearch.addEventListener('focus', (e) => {
                if (e.target.value.trim()) {
                    this.handleCustomerSearchInput(e.target.value);
                }
            });

            customerSearch.addEventListener('blur', () => {
                setTimeout(() => {
                    const customerSearchSuggestions = document.getElementById('customer-search-suggestions');
                    if (customerSearchSuggestions) {
                        customerSearchSuggestions.classList.add('hidden');
                    }
                    const addCustomerFromSearch = document.getElementById('add-customer-from-search');
                    if (addCustomerFromSearch) {
                        addCustomerFromSearch.classList.add('hidden');
                    }
                }, 200);
            });
        }

        const addCustomerFromSearch = document.getElementById('add-customer-from-search');
        if (addCustomerFromSearch) {
            addCustomerFromSearch.addEventListener('click', () => {
                this.addCustomerFromSearch();
            });
        }

        const resetCustomerSearch = document.getElementById('reset-customer-search');
        if (resetCustomerSearch) {
            resetCustomerSearch.addEventListener('click', () => {
                const customerSearch = document.getElementById('customer-search');
                const customerSearchSuggestions = document.getElementById('customer-search-suggestions');
                const addCustomerFromSearch = document.getElementById('add-customer-from-search');
                const customerSort = document.getElementById('customer-sort');
                
                if (customerSearch) customerSearch.value = '';
                if (customerSearchSuggestions) customerSearchSuggestions.classList.add('hidden');
                if (addCustomerFromSearch) addCustomerFromSearch.classList.add('hidden');
                if (customerSort) {
                    customerSort.value = 'newest';
                    this.customerSortBy = 'newest';
                }
                this.loadCustomers();
            });
        }

        // 상품 검색 (실시간) - 상품관리 탭 전용
        const productManagementSearch = document.getElementById('product-management-search');
        if (productManagementSearch) {
            productManagementSearch.addEventListener('input', (e) => {
                this.handleProductSearchInput(e.target.value);
            });

            productManagementSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleProductManagementSearchEnter();
                }
            });

            productManagementSearch.addEventListener('focus', (e) => {
                if (e.target.value.trim()) {
                    this.handleProductSearchInput(e.target.value);
                }
            });

            productManagementSearch.addEventListener('blur', () => {
                setTimeout(() => {
                    const productSearchSuggestions = document.getElementById('product-search-suggestions');
                    const addProductFromSearch = document.getElementById('add-product-from-search');
                    if (productSearchSuggestions) productSearchSuggestions.classList.add('hidden');
                    if (addProductFromSearch) addProductFromSearch.classList.add('hidden');
                }, 200);
            });
        }

        const addProductFromSearch = document.getElementById('add-product-from-search');
        if (addProductFromSearch) {
            addProductFromSearch.addEventListener('click', () => {
                this.addProductFromSearch();
            });
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                const productManagementSearch = document.getElementById('product-management-search');
                this.handleProductSearchInput(productManagementSearch ? productManagementSearch.value : '');
            });
        }

        const resetProductSearch = document.getElementById('reset-product-search');
        if (resetProductSearch) {
            resetProductSearch.addEventListener('click', () => {
                const productManagementSearch = document.getElementById('product-management-search');
                const categoryFilter = document.getElementById('category-filter');
                const productSort = document.getElementById('product-sort');
                const productSearchSuggestions = document.getElementById('product-search-suggestions');
                const addProductFromSearch = document.getElementById('add-product-from-search');
                
                if (productManagementSearch) productManagementSearch.value = '';
                if (categoryFilter) categoryFilter.value = '';
                if (productSort) {
                    productSort.value = 'newest';
                    this.productSortBy = 'newest';
                }
                if (productSearchSuggestions) productSearchSuggestions.classList.add('hidden');
                if (addProductFromSearch) addProductFromSearch.classList.add('hidden');
                this.loadProducts();
            });
        }

        // 상품 페이지네이션 이벤트 리스너 추가
        const productsPerPageSelect = document.getElementById('products-per-page');
        if (productsPerPageSelect) {
            // 저장된 설정 로드
            const savedPerPage = localStorage.getItem('farm_products_per_page');
            if (savedPerPage) {
                this.productsPerPage = savedPerPage === 'all' ? 'all' : parseInt(savedPerPage);
                productsPerPageSelect.value = savedPerPage;
            }

            productsPerPageSelect.addEventListener('change', (e) => {
                this.changeProductsPerPage(e.target.value);
            });
        }

        // 상품 정렬 이벤트 리스너 설정
        this.setupProductSortListener();
        
        // 고객 정렬 이벤트 리스너 설정
        this.setupCustomerSortListener();
        
        // 판매 채널 관리 이벤트 리스너 설정
        this.setupChannelEventListeners();
        
        // 환경설정 드롭다운 이벤트 리스너 설정
        this.setupSettingsEventListeners();
        
        // 주문 상태 관리 이벤트 리스너 설정
        this.setupOrderStatusEventListeners();
        
        // 라벨 인쇄 모달 이벤트 리스너 설정
        this.setupLabelPrintEventListeners();
        
        this.eventListenersSetup = true;
        console.log('✅ 이벤트 리스너 설정 완료');
    }

    // 모든 이벤트 리스너 제거 (안전장치)
    removeAllEventListeners() {
        try {
            // 채널 저장 버튼 이벤트 리스너 제거
            const saveChannelBtn = document.getElementById('save-channel');
            if (saveChannelBtn) {
                saveChannelBtn.replaceWith(saveChannelBtn.cloneNode(true));
            }
            
            // 새 채널 추가 버튼 이벤트 리스너 제거
            const addChannelBtn = document.getElementById('add-channel-btn');
            if (addChannelBtn) {
                addChannelBtn.replaceWith(addChannelBtn.cloneNode(true));
            }
            
            console.log('🧹 기존 이벤트 리스너 제거 완료');
        } catch (error) {
            console.warn('⚠️ 이벤트 리스너 제거 중 오류:', error);
        }
    }

    // 상품 정렬 이벤트 리스너 설정 (별도 함수)
    setupProductSortListener() {
        const productSortSelect = document.getElementById('product-sort');
        if (productSortSelect) {
            console.log('🔗 상품 정렬 드롭다운 연결됨');
            
            // 기존 이벤트 리스너 제거 (중복 방지)
            if (this.sortChangeHandler) {
                productSortSelect.removeEventListener('change', this.sortChangeHandler);
            }
            
            // 저장된 정렬 설정 로드
            const savedSort = localStorage.getItem('farm_product_sort');
            if (savedSort) {
                this.productSortBy = savedSort;
                productSortSelect.value = savedSort;
            }

            // 새로운 이벤트 리스너 추가
            this.sortChangeHandler = (e) => {
                this.changeProductSort(e.target.value);
            };
            
            productSortSelect.addEventListener('change', this.sortChangeHandler);
        }
    }

    // 고객 정렬 이벤트 리스너 설정 (별도 함수)
    setupCustomerSortListener() {
        const customerSortSelect = document.getElementById('customer-sort');
        if (customerSortSelect) {
            console.log('🔗 고객 정렬 드롭다운 연결됨');
            
            // 기존 이벤트 리스너 제거 (중복 방지)
            if (this.customerSortChangeHandler) {
                customerSortSelect.removeEventListener('change', this.customerSortChangeHandler);
            }
            
            // 저장된 정렬 설정 로드
            const savedSort = localStorage.getItem('farm_customer_sort');
            if (savedSort) {
                this.customerSortBy = savedSort;
                customerSortSelect.value = savedSort;
            }

            // 새로운 이벤트 리스너 추가
            this.customerSortChangeHandler = (e) => {
                this.changeCustomerSort(e.target.value);
            };
            
            customerSortSelect.addEventListener('change', this.customerSortChangeHandler);
        }
    }

    // 판매 채널 관리 이벤트 리스너 설정
    setupChannelEventListeners() {
        console.log('🔗 판매 채널 관리 이벤트 리스너 설정 시작');
        
        // 새 채널 추가 버튼 (중복 등록 방지)
        const addChannelBtn = document.getElementById('add-channel-btn');
        if (addChannelBtn && !addChannelBtn.hasAttribute('data-listener-added')) {
            addChannelBtn.addEventListener('click', () => {
                this.openChannelModal();
            });
            addChannelBtn.setAttribute('data-listener-added', 'true');
            console.log('✅ 새 채널 추가 버튼 이벤트 리스너 등록');
        }

        // 채널 모달 닫기 버튼들
        const closeChannelModal = document.getElementById('close-channel-modal');
        if (closeChannelModal) {
            closeChannelModal.addEventListener('click', () => {
                this.closeChannelModal();
            });
        }

        // 채널 저장 버튼 (HTML의 실제 ID 사용)
        const saveChannelBtn = document.getElementById('save-channel');
        if (saveChannelBtn && !saveChannelBtn.hasAttribute('data-listener-added')) {
            saveChannelBtn.addEventListener('click', () => {
                this.handleChannelSave();
            });
            saveChannelBtn.setAttribute('data-listener-added', 'true');
            console.log('✅ 채널 저장 버튼 이벤트 리스너 등록');
        }

        // 채널 취소 버튼
        const cancelChannelBtn = document.getElementById('cancel-channel');
        if (cancelChannelBtn) {
            cancelChannelBtn.addEventListener('click', () => {
                this.closeChannelModal();
            });
        }

        // 모달 바깥 클릭으로 닫기
        const channelModal = document.getElementById('channel-modal');
        if (channelModal) {
            channelModal.addEventListener('click', (e) => {
                if (e.target.id === 'channel-modal') {
                    this.closeChannelModal();
                }
            });
        }

        // 채널 폼 엔터 키 처리
        const channelForm = document.getElementById('channel-form');
        if (channelForm) {
            channelForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleChannelSave();
                }
            });
        }

        console.log('✅ 판매 채널 관리 이벤트 리스너 설정 완료');
    }

    // 환경설정 드롭다운 이벤트 리스너 설정
    setupSettingsEventListeners() {
        console.log('🔗 환경설정 드롭다운 이벤트 리스너 설정 시작');
        
        // 데스크톱 환경설정 드롭다운
        const settingsDropdown = document.getElementById('settings-dropdown');
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        console.log('🔍 환경설정 요소 확인:', {
            dropdown: !!settingsDropdown,
            menu: !!settingsMenu,
            chevron: !!settingsChevron
        });
        
        if (settingsDropdown && settingsMenu && settingsChevron) {
            // 기존 이벤트 리스너 제거 (중복 방지)
            if (this.settingsDropdownClickListener) {
                settingsDropdown.removeEventListener('click', this.settingsDropdownClickListener);
            }
            
            this.settingsDropdownClickListener = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const isOpen = !settingsMenu.classList.contains('hidden');
                console.log('🔧 환경설정 드롭다운 클릭됨, 현재 상태:', isOpen ? '열림' : '닫힘');
                
                if (isOpen) {
                    settingsMenu.classList.add('hidden');
                    settingsChevron.classList.remove('rotate-180');
                    settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                    console.log('🔧 환경설정 드롭다운 닫힘');
                } else {
                    settingsMenu.classList.remove('hidden');
                    settingsChevron.classList.add('rotate-180');
                    settingsDropdown.classList.add('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.remove('text-gray-600', 'border-transparent');
                    console.log('🔧 환경설정 드롭다운 열림');
                    
                    // 드롭다운 메뉴가 실제로 보이는지 확인
                    setTimeout(() => {
                        const rect = settingsMenu.getBoundingClientRect();
                        console.log('🔧 드롭다운 메뉴 위치:', {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            visible: !settingsMenu.classList.contains('hidden')
                        });
                    }, 100);
                }
            };
            
            settingsDropdown.addEventListener('click', this.settingsDropdownClickListener);
            
            // 문서 클릭 시 드롭다운 닫기 (중복 방지)
            if (!this.settingsDocumentClickListener) {
                this.settingsDocumentClickListener = (e) => {
                    if (!settingsDropdown.contains(e.target) && !settingsMenu.contains(e.target)) {
                        settingsMenu.classList.add('hidden');
                        settingsChevron.classList.remove('rotate-180');
                        settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                        settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                        console.log('🔧 환경설정 드롭다운 닫힘 (외부 클릭)');
                    }
                };
                document.addEventListener('click', this.settingsDocumentClickListener);
            }
            
            console.log('✅ 데스크톱 환경설정 드롭다운 이벤트 리스너 등록');
        } else {
            console.warn('⚠️ 환경설정 요소를 찾을 수 없습니다. 재시도합니다.');
            
            // 여러 번 재시도
            const retrySetup = (attempt = 1) => {
                setTimeout(() => {
                    console.log(`🔄 환경설정 요소 재시도 ${attempt}...`);
                    const retryDropdown = document.getElementById('settings-dropdown');
                    const retryMenu = document.getElementById('settings-menu');
                    const retryChevron = document.getElementById('settings-chevron');
                    
                    if (retryDropdown && retryMenu && retryChevron) {
                        console.log('✅ 환경설정 요소 재시도 성공');
                        retryDropdown.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const isOpen = !retryMenu.classList.contains('hidden');
                            console.log('🔧 환경설정 드롭다운 클릭됨 (재시도), 현재 상태:', isOpen ? '열림' : '닫힘');
                            
                            if (isOpen) {
                                retryMenu.classList.add('hidden');
                                retryChevron.classList.remove('rotate-180');
                            } else {
                                retryMenu.classList.remove('hidden');
                                retryChevron.classList.add('rotate-180');
                            }
                        });
                    } else if (attempt < 5) {
                        console.warn(`⚠️ 재시도 ${attempt} 실패, 다시 시도합니다.`);
                        retrySetup(attempt + 1);
                    } else {
                        console.error('❌ 환경설정 요소를 찾을 수 없습니다. 최대 재시도 횟수 초과.');
                    }
                }, 500 * attempt);
            };
            
            retrySetup(1);
        }
        
        // 모바일 환경설정 바텀 시트
        const mobileSettingsToggle = document.getElementById('mobile-settings-toggle');
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        const mobileSettingsClose = document.getElementById('mobile-settings-close');
        
        if (mobileSettingsToggle && mobileSettingsSheet && mobileSettingsContent) {
            mobileSettingsToggle.addEventListener('click', () => {
                mobileSettingsSheet.classList.remove('hidden');
                setTimeout(() => {
                    mobileSettingsContent.classList.remove('translate-y-full');
                }, 10);
            });
            
            // 바텀 시트 닫기
            const closeMobileSettings = () => {
                mobileSettingsContent.classList.add('translate-y-full');
                setTimeout(() => {
                    mobileSettingsSheet.classList.add('hidden');
                }, 300);
            };
            
            if (mobileSettingsClose) {
                mobileSettingsClose.addEventListener('click', closeMobileSettings);
            }
            
            // 배경 클릭으로 닫기
            mobileSettingsSheet.addEventListener('click', (e) => {
                if (e.target === mobileSettingsSheet) {
                    closeMobileSettings();
                }
            });
            
            console.log('✅ 모바일 환경설정 바텀 시트 이벤트 리스너 등록');
        }
        
        // 데스크톱 하위 메뉴 클릭 이벤트 (판매 채널 관리)
        const desktopChannelMenu = document.getElementById('tab-channels');
        if (desktopChannelMenu) {
            desktopChannelMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 드롭다운 닫기
                if (settingsMenu) {
                    settingsMenu.classList.add('hidden');
                    settingsChevron.classList.remove('rotate-180');
                    settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                }
                
                // 페이지 전환
                this.switchTab('tab-channels');
            });
            console.log('✅ 데스크톱 판매 채널 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 데스크톱 하위 메뉴 클릭 이벤트 (주문 상태 관리)
        const desktopOrderStatusMenu = document.getElementById('tab-order-status');
        if (desktopOrderStatusMenu) {
            desktopOrderStatusMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 드롭다운 닫기
                if (settingsMenu) {
                    settingsMenu.classList.add('hidden');
                    settingsChevron.classList.remove('rotate-180');
                    settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                }
                
                // 페이지 전환
                this.switchTab('tab-order-status');
            });
            console.log('✅ 데스크톱 주문 상태 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 모바일 하위 메뉴 클릭 이벤트 (판매 채널 관리)
        const mobileChannelMenu = document.getElementById('mobile-tab-channels');
        if (mobileChannelMenu) {
            mobileChannelMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 바텀 시트 닫기
                if (mobileSettingsContent && mobileSettingsSheet) {
                    mobileSettingsContent.classList.add('translate-y-full');
                    setTimeout(() => {
                        mobileSettingsSheet.classList.add('hidden');
                    }, 300);
                }
                
                // 페이지 전환
                this.switchTab('tab-channels');
                this.updateMobileTabState(mobileChannelMenu);
            });
            console.log('✅ 모바일 판매 채널 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 모바일 하위 메뉴 클릭 이벤트 (주문 상태 관리)
        const mobileOrderStatusMenu = document.getElementById('mobile-tab-order-status');
        if (mobileOrderStatusMenu) {
            mobileOrderStatusMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 바텀 시트 닫기
                if (mobileSettingsContent && mobileSettingsSheet) {
                    mobileSettingsContent.classList.add('translate-y-full');
                    setTimeout(() => {
                        mobileSettingsSheet.classList.add('hidden');
                    }, 300);
                }
                
                // 페이지 전환
                this.switchTab('tab-order-status');
                this.updateMobileTabState(mobileOrderStatusMenu);
            });
            console.log('✅ 모바일 주문 상태 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 데스크톱 하위 메뉴 클릭 이벤트 (배송비 관리)
        const desktopShippingMenu = document.getElementById('tab-shipping-settings');
        if (desktopShippingMenu) {
            desktopShippingMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 드롭다운 닫기
                if (settingsMenu && settingsChevron) {
                    settingsMenu.classList.add('hidden');
                    settingsChevron.classList.remove('rotate-180');
                    settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                }
                
                // 페이지 전환
                this.switchTab('tab-shipping-settings');
            });
            console.log('✅ 데스크톱 배송비 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 데스크톱 하위 메뉴 클릭 이벤트 (고객등급 관리)
        const desktopGradeMenu = document.getElementById('tab-customer-grade');
        if (desktopGradeMenu) {
            desktopGradeMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 드롭다운 닫기
                if (settingsMenu && settingsChevron) {
                    settingsMenu.classList.add('hidden');
                    settingsChevron.classList.remove('rotate-180');
                    settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
                    settingsDropdown.classList.add('text-gray-600', 'border-transparent');
                }
                
                // 페이지 전환
                this.switchTab('tab-customer-grade');
            });
            console.log('✅ 데스크톱 고객등급 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 모바일 하위 메뉴 클릭 이벤트 (배송비 관리)
        const mobileShippingMenu = document.getElementById('mobile-tab-shipping-settings');
        if (mobileShippingMenu) {
            mobileShippingMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 바텀 시트 닫기
                if (mobileSettingsContent && mobileSettingsSheet) {
                    mobileSettingsContent.classList.add('translate-y-full');
                    setTimeout(() => {
                        mobileSettingsSheet.classList.add('hidden');
                    }, 300);
                }
                
                // 페이지 전환
                this.switchTab('tab-shipping-settings');
                this.updateMobileTabState(mobileShippingMenu);
            });
            console.log('✅ 모바일 배송비 관리 메뉴 클릭 이벤트 등록');
        }
        
        // 모바일 하위 메뉴 클릭 이벤트 (고객등급 관리)
        const mobileGradeMenu = document.getElementById('mobile-tab-customer-grade');
        if (mobileGradeMenu) {
            mobileGradeMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 바텀 시트 닫기
                if (mobileSettingsContent && mobileSettingsSheet) {
                    mobileSettingsContent.classList.add('translate-y-full');
                    setTimeout(() => {
                        mobileSettingsSheet.classList.add('hidden');
                    }, 300);
                }
                
                // 페이지 전환
                this.switchTab('tab-customer-grade');
                this.updateMobileTabState(mobileGradeMenu);
            });
            console.log('✅ 모바일 고객등급 관리 메뉴 클릭 이벤트 등록');
        }
        
        console.log('✅ 환경설정 드롭다운 이벤트 리스너 설정 완료');
    }

    // 주문 상태 관리 이벤트 리스너 설정
    setupOrderStatusEventListeners() {
        console.log('🔗 주문 상태 관리 이벤트 리스너 설정 시작');
        
        // 새 상태 추가 버튼
        const addStatusBtn = document.getElementById('add-status-btn');
        if (addStatusBtn) {
            addStatusBtn.addEventListener('click', () => {
                this.openOrderStatusModal();
            });
            console.log('✅ 새 상태 추가 버튼 이벤트 리스너 등록');
        }

        // 상태 모달 닫기 버튼들
        const closeOrderStatusModal = document.getElementById('close-order-status-modal');
        if (closeOrderStatusModal) {
            closeOrderStatusModal.addEventListener('click', () => {
                this.closeOrderStatusModal();
            });
        }

        // 상태 저장 버튼
        const saveOrderStatusBtn = document.getElementById('save-order-status');
        if (saveOrderStatusBtn) {
            saveOrderStatusBtn.addEventListener('click', () => {
                this.handleOrderStatusSave();
            });
            console.log('✅ 상태 저장 버튼 이벤트 리스너 등록');
        }

        // 상태 취소 버튼
        const cancelOrderStatusBtn = document.getElementById('cancel-order-status');
        if (cancelOrderStatusBtn) {
            cancelOrderStatusBtn.addEventListener('click', () => {
                this.closeOrderStatusModal();
            });
        }

        // 모달 바깥 클릭으로 닫기
        const orderStatusModal = document.getElementById('order-status-modal');
        if (orderStatusModal) {
            orderStatusModal.addEventListener('click', (e) => {
                if (e.target.id === 'order-status-modal') {
                    this.closeOrderStatusModal();
                }
            });
        }

        // 상태 폼 엔터 키 처리
        const orderStatusForm = document.getElementById('order-status-form');
        if (orderStatusForm) {
            orderStatusForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.handleOrderStatusSave();
                }
            });
        }

        console.log('✅ 주문 상태 관리 이벤트 리스너 설정 완료');
    }

    // 현재 활성 탭 확인
    getCurrentActiveTab() {
        const activeButton = document.querySelector('.tab-button.active');
        if (activeButton) {
            return activeButton.id;
        }
        return null;
    }

    // 환경설정 드롭다운 메뉴 닫기
    closeSettingsDropdown() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        const settingsDropdown = document.getElementById('settings-dropdown');
        
        if (settingsMenu && settingsChevron && settingsDropdown) {
            settingsMenu.classList.add('hidden');
            settingsChevron.classList.remove('rotate-180');
            settingsDropdown.classList.remove('text-purple-600', 'border-purple-600');
            settingsDropdown.classList.add('text-gray-600', 'border-transparent');
            console.log('🔧 환경설정 드롭다운 메뉴 닫힘 (탭 전환 시)');
        }
    }

    // 탭 전환
    async switchTab(tabId) {
        // 환경설정 드롭다운 메뉴 닫기
        this.closeSettingsDropdown();
        
        // 데스크톱 탭 비활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-green-600', 'border-green-600');
            btn.classList.add('text-gray-600', 'border-transparent');
        });

        // 모바일 탭 비활성화
        document.querySelectorAll('.mobile-tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-green-600');
            btn.classList.add('text-gray-600');
        });

        // 모든 컨텐츠 숨기기
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // 데스크톱 선택된 탭 활성화
        const activeButton = document.getElementById(tabId);
        if (activeButton) {
            activeButton.classList.remove('text-gray-600', 'border-transparent');
            activeButton.classList.add('active', 'text-green-600', 'border-green-600');
        }

        // 모바일 선택된 탭 활성화
        const mobileActiveButton = document.getElementById('mobile-' + tabId);
        if (mobileActiveButton) {
            mobileActiveButton.classList.remove('text-gray-600');
            mobileActiveButton.classList.add('active', 'text-green-600');
        }

        // 해당 컨텐츠 표시
        const sectionId = tabId.replace('tab-', '') + '-section';
        console.log(`🔄 탭 전환: ${tabId} → ${sectionId}`);
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`✅ 섹션 표시 완료: ${sectionId}`);
        } else {
            console.error(`❌ 섹션을 찾을 수 없음: ${sectionId}`);
        }

        // 실시간 업데이트 제어 (대시보드에서만 활성화)
        if (tabId === 'tab-dashboard') {
            this.startRealtimeUpdates();
        } else {
            this.stopRealtimeUpdates();
        }

        // 탭별 데이터 로드
        if (tabId === 'tab-dashboard') {
            await this.loadDashboard();
        } else if (tabId === 'tab-analytics') {
            // 경영 대시보드 탭: 경영 분석에 필요한 데이터만 로드
            console.log('📊 경영 대시보드 탭 - 분석용 데이터 로드');
            
            // 경영 분석에 필요한 데이터가 없을 때만 로드
            if (this.orders.length === 0) {
                await this.loadOrders();
            }
            if (this.customers.length === 0) {
                await this.loadCustomers();
            }
            if (this.products.length === 0) {
                await this.loadProducts();
            }
            
            this.updateSalesAnalytics();
        } else if (tabId === 'tab-orders') {
            // 주문관리 탭: 주문 데이터와 관련 마스터 데이터만 로드
            console.log('📋 주문관리 탭 - 주문 및 관련 데이터만 로드');
            if (this.orders.length === 0) {
                await this.loadOrders();
            }
            // 판매 채널이 로드되지 않았을 때만 로드
            if (this.channels.length === 0) {
                await this.loadChannels();
            }
            this.populateOrderSourceDropdown();
        } else if (tabId === 'tab-customers') {
            // 고객관리 탭: 고객 데이터만 로드
            console.log('👥 고객관리 탭 - 고객 데이터만 로드');
            // 검색 초기화
            document.getElementById('customer-search').value = '';
            document.getElementById('customer-search-suggestions').classList.add('hidden');
            document.getElementById('add-customer-from-search').classList.add('hidden');
            
            if (this.customers.length === 0) {
                await this.loadCustomers();
            }
        } else if (tabId === 'tab-products') {
            // 상품관리 탭: 상품과 카테고리 데이터만 로드
            console.log('📦 상품관리 탭 - 상품 및 카테고리 데이터만 로드');
            // 검색 및 정렬 초기화
            document.getElementById('product-management-search').value = '';
            document.getElementById('category-filter').value = '';
            const productSort = document.getElementById('product-sort');
            if (productSort) {
                productSort.value = 'newest';
                this.productSortBy = 'newest';
                this.setupProductSortListener();
            }
            document.getElementById('product-search-suggestions').classList.add('hidden');
            document.getElementById('add-product-from-search').classList.add('hidden');
            
            if (this.products.length === 0) {
                await this.loadProducts();
            }
            if (this.categories.length === 0) {
                await this.loadCategories();
            }
        } else if (tabId === 'tab-shipping') {
            // 배송관리 탭: 배송 관련 데이터만 로드
            console.log('🚚 배송관리 탭 - 배송 데이터만 로드');
            this.loadShippingOrders(); // 배송 주문 목록만 로드
            this.updateShippingStatistics(); // 배송 통계만 업데이트
        } else if (tabId === 'tab-waitlist') {
            // 대기자관리 탭: 대기자 데이터만 로드
            console.log('⏳ 대기자관리 탭 - 대기자 데이터만 로드');
            if (this.farm_waitlist.length === 0) {
                await this.loadWaitlist(); // 대기자 데이터가 없을 때만 로드
            }
            this.updateWaitlistStats(); // 대기자 통계만 업데이트
        } else if (tabId === 'tab-channels') {
            // 판매 채널 관리 탭: 채널 데이터만 로드
            console.log('🛒 판매 채널 관리 탭 - 채널 데이터만 로드');
            if (this.channels.length === 0) {
                await this.loadChannels();
            }
            this.renderChannelsPage();
        } else if (tabId === 'tab-order-status') {
            // 주문 상태 관리 탭: 주문 상태 데이터만 로드
            console.log('🔧 주문 상태 관리 탭 - 주문 상태 데이터만 로드');
            if (this.orderStatuses.length === 0) {
                await this.loadOrderStatuses();
            }
            this.renderOrderStatusPage();
        } else if (tabId === 'tab-shipping-settings') {
            // 배송비 관리 탭: 배송비 설정 데이터만 로드
            console.log('🚚 배송비 관리 탭 - 배송비 설정 데이터만 로드');
            this.loadShippingSettings();
            this.renderShippingPage();
        } else if (tabId === 'tab-customer-grade') {
            // 고객등급 관리 탭: 고객등급 설정 데이터만 로드
            console.log('👑 고객등급 관리 탭 - 고객등급 설정 데이터만 로드');
            this.loadCustomerGradeSettings();
            this.renderCustomerGradePage();
        }
    }

    // 모바일 탭 상태 업데이트
    updateMobileTabState(activeButton) {
        // 모든 모바일 탭 비활성화
        document.querySelectorAll('.mobile-tab-button').forEach(btn => {
            btn.classList.remove('active', 'text-green-600');
            btn.classList.add('text-gray-600');
        });

        // 선택된 모바일 탭 활성화
        activeButton.classList.remove('text-gray-600');
        activeButton.classList.add('active', 'text-green-600');
    }

    // 초기 데이터 로드
    async loadInitialData() {
        console.log('🚀 필수 초기 데이터 로드 시작...');
        
        // 초기 데이터 생성 (없을 경우에만)
        this.createInitialDataIfNeeded();
        
        // 필수 마스터 데이터만 로드 (폼 드롭다운 등에 필요)
        await this.loadCategories();
        await this.loadChannels(); // 판매 채널 먼저 로드
        await this.loadOrderStatuses(); // 주문 상태 로드
        
        console.log('✅ 필수 초기 데이터 로드 완료');
        console.log('📊 성능 최적화: 대시보드 데이터는 대시보드 탭 접근시에만 로드됩니다');
    }

    // 초기 데이터 생성 (로컬 스토리지가 비어있을 때만)
    createInitialDataIfNeeded() {
        console.log('🌱 초기 데이터 확인 중...');
        
        // 기본 카테고리 생성
        const existingCategories = this.loadFromLocalStorage('categories');
        if (!existingCategories || existingCategories.length === 0) {
            const categories = [
                { 
                    id: '1', 
                    name: 'White Platter', 
                    description: 'Cotyledon orbiculata White Platter',
                    color: 'bg-green-100 text-green-800',
                    sort_order: 0,
                    is_active: true,
                    created_at: Date.now(),
                    updated_at: Date.now()
                },
                { 
                    id: '2', 
                    name: 'White Sprite', 
                    description: 'Cotyledon orbiculata White Sprite',
                    color: 'bg-blue-100 text-blue-800',
                    sort_order: 1,
                    is_active: true,
                    created_at: Date.now(),
                    updated_at: Date.now()
                },
                { 
                    id: '3', 
                    name: 'Powdery White', 
                    description: 'Cotyledon orbiculata Powdery White',
                    color: 'bg-purple-100 text-purple-800',
                    sort_order: 2,
                    is_active: true,
                    created_at: Date.now(),
                    updated_at: Date.now()
                }
            ];
            this.saveToLocalStorage('categories', categories);
            console.log('✅ 기본 카테고리 데이터 생성 완료');
        }

        // 기본 상품 생성
        const existingProducts = this.loadFromLocalStorage('products');
        if (!existingProducts || existingProducts.length === 0) {
            const products = [
                {
                    id: '1',
                    name: 'White Platter 소품',
                    category: 'White Platter',
                    price: 15000,
                    stock: 50,
                    description: '2-3cm 소품 크기',
                    created_at: Date.now() - 86400000 * 3 // 3일 전
                },
                {
                    id: '2', 
                    name: 'White Platter 중품',
                    category: 'White Platter',
                    price: 25000,
                    stock: 30,
                    description: '4-5cm 중품 크기',
                    created_at: Date.now() - 86400000 * 2 // 2일 전
                },
                {
                    id: '3',
                    name: 'White Platter 대품',
                    category: 'White Platter', 
                    price: 35000,
                    stock: 20,
                    description: '6cm 이상 대품 크기',
                    created_at: Date.now() - 86400000 * 1 // 1일 전
                },
                {
                    id: '4',
                    name: '가을 단풍 다육이',
                    category: 'White Sprite',
                    price: 12000,
                    stock: 40,
                    description: '계절 한정 품종',
                    created_at: Date.now() - 86400000 * 4 // 4일 전
                },
                {
                    id: '5',
                    name: '하얀 천사 다육이',
                    category: 'Powdery White',
                    price: 18000,
                    stock: 25,
                    description: '희귀 품종',
                    created_at: Date.now() // 오늘
                }
            ];
            this.saveToLocalStorage('products', products);
            console.log('✅ 상품 데이터 생성 완료');
        }

        // 기본 주문처 생성
        const existingSources = this.loadFromLocalStorage('order_sources');
        if (!existingSources || existingSources.length === 0) {
            const orderSources = [
                { id: '1', name: '네이버 스마트스토어', description: '네이버 쇼핑 플랫폼' },
                { id: '2', name: '쿠팡', description: '쿠팡 온라인 몰' },
                { id: '3', name: '당근마켓', description: '지역 직거래' },
                { id: '4', name: '인스타그램', description: 'SNS 직접 주문' },
                { id: '5', name: '유튜브', description: '경산다육TV 시청자' }
            ];
            this.saveToLocalStorage('order_sources', orderSources);
            console.log('✅ 주문처 데이터 생성 완료');
        }

        // 고객 데이터 초기화 (빈 배열로 시작)
        const existingCustomers = this.loadFromLocalStorage('farm_customers');
        if (!existingCustomers) {
            // 빈 고객 목록으로 초기화
            this.saveToLocalStorage('farm_customers', []);
            console.log('✅ 고객 데이터 초기화 완료 (빈 목록)');
        }

        // 주문 데이터 초기화 (빈 배열로 시작)
        const existingOrders = this.loadFromLocalStorage('orders');
        if (!existingOrders) {
            // 빈 주문 목록으로 초기화
            this.saveToLocalStorage('orders', []);
            console.log('✅ 주문 데이터 초기화 완료 (빈 목록)');
        }

        // 기본 대기자 데이터 생성
        const existingWaitlist = this.loadFromLocalStorage('farm_waitlist');
        if (!existingWaitlist || existingWaitlist.length === 0) {
            const waitlist = [
                {
                    id: '1',
                    customer_name: '이대기',
                    customer_phone: '010-1111-1111',
                    product_name: 'White Platter 대품',
                    product_category: 'White Platter',
                    expected_price: 35000,
                    status: '대기중',
                    priority: 1,
                    register_date: '2024-09-01',
                    memo: '품절시 연락 요청',
                    created_at: Date.now(),
                    updated_at: Date.now()
                },
                {
                    id: '2',
                    customer_name: '김대기',
                    customer_phone: '010-2222-2222',
                    product_name: 'White Platter 중품',
                    product_category: 'White Platter',
                    expected_price: 25000,
                    status: '대기중',
                    priority: 2,
                    register_date: '2024-09-01',
                    memo: '입고되면 바로 연락 부탁',
                    created_at: Date.now(),
                    updated_at: Date.now()
                },
                {
                    id: '3',
                    customer_name: '박연락',
                    customer_phone: '010-3333-3333',
                    product_name: 'White Sprite 소품',
                    product_category: 'White Sprite',
                    expected_price: 15000,
                    status: '연락완료',
                    priority: 3,
                    register_date: '2024-08-30',
                    memo: '연락 완료 - 구매 예정',
                    created_at: Date.now() - 86400000, // 1일 전
                    updated_at: Date.now()
                }
            ];
            this.saveToLocalStorage('farm_waitlist', waitlist);
            console.log('✅ 대기자 데이터 생성 완료');
        }

        console.log('🎉 초기 데이터 확인/생성 완료!');
        
        // 데이터 생성 후 강제 로드
        this.customers = this.loadFromLocalStorage('farm_customers') || [];
        this.orders = this.loadFromLocalStorage('orders') || [];
        this.farm_waitlist = this.loadFromLocalStorage('farm_waitlist') || [];
        console.log('🔍 초기화된 고객 수:', this.customers.length);
        console.log('🔍 초기화된 주문 수:', this.orders.length);
    }

    // 주문 데이터 로드
    async loadOrders() {
        try {
            // Supabase 통합 로드 (캐시 우선, Supabase 폴백)
            const data = await this.loadFromStorage('orders') || [];
            console.log('📦 주문 데이터 로드:', data.length, '건');
            
            this.orders = data;
            console.log('✅ 주문 데이터 로드 완료:', data.length, '건');
            
            // API 호출 시도 (백그라운드에서 동기화) - 차단되면 무시
            try {
                const response = await fetch(this.getApiUrl('farm_orders'));
                if (response.ok) {
                    const result = await response.json();
                    const apiData = result.data || [];
                    console.log('🌐 API 주문 데이터 확인:', apiData.length, '건');
                    
                    // API 데이터가 더 많으면 업데이트
                    if (apiData.length > data.length) {
                        this.orders = apiData;
                        this.saveToLocalStorage('orders', apiData);
                        console.log('✅ API 데이터로 업데이트:', apiData.length, '건');
                    }
                } else {
                    console.warn('⚠️ API 응답 오류:', response.status);
                }
            } catch (apiError) {
                console.warn('⚠️ API 호출 실패, 로컬 데이터 유지:', apiError);
            }
            
            // 🔧 주문 테이블 렌더링 강제 실행 (API 차단과 관계없이)
            console.log('🔄 주문 테이블 렌더링 시작...');
            this.renderOrdersTable();
            
            // 로컬 데이터가 없고 API도 실패한 경우
            if (this.orders.length === 0) {
                console.log('📦 모든 데이터가 비어있음 - 빈 배열로 초기화');
                this.orders = [];
            }
            
        } catch (error) {
            console.error('❌ 주문 데이터 로드 중 오류:', error);
            // 최후의 수단: LocalStorage에서 강제 로드
            const localData = this.loadFromLocalStorage('orders') || [];
            this.orders = localData;
            console.log('📦 오류 복구: 로컬 데이터로 복구:', localData.length, '건');
        }
        
        // 🔄 상태 마이그레이션: 기존 상태를 새로운 상태로 변환
        let migrationNeeded = false;
        this.orders = this.orders.map(order => {
            if (order.order_status === '입금확인') {
                order.order_status = '입금확인';
                migrationNeeded = true;
            } else if (order.order_status === '배송준비') {
                order.order_status = '배송준비';
                migrationNeeded = true;
            }
            return order;
        });
        
        // 마이그레이션이 발생했으면 저장
        if (migrationNeeded) {
            await this.saveToStorage('orders', this.orders);
            console.log('🔄 주문 상태 마이그레이션 완료: "입금확인"→"입금확인", "배송준비"→"배송준비"');
        }
        
        console.log('🔍 최종 주문 데이터:', this.orders.length, '건');
        this.renderOrdersTable();
        
        // 필터 초기화 (전체 탭 활성화)
        if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
            this.filterOrdersByStatus(this.currentStatusFilter);
        }
    }

    // 고객 목록 정렬
    sortCustomers(customers) {
        const sortedCustomers = [...customers]; // 원본 배열 복사
        
        switch (this.customerSortBy) {
            case 'newest':
                // 최근 등록순 (created_at 또는 registration_date 기준 내림차순)
                return sortedCustomers.sort((a, b) => {
                    const timeA = a.created_at || new Date(a.registration_date || 0).getTime() || parseInt(a.id) || 0;
                    const timeB = b.created_at || new Date(b.registration_date || 0).getTime() || parseInt(b.id) || 0;
                    return timeB - timeA;
                });
                
            case 'name_asc':
                // 고객명 오름차순 (ㄱ → ㅎ)
                return sortedCustomers.sort((a, b) => {
                    return a.name.localeCompare(b.name, 'ko-KR');
                });
                
            case 'name_desc':
                // 고객명 내림차순 (ㅎ → ㄱ)
                return sortedCustomers.sort((a, b) => {
                    return b.name.localeCompare(a.name, 'ko-KR');
                });
                
            default:
                return sortedCustomers;
        }
    }

    // 정렬 기준 변경
    changeCustomerSort(sortBy) {
        console.log('🔄 고객 정렬 기준 변경:', sortBy);
        this.customerSortBy = sortBy;
        
        // 사용자 설정 저장
        localStorage.setItem('farm_customer_sort', sortBy);
        
        this.renderCustomersTable();
        console.log('✅ 고객 정렬 완료');
    }

    // 고객 데이터 로드
    async loadCustomers() {
        try {
            console.log('🔄 고객 데이터 로드 시작...');
            
            // 1. Supabase에서 데이터 우선 로드
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (supabase) {
                try {
                    console.log('📡 Supabase에서 고객 데이터 조회 중...');
                    const { data: supabaseData, error } = await supabase
                        .from('farm_customers')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (error) {
                        throw error;
                    }
                    
                    if (supabaseData && supabaseData.length > 0) {
                        this.customers = supabaseData;
                        console.log('✅ Supabase에서 고객 데이터 로드:', supabaseData.length, '명');
                        
                        // 로컬 스토리지에도 저장
                        await this.saveToStorage('farm_customers', supabaseData);
                    } else {
                        console.log('📭 Supabase에 고객 데이터 없음');
                        // 로컬 스토리지에서 로드
                        const localData = await this.loadFromStorage('farm_customers') || [];
                        this.customers = localData;
                        console.log('📦 로컬에서 고객 데이터 로드:', localData.length, '명');
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ Supabase 로드 실패, 로컬 데이터 사용:', supabaseError.message);
                    // 로컬 스토리지에서 로드
                    const localData = await this.loadFromStorage('customers') || [];
                    this.customers = localData;
                    console.log('📦 로컬에서 고객 데이터 로드:', localData.length, '명');
                }
            } else {
                console.log('📴 Supabase 클라이언트 없음, 로컬 데이터 사용');
                // 로컬 스토리지에서 로드
                const localData = await this.loadFromStorage('customers') || [];
                this.customers = localData;
                console.log('📦 로컬에서 고객 데이터 로드:', localData.length, '명');
            }
        } catch (error) {
            console.error('❌ 고객 데이터 로드 실패:', error);
            this.customers = [];
        }
        
        console.log('🔍 최종 고객 데이터:', this.customers.length, '명');
        
        // 고객 등급 자동 재계산 (새로운 등급 시스템 적용)
        this.recalculateAllCustomerGrades();
        
        this.renderCustomersTable();
    }

    // 카테고리 데이터 로드
    async loadCategories() {
        try {
            console.log('카테고리 데이터 로드 시작...');
            const response = await fetch(this.getApiUrl('categories'));
            
            if (response.ok) {
                const result = await response.json();
                this.categories = result.data || [];
                console.log('API에서 로드된 카테고리:', this.categories);
            } else {
                throw new Error(`API 오류: ${response.status}`);
            }
        } catch (error) {
            console.warn('API 로드 실패, LocalStorage에서 로드:', error);
            this.categories = this.loadFromLocalStorage('categories');
            
            // LocalStorage에도 데이터가 없으면 기본 데이터 생성
            if (this.categories.length === 0) {
                this.categories = [
                    { id: '1', name: '희귀종', description: 'White Platter 등 희귀한 다육식물', color: 'bg-purple-100 text-purple-800', sort_order: 1 },
                    { id: '2', name: '일반종', description: '일반적인 다육식물', color: 'bg-green-100 text-green-800', sort_order: 2 },
                    { id: '3', name: '새싹', description: '새싹 및 어린 식물', color: 'bg-yellow-100 text-yellow-800', sort_order: 3 }
                ];
                this.saveToLocalStorage('categories', this.categories);
                console.log('기본 카테고리 데이터 생성됨');
            }
        }
        
        console.log('최종 로드된 카테고리:', this.categories);
        this.updateCategorySelects();
    }

    // 상품 데이터 로드
    async loadProducts() {
        console.log('📦 상품 데이터 로드 시작...');
        
        // Supabase 통합 로드 (캐시 우선, Supabase 폴백)
        this.products = await this.loadFromStorage('products') || [];
        console.log('💿 상품 데이터 로드:', this.products.length, '개');
        
        // 2단계: LocalStorage가 비어있으면 API에서 로드
        if (this.products.length === 0) {
            console.log('🌐 LocalStorage가 비어있음, API에서 로드 시도...');
            try {
                const response = await fetch(this.getApiUrl('products'));
                if (response.ok) {
                    const result = await response.json();
                    this.products = result.data || [];
                    console.log('✅ API에서 로드된 상품:', this.products.length, '개');
                    
                    // API 데이터를 LocalStorage에 저장
                    await this.saveToStorage('products', this.products);
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (error) {
                console.warn('⚠️ API 로드 실패:', error);
            }
        }
        
        // 3단계: 여전히 비어있으면 기본 데이터 생성
        if (this.products.length === 0) {
            console.log('🌱 기본 상품 데이터 생성...');
            this.products = [
                { id: '1', name: 'White Platter (대형)', category: '희귀종', price: 150000, stock: 5, description: '국내 최초 생산 희귀 품종', image_url: '' },
                { id: '2', name: 'White Platter (중형)', category: '희귀종', price: 100000, stock: 8, description: '중형 사이즈', image_url: '' },
                { id: '3', name: '비맞이 염자', category: '일반종', price: 15000, stock: 20, description: '일반적인 다육식물', image_url: '' }
            ];
            await this.saveToStorage('products', this.products);
            console.log('✅ 기본 상품 데이터 생성 완료');
        }
        
        console.log('🎉 최종 로드된 상품:', this.products.length, '개');
        this.renderProductsTable();
        // this.checkLowStock(); // 재고 부족 알림 제거됨
    }

    // 주문 출처 데이터 로드
    // 기존 loadOrderSources() 함수 제거됨 - 이제 판매 채널 관리 시스템의 channels 데이터를 직접 사용

    // 주문 출처 드롭다운 채우기 - 판매 채널 관리 시스템과 연동
    populateOrderSourceDropdown() {
        const dropdown = document.getElementById('order-source');
        if (!dropdown) return;

        // 모든 옵션을 완전히 제거
        dropdown.innerHTML = '<option value="">판매 채널을 선택하세요</option>';

        // 판매 채널 관리 시스템의 channels 데이터 사용
        const activeChannels = [...this.channels]
            .filter(channel => channel.is_active !== false)
            .sort((a, b) => {
                // sort_order가 있으면 그것으로, 없으면 이름으로 한국어 정렬
                if (a.sort_order !== undefined && b.sort_order !== undefined) {
                    return (a.sort_order || 0) - (b.sort_order || 0);
                }
                return (a.name || '').localeCompare(b.name || '', 'ko-KR');
            });

        if (activeChannels.length === 0) {
            // 판매 채널이 없는 경우 안내 메시지
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '판매 채널을 먼저 등록해주세요';
            option.disabled = true;
            dropdown.appendChild(option);
        } else {
            // 활성 판매 채널들을 드롭다운에 추가
            activeChannels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.name;
                option.textContent = channel.name;
                option.dataset.color = channel.color || 'bg-gray-100 text-gray-800';
                option.dataset.channelId = channel.id;
                dropdown.appendChild(option);
            });
        }
    }

    // 주문 테이블 렌더링 (아코디언 형태)
    async renderOrdersTable(filteredOrders = null) {
        const tbody = document.getElementById('orders-table-body');
        
        // 잘못된 데이터 필터링 (undefined, NaN 등 제거)
        const cleanOrders = (filteredOrders || this.orders).filter(order => {
            const isValid = order && 
                           order.id && 
                           order.customer_name && 
                           order.customer_name !== 'undefined' && 
                           order.customer_name !== 'NaN' &&
                           order.customer_name.trim() !== '' &&
                           order.total_amount !== null &&
                           order.total_amount !== undefined &&
                           !isNaN(order.total_amount);
            
            if (!isValid) {
                console.log('🗑️ 렌더링에서 잘못된 데이터 제외:', order);
            }
            
            return isValid;
        });
        
        // 원본 데이터에서 잘못된 데이터가 발견되면 자동 정리
        const originalLength = (filteredOrders || this.orders).length;
        const cleanLength = cleanOrders.length;
        
        if (originalLength !== cleanLength && !filteredOrders) {
            console.log('🧹 잘못된 데이터 발견, 자동 정리 수행...');
            this.orders = cleanOrders;
            await this.saveToStorage('orders', this.orders);
            console.log(`✅ ${originalLength - cleanLength}개의 잘못된 데이터가 자동 정리됨`);
        }
        
        const ordersToRender = cleanOrders;
        
        // 상태별 카운트 업데이트
        this.updateStatusCounts();
        
        if (ordersToRender.length === 0) {
            const isFiltered = filteredOrders !== null;
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-shopping-cart text-4xl mb-2 opacity-50"></i>
                        ${isFiltered ? 
                            '<p>해당 상태의 주문이 없습니다.</p><p class="text-sm">다른 상태 탭을 선택해보세요! 📋</p>' :
                            '<p>등록된 주문이 없습니다.</p><p class="text-sm">새 주문 등록 버튼을 클릭해서 첫 주문을 등록해보세요! 🌱</p>'
                        }
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = ordersToRender.map(order => {
            const statusColor = this.getStatusColor(order.order_status);
            const orderDate = new Date(order.order_date);
            const shortDate = `${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')}`;
            const formattedAmount = new Intl.NumberFormat('ko-KR').format(order.total_amount);
            
            // 배송비 정보 계산
            let shippingInfo = '';
            let orderItems = [];
            if (order.order_items) {
                orderItems = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                const itemsTotal = orderItems.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
                const shippingFee = this.calculateShippingFee(orderItems, itemsTotal);
                shippingInfo = shippingFee > 0 ? `배송비 ${new Intl.NumberFormat('ko-KR').format(shippingFee)}원 포함` : '무료배송';
            }

            // 주문상품 정보 포맷
            const productsSummary = orderItems.length > 0 ? 
                orderItems.map(item => `${item.name || item.product_name} (${item.quantity}개)`).join(', ') : 
                '상품 정보 없음';
            
            // 주문서 출력 아이콘 (실제 기능 연결) - 색깔 개선
            const printStatusIcon = `
                <button onclick="orderSystem.printOrderReceipt('${order.id}')" 
                        class="inline-flex items-center justify-center w-8 h-8 ${order.print_status === 'completed' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-purple-600 bg-purple-100 hover:bg-purple-200'} rounded-full transition-all duration-200" 
                        title="주문서 출력">
                    <i class="fas fa-print text-sm"></i>
                </button>
            `;
            
            // SMS 발송 아이콘 (실제 기능 연결) - 색깔 개선  
            const smsStatusIcon = `
                <button onclick="orderSystem.showSmsModal('${order.id}')" 
                        class="inline-flex items-center justify-center w-8 h-8 ${order.sms_status === 'sent' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-orange-600 bg-orange-100 hover:bg-orange-200'} rounded-full transition-all duration-200" 
                        title="SMS 발송">
                    <i class="fas fa-comment-sms text-sm"></i>
                </button>
            `;

            return `
                <!-- 새로운 10컬럼 레이아웃 -->
                <tr class="order-summary-row hover:bg-gray-50 transition-colors border-b border-gray-100" data-order-id="${order.id}">
                    <!-- 1. 체크박스 -->
                    <td class="px-2 py-2 text-center">
                        <input type="checkbox" class="order-checkbox rounded text-green-600 focus:ring-green-500" 
                               value="${order.id}" data-order='${JSON.stringify(order).replace(/'/g, "&#x27;")}' 
                               onchange="orderSystem.updateBulkButtons()">
                    </td>
                    
                    <!-- 2. 주문일자 -->
                    <td class="px-2 py-2 text-sm text-gray-600">${shortDate}</td>
                    
                    <!-- 3. 주문번호 (클릭 가능 - 주문 상세) -->
                    <td class="px-2 py-2">
                        <button onclick="orderSystem.toggleOrderDetails('${order.id}')" 
                                ontouchstart="orderSystem.toggleOrderDetails('${order.id}')"
                                class="inline-flex items-center text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer touch-manipulation"
                                title="주문 상세 정보 보기"
                                style="min-height: 44px; min-width: 44px;">
                            ${order.order_number || order.id}
                            <i class="fas fa-chevron-down ml-1 text-xs transition-transform order-chevron" 
                               id="chevron-${order.id}"></i>
                        </button>
                    </td>
                    
                    <!-- 4. 고객명 (클릭 가능 - 고객 정보) -->
                    <td class="px-2 py-2">
                        <button onclick="orderSystem.openCustomerDetails('${order.customer_name}')" 
                                class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                title="고객 상세 정보 보기">
                            ${order.customer_name}
                        </button>
                    </td>
                    
                    <!-- 5. 연락처 -->
                    <td class="px-2 py-2 text-sm text-gray-600">${order.customer_phone || '-'}</td>
                    
                    <!-- 6. 주문상태 (클릭 가능한 드롭다운) -->
                    <td class="px-2 py-2 text-left relative">
                        <button onclick="orderSystem.toggleStatusDropdown('${order.id}')" 
                                class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusColor} hover:opacity-80 transition-opacity cursor-pointer">
                            ${order.order_status}
                            <i class="fas fa-chevron-down ml-1 text-xs"></i>
                        </button>
                        <div id="status-dropdown-${order.id}" class="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] hidden max-h-64 overflow-y-auto">
                            <div class="py-1">
                                ${this.generateStatusDropdownButtons(order.id)}
                            </div>
                        </div>
                    </td>
                    
                    <!-- 7. 주문서 출력 상태 아이콘 -->
                    <td class="px-2 py-2 text-center">
                        ${printStatusIcon}
                    </td>
                    
                    <!-- 8. SMS 발송 상태 아이콘 -->
                    <td class="px-2 py-2 text-center">
                        ${smsStatusIcon}
                    </td>
                    
                    <!-- 9. 관리 아이콘들 -->
                    <td class="px-2 py-2 text-center">
                        <div class="flex items-center justify-center space-x-1">
                            <button onclick="orderSystem.editOrder('${order.id}')" 
                                    class="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors" 
                                    title="수정">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="orderSystem.deleteOrder('${order.id}')" 
                                    class="inline-flex items-center justify-center w-7 h-7 bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors" 
                                    title="삭제">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                
                <!-- 상세 정보 펼침 영역 (기본 숨김) -->
                <tr class="order-details-row hidden" id="details-${order.id}">
                    <td colspan="9" class="px-0 py-0">
                        <div class="bg-gray-50 border-t border-gray-200">
                            <div class="px-6 py-4">
                                <!-- 상세 정보 섹션 -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <h4 class="text-sm font-semibold text-gray-700 mb-3">📋 주문 정보</h4>
                                        <div class="space-y-2 text-sm">
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">주문번호:</span>
                                                <span class="font-medium">${order.order_number}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">연락처:</span>
                                                <span class="font-medium">${order.customer_phone}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">주문 출처:</span>
                                                <span>${this.getOrderSourceDisplay(order.order_source)}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">배송주소:</span>
                                                <span class="text-right flex-1 ml-2">${order.customer_address || '미입력'}</span>
                                            </div>
                                            ${order.tracking_number ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">운송장번호:</span>
                                                <span class="font-medium text-blue-600">${order.tracking_number}</span>
                                            </div>` : ''}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 class="text-sm font-semibold text-gray-700 mb-3">🌱 주문 상품</h4>
                                        <div class="space-y-2 max-h-32 overflow-y-auto">
                                            ${orderItems.map(item => `
                                                <div class="flex justify-between items-center text-sm bg-white rounded p-2">
                                                    <div class="flex-1">
                                                        <span class="font-medium">${item.name || item.product_name}</span>
                                                        ${item.size ? `<span class="text-gray-500 text-xs"> (${item.size})</span>` : ''}
                                                    </div>
                                                    <div class="text-right">
                                                        <div class="text-gray-600">${item.quantity}개 × ${new Intl.NumberFormat('ko-KR').format(item.price)}원</div>
                                                        <div class="font-medium text-green-600">${new Intl.NumberFormat('ko-KR').format(item.total || item.price * item.quantity)}원</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                            ${orderItems.length === 0 ? '<div class="text-gray-500 text-sm">주문 상품 정보가 없습니다.</div>' : ''}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 관리 버튼들 -->
                                <div class="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
                                    <div class="flex flex-wrap gap-2">
                                        <button onclick="orderSystem.printOrderReceipt('${order.id}')" 
                                                class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-medium transition-colors">
                                            <i class="fas fa-receipt mr-1"></i>주문서 출력
                                        </button>
                                        <button onclick="orderSystem.showSmsModal('${order.id}')" 
                                                class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors">
                                            <i class="fas fa-sms mr-1"></i>SMS 발송
                                        </button>
                                    </div>
                                    
                                    <!-- 상태 변경 드롭다운 -->
                                    <div class="relative inline-block">
                                        <button onclick="orderSystem.toggleStatusDropdown('${order.id}')" 
                                                class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg ${statusColor} hover:opacity-80 transition-opacity border border-gray-300">
                                            상태: ${order.order_status}
                                            <i class="fas fa-chevron-down ml-1"></i>
                                        </button>
                                        <div id="status-dropdown-${order.id}" class="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] hidden max-h-64 overflow-y-auto">
                                            <div class="py-1">
                                                ${this.generateStatusDropdownButtons(order.id)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 주문 상태별 색상 (표준 목록 기반)
    getStatusColor(status) {
        const colors = {
            '주문접수': 'bg-gray-100 text-gray-800',
            '입금확인': 'bg-blue-100 text-blue-800',
            '배송준비': 'bg-yellow-100 text-yellow-800',
            '배송시작': 'bg-purple-100 text-purple-800',
            '배송완료': 'bg-green-100 text-green-800',
            '주문취소': 'bg-gray-100 text-gray-800',
            '환불처리': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // 상태별 주문 필터링
    filterOrdersByStatus(status) {
        this.currentStatusFilter = status;
        
        if (status === 'all') {
            this.renderOrdersTable();
        } else {
            const filteredOrders = this.orders.filter(order => order.order_status === status);
            this.renderOrdersTable(filteredOrders);
        }
    }

    // 주문 상세 정보 토글 (아코디언)
    toggleOrderDetails(orderId) {
        const detailsRow = document.getElementById(`details-${orderId}`);
        const chevron = document.getElementById(`chevron-${orderId}`);
        
        if (detailsRow && chevron) {
            const isHidden = detailsRow.classList.contains('hidden');
            
            if (isHidden) {
                // 펼치기
                detailsRow.classList.remove('hidden');
                chevron.classList.add('rotate-180');
            } else {
                // 접기
                detailsRow.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        }
    }

    // 상태별 주문 개수 업데이트
    updateStatusCounts() {
        const statusCounts = {
            all: this.orders.length,
            '주문접수': 0,
            '입금확인': 0,
            '배송준비': 0,
            '배송시작': 0,
            '배송완료': 0,
            '주문취소': 0,
            '환불처리': 0
        };

        // 각 상태별 개수 계산
        this.orders.forEach(order => {
            const status = order.order_status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        // UI 업데이트
        Object.keys(statusCounts).forEach(status => {
            const countElement = document.getElementById(`count-${status}`);
            if (countElement) {
                countElement.textContent = statusCounts[status];
            }
        });
    }

    // 고객 등급별 필터링
    filterCustomersByGrade(grade) {
        this.currentCustomerGradeFilter = grade;
        
        if (grade === 'all') {
            this.renderCustomersTable();
        } else {
            // 모든 고객의 등급을 새로운 시스템으로 재계산
            this.customers.forEach(customer => {
                const currentGrade = this.calculateCustomerGrade(customer.id);
                if (customer.grade !== currentGrade) {
                    customer.grade = currentGrade;
                }
            });
            
            const filteredCustomers = this.customers.filter(customer => 
                (customer.grade || 'GENERAL') === grade
            );
            this.renderCustomersTable(filteredCustomers);
        }
    }

    // 고객 등급별 개수 업데이트
    updateCustomerGradeCounts() {
        const gradeCounts = {
            all: this.customers.length,
            'BLACK_DIAMOND': 0,
            'PURPLE_EMPEROR': 0,
            'RED_RUBY': 0,
            'GREEN_LEAF': 0,
            'GENERAL': 0
        };

        // 각 등급별 개수 계산
        this.customers.forEach(customer => {
            const grade = customer.grade || 'GENERAL';
            if (gradeCounts.hasOwnProperty(grade)) {
                gradeCounts[grade]++;
            }
        });

        // UI 업데이트
        Object.keys(gradeCounts).forEach(grade => {
            const countElement = document.getElementById(`customer-count-${grade}`);
            if (countElement) {
                countElement.textContent = gradeCounts[grade];
            }
        });
    }

    // 대기자 상태별 필터링
    filterWaitlistByStatus(status) {
        this.currentWaitlistStatusFilter = status;
        
        if (status === 'all') {
            this.renderWaitlistTable();
        } else {
            const filteredWaitlist = this.farm_waitlist.filter(item => item.status === status);
            this.renderWaitlistTable(filteredWaitlist);
        }
    }

    // 대기자 상태별 개수 업데이트
    updateWaitlistStatusCounts() {
        const statusCounts = {
            all: this.farm_waitlist.length,
            '대기중': 0,
            '연락완료': 0,
            '주문전환': 0,
            '취소': 0
        };

        // 각 상태별 개수 계산
        this.farm_waitlist.forEach(item => {
            const status = item.status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        // UI 업데이트
        Object.keys(statusCounts).forEach(status => {
            const countElement = document.getElementById(`waitlist-count-${status}`);
            if (countElement) {
                countElement.textContent = statusCounts[status];
            }
        });
    }

    // 고객 등급 배지 표시
    getCustomerGradeBadge(grade) {
        const gradeInfo = {
            'BLACK_DIAMOND': { color: 'bg-gray-900 text-white', icon: '💎', name: '블랙 다이아몬드' },
            'PURPLE_EMPEROR': { color: 'bg-purple-100 text-purple-800', icon: '🟣', name: '퍼플 엠페러' },
            'RED_RUBY': { color: 'bg-red-100 text-red-800', icon: '🔴', name: '레드 루비' },
            'GREEN_LEAF': { color: 'bg-green-100 text-green-800', icon: '🟢', name: '그린 리프' },
            'GENERAL': { color: 'bg-blue-100 text-blue-800', icon: '🙋‍♂️', name: '일반' }
        };
        
        const info = gradeInfo[grade] || gradeInfo['GENERAL'];
        return `<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${info.color}">
                    <span class="mr-1">${info.icon}</span>${info.name}
                </span>`;
    }

    // 주문 출처 표시
    getOrderSourceDisplay(sourceName) {
        if (!sourceName) {
            return '<span class="text-gray-400 text-xs">-</span>';
        }
        
        // 하드코딩된 색상 매핑
        const colorMap = {
            '유튜브': 'bg-red-100 text-red-800',
            '밴드': 'bg-green-100 text-green-800',
            '네이버': 'bg-blue-100 text-blue-800',
            '전화': 'bg-purple-100 text-purple-800',
            '문자': 'bg-orange-100 text-orange-800',
            'SNS': 'bg-pink-100 text-pink-800',
            '방문': 'bg-yellow-100 text-yellow-800'
        };
        
        const color = colorMap[sourceName] || 'bg-gray-100 text-gray-800';
        
        return `
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}">
                ${sourceName}
            </span>
        `;
    }

    // 전체 주문 선택/해제
    toggleAllOrders(checked) {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkButtons();
    }

    // 일괄 처리 버튼 상태 업데이트
    updateBulkButtons() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
        const statusBtn = document.getElementById('bulk-status-change-btn');
        const exportBtn = document.getElementById('bulk-export-logen-btn');
        
        if (checkedBoxes.length > 0) {
            if (statusBtn) statusBtn.classList.remove('hidden');
            if (exportBtn) exportBtn.classList.remove('hidden');
        } else {
            if (statusBtn) statusBtn.classList.add('hidden');
            if (exportBtn) exportBtn.classList.add('hidden');
        }
    }

    // 로젠택배 엑셀 내보내기 (주문관리에서)
    exportToLogenExcel() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert('내보낼 주문을 선택해주세요.');
            return;
        }

        const selectedOrders = Array.from(checkedBoxes).map(checkbox => {
            return JSON.parse(checkbox.dataset.order.replace(/&#x27;/g, "'"));
        });

        this.showExcelPreview(selectedOrders, '주문관리');
    }

    // 일괄 상태변경 모달 열기
    openBulkStatusChangeModal() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked, .shipping-checkbox:checked');
        if (checkedBoxes.length === 0) {
            this.showToast('❌ 상태를 변경할 주문을 선택해주세요.', 'error');
            return;
        }

        // 선택된 주문 수 업데이트
        document.getElementById('selected-orders-count').textContent = checkedBoxes.length;
        
        // 상태 드롭다운을 표준 목록으로 업데이트
        const bulkStatusSelect = document.getElementById('bulk-status-select');
        if (bulkStatusSelect) {
            const statusOptions = this.standardOrderStatuses.map(status => 
                `<option value="${status.value}">${status.label}</option>`
            ).join('');
            bulkStatusSelect.innerHTML = `<option value="">상태를 선택하세요</option>${statusOptions}`;
        }
        
        // 모달 열기
        document.getElementById('bulk-status-change-modal').classList.remove('hidden');
    }

    // 일괄 상태변경 모달 닫기
    closeBulkStatusChangeModal() {
        document.getElementById('bulk-status-change-modal').classList.add('hidden');
    }

    // 일괄 상태변경 실행
    async executeBulkStatusChange() {
        const selectedStatus = document.getElementById('bulk-status-select').value;
        if (!selectedStatus) {
            this.showToast('❌ 변경할 상태를 선택해주세요.', 'error');
            return;
        }

        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked, .shipping-checkbox:checked');
        if (checkedBoxes.length === 0) {
            this.showToast('❌ 상태를 변경할 주문을 선택해주세요.', 'error');
            return;
        }

        console.log('🔄 일괄 상태 변경 시작:', checkedBoxes.length, '개 주문 →', selectedStatus);

        // 상태 이모지 매핑
        const statusEmojis = {
            '주문접수': '📝',
            '입금확인': '💰',
            '배송준비': '📦',
            '배송시작': '🚚',
            '배송완료': '✅',
            '주문취소': '❌',
            '환불처리': '🔄'
        };

        const statusEmoji = statusEmojis[selectedStatus] || '📋';

        if (!confirm(`선택된 ${checkedBoxes.length}개 주문을 "${statusEmoji} ${selectedStatus}" 상태로 변경하시겠습니까?`)) {
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (let checkbox of checkedBoxes) {
            try {
                const order = JSON.parse(checkbox.dataset.order.replace(/&#x27;/g, "'"));
                
                // API 업데이트 시도
                let apiSuccess = false;
                try {
                    const updateData = { ...order, order_status: selectedStatus };
                    const response = await fetch(this.getApiUrl(`farm_orders/${order.id}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(updateData)
                    });

                    if (response.ok) {
                        apiSuccess = true;
                    } else {
                        throw new Error(`API 오류: ${response.status}`);
                    }
                } catch (apiError) {
                    console.warn('API 업데이트 실패, LocalStorage 사용:', apiError);
                }

                // 메모리의 주문 데이터 강제 업데이트 (API 성공 여부와 관계없이)
                const orderIndex = this.orders.findIndex(o => o.id === order.id);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].status = selectedStatus;
                    this.orders[orderIndex].order_status = selectedStatus;
                    this.orders[orderIndex].updated_at = Date.now();
                    console.log('💾 일괄 변경 - 메모리 업데이트:', order.id, selectedStatus);
                }

                successCount++;

                // 배송완료인 경우 고객 등급 자동 업데이트
                if (selectedStatus === '배송완료') {
                    const customer = this.customers.find(c => c.phone === order.customer_phone);
                    if (customer) {
                        setTimeout(async () => {
                            await this.autoUpdateCustomerGrade(customer.id, true);
                        }, 1000);
                    }
                }

            } catch (error) {
                console.error('주문 상태 변경 오류:', error);
                failCount++;
            }
        }

        // LocalStorage에 강제 저장 (모든 변경사항 한번에)
        this.saveToLocalStorage('orders', this.orders);
        console.log('💿 일괄 변경 - LocalStorage 저장 완료');

        // 결과 알림
        if (successCount > 0) {
            // UI 즉시 새로고침 (loadOrders 호출하지 않음)
            this.renderOrdersTable();
            this.updateStatusCounts();
            this.loadShippingOrders();
            this.updateShippingStatistics();
            
            let message = `🎉 ${successCount}개 주문이 "${statusEmoji} ${selectedStatus}" 상태로 변경되었습니다!`;
            if (failCount > 0) {
                message += `\n⚠️ ${failCount}개 주문 변경 실패`;
            }
            
            this.showToast(message, 'success');
            this.closeBulkStatusChangeModal();
            console.log('✅ 일괄 상태 변경 완료:', successCount, '개 성공');
        } else {
            this.showToast('❌ 주문 상태 변경에 실패했습니다.', 'error');
        }
    }

    // 송장번호 일괄입력 모달 열기
    openTrackingImportModal() {
        document.getElementById('tracking-import-modal').classList.remove('hidden');
        document.getElementById('tracking-import-text').value = '';
        
        // 기본적으로 직접 입력 모드로 설정
        this.switchUploadMethod('manual');
    }
    
    // 업로드 방식 전환
    switchUploadMethod(method) {
        const manualBtn = document.getElementById('upload-method-manual');
        const excelBtn = document.getElementById('upload-method-excel');
        const manualSection = document.getElementById('manual-input-section');
        const excelSection = document.getElementById('excel-upload-section');
        const importButton = document.getElementById('import-button-text');
        
        if (method === 'manual') {
            // 직접 입력 모드
            manualBtn.className = 'flex-1 py-2 px-4 text-sm font-medium text-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 active';
            excelBtn.className = 'flex-1 py-2 px-4 text-sm font-medium text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500';
            manualSection.classList.remove('hidden');
            excelSection.classList.add('hidden');
            importButton.textContent = '송장번호 일괄 적용';
        } else {
            // 엑셀 업로드 모드
            excelBtn.className = 'flex-1 py-2 px-4 text-sm font-medium text-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 active';
            manualBtn.className = 'flex-1 py-2 px-4 text-sm font-medium text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500';
            excelSection.classList.remove('hidden');
            manualSection.classList.add('hidden');
            importButton.textContent = '엑셀 데이터 일괄 적용';
        }
    }
    
    // 엑셀 파일 업로드 처리
    async handleExcelFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📊 엑셀 파일 업로드:', file.name, file.size);
        
        // 파일 크기 검증 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
            return;
        }
        
        // 파일 형식 검증
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/i)) {
            alert('엑셀 파일만 업로드 가능합니다. (.xls, .xlsx)');
            return;
        }
        
        try {
            // 파일 정보 표시
            this.showUploadedFileInfo(file);
            
            // 엑셀 파일 읽기
            const workbook = await this.readExcelFile(file);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            console.log('📋 엑셀 데이터:', jsonData.slice(0, 5)); // 첫 5행만 로그
            
            // 데이터 검증 및 미리보기
            const trackingData = this.parseExcelTrackingData(jsonData);
            if (trackingData.length > 0) {
                this.showExcelPreview(trackingData.slice(0, 5)); // 첫 5행 미리보기
                this.currentExcelData = trackingData; // 전체 데이터 저장
                this.showToast(`✅ ${trackingData.length}개의 송장번호 데이터를 불러왔습니다.`);
            }
            
        } catch (error) {
            console.error('엑셀 파일 처리 오류:', error);
            alert('엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
        }
    }

    // 송장번호 일괄입력 모달 닫기
    closeTrackingImportModal() {
        document.getElementById('tracking-import-modal').classList.add('hidden');
        this.clearUploadedFile();
    }
    
    // 업로드된 파일 정보 표시
    showUploadedFileInfo(file) {
        const uploadAreaContent = document.getElementById('upload-area-content');
        const uploadFileInfo = document.getElementById('upload-file-info');
        const fileName = document.getElementById('upload-file-name');
        const fileSize = document.getElementById('upload-file-size');
        
        uploadAreaContent.classList.add('hidden');
        uploadFileInfo.classList.remove('hidden');
        
        fileName.textContent = file.name;
        fileSize.textContent = `크기: ${(file.size / 1024).toFixed(1)} KB`;
    }
    
    // 업로드된 파일 정보 제거
    clearUploadedFile() {
        const uploadAreaContent = document.getElementById('upload-area-content');
        const uploadFileInfo = document.getElementById('upload-file-info');
        const excelPreviewArea = document.getElementById('excel-preview-area');
        const fileInput = document.getElementById('tracking-excel-input');
        
        uploadAreaContent.classList.remove('hidden');
        uploadFileInfo.classList.add('hidden');
        excelPreviewArea.classList.add('hidden');
        
        fileInput.value = '';
        this.currentExcelData = null;
    }
    
    // 엑셀 파일 읽기
    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    resolve(workbook);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    }
    
    // 엑셀 데이터 파싱
    parseExcelTrackingData(jsonData) {
        const trackingData = [];
        
        // 첫 번째 행은 헤더로 간주하고 제외
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 2 && row[0] && row[1]) {
                const orderNumber = String(row[0]).trim();
                const trackingNumber = String(row[1]).trim();
                
                if (orderNumber && trackingNumber) {
                    trackingData.push({
                        orderNumber: orderNumber,
                        trackingNumber: trackingNumber
                    });
                }
            }
        }
        
        return trackingData;
    }
    
    // 엑셀 데이터 미리보기 표시
    showExcelPreview(previewData) {
        const previewArea = document.getElementById('excel-preview-area');
        const previewTbody = document.getElementById('excel-preview-tbody');
        
        previewTbody.innerHTML = previewData.map(item => `
            <tr>
                <td class="px-3 py-2 border-b border-gray-200 font-mono text-xs">${item.orderNumber}</td>
                <td class="px-3 py-2 border-b border-gray-200 font-mono text-xs">${item.trackingNumber}</td>
            </tr>
        `).join('');
        
        previewArea.classList.remove('hidden');
    }

    // 송장번호 일괄입력 처리
    async importTrackingNumbers() {
        let trackingData = [];
        
        // 현재 활성화된 업로드 방식 확인
        const isExcelMode = !document.getElementById('excel-upload-section').classList.contains('hidden');
        
        if (isExcelMode) {
            // 엑셀 모드: 업로드된 엑셀 데이터 사용
            if (!this.currentExcelData || this.currentExcelData.length === 0) {
                alert('먼저 엑셀 파일을 업로드해주세요.');
                return;
            }
            trackingData = this.currentExcelData;
            console.log('📊 엑셀 데이터로 송장번호 일괄 등록:', trackingData.length, '개');
        } else {
            // 직접 입력 모드: 텍스트 영역의 데이터 사용
            const text = document.getElementById('tracking-import-text').value.trim();
            if (!text) {
                alert('송장번호 데이터를 입력해주세요.');
                return;
            }

            const lines = text.split('\n').filter(line => line.trim());
            
            // 데이터 파싱
            for (let line of lines) {
                const parts = line.split(',');
                if (parts.length !== 2) {
                    alert(`올바르지 않은 형식입니다: ${line}\n"주문번호,송장번호" 형식으로 입력해주세요.`);
                    return;
                }
                
                const orderNumber = parts[0].trim();
                const trackingNumber = parts[1].trim();
                
                trackingData.push({ orderNumber, trackingNumber });
            }
            console.log('📝 직접 입력 데이터로 송장번호 일괄 등록:', trackingData.length, '개');
        }

        // 주문 업데이트
        let successCount = 0;
        let errorCount = 0;
        
        for (let data of trackingData) {
            try {
                const order = this.orders.find(o => o.order_number === data.orderNumber);
                if (!order) {
                    console.error(`주문번호를 찾을 수 없습니다: ${data.orderNumber}`);
                    errorCount++;
                    continue;
                }

                // 로컬 데이터 직접 업데이트
                order.tracking_number = data.trackingNumber;
                order.order_status = '배송시작';
                order.status = '배송시작'; // 두 필드 모두 업데이트
                order.updated_at = Date.now();
                
                console.log('📦 송장번호 등록:', data.orderNumber, '->', data.trackingNumber);
                successCount++;
            } catch (error) {
                console.error('Error updating order:', error);
                errorCount++;
            }
        }

        // 로컬 스토리지에 일괄 저장
        if (successCount > 0) {
            await this.saveToStorage('orders', this.orders);
            console.log('💾 송장번호 일괄 저장 완료:', successCount, '개');
        }

        // 결과 표시
        const totalCount = trackingData.length;
        if (successCount > 0) {
            await this.loadOrders(); // 주문 테이블 새로고침
            await this.loadShippingOrders(); // 배송 테이블 새로고침
            
            let resultMessage = `📦 송장번호 일괄 등록 완료!\n\n`;
            resultMessage += `✅ 성공: ${successCount}개\n`;
            if (errorCount > 0) {
                resultMessage += `❌ 실패: ${errorCount}개\n`;
            }
            resultMessage += `📊 총 처리: ${totalCount}개`;
            
            alert(resultMessage);
            this.showToast(`✅ ${successCount}개 주문의 송장번호가 등록되었습니다!`);
            this.closeTrackingImportModal();
        } else {
            alert(`❌ 모든 송장번호 등록에 실패했습니다.\n\n📋 확인사항:\n• 주문번호가 정확한지 확인\n• 주문 상태가 유효한지 확인\n• 네트워크 연결 상태 확인`);
        }
    }

    // 배송 주문 목록 로드
    loadShippingOrders() {
        // 입금확인, 배송준비, 배송시작, 배송완료 상태의 주문만 필터링
        this.filteredShippingOrders = this.orders.filter(order => 
            ['입금확인', '배송준비', '배송시작', '배송완료'].includes(order.order_status)
        );
        this.renderShippingTable();
        this.updateShippingStatusCounts();
        
        // 현재 필터 상태 유지
        if (this.currentShippingStatusFilter && this.currentShippingStatusFilter !== 'all') {
            this.filterShippingOrdersByStatus(this.currentShippingStatusFilter);
        }
    }

    // 배송 상태별 필터링
    filterShippingOrders(status) {
        this.currentShippingFilter = status;
        if (status) {
            this.filteredShippingOrders = this.orders.filter(order => order.order_status === status);
        } else {
            this.filteredShippingOrders = this.orders.filter(order => 
                ['입금확인', '배송준비', '배송시작', '배송완료'].includes(order.order_status)
            );
        }
        this.renderShippingTable();
        this.updateShippingButtons();
    }

    // 배송관리 상태별 필터링 (탭 방식)
    filterShippingOrdersByStatus(status) {
        this.currentShippingStatusFilter = status;
        
        if (status === 'all') {
            // 전체: 배송 관련 상태만 표시
            this.filteredShippingOrders = this.orders.filter(order => 
                ['입금확인', '배송준비', '배송시작', '배송완료'].includes(order.order_status)
            );
        } else {
            // 특정 상태만 필터링
            this.filteredShippingOrders = this.orders.filter(order => order.order_status === status);
        }
        
        this.renderShippingTable();
        this.updateShippingButtons();
        this.updateShippingStatusCounts();
    }

    // 배송 상태별 주문 개수 업데이트
    updateShippingStatusCounts() {
        const statusCounts = {
            all: 0,
            '입금확인': 0,
            '배송준비': 0,
            '배송시작': 0,
            '배송완료': 0
        };

        // 배송 관련 상태 주문들 계산
        const shippingOrders = this.orders.filter(order => 
            ['입금확인', '배송준비', '배송시작', '배송완료'].includes(order.order_status)
        );
        
        statusCounts.all = shippingOrders.length;

        // 각 상태별 개수 계산
        shippingOrders.forEach(order => {
            const status = order.order_status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        // UI 업데이트
        Object.keys(statusCounts).forEach(status => {
            const countElement = document.getElementById(`shipping-count-${status}`);
            if (countElement) {
                countElement.textContent = statusCounts[status];
            }
        });
    }

    // 배송 테이블 렌더링
    renderShippingTable() {
        const tbody = document.getElementById('shipping-table-body');
        
        // 상태별 카운트 업데이트
        this.updateShippingStatusCounts();
        
        if (this.filteredShippingOrders.length === 0) {
            const isFiltered = this.currentShippingStatusFilter && this.currentShippingStatusFilter !== 'all';
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-truck text-4xl mb-2 opacity-50"></i>
                        ${isFiltered ? 
                            '<p>해당 상태의 배송 주문이 없습니다.</p><p class="text-sm">다른 상태 탭을 선택해보세요! 🚚</p>' :
                            '<p>배송할 주문이 없습니다.</p><p class="text-sm">주문관리에서 주문 상태를 "입금확인"로 변경해보세요! 📦</p>'
                        }
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredShippingOrders.map(order => {
            const statusColor = this.getStatusColor(order.order_status);
            const formattedDate = new Date(order.order_date).toLocaleDateString('ko-KR');
            
            // 주문 아이템들 파싱
            const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
            const itemsText = items.map(item => `${item.name} ${item.quantity}개`).join(', ');
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2">
                        <input type="checkbox" class="shipping-checkbox rounded text-blue-600 focus:ring-blue-500" 
                               value="${order.id}" data-order='${JSON.stringify(order).replace(/'/g, "&#x27;")}' 
                               onchange="orderSystem.updateShippingButtons()">
                    </td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">${order.order_number}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${formattedDate}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${order.customer_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${order.customer_phone}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title="${order.customer_address}">${order.customer_address}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title="${itemsText}">${itemsText}</td>
                    <td class="px-4 py-3 text-sm">
                        <div class="flex items-center space-x-2">
                            <input type="text" 
                                   id="tracking-${order.id}"
                                   value="${order.tracking_number || ''}" 
                                   placeholder="송장번호 입력"
                                   class="w-28 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                   onblur="orderSystem.updateTrackingNumber('${order.id}', this.value)"
                                   onkeypress="if(event.key==='Enter') orderSystem.updateTrackingNumber('${order.id}', this.value)">
                            <button onclick="orderSystem.updateTrackingNumber('${order.id}', document.getElementById('tracking-${order.id}').value)" 
                                    class="px-1 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title="저장">
                                <i class="fas fa-save text-xs"></i>
                            </button>
                        </div>
                    </td>
                    <td class="px-3 py-2">
                        <div class="relative inline-block">
                            <button onclick="orderSystem.toggleStatusDropdown('${order.id}')" 
                                    class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statusColor} hover:opacity-80 transition-opacity cursor-pointer">
                                ${order.order_status}
                                <i class="fas fa-chevron-down ml-1 text-xs"></i>
                            </button>
                            <div id="status-dropdown-${order.id}" class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden max-h-64 overflow-y-auto">
                                <div class="py-1">
                                    <button onclick="orderSystem.updateOrderStatusInline('${order.id}', '입금확인')" class="block w-full text-left px-3 py-2 text-xs text-green-700 hover:bg-green-50">입금확인</button>
                                    <button onclick="orderSystem.updateOrderStatusInline('${order.id}', '배송준비')" class="block w-full text-left px-3 py-2 text-xs text-orange-700 hover:bg-orange-50">배송준비</button>
                                    <button onclick="orderSystem.updateOrderStatusInline('${order.id}', '배송시작')" class="block w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50">배송시작</button>
                                    <button onclick="orderSystem.updateOrderStatusInline('${order.id}', '배송완료')" class="block w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50">배송완료</button>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-3 py-2">
                        <div class="flex space-x-2">
                            <button onclick="orderSystem.editOrder('${order.id}'); orderSystem.switchTab('tab-orders')" 
                                    class="text-blue-600 hover:text-blue-800 text-sm" title="주문 수정">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="orderSystem.showSmsModal('${order.id}')" 
                                    class="text-green-600 hover:text-green-800 text-sm" title="SMS 보내기">
                                <i class="fas fa-sms"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 배송 통계 업데이트
    updateShippingStatistics() {
        const paymentConfirmed = this.orders.filter(o => o.order_status === '입금확인').length;
        const packReady = this.orders.filter(o => o.order_status === '배송준비').length;
        const shipping = this.orders.filter(o => o.order_status === '배송시작').length;
        const delivered = this.orders.filter(o => o.order_status === '배송완료').length;
        
        // 오늘 배송시작된 주문 수
        const today = new Date().toDateString();
        const todayShipping = this.orders.filter(o => 
            o.order_status === '배송시작' && new Date(o.updated_at || o.order_date).toDateString() === today
        ).length;

        // 입금확인은 배송준비 카운트에 포함 (배송 대기 상태로 간주)
        document.getElementById('pack-ready-count').textContent = paymentConfirmed + packReady;
        document.getElementById('shipping-count').textContent = shipping;
        document.getElementById('delivered-count').textContent = delivered;
        document.getElementById('today-shipping-count').textContent = todayShipping;
    }

    // 배송 버튼 상태 업데이트
    updateShippingButtons() {
        const checkedBoxes = document.querySelectorAll('.shipping-checkbox:checked');
        const readyBtn = document.getElementById('bulk-ship-ready-btn');
        const exportBtn = document.getElementById('bulk-export-shipping-btn');
        const statusBtn = document.getElementById('bulk-status-change-shipping-btn');
        
        if (checkedBoxes.length > 0) {
            if (readyBtn) readyBtn.classList.remove('hidden');
            if (exportBtn) exportBtn.classList.remove('hidden');
            if (statusBtn) statusBtn.classList.remove('hidden');
        } else {
            if (readyBtn) readyBtn.classList.add('hidden');
            if (exportBtn) exportBtn.classList.add('hidden');
            if (statusBtn) statusBtn.classList.add('hidden');
        }
    }

    // 배송 주문 전체 선택/해제
    toggleAllShippingOrders(checked) {
        const checkboxes = document.querySelectorAll('.shipping-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateShippingButtons();
    }

    // 송장번호로 주문 검색
    searchByTracking() {
        const trackingNumber = document.getElementById('tracking-search').value.trim();
        if (!trackingNumber) {
            alert('송장번호를 입력해주세요.');
            return;
        }

        const foundOrders = this.orders.filter(order => 
            order.tracking_number && order.tracking_number.includes(trackingNumber)
        );

        if (foundOrders.length > 0) {
            this.filteredShippingOrders = foundOrders;
            this.renderShippingTable();
        } else {
            alert('해당 송장번호를 찾을 수 없습니다.');
        }
    }

    // 송장번호 검색 초기화
    clearTrackingSearch() {
        document.getElementById('tracking-search').value = '';
        this.loadShippingOrders();
    }

    // 배송 상태 일괄 업데이트
    async bulkUpdateShippingStatus(status) {
        const checkedBoxes = document.querySelectorAll('.shipping-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert('변경할 주문을 선택해주세요.');
            return;
        }

        if (!confirm(`선택된 ${checkedBoxes.length}개 주문의 상태를 "${status}"로 변경하시겠습니까?`)) {
            return;
        }

        let successCount = 0;
        for (let checkbox of checkedBoxes) {
            try {
                const order = JSON.parse(checkbox.dataset.order.replace(/&#x27;/g, "'"));
                const updateData = { ...order, order_status: status };

                const response = await fetch(this.getApiUrl(`farm_orders/${order.id}`), {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(updateData)
                });

                if (response.ok) successCount++;
            } catch (error) {
                console.error('Error updating order:', error);
            }
        }

        if (successCount > 0) {
            await this.loadOrders();
            this.loadShippingOrders();
            this.updateShippingStatistics();
            alert(`${successCount}개 주문의 상태가 "${status}"로 변경되었습니다.`);
        }
    }

    // 배송용 로젠택배 엑셀 내보내기 (선택된 주문만)
    exportShippingToLogen() {
        const checkedBoxes = document.querySelectorAll('.shipping-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert('내보낼 주문을 선택해주세요.');
            return;
        }

        const selectedOrders = Array.from(checkedBoxes).map(checkbox => {
            return JSON.parse(checkbox.dataset.order.replace(/&#x27;/g, "'"));
        });

        this.showExcelPreview(selectedOrders, '선택주문');
    }

    // 전체 배송 대기 주문 엑셀 내보내기
    quickExportAllShipping() {
        // 입금확인과 배송준비 상태의 주문만 자동 선택
        const readyOrders = this.orders.filter(order => 
            ['입금확인', '배송준비'].includes(order.order_status)
        );
        
        if (readyOrders.length === 0) {
            alert('배송할 주문이 없습니다.\n입금확인 또는 배송준비 상태의 주문이 필요합니다.');
            return;
        }

        this.showExcelPreview(readyOrders, '전체배송대기');
    }

    // 로젠택배 엑셀 생성 (공통 메서드) - ExcelJS 사용으로 열/행 머리글 숨김
    async generateLogenExcel(selectedOrders, type = '배송목록') {
        console.log('🔍 엑셀 생성 시작 - 주문번호 확인:', selectedOrders.map(o => ({id: o.id, customer: o.customer_name})));
        
        // ExcelJS 워크북 생성
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        
        // 열/행 머리글 숨김 설정
        worksheet.views = [
            {
                showGridLines: false,        // 격자선 숨김
                showRowColHeaders: false     // A,B,C... / 1,2,3... 머리글 숨김
            }
        ];
        
        // 데이터 행 추가 (헤더 없이 바로 데이터)
        selectedOrders.forEach((order, index) => {
            const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
            const itemsText = items.map(item => `${item.name} ${item.quantity}개`).join(', ');
            
            // 배송메모 생성 (메모가 있을 때만)
            let deliveryMemo = '';
            if (order.memo && order.memo.trim()) {
                deliveryMemo = order.memo.trim();
            }
            
            const row = worksheet.addRow([
                order.id,                    // A: 주문번호
                order.customer_name,         // B: 받는분 성명
                '',                          // C: 공란
                order.customer_address,      // D: 받는분 주소  
                order.customer_phone,        // E: 받는분 전화번호
                order.customer_phone,        // F: 받는분 전화번호 (복사)
                1,                           // G: 수량 (1개)
                3800,                        // H: 운임 (3800원)
                '선불',                      // I: 선불
                itemsText,                   // J: 상품명
                '',                          // K: 공란
                deliveryMemo                 // L: 배송메모 (메모가 있을 때만)
            ]);
            
            // 주문번호 열(A열)을 텍스트 형식으로 강제 설정
            row.getCell(1).numFmt = '@';  // 텍스트 형식
            console.log(`🔍 A${index + 1} 셀 처리:`, order.id);
        });
        
        // 컬럼 너비 설정 (가독성 향상)
        worksheet.columns = [
            { width: 15 }, // A: 주문번호
            { width: 10 }, // B: 받는분 성명
            { width: 5 },  // C: 공란
            { width: 30 }, // D: 받는분 주소
            { width: 15 }, // E: 받는분 전화번호
            { width: 5 },  // F: 공란
            { width: 8 },  // G: 수량
            { width: 8 },  // H: 운임
            { width: 5 },  // I: 공란
            { width: 25 }, // J: 상품명
            { width: 5 },  // K: 공란
            { width: 20 }  // L: 배송메모
        ];

        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        const timeStr = today.getHours().toString().padStart(2, '0') + 
                       today.getMinutes().toString().padStart(2, '0');
        const filename = `로젠택배_${type}_${dateStr}_${timeStr}.xlsx`;

        // 혹시 1행에 'A'~'L' 같은 헤더가 남아있으면 자동 제거
        (() => {
            const row1 = (worksheet.getRow(1).values || []).slice(1); // ExcelJS는 1-indexed
            const ABC = ['A','B','C','D','E','F','G','H','I','J','K','L'];
            const looksLikeABCD = ABC.every((v, i) => row1[i] === v);
            if (looksLikeABCD) {
                worksheet.spliceRows(1, 1); // 1행 삭제
                console.log('🧹 Removed accidental A~L header row');
            }
        })();

        // 파일 다운로드
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        
        // 성공 메시지 개선
        const statusBreakdown = this.getOrderStatusBreakdown(selectedOrders);
        alert(`🎉 로젠택배 엑셀 변환 완료!\n\n📊 총 ${selectedOrders.length}개 주문\n${statusBreakdown}\n📁 파일명: ${filename}\n\n💡 업로드 파일 양식 적용:\n✅ A: 주문번호 (새로 추가) 🆕\n✅ B: 받는분 성명\n✅ D: 받는분 주소\n✅ E: 받는분 전화번호\n✅ G: 수량 (1개)\n✅ H: 운임 (3800원)\n✅ J: 상품명\n✅ L: 배송메모\n\n🚚 로젠택배 사이트 업로드 준비 완료!\n\n✨ 열/행 머리글 숨김 적용!`);
    }

    // 엑셀 미리보기 표시
    showExcelPreview(selectedOrders, type) {
        this.currentPreviewOrders = selectedOrders;
        this.currentPreviewType = type;
        
        // 엑셀 정보 생성
        const statusBreakdown = this.getOrderStatusBreakdown(selectedOrders);
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        const timeStr = today.getHours().toString().padStart(2, '0') + 
                       today.getMinutes().toString().padStart(2, '0');
        const filename = `로젠택배_${type}_${dateStr}_${timeStr}.xls`;
        
        // 엑셀 정보 표시
        document.getElementById('excel-info').innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <strong>📊 주문 수량:</strong> ${selectedOrders.length}개<br>
                    <strong>📁 파일명:</strong> ${filename}<br>
                    <strong>📅 생성일시:</strong> ${new Date().toLocaleString('ko-KR')}
                </div>
                <div>
                    <strong>📈 상태별 분석:</strong><br>
                    ${statusBreakdown.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        // 미리보기 테이블 생성
        const tbody = document.getElementById('excel-preview-body');
        tbody.innerHTML = selectedOrders.map((order, index) => {
            const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
            const itemsText = items.map(item => `${item.name} ${item.quantity}개`).join(', ');
            
            // 배송메모 생성 (메모가 있을 때만)
            let deliveryMemo = '';
            if (order.memo && order.memo.trim()) {
                deliveryMemo = order.memo.trim();
            }
            
            const statusColor = this.getStatusColor(order.order_status);
            
            return `
                <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-25' : ''}">
                    <td class="px-2 py-2 text-sm font-medium text-blue-600 bg-blue-50">${order.id}</td>
                    <td class="px-2 py-2 text-sm font-medium">${order.customer_name}</td>
                    <td class="px-2 py-2 text-sm text-gray-400">-</td>
                    <td class="px-2 py-2 text-sm max-w-xs truncate" title="${order.customer_address}">${order.customer_address}</td>
                    <td class="px-2 py-2 text-sm">${order.customer_phone}</td>
                    <td class="px-2 py-2 text-sm">${order.customer_phone}</td>
                    <td class="px-2 py-2 text-sm text-center">1</td>
                    <td class="px-2 py-2 text-sm text-center text-orange-600 font-medium">3800</td>
                    <td class="px-2 py-2 text-sm text-center text-blue-600 font-medium">선불</td>
                    <td class="px-2 py-2 text-sm max-w-xs truncate" title="${itemsText}">${itemsText}</td>
                    <td class="px-2 py-2 text-sm text-gray-400">-</td>
                    <td class="px-2 py-2 text-sm max-w-xs truncate" title="${deliveryMemo}">${deliveryMemo || '-'}</td>
                </tr>
            `;
        }).join('');
        
        // 모달 표시
        document.getElementById('excel-preview-modal').classList.remove('hidden');
    }
    
    // 엑셀 미리보기 모달 닫기
    closeExcelPreviewModal() {
        document.getElementById('excel-preview-modal').classList.add('hidden');
        this.currentPreviewOrders = null;
        this.currentPreviewType = null;
    }
    
    // 엑셀 출력 확정
    async confirmExcelExport() {
        if (this.currentPreviewOrders && this.currentPreviewType) {
            await this.generateLogenExcel(this.currentPreviewOrders, this.currentPreviewType);
            this.closeExcelPreviewModal();
        }
    }

    // 주문 상태별 분석 (알림용)
    getOrderStatusBreakdown(orders) {
        const statusCount = {};
        orders.forEach(order => {
            statusCount[order.order_status] = (statusCount[order.order_status] || 0) + 1;
        });
        
        return Object.entries(statusCount)
            .map(([status, count]) => `${status}: ${count}개`)
            .join('\n');
    }

    // 상태 드롭다운 토글
    toggleStatusDropdown(orderId) {
        // 모든 드롭다운 닫기
        document.querySelectorAll('[id^="status-dropdown-"]').forEach(dropdown => {
            if (dropdown.id !== `status-dropdown-${orderId}`) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 선택된 드롭다운 토글
        const dropdown = document.getElementById(`status-dropdown-${orderId}`);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    // 인라인 상태 업데이트 (드롭다운에서) - FIXED 통합 버전
    async updateOrderStatusInline(orderId, newStatus) {
        console.log('🔄 상태 변경 시작:', orderId, '→', newStatus);
        
        // 드롭다운 닫기
        const dropdown = document.getElementById(`status-dropdown-${orderId}`);
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        try {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                console.error('❌ 주문을 찾을 수 없습니다:', orderId);
                this.showToast('❌ 주문을 찾을 수 없습니다.');
                return;
            }
            
            const oldStatus = order.order_status || order.status;
            console.log('📋 이전 상태:', oldStatus, '→ 새 상태:', newStatus);
            
            // 주문 데이터 준비 (모든 필드명 동기화)
            const orderData = {
                ...order,
                status: newStatus,           // 내부 필드명
                order_status: newStatus,     // API 필드명
                updated_at: Date.now()
            };
            
            // API와 LocalStorage에 저장 시도
            let success = false;
            try {
                success = await this.saveOrderData(orderData, orderId);
            } catch (saveError) {
                console.warn('⚠️ saveOrderData 실패, 직접 저장 시도:', saveError);
                
                // 직접 API 호출 시도
                try {
                    const response = await fetch(this.getApiUrl(`farm_orders/${orderId}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(orderData)
                    });
                    success = response.ok;
                    console.log(success ? '✅ 직접 API 저장 성공' : '❌ 직접 API 저장 실패');
                } catch (apiError) {
                    console.warn('⚠️ 직접 API 호출도 실패:', apiError);
                }
            }
            
            // 메모리의 주문 데이터 강제 업데이트 (API 성공 여부와 관계없이)
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = newStatus;
                this.orders[orderIndex].order_status = newStatus;
                this.orders[orderIndex].updated_at = Date.now();
                console.log('💾 메모리 업데이트 완료:', orderIndex, newStatus);
            }
            
            // LocalStorage에 강제 저장
            await this.saveToStorage('orders', this.orders);
            console.log('💿 LocalStorage 저장 완료');
            
            // UI 즉시 새로고침
            this.renderOrdersTable();
            this.updateStatusCounts();
            this.loadShippingOrders();
            this.updateShippingStatistics();
            
            // 주문 상태 변경 시 SMS 발송
            if (oldStatus !== newStatus) {
                try {
                    await this.sendStatusChangeSms(orderId, newStatus);
                } catch (smsError) {
                    console.warn('⚠️ SMS 발송 실패:', smsError);
                }
            }
            
            // 배송완료 시 자동 고객 등급 업데이트
            if (newStatus === '배송완료') {
                const customer = this.customers.find(c => c.phone === order.customer_phone);
                if (customer) {
                    setTimeout(async () => {
                        await this.autoUpdateCustomerGrade(customer.id, true);
                    }, 1000);
                }
            }
            
            // 성공 토스트
            const statusEmoji = {
                '주문접수': '📝', '입금확인': '💰', '배송준비': '📦',
                '배송시작': '🚚', '배송완료': '✅', '주문취소': '❌',
                '환불처리': '🔄'
            };
            
            this.showToast(`${statusEmoji[newStatus] || '📋'} ${newStatus}로 변경됨`);
            console.log('✅ 상태 변경 완료:', oldStatus, '→', newStatus);
            
        } catch (error) {
            console.error('❌ 주문 상태 업데이트 오류:', error);
            this.showToast('❌ 상태 변경에 실패했습니다.');
        }
    }

    // 간단한 토스트 알림 (타입 지원)
    showToast(message, type = 'success') {
        // 기존 토스트 제거
        const existingToast = document.getElementById('status-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 타입별 스타일 설정
        const typeStyles = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };
        
        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.id = 'status-toast';
        toast.className = `fixed top-4 right-4 ${typeStyles[type] || typeStyles.success} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // 개별 주문 상태 업데이트 (기존 메서드 - 배송관리용)
    async updateOrderStatus(orderId, status) {
        try {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) return;

            const updateData = { ...order, order_status: status };
            
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                const response = await fetch(this.getApiUrl(`farm_orders/${orderId}`), {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    apiSuccess = true;
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('API 상태 변경 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에서 직접 업데이트
            if (!apiSuccess) {
                const orderIndex = this.orders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].order_status = status;
                    await this.saveToStorage('orders', this.orders);
                    console.log('LocalStorage에서 주문 상태 변경됨:', status);
                }
            }

            await this.loadOrders();
            this.loadShippingOrders();
            this.updateShippingStatistics();
            // 성공 피드백은 조용히 처리 (너무 많은 알림 방지)
            
        } catch (error) {
            console.error('주문 상태 변경 오류:', error);
            alert('주문 상태 변경에 실패했습니다.');
        }
    }

    // 주문 모달 열기
    openOrderModal(orderId = null) {
        this.currentEditingOrder = orderId;
        const modal = document.getElementById('order-modal');
        const title = document.getElementById('modal-title');
        
        if (orderId) {
            title.textContent = '주문 수정';
        } else {
            title.textContent = '새 주문 등록';
        }

        this.renderOrderForm(orderId);
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        // 모바일 터치 이벤트 방지
        document.body.style.overflow = 'hidden';
    }

    // 주문 폼 렌더링
    renderOrderForm(orderId = null) {
        const form = document.getElementById('order-form');
        const order = orderId ? this.orders.find(o => o.id === orderId) : null;
        
        const orderNumber = order ? order.order_number : this.generateOrderNumber();
        const orderDate = order ? order.order_date.split('T')[0] : new Date().toISOString().split('T')[0];

        form.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 좌측 컬럼 -->
                <div class="space-y-3">
                    <!-- 핵심 정보 2단 배치 -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">주문번호</label>
                            <input type="text" id="order-number" value="${orderNumber}" 
                                   class="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50" readonly>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">주문일자</label>
                            <input type="date" id="order-date" value="${orderDate}" 
                                   class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">고객명</label>
                            <div class="relative">
                                <input type="text" id="customer-name" value="${order ? order.customer_name : ''}" 
                                       placeholder="고객명 입력"
                                       class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                       autocomplete="off">
                                <div id="customer-suggestions" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 max-h-32 overflow-y-auto hidden">
                                    <!-- 자동완성 목록이 여기에 표시됩니다 -->
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                            <input type="tel" id="customer-phone" value="${order ? order.customer_phone : ''}" 
                                   placeholder="전화번호 입력"
                                   class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">배송주소</label>
                        <input type="text" id="customer-address" value="${order ? order.customer_address : ''}" 
                               placeholder="배송주소 입력"
                               class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">주문상태</label>
                            <select id="order-status" class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                ${this.generateOrderStatusOptions(order ? order.order_status : null)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">운송장번호</label>
                            <input type="text" id="tracking-number" value="${order ? order.tracking_number || '' : ''}" 
                                   placeholder="로젠택배 번호"
                                   class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">주문 출처 <span class="text-red-500">*</span></label>
                        <select id="order-source" required class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="">출처를 선택하세요</option>
                            <!-- 주문 출처 옵션들이 동적으로 추가됩니다 -->
                        </select>
                        <p class="text-xs text-gray-500 mt-1">💡 고객이 어디서 주문했는지 선택해주세요</p>
                    </div>
                </div>

                <!-- 우측 컬럼 - 상품 목록 -->
                <div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">주문상품</label>
                        <div class="relative mb-2">
                            <input type="text" id="product-search" placeholder="상품명 검색 또는 직접 입력" 
                                   class="w-full p-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                   autocomplete="off">
                            <button type="button" onclick="orderSystem.addOrderItem()" 
                                    class="absolute right-1 top-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                                <i class="fas fa-plus"></i>
                            </button>
                            <div id="product-suggestions" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 max-h-32 overflow-y-auto hidden">
                                <!-- 상품 자동완성 목록이 여기에 표시됩니다 -->
                            </div>
                        </div>
                        <button type="button" onclick="orderSystem.showProductList()" 
                                class="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            <i class="fas fa-list mr-1"></i>상품 목록에서 선택
                        </button>
                    </div>

                    <!-- 주문 상품 목록 -->
                    <div class="mb-3">
                        <span class="text-sm font-medium text-gray-700">주문 상품 목록</span>
                        <div id="order-items" class="space-y-1 max-h-48 overflow-y-auto mt-1">
                            <!-- 주문 아이템들이 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <div class="border-t pt-3">
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">할인 금액</label>
                            <div class="relative">
                                <input type="number" id="discount-amount" value="0" min="0" 
                                       onchange="orderSystem.updateTotalAmount()"
                                       class="w-full p-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <span class="absolute right-2 top-2 text-gray-500 text-sm">원</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">💡 할인이 있는 경우 금액을 입력하세요</p>
                        </div>
                        
                        <div class="mb-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            💡 <strong>배송비 안내:</strong> 일반배송(5만원↑ 무료), 무료배송(항상 무료), 배송비포함(판매가 포함), 직접배송(농장 배송)
                        </div>
                        <div class="flex justify-between items-center text-base font-semibold">
                            <span>총 금액:</span>
                            <div id="total-amount" class="text-green-600">0원</div>
                        </div>
                    </div>

                    <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">메모</label>
                        <textarea id="order-memo" rows="2" placeholder="주문 관련 메모" 
                                  class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none">${order ? order.memo || '' : ''}</textarea>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onclick="orderSystem.closeOrderModal()" 
                        class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
                    취소
                </button>
                <button type="button" onclick="orderSystem.saveOrder()" 
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm">
                    ${orderId ? '수정' : '등록'}
                </button>
                <button type="button" onclick="orderSystem.saveOrderAsWaitlist()" 
                        class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-sm">
                    <i class="fas fa-clock mr-1"></i>대기자 등록
                </button>
            </div>
        `;

        // 기존 주문 수정 시 아이템 및 할인 로드
        if (order && order.order_items) {
            this.currentOrderItems = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
        } else {
            this.currentOrderItems = [];
        }
        
        // 할인 금액 설정
        setTimeout(() => {
            const discountElement = document.getElementById('discount-amount');
            if (discountElement && order && order.discount_amount) {
                discountElement.value = order.discount_amount;
            }
        }, 100);
        
        this.renderOrderItems();
        this.setupCustomerAutocomplete();
        
        // DOM이 완전히 렌더링된 후 이벤트 리스너 등록
        setTimeout(() => {
            console.log('🔧 setupProductAutocomplete 지연 호출');
            this.setupProductAutocomplete();
        }, 100);
        
        // 판매 채널 데이터를 다시 로드한 후 드롭다운 채우기
        this.loadChannels().then(() => {
            this.populateOrderSourceDropdown();
            
            // 주문 출처 드롭다운 채운 후에 기존 값 설정
            if (order && order.order_source) {
                const orderSourceElement = document.getElementById('order-source');
                if (orderSourceElement) {
                    orderSourceElement.value = order.order_source;
                    console.log('✅ 주문 출처 값 복원:', order.order_source);
                }
            }
        });
    }

    // 주문번호 자동 생성
    generateOrderNumber() {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        const timeStr = today.getHours().toString().padStart(2, '0') + 
                       today.getMinutes().toString().padStart(2, '0');
        return `KS${dateStr}${timeStr}`;
    }

    // 현재 주문 아이템들
    currentOrderItems = [];
    currentOrderTotal = 0;
    currentDiscountAmount = 0;

    // 주문 아이템 추가 (+ 버튼 또는 엔터키)
    addOrderItem() {
        console.log('🛒 addOrderItem 함수 호출됨');
        const productInput = document.getElementById('product-search');
        
        if (!productInput) {
            console.error('❌ product-search 엘리먼트를 찾을 수 없습니다!');
            return;
        }
        
        console.log('🔍 상품 입력 필드 상태:', {
            element: productInput,
            value: productInput.value,
            trimmedValue: productInput.value.trim(),
            type: typeof productInput.value,
            focus: document.activeElement === productInput
        });
        
        const productName = productInput.value.trim();
        console.log('📝 입력된 상품명:', `"${productName}"`);
        
        if (!productName) {
            console.log('⚠️ 상품명이 비어있음 - 알림 표시');
            alert('상품명을 입력해주세요.');
            return;
        }

        // 기존 상품인지 확인
        const existingProduct = this.products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        
        if (existingProduct) {
            // 기존 상품이 있으면 selectProduct 호출
            this.selectProduct(existingProduct.id);
        } else {
            // 신규 상품이면 createNewProduct 호출
            this.createNewProduct(productName);
        }
    }

    // 주문 아이템 목록 렌더링
    renderOrderItems() {
        const container = document.getElementById('order-items');
        
        if (this.currentOrderItems.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-leaf text-xl mb-1 opacity-50"></i>
                    <p class="text-sm">아직 주문 상품이 없습니다.</p>
                    <p class="text-xs">상품을 검색하거나 직접 입력해보세요! 🌱</p>
                </div>
            `;
        } else {
            container.innerHTML = this.currentOrderItems.map(item => `
                <div class="border border-gray-200 rounded p-2">
                    <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm truncate">${item.name}${item.size ? ` (${item.size})` : ''}</div>
                            <div class="flex items-center space-x-2 mt-1">
                                <div class="flex items-center space-x-1">
                                    <span class="text-xs text-gray-600">수량</span>
                                    <input type="number" value="${item.quantity}" min="1" 
                                           onchange="orderSystem.updateItemQuantity(${item.id}, this.value)"
                                           class="w-12 p-1 border border-gray-300 rounded text-center text-xs">
                                </div>
                                <div class="flex items-center space-x-1">
                                    <span class="text-xs text-gray-600">단가</span>
                                    <input type="number" value="${item.price}" min="0" 
                                           onchange="orderSystem.updateItemPrice(${item.id}, this.value)"
                                           class="w-16 p-1 border border-gray-300 rounded text-xs">
                                    <span class="text-xs text-gray-600">원</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right ml-2">
                            <div class="font-medium text-green-600 text-sm">${new Intl.NumberFormat('ko-KR').format(item.total)}원</div>
                            <button onclick="orderSystem.removeOrderItem(${item.id})" 
                                    class="text-red-500 hover:text-red-700 text-xs mt-1">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        this.updateTotalAmount();
    }

    // 아이템 수량 업데이트
    updateItemQuantity(itemId, quantity) {
        const item = this.currentOrderItems.find(i => i.id === itemId);
        if (item) {
            item.quantity = parseInt(quantity) || 1;
            item.total = item.price * item.quantity;
            this.renderOrderItems();
        }
    }

    // 아이템 판매가 업데이트
    updateItemPrice(itemId, price) {
        const item = this.currentOrderItems.find(i => i.id === itemId);
        if (item) {
            item.price = parseFloat(price) || 0;
            item.total = item.price * item.quantity;
            this.renderOrderItems();
        }
    }

    // 아이템 제거
    removeOrderItem(itemId) {
        this.currentOrderItems = this.currentOrderItems.filter(i => i.id !== itemId);
        this.renderOrderItems();
    }

    // 총 금액 업데이트 (배송비, 할인 포함)
    updateTotalAmount() {
        const itemsTotal = this.currentOrderItems.reduce((sum, item) => sum + item.total, 0);
        const discountElement = document.getElementById('discount-amount');
        const discountAmount = discountElement ? parseInt(discountElement.value) || 0 : 0;
        const discountedTotal = Math.max(0, itemsTotal - discountAmount);
        const shippingFee = this.calculateShippingFee(this.currentOrderItems, discountedTotal);
        const finalTotal = discountedTotal + shippingFee;
        
        // 총액 표시 업데이트
        const totalElement = document.getElementById('total-amount');
        if (itemsTotal === 0) {
            totalElement.innerHTML = '0원';
        } else {
            let html = `<div class="text-right">`;
            html += `<div class="text-sm text-gray-600">상품금액: ${new Intl.NumberFormat('ko-KR').format(itemsTotal)}원</div>`;
            
            if (discountAmount > 0) {
                html += `<div class="text-sm text-red-600">할인: -${new Intl.NumberFormat('ko-KR').format(discountAmount)}원</div>`;
            }
            
            if (shippingFee > 0) {
                html += `<div class="text-sm text-orange-600">배송비: ${new Intl.NumberFormat('ko-KR').format(shippingFee)}원</div>`;
            } else {
                html += `<div class="text-sm text-green-600">배송비: 무료 🎉</div>`;
            }
            
            html += `<div class="font-bold text-green-600 border-t pt-1 mt-1">총 금액: ${new Intl.NumberFormat('ko-KR').format(finalTotal)}원</div>`;
            html += `</div>`;
            
            totalElement.innerHTML = html;
        }
        
        // 실제 저장될 총액 및 할인 정보 업데이트
        this.currentOrderTotal = finalTotal;
        this.currentDiscountAmount = discountAmount;
    }

    // 배송비 계산 (환경설정에서 설정한 값 사용)
    calculateShippingFee(items, itemsTotal) {
        // 배송비포함 상품이 하나라도 있으면 배송비 0원
        const hasIncludedShipping = items.some(item => item.shipping_option === 'included');
        if (hasIncludedShipping) {
            return 0;
        }

        // 무료배송(행사) 상품이 하나라도 있으면 배송비 0원
        const hasAlwaysFree = items.some(item => item.shipping_option === 'always_free');
        if (hasAlwaysFree) {
            return 0;
        }

        // 직접배송 상품만 있는 경우 배송비 0원
        const hasOnlyDirect = items.length > 0 && items.every(item => item.shipping_option === 'direct');
        if (hasOnlyDirect) {
            return 0;
        }

        // 환경설정에서 배송비 설정 로드
        const defaultShippingFee = parseInt(localStorage.getItem('default-shipping-fee') || '4000');
        const freeShippingThreshold = parseInt(localStorage.getItem('free-shipping-threshold') || '50000');
        const remoteShippingFee = parseInt(localStorage.getItem('remote-shipping-fee') || '6000');

        // 일반배송 상품들의 경우 설정된 기준으로 계산
        const hasNormalShipping = items.some(item => item.shipping_option === 'normal' || !item.shipping_option);
        if (hasNormalShipping) {
            return itemsTotal >= freeShippingThreshold ? 0 : defaultShippingFee;
        }

        // 기본값 (환경설정 값 사용)
        return itemsTotal >= freeShippingThreshold ? 0 : defaultShippingFee;
    }

    // 주문을 대기자로 저장
    // 주문 폼 데이터 수집 함수
    collectOrderFormData() {
        const itemsTotal = this.currentOrderItems.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = parseInt(document.getElementById('discount-amount').value) || 0;
        const discountedTotal = Math.max(0, itemsTotal - discountAmount);
        const shippingFee = this.calculateShippingFee(this.currentOrderItems, discountedTotal);
        
        const orderData = {
            order_number: document.getElementById('order-number').value,
            order_date: new Date(document.getElementById('order-date').value).toISOString(),
            customer_name: document.getElementById('customer-name').value,
            customer_phone: document.getElementById('customer-phone').value,
            customer_address: document.getElementById('customer-address').value,
            order_items: JSON.stringify(this.currentOrderItems),
            total_amount: this.currentOrderTotal,
            order_status: document.getElementById('order-status').value,
            tracking_number: document.getElementById('tracking-number').value || '',
            memo: document.getElementById('order-memo').value,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            order_source: document.getElementById('order-source').value
        };

        // 필수 필드 검증
        if (!orderData.customer_name.trim()) {
            alert('고객명을 입력해주세요.');
            return null;
        }

        if (!orderData.customer_phone.trim()) {
            alert('전화번호를 입력해주세요.');
            return null;
        }

        if (this.currentOrderItems.length === 0) {
            alert('주문 상품을 추가해주세요.');
            return null;
        }

        if (!orderData.order_source.trim()) {
            alert('주문 출처를 선택해주세요.');
            return null;
        }

        return orderData;
    }

    async saveOrderAsWaitlist() {
        console.log('🔄 주문을 대기자로 저장 시작...');
        
        // 주문 폼 데이터 수집
        const orderData = this.collectOrderFormData();
        if (!orderData) {
            return; // 유효성 검사 실패
        }
        
        // 대기자 데이터로 변환
        const waitlistData = {
            customer_name: orderData.customerName,
            customer_phone: orderData.customerPhone,
            product_name: orderData.orderItems.map(item => item.name).join(', '),
            product_category: orderData.orderItems[0]?.category || '기타',
            expected_price: orderData.totalAmount,
            register_date: new Date().toISOString(),
            status: '대기중',
            memo: `주문에서 대기자로 전환: ${orderData.memo || ''}`,
            priority: 3,
            created_at: new Date().toISOString()
        };
        
        try {
            // 대기자 데이터 저장
            await this.saveWaitlist(waitlistData);
            
            // 주문 모달 닫기
            this.closeOrderModal();
            
            // 대기자 관리 탭으로 이동
            this.switchTab('tab-waitlist');
            await this.loadWaitlist();
            
            // 성공 알림
            alert(`✅ 대기자 등록 완료!\n\n고객: ${waitlistData.customer_name}\n상품: ${waitlistData.product_name}\n예상금액: ${waitlistData.expected_price.toLocaleString()}원`);
            
        } catch (error) {
            console.error('❌ 대기자 등록 실패:', error);
            alert('❌ 대기자 등록에 실패했습니다. 다시 시도해주세요.');
        }
    }

    // 주문 저장
    async saveOrder() {
        const itemsTotal = this.currentOrderItems.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = parseInt(document.getElementById('discount-amount').value) || 0;
        const discountedTotal = Math.max(0, itemsTotal - discountAmount);
        const shippingFee = this.calculateShippingFee(this.currentOrderItems, discountedTotal);
        
        const orderData = {
            order_number: document.getElementById('order-number').value,
            order_date: new Date(document.getElementById('order-date').value).toISOString(),
            customer_name: document.getElementById('customer-name').value,
            customer_phone: document.getElementById('customer-phone').value,
            customer_address: document.getElementById('customer-address').value,
            order_items: JSON.stringify(this.currentOrderItems),
            total_amount: this.currentOrderTotal,
            order_status: document.getElementById('order-status').value,
            tracking_number: document.getElementById('tracking-number').value || '',
            memo: document.getElementById('order-memo').value,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            order_source: document.getElementById('order-source').value
        };

        // 필수 필드 검증
        if (!orderData.customer_name.trim()) {
            alert('고객명을 입력해주세요.');
            return;
        }

        if (!orderData.customer_phone.trim()) {
            alert('전화번호를 입력해주세요.');
            return;
        }

        if (this.currentOrderItems.length === 0) {
            alert('주문 상품을 추가해주세요.');
            return;
        }

        if (!orderData.order_source.trim()) {
            alert('주문 출처를 선택해주세요.');
            return;
        }

        try {
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                let response;
                
                if (this.currentEditingOrder) {
                    // 주문 수정
                    response = await fetch(this.getApiUrl(`farm_orders/${this.currentEditingOrder}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(orderData)
                    });
                } else {
                    // 새 주문 등록
                    response = await fetch(this.getApiUrl('farm_orders'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(orderData)
                    });
                }

                if (response.ok) {
                    apiSuccess = true;
                    console.log('API로 주문 저장 성공');
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('API 저장 실패, LocalStorage 사용:', apiError);
            }
            
            // LocalStorage에 항상 저장 (이중 안전망)
            if (this.currentEditingOrder) {
                // 주문 수정
                const orderIndex = this.orders.findIndex(o => o.id === this.currentEditingOrder);
                if (orderIndex !== -1) {
                    this.orders[orderIndex] = { ...orderData, id: this.currentEditingOrder };
                }
            } else {
                // 새 주문 등록
                orderData.id = Date.now().toString();
                orderData.created_at = new Date().toISOString();
                this.orders.push(orderData);
            }
            
            // 항상 LocalStorage에 저장 (API 성공/실패 관계없이)
            await this.saveToStorage('orders', this.orders);
            console.log('✅ LocalStorage에 주문 저장됨 (이중 안전망)');
            
            if (!apiSuccess) {
                console.log('⚠️ API 저장 실패했지만 LocalStorage에는 안전하게 저장됨');
            }

            alert(this.currentEditingOrder ? '주문이 수정되었습니다.' : '주문이 등록되었습니다.');
            this.closeOrderModal();
            await this.loadOrders();
            
            // 고객 정보가 새로운 경우 고객 DB에도 추가
            await this.saveCustomerIfNew(orderData);
            
        } catch (error) {
            console.error('주문 저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    }

    // 새로운 고객인 경우 고객 DB에 추가
    async saveCustomerIfNew(orderData) {
        // 전화번호와 고객명 둘 다 확인
        const existingCustomer = this.customers.find(c => 
            c.phone === orderData.customer_phone || c.name === orderData.customer_name
        );
        
        if (!existingCustomer) {
            // API 먼저 시도
            let apiSuccess = false;
            try {
                const newCustomer = await fetch(this.getApiUrl('farm_customers'), {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: orderData.customer_name,
                        phone: orderData.customer_phone,
                        address: orderData.customer_address,
                        email: '',
                        memo: '주문을 통해 자동 등록'
                    })
                });
                
                if (newCustomer.ok) {
                    apiSuccess = true;
                    console.log(`신규 고객 "${orderData.customer_name}" API로 자동 등록 완료! 🌱`);
                }
            } catch (apiError) {
                console.warn('API 고객 등록 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에 저장
            if (!apiSuccess) {
                const newCustomerData = {
                    id: Date.now().toString(),
                    name: orderData.customer_name,
                    phone: orderData.customer_phone,
                    address: orderData.customer_address,
                    email: '',
                    memo: '주문을 통해 자동 등록'
                };
                this.customers.push(newCustomerData);
                await this.saveToStorage('farm_customers', this.customers);
                console.log(`신규 고객 "${orderData.customer_name}" LocalStorage로 자동 등록 완료! 🌱`);
            }
            
            await this.loadCustomers();
        } else {
            // 기존 고객 정보 업데이트 (주소가 비어있으면 업데이트)
            if (existingCustomer.address !== orderData.customer_address && orderData.customer_address.trim()) {
                try {
                    await fetch(this.getApiUrl(`farm_customers/${existingCustomer.id}`), {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            address: orderData.customer_address
                        })
                    });
                    console.log(`기존 고객 "${orderData.customer_name}" 주소 정보 업데이트 완료! 📍`);
                    await this.loadCustomers();
                } catch (error) {
                    console.log('고객 주소 업데이트 실패:', error);
                }
            }
        }
    }

    // 고객 자동완성 설정
    setupCustomerAutocomplete() {
        console.log('🔧 고객 자동완성 설정 시작...');
        const customerNameInput = document.getElementById('customer-name');
        const suggestionsList = document.getElementById('customer-suggestions');
        
        console.log('🔍 DOM 요소 확인:', {
            customerNameInput: !!customerNameInput,
            suggestionsList: !!suggestionsList,
            customersCount: this.customers ? this.customers.length : 0
        });
        
        if (!customerNameInput) {
            console.warn('⚠️ customer-name 요소를 찾을 수 없습니다.');
            return;
        }
        
        if (!suggestionsList) {
            console.warn('⚠️ customer-suggestions 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 고객 데이터가 없으면 로드 시도
        if (!this.customers || this.customers.length === 0) {
            console.log('📥 고객 데이터가 없어서 로드 시도...');
            this.loadCustomers().then(() => {
                console.log('✅ 고객 데이터 로드 완료, 자동완성 재설정');
                this.setupCustomerAutocomplete();
            });
            return;
        }
        
        let debounceTimer;

        // 입력 이벤트 리스너
        customerNameInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.showCustomerSuggestions(e.target.value);
            }, 300);
        });

        // 포커스 아웃 시 목록 숨기기 (약간의 지연 추가)
        customerNameInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsList.classList.add('hidden');
            }, 200);
        });

        // 포커스 시 다시 검색
        customerNameInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                this.showCustomerSuggestions(e.target.value);
            }
        });

        // 주문 폼의 다른 필드들에 포커스가 이동할 때 자동완성 팝업 숨기기
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('click', (e) => {
                // 고객명 입력 필드가 아닌 다른 요소를 클릭했을 때
                if (!e.target.closest('#customer-name') && !e.target.closest('#customer-suggestions')) {
                    suggestionsList.classList.add('hidden');
                }
            });
        }

        // 전화번호 필드에 포커스가 이동할 때 자동완성 팝업 숨기기
        const customerPhoneInput = document.getElementById('customer-phone');
        if (customerPhoneInput) {
            customerPhoneInput.addEventListener('focus', () => {
                suggestionsList.classList.add('hidden');
            });
        }

        // 주문상태 필드에 포커스가 이동할 때 자동완성 팝업 숨기기
        const orderStatusSelect = document.getElementById('order-status');
        if (orderStatusSelect) {
            orderStatusSelect.addEventListener('focus', () => {
                suggestionsList.classList.add('hidden');
            });
        }
    }

    // 고객 자동완성 목록 표시
    showCustomerSuggestions(query) {
        console.log('🔍 고객 자동완성 검색:', query);
        const suggestionsList = document.getElementById('customer-suggestions');
        
        if (!suggestionsList) {
            console.error('❌ customer-suggestions 요소를 찾을 수 없습니다!');
            return;
        }
        
        if (!query.trim()) {
            suggestionsList.classList.add('hidden');
            return;
        }

        // 고객 데이터가 없으면 로드 시도
        if (!this.customers || this.customers.length === 0) {
            console.log('📥 고객 데이터가 없어서 로드 시도...');
            this.loadCustomers().then(() => {
                console.log('✅ 고객 데이터 로드 완료, 자동완성 재실행');
                this.showCustomerSuggestions(query);
            });
            return;
        }

        // 고객명으로 검색
        const matchedCustomers = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase())
        );

        console.log('🔍 검색 결과:', {
            query: query,
            totalCustomers: this.customers.length,
            matchedCustomers: matchedCustomers.length,
            customerNames: this.customers.map(c => c.name)
        });

        if (matchedCustomers.length === 0) {
            console.log('🆕 신규 고객 등록 옵션 표시');
            suggestionsList.innerHTML = `
                <div class="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 new-customer-option"
                     data-customer-name="${query.replace(/"/g, '&quot;')}"
                     title="클릭하면 신규 고객으로 등록됩니다">
                    <div class="flex items-center text-green-600">
                        <i class="fas fa-user-plus mr-2"></i>
                        <span class="font-medium">"${query}" - 신규 고객 등록</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-1">클릭하여 새 고객으로 등록</div>
                </div>
            `;
            
            // 클릭 이벤트 리스너 추가
            const newCustomerOption = suggestionsList.querySelector('.new-customer-option');
            if (newCustomerOption) {
                newCustomerOption.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ 신규 고객 등록 클릭됨:', query);
                    this.createNewCustomer(query);
                });
                console.log('✅ 신규 고객 등록 클릭 이벤트 리스너 등록됨');
            } else {
                console.error('❌ 신규 고객 등록 옵션 요소를 찾을 수 없습니다');
            }
            
            suggestionsList.classList.remove('hidden');
            return;
        }

        // 매칭된 고객 목록 표시
        suggestionsList.innerHTML = matchedCustomers.map(customer => `
            <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 customer-suggestion"
                 data-customer-id="${customer.id}"
                 onclick="orderSystem.selectCustomer('${customer.id}')"
                 title="클릭하여 고객 정보 자동 입력">
                <div class="flex items-center">
                    <i class="fas fa-user text-blue-500 mr-2"></i>
                    <div>
                        <div class="font-medium text-gray-900">${customer.name}</div>
                        <div class="text-sm text-gray-600">${customer.phone}</div>
                        <div class="text-sm text-gray-500">${customer.address || '주소 미등록'}</div>
                    </div>
                </div>
            </div>
        `).join('');

        suggestionsList.classList.remove('hidden');
    }

    // 고객 선택
    selectCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            // 고객 관리 화면에서 호출된 경우 Master-Detail 패턴 적용
            const currentSection = document.querySelector('.tab-content:not(.hidden)');
            if (currentSection && currentSection.id === 'customers-section') {
                this.selectCustomerForDetail(customerId);
                return;
            }
            
            // 주문 생성 화면에서의 기존 동작 유지
            const customerNameEl = document.getElementById('customer-name');
            const customerPhoneEl = document.getElementById('customer-phone');
            const customerAddressEl = document.getElementById('customer-address');
            
            if (customerNameEl) customerNameEl.value = customer.name;
            if (customerPhoneEl) customerPhoneEl.value = customer.phone || '';
            if (customerAddressEl) customerAddressEl.value = customer.address || '';
            
            // 자동완성 팝업 숨기기
            const suggestionsList = document.getElementById('customer-suggestions');
            if (suggestionsList) {
                suggestionsList.classList.add('hidden');
            }
            
            // 기존 고객 선택 알림
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-user-check mr-2"></i>
                    <span>"${customer.name}" 고객 정보 자동 입력됨</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // 2초 후 알림 제거
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 2000);
        }
    }

    // Master-Detail 패턴: 고객 선택 (고객 관리 화면)
    selectCustomerForDetail(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.selectedCustomerId = customerId;
            this.selectedCustomer = customer;
            
            // 고객 목록 UI 업데이트 (선택 상태 표시)
            this.renderCustomersTable();
            
            // 상세 정보 표시
            this.renderCustomerDetail(customer);
        }
    }



    // 고객 상세 정보 렌더링
    renderCustomerDetail(customer) {
        const emptyState = document.getElementById('customer-detail-empty');
        const detailContent = document.getElementById('customer-detail-content');
        const detailInfo = document.getElementById('customer-detail-info');
        const detailInfoEmpty = document.getElementById('customer-detail-info-empty');
        
        if (!customer) {
            // 빈 상태 표시
            emptyState.classList.remove('hidden');
            detailContent.classList.add('hidden');
            detailInfo.classList.add('hidden');
            detailInfoEmpty.classList.remove('hidden');
            return;
        }
        
        // 선택된 고객 정보 표시
        emptyState.classList.add('hidden');
        detailContent.classList.remove('hidden');
        detailInfo.classList.remove('hidden');
        detailInfoEmpty.classList.add('hidden');
        
        // 1. 최상단: 고객 식별 정보 업데이트
        document.getElementById('customer-detail-name').textContent = customer.name;
        document.getElementById('customer-detail-grade').textContent = this.getGradeDisplayName(customer.grade || 'GENERAL');
        document.getElementById('customer-detail-grade').className = `inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${this.getGradeColorClass(customer.grade || 'GENERAL')}`;
        
        // 고객 등급에 따른 아이콘 변경
        const iconElement = document.getElementById('customer-detail-icon');
        if (customer.grade === 'BLACK_DIAMOND') {
            iconElement.className = 'text-3xl';
            iconElement.textContent = '💎';
        } else if (customer.grade === 'PURPLE_EMPEROR') {
            iconElement.className = 'text-3xl';
            iconElement.textContent = '🟣';
        } else if (customer.grade === 'RED_RUBY') {
            iconElement.className = 'text-3xl';
            iconElement.textContent = '🔴';
        } else if (customer.grade === 'GREEN_LEAF') {
            iconElement.className = 'text-3xl';
            iconElement.textContent = '🟢';
        } else {
            iconElement.className = 'text-3xl';
            iconElement.textContent = '🙋‍♂️';
        }
        
        // 3. 세 번째: 기본 연락 정보 업데이트
        document.getElementById('detail-phone').textContent = customer.phone || '전화번호 미등록';
        document.getElementById('detail-email').textContent = customer.email || '이메일 미등록';
        document.getElementById('detail-address').textContent = customer.address || '주소 미등록';
        document.getElementById('detail-memo').textContent = customer.memo || '메모 없음';
        
        const registrationDate = customer.registration_date || customer.created_at;
        let displayDate = '등록일 미기록';
        if (registrationDate) {
            const date = new Date(registrationDate);
            if (!isNaN(date.getTime())) {
                displayDate = date.toLocaleDateString('ko-KR');
            }
        }
        document.getElementById('detail-registration-date').textContent = displayDate;
        
        // 주문 통계 계산 및 표시
        this.updateCustomerOrderStats(customer.id);
        
        // 주문 내역 표시
        this.renderCustomerOrderHistory(customer.id);
    }

    // 고객 주문 통계 업데이트
    updateCustomerOrderStats(customerId) {
        const customerOrders = this.orders.filter(order => order.customer_id === customerId);
        const totalOrders = customerOrders.length;
        const totalAmount = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const avgAmount = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;
        
        document.getElementById('detail-total-orders').textContent = totalOrders;
        document.getElementById('detail-total-amount').textContent = totalAmount.toLocaleString() + '원';
        document.getElementById('detail-avg-amount').textContent = avgAmount.toLocaleString() + '원';
    }

    // 고객 주문 내역 렌더링
    renderCustomerOrderHistory(customerId) {
        const container = document.getElementById('customer-orders-list');
        const countElement = document.getElementById('detail-orders-count');
        
        const customerOrders = this.orders
            .filter(order => order.customer_id === customerId)
            .sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date));
        
        countElement.textContent = `총 ${customerOrders.length}건`;
        
        if (customerOrders.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <i class="fas fa-shopping-cart text-3xl mb-3 text-gray-300"></i>
                    <p class="font-medium">주문 내역이 없습니다</p>
                    <p class="text-sm mt-1">첫 주문을 기다리고 있어요! 🌱</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문번호</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문일</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문처</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${customerOrders.map(order => {
                        const orderDate = new Date(order.created_at || order.order_date);
                        const displayDate = orderDate.toLocaleDateString('ko-KR');
                        
                        const statusColor = this.getOrderStatusColor(order.status);
                        const statusIcon = this.getOrderStatusIcon(order.status);
                        
                        const productSummary = order.items && order.items.length > 0 
                            ? `${order.items[0].product_name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}종` : ''}`
                            : '상품 정보 없음';
                        
                        return `
                            <tr class="hover:bg-gray-50 cursor-pointer" onclick="orderSystem.viewOrderDetail('${order.id}')">
                                <td class="px-3 py-2">
                                    <div class="font-medium text-gray-900">#${order.order_number || order.id.substring(0, 8)}</div>
                                    ${order.memo ? `<div class="text-xs text-gray-500 mt-1">${order.memo}</div>` : ''}
                                </td>
                                <td class="px-4 py-3 text-gray-700">${displayDate}</td>
                                <td class="px-3 py-2">
                                    <div class="text-gray-900">${productSummary}</div>
                                </td>
                                <td class="px-4 py-3 text-right font-medium text-gray-900">
                                    ${(order.total_amount || 0).toLocaleString()}원
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                                        <i class="${statusIcon} mr-1"></i>${order.status}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-gray-700">${order.source || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // 주문 상세 정보 보기
    viewOrderDetail(orderId) {
        // 간단한 알림으로 처리 (추후 상세 모달로 확장 가능)
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`주문 상세 정보\n\n주문 ID: ${orderId}\n상태: ${order.status}\n금액: ${(order.total_amount || 0).toLocaleString()}원`);
        }
    }

    // 등급 표시명 반환 (경산다육농장 새로운 등급 체계)
    getGradeDisplayName(grade) {
        const gradeNames = {
            'BLACK_DIAMOND': '💎 블랙 다이아몬드',
            'PURPLE_EMPEROR': '🟣 퍼플 엠페러',
            'RED_RUBY': '🔴 레드 루비',
            'GREEN_LEAF': '🟢 그린 리프',
            'GENERAL': '🙋‍♂️ 일반'
        };
        return gradeNames[grade] || '🙋‍♂️ 일반';
    }

    // 등급 색상 클래스 반환 (경산다육농장 새로운 등급 체계)
    getGradeColorClass(grade) {
        const colorClasses = {
            'BLACK_DIAMOND': 'bg-gray-900 text-white',
            'PURPLE_EMPEROR': 'bg-purple-100 text-purple-800',
            'RED_RUBY': 'bg-red-100 text-red-800',
            'GREEN_LEAF': 'bg-green-100 text-green-800',
            'GENERAL': 'bg-blue-100 text-blue-800'
        };
        return colorClasses[grade] || 'bg-blue-100 text-blue-800';
    }

    // 주문 상태별 색상 반환
    getOrderStatusColor(status) {
        const colors = {
            '입금확인': 'bg-green-100 text-green-800',
            '배송준비': 'bg-yellow-100 text-yellow-800',
            '배송중': 'bg-blue-100 text-blue-800',
            '배송완료': 'bg-purple-100 text-purple-800',
            '취소': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // 주문 상태별 아이콘 반환
    getOrderStatusIcon(status) {
        const icons = {
            '입금확인': 'fas fa-credit-card',
            '배송준비': 'fas fa-box',
            '배송중': 'fas fa-truck',
            '배송완료': 'fas fa-check-circle',
            '취소': 'fas fa-times-circle'
        };
        return icons[status] || 'fas fa-question-circle';
    }

    // 주문 등록 화면으로 돌아가기 (고객 등록 후)
    returnToOrderForm(customerData) {
        // 주문 등록 탭으로 이동
        this.switchTab('orders');
        
        // 주문 등록 모달 열기
        this.openOrderModal();
        
        // 고객 정보 자동 입력
        setTimeout(() => {
            const customerNameInput = document.getElementById('customer-name');
            const customerPhoneInput = document.getElementById('customer-phone');
            const customerAddressInput = document.getElementById('customer-address');
            
            if (customerNameInput) customerNameInput.value = customerData.name;
            if (customerPhoneInput) customerPhoneInput.value = customerData.phone;
            if (customerAddressInput) customerAddressInput.value = customerData.address;
            
            // 전화번호 필드로 포커스 이동
            if (customerPhoneInput) customerPhoneInput.focus();
        }, 100);
        
        // 사용자에게 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>"${customerData.name}" 고객이 등록되었습니다</span>
            </div>
            <div class="text-sm mt-1">주문 등록 화면으로 돌아왔습니다</div>
        `;
        
        document.body.appendChild(notification);
        
        // 3초 후 알림 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // 대기자 등록 화면으로 돌아가기 (고객 등록 후)
    returnToWaitlistForm(customerData) {
        console.log('🔄 대기자 등록 화면으로 돌아가기:', customerData);
        
        // 대기자 관리 탭으로 이동
        this.switchTab('tab-waitlist');
        
        // 대기자 등록 모달 열기
        this.openWaitlistModal();
        
        // 고객 정보 자동 입력
        setTimeout(() => {
            const customerNameInput = document.getElementById('waitlist-form-name');
            const customerPhoneInput = document.getElementById('waitlist-form-phone');
            
            if (customerNameInput) customerNameInput.value = customerData.name;
            if (customerPhoneInput) customerPhoneInput.value = customerData.phone;
            
            console.log('✅ 대기자 폼에 고객 정보 자동 입력됨');
        }, 100);
    }

    // 신규 고객 생성 (자동완성에서)
    createNewCustomer(customerName) {
        console.log('🆕 신규 고객 생성 요청:', customerName);
        
        // 자동완성 목록 숨기기
        const suggestionsList = document.getElementById('customer-suggestions');
        if (suggestionsList) {
            suggestionsList.classList.add('hidden');
            console.log('✅ 자동완성 목록 숨김');
        } else {
            console.warn('⚠️ customer-suggestions 요소를 찾을 수 없습니다.');
        }
        
        // 고객관리 탭으로 이동
        console.log('🔄 고객관리 탭으로 이동 중...');
        this.switchTab('farm_customers');
        
        // 고객 등록 모달 열기
        console.log('🔄 고객 등록 모달 열기 중...');
        this.openCustomerModal();
        
        // 고객명 자동 입력
        setTimeout(() => {
            const customerNameInput = document.getElementById('customer-name');
            if (customerNameInput) {
                customerNameInput.value = customerName;
                console.log('✅ 고객명 자동 입력됨:', customerName);
            }
        }, 100);
    }

    // Supabase에 고객 데이터 직접 저장 (실시간 동기화용)
    async saveCustomerToSupabase(customerData) {
        try {
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (!supabase) {
                console.log('📴 Supabase 클라이언트 없음 - Supabase 저장 건너뜀');
                return;
            }

            console.log('📤 Supabase에 고객 저장 시도:', customerData.name);
            
            // ID를 문자열로 변환 (integer 범위 초과 방지)
            const supabaseData = {
                id: customerData.id.toString(),
                name: customerData.name,
                phone: customerData.phone || null,
                email: customerData.email || null,
                address: customerData.address || null,
                memo: customerData.memo || null,
                grade: customerData.grade || 'GENERAL',
                total_amount: customerData.totalAmount || 0,
                order_count: customerData.orderCount || 0,
                last_order_date: customerData.lastOrderDate || null,
                created_at: customerData.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('farm_customers')
                .upsert(supabaseData, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('❌ Supabase 고객 저장 실패:', error);
            } else {
                console.log('✅ Supabase 고객 저장 성공:', data);
            }
        } catch (error) {
            console.error('❌ Supabase 고객 저장 오류:', error);
        }
    }

    // 상품 자동완성 설정
    setupProductAutocomplete(retryCount = 0) {
        console.log('🔧 상품 자동완성 설정 시작 (시도:', retryCount + 1, ')');
        const productSearchInput = document.getElementById('product-search');
        const suggestionsList = document.getElementById('product-suggestions');
        
        if (!productSearchInput || !suggestionsList) {
            console.warn('⚠️ DOM 엘리먼트를 찾을 수 없음:', {
                productSearchInput: !!productSearchInput,
                suggestionsList: !!suggestionsList
            });
            
            // 최대 5번까지 재시도
            if (retryCount < 5) {
                setTimeout(() => {
                    this.setupProductAutocomplete(retryCount + 1);
                }, 200);
                return;
            } else {
                console.error('❌ 5번 시도했지만 엘리먼트를 찾을 수 없습니다!');
                return;
            }
        }
        
        console.log('✅ 상품 입력 필드 및 자동완성 리스트 찾음');
        let debounceTimer;

        // 테스트용 이벤트 - 모든 키보드 이벤트 감지
        productSearchInput.addEventListener('keydown', (e) => {
            console.log('⌨️ keydown:', e.key, 'value:', e.target.value);
        });
        
        productSearchInput.addEventListener('keyup', (e) => {
            console.log('⌨️ keyup:', e.key, 'value:', e.target.value);
        });

        // 입력 이벤트 리스너 (더 빠른 반응)
        productSearchInput.addEventListener('input', (e) => {
            console.log('⌨️ 상품명 입력됨:', e.target.value);
            clearTimeout(debounceTimer);
            
            // 한 글자부터 즉시 검색
            if (e.target.value.trim().length >= 1) {
                debounceTimer = setTimeout(() => {
                    this.showProductSuggestions(e.target.value);
                }, 150); // 더 빠르게 반응 (300ms → 150ms)
            } else {
                // 입력이 없으면 즉시 숨기기
                const suggestionsList = document.getElementById('product-suggestions');
                suggestionsList.classList.add('hidden');
            }
        });

        // 포커스 아웃 시 목록 숨기기 (약간의 지연 추가)
        productSearchInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsList.classList.add('hidden');
            }, 200);
        });

        // 포커스 시 다시 검색
        productSearchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                this.showProductSuggestions(e.target.value);
            }
        });

        // 엔터키로 바로 추가
        productSearchInput.addEventListener('keypress', (e) => {
            console.log('🔑 keypress 이벤트:', e.key, 'value:', e.target.value);
            if (e.key === 'Enter') {
                console.log('↩️ 엔터키 감지 - addOrderItem 호출');
                e.preventDefault(); // 폼 제출 방지
                e.stopPropagation(); // 이벤트 전파 방지
                this.addOrderItem();
            }
        });
        
        // 추가 엔터키 이벤트 (keydown에서도 감지)
        productSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('🔑 keydown Enter 감지:', e.target.value);
                e.preventDefault();
                e.stopPropagation();
                this.addOrderItem();
            }
        });
        
        console.log('✅ 모든 이벤트 리스너 등록 완료');
        
        // 이벤트 리스너 등록 테스트
        setTimeout(() => {
            console.log('🧪 이벤트 리스너 테스트 시작');
            productSearchInput.focus();
            
            // input 이벤트 발생시키기
            productSearchInput.value = 'test';
            const inputEvent = new Event('input', { bubbles: true });
            productSearchInput.dispatchEvent(inputEvent);
            
            console.log('🧪 테스트 완료 - 위에 입력 로그가 나타나야 함');
            
            // 원래 값으로 복구
            setTimeout(() => {
                productSearchInput.value = '';
            }, 1000);
        }, 500);
    }

    // 상품 자동완성 목록 표시
    showProductSuggestions(query) {
        console.log('🔍 상품 자동완성 검색:', query);
        const suggestionsList = document.getElementById('product-suggestions');
        
        if (!query.trim()) {
            suggestionsList.classList.add('hidden');
            return;
        }

        // 한 글자부터 검색 (대소문자 구분 없이)
        const matchedProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        // 정확히 일치하는 상품이 있는지 확인
        const exactMatch = this.products.find(product => 
            product.name.toLowerCase() === query.toLowerCase()
        );
        
        console.log('📦 검색된 상품:', matchedProducts.length, '개, 정확일치:', !!exactMatch);

        let suggestionsHTML = '';
        
        // 매칭된 상품들 표시 (최대 8개)
        if (matchedProducts.length > 0) {
            const topResults = matchedProducts.slice(0, 8);
            suggestionsHTML = topResults.map(product => `
                <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                     onclick="orderSystem.selectProduct('${product.id}')"
                     title="클릭하여 주문에 추가">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <i class="fas fa-leaf text-green-500 mr-2"></i>
                            <div>
                                <div class="font-medium text-gray-900">${product.name}${product.size ? ` (${product.size})` : ''}</div>
                                <div class="text-sm text-gray-600">${new Intl.NumberFormat('ko-KR').format(product.price)}원</div>
                                ${product.description ? `<div class="text-xs text-gray-500">${product.description.length > 30 ? product.description.substring(0, 30) + '...' : product.description}</div>` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">재고 ${product.stock}개</div>
                            <div class="text-xs ${product.stock <= 5 ? 'text-red-500' : 'text-green-500'}">${product.stock <= 0 ? '품절' : product.stock <= 5 ? '부족' : '충분'}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // 정확히 일치하지 않으면 신규 상품 추가 옵션도 표시
        if (!exactMatch) {
            console.log('✨ 신규 상품 추가 옵션 표시:', query);
            suggestionsHTML += `
                <div class="p-3 hover:bg-green-50 cursor-pointer border-t-2 border-green-200 bg-green-25"
                     onclick="orderSystem.createNewProduct('${query.replace(/'/g, '\\\'')}')" 
                     title="클릭하면 신규 상품으로 추가됩니다">
                    <div class="flex items-center text-green-600">
                        <i class="fas fa-plus-circle mr-2"></i>
                        <span class="font-medium">"${query}" - 신규 상품으로 추가</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-1">💡 판매가와 사이즈를 입력하여 주문에 추가</div>
                </div>
            `;
        }
        
        suggestionsList.innerHTML = suggestionsHTML;
        suggestionsList.classList.remove('hidden');

        // 위에서 이미 처리됨
    }

    // 상품 선택 (기존 상품)
    selectProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // 재고 확인
            if (product.stock <= 0) {
                if (!confirm(`"${product.name}"은 현재 품절 상태입니다.\n그래도 주문에 추가하시겠습니까?`)) {
                    return;
                }
            } else if (product.stock <= 5) {
                if (!confirm(`"${product.name}"의 재고가 ${product.stock}개 남았습니다.\n주문에 추가하시겠습니까?`)) {
                    return;
                }
            }

            const newItem = {
                id: Date.now(),
                name: product.name,
                size: product.size || '',
                shipping_option: product.shipping_option || 'normal',
                quantity: 1,
                price: product.price,
                total: product.price
            };

            this.currentOrderItems.push(newItem);
            this.renderOrderItems();
            
            // 입력 필드 초기화 및 자동완성 숨기기
            document.getElementById('product-search').value = '';
            document.getElementById('product-suggestions').classList.add('hidden');
            
            // 알림 표시
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check mr-2"></i>
                    <span>"${product.name}" 주문에 추가됨</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 2000);
        }
    }

    // 신규 상품 생성 (자동완성에서)
    createNewProduct(productName) {
        console.log('🆕 신규 상품 추가 모드 시작:', productName);
        
        // 주문 등록 상태 저장 (나중에 되돌아가기 위함)
        this.tempOrderContext = {
            fromOrderRegistration: true,
            productNameToAdd: productName
        };
        
        // 상품 등록 모달 열기 (신규 상품 추가 모드)
        this.openProductModal(null, productName);
        
        // 자동완성 목록 숨기기
        const suggestionsList = document.getElementById('product-suggestions');
        if (suggestionsList) {
            suggestionsList.classList.add('hidden');
        }
    }

    // 고객 검색 (기존 버튼 기능 - 제거 예정)
    searchCustomer() {
        // 간단한 검색 기능 - 실제로는 더 복잡한 UI가 필요할 수 있습니다
        const customerName = prompt('검색할 고객명을 입력하세요:');
        if (!customerName) return;

        const customer = this.customers.find(c => c.name.includes(customerName));
        if (customer) {
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-phone').value = customer.phone;
            document.getElementById('customer-address').value = customer.address || '';
        } else {
            alert('해당 고객을 찾을 수 없습니다.');
        }
    }

    // 주문 수정
    editOrder(orderId) {
        this.openOrderModal(orderId);
    }

    // 주문 삭제
    async deleteOrder(orderId) {
        if (!confirm('정말로 이 주문을 삭제하시겠습니까?')) {
            return;
        }

        try {
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                const response = await fetch(this.getApiUrl(`farm_orders/${orderId}`), {
                    method: 'DELETE'
                });

                if (response.ok) {
                    apiSuccess = true;
                    console.log('API로 주문 삭제 성공');
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('API 삭제 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에서 삭제
            if (!apiSuccess) {
                const orderIndex = this.orders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    this.orders.splice(orderIndex, 1);
                    await this.saveToStorage('orders', this.orders);
                    console.log('LocalStorage에서 주문 삭제됨');
                }
            }

            this.showToast('🗑️ 주문이 삭제되었습니다!', 'success');
            await this.loadOrders();
            
            // 배송관리 데이터도 새로고침
            this.loadShippingOrders();
            this.updateShippingStatistics();
            
        } catch (error) {
            console.error('주문 삭제 오류:', error);
            this.showToast('❌ 삭제 중 오류가 발생했습니다.', 'error');
        }
    }

    // SMS 모달 표시
    showSmsModal(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // 현재 주문 ID 저장
        this.currentSmsOrderId = orderId;
        
        const smsContent = this.generateSmsContent(order);
        document.getElementById('sms-content').value = smsContent;
        document.getElementById('sms-modal').classList.remove('hidden');
    }

    // SMS 모달에서 솔라피로 발송
    async sendSmsFromModal() {
        const orderId = this.currentSmsOrderId;
        const message = document.getElementById('sms-content').value.trim();
        
        if (!orderId || !message) {
            alert('SMS 내용을 입력해주세요.');
            return;
        }

        const order = this.orders.find(o => o.id === orderId);
        if (!order || !order.customer_phone) {
            alert('고객 전화번호가 없습니다.');
            return;
        }

        // 중복 발송 방지: 수동 SMS 발송에 대한 제한
        const manualSmsKey = `manual_sms_${orderId}`;
        const lastManualSmsTime = localStorage.getItem(manualSmsKey);
        const now = Date.now();
        
        // 1분 이내에 수동 SMS가 발송되었다면 중복 발송 방지
        if (lastManualSmsTime && (now - parseInt(lastManualSmsTime)) < 60000) { // 1분 = 60,000ms
            alert('⚠️ 1분 이내에 이미 SMS가 발송되었습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('📱 수동 SMS 발송:', orderId, order.customer_name);
        
        // 솔라피로 SMS 발송
        const result = await this.sendSmsViaSolapi(order.customer_phone, message, orderId);
        
        // 수동 SMS 발송 시간 기록
        if (result.success) {
            localStorage.setItem(manualSmsKey, now.toString());
            console.log('✅ 수동 SMS 발송 시간 기록:', new Date(now));
        }
        
        if (result.success) {
            // SMS 모달 닫기
            document.getElementById('sms-modal').classList.add('hidden');
            
            // 성공 알림
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>SMS가 성공적으로 발송되었습니다!</span>
                </div>
                <div class="text-sm mt-1">${order.customer_name}님께 전송됨</div>
            `;
            
            document.body.appendChild(notification);
            
            // 3초 후 알림 제거
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        } else {
            alert(`SMS 발송 실패: ${result.message}`);
        }
    }

    // SMS 내용 생성
    generateSmsContent(order) {
        const status = order.order_status;
        const customerName = order.customer_name;
        const orderNumber = order.order_number;
        const totalAmount = new Intl.NumberFormat('ko-KR').format(order.total_amount);
        
        // 배송비 계산 (신규 배송 옵션 반영)
        let itemsTotal = 0;
        let items = [];
        if (order.order_items) {
            items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
            itemsTotal = items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
        }
        const shippingFee = this.calculateShippingFee(items, itemsTotal);
        const shippingText = shippingFee > 0 ? `(배송비 ${new Intl.NumberFormat('ko-KR').format(shippingFee)}원 포함)` : '(무료배송)';

        let content = '';

        switch (status) {
            case '주문접수':
                // 주문 품목 목록 생성
                let itemsList = '';
                let itemsTotal = 0;
                if (order.order_items) {
                    const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                    itemsList = items.map(item => 
                        `${item.name} × ${item.quantity} = ${new Intl.NumberFormat('ko-KR').format(item.total)}원`
                    ).join('\n');
                    itemsTotal = items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
                }

                const discountAmount = order.discount_amount || 0;
                let discountLine = '';
                if (discountAmount > 0) {
                    discountLine = `▶ 할인: -${new Intl.NumberFormat('ko-KR').format(discountAmount)}원\n`;
                }

                content = `[경산다육] ${customerName}님, 주문 감사합니다.
▶ 주문내역
${itemsList}
▶ 상품 금액: ${new Intl.NumberFormat('ko-KR').format(itemsTotal)}원
${discountLine}${shippingFee > 0 ? `▶ 배송비: ${new Intl.NumberFormat('ko-KR').format(shippingFee)}원` : '▶ 배송비: 무료 🎉'}
━━━━━━━━━━━━
▶ 총 금액: ${totalAmount}원

농협 010-9745-6245-08
예금주: 경산식물원(배은희)

입금 확인 후 상품을 준비하겠습니다.

문의: 010-9745-6245`;
                break;

            case '입금확인':
                content = `[경산다육] ${customerName}님, 입금 확인되었습니다! ✅

소중한 다육이들을 정성껏 포장하여
빠른 시일 내에 배송해드리겠습니다.

문의: 010-9745-6245
감사합니다.`;
                break;

            case '배송시작':
                const trackingNumber = order.tracking_number || '미입력';

                content = `[경산다육] ${customerName}님, 배송이 시작되었습니다.

▶ 배송정보
택배사: 로젠택배
운송장: ${trackingNumber}
조회: www.ilogen.com

건강한 다육이들이 안전하게 도착할 예정입니다.

문의: 010-9745-6245
감사합니다.`;
                break;

            default:
                content = `[경산다육] ${customerName}님, 주문 상태가 업데이트되었습니다.

▶ 주문번호: ${orderNumber}
▶ 현재상태: ${status}
▶ 주문금액: ${totalAmount}원

문의: 010-9745-6245
감사합니다.`;
        }

        return content;
    }

    // SMS 내용 복사
    copySmsContent() {
        const textarea = document.getElementById('sms-content');
        textarea.select();
        document.execCommand('copy');
        
        const button = document.getElementById('copy-sms');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-2"></i>복사됨!';
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-green-600');
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);
    }

    // 모달 닫기
    closeOrderModal() {
        console.log('🔄 주문 모달 닫기 시작...');
        console.log('🔍 orderSystem 객체:', this);
        console.log('🔍 orderSystem.closeOrderModal 함수:', this.closeOrderModal);
        
        const modal = document.getElementById('order-modal');
        console.log('🔍 order-modal 요소:', modal);
        
        if (modal) {
            console.log('🔍 모달 현재 클래스:', modal.className);
            modal.classList.add('hidden');
            console.log('🔍 모달 숨김 후 클래스:', modal.className);
            console.log('✅ 주문 모달 숨김 처리 완료');
        } else {
            console.warn('⚠️ order-modal 요소를 찾을 수 없습니다');
        }
        
        // 상태 초기화
        this.currentEditingOrder = null;
        this.currentOrderItems = [];
        console.log('✅ 상태 초기화 완료');
        
        // 폼 초기화
        const form = document.getElementById('order-form');
        if (form) {
            form.reset();
            console.log('✅ 주문 폼 초기화 완료');
        } else {
            console.warn('⚠️ order-form 요소를 찾을 수 없습니다');
        }
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        console.log('✅ body 스크롤 복원 완료');
        
        console.log('✅ 주문 모달 닫기 완료');
    }

    // SMS 모달 닫기
    closeSmsModal() {
        document.getElementById('sms-modal').classList.add('hidden');
    }

    // === QR 프린트 기능들 (초기화됨) ===

    // === 고객관리 기능들 ===

    currentEditingCustomer = null;

    // 고객 목록 렌더링
    renderCustomersTable(filteredCustomers = null) {
        const container = document.getElementById('customer-list-container');
        if (!container) {
            console.warn('customer-list-container를 찾을 수 없습니다. 기존 테이블 방식으로 대체합니다.');
            const tbody = document.getElementById('customers-table-body');
            if (tbody) {
                this.renderCustomersTableOld(filteredCustomers);
            }
            return;
        }
        const customersToRender = filteredCustomers || this.customers;
        
        // 고객 정렬 적용
        const sortedCustomers = this.sortCustomers(customersToRender);
        
        // 고객 등급별 카운트 업데이트
        this.updateCustomerGradeCounts();
        
        if (sortedCustomers.length === 0) {
            const isFiltered = filteredCustomers !== null;
            container.innerHTML = `
                <div class="py-12 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    ${isFiltered ? 
                        '<p class="font-medium mb-1">해당 등급의 고객이 없습니다.</p><p class="text-sm">다른 등급 탭을 선택해보세요! 👥</p>' :
                        '<p class="font-medium mb-1">등록된 고객이 없습니다.</p><p class="text-sm">새 고객 등록 버튼을 클릭해서 첫 고객을 등록해보세요! 🙋‍♂️</p>'
                    }
                </div>
            `;
            return;
        }

        container.innerHTML = sortedCustomers.map(customer => {
            // 고객 등급을 새로운 시스템으로 강제 재계산
            const currentGrade = this.calculateCustomerGrade(customer.id);
            if (customer.grade !== currentGrade) {
                customer.grade = currentGrade;
                console.log(`🔄 ${customer.name} 등급 업데이트: ${customer.grade} → ${currentGrade}`);
            }
            
            return `
                <tr class="hover:bg-gray-50 transition-colors ${
                    this.selectedCustomerId === customer.id ? 'bg-green-50' : ''
                }">
                    <td class="px-3 py-3 cursor-pointer touch-manipulation" 
                        onclick="orderSystem.selectCustomer('${customer.id}')"
                        ontouchstart="orderSystem.selectCustomer('${customer.id}')"
                        style="min-height: 44px;">
                        <div class="font-medium text-gray-900">${customer.name}</div>
                        ${customer.memo ? `<div class="text-xs text-gray-500 mt-1">📝 ${customer.memo}</div>` : ''}
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-700 cursor-pointer touch-manipulation" 
                        onclick="orderSystem.selectCustomer('${customer.id}')"
                        ontouchstart="orderSystem.selectCustomer('${customer.id}')"
                        style="min-height: 44px;">${customer.phone}</td>
                    <td class="px-3 py-3 text-center cursor-pointer touch-manipulation" 
                        onclick="orderSystem.selectCustomer('${customer.id}')"
                        ontouchstart="orderSystem.selectCustomer('${customer.id}')"
                        style="min-height: 44px;">
                        ${this.getCustomerGradeBadge(customer.grade || 'GENERAL')}
                    </td>
                    <td class="px-3 py-3 text-center">
                        <div class="flex justify-center space-x-2">
                            <button 
                                onclick="event.stopPropagation(); orderSystem.editCustomer('${customer.id}')"
                                class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                title="고객 정보 수정">
                                <i class="fas fa-pencil-alt text-sm"></i>
                            </button>
                            <button 
                                onclick="event.stopPropagation(); orderSystem.deleteCustomer('${customer.id}')"
                                class="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                title="고객 삭제">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 기존 테이블 방식 렌더링 (백업용)
    renderCustomersTableOld(filteredCustomers = null) {
        const tbody = document.getElementById('customers-table-body');
        if (!tbody) return;
        
        const customersToRender = filteredCustomers || this.customers;
        
        if (customersToRender.length === 0) {
            const isFiltered = filteredCustomers !== null;
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
                        ${isFiltered ? 
                            '<p>해당 등급의 고객이 없습니다.</p><p class="text-sm">다른 등급 탭을 선택해보세요! 👥</p>' :
                            '<p>등록된 고객이 없습니다.</p><p class="text-sm">새 고객 등록 버튼을 클릭해서 첫 고객을 등록해보세요! 🙋‍♂️</p>'
                        }
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = customersToRender.map(customer => {
            const displayAddress = customer.address ? 
                (customer.address.length > 20 ? customer.address.substring(0, 20) + '...' : customer.address) : 
                '미등록';

            return `
                <tr class="hover:bg-gray-50" onclick="orderSystem.selectCustomer('${customer.id}')">
                    <td class="px-3 py-2">
                        <div class="font-medium text-gray-900">${customer.name}</div>
                        ${customer.memo ? `<div class="text-sm text-gray-500">${customer.memo}</div>` : ''}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">${customer.phone}</td>
                    <td class="px-4 py-3 text-sm text-gray-600" title="${customer.address || ''}">${displayAddress}</td>
                    <td class="px-3 py-2">
                        ${this.getCustomerGradeBadge(customer.grade || 'GENERAL')}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 고객 등급 드롭다운 토글
    toggleGradeDropdown(customerId) {
        const dropdown = document.getElementById(`grade-dropdown-${customerId}`);
        const allDropdowns = document.querySelectorAll('[id^="grade-dropdown-"]');
        
        // 다른 드롭다운 모두 닫기
        allDropdowns.forEach(dd => {
            if (dd.id !== `grade-dropdown-${customerId}`) {
                dd.classList.add('hidden');
            }
        });
        
        // 현재 드롭다운 토글
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    // 고객 등급 자동 계산
    calculateCustomerGrade(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return 'GENERAL';

        // 해당 고객의 모든 배송완료 주문 조회
        const customerOrders = this.orders.filter(order => 
            order.customer_phone === customer.phone && 
            order.order_status === '배송완료'
        );

        if (customerOrders.length === 0) {
            return 'GENERAL'; // 주문이 없으면 일반
        }

        // 누적 구매금액 계산
        const totalAmount = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        // 구매 횟수
        const orderCount = customerOrders.length;
        
        // 최근 구매일 (가장 최근 주문의 주문일)
        const recentOrderDates = customerOrders
            .map(order => new Date(order.order_date))
            .filter(date => !isNaN(date.getTime()))
            .sort((a, b) => b - a);
        
        const mostRecentOrder = recentOrderDates.length > 0 ? recentOrderDates[0] : null;
        const daysSinceLastOrder = mostRecentOrder ? 
            Math.floor((new Date() - mostRecentOrder) / (1000 * 60 * 60 * 24)) : 999;

        console.log(`📊 ${customer.name} 등급 계산:`, {
            누적구매금액: totalAmount.toLocaleString('ko-KR'),
            구매횟수: orderCount,
            최근구매일: mostRecentOrder?.toLocaleDateString('ko-KR'),
            경과일수: daysSinceLastOrder
        });

        // 새로운 등급 계산 로직 (환경설정에서 기준 금액 가져오기)
        const blackDiamondThreshold = parseInt(localStorage.getItem('black-diamond-threshold') || '1000000');
        const purpleEmperorThreshold = parseInt(localStorage.getItem('purple-emperor-threshold') || '500000');
        const redRubyThreshold = parseInt(localStorage.getItem('red-ruby-threshold') || '200000');
        const greenLeafThreshold = parseInt(localStorage.getItem('green-leaf-threshold') || '100000');
        
        // 블랙 다이아몬드: 설정된 금액 이상
        if (totalAmount >= blackDiamondThreshold) {
            return 'BLACK_DIAMOND';
        }
        
        // 퍼플 엠페러: 설정된 금액 이상
        if (totalAmount >= purpleEmperorThreshold) {
            return 'PURPLE_EMPEROR';
        }
        
        // 레드 루비: 설정된 금액 이상
        if (totalAmount >= redRubyThreshold) {
            return 'RED_RUBY';
        }
        
        // 그린 리프: 설정된 금액 이상
        if (totalAmount >= greenLeafThreshold) {
            return 'GREEN_LEAF';
        }
        
        // 일반: 그린 리프 기준 미만
        return 'GENERAL';
    }

    // 고객 등급 자동 업데이트 (주문 완료시 호출)
    async autoUpdateCustomerGrade(customerId, showNotification = true) {
        try {
            const customer = this.customers.find(c => c.id === customerId);
            if (!customer) return;

            const oldGrade = customer.grade || 'GENERAL';
            const newGrade = this.calculateCustomerGrade(customerId);
            
            // 등급이 변경된 경우에만 업데이트
            if (oldGrade !== newGrade) {
                // 로컬 데이터 업데이트
                const customerIndex = this.customers.findIndex(c => c.id === customerId);
                this.customers[customerIndex].grade = newGrade;

                // API 업데이트 시도
                try {
                    const response = await fetch(this.getApiUrl(`farm_customers/${customerId}`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...this.customers[customerIndex], grade: newGrade })
                    });

                    if (response.ok) {
                        console.log('✅ 자동 등급 업데이트 API 성공');
                    } else {
                        throw new Error(`API 오류: ${response.status}`);
                    }
                } catch (apiError) {
                    console.warn('⚠️ 자동 등급 업데이트 API 실패, LocalStorage 사용:', apiError);
                }

                // LocalStorage 저장
                await this.saveToStorage('farm_customers', this.customers);

                // 등급 승격 알림 (승격인 경우에만)
                const gradeOrder = { 
                    'GENERAL': 0, 
                    'GREEN_LEAF': 1, 
                    'RED_RUBY': 2, 
                    'PURPLE_EMPEROR': 3, 
                    'BLACK_DIAMOND': 4 
                };
                const isUpgrade = gradeOrder[newGrade] > gradeOrder[oldGrade];
                
                if (showNotification && isUpgrade) {
                    const gradeNames = {
                        'BLACK_DIAMOND': '💎 블랙 다이아몬드',
                        'PURPLE_EMPEROR': '🟣 퍼플 엠페러',
                        'RED_RUBY': '🔴 레드 루비',
                        'GREEN_LEAF': '🟢 그린 리프',
                        'GENERAL': '🙋‍♂️ 일반'
                    };
                    
                    this.showToast(
                        `🎉 축하합니다! ${customer.name}님이 ${gradeNames[newGrade]} 등급으로 승격되었습니다!`,
                        'success'
                    );
                }

                console.log(`📈 ${customer.name} 등급 자동 업데이트: ${oldGrade} → ${newGrade}`);
                
                // 테이블 새로고침
                this.renderCustomersTable();
                
                return { oldGrade, newGrade, isUpgrade };
            }
            
            return null; // 등급 변경 없음
            
        } catch (error) {
            console.error('❌ 자동 등급 업데이트 오류:', error);
            return null;
        }
    }

    // 모든 고객 등급 일괄 재계산 (관리자 기능)
    async recalculateAllCustomerGrades() {
        console.log('🔄 모든 고객 등급 일괄 재계산 시작...');
        
        let updatedCount = 0;
        let upgradedCustomers = [];
        
        for (const customer of this.customers) {
            const result = await this.autoUpdateCustomerGrade(customer.id, false);
            if (result && result.isUpgrade) {
                updatedCount++;
                upgradedCustomers.push({
                    name: customer.name,
                    oldGrade: result.oldGrade,
                    newGrade: result.newGrade
                });
            }
        }
        
        console.log(`✅ 등급 재계산 완료: ${updatedCount}명 승격`);
        
        if (upgradedCustomers.length > 0) {
            const upgradeList = upgradedCustomers
                .map(c => `${c.name}: ${c.oldGrade} → ${c.newGrade}`)
                .join('\n');
            
            this.showToast(
                `🎉 ${upgradedCustomers.length}명의 고객이 등급 승격되었습니다!\n\n${upgradeList}`,
                'success'
            );
        } else {
            this.showToast('✅ 모든 고객 등급이 최신 상태입니다.', 'info');
        }
        
        return { updatedCount, upgradedCustomers };
    }

    // 고객 등급 업데이트 (수동)
    async updateCustomerGrade(customerId, newGrade) {
        try {
            // 드롭다운 닫기
            const dropdown = document.getElementById(`grade-dropdown-${customerId}`);
            if (dropdown) {
                dropdown.classList.add('hidden');
            }

            // 로컬 데이터 업데이트
            const customerIndex = this.customers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                throw new Error('고객을 찾을 수 없습니다.');
            }

            const oldGrade = this.customers[customerIndex].grade || 'GENERAL';
            this.customers[customerIndex].grade = newGrade;

            let apiSuccess = false;

            // API 업데이트 시도
            try {
                const response = await fetch(this.getApiUrl(`farm_customers/${customerId}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.customers[customerIndex],
                        grade: newGrade
                    })
                });

                if (response.ok) {
                    apiSuccess = true;
                    console.log('✅ API로 고객 등급 업데이트 성공');
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('⚠️ API 업데이트 실패, LocalStorage 사용:', apiError);
            }

            // LocalStorage 저장
            await this.saveToStorage('customers', this.customers);

            // 성공 알림
            const gradeNames = {
                'BLACK_DIAMOND': '💎 블랙 다이아몬드',
                'PURPLE_EMPEROR': '🟣 퍼플 엠페러',
                'RED_RUBY': '🔴 레드 루비',
                'GREEN_LEAF': '🟢 그린 리프',
                'GENERAL': '🙋‍♂️ 일반'
            };
            
            this.showToast(
                `✅ ${this.customers[customerIndex].name}님의 등급이 ${gradeNames[newGrade]}로 변경되었습니다!`,
                'success'
            );

            // 테이블 새로고침
            this.renderCustomersTable();

        } catch (error) {
            console.error('❌ 고객 등급 업데이트 오류:', error);
            this.showToast('❌ 등급 변경 중 오류가 발생했습니다.', 'error');
        }
    }

    // 고객 모달 열기
    openCustomerModal(customerId = null) {
        this.currentEditingCustomer = customerId;
        console.log('🔧 고객 모달 열기:', {
            모드: customerId ? '수정' : '신규등록',
            고객ID: customerId,
            currentEditingCustomer: this.currentEditingCustomer
        });
        
        const modal = document.getElementById('customer-modal');
        const title = document.getElementById('customer-modal-title');
        
        console.log('🔍 모달 요소 확인:', {
            modal: !!modal,
            title: !!title
        });
        
        if (!modal) {
            console.error('❌ customer-modal 요소를 찾을 수 없습니다!');
            return;
        }
        
        if (customerId) {
            title.textContent = '고객 정보 수정';
            const customer = this.customers.find(c => c.id === customerId);
            if (customer) {
                document.getElementById('customer-form-name').value = customer.name;
                document.getElementById('customer-form-phone').value = customer.phone;
                document.getElementById('customer-form-address').value = customer.address || '';
                document.getElementById('customer-form-email').value = customer.email || '';
                document.getElementById('customer-form-grade').value = customer.grade || 'GENERAL';
                
                // 등록일 설정 (기존 고객 수정)
                const registrationDate = customer.registration_date || customer.created_at;
                if (registrationDate) {
                    const date = new Date(registrationDate);
                    if (!isNaN(date.getTime())) {
                        document.getElementById('customer-form-registration-date').value = date.toISOString().split('T')[0];
                    } else {
                        document.getElementById('customer-form-registration-date').value = new Date().toISOString().split('T')[0];
                    }
                } else {
                    document.getElementById('customer-form-registration-date').value = new Date().toISOString().split('T')[0];
                }
                
                document.getElementById('customer-form-memo').value = customer.memo || '';
            }
        } else {
            title.textContent = '새 고객 등록';
            document.getElementById('customer-form-name').value = '';
            document.getElementById('customer-form-phone').value = '';
            document.getElementById('customer-form-address').value = '';
            document.getElementById('customer-form-email').value = '';
            document.getElementById('customer-form-grade').value = 'GENERAL';
            
            // 등록일 기본값을 오늘 날짜로 설정 (새 고객 등록)
            document.getElementById('customer-form-registration-date').value = new Date().toISOString().split('T')[0];
            
            document.getElementById('customer-form-memo').value = '';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        // 모바일 터치 이벤트 방지
        document.body.style.overflow = 'hidden';
        console.log('✅ 고객 모달 hidden 클래스 제거 완료');
        console.log('🔍 모달 현재 상태:', {
            hidden: modal.classList.contains('hidden'),
            display: window.getComputedStyle(modal).display,
            visibility: window.getComputedStyle(modal).visibility
        });

        // '저장' 버튼 이벤트 리스너 추가
        const saveBtn = document.getElementById('save-customer-btn');
        if (saveBtn) {
            // 모달을 열 때마다 이벤트 리스너가 중복으로 쌓이는 것을 방지합니다.
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

            // 새로운 저장 버튼에 클릭 이벤트를 추가합니다.
            newSaveBtn.addEventListener('click', async (e) => {
                e.preventDefault(); // 폼 자동 제출 방지
                
                // 폼에서 입력된 데이터를 가져옵니다.
                const customerData = {
                    name: document.getElementById('customer-form-name').value,
                    phone: document.getElementById('customer-form-phone').value,
                    address: document.getElementById('customer-form-address').value,
                    address_detail: document.getElementById('customer-form-address-detail')?.value || '',
                    email: document.getElementById('customer-form-email').value,
                    grade: document.getElementById('customer-form-grade').value,
                    registration_date: document.getElementById('customer-form-registration-date').value,
                    memo: document.getElementById('customer-form-memo').value
                };

                try {
                    // 고객 데이터 전문가에게 데이터 저장을 요청합니다!
                    await window.customerDataManager.addCustomer(customerData);
                    
                    this.showToast('✅ 고객이 성공적으로 등록되었습니다.');
                    this.closeCustomerModal(); // 모달 닫기
                    this.renderCustomersTable(); // 고객 목록 새로고침
                } catch (error) {
                    alert(`❌ 고객 등록 실패: ${error.message}`);
                }
            });
        }
    }

    // 고객 저장
    async saveCustomer() {
        const customerData = {
            name: document.getElementById('customer-form-name').value.trim(),
            phone: document.getElementById('customer-form-phone').value.trim(),
            address: document.getElementById('customer-form-address').value.trim(),
            email: document.getElementById('customer-form-email').value.trim(),
            grade: document.getElementById('customer-form-grade').value,
            registration_date: document.getElementById('customer-form-registration-date').value,
            memo: document.getElementById('customer-form-memo').value.trim()
        };

        // 필수 필드 검증
        if (!customerData.name) {
            alert('고객명을 입력해주세요.');
            return;
        }

        if (!customerData.phone) {
            alert('전화번호를 입력해주세요.');
            return;
        }

        // 전화번호 중복 검증 (수정 시 자신 제외)
        const normalizedPhone = customerData.phone.replace(/[^0-9]/g, ''); // 숫자만 추출
        
        console.log('🔍 전화번호 중복 체크 시작:', {
            입력전화번호: customerData.phone,
            정규화된번호: normalizedPhone,
            현재수정중인고객ID: this.currentEditingCustomer,
            전체고객수: this.customers.length
        });
        
        const existingCustomer = this.customers.find(c => {
            const existingPhone = c.phone?.replace(/[^0-9]/g, '') || '';
            const isDuplicate = existingPhone === normalizedPhone && c.id !== this.currentEditingCustomer;
            
            if (existingPhone === normalizedPhone) {
                console.log(`📱 동일 번호 발견:`, {
                    기존고객ID: c.id,
                    기존고객명: c.name,
                    기존전화번호: c.phone,
                    현재수정중ID: this.currentEditingCustomer,
                    중복여부: isDuplicate
                });
            }
            
            return isDuplicate;
        });
        
        if (existingCustomer) {
            console.log('❌ 중복 전화번호 감지:', {
                입력전화번호: customerData.phone,
                정규화된번호: normalizedPhone,
                기존고객: existingCustomer.name,
                기존전화번호: existingCustomer.phone
            });
            alert(`이미 등록된 전화번호입니다.\n기존 고객: ${existingCustomer.name}`);
            return;
        }
        
        console.log('✅ 전화번호 중복 체크 통과');

        try {
            let apiSuccess = false;
            
            // API 연결이 가능한 경우에만 API 시도
            if (this.apiAvailable) {
                try {
                    let response;
                    
                    if (this.currentEditingCustomer) {
                        // 고객 수정
                        response = await fetch(this.getApiUrl(`farm_customers/${this.currentEditingCustomer}`), {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(customerData)
                        });
                    } else {
                        // 새 고객 등록
                        response = await fetch(this.getApiUrl('farm_customers'), {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(customerData)
                        });
                    }

                    if (response.ok) {
                        apiSuccess = true;
                        console.log('API로 고객 저장 성공');
                    } else {
                        throw new Error(`API 오류: ${response.status}`);
                    }
                } catch (apiError) {
                    console.warn('API 저장 실패, LocalStorage 사용:', apiError);
                }
            }
            
            // LocalStorage에 저장 (API 성공/실패 관계없이 항상 저장)
            if (this.currentEditingCustomer) {
                // 고객 수정
                const customerIndex = this.customers.findIndex(c => c.id === this.currentEditingCustomer);
                if (customerIndex !== -1) {
                    this.customers[customerIndex] = { ...customerData, id: this.currentEditingCustomer };
                    console.log('✅ 고객 정보 수정됨:', customerData.name);
                }
            } else {
                // 새 고객 등록
                customerData.id = Date.now().toString();
                customerData.created_at = new Date().toISOString(); // API 호환성을 위해 유지
                this.customers.push(customerData);
                console.log('✅ 새 고객 등록됨:', customerData.name);
            }
            
            // LocalStorage에 항상 저장 (이중 안전망)
            await this.saveToStorage('customers', this.customers);
            console.log('💾 LocalStorage에 고객 저장 완료');
            
            // Supabase에도 직접 저장 (실시간 동기화를 위해)
            await this.saveCustomerToSupabase(customerData);

            alert(this.currentEditingCustomer ? '고객 정보가 수정되었습니다.' : '새 고객이 등록되었습니다.');
            this.closeCustomerModal();
            await this.loadCustomers();
            
            // 대기자 등록에서 온 경우 대기자 목록으로 돌아가기
            if (this.fromWaitlistRegistration) {
                console.log('🔄 대기자 등록에서 온 경우 - 대기자 관리 탭으로 이동');
                this.fromWaitlistRegistration = false;
                this.customerRegistrationSource = null;
                this.switchTab('tab-waitlist');
                await this.loadWaitlist();
            }
            
            // 새 고객 등록 시에만 원래 화면으로 돌아가기 (수정 시에는 고객 목록 유지)
            if (!this.currentEditingCustomer) {
                // 스마트 네비게이션: 고객 등록 출처에 따라 다른 동작
                if (this.fromWaitlistRegistration) {
                    this.returnToWaitlistForm(customerData);
                    this.fromWaitlistRegistration = false; // 플래그 초기화
                } else if (this.customerRegistrationSource === 'order') {
                    // 주문 등록에서 온 경우: 주문 등록창으로 돌아가기
                    this.returnToOrderForm(customerData);
                } else if (this.customerRegistrationSource === 'customer') {
                    // 고객관리에서 온 경우: 고객 목록 유지 (아무것도 하지 않음)
                    console.log('✅ 고객관리에서 등록 완료 - 고객 목록 유지');
                } else {
                    // 기본값: 주문 등록창으로 돌아가기 (하위 호환성)
                    this.returnToOrderForm(customerData);
                }
                
                // 출처 플래그 초기화
                this.customerRegistrationSource = null;
            } else {
                // 고객 수정 시에는 고객 목록을 유지하고 수정된 고객을 선택
                this.selectedCustomerId = this.currentEditingCustomer;
                this.renderCustomersTable();
            }
            
            // Master-Detail 레이아웃에서 수정된 고객이 선택된 상태라면 상세 정보 업데이트
            if (this.currentEditingCustomer && this.selectedCustomerId === this.currentEditingCustomer) {
                const updatedCustomer = this.customers.find(c => c.id === this.currentEditingCustomer);
                if (updatedCustomer) {
                    this.selectedCustomer = updatedCustomer;
                    this.renderCustomerDetail(updatedCustomer);
                }
            }
            
        } catch (error) {
            console.error('고객 저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    }

    // 고객 수정
    editCustomer(customerId) {
        this.openCustomerModal(customerId);
    }

    // 고객 삭제 (고객관리 탭에서만 가능)
    async deleteCustomer(customerId) {
        // 고객관리 탭에서만 삭제 허용
        const currentTab = document.querySelector('.tab-button.active');
        if (!currentTab || currentTab.id !== 'tab-customers') {
            alert('⚠️ 고객 삭제는 고객관리 탭에서만 가능합니다.');
            return;
        }

        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            alert('고객 정보를 찾을 수 없습니다.');
            return;
        }

        // 해당 고객의 주문이 있는지 확인
        const customerOrders = this.orders.filter(order => order.customerId === customerId);
        
        let confirmMessage = `정말로 "${customer.name}" 고객을 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`;
        
        if (customerOrders.length > 0) {
            confirmMessage += `\n\n📋 주의: 이 고객과 연결된 ${customerOrders.length}개의 주문 내역도 함께 삭제됩니다.`;
        }

        // 영구 삭제 최종 확인 팝업
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            // 1. 연결된 주문들 먼저 삭제
            if (customerOrders.length > 0) {
                this.orders = this.orders.filter(order => order.customerId !== customerId);
                await this.saveToStorage('orders', this.orders);
            }
            
            // 2. 고객 데이터 삭제
            this.customers = this.customers.filter(c => c.id !== customerId);
            await this.saveToStorage('customers', this.customers);

            // 3. API 삭제 시도
            try {
                const response = await fetch(this.getApiUrl(`farm_customers/${customerId}`), {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log('고객 API 삭제 성공');
                } else {
                    throw new Error(`API 삭제 실패: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('고객 API 삭제 실패, LocalStorage는 업데이트됨:', apiError);
            }

            // 4. 선택된 고객이 삭제된 경우 선택 해제
            if (this.selectedCustomerId === customerId) {
                this.selectedCustomerId = null;
                this.selectedCustomer = null;
                this.renderCustomerDetail(null);
            }
            
            // 5. UI 업데이트
            this.renderCustomersTable();
            this.updateCustomerGradeCounts();
            this.renderOrdersTable();
            
            // 6. 성공 알림
            this.showToast(`🗑️ "${customer.name}" 고객이 영구 삭제되었습니다.`);

        } catch (error) {
            console.error('고객 삭제 중 오류 발생:', error);
            alert('고객 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }

        // UI 업데이트  
        this.renderCustomersTable();
        console.log(`고객 삭제 완료 - 남은 고객 수: ${this.customers.length}`);
    }

    // QR코드 관련 이벤트 설정
    setupQRCodeEvents() {
        console.log('QR코드 이벤트 설정 시작');
        
        try {
            // QR코드 생성 버튼 클릭 이벤트
            const generateBtn = document.getElementById('generate-qr-btn');
            if (generateBtn) {
                generateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('QR코드 생성 버튼 클릭됨');
                    this.generateQRCodeModalPreview();
                });
                console.log('QR코드 생성 버튼 이벤트 등록 완료');
            } else {
                console.error('generate-qr-btn 요소를 찾을 수 없음');
            }

            // QR코드 다운로드 버튼 클릭 이벤트
            const downloadBtn = document.getElementById('download-qr-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('QR코드 다운로드 버튼 클릭됨');
                    this.downloadQRCode();
                });
                console.log('QR코드 다운로드 버튼 이벤트 등록 완료');
            }

            // QR코드 프린트 버튼 클릭 이벤트
            const printBtn = document.getElementById('print-qr-btn');
            if (printBtn) {
                printBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('QR코드 프린트 버튼 클릭됨');
                    this.printQRCode();
                });
                console.log('QR코드 프린트 버튼 이벤트 등록 완료');
            }

            // QR코드 타입 라디오 버튼 변경 이벤트
            const qrTypeRadios = document.querySelectorAll('input[name="qr-type"]');
            qrTypeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    console.log('QR코드 타입 변경:', e.target.value);
                    this.handleQRTypeChange(e.target.value);
                });
            });

            // 커스텀 텍스트 입력 이벤트
            const customTextInput = document.getElementById('qr-custom-text');
            if (customTextInput) {
                customTextInput.addEventListener('input', () => {
                    console.log('QR코드 커스텀 텍스트 변경');
                    // 실시간으로 QR코드를 업데이트하지 않고 생성 버튼을 눌러야 함
                });
            }

        } catch (error) {
            console.error('QR코드 이벤트 설정 실패:', error);
        }
    }

    // QR 수량 증가
    increaseQRQuantity(productId) {
        const input = document.querySelector(`.qr-quantity-input[data-product-id="${productId}"]`);
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            if (currentValue < 99) {
                input.value = currentValue + 1;
                this.updateQRPrintSelection();
            }
        }
    }

    // QR 수량 감소
    decreaseQRQuantity(productId) {
        const input = document.querySelector(`.qr-quantity-input[data-product-id="${productId}"]`);
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                this.updateQRPrintSelection();
            }
        }
    }

    // QR 프린트 선택 업데이트
    updateQRPrintSelection() {
        const checkboxes = document.querySelectorAll('.qr-product-checkbox:checked');
        const selectedCount = checkboxes.length;
        
        let totalLabels = 0;
        checkboxes.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            const quantityInput = document.querySelector(`.qr-quantity-input[data-product-id="${productId}"]`);
            const quantity = parseInt(quantityInput.value) || 1;
            totalLabels += quantity;
        });
        
        // 상단 버튼 업데이트
        const selectedCountSpan = document.getElementById('selected-qr-count');
        const totalCountSpan = document.getElementById('total-qr-count');
        const printBtn = document.getElementById('print-selected-qr-btn');
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount;
        if (totalCountSpan) totalCountSpan.textContent = totalLabels;
        
        if (printBtn) {
            if (selectedCount > 0) {
                printBtn.disabled = false;
                printBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                printBtn.classList.add('hover:bg-purple-700');
            } else {
                printBtn.disabled = true;
                printBtn.classList.add('opacity-50', 'cursor-not-allowed');
                printBtn.classList.remove('hover:bg-purple-700');
            }
        }
    }

    // 전체 QR 선택/해제
    toggleSelectAllQRProducts() {
        const selectAllCheckbox = document.getElementById('select-all-qr-products');
        const productCheckboxes = document.querySelectorAll('.qr-product-checkbox');
        
        if (selectAllCheckbox && productCheckboxes) {
            productCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
            this.updateQRPrintSelection();
        }
    }

    // 선택된 상품들 QR코드 프린트
    printSelectedQRCodes() {
        console.log('선택된 상품들 QR코드 프린트 시작');
        
        const checkboxes = document.querySelectorAll('.qr-product-checkbox:checked');
        if (checkboxes.length === 0) {
            this.showToast('❌ 프린트할 상품을 선택해주세요.');
            return;
        }
        
        const selectedProducts = [];
        checkboxes.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            const product = this.products.find(p => p.id === productId);
            const quantityInput = document.querySelector(`.qr-quantity-input[data-product-id="${productId}"]`);
            const quantity = parseInt(quantityInput.value) || 1;
            
            if (product) {
                selectedProducts.push({
                    ...product,
                    quantity: quantity
                });
            }
        });
        
        this.generateBulkPrintPage(selectedProducts);
    }

    // 대량 프린트 이벤트 설정
    setupBulkPrintEvents() {
        // 선택된 상품 QR코드 프린트 버튼
        const printSelectedQrBtn = document.getElementById('print-selected-qr-btn');
        if (printSelectedQrBtn) {
            printSelectedQrBtn.addEventListener('click', () => {
                this.printSelectedQRCodes();
            });
        }

        // 전체 선택 체크박스 (상품 테이블)
        const selectAllQrProducts = document.getElementById('select-all-qr-products');
        if (selectAllQrProducts) {
            selectAllQrProducts.addEventListener('change', () => {
                this.toggleSelectAllQRProducts();
            });
        }

        // 대량 프린트 모달 닫기
        const closeBulkPrintModal = document.getElementById('close-bulk-print-modal');
        if (closeBulkPrintModal) {
            closeBulkPrintModal.addEventListener('click', () => {
                const bulkPrintModal = document.getElementById('bulk-print-modal');
                if (bulkPrintModal) {
                    bulkPrintModal.classList.add('hidden');
                }
            });
        }
        
        const closeBulkPrintModalBtn = document.getElementById('close-bulk-print-modal-btn');
        if (closeBulkPrintModalBtn) {
            closeBulkPrintModalBtn.addEventListener('click', () => {
                const bulkPrintModal = document.getElementById('bulk-print-modal');
                if (bulkPrintModal) {
                    bulkPrintModal.classList.add('hidden');
                }
            });
        }

        // 전체 선택 체크박스
        document.getElementById('select-all-products').addEventListener('change', () => {
            this.toggleSelectAllProducts();
        });

        // 대량 프린트 시작
        const startBulkPrint = document.getElementById('start-bulk-print');
        if (startBulkPrint) {
            startBulkPrint.addEventListener('click', () => {
                this.startBulkPrint();
            });
        }

        // 미리보기 (같은 기능)
        const previewBulkPrint = document.getElementById('preview-bulk-print');
        if (previewBulkPrint) {
            previewBulkPrint.addEventListener('click', () => {
                this.startBulkPrint();
            });
        }
    }

    // 고객 검색 입력 처리
    handleCustomerSearchInput(query) {
        const suggestionsDiv = document.getElementById('customer-search-suggestions');
        const addButton = document.getElementById('add-customer-from-search');
        
        if (!query.trim()) {
            suggestionsDiv.classList.add('hidden');
            addButton.classList.add('hidden');
            this.renderCustomersTable();
            return;
        }

        // 실시간 검색 - 한글자부터 검색
        const filteredCustomers = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query) ||
            (customer.email && customer.email.toLowerCase().includes(query.toLowerCase())) ||
            (customer.address && customer.address.toLowerCase().includes(query.toLowerCase()))
        );

        // 테이블 필터링
        if (filteredCustomers.length === 0) {
            // 검색 결과 없음 - 테이블에 메시지 표시
            const tbody = document.getElementById('customers-table-body');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-search text-4xl mb-2 opacity-50"></i>
                        <p>"${query}"에 대한 검색 결과가 없습니다.</p>
                        <p class="text-sm">위의 + 버튼을 클릭하여 새 고객을 등록하세요.</p>
                    </td>
                </tr>
            `;
            
            // 신규 고객 추가 버튼 표시
            addButton.classList.remove('hidden');
            suggestionsDiv.classList.add('hidden');
        } else {
            // 검색 결과 있음 - 테이블 필터링 및 자동완성 표시
            const originalCustomers = this.customers;
            this.customers = filteredCustomers;
            this.renderCustomersTable();
            this.customers = originalCustomers;
            
            // 자동완성 드롭다운 표시 (상위 5개만)
            const topResults = filteredCustomers.slice(0, 5);
            suggestionsDiv.innerHTML = topResults.map(customer => `
                <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                     onclick="orderSystem.selectCustomerFromSearch('${customer.id}')"
                     title="클릭하여 고객 정보 확인">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <i class="fas fa-user text-blue-500 mr-3"></i>
                            <div>
                                <div class="font-medium text-gray-900">${customer.name}</div>
                                <div class="text-sm text-gray-600">${customer.phone}</div>
                                <div class="text-xs text-gray-500">${customer.address || '주소 미등록'}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-500">등록일</div>
                            <div class="text-xs text-gray-600">${new Date(customer.created_at).toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (filteredCustomers.length > 5) {
                suggestionsDiv.innerHTML += `
                    <div class="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        +${filteredCustomers.length - 5}개 더 있음 (테이블에서 확인)
                    </div>
                `;
            }
            
            suggestionsDiv.classList.remove('hidden');
            addButton.classList.add('hidden');
        }
    }

    // 엔터키 처리
    handleCustomerSearchEnter() {
        const query = document.getElementById('customer-search').value.trim();
        if (!query) return;

        const exactMatch = this.customers.find(c => 
            c.name.toLowerCase() === query.toLowerCase() || c.phone === query
        );

        if (exactMatch) {
            this.selectCustomerFromSearch(exactMatch.id);
        } else {
            this.addCustomerFromSearch();
        }
    }

    // 검색에서 고객 선택
    selectCustomerFromSearch(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        // 고객 수정 모달 열기
        this.editCustomer(customerId);
        
        // 검색 초기화
        document.getElementById('customer-search').value = customer.name;
        document.getElementById('customer-search-suggestions').classList.add('hidden');
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-user-edit mr-2"></i>
                <span>"${customer.name}" 고객 정보 열림</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    // 검색에서 신규 고객 추가
    addCustomerFromSearch() {
        const query = document.getElementById('customer-search').value.trim();
        if (!query) return;

        // 새 고객 모달 열기 (주문 등록에서 온 것)
        this.customerRegistrationSource = 'order';
        this.openCustomerModal();
        
        // 검색어를 고객명으로 설정
        setTimeout(() => {
            const nameField = document.getElementById('customer-form-name');
            if (nameField) {
                nameField.value = query;
                // 전화번호 필드로 포커스
                document.getElementById('customer-form-phone').focus();
            }
        }, 100);
        
        // 검색 초기화
        document.getElementById('customer-search-suggestions').classList.add('hidden');
        document.getElementById('add-customer-from-search').classList.add('hidden');
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-user-plus mr-2"></i>
                <span>"${query}" 신규 고객 등록 시작</span>
            </div>
            <div class="text-sm mt-1">전화번호와 추가 정보를 입력해주세요</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // 기존 고객 검색 (호환성 유지)
    searchCustomers() {
        this.handleCustomerSearchInput(document.getElementById('customer-search').value);
    }

    // 주문 이력 보기 모드 변경
    setOrderHistoryView(viewMode) {
        this.orderHistoryViewMode = viewMode;
        
        // 버튼 스타일 업데이트
        const cardBtn = document.getElementById('view-card-btn');
        const tableBtn = document.getElementById('view-table-btn');
        
        if (viewMode === 'card') {
            cardBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white';
            tableBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-800';
        } else {
            cardBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-800';
            tableBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white';
        }
        
        // 현재 열린 고객의 주문 이력을 다시 렌더링
        if (this.currentCustomerOrders) {
            this.renderCustomerOrderHistory(this.currentCustomerOrders.orders, this.currentCustomerOrders.customerName);
        }
    }

    // 고객별 주문 이력 조회 (전화번호 기반)
    async showCustomerOrderHistory(customerPhone, customerName) {
        // 초기화
        this.orderHistoryViewMode = this.orderHistoryViewMode || 'card';
        // 해당 전화번호의 모든 주문 찾기 (전화번호 또는 이름으로 매칭)
        const customerOrders = this.orders.filter(order => 
            order.customer_phone === customerPhone || 
            (order.customer_name === customerName && order.customer_phone.replace(/[^0-9]/g, '') === customerPhone.replace(/[^0-9]/g, ''))
        );

        // 주문을 날짜순으로 정렬 (최신순)
        customerOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        const modal = document.getElementById('customer-orders-modal');
        const title = document.getElementById('customer-orders-title');
        const subtitle = document.getElementById('customer-orders-subtitle');
        const summary = document.getElementById('customer-summary'); 
        const content = document.getElementById('customer-orders-content');

        // 고객 정보 (가장 최근 주문에서 가져오기)
        const latestOrder = customerOrders[0];
        const displayName = latestOrder ? latestOrder.customer_name : customerName;
        const displayPhone = latestOrder ? latestOrder.customer_phone : customerPhone;
        const displayAddress = latestOrder ? latestOrder.customer_address : '';

        title.textContent = `${displayName}님의 주문이력`;
        subtitle.textContent = `총 ${customerOrders.length}건의 주문 • 누적 데이터 분석`;

        if (customerOrders.length === 0) {
            summary.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-user text-3xl mb-2 opacity-50"></i>
                    <p>고객 정보</p>
                    <p class="text-sm">주문 이력 없음</p>
                </div>
            `;
            
            content.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-shopping-cart text-5xl mb-4 opacity-50"></i>
                    <h4 class="text-lg font-medium mb-2">${displayName}님의 주문이력이 없습니다</h4>
                    <p class="text-sm">아직 주문한 상품이 없습니다.</p>
                    <button onclick="orderSystem.closeCustomerOrdersModal(); orderSystem.switchTab('tab-orders'); orderSystem.openOrderModal();" 
                            class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i>첫 주문 등록하기
                    </button>
                </div>
            `;
        } else {
            // 통계 계산
            const totalAmount = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
            const totalOrders = customerOrders.length;
            const avgAmount = Math.round(totalAmount / totalOrders);
            
            // 최근 주문일과 첫 주문일
            const firstOrderDate = new Date(customerOrders[customerOrders.length - 1].order_date);
            const lastOrderDate = new Date(customerOrders[0].order_date);
            const daysSinceFirst = Math.floor((new Date() - firstOrderDate) / (1000 * 60 * 60 * 24));
            const daysSinceLast = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
            
            // 주문 상태별 통계
            const statusStats = {};
            customerOrders.forEach(order => {
                statusStats[order.order_status] = (statusStats[order.order_status] || 0) + 1;
            });
            
            // 상품별 구매 통계
            const productStats = {};
            customerOrders.forEach(order => {
                if (order.order_items) {
                    const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                    items.forEach(item => {
                        if (productStats[item.name]) {
                            productStats[item.name] += item.quantity;
                        } else {
                            productStats[item.name] = item.quantity;
                        }
                    });
                }
            });
            
            const topProducts = Object.entries(productStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3);

            // 왼쪽 고객 요약 정보
            summary.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-user-circle mr-2 text-blue-600"></i>고객 정보
                    </h4>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-medium">이름:</span> ${displayName}</div>
                        <div><span class="font-medium">전화:</span> ${displayPhone}</div>
                        <div><span class="font-medium">주소:</span> ${displayAddress || '미등록'}</div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-bold text-green-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line mr-2"></i>주문 통계
                    </h4>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-600">${totalOrders}</div>
                            <div class="text-gray-600">총 주문</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-600">${new Intl.NumberFormat('ko-KR').format(totalAmount)}</div>
                            <div class="text-gray-600">총 금액</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${new Intl.NumberFormat('ko-KR').format(avgAmount)}</div>
                            <div class="text-gray-600">평균 주문</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-purple-600">${daysSinceFirst}</div>
                            <div class="text-gray-600">고객 기간</div>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-bold text-blue-800 mb-3 flex items-center">
                        <i class="fas fa-heart mr-2"></i>선호 상품
                    </h4>
                    <div class="space-y-2 text-sm">
                        ${topProducts.length > 0 ? topProducts.map(([name, qty], index) => `
                            <div class="flex justify-between items-center">
                                <span class="flex items-center">
                                    <span class="w-4 h-4 rounded-full bg-blue-${600 - index * 100} mr-2 text-xs text-white flex items-center justify-center">${index + 1}</span>
                                    ${name}
                                </span>
                                <span class="font-medium">${qty}개</span>
                            </div>
                        `).join('') : '<div class="text-gray-500">구매 이력 없음</div>'}
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-bold text-yellow-800 mb-3 flex items-center">
                        <i class="fas fa-clock mr-2"></i>최근 활동
                    </h4>
                    <div class="space-y-1 text-sm">
                        <div>첫 주문: ${firstOrderDate.toLocaleDateString('ko-KR')}</div>
                        <div>최근 주문: ${lastOrderDate.toLocaleDateString('ko-KR')} (${daysSinceLast}일 전)</div>
                        <div class="text-xs text-gray-600 mt-2">
                            ${daysSinceLast <= 7 ? '🔥 활발한 고객' : daysSinceLast <= 30 ? '😊 정기 고객' : '😴 휴면 고객'}
                        </div>
                    </div>
                </div>
            `;

            // 현재 고객 주문 정보 저장
            this.currentCustomerOrders = { orders: customerOrders, customerName: displayName };
            
            // 선택된 보기 모드에 따라 렌더링
            this.renderCustomerOrderHistory(customerOrders, displayName);
        }

        modal.classList.remove('hidden');
    }

    // 주문 복사 기능 (새로운 기능)
    async duplicateOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        if (confirm(`"${order.order_number}" 주문을 복사하여 새 주문을 만드시겠습니까?`)) {
            this.closeCustomerOrdersModal();
            this.switchTab('tab-orders');
            
            // 새 주문 모달 열기
            setTimeout(() => {
                this.openOrderModal();
                
                // 기존 주문 데이터로 채우기
                setTimeout(() => {
                    document.getElementById('customer-name').value = order.customer_name;
                    document.getElementById('customer-phone').value = order.customer_phone;
                    document.getElementById('customer-address').value = order.customer_address;
                    document.getElementById('order-memo').value = (order.memo || '') + ' (복사됨)';
                    
                    // 주문 아이템 복사
                    if (order.order_items) {
                        const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                        this.currentOrderItems = items.map(item => ({
                            ...item,
                            id: Date.now() + Math.random() // 새 ID 생성
                        }));
                        this.renderOrderItems();
                    }
                    
                    // 할인 금액 복사
                    if (order.discount_amount) {
                        document.getElementById('discount-amount').value = order.discount_amount;
                        this.updateTotalAmount();
                    }
                }, 200);
            }, 100);
        }
    }

    // 기존 고객관리에서 호출하는 함수 (호환성 유지)
    async viewCustomerOrders(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        this.showCustomerOrderHistory(customer.phone, customer.name);
    }

    // 고객 모달 닫기
    closeCustomerModal() {
        console.log('🔒 고객 모달 닫기 시작...');
        const modal = document.getElementById('customer-modal');
        
        if (modal) {
            // hidden 클래스 추가
            modal.classList.add('hidden');
            
            // display 스타일도 명시적으로 설정
            modal.style.display = 'none';
            modal.style.zIndex = '-1';
            
            // body 스크롤 복원
            document.body.style.overflow = '';
            
            // 현재 편집 중인 고객 초기화
            this.currentEditingCustomer = null;
            
            console.log('✅ 고객 모달 닫기 완료');
        } else {
            console.error('❌ 고객 모달 요소를 찾을 수 없습니다');
        }
    }

    // 고객 주문이력 모달 닫기
    closeCustomerOrdersModal() {
        document.getElementById('customer-orders-modal').classList.add('hidden');
    }

    // 주문 이력 보기 모드 설정
    setOrderHistoryView(mode) {
        this.orderHistoryViewMode = mode;
        
        // 버튼 스타일 업데이트
        const cardBtn = document.getElementById('view-card-btn');
        const tableBtn = document.getElementById('view-table-btn');
        
        if (mode === 'card') {
            cardBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white';
            tableBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-800';
        } else {
            tableBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white';
            cardBtn.className = 'px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-800';
        }
        
        // 현재 열린 고객의 주문 이력 다시 렌더링
        if (this.currentCustomerOrders) {
            this.renderCustomerOrderHistory(this.currentCustomerOrders.orders, this.currentCustomerOrders.customerName);
        }
    }

    // 고객 주문 이력 렌더링 (카드 또는 표 형식)
    renderCustomerOrderHistory(orders, customerName) {
        const content = document.getElementById('customer-orders-content');
        
        // orders가 배열이 아닌 경우 배열로 변환
        if (!Array.isArray(orders)) {
            orders = [];
        }
        
        if (!orders || orders.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-shopping-cart text-5xl mb-4 opacity-50"></i>
                    <h4 class="text-lg font-medium mb-2">${customerName}님의 주문이력이 없습니다</h4>
                    <p class="text-sm">아직 주문한 상품이 없습니다.</p>
                </div>
            `;
            return;
        }

        if (this.orderHistoryViewMode === 'table') {
            // 📊 표 형식으로 렌더링
            content.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b">
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문일</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문상품명</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문수량</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">총금액</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${orders.map(order => {
                                const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                                const firstItem = items[0];
                                const moreItems = items.length > 1 ? `외 ${items.length - 1}개` : '';
                                
                                // 상태별 색상
                                const statusColors = {
                                    '주문접수': 'bg-blue-100 text-blue-800',
                                    '입금확인': 'bg-green-100 text-green-800',
                                    '배송준비': 'bg-yellow-100 text-yellow-800',
                                    '배송시작': 'bg-purple-100 text-purple-800',
                                    '배송완료': 'bg-gray-100 text-gray-800',
                                    '취소': 'bg-red-100 text-red-800',
                                    '환불': 'bg-red-100 text-red-800'
                                };

                                return `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${new Date(order.order_date).toLocaleDateString('ko-KR')}</div>
                                            <div class="text-xs text-gray-500">${order.order_number}</div>
                                        </td>
                                        <td class="px-3 py-2">
                                            <div class="text-sm text-gray-900 space-y-1">
                                                ${items.length > 0 ? 
                                                    items.map(item => 
                                                        `<div class="text-sm font-medium text-blue-700">${item.name}</div>`
                                                    ).join('') 
                                                    : '<span class="text-gray-500">상품 정보 없음</span>'
                                                }
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-center">
                                            <div class="text-sm text-gray-900 space-y-1">
                                                ${items.length > 0 ? 
                                                    items.map(item => 
                                                        `<div class="text-sm text-gray-600">${item.quantity}개</div>`
                                                    ).join('') 
                                                    : '<span class="text-gray-500">-</span>'
                                                }
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                            <div class="text-sm text-gray-900 space-y-1">
                                                ${items.length > 0 ? 
                                                    items.map(item => 
                                                        `<div class="text-sm text-green-600">${new Intl.NumberFormat('ko-KR').format(item.price)}원</div>`
                                                    ).join('') 
                                                    : '<span class="text-gray-500">-</span>'
                                                }
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-right whitespace-nowrap">
                                            <div class="text-sm font-bold text-red-600">
                                                ${new Intl.NumberFormat('ko-KR').format(order.total_amount)}원
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-center whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}">
                                                ${order.order_status}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-center whitespace-nowrap">
                                            <div class="flex justify-center space-x-1">
                                                <button onclick="orderSystem.editOrder('${order.id}')" 
                                                        class="text-blue-600 hover:text-blue-800 transition-colors text-xs p-1"
                                                        title="수정">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="orderSystem.duplicateOrder('${order.id}')" 
                                                        class="text-green-600 hover:text-green-800 transition-colors text-xs p-1"
                                                        title="복사">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                                <button onclick="orderSystem.generateSMS('${order.id}')" 
                                                        class="text-purple-600 hover:text-purple-800 transition-colors text-xs p-1"
                                                        title="문자">
                                                    <i class="fas fa-sms"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div class="text-center">
                            <div class="font-bold text-blue-600">${orders.length}건</div>
                            <div class="text-gray-600">총 주문</div>
                        </div>
                        <div class="text-center">
                            <div class="font-bold text-green-600">${new Intl.NumberFormat('ko-KR').format(orders.reduce((sum, o) => sum + o.total_amount, 0))}원</div>
                            <div class="text-gray-600">총 금액</div>
                        </div>
                        <div class="text-center">
                            <div class="font-bold text-purple-600">${new Intl.NumberFormat('ko-KR').format(Math.round(orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length))}원</div>
                            <div class="text-gray-600">평균 주문</div>
                        </div>
                        <div class="text-center">
                            <div class="font-bold text-orange-600">${orders.filter(o => o.order_status === '배송완료').length}건</div>
                            <div class="text-gray-600">완료 주문</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 🎴 기존 카드 형식으로 렌더링 (기존 코드 유지)
            content.innerHTML = `
                <div class="space-y-4">
                    ${orders.map(order => {
                        const items = Array.isArray(order.order_items) ? order.order_items : JSON.parse(order.order_items || '[]');
                        const statusColors = {
                            '주문접수': 'border-blue-200 bg-blue-50',
                            '입금확인': 'border-green-200 bg-green-50',
                            '배송준비': 'border-yellow-200 bg-yellow-50',
                            '배송시작': 'border-purple-200 bg-purple-50',
                            '배송완료': 'border-gray-200 bg-gray-50',
                            '취소': 'border-red-200 bg-red-50',
                            '환불': 'border-red-200 bg-red-50'
                        };

                        return `
                            <div class="border rounded-lg p-4 ${statusColors[order.order_status] || 'border-gray-200 bg-white'} transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 class="font-bold text-gray-800">${order.order_number}</h4>
                                        <p class="text-sm text-gray-600">${new Date(order.order_date).toLocaleDateString('ko-KR', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-green-600">${new Intl.NumberFormat('ko-KR').format(order.total_amount)}원</div>
                                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white border">
                                            ${order.order_status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <h5 class="text-sm font-medium text-gray-700 mb-1">주문 상품</h5>
                                    <div class="text-sm text-gray-600">
                                        ${items.map(item => `${item.name} × ${item.quantity}개`).join(', ')}
                                    </div>
                                </div>
                                
                                ${order.memo ? `
                                    <div class="mb-3">
                                        <h5 class="text-sm font-medium text-gray-700 mb-1">메모</h5>
                                        <p class="text-sm text-gray-600">${order.memo}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="flex justify-end space-x-2 pt-3 border-t">
                                    <button onclick="orderSystem.editOrder('${order.id}')" 
                                            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                                        <i class="fas fa-edit mr-1"></i>수정
                                    </button>
                                    <button onclick="orderSystem.duplicateOrder('${order.id}')" 
                                            class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                                        <i class="fas fa-copy mr-1"></i>복사
                                    </button>
                                    <button onclick="orderSystem.generateSMS('${order.id}')" 
                                            class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
                                        <i class="fas fa-sms mr-1"></i>문자
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }

    // === 상품관리 기능들 ===

    currentEditingProduct = null;

    // 상품 목록 정렬
    sortProducts(products) {
        const sortedProducts = [...products]; // 원본 배열 복사
        
        switch (this.productSortBy) {
            case 'newest':
                // 최근 등록순 (created_at 또는 id 기준 내림차순)
                return sortedProducts.sort((a, b) => {
                    const timeA = a.created_at || parseInt(a.id) || 0;
                    const timeB = b.created_at || parseInt(b.id) || 0;
                    return timeB - timeA;
                });
                
            case 'name_asc':
                // 상품명 오름차순 (ㄱ → ㅎ)
                return sortedProducts.sort((a, b) => {
                    return a.name.localeCompare(b.name, 'ko-KR');
                });
                
            case 'name_desc':
                // 상품명 내림차순 (ㅎ → ㄱ)
                return sortedProducts.sort((a, b) => {
                    return b.name.localeCompare(a.name, 'ko-KR');
                });
                
            default:
                return sortedProducts;
        }
    }

    // 정렬 기준 변경
    changeProductSort(sortBy) {
        console.log('🔄 정렬 기준 변경:', sortBy);
        this.productSortBy = sortBy;
        this.currentProductsPage = 1; // 첫 페이지로 리셋
        
        // 사용자 설정 저장
        localStorage.setItem('farm_product_sort', sortBy);
        
        this.renderProductsTable();
        console.log('✅ 정렬 완료');
    }

    // 상품 목록 렌더링 (페이지네이션 지원)
    renderProductsTable() {
        const tbody = document.getElementById('products-table-body');
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-3 py-6 text-center text-gray-500">
                        <i class="fas fa-leaf text-4xl mb-2 opacity-50"></i>
                        <p>등록된 상품이 없습니다.</p>
                        <p class="text-sm">새 상품 등록 버튼을 클릭해서 첫 상품을 등록해보세요! 🌱</p>
                    </td>
                </tr>
            `;
            this.updateProductsPagination();
            return;
        }

        // 상품 정렬 적용
        const sortedProducts = this.sortProducts(this.products);
        
        // 페이지네이션 계산
        const totalProducts = sortedProducts.length;
        
        // 전체 표시 옵션 처리
        if (this.productsPerPage === 'all') {
            this.totalProductsPages = 1;
            this.currentProductsPage = 1;
        } else {
            this.totalProductsPages = Math.ceil(totalProducts / this.productsPerPage);
            
            // 현재 페이지가 범위를 벗어나면 조정
            if (this.currentProductsPage > this.totalProductsPages) {
                this.currentProductsPage = 1;
            }
        }
        
        // 현재 페이지에 표시할 상품 계산
        let displayProducts;
        if (this.productsPerPage === 'all') {
            displayProducts = sortedProducts;
        } else {
            const startIndex = (this.currentProductsPage - 1) * this.productsPerPage;
            const endIndex = startIndex + this.productsPerPage;
            displayProducts = sortedProducts.slice(startIndex, endIndex);
        }

        tbody.innerHTML = displayProducts.map(product => {
            const createdDate = new Date(product.created_at).toLocaleDateString('ko-KR');
            const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
            const stockStatus = this.getStockStatus(product.stock);
            const categoryName = this.getCategoryName(product.category); // 카테고리 이름 통일
            const categoryColor = this.getCategoryColor(categoryName);

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-center">
                        <input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500" 
                               value="${product.id}" 
                               data-product-id="${product.id}"
                               onchange="orderSystem.updateBulkPrintCount()">
                    </td>
                    <td class="px-3 py-2">
                        <div class="flex items-center space-x-2">
                            <button onclick="orderSystem.decreaseLabelQty('${product.id}')" 
                                    class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs transition-colors">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   id="label-qty-${product.id}" 
                                   class="quantity-input w-12 text-center border border-gray-300 rounded text-sm py-1"
                                   data-product-id="${product.id}"
                                   value="1" 
                                   min="1" 
                                   max="72"
                                   onchange="orderSystem.updateBulkPrintCount()">
                            <button onclick="orderSystem.increaseLabelQty('${product.id}')" 
                                    class="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-xs transition-colors">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td class="px-3 py-2">
                        <div class="flex items-center">
                            ${product.image_url ? 
                                `<img src="${product.image_url}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-200">` : 
                                `<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-3 border border-gray-200"><i class="fas fa-leaf text-gray-400"></i></div>`
                            }
                            <div>
                                <div class="font-medium text-gray-900">${product.name}</div>
                                ${product.description ? `<div class="text-sm text-gray-500">${product.description.length > 30 ? product.description.substring(0, 30) + '...' : product.description}</div>` : ''}
                                ${this.renderProductTagsInList(product.tags)}
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3 hidden">
                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColor}">
                            ${categoryName}
                        </span>
                    </td>
                    <td class="px-3 py-2">
                        ${product.size ? 
                            `<span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                ${product.size}
                            </span>` : 
                            `<span class="text-gray-400 text-sm">-</span>`
                        }
                    </td>
                    <td class="px-3 py-2">
                        <span class="inline-editable text-sm font-medium text-gray-900" 
                              data-product-id="${product.id}" 
                              data-field="price" 
                              data-value="${product.price}"
                              onclick="orderSystem.startInlineEdit(this)"
                              title="클릭하여 편집">${formattedPrice}원</span>
                    </td>
                    <td class="px-4 py-3 hidden">
                        ${product.wholesale_price ? 
                            `<span class="inline-editable text-sm text-gray-700" 
                                   data-product-id="${product.id}" 
                                   data-field="wholesale_price" 
                                   data-value="${product.wholesale_price}"
                                   onclick="orderSystem.startInlineEdit(this)"
                                   title="클릭하여 편집">${new Intl.NumberFormat('ko-KR').format(product.wholesale_price)}원</span>` : 
                            `<span class="text-gray-400 text-xs cursor-pointer" 
                                   onclick="orderSystem.startInlineEdit(this)" 
                                   data-product-id="${product.id}" 
                                   data-field="wholesale_price" 
                                   data-value="0"
                                   title="클릭하여 입력">미입력</span>`
                        }
                    </td>
                    <td class="px-4 py-3 hidden">
                        ${this.getProfitMarginBadge(product.price, product.wholesale_price)}
                    </td>
                    <td class="px-4 py-3 hidden">
                        ${this.getShippingBadge(product.shipping_option)}
                    </td>
                    <td class="px-3 py-2">
                        <span class="inline-editable text-sm text-gray-900" 
                              data-product-id="${product.id}" 
                              data-field="stock" 
                              data-value="${product.stock}"
                              onclick="orderSystem.startInlineEdit(this)"
                              title="클릭하여 편집">${product.stock}개</span>
                    </td>
                    <td class="px-4 py-3 hidden">
                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}">
                            ${stockStatus.text}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        ${this.hasQRCode(product) ? 
                            `<div class="relative group">
                                <img src="${product.qr_code}" alt="QR코드" class="w-8 h-8 mx-auto border border-gray-200 rounded cursor-pointer hover:scale-150 transition-transform" 
                                     onclick="orderSystem.showQRCodeModal('${product.id}')" title="클릭하여 확대">
                                <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" title="QR 코드 활성"></div>
                            </div>` : 
                            `<div class="w-8 h-8 mx-auto border border-gray-200 rounded bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors" 
                                  onclick="orderSystem.generateQRForProduct('${product.id}')" 
                                  title="클릭하여 QR 코드 생성">
                                <i class="fas fa-qrcode text-gray-400 hover:text-green-600 text-xs transition-colors"></i>
                            </div>`
                        }
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 hidden">${createdDate}</td>
                    <td class="px-4 py-3 text-center">
                        <div class="flex justify-center space-x-2">
                            <button onclick="event.stopPropagation(); orderSystem.editProduct('${product.id}')" 
                                    class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors" 
                                    title="상품 정보 수정">
                                <i class="fas fa-pencil-alt text-sm"></i>
                            </button>
                            <button onclick="event.stopPropagation(); orderSystem.deleteProductWithConfirm('${product.id}')" 
                                    class="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors" 
                                    title="상품 삭제">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 페이지네이션 UI 업데이트
        this.updateProductsPagination();
    }

    // 페이지네이션 UI 업데이트
    updateProductsPagination() {
        // 페이지당 표시 개수 정보 업데이트
        const countInfo = document.getElementById('products-count-info');
        if (countInfo) {
            const totalProducts = this.products.length;
            if (this.productsPerPage === 'all') {
                countInfo.textContent = `총 ${totalProducts}개 상품 (전체 표시)`;
            } else {
                const startIndex = (this.currentProductsPage - 1) * this.productsPerPage + 1;
                const endIndex = Math.min(this.currentProductsPage * this.productsPerPage, totalProducts);
                countInfo.textContent = `${startIndex}-${endIndex} / 총 ${totalProducts}개`;
            }
        }

        // 페이지 네비게이션 업데이트
        this.renderProductsPagination();
        
        // 라벨 인쇄 수량 계산 초기화
        setTimeout(() => {
            this.updateBulkPrintCount();
        }, 100);
    }

    // 페이지 네비게이션 렌더링
    renderProductsPagination() {
        const pagination = document.getElementById('products-pagination');
        if (!pagination) return;

        if (this.productsPerPage === 'all' || this.totalProductsPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 이전 페이지 버튼
        if (this.currentProductsPage > 1) {
            paginationHTML += `
                <button onclick="orderSystem.goToProductsPage(${this.currentProductsPage - 1})" 
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // 페이지 번호 버튼들
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentProductsPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalProductsPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentProductsPage;
            paginationHTML += `
                <button onclick="orderSystem.goToProductsPage(${i})" 
                        class="px-3 py-1 text-sm border ${isActive ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50'} rounded-md transition-colors">
                    ${i}
                </button>
            `;
        }

        // 다음 페이지 버튼
        if (this.currentProductsPage < this.totalProductsPages) {
            paginationHTML += `
                <button onclick="orderSystem.goToProductsPage(${this.currentProductsPage + 1})" 
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        pagination.innerHTML = paginationHTML;
    }

    // 특정 페이지로 이동
    goToProductsPage(page) {
        if (page < 1 || page > this.totalProductsPages) return;
        this.currentProductsPage = page;
        this.renderProductsTable();
    }

    // 페이지당 표시 개수 변경
    changeProductsPerPage(perPage) {
        this.productsPerPage = perPage === 'all' ? 'all' : parseInt(perPage);
        this.currentProductsPage = 1; // 첫 페이지로 리셋
        
        // 사용자 설정 저장
        localStorage.setItem('farm_products_per_page', perPage);
        
        this.renderProductsTable();
    }

    // 수익률 배지 생성
    getProfitMarginBadge(sellPrice, buyPrice) {
        if (!sellPrice || !buyPrice || buyPrice <= 0) {
            return '<span class="text-gray-400 text-xs">-</span>';
        }
        
        if (sellPrice <= buyPrice) {
            return '<span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">📉 손실</span>';
        }
        
        const profit = sellPrice - buyPrice;
        const margin = ((profit / sellPrice) * 100).toFixed(1);
        const marginNum = parseFloat(margin);
        
        let colorClass;
        let icon;
        
        if (marginNum >= 50) {
            colorClass = 'bg-green-100 text-green-800';
            icon = '🚀';
        } else if (marginNum >= 30) {
            colorClass = 'bg-blue-100 text-blue-800';
            icon = '💎';
        } else if (marginNum >= 20) {
            colorClass = 'bg-purple-100 text-purple-800';
            icon = '📈';
        } else if (marginNum >= 10) {
            colorClass = 'bg-yellow-100 text-yellow-800';
            icon = '💰';
        } else {
            colorClass = 'bg-orange-100 text-orange-800';
            icon = '📊';
        }
        
        return `<span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}" title="수익: ${new Intl.NumberFormat('ko-KR').format(profit)}원">${icon} ${margin}%</span>`;
    }

    // 재고 상태 확인
    getStockStatus(stock) {
        if (stock <= 0) {
            return { text: '품절', color: 'bg-red-100 text-red-800' };
        } else if (stock <= 5) {
            return { text: '부족', color: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { text: '충분', color: 'bg-green-100 text-green-800' };
        }
    }

    // 배송 옵션 배지 생성
    getShippingBadge(shippingOption) {
        const options = {
            'free': { text: '무료배송', color: 'bg-blue-100 text-blue-800', icon: 'fas fa-shipping-fast' },
            'included': { text: '배송비포함', color: 'bg-orange-100 text-orange-800', icon: 'fas fa-box' },
            'pickup': { text: '직접수령', color: 'bg-green-100 text-green-800', icon: 'fas fa-store' }
        };
        
        const option = options[shippingOption];
        if (!option) {
            return `<span class="text-gray-400 text-sm">-</span>`;
        }
        
        return `
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${option.color}">
                <i class="${option.icon} mr-1"></i>
                ${option.text}
            </span>
        `;
    }

    // 카테고리별 색상
    getCategoryColor(category) {
        const colors = {
            '희귀종': 'bg-purple-100 text-purple-800',
            '일반종': 'bg-green-100 text-green-800',
            '새싹': 'bg-blue-100 text-blue-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    }

    // 재고 부족 확인 - 비활성화됨
    checkLowStock() {
        // 재고 부족 알림 기능이 제거되었습니다
        return;
    }

    // 사이즈 선택 변경 처리
    handleSizeChange() {
        const sizeSelect = document.getElementById('product-form-size-select');
        const customInput = document.getElementById('product-form-size-custom');
        
        if (sizeSelect.value === 'custom') {
            customInput.classList.remove('hidden');
            customInput.focus();
        } else {
            customInput.classList.add('hidden');
            customInput.value = '';
        }
    }

    // 상품 모달 열기
    openProductModal(productId = null, prefilledName = null) {
        this.currentEditingProduct = productId;
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        
        if (productId) {
            // 기존 상품 수정 모드
            title.textContent = '상품 정보 수정';
            const product = this.products.find(p => p.id === productId);
            if (product) {
                document.getElementById('product-form-name').value = product.name;
                // 카테고리 값 설정 (이름이면 ID로 변환, ID면 그대로 사용)
                const categoryId = this.getCategoryId(product.category);
                document.getElementById('product-form-category').value = categoryId;
                document.getElementById('product-form-price').value = product.price;
                document.getElementById('product-form-wholesale-price').value = product.wholesale_price || '';
                document.getElementById('product-form-stock').value = product.stock;
                document.getElementById('product-form-description').value = product.description || '';
                document.getElementById('product-form-image').value = product.image_url || '';
                document.getElementById('product-form-shipping').value = product.shipping_option || '';
                
                // 수익률 계산 및 표시
                this.calculateModalProfitMargin();
                
                // 사이즈 설정
                const size = product.size || '';
                const standardSizes = ['SX', 'S', 'M', 'L', 'XL'];
                if (standardSizes.includes(size)) {
                    document.getElementById('product-form-size-select').value = size;
                    document.getElementById('product-form-size-custom').classList.add('hidden');
                } else if (size) {
                    document.getElementById('product-form-size-select').value = 'custom';
                    document.getElementById('product-form-size-custom').value = size;
                    document.getElementById('product-form-size-custom').classList.remove('hidden');
                } else {
                    document.getElementById('product-form-size-select').value = '';
                    document.getElementById('product-form-size-custom').classList.add('hidden');
                }
                
                // 태그 설정
                let productTags = [];
                if (product.tags) {
                    if (typeof product.tags === 'string') {
                        try {
                            productTags = JSON.parse(product.tags);
                        } catch (e) {
                            productTags = [];
                        }
                    } else if (Array.isArray(product.tags)) {
                        productTags = product.tags;
                    }
                }
                this.initializeProductTags(productTags);
                
                // QR 코드는 마스터 기능에서만 처리
            }
        } else if (prefilledName) {
            // 주문 등록에서 신규 상품 추가 모드
            title.innerHTML = '<i class="fas fa-plus-circle text-green-600 mr-2"></i>주문 상품 신규 등록';
            document.getElementById('product-form-name').value = prefilledName;
            document.getElementById('product-form-category').value = '';
            document.getElementById('product-form-price').value = '';
            document.getElementById('product-form-wholesale-price').value = '';
            
            // QR 코드는 마스터 기능에서만 처리

            document.getElementById('product-form-stock').value = 1; // 기본 재고 1개
            document.getElementById('product-form-size-select').value = '';
            document.getElementById('product-form-size-custom').value = '';
            document.getElementById('product-form-size-custom').classList.add('hidden');
            document.getElementById('product-form-shipping').value = 'normal'; // 기본 일반배송
            document.getElementById('product-form-description').value = '';
            document.getElementById('product-form-image').value = '';
            
            // 태그 초기화 (빈 배열)
            this.initializeProductTags([]);
            
            // 상단에 안내 메시지 추가
            const modalContent = modal.querySelector('.p-6');
            if (!modalContent.querySelector('.quick-add-notice')) {
                const notice = document.createElement('div');
                notice.className = 'quick-add-notice mb-4 p-3 bg-green-50 border border-green-200 rounded-lg';
                notice.innerHTML = `
                    <div class="flex items-center text-green-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        <span class="font-medium">주문 등록 중 신규 상품 추가</span>
                    </div>
                    <p class="text-sm text-green-700 mt-1">상품 정보를 입력하고 저장하면 자동으로 주문에 추가됩니다.</p>
                `;
                modalContent.insertBefore(notice, modalContent.querySelector('form'));
            }
        } else {
            // 일반 새 상품 등록 모드
            title.textContent = '새 상품 등록';
            document.getElementById('product-form-name').value = '';
            document.getElementById('product-form-category').value = '';
            document.getElementById('product-form-price').value = '';
            document.getElementById('product-form-wholesale-price').value = '';
            document.getElementById('product-form-stock').value = '';
            
            // 수익률 표시 초기화
            document.getElementById('modal-profit-margin').innerHTML = '';
            document.getElementById('product-form-size-select').value = '';
            document.getElementById('product-form-size-custom').value = '';
            document.getElementById('product-form-size-custom').classList.add('hidden');
            document.getElementById('product-form-shipping').value = 'normal'; // 기본값: 일반배송
            document.getElementById('product-form-description').value = '';
            
            // QR 코드는 마스터 기능에서만 처리

            document.getElementById('product-form-image').value = '';
            
            // 태그 초기화 (빈 배열)
            this.initializeProductTags([]);
            
            // 기존 안내 메시지 제거
            const existingNotice = modal.querySelector('.quick-add-notice');
            if (existingNotice) {
                existingNotice.remove();
            }
        }

        // 카테고리 데이터를 다시 로드한 후 드롭다운 업데이트
        this.loadCategories().then(() => {
            this.updateCategorySelects();
            
            // 주문에서 온 경우 상품명 필드에 포커스
            if (prefilledName) {
                setTimeout(() => {
                    document.getElementById('product-form-price').focus();
                }, 200);
            }
        });
        
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        // 모바일 터치 이벤트 방지
        document.body.style.overflow = 'hidden';
    }

    // 상품 저장
    async saveProduct() {
        // 사이즈 값 결정
        const sizeSelect = document.getElementById('product-form-size-select').value;
        const customSize = document.getElementById('product-form-size-custom').value.trim();
        const finalSize = sizeSelect === 'custom' ? customSize : sizeSelect;

        // 태그 데이터 가져오기
        const tagsData = this.currentProductTags || [];
        
        const productData = {
            name: document.getElementById('product-form-name').value.trim(),
            category: this.getCategoryName(document.getElementById('product-form-category').value), // 카테고리 이름으로 통일
            price: parseInt(document.getElementById('product-form-price').value) || 0,
            wholesale_price: parseInt(document.getElementById('product-form-wholesale-price').value) || 0,
            stock: parseInt(document.getElementById('product-form-stock').value) || 0,
            size: finalSize,
            shipping_option: document.getElementById('product-form-shipping').value,
            description: document.getElementById('product-form-description').value.trim(),
            image_url: document.getElementById('product-form-image').value.trim(),
            tags: tagsData,  // 태그 배열 추가
            qr_code: '', // QR 코드 통일 필드
            qr_enabled: false // QR 생성 여부 통일 필드
        };

        // 필수 필드 검증
        if (!productData.name) {
            alert('상품명을 입력해주세요.');
            return;
        }

        // 카테고리 검증 강화
        const categoryValue = document.getElementById('product-form-category').value;
        console.log('🔍 카테고리 선택값:', categoryValue);
        console.log('🔍 변환된 카테고리명:', productData.category);
        
        if (!categoryValue || !productData.category) {
            // 기본 카테고리 자동 설정 (빈 값일 때)
            if (this.categories && this.categories.length > 0) {
                const defaultCategory = this.categories[0];
                productData.category = defaultCategory.name;
                console.log('⚙️ 기본 카테고리 자동 설정:', defaultCategory.name);
                
                // 폼에도 반영
                document.getElementById('product-form-category').value = defaultCategory.id || defaultCategory.name;
            } else {
                alert('카테고리를 선택해주세요.\n\n💡 팁: 카테고리가 없다면 먼저 카테고리를 생성해주세요.');
                return;
            }
        }

        if (productData.price <= 0) {
            alert('판매가를 올바르게 입력해주세요.');
            return;
        }

        if (!productData.shipping_option) {
            alert('배송 옵션을 선택해주세요.');
            return;
        }

        // QR 코드는 마스터 기능에서만 생성

        // 상품명 중복 검증 (수정 시 자신 제외)
        const existingProduct = this.products.find(p => 
            p.name === productData.name && p.id !== this.currentEditingProduct
        );
        
        if (existingProduct) {
            alert('이미 등록된 상품명입니다.');
            return;
        }

        // 🛡️ 데이터 손실 방지: 수정 전 백업 생성
        let backupProduct = null;
        if (this.currentEditingProduct) {
            backupProduct = JSON.parse(JSON.stringify(
                this.products.find(p => p.id === this.currentEditingProduct)
            ));
            console.log('🛡️ 상품 수정 전 백업 생성:', backupProduct?.name);
        }

        try {
            // QR 코드 생성 (새 상품이거나 판매가가 변경된 경우)
            let shouldGenerateQR = !this.currentEditingProduct; // 새 상품인 경우
            
            if (this.currentEditingProduct) {
                // 기존 상품 수정 - 판매가가 변경되었는지 확인
                const existingProduct = this.products.find(p => p.id === this.currentEditingProduct);
                if (existingProduct && existingProduct.price !== productData.price) {
                    shouldGenerateQR = true;
                }
            }
            
            // QR 코드 생성은 선택사항으로 처리 (실패해도 상품등록 계속)
            if (shouldGenerateQR) {
                try {
                    console.log('🔄 QR 코드 생성 시도...');
                    
                    // QRious 라이브러리 존재 확인
                    if (typeof QRious === 'undefined' || window.QRCodeDisabled) {
                        console.warn('⚠️ QR 코드 기능 비활성화 - 상품등록 계속 진행');
                        productData.qr_code = '';
                    } else {
                        console.log('📱 QR 코드 생성 건너뜀 (시스템 안정성 우선)');
                        productData.qr_code = '';
                    }
                } catch (qrError) {
                    console.warn('⚠️ QR 코드 생성 실패했지만 상품등록은 계속 진행:', qrError.message);
                    productData.qr_code = ''; // 실패 시 빈 값으로 처리
                    
                    // 사용자에게 알림 (선택적)
                    if (qrError.message.includes('QRious')) {
                        console.log('💡 QR 코드 없이 상품이 등록됩니다. 나중에 QR 생성 가능합니다.');
                    }
                    
                    // QR 코드 실패를 전역에 기록 (디버깅용)
                    window.lastQRError = qrError.message;
                    
                    // 사용자에게 알림 (방해하지 않는 방식)
                    setTimeout(() => {
                        this.showToast('ℹ️ QR 코드 생성은 실패했지만 상품은 정상 등록되었습니다.', 'info');
                    }, 1000);
                }
            } else if (this.currentEditingProduct) {
                // 수정이고 QR 생성이 필요 없으면 기존 QR 코드 유지
                const existingProduct = this.products.find(p => p.id === this.currentEditingProduct);
                if (existingProduct && existingProduct.qr_code) {
                    productData.qr_code = existingProduct.qr_code;
                }
            }
            
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                let response;
                
                if (this.currentEditingProduct) {
                    // 상품 수정 - 기존 상품 데이터와 병합
                    const existingProduct = this.products.find(p => p.id === this.currentEditingProduct);
                    if (!existingProduct) {
                        throw new Error('수정할 상품을 찾을 수 없습니다.');
                    }
                    
                    // 기존 데이터 + 새 데이터 병합 (시스템 필드 보존)
                    const updateData = {
                        ...existingProduct,  // 기존 데이터 (id, created_at 등 시스템 필드 포함)
                        ...productData,      // 새로운 데이터
                        id: this.currentEditingProduct,  // ID 명시적 설정
                        updated_at: Date.now()           // 수정 시간 업데이트
                    };
                    
                    console.log('🔄 상품 수정 API 호출:', updateData);
                    response = await fetch(this.getApiUrl(`products/${this.currentEditingProduct}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(updateData)
                    });
                } else {
                    // 새 상품 등록
                    response = await fetch(this.getApiUrl('products'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(productData)
                    });
                }

                if (response.ok) {
                    apiSuccess = true;
                    const result = await response.json();
                    console.log('✅ API로 상품 저장 성공:', result);
                    
                    // API 성공 시 로컬 데이터도 동기화
                    if (this.currentEditingProduct) {
                        // 상품 수정 - 로컬 데이터 업데이트
                        const productIndex = this.products.findIndex(p => p.id === this.currentEditingProduct);
                        if (productIndex !== -1) {
                            const existingProduct = this.products[productIndex];
                            this.products[productIndex] = {
                                ...existingProduct,
                                ...productData,
                                id: this.currentEditingProduct,
                                updated_at: Date.now()
                            };
                            await this.saveToStorage('products', this.products);
                            console.log('🔄 API 성공 후 로컬 데이터 동기화 완료');
                        }
                    }
                } else {
                    const errorText = await response.text();
                    console.error('❌ API 응답 오류:', response.status, errorText);
                    throw new Error(`API 오류: ${response.status} - ${errorText}`);
                }
            } catch (apiError) {
                console.warn('API 저장 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에 저장
            if (!apiSuccess) {
                if (this.currentEditingProduct) {
                    // 상품 수정 - 기존 데이터 보존하며 업데이트
                    const productIndex = this.products.findIndex(p => p.id === this.currentEditingProduct);
                    if (productIndex !== -1) {
                        const existingProduct = this.products[productIndex];
                        this.products[productIndex] = { 
                            ...existingProduct,     // 기존 데이터 보존
                            ...productData,         // 새 데이터 적용
                            id: this.currentEditingProduct,  // ID 보존
                            updated_at: Date.now()           // 수정 시간 업데이트
                        };
                        console.log('✅ LocalStorage 상품 수정 완료:', this.products[productIndex]);
                    } else {
                        console.error('❌ 수정할 상품을 찾을 수 없습니다:', this.currentEditingProduct);
                    }
                } else {
                    // 새 상품 등록
                    productData.id = Date.now().toString();
                    productData.created_at = Date.now();
                    productData.updated_at = Date.now();
                    this.products.push(productData);
                    console.log('✅ LocalStorage 새 상품 등록 완료:', productData);
                }
                await this.saveToStorage('products', this.products);
            }

            // 주문 등록에서 온 경우 자동으로 주문에 추가
            const isFromOrder = this.tempOrderContext && this.tempOrderContext.fromOrderRegistration;
            
            if (isFromOrder) {
                // 저장된 상품을 바로 주문에 추가
                const newProduct = this.currentEditingProduct ? 
                    this.products.find(p => p.id === this.currentEditingProduct) :
                    { ...productData, id: productData.id || Date.now().toString() };
                
                if (newProduct) {
                    this.showToast('✅ 새 상품이 등록되어 주문에 추가되었습니다!', 'success');
                    this.closeProductModal();
                    
                    // 상품 목록 새로고침
                    await this.loadProducts();
                    
                    // 주문 등록 모달로 되돌아가서 상품 자동 선택
                    setTimeout(() => {
                        // 상품 검색 필드에 새로 등록한 상품명 입력
                        const productSearchInput = document.getElementById('product-search');
                        if (productSearchInput) {
                            productSearchInput.value = newProduct.name;
                            // 자동으로 주문 아이템에 추가
                            this.selectProduct(newProduct.id);
                        }
                        
                        // 임시 컨텍스트 초기화
                        this.tempOrderContext = null;
                    }, 300);
                } else {
                    this.showToast('❌ 상품 등록 후 주문 추가 중 오류가 발생했습니다.', 'error');
                }
            } else {
                // 일반 상품 등록 완료
                this.showToast(this.currentEditingProduct ? '✅ 상품 정보가 수정되었습니다!' : '✅ 새 상품이 등록되었습니다!', 'success');
                this.closeProductModal();
                
                // 상품관리 탭에 있다면 즉시 테이블 새로고침
                const currentTab = this.getCurrentActiveTab();
                if (currentTab === 'tab-products') {
                    console.log('🔄 상품관리 탭에서 즉시 테이블 새로고침');
                    this.renderProductsTable();
                } else {
                    // 다른 탭에 있다면 데이터만 로드
                    await this.loadProducts();
                }
            }
            
        } catch (error) {
            console.error('❌ 상품 저장 중 치명적 오류:', error);
            
            // 🛡️ 백업 데이터 복구
            if (backupProduct && this.currentEditingProduct) {
                console.log('🔄 백업 데이터로 복구 시도...');
                const productIndex = this.products.findIndex(p => p.id === this.currentEditingProduct);
                if (productIndex !== -1) {
                    this.products[productIndex] = backupProduct;
                    await this.saveToStorage('products', this.products);
                    console.log('✅ 백업 데이터로 복구 완료:', backupProduct.name);
                }
            }
            
            this.showToast(`❌ 저장 중 오류가 발생했습니다.\n${backupProduct ? '데이터는 백업으로 복구되었습니다.' : ''}`, 'error');
        }
    }

    // 상품 수정
    editProduct(productId) {
        this.openProductModal(productId);
    }

    // 재고 조정
    async adjustStock(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const currentStock = product.stock;
        const newStock = prompt(`"${product.name}"의 재고를 조정하세요.\n\n현재 재고: ${currentStock}개\n새 재고량:`, currentStock);
        
        if (newStock === null) return;
        
        const stockNumber = parseInt(newStock);
        if (isNaN(stockNumber) || stockNumber < 0) {
            alert('올바른 재고수량을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(this.getApiUrl(`products/${productId}`), {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ stock: stockNumber })
            });

            if (response.ok) {
                const changeText = stockNumber > currentStock ? 
                    `+${stockNumber - currentStock}개 추가` : 
                    stockNumber < currentStock ? 
                    `${currentStock - stockNumber}개 감소` : 
                    '변경 없음';
                
                alert(`재고가 조정되었습니다.\n${currentStock}개 → ${stockNumber}개 (${changeText})`);
                await this.loadProducts();
            } else {
                throw new Error('재고 조정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('재고 조정 중 오류가 발생했습니다.');
        }
    }

    // 상품 삭제 (영구 삭제 확인 팝업 포함)
    async deleteProductWithConfirm(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('상품 정보를 찾을 수 없습니다.');
            return;
        }

        // 해당 상품과 연결된 주문이 있는지 확인
        const relatedOrders = this.orders.filter(order => 
            order.order_items && order.order_items.some(item => item.productId === productId)
        );
        
        let confirmMessage = `정말로 "${product.name}" 상품을 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`;
        
        if (relatedOrders.length > 0) {
            confirmMessage += `\n\n📋 주의: 이 상품과 연결된 ${relatedOrders.length}개의 주문 내역이 있습니다.\n상품이 삭제되어도 주문 내역은 유지됩니다.`;
        }

        // 영구 삭제 최종 확인 팝업
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            // API 삭제 시도
            let apiSuccess = false;
            try {
                const response = await fetch(this.getApiUrl(`products/${productId}`), {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log('상품 API 삭제 성공');
                    apiSuccess = true;
                } else {
                    throw new Error(`API 삭제 실패: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('상품 API 삭제 실패, LocalStorage에서 삭제:', apiError);
            }

            // LocalStorage에서 삭제
            this.products = this.products.filter(p => p.id !== productId);
            await this.saveToStorage('products', this.products);

            // UI 업데이트
            this.renderProductsTable();
            
            // 성공 알림
            this.showToast(`🗑️ "${product.name}" 상품이 영구 삭제되었습니다.`);

        } catch (error) {
            console.error('상품 삭제 중 오류 발생:', error);
            alert('상품 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // 상품 삭제 (기존 함수 유지)
    async deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (!confirm(`정말로 "${product.name}" 상품을 삭제하시겠습니까?\n\n삭제된 상품은 복구할 수 없습니다.`)) {
            return;
        }

        try {
            const response = await fetch(this.getApiUrl(`products/${productId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('상품이 삭제되었습니다.');
                await this.loadProducts();
            } else {
                throw new Error('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }

    // 상품 검색 입력 처리
    handleProductSearchInput(query) {
        const suggestionsDiv = document.getElementById('product-search-suggestions');
        const addButton = document.getElementById('add-product-from-search');
        const categoryFilter = document.getElementById('category-filter').value;
        
        if (!query.trim()) {
            suggestionsDiv.classList.add('hidden');
            addButton.classList.add('hidden');
            this.applyProductFilters('', categoryFilter);
            return;
        }

        // 실시간 검색 - 한글자부터 검색
        let filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );

        // 카테고리 필터 적용 (통일된 방식)
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(product => {
                const productCategoryName = this.getCategoryName(product.category);
                const filterCategoryName = this.getCategoryName(categoryFilter);
                return productCategoryName === filterCategoryName;
            });
        }

        // 테이블 필터링
        if (filteredProducts.length === 0) {
            // 검색 결과 없음 - 테이블에 메시지 표시
            const tbody = document.getElementById('products-table-body');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-search text-4xl mb-2 opacity-50"></i>
                        <p>"${query}"에 대한 검색 결과가 없습니다.</p>
                        <p class="text-sm">위의 🌿 버튼을 클릭하여 새 상품을 등록하세요.</p>
                    </td>
                </tr>
            `;
            
            // 신규 상품 추가 버튼 표시
            addButton.classList.remove('hidden');
            suggestionsDiv.classList.add('hidden');
        } else {
            // 검색 결과 있음 - 테이블 필터링 및 자동완성 표시
            const originalProducts = this.products;
            this.products = filteredProducts;
            this.renderProductsTable();
            // this.checkLowStock(); // 재고 부족 알림 제거됨
            this.products = originalProducts;
            
            // 자동완성 드롭다운 표시 (상위 5개만)
            const topResults = filteredProducts.slice(0, 5);
            suggestionsDiv.innerHTML = topResults.map(product => {
                const stockStatus = this.getStockStatus(product.stock);
                const categoryName = this.getCategoryName(product.category); // 카테고리 이름 통일
                const categoryColor = this.getCategoryColor(categoryName);
                
                return `
                    <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                         onclick="orderSystem.selectProductFromSearch('${product.id}')"
                         title="클릭하여 상품 정보 확인">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                ${product.image_url ? 
                                    `<img src="${product.image_url}" alt="${product.name}" class="w-10 h-10 rounded object-cover mr-3 border">` : 
                                    `<div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3 border"><i class="fas fa-leaf text-gray-400"></i></div>`
                                }
                                <div>
                                    <div class="font-medium text-gray-900">${product.name}</div>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColor}">
                                            ${categoryName}
                                        </span>
                                        <span class="text-sm text-gray-600">${new Intl.NumberFormat('ko-KR').format(product.price)}원</span>
                                    </div>
                                    ${product.description ? `<div class="text-xs text-gray-500 mt-1">${product.description.length > 40 ? product.description.substring(0, 40) + '...' : product.description}</div>` : ''}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-600">${product.stock}개</div>
                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}">
                                    ${stockStatus.text}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            if (filteredProducts.length > 5) {
                suggestionsDiv.innerHTML += `
                    <div class="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        +${filteredProducts.length - 5}개 더 있음 (테이블에서 확인)
                    </div>
                `;
            }
            
            suggestionsDiv.classList.remove('hidden');
            addButton.classList.add('hidden');
        }
    }

    // 상품 필터 적용 (카테고리만 또는 전체 초기화)
    applyProductFilters(query, categoryFilter) {
        let filteredProducts = this.products;

        if (query) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
            );
        }

        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(product => 
                product.category === categoryFilter
            );
        }

        // 테이블 업데이트
        const originalProducts = this.products;
        this.products = filteredProducts;
        this.renderProductsTable();
        // this.checkLowStock(); // 재고 부족 알림 제거됨
        this.products = originalProducts;
    }

    // 엔터키 처리 (주문 등록용)
    handleProductSearchEnter() {
        const query = document.getElementById('product-search').value.trim();
        if (!query) return;

        const exactMatch = this.products.find(p => 
            p.name.toLowerCase() === query.toLowerCase()
        );

        if (exactMatch) {
            this.selectProductFromSearch(exactMatch.id);
        } else {
            this.addProductFromSearch();
        }
    }

    // 엔터키 처리 (상품관리용)
    handleProductManagementSearchEnter() {
        const query = document.getElementById('product-management-search').value.trim();
        if (!query) return;

        const exactMatch = this.products.find(p => 
            p.name.toLowerCase() === query.toLowerCase()
        );

        if (exactMatch) {
            // 기존 상품이 있으면 테이블에서 해당 상품만 표시
            const categoryFilter = document.getElementById('category-filter').value;
            this.applyProductFilters(query, categoryFilter);
        } else {
            // 없는 상품이면 새 상품 등록 모달 열기
            this.addProductFromManagementSearch();
        }
    }

    // 검색에서 상품 선택
    selectProductFromSearch(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // 상품 수정 모달 열기
        this.editProduct(productId);
        
        // 검색 초기화
        document.getElementById('product-search').value = product.name;
        document.getElementById('product-search-suggestions').classList.add('hidden');
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-edit mr-2"></i>
                <span>"${product.name}" 상품 정보 열림</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    // 검색에서 신규 상품 추가
    addProductFromSearch() {
        const query = document.getElementById('product-search').value.trim();
        if (!query) return;

        // 새 상품 모달 열기
        this.openProductModal();
        
        // 검색어를 상품명으로 설정
        setTimeout(() => {
            const nameField = document.getElementById('product-form-name');
            if (nameField) {
                nameField.value = query;
                // 카테고리 필드로 포커스
                document.getElementById('product-form-category').focus();
            }
        }, 100);
        
        // 검색 초기화
        document.getElementById('product-search-suggestions').classList.add('hidden');
        document.getElementById('add-product-from-search').classList.add('hidden');
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-leaf mr-2"></i>
                <span>"${query}" 신규 상품 등록 시작</span>
            </div>
            <div class="text-sm mt-1">카테고리, 판매가 등 추가 정보를 입력해주세요</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // 상품관리 검색에서 새 상품 등록
    addProductFromManagementSearch() {
        const query = document.getElementById('product-management-search').value.trim();
        if (!query) return;

        // 새 상품 모달 열기
        this.openProductModal();
        
        // 검색어를 상품명으로 설정
        setTimeout(() => {
            const nameField = document.getElementById('product-form-name');
            if (nameField) {
                nameField.value = query;
                // 카테고리 필드로 포커스
                document.getElementById('product-form-category').focus();
            }
        }, 100);
        
        // 검색 초기화
        document.getElementById('product-management-search').value = '';
        const suggestionsDiv = document.getElementById('product-search-suggestions');
        const addButton = document.getElementById('add-product-from-search');
        if (suggestionsDiv) suggestionsDiv.classList.add('hidden');
        if (addButton) addButton.classList.add('hidden');
        
        // 알림 표시
        this.showToast(`🌱 "${query}" 신규 상품 등록을 시작합니다!`, 'success');
    }

    // 기존 상품 검색 (호환성 유지)
    searchProducts() {
        this.handleProductSearchInput(document.getElementById('product-search').value);
    }

    // 상품 모달 닫기
    closeProductModal() {
        document.getElementById('product-modal').classList.add('hidden');
        this.currentEditingProduct = null;
    }

    // === 주문관리용 상품 선택 기능들 ===

    // 상품 목록 모달 표시
    showProductList() {
        document.getElementById('product-list-modal').classList.remove('hidden');
        this.renderProductList();
        
        // 검색 이벤트 설정
        const productListSearch = document.getElementById('product-list-search');
        if (productListSearch) {
            productListSearch.addEventListener('input', () => {
                this.filterProductList();
            });
        }
        
        const productListCategory = document.getElementById('product-list-category');
        if (productListCategory) {
            productListCategory.addEventListener('change', () => {
                this.filterProductList();
            });
        }
    }

    // 상품 목록 렌더링
    renderProductList(filteredProducts = null) {
        const container = document.getElementById('product-list-container');
        const productsToShow = filteredProducts || this.products;
        
        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-leaf text-4xl mb-2 opacity-50"></i>
                    <p>표시할 상품이 없습니다.</p>
                    <p class="text-sm">다른 검색 조건을 시도해보세요.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${productsToShow.map(product => {
                    const stockStatus = this.getStockStatus(product.stock);
                    const categoryColor = this.getCategoryColor(product.category);
                    const isInOrder = this.currentOrderItems.some(item => item.name === product.name);
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isInOrder ? 'bg-green-50 border-green-300' : ''}">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start space-x-3 flex-1">
                                    ${product.image_url ? 
                                        `<img src="${product.image_url}" alt="${product.name}" class="w-16 h-16 rounded-lg object-cover border border-gray-200">` : 
                                        `<div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200"><i class="fas fa-leaf text-gray-400 text-xl"></i></div>`
                                    }
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-medium text-gray-900 truncate">${product.name}</h4>
                                        <div class="flex items-center space-x-2 mt-1">
                                            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColor}">
                                                ${product.category}
                                            </span>
                                            ${product.size ? 
                                                `<span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                                    ${product.size}
                                                </span>` : ''
                                            }
                                            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}">
                                                ${stockStatus.text}
                                            </span>
                                        </div>
                                        <div class="text-lg font-semibold text-green-600 mt-1">
                                            ${new Intl.NumberFormat('ko-KR').format(product.price)}원
                                        </div>
                                        <div class="text-sm text-gray-600">재고: ${product.stock}개</div>
                                        ${product.description ? `<div class="text-sm text-gray-500 mt-1 line-clamp-2">${product.description}</div>` : ''}
                                    </div>
                                </div>
                                <div class="ml-4 flex flex-col space-y-2">
                                    ${isInOrder ? 
                                        `<span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            <i class="fas fa-check mr-1"></i>주문에 포함됨
                                        </span>` : 
                                        `<button onclick="orderSystem.addProductToOrder('${product.id}')" 
                                                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors ${product.stock <= 0 ? 'opacity-50' : ''}"
                                                ${product.stock <= 0 ? 'title="품절된 상품입니다"' : ''}>
                                            <i class="fas fa-plus mr-1"></i>추가
                                        </button>`
                                    }
                                    <button onclick="orderSystem.addProductToOrderWithQuantity('${product.id}')" 
                                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                        <i class="fas fa-edit mr-1"></i>수량 지정
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 상품 목록 필터링
    filterProductList() {
        const searchQuery = document.getElementById('product-list-search').value.trim().toLowerCase();
        const categoryFilter = document.getElementById('product-list-category').value;
        
        let filteredProducts = this.products;

        // 텍스트 검색
        if (searchQuery) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchQuery) ||
                (product.description && product.description.toLowerCase().includes(searchQuery))
            );
        }

        // 카테고리 필터
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(product => 
                product.category === categoryFilter
            );
        }

        this.renderProductList(filteredProducts);
    }

    // 상품을 주문에 추가 (기본 수량 1)
    addProductToOrder(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // 이미 주문에 있는지 확인
        const existingItem = this.currentOrderItems.find(item => item.name === product.name);
        if (existingItem) {
            // 기존 아이템 수량 증가
            existingItem.quantity += 1;
            existingItem.total = existingItem.price * existingItem.quantity;
        } else {
            // 새 아이템 추가
            const newItem = {
                id: Date.now(),
                name: product.name,
                size: product.size,
                quantity: 1,
                price: product.price,
                total: product.price
            };
            this.currentOrderItems.push(newItem);
        }

        this.renderOrderItems();
        this.renderProductList(); // 상품 목록 업데이트 (주문에 포함됨 표시)
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check mr-2"></i>
                <span>"${product.name}" 주문에 추가됨</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    // 상품을 주문에 추가 (수량 지정)
    addProductToOrderWithQuantity(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const quantity = prompt(`"${product.name}"의 수량을 입력하세요:`, '1');
        if (quantity === null) return;
        
        const quantityNumber = parseInt(quantity) || 1;
        if (quantityNumber <= 0) {
            alert('올바른 수량을 입력해주세요.');
            return;
        }

        // 재고 확인
        if (quantityNumber > product.stock && product.stock > 0) {
            if (!confirm(`재고(${product.stock}개)보다 많은 수량(${quantityNumber}개)입니다.\n그래도 추가하시겠습니까?`)) {
                return;
            }
        }

        // 이미 주문에 있는지 확인
        const existingItem = this.currentOrderItems.find(item => item.name === product.name);
        if (existingItem) {
            // 기존 아이템 수량 업데이트
            existingItem.quantity = quantityNumber;
            existingItem.total = existingItem.price * existingItem.quantity;
        } else {
            // 새 아이템 추가
            const newItem = {
                id: Date.now(),
                name: product.name,
                size: product.size,
                quantity: quantityNumber,
                price: product.price,
                total: product.price * quantityNumber
            };
            this.currentOrderItems.push(newItem);
        }

        this.renderOrderItems();
        this.renderProductList(); // 상품 목록 업데이트
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-edit mr-2"></i>
                <span>"${product.name}" ${quantityNumber}개 주문에 추가됨</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    // 상품 목록 모달 닫기
    closeProductListModal() {
        document.getElementById('product-list-modal').classList.add('hidden');
        
        // 검색 초기화
        document.getElementById('product-list-search').value = '';
        document.getElementById('product-list-category').value = '';
    }

    // === 카테고리 관리 기능들 ===

    // 카테고리 모달 열기
    openCategoryModal() {
        document.getElementById('category-modal').classList.remove('hidden');
        this.renderCategoriesList();
    }

    // 카테고리 목록 렌더링
    renderCategoriesList() {
        const container = document.getElementById('categories-list');
        
        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-tags text-4xl mb-2 opacity-50"></i>
                    <p>등록된 카테고리가 없습니다.</p>
                </div>
            `;
            return;
        }

        // 정렬 순서대로 표시
        const sortedCategories = [...this.categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        container.innerHTML = sortedCategories.map((category, index) => `
            <div data-category-id="${category.id}" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center space-x-3 flex-1">
                    <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full ${category.color}">
                        ${category.name}
                    </span>
                    <span class="text-sm text-gray-600 flex-1">${category.description || '설명 없음'}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="orderSystem.moveCategory('${category.id}', 'up')" 
                            class="text-gray-400 hover:text-gray-600 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${index === 0 ? 'disabled' : ''} title="위로 이동">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button onclick="orderSystem.moveCategory('${category.id}', 'down')" 
                            class="text-gray-400 hover:text-gray-600 ${index === sortedCategories.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${index === sortedCategories.length - 1 ? 'disabled' : ''} title="아래로 이동">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button onclick="orderSystem.editCategory('${category.id}')" 
                            class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors" title="이름, 색상, 설명 수정">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="orderSystem.deleteCategory('${category.id}')" 
                            class="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors" title="카테고리 삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 새 카테고리 추가
    async addCategory() {
        // 중복 실행 방지
        if (this.addingCategory) {
            console.log('⚠️ 카테고리 추가 중 - 중복 실행 방지');
            return;
        }
        
        this.addingCategory = true;
        console.log('🔄 카테고리 추가 함수 호출됨');
        
        const nameInput = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const descriptionInput = document.getElementById('new-category-description');
        
        if (!nameInput || !colorInput || !descriptionInput) {
            console.error('❌ 카테고리 입력 필드를 찾을 수 없음');
            alert('카테고리 입력 필드를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        const name = nameInput.value.trim();
        const color = colorInput.value;
        const description = descriptionInput.value.trim();
        
        console.log('📝 입력된 데이터:', { name, color, description });

        if (!name) {
            alert('카테고리명을 입력해주세요.');
            return;
        }

        // 중복 확인
        if (this.categories.some(c => c.name === name)) {
            alert('이미 존재하는 카테고리명입니다.');
            return;
        }

        const categoryData = {
            name: name,
            color: color,
            description: description,
            sort_order: this.categories.length + 1
        };

        try {
            console.log('카테고리 데이터 전송:', categoryData);
            
            // API 먼저 시도
            let apiSuccess = false;
            try {
                const response = await fetch(this.getApiUrl('categories'), {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(categoryData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('API로 생성된 카테고리:', result);
                    apiSuccess = true;
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('API 저장 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에 저장
            if (!apiSuccess) {
                categoryData.id = Date.now().toString();
                this.categories.push(categoryData);
                this.saveToLocalStorage('categories', this.categories);
                console.log('LocalStorage에 저장됨');
            }
            
            // 입력 필드 초기화
            document.getElementById('new-category-name').value = '';
            document.getElementById('new-category-description').value = '';
            
            await this.loadCategories();
            this.renderCategoriesList();
            
            alert(`"${name}" 카테고리가 추가되었습니다.`);
            
        } catch (error) {
            console.error('카테고리 추가 오류 상세:', error);
            alert(`카테고리 추가 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            // 플래그 해제
            this.addingCategory = false;
        }
    }

    // 카테고리 순서 변경
    async moveCategory(categoryId, direction) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        const sortedCategories = [...this.categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const currentIndex = sortedCategories.findIndex(c => c.id === categoryId);
        
        if (direction === 'up' && currentIndex > 0) {
            // 위쪽 카테고리와 순서 교체
            const targetCategory = sortedCategories[currentIndex - 1];
            await this.updateCategoryOrder(category.id, targetCategory.sort_order);
            await this.updateCategoryOrder(targetCategory.id, category.sort_order);
        } else if (direction === 'down' && currentIndex < sortedCategories.length - 1) {
            // 아래쪽 카테고리와 순서 교체
            const targetCategory = sortedCategories[currentIndex + 1];
            await this.updateCategoryOrder(category.id, targetCategory.sort_order);
            await this.updateCategoryOrder(targetCategory.id, category.sort_order);
        }

        await this.loadCategories();
        this.renderCategoriesList();
    }

    // 카테고리 순서 업데이트
    async updateCategoryOrder(categoryId, newOrder) {
        try {
            await fetch(this.getApiUrl(`tables/farm_categories/${categoryId}`), {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ sort_order: newOrder })
            });
        } catch (error) {
            console.error('Error updating category order:', error);
        }
    }

    // 카테고리 변경사항 저장
    async saveCategoryChanges() {
        console.log('🔄 카테고리 변경사항 저장 시작');
        
        try {
            // 현재 카테고리 목록을 순서대로 정렬
            const sortedCategories = [...this.categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            
            let hasChanges = false;
            const updatePromises = [];
            
            // 각 카테고리의 순서를 업데이트
            for (let i = 0; i < sortedCategories.length; i++) {
                const category = sortedCategories[i];
                const newOrder = i + 1;
                
                if (category.sort_order !== newOrder) {
                    hasChanges = true;
                    console.log(`카테고리 "${category.name}" 순서 변경: ${category.sort_order} → ${newOrder}`);
                    
                    // API 업데이트 시도
                    const updatePromise = this.updateCategoryOrder(category.id, newOrder)
                        .then(() => {
                            category.sort_order = newOrder;
                        })
                        .catch(error => {
                            console.warn(`카테고리 ${category.id} 순서 업데이트 실패:`, error);
                            // LocalStorage에 저장
                            category.sort_order = newOrder;
                        });
                    
                    updatePromises.push(updatePromise);
                }
            }
            
            // 모든 업데이트 완료 대기
            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }
            
            // LocalStorage에 저장
            this.saveToLocalStorage('categories', this.categories);
            
            if (hasChanges) {
                console.log('✅ 카테고리 변경사항 저장 완료');
                return true;
            } else {
                console.log('ℹ️ 저장할 카테고리 변경사항이 없습니다');
                return false;
            }
            
        } catch (error) {
            console.error('❌ 카테고리 저장 중 오류:', error);
            throw error;
        }
    }

    // 카테고리 수정
    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        // 인라인 편집 폼으로 변환
        this.showCategoryEditForm(categoryId, category);
    }

    // 카테고리 인라인 편집 폼 표시
    showCategoryEditForm(categoryId, category) {
        const container = document.getElementById('categories-list');
        const categoryElement = container.querySelector(`[data-category-id="${categoryId}"]`);
        
        if (categoryElement) {
            // 기존 요소를 편집 폼으로 교체
            categoryElement.innerHTML = `
                <div class="flex items-center justify-between p-3 border-2 border-blue-300 rounded-lg bg-blue-50">
                    <div class="flex-1 space-y-3">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">카테고리명</label>
                                <input type="text" id="edit-category-name-${categoryId}" value="${category.name}" 
                                       class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">색상</label>
                                <select id="edit-category-color-${categoryId}" class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="bg-purple-100 text-purple-800" ${category.color === 'bg-purple-100 text-purple-800' ? 'selected' : ''}>보라색</option>
                                    <option value="bg-green-100 text-green-800" ${category.color === 'bg-green-100 text-green-800' ? 'selected' : ''}>초록색</option>
                                    <option value="bg-blue-100 text-blue-800" ${category.color === 'bg-blue-100 text-blue-800' ? 'selected' : ''}>파란색</option>
                                    <option value="bg-red-100 text-red-800" ${category.color === 'bg-red-100 text-red-800' ? 'selected' : ''}>빨간색</option>
                                    <option value="bg-yellow-100 text-yellow-800" ${category.color === 'bg-yellow-100 text-yellow-800' ? 'selected' : ''}>노란색</option>
                                    <option value="bg-indigo-100 text-indigo-800" ${category.color === 'bg-indigo-100 text-indigo-800' ? 'selected' : ''}>남색</option>
                                    <option value="bg-pink-100 text-pink-800" ${category.color === 'bg-pink-100 text-pink-800' ? 'selected' : ''}>핑크색</option>
                                    <option value="bg-gray-100 text-gray-800" ${category.color === 'bg-gray-100 text-gray-800' ? 'selected' : ''}>회색</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">설명</label>
                            <input type="text" id="edit-category-description-${categoryId}" value="${category.description || ''}" 
                                   placeholder="카테고리에 대한 간단한 설명"
                                   class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2 ml-4">
                        <button onclick="orderSystem.saveCategoryEdit('${categoryId}')" 
                                class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors" title="저장">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="orderSystem.cancelCategoryEdit()" 
                                class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors" title="취소">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                document.getElementById(`edit-category-name-${categoryId}`).focus();
                document.getElementById(`edit-category-name-${categoryId}`).select();
            }, 100);
        }
    }

    // 카테고리 편집 저장
    async saveCategoryEdit(categoryId) {
        const nameInput = document.getElementById(`edit-category-name-${categoryId}`);
        const colorSelect = document.getElementById(`edit-category-color-${categoryId}`);
        const descriptionInput = document.getElementById(`edit-category-description-${categoryId}`);
        
        if (!nameInput || !colorSelect || !descriptionInput) return;
        
        const newName = nameInput.value.trim();
        const newColor = colorSelect.value;
        const newDescription = descriptionInput.value.trim();
        
        if (!newName) {
            alert('카테고리명을 입력해주세요.');
            nameInput.focus();
            return;
        }

        // 중복 확인 (자신 제외)
        if (this.categories.some(c => c.name === newName && c.id !== categoryId)) {
            alert('이미 존재하는 카테고리명입니다.');
            nameInput.focus();
            nameInput.select();
            return;
        }

        // 카테고리 업데이트
        await this.updateCategory(categoryId, {
            name: newName,
            color: newColor,
            description: newDescription
        });
        
        // 목록 새로고침
        this.renderCategoriesList();
        
        // 상품 카테고리 드롭다운도 업데이트
        this.updateCategorySelects();
        
        this.showToast('✅ 카테고리가 수정되었습니다!', 'success');
    }

    // 카테고리 편집 취소
    cancelCategoryEdit() {
        this.renderCategoriesList();
    }

    // 카테고리 삭제
    async deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        // 해당 카테고리를 사용하는 상품 확인
        const productsWithCategory = this.products.filter(p => p.category === category.name);
        
        if (productsWithCategory.length > 0) {
            if (!confirm(`"${category.name}" 카테고리를 사용하는 상품이 ${productsWithCategory.length}개 있습니다.\n\n카테고리를 삭제하면 해당 상품들의 카테고리가 제거됩니다.\n계속하시겠습니까?`)) {
                return;
            }
        } else {
            if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
                return;
            }
        }

        try {
            const response = await fetch(this.getApiUrl(`tables/farm_categories/${categoryId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadCategories();
                this.renderCategoriesList();
                alert(`"${category.name}" 카테고리가 삭제되었습니다.`);
            } else {
                throw new Error('카테고리 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('카테고리 삭제 중 오류가 발생했습니다.');
        }
    }

    // 카테고리 업데이트
    async updateCategory(categoryId, updateData) {
        try {
            const response = await fetch(this.getApiUrl(`tables/farm_categories/${categoryId}`), {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                await this.loadCategories();
                this.renderCategoriesList();
                alert('카테고리가 수정되었습니다.');
            } else {
                throw new Error('카테고리 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('카테고리 수정 중 오류가 발생했습니다.');
        }
    }

    // 모든 select 요소의 카테고리 옵션 업데이트 (통합 버전)
    updateCategorySelects() {
        const selects = [
            'product-form-category',    // 모달 상품 등록
            'inline-product-category',  // 인라인 상품 등록 (새 주문 등록)
            'waitlist-form-category',   // 대기자 등록 폼
            'category-filter',          // 상품 필터링
            'product-list-category'     // 상품 목록
        ];

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                console.log(`통합 카테고리 업데이트: ${selectId}, 현재값: ${currentValue}`);
                
                // 기존 옵션들 제거 (첫 번째 옵션과 특수 옵션들 보존)
                const firstOption = select.firstElementChild;
                const firstOptionText = firstOption ? firstOption.textContent : '';
                
                select.innerHTML = '';
                
                // 기본 선택 옵션 추가 (상품 등록 폼용)
                if (selectId === 'product-form-category' || selectId === 'inline-product-category') {
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '카테고리 선택';
                    defaultOption.disabled = false; // 선택 가능하게 변경
                    select.appendChild(defaultOption);
                } else if (firstOption && (firstOptionText.includes('전체') || firstOptionText.includes('선택') || firstOptionText === '')) {
                    select.appendChild(firstOption);
                }

                // 카테고리 옵션들 추가 (활성 카테고리만, 정렬 순서대로)
                const sortedCategories = this.categories
                    .filter(cat => cat.is_active !== false)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                    
                sortedCategories.forEach(category => {
                    const option = document.createElement('option');
                    // 통일된 방식: 카테고리 ID를 값으로 사용
                    option.value = category.id || category.name;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                // 빠른 추가 옵션 (상품 등록 폼에만)
                if (selectId === 'product-form-category' || selectId === 'inline-product-category') {
                    const addNewOption = document.createElement('option');
                    addNewOption.value = '__ADD_NEW__';
                    addNewOption.textContent = '+ 새 카테고리 추가';
                    addNewOption.className = 'text-blue-600 font-medium';
                    select.appendChild(addNewOption);
                }
                
                // 이전 선택값 복원 시도
                if (currentValue) {
                    select.value = currentValue;
                    // 복원이 실패한 경우 로그 출력
                } else if ((selectId === 'product-form-category' || selectId === 'inline-product-category') && sortedCategories.length > 0) {
                    // 상품 등록 폼에서 카테고리가 없을 때 첫 번째 카테고리 자동 선택
                    const firstCategory = sortedCategories[0];
                    select.value = firstCategory.id || firstCategory.name;
                    console.log(`🎯 기본 카테고리 자동 선택: ${firstCategory.name}`);
                }
                if (select.value !== currentValue && currentValue) {
                    console.log(`🔄 카테고리 값 업데이트: ${selectId}, 이전값: ${currentValue}, 새값: ${select.value}`);
                }
            } else {
                console.warn('카테고리 select 요소를 찾을 수 없음: ' + selectId);
            }
        });
        
        console.log(`카테고리 업데이트 완료. 총 ${this.categories.length}개 카테고리`);
    }

    // 카테고리별 색상 (동적으로 가져오기)
    getCategoryColor(categoryName) {
        const category = this.categories.find(c => c.name === categoryName);
        return category ? category.color : 'bg-gray-100 text-gray-800';
    }

    // 카테고리 통합 관리 헬퍼 함수들
    
    // 카테고리 ID로 카테고리 객체 찾기
    getCategoryById(categoryId) {
        return this.categories.find(c => c.id === categoryId);
    }
    
    // 카테고리 이름으로 카테고리 객체 찾기
    getCategoryByName(categoryName) {
        return this.categories.find(c => c.name === categoryName);
    }
    
    // 카테고리 ID 또는 이름으로 카테고리 이름 반환
    getCategoryName(categoryIdOrName) {
        if (!categoryIdOrName) return '';
        
        // ID로 찾아보기
        let category = this.getCategoryById(categoryIdOrName);
        if (category) return category.name;
        
        // 이름으로 찾아보기
        category = this.getCategoryByName(categoryIdOrName);
        if (category) return category.name;
        
        // 못 찾으면 원래 값 반환
        return categoryIdOrName;
    }
    
    // 카테고리 ID 또는 이름으로 카테고리 ID 반환
    getCategoryId(categoryIdOrName) {
        if (!categoryIdOrName) return '';
        
        // 이미 ID인지 확인
        let category = this.getCategoryById(categoryIdOrName);
        if (category) return category.id;
        
        // 이름으로 찾아보기
        category = this.getCategoryByName(categoryIdOrName);
        if (category) return category.id;
        
        // 못 찾으면 원래 값 반환 (ID로 가정)
        return categoryIdOrName;
    }

    // === QR 코드 중앙 관리 시스템 === 
    // 모든 QR 작업을 이 섹션에서만 처리하여 데이터 일관성 보장
    
    // QR 코드 데이터 표준 포맷 생성 (중앙집중화)
    generateStandardQRData(product) {
        if (!product) return '';
        
        // 전체 시스템에서 사용할 표준 QR 데이터 포맷
        const standardData = {
            // 필수 필드
            name: product.name || '상품명 없음',
            price: product.price || 0,
            
            // 선택 필드 (있으면 표시)
            category: product.category || null,
            size: product.size || null,
            description: product.description || null,
            
            // 메타 데이터
            farm: '경산다육식물농장',
            contact: '유튜브 @경산다육TV',
            website: 'https://youtube.com/@경산다육TV',
            id: product.id || '',
            generated: new Date().toISOString() // 생성 시각
        };
        
        // 표시용 텍스트 포맷 (일관된 형식)
        let displayText = `🌱 ${standardData.name}\n`;
        displayText += `💰 판매가: ${new Intl.NumberFormat('ko-KR').format(standardData.price)}원\n`;
        
        if (standardData.category) {
            displayText += `🏷️ ${standardData.category}\n`;
        }
        if (standardData.size) {
            displayText += `📊 ${standardData.size}\n`;
        }
        if (standardData.description) {
            displayText += `📝 ${standardData.description}\n`;
        }
        
        displayText += `\n🌿 ${standardData.farm}\n`;
        displayText += `📞 ${standardData.contact}\n`;
        displayText += `🌐 ${standardData.website}\n`;
        displayText += `🆔 ${standardData.id}`;
        
        return displayText;
    }
    
    // QR 코드 생성 중앙 허브 (전체 시스템에서 사용) - 복원됨
    async generateProductQRCode(product, options = {}) {
        const defaultOptions = {
            size: 256,
            level: 'H',
            background: 'white',
            foreground: 'black',
            showLogs: true
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            if (finalOptions.showLogs) {
                console.log(`📋 [중앙 QR 생성] 시작: ${product.name}`);
            }
            
            // QRious 라이브러리 확인 (더 강력한 체크)
            if (typeof QRious === 'undefined') {
                throw new Error('QRious 라이브러리가 로드되지 않았습니다. CDN 연결을 확인해주세요.');
            }
            
            if (typeof QRious !== 'function') {
                throw new Error('QRious 라이브러리가 올바르게 초기화되지 않았습니다.');
            }
            
            // 추가 안전성 체크
            if (window.QRCodeDisabled) {
                throw new Error('QR 코드 기능이 비활성화되었습니다.');
            }
            
            // 표준 QR 데이터 생성
            const qrData = this.generateStandardQRData(product);
            
            if (finalOptions.showLogs) {
                console.log('📊 [중앙 QR 데이터]:', qrData);
            }
            
            // QR 코드 생성
            const canvas = document.createElement('canvas');
            const qr = new QRious({
                element: canvas,
                value: qrData,
                size: finalOptions.size,
                background: finalOptions.background,
                foreground: finalOptions.foreground,
                level: finalOptions.level
            });
            
            // Base64 변환
            const base64QRCode = canvas.toDataURL('image/png');
            
            if (!base64QRCode || base64QRCode === 'data:,') {
                throw new Error('QR 코드 Base64 변환 실패');
            }
            
            if (finalOptions.showLogs) {
                console.log(`✅ [중앙 QR 생성] 성공! (${base64QRCode.length} bytes)`);
            }
            
            return {
                success: true,
                qrCode: base64QRCode,
                data: qrData,
                size: finalOptions.size
            };
            
        } catch (error) {
            console.error(`❌ [중앙 QR 생성] 실패:`, error);
            return {
                success: false,
                error: error.message,
                qrCode: null
            };
        }
    }
    
    // QR 코드 상태 관리 (중앙집중화)
    hasQRCode(product) {
        return product && product.qr_code && product.qr_code.length > 0;
    }
    
    isQREnabled(product) {
        return product && (product.qr_enabled === true || this.hasQRCode(product));
    }
    
    updateProductQRStatus(product, enabled, qrCodeBase64 = '') {
        if (!product) return;
        
        product.qr_enabled = enabled;
        product.qr_code = enabled ? qrCodeBase64 : '';
        product.qr_updated_at = Date.now(); // QR 업데이트 시각 기록
        
        console.log(`📋 [중앙 QR 상태] ${product.name}: ${enabled ? '활성' : '비활성'}`);
    }
    
    removeProductQRCode(product) {
        if (!product) return;
        this.updateProductQRStatus(product, false, '');
        console.log(`🗑️ [중앙 QR 제거] ${product.name}`);
    }
    
    // 상품에 QR 코드 생성 (클릭 시)
    async generateQRForProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('상품을 찾을 수 없습니다.');
            return;
        }
        
        if (this.hasQRCode(product)) {
            alert('이미 QR 코드가 생성되어 있습니다.');
            return;
        }
        
        const confirmGenerate = confirm(`"${product.name}"에 QR 코드를 생성하시겠습니까?`);
        if (!confirmGenerate) return;
        
        try {
            console.log(`📋 [클릭 생성] QR 코드 생성 시작: ${product.name}`);
            console.log('상품 데이터:', product);
            
            const qrResult = await this.generateProductQRCode(product, { showLogs: true });
            
            if (qrResult.success) {
                this.updateProductQRStatus(product, true, qrResult.qrCode);
                
                // 데이터 저장 및 UI 업데이트
                await this.saveToStorage('products', this.products);
                this.renderProductsTable();
                
                this.showToast(`✅ "${product.name}" QR 코드가 생성되었습니다!`, 'success');
                
                // QR 코드 테스트를 위한 로그
                console.log('🔍 [클릭 생성] QR 스캔 예상 데이터:');
                console.log(qrResult.data);
                
            } else {
                throw new Error(qrResult.error);
            }
            
        } catch (error) {
            console.error('❌ [클릭 생성] QR 코드 생성 실패:', error);
            alert(`QR 코드 생성에 실패했습니다: ${error.message}`);
        }
    }

    // 카테고리 모달 닫기
    closeCategoryModal() {
        document.getElementById('category-modal').classList.add('hidden');
        
        // 입력 필드 초기화
        document.getElementById('new-category-name').value = '';
        document.getElementById('new-category-description').value = '';
    }

    // ============ 대기자 관리 시스템 ============

    // 대기자 데이터 로드
    async loadWaitlist() {
        console.log('🔄 대기자 데이터 로드 시작...');
        
        let apiWaitlist = [];
        let localWaitlist = [];
        
        // 1. API에서 대기자 데이터 로드
        try {
            const response = await fetch(this.getApiUrl('farm_waitlist'));
            
            if (response.ok) {
                const result = await response.json();
                apiWaitlist = result.data || [];
                console.log('✅ API에서 대기자 데이터 로드 완료:', apiWaitlist.length, '건');
            } else {
                throw new Error(`API 오류: ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ API 로드 실패:', error.message);
        }
        
        // 2. LocalStorage에서 대기자 데이터 로드
        try {
            localWaitlist = this.loadFromLocalStorage('farm_waitlist');
            console.log('📱 LocalStorage에서 대기자 데이터 확인:', localWaitlist.length, '건');
        } catch (error) {
            console.warn('⚠️ LocalStorage 로드 실패:', error.message);
        }
        
        // 3. 데이터 병합 및 동기화
        this.farm_waitlist = this.mergeWaitlistData(apiWaitlist, localWaitlist);
        
        console.log('📊 최종 대기자 데이터:', this.farm_waitlist.length, '건');
        console.log('📋 대기자 상세 데이터:', this.farm_waitlist);
        
        // 4. LocalStorage에 최종 데이터 저장
        this.saveToLocalStorage('farm_waitlist', this.farm_waitlist);
        
        // 5. UI 업데이트
        this.renderWaitlistTable();
        this.updateWaitlistStats();
        
        // 6. API와 동기화 (LocalStorage에 더 많은 데이터가 있는 경우)
        if (localWaitlist.length > apiWaitlist.length) {
            console.log('🔄 LocalStorage 데이터를 API에 동기화 중...');
            await this.syncWaitlistToApi();
        }
    }

    // 대기자 데이터 병합
    mergeWaitlistData(apiData, localData) {
        const waitlistMap = new Map();
        
        // API 데이터 추가
        apiData.forEach(item => {
            if (item && item.id) {
                waitlistMap.set(item.id, { ...item, source: 'api' });
            }
        });
        
        // LocalStorage 데이터 추가/업데이트
        localData.forEach(item => {
            if (item && item.id) {
                const existing = waitlistMap.get(item.id);
                if (existing) {
                    // 기존 데이터 업데이트 (LocalStorage 우선)
                    waitlistMap.set(item.id, { ...item, source: 'both' });
                } else {
                    // 새 데이터 추가
                    waitlistMap.set(item.id, { ...item, source: 'local' });
                }
            }
        });
        
        // 배열로 변환 및 정렬
        const mergedData = Array.from(waitlistMap.values());
        return mergedData.sort((a, b) => {
            const dateA = new Date(a.register_date || a.created_at || 0);
            const dateB = new Date(b.register_date || b.created_at || 0);
            return dateB - dateA; // 최신순
        });
    }

    // 대기자 데이터를 API에 동기화
    async syncWaitlistToApi() {
        try {
            for (const item of this.waitlist) {
                if (item.source === 'local' || item.source === 'both') {
                    await this.saveWaitlistToApi(item);
                }
            }
            console.log('✅ 대기자 데이터 API 동기화 완료');
        } catch (error) {
            console.error('❌ 대기자 데이터 API 동기화 실패:', error);
        }
    }

    // 대기자 데이터 긴급 복구
    async emergencyWaitlistRecovery() {
        console.log('🚨 대기자 데이터 긴급 복구 시작...');
        
        try {
            // 1. 모든 LocalStorage 키 확인
            const allKeys = Object.keys(localStorage);
            const waitlistKeys = allKeys.filter(key => 
                key.includes('waitlist') || key.includes('대기자')
            );
            
            console.log('🔍 발견된 대기자 관련 키:', waitlistKeys);
            
            // 2. 각 키에서 데이터 복구 시도
            let recoveredData = [];
            for (const key of waitlistKeys) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`📦 ${key}에서 ${data.length}개 데이터 복구`);
                        recoveredData = recoveredData.concat(data);
                    }
                } catch (e) {
                    console.warn(`⚠️ ${key} 파싱 실패:`, e);
                }
            }
            
            // 3. 중복 제거 및 병합
            const uniqueData = [];
            const seenIds = new Set();
            
            recoveredData.forEach(item => {
                if (item && item.id && !seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueData.push(item);
                }
            });
            
            if (uniqueData.length > 0) {
                this.waitlist = uniqueData;
                this.saveToLocalStorage('waitlist', this.waitlist);
                this.renderWaitlistTable();
                this.updateWaitlistStats();
                
                console.log(`✅ 대기자 데이터 복구 완료: ${uniqueData.length}건`);
                alert(`🚨 대기자 데이터 복구 완료!\n\n${uniqueData.length}개의 대기자 데이터가 복구되었습니다.`);
            } else {
                console.log('❌ 복구할 대기자 데이터가 없습니다.');
                alert('❌ 복구할 대기자 데이터가 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 대기자 데이터 복구 실패:', error);
            alert('❌ 대기자 데이터 복구에 실패했습니다.');
        }
    }

    // 대기자 데이터 저장 (주문 저장과 동일한 이중 안전망 방식)
    async saveWaitlist(waitlistData) {
        console.log('🔄 대기자 저장 시작:', waitlistData);
        
        // 신규 고객 자동 등록 (대기자 등록 시)
        if (!waitlistData.id) {
            await this.saveWaitlistCustomerIfNew(waitlistData);
        }

        try {
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                let response;
                
                if (waitlistData.id && !waitlistData.id.startsWith('waitlist_') && !waitlistData.id.startsWith('local_')) {
                    // 대기자 수정
                    response = await fetch(this.getApiUrl(`farm_waitlist/${waitlistData.id}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(waitlistData)
                    });
                } else {
                    // 새 대기자 등록
                    response = await fetch(this.getApiUrl('farm_waitlist'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(waitlistData)
                    });
                }

                if (response.ok) {
                    const result = await response.json();
                    if (result.id && !waitlistData.id) {
                        waitlistData.id = result.id;
                    }
                    apiSuccess = true;
                    console.log('✅ API로 대기자 저장 성공');
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('⚠️ API 저장 실패, LocalStorage 사용:', apiError);
            }
            
            // LocalStorage에 항상 저장 (이중 안전망)
            if (waitlistData.id && !waitlistData.id.startsWith('waitlist_') && !waitlistData.id.startsWith('local_')) {
                // 대기자 수정
                const waitlistIndex = this.waitlist.findIndex(w => w.id === waitlistData.id);
                if (waitlistIndex !== -1) {
                    this.waitlist[waitlistIndex] = { ...waitlistData };
                }
            } else {
                // 새 대기자 등록
                if (!waitlistData.id) {
                    // UUID 형식으로 ID 생성 (Supabase 호환)
                    waitlistData.id = crypto.randomUUID();
                }
                waitlistData.register_date = new Date().toISOString().split('T')[0];
                waitlistData.last_contact = null;
                waitlistData.created_at = new Date().toISOString();
                waitlistData.updated_at = new Date().toISOString();
                this.waitlist.push(waitlistData);
            }
            
            // 항상 LocalStorage에 저장 (API 성공/실패 관계없이)
            await this.saveToStorage('waitlist', this.waitlist);
            console.log('✅ LocalStorage에 대기자 저장됨 (이중 안전망)');
            
            // UI 업데이트
            this.renderWaitlistTable();
            this.updateWaitlistStats();
            
            // 성공 메시지
            if (apiSuccess) {
                this.showToast('✅ 대기자가 성공적으로 등록되었습니다!');
            } else {
                this.showToast('⚠️ 대기자가 로컬에 저장되었습니다. (서버 연결 불안정)');
            }
            
        } catch (error) {
            console.error('❌ 대기자 저장 중 오류:', error);
            this.showToast('❌ 대기자 저장 중 오류가 발생했습니다.');
        }
    }

    // 대기자 삭제
    async deleteWaitlist(waitlistId) {
        // 즉시 로컬에서 삭제
        this.waitlist = this.waitlist.filter(w => w.id !== waitlistId);
        this.saveToLocalStorage('waitlist', this.waitlist);
        
        try {
            // API 삭제 시도
            const response = await fetch(this.getApiUrl(`farm_waitlist/${waitlistId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log('대기자 API 삭제 성공');
            } else {
                throw new Error(`API 삭제 실패: ${response.status}`);
            }
        } catch (error) {
            console.warn('대기자 API 삭제 실패, LocalStorage는 업데이트됨:', error);
            this.showToast('⚠️ 대기자 정보가 로컬에서 삭제되었습니다. (서버 연결 불안정)');
        }
        
        this.renderWaitlistTable();
        this.updateWaitlistStats();
    }

    // 대기자 테이블 렌더링
    renderWaitlistTable(filteredWaitlist = null) {
        const container = document.getElementById('waitlist-table-container');
        if (!container) {
            console.warn('대기자 테이블 컨테이너를 찾을 수 없습니다.');
            return;
        }

        // 대기자 상태별 카운트 업데이트
        this.updateWaitlistStatusCounts();

        const searchQuery = document.getElementById('waitlist-search')?.value?.toLowerCase() || '';
        
        let waitlistToRender = filteredWaitlist || this.waitlist;

        // 검색 필터 적용
        if (searchQuery) {
            waitlistToRender = waitlistToRender.filter(item => 
                item.customer_name?.toLowerCase().includes(searchQuery) ||
                item.customer_phone?.includes(searchQuery) ||
                item.product_name?.toLowerCase().includes(searchQuery) ||
                item.memo?.toLowerCase().includes(searchQuery)
            );
        }

        // 우선순위 및 등록일 순으로 정렬
        waitlistToRender.sort((a, b) => {
            // 우선순위 먼저 (높음 > 보통 > 낮음)
            const priorityOrder = { '높음': 3, '보통': 2, '낮음': 1 };
            const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
            if (priorityDiff !== 0) return priorityDiff;
            
            // 그 다음 등록일 (최신순)
            return new Date(b.register_date) - new Date(a.register_date);
        });

        if (waitlistToRender.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">대기자가 없습니다</h3>
                    <p class="text-gray-500 mb-4">새로운 대기자를 등록해보세요.</p>
                    <button onclick="orderSystem.openWaitlistModal()" 
                            class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        대기자 등록
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객정보</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">희망상품</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예상 판매가</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${waitlistToRender.map(item => {
                            const priorityColor = {
                                '높음': 'bg-red-100 text-red-800',
                                '보통': 'bg-yellow-100 text-yellow-800',
                                '낮음': 'bg-green-100 text-green-800'
                            }[item.priority] || 'bg-gray-100 text-gray-800';

                            const statusColor = {
                                '대기중': 'bg-yellow-100 text-yellow-800',
                                '연락완료': 'bg-blue-100 text-blue-800', 
                                '완료': 'bg-green-100 text-green-800',
                                '취소': 'bg-red-100 text-red-800'
                            }[item.status] || 'bg-gray-100 text-gray-800';

                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium">
                                            <button onclick="orderSystem.navigateToCustomer('${item.customer_name}')" 
                                                    class="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer">
                                                ${item.customer_name}
                                            </button>
                                        </div>
                                        <div class="text-sm text-gray-500">${item.customer_phone}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-sm font-medium">
                                            <button onclick="orderSystem.navigateToProduct('${item.product_name}')" 
                                                    class="text-green-600 hover:text-green-800 hover:underline transition-colors cursor-pointer">
                                                ${item.product_name}
                                            </button>
                                        </div>
                                        ${item.product_category ? `<div class="text-sm text-gray-500">${item.product_category}</div>` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${item.expected_price ? new Intl.NumberFormat('ko-KR').format(item.expected_price) + '원' : '-'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColor}">
                                            ${item.priority}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <select onchange="orderSystem.updateWaitlistStatus('${item.id}', this.value)" 
                                                class="text-xs font-semibold rounded-full px-2 py-1 border-0 ${statusColor} focus:ring-2 focus:ring-green-500">
                                            <option value="대기중" ${item.status === '대기중' ? 'selected' : ''}>대기중</option>
                                            <option value="연락완료" ${item.status === '연락완료' ? 'selected' : ''}>연락완료</option>
                                            <option value="완료" ${item.status === '완료' ? 'selected' : ''}>완료</option>
                                            <option value="취소" ${item.status === '취소' ? 'selected' : ''}>취소</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${item.register_date}
                                        ${item.last_contact ? `<div class="text-xs text-green-600">마지막 연락: ${item.last_contact}</div>` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-2">
                                            <button onclick="orderSystem.openWaitlistModal('${item.id}')" 
                                                    class="text-green-600 hover:text-green-900 transition-colors">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="orderSystem.copyWaitlistToOrder('${item.id}')" 
                                                    class="text-blue-600 hover:text-blue-900 transition-colors" 
                                                    title="주문으로 변환">
                                                <i class="fas fa-arrow-right"></i>
                                            </button>
                                            <button onclick="orderSystem.deleteWaitlistItem('${item.id}')" 
                                                    class="text-red-600 hover:text-red-900 transition-colors">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                ${item.memo ? `
                                <tr class="bg-gray-50">
                                    <td colspan="7" class="px-6 py-2 text-sm text-gray-600">
                                        <strong>메모:</strong> ${item.memo}
                                    </td>
                                </tr>
                                ` : ''}
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 대기자 통계 업데이트
    updateWaitlistStats() {
        const totalCount = this.waitlist.length;
        // 다양한 상태값 처리 (대/소문자, 공백 처리)
        const waitingCount = this.waitlist.filter(w => {
            const status = (w.status || '').trim();
            return status === '대기중' || status === '대기' || status === 'waiting' || status === '';
        }).length;
        
        const contactedCount = this.waitlist.filter(w => {
            const status = (w.status || '').trim();
            return status === '연락완료' || status === '연락됨' || status === 'contacted';
        }).length;
        
        const convertedCount = this.waitlist.filter(w => {
            const status = (w.status || '').trim();
            return status === '완료' || status === '주문전환' || status === 'completed' || status === 'converted';
        }).length;

        console.log('🔍 대기자 통계 상세 분석:');
        console.log('총 대기자:', totalCount);
        console.log('대기중:', waitingCount);
        console.log('연락완료:', contactedCount);
        console.log('완료:', convertedCount);
        console.log('전체 대기자 상태 데이터:', this.waitlist.map(w => ({ 
            name: w.customer_name, 
            status: w.status,
            rawStatus: JSON.stringify(w.status) 
        })));

        // HTML의 실제 ID에 맞춰 업데이트
        const waitingElement = document.getElementById('waiting-count');
        const contactedElement = document.getElementById('contacted-count');
        const convertedElement = document.getElementById('converted-count');

        if (waitingElement) {
            waitingElement.textContent = waitingCount;
            console.log('✅ 대기중 카운트 업데이트:', waitingCount);
        } else {
            console.warn('❌ waiting-count 엘리먼트를 찾을 수 없습니다');
        }

        if (contactedElement) {
            contactedElement.textContent = contactedCount;
            console.log('✅ 연락완료 카운트 업데이트:', contactedCount);
        } else {
            console.warn('❌ contacted-count 엘리먼트를 찾을 수 없습니다');
        }

        if (convertedElement) {
            convertedElement.textContent = convertedCount;
            console.log('✅ 완료 카운트 업데이트:', convertedCount);
        } else {
            console.warn('❌ converted-count 엘리먼트를 찾을 수 없습니다');
        }

        // 취소된 대기자 수 계산
        const cancelledCount = this.waitlist.filter(w => {
            const status = (w.status || '').trim();
            return status === '취소' || status === '취소됨' || status === 'cancelled' || status === 'canceled';
        }).length;

        const cancelledElement = document.getElementById('cancelled-count');
        if (cancelledElement) {
            cancelledElement.textContent = cancelledCount;
            console.log('✅ 취소 카운트 업데이트:', cancelledCount);
        } else {
            console.warn('❌ cancelled-count 엘리먼트를 찾을 수 없습니다');
        }
        
        if (contactedElement) {
            contactedElement.textContent = contactedCount;
            console.log('연락완료 카운트 업데이트:', contactedCount);
        } else {
            console.warn('contacted-count 엘리먼트를 찾을 수 없습니다');
        }
        
        if (convertedElement) {
            convertedElement.textContent = convertedCount;
            console.log('완료 카운트 업데이트:', convertedCount);
        } else {
            console.warn('converted-count 엘리먼트를 찾을 수 없습니다');
        }
    }

    // 대기자 모달 열기
    openWaitlistModal(waitlistId = null) {
        console.log('🔄 대기자 모달 열기 요청:', waitlistId);
        this.currentEditingWaitlist = waitlistId ? this.waitlist.find(w => w.id === waitlistId) : null;
        
        const modal = document.getElementById('waitlist-modal');
        const title = document.getElementById('waitlist-modal-title');
        
        console.log('🔍 대기자 모달 요소 확인:', {
            modal: !!modal,
            title: !!title,
            mode: waitlistId ? '수정' : '신규등록'
        });
        
        if (!modal) {
            console.error('❌ waitlist-modal 요소를 찾을 수 없습니다!');
            return;
        }
        
        if (this.currentEditingWaitlist) {
            title.textContent = '대기자 정보 수정';
            this.fillWaitlistForm(this.currentEditingWaitlist);
        } else {
            title.textContent = '새 대기자 등록';
            this.clearWaitlistForm();
        }
        
        modal.classList.remove('hidden');
        console.log('✅ 대기자 모달 표시됨');
        
        // 고객 자동완성 설정
        this.setupWaitlistCustomerAutocomplete();
        
        // 첫 번째 입력 필드에 포커스
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
                console.log('✅ 첫 번째 입력 필드에 포커스 설정됨');
            } else {
                console.warn('⚠️ 첫 번째 입력 필드를 찾을 수 없습니다');
            }
        }, 100);
        
        console.log('✅ 대기자 모달 열기 완료');
    }

    // 대기자용 고객 자동완성 설정
    setupWaitlistCustomerAutocomplete() {
        console.log('🔧 대기자용 고객 자동완성 설정 시작...');
        const customerNameInput = document.getElementById('waitlist-form-name');
        const suggestionsList = document.getElementById('waitlist-customer-suggestions');
        
        console.log('🔍 대기자용 DOM 요소 확인:', {
            customerNameInput: !!customerNameInput,
            suggestionsList: !!suggestionsList
        });
        
        if (!customerNameInput) {
            console.warn('⚠️ waitlist-form-name 요소를 찾을 수 없습니다.');
            return;
        }
        
        if (!suggestionsList) {
            console.warn('⚠️ waitlist-customer-suggestions 요소를 찾을 수 없습니다.');
            return;
        }
        
        let debounceTimer;

        // 기존 이벤트 리스너 제거 (중복 방지)
        customerNameInput.replaceWith(customerNameInput.cloneNode(true));
        const newCustomerNameInput = document.getElementById('waitlist-form-name');

        // 입력 이벤트 리스너
        newCustomerNameInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.showWaitlistCustomerSuggestions(e.target.value);
            }, 300);
        });

        // 포커스 아웃 시 목록 숨기기 (약간의 지연 추가)
        newCustomerNameInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsList.classList.add('hidden');
            }, 200);
        });

        // 포커스 시 다시 검색
        newCustomerNameInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                this.showWaitlistCustomerSuggestions(e.target.value);
            }
        });
        
        console.log('✅ 대기자용 고객 자동완성 설정 완료');
    }

    // 대기자용 고객 자동완성 목록 표시
    showWaitlistCustomerSuggestions(query) {
        console.log('🔍 대기자용 고객 자동완성 검색:', query);
        const suggestionsList = document.getElementById('waitlist-customer-suggestions');
        
        if (!suggestionsList) {
            console.error('❌ waitlist-customer-suggestions 요소를 찾을 수 없습니다!');
            return;
        }
        
        if (!query.trim()) {
            suggestionsList.classList.add('hidden');
            return;
        }

        // 고객명 또는 전화번호로 검색
        const matchedCustomers = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );

        console.log('🔍 대기자용 검색 결과:', {
            query: query,
            totalCustomers: this.customers.length,
            matchedCustomers: matchedCustomers.length,
            customerNames: this.customers.map(c => c.name)
        });

        if (matchedCustomers.length === 0) {
            console.log('🆕 대기자용 신규 고객 등록 옵션 표시');
            suggestionsList.innerHTML = `
                <div class="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 waitlist-new-customer-option"
                     data-customer-name="${query.replace(/"/g, '&quot;')}"
                     title="클릭하면 신규 고객으로 등록됩니다">
                    <div class="flex items-center text-green-600">
                        <i class="fas fa-user-plus mr-2"></i>
                        <span class="font-medium">"${query}" - 신규 고객 등록</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-1">클릭하여 새 고객으로 등록</div>
                </div>
            `;
            
            // 클릭 이벤트 리스너 추가
            const newCustomerOption = suggestionsList.querySelector('.waitlist-new-customer-option');
            if (newCustomerOption) {
                console.log('🔍 신규 고객 등록 옵션 요소 발견:', newCustomerOption);
                newCustomerOption.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ 대기자용 신규 고객 등록 클릭됨:', query);
                    console.log('🔄 createWaitlistNewCustomer 호출 시작');
                    this.createWaitlistNewCustomer(query);
                    console.log('✅ createWaitlistNewCustomer 호출 완료');
                });
                console.log('✅ 대기자용 신규 고객 등록 클릭 이벤트 리스너 등록됨');
            } else {
                console.error('❌ 대기자용 신규 고객 등록 옵션 요소를 찾을 수 없습니다');
            }
            
            suggestionsList.classList.remove('hidden');
            return;
        }

        // 매칭된 고객 목록 표시
        suggestionsList.innerHTML = matchedCustomers.map(customer => `
            <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                 onclick="orderSystem.selectWaitlistCustomer('${customer.id}')"
                 title="클릭하여 고객 정보 자동 입력">
                <div class="flex items-center">
                    <i class="fas fa-user text-blue-500 mr-2"></i>
                    <div>
                        <div class="font-medium text-gray-900">${customer.name}</div>
                        <div class="text-sm text-gray-600">${customer.phone}</div>
                        <div class="text-sm text-gray-500">${customer.address || '주소 미등록'}</div>
                    </div>
                </div>
            </div>
        `).join('');

        suggestionsList.classList.remove('hidden');
    }

    // 대기자용 고객 선택
    selectWaitlistCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            document.getElementById('waitlist-form-name').value = customer.name;
            document.getElementById('waitlist-form-phone').value = customer.phone || '';
            
            // 자동완성 목록 숨기기
            document.getElementById('waitlist-customer-suggestions').classList.add('hidden');
            
            // 기존 고객 선택 알림
            this.showToast(`✅ "${customer.name}" 고객 정보 자동 입력됨`);
            
            // 상품명 필드로 포커스 이동
            const productInput = document.getElementById('waitlist-form-product');
            if (productInput) productInput.focus();
        }
    }

    // 대기자용 신규 고객 생성
    createWaitlistNewCustomer(customerName) {
        console.log('🆕 대기자용 신규 고객 생성 요청:', customerName);
        
        // 자동완성 목록 숨기기
        const suggestionsList = document.getElementById('waitlist-customer-suggestions');
        if (suggestionsList) {
            suggestionsList.classList.add('hidden');
            console.log('✅ 대기자용 자동완성 목록 숨김');
        } else {
            console.warn('⚠️ waitlist-customer-suggestions 요소를 찾을 수 없습니다');
        }
        
        // 대기자 모달 닫기
        const waitlistModal = document.getElementById('waitlist-modal');
        if (waitlistModal) {
            waitlistModal.classList.add('hidden');
            console.log('✅ 대기자 모달 닫음');
        }
        
        // 고객관리 탭으로 이동
        console.log('🔄 고객관리 탭으로 이동 중...');
        this.switchTab('tab-customers');
        
        // 대기자 등록에서 온 것을 표시하는 플래그 설정
        this.fromWaitlistRegistration = true;
        this.customerRegistrationSource = 'waitlist';
        
        // 탭 전환 후 모달 열기 (타이밍 조정)
        setTimeout(() => {
            console.log('🔄 고객 등록 모달 열기 중...');
            this.openCustomerModal();
            console.log('✅ openCustomerModal 호출 완료');
        }, 100);
        
        // 고객명 미리 입력
        setTimeout(() => {
            const customerNameInput = document.getElementById('customer-form-name');
            if (customerNameInput) {
                customerNameInput.value = customerName;
                customerNameInput.focus();
                console.log('✅ 고객 등록 폼에 고객명 설정됨');
            } else {
                console.warn('⚠️ customer-form-name 요소를 찾을 수 없습니다');
            }
        }, 100);
        
        // 사용자에게 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-user-plus mr-2"></i>
                <span>"${customerName}" 신규 고객 등록창을 열었습니다</span>
            </div>
            <div class="text-sm mt-1">고객 정보를 입력하고 저장하면 대기자 등록으로 돌아갑니다</div>
        `;
        
        document.body.appendChild(notification);
        
        // 3초 후 알림 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        console.log('✅ 대기자용 신규 고객 생성 완료');
    }

    // 대기자 저장시 신규 고객 자동 등록
    async saveWaitlistCustomerIfNew(waitlistData) {
        // 전화번호 정규화 (숫자만 추출)
        const normalizedPhone = waitlistData.customer_phone?.replace(/[^0-9]/g, '') || '';
        
        // 전화번호로 기존 고객 찾기 (정규화된 번호로 비교)
        const existingCustomer = this.customers.find(c => {
            const existingPhone = c.phone?.replace(/[^0-9]/g, '') || '';
            return existingPhone === normalizedPhone;
        });
        
        console.log('🔍 대기자 고객 중복 검사:', {
            입력전화번호: waitlistData.customer_phone,
            정규화된번호: normalizedPhone,
            기존고객발견: !!existingCustomer,
            기존고객명: existingCustomer?.name
        });
        
        if (!existingCustomer) {
            try {
                let apiSuccess = false;
                const newCustomerData = {
                    name: waitlistData.customer_name,
                    phone: waitlistData.customer_phone,
                    address: '',
                    email: '',
                    memo: '대기자 등록을 통해 자동 등록'
                };
                
                // API 먼저 시도
                try {
                    const response = await fetch(this.getApiUrl('farm_customers'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(newCustomerData)
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log(`신규 고객 "${waitlistData.customer_name}" API로 자동 등록 완료!`);
                        apiSuccess = true;
                    } else {
                        throw new Error(`API 오류: ${response.status}`);
                    }
                } catch (apiError) {
                    console.warn('API 고객 등록 실패, LocalStorage 사용:', apiError);
                }
                
                // API가 실패했으면 LocalStorage에 저장
                if (!apiSuccess) {
                    newCustomerData.id = Date.now().toString();
                    newCustomerData.created_at = new Date().toISOString();
                    this.customers.push(newCustomerData);
                    await this.saveToStorage('farm_customers', this.customers);
                    console.log(`신규 고객 "${waitlistData.customer_name}" LocalStorage로 자동 등록 완료!`);
                }
                
                // 고객 목록 새로고침
                await this.loadCustomers();
                
                // 성공 알림
                this.showToast(`🎉 "${waitlistData.customer_name}"님이 고객 DB에 자동 등록되었습니다!`);
                
            } catch (error) {
                console.error('신규 고객 자동 등록 실패:', error);
                this.showToast(`⚠️ 고객 자동 등록 실패: ${waitlistData.customer_name}`, 'warning');
            }
        } else {
            console.log(`기존 고객 "${waitlistData.customer_name}" 발견 - 중복 등록 건너뜀`);
        }
    }

    // 대기자 모달 닫기
    closeWaitlistModal() {
        document.getElementById('waitlist-modal').classList.add('hidden');
        this.currentEditingWaitlist = null;
        this.clearWaitlistForm();
    }

    // 대기자 폼 채우기
    fillWaitlistForm(waitlist) {
        document.getElementById('waitlist-form-name').value = waitlist.customer_name || '';
        document.getElementById('waitlist-form-phone').value = waitlist.customer_phone || '';
        document.getElementById('waitlist-form-product').value = waitlist.product_name || '';
        document.getElementById('waitlist-form-category').value = waitlist.product_category || '';
        document.getElementById('waitlist-form-price').value = waitlist.expected_price || '';
        document.getElementById('waitlist-form-priority').value = waitlist.priority || '3';
        document.getElementById('waitlist-form-memo').value = waitlist.memo || '';
    }

    // 대기자 폼 클리어
    clearWaitlistForm() {
        document.getElementById('waitlist-form-name').value = '';
        document.getElementById('waitlist-form-phone').value = '';
        document.getElementById('waitlist-form-product').value = '';
        document.getElementById('waitlist-form-category').value = '';
        document.getElementById('waitlist-form-price').value = '';
        document.getElementById('waitlist-form-priority').value = '3';
        document.getElementById('waitlist-form-memo').value = '';
    }

    // 대기자 저장
    async saveWaitlistForm() {
        const waitlistData = {
            customer_name: document.getElementById('waitlist-form-name').value.trim(),
            customer_phone: document.getElementById('waitlist-form-phone').value.trim(),
            product_name: document.getElementById('waitlist-form-product').value.trim(),
            product_category: document.getElementById('waitlist-form-category').value.trim(),
            expected_price: parseInt(document.getElementById('waitlist-form-price').value) || null,
            priority: parseInt(document.getElementById('waitlist-form-priority').value) || 3,
            status: '대기중', // 새 대기자는 항상 대기중으로 시작
            memo: document.getElementById('waitlist-form-memo').value.trim()
        };

        // 필수 필드 검증
        if (!waitlistData.customer_name) {
            alert('고객명을 입력해주세요.');
            document.getElementById('waitlist-form-name').focus();
            return;
        }

        if (!waitlistData.customer_phone) {
            alert('고객 연락처를 입력해주세요.');
            document.getElementById('waitlist-form-phone').focus();
            return;
        }

        if (!waitlistData.product_name) {
            alert('희망 상품명을 입력해주세요.');
            document.getElementById('waitlist-form-product').focus();
            return;
        }

        // 기존 대기자 수정인 경우 ID 복사
        if (this.currentEditingWaitlist) {
            waitlistData.id = this.currentEditingWaitlist.id;
            waitlistData.register_date = this.currentEditingWaitlist.register_date;
            waitlistData.last_contact = this.currentEditingWaitlist.last_contact;
        }

        await this.saveWaitlist(waitlistData);
        
        // 새로운 고객인 경우 고객 DB에도 추가
        if (!this.currentEditingWaitlist) {
            await this.saveWaitlistCustomerIfNew(waitlistData);
        }
        
        this.closeWaitlistModal();
        this.showToast('✅ 대기자 정보가 저장되었습니다!');
    }

    // 대기자 상태 업데이트
    async updateWaitlistStatus(waitlistId, newStatus) {
        const waitlist = this.waitlist.find(w => w.id === waitlistId);
        if (!waitlist) return;

        const oldStatus = waitlist.status;
        waitlist.status = newStatus;
        
        // 연락완료로 변경 시 연락일 기록 (날짜와 시간 포함)
        if (newStatus === '연락완료' && oldStatus !== '연락완료') {
            const now = new Date();
            waitlist.last_contact = now.toLocaleDateString('ko-KR') + ' ' + now.toLocaleTimeString('ko-KR', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        await this.saveWaitlist(waitlist);
        
        const statusText = {
            '대기중': '대기중',
            '연락완료': '연락완료',
            '완료': '완료',
            '취소': '취소됨'
        }[newStatus] || newStatus;
        
        let message = `✅ 대기자 상태가 "${statusText}"(으)로 변경되었습니다.`;
        
        // 연락완료로 변경된 경우 추가 메시지
        if (newStatus === '연락완료' && oldStatus !== '연락완료') {
            message += `\n📞 마지막 연락일이 자동으로 기록되었습니다.`;
        }
        
        this.showToast(message);
    }

    // 대기자 삭제
    async deleteWaitlistItem(waitlistId) {
        const waitlist = this.waitlist.find(w => w.id === waitlistId);
        if (!waitlist) return;

        if (confirm(`"${waitlist.customer_name}"님의 대기 요청을 삭제하시겠습니까?`)) {
            await this.deleteWaitlist(waitlistId);
            this.showToast('🗑️ 대기자가 삭제되었습니다.');
        }
    }

    // 탭 이동 헬퍼 함수
    showTab(tabName) {
        this.switchTab(`tab-${tabName}`);
    }

    // 대기자를 주문으로 변환
    copyWaitlistToOrder(waitlistId) {
        const waitlist = this.waitlist.find(w => w.id === waitlistId);
        if (!waitlist) return;

        // 주문 관리 탭으로 이동
        this.showTab('orders');
        
        // 새 주문 모달 열기
        setTimeout(() => {
            this.openOrderModal();
            
            // 대기자 정보로 폼 채우기
            setTimeout(() => {
                document.getElementById('order-customer-name').value = waitlist.customer_name;
                document.getElementById('order-customer-phone').value = waitlist.customer_phone;
                
                // 주문 아이템에 대기 상품 추가
                this.currentOrderItems = [{
                    name: waitlist.product_name,
                    price: waitlist.expected_price || 0,
                    quantity: 1
                }];
                this.renderOrderItems();
                this.calculateOrderTotal();
                
                this.showToast('📋 대기자 정보가 주문서에 복사되었습니다.');
            }, 100);
        }, 100);
    }

    // 대기자 검색 및 필터링
    filterWaitlist() {
        this.renderWaitlistTable();
    }

    // === 주문 상태 관리 기능들 ===
    
    // 주문 상태 드롭다운 토글
    toggleStatusDropdown(orderId) {
        // 다른 모든 드롭다운 닫기
        document.querySelectorAll('[id^="status-dropdown-"]').forEach(dropdown => {
            if (dropdown.id !== `status-dropdown-${orderId}`) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 해당 드롭다운 토글
        const dropdown = document.getElementById(`status-dropdown-${orderId}`);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    // order 객체를 직접 저장하는 함수
    async saveOrderData(orderData, orderId = null) {
        try {
            let apiSuccess = false;
            
            // API 먼저 시도
            try {
                let response;
                
                if (orderId) {
                    // 주문 수정
                    response = await fetch(this.getApiUrl(`farm_orders/${orderId}`), {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(orderData)
                    });
                } else {
                    // 새 주문 등록
                    response = await fetch(this.getApiUrl('farm_orders'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(orderData)
                    });
                }

                if (response.ok) {
                    apiSuccess = true;
                    console.log('API로 주문 저장 성공');
                } else {
                    throw new Error(`API 오류: ${response.status}`);
                }
            } catch (apiError) {
                console.warn('API 저장 실패, LocalStorage 사용:', apiError);
            }
            
            // API가 실패했으면 LocalStorage에 저장
            if (!apiSuccess) {
                if (orderId) {
                    // 주문 수정
                    const orderIndex = this.orders.findIndex(o => o.id === orderId);
                    if (orderIndex !== -1) {
                        this.orders[orderIndex] = { ...orderData, id: orderId };
                    }
                } else {
                    // 새 주문 등록
                    orderData.id = Date.now().toString();
                    this.orders.push(orderData);
                }
                await this.saveToStorage('orders', this.orders);
                console.log('LocalStorage에 주문 저장됨');
            }
            
            return true;
        } catch (error) {
            console.error('주문 저장 실패:', error);
            return false;
        }
    }



    // 송장번호 업데이트
    async updateTrackingNumber(orderId, trackingNumber) {
        try {
            console.log(`📦 송장번호 업데이트 시작: ${orderId} -> ${trackingNumber}`);
            
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                this.showToast('❌ 주문을 찾을 수 없습니다.');
                return;
            }
            
            // 송장번호 검증 (선택사항)
            const cleanTrackingNumber = trackingNumber.trim();
            
            // 메모리의 주문 데이터 바로 업데이트
            order.tracking_number = cleanTrackingNumber;
            order.updated_at = Date.now();
            
            // 로컬 스토리지에 저장
            await this.saveToStorage('orders', this.orders);
            console.log('💾 송장번호 로컬 저장 완료:', orderId, cleanTrackingNumber);
            
            // 배열에서도 업데이트
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex] = order; // 전체 객체 업데이트
            }
            
            // 테이블 새로고침 (배송관리 탭에서)
            if (document.getElementById('shipping-section').classList.contains('hidden') === false) {
                this.loadShippingOrders();
            }
            
            // 성공 메시지
            if (cleanTrackingNumber) {
                this.showToast(`📦 송장번호가 등록되었습니다: ${cleanTrackingNumber}`);
                
                // 송장번호 등록 시 자동으로 배송시작 상태로 변경 (선택사항)
                if (order.order_status !== '배송시작' && order.order_status !== '배송완료') {
                    const confirmChange = confirm('송장번호가 등록되었습니다.\n주문 상태를 "배송시작"으로 변경하시겠습니까?');
                    if (confirmChange) {
                        await this.updateOrderStatusInline(orderId, '배송시작');
                    }
                }
            } else {
                this.showToast('📝 송장번호가 삭제되었습니다.');
            }
            
        } catch (error) {
            console.error('송장번호 업데이트 실패:', error);
            this.showToast('❌ 송장번호 저장에 실패했습니다.');
        }
    }

    // === 피킹 & 포장 시스템 ===
    
    // 피킹 리스트 모달 열기
    openPickingListModal() {
        console.log('🎯 피킹 리스트 모달 열기 함수 호출됨');
        console.log('현재 주문 데이터:', this.orders);
        console.log('주문 데이터 개수:', this.orders ? this.orders.length : 0);
        
        // 주문 데이터가 없을 경우 처리
        if (!this.orders || !Array.isArray(this.orders)) {
            console.warn('⚠️ 주문 데이터가 없거나 배열이 아닙니다.');
            alert('📦 주문 데이터를 먼저 로드해주세요.');
            return;
        }
        
        // 배송준비 상태인 주문들만 필터링
        const packagingOrders = this.orders.filter(order => 
            order.status === '배송준비' || order.order_status === '배송준비'
        );
        
        console.log('배송준비 상태 주문들:', packagingOrders);
        console.log('배송준비 주문 개수:', packagingOrders.length);
        
        if (packagingOrders.length === 0) {
            // 모든 주문 상태 확인해보기
            const allStatuses = this.orders.map(order => order.status || order.order_status).filter(Boolean);
            console.log('전체 주문 상태들:', [...new Set(allStatuses)]);
            
            alert('📦 배송준비 상태인 주문이 없습니다.\n\n현재 주문 상태들: ' + [...new Set(allStatuses)].join(', '));
            return;
        }
        
        try {
            console.log('🎯 피킹 리스트 생성 시작...');
            this.generatePickingList(packagingOrders);
            
            const modal = document.getElementById('picking-list-modal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('✅ 피킹 리스트 모달 열림');
            } else {
                console.error('❌ 피킹 리스트 모달 요소를 찾을 수 없음');
                alert('피킹 리스트 모달을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 피킹 리스트 생성 실패:', error);
            alert('피킹 리스트 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    // 피킹 리스트 생성 (새로운 표 형식)
    // order_items 안전하게 파싱하는 유틸리티 함수
    parseOrderItems(orderItems) {
        try {
            if (typeof orderItems === 'string') {
                return JSON.parse(orderItems || '[]');
            } else if (Array.isArray(orderItems)) {
                return orderItems;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ order_items 파싱 실패:', error, 'data:', orderItems);
            return [];
        }
    }

    generatePickingList(orders) {
        // 포장용 주문 데이터 저장
        this.currentPreviewOrders = orders;
        console.log('📦 currentPreviewOrders 설정됨:', this.currentPreviewOrders.length, '개 주문');
        
        // 상품별 수량 집계
        const productSummary = {};
        let totalItems = 0;
        let totalAmount = 0;
        
        orders.forEach(order => {
            const items = this.parseOrderItems(order.order_items);
            items.forEach(item => {
                const key = item.name;
                if (!productSummary[key]) {
                    productSummary[key] = {
                        name: item.name,
                        totalQuantity: 0,
                        price: item.price,
                        totalAmount: 0,
                        customers: []
                    };
                }
                productSummary[key].totalQuantity += item.quantity;
                productSummary[key].totalAmount += (item.price * item.quantity);
                productSummary[key].customers.push(order.customer_name);
                totalItems += item.quantity;
            });
            totalAmount += order.total_amount || 0;
        });
        
        // 통계 업데이트
        document.getElementById('picking-total-orders').textContent = orders.length;
        document.getElementById('picking-total-items').textContent = totalItems;
        document.getElementById('picking-estimated-time').textContent = Math.ceil(totalItems * 2);
        
        // 상품별 피킹 테이블 생성
        const productTableHtml = `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-purple-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="font-bold text-purple-800">📋 상품별 피킹 체크리스트</h4>
                    <p class="text-sm text-purple-600 mt-1">총 주문 ${orders.length}건 | 총 상품 ${totalItems}개 | 예상시간 ${Math.ceil(totalItems * 2)}분</p>
                    <p class="text-xs text-purple-500 mt-1">💡 고객명을 클릭하면 상세 정보를 확인할 수 있습니다</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-fixed">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">✓</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">상품명</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">사이즈</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">수량</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">단가</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">총액</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">고객</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${Object.values(productSummary)
                                .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                .map(product => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-4 text-center">
                                            <input type="checkbox" class="w-4 h-4 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500">
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="font-medium text-gray-900">${product.name}</div>
                                        </td>
                                        <td class="px-4 py-4 text-center">
                                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold ${this.getSizeColor(this.getProductSize(product.name))}">
                                                ${this.getProductSize(product.name)}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 text-center">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                                                ${product.totalQuantity}개
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 text-right text-sm text-gray-900 font-medium">
                                            ${product.price.toLocaleString()}
                                        </td>
                                        <td class="px-4 py-4 text-right text-sm font-bold text-green-600">
                                            ${product.totalAmount.toLocaleString()}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-900 font-medium">
                                            <div class="max-w-xs break-words">
                                                ${[...new Set(product.customers)].map(customer => 
                                                    `<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1">${customer}</span>`
                                                ).join('')}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    💡 피킹 완료 후 각 상품 옆에 ✓ 체크하세요!
                </div>
            </div>
        `;
        
        document.getElementById('picking-product-list').innerHTML = productTableHtml;
        
        // 개별포장 확인 테이블 생성 (전화번호 제거, 상품 목록 상세화)
        const packagingTableHtml = `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-green-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="font-bold text-green-800">📦 개별포장 확인 체크리스트</h4>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">✓</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">고객명</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">주문번호</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포장 상품 목록</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${orders.map(order => {
                                const items = this.parseOrderItems(order.order_items);
                                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                                const discountAmount = order.discount_amount || 0;
                                
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-4 text-center align-top">
                                            <input type="checkbox" class="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500">
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap align-top">
                                            <div class="font-medium text-gray-900">${order.customer_name}</div>
                                        </td>
                                        <td class="px-4 py-4 whitespace-nowrap align-top">
                                            <div class="text-sm text-gray-900">${order.order_number}</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="space-y-1">
                                                ${items.map(item => `
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-sm font-medium text-gray-900">• ${item.name} ${item.quantity}개</span>
                                                        <span class="text-sm text-gray-600">(${(item.price * item.quantity).toLocaleString()}원)</span>
                                                    </div>
                                                `).join('')}
                                                <div class="border-t pt-2 mt-2">
                                                    <div class="flex justify-between items-center font-bold">
                                                        <span class="text-purple-600">→ 총 ${totalItems}개</span>
                                                        <span class="text-green-600">
                                                            ${order.total_amount.toLocaleString()}원
                                                            ${discountAmount > 0 ? `(할인 -${discountAmount.toLocaleString()}원)` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                ${order.memo ? `
                                                    <div class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                        <strong>메모:</strong> ${order.memo}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    💡 포장 완료 후 각 고객별로 ✓ 체크하세요!
                </div>
            </div>
        `;
        
        document.getElementById('picking-customer-list').innerHTML = packagingTableHtml;
    }
    
    // 포장 라벨 모달 열기
    openPackagingLabelsModal() {
        console.log('🎯 포장 라벨 모달 열기 함수 호출됨');
        console.log('현재 주문 데이터:', this.orders);
        console.log('주문 데이터 개수:', this.orders ? this.orders.length : 0);
        
        // 주문 데이터가 없을 경우 처리
        if (!this.orders || !Array.isArray(this.orders)) {
            console.warn('⚠️ 주문 데이터가 없거나 배열이 아닙니다.');
            alert('📦 주문 데이터를 먼저 로드해주세요.');
            return;
        }
        
        const packagingOrders = this.orders.filter(order => 
            order.status === '배송준비' || order.order_status === '배송준비'
        );
        
        console.log('배송준비 상태 주문들:', packagingOrders);
        console.log('배송준비 주문 개수:', packagingOrders.length);
        
        if (packagingOrders.length === 0) {
            // 모든 주문 상태 확인해보기
            const allStatuses = this.orders.map(order => order.status || order.order_status).filter(Boolean);
            console.log('전체 주문 상태들:', [...new Set(allStatuses)]);
            
            alert('📦 배송준비 상태인 주문이 없습니다.\n\n현재 주문 상태들: ' + [...new Set(allStatuses)].join(', '));
            return;
        }
        
        try {
            console.log('🎯 포장 라벨 생성 시작...');
            this.generatePackagingLabels(packagingOrders);
            
            const modal = document.getElementById('packaging-labels-modal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('✅ 포장 라벨 모달 열림');
            } else {
                console.error('❌ 포장 라벨 모달 요소를 찾을 수 없음');
                alert('포장 라벨 모달을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 포장 라벨 생성 실패:', error);
            alert('포장 라벨 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    // 포장 라벨 생성
    generatePackagingLabels(orders) {
        const labelsPerRow = parseInt(document.getElementById('labels-per-row')?.value) || 3;
        const labelSize = document.getElementById('label-size')?.value || 'medium';
        
        const sizeClasses = {
            small: 'w-32 h-20',
            medium: 'w-40 h-28', 
            large: 'w-48 h-36'
        };
        
        const labelHtml = orders.map((order, index) => {
            const items = this.parseOrderItems(order.order_items);
            const phoneShort = order.customer_phone ? order.customer_phone.slice(-4) : '****';
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            
            return `
                <div class="${sizeClasses[labelSize]} border-2 border-gray-300 border-dashed p-2 m-1 flex flex-col justify-between text-xs bg-white">
                    <div>
                        <div class="font-bold text-sm truncate">${order.customer_name}</div>
                        <div class="text-gray-600">${order.order_number}</div>
                        <div class="text-gray-600">📞 ${phoneShort}</div>
                    </div>
                    <div>
                        <div class="font-medium text-purple-600">${itemCount}개 상품</div>
                        <div class="text-xs text-gray-500">${order.order_date}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 그리드 레이아웃으로 라벨 배치
        const gridHtml = `
            <div class="grid grid-cols-${labelsPerRow} gap-2 p-4">
                ${labelHtml}
            </div>
        `;
        
        document.getElementById('packaging-labels-preview').innerHTML = gridHtml;
    }
    
    // 피킹 리스트 출력
    printPickingList() {
        const printWindow = window.open('', '_blank');
        const productListContent = document.getElementById('picking-product-list').innerHTML;
        const customerListContent = document.getElementById('picking-customer-list').innerHTML;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>피킹 리스트 - 경산다육식물농장</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 15px; 
                            font-size: 12px;
                            line-height: 1.3;
                        }
                        .no-print { display: none; }
                        table { 
                            font-size: 11px; 
                            page-break-inside: avoid;
                        }
                        th, td { 
                            padding: 4px 6px !important; 
                            border: 1px solid #ddd;
                        }
                        .bg-purple-50, .bg-green-50, .bg-gray-50 {
                            background-color: #f9fafb !important;
                        }
                        .text-purple-800, .text-green-800 {
                            color: #1f2937 !important;
                            font-weight: bold;
                        }
                        input[type="checkbox"] {
                            width: 12px;
                            height: 12px;
                        }
                    }
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                    <h1 style="font-size: 24px; font-weight: bold; margin: 0;">🌱 경산다육식물농장</h1>
                    <h2 style="font-size: 18px; margin: 5px 0;">피킹 & 포장 체크리스트</h2>
                    <p style="margin: 5px 0; color: #666;">출력일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                
                <div style="margin-bottom: 30px;">
                    ${productListContent}
                </div>
                
                <div style="page-break-before: auto;">
                    ${customerListContent}
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #666;">
                    경산다육식물농장 | White Platter 전문 농장 | 작업자: _____________ | 완료시간: _____________
                </div>
                
                <script>
                    // 자동 출력
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // 포장 라벨 출력
    printPackagingLabels() {
        const printWindow = window.open('', '_blank');
        const labelsContent = document.getElementById('packaging-labels-preview').innerHTML;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>포장 라벨 - 경산다육식물농장</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .border-dashed { border-style: solid !important; }
                    }
                </style>
            </head>
            <body>
                ${labelsContent}
                <script>
                    setTimeout(() => window.print(), 500);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // 상품별 피킹 미리보기 모달 열기
    printPickingOnly() {
        console.log('printPickingOnly 함수 호출됨');
        const productListContent = document.getElementById('picking-product-list').innerHTML;
        console.log('productListContent:', productListContent ? '데이터 있음' : '데이터 없음');
        
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
            <head>
                <title>상품별 피킹 체크리스트 - 경산다육식물농장</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 15px; 
                            font-size: 13px;
                            line-height: 1.4;
                        }
                        table { 
                            font-size: 12px; 
                            page-break-inside: avoid;
                        }
                        th, td { 
                            padding: 6px 8px !important; 
                            border: 1px solid #333 !important;
                        }
                        .bg-purple-50, .bg-green-50, .bg-gray-50 {
                            background-color: #f9fafb !important;
                        }
                        .text-purple-800, .text-green-800 {
                            color: #1f2937 !important;
                            font-weight: bold;
                        }
                        input[type="checkbox"] {
                            width: 14px;
                            height: 14px;
                            border: 2px solid #333 !important;
                        }
                        .bg-purple-100, .bg-blue-100, .bg-green-100, .bg-yellow-100, .bg-red-100, .bg-pink-100, .bg-indigo-100 {
                            background-color: #f3f4f6 !important;
                        }
                    }
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #333; padding-bottom: 15px;">
                    <h1 style="font-size: 28px; font-weight: bold; margin: 0;">🌱 다육이의 모든것</h1>
                    <h2 style="font-size: 20px; margin: 8px 0;">경산다육식물농장</h2>
                    <h3 style="font-size: 16px; margin: 8px 0; color: #2d5a27; font-weight: bold;">📋 상품별 피킹 체크리스트</h3>
                    <p style="margin: 5px 0; color: #666;">출력일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; border: 2px solid #2d5a27; border-radius: 8px; background-color: #f0f8f0;">
                    <h3 style="margin: 0 0 10px 0; color: #2d5a27; font-size: 16px;">🎯 피킹 작업 안내</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                        <li>3천평 온실을 돌며 아래 상품들을 피킹하세요</li>
                        <li>각 상품 피킹 완료 시 체크박스에 ✓ 표시</li>
                        <li>수량과 사이즈를 정확히 확인하여 피킹하세요</li>
                        <li>피킹 완료 후 포장실로 이동하여 포장 작업 진행</li>
                    </ul>
                </div>
                
                ${productListContent}
                
                <div style="margin-top: 25px; padding-top: 15px; border-top: 2px solid #333; text-align: center; font-size: 11px; color: #666;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                        <div>피킹 시작: ___:___</div>
                        <div>피킹 완료: ___:___</div>
                        <div>작업자: _____________</div>
                    </div>
                    경산다육식물농장 | White Platter 전문 농장 | 문의: 010-9745-6245
                </div>
                
                <script>
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // 고객별 포장 체크리스트 직접 출력 (표 형식 + 3열 상품 배치)
    printPackagingOnly() {
        console.log('📦 printPackagingOnly 함수 호출됨');
        
        // 현재 선택된 주문들 가져오기
        let selectedOrders = this.currentPreviewOrders || [];
        
        // 데이터가 없으면 테스트 데이터로 대체
        if (!selectedOrders || selectedOrders.length === 0) {
            console.log('⚠️ 선택된 주문이 없어서 테스트 데이터로 대체합니다.');
            selectedOrders = [
                {
                    id: '1',
                    order_number: 'WP2024080001',
                    customer_name: '김다육',
                    customer_phone: '010-1234-5678',
                    shipping_address: '서울시 강남구 테헤란로 123, 456호',
                    total_amount: 75000,
                    order_items: JSON.stringify([
                        { name: 'White Platter 소품', quantity: 2 },
                        { name: 'White Platter 중품', quantity: 1 },
                        { name: 'White Sprite 소품', quantity: 3 },
                        { name: 'Powdery White 중품', quantity: 1 },
                        { name: 'White Platter 대품', quantity: 1 }
                    ])
                },
                {
                    id: '2',
                    order_number: 'WP2024080002',
                    customer_name: '이화분',
                    customer_phone: '010-9876-5432',
                    shipping_address: '부산시 해운대구 센텀로 456, 789호 (센텀시티)',
                    total_amount: 120000,
                    order_items: JSON.stringify([
                        { name: 'White Platter 대품', quantity: 2 },
                        { name: 'White Platter 중품', quantity: 3 }
                    ])
                }
            ];
        }
        
        console.log('📦 선택된 주문 수:', selectedOrders.length);
        console.log('📦 첫 번째 주문 데이터:', selectedOrders[0]);
        
        // 표 형식 HTML 생성
        let tableHTML = this.generateCompactPackagingTable(selectedOrders);
        console.log('📦 생성된 HTML 길이:', tableHTML.length);
        
        // 새 창에서 출력
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        printWindow.document.write(`
            <html>
            <head>
                <title>고객별 포장 체크리스트 - 경산다육식물농장</title>
                <style>
                    @media print {
                        body { 
                            margin: 10px; 
                            padding: 0; 
                            font-family: 'Malgun Gothic', Arial, sans-serif;
                            font-size: 11px;
                            line-height: 1.3;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 15px;
                            border-bottom: 2px solid #333;
                            padding-bottom: 8px;
                        }
                        
                        .farm-title {
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 3px;
                        }
                        
                        .sub-title {
                            font-size: 14px;
                            color: #666;
                            margin-bottom: 3px;
                        }
                        
                        .print-date {
                            font-size: 10px;
                            color: #888;
                        }
                        
                        .customer-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            page-break-inside: avoid;
                        }
                        
                        .customer-header {
                            background-color: #f0f8f0 !important;
                        }
                        
                        .customer-header td {
                            padding: 8px 10px !important;
                            border: 2px solid #333 !important;
                            font-weight: bold;
                            font-size: 12px;
                        }
                        
                        .products-table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        .products-table th,
                        .products-table td {
                            border: 1px solid #666 !important;
                            padding: 6px 8px !important;
                            text-align: center;
                            vertical-align: middle;
                        }
                        
                        .products-table th {
                            background-color: #f9f9f9 !important;
                            font-weight: bold;
                            font-size: 10px;
                        }
                        
                        .product-cell {
                            width: 33.33%;
                            font-size: 10px;
                            position: relative;
                        }
                        
                        .product-name {
                            font-weight: bold;
                            margin-bottom: 2px;
                        }
                        
                        .product-quantity {
                            color: #d63384;
                            font-weight: bold;
                        }
                        
                        .checkbox {
                            width: 15px;
                            height: 15px;
                            border: 2px solid #333;
                            display: inline-block;
                            margin-right: 5px;
                            vertical-align: middle;
                        }
                        
                        .order-info {
                            font-size: 10px;
                            color: #666;
                        }
                        
                        .total-amount {
                            font-weight: bold;
                            color: #d63384;
                        }
                        
                        .address-cell {
                            max-width: 200px;
                            word-break: break-all;
                            font-size: 9px;
                        }
                        
                        /* 페이지 나누기 */
                        .page-break {
                            page-break-before: always;
                        }
                    }
                    
                    @media screen {
                        body {
                            margin: 20px;
                            font-family: 'Malgun Gothic', Arial, sans-serif;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="farm-title">🌱 경산다육식물농장</div>
                    <div class="sub-title">📦 고객별 포장 체크리스트</div>
                    <div class="print-date">출력일시: ${new Date().toLocaleString('ko-KR')}</div>
                </div>
                
                ${tableHTML}
                
                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // 컴팩트한 포장 테이블 생성 (3열 상품 배치)
    generateCompactPackagingTable(orders) {
        console.log('📦 테이블 생성 시작, 주문 수:', orders.length);
        let html = '';
        
        orders.forEach((order, index) => {
            console.log(`주문 ${index + 1}:`, order);
            
            // 주문 데이터 파싱 (다양한 형식 지원)
            const orderNumber = order.order_number || order.orderNumber || order.id || `ORD-${index + 1}`;
            const customerName = order.customer_name || order.customerName || '고객명 없음';
            const customerPhone = order.customer_phone || order.customerPhone || order.phone || '연락처 없음';
            const shippingAddress = order.shipping_address || order.shippingAddress || order.address || '주소 없음';
            const totalAmount = order.total_amount || order.totalAmount || 0;
            
            // 상품 데이터 파싱
            let products = [];
            if (order.order_items) {
                try {
                    products = typeof order.order_items === 'string' 
                        ? JSON.parse(order.order_items) 
                        : order.order_items;
                } catch (e) {
                    console.warn('order_items 파싱 실패:', e);
                }
            } else if (order.products) {
                products = Array.isArray(order.products) ? order.products : [order.products];
            }
            
            console.log(`주문 ${orderNumber} 상품:`, products);
            
            // 고객 정보 헤더
            html += `
                <table class="customer-table">
                    <tr class="customer-header">
                        <td style="width: 15%;">
                            <span class="checkbox"></span>
                            <strong>주문번호</strong>
                        </td>
                        <td style="width: 20%;">
                            <strong>${orderNumber}</strong>
                        </td>
                        <td style="width: 15%;">
                            <strong>고객명</strong>
                        </td>
                        <td style="width: 20%;">
                            <strong>${customerName}</strong>
                        </td>
                        <td style="width: 15%;">
                            <strong>연락처</strong>
                        </td>
                        <td style="width: 15%;">
                            <strong>${customerPhone}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>배송주소</strong></td>
                        <td colspan="3" class="address-cell">${shippingAddress}</td>
                        <td><strong>총금액</strong></td>
                        <td class="total-amount">${Number(totalAmount).toLocaleString()}원</td>
                    </tr>
                </table>
            `;
            
            // 상품 테이블 (3열 배치)
            html += `
                <table class="products-table">
                    <thead>
                        <tr>
                            <th class="product-cell">상품명 / 수량</th>
                            <th class="product-cell">상품명 / 수량</th>
                            <th class="product-cell">상품명 / 수량</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // 상품을 3개씩 그룹화해서 행 생성
            if (products.length > 0) {
                for (let i = 0; i < products.length; i += 3) {
                    html += '<tr>';
                    
                    for (let j = 0; j < 3; j++) {
                        const product = products[i + j];
                        
                        if (product) {
                            const productName = product.product_name || product.name || '상품명 없음';
                            const quantity = product.quantity || product.qty || 1;
                            
                            html += `
                                <td class="product-cell">
                                    <span class="checkbox"></span>
                                    <div class="product-name">${productName}</div>
                                    <div class="product-quantity">${quantity}개</div>
                                </td>
                            `;
                        } else {
                            // 빈 셀
                            html += '<td class="product-cell">-</td>';
                        }
                    }
                    
                    html += '</tr>';
                }
            } else {
                // 상품이 하나도 없는 경우
                html += `
                    <tr>
                        <td colspan="3" class="product-cell" style="color: #888;">
                            📝 상품 정보가 없습니다
                        </td>
                    </tr>
                `;
            }
            
            html += `
                    </tbody>
                </table>
            `;
            
            // 주문 간 구분선 (마지막이 아닐 때)
            if (index < orders.length - 1) {
                html += '<div style="margin: 15px 0; border-bottom: 1px dashed #ccc;"></div>';
            }
        });
        
        console.log('📦 테이블 HTML 생성 완료');
        return html;
    }
    
    // 모달 닫기 함수들
    closePickingListModal() {
        document.getElementById('picking-list-modal').classList.add('hidden');
    }
    
    closePackagingLabelsModal() {
        document.getElementById('packaging-labels-modal').classList.add('hidden');
    }
    
    closeOrderReceiptModal() {
        document.getElementById('order-receipt-modal').classList.add('hidden');
    }
    
    closePickingPreviewModal() {
        document.getElementById('picking-preview-modal').classList.add('hidden');
    }
    
    // 미리보기 내용 출력
    printPreviewContent() {
        console.log('printPreviewContent 함수 호출됨');
        const content = document.getElementById('picking-preview-content').innerHTML;
        console.log('미리보기 내용:', content ? '있음' : '없음');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
            <head>
                <title>피킹&포장 체크리스트 - 경산다육식물농장</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 15px; 
                            font-size: 13px;
                            line-height: 1.4;
                        }
                        table { 
                            font-size: 12px; 
                            page-break-inside: avoid;
                        }
                        th, td { 
                            padding: 6px 8px !important; 
                            border: 1px solid #333 !important;
                        }
                        .bg-purple-50, .bg-green-50, .bg-orange-50, .bg-gray-50 {
                            background-color: #f9fafb !important;
                        }
                        .text-purple-800, .text-green-800, .text-orange-800 {
                            color: #1f2937 !important;
                            font-weight: bold;
                        }
                        input[type="checkbox"] {
                            width: 14px;
                            height: 14px;
                            border: 2px solid #333 !important;
                        }
                        .bg-purple-100, .bg-blue-100, .bg-green-100, .bg-yellow-100, .bg-red-100, .bg-pink-100, .bg-indigo-100 {
                            background-color: #f3f4f6 !important;
                        }
                    }
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        this.closePickingPreviewModal();
    }
    
    closePickingPreviewModal() {
        document.getElementById('picking-preview-modal').classList.add('hidden');
    }
    
    closePackagingPreviewModal() {
        document.getElementById('packaging-preview-modal').classList.add('hidden');
    }

    // === 주문서 출력 기능 ===
    
    currentPrintOrderId = null;
    
    // 주문서 출력 모달 열기
    printOrderReceipt(orderId) {
        console.log('주문서 출력 함수 호출됨, orderId:', orderId);
        
        const order = this.orders.find(o => o.id === orderId);
        console.log('찾은 주문:', order);
        
        if (!order) {
            this.showToast('❌ 주문을 찾을 수 없습니다.');
            return;
        }
        
        this.currentPrintOrderId = orderId;
        
        // 기본 QR코드 생성
        try {
            this.generateQRCodeModalPreview();
        } catch (error) {
            console.error('QR코드 미리보기 생성 실패:', error);
        }
        
        console.log('주문서 모달 열기');
        const modal = document.getElementById('order-receipt-modal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('✅ 주문서 모달이 열렸습니다');
            
            // 모달이 열린 후 버튼에 직접 이벤트 등록
            setTimeout(() => {
                const printBtn = document.getElementById('print-order-receipt');
                console.log('모달 열린 후 주문서 출력 버튼 확인:', printBtn ? '존재함' : '없음');
                
                if (printBtn && !printBtn.hasAttribute('data-event-added')) {
                    printBtn.setAttribute('data-event-added', 'true');
                    printBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖨️ 직접 등록된 주문서 출력 버튼 클릭!');
                        console.log('currentPrintOrderId:', this.currentPrintOrderId);
                        
                        try {
                            await this.printActualOrderReceipt();
                        } catch (error) {
                            console.error('주문서 출력 실패:', error);
                            this.showToast('❌ 주문서 출력 중 오류가 발생했습니다.');
                        }
                    });
                    console.log('✅ 주문서 출력 버튼에 직접 이벤트 등록 완료');
                }
            }, 100);
        } else {
            console.error('❌ order-receipt-modal을 찾을 수 없음');
        }
    }
    
    // QR코드 미리보기 생성
    generateQRCodePreview() {
        const url = document.getElementById('qr-code-url').value.trim();
        const includeQR = document.getElementById('include-qr-code').checked;
        const previewDiv = document.getElementById('qr-code-preview');
        
        if (!includeQR || !url) {
            previewDiv.innerHTML = '<p class="text-gray-400 text-sm">QR코드가 포함되지 않습니다</p>';
            return;
        }
        
        try {
            // 기존 QR코드 삭제
            previewDiv.innerHTML = '';
            
            // QRious로 QR코드 생성
            if (typeof QRious !== 'undefined') {
                const canvas = document.createElement('canvas');
                const qr = new QRious({
                    element: canvas,
                    value: url,
                    size: 100,
                    level: 'M'
                });
                previewDiv.appendChild(canvas);
            } else {
                // QR 라이브러리 없으면 텍스트만 표시
                previewDiv.innerHTML = '<p class="text-blue-600 text-xs">QR코드: ' + url + '</p>';
            }
        } catch (error) {
            console.error('QR코드 생성 실패:', error);
            previewDiv.innerHTML = '<p class="text-red-400 text-sm">QR코드 생성 실패</p>';
        }
    }

    // 상품용 QR코드 생성
    generateQRCodeModalPreview() {
        console.log('QR코드 모달 미리보기 생성 시작');
        
        try {
            const qrTypeElement = document.querySelector('input[name="qr-type"]:checked');
            const customTextElement = document.getElementById('qr-custom-text');
            const previewDiv = document.getElementById('qr-preview');
            const downloadBtn = document.getElementById('download-qr-btn');
            
            if (!qrTypeElement || !previewDiv) {
                console.error('필수 QR코드 요소를 찾을 수 없음');
                this.showToast('❌ QR코드 생성에 필요한 요소를 찾을 수 없습니다.');
                return;
            }
            
            const qrType = qrTypeElement.value;
            const customText = customTextElement ? customTextElement.value.trim() : '';
            
            let qrContent = '';
            
            // QR코드 내용 결정
            console.log('QR코드 타입:', qrType);
            
            switch (qrType) {
                case 'product-info':
                    // 상품 정보에서 데이터 가져오기 (상품명, 판매가만)
                    const productNameEl = document.getElementById('product-form-name');
                    const productPriceEl = document.getElementById('product-form-price');
                    
                    const productName = productNameEl ? productNameEl.value.trim() : '';
                    const productPrice = productPriceEl ? productPriceEl.value.trim() : '';
                    
                    console.log('상품 정보:', { productName, productPrice });
                    
                    // 상품명과 가격만 QR코드에 포함 (가격 포맷팅)
                    const name = productName || '경산다육';
                    const priceValue = productPrice || '0';
                    
                    let formattedPrice;
                    if (priceValue === '0' || priceValue === '' || isNaN(priceValue)) {
                        formattedPrice = '문의';
                    } else {
                        // 숫자에 천 단위 콤마 추가
                        formattedPrice = parseInt(priceValue).toLocaleString() + '원';
                    }
                    
                    qrContent = `품명: ${name}
가격: ${formattedPrice}
다육이는 경산다육`;
                    break;
                    
                case 'product-url':
                    // 상품 이미지 URL이나 유튜브 링크 사용
                    const productUrlEl = document.getElementById('product-form-image');
                    const productUrl = productUrlEl ? productUrlEl.value.trim() : '';
                    
                    console.log('상품 URL:', productUrl);
                    qrContent = productUrl || 'https://youtube.com/@경산다육TV';
                    break;
                    
                case 'custom':
                    console.log('커스텀 텍스트:', customText);
                    qrContent = customText || 'HELLO WORLD TEST';
                    break;
                    
                default:
                    qrContent = '🌱 경산다육식물농장\nWhite Platter 전문 농장';
            }
            
            console.log('최종 QR코드 내용:', qrContent);
            
            if (!qrContent) {
                console.error('QR코드 내용이 비어있음');
                qrContent = '🌱 경산다육식물농장\nWhite Platter 전문\n📱 경산다육TV 구독!';
            }
            
            // QR코드 생성 - Google Charts API 사용 (더 안정적)
            try {
                // URL 인코딩
                const encodedContent = encodeURIComponent(qrContent);
                const qrSize = 200;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedContent}`;
                
                // 이미지 요소 생성
                const img = document.createElement('img');
                img.src = qrUrl;
                img.alt = 'QR Code';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // 기존 내용 클리어하고 이미지 추가
                previewDiv.innerHTML = '';
                previewDiv.appendChild(img);
                
                console.log('QR코드 URL:', qrUrl);
                
                // QR코드 URL을 상품 폼에 저장
                const qrDataUrl = qrUrl;
                
                // 숨겨진 input 필드가 있으면 QR코드 데이터 저장
                let qrHiddenInput = document.getElementById('product-form-qr-data');
                if (!qrHiddenInput) {
                    // 없으면 새로 만들기
                    qrHiddenInput = document.createElement('input');
                    qrHiddenInput.type = 'hidden';
                    qrHiddenInput.id = 'product-form-qr-data';
                    qrHiddenInput.name = 'qr_data';
                    document.getElementById('product-form').appendChild(qrHiddenInput);
                }
                qrHiddenInput.value = qrDataUrl;
                
                // QR코드 내용도 숨겨진 필드에 저장  
                let qrContentInput = document.getElementById('product-form-qr-content');
                if (!qrContentInput) {
                    qrContentInput = document.createElement('input');
                    qrContentInput.type = 'hidden';
                    qrContentInput.id = 'product-form-qr-content';
                    qrContentInput.name = 'qr_content';
                    document.getElementById('product-form').appendChild(qrContentInput);
                }
                qrContentInput.value = qrContent;
                
                // 다운로드 & 프린트 버튼 활성화
                if (downloadBtn) {
                    downloadBtn.classList.remove('hidden');
                }
                const printBtn = document.getElementById('print-qr-btn');
                if (printBtn) {
                    printBtn.classList.remove('hidden');
                }
                
                // 현재 QR코드 데이터 저장 (다운로드용)
                this.currentQRData = {
                    image: img,
                    content: qrContent,
                    type: qrType,
                    dataUrl: qrDataUrl,
                    url: qrUrl
                };
                
                this.showToast('✅ QR코드가 생성되고 상품에 저장되었습니다!');
                console.log('QR코드 생성 완료:', qrContent);
                console.log('QR코드 데이터 URL 길이:', qrDataUrl.length);
                
            } catch (qrError) {
                console.error('QR코드 생성 실패:', qrError);
                previewDiv.innerHTML = `<div class="text-center p-4">
                    <p class="text-red-500 text-sm">QR코드 생성에 실패했습니다.</p>
                    <p class="text-gray-600 text-xs mt-1">${qrContent}</p>
                </div>`;
                this.showToast('❌ QR코드 생성 실패');
            }
            
        } catch (error) {
            console.error('QR코드 생성 실패:', error);
            this.showToast('❌ QR코드 생성 중 오류가 발생했습니다.');
        }
    }

    // QR코드 타입 변경 처리
    handleQRTypeChange(type) {
        const customTextInput = document.getElementById('qr-custom-text');
        
        console.log('QR코드 타입 변경됨:', type);
        
        if (type === 'custom') {
            customTextInput.classList.remove('hidden');
            customTextInput.focus();
            customTextInput.placeholder = '예: 특별 할인 이벤트 진행중! 연락처: 010-1234-5678';
        } else {
            customTextInput.classList.add('hidden');
        }
        
        // 타입 변경 시 미리 안내 메시지 표시
        let message = '';
        switch (type) {
            case 'product-info':
                message = '💡 상품명과 가격이 QR코드에 포함됩니다.';
                break;
            case 'product-url':
                message = '💡 상품 이미지 URL 또는 유튜브 링크가 QR코드에 포함됩니다.';
                break;
            case 'custom':
                message = '💡 직접 입력한 내용이 QR코드에 포함됩니다.';
                break;
        }
        
        if (message) {
            console.log(message);
        }
    }

    // QR코드 다운로드
    downloadQRCode() {
        console.log('QR코드 다운로드 시작');
        
        try {
            if (!this.currentQRData || !this.currentQRData.url) {
                this.showToast('❌ 다운로드할 QR코드가 없습니다.');
                return;
            }
            
            // 파일명 생성
            const productNameEl = document.getElementById('product-form-name');
            const productName = productNameEl ? productNameEl.value.trim() : 'QR코드';
            const fileName = `${productName}_QR_${Date.now()}.png`;
            
            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.download = fileName;
            link.href = this.currentQRData.url;
            link.target = '_blank';
            
            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast(`✅ QR코드가 다운로드되었습니다: ${fileName}`);
            console.log('QR코드 다운로드 완료:', fileName);
            
        } catch (error) {
            console.error('QR코드 다운로드 실패:', error);
            this.showToast('❌ QR코드 다운로드 중 오류가 발생했습니다.');
        }
    }

    // QR코드 프린트
    printQRCode() {
        console.log('QR코드 프린트 시작');
        
        try {
            if (!this.currentQRData || !this.currentQRData.url) {
                this.showToast('❌ 프린트할 QR코드가 없습니다.');
                return;
            }
            
            // 상품 정보 가져오기
            const productNameEl = document.getElementById('product-form-name');
            const productPriceEl = document.getElementById('product-form-price');
            const productName = productNameEl ? productNameEl.value.trim() : '경산다육';
            const productPrice = productPriceEl ? productPriceEl.value.trim() : '0';
            
            // 가격 포맷팅
            let formattedPrice;
            if (productPrice === '0' || productPrice === '' || isNaN(productPrice)) {
                formattedPrice = '문의';
            } else {
                formattedPrice = parseInt(productPrice).toLocaleString() + '원';
            }
            
            // 프린트용 HTML 생성
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>QR코드 프린트 - ${productName}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 20px; }
                            .no-print { display: none; }
                        }
                        body {
                            font-family: 'Arial', sans-serif;
                            text-align: center;
                            padding: 20px;
                            background: white;
                        }
                        .qr-container {
                            border: 2px solid #333;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 20px auto;
                            max-width: 300px;
                            background: white;
                        }
                        .product-name {
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 10px;
                            color: #333;
                        }
                        .product-price {
                            font-size: 16px;
                            color: #2563eb;
                            margin-bottom: 15px;
                            font-weight: bold;
                        }
                        .qr-image {
                            max-width: 200px;
                            height: auto;
                            margin: 15px 0;
                        }
                        .farm-name {
                            font-size: 14px;
                            color: #059669;
                            font-weight: bold;
                            margin-top: 10px;
                        }
                        .print-date {
                            font-size: 12px;
                            color: #666;
                            margin-top: 15px;
                        }
                        .print-button {
                            background: #2563eb;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            margin: 20px;
                        }
                        .print-button:hover {
                            background: #1d4ed8;
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <div class="product-name">품명: ${productName}</div>
                        <div class="product-price">판매가: ${formattedPrice}</div>
                        <img src="${this.currentQRData.url}" alt="QR Code" class="qr-image">
                        <div class="farm-name">🌱 다육이는 경산다육</div>
                        <div class="print-date">출력일: ${new Date().toLocaleDateString('ko-KR')}</div>
                    </div>
                    
                    <button class="print-button no-print" onclick="window.print()">
                        🖨️ 프린트하기
                    </button>
                    <button class="print-button no-print" onclick="window.close()" style="background: #666;">
                        ❌ 닫기
                    </button>
                    
                    <script>
                        // 자동으로 프린트 대화상자 열기
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    </script>
                </body>
                </html>
            `;
            
            // 새 창으로 프린트 페이지 열기
            const printWindow = window.open('', '_blank', 'width=400,height=600');
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            this.showToast('✅ QR코드 프린트 페이지가 열렸습니다!');
            console.log('QR코드 프린트 페이지 생성 완료');
            
        } catch (error) {
            console.error('QR코드 프린트 실패:', error);
            this.showToast('❌ QR코드 프린트 중 오류가 발생했습니다.');
        }
    }

    // 상품 목록에서 QR코드 프린트
    printProductQR(productId) {
        console.log('상품 QR코드 프린트 시작:', productId);
        
        try {
            // 상품 정보 찾기
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showToast('❌ 상품을 찾을 수 없습니다.');
                return;
            }
            
            console.log('프린트할 상품:', product);
            
            // 가격 포맷팅
            let formattedPrice;
            if (!product.price || product.price <= 0) {
                formattedPrice = '문의';
            } else {
                formattedPrice = parseInt(product.price).toLocaleString() + '원';
            }
            
            // QR코드 내용 생성
            const qrContent = `품명: ${product.name}
가격: ${formattedPrice}
다육이는 경산다육`;
            
            // QR코드 URL 생성 (화분 라벨용 작은 사이즈)
            const encodedContent = encodeURIComponent(qrContent);
            const qrSize = 150;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedContent}`;
            
            console.log('QR코드 내용:', qrContent);
            console.log('QR코드 URL:', qrUrl);
            
            // 프린트용 HTML 생성
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>QR코드 프린트 - ${product.name}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 2mm; }
                            .no-print { display: none; }
                        }
                        body {
                            font-family: 'Arial', sans-serif;
                            padding: 5px;
                            background: white;
                        }
                        .labels-grid {
                            display: grid;
                            grid-template-columns: repeat(10, 1fr);
                            gap: 2mm;
                            max-width: 210mm;
                        }
                        .qr-label {
                            border: 1px solid #333;
                            width: 13mm;
                            height: 55mm;
                            background: white;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            align-items: center;
                            padding: 1mm;
                            box-sizing: border-box;
                            page-break-inside: avoid;
                        }
                        .product-name {
                            font-size: 6px;
                            font-weight: bold;
                            color: #000;
                            text-align: center;
                            line-height: 1.1;
                            writing-mode: vertical-rl;
                            text-orientation: mixed;
                            height: 20mm;
                            overflow: hidden;
                        }
                        .qr-image {
                            width: 10mm;
                            height: 10mm;
                            margin: 1mm 0;
                        }
                        .product-price {
                            font-size: 5px;
                            color: #dc2626;
                            font-weight: bold;
                            text-align: center;
                            writing-mode: vertical-rl;
                            text-orientation: mixed;
                            height: 15mm;
                        }
                        .farm-name {
                            font-size: 4px;
                            color: #059669;
                            font-weight: bold;
                            writing-mode: vertical-rl;
                            text-orientation: mixed;
                            height: 8mm;
                        }
                        .print-button {
                            background: #2563eb;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            margin: 20px 10px;
                            transition: background 0.3s;
                        }
                        .print-button:hover {
                            background: #1d4ed8;
                        }
                        .close-button {
                            background: #6b7280;
                        }
                        .close-button:hover {
                            background: #4b5563;
                        }
                    </style>
                </head>
                <body>
                    <div class="labels-grid">
                        ${Array.from({length: 20}, (_, i) => `
                        <div class="qr-label">
                            <div class="product-name">${product.name}</div>
                            <img src="${qrUrl}" alt="QR Code" class="qr-image">
                            <div class="product-price">${formattedPrice}</div>
                            <div class="farm-name">경산다육</div>
                        </div>
                        `).join('')}
                    </div>
                    
                    <button class="print-button no-print" onclick="window.print()">
                        🖨️ 프린트하기
                    </button>
                    <button class="print-button close-button no-print" onclick="window.close()">
                        ❌ 닫기
                    </button>
                    
                    <script>
                        // 이미지 로드 완료 후 자동 프린트
                        window.onload = function() {
                            setTimeout(() => {
                                console.log('자동 프린트 실행');
                                window.print();
                            }, 1000);
                        };
                    </script>
                </body>
                </html>
            `;
            
            // 새 창으로 프린트 페이지 열기
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            this.showToast(`✅ ${product.name} QR코드 프린트 페이지가 열렸습니다!`);
            console.log('상품 QR코드 프린트 페이지 생성 완료');
            
        } catch (error) {
            console.error('상품 QR코드 프린트 실패:', error);
            this.showToast('❌ QR코드 프린트 중 오류가 발생했습니다.');
        }
    }

    // 대량 프린트 모달 열기
    async openBulkPrintModal() {
        console.log('🏷️ 대량 프린트 모달 열기 시작...');
        
        // 상품 데이터가 없으면 먼저 로드
        if (this.products.length === 0) {
            console.log('📦 상품 데이터가 없어 먼저 로드합니다...');
            await this.loadProducts();
        }
        
        console.log(`📊 로드된 상품 수: ${this.products.length}개`);
        
        // 상품 목록 렌더링
        this.renderBulkPrintProducts();
        
        // 모달 표시
        document.getElementById('bulk-print-modal').classList.remove('hidden');
    }

    // 상품 목록에서 라벨 인쇄 처리 (통합 함수)
    handleLabelPrintingFromProductList() {
        console.log('🏷️ 상품 목록에서 라벨 인쇄 처리 시작...');
        
        // 체크된 상품들을 가져와서 기존 시스템에서 사용할 수 있는 형태로 변환
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        
        if (checkboxes.length === 0) {
            this.showToast('❌ 라벨을 인쇄할 상품을 선택해주세요.', 'error');
            return;
        }
        
        console.log(`📦 선택된 상품 수: ${checkboxes.length}개`);
        
        // 기존 라벨 인쇄 모달을 사용하되, 데이터를 현재 선택사항으로 동기화
        this.syncSelectedProductsToLabelSystem();
        this.openLabelPrintModal();
    }

    // 현재 선택된 상품들을 기존 라벨 시스템과 동기화
    syncSelectedProductsToLabelSystem() {
        console.log('🔄 선택된 상품을 라벨 시스템과 동기화 중...');
        
        // ✅ 먼저 현재 선택된 상품들의 정보를 수집 (해제하기 전에!)
        const currentlySelected = document.querySelectorAll('.product-checkbox:checked');
        const selectedData = [];
        
        currentlySelected.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            
            selectedData.push({
                productId: productId,
                quantity: quantity
            });
        });
        
        console.log('📊 동기화할 상품 데이터:', selectedData);
        
        // 임시로 선택 정보를 저장
        this.tempSelectedForLabels = selectedData;
    }

    // 대량 프린트용 상품 목록 렌더링
    renderBulkPrintProducts() {
        const container = document.getElementById('bulk-print-products');
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-leaf text-3xl mb-2 opacity-50"></i>
                    <p>등록된 상품이 없습니다.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map((product, index) => {
            const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
            
            return `
                <div class="flex items-center justify-between p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div class="flex items-center flex-1">
                        <div class="flex items-center mr-4">
                            <input type="checkbox" 
                                   class="product-checkbox w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
                                   data-product-id="${product.id}"
                                   onchange="orderSystem.updateBulkPrintCount()">
                        </div>
                        
                        <div class="flex items-center flex-1">
                            ${product.image_url ? 
                                `<img src="${product.image_url}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover mr-4 border border-gray-200">` : 
                                `<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4 border border-gray-200">
                                    <i class="fas fa-leaf text-gray-400"></i>
                                </div>`
                            }
                            <div class="flex-1">
                                <div class="font-semibold text-gray-900 text-lg">${product.name}</div>
                                <div class="text-sm text-gray-600">${formattedPrice}원</div>
                                ${product.description ? `<div class="text-xs text-gray-500 mt-1">${product.description.length > 40 ? product.description.substring(0, 40) + '...' : product.description}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center ml-6">
                        <label class="text-sm font-medium text-gray-700 mr-3">QR코드 수량:</label>
                        <div class="flex items-center bg-white border border-gray-300 rounded-lg">
                            <button type="button" 
                                    class="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                    onclick="orderSystem.decreaseQuantity('${product.id}')">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   class="quantity-input w-16 p-2 text-center border-0 focus:ring-0" 
                                   data-product-id="${product.id}"
                                   value="1" 
                                   min="1" 
                                   max="99"
                                   onchange="orderSystem.updateBulkPrintCount()">
                            <button type="button" 
                                    class="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                    onclick="orderSystem.increaseQuantity('${product.id}')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <span class="text-sm text-gray-600 ml-2">장</span>
                    </div>
                </div>
            `;
        }).join('');
        
        this.updateBulkPrintCount();
    }

    // 선택된 상품 및 총 라벨 수 업데이트
    updateBulkPrintCount() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        const selectedCount = checkboxes.length;
        
        let totalLabels = 0;
        checkboxes.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            if (!productId) {
                console.warn('⚠️ 체크박스에 product-id 데이터가 없습니다:', checkbox);
                return;
            }
            
            const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
            if (!quantityInput) {
                console.warn(`⚠️ 상품 ID ${productId}의 수량 입력칸을 찾을 수 없습니다`);
                totalLabels += 1; // 기본값 1개로 처리
                return;
            }
            
            const quantity = parseInt(quantityInput.value) || 1;
            if (quantity < 1) {
                console.warn(`⚠️ 상품 ID ${productId}의 수량이 잘못되었습니다: ${quantity}`);
                totalLabels += 1; // 기본값 1개로 처리
            } else {
                totalLabels += quantity;
            }
        });
        
        // DOM 요소 안전하게 업데이트
        const selectedCountElement = document.getElementById('selected-count');
        const totalLabelsElement = document.getElementById('total-labels');
        const printLabelsBtn = document.getElementById('print-labels-btn');
        
        if (selectedCountElement) {
            selectedCountElement.textContent = selectedCount;
        }
        if (totalLabelsElement) {
            totalLabelsElement.textContent = totalLabels;
        }
        
        // 라벨 인쇄 버튼 표시/숨김 처리
        if (printLabelsBtn) {
            if (selectedCount > 0) {
                printLabelsBtn.classList.remove('hidden');
            } else {
                printLabelsBtn.classList.add('hidden');
            }
        }
        
        // 버튼 활성화/비활성화 (안전한 DOM 접근)
        const previewBtn = document.getElementById('preview-bulk-print');
        const printBtn = document.getElementById('start-bulk-print');
        
        if (previewBtn && printBtn) {
            if (selectedCount > 0) {
                previewBtn.disabled = false;
                printBtn.disabled = false;
                previewBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                printBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                previewBtn.disabled = true;
                printBtn.disabled = true;
                previewBtn.classList.add('opacity-50', 'cursor-not-allowed');
                printBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            console.warn('⚠️ 대량 인쇄 버튼을 찾을 수 없습니다');
        }
        
        console.log(`📊 라벨 수량 업데이트: 선택된 상품 ${selectedCount}개, 총 라벨 ${totalLabels}개`);
    }

    // 전체 선택/해제
    toggleSelectAllProducts() {
        const selectAllCheckbox = document.getElementById('select-all-products');
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        
        productCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkPrintCount();
    }

    // 대량 프린트 시작
    startBulkPrint() {
        console.log('대량 프린트 시작');
        
        const selectedProducts = this.getSelectedPrintProducts();
        if (selectedProducts.length === 0) {
            this.showToast('❌ 프린트할 상품을 선택해주세요.');
            return;
        }
        
        this.generateBulkPrintPage(selectedProducts);
    }

    // 선택된 상품 정보 가져오기
    getSelectedPrintProducts() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        const selectedProducts = [];
        
        checkboxes.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            if (!productId) {
                console.warn('⚠️ 체크박스에 product-id 데이터가 없습니다:', checkbox);
                return;
            }
            
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                console.warn(`⚠️ 상품 ID ${productId}를 찾을 수 없습니다`);
                return;
            }
            
            const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
            let quantity = 1; // 기본값
            
            if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
            } else {
                console.warn(`⚠️ 상품 ID ${productId}의 수량 입력칸을 찾을 수 없어 기본값 1개로 설정합니다`);
            }
            
            selectedProducts.push({
                ...product,
                quantity: quantity
            });
        });
        
        console.log(`📦 선택된 인쇄 상품: ${selectedProducts.length}개`);
        return selectedProducts;
    }

    // 라벨 수량 증가
    increaseQuantity(productId) {
        const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        if (!quantityInput) {
            console.warn(`⚠️ 상품 ID ${productId}의 수량 입력칸을 찾을 수 없습니다`);
            return;
        }
        
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxValue = parseInt(quantityInput.getAttribute('max')) || 99;
        
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
            this.updateBulkPrintCount();
        }
    }

    // 라벨 수량 감소
    decreaseQuantity(productId) {
        const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        if (!quantityInput) {
            console.warn(`⚠️ 상품 ID ${productId}의 수량 입력칸을 찾을 수 없습니다`);
            return;
        }
        
        const currentValue = parseInt(quantityInput.value) || 1;
        const minValue = parseInt(quantityInput.getAttribute('min')) || 1;
        
        if (currentValue > minValue) {
            quantityInput.value = currentValue - 1;
            this.updateBulkPrintCount();
        }
    }

    // 대량 프린트 페이지 생성
    generateBulkPrintPage(selectedProducts) {
        const labelsPerRow = parseInt(document.getElementById('labels-per-row').value) || 10;
        
        // 모든 라벨 생성
        let allLabels = [];
        selectedProducts.forEach(product => {
            // 가격 포맷팅
            let formattedPrice;
            if (!product.price || product.price <= 0) {
                formattedPrice = '문의';
            } else {
                formattedPrice = parseInt(product.price).toLocaleString() + '원';
            }
            
            // QR코드 내용 생성
            const qrContent = `품명: ${product.name}
가격: ${formattedPrice}
다육이는 경산다육`;
            
            // QR코드 URL 생성
            const encodedContent = encodeURIComponent(qrContent);
            const qrSize = 150;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedContent}`;
            
            // 수량만큼 라벨 추가
            for (let i = 0; i < product.quantity; i++) {
                allLabels.push({
                    name: product.name,
                    price: formattedPrice,
                    qrUrl: qrUrl
                });
            }
        });
        
        // 프린트 페이지 생성
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>대량 QR코드 라벨 프린트</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 2mm; }
                        .no-print { display: none; }
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 5px;
                        background: white;
                    }
                    .labels-grid {
                        display: grid;
                        grid-template-columns: repeat(${labelsPerRow}, 1fr);
                        gap: 2mm;
                        max-width: 210mm;
                    }
                    .qr-label {
                        border: 1px solid #333;
                        width: 13mm;
                        height: 55mm;
                        background: white;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1mm;
                        box-sizing: border-box;
                        page-break-inside: avoid;
                    }
                    .product-name {
                        font-size: 6px;
                        font-weight: bold;
                        color: #000;
                        text-align: center;
                        line-height: 1.1;
                        writing-mode: vertical-rl;
                        text-orientation: mixed;
                        height: 20mm;
                        overflow: hidden;
                    }
                    .qr-image {
                        width: 10mm;
                        height: 10mm;
                        margin: 1mm 0;
                    }
                    .product-price {
                        font-size: 5px;
                        color: #dc2626;
                        font-weight: bold;
                        text-align: center;
                        writing-mode: vertical-rl;
                        text-orientation: mixed;
                        height: 15mm;
                    }
                    .farm-name {
                        font-size: 4px;
                        color: #059669;
                        font-weight: bold;
                        writing-mode: vertical-rl;
                        text-orientation: mixed;
                        height: 8mm;
                    }
                    .print-info {
                        margin-bottom: 10px;
                        padding: 10px;
                        background: #f3f4f6;
                        border-radius: 5px;
                        font-size: 12px;
                    }
                    .print-button {
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        margin: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="print-info no-print">
                    <strong>📋 프린트 정보:</strong><br>
                    • 선택 상품: ${selectedProducts.length}개<br>
                    • 총 라벨 수: ${allLabels.length}장<br>
                    • 페이지당 열: ${labelsPerRow}열<br>
                    • 생성 시간: ${new Date().toLocaleString('ko-KR')}
                </div>
                
                <button class="print-button no-print" onclick="window.print()">
                    🖨️ 프린트 시작
                </button>
                <button class="print-button no-print" onclick="window.close()" style="background: #6b7280;">
                    ❌ 닫기
                </button>
                
                <div class="labels-grid">
                    ${allLabels.map(label => `
                    <div class="qr-label">
                        <div class="product-name">${label.name}</div>
                        <img src="${label.qrUrl}" alt="QR Code" class="qr-image">
                        <div class="product-price">${label.price}</div>
                        <div class="farm-name">경산다육</div>
                    </div>
                    `).join('')}
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            console.log('자동 프린트 실행');
                            window.print();
                        }, 1500);
                    };
                </script>
            </body>
            </html>
        `;
        
        // 새 창으로 프린트 페이지 열기
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        this.showToast(`✅ ${selectedProducts.length}개 상품, 총 ${allLabels.length}장 라벨 프린트 페이지가 열렸습니다!`);
        
        // 모달 닫기
        document.getElementById('bulk-print-modal').classList.add('hidden');
    }

    // === 태그 입력 기능 ===
    
    // 태그 이벤트 설정
    setupTagInputEvents() {
        console.log('태그 입력 이벤트 설정 시작');
        
        const tagInput = document.getElementById('product-tag-input');
        const tagContainer = document.getElementById('product-tags-container');
        const suggestionsDiv = document.getElementById('product-tag-suggestions');
        
        if (!tagInput || !tagContainer || !suggestionsDiv) {
            console.error('태그 입력 요소를 찾을 수 없음');
            return;
        }
        
        // 현재 상품의 태그 배열
        this.currentProductTags = [];
        
        // Enter, 쉼표로 태그 생성
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(tagInput.value.trim());
                tagInput.value = '';
                suggestionsDiv.classList.add('hidden');
            }
        });
        
        // 실시간 자동완성
        tagInput.addEventListener('input', (e) => {
            this.showTagSuggestions(e.target.value.trim());
        });
        
        // 포커스 아웃 시 추천 목록 숨기기
        tagInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsDiv.classList.add('hidden');
            }, 200);
        });
        
        // 태그 컨테이너 클릭 시 입력창에 포커스
        tagContainer.addEventListener('click', () => {
            tagInput.focus();
        });
        
        console.log('✅ 태그 입력 이벤트 설정 완료');
    }
    
    // 태그 추가
    addTag(tagText) {
        if (!tagText || tagText.length === 0) return;
        
        // 중복 제거
        if (this.currentProductTags.includes(tagText)) {
            this.showToast('⚠️ 이미 추가된 태그입니다.');
            return;
        }
        
        // 태그 길이 제한
        if (tagText.length > 20) {
            this.showToast('⚠️ 태그는 20자 이내로 입력해주세요.');
            return;
        }
        
        // 태그 개수 제한
        if (this.currentProductTags.length >= 10) {
            this.showToast('⚠️ 태그는 최대 10개까지 추가할 수 있습니다.');
            return;
        }
        
        this.currentProductTags.push(tagText);
        this.renderProductTags();
        this.updateProductTagsInput();
        
        console.log('태그 추가됨:', tagText);
        console.log('현재 태그들:', this.currentProductTags);
    }
    
    // 태그 삭제
    removeTag(tagText) {
        const index = this.currentProductTags.indexOf(tagText);
        if (index > -1) {
            this.currentProductTags.splice(index, 1);
            this.renderProductTags();
            this.updateProductTagsInput();
            console.log('태그 삭제됨:', tagText);
        }
    }
    
    // 태그 UI 렌더링
    renderProductTags() {
        const tagsDisplay = document.getElementById('product-tags-display');
        if (!tagsDisplay) return;
        
        tagsDisplay.innerHTML = this.currentProductTags.map(tag => `
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border border-gray-200 hover:bg-gray-200 transition-colors">
                <span>${tag}</span>
                <button type="button" 
                        class="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors" 
                        onclick="orderSystem.removeTag('${tag}')"
                        title="태그 삭제">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </span>
        `).join('');
    }
    
    // 숨겨진 input 필드 업데이트
    updateProductTagsInput() {
        const hiddenInput = document.getElementById('product-form-tags');
        if (hiddenInput) {
            hiddenInput.value = JSON.stringify(this.currentProductTags);
        }
    }
    
    // 태그 자동완성 표시
    showTagSuggestions(query) {
        const suggestionsDiv = document.getElementById('product-tag-suggestions');
        if (!suggestionsDiv || !query) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        // 기존 태그들에서 검색
        const existingTags = this.getAllExistingTags();
        const filteredTags = existingTags
            .filter(tag => 
                tag.toLowerCase().includes(query.toLowerCase()) && 
                !this.currentProductTags.includes(tag)
            )
            .slice(0, 8); // 최대 8개까지만 표시
        
        if (filteredTags.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        suggestionsDiv.innerHTML = filteredTags.map(tag => `
            <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="orderSystem.selectSuggestedTag('${tag}')">
                <span class="text-sm text-gray-800">${tag}</span>
                <span class="text-xs text-gray-500 ml-2">기존 태그</span>
            </div>
        `).join('');
        
        suggestionsDiv.classList.remove('hidden');
    }
    
    // 추천 태그 선택
    selectSuggestedTag(tag) {
        const tagInput = document.getElementById('product-tag-input');
        const suggestionsDiv = document.getElementById('product-tag-suggestions');
        
        this.addTag(tag);
        if (tagInput) tagInput.value = '';
        suggestionsDiv.classList.add('hidden');
        tagInput.focus();
    }
    
    // 모든 기존 태그 가져오기
    getAllExistingTags() {
        const allTags = new Set();
        
        // 기본 추천 태그들
        const defaultTags = [
            '실내식물', '초보자추천', '공기정화', '반음지', '양지', '음지',
            '물주기쉬움', '물주기어려움', '꽃피는식물', '열매맺는식물',
            '향이좋은', '독성없음', '반려동물안전', '대형식물', '소형식물',
            '다육식물', '선인장', '허브', '관엽식물', '화분식물'
        ];
        defaultTags.forEach(tag => allTags.add(tag));
        
        // 기존 상품들의 태그 수집
        if (this.products && this.products.length > 0) {
            this.products.forEach(product => {
                if (product.tags && Array.isArray(product.tags)) {
                    product.tags.forEach(tag => allTags.add(tag));
                } else if (product.tags && typeof product.tags === 'string') {
                    try {
                        const parsedTags = JSON.parse(product.tags);
                        if (Array.isArray(parsedTags)) {
                            parsedTags.forEach(tag => allTags.add(tag));
                        }
                    } catch (e) {
                        // JSON 파싱 실패 시 무시
                    }
                }
            });
        }
        
        return Array.from(allTags).sort();
    }

    // 상품 폼 초기화 시 태그도 초기화
    initializeProductTags(tags = []) {
        this.currentProductTags = tags;
        this.renderProductTags();
        this.updateProductTagsInput();
    }

    // 상품 목록에서 태그 표시
    renderProductTagsInList(tags) {
        if (!tags || tags.length === 0) return '';
        
        let tagArray = [];
        if (typeof tags === 'string') {
            try {
                tagArray = JSON.parse(tags);
            } catch (e) {
                return '';
            }
        } else if (Array.isArray(tags)) {
            tagArray = tags;
        }
        
        if (tagArray.length === 0) return '';
        
        const displayTags = tagArray.slice(0, 3); // 최대 3개까지만 표시
        const hasMore = tagArray.length > 3;
        
        return `
            <div class="flex flex-wrap gap-1 mt-1">
                ${displayTags.map(tag => `
                    <span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        ${tag}
                    </span>
                `).join('')}
                ${hasMore ? `<span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+${tagArray.length - 3}</span>` : ''}
            </div>
        `;
    }
    
    // 실제 주문서 출력
    async printActualOrderReceipt() {
        console.log('printActualOrderReceipt 함수 시작');
        console.log('currentPrintOrderId:', this.currentPrintOrderId);
        console.log('orders 배열 길이:', this.orders ? this.orders.length : 'orders가 없음');
        
        const order = this.orders.find(o => o.id === this.currentPrintOrderId);
        console.log('찾은 주문:', order);
        
        if (!order) {
            console.error('주문을 찾을 수 없음 - currentPrintOrderId:', this.currentPrintOrderId);
            this.showToast('❌ 주문을 찾을 수 없습니다.');
            return;
        }
        
        const includeQR = document.getElementById('include-qr-code').checked;
        const qrUrl = document.getElementById('qr-code-url').value.trim();
        
        let qrCodeDataUrl = '';
        
        // QR코드 포함 시 데이터 URL 생성
        if (includeQR && qrUrl) {
            try {
                console.log('QR코드 생성 시도:', qrUrl);
                
                // 우선 간단한 QR 서버 URL 사용 (Base64 변환 생략)
                const encodedContent = encodeURIComponent(qrUrl);
                qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedContent}`;
                
                console.log('QR코드 URL 생성됨:', qrCodeDataUrl);
                
            } catch (error) {
                console.error('QR코드 생성 실패:', error);
                // QR코드 생성 실패해도 주문서는 출력
            }
        }
        
        console.log('주문서 HTML 생성 시작');
        this.generateOrderReceiptHTML(order, qrCodeDataUrl);
        console.log('주문서 HTML 생성 완료, 모달 닫기');
        this.closeOrderReceiptModal();
    }
    
    // 상품에서 실제 사이즈 정보 가져오기
    getProductSize(productName) {
        // 상품 데이터에서 해당 상품의 사이즈 찾기
        const product = this.products.find(p => p.name === productName);
        return product?.size || '-';
    }
    
    // 사이즈별 색상
    getSizeColor(size) {
        const colors = {
            'SX': 'bg-red-100 text-red-800',     // Super Extra
            'L': 'bg-blue-100 text-blue-800',    // Large
            'M': 'bg-green-100 text-green-800',  // Medium
            'S': 'bg-yellow-100 text-yellow-800', // Small
            'XS': 'bg-pink-100 text-pink-800',   // Extra Small
            'SET': 'bg-indigo-100 text-indigo-800', // Set
            '-': 'bg-gray-100 text-gray-800'     // 없음
        };
        return colors[size] || colors['-'];
    }
    
    // 주문서 HTML 생성 및 출력
    generateOrderReceiptHTML(order, qrCodeDataUrl) {
        console.log('generateOrderReceiptHTML 함수 시작');
        console.log('주문 데이터:', order);
        console.log('QR코드 URL:', qrCodeDataUrl);
        
        // order_items 안전하게 파싱 (기존 parseOrderItems 함수 사용)
        const items = this.parseOrderItems(order.order_items);
        console.log('주문 상품들:', items);
        
        const currentDate = new Date().toLocaleDateString('ko-KR');
        const orderDate = new Date(order.order_date).toLocaleDateString('ko-KR');
        
        // 상품 테이블 생성 (안전한 처리)
        const itemsTableHtml = items.map((item, index) => {
            const name = item.name || '상품명 없음';
            const quantity = item.quantity || 1;
            const price = parseInt(item.price) || 0;
            const total = price * quantity;
            
            return `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">${quantity}개</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 12px;">${price.toLocaleString()}원</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 12px;">${total.toLocaleString()}원</td>
                </tr>
            `;
        }).join('');
        
        // 포장 체크리스트 생성 (안전한 처리)
        const packingChecklistHtml = items.map(item => {
            const name = item.name || '상품명 없음';
            const quantity = item.quantity || 1;
            
            return `
                <div style="margin: 5px 0; font-size: 12px;">
                    □ ${name} ${quantity}개 - 포장 상태 양호
                </div>
            `;
        }).join('');
        
        // QR코드 섹션 (프린트 최적화)
        const qrCodeSection = qrCodeDataUrl ? `
            <div style="text-align: center; margin: 20px 0; padding: 15px; border: 2px solid #333; page-break-inside: avoid;">
                <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #000;">🌱 키우는 법 안내</h4>
                <div style="display: inline-block; padding: 10px; background: white; border: 1px solid #999;">
                    <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 120px; height: 120px; display: block; margin: 0 auto;">
                </div>
                <p style="font-size: 12px; margin: 10px 0; color: #000; font-weight: bold;">식물 키우는 법은<br>QR코드로 확인해 주세요</p>
                <p style="font-size: 11px; color: #333; font-weight: bold;">유튜브 경산다육TV에서<br>더 자세한 영상도 확인!</p>
            </div>
        ` : '';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>주문서 - ${order.customer_name}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    @media print {
                        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                        img { max-width: 100% !important; height: auto !important; }
                    }
                    body { 
                        margin: 0; 
                        padding: 15px; 
                        font-family: 'Malgun Gothic', sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 10px 0;
                    }
                    .header-box {
                        border: 2px solid #333;
                        text-align: center;
                        padding: 15px;
                        margin-bottom: 20px;
                        background-color: #f8f9fa;
                    }
                    .section-box {
                        border: 1px solid #ddd;
                        margin: 15px 0;
                        overflow: hidden;
                    }
                    .section-header {
                        background-color: #f1f3f4;
                        padding: 10px;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    .section-content {
                        padding: 15px;
                    }
                    .customer-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin: 15px 0;
                    }
                    .total-section {
                        text-align: right;
                        margin: 15px 0;
                        font-size: 13px;
                    }
                    .signature-section {
                        margin: 20px 0;
                        padding: 15px;
                        border: 1px solid #ddd;
                    }
                </style>
            </head>
            <body>
                <!-- 헤더 -->
                <div class="header-box">
                    <h1 style="font-size: 24px; margin: 0; color: #2d5a27;">🌱 다육이의 모든것</h1>
                    <h2 style="font-size: 18px; margin: 5px 0;">경산다육식물농장</h2>
                    <p style="margin: 5px 0; font-size: 12px;">유튜브: 경산다육TV | 문의: 010-9745-6245</p>
                </div>
                
                <!-- 고객 정보 -->
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; margin-bottom: 10px;">${order.customer_name}님께 배송드립니다 📦</h3>
                </div>
                
                <div class="customer-info">
                    <div>
                        <strong>주문번호:</strong> ${order.order_number}<br>
                        <strong>주문일자:</strong> ${orderDate}
                    </div>
                    <div>
                        <strong>배송일자:</strong> ${currentDate}<br>
                        <strong>배송주소:</strong> ${order.customer_address || '주소 미등록'}
                    </div>
                </div>
                
                <!-- 주문 상품 -->
                <div class="section-box">
                    <div class="section-header">📦 배송 상품 확인서</div>
                    <div class="section-content">
                        <table>
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">No</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">상품명</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">수량</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">단가(원)</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">금액(원)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsTableHtml}
                            </tbody>
                        </table>
                        
                        <div class="total-section">
                            <div>상품 금액: ${(order.total_amount - (order.shipping_fee || 0) + (order.discount_amount || 0)).toLocaleString()}원</div>
                            <div>배송비: ${order.shipping_fee ? order.shipping_fee.toLocaleString() + '원' : '무료'}</div>
                            ${order.discount_amount ? `<div>할인: -${order.discount_amount.toLocaleString()}원</div>` : ''}
                            <div style="border-top: 2px solid #333; padding-top: 5px; font-weight: bold; font-size: 14px;">
                                총 금액: ${order.total_amount.toLocaleString()}원
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 포장 확인 -->
                <div class="section-box">
                    <div class="section-header">✅ 포장 확인</div>
                    <div class="section-content">
                        ${packingChecklistHtml}
                        <div style="margin-top: 15px; font-size: 12px;">
                            □ 완충재 및 안전 포장 완료<br>
                            □ 관리 방법 안내서 동봉
                        </div>
                        <div style="margin-top: 15px; font-size: 11px; color: #666;">
                            포장 담당자: _______ &nbsp;&nbsp;&nbsp; 포장 일시: ${currentDate}
                        </div>
                    </div>
                </div>
                
                ${qrCodeSection}
                
                <!-- A/S 안내 -->
                <div class="section-box">
                    <div class="section-header">📞 A/S 안내</div>
                    <div class="section-content" style="font-size: 11px;">
                        • 배송 중 파손/문제: 수령 당일 사진과 함께 연락<br>
                        • 초기 관리 실패 시: 1주일 내 무료 교환/환불 상담<br>
                        • 전화 문의: 010-9745-6245 (평일 09:00-18:00)
                    </div>
                </div>
                
                <!-- 하단 -->
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
                    다육이의 모든것, 경산다육식물농장을 이용해 주셔서 감사합니다 🌱<br>
                    다음에도 좋은 다육이로 찾아뵙겠습니다
                </div>
                
                <script>
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // ===== 대시보드 관련 함수들 =====
    
    // Supabase 세션 + 허용목록 확인 (로컬 모드에서는 항상 허용)
    async canSeeDashboard() {
        try {
            // 로컬 모드이거나 Supabase가 비활성화된 경우 항상 허용
            if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
                console.log('🏠 로컬 모드: 대시보드 접근 허용');
                return true;
            }

            const supabase = window.SupabaseConfig.getClient();
            if (!supabase) {
                console.log('🏠 Supabase 비활성화: 대시보드 접근 허용');
                return true;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('🏠 인증 세션 없음: 대시보드 접근 허용 (로컬 모드)');
                return true;
            }
            
            const email = session.user?.email;
            if (!email) {
                console.log('🏠 이메일 없음: 대시보드 접근 허용 (로컬 모드)');
                return true;
            }

            const { data, error } = await supabase
                .from('allowed_users')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (error) {
                console.warn('[Auth] allowlist 조회 실패, 로컬 모드로 허용:', error);
                return true; // 오류 시에도 허용
            }
            
            if (data) {
                console.log('✅ 허용된 사용자: 대시보드 접근 허용');
                return true;
            } else {
                console.log('🏠 허용목록에 없음, 로컬 모드로 허용');
                return true; // 허용목록에 없어도 로컬 모드에서는 허용
            }
        } catch (e) {
            console.warn('[Auth] canSeeDashboard 에러, 로컬 모드로 허용:', e);
            return true; // 오류 시에도 허용
        }
    }
    
    // 대시보드 데이터 로드
    async loadDashboard() {
        // 권한 체크
        if (!(await this.canSeeDashboard())) {
            console.warn('🚫 대시보드 접근 권한 없음');
            alert('대시보드 접근 권한이 없습니다.');
            this.switchTab('tab-orders');
            return;
        }
        
        console.log('📊 대시보드 데이터 로드 시작...');
        
        // 대시보드에 필요한 데이터 로드 (아직 로드되지 않은 경우에만)
        console.log('📋 대시보드 데이터 로드 중...');
        
        if ((this.orders || []).length === 0) {
            await this.loadOrders();
        }
        if ((this.customers || []).length === 0) {
            await this.loadCustomers();
        }
        if ((this.products || []).length === 0) {
            await this.loadProducts();
        }
        if ((this.farm_waitlist || []).length === 0) {
            await this.loadWaitlist();
        }
        
        // 배송 통계 업데이트
        this.updateShippingStatistics();
        
        // 대시보드 렌더링
        this.renderSalesTrendChart();
        this.renderSalesChannelChart();
        this.renderCategorySalesChart();
        this.renderPopularTagsTable();
        this.renderVipCustomersTable();
        this.renderCustomerMetrics();
        
        // 실시간 업데이트는 switchTab()에서 이미 시작됨
        console.log('📊 대시보드 로드 완료!');
    }
    
    // 매출 추이 차트
    renderSalesTrendChart() {
        const ctx = document.getElementById('sales-trend-chart');
        if (!ctx) return;

        // 기존 차트 제거
        if (this.salesTrendChart) {
            this.salesTrendChart.destroy();
        }

        // 최근 30일 데이터 준비
        const today = new Date();
        const days = [];
        const salesData = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push(date.getDate() + '일');
            
            // 해당 날짜의 매출 계산
            const dailySales = this.orders
                .filter(order => {
                    const orderDate = new Date(order.order_date || order.created_at);
                    return orderDate.toISOString().split('T')[0] === dateStr;
                })
                .reduce((sum, order) => sum + (order.total_amount || 0), 0);
            
            salesData.push(dailySales);
        }

        this.salesTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: '일별 매출',
                    data: salesData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 판매 채널 차트
    renderSalesChannelChart() {
        const ctx = document.getElementById('sales-channel-chart');
        if (!ctx) return;

        // 기존 차트 제거
        if (this.salesChannelChart) {
            this.salesChannelChart.destroy();
        }

        // 채널별 매출 집계 (배송완료된 주문만)
        const channelSales = {};
        this.orders.forEach(order => {
            if (order.order_status === '배송완료') {
                const source = order.order_source || order.source || '직접 주문';
                if (!channelSales[source]) {
                    channelSales[source] = 0;
                }
                channelSales[source] += order.total_amount || 0;
            }
        });

        const labels = Object.keys(channelSales);
        const data = Object.values(channelSales);
        const colors = [
            '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', 
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
        ];

        this.salesChannelChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 카테고리별 매출 차트
    renderCategorySalesChart() {
        const ctx = document.getElementById('category-sales-chart');
        if (!ctx) return;

        // 기존 차트 제거
        if (this.categorySalesChart) {
            this.categorySalesChart.destroy();
        }

        // 카테고리별 매출 집계
        const categorySales = {};
        
        this.orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    // 상품에서 카테고리 찾기
                    const product = this.products.find(p => p.name === item.product_name);
                    const category = product?.category || '기타';
                    
                    if (!categorySales[category]) {
                        categorySales[category] = 0;
                    }
                    categorySales[category] += (item.price * item.quantity) || 0;
                });
            }
        });

        const sortedCategories = Object.entries(categorySales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // 상위 8개

        const labels = sortedCategories.map(([category]) => category);
        const data = sortedCategories.map(([,sales]) => sales);

        this.categorySalesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '카테고리별 매출',
                    data: data,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 인기 태그 테이블
    renderPopularTagsTable() {
        const tbody = document.getElementById('popular-tags-table');
        if (!tbody) return;

        // 태그별 판매 집계
        const tagSales = {};
        
        this.orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const product = this.products.find(p => p.name === item.product_name);
                    if (product && product.tags && Array.isArray(product.tags)) {
                        product.tags.forEach(tag => {
                            if (!tagSales[tag]) {
                                tagSales[tag] = 0;
                            }
                            tagSales[tag] += item.quantity || 0;
                        });
                    }
                });
            }
        });

        const sortedTags = Object.entries(tagSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        tbody.innerHTML = sortedTags.map(([tag, count], index) => `
            <tr class="hover:bg-gray-50">
                <td class="px-3 py-2 text-center">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                    } text-xs font-bold">
                        ${index + 1}
                    </span>
                </td>
                <td class="px-3 py-2">
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        ${tag}
                    </span>
                </td>
                <td class="px-3 py-2 text-right font-medium">${count}회</td>
            </tr>
        `).join('');
    }
    
    // VIP 고객 테이블
    renderVipCustomersTable() {
        const tbody = document.getElementById('vip-customers-table');
        if (!tbody) return;

        // 고객별 구매 금액 집계
        const customerStats = {};
        
        this.orders.forEach(order => {
            const customerId = order.customer_id;
            if (!customerId) return;
            
            if (!customerStats[customerId]) {
                customerStats[customerId] = {
                    totalAmount: 0,
                    orderCount: 0,
                    customer: this.customers.find(c => c.id === customerId)
                };
            }
            
            customerStats[customerId].totalAmount += order.total_amount || 0;
            customerStats[customerId].orderCount += 1;
        });

        const sortedCustomers = Object.values(customerStats)
            .filter(stat => stat.customer) // 고객 정보가 있는 것만
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 10);

        tbody.innerHTML = sortedCustomers.map((stat, index) => {
            const customer = stat.customer;
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-center">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                        } text-xs font-bold">
                            ${index + 1}
                        </span>
                    </td>
                    <td class="px-4 py-2 font-medium">${customer.name}</td>
                    <td class="px-4 py-2 text-center">
                        ${this.getCustomerGradeBadge(customer.grade || 'GENERAL')}
                    </td>
                    <td class="px-4 py-2 text-right font-bold text-green-600">
                        ${stat.totalAmount.toLocaleString()}원
                    </td>
                    <td class="px-4 py-2 text-right text-gray-600">
                        ${stat.orderCount}회
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // 고객 메트릭 카드
    renderCustomerMetrics() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        // 이번 달 신규 고객
        const newCustomers = this.customers.filter(customer => {
            const regDate = new Date(customer.registration_date || customer.created_at);
            return regDate.getMonth() === thisMonth && regDate.getFullYear() === thisYear;
        });
        
        // 이번 달 재구매 고객 (이번 달에 2번 이상 주문한 고객)
        const thisMonthOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_date || order.created_at);
            return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
        });
        
        const customerOrderCounts = {};
        thisMonthOrders.forEach(order => {
            if (order.customer_id) {
                customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1;
            }
        });
        
        const returningCustomers = Object.values(customerOrderCounts).filter(count => count >= 2).length;
        
        // UI 업데이트
        const newCustomersEl = document.getElementById('new-customers-count');
        const returningCustomersEl = document.getElementById('returning-customers-count');
        
        if (newCustomersEl) newCustomersEl.textContent = newCustomers.length;
        if (returningCustomersEl) returningCustomersEl.textContent = returningCustomers;
    }

    // === 인라인 상품 등록 기능 ===

    // 인라인 상품 등록 폼 토글
    toggleInlineProductForm() {
        const form = document.getElementById('inline-product-form');
        const toggleButton = document.getElementById('toggle-inline-product-form');
        const toggleText = document.getElementById('inline-form-toggle-text');
        
        if (form.classList.contains('hidden')) {
            // 폼 보이기
            form.classList.remove('hidden');
            form.classList.add('inline-form-enter');
            toggleText.textContent = '취소';
            toggleButton.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            toggleButton.classList.add('bg-gray-600', 'hover:bg-gray-700');
            
            // 카테고리 옵션 로드
            this.loadInlineCategoryOptions();
            
            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                document.getElementById('inline-product-name').focus();
            }, 100);
        } else {
            this.hideInlineProductForm();
        }
    }

    // 인라인 상품 등록 폼 숨기기
    hideInlineProductForm() {
        const form = document.getElementById('inline-product-form');
        const toggleButton = document.getElementById('toggle-inline-product-form');
        const toggleText = document.getElementById('inline-form-toggle-text');
        
        form.classList.add('inline-form-exit');
        
        setTimeout(() => {
            form.classList.add('hidden');
            form.classList.remove('inline-form-enter', 'inline-form-exit');
            toggleText.textContent = '빠른 등록';
            toggleButton.classList.remove('bg-gray-600', 'hover:bg-gray-700');
            toggleButton.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }, 300);
        
        // 폼 초기화
        this.clearInlineProductForm();
    }

    // 인라인 폼 카테고리 옵션 로드
    loadInlineCategoryOptions() {
        const categorySelect = document.getElementById('inline-product-category');
        categorySelect.innerHTML = '<option value="">카테고리 선택</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // 새 카테고리 추가 옵션
        const addNewOption = document.createElement('option');
        addNewOption.value = '__ADD_NEW__';
        addNewOption.textContent = '+ 새 카테고리 추가';
        addNewOption.className = 'text-blue-600 font-medium';
        categorySelect.appendChild(addNewOption);
    }

    // 인라인 폼 초기화 (안전한 방식)
    clearInlineProductForm() {
        // 필수 필드들 초기화
        const requiredFields = [
            'inline-product-name',
            'inline-product-category', 
            'inline-product-price',
            'inline-product-wholesale-price',
            'inline-product-stock',
            'inline-product-size',
            'inline-product-shipping'
        ];
        
        requiredFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
            }
        });
        
        // 선택적 필드들 초기화 (존재하는 경우에만)
        const optionalFields = [
            'inline-product-description',
            'inline-product-tags', 
            'inline-product-image'
        ];
        
        optionalFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
            }
        });
        
        // 수익률 표시도 초기화
        const profitMargin = document.getElementById('inline-profit-margin');
        if (profitMargin) {
            profitMargin.innerHTML = '';
        }
    }

    // 인라인 상품 저장
    async saveInlineProduct() {
        // DOM 요소 존재 확인
        const nameEl = document.getElementById('inline-product-name');
        const categoryEl = document.getElementById('inline-product-category');
        const priceEl = document.getElementById('inline-product-price');
        const stockEl = document.getElementById('inline-product-stock');
        const shippingEl = document.getElementById('inline-product-shipping');
        
        if (!nameEl || !categoryEl || !priceEl || !stockEl || !shippingEl) {
            console.error('❌ 인라인 폼 필수 요소를 찾을 수 없습니다.');
            this.showToast('❌ 폼 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
            return;
        }
        
        // 폼 유효성 검사 (8개 핵심 항목)
        const name = nameEl.value.trim();
        const category = categoryEl.value;
        const price = priceEl.value;
        const stock = stockEl.value;
        const shipping = shippingEl.value;

        if (!name || !category || !price || !stock || !shipping) {
            alert('❌ 필수 항목을 모두 입력해주세요.\n\n• 상품명\n• 카테고리\n• 판매가\n• 재고수량\n• 배송 옵션');
            return;
        }
        
        // 상품명 중복 검증
        const existingProduct = this.products.find(p => p.name === name);
        if (existingProduct) {
            alert('❌ 이미 등록된 상품명입니다.\n\n다른 상품명을 사용해주세요.');
            return;
        }

        // 새 상품 데이터 생성 (8개 핵심 항목만)
        const newProduct = {
                id: 'PROD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: name,
                category: this.getCategoryName(category), // 카테고리 이름으로 통일
                price: parseInt(price),
                wholesale_price: parseInt(document.getElementById('inline-product-wholesale-price')?.value) || 0,
                stock: parseInt(stock),
                size: document.getElementById('inline-product-size')?.value || '',
                shipping_option: shipping,
                // 기본값들
                description: '',
                tags: [],
                image_url: '',
                status: 'active',
                created_at: Date.now(),
                updated_at: Date.now(),
                qr_code: '', // QR 코드 통일 필드
                qr_enabled: false // QR 생성 여부 통일 필드
            };

        try {
            // QR 코드는 마스터 기능에서만 생성
            
            let apiSuccess = false;
            
            // API 사용 가능한 경우에만 시도
            if (this.apiAvailable) {
                try {
                    const response = await fetch(this.getApiUrl('products'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(newProduct)
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('🚀 API로 빠른 상품 등록 성공:', result);
                        
                        // API 성공 시 결과 사용
                        if (result.id) {
                            newProduct.id = result.id;
                        }
                        apiSuccess = true;
                    } else {
                        console.warn('⚠️ API 응답 오류:', response.status, response.statusText);
                    }
                } catch (apiError) {
                    console.warn('⚠️ API 호출 실패, 로컬 저장으로 전환:', apiError.message);
                }
            } else {
                console.log('🔄 로컬 모드 - API 호출 생략');
            }
            
            // 로컬 저장 (API 성공/실패 관계없이 항상 실행)
            this.products.push(newProduct);
            await this.saveToStorage('products', this.products);
            
            // 성공 메시지
            const message = apiSuccess 
                ? `🎉 "${newProduct.name}" 상품이 성공적으로 등록되었습니다!`
                : `🎉 "${newProduct.name}" 상품이 등록되었습니다! (로컬 저장)`;
            
            this.showToast(message, 'success');
            
            // 상품 목록 새로고침 (인라인 폼은 상품관리 탭에서만 사용되므로 직접 렌더링)
            this.renderProductsTable();
            
            // 폼 리셋 및 숨기기
            this.resetInlineProductForm();
            this.hideInlineProductForm();
            
            console.log('✅ 빠른 상품 등록 완료:', newProduct);
            
        } catch (error) {
            console.error('❌ 빠른 상품 등록 실패:', error);
            
            // 로컬 저장 시도
            try {
                this.products.push(newProduct);
                await this.saveToStorage('products', this.products);
                
                // 로컬 저장 성공 시 성공 메시지
                this.showToast(`🎉 "${newProduct.name}" 상품이 등록되었습니다! (로컬 저장)`, 'success');
                
                // 상품 목록 새로고침
                this.renderProductsTable();
                
                // 폼 리셋 및 숨기기
                this.resetInlineProductForm();
                this.hideInlineProductForm();
                
                console.log('✅ 로컬 저장으로 상품 등록 완료:', newProduct);
                
            } catch (localError) {
                console.error('❌ 로컬 저장도 실패:', localError);
                
                // 구체적인 오류 메시지 제공
                let errorMessage = '❌ 상품 등록 중 오류가 발생했습니다.';
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage += '\n\n네트워크 연결을 확인해주세요.';
                } else if (error.message) {
                    errorMessage += `\n\n오류 상세: ${error.message}`;
                }
                
                errorMessage += '\n\n다시 시도해주세요.';
                
                this.showToast(errorMessage, 'error');
            }
        }
    }

    // 인라인 상품 폼 리셋 (안전한 방식)
    resetInlineProductForm() {
        const fields = [
            'inline-product-name',
            'inline-product-category',
            'inline-product-price', 
            'inline-product-wholesale-price',
            'inline-product-stock',
            'inline-product-size',
            'inline-product-shipping'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
            }
        });
    }

    // === 인라인 빠른 카테고리 추가 기능 ===

    // 인라인 카테고리 입력 필드 표시
    showInlineQuickCategoryInput() {
        const inputDiv = document.getElementById('inline-new-category-input');
        const nameInput = document.getElementById('inline-quick-category-name');
        
        inputDiv.classList.remove('hidden');
        nameInput.focus();
    }

    // 인라인 카테고리 입력 필드 숨김
    hideInlineQuickCategoryInput() {
        const inputDiv = document.getElementById('inline-new-category-input');
        const nameInput = document.getElementById('inline-quick-category-name');
        const colorSelect = document.getElementById('inline-quick-category-color');
        
        inputDiv.classList.add('hidden');
        nameInput.value = '';
        colorSelect.selectedIndex = 0;
    }

    // 인라인 빠른 카테고리 저장
    async saveInlineQuickCategory() {
        const name = document.getElementById('inline-quick-category-name').value.trim();
        const color = document.getElementById('inline-quick-category-color').value;

        if (!name) {
            alert('카테고리명을 입력해주세요.');
            document.getElementById('inline-quick-category-name').focus();
            return;
        }

        // 중복 카테고리 확인
        const existingCategory = this.categories.find(cat => 
            cat.name.toLowerCase() === name.toLowerCase()
        );

        if (existingCategory) {
            const useExisting = confirm(`"${name}" 카테고리가 이미 존재합니다.\n\n기존 카테고리를 선택하시겠습니까?`);
            if (useExisting) {
                // 기존 카테고리 선택
                const categorySelect = document.getElementById('inline-product-category');
                categorySelect.value = existingCategory.id;
                this.hideInlineQuickCategoryInput();
                return;
            } else {
                document.getElementById('inline-quick-category-name').focus();
                return;
            }
        }

        try {
            // 새 카테고리 생성
            const newCategory = {
                id: 'CAT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: name,
                color: color,
                description: `${name} 카테고리`,
                sort_order: this.categories.length,
                is_active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            // 카테고리 배열에 추가
            this.categories.push(newCategory);

            // LocalStorage에 저장
            this.saveToLocalStorage('categories', this.categories);

            // 카테고리 선택 드롭다운 업데이트
            this.updateCategorySelects();

            // 새로 생성된 카테고리 자동 선택
            const categorySelect = document.getElementById('inline-product-category');
            categorySelect.value = newCategory.id;

            // 입력 필드 숨김
            this.hideInlineQuickCategoryInput();

            // 성공 메시지
            this.showToast(`🎉 "${name}" 카테고리가 추가되고 선택되었습니다!`, 'success');

            console.log('✅ 인라인 카테고리 추가 완료:', newCategory);

        } catch (error) {
            console.error('❌ 인라인 카테고리 추가 실패:', error);
            alert('카테고리 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // 중복된 함수 제거됨 - 이제 위의 통합된 updateCategorySelects 함수를 사용

    // === 인라인 편집 기능 ===

    // 인라인 편집 시작
    startInlineEdit(element) {
        try {
            console.log('🔄 인라인 편집 시작:', element);
            
            // 이미 편집 중인 다른 요소가 있으면 저장
            const currentEditing = document.querySelector('.inline-editing');
            if (currentEditing && currentEditing !== element) {
                this.finishInlineEdit(currentEditing, false);
            }

            const productId = element.dataset.productId;
            const field = element.dataset.field;
            const currentValue = element.dataset.value;
            
            console.log('📋 편집 정보:', { productId, field, currentValue });
            
            if (!productId || !field || currentValue === undefined) {
                console.error('❌ 필수 데이터 누락:', { productId, field, currentValue });
                alert('편집에 필요한 데이터가 누락되었습니다.');
                return;
            }

        // 편집 상태로 변경
        element.classList.add('inline-editing');
        
        // 입력 필드 생성
        const input = document.createElement('input');
        input.type = field === 'price' || field === 'stock' ? 'number' : 'text';
        input.value = currentValue;
        input.className = 'inline-edit-input';
        input.min = '0';
        
        if (field === 'price') {
            input.step = '1000';
        }

            // 기존 텍스트 저장 및 안전한 DOM 조작
            const originalText = element.innerHTML;
            
            // 안전하게 기존 내용 제거
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            
            // 입력 필드 추가
            element.appendChild(input);

        // 포커스 및 선택
        input.focus();
        input.select();

            // 중복 실행 방지 플래그
            let isFinishing = false;
            
            // 이벤트 리스너 (중복 실행 방지)
            input.addEventListener('blur', () => {
                if (!isFinishing) {
                    isFinishing = true;
                    setTimeout(() => {
                        this.finishInlineEdit(element, true);
                        isFinishing = false;
                    }, 10);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (!isFinishing) {
                    if (e.key === 'Enter') {
                        isFinishing = true;
                        this.finishInlineEdit(element, true);
                    } else if (e.key === 'Escape') {
                        isFinishing = true;
                        this.finishInlineEdit(element, false);
                    }
                }
            });

            // 원본 데이터 저장
            element.originalText = originalText;
            element.originalValue = currentValue;
            
            console.log('✅ 인라인 편집 입력 필드 생성 완료');
            
        } catch (error) {
            console.error('❌ 인라인 편집 시작 오류:', error);
            alert('편집 모드 시작 중 오류가 발생했습니다.\n\n' + error.message);
        }
    }

    // 인라인 편집 완료
    async finishInlineEdit(element, save) {
        // 중복 실행 방지
        if (element.isFinishing) {
            console.log('⚠️ 이미 편집 완료 진행 중');
            return;
        }
        element.isFinishing = true;
        
        try {
            console.log('🔄 인라인 편집 완료 시작:', save);
            
            const input = element.querySelector('.inline-edit-input');
            if (!input) {
                console.warn('⚠️ 편집 입력 필드를 찾을 수 없음');
                return;
            }

            const productId = element.dataset.productId;
            const field = element.dataset.field;
            const newValue = input.value.trim();
            const originalValue = element.originalValue;
            
            console.log('📝 편집 완료 정보:', { productId, field, newValue, originalValue, save });

            // 편집 상태 해제
            element.classList.remove('inline-editing');

        if (save && newValue && newValue !== originalValue) {
            // 유효성 검사
            if ((field === 'price' || field === 'stock') && (isNaN(newValue) || parseFloat(newValue) < 0)) {
                alert('❌ 올바른 숫자를 입력해주세요.');
                element.innerHTML = element.originalText;
                return;
            }

            try {
                // 상품 데이터 업데이트
                const product = this.products.find(p => p.id === productId);
                if (!product) {
                    console.error('❌ 상품을 찾을 수 없음:', productId);
                    throw new Error(`상품 ID ${productId}를 찾을 수 없습니다.`);
                }
                
                console.log('📦 편집할 상품:', product);
                
                const numericValue = (field === 'price' || field === 'stock') ? parseInt(newValue) : newValue;
                console.log('🔢 변환된 값:', numericValue);
                
                // 상품 데이터 업데이트
                product[field] = numericValue;
                product.updated_at = Date.now();
                console.log('💾 상품 데이터 업데이트 완료:', product);

                // LocalStorage에 저장
                await this.saveToStorage('products', this.products);
                console.log('💿 LocalStorage 저장 완료');

                // API 동기화 시도 (백그라운드)
                this.syncProductToAPI(product).catch(error => {
                    console.warn('⚠️ 상품 API 동기화 실패:', error);
                });

                // UI 안전하게 업데이트
                this.safeUpdateElementContent(element, field, numericValue, newValue);

                // 성공 피드백
                element.style.backgroundColor = '#dcfce7';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 1000);

                console.log(`✅ ${field} 인라인 편집 완료:`, productId, newValue);
                
            } catch (error) {
                console.error('❌ 인라인 편집 저장 실패:', error);
                this.safeRestoreElementContent(element);
                alert('❌ 저장 중 오류가 발생했습니다.\n\n오류: ' + error.message + '\n\n다시 시도해주세요.');
            }
        } else {
            // 저장하지 않거나 값이 변경되지 않은 경우
            console.log('🚫 편집 취소 또는 값 변경 없음');
            this.safeRestoreElementContent(element);
        }

        // 임시 데이터 정리
        delete element.originalText;
        delete element.originalValue;
        delete element.isFinishing;
        
        } catch (error) {
            console.error('❌ 인라인 편집 완료 오류:', error);
            alert('편집 완료 중 오류가 발생했습니다.\n\n오류: ' + error.message);
            
            // 안전하게 원래 상태로 복원
            this.safeRestoreElementContent(element);
            element.classList.remove('inline-editing');
            delete element.originalText;
            delete element.originalValue;
            delete element.isFinishing;
        }
    }

    // === 상품 API 동기화 함수 ===
    
    // 상품 데이터를 API로 동기화
    async syncProductToAPI(product) {
        try {
            console.log('🌐 상품 API 동기화 시작:', product.id);
            
            const response = await fetch(this.getApiUrl(`products/${product.id}`), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(product)
            });

            if (response.ok) {
                console.log('✅ 상품 API 동기화 성공:', product.id);
                return true;
            } else {
                throw new Error(`API 오류: ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ 상품 API 동기화 실패:', error);
            // LocalStorage 데이터는 보존되므로 치명적 오류가 아님
            return false;
        }
    }

    // === 안전한 DOM 조작 헬퍼 함수 ===
    
    // 안전하게 요소 내용 업데이트
    safeUpdateElementContent(element, field, numericValue, newValue) {
        try {
            // 기존 내용을 안전하게 제거
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            
            // 새 내용 설정
            let displayText = '';
            let dataValue = '';
            
            if (field === 'price') {
                const formattedPrice = new Intl.NumberFormat('ko-KR').format(numericValue);
                displayText = `${formattedPrice}원`;
                dataValue = numericValue;
            } else if (field === 'stock') {
                displayText = `${numericValue}개`;
                dataValue = numericValue;
            } else {
                displayText = newValue;
                dataValue = newValue;
            }
            
            // 텍스트 노드로 안전하게 추가
            const textNode = document.createTextNode(displayText);
            element.appendChild(textNode);
            element.dataset.value = dataValue;
            
            console.log('🔄 DOM 안전 업데이트 완료:', displayText);
            
        } catch (error) {
            console.error('❌ DOM 업데이트 오류:', error);
            // 폴백: 간단한 textContent 사용
            element.textContent = field === 'price' ? `${numericValue}원` : 
                                 field === 'stock' ? `${numericValue}개` : newValue;
            element.dataset.value = numericValue || newValue;
        }
    }
    
    // 안전하게 원본 내용 복원
    safeRestoreElementContent(element) {
        try {
            if (element.originalText) {
                // 기존 내용을 안전하게 제거
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                
                // 임시 div로 HTML 파싱
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = element.originalText;
                
                // 자식 노드들을 안전하게 이동
                while (tempDiv.firstChild) {
                    element.appendChild(tempDiv.firstChild);
                }
                
                console.log('🔄 DOM 안전 복원 완료');
            }
        } catch (error) {
            console.error('❌ DOM 복원 오류:', error);
            // 폴백: 간단한 textContent 사용
            if (element.originalValue) {
                element.textContent = element.originalValue;
            }
        }
    }

    // === 빠른 카테고리 추가 기능 ===

    // 빠른 카테고리 입력 필드 보이기
    showQuickCategoryInput() {
        const categorySelect = document.getElementById('inline-product-category');
        const inputDiv = document.getElementById('new-category-input');
        const nameInput = document.getElementById('quick-category-name');

        // 선택값 초기화
        categorySelect.value = '';
        
        // 입력 필드 보이기
        inputDiv.classList.remove('hidden');
        
        // 포커스
        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }

    // 빠른 카테고리 입력 필드 숨기기
    hideQuickCategoryInput() {
        const categorySelect = document.getElementById('inline-product-category');
        const inputDiv = document.getElementById('new-category-input');
        const nameInput = document.getElementById('quick-category-name');
        const colorSelect = document.getElementById('quick-category-color');

        // 입력 필드 숨기기
        inputDiv.classList.add('hidden');
        
        // 입력값 초기화
        nameInput.value = '';
        colorSelect.value = 'bg-purple-100 text-purple-800';
        
        // 카테고리 선택 초기화
        categorySelect.value = '';
    }

    // 빠른 카테고리 저장
    async saveQuickCategory() {
        const nameInput = document.getElementById('quick-category-name');
        const colorSelect = document.getElementById('quick-category-color');
        const categorySelect = document.getElementById('inline-product-category');

        const categoryName = nameInput.value.trim();
        const categoryColor = colorSelect.value;

        // 유효성 검사
        if (!categoryName) {
            alert('❌ 카테고리명을 입력해주세요.');
            nameInput.focus();
            return;
        }

        // 중복 검사
        const existingCategory = this.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            alert('❌ 이미 존재하는 카테고리입니다.');
            nameInput.focus();
            return;
        }

        try {
            // 새 카테고리 생성
            const newCategory = {
                id: 'CAT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: categoryName,
                color: categoryColor,
                description: '',
                sort_order: this.categories.length + 1,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            // 카테고리 목록에 추가
            this.categories.push(newCategory);

            // LocalStorage에 저장
            this.saveToLocalStorage('categories', this.categories);

            // 성공 메시지
            const Toast = {
                fire: (options) => {
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
                    toast.innerHTML = `<i class="fas fa-check mr-2"></i>${options.title}`;
                    document.body.appendChild(toast);
                    
                    setTimeout(() => {
                        toast.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(toast), 300);
                    }, 2000);
                }
            };

            Toast.fire({
                title: `카테고리 "${categoryName}" 추가 완료! 🎉`
            });

            // 카테고리 옵션 새로고침
            this.loadInlineCategoryOptions();

            // 새로 추가한 카테고리 자동 선택
            categorySelect.value = categoryName;

            // 입력 필드 숨기기
            this.hideQuickCategoryInput();

            console.log('✅ 빠른 카테고리 추가 완료:', newCategory);

        } catch (error) {
            console.error('❌ 빠른 카테고리 추가 실패:', error);
            alert('❌ 카테고리 추가 중 오류가 발생했습니다.\n\n다시 시도해주세요.');
        }
    }

    // === 모달용 빠른 카테고리 추가 기능 ===

    // 모달용 빠른 카테고리 입력 필드 보이기
    showModalQuickCategoryInput() {
        const categorySelect = document.getElementById('product-form-category');
        const inputDiv = document.getElementById('modal-new-category-input');
        const nameInput = document.getElementById('modal-quick-category-name');

        // 선택값 초기화
        categorySelect.value = '';
        
        // 입력 필드 보이기
        inputDiv.classList.remove('hidden');
        
        // 포커스
        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }

    // 모달용 빠른 카테고리 입력 필드 숨기기
    hideModalQuickCategoryInput() {
        const categorySelect = document.getElementById('product-form-category');
        const inputDiv = document.getElementById('modal-new-category-input');
        const nameInput = document.getElementById('modal-quick-category-name');
        const colorSelect = document.getElementById('modal-quick-category-color');

        // 입력 필드 숨기기
        inputDiv.classList.add('hidden');
        
        // 입력값 초기화
        nameInput.value = '';
        colorSelect.value = 'bg-purple-100 text-purple-800';
        
        // 카테고리 선택 초기화
        categorySelect.value = '';
    }

    // 모달용 빠른 카테고리 저장
    async saveModalQuickCategory() {
        const nameInput = document.getElementById('modal-quick-category-name');
        const colorSelect = document.getElementById('modal-quick-category-color');
        const categorySelect = document.getElementById('product-form-category');

        const categoryName = nameInput.value.trim();
        const categoryColor = colorSelect.value;

        // 유효성 검사
        if (!categoryName) {
            alert('❌ 카테고리명을 입력해주세요.');
            nameInput.focus();
            return;
        }

        // 중복 검사
        const existingCategory = this.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            alert('❌ 이미 존재하는 카테고리입니다.');
            nameInput.focus();
            return;
        }

        try {
            // 새 카테고리 생성
            const newCategory = {
                id: 'CAT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: categoryName,
                color: categoryColor,
                description: '',
                sort_order: this.categories.length + 1,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            // 카테고리 목록에 추가
            this.categories.push(newCategory);

            // LocalStorage에 저장
            this.saveToLocalStorage('categories', this.categories);

            // 성공 토스트 메시지
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
            toast.innerHTML = `<i class="fas fa-check mr-2"></i>카테고리 "${categoryName}" 추가 완료! 🎉`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 2000);

            // 모달의 카테고리 옵션 새로고침
            this.loadModalCategoryOptions();

            // 새로 추가한 카테고리 자동 선택
            categorySelect.value = categoryName;

            // 입력 필드 숨기기
            this.hideModalQuickCategoryInput();

            console.log('✅ 모달용 빠른 카테고리 추가 완료:', newCategory);

        } catch (error) {
            console.error('❌ 모달용 빠른 카테고리 추가 실패:', error);
            alert('❌ 카테고리 추가 중 오류가 발생했습니다.\n\n다시 시도해주세요.');
        }
    }

    // 모달용 카테고리 옵션 로드
    loadModalCategoryOptions() {
        const categorySelect = document.getElementById('product-form-category');
        const currentValue = categorySelect.value;
        
        categorySelect.innerHTML = '<option value="">카테고리 선택</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // 새 카테고리 추가 옵션
        const addNewOption = document.createElement('option');
        addNewOption.value = '__ADD_NEW__';
        addNewOption.textContent = '+ 새 카테고리 추가';
        addNewOption.className = 'text-blue-600 font-medium';
        categorySelect.appendChild(addNewOption);

        // 이전 선택값 복원 (가능한 경우)
        if (currentValue && currentValue !== '__ADD_NEW__') {
            categorySelect.value = currentValue;
        }
    }

    // === QR 라벨 프린터 기능 ===

    // 라벨 수량 증가
    increaseLabelQty(productId) {
        const input = document.getElementById(`label-qty-${productId}`);
        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.max) || 72;
        
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            this.updateBulkPrintCount();
        }
    }

    // 라벨 수량 감소
    decreaseLabelQty(productId) {
        const input = document.getElementById(`label-qty-${productId}`);
        const currentValue = parseInt(input.value) || 1;
        const minValue = parseInt(input.min) || 1;
        
        if (currentValue > minValue) {
            input.value = currentValue - 1;
            this.updateBulkPrintCount();
        }
    }

    // 전체 상품 선택/해제
    toggleAllProductSelection(checked) {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        const labelInputs = document.querySelectorAll('[id^="label-qty-"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });

        // 체크된 경우 기본 수량 1로 설정
        if (checked) {
            labelInputs.forEach(input => {
                if (input.value === '0') {
                    input.value = '1';
                }
            });
        } else {
            // 체크 해제된 경우 수량 0으로 설정
            labelInputs.forEach(input => {
                input.value = '0';
            });
        }

        this.updateLabelSelection();
    }

    // 라벨 선택 상태 업데이트
    updateLabelSelection() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        const printBtn = document.getElementById('print-labels-btn');
        const selectedCount = document.getElementById('selected-count');
        
        // 체크된 상품들의 라벨 수량 합계 계산
        let totalLabels = 0;
        checkboxes.forEach(checkbox => {
            const productId = checkbox.value;
            const qtyInput = document.getElementById(`label-qty-${productId}`);
            const qty = parseInt(qtyInput.value) || 0;
            totalLabels += qty;
        });

        // 라벨 수량이 있는 상품 중에서 체크되지 않은 것들도 자동 체크
        const labelInputs = document.querySelectorAll('[id^="label-qty-"]');
        labelInputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            if (qty > 0) {
                const productId = input.id.replace('label-qty-', '');
                const checkbox = document.querySelector(`.product-checkbox[value="${productId}"]`);
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    totalLabels += qty;
                }
            }
        });

        // UI 업데이트
        selectedCount.textContent = totalLabels;
        
        if (totalLabels > 0) {
            printBtn.classList.remove('hidden');
        } else {
            printBtn.classList.add('hidden');
        }

        // 전체 선택 체크박스 상태 업데이트
        const allCheckboxes = document.querySelectorAll('.product-checkbox');
        const selectAllCheckbox = document.getElementById('select-all-products');
        const checkedCount = document.querySelectorAll('.product-checkbox:checked').length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === allCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
            selectAllCheckbox.checked = false;
        }
    }

    // QR 라벨 미리보기 열기
    openQRLabelPreview() {
        const selectedProducts = this.getSelectedProductsForLabels();
        
        if (selectedProducts.length === 0) {
            alert('❌ 라벨을 인쇄할 상품을 선택하고 수량을 입력해주세요.');
            return;
        }

        // 총 라벨 수 계산
        const totalLabels = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalLabels > 72) {
            if (!confirm(`⚠️ 총 ${totalLabels}개의 라벨이 선택되었습니다.\n\nA4 용지 1장에는 최대 72개까지 인쇄 가능합니다.\n${Math.ceil(totalLabels / 72)}장의 용지가 필요합니다.\n\n계속하시겠습니까?`)) {
                return;
            }
        }

        // 모달 열기
        const modal = document.getElementById('qr-label-preview-modal');
        const totalLabelsSpan = document.getElementById('total-labels');
        
        totalLabelsSpan.textContent = `총 ${totalLabels}개 라벨`;
        
        // 라벨 생성
        this.generateQRLabels(selectedProducts);
        
        modal.classList.remove('hidden');
    }

    // 선택된 상품들과 수량 가져오기
    getSelectedProductsForLabels() {
        const result = [];
        
        // 임시 선택 정보가 있으면 그것을 사용 (상품 목록에서 온 경우)
        if (this.tempSelectedForLabels && this.tempSelectedForLabels.length > 0) {
            console.log('🔄 임시 선택 정보를 사용하여 라벨 데이터 생성');
            
            this.tempSelectedForLabels.forEach(item => {
                const product = this.products.find(p => p.id === item.productId);
                if (product && item.quantity > 0) {
                    result.push({
                        product: product,
                        quantity: item.quantity
                    });
                }
            });
            
            // 사용 후 정리
            this.tempSelectedForLabels = null;
            return result;
        }
        
        // 기존 방식 (기본 라벨 인쇄 시스템용)
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        
        checkboxes.forEach(checkbox => {
            const productId = checkbox.value || checkbox.dataset.productId;
            let quantity = 0;
            
            // 여러 방식으로 수량 입력 찾기
            let qtyInput = document.getElementById(`label-qty-${productId}`);
            if (!qtyInput) {
                qtyInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
            }
            
            quantity = parseInt(qtyInput?.value) || 0;
            
            if (quantity > 0) {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    result.push({
                        product: product,
                        quantity: quantity
                    });
                }
            }
        });

        console.log(`📦 라벨 인쇄용 상품 ${result.length}개 준비됨`);
        return result;
    }

    // QR 라벨 생성
    generateQRLabels(selectedProducts) {
        const container = document.getElementById('qr-labels-container');
        
        // 기존 내용 지우기
        container.innerHTML = '';
        
        // 총 라벨 수 계산
        const totalLabels = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
        
        // 72개 초과시 경고
        if (totalLabels > 72) {
            alert(`⚠️ 선택한 라벨 수가 ${totalLabels}개입니다.\nA4 한 장에는 최대 72개까지만 인쇄됩니다.\n처음 72개만 생성됩니다.`);
        }
        
        // 라벨들을 담을 그리드 컨테이너 생성
        const labelsGrid = document.createElement('div');
        labelsGrid.className = 'labels-grid';
        
        let labelCount = 0;
        const maxLabels = 72;
        
        // 각 상품별로 라벨 생성 (최대 72개까지)
        for (const item of selectedProducts) {
            const { product, quantity } = item;
            
            for (let i = 0; i < quantity && labelCount < maxLabels; i++) {
                const label = this.createSingleQRLabel(product);
                labelsGrid.appendChild(label);
                labelCount++;
            }
            
            if (labelCount >= maxLabels) break;
        }
        
        // 50개 미만일 경우 빈 라벨로 채우기 (그리드 정렬을 위해)
        while (labelCount < 50) {
            const emptyLabel = document.createElement('div');
            emptyLabel.className = 'qr-label';
            emptyLabel.style.border = '1px dashed #ccc';
            emptyLabel.style.backgroundColor = '#f9f9f9';
            labelsGrid.appendChild(emptyLabel);
            labelCount++;
        }
        
        container.appendChild(labelsGrid);
    }

    // 개별 QR 라벨 생성
    createSingleQRLabel(product) {
        const label = document.createElement('div');
        label.className = 'qr-label';
        
        // 상품명 (최대한 크게, 최대 3줄)
        const productName = document.createElement('div');
        productName.className = 'product-name';
        productName.textContent = product.name;
        
        // 가격 (크게, 원 단위 제거)
        const productPrice = document.createElement('div');
        productPrice.className = 'product-price';
        productPrice.textContent = new Intl.NumberFormat('ko-KR').format(product.price);
        
        // QR 코드 표시 (하단)
        const qrCodeDiv = document.createElement('div');
        qrCodeDiv.className = 'qr-code';
        
        try {
            if (product.qr_code) {
                // 저장된 QR 코드가 있으면 사용
                const img = document.createElement('img');
                img.src = product.qr_code;
                img.style.width = '100%';
                img.style.height = '100%';
                qrCodeDiv.appendChild(img);
                console.log(`✅ 저장된 QR 코드 사용: ${product.name}`);
            } else {
                // 저장된 QR 코드가 없으면 새로 생성 (임시)
                console.warn(`⚠️ QR 코드 없음, 임시 생성: ${product.name}`);
                const qrData = `상품: ${product.name}\n가격: ${new Intl.NumberFormat('ko-KR').format(product.price)}원\n농장: 경산다육식물농장\n연락: 유튜브 @경산다육TV`;
                
                const qr = new QRious({
                    element: qrCodeDiv,
                    value: qrData,
                    size: 140,
                    background: 'white',
                    foreground: 'black',
                    level: 'M'
                });
                
                // Canvas를 img로 변환
                const canvas = qrCodeDiv.querySelector('canvas');
                if (canvas) {
                    const img = document.createElement('img');
                    img.src = canvas.toDataURL();
                    img.style.width = '100%';
                    img.style.height = '100%';
                    qrCodeDiv.innerHTML = '';
                    qrCodeDiv.appendChild(img);
                }
            }
        } catch (error) {
            console.error('QR 코드 처리 실패:', error);
            qrCodeDiv.innerHTML = '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:6px;">QR</div>';
        }
        
        // 라벨에 요소들 추가 (순서: 상품명 → 가격 → QR코드)
        label.appendChild(productName);
        label.appendChild(productPrice);
        label.appendChild(qrCodeDiv);
        
        return label;
    }

    // QR 라벨 미리보기 닫기
    closeQRLabelPreview() {
        const modal = document.getElementById('qr-label-preview-modal');
        modal.classList.add('hidden');
    }

    // QR 라벨 인쇄
    printQRLabels() {
        // 프린트 실행
        window.print();
    }

    // 인라인 폼 수익률 계산
    calculateInlineProfitMargin() {
        const sellPrice = parseFloat(document.getElementById('inline-product-price').value) || 0;
        const buyPrice = parseFloat(document.getElementById('inline-product-wholesale-price').value) || 0;
        const marginElement = document.getElementById('inline-profit-margin');
        
        if (sellPrice > 0 && buyPrice > 0 && sellPrice > buyPrice) {
            const profit = sellPrice - buyPrice;
            const margin = ((profit / sellPrice) * 100).toFixed(1);
            marginElement.innerHTML = `💰 수익: ${new Intl.NumberFormat('ko-KR').format(profit)}원 | 수익률: <span class="font-bold text-green-600">${margin}%</span>`;
        } else if (sellPrice > 0 && buyPrice > 0 && sellPrice <= buyPrice) {
            marginElement.innerHTML = `⚠️ <span class="text-red-600 font-bold">손실 상품 (매입가 ≥ 판매가)</span>`;
        } else {
            marginElement.innerHTML = '';
        }
    }

    // 모달 폼 수익률 계산
    calculateModalProfitMargin() {
        const sellPrice = parseFloat(document.getElementById('product-form-price').value) || 0;
        const buyPrice = parseFloat(document.getElementById('product-form-wholesale-price').value) || 0;
        const marginElement = document.getElementById('modal-profit-margin');
        
        if (sellPrice > 0 && buyPrice > 0 && sellPrice > buyPrice) {
            const profit = sellPrice - buyPrice;
            const margin = ((profit / sellPrice) * 100).toFixed(1);
            marginElement.innerHTML = `💰 수익: ${new Intl.NumberFormat('ko-KR').format(profit)}원 | 수익률: <span class="font-bold text-green-600">${margin}%</span>`;
        } else if (sellPrice > 0 && buyPrice > 0 && sellPrice <= buyPrice) {
            marginElement.innerHTML = `⚠️ <span class="text-red-600 font-bold">손실 상품 (매입가 ≥ 판매가)</span>`;
        } else {
            marginElement.innerHTML = '';
        }
    }

    // 대기자 목록에서 고객 관리로 이동
    navigateToCustomer(customerName) {
        // 고객 관리 탭으로 전환
        this.showSection('farm_customers');
        
        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-green-600', 'text-white');
            link.classList.add('text-gray-600', 'hover:text-gray-900');
        });
        
        const customersTab = document.querySelector('[onclick*="showSection(\'customers\')"]');
        if (customersTab) {
            customersTab.classList.remove('text-gray-600', 'hover:text-gray-900');
            customersTab.classList.add('bg-green-600', 'text-white');
        }
        
        // 고객 검색
        setTimeout(() => {
            const searchInput = document.getElementById('customer-search');
            if (searchInput) {
                searchInput.value = customerName;
                // 검색 실행
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            }
        }, 100);
        
        this.showToast(`"${customerName}" 고객 정보로 이동했습니다.`, 'success');
    }

    // 대기자 목록에서 상품 관리로 이동
    navigateToProduct(productName) {
        // 상품 관리 탭으로 전환
        this.showSection('products');
        
        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-green-600', 'text-white');
            link.classList.add('text-gray-600', 'hover:text-gray-900');
        });
        
        const productsTab = document.querySelector('[onclick*="showSection(\'products\')"]');
        if (productsTab) {
            productsTab.classList.remove('text-gray-600', 'hover:text-gray-900');
            productsTab.classList.add('bg-green-600', 'text-white');
        }
        
        // 상품 검색
        setTimeout(() => {
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.value = productName;
                // 검색 실행
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            }
        }, 100);
        
        this.showToast(`"${productName}" 상품 정보로 이동했습니다.`, 'success');
    }

    // QR 코드 확대 모달 표시
    showQRCodeModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.qr_code) return;
        
        // 기존 모달 제거
        const existingModal = document.getElementById('qr-code-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 생성
        const modal = document.createElement('div');
        modal.id = 'qr-code-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <button onclick="this.closest('#qr-code-modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="text-center">
                    <img src="${product.qr_code}" alt="QR코드" class="w-48 h-48 mx-auto border border-gray-200 rounded">
                    <p class="text-sm text-gray-600 mt-4">가격: ${new Intl.NumberFormat('ko-KR').format(product.price)}원</p>
                </div>
            </div>
        `;
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    // QR 코드를 Base64로 생성 (상품 저장용)
    // QR 코드 테스트 헬퍼 함수 (디버깅용) - 중앙집중화된 방식
    async testQRCodeGeneration() {
        const testProduct = {
            id: 'TEST_001',
            name: '테스트 상품',
            price: 25000,
            category: '테스트 카테고리',
            size: 'M 사이즈',
            description: '테스트용 상품 설명'
        };
        
        try {
            console.log('🧪 [중앙 테스트] QR 코드 테스트 시작...');
            const qrResult = await this.generateProductQRCode(testProduct, { showLogs: true });
            
            if (qrResult.success) {
                console.log('✅ [중앙 테스트] 성공! QR 코드 길이:', qrResult.qrCode.length);
                console.log('📊 [중앙 테스트] 예상 데이터:', qrResult.data);
                return qrResult.qrCode;
            } else {
                throw new Error(qrResult.error);
            }
        } catch (error) {
            console.error('❌ [중앙 테스트] 실패:', error);
            throw error;
        }
    }
    
    // 기존 함수 호환성을 위해 중앙집중화된 함수로 리디렉션
    async generateQRCodeBase64(product) {
        console.log('🔄 [호환성] 기존 generateQRCodeBase64 호출 → 중앙집중화된 함수로 리디렉션');
        
        const result = await this.generateProductQRCode(product);
        
        if (result.success) {
            return result.qrCode;
        } else {
            throw new Error(result.error);
        }
    }
    
    // 이전 버전 호환성을 위해 Promise 방식도 지원
    generateQRCodeBase64Promise(product) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.generateProductQRCode(product);
                if (result.success) {
                    resolve(result.qrCode);
                } else {
                    reject(new Error(result.error));
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // 디버깅용 - 기존 코드 (주석 처리)
    /*
    generateQRCodeBase64_OLD(product) {
        return new Promise((resolve, reject) => {
            try {
                // QRious 라이브러리 로드 여부 확인
                if (typeof QRious === 'undefined') {
                    throw new Error('QRious 라이브러리가 로드되지 않았습니다.');
                }
                
                // 상품 데이터 유효성 검사
                if (!product || !product.name) {
                    throw new Error('상품 데이터가 유효하지 않습니다.');
                }
                
                // QR 코드 데이터 준비 (더 자세한 정보 포함)
                const productInfo = {
                    name: product.name || '상품명 없음',
                    price: product.price || 0,
                    category: product.category || '카테고리 없음',
                    size: product.size || '사이즈 없음',
                    farm: '경산다육식물농장',
                    contact: '유튜브 @경산다육TV',
                    id: product.id || ''
                };
                
                // QR 데이터 문자열 생성
                const qrData = `🌱 ${productInfo.name}
💰 가격: ${new Intl.NumberFormat('ko-KR').format(productInfo.price)}원
🏷️ 카테고리: ${productInfo.category}
📊 사이즈: ${productInfo.size}
🌿 농장: ${productInfo.farm}
📞 연락: ${productInfo.contact}
🆔 ID: ${productInfo.id}`;
                
                console.log('📋 QR 코드 생성 데이터:', qrData);
                
                // 임시 캔버스 생성
                const canvas = document.createElement('canvas');
                
                // QRious로 QR 코드 생성
                const qr = new QRious({
                    element: canvas,
                    value: qrData,
                    size: 256, // 더 큰 사이즈로 변경
                    background: 'white',
                    foreground: 'black',
                    level: 'H' // 최고 오류 정정 레벨
                });
    */

    // 주간 베스트셀러 TOP 5 렌더링
    renderWeeklyBestsellers() {
        const container = document.getElementById('weekly-bestseller-list');
        if (!container) return;
        
        // 최근 7일 주문에서 상품별 판매량 집계
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const productSales = {};
        this.orders.forEach(order => {
            const orderDate = new Date(order.order_date);
            if (orderDate >= weekAgo && order.order_status === '배송완료') {
                try {
                    const items = Array.isArray(order.order_items) 
                        ? order.order_items 
                        : JSON.parse(order.order_items || '[]');
                    
                    items.forEach(item => {
                        const productName = item.product_name || item.name || '알 수 없는 상품';
                        
                        // 유효한 상품명이 있을 때만 처리
                        if (productName && productName !== 'undefined' && productName.trim() !== '') {
                            if (!productSales[productName]) {
                                productSales[productName] = { quantity: 0, revenue: 0 };
                            }
                            productSales[productName].quantity += item.quantity || 0;
                            productSales[productName].revenue += (item.quantity || 0) * (item.price || 0);
                        } else {
                            console.warn('⚠️ 유효하지 않은 상품명:', item);
                        }
                    });
                } catch (error) {
                    console.warn('주문 아이템 파싱 오류:', error);
                }
            }
        });
        
        // 판매량 기준으로 정렬하여 TOP 5 선택
        const top5Products = Object.entries(productSales)
            .sort(([,a], [,b]) => b.quantity - a.quantity)
            .slice(0, 5);
        
        console.log('📊 주간 베스트셀러 데이터:', productSales);
        console.log('🏆 TOP 5 상품:', top5Products);
        
        if (top5Products.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-chart-bar text-3xl mb-2 opacity-50"></i>
                    <p>최근 7일간 판매 데이터가 없습니다.</p>
                    <p class="text-xs mt-2">주문을 등록하고 '배송완료' 상태로 변경해보세요!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = top5Products.map(([productName, data], index) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 ${index < 3 ? 'bg-yellow-500' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ${index + 1}
                    </div>
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-seedling text-green-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900 text-sm">${productName}</p>
                        <p class="text-xs text-gray-500">${data.revenue.toLocaleString()}원</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-blue-600">${data.quantity}</p>
                    <p class="text-xs text-gray-500">개 판매</p>
                </div>
            </div>
        `).join('');
    }

    // VIP 고객 순위 TOP 10 렌더링
    renderVIPCustomerRanking() {
        const container = document.getElementById('vip-customer-list');
        if (!container) return;
        
        // 고객별 총 구매 금액 집계
        const customerPurchases = {};
        this.orders.forEach(order => {
            if (order.order_status === '배송완료') {
                const customerId = order.customer_id || order.customer_name || 'unknown';
                const customerName = order.customer_name || '알 수 없는 고객';
                
                // 유효한 고객 정보가 있을 때만 처리
                if (customerId && customerId !== 'undefined' && customerName !== 'undefined') {
                    if (!customerPurchases[customerId]) {
                        customerPurchases[customerId] = {
                            name: customerName,
                            totalAmount: 0,
                            orderCount: 0
                        };
                    }
                    customerPurchases[customerId].totalAmount += order.total_amount || 0;
                    customerPurchases[customerId].orderCount += 1;
                } else {
                    console.warn('⚠️ 유효하지 않은 고객 정보:', order);
                }
            }
        });
        
        // 구매 금액 기준으로 정렬하여 TOP 10 선택
        const top10Customers = Object.entries(customerPurchases)
            .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
            .slice(0, 10);
        
        console.log('👑 VIP 고객 구매 데이터:', customerPurchases);
        console.log('🏆 TOP 10 고객:', top10Customers);
        
        if (top10Customers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-crown text-3xl mb-2 opacity-50"></i>
                    <p>VIP 고객 데이터가 없습니다.</p>
                    <p class="text-xs mt-2">주문을 등록하고 '배송완료' 상태로 변경해보세요!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = top10Customers.map(([customerId, data], index) => {
            // 고객 등급 결정
            let grade = 'GENERAL';
            let gradeColor = 'text-blue-600 bg-blue-100';
            if (data.totalAmount >= 1000000) {
                grade = 'BLACK_DIAMOND';
                gradeColor = 'text-gray-900 bg-gray-100';
            } else if (data.totalAmount >= 500000) {
                grade = 'PURPLE_EMPEROR';
                gradeColor = 'text-purple-600 bg-purple-100';
            } else if (data.totalAmount >= 200000) {
                grade = 'RED_RUBY';
                gradeColor = 'text-red-600 bg-red-100';
            } else if (data.totalAmount >= 100000) {
                grade = 'GREEN_LEAF';
                gradeColor = 'text-green-600 bg-green-100';
            }
            
            return `
                <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 ${index < 3 ? 'bg-purple-500' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white font-bold text-xs">
                            ${index + 1}
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${data.name}</p>
                            <span class="text-xs px-2 py-1 rounded-full ${gradeColor}">${grade}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-bold text-purple-600">${data.totalAmount.toLocaleString()}원</p>
                        <p class="text-xs text-gray-500">${data.orderCount}회 주문</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 신규/재구매 고객 분석 차트 렌더링
    renderCustomerAnalysisChart() {
        const ctx = document.getElementById('customer-analysis-chart');
        if (!ctx) return;
        
        // 기존 차트 제거
        if (this.customerAnalysisChart) {
            this.customerAnalysisChart.destroy();
        }
        
        // 최근 30일 기준으로 신규/재구매 고객 분석
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const customerActivity = {};
        let newCustomers = 0;
        let returningCustomers = 0;
        
        // 고객별 첫 주문 날짜와 최근 30일 주문 분석
        this.orders.forEach(order => {
            const orderDate = new Date(order.order_date);
            const customerId = order.customer_id || order.customer_name;
            
            if (!customerActivity[customerId]) {
                customerActivity[customerId] = {
                    firstOrder: orderDate,
                    recentOrders: []
                };
            }
            
            if (orderDate < customerActivity[customerId].firstOrder) {
                customerActivity[customerId].firstOrder = orderDate;
            }
            
            if (orderDate >= thirtyDaysAgo && order.order_status === '배송완료') {
                customerActivity[customerId].recentOrders.push(orderDate);
            }
        });
        
        // 신규/재구매 고객 분류
        Object.entries(customerActivity).forEach(([customerId, activity]) => {
            if (activity.recentOrders.length > 0) {
                // 첫 주문이 최근 30일 이내면 신규 고객
                if (activity.firstOrder >= thirtyDaysAgo) {
                    newCustomers++;
                } else {
                    returningCustomers++;
                }
            }
        });
        
        // UI 업데이트
        const newCustomerCountElement = document.getElementById('new-customer-count');
        const returningCustomerCountElement = document.getElementById('returning-customer-count');
        
        if (newCustomerCountElement) {
            newCustomerCountElement.textContent = `${newCustomers}명`;
        }
        if (returningCustomerCountElement) {
            returningCustomerCountElement.textContent = `${returningCustomers}명`;
        }
        
        // 파이 차트 생성
        const totalCustomers = newCustomers + returningCustomers;
        if (totalCustomers === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.fillStyle = '#9CA3AF';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('데이터 없음', ctx.width / 2, ctx.height / 2);
            return;
        }
        
        this.customerAnalysisChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['신규 고객', '재구매 고객'],
                datasets: [{
                    data: [newCustomers, returningCustomers],
                    backgroundColor: ['#10B981', '#3B82F6'],
                    borderWidth: 0,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed / totalCustomers) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed}명 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ==================== 실시간 운영 현황 기능 ====================
    
    // 실시간 운영 현황 초기화
    setupRealtimeDashboard() {
        // 현재 시간 표시 업데이트
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // 카드 클릭 이벤트 설정
        this.setupRealtimeCardEvents();
        
        // 빠른 업무 처리 버튼 이벤트 설정
        this.setupQuickActionEvents();
        
        // 실시간 업데이트 인터벌 초기화 (switchTab에서 관리됨)
        this.realtimeUpdateInterval = null;
        
        // 새로고침 버튼 이벤트
        const refreshBtn = document.getElementById('refresh-realtime');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateRealtimeData();
                this.showToast('🔄 실시간 데이터를 업데이트했습니다!', 'success');
            });
        }
    }
    
    // 실시간 업데이트 시작 (대시보드 페이지에서만)
    startRealtimeUpdates() {
        // 대시보드 DOM 요소가 존재하는지 확인
        const dashboardElement = document.getElementById('dashboard-section');
        const packOrdersElement = document.getElementById('pack-orders-count');
        
        if (!dashboardElement || !packOrdersElement || dashboardElement.classList.contains('hidden')) {
            console.log('⏹️ 대시보드가 현재 표시되지 않아 실시간 업데이트를 시작하지 않습니다');
            return;
        }
        
        if (this.realtimeUpdateInterval) {
            clearInterval(this.realtimeUpdateInterval);
        }
        
        // 즉시 한 번 업데이트
        this.updateRealtimeData();
        
        // 30초마다 실시간 데이터 업데이트
        this.realtimeUpdateInterval = setInterval(() => {
            // 대시보드가 여전히 보이는지 확인
            const currentDashboard = document.getElementById('dashboard-section');
            if (currentDashboard && !currentDashboard.classList.contains('hidden')) {
                this.updateRealtimeData();
            } else {
                console.log('⏹️ 대시보드가 더 이상 표시되지 않아 실시간 업데이트를 중지합니다');
                this.stopRealtimeUpdates();
            }
        }, 30000);
        
        console.log('✅ 실시간 업데이트가 시작되었습니다 (30초 간격)');
    }
    
    // 실시간 업데이트 중지 (다른 페이지로 이동시)
    stopRealtimeUpdates() {
        if (this.realtimeUpdateInterval) {
            clearInterval(this.realtimeUpdateInterval);
            this.realtimeUpdateInterval = null;
            console.log('⏹️ 실시간 업데이트가 중지되었습니다');
        }
    }
    
    // 현재 시간 업데이트
    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }
    
    // 실시간 카드 클릭 이벤트 설정
    setupRealtimeCardEvents() {
        // DOM 로드 완료 후 실행
        const self = this;
        const setupEvents = function() {
            console.log('🔧 실시간 카드 이벤트 설정 시작...');
            
            // 1. 포장할 주문 카드
            const packOrdersCard = document.getElementById('pack-orders-card');
            if (packOrdersCard) {
                packOrdersCard.addEventListener('click', () => {
                    self.switchTab('tab-orders');
                    setTimeout(() => {
                        const statusBtn = document.getElementById('status-입금확인');
                        if (statusBtn) statusBtn.click();
                    }, 100);
                });
                console.log('✅ 포장할 주문 카드 이벤트 등록 완료');
            }
            
            // 2. 오늘 보낼 택배 카드
            const shipOrdersCard = document.getElementById('ship-orders-card');
            if (shipOrdersCard) {
                shipOrdersCard.addEventListener('click', () => {
                    self.switchTab('tab-orders');
                    setTimeout(() => {
                        const statusBtn = document.getElementById('status-배송준비');
                        if (statusBtn) statusBtn.click();
                    }, 100);
                });
                console.log('✅ 오늘 보낼 택배 카드 이벤트 등록 완료');
            }
            
            // 3. 재고 부족 상품 카드
            const lowStockCard = document.getElementById('low-stock-card');
            if (lowStockCard) {
                lowStockCard.addEventListener('click', () => {
                    self.switchTab('tab-products');
                    // 재고 부족 상품 필터링 (추후 구현)
                });
            }
            
            // 4. 연락할 대기자 카드
            const contactWaitlistCard = document.getElementById('contact-waitlist-card');
            if (contactWaitlistCard) {
                contactWaitlistCard.addEventListener('click', () => {
                    self.switchTab('tab-waitlist');
                    // 입고완료 상태 필터링 (추후 구현)
                });
                console.log('✅ 연락할 대기자 카드 이벤트 등록 완료');
            }
            
            // 5. 이번 달 신규 고객 카드
            const newCustomersCard = document.getElementById('new-customers-card');
            if (newCustomersCard) {
                newCustomersCard.addEventListener('click', () => {
                    self.switchTab('tab-customers');
                    // 이번 달 신규 고객 필터링 (추후 구현)
                });
                console.log('✅ 이번 달 신규 고객 카드 이벤트 등록 완료');
            }
            
            console.log('🎉 실시간 카드 이벤트 설정 완료');
        };
        
        // DOM이 준비되면 실행, 그렇지 않으면 DOMContentLoaded 이벤트 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEvents);
        } else {
            setupEvents();
        }
    }
    
    // 빠른 업무 처리 버튼 이벤트 설정
    setupQuickActionEvents() {
        // 새 주문 등록
        const quickNewOrder = document.getElementById('quick-new-order');
        if (quickNewOrder) {
            quickNewOrder.addEventListener('click', () => {
                this.switchTab('tab-orders');
                setTimeout(() => {
                    const addOrderBtn = document.getElementById('add-order-btn');
                    if (addOrderBtn) addOrderBtn.click();
                }, 100);
            });
        }
        
        // 송장번호 일괄입력
        const quickTrackingImport = document.getElementById('quick-tracking-import');
        if (quickTrackingImport) {
            quickTrackingImport.addEventListener('click', () => {
                this.switchTab('tab-orders');
                setTimeout(() => {
                    const bulkTrackingBtn = document.getElementById('bulk-tracking-import-btn');
                    if (bulkTrackingBtn) bulkTrackingBtn.click();
                }, 100);
            });
        }
        
        // 피킹 리스트
        const quickPickingList = document.getElementById('quick-picking-list');
        if (quickPickingList) {
            quickPickingList.addEventListener('click', () => {
                this.switchTab('tab-orders');
                setTimeout(() => {
                    const pickingBtn = document.getElementById('generate-picking-list-btn');
                    if (pickingBtn) pickingBtn.click();
                }, 100);
            });
        }
        
        // 포장 라벨
        const quickPackagingLabels = document.getElementById('quick-packaging-labels');
        if (quickPackagingLabels) {
            quickPackagingLabels.addEventListener('click', () => {
                this.switchTab('tab-orders');
                setTimeout(() => {
                    const labelsBtn = document.getElementById('generate-packaging-labels-btn');
                    if (labelsBtn) labelsBtn.click();
                }, 100);
            });
        }
        
        // 새 고객 등록
        const quickNewCustomer = document.getElementById('quick-new-customer');
        if (quickNewCustomer) {
            quickNewCustomer.addEventListener('click', () => {
                this.switchTab('tab-customers');
                setTimeout(() => {
                    const addCustomerBtn = document.getElementById('add-customer-btn');
                    if (addCustomerBtn) addCustomerBtn.click();
                }, 100);
            });
        }
        
        // 대기자 등록  
        const quickAddWaitlist = document.getElementById('quick-add-waitlist');
        if (quickAddWaitlist) {
            quickAddWaitlist.addEventListener('click', () => {
                this.switchTab('tab-waitlist');
                setTimeout(() => {
                    const addWaitlistBtn = document.getElementById('add-waitlist-btn');
                    if (addWaitlistBtn) addWaitlistBtn.click();
                }, 100);
            });
        }
    }
    
    // 실시간 데이터 업데이트
    updateRealtimeData() {
        // 대시보드가 현재 표시되는지 확인
        const dashboardSection = document.getElementById('dashboard-section');
        if (!dashboardSection || dashboardSection.classList.contains('hidden')) {
            console.log('⏭️ 대시보드가 표시되지 않아 실시간 데이터 업데이트를 건너뜁니다');
            return;
        }
        
        // 1. 포장할 주문 (입금확인 상태)
        const packOrdersCount = (this.orders || []).filter(order => order.order_status === '입금확인').length;
        const packCountElement = document.getElementById('pack-orders-count');
        if (packCountElement) {
            packCountElement.textContent = packOrdersCount;
        }
        
        // 2. 오늘 보낼 택배 (배송준비 상태)
        const shipOrdersCount = (this.orders || []).filter(order => order.order_status === '배송준비').length;
        const shipCountElement = document.getElementById('ship-orders-count');
        if (shipCountElement) {
            shipCountElement.textContent = shipOrdersCount;
        }
        
        // 3. 재고 부족 상품 (재고가 10개 이하)
        const lowStockCount = (this.products || []).filter(product => (product.stock || 0) <= 10).length;
        const lowStockElement = document.getElementById('low-stock-count');
        if (lowStockElement) {
            lowStockElement.textContent = lowStockCount;
        }
        
        // 4. 연락할 대기자 (대기중 상태)
        const contactWaitlistCount = (this.farm_waitlist || []).filter(item => item.status === '대기중').length;
        const contactWaitlistElement = document.getElementById('contact-waitlist-count');
        if (contactWaitlistElement) {
            contactWaitlistElement.textContent = contactWaitlistCount;
        }
        
        // 5. 이번 달 신규 고객
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newCustomersCount = (this.customers || []).filter(customer => {
            // created_at 또는 registration_date 필드 확인
            const customerDateField = customer.created_at || customer.registration_date;
            if (!customerDateField) return false;
            
            const customerDate = new Date(customerDateField);
            if (isNaN(customerDate)) return false; // 유효하지 않은 날짜 제외
            
            return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear;
        }).length;
        const newCustomersElement = document.getElementById('new-customers-count');
        if (newCustomersElement) {
            newCustomersElement.textContent = newCustomersCount;
        }
        
        // 디버깅 정보 출력
        console.log('🔄 실시간 운영 현황 데이터 업데이트:');
        console.log(`📦 포장할 주문: ${packOrdersCount}건`);
        console.log(`🚚 오늘 보낼 택배: ${shipOrdersCount}건`);
        console.log(`📉 재고 부족 상품: ${lowStockCount}개`);
        console.log(`📞 연락할 대기자: ${contactWaitlistCount}명 (전체 대기자 ${(this.farm_waitlist || []).length}명)`);
        console.log(`👥 이번 달 신규 고객: ${newCustomersCount}명 (전체 고객 ${(this.customers || []).length}명)`);
        console.log('✅ 실시간 운영 현황 데이터 업데이트 완료');
    }
    
    // ==================== 경영 대시보드 기능 ====================
    
    // 경영 대시보드 초기화
    setupAnalyticsDashboard() {
        // 날짜 필터 이벤트 설정
        const dashboardPeriod = document.getElementById('dashboard-period');
        if (dashboardPeriod) {
            dashboardPeriod.addEventListener('change', () => {
                this.updateSalesAnalytics();
            });
        }
        
        // 새로고침 버튼 이벤트
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateSalesAnalytics();
                this.showToast('📊 매출 데이터를 업데이트했습니다!', 'success');
            });
        }
        
        // 초기 데이터 로드
        this.updateSalesAnalytics();
    }
    
    // 매출 분석 데이터 업데이트
    updateSalesAnalytics() {
        const periodElement = document.getElementById('dashboard-period');
        const days = periodElement ? parseInt(periodElement.value) : 30;
        
        // 선택된 기간의 날짜 범위 계산
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // 해당 기간의 주문 데이터 필터링
        const periodOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        // 완료된 주문만 매출에 포함 (배송완료 상태)
        const completedOrders = periodOrders.filter(order => 
            order.order_status === '배송완료'
        );
        
        // 1. 총 매출액 계산
        const totalRevenue = completedOrders.reduce((sum, order) => 
            sum + (order.total_amount || 0), 0
        );
        
        // 2. 총 주문 건수
        const totalOrders = completedOrders.length;
        
        // 3. 총 판매된 상품 수 계산
        let totalProductsSold = 0;
        completedOrders.forEach(order => {
            if (order.order_items) {
                const items = Array.isArray(order.order_items) 
                    ? order.order_items 
                    : JSON.parse(order.order_items || '[]');
                totalProductsSold += items.reduce((sum, item) => 
                    sum + (item.quantity || 0), 0
                );
            }
        });
        
        // 4. 객단가 계산 (총 매출액 ÷ 총 주문 건수)
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // UI 업데이트
        this.updateSalesCards({
            totalRevenue,
            totalOrders,
            totalProductsSold,
            averageOrderValue
        });
        
        // 새로운 위젯들 업데이트
        this.renderWeeklyBestsellers();
        this.renderVIPCustomerRanking();
        this.renderCustomerAnalysisChart();
        
        console.log(`📊 매출 분석 업데이트 (${days}일): 매출 ${totalRevenue.toLocaleString()}원, 주문 ${totalOrders}건`);
    }
    
    // 매출 요약 카드 UI 업데이트
    updateSalesCards(data) {
        // 총 매출액
        const totalRevenueElement = document.getElementById('total-revenue');
        if (totalRevenueElement) {
            totalRevenueElement.textContent = `${data.totalRevenue.toLocaleString()}원`;
        }
        
        // 총 주문 건수
        const totalOrdersElement = document.getElementById('total-orders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = `${data.totalOrders}건`;
        }
        
        // 총 판매된 상품 수
        const totalProductsSoldElement = document.getElementById('total-products-sold');
        if (totalProductsSoldElement) {
            totalProductsSoldElement.textContent = `${data.totalProductsSold}개`;
        }
        
        // 객단가
        const averageOrderValueElement = document.getElementById('average-order-value');
        if (averageOrderValueElement) {
            averageOrderValueElement.textContent = `${Math.round(data.averageOrderValue).toLocaleString()}원`;
        }
    }

    // =====================================================
    // 판매 채널 관리 기능
    // =====================================================

    // 판매 채널 데이터 로드
    async loadChannels() {
        try {
            console.log('📊 판매 채널 데이터 로드 시도...');
            
            // 먼저 LocalStorage에서 로드 (삭제된 데이터 반영)
            const stored = localStorage.getItem('farm_channels');
            if (stored) {
                this.channels = JSON.parse(stored);
                console.log('💾 LocalStorage에서 판매 채널 로드:', this.channels.length);
            } else {
                // 기본 채널 생성 비활성화 - 사용자가 직접 채널을 추가하도록 함
                this.channels = [];
                this.saveChannelsToStorage();
                console.log('📝 빈 채널 목록으로 시작 (사용자가 직접 추가)');
            }
            
            // Supabase에서 직접 데이터 로드 시도
            try {
                if (window.supabaseClient) {
                    console.log('📡 Supabase에서 직접 채널 데이터 로드 시도...');
                    const { data: serverChannels, error } = await window.supabaseClient
                        .from('farm_channels')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) {
                        throw error;
                    }
                    
                    if (serverChannels && serverChannels.length > 0) {
                        // 서버 데이터와 로컬 데이터 병합 (로컬 삭제 우선)
                        this.mergeChannelsData(serverChannels);
                        console.log('✅ Supabase와 LocalStorage 데이터 병합 완료');
                    } else {
                        console.log('📱 Supabase에서 채널 데이터 없음');
                    }
                } else {
                    console.log('⚠️ Supabase 클라이언트 없음 - LocalStorage 데이터만 사용');
                }
            } catch (apiError) {
                console.log('⚠️ Supabase 로드 실패, LocalStorage 데이터 사용:', apiError.message);
            }
            
            console.log('📊 최종 로드된 판매 채널 수:', this.channels.length);
            return this.channels;
            
        } catch (error) {
            console.error('❌ 판매 채널 로드 실패:', error);
            this.channels = this.getDefaultChannels();
            return this.channels;
        }
    }

    // 서버 데이터와 로컬 데이터 병합
    mergeChannelsData(serverChannels) {
        try {
            console.log('🔄 판매 채널 데이터 병합 시작');
            
            // 삭제된 채널 ID 목록 로드 (로컬 삭제 추적)
            const deletedChannelIds = this.getDeletedChannelIds();
            console.log('🗑️ 삭제된 채널 ID 목록:', deletedChannelIds);
            
            // 로컬에 있는 채널 ID 목록
            const localChannelIds = this.channels.map(c => c.id);
            
            // 서버에서 로컬에 없고, 삭제되지 않은 새 채널만 추가
            const newChannels = serverChannels.filter(serverChannel => 
                !localChannelIds.includes(serverChannel.id) && 
                !deletedChannelIds.includes(serverChannel.id)
            );
            
            if (newChannels.length > 0) {
                this.channels.push(...newChannels);
                this.saveChannelsToStorage();
                console.log(`➕ 서버에서 ${newChannels.length}개 새 채널 추가`);
            } else {
                console.log('📝 추가할 새 채널 없음 (삭제된 채널 제외)');
            }
            
            console.log('✅ 판매 채널 데이터 병합 완료');
        } catch (error) {
            console.error('❌ 판매 채널 데이터 병합 실패:', error);
        }
    }

    // 삭제된 채널 ID 추가
    addDeletedChannelId(channelId) {
        try {
            const deletedIds = this.getDeletedChannelIds();
            if (!deletedIds.includes(channelId)) {
                deletedIds.push(channelId);
                localStorage.setItem('deleted_channel_ids', JSON.stringify(deletedIds));
                console.log('🗑️ 삭제된 채널 ID 추가:', channelId);
            }
        } catch (error) {
            console.error('❌ 삭제된 채널 ID 추가 실패:', error);
        }
    }

    // 삭제된 채널 ID 목록 조회
    getDeletedChannelIds() {
        try {
            const deletedIds = localStorage.getItem('deleted_channel_ids');
            return deletedIds ? JSON.parse(deletedIds) : [];
        } catch (error) {
            console.error('❌ 삭제된 채널 ID 목록 조회 실패:', error);
            return [];
        }
    }

    // 삭제된 채널 ID 목록 초기화 (필요시)
    clearDeletedChannelIds() {
        try {
            localStorage.removeItem('deleted_channel_ids');
            console.log('🗑️ 삭제된 채널 ID 목록 초기화');
        } catch (error) {
            console.error('❌ 삭제된 채널 ID 목록 초기화 실패:', error);
        }
    }

    // 기본 채널들 삭제 (핸드폰에서 불필요한 기본 채널 제거)
    async clearDefaultChannels() {
        try {
            console.log('🗑️ 기본 채널들 삭제 시작...');
            
            const defaultChannelIds = [
                'channel-1', 'channel-2', 'channel-3', 
                'channel-4', 'channel-5', 'channel-6'
            ];
            
            // 로컬에서 기본 채널들 제거
            this.channels = this.channels.filter(channel => 
                !defaultChannelIds.includes(channel.id)
            );
            
            // LocalStorage 저장
            this.saveChannelsToStorage();
            
            // Supabase에서도 기본 채널들 삭제
            if (window.supabaseClient) {
                for (const channelId of defaultChannelIds) {
                    try {
                        await window.supabaseClient
                            .from('farm_channels')
                            .delete()
                            .eq('id', channelId);
                        console.log(`✅ Supabase에서 기본 채널 삭제: ${channelId}`);
                    } catch (error) {
                        console.log(`⚠️ Supabase 기본 채널 삭제 실패: ${channelId}`, error.message);
                    }
                }
            }
            
            // UI 업데이트
            this.renderChannelsTable();
            this.populateOrderSourceDropdown();
            
            console.log('✅ 기본 채널들 삭제 완료');
            return true;
        } catch (error) {
            console.error('❌ 기본 채널들 삭제 실패:', error);
            return false;
        }
    }

    // 기본 판매 채널 데이터
    getDefaultChannels() {
        return [
            {
                id: 'channel-1',
                name: '직접 주문',
                description: '농장 직접 방문 또는 전화 주문',
                icon: 'fas fa-store',
                color: '#10B981',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            },
            {
                id: 'channel-2',
                name: '네이버 스마트스토어',
                description: '네이버 쇼핑 플랫폼',
                icon: 'fab fa-neos',
                color: '#00C851',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            },
            {
                id: 'channel-3',
                name: '쿠팡',
                description: '쿠팡 마켓플레이스',
                icon: 'fas fa-rocket',
                color: '#FF6B35',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            },
            {
                id: 'channel-4',
                name: '11번가',
                description: '11번가 온라인 쇼핑몰',
                icon: 'fas fa-shopping-cart',
                color: '#E91E63',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            },
            {
                id: 'channel-5',
                name: '지마켓',
                description: 'G마켓 온라인 쇼핑몰',
                icon: 'fas fa-gem',
                color: '#FF9800',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            },
            {
                id: 'channel-6',
                name: '당근마켓',
                description: '지역 기반 중고거래 플랫폼',
                icon: 'fas fa-carrot',
                color: '#FF8A00',
                active: true,
                created_at: Date.now(),
                updated_at: Date.now()
            }
        ];
    }

    // 판매 채널 LocalStorage 저장
    saveChannelsToStorage() {
        try {
            localStorage.setItem('farm_channels', JSON.stringify(this.channels));
            console.log('💾 판매 채널 데이터 LocalStorage 저장 완료');
        } catch (error) {
            console.error('❌ 판매 채널 LocalStorage 저장 실패:', error);
        }
    }

    // 판매 채널 저장 (생성/수정)
    async saveChannel(channelData) {
        // 중복 실행 방지
        if (this.savingChannel) {
            console.log('⚠️ 채널 저장 중 - 중복 실행 방지');
            return;
        }
        
        this.savingChannel = true;
        try {
            console.log('💾 판매 채널 저장 시작:', channelData);
            
            // 데이터 검증
            if (!channelData.name || channelData.name.trim() === '') {
                throw new Error('채널명은 필수입니다.');
            }

            const now = Date.now();
            let savedChannel;

            if (channelData.id && channelData.id !== '') {
                // 기존 채널 수정
                const index = this.channels.findIndex(c => c.id === channelData.id);
                if (index === -1) {
                    throw new Error('수정할 채널을 찾을 수 없습니다.');
                }

                savedChannel = {
                    ...this.channels[index],
                    ...channelData,
                    updated_at: now
                };
                this.channels[index] = savedChannel;
                
                console.log('✅ 판매 채널 수정 완료:', savedChannel.name);
            } else {
                // 새 채널 생성
                savedChannel = {
                    ...channelData,
                    id: 'channel-' + Date.now(),
                    created_at: now,
                    updated_at: now
                };
                this.channels.push(savedChannel);
                
                console.log('✅ 새 판매 채널 생성 완료:', savedChannel.name);
            }

            // Supabase 직접 저장 시도
            try {
                if (window.supabaseClient) {
                    console.log('📡 Supabase에 직접 채널 저장 시도...');
                    const { error } = await window.supabaseClient
                        .from('farm_channels')
                        .upsert(savedChannel, { onConflict: 'id' });

                    if (error) {
                        throw error;
                    }
                    
                    console.log('✅ Supabase에 판매 채널 저장 완료');
                } else {
                    console.log('⚠️ Supabase 클라이언트 없음 - LocalStorage만 사용');
                }
            } catch (apiError) {
                console.log('⚠️ Supabase 저장 실패, LocalStorage만 사용:', apiError.message);
            }

            // LocalStorage 저장
            this.saveChannelsToStorage();
            
            // 주문 폼 드롭다운 실시간 업데이트
            this.populateOrderSourceDropdown();
            
            return savedChannel;

        } catch (error) {
            console.error('❌ 판매 채널 저장 실패:', error);
            throw error;
        } finally {
            // 플래그 해제
            this.savingChannel = false;
        }
    }

    // 판매 채널 삭제
    async deleteChannel(channelId) {
        try {
            console.log('🗑️ 판매 채널 삭제 시작:', channelId);
            
            const index = this.channels.findIndex(c => c.id === channelId);
            if (index === -1) {
                throw new Error('삭제할 채널을 찾을 수 없습니다.');
            }

            const channelName = this.channels[index].name;
            
            // 삭제된 채널 ID를 추적 목록에 추가
            this.addDeletedChannelId(channelId);
            console.log('🗑️ 삭제된 채널 ID 추적 목록에 추가:', channelId);
            
            // 로컬 배열에서 먼저 제거
            this.channels.splice(index, 1);
            
            // LocalStorage 즉시 저장 (API 실패해도 삭제 유지)
            this.saveChannelsToStorage();
            console.log('💾 LocalStorage에서 채널 삭제 완료');
            
            // Supabase 직접 삭제 시도
            try {
                if (window.supabaseClient) {
                    console.log('📡 Supabase에서 직접 채널 삭제 시도:', channelId);
                    const { error } = await window.supabaseClient
                        .from('farm_channels')
                        .delete()
                        .eq('id', channelId);

                    if (error) {
                        throw error;
                    }
                    
                    console.log('✅ Supabase에서 판매 채널 삭제 완료');
                } else {
                    console.log('⚠️ Supabase 클라이언트 없음 - 로컬 삭제만 유지');
                }
            } catch (apiError) {
                console.log('⚠️ Supabase 삭제 실패, 로컬 삭제는 유지됨:', apiError.message);
            }

            // 주문 폼 드롭다운 실시간 업데이트
            this.populateOrderSourceDropdown();
            
            // UI 즉시 업데이트
            this.renderChannelsTable();
            
            console.log('✅ 판매 채널 삭제 완료:', channelName);
            return true;

        } catch (error) {
            console.error('❌ 판매 채널 삭제 실패:', error);
            throw error;
        }
    }

    // 판매 채널 테이블 렌더링
    renderChannelsTable() {
        console.log('🎨 판매 채널 테이블 렌더링 시작');
        
        const tableBody = document.getElementById('channels-table-body');
        if (!tableBody) {
            console.error('❌ 판매 채널 테이블 요소를 찾을 수 없습니다.');
            return;
        }

        if (!this.channels || this.channels.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-inbox text-gray-300 text-3xl mb-2"></i>
                            <p>등록된 판매 채널이 없습니다.</p>
                            <button onclick="window.orderSystem.openChannelModal()" 
                                    class="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                첫 번째 채널 추가하기
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.channels.map(channel => {
            const statusBadge = channel.active 
                ? '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">활성</span>'
                : '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">비활성</span>';

            // 이 채널의 주문 수 및 매출 계산
            const channelOrders = this.orders.filter(order => 
                (order.order_source || order.source || '직접 주문') === channel.name
            );
            
            const orderCount = channelOrders.length;
            const totalRevenue = channelOrders.reduce((total, order) => {
                const orderTotal = typeof order.total === 'number' ? order.total 
                                 : typeof order.total === 'string' ? parseInt(order.total.replace(/[^\d]/g, '')) || 0
                                 : 0;
                return total + orderTotal;
            }, 0);

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                                 style="background-color: ${channel.color}20; color: ${channel.color};">
                                <i class="${channel.icon} text-sm"></i>
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">${channel.name}</div>
                                <div class="text-sm text-gray-500">${channel.description || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${statusBadge}</td>
                    <td class="px-6 py-4 text-sm text-gray-700 font-medium">${orderCount}건</td>
                    <td class="px-6 py-4 text-sm text-gray-700 font-medium">${totalRevenue.toLocaleString()}원</td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                        <button onclick="window.orderSystem.editChannel('${channel.id}')" 
                                class="text-green-600 hover:text-green-900 mr-3 transition-colors">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button onclick="window.orderSystem.confirmDeleteChannel('${channel.id}', '${channel.name}')" 
                                class="text-red-600 hover:text-red-900 transition-colors">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
        console.log('✅ 판매 채널 테이블 렌더링 완료:', this.channels.length);
    }

    // 판매 채널 통계 업데이트
    updateChannelStats() {
        console.log('📊 판매 채널 통계 업데이트 시작');
        
        const totalChannels = this.channels.length;
        const activeChannels = this.channels.filter(c => c.active).length;
        
        // 이번 달 주문 및 매출 계산
        const thisMonth = new Date();
        const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).getTime();
        const thisMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getTime();
        
        const thisMonthOrders = this.orders.filter(order => {
            const orderDate = new Date(order.created_at || order.date).getTime();
            return orderDate >= thisMonthStart && orderDate <= thisMonthEnd;
        });
        
        const monthlyOrdersCount = thisMonthOrders.length;
        const monthlyRevenue = thisMonthOrders.reduce((total, order) => {
            const orderTotal = typeof order.total === 'number' ? order.total 
                             : typeof order.total === 'string' ? parseInt(order.total.replace(/[^\d]/g, '')) || 0
                             : 0;
            return total + orderTotal;
        }, 0);

        // 총 채널 수 업데이트
        const totalElement = document.getElementById('total-channels-count');
        if (totalElement) {
            totalElement.textContent = totalChannels.toString();
        }

        // 활성 채널 수 업데이트
        const activeElement = document.getElementById('active-channels-count');
        if (activeElement) {
            activeElement.textContent = activeChannels.toString();
        }

        // 이번 달 주문 수 업데이트
        const monthlyOrdersElement = document.getElementById('monthly-orders-count');
        if (monthlyOrdersElement) {
            monthlyOrdersElement.textContent = monthlyOrdersCount.toString();
        }

        // 이번 달 매출 업데이트
        const monthlyRevenueElement = document.getElementById('monthly-revenue');
        if (monthlyRevenueElement) {
            monthlyRevenueElement.textContent = `${monthlyRevenue.toLocaleString()}원`;
        }

        console.log('✅ 판매 채널 통계 업데이트 완료:', { 
            totalChannels, 
            activeChannels, 
            monthlyOrdersCount, 
            monthlyRevenue 
        });
    }

    // 판매 채널 모달 열기
    openChannelModal(channelId = null) {
        console.log('🖼️ 판매 채널 모달 열기:', channelId);
        
        const modal = document.getElementById('channel-modal');
        const form = document.getElementById('channel-form');
        const modalTitle = document.getElementById('channel-modal-title');
        
        if (!modal || !form || !modalTitle) {
            console.error('❌ 판매 채널 모달 요소를 찾을 수 없습니다.');
            return;
        }

        // 폼 초기화
        form.reset();
        this.currentEditingChannel = null;

        if (channelId) {
            // 수정 모드
            const channel = this.channels.find(c => c.id === channelId);
            if (channel) {
                this.currentEditingChannel = channel;
                modalTitle.textContent = '판매 채널 수정';
                
                // 폼 데이터 채우기
                document.getElementById('channel-name').value = channel.name || '';
                document.getElementById('channel-description').value = channel.description || '';
                document.getElementById('channel-icon').value = channel.icon || 'fas fa-store';
                document.getElementById('channel-color').value = channel.color || '#10B981';
                document.getElementById('channel-active').checked = channel.active !== false;
            }
        } else {
            // 생성 모드
            modalTitle.textContent = '새 판매 채널 추가';
            document.getElementById('channel-color').value = '#10B981';
            document.getElementById('channel-active').checked = true;
        }

        // 모달 표시
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // 첫 번째 입력 필드에 포커스
        setTimeout(() => {
            const nameInput = document.getElementById('channel-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    // 판매 채널 모달 닫기
    closeChannelModal() {
        console.log('❌ 판매 채널 모달 닫기');
        
        const modal = document.getElementById('channel-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        this.currentEditingChannel = null;
    }

    // 판매 채널 저장 처리
    async handleChannelSave() {
        // 중복 실행 방지
        if (this.savingChannel) {
            console.log('⚠️ 채널 저장 처리 중 - 중복 실행 방지');
            return;
        }
        
        this.savingChannel = true;
        try {
            console.log('💾 판매 채널 저장 처리 시작');
            
            const form = document.getElementById('channel-form');
            if (!form) {
                throw new Error('채널 폼을 찾을 수 없습니다.');
            }

            // HTML의 실제 필드 ID를 사용하여 데이터 수집
            const channelData = {
                id: this.currentEditingChannel ? this.currentEditingChannel.id : '',
                name: document.getElementById('channel-name').value?.trim() || '',
                description: document.getElementById('channel-description').value?.trim() || '',
                icon: document.getElementById('channel-icon').value || 'fas fa-store',
                color: document.getElementById('channel-color').value || '#10B981',
                active: document.getElementById('channel-active').checked
            };

            console.log('📝 수집된 채널 데이터:', channelData);

            // 저장 실행
            await this.saveChannel(channelData);
            
            // UI 업데이트
            this.renderChannelsTable();
            this.updateChannelStats();
            
            // 모달 닫기
            this.closeChannelModal();
            
            // 성공 메시지
            this.showNotification(
                `판매 채널 "${channelData.name}"이(가) ${this.currentEditingChannel ? '수정' : '추가'}되었습니다.`,
                'success'
            );
            
            console.log('✅ 판매 채널 저장 처리 완료');

        } catch (error) {
            console.error('❌ 판매 채널 저장 처리 실패:', error);
            this.showNotification(error.message, 'error');
        } finally {
            // 플래그 해제
            this.savingChannel = false;
        }
    }

    // 판매 채널 수정
    editChannel(channelId) {
        console.log('✏️ 판매 채널 수정:', channelId);
        this.openChannelModal(channelId);
    }

    // 판매 채널 삭제 확인
    confirmDeleteChannel(channelId, channelName) {
        console.log('❓ 판매 채널 삭제 확인:', channelId, channelName);
        
        if (confirm(`정말로 "${channelName}" 채널을 삭제하시겠습니까?\n\n삭제된 채널은 복구할 수 없습니다.`)) {
            this.handleChannelDelete(channelId);
        }
    }

    // 판매 채널 삭제 처리
    async handleChannelDelete(channelId) {
        try {
            console.log('🗑️ 판매 채널 삭제 처리 시작:', channelId);
            
            const channel = this.channels.find(c => c.id === channelId);
            const channelName = channel ? channel.name : '알 수 없는 채널';
            
            await this.deleteChannel(channelId);
            
            // UI 업데이트
            this.renderChannelsTable();
            this.updateChannelStats();
            
            // 성공 메시지
            this.showNotification(`판매 채널 "${channelName}"이(가) 삭제되었습니다.`, 'success');
            
            console.log('✅ 판매 채널 삭제 처리 완료');

        } catch (error) {
            console.error('❌ 판매 채널 삭제 처리 실패:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // 판매 채널 관리 페이지 렌더링
    async renderChannelsPage() {
        console.log('🎨 판매 채널 관리 페이지 렌더링 시작');
        
        try {
            // 데이터 로드
            await this.loadChannels();
            
            // 테이블 렌더링
            this.renderChannelsTable();
            
            // 통계 업데이트
            this.updateChannelStats();
            
            console.log('✅ 판매 채널 관리 페이지 렌더링 완료');

        } catch (error) {
            console.error('❌ 판매 채널 관리 페이지 렌더링 실패:', error);
            this.showNotification('판매 채널 데이터를 로드하는데 실패했습니다.', 'error');
        }
    }

    // 주문 상태 관리 페이지 렌더링
    async renderOrderStatusPage() {
        try {
            console.log('📊 주문 상태 관리 페이지 렌더링 시작');
            
            // 주문 상태 데이터 로드
            await this.loadOrderStatuses();
            
            // 테이블 렌더링
            this.renderOrderStatusTable();
            
            // 통계 업데이트
            this.updateOrderStatusStats();
            
            console.log('✅ 주문 상태 관리 페이지 렌더링 완료');

        } catch (error) {
            console.error('❌ 주문 상태 관리 페이지 렌더링 실패:', error);
            this.showNotification('주문 상태 데이터를 로드하는데 실패했습니다.', 'error');
        }
    }

    // 주문 상태 데이터 로드
    async loadOrderStatuses() {
        try {
            console.log('📊 주문 상태 데이터 로드 시도...');
            
            // API에서 데이터 로드 시도
            try {
                const response = await fetch(this.getApiUrl('farm_order_statuses'));
                if (response.ok) {
                    const result = await response.json();
                    this.orderStatuses = result.data || [];
                    console.log('✅ API에서 주문 상태 데이터 로드:', this.orderStatuses.length);
                    return;
                }
            } catch (apiError) {
                console.log('⚠️ API 로드 실패, LocalStorage 사용:', apiError.message);
            }
            
            // LocalStorage에서 로드
            this.orderStatuses = this.loadFromLocalStorage('farm_order_statuses');
            
            // 기본 상태 데이터가 없으면 생성
            if (this.orderStatuses.length === 0) {
                this.orderStatuses = [
                    { 
                        id: 'status-1', 
                        name: '주문접수', 
                        color: 'bg-gray-100 text-gray-800', 
                        description: '주문이 접수된 상태',
                        sort_order: 1, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-2', 
                        name: '입금확인', 
                        color: 'bg-blue-100 text-blue-800', 
                        description: '입금이 확인된 상태',
                        sort_order: 2, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-3', 
                        name: '배송준비', 
                        color: 'bg-yellow-100 text-yellow-800', 
                        description: '상품 포장 및 배송 준비 중',
                        sort_order: 3, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-4', 
                        name: '배송시작', 
                        color: 'bg-orange-100 text-orange-800', 
                        description: '택배사로 상품이 인계된 상태',
                        sort_order: 4, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-5', 
                        name: '배송완료', 
                        color: 'bg-green-100 text-green-800', 
                        description: '고객에게 상품이 전달 완료',
                        sort_order: 5, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-6', 
                        name: '주문취소', 
                        color: 'bg-red-100 text-red-800', 
                        description: '주문이 취소된 상태',
                        sort_order: 6, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    },
                    { 
                        id: 'status-7', 
                        name: '환불처리', 
                        color: 'bg-purple-100 text-purple-800', 
                        description: '환불이 처리된 상태',
                        sort_order: 7, 
                        is_active: true,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    }
                ];
                this.saveOrderStatusesToStorage();
            }
            
            console.log('📊 로드된 주문 상태 수:', this.orderStatuses.length);
            console.log('📋 주문 상태 목록:', this.orderStatuses.map(s => s.name));
            
        } catch (error) {
            console.error('❌ 주문 상태 데이터 로드 실패:', error);
            this.orderStatuses = [];
        }
    }

    // 주문 상태 테이블 렌더링
    renderOrderStatusTable() {
        const tbody = document.getElementById('order-status-table-body');
        if (!tbody) return;

        // 정렬된 상태 목록
        const sortedStatuses = [...this.orderStatuses]
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        tbody.innerHTML = sortedStatuses.map(status => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${status.sort_order || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color || 'bg-gray-100 text-gray-800'}">
                        ${status.name}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-8 h-8 rounded-full ${status.color || 'bg-gray-100'} border"></div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    ${status.description || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        status.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${status.is_active !== false ? '사용중' : '비활성'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="window.orderSystem.editOrderStatus('${status.id}')" 
                                class="text-purple-600 hover:text-purple-800 transition-colors" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.orderSystem.deleteOrderStatus('${status.id}')" 
                                class="text-red-600 hover:text-red-800 transition-colors" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 주문 상태별 통계 업데이트
    updateOrderStatusStats() {
        const container = document.getElementById('status-stats-container');
        if (!container) return;

        // 각 상태별 주문 개수 계산
        const statusCounts = {};
        this.orderStatuses.forEach(status => {
            const count = this.orders.filter(order => order.order_status === status.name).length;
            statusCounts[status.name] = count;
        });

        container.innerHTML = this.orderStatuses
            .filter(status => status.is_active !== false)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(status => `
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color || 'bg-gray-100 text-gray-800'} mb-2">
                                ${status.name}
                            </span>
                            <p class="text-2xl font-bold text-gray-900">${statusCounts[status.name] || 0}</p>
                            <p class="text-xs text-gray-500">건의 주문</p>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    // 주문 상태 모달 열기
    openOrderStatusModal(statusId = null) {
        const modal = document.getElementById('order-status-modal');
        const form = document.getElementById('order-status-form');
        const title = document.getElementById('order-status-modal-title');
        
        if (!modal || !form || !title) return;

        // 폼 초기화
        form.reset();
        this.currentEditingOrderStatus = null;

        if (statusId) {
            // 수정 모드
            const status = this.orderStatuses.find(s => s.id === statusId);
            if (status) {
                title.textContent = '주문 상태 수정';
                document.getElementById('order-status-id').value = status.id;
                document.getElementById('order-status-name').value = status.name;
                document.getElementById('order-status-color').value = status.color || 'bg-gray-100 text-gray-800';
                document.getElementById('order-status-description').value = status.description || '';
                document.getElementById('order-status-sort-order').value = status.sort_order || '';
                document.getElementById('order-status-is-active').checked = status.is_active !== false;
                this.currentEditingOrderStatus = status;
            }
        } else {
            // 추가 모드
            title.textContent = '새 주문 상태 추가';
            const nextOrder = Math.max(...this.orderStatuses.map(s => s.sort_order || 0), 0) + 1;
            document.getElementById('order-status-sort-order').value = nextOrder;
            document.getElementById('order-status-is-active').checked = true;
        }

        modal.classList.remove('hidden');
        
        // 포커스 설정
        setTimeout(() => {
            document.getElementById('order-status-name').focus();
        }, 100);
    }

    // 주문 상태 모달 닫기
    closeOrderStatusModal() {
        const modal = document.getElementById('order-status-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditingOrderStatus = null;
    }

    // 주문 상태 저장 처리
    async handleOrderStatusSave() {
        try {
            const form = document.getElementById('order-status-form');
            const formData = new FormData(form);
            
            const statusData = {
                id: formData.get('id') || '',
                name: formData.get('name').trim(),
                color: formData.get('color'),
                description: formData.get('description').trim(),
                sort_order: parseInt(formData.get('sort_order')) || 1,
                is_active: formData.get('is_active') === 'on'
            };

            if (!statusData.name) {
                this.showNotification('상태명을 입력해주세요.', 'error');
                return;
            }

            // 중복 이름 검사 (수정 시 본인 제외)
            const existingStatus = this.orderStatuses.find(s => 
                s.name === statusData.name && s.id !== statusData.id
            );
            if (existingStatus) {
                this.showNotification('이미 존재하는 상태명입니다.', 'error');
                return;
            }

            const savedStatus = await this.saveOrderStatus(statusData);
            this.showNotification('주문 상태가 저장되었습니다.', 'success');
            this.closeOrderStatusModal();
            
            // 페이지 새로고침
            this.renderOrderStatusTable();
            this.updateOrderStatusStats();

        } catch (error) {
            console.error('❌ 주문 상태 저장 실패:', error);
            this.showNotification('주문 상태 저장에 실패했습니다.', 'error');
        }
    }

    // 주문 상태 저장
    async saveOrderStatus(statusData) {
        try {
            console.log('💾 주문 상태 저장 시작:', statusData);
            
            // 데이터 검증
            if (!statusData.name || statusData.name.trim() === '') {
                throw new Error('상태명은 필수입니다.');
            }

            const now = Date.now();
            let savedStatus;

            if (statusData.id && statusData.id !== '') {
                // 기존 상태 수정
                const index = this.orderStatuses.findIndex(s => s.id === statusData.id);
                if (index === -1) {
                    throw new Error('수정할 상태를 찾을 수 없습니다.');
                }

                savedStatus = {
                    ...this.orderStatuses[index],
                    ...statusData,
                    updated_at: now
                };
                this.orderStatuses[index] = savedStatus;
                
                console.log('✅ 주문 상태 수정 완료:', savedStatus.name);
            } else {
                // 새 상태 생성
                savedStatus = {
                    ...statusData,
                    id: 'status-' + Date.now(),
                    created_at: now,
                    updated_at: now
                };
                this.orderStatuses.push(savedStatus);
                
                console.log('✅ 새 주문 상태 생성 완료:', savedStatus.name);
            }

            // API 저장 시도
            try {
                const method = statusData.id && statusData.id !== '' ? 'PUT' : 'POST';
                const url = statusData.id && statusData.id !== '' 
                    ? this.getApiUrl(`farm_order_statuses/${statusData.id}`)
                    : this.getApiUrl('farm_order_statuses');

                const response = await fetch(url, {
                    ...this.getCommonFetchOptions(),
                    method: method,
                    body: JSON.stringify(savedStatus)
                });

                if (!response.ok) {
                    throw new Error('API 저장 실패');
                }
                
                console.log('✅ API에 주문 상태 저장 완료');
            } catch (apiError) {
                console.log('⚠️ API 저장 실패, LocalStorage만 사용:', apiError.message);
            }

            // LocalStorage 저장
            this.saveOrderStatusesToStorage();
            
            return savedStatus;

        } catch (error) {
            console.error('❌ 주문 상태 저장 실패:', error);
            throw error;
        }
    }

    // 주문 상태 수정
    editOrderStatus(statusId) {
        this.openOrderStatusModal(statusId);
    }

    // 주문 상태 삭제
    async deleteOrderStatus(statusId) {
        try {
            const status = this.orderStatuses.find(s => s.id === statusId);
            if (!status) {
                this.showNotification('삭제할 상태를 찾을 수 없습니다.', 'error');
                return;
            }

            // 이 상태를 사용하는 주문이 있는지 확인
            const ordersUsingStatus = this.orders.filter(order => order.order_status === status.name);
            
            if (ordersUsingStatus.length > 0) {
                const confirmMessage = `'${status.name}' 상태를 사용하는 주문이 ${ordersUsingStatus.length}건 있습니다.\n정말 삭제하시겠습니까? (해당 주문들의 상태는 초기화됩니다)`;
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                // 해당 상태를 사용하는 주문들의 상태를 초기화
                ordersUsingStatus.forEach(order => {
                    order.order_status = '주문접수';
                });
                this.saveOrdersToStorage();
            } else {
                if (!confirm(`'${status.name}' 상태를 삭제하시겠습니까?`)) {
                    return;
                }
            }

            console.log('🗑️ 주문 상태 삭제 시작:', statusId);
            
            // API 삭제 시도
            try {
                const response = await fetch(this.getApiUrl(`farm_order_statuses/${statusId}`), {
                    ...this.getCommonFetchOptions(),
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('API 삭제 실패');
                }
                
                console.log('✅ API에서 주문 상태 삭제 완료');
            } catch (apiError) {
                console.log('⚠️ API 삭제 실패, LocalStorage만 처리:', apiError.message);
            }

            // 로컬 배열에서 제거
            const index = this.orderStatuses.findIndex(s => s.id === statusId);
            this.orderStatuses.splice(index, 1);
            
            // LocalStorage 저장
            this.saveOrderStatusesToStorage();
            
            console.log('✅ 주문 상태 삭제 완료:', status.name);
            this.showNotification('주문 상태가 삭제되었습니다.', 'success');
            
            // 페이지 새로고침
            this.renderOrderStatusTable();
            this.updateOrderStatusStats();

        } catch (error) {
            console.error('❌ 주문 상태 삭제 실패:', error);
            this.showNotification('주문 상태 삭제에 실패했습니다.', 'error');
        }
    }

    // LocalStorage에 주문 상태 저장
    saveOrderStatusesToStorage() {
        try {
            localStorage.setItem('farm_order_statuses', JSON.stringify(this.orderStatuses));
            console.log('💾 주문 상태 LocalStorage 저장 완료');
        } catch (error) {
            console.error('❌ 주문 상태 LocalStorage 저장 실패:', error);
        }
    }

    // 알림 메시지 표시
    showNotification(message, type = 'info') {
        console.log(`📢 알림 (${type}):`, message);
        
        // 간단한 alert 사용 (추후 토스트 알림으로 개선 가능)
        if (type === 'error') {
            alert(`❌ 오류: ${message}`);
        } else if (type === 'success') {
            alert(`✅ 성공: ${message}`);
        } else {
            alert(`ℹ️ 알림: ${message}`);
        }
    }

    // 라벨 인쇄 모달 이벤트 리스너 설정
    setupLabelPrintEventListeners() {
        console.log('🔗 라벨 인쇄 모달 이벤트 리스너 설정 시작');
        
        // 모달 닫기 버튼
        const closeLabelPrintModal = document.getElementById('close-label-print-modal');
        if (closeLabelPrintModal) {
            closeLabelPrintModal.addEventListener('click', () => {
                this.closeLabelPrintModal();
            });
        }

        // 취소 버튼
        const cancelLabelPrint = document.getElementById('cancel-label-print');
        if (cancelLabelPrint) {
            cancelLabelPrint.addEventListener('click', () => {
                this.closeLabelPrintModal();
            });
        }

        // 인쇄 진행 버튼
        const proceedLabelPrint = document.getElementById('proceed-label-print');
        if (proceedLabelPrint) {
            proceedLabelPrint.addEventListener('click', () => {
                this.proceedWithLabelPrint();
            });
        }

        // 모달 바깥 클릭으로 닫기
        const labelPrintModal = document.getElementById('label-print-modal');
        if (labelPrintModal) {
            labelPrintModal.addEventListener('click', (e) => {
                if (e.target.id === 'label-print-modal') {
                    this.closeLabelPrintModal();
                }
            });
        }

        // 라벨 타입 선택 옵션들 (강화된 이벤트 바인딩)
        const textLabelOption = document.getElementById('text-label-option');
        if (textLabelOption) {
            textLabelOption.addEventListener('click', () => {
                console.log('🔘 텍스트 라벨 선택됨');
                this.selectLabelType('text');
            });
            
            // 라디오 버튼도 직접 바인딩
            const textRadio = textLabelOption.querySelector('input[type="radio"]');
            if (textRadio) {
                textRadio.addEventListener('change', () => {
                    if (textRadio.checked) {
                        console.log('📻 텍스트 라디오 버튼 선택됨');
                        this.selectLabelType('text');
                    }
                });
            }
        }

        const qrLabelOption = document.getElementById('qr-label-option');
        if (qrLabelOption) {
            qrLabelOption.addEventListener('click', () => {
                console.log('🔘 QR 라벨 선택됨');
                this.selectLabelType('qr');
            });
            
            // 라디오 버튼도 직접 바인딩
            const qrRadio = qrLabelOption.querySelector('input[type="radio"]');
            if (qrRadio) {
                qrRadio.addEventListener('change', () => {
                    if (qrRadio.checked) {
                        console.log('📻 QR 라디오 버튼 선택됨');
                        this.selectLabelType('qr');
                    }
                });
            }
        }

        console.log('✅ 라벨 인쇄 모달 이벤트 리스너 설정 완료');
    }

    // 라벨 인쇄 모달 열기
    openLabelPrintModal() {
        const selectedProducts = this.getSelectedProductsForLabels();
        
        if (selectedProducts.length === 0) {
            alert('❌ 라벨을 인쇄할 상품을 선택하고 수량을 입력해주세요.');
            return;
        }

        const modal = document.getElementById('label-print-modal');
        const countSpan = document.getElementById('modal-selected-count');
        
        if (modal && countSpan) {
            countSpan.textContent = selectedProducts.length;
            this.selectedLabelType = null; // 초기화
            this.resetLabelTypeSelection();
            modal.classList.remove('hidden');
        }
    }

    // 라벨 인쇄 모달 닫기
    closeLabelPrintModal() {
        const modal = document.getElementById('label-print-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        // ❌ 상태 초기화 제거 - 인쇄 진행을 위해 선택값 유지
        // this.selectedLabelType = null;
        console.log('🔄 모달 닫기 - 선택된 라벨 타입 유지:', this.selectedLabelType);
    }

    // 라벨 타입 선택 초기화 (명시적 호출시에만)
    resetLabelTypeSelection() {
        console.log('🧹 라벨 타입 선택 초기화');
        
        // 상태 완전 초기화
        this.selectedLabelType = null;
        localStorage.removeItem('gs_selected_label_type');
        
        // UI 초기화
        const textDot = document.getElementById('text-dot');
        const qrDot = document.getElementById('qr-dot');
        const proceedBtn = document.getElementById('proceed-label-print');
        
        if (textDot) textDot.classList.add('hidden');
        if (qrDot) qrDot.classList.add('hidden');
        if (proceedBtn) proceedBtn.disabled = true;
        
        console.log('✅ 라벨 타입 선택 초기화 완료');
    }

    // 라벨 타입 선택 (전역 함수로 사용)
    selectLabelType(type) {
        console.log('🎯 라벨 타입 설정:', type);
        this.selectedLabelType = type;
        
        // 전역 상태 관리: LocalStorage에 백업 저장
        localStorage.setItem('gs_selected_label_type', type);
        console.log('💾 라벨 타입 LocalStorage 백업 저장:', type);
        
        // 라디오 버튼 업데이트
        const textDot = document.getElementById('text-dot');
        const qrDot = document.getElementById('qr-dot');
        const proceedBtn = document.getElementById('proceed-label-print');
        
        if (type === 'text') {
            console.log('📄 텍스트 라벨 UI 업데이트');
            if (textDot) textDot.classList.remove('hidden');
            if (qrDot) qrDot.classList.add('hidden');
        } else if (type === 'qr') {
            console.log('📱 QR 라벨 UI 업데이트');
            if (qrDot) qrDot.classList.remove('hidden');
            if (textDot) textDot.classList.add('hidden');
        }
        
        // 진행 버튼 활성화
        if (proceedBtn) {
            proceedBtn.disabled = false;
            console.log('🔓 인쇄 진행 버튼 활성화됨');
        }
        
        console.log('✅ 라벨 타입 설정 완료:', this.selectedLabelType);
    }

    // 선택된 라벨 타입으로 인쇄 진행
    proceedWithLabelPrint() {
        try {
            console.log('🏷️ 라벨 인쇄 진행 시작...');
            console.log('📋 선택된 라벨 타입:', this.selectedLabelType);
            
            // 전역 상태 관리: 상태 복구 시스템
            if (!this.selectedLabelType) {
                console.warn('⚠️ 라벨 타입이 설정되지 않음, 복구 시도...');
                
                // 1단계: LocalStorage에서 복구
                const savedType = localStorage.getItem('gs_selected_label_type');
                if (savedType) {
                    this.selectedLabelType = savedType;
                    console.log('💾 LocalStorage에서 라벨 타입 복구:', savedType);
                } else {
                    // 2단계: UI 상태에서 감지
                    const textOption = document.getElementById('text-label-option');
                    const qrOption = document.getElementById('qr-label-option');
                    
                    if (textOption && textOption.querySelector('input[type="radio"]')?.checked) {
                        this.selectedLabelType = 'text';
                        console.log('✅ UI에서 텍스트 라벨 감지');
                    } else if (qrOption && qrOption.querySelector('input[type="radio"]')?.checked) {
                        this.selectedLabelType = 'qr';
                        console.log('✅ UI에서 QR 라벨 감지');
                    } else {
                        // 3단계: 기본값 설정
                        this.selectedLabelType = 'text';
                        console.log('🔧 기본값으로 텍스트 라벨 설정');
                    }
                    
                    // 복구된 값을 LocalStorage에 저장
                    localStorage.setItem('gs_selected_label_type', this.selectedLabelType);
                }
            }
            
            console.log('📋 최종 라벨 타입:', this.selectedLabelType);

            // 모달 닫기
            console.log('🔄 라벨 모달 닫는 중...');
            this.closeLabelPrintModal();

            // 선택된 타입에 따라 인쇄 진행
            if (this.selectedLabelType === 'text') {
                console.log('📄 텍스트 라벨 인쇄 시작...');
                this.openTextLabelPreview();
            } else if (this.selectedLabelType === 'qr') {
                console.log('📱 QR 라벨 인쇄 시작...');
                this.openQRLabelPreview();
            } else {
                console.error('❌ 알 수 없는 라벨 타입:', this.selectedLabelType);
                alert('❌ 알 수 없는 라벨 타입입니다.');
            }
        } catch (error) {
            console.error('❌ 라벨 인쇄 진행 오류:', error);
            alert('라벨 인쇄 진행 중 오류가 발생했습니다.\n\n오류: ' + error.message);
        }
    }

    // 텍스트 라벨 미리보기 열기
    openTextLabelPreview() {
        try {
            console.log('📄 텍스트 라벨 미리보기 열기...');
            
            const selectedProducts = this.getSelectedProductsForLabels();
            console.log('📦 선택된 상품들:', selectedProducts);
            
            if (selectedProducts.length === 0) {
                console.error('❌ 선택된 상품이 없음');
                alert('❌ 라벨을 인쇄할 상품을 선택하고 수량을 입력해주세요.');
                return;
            }

            // 총 라벨 수 계산
            const totalLabels = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
            console.log('🔢 총 라벨 수:', totalLabels);
            
            // A4 가로 방향 22x4 = 88개 기준
            const labelsPerPage = 88;
            if (totalLabels > labelsPerPage) {
                const requiredPages = Math.ceil(totalLabels / labelsPerPage);
                console.log('📄 필요한 용지 수:', requiredPages, '장');
                
                if (!confirm(`⚠️ 총 ${totalLabels}개의 라벨이 선택되었습니다.\n\nA4 용지 1장에는 최대 ${labelsPerPage}개까지 인쇄 가능합니다.\n${requiredPages}장의 용지가 필요합니다.\n\n계속하시겠습니까?`)) {
                    console.log('🚫 사용자가 인쇄를 취소함');
                    return;
                }
            }

            // 텍스트 라벨 생성 및 인쇄
            console.log('🚀 텍스트 라벨 생성 및 인쇄 시작...');
            this.generateAndPrintTextLabels(selectedProducts);
            
        } catch (error) {
            console.error('❌ 텍스트 라벨 미리보기 오류:', error);
            alert('텍스트 라벨 미리보기 중 오류가 발생했습니다.\n\n오류: ' + error.message);
        }
    }

    // 텍스트 라벨 생성 및 인쇄
    generateAndPrintTextLabels(selectedProducts) {
        console.log('📄 텍스트 라벨 생성 시작:', selectedProducts);

        // 팝업 차단 문제 해결: 새 창 대신 현재 페이지에 인쇄 영역 생성
        try {
            // 기존 인쇄 영역이 있으면 제거
            const existingPrintArea = document.getElementById('label-print-area');
            if (existingPrintArea) {
                existingPrintArea.remove();
            }

            // 인쇄 전용 영역 생성
            const printArea = document.createElement('div');
            printArea.id = 'label-print-area';
            printArea.style.display = 'none'; // 화면에는 보이지 않음
            document.body.appendChild(printArea);
            
            console.log('📄 인쇄 영역 생성 완료');
        } catch (error) {
            console.error('❌ 인쇄 영역 생성 실패, 새 창 방식 사용:', error);
            // 폴백: 새 창 방식
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('❌ 팝업이 차단되었습니다.\n\n브라우저 설정에서 이 사이트의 팝업을 허용해주세요.\n\n설정 방법:\n1. 주소창 왼쪽 자물쇠 아이콘 클릭\n2. "팝업 및 리디렉션" → "허용" 선택\n3. 페이지 새로고침 후 다시 시도');
                return;
            }
            this.generatePrintWindowContent(printWindow, selectedProducts);
            return;
        }
        
        // iframe 방식으로 인쇄 처리 (팝업 차단 회피)
        this.generateIframePrintContent(selectedProducts);
    }
    
    // iframe 기반 인쇄 콘텐츠 생성 (팝업 차단 회피)
    generateIframePrintContent(selectedProducts) {
        console.log('🖼️ iframe 기반 인쇄 시작...');
        
        try {
            // 기존 인쇄 iframe 제거
            const existingIframe = document.getElementById('print-iframe');
            if (existingIframe) {
                existingIframe.remove();
            }
            
            // 새 iframe 생성 (화면에 보이지 않음)
            const iframe = document.createElement('iframe');
            iframe.id = 'print-iframe';
            iframe.style.position = 'absolute';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            iframe.style.width = '297mm';
            iframe.style.height = '210mm';
            iframe.style.border = 'none';
            
            document.body.appendChild(iframe);
            console.log('🖼️ 인쇄용 iframe 생성 완료');
            
            // iframe 문서 작성
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // 라벨 HTML 생성
            const labelHTML = this.generateTextLabelHTML(selectedProducts);
            console.log('📄 라벨 HTML 생성 완료, 길이:', labelHTML.length);
            
            // 완전한 HTML 문서 작성 - 디자인 명세 100% 반영
            const fullHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>경산다육식물농장 라벨 인쇄</title>
    <style>
        @page {
            size: A4 portrait;      /* 세로 방향 */
            margin: 23.5mm 1mm;     /* 상하 23.5mm, 좌우 1mm (208x250을 A4에 중앙 배치) */
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Malgun Gothic', 'Arial', sans-serif;
            background: white;
            width: 208mm;        /* 16 x 13mm = 208mm (정확한 라벨 너비) */
            height: 250mm;       /* 5 x 50mm = 250mm (정확한 라벨 높이) */
            overflow: hidden;
            padding: 0;
            margin: 0 auto;      /* 중앙 정렬 */
        }
        
        .label-container {
            width: 208mm;                            /* 16 x 13mm = 208mm */
            height: 250mm;                           /* 5 x 50mm = 250mm */
            display: grid;
            grid-template-columns: repeat(16, 12.5mm); /* 가로 16개, 각 12.5mm = 200mm */
            grid-template-rows: repeat(5, 57.4mm);     /* 세로 5개, 각 57.4mm = 287mm */
            gap: 0;                                  /* 간격 없음 */
            justify-content: start;                  /* 왼쪽 정렬 */
            align-content: start;                    /* 위쪽 정렬 */
            margin: 0;
            padding: 0;
        }
        
        .label {
            width: 12.5mm;       /* 200mm ÷ 16 = 12.5mm (세로 A4 최적화) */
            height: 57.4mm;      /* 287mm ÷ 5 = 57.4mm (세로 긴 라벨) */
            border: 0.5px solid #000;  /* 얇은 실선 테두리 */
            display: flex;
            flex-direction: column;
            justify-content: flex-start;  /* 상단부터 배치 */
            align-items: stretch;          /* 전체 높이 활용 */
            padding: 1mm;
            text-align: center;
            overflow: hidden;
            position: relative;
        }
        
        .product-name {
            font-weight: bold;         /* 굵게 */
            font-size: 20px;          /* 세로 쓰기에 맞는 큰 글자! */
            line-height: 1.0;          /* 세로 쓰기 최적화 줄 간격 */
            margin: 0;
            word-break: keep-all;
            overflow-wrap: break-word;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 100%;
            height: 100%;
            writing-mode: vertical-rl;   /* 세로 쓰기 모드 (오른쪽에서 왼쪽으로) */
            text-orientation: upright;    /* 글자 방향 정립 */
            padding: 2mm 1mm;            /* 세로 쓰기에 맞는 패딩 */
            hyphens: auto;
        }
        
        .product-price {
            font-weight: bold;         /* 굵겎 */
            font-size: 12px;          /* 가격 크기 증가 */
            color: #000;
            white-space: nowrap;
            margin: 0 1mm;             /* 양쪽 1mm 여백 */
            padding: 1mm 0;            /* 상하 여백 증가 */
            text-align: center;
            width: calc(100% - 2mm);   /* 양쪽 1mm 여백 고려 */
            writing-mode: horizontal-tb; /* 가격은 가로 유지 */
            flex-shrink: 0;            /* 가격 영역 고정 */
        }
        
        /* 가독성 중심 동적 폰트 크기 */
        .label.dynamic-font .product-name {
            font-size: clamp(14px, 20px, 26px);  /* 세로 쓰기에 맞는 큰 동적 크기 */
            line-height: 1.0;                     /* 세로 쓰기 최적화 줄 간격 */
            writing-mode: vertical-rl;             /* 동적 폰트도 세로 쓰기 */
            text-orientation: upright;             /* 글자 방향 정립 */
        }
        
        .label.dynamic-font .product-price {
            font-size: clamp(8px, 12px, 16px);   /* 가격도 충분히 크게 */
            line-height: 1.1;                     /* 가격 줄 간격 */
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .label-container {
                break-inside: avoid;
            }
            
            .label {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="label-container">
        ${labelHTML}
    </div>
    
    <script>
        // 페이지 로드 후 상품명 너비에 맞게 폰트 크기 자동 조절
        window.addEventListener('load', function() {
            const labels = document.querySelectorAll('.label');
            
            labels.forEach(label => {
                const nameElement = label.querySelector('.product-name');
                if (nameElement && nameElement.textContent.trim()) {
                    // 기본 동적 폰트 적용
                    label.classList.add('dynamic-font');
                    
                    // 사양서 정확한 라벨 크기 기준 폰트 조정
                    setTimeout(() => {
                        const labelWidth = 13; // 13mm (사양서: 1.3cm)
                        const labelHeight = 50; // 50mm (사양서: 5.0cm)
                        
                        // 텍스트 너비 및 높이 측정
                        const textWidth = nameElement.scrollWidth;
                        const textHeight = nameElement.scrollHeight;
                        const containerWidth = nameElement.offsetWidth;
                        const containerHeight = nameElement.offsetHeight;
                        
                        // 세로 쓰기에 최적화된 폰트 크기 조정
                        const textLength = nameElement.textContent.trim().length;
                        
                        if (textLength > 8) {
                            nameElement.style.fontSize = '16px'; // 긴 이름은 작게
                        } else if (textLength <= 4) {
                            nameElement.style.fontSize = '24px'; // 짧은 이름은 크게
                        } else {
                            nameElement.style.fontSize = '20px'; // 기본 크기
                        }
                    }, 100);
                }
            });
        });
    </script>
</body>
</html>`;
            
            // iframe에 HTML 삽입
            iframeDoc.open();
            iframeDoc.write(fullHTML);
            iframeDoc.close();
            
            console.log('📝 iframe에 HTML 삽입 완료');
            
            // 사용자 안내 및 인쇄 실행
            alert('🏷️ 라벨 인쇄를 시작합니다!\n\n인쇄 대화상자에서:\n✅ 용지 방향: 세로\n✅ 용지 크기: A4\n✅ 여백: 최소\n✅ 라벨 개수: 16x5=80개');
            
            // iframe 로드 완료 대기 후 인쇄
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    console.log('🖨️ iframe에서 인쇄 실행됨');
                    
                    // 인쇄 후 정리
                    setTimeout(() => {
                        iframe.remove();
                        console.log('✅ 인쇄 iframe 정리 완료');
                    }, 3000);
                    
                } catch (printError) {
                    console.error('❌ iframe 인쇄 실패:', printError);
                    // 폴백: 메인 윈도우에서 인쇄
                    window.print();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ iframe 인쇄 생성 실패:', error);
            alert('iframe 인쇄에 실패했습니다.\n\n일반 인쇄 방식으로 전환합니다.');
            
            // 폴백: 기존 방식
            this.generateInPagePrintContentFallback(selectedProducts);
        }
    }
    
    // 폴백: 현재 페이지 인쇄 방식
    generateInPagePrintContentFallback(selectedProducts) {
        console.log('🔄 폴백 인쇄 방식 실행...');
        
        // 임시 인쇄 영역 생성
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.generateTextLabelHTML(selectedProducts);
        tempDiv.id = 'temp-print-content';
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        // 인쇄 스타일 추가
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #temp-print-content, #temp-print-content * { visibility: visible; }
                #temp-print-content { position: absolute; left: 0; top: 0; width: 100%; }
            }
        `;
        document.head.appendChild(style);
        
        // 인쇄 실행
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                tempDiv.remove();
                style.remove();
            }, 2000);
        }, 500);
    }

    // 새 창 방식 폴백 함수 (팝업이 허용된 경우)
    generatePrintWindowContent(printWindow, selectedProducts) {
        // 기존 새 창 방식 코드는 여기에 유지
        const printContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>텍스트 라벨 인쇄</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
            padding: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Malgun Gothic', sans-serif;
            background: white;
            padding: 0;
        }
        
        .label-container {
            width: 100vw;
            height: 100vh;
            display: grid;
            grid-template-columns: repeat(22, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 0;
        }
        
        .label {
            width: 1.3cm;
            height: 5.0cm;
            border: 1px solid black;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2px;
            text-align: center;
            page-break-inside: avoid;
        }
        
        .product-name {
            font-weight: bold;
            font-size: 8px;
            line-height: 1.1;
            margin-bottom: 2px;
            word-break: keep-all;
            overflow-wrap: break-word;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .product-price {
            font-weight: bold;
            font-size: 6px;
            color: #333;
            white-space: nowrap;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .label-container {
                width: 297mm;
                height: 210mm;
                display: grid;
                grid-template-columns: repeat(22, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: 0;
            }
            
            .label {
                width: 13.5mm;
                height: 52.5mm;
                border: 0.5px solid black;
            }
        }
        
        /* 동적 폰트 크기 조절 */
        .label.long-name .product-name {
            font-size: 6px;
        }
        
        .label.very-long-name .product-name {
            font-size: 5px;
        }
    </style>
</head>
<body>
    <div class="label-container">
        ${this.generateTextLabelHTML(selectedProducts)}
    </div>
    
    <script>
        // 페이지 로드 후 자동 인쇄
        window.onload = function() {
            // 글자 크기 자동 조절
            adjustTextSize();
            
            setTimeout(() => {
                window.print();
            }, 500);
        };
        
        function adjustTextSize() {
            const labels = document.querySelectorAll('.label');
            labels.forEach(label => {
                const nameElement = label.querySelector('.product-name');
                if (nameElement) {
                    const textLength = nameElement.textContent.length;
                    if (textLength > 15) {
                        label.classList.add('very-long-name');
                    } else if (textLength > 10) {
                        label.classList.add('long-name');
                    }
                }
            });
        }
    </script>
</body>
</html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // 텍스트 라벨 HTML 생성
    // 텍스트 라벨 HTML 생성 - 디자인 명세 100% 반영
    generateTextLabelHTML(selectedProducts) {
        let labelHTML = '';
        let labelCount = 0;
        const maxLabels = 80; // 가로 16 x 세로 5 = 80개

        console.log('📊 라벨 생성 시작:', selectedProducts.length, '개 상품');

        for (const item of selectedProducts) {
            for (let i = 0; i < item.quantity && labelCount < maxLabels; i++) {
                const productName = item.product.name || '상품명 없음';
                const price = item.product.price || 0;
                const formattedPrice = new Intl.NumberFormat('ko-KR').format(price);
                
                // 상품명 길이에 따른 클래스 미리 계산
                const nameLength = productName.length;
                let nameClass = '';
                if (nameLength <= 6) {
                    nameClass = 'short-name';
                } else if (nameLength <= 10) {
                    nameClass = 'medium-name';
                } else if (nameLength <= 15) {
                    nameClass = 'long-name';
                } else {
                    nameClass = 'very-long-name';
                }
                
                labelHTML += `
                    <div class="label ${nameClass}">
                        <div class="product-name">${productName}</div>
                        <div class="product-price">${formattedPrice}</div>
                    </div>
                `;
                labelCount++;
            }
        }

        // 남은 공간을 빈 라벨로 채우기 (빽빽하게)
        while (labelCount < maxLabels) {
            labelHTML += '<div class="label"><div class="product-name"></div><div class="product-price"></div></div>';
            labelCount++;
        }

        console.log('✅ 라벨 HTML 생성 완료:', labelCount, '개 (22x4 그리드)');
        return labelHTML;
    }

    // 디버깅용 함수들 설정
    setupDebugFunctions() {
        console.log('🔧 디버깅 함수들을 전역에 등록합니다...');
        
        // 라벨 인쇄 테스트
        window.testLabelPrint = () => {
            console.log('🏷️ 라벨 인쇄 테스트 시작...');
            console.log('📦 상품 수:', this.products.length);
            console.log('📋 체크된 상품:', document.querySelectorAll('.product-checkbox:checked').length);
            this.updateBulkPrintCount();
        };
        
        // 수량 계산 테스트
        window.testUpdateBulkPrint = () => {
            console.log('📊 수량 계산 테스트...');
            this.updateBulkPrintCount();
        };
        
        // 라벨 인쇄 시뮬레이션
        window.simulateLabelPrint = () => {
            console.log('🎭 라벨 인쇄 시뮬레이션...');
            this.handleLabelPrintingFromProductList();
        };
        
        // DOM 요소 확인
        window.checkLabelElements = () => {
            console.log('🔍 라벨 인쇄 관련 DOM 요소 확인:');
            console.log('- 라벨 인쇄 버튼:', document.getElementById('print-labels-btn'));
            console.log('- 체크박스들:', document.querySelectorAll('.product-checkbox'));
            console.log('- 수량 입력들:', document.querySelectorAll('.quantity-input'));
            console.log('- 선택 카운트:', document.getElementById('selected-count'));
        };
        
        console.log('✅ 디버깅 함수 등록 완료:');
        console.log('   - testLabelPrint()');
        console.log('   - testUpdateBulkPrint()');
        console.log('   - simulateLabelPrint()'); 
        console.log('   - checkLabelElements()');
    }

    // ==================== 주문 상태 관리 헬퍼 함수들 ====================
    
    // 표준 주문 상태 목록 반환
    getStandardOrderStatuses() {
        return this.standardOrderStatuses;
    }
    
    // 주문 상태 드롭다운 HTML 생성
    generateOrderStatusOptions(selectedStatus = null) {
        return this.standardOrderStatuses.map(status => 
            `<option value="${status.value}" ${selectedStatus === status.value ? 'selected' : ''}>${status.label}</option>`
        ).join('');
    }
    
    // 주문 상태 정보 가져오기
    getOrderStatusInfo(statusValue) {
        return this.standardOrderStatuses.find(status => status.value === statusValue) || {
            value: statusValue,
            label: statusValue,
            color: '#6B7280',
            description: '알 수 없는 상태'
        };
    }
    
    // 주문 상태 색상 가져오기
    getOrderStatusColor(statusValue) {
        const statusInfo = this.getOrderStatusInfo(statusValue);
        return statusInfo.color;
    }
    
    // 상태 드롭다운 버튼들 생성
    generateStatusDropdownButtons(orderId) {
        return this.standardOrderStatuses.map((status, index) => {
            // 색상 매핑
            const colorClass = this.getStatusColorClass(status.value);
            
            // 취소/환불 상태 전에 구분선 추가
            const separator = (status.value === '주문취소' && index > 0) ? '<hr class="my-1">' : '';
            
            return `${separator}<button onclick="orderSystem.updateOrderStatusInline('${orderId}', '${status.value}')" 
                        class="block w-full text-left px-3 py-2 text-xs ${colorClass} transition-colors">
                        ${status.label}
                    </button>`;
        }).join('');
    }
    
    // 상태별 색상 클래스 반환
    getStatusColorClass(statusValue) {
        const colorMap = {
            '주문접수': 'text-gray-700 hover:bg-gray-100',
            '입금확인': 'text-green-700 hover:bg-green-50',
            '배송준비': 'text-orange-700 hover:bg-orange-50',
            '배송시작': 'text-purple-700 hover:bg-purple-50',
            '배송완료': 'text-emerald-700 hover:bg-emerald-50',
            '주문취소': 'text-gray-700 hover:bg-gray-100',
            '환불처리': 'text-red-700 hover:bg-red-50'
        };
        return colorMap[statusValue] || 'text-gray-700 hover:bg-gray-100';
    }

    // 🧹 데모 데이터 완전 제거 (초기화)
    clearAllDemoData() {
        console.log('🧹 모든 데모 데이터 제거 시작...');
        
        // LocalStorage의 모든 데이터 제거
        const keysToRemove = ['orders', 'farm_customers', 'waitlist'];
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`✅ ${key} 데이터 제거 완료`);
        });
        
        // 메모리의 데이터도 초기화
        this.orders = [];
        this.customers = [];
        this.farm_waitlist = [];
        
        // UI 새로고침
        this.renderOrders();
        if (typeof this.renderCustomers === 'function') {
            this.renderCustomers();
        }
        if (typeof this.renderWaitlist === 'function') {
            this.renderWaitlist();
        }
        
        this.showToast('🧹 모든 데모 데이터가 제거되었습니다!', 'success');
        console.log('🎉 데모 데이터 제거 완료 - 깨끗한 시스템으로 초기화됨');
    }

    // 🧪 테스트용 완료 주문 생성 (대시보드 테스트용)
    createTestCompletedOrder() {
        console.log('🧪 테스트용 완료 주문 생성 시작...');
        
        const testOrder = {
            id: 'test_' + Date.now(),
            customer_id: 'test_customer',
            order_number: 'TEST' + new Date().getFullYear() + String(Date.now()).slice(-6),
            customer_name: '테스트 고객',
            customer_phone: '010-0000-0000',
            order_items: JSON.stringify([
                { product_name: 'White Platter 중품', quantity: 2, price: 25000 },
                { product_name: 'White Platter 소품', quantity: 1, price: 15000 }
            ]),
            total_amount: 65000,
            order_status: '배송완료',
            order_date: new Date().toISOString().split('T')[0],
            order_source: '테스트',
            shipping_address: '테스트 주소',
            memo: '대시보드 테스트용 주문',
            created_at: new Date().toISOString()
        };
        
        // 주문 데이터에 추가
        this.orders.push(testOrder);
        this.saveToLocalStorage('orders', this.orders);
        
        // 대시보드 위젯 업데이트
        this.renderWeeklyBestsellers();
        this.renderVIPCustomerRanking();
        this.renderNewReturnCustomerAnalysis();
        
        this.showToast('🧪 테스트 완료 주문이 생성되었습니다!', 'success');
        console.log('✅ 테스트 주문 생성 완료:', testOrder);
    }

    // 🧹 잘못된 주문 데이터 완전 정리
    cleanupCorruptedOrders() {
        console.log('🧹 잘못된 주문 데이터 정리 시작...');
        
        const originalCount = this.orders.length;
        console.log('📊 정리 전 주문 수:', originalCount);
        
        // 유효한 데이터만 남기기
        this.orders = this.orders.filter(order => {
            const isValid = order && 
                           order.id && 
                           order.customer_name && 
                           order.customer_name !== 'undefined' && 
                           order.customer_name !== 'NaN' &&
                           order.customer_name.trim() !== '' &&
                           !isNaN(order.total_amount) &&
                           order.total_amount !== null &&
                           order.total_amount !== undefined;
            
            if (!isValid) {
                console.log('🗑️ 잘못된 데이터 제거:', order);
            }
            
            return isValid;
        });
        
        const cleanedCount = this.orders.length;
        const removedCount = originalCount - cleanedCount;
        
        // 정리된 데이터 저장
        this.saveToLocalStorage('orders', this.orders);
        
        // UI 업데이트
        this.renderOrdersTable();
        
        console.log('📊 정리 결과:', {
            정리전: originalCount,
            정리후: cleanedCount,
            제거됨: removedCount
        });
        
        this.showToast(`🧹 ${removedCount}개의 잘못된 주문 데이터가 정리되었습니다!`, 'success');
        
        return {
            before: originalCount,
            after: cleanedCount,
            removed: removedCount
        };
    }

    // ==================== 프린트 및 SMS 상태 관리 ====================
    
    // 주문서 출력 상태 업데이트 (기존 기능 활용)
    async updatePrintStatus(orderId, status = 'completed') {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.print_status = status;
            order.printed_at = new Date().toISOString();
            await this.saveToStorage('orders', this.orders);
            this.renderOrdersTable();
            console.log(`✅ 주문 ${orderId} 프린트 상태 업데이트: ${status}`);
        }
    }
    
    // SMS 발송 상태 업데이트 (기존 기능 활용)
    async updateSmsStatus(orderId, status = 'sent') {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.sms_status = status;
            order.sms_sent_at = new Date().toISOString();
            await this.saveToStorage('orders', this.orders);
            this.renderOrdersTable();
            console.log(`✅ 주문 ${orderId} SMS 상태 업데이트: ${status}`);
        }
    }

    // 솔라피 HMAC 인증 헤더 생성
    generateSolapiAuthHeader(apiKey, apiSecret, date, salt) {
        if (typeof CryptoJS === 'undefined') {
            console.warn('⚠️ CryptoJS가 로드되지 않았습니다. SMS 기능을 사용할 수 없습니다.');
            throw new Error('CryptoJS 라이브러리가 필요합니다.');
        }
        
        const message = date + salt;
        const signature = CryptoJS.HmacSHA256(message, apiSecret).toString(CryptoJS.enc.Base64);
        return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
    }

    // 솔라피 SMS 발송 함수
    async sendSmsViaSolapi(phoneNumber, message, orderId = null) {
        try {
            // 솔라피 API 설정
            const solapiConfig = {
                apiKey: 'NCS4ZXQ1JWMUPQ3W',
                apiSecret: 'MLER1HFO30FJGXMZLEN9P82TZL6ZWEM2',
                from: '01097456245' // 실제 등록된 발신번호
            };

            // 전화번호 정규화 (하이픈 제거)
            const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
            
            // 솔라피 API 요청 데이터 (올바른 형식)
            const smsData = {
                message: {
                    to: normalizedPhone,
                    from: solapiConfig.from,
                    text: message
                }
            };

            console.log('📱 솔라피 SMS 발송 시도:', {
                to: normalizedPhone,
                message: message,
                orderId: orderId
            });

            // HMAC 인증 헤더 생성 (솔라피 API v4 올바른 방식)
            const date = new Date().toISOString();
            const salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
            
            // 솔라피 API v4의 올바른 서명 생성 방식 (Hex 형식 필요)
            const messageToSign = `${date}${salt}`;
            const signature = CryptoJS.HmacSHA256(messageToSign, solapiConfig.apiSecret).toString(CryptoJS.enc.Hex);
            
            const authHeader = `HMAC-SHA256 apiKey=${solapiConfig.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
            
            console.log('🔑 인증 헤더 생성 완료');
            console.log('📝 서명 생성 정보:', {
                date: date,
                salt: salt,
                messageToSign: messageToSign,
                signature: signature,
                apiKey: solapiConfig.apiKey,
                apiSecret: solapiConfig.apiSecret.substring(0, 8) + '...' // 보안을 위해 일부만 표시
            });

            // 솔라피 API 호출
            const response = await fetch('https://api.solapi.com/messages/v4/send', {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(smsData)
            });

            console.log('📡 솔라피 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ 솔라피 API 오류 응답:', errorText);
                console.error('📤 요청 데이터:', JSON.stringify(smsData, null, 2));
                console.error('🔑 인증 헤더:', authHeader);
                throw new Error(`SMS 발송 실패: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ 솔라피 SMS 발송 성공:', result);

            // 주문 ID가 있으면 SMS 상태 업데이트
            if (orderId) {
                this.updateSmsStatus(orderId, 'sent');
            }

            return { success: true, message: 'SMS가 성공적으로 발송되었습니다.' };

        } catch (error) {
            console.error('❌ SMS 발송 실패:', error);
            
            // 주문 ID가 있으면 SMS 상태 업데이트
            if (orderId) {
                this.updateSmsStatus(orderId, 'failed');
            }

            return { success: false, message: `SMS 발송 실패: ${error.message}` };
        }
    }

    // 주문 상태별 SMS 메시지 생성
    generateSmsMessage(order, newStatus) {
        const customerName = order.customer_name;
        const orderNumber = order.order_number;
        
        const statusMessages = {
            '주문접수': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 접수되었습니다. 곧 연락드리겠습니다.`,
            '준비중': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 준비중입니다.`,
            '배송준비': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 배송준비중입니다.`,
            '배송중': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 배송중입니다.`,
            '배송완료': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 배송완료되었습니다.`,
            '주문취소': `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}이 취소되었습니다.`
        };

        return statusMessages[newStatus] || `안녕하세요 ${customerName}님! 주문번호 ${orderNumber}의 상태가 ${newStatus}로 변경되었습니다.`;
    }

    // SMS 발송 기록 조회 및 관리
    getSmsHistory() {
        const smsHistory = [];
        const now = Date.now();
        
        // localStorage에서 SMS 발송 기록 수집
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sms_sent_')) {
                const smsKey = key.replace('sms_sent_', '');
                const [orderId, status] = smsKey.split('_');
                const timestamp = parseInt(localStorage.getItem(key));
                const timeDiff = now - timestamp;
                
                smsHistory.push({
                    orderId: orderId,
                    status: status,
                    timestamp: timestamp,
                    timeAgo: this.formatTimeAgo(timeDiff),
                    isRecent: timeDiff < 300000 // 5분 이내
                });
            }
        }
        
        return smsHistory.sort((a, b) => b.timestamp - a.timestamp);
    }

    // 시간 차이를 읽기 쉬운 형태로 변환
    formatTimeAgo(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }

    // SMS 발송 기록 초기화 (관리자용)
    clearSmsHistory() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sms_sent_') || key.startsWith('manual_sms_'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 SMS 발송 기록 초기화 완료:', keysToRemove.length, '개 항목 삭제');
        return keysToRemove.length;
    }

    // 주문 상태 변경 시 자동 SMS 발송
    async sendStatusChangeSms(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order || !order.customer_phone) {
            console.log('⚠️ SMS 발송 불가: 고객 정보 또는 전화번호 없음');
            return;
        }

        // 중복 발송 방지: 같은 상태에 대해 이미 SMS가 발송되었는지 확인
        const smsKey = `${orderId}_${newStatus}`;
        const lastSmsTime = localStorage.getItem(`sms_sent_${smsKey}`);
        const now = Date.now();
        
        // 5분 이내에 같은 상태로 SMS가 발송되었다면 중복 발송 방지
        if (lastSmsTime && (now - parseInt(lastSmsTime)) < 300000) { // 5분 = 300,000ms
            console.log('🛡️ 중복 SMS 발송 방지:', smsKey, '마지막 발송:', new Date(parseInt(lastSmsTime)));
            return;
        }

        console.log('📱 상태 변경 SMS 발송:', orderId, newStatus);
        const message = this.generateSmsMessage(order, newStatus);
        const result = await this.sendSmsViaSolapi(order.customer_phone, message, orderId);
        
        // SMS 발송 시간 기록 (중복 방지용)
        if (result.success) {
            localStorage.setItem(`sms_sent_${smsKey}`, now.toString());
            console.log('✅ SMS 발송 시간 기록:', smsKey, new Date(now));
        }
        
        // 사용자에게 결과 알림
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded shadow-lg z-50 ${
            result.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${result.success ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${result.message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3초 후 알림 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        return result;
    }

    // 긴급 데이터 복구 함수
    emergencyDataRecovery() {
        console.log('🚨 긴급 데이터 복구 시작...');
        
        try {
            // LocalStorage에서 모든 데이터 강제 로드
            const orders = this.loadFromLocalStorage('orders') || [];
            const customers = this.loadFromLocalStorage('farm_customers') || [];
            const products = this.loadFromLocalStorage('products') || [];
            const waitlist = this.loadFromLocalStorage('waitlist') || [];
            const categories = this.loadFromLocalStorage('categories') || [];
            
            // 메모리에 강제 로드
            this.orders = orders;
            this.customers = customers;
            this.products = products;
            this.waitlist = waitlist;
            this.categories = categories;
            
            // UI 새로고침
            this.renderOrdersTable();
            this.renderCustomersTable();
            this.renderProductsTable();
            this.renderWaitlistTable();
            
            // 이벤트 리스너 재등록
            this.reinitializeEventListeners();
            
            // 성공 알림
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>긴급 데이터 복구 완료!</span>
                </div>
                <div class="text-sm mt-1">주문 ${orders.length}건, 고객 ${customers.length}명 복구됨</div>
            `;
            
            document.body.appendChild(notification);
            
            // 5초 후 알림 제거
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
            console.log('✅ 긴급 데이터 복구 완료:', {
                orders: orders.length,
                farm_customers: customers.length,
                products: products.length,
                waitlist: waitlist.length,
                categories: categories.length
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ 긴급 데이터 복구 실패:', error);
            
            // 실패 알림
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>데이터 복구 실패</span>
                </div>
                <div class="text-sm mt-1">데이터 복구 도구를 사용해주세요</div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
            return false;
        }
    }

    // 이벤트 리스너 재등록 함수
    reinitializeEventListeners() {
        console.log('🔄 이벤트 리스너 재등록 시작...');
        
        try {
            // 기존 이벤트 리스너 제거
            this.removeAllEventListeners();
            
            // 새로운 이벤트 리스너 등록
            this.setupEventListeners();
            
            // DOM 요소 존재 확인 후 이벤트 리스너 등록
            setTimeout(() => {
                this.setupCustomerAutocomplete();
                // 주문 폼 검증 함수는 존재하지 않으므로 제거
                // this.setupWaitlistFormValidation(); // 함수가 존재하지 않음 - 제거
            }, 100);
            
            // 카카오 주소 검색 이벤트 리스너 재등록
            this.setupKakaoAddressSearch();
            
            // SMS 솔라피 발송 버튼 이벤트 리스너 재등록
            const sendSmsButton = document.getElementById('send-sms');
            if (sendSmsButton) {
                sendSmsButton.addEventListener('click', () => {
                    this.sendSmsFromModal();
                });
                console.log('✅ SMS 솔라피 발송 버튼 이벤트 리스너 재등록 완료');
            }
            
            console.log('✅ 이벤트 리스너 재등록 완료');
            
        } catch (error) {
            console.error('❌ 이벤트 리스너 재등록 실패:', error);
        }
    }

    // 모든 이벤트 리스너 제거
    removeAllEventListeners() {
        console.log('🗑️ 기존 이벤트 리스너 제거 중...');
        
        // 클론된 요소로 이벤트 리스너 제거
        const elements = [
            'customer-form-address-search',
            'order-form',
            'customer-name',
            'customer-phone',
            'order-status',
            'add-channel-btn',
            'save-channel',
            'cancel-channel',
            'close-channel-modal',
            'add-shipping-btn',
            'save-shipping-settings',
            'add-grade-btn',
            'save-grade-settings'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
    }

    // 카카오 주소 검색 이벤트 리스너 설정 (이벤트 위임 방식으로 변경)
    setupKakaoAddressSearch() {
        // 이벤트 위임을 사용하므로 별도 등록 불필요
        console.log('✅ 카카오 주소 검색 이벤트 리스너는 이미 이벤트 위임으로 등록됨');
    }
    
    // 고객 상세 정보 모달 열기
    openCustomerDetails(customerName) {
        console.log('🔍 고객 상세 정보 열기:', customerName);
        
        // 해당 고객의 모든 주문 찾기
        const customerOrders = this.orders.filter(order => order.customer_name === customerName);
        
        if (customerOrders.length === 0) {
            this.showToast('❌ 해당 고객의 주문 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 고객 정보 요약
        const firstOrder = customerOrders[0];
        const totalAmount = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const orderCount = customerOrders.length;
        
        // 모달 콘텐츠 생성
        const modalContent = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="bg-green-600 text-white px-6 py-4">
                    <h3 class="text-lg font-semibold">👤 ${customerName} 고객 상세 정보</h3>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <!-- 고객 요약 정보 -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${orderCount}회</div>
                            <div class="text-sm text-gray-600">총 주문 횟수</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${new Intl.NumberFormat('ko-KR').format(totalAmount)}원</div>
                            <div class="text-sm text-gray-600">총 구매 금액</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">${Math.round(totalAmount / orderCount).toLocaleString()}원</div>
                            <div class="text-sm text-gray-600">주문당 평균 금액</div>
                        </div>
                    </div>
                    
                    <!-- 기본 정보 -->
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-3">📋 기본 정보</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span class="text-gray-600">연락처:</span>
                                <span class="font-medium ml-2">${firstOrder.customer_phone || '미등록'}</span>
                            </div>
                            <div>
                                <span class="text-gray-600">주소:</span>
                                <span class="font-medium ml-2">${firstOrder.customer_address || '미등록'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 주문 내역 -->
                    <div>
                        <h4 class="text-lg font-semibold mb-3">📦 주문 내역 (${orderCount}건)</h4>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            ${customerOrders.map(order => {
                                const orderDate = new Date(order.order_date).toLocaleDateString('ko-KR');
                                const statusColor = this.getStatusColor(order.order_status);
                                return `
                                    <div class="border rounded-lg p-4 hover:bg-gray-50">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <div class="font-medium">${order.order_number || order.id}</div>
                                                <div class="text-sm text-gray-600">${orderDate}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-bold">${new Intl.NumberFormat('ko-KR').format(order.total_amount || 0)}원</div>
                                                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                                                    ${order.order_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 px-6 py-4 flex justify-end">
                    <button onclick="orderSystem.closeCustomerDetailsModal()" 
                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        // 모달 표시
        this.showModal(modalContent, 'customer-details-modal');
    }
    
    // 고객 상세 정보 모달 닫기
    closeCustomerDetailsModal() {
        const modal = document.getElementById('customer-details-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // 테이블 정렬 기능
    sortOrders(column) {
        console.log('📊 테이블 정렬:', column);
        
        // 현재 정렬 상태 확인
        if (!this.currentSort) {
            this.currentSort = { column: null, direction: 'asc' };
        }
        
        // 같은 컬럼 클릭시 방향 변경, 다른 컬럼 클릭시 오름차순으로 시작
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        
        // 정렬 실행
        this.orders.sort((a, b) => {
            let aValue, bValue;
            
            switch (column) {
                case 'order_date':
                    aValue = new Date(a.order_date);
                    bValue = new Date(b.order_date);
                    break;
                case 'order_number':
                    aValue = a.order_number || a.id;
                    bValue = b.order_number || b.id;
                    break;
                case 'customer_name':
                    aValue = a.customer_name || '';
                    bValue = b.customer_name || '';
                    break;
                case 'order_status':
                    aValue = a.order_status || '';
                    bValue = b.order_status || '';
                    break;
                case 'order_items':
                    // 첫 번째 상품명으로 정렬
                    const aItems = Array.isArray(a.order_items) ? a.order_items : JSON.parse(a.order_items || '[]');
                    const bItems = Array.isArray(b.order_items) ? b.order_items : JSON.parse(b.order_items || '[]');
                    aValue = aItems.length > 0 ? (aItems[0].name || aItems[0].product_name || '') : '';
                    bValue = bItems.length > 0 ? (bItems[0].name || bItems[0].product_name || '') : '';
                    break;
                default:
                    aValue = a[column] || '';
                    bValue = b[column] || '';
            }
            
            // 정렬 방향에 따른 비교
            let comparison = 0;
            if (aValue < bValue) {
                comparison = -1;
            } else if (aValue > bValue) {
                comparison = 1;
            }
            
            return this.currentSort.direction === 'asc' ? comparison : -comparison;
        });
        
        // 테이블 다시 렌더링
        this.renderOrdersTable();
        
        // 정렬 상태 표시 업데이트
        this.updateSortIndicators(column, this.currentSort.direction);
        
        this.showToast(`📊 ${column} 기준으로 ${this.currentSort.direction === 'asc' ? '오름차순' : '내림차순'} 정렬되었습니다.`);
    }
    
    // 정렬 지시자 업데이트
    updateSortIndicators(activeColumn, direction) {
        // 모든 정렬 아이콘을 기본 상태로 리셋
        document.querySelectorAll('th .fa-sort, th .fa-sort-up, th .fa-sort-down').forEach(icon => {
            icon.className = 'fas fa-sort text-gray-400 ml-1';
        });
        
        // 활성 컬럼의 아이콘 업데이트
        const activeHeader = document.querySelector(`th[onclick*="${activeColumn}"] i`);
        if (activeHeader) {
            activeHeader.className = direction === 'asc' ? 
                'fas fa-sort-up text-blue-600 ml-1' : 
                'fas fa-sort-down text-blue-600 ml-1';
        }
    }
    
    // 범용 모달 표시 함수
    showModal(content, modalId = 'dynamic-modal') {
        // 기존 모달 제거
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 생성
        const modalHTML = `
            <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                ${content}
            </div>
        `;
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 모달 외부 클릭시 닫기
        document.getElementById(modalId).addEventListener('click', (e) => {
            if (e.target.id === modalId) {
                document.getElementById(modalId).remove();
            }
        });
        
        // ESC 키로 닫기
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.remove();
                }
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // 상품 목록 로드 함수 (긴급 복원)
    async loadProducts() {
        console.log('📦 상품 목록 로드 시작...');
        
        try {
            // API 또는 로컬 스토리지에서 상품 데이터 로드
            let products = [];
            
            // API 시도
            try {
                const response = await fetch(this.getApiUrl('products'));
                if (response.ok) {
                    const data = await response.json();
                    products = data.data || [];
                    console.log(`✅ API에서 상품 ${products.length}개 로드`);
                } else {
                    throw new Error('API 응답 오류');
                }
            } catch (apiError) {
                console.warn('API 실패, 로컬 스토리지 사용:', apiError.message);
                
                // 로컬 스토리지에서 로드
                const stored = localStorage.getItem('products');
                if (stored) {
                    products = JSON.parse(stored);
                    console.log(`✅ 로컬에서 상품 ${products.length}개 로드`);
                }
            }
            
            // 상품 배열에 저장
            this.products = products || [];
            
            // UI 업데이트 (안전하게)
            if (typeof this.renderProducts === 'function') {
                this.renderProducts();
            } else {
                console.log('renderProducts 함수 없음, UI 업데이트 건너뜀');
            }
            
            console.log('✅ 상품 목록 로드 완료');
            return this.products;
            
        } catch (error) {
            console.error('❌ 상품 로드 실패:', error);
            this.products = [];
            return [];
        }
    }


}

// 시스템 초기화 및 전역 변수 등록 (안전 장치 추가)
try {
    console.log('🚀 OrderManagementSystem 초기화 시작...');
    const orderSystem = new OrderManagementSystem();
    window.orderSystem = orderSystem;
    console.log('✅ OrderManagementSystem 초기화 성공!');
    
    // Supabase 초기화
    if (window.SupabaseConfig) {
        const supabaseInitialized = window.SupabaseConfig.initialize();
        if (supabaseInitialized) {
            console.log('✅ Supabase 초기화 성공!');
            
            // 연결 상태 확인
            window.SupabaseConfig.checkConnection().then(result => {
                if (result.connected) {
                    console.log('🌐 Supabase 연결 성공!');
                    
                    // Realtime 구독 설정
                    setTimeout(() => {
                        setupRealtime();
                        initialSync();
                    }, 2000);
                } else {
                    console.warn('⚠️ Supabase 연결 실패:', result.error);
                }
            });
        } else {
            console.log('🌱 로컬 모드로 작동 중 - Supabase 비활성화됨');
        }
    } else {
        console.log('🌱 로컬 모드로 작동 중 - Supabase 설정 모듈 비활성화됨');
    }
    
    // 핵심 함수들이 제대로 로드되었는지 확인
    const essentialFunctions = ['openProductModal', 'saveProduct', 'loadProducts'];
    essentialFunctions.forEach(funcName => {
        if (typeof orderSystem[funcName] === 'function') {
            console.log(`✅ ${funcName} 함수 로드 확인`);
        } else {
            console.warn(`⚠️ ${funcName} 함수 누락`);
        }
    });
    
    // 페이지 로드 완료 후 대시보드 자동 활성화
    setTimeout(() => {
        console.log('🚀 대시보드 자동 활성화 시작...');
        orderSystem.switchTab('tab-dashboard');
    }, 1000);
    
} catch (initError) {
    console.error('❌ 시스템 초기화 실패:', initError);
    
    // 최소한의 백업 시스템 제공
    window.orderSystem = {
        openProductModal: function() {
            alert('⚠️ 시스템 로딩 문제가 있습니다.\n\n해결 방법:\n1. 페이지 새로고침 (F5)\n2. 브라우저 캐시 삭제\n\n계속 문제가 있으면 개발자에게 문의하세요.');
        },
        saveProduct: function() {
            alert('시스템이 완전히 로드되지 않았습니다. 페이지를 새로고침해주세요.');
            return Promise.reject(new Error('시스템 로딩 실패'));
        },
        loadProducts: function() {
            console.warn('백업 시스템 - 제한된 기능');
            return Promise.resolve([]);
        }
    };
    
    // 사용자에게 알림
    setTimeout(() => {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 9999;
            font-weight: bold;
        `;
        errorDiv.innerHTML = `
            ⚠️ 시스템 로딩 문제 발생 - 새로고침(F5) 권장
            <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: red; border: none; border-radius: 3px;">새로고침</button>
        `;
        document.body.appendChild(errorDiv);
        
        // 10초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }, 100);
}

// 🧹 데모 데이터 제거를 위한 전역 함수
window.clearDemoData = function() {
    if (confirm('⚠️ 모든 데모 데이터(주문, 고객, 대기자)를 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
        orderSystem.clearAllDemoData();
    }
};

// 🧪 테스트 완료 주문 생성을 위한 전역 함수
window.createTestOrder = function() {
    orderSystem.createTestCompletedOrder();
};

// 🔧 데이터 복구를 위한 전역 함수
window.checkDataStatus = function() {
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log('📊 데이터 현황:');
    console.log('- 현재 메모리 주문 수:', orderSystem.orders.length);
    console.log('- LocalStorage 주문 수:', localOrders.length);
    console.log('- LocalStorage 주문 데이터:', localOrders);
    return {
        memoryOrders: orderSystem.orders.length,
        localOrders: localOrders.length,
        localData: localOrders
    };
};

// 🚀 LocalStorage 데이터 강제 복구
window.recoverLocalData = function() {
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (localOrders.length > 0) {
        orderSystem.orders = localOrders;
        orderSystem.renderOrdersTable();
        orderSystem.showToast(`🚀 ${localOrders.length}개 주문 데이터가 복구되었습니다!`, 'success');
        console.log('✅ 데이터 복구 완료:', localOrders.length, '건');
    } else {
        console.log('⚠️ 복구할 LocalStorage 데이터가 없습니다');
    }
};

// 🧹 잘못된 데이터 정리를 위한 전역 함수
window.cleanupBadData = function() {
    const result = orderSystem.cleanupCorruptedOrders();
    console.log('🧹 데이터 정리 완료:', result);
    return result;
};

// 🔧 상태 변경 테스트를 위한 전역 함수
window.testStatusChange = function(orderId, newStatus) {
    if (!orderId || !newStatus) {
        console.log('📋 사용법: testStatusChange("주문ID", "새상태")');
        console.log('💡 예시: testStatusChange("1", "배송준비")');
        return;
    }
    
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) {
        console.log('❌ 주문을 찾을 수 없습니다:', orderId);
        console.log('📋 현재 주문 목록:', orderSystem.orders.map(o => ({id: o.id, customer: o.customer_name, status: o.order_status})));
        return;
    }
    
    console.log('🧪 상태 변경 테스트 시작:', order.customer_name, order.order_status, '→', newStatus);
    orderSystem.updateOrderStatusInline(orderId, newStatus);
};

// QR 코드 테스트를 위한 전역 함수
window.testQRCode = async function() {
    console.log('🧪 QR 코드 테스트 시작...');
    
    // QRious 라이브러리 확인
    if (typeof QRious === 'undefined') {
        console.error('❌ QRious 라이브러리가 로드되지 않았습니다!');
        return;
    }
    console.log('✅ QRious 라이브러리 로드 확인');
    
    try {
        const result = await orderSystem.testQRCodeGeneration();
        console.log('✅ QR 코드 테스트 성공!');
        console.log('🔍 생성된 QR 코드 길이:', result.length);
        
        // QR 코드를 이미지로 표시
        const img = document.createElement('img');
        img.src = result;
        img.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; border: 2px solid #000; background: white;';
        document.body.appendChild(img);
        
        console.log('🔍 우상단에 QR 코드가 표시되었습니다. 스마트폰으로 스캔해보세요!');
        
        // 5초 후 제거
        setTimeout(() => {
            document.body.removeChild(img);
        }, 10000);
        
    } catch (error) {
        console.error('❌ QR 코드 테스트 실패:', error);
    }
};

console.log('📱 QR 코드 테스트를 위해 콘솔에서 "testQRCode()" 명령어를 실행하세요!');

// ============ 카카오 주소 검색 기능 ============

// 카카오 주소 검색 함수
function openKakaoAddressSearch(targetInputId, detailInputId = null) {
    if (typeof daum === 'undefined') {
        console.error('❌ 카카오 주소 API가 로드되지 않았습니다.');
        alert('주소 검색 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    new daum.Postcode({
        oncomplete: function(data) {
            // 주소 정보를 가져옵니다
            let addr = ''; // 주소 변수
            let extraAddr = ''; // 참고항목 변수

            // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져옵니다.
            if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                addr = data.roadAddress;
            } else { // 사용자가 지번 주소를 선택했을 경우(J)
                addr = data.jibunAddress;
            }

            // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합합니다.
            if(data.userSelectedType === 'R'){
                // 법정동명이 있을 경우 추가합니다. (법정리는 제외)
                // 법정동의 경우 마지막 문자가 "동/로/가"로 끝납니다.
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                    extraAddr += data.bname;
                }
                // 건물명이 있고, 공동주택일 경우 추가합니다.
                if(data.buildingName !== '' && data.apartment === 'Y'){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만듭니다.
                if(extraAddr !== ''){
                    extraAddr = ' (' + extraAddr + ')';
                }
            }

            // 주소 필드에 값을 설정합니다.
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = addr + extraAddr;
                targetInput.classList.remove('bg-gray-50');
                targetInput.classList.add('bg-white');
            }

            // 상세주소 필드가 있으면 포커스를 이동합니다.
            if (detailInputId) {
                const detailInput = document.getElementById(detailInputId);
                if (detailInput) {
                    detailInput.focus();
                }
            }

            console.log('✅ 주소 검색 완료:', addr + extraAddr);
        },
        onresize: function(size) {
            // 팝업 크기 조정
            console.log('📏 주소 검색 팝업 크기 조정:', size);
        },
        onclose: function(state) {
            // 팝업이 닫힐 때
            if (state === 'FORCE_CLOSE') {
                console.log('❌ 주소 검색이 강제로 닫혔습니다.');
            } else if (state === 'COMPLETE_CLOSE') {
                console.log('✅ 주소 검색이 완료되었습니다.');
            }
        }
    }).open();
}

// 주소 검색 이벤트 리스너 등록 (이벤트 위임 방식으로 변경)
document.addEventListener('DOMContentLoaded', function() {
    // 이벤트 위임을 사용하여 동적으로 생성되는 버튼에도 이벤트 리스너 적용
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'customer-form-address-search') {
            console.log('🔍 주소 검색 버튼 클릭됨');
            openKakaoAddressSearch('customer-form-address', 'customer-form-address-detail');
        }
    });

    console.log('✅ 카카오 주소 검색 기능이 초기화되었습니다.');
});

// 배송비 관리 관련 함수들
OrderManagementSystem.prototype.loadShippingSettings = async function() {
    console.log('🚚 배송비 설정 로드 중...');
    
    // 먼저 데이터베이스에서 설정 로드 시도
    await this.loadShippingSettingsFromDatabase();
    
    // 기본 배송비 설정 로드 (데이터베이스 또는 localStorage에서)
    const defaultShippingFee = localStorage.getItem('default-shipping-fee') || '4000';
    const freeShippingThreshold = localStorage.getItem('free-shipping-threshold') || '50000';
    const remoteShippingFee = localStorage.getItem('remote-shipping-fee') || '3000';
    
    // UI에 설정값 적용
    const defaultFeeInput = document.getElementById('default-shipping-fee');
    const freeShippingInput = document.getElementById('free-shipping-threshold');
    const remoteFeeInput = document.getElementById('remote-shipping-fee');
    
    if (defaultFeeInput) defaultFeeInput.value = defaultShippingFee;
    if (freeShippingInput) freeShippingInput.value = freeShippingThreshold;
    if (remoteFeeInput) remoteFeeInput.value = remoteShippingFee;
    
    console.log('✅ 배송비 설정 로드 완료');
};

OrderManagementSystem.prototype.renderShippingPage = function() {
    console.log('🚚 배송비 관리 페이지 렌더링 중...');
    
    // 배송비 규칙 목록 렌더링
    this.renderShippingRules();
    
    // 이벤트 리스너 설정
    this.setupShippingEventListeners();
    
    console.log('✅ 배송비 관리 페이지 렌더링 완료');
};

OrderManagementSystem.prototype.renderShippingRules = function() {
    const tbody = document.getElementById('shipping-table-body');
    if (!tbody) return;
    
    // 기본 배송비 규칙들
    const defaultRules = [
        {
            id: 'default',
            name: '기본 배송비',
            condition: '일반 지역',
            fee: '4,000원',
            active: true
        },
        {
            id: 'free',
            name: '무료배송',
            condition: '50,000원 이상 구매',
            fee: '0원',
            active: true
        },
        {
            id: 'remote',
            name: '제주/도서산간',
            condition: '제주도, 도서산간 지역',
            fee: '7,000원',
            active: true
        }
    ];
    
    tbody.innerHTML = defaultRules.map(rule => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${rule.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${rule.condition}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${rule.fee}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${rule.active ? '적용중' : '비활성'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="window.orderSystem.editShippingRule('${rule.id}')" 
                        class="text-purple-600 hover:text-purple-800 mr-3 transition-colors">
                    <i class="fas fa-edit"></i> 수정
                </button>
            </td>
        </tr>
    `).join('');
};

OrderManagementSystem.prototype.setupShippingEventListeners = function() {
    // 배송비 설정 저장 버튼
    const saveBtn = document.getElementById('save-shipping-settings');
    if (saveBtn && !saveBtn.hasAttribute('data-listener-added')) {
        saveBtn.addEventListener('click', () => {
            this.saveShippingSettings();
        });
        saveBtn.setAttribute('data-listener-added', 'true');
    }
    
    // 새 배송비 규칙 추가 버튼
    const addBtn = document.getElementById('add-shipping-btn');
    if (addBtn && !addBtn.hasAttribute('data-listener-added')) {
        addBtn.addEventListener('click', () => {
            this.openShippingRuleModal();
        });
        addBtn.setAttribute('data-listener-added', 'true');
    }
};

OrderManagementSystem.prototype.saveShippingSettings = function() {
    const defaultFee = document.getElementById('default-shipping-fee').value;
    const freeThreshold = document.getElementById('free-shipping-threshold').value;
    const remoteFee = document.getElementById('remote-shipping-fee').value;
    
    // 입력값 검증
    if (isNaN(defaultFee) || defaultFee < 0) {
        alert('❌ 기본 배송비가 올바르지 않습니다.');
        return;
    }
    if (isNaN(freeThreshold) || freeThreshold < 0) {
        alert('❌ 무료배송 기준 금액이 올바르지 않습니다.');
        return;
    }
    if (isNaN(remoteFee) || remoteFee < 0) {
        alert('❌ 도서산간 배송비가 올바르지 않습니다.');
        return;
    }
    
    // localStorage에 저장
    localStorage.setItem('default-shipping-fee', defaultFee);
    localStorage.setItem('free-shipping-threshold', freeThreshold);
    localStorage.setItem('remote-shipping-fee', remoteFee);
    
    // Supabase 데이터베이스에도 저장
    this.saveShippingSettingsToDatabase({
        defaultShippingFee: parseInt(defaultFee),
        freeShippingThreshold: parseInt(freeThreshold),
        remoteShippingFee: parseInt(remoteFee)
    });
    
    console.log('✅ 배송비 설정 저장 완료');
    alert('✅ 배송비 설정이 저장되었습니다!\n\n주문 관리에서 새로운 배송비 기준이 적용됩니다.');
};

// 배송비 설정을 Supabase 데이터베이스에 저장
OrderManagementSystem.prototype.saveShippingSettingsToDatabase = async function(settings) {
    try {
        // Supabase 연결 확인
        if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
            console.log('🏠 Supabase 연결 없음 - 로컬 모드로 작동');
            return;
        }

        const supabase = window.SupabaseConfig.getClient();
        
        // 배송비 설정 테이블에 저장
        const { data, error } = await supabase
            .from('farm_shipping_rules')
            .upsert({
                id: 'shipping_settings',
                name: '기본 배송비 설정',
                min_amount: settings.freeShippingThreshold,
                max_amount: null,
                shipping_fee: settings.defaultShippingFee,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (error) {
            console.error('❌ 배송비 설정 데이터베이스 저장 실패:', error);
            throw error;
        }

        console.log('✅ 배송비 설정 데이터베이스 저장 성공:', data);
        
    } catch (error) {
        console.warn('⚠️ 배송비 설정 데이터베이스 저장 실패, 로컬 모드로 계속:', error);
    }
};

// 데이터베이스에서 배송비 설정 로드
OrderManagementSystem.prototype.loadShippingSettingsFromDatabase = async function() {
    try {
        // Supabase 연결 확인
        if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
            console.log('🏠 Supabase 연결 없음 - 로컬 모드로 작동');
            return;
        }

        const supabase = window.SupabaseConfig.getClient();
        
        // 배송비 설정 테이블에서 로드
        const { data, error } = await supabase
            .from('farm_shipping_rules')
            .select('*')
            .eq('id', 'shipping_settings')
            .maybeSingle();

        if (error) {
            console.error('❌ 배송비 설정 데이터베이스 로드 실패:', error);
            throw error;
        }

        if (data) {
            console.log('✅ 배송비 설정 데이터베이스에서 로드 성공:', data);
            
            // localStorage에 동기화
            localStorage.setItem('default-shipping-fee', data.shipping_fee.toString());
            localStorage.setItem('free-shipping-threshold', data.min_amount.toString());
            localStorage.setItem('remote-shipping-fee', '6000'); // 기본값
            
            return data;
        } else {
            console.log('ℹ️ 데이터베이스에 배송비 설정이 없음 - 기본값 사용');
            return null;
        }
        
    } catch (error) {
        console.warn('⚠️ 배송비 설정 데이터베이스 로드 실패, 로컬 모드로 계속:', error);
        return null;
    }
};

// 고객등급 관리 관련 함수들
OrderManagementSystem.prototype.loadCustomerGradeSettings = async function() {
    console.log('👑 고객등급 설정 로드 중...');
    
    // 먼저 데이터베이스에서 설정 로드 시도
    await this.loadCustomerGradeSettingsFromDatabase();
    
    // 새로운 등급 체계 기준 금액 로드 (데이터베이스 또는 localStorage에서)
    const greenLeafThreshold = localStorage.getItem('green-leaf-threshold') || '100000';
    const redRubyThreshold = localStorage.getItem('red-ruby-threshold') || '200000';
    const purpleEmperorThreshold = localStorage.getItem('purple-emperor-threshold') || '500000';
    const blackDiamondThreshold = localStorage.getItem('black-diamond-threshold') || '1000000';
    
    // UI에 설정값 적용
    const greenLeafInput = document.getElementById('green-leaf-threshold');
    const redRubyInput = document.getElementById('red-ruby-threshold');
    const purpleEmperorInput = document.getElementById('purple-emperor-threshold');
    const blackDiamondInput = document.getElementById('black-diamond-threshold');
    
    if (greenLeafInput) greenLeafInput.value = greenLeafThreshold;
    if (redRubyInput) redRubyInput.value = redRubyThreshold;
    if (purpleEmperorInput) purpleEmperorInput.value = purpleEmperorThreshold;
    if (blackDiamondInput) blackDiamondInput.value = blackDiamondThreshold;
    
    console.log('✅ 고객등급 설정 로드 완료');
};

OrderManagementSystem.prototype.renderCustomerGradePage = function() {
    console.log('👑 고객등급 관리 페이지 렌더링 중...');
    
    // 고객등급 목록 렌더링
    this.renderCustomerGrades();
    
    // 이벤트 리스너 설정
    this.setupCustomerGradeEventListeners();
    
        // 데이터베이스 연결 상태 확인
        this.checkDatabaseConnection();
        
        // 고객 등급 옵션 업데이트
        this.updateCustomerGradeOptions();
    
    console.log('✅ 고객등급 관리 페이지 렌더링 완료');
};

OrderManagementSystem.prototype.renderCustomerGrades = function() {
    const tbody = document.getElementById('customer-grade-table-body');
    if (!tbody) return;
    
    // 경산다육농장 새로운 고객등급들
    const defaultGrades = [
        {
            id: 'general',
            name: '일반',
            icon: '🙋‍♂️',
            condition: '10만원 미만',
            benefits: '기본 서비스'
        },
        {
            id: 'green_leaf',
            name: '그린 리프',
            icon: '🟢',
            condition: '10만원 이상',
            benefits: '우리 농장의 소중한 인연이 시작된 고객'
        },
        {
            id: 'red_ruby',
            name: '레드 루비',
            icon: '🔴',
            condition: '20만원 이상',
            benefits: '농장에 대한 애정이 깊어지는 단골 고객'
        },
        {
            id: 'purple_emperor',
            name: '퍼플 엠페러',
            icon: '🟣',
            condition: '50만원 이상',
            benefits: '농장의 성장에 크게 기여하는 핵심 고객'
        },
        {
            id: 'black_diamond',
            name: '블랙 다이아몬드',
            icon: '💎',
            condition: '100만원 이상',
            benefits: '농장의 가장 소중한 VIP 파트너'
        }
    ];
    
    tbody.innerHTML = defaultGrades.map(grade => {
        // 현재 설정된 기준 금액 가져오기
        const storageKey = `${grade.id.replace('_', '-')}-threshold`;
        const currentThreshold = localStorage.getItem(storageKey) || grade.condition.replace(/[^0-9]/g, '');
        const displayCondition = grade.id === 'general' ? 
            `${parseInt(currentThreshold).toLocaleString()}원 미만` : 
            `${parseInt(currentThreshold).toLocaleString()}원 이상`;
        
        return `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${grade.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-2xl">${grade.icon}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayCondition}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${grade.benefits}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="window.orderSystem.editCustomerGrade('${grade.id}')" 
                        class="text-purple-600 hover:text-purple-800 mr-3 transition-colors">
                    <i class="fas fa-edit"></i> 수정
                </button>
            </td>
        </tr>
        `;
    }).join('');
};

OrderManagementSystem.prototype.setupCustomerGradeEventListeners = function() {
    // 고객등급 설정 저장 버튼
    const saveBtn = document.getElementById('save-grade-settings');
    if (saveBtn && !saveBtn.hasAttribute('data-listener-added')) {
        saveBtn.addEventListener('click', () => {
            this.saveCustomerGradeSettings();
        });
        saveBtn.setAttribute('data-listener-added', 'true');
    }
    
    // 새 고객등급 추가 버튼
    const addBtn = document.getElementById('add-grade-btn');
    if (addBtn && !addBtn.hasAttribute('data-listener-added')) {
        addBtn.addEventListener('click', () => {
            this.openCustomerGradeModal();
        });
        addBtn.setAttribute('data-listener-added', 'true');
    }
};

OrderManagementSystem.prototype.saveCustomerGradeSettings = function() {
    const greenLeafThreshold = document.getElementById('green-leaf-threshold').value;
    const redRubyThreshold = document.getElementById('red-ruby-threshold').value;
    const purpleEmperorThreshold = document.getElementById('purple-emperor-threshold').value;
    const blackDiamondThreshold = document.getElementById('black-diamond-threshold').value;
    
    // 입력값 검증
    const thresholds = [
        { name: '그린 리프', value: parseInt(greenLeafThreshold) },
        { name: '레드 루비', value: parseInt(redRubyThreshold) },
        { name: '퍼플 엠페러', value: parseInt(purpleEmperorThreshold) },
        { name: '블랙 다이아몬드', value: parseInt(blackDiamondThreshold) }
    ];
    
    // 금액이 올바른지 확인
    for (let threshold of thresholds) {
        if (isNaN(threshold.value) || threshold.value < 0) {
            alert(`❌ ${threshold.name} 기준 금액이 올바르지 않습니다.`);
            return;
        }
    }
    
    // 등급 순서가 올바른지 확인 (낮은 등급부터 높은 등급 순)
    if (greenLeafThreshold >= redRubyThreshold || 
        redRubyThreshold >= purpleEmperorThreshold || 
        purpleEmperorThreshold >= blackDiamondThreshold) {
        alert('❌ 등급 기준 금액은 낮은 등급부터 높은 등급 순으로 증가해야 합니다.');
        return;
    }
    
    // localStorage에 저장
    localStorage.setItem('green-leaf-threshold', greenLeafThreshold);
    localStorage.setItem('red-ruby-threshold', redRubyThreshold);
    localStorage.setItem('purple-emperor-threshold', purpleEmperorThreshold);
    localStorage.setItem('black-diamond-threshold', blackDiamondThreshold);
    
    // Supabase 데이터베이스에도 저장
    this.saveCustomerGradeSettingsToDatabase({
        greenLeafThreshold: parseInt(greenLeafThreshold),
        redRubyThreshold: parseInt(redRubyThreshold),
        purpleEmperorThreshold: parseInt(purpleEmperorThreshold),
        blackDiamondThreshold: parseInt(blackDiamondThreshold)
    });
    
    console.log('✅ 고객등급 기준 금액 설정 저장 완료');
    alert('✅ 고객등급 기준 금액이 저장되었습니다!\n\n모든 고객의 등급이 새로운 기준으로 자동 재계산됩니다.');
    
    // 모든 고객의 등급 재계산
    this.recalculateAllCustomerGrades();
};

// 고객등급 수정 모달 열기
OrderManagementSystem.prototype.editCustomerGrade = function(gradeId) {
    console.log('🔧 고객등급 수정 모달 열기:', gradeId);
    
    // 등급 정보 가져오기
    const gradeInfo = {
        'general': { name: '일반', threshold: '0', icon: '🙋‍♂️' },
        'green_leaf': { name: '그린 리프', threshold: '100000', icon: '🟢' },
        'red_ruby': { name: '레드 루비', threshold: '200000', icon: '🔴' },
        'purple_emperor': { name: '퍼플 엠페러', threshold: '500000', icon: '🟣' },
        'black_diamond': { name: '블랙 다이아몬드', threshold: '1000000', icon: '💎' }
    };
    
    const grade = gradeInfo[gradeId];
    if (!grade) {
        alert('❌ 등급 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 현재 설정값 가져오기
    const currentThreshold = localStorage.getItem(`${gradeId.replace('_', '-')}-threshold`) || grade.threshold;
    
    // 모달 HTML 생성
    const modalHTML = `
        <div id="grade-edit-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">
                        ${grade.icon} ${grade.name} 등급 수정
                    </h3>
                    <button onclick="this.closest('#grade-edit-modal').remove()" 
                            class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            기준 금액 (원)
                        </label>
                        <input type="number" 
                               id="edit-grade-threshold" 
                               value="${currentThreshold}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                               placeholder="예: 100000">
                    </div>
                    
                    <div class="text-sm text-gray-600">
                        <p><strong>현재 설정:</strong> ${parseInt(currentThreshold).toLocaleString()}원 이상</p>
                        <p><strong>설명:</strong> 이 금액 이상 구매한 고객이 ${grade.name} 등급이 됩니다.</p>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('#grade-edit-modal').remove()" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        취소
                    </button>
                    <button onclick="window.orderSystem.saveEditedGrade('${gradeId}')" 
                            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                        저장
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// 수정된 등급 저장
OrderManagementSystem.prototype.saveEditedGrade = function(gradeId) {
    const thresholdInput = document.getElementById('edit-grade-threshold');
    if (!thresholdInput) {
        alert('❌ 입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const newThreshold = thresholdInput.value;
    if (!newThreshold || isNaN(newThreshold) || parseInt(newThreshold) < 0) {
        alert('❌ 올바른 금액을 입력해주세요.');
        return;
    }
    
    // localStorage에 저장
    const storageKey = `${gradeId.replace('_', '-')}-threshold`;
    localStorage.setItem(storageKey, newThreshold);
    
    // Supabase 데이터베이스에도 저장
    this.saveCustomerGradeSettingsToDatabase({
        [storageKey]: parseInt(newThreshold)
    });
    
    console.log(`✅ ${gradeId} 등급 기준 금액 업데이트: ${newThreshold}원`);
    
    // 모달 닫기
    const modal = document.getElementById('grade-edit-modal');
    if (modal) {
        modal.remove();
    }
    
    // 등급 목록 새로고침
    this.renderCustomerGrades();
    
    // 모든 고객의 등급 재계산
    this.recalculateAllCustomerGrades();
    
    alert('✅ 등급 기준 금액이 저장되었습니다!\n\n모든 고객의 등급이 새로운 기준으로 자동 재계산됩니다.');
};

// 모든 고객의 등급 재계산 함수
OrderManagementSystem.prototype.recalculateAllCustomerGrades = function() {
    console.log('🔄 모든 고객 등급 재계산 시작...');
    
    let updatedCount = 0;
    
    this.customers.forEach(customer => {
        const oldGrade = customer.grade || 'GENERAL';
        const newGrade = this.calculateCustomerGrade(customer.id);
        
        // 강제로 등급 업데이트 (이전 등급 시스템에서 새 등급 시스템으로)
        customer.grade = newGrade;
        
        if (oldGrade !== newGrade) {
            updatedCount++;
            console.log(`📈 ${customer.name}: ${oldGrade} → ${newGrade}`);
        } else {
            console.log(`✅ ${customer.name}: ${newGrade} (변경 없음)`);
        }
    });
    
    // 모든 고객 데이터 저장 (등급이 변경되었든 아니든)
    this.saveToStorage('farm_customers', this.customers);
    
    // Supabase 데이터베이스에도 저장
    this.saveCustomersToDatabase();
    
    console.log(`✅ 모든 고객의 등급이 새로운 시스템으로 업데이트되었습니다. (${updatedCount}명 변경)`);
    
    // 고객 목록 새로고침
    if (this.currentTab === 'tab-customers') {
        this.loadCustomers();
    }
    
    // 고객 목록 테이블 강제 새로고침
    this.renderCustomersTable();
};

// 고객 등급 강제 업데이트 (디버깅용)
OrderManagementSystem.prototype.forceUpdateCustomerGrades = function() {
    console.log('🚀 고객 등급 강제 업데이트 시작...');
    
    // 모든 고객의 등급을 새로운 시스템으로 강제 변경
    this.customers.forEach(customer => {
        const oldGrade = customer.grade;
        const newGrade = this.calculateCustomerGrade(customer.id);
        
        // 등급 강제 업데이트
        customer.grade = newGrade;
        
        console.log(`🔄 ${customer.name}: ${oldGrade} → ${newGrade}`);
    });
    
    // 데이터 저장
    this.saveToStorage('farm_customers', this.customers);
    this.saveCustomersToDatabase();
    
    // UI 새로고침
    this.renderCustomersTable();
    
    console.log('✅ 고객 등급 강제 업데이트 완료!');
    alert('✅ 모든 고객의 등급이 새로운 시스템으로 업데이트되었습니다!');
};

// 고객 등급 옵션 업데이트 (새 고객 등록 시 사용)
OrderManagementSystem.prototype.updateCustomerGradeOptions = function() {
    const gradeSelect = document.getElementById('customer-form-grade');
    if (!gradeSelect) return;
    
    // 새로운 등급 시스템으로 옵션 업데이트
    gradeSelect.innerHTML = `
        <option value="GENERAL">🙋‍♂️ 일반</option>
        <option value="GREEN_LEAF">🟢 그린 리프</option>
        <option value="RED_RUBY">🔴 레드 루비</option>
        <option value="PURPLE_EMPEROR">🟣 퍼플 엠페러</option>
        <option value="BLACK_DIAMOND">💎 블랙 다이아몬드</option>
    `;
    
    console.log('✅ 고객 등급 옵션이 새로운 시스템으로 업데이트됨');
};

// 고객 데이터를 Supabase 데이터베이스에 저장
OrderManagementSystem.prototype.saveCustomersToDatabase = async function() {
    try {
        // Supabase 연결 확인
        if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
            console.log('🏠 Supabase 연결 없음 - 로컬 모드로 작동');
            return;
        }

        const supabase = window.SupabaseConfig.getClient();
        
        // 각 고객의 등급 정보를 데이터베이스에 저장
        for (const customer of this.customers) {
            // 안전한 필드만 포함하여 upsert
            const customerData = {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email || null,
                address: customer.address || null,
                memo: customer.memo || null,
                grade: customer.grade || 'GENERAL',
                updated_at: new Date().toISOString()
            };

            // 선택적 필드들 (존재하는 경우에만 추가)
            if (customer.totalAmount !== undefined) {
                customerData.total_amount = customer.totalAmount;
            }
            if (customer.orderCount !== undefined) {
                customerData.order_count = customer.orderCount;
            }
            if (customer.lastOrderDate) {
                customerData.last_order_date = customer.lastOrderDate;
            }
            if (customer.createdAt) {
                customerData.created_at = customer.createdAt;
            }

            const { data, error } = await supabase
                .from('farm_customers')
                .upsert(customerData, {
                    onConflict: 'id'
                });

            if (error) {
                console.error(`❌ 고객 ${customer.name} 데이터베이스 저장 실패:`, error);
            } else {
                console.log(`✅ 고객 ${customer.name} 데이터베이스 저장 성공`);
            }
        }
        
    } catch (error) {
        console.warn('⚠️ 고객 데이터베이스 저장 실패, 로컬 모드로 계속:', error);
    }
};

        // 고객등급 설정을 Supabase 데이터베이스에 저장
        OrderManagementSystem.prototype.saveCustomerGradeSettingsToDatabase = async function(settings) {
            try {
                // Supabase 연결 확인
                if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
                    console.log('🏠 Supabase 연결 없음 - 로컬 모드로 작동');
                    return;
                }
        
                const supabase = window.SupabaseConfig.getClient();
                
                // 새로운 farm_grade_settings 테이블에 저장
                const { data, error } = await supabase
                    .from('farm_grade_settings')
                    .upsert({
                        id: 'grade_thresholds',
                        green_leaf_threshold: settings.greenLeafThreshold || parseInt(localStorage.getItem('green-leaf-threshold') || '100000'),
                        red_ruby_threshold: settings.redRubyThreshold || parseInt(localStorage.getItem('red-ruby-threshold') || '200000'),
                        purple_emperor_threshold: settings.purpleEmperorThreshold || parseInt(localStorage.getItem('purple-emperor-threshold') || '500000'),
                        black_diamond_threshold: settings.blackDiamondThreshold || parseInt(localStorage.getItem('black-diamond-threshold') || '1000000'),
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });
        
                if (error) {
                    console.error('❌ 고객등급 설정 데이터베이스 저장 실패:', error);
                    throw error;
                }
        
                console.log('✅ 고객등급 설정 데이터베이스 저장 성공:', data);
                
            } catch (error) {
                console.warn('⚠️ 고객등급 설정 데이터베이스 저장 실패, 로컬 모드로 계속:', error);
            }
        };

        // 데이터베이스에서 고객등급 설정 로드
        OrderManagementSystem.prototype.loadCustomerGradeSettingsFromDatabase = async function() {
            try {
                // Supabase 연결 확인
                if (!window.SupabaseConfig || !window.SupabaseConfig.getClient()) {
                    console.log('🏠 Supabase 연결 없음 - 로컬 모드로 작동');
                    return;
                }
        
                const supabase = window.SupabaseConfig.getClient();
                
                // 새로운 farm_grade_settings 테이블에서 로드 시도
                const { data, error } = await supabase
                    .from('farm_grade_settings')
                    .select('*')
                    .eq('id', 'grade_thresholds')
                    .maybeSingle();
        
                if (error) {
                    console.error('❌ 고객등급 설정 데이터베이스 로드 실패:', error);
                    throw error;
                }
        
                if (data) {
                    console.log('✅ 고객등급 설정 데이터베이스에서 로드 성공:', data);
                    
                    // localStorage에 동기화
                    if (data.green_leaf_threshold) {
                        localStorage.setItem('green-leaf-threshold', data.green_leaf_threshold.toString());
                    }
                    if (data.red_ruby_threshold) {
                        localStorage.setItem('red-ruby-threshold', data.red_ruby_threshold.toString());
                    }
                    if (data.purple_emperor_threshold) {
                        localStorage.setItem('purple-emperor-threshold', data.purple_emperor_threshold.toString());
                    }
                    if (data.black_diamond_threshold) {
                        localStorage.setItem('black-diamond-threshold', data.black_diamond_threshold.toString());
                    }
                    
                    return data;
                } else {
                    console.log('ℹ️ 데이터베이스에 고객등급 설정이 없음 - 기본값 사용');
                    return null;
                }
                
            } catch (error) {
                console.warn('⚠️ 고객등급 설정 데이터베이스 로드 실패, 로컬 모드로 계속:', error);
                return null;
            }
        };

// 데이터베이스 연결 상태 확인 함수
OrderManagementSystem.prototype.checkDatabaseConnection = function() {
    console.log('🔍 데이터베이스 연결 상태 확인 중...');
    
    // Supabase 연결 상태 확인
    if (window.SupabaseConfig) {
        window.SupabaseConfig.checkConnection().then(result => {
            if (result.connected) {
                console.log('✅ Supabase 데이터베이스 연결 성공');
                this.showDatabaseStatus('connected', 'Supabase 데이터베이스 연결됨');
            } else {
                console.warn('⚠️ Supabase 데이터베이스 연결 실패:', result.error);
                this.showDatabaseStatus('disconnected', `Supabase 연결 실패: ${result.error}`);
            }
        }).catch(error => {
            console.error('❌ 데이터베이스 연결 확인 중 오류:', error);
            this.showDatabaseStatus('error', `연결 확인 오류: ${error.message}`);
        });
    } else {
        console.log('ℹ️ Supabase 설정 모듈이 로드되지 않음 - 로컬 모드로 작동');
        this.showDatabaseStatus('local', '로컬 모드 (LocalStorage 사용)');
    }
};

// 데이터베이스 상태 표시 함수
OrderManagementSystem.prototype.showDatabaseStatus = function(status, message) {
    const statusElement = document.getElementById('database-status');
    if (!statusElement) return;
    
    const statusClasses = {
        'connected': 'bg-green-100 text-green-800 border-green-200',
        'disconnected': 'bg-red-100 text-red-800 border-red-200',
        'error': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'local': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const statusIcons = {
        'connected': '✅',
        'disconnected': '❌',
        'error': '⚠️',
        'local': '🏠'
    };
    
    statusElement.className = `px-3 py-2 rounded-md border text-sm font-medium ${statusClasses[status] || statusClasses['error']}`;
    statusElement.innerHTML = `${statusIcons[status] || '⚠️'} ${message}`;
};

// 누락된 함수들 추가
OrderManagementSystem.prototype.reinitializeEventListeners = function() {
    console.log('🔄 이벤트 리스너 재초기화 시작...');
    try {
        this.setupEventListeners();
        this.setupSettingsEventListeners();
        console.log('✅ 이벤트 리스너 재초기화 완료');
        
        // 이벤트 리스너 설정 완료 플래그
        this.eventListenersSetup = true;
    } catch (error) {
        console.error('❌ 이벤트 리스너 재초기화 실패:', error);
    }
};

OrderManagementSystem.prototype.emergencyDataRecovery = function() {
    console.log('🚨 긴급 데이터 복구 시작...');
    try {
        // 로컬 스토리지에서 데이터 복구
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const customers = JSON.parse(localStorage.getItem('farm_customers') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (orders.length > 0) {
            this.orders = orders;
            this.renderOrdersTable();
            console.log(`✅ ${orders.length}개 주문 데이터 복구됨`);
        }
        
        if (customers.length > 0) {
            this.customers = customers;
            if (typeof this.renderCustomersTable === 'function') {
                this.renderCustomersTable();
            }
            console.log(`✅ ${customers.length}개 고객 데이터 복구됨`);
        }
        
        if (products.length > 0) {
            this.products = products;
            if (typeof this.renderProductsTable === 'function') {
                this.renderProductsTable();
            }
            console.log(`✅ ${products.length}개 상품 데이터 복구됨`);
        }
        
        console.log('✅ 긴급 데이터 복구 완료');
    } catch (error) {
        console.error('❌ 긴급 데이터 복구 실패:', error);
    }
};

console.log('🏠 카카오 주소 검색 기능이 로드되었습니다!');