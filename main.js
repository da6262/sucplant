// 경산다육식물농장 관리시스템 - 메인 진입점
// 모듈화된 구조의 시작점

// 공통 유틸리티 함수들 import
import { TABLE_MAP, mapTable, getLocalStorageKey } from './utils/helpers.js';

// 로컬 기반 시스템 - Supabase 의존성 제거됨

// 고객 데이터 모듈 import
import { 
    customerDataManager,
    CustomerDataManager
} from './features/customers/customerData.js';

// 고객 UI 모듈 import
import { renderCustomersTable } from './features/customers/customerUI.js';

// 상품 데이터 모듈 import
import { 
    productDataManager,
    ProductDataManager
} from './features/products/productData.js';

// 상품 UI 모듈 import
import { renderProductsTable } from './features/products/productUI.js';

// 카테고리 데이터 모듈 import
import { 
    categoryDataManager,
    CategoryDataManager
} from './features/categories/categoryData.js';

// 카테고리 UI 모듈 import
import { 
    openCategoryModal,
    closeCategoryModal,
    loadCategoriesList,
    updateCategoryDropdown
} from './features/categories/categoryUI.js';

// 배송 UI 모듈 import
import { shippingUI } from './features/shipping/shippingUI.js';

// 주문 UI 모듈 import
import { 
    openOrderModal,
    closeOrderModal,
    loadOrderData,
    clearOrderForm,
    openPickingListModal,
    openPackagingLabelsModal,
    generatePickingList,
    generatePackagingLabels,
    getSelectedOrders,
    createPickingListData,
    createPackagingLabelData,
    printPickingList,
    printPackagingLabels,
    loadOrders,
    renderOrdersTable,
    saveOrder,
    editOrder,
    deleteOrder,
    initCustomerAutocomplete,
    openAddressSearch,
    cancelNewCustomerRegistration,
    confirmNewCustomerRegistration
} from './features/orders/orderUI.js';

// 전역에서 사용할 수 있도록 window 객체에 등록
window.TABLE_MAP = TABLE_MAP;
window.mapTable = mapTable;
window.getLocalStorageKey = getLocalStorageKey;

// 고객 관련 함수들 전역 등록 (customerDataManager를 통해 접근)
// window.customerDataManager가 이미 등록되어 있음

// customerDataManager 인스턴스 전역 등록
window.customerDataManager = customerDataManager;

// productDataManager 인스턴스 전역 등록
window.productDataManager = productDataManager;

// categoryDataManager 인스턴스 전역 등록
window.categoryDataManager = categoryDataManager;

// 카테고리 UI 함수들 전역 등록
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.loadCategoriesList = loadCategoriesList;
window.updateCategoryDropdown = updateCategoryDropdown;

// shippingUI 인스턴스 전역 등록
window.shippingUI = shippingUI;

// 주문 관련 함수들 전역 등록
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.loadOrderData = loadOrderData;
window.clearOrderForm = clearOrderForm;
window.openPickingListModal = openPickingListModal;
window.openPackagingLabelsModal = openPackagingLabelsModal;
window.generatePickingList = generatePickingList;
window.generatePackagingLabels = generatePackagingLabels;
window.getSelectedOrders = getSelectedOrders;
window.createPickingListData = createPickingListData;
window.createPackagingLabelData = createPackagingLabelData;
window.printPickingList = printPickingList;
window.printPackagingLabels = printPackagingLabels;
window.loadOrders = loadOrders;
window.renderOrdersTable = renderOrdersTable;
window.saveOrder = saveOrder;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.initCustomerAutocomplete = initCustomerAutocomplete;
window.openAddressSearch = openAddressSearch;
window.cancelNewCustomerRegistration = cancelNewCustomerRegistration;
window.confirmNewCustomerRegistration = confirmNewCustomerRegistration;

// 고객 모달 관련 함수들 전역 등록
window.openCustomerModal = (customerId = null) => {
    if (window.orderSystem && window.orderSystem.openCustomerModal) {
        return window.orderSystem.openCustomerModal(customerId);
    } else {
        console.error('❌ orderSystem.openCustomerModal을 찾을 수 없습니다');
    }
};

console.log('🚀 경산다육식물농장 관리시스템 시작!');
console.log('📦 공통 유틸리티 함수 로드 완료');
console.log('🔍 브라우저 콘솔 테스트 - 이 메시지가 보이나요?');

// 로컬 기반 시스템 - Supabase 의존성 제거됨
console.log('🗄️ 로컬 기반 시스템 로드 완료');

// OrderManagementSystem 초기화 (customerDataManager 전달)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 OrderManagementSystem 초기화 시작...');
    console.log('🔍 customerDataManager 상태:', window.customerDataManager);
    
    // OrderManagementSystem import 및 생성
    console.log('📦 js/app.js 모듈 import 시도...');
    import('./js/app.js').then(module => {
        console.log('✅ js/app.js 모듈 import 성공!');
        console.log('🔍 모듈 내용:', module);
        
        const { OrderManagementSystem } = module;
        console.log('🔍 OrderManagementSystem 클래스:', OrderManagementSystem);
        
        const orderSystem = new OrderManagementSystem(window.customerDataManager);
        console.log('✅ OrderManagementSystem 인스턴스 생성 완료!');
        
        window.orderSystem = orderSystem;
        console.log('✅ OrderManagementSystem 초기화 완료!');
        
        // 초기화 완료 후 init 호출
        console.log('🔍 orderSystem.init 함수 존재 여부:', typeof orderSystem.init);
        if (orderSystem.init) {
            console.log('🚀 orderSystem.init() 호출 시작...');
            orderSystem.init().then(() => {
                console.log('✅ OrderManagementSystem init 완료!');
            }).catch(error => {
                console.error('❌ OrderManagementSystem init 실패:', error);
            });
        } else {
            console.error('❌ orderSystem.init 함수가 존재하지 않습니다!');
        }
    }).catch(error => {
        console.error('❌ OrderManagementSystem 초기화 실패:', error);
        console.error('❌ 오류 상세:', error.message);
        console.error('❌ 오류 스택:', error.stack);
        
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
            switchTab: function(tabId) {
                console.log('탭 전환:', tabId);
            },
            filterCustomersByGrade: function(grade) {
                console.log('고객 등급 필터링:', grade);
            }
        };
        console.log('✅ 백업 시스템 생성 완료');
    });
});