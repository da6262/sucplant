// 상태 변경 버그 디버깅 및 테스트 스크립트
console.log('🔍 상태 변경 디버깅 시작...');

// 전역 테스트 함수들
window.testStatusChange = function(orderId, newStatus) {
    console.log('🧪 테스트 상태 변경:', orderId, '→', newStatus);
    
    if (typeof orderSystem !== 'undefined' && orderSystem.updateOrderStatusInline) {
        orderSystem.updateOrderStatusInline(orderId, newStatus);
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다');
    }
};

window.checkOrderData = function() {
    console.log('📊 주문 데이터 확인:');
    
    if (typeof orderSystem !== 'undefined' && orderSystem.orders) {
        console.log('주문 총 개수:', orderSystem.orders.length);
        
        // 처음 5개 주문 데이터 확인
        orderSystem.orders.slice(0, 5).forEach((order, index) => {
            console.log(`주문 ${index + 1}:`, {
                id: order.id,
                customer: order.customer_name,
                status: order.order_status || order.status,
                total: order.total_amount
            });
        });
        
        // undefined/NaN 데이터 확인
        const corruptedOrders = orderSystem.orders.filter(order => 
            !order || !order.id || 
            order.customer_name === 'undefined' || 
            order.customer_name === 'NaN' ||
            isNaN(order.total_amount)
        );
        
        if (corruptedOrders.length > 0) {
            console.warn('⚠️ 손상된 주문 데이터 발견:', corruptedOrders.length, '개');
            corruptedOrders.slice(0, 3).forEach((order, index) => {
                console.log(`손상된 주문 ${index + 1}:`, order);
            });
        } else {
            console.log('✅ 모든 주문 데이터가 정상입니다');
        }
        
    } else {
        console.error('❌ orderSystem.orders를 찾을 수 없습니다');
    }
};

window.cleanupBadData = function() {
    console.log('🧹 손상된 데이터 정리 시작...');
    
    if (typeof orderSystem !== 'undefined' && orderSystem.orders) {
        const originalCount = orderSystem.orders.length;
        
        orderSystem.orders = orderSystem.orders.filter(order => {
            const isValid = order && order.id && 
                           order.customer_name && 
                           order.customer_name !== 'undefined' && 
                           order.customer_name !== 'NaN' &&
                           !isNaN(order.total_amount);
            return isValid;
        });
        
        const cleanedCount = orderSystem.orders.length;
        const removedCount = originalCount - cleanedCount;
        
        if (removedCount > 0) {
            console.log(`🗑️ ${removedCount}개의 손상된 주문 제거됨`);
            orderSystem.saveToLocalStorage('orders', orderSystem.orders);
            orderSystem.renderOrdersTable();
            console.log('✅ 데이터 정리 완료');
        } else {
            console.log('✅ 정리할 손상된 데이터가 없습니다');
        }
    }
};

window.forceRefreshUI = function() {
    console.log('🔄 UI 강제 새로고침...');
    
    if (typeof orderSystem !== 'undefined') {
        orderSystem.renderOrdersTable();
        orderSystem.updateStatusCounts();
        console.log('✅ UI 새로고침 완료');
    }
};

// 상태 변경 테스트 (실제 주문 ID가 있을 때 사용)
window.quickStatusTest = function() {
    console.log('⚡ 빠른 상태 변경 테스트...');
    
    if (typeof orderSystem !== 'undefined' && orderSystem.orders && orderSystem.orders.length > 0) {
        const firstOrder = orderSystem.orders[0];
        if (firstOrder && firstOrder.id) {
            const currentStatus = firstOrder.order_status || firstOrder.status;
            const newStatus = currentStatus === '주문접수' ? '결제완료' : '주문접수';
            
            console.log(`🔄 ${firstOrder.id} 상태 변경: ${currentStatus} → ${newStatus}`);
            testStatusChange(firstOrder.id, newStatus);
        } else {
            console.error('❌ 유효한 주문이 없습니다');
        }
    } else {
        console.error('❌ 주문 데이터가 없습니다');
    }
};

// 일괄 상태변경 테스트
window.testBulkStatusChange = function() {
    console.log('📦 일괄 상태변경 테스트...');
    
    if (typeof orderSystem !== 'undefined' && orderSystem.orders && orderSystem.orders.length > 0) {
        // 첫 번째 주문 체크박스 선택
        const firstCheckbox = document.querySelector('.order-checkbox');
        if (firstCheckbox) {
            firstCheckbox.checked = true;
            console.log('✅ 첫 번째 주문 선택됨');
            
            // 상태 선택
            const bulkStatusSelect = document.getElementById('bulk-status-select');
            if (bulkStatusSelect) {
                bulkStatusSelect.value = '입금확인';
                console.log('📋 상태를 "입금확인"으로 설정');
                
                // 일괄 변경 실행
                orderSystem.executeBulkStatusChange();
            } else {
                console.error('❌ 일괄 상태 선택 드롭다운을 찾을 수 없습니다');
            }
        } else {
            console.error('❌ 주문 체크박스를 찾을 수 없습니다');
        }
    } else {
        console.error('❌ 주문 데이터가 없습니다');
    }
};

