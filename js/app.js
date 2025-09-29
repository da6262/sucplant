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
        window.orderSystem.loadProducts();
        window.orderSystem.loadCategories();
        
        console.log('✅ 테스트 데이터 초기화 완료!');
    } else {
        console.error('❌ orderSystem이 초기화되지 않았습니다!');
    }
}

// 테이블 매핑 함수는 utils/helpers.js로 이동됨

// CRUD 작업은 services/supabaseService.js로 이동됨

// LocalStorage 키 생성 함수는 utils/helpers.js로 이동됨

// 초기 동기화는 services/supabaseService.js로 이동됨

// Realtime 구독은 services/supabaseService.js로 이동됨

// LocalStorage 헬퍼 함수들은 utils/helpers.js로 이동됨

// 경산다육식물농장 관리시스템
class OrderManagementSystem {
    constructor() {
        this.farm_orders = [];
        // this.farm_customers = []; // features/customers/customerData.js로 이동됨
        this.farm_products = [];
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
        // 현재 도메인에 따라 API URL 결정
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        const pathname = window.location.pathname;
        
        console.log(`🌐 현재 호스트: ${hostname}, 프로토콜: ${protocol}, 포트: ${port}, 패스: ${pathname}`);
        
        if (hostname.includes('genspark.ai')) {
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
        document.getElementById('customer-id').value = '';

        if (customerId) {
            // --- 수정 모드 (나중에 구현) ---
            modalTitle.textContent = '고객 정보 수정';
            // TODO: 고객 정보를 불러와 폼을 채우는 코드 추가
        } else {
            // --- 신규 등록 모드 ---
            modalTitle.textContent = '새 고객 등록';
        }

        // 모달 열기
        modal.classList.remove('hidden');

        // TODO: 여기에 '저장' 버튼의 이벤트 리스너를 추가할 겁니다!
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
                        this.switchTab('tab-farm_orders'); // 다른 탭으로 돌려보내기
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
                        this.switchTab('tab-farm_orders'); // 다른 탭으로 돌려보내기
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
                this.openCategoryModal();
            });
        } else {
            console.warn('카테고리 관리 버튼을 찾을 수 없습니다.');
        }

        // 대기자 등록 버튼
        const addWaitlistBtn = document.getElementById('add-farm_waitlist-btn');
        console.log('🔍 대기자 등록 버튼 확인:', !!addWaitlistBtn);
        if (addWaitlistBtn) {
            addWaitlistBtn.addEventListener('click', () => {
                console.log('🖱️ 대기자 등록 버튼 클릭됨');
                this.openWaitlistModal();
            });
            console.log('✅ 대기자 등록 버튼 이벤트 리스너 등록됨');
        } else {
            console.warn('⚠️ add-farm_waitlist-btn 요소를 찾을 수 없습니다');
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
    }
}
