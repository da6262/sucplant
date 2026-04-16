// 배송 성과 분석 대시보드
// 배송 통계, 지연률, 택배사별 성과 분석

export class ShippingAnalytics {
    constructor() {
        this.charts = {};
        this.analyticsData = {
            dailyStats: [],
            carrierStats: [],
            delayStats: [],
            customerSatisfaction: []
        };
    }

    // 배송 성과 데이터 수집
    async collectAnalyticsData(startDate, endDate) {
        try {
            console.log('📊 배송 성과 데이터 수집 시작');
            
            if (!window.orderDataManager) {
                throw new Error('orderDataManager를 찾을 수 없습니다');
            }

            const allOrders = window.orderDataManager.getAllOrders();
            const filteredOrders = allOrders.filter(order => {
                const orderDate = new Date(order.order_date);
                return orderDate >= startDate && orderDate <= endDate;
            });

            // 일별 배송 통계
            this.analyticsData.dailyStats = this.calculateDailyStats(filteredOrders);
            
            // 택배사별 통계
            this.analyticsData.carrierStats = this.calculateCarrierStats(filteredOrders);
            
            // 지연 통계
            this.analyticsData.delayStats = this.calculateDelayStats(filteredOrders);
            
            // 고객 만족도
            this.analyticsData.customerSatisfaction = this.calculateCustomerSatisfaction(filteredOrders);

            console.log('✅ 배송 성과 데이터 수집 완료');
            return this.analyticsData;

        } catch (error) {
            console.error('❌ 배송 성과 데이터 수집 실패:', error);
            throw error;
        }
    }

