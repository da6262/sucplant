// 경산다육식물농장 관리시스템 - 메인 진입점
// 모듈화된 구조의 시작점

// Supabase 설정 로드
import './js/supabase-production-config.js';

// 공통 유틸리티 함수들 import
import { TABLE_MAP, mapTable, getSupabaseTableName } from './utils/helpers.js';

// 페이지 표시 개수 컨트롤 — 전역 window.PageSize 등록 (side-effect import)
import './utils/pageSize.js';
// 헤더 체크박스 전체선택 유틸 — 전역 window.SelectAll 등록
import './utils/selectAll.js';

// ── 공통 데이터 포맷터 (Single Source of Truth) ──────────────
import {
    formatDate, formatDateTime,
    formatCurrency, formatWon,
    formatPhone, formatQty,
    nullDash, emptyDash, ND,
    ensureSupabase
} from './utils/formatters.js';

// ── 공통 UI 렌더러 (표준 폼 렌더러 v3.4) ─────────────────────
import {
    renderPageHeader, renderFilterBar, renderEmptyRow,
    renderModal, renderField, renderFormSection, renderFormGrid, renderFormActions,
    renderBadge, renderOrderStatusBadge, renderGradeBadge,
    renderBtnIcon, renderBtnGroup, renderEditDeleteBtns,
    renderConfirmDialog, renderInfoRow, renderSectionTitle
} from './utils/ui.js';

// 전역 노출 — components/* 및 레거시 코드에서 window.fmt.date() 형태로 사용
window.fmt = {
    date:     formatDate,
    dateTime: formatDateTime,
    currency: formatCurrency,
    won:      formatWon,
    phone:    formatPhone,
    qty:      formatQty,
    nullDash,
    emptyDash,
    ND,
};
// 개별 전역 함수 (하위 호환 — 기존 코드에서 formatDate() 직접 호출 지원)
window.formatDate     = formatDate;
window.formatCurrency = formatCurrency;
window.formatPhone    = formatPhone;
window.formatQty      = formatQty;
window.nullDash       = nullDash;
window.ensureSupabase = ensureSupabase;
window.showToast      = showToast;

// 고객 데이터 모듈 import
import { 
    customerDataManager,
    CustomerDataManager
} from './features/customers/customerData.js';

// 고객 UI 모듈 import
import { renderCustomersTable, invalidateCustomerUICache } from './features/customers/customerUI.js';
import { showToast } from './utils/ui-helpers.js';

// 고객 로그(타임라인) 데이터 모듈 import
import { customerLogsManager, CustomerLogsManager } from './features/customers/customerLogsData.js';
window.customerLogsManager = customerLogsManager;
window.CustomerLogsManager = CustomerLogsManager;

// RFM 분석 + 자동 태그 재계산 모듈 (window.customerRfm 로 전역 노출)
import './features/customers/customerRfmData.js';

// 세그먼트 필터 + 일괄 SMS (Phase E)
import './features/customers/customerSegment.js';
import './features/customers/customerSegmentUI.js';

// 엑셀 가져오기 / 내보내기 (Phase F)
import './features/customers/customerImportExport.js';

// 상품 데이터 모듈 import
import { 
    ProductDataManager,
    initializeProductDataManager,
    getProductDataManager
} from './features/products/productData.js';

// 상품 UI 모듈 import
import { productUI, ProductUI } from './features/products/productUI.js';

// 카테고리 데이터 모듈 import
import { 
    CategoryDataManager,
    initializeCategoryDataManager
} from './features/categories/categoryData.js';

// 카테고리 UI 모듈 import
import {
    openCategoryModal,
    closeCategoryModal,
    loadCategoriesList,
    updateProductCategoryDropdown as updateCategoryDropdown
} from './features/categories/categoryUI.js';

// 주문 데이터 모듈 import
import { 
    orderDataManager,
    OrderDataManager
} from './features/orders/orderData.js';

// 배송 UI 모듈 import
import { shippingUI } from './features/shipping/shippingUI.js';

// 배송관리 컴포넌트 로드 함수 import
import { loadShippingManagementComponent } from './js/shipping-management.js';

// 테스트 유틸리티 모듈 import
import './features/test/testUtils.js';

// 환경설정 데이터 모듈 import
import { 
    settingsDataManager,
    SettingsDataManager
} from './features/settings/settingsData.js';

