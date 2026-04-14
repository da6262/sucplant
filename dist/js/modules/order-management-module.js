/**
 * 주문 관리 모듈 - ES6 모듈 구조로 리팩토링
 * 전역 스코프 오염 방지 및 모듈화된 구조
 */

// 이벤트 리스너 관리 클래스
class EventListenerManager {
    constructor() {
        this.listeners = new Map();
    }

    add(element, event, handler, options = {}) {
        const key = `${element.id || 'anonymous'}_${event}`;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        element.addEventListener(event, handler, options);
        this.listeners.get(key).push({ element, event, handler, options });
    }

    remove(element, event, handler) {
        const key = `${element.id || 'anonymous'}_${event}`;
        if (this.listeners.has(key)) {
            const listenerList = this.listeners.get(key);
            const index = listenerList.findIndex(
                l => l.element === element && l.handler === handler
            );
            if (index !== -1) {
                element.removeEventListener(event, handler);
                listenerList.splice(index, 1);
            }
        }
    }

    removeAll() {
        this.listeners.forEach((listenerList, key) => {
            listenerList.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.listeners.clear();
    }
}

// DOM 유틸리티 클래스
class DOMUtils {
    static async waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    static showElement(element) {
        if (element) {
            element.classList.remove('hidden');
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
    }

    static hideElement(element) {
        if (element) {
            element.classList.add('hidden');
            element.style.display = 'none';
        }
    }
}

// 데이터 모델 표준화 클래스
class OrderDataModel {
    static normalizeOrderData(order) {
        return {
            id: order.id || order.order_id,
            customerName: order.customer_name || order.customerName,
            customerPhone: order.customer_phone || order.customerPhone,
            orderDate: order.order_date || order.orderDate,
            status: order.status || 'pending',
            items: this.normalizeOrderItems(order.items ?? []),
            totalAmount: order.total_amount || order.totalAmount || 0,
            shippingFee: order.shipping_fee || order.shippingFee || 0
        };
    }

    static normalizeOrderItems(items) {
        return items.map(item => ({
            id: item.id || item.item_id,
            productName: item.product_name || item.name || item.title,
            quantity: item.quantity || item.qty || 1,
            price: item.price || item.unit_price || 0,
            total: item.total || (item.quantity || 1) * (item.price || 0)
        }));
    }
}

// 주문 관리 메인 클래스
export class OrderManagementModule {
    constructor() {
        this.eventManager = new EventListenerManager();
        this.isInitialized = false;
        this.orderDetailModal = null;
        this.pickingListModule = null;
        this.shippingSettingsModule = null;
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ 주문 관리 모듈이 이미 초기화되었습니다.');
            return;
        }

        try {
            console.log('🔄 주문관리 모듈 초기화 중...');
            
            // 기존 이벤트 리스너 정리
            this.eventManager.removeAll();
            
            // DOM 요소 대기 및 초기화
            await this.loadComponent();
            await this.attachEventListeners();
            
            this.isInitialized = true;
            console.log('✅ 주문관리 모듈 초기화 완료');
        } catch (error) {
            console.error('❌ 주문관리 모듈 초기화 실패:', error);
            throw error;
        }
    }

    async loadComponent() {
        try {
            // 기존 주문관리 섹션 내용만 제거
            const existingSection = document.getElementById('orders-section');
            if (existingSection) {
                console.log('🗑️ 기존 주문관리 섹션 내용 제거');
                existingSection.innerHTML = '';
            }

            // 컴포넌트 HTML 로드
            const response = await fetch('components/order-management/order-management.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            
            // orders-section에 HTML 내용 삽입
            const ordersSection = await DOMUtils.waitForElement('#orders-section');
            ordersSection.innerHTML = html;
            
            // 섹션 표시 설정
            DOMUtils.showElement(ordersSection);
            ordersSection.classList.add('active');
            ordersSection.setAttribute('data-dynamic', 'true');

            // 다른 섹션들 숨기기
            this.hideOtherSections();

            console.log('✅ 주문관리 컴포넌트 로드 완료');
        } catch (error) {
            console.error('❌ 컴포넌트 로드 실패:', error);
            throw error;
        }
    }

    hideOtherSections() {
        document.querySelectorAll('.section-content, .tab-content, [id$="-section"]').forEach(section => {
            if (section.id !== 'orders-section') {
                section.classList.remove('active');
                DOMUtils.hideElement(section);
            }
        });

        // 주문 등록 화면 숨기기
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            DOMUtils.hideElement(orderModal);
        }
    }

    async attachEventListeners() {
        try {
            // 하위 모듈들 초기화
            await this.initializeSubModules();
            
            // 주문 목록 이벤트 리스너 추가
            await this.attachOrderListListeners();
            
            console.log('✅ 이벤트 리스너 연결 완료');
        } catch (error) {
            console.error('❌ 이벤트 리스너 연결 실패:', error);
            throw error;
        }
    }

    async initializeSubModules() {
        // 동적 import를 사용하여 순환 참조 방지
        const { OrderDetailModal } = await import('./order-detail-modal.js');
        const { PickingListModule } = await import('./picking-list.js');
        const { ShippingSettingsModule } = await import('./shipping-settings.js');

        this.orderDetailModal = new OrderDetailModal(this.eventManager);
        this.pickingListModule = new PickingListModule(this.eventManager);
        this.shippingSettingsModule = new ShippingSettingsModule(this.eventManager);
    }

    async attachOrderListListeners() {
        // 주문 목록 관련 이벤트 리스너들을 여기에 추가
        // 기존 코드의 attachOrderEventListeners 로직을 모듈화하여 구현
        
        // 주문 상세 보기 버튼
        const orderDetailButtons = document.querySelectorAll('.view-order-detail');
        orderDetailButtons.forEach(button => {
            this.eventManager.add(button, 'click', async (e) => {
                const orderId = e.target.dataset.orderId;
                await this.openOrderDetail(orderId);
            });
        });

        // 피킹 리스트 생성 버튼
        const generatePickingListButton = document.querySelector('#generate-picking-list');
        if (generatePickingListButton) {
            this.eventManager.add(generatePickingListButton, 'click', () => {
                this.generatePickingList();
            });
        }

        // 배송비 설정 버튼
        const shippingSettingsButton = document.querySelector('#shipping-settings');
        if (shippingSettingsButton) {
            this.eventManager.add(shippingSettingsButton, 'click', () => {
                this.showShippingSettings();
            });
        }
    }

    async openOrderDetail(orderId) {
        try {
            // 실제 구현에서는 API에서 주문 데이터를 가져와야 함
            const orderData = await this.fetchOrderData(orderId);
            await this.orderDetailModal.open(orderData);
        } catch (error) {
            console.error('❌ 주문 상세 열기 실패:', error);
            alert('주문 상세 정보를 불러올 수 없습니다.');
        }
    }

    async fetchOrderData(orderId) {
        // 실제 구현에서는 API 호출
        // 현재는 예시 데이터 반환
        return {
            id: orderId,
            customer_name: '홍길동',
            customer_phone: '010-1234-5678',
            order_date: new Date().toISOString(),
            status: 'pending',
            items: [
                {
                    product_name: '토마토',
                    quantity: 5,
                    price: 3000
                }
            ],
            total_amount: 15000,
            shipping_fee: 3000
        };
    }

    async generatePickingList() {
        try {
            // 실제 구현에서는 선택된 주문들을 가져와야 함
            const selectedOrders = await this.getSelectedOrders();
            await this.pickingListModule.generatePickingList(selectedOrders);
        } catch (error) {
            console.error('❌ 피킹 리스트 생성 실패:', error);
            alert('피킹 리스트 생성 중 오류가 발생했습니다.');
        }
    }

    async getSelectedOrders() {
        // 실제 구현에서는 체크박스로 선택된 주문들을 가져옴
        // 현재는 예시 데이터 반환
        return [
            {
                id: 1,
                customer_name: '홍길동',
                items: [
                    {
                        product_name: '토마토',
                        quantity: 5,
                        price: 3000
                    }
                ]
            }
        ];
    }

    async showShippingSettings() {
        try {
            await this.shippingSettingsModule.initialize();
        } catch (error) {
            console.error('❌ 배송비 설정 표시 실패:', error);
            alert('배송비 설정을 불러올 수 없습니다.');
        }
    }

    cleanup() {
        this.eventManager.removeAll();
        this.isInitialized = false;
        console.log('🧹 주문관리 모듈 정리 완료');
    }
}

// 모듈 인스턴스 생성 및 내보내기
export const orderManagementModule = new OrderManagementModule();

// 기존 전역 함수들과의 호환성을 위한 래퍼 함수들
export const loadOrderManagementComponent = () => orderManagementModule.initialize();
export const cleanupOrderEventListeners = () => orderManagementModule.cleanup();
