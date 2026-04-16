// 배송관리 JavaScript 함수들
// js/shipping-management.js

// 통합 배송관리 시스템 import
import { ShippingManager } from '../features/shipping/shippingManager.js';

// 배송관리 이벤트 리스너 정리 함수
function cleanupShippingEventListeners() {
    try {
        console.log('🧹 배송관리 이벤트 리스너 정리 중...');
        
        // 모든 배송관리 관련 이벤트 리스너를 강제로 제거
        const shippingElements = [
            'add-shipping-btn',
            'shipping-search',
            'shipping-filter',
            'shipping-sort',
            'refresh-shipping',
            'export-shipping',
            'import-shipping'
        ];
        
        shippingElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                // 기존 이벤트 리스너를 완전히 제거하기 위해 요소를 복제
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
        
        // 배송 테이블 관련 이벤트 리스너 정리
        const shippingTable = document.getElementById('shipping-table');
        if (shippingTable) {
            const newTable = shippingTable.cloneNode(true);
            shippingTable.parentNode.replaceChild(newTable, shippingTable);
        }
        
        // 배송 모달 관련 이벤트 리스너 정리
        const shippingModal = document.getElementById('shipping-modal');
        if (shippingModal) {
            const newModal = shippingModal.cloneNode(true);
            shippingModal.parentNode.replaceChild(newModal, shippingModal);
        }
        
        // 전역 이벤트 리스너 정리
        if (window.shippingEventListeners) {
            window.shippingEventListeners.forEach(listener => {
                if (listener.element && listener.event && listener.handler) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            window.shippingEventListeners = [];
        }
        
        console.log('✅ 배송관리 이벤트 리스너 정리 완료');
    } catch (error) {
        console.error('❌ 배송관리 이벤트 리스너 정리 실패:', error);
    }
}

// 전역 함수로 등록
window.cleanupShippingEventListeners = cleanupShippingEventListeners;

// 배송관리 컴포넌트 동적 로드 (배송관리 섹션 내에서만)
async function loadShippingManagementComponent() {
    try {
        console.log('🔄 배송관리 컴포넌트 로드 중...');
        
        // 배송관리 섹션만 찾기
        const shippingSection = document.getElementById('shipping-section');
        if (!shippingSection) {
            throw new Error('배송관리 섹션을 찾을 수 없습니다.');
        }
        
        // 기본 배송관리 UI 생성
        const shippingHTML = `
            <div class="app-section-frame">
                <!-- 배송관리 헤더 -->
                <div class="app-section-header">
                    <div class="app-section-heading">
                        <div class="app-section-icon">
                            <i class="fas fa-truck text-sm"></i>
                        </div>
                        <div>
                            <div class="app-section-title">배송 관리</div>
                            <div class="app-section-subtitle">배송 상태를 관리하고 추적하세요</div>
                        </div>
                    </div>
                    <div class="app-toolbar">
                        <button id="bulk-tracking-shipping-btn" class="app-btn app-btn-muted" onclick="openShippingTrackingPanel && openShippingTrackingPanel()">
                            <i class="fas fa-barcode mr-1 text-xs"></i><span class="text-xs">송장 일괄입력</span>
                        </button>
                        <button id="generate-rozen-excel-btn" class="app-btn app-btn-muted">
                            <i class="fas fa-file-excel mr-1 text-xs"></i><span class="text-xs">Excel</span>
                        </button>
                        <button id="add-shipping-btn" class="app-btn app-btn-primary">
                            <i class="fas fa-plus mr-1 text-xs"></i><span class="text-xs">배송 등록</span>
                        </button>
                    </div>
                </div>

                <!-- 송장번호 일괄입력 패널 (접힘) -->
                <div id="shipping-tracking-panel" class="hidden shrink-0 border-b border-amber-200 bg-amber-50">
                    <div class="px-4 py-3">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-barcode text-amber-600 text-sm"></i>
                                <span class="text-sm font-semibold text-amber-800">송장번호 일괄입력</span>
                                <span class="text-xs text-amber-600">배송준비 주문에 송장번호를 입력하세요</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button id="shipping-tracking-save-all-btn" class="app-btn app-btn-primary text-xs px-3 py-1">
                                    <i class="fas fa-save mr-1"></i>전체 저장
                                </button>
                                <button id="shipping-tracking-close-btn" class="app-btn app-btn-muted text-xs px-2 py-1" onclick="document.getElementById('shipping-tracking-panel').classList.add('hidden')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="table-ui w-full">
                                <thead>
                                    <tr>
                                        <th class="text-left">주문번호</th>
                                        <th class="text-left">고객명</th>
                                        <th class="text-left">상품</th>
                                        <th class="text-right">금액</th>
                                        <th class="text-left" style="min-width:180px">송장번호 입력</th>
                                        <th class="text-center">저장</th>
                                    </tr>
                                </thead>
                                <tbody id="shipping-tracking-rows">
                                    <tr><td colspan="6" class="text-center td-muted">불러오는 중...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 상태 필터 탭 + 검색 -->
                <div class="filter-bar">
                    <nav class="app-pill-bar flex-1">
                        <button id="shipping-status-all" class="shipping-tab-btn status-tab-btn active"><i class="fas fa-list mr-1"></i>전체</button>
                        <button id="shipping-status-배송준비" class="shipping-tab-btn status-tab-btn"><i class="fas fa-box mr-1"></i>배송준비</button>
                        <button id="shipping-status-배송중" class="shipping-tab-btn status-tab-btn"><i class="fas fa-shipping-fast mr-1"></i>배송중</button>
                        <button id="shipping-status-배송완료" class="shipping-tab-btn status-tab-btn"><i class="fas fa-check-circle mr-1"></i>배송완료</button>
                        <button id="shipping-status-배송지연" class="shipping-tab-btn status-tab-btn"><i class="fas fa-exclamation-circle mr-1"></i>배송지연</button>
                    </nav>
                    <input type="text" id="shipping-search" placeholder="주문번호, 고객명 검색..." class="input-ui" style="max-width:180px;">
                    <input type="date" id="shipping-date-filter" class="input-ui" style="max-width:140px;">
                </div>

                <!-- 배송 목록 테이블 -->
                <div class="flex-1 overflow-auto">
                    <div class="overflow-x-auto">
                        <table class="table-ui min-w-full">
                            <thead>
                                <tr>
                                    <th class="text-left">주문번호</th>
                                    <th class="text-left">고객명</th>
                                    <th class="text-left">배송지</th>
                                    <th class="text-left">배송 상태</th>
                                    <th class="text-left">배송일</th>
                                    <th class="text-left">송장번호</th>
                                    <th class="text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody id="shipping-table-body">
                                <tr>
                                    <td colspan="7" class="text-center td-muted">
                                        <i class="fas fa-truck text-2xl mb-2 block"></i>
                                        배송 데이터가 없습니다</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // 배송관리 섹션에 HTML 삽입
        shippingSection.innerHTML = shippingHTML;
        
        // 이벤트 리스너 설정
        setupShippingEventListeners();
        
        // 기본 배송 데이터 로드
        await loadBasicShippingData();
        
        console.log('✅ 배송관리 컴포넌트 로드 완료');
        
    } catch (error) {
        console.error('❌ 배송관리 컴포넌트 로드 실패:', error);
        alert('배송관리 컴포넌트를 로드할 수 없습니다.');
    }
}

// 기본 배송 데이터 로드
async function loadBasicShippingData() {
    try {
        console.log('📦 기본 배송 데이터 로드 중...');
        
        const tbody = document.getElementById('shipping-table-body');
        if (!tbody) {
            console.warn('⚠️ 배송 테이블 본문을 찾을 수 없습니다');
            return;
        }

        // 배송 데이터 수집
        let shippingOrders = [];
        
        // 1. 등록된 배송 데이터에서
        if (window.shippingData && window.shippingData.length > 0) {
            console.log('📦 등록된 배송 데이터:', window.shippingData.length + '개');
            shippingOrders = window.shippingData.map(shipping => ({
                id: shipping.orderId,
                order_number: shipping.orderId,
                customer_name: '고객명',
                shipping_address: '배송지',
                status: shipping.status,
                tracking_number: shipping.trackingNumber,
                carrier: shipping.carrierName,
                order_date: shipping.registeredAt
            }));
        }
        
        // 2. Supabase에서 직접 배송 관련 주문 조회 (orderDataManager가 비어있을 수 있음)
        if (window.supabaseClient) {
            console.log('🔍 Supabase에서 배송 주문 조회 중...');
            const { data: orders, error } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .in('order_status', ['배송준비', '배송중', '배송완료', '배송지연'])
                .order('order_date', { ascending: false });
            
            if (!error && orders) {
                console.log('✅ Supabase 조회 성공:', orders.length + '건');
                shippingOrders = [...shippingOrders, ...orders];
            } else {
                console.error('❌ Supabase 조회 실패:', error);
            }
        } else if (window.orderDataManager) {
            // 폴백: orderDataManager 사용
            console.log('🔄 orderDataManager 폴백 사용');
            const allOrders = window.orderDataManager.getAllOrders();
            console.log('📋 orderDataManager 주문 수:', allOrders.length);
            
            const orderShippingOrders = allOrders.filter(order => {
                const status = order.order_status || order.status;
                return ['배송준비', '배송중', '배송완료', '배송지연'].includes(status);
            });
            
            console.log('📦 배송 관련 주문:', orderShippingOrders.length + '개');
            shippingOrders = [...shippingOrders, ...orderShippingOrders];
        } else {
            console.error('❌ Supabase와 orderDataManager 모두 없습니다');
        }

        console.log('📊 총 배송 데이터:', shippingOrders.length + '개');

        if (shippingOrders.length === 0) {
            tbody.innerHTML = window.renderEmptyRow(7, '배송 데이터가 없습니다');
            return;
        }

        tbody.innerHTML = shippingOrders.map(order => `
            <tr class="hover:bg-section">
                <td class="px-4 td-primary font-medium">${order.order_number || order.id}</td>
                <td class="px-4 td-primary">${order.customer_name || '고객명'}</td>
                <td class="px-4 td-secondary max-w-xs truncate">${order.customer_address || order.address || '주소 없음'}</td>
                <td class="px-4">
                    <span class="badge ${getStatusColor(order.order_status || order.status)}">
                        ${order.order_status || order.status || '상태 없음'}
                    </span>
                </td>
                <td class="px-4 td-secondary">${formatDate(order.order_date)}</td>
                <td class="px-4 td-secondary">${order.tracking_number || '—'}</td>
                <td class="px-4">
                    <div class="flex items-center gap-2">
                        ${order.tracking_number ? `
                            <button onclick="trackOrder('${order.id}')" class="text-info hover:text-blue-700 text-xs" title="배송 추적">
                                <i class="fas fa-search"></i>
                            </button>
                        ` : ''}
                        <button onclick="editShipping('${order.id}')" class="text-brand hover:text-emerald-800 text-xs" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        console.log('✅ 기본 배송 데이터 로드 완료');

    } catch (error) {
        console.error('❌ 기본 배송 데이터 로드 실패:', error);
    }
}

// 상태별 배지 변형 반환 — 통제실 badge 클래스 사용 (raw Tailwind 제거)
function getStatusColor(status) {
    const MAP = {
        '배송준비': 'badge-orange',
        '배송중':   'badge-info',
        '배송완료': 'badge-success',
        '배송지연': 'badge-danger',
    };
    return MAP[status] || 'badge-neutral';
}
// 배지 HTML 반환 헬퍼
function getStatusBadgeHtml(status) {
    return `<span class="badge ${getStatusColor(status)}">${status || '-'}</span>`;
}

// 날짜 포맷팅: utils/formatters.js의 window.formatDate 사용
// (로컬 구현 제거 — window.formatDate가 없을 때 폴백)
function formatDate(dateString) {
    if (window.formatDate) return window.formatDate(dateString);
    if (!dateString) return '날짜 없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
}

// 배송관리 이벤트 리스너 설정
function setupShippingEventListeners() {
    try {
        console.log('🔗 배송관리 이벤트 리스너 설정 중...');

        // 송장번호 추적 버튼
        const trackBtn = document.getElementById('track-shipment-btn');
        if (trackBtn) {
            console.log('✅ 추적 버튼 이벤트 리스너 설정');
            trackBtn.addEventListener('click', trackShipmentByNumber);
        } else {
            console.warn('⚠️ 추적 버튼을 찾을 수 없습니다');
        }
        
        // Enter 키로 추적
        const trackingInput = document.getElementById('tracking-number-input');
        if (trackingInput) {
            console.log('✅ 송장번호 입력 필드 이벤트 리스너 설정');
            trackingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter 키로 추적 시작');
                    trackShipmentByNumber();
                }
            });
        } else {
            console.warn('⚠️ 송장번호 입력 필드를 찾을 수 없습니다');
        }

        // 배송준비 주문 Excel 미리보기 버튼
        document.getElementById('generate-rozen-excel-btn')?.addEventListener('click', () => {
            showRozenExcelPreview();
        });
        
        // 고급 배송관리 버튼
        document.getElementById('advanced-shipping-btn')?.addEventListener('click', () => {
            loadAdvancedShippingSystem();
        });
        
        // 배송 등록 버튼
        document.getElementById('add-shipping-btn')?.addEventListener('click', () => {
            showAddShippingModal();
        });

        // 일괄 등록 버튼
        document.getElementById('bulk-shipping-btn')?.addEventListener('click', () => {
            showBulkShippingModal();
        });

        // 내보내기 버튼
        document.getElementById('export-shipping-btn')?.addEventListener('click', () => {
            exportShippingData();
        });

        // 검색 버튼
        document.getElementById('shipping-filter-btn')?.addEventListener('click', () => {
            filterShippingData();
        });

        // 검색 입력 필드
        document.getElementById('shipping-search')?.addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                filterShippingData();
            }
        });

        console.log('✅ 배송관리 이벤트 리스너 설정 완료');

    } catch (error) {
        console.error('❌ 배송관리 이벤트 리스너 설정 실패:', error);
    }
}