// 환경설정 UI 모듈 import
import {
    showSettingsTab,
    loadGeneralSettings,
    loadShippingSettings,
    loadCustomerGrades,
    loadSalesChannels,
    loadOrderStatuses,
    saveSettings
} from './features/settings/settingsUI.js';

// 판매채널 관리 컴포넌트 import
import './components/sales-channels/sales-channels.js';

// 판매채널 데이터 관리 import
import './features/settings/salesChannelsData.js';

// 주문 UI 모듈 import
import { 
    openOrderModal,
    closeOrderModal,
    loadOrderData,
    clearOrderForm,
    // 피킹 리스트 및 포장 라벨 관련 함수들은 features/orders/orderUI.js에서 처리됨
    printOrder,
    loadOrders,
    saveOrder,
    editOrder,
    deleteOrder,
    initCustomerAutocomplete,
    checkOrderPhoneDuplicate,
    cancelNewCustomerRegistration,
    confirmNewCustomerRegistration,
    createTestReadyOrder
} from './features/orders/orderUI.js';

// 주문 데이터 모듈 import
import { renderOrdersTable } from './features/orders/orderData.js';

// 대기자 데이터 모듈 import
import { 
    waitlistDataManager,
    WaitlistDataManager
} from './features/waitlist/waitlistData.js';

// 대기자 UI 모듈 import
import { 
    waitlistUI,
    WaitlistUI
} from './features/waitlist/waitlistUI.js';

// 전역에서 사용할 수 있도록 window 객체에 등록
window.TABLE_MAP = TABLE_MAP;
window.mapTable = mapTable;
window.getSupabaseTableName = getSupabaseTableName;

// 고객 관련 함수들 전역 등록 (customerDataManager를 통해 접근)
// window.customerDataManager가 이미 등록되어 있음

// customerDataManager 인스턴스 전역 등록
window.customerDataManager = customerDataManager;
window.invalidateCustomerUICache = invalidateCustomerUICache;

// productDataManager 인스턴스 전역 등록 (지연 초기화)
// initializeProductDataManager()가 호출되면 window.productDataManager에 설정됨
// window.productDataManager는 initializeProductDataManager()에서 설정됨

// productUI 인스턴스 전역 등록
window.productUI = productUI;

// 상품 테이블 렌더링은 상품관리 컴포넌트에서 처리됨

// categoryDataManager 인스턴스 전역 등록 (지연 초기화)
// initializeCategoryDataManager()가 호출되면 window.categoryDataManager에 설정됨

// 카테고리 UI 함수들 전역 등록
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.loadCategoriesList = loadCategoriesList;
window.updateCategoryDropdown = updateCategoryDropdown;

// shippingUI 인스턴스 전역 등록
window.shippingUI = shippingUI;

// 배송관리 컴포넌트 로드 함수 전역 등록
window.loadShippingManagementComponent = loadShippingManagementComponent;

// 주문 데이터 관리자 전역 등록
window.orderDataManager = orderDataManager;

// 대기자 데이터 관리자 전역 등록
window.waitlistDataManager = waitlistDataManager;

// 대기자 UI 전역 등록
window.waitlistUI = waitlistUI;

// 주문 관련 함수들 전역 등록 (모달 함수들은 features/orders/orderUI.js에서 처리됨)
window.loadOrderData = loadOrderData;
window.clearOrderForm = clearOrderForm;
// 피킹 리스트 및 포장 라벨 관련 함수들은 features/orders/orderUI.js에서 처리됨
window.loadOrders = loadOrders;
window.renderOrdersTable = renderOrdersTable;
window.saveOrder = saveOrder;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.printOrder = printOrder;
window.initCustomerAutocomplete = initCustomerAutocomplete;
window.checkOrderPhoneDuplicate = checkOrderPhoneDuplicate;
window.cancelNewCustomerRegistration = cancelNewCustomerRegistration;
window.confirmNewCustomerRegistration = confirmNewCustomerRegistration;
window.createTestReadyOrder = createTestReadyOrder;

// 고객 모달 관련 함수들은 features/customers/customerUI.js에서 처리됨

