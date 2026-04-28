// 주문 폼 관련 기능
// features/orders/orderForm.js

/** 금액 정책: 원 단위 정수만 허용. 소수 입력 시 제거(반올림 없음). */
function toIntegerWon(value) {
    if (value == null || value === '') return 0;
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.trunc(n);
}

/** 입력 필드를 원 단위 정수로 강제(소수 제거, 음수는 0). */
function normalizeIntegerInput(el) {
    if (!el) return;
    const v = Math.max(0, toIntegerWon(el.value));
    if (String(el.value) !== String(v)) el.value = v;
}

/** 수량 입력: 정수만 허용, 최소 1 (0 이하 입력 시 1로 보정). */
function normalizeQuantityInput(el) {
    if (!el) return;
    const v = Math.max(1, toIntegerWon(el.value));
    if (String(el.value) !== String(v)) el.value = v;
}

// 주문 폼 HTML 생성 (최소 입력·최대 속도 레이아웃 우선)
function generateOrderFormHTML() {
    if (typeof window.generateOrderFormHTMLMinimal === 'function') return window.generateOrderFormHTMLMinimal();
    console.warn("[orderForm] generateOrderFormHTMLMinimal not loaded — falling back to empty form");
    return "";
}

// 주문 요약 업데이트 함수
function updateOrderSummary() {
    try {
        // data-product-id 속성이 있는 실제 상품 행만 카운트
        const cartItems = document.querySelectorAll('#cart-items-body tr[data-product-id]');
        const totalItems = cartItems.length;
        let totalAmount = 0;
        
        cartItems.forEach(item => {
            const quantity = toIntegerWon(item.querySelector('.quantity-input')?.value);
            const price = toIntegerWon(item.querySelector('td:nth-child(2)')?.textContent?.replace(/[^\d]/g, '') || 0);
            totalAmount += quantity * price;
        });
        
        const shippingFee = toIntegerWon(document.getElementById('shipping-fee-input')?.value);
        const discountAmount = toIntegerWon(document.getElementById('discount-amount')?.value);
        totalAmount = Math.max(0, totalAmount + shippingFee - discountAmount);
        
        // 요약 업데이트
        const summaryTotal = document.getElementById('order-summary-total');
        const summaryItems = document.getElementById('order-summary-items');
        const totalItemsCount = document.getElementById('total-items-count');
        const totalAmountDisplay = document.getElementById('total-amount-display');
        
        if (summaryTotal) summaryTotal.textContent = window.fmt.won(totalAmount);
        if (summaryItems) summaryItems.textContent = totalItems + '개';
        if (totalItemsCount) totalItemsCount.textContent = totalItems;
        if (totalAmountDisplay) totalAmountDisplay.textContent = window.fmt.won(totalAmount);
        
    } catch (error) {
        console.error('❌ 주문 요약 업데이트 실패:', error);
    }
}

// 퀵상품 6개 로드 (최소 레이아웃용) — v3.4.74: 가독성 개선 + 품절 비활성화
async function loadQuickProductsForMinimal() {
    const container = document.getElementById('quick-product-buttons');
    if (!container || !window.supabaseClient) return;
    try {
        // 인기상품 산출: farm_order_items 누적 수량 TOP 6 (없으면 최근 등록 상품)
        let ranked = [];
        try {
            const { data: items } = await window.supabaseClient
                .from('farm_order_items')
                .select('product_name, quantity');
            const counts = {};
            (items || []).forEach(it => {
                if (it.product_name) counts[it.product_name] = (counts[it.product_name] || 0) + (it.quantity || 1);
            });
            ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name]) => name);
        } catch (_) { /* skip ranking */ }

        let products = [];
        if (ranked.length > 0) {
            const { data } = await window.supabaseClient
                .from('farm_products')
                .select('id, name, price, stock, shipping_option')
                .in('name', ranked);
            products = (data || []).sort((a, b) => ranked.indexOf(a.name) - ranked.indexOf(b.name)).slice(0, 6);
        }
        if (products.length < 6) {
            // 부족한 자리는 최근 등록 상품으로 채움
            const { data } = await window.supabaseClient
                .from('farm_products')
                .select('id, name, price, stock, shipping_option')
                .order('created_at', { ascending: false })
                .limit(12);
            const seen = new Set(products.map(p => p.id));
            for (const p of (data || [])) {
                if (products.length >= 6) break;
                if (!seen.has(p.id)) products.push(p);
            }
        }

        const emptyMsg = (msg) =>
            `<div class="txt-muted txt-sm" style="grid-column:span 3;text-align:center;padding:12px 0;">${msg}</div>`;
        if (!products || products.length === 0) {
            container.innerHTML = emptyMsg('등록된 상품이 없습니다');
            return;
        }
        container.innerHTML = products.map(p => {
            const stock = Number(p.stock) || 0;
            const isOut = stock <= 0;
            const isFree = p.shipping_option === '무료배송';
            const safeName = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeShipping = (p.shipping_option || '일반배송').replace(/'/g, "\\'");
            const stockLabel = isOut ? '품절'
                              : stock <= 5 ? `재고 ${stock}개`
                              : '';
            const stockColor = isOut ? 'var(--danger)' : (stock <= 5 ? 'var(--warn)' : 'var(--text-secondary)');
            const cardStyle = `
                display:flex;flex-direction:column;justify-content:space-between;
                min-height:54px;padding:8px 10px;
                border-radius:var(--radius-md);border:1px solid ${isOut ? 'var(--danger)' : 'var(--border)'};
                background:${isOut ? 'var(--danger-bg)' : 'var(--bg-white)'};
                ${isOut ? 'opacity:0.55;cursor:not-allowed;' : 'cursor:pointer;'}
                font-size:13px;text-align:left;line-height:1.3;
                transition:all .15s;
            `.replace(/\s+/g, ' ');
            const onclickAttr = isOut
                ? `onclick="alert('재고가 없는 상품입니다 (품절). 검색에서 직접 추가하거나 재고를 보충해주세요.')"`
                : `onclick="addQuickProductToCart('${p.id}','${safeName}',${parseFloat(p.price)||0},'${safeShipping}')"`;
            const freeBadge = isFree ? `<span style="font-size:9px;background:var(--badge-green-bg);color:var(--primary-hover);padding:1px 5px;border-radius:var(--radius-full);font-weight:600;margin-left:4px;">🚚 무료</span>` : '';
            return `<button type="button" style="${cardStyle}" ${onclickAttr} ${isOut ? 'aria-disabled="true"' : ''}>
                <div class="truncate" style="font-weight:600;color:var(--text-heading);">${(p.name || '').replace(/</g, '&lt;')}${freeBadge}</div>
                <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-top:3px;">
                    <span class="tabular-nums" style="font-size:12px;font-weight:600;color:var(--primary-accent);">${window.fmt.won(p.price)}</span>
                    ${stockLabel ? `<span style="font-size:11px;color:${stockColor};font-weight:500;">${stockLabel}</span>` : ''}
                </div>
            </button>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<div class="txt-muted txt-sm" style="grid-column:span 3;text-align:center;padding:12px 0;">로드 실패</div>`;
    }
}

// 인기 상품 로드 함수 (풀 레이아웃용)
async function loadPopularProducts() {
    const quickContainer = document.getElementById('quick-product-buttons');
    if (quickContainer) {
        await loadQuickProductsForMinimal();
        return;
    }
    try {
        const popularProductsContainer = document.getElementById('popular-products');
        if (!popularProductsContainer) return;
        const popInfo = (msg, withSpinner = false) =>
            `<div class="txt-muted txt-sm" style="display:flex;align-items:center;gap:6px;">${withSpinner ? '<i class="fas fa-spinner fa-spin"></i>' : ''}<span>${msg}</span></div>`;
        popularProductsContainer.innerHTML = popInfo('로딩 중...', true);
        if (!window.supabaseClient) {
            popularProductsContainer.innerHTML = popInfo('인기 상품을 불러올 수 없습니다');
            return;
        }
        const { data: orderItemsData, error: orderItemsError } = await window.supabaseClient
            .from('farm_order_items')
            .select('product_name, quantity');
        if (orderItemsError) {
            popularProductsContainer.innerHTML = popInfo('인기 상품을 불러올 수 없습니다');
            return;
        }
        const productCounts = {};
        (orderItemsData || []).forEach(item => {
            if (item.product_name) productCounts[item.product_name] = (productCounts[item.product_name] || 0) + (item.quantity || 1);
        });
        const topProductNames = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name]) => name);
        if (topProductNames.length === 0) {
            popularProductsContainer.innerHTML = popInfo('아직 주문 데이터가 없습니다');
            return;
        }
        const { data: productsData, error: productsError } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price, image_url, stock')
            .in('name', topProductNames);
        if (productsError || !productsData?.length) {
            popularProductsContainer.innerHTML = popInfo('인기 상품이 없습니다');
            return;
        }
        const sortedProducts = productsData.sort((a, b) => (productCounts[b.name] || 0) - (productCounts[a.name] || 0));
        const popBtn = `flex-shrink:0;background:var(--bg-white);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:8px;transition:all .15s;cursor:pointer;`;
        const popImg = `width:56px;height:56px;background:var(--bg-light);border-radius:var(--radius-md);margin-bottom:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;`;
        popularProductsContainer.innerHTML = sortedProducts.map(product => `
            <button type="button" style="${popBtn}" onclick="addPopularProduct('${product.id}', '${(product.name||'').replace(/'/g, "\\'")}', ${product.price})">
                <div style="${popImg}">
                    ${product.image_url
                        ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
                        : `<i class="fas fa-seedling" style="color:var(--primary-accent);font-size:20px;"></i>`}
                </div>
                <div style="width:80px;text-align:center;">
                    <div class="txt-body truncate" style="font-size:12px;font-weight:500;">${product.name}</div>
                    <div class="tabular-nums" style="font-size:12px;font-weight:600;color:var(--primary-accent);">${window.fmt.won(product.price)}</div>
                </div>
            </button>
        `).join('');
    } catch (error) {
        const popularProductsContainer = document.getElementById('popular-products');
        if (popularProductsContainer) popularProductsContainer.innerHTML = `<div class="txt-muted txt-sm">오류가 발생했습니다</div>`;
    }
}

// 퀵상품 클릭 시 장바구니 추가 또는 수량 +1 (4열: 상품명/단가/수량/소계, 수량 0이면 자동 삭제)
function addQuickProductToCart(productId, productName, price, shippingOption = '일반배송') {
    const cartBody = document.getElementById('cart-items-body');
    if (!cartBody) return;
    const unitPrice = parseFloat(price) || 0;
    const existing = cartBody.querySelector(`tr[data-product-id="${productId}"]`);
    if (existing) {
        const qInput = existing.querySelector('.quantity-input');
        if (qInput) {
            const q = Math.max(0, parseInt(qInput.value || 0) + 1);
            qInput.value = q;
            if (q === 0) {
                existing.remove();
                ensureCartEmptyRow(cartBody);
            }
        }
    } else {
        const emptyRow = cartBody.querySelector('tr td[colspan]');
        if (emptyRow) emptyRow.closest('tr')?.remove();
        const tr = document.createElement('tr');
        tr.setAttribute('data-product-id', productId);
        tr.setAttribute('data-price', String(unitPrice));
        tr.setAttribute('data-unit-price', String(unitPrice));
        tr.setAttribute('data-product-name', productName || '');
        tr.setAttribute('data-shipping-option', shippingOption);
        const lineTotal = unitPrice * 1;
        const isFree = shippingOption === '무료배송';
        const freeBadge = isFree
            ? ` <span style="font-size:9px;background:var(--badge-green-bg);color:var(--primary-hover);padding:1px 5px;border-radius:var(--radius-full);font-weight:600;">🚚 무료</span>`
            : '';
        const stepBtn = `width:28px;height:28px;border-radius:var(--radius-sm);background:var(--bg-light);border:1px solid var(--border-light);display:inline-flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;`;
        tr.innerHTML = `
            <td class="text-center"><input type="checkbox" class="checkbox-ui cart-row-checkbox"></td>
            <td class="td-primary">${(productName || '').replace(/</g, '&lt;')}${freeBadge}</td>
            <td class="td-amount text-right text-numeric">${window.fmt.won(unitPrice)}</td>
            <td class="text-center whitespace-nowrap">
                <button type="button" style="${stepBtn}" onclick="cartQuantityChange('${productId}', -1)">−</button>
                <input type="number" class="quantity-input form-control" style="width:52px;text-align:center;display:inline-block;margin:0 2px;padding:4px;" value="1" min="0" onchange="cartQuantityChange('${productId}', 0)">
                <button type="button" style="${stepBtn}" onclick="cartQuantityChange('${productId}', 1)">+</button>
            </td>
            <td class="cart-line-total td-amount text-right text-numeric">${window.fmt.won(lineTotal)}</td>
            <td class="text-center"><button type="button" class="btn-icon btn-icon-delete" title="이 행 삭제" onclick="window.removeFromCart && window.removeFromCart('${productId}')" style="padding:2px 5px;"><i class="fas fa-trash" style="font-size:10px;"></i></button></td>
        `;
        cartBody.appendChild(tr);
    }
    refreshOrderTotal();
}
function cartQuantityChange(productId, delta) {
    const cartBody = document.getElementById('cart-items-body');
    const row = cartBody?.querySelector(`tr[data-product-id="${productId}"]`);
    if (!row) return;
    const qInput = row.querySelector('.quantity-input');
    if (!qInput) return;
    const q = delta === 0 ? parseInt(qInput.value || 0) : Math.max(0, parseInt(qInput.value || 0) + delta);
    qInput.value = Math.max(0, q);
    if (q === 0) {
        row.remove();
        ensureCartEmptyRow(cartBody);
    }
    refreshOrderTotal();
}
function ensureCartEmptyRow(cartBody) {
    if (!cartBody || cartBody.querySelector('tr[data-product-id]')) return;
    const thCount = cartBody.closest('table')?.querySelectorAll('thead th')?.length || 4;
    cartBody.innerHTML = window.renderEmptyRow(thCount, '장바구니가 비어있습니다');
}
// 라인 소계·상품합계·총금액 실시간 갱신 (원 단위 정수, 단가 스냅샷 기준). updateCartTotal와 동일 규칙 적용.
function refreshOrderTotal() {
    const cartBody = document.getElementById('cart-items-body');
    const discountEl = document.getElementById('discount-amount');
    const shippingInput = document.getElementById('shipping-fee-input');
    const productTotalEl = document.getElementById('product-total-amount');
    const shippingTotalEl = document.getElementById('shipping-total-amount');
    const discountTotalEl = document.getElementById('discount-total-amount');
    const finalTotalEl = document.getElementById('final-total-amount');
    const zeroWarning = document.getElementById('order-total-zero-warning');
    const totalSummary = document.getElementById('order-total-summary');
    if (!cartBody) return;
    let itemsSubtotal = 0;
    cartBody.querySelectorAll('tr[data-product-id]').forEach(tr => {
        const qInput = tr.querySelector('.quantity-input');
        const q = Math.max(1, toIntegerWon(qInput?.value));
        if (qInput && String(qInput.value) !== String(q)) qInput.value = q;
        const unitPrice = toIntegerWon(tr.getAttribute('data-unit-price') || tr.getAttribute('data-price'));
        const lineTotal = unitPrice * q;
        const lineEl = tr.querySelector('.cart-line-total');
        if (lineEl) lineEl.textContent = window.fmt.won(lineTotal);
        itemsSubtotal += lineTotal;
    });
    const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
    const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
    const remoteFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.remoteAreaShippingFee) || 0;
    const remoteChecked = document.getElementById('remote-area-shipping-checkbox')?.checked === true;
    const remoteSurcharge = remoteChecked ? Math.max(0, toIntegerWon(remoteFee)) : 0;
    let shippingFee;
    if (shippingInput && !window._shippingFeeUserEdited) {
        const baseFee = itemsSubtotal >= freeThreshold ? 0 : Math.max(0, toIntegerWon(defaultFee));
        shippingFee = baseFee + remoteSurcharge;
        shippingInput.value = shippingFee;
    } else {
        shippingFee = Math.max(0, toIntegerWon(shippingInput?.value));
        if (shippingInput && String(shippingInput.value) !== String(shippingFee)) shippingInput.value = shippingFee;
    }
    const discount = Math.max(0, toIntegerWon(discountEl?.value));
    if (discountEl && String(discountEl.value) !== String(discount)) discountEl.value = discount;
    const totalAmount = Math.max(0, itemsSubtotal + shippingFee - discount);
    const rawTotal = itemsSubtotal + shippingFee - discount;
    if (productTotalEl) productTotalEl.textContent = window.fmt.won(itemsSubtotal);
    if (shippingTotalEl) shippingTotalEl.textContent = window.fmt.won(shippingFee);
    if (discountTotalEl) discountTotalEl.textContent = window.fmt.won(-discount);
    if (finalTotalEl) finalTotalEl.textContent = window.fmt.won(totalAmount);
    if (zeroWarning) zeroWarning.classList.toggle('hidden', rawTotal >= 0);
    if (totalSummary) {
        if (itemsSubtotal > 0) totalSummary.classList.remove('hidden');
        else totalSummary.classList.add('hidden');
    }
}
window.addQuickProductToCart = addQuickProductToCart;
window.cartQuantityChange = cartQuantityChange;
window.refreshOrderTotal = refreshOrderTotal;
window.loadQuickProductsForMinimal = loadQuickProductsForMinimal;