// 송장번호로 배송 추적
async function trackShipmentByNumber() {
    try {
        console.log('🔍 trackShipmentByNumber 함수 호출됨');
        
        const trackingNumber = document.getElementById('tracking-number-input')?.value?.trim();
        const carrier = document.getElementById('carrier-select')?.value || null;

        console.log('📝 입력된 송장번호:', trackingNumber);
        console.log('🚚 선택된 택배사:', carrier);

        if (!trackingNumber) {
            alert('송장번호를 입력해주세요.');
            return;
        }

        // 송장번호 형식 검증
        if (!/^\d{10,15}$/.test(trackingNumber)) {
            if (!confirm('송장번호 형식이 올바르지 않습니다. (10-15자리 숫자)\n그래도 추적하시겠습니까?')) {
                return;
            }
        }

        console.log(`📦 배송 추적 시작: ${trackingNumber}`);

        // 로딩 상태 표시
        const trackBtn = document.getElementById('track-shipment-btn');
        if (!trackBtn) {
            console.error('❌ 추적 버튼을 찾을 수 없습니다');
            alert('시스템 오류: 추적 버튼을 찾을 수 없습니다.');
            return;
        }
        
        const originalText = trackBtn.innerHTML;
        trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>추적 중...';
        trackBtn.disabled = true;

        // 실제 배송 추적 API 호출
        let trackingData;
        console.log('🌐 실제 API 호출 시작');
        
        try {
            // 1차: Tracker Delivery API 시도
            trackingData = await callRealTrackingAPI(trackingNumber, carrier);
            console.log('✅ Tracker Delivery API 성공');
        } catch (primaryError) {
            console.warn('⚠️ Tracker Delivery API 실패, 대체 API 시도:', primaryError.message);
            
            try {
                // 2차: 대체 API 서비스 시도
                trackingData = await callAlternativeAPI(trackingNumber, carrier);
                console.log('✅ 대체 API 성공');
            } catch (alternativeError) {
                console.warn('⚠️ 대체 API 실패, 직접 API 시도:', alternativeError.message);
                
                try {
                    // 3차: 직접 택배사 API 시도
                    trackingData = await callDirectCarrierAPI(trackingNumber, carrier);
                    console.log('✅ 직접 API 성공');
                } catch (directError) {
                    console.error('❌ 모든 API 실패:', directError);
                    throw new Error(`배송 추적에 실패했습니다. 모든 API 서비스가 응답하지 않습니다.`);
                }
            }
        }

        console.log('📊 추적 데이터:', trackingData);

        // 추적 결과 표시
        displayTrackingResult(trackingData);

        // 버튼 상태 복원
        trackBtn.innerHTML = originalText;
        trackBtn.disabled = false;

        console.log('✅ 배송 추적 완료');

    } catch (error) {
        console.error('❌ 배송 추적 실패:', error);
        alert('배송 추적에 실패했습니다: ' + error.message);
        
        // 버튼 상태 복원
        const trackBtn = document.getElementById('track-shipment-btn');
        if (trackBtn) {
            trackBtn.innerHTML = '<i class="fas fa-search mr-2"></i>배송 추적';
            trackBtn.disabled = false;
        }
    }
}

// 추적 결과 표시
function displayTrackingResult(trackingData) {
    const resultContainer = document.getElementById('tracking-result');
    const detailsContainer = document.getElementById('tracking-details');

    if (!resultContainer || !detailsContainer) return;

    // 추적 결과 HTML 생성
    const resultHTML = `
        <div class="space-y-4">
            <!-- 기본 정보 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-info p-4 rounded-lg">
                    <div class="text-sm text-body">송장번호</div>
                    <div class="font-semibold text-blue-800">${trackingData.trackingNumber}</div>
                </div>
                <div class="bg-success p-4 rounded-lg">
                    <div class="text-sm text-body">택배사</div>
                    <div class="font-semibold text-green-800">${trackingData.carrier}</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-body">현재 상태</div>
                    <div class="font-semibold text-purple-800">${trackingData.status}</div>
                </div>
            </div>

            <!-- 현재 위치 -->
            <div class="bg-section p-4 rounded-lg">
                <div class="text-sm text-body mb-2">현재 위치</div>
                <div class="font-medium text-heading">${trackingData.currentLocation}</div>
            </div>

            <!-- 배송 이력 -->
            <div>
                <div class="text-sm text-body mb-3">배송 이력</div>
                <div class="space-y-3">
                    ${trackingData.history.map((item, index) => `
                        <div class="flex items-start space-x-3 p-3 bg-white border rounded-lg">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-info">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-heading">${item.status}</div>
                                <div class="text-sm text-body">${item.location}</div>
                                <div class="text-sm text-muted">${item.description}</div>
                                <div class="text-xs text-muted mt-1">${new Date(item.time).toLocaleString('ko-KR')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 추적 링크 -->
            <div class="bg-warn p-4 rounded-lg">
                <div class="text-sm text-body mb-2">고객용 추적 링크</div>
                <div class="flex items-center space-x-2">
                    <input type="text" id="tracking-link" value="${generateTrackingLink(trackingData.trackingNumber, trackingData.carrier)}" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" readonly>
                    <button onclick="copyTrackingLink()" class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm">
                        <i class="fas fa-copy mr-1"></i>복사
                    </button>
                </div>
            </div>
        </div>
    `;

    detailsContainer.innerHTML = resultHTML;
    resultContainer.classList.remove('hidden');

    // 추적 링크 복사 함수 등록
    window.copyTrackingLink = () => {
        const linkInput = document.getElementById('tracking-link');
        linkInput.select();
        document.execCommand('copy');
        alert('추적 링크가 복사되었습니다.');
    };
}

// 추적 링크 생성
function generateTrackingLink(trackingNumber, carrier) {
    const trackingLinks = {
        'CJ대한통운': `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnb_param=1&wl_ref=${trackingNumber}`,
        '한진택배': `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/TrackResult.do?mCode=MN038&schLang=KR&wblnum=${trackingNumber}`,
        '롯데택배': `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${trackingNumber}`,
        '로젠택배': `https://www.ilogen.com/web/personal/trace/${trackingNumber}`,
        '대한통운': `https://www.kdexp.com/tracking?invoice_no=${trackingNumber}`,
        '우체국택배': `https://service.epost.go.kr/trace.RetrieveDomRlgTraceList.comm?displayHeader=N&sid1=${trackingNumber}`
    };
    return trackingLinks[carrier] || `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnb_param=1&wl_ref=${trackingNumber}`;
}

// 현실적인 Mock 추적 데이터 생성
async function getRealisticMockData(trackingNumber, carrier) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const carrierName = carrier ? getCarrierName(carrier) : 'CJ대한통운';
            const carrierCode = carrier || 'cj';
            
            // 택배사별 현실적인 데이터 생성
            const carrierData = getCarrierSpecificData(carrierCode, trackingNumber);
            
            resolve({
                trackingNumber,
                carrier: carrierName,
                status: carrierData.status,
                currentLocation: carrierData.currentLocation,
                estimatedDelivery: carrierData.estimatedDelivery,
                history: carrierData.history
            });
        }, 1000);
    });
}

// 택배사별 맞춤 데이터 생성
function getCarrierSpecificData(carrierCode, trackingNumber) {
    const now = new Date();
    const baseData = {
        cj: {
            name: 'CJ대한통운',
            status: '배송중',
            currentLocation: '서울 물류센터',
            estimatedDelivery: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                    location: '서울 물류센터',
                    status: '중간처리',
                    description: '물류센터에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '서울 물류센터',
                    status: '배송중',
                    description: '배송 중입니다.'
                }
            ]
        },
        logen: {
            name: '로젠택배',
            status: '배송중',
            currentLocation: '로젠택배 서울지점',
            estimatedDelivery: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '로젠택배로 상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
                    location: '로젠택배 서울지점',
                    status: '중간처리',
                    description: '로젠택배 지점에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '로젠택배 서울지점',
                    status: '배송중',
                    description: '로젠택배 배송 중입니다.'
                }
            ]
        },
        hanjin: {
            name: '한진택배',
            status: '배송중',
            currentLocation: '한진택배 서울터미널',
            estimatedDelivery: new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '한진택배로 상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                    location: '한진택배 서울터미널',
                    status: '중간처리',
                    description: '한진택배 터미널에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '한진택배 서울터미널',
                    status: '배송중',
                    description: '한진택배 배송 중입니다.'
                }
            ]
        },
        lotte: {
            name: '롯데택배',
            status: '배송중',
            currentLocation: '롯데택배 서울물류센터',
            estimatedDelivery: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '롯데택배로 상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                    location: '롯데택배 서울물류센터',
                    status: '중간처리',
                    description: '롯데택배 물류센터에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '롯데택배 서울물류센터',
                    status: '배송중',
                    description: '롯데택배 배송 중입니다.'
                }
            ]
        },
        kdexp: {
            name: '대한통운',
            status: '배송중',
            currentLocation: '대한통운 서울지점',
            estimatedDelivery: new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '대한통운으로 상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
                    location: '대한통운 서울지점',
                    status: '중간처리',
                    description: '대한통운 지점에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '대한통운 서울지점',
                    status: '배송중',
                    description: '대한통운 배송 중입니다.'
                }
            ]
        },
        epost: {
            name: '우체국택배',
            status: '배송중',
            currentLocation: '우체국 서울집중국',
            estimatedDelivery: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
            history: [
                {
                    time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                    location: '발송지',
                    status: '발송',
                    description: '우체국택배로 상품이 발송되었습니다.'
                },
                {
                    time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    location: '우체국 서울집중국',
                    status: '중간처리',
                    description: '우체국 집중국에서 처리 중입니다.'
                },
                {
                    time: now.toISOString(),
                    location: '우체국 서울집중국',
                    status: '배송중',
                    description: '우체국택배 배송 중입니다.'
                }
            ]
        }
    };
    
    return baseData[carrierCode] || baseData.cj;
}

// Mock 추적 데이터 생성 (기존 함수 유지)
async function getMockTrackingData(trackingNumber, carrier) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                trackingNumber,
                carrier: carrier ? getCarrierName(carrier) : 'CJ대한통운',
                status: '배송중',
                currentLocation: '서울 물류센터',
                estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                history: [
                    {
                        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        location: '발송지',
                        status: '발송',
                        description: '상품이 발송되었습니다.'
                    },
                    {
                        time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                        location: '서울 물류센터',
                        status: '중간처리',
                        description: '물류센터에서 처리 중입니다.'
                    },
                    {
                        time: new Date().toISOString(),
                        location: '서울 물류센터',
                        status: '배송중',
                        description: '배송 중입니다.'
                    }
                ]
            });
        }, 1000);
    });
}

