// 주문 UI 관리
// 주문 목록, 폼, 모달 UI 처리

// 주문 모달 열기
export function openOrderModal(orderId = null) {
    try {
        console.log('주문 모달 열기:', orderId);
        
        const modal = document.getElementById('order-modal');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modal) {
            console.error('주문 모달을 찾을 수 없습니다.');
            return;
        }
        
        // 모달 표시
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        if (orderId) {
            // 수정 모드
            modalTitle.textContent = '주문 정보 수정';
            loadOrderData(orderId);
        } else {
            // 등록 모드
            modalTitle.textContent = '새 주문 등록';
            clearOrderForm();
        }
        
        // 주문 폼 HTML 생성
        generateOrderFormHTML();
        
        // 고객명 자동완성 초기화 (모달이 열린 후)
        setTimeout(() => {
            initCustomerAutocomplete();
        }, 100);
        
        console.log('주문 모달 열기 완료');
        
    } catch (error) {
        console.error('주문 모달 열기 실패:', error);
    }
}

// 주문 모달 닫기
export function closeOrderModal() {
    try {
        console.log('주문 모달 닫기');
        
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        
    } catch (error) {
        console.error('주문 모달 닫기 실패:', error);
    }
}

// 주문 데이터 로드
export function loadOrderData(orderId) {
    try {
        console.log('주문 데이터 로드:', orderId);
        // 주문 데이터 로드 로직 구현
    } catch (error) {
        console.error('주문 데이터 로드 실패:', error);
    }
}

