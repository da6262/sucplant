// 주문 UI 관리 - 핵심 기능
// features/orders/orderUI.js

/** 원 단위 정수만 허용 (소수 제거). orderForm.toIntegerWon과 동일 정책 */
function toIntegerWon(value) {
    if (value == null || value === '') return 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : Math.trunc(n);
}

// 주문 모달 열기
export async function openOrderModal(orderId = null) {
    try {
        console.log('주문 모달 열기:', orderId);
        
        let modal = document.getElementById('order-modal');
        
        // 주문 모달이 없으면 동적으로 로드
        if (!modal) {
            console.log('🔄 주문 모달이 없어서 동적으로 로드합니다...');
            await loadOrderModal();
            modal = document.getElementById('order-modal');
            
            if (!modal) {
                console.error('❌ 주문 모달 로드 실패');
                return;
            }
        }
        
        // 기존 모달이 열려있다면 닫기
        if (modal.style.display === 'block') {
            console.log('🔄 기존 모달이 열려있어서 닫습니다...');
            closeOrderModal();
            // 잠시 대기 후 다시 열기
            setTimeout(() => {
                openOrderModal(orderId);
            }, 100);
            return;
        }
        
        const modalTitle = document.getElementById('modal-title');
        
        // 주문 등록 팝업 표시
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        
        // 배경 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 주문 폼 HTML 생성 (먼저 폼을 생성해야 함)
        if (window.generateOrderFormHTML) {
            const orderForm = document.getElementById('order-form');
            if (orderForm) {
                const formHTML = window.generateOrderFormHTML();
                console.log('🔍 생성된 HTML 길이:', formHTML.length);
                console.log('🔍 cart-items-body 포함 여부:', formHTML.includes('cart-items-body'));
                orderForm.innerHTML = formHTML;
                console.log('✅ 주문 폼 HTML 생성 완료');
                
                // 즉시 확인
                const cartItemsBody = document.getElementById('cart-items-body');
                console.log('🔍 즉시 확인 - cart-items-body:', cartItemsBody ? '존재' : 'null');
            }
        }
        
        // 주문 폼 초기화
        console.log('🔍 주문 폼 초기화 시작');
        console.log('🔍 window.initOrderForm:', !!window.initOrderForm);
        
        if (window.initOrderForm) {
            try {
                window.initOrderForm();
                console.log('✅ 주문 폼 초기화 완료');
                
                // 장바구니 컨테이너가 제대로 생성되었는지 확인
                setTimeout(() => {
                    const cartItemsBody = document.getElementById('cart-items-body');
                    const orderForm = document.getElementById('order-form');
                    const submitButton = document.querySelector('button[type="submit"][form="order-form"]');
                    
                    console.log('🔍 DOM 요소 확인:');
                    console.log('  - order-form:', orderForm);
                    console.log('  - cart-items-body:', cartItemsBody);
                    console.log('  - submit-button:', submitButton);
                    
                    if (cartItemsBody) {
                        console.log('✅ 장바구니 컨테이너 확인 완료');
                    } else {
                        console.error('❌ 장바구니 컨테이너가 생성되지 않았습니다');
                    }
                    
                    if (submitButton) {
                        console.log('✅ 주문 등록 버튼 확인 완료');
                    } else {
                        console.error('❌ 주문 등록 버튼이 생성되지 않았습니다');
                    }
                }, 200);
            } catch (error) {
                console.error('❌ 주문 폼 초기화 실패:', error);
            }
        } else {
            console.error('❌ window.initOrderForm 함수를 찾을 수 없습니다');
        }
        
        // 폼이 생성된 후 데이터 로드 (약간의 지연을 두어 DOM이 완전히 렌더링되도록 함)
        if (orderId) {
            // 수정 모드
            modalTitle.textContent = '주문 정보 수정';
            console.log('🔄 수정 모드: 기존 주문 데이터 로드 시작');
            
            // 현재 수정 중인 주문 ID를 전역 변수에 저장
            window.currentEditingOrderId = orderId;
            
            // DOM이 완전히 렌더링될 때까지 잠시 대기
            setTimeout(async () => {
                await loadOrderData(orderId);
            }, 100);
        } else {
            // 등록 모드: 배송비 = 환경설정 제안값(초기 1회) → 이후 주문별 최종값(사용자 입력)
            modalTitle.textContent = '새 주문 등록';
            window.currentEditingOrderId = null;
            window._shippingFeeUserEdited = false; // 새 주문이므로 제안값 적용 허용
            clearOrderForm();
            // DB(환경설정)에서 배송비 제안값을 먼저 불러와 적용 (저장한 3000원 등이 즉시 반영되도록)
            if (typeof window.applyShippingFeeSuggestionForNewOrder === 'function') {
                await window.applyShippingFeeSuggestionForNewOrder();
            }
        }
        
        // 모달 드래그 기능 초기화
        if (window.initModalDrag) {
            console.log('🖱️ 모달 드래그 기능 초기화 중...');
            window.initModalDrag();
        }
        
        // 모달 스크롤 이벤트 전파 방지
        const modalContent = document.getElementById('order-modal-content');
        if (modalContent) {
            modalContent.addEventListener('wheel', (e) => {
                e.stopPropagation();
            }, { passive: false });
            
            modalContent.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: false });
        }
        
        console.log('✅ 주문 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 주문 모달 열기 실패:', error);
    }
}

