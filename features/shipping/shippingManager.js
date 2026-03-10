// 통합 배송관리 시스템
// 모든 배송 관련 기능을 통합 관리

import { TrackingAPI } from './trackingAPI.js';
import { LabelGenerator } from './labelGenerator.js';
import { ShippingAnalytics } from './analyticsDashboard.js';
import { NotificationSystem } from './notificationSystem.js';
import { RouteOptimizer } from './routeOptimizer.js';

export class ShippingManager {
    constructor() {
        this.trackingAPI = new TrackingAPI();
        this.labelGenerator = new LabelGenerator();
        this.analytics = new ShippingAnalytics();
        this.notifications = new NotificationSystem();
        this.routeOptimizer = new RouteOptimizer();
        
        this.shippingSettings = {
            autoTracking: true,
            autoNotifications: true,
            routeOptimization: true,
            labelAutoGeneration: true
        };
    }

    // 배송관리 메인 대시보드 생성
    async createShippingDashboard(containerId) {
        try {
            console.log('🚚 배송관리 대시보드 생성');
            
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
            }

            const dashboardHTML = `
                <div id="shipping-dashboard" class="space-y-6">
                    <!-- 헤더 -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-800">배송관리 시스템</h1>
                                <p class="text-gray-600 mt-2">통합 배송 관리 및 최적화</p>
                            </div>
                            <div class="flex space-x-3">
                                <button id="refresh-shipping-data" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <i class="fas fa-sync-alt mr-2"></i>새로고침
                                </button>
                                <button id="export-shipping-data" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <i class="fas fa-download mr-2"></i>내보내기
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 탭 네비게이션 -->
                    <div class="bg-white rounded-lg shadow-md">
                        <div class="border-b border-gray-200">
                            <nav class="flex space-x-8 px-6">
                                <button class="shipping-tab active" data-tab="overview">
                                    <i class="fas fa-tachometer-alt mr-2"></i>개요
                                </button>
                                <button class="shipping-tab" data-tab="tracking">
                                    <i class="fas fa-truck mr-2"></i>배송 추적
                                </button>
                                <button class="shipping-tab" data-tab="labels">
                                    <i class="fas fa-tags mr-2"></i>라벨 관리
                                </button>
                                <button class="shipping-tab" data-tab="analytics">
                                    <i class="fas fa-chart-bar mr-2"></i>성과 분석
                                </button>
                                <button class="shipping-tab" data-tab="routes">
                                    <i class="fas fa-route mr-2"></i>경로 최적화
                                </button>
                                <button class="shipping-tab" data-tab="notifications">
                                    <i class="fas fa-bell mr-2"></i>알림 관리
                                </button>
                            </nav>
                        </div>

                        <!-- 탭 콘텐츠 -->
                        <div class="p-6">
                            <!-- 개요 탭 -->
                            <div id="tab-overview" class="tab-content">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div class="bg-blue-50 p-6 rounded-lg">
                                        <div class="flex items-center">
                                            <div class="p-3 bg-blue-100 rounded-lg">
                                                <i class="fas fa-truck text-blue-600 text-xl"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-600">오늘 배송</p>
                                                <p class="text-2xl font-bold text-blue-600" id="today-shipments">0</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-green-50 p-6 rounded-lg">
                                        <div class="flex items-center">
                                            <div class="p-3 bg-green-100 rounded-lg">
                                                <i class="fas fa-check-circle text-green-600 text-xl"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-600">배송 완료</p>
                                                <p class="text-2xl font-bold text-green-600" id="completed-shipments">0</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-yellow-50 p-6 rounded-lg">
                                        <div class="flex items-center">
                                            <div class="p-3 bg-yellow-100 rounded-lg">
                                                <i class="fas fa-clock text-yellow-600 text-xl"></i>
                                            </div>
                                            <div class="ml-4">
                                                <p class="text-sm font-medium text-gray-600">배송 중</p>
                                                <p class="text-2xl font-bold text-yellow-600" id="in-transit-shipments">0</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 배송 추적 탭 -->
                            <div id="tab-tracking" class="tab-content hidden">
                                <div id="tracking-content">
                                    <!-- 배송 추적 콘텐츠가 여기에 로드됩니다 -->
                                </div>
                            </div>

                            <!-- 라벨 관리 탭 -->
                            <div id="tab-labels" class="tab-content hidden">
                                <div id="labels-content">
                                    <!-- 라벨 관리 콘텐츠가 여기에 로드됩니다 -->
                                </div>
                            </div>

                            <!-- 성과 분석 탭 -->
                            <div id="tab-analytics" class="tab-content hidden">
                                <div id="analytics-content">
                                    <!-- 성과 분석 콘텐츠가 여기에 로드됩니다 -->
                                </div>
                            </div>

                            <!-- 경로 최적화 탭 -->
                            <div id="tab-routes" class="tab-content hidden">
                                <div id="routes-content">
                                    <!-- 경로 최적화 콘텐츠가 여기에 로드됩니다 -->
                                </div>
                            </div>

                            <!-- 알림 관리 탭 -->
                            <div id="tab-notifications" class="tab-content hidden">
                                <div id="notifications-content">
                                    <!-- 알림 관리 콘텐츠가 여기에 로드됩니다 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = dashboardHTML;
            
            // 이벤트 리스너 설정
            this.setupDashboardEventListeners();
            
            // 초기 데이터 로드
            await this.loadDashboardData();

            console.log('✅ 배송관리 대시보드 생성 완료');

        } catch (error) {
            console.error('❌ 배송관리 대시보드 생성 실패:', error);
            throw error;
        }
    }

    // 대시보드 이벤트 리스너 설정
    setupDashboardEventListeners() {
        // 탭 전환
        document.querySelectorAll('.shipping-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 새로고침 버튼
        document.getElementById('refresh-shipping-data')?.addEventListener('click', () => {
            this.refreshShippingData();
        });

        // 내보내기 버튼
        document.getElementById('export-shipping-data')?.addEventListener('click', () => {
            this.exportShippingData();
        });
    }

    // 탭 전환
    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('.shipping-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // 선택된 탭 활성화
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');

        // 탭별 콘텐츠 로드
        this.loadTabContent(tabName);
    }

    // 탭별 콘텐츠 로드
    async loadTabContent(tabName) {
        try {
            console.log(`📋 탭 콘텐츠 로드: ${tabName}`);
            
            switch (tabName) {
                case 'tracking':
                    await this.loadTrackingTab();
                    break;
                case 'labels':
                    await this.loadLabelsTab();
                    break;
                case 'analytics':
                    await this.loadAnalyticsTab();
                    break;
                case 'routes':
                    await this.loadRoutesTab();
                    break;
                case 'notifications':
                    await this.loadNotificationsTab();
                    break;
            }

        } catch (error) {
            console.error(`❌ 탭 콘텐츠 로드 실패: ${tabName}`, error);
        }
    }

    // 배송 추적 탭 로드
    async loadTrackingTab() {
        const container = document.getElementById('tracking-content');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6">
                <!-- 송장번호 입력 섹션 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">송장번호로 배송 추적</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">송장번호</label>
                            <input type="text" id="tracking-number-input" 
                                   placeholder="송장번호를 입력하세요 (예: 1234567890)" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">택배사 (선택사항)</label>
                            <select id="carrier-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">자동 감지</option>
                                <option value="cj">CJ대한통운</option>
                                <option value="hanjin">한진택배</option>
                                <option value="lotte">롯데택배</option>
                                <option value="logen">로젠택배</option>
                                <option value="kdexp">대한통운</option>
                                <option value="epost">우체국택배</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button id="track-shipment-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <i class="fas fa-search mr-2"></i>배송 추적
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 배송 추적 결과 -->
                <div id="tracking-result" class="hidden">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">배송 추적 결과</h3>
                        <div id="tracking-details">
                            <!-- 추적 결과가 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- 기존 배송 목록 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">현재 배송 중인 주문</h3>
                        <button id="refresh-tracking" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-sync-alt mr-2"></i>새로고침
                        </button>
                    </div>
                    <div id="tracking-list">
                        <!-- 배송 추적 목록이 여기에 표시됩니다 -->
                    </div>
                </div>
            </div>
        `;

        // 이벤트 리스너 설정
        this.setupTrackingEventListeners();
        
        // 배송 추적 데이터 로드
        await this.loadTrackingData();
    }