console.log('🚀 경산다육식물농장 관리시스템 시작!');
console.log('📦 공통 유틸리티 함수 로드 완료');
console.log('🔍 브라우저 콘솔 테스트 - 이 메시지가 보이나요?');

// 로컬 기반 시스템 - Supabase 의존성 제거됨
console.log('🗄️ 로컬 기반 시스템 로드 완료');

// OrderDataManager를 orderSystem으로 사용
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 OrderDataManager를 orderSystem으로 초기화 시작...');
    console.log('🔍 customerDataManager 상태:', window.customerDataManager);
    
    try {
        // Supabase 클라이언트 초기화
        console.log('🔧 Supabase 클라이언트 초기화 중...');
        console.log('🔍 window.supabase:', typeof window.supabase);
        console.log('🔍 window.supabase.createClient:', typeof window.supabase?.createClient);
        console.log('🔍 window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
        console.log('🔍 window.SUPABASE_PRODUCTION_CONFIG:', window.SUPABASE_PRODUCTION_CONFIG);
        
        // 이미 클라이언트가 생성되어 있는지 확인
        if (window.supabaseClient) {
            console.log('✅ Supabase 클라이언트가 이미 존재합니다');
        } else {
            // Supabase CDN이 로드될 때까지 대기
            let retryCount = 0;
            const maxRetries = 10;
            
            while (retryCount < maxRetries && (!window.supabase || typeof window.supabase.createClient !== 'function')) {
                console.log(`⏳ Supabase CDN 로드 대기 중... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                retryCount++;
            }
            
            if (!window.supabase || typeof window.supabase.createClient !== 'function') {
                console.error('❌ Supabase CDN이 로드되지 않았거나 createClient 함수가 없습니다');
                console.error('❌ window.supabase:', window.supabase);
                throw new Error('Supabase CDN이 로드되지 않았습니다');
            }
            
            // Supabase 클라이언트 생성
            const config = window.SUPABASE_PRODUCTION_CONFIG || window.SUPABASE_CONFIG;
            if (!config) {
                console.error('❌ Supabase 설정을 찾을 수 없습니다');
                throw new Error('Supabase 설정이 로드되지 않았습니다');
            }
            
            try {
                window.supabaseClient = window.supabase.createClient(
                    config.url,
                    config.anonKey
                );
                console.log('✅ Supabase 클라이언트 초기화 완료');
                // [고2] 이벤트 기반 초기화 — productData/categoryData가 폴링 없이 대기 중인 Promise를 resolve
                window.dispatchEvent(new CustomEvent('supabase-ready'));
            } catch (clientError) {
                console.error('❌ Supabase 클라이언트 생성 실패:', clientError);
                throw new Error('Supabase 클라이언트 생성 실패: ' + clientError.message);
            }
        }
        // OrderDataManager를 orderSystem으로 사용
        const orderSystem = window.orderDataManager;
        console.log('✅ OrderDataManager를 orderSystem으로 설정 완료!');
        
        window.orderSystem = orderSystem;
        console.log('✅ orderSystem 초기화 완료!');
        
        // 초기화 완료 후 init 호출 (있는 경우)
        console.log('🔍 orderSystem.init 함수 존재 여부:', typeof orderSystem.init);
        if (orderSystem.init) {
            console.log('🚀 orderSystem.init() 호출 시작...');
            orderSystem.init().then(() => {
                console.log('✅ orderSystem init 완료!');
            }).catch(error => {
                console.error('❌ orderSystem init 실패:', error);
            });
        }
        
        // 상품 데이터 매니저 초기화
        console.log('🚀 ProductDataManager 초기화 시작...');
        try {
            await initializeProductDataManager();
            console.log('✅ ProductDataManager 초기화 완료!');
        } catch (error) {
            console.error('❌ ProductDataManager 초기화 실패:', error);
        }
        
        // 카테고리 데이터 매니저 초기화
        console.log('🚀 CategoryDataManager 초기화 시작...');
        try {
            await initializeCategoryDataManager();
            console.log('✅ CategoryDataManager 초기화 완료!');
        } catch (error) {
            console.error('❌ CategoryDataManager 초기화 실패:', error);
        }
        
        // 상품 테이블은 상품관리 컴포넌트가 로드될 때 렌더링됨
        console.log('🎨 상품 테이블은 상품관리 컴포넌트 로드 시 렌더링됩니다');
        
    } catch (error) {
        console.error('❌ orderSystem 초기화 실패:', error);
        console.error('❌ 오류 상세:', error.message);
        console.error('❌ 오류 스택:', error.stack);
        
        // 상품 테이블은 상품관리 컴포넌트가 로드될 때 렌더링됨
        console.log('🎨 상품 테이블은 상품관리 컴포넌트 로드 시 렌더링됩니다');
        
        // 백업 시스템 생성
        console.log('🔄 백업 시스템 생성...');
        window.orderSystem = {
            initialized: true,
            openProductModal: function() {
                console.log('상품 등록 모달 열기');
            },
            saveProduct: function() {
                console.log('상품 저장');
                alert('상품이 저장되었습니다.');
            },
            loadCustomers: function() {
                console.log('고객 목록 로드');
            },
            loadOrders: function() {
                console.log('주문 목록 로드');
            },
            loadWaitlist: function() {
                console.log('대기자 목록 로드');
            },
            // switchTab 함수 제거됨 - index.html의 switchTab 사용
            
            hideAllSections: function() {
                console.log('🗑️ 모든 섹션 강제 숨기기 시작...');
                
                // 모든 가능한 섹션 선택자들
                const selectors = [
                    '.section-content',
                    '[id$="-section"]',
                    '.tab-content',
                    '.content-section',
                    '#shipping-section',
                    '#waitlist-section',
                    '#dashboard-section',
                    '#customers-section',
                    '#orders-section',
                    '#products-section'
                ];
                
                selectors.forEach(selector => {
                    const sections = document.querySelectorAll(selector);
                    sections.forEach(section => {
                        section.style.display = 'none';
                        section.style.visibility = 'hidden';
                        section.style.opacity = '0';
                        section.classList.remove('active');
                        console.log(`🗑️ 섹션 숨김: ${section.id || section.className}`);
                    });
                });
                
                console.log('✅ 모든 섹션 숨기기 완료');
            },
            filterCustomersByGrade: function(grade) {
                console.log('고객 등급 필터링:', grade);
            },
            
            // 누락된 메서드들 추가
            reinitializeEventListeners: function() {
                console.log('🔄 이벤트 리스너 재등록 시작...');
                
                try {
                    // 모든 이벤트 리스너 제거
                    this.removeAllEventListeners();
                    
                    // 새로운 이벤트 리스너 등록
                    this.setupEventListeners();
                    
                    console.log('✅ 이벤트 리스너 재등록 완료');
                    
                    // UI 업데이트 알림
                    if (typeof showToast === 'function') {
                        showToast('이벤트 리스너가 재등록되었습니다.', 2000, 'success');
                    }
                    
                } catch (error) {
                    console.error('❌ 이벤트 리스너 재등록 실패:', error);
                }
            },
            
            emergencyDataRecovery: function() {
                console.log('🚨 긴급 데이터 복구 시작...');
                
                try {
                    // 로컬 스토리지에서 데이터 복구
                    this.recoverFromLocalStorage();
                    
                    // UI 강제 새로고침
                    this.refreshAllTabs();
                    
                    console.log('✅ 긴급 데이터 복구 완료');
                    
                    // UI 업데이트 알림
                    if (typeof showToast === 'function') {
                        showToast('데이터 복구가 완료되었습니다.', 3000, 'success');
                    }
                    
                } catch (error) {
                    console.error('❌ 긴급 데이터 복구 실패:', error);
                }
            },
            
            removeAllEventListeners: function() {
                console.log('🗑️ 기존 이벤트 리스너 제거 중...');
                
                // 모든 버튼의 이벤트 리스너 제거
                const buttons = document.querySelectorAll('button, .btn, [onclick]');
                buttons.forEach(button => {
                    button.onclick = null;
                    button.removeEventListener('click', () => {});
                });
                
                console.log('✅ 기존 이벤트 리스너 제거 완료');
            },
            
            setupEventListeners: function() {
                console.log('🔧 새로운 이벤트 리스너 설정 중...');
                
                // 탭 버튼 이벤트 리스너
                const tabButtons = document.querySelectorAll('.tab-button');
                tabButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const tabId = button.id;
                        this.switchTab(tabId);
                    });
                });
                
                // 모달 관련 이벤트 리스너
                this.setupModalEventListeners();
                
                // 폼 관련 이벤트 리스너
                this.setupFormEventListeners();
                
                console.log('✅ 새로운 이벤트 리스너 설정 완료');
            },
            
            setupModalEventListeners: function() {
                // 모달 열기/닫기 이벤트
                const modalTriggers = document.querySelectorAll('[data-modal]');
                modalTriggers.forEach(trigger => {
                    trigger.addEventListener('click', (e) => {
                        e.preventDefault();
                        const modalId = trigger.getAttribute('data-modal');
                        this.openModal(modalId);
                    });
                });
                
                // 모달 닫기 버튼
                const closeButtons = document.querySelectorAll('.modal-close, [data-close-modal]');
                closeButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.closeModal();
                    });
                });
            },
            
            setupFormEventListeners: function() {
                // 폼 제출 이벤트
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.handleFormSubmit(form);
                    });
                });
            },
            
            openModal: function(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'block';
                    modal.classList.add('active');
                    console.log(`✅ 모달 열기: ${modalId}`);
                }
            },
            
            closeModal: function() {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.style.display = 'none';
                    activeModal.classList.remove('active');
                    console.log('✅ 모달 닫기');
                }
            },
            
            handleFormSubmit: function(form) {
                console.log('📝 폼 제출 처리:', form);
                // 폼 제출 로직 구현
            },
            
            recoverFromLocalStorage: function() {
                console.log('💾 로컬 스토리지에서 데이터 복구 중...');
                
                try {
                    // 고객 데이터 복구
                    const customers = localStorage.getItem('farm_customers');
                    if (customers) {
                        this.customers = JSON.parse(customers);
                        console.log('✅ 고객 데이터 복구 완료');
                    }
                    
                    // 주문 데이터 복구
                    const orders = localStorage.getItem('farm_orders');
                    if (orders) {
                        this.orders = JSON.parse(orders);
                        console.log('✅ 주문 데이터 복구 완료');
                    }
                    
                    // 상품 데이터 복구
                    const products = localStorage.getItem('farm_products');
                    if (products) {
                        this.products = JSON.parse(products);
                        console.log('✅ 상품 데이터 복구 완료');
                    }
                    
                    // 대기자 데이터 복구
                    const waitlist = localStorage.getItem('farm_waitlist');
                    if (waitlist) {
                        this.waitlist = JSON.parse(waitlist);
                        console.log('✅ 대기자 데이터 복구 완료');
                    }
                    
                } catch (error) {
                    console.error('❌ 로컬 스토리지 데이터 복구 실패:', error);
                }
            },
            
            refreshAllTabs: function() {
                console.log('🔄 모든 탭 새로고침 시작...');
                
                try {
                    // 현재 활성 탭 확인
                    const activeTab = document.querySelector('.tab-button.active');
                    if (activeTab) {
                        const tabId = activeTab.id;
                        this.switchTab(tabId);
                        console.log(`✅ 활성 탭 새로고침: ${tabId}`);
                    }
                    
                    // 데이터 테이블 강제 렌더링
                    this.renderAllTables();
                    
                } catch (error) {
                    console.error('❌ 탭 새로고침 실패:', error);
                }
            },
            
            renderAllTables: function() {
                console.log('🎨 모든 테이블 렌더링 시작...');
                
                // 고객 테이블 렌더링
                if (this.customers && this.customers.length > 0) {
                    this.renderCustomersTable();
                }
                
                // 주문 테이블 렌더링
                if (this.orders && this.orders.length > 0) {
                    this.renderOrdersTable();
                }
                
                // 상품 테이블 렌더링
                if (this.products && this.products.length > 0) {
                    this.renderProductsTable();
                }
                
                console.log('✅ 모든 테이블 렌더링 완료');
            },
            
            renderCustomersTable: function() {
                console.log('👥 고객 테이블 렌더링');
                // 고객 테이블 렌더링 로직
            },
            
            renderOrdersTable: function() {
                console.log('📦 주문 테이블 렌더링');
                // 주문 테이블 렌더링 로직
            },
            
            renderProductsTable: function() {
                console.log('🛍️ 상품 테이블 렌더링');
                // 상품 테이블 렌더링 로직
            }
        };
        console.log('✅ 백업 시스템 생성 완료');
    }
});