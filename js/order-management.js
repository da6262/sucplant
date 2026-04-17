// 주문관리 컴포넌트 동적 로드 함수
async function loadOrderManagementComponent() {
    try {
        console.log('🔄 주문관리 컴포넌트 로드 중...');
        
        // 기존 이벤트 리스너 정리
        cleanupOrderEventListeners();

        // 섹션 사전 비우기 + 100ms 대기 제거 — 버튼이 잠시 DOM 에서 사라져
        // 첫 클릭이 먹히는 race condition 원인이었음. innerHTML 은 아래 fetch 완료 후
        // 새 HTML 로 한 번에 교체 (깜빡임·공백 타이밍 제거).
        
        // 팝업 모달이므로 다른 섹션 제거 불필요
        // const mainContent = document.getElementById('mainContent');
        // if (mainContent) {
        //     const allMainSections = mainContent.querySelectorAll('div[id$="-section"]');
        //     allMainSections.forEach(section => {
        //         if (section.id !== 'orders-section') {
        //             console.log(`🗑️ 메인 콘텐츠 섹션 제거: ${section.id}`);
        //             section.remove();
        //         }
        //     });
        // }
        
        // 메인 콘텐츠 확인
        const mainContentElement = document.getElementById('mainContent');
        console.log('🔍 메인 콘텐츠 요소:', mainContentElement);
        
        if (!mainContentElement) {
            throw new Error('메인 콘텐츠 영역을 찾을 수 없습니다.');
        }
        
        // 컴포넌트 로드
        console.log('🌐 컴포넌트 파일 요청 중...');
        const response = await fetch('components/order-management/order-management.html', { cache: 'no-store' });
        console.log('📡 응답 상태:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('📄 HTML 로드 완료, 길이:', html.length);
        
        // orders-section에 HTML 내용 삽입
        const ordersSection = document.getElementById('orders-section');
        if (ordersSection) {
            ordersSection.innerHTML = html;
            console.log('📝 orders-section 내용 삽입 완료');
            
            // 섹션 표시 강화
            ordersSection.classList.remove('hidden');
            ordersSection.style.display = 'block';
            ordersSection.style.visibility = 'visible';
            ordersSection.style.opacity = '1';
            console.log('✅ orders-section 표시 설정 완료');
        } else {
            throw new Error('orders-section을 찾을 수 없습니다.');
        }
        
        // 다른 섹션들 숨기기
        document.querySelectorAll('.section-content, .tab-content, [id$="-section"]').forEach(section => {
            if (section.id !== 'orders-section') {
                section.classList.remove('active');
                section.classList.add('hidden');
                section.style.display = 'none';
            }
        });
        
        // 주문관리 섹션 활성화
        ordersSection.classList.add('active');
        ordersSection.setAttribute('data-dynamic', 'true');
        
        // 주문 등록 화면 숨기기
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.classList.add('hidden');
            orderModal.style.display = 'none';
        }
        
        // 다른 섹션들은 숨기기만 하고 제거하지 않음 (화면 전환을 위해 유지)
        console.log('📋 다른 섹션들은 화면 전환을 위해 유지');
        
        console.log('✅ 주문관리 컴포넌트 로드 완료');
        
        // 섹션이 제대로 표시되는지 확인
        console.log('🔍 주문관리 섹션 표시 상태 확인:');
        console.log('  - display:', ordersSection.style.display);
        console.log('  - visibility:', ordersSection.style.visibility);
        console.log('  - opacity:', ordersSection.style.opacity);
        console.log('  - classes:', ordersSection.className);
        console.log('  - hidden class:', ordersSection.classList.contains('hidden'));
        
        // 로드 완료 후 추가 초기화 - DOM 완전 로딩 대기
        await waitForDOMAndInitialize();
        
    } catch (error) {
        console.error('❌ 주문관리 컴포넌트 로드 실패:', error);
        console.error('❌ 오류 상세:', error.stack);
        alert('주문관리 화면을 로드할 수 없습니다: ' + error.message);
    }
}

// 이벤트 리스너 정리 함수
// orders-section은 loadOrderManagementComponent에서 innerHTML=''로 통째로 교체되므로
// cloneNode/replaceChild 불필요. body에 달린 order-modal은 건드리지 않는다.
function cleanupOrderEventListeners() {
    window.orderEventListenersAttached = false;
}