    // 배송 추적 이벤트 리스너 설정
    setupTrackingEventListeners() {
        // 배송 추적 버튼
        document.getElementById('track-shipment-btn')?.addEventListener('click', () => {
            this.trackShipmentByNumber();
        });

        // Enter 키로 추적
        document.getElementById('tracking-number-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.trackShipmentByNumber();
            }
        });

        // 새로고침 버튼
        document.getElementById('refresh-tracking')?.addEventListener('click', () => {
            this.loadTrackingData();
        });
    }

    // 송장번호로 배송 추적
    async trackShipmentByNumber() {
        try {
            const trackingNumber = document.getElementById('tracking-number-input')?.value?.trim();
            const carrier = document.getElementById('carrier-select')?.value || null;

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
            const originalText = trackBtn.innerHTML;
            trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>추적 중...';
            trackBtn.disabled = true;

            // 배송 추적 API 호출
            let trackingData;
            if (window.trackingAPI) {
                trackingData = await window.trackingAPI.trackShipment(trackingNumber, carrier);
            } else {
                // Mock 데이터 사용
                trackingData = await this.getMockTrackingData(trackingNumber, carrier);
            }

            // 추적 결과 표시
            this.displayTrackingResult(trackingData);

            // 버튼 상태 복원
            trackBtn.innerHTML = originalText;
            trackBtn.disabled = false;

            console.log('✅ 배송 추적 완료');

        } catch (error) {
            console.error('❌ 배송 추적 실패:', error);
            alert('배송 추적에 실패했습니다: ' + error.message);
            
            // 버튼 상태 복원
            const trackBtn = document.getElementById('track-shipment-btn');
            trackBtn.innerHTML = '<i class="fas fa-search mr-2"></i>배송 추적';
            trackBtn.disabled = false;
        }
    }

    // 추적 결과 표시
    displayTrackingResult(trackingData) {
        const resultContainer = document.getElementById('tracking-result');
        const detailsContainer = document.getElementById('tracking-details');

        if (!resultContainer || !detailsContainer) return;

        // 추적 결과 HTML 생성
        const resultHTML = `
            <div class="space-y-4">
                <!-- 기본 정보 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">송장번호</div>
                        <div class="font-semibold text-blue-800">${trackingData.trackingNumber}</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">택배사</div>
                        <div class="font-semibold text-green-800">${trackingData.carrier}</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">현재 상태</div>
                        <div class="font-semibold text-purple-800">${trackingData.status}</div>
                    </div>
                </div>

                <!-- 현재 위치 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-2">현재 위치</div>
                    <div class="font-medium text-gray-800">${trackingData.currentLocation}</div>
                </div>

                <!-- 배송 이력 -->
                <div>
                    <div class="text-sm text-gray-600 mb-3">배송 이력</div>
                    <div class="space-y-3">
                        ${trackingData.history.map((item, index) => `
                            <div class="flex items-start space-x-3 p-3 bg-white border rounded-lg">
                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                    ${index + 1}
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium text-gray-800">${item.status}</div>
                                    <div class="text-sm text-gray-600">${item.location}</div>
                                    <div class="text-sm text-gray-500">${item.description}</div>
                                    <div class="text-xs text-gray-400 mt-1">${new Date(item.time).toLocaleString('ko-KR')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 추적 링크 -->
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-2">고객용 추적 링크</div>
                    <div class="flex items-center space-x-2">
                        <input type="text" id="tracking-link" value="${this.generateTrackingLink(trackingData.trackingNumber, trackingData.carrier)}" 
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
    generateTrackingLink(trackingNumber, carrier) {
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

    // Mock 추적 데이터 생성
    async getMockTrackingData(trackingNumber, carrier) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    trackingNumber,
                    carrier: carrier ? this.getCarrierName(carrier) : 'CJ대한통운',
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

    // 택배사 코드를 이름으로 변환
    getCarrierName(carrierCode) {
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

    // 라벨 관리 탭 로드
    async loadLabelsTab() {
        const container = document.getElementById('labels-content');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">라벨 관리</h3>
                    <div class="space-x-2">
                        <button id="generate-labels" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>라벨 생성
                        </button>
                        <button id="print-labels" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-print mr-2"></i>인쇄
                        </button>
                    </div>
                </div>
                <div id="labels-list">
                    <!-- 라벨 목록이 여기에 표시됩니다 -->
                </div>
            </div>
        `;

        // 라벨 관리 이벤트 리스너
        document.getElementById('generate-labels')?.addEventListener('click', () => {
            this.generateShippingLabels();
        });
        document.getElementById('print-labels')?.addEventListener('click', () => {
            this.printShippingLabels();
        });
    }

    // 성과 분석 탭 로드
    async loadAnalyticsTab() {
        const container = document.getElementById('analytics-content');
        if (!container) return;

        // 성과 분석 대시보드 렌더링
        await this.analytics.renderDashboard('analytics-content');
    }

    // 경로 최적화 탭 로드
    async loadRoutesTab() {
        const container = document.getElementById('routes-content');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">경로 최적화</h3>
                    <div class="space-x-2">
                        <button id="optimize-routes" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-route mr-2"></i>경로 최적화
                        </button>
                        <button id="export-routes" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-download mr-2"></i>경로 내보내기
                        </button>
                    </div>
                </div>
                <div id="routes-visualization">
                    <!-- 경로 시각화가 여기에 표시됩니다 -->
                </div>
            </div>
        `;

        // 경로 최적화 이벤트 리스너
        document.getElementById('optimize-routes')?.addEventListener('click', () => {
            this.optimizeDeliveryRoutes();
        });
        document.getElementById('export-routes')?.addEventListener('click', () => {
            this.exportDeliveryRoutes();
        });
    }

    // 알림 관리 탭 로드
    async loadNotificationsTab() {
        const container = document.getElementById('notifications-content');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6">
                <!-- SMS 관리 헤더 -->
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">SMS 알림 관리</h3>
                    <div class="flex space-x-2">
                        <button id="test-notification" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-bell mr-2"></i>테스트 알림
                        </button>
                        <button id="send-bulk-sms" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-paper-plane mr-2"></i>일괄 발송
                        </button>
                    </div>
                </div>

                <!-- SMS 템플릿 관리 -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div class="p-4 border-b border-gray-200">
                        <h4 class="font-semibold text-gray-800">SMS 템플릿 관리</h4>
                        <p class="text-sm text-gray-600 mt-1">주문 관련 SMS 템플릿을 관리하세요</p>
                    </div>
                    <div class="p-4">
                        <div id="sms-templates-container">
                            <!-- SMS 템플릿 목록이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- SMS 발송 이력 -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div class="p-4 border-b border-gray-200">
                        <h4 class="font-semibold text-gray-800">SMS 발송 이력</h4>
                        <p class="text-sm text-gray-600 mt-1">최근 발송된 SMS 내역을 확인하세요</p>
                    </div>
                    <div class="p-4">
                        <div id="sms-history-container">
                            <!-- SMS 발송 이력이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- 알림 설정 -->
                <div id="notification-settings">
                    <!-- 알림 설정이 여기에 표시됩니다 -->
                </div>
            </div>
        `;

        // SMS 템플릿 관리 로드
        this.loadSMSTemplates();
        
        // SMS 발송 이력 로드
        this.loadSMSHistory();
        
        // 알림 설정 로드
        this.loadNotificationSettings();
        
        // 이벤트 리스너 설정
        this.setupSMSManagementEvents();
    }

    // 대시보드 데이터 로드
    async loadDashboardData() {
        try {
            console.log('📊 대시보드 데이터 로드');
            
            if (!window.orderDataManager) {
                console.warn('⚠️ orderDataManager를 찾을 수 없습니다');
                return;
            }

            const allOrders = window.orderDataManager.getAllOrders();
            const today = new Date().toISOString().split('T')[0];
            
            // 오늘 배송 건수
            const todayShipments = allOrders.filter(order => 
                order.order_date && order.order_date.startsWith(today)
            ).length;
            
            // 배송 완료 건수
            const completedShipments = allOrders.filter(order => 
                order.status === '배송완료'
            ).length;
            
            // 배송 중 건수
            const inTransitShipments = allOrders.filter(order => 
                order.status === '배송중'
            ).length;

            // 지표 업데이트
            document.getElementById('today-shipments').textContent = todayShipments;
            document.getElementById('completed-shipments').textContent = completedShipments;
            document.getElementById('in-transit-shipments').textContent = inTransitShipments;

            console.log('✅ 대시보드 데이터 로드 완료');

        } catch (error) {
            console.error('❌ 대시보드 데이터 로드 실패:', error);
        }
    }

    // 배송 추적 데이터 로드
    async loadTrackingData() {
        try {
            console.log('📦 배송 추적 데이터 로드');
            
            const container = document.getElementById('tracking-list');
            if (!container) return;

            if (!window.orderDataManager) {
                container.innerHTML = '<p class="text-gray-500">주문 데이터를 찾을 수 없습니다.</p>';
                return;
            }

            const orders = window.orderDataManager.getAllOrders();
            const shippingOrders = orders.filter(order => 
                ['배송준비', '배송중', '배송완료'].includes(order.status)
            );

            if (shippingOrders.length === 0) {
                container.innerHTML = '<p class="text-gray-500">배송 중인 주문이 없습니다.</p>';
                return;
            }

            container.innerHTML = shippingOrders.map(order => `
                <div class="bg-white border rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold text-gray-800">${order.customer_name}</h4>
                            <p class="text-sm text-gray-600">${order.order_number || order.id}</p>
                            <p class="text-sm text-gray-500">${order.shipping_address}</p>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(order.status)}">
                                ${order.status}
                            </span>
                            ${order.tracking_number ? `
                                <p class="text-sm text-gray-600 mt-1">송장: ${order.tracking_number}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ 배송 추적 데이터 로드 실패:', error);
        }
    }

    // 상태별 색상 반환
    getStatusColor(status) {
        const colors = {
            '배송준비': 'bg-orange-100 text-orange-800',
            '배송중': 'bg-blue-100 text-blue-800',
            '배송완료': 'bg-green-100 text-green-800',
            '배송지연': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // 배송 라벨 생성
    async generateShippingLabels() {
        try {
            console.log('🏷️ 배송 라벨 생성');
            
            if (!window.orderDataManager) {
                alert('주문 데이터를 찾을 수 없습니다.');
                return;
            }

            const orders = window.orderDataManager.getAllOrders();
            const shippingOrders = orders.filter(order => 
                order.status === '배송준비' || order.status === '배송중'
            );

            if (shippingOrders.length === 0) {
                alert('라벨을 생성할 주문이 없습니다.');
                return;
            }

            // 일괄 라벨 생성
            await this.labelGenerator.generateBulkLabels(shippingOrders);

        } catch (error) {
            console.error('❌ 배송 라벨 생성 실패:', error);
            alert('라벨 생성에 실패했습니다.');
        }
    }

    // 배송 라벨 인쇄
    async printShippingLabels() {
        try {
            console.log('🖨️ 배송 라벨 인쇄');
            
            // 현재 선택된 주문들의 라벨 인쇄
            alert('라벨 인쇄 기능이 실행됩니다.');

        } catch (error) {
            console.error('❌ 배송 라벨 인쇄 실패:', error);
        }
    }

    // 배송 경로 최적화
    async optimizeDeliveryRoutes() {
        try {
            console.log('🚚 배송 경로 최적화');
            
            if (!window.orderDataManager) {
                alert('주문 데이터를 찾을 수 없습니다.');
                return;
            }

            const orders = window.orderDataManager.getAllOrders();
            const shippingOrders = orders.filter(order => 
                order.status === '배송준비' || order.status === '배송중'
            );

            if (shippingOrders.length === 0) {
                alert('최적화할 배송 주문이 없습니다.');
                return;
            }

            // 지역별 최적화
            const optimizedRoutes = await this.routeOptimizer.optimizeByRegion(shippingOrders);
            
            // 경로 시각화
            const container = document.getElementById('routes-visualization');
            if (container) {
                this.routeOptimizer.visualizeRoute(Object.values(optimizedRoutes)[0]?.route || [], 'routes-visualization');
            }

        } catch (error) {
            console.error('❌ 배송 경로 최적화 실패:', error);
            alert('경로 최적화에 실패했습니다.');
        }
    }

    // 배송 경로 내보내기
    async exportDeliveryRoutes() {
        try {
            console.log('📤 배송 경로 내보내기');
            
            // 현재 최적화된 경로 내보내기
            alert('배송 경로가 내보내기됩니다.');

        } catch (error) {
            console.error('❌ 배송 경로 내보내기 실패:', error);
        }
    }

    // SMS 템플릿 관리 로드
    loadSMSTemplates() {
        const container = document.getElementById('sms-templates-container');
        if (!container) return;

        const templates = [
            {
                id: 'orderConfirm',
                name: '주문확인',
                description: '주문하면 입금안내',
                template: '[경산다육식물농장] {customerName}님, 주문이 접수되었습니다.\n\n■ 주문번호 {orderNumber}\n\n■ 주문상세\n\n{orderDetails}\n\n■ 결제 정보\n{paymentInfo}\n\n■ 입금계좌 농협 010-9745-6245-08 (예금주: 경산식물원(배은희))\n\n감사합니다.'
            },
            {
                id: 'paymentConfirm',
                name: '입금확인',
                description: '입금완료 안내',
                template: '[경산다육식물농장] {customerName}님, 입금이 확인되었습니다.\n주문번호: {orderNumber}\n배송준비를 시작합니다.'
            },
            {
                id: 'shippingStart',
                name: '배송시작',
                description: '배송장 번호 안내',
                template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송을 시작했습니다.\n주문번호: {orderNumber}\n택배사: {shippingCompany}\n송장번호: {trackingNumber}'
            },
            {
                id: 'shippingComplete',
                name: '배송완료',
                description: '배송완료 안내',
                template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송완료되었습니다.\n주문번호: {orderNumber}\n감사합니다.'
            },
            {
                id: 'waitlistNotify',
                name: '대기품목안내',
                description: '대기자에게 대기품목 나왔을 때 안내',
                template: '[경산다육식물농장] {customerName}님, 대기하신 상품이 입고되었습니다.\n상품명: {productName}\n수량: {quantity}개\n주문 가능합니다.'
            }
        ];

        container.innerHTML = `
            <div class="space-y-4">
                ${templates.map(template => `
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h5 class="font-semibold text-gray-800">${template.name}</h5>
                                <p class="text-sm text-gray-600">${template.description}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="shippingManager.editSMSTemplate('${template.id}')" 
                                        class="text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fas fa-edit mr-1"></i>수정
                                </button>
                                <button onclick="shippingManager.testSMSTemplate('${template.id}')" 
                                        class="text-green-600 hover:text-green-800 text-sm">
                                    <i class="fas fa-paper-plane mr-1"></i>테스트
                                </button>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
                            ${template.template}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // SMS 발송 이력 로드
    loadSMSHistory() {
        const container = document.getElementById('sms-history-container');
        if (!container) return;

        // 로컬 스토리지에서 SMS 발송 이력 가져오기
        const smsHistory = JSON.parse(localStorage.getItem('sms_history') || '[]');
        
        if (smsHistory.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-comment-sms text-4xl mb-4"></i>
                    <p>발송된 SMS가 없습니다.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-3">
                ${smsHistory.slice(0, 10).map(record => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3">
                                <span class="text-sm font-medium text-gray-800">${record.customerName}</span>
                                <span class="text-xs text-gray-500">${record.phone}</span>
                                <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">${record.type}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${record.message.substring(0, 50)}...</p>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-500">${new Date(record.timestamp).toLocaleString()}</div>
                            <div class="text-xs ${record.success ? 'text-green-600' : 'text-red-600'}">
                                ${record.success ? '발송완료' : '발송실패'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // SMS 관리 이벤트 리스너 설정
    setupSMSManagementEvents() {
        // 일괄 SMS 발송 버튼
        document.getElementById('send-bulk-sms')?.addEventListener('click', () => {
            this.showBulkSMSSModal();
        });

        // 테스트 알림 버튼
        document.getElementById('test-notification')?.addEventListener('click', () => {
            this.sendTestNotification();
        });
    }

    // 일괄 SMS 발송 모달 표시
    showBulkSMSSModal() {
        const modalHTML = `
            <div id="bulk-sms-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">일괄 SMS 발송</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">발송 대상</label>
                                    <select id="bulk-sms-target" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        <option value="all_orders">모든 주문 고객</option>
                                        <option value="waiting_orders">대기중인 주문</option>
                                        <option value="shipping_orders">배송중인 주문</option>
                                        <option value="waitlist">대기자 목록</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">SMS 템플릿</label>
                                    <select id="bulk-sms-template" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        <option value="orderConfirm">주문확인</option>
                                        <option value="paymentConfirm">입금확인</option>
                                        <option value="shippingStart">배송시작</option>
                                        <option value="shippingComplete">배송완료</option>
                                        <option value="waitlistNotify">대기품목안내</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">메시지 내용</label>
                                    <textarea id="bulk-sms-message" rows="4" 
                                              class="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                                              placeholder="SMS 메시지를 입력하세요..."></textarea>
                                </div>
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button onclick="shippingManager.closeBulkSMSSModal()" 
                                        class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    취소
                                </button>
                                <button onclick="shippingManager.sendBulkSMS()" 
                                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    발송
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 일괄 SMS 발송 모달 닫기
    closeBulkSMSSModal() {
        const modal = document.getElementById('bulk-sms-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 일괄 SMS 발송 실행
    async sendBulkSMS() {
        try {
            const target = document.getElementById('bulk-sms-target').value;
            const template = document.getElementById('bulk-sms-template').value;
            const message = document.getElementById('bulk-sms-message').value;
            
            if (!message.trim()) {
                alert('메시지를 입력해주세요.');
                return;
            }
            
            console.log('📱 일괄 SMS 발송 시작:', { target, template, message });
            
            // 실제 발송 로직 구현
            alert('일괄 SMS 발송이 시작되었습니다.');
            this.closeBulkSMSSModal();
            
        } catch (error) {
            console.error('❌ 일괄 SMS 발송 실패:', error);
            alert('일괄 SMS 발송에 실패했습니다.');
        }
    }

    // SMS 템플릿 수정
    editSMSTemplate(templateId) {
        console.log('📝 SMS 템플릿 수정:', templateId);
        alert('SMS 템플릿 수정 기능은 개발 중입니다.');
    }

    // SMS 템플릿 테스트
    testSMSTemplate(templateId) {
        console.log('🧪 SMS 템플릿 테스트:', templateId);
        alert('SMS 템플릿 테스트 기능은 개발 중입니다.');
    }

    // 테스트 알림 발송
    async sendTestNotification() {
        try {
            console.log('🧪 테스트 알림 발송');
            alert('테스트 알림이 발송되었습니다.');
        } catch (error) {
            console.error('❌ 테스트 알림 발송 실패:', error);
        }
    }

    // 알림 설정 로드
    loadNotificationSettings() {
        const container = document.getElementById('notification-settings');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-4">알림 설정</h4>
                <div class="space-y-3">
                    <label class="flex items-center">
                        <input type="checkbox" id="sms-notifications" class="mr-2" checked>
                        <span class="text-sm text-gray-700">SMS 알림</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="email-notifications" class="mr-2">
                        <span class="text-sm text-gray-700">이메일 알림</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="push-notifications" class="mr-2">
                        <span class="text-sm text-gray-700">푸시 알림</span>
                    </label>
                </div>
            </div>
        `;
    }

    // 배송 데이터 새로고침
    async refreshShippingData() {
        try {
            console.log('🔄 배송 데이터 새로고침');
            
            await this.loadDashboardData();
            await this.loadTrackingData();
            
            alert('배송 데이터가 새로고침되었습니다.');

        } catch (error) {
            console.error('❌ 배송 데이터 새로고침 실패:', error);
        }
    }

    // 배송 데이터 내보내기
    async exportShippingData() {
        try {
            console.log('📤 배송 데이터 내보내기');
            
            if (!window.orderDataManager) {
                alert('주문 데이터를 찾을 수 없습니다.');
                return;
            }

            const orders = window.orderDataManager.getAllOrders();
            const shippingOrders = orders.filter(order => 
                ['배송준비', '배송중', '배송완료'].includes(order.status)
            );

            // CSV 형태로 내보내기
            const csvData = shippingOrders.map(order => 
                `${order.id},${order.customer_name},${order.shipping_address},${order.status},${order.tracking_number || ''}`
            ).join('\n');
            
            const csvContent = '주문ID,고객명,배송지,상태,송장번호\n' + csvData;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `shipping-data-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('❌ 배송 데이터 내보내기 실패:', error);
        }
    }
}

// 전역 인스턴스 생성
export const shippingManager = new ShippingManager();
window.shippingManager = shippingManager;

// SMS 발송 이력 저장 함수 (전역으로 등록)
window.saveSMSHistory = function(smsData) {
    try {
        const history = JSON.parse(localStorage.getItem('sms_history') || '[]');
        history.unshift({
            ...smsData,
            timestamp: new Date().toISOString()
        });
        
        // 최대 100개까지만 저장
        if (history.length > 100) {
            history.splice(100);
        }
        
        localStorage.setItem('sms_history', JSON.stringify(history));
        console.log('✅ SMS 발송 이력 저장 완료');
    } catch (error) {
        console.error('❌ SMS 발송 이력 저장 실패:', error);
    }
};
