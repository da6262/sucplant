// 배송 경로 최적화
// 배송 주소를 기반으로 최적 경로 계산

export class RouteOptimizer {
    constructor() {
        this.deliveryZones = {
            '서울': { lat: 37.5665, lng: 126.9780, radius: 50 },
            '경기': { lat: 37.4138, lng: 127.5183, radius: 100 },
            '인천': { lat: 37.4563, lng: 126.7052, radius: 30 },
            '부산': { lat: 35.1796, lng: 129.0756, radius: 40 },
            '대구': { lat: 35.8714, lng: 128.6014, radius: 30 },
            '광주': { lat: 35.1595, lng: 126.8526, radius: 30 },
            '대전': { lat: 36.3504, lng: 127.3845, radius: 30 },
            '울산': { lat: 35.5384, lng: 129.3114, radius: 20 }
        };
        
        this.optimizationSettings = {
            maxDeliveryTime: 8, // 최대 배송 시간 (시간)
            maxDistance: 200, // 최대 배송 거리 (km)
            vehicleCapacity: 50, // 차량 적재 용량
            timeWindow: 2 // 시간 윈도우 (시간)
        };
    }

    // 주소를 좌표로 변환 (Geocoding)
    async geocodeAddress(address) {
        try {
            console.log(`📍 주소 좌표 변환: ${address}`);
            
            // 실제 구현 시 Google Maps API 또는 카카오맵 API 사용
            // 현재는 Mock 데이터 반환
            const mockCoordinates = this.getMockCoordinates(address);
            
            console.log('✅ 주소 좌표 변환 완료');
            return mockCoordinates;

        } catch (error) {
            console.error('❌ 주소 좌표 변환 실패:', error);
            return null;
        }
    }

    // Mock 좌표 데이터 (실제 구현 시 API 연동)
    getMockCoordinates(address) {
        const mockData = {
            '서울특별시': { lat: 37.5665, lng: 126.9780 },
            '경기도': { lat: 37.4138, lng: 127.5183 },
            '인천광역시': { lat: 37.4563, lng: 126.7052 },
            '부산광역시': { lat: 35.1796, lng: 129.0756 },
            '대구광역시': { lat: 35.8714, lng: 128.6014 },
            '광주광역시': { lat: 35.1595, lng: 126.8526 },
            '대전광역시': { lat: 36.3504, lng: 127.3845 },
            '울산광역시': { lat: 35.5384, lng: 129.3114 }
        };

        // 주소에서 지역명 추출
        for (const [region, coords] of Object.entries(mockData)) {
            if (address.includes(region)) {
                return {
                    lat: coords.lat + (Math.random() - 0.5) * 0.1,
                    lng: coords.lng + (Math.random() - 0.5) * 0.1,
                    address: address
                };
            }
        }

        // 기본값 (서울)
        return {
            lat: 37.5665 + (Math.random() - 0.5) * 0.1,
            lng: 126.9780 + (Math.random() - 0.5) * 0.1,
            address: address
        };
    }

    // 두 지점 간 거리 계산 (Haversine 공식)
    calculateDistance(point1, point2) {
        const R = 6371; // 지구 반지름 (km)
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    }

    // 라디안 변환
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // 배송 지역 그룹화
    async groupDeliveryAddresses(orders) {
        try {
            console.log(`🗺️ 배송 지역 그룹화: ${orders.length}개 주문`);
            
            const groups = {};
            
            for (const order of orders) {
                if (!order.shipping_address) continue;
                
                // 주소 좌표 변환
                const coordinates = await this.geocodeAddress(order.shipping_address);
                if (!coordinates) continue;
                
                // 지역 그룹 찾기
                const region = this.findDeliveryRegion(coordinates);
                if (!groups[region]) {
                    groups[region] = [];
                }
                
                groups[region].push({
                    ...order,
                    coordinates,
                    region
                });
            }
            
            console.log('✅ 배송 지역 그룹화 완료');
            return groups;

        } catch (error) {
            console.error('❌ 배송 지역 그룹화 실패:', error);
            return {};
        }
    }

