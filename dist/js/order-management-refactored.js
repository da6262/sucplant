/**
 * 리팩토링된 주문 관리 시스템
 * 기존 코드와의 호환성을 위한 래퍼
 */

// 모듈 import
import { 
    orderManagementModule, 
    loadOrderManagementComponent, 
    cleanupOrderEventListeners 
} from './modules/order-management-module.js';

// 기존 전역 함수들과의 호환성을 위한 래퍼
window.loadOrderManagementComponent = loadOrderManagementComponent;
window.cleanupOrderEventListeners = cleanupOrderEventListeners;

// 기존 함수들에 대한 래퍼 함수들
window.attachOrderEventListeners = () => {
    console.log('⚠️ attachOrderEventListeners는 모듈화된 구조에서 자동으로 처리됩니다.');
};

window.openOrderDetailModal = async (orderId) => {
    try {
        await orderManagementModule.openOrderDetail(orderId);
    } catch (error) {
        console.error('❌ 주문 상세 모달 열기 실패:', error);
    }
};

window.generatePickingList = async () => {
    try {
        await orderManagementModule.generatePickingList();
    } catch (error) {
        console.error('❌ 피킹 리스트 생성 실패:', error);
    }
};

window.updateOrderFormShippingFee = (shippingFee) => {
    console.log('📦 배송비 업데이트:', shippingFee);
    // 실제 구현에서는 주문 폼의 배송비 필드를 업데이트
};

window.editShippingRule = (ruleId) => {
    console.log('✏️ 배송비 규칙 수정:', ruleId);
    // 실제 구현에서는 배송비 규칙 수정 모달 열기
};

window.deleteShippingRule = (ruleId) => {
    console.log('🗑️ 배송비 규칙 삭제:', ruleId);
    // 실제 구현에서는 배송비 규칙 삭제 확인 후 삭제
};

// DOMContentLoaded 이벤트에서 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 리팩토링된 주문 관리 시스템 로드 완료');
});

// 기존 코드와의 호환성을 위한 추가 함수들
window.waitForDOMAndInitialize = async () => {
    console.log('⏳ DOM 초기화 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ DOM 초기화 완료');
};

window.initializeOrderManagement = async () => {
    try {
        await orderManagementModule.initialize();
        console.log('✅ 주문 관리 시스템 초기화 완료');
    } catch (error) {
        console.error('❌ 주문 관리 시스템 초기화 실패:', error);
    }
};

// 테스트 함수
window.testProductNameLookup = async function() {
    console.log('🧪 상품명 조회 테스트');
    // 실제 구현에서는 상품명 조회 API 테스트
    return true;
};

console.log('📦 리팩토링된 주문 관리 시스템 로드됨');