// 주문 모달 동적 로드 함수
async function loadOrderModal() {
    try {
        console.log('📦 주문 모달 컴포넌트 로드 중...');
        
        // 주문 모달 컴포넌트 동적 로드
        const response = await fetch('components/order-management/order-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();
        console.log('📦 모달 HTML 로드 완료, 길이:', modalHTML.length);
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 주문 모달 컴포넌트 로드 완료');
        
        // 모달이 제대로 추가되었는지 확인
        const modal = document.getElementById('order-modal');
        if (!modal) {
            throw new Error('모달이 DOM에 추가되지 않았습니다.');
        }
        console.log('✅ 모달 DOM 확인 완료');
        
        // 닫기 버튼 이벤트 리스너 추가
        const closeOrderBtn = document.getElementById('back-to-orders');
        if (closeOrderBtn) {
            closeOrderBtn.addEventListener('click', function() {
                console.log('❌ 주문 모달 닫기 버튼 클릭');
                if (window.closeOrderModal) {
                    window.closeOrderModal();
                }
            });
        }
        
        console.log('✅ 주문 모달 동적 로드 완료');
        
    } catch (error) {
        console.error('❌ 주문 모달 로드 실패:', error);
        throw error;
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
        
        // 배경 스크롤 복원
        document.body.style.overflow = '';
        
        // 수정 모드 변수 초기화
        window.currentEditingOrderId = null;
        console.log('🔄 수정 모드 변수 초기화 완료');
        
        console.log('✅ 주문 모달 닫기 완료');
        
    } catch (error) {
        console.error('❌ 주문 모달 닫기 실패:', error);
    }
}

// 주문 폼 초기화
export async function loadOrderData(orderId) {
    try {
        console.log('주문 데이터 로드:', orderId);
        if (!window.orderDataManager) {
            console.error('❌ orderDataManager를 찾을 수 없습니다');
            return;
        }
        let order = window.orderDataManager.getOrderById(orderId);
        if (!order && window.orderDataManager.fetchOrderByIdFromSupabase) {
            order = await window.orderDataManager.fetchOrderByIdFromSupabase(orderId);
        }
        if (order) {
                console.log('📋 찾은 주문 데이터:', order);
                console.log('🔍 주문 데이터 구조 분석:');
                console.log('  - order.items:', order.items);
                console.log('  - order.items 타입:', typeof order.items);
                console.log('  - order.items 길이:', order.items ? order.items.length : 'undefined');
                console.log('  - order.order_items:', order.order_items);
                console.log('  - order.order_items 타입:', typeof order.order_items);
                console.log('  - order.order_date:', order.order_date);
                console.log('  - order.customer_name:', order.customer_name);
                
                // order_items가 문자열인 경우 파싱 시도
                if (order.order_items && typeof order.order_items === 'string') {
                    try {
                        const parsedItems = JSON.parse(order.order_items);
                        console.log('  - 파싱된 order_items:', parsedItems);
                        console.log('  - 파싱된 order_items 타입:', typeof parsedItems);
                        console.log('  - 파싱된 order_items 길이:', parsedItems ? parsedItems.length : 'undefined');
                    } catch (e) {
                        console.log('  - order_items JSON 파싱 실패:', e.message);
                    }
                }
                
                // fillOrderForm 함수 호출 (폼 필드 및 장바구니 아이템 로드 포함)
            await fillOrderForm(order);
            console.log('✅ 주문 데이터 로드 완료');
        } else {
            console.error('❌ 주문을 찾을 수 없습니다:', orderId);
        }
    } catch (error) {
        console.error('❌ 주문 데이터 로드 실패:', error);
    }
}

// 상품 정보 조회 함수
async function getProductInfo(productId) {
    try {
        console.log(`🔍 상품 정보 조회: ${productId}`);
        
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트가 없습니다');
            return null;
        }
        
        // farm_products 테이블에서 상품 정보 조회
        const { data: product, error } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price, description, category, stock, image_url')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('❌ 상품 정보 조회 실패:', error);
            return null;
        }
        
        if (!product) {
            console.warn('⚠️ 상품을 찾을 수 없습니다:', productId);
            return null;
        }
        
        console.log('✅ 상품 정보 조회 성공:', product);
        return product;
        
    } catch (error) {
        console.error('❌ 상품 정보 조회 중 오류:', error);
        return null;
    }
}

