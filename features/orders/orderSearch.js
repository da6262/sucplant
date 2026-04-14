// 주문 검색 관련 기능
// features/orders/orderSearch.js

// 기존 고객 검색 함수
function searchExistingCustomers(query) {
    if (query.length < 2) {
        document.getElementById('customer-search-results').classList.add('hidden');
        return;
    }
    
    // Supabase에서 고객 검색
    if (window.supabaseClient) {
        window.supabaseClient
            .from('farm_customers')
            .select('id, name, phone, address')
            .ilike('name', `%${query}%`)
            .limit(5)
            .then(({ data, error }) => {
                if (error) {
                    console.error('고객 검색 오류:', error);
                    return;
                }
                
                const resultsDiv = document.getElementById('customer-search-results');
                if (data && data.length > 0) {
                    resultsDiv.innerHTML = data.map(customer => `
                        <div class="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                             onclick="selectCustomerFromHTML('${customer.id}', '${customer.name}', '${customer.phone}', '${customer.address}')">
                            <div class="text-xs font-medium text-gray-900">${customer.name}</div>
                            <div class="text-xs text-gray-500">${customer.phone}</div>
                        </div>
                    `).join('');
                    resultsDiv.classList.remove('hidden');
                } else {
                    // 검색 결과가 없을 때 신규 고객 등록 옵션 표시
                    resultsDiv.innerHTML = `
                        <div class="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                             onclick="openNewCustomerRegistration('${query}')">
                            <div class="text-xs font-medium text-blue-600 flex items-center">
                                <i class="fas fa-plus mr-2"></i>
                                "${query}" 새 고객으로 등록
                            </div>
                            <div class="text-xs text-gray-500">기존 명단에 없는 고객입니다</div>
                        </div>
                    `;
                    resultsDiv.classList.remove('hidden');
                }
            });
    }
}

// HTML에서 호출할 수 있는 래퍼 함수
function selectCustomerFromHTML(customerId, name, phone, address, addressDetail) {
    try {
        console.log('🔍 HTML에서 고객 선택:', { customerId, name, phone, address, addressDetail });

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('order-customer-id', customerId);
        set('order-customer-name', name);
        set('order-customer-phone', phone);
        set('order-customer-address', address);
        set('order-customer-address-detail', addressDetail);
        set('order-customer-search', name); // 검색창에도 이름 표시

        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) resultsDiv.classList.add('hidden');

        if (window.updateOrderSubmitButtonState) window.updateOrderSubmitButtonState();
        console.log('✅ 고객 정보 자동 입력 완료');
    } catch (error) {
        console.error('❌ 고객 선택 실패:', error);
    }
}

// 고객 ID로 Supabase에서 전체 정보 조회 후 폼에 입력
async function fillOrderFormFromCustomerId(customerId) {
    if (!customerId || !window.supabaseClient) return;
    try {
        const { data, error } = await window.supabaseClient
            .from('farm_customers')
            .select('id, name, phone, address, address_detail')
            .eq('id', customerId)
            .single();
        if (error || !data) return;
        selectCustomerFromHTML(data.id, data.name, data.phone, data.address, data.address_detail);
    } catch (e) {
        console.error('고객 정보 조회 실패:', e);
    }
}