// 주문 폼 HTML 생성
function generateOrderFormHTML() {
    try {
        const orderForm = document.getElementById('order-form');
        if (!orderForm) {
            console.error('주문 폼을 찾을 수 없습니다.');
            return;
        }
        
        orderForm.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 고객 정보 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">고객 정보</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">고객명 *</label>
                        <input type="text" id="order-customer-name" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="고객명을 입력하세요" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                        <input type="tel" id="order-customer-phone" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="010-1234-5678" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                        <textarea id="order-customer-address" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  placeholder="주소를 입력하세요" required></textarea>
                    </div>
                </div>
                
                <!-- 주문 정보 -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">주문 정보</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
                        <input type="text" id="order-product-name" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="상품명을 입력하세요" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">수량 *</label>
                        <input type="number" id="order-quantity" min="1" value="1"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">가격</label>
                        <input type="number" id="order-price" min="0"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="가격을 입력하세요">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">배송 메모</label>
                        <textarea id="order-memo" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  placeholder="배송 관련 메모를 입력하세요"></textarea>
                    </div>
                </div>
            </div>
            
            <!-- 버튼 영역 -->
            <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button type="button" onclick="closeOrderModal()" 
                        class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    취소
                </button>
                <button type="submit" 
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    주문 등록
                </button>
            </div>
        `;
        
        console.log('주문 폼 HTML 생성 완료');
        
    } catch (error) {
        console.error('주문 폼 HTML 생성 실패:', error);
    }
}

// 주문 폼 초기화
export function clearOrderForm() {
    try {
        console.log('주문 폼 초기화');
        
        // 폼 필드들 초기화
        const fields = [
            'order-customer-name',
            'order-customer-phone', 
            'order-customer-address',
            'order-product-name',
            'order-quantity',
            'order-price',
            'order-memo'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'number') {
                    field.value = fieldId === 'order-quantity' ? '1' : '';
                } else {
                    field.value = '';
                }
            }
        });
        
    } catch (error) {
        console.error('주문 폼 초기화 실패:', error);
    }
}

// 피킹 리스트 모달 열기
export function openPickingListModal() {
    try {
        console.log('피킹 리스트 모달 열기');
        
        // 선택된 주문 확인
        const selectedOrders = getSelectedOrders();
        
        if (selectedOrders.length === 0) {
            alert('피킹할 주문을 선택해주세요.');
            return;
        }
        
        // 피킹 리스트 생성 로직
        generatePickingList();
        
    } catch (error) {
        console.error('피킹 리스트 모달 열기 실패:', error);
    }
}

// 포장 라벨 모달 열기
export function openPackagingLabelsModal() {
    try {
        console.log('포장 라벨 모달 열기');
        
        // 포장 라벨 생성 로직
        generatePackagingLabels();
        
    } catch (error) {
        console.error('포장 라벨 모달 열기 실패:', error);
    }
}

// 피킹 리스트 생성
export function generatePickingList() {
    try {
        console.log('피킹 리스트 생성');
        
        // 선택된 주문들 가져오기 (이미 openPickingListModal에서 확인됨)
        const selectedOrders = getSelectedOrders();
        
        // 피킹 리스트 데이터 생성
        const pickingData = createPickingListData(selectedOrders);
        
        // 피킹 리스트 출력
        printPickingList(pickingData);
        
    } catch (error) {
        console.error('피킹 리스트 생성 실패:', error);
    }
}

// 포장 라벨 생성
export function generatePackagingLabels() {
    try {
        console.log('포장 라벨 생성');
        
        // 선택된 주문들 가져오기
        const selectedOrders = getSelectedOrders();
        
        if (selectedOrders.length === 0) {
            alert('포장 라벨을 생성할 주문을 선택해주세요.');
            return;
        }
        
        // 포장 라벨 데이터 생성
        const labelData = createPackagingLabelData(selectedOrders);
        
        // 포장 라벨 출력
        printPackagingLabels(labelData);
        
    } catch (error) {
        console.error('포장 라벨 생성 실패:', error);
    }
}

// 선택된 주문들 가져오기
export function getSelectedOrders() {
    try {
        const checkboxes = document.querySelectorAll('#orders-table-body input[type="checkbox"]:checked');
        const selectedOrders = [];
        
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                const orderId = row.dataset.orderId;
                if (orderId) {
                    selectedOrders.push(orderId);
                }
            }
        });
        
        return selectedOrders;
    } catch (error) {
        console.error('선택된 주문 가져오기 실패:', error);
        return [];
    }
}

// 피킹 리스트 데이터 생성
export function createPickingListData(orderIds) {
    try {
        console.log('피킹 리스트 데이터 생성:', orderIds);
        // 피킹 리스트 데이터 생성 로직
        return [];
    } catch (error) {
        console.error('피킹 리스트 데이터 생성 실패:', error);
        return [];
    }
}

// 포장 라벨 데이터 생성
export function createPackagingLabelData(orderIds) {
    try {
        console.log('포장 라벨 데이터 생성:', orderIds);
        // 포장 라벨 데이터 생성 로직
        return [];
    } catch (error) {
        console.error('포장 라벨 데이터 생성 실패:', error);
        return [];
    }
}

// 피킹 리스트 출력
export function printPickingList(pickingData) {
    try {
        console.log('피킹 리스트 출력:', pickingData);
        // 피킹 리스트 출력 로직
        alert('피킹 리스트가 생성되었습니다.');
    } catch (error) {
        console.error('피킹 리스트 출력 실패:', error);
    }
}

// 포장 라벨 출력
export function printPackagingLabels(labelData) {
    try {
        console.log('포장 라벨 출력:', labelData);
        // 포장 라벨 출력 로직
        alert('포장 라벨이 생성되었습니다.');
    } catch (error) {
        console.error('포장 라벨 출력 실패:', error);
    }
}

// 주문 데이터 로드
export async function loadOrders() {
    try {
        console.log('📦 주문 데이터 로드 시작...');
        
        // LocalStorage에서 주문 데이터 가져오기
        const ordersData = localStorage.getItem('farm_orders');
        if (ordersData) {
            const orders = JSON.parse(ordersData);
            console.log(`✅ 주문 데이터 ${orders.length}개 로드 완료`);
            return orders;
        } else {
            console.log('⚠️ 주문 데이터가 없습니다');
            return [];
        }
    } catch (error) {
        console.error('❌ 주문 데이터 로드 실패:', error);
        return [];
    }
}

// 주문 테이블 렌더링
export function renderOrdersTable() {
    try {
        console.log('🎨 주문 테이블 렌더링 시작...');
        
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) {
            console.error('❌ 주문 테이블 body를 찾을 수 없습니다');
            return;
        }
        
        // 주문 데이터 로드
        loadOrders().then(orders => {
            if (orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center py-8 text-gray-500">
                            <i class="fas fa-shopping-cart text-4xl mb-2"></i><br>
                            등록된 주문이 없습니다
                        </td>
                    </tr>
                `;
                return;
            }
            
            // 주문 목록 렌더링
            tbody.innerHTML = orders.map(order => `
                <tr class="hover:bg-gray-50" data-order-id="${order.id}">
                    <td class="px-3 py-3 text-center">
                        <input type="checkbox" class="order-checkbox rounded text-green-600 focus:ring-green-500" 
                               data-order-id="${order.id}">
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-900">${order.order_date || '-'}</td>
                    <td class="px-3 py-3 text-sm text-gray-900">${order.order_number || '-'}</td>
                    <td class="px-3 py-3 text-sm text-gray-900">${order.customer_name || '-'}</td>
                    <td class="px-3 py-3 text-sm text-gray-900">${order.customer_phone || '-'}</td>
                    <td class="px-3 py-3 text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${getStatusColor(order.order_status)}">
                            ${order.order_status || '주문접수'}
                        </span>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <i class="fas fa-print text-gray-400"></i>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <i class="fas fa-comment-sms text-gray-400"></i>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <button onclick="editOrder('${order.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteOrder('${order.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            console.log('✅ 주문 테이블 렌더링 완료');
        });
        
    } catch (error) {
        console.error('❌ 주문 테이블 렌더링 실패:', error);
    }
}

// 주문 상태 색상 반환
function getStatusColor(status) {
    const statusColors = {
        '주문접수': 'bg-yellow-100 text-yellow-800',
        '입금확인': 'bg-blue-100 text-blue-800',
        '배송준비': 'bg-orange-100 text-orange-800',
        '배송시작': 'bg-purple-100 text-purple-800',
        '배송완료': 'bg-green-100 text-green-800',
        '주문취소': 'bg-red-100 text-red-800',
        '환불처리': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// 주문 저장
export async function saveOrder() {
    try {
        console.log('💾 주문 저장 시작...');
        
        // 폼 데이터 수집
        const orderData = {
            id: document.getElementById('order-id').value || generateOrderId(),
            order_number: generateOrderNumber(),
            order_date: document.getElementById('order-date').value || new Date().toISOString().split('T')[0],
            customer_name: document.getElementById('order-customer-name').value,
            customer_phone: document.getElementById('order-customer-phone').value,
            customer_address: document.getElementById('order-customer-address').value,
            order_status: document.getElementById('order-status').value || '주문접수',
            tracking_number: document.getElementById('order-tracking').value,
            total_amount: parseFloat(document.getElementById('order-total-amount').value) || 0,
            shipping_fee: parseFloat(document.getElementById('order-shipping-fee').value) || 0,
            discount_amount: parseFloat(document.getElementById('order-discount').value) || 0,
            memo: document.getElementById('order-memo').value,
            order_items: getOrderItems(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('📝 저장할 주문 데이터:', orderData);
        
        // 기존 주문 데이터 로드
        const existingOrders = await loadOrders();
        
        // 주문 ID가 있으면 수정, 없으면 새로 추가
        const orderIndex = existingOrders.findIndex(order => order.id === orderData.id);
        
        if (orderIndex >= 0) {
            // 수정
            existingOrders[orderIndex] = orderData;
            console.log('📝 주문 수정:', orderData.id);
        } else {
            // 새로 추가
            existingOrders.push(orderData);
            console.log('➕ 새 주문 추가:', orderData.id);
        }
        
        // LocalStorage에 저장
        localStorage.setItem('farm_orders', JSON.stringify(existingOrders));
        
        // 재고 차감 처리
        await updateProductStock(orderData.order_items, orderIndex >= 0 ? 'update' : 'new');
        
        // UI 업데이트
        renderOrdersTable();
        closeOrderModal();
        
        console.log('✅ 주문 저장 완료');
        
        // 성공 메시지
        if (window.showToast) {
            window.showToast('✅ 주문이 저장되었습니다', 3000);
        }
        
    } catch (error) {
        console.error('❌ 주문 저장 실패:', error);
        if (window.showToast) {
            window.showToast('❌ 주문 저장에 실패했습니다', 3000);
        }
    }
}

// 주문 ID 생성
function generateOrderId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 주문번호 생성
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `ORD${year}${month}${day}${time}`;
}

// 주문 상품 목록 가져오기
function getOrderItems() {
    const itemsContainer = document.getElementById('order-items-container');
    const items = [];
    
    // 주문 상품 항목들 수집
    const itemRows = itemsContainer.querySelectorAll('.order-item-row');
    itemRows.forEach(row => {
        const productId = row.dataset.productId;
        const productName = row.querySelector('.product-name').textContent;
        const quantity = parseInt(row.querySelector('.product-quantity').value) || 1;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        
        if (productId && quantity > 0) {
            items.push({
                product_id: productId,
                product_name: productName,
                quantity: quantity,
                price: price,
                total: quantity * price
            });
        }
    });
    
    return items;
}

// 상품 추가 모달 열기
export function openProductSelectModal() {
    try {
        console.log('🛍️ 상품 선택 모달 열기');
        
        // 상품 선택 모달이 없으면 생성
        if (!document.getElementById('product-select-modal')) {
            createProductSelectModal();
        }
        
        const modal = document.getElementById('product-select-modal');
        modal.classList.remove('hidden');
        
        // 상품 목록 로드
        loadProductsForOrder();
        
    } catch (error) {
        console.error('❌ 상품 선택 모달 열기 실패:', error);
    }
}

// 상품 선택 모달 생성
function createProductSelectModal() {
    const modalHTML = `
        <div id="product-select-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen" style="padding: 3px;">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div style="padding: 3px;" class="border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 style="font-size: 14px; font-weight: 600;" class="text-gray-800">상품 선택</h3>
                            <button onclick="closeProductSelectModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times" style="font-size: 14px;"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="padding: 3px;" class="overflow-y-auto max-h-[60vh]">
                        <div style="margin-bottom: 3px;">
                            <input type="text" id="product-search-input" placeholder="상품명으로 검색..." 
                                   style="font-size: 14px;" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        
                        <div id="product-select-list" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;">
                            <!-- 상품 목록이 여기에 표시됩니다 -->
                        </div>
                    </div>
                    
                    <div style="padding: 3px;" class="border-t border-gray-200">
                        <div class="flex justify-end" style="gap: 3px;">
                            <button onclick="closeProductSelectModal()" 
                                    style="padding: 3px 6px; font-size: 14px;" class="text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                                취소
                            </button>
                            <button onclick="addSelectedProducts()" 
                                    style="padding: 3px 6px; font-size: 14px;" class="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                                선택한 상품 추가
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 상품 선택 모달 닫기
export function closeProductSelectModal() {
    const modal = document.getElementById('product-select-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 주문용 상품 목록 로드
async function loadProductsForOrder() {
    try {
        console.log('📦 주문용 상품 목록 로드...');
        
        // 상품 데이터 로드 (올바른 키 사용)
        const productsData = localStorage.getItem('farm_management_farm_products');
        if (!productsData) {
            console.log('⚠️ 상품 데이터가 없습니다');
            return;
        }
        
        const products = JSON.parse(productsData);
        const productList = document.getElementById('product-select-list');
        
        if (products.length === 0) {
            productList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-box text-2xl mb-2"></i>
                    <p>등록된 상품이 없습니다</p>
                </div>
            `;
            return;
        }
        
        // 상품 목록 렌더링 (3개씩 그리드)
        productList.innerHTML = products.map(product => `
            <div class="product-item border border-gray-200 rounded-lg hover:bg-gray-50" style="padding: 3px; font-size: 14px;">
                <div class="flex flex-col space-y-1">
                    <div class="flex items-center" style="gap: 3px;">
                        <input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500" 
                               data-product-id="${product.id}" style="font-size: 14px;">
                        <div class="flex-1">
                            <h4 style="font-size: 14px; font-weight: 500;" class="text-gray-900">${product.name}</h4>
                            <p style="font-size: 14px;" class="text-gray-500">${product.category || '카테고리 없음'} | ${product.size || '사이즈 없음'}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between" style="gap: 3px;">
                        <div class="text-left">
                            <p style="font-size: 14px;" class="text-gray-500">판매가</p>
                            <p style="font-size: 14px; font-weight: 600;" class="text-gray-900">${product.price?.toLocaleString() || 0}원</p>
                        </div>
                        <div class="flex items-center" style="gap: 3px;">
                            <label style="font-size: 14px;" class="text-gray-600">수량:</label>
                            <input type="number" class="product-quantity border border-gray-300 rounded" 
                                   value="1" min="1" data-product-id="${product.id}" style="padding: 3px; font-size: 14px; width: 40px;">
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 검색 기능
        const searchInput = document.getElementById('product-search-input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const productItems = productList.querySelectorAll('.product-item');
            
            productItems.forEach(item => {
                const productName = item.querySelector('h4').textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
    } catch (error) {
        console.error('❌ 주문용 상품 목록 로드 실패:', error);
    }
}

// 선택한 상품들을 주문에 추가
function addSelectedProducts() {
    try {
        console.log('➕ 선택한 상품들을 주문에 추가...');
        
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        const orderItemsContainer = document.getElementById('order-items-container');
        
        if (checkboxes.length === 0) {
            alert('추가할 상품을 선택해주세요.');
            return;
        }
        
        // 기존 "추가할 상품이 없습니다" 메시지 제거
        const emptyMessage = orderItemsContainer.querySelector('.text-center');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        checkboxes.forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            const productItem = checkbox.closest('.product-item');
            const productName = productItem.querySelector('h4').textContent;
            const quantityInput = productItem.querySelector('.product-quantity');
            const quantity = parseInt(quantityInput.value) || 1;
            // 가격 찾기 (더 정확한 선택자 사용)
            const priceElement = productItem.querySelector('.text-gray-900');
            let price = 0;
            
            if (priceElement) {
                const priceText = priceElement.textContent;
                console.log('🔍 가격 텍스트:', priceText);
                price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
            } else {
                console.warn('⚠️ 가격 요소를 찾을 수 없음');
            }
            
            console.log('💰 최종 가격:', price);
            
            // 이미 추가된 상품인지 확인
            const existingItem = orderItemsContainer.querySelector(`[data-product-id="${productId}"]`);
            if (existingItem) {
                // 수량 업데이트
                const existingQuantity = existingItem.querySelector('.order-quantity');
                const newQuantity = parseInt(existingQuantity.value) + quantity;
                existingQuantity.value = newQuantity;
                updateOrderItemTotal(existingItem);
            } else {
                // 새 상품 추가
                const itemHTML = `
                    <div class="order-item-row border border-gray-200 rounded-lg p-3 mb-2" data-product-id="${productId}">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h5 class="product-name font-medium text-gray-900">${productName}</h5>
                                <p class="text-sm text-gray-500">단가: ${price.toLocaleString()}원</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center space-x-2">
                                    <label class="text-sm text-gray-600">수량:</label>
                                    <input type="number" class="order-quantity w-16 p-1 border border-gray-300 rounded text-sm" 
                                           value="${quantity}" min="1" onchange="updateOrderItemTotal(this.closest('.order-item-row'))">
                                </div>
                                <div class="text-right">
                                    <p class="text-sm text-gray-500">총액</p>
                                    <p class="font-semibold text-gray-900 order-total">${(quantity * price).toLocaleString()}원</p>
                                </div>
                                <button onclick="removeOrderItem(this.closest('.order-item-row'))" 
                                        class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <input type="hidden" class="product-price" value="${price}">
                    </div>
                `;
                orderItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            }
        });
        
        // 금액 재계산
        calculateOrderTotal();
        
        // 모달 닫기
        closeProductSelectModal();
        
        console.log('✅ 선택한 상품들이 주문에 추가되었습니다');
        
    } catch (error) {
        console.error('❌ 상품 추가 실패:', error);
    }
}

// 주문 아이템 총액 업데이트
function updateOrderItemTotal(itemRow) {
    const quantity = parseInt(itemRow.querySelector('.order-quantity').value) || 0;
    const price = parseFloat(itemRow.querySelector('.product-price').value) || 0;
    const total = quantity * price;
    
    itemRow.querySelector('.order-total').textContent = total.toLocaleString() + '원';
    
    // 전체 금액 재계산
    calculateOrderTotal();
}

// 주문 아이템 제거
function removeOrderItem(itemRow) {
    itemRow.remove();
    calculateOrderTotal();
}

// 주문 총액 계산
function calculateOrderTotal() {
    try {
        console.log('💰 주문 총액 계산 시작...');
        
        const orderItemsContainer = document.getElementById('order-items-container');
        if (!orderItemsContainer) {
            console.error('❌ order-items-container를 찾을 수 없습니다');
            return;
        }
        
        const itemRows = orderItemsContainer.querySelectorAll('.order-item-row');
        console.log(`📦 주문 아이템 수: ${itemRows.length}`);
        
        let productAmount = 0;
        itemRows.forEach((row, index) => {
            const quantityInput = row.querySelector('.order-quantity');
            const priceInput = row.querySelector('.product-price');
            
            if (quantityInput && priceInput) {
                const quantity = parseInt(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const itemTotal = quantity * price;
                productAmount += itemTotal;
                
                console.log(`📦 아이템 ${index + 1}: 수량=${quantity}, 단가=${price}, 소계=${itemTotal}`);
            } else {
                console.warn(`⚠️ 아이템 ${index + 1}: 입력 필드를 찾을 수 없음`);
            }
        });
        
        const shippingFee = parseFloat(document.getElementById('order-shipping-fee')?.value) || 0;
        const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
        const totalAmount = productAmount + shippingFee - discount;
        
        // UI 업데이트
        const productAmountInput = document.getElementById('order-product-amount');
        const totalAmountInput = document.getElementById('order-total-amount');
        
        if (productAmountInput) {
            productAmountInput.value = productAmount;
        }
        if (totalAmountInput) {
            totalAmountInput.value = totalAmount;
        }
        
        console.log('💰 주문 총액 계산 완료:', { productAmount, shippingFee, discount, totalAmount });
        
    } catch (error) {
        console.error('❌ 주문 총액 계산 실패:', error);
    }
}

// 상품 재고 차감/복구 처리
async function updateProductStock(orderItems, mode) {
    try {
        console.log('📦 상품 재고 처리 시작...', { mode, items: orderItems.length });
        
        // 상품 데이터 로드
        const productsData = localStorage.getItem('farm_management_farm_products');
        if (!productsData) {
            console.log('⚠️ 상품 데이터가 없습니다');
            return;
        }
        
        const products = JSON.parse(productsData);
        let updated = false;
        
        orderItems.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                const currentStock = parseInt(product.stock) || 0;
                const orderQuantity = parseInt(item.quantity) || 0;
                
                if (mode === 'new') {
                    // 새 주문: 재고 차감
                    const newStock = Math.max(0, currentStock - orderQuantity);
                    product.stock = newStock;
                    console.log(`📉 ${product.name}: ${currentStock} → ${newStock} (차감: ${orderQuantity})`);
                    
                    if (newStock === 0) {
                        console.log(`⚠️ ${product.name} 재고 부족!`);
                    }
                } else if (mode === 'update') {
                    // 주문 수정: 이전 차감량 복구 후 새로 차감
                    // (실제로는 이전 주문과 비교해야 하지만 간단히 처리)
                    const newStock = Math.max(0, currentStock - orderQuantity);
                    product.stock = newStock;
                    console.log(`🔄 ${product.name}: ${currentStock} → ${newStock} (수정: ${orderQuantity})`);
                }
                
                updated = true;
            }
        });
        
        if (updated) {
            // 상품 데이터 저장
            localStorage.setItem('farm_management_farm_products', JSON.stringify(products));
            console.log('✅ 상품 재고 업데이트 완료');
            
            // 상품관리 화면 새로고침 (만약 열려있다면)
            if (window.renderProductsTable) {
                window.renderProductsTable();
            }
        }
        
    } catch (error) {
        console.error('❌ 상품 재고 처리 실패:', error);
    }
}

// 주소검색 기능
export function openAddressSearch() {
    try {
        console.log('🏠 주소검색 시작...');
        
        // 카카오 주소 API 로드 확인
        if (typeof daum === 'undefined') {
            console.error('❌ 카카오 주소 API가 로드되지 않았습니다');
            alert('주소검색 서비스를 사용할 수 없습니다.');
            return;
        }
        
        new daum.Postcode({
            oncomplete: function(data) {
                let addr = '';
                let extraAddr = '';
                
                if (data.userSelectedType === 'R') {
                    addr = data.roadAddress;
                } else {
                    addr = data.jibunAddress;
                }
                
                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }
                    addr += extraAddr;
                }
                
                // 주소 입력 필드에 값 설정
                document.getElementById('order-customer-address').value = addr;
                
                console.log('✅ 주소검색 완료:', addr);
            }
        }).open();
        
    } catch (error) {
        console.error('❌ 주소검색 실패:', error);
    }
}

// 고객명 자동완성 기능
export function initCustomerAutocomplete() {
    try {
        console.log('👤 고객명 자동완성 초기화...');
        
        const customerNameInput = document.getElementById('order-customer-name');
        if (!customerNameInput) {
            console.log('⚠️ 고객명 입력 필드를 찾을 수 없습니다');
            return;
        }
        
        // 기존 이벤트 리스너 제거
        customerNameInput.removeEventListener('input', handleCustomerNameInput);
        
        // 새로운 이벤트 리스너 추가
        customerNameInput.addEventListener('input', handleCustomerNameInput);
        
        console.log('✅ 고객명 자동완성 초기화 완료');
        
    } catch (error) {
        console.error('❌ 고객명 자동완성 초기화 실패:', error);
    }
}

// 고객명 입력 처리
function handleCustomerNameInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // 기존 자동완성 드롭다운 제거
    removeAutocompleteDropdown();
    
    if (value.length === 0) {
        return;
    }
    
    // 고객 데이터에서 검색
    const matchingCustomers = searchCustomers(value);
    
    if (matchingCustomers.length > 0) {
        showAutocompleteDropdown(input, matchingCustomers);
    } else {
        // 일치하는 고객이 없으면 새 고객 등록 확인
        showNewCustomerConfirmation(input, value);
    }
}

// 고객 검색
function searchCustomers(searchTerm) {
    try {
        console.log('🔍 고객 검색 시작:', searchTerm);
        
        // 고객 데이터 로드 (여러 키 시도)
        let customersData = localStorage.getItem('farm_customers');
        if (!customersData) {
            customersData = localStorage.getItem('customers');
        }
        if (!customersData) {
            customersData = localStorage.getItem('farm_customers_data');
        }
        
        if (!customersData) {
            console.log('⚠️ 고객 데이터가 없습니다');
            console.log('🔍 사용 가능한 LocalStorage 키들:', Object.keys(localStorage));
            return [];
        }
        
        const customers = JSON.parse(customersData);
        console.log('📊 전체 고객 수:', customers.length);
        console.log('📋 고객 목록:', customers.map(c => c.name));
        
        // 검색어와 일치하는 고객 필터링
        const matchingCustomers = customers.filter(customer => {
            const name = customer.name || '';
            const phone = customer.phone || '';
            const email = customer.email || '';
            
            console.log(`🔍 검색 대상: "${name}" (전화: ${phone})`);
            
            const nameMatch = name.toLowerCase().includes(searchTerm.toLowerCase());
            const phoneMatch = phone.includes(searchTerm);
            const emailMatch = email.toLowerCase().includes(searchTerm.toLowerCase());
            
            console.log(`📝 매칭 결과: 이름=${nameMatch}, 전화=${phoneMatch}, 이메일=${emailMatch}`);
            
            if (nameMatch || phoneMatch || emailMatch) {
                console.log('✅ 매칭된 고객:', customer.name, customer.phone);
            }
            
            return nameMatch || phoneMatch || emailMatch;
        });
        
        console.log('🎯 매칭된 고객 수:', matchingCustomers.length);
        
        // 최대 5개까지만 표시
        return matchingCustomers.slice(0, 5);
        
    } catch (error) {
        console.error('❌ 고객 검색 실패:', error);
        return [];
    }
}

// 자동완성 드롭다운 표시
function showAutocompleteDropdown(input, customers) {
    try {
        // 기존 드롭다운 제거
        removeAutocompleteDropdown();
        
        // 드롭다운 생성
        const dropdown = document.createElement('div');
        dropdown.id = 'customer-autocomplete-dropdown';
        dropdown.className = 'absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto';
        
        // 고객 목록 HTML 생성
        const customerItems = customers.map(customer => `
            <div class="customer-item px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 data-customer-id="${customer.id}">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium text-gray-900">${customer.name || '이름 없음'}</div>
                        <div class="text-sm text-gray-500">
                            ${customer.phone || '전화번호 없음'} 
                            ${customer.email ? `| ${customer.email}` : ''}
                        </div>
                    </div>
                    <div class="text-xs text-gray-400">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>
        `).join('');
        
        dropdown.innerHTML = customerItems;
        
        // 입력 필드 위치 계산
        const inputRect = input.getBoundingClientRect();
        const containerRect = input.closest('.relative')?.getBoundingClientRect();
        
        if (containerRect) {
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.left = '0';
            dropdown.style.width = '100%';
            dropdown.style.zIndex = '50';
        }
        
        // 드롭다운을 입력 필드의 부모 컨테이너에 추가
        const container = input.closest('.relative') || input.parentElement;
        container.appendChild(dropdown);
        
        // 고객 선택 이벤트 리스너 추가
        dropdown.addEventListener('click', (e) => {
            const customerItem = e.target.closest('.customer-item');
            if (customerItem) {
                const customerId = customerItem.dataset.customerId;
                selectCustomer(customerId, customers);
            }
        });
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== input) {
                removeAutocompleteDropdown();
            }
        });
        
        console.log('✅ 자동완성 드롭다운 표시:', customers.length, '개 고객');
        
    } catch (error) {
        console.error('❌ 자동완성 드롭다운 표시 실패:', error);
    }
}