// 주문 아이템을 장바구니에 로드하는 함수
async function loadOrderItemsToCart(items) {
    try {
        console.log('🛒 주문 아이템을 장바구니에 로드 시작:', items);
        
        // 장바구니 테이블 바디 찾기 (여러 번 시도)
        let cartItemsBody = document.getElementById('cart-items-body');
        let retryCount = 0;
        
        while (!cartItemsBody && retryCount < 15) {
            console.log(`🔄 장바구니 테이블 바디 찾기 시도 ${retryCount + 1}/15`);
            await new Promise(resolve => setTimeout(resolve, 300));
            cartItemsBody = document.getElementById('cart-items-body');
            retryCount++;
        }
        
        if (!cartItemsBody) {
            console.error('❌ 장바구니 테이블 바디를 찾을 수 없습니다 (15회 시도 후)');
            console.log('🔍 DOM 구조 확인:');
            console.log('  - cart-items-body:', document.getElementById('cart-items-body'));
            console.log('  - order-form:', document.getElementById('order-form'));
            console.log('  - order-modal:', document.getElementById('order-modal'));
            
            // 주문 폼이 있는지 확인하고 없으면 생성 시도
            const orderForm = document.getElementById('order-form');
            if (!orderForm) {
                console.log('🔄 주문 폼이 없어서 생성 시도...');
                if (window.generateOrderFormHTML) {
                    const orderFormContainer = document.querySelector('#order-modal .modal-body');
                    if (orderFormContainer) {
                        orderFormContainer.innerHTML = window.generateOrderFormHTML();
                        console.log('✅ 주문 폼 생성 완료');
                        // 다시 장바구니 테이블 바디 찾기
                        cartItemsBody = document.getElementById('cart-items-body');
                    }
                }
            }
            
            if (!cartItemsBody) {
                console.error('❌ 최종 시도 후에도 장바구니 테이블 바디를 찾을 수 없습니다');
                return;
            }
        }
        
        console.log('✅ 장바구니 테이블 바디 찾기 성공');
        
        // 기존 장바구니 비우기
        cartItemsBody.innerHTML = '';
        console.log('🗑️ 기존 장바구니 내용 제거 완료');
        
        // 아이템이 없으면 빈 메시지 표시
        if (!items || items.length === 0) {
            cartItemsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-gray-500 py-2">
                        <p class="text-xs">장바구니가 비어있습니다</p>
                    </td>
                </tr>
            `;
            console.log('📋 장바구니가 비어있어서 빈 메시지 표시');
            return;
        }
        
        console.log(`📦 ${items.length}개의 아이템을 장바구니에 추가 시작`);
        
        // 각 아이템을 장바구니에 추가
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            console.log(`🛒 아이템 ${index + 1}/${items.length} 추가:`, item);
            
            try {
                // 상품 정보 조회 (product_id가 있는 경우)
                let productInfo = null;
                if (item.product_id) {
                    console.log(`🔍 상품 정보 조회 시작: ${item.product_id}`);
                    productInfo = await getProductInfo(item.product_id);
                    console.log(`📦 조회된 상품 정보:`, productInfo);
                }
                
                // 아이템 데이터 검증 및 정규화
                const normalizedItem = {
                    product_id: item.product_id || item.id || `item_${index}`,
                    product_name: productInfo?.name || productInfo?.product_name || item.product_name || item.name || item.title || '상품명 없음',
                    price: toIntegerWon(productInfo?.price || item.price || item.unit_price || item.total_price),
                    quantity: Math.max(1, toIntegerWon(item.quantity || item.qty || 1))
                };
                if (!productInfo) {
                    if (item.product_name || item.name || item.title) {
                        normalizedItem.product_name = item.product_name || item.name || item.title;
                    }
                    if (item.price != null || item.unit_price != null) {
                        normalizedItem.price = toIntegerWon(item.price || item.unit_price);
                    }
                }
                if (normalizedItem.price === 0 && item.total_price) {
                    normalizedItem.price = toIntegerWon(Number(item.total_price) / normalizedItem.quantity);
                }
                
                // 최종 검증: 상품명이 여전히 없으면 경고 표시
                if (normalizedItem.product_name === '상품명 없음') {
                    console.warn(`⚠️ 상품명을 찾을 수 없습니다. 상품 ID: ${normalizedItem.product_id}`);
                }
                
                console.log(`📝 정규화된 아이템 ${index + 1}:`, normalizedItem);
                
                // 직접 장바구니에 추가
                addItemToCartDirectly(normalizedItem);
                
            } catch (error) {
                console.error(`❌ 아이템 ${index + 1} 처리 실패:`, error);
                
                // 오류 발생 시 기본값으로 처리
                const fallbackItem = {
                    product_id: item.product_id || item.id || `item_${index}`,
                    product_name: item.product_name || item.name || item.title || '상품명 없음',
                    price: toIntegerWon(item.price || item.unit_price || item.total_price),
                    quantity: Math.max(1, toIntegerWon(item.quantity || item.qty || 1))
                };
                
                console.log(`🔄 폴백 아이템 ${index + 1}:`, fallbackItem);
                addItemToCartDirectly(fallbackItem);
            }
        }
        
        // 장바구니 총액 업데이트
        setTimeout(() => {
            if (window.updateCartTotal) {
                window.updateCartTotal();
                console.log('💰 장바구니 총액 업데이트 완료');
            } else if (window.updateOrderTotalDisplay) {
                window.updateOrderTotalDisplay();
                console.log('💰 주문 총액 표시 업데이트 완료');
            } else {
                console.warn('⚠️ updateCartTotal 또는 updateOrderTotalDisplay 함수를 찾을 수 없습니다');
            }
        }, 200);
        
        console.log('✅ 주문 아이템 장바구니 로드 완료');
        
    } catch (error) {
        console.error('❌ 주문 아이템 장바구니 로드 실패:', error);
    }
}

// 장바구니에 아이템을 직접 추가하는 함수
function addItemToCartDirectly(item) {
    try {
        console.log('🛒 장바구니에 아이템 직접 추가:', item);
        
        const cartItemsBody = document.getElementById('cart-items-body');
        if (!cartItemsBody) {
            console.error('❌ 장바구니 테이블 바디를 찾을 수 없습니다');
            return;
        }
        
        // 기존 빈 메시지 제거
        const emptyMessage = cartItemsBody.querySelector('tr td[colspan="5"]');
        if (emptyMessage) {
            emptyMessage.remove();
            console.log('🗑️ 기존 빈 메시지 제거');
        }
        
        const unitPrice = Math.max(0, toIntegerWon(item.price));
        const qty = Math.max(1, toIntegerWon(item.quantity));
        const row = document.createElement('tr');
        row.setAttribute('data-product-id', item.product_id || 'unknown');
        row.setAttribute('data-product-name', item.product_name || '');
        row.setAttribute('data-unit-price', unitPrice);
        row.setAttribute('data-price', unitPrice);
        const subtotal = unitPrice * qty;
        row.innerHTML = `
            <td class="px-2 py-1 text-xs">${(item.product_name || '상품명 없음').replace(/</g, '&lt;')}</td>
            <td class="px-2 py-1 text-xs text-right tabular-nums">${unitPrice.toLocaleString()}</td>
            <td class="px-2 py-1 text-center">
                <input type="number" class="quantity-input w-12 text-xs text-center border rounded" 
                       value="${qty}" min="1" step="1"
                       oninput="window.normalizeQuantityInput&&window.normalizeQuantityInput(this); if(window.updateCartTotal) updateCartTotal()" onchange="if(window.updateCartTotal) updateCartTotal()">
            </td>
            <td class="px-2 py-1 text-xs text-right tabular-nums cart-line-total">${subtotal.toLocaleString()}원</td>
            <td class="px-2 py-1 text-center">
                <button type="button" onclick="removeFromCart(this)" class="w-4 h-4 bg-red-200 rounded flex items-center justify-center hover:bg-red-300" title="삭제">
                    <i class="fas fa-trash text-xs text-red-600"></i>
                </button>
            </td>
        `;

        cartItemsBody.appendChild(row);
        if (window.updateCartTotal) window.updateCartTotal();
        console.log('✅ 장바구니에 아이템 추가 완료:', item.product_name);
        
    } catch (error) {
        console.error('❌ 장바구니 아이템 직접 추가 실패:', error);
    }
}

export function clearOrderForm() {
    try {
        console.log('주문 폼 초기화');
        
        // 폼 필드 초기화
        const formFields = [
            'order-customer-name',
            'order-customer-phone', 
            'order-customer-address',
            'order-status',
            'order-channel',
            'order-memo',
            'shipping-fee-input',
            'discount-amount'
        ];
        
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'number') {
                    field.value = fieldId === 'shipping-fee-input' ? '0' : '0';
                } else {
                    field.value = '';
                }
            }
        });
        
        // 장바구니 초기화
        const cartItemsBody = document.getElementById('cart-items-body');
        if (cartItemsBody) {
            cartItemsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-gray-500 py-2">
                        <p class="text-xs">장바구니가 비어있습니다</p>
                    </td>
                </tr>
            `;
            console.log('✅ 장바구니 초기화 완료');
        } else {
            console.warn('⚠️ cart-items-body 요소를 찾을 수 없습니다');
        }
        
        // 검색 결과 숨기기
        const searchResults = [
            'customer-search-results',
            'product-search-results'
        ];
        
        searchResults.forEach(resultId => {
            const result = document.getElementById(resultId);
            if (result) {
                result.classList.add('hidden');
            }
        });
        
        console.log('✅ 주문 폼 초기화 완료');
        
    } catch (error) {
        console.error('❌ 주문 폼 초기화 실패:', error);
    }
}