// DOM 완전 로딩 대기 및 초기화 함수
async function waitForDOMAndInitialize() {
    try {
        console.log('🔄 주문관리 DOM 완전 로딩 대기 시작');
        
        // DOM 요소들이 완전히 렌더링될 때까지 대기
        let retryCount = 0;
        const maxRetries = 20; // 최대 4초 대기
        
        while (retryCount < maxRetries) {
            const ordersSection = document.getElementById('orders-section');
            const ordersTableBody = document.getElementById('orders-table-body');
            const addOrderBtn = document.getElementById('add-order-btn');
            
            if (ordersSection && ordersTableBody && addOrderBtn) {
                console.log('✅ 주문관리 DOM 요소들 확인 완료');
                break;
            }
            
            console.log(`🔄 DOM 요소 대기 중... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 200));
            retryCount++;
        }
        
        if (retryCount >= maxRetries) {
            console.warn('⚠️ DOM 요소 로딩 시간 초과, 강제 진행');
        }
        
        // 주문관리 초기화 실행
        await initializeOrderManagement();
        
    } catch (error) {
        console.error('❌ DOM 대기 및 초기화 실패:', error);
        // 실패해도 기본 초기화는 시도
        await initializeOrderManagement();
    }
}

// 주문관리 초기화 함수
async function initializeOrderManagement() {
    try {
        console.log('🔄 주문관리 초기화 시작');
        
        // 새 주문 저장 후 이동 시 pendingOrderStatus 플래그로 목표 탭 결정
        // 그 외에는 기본 all(전체) 탭
        const pendingStatus = window._pendingOrderStatus || null;
        window._pendingOrderStatus = null; // 소비 후 초기화

        const statusToTabId = {
            '주문접수': 'status-주문접수',
            '고객안내': 'status-고객안내',
            '입금대기': 'status-입금대기',
            '입금확인': 'status-입금확인',
            '상품준비': 'status-work_todo',
            '배송준비': 'status-work_todo',
            '배송중':   'status-배송중',
            '배송완료': 'status-배송완료',
        };
        const activeTabId = pendingStatus
            ? (statusToTabId[pendingStatus] || `status-${pendingStatus}`)
            : 'status-all';
        const activeStatus = pendingStatus || 'all';

        document.querySelectorAll('.status-tab-btn').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) activeTab.classList.add('active');

        // 주문 데이터 초기화
        if (window.orderDataManager) {
            console.log('🛒 주문 데이터 로드 중...');
            try {
                await window.orderDataManager.loadOrders();
            } catch (loadErr) {
                console.error('❌ 주문 목록 로드 실패 (테이블은 빈 상태로 표시):', loadErr);
                window.orderDataManager._loadErrorMessage = loadErr && (loadErr.message || String(loadErr));
            }
            // 저장 후 이동이면 해당 상태 탭으로, 아니면 work_todo
            if (window.orderDataManager.renderOrdersTable) {
                window.orderDataManager.renderOrdersTable(activeStatus);
            }
            // 주문 상태별 카운트 업데이트
            if (window.orderDataManager.updateFilterCounts) {
                console.log('📊 주문 상태별 카운트 업데이트 중...');
                window.orderDataManager.updateFilterCounts();
            }
            console.log('✅ 주문 데이터 초기화 완료');
        } else {
            console.warn('⚠️ orderDataManager를 찾을 수 없습니다');
        }
        
        // 채널 필터 셀렉트 초기화 (farm_channels DB 연동)
        if (window.orderDataManager?.initChannelFilterSelect) {
            window.orderDataManager.initChannelFilterSelect();
        }

        // 주문관리 이벤트 리스너 연결
        attachOrderEventListeners();

        // 주문 상세 모달 로드
        await loadOrderDetailModal();

        console.log('✅ 주문관리 초기화 완료');
        
    } catch (initError) {
        console.error('❌ 주문관리 초기화 중 오류:', initError);
        // 초기화 실패해도 기본 이벤트 리스너는 연결
        attachOrderEventListeners();
    }
}

// 주문 상세 모달 로드 (중복 방지: 이미 존재하면 재사용)
async function loadOrderDetailModal() {
    try {
        if (document.getElementById('order-detail-modal')) return; // 이미 있으면 스킵
        console.log('📦 주문 상세 모달 컴포넌트 로드 중...');

        const response = await fetch('components/modals/order-detail-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();

        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 주문 상세 모달 컴포넌트 로드 완료');
        
        // 주문 상세 모달 닫기 이벤트 리스너 추가
        const closeOrderDetailModal = document.getElementById('close-order-detail-modal');
        const closeOrderDetailModalBtn = document.getElementById('close-order-detail-modal-btn');
        
        if (closeOrderDetailModal) {
            closeOrderDetailModal.addEventListener('click', function() {
                console.log('❌ 주문 상세 모달 닫기');
                const modal = document.getElementById('order-detail-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            });
        }
        
        if (closeOrderDetailModalBtn) {
            closeOrderDetailModalBtn.addEventListener('click', function() {
                console.log('❌ 주문 상세 모달 닫기 (버튼)');
                const modal = document.getElementById('order-detail-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            });
        }
        
        console.log('✅ 주문 상세 모달 이벤트 리스너 추가 완료');
        
    } catch (error) {
        console.error('❌ 주문 상세 모달 로드 실패:', error);
    }
}

// 주문 상세 모달 열기
async function openOrderDetailModal(orderId) {
    try {
        console.log('📋 주문 상세 모달 열기:', orderId);
        
        // orderDataManager가 없으면 초기화 시도
        if (!window.orderDataManager) {
            console.log('🔄 orderDataManager가 없습니다. 초기화 시도...');
            if (window.OrderDataManager) {
                window.orderDataManager = new window.OrderDataManager();
                await window.orderDataManager.init();
            } else {
                console.error('❌ OrderDataManager 클래스를 찾을 수 없습니다');
                alert('주문 데이터 관리자를 초기화할 수 없습니다.');
                return;
            }
        }
        
        // 주문 데이터 찾기: 메모리(farm_orders) → 없으면 목록 행(farm_order_rows의 order_id) 확인 후 Supabase에서 1건 조회
        let order = window.orderDataManager?.getOrderById?.(orderId);
        if (!order && window.orderDataManager?.fetchOrderByIdFromSupabase) {
            order = await window.orderDataManager.fetchOrderByIdFromSupabase(orderId);
        }
        if (!order) {
            console.error('❌ 주문을 찾을 수 없습니다:', orderId);
            alert('주문을 찾을 수 없습니다. 주문 목록을 새로고침하거나, 해당 주문이 DB에 있는지 확인해주세요.');
            return;
        }
        console.log('🔍 주문 데이터:', order);
        
        // 주문 상세 모달이 없으면 동적으로 로드
        let modal = document.getElementById('order-detail-modal');
        if (!modal) {
            console.log('📦 주문 상세 모달이 없습니다. 동적 로드 시작...');
            await loadOrderDetailModal();
            modal = document.getElementById('order-detail-modal');
        }
        
        if (!modal) {
            throw new Error('주문 상세 모달을 찾을 수 없습니다.');
        }
        
        // 모달에 데이터 표시
        displayOrderDetail(modal, order);
        
        // 모달 표시
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        console.log('✅ 주문 상세 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 주문 상세 모달 열기 실패:', error);
        alert('주문 상세 정보를 불러올 수 없습니다: ' + error.message);
    }
}

// 주문 상세 데이터를 모달에 표시
function displayOrderDetail(modal, order) {
    try {
        console.log('📊 주문 상세 데이터 모달 표시:', order);
        
        // 주문 기본 정보
        const orderNumberEl = modal.querySelector('#detail-order-number');
        const orderDateEl = modal.querySelector('#detail-order-date');
        const orderStatusEl = modal.querySelector('#detail-order-status');
        const orderChannelEl = modal.querySelector('#detail-order-channel');
        
        if (orderNumberEl) orderNumberEl.textContent = order.order_number || order.id || '-';
        if (orderDateEl) orderDateEl.textContent = order.order_date ? new Date(order.order_date).toLocaleDateString('ko-KR') : '-';
        if (orderStatusEl) {
            // 통제실 badge 클래스 사용 — raw Tailwind 제거
            const STATUS_BADGE = {
                '주문접수': 'badge-info',    '고객안내': 'badge-warning',
                '입금대기': 'badge-orange',  '입금확인': 'badge-success',
                '상품준비': 'badge-purple',  '배송준비': 'badge-sky',
                '배송중':   'badge-purple',  '배송완료': 'badge-success',
                '주문취소': 'badge-danger',  '환불완료': 'badge-neutral',
            };
            const st = order.order_status || order.status || '-';
            const badgeVariant = STATUS_BADGE[st] || 'badge-neutral';
            orderStatusEl.className = `badge ${badgeVariant}`;
            orderStatusEl.textContent = st;
        }
        if (orderChannelEl) orderChannelEl.textContent = order.order_channel || order.order_source || '-';
        
        // 고객 정보
        const customerNameEl = modal.querySelector('#detail-customer-name');
        const customerPhoneEl = modal.querySelector('#detail-customer-phone');
        const customerAddressEl = modal.querySelector('#detail-customer-address');
        
        if (customerNameEl) customerNameEl.textContent = order.customer_name || '-';
        if (customerPhoneEl) customerPhoneEl.textContent = order.customer_phone || '-';
        if (customerAddressEl) customerAddressEl.textContent = order.customer_address || '-';
        
        // 주문 상품 목록
        const orderItemsEl = modal.querySelector('#detail-order-items');
        if (orderItemsEl) {
            // 품목 단일 소스: order.items (farm_order_items에서 로드됨)
            const items = Array.isArray(order.items) ? order.items : [];
            
            if (items && items.length > 0) {
                orderItemsEl.innerHTML = items.map(item => {
                    const productName = item.product_name || item.name || item.title || '상품명 없음';
                    const quantity = item.quantity || item.qty || item.amount || 0;
                    
                    // 가격 정보 강화: 다양한 필드명 지원
                    let price = item.price || item.unit_price || item.total_price || 0;
                    
                    // 가격이 0이면 total_price를 수량으로 나누어 단가 계산
                    if (price === 0 && item.total_price && quantity > 0) {
                        price = parseFloat(item.total_price) / quantity;
                        console.log(`💰 단가 계산: ${item.total_price} ÷ ${quantity} = ${price}`);
                    }
                    
                    const total = price * quantity;
                    
                    console.log('📦 상품 아이템 상세:', { 
                        productName, 
                        quantity, 
                        price, 
                        total,
                        originalPrice: item.price,
                        unitPrice: item.unit_price,
                        totalPrice: item.total_price
                    });
                    
                    return `
                        <tr class="hover:bg-section">
                            <td class="px-4 td-primary">${productName}</td>
                            <td class="px-4 text-center td-primary">${quantity}개</td>
                            <td class="px-4 text-right td-primary">${price.toLocaleString()}원</td>
                            <td class="px-4 text-right font-medium td-primary">${total.toLocaleString()}원</td>
                        </tr>
                    `;
                }).join('');
            } else {
                console.warn('⚠️ 주문 상품 데이터가 없습니다');
                orderItemsEl.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-4 text-center text-muted">
                            <div class="flex flex-col items-center">
                                <i class="fas fa-box text-3xl mb-3 text-gray-300"></i>
                                <p class="text-sm font-medium text-body">주문 상품이 없습니다</p>
                                <p class="text-xs text-muted mt-1">데이터를 확인해주세요</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
        
        // 금액 요약
        const productAmountEl = modal.querySelector('#detail-product-amount');
        const shippingFeeEl = modal.querySelector('#detail-shipping-fee');
        const discountAmountEl = modal.querySelector('#detail-discount-amount');
        const totalAmountEl = modal.querySelector('#detail-total-amount');
        
        // 저장된 값 우선 사용 (재계산 방지)
        const productAmount = order.product_amount || 0;
        const shippingFee = order.shipping_fee || 0;
        const discountAmount = order.discount_amount || 0;
        const totalAmount = order.total_amount || 0;
        
        console.log('💰 주문 상세 금액 정보:', {
            productAmount: productAmount,
            shippingFee: shippingFee,
            discountAmount: discountAmount,
            totalAmount: totalAmount,
            storedTotalAmount: order.total_amount
        });
        
        if (productAmountEl) productAmountEl.textContent = productAmount.toLocaleString() + '원';
        if (shippingFeeEl) shippingFeeEl.textContent = shippingFee.toLocaleString() + '원';
        if (discountAmountEl) discountAmountEl.textContent = '-' + discountAmount.toLocaleString() + '원';
        if (totalAmountEl) totalAmountEl.textContent = totalAmount.toLocaleString() + '원';
        
        // 배송 정보
        const trackingNumberEl = modal.querySelector('#detail-tracking-number');
        const shippingStatusEl = modal.querySelector('#detail-shipping-status');
        
        if (trackingNumberEl) trackingNumberEl.textContent = order.tracking_number || '-';
        if (shippingStatusEl) shippingStatusEl.textContent = order.shipping_status || '-';
        
        // 메모
        const orderMemoEl = modal.querySelector('#detail-order-memo');
        if (orderMemoEl) orderMemoEl.textContent = order.memo || '-';
        
        // 액션 버튼 이벤트 리스너 연결
        attachOrderDetailEventListeners(modal, order);
        
        console.log('✅ 주문 상세 데이터 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 주문 상세 데이터 모달 표시 실패:', error);
    }
}

// 주문 상세 모달 이벤트 리스너 연결
function attachOrderDetailEventListeners(modal, order) {
    try {
        console.log('🔗 주문 상세 모달 이벤트 리스너 연결');
        
        // 주문 수정 버튼
        const editOrderBtn = modal.querySelector('#edit-order-btn');
        if (editOrderBtn) {
            editOrderBtn.addEventListener('click', async function(event) {
                event.preventDefault();
                event.stopPropagation();
                console.log('✏️ 주문 수정 버튼 클릭:', order.id);
                
                try {
                    // 상세 모달 먼저 닫기
                    modal.classList.add('hidden');
                    modal.style.display = 'none';

                    // 주문 수정 모달 열기 (새창이 아닌 모달로)
                    if (window.openOrderModal) {
                        console.log('📝 주문 수정 모달 열기 시도...');
                        await window.openOrderModal(order.id);
                    } else if (window.editOrder) {
                        console.log('📝 editOrder 함수 호출...');
                        await window.editOrder(order.id);
                    } else {
                        console.error('❌ 주문 수정 함수를 찾을 수 없습니다');
                        alert('주문 수정 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
                    }
                } catch (error) {
                    console.error('❌ 주문 수정 실패:', error);
                    alert('주문 수정 중 오류가 발생했습니다: ' + error.message);
                }
            });
        }
        
        // 주문서 출력 버튼
        const printOrderBtn = modal.querySelector('#print-order-btn');
        if (printOrderBtn) {
            printOrderBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('🖨️ 주문서 출력 버튼 클릭:', order.id);
                // 주문서 출력 기능 구현 예정
                if (window.generateOrderPrintHTML) {
                    const printHTML = window.generateOrderPrintHTML(order);
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                        alert('팝업이 차단되었습니다. 브라우저 팝업 차단을 해제 후 다시 시도해주세요.');
                        return;
                    }
                    printWindow.document.write(printHTML);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.onafterprint = () => printWindow.close();
                    }, 500);
                } else {
                    alert('주문서 출력 기능을 사용할 수 없습니다.');
                }
            });
        }
        
        console.log('✅ 주문 상세 모달 이벤트 리스너 연결 완료');
        
    } catch (error) {
        console.error('❌ 주문 상세 모달 이벤트 리스너 연결 실패:', error);
    }
}

// 전역 함수로 등록
window.loadOrderManagementComponent = loadOrderManagementComponent;
window.attachOrderEventListeners = attachOrderEventListeners;
window.openOrderDetailModal = openOrderDetailModal;
window.cleanupOrderEventListeners = cleanupOrderEventListeners;
window.waitForDOMAndInitialize = waitForDOMAndInitialize;
window.initializeOrderManagement = initializeOrderManagement;

// 주문관리 이벤트 리스너 연결 함수
function attachOrderEventListeners() {
    try {
        console.log('🔗 주문관리 이벤트 리스너 연결 시작...');

        // 새 주문 등록 버튼 — onclick 할당(재방문 시에도 덮어쓰기로 중복 방지)
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.onclick = async () => {
                try {
                    if (!document.getElementById('order-modal')) {
                        await loadOrderModal();
                    }
                    if (window.openOrderModal) await window.openOrderModal();
                } catch (error) {
                    console.error('❌ 새 주문 등록 오류:', error);
                }
            };
        }

        // 주문 상태별 필터 탭 — onclick 할당
        const statusTabs = document.querySelectorAll('.status-tab-btn');
        statusTabs.forEach(tab => {
            tab.onclick = async function() {
                const status = this.id.replace('status-', '');
                statusTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                if (window.orderDataManager) {
                    try {
                        await window.orderDataManager.loadOrders();
                        if (window.orderDataManager.renderOrdersTable) {
                            window.orderDataManager.renderOrdersTable(status);
                        }
                    } catch (error) {
                        console.error('❌ 주문 테이블 필터링 실패:', error);
                    }
                }
            };
        });
        
        // 일괄 처리 버튼들
        const bulkStatusChangeBtn = document.getElementById('bulk-status-change-btn');
        if (bulkStatusChangeBtn) {
            bulkStatusChangeBtn.addEventListener('click', function() {
                console.log('📝 일괄 상태변경 버튼 클릭');
                // 일괄 상태변경 로직
            });
        }
        
        const bulkTrackingImportBtn = document.getElementById('bulk-tracking-import-btn');
        if (bulkTrackingImportBtn) {
            bulkTrackingImportBtn.addEventListener('click', function() {
                toggleTrackingPanel();
            });
        }

        // 패널 닫기 버튼
        document.addEventListener('click', function(e) {
            if (e.target.closest('#tracking-panel-close')) {
                const panel = document.getElementById('tracking-import-panel');
                if (panel) panel.classList.add('hidden');
            }
        });

        // 전체 저장 버튼
        document.addEventListener('click', function(e) {
            if (e.target.closest('#tracking-save-all-btn')) {
                saveAllTrackingNumbers();
            }
        });
        
        const generatePackagingLabelsBtn = document.getElementById('generate-packaging-labels-btn');
        if (generatePackagingLabelsBtn) {
            generatePackagingLabelsBtn.addEventListener('click', function() {
                console.log('🏷️ 포장 라벨 생성 버튼 클릭');
                // 포장 라벨 생성 로직
            });
        }
        
        // 판매채널 관리 버튼 이벤트 리스너 연결
        const salesChannelsBtn = document.getElementById('sales-channels-btn');
        if (salesChannelsBtn) {
            salesChannelsBtn.addEventListener('click', async function(event) {
                // 이벤트 전파 방지
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                console.log('🏪 판매채널 관리 버튼 클릭');
                await openSalesChannelsManagement();
            });
            console.log('✅ 판매채널 관리 버튼 이벤트 리스너 연결 완료');
        }
        
        // 배송비 관리 버튼 이벤트 리스너 연결 (주문 관리 화면에서만)
        console.log('🔄 배송비 관리 버튼 이벤트 리스너 연결 시작');
        
        // 주문 관리 화면에 있는 배송비 관리 버튼만 찾기
        const shippingSettingsBtn = document.getElementById('shipping-settings-btn');
        if (shippingSettingsBtn) {
            // 주문 관리 화면에 있는 버튼인지 확인 (부모 컨테이너 확인)
            const isInOrderManagement = shippingSettingsBtn.closest('#orders-section') || 
                                       shippingSettingsBtn.closest('.order-management-container');
            
            if (isInOrderManagement) {
                // 이미 이벤트 리스너가 연결되어 있는지 확인
                if (!shippingSettingsBtn.hasAttribute('data-listener-added')) {
                    console.log('✅ 주문 관리 화면의 배송비 관리 버튼 이벤트 리스너 추가');
                    shippingSettingsBtn.addEventListener('click', function(event) {
                        // 이벤트 전파 방지
                        if (event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        console.log('🚚 배송비 관리 버튼 클릭');
                        showShippingSettingsSection();
                    });
                    shippingSettingsBtn.setAttribute('data-listener-added', 'true');
                } else {
                    console.log('⚠️ 배송비 관리 버튼에 이미 이벤트 리스너가 연결되어 있습니다');
                }
            } else {
                console.log('⚠️ 새 주문 등록 화면의 배송비 설정 버튼은 이벤트 리스너를 추가하지 않습니다');
            }
        } else {
            console.warn('⚠️ 배송비 관리 버튼을 찾을 수 없습니다');
        }
        
        // 새 주문 등록 폼의 배송비 설정 버튼은 주문관리 화면에서만 사용
        console.log('🔄 새 주문 등록 폼 배송비 설정 버튼 처리 시작');
        
        const manageShippingSettingsBtn = document.getElementById('manage-shipping-settings-main-btn');
        if (manageShippingSettingsBtn) {
            // 주문관리 섹션 내에서만 이벤트 리스너 연결
            const isInOrderManagement = manageShippingSettingsBtn.closest('#orders-section') || 
                                       manageShippingSettingsBtn.closest('.order-management-container');
            
            if (isInOrderManagement) {
                // 이미 이벤트 리스너가 연결되어 있는지 확인
                if (!manageShippingSettingsBtn.hasAttribute('data-listener-added')) {
                    console.log('✅ 주문관리 화면의 배송비 설정 버튼 이벤트 리스너 추가');
                    manageShippingSettingsBtn.addEventListener('click', function(event) {
                        // 이벤트 전파 방지
                        if (event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        console.log('🚚 주문관리 화면 배송비 설정 버튼 클릭');
                        showShippingSettingsSection();
                    });
                    manageShippingSettingsBtn.setAttribute('data-listener-added', 'true');
                } else {
                    console.log('⚠️ 주문관리 화면 배송비 설정 버튼에 이미 이벤트 리스너가 연결되어 있습니다');
                }
            } else {
                console.log('⚠️ 새 주문 등록 폼의 배송비 설정 버튼은 이벤트 리스너를 추가하지 않습니다');
                // 새 주문 등록 폼의 배송비 설정 버튼 비활성화
                manageShippingSettingsBtn.style.display = 'none';
                manageShippingSettingsBtn.disabled = true;
            }
        } else {
            console.warn('⚠️ 배송비 설정 버튼을 찾을 수 없습니다');
        }
        
        // 전체 선택 체크박스 — onchange 할당
        const selectAllOrders = document.getElementById('select-all-orders');
        if (selectAllOrders) {
            selectAllOrders.onchange = function() {
                const orderCheckboxes = document.querySelectorAll('input[type="checkbox"][data-order-id]');
                orderCheckboxes.forEach(checkbox => { checkbox.checked = this.checked; });
            };
        }

        // 페이지당 표시 수 — 전역 PageSize 컨트롤 사용 (options·리스너 중앙 관리)
        if (window.PageSize) {
            // 주문은 기본 50 유지 (orderData.js:683 default 와 정합)
            window.PageSize.attach('order-page-size', () => {
                if (window.orderDataManager) window.orderDataManager.renderOrdersTable();
            }, 50);
        }

        // 피킹 리스트 버튼 — onclick 할당
        const generatePickingListBtn = document.getElementById('generate-picking-list-btn');
        if (generatePickingListBtn) {
            generatePickingListBtn.onclick = async () => { await generatePickingList(); };
        }

        console.log('🔗 주문관리 이벤트 리스너 연결 완료');

    } catch (error) {
        console.error('❌ 주문관리 이벤트 리스너 연결 실패:', error);
        // 오류가 발생해도 기본적인 기능은 유지
        console.log('⚠️ 일부 이벤트 리스너 연결에 실패했지만 계속 진행합니다.');
    }
}

// 판매채널 관리 화면 열기 함수
async function openSalesChannelsManagement() {
    try {
        console.log('🏪 판매채널 관리 화면 열기 시작...');
        
        // 기존 판매채널 관리 섹션이 있으면 제거
        const existingSection = document.getElementById('channels-section');
        if (existingSection) {
            console.log('🗑️ 기존 판매채널 관리 섹션 제거');
            existingSection.remove();
        }
        
        // 다른 섹션들은 제거하지 않음 (화면 전환을 위해 유지)
        console.log('📋 다른 섹션들은 화면 전환을 위해 유지');
        
        // 메인 콘텐츠 확인
        const mainContentElement = document.getElementById('mainContent');
        console.log('🔍 메인 콘텐츠 요소:', mainContentElement);
        
        if (!mainContentElement) {
            throw new Error('메인 콘텐츠 영역을 찾을 수 없습니다.');
        }
        
        // 판매채널 관리 컴포넌트 로드
        console.log('🌐 판매채널 관리 컴포넌트 파일 요청 중...');
        const response = await fetch('components/sales-channels/sales-channels.html');
        console.log('📡 응답 상태:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`판매채널 관리 컴포넌트 로드 실패: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('📦 판매채널 관리 HTML 로드 완료, 길이:', html.length);
        
        // channels-section에 HTML 삽입
        const channelsSection = document.createElement('div');
        channelsSection.id = 'channels-section';
        channelsSection.className = 'section-content';
        channelsSection.innerHTML = html;
        
        mainContentElement.appendChild(channelsSection);
        console.log('✅ 판매채널 관리 섹션 추가 완료');
        
        // 판매채널 관리 컴포넌트 초기화
        try {
            // 판매채널 관리 스크립트 동적 로드
            if (!window.salesChannelsComponent) {
                console.log('📦 판매채널 관리 스크립트 로드 중...');
                const script = document.createElement('script');
                script.src = 'components/sales-channels/sales-channels.js';
                script.type = 'module';
                document.head.appendChild(script);
                
                // 스크립트 로드 완료 대기
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }
            
            if (window.salesChannelsComponent) {
                console.log('🔄 판매채널 관리 컴포넌트 초기화 중...');
                await window.salesChannelsComponent.init();
                console.log('✅ 판매채널 관리 컴포넌트 초기화 완료');
            } else {
                console.warn('⚠️ salesChannelsComponent를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 판매채널 관리 컴포넌트 초기화 실패:', error);
        }
        
    } catch (error) {
        console.error('❌ 판매채널 관리 화면 열기 실패:', error);
        console.error('❌ 오류 상세:', error.stack);
        alert('판매채널 관리 화면을 열 수 없습니다: ' + error.message);
    }
}

// 주문 모달 동적 로드 함수
async function loadOrderModal() {
    try {
        console.log('📦 주문 모달 컴포넌트 로드 중...');
        
        // 이미 모달이 있는지 확인
        const existingModal = document.getElementById('order-modal');
        if (existingModal) {
            console.log('✅ 주문 모달이 이미 존재합니다');
            return existingModal;
        }
        
        // 주문 모달 컴포넌트 동적 로드
        console.log('🌐 주문 모달 HTML 파일 요청 중...');
        const response = await fetch('components/order-management/order-modal.html', { cache: 'no-store' });
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
            console.log('✅ 주문 모달 닫기 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 닫기 버튼을 찾을 수 없습니다.');
        }
        
        // 모달 배경 클릭 시 닫기
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('🖱️ 모달 배경 클릭 - 모달 닫기');
                    if (window.closeOrderModal) {
                        window.closeOrderModal();
                    }
                }
            });
            console.log('✅ 모달 배경 클릭 이벤트 리스너 추가 완료');
        }
        
    } catch (error) {
        console.error('❌ 주문 모달 로드 실패:', error);
        throw error;
    }
}