// 상품 데이터 확인
window.checkProductData = function() {
    console.log('📦 상품 데이터 확인:');
    
    if (typeof orderSystem !== 'undefined' && orderSystem.products) {
        console.log('상품 총 개수:', orderSystem.products.length);
        
        // 처음 3개 상품 데이터 확인
        orderSystem.products.slice(0, 3).forEach((product, index) => {
            console.log(`상품 ${index + 1}:`, {
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                updated_at: product.updated_at ? new Date(product.updated_at).toLocaleString() : '없음'
            });
        });
        
        // LocalStorage 확인
        const localProducts = JSON.parse(localStorage.getItem('gs_products') || '[]');
        console.log('💿 LocalStorage 상품 개수:', localProducts.length);
        
    } else {
        console.error('❌ orderSystem.products를 찾을 수 없습니다');
    }
};

// 상품 새로고침 테스트
window.testProductRefresh = function() {
    console.log('🔄 상품 새로고침 테스트...');
    
    if (typeof orderSystem !== 'undefined') {
        // 현재 데이터 확인
        console.log('📋 새로고침 전 상품 개수:', orderSystem.products.length);
        
        // 새로고침
        orderSystem.loadProducts();
        
        // 결과 확인
        setTimeout(() => {
            console.log('📋 새로고침 후 상품 개수:', orderSystem.products.length);
            console.log('✅ 새로고침 테스트 완료');
        }, 1000);
    }
};

// 인라인 편집 테스트
window.testInlineEdit = function() {
    console.log('📝 인라인 편집 테스트...');
    
    // 첫 번째 편집 가능한 가격 요소 찾기
    const firstPriceElement = document.querySelector('[data-field="price"]');
    if (firstPriceElement) {
        console.log('💰 가격 편집 요소 발견:', firstPriceElement);
        console.log('📋 현재 값:', firstPriceElement.dataset.value);
        
        // 인라인 편집 시작
        if (typeof orderSystem !== 'undefined') {
            orderSystem.startInlineEdit(firstPriceElement);
            console.log('✅ 인라인 편집 시작됨');
        } else {
            console.error('❌ orderSystem을 찾을 수 없습니다');
        }
    } else {
        console.error('❌ 편집 가능한 가격 요소를 찾을 수 없습니다');
    }
};

// 라벨 인쇄 테스트
window.testLabelPrint = function() {
    console.log('🏷️ 라벨 인쇄 테스트...');
    
    if (typeof orderSystem !== 'undefined') {
        // 첫 번째 상품 체크박스 선택
        const firstCheckbox = document.querySelector('.product-checkbox');
        if (firstCheckbox) {
            firstCheckbox.checked = true;
            console.log('✅ 첫 번째 상품 체크박스 선택됨');
            
            // 수량 입력 설정
            const quantityInput = document.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = '2';
                console.log('✅ 수량 입력 설정: 2개');
            }
            
            // 라벨 타입 설정 (텍스트)
            orderSystem.selectedLabelType = 'text';
            console.log('✅ 라벨 타입 설정: text');
            
            // 라벨 인쇄 진행
            console.log('🚀 라벨 인쇄 진행 테스트...');
            orderSystem.proceedWithLabelPrint();
            
        } else {
            console.error('❌ 상품 체크박스를 찾을 수 없습니다');
        }
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다');
    }
};

// 라벨 선택 상품 확인
window.checkLabelSelection = function() {
    console.log('🔍 라벨 선택 상품 확인...');
    
    if (typeof orderSystem !== 'undefined') {
        const selectedProducts = orderSystem.getSelectedProductsForLabels();
        console.log('📦 선택된 상품들:', selectedProducts);
        
        if (selectedProducts.length === 0) {
            console.log('⚠️ 선택된 상품이 없습니다');
            
            // 체크박스 상태 확인
            const checkboxes = document.querySelectorAll('.product-checkbox');
            console.log('📋 전체 체크박스 개수:', checkboxes.length);
            
            const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
            console.log('✅ 선택된 체크박스 개수:', checkedBoxes.length);
            
        } else {
            console.log('🎉 선택된 상품 정보:');
            selectedProducts.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.product.name}: ${item.quantity}개`);
            });
        }
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다');
    }
};

console.log('✅ 디버깅 함수 로드 완료');
console.log('사용 가능한 함수:');
console.log('🔄 주문 관련:');
console.log('- testStatusChange(orderId, newStatus): 특정 주문 상태 변경 테스트');
console.log('- checkOrderData(): 주문 데이터 상태 확인');
console.log('- cleanupBadData(): 손상된 데이터 정리');
console.log('- quickStatusTest(): 첫 번째 주문으로 빠른 테스트');
console.log('- testBulkStatusChange(): 일괄 상태변경 테스트');
console.log('📦 상품 관련:');
console.log('- checkProductData(): 상품 데이터 상태 확인');
console.log('- testInlineEdit(): 인라인 편집 테스트');
console.log('- testProductRefresh(): 상품 새로고침 테스트');
console.log('🏷️ 라벨 인쇄 관련:');
console.log('- testLabelPrint(): 라벨 인쇄 테스트');
console.log('- checkLabelSelection(): 라벨 선택 상품 확인');
console.log('🔧 일반:');
console.log('- forceRefreshUI(): UI 강제 새로고침');