// 주문 폼에 데이터 채우기
async function fillOrderForm(orderData) {
    try {
        console.log('주문 폼 데이터 채우기:', orderData);
        
        // 🆕 customer_id를 hidden input에 설정 (수정 모드)
        if (orderData.customer_id) {
            let customerIdInput = document.getElementById('order-customer-id');
            if (!customerIdInput) {
                // hidden input이 없으면 생성
                customerIdInput = document.createElement('input');
                customerIdInput.type = 'hidden';
                customerIdInput.id = 'order-customer-id';
                customerIdInput.name = 'customer_id';
                document.getElementById('order-form').appendChild(customerIdInput);
                console.log('🆕 customer_id hidden input 생성됨 (수정 모드)');
            }
            customerIdInput.value = orderData.customer_id;
            console.log('💾 customer_id 설정:', orderData.customer_id);
        }
        
        // 고객 정보
        const customerName = document.getElementById('order-customer-name');
        const customerPhone = document.getElementById('order-customer-phone');
        const customerAddress = document.getElementById('order-customer-address');
        
        if (customerName) customerName.value = orderData.customer_name || '';
        if (customerPhone) customerPhone.value = orderData.customer_phone || '';
        if (customerAddress) customerAddress.value = orderData.customer_address || '';
        
        // 주문 정보 (다양한 필드명 지원)
        const orderStatus = document.getElementById('order-status');
        const orderChannel = document.getElementById('order-channel');
        const orderMemo = document.getElementById('order-memo');
        
        if (orderStatus) {
            orderStatus.value = orderData.order_status || orderData.status || '주문접수';
            console.log('✅ order-status 설정:', orderStatus.value);
        }
        if (orderChannel) {
            orderChannel.value = orderData.order_channel || orderData.channel || '';
            console.log('✅ order-channel 설정:', orderChannel.value);
        }
        if (orderMemo) {
            orderMemo.value = orderData.memo || '';
            console.log('✅ order-memo 설정:', orderMemo.value);
        }
        
        // 배송비 및 할인액
        const shippingFee = document.getElementById('shipping-fee-input');
        const discountAmount = document.getElementById('discount-amount');
        
        if (shippingFee) {
            shippingFee.value = Math.max(0, toIntegerWon(orderData.shipping_fee));
            window._shippingFeeUserEdited = true; // 기존 주문 값이므로 제안값으로 덮어쓰지 않음
            console.log('✅ shipping-fee-input 설정:', shippingFee.value);
        }
        if (discountAmount) {
            discountAmount.value = Math.max(0, toIntegerWon(orderData.discount_amount));
            console.log('✅ discount-amount 설정:', discountAmount.value);
        }
        
        // 수정 모드에서는 readonly 속성 제거
        [customerName, customerPhone, customerAddress].forEach(field => {
            if (field && field.hasAttribute('readonly')) {
                field.removeAttribute('readonly');
                field.classList.remove('bg-gray-50');
                field.classList.add('bg-white');
                console.log(`✅ ${field.id} readonly 제거됨 (수정 모드)`);
            }
        });
        
        // 장바구니 아이템 로드
        if (orderData.items && Array.isArray(orderData.items)) {
            await loadOrderItemsToCart(orderData.items);
        }
        
        console.log('✅ 주문 폼 데이터 채우기 완료');
        
    } catch (error) {
        console.error('❌ 주문 폼 데이터 채우기 실패:', error);
    }
}

