// 실제 택배사 API 연동 시스템
// Tracker Delivery API 및 개별 택배사 API 지원

import { API_CONFIG, validateAPIKeys, apiMonitor } from './apiConfig.js';

export class RealTrackingAPI {
    constructor() {
        this.apiConfig = API_CONFIG;
        this.cache = new Map();
        this.rateLimiter = new Map();
        this.isAPIEnabled = validateAPIKeys();
    }

    // 실제 배송 추적 (우선순위: Tracker Delivery > 개별 API > Mock)
    async trackShipment(trackingNumber, carrier) {
        try {
            console.log(`🌐 실제 배송 추적 시작: ${carrier} - ${trackingNumber}`);
            
            // 캐시 확인
            const cacheKey = `${carrier}-${trackingNumber}`;
            if (this.cache.has(cacheKey)) {
                console.log('📋 캐시에서 데이터 반환');
                return this.cache.get(cacheKey);
            }
            
            // Rate Limiting 확인
            if (this.isRateLimited(carrier)) {
                console.warn(`⚠️ ${carrier} API Rate Limit 도달, 잠시 대기`);
                await this.waitForRateLimit(carrier);
            }
            
            let trackingData = null;
            
            // 1. Tracker Delivery API 시도
            if (this.isAPIEnabled) {
                try {
                    trackingData = await this.callTrackerDeliveryAPI(trackingNumber, carrier);
                    console.log('✅ Tracker Delivery API 성공');
                } catch (error) {
                    console.warn('⚠️ Tracker Delivery API 실패:', error.message);
                }
            }
            
            // 2. 개별 택배사 API 시도 (Tracker Delivery 실패 시)
            if (!trackingData) {
                try {
                    trackingData = await this.callDirectCarrierAPI(trackingNumber, carrier);
                    console.log('✅ 개별 택배사 API 성공');
                } catch (error) {
                    console.warn('⚠️ 개별 택배사 API 실패:', error.message);
                }
            }
            
            // 3. 대체 API 서비스 시도
            if (!trackingData) {
                try {
                    trackingData = await this.callFallbackAPI(trackingNumber, carrier);
                    console.log('✅ 대체 API 서비스 성공');
                } catch (error) {
                    console.warn('⚠️ 대체 API 서비스 실패:', error.message);
                }
            }
            
            // 4. 모든 API 실패 시 Mock 데이터 사용
            if (!trackingData) {
                console.log('🔄 모든 API 실패, Mock 데이터 사용');
                trackingData = await this.getMockData(trackingNumber, carrier);
            }
            
            // 캐시 저장
            this.cache.set(cacheKey, trackingData);
            
            // 사용량 기록
            apiMonitor.recordUsage(carrier, 'track');
            
            console.log('✅ 배송 추적 완료');
            return trackingData;
            
        } catch (error) {
            console.error('❌ 배송 추적 실패:', error);
            throw error;
        }
    }