// 장바구니 일괄 삭제 (체크박스 선택 항목 한꺼번에 제거)
function toggleCartSelectAll(checked) {
    const cartBody = document.getElementById('cart-items-body');
    if (!cartBody) return;
    cartBody.querySelectorAll('tr[data-product-id] .cart-row-checkbox').forEach(cb => {
        cb.checked = !!checked;
    });
}

function cartDeleteSelected() {
    const cartBody = document.getElementById('cart-items-body');
    if (!cartBody) return;
    const checkedRows = cartBody.querySelectorAll('tr[data-product-id]');
    const targets = [];
    checkedRows.forEach(tr => {
        const cb = tr.querySelector('.cart-row-checkbox');
        if (cb && cb.checked) targets.push(tr);
    });
    if (targets.length === 0) {
        alert('삭제할 항목을 체크박스로 먼저 선택해주세요.');
        return;
    }
    if (!confirm(`선택한 ${targets.length}개 상품을 장바구니에서 삭제하시겠습니까?`)) return;
    targets.forEach(tr => tr.remove());
    // 마스터 체크박스 해제
    const master = document.getElementById('cart-select-all');
    if (master) master.checked = false;
    // 빈 행 복원
    if (typeof ensureCartEmptyRow === 'function') ensureCartEmptyRow(cartBody);
    // 총액 재계산
    if (typeof refreshOrderTotal === 'function') refreshOrderTotal();
    if (window.updateCartTotal) window.updateCartTotal();
    if (window.showToast) window.showToast(`${targets.length}개 항목 삭제 완료`, 1500);
}

window.toggleCartSelectAll = toggleCartSelectAll;
window.cartDeleteSelected = cartDeleteSelected;

// 인기 상품 추가 함수 (레거시/풀 폼용)
function addPopularProduct(productId, productName, price) {
    if (document.getElementById('quick-product-buttons')) {
        addQuickProductToCart(productId, productName, price);
        return;
    }
    if (window.addToCart) window.addToCart(productId, productName, price, 1);
    if (window.refreshOrderTotal) window.refreshOrderTotal();
    else if (window.updateCartTotal) window.updateCartTotal();
}