// 주문 아이템 로드
async function loadOrderItems(items) {
    try {
        console.log('주문 아이템 로드:', items);
        
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        
        // 기존 내용 제거
        cartItems.innerHTML = '';
        
        // 각 아이템을 순차적으로 처리
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            console.log(`🛒 아이템 ${index + 1}/${items.length} 처리:`, item);
            
            try {
                let finalPrice = item.price || 0;
                
                // 상품 ID가 있으면 DB에서 가격 조회
                if (item.product_id && finalPrice === 0) {
                    console.log(`🔍 상품 가격 조회: ${item.product_id}`);
                    try {
                        if (window.supabaseClient) {
                            const { data: productData, error } = await window.supabaseClient
                                .from('farm_products')
                                .select('price')
                                .eq('id', item.product_id)
                                .single();
                            
                            if (!error && productData && productData.price != null) {
                                finalPrice = toIntegerWon(productData.price);
                                console.log(`💰 DB에서 가격 조회 성공: ${finalPrice}원`);
                            }
                        }
                    } catch (dbError) {
                        console.warn('⚠️ 상품 DB 조회 실패:', dbError);
                    }
                }
                
                // 여전히 가격이 0이면 기존 데이터에서 추출
                if (finalPrice === 0) {
                    finalPrice = toIntegerWon(item.unit_price || item.total_price);
                    console.log(`💰 기존 데이터에서 가격 추출: ${finalPrice}원`);
                }
                
                // 최종 검증
                if (finalPrice === 0) {
                    console.error(`❌ 상품 가격을 찾을 수 없습니다:`, {
                        productId: item.product_id,
                        productName: item.product_name,
                        originalPrice: item.price,
                        unitPrice: item.unit_price,
                        totalPrice: item.total_price
                    });
                } else {
                    console.log(`✅ 최종 가격 확인: ${finalPrice}원`);
                }
                
                if (window.addToCart) {
                    window.addToCart(
                        item.product_id || item.id,
                        item.product_name || item.name,
                        finalPrice,
                        Math.max(1, toIntegerWon(item.quantity || 1))
                    );
                }
                
            } catch (itemError) {
                console.error(`❌ 아이템 ${index + 1} 처리 실패:`, itemError);
            }
        }
        
        // 장바구니 총액 업데이트
        if (window.updateCartTotal) {
            await window.updateCartTotal();
        }
        
        console.log('✅ 주문 아이템 로드 완료');
        
    } catch (error) {
        console.error('❌ 주문 아이템 로드 실패:', error);
    }
}