    // 일별 배송 통계 계산
    calculateDailyStats(orders) {
        const dailyStats = {};
        
        orders.forEach(order => {
            const date = new Date(order.order_date).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date,
                    totalOrders: 0,
                    delivered: 0,
                    inTransit: 0,
                    delayed: 0,
                    cancelled: 0
                };
            }
            
            dailyStats[date].totalOrders++;
            
            switch (order.status) {
                case '배송완료':
                    dailyStats[date].delivered++;
                    break;
                case '배송중':
                    dailyStats[date].inTransit++;
                    break;
                case '배송지연':
                    dailyStats[date].delayed++;
                    break;
                case '주문취소':
                    dailyStats[date].cancelled++;
                    break;
            }
        });

        return Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // 택배사별 통계 계산
    calculateCarrierStats(orders) {
        const carrierStats = {};
        
        orders.forEach(order => {
            const carrier = order.carrier || 'CJ대한통운';
            if (!carrierStats[carrier]) {
                carrierStats[carrier] = {
                    carrier,
                    totalOrders: 0,
                    delivered: 0,
                    inTransit: 0,
                    delayed: 0,
                    averageDeliveryTime: 0
                };
            }
            
            carrierStats[carrier].totalOrders++;
            
            switch (order.status) {
                case '배송완료':
                    carrierStats[carrier].delivered++;
                    break;
                case '배송중':
                    carrierStats[carrier].inTransit++;
                    break;
                case '배송지연':
                    carrierStats[carrier].delayed++;
                    break;
            }
        });

        // 배송 성공률 계산
        Object.values(carrierStats).forEach(stat => {
            stat.successRate = stat.totalOrders > 0 ? 
                ((stat.delivered / stat.totalOrders) * 100).toFixed(1) : 0;
            stat.delayRate = stat.totalOrders > 0 ? 
                ((stat.delayed / stat.totalOrders) * 100).toFixed(1) : 0;
        });

        return Object.values(carrierStats);
    }

    // 지연 통계 계산
    calculateDelayStats(orders) {
        const delayStats = {
            totalDelays: 0,
            averageDelayDays: 0,
            delayReasons: {},
            delayByCarrier: {}
        };

        orders.forEach(order => {
            if (order.status === '배송지연') {
                delayStats.totalDelays++;
                
                // 지연 사유 분류
                const reason = order.delay_reason || '기타';
                delayStats.delayReasons[reason] = (delayStats.delayReasons[reason] || 0) + 1;
                
                // 택배사별 지연
                const carrier = order.carrier || 'CJ대한통운';
                delayStats.delayByCarrier[carrier] = (delayStats.delayByCarrier[carrier] || 0) + 1;
            }
        });

        return delayStats;
    }

    // 고객 만족도 계산
    calculateCustomerSatisfaction(orders) {
        const satisfaction = {
            totalOrders: orders.length,
            completedOrders: orders.filter(o => o.status === '배송완료').length,
            cancelledOrders: orders.filter(o => o.status === '주문취소').length,
            satisfactionRate: 0
        };

        satisfaction.satisfactionRate = satisfaction.totalOrders > 0 ? 
            ((satisfaction.completedOrders / satisfaction.totalOrders) * 100).toFixed(1) : 0;

        return satisfaction;
    }

    // 대시보드 HTML 생성
    generateDashboardHTML() {
        return `
            <div id="shipping-analytics-dashboard" class="bg-white rounded-lg shadow-md p-6">
                <!-- 헤더 -->
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-heading mb-2">배송 성과 분석</h2>
                    <p class="text-body">배송 현황과 성과를 분석합니다</p>
                </div>

                <!-- 핵심 지표 카드 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-info p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-info-accent rounded-lg">
                                <i class="fas fa-truck text-info"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-body">총 배송 건수</p>
                                <p class="text-2xl font-bold text-info" id="total-shipments">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-success p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-success-accent rounded-lg">
                                <i class="fas fa-check-circle text-brand"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-body">배송 완료율</p>
                                <p class="text-2xl font-bold text-brand" id="delivery-rate">0%</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-warn p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-warn-accent rounded-lg">
                                <i class="fas fa-clock text-warn"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-body">평균 배송 시간</p>
                                <p class="text-2xl font-bold text-warn" id="avg-delivery-time">0일</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-danger p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-danger-accent rounded-lg">
                                <i class="fas fa-exclamation-triangle text-danger"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-body">지연률</p>
                                <p class="text-2xl font-bold text-danger" id="delay-rate">0%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 차트 영역 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- 일별 배송 현황 차트 -->
                    <div class="bg-section p-4 rounded-lg">
                        <h3 class="text-lg font-semibold text-heading mb-4">일별 배송 현황</h3>
                        <canvas id="daily-shipments-chart" width="400" height="200"></canvas>
                    </div>

                    <!-- 택배사별 성과 차트 -->
                    <div class="bg-section p-4 rounded-lg">
                        <h3 class="text-lg font-semibold text-heading mb-4">택배사별 성과</h3>
                        <canvas id="carrier-performance-chart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- 상세 통계 테이블 -->
                <div class="bg-section p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-heading mb-4">상세 통계</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-ui">
                            <thead class="bg-page">
                                <tr>
                                    <th class="px-4 text-left">택배사</th>
                                    <th class="px-4 text-left">총 건수</th>
                                    <th class="px-4 text-left">완료</th>
                                    <th class="px-4 text-left">지연</th>
                                    <th class="px-4 text-left">성공률</th>
                                </tr>
                            </thead>
                            <tbody id="carrier-stats-table" class="bg-card divide-y divide-gray-200">
                                <!-- 데이터가 동적으로 로드됩니다 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // 대시보드 렌더링
    async renderDashboard(containerId) {
        try {
            console.log('📊 배송 성과 대시보드 렌더링 시작');
            
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
            }

            // 대시보드 HTML 삽입
            container.innerHTML = this.generateDashboardHTML();

            // 데이터 수집 (최근 30일)
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            await this.collectAnalyticsData(startDate, endDate);
            
            // 지표 업데이트
            this.updateMetrics();
            
            // 차트 렌더링
            await this.renderCharts();
            
            // 테이블 렌더링
            this.renderStatsTable();

            console.log('✅ 배송 성과 대시보드 렌더링 완료');

        } catch (error) {
            console.error('❌ 배송 성과 대시보드 렌더링 실패:', error);
            throw error;
        }
    }

    // 지표 업데이트
    updateMetrics() {
        const totalShipments = this.analyticsData.dailyStats.reduce((sum, day) => sum + day.totalOrders, 0);
        const totalDelivered = this.analyticsData.dailyStats.reduce((sum, day) => sum + day.delivered, 0);
        const totalDelayed = this.analyticsData.dailyStats.reduce((sum, day) => sum + day.delayed, 0);
        
        const deliveryRate = totalShipments > 0 ? ((totalDelivered / totalShipments) * 100).toFixed(1) : 0;
        const delayRate = totalShipments > 0 ? ((totalDelayed / totalShipments) * 100).toFixed(1) : 0;

        // 지표 업데이트
        document.getElementById('total-shipments').textContent = totalShipments.toLocaleString();
        document.getElementById('delivery-rate').textContent = `${deliveryRate}%`;
        document.getElementById('delay-rate').textContent = `${delayRate}%`;
        document.getElementById('avg-delivery-time').textContent = '2.5일'; // 실제 계산 로직 필요
    }

    // 차트 렌더링
    async renderCharts() {
        try {
            // 일별 배송 현황 차트
            this.renderDailyChart();
            
            // 택배사별 성과 차트
            this.renderCarrierChart();

        } catch (error) {
            console.error('❌ 차트 렌더링 실패:', error);
        }
    }

    // 일별 차트 렌더링
    renderDailyChart() {
        const canvas = document.getElementById('daily-shipments-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.analyticsData.dailyStats.slice(-7); // 최근 7일

        // 간단한 막대 차트 그리기
        const maxValue = Math.max(...data.map(d => d.totalOrders));
        const barWidth = canvas.width / data.length;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        data.forEach((day, index) => {
            const barHeight = (day.totalOrders / maxValue) * canvas.height * 0.8;
            const x = index * barWidth;
            const y = canvas.height - barHeight;
            
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
            
            // 날짜 라벨
            ctx.fillStyle = '#374151';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(day.date.split('-')[2], x + barWidth/2, canvas.height - 5);
        });
    }

    // 택배사별 차트 렌더링
    renderCarrierChart() {
        const canvas = document.getElementById('carrier-performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.analyticsData.carrierStats;

        // 파이 차트 그리기
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = 0;
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        data.forEach((carrier, index) => {
            const sliceAngle = (carrier.totalOrders / data.reduce((sum, c) => sum + c.totalOrders, 0)) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }

    // 통계 테이블 렌더링
    renderStatsTable() {
        const tbody = document.getElementById('carrier-stats-table');
        if (!tbody) return;

        tbody.innerHTML = this.analyticsData.carrierStats.map(carrier => `
            <tr>
                <td class="px-4 td-primary">${carrier.carrier}</td>
                <td class="px-4 td-primary">${carrier.totalOrders}</td>
                <td class="px-4 text-brand">${carrier.delivered}</td>
                <td class="px-4 text-danger">${carrier.delayed}</td>
                <td class="px-4 text-info">${carrier.successRate}%</td>
            </tr>
        `).join('');
    }

    // 데이터 내보내기
    exportAnalyticsData(format = 'csv') {
        try {
            console.log(`📤 배송 성과 데이터 내보내기: ${format}`);
            
            if (format === 'csv') {
                this.exportToCSV();
            } else if (format === 'excel') {
                this.exportToExcel();
            }

        } catch (error) {
            console.error('❌ 데이터 내보내기 실패:', error);
        }
    }

    // CSV 내보내기
    exportToCSV() {
        const csvData = this.analyticsData.carrierStats.map(carrier => 
            `${carrier.carrier},${carrier.totalOrders},${carrier.delivered},${carrier.delayed},${carrier.successRate}%`
        ).join('\n');
        
        const csvContent = '택배사,총건수,완료,지연,성공률\n' + csvData;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shipping-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Excel 내보내기
    exportToExcel() {
        // Excel 내보내기 로직 (실제 구현 시 xlsx 라이브러리 사용)
        console.log('Excel 내보내기 기능은 추후 구현 예정');
    }
}

// 전역 인스턴스 생성
export const shippingAnalytics = new ShippingAnalytics();
window.shippingAnalytics = shippingAnalytics;