// 실제 배송 추적 API 호출
async function callRealTrackingAPI(trackingNumber, carrier) {
    try {
        console.log(`🌐 실제 API 호출: ${carrier} - ${trackingNumber}`);
        
        // 택배사별 실제 API 엔드포인트
        const apiEndpoints = {
            'cj': `https://apis.tracker.delivery/carriers/kr.cjlogistics/tracks/${trackingNumber}`,
            'hanjin': `https://apis.tracker.delivery/carriers/kr.hanjin/tracks/${trackingNumber}`,
            'lotte': `https://apis.tracker.delivery/carriers/kr.lotte/tracks/${trackingNumber}`,
            'logen': `https://apis.tracker.delivery/carriers/kr.logen/tracks/${trackingNumber}`,
            'kdexp': `https://apis.tracker.delivery/carriers/kr.kdexp/tracks/${trackingNumber}`,
            'epost': `https://apis.tracker.delivery/carriers/kr.epost/tracks/${trackingNumber}`
        };

        const apiUrl = apiEndpoints[carrier];
        if (!apiUrl) {
            throw new Error(`지원하지 않는 택배사: ${carrier}`);
        }

        console.log(`📡 API URL: ${apiUrl}`);

        // 실제 API 호출
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SucPlant-Shipping-Tracker/1.0',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });

        console.log(`📊 API 응답 상태: ${response.status}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('송장번호를 찾을 수 없습니다. 송장번호를 확인해주세요.');
            } else if (response.status === 429) {
                throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('📦 API 응답 데이터:', data);

        // API 응답을 표준 형식으로 변환
        return transformAPIResponse(data, trackingNumber, carrier);

    } catch (error) {
        console.error('❌ 실제 API 호출 실패:', error);
        
        // 네트워크 오류인 경우
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('네트워크 연결을 확인해주세요.');
        }
        
        // CORS 오류인 경우
        if (error.message.includes('CORS')) {
            throw new Error('CORS 정책으로 인해 API 호출이 차단되었습니다.');
        }
        
        throw error;
    }
}

// API 응답을 표준 형식으로 변환
function transformAPIResponse(apiData, trackingNumber, carrier) {
    try {
        console.log('🔄 API 응답 변환 중...');
        
        const carrierName = getCarrierName(carrier);
        
        // API 응답 구조에 따라 변환
        const transformedData = {
            trackingNumber,
            carrier: carrierName,
            status: mapAPIStatus(apiData.state || apiData.status || 'UNKNOWN'),
            currentLocation: apiData.location || apiData.currentLocation || '위치 정보 없음',
            estimatedDelivery: apiData.estimatedDelivery || apiData.estimatedDeliveryDate || null,
            history: transformHistory(apiData.progresses || apiData.history || apiData.trackingHistory || [])
        };

        console.log('✅ API 응답 변환 완료');
        return transformedData;

    } catch (error) {
        console.error('❌ API 응답 변환 실패:', error);
        throw new Error('API 응답을 처리할 수 없습니다.');
    }
}

// API 상태를 한국어로 매핑
function mapAPIStatus(apiStatus) {
    const statusMap = {
        'PICKED_UP': '배송중',
        'IN_TRANSIT': '배송중',
        'OUT_FOR_DELIVERY': '배송중',
        'DELIVERED': '배송완료',
        'EXCEPTION': '배송지연',
        'RETURNED': '반송',
        'CANCELLED': '취소',
        'UNKNOWN': '알 수 없음',
        '배송중': '배송중',
        '배송완료': '배송완료',
        '배송지연': '배송지연'
    };
    return statusMap[apiStatus] || '알 수 없음';
}

// 배송 이력을 변환
function transformHistory(apiHistory) {
    if (!Array.isArray(apiHistory)) {
        return [];
    }
    
    return apiHistory.map(item => ({
        time: item.time || item.timestamp || item.date,
        location: item.location || item.place || item.address,
        status: mapAPIStatus(item.status || item.state),
        description: item.description || item.message || item.note || '배송 정보 업데이트'
    }));
}

// 택배사 코드를 이름으로 변환
function getCarrierName(carrierCode) {
    const carriers = {
        'cj': 'CJ대한통운',
        'hanjin': '한진택배',
        'lotte': '롯데택배',
        'logen': '로젠택배',
        'kdexp': '대한통운',
        'epost': '우체국택배'
    };
    return carriers[carrierCode] || 'CJ대한통운';
}

// 대체 API 서비스 호출
async function callAlternativeAPI(trackingNumber, carrier) {
    try {
        console.log(`🔄 대체 API 호출: ${carrier} - ${trackingNumber}`);
        
        // 대체 API 서비스들
        const alternativeAPIs = [
            // 한국택배 API
            `https://api.koreapost.go.kr/tracking/${trackingNumber}`,
            // 배송추적 통합 API
            `https://api.shipping-tracker.com/track/${carrier}/${trackingNumber}`,
            // 배송추적 대체 서비스
            `https://tracking-api.alternative.com/${carrier}/${trackingNumber}`
        ];
        
        for (const apiUrl of alternativeAPIs) {
            try {
                console.log(`📡 대체 API 시도: ${apiUrl}`);
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'SucPlant-Shipping-Tracker/1.0'
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ 대체 API 성공:', apiUrl);
                    return transformAPIResponse(data, trackingNumber, carrier);
                }
            } catch (apiError) {
                console.warn(`⚠️ 대체 API 실패: ${apiUrl}`, apiError.message);
                continue;
            }
        }
        
        throw new Error('모든 대체 API 서비스가 실패했습니다.');
        
    } catch (error) {
        console.error('❌ 대체 API 호출 실패:', error);
        throw error;
    }
}

