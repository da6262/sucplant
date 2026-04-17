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
        const chartPeriodContainer = document.getElementById('chart-period-btns');
        if (chartPeriodContainer) {
            chartPeriodContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.chart-period-btn');
                if (!btn) return;
                chartPeriodContainer.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const days = parseInt(btn.dataset.period) || 7;
                this.setupSalesTrendChart(days);
            });
        }

        // 빠른 업무 버튼
        const quickMap = {
            'quick-new-order':       () => { this.navigateToSection('orders'); setTimeout(() => { if (window.openOrderModal) window.openOrderModal(); }, 400); },
            'quick-picking-list':    () => this.navigateToSection('orders'),
            'quick-packaging-labels':() => this.navigateToSection('orders'),
            'quick-new-customer':    () => { this.navigateToSection('customers'); setTimeout(() => { if (window.openCustomerModal) window.openCustomerModal(); }, 400); },
            'quick-add-waitlist':    () => { this.navigateToSection('waitlist'); setTimeout(() => { if (window.orderSystem?.openWaitlistModal) window.orderSystem.openWaitlistModal(); }, 400); },
            'quick-excel-export':    () => { if (window.exportLogenExcel) window.exportLogenExcel(); else this.navigateToSection('orders'); },
            'quick-stock-update':    () => this.navigateToSection('products'),
        };
        Object.entries(quickMap).forEach(([id, fn]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', fn);
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
        errorDiv.className = 'bg-danger border border-red-200 rounded-lg p-4 mb-4';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-danger mr-3"></i>
                <div>
                    <h3 class="text-red-800 font-semibold">데이터베이스 연결 오류</h3>
                    <p class="text-danger text-sm mt-1">Supabase 연결에 문제가 있습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.</p>
                    ${detail ? `<p class="text-red-700 text-xs mt-2 break-all">상세: ${detail}</p>` : ''}
                </div>
            </div>
        `;
        
        // 기존 오류 메시지 제거
        const existingError = dashboardContainer.querySelector('.bg-danger');
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
        this.updateSalesKPI();
        this.updateSummaryCards();
        this.renderRecentOrders();
        this.renderTopProducts();
        this.renderOpsEfficiency();
        this.renderCustomerAnalysis();
        this.renderStockAlerts();
        this.setupSalesTrendChart(this._chartPeriod || 7);
        this.setupOrderStatusChart();
    }

    /** 매출 KPI 카드 */
    updateSalesKPI() {
        const orders = this.data.orders || [];
        const fmt = (n) => '₩' + (n || 0).toLocaleString('ko-KR');
        const toLD = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
        const today = toLD(new Date());
        const thisMonth = today.slice(0, 7);
        const valid = orders.filter(o => !['주문취소','환불완료'].includes(o.order_status));
        const todayO = valid.filter(o => o.order_created_at && toLD(o.order_created_at) === today);
        const monthO = valid.filter(o => o.order_created_at && toLD(o.order_created_at).startsWith(thisMonth));
        const todayS = todayO.reduce((s,o) => s + (o.total_amount||0), 0);
        const monthS = monthO.reduce((s,o) => s + (o.total_amount||0), 0);
        const avgO = monthO.length > 0 ? Math.round(monthS / monthO.length) : 0;
        const customers = this.data.customers || [];
        const newC = customers.filter(c => { const d = c.registration_date || c.created_at; return d && toLD(d).startsWith(thisMonth); });
        const phoneOrders = {}; valid.forEach(o => { const p = (o.customer_phone_last4||'').trim(); if (p) phoneOrders[p] = (phoneOrders[p]||0)+1; });
        const totalB = Object.keys(phoneOrders).length;
        const repeatB = Object.values(phoneOrders).filter(c => c>=2).length;
        const repeatRate = totalB > 0 ? Math.round((repeatB/totalB)*100) : 0;
        const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('kpi-today-sales', fmt(todayS)); set('kpi-today-orders', `${todayO.length}건`);
        set('kpi-month-sales', fmt(monthS)); set('kpi-month-orders', `${monthO.length}건`);
        set('kpi-avg-order', fmt(avgO)); set('kpi-total-customers', `고객 ${customers.length}명`);
        set('kpi-new-customers', `${newC.length}명`); set('kpi-repeat-rate', `재구매 ${repeatRate}%`);
    }

    /** 인기 상품 TOP 5 */
    renderTopProducts() {
        const container = document.getElementById('top-products-list');
        if (!container) return;
        const orders = this.data.orders || [];
        const pc = {};
        orders.forEach(o => {
            if (['주문취소','환불완료'].includes(o.order_status)) return;
            (o.order_items_summary||'').split(',').forEach(item => {
                const t = item.trim(); if (!t) return;
                const m = t.match(/^(.+?)\s+(\d+)(?:개|건)$/);
                if (m) { pc[m[1].trim()] = (pc[m[1].trim()]||0) + (parseInt(m[2])||1); }
                else { const m2 = t.match(/^(.+?)\s+외\s+(\d+)건$/); if (m2) pc[m2[1].trim()] = (pc[m2[1].trim()]||0)+parseInt(m2[2])+1; else pc[t] = (pc[t]||0)+1; }
            });
        });
        const sorted = Object.entries(pc).sort((a,b) => b[1]-a[1]).slice(0,5);
        if (!sorted.length) { container.innerHTML = '<p class="text-muted text-center py-4">데이터 없음</p>'; return; }
        const max = sorted[0][1];
        const colors = ['text-brand','text-info','text-purple-500','text-warn','text-muted'];
        container.innerHTML = sorted.map(([name,qty],i) => `
            <div class="flex items-center gap-2 py-1">
                <span class="font-bold ${colors[i]} w-4 text-right">${i+1}</span>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between"><span class="truncate text-body">${name}</span><span class="text-muted tabular-nums flex-shrink-0 ml-1">${qty}건</span></div>
                    <div class="h-1 rounded-full bg-gray-100 mt-0.5"><div class="h-1 rounded-full bg-green-400" style="width:${Math.round((qty/max)*100)}%"></div></div>
                </div>
            </div>`).join('');
    }

    /** 운영 효율 */
    renderOpsEfficiency() {
        const orders = this.data.orders || [];
        const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        const total = orders.length;
        const completed = orders.filter(o => o.order_status === '배송완료').length;
        const cancelled = orders.filter(o => ['주문취소','환불완료'].includes(o.order_status)).length;

        // 배송 완료율
        const deliveryRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        set('ops-delivery-rate', `${deliveryRate}%`);

        // 취소율
        const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
        set('ops-cancel-rate', `${cancelRate}%`);

        // 주문→배송 평균 소요일 (d_day 활용)
        const shippedOrders = orders.filter(o => o.order_status === '배송완료' && o.d_day != null);
        const avgDays = shippedOrders.length > 0
            ? (shippedOrders.reduce((s,o) => s + Math.abs(parseInt(o.d_day)||0), 0) / shippedOrders.length).toFixed(1)
            : '-';
        set('ops-avg-ship-days', `${avgDays}일`);

        // 입금대기 3일+ 건수
        const overdue = orders.filter(o => o.order_status === '입금대기' && parseInt(o.d_day) >= 3).length;
        set('ops-overdue-count', `${overdue}건`);

        // 파이프라인 바
        const pipeline = document.getElementById('ops-pipeline');
        if (pipeline) {
            const statusFlow = ['주문접수','입금대기','입금확인','상품준비','배송준비','배송중','배송완료'];
            const colors = ['bg-gray-300','bg-yellow-300','bg-yellow-400','bg-blue-300','bg-purple-300','bg-sky-400','bg-green-400'];
            const counts = statusFlow.map(s => orders.filter(o => o.order_status === s).length);
            const max = Math.max(...counts, 1);
            pipeline.innerHTML = statusFlow.map((s, i) => {
                const pct = Math.max(Math.round((counts[i] / max) * 100), counts[i] > 0 ? 8 : 2);
                return `<div class="flex flex-col items-center flex-1">
                    <div class="w-full ${colors[i]} rounded" style="height:${Math.max(pct * 0.3, 3)}px"></div>
                    <span class="text-3xs text-muted mt-0.5">${s.replace('주문','').replace('배송','배')}</span>
                    <span class="text-3xs font-bold">${counts[i]}</span>
                </div>`;
            }).join('');
        }
    }

    /** 고객 분석 */
    renderCustomerAnalysis() {
        const orders = this.data.orders || [];
        const customers = this.data.customers || [];
        const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        const fmt = (n) => '₩' + (n||0).toLocaleString('ko-KR');

        set('cust-total', customers.length);

        // 고객별 총 구매금액
        const valid = orders.filter(o => !['주문취소','환불완료'].includes(o.order_status));
        const custSpend = {};
        valid.forEach(o => {
            const name = o.customer_name || '미확인';
            custSpend[name] = (custSpend[name] || 0) + (o.total_amount || 0);
        });
        const buyers = Object.keys(custSpend).length;

        // 재구매 고객 (2건 이상 주문)
        const custOrderCount = {};
        valid.forEach(o => { const n = o.customer_name || '미확인'; custOrderCount[n] = (custOrderCount[n]||0)+1; });
        const repeatCount = Object.values(custOrderCount).filter(c => c >= 2).length;
        set('cust-repeat', repeatCount);

        // 평균 구매금액
        const totalSpend = Object.values(custSpend).reduce((s,v) => s+v, 0);
        const avgSpend = buyers > 0 ? Math.round(totalSpend / buyers) : 0;
        set('cust-avg-spend', fmt(avgSpend));

        // 등급 분포 바
        const gradeContainer = document.getElementById('cust-grade-bars');
        if (gradeContainer) {
            const gradeCounts = {};
            customers.forEach(c => { const g = c.grade || 'GENERAL'; gradeCounts[g] = (gradeCounts[g]||0)+1; });
            const gradeNames = { SEED: '씨앗', SPROUT: '새싹', GREEN_LEAF: '그린', GOLD: '골드', VIP: 'VIP', GENERAL: '일반' };
            const gradeColors = { SEED: 'bg-yellow-200', SPROUT: 'bg-green-200', GREEN_LEAF: 'bg-green-400', GOLD: 'bg-yellow-400', VIP: 'bg-purple-400', GENERAL: 'bg-gray-300' };
            const maxG = Math.max(...Object.values(gradeCounts), 1);
            gradeContainer.innerHTML = Object.entries(gradeCounts)
                .sort((a,b) => b[1]-a[1])
                .map(([g, cnt]) => {
                    const pct = Math.round((cnt/maxG)*100);
                    return `<div class="flex items-center gap-2">
                        <span class="w-8 text-2xs text-right text-muted">${gradeNames[g]||g}</span>
                        <div class="flex-1 h-2 bg-gray-100 rounded-full"><div class="${gradeColors[g]||'bg-gray-300'} h-2 rounded-full" style="width:${pct}%"></div></div>
                        <span class="w-6 text-2xs tabular-nums text-right">${cnt}</span>
                    </div>`;
                }).join('');
        }

        // VIP 고객 TOP 5
        const vipContainer = document.getElementById('cust-vip-list');
        if (vipContainer) {
            const top5 = Object.entries(custSpend).sort((a,b) => b[1]-a[1]).slice(0,5);
            if (top5.length === 0) { vipContainer.innerHTML = '<p class="text-muted text-center">데이터 없음</p>'; return; }
            vipContainer.innerHTML = top5.map(([name, amount], i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
                return `<div class="flex items-center justify-between py-0.5">
                    <span><span class="mr-1">${medal}</span><span class="text-body">${name}</span></span>
                    <span class="tabular-nums text-muted">${fmt(amount)}</span>
                </div>`;
            }).join('');
        }
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
            container.innerHTML = '<p class="text-muted text-sm">최근 주문이 없습니다.</p>';
            return;
        }

        // 상태 배지 색상 — orderData.js의 getStatusColor() 단일 소스 사용
        const getStatusBadge = (s) =>
            window.orderDataManager?.getStatusColor?.(s) || 'badge-neutral';

        recentOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'flex items-center justify-between px-2 py-1.5 rounded hover:bg-section';
            const name = (order.customer_name || '-').replace(/</g, '&lt;');
            const summary = (order.order_items_summary || '').replace(/</g, '&lt;');
            const status = order.order_status || '주문접수';
            const statusClass = getStatusBadge(status);
            const amount = (order.total_amount || 0).toLocaleString('ko-KR');
            orderItem.innerHTML = `
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                        <span class="font-medium text-body">${name}</span>
                        <span class="badge ${statusClass}">${status}</span>
                    </div>
                    <div class="text-2xs text-muted truncate">${summary || '-'}</div>
                </div>
                <span class="text-xs font-medium tabular-nums text-heading flex-shrink-0 ml-2">₩${amount}</span>
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
            container.innerHTML = '<p class="text-muted text-sm">재고 알림이 없습니다.</p>';
            return;
        }

        // 품절 상품
        outOfStockProducts.forEach(product => {
            const alertItem = document.createElement('div');
            alertItem.className = 'flex items-center justify-between p-3 bg-danger border border-red-200 rounded-lg';
            alertItem.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-red-900">${product.name}</div>
                    <div class="text-xs text-danger">품절</div>
                </div>
                <div class="text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
            `;
            container.appendChild(alertItem);
        });

        // 재고 부족 상품
        lowStockProducts.forEach(product => {
            const alertItem = document.createElement('div');
            alertItem.className = 'flex items-center justify-between p-3 bg-warn border border-yellow-200 rounded-lg';
            alertItem.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-yellow-900">${product.name}</div>
                    <div class="text-xs text-warn">재고: ${product.stock}개</div>
                </div>
                <div class="text-warn">
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
                color: 'text-brand',
                icon: 'fas fa-database'
            },
            {
                label: 'API 연결',
                status: '로컬 모드',
                color: 'text-warn',
                icon: 'fas fa-cloud'
            },
            {
                label: '백업 상태',
                status: '최근 백업: 오늘',
                color: 'text-brand',
                icon: 'fas fa-save'
            },
            {
                label: '시스템 메모리',
                status: '정상',
                color: 'text-brand',
                icon: 'fas fa-memory'
            }
        ];

        container.innerHTML = '';

        statusItems.forEach(item => {
            const statusItem = document.createElement('div');
            statusItem.className = 'flex items-center justify-between p-3 bg-section rounded-lg';
            statusItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${item.icon} ${item.color}"></i>
                    <div>
                        <div class="text-sm font-medium text-heading">${item.label}</div>
                        <div class="text-xs text-muted">${item.status}</div>
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
    setupSalesTrendChart(periodDays) {
        const ctx = document.getElementById('sales-trend-chart');
        if (!ctx) return;

        if (this.charts.salesTrend) {
            this.charts.salesTrend.destroy();
            this.charts.salesTrend = null;
        }

        if (periodDays) this._chartPeriod = periodDays;
        const salesData = this.calculateSalesTrendData(this._chartPeriod || 7);

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
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: 'rgb(107,114,128)', font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            color: 'rgb(107,114,128)', font: { size: 11 },
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
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgb(75, 85, 99)',
                            font: { size: 11 },
                            padding: 8,
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
    calculateSalesTrendData(periodDays = 7) {
        const labels = [];
        const values = [];
        const orders = (this.data.orders || []).filter(o => !['주문취소','환불완료'].includes(o.order_status));
        const toLD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        if (periodDays <= 31) {
            for (let i = periodDays - 1; i >= 0; i--) {
                const date = new Date(); date.setDate(date.getDate() - i);
                const dateKey = toLD(date);
                const daySales = orders.filter(o => o.order_created_at && toLD(new Date(o.order_created_at)) === dateKey)
                    .reduce((s,o) => s + (o.total_amount||0), 0);
                labels.push(`${date.getMonth()+1}/${date.getDate()}`);
                values.push(daySales);
            }
        } else {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(); date.setMonth(date.getMonth() - i);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
                const monthSales = orders.filter(o => o.order_created_at && toLD(new Date(o.order_created_at)).startsWith(monthKey))
                    .reduce((s,o) => s + (o.total_amount||0), 0);
                labels.push(`${date.getMonth()+1}월`);
                values.push(monthSales);
            }
        }
        return { labels, values };
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
            btn.className = 'px-3 py-1 text-xs bg-page text-heading rounded-full hover:bg-section';
        });

        // 선택된 버튼 활성화
        const selectedBtn = document.getElementById(buttonId);
        if (selectedBtn) {
            selectedBtn.className = 'px-3 py-1 text-xs bg-info-accent text-info rounded-full hover:bg-info-accent';
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
        const btn = document.getElementById('mobile-nav-' + section) || document.getElementById('nav-' + section);
        if (btn) btn.click();
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
     * 통화 포맷팅 — utils/formatters.js의 formatCurrency()로 위임
     */
    formatCurrency(amount) {
        return (window.fmt?.currency ?? window.formatCurrency ?? ((v) => '₩' + Number(v).toLocaleString()))(amount);
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
