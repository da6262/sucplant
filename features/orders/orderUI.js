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
        
        if (orderId) {
            // 수정 모드
            modalTitle.textContent = '주문 정보 수정';
            loadOrderData(orderId);
        } else {
            // 등록 모드
            modalTitle.textContent = '새 주문 등록';
            clearOrderForm();
        }
        
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
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        console.log('주문 모달 닫기 완료');
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

// 주문 폼 초기화
export function clearOrderForm() {
    try {
        console.log('주문 폼 초기화');
        
        // 주문일자를 오늘 날짜로 설정
        const today = new Date().toISOString().split('T')[0];
        const orderDateInput = document.getElementById('order-date');
        if (orderDateInput) {
            orderDateInput.value = today;
        }
        
        // 기타 폼 필드 초기화
        const form = document.getElementById('order-modal');
        if (form && form.reset) {
            form.reset();
            // 주문일자는 다시 오늘 날짜로 설정 (reset 후에)
            if (orderDateInput) {
                orderDateInput.value = today;
            }
        } else {
            // form.reset이 없는 경우 수동으로 필드 초기화
            const inputs = form?.querySelectorAll('input, select, textarea');
            if (inputs) {
                inputs.forEach(input => {
                    if (input.id !== 'order-date') { // 주문일자는 제외
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = false;
                        } else {
                            input.value = '';
                        }
                    }
                });
            }
            // 주문일자는 다시 오늘 날짜로 설정
            if (orderDateInput) {
                orderDateInput.value = today;
            }
        }
        
        console.log('주문 폼 초기화 완료, 주문일자:', today);
    } catch (error) {
        console.error('주문 폼 초기화 실패:', error);
    }
}