// 상품 검색 함수
function searchProducts(query) {
    console.log('🔍 상품 검색 시작:', query);
    
    if (query.length < 2) {
        const resultsDiv = document.getElementById('product-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        return;
    }
    
    // Supabase에서 상품 검색
    if (window.supabaseClient) {
        console.log('📡 Supabase 상품 검색 요청:', query);
        window.supabaseClient
            .from('farm_products')
            .select('id, name, price, image_url, stock')
            .ilike('name', `%${query}%`)
            .limit(10)
            .then(({ data, error }) => {
                if (error) {
                    console.error('❌ 상품 검색 오류:', error);
                    return;
                }
                
                console.log('📦 검색된 상품:', data);
                const resultsDiv = document.getElementById('product-search-results');
                if (!resultsDiv) {
                    console.error('❌ 상품 검색 결과 컨테이너를 찾을 수 없습니다');
                    return;
                }
                
                if (data && data.length > 0) {
                    resultsDiv.innerHTML = `
                        <div class="p-2 bg-blue-50 border-b border-blue-200">
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-blue-600 font-medium">여러 상품을 선택할 수 있습니다</span>
                                <button onclick="closeProductSearch()" class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                                    완료
                                </button>
                            </div>
                        </div>
                        ${data.map(product => `
                            <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3" 
                                 onclick="selectProductFromSearch('${product.id}', '${product.name}', ${product.price})">
                                <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    ${product.image_url ? 
                                        `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">` :
                                        `<i class="fas fa-image text-gray-400"></i>`
                                    }
                                </div>
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                                    <div class="text-xs text-gray-500">${product.price.toLocaleString()}원</div>
                                    <div class="text-xs text-gray-400">재고: ${product.stock || 0}개</div>
                                </div>
                            </div>
                        `).join('')}
                    `;
                    resultsDiv.classList.remove('hidden');
                    console.log('✅ 상품 검색 결과 표시');
                } else {
                    resultsDiv.classList.add('hidden');
                    console.log('📭 검색 결과 없음');
                }
            });
    } else {
        console.error('❌ Supabase 클라이언트가 연결되지 않았습니다');
        const resultsDiv = document.getElementById('product-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
    }
}


// 상품 선택 함수
async function selectProductFromSearch(productId, productName, price) {
    try {
        console.log('🛍️ 상품 선택:', { productId, productName, price });
        
        // 장바구니에 상품 추가
        await addToCart(productId, productName, price, 1);
        
        // 선택된 상품을 시각적으로 표시 (체크 표시)
        const selectedProduct = document.querySelector(`[onclick="selectProductFromSearch('${productId}', '${productName}', ${price})"]`);
        if (selectedProduct) {
            // 이미 선택된 상품인지 확인
            if (selectedProduct.classList.contains('selected')) {
                console.log('⚠️ 이미 선택된 상품입니다');
                return;
            }
            
            // 선택 표시 추가
            selectedProduct.classList.add('selected', 'bg-green-50', 'border-green-200');
            selectedProduct.innerHTML = `
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    ${selectedProduct.querySelector('img') ? selectedProduct.querySelector('img').outerHTML : '<i class="fas fa-image text-gray-400"></i>'}
                </div>
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">${productName}</div>
                    <div class="text-xs text-gray-500">${price.toLocaleString()}원</div>
                    <div class="text-xs text-green-600 flex items-center">
                        <i class="fas fa-check mr-1"></i>장바구니에 추가됨
                    </div>
                </div>
                <div class="text-green-600">
                    <i class="fas fa-check-circle"></i>
                </div>
            `;
        }
        
        console.log('✅ 상품이 장바구니에 추가되었습니다');
    } catch (error) {
        console.error('❌ 상품 선택 실패:', error);
    }
}

// 장바구니에 상품 추가
async function addToCart(productId, productName, price, quantity = 1) {
    try {
        console.log('🛒 장바구니에 상품 추가:', { productId, productName, price, quantity });
        
        // 장바구니 컨테이너 찾기 (재시도 메커니즘)
        let cartItems = document.getElementById('cart-items-body');
        let retryCount = 0;
        
        while (!cartItems && retryCount < 10) {
            console.log(`🔄 장바구니 컨테이너 찾기 시도 ${retryCount + 1}/10`);
            await new Promise(resolve => setTimeout(resolve, 100));
            cartItems = document.getElementById('cart-items-body');
            retryCount++;
        }
        
        if (!cartItems) {
            console.error('❌ 장바구니 컨테이너를 찾을 수 없습니다 (10회 시도 후)');
            console.log('🔍 DOM 구조 확인:');
            console.log('  - cart-items-body:', document.getElementById('cart-items-body'));
            console.log('  - order-form:', document.getElementById('order-form'));
            console.log('  - order-modal:', document.getElementById('order-modal'));
            alert('장바구니를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('✅ 장바구니 컨테이너 찾기 성공');
        
        // 기존 상품이 있는지 확인
        const existingItem = cartItems.querySelector(`[data-product-id="${productId}"]`);
        if (existingItem) {
            console.log('📦 기존 상품 수량 증가:', productName);
            // 수량 증가
            const quantityInput = existingItem.querySelector('.quantity-input');
            const currentQuantity = parseInt(quantityInput.value) || 0;
            quantityInput.value = currentQuantity + quantity;
            await updateCartItemTotal(existingItem);
        } else {
            console.log('🆕 새 상품 추가:', productName, price);
            // 새 상품 추가 (표 형식)
            const cartItemHTML = `
                <tr class="border-b border-gray-100 hover:bg-gray-50" data-product-id="${productId}" data-price="${price}">
                    <td class="px-2 py-1">
                        <div class="text-xs font-medium text-gray-900">${productName}</div>
                    </td>
                    <td class="px-2 py-1">
                        <div class="text-xs text-gray-600">${price.toLocaleString()}원</div>
                    </td>
                    <td class="px-2 py-1">
                        <div class="flex items-center space-x-1">
                            <button onclick="updateCartQuantity('${productId}', -1)" class="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <input type="number" class="quantity-input w-8 text-center text-xs border border-gray-300 rounded px-1" 
                                   value="${quantity}" min="1" onchange="updateCartItemTotal(this.closest('[data-product-id]')).catch(console.error)">
                            <button onclick="updateCartQuantity('${productId}', 1)" class="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </td>
                    <td class="px-2 py-1">
                        <div class="text-xs font-medium text-gray-900" id="total-${productId}">${(price * quantity).toLocaleString()}원</div>
                    </td>
                    <td class="px-2 py-1">
                        <button onclick="removeFromCart('${productId}')" class="w-4 h-4 bg-red-200 rounded flex items-center justify-center hover:bg-red-300">
                            <i class="fas fa-trash text-xs text-red-600"></i>
                        </button>
                    </td>
                </tr>
            `;
            
            console.log('📝 생성된 장바구니 HTML:', cartItemHTML);
            
            // "장바구니가 비어있습니다" 메시지 제거
            const emptyMessage = cartItems.querySelector('tr td[colspan="5"]');
            if (emptyMessage) {
                console.log('🗑️ 빈 장바구니 메시지 제거');
                emptyMessage.closest('tr').remove();
            }
            
            cartItems.insertAdjacentHTML('beforeend', cartItemHTML);
        }
        
        // 장바구니 총액 업데이트
        await updateCartTotal();
        
        // 주문 총액 표시 업데이트
        if (window.updateOrderTotalDisplay) {
            window.updateOrderTotalDisplay();
        }
        
        // 폼 유효성 검사 실행 (버튼 활성화 확인)
        if (window.validateForm) {
            window.validateForm();
        }
        
    } catch (error) {
        console.error('❌ 장바구니 추가 실패:', error);
    }
}

// 장바구니 수량 업데이트
async function updateCartQuantity(productId, change) {
    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
    if (!cartItem) {
        console.warn('⚠️ 장바구니 아이템을 찾을 수 없습니다:', productId);
        return;
    }
    
    const quantityInput = cartItem.querySelector('.quantity-input');
    if (!quantityInput) {
        console.warn('⚠️ 수량 입력 필드를 찾을 수 없습니다:', cartItem);
        return;
    }
    
    const currentQuantity = parseInt(quantityInput.value) || 0;
    const newQuantity = Math.max(1, currentQuantity + change);
    
    quantityInput.value = newQuantity;
    await updateCartItemTotal(cartItem);
    await updateCartTotal();
    
    // 주문 총액 표시 업데이트
    if (window.updateOrderTotalDisplay) {
        window.updateOrderTotalDisplay();
    }
}

// 장바구니 아이템 총액 업데이트
async function updateCartItemTotal(cartItem) {
    try {
        console.log('💰 장바구니 아이템 총액 업데이트');
        
        const quantityInput = cartItem.querySelector('.quantity-input');
        if (!quantityInput) {
            console.warn('⚠️ 수량 입력 필드를 찾을 수 없습니다:', cartItem);
            return;
        }
        
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (quantity <= 0) {
            console.log('🗑️ 수량이 0이므로 아이템 제거');
            cartItem.remove();
            await updateCartTotal();
            checkCartEmpty(); // 장바구니가 비었는지 확인
            
            // 주문 총액 표시 업데이트
            if (window.updateOrderTotalDisplay) {
                window.updateOrderTotalDisplay();
            }
            return;
        }
        
        // 가격 정보를 data 속성에서 먼저 가져오기
        let price = parseInt(cartItem.getAttribute('data-price')) || 0;
        
        // data 속성에 가격이 없으면 텍스트에서 추출
        if (price === 0) {
            const priceElement = cartItem.querySelector('.text-xs.text-gray-500');
            if (priceElement) {
                const priceText = priceElement.textContent;
                price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            }
        }
        
        const total = price * quantity;
        
        console.log('💰 아이템 총액 계산:', { price, quantity, total });
        
        // 표 형식에서 총액 업데이트
        const totalElement = cartItem.querySelector(`#total-${cartItem.getAttribute('data-product-id')}`);
        if (totalElement) {
            totalElement.textContent = total.toLocaleString() + '원';
        }
        
        console.log('장바구니 아이템 총액:', total);
        
    } catch (error) {
        console.error('❌ 장바구니 아이템 총액 업데이트 실패:', error);
    }
}

// 장바구니에서 상품 제거
async function removeFromCart(buttonOrProductId) {
    try {
        let cartItem;
        
        // buttonOrProductId가 문자열(productId)인지 DOM 요소(button)인지 확인
        if (typeof buttonOrProductId === 'string') {
            // productId로 상품 찾기
            cartItem = document.querySelector(`[data-product-id="${buttonOrProductId}"]`);
        } else if (buttonOrProductId && typeof buttonOrProductId.closest === 'function') {
            // button 요소인 경우
            cartItem = buttonOrProductId.closest('[data-product-id]');
        } else {
            console.error('❌ 잘못된 매개변수 타입:', typeof buttonOrProductId);
            return;
        }
        
        if (cartItem) {
            cartItem.remove();
            await updateCartTotal();
            
            // 장바구니가 비었는지 확인하고 빈 메시지 표시
            checkCartEmpty();
            
            // 주문 총액 표시 업데이트
            if (window.updateOrderTotalDisplay) {
                window.updateOrderTotalDisplay();
            }
            
            console.log('✅ 장바구니에서 상품 제거 완료');
        } else {
            console.warn('⚠️ 제거할 상품을 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 장바구니 상품 제거 실패:', error);
    }
}

// 장바구니가 비었는지 확인
function checkCartEmpty() {
    const cartItems = document.getElementById('cart-items-body');
    const cartItemCount = cartItems.querySelectorAll('[data-product-id]').length;
    
    if (cartItemCount === 0) {
        cartItems.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-gray-500 py-2">
                    <p class="text-xs">장바구니가 비어있습니다</p>
                </td>
            </tr>
        `;
    }
}


// 장바구니 총액 업데이트
async function updateCartTotal() {
    try {
        console.log('💰 장바구니 총액 업데이트 시작');
        
        const cartItems = document.querySelectorAll('[data-product-id]');
        let totalAmount = 0;
        let totalItems = 0;
        
        console.log('🛒 장바구니 아이템 수:', cartItems.length);
        
        cartItems.forEach((item, index) => {
            const quantityInput = item.querySelector('.quantity-input');
            if (!quantityInput) {
                console.warn('⚠️ 수량 입력 필드를 찾을 수 없습니다:', item);
                return;
            }
            
            const quantity = parseInt(quantityInput.value) || 0;
            
            // 가격 정보를 data 속성에서 먼저 가져오기
            let price = parseInt(item.getAttribute('data-price')) || 0;
            
            // data 속성에 가격이 없으면 텍스트에서 추출
            if (price === 0) {
                const priceElement = item.querySelector('.text-xs.text-gray-500');
                if (priceElement) {
                    const priceText = priceElement.textContent;
                    price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
                }
            }
            
            const itemTotal = price * quantity;
            totalAmount += itemTotal;
            totalItems += quantity;
            
            console.log(`📦 아이템 ${index + 1}:`, { price, quantity, itemTotal });
        });
        
        // 주문별 최종 배송비: 입력값만 사용(덮어쓰지 않음)
        const shippingFee = Math.max(0, parseInt(document.getElementById('shipping-fee-input')?.value || 0, 10));
        
        const discountAmount = Math.max(0, parseInt(document.getElementById('discount-amount')?.value || 0, 10));
        const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);
        
        console.log('💰 장바구니 총액 업데이트:', {
            상품금액: totalAmount,
            배송비: shippingFee,
            할인액: discountAmount,
            최종금액: finalTotal
        });
        
        // 주문 총액 표시 업데이트
        if (window.updateOrderTotalDisplay) {
            window.updateOrderTotalDisplay();
        }
        
    } catch (error) {
        console.error('❌ 장바구니 총액 업데이트 실패:', error);
    }
}

// 신규 고객 등록 모달 열기
function openNewCustomerRegistration(customerName) {
    try {
        console.log('🆕 신규 고객 등록 모달 열기:', customerName);
        
        // 고객명을 임시 저장 (고객 등록 완료 후 주문 폼에 자동 입력하기 위해)
        window.tempCustomerName = customerName;
        
        // 주문 모달을 일시적으로 숨기기 (고객 모달이 위에 나타나도록)
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.style.display = 'none';
            console.log('📦 주문 모달 일시적으로 숨김');
        }
        
        // 고객 등록 모달 열기
        if (window.openCustomerModal) {
            window.openCustomerModal();
        } else {
            console.error('❌ 고객 등록 모달을 열 수 없습니다');
            alert('고객 등록 기능을 사용할 수 없습니다.');
        }
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
        console.log('✅ 신규 고객 등록 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 신규 고객 등록 모달 열기 실패:', error);
    }
}

// 상품 검색 닫기 함수
function closeProductSearch() {
    try {
        console.log('🔍 상품 검색 닫기');
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('product-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
        // 검색 입력창 초기화
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log('✅ 상품 검색 닫기 완료');
    } catch (error) {
        console.error('❌ 상품 검색 닫기 실패:', error);
    }
}

// 전역 스코프에 함수 등록
window.searchExistingCustomers = searchExistingCustomers;
window.selectCustomerFromHTML = selectCustomerFromHTML;
window.fillOrderFormFromCustomerId = fillOrderFormFromCustomerId;
window.searchProducts = searchProducts;
window.selectProductFromSearch = selectProductFromSearch;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.updateCartItemTotal = updateCartItemTotal;
window.removeFromCart = removeFromCart;
window.updateCartTotal = updateCartTotal;
window.checkCartEmpty = checkCartEmpty;
window.openNewCustomerRegistration = openNewCustomerRegistration;
window.closeProductSearch = closeProductSearch;