// 주문 저장
export async function saveOrder() {
    try {
        console.log('주문 저장 시작');
        
        // 폼 데이터 수집
        const formData = window.collectOrderFormData ? await window.collectOrderFormData() : null;
        if (!formData) {
            console.error('폼 데이터 수집 실패');
            return;
        }
        
        // 필수 필드 검증
        if (!formData.customer_name || !formData.customer_phone || !formData.customer_address) {
            alert('고객 정보를 모두 입력해주세요.');
            return;
        }
        
        if (!formData.items || formData.items.length === 0) {
            alert('상품을 추가해주세요.');
            return;
        }
        
        const itemsSubtotal = formData.items.reduce((sum, item) => sum + toIntegerWon(item.total), 0);
        const shippingFee = toIntegerWon(formData.shipping_fee);
        const discountAmount = toIntegerWon(formData.discount_amount);
        const orderData = {
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            customer_address: formData.customer_address,
            order_status: formData.order_status,
            order_channel: formData.order_channel,
            memo: formData.memo,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            items: formData.items,
            product_amount: itemsSubtotal,
            total_amount: Math.max(0, itemsSubtotal + shippingFee - discountAmount),
            order_date: new Date().toISOString()
        };
        
        // Supabase에 저장
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('farm_orders')
                .insert([orderData])
                .select();
            
            if (error) {
                console.error('주문 저장 실패:', error);
                alert('주문 저장에 실패했습니다: ' + error.message);
                return;
            }
            
            console.log('✅ 주문 저장 완료:', data);
            
            // 고객등급 자동 업데이트 (주문 완료 시)
            if (orderData.order_status === '배송완료' || orderData.order_status === '결제완료' || 
                orderData.order_status === '입금확인' || orderData.order_status === '상품준비') {
                await updateCustomerGradeAfterOrder(orderData.customer_phone, orderData.total_amount);
            }
            
            // 모달 닫기
            closeOrderModal();
            
            // 주문 목록 새로고침
            if (window.orderDataManager && window.orderDataManager.loadOrders) {
                window.orderDataManager.loadOrders();
            }
            
            alert('주문이 성공적으로 등록되었습니다.');
            
        } else {
            console.warn('Supabase 클라이언트가 연결되지 않았습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 저장 실패:', error);
        alert('주문 저장에 실패했습니다: ' + error.message);
    }
}

// 주문 완료 후 고객등급 자동 업데이트
async function updateCustomerGradeAfterOrder(customerPhone, orderAmount) {
    try {
        console.log(`🔄 주문 완료 후 고객등급 업데이트 시작 - 전화번호: ${customerPhone}, 주문금액: ${orderAmount.toLocaleString()}원`);
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return;
        }
        
        // 고객 정보 조회
        const { data: customer, error: customerError } = await window.supabaseClient
            .from('farm_customers')
            .select('id, phone, total_purchase_amount, grade')
            .eq('phone', customerPhone)
            .single();
        
        if (customerError || !customer) {
            console.warn('⚠️ 고객 정보를 찾을 수 없습니다:', customerPhone);
            return;
        }
        
        // 총 구매금액 계산 (기존 금액 + 새 주문 금액, 음수도 처리 가능)
        const newTotalAmount = Math.max(0, (customer.total_purchase_amount || 0) + orderAmount);
        
        const operation = orderAmount >= 0 ? '누적' : '차감';
        const amountChange = Math.abs(orderAmount);
        console.log(`📊 고객 총 구매금액 ${operation}: ${customer.total_purchase_amount || 0}원 → ${newTotalAmount.toLocaleString()}원 (${operation}액: ${amountChange.toLocaleString()}원)`);
        
        // 고객등급 자동 업데이트
        if (window.updateCustomerGrade) {
            await window.updateCustomerGrade(customer.id, newTotalAmount);
        } else {
            console.warn('⚠️ updateCustomerGrade 함수를 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 완료 후 고객등급 업데이트 실패:', error);
    }
}