// 피킹 리스트 생성 함수
async function generatePickingList() {
    try {
        console.log('📋 피킹 리스트 생성 시작');
        
        // 상품준비 & 배송준비 상태 주문들 가져오기
        const readyOrders = await getReadyForShippingOrders();
        if (!readyOrders || readyOrders.length === 0) {
            alert('📦 상품준비 또는 배송준비 상태의 주문이 없습니다.');
            return;
        }
        
        console.log('📦 피킹 대상 주문 수:', readyOrders.length);
        
        // 피킹 데이터 생성
        const pickingData = await createPickingData(readyOrders);
        
        // 피킹 리스트 모달 열기
        await openPickingListModal(pickingData);
        
    } catch (error) {
        console.error('❌ 피킹 리스트 생성 실패:', error);
        alert('피킹 리스트 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// 상품준비 & 배송준비 상태 주문들 가져오기
async function getReadyForShippingOrders() {
    try {
        console.log('🔍 상품준비 & 배송준비 상태 주문 조회 중...');

        if (!window.orderDataManager) {
            console.warn('⚠️ orderDataManager를 찾을 수 없습니다');
            return [];
        }

        // farm_order_rows(RPC 결과)에서 해당 상태 행 추출
        const rows = window.orderDataManager.farm_order_rows || [];
        const readyRows = rows.filter(r => {
            const st = r.order_status || r.status || '';
            return st === '상품준비' || st === '배송준비';
        });
        console.log('📦 피킹 대상 요약 행:', readyRows.length + '건');
        console.log('   - 상품준비:', readyRows.filter(r => r.order_status === '상품준비').length + '건');
        console.log('   - 배송준비:', readyRows.filter(r => r.order_status === '배송준비').length + '건');

        if (readyRows.length === 0) return [];

        // 각 주문의 items 포함 전체 데이터를 Supabase에서 조회
        const fullOrders = await Promise.all(
            readyRows.map(r => {
                const id = r.order_id || r.id;
                return window.orderDataManager.fetchOrderByIdFromSupabase(id);
            })
        );
        const validOrders = fullOrders.filter(Boolean);
        console.log('✅ 피킹 대상 전체 주문 로드 완료:', validOrders.length + '건');
        return validOrders;
    } catch (error) {
        console.error('❌ 피킹 대상 주문 조회 실패:', error);
        return [];
    }
}

// 상품 정보 조회 함수 (product_id로 상품명 찾기)
async function getProductNameById(productId) {
    try {
        if (!productId) {
            console.warn('⚠️ product_id가 없습니다');
            return null;
        }
        
        console.log(`🔍 상품 정보 조회: ${productId}`);
        
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트가 없습니다');
            return null;
        }
        
        // farm_products 테이블에서 상품 정보 조회
        const { data: product, error } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price, size, description, category')
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

// 피킹 데이터 생성
async function createPickingData(orders) {
    try {
        console.log('📊 피킹 데이터 생성 시작');
        
        const productSummary = new Map();
        const customerSummary = new Map();
        let totalOrders = orders.length;
        let totalItems = 0;
        
        // 주문별 데이터 처리
        for (const order of orders) {
            console.log('🔍 주문 데이터:', order);
            const items = order.items ?? [];
            console.log('🔍 주문 아이템들:', items);
            console.log('🔍 주문 아이템 타입:', typeof items, Array.isArray(items));
            
            if (Array.isArray(items)) {
                for (const item of items) {
                    console.log('🔍 아이템 데이터:', item);
                    console.log('🔍 아이템 키들:', Object.keys(item));
                    
                    // 상품명 찾기 - product_id가 있으면 DB에서 조회
                    let productName = item.product_name || item.name || item.title || item.productName || item.product_title || item.item_name || item.goods_name;
                    
                    // 상품명이 없고 product_id가 있으면 DB에서 조회
                    let productInfo = null;
                    if (!productName && item.product_id) {
                        console.log(`🔍 product_id로 상품명 조회: ${item.product_id}`);
                        productInfo = await getProductNameById(item.product_id);
                        if (productInfo) {
                            productName = productInfo.name;
                            console.log(`✅ 상품명 조회 성공: ${productName}`);
                        }
                    }
                    
                    // 상품 사이즈 정보 가져오기
                    let productSize = item.size || item.product_size || '';
                    if (!productSize && productInfo && productInfo.size) {
                        productSize = productInfo.size;
                        console.log(`✅ 상품 사이즈 조회 성공: ${productSize}`);
                    }
                    
                    // 여전히 상품명이 없으면 기본값 사용
                    if (!productName) {
                        productName = '상품명 없음';
                    }
                    
                    const quantity = parseInt(item.quantity || item.qty || item.amount || 1) || 0;
                    const price = parseFloat(item.price || item.unit_price || item.total_price || item.unitPrice || 0) || 0;
                    
                    console.log(`🔍 최종 상품명: ${productName}, 수량: ${quantity}, 가격: ${price}`);
                    
                    // 상품명이 "상품명 없음"이면 원본 아이템 데이터 출력 및 대체 상품명 생성
                    if (productName === '상품명 없음') {
                        console.error('❌ 상품명을 찾을 수 없습니다. 원본 아이템 데이터:', JSON.stringify(item, null, 2));
                        console.error('❌ 주문 ID:', order.id);
                        console.error('❌ 주문 전체 데이터:', order);
                        
                        // 대체 상품명 생성 (product_id 기반)
                        if (item.product_id) {
                            productName = `상품_${item.product_id.substring(0, 8)}`;
                            console.log(`🔄 대체 상품명 생성: ${productName}`);
                        } else {
                            productName = `알 수 없는 상품_${Date.now()}`;
                            console.log(`🔄 임시 상품명 생성: ${productName}`);
                        }
                    }
                    
                    totalItems += quantity;
                    
                    // 상품별 집계 (사이즈 정보 포함)
                    const productKey = `${productName}_${productSize || '기본'}`;
                    if (productSummary.has(productKey)) {
                        const existing = productSummary.get(productKey);
                        existing.totalQuantity += quantity;
                        existing.totalAmount += price * quantity;
                        existing.orders.push(order);
                    } else {
                        productSummary.set(productKey, {
                            name: productName,
                            size: productSize || '기본',
                            totalQuantity: quantity,
                            totalAmount: price * quantity,
                            orders: [order]
                        });
                    }
                }
            } else {
                console.warn('⚠️ 주문에 아이템이 없거나 배열이 아닙니다:', order.id, items);
            }
            
        // 고객별 집계
        const customerKey = `${order.customer_name}_${order.customer_phone}`;
        if (customerSummary.has(customerKey)) {
            const existing = customerSummary.get(customerKey);
            existing.orders.push(order);
            existing.total_amount += parseFloat(order.total_amount) || 0;
        } else {
            customerSummary.set(customerKey, {
                name: order.customer_name,
                phone: order.customer_phone,
                address: order.customer_address,
                orders: [order],
                total_amount: parseFloat(order.total_amount) || 0
            });
        }
        
        console.log('🔍 고객별 집계 완료:', {
            customerKey,
            customerName: order.customer_name,
            phone: order.customer_phone,
            address: order.customer_address,
            totalAmount: order.total_amount,
            itemsCount: items.length
        });
        }
        
        // 예상 소요시간 계산 (상품당 1분, 고객당 2분)
        const estimatedTime = Math.ceil((productSummary.size * 1 + customerSummary.size * 2) / 10) * 10;
        
        const pickingData = {
            productSummary: Array.from(productSummary.values()),
            customerSummary: Array.from(customerSummary.values()),
            totalOrders,
            totalItems,
            estimatedTime: `${estimatedTime}분`
        };
        
        console.log('✅ 피킹 데이터 생성 완료:', pickingData);
        return pickingData;
        
    } catch (error) {
        console.error('❌ 피킹 데이터 생성 실패:', error);
        throw error;
    }
}

// 피킹 리스트 모달 열기
async function openPickingListModal(pickingData) {
    try {
        console.log('📋 피킹 리스트 모달 열기');
        
        // 피킹 리스트 모달이 없으면 동적으로 로드
        let modal = document.getElementById('picking-list-modal');
        if (!modal) {
            console.log('📦 피킹 리스트 모달이 없습니다. 동적 로드 시작...');
            await loadPickingListModal();
            modal = document.getElementById('picking-list-modal');
        }
        
        if (!modal) {
            throw new Error('피킹 리스트 모달을 찾을 수 없습니다.');
        }
        
        // 모달에 데이터 표시
        displayPickingData(modal, pickingData);
        
        // 모달 표시
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        console.log('✅ 피킹 리스트 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 피킹 리스트 모달 열기 실패:', error);
        throw error;
    }
}

// 피킹 데이터를 모달에 표시
function displayPickingData(modal, pickingData) {
    try {
        console.log('📊 피킹 데이터 모달 표시');
        
        // 요약 정보 업데이트
        const totalOrdersEl = modal.querySelector('#picking-total-orders');
        const totalItemsEl = modal.querySelector('#picking-total-items');
        const estimatedTimeEl = modal.querySelector('#picking-estimated-time');
        
        if (totalOrdersEl) totalOrdersEl.textContent = pickingData.totalOrders;
        if (totalItemsEl) totalItemsEl.textContent = pickingData.totalItems;
        if (estimatedTimeEl) estimatedTimeEl.textContent = pickingData.estimatedTime;
        
        // 상품별 피킹 리스트 표시 (테이블 형태)
        const productListEl = modal.querySelector('#picking-product-list');
        if (productListEl) {
            console.log('🔍 상품별 피킹 데이터:', pickingData.productSummary);
            productListEl.innerHTML = pickingData.productSummary.map((product, index) => {
                console.log(`🔍 상품 ${index}:`, product);
                return `
                    <tr class="hover:bg-section transition-colors">
                        <td class="border border-gray-300 px-2 text-center font-semibold bg-section">${index + 1}</td>
                        <td class="border border-gray-300 px-2 font-medium text-left td-primary">${product.name || '상품명 없음'}</td>
                        <td class="border border-gray-300 px-2 text-center">
                            <span class="badge badge-info">
                                ${product.size || '기본'}
                            </span>
                        </td>
                        <td class="border border-gray-300 px-2 text-center font-semibold text-info">${product.totalQuantity || 0}</td>
                        <td class="border border-gray-300 px-2 text-center">${product.orders ? product.orders.length : 0}</td>
                        <td class="border border-gray-300 px-2 text-right font-semibold text-brand">${(product.totalAmount || 0).toLocaleString()}원</td>
                    </tr>
                `;
            }).join('');
        }
        
        // 고객별 포장 리스트 표시 (테이블 형태)
        const customerListEl = modal.querySelector('#picking-customer-list');
        if (customerListEl) {
            customerListEl.innerHTML = pickingData.customerSummary.map(customer => {
                const productList = customer.orders.map(order => {
                    const items = order.items ?? [];
                    return items.map(item => {
                        const productName = item.product_name || item.name || item.title || '상품명 없음';
                        const quantity = item.quantity || item.qty || 1;
                        return `${productName} x${quantity}`;
                    }).join(', ');
                }).join(' | ');
                
                return `
                    <tr class="hover:bg-section transition-colors">
                        <td class="border border-gray-300 px-2 font-medium td-primary">${customer.name}</td>
                        <td class="border border-gray-300 px-2 td-secondary">${customer.phone}</td>
                        <td class="border border-gray-300 px-2 text-center font-semibold text-info">${customer.orders.length}</td>
                        <td class="border border-gray-300 px-2 text-right font-semibold text-brand">${customer.total_amount.toLocaleString()}원</td>
                        <td class="border border-gray-300 px-2 td-muted">${productList}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // 모달 이벤트 리스너 연결
        attachPickingModalEventListeners(modal, pickingData);
        
        console.log('✅ 피킹 데이터 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 피킹 데이터 모달 표시 실패:', error);
    }
}

// 피킹 모달 이벤트 리스너 연결
function attachPickingModalEventListeners(modal, pickingData) {
    try {
        console.log('🔗 피킹 모달 이벤트 리스너 연결');
        
        // 닫기 버튼
        const closeBtn = modal.querySelector('#close-picking-list-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
        }
        
        const closeBtn2 = modal.querySelector('#close-picking-list-modal-btn');
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
        }
        
        // 미리보기 버튼들
        const previewPickingOnlyBtn = modal.querySelector('#preview-picking-only');
        if (previewPickingOnlyBtn) {
            previewPickingOnlyBtn.addEventListener('click', () => {
                openPickingPreviewModal(pickingData, 'picking-only');
            });
        }
        
        const previewPackagingOnlyBtn = modal.querySelector('#preview-packaging-only');
        if (previewPackagingOnlyBtn) {
            previewPackagingOnlyBtn.addEventListener('click', () => {
                openPickingPreviewModal(pickingData, 'packaging-only');
            });
        }
        
        const previewFullBtn = modal.querySelector('#preview-picking-list');
        if (previewFullBtn) {
            previewFullBtn.addEventListener('click', () => {
                openPickingPreviewModal(pickingData, 'full');
            });
        }
        
        console.log('✅ 피킹 모달 이벤트 리스너 연결 완료');
        
    } catch (error) {
        console.error('❌ 피킹 모달 이벤트 리스너 연결 실패:', error);
    }
}

// 피킹 미리보기 모달 열기
async function openPickingPreviewModal(pickingData, type) {
    try {
        console.log('👁️ 피킹 미리보기 모달 열기:', type);
        
        // 피킹 미리보기 모달이 없으면 동적으로 로드
        let modal = document.getElementById('picking-preview-modal');
        if (!modal) {
            console.log('📦 피킹 미리보기 모달이 없습니다. 동적 로드 시작...');
            await loadPickingPreviewModal();
            modal = document.getElementById('picking-preview-modal');
        }
        
        if (!modal) {
            throw new Error('피킹 미리보기 모달을 찾을 수 없습니다.');
        }
        
        // 미리보기 내용 생성
        let previewHTML = '';
        console.log('🔍 사용 가능한 전역 함수들:', {
            generatePickingListHTML: !!window.generatePickingListHTML,
            generatePickingOnlyHTML: !!window.generatePickingOnlyHTML,
            generatePackagingOnlyHTML: !!window.generatePackagingOnlyHTML
        });
        
        switch (type) {
            case 'picking-only':
                if (window.generatePickingOnlyHTML) {
                    previewHTML = window.generatePickingOnlyHTML(pickingData);
                } else {
                    console.error('❌ generatePickingOnlyHTML 함수를 찾을 수 없습니다');
                    previewHTML = '<div class="p-4 text-center text-danger"><p>상품별 피킹 HTML 생성 함수를 찾을 수 없습니다.</p><p>orderPrint.js 파일이 로드되었는지 확인해주세요.</p></div>';
                }
                break;
            case 'packaging-only':
                console.log('🔍 고객별 포장 미리보기 시도:', {
                    generatePackagingOnlyHTML: !!window.generatePackagingOnlyHTML,
                    pickingData: pickingData
                });
                if (window.generatePackagingOnlyHTML) {
                    try {
                        previewHTML = window.generatePackagingOnlyHTML(pickingData);
                        console.log('✅ 고객별 포장 미리보기 HTML 생성 성공');
                    } catch (error) {
                        console.error('❌ 고객별 포장 미리보기 HTML 생성 실패:', error);
                        previewHTML = '<div class="p-4 text-center text-danger"><p>고객별 포장 HTML 생성 중 오류가 발생했습니다: ' + error.message + '</p></div>';
                    }
                } else {
                    console.error('❌ generatePackagingOnlyHTML 함수를 찾을 수 없습니다');
                    previewHTML = '<div class="p-4 text-center text-danger"><p>고객별 포장 HTML 생성 함수를 찾을 수 없습니다.</p><p>orderPrint.js 파일이 로드되었는지 확인해주세요.</p></div>';
                }
                break;
            case 'full':
            default:
                if (window.generatePickingListHTML) {
                    previewHTML = window.generatePickingListHTML(pickingData);
                } else {
                    console.error('❌ generatePickingListHTML 함수를 찾을 수 없습니다');
                    previewHTML = '<div class="p-4 text-center text-danger"><p>전체 피킹 HTML 생성 함수를 찾을 수 없습니다.</p><p>orderPrint.js 파일이 로드되었는지 확인해주세요.</p></div>';
                }
                break;
        }
        
        // 미리보기 내용 표시
        const contentEl = modal.querySelector('#picking-preview-content');
        if (contentEl) {
            contentEl.innerHTML = previewHTML;
        }
        
        // 모달 표시
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // 미리보기 모달 이벤트 리스너 연결
        attachPickingPreviewModalEventListeners(modal, pickingData, type);
        
        console.log('✅ 피킹 미리보기 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 피킹 미리보기 모달 열기 실패:', error);
    }
}

// 피킹 미리보기 모달 이벤트 리스너 연결
function attachPickingPreviewModalEventListeners(modal, pickingData, type) {
    try {
        console.log('🔗 피킹 미리보기 모달 이벤트 리스너 연결');
        
        // 닫기 버튼
        const closeBtn = modal.querySelector('#close-picking-preview-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
        }
        
        const closeBtn2 = modal.querySelector('#close-picking-preview-modal-btn');
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
        }
        
        // 출력 버튼
        const printBtn = modal.querySelector('#print-picking-preview');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                // 미리보기 모달의 내용을 바로 인쇄
                printPreviewContent();
            });
        }
        
        console.log('✅ 피킹 미리보기 모달 이벤트 리스너 연결 완료');
        
    } catch (error) {
        console.error('❌ 피킹 미리보기 모달 이벤트 리스너 연결 실패:', error);
    }
}

// 피킹 리스트 출력
function printPickingList(pickingData, type) {
    try {
        console.log('🖨️ 피킹 리스트 출력:', type);
        
        let printHTML = '';
        console.log('🖨️ 출력용 함수 확인:', {
            generatePickingListHTML: !!window.generatePickingListHTML,
            generatePickingOnlyHTML: !!window.generatePickingOnlyHTML,
            generatePackagingOnlyHTML: !!window.generatePackagingOnlyHTML
        });
        
        switch (type) {
            case 'picking-only':
                if (window.generatePickingOnlyHTML) {
                    printHTML = window.generatePickingOnlyHTML(pickingData);
                } else {
                    console.error('❌ 출력용 generatePickingOnlyHTML 함수를 찾을 수 없습니다');
                    alert('상품별 피킹 HTML 생성 함수를 찾을 수 없습니다. orderPrint.js 파일이 로드되었는지 확인해주세요.');
                    return;
                }
                break;
            case 'packaging-only':
                console.log('🔍 고객별 포장 출력 시도:', {
                    generatePackagingOnlyHTML: !!window.generatePackagingOnlyHTML,
                    pickingData: pickingData
                });
                if (window.generatePackagingOnlyHTML) {
                    try {
                        printHTML = window.generatePackagingOnlyHTML(pickingData);
                        console.log('✅ 고객별 포장 HTML 생성 성공');
                    } catch (error) {
                        console.error('❌ 고객별 포장 HTML 생성 실패:', error);
                        alert('고객별 포장 HTML 생성 중 오류가 발생했습니다: ' + error.message);
                        return;
                    }
                } else {
                    console.error('❌ 출력용 generatePackagingOnlyHTML 함수를 찾을 수 없습니다');
                    alert('고객별 포장 HTML 생성 함수를 찾을 수 없습니다. orderPrint.js 파일이 로드되었는지 확인해주세요.');
                    return;
                }
                break;
            case 'full':
            default:
                if (window.generatePickingListHTML) {
                    printHTML = window.generatePickingListHTML(pickingData);
                } else {
                    console.error('❌ 출력용 generatePickingListHTML 함수를 찾을 수 없습니다');
                    alert('전체 피킹 HTML 생성 함수를 찾을 수 없습니다. orderPrint.js 파일이 로드되었는지 확인해주세요.');
                    return;
                }
                break;
        }
        
        if (printHTML) {
            // 새 창에서 출력
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('팝업이 차단되었습니다. 브라우저 팝업 차단을 해제 후 다시 시도해주세요.');
                return;
            }
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();

            // 인쇄 대화상자 열기 → 완료 후 창 닫기
            setTimeout(() => {
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
            }, 500);
        } else {
            alert('출력할 내용을 생성할 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 피킹 리스트 출력 실패:', error);
        alert('출력 중 오류가 발생했습니다: ' + error.message);
    }
}

// 미리보기 내용 인쇄
function printPreviewContent() {
    try {
        console.log('🖨️ 미리보기 내용 인쇄 시작');
        
        // 미리보기 모달의 내용 가져오기
        const previewContent = document.getElementById('picking-preview-content');
        if (!previewContent) {
            console.error('❌ 미리보기 내용을 찾을 수 없습니다');
            alert('미리보기 내용을 찾을 수 없습니다.');
            return;
        }
        
        // 미리보기 내용의 HTML 가져오기
        const contentHTML = previewContent.innerHTML;
        
        // 새 창에서 인쇄
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('팝업이 차단되었습니다. 브라우저 팝업 차단을 해제 후 다시 시도해주세요.');
            return;
        }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>피킹 리스트 인쇄</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Malgun Gothic', sans-serif;
                        padding: 20px;
                        background: white;
                    }
                    @media print {
                        body { margin: 0; padding: 16px; }
                    }
                </style>
            </head>
            <body>
                ${contentHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        // 인쇄 대화상자 열기 → 완료 후 창 닫기
        setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
        }, 500);
        
    } catch (error) {
        console.error('❌ 미리보기 내용 인쇄 실패:', error);
        alert('인쇄 중 오류가 발생했습니다: ' + error.message);
    }
}

// 피킹 리스트 모달 동적 로드
async function loadPickingListModal() {
    try {
        console.log('📦 피킹 리스트 모달 컴포넌트 로드 중...');
        
        const response = await fetch('components/modals/picking-list-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 피킹 리스트 모달 컴포넌트 로드 완료');
        
        // 피킹 리스트 모달 닫기 이벤트 리스너 추가
        const closePickingListModal = document.getElementById('close-picking-list-modal');
        if (closePickingListModal) {
            closePickingListModal.addEventListener('click', function() {
                console.log('❌ 피킹 리스트 모달 닫기');
                const modal = document.getElementById('picking-list-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            });
            console.log('✅ 피킹 리스트 모달 닫기 이벤트 리스너 추가 완료');
        }
        
    } catch (error) {
        console.error('❌ 피킹 리스트 모달 로드 실패:', error);
        throw error;
    }
}

// 피킹 미리보기 모달 동적 로드
async function loadPickingPreviewModal() {
    try {
        console.log('📦 피킹 미리보기 모달 컴포넌트 로드 중...');
        
        const response = await fetch('components/modals/picking-preview-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 피킹 미리보기 모달 컴포넌트 로드 완료');
        
    } catch (error) {
        console.error('❌ 피킹 미리보기 모달 로드 실패:', error);
        throw error;
    }
}

// 배송비 관리 섹션 표시 함수 (주문관리에서만 사용)
function showShippingSettingsSection() {
    console.log('🔄 배송비 관리 섹션 표시 시작');
    
    try {
        // 주문관리 섹션이 현재 활성화되어 있는지 확인
        const ordersSection = document.getElementById('orders-section');
        if (!ordersSection) {
            console.log('⚠️ 주문관리 섹션을 찾을 수 없음 - 배송비 관리 섹션 생성 건너뜀');
            return;
        }
        
        // 주문관리 섹션이 현재 표시되어 있는지 확인
        const isOrdersSectionVisible = ordersSection.style.display !== 'none' && 
                                      ordersSection.style.visibility !== 'hidden' &&
                                      ordersSection.style.opacity !== '0';
        
        if (!isOrdersSectionVisible) {
            console.log('⚠️ 주문관리 섹션이 비활성화 상태 - 배송비 관리 섹션 생성 건너뜀');
            return;
        }
        
        // 모든 섹션 숨기기
        const allSections = document.querySelectorAll('.section-content');
        allSections.forEach(section => {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.style.opacity = '0';
        });
        
        // 배송비 관리 섹션 찾기 또는 생성
        let shippingSettingsSection = document.getElementById('shipping-settings-section');
        
        if (!shippingSettingsSection) {
            console.log('🔧 배송비 관리 섹션이 없어서 동적 생성');
            shippingSettingsSection = createShippingSettingsSection();
        }
        
        if (shippingSettingsSection) {
            shippingSettingsSection.style.display = 'block';
            shippingSettingsSection.style.visibility = 'visible';
            shippingSettingsSection.style.opacity = '1';
            console.log('✅ 배송비 관리 섹션 표시 완료');
        } else {
            console.error('❌ 배송비 관리 섹션 생성 실패');
            alert('배송비 관리 섹션을 생성할 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 배송비 관리 섹션 표시 실패:', error);
        alert('배송비 관리 섹션을 표시할 수 없습니다.');
    }
}

// 배송비 관리 섹션 동적 생성 함수
function createShippingSettingsSection() {
    console.log('🔧 배송비 관리 섹션 동적 생성 시작');
    
    try {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('❌ mainContent를 찾을 수 없습니다');
            return null;
        }
        
        // 배송비 관리 섹션 HTML 생성
        const shippingHTML = `
            <div id="shipping-settings-section" class="section-content">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <!-- 헤더 -->
                    <div class="border-b border-gray-200 p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="fas fa-truck mr-2 text-purple-600"></i>
                                <h2 class="text-xl font-semibold text-heading">배송비 관리</h2>
                            </div>
                            <button id="add-shipping-btn" class="btn-purple">
                                <i class="fas fa-plus mr-2"></i>새 배송비 규칙 추가
                            </button>
                        </div>
                        <p class="text-body mt-2">배송비 정책을 관리하고 설정합니다.</p>
                    </div>

                    <!-- 배송비 규칙 목록 -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-ui">
                            <thead class="bg-section">
                                <tr>
                                    <th class="px-6 text-left">규칙명</th>
                                    <th class="px-6 text-left">적용 조건</th>
                                    <th class="px-6 text-left">배송비</th>
                                    <th class="px-6 text-left">우선순위</th>
                                    <th class="px-6 text-left">상태</th>
                                    <th class="px-6 text-left">작업</th>
                                </tr>
                            </thead>
                            <tbody id="shipping-rules-table-body">
                                <!-- 배송비 규칙들이 여기에 동적으로 추가됩니다 -->
                                <tr>
                                    <td colspan="6" class="px-6 text-center text-muted">
                                        <div class="flex flex-col items-center space-y-2">
                                            <i class="fas fa-truck text-muted text-2xl"></i>
                                            <p class="text-sm">등록된 배송비 규칙이 없습니다</p>
                                            <p class="text-xs text-muted">새 배송비 규칙을 추가해보세요</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 기본 배송비 설정 -->
                    <div class="border-t border-gray-200 p-6">
                        <h3 class="text-lg font-medium text-heading mb-4">기본 배송비 설정</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-section p-4 rounded-lg">
                                <label class="block text-sm font-medium text-body mb-2">기본 배송비</label>
                                <div class="flex items-center">
                                    <input type="number" id="default-shipping-fee" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="4000">
                                    <span class="ml-2 text-sm text-body">원</span>
                                </div>
                            </div>
                            <div class="bg-section p-4 rounded-lg">
                                <label class="block text-sm font-medium text-body mb-2">무료배송 기준</label>
                                <div class="flex items-center">
                                    <input type="number" id="free-shipping-threshold" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="50000">
                                    <span class="ml-2 text-sm text-body">원 이상</span>
                                </div>
                            </div>
                            <div class="bg-section p-4 rounded-lg">
                                <label class="block text-sm font-medium text-body mb-2">당일배송비</label>
                                <div class="flex items-center">
                                    <input type="number" id="express-shipping-fee" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="8000">
                                    <span class="ml-2 text-sm text-body">원</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end">
                            <button id="save-shipping-settings" class="btn-info">
                                <i class="fas fa-save mr-2"></i>설정 저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // HTML 삽입 (주문관리 섹션 내에서만)
        const ordersSection = document.getElementById('orders-section');
        if (ordersSection) {
            ordersSection.insertAdjacentHTML('beforeend', shippingHTML);
        } else {
            mainContent.insertAdjacentHTML('beforeend', shippingHTML);
        }
        
        // 배송비 규칙 추가 모달 생성
        createShippingRuleModal();
        
        // 이벤트 리스너 추가
        setupShippingSettingsEventListeners();
        
        console.log('✅ 배송비 관리 섹션 동적 생성 완료');
        return document.getElementById('shipping-settings-section');
        
    } catch (error) {
        console.error('❌ 배송비 관리 섹션 생성 실패:', error);
        return null;
    }
}

// 배송비 관리 섹션 이벤트 리스너 설정
function setupShippingSettingsEventListeners() {
    console.log('🔗 배송비 관리 이벤트 리스너 설정');
    
    // Supabase 연결 상태 확인
    const supabaseClient = window.supabaseClient || window.supabase;
    if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        console.warn('⚠️ Supabase가 연결되지 않음 - 배송비 관리 기능 제한');
        
        // 연결되지 않은 경우 기본값으로 설정
        const defaultFeeInput = document.getElementById('default-shipping-fee');
        const freeThresholdInput = document.getElementById('free-shipping-threshold');
        const expressFeeInput = document.getElementById('express-shipping-fee');
        
        if (defaultFeeInput) defaultFeeInput.value = 0;
        if (freeThresholdInput) freeThresholdInput.value = 0;
        if (expressFeeInput) expressFeeInput.value = 0;
        
        // 경고 메시지 표시
        const warningDiv = document.createElement('div');
        warningDiv.className = 'bg-danger border border-red-200 rounded-lg p-4 mb-4';
        warningDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-danger mr-2"></i>
                <span class="text-red-800 text-sm">
                    데이터베이스 연결이 필요합니다. Supabase 설정을 확인해주세요.
                </span>
            </div>
        `;
        
        const settingsSection = document.querySelector('#shipping-settings-section .border-t');
        if (settingsSection) {
            settingsSection.parentNode.insertBefore(warningDiv, settingsSection);
        }
        
        return;
    }
    
    // 새 배송비 규칙 추가 버튼 (테이블이 없으므로 비활성화)
    const addShippingBtn = document.getElementById('add-shipping-btn');
    if (addShippingBtn) {
        addShippingBtn.addEventListener('click', function() {
            console.log('➕ 새 배송비 규칙 추가 버튼 클릭');
            alert('배송비 규칙 기능은 준비 중입니다. 기본 배송비 설정만 사용 가능합니다.');
            // showAddShippingRuleModal();
        });
    }
    
    // 설정 저장 버튼
    const saveSettingsBtn = document.getElementById('save-shipping-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            console.log('💾 배송비 설정 저장 버튼 클릭');
            saveShippingSettings();
        });
    }
    
    // 기존 설정 로드 (Supabase 연결 확인 후)
    // 주문관리에서는 배송비 설정을 로드하지 않음 (배송관리에서만 관리)
    console.log('📋 주문관리에서는 배송비 설정 로드를 건너뜀');
}

// 배송비 설정 로드
async function loadShippingSettings() {
    console.log('🔄 배송비 설정 로드 시작');
    
    // 함수 시작 시 즉시 Supabase 연결 상태 확인
    const supabaseClient = window.supabaseClient || window.supabase;
    if (!supabaseClient || 
        typeof supabaseClient !== 'object' || 
        typeof supabaseClient.from !== 'function') {
        console.warn('⚠️ loadShippingSettings: Supabase 연결되지 않음 - 함수 종료');
        return;
    }
    
    try {
        // 기본값 설정
        let defaultFee = 0;
        let freeThreshold = 0;
        let expressFee = 0;
        
        // Supabase 연결 상태 강력 확인
        if (supabaseClient && 
            typeof supabaseClient === 'object' && 
            typeof supabaseClient.from === 'function') {
            
            console.log('📡 Supabase 연결 확인됨, 데이터베이스에서 설정 로드');
            
            try {
                const { data, error } = await supabaseClient
                    .from('shipping_settings')
                    .select('*')
                    .eq('setting_name', '기본 배송비 정책')
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    console.error('❌ 배송비 설정 조회 실패:', error);
                } else if (data) {
                    defaultFee = parseFloat(data.default_shipping_fee) || 0;
                    freeThreshold = parseFloat(data.free_shipping_threshold) || 0;
                    expressFee = parseFloat(data.express_shipping_fee) || 0;
                    console.log('✅ 데이터베이스에서 배송비 설정 로드 완료');
                }
            } catch (dbError) {
                console.error('❌ 데이터베이스 조회 중 오류:', dbError);
            }
        } else {
            console.warn('⚠️ Supabase가 초기화되지 않았거나 연결되지 않음');
            console.log('🔍 Supabase 상태:', {
                exists: !!supabaseClient,
                type: typeof supabaseClient,
                hasFrom: supabaseClient ? typeof supabaseClient.from : 'N/A'
            });
        }
        
        // 환경설정에서도 시도
        if (defaultFee === 0 && window.settingsDataManager) {
            try {
                const settings = await window.settingsDataManager.loadSettings();
                defaultFee = settings.shipping?.defaultShippingFee || 0;
                freeThreshold = settings.shipping?.freeShippingThreshold || 0;
                expressFee = settings.shipping?.expressShippingFee || 0;
                console.log('📋 환경설정에서 배송비 설정 로드:', { defaultFee, freeThreshold, expressFee });
            } catch (settingsError) {
                console.error('❌ 환경설정 조회 실패:', settingsError);
            }
        }
        
        // 폼에 값 설정
        const defaultFeeInput = document.getElementById('default-shipping-fee');
        const freeThresholdInput = document.getElementById('free-shipping-threshold');
        const expressFeeInput = document.getElementById('express-shipping-fee');
        
        if (defaultFeeInput) defaultFeeInput.value = defaultFee;
        if (freeThresholdInput) freeThresholdInput.value = freeThreshold;
        if (expressFeeInput) expressFeeInput.value = expressFee;
        
        console.log('✅ 배송비 설정 로드 완료:', { defaultFee, freeThreshold, expressFee });
        
    } catch (error) {
        console.error('❌ 배송비 설정 로드 실패:', error);
        
        // 오류 발생 시 기본값으로 설정
        const defaultFeeInput = document.getElementById('default-shipping-fee');
        const freeThresholdInput = document.getElementById('free-shipping-threshold');
        const expressFeeInput = document.getElementById('express-shipping-fee');
        
        if (defaultFeeInput) defaultFeeInput.value = 0;
        if (freeThresholdInput) freeThresholdInput.value = 0;
        if (expressFeeInput) expressFeeInput.value = 0;
    }
}

// 배송비 설정 저장
async function saveShippingSettings() {
    console.log('🔄 배송비 설정 저장 시작');
    
    // 함수 시작 시 즉시 Supabase 연결 상태 확인
    const supabaseClient = window.supabaseClient || window.supabase;
    if (!supabaseClient || 
        typeof supabaseClient !== 'object' || 
        typeof supabaseClient.from !== 'function') {
        console.warn('⚠️ saveShippingSettings: Supabase 연결되지 않음 - 로컬 스토리지에 저장');
        
        // 로컬 스토리지에 저장
        const defaultFee = parseInt(document.getElementById('default-shipping-fee')?.value) || 0;
        const freeThreshold = parseInt(document.getElementById('free-shipping-threshold')?.value) || 0;
        const expressFee = parseInt(document.getElementById('express-shipping-fee')?.value) || 0;
        
        try {
            const settings = {
                shipping: {
                    defaultShippingFee: defaultFee,
                    freeShippingThreshold: freeThreshold,
                    expressShippingFee: expressFee
                }
            };
            
            localStorage.setItem('farm_settings', JSON.stringify(settings));
            console.log('💾 로컬 스토리지에 배송비 설정 저장');
            alert('배송비 설정이 로컬에 저장되었습니다. (데이터베이스 연결 필요)');
            
            // 주문 등록 폼의 배송비 필드도 업데이트
            updateOrderFormShippingFee(defaultFee);
            
        } catch (storageError) {
            console.error('❌ 로컬 스토리지 저장 실패:', storageError);
            alert('배송비 설정 저장에 실패했습니다.');
        }
        return;
    }
    
    try {
        const defaultFee = parseInt(document.getElementById('default-shipping-fee')?.value) || 0;
        const freeThreshold = parseInt(document.getElementById('free-shipping-threshold')?.value) || 0;
        const expressFee = parseInt(document.getElementById('express-shipping-fee')?.value) || 0;
        
        console.log('💾 저장할 배송비 설정:', { defaultFee, freeThreshold, expressFee });
        
        // Supabase 연결 상태 강력 확인
        if (supabaseClient && 
            typeof supabaseClient === 'object' && 
            typeof supabaseClient.from === 'function') {
            console.log('📡 Supabase 연결 확인됨, 데이터베이스에 저장');
            
            try {
                const { data, error } = await supabaseClient
                    .from('shipping_settings')
                    .upsert({
                        setting_name: '기본 배송비 정책',
                        default_shipping_fee: defaultFee,
                        free_shipping_threshold: freeThreshold,
                        express_shipping_fee: expressFee,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'setting_name'
                    })
                    .select();
                
                if (error) {
                    console.error('❌ 배송비 설정 저장 실패:', error);
                    alert('배송비 설정 저장에 실패했습니다: ' + error.message);
                    return;
                }
                
                console.log('✅ 배송비 설정 저장 완료');
                alert('배송비 설정이 저장되었습니다.');
                
                // 주문 등록 폼의 배송비 필드도 업데이트
                updateOrderFormShippingFee(defaultFee);
                
            } catch (dbError) {
                console.error('❌ 데이터베이스 저장 중 오류:', dbError);
                alert('데이터베이스 저장 중 오류가 발생했습니다: ' + dbError.message);
            }
        } else {
            console.warn('⚠️ Supabase가 초기화되지 않았거나 연결되지 않음');
            alert('데이터베이스 연결이 필요합니다. Supabase 설정을 확인해주세요.');
        }
    } catch (error) {
        console.error('❌ 배송비 설정 저장 실패:', error);
        alert('배송비 설정 저장 중 오류가 발생했습니다.');
    }
}

// 새 배송비 규칙 추가 모달 표시
function showAddShippingRuleModal() {
    console.log('🔄 새 배송비 규칙 추가 모달 표시');
    
    // 간단한 모달 대신 prompt 사용
    const ruleName = prompt('배송비 규칙명을 입력하세요:');
    if (!ruleName) return;
    
    const minAmount = prompt('최소 주문금액을 입력하세요 (0이면 제한없음):');
    if (minAmount === null) return;
    
    const maxAmount = prompt('최대 주문금액을 입력하세요 (0이면 제한없음):');
    if (maxAmount === null) return;
    
    const shippingFee = prompt('배송비를 입력하세요:');
    if (!shippingFee) return;
    
    // 배송비 규칙 추가
    addShippingRule({
        name: ruleName,
        min_amount: parseInt(minAmount) || 0,
        max_amount: parseInt(maxAmount) || 0,
        shipping_fee: parseInt(shippingFee)
    });
}

// 배송비 규칙 추가
async function addShippingRule(rule) {
    console.log('🔄 배송비 규칙 추가:', rule);
    
    try {
        // Supabase 연결 상태 강력 확인
        const supabaseClient = window.supabaseClient || window.supabase;
        if (supabaseClient && 
            typeof supabaseClient === 'object' && 
            typeof supabaseClient.from === 'function') {
            console.log('📡 Supabase 연결 확인됨, 배송비 규칙 추가');
            
            try {
                const { data, error } = await supabaseClient
                    .from('farm_shipping_rules')
                    .insert({
                        id: 'rule_' + Date.now(),
                        name: rule.name,
                        min_amount: rule.min_amount,
                        max_amount: rule.max_amount,
                        shipping_fee: rule.shipping_fee,
                        is_active: true
                    })
                    .select();
                
                if (error) {
                    console.error('❌ 배송비 규칙 추가 실패:', error);
                    alert('배송비 규칙 추가에 실패했습니다: ' + error.message);
                    return;
                }
                
                console.log('✅ 배송비 규칙 추가 완료');
                alert('배송비 규칙이 추가되었습니다.');
                
                // 테이블 새로고침 (테이블이 없으므로 비활성화)
                // loadShippingRules();
                
            } catch (dbError) {
                console.error('❌ 데이터베이스 저장 중 오류:', dbError);
                alert('데이터베이스 저장 중 오류가 발생했습니다: ' + dbError.message);
            }
        } else {
            console.warn('⚠️ Supabase가 초기화되지 않았거나 연결되지 않음');
            alert('데이터베이스 연결이 필요합니다. Supabase 설정을 확인해주세요.');
        }
    } catch (error) {
        console.error('❌ 배송비 규칙 추가 실패:', error);
        alert('배송비 규칙 추가 중 오류가 발생했습니다.');
    }
}

// 배송비 규칙 목록 로드
async function loadShippingRules() {
    console.log('🔄 배송비 규칙 목록 로드');
    
    try {
        // Supabase 연결 상태 강력 확인
        const supabaseClient = window.supabaseClient || window.supabase;
        if (supabaseClient && 
            typeof supabaseClient === 'object' && 
            typeof supabaseClient.from === 'function') {
            console.log('📡 Supabase 연결 확인됨, 배송비 규칙 목록 로드');
            
            try {
                const { data, error } = await supabaseClient
                    .from('farm_shipping_rules')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error('❌ 배송비 규칙 조회 실패:', error);
                    // 빈 테이블 표시
                    updateShippingRulesTable([]);
                    return;
                }
                
                // 테이블 업데이트
                updateShippingRulesTable(data || []);
                console.log('✅ 배송비 규칙 목록 로드 완료');
                
            } catch (dbError) {
                console.error('❌ 데이터베이스 조회 중 오류:', dbError);
                // 빈 테이블 표시
                updateShippingRulesTable([]);
            }
        } else {
            console.warn('⚠️ Supabase가 초기화되지 않았거나 연결되지 않음');
            // 빈 테이블 표시
            updateShippingRulesTable([]);
        }
    } catch (error) {
        console.error('❌ 배송비 규칙 목록 로드 실패:', error);
        // 빈 테이블 표시
        updateShippingRulesTable([]);
    }
}

// 배송비 규칙 테이블 업데이트
function updateShippingRulesTable(rules) {
    console.log('🔄 배송비 규칙 테이블 업데이트:', rules);
    
    const tbody = document.getElementById('shipping-table-body');
    if (!tbody) return;
    
    if (rules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 text-center text-muted">
                    배송비 규칙이 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = rules.map(rule => `
        <tr>
            <td class="px-6 whitespace-nowrap font-medium td-primary">${rule.name}</td>
            <td class="px-6 whitespace-nowrap td-secondary">
                ${rule.min_amount > 0 ? rule.min_amount.toLocaleString() + '원 이상' : '제한없음'}
                ${rule.max_amount > 0 ? ' ~ ' + rule.max_amount.toLocaleString() + '원' : ''}
            </td>
            <td class="px-6 whitespace-nowrap td-primary">${rule.shipping_fee.toLocaleString()}원</td>
            <td class="px-6 whitespace-nowrap">
                <span class="badge ${rule.is_active ? 'badge-success' : 'badge-danger'}">
                    ${rule.is_active ? '활성' : '비활성'}
                </span>
            </td>
            <td class="px-6 whitespace-nowrap font-medium">
                <button onclick="toggleShippingRule('${rule.id}', ${!rule.is_active})" class="text-indigo-600 hover:text-indigo-900 mr-2">
                    ${rule.is_active ? '비활성화' : '활성화'}
                </button>
                <button onclick="deleteShippingRule('${rule.id}')" class="text-danger hover:text-red-900">
                    삭제
                </button>
            </td>
        </tr>
    `).join('');
}

// 배송비 규칙 활성화/비활성화
async function toggleShippingRule(ruleId, isActive) {
    console.log('🔄 배송비 규칙 상태 변경:', ruleId, isActive);
    
    try {
        if (window.supabase) {
            const { error } = await window.supabase
                .from('farm_shipping_rules')
                .update({ is_active: isActive })
                .eq('id', ruleId);
            
            if (error) {
                console.error('❌ 배송비 규칙 상태 변경 실패:', error);
                alert('상태 변경에 실패했습니다.');
                return;
            }
            
            console.log('✅ 배송비 규칙 상태 변경 완료');
            loadShippingRules(); // 테이블 새로고침
        }
    } catch (error) {
        console.error('❌ 배송비 규칙 상태 변경 실패:', error);
    }
}

// 배송비 규칙 삭제
async function deleteShippingRule(ruleId) {
    console.log('🔄 배송비 규칙 삭제:', ruleId);
    
    if (!confirm('정말로 이 배송비 규칙을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        if (window.supabase) {
            const { error } = await window.supabase
                .from('farm_shipping_rules')
                .delete()
                .eq('id', ruleId);
            
            if (error) {
                console.error('❌ 배송비 규칙 삭제 실패:', error);
                alert('삭제에 실패했습니다.');
                return;
            }
            
            console.log('✅ 배송비 규칙 삭제 완료');
            loadShippingRules(); // 테이블 새로고침
        }
    } catch (error) {
        console.error('❌ 배송비 규칙 삭제 실패:', error);
    }
}

// 주문 등록 폼의 배송비 필드 업데이트 (주문별 최종값: 사용자가 이미 수정했으면 덮어쓰지 않음)
function updateOrderFormShippingFee(shippingFee) {
    console.log('🔄 주문 등록 폼 배송비 제안:', shippingFee);
    try {
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (!shippingFeeInput) {
            console.log('⚠️ 주문 등록 폼이 열려있지 않습니다');
            return;
        }
        if (window._shippingFeeUserEdited) {
            console.log('⚠️ 사용자가 배송비를 수정함 — 제안값으로 덮어쓰지 않음');
            return;
        }
        shippingFeeInput.value = shippingFee;
        if (window.updateShippingFeeDisplay) window.updateShippingFeeDisplay(shippingFee);
        if (window.updateCartTotal) window.updateCartTotal();
        else if (window.updateOrderTotalDisplay) window.updateOrderTotalDisplay();
        console.log('✅ 주문 등록 폼 배송비 제안값 적용 완료');
    } catch (error) {
        console.error('❌ 주문 등록 폼 배송비 업데이트 실패:', error);
    }
}

// 배송비 규칙 추가 모달 생성
function createShippingRuleModal() {
    console.log('🔧 배송비 규칙 추가 모달 생성');
    
    const modalHTML = `
        <!-- 배송비 규칙 추가 모달 -->
        <div id="shipping-rule-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    <!-- 모달 헤더 -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-200">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-purple-accent rounded-lg flex items-center justify-center">
                                <i class="fas fa-plus text-purple-600"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-heading">새 배송비 규칙 추가</h3>
                                <p class="text-sm text-body">배송비 규칙을 설정하세요</p>
                            </div>
                        </div>
                        <button id="close-shipping-rule-modal" class="text-muted hover:text-body transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- 모달 콘텐츠 -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <form id="shipping-rule-form" class="space-y-6">
                            <!-- 규칙명 -->
                            <div>
                                <label class="block text-sm font-medium text-body mb-2">규칙명 <span class="text-danger">*</span></label>
                                <input type="text" id="rule-name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="예: 서울/경기 배송비" required>
                            </div>

                            <!-- 적용 조건 -->
                            <div>
                                <label class="block text-sm font-medium text-body mb-2">적용 조건 <span class="text-danger">*</span></label>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-body mb-1">지역</label>
                                        <select id="rule-region" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value="">전체 지역</option>
                                            <option value="서울">서울</option>
                                            <option value="경기">경기</option>
                                            <option value="인천">인천</option>
                                            <option value="강원">강원도</option>
                                            <option value="충북">충청북도</option>
                                            <option value="충남">충청남도</option>
                                            <option value="전북">전라북도</option>
                                            <option value="전남">전라남도</option>
                                            <option value="경북">경상북도</option>
                                            <option value="경남">경상남도</option>
                                            <option value="제주">제주도</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-body mb-1">주문 금액</label>
                                        <div class="flex items-center space-x-2">
                                            <input type="number" id="rule-min-amount" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" min="0">
                                            <span class="text-sm text-body">원 이상</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 배송비 설정 -->
                            <div>
                                <label class="block text-sm font-medium text-body mb-2">배송비 설정 <span class="text-danger">*</span></label>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-body mb-1">배송비</label>
                                        <div class="flex items-center space-x-2">
                                            <input type="number" id="rule-shipping-fee" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="3000" min="0" required>
                                            <span class="text-sm text-body">원</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-body mb-1">무료배송 기준</label>
                                        <div class="flex items-center space-x-2">
                                            <input type="number" id="rule-free-threshold" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="50000" min="0">
                                            <span class="text-sm text-body">원 이상</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 우선순위 및 상태 -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-body mb-2">우선순위</label>
                                    <select id="rule-priority" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="1">1 (최우선)</option>
                                        <option value="2">2</option>
                                        <option value="3" selected>3</option>
                                        <option value="4">4</option>
                                        <option value="5">5 (최후순)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-body mb-2">상태</label>
                                    <select id="rule-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="active" selected>활성</option>
                                        <option value="inactive">비활성</option>
                                    </select>
                                </div>
                            </div>

                            <!-- 설명 -->
                            <div>
                                <label class="block text-sm font-medium text-body mb-2">설명</label>
                                <textarea id="rule-description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="배송비 규칙에 대한 설명을 입력하세요"></textarea>
                            </div>
                        </form>
                    </div>

                    <!-- 모달 푸터 -->
                    <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-section">
                        <button id="cancel-shipping-rule" class="px-4 py-2 text-body bg-white border border-gray-300 rounded-lg hover:bg-section transition-colors">
                            취소
                        </button>
                        <button id="save-shipping-rule" class="btn-purple">
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 모달 HTML을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 이벤트 리스너 설정
    setupShippingRuleModalListeners();
    
    console.log('✅ 배송비 규칙 추가 모달 생성 완료');
}

// 배송비 규칙 모달 이벤트 리스너 설정
function setupShippingRuleModalListeners() {
    // 모달 열기
    const addShippingBtn = document.getElementById('add-shipping-btn');
    if (addShippingBtn) {
        addShippingBtn.addEventListener('click', function() {
            console.log('🚚 배송비 규칙 추가 모달 열기');
            const modal = document.getElementById('shipping-rule-modal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    }
    
    // 모달 닫기
    const closeModal = document.getElementById('close-shipping-rule-modal');
    const cancelBtn = document.getElementById('cancel-shipping-rule');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeShippingRuleModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeShippingRuleModal();
        });
    }
    
    // 저장 버튼
    const saveBtn = document.getElementById('save-shipping-rule');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveShippingRule();
        });
    }
}

// 배송비 규칙 모달 닫기
function closeShippingRuleModal() {
    const modal = document.getElementById('shipping-rule-modal');
    if (modal) {
        modal.classList.add('hidden');
        // 폼 초기화
        document.getElementById('shipping-rule-form').reset();
    }
}

// 배송비 규칙 저장
function saveShippingRule() {
    console.log('💾 배송비 규칙 저장');
    
    const ruleData = {
        name: document.getElementById('rule-name').value,
        region: document.getElementById('rule-region').value,
        minAmount: document.getElementById('rule-min-amount').value,
        shippingFee: document.getElementById('rule-shipping-fee').value,
        freeThreshold: document.getElementById('rule-free-threshold').value,
        priority: document.getElementById('rule-priority').value,
        status: document.getElementById('rule-status').value,
        description: document.getElementById('rule-description').value
    };
    
    // 유효성 검사
    if (!ruleData.name || !ruleData.shippingFee) {
        alert('필수 항목을 입력해주세요.');
        return;
    }
    
    // 배송비 규칙 테이블에 추가
    addShippingRuleToTable(ruleData);
    
    // 모달 닫기
    closeShippingRuleModal();
    
    console.log('✅ 배송비 규칙 저장 완료:', ruleData);
}

// 배송비 규칙을 테이블에 추가
function addShippingRuleToTable(ruleData) {
    const tbody = document.getElementById('shipping-rules-table-body');
    if (!tbody) return;
    
    // 빈 상태 행 제거
    const emptyRow = tbody.querySelector('tr');
    if (emptyRow && emptyRow.querySelector('td[colspan]')) {
        emptyRow.remove();
    }
    
    // 새 행 생성
    const row = document.createElement('tr');
    row.className = 'hover:bg-section';
    row.innerHTML = `
        <td class="px-6 whitespace-nowrap font-medium td-primary">${ruleData.name}</td>
        <td class="px-6 whitespace-nowrap td-secondary">
            ${ruleData.region ? ruleData.region : '전체'} ${ruleData.minAmount ? ruleData.minAmount + '원 이상' : ''}
        </td>
        <td class="px-6 whitespace-nowrap td-secondary">${parseInt(ruleData.shippingFee).toLocaleString()}원</td>
        <td class="px-6 whitespace-nowrap td-secondary">${ruleData.priority}</td>
        <td class="px-6 whitespace-nowrap">
            <span class="badge ${ruleData.status === 'active' ? 'badge-success' : 'badge-neutral'}">
                ${ruleData.status === 'active' ? '활성' : '비활성'}
            </span>
        </td>
        <td class="px-6 whitespace-nowrap font-medium">
            <button onclick="editShippingRule(this)" class="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
            <button onclick="deleteShippingRule(this)" class="text-danger hover:text-red-900">삭제</button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// 배송비 규칙 수정
function editShippingRule(button) {
    console.log('✏️ 배송비 규칙 수정');
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');
    
    // 기존 데이터로 폼 채우기
    document.getElementById('rule-name').value = cells[0].textContent;
    // 다른 필드들도 채우기 (간단한 예시)
    
    // 모달 열기
    const modal = document.getElementById('shipping-rule-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// 배송비 규칙 삭제
function deleteShippingRule(button) {
    console.log('🗑️ 배송비 규칙 삭제');
    
    if (confirm('이 배송비 규칙을 삭제하시겠습니까?')) {
        const row = button.closest('tr');
        row.remove();
        
        // 테이블이 비어있으면 빈 상태 메시지 표시
        const tbody = document.getElementById('shipping-rules-table-body');
        if (tbody && tbody.children.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 text-center text-muted">
                        <div class="flex flex-col items-center space-y-2">
                            <i class="fas fa-truck text-muted text-2xl"></i>
                            <p>등록된 배송비 규칙이 없습니다</p>
                            <p class="td-muted">새 배송비 규칙을 추가해보세요</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        console.log('✅ 배송비 규칙 삭제 완료');
    }
}

// 테스트 함수 - 상품명 조회 문제 해결 테스트
window.testProductNameLookup = async function() {
    console.log('🧪 상품명 조회 문제 해결 테스트 시작');
    
    try {
        // 문제가 있는 주문 아이템 데이터 시뮬레이션
        const testItem = {
            "product_id": "d5f8cc40-ef2b-4f88-ac49-a6c4df3594c0",
            "product_name": "",
            "quantity": 1,
            "price": 30000,
            "total": 30000
        };
        
        console.log('🔍 테스트 아이템:', testItem);
        
        // 상품명 조회 테스트
        const productInfo = await getProductNameById(testItem.product_id);
        if (productInfo) {
            console.log('✅ 상품명 조회 성공:', productInfo);
            testItem.product_name = productInfo.name;
            console.log('✅ 아이템 업데이트:', testItem);
        } else {
            console.log('⚠️ 상품명 조회 실패, 대체 상품명 생성');
            testItem.product_name = `상품_${testItem.product_id.substring(0, 8)}`;
            console.log('✅ 대체 상품명 생성:', testItem);
        }
        
        console.log('🧪 테스트 완료');
        return testItem;
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
        return null;
    }
};

// =============================================
// 송장번호 일괄입력 인라인 패널
// =============================================

const SHIPPING_COMPANIES = ['로젠택배', 'CJ대한통운', '한진택배', '우체국택배', '쿠팡로켓', '편의점택배', '기타'];

async function toggleTrackingPanel() {
    const panel = document.getElementById('tracking-import-panel');
    if (!panel) return;

    if (!panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');
    await loadTrackingPanelOrders();
}

async function loadTrackingPanelOrders() {
    const tbody = document.getElementById('tracking-input-rows');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted"><i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...</td></tr>`;

    try {
        window.ensureSupabase();

        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('id, order_number, customer_name, order_status, tracking_number')
            .in('order_status', ['배송준비', '상품준비'])
            .order('order_date', { ascending: false });

        if (error) throw error;

        // 주문별 상품 요약 조회
        const ids = (orders || []).map(o => o.id);
        let itemsMap = {};
        if (ids.length > 0) {
            const { data: items } = await window.supabaseClient
                .from('farm_order_items')
                .select('order_id, product_name, quantity')
                .in('order_id', ids);
            (items || []).forEach(item => {
                if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
                itemsMap[item.order_id].push(`${item.product_name} ${item.quantity}개`);
            });
        }

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">배송준비/상품준비 상태 주문이 없습니다</td></tr>`;
            return;
        }

        const companyOptions = SHIPPING_COMPANIES.map(c => `<option value="${c}">${c}</option>`).join('');

        tbody.innerHTML = orders.map(order => {
            const summary = (itemsMap[order.id] || []).join(', ') || '-';
            const existingCompany = order.shipping_company || 'CJ대한통운';
            const existingTracking = order.tracking_number || '';
            const companyOpts = SHIPPING_COMPANIES.map(c =>
                `<option value="${c}"${c === existingCompany ? ' selected' : ''}>${c}</option>`
            ).join('');
            return `
            <tr class="hover:bg-amber-50" data-order-id="${order.id}">
                <td class="px-3 font-mono td-secondary whitespace-nowrap">${order.order_number || '-'}</td>
                <td class="px-3 font-medium td-primary whitespace-nowrap">${order.customer_name || '-'}</td>
                <td class="px-3 td-muted max-w-[180px] truncate" title="${summary}">${summary}</td>
                <td class="px-3">
                    <select class="tracking-company-select input-ui" style="font-size:12px; padding:2px 4px;">
                        ${companyOpts}
                    </select>
                </td>
                <td class="px-3">
                    <input type="text" class="tracking-number-input input-ui" style="font-size:12px; padding:2px 6px;"
                        placeholder="송장번호 입력" value="${existingTracking}"
                        onkeydown="if(event.key==='Enter'){saveOneTrackingNumber('${order.id}', this.closest('tr'))}">
                </td>
                <td class="px-3 text-center">
                    <button onclick="saveOneTrackingNumber('${order.id}', this.closest('tr'))"
                        class="btn-warn btn-xs">저장</button>
                </td>
            </tr>`;
        }).join('');

    } catch (e) {
        console.error('송장번호 패널 로드 실패:', e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">로드 실패: ${e.message}</td></tr>`;
    }
}

async function saveOneTrackingNumber(orderId, rowEl) {
    const tr = rowEl.closest ? rowEl.closest('tr') : rowEl;
    const trackingInput = tr.querySelector('.tracking-number-input');
    const companySelect = tr.querySelector('.tracking-company-select');
    const trackingNumber = trackingInput?.value.trim();
    const shippingCompany = companySelect?.value;

    if (!trackingNumber) { alert('송장번호를 입력해주세요.'); return; }
    if (!window.supabaseClient) { alert('Supabase 미연결'); return; }

    try {
        const { error } = await window.supabaseClient
            .from('farm_orders')
            .update({ tracking_number: trackingNumber, order_status: '배송중' })
            .eq('id', orderId);

        if (error) throw error;

        // 성공 표시
        tr.style.background = '#d1fae5';
        setTimeout(() => { tr.style.background = ''; }, 1500);

        // 주문 테이블도 새로고침
        if (typeof window.renderOrdersTable === 'function') window.renderOrdersTable();
        else if (typeof window.loadOrders === 'function') window.loadOrders();

    } catch (e) {
        alert('저장 실패: ' + e.message);
    }
}

async function saveAllTrackingNumbers() {
    const rows = document.querySelectorAll('#tracking-input-rows tr[data-order-id]');
    if (!rows.length) return;

    let saved = 0, skipped = 0;
    for (const tr of rows) {
        const orderId = tr.dataset.orderId;
        const trackingInput = tr.querySelector('.tracking-number-input');
        const companySelect = tr.querySelector('.tracking-company-select');
        const trackingNumber = trackingInput?.value.trim();
        const shippingCompany = companySelect?.value;

        if (!trackingNumber) { skipped++; continue; }

        try {
            await window.supabaseClient.from('farm_orders')
                .update({ tracking_number: trackingNumber, order_status: '배송중' })
                .eq('id', orderId);
            tr.style.background = '#d1fae5';
            saved++;
        } catch (e) {
            console.error(`주문 ${orderId} 저장 실패:`, e);
        }
    }

    alert(`저장 완료: ${saved}건 / 건너뜀: ${skipped}건`);
    if (saved > 0) {
        if (typeof window.renderOrdersTable === 'function') window.renderOrdersTable();
        else if (typeof window.loadOrders === 'function') window.loadOrders();
    }
}

window.toggleTrackingPanel = toggleTrackingPanel;
window.saveOneTrackingNumber = saveOneTrackingNumber;
window.saveAllTrackingNumbers = saveAllTrackingNumbers;

// =============================================
// 로젠택배 엑셀 내보내기
// =============================================
async function exportLogenExcel() {
    if (typeof XLSX === 'undefined') { alert('엑셀 라이브러리가 로드되지 않았습니다.'); return; }
    window.ensureSupabase();

    try {
        // 배송준비 + 상품준비 상태 주문 조회
        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('id, order_number, customer_name, customer_phone, customer_address, order_status, shipping_fee, memo')
            .in('order_status', ['배송준비', '상품준비'])
            .order('order_date', { ascending: false });

        if (error) throw error;
        if (!orders || orders.length === 0) { alert('배송준비/상품준비 상태 주문이 없습니다.'); return; }

        // 주문별 상품 조회
        const ids = orders.map(o => o.id);
        const { data: items } = await window.supabaseClient
            .from('farm_order_items')
            .select('order_id, product_name, quantity')
            .in('order_id', ids);

        const itemsMap = {};
        (items || []).forEach(item => {
            if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
            itemsMap[item.order_id].push(`${item.product_name} ${item.quantity}개`);
        });

        // 환경설정에서 로젠 운임/운임구분 읽기
        const shippingSettings = window.settingsDataManager?.settings?.shipping || {};
        const logenFee = shippingSettings.logenShippingFee ?? 3800;
        const logenFreight = shippingSettings.logenFreightType ?? 10;

        // 로젠 E타입(경산다육): 주문번호, 수하인명, 우편번호, 주소, 전화, 핸드폰, 수량, 운임, 운임구분, 품목명, 배송메세지
        const rows = orders.map(order => {
            const phone = (order.customer_phone || '').replace(/[-\s]/g, '');
            const address = order.customer_address || '';
            const productSummary = (itemsMap[order.id] || []).join(', ') || '-';

            return [
                order.order_number || '',
                order.customer_name || '',
                '',
                address,
                phone,
                phone,
                1,
                logenFee,
                logenFreight,
                productSummary,
                order.memo || ''
            ];
        });

        const wsData = rows;
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // 컬럼 너비: 주문번호, 수하인명, 우편번호, 주소, 전화, 핸드폰, 수량, 운임, 운임구분, 품목명, 배송메세지
        ws['!cols'] = [
            { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 40 }, { wch: 15 },
            { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 30 }, { wch: 20 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '로젠택배');

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        XLSX.writeFile(wb, `로젠택배_${today}_${orders.length}건.xlsx`);

        alert(`로젠택배 엑셀 다운로드 완료: ${orders.length}건`);

    } catch (e) {
        console.error('로젠 엑셀 내보내기 실패:', e);
        alert('엑셀 내보내기 실패: ' + e.message);
    }
}

window.exportLogenExcel = exportLogenExcel;

// ──────────────────────────────────────────────
// 날짜 필터 함수
// ──────────────────────────────────────────────

function _updateDateFilterBtnState(activeId) {
    document.querySelectorAll('.order-date-quick-btn').forEach(btn => {
        btn.classList.remove('bg-gray-700', 'text-white', 'border-gray-700',
                             'bg-emerald-600', 'border-emerald-600');
        btn.classList.add('text-body', 'border-gray-200');
        btn.style.backgroundColor = '';
    });
    const active = document.getElementById(activeId);
    if (active) {
        active.classList.remove('text-body', 'border-gray-200');
        if (activeId === 'date-btn-custom') {
            active.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
        } else {
            active.classList.add('bg-gray-700', 'text-white', 'border-gray-700');
        }
    }
}

function _applyDateAndRender(from, to, label) {
    const dm = window.orderDataManager;
    if (!dm) return;
    dm._dateFrom = from;
    dm._dateTo = to;
    dm.renderOrdersTable();

    const labelEl = document.getElementById('order-date-label');
    if (labelEl) {
        if (label) {
            labelEl.textContent = label;
            labelEl.classList.remove('hidden');
        } else {
            labelEl.classList.add('hidden');
        }
    }
}

function setOrderDateFilter(range) {
    const now = new Date();
    let from = null, to = null, label = '';

    if (range === 'today') {
        from = new Date(now); from.setHours(0, 0, 0, 0);
        to   = new Date(now); to.setHours(23, 59, 59, 999);
        label = '오늘';
    } else if (range === 'week') {
        from = new Date(now); from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0);
        to   = new Date(now); to.setHours(23, 59, 59, 999);
        label = '최근 1주일';
    } else if (range === 'month') {
        from = new Date(now); from.setMonth(from.getMonth() - 1); from.setHours(0, 0, 0, 0);
        to   = new Date(now); to.setHours(23, 59, 59, 999);
        label = '최근 한달';
    }
    // range === 'all': from/to = null (필터 없음)

    _applyDateAndRender(from, to, label);
    _updateDateFilterBtnState(`date-btn-${range}`);

    // 기간설정 패널 닫기 (all/quick 버튼 클릭 시)
    document.getElementById('order-date-picker-wrap')?.classList.add('hidden');
}

function toggleOrderDatePicker() {
    document.getElementById('order-date-picker-wrap')?.classList.toggle('hidden');
}

function applyOrderDateRange() {
    const fromVal = document.getElementById('order-date-from')?.value;
    const toVal   = document.getElementById('order-date-to')?.value;
    if (!fromVal || !toVal) {
        alert('시작일과 종료일을 모두 선택하세요.');
        return;
    }
    if (fromVal > toVal) {
        alert('시작일이 종료일보다 늦을 수 없습니다.');
        return;
    }
    const from = new Date(fromVal); from.setHours(0, 0, 0, 0);
    const to   = new Date(toVal);   to.setHours(23, 59, 59, 999);
    const label = `${fromVal} ~ ${toVal}`;

    _applyDateAndRender(from, to, label);
    _updateDateFilterBtnState('date-btn-custom');
}

window.setOrderDateFilter   = setOrderDateFilter;
window.toggleOrderDatePicker = toggleOrderDatePicker;
window.applyOrderDateRange  = applyOrderDateRange;

// 전역 함수로 등록
window.loadOrderManagementComponent = loadOrderManagementComponent;
window.attachOrderEventListeners = attachOrderEventListeners;
window.updateOrderFormShippingFee = updateOrderFormShippingFee;
window.loadOrderModal = loadOrderModal;
window.generatePickingList = generatePickingList;
window.editShippingRule = editShippingRule;
window.deleteShippingRule = deleteShippingRule;