// 직접 택배사 API 호출
async function callDirectCarrierAPI(trackingNumber, carrier) {
    try {
        console.log(`🎯 직접 API 호출: ${carrier} - ${trackingNumber}`);
        
        // 택배사별 직접 API 엔드포인트
        const directAPIs = {
            'cj': `https://www.cjlogistics.com/api/tracking/${trackingNumber}`,
            'hanjin': `https://www.hanjin.co.kr/api/tracking/${trackingNumber}`,
            'lotte': `https://www.lotteglogis.com/api/tracking/${trackingNumber}`,
            'logen': `https://www.ilogen.com/api/tracking/${trackingNumber}`,
            'kdexp': `https://www.kdexp.com/api/tracking/${trackingNumber}`,
            'epost': `https://service.epost.go.kr/api/tracking/${trackingNumber}`
        };
        
        const apiUrl = directAPIs[carrier];
        if (!apiUrl) {
            throw new Error(`직접 API가 지원되지 않는 택배사: ${carrier}`);
        }
        
        console.log(`📡 직접 API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SucPlant-Shipping-Tracker/1.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sucplant.com'
            },
            mode: 'cors'
        });
        
        console.log(`📊 직접 API 응답 상태: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`직접 API 호출 실패: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 직접 API 응답 데이터:', data);
        
        return transformAPIResponse(data, trackingNumber, carrier);
        
    } catch (error) {
        console.error('❌ 직접 API 호출 실패:', error);
        throw error;
    }
}

// 고급 배송관리 시스템 로드
async function loadAdvancedShippingSystem() {
    try {
        console.log('🚀 고급 배송관리 시스템 로드 중...');
        
        if (!window.shippingManager) {
            alert('고급 배송관리 시스템을 사용할 수 없습니다.');
            return;
        }

        // 배송관리 섹션에 고급 시스템 로드
        await window.shippingManager.createShippingDashboard('shipping-section');
        
        console.log('✅ 고급 배송관리 시스템 로드 완료');
        
    } catch (error) {
        console.error('❌ 고급 배송관리 시스템 로드 실패:', error);
        alert('고급 배송관리 시스템을 로드할 수 없습니다.');
    }
}

// 배송 등록 모달 표시
async function showAddShippingModal() {
    try {
        if (!window.supabaseClient) {
            alert('데이터베이스에 연결되지 않았습니다.');
            return;
        }

        // 로딩 버튼 상태
        const btn = document.getElementById('add-shipping-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1 text-xs"></i><span class="text-xs">불러오는 중...</span>'; }

        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('id, order_number, customer_name, order_status, order_items, total_amount')
            .in('order_status', ['입금확인', '상품준비', '배송준비'])
            .order('order_date', { ascending: false });

        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus mr-1 text-xs"></i><span class="text-xs">배송 등록</span>'; }

        if (error) throw new Error(error.message);

        if (!orders || orders.length === 0) {
            alert('배송 등록 가능한 주문이 없습니다.\n(입금확인 / 상품준비 / 배송준비 상태 주문만 표시됩니다)');
            return;
        }

        showAddShippingForm(orders);

    } catch (error) {
        console.error('❌ 배송 등록 모달 표시 실패:', error);
        alert('주문 목록을 불러올 수 없습니다: ' + error.message);
        const btn = document.getElementById('add-shipping-btn');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus mr-1 text-xs"></i><span class="text-xs">배송 등록</span>'; }
    }
}

// 테스트 주문 생성
function createTestOrders() {
    try {
        console.log('🧪 테스트 주문 생성 중...');
        
        const testOrders = [
            {
                id: 'test-order-1',
                order_number: 'ORD001',
                customer_name: '홍길동',
                status: '입금확인',
                order_date: new Date().toISOString(),
                shipping_address: '서울시 강남구 테헤란로 123',
                phone: '010-1234-5678'
            },
            {
                id: 'test-order-2',
                order_number: 'ORD002',
                customer_name: '김철수',
                status: '상품준비',
                order_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                shipping_address: '부산시 해운대구 센텀대로 456',
                phone: '010-2345-6789'
            },
            {
                id: 'test-order-3',
                order_number: 'ORD003',
                customer_name: '이영희',
                status: '배송준비',
                order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                shipping_address: '대구시 수성구 동대구로 789',
                phone: '010-3456-7890'
            }
        ];
        
        // orderDataManager가 있으면 사용, 없으면 전역 변수에 저장
        if (window.orderDataManager) {
            testOrders.forEach(order => {
                window.orderDataManager.addOrder(order);
            });
            console.log('✅ 테스트 주문이 orderDataManager에 추가됨');
        } else {
            window.testOrders = testOrders;
            console.log('✅ 테스트 주문이 전역 변수에 저장됨');
        }
        
        console.log('✅ 테스트 주문 생성 완료:', testOrders.length + '개');
        
    } catch (error) {
        console.error('❌ 테스트 주문 생성 실패:', error);
    }
}

// 테스트 주문 가져오기
function getTestOrders() {
    return window.testOrders || [];
}

// 배송 등록 폼 표시
function showAddShippingForm(orders) {
    const modalHTML = `
        <div id="add-shipping-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 class="text-lg font-semibold text-heading mb-4">배송 등록</h3>
                
                <div class="space-y-4">
                    <!-- 주문 선택 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">주문 선택</label>
                        <select id="order-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">주문을 선택하세요</option>
                            ${orders.map(order => {
                                const status = order.order_status || order.status;
                                return `<option value="${order.id}">${order.order_number || order.id} - ${order.customer_name} (${status})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <!-- 송장번호 입력 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">송장번호</label>
                        <input type="text" id="tracking-number" placeholder="송장번호를 입력하세요" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    
                    <!-- 택배사 선택 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">택배사</label>
                        <select id="carrier-select-modal" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">택배사를 선택하세요</option>
                            <option value="cj">CJ대한통운</option>
                            <option value="hanjin">한진택배</option>
                            <option value="lotte">롯데택배</option>
                            <option value="logen">로젠택배</option>
                            <option value="kdexp">대한통운</option>
                            <option value="epost">우체국택배</option>
                        </select>
                    </div>
                    
                    <!-- 배송 메모 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">배송 메모</label>
                        <textarea id="shipping-memo" placeholder="특별 요청사항이나 메모를 입력하세요" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"></textarea>
                    </div>
                </div>
                
                <!-- 버튼 -->
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancel-add-shipping" class="px-4 py-2 text-body hover:text-heading">취소</button>
                    <button id="confirm-add-shipping" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>배송 등록
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 이벤트 리스너 설정
    document.getElementById('cancel-add-shipping').addEventListener('click', closeAddShippingModal);
    document.getElementById('confirm-add-shipping').addEventListener('click', confirmAddShipping);
}

// 배송 등록 모달 닫기
function closeAddShippingModal() {
    const modal = document.getElementById('add-shipping-modal');
    if (modal) {
        modal.remove();
    }
}

// 배송 등록 확인
async function confirmAddShipping() {
    try {
        const orderId = document.getElementById('order-select').value;
        const trackingNumber = document.getElementById('tracking-number').value.trim();
        const carrier = document.getElementById('carrier-select-modal').value;
        const memo = document.getElementById('shipping-memo').value.trim();
        
        console.log('📦 배송 등록 정보 입력:', { orderId, trackingNumber, carrier, memo });
        
        // 입력 검증
        if (!orderId) {
            alert('주문을 선택해주세요.');
            return;
        }
        
        if (!trackingNumber) {
            alert('송장번호를 입력해주세요.');
            return;
        }
        
        if (!carrier) {
            alert('택배사를 선택해주세요.');
            return;
        }
        
        // 송장번호 형식 검증
        if (!/^\d{10,15}$/.test(trackingNumber)) {
            if (!confirm('송장번호 형식이 올바르지 않습니다. (10-15자리 숫자)\n그래도 등록하시겠습니까?')) {
                return;
            }
        }
        
        console.log('📦 배송 등록 처리 시작:', { orderId, trackingNumber, carrier, memo });
        
        // 로딩 표시
        const confirmBtn = document.getElementById('confirm-add-shipping');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
        confirmBtn.disabled = true;
        
        // Supabase에 송장번호·배송상태 저장
        const { error: updateError } = await window.supabaseClient
            .from('farm_orders')
            .update({
                tracking_number: trackingNumber,
                carrier: carrier,
                order_status: '배송중',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw new Error(`저장 실패: ${updateError.message}`);
        
        console.log('✅ 배송 등록 완료:', shippingInfo);
        console.log('📊 전체 배송 데이터:', window.shippingData);
        
        // 모달 닫기
        closeAddShippingModal();
        
        // 배송 목록 새로고침
        await loadBasicShippingData();
        
        // 성공 메시지
        Swal?.fire({ icon: 'success', title: '배송 등록 완료', text: `송장번호 ${trackingNumber} · 상태가 배송중으로 변경됐습니다`, timer: 2000, showConfirmButton: false })
            ?? alert('배송이 등록됐습니다.');
        
    } catch (error) {
        console.error('❌ 배송 등록 실패:', error);
        alert('배송 등록에 실패했습니다: ' + error.message);
        
        // 버튼 상태 복원
        const confirmBtn = document.getElementById('confirm-add-shipping');
        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>배송 등록';
            confirmBtn.disabled = false;
        }
    }
}

// 일괄 등록 모달 표시
function showBulkShippingModal() {
    try {
        console.log('📦 일괄 등록 모달 표시');
        
        const modalHTML = `
            <div id="bulk-shipping-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <h3 class="text-lg font-semibold text-heading mb-4">일괄 배송 등록</h3>
                    
                    <div class="space-y-4">
                        <!-- 업로드 방법 선택 -->
                        <div>
                            <label class="block text-sm font-medium text-body mb-2">등록 방법</label>
                            <div class="flex space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="bulk-method" value="excel" checked class="mr-2">
                                    Excel 파일 업로드
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="bulk-method" value="manual" class="mr-2">
                                    수동 입력
                                </label>
                            </div>
                        </div>
                        
                        <!-- Excel 업로드 섹션 -->
                        <div id="excel-upload-section">
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <i class="fas fa-file-excel text-brand text-3xl mb-2"></i>
                                <p class="text-sm text-body mb-2">Excel 파일을 드래그하거나 클릭하여 업로드</p>
                                <input type="file" id="excel-file" accept=".xlsx,.xls" class="hidden">
                                <button id="select-excel-file" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    파일 선택
                                </button>
                                <p class="text-xs text-muted mt-2 space-x-3">
                                    <a href="#" id="download-template" class="text-info hover:underline">Excel 템플릿 다운로드</a>
                                    <span class="text-gray-300">|</span>
                                    <a href="#" id="edit-template" class="text-orange-600 hover:underline">템플릿 양식 편집</a>
                                </p>
                            </div>
                        </div>
                        
                        <!-- 수동 입력 섹션 -->
                        <div id="manual-input-section" class="hidden">
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <h4 class="font-medium text-heading">배송 정보 입력</h4>
                                    <button id="add-manual-row" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                        <i class="fas fa-plus mr-1"></i>행 추가
                                    </button>
                                </div>
                                <div id="manual-rows" class="space-y-2">
                                    <!-- 수동 입력 행들이 여기에 추가됩니다 -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- 미리보기 -->
                        <div id="bulk-preview" class="hidden">
                            <h4 class="font-medium text-heading mb-2">등록 미리보기</h4>
                            <div class="bg-section p-4 rounded-lg">
                                <div id="preview-content" class="text-sm text-body">
                                    <!-- 미리보기 내용이 여기에 표시됩니다 -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 버튼 -->
                    <div class="flex justify-end space-x-3 mt-6">
                        <button id="cancel-bulk-shipping" class="px-4 py-2 text-body hover:text-heading">취소</button>
                        <button id="confirm-bulk-shipping" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                            <i class="fas fa-upload mr-2"></i>일괄 등록
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 이벤트 리스너 설정
        setupBulkShippingEventListeners();
        
    } catch (error) {
        console.error('❌ 일괄 등록 모달 표시 실패:', error);
        alert('일괄 등록 모달을 표시할 수 없습니다.');
    }
}

// 일괄 등록 이벤트 리스너 설정
function setupBulkShippingEventListeners() {
    // 취소 버튼
    document.getElementById('cancel-bulk-shipping').addEventListener('click', closeBulkShippingModal);
    
    // 등록 방법 변경
    document.querySelectorAll('input[name="bulk-method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const method = e.target.value;
            const excelSection = document.getElementById('excel-upload-section');
            const manualSection = document.getElementById('manual-input-section');
            
            if (method === 'excel') {
                excelSection.classList.remove('hidden');
                manualSection.classList.add('hidden');
            } else {
                excelSection.classList.add('hidden');
                manualSection.classList.remove('hidden');
                addManualRow(); // 첫 번째 수동 입력 행 추가
            }
        });
    });
    
    // Excel 파일 선택
    document.getElementById('select-excel-file').addEventListener('click', () => {
        document.getElementById('excel-file').click();
    });
    
    // Excel 파일 업로드
    document.getElementById('excel-file').addEventListener('change', handleExcelUpload);
    
    // 템플릿 다운로드
    document.getElementById('download-template').addEventListener('click', downloadExcelTemplate);
    
    // 템플릿 편집
    document.getElementById('edit-template').addEventListener('click', (e) => {
        e.preventDefault();
        showTemplateEditorModal();
    });
    
    // 수동 행 추가
    document.getElementById('add-manual-row').addEventListener('click', addManualRow);
    
    // 일괄 등록 확인
    document.getElementById('confirm-bulk-shipping').addEventListener('click', confirmBulkShipping);
}

// 일괄 등록 모달 닫기
function closeBulkShippingModal() {
    const modal = document.getElementById('bulk-shipping-modal');
    if (modal) {
        modal.remove();
    }
}

// Excel 파일 업로드 처리
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 Excel 파일 업로드:', file.name);
    
    // 파일 읽기 (실제 구현에서는 Excel 파싱 라이브러리 사용)
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            // 간단한 CSV 파싱 (실제로는 Excel 파싱 필요)
            const content = e.target.result;
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            const rows = lines.slice(1).map(line => line.split(','));
            
            console.log('📊 파싱된 데이터:', { headers, rows });
            
            // 전역 변수에 저장
            window.bulkShippingData = rows;
            
            // 미리보기 표시
            showBulkPreview(rows);
            
        } catch (error) {
            console.error('❌ Excel 파일 파싱 실패:', error);
            alert('Excel 파일을 읽을 수 없습니다.');
        }
    };
    reader.readAsText(file);
}

// 배송준비 주문 Excel 미리보기 표시
async function showRozenExcelPreview() {
    try {
        console.log('🔍 배송준비 주문 Excel 미리보기 시작');
        
        // 1. 배송준비 주문 조회
        let readyOrders = [];
        
        if (window.supabaseClient) {
            console.log('🔍 Supabase에서 배송준비 주문 조회...');
            const { data: orders, error } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .eq('order_status', '배송준비')
                .order('order_date', { ascending: false });
            
            if (error) {
                throw new Error(`주문 조회 실패: ${error.message}`);
            }
            readyOrders = orders || [];
            console.log('✅ Supabase 조회 완료:', readyOrders.length + '건');
        } else if (window.orderDataManager) {
            console.log('🔄 orderDataManager 폴백 사용');
            const allOrders = window.orderDataManager.getAllOrders();
            readyOrders = allOrders.filter(order => 
                order.order_status === '배송준비' || order.status === '배송준비'
            );
        } else {
            alert('주문 데이터를 불러올 수 없습니다.\n\nSupabase 연결을 확인해주세요.');
            return;
        }
        
        if (readyOrders.length === 0) {
            alert('배송준비 상태의 주문이 없습니다.\n\n주문관리에서 주문 상태를 "배송준비"로 변경해주세요.');
            return;
        }
        
        // 2. 미리보기 모달 생성
        const modalHTML = `
            <div id="rozen-excel-preview-modal" class="fixed inset-0 z-50 overflow-y-auto" style="display: block;">
                <!-- 배경 오버레이 -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
                
                <!-- 모달 컨테이너 -->
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
                        <!-- 헤더 -->
                        <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-xl font-bold text-heading">📦 로젠택배 Excel 미리보기</h2>
                                    <p class="text-sm text-body mt-1">총 ${readyOrders.length}건의 배송준비 주문</p>
                                </div>
                                <button onclick="closeRozenExcelPreview()" class="text-muted hover:text-body">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 본문 -->
                        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div class="overflow-x-auto">
                                <table class="min-w-full table-ui border border-gray-300">
                                    <thead class="bg-info">
                                        <tr>
                                            <th class="px-3 font-bold border border-gray-300">수하인명</th>
                                            <th class="px-3 font-bold border border-gray-300"></th>
                                            <th class="px-3 font-bold border border-gray-300">수하인주소</th>
                                            <th class="px-3 font-bold border border-gray-300">수하인전화번호</th>
                                            <th class="px-3 font-bold border border-gray-300">수하인핸드폰번호</th>
                                            <th class="px-3 font-bold border border-gray-300">택배수량</th>
                                            <th class="px-3 font-bold border border-gray-300">택배운임</th>
                                            <th class="px-3 font-bold border border-gray-300">운임구분</th>
                                            <th class="px-3 font-bold border border-gray-300">품목명</th>
                                            <th class="px-3 font-bold border border-gray-300"></th>
                                            <th class="px-3 font-bold border border-gray-300">배송메세지</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${readyOrders.map(order => {
                                            const phone = order.customer_phone || order.phone || '';
                                            const address = order.customer_address || order.address || '';
                                            const itemName = extractItemNames(order.items ?? []);
                                            const message = order.memo || order.shipping_message || '';
                                            return `
                                                <tr class="hover:bg-section">
                                                    <td class="px-3 td-primary border border-gray-300">${order.customer_name || ''}</td>
                                                    <td class="px-3 td-secondary border border-gray-300"></td>
                                                    <td class="px-3 td-primary border border-gray-300 max-w-xs truncate">${address}</td>
                                                    <td class="px-3 td-secondary border border-gray-300"></td>
                                                    <td class="px-3 td-primary border border-gray-300">${phone}</td>
                                                    <td class="px-3 text-center td-primary border border-gray-300">1</td>
                                                    <td class="px-3 text-center td-primary border border-gray-300">3800</td>
                                                    <td class="px-3 text-center td-primary border border-gray-300">010</td>
                                                    <td class="px-3 td-primary border border-gray-300 max-w-xs truncate">${itemName}</td>
                                                    <td class="px-3 text-center td-secondary border border-gray-300"></td>
                                                    <td class="px-3 td-primary border border-gray-300 max-w-xs truncate">${message}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="mt-4 p-4 bg-info border border-blue-200 rounded-lg">
                                <p class="text-sm text-body">
                                    <i class="fas fa-info-circle text-info mr-2"></i>
                                    <strong>참고:</strong> 운임구분 "010"은 선불 코드입니다. 택배운임은 주문의 배송비 금액이 사용됩니다.
                                </p>
                            </div>
                        </div>
                        
                        <!-- 하단 버튼 -->
                        <div class="bg-section px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                            <button onclick="closeRozenExcelPreview()" class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-body rounded-lg transition-colors">
                                취소
                            </button>
                            <button onclick="downloadRozenExcel()" class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold">
                                <i class="fas fa-download mr-2"></i>Excel 다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 3. 모달 추가
        const existingModal = document.getElementById('rozen-excel-preview-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 로젠택배 Excel 미리보기 표시 완료');
        
    } catch (error) {
        console.error('❌ Excel 미리보기 표시 실패:', error);
        alert('Excel 미리보기를 표시할 수 없습니다:\n' + error.message);
    }
}

