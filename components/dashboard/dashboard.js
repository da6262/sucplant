/**
 * 대시보드 컴포넌트 스크립트
 * 경산다육식물농장 관리시스템
 */

class DashboardComponent {
    constructor() {
        this.isInitialized = false;
        this.charts = {};
        this.refreshInterval = null;
        this.timeInterval = null;
        this.data = {
            orders: [],
            customers: [],
            products: [],
            waitlist: []
        };
        this.lastUpdateTime = null;
        this.isUpdating = false;
    }

    /**
     * 컴포넌트 초기화
     */
    init(container, data = {}) {
        if (this.isInitialized) return;
        
        console.log('🏗️ Dashboard 컴포넌트 초기화...');
        
        // 컨테이너 저장
        this.container = container;
        
        // Supabase 연결 상태 확인
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            this.showConnectionError();
            
            // Supabase 없이도 UI는 렌더링
            this.setupEventListeners();
            this.renderDashboard();
            
            // 2초 후 재시도
            setTimeout(() => {
                if (window.supabaseClient) {
                    console.log('🔄 Supabase 클라이언트 확인됨, 데이터 로드 시작...');
                    this.loadData();
                    this.setupCharts();
                    this.startAutoRefresh();
                    this.setupRealtimeSync();
                }
            }, 2000);
            
            this.isInitialized = true;
            return;
        }
        
        this.setupEventListeners();
        
        // 데이터 로드 후 렌더링
        this.loadData().then(() => {
            this.renderDashboard();
            this.setupCharts();
        });
        
        this.startAutoRefresh();
        this.setupRealtimeSync();
        