    // 배송 지역 찾기
    findDeliveryRegion(coordinates) {
        for (const [region, zone] of Object.entries(this.deliveryZones)) {
            const distance = this.calculateDistance(coordinates, zone);
            if (distance <= zone.radius) {
                return region;
            }
        }
        return '기타';
    }

    // 최적 배송 경로 계산 (TSP - Traveling Salesman Problem)
    async calculateOptimalRoute(orders) {
        try {
            console.log(`🚚 최적 배송 경로 계산: ${orders.length}개 주문`);
            
            if (orders.length === 0) return [];
            if (orders.length === 1) return orders;

            // 주소 좌표 변환
            const ordersWithCoords = [];
            for (const order of orders) {
                const coordinates = await this.geocodeAddress(order.shipping_address);
                if (coordinates) {
                    ordersWithCoords.push({ ...order, coordinates });
                }
            }

            if (ordersWithCoords.length === 0) return orders;

            // TSP 알고리즘 적용 (Nearest Neighbor)
            const route = this.nearestNeighborAlgorithm(ordersWithCoords);
            
            console.log('✅ 최적 배송 경로 계산 완료');
            return route;

        } catch (error) {
            console.error('❌ 최적 배송 경로 계산 실패:', error);
            return orders;
        }
    }

    // Nearest Neighbor 알고리즘
    nearestNeighborAlgorithm(orders) {
        if (orders.length <= 1) return orders;
        
        const route = [];
        const unvisited = [...orders];
        let current = unvisited.shift(); // 시작점
        route.push(current);
        
        while (unvisited.length > 0) {
            let nearestIndex = 0;
            let nearestDistance = this.calculateDistance(current.coordinates, unvisited[0].coordinates);
            
            // 가장 가까운 주문 찾기
            for (let i = 1; i < unvisited.length; i++) {
                const distance = this.calculateDistance(current.coordinates, unvisited[i].coordinates);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }
            
            // 다음 주문으로 이동
            current = unvisited.splice(nearestIndex, 1)[0];
            route.push(current);
        }
        
        return route;
    }

    // 배송 시간 추정
    estimateDeliveryTime(route) {
        try {
            console.log('⏰ 배송 시간 추정');
            
            let totalTime = 0;
            let totalDistance = 0;
            
            for (let i = 0; i < route.length - 1; i++) {
                const distance = this.calculateDistance(
                    route[i].coordinates, 
                    route[i + 1].coordinates
                );
                totalDistance += distance;
                totalTime += distance * 0.1; // 10km당 1시간 가정
            }
            
            // 배송 처리 시간 추가 (주문당 5분)
            totalTime += route.length * 0.083; // 5분 = 0.083시간
            
            return {
                totalTime: Math.round(totalTime * 100) / 100,
                totalDistance: Math.round(totalDistance * 100) / 100,
                estimatedHours: Math.ceil(totalTime)
            };

        } catch (error) {
            console.error('❌ 배송 시간 추정 실패:', error);
            return { totalTime: 0, totalDistance: 0, estimatedHours: 0 };
        }
    }

