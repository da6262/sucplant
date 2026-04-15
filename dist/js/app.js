// 개발모드 설정
const isDevMode = false; // 프로덕션 배포시 false로 설정

// 인증 관련 함수 제거됨 (로컬 모드)
// import { showToast } from '../utils/ui-helpers.js'; // 브라우저 환경에서는 직접 로드

// 개발모드 전용 요소 제거
if (!isDevMode) {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll("[data-dev-only]").forEach(el => el.remove());
        console.log("✅ 프로덕션 모드로 실행됩니다");
    });
}

// 마이그레이션 완료: 대부분의 기능이 features/ 디렉토리로 이동됨
// - SMS 템플릿 함수들: features/orders/orderUI.js
// - 모달 드래그 기능: features/orders/orderUI.js  
// - 테스트 함수들: features/test/testUtils.js
// - OrderManagementSystem 클래스: features/orders/orderData.js

// 전역 함수들 - features 모듈에서 처리됨
window.updateFilterCounts = function() {
    if (window.orderSystem && window.orderSystem.updateFilterCounts) {
        window.orderSystem.updateFilterCounts();
    }
};

// 상품 관련 전역 함수들
window.editProduct = function(productId) {
    if (window.orderSystem && window.orderSystem.editProduct) {
        window.orderSystem.editProduct(productId);
    }
};

// openProductModal은 features/products/productUI.js에서 처리됨

// 고객 관련 전역 함수들
// Note: customer-management.js에서 실제 함수를 덮어쓰므로 여기서는 폴백만 제공
if (!window.saveCustomer) {
    window.saveCustomer = function() {
        console.log('⚠️ saveCustomer 호출 - customer-management.js 로드 대기 중...');
        if (window.orderSystem && window.orderSystem.saveCustomer) {
            window.orderSystem.saveCustomer();
        }
    };
}

if (!window.closeCustomerModal) {
    window.closeCustomerModal = function() {
        console.log('⚠️ closeCustomerModal 호출 - customer-management.js 로드 대기 중...');
        if (window.orderSystem && window.orderSystem.closeCustomerModal) {
            window.orderSystem.closeCustomerModal();
        }
    };
}

// 상품 관련 전역 함수들
window.calculateModalProfitMargin = function() {
    if (window.orderSystem && window.orderSystem.calculateModalProfitMargin) {
        window.orderSystem.calculateModalProfitMargin();
    }
};

window.saveProduct = function() {
    if (window.orderSystem && window.orderSystem.saveProduct) {
        window.orderSystem.saveProduct();
    }
};

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
};

// 카테고리 관련 전역 함수들
window.saveCategoryChanges = function() {
    if (window.orderSystem && window.orderSystem.saveCategoryChanges) {
        return window.orderSystem.saveCategoryChanges();
    }
    return Promise.resolve(false);
};

console.log('✅ app.js 로드 완료 - features 모듈 구조로 마이그레이션됨');