    // Tracker Delivery API 호출
    async callTrackerDeliveryAPI(trackingNumber, carrier) {
        const config = this.apiConfig.trackerDelivery;
        const carrierConfig = this.apiConfig.carriers[carrier];
        
        const url = `${config.baseUrl}/carriers/kr.${carrier}/tracks/${trackingNumber}`;
        
        const response = await this.makeAPICall(url, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'User-Agent': config.requestConfig.userAgent
            },
            timeout: config.timeout
        });
        
        return this.transformTrackerDeliveryResponse(response, trackingNumber, carrier);
    }

    // 개별 택배사 API 호출
    async callDirectCarrierAPI(trackingNumber, carrier) {
        const carrierConfig = this.apiConfig.carriers[carrier];
        const directConfig = this.apiConfig.fallbackServices.directAPIs[carrier];
        
        if (!directConfig) {
            throw new Error(`${carrier} 직접 API 설정이 없습니다`);
        }
        
        const url = `${directConfig.baseUrl}/tracks/${trackingNumber}`;
        
        const response = await this.makeAPICall(url, {
            headers: {
                'Authorization': `Bearer ${directConfig.apiKey}`,
                'User-Agent': this.apiConfig.requestConfig.userAgent
            },
            timeout: this.apiConfig.requestConfig.timeout
        });
        
        return this.transformDirectAPIResponse(response, trackingNumber, carrier);
    }

    // 대체 API 서비스 호출
    async callFallbackAPI(trackingNumber, carrier) {
        const fallbackConfig = this.apiConfig.fallbackServices.koreaPost;
        
        const url = `${fallbackConfig.baseUrl}/tracking/${trackingNumber}`;
        
        const response = await this.makeAPICall(url, {
            headers: {
                'Authorization': `Bearer ${fallbackConfig.apiKey}`,
                'User-Agent': this.apiConfig.requestConfig.userAgent
            },
            timeout: fallbackConfig.timeout
        });
        
        return this.transformFallbackResponse(response, trackingNumber, carrier);
    }

    // API 호출 공통 함수
    async makeAPICall(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.apiConfig.requestConfig.headers,
                    ...options.headers
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (this.apiConfig.logging.logAPIResponses) {
                console.log('📡 API 응답:', data);
            }
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('API 호출 시간 초과');
            }
            
            throw error;
        }
    }

    // Tracker Delivery 응답 변환
    transformTrackerDeliveryResponse(data, trackingNumber, carrier) {
        return {
            trackingNumber,
            carrier: this.apiConfig.carriers[carrier].name,
            status: this.mapTrackerDeliveryStatus(data.state),
            currentLocation: data.location || '위치 정보 없음',
            estimatedDelivery: data.estimatedDelivery || null,
            history: (data.progresses || []).map(item => ({
                time: item.time,
                location: item.location,
                status: this.mapTrackerDeliveryStatus(item.status),
                description: item.description || '배송 정보 업데이트'
            }))
        };
    }

    // 개별 택배사 API 응답 변환
    transformDirectAPIResponse(data, trackingNumber, carrier) {
        return {
            trackingNumber,
            carrier: this.apiConfig.carriers[carrier].name,
            status: this.mapDirectAPIStatus(data.status, carrier),
            currentLocation: data.currentLocation || '위치 정보 없음',
            estimatedDelivery: data.estimatedDelivery || null,
            history: (data.trackingHistory || []).map(item => ({
                time: item.timestamp,
                location: item.location,
                status: this.mapDirectAPIStatus(item.status, carrier),
                description: item.description || '배송 정보 업데이트'
            }))
        };
    }

    // 대체 API 응답 변환
    transformFallbackResponse(data, trackingNumber, carrier) {
        return {
            trackingNumber,
            carrier: this.apiConfig.carriers[carrier].name,
            status: this.mapFallbackStatus(data.status),
            currentLocation: data.location || '위치 정보 없음',
            estimatedDelivery: data.estimatedDelivery || null,
            history: (data.history || []).map(item => ({
                time: item.time,
                location: item.location,
                status: this.mapFallbackStatus(item.status),
                description: item.description || '배송 정보 업데이트'
            }))
        };
    }

    // 상태 매핑 함수들
    mapTrackerDeliveryStatus(status) {
        const statusMap = {
            'PICKED_UP': '배송중',
            'IN_TRANSIT': '배송중',
            'OUT_FOR_DELIVERY': '배송중',
            'DELIVERED': '배송완료',
            'EXCEPTION': '배송지연',
            'RETURNED': '반송'
        };
        return statusMap[status] || '배송중';
    }

    mapDirectAPIStatus(status, carrier) {
        const statusMaps = {
            cj: {
                'PICKED_UP': '배송중',
                'IN_TRANSIT': '배송중',
                'DELIVERED': '배송완료',
                'EXCEPTION': '배송지연'
            },
            hanjin: {
                'PICKED_UP': '배송중',
                'IN_TRANSIT': '배송중',
                'DELIVERED': '배송완료',
                'EXCEPTION': '배송지연'
            }
        };
        
        const carrierMap = statusMaps[carrier] || {};
        return carrierMap[status] || '배송중';
    }

    mapFallbackStatus(status) {
        const statusMap = {
            'PICKED_UP': '배송중',
            'IN_TRANSIT': '배송중',
            'DELIVERED': '배송완료',
            'EXCEPTION': '배송지연'
        };
        return statusMap[status] || '배송중';
    }

    // Rate Limiting 확인
    isRateLimited(carrier) {
        const now = Date.now();
        const carrierLimit = this.rateLimiter.get(carrier) || { count: 0, resetTime: now };
        
        if (now > carrierLimit.resetTime) {
            carrierLimit.count = 0;
            carrierLimit.resetTime = now + 3600000; // 1시간 후 리셋
        }
        
        const limit = this.apiConfig.carriers[carrier]?.rateLimit || 100;
        return carrierLimit.count >= limit;
    }

    // Rate Limit 대기
    async waitForRateLimit(carrier) {
        const carrierLimit = this.rateLimiter.get(carrier);
        const waitTime = carrierLimit.resetTime - Date.now();
        
        if (waitTime > 0) {
            console.log(`⏳ Rate Limit 해제까지 ${Math.ceil(waitTime / 1000)}초 대기`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    // Mock 데이터 생성
    async getMockData(trackingNumber, carrier) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    trackingNumber,
                    carrier: this.apiConfig.carriers[carrier].name,
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

    // 캐시 관리
    clearCache() {
        this.cache.clear();
        console.log('🗑️ API 캐시가 초기화되었습니다.');
    }

    // API 상태 확인
    async checkAPIStatus() {
        const status = {
            trackerDelivery: false,
            directAPIs: {},
            fallbackServices: {}
        };
        
        // Tracker Delivery 상태 확인
        try {
            const response = await fetch(`${this.apiConfig.trackerDelivery.baseUrl}/health`);
            status.trackerDelivery = response.ok;
        } catch (error) {
            status.trackerDelivery = false;
        }
        
        // 개별 택배사 API 상태 확인
        for (const [carrier, config] of Object.entries(this.apiConfig.fallbackServices.directAPIs)) {
            try {
                const response = await fetch(`${config.baseUrl}/health`);
                status.directAPIs[carrier] = response.ok;
            } catch (error) {
                status.directAPIs[carrier] = false;
            }
        }
        
        return status;
    }
}

// 전역 인스턴스 생성
export const realTrackingAPI = new RealTrackingAPI();
window.realTrackingAPI = realTrackingAPI;