// 주문 폼 초기화
async function initOrderForm() {
    try {
        console.log('📝 주문 폼 초기화 시작');
        
        // 주문 폼 요소 확인
        const orderForm = document.getElementById('order-form');
        console.log('🔍 주문 폼 요소:', orderForm);
        
        if (!orderForm) {
            console.error('❌ 주문 폼 요소를 찾을 수 없습니다');
            return;
        }
        
        // 배송비 환경설정 먼저 로드 (매우 중요!)
        console.log('🚚 배송비 환경설정 로드 중...');
        await initShippingFeeFromSettings();
        console.log('✅ 배송비 환경설정 로드 완료:', SHIPPING_SETTINGS);
        
        // 주문채널: 풀 레이아웃일 때만 farm_channels 로드 (최소 레이아웃은 hidden 기본값 유튜브)
        await initOrderChannelFromSettings();
        // 주문 상태 드롭다운을 환경설정 settings.orderStatuses 로 동적 주입
        await populateOrderStatusSelectFromSettings();
        // 대시보드형 레이아웃: 퀵상품 로드 + 채널 요약 동기화 + 모달 전체 스크롤 제거 + 하단 버튼 숨김
        if (document.getElementById('quick-product-buttons')) {
            await loadQuickProductsForMinimal();
            window.SHIPPING_SETTINGS = window.SHIPPING_SETTINGS || { defaultShippingFee: 3000, freeShippingThreshold: 50000, remoteAreaShippingFee: 5000 };
            const modalFooterSubmit = document.querySelector('#order-modal .border-t button[form="order-form"]');
            if (modalFooterSubmit) modalFooterSubmit.style.display = 'none';
            const scrollArea = document.querySelector('#order-modal .modal-content-scroll');
            if (scrollArea) {
                scrollArea.style.overflow = 'hidden';
                scrollArea.style.maxHeight = 'calc(98vh - 100px)';
                scrollArea.style.display = 'flex';
                scrollArea.style.flexDirection = 'column';
            }
            const formEl = document.getElementById('order-form');
            if (formEl) {
                formEl.style.flex = '1';
                formEl.style.minHeight = '0';
                formEl.style.display = 'flex';
                formEl.style.flexDirection = 'column';
            }
            const formParent = formEl && formEl.parentElement;
            if (formParent) {
                formParent.style.flex = '1';
                formParent.style.minHeight = '0';
                formParent.style.display = 'flex';
            }
            const statusSummary = document.getElementById('order-status-summary');
            if (statusSummary) {
                const statusSelect = document.getElementById('order-status');
                if (statusSelect) statusSummary.textContent = statusSelect.value;
            }
        }
        
        // 인기 상품 로드
        console.log('🔧 인기 상품 로드');
        loadPopularProducts();
        
        // 고객 검색 초기화
        if (window.initCustomerSearch) {
            console.log('🔧 고객 검색 초기화');
            initCustomerSearch();
        }
        
        // 상품 검색 UI 초기화
        if (window.initProductSearchUI) {
            console.log('🔧 상품 검색 UI 초기화');
            initProductSearchUI();
        }
        
        // 폼 유효성 검사 초기화
        if (window.initFormValidation) {
            console.log('🔧 폼 유효성 검사 초기화');
            initFormValidation();
        }
        
        // 주문 폼 제출 이벤트 핸들러 초기화
        if (window.initOrderFormSubmit) {
            console.log('🔧 주문 폼 제출 이벤트 핸들러 초기화');
            initOrderFormSubmit();
        }
        
        // 주문 요약 초기화
        console.log('🔧 주문 요약 초기화');
        updateOrderSummary();
        
        // 이벤트 리스너 설정
        console.log('🔧 이벤트 리스너 설정');
        setupOrderFormEventListeners();
        if (window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();

        // 폼 제출 이벤트 처리 - 주문 등록 버튼 클릭 시에만 처리
        if (orderForm) {
            orderForm.addEventListener('submit', function(event) {
                console.log('📝 폼 제출 이벤트 감지됨');
                console.log('🔍 event.submitter:', event.submitter);
                console.log('🔍 event.submitter type:', event.submitter?.type);
                console.log('🔍 event.submitter form:', event.submitter?.form);
                console.log('🔍 event.submitter onclick:', event.submitter?.getAttribute('onclick'));
                
                // 주문 등록 버튼이 클릭된 경우에만 처리
                const submitButton = event.submitter;
                const isOrderSubmitButton = submitButton && (
                    submitButton.getAttribute('data-order-submit') === 'true' ||
                    (submitButton.type === 'submit' && submitButton.getAttribute('form') === 'order-form') ||
                    (submitButton.type === 'submit' && submitButton.form === orderForm) ||
                    (submitButton.getAttribute('onclick') && submitButton.getAttribute('onclick').includes('handleOrderSubmit'))
                );
                
                console.log('🔍 주문 등록 버튼 여부:', isOrderSubmitButton);
                
                if (isOrderSubmitButton) {
                    console.log('✅ 주문 등록 버튼 클릭으로 폼 제출 처리');
                    // handleOrderSubmit 함수를 직접 호출하고 결과 확인
                    handleOrderSubmit(event).then(result => {
                        if (result === false) {
                            console.log('❌ 주문 제출 실패');
                        } else {
                            console.log('✅ 주문 제출 성공');
                        }
                    }).catch(error => {
                        console.error('❌ 주문 제출 중 오류:', error);
                    });
                } else {
                    console.log('🚫 일반 폼 제출 차단');
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
            console.log('✅ 폼 제출 이벤트 처리 설정 완료');
        }
        
        console.log('✅ 주문 폼 초기화 완료');
        
        // 주문 등록 버튼 확인
        const submitButton = document.querySelector('button[type="submit"][form="order-form"]');
        console.log('🔍 주문 등록 버튼:', submitButton);
        
        if (submitButton) {
            console.log('✅ 주문 등록 버튼 확인 완료');
        } else {
            console.error('❌ 주문 등록 버튼을 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 폼 초기화 실패:', error);
    }
}

// 주문 폼 이벤트 리스너 설정
function setupOrderFormEventListeners() {
    try {
        console.log('🔗 주문 폼 이벤트 리스너 설정');
        
        // 장바구니 변경 시 요약 업데이트
        const cartContainer = document.getElementById('cart-items-body');
        if (cartContainer) {
            cartContainer.addEventListener('change', updateOrderSummary);
            cartContainer.addEventListener('input', updateOrderSummary);
        }
        
        // 배송비 변경 시 요약 업데이트
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (shippingFeeInput) {
            shippingFeeInput.addEventListener('change', updateOrderSummary);
            shippingFeeInput.addEventListener('input', updateOrderSummary);
        }
        
        // 할인액 변경 시 요약 업데이트
        const discountAmountInput = document.getElementById('discount-amount');
        if (discountAmountInput) {
            discountAmountInput.addEventListener('change', updateOrderSummary);
            discountAmountInput.addEventListener('input', updateOrderSummary);
        }
        
        
        console.log('✅ 주문 폼 이벤트 리스너 설정 완료');
        
    } catch (error) {
        console.error('❌ 주문 폼 이벤트 리스너 설정 실패:', error);
    }
}



// 배송비 설정 로드
function loadShippingSettings() {
    try {
        if (window.settingsDataManager) {
            window.settingsDataManager.loadSettings().then(settings => {
                const shippingFeeInput = document.getElementById('shipping-fee-input');
                // 주문별 입력: 사용자가 이미 수정했으면 제안값으로 덮어쓰지 않음
                if (shippingFeeInput && settings.shipping?.defaultShippingFee != null && !window._shippingFeeUserEdited) {
                    shippingFeeInput.value = Math.max(0, toIntegerWon(settings.shipping.defaultShippingFee));
                }
            });
        }
        console.log('✅ 배송비 설정 로드 완료');
    } catch (error) {
        console.error('❌ 배송비 설정 로드 실패:', error);
    }
}

// 주문채널: farm_channels DB 연동만 사용 (하드코딩 기본목록 없음)
async function initOrderChannelFromSettings() {
    try {
        const channelSelect = document.getElementById('order-channel');
        if (!channelSelect || channelSelect.tagName !== 'SELECT') return;

        let channels = [];
        if (window.salesChannelsDataManager) {
            try {
                await window.salesChannelsDataManager.loadChannels();
                channels = window.salesChannelsDataManager.getActiveChannels();
            } catch (e) {
                console.warn('⚠️ salesChannelsDataManager 로드 실패:', e);
            }
        }
        // salesChannelsDataManager 없거나 실패 시 Supabase에서 직접 조회 (주문 먼저 열었을 때 대비)
        if (channels.length === 0 && window.supabaseClient) {
            try {
                let res = await window.supabaseClient
                    .from('farm_channels')
                    .select('id, name, is_active')
                    .order('sort_order', { ascending: true });
                if (res.error) {
                    res = await window.supabaseClient
                        .from('farm_channels')
                        .select('id, name, is_active');
                }
                const { data, error } = res;
                if (!error && data && data.length > 0) {
                    channels = data.filter(c => c.is_active !== false).map(c => ({ name: c.name }));
                }
            } catch (e) {
                console.warn('⚠️ farm_channels 직접 조회 실패:', e);
            }
        }

        channelSelect.innerHTML = '<option value="">-- 채널 선택 --</option>';
        if (channels.length > 0) {
            channels.forEach(channel => {
                const name = channel.name || channel;
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                channelSelect.appendChild(option);
            });
            channelSelect.value = '';
            console.log('✅ 주문채널 옵션 로드 완료 (farm_channels):', channels.length, '개');
        } else {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '채널 없음 (환경설정 → 판매채널에서 추가)';
            channelSelect.appendChild(opt);
            channelSelect.value = '';
            console.warn('⚠️ 주문채널: farm_channels에 데이터가 없습니다. 환경설정에서 판매채널을 추가하세요.');
        }
        const chSummary = document.getElementById('order-channel-summary');
        if (chSummary) {
            const sel = document.getElementById('order-channel');
            if (sel) chSummary.textContent = sel.value || '채널 없음';
        }
    } catch (error) {
        console.error('❌ 주문채널 연동 실패:', error);
        const channelSelect = document.getElementById('order-channel');
        if (channelSelect) {
            channelSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '채널 없음 (환경설정 → 판매채널에서 추가)';
            channelSelect.appendChild(opt);
            channelSelect.value = '';
        }
        const chSummary = document.getElementById('order-channel-summary');
        if (chSummary) chSummary.textContent = '채널 없음';
    }
}

// 전역 배송비 설정 변수
let SHIPPING_SETTINGS = {
    defaultShippingFee: 3000,
    freeShippingThreshold: 50000,
    remoteAreaShippingFee: 5000
};

/** 환경설정 orderStatuses 배열로 #order-status 드롭다운 동적 생성. orphan fallback 포함. */
async function populateOrderStatusSelectFromSettings(preservedValue) {
    const select = document.getElementById('order-status');
    if (!select) return;
    try {
        let settings = window.settingsDataManager?.getAllSettings();
        if (!settings || !Array.isArray(settings.orderStatuses) || settings.orderStatuses.length === 0) {
            if (window.settingsDataManager?.loadSettings) settings = await window.settingsDataManager.loadSettings();
        }
        const statuses = (settings && Array.isArray(settings.orderStatuses)) ? settings.orderStatuses : [];
        if (statuses.length === 0) return;
        const current = preservedValue != null ? preservedValue : select.value;
        const values = statuses.map(s => s.value);
        const options = [...statuses];
        if (current && !values.includes(current)) options.push({ value: current, label: `${current} (삭제됨)` });
        const defaultSelect = current || (values.includes('주문접수') ? '주문접수' : values[0]);
        select.innerHTML = options.map(s => {
            const v = String(s.value || '').replace(/"/g, '&quot;');
            const label = String(s.label || s.value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<option value="${v}"${s.value === defaultSelect ? ' selected' : ''}>${label}</option>`;
        }).join('');
    } catch (e) {
        console.warn('⚠️ 주문 상태 드롭다운 로드 실패:', e);
    }
}

/** 환경설정 shippingMethods 배열로 #shipping-method 드롭다운 동적 생성 */
async function loadShippingMethodsFromSettings() {
    const select = document.getElementById('shipping-method');
    if (!select) return;
    try {
        const settings = window.settingsDataManager?.getAllSettings();
        const methods = settings?.shipping?.shippingMethods;
        if (!Array.isArray(methods) || methods.length === 0) return;
        // 현재 선택값 보존
        const current = select.value;
        select.innerHTML = methods.map(m => {
            const isFree = m.includes('방문') || m.includes('픽업') || m.includes('수령');
            return `<option value="${m}"${m === current ? ' selected' : ''}>${m}${isFree ? ' (배송비 무료)' : ''}</option>`;
        }).join('');
        console.log('✅ 배송 방법 드롭다운 환경설정 연동 완료:', methods);
    } catch (e) {
        console.warn('⚠️ 배송 방법 드롭다운 로드 실패, 기본값 유지:', e);
    }
}

// 배송 방법 변경 처리
function updateShippingMethod() {
    console.log('🚚 배송 방법 변경됨');
    
    const shippingMethod = document.getElementById('shipping-method')?.value;
    console.log('🚚 선택된 배송 방법:', shippingMethod);
    
    // 배송비 자동 재계산
    updateOrderTotalDisplay();
    
    // 주소 필드 처리 (방문수령·픽업 등 직접 수령 방식이면 주소 선택사항)
    const addressField = document.getElementById('order-customer-address');
    const isPickup = shippingMethod && (shippingMethod.includes('방문') || shippingMethod.includes('픽업') || shippingMethod.includes('수령'));
    if (isPickup) {
        if (addressField) {
            addressField.placeholder = `${shippingMethod} (주소 입력 선택사항)`;
        }
        console.log(`✅ ${shippingMethod} 선택 - 배송비 0원`);
    } else {
        // 택배/직접배송일 경우 주소 필수
        if (addressField) {
            addressField.placeholder = '배송 주소를 입력하세요';
        }
    }
}

// 배송비 환경설정 연동 (farm_settings 로드만, 입력란 덮어쓰기는 사용자 미편집 시에만)
async function initShippingFeeFromSettings() {
    try {
        console.log('🚚 배송비 환경설정 연동 초기화 (Supabase farm_settings 전용)');
        
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (!shippingFeeInput) {
            console.warn('⚠️ 배송비 입력 요소를 찾을 수 없습니다');
            return;
        }
        
        if (!window.settingsDataManager) {
            console.error('❌ settingsDataManager를 찾을 수 없습니다');
            return;
        }
        
        try {
            const settings = await window.settingsDataManager.loadSettings();

            if (settings && settings.shipping) {
                SHIPPING_SETTINGS.defaultShippingFee = settings.shipping.defaultShippingFee || 3000;
                SHIPPING_SETTINGS.freeShippingThreshold = settings.shipping.freeShippingThreshold || 50000;
                SHIPPING_SETTINGS.remoteAreaShippingFee = settings.shipping.remoteAreaShippingFee ?? 5000;
                window.SHIPPING_SETTINGS = SHIPPING_SETTINGS;
                console.log('✅ 환경설정에서 배송비 설정 로드 완료:', SHIPPING_SETTINGS);
            }
            // 배송 방법 드롭다운도 환경설정에서 동적 로드
            await loadShippingMethodsFromSettings();
            // 제안값 주입: 사용자가 한 번이라도 수정했으면 덮어쓰지 않음
            if (!window._shippingFeeUserEdited) {
                const defaultFee = (settings && settings.shipping && settings.shipping.defaultShippingFee) || SHIPPING_SETTINGS.defaultShippingFee || 3000;
                shippingFeeInput.value = Math.max(0, toIntegerWon(defaultFee));
                if (typeof updateShippingFeeDisplay === 'function') updateShippingFeeDisplay(shippingFeeInput.value);
            }
        } catch (error) {
            console.error('❌ 환경설정 배송비 조회 실패:', error);
            if (!window._shippingFeeUserEdited && shippingFeeInput) {
                shippingFeeInput.value = SHIPPING_SETTINGS.defaultShippingFee ?? 3000;
            }
        }
    } catch (error) {
        console.error('❌ 배송비 환경설정 연동 실패:', error);
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            shippingFeeInput.value = SHIPPING_SETTINGS.defaultShippingFee ?? 3000;
        }
    }
}

/** 새 주문 폼 최초 로드 시 1회만 제안값 적용 (환경설정 defaultShippingFee). clearOrderForm() 이후 호출. */
window.applyShippingFeeSuggestionForNewOrder = async function () {
    window._shippingFeeUserEdited = false;
    const el = document.getElementById('shipping-fee-input');
    if (!el) return;
    try {
        if (window.settingsDataManager) {
            const settings = await window.settingsDataManager.loadSettings();
            if (settings && settings.shipping != null) {
                SHIPPING_SETTINGS.defaultShippingFee = settings.shipping.defaultShippingFee ?? 3000;
                SHIPPING_SETTINGS.freeShippingThreshold = settings.shipping.freeShippingThreshold ?? 50000;
                SHIPPING_SETTINGS.remoteAreaShippingFee = settings.shipping.remoteAreaShippingFee ?? 5000;
                window.SHIPPING_SETTINGS = SHIPPING_SETTINGS;
            }
        }
        if (!window._shippingFeeUserEdited) {
            const defaultFee = Math.max(0, toIntegerWon(SHIPPING_SETTINGS.defaultShippingFee ?? 3000));
            el.value = defaultFee;
            if (typeof window.updateCartTotal === 'function') window.updateCartTotal();
            else if (typeof window.updateOrderTotalDisplay === 'function') window.updateOrderTotalDisplay();
        }
    } catch (e) {
        if (!window._shippingFeeUserEdited) el.value = Math.max(0, toIntegerWon(SHIPPING_SETTINGS.defaultShippingFee ?? 3000));
    }
};

// 배송비 표시 업데이트
function updateShippingFeeDisplay(shippingFee) {
    try {
        const formattedFee = parseInt(shippingFee) || 0;
        console.log('🚚 배송비 표시 업데이트:', formattedFee);
        
        // 주문 총액 업데이트
        updateOrderTotalDisplay();
        
    } catch (error) {
        console.error('❌ 배송비 표시 업데이트 실패:', error);
    }
}

// 주문 총액 표시 업데이트
function updateOrderTotalDisplay() {
    try {
        console.log('💰 주문 총액 표시 업데이트');
        
        const totalSummary = document.getElementById('order-total-summary');
        if (!totalSummary) return;
        
        // 장바구니 아이템들 계산
        const cartItems = document.querySelectorAll('[data-product-id]');
        let productTotal = 0;
        let totalItems = 0;
        
        cartItems.forEach(item => {
            const quantityInput = item.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput?.value || 0);
            const priceText = item.querySelector('.text-xs.text-gray-500')?.textContent || '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            
            productTotal += price * quantity;
            totalItems += quantity;
        });
        
        // 배송비: 사용자가 수정 안 했으면 환경설정 제안 + 도서산간 추가금
        // v3.4.82: 카트에 "무료배송" 상품 1개라도 있으면 자동 0원 (행사상품 우선)
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
        const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
        const remoteFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.remoteAreaShippingFee) || 0;
        const remoteChecked = document.getElementById('remote-area-shipping-checkbox')?.checked === true;
        const remoteSurcharge = remoteChecked ? Math.max(0, toIntegerWon(remoteFee)) : 0;

        // 카트에 무료배송 상품 포함 여부 확인
        const hasFreeShippingItem = !!cartBody.querySelector('tr[data-product-id][data-shipping-option="무료배송"]');

        let shippingFee;
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            const baseFee = (hasFreeShippingItem || productTotal >= freeThreshold)
                ? 0
                : Math.max(0, toIntegerWon(defaultFee));
            const suggested = baseFee + remoteSurcharge;
            shippingFeeInput.value = suggested;
            shippingFee = suggested;
        } else {
            shippingFee = shippingFeeInput ? Math.max(0, toIntegerWon(shippingFeeInput.value)) : 0;
        }

        // 무료배송 안내 메시지 토글 (#shipping-free-notice 가 있으면 표시/숨김)
        const freeNotice = document.getElementById('shipping-free-notice');
        if (freeNotice) {
            if (hasFreeShippingItem && !window._shippingFeeUserEdited) {
                freeNotice.classList.remove('hidden');
                freeNotice.textContent = '🚚 무료배송 상품 포함 → 배송비 자동 0원';
            } else {
                freeNotice.classList.add('hidden');
            }
        }
        
        // 할인액(원 단위 정수), 총액 = max(0, 상품+배송비-할인)
        const discountEl = document.getElementById('discount-amount');
        const discountAmount = toIntegerWon(discountEl?.value);
        if (discountEl && String(discountEl.value) !== String(discountAmount)) discountEl.value = Math.max(0, discountAmount);
        const rawTotal = productTotal + shippingFee - discountAmount;
        const finalTotal = Math.max(0, rawTotal);
        
        // 총액 표시 업데이트
        const productTotalElement = document.getElementById('product-total-amount');
        const shippingTotalElement = document.getElementById('shipping-total-amount');
        const discountTotalElement = document.getElementById('discount-total-amount');
        const finalTotalElement = document.getElementById('final-total-amount');
        const zeroWarning = document.getElementById('order-total-zero-warning');
        
        if (productTotalElement) productTotalElement.textContent = window.fmt.won(productTotal);
        if (shippingTotalElement) shippingTotalElement.textContent = window.fmt.won(shippingFee);
        if (discountTotalElement) discountTotalElement.textContent = window.fmt.won(-discountAmount);
        if (finalTotalElement) finalTotalElement.textContent = window.fmt.won(finalTotal);
        if (zeroWarning) {
            zeroWarning.classList.toggle('hidden', rawTotal >= 0);
        }
        
        // 총액 요약 표시/숨김
        if (productTotal > 0) {
            totalSummary.classList.remove('hidden');
        } else {
            totalSummary.classList.add('hidden');
        }
        
        console.log('💰 주문 총액 업데이트:', {
            상품금액: productTotal,
            배송비: shippingFee,
            할인액: discountAmount,
            최종금액: finalTotal
        });
        
    } catch (error) {
        console.error('❌ 주문 총액 표시 업데이트 실패:', error);
    }
}

// 고객 검색 초기화
function initCustomerSearch() {
    try {
        console.log('🔍 고객 검색 초기화');
        
        // 고객 검색 관련 이벤트 리스너 설정
        const customerNameInput = document.getElementById('order-customer-name');
        if (customerNameInput) {
            // 검색 결과 외부 클릭 시 숨기기
            document.addEventListener('click', (e) => {
                const resultsDiv = document.getElementById('customer-search-results');
                if (resultsDiv && !resultsDiv.contains(e.target) && !customerNameInput.contains(e.target)) {
                    resultsDiv.classList.add('hidden');
                }
            });
        }
        
        console.log('✅ 고객 검색 초기화 완료');
        
    } catch (error) {
        console.error('❌ 고객 검색 초기화 실패:', error);
    }
}

// 상품 검색 UI 초기화
function initProductSearchUI() {
    try {
        console.log('🛍️ 상품 검색 UI 초기화');
        
        // 상품 검색 관련 이벤트 리스너 설정
        const productSearchInput = document.getElementById('product-search');
        if (productSearchInput) {
            // 검색 결과 외부 클릭 시 숨기기
            document.addEventListener('click', (e) => {
                const resultsDiv = document.getElementById('product-search-results');
                if (resultsDiv && !resultsDiv.contains(e.target) && !productSearchInput.contains(e.target)) {
                    resultsDiv.classList.add('hidden');
                }
            });
        }
        
        // 상품 목록 버튼 이벤트
        const showProductListBtn = document.getElementById('show-product-list');
        if (showProductListBtn) {
            showProductListBtn.addEventListener('click', (event) => {
                // 이벤트 전파 방지
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                console.log('📦 상품 목록 모달 표시');
                showProductManagementModal(event);
            });
        }
        
        console.log('✅ 상품 검색 UI 초기화 완료');
        
    } catch (error) {
        console.error('❌ 상품 검색 UI 초기화 실패:', error);
    }
}

// 주문 폼 데이터 수집
async function collectOrderFormData() {
    try {
        // 주소 조합 (기본주소 + 상세주소)
        const baseAddress = document.getElementById('order-customer-address')?.value || '';
        const detailAddress = document.getElementById('order-customer-address-detail')?.value || '';
        const fullAddress = baseAddress + (detailAddress ? ' ' + detailAddress : '');
        
        // 🆕 customer_id 가져오기 (정규화)
        const customerIdInput = document.getElementById('order-customer-id');
        const customerId = customerIdInput?.value || null;
        
        console.log('🔍 customer_id input 요소:', customerIdInput);
        console.log('🔍 customer_id 값:', customerId);
        
        const formData = {
            customer_id: customerId,
            customer_name: document.getElementById('order-customer-name')?.value || '',
            customer_phone: document.getElementById('order-customer-phone')?.value || '',
            customer_address: fullAddress,
            customer_address_base: baseAddress,
            customer_address_detail: detailAddress,
            order_status: document.getElementById('order-status')?.value || '주문접수',
            order_channel: document.getElementById('order-channel')?.value || '',
            shipping_method: document.getElementById('shipping-method')?.value || '택배',
            memo: document.getElementById('order-memo')?.value || '',
            shipping_fee: toIntegerWon(document.getElementById('shipping-fee-input')?.value),
            discount_amount: toIntegerWon(document.getElementById('discount-amount')?.value),
            items: await collectCartItems()
        };
        
        console.log('📝 주문 폼 데이터 수집:', formData);
        console.log('🆔 customer_id:', customerId || '없음 (레거시 방식)');
        return formData;
        
    } catch (error) {
        console.error('❌ 주문 폼 데이터 수집 실패:', error);
        return null;
    }
}

// 장바구니 아이템 수집 (단가 스냅샷·소계 = unit_price * qty, 원 단위 정수만)
async function collectCartItems() {
    try {
        const cartBody = document.getElementById('cart-items-body');
        if (!cartBody) return [];
        const rows = cartBody.querySelectorAll('tr[data-product-id]');
        const items = [];
        for (const row of rows) {
            const quantity = Math.max(1, toIntegerWon(row.querySelector('.quantity-input')?.value));
            const productId = row.getAttribute('data-product-id');
            const productName = row.getAttribute('data-product-name') || row.querySelector('td:first-child')?.textContent?.trim() || '';
            const unitPrice = toIntegerWon(row.getAttribute('data-unit-price') || row.getAttribute('data-price') || 0);
            const lineTotal = unitPrice * quantity;
            const size = row.getAttribute('data-size') || row.getAttribute('data-option-text') || null;
            items.push({
                product_id: productId,
                product_name: productName,
                quantity,
                price: unitPrice,
                total: lineTotal,
                size: size || undefined
            });
        }
        return items;
    } catch (error) {
        console.error('❌ 장바구니 아이템 수집 실패:', error);
        return [];
    }
}

// 상품관리 모달 표시
function showProductManagementModal(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('📦 상품관리 모달 표시');
        
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('product-management-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const body = `
            ${renderFilterBar(`
                <input type="text" id="product-modal-search"
                       placeholder="상품명으로 검색..." oninput="searchProductsInModal(this.value)">
                <button class="btn-primary" onclick="loadAllProducts()">전체 로드</button>
            `)}
            <div id="product-modal-list">
                <div class="td-null" style="text-align:center;padding:40px 8px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                    상품 목록을 불러오는 중...
                </div>
            </div>
        `;

        const modalHTML = renderModal({
            id: 'product-management-modal',
            title: '상품 목록',
            size: 'lg',
            icon: 'fa-box',
            body,
            closeCall: 'closeProductManagementModal(event)'
        });
        
        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 상품 목록 로드
        loadAllProducts();
        
        console.log('✅ 상품관리 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 상품관리 모달 표시 실패:', error);
    }
}

// 상품관리 모달 닫기
function closeProductManagementModal(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('🗑️ 상품관리 모달 닫기');
        
        const modal = document.getElementById('product-management-modal');
        if (modal) {
            modal.remove();
        }
        
        // 선택된 상품 초기화
        selectedProducts.clear();
        
        console.log('🗑️ 모달 닫기 - 선택된 상품 초기화');
    } catch (error) {
        console.error('❌ 상품관리 모달 닫기 실패:', error);
    }
}

// 모든 상품 로드
async function loadAllProducts() {
    try {
        console.log('📦 모든 상품 로드 시작 (캐시 무효화)');
        
        const productList = document.getElementById('product-modal-list');
        if (!productList) return;
        
        const stateBlock = (icon, message, color) => `
            <div class="td-null" style="text-align:center;padding:40px 8px;${color ? `color:${color};` : ''}">
                <i class="fas ${icon}" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                <p>${message}</p>
            </div>`;

        productList.innerHTML = stateBlock('fa-spinner fa-spin', '상품 목록을 불러오는 중...');
        
        if (window.supabaseClient) {
            // 🔥 캐시 무효화: 타임스탬프 추가하여 항상 최신 데이터 가져오기
            const timestamp = new Date().getTime();
            console.log('🔄 캐시 무효화 타임스탬프:', timestamp);
            
            const { data, error } = await window.supabaseClient
                .from('farm_products')
                .select('id, name, price, image_url, stock, description, shipping_option, updated_at')
                .order('name');
            
            if (error) {
                console.error('❌ 상품 목록 로드 실패:', error);
                productList.innerHTML = stateBlock(
                    'fa-exclamation-triangle',
                    `상품 목록을 불러올 수 없습니다<br><span class="txt-muted txt-sm">${error.message}</span>`,
                    'var(--danger)'
                );
                return;
            }
            
            if (data && data.length > 0) {
                // 🔍 로드된 상품 데이터 로그
                console.log('📦 로드된 상품 수:', data.length);
                console.log('📦 첫 번째 상품:', data[0]);
                console.log('📦 전체 상품 목록:', data.map(p => `${p.name} (${p.price}원)`).join(', '));
                
                const cardStyle = `background:var(--bg-white);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:16px;transition:box-shadow .15s;`;
                const stepperBtn = `width:24px;height:24px;border-radius:var(--radius-sm);background:var(--bg-light);border:1px solid var(--border-light);display:inline-flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;`;

                productList.innerHTML = `
                    <div id="selected-products-summary" class="hidden" style="background:var(--info-light,#eff6ff);border:1px solid var(--info,#60a5fa);border-radius:var(--radius-lg);padding:12px;margin-bottom:16px;">
                        <div class="flex-between">
                            <span class="txt-body" style="font-weight:500;color:var(--info-dark,#1e40af);">선택된 상품: <span id="selected-count">0</span>개</span>
                            <button class="btn-text" onclick="clearAllSelections()">전체 해제</button>
                        </div>
                    </div>

                    <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">
                        ${data.map(product => {
                            const so = product.shipping_option || '일반배송';
                            const stock = product.stock || 999;
                            return `
                            <div style="${cardStyle}" data-shipping-option="${so}">
                                <div class="flex-gap-3" style="display:flex;align-items:flex-start;margin-bottom:12px;">
                                    <div style="flex-shrink:0;padding-top:4px;">
                                        <input type="checkbox" id="product-${product.id}" class="product-checkbox"
                                               data-shipping-option="${so}"
                                               onchange="toggleProductSelection('${product.id}', '${product.name}', ${product.price}, '${so}')">
                                    </div>
                                    <div style="width:64px;height:64px;background:var(--bg-light);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
                                        ${product.image_url
                                            ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
                                            : `<i class="fas fa-seedling" style="color:var(--text-muted);font-size:20px;"></i>`}
                                    </div>
                                    <div style="flex:1;min-width:0;">
                                        <h3 class="txt-body" style="font-weight:600;margin-bottom:4px;">${product.name}</h3>
                                        <p style="font-size:17px;font-weight:700;color:var(--primary-accent);">${window.fmt.won(product.price)}</p>
                                    </div>
                                </div>

                                <div class="txt-muted txt-sm" style="margin-bottom:12px;">
                                    <div><i class="fas fa-box"></i> 재고: ${product.stock || 0}개</div>
                                    ${so !== '일반배송' ? `<div style="color:var(--primary-accent);font-weight:500;margin-top:2px;"><i class="fas fa-truck"></i> ${so}</div>` : ''}
                                </div>

                                <div id="quantity-${product.id}" class="hidden">
                                    <label class="form-label" style="font-size:12px;margin-bottom:4px;display:block;">수량</label>
                                    <div class="flex-gap-2" style="display:flex;align-items:center;">
                                        <button type="button" style="${stepperBtn}" onclick="decreaseQuantity('${product.id}')"><i class="fas fa-minus"></i></button>
                                        <input type="number" id="qty-${product.id}" class="form-control"
                                               style="width:64px;text-align:center;padding:4px 8px;font-size:12px;"
                                               value="1" min="1" max="${stock}"
                                               onchange="validateQuantity('${product.id}', ${stock})">
                                        <button type="button" style="${stepperBtn}" onclick="increaseQuantity('${product.id}', ${stock})"><i class="fas fa-plus"></i></button>
                                    </div>
                                </div>

                                ${product.description ? `<p class="txt-muted txt-sm" style="margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${product.description}</p>` : ''}
                            </div>`;
                        }).join('')}
                    </div>

                    ${renderFormActions(`
                        <button class="btn-secondary" onclick="closeProductManagementModal(event)">취소</button>
                        <button class="btn-primary" onclick="addSelectedProductsToCart(event)">선택한 상품 장바구니에 추가</button>
                    `)}
                `;
                console.log('✅ 상품 목록 로드 완료:', data.length + '개');
            } else {
                productList.innerHTML = stateBlock('fa-box-open', '등록된 상품이 없습니다');
            }
        } else {
            console.error('❌ Supabase 클라이언트가 연결되지 않았습니다');
            productList.innerHTML = stateBlock('fa-exclamation-triangle', '데이터베이스 연결이 필요합니다', 'var(--danger)');
        }
        
    } catch (error) {
        console.error('❌ 상품 목록 로드 실패:', error);
    }
}

// 모달에서 상품 검색
function searchProductsInModal(query) {
    try {
        console.log('🔍 모달에서 상품 검색:', query);
        
        // Grid 컨테이너 안의 모든 상품 카드 선택
        const gridContainer = document.querySelector('#product-modal-list .grid');
        if (!gridContainer) {
            console.warn('⚠️ 상품 그리드 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        const productCards = gridContainer.querySelectorAll(':scope > div');
        console.log('📦 검색 대상 상품 카드 수:', productCards.length);
        
        let matchCount = 0;
        productCards.forEach(card => {
            // h3 요소가 없으면 건너뛰기
            const h3Element = card.querySelector('h3');
            if (!h3Element) {
                console.warn('⚠️ h3 요소를 찾을 수 없는 카드:', card);
                return;
            }
            
            const productName = h3Element.textContent.toLowerCase();
            const matches = productName.includes(query.toLowerCase());
            
            if (matches || query.length === 0) {
                card.style.display = 'block';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        console.log('✅ 검색 완료:', matchCount + '개 상품 표시');
        
    } catch (error) {
        console.error('❌ 모달 상품 검색 실패:', error);
    }
}

// 모달에서 상품 선택
function selectProductFromModal(productId, productName, price) {
    try {
        console.log('🛍️ 모달에서 상품 선택:', { productId, productName, price });
        
        // 장바구니에 상품 추가
        if (window.addToCart) {
            window.addToCart(productId, productName, price, 1);
        }
        
        // 모달 닫기
        closeProductManagementModal();
        
        console.log('✅ 상품이 장바구니에 추가되었습니다');
        
    } catch (error) {
        console.error('❌ 모달 상품 선택 실패:', error);
    }
}

// 상품 선택 관련 함수들
let selectedProducts = new Map(); // 선택된 상품들을 저장하는 Map

// 상품 선택 토글
function toggleProductSelection(productId, productName, price, shippingOption = '일반배송') {
    try {
        console.log('🛍️ 상품 선택 토글:', { productId, productName, price, shippingOption });
        
        const checkbox = document.getElementById(`product-${productId}`);
        const quantityDiv = document.getElementById(`quantity-${productId}`);
        
        if (checkbox.checked) {
            // 상품 선택
            selectedProducts.set(productId, {
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                shipping_option: shippingOption
            });
            
            // 수량 입력창 표시
            quantityDiv.classList.remove('hidden');
            
            console.log('✅ 상품 선택됨:', productName);
        } else {
            // 상품 선택 해제
            selectedProducts.delete(productId);
            
            // 수량 입력창 숨기기
            quantityDiv.classList.add('hidden');
            
            console.log('❌ 상품 선택 해제됨:', productName);
        }
        
        // 선택된 상품 요약 업데이트
        updateSelectedProductsSummary();
        
    } catch (error) {
        console.error('❌ 상품 선택 토글 실패:', error);
    }
}

// 수량 증가
function increaseQuantity(productId, maxStock) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        const currentQuantity = parseInt(quantityInput.value) || 1;
        const newQuantity = Math.min(currentQuantity + 1, maxStock);
        
        quantityInput.value = newQuantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = newQuantity;
        }
        
        console.log('📈 수량 증가:', productId, newQuantity);
        
    } catch (error) {
        console.error('❌ 수량 증가 실패:', error);
    }
}

// 수량 감소
function decreaseQuantity(productId) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        const currentQuantity = parseInt(quantityInput.value) || 1;
        const newQuantity = Math.max(currentQuantity - 1, 1);
        
        quantityInput.value = newQuantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = newQuantity;
        }
        
        console.log('📉 수량 감소:', productId, newQuantity);
        
    } catch (error) {
        console.error('❌ 수량 감소 실패:', error);
    }
}

// 수량 유효성 검사
function validateQuantity(productId, maxStock) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        let quantity = parseInt(quantityInput.value) || 1;
        
        // 최소값, 최대값 검사
        quantity = Math.max(1, Math.min(quantity, maxStock));
        quantityInput.value = quantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = quantity;
        }
        
        console.log('✅ 수량 유효성 검사 완료:', productId, quantity);
        
    } catch (error) {
        console.error('❌ 수량 유효성 검사 실패:', error);
    }
}

// 선택된 상품 요약 업데이트
function updateSelectedProductsSummary() {
    try {
        const summaryDiv = document.getElementById('selected-products-summary');
        const countSpan = document.getElementById('selected-count');
        
        if (summaryDiv && countSpan) {
            const selectedCount = selectedProducts.size;
            
            if (selectedCount > 0) {
                summaryDiv.classList.remove('hidden');
                countSpan.textContent = selectedCount;
            } else {
                summaryDiv.classList.add('hidden');
            }
        }
        
        console.log('📊 선택된 상품 요약 업데이트:', selectedProducts.size + '개');
        
    } catch (error) {
        console.error('❌ 선택된 상품 요약 업데이트 실패:', error);
    }
}

// 전체 선택 해제
function clearAllSelections() {
    try {
        console.log('🗑️ 전체 선택 해제');
        
        // 모든 체크박스 해제
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 모든 수량 입력창 숨기기
        const quantityDivs = document.querySelectorAll('[id^="quantity-"]');
        quantityDivs.forEach(div => {
            div.classList.add('hidden');
        });
        
        // 선택된 상품 맵 초기화
        selectedProducts.clear();
        
        // 요약 업데이트
        updateSelectedProductsSummary();
        
        console.log('✅ 전체 선택 해제 완료');
        
    } catch (error) {
        console.error('❌ 전체 선택 해제 실패:', error);
    }
}

// 선택된 상품들을 장바구니에 추가
function addSelectedProductsToCart(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('🛒 선택된 상품들을 장바구니에 추가:', selectedProducts.size + '개');
        
        if (selectedProducts.size === 0) {
            alert('선택한 상품이 없습니다.');
            return;
        }
        
        // 각 선택된 상품을 장바구니에 추가
        selectedProducts.forEach((product, productId) => {
            if (window.addToCart) {
                window.addToCart(productId, product.name, product.price, product.quantity, product.shipping_option || '일반배송');
            }
        });
        
        // 모달 닫기 (탭 전환 방지)
        closeProductManagementModal();
        
        // 선택된 상품 초기화
        selectedProducts.clear();
        
        console.log('✅ 선택된 상품들이 장바구니에 추가되었습니다');
        
    } catch (error) {
        console.error('❌ 선택된 상품 장바구니 추가 실패:', error);
    }
}

// 전역 스코프에 함수 등록
window.generateOrderFormHTML = generateOrderFormHTML;
window.initOrderForm = initOrderForm;
window.initShippingFeeFromSettings = initShippingFeeFromSettings;
window.loadShippingMethodsFromSettings = loadShippingMethodsFromSettings;
window.populateOrderStatusSelectFromSettings = populateOrderStatusSelectFromSettings;
window.updateShippingFeeDisplay = updateShippingFeeDisplay;
window.updateShippingMethod = updateShippingMethod;
window.initCustomerSearch = initCustomerSearch;
window.initProductSearchUI = initProductSearchUI;
window.collectOrderFormData = collectOrderFormData;
window.collectCartItems = collectCartItems;
window.showProductManagementModal = showProductManagementModal;
window.closeProductManagementModal = closeProductManagementModal;
window.loadAllProducts = loadAllProducts;
window.searchProductsInModal = searchProductsInModal;
window.selectProductFromModal = selectProductFromModal;
window.updateOrderTotalDisplay = updateOrderTotalDisplay;
window.toggleProductSelection = toggleProductSelection;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.validateQuantity = validateQuantity;
window.clearAllSelections = clearAllSelections;
window.addSelectedProductsToCart = addSelectedProductsToCart;
window.handleOrderSubmit = handleOrderSubmit;

// Supabase 연결 테스트 함수 (내부 전용 — window 미등록)
function testSupabaseConnection() {
    try {
        console.log('🧪 Supabase 연결 테스트 시작');
        console.log('🔍 window.supabaseClient:', !!window.supabaseClient);
        console.log('🔍 window.supabase:', !!window.supabase);
        console.log('🔍 window.SUPABASE_CONFIG:', !!window.SUPABASE_CONFIG);
        
        if (window.supabaseClient) {
            console.log('✅ Supabase 클라이언트 존재');
            return true;
        } else {
            console.error('❌ Supabase 클라이언트 없음');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        return false;
    }
}

// 기존 고객 검색 함수 (이름 첫글자·연락처 뒷자리 포함, 1글자부터 검색)
function searchExistingCustomers(query) {
    try {
        // 최소 레이아웃(order-customer-search) 또는 풀 레이아웃(order-customer-name)에서 검색어 읽기
        const searchInput = document.getElementById('order-customer-search') || document.getElementById('order-customer-name');
        const searchValue = (typeof query !== 'undefined' && query !== null ? String(query) : (searchInput ? searchInput.value : '')).trim();
        if (searchValue.length === 0) {
            const resultsDiv = document.getElementById('customer-search-results');
            if (resultsDiv) resultsDiv.classList.add('hidden');
            return;
        }
        if (!testSupabaseConnection()) return;
        if (!window.supabaseClient) return;
        // 1글자부터 검색 (이름 첫글자·연락처 뒷자리)
        const q = searchValue.replace(/\s/g, '%');
            window.supabaseClient
                .from('farm_customers')
                .select('id, name, phone, address, address_detail, grade')
                .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
                .limit(8)
                .then(({ data, error }) => {
                    console.log('🔍 Supabase 검색 결과:', { data, error });
                    
                    if (error) {
                        console.error('❌ 고객 검색 오류:', error);
                        return;
                    }
                    
                    const resultsDiv = document.getElementById('customer-search-results');
                    console.log('🔍 검색 결과 컨테이너:', resultsDiv);
                    
                    if (!resultsDiv) {
                        console.error('❌ 검색 결과 컨테이너를 찾을 수 없습니다');
                        return;
                    }
                    
                    console.log('🔍 검색 결과 데이터:', data);
                    console.log('🔍 데이터 길이:', data ? data.length : 'null');
                    
                    const rowStyle = `padding:12px;cursor:pointer;border-bottom:1px solid var(--border-light);transition:background .15s;`;
                    if (data && data.length > 0) {
                        console.log('🔍 검색 결과 있음:', data.length, '개');
                        resultsDiv.innerHTML = data.map(customer => {
                            const addr = (customer.address || '').replace(/'/g, "\\'");
                            const addrDetail = (customer.address_detail || '').replace(/'/g, "\\'");
                            const grade = customer.grade || 'GENERAL';
                            return `
                            <div class="search-result-row" style="${rowStyle}"
                                 onclick="selectCustomerFromSearch('${customer.id}', '${(customer.name || '').replace(/'/g, "\\'")}', '${(customer.phone || '').replace(/'/g, "\\'")}', '${addr}', '${grade}', '${addrDetail}')">
                                <div class="flex-between">
                                    <div class="flex-gap-3" style="display:flex;align-items:center;">
                                        <div style="width:32px;height:32px;background:var(--primary-soft,#dcfce7);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                                            <i class="fas fa-user" style="color:var(--primary-accent);font-size:11px;"></i>
                                        </div>
                                        <div>
                                            <div class="txt-body" style="font-weight:500;">${customer.name}</div>
                                            <div class="txt-muted txt-sm tabular-nums">${customer.phone}</div>
                                        </div>
                                    </div>
                                    ${renderGradeBadge(grade)}
                                </div>
                            </div>`;
                        }).join('');
                        resultsDiv.classList.remove('hidden');
                        console.log('✅ 검색 결과 표시 완료');
                    } else {
                        console.log('🔍 검색 결과 없음, 인라인 입력 안내');
                        const safeQuery = (searchValue || '').replace(/'/g, "\\'");
                        resultsDiv.innerHTML = `
                            <div style="${rowStyle}cursor:default;">
                                <div class="txt-body" style="font-weight:500;font-size:12px;margin-bottom:4px;">검색 결과 없음</div>
                                <div class="txt-muted" style="font-size:11px;">아래 고객명·연락처·주소를 직접 입력한 뒤 주문 저장하면 고객이 자동 등록됩니다.</div>
                            </div>
                            <div class="search-result-row" style="${rowStyle}"
                                 onclick="openNewCustomerRegistration('${safeQuery}')">
                                <div class="flex-gap-2" style="display:flex;align-items:center;color:var(--primary-accent);font-size:12px;">
                                    <i class="fas fa-plus"></i>
                                    <span>"${(searchValue || '').replace(/"/g, '&quot;')}" 로 고객 등록 모달 열기</span>
                                </div>
                            </div>
                        `;
                        resultsDiv.classList.remove('hidden');
                    }
                });
    } catch (error) {
        console.error('❌ 고객 검색 실패:', error);
    }
}

// 고객 검색 결과에서 고객 선택 (주소·상세주소 자동 입력, 수정 불가)
function selectCustomerFromSearch(customerId, name, phone, address, grade, addressDetail) {
    try {
        const nameInput = document.getElementById('order-customer-name');
        const phoneInput = document.getElementById('order-customer-phone');
        const addressInput = document.getElementById('order-customer-address');
        const detailInput = document.getElementById('order-customer-address-detail');
        const searchInput = document.getElementById('order-customer-search');
        if (nameInput) { nameInput.value = name || ''; nameInput.readOnly = true; nameInput.classList.add('bg-page'); }
        if (phoneInput) { phoneInput.value = phone || ''; phoneInput.readOnly = true; phoneInput.classList.add('bg-page'); }
        if (addressInput) { addressInput.value = address || ''; addressInput.readOnly = true; addressInput.classList.add('bg-page'); }
        if (detailInput) { detailInput.value = addressDetail || ''; detailInput.readOnly = true; detailInput.classList.add('bg-page'); }
        if (searchInput) { searchInput.value = name || ''; searchInput.blur(); }
        let customerIdInput = document.getElementById('order-customer-id');
        if (!customerIdInput && document.getElementById('order-form')) {
            customerIdInput = document.createElement('input');
            customerIdInput.type = 'hidden';
            customerIdInput.id = 'order-customer-id';
            customerIdInput.name = 'customer_id';
            document.getElementById('order-form').appendChild(customerIdInput);
        }
        if (customerIdInput) customerIdInput.value = customerId || '';
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) resultsDiv.classList.add('hidden');
        // 버튼 활성화: 고객 선택 완료 시 저장 버튼 활성화
        if (window.updateOrderSubmitButtonState) window.updateOrderSubmitButtonState();
    } catch (error) {
        console.error('❌ 고객 선택 처리 실패:', error);
    }
}

// 신규 고객 등록 모달 열기
function openNewCustomerRegistration(customerName) {
    try {
        console.log('🆕 신규 고객 등록 모달 열기:', customerName);
        
        // 고객명을 임시 저장
        window.tempCustomerName = customerName;
        
        // 주문 모달을 일시적으로 숨기기
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.style.display = 'none';
        }
        
        // 고객 등록 모달 열기
        if (window.openCustomerModal) {
            window.openCustomerModal(null, customerName, function(newCustomer) {
                // 고객 등록 완료 후 주문 폼에 정보 입력
                if (newCustomer) {
                    selectCustomerFromSearch(
                        newCustomer.id,
                        newCustomer.name,
                        newCustomer.phone,
                        newCustomer.address,
                        newCustomer.grade || 'GENERAL',
                        newCustomer.address_detail || ''
                    );
                }
                
                // 주문 모달 다시 표시
                if (orderModal) {
                    orderModal.style.display = 'block';
                }
            });
        } else {
            console.error('❌ 고객 등록 모달을 열 수 없습니다');
            alert('고객 등록 기능을 사용할 수 없습니다.');
        }
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ 신규 고객 등록 모달 열기 실패:', error);
    }
}

// 상품 검색 함수 (완전 구현)
function searchProducts(query) {
    try {
        console.log('🔍 상품 검색:', query);

        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트를 찾을 수 없습니다');
            return;
        }

        // 빈 쿼리: 전체 상품 목록 표시 (클릭 시), 아닌 경우 필터 검색
        const dbQuery = window.supabaseClient
            .from('farm_products')
            .select('id, name, price, stock, category, description, image_url');

        const promise = (!query || query.trim().length === 0)
            ? dbQuery.order('name', { ascending: true }).limit(30)
            : dbQuery.or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`).limit(15);

        promise.then(({ data, error }) => {
                    if (error) {
                        console.error('❌ 상품 검색 오류:', error);
                        return;
                    }

                    const resultsDiv = document.getElementById('product-search-results');
                    if (!resultsDiv) return;

                    if (data && data.length > 0) {
                        // v3.4.74: 카테고리 컬럼 제거(가독성), 품절 항목 비활성화 + 시각 회색 처리
                        resultsDiv.innerHTML = data.map(product => {
                            const stockNum = product.stock ?? 0;
                            const isOut = stockNum <= 0;
                            const stockColor = isOut ? 'var(--danger)' : stockNum <= 5 ? 'var(--warn)' : 'var(--primary)';
                            const stockLabel = isOut ? '품절' : `재고 ${stockNum}개`;
                            const safeName = (product.name || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
                            const itemStyle = isOut ? 'opacity:0.55;cursor:not-allowed;background:var(--danger-bg);' : '';
                            const clickAttr = isOut
                                ? `onclick="event.preventDefault();event.stopPropagation();alert('재고가 없는 상품입니다 (품절). 재고를 먼저 보충해주세요.');"`
                                : `onclick="addProductToCart(this.dataset.productId, this.dataset.productName, parseFloat(this.dataset.price), parseFloat(this.dataset.stock), event)"`;
                            return `
                            <div class="search-result-item"
                                 data-product-id="${product.id}"
                                 data-product-name="${safeName}"
                                 data-price="${product.price}"
                                 data-stock="${product.stock ?? 0}"
                                 style="${itemStyle}"
                                 onmousedown="event.preventDefault();"
                                 ${clickAttr}>
                                <span class="search-result-name">${safeName}</span>
                                <span class="search-result-price">${window.fmt.won(product.price)}</span>
                                <span class="search-result-stock" style="color:${stockColor};font-weight:${isOut ? '600' : '500'};">${stockLabel}</span>
                            </div>
                        `}).join('');
                        resultsDiv.classList.remove('hidden');
                    } else {
                        // v3.4.85: 검색어 있는데 결과 없으면 "신규 등록" 버튼 노출 → 주문 등록 중단 없이 바로 추가
                        const safeQuery = (query || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        const queryDisp = (query || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        if (query && query.trim().length > 0) {
                            resultsDiv.innerHTML = `
                                <div class="search-result-empty" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px;">
                                    <div class="text-secondary text-sm">검색 결과가 없습니다</div>
                                    <button type="button" class="btn-primary" style="padding:6px 14px;font-size:13px;"
                                            onmousedown="event.preventDefault();"
                                            onclick="event.preventDefault();event.stopPropagation();window.openQuickAddProductModal && window.openQuickAddProductModal('${safeQuery}');">
                                        <i class="fas fa-plus mr-1"></i>"${queryDisp}" 신규 상품 등록
                                    </button>
                                </div>`;
                        } else {
                            resultsDiv.innerHTML = `<div class="search-result-empty">검색 결과가 없습니다</div>`;
                        }
                        resultsDiv.classList.remove('hidden');
                    }
                });

    } catch (error) {
        console.error('❌ 상품 검색 실패:', error);
    }
}

// v3.4.85+: 주문 등록 중 즉시 신규 상품 등록 모달
function openQuickAddProductModal(initialName) {
    document.getElementById('quick-add-product-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'quick-add-product-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '999999';
    const safeName = String(initialName || '').replace(/"/g, '&quot;');
    modal.innerHTML = `
        <div class="modal-container modal-sm" style="max-width:420px;width:94vw;">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-plus-circle text-brand mr-1"></i>신규 상품 빠른 등록</span>
                <button class="modal-close-btn" onclick="document.getElementById('quick-add-product-modal').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="padding:16px;display:flex;flex-direction:column;gap:10px;">
                <p class="text-xs text-secondary" style="margin:0;">등록 후 자동으로 장바구니에 추가됩니다. 카테고리·상세는 나중에 상품관리에서 수정 가능.</p>
                <div>
                    <label class="form-label">상품명 <span class="req">*</span></label>
                    <input type="text" id="qap-name" class="form-control" value="${safeName}" placeholder="상품명">
                </div>
                <div class="form-grid">
                    <div class="form-col-6">
                        <label class="form-label">판매가 <span class="req">*</span></label>
                        <input type="number" id="qap-price" class="form-control" min="0" step="100" placeholder="0">
                    </div>
                    <div class="form-col-6">
                        <label class="form-label">초기 재고</label>
                        <input type="number" id="qap-stock" class="form-control" min="0" step="1" value="1">
                    </div>
                </div>
                <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-body" title="체크 시 이 상품 포함 주문은 자동으로 배송비 0원">
                    <input type="checkbox" id="qap-free-shipping" class="checkbox-ui">
                    <i class="fas fa-truck text-brand"></i>
                    <span>무료 배송 상품 (배송비 자동 면제)</span>
                </label>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('quick-add-product-modal').remove()">취소</button>
                <button id="qap-save-btn" class="btn-primary"><i class="fas fa-plus mr-1"></i>등록 + 장바구니 추가</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const $ = (id) => document.getElementById(id);
    setTimeout(() => $('qap-price').focus(), 80);

    // Enter 단축키
    [ 'qap-name', 'qap-price', 'qap-stock' ].forEach(id => {
        $(id)?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); $('qap-save-btn').click(); }
        });
    });

    $('qap-save-btn').addEventListener('click', async () => {
        const name = $('qap-name').value.trim();
        const price = parseInt($('qap-price').value, 10);
        const stock = Math.max(0, parseInt($('qap-stock').value, 10) || 0);
        const isFree = $('qap-free-shipping').checked;

        if (!name) { alert('상품명을 입력해주세요.'); $('qap-name').focus(); return; }
        if (!Number.isFinite(price) || price < 0) { alert('판매가를 정확히 입력해주세요.'); $('qap-price').focus(); return; }
        if (!window.supabaseClient) { alert('Supabase 미연결'); return; }

        const btn = $('qap-save-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>등록 중...';

        try {
            // 동일 이름 중복 체크
            const { data: dup } = await window.supabaseClient
                .from('farm_products')
                .select('id, name')
                .eq('name', name)
                .limit(1);
            if (dup && dup.length > 0) {
                if (!confirm(`이미 "${name}" 상품이 존재합니다.\n그래도 새로 등록하시겠습니까?`)) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-plus mr-1"></i>등록 + 장바구니 추가';
                    return;
                }
            }

            const newProduct = {
                id: crypto.randomUUID(),
                name,
                price,
                stock,
                shipping_option: isFree ? '무료배송' : '일반배송',
                status: 'active',
                created_at: new Date().toISOString(),
            };
            const { error } = await window.supabaseClient.from('farm_products').insert(newProduct);
            if (error) throw error;

            // productDataManager 캐시에도 추가 (즉시 검색 가능하게)
            if (window.productDataManager?.farm_products) {
                window.productDataManager.farm_products.push(newProduct);
            }

            // 장바구니 자동 추가 (퀵 경로 우선, 없으면 풀 경로)
            if (document.getElementById('quick-product-buttons') && window.addQuickProductToCart) {
                window.addQuickProductToCart(newProduct.id, name, price, newProduct.shipping_option);
            } else if (window.addProductToCart) {
                window.addProductToCart(newProduct.id, name, price, stock);
            }

            // 검색창 초기화 + 결과 닫기
            const searchInput = document.getElementById('product-search');
            if (searchInput) searchInput.value = '';
            document.getElementById('product-search-results')?.classList.add('hidden');

            modal.remove();
            if (window.showToast) window.showToast(`✅ "${name}" 등록 + 장바구니 추가 완료`, 2000, 'success');

            // 퀵상품 패널 새로고침 (인기상품 재계산)
            if (window.loadQuickProductsForMinimal) {
                try { await window.loadQuickProductsForMinimal(); } catch (_) { /* skip */ }
            }
        } catch (e) {
            console.error('신규 상품 빠른 등록 실패:', e);
            alert('등록 실패: ' + e.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus mr-1"></i>등록 + 장바구니 추가';
        }
    });
}
window.openQuickAddProductModal = openQuickAddProductModal;

// 상품을 장바구니에 추가
function addProductToCart(productId, productName, price, stock, event) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        // v3.4.74: 재고 0 차단 — 사전예약·재입고 사용자는 confirm 으로 우회 가능
        if (stock !== null && stock !== undefined && stock <= 0) {
            const ok = confirm(
                `⚠️ "${productName}" 은(는) 재고가 없습니다 (품절).\n\n` +
                `그래도 장바구니에 추가하시겠습니까?\n` +
                `(사전예약·재입고 후 처리 등 특수한 경우만 추가)`
            );
            if (!ok) {
                console.log(`품절 상품 추가 취소: ${productName}`);
                return;
            }
            console.warn(`⚠️ 사용자 동의 후 품절 상품 추가: ${productName}`);
        }
        // 최소 레이아웃: 2열 장바구니 + 퀵상품 형식으로 추가
        if (document.getElementById('quick-product-buttons') && window.addQuickProductToCart) {
            // shipping_option 은 검색 결과 dataset 또는 productDataManager 캐시에서 추출
            const cached = window.productDataManager?.farm_products?.find(p => p.id === productId);
            const shipOpt = (cached && cached.shipping_option) || '일반배송';
            window.addQuickProductToCart(productId, productName, price, shipOpt);
            const resultsDiv = document.getElementById('product-search-results');
            if (resultsDiv) resultsDiv.classList.add('hidden');
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.value = '';
                // v3.4.86: Enter 로 추가 후 검색창 포커스 복귀 → 다음 상품 즉시 입력 가능
                setTimeout(() => searchInput.focus(), 0);
            }
            if (window.showToast) window.showToast(`+ ${productName}`, 1200, 'success');
            return;
        }
        const cartItemsBody = document.getElementById('cart-items-body');
        if (!cartItemsBody) return;
        const existingRow = cartItemsBody.querySelector(`tr[data-product-id="${productId}"]`);
        if (existingRow) {
            // 수량 증가
            const quantityInput = existingRow.querySelector('.quantity-input');
            if (quantityInput) {
                const currentQuantity = parseInt(quantityInput.value) || 0;
                const newQuantity = Math.min(currentQuantity + 1, stock);
                quantityInput.value = newQuantity;
                updateCartItemTotal(existingRow);
            }
        } else {
            // 새 상품 추가
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-product-id', productId);
            const stepBtn2 = `width:24px;height:24px;border-radius:var(--radius-sm);background:var(--bg-light);border:1px solid var(--border-light);font-size:11px;cursor:pointer;`;
            newRow.innerHTML = `
                <td class="text-center"><input type="checkbox" class="checkbox-ui cart-row-checkbox"></td>
                <td class="td-primary font-medium">${productName}</td>
                <td class="td-amount text-right text-numeric">${window.fmt.won(price)}</td>
                <td class="text-center">
                    <div style="display:inline-flex;align-items:center;gap:4px;">
                        <button type="button" style="${stepBtn2}" onclick="decreaseQuantity('${productId}')">-</button>
                        <input type="number" class="quantity-input form-control" style="width:52px;text-align:center;padding:4px;"
                               value="1" min="1" max="${stock}" onchange="updateCartItemTotal(this.closest('tr'))">
                        <button type="button" style="${stepBtn2}" onclick="increaseQuantity('${productId}')">+</button>
                    </div>
                </td>
                <td class="text-right">
                    <span class="cart-item-total td-amount text-numeric">${window.fmt.won(price)}</span>
                </td>
                <td class="text-center">
                    ${renderBtnIcon({ icon: 'fa-trash', variant: 'delete', title: '삭제', onclick: `removeCartItem('${productId}')` })}
                </td>
            `;

            // 빈 메시지 행 제거 (colspan 5 또는 6 모두 대응)
            const emptyRow = cartItemsBody.querySelector('tr td[colspan="6"], tr td[colspan="5"]');
            if (emptyRow && emptyRow.closest('tr')) {
                emptyRow.closest('tr').remove();
            }
            
            cartItemsBody.appendChild(newRow);
        }
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('product-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
        // 상품 검색 필드 초기화
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 장바구니 총액 업데이트
        updateCartTotal();
        
        console.log('✅ 상품 장바구니 추가 완료');
        
    } catch (error) {
        console.error('❌ 상품 장바구니 추가 실패:', error);
    }
}

// 신규 고객 정보 미완성 시 주문 저장 버튼 비활성화 (customer_id 없으면 이름+연락처 필수)
function updateOrderSubmitButtonState() {
    const btn = document.getElementById('order-submit-btn');
    const smsBtn = document.getElementById('order-save-sms-btn');
    if (!btn) return;
    const customerIdEl = document.getElementById('order-customer-id');
    const nameEl = document.getElementById('order-customer-name');
    const phoneEl = document.getElementById('order-customer-phone');
    const customerId = (customerIdEl && customerIdEl.value) ? String(customerIdEl.value).trim() : '';
    const name = (nameEl && nameEl.value) ? String(nameEl.value).trim() : '';
    const phone = (phoneEl && phoneEl.value) ? String(phoneEl.value).trim() : '';
    const canSave = !!customerId || (!!name && !!phone);
    btn.disabled = !canSave;
    if (smsBtn) smsBtn.disabled = !canSave;
}

// 전역 함수로 등록
window.searchExistingCustomers = searchExistingCustomers;
window.selectCustomerFromSearch = selectCustomerFromSearch;
window.openNewCustomerRegistration = openNewCustomerRegistration;
window.searchProducts = searchProducts;
window.addProductToCart = addProductToCart;
window.handleOrderSubmit = handleOrderSubmit;
window.updateOrderSubmitButtonState = updateOrderSubmitButtonState;

// 주소는 고객 선택 시 자동으로 입력되므로 주소 검색 기능 불필요

// 폼 유효성 검사 및 버튼 활성화 초기화
function initFormValidation() {
    try {
        console.log('🔍 폼 유효성 검사 초기화');
        
        // 필수 필드들
        const requiredFields = [
            'order-customer-name',
            'order-customer-phone', 
            'order-customer-address'
        ];
        
        // 폼 필드 변경 이벤트 리스너 추가
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', validateForm);
                field.addEventListener('change', validateForm);
            }
        });
        
        // 장바구니 변경 이벤트 리스너 추가
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            // MutationObserver로 장바구니 변경 감지
            const observer = new MutationObserver(() => {
                validateForm();
                updateCartTotal(); // 배송비 자동 계산
            });
            observer.observe(cartItems, { childList: true, subtree: true });
        }
        
        // 초기 유효성 검사
        validateForm();
        
        console.log('✅ 폼 유효성 검사 초기화 완료');
        
    } catch (error) {
        console.error('❌ 폼 유효성 검사 초기화 실패:', error);
    }
}