// 미리보기 모달 닫기
function closeRozenExcelPreview() {
    const modal = document.getElementById('rozen-excel-preview-modal');
    if (modal) {
        modal.remove();
    }
}

// 미리보기에서 Excel 다운로드
function downloadRozenExcel() {
    closeRozenExcelPreview();
    generateRozenExcelFromOrders();
}

// 배송준비 주문에서 로젠택배 Excel 자동 생성
async function generateRozenExcelFromOrders() {
    try {
        console.log('🚀 배송준비 주문 → 로젠택배 Excel 자동 생성 시작');
        
        let readyOrders = [];
        
        // 1. Supabase에서 직접 주문 데이터 조회 (더 신뢰성 높음)
        if (window.supabaseClient) {
            console.log('🔍 Supabase에서 배송준비 주문 조회...');
            const { data: orders, error } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .eq('order_status', '배송준비')
                .order('order_date', { ascending: false });
            
            if (error) {
                throw new Error(`주문 조회 실패: ${error.message}`);
            }
            readyOrders = orders || [];
            console.log('✅ Supabase 조회 완료:', readyOrders.length + '건');
        } else if (window.orderDataManager) {
            // 폴백: orderDataManager 사용
            console.log('🔄 orderDataManager 폴백 사용');
            const allOrders = window.orderDataManager.getAllOrders();
            readyOrders = allOrders.filter(order => 
                order.order_status === '배송준비' || order.status === '배송준비'
            );
        } else {
            alert('주문 데이터를 불러올 수 없습니다.\n\nSupabase 연결을 확인해주세요.');
            return;
        }
        
        console.log(`📦 배송준비 주문: ${readyOrders.length}건`);
        
        if (readyOrders.length === 0) {
            alert('배송준비 상태의 주문이 없습니다.\n\n주문관리에서 주문 상태를 "배송준비"로 변경해주세요.');
            return;
        }
        
        // 2. 로젠택배 양식 데이터 생성 - 템플릿에서 헤더 구조 불러오기
        const rozenData = [];
        
        // 템플릿에서 헤더 구조 불러오기
        let templateContent = await loadTemplateFromSupabase();
        let headerRow;
        
        if (templateContent) {
            // 템플릿에서 헤더 추출
            const lines = templateContent.trim().split('\n').filter(line => line && !line.startsWith('※'));
            if (lines.length > 0) {
                const templateHeaders = lines[0].split(',');
                headerRow = templateHeaders;
                console.log('✅ 템플릿에서 헤더 불러옴:', headerRow);
            } else {
                throw new Error('템플릿 헤더를 찾을 수 없습니다.');
            }
        } else {
            // 기본 헤더 (템플릿이 없을 경우)
            headerRow = [
                '수하인명',         // A
                '',                 // B (빈칸)
                '수하인주소',       // C
                '수하인전화번호',   // D
                '수하인핸드폰번호', // E
                '택배수량',         // F
                '택배운임',         // G
                '운임구분',         // H
                '품목명',           // I
                '',                 // J (빈칸)
                '배송메세지'        // K
            ];
            console.log('⚠️ 템플릿이 없어 기본 헤더 사용');
        }
        
        rozenData.push(headerRow);
        
        // 2행부터: 주문 데이터 - 템플릿 헤더 순서에 맞춰 매핑
        readyOrders.forEach(order => {
            // 데이터 맵 생성 (헤더 이름 → 값)
            const dataMap = {
                '수하인명': order.customer_name || '',
                '수하인주소': order.customer_address || order.address || '',
                '수하인전화번호': '',
                '수하인핸드폰번호': order.customer_phone || order.phone || '',
                '택배수량': '1',
                '택배운임': '3800',
                '운임구분': '010',
                '품목명': extractItemNames(order.items ?? []),
                '배송메세지': order.memo || order.shipping_message || ''
            };
            
            // 템플릿 헤더 순서에 맞춰 데이터 행 생성
            const row = headerRow.map(header => {
                // 헤더 이름 정규화 (공백 제거, 대소문자 무시)
                const normalizedHeader = header.trim();
                return dataMap[normalizedHeader] !== undefined 
                    ? dataMap[normalizedHeader] 
                    : '';
            });
            
            rozenData.push(row);
        });
        
        // 3. Excel 파일 생성
        const ws = XLSX.utils.aoa_to_sheet(rozenData);
        
        // 컬럼 너비 설정 - 템플릿 헤더 개수에 맞춰 동적으로 생성
        const defaultWidths = {
            '수하인명': 12,
            '수하인주소': 50,
            '수하인전화번호': 15,
            '수하인핸드폰번호': 15,
            '택배수량': 8,
            '택배운임': 8,
            '운임구분': 8,
            '품목명': 30,
            '배송메세지': 25
        };
        
        const cols = headerRow.map(header => {
            const normalizedHeader = header.trim();
            return { wch: defaultWidths[normalizedHeader] || 10 };
        });
        ws['!cols'] = cols;
        
        // 헤더 스타일
        const headerStyle = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "CCE5FF" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
        
        // 헤더 셀 동적 생성 (A1, B1, C1...)
        const headerCells = headerRow.map((_, index) => {
            const colLetter = String.fromCharCode(65 + index); // A=65, B=66...
            return colLetter + '1';
        });
        
        headerCells.forEach(cell => {
            if (ws[cell]) {
                ws[cell].s = headerStyle;
            }
        });
        
        // 워크북 생성
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "로젠택배_주문관리");
        
        // 파일 다운로드
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        XLSX.writeFile(wb, `로젠택배_배송준비_${today}_${readyOrders.length}건.xlsx`);
        
        console.log(`✅ 로젠택배 Excel 생성 완료: ${readyOrders.length}건`);
        alert(`✅ 로젠택배 Excel 파일 생성 완료!\n\n총 ${readyOrders.length}건의 배송준비 주문이 포함되었습니다.`);
        
    } catch (error) {
        console.error('❌ 로젠택배 Excel 생성 실패:', error);
        alert('로젠택배 Excel 생성 중 오류가 발생했습니다:\n' + error.message);
    }
}

// order.items(farm_order_items)에서 물품명 추출. order_items JSONB 미사용.
function extractItemNames(orderItems) {
    try {
        let items = orderItems;
        if (typeof orderItems === 'string') {
            try { items = JSON.parse(orderItems); } catch (_) { return '상품'; }
        }
        if (!Array.isArray(items) || items.length === 0) return '상품';
        const itemList = items.map(item => {
            const name = item.name || item.product_name || '상품';
            const qty = item.quantity || item.qty || 1;
            return `${name} ${qty}개`;
        });
        
        // 첫 번째 상품만 표시 (+ 외 N건)
        if (itemList.length === 1) {
            return itemList[0];
        } else {
            return `${itemList[0]} 외 ${itemList.length - 1}건`;
        }
        
    } catch (error) {
        console.error('❌ 물품명 추출 실패:', error);
        return '상품';
    }
}

// Excel 템플릿 다운로드 - 로젠택배 정확한 양식 (.xlsx 형식)
async function downloadExcelTemplate(e) {
    e.preventDefault();
    
    try {
        console.log('📥 로젠택배 Excel 템플릿 생성 중...');
        
        // Supabase에서 저장된 템플릿 불러오기
        let templateContent = await loadTemplateFromSupabase();
        
        if (!templateContent) {
            // 기본 템플릿 - 로젠택배 양식 12개 컬럼
            templateContent = `주문번호,수화주명,우편번호,주소1,전화,휴대폰,택배수량,택배운임,선착불,물품명,선택옵션,배송메세지
local_1758265108787_rflo8qwb9,배은희,,경기 성남시 분당구 판교역로10번길 3 (백현동),01033334444,01033334444,1,3800,선불,하월시아 화이트골드 3개,선택안함,문앞에 놓아주세요
local_1758265108788_example2,홍길동,,서울시 강남구 테헤란로 123,01012345678,01012345678,1,3800,선불,다육식물 세트 5개,선택안함,경비실에 맡겨주세요`;
        }
        
        // CSV 텍스트를 배열로 변환
        const lines = templateContent.trim().split('\n').filter(line => line && !line.startsWith('※'));
        const inputData = lines.map(line => line.split(','));
        
        // 로젠택배 양식으로 변환 (AA~AL 컬럼)
        const rozenData = [];
        
        // 1행: 헤더 (컬럼명)
        const headerRow = new Array(27).fill(''); // A~Z까지 26열 비움
        headerRow.push(...inputData[0]); // 헤더 그대로 사용
        rozenData.push(headerRow);
        
        // 2행부터: 실제 데이터
        for (let i = 1; i < inputData.length; i++) {
            const row = inputData[i];
            const rozenRow = new Array(27).fill(''); // A~Z까지 26열 비움
            rozenRow.push(...row); // 데이터 그대로 사용 (12개 컬럼)
            rozenData.push(rozenRow);
        }
        
        // SheetJS를 사용하여 Excel 파일 생성
        const ws = XLSX.utils.aoa_to_sheet(rozenData);
        
        // 컬럼 너비 설정 (AA~AL만 표시되도록)
        const cols = new Array(27).fill({ wch: 2 }); // A~AA는 좁게
        cols.push({ wch: 25 }); // AA: 주문번호
        cols.push({ wch: 12 }); // AB: 수화주명
        cols.push({ wch: 8 });  // AC: 우편번호
        cols.push({ wch: 50 }); // AD: 주소1
        cols.push({ wch: 13 }); // AE: 전화
        cols.push({ wch: 13 }); // AF: 휴대폰
        cols.push({ wch: 8 });  // AG: 택배수량
        cols.push({ wch: 8 });  // AH: 택배운임
        cols.push({ wch: 8 });  // AI: 선착불
        cols.push({ wch: 30 }); // AJ: 물품명
        cols.push({ wch: 10 }); // AK: 선택안함
        cols.push({ wch: 25 }); // AL: 배송메세지
        ws['!cols'] = cols;
        
        // 1행 헤더 스타일 (AA~AL)
        const headerStyle = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "CCE5FF" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
        const headerCells = ['AA1', 'AB1', 'AC1', 'AD1', 'AE1', 'AF1', 'AG1', 'AH1', 'AI1', 'AJ1', 'AK1', 'AL1'];
        headerCells.forEach(cell => {
            if (ws[cell]) {
                ws[cell].s = headerStyle;
            }
        });
        
        // 워크북 생성
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "로젠택배_주문관리");
        
        // 설명 시트 추가
        const noteData = [
            ['📦 로젠택배 주문관리 Excel 템플릿 사용 방법'],
            [''],
            ['⚠️ 중요: 이 파일은 로젠택배 프로그램 전용 양식입니다.'],
            [''],
            ['📌 컬럼 구조 (AA~AL):'],
            ['   AA: 주문번호 (order_no) - 필수, 중복 시 병합'],
            ['   AB: 수화주명 (receiver_name) - 필수'],
            ['   AC: 우편번호 (zipcode) - 항상 빈칸, 로젠택배가 자동 채움'],
            ['   AD: 주소1 (address1) - 필수, 전체 주소'],
            ['   AE: 전화 (phone) - 자동: 휴대폰 번호 복사'],
            ['   AF: 휴대폰 (mobile) - 필수'],
            ['   AG: 택배수량 (parcel_qty) - 자동: 1'],
            ['   AH: 택배운임 (delivery_fee) - 자동: 3800'],
            ['   AI: 선착불 (payment_type) - 자동: 선불'],
            ['   AJ: 물품명 (item_name) - 필수 (예: "하월시아 화이트골드 3개")'],
            ['   AK: 선택옵션 (item_option) - 자동: 선택안함'],
            ['   AL: 배송메세지 (delivery_message) - 선택'],
            [''],
            ['✅ 입력해야 할 항목 (6개):'],
            ['   1. 주문번호 (AA)'],
            ['   2. 수화주명 (AB)'],
            ['   3. 주소1 (AD)'],
            ['   4. 휴대폰 (AF)'],
            ['   5. 물품명 (AJ) - "상품명 *개" 형식'],
            ['   6. 배송메세지 (AL) - 선택사항'],
            [''],
            ['🤖 자동으로 채워지는 항목 (6개):'],
            ['   - 우편번호 (AC): 빈칸'],
            ['   - 전화 (AE): 휴대폰과 동일'],
            ['   - 택배수량 (AG): 1'],
            ['   - 택배운임 (AH): 3800'],
            ['   - 선착불 (AI): 선불'],
            ['   - 선택안함 (AK): 선택안함'],
            [''],
            ['📝 작성 방법:'],
            ['   1. "로젠택배_주문관리" 시트 열기'],
            ['   2. 1행: 헤더(컬럼명) - 수정 금지'],
            ['   3. 2행부터: 실제 데이터 입력'],
            ['   4. 자동 채움 항목(우편번호, 전화, 수량, 운임, 선착불, 선택안함)은 건드리지 마세요'],
            ['   5. 작성 완료 후 저장'],
            ['   6. 로젠택배 프로그램에서 불러오기']
        ];
        
        const noteWs = XLSX.utils.aoa_to_sheet(noteData);
        noteWs['!cols'] = [{ wch: 80 }];
        XLSX.utils.book_append_sheet(wb, noteWs, "사용방법");
        
        // Excel 파일 다운로드
        XLSX.writeFile(wb, '로젠택배_배송일괄등록.xlsx');
        
        console.log('✅ 로젠택배 Excel 템플릿 다운로드 완료');
        
    } catch (error) {
        console.error('❌ Excel 템플릿 생성 실패:', error);
        alert('Excel 템플릿 생성에 실패했습니다: ' + error.message);
    }
}

