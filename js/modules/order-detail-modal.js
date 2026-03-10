/**
 * 주문 상세 모달 모듈
 * 주문 상세 정보 표시 및 관련 기능을 담당
 */

import { OrderDataModel } from './order-management-module.js';

export class OrderDetailModal {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.currentOrder = null;
    }

    async open(order) {
        try {
            console.log('📋 주문 상세 모달 열기:', order);
            
            // 주문 데이터 정규화
            this.currentOrder = OrderDataModel.normalizeOrderData(order);
            
            // 모달 HTML 로드
            await this.loadModalHTML();
            
            // 주문 상세 정보 표시
            this.displayOrderDetail();
            
            // 이벤트 리스너 연결
            this.attachEventListeners();
            
            // 모달 표시
            this.showModal();
            
        } catch (error) {
            console.error('❌ 주문 상세 모달 열기 실패:', error);
            throw error;
        }
    }

    async loadModalHTML() {
        const response = await fetch('components/order-management/order-detail-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 모달 컨테이너 찾기 또는 생성
        let modalContainer = document.getElementById('order-detail-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'order-detail-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = html;
    }

    displayOrderDetail() {
        const modal = document.getElementById('order-detail-modal');
        if (!modal) {
            throw new Error('주문 상세 모달 요소를 찾을 수 없습니다.');
        }

        // 주문 기본 정보 표시
        this.updateOrderBasicInfo(modal);
        
        // 주문 상품 목록 표시
        this.updateOrderItems(modal);
        
        // 주문 상태 표시
        this.updateOrderStatus(modal);
    }

    updateOrderBasicInfo(modal) {
        const order = this.currentOrder;
        
        // 주문 ID
        const orderIdElement = modal.querySelector('#order-id');
        if (orderIdElement) {
            orderIdElement.textContent = order.id;
        }
        
        // 고객 정보
        const customerNameElement = modal.querySelector('#customer-name');
        if (customerNameElement) {
            customerNameElement.textContent = order.customerName;
        }
        
        const customerPhoneElement = modal.querySelector('#customer-phone');
        if (customerPhoneElement) {
            customerPhoneElement.textContent = order.customerPhone;
        }
        
        // 주문 날짜
        const orderDateElement = modal.querySelector('#order-date');
        if (orderDateElement) {
            orderDateElement.textContent = new Date(order.orderDate).toLocaleDateString();
        }
        
        // 총 금액
        const totalAmountElement = modal.querySelector('#total-amount');
        if (totalAmountElement) {
            totalAmountElement.textContent = order.totalAmount.toLocaleString() + '원';
        }
        
        // 배송비
        const shippingFeeElement = modal.querySelector('#shipping-fee');
        if (shippingFeeElement) {
            shippingFeeElement.textContent = order.shippingFee.toLocaleString() + '원';
        }
    }

    updateOrderItems(modal) {
        const itemsContainer = modal.querySelector('#order-items-list');
        if (!itemsContainer) return;

        itemsContainer.innerHTML = '';
        
        this.currentOrder.items.forEach(item => {
            const itemElement = this.createOrderItemElement(item);
            itemsContainer.appendChild(itemElement);
        });
    }

    createOrderItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.productName}</span>
                <span class="item-quantity">수량: ${item.quantity}</span>
            </div>
            <div class="item-price">
                <span class="unit-price">${item.price.toLocaleString()}원</span>
                <span class="total-price">${item.total.toLocaleString()}원</span>
            </div>
        `;
        return itemElement;
    }

    updateOrderStatus(modal) {
        const statusElement = modal.querySelector('#order-status');
        if (statusElement) {
            statusElement.textContent = this.getStatusText(this.currentOrder.status);
            statusElement.className = `status status-${this.currentOrder.status}`;
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '대기중',
            'processing': '처리중',
            'shipped': '배송중',
            'delivered': '배송완료',
            'cancelled': '취소됨'
        };
        return statusMap[status] || status;
    }

    attachEventListeners() {
        const modal = document.getElementById('order-detail-modal');
        if (!modal) return;

        // 닫기 버튼
        const closeButton = modal.querySelector('#close-order-detail-modal');
        if (closeButton) {
            this.eventManager.add(closeButton, 'click', () => this.close());
        }

        // 배경 클릭으로 닫기
        this.eventManager.add(modal, 'click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // ESC 키로 닫기
        this.eventManager.add(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // 이벤트 리스너 정리
        this.eventManager.removeAll();
        
        // 모달 HTML 제거
        const modalContainer = document.getElementById('order-detail-modal-container');
        if (modalContainer) {
            modalContainer.remove();
        }
        
        this.currentOrder = null;
        console.log('✅ 주문 상세 모달 닫기 완료');
    }
}