// 폼 유효성 검사 함수
function validateForm() {
    try {
        console.log('🔍 폼 유효성 검사 실행');
        
        // 필수 필드 검사
        const customerName = document.getElementById('order-customer-name')?.value?.trim();
        const customerPhone = document.getElementById('order-customer-phone')?.value?.trim();
        const customerAddress = document.getElementById('order-customer-address')?.value?.trim();
        
        // 장바구니 아이템 검사 - 더 정확한 검사
        const cartItemsBody = document.getElementById('cart-items-body');
        let hasCartItems = false;
        
        if (cartItemsBody) {
            const cartRows = cartItemsBody.querySelectorAll('tr[data-product-id]');
            hasCartItems = cartRows.length > 0;
            
            // 빈 메시지 행이 있는지도 확인 (colspan 5 또는 6)
            const emptyMessage = cartItemsBody.querySelector('tr td[colspan="6"], tr td[colspan="5"]');
            if (emptyMessage) {
                hasCartItems = false;
            }
        }
        
        // 전화번호 형식 검사
        const phonePattern = /^[0-9-+\s()]+$/;
        const isValidPhone = customerPhone && phonePattern.test(customerPhone) && customerPhone.length >= 10;
        
        // 유효성 검사 결과
        const isValid = customerName && isValidPhone && customerAddress && hasCartItems;
        
        console.log('📋 유효성 검사 결과:', {
            customerName: !!customerName,
            customerPhone: !!customerPhone,
            isValidPhone: isValidPhone,
            customerAddress: !!customerAddress,
            hasCartItems: hasCartItems,
            isValid: isValid
        });
        
        // 주문 등록 버튼 활성화/비활성화
        const submitButton = document.querySelector('button[onclick*="handleOrderSubmit"]');
        if (submitButton) {
            if (isValid) {
                submitButton.disabled = false;
                submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
                submitButton.classList.add('hover:bg-blue-700');
            } else {
                submitButton.disabled = true;
                submitButton.classList.add('opacity-50', 'cursor-not-allowed');
                submitButton.classList.remove('hover:bg-blue-700');
            }
        }
        
        // 유효성 검사 실패 시 사용자에게 알림
        if (!isValid) {
            const missingFields = [];
            if (!customerName) missingFields.push('고객명');
            if (!isValidPhone) missingFields.push('올바른 전화번호');
            if (!customerAddress) missingFields.push('주소');
            if (!hasCartItems) missingFields.push('상품');
            
            console.log('⚠️ 누락된 필드:', missingFields);
        }
        
        return isValid;
        
    } catch (error) {
        console.error('❌ 폼 유효성 검사 실패:', error);
        return false;
    }
}