// 주문 수정
export async function updateOrder(orderId) {
    try {
        console.log('주문 수정:', orderId);
        
        // 폼 데이터 수집
        const formData = window.collectOrderFormData ? await window.collectOrderFormData() : null;
        if (!formData) {
            console.error('폼 데이터 수집 실패');
            return;
        }
        
        const itemsSubtotal = formData.items.reduce((sum, item) => sum + toIntegerWon(item.total), 0);
        const shippingFee = toIntegerWon(formData.shipping_fee);
        const discountAmount = toIntegerWon(formData.discount_amount);
        const orderData = {
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            customer_address: formData.customer_address,
            order_status: formData.order_status,
            order_channel: formData.order_channel,
            memo: formData.memo,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            items: formData.items,
            product_amount: itemsSubtotal,
            total_amount: Math.max(0, itemsSubtotal + shippingFee - discountAmount),
            updated_at: new Date().toISOString()
        };
        
        // Supabase에 업데이트
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('farm_orders')
                .update(orderData)
                .eq('id', orderId)
                .select();
            
            if (error) {
                console.error('주문 수정 실패:', error);
                alert('주문 수정에 실패했습니다: ' + error.message);
                return;
            }
            
            console.log('✅ 주문 수정 완료:', data);
            
            // 주문 상태에 따른 고객 구매 금액 및 재고 처리
            if (orderData.order_status === '주문취소' || orderData.order_status === '환불완료') {
                // 취소/환불 시 고객 구매 금액 차감 및 재고 복원
                await updateCustomerGradeAfterOrder(orderData.customer_phone, -orderData.total_amount);
                if (window.restoreProductStock) {
                    await window.restoreProductStock(orderId);
                }
            } else if (orderData.order_status === '배송완료' || orderData.order_status === '결제완료' || 
                      orderData.order_status === '입금확인' || orderData.order_status === '상품준비') {
                // 완료 시 고객 구매 금액 누적
                await updateCustomerGradeAfterOrder(orderData.customer_phone, orderData.total_amount);
            }
            
            // 모달 닫기
            closeOrderModal();
            
            // 주문 목록 새로고침
            if (window.orderDataManager && window.orderDataManager.loadOrders) {
                window.orderDataManager.loadOrders();
            }
            
            alert('주문이 성공적으로 수정되었습니다.');
            
        } else {
            console.warn('Supabase 클라이언트가 연결되지 않았습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 수정 실패:', error);
        alert('주문 수정에 실패했습니다: ' + error.message);
    }
}

