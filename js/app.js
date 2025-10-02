// 개발모드 설정
const isDevMode = false; // 프로덕션 배포시 false로 설정

// 인증 관련 함수 제거됨 (로컬 모드)
import { showToast } from '../utils/ui-helpers.js';

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
        window.customerDataManager.loadCustomers();
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
    
    const key = getLocalStorageKey('farm_customers');
    const data = localStorage.getItem(key);
    
    console.log('📊 LocalStorage 상태:', {
        키: key,
        데이터존재: !!data,
        데이터크기: data ? data.length : 0
    });
    
    if (data) {
        try {
            const farm_customers = JSON.parse(data);
            console.log('👥 현재 고객 목록:', farm_customers);
            console.log('📈 고객 수:', farm_customers.length);
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
        const farm_customers = existingData ? JSON.parse(existingData) : [];
        farm_customers.push(testCustomer);
        localStorage.setItem(key, JSON.stringify(farm_customers));
        
        console.log('✅ 테스트 고객 등록 성공!');
        console.log('📊 등록 후 고객 수:', farm_customers.length);
        
        // 고객 목록 새로고침
        window.customerDataManager.loadCustomers();
        
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
    
    const key = getLocalStorageKey('farm_customers');
    const data = localStorage.getItem(key);
    
    console.log('📊 LocalStorage 상태:', {
        키: key,
        데이터존재: !!data,
        데이터크기: data ? data.length : 0,
        전체LocalStorage크기: localStorage.length
    });
    
    if (data) {
        try {
            const farm_customers = JSON.parse(data);
            console.log('👥 고객 목록:', farm_customers);
            console.log('📈 고객 수:', farm_customers.length);
            
            // 각 고객의 상세 정보
            farm_customers.forEach((customer, index) => {
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
        localStorage.removeItem('farm_management_farm_products');
        localStorage.removeItem('farm_management_categories');
        
        // 기본 데이터 재생성
        window.orderSystem.createInitialDataIfNeeded();
        // window.orderSystem.loadProducts(); // features/products/productData.js로 이동됨
        window.orderSystem.loadCategories();
        
        console.log('✅ 테스트 데이터 초기화 완료!');
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}


// 테이블 매핑 함수는 utils/helpers.js로 이동됨

// 로컬 기반 시스템 - 모든 데이터는 LocalStorage에 저장됨

// LocalStorage 헬퍼 함수들은 utils/helpers.js로 이동됨

// 경산다육식물농장 관리시스템
class OrderManagementSystem {
    constructor() {
        console.log('🚀 OrderManagementSystem 생성자 호출됨');
        console.log('🔍 DOM 상태:', document.readyState);
        console.log('🔍 탭 버튼 개수:', document.querySelectorAll('.tab-button').length);
        
        this.farm_orders = [];
        // this.farm_customers = []; // features/customers/customerData.js로 이동됨
        // this.farm_products = []; // features/products/productData.js로 이동됨
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
        this.farm_productsPerPage = 20;  // 기본값: 20개
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
        // Supabase REST API URL 사용
        if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) {
            const supabaseUrl = window.SUPABASE_CONFIG.url.replace(/\/$/, '') + '/rest/v1';
            console.log(`☁️ Supabase API URL: ${supabaseUrl}`);
            return supabaseUrl;
        }
        
        // Supabase 설정이 없으면 기존 로직 사용
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        console.log(`🌐 현재 호스트: ${hostname}, 프로토콜: ${protocol}, 포트: ${port}`);
        
        if (hostname.includes('genspark.ai')) {
            const apiUrl = '/tables';
            console.log(`🚀 GenSpark API URL: ${apiUrl}`);
            return apiUrl;
        } else if (hostname.includes('gensparkspace.com')) {
            const apiUrl = '/tables';
            console.log(`🏠 GenSparkSpace API URL: ${apiUrl}`);
            return apiUrl;
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const apiUrl = port ? `${protocol}//${hostname}:${port}/tables` : `${protocol}//${hostname}/tables`;
            console.log(`🏠 로컬 API URL: ${apiUrl}`);
            return apiUrl;
        } else {
            const apiUrl = 'tables';
            console.log(`🔧 기타 환경 API URL: ${apiUrl}`);
            return apiUrl;
        }
    }

    // API 연결 테스트
    async testApiConnection() {
        console.log('🧪 API 연결 테스트 시작...');
        
        try {
            // farm_customers 테이블에 GET 요청으로 API 연결 테스트
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
            farm_orders: { success: 0, failed: 0 },
            farm_products: { success: 0, failed: 0 },
            categories: { success: 0, failed: 0 }
        };

        try {
            // 고객 동기화
            const farm_customers = this.loadFromLocalStorage('farm_customers');
            console.log(`👥 고객 ${farm_customers.length}개 동기화 시작...`);
            
            for (const customer of farm_customers) {
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
                    syncResults.farm_customers.failed++;
                }
            }

            // 주문 동기화  
            const farm_orders = this.loadFromLocalStorage('farm_orders');
            console.log(`📦 주문 ${farm_orders.length}개 동기화 시작...`);
            
            for (const order of farm_orders) {
                try {
                    const response = await fetch(this.getApiUrl('farm_orders'), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(order)
                    });
                    
                    if (response.ok) {
                        syncResults.farm_orders.success++;
                    } else {
                        syncResults.farm_orders.failed++;
                    }
                } catch (error) {
                    syncResults.farm_orders.failed++;
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
                            localStorage.setItem(getLocalStorageKey(base), JSON.stringify(result.data));
                            
                            // 메모리에도 업데이트 (베이스명 기준)
                            if (base === 'farm_customers') this.farm_customers = result.data;
                            else if (base === 'farm_orders') this.farm_orders = result.data;
                            else if (base === 'farm_products') this.farm_products = result.data;
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
            // this.renderProductsTable(); // features/products/productUI.js로 이동됨
            if (window.renderProductsTable) {
                window.renderProductsTable();
            }
            this.updateCategorySelects();
            this.renderWaitlistTable();
            
            console.log(`🎉 브라우저별 데이터 동기화 완료! 총 ${totalSynced}개 데이터 동기화됨`);
            showToast(`✅ 브라우저 동기화 완료! (${totalSynced}개 데이터)`, 3000);
            
        } catch (error) {
            console.error('❌ 브라우저별 데이터 동기화 실패:', error);
            showToast('❌ 브라우저 동기화 실패', 3000);
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
                        localStorage.setItem(getLocalStorageKey(base), JSON.stringify(mergedData));
                        
                        // 메모리 업데이트
                        if (base === 'farm_customers') this.farm_customers = mergedData;
                        else if (base === 'farm_orders') this.farm_orders = mergedData;
                        else if (base === 'farm_products') this.farm_products = mergedData;
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
            // this.renderProductsTable(); // features/products/productUI.js로 이동됨
            if (window.renderProductsTable) {
                window.renderProductsTable();
            }
            this.updateCategorySelects();
            this.renderWaitlistTable();
            
            console.log(`🎉 스마트 브라우저 동기화 완료! 총 ${totalMerged}개 데이터 병합됨`);
            showToast(`✅ 스마트 동기화 완료! (${totalMerged}개 데이터 병합)`, 3000);
            
        } catch (error) {
            console.error('❌ 스마트 브라우저 동기화 실패:', error);
            showToast('❌ 스마트 동기화 실패', 3000);
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
                if (tableName === 'farm_orders' && localItem.order_number && serverItem.order_number) {
                    return localItem.order_number === serverItem.order_number;
                }
                if (tableName === 'farm_products' && localItem.name && serverItem.name) {
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

    // LocalStorage 백업 함수들 (getLocalStorageKey는 utils/helpers.js로 이동됨)

    // LocalStorage 전용 저장 메서드
    async saveToStorage(tableName, data) {
        try {
            console.log(`💾 LocalStorage 저장: ${tableName}`);
            return this.saveToLocalStorage(tableName, data);
        } catch (error) {
            console.error(`❌ 저장 실패 (${tableName}):`, error);
            return false;
        }
    }

    // LocalStorage 전용 로드 메서드
    async loadFromStorage(tableName, forceRefresh = false) {
        try {
            console.log(`📦 LocalStorage 로드: ${tableName}`);
            return this.loadFromLocalStorage(tableName);
        } catch (error) {
            console.error(`❌ 로드 실패 (${tableName}):`, error);
            return [];
        }
    }

    // 기존 LocalStorage 메서드 (폴백용)
    saveToLocalStorage(tableName, data) {
        try {
            const key = getLocalStorageKey(tableName);
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
            const key = getLocalStorageKey(tableName);
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

    openCustomerModal(customerId = null) {
        console.log('🚀 openCustomerModal 함수 실행!', customerId ? `(수정 모드: ${customerId})` : '(신규 등록 모드)');

        const modal = document.getElementById('customer-modal');
        const modalTitle = document.getElementById('customer-modal-title');
        const customerForm = document.getElementById('customer-form');

        if (!modal || !modalTitle || !customerForm) {
            console.error('❌ 고객 모달의 필수 요소를 찾을 수 없습니다.');
            return;
        }

        // 폼 초기화
        customerForm.reset();
        
        // customer-id 요소가 있는 경우에만 초기화
        const customerIdField = document.getElementById('customer-id');
        if (customerIdField) {
            customerIdField.value = customerId || '';
        }

        if (customerId) {
            // --- 수정 모드 ---
            modalTitle.textContent = '고객 정보 수정';
            if (customerIdField) {
                customerIdField.value = customerId;
            }
            this.loadCustomerData(customerId);
        } else {
            // --- 신규 등록 모드 ---
            modalTitle.textContent = '새 고객 등록';
            if (customerIdField) {
                customerIdField.value = '';
            }
        }

        // 모달 열기
        modal.classList.remove('hidden');
        
        // 저장 버튼 이벤트 리스너 설정
        this.setupCustomerSaveButton(customerForm);
    }

    // 고객 데이터 로드 (수정 모드용)
    loadCustomerData(customerId) {
        console.log('📋 고객 데이터 로드:', customerId);
        
        if (window.customerDataManager) {
            const customer = window.customerDataManager.getCustomerById(customerId);
            if (customer) {
                // 폼 필드에 데이터 설정
                const nameField = document.getElementById('customer-form-name');
                const phoneField = document.getElementById('customer-form-phone');
                const addressField = document.getElementById('customer-form-address');
                const emailField = document.getElementById('customer-form-email');
                const gradeField = document.getElementById('customer-form-grade');
                const memoField = document.getElementById('customer-form-memo');
                
                if (nameField) nameField.value = customer.name || '';
                if (phoneField) phoneField.value = customer.phone || '';
                if (addressField) addressField.value = customer.address || '';
                if (emailField) emailField.value = customer.email || '';
                if (gradeField) gradeField.value = customer.grade || 'GENERAL';
                if (memoField) memoField.value = customer.memo || '';
                
                console.log('✅ 고객 데이터 로드 완료:', customer);
            } else {
                console.error('❌ 고객을 찾을 수 없습니다:', customerId);
                alert('고객 정보를 찾을 수 없습니다.');
            }
        }
    }

    // 저장 버튼 이벤트 리스너 설정
    setupCustomerSaveButton(customerForm) {
        const saveCustomerBtn = document.getElementById('save-customer-btn');
        if (saveCustomerBtn) {
            // 기존 이벤트 리스너 제거
            saveCustomerBtn.replaceWith(saveCustomerBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('save-customer-btn');
            
            newSaveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('💾 고객 저장 버튼 클릭됨');
                
                const formData = new FormData(customerForm);
                const customerData = {
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    email: formData.get('email'),
                    grade: formData.get('grade') || 'GENERAL',
                    memo: formData.get('memo')
                };

                try {
                    if (window.customerDataManager) {
                        const customerIdField = document.getElementById('customer-id');
                        const customerId = customerIdField ? customerIdField.value : null;
                        
                        if (customerId) {
                            // 수정 모드
                            await window.customerDataManager.updateCustomer(customerId, customerData);
                            console.log('✅ 고객 수정 완료');
                        } else {
                            // 신규 등록 모드
                            await window.customerDataManager.addCustomer(customerData);
                            console.log('✅ 고객 등록 완료');
                        }
                        
                        this.closeCustomerModal();
                        
                        // 고객 목록 새로고침
                        if (window.renderCustomersTable) {
                            window.renderCustomersTable('all');
                        }
                    } else {
                        console.error('❌ customerDataManager가 없습니다.');
                    }
                } catch (error) {
                    console.error('❌ 고객 저장 실패:', error);
                    alert('고객 저장에 실패했습니다: ' + error.message);
                }
            });
        }
    }

    closeCustomerModal() {
        console.log('🚪 closeCustomerModal 함수 실행!');
        const modal = document.getElementById('customer-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // 고객 모달 관련 함수들을 전역으로 등록
    openCustomerModal(customerId = null) {
        console.log('🚀 openCustomerModal 함수 실행!', customerId ? `(수정 모드: ${customerId})` : '(신규 등록 모드)');

        const modal = document.getElementById('customer-modal');
        const modalTitle = document.getElementById('customer-modal-title');
        
        if (!modal) {
            console.error('❌ 고객 모달을 찾을 수 없습니다.');
            return;
        }
        
        // 모달 표시
        modal.classList.remove('hidden');
        
        if (customerId) {
            // 수정 모드
            modalTitle.textContent = '고객 정보 수정';
            this.loadCustomerData(customerId);
        } else {
            // 등록 모드
            modalTitle.textContent = '새 고객 등록';
            this.clearCustomerForm();
        }
        
        console.log('✅ 고객 모달 열기 완료');
    }
    
    // 고객 폼 초기화
    clearCustomerForm() {
        console.log('🧹 고객 폼 초기화');
        
        // 고객 폼 요소들 초기화
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.reset();
        }
        
        // 개별 필드들 초기화
        const fields = [
            'customer-form-name',
            'customer-form-phone', 
            'customer-form-email',
            'customer-form-address',
            'customer-form-memo',
            'customer-id'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        console.log('✅ 고객 폼 초기화 완료');
    }
    
    // 고객 데이터 로드 (수정 모드용)
    loadCustomerData(customerId) {
        console.log('📦 고객 데이터 로드:', customerId);
        
        if (window.customerDataManager) {
            const customer = window.customerDataManager.getCustomerById(customerId);
            if (customer) {
                // 고객 정보를 폼에 입력
                const fields = {
                    'customer-form-name': customer.name,
                    'customer-form-phone': customer.phone,
                    'customer-form-email': customer.email,
                    'customer-form-address': customer.address,
                    'customer-form-memo': customer.memo,
                    'customer-id': customer.id
                };
                
                Object.entries(fields).forEach(([fieldId, value]) => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = value || '';
                    }
                });
                
                console.log('✅ 고객 데이터 로드 완료');
            } else {
                console.error('❌ 고객을 찾을 수 없습니다:', customerId);
            }
        } else {
            console.error('❌ customerDataManager를 찾을 수 없습니다');
        }
    }

    // 주소 검색 함수
    openAddressSearch() {
        // 중복 실행 횟수 카운트
        if (!this.addressSearchCount) {
            this.addressSearchCount = 0;
        }
        this.addressSearchCount++;
        
        console.log(`🔍 주소 검색 시작... (${this.addressSearchCount}번째 호출)`);
        
        if (typeof daum === 'undefined') {
            console.error('❌ 카카오 주소 API가 로드되지 않았습니다.');
            alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('🔍 카카오 주소 검색창 열기...');
        
        new daum.Postcode({
            oncomplete: (data) => {
                console.log('📍 선택된 주소:', data.address);
                
                // 주소 입력 필드에 값 설정
                const addressInput = document.getElementById('customer-form-address');
                const detailInput = document.getElementById('customer-form-address-detail');
                
                if (addressInput) {
                    addressInput.value = data.address;
                }
                
                if (detailInput) {
                    detailInput.focus();
                }
                
                console.log('✅ 주소 설정 완료');
            }
        }).open();
    }

    // 전화번호 실시간 중복 확인
    async checkPhoneDuplicate() {
        const phoneInput = document.getElementById('customer-form-phone');
        if (!phoneInput || !phoneInput.value.trim()) {
            return;
        }

        const phoneNumber = phoneInput.value.trim();
        console.log('📞 전화번호 중복 확인:', phoneNumber);

        // 수정 모드인지 확인
        const customerIdField = document.getElementById('customer-id');
        const currentCustomerId = customerIdField ? customerIdField.value : null;
        const isEditMode = currentCustomerId && currentCustomerId.trim() !== '';
        
        console.log('🔍 중복 확인 모드:', {
            isEditMode: isEditMode,
            currentCustomerId: currentCustomerId,
            phoneNumber: phoneNumber
        });

        try {
            if (window.customerDataManager) {
                const allCustomers = window.customerDataManager.getAllCustomers();
                console.log('📋 전체 고객 목록:', allCustomers);
                
                // 수정 모드: 자기 자신 제외하고 중복 확인
                // 등록 모드: 모든 고객과 중복 확인
                const duplicateCustomer = allCustomers.find(customer => {
                    if (customer.phone === phoneNumber) {
                        if (isEditMode) {
                            // 수정 모드: 자기 자신이 아닌 경우만 중복으로 간주
                            return customer.id !== currentCustomerId;
                        } else {
                            // 등록 모드: 모든 고객과 중복 확인
                            return true;
                        }
                    }
                    return false;
                });
                
                console.log('🔍 중복 확인 결과:', duplicateCustomer);
                
                if (duplicateCustomer) {
                    console.log('⚠️ 중복된 전화번호 발견:', {
                        duplicateCustomer: duplicateCustomer,
                        duplicateName: duplicateCustomer.name,
                        duplicateId: duplicateCustomer.id,
                        currentCustomerId: currentCustomerId,
                        phoneNumber: phoneNumber
                    });
                    this.showPhoneDuplicateMessage(duplicateCustomer.name, phoneNumber);
                } else {
                    console.log('✅ 전화번호 사용 가능');
                    this.hidePhoneDuplicateMessage();
                }
            }
        } catch (error) {
            console.error('❌ 전화번호 중복 확인 실패:', error);
        }
    }

    // 전화번호 중복 메시지 표시
    showPhoneDuplicateMessage(customerName, phoneNumber) {
        // 기존 메시지 제거
        this.hidePhoneDuplicateMessage();

        const phoneInput = document.getElementById('customer-form-phone');
        if (!phoneInput) return;

        // 중복 메시지 생성
        const duplicateMessage = document.createElement('div');
        duplicateMessage.id = 'phone-duplicate-message';
        duplicateMessage.className = 'text-red-500 text-sm mt-1 flex items-center';
        duplicateMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle mr-1"></i>
            ${customerName}님의 전화번호로 등록된 번호입니다.
        `;

        // 전화번호 입력 필드 다음에 메시지 삽입
        phoneInput.parentNode.insertBefore(duplicateMessage, phoneInput.nextSibling);
        
        // 전화번호 입력 필드 스타일 변경
        phoneInput.classList.add('border-red-500', 'bg-red-50');
        phoneInput.classList.remove('border-gray-300');

        console.log('⚠️ 전화번호 중복 메시지 표시:', customerName, phoneNumber);
    }

    // 전화번호 중복 메시지 숨기기
    hidePhoneDuplicateMessage() {
        const duplicateMessage = document.getElementById('phone-duplicate-message');
        if (duplicateMessage) {
            duplicateMessage.remove();
        }

        const phoneInput = document.getElementById('customer-form-phone');
        if (phoneInput) {
            phoneInput.classList.remove('border-red-500', 'bg-red-50');
            phoneInput.classList.add('border-gray-300');
        }
    }

    // 고객 저장 함수 (HTML onclick에서 호출)
    async saveCustomer() {
        console.log('💾 saveCustomer 함수 호출됨');
        
        const customerForm = document.getElementById('customer-form');
        if (!customerForm) {
            console.error('❌ 고객 폼을 찾을 수 없습니다.');
            return;
        }
        
        const formData = new FormData(customerForm);
        const customerData = {
            name: formData.get('name') || document.getElementById('customer-form-name')?.value,
            phone: formData.get('phone') || document.getElementById('customer-form-phone')?.value,
            address: formData.get('address') || document.getElementById('customer-form-address')?.value,
            email: formData.get('email') || document.getElementById('customer-form-email')?.value,
            grade: formData.get('grade') || document.getElementById('customer-form-grade')?.value || 'GENERAL',
            memo: formData.get('memo') || document.getElementById('customer-form-memo')?.value
        };

        console.log('📝 저장할 고객 데이터:', customerData);

        try {
            if (window.customerDataManager) {
                const customerIdField = document.getElementById('customer-id');
                const customerId = customerIdField ? customerIdField.value : null;
                
                console.log('🔍 모드 감지:', {
                    customerIdField: !!customerIdField,
                    customerId: customerId,
                    isEditMode: !!customerId
                });
                
                if (customerId && customerId.trim() !== '') {
                    // 수정 모드
                    console.log('✏️ 수정 모드 - 고객 정보 업데이트:', customerId);
                    await window.customerDataManager.updateCustomer(customerId, customerData);
                    console.log('✅ 고객 수정 완료');
                    
                    if (window.showToast) {
                        window.showToast('✅ 고객 정보가 수정되었습니다.', 3000);
                    }
                } else {
                    // 신규 등록 모드
                    console.log('➕ 신규 등록 모드 - 새 고객 추가');
                    await window.customerDataManager.addCustomer(customerData);
                    console.log('✅ 고객 등록 완료');
                    
                    if (window.showToast) {
                        window.showToast('✅ 고객이 성공적으로 등록되었습니다.', 3000);
                    }
                }
                
                this.closeCustomerModal();
                
                // 고객 목록 새로고침
                console.log('🔄 고객 목록 새로고침 시작...');
                
                // 고객 데이터 강제 로드
                if (window.customerDataManager) {
                    await window.customerDataManager.loadCustomers();
                    console.log('📦 고객 데이터 로드 완료');
                }
                
                if (window.renderCustomersTable) {
                    window.renderCustomersTable('all');
                    console.log('✅ 고객 목록 새로고침 완료');
                } else {
                    console.error('❌ renderCustomersTable 함수를 찾을 수 없습니다.');
                }
                
                // 주문 모달에서 고객 등록을 요청한 경우 주문 모달로 돌아가기
                if (window.isCustomerRegistrationFromOrder) {
                    console.log('🔄 주문 모달로 돌아가기...');
                    window.isCustomerRegistrationFromOrder = false;
                    
                    // 주문 모달 열기
                    if (window.openOrderModal) {
                        window.openOrderModal();
                        
                        // 등록된 고객 정보를 주문 폼에 자동 입력
                        setTimeout(() => {
                            const orderCustomerName = document.getElementById('order-customer-name');
                            const orderCustomerPhone = document.getElementById('order-customer-phone');
                            const orderCustomerAddress = document.getElementById('order-customer-address');
                            
                            if (orderCustomerName) orderCustomerName.value = customerData.name || '';
                            if (orderCustomerPhone) orderCustomerPhone.value = customerData.phone || '';
                            if (orderCustomerAddress) orderCustomerAddress.value = customerData.address || '';
                            
                            console.log('✅ 주문 폼에 고객 정보 자동 입력 완료');
                        }, 200);
                    }
                }
                
            } else {
                console.error('❌ customerDataManager가 없습니다.');
                alert('고객 데이터 관리자를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 고객 저장 실패:', error);
            
            // 전화번호 중복 오류인 경우 특별 처리
            if (error.message.includes('이미 등록된 전화번호')) {
                const phoneNumber = document.getElementById('customer-form-phone')?.value || '입력된 번호';
                const customerName = document.getElementById('customer-form-name')?.value || '고객';
                alert(`⚠️ ${customerName}님의 전화번호로 등록된 번호입니다.\n다른 전화번호를 입력해주세요.`);
            } else {
                alert('고객 저장에 실패했습니다: ' + error.message);
            }
        }
    }

    // 이벤트 리스너 재등록 함수
    reinitializeEventListeners() {
        console.log('🔄 이벤트 리스너 재등록 시작...');
        try {
            // 기존 이벤트 리스너 제거 및 재등록
            this.setupEventListeners();
            console.log('✅ 이벤트 리스너 재등록 완료');
        } catch (error) {
            console.error('❌ 이벤트 리스너 재등록 실패:', error);
        }
    }

    // 긴급 데이터 복구 함수
    emergencyDataRecovery() {
        console.log('🚨 긴급 데이터 복구 시작...');
        try {
            // 고객 데이터 복구
            if (window.customerDataManager) {
                window.customerDataManager.loadCustomers();
                console.log('✅ 고객 데이터 복구 완료');
            }
            console.log('✅ 긴급 데이터 복구 완료');
        } catch (error) {
            console.error('❌ 긴급 데이터 복구 실패:', error);
        }
    }

    // 고객 등급별 필터링 함수
    filterCustomersByGrade(grade) {
        console.log(`🎨 고객 등급 필터링: ${grade}`);
        
        // 1. 모든 등급 탭의 '활성화' 스타일을 먼저 제거합니다.
        document.querySelectorAll('.customer-tab-btn').forEach(tab => {
            tab.classList.remove('active', 'border-green-600', 'text-green-600', 'border-gray-900', 'text-gray-900', 'border-purple-600', 'text-purple-600', 'border-red-600', 'text-red-600', 'border-blue-600', 'text-blue-600');
        });

        // 2. 지금 클릭한 탭에만 '활성화' 스타일을 추가합니다.
        const activeTab = document.getElementById(`customer-grade-${grade}`);
        if (activeTab) {
            // 등급별 색상 매핑
            const gradeColorMap = {
                'all': ['border-green-600', 'text-green-600'],
                'BLACK_DIAMOND': ['border-gray-900', 'text-gray-900'],
                'PURPLE_EMPEROR': ['border-purple-600', 'text-purple-600'],
                'RED_RUBY': ['border-red-600', 'text-red-600'],
                'GREEN_LEAF': ['border-green-600', 'text-green-600'],
                'GENERAL': ['border-blue-600', 'text-blue-600'],
            };
            activeTab.classList.add('active', ...(gradeColorMap[grade] || []));
        }
        
        // 3. '화면 전문가'에게 필터링된 결과로 그림을 그리라고 지시합니다.
        if (window.renderCustomersTable) {
            window.renderCustomersTable(grade);
        } else {
            console.error('❌ renderCustomersTable 함수를 찾을 수 없습니다.');
        }
    }

    // 탭 전환 함수
    async switchTab(tabId) {
        console.log(`🔄 탭 전환: ${tabId}`);
        
        try {
            // 모든 탭 섹션 숨기기
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.add('hidden');
            });
            
            // 모든 탭 버튼 비활성화
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });
            
            // 선택된 탭 섹션 표시
            const selectedTab = document.getElementById(tabId.replace('tab-', '') + '-section');
            if (selectedTab) {
                selectedTab.classList.remove('hidden');
            }
            
            // 선택된 탭 버튼 활성화
            const selectedButton = document.getElementById(tabId);
            if (selectedButton) {
                selectedButton.classList.add('active');
            }
            
            // 고객 탭인 경우 고객 테이블 렌더링
            if (tabId === 'tab-customers') {
                console.log('👥 고객 탭 클릭됨 - 데이터 로드 및 렌더링 시작');
                
                // 고객 데이터 강제 로드
                if (window.customerDataManager) {
                    await window.customerDataManager.loadCustomers();
                    console.log('📊 고객 데이터 로드 완료:', window.customerDataManager.getAllCustomers().length);
                }
                
                if (window.renderCustomersTable) {
                    window.renderCustomersTable('all');
                    console.log('🎨 고객 목록 렌더링 완료');
                } else {
                    console.error('❌ renderCustomersTable 함수를 찾을 수 없습니다.');
                }
            }
            
            // 상품 탭인 경우 상품 테이블 렌더링
            if (tabId === 'tab-products') {
                console.log('🛍️ 상품 탭 클릭됨 - 데이터 로드 및 렌더링 시작');
                
                // 상품 데이터 강제 로드
                if (window.productDataManager) {
                    await window.productDataManager.loadProducts();
                    console.log('📊 상품 데이터 로드 완료:', window.productDataManager.getAllProducts().length);
                }
                
                if (window.renderProductsTable) {
                    window.renderProductsTable();
                    console.log('🎨 상품 목록 렌더링 완료');
                } else {
                    console.error('❌ renderProductsTable 함수를 찾을 수 없습니다.');
                }
            }
            
            console.log(`✅ 탭 전환 완료: ${tabId}`);
            
        } catch (error) {
            console.error('❌ 탭 전환 실패:', error);
        }
    }

    // 환경설정 이벤트 리스너 설정
    setupSettingsEventListeners() {
        console.log('⚙️ 환경설정 이벤트 리스너 설정 시작...');
        
        try {
            // 데스크톱 환경설정 드롭다운 토글
            const settingsDropdown = document.getElementById('settings-dropdown');
            const settingsMenu = document.getElementById('settings-menu');
            const settingsChevron = document.getElementById('settings-chevron');
            
            if (settingsDropdown && settingsMenu && settingsChevron) {
                settingsDropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSettingsDropdown();
                });
                
                // 외부 클릭 시 드롭다운 닫기
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#settings-dropdown') && !e.target.closest('#settings-menu')) {
                        this.closeSettingsDropdown();
                    }
                });
            }
            
            // 모바일 환경설정 바텀 시트
            const mobileSettingsToggle = document.getElementById('mobile-settings-toggle');
            const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
            const mobileSettingsContent = document.getElementById('mobile-settings-content');
            const mobileSettingsClose = document.getElementById('mobile-settings-close');
            
            if (mobileSettingsToggle && mobileSettingsSheet) {
                mobileSettingsToggle.addEventListener('click', () => {
                    this.openMobileSettingsSheet();
                });
            }
            
            if (mobileSettingsClose) {
                mobileSettingsClose.addEventListener('click', () => {
                    this.closeMobileSettingsSheet();
                });
            }
            
            // 바텀 시트 배경 클릭 시 닫기
            if (mobileSettingsSheet) {
                mobileSettingsSheet.addEventListener('click', (e) => {
                    if (e.target === mobileSettingsSheet) {
                        this.closeMobileSettingsSheet();
                    }
                });
            }
            
            // 환경설정 탭 버튼들
            this.setupSettingsTabButtons();
            
            console.log('✅ 환경설정 이벤트 리스너 설정 완료');
            
        } catch (error) {
            console.error('❌ 환경설정 이벤트 리스너 설정 실패:', error);
        }
    }

    // 환경설정 드롭다운 토글
    toggleSettingsDropdown() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        if (settingsMenu && settingsChevron) {
            const isHidden = settingsMenu.classList.contains('hidden');
            
            if (isHidden) {
                this.openSettingsDropdown();
            } else {
                this.closeSettingsDropdown();
            }
        }
    }

    // 환경설정 드롭다운 열기
    openSettingsDropdown() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        if (settingsMenu && settingsChevron) {
            settingsMenu.classList.remove('hidden');
            settingsChevron.style.transform = 'rotate(180deg)';
            console.log('⚙️ 환경설정 드롭다운 열림');
        }
    }

    // 환경설정 드롭다운 닫기
    closeSettingsDropdown() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        if (settingsMenu && settingsChevron) {
            settingsMenu.classList.add('hidden');
            settingsChevron.style.transform = 'rotate(0deg)';
            console.log('⚙️ 환경설정 드롭다운 닫힘');
        }
    }

    // 모바일 환경설정 바텀 시트 열기
    openMobileSettingsSheet() {
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        
        if (mobileSettingsSheet && mobileSettingsContent) {
            mobileSettingsSheet.classList.remove('hidden');
            
            // 애니메이션을 위한 지연
            setTimeout(() => {
                mobileSettingsContent.style.transform = 'translateY(0)';
            }, 10);
            
            console.log('📱 모바일 환경설정 바텀 시트 열림');
        }
    }

    // 모바일 환경설정 바텀 시트 닫기
    closeMobileSettingsSheet() {
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        
        if (mobileSettingsSheet && mobileSettingsContent) {
            mobileSettingsContent.style.transform = 'translateY(100%)';
            
            setTimeout(() => {
                mobileSettingsSheet.classList.add('hidden');
            }, 300);
            
            console.log('📱 모바일 환경설정 바텀 시트 닫힘');
        }
    }

    // 환경설정 탭 버튼들 설정
    setupSettingsTabButtons() {
        // 데스크톱 탭 버튼들
        const tabButtons = [
            { id: 'tab-channels', section: 'channels-section' },
            { id: 'tab-order-status', section: 'order-status-section' },
            { id: 'tab-shipping-settings', section: 'shipping-settings-section' },
            { id: 'tab-customer-grade', section: 'customer-grade-section' }
        ];
        
        // 모바일 탭 버튼들
        const mobileTabButtons = [
            { id: 'mobile-tab-channels', section: 'channels-section' },
            { id: 'mobile-tab-order-status', section: 'order-status-section' },
            { id: 'mobile-tab-shipping-settings', section: 'shipping-settings-section' },
            { id: 'mobile-tab-customer-grade', section: 'customer-grade-section' }
        ];
        
        // 데스크톱 버튼 이벤트
        tabButtons.forEach(button => {
            const btn = document.getElementById(button.id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.switchToSettingsTab(button.section);
                    this.closeSettingsDropdown();
                });
            }
        });
        
        // 모바일 버튼 이벤트
        mobileTabButtons.forEach(button => {
            const btn = document.getElementById(button.id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.switchToSettingsTab(button.section);
                    this.closeMobileSettingsSheet();
                });
            }
        });
    }

    // 환경설정 탭 전환
    switchToSettingsTab(sectionId) {
        try {
            console.log(`⚙️ 환경설정 탭 전환: ${sectionId}`);
            
            // 모든 환경설정 섹션 숨기기
            const allSections = document.querySelectorAll('.tab-content');
            allSections.forEach(section => {
                if (section.id.includes('section')) {
                    section.classList.add('hidden');
                }
            });
            
            // 선택된 섹션 표시
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                console.log(`✅ ${sectionId} 섹션 표시됨`);
            } else {
                console.warn(`⚠️ ${sectionId} 섹션을 찾을 수 없습니다`);
            }
            
        } catch (error) {
            console.error('❌ 환경설정 탭 전환 실패:', error);
        }
    }

    // 상품 정렬 리스너 설정
    setupProductSortListener() {
        console.log('📦 상품 정렬 리스너 설정 시작...');
        
        try {
            // 상품 정렬 관련 이벤트 리스너들
            const sortButtons = document.querySelectorAll('[data-sort]');
            sortButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const sortBy = e.target.getAttribute('data-sort');
                    console.log('📦 상품 정렬:', sortBy);
                    // 상품 정렬 로직 (추후 구현)
                });
            });
            
            console.log('✅ 상품 정렬 리스너 설정 완료');
            
        } catch (error) {
            console.error('❌ 상품 정렬 리스너 설정 실패:', error);
        }
    }

    async init() {
        console.log('🚀 init 함수 시작!');
        
        // 로컬 기반 시스템 - API 테스트 비활성화
        this.apiAvailable = false;
        console.log('🏠 로컬 기반 시스템: API 테스트 건너뜀');
        
        // API 상태 UI 업데이트
        this.updateApiStatusUI(false);
        
        console.log('📱 로컬 스토리지 모드로 실행합니다.');
        
        // 로컬 기반 시스템 - API 모니터링 비활성화
        console.log('🏠 로컬 기반 시스템: API 모니터링 비활성화');
        
        this.setupEventListeners();
        // 초기 데이터 로드 (고객 데이터만)
        if (window.customerDataManager) {
            console.log('📦 고객 데이터 로드 시작...');
            await window.customerDataManager.loadCustomers();
            console.log('📦 고객 데이터 로드 완료');
            console.log('📊 로드된 고객 수:', window.customerDataManager.getAllCustomers().length);
            
            // 고객 목록 강제 렌더링
            if (window.renderCustomersTable) {
                console.log('🎨 고객 목록 강제 렌더링...');
                window.renderCustomersTable('all');
            }
        }
        
        if (window.productDataManager) {
            console.log('📦 상품 데이터 로드 시작...');
            await window.productDataManager.loadProducts();
            console.log('📦 상품 데이터 로드 완료');
            console.log('📊 로드된 상품 수:', window.productDataManager.getAllProducts().length);
            
            // 상품 목록 강제 렌더링
            if (window.renderProductsTable) {
                console.log('🎨 상품 목록 강제 렌더링...');
                window.renderProductsTable();
            }
        }
        
        // 실시간 운영 현황 초기화 (현재 비활성화)
        // this.setupRealtimeDashboard();
        
        // 경영 대시보드 초기화 (현재 비활성화)
        // this.setupAnalyticsDashboard();
        
        // 피킹/포장 버튼 이벤트는 DOM 완전 로드 후 등록
        setTimeout(() => {
            this.setupPickingPackagingEvents();
            // this.setupDebugFunctions(); // 현재 비활성화
            this.setupSettingsEventListeners();
            
            // 상품 검색 기능 초기화
            console.log('🚀 initProductSearch 호출 시작...');
            this.initProductSearch();
            console.log('✅ initProductSearch 호출 완료');
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
        console.log('🔗 setupEventListeners 함수 시작!'); // 👈 이 로그 추가
        
        // 이벤트 리스너 중복 등록 방지
        if (this.eventListenersSetup) {
            console.log('⚠️ 이벤트 리스너가 이미 설정됨 - 중복 등록 방지');
            return;
        }
        this.eventListenersSetup = true;
        
        console.log('🔗 이벤트 리스너 설정 시작...');
        
        // 기존 이벤트 리스너 제거 (안전장치) - 현재는 제거하지 않음
        // this.removeAllEventListeners();
        
        // 데스크톱 탭 버튼 이벤트
        const tabButtons = document.querySelectorAll('.tab-button');
        console.log('🔍 탭 버튼 개수:', tabButtons.length);
        
        tabButtons.forEach((button, index) => {
            console.log(`🔍 탭 버튼 ${index}:`, button.id, button.textContent);
            button.addEventListener('click', async (e) => {
                const tabId = e.target.id;
                console.log('🖱️ 탭 클릭됨:', tabId);
                
                // 대시보드 권한 체크 제거됨 (로컬 모드)
                
                this.switchTab(tabId);
            });
        });

        // 모바일 탭 버튼 이벤트
        document.querySelectorAll('.mobile-tab-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabId = e.currentTarget.id.replace('mobile-', '');
                
                // 대시보드 권한 체크 제거됨 (로컬 모드)
                
                this.switchTab(tabId);
            });
        });

        // 주문 등록 버튼
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => {
                if (window.openOrderModal) {
                    window.openOrderModal();
                } else {
                    console.error('openOrderModal 함수를 찾을 수 없습니다.');
                }
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
                // 상품 모달 열기 (features/products/productUI.js에서 구현됨)
                if (window.openProductModal) {
                    window.openProductModal();
                } else {
                    console.error('❌ openProductModal 함수를 찾을 수 없습니다.');
                }
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

        const selectAllProducts = document.getElementById('select-all-farm_products');
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
                // 카테고리 관리 모달 열기 (features/categories/categoryUI.js에서 구현됨)
                if (window.openCategoryModal) {
                    window.openCategoryModal();
                } else {
                    console.error('❌ openCategoryModal 함수를 찾을 수 없습니다.');
                }
            });
        } else {
            console.warn('카테고리 관리 버튼을 찾을 수 없습니다.');
        }

        // 대기자 등록 버튼 (로컬 모드에서는 비활성화)
        const addWaitlistBtn = document.getElementById('add-farm_waitlist-btn');
        if (addWaitlistBtn) {
            addWaitlistBtn.addEventListener('click', () => {
                console.log('🖱️ 대기자 등록 버튼 클릭됨');
                this.openWaitlistModal();
            });
            console.log('✅ 대기자 등록 버튼 이벤트 리스너 등록됨');
        }
        // 로컬 모드에서는 대기자 등록 버튼이 없을 수 있음 (정상)

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
        const selectAllOrders = document.getElementById('select-all-farm_orders');
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
        document.querySelectorAll('.farm_waitlist-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.id.replace('farm_waitlist-status-', '');
                this.filterWaitlistByStatus(status);
                
                // 탭 활성화 상태 업데이트
                document.querySelectorAll('.farm_waitlist-tab-btn').forEach(tab => {
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
                if (window.closeOrderModal) {
                    window.closeOrderModal();
                } else {
                    console.error('closeOrderModal 함수를 찾을 수 없습니다.');
                }
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

        // 상품 모달 닫기
        const closeProductModal = document.getElementById('close-product-modal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => {
                if (window.closeProductModal) {
                    window.closeProductModal();
                } else {
                    console.error('❌ closeProductModal 함수를 찾을 수 없습니다.');
                }
            });
        }

        // 주소 검색 이벤트 리스너 (중복 방지)
        const addressSearchBtn = document.getElementById('customer-form-address-search');
        if (addressSearchBtn) {
            // 기존 이벤트 리스너 제거 후 새로 추가
            addressSearchBtn.replaceWith(addressSearchBtn.cloneNode(true));
            const newAddressSearchBtn = document.getElementById('customer-form-address-search');
            
            newAddressSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 주소 검색 버튼 클릭됨');
                this.openAddressSearch();
            });
            
            console.log('✅ 주소 검색 이벤트 리스너 등록 완료');
        }

        // 전화번호 실시간 중복 확인
        const phoneInput = document.getElementById('customer-form-phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.checkPhoneDuplicate();
            });
            
            phoneInput.addEventListener('input', () => {
                // 입력 중일 때는 중복 확인 메시지 숨기기
                this.hidePhoneDuplicateMessage();
            });
            
            console.log('✅ 전화번호 실시간 중복 확인 이벤트 등록 완료');
        }
        
        // QR코드 생성 기능 초기화
        this.initQRCodeGeneration();
        
        // 상품 검색 기능 초기화
        this.initProductSearch();
    }

    // ===== 배송 관련 함수들 =====
    
    // 송장번호 일괄입력 모달 열기
    openTrackingImportModal() {
        if (window.shippingUI) {
            window.shippingUI.openTrackingImportModal();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 송장번호 일괄입력 모달 닫기
    closeTrackingImportModal() {
        if (window.shippingUI) {
            window.shippingUI.closeTrackingImportModal();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 송장번호 일괄 적용
    importTrackingNumbers() {
        if (window.shippingUI) {
            window.shippingUI.importTrackingNumbers();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 업로드 방식 전환
    switchUploadMethod(method) {
        if (window.shippingUI) {
            window.shippingUI.switchUploadMethod(method);
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 엑셀 파일 업로드 처리
    handleExcelFileUpload(event) {
        if (window.shippingUI) {
            window.shippingUI.handleExcelFileUpload(event);
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 배송 주문 로드
    async loadShippingOrders() {
        if (window.shippingUI) {
            return await window.shippingUI.renderShippingOrders();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
            return [];
        }
    }

    // 로젠택배용 데이터 내보내기
    exportShippingToLogen() {
        if (window.shippingUI) {
            window.shippingUI.exportToLogen();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 전체 배송 데이터 빠른 내보내기
    quickExportAllShipping() {
        if (window.shippingUI) {
            window.shippingUI.quickExportAll();
        } else {
            console.error('❌ shippingUI를 찾을 수 없습니다');
        }
    }

    // 모달용 빠른 카테고리 추가 입력 필드 표시
    showModalQuickCategoryInput() {
        const inputContainer = document.getElementById('modal-new-category-input');
        if (inputContainer) {
            inputContainer.classList.remove('hidden');
            const nameInput = document.getElementById('modal-quick-category-name');
            if (nameInput) {
                nameInput.focus();
            }
        }
    }

    // 모달용 빠른 카테고리 추가 입력 필드 숨김
    hideModalQuickCategoryInput() {
        const inputContainer = document.getElementById('modal-new-category-input');
        if (inputContainer) {
            inputContainer.classList.add('hidden');
            const nameInput = document.getElementById('modal-quick-category-name');
            if (nameInput) {
                nameInput.value = '';
            }
        }
    }

    // 모달용 빠른 카테고리 추가 저장
    async saveModalQuickCategory() {
        try {
            const nameInput = document.getElementById('modal-quick-category-name');
            const colorSelect = document.getElementById('modal-quick-category-color');
            
            if (!nameInput || !colorSelect) {
                console.error('카테고리 입력 필드를 찾을 수 없습니다.');
                return;
            }
            
            const categoryData = {
                name: nameInput.value.trim(),
                color: colorSelect.value
            };
            
            if (!categoryData.name) {
                alert('카테고리명을 입력해주세요.');
                nameInput.focus();
                return;
            }
            
            if (window.categoryDataManager) {
                await window.categoryDataManager.addCategory(categoryData);
                
                // 입력 필드 초기화
                nameInput.value = '';
                colorSelect.value = 'bg-gray-100 text-gray-800';
                
                // 카테고리 드롭다운 업데이트
                if (window.updateCategoryDropdown) {
                    window.updateCategoryDropdown();
                }
                
                // 입력 필드 숨김
                this.hideModalQuickCategoryInput();
                
                alert('✅ 카테고리가 추가되었습니다!');
                
            } else {
                console.error('categoryDataManager를 찾을 수 없습니다.');
            }
            
        } catch (error) {
            console.error('빠른 카테고리 추가 실패:', error);
            alert(`❌ 카테고리 추가 실패: ${error.message}`);
        }
    }

    // 모달 수익률 계산
    calculateModalProfitMargin() {
        try {
            const wholesalePriceInput = document.getElementById('product-form-wholesale-price');
            const priceInput = document.getElementById('product-form-price');
            const marginDisplay = document.getElementById('modal-profit-margin');
            
            if (!wholesalePriceInput || !priceInput || !marginDisplay) {
                return;
            }
            
            const wholesalePrice = parseFloat(wholesalePriceInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            
            if (wholesalePrice > 0 && price > 0) {
                const profit = price - wholesalePrice;
                const margin = (profit / price) * 100;
                
                if (margin > 0) {
                    marginDisplay.innerHTML = `
                        <span class="text-green-600 font-medium">
                            수익: ${profit.toLocaleString()}원 (${margin.toFixed(1)}%)
                        </span>
                    `;
                } else if (margin < 0) {
                    marginDisplay.innerHTML = `
                        <span class="text-red-600 font-medium">
                            손실: ${Math.abs(profit).toLocaleString()}원 (${Math.abs(margin).toFixed(1)}%)
                        </span>
                    `;
                } else {
                    marginDisplay.innerHTML = `
                        <span class="text-gray-500">
                            수익 없음 (0%)
                        </span>
                    `;
                }
            } else {
                marginDisplay.innerHTML = '';
            }
            
        } catch (error) {
            console.error('수익률 계산 실패:', error);
        }
    }

    // QR코드 생성 기능 초기화
    initQRCodeGeneration() {
        try {
            console.log('🔧 QR코드 생성 기능 초기화 시작...');
            
            const generateBtn = document.getElementById('generate-qr-btn');
            const downloadBtn = document.getElementById('download-qr-btn');
            const printBtn = document.getElementById('print-qr-btn');
            const qrPreview = document.getElementById('qr-preview');
            const qrCustomText = document.getElementById('qr-custom-text');
            const qrTypeRadios = document.querySelectorAll('input[name="qr-type"]');

            console.log('QR 버튼들:', {
                generateBtn,
                downloadBtn,
                printBtn,
                qrPreview,
                qrCustomText,
                qrTypeRadios: qrTypeRadios.length
            });

            if (!generateBtn) {
                console.error('❌ QR코드 생성 버튼을 찾을 수 없습니다.');
                return;
            }
            
            if (!qrPreview) {
                console.error('❌ QR코드 미리보기 영역을 찾을 수 없습니다.');
                return;
            }

            // 기존 이벤트 리스너 제거 (중복 방지)
            const newGenerateBtn = generateBtn.cloneNode(true);
            generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);

            // QR코드 타입 변경 이벤트
            qrTypeRadios.forEach((radio, index) => {
                console.log(`QR 타입 라디오 ${index} 설정:`, radio);
                radio.addEventListener('change', () => {
                    console.log('QR 타입 변경:', radio.value);
                    if (radio.value === 'custom' && qrCustomText) {
                        qrCustomText.classList.remove('hidden');
                    } else if (qrCustomText) {
                        qrCustomText.classList.add('hidden');
                    }
                });
            });

            // QR코드 생성 버튼 이벤트 (강화된 버전)
            newGenerateBtn.addEventListener('click', (e) => {
                console.log('🔘 QR코드 생성 버튼 클릭됨!');
                e.preventDefault();
                e.stopPropagation();
                this.generateQRCode();
            });

            // 다운로드 버튼 이벤트
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    console.log('🔘 QR코드 다운로드 버튼 클릭됨!');
                    e.preventDefault();
                    this.downloadQRCode();
                });
            }

            // 프린트 버튼 이벤트
            if (printBtn) {
                printBtn.addEventListener('click', (e) => {
                    console.log('🔘 QR코드 프린트 버튼 클릭됨!');
                    e.preventDefault();
                    this.printQRCode();
                });
            }

            console.log('✅ QR코드 생성 기능 초기화 완료');
        } catch (error) {
            console.error('❌ QR코드 생성 기능 초기화 실패:', error);
        }
    }

    // QR코드 생성
    generateQRCode() {
        try {
            console.log('🔍 QR코드 생성 시작...');
            
            const qrType = document.querySelector('input[name="qr-type"]:checked')?.value;
            const qrCustomText = document.getElementById('qr-custom-text')?.value;
            const qrPreview = document.getElementById('qr-preview');
            const downloadBtn = document.getElementById('download-qr-btn');
            const printBtn = document.getElementById('print-qr-btn');

            console.log('QR 타입:', qrType);
            console.log('QR 미리보기 요소:', qrPreview);

            if (!qrPreview) {
                console.error('QR코드 미리보기 영역을 찾을 수 없습니다.');
                return;
            }

            let qrText = '';

            // QR코드 내용 결정
            switch (qrType) {
                case 'product-info':
                    const name = document.getElementById('product-form-name')?.value || '';
                    const price = document.getElementById('product-form-price')?.value || '';
                    qrText = `상품명: ${name}\n판매가: ${price}원`;
                    break;
                case 'product-url':
                    qrText = window.location.href;
                    break;
                case 'custom':
                    qrText = qrCustomText || '';
                    break;
                default:
                    qrText = 'QR코드 내용이 없습니다.';
            }

            console.log('QR 텍스트:', qrText);

            if (!qrText.trim()) {
                alert('QR코드에 포함할 내용을 입력해주세요.');
                return;
            }

            // QR코드 생성 (간단한 텍스트 기반 QR코드)
            this.createTextBasedQR(qrText, qrPreview);

            // 다운로드/프린트 버튼 표시
            if (downloadBtn) downloadBtn.classList.remove('hidden');
            if (printBtn) printBtn.classList.remove('hidden');

            console.log('✅ QR코드 생성 완료:', qrText);
        } catch (error) {
            console.error('❌ QR코드 생성 실패:', error);
            alert('QR코드 생성에 실패했습니다.');
        }
    }

    // 텍스트 기반 QR코드 생성 (간단한 구현)
    createTextBasedQR(text, container) {
        try {
            console.log('🎨 QR코드 Canvas 생성 시작...');
            console.log('텍스트:', text);
            console.log('컨테이너:', container);
            
            // 기존 내용 제거
            container.innerHTML = '';

            // QR코드 생성 (Canvas 사용)
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            canvas.className = 'w-full h-full border border-blue-300 rounded';
            
            console.log('Canvas 생성됨:', canvas);
            
            const ctx = canvas.getContext('2d');
            console.log('Canvas context:', ctx);
            
            // 배경
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 200, 200);
            
            // 간단한 QR코드 패턴 생성 (의사 QR코드)
            ctx.fillStyle = '#000000';
            const cellSize = 8;
            const margin = 20;
            
            // 모서리 마커
            this.drawQRMarker(ctx, margin, margin, cellSize);
            this.drawQRMarker(ctx, 200 - margin - 5 * cellSize, margin, cellSize);
            this.drawQRMarker(ctx, margin, 200 - margin - 5 * cellSize, cellSize);
            
            // 데이터 패턴 (텍스트 기반)
            const textData = text.split('');
            for (let i = 0; i < textData.length && i < 50; i++) {
                const x = margin + 7 * cellSize + (i % 10) * cellSize;
                const y = margin + 7 * cellSize + Math.floor(i / 10) * cellSize;
                
                if (x < 200 - margin && y < 200 - margin) {
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
            
            // 중앙에 텍스트 표시
            ctx.fillStyle = '#0066cc';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR', 100, 100);
            ctx.fillText('Code', 100, 115);
            
            console.log('Canvas를 컨테이너에 추가 중...');
            container.appendChild(canvas);
            console.log('Canvas 추가 완료');

            // QR코드 데이터 저장 (다운로드/프린트용)
            this.currentQRData = {
                text: text,
                timestamp: new Date().toISOString(),
                canvas: canvas
            };

            console.log('✅ QR코드 생성 완료:', text);
            console.log('QR 데이터:', this.currentQRData);
        } catch (error) {
            console.error('텍스트 기반 QR코드 생성 실패:', error);
            
            // 폴백: 간단한 텍스트 표시
            const qrDiv = document.createElement('div');
            qrDiv.className = 'w-full h-full flex flex-col items-center justify-center bg-white border-2 border-blue-300 rounded p-2';
            qrDiv.innerHTML = `
                <div class="text-xs text-blue-600 font-bold mb-1">QR코드</div>
                <div class="text-xs text-gray-700 text-center break-all">${text}</div>
                <div class="text-xs text-gray-500 mt-1">생성됨</div>
            `;
            container.appendChild(qrDiv);
        }
    }

    // QR코드 마커 그리기
    drawQRMarker(ctx, x, y, cellSize) {
        ctx.fillStyle = '#000000';
        // 외부 사각형
        ctx.fillRect(x, y, 5 * cellSize, 5 * cellSize);
        // 내부 흰색 사각형
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + cellSize, y + cellSize, 3 * cellSize, 3 * cellSize);
        // 중앙 검은색 사각형
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, cellSize, cellSize);
    }

    // QR코드 다운로드
    downloadQRCode() {
        try {
            if (!this.currentQRData) {
                alert('다운로드할 QR코드가 없습니다.');
                return;
            }

            // Canvas가 있으면 이미지로 다운로드
            if (this.currentQRData.canvas) {
                const canvas = this.currentQRData.canvas;
                const link = document.createElement('a');
                link.download = `qr-code-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('QR코드 이미지 다운로드 완료');
            } else {
                // 폴백: 텍스트 파일로 다운로드
                const content = `QR코드 데이터\n생성일: ${this.currentQRData.timestamp}\n내용: ${this.currentQRData.text}`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `qr-code-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('QR코드 텍스트 다운로드 완료');
            }
        } catch (error) {
            console.error('QR코드 다운로드 실패:', error);
            alert('다운로드에 실패했습니다.');
        }
    }

    // QR코드 프린트
    printQRCode() {
        try {
            if (!this.currentQRData) {
                alert('프린트할 QR코드가 없습니다.');
                return;
            }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR코드 프린트</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                            .qr-content { border: 2px solid #333; padding: 20px; margin: 20px; display: inline-block; }
                        </style>
                    </head>
                    <body>
                        <h2>QR코드</h2>
                        <div class="qr-content">
                            <div>생성일: ${this.currentQRData.timestamp}</div>
                            <div>내용: ${this.currentQRData.text}</div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();

            console.log('QR코드 프린트 완료');
        } catch (error) {
            console.error('QR코드 프린트 실패:', error);
            alert('프린트에 실패했습니다.');
        }
    }

    // 상품 모달 열기
    openProductModal(productId = null) {
        try {
            console.log('상품 모달 열기:', productId);
            
            if (window.openProductModal) {
                window.openProductModal(productId);
            } else {
                console.error('window.openProductModal 함수를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('상품 모달 열기 실패:', error);
        }
    }

    // 주문 관련 함수들은 features/orders/orderUI.js로 이동됨

    // 상품 검색 기능 초기화
    initProductSearch() {
        try {
            console.log('🔍 상품 검색 기능 초기화 시작...');
            
            const searchInput = document.getElementById('product-management-search');
            const categoryFilter = document.getElementById('category-filter');
            const productSort = document.getElementById('product-sort');
            const resetBtn = document.getElementById('reset-product-search');

            console.log('🔍 DOM 요소 확인:');
            console.log('- searchInput:', searchInput);
            console.log('- categoryFilter:', categoryFilter);
            console.log('- productSort:', productSort);
            console.log('- resetBtn:', resetBtn);

            if (!searchInput) {
                console.log('상품 검색 입력창을 찾을 수 없습니다.');
                return;
            }

            // 검색 입력 이벤트 (실시간)
            console.log('✅ 검색 입력 이벤트 리스너 등록');
            searchInput.addEventListener('input', (e) => {
                console.log('🔍 검색 입력 이벤트 발생:', e.target.value);
                this.handleProductSearch(e.target.value);
            });

            // 엔터키 검색 이벤트
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleProductSearch(e.target.value);
                    console.log('🔍 엔터키로 상품 검색 실행');
                }
            });


            // 카테고리 필터 이벤트
            if (categoryFilter) {
                console.log('✅ 카테고리 필터 이벤트 리스너 등록');
                categoryFilter.addEventListener('change', (e) => {
                    console.log('🔍 카테고리 필터 변경:', e.target.value);
                    this.handleProductFilter();
                });
            } else {
                console.log('❌ 카테고리 필터 요소를 찾을 수 없습니다.');
            }

            // 정렬 이벤트
            if (productSort) {
                productSort.addEventListener('change', (e) => {
                    this.handleProductSort();
                });
            }

            // 리셋 버튼 이벤트
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetProductSearch();
                });
            }

            // 카테고리 필터 옵션 초기화
            this.initCategoryFilter();
            
            // 페이지네이션 기능 초기화
            this.initPagination();
            
            // 정렬 기능 초기화
            this.initProductSort();
            
            console.log('✅ 상품 검색 기능 초기화 완료');
            
            // 필터 요소 테스트
            this.testFilterElements();
            
        } catch (error) {
            console.error('❌ 상품 검색 기능 초기화 실패:', error);
        }
    }

    // 필터 요소 테스트
    testFilterElements() {
        console.log('🧪 필터 요소 테스트 시작...');
        
        const elements = {
            'product-management-search': document.getElementById('product-management-search'),
            'category-filter': document.getElementById('category-filter'),
            'product-sort': document.getElementById('product-sort'),
            'reset-product-search': document.getElementById('reset-product-search')
        };
        
        Object.entries(elements).forEach(([id, element]) => {
            if (element) {
                console.log(`✅ ${id}: 요소 존재`);
            } else {
                console.log(`❌ ${id}: 요소 없음`);
            }
        });
        
        // 간단한 이벤트 테스트
        const searchInput = elements['product-management-search'];
        if (searchInput) {
            console.log('🧪 검색 입력 테스트...');
            searchInput.value = '테스트';
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    // 상품 검색 처리
    handleProductSearch(query) {
        try {
            console.log('🔍 handleProductSearch 호출됨:', query);
            console.log('🔍 productDataManager 상태:', window.productDataManager);
            
            if (!window.productDataManager) {
                console.error('❌ productDataManager를 찾을 수 없습니다.');
                return;
            }

            // 검색 실행
            const searchResults = window.productDataManager.searchProducts(query);
            
            // 테이블 업데이트
            this.updateProductsTable(searchResults);
            
            // 검색 결과 카운트 업데이트
            this.updateSearchResultCount(searchResults.length);
            
        } catch (error) {
            console.error('상품 검색 실패:', error);
        }
    }

    // 상품 필터 처리
    handleProductFilter() {
        try {
            console.log('🔍 상품 필터 처리 시작...');
            
            // 페이지네이션과 함께 테이블 업데이트 (모든 필터 고려)
            this.updateProductsTableWithPagination();
            
        } catch (error) {
            console.error('상품 필터 실패:', error);
        }
    }

    // 상품 정렬 처리
    handleProductSort() {
        try {
            const productSort = document.getElementById('product-sort');
            const searchInput = document.getElementById('product-management-search');
            const categoryFilter = document.getElementById('category-filter');
            
            if (!productSort || !window.productDataManager) {
                return;
            }

            const sortBy = productSort.value;
            const searchQuery = searchInput ? searchInput.value : '';
            const selectedCategory = categoryFilter ? categoryFilter.value : '';
            
            console.log('🔍 상품 정렬:', sortBy);
            
            let products = window.productDataManager.getAllProducts();
            
            // 검색어가 있으면 먼저 검색
            if (searchQuery.trim()) {
                products = window.productDataManager.searchProducts(searchQuery);
            }
            
            // 카테고리 필터 적용
            if (selectedCategory && selectedCategory !== '') {
                products = products.filter(product => 
                    product.category === selectedCategory
                );
            }
            
            // 정렬 적용
            const sortedProducts = window.productDataManager.sortProducts(products, sortBy);
            
            // 페이지네이션과 함께 테이블 업데이트
            this.updateProductsTableWithPagination();
            
        } catch (error) {
            console.error('상품 정렬 실패:', error);
        }
    }

    // 검색 리셋
    resetProductSearch() {
        try {
            console.log('🔄 상품 검색 리셋');
            
            const searchInput = document.getElementById('product-management-search');
            const categoryFilter = document.getElementById('category-filter');
            const productSort = document.getElementById('product-sort');
            
            // 입력 필드 초기화
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (productSort) productSort.value = 'newest';
            
            // 페이지네이션과 함께 전체 상품 표시
            if (window.productDataManager) {
                this.updateProductsTableWithPagination();
            }
            
        } catch (error) {
            console.error('검색 리셋 실패:', error);
        }
    }

    // 상품 테이블 업데이트
    updateProductsTable(products) {
        try {
            if (window.renderProductsTable) {
                // 임시로 전체 상품을 필터링된 상품으로 교체
                const originalProducts = window.productDataManager.farm_products;
                window.productDataManager.farm_products = products;
                
                // 테이블 렌더링
                window.renderProductsTable();
                
                // 원래 데이터 복원
                window.productDataManager.farm_products = originalProducts;
            }
        } catch (error) {
            console.error('상품 테이블 업데이트 실패:', error);
        }
    }

    // 검색 결과 카운트 업데이트
    updateSearchResultCount(count) {
        try {
            const countInfo = document.getElementById('products-count-info');
            if (countInfo) {
                countInfo.textContent = `검색 결과: ${count}개 상품`;
            }
        } catch (error) {
            console.error('검색 결과 카운트 업데이트 실패:', error);
        }
    }

    // 카테고리 필터 옵션 초기화
    initCategoryFilter() {
        try {
            console.log('🏷️ 카테고리 필터 옵션 초기화 시작...');
            
            const categoryFilter = document.getElementById('category-filter');
            if (!categoryFilter) {
                console.log('카테고리 필터를 찾을 수 없습니다.');
                return;
            }

            // 기존 옵션 제거 (첫 번째 옵션 제외)
            while (categoryFilter.children.length > 1) {
                categoryFilter.removeChild(categoryFilter.lastChild);
            }

            // 카테고리 데이터 로드
            if (window.categoryDataManager) {
                const categories = window.categoryDataManager.getAllCategories();
                console.log(`카테고리 ${categories.length}개 로드됨`);
                
                // 카테고리 옵션 추가
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    option.className = category.color || '';
                    categoryFilter.appendChild(option);
                });
                
                console.log('✅ 카테고리 필터 옵션 초기화 완료');
            } else {
                console.log('categoryDataManager를 찾을 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 카테고리 필터 옵션 초기화 실패:', error);
        }
    }

    // 페이지네이션 기능 초기화
    initPagination() {
        try {
            console.log('📄 페이지네이션 기능 초기화 시작...');
            
            const productsPerPageSelect = document.getElementById('products-per-page');
            
            if (!productsPerPageSelect) {
                console.log('페이지당 표시 드롭다운을 찾을 수 없습니다.');
                return;
            }

            // 페이지당 표시 변경 이벤트
            productsPerPageSelect.addEventListener('change', (e) => {
                this.handleProductsPerPageChange(e.target.value);
            });

            console.log('✅ 페이지네이션 기능 초기화 완료');
        } catch (error) {
            console.error('❌ 페이지네이션 기능 초기화 실패:', error);
        }
    }

    // 상품 정렬 기능 초기화
    initProductSort() {
        try {
            console.log('📊 상품 정렬 기능 초기화 시작...');
            
            const productSort = document.getElementById('product-sort');
            
            if (!productSort) {
                console.log('상품 정렬 드롭다운을 찾을 수 없습니다.');
                return;
            }

            // 정렬 변경 이벤트
            productSort.addEventListener('change', (e) => {
                this.handleProductSort();
            });

            console.log('✅ 상품 정렬 기능 초기화 완료');
        } catch (error) {
            console.error('❌ 상품 정렬 기능 초기화 실패:', error);
        }
    }

    // 페이지당 표시 변경 처리
    handleProductsPerPageChange(perPage) {
        try {
            console.log('📄 페이지당 표시 변경:', perPage);
            
            if (!window.productDataManager) {
                console.error('productDataManager를 찾을 수 없습니다.');
                return;
            }

            // 페이지당 표시 수 설정
            if (perPage === 'all') {
                this.farm_productsPerPage = null; // 전체 표시
            } else {
                this.farm_productsPerPage = parseInt(perPage) || 20;
            }

            // 현재 페이지를 1로 리셋
            this.currentProductsPage = 1;

            // 상품 목록 업데이트
            this.updateProductsTableWithPagination();
            
            console.log(`페이지당 표시: ${perPage === 'all' ? '전체' : perPage + '개'}`);
            
        } catch (error) {
            console.error('페이지당 표시 변경 실패:', error);
        }
    }

    // 페이지네이션과 함께 상품 테이블 업데이트
    updateProductsTableWithPagination() {
        try {
            if (!window.productDataManager) {
                return;
            }

            // 검색어와 필터 적용
            const searchInput = document.getElementById('product-management-search');
            const categoryFilter = document.getElementById('category-filter');
            const productSort = document.getElementById('product-sort');
            
            let filteredProducts = window.productDataManager.getAllProducts();
            
            // 검색어 필터 적용
            if (searchInput && searchInput.value.trim()) {
                const searchQuery = searchInput.value.trim().toLowerCase();
                filteredProducts = window.productDataManager.searchProducts(searchQuery);
            }
            
            // 카테고리 필터 적용
            if (categoryFilter && categoryFilter.value && categoryFilter.value !== '') {
                console.log('🔍 카테고리 필터 적용:', categoryFilter.value);
                const beforeCount = filteredProducts.length;
                filteredProducts = filteredProducts.filter(product => 
                    product.category === categoryFilter.value
                );
                console.log(`🔍 카테고리 필터 결과: ${beforeCount}개 → ${filteredProducts.length}개`);
            } else {
                console.log('🔍 카테고리 필터: 전체 표시');
            }
            
            // 정렬 적용
            if (productSort && productSort.value) {
                filteredProducts = window.productDataManager.sortProducts(filteredProducts, productSort.value);
            }
            
            const totalProducts = filteredProducts.length;
            
            // 페이지네이션 적용
            let displayProducts = filteredProducts;
            let totalPages = 1;
            
            if (this.farm_productsPerPage && this.farm_productsPerPage > 0) {
                totalPages = Math.ceil(totalProducts / this.farm_productsPerPage);
                const startIndex = (this.currentProductsPage - 1) * this.farm_productsPerPage;
                const endIndex = startIndex + this.farm_productsPerPage;
                displayProducts = filteredProducts.slice(startIndex, endIndex);
            }

            // 테이블 업데이트
            this.updateProductsTable(displayProducts);
            
            // 페이지네이션 UI 업데이트
            this.updatePaginationUI(totalPages, totalProducts);
            
        } catch (error) {
            console.error('페이지네이션 테이블 업데이트 실패:', error);
        }
    }

    // 페이지네이션 UI 업데이트
    updatePaginationUI(totalPages, totalProducts) {
        try {
            const paginationContainer = document.getElementById('products-pagination');
            const countInfo = document.getElementById('products-count-info');
            
            if (!paginationContainer) {
                return;
            }

            // 페이지 정보 업데이트
            if (countInfo) {
                const startItem = this.farm_productsPerPage ? 
                    (this.currentProductsPage - 1) * this.farm_productsPerPage + 1 : 1;
                const endItem = this.farm_productsPerPage ? 
                    Math.min(this.currentProductsPage * this.farm_productsPerPage, totalProducts) : totalProducts;
                
                countInfo.textContent = `전체 ${totalProducts}개 중 ${startItem}-${endItem}개 표시`;
            }

            // 페이지네이션 버튼 생성
            paginationContainer.innerHTML = '';
            
            if (totalPages <= 1) {
                return; // 페이지네이션이 필요 없음
            }

            // 이전 버튼
            const prevBtn = document.createElement('button');
            prevBtn.className = 'px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';
            prevBtn.textContent = '이전';
            prevBtn.disabled = this.currentProductsPage <= 1;
            prevBtn.addEventListener('click', () => {
                if (this.currentProductsPage > 1) {
                    this.currentProductsPage--;
                    this.updateProductsTableWithPagination();
                }
            });
            paginationContainer.appendChild(prevBtn);

            // 페이지 번호 버튼들
            const startPage = Math.max(1, this.currentProductsPage - 2);
            const endPage = Math.min(totalPages, this.currentProductsPage + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 ${
                    i === this.currentProductsPage ? 'bg-blue-500 text-white' : ''
                }`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.currentProductsPage = i;
                    this.updateProductsTableWithPagination();
                });
                paginationContainer.appendChild(pageBtn);
            }

            // 다음 버튼
            const nextBtn = document.createElement('button');
            nextBtn.className = 'px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';
            nextBtn.textContent = '다음';
            nextBtn.disabled = this.currentProductsPage >= totalPages;
            nextBtn.addEventListener('click', () => {
                if (this.currentProductsPage < totalPages) {
                    this.currentProductsPage++;
                    this.updateProductsTableWithPagination();
                }
            });
            paginationContainer.appendChild(nextBtn);
            
        } catch (error) {
            console.error('페이지네이션 UI 업데이트 실패:', error);
        }
    }
}

// OrderManagementSystem 클래스 export
export { OrderManagementSystem };