// 주문 폼 제출 이벤트 핸들러 초기화
function initOrderFormSubmit() {
    try {
        console.log('📝 주문 폼 제출 이벤트 핸들러 초기화');
        
        // 주문 등록 버튼은 onclick으로 처리되므로 별도 이벤트 리스너 불필요
        console.log('✅ 주문 등록 버튼은 onclick으로 처리됨');
        
    } catch (error) {
        console.error('❌ 주문 폼 제출 이벤트 핸들러 초기화 실패:', error);
    }
}

// 주문 제출 처리 함수
async function handleOrderSubmit(event) {
    try {
        console.log('📝 주문 제출 처리 시작');
        console.log('🔍 현재 페이지 URL:', window.location.href);
        console.log('🔍 이벤트 객체:', event);
        
        // 이벤트 기본 동작 차단 (페이지 새로고침 방지)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log('🔒 이벤트 기본 동작 차단 완료');
        }
        
        // 폼 유효성 검사
        console.log('🔍 폼 유효성 검사 시작');
        const isValid = validateForm();
        console.log('📋 폼 유효성 검사 결과:', isValid);
        
        if (!isValid) {
            console.warn('⚠️ 폼 유효성 검사 실패');
            const missingFields = [];
            const customerName = document.getElementById('order-customer-name')?.value?.trim();
            const customerPhone = document.getElementById('order-customer-phone')?.value?.trim();
            const customerAddress = document.getElementById('order-customer-address')?.value?.trim();
            const cartItemsBody = document.getElementById('cart-items-body');
            const hasCartItems = cartItemsBody && cartItemsBody.querySelectorAll('tr[data-product-id]').length > 0;
            const phonePattern = /^[0-9-+\s()]+$/;

            if (!customerName) missingFields.push('고객명');
            if (!customerPhone) missingFields.push('전화번호');
            else if (!phonePattern.test(customerPhone) || customerPhone.replace(/\D/g, '').length < 10) missingFields.push('전화번호 형식 (10자리 이상)');
            if (!customerAddress) missingFields.push('주소');
            if (!hasCartItems) missingFields.push('상품 (장바구니가 비어있음)');

            console.log('❌ 누락된 필드:', missingFields);
            alert(`다음 항목을 확인해주세요:\n\n${missingFields.map(f => '• ' + f).join('\n')}`);
            return false; // 명시적으로 false 반환
        }
        
        console.log('✅ 폼 유효성 검사 통과');
        
        // 주문 데이터 수집
        console.log('📦 주문 데이터 수집 시작');
        const orderData = await collectOrderFormData();
        console.log('📦 수집된 주문 데이터:', orderData);
        
        if (!orderData) {
            console.error('❌ 주문 데이터 수집 실패');
            alert('주문 데이터를 수집하는 중 오류가 발생했습니다.');
            return false;
        }
        
        // 아이템 데이터 검증
        if (!orderData.items || orderData.items.length === 0) {
            console.warn('⚠️ 장바구니에 상품이 없습니다');
            alert('장바구니에 상품을 추가해주세요.');
            return false;
        }
        
        // 금액 검증 추가
        const totalAmount = calculateTotalAmount(orderData);
        console.log('💰 계산된 총 금액:', totalAmount);
        
        if (totalAmount <= 0) {
            console.error('❌ 주문 금액이 0원입니다. 상품 가격을 확인해주세요.');
            alert('주문 금액이 0원입니다. 상품 가격을 확인해주세요.');
            return false;
        }
        
        console.log('✅ 주문 데이터 수집 및 검증 완료');
        
        // 수정 모드인지 확인
        const isEditMode = window.currentEditingOrderId !== null && window.currentEditingOrderId !== undefined;
        console.log('🔍 주문 처리 모드:', isEditMode ? '수정' : '등록');

        // Fix #4: 수정 모드 재고 조정을 위해 저장 전에 기존 아이템 미리 조회
        let oldOrderItems = [];
        if (isEditMode && window.currentEditingOrderId && window.supabaseClient) {
            try {
                const { data: existingItems } = await window.supabaseClient
                    .from('farm_order_items')
                    .select('product_id, product_name, quantity')
                    .eq('order_id', window.currentEditingOrderId);
                oldOrderItems = existingItems || [];
                console.log(`📦 수정 전 기존 아이템 ${oldOrderItems.length}개 조회 완료`);
            } catch (e) {
                console.warn('⚠️ 기존 아이템 조회 실패 (재고 조정 불가):', e);
            }
        }

        let supabaseOrderData;
        
        // 데이터 단일화: 품목은 farm_order_items만 SSOT. 트랜잭션 RPC 우선 사용.
        const itemsPayload = orderData.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || '상품명 없음',
            quantity: Math.max(1, toIntegerWon(item.quantity)),
            price: toIntegerWon(item.price),
            total: toIntegerWon(item.total),
            size: item.size || null
        }));
        
        console.log('🔍 Supabase 클라이언트 확인...');
        if (!window.supabaseClient) {
            if (window.initializeSupabaseClient) {
                const initialized = window.initializeSupabaseClient();
                if (!initialized) throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
            } else {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }
        }
        
        let data = [];
        let orderId = null;
        
        // 단일 트랜잭션 RPC만 사용. 부분 저장 금지 — 실패 시 재시도/에러만.
        const rpcResult = await window.supabaseClient.rpc('upsert_order_with_items', {
            p_order_id: isEditMode ? window.currentEditingOrderId : null,
            p_order_number: isEditMode ? null : (() => {
                const d = new Date();
                const yy = String(d.getFullYear()).slice(2);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
                return `ORD-${yy}${mm}${dd}-${rand}`;
            })(),
            p_order_date: isEditMode ? null : new Date().toISOString(),
            p_customer_id: orderData.customer_id || null,
            p_customer_name: orderData.customer_name || '',
            p_customer_phone: orderData.customer_phone || '',
            p_customer_address: orderData.customer_address || '',
            p_customer_address_detail: orderData.customer_address_detail || null,
            p_order_status: orderData.order_status || '주문접수',
            p_order_channel: orderData.order_channel || '',
            p_memo: orderData.memo || '',
            p_shipping_fee: toIntegerWon(orderData.shipping_fee),
            p_discount_amount: toIntegerWon(orderData.discount_amount),
            p_items: itemsPayload
        });
        if (rpcResult.error) throw new Error(rpcResult.error.message || '주문 저장 실패');
        const payload = rpcResult.data;
        if (!payload || !payload.success || !payload.id) throw new Error('RPC 반환 데이터 없음');
        orderId = payload.id;
        data = [{ id: orderId }];
        console.log('✅ upsert_order_with_items 성공:', orderId, payload.order_row ? '(order_row 반환)' : '');
        if (payload.order_row && window.orderDataManager) {
            try {
                const list = Array.isArray(window.orderDataManager.farm_order_rows) ? window.orderDataManager.farm_order_rows : [];
                const idx = list.findIndex((r) => r.order_id === orderId);
                const row = { ...payload.order_row, order_id: orderId };
                if (idx >= 0) list[idx] = row; else list.unshift(row);
                window.orderDataManager.farm_order_rows = list;
                window.orderDataManager._lastCountRows = window.orderDataManager._computeCountsFromOrderRows(list);
                window.orderDataManager.updateFilterCountsFromRpc(window.orderDataManager._lastCountRows);
            } catch (e) { console.warn('주문 목록 반영 실패:', e?.message); }
        }
        try {
            const { data: validateData } = await window.supabaseClient.rpc('validate_order_total_amount', { p_order_id: orderId });
            if (validateData && !validateData.ok) console.warn('⚠️ 주문 저장 정합성 불일치:', validateData);
        } catch (_) { /* optional */ }

        const savedOrder = data[0] || { id: orderId };
        orderId = savedOrder.id;
        
        // 재고 처리 (신규: 차감 / 수정: 기존 복원 후 신규 차감)
        if (orderId) {
            console.log('📦 재고 처리 시작...');
            try {
                if (!isEditMode) {
                    // 신규 주문: 재고 차감
                    for (const item of orderData.items) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock, name').eq('id', item.product_id).single();
                        if (!p) continue;
                        const newStock = Math.max(0, (p.stock ?? 0) - item.quantity);
                        await window.supabaseClient.from('farm_products').update({ stock: newStock }).eq('id', item.product_id);
                        console.log(`✅ 신규 재고 차감 ${item.product_name}: ${p.stock}개 → ${newStock}개`);
                    }
                } else if (oldOrderItems.length > 0) {
                    // Fix #4: 수정 주문: 기존 아이템 재고 복원 → 신규 아이템 재고 차감
                    for (const item of oldOrderItems) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock').eq('id', item.product_id).single();
                        if (!p) continue;
                        await window.supabaseClient.from('farm_products').update({ stock: (p.stock || 0) + item.quantity }).eq('id', item.product_id);
                        console.log(`✅ 수정 재고 복원 ${item.product_name}: +${item.quantity}개`);
                    }
                    for (const item of orderData.items) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock').eq('id', item.product_id).single();
                        if (!p) continue;
                        const newStock = Math.max(0, (p.stock || 0) - item.quantity);
                        await window.supabaseClient.from('farm_products').update({ stock: newStock }).eq('id', item.product_id);
                        console.log(`✅ 수정 재고 차감 ${item.product_name}: ${p.stock}개 → ${newStock}개`);
                    }
                }
            } catch (stockError) {
                console.error('❌ 재고 처리 중 오류:', stockError);
            }
        }
        
        // 🔥 고객 등급 자동 업데이트 (주문 완료 시)
        if (!isEditMode && orderData.customer_phone) {
            console.log('📊 고객 등급 자동 업데이트 시작...');
            try {
                if (window.updateCustomerGradeAfterOrder) {
                    await window.updateCustomerGradeAfterOrder(orderData.customer_phone, calculateTotalAmount(orderData));
                    console.log('✅ 고객 등급 자동 업데이트 완료');
                } else {
                    console.warn('⚠️ updateCustomerGradeAfterOrder 함수를 찾을 수 없습니다');
                }
            } catch (gradeError) {
                console.error('❌ 고객 등급 업데이트 실패:', gradeError);
                // 등급 업데이트 실패해도 주문은 완료된 상태이므로 계속 진행
            }
        }
        
        // ── 추가 배송지: 같은 상품으로 주문 자동 분리 생성 ──
        let extraCreatedCount = 0;
        if (!isEditMode) {
            const extraShippings = collectExtraShippingAddresses();
            for (const extra of extraShippings) {
                try {
                    const extraNum = (() => {
                        const d = new Date();
                        const yy = String(d.getFullYear()).slice(2);
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        return `ORD-${yy}${mm}${dd}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
                    })();
                    const extraRpc = await window.supabaseClient.rpc('upsert_order_with_items', {
                        p_order_id: null,
                        p_order_number: extraNum,
                        p_order_date: new Date().toISOString(),
                        p_customer_id: orderData.customer_id || null,
                        p_customer_name: extra.customer_name || orderData.customer_name,
                        p_customer_phone: extra.customer_phone || orderData.customer_phone,
                        p_customer_address: extra.customer_address || '',
                        p_customer_address_detail: extra.customer_address_detail || null,
                        p_order_status: orderData.order_status || '주문접수',
                        p_order_channel: orderData.order_channel || '',
                        p_memo: extra.memo || orderData.memo || '',
                        p_shipping_fee: toIntegerWon(orderData.shipping_fee),
                        p_discount_amount: toIntegerWon(orderData.discount_amount),
                        p_items: itemsPayload
                    });
                    if (extraRpc.error) {
                        console.error('❌ 추가 배송지 주문 생성 실패:', extraRpc.error);
                        continue;
                    }
                    extraCreatedCount++;
                    // 추가 배송지 분 재고도 차감
                    for (const item of orderData.items) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock').eq('id', item.product_id).single();
                        if (!p) continue;
                        await window.supabaseClient.from('farm_products').update({ stock: Math.max(0, (p.stock ?? 0) - item.quantity) }).eq('id', item.product_id);
                    }
                } catch (extraErr) {
                    console.error('❌ 추가 배송지 처리 오류:', extraErr);
                }
            }
        }

        // 성공 메시지 표시 — blocking alert 대신 자동 사라지는 토스트로 UX 개선
        const successMsg = extraCreatedCount > 0
            ? `✅ 주문 등록 완료 (추가 배송지 ${extraCreatedCount}건 포함 → 총 ${1 + extraCreatedCount}건)`
            : `✅ 주문이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다`;
        if (typeof window.showToast === 'function') {
            window.showToast(successMsg, 2500);
        } else {
            console.log(successMsg);
        }

        // 주문 모달 닫기
        if (window.closeOrderModal) {
            window.closeOrderModal();
        }

        // 주문 폼 초기화
        console.log('🔄 주문 폼 초기화...');
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.reset();
            console.log('✅ 주문 폼 초기화 완료');
        }

        // 추가 배송지 초기화
        if (window.resetExtraShipping) resetExtraShipping();

        // 장바구니 초기화
        const cartItems = document.getElementById('cart-items-body');
        if (cartItems) {
            cartItems.innerHTML = '';
            console.log('✅ 장바구니 초기화 완료');
        }
        
        // 저장된 주문 상태에 맞는 탭으로 이동 + 데이터 새로고침
        const savedOrderStatus = orderData.order_status || '주문접수';

        // 이미 주문관리 탭에 있으면 전체 탭 리로드(HTML 재fetch) 불필요 —
        // 데이터만 새로고침하고 상태 탭만 전환 (navBtn.click() 로 인한 section
        // HTML 재생성 중 '새 주문' 버튼이 DOM 에서 잠시 사라져 첫 클릭 무효화되던 근본 원인 제거)
        const ordersSection = document.getElementById('orders-section');
        const alreadyOnOrders = ordersSection && !ordersSection.classList.contains('hidden');

        if (alreadyOnOrders) {
            try {
                if (window.orderDataManager) {
                    await window.orderDataManager.loadOrders();
                    if (typeof window.orderDataManager.renderOrdersTable === 'function') {
                        window.orderDataManager.renderOrdersTable(isEditMode ? 'all' : savedOrderStatus);
                    }
                }
                // 상태 탭 활성화 (수정 모드는 전체)
                const targetTabId = isEditMode ? 'status-all' : ('status-' + savedOrderStatus);
                document.querySelectorAll('.status-tab-btn').forEach(t => t.classList.remove('active'));
                const tabBtn = document.getElementById(targetTabId) || document.getElementById('status-all');
                if (tabBtn) tabBtn.classList.add('active');
            } catch (refreshErr) {
                console.warn('⚠️ 주문 목록 경량 새로고침 실패, 폴백 진행:', refreshErr);
            }
        } else {
            // 다른 탭에서 저장한 경우에만 탭 전환 (이 경우에만 전체 리로드 허용)
            window._pendingOrderStatus = isEditMode ? null : savedOrderStatus;
            const navBtn = document.getElementById('nav-orders');
            if (navBtn) navBtn.click();
        }
        
        console.log('✅ 주문 제출 처리 완료 - 함수 종료');
        return true; // 성공 시 true 반환
        
    } catch (error) {
        console.error('❌ 주문 제출 처리 실패:', error);
        console.error('❌ 에러 스택:', error.stack);
        alert(`주문 등록 중 오류가 발생했습니다: ${error.message}`);
        return false; // 실패 시 false 반환
    }
}

// 전화번호 숫자만 정규화 (중복 조회/UNIQUE용)
function normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
}

// 폴백용: customer_id 없을 때 phone_normalized로 조회 후 없으면 신규 생성. 카운트는 0 (입금확인 시 트리거만).
async function ensureCustomerFromOrderData(orderData) {
    if (!window.supabaseClient || !orderData.customer_name || !orderData.customer_phone) return null;
    const name = String(orderData.customer_name || '').trim();
    const phone = String(orderData.customer_phone || '').trim();
    if (!name || !phone) return null;
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm) return null;
    try {
        const { data: existing } = await window.supabaseClient
            .from('farm_customers')
            .select('id')
            .eq('phone_normalized', phoneNorm)
            .maybeSingle();
        if (existing && existing.id) {
            console.log('📌 phone_normalized 기존 고객 연결:', existing.id);
            return existing.id;
        }
        // Fix #3: orderData에서는 customer_address_base로 구분하지만
        // farm_customers 테이블의 실제 컬럼명은 'address' — DB 저장 시 매핑
        const insertRow = {
            name,
            phone,
            address: orderData.customer_address_base != null ? orderData.customer_address_base : (orderData.customer_address || ''),
            address_detail: orderData.customer_address_detail || null,
            grade: 'BRONZE'
            // Fix #9: youtube_order_count / live_order_count 컬럼은 farm_customers 테이블에 없으므로 제거
        };
        const { data: inserted, error } = await window.supabaseClient
            .from('farm_customers')
            .insert([insertRow])
            .select('id')
            .single();
        if (error) {
            if (error.code === '23505') {
                const { data: byNorm } = await window.supabaseClient.from('farm_customers').select('id').eq('phone_normalized', phoneNorm).maybeSingle();
                if (byNorm && byNorm.id) return byNorm.id;
            }
            console.error('❌ 고객 자동 생성 실패:', error);
            return null;
        }
        if (inserted && inserted.id) {
            console.log('✅ 신규 고객 생성(카운트 0):', inserted.id);
            return inserted.id;
        }
        return null;
    } catch (e) {
        console.error('❌ ensureCustomerFromOrderData 실패:', e);
        return null;
    }
}

// 총 주문 금액 계산 (원 단위 정수, total_amount = max(0, items_subtotal + shipping_fee - discount_amount))
function calculateTotalAmount(orderData) {
    try {
        let itemsSubtotal = 0;
        orderData.items.forEach(item => {
            itemsSubtotal += toIntegerWon(item.total);
        });
        const shippingFee = toIntegerWon(orderData.shipping_fee);
        const discountAmount = toIntegerWon(orderData.discount_amount);
        return Math.max(0, itemsSubtotal + shippingFee - discountAmount);
    } catch (error) {
        console.error('❌ 총 주문 금액 계산 실패:', error);
        return 0;
    }
}

// 장바구니 관련 함수들 추가
window.addToCart = function(productId, productName, price, quantity = 1, shippingOption = '일반배송') {
    try {
        const unitPrice = Math.max(0, toIntegerWon(price));
        const qty = Math.max(1, toIntegerWon(quantity));
        console.log('🛒 장바구니에 상품 추가:', { productId, productName, unitPrice, qty, shippingOption });
        
        const cartItemsBody = document.getElementById('cart-items-body');
        if (!cartItemsBody) {
            console.error('❌ 장바구니 테이블 바디를 찾을 수 없습니다');
            return;
        }
        
        // 빈 메시지 제거 (colspan="5" 또는 "6" 모두 대응 — 과거 호환)
        const emptyMessage = cartItemsBody.querySelector('tr td[colspan="6"], tr td[colspan="5"]');
        if (emptyMessage) emptyMessage.closest('tr')?.remove();

        const row = document.createElement('tr');
        row.setAttribute('data-product-id', productId);
        row.setAttribute('data-product-name', productName || '');
        row.setAttribute('data-unit-price', unitPrice);
        row.setAttribute('data-price', unitPrice);
        row.setAttribute('data-shipping-option', shippingOption);
        const subtotal = unitPrice * qty;
        row.innerHTML = `
            <td class="text-center"><input type="checkbox" class="checkbox-ui cart-row-checkbox"></td>
            <td class="td-primary">${(productName || '').replace(/</g, '&lt;')}</td>
            <td class="td-amount text-right text-numeric">${window.fmt.won(unitPrice)}</td>
            <td class="text-center">
                <input type="number" class="quantity-input form-control" style="width:52px;text-align:center;padding:4px;"
                       value="${qty}" min="1" step="1"
                       oninput="window.normalizeQuantityInput(this); updateCartTotal()" onchange="updateCartTotal()">
            </td>
            <td class="cart-line-total td-amount text-right text-numeric">${window.fmt.won(subtotal)}</td>
            <td class="text-center">
                ${renderBtnIcon({ icon: 'fa-trash', variant: 'delete', title: '삭제', onclick: 'removeFromCart(this)' })}
            </td>
        `;
        
        cartItemsBody.appendChild(row);
        
        // 총액 업데이트
        if (window.updateCartTotal) {
            window.updateCartTotal();
        } else if (window.updateOrderTotalDisplay) {
            window.updateOrderTotalDisplay();
        }
        
        console.log('✅ 장바구니에 상품 추가 완료');
        
    } catch (error) {
        console.error('❌ 장바구니 상품 추가 실패:', error);
    }
};

window.removeFromCart = function(buttonOrProductId) {
    try {
        let row;
        
        // buttonOrProductId가 문자열(productId)인지 DOM 요소(button)인지 확인
        if (typeof buttonOrProductId === 'string') {
            // productId로 상품 찾기
            row = document.querySelector(`tr[data-product-id="${buttonOrProductId}"]`);
        } else if (buttonOrProductId && typeof buttonOrProductId.closest === 'function') {
            // button 요소인 경우
            row = buttonOrProductId.closest('tr');
        } else {
            console.error('❌ 잘못된 매개변수 타입:', typeof buttonOrProductId);
            return;
        }
        
        if (row) {
            row.remove();
            
            // 장바구니가 비어있으면 빈 메시지 표시
            const cartItemsBody = document.getElementById('cart-items-body');
            if (cartItemsBody && cartItemsBody.children.length === 0) {
                cartItemsBody.innerHTML = renderEmptyRow(6, '장바구니가 비어있습니다');
            }
            
            // 총액 업데이트
            if (window.updateCartTotal) {
                window.updateCartTotal();
            } else if (window.updateOrderTotalDisplay) {
                window.updateOrderTotalDisplay();
            }
            
            console.log('✅ 장바구니에서 상품 제거 완료');
        } else {
            console.warn('⚠️ 제거할 상품을 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 장바구니 상품 제거 실패:', error);
    }
};

window.updateCartTotal = async function() {
    try {
        const cartItems = document.querySelectorAll('#cart-items-body tr[data-product-id]');
        let itemsSubtotal = 0;

        cartItems.forEach((item) => {
            const quantityInput = item.querySelector('.quantity-input');
            const quantity = Math.max(1, toIntegerWon(quantityInput?.value));
            if (quantityInput && String(quantityInput.value) !== String(quantity)) quantityInput.value = quantity;

            const unitPrice = toIntegerWon(item.getAttribute('data-unit-price') || item.getAttribute('data-price'));
            const subtotal = unitPrice * quantity;
            itemsSubtotal += subtotal;

            const lineTotalCell = item.querySelector('.cart-line-total');
            if (lineTotalCell) lineTotalCell.textContent = window.fmt.won(subtotal);
        });

        // 배송비: 입력란 값만 사용. 사용자가 수정 안 했을 때만 환경설정 제안 + 도서산간 체크 시 추가금
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
        const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
        const remoteFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.remoteAreaShippingFee) || 0;
        const remoteChecked = document.getElementById('remote-area-shipping-checkbox')?.checked === true;
        const remoteSurcharge = remoteChecked ? Math.max(0, toIntegerWon(remoteFee)) : 0;
        let shippingFee;
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            const baseFee = itemsSubtotal >= freeThreshold ? 0 : Math.max(0, toIntegerWon(defaultFee));
            const suggested = baseFee + remoteSurcharge;
            shippingFeeInput.value = suggested;
            shippingFee = suggested;
        } else {
            shippingFee = shippingFeeInput ? Math.max(0, toIntegerWon(shippingFeeInput.value)) : 0;
        }

        // 할인: 입력란 값만 사용(자동 덮어쓰기 금지). 원 단위 정수로만 정규화
        const discountInput = document.getElementById('discount-amount');
        const discountAmount = Math.max(0, toIntegerWon(discountInput?.value));
        if (discountInput && String(discountInput.value) !== String(discountAmount)) discountInput.value = discountAmount;

        const totalAmount = Math.max(0, itemsSubtotal + shippingFee - discountAmount);
        const rawTotal = itemsSubtotal + shippingFee - discountAmount;

        const productTotalElement = document.getElementById('product-total-amount');
        const shippingTotalElement = document.getElementById('shipping-total-amount');
        const discountTotalElement = document.getElementById('discount-total-amount');
        const finalTotalElement = document.getElementById('final-total-amount');
        const zeroWarning = document.getElementById('order-total-zero-warning');

        if (productTotalElement) productTotalElement.textContent = window.fmt.won(itemsSubtotal);
        if (shippingTotalElement) shippingTotalElement.textContent = window.fmt.won(shippingFee);
        if (discountTotalElement) discountTotalElement.textContent = window.fmt.won(-discountAmount);
        if (finalTotalElement) finalTotalElement.textContent = window.fmt.won(totalAmount);
        if (zeroWarning) zeroWarning.classList.toggle('hidden', rawTotal >= 0);

        const totalSummary = document.getElementById('order-total-summary');
        if (totalSummary) {
            if (itemsSubtotal > 0) totalSummary.classList.remove('hidden');
            else totalSummary.classList.add('hidden');
        }
    } catch (error) {
        console.error('❌ 장바구니 총액 업데이트 실패:', error);
    }
};

// 전역 함수로 등록
window.toIntegerWon = toIntegerWon;
window.normalizeIntegerInput = normalizeIntegerInput;
window.normalizeQuantityInput = normalizeQuantityInput;
window.initFormValidation = initFormValidation;
window.validateForm = validateForm;
window.initOrderFormSubmit = initOrderFormSubmit;
window.updateShippingFeeDisplay = updateShippingFeeDisplay;
window.initOrderChannelFromSettings = initOrderChannelFromSettings;

// ─────────────────────────────────────────────
// 다중 배송지 (추가 배송지) 관리
// 배송지 추가 버튼 → 별도 주문 자동 생성
// ─────────────────────────────────────────────
window._extraShippingCount = 0;

function addExtraShipping() {
    _preloadDaumPostcode(); // 버튼 클릭 시 미리 로드 → 이후 Enter 시 동기 호출 가능
    window._extraShippingCount = (window._extraShippingCount || 0) + 1;
    const idx = window._extraShippingCount;
    const container = document.getElementById('extra-shipping-list');
    if (!container) return;

    const row = document.createElement('div');
    row.id = `extra-shipping-row-${idx}`;
    row.className = 'extra-shipping-row';
    row.style.cssText = `margin-top:8px;padding:12px;background:var(--primary-soft,#dcfce7);border:1px solid var(--primary-accent-light,#86efac);border-radius:var(--radius-lg);`;
    row.innerHTML = `
        <div class="flex-between" style="margin-bottom:8px;">
            <span class="txt-body" style="font-size:12px;font-weight:600;color:var(--primary-accent-dark,#166534);">
                <i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>추가 배송지
            </span>
            <button type="button" class="btn-text" style="color:var(--danger);font-size:12px;" onclick="removeExtraShipping(${idx})">
                <i class="fas fa-times"></i> 삭제
            </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <input type="text" id="es-name-${idx}" class="form-control" placeholder="수령인명 *">
            <input type="tel" id="es-phone-${idx}" class="form-control tabular-nums" placeholder="연락처">
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
            <input type="text" id="es-address-${idx}" class="form-control" style="flex:1;" placeholder="기본주소 *">
            <button type="button" class="btn-secondary" style="white-space:nowrap;" onclick="openExtraShippingAddressSearch(${idx})">
                <i class="fas fa-search"></i> 검색
            </button>
        </div>
        <div style="margin-bottom:8px;">
            <input type="text" id="es-detail-${idx}" class="form-control" placeholder="상세주소 (동/호수 등)">
        </div>
        <textarea id="es-memo-${idx}" rows="2" class="form-control xf-memo" placeholder="배송 메모 (선택)"></textarea>
    `;
    container.appendChild(row);
    _updateExtraShippingBadge();
    document.getElementById(`es-name-${idx}`)?.focus();
}

function removeExtraShipping(idx) {
    document.getElementById(`extra-shipping-row-${idx}`)?.remove();
    _updateExtraShippingBadge();
}

function _updateExtraShippingBadge() {
    const list = document.getElementById('extra-shipping-list');
    const count = list ? list.children.length : 0;
    const badge = document.getElementById('extra-shipping-badge');
    if (!badge) return;
    if (count > 0) {
        badge.outerHTML = `<span id="extra-shipping-badge" style="margin-left:4px;">${renderBadge(`+${count}개`, 'success')}</span>`;
    } else {
        badge.textContent = '';
        badge.className = 'hidden';
    }
}

function collectExtraShippingAddresses() {
    const list = document.getElementById('extra-shipping-list');
    if (!list || list.children.length === 0) return [];
    const result = [];
    for (const row of list.querySelectorAll('[id^="extra-shipping-row-"]')) {
        const idx = row.id.replace('extra-shipping-row-', '');
        const name    = document.getElementById(`es-name-${idx}`)?.value?.trim() || '';
        const phone   = document.getElementById(`es-phone-${idx}`)?.value?.trim() || '';
        const address = document.getElementById(`es-address-${idx}`)?.value?.trim() || '';
        const detail  = document.getElementById(`es-detail-${idx}`)?.value?.trim() || '';
        const memo    = document.getElementById(`es-memo-${idx}`)?.value?.trim() || '';
        if (!name && !address) continue;
        result.push({
            customer_name: name,
            customer_phone: phone,
            customer_address: address + (detail ? ' ' + detail : ''),
            customer_address_detail: detail || null,
            memo
        });
    }
    return result;
}

function resetExtraShipping() {
    const list = document.getElementById('extra-shipping-list');
    if (list) list.innerHTML = '';
    window._extraShippingCount = 0;
    _updateExtraShippingBadge();
}

// 카카오 주소 검색 — embed 오버레이 공통 헬퍼
function _openPostcodeOverlay(query, onComplete) {
    if (typeof daum === 'undefined' || !daum.Postcode) {
        alert('주소 검색 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        _preloadDaumPostcode();
        return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.5)',
        'z-index:99999', 'display:flex', 'align-items:center', 'justify-content:center'
    ].join(';');

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:500px;height:550px;background:#fff;border-radius:var(--radius-lg);overflow:hidden;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = [
        'position:absolute', 'top:6px', 'right:8px', 'z-index:1',
        'background:none', 'border:none', 'font-size:18px', 'cursor:pointer', 'color:#555'
    ].join(';');
    const remove = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); };
    closeBtn.onclick = remove;
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) remove(); });

    wrap.appendChild(closeBtn);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);

    new daum.Postcode({
        q: query,
        oncomplete: function(data) {
            remove();
            onComplete(data);
        },
        onclose: remove
    }).embed(wrap);
}