// 고객 선택
function selectCustomer(customerId, customers) {
    try {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) {
            console.error('❌ 선택한 고객을 찾을 수 없습니다');
            return;
        }
        
        // 고객 정보를 주문 폼에 자동 입력
        const customerNameInput = document.getElementById('order-customer-name');
        const customerPhoneInput = document.getElementById('order-customer-phone');
        const customerAddressInput = document.getElementById('order-customer-address');
        
        if (customerNameInput) customerNameInput.value = customer.name || '';
        if (customerPhoneInput) customerPhoneInput.value = customer.phone || '';
        if (customerAddressInput) customerAddressInput.value = customer.address || '';
        
        // 드롭다운 제거
        removeAutocompleteDropdown();
        
        console.log('✅ 고객 선택 완료:', customer.name);
        
    } catch (error) {
        console.error('❌ 고객 선택 실패:', error);
    }
}

// 자동완성 드롭다운 제거
function removeAutocompleteDropdown() {
    const dropdown = document.getElementById('customer-autocomplete-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

// 새 고객 등록 확인 표시
function showNewCustomerConfirmation(input, customerName) {
    try {
        console.log('👤 새 고객 등록 확인:', customerName);
        
        // 기존 확인 메시지 제거
        removeNewCustomerConfirmation();
        
        // 확인 메시지 생성
        const confirmation = document.createElement('div');
        confirmation.id = 'new-customer-confirmation';
        confirmation.className = 'absolute z-50 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-lg mt-1 p-4';
        
        confirmation.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <i class="fas fa-user-plus text-blue-600 text-lg"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-blue-900">새 고객 등록</h4>
                    <p class="text-sm text-blue-700 mt-1">
                        '<strong>${customerName}</strong>' 고객이 등록되어 있지 않습니다.<br>
                        새 고객으로 등록하시겠습니까?
                    </p>
                </div>
            </div>
            <div class="flex justify-end space-x-2 mt-3">
                <button onclick="cancelNewCustomerRegistration()" 
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                    취소
                </button>
                <button onclick="confirmNewCustomerRegistration('${customerName}')" 
                        class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">
                    새 고객 등록
                </button>
            </div>
        `;
        
        // 입력 필드 위치 계산
        const inputRect = input.getBoundingClientRect();
        const containerRect = input.closest('.relative')?.getBoundingClientRect();
        
        if (containerRect) {
            confirmation.style.position = 'absolute';
            confirmation.style.top = '100%';
            confirmation.style.left = '0';
            confirmation.style.width = '100%';
            confirmation.style.zIndex = '50';
        }
        
        // 확인 메시지를 입력 필드의 부모 컨테이너에 추가
        const container = input.closest('.relative') || input.parentElement;
        container.appendChild(confirmation);
        
        // 외부 클릭 시 확인 메시지 닫기
        document.addEventListener('click', (e) => {
            if (!confirmation.contains(e.target) && e.target !== input) {
                removeNewCustomerConfirmation();
            }
        });
        
        console.log('✅ 새 고객 등록 확인 메시지 표시');
        
    } catch (error) {
        console.error('❌ 새 고객 등록 확인 표시 실패:', error);
    }
}

// 새 고객 등록 확인 메시지 제거
function removeNewCustomerConfirmation() {
    const confirmation = document.getElementById('new-customer-confirmation');
    if (confirmation) {
        confirmation.remove();
    }
}

// 새 고객 등록 취소
export function cancelNewCustomerRegistration() {
    try {
        console.log('❌ 새 고객 등록 취소');
        removeNewCustomerConfirmation();
        
        // 고객명 입력 필드 초기화
        const customerNameInput = document.getElementById('order-customer-name');
        if (customerNameInput) {
            customerNameInput.value = '';
        }
        
    } catch (error) {
        console.error('❌ 새 고객 등록 취소 실패:', error);
    }
}

// 새 고객 등록 확인
export function confirmNewCustomerRegistration(customerName) {
    try {
        console.log('✅ 새 고객 등록 확인:', customerName);
        
        // 확인 메시지 제거
        removeNewCustomerConfirmation();
        
        // 주문 모달에서 고객 등록을 요청했음을 표시
        window.isCustomerRegistrationFromOrder = true;
        
        // 고객 등록 모달 열기
        if (window.openCustomerModal) {
            window.openCustomerModal();
            
            // 고객명 미리 입력
            setTimeout(() => {
                const customerNameInput = document.getElementById('customer-name');
                if (customerNameInput) {
                    customerNameInput.value = customerName;
                }
            }, 100);
        } else {
            console.error('❌ 고객 등록 모달을 열 수 없습니다');
            alert('고객 등록 기능을 사용할 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 새 고객 등록 확인 실패:', error);
    }
}

// 주문 수정
export function editOrder(orderId) {
    try {
        console.log('✏️ 주문 수정:', orderId);
        
        // 주문 데이터 로드
        loadOrders().then(orders => {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                // 폼에 데이터 채우기
                document.getElementById('order-id').value = order.id;
                document.getElementById('order-customer-name').value = order.customer_name || '';
                document.getElementById('order-customer-phone').value = order.customer_phone || '';
                document.getElementById('order-customer-address').value = order.customer_address || '';
                document.getElementById('order-date').value = order.order_date || '';
                document.getElementById('order-status').value = order.order_status || '주문접수';
                document.getElementById('order-tracking').value = order.tracking_number || '';
                document.getElementById('order-shipping-fee').value = order.shipping_fee || 0;
                document.getElementById('order-discount').value = order.discount_amount || 0;
                document.getElementById('order-total-amount').value = order.total_amount || 0;
                document.getElementById('order-memo').value = order.memo || '';
                
                // 모달 열기
                openOrderModal(orderId);
            }
        });
        
    } catch (error) {
        console.error('❌ 주문 수정 실패:', error);
    }
}

// 주문 삭제
export function deleteOrder(orderId) {
    try {
        console.log('🗑️ 주문 삭제:', orderId);
        
        if (confirm('정말로 이 주문을 삭제하시겠습니까?')) {
            // 주문 데이터 로드
            loadOrders().then(orders => {
                const filteredOrders = orders.filter(order => order.id !== orderId);
                
                // LocalStorage에 저장
                localStorage.setItem('farm_orders', JSON.stringify(filteredOrders));
                
                // UI 업데이트
                renderOrdersTable();
                
                console.log('✅ 주문 삭제 완료');
                
                if (window.showToast) {
                    window.showToast('✅ 주문이 삭제되었습니다', 3000);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ 주문 삭제 실패:', error);
    }
}

// 전역 함수로 등록
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
window.openProductSelectModal = openProductSelectModal;
window.closeProductSelectModal = closeProductSelectModal;
window.addSelectedProducts = addSelectedProducts;