        this.isInitialized = true;
        console.log('✅ Dashboard 컴포넌트 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새로고침 버튼 (두 가지 ID 모두 지원)
        const refreshBtn = document.getElementById('refresh-dashboard-btn') || document.getElementById('refresh-realtime');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // 내보내기 버튼
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboard();
            });
        }

        // 카드 클릭 이벤트
        const cards = document.querySelectorAll('[id$="-card"]');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleCardClick(card.id);
            });
        });

        // 차트 기간 버튼
        const chartButtons = document.querySelectorAll('[id^="chart-"]');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChartPeriodChange(e.target.id);
            });
        });
    }

    /**
     * 데이터 로드 (Supabase 전용)
     */
    async loadData() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
            console.log('📊 대시보드 데이터 로드 중...');
            
            // Supabase 클라이언트 확인 및 재초기화 시도
            if (!window.supabaseClient) {
                console.log('🔄 Supabase 클라이언트가 없습니다. 재초기화 시도...');
                
                // 재초기화 시도
                if (window.initializeSupabaseClient) {
                    const initialized = window.initializeSupabaseClient();
                    if (!initialized) {
                        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
                    }
                } else {
                    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
                }
            }
            
            console.log('☁️ Supabase에서 데이터 로드 중...');
            await this.loadDataFromSupabase();
            
            this.lastUpdateTime = new Date();
            this.updateLastUpdatedDisplay();
            console.log('✅ 대시보드 데이터 로드 완료');
            
        } catch (error) {
            console.error('❌ 대시보드 데이터 로드 실패:', error);
            
            // 사용자에게 오류 알림
            if (error.message.includes('Supabase')) {
                console.warn('⚠️ Supabase 연결 문제로 인해 대시보드 데이터를 불러올 수 없습니다.');
                this.showConnectionError(error);
            }
            
            // 에러 발생 시 빈 데이터로 초기화
            this.data = {
                orders: [],
                customers: [],
                products: [],
                waitlist: []
            };
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * 연결 오류 표시
     */
    showConnectionError() {
        const dashboardContainer = this.container;
        if (!dashboardContainer) return;

        const detail = (() => {
            try {
                // Error 객체/문자열 모두 처리
                if (!arguments || arguments.length === 0) return '';
                const err = arguments[0];
                if (!err) return '';
                const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
                return msg ? String(msg) : '';
            } catch (_) {
                return '';
            }
        })();
        
        // 오류 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                <div>
                    <h3 class="text-red-800 font-semibold">데이터베이스 연결 오류</h3>
                    <p class="text-red-600 text-sm mt-1">Supabase 연결에 문제가 있습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.</p>
                    ${detail ? `<p class="text-red-700 text-xs mt-2 break-all">상세: ${detail}</p>` : ''}
                </div>
            </div>
        `;
        
        // 기존 오류 메시지 제거
        const existingError = dashboardContainer.querySelector('.bg-red-50');
        if (existingError) {
            existingError.remove();
        }
        
        // 오류 메시지 추가
        dashboardContainer.insertBefore(errorDiv, dashboardContainer.firstChild);
    }

    /**
     * Supabase에서 데이터 로드
     * 주문은 get_order_rows RPC 단일 경로만 사용 (데이터 무결성).
     */
    async loadDataFromSupabase() {
        try {
            // Supabase 연결 테스트
            console.log('🔍 Supabase 연결 테스트 중...');
            console.log('🔍 Supabase 클라이언트 상태:', {
                'window.supabaseClient': typeof window.supabaseClient,
                'window.supabase': typeof window.supabase,
                'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG
            });
            
            const rpcPayload = {
                p_filter_status: 'all',
                p_limit: 2000,
                p_offset: 0,
                p_date_from: null,
                p_date_to: null,
                p_channel: null,
                p_search_text: null
            };
            const [ordersResult, customersResult, productsResult, waitlistResult] = await Promise.all([
                window.supabaseClient.rpc('get_order_rows', rpcPayload),
                window.supabaseClient.from('farm_customers').select('*'),
                window.supabaseClient.from('farm_products').select('*'),
                window.supabaseClient.from('farm_waitlist').select('*')
            ]);

            if (ordersResult.error) {
                console.error('❌ get_order_rows RPC 실패:', ordersResult.error);
                throw new Error(`주문 데이터 로드 실패: ${ordersResult.error.message}`);
            }
            if (customersResult.error) console.error('❌ farm_customers 조회 실패:', customersResult.error);
            if (productsResult.error) console.error('❌ farm_products 조회 실패:', productsResult.error);
            if (waitlistResult.error) console.error('❌ farm_waitlist 조회 실패:', waitlistResult.error);

            this.data.orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
            this.data.customers = customersResult.data || [];
            this.data.products = productsResult.data || [];
            this.data.waitlist = waitlistResult.data || [];

            console.log('📊 데이터 로드 결과 (get_order_rows 단일 소스):', {
                orders: this.data.orders.length,
                customers: this.data.customers.length,
                products: this.data.products.length,
                waitlist: this.data.waitlist.length
            });
            console.log('✅ Supabase 데이터 로드 완료');
        } catch (error) {
            console.error('❌ Supabase 데이터 로드 실패:', error);
            console.error('❌ 오류 상세:', error.stack);
            throw error;
        }
    }


    /**
     * 대시보드 렌더링
     */
    renderDashboard() {
        this.updateLastUpdatedDisplay();
        this.updateSummaryCards();
        this.renderRecentOrders();
        this.renderStockAlerts();
        this.renderSystemStatus();
    }

    /**
     * 요약 카드 업데이트 (get_order_rows 기반, computeCountsFromOrderRows 공유)
     */
    updateSummaryCards() {
        console.log('📊 요약 카드 업데이트 시작');
        const orders = this.data.orders || [];
        const countRows = typeof window.computeCountsFromOrderRows === 'function'
            ? window.computeCountsFromOrderRows(orders)
            : [];
        const getCount = (statusKey) => (countRows.find(r => r.status_key === statusKey) || {}).count ?? 0;

        this.updateCard('pack-waiting-count', getCount('입금확인'));
        this.updateCard('packing-count', getCount('상품준비'));
        this.updateCard('ship-ready-count', getCount('배송준비'));

        // 재고 부족 상품 (5개 이하)
        const lowStockProducts = this.data.products?.filter(product => product.stock <= 5) || [];
        console.log('⚠️ 재고 부족 상품:', lowStockProducts.length);
        this.updateCard('low-stock-count', lowStockProducts.length);

        // 연락할 대기자 (우선순위 높음)
        const contactWaitlist = this.data.waitlist?.filter(item => item.priority <= 2) || [];
        console.log('📞 연락할 대기자:', contactWaitlist.length);
        this.updateCard('contact-waitlist-count', contactWaitlist.length);

        // 이번 달 신규 고객
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const newCustomers = this.data.customers?.filter(customer => {
            if (!customer.registration_date) return false;
            
            const customerDate = new Date(customer.registration_date);
            console.log('🔍 고객 등록일 확인:', {
                name: customer.name,
                registration_date: customer.registration_date,
                customerMonth: customerDate.getMonth(),
                customerYear: customerDate.getFullYear(),
                thisMonth: thisMonth,
                thisYear: thisYear
            });
            
            return customerDate.getMonth() === thisMonth && customerDate.getFullYear() === thisYear;
        }) || [];
        console.log('👥 이번 달 신규 고객:', newCustomers.length);
        this.updateCard('new-customers-count', newCustomers.length);
        
        console.log('✅ 요약 카드 업데이트 완료');
    }

    /**
     * 카드 업데이트
     */
    updateCard(elementId, value) {
        const element = document.getElementById(elementId);
        console.log(`🔍 카드 업데이트 시도: ${elementId} = ${value}`);
        
        if (element) {
            element.textContent = value;
            console.log(`✅ 카드 업데이트 성공: ${elementId} = ${value}`);
            
            // 프로그레스 바 업데이트
            this.updateProgressBar(elementId, value);
        } else {
            console.warn(`⚠️ 요소를 찾을 수 없습니다: ${elementId}`);
        }
    }

    /**
     * 프로그레스 바 업데이트
     */
    updateProgressBar(elementId, value) {
        const cardId = elementId.replace('-count', '-card');
        const card = document.getElementById(cardId);
        if (!card) return;

        const progressBar = card.querySelector('.bg-gradient-to-r');
        if (!progressBar) return;

        // 최대값 설정 (임시로 100으로 설정, 실제로는 비즈니스 로직에 따라 조정)
        const maxValue = 100;
        const percentage = Math.min((value / maxValue) * 100, 100);
        
        progressBar.style.width = `${percentage}%`;
        
        // 값에 따른 색상 변경
        if (value === 0) {
            progressBar.className = 'bg-gradient-to-r from-gray-400 to-gray-600 h-1 rounded-full transition-all duration-500';
        } else if (value <= 5) {
            progressBar.className = 'bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full transition-all duration-500';
        } else if (value <= 20) {
            progressBar.className = 'bg-gradient-to-r from-yellow-400 to-yellow-600 h-1 rounded-full transition-all duration-500';
        } else {
            progressBar.className = 'bg-gradient-to-r from-red-400 to-red-600 h-1 rounded-full transition-all duration-500';
        }
    }

    /**
     * 최근 주문 렌더링 (get_order_rows 행 스펙: order_created_at, order_status, order_id)
     */
    renderRecentOrders() {
        const container = document.getElementById('recent-orders-list');
        if (!container) return;

        const recentOrders = (this.data.orders || [])
            .sort((a, b) => new Date(b.order_created_at || 0) - new Date(a.order_created_at || 0))
            .slice(0, 5);

        container.innerHTML = '';

        if (recentOrders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">최근 주문이 없습니다.</p>';
            return;
        }

        const statusColors = {
            '주문접수': 'bg-blue-100 text-blue-800',
            '입금대기': 'bg-yellow-100 text-yellow-800',
            '입금확인': 'bg-green-100 text-green-800',
            '상품준비': 'bg-yellow-100 text-yellow-800',
            '배송준비': 'bg-purple-100 text-purple-800',
            '배송중': 'bg-purple-100 text-purple-800',
            '배송완료': 'bg-green-100 text-green-800',
            '주문취소': 'bg-red-100 text-red-800'
        };

        recentOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            const orderLabel = order.order_id ? String(order.order_id).slice(0, 8) + '…' : '주문';
            const status = order.order_status || '주문접수';
            const statusClass = statusColors[status] || 'bg-gray-100 text-gray-800';
            orderItem.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">${orderLabel}</div>
                    <div class="text-xs text-gray-500">${(order.customer_name || '').replace(/</g, '&lt;')}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${status}</span>
                    <span class="text-xs text-gray-500">${this.formatCurrency(order.total_amount || 0)}</span>
                </div>
            `;
            container.appendChild(orderItem);
        });
    }

    /**
     * 재고 알림 렌더링
     */
    renderStockAlerts() {
        const container = document.getElementById('stock-alerts-list');
        if (!container) return;

        const lowStockProducts = this.data.products.filter(product => product.stock <= 5);
        const outOfStockProducts = this.data.products.filter(product => product.stock === 0);

        container.innerHTML = '';

        if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">재고 알림이 없습니다.</p>';
            return;
        }

        // 품절 상품
        outOfStockProducts.forEach(product => {
            const alertItem = document.createElement('div');
            alertItem.className = 'flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg';
            alertItem.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-red-900">${product.name}</div>
                    <div class="text-xs text-red-600">품절</div>
                </div>
                <div class="text-red-600">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
            `;
            container.appendChild(alertItem);
        });

        // 재고 부족 상품
        lowStockProducts.forEach(product => {
            const alertItem = document.createElement('div');
            alertItem.className = 'flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg';
            alertItem.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-yellow-900">${product.name}</div>
                    <div class="text-xs text-yellow-600">재고: ${product.stock}개</div>
                </div>
                <div class="text-yellow-600">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
            `;
            container.appendChild(alertItem);
        });
    }

    /**
     * 시스템 상태 렌더링
     */
    renderSystemStatus() {
        const container = document.getElementById('system-status-list');
        if (!container) return;

        const statusItems = [
            {
                label: '데이터베이스',
                status: '정상',
                color: 'text-green-600',
                icon: 'fas fa-database'
            },
            {
                label: 'API 연결',
                status: '로컬 모드',
                color: 'text-yellow-600',
                icon: 'fas fa-cloud'
            },
            {
                label: '백업 상태',
                status: '최근 백업: 오늘',
                color: 'text-green-600',
                icon: 'fas fa-save'
            },
            {
                label: '시스템 메모리',
                status: '정상',
                color: 'text-green-600',
                icon: 'fas fa-memory'
            }
        ];

        container.innerHTML = '';

        statusItems.forEach(item => {
            const statusItem = document.createElement('div');
            statusItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            statusItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${item.icon} ${item.color}"></i>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${item.label}</div>
                        <div class="text-xs text-gray-500">${item.status}</div>
                    </div>
                </div>
                <div class="${item.color}">
                    <i class="fas fa-check-circle"></i>
                </div>
            `;
            container.appendChild(statusItem);
        });
    }

    /**
     * 차트 설정
     */
    setupCharts() {
        this.setupSalesTrendChart();
        this.setupOrderStatusChart();
    }

    /**
     * 매출 트렌드 차트 설정
     */
    setupSalesTrendChart() {
        const ctx = document.getElementById('sales-trend-chart');
        if (!ctx) return;

        if (this.charts.salesTrend) {
            this.charts.salesTrend.destroy();
            this.charts.salesTrend = null;
        }

        const salesData = this.calculateSalesTrendData();

        this.charts.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: '매출 (원)',
                    data: salesData.values,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                    pointBorderColor: 'rgb(255, 255, 255)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgb(156, 163, 175)',
                            callback: function(value) {
                                return new Intl.NumberFormat('ko-KR', {
                                    style: 'currency',
                                    currency: 'KRW',
                                    notation: 'compact'
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 주문 상태 차트 설정
     */
    setupOrderStatusChart() {
        const ctx = document.getElementById('order-status-chart');
        if (!ctx) return;

        if (this.charts.orderStatus) {
            this.charts.orderStatus.destroy();
            this.charts.orderStatus = null;
        }

        const statusData = this.calculateOrderStatusData();

        this.charts.orderStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: statusData.labels,
                datasets: [{
                    data: statusData.values,
                    backgroundColor: [
                        'rgb(59, 130, 246)',   // 주문접수
                        'rgb(245, 158, 11)',   // 포장중
                        'rgb(147, 51, 234)',   // 배송중
                        'rgb(34, 197, 94)',    // 배송완료
                        'rgb(239, 68, 68)'     // 취소
                    ],
                    borderWidth: 3,
                    borderColor: 'rgb(31, 41, 55)',
                    hoverBorderWidth: 4,
                    hoverBorderColor: 'rgb(255, 255, 255)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgb(156, 163, 175)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * 매출 트렌드 데이터 계산 (최근 7일)
     */
    calculateSalesTrendData() {
        const days = [];
        const values = [];

        const toLocalDateStr = (d) =>
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        // 최근 7일 데이터
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = toLocalDateStr(date);

            const dayOrders = (this.data.orders || []).filter(order => {
                const d = order.order_created_at ? new Date(order.order_created_at) : null;
                return d && toLocalDateStr(d) === dateKey;
            });
            
            const daySales = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            
            days.push(`${date.getMonth() + 1}/${date.getDate()}`);
            values.push(daySales);
        }
        
        return { labels: days, values: values };
    }

    /**
     * 주문 상태 데이터 계산
     */
    calculateOrderStatusData() {
        const statusCounts = {};
        (this.data.orders || []).forEach(order => {
            const st = order.order_status || '주문접수';
            statusCounts[st] = (statusCounts[st] || 0) + 1;
        });
        const labels = Object.keys(statusCounts);
        const values = Object.values(statusCounts);
        return { labels: labels, values: values };
    }

    /**
     * 차트 기간 변경 처리
     */
    handleChartPeriodChange(buttonId) {
        // 모든 버튼 비활성화
        document.querySelectorAll('[id^="chart-"]').forEach(btn => {
            btn.className = 'px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200';
        });
        
        // 선택된 버튼 활성화
        const selectedBtn = document.getElementById(buttonId);
        if (selectedBtn) {
            selectedBtn.className = 'px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200';
        }
        
        // 차트 업데이트
        this.updateSalesChart(buttonId);
    }

    /**
     * 매출 차트 업데이트
     */
    updateSalesChart(period) {
        if (!this.charts.sales) return;
        
        const salesData = this.calculateSalesDataForPeriod(period);
        this.charts.sales.data.labels = salesData.labels;
        this.charts.sales.data.datasets[0].data = salesData.values;
        this.charts.sales.update();
    }

    /**
     * 기간별 매출 데이터 계산
     */
    calculateSalesDataForPeriod(period) {
        const months = [];
        const values = [];
        let monthCount = 3;
        
        switch (period) {
            case 'chart-3months':
                monthCount = 3;
                break;
            case 'chart-6months':
                monthCount = 6;
                break;
            case 'chart-12months':
                monthCount = 12;
                break;
        }
        
        for (let i = monthCount - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const monthOrders = (this.data.orders || []).filter(order => {
                const d = order.order_created_at ? new Date(order.order_created_at) : null;
                return d && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
            });
            
            const monthSales = monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            
            months.push(`${date.getMonth() + 1}월`);
            values.push(monthSales);
        }
        
        return { labels: months, values: values };
    }

    /**
     * 카드 클릭 처리
     */
    handleCardClick(cardId) {
        console.log('🖱️ 카드 클릭:', cardId);
        
        // 해당 섹션으로 이동
        const sectionMap = {
            'pack-orders-card': 'orders',
            'ship-orders-card': 'orders',
            'low-stock-card': 'products',
            'contact-waitlist-card': 'waitlist',
            'new-customers-card': 'customers'
        };
        
        const targetSection = sectionMap[cardId];
        if (targetSection) {
            this.navigateToSection(targetSection);
        }
    }

    /**
     * 섹션으로 이동
     */
    navigateToSection(section) {
        // 탭 변경 이벤트 발생
        const event = new CustomEvent('tabChanged', {
            detail: { 
                previousTab: 'dashboard', 
                currentTab: section 
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 대시보드 새로고침
     */
    async refreshDashboard() {
        console.log('🔄 대시보드 새로고침...');
        
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>새로고침 중...';
        }
        
        await this.loadData();
        this.renderDashboard();
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>새로고침';
        }
        
        console.log('✅ 대시보드 새로고침 완료');
    }

    /**
     * 자동 새로고침 시작
     */
    startAutoRefresh() {
        // Supabase 실시간 동기화가 있으므로 5분마다만 새로고침 (백업용)
        this.refreshInterval = setInterval(() => {
            this.loadData();
            this.renderDashboard();
            this.updateCharts();
            this.updateCurrentTime();
        }, 5 * 60 * 1000);
        
        // 현재 시간 업데이트 (1초마다)
        this.timeInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    /**
     * 자동 새로고침 중지
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    /**
     * 현재 시간 업데이트 (실시간 시계)
     */
    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    /**
     * 최종 수정일·시간 표시 (데이터 로드/새로고침 시점)
     */
    updateLastUpdatedDisplay() {
        const el = document.getElementById('last-updated');
        if (!el) return;
        if (!this.lastUpdateTime) {
            el.textContent = '-';
            return;
        }
        const d = this.lastUpdateTime;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        el.textContent = `${dateStr} ${timeStr}`;
    }

    /**
     * 차트 업데이트
     */
    updateCharts() {
        if (this.charts.salesTrend) {
            const salesData = this.calculateSalesTrendData();
            this.charts.salesTrend.data.labels = salesData.labels;
            this.charts.salesTrend.data.datasets[0].data = salesData.values;
            this.charts.salesTrend.update('none'); // 애니메이션 없이 업데이트
        }

        if (this.charts.orderStatus) {
            const statusData = this.calculateOrderStatusData();
            this.charts.orderStatus.data.labels = statusData.labels;
            this.charts.orderStatus.data.datasets[0].data = statusData.values;
            this.charts.orderStatus.update('none');
        }
    }

    /**
     * 대시보드 내보내기
     */
    exportDashboard() {
        console.log('📤 대시보드 보고서 내보내기');
        // TODO: Excel/PDF 보고서 내보내기 구현
    }

    /**
     * 통화 포맷팅
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    }

    /**
     * 실시간 동기화 설정
     */
    setupRealtimeSync() {
        try {
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 없어 실시간 동기화를 설정할 수 없습니다.');
                return;
            }

            const tables = ['farm_orders', 'farm_customers', 'farm_products', 'farm_waitlist'];

            tables.forEach(tableName => {
                const channel = window.supabaseClient
                    .channel(`${tableName}_dashboard_changes`)
                    .on('postgres_changes', 
                        { 
                            event: '*', 
                            schema: 'public', 
                            table: tableName 
                        }, 
                        (payload) => {
                            console.log(`🔄 대시보드: ${tableName} 실시간 변경 감지:`, payload);
                            
                            // Supabase에서 최신 데이터 로드
                            this.loadData().then(() => {
                                this.renderDashboard();
                                this.updateCharts();
                                console.log('✅ 대시보드 실시간 동기화 완료');
                            });
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log(`✅ 대시보드: ${tableName} 실시간 구독 성공`);
                        } else {
                            console.warn(`⚠️ 대시보드: ${tableName} 실시간 구독 실패:`, status);
                        }
                    });

                this.realtimeChannels = this.realtimeChannels || [];
                this.realtimeChannels.push({ table: tableName, channel });
            });

            console.log('✅ 대시보드 실시간 동기화 설정 완료');
        } catch (error) {
            console.error('❌ 대시보드 실시간 동기화 설정 실패:', error);
        }
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        console.log('🗑️ Dashboard 컴포넌트 제거...');
        this.stopAutoRefresh();
        
        // 실시간 구독 해제
        if (this.realtimeChannels) {
            this.realtimeChannels.forEach(({ channel }) => {
                window.supabaseClient.removeChannel(channel);
            });
        }
        
        // 차트 제거
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        
        this.isInitialized = false;
    }
}

// 전역 스코프에 DashboardComponent 등록
window.DashboardComponent = DashboardComponent;

// 컴포넌트 등록
if (window.componentLoader) {
    window.componentLoader.registerComponent('dashboard', {
        template: 'components/dashboard/dashboard.html',
        script: 'components/dashboard/dashboard.js',
        init: (container, data) => {
            const dashboardComponent = new DashboardComponent();
            dashboardComponent.init(container, data);
            return dashboardComponent;
        }
    });
}

console.log('✅ Dashboard 컴포넌트 스크립트 로드 완료');