    // 배송 경로 시각화
    visualizeRoute(route, containerId) {
        try {
            console.log('🗺️ 배송 경로 시각화');
            
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // 경로 정보 HTML 생성
            const routeHTML = `
                <div class="route-visualization bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-heading mb-4">배송 경로</h3>

                    <div class="route-info mb-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-info p-3 rounded-lg">
                                <div class="text-sm text-body">총 거리</div>
                                <div class="text-lg font-bold text-info" id="total-distance">0km</div>
                            </div>
                            <div class="bg-success p-3 rounded-lg">
                                <div class="text-sm text-body">예상 시간</div>
                                <div class="text-lg font-bold text-brand" id="total-time">0시간</div>
                            </div>
                        </div>
                    </div>

                    <div class="route-stops">
                        <h4 class="text-md font-medium text-body mb-2">배송 순서</h4>
                        <div id="route-stops-list" class="space-y-2">
                            <!-- 배송지 목록이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = routeHTML;
            
            // 배송지 목록 렌더링
            this.renderRouteStops(route);
            
            // 배송 시간 및 거리 계산
            const timeEstimate = this.estimateDeliveryTime(route);
            document.getElementById('total-distance').textContent = `${timeEstimate.totalDistance}km`;
            document.getElementById('total-time').textContent = `${timeEstimate.estimatedHours}시간`;

        } catch (error) {
            console.error('❌ 배송 경로 시각화 실패:', error);
        }
    }

    // 배송지 목록 렌더링
    renderRouteStops(route) {
        const stopsList = document.getElementById('route-stops-list');
        if (!stopsList) return;
        
        stopsList.innerHTML = route.map((order, index) => `
            <div class="flex items-center p-2 bg-section rounded-lg">
                <div class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="font-medium text-heading">${order.customer_name}</div>
                    <div class="text-sm text-body">${order.shipping_address}</div>
                </div>
                <div class="text-sm text-secondary">
                    ${order.order_number || order.id}
                </div>
            </div>
        `).join('');
    }

    // 배송 지역별 최적화
    async optimizeByRegion(orders) {
        try {
            console.log('🗺️ 지역별 배송 최적화');
            
            // 지역별 그룹화
            const regionalGroups = await this.groupDeliveryAddresses(orders);
            
            const optimizedRoutes = {};
            
            // 각 지역별로 최적 경로 계산
            for (const [region, regionalOrders] of Object.entries(regionalGroups)) {
                if (regionalOrders.length === 0) continue;
                
                const route = await this.calculateOptimalRoute(regionalOrders);
                const timeEstimate = this.estimateDeliveryTime(route);
                
                optimizedRoutes[region] = {
                    route,
                    timeEstimate,
                    orderCount: regionalOrders.length
                };
            }
            
            console.log('✅ 지역별 배송 최적화 완료');
            return optimizedRoutes;

        } catch (error) {
            console.error('❌ 지역별 배송 최적화 실패:', error);
            return {};
        }
    }

    // 배송 일정 생성
    generateDeliverySchedule(optimizedRoutes) {
        try {
            console.log('📅 배송 일정 생성');
            
            const schedule = [];
            let currentTime = new Date();
            currentTime.setHours(9, 0, 0, 0); // 오전 9시 시작
            
            for (const [region, routeData] of Object.entries(optimizedRoutes)) {
                const { route, timeEstimate } = routeData;
                
                const regionSchedule = {
                    region,
                    startTime: new Date(currentTime),
                    endTime: new Date(currentTime.getTime() + timeEstimate.estimatedHours * 60 * 60 * 1000),
                    orders: route,
                    estimatedTime: timeEstimate.estimatedHours,
                    totalDistance: timeEstimate.totalDistance
                };
                
                schedule.push(regionSchedule);
                
                // 다음 지역 시작 시간 업데이트
                currentTime = new Date(regionSchedule.endTime.getTime() + 30 * 60 * 1000); // 30분 휴식
            }
            
            console.log('✅ 배송 일정 생성 완료');
            return schedule;

        } catch (error) {
            console.error('❌ 배송 일정 생성 실패:', error);
            return [];
        }
    }

    // 배송 경로 내보내기
    exportRoute(route, format = 'json') {
        try {
            console.log(`📤 배송 경로 내보내기: ${format}`);
            
            if (format === 'json') {
                const dataStr = JSON.stringify(route, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                this.downloadFile(dataBlob, `delivery-route-${new Date().toISOString().split('T')[0]}.json`);
            } else if (format === 'csv') {
                const csvData = route.map((order, index) => 
                    `${index + 1},${order.customer_name},${order.shipping_address},${order.order_number || order.id}`
                ).join('\n');
                const csvContent = '순서,고객명,주소,주문번호\n' + csvData;
                const dataBlob = new Blob([csvContent], { type: 'text/csv' });
                this.downloadFile(dataBlob, `delivery-route-${new Date().toISOString().split('T')[0]}.csv`);
            }

        } catch (error) {
            console.error('❌ 배송 경로 내보내기 실패:', error);
        }
    }

    // 파일 다운로드
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// 전역 인스턴스 생성
export const routeOptimizer = new RouteOptimizer();
window.routeOptimizer = routeOptimizer;