// Supabase에서 템플릿 불러오기
async function loadTemplateFromSupabase() {
    try {
        console.log('📥 Supabase에서 배송 템플릿 불러오기...');
        
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트를 찾을 수 없습니다');
            return null;
        }
        
        const { data, error } = await window.supabaseClient
            .from('farm_settings_kv')
            .select('setting_value')
            .eq('setting_key', 'shipping_excel_template')
            .single();
        
        if (error) {
            if (error.code !== 'PGRST116') { // Not found 에러가 아닌 경우만 로그
                console.error('❌ 템플릿 불러오기 실패:', error);
            }
            return null;
        }
        
        if (data && data.setting_value) {
            console.log('✅ Supabase에서 템플릿 불러오기 완료');
            return data.setting_value;
        }
        
        return null;
    } catch (error) {
        console.error('❌ 템플릿 불러오기 중 오류:', error);
        return null;
    }
}

// Supabase에 템플릿 저장
async function saveTemplateToSupabase(templateContent) {
    try {
        console.log('💾 Supabase에 배송 템플릿 저장 중...');
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return false;
        }
        
        // 기존 템플릿이 있는지 확인
        const { data: existing } = await window.supabaseClient
            .from('farm_settings_kv')
            .select('id')
            .eq('setting_key', 'shipping_excel_template')
            .single();
        
        let result;
        if (existing) {
            // 업데이트
            result = await window.supabaseClient
                .from('farm_settings_kv')
                .update({
                    setting_value: templateContent,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', 'shipping_excel_template');
        } else {
            // 새로 삽입
            result = await window.supabaseClient
                .from('farm_settings_kv')
                .insert({
                    setting_key: 'shipping_excel_template',
                    setting_value: templateContent,
                    setting_type: 'text',
                    description: '배송 Excel 템플릿 양식'
                });
        }
        
        if (result.error) {
            console.error('❌ 템플릿 저장 실패:', result.error);
            return false;
        }
        
        console.log('✅ Supabase에 템플릿 저장 완료');
        return true;
    } catch (error) {
        console.error('❌ 템플릿 저장 중 오류:', error);
        return false;
    }
}

// 템플릿 편집 모달 표시 (로젠택배 양식: AA~AL)
async function showTemplateEditorModal() {
    // Supabase에서 저장된 템플릿 불러오기
    const savedTemplate = await loadTemplateFromSupabase();
    
    // 기본 템플릿: 로젠택배 양식 12개 컬럼
    const defaultTemplate = `주문번호,수화주명,우편번호,주소1,전화,휴대폰,택배수량,택배운임,선착불,물품명,선택옵션,배송메세지
local_1758265108787_rflo8qwb9,배은희,,경기 성남시 분당구 판교역로10번길 3 (백현동),01033334444,01033334444,1,3800,선불,하월시아 화이트골드 3개,선택안함,문앞에 놓아주세요
local_1758265108788_example2,홍길동,,서울시 강남구 테헤란로 123,01012345678,01012345678,1,3800,선불,다육식물 세트 5개,선택안함,경비실에 맡겨주세요`;
    
    const currentTemplate = savedTemplate || defaultTemplate;
    
    const modalHTML = `
        <div id="template-editor-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-heading">Excel 템플릿 양식 편집</h3>
                    <button id="close-template-editor" class="text-muted hover:text-body">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">
                            템플릿 컬럼 및 예시 데이터
                            <span class="text-xs text-muted ml-2">표 형태로 편집하세요</span>
                        </label>
                        
                        <!-- Excel 표 형태 편집 영역 -->
                        <div class="border border-gray-300 rounded-lg overflow-x-auto">
                            <table class="min-w-full table-ui" id="template-table">
                                <thead class="bg-page">
                                    <!-- Excel 컬럼 레터 (A, B, C...) -->
                                    <tr id="template-column-letters" class="border-b border-gray-300">
                                        <!-- 컬럼 레터가 동적으로 생성됩니다 -->
                                    </tr>
                                    <!-- 컬럼명 헤더 -->
                                    <tr id="template-header-row" class="bg-info">
                                        <!-- 헤더가 동적으로 생성됩니다 -->
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200" id="template-body">
                                    <!-- 데이터 행이 동적으로 생성됩니다 -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="flex space-x-2 mt-3">
                            <button id="add-template-column" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                <i class="fas fa-plus mr-1"></i>컬럼 추가
                            </button>
                            <button id="add-template-row" class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-plus mr-1"></i>행 추가
                            </button>
                            <button id="remove-template-row" class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                <i class="fas fa-minus mr-1"></i>마지막 행 삭제
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-info border border-blue-200 rounded-lg p-4">
                        <h4 class="text-sm font-semibold text-blue-900 mb-2">
                            <i class="fas fa-info-circle mr-1"></i>사용 방법
                        </h4>
                        <ul class="text-xs text-blue-800 space-y-1">
                            <li>• <strong>로젠택배 양식 (AA~AL, 12개 컬럼):</strong></li>
                            <li>&nbsp;&nbsp;1. 주문번호 (AA) - 필수</li>
                            <li>&nbsp;&nbsp;2. 수화주명 (AB) - 필수</li>
                            <li>&nbsp;&nbsp;3. 우편번호 (AC) - 빈칸 유지 (로젠택배 자동 채움)</li>
                            <li>&nbsp;&nbsp;4. 주소1 (AD) - 필수</li>
                            <li>&nbsp;&nbsp;5. 전화 (AE) - 휴대폰과 동일하게 입력</li>
                            <li>&nbsp;&nbsp;6. 휴대폰 (AF) - 필수</li>
                            <li>&nbsp;&nbsp;7. 택배수량 (AG) - 기본값: 1</li>
                            <li>&nbsp;&nbsp;8. 택배운임 (AH) - 기본값: 3800</li>
                            <li>&nbsp;&nbsp;9. 선착불 (AI) - 기본값: 선불</li>
                            <li>&nbsp;&nbsp;10. 물품명 (AJ) - 필수 (예: "하월시아 3개")</li>
                            <li>&nbsp;&nbsp;11. 선택옵션 (AK) - 기본값: 선택안함</li>
                            <li>&nbsp;&nbsp;12. 배송메세지 (AL) - 선택</li>
                        </ul>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button id="reset-template" class="px-4 py-2 text-sm text-body hover:text-heading border border-gray-300 rounded-lg hover:bg-section">
                            <i class="fas fa-undo mr-1"></i>기본 템플릿으로 초기화
                        </button>
                        <button id="preview-template" class="px-4 py-2 text-sm text-info hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-info">
                            <i class="fas fa-eye mr-1"></i>미리보기
                        </button>
                    </div>
                    
                    <!-- 미리보기 영역 -->
                    <div id="template-preview" class="hidden">
                        <h4 class="text-sm font-medium text-body mb-2">미리보기</h4>
                        <div class="border border-gray-300 rounded-lg overflow-x-auto">
                            <table id="preview-table" class="min-w-full table-ui">
                                <!-- 미리보기 테이블이 여기에 표시됩니다 -->
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancel-template-editor" class="px-4 py-2 text-body hover:text-heading">
                        취소
                    </button>
                    <button id="save-template" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 템플릿 데이터를 표로 변환
    parseTemplateToTable(currentTemplate);
    
    setupTemplateEditorEventListeners();
}

// Excel 컬럼 레터 생성 (A, B, C... Z, AA, AB...)
function getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode(65 + (index % 26)) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}

// 템플릿 텍스트를 표로 변환
function parseTemplateToTable(templateText) {
    const lines = templateText.trim().split('\n').filter(line => line && !line.startsWith('※'));
    if (lines.length === 0) return;
    
    // 헤더 생성
    const headers = lines[0].split(',');
    
    // Excel 컬럼 레터 행 생성 (AA, AB, AC...)
    const columnLettersRow = document.getElementById('template-column-letters');
    columnLettersRow.innerHTML = headers.map((_, index) => `
        <th class="px-4 py-2 text-center text-xs font-bold text-body bg-page border-r border-gray-300">
            ${getColumnLetter(index)}
        </th>
    `).join('') + `
        <th class="px-4 py-2 w-24 bg-page"></th>
    `;
    
    // 컬럼명 헤더 행 생성
    const headerRow = document.getElementById('template-header-row');
    headerRow.innerHTML = headers.map((header, index) => `
        <th class="px-4 py-3 text-left text-xs font-medium text-body uppercase tracking-wider border-r border-gray-200">
            <input type="text" 
                   value="${header.trim()}" 
                   class="header-input w-full px-2 py-1 border border-gray-300 rounded text-center font-bold"
                   data-col-index="${index}"
                   placeholder="컬럼명">
        </th>
    `).join('') + `
        <th class="px-4 py-3 text-center w-24">
            <button class="text-danger hover:text-red-800" onclick="removeLastColumn()">
                <i class="fas fa-times"></i>
            </button>
        </th>
    `;
    
    // 데이터 행 생성
    const tbody = document.getElementById('template-body');
    tbody.innerHTML = '';
    
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',');
        addTemplateRowToTable(cells, headers.length);
    }
    
    // 빈 행이 없으면 하나 추가
    if (lines.length === 1) {
        addTemplateRowToTable(new Array(headers.length).fill(''), headers.length);
    }
}

// 표에 행 추가
function addTemplateRowToTable(cells = [], columnCount = 6) {
    const tbody = document.getElementById('template-body');
    const row = document.createElement('tr');
    row.className = 'hover:bg-section';
    
    // 셀 개수를 컬럼 수에 맞춤
    while (cells.length < columnCount) {
        cells.push('');
    }
    
    row.innerHTML = cells.slice(0, columnCount).map((cell, index) => `
        <td class="px-4 border-r border-gray-200">
            <input type="text"
                   value="${(cell || '').trim()}"
                   class="data-input w-full px-2 py-1 border border-gray-200 rounded"
                   data-col-index="${index}"
                   placeholder="데이터">
        </td>
    `).join('') + `
        <td class="px-4 text-center">
            <button class="text-danger hover:text-red-800 text-sm" onclick="removeTemplateRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// 표에서 템플릿 텍스트 생성
function generateTemplateFromTable() {
    const headers = Array.from(document.querySelectorAll('.header-input'))
        .map(input => input.value.trim())
        .filter(h => h);
    
    if (headers.length === 0) {
        alert('최소한 하나의 컬럼명을 입력해주세요.');
        return null;
    }
    
    const rows = [headers.join(',')];
    
    const tbody = document.getElementById('template-body');
    const dataRows = tbody.querySelectorAll('tr');
    
    dataRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('.data-input'))
            .slice(0, headers.length)
            .map(input => input.value.trim());
        
        // 빈 행은 제외
        if (cells.some(cell => cell)) {
            rows.push(cells.join(','));
        }
    });
    
    return rows.join('\n');
}

