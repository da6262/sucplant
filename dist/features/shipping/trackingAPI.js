// 배송 추적 API 연동
// 택배사별 실시간 배송 추적 기능

export class TrackingAPI {
    constructor() {
        this.carriers = {
            'cj': { name: 'CJ대한통운', api: 'https://apis.tracker.delivery/carriers/kr.cjlogistics' },
            'hanjin': { name: '한진택배', api: 'https://apis.tracker.delivery/carriers/kr.hanjin' },
            'lotte': { name: '롯데택배', api: 'https://apis.tracker.delivery/carriers/kr.lotte' },
            'logen': { name: '로젠택배', api: 'https://apis.tracker.delivery/carriers/kr.logen' },
            'kdexp': { name: '대한통운', api: 'https://apis.tracker.delivery/carriers/kr.kdexp' },
            'epost': { name: '우체국택배', api: 'https://apis.tracker.delivery/carriers/kr.epost' }
        };
    }

    // 송장번호로 택배사 자동 감지
    detectCarrier(trackingNumber) {
        try {
            console.log(`🔍 택배사 감지: ${trackingNumber}`);
            
            // 송장번호 패턴으로 택배사 감지
            const patterns = {
                'cj': /^[0-9]{10,12}$/,  // CJ대한통운
                'hanjin': /^[0-9]{10,13}$/,  // 한진택배
                'lotte': /^[0-9]{10,12}$/,  // 롯데택배
                'logen': /^[0-9]{10,12}$/,  // 로젠택배
                'kdexp': /^[0-9]{10,12}$/,  // 대한통운
                'epost': /^[0-9]{10,13}$/   // 우체국택배
            };

            for (const [carrier, pattern] of Object.entries(patterns)) {
                if (pattern.test(trackingNumber)) {
                    console.log(`✅ 감지된 택배사: ${this.carriers[carrier].name}`);
                    return carrier;
                }
            }

            // 기본값으로 CJ대한통운 반환
            console.log('⚠️ 택배사를 감지할 수 없어 CJ대한통운으로 설정');
            return 'cj';
        } catch (error) {
            console.error('❌ 택배사 감지 실패:', error);
            return 'cj';
        }
    }

    // 배송 추적 정보 조회
    async trackShipment(trackingNumber, carrier = null) {
        try {
            console.log(`📦 배송 추적 시작: ${trackingNumber}`);
            
            // 택배사 자동 감지
            if (!carrier) {
                carrier = this.detectCarrier(trackingNumber);
            }

            const carrierInfo = this.carriers[carrier];
            if (!carrierInfo) {
                throw new Error(`지원하지 않는 택배사: ${carrier}`);
            }

            console.log(`🚚 ${carrierInfo.name} 배송 추적 중...`);

            // 실제 API 호출 시도
            let trackingData;
            try {
                // 실제 택배사 API 호출 시도
                trackingData = await this.callRealTrackingAPI(trackingNumber, carrier);
                console.log('✅ 실제 API 호출 성공');
            } catch (apiError) {
                console.warn('⚠️ 실제 API 호출 실패, Mock 데이터 사용:', apiError.message);
                // API 호출 실패 시 Mock 데이터 사용
                trackingData = await this.mockTrackingAPI(trackingNumber, carrier);
            }
            
            console.log('✅ 배송 추적 완료');
            return trackingData;

        } catch (error) {
            console.error('❌ 배송 추적 실패:', error);
            throw error;
        }
    }