// 피킹 리스트 모달 열기
export function openPickingListModal() {
    try {
        console.log('피킹 리스트 모달 열기');
        
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
        
        // 선택된 주문들 가져오기
        const selectedOrders = getSelectedOrders();
        
        if (selectedOrders.length === 0) {
            alert('피킹할 주문을 선택해주세요.');
            return;
        }
        
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
            alert('포장할 주문을 선택해주세요.');
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
        const checkboxes = document.querySelectorAll('.order-checkbox:checked');
        const selectedOrders = [];
        
        checkboxes.forEach(checkbox => {
            const orderId = checkbox.value;
            // 주문 데이터에서 해당 ID 찾기
            // 실제 구현에서는 주문 데이터를 참조해야 함
            selectedOrders.push({ id: orderId });
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
        const ordersData = localStorage.getItem('farm_orders') || localStorage.getItem('orders');
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
export async function renderOrdersTable() {
    try {
        console.log('🎨 주문 테이블 렌더링 시작...');
        
        // 주문 데이터 로드
        const orders = await loadOrders();
        console.log(`📦 로드된 주문 수: ${orders.length}개`);
        
        // 주문 테이블 컨테이너 찾기
        const ordersTableBody = document.getElementById('orders-table-body');
        if (!ordersTableBody) {
            console.error('❌ 주문 테이블 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        등록된 주문이 없습니다
                    </td>
                </tr>
            `;
            console.log('📭 주문 데이터가 없습니다');
            return;
        }
        
        // 주문 테이블 렌더링
        ordersTableBody.innerHTML = orders.map(order => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="order-checkbox rounded text-green-600 focus:ring-green-500" 
                           value="${order.id}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.order_number || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.order_date || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.customer_name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.customer_phone || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}">
                        ${order.order_status || '주문접수'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total_amount ? order.total_amount.toLocaleString() + '원' : '0원'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex justify-center space-x-2">
                        <button onclick="editOrder('${order.id}')" 
                                class="text-blue-600 hover:text-blue-800 font-medium text-xs">
                            <i class="fas fa-edit mr-1"></i>수정
                        </button>
                        <button onclick="deleteOrder('${order.id}')" 
                                class="text-red-600 hover:text-red-800 font-medium text-xs">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ 주문 테이블 렌더링 완료: ${orders.length}개`);
        
    } catch (error) {
        console.error('❌ 주문 테이블 렌더링 실패:', error);
    }
}

// 주문 상태 색상 가져오기
function getStatusColor(status) {
    const statusColors = {
        '주문접수': 'bg-gray-100 text-gray-800',
        '입금확인': 'bg-blue-100 text-blue-800',
        '배송준비': 'bg-yellow-100 text-yellow-800',
        '배송시작': 'bg-purple-100 text-purple-800',
        '배송완료': 'bg-green-100 text-green-800',
        '주문취소': 'bg-red-100 text-red-800',
        '환불처리': 'bg-red-100 text-red-800'
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
        console.log('💾 저장된 주문 수:', existingOrders.length);
        
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
        const productName = row.querySelector('.product-name')?.textContent || '';
        const quantityInput = row.querySelector('.order-quantity');
        const priceInput = row.querySelector('.product-price');
        
        if (!quantityInput || !priceInput) {
            console.warn('⚠️ 주문 아이템에서 입력 필드를 찾을 수 없음:', productId);
            return;
        }
        
        const quantity = parseInt(quantityInput.value) || 1;
        const price = parseFloat(priceInput.value) || 0;
        
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

// 상품 재고 업데이트
async function updateProductStock(orderItems, mode) {
    try {
        console.log('📦 상품 재고 업데이트:', mode);
        // 재고 업데이트 로직 구현
    } catch (error) {
        console.error('❌ 재고 업데이트 실패:', error);
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
            loadOrders().then(orders => {
                const filteredOrders = orders.filter(order => order.id !== orderId);
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

// 상품 선택 모달 열기
export function openProductSelectModal() {
    try {
        console.log('🛍️ 상품 선택 모달 열기');
        
        const modal = document.getElementById('product-select-modal');
        if (modal) {
            modal.classList.remove('hidden');
            loadProductsForOrder();
        }
        
    } catch (error) {
        console.error('❌ 상품 선택 모달 열기 실패:', error);
    }
}

// 상품 선택 모달 닫기
export function closeProductSelectModal() {
    try {
        const modal = document.getElementById('product-select-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        console.log('✅ 상품 선택 모달 닫기 완료');
    } catch (error) {
        console.error('❌ 상품 선택 모달 닫기 실패:', error);
    }
}

// 주문용 상품 목록 로드
async function loadProductsForOrder() {
    try {
        console.log('🛍️ 주문용 상품 목록 로드 시작...');
        
        // 상품 데이터 로드
        const productsData = localStorage.getItem('farm_products') || localStorage.getItem('products');
        const products = productsData ? JSON.parse(productsData) : [];
        
        console.log(`📦 로드된 상품 수: ${products.length}개`);
        
        const productList = document.getElementById('product-list');
        if (!productList) {
            console.error('❌ 상품 목록 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        if (products.length === 0) {
            productList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-leaf text-4xl mb-2"></i><br>
                    등록된 상품이 없습니다
                </div>
            `;
            return;
        }
        
        // 상품 데이터를 전역 변수로 설정
        window.allProducts = products;
        console.log('🌍 전역 상품 데이터 설정:', products.length, '개');
        
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
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const productItems = document.querySelectorAll('.product-item');
                
                productItems.forEach(item => {
                    const productName = item.querySelector('h4').textContent.toLowerCase();
                    const productCategory = item.querySelector('p').textContent.toLowerCase();
                    
                    if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        console.log('✅ 주문용 상품 목록 로드 완료');
        
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
            
            // 상품 데이터에서 직접 가격 가져오기
            let price = 0;
            try {
                // 상품 목록에서 해당 상품 찾기
                const allProducts = window.allProducts || [];
                const product = allProducts.find(p => p.id === productId);
                if (product && product.price) {
                    price = parseFloat(product.price) || 0;
                    console.log('💰 상품 데이터에서 가격 가져옴:', product.name, price);
                } else {
                    console.warn('⚠️ 상품 데이터에서 가격을 찾을 수 없음:', productId);
                }
            } catch (error) {
                console.error('❌ 가격 가져오기 실패:', error);
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
        
        console.log(`💰 계산 완료: 상품금액=${productAmount}, 배송비=${shippingFee}, 할인=${discount}, 총액=${totalAmount}`);
        
    } catch (error) {
        console.error('❌ 주문 총액 계산 실패:', error);
    }
}

// 고객명 자동완성 초기화
export function initCustomerAutocomplete() {
    try {
        console.log('👤 고객명 자동완성 초기화...');
        
        const customerNameInput = document.getElementById('order-customer-name');
        if (!customerNameInput) {
            console.warn('⚠️ 고객명 입력 필드를 찾을 수 없습니다');
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
    const value = input.value.toLowerCase();
    
    if (value.length < 2) {
        hideCustomerSuggestions();
        return;
    }
    
    // 고객 데이터에서 검색
    const customersData = localStorage.getItem('farm_customers') || localStorage.getItem('customers');
    const customers = customersData ? JSON.parse(customersData) : [];
    
    const matchingCustomers = customers.filter(customer => 
        customer.name && customer.name.toLowerCase().includes(value)
    );
    
    if (matchingCustomers.length > 0) {
        showCustomerSuggestions(matchingCustomers, input);
    } else {
        hideCustomerSuggestions();
    }
}

// 고객 제안 표시
function showCustomerSuggestions(customers, input) {
    hideCustomerSuggestions();
    
    const suggestions = document.createElement('div');
    suggestions.id = 'customer-suggestions';
    suggestions.className = 'absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto';
    
    customers.forEach(customer => {
        const item = document.createElement('div');
        item.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm';
        item.textContent = customer.name;
        item.addEventListener('click', () => {
            selectCustomer(customer);
            hideCustomerSuggestions();
        });
        suggestions.appendChild(item);
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(suggestions);
}

// 고객 선택
function selectCustomer(customer) {
    document.getElementById('order-customer-name').value = customer.name;
    document.getElementById('order-customer-phone').value = customer.phone || '';
    document.getElementById('order-customer-address').value = customer.address || '';
}

// 고객 제안 숨기기
function hideCustomerSuggestions() {
    const suggestions = document.getElementById('customer-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
}

// 주소 검색 열기
export function openAddressSearch() {
    try {
        console.log('🏠 주소 검색 열기');
        // 주소 검색 로직 구현
        alert('주소 검색 기능은 준비 중입니다.');
    } catch (error) {
        console.error('❌ 주소 검색 열기 실패:', error);
    }
}

// 새 고객 등록 취소
export function cancelNewCustomerRegistration() {
    try {
        console.log('❌ 새 고객 등록 취소');
        // 새 고객 등록 취소 로직
    } catch (error) {
        console.error('❌ 새 고객 등록 취소 실패:', error);
    }
}

// 새 고객 등록 확인
export function confirmNewCustomerRegistration(customerName) {
    try {
        console.log('✅ 새 고객 등록 확인:', customerName);
        // 새 고객 등록 확인 로직
    } catch (error) {
        console.error('❌ 새 고객 등록 확인 실패:', error);
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

// 디버깅 함수들
window.checkOrderData = function() {
    console.log('🔍 주문 데이터 확인:');
    console.log('farm_orders:', localStorage.getItem('farm_orders'));
    console.log('orders:', localStorage.getItem('orders'));
    
    const farmOrders = JSON.parse(localStorage.getItem('farm_orders') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    console.log('farm_orders 개수:', farmOrders.length);
    console.log('orders 개수:', orders.length);
    
    return { farmOrders, orders };
};

window.clearAllOrderData = function() {
    localStorage.removeItem('farm_orders');
    localStorage.removeItem('orders');
    console.log('🗑️ 모든 주문 데이터 삭제됨');
};