// 컬럼 제거
function removeLastColumn() {
    const headerInputs = document.querySelectorAll('.header-input');
    if (headerInputs.length <= 1) {
        alert('최소한 하나의 컬럼은 필요합니다.');
        return;
    }
    
    // 컬럼 레터 마지막 제거
    const columnLettersRow = document.getElementById('template-column-letters');
    const lastLetter = columnLettersRow.children[columnLettersRow.children.length - 2];
    if (lastLetter) {
        lastLetter.remove();
    }
    
    // 헤더 마지막 컬럼 제거
    const headerRow = document.getElementById('template-header-row');
    const lastHeader = headerRow.children[headerRow.children.length - 2]; // 마지막은 삭제 버튼
    if (lastHeader) {
        lastHeader.remove();
    }
    
    // 모든 데이터 행의 마지막 셀 제거
    const tbody = document.getElementById('template-body');
    const dataRows = tbody.querySelectorAll('tr');
    dataRows.forEach(row => {
        const lastCell = row.children[row.children.length - 2]; // 마지막은 삭제 버튼
        if (lastCell) {
            lastCell.remove();
        }
    });
}

// 행 제거
function removeTemplateRow(button) {
    const row = button.closest('tr');
    const tbody = document.getElementById('template-body');
    
    if (tbody.children.length <= 1) {
        alert('최소한 하나의 예시 행은 필요합니다.');
        return;
    }
    
    row.remove();
}

// 전역 함수로 등록
window.removeLastColumn = removeLastColumn;
window.removeTemplateRow = removeTemplateRow;

// 템플릿 편집기 이벤트 리스너 설정
function setupTemplateEditorEventListeners() {
    // 닫기 버튼
    document.getElementById('close-template-editor').addEventListener('click', closeTemplateEditorModal);
    document.getElementById('cancel-template-editor').addEventListener('click', closeTemplateEditorModal);
    
    // 컬럼 추가 버튼
    document.getElementById('add-template-column').addEventListener('click', () => {
        const headerRow = document.getElementById('template-header-row');
        const currentColCount = headerRow.querySelectorAll('.header-input').length;
        
        // 컬럼 레터 추가
        const columnLettersRow = document.getElementById('template-column-letters');
        const newLetterCell = document.createElement('th');
        newLetterCell.className = 'px-4 py-2 text-center text-xs font-bold text-body bg-page border-r border-gray-300';
        newLetterCell.textContent = getColumnLetter(currentColCount);
        columnLettersRow.insertBefore(newLetterCell, columnLettersRow.lastElementChild);
        
        // 헤더에 새 컬럼 추가
        const newHeaderCell = document.createElement('th');
        newHeaderCell.className = 'px-4 py-3 text-left text-xs font-medium text-body uppercase tracking-wider border-r border-gray-200';
        newHeaderCell.innerHTML = `
            <input type="text" 
                   value="새컬럼" 
                   class="header-input w-full px-2 py-1 border border-gray-300 rounded text-center font-bold"
                   data-col-index="${currentColCount}"
                   placeholder="컬럼명">
        `;
        headerRow.insertBefore(newHeaderCell, headerRow.lastElementChild);
        
        // 모든 데이터 행에 새 셀 추가
        const tbody = document.getElementById('template-body');
        const dataRows = tbody.querySelectorAll('tr');
        dataRows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.className = 'px-4 py-2 border-r border-gray-200';
            newCell.innerHTML = `
                <input type="text" 
                       value="" 
                       class="data-input w-full px-2 py-1 border border-gray-200 rounded text-sm"
                       data-col-index="${currentColCount}"
                       placeholder="데이터">
            `;
            row.insertBefore(newCell, row.lastElementChild);
        });
    });
    
    // 행 추가 버튼
    document.getElementById('add-template-row').addEventListener('click', () => {
        const headerInputs = document.querySelectorAll('.header-input');
        const columnCount = headerInputs.length;
        addTemplateRowToTable(new Array(columnCount).fill(''), columnCount);
    });
    
    // 마지막 행 삭제 버튼
    document.getElementById('remove-template-row').addEventListener('click', () => {
        const tbody = document.getElementById('template-body');
        if (tbody.children.length <= 1) {
            alert('최소한 하나의 예시 행은 필요합니다.');
            return;
        }
        tbody.lastElementChild.remove();
    });
    
    // 초기화 버튼
    document.getElementById('reset-template').addEventListener('click', () => {
        const defaultTemplate = `주문번호,수화주명,우편번호,주소1,전화,휴대폰,택배수량,택배운임,선착불,물품명,선택옵션,배송메세지
local_1758265108787_rflo8qwb9,배은희,,경기 성남시 분당구 판교역로10번길 3 (백현동),01033334444,01033334444,1,3800,선불,하월시아 화이트골드 3개,선택안함,문앞에 놓아주세요
local_1758265108788_example2,홍길동,,서울시 강남구 테헤란로 123,01012345678,01012345678,1,3800,선불,다육식물 세트 5개,선택안함,경비실에 맡겨주세요`;
        parseTemplateToTable(defaultTemplate);
    });
    
    // 미리보기 버튼
    document.getElementById('preview-template').addEventListener('click', () => {
        const content = generateTemplateFromTable();
        if (content) {
            previewTemplate(content);
        }
    });
    
    // 저장 버튼
    document.getElementById('save-template').addEventListener('click', saveTemplate);
}

// 템플릿 미리보기
function previewTemplate(content) {
    const previewDiv = document.getElementById('template-preview');
    const previewTable = document.getElementById('preview-table');
    
    try {
        const lines = content.trim().split('\n');
        if (lines.length === 0) {
            alert('템플릿 내용이 비어있습니다.');
            return;
        }
        
        // 테이블 HTML 생성
        let tableHTML = '<thead class="bg-section"><tr>';
        const headers = lines[0].split(',');
        headers.forEach(header => {
            tableHTML += `<th class="px-4 py-2 text-left text-xs font-medium text-body uppercase tracking-wider">${header.trim()}</th>`;
        });
        tableHTML += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
        
        // 데이터 행
        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',');
            tableHTML += '<tr>';
            cells.forEach(cell => {
                tableHTML += `<td class="px-4 td-secondary">${cell.trim()}</td>`;
            });
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody>';
        
        previewTable.innerHTML = tableHTML;
        previewDiv.classList.remove('hidden');
        
    } catch (error) {
        alert('템플릿 형식이 올바르지 않습니다: ' + error.message);
    }
}

// 템플릿 저장
async function saveTemplate() {
    const content = generateTemplateFromTable();
    
    if (!content) {
        alert('템플릿 내용을 입력해주세요.');
        return;
    }
    
    // 최소한 헤더가 있는지 확인
    const lines = content.split('\n');
    if (lines.length < 1) {
        alert('최소한 컬럼명(헤더)을 입력해주세요.');
        return;
    }
    
    // 필수 컬럼 확인 (로젠택배 양식)
    const headers = lines[0].toLowerCase();
    const requiredColumns = ['주문번호', '수화주명', '주소1', '휴대폰', '물품명'];
    const missingColumns = [];
    
    requiredColumns.forEach(col => {
        if (!headers.includes(col.toLowerCase())) {
            missingColumns.push(col);
        }
    });
    
    if (missingColumns.length > 0) {
        if (!confirm(`템플릿에 필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}\n계속하시겠습니까?`)) {
            return;
        }
    }
    
    // Supabase에 저장
    const saved = await saveTemplateToSupabase(content);
    
    if (saved) {
        alert('✅ 템플릿이 저장되었습니다!');
        closeTemplateEditorModal();
    } else {
        alert('❌ 템플릿 저장에 실패했습니다. 다시 시도해주세요.');
    }
}

// 템플릿 편집기 모달 닫기
function closeTemplateEditorModal() {
    const modal = document.getElementById('template-editor-modal');
    if (modal) {
        modal.remove();
    }
}

// 수동 입력 행 추가
function addManualRow() {
    const container = document.getElementById('manual-rows');
    const rowIndex = container.children.length;
    
    const rowHTML = `
        <div class="grid grid-cols-4 gap-2 items-center p-2 bg-section rounded">
            <input type="text" placeholder="주문번호" class="px-2 py-1 border border-gray-300 rounded text-sm">
            <input type="text" placeholder="송장번호" class="px-2 py-1 border border-gray-300 rounded text-sm">
            <select class="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value="">택배사</option>
                <option value="cj">CJ대한통운</option>
                <option value="hanjin">한진택배</option>
                <option value="lotte">롯데택배</option>
                <option value="logen">로젠택배</option>
                <option value="kdexp">대한통운</option>
                <option value="epost">우체국택배</option>
            </select>
            <div class="flex space-x-1">
                <input type="text" placeholder="메모" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                <button onclick="removeManualRow(this)" class="text-danger hover:text-red-800 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', rowHTML);
}

// 수동 입력 행 제거
window.removeManualRow = function(button) {
    button.closest('.grid').remove();
};

// 일괄 미리보기 표시
function showBulkPreview(data) {
    const preview = document.getElementById('bulk-preview');
    const content = document.getElementById('preview-content');
    
    if (data.length === 0) {
        content.innerHTML = '<p class="text-muted">등록할 데이터가 없습니다.</p>';
    } else {
        content.innerHTML = `
            <p class="font-medium mb-2">총 ${data.length}건의 배송 정보가 등록됩니다:</p>
            <div class="space-y-1">
                ${data.slice(0, 5).map(row => `
                    <div class="text-sm">${row[0]} - ${row[1]} (${row[2]})</div>
                `).join('')}
                ${data.length > 5 ? `<div class="text-sm text-muted">... 외 ${data.length - 5}건</div>` : ''}
            </div>
        `;
    }
    
    preview.classList.remove('hidden');
    document.getElementById('confirm-bulk-shipping').disabled = false;
}

// 일괄 등록 확인
async function confirmBulkShipping() {
    try {
        console.log('📦 일괄 배송 등록 시작');
        
        // 로딩 표시
        const confirmBtn = document.getElementById('confirm-bulk-shipping');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
        confirmBtn.disabled = true;
        
        // 등록할 데이터 가져오기
        const bulkData = window.bulkShippingData || [];
        
        if (bulkData.length === 0) {
            alert('등록할 배송 데이터가 없습니다.');
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            return;
        }
        
        console.log('📊 등록할 배송 데이터:', bulkData.length + '건');
        
        // Supabase에 일괄 저장
        if (window.supabaseClient) {
            let successCount = 0;
            let failCount = 0;
            
            for (const row of bulkData) {
                try {
                    // Excel 행 데이터를 주문 정보로 변환
                    // row 형식: [주문번호, 수화주명, 우편번호, 주소1, 전화, 휴대폰, 택배수량, 택배운임, 선착불, 물품명, 선택옵션, 배송메세지]
                    const orderNumber = row[0] || '';
                    const trackingNumber = row[1] || ''; // 임시로 두 번째 컬럼을 송장번호로 사용
                    
                    if (!orderNumber) {
                        failCount++;
                        continue;
                    }
                    
                    // 주문번호로 주문 찾기
                    const { data: orders, error: findError } = await window.supabaseClient
                        .from('farm_orders')
                        .select('id')
                        .eq('order_number', orderNumber)
                        .limit(1);
                    
                    if (findError || !orders || orders.length === 0) {
                        console.warn('⚠️ 주문을 찾을 수 없음:', orderNumber);
                        failCount++;
                        continue;
                    }
                    
                    const orderId = orders[0].id;
                    
                    // 배송 정보 업데이트
                    const { error: updateError } = await window.supabaseClient
                        .from('farm_orders')
                        .update({
                            tracking_number: trackingNumber || null,
                            order_status: '배송중',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', orderId);
                    
                    if (updateError) {
                        console.error('❌ 주문 업데이트 실패:', orderNumber, updateError);
                        failCount++;
                    } else {
                        successCount++;
                        console.log('✅ 배송 등록 완료:', orderNumber);
                    }
                } catch (rowError) {
                    console.error('❌ 행 처리 실패:', row, rowError);
                    failCount++;
                }
            }
            
            console.log(`✅ 일괄 배송 등록 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
            
            if (successCount > 0) {
                alert(`일괄 배송 등록이 완료되었습니다!\n\n성공: ${successCount}건\n실패: ${failCount}건`);
            } else {
                alert(`일괄 배송 등록에 실패했습니다.\n\n실패: ${failCount}건`);
            }
        } else {
            throw new Error('Supabase 클라이언트를 찾을 수 없습니다.');
        }
        
        // 모달 닫기
        closeBulkShippingModal();
        
        // 배송 목록 새로고침
        await loadBasicShippingData();
        
    } catch (error) {
        console.error('❌ 일괄 배송 등록 실패:', error);
        alert('일괄 배송 등록에 실패했습니다: ' + error.message);
        
        // 버튼 상태 복원
        const confirmBtn = document.getElementById('confirm-bulk-shipping');
        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>일괄 등록';
            confirmBtn.disabled = false;
        }
    }
}

