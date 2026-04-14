/**
 * 피킹 리스트 모듈
 * 주문 상품의 피킹 리스트 생성 및 관리
 */

import { OrderDataModel } from './order-management-module.js';

export class PickingListModule {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.pickingData = null;
    }

    async generatePickingList(orders) {
        try {
            console.log('📦 피킹 리스트 생성 중...', orders);
            
            // 주문 데이터 정규화
            const normalizedOrders = orders.map(order => OrderDataModel.normalizeOrderData(order));
            
            // 피킹 데이터 생성
            this.pickingData = this.createPickingData(normalizedOrders);
            
            // 피킹 리스트 모달 열기
            await this.openPickingListModal();
            
        } catch (error) {
            console.error('❌ 피킹 리스트 생성 실패:', error);
            throw error;
        }
    }

    createPickingData(orders) {
        const productMap = new Map();
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.productName;
                if (productMap.has(key)) {
                    const existing = productMap.get(key);
                    existing.totalQuantity += item.quantity;
                    existing.orders.push({
                        orderId: order.id,
                        customerName: order.customerName,
                        quantity: item.quantity
                    });
                } else {
                    productMap.set(key, {
                        productName: item.productName,
                        totalQuantity: item.quantity,
                        orders: [{
                            orderId: order.id,
                            customerName: order.customerName,
                            quantity: item.quantity
                        }]
                    });
                }
            });
        });
        
        return {
            products: Array.from(productMap.values()),
            totalOrders: orders.length,
            generatedAt: new Date().toISOString()
        };
    }

    async openPickingListModal() {
        try {
            // 모달 HTML 로드
            await this.loadModalHTML();
            
            // 피킹 데이터 표시
            this.displayPickingData();
            
            // 이벤트 리스너 연결
            this.attachEventListeners();
            
            // 모달 표시
            this.showModal();
            
        } catch (error) {
            console.error('❌ 피킹 리스트 모달 열기 실패:', error);
            throw error;
        }
    }

    async loadModalHTML() {
        const response = await fetch('components/order-management/picking-list-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 모달 컨테이너 찾기 또는 생성
        let modalContainer = document.getElementById('picking-list-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'picking-list-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = html;
    }

    displayPickingData() {
        const modal = document.getElementById('picking-list-modal');
        if (!modal) {
            throw new Error('피킹 리스트 모달 요소를 찾을 수 없습니다.');
        }

        // 피킹 리스트 테이블 업데이트
        this.updatePickingListTable(modal);
        
        // 통계 정보 업데이트
        this.updateStatistics(modal);
    }

    updatePickingListTable(modal) {
        const tbody = modal.querySelector('#picking-list-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.pickingData.products.forEach((product, index) => {
            const row = this.createPickingListRow(product, index + 1);
            tbody.appendChild(row);
        });
    }

    createPickingListRow(product, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index}</td>
            <td>${product.productName}</td>
            <td>${product.totalQuantity}</td>
            <td>
                <div class="order-details">
                    ${product.orders.map(order => 
                        `<div class="order-item">
                            <span class="order-id">#${order.orderId}</span>
                            <span class="customer-name">${order.customerName}</span>
                            <span class="quantity">${order.quantity}개</span>
                        </div>`
                    ).join('')}
                </div>
            </td>
            <td>
                <input type="checkbox" class="picked-checkbox" data-product="${product.productName}">
            </td>
        `;
        return row;
    }

    updateStatistics(modal) {
        const totalProductsElement = modal.querySelector('#total-products');
        if (totalProductsElement) {
            totalProductsElement.textContent = this.pickingData.products.length;
        }
        
        const totalOrdersElement = modal.querySelector('#total-orders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = this.pickingData.totalOrders;
        }
        
        const generatedAtElement = modal.querySelector('#generated-at');
        if (generatedAtElement) {
            generatedAtElement.textContent = new Date(this.pickingData.generatedAt).toLocaleString();
        }
    }

    attachEventListeners() {
        const modal = document.getElementById('picking-list-modal');
        if (!modal) return;

        // 닫기 버튼
        const closeButton = modal.querySelector('#close-picking-list-modal');
        if (closeButton) {
            this.eventManager.add(closeButton, 'click', () => this.close());
        }

        // 인쇄 버튼
        const printButton = modal.querySelector('#print-picking-list');
        if (printButton) {
            this.eventManager.add(printButton, 'click', () => this.printPickingList());
        }

        // 전체 선택/해제 버튼
        const selectAllButton = modal.querySelector('#select-all-picked');
        if (selectAllButton) {
            this.eventManager.add(selectAllButton, 'click', () => this.toggleSelectAll());
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

    printPickingList() {
        try {
            // 인쇄용 창 열기
            const printWindow = window.open('', '_blank');
            
            // 인쇄용 HTML 생성
            const printHTML = this.generatePrintHTML();
            printWindow.document.write(printHTML);
            printWindow.document.close();
            
            // 인쇄 실행
            printWindow.print();
            
        } catch (error) {
            console.error('❌ 피킹 리스트 인쇄 실패:', error);
            alert('인쇄 중 오류가 발생했습니다.');
        }
    }

    generatePrintHTML() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>피킹 리스트</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .stats { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .order-details { font-size: 12px; }
                    .order-item { margin-bottom: 4px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>피킹 리스트</h1>
                    <p>생성일시: ${new Date(this.pickingData.generatedAt).toLocaleString()}</p>
                </div>
                
                <div class="stats">
                    <p>총 상품 수: ${this.pickingData.products.length}개</p>
                    <p>총 주문 수: ${this.pickingData.totalOrders}건</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>상품명</th>
                            <th>총 수량</th>
                            <th>주문 상세</th>
                            <th>피킹 완료</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.pickingData.products.map((product, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${product.productName}</td>
                                <td>${product.totalQuantity}</td>
                                <td>
                                    ${product.orders.map(order => 
                                        `#${order.orderId} ${order.customerName} (${order.quantity}개)`
                                    ).join('<br>')}
                                </td>
                                <td>□</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.picked-checkbox');
        const selectAllButton = document.querySelector('#select-all-picked');
        
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        selectAllButton.textContent = allChecked ? '전체 선택' : '전체 해제';
    }

    showModal() {
        const modal = document.getElementById('picking-list-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        const modal = document.getElementById('picking-list-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // 이벤트 리스너 정리
        this.eventManager.removeAll();
        
        // 모달 HTML 제거
        const modalContainer = document.getElementById('picking-list-modal-container');
        if (modalContainer) {
            modalContainer.remove();
        }
        
        this.pickingData = null;
        console.log('✅ 피킹 리스트 모달 닫기 완료');
    }
}