// 메인 주소 필드용 Daum 주소 검색
function openMainAddressSearch() {
    const currentInput = document.getElementById('order-customer-address')?.value?.trim() || '';
    _openPostcodeOverlay(currentInput, function(data) {
        const addr = data.roadAddress || data.jibunAddress || '';
        const addrField = document.getElementById('order-customer-address');
        const detailField = document.getElementById('order-customer-address-detail');
        if (addrField) {
            addrField.removeAttribute('readonly');
            addrField.value = addr;
            addrField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (detailField) detailField.focus();
    });
}
window.openMainAddressSearch = openMainAddressSearch;

// Daum 우편번호 스크립트 미리 로드 (팝업 차단 방지용 — 비동기 로드 후 open() 하면 차단됨)
function _preloadDaumPostcode() {
    if (typeof daum !== 'undefined' && daum.Postcode) return; // 이미 로드됨
    if (document.querySelector('script[src*="postcode"]')) return; // 로드 중
    const s = document.createElement('script');
    s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(s);
}

// 추가 배송지용 Daum 주소 검색
function openExtraShippingAddressSearch(idx) {
    const currentInput = document.getElementById(`es-address-${idx}`)?.value?.trim() || '';
    _openPostcodeOverlay(currentInput, function(data) {
        const addr = data.roadAddress || data.jibunAddress || '';
        const addrField = document.getElementById(`es-address-${idx}`);
        const detailField = document.getElementById(`es-detail-${idx}`);
        if (addrField) {
            addrField.value = addr;
            addrField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (detailField) detailField.focus();
    });
}

window.addExtraShipping    = addExtraShipping;
window.removeExtraShipping = removeExtraShipping;
window.resetExtraShipping  = resetExtraShipping;
window.openExtraShippingAddressSearch = openExtraShippingAddressSearch;
window._preloadDaumPostcode = _preloadDaumPostcode;

// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 문자 붙여넣기 → 주문 폼 자동 입력
// ─────────────────────────────────────────────

/**
 * SMS / 카톡 메시지를 파싱하여 고객명, 전화번호, 주소를 추출한다.
 * 다양한 형식을 지원:
 *   - 라벨형: "이름: 홍길동", "연락처: 010-1234-5678", "주소: ..."
 *   - 줄별 나열: 첫 줄 이름, 둘째 줄 전화, 셋째 줄 주소
 *   - 혼합: 아무 순서로 이름/전화/주소가 섞여 있어도 패턴으로 추출
 */
function parseSmsText(text) {
    if (!text || !text.trim()) return null;

    const lines = text.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
    let name = '';
    let phone = '';
    let address = '';
    let addressDetail = '';
    let memo = '';
    const usedLines = new Set();

    // ── 1단계: 라벨 기반 추출 ("이름:", "연락처:", "주소:" 등) ──
    const labelPatterns = [
        { field: 'name',    re: /(?:이름|성함|고객명|받는\s*분|수령인|수취인)\s*[:：]\s*(.+)/i },
        { field: 'phone',   re: /(?:전화|연락처|휴대폰|핸드폰|번호|폰)\s*[:：]\s*(.+)/i },
        { field: 'address', re: /(?:주소|배송지|배송\s*주소)\s*[:：]\s*(.+)/i },
        { field: 'detail',  re: /(?:상세\s*주소|상세)\s*[:：]\s*(.+)/i },
        { field: 'memo',    re: /(?:메모|요청\s*사항|배송\s*메모|비고)\s*[:：]\s*(.+)/i },
    ];

    for (let i = 0; i < lines.length; i++) {
        for (const { field, re } of labelPatterns) {
            const m = lines[i].match(re);
            if (m) {
                const val = m[1].trim();
                if (field === 'name' && !name) { name = val; usedLines.add(i); }
                else if (field === 'phone' && !phone) { phone = val.replace(/[^0-9]/g, ''); usedLines.add(i); }
                else if (field === 'address' && !address) { address = val; usedLines.add(i); }
                else if (field === 'detail' && !addressDetail) { addressDetail = val; usedLines.add(i); }
                else if (field === 'memo' && !memo) { memo = val; usedLines.add(i); }
            }
        }
    }

    // ── 2단계: 패턴 기반 추출 (라벨 없는 경우) ──
    // 전화번호: 공백·하이픈·점 구분자 모두 허용
    //   • 모바일: 010-4338-8929, 010 4338 8929, 01043388929
    //   • 서울 02: 02-1234-5678, 02-123-4567 (지역번호 2자리)
    //   • 지방 0XX: 042-1234-5678, 053-123-4567 (지역번호 3자리, 031~064 등)
    const phoneRe = /(0\d{1,2})[\s.\-]?(\d{3,4})[\s.\-]?(\d{4})/;
    const addrRe = /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)|(?:[\uAC00-\uD7A3]+(?:시|도|군|구|읍|면|동|리|로|길)[\s\d])/;

    for (let i = 0; i < lines.length; i++) {
        if (usedLines.has(i)) continue;
        const line = lines[i];

        // 전화번호 추출
        if (!phone) {
            const pm = line.match(phoneRe);
            if (pm) {
                phone = pm[1] + pm[2] + pm[3]; // 숫자만 합치기
                // 전화번호를 제거한 나머지 분석
                const remainder = line.replace(pm[0], '').trim();
                if (remainder) {
                    // 나머지가 한글 이름이면 이름으로
                    if (/^[가-힣]{2,5}$/.test(remainder) && !name) {
                        name = remainder;
                    }
                    // 나머지가 주소 패턴이면 주소로
                    else if (!address && addrRe.test(remainder)) {
                        address = remainder;
                    }
                }
                usedLines.add(i);
                continue;
            }
        }

        // 주소 추출
        if (!address && addrRe.test(line)) {
            address = line;
            usedLines.add(i);
            continue;
        }
    }

    // ── 2.5단계: 상세주소 휴리스틱 (별도 줄로 온 동·호·아파트 패턴) ──
    // 주소가 잡혔고 상세주소가 비었을 때만 — 남은 줄에서 다음 패턴 우선 매칭
    //   • "101동 502호" / "502호" / 괄호로 둘러싸인 짧은 줄
    //   • 키워드: 아파트·빌라·오피스텔·상가·타워·레지던스·오피스·하우스
    if (address && !addressDetail) {
        const detailRe = /\d+\s*동\s*\d+\s*호|^\d+\s*호\s*$|아파트|빌라|오피스텔|상가|타워|레지던스|오피스|하우스/;
        for (let i = 0; i < lines.length; i++) {
            if (usedLines.has(i)) continue;
            const line = lines[i];
            // 괄호로 둘러싸인 짧은 줄 → 괄호 벗기고 상세주소
            const parenMatch = line.match(/^\((.+)\)$/);
            if (parenMatch && parenMatch[1].length <= 50) {
                addressDetail = parenMatch[1].trim();
                usedLines.add(i);
                break;
            }
            if (detailRe.test(line) && line.length <= 60) {
                addressDetail = line;
                usedLines.add(i);
                break;
            }
        }
    }

    // ── 3단계: 이름 추론 (아직 못 찾았으면) ──
    // 인사말/명령어로 시작하는 줄은 이름으로 오인 금지 (안녕하세요/주문/요청 등)
    const NAME_BLOCKLIST = new Set([
        '안녕','안녕하세','반갑','반갑습',
        '이름','이름은','성함','고객명',
        '연락','연락처','전화','휴대폰','핸드폰','번호','폰',
        '주소','배송','배송지','받는','받는분','수령','수령인','수취','수취인','보내는','발송','송장',
        '감사','감사합','부탁','부탁드','죄송','죄송합',
        '요청','요청합','주문','주문합','문의','문의드',
        '안내','확인','보내','보냅','드립','드려','메모','비고','특이','참고'
    ]);
    if (!name) {
        for (let i = 0; i < lines.length; i++) {
            if (usedLines.has(i)) continue;
            const line = lines[i];
            // 한글 2~5자 이름 패턴 (숫자·특수문자 없음)
            if (/^[가-힣]{2,5}$/.test(line) && !NAME_BLOCKLIST.has(line)) {
                name = line;
                usedLines.add(i);
                break;
            }
            // 이름 + 전화번호가 한 줄에 있는 경우 (이미 전화번호는 추출됨)
            const nameMatch = line.match(/^([가-힣]{2,5})\s/);
            if (nameMatch && !NAME_BLOCKLIST.has(nameMatch[1])) {
                // 추가 안전장치: prefix 가 NAME_BLOCKLIST 의 어떤 항목으로 시작하면 인사말로 간주
                let isGreeting = false;
                for (const w of NAME_BLOCKLIST) {
                    if (nameMatch[1].startsWith(w) || w.startsWith(nameMatch[1])) { isGreeting = true; break; }
                }
                if (!isGreeting) {
                    name = nameMatch[1];
                    usedLines.add(i);
                    break;
                }
            }
        }
    }

    // ── 4단계: 남은 줄 → 메모로 수집 ──
    if (!memo) {
        const remaining = lines.filter((_, i) => !usedLines.has(i)).join(' ').trim();
        if (remaining) memo = remaining;
    }

    // ── 5단계: 메모에서 상품+수량 추출 ──
    // "오렌지먼로 대자 3개, 녹귀란 1개, 흙 중자 3개" 패턴
    let parsedItems = [];
    if (memo) {
        // 쉼표·줄바꿈으로 분리 후 각 항목에서 "상품명 N개" 패턴 추출
        const segments = memo.split(/[,，\n]+/).map(s => s.trim()).filter(Boolean);
        for (const seg of segments) {
            const m = seg.match(/^(.+?)\s*(\d+)\s*(?:개|포트|묶음|세트|봉|팩|박스)?(?:\s|$)/);
            if (m) {
                parsedItems.push({ rawName: m[1].trim(), quantity: parseInt(m[2]) || 1 });
            } else {
                // 수량 없으면 1개로 간주 (단, 인사말·이모지 등은 제외)
                const cleaned = seg.replace(/[~!🩵💚❤️😊🙏부탁드려요감사합니다주문합니다요청합니다]/g, '').trim();
                if (cleaned && cleaned.length >= 2 && !/^[가-힣]{1}$/.test(cleaned)) {
                    parsedItems.push({ rawName: cleaned, quantity: 1 });
                }
            }
        }
    }

    // 전화번호 포맷 정리 — utils/formatters.js#formatPhone 위임 (모바일·서울 02·지방 0XX 통합 처리)
    if (phone && phone.length >= 9) {
        phone = (window.formatPhone ? window.formatPhone(phone, phone) : phone);
    }

    return { name, phone, address, addressDetail, memo, items: parsedItems };
}

/**
 * 파싱된 상품명을 DB 상품과 매칭
 * 부분 일치(contains) + 유사도 순으로 최적 매칭
 */
function matchProductsFromDB(parsedItems) {
    const products = window.productDataManager?.farm_products;
    if (!Array.isArray(products) || products.length === 0 || !parsedItems.length) return [];

    const results = [];
    for (const item of parsedItems) {
        const raw = item.rawName.toLowerCase().replace(/\s/g, '');
        let bestMatch = null;
        let bestScore = 0;

        for (const p of products) {
            const pName = (p.name || '').toLowerCase().replace(/\s/g, '');
            if (!pName) continue;

            let score = 0;
            // 정확 일치
            if (pName === raw) { score = 100; }
            // DB 상품명이 검색어를 포함
            else if (pName.includes(raw)) { score = 80; }
            // 검색어가 DB 상품명을 포함
            else if (raw.includes(pName)) { score = 70; }
            // 부분 매칭 (검색어의 글자들이 순서대로 포함)
            else {
                let idx = 0;
                for (const ch of raw) {
                    const found = pName.indexOf(ch, idx);
                    if (found >= 0) { idx = found + 1; score += 3; }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = p;
            }
        }

        results.push({
            rawName: item.rawName,
            quantity: item.quantity,
            matched: bestScore >= 20 ? bestMatch : null,
            score: bestScore,
        });
    }
    return results;
}

/**
 * SMS 붙여넣기 모달 열기
 */
function openSmsPasteModal() {
    // 기존 모달 제거
    const existing = document.getElementById('sms-paste-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'sms-paste-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '700';
    modal.innerHTML = `
        <div class="modal-container modal-md" style="max-width:520px;">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-paste text-info mr-2"></i>문자 붙여넣기</span>
                <button id="sms-paste-close" class="modal-close-btn"><i class="fas fa-times text-sm"></i></button>
            </div>
            <div class="modal-body" style="padding:16px;">
                <p class="text-secondary text-sm mb-2">고객이 보낸 문자·카톡을 그대로 붙여넣으세요. 이름·전화·주소를 자동으로 인식합니다.</p>
                <textarea id="sms-paste-input" rows="8"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 resize-none"
                    placeholder="예시:&#10;홍길동&#10;010-1234-5678&#10;경북 경산시 하양읍 대학로 123&#10;에케베리아 2개 주문합니다"></textarea>
                <div id="sms-parse-preview" class="mt-3 hidden">
                    <div class="text-xs font-semibold text-heading mb-1">인식 결과:</div>
                    <div id="sms-preview-content" class="text-sm bg-section rounded-lg p-3 space-y-1"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="sms-paste-cancel" class="btn-secondary">취소</button>
                <button id="sms-paste-apply-btn" class="btn-primary" disabled>
                    <i class="fas fa-check mr-1"></i>적용
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const textarea = modal.querySelector('#sms-paste-input');
    const previewArea = modal.querySelector('#sms-parse-preview');
    const previewContent = modal.querySelector('#sms-preview-content');
    const applyBtn = modal.querySelector('#sms-paste-apply-btn');
    let parsedResult = null;
    let matchedCustomer = null;
    let matchedItems = []; // 상품 매칭 결과

    const close = () => modal.remove();
    modal.querySelector('#sms-paste-close').addEventListener('click', close);
    modal.querySelector('#sms-paste-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // 전화번호로 기존 고객 검색
    async function lookupCustomer(phoneStr) {
        if (!phoneStr || !window.supabaseClient) return null;
        try {
            const normalized = phoneStr.replace(/[^0-9]/g, '');
            const { data } = await window.supabaseClient
                .from('farm_customers')
                .select('id, name, phone, address, address_detail, grade')
                .or(`phone.eq.${normalized},phone.eq.${phoneStr}`);
            return (data && data.length > 0) ? data[0] : null;
        } catch (e) {
            console.warn('고객 조회 실패:', e);
            return null;
        }
    }

    // 미리보기 갱신
    async function updatePreview() {
        parsedResult = parseSmsText(textarea.value);
        if (!parsedResult || (!parsedResult.name && !parsedResult.phone && !parsedResult.address)) {
            previewContent.innerHTML = '<span class="text-danger">인식할 수 없습니다. 문자 내용을 확인해주세요.</span>';
            previewArea.classList.remove('hidden');
            applyBtn.disabled = true;
            matchedCustomer = null;
            return;
        }

        // 기존 고객 매칭
        matchedCustomer = await lookupCustomer(parsedResult.phone);

        const nullDash = '<span class="text-muted">—</span>';
        const customerBadge = matchedCustomer
            ? `<div class="mt-2 px-2 py-1 rounded text-xs" style="background:var(--badge-info-bg);color:var(--badge-info-txt);">
                 <i class="fas fa-user-check mr-1"></i>기존 고객: <strong>${matchedCustomer.name}</strong>님 — 주문에 자동 연결됩니다
               </div>`
            : (parsedResult.name && parsedResult.phone)
              ? `<div class="mt-2 px-2 py-1 rounded text-xs" style="background:var(--badge-warning-bg);color:var(--badge-warning-txt);">
                   <i class="fas fa-user-plus mr-1"></i>신규 고객 — 적용 시 고객 자동 등록 후 주문에 연결됩니다
                 </div>`
              : '';

        // 상품 DB 매칭
        matchedItems = matchProductsFromDB(parsedResult.items || []);
        let itemsHtml = '';
        if (matchedItems.length > 0) {
            const rows = matchedItems.map(mi => {
                if (mi.matched) {
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;">
                        <span><i class="fas fa-check-circle" style="color:var(--primary);margin-right:4px;"></i>${mi.rawName} ${mi.quantity}개</span>
                        <span style="color:var(--text-secondary);font-size:10px;">→ ${mi.matched.name} (${window.fmt ? window.fmt.won(mi.matched.price || 0) : ''})</span>
                    </div>`;
                } else {
                    return `<div style="padding:2px 0;">
                        <span><i class="fas fa-question-circle" style="color:var(--warn);margin-right:4px;"></i>${mi.rawName} ${mi.quantity}개</span>
                        <span style="color:var(--text-muted);font-size:10px;margin-left:6px;">매칭 상품 없음</span>
                    </div>`;
                }
            }).join('');
            itemsHtml = `<div class="mt-2 pt-2" style="border-top:1px solid var(--border);">
                <strong>상품:</strong>${rows}</div>`;
        }

        previewContent.innerHTML = `
            <div><strong>이름:</strong> ${parsedResult.name || nullDash}</div>
            <div><strong>전화:</strong> ${parsedResult.phone || nullDash}</div>
            <div><strong>주소:</strong> ${parsedResult.address || nullDash}</div>
            ${parsedResult.addressDetail ? `<div><strong>상세주소:</strong> ${parsedResult.addressDetail}</div>` : ''}
            ${itemsHtml}
            ${customerBadge}
        `;
        previewArea.classList.remove('hidden');
        applyBtn.disabled = false;
    }

    // 붙여넣기·입력 시 자동 미리보기
    let previewTimer = null;
    textarea.addEventListener('paste', () => { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 100); });
    textarea.addEventListener('input', () => { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 400); });

    // 적용
    applyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!parsedResult) return;

        // 먼저 모달 닫기 (폼 필드 채우기 전에 닫아야 주문 모달이 안 가려짐)
        close();

        // 폼 필드에 값 채우기
        try {
            const nameEl = document.getElementById('order-customer-name');
            const phoneEl = document.getElementById('order-customer-phone');
            const addressEl = document.getElementById('order-customer-address');
            const addressDetailEl = document.getElementById('order-customer-address-detail');
            const memoEl = document.getElementById('order-memo');
            const customerIdEl = document.getElementById('order-customer-id');

            if (nameEl && parsedResult.name) nameEl.value = parsedResult.name;
            if (phoneEl && parsedResult.phone) phoneEl.value = parsedResult.phone;
            if (addressEl && parsedResult.address) addressEl.value = parsedResult.address;
            if (addressDetailEl && parsedResult.addressDetail) addressDetailEl.value = parsedResult.addressDetail;
            if (memoEl && parsedResult.memo) memoEl.value = parsedResult.memo;

            if (matchedCustomer) {
                // 기존 고객 → customer_id 연결 + DB 주소 보완
                if (customerIdEl) customerIdEl.value = matchedCustomer.id;
                if (!parsedResult.address && matchedCustomer.address && addressEl) addressEl.value = matchedCustomer.address;
                if (!parsedResult.addressDetail && matchedCustomer.address_detail && addressDetailEl) addressDetailEl.value = matchedCustomer.address_detail;
                console.log('✅ 기존 고객 연결:', matchedCustomer.name, matchedCustomer.id);
            } else if (parsedResult.name && parsedResult.phone && window.supabaseClient) {
                // 신규 고객 → farm_customers 자동 등록
                const normalizedPhone = parsedResult.phone.replace(/[^0-9]/g, '');
                const { data: inserted, error } = await window.supabaseClient
                    .from('farm_customers')
                    .insert({
                        name: parsedResult.name,
                        phone: normalizedPhone,
                        address: parsedResult.address || '',
                        address_detail: parsedResult.addressDetail || '',
                        grade: 'GENERAL',
                    })
                    .select('id')
                    .single();

                if (error) {
                    console.error('신규 고객 등록 실패:', error);
                } else if (inserted && customerIdEl) {
                    customerIdEl.value = inserted.id;
                    console.log('✅ 신규 고객 등록 완료:', parsedResult.name, inserted.id);
                }
            }

            // 매칭된 상품 → 장바구니 자동 추가
            if (matchedItems.length > 0 && window.addToCart) {
                for (const mi of matchedItems) {
                    if (mi.matched) {
                        window.addToCart(mi.matched.id, mi.matched.name, mi.matched.price || 0, mi.quantity);
                        console.log('🛒 장바구니 자동 추가:', mi.matched.name, mi.quantity + '개');
                    }
                }
                // 매칭 안 된 상품은 메모에 남겨두기
                const unmatched = matchedItems.filter(mi => !mi.matched);
                if (unmatched.length > 0) {
                    const memoEl2 = document.getElementById('order-memo');
                    const unmatchedText = unmatched.map(mi => mi.rawName + ' ' + mi.quantity + '개').join(', ');
                    if (memoEl2) {
                        memoEl2.value = (memoEl2.value ? memoEl2.value + '\n' : '') + '[미매칭] ' + unmatchedText;
                    }
                }
            }

            // 저장 버튼 상태 업데이트
            if (window.updateOrderSubmitButtonState) window.updateOrderSubmitButtonState();
        } catch (e) {
            console.error('❌ 문자입력 적용 실패:', e);
        }
    });

    textarea.focus();
}

window.openSmsPasteModal = openSmsPasteModal;
window.parseSmsText = parseSmsText;

// ─────────────────────────────────────────────

/** 주문 저장 정합성 검증: DB의 total_amount vs Σ(subtotal)+shipping_fee-discount. 콘솔에서 validateOrderTotalAmount(orderId) 호출 가능 */
window.validateOrderTotalAmount = async function (orderId) {
    if (!orderId || !window.supabaseClient) {
        console.warn('orderId 또는 supabaseClient 없음');
        return null;
    }
    const { data, error } = await window.supabaseClient.rpc('validate_order_total_amount', { p_order_id: orderId });
    if (error) {
        console.warn('validate_order_total_amount 오류:', error);
        return { ok: false, error: error.message };
    }
    console.log('주문 정합성 검증:', data);
    return data;
};