// 배송 데이터 내보내기
function exportShippingData() {
    try {
        console.log('📤 배송 데이터 내보내기 시작');
        
        // 내보내기 옵션 모달 표시
        showExportModal();
        
    } catch (error) {
        console.error('❌ 내보내기 실패:', error);
        alert('데이터 내보내기에 실패했습니다.');
    }
}

// 내보내기 모달 표시
function showExportModal() {
    const modalHTML = `
        <div id="export-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold text-heading mb-4">배송 데이터 내보내기</h3>
                
                <div class="space-y-4">
                    <!-- 내보내기 옵션 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">내보내기 옵션</label>
                        <select id="export-option" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="current">현재 배송 중인 주문</option>
                            <option value="completed">배송 완료된 주문</option>
                            <option value="delayed">배송 지연된 주문</option>
                            <option value="all">전체 배송 데이터</option>
                        </select>
                    </div>
                    
                    <!-- 날짜 범위 -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-body mb-2">시작일</label>
                            <input type="date" id="export-start-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-body mb-2">종료일</label>
                            <input type="date" id="export-end-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    
                    <!-- 파일 형식 -->
                    <div>
                        <label class="block text-sm font-medium text-body mb-2">파일 형식</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center">
                                <input type="radio" name="export-format" value="excel" checked class="mr-2">
                                Excel (.xlsx)
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="export-format" value="csv" class="mr-2">
                                CSV (.csv)
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="export-format" value="pdf" class="mr-2">
                                PDF (.pdf)
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- 버튼 -->
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancel-export" class="px-4 py-2 text-body hover:text-heading">취소</button>
                    <button id="confirm-export" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-download mr-2"></i>내보내기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 이벤트 리스너 설정
    document.getElementById('cancel-export').addEventListener('click', closeExportModal);
    document.getElementById('confirm-export').addEventListener('click', executeExport);
    
    // 오늘 날짜로 기본 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('export-end-date').value = today;
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('export-start-date').value = weekAgo;
}

// 내보내기 모달 닫기
function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.remove();
    }
}

// 내보내기 실행
async function executeExport() {
    try {
        const option = document.getElementById('export-option').value;
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        const format = document.querySelector('input[name="export-format"]:checked').value;
        
        console.log('📤 내보내기 설정:', { option, startDate, endDate, format });
        
        // 로딩 표시
        const confirmBtn = document.getElementById('confirm-export');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>내보내기 중...';
        confirmBtn.disabled = true;
        
        // 배송 데이터 수집
        const shippingData = await collectShippingData(option, startDate, endDate);
        
        // 파일 생성 및 다운로드
        await generateExportFile(shippingData, format);
        
        // 모달 닫기
        closeExportModal();
        
        alert('내보내기가 완료되었습니다!');
        
    } catch (error) {
        console.error('❌ 내보내기 실행 실패:', error);
        alert('내보내기에 실패했습니다: ' + error.message);
        
        // 버튼 상태 복원
        const confirmBtn = document.getElementById('confirm-export');
        confirmBtn.innerHTML = '<i class="fas fa-download mr-2"></i>내보내기';
        confirmBtn.disabled = false;
    }
}

// 배송 데이터 수집
async function collectShippingData(option, startDate, endDate) {
    console.log('📊 배송 데이터 수집 중...');
    
    if (!window.orderDataManager) {
        throw new Error('주문 데이터 관리자를 찾을 수 없습니다.');
    }
    
    const allOrders = window.orderDataManager.getAllOrders();
    let filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.order_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return orderDate >= start && orderDate <= end;
    });
    
    // 옵션별 필터링
    switch (option) {
        case 'current':
            filteredOrders = filteredOrders.filter(order => order.status === '배송중');
            break;
        case 'completed':
            filteredOrders = filteredOrders.filter(order => order.status === '배송완료');
            break;
        case 'delayed':
            filteredOrders = filteredOrders.filter(order => order.status === '배송지연');
            break;
        case 'all':
        default:
            // 전체 데이터
            break;
    }
    
    console.log(`✅ 수집된 배송 데이터: ${filteredOrders.length}건`);
    return filteredOrders;
}

// 내보내기 파일 생성
async function generateExportFile(data, format) {
    console.log(`📄 ${format.toUpperCase()} 파일 생성 중...`);
    
    switch (format) {
        case 'excel':
            await exportToExcel(data);
            break;
        case 'csv':
            await exportToCSV(data);
            break;
        case 'pdf':
            await exportToPDF(data);
            break;
        default:
            throw new Error('지원하지 않는 파일 형식입니다.');
    }
}

// Excel 내보내기
async function exportToExcel(data) {
    // Excel 파일 생성 로직
    const headers = ['주문번호', '고객명', '배송지', '배송상태', '송장번호', '택배사', '배송일'];
    const rows = data.map(order => [
        order.order_number || order.id,
        order.customer_name,
        order.shipping_address || '주소 없음',
        order.status,
        order.tracking_number || '송장번호 없음',
        order.carrier || '택배사 없음',
        new Date(order.order_date).toLocaleDateString('ko-KR')
    ]);
    
    // CSV 형태로 변환 (Excel 호환)
    const csvContent = [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    downloadFile(csvContent, 'shipping_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// CSV 내보내기
async function exportToCSV(data) {
    const headers = ['주문번호', '고객명', '배송지', '배송상태', '송장번호', '택배사', '배송일'];
    const rows = data.map(order => [
        order.order_number || order.id,
        order.customer_name,
        order.shipping_address || '주소 없음',
        order.status,
        order.tracking_number || '송장번호 없음',
        order.carrier || '택배사 없음',
        new Date(order.order_date).toLocaleDateString('ko-KR')
    ]);
    
    const csvContent = [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    downloadFile(csvContent, 'shipping_data.csv', 'text/csv');
}

// PDF 내보내기
async function exportToPDF(data) {
    // PDF 생성 로직 (간단한 HTML을 PDF로 변환)
    const htmlContent = `
        <html>
            <head>
                <title>배송 데이터 리포트</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>배송 데이터 리포트</h1>
                <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
                <p>총 건수: ${data.length}건</p>
                <table>
                    <tr>
                        <th>주문번호</th>
                        <th>고객명</th>
                        <th>배송지</th>
                        <th>배송상태</th>
                        <th>송장번호</th>
                        <th>택배사</th>
                        <th>배송일</th>
                    </tr>
                    ${data.map(order => `
                        <tr>
                            <td>${order.order_number || order.id}</td>
                            <td>${order.customer_name}</td>
                            <td>${order.shipping_address || '주소 없음'}</td>
                            <td>${order.status}</td>
                            <td>${order.tracking_number || '송장번호 없음'}</td>
                            <td>${order.carrier || '택배사 없음'}</td>
                            <td>${new Date(order.order_date).toLocaleDateString('ko-KR')}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
        </html>
    `;
    
    // 새 창에서 HTML 표시 (인쇄 가능)
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
}

// 파일 다운로드
function downloadFile(content, filename, mimeType) {
    // CSV 파일의 경우 한글 인코딩을 위한 BOM 추가
    let finalContent = content;
    if (mimeType === 'text/csv' || filename.endsWith('.csv')) {
        // UTF-8 BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        finalContent = BOM + content;
    }
    
    const blob = new Blob([finalContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 배송 데이터 필터링
function filterShippingData() {
    console.log('🔍 배송 데이터 필터링 중...');
    // 필터링 로직 구현
}

// 전역 함수로 등록
window.trackOrder = (orderId) => {
    console.log(`📦 주문 추적: ${orderId}`);
    // 주문별 추적 로직
};

window.editShipping = (orderId) => {
    console.log(`✏️ 배송 수정: ${orderId}`);
    // 배송 수정 로직
};

// 간단한 테스트용 배송추적 함수
function testShippingTracking() {
    console.log('🧪 테스트용 배송추적 시작');
    
    // 테스트용 송장번호 입력
    const trackingInput = document.getElementById('tracking-number-input');
    if (trackingInput) {
        trackingInput.value = '1234567890';
        console.log('✅ 테스트 송장번호 입력됨: 1234567890');
        
        // 추적 실행
        trackShipmentByNumber();
    } else {
        console.error('❌ 송장번호 입력 필드를 찾을 수 없습니다');
    }
}

// 송장번호 일괄입력 패널 열기/닫기 (배송관리 섹션)
async function openShippingTrackingPanel() {
    const panel = document.getElementById('shipping-tracking-panel');
    if (!panel) return;

    const isHidden = panel.classList.contains('hidden');
    if (!isHidden) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');

    const tbody = document.getElementById('shipping-tracking-rows');
    if (!tbody || !window.supabaseClient) return;

    tbody.innerHTML = `<tr><td colspan="6" class="px-2 text-center text-amber-600">불러오는 중...</td></tr>`;

    try {
        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('id, order_number, customer_name, order_items, total_amount, tracking_number, order_status')
            .eq('order_status', '배송준비')
            .order('order_date', { ascending: false });

        if (error || !orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-2 text-center text-amber-600">배송준비 상태의 주문이 없습니다</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const items = Array.isArray(o.order_items) ? o.order_items.map(i => i.product_name || i.name || '').filter(Boolean).join(', ') : '';
            return `<tr class="hover:bg-amber-50">
                <td class="px-2 td-primary">${o.order_number || o.id.slice(0,8)}</td>
                <td class="px-2 td-primary">${o.customer_name || ''}</td>
                <td class="px-2 td-secondary max-w-[120px] truncate" title="${items}">${items}</td>
                <td class="px-2 td-primary">${(o.total_amount||0).toLocaleString()}원</td>
                <td class="px-2">
                    <input type="text" class="shipping-tracking-input w-full border border-amber-300 rounded px-2 py-1 focus:ring-1 focus:ring-amber-400"
                        placeholder="송장번호 입력" value="${o.tracking_number || ''}" data-order-id="${o.id}">
                </td>
                <td class="px-2">
                    <button onclick="saveShippingOneTracking('${o.id}', this)" class="app-btn app-btn-soft text-2xs px-2 py-0.5">저장</button>
                </td>
            </tr>`;
        }).join('');

        // 전체 저장 버튼 (onclick으로 중복 등록 방지)
        const saveAllBtn = document.getElementById('shipping-tracking-save-all-btn');
        if (saveAllBtn) saveAllBtn.onclick = saveAllShippingTrackings;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-2 text-center text-danger">오류: ${e.message}</td></tr>`;
    }
}

async function saveShippingOneTracking(orderId, btn) {
    const row = btn.closest('tr');
    const input = row?.querySelector('.shipping-tracking-input');
    const trackingNum = input?.value?.trim();
    if (!trackingNum || !window.supabaseClient) return;

    const origText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;

    const { error } = await window.supabaseClient
        .from('farm_orders')
        .update({ tracking_number: trackingNum })
        .eq('id', orderId);

    btn.disabled = false;
    if (error) {
        btn.textContent = '실패';
        setTimeout(() => { btn.textContent = origText; }, 2000);
    } else {
        btn.textContent = '✓';
        input.classList.add('border-green-400', 'bg-success');
        setTimeout(() => { btn.textContent = origText; }, 2000);
    }
}

async function saveAllShippingTrackings() {
    const inputs = document.querySelectorAll('#shipping-tracking-rows .shipping-tracking-input');
    const btn = document.getElementById('shipping-tracking-save-all-btn');
    if (!btn) return;

    btn.textContent = '저장 중...';
    btn.disabled = true;

    let successCount = 0;
    for (const input of inputs) {
        const orderId = input.dataset.orderId;
        const trackingNum = input.value.trim();
        if (!trackingNum || !orderId || !window.supabaseClient) continue;
        const { error } = await window.supabaseClient
            .from('farm_orders')
            .update({ tracking_number: trackingNum })
            .eq('id', orderId);
        if (!error) successCount++;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save mr-1"></i>전체 저장';
    if (successCount > 0) {
        Swal?.fire({ icon: 'success', title: `${successCount}건 저장 완료`, timer: 1500, showConfirmButton: false });
    }
}

// 전역 함수로 등록
window.loadShippingManagementComponent = loadShippingManagementComponent;
window.trackShipmentByNumber = trackShipmentByNumber;
window.testShippingTracking = testShippingTracking;
window.closeRozenExcelPreview = closeRozenExcelPreview;
window.downloadRozenExcel = downloadRozenExcel;
window.openShippingTrackingPanel = openShippingTrackingPanel;
window.saveShippingOneTracking = saveShippingOneTracking;

// export for module import
export { loadShippingManagementComponent };