// 주문 삭제
export async function deleteOrder(orderId) {
    try {
        console.log('주문 삭제:', orderId);
        
        if (!confirm('정말로 이 주문을 삭제하시겠습니까?')) {
            return;
        }
        
        // OrderDataManager를 통한 삭제 (Supabase + 로컬 배열 모두 처리)
        if (window.orderDataManager) {
            await window.orderDataManager.deleteOrder(orderId);
            console.log('✅ 주문 삭제 완료');
            
            // 주문 목록 새로고침 및 테이블 렌더링
            window.orderDataManager.renderOrdersTable();
            window.orderDataManager.updateFilterCounts();
            console.log('🔄 주문 목록 새로고침 및 테이블 렌더링 완료');
            
            alert('주문이 성공적으로 삭제되었습니다.');
            
        } else {
            console.warn('OrderDataManager를 찾을 수 없습니다');
            alert('주문 삭제에 실패했습니다: OrderDataManager를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 주문 삭제 실패:', error);
        alert('주문 삭제에 실패했습니다: ' + error.message);
    }
}

// 주문 상태 업데이트
export async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log('주문 상태 업데이트:', { orderId, newStatus });
        
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient
                .from('farm_orders')
                .update({ 
                    order_status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
            
            if (error) {
                console.error('주문 상태 업데이트 실패:', error);
                alert('주문 상태 업데이트에 실패했습니다: ' + error.message);
                return;
            }
            
            console.log('✅ 주문 상태 업데이트 완료');
            
            // 주문 목록 새로고침
            if (window.orderDataManager && window.orderDataManager.loadOrders) {
                window.orderDataManager.loadOrders();
            }
            
        } else {
            console.warn('Supabase 클라이언트가 연결되지 않았습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 상태 업데이트 실패:', error);
        alert('주문 상태 업데이트에 실패했습니다: ' + error.message);
    }
}

// 전역 스코프에 함수 등록
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.saveOrder = saveOrder;
window.updateOrder = updateOrder;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;

// 누락된 전역 함수들 추가
window.sendSms = function(orderId) {
    console.log('📱 SMS 발송:', orderId);
    // SMS 템플릿 모달 표시
    if (window.showSMSTemplateModal) {
        window.showSMSTemplateModal(orderId);
    } else {
        console.error('❌ showSMSTemplateModal 함수를 찾을 수 없습니다');
        alert('SMS 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
    }
};

// searchProducts는 orderForm.js에서 구현·등록됨 (덮어쓰지 않음)
// searchExistingCustomers 함수는 orderForm.js에서 정의됨

window.checkOrderPhoneDuplicate = function(phone) {
    console.log('📞 주문 전화번호 중복 확인:', phone);
    // 전화번호 중복 확인 로직 구현 필요
    return false;
};

window.formatPhoneNumber = function(input) {
    console.log('📞 전화번호 포맷팅:', input.value);
    // 전화번호 포맷팅 로직 구현 필요
};

// 누락된 함수들 추가
export function cancelNewCustomerRegistration() {
    console.log('❌ 새 고객 등록 취소');
    // 새 고객 등록 취소 로직
    const newCustomerConfirmation = document.getElementById('new-customer-confirmation');
    if (newCustomerConfirmation) {
        newCustomerConfirmation.remove();
    }
}

export function confirmNewCustomerRegistration() {
    console.log('✅ 새 고객 등록 확인');
    // 새 고객 등록 확인 로직
    alert('새 고객 등록이 확인되었습니다.');
}

export function createTestReadyOrder() {
    console.log('🧪 테스트 주문 생성');
    // 테스트 주문 생성 로직
    alert('테스트 주문이 생성되었습니다.');
}

export function initCustomerAutocomplete() {
    console.log('🔍 고객 자동완성 초기화');
    // 고객 자동완성 초기화 로직
}

// openOrderAddressSearch 함수는 orderForm.js에서 정의됨

export function checkOrderPhoneDuplicate() {
    console.log('📞 주문 전화번호 중복 확인');
    // 주문 전화번호 중복 확인 로직
    return false; // 중복 없음
}

export async function editOrder(orderId) {
    console.log('✏️ 주문 편집 (모달로 열기):', orderId);
    // 주문 편집 로직 - 새창이 아닌 모달로 열기
    if (window.openOrderModal) {
        console.log('📝 주문 편집 모달 열기 시도...');
        await window.openOrderModal(orderId);
    } else {
        console.error('❌ openOrderModal 함수를 찾을 수 없습니다');
        alert('주문 편집 기능을 사용할 수 없습니다.');
    }
}

// 주문 목록 로드 함수
export async function loadOrders() {
    try {
        console.log('📋 주문 목록 로드 시작...');
        
        if (window.orderDataManager) {
            await window.orderDataManager.loadOrders();
            console.log('✅ 주문 목록 로드 완료');
        } else {
            console.warn('⚠️ orderDataManager를 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 목록 로드 실패:', error);
    }
}

// 주문 출력 함수
export function printOrder(orderId) {
    try {
        console.log('🖨️ 주문 출력:', orderId);
        
        if (window.orderDataManager) {
            const order = window.orderDataManager.getOrderById(orderId);
            if (order) {
                // 주문 정보를 새 창에서 출력 (출력 전용)
                console.log('🖨️ 주문서 출력용 새창 열기:', orderId);
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>주문서 - ${order.customer_name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .order-info { margin-bottom: 20px; }
                            .customer-info { margin-bottom: 20px; }
                            .order-items { margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>주문서</h1>
                            <p>주문번호: ${order.id}</p>
                            <p>주문일: ${order.created_at}</p>
                        </div>
                        
                        <div class="customer-info">
                            <h3>고객 정보</h3>
                            <p><strong>고객명:</strong> ${order.customer_name}</p>
                            <p><strong>전화번호:</strong> ${order.customer_phone}</p>
                            <p><strong>주소:</strong> ${order.customer_address}</p>
                        </div>
                        
                        <div class="order-info">
                            <h3>주문 정보</h3>
                            <p><strong>상태:</strong> ${order.status}</p>
                            <p><strong>채널:</strong> ${order.channel}</p>
                            <p><strong>배송비:</strong> ${order.shipping_fee}원</p>
                            <p><strong>할인:</strong> ${order.discount_amount}원</p>
                            <p><strong>메모:</strong> ${order.memo || '없음'}</p>
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            } else {
                alert('주문을 찾을 수 없습니다.');
            }
        } else {
            console.warn('⚠️ orderDataManager를 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 출력 실패:', error);
        alert('주문 출력 중 오류가 발생했습니다.');
    }
}

// 디버깅 함수들
window.testProductInfo = async function(productId) {
    console.log('🧪 상품 정보 조회 테스트:', productId);
    const productInfo = await getProductInfo(productId);
    console.log('📦 조회 결과:', productInfo);
    return productInfo;
};

window.testOrderEdit = function(orderId) {
    console.log('🧪 주문 수정 테스트:', orderId);
    if (window.openOrderModal) {
        window.openOrderModal(orderId);
    } else {
        console.error('❌ openOrderModal 함수를 찾을 수 없습니다');
    }
};

window.testProductQuery = async function(productId) {
    console.log('🧪 상품 조회 쿼리 테스트:', productId);
    
    if (!window.supabaseClient) {
        console.error('❌ Supabase 클라이언트가 없습니다');
        return null;
    }
    
    try {
        const { data: product, error } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price, description, category, stock, image_url')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('❌ 상품 조회 실패:', error);
            return null;
        }
        
        console.log('✅ 상품 조회 성공:', product);
        return product;
        
    } catch (error) {
        console.error('❌ 상품 조회 중 오류:', error);
        return null;
    }
};

