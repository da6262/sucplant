// 택배사 API 설정 및 인증 정보
// 실제 운영 환경에서는 환경 변수로 관리

export const API_CONFIG = {
    // Tracker Delivery API 설정
    trackerDelivery: {
        baseUrl: 'https://apis.tracker.delivery',
        apiKey: process.env.TRACKER_DELIVERY_API_KEY || 'your-api-key-here',
        timeout: 10000, // 10초
        retryAttempts: 3
    },
    
    // 개별 택배사 API 설정
    carriers: {
        cj: {
            name: 'CJ대한통운',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.cjlogistics',
            authRequired: false,
            rateLimit: 100 // 시간당 요청 수
        },
        hanjin: {
            name: '한진택배',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.hanjin',
            authRequired: false,
            rateLimit: 100
        },
        lotte: {
            name: '롯데택배',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.lotte',
            authRequired: false,
            rateLimit: 100
        },
        logen: {
            name: '로젠택배',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.logen',
            authRequired: false,
            rateLimit: 100
        },
        kdexp: {
            name: '대한통운',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.kdexp',
            authRequired: false,
            rateLimit: 100
        },
        epost: {
            name: '우체국택배',
            apiUrl: 'https://apis.tracker.delivery/carriers/kr.epost',
            authRequired: false,
            rateLimit: 100
        }
    },
    
    // 대체 API 서비스 (Tracker Delivery 실패 시)
    fallbackServices: {
        // 한국택배 API
        koreaPost: {
            name: '한국택배 API',
            baseUrl: 'https://api.koreapost.go.kr',
            apiKey: process.env.KOREA_POST_API_KEY || 'your-korea-post-key',
            timeout: 8000
        },
        // 개별 택배사 직접 API
        directAPIs: {
            cj: {
                name: 'CJ대한통운 직접 API',
                baseUrl: 'https://www.cjlogistics.com/api',
                authRequired: true,
                apiKey: process.env.CJ_API_KEY || 'your-cj-key'
            },
            hanjin: {
                name: '한진택배 직접 API',
                baseUrl: 'https://www.hanjin.co.kr/api',
                authRequired: true,
                apiKey: process.env.HANJIN_API_KEY || 'your-hanjin-key'
            }
        }
    },
    
    // API 호출 설정
    requestConfig: {
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        userAgent: 'SucPlant-Shipping-Tracker/1.0',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    // 캐싱 설정
    cache: {
        enabled: true,
        ttl: 300000, // 5분
        maxSize: 1000 // 최대 캐시 항목 수
    },
    
    // 로깅 설정
    logging: {
        enabled: true,
        level: 'info', // debug, info, warn, error
        logAPIResponses: false // API 응답 로깅 여부
    }
};

// API 키 검증
export function validateAPIKeys() {
    const requiredKeys = [
        'TRACKER_DELIVERY_API_KEY',
        'KOREA_POST_API_KEY',
        'CJ_API_KEY',
        'HANJIN_API_KEY'
    ];
    
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
        console.warn('⚠️ 다음 API 키가 설정되지 않았습니다:', missingKeys);
        console.warn('⚠️ Mock 데이터를 사용합니다.');
        return false;
    }
    
    console.log('✅ 모든 API 키가 설정되었습니다.');
    return true;
}

// API 사용량 모니터링
export class APIMonitor {
    constructor() {
        this.usage = {};
        this.limits = {};
    }
    
    // API 사용량 기록
    recordUsage(carrier, endpoint) {
        const key = `${carrier}-${endpoint}`;
        this.usage[key] = (this.usage[key] || 0) + 1;
        
        // 사용량 제한 확인
        const limit = this.limits[carrier] || 100;
        if (this.usage[key] > limit) {
            console.warn(`⚠️ ${carrier} API 사용량 초과: ${this.usage[key]}/${limit}`);
        }
    }
    
    // 사용량 초기화 (일일)
    resetDailyUsage() {
        this.usage = {};
        console.log('📊 API 사용량이 초기화되었습니다.');
    }
    
    // 사용량 통계
    getUsageStats() {
        return {
            total: Object.values(this.usage).reduce((sum, count) => sum + count, 0),
            byCarrier: this.usage,
            limits: this.limits
        };
    }
}

// 전역 모니터 인스턴스
export const apiMonitor = new APIMonitor();