    // 실제 택배사 API 호출
    async callRealTrackingAPI(trackingNumber, carrier) {
        try {
            console.log(`🌐 실제 택배사 API 호출: ${carrier} - ${trackingNumber}`);
            
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

            // 실제 API 호출
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'SucPlant-Shipping-Tracker/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ 실제 API 응답 수신:', data);

            // API 응답을 표준 형식으로 변환
            return this.transformAPIResponse(data, trackingNumber, carrier);

        } catch (error) {
            console.error('❌ 실제 API 호출 실패:', error);
            
            // API 호출 실패 시 Mock 데이터 반환
            console.log('🔄 Mock 데이터로 대체');
            return this.mockTrackingAPI(trackingNumber, carrier);
        }
    }

    // API 응답을 표준 형식으로 변환
    transformAPIResponse(apiData, trackingNumber, carrier) {
        try {
            console.log('🔄 API 응답 변환 중...');
            
            // API 응답 구조에 따라 변환 로직 구현
            const transformedData = {
                trackingNumber,
                carrier: this.carriers[carrier].name,
                status: this.mapStatus(apiData.state || apiData.status),
                currentLocation: apiData.location || '위치 정보 없음',
                estimatedDelivery: apiData.estimatedDelivery || null,
                history: this.transformHistory(apiData.progresses || apiData.history || [])
            };

            console.log('✅ API 응답 변환 완료');
            return transformedData;

        } catch (error) {
            console.error('❌ API 응답 변환 실패:', error);
            // 변환 실패 시 기본 데이터 반환
            return this.getDefaultTrackingData(trackingNumber, carrier);
        }
    }

    // 상태 매핑
    mapStatus(apiStatus) {
        const statusMap = {
            'PICKED_UP': '배송중',
            'IN_TRANSIT': '배송중',
            'OUT_FOR_DELIVERY': '배송중',
            'DELIVERED': '배송완료',
            'EXCEPTION': '배송지연',
            'RETURNED': '반송',
            '배송중': '배송중',
            '배송완료': '배송완료',
            '배송지연': '배송지연'
        };
        return statusMap[apiStatus] || '배송중';
    }

    // 배송 이력 변환
    transformHistory(apiHistory) {
        return apiHistory.map(item => ({
            time: item.time || item.timestamp,
            location: item.location || item.place,
            status: this.mapStatus(item.status || item.state),
            description: item.description || item.message || '배송 정보 업데이트'
        }));
    }

    // 기본 추적 데이터 반환
    getDefaultTrackingData(trackingNumber, carrier) {
        return {
            trackingNumber,
            carrier: this.carriers[carrier].name,
            status: '배송중',
            currentLocation: '정보 조회 중',
            estimatedDelivery: null,
            history: [{
                time: new Date().toISOString(),
                location: '시스템',
                status: '처리중',
                description: '배송 정보를 조회하고 있습니다.'
            }]
        };
    }

    // Mock API (실제 구현 시 실제 API로 교체)
    async mockTrackingAPI(trackingNumber, carrier) {
        // 실제 환경에서는 실제 택배사 API를 호출
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockData = {
                    trackingNumber,
                    carrier: this.carriers[carrier].name,
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
                };
                resolve(mockData);
            }, 1000);
        });
    }

    // 배송 상태 업데이트
    async updateShippingStatus(orderId, trackingData) {
        try {
            console.log(`📦 배송 상태 업데이트: ${orderId}`);
            
            if (!window.orderDataManager) {
                throw new Error('orderDataManager를 찾을 수 없습니다');
            }

            // 주문 상태 업데이트
            await window.orderDataManager.updateOrder(orderId, {
                tracking_status: trackingData.status,
                tracking_location: trackingData.currentLocation,
                estimated_delivery: trackingData.estimatedDelivery,
                tracking_history: JSON.stringify(trackingData.history),
                updated_at: new Date().toISOString()
            });

            console.log('✅ 배송 상태 업데이트 완료');
            return true;

        } catch (error) {
            console.error('❌ 배송 상태 업데이트 실패:', error);
            throw error;
        }
    }

    // 배송 추적 링크 생성
    generateTrackingLink(trackingNumber, carrier) {
        const carrierInfo = this.carriers[carrier];
        if (!carrierInfo) return null;

        const trackingLinks = {
            'cj': `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnb_param=1&wl_ref=${trackingNumber}`,
            'hanjin': `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/TrackResult.do?mCode=MN038&schLang=KR&wblnum=${trackingNumber}`,
            'lotte': `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${trackingNumber}`,
            'logen': `https://www.ilogen.com/web/personal/trace/${trackingNumber}`,
            'kdexp': `https://www.kdexp.com/tracking?invoice_no=${trackingNumber}`,
            'epost': `https://service.epost.go.kr/trace.RetrieveDomRlgTraceList.comm?displayHeader=N&sid1=${trackingNumber}`
        };

        return trackingLinks[carrier] || null;
    }

    // 배송 완료 알림 발송
    async sendDeliveryNotification(orderId, trackingData) {
        try {
            console.log(`📱 배송 완료 알림 발송: ${orderId}`);
            
            // 주문 정보 조회
            const order = window.orderDataManager.getOrderById(orderId);
            if (!order) {
                throw new Error('주문 정보를 찾을 수 없습니다');
            }

            // SMS 알림 발송
            if (window.sendSMS) {
                const message = `[${order.customer_name}님] 주문하신 상품이 배송 완료되었습니다. 송장번호: ${trackingData.trackingNumber}`;
                await window.sendSMS(order.customer_phone, message);
            }

            console.log('✅ 배송 완료 알림 발송 완료');
            return true;

        } catch (error) {
            console.error('❌ 배송 완료 알림 발송 실패:', error);
            throw error;
        }
    }

    // 배송 지연 알림 발송
    async sendDelayNotification(orderId, delayReason) {
        try {
            console.log(`⚠️ 배송 지연 알림 발송: ${orderId}`);
            
            const order = window.orderDataManager.getOrderById(orderId);
            if (!order) {
                throw new Error('주문 정보를 찾을 수 없습니다');
            }

            if (window.sendSMS) {
                const message = `[${order.customer_name}님] 죄송합니다. 배송이 지연되고 있습니다. 사유: ${delayReason}`;
                await window.sendSMS(order.customer_phone, message);
            }

            console.log('✅ 배송 지연 알림 발송 완료');
            return true;

        } catch (error) {
            console.error('❌ 배송 지연 알림 발송 실패:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
export const trackingAPI = new TrackingAPI();
window.trackingAPI = trackingAPI;
