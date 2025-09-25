// API 연결 테스트용 간단한 스크립트
console.log('🚀 API 테스트 스크립트 로드됨');

class SimpleApiTest {
    constructor() {
        this.apiAvailable = false;
        this.init();
    }
    
    async init() {
        console.log('🧪 API 연결 테스트 시작...');
        this.apiAvailable = await this.testApiConnection();
        this.updateApiStatusUI(this.apiAvailable);
        console.log(`✅ 초기화 완료 - API 상태: ${this.apiAvailable ? '연결됨' : '로컬 모드'}`);
    }
    
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        
        console.log(`🌐 현재 호스트: ${hostname}, 프로토콜: ${protocol}, 패스: ${pathname}`);
        
        if (hostname.includes('genspark.ai')) {
            // GenSpark 환경에서는 상대 경로 사용
            const apiUrl = 'tables';
            console.log(`🚀 GenSpark API URL: ${apiUrl} (상대 경로)`);
            return apiUrl;
        } else if (hostname.includes('gensparkspace.com')) {
            const apiUrl = `${protocol}//${hostname}/tables`;
            console.log(`🏠 GenSparkSpace API URL: ${apiUrl}`);
            return apiUrl;
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 로컬 개발 환경 - localhost:8000으로 통일
            const apiUrl = 'http://localhost:8000/tables';
            console.log(`🏠 로컬 API URL: ${apiUrl}`);
            return apiUrl;
        } else {
            const apiUrl = 'tables';
            console.log(`🔧 기타 환경 API URL: ${apiUrl} (상대 경로)`);
            return apiUrl;
        }
    }
    
    getApiUrl(endpoint) {
        const baseUrl = this.getApiBaseUrl();
        const fullUrl = `${baseUrl}/${endpoint}`;
        console.log(`🔗 최종 API URL: ${fullUrl}`);
        return fullUrl;
    }
    
    async testApiConnection() {
        console.log('🧪 API 연결 테스트 시작...');
        
        try {
            const testUrl = this.getApiUrl('customers?limit=1');
            console.log(`📡 테스트 URL: ${testUrl}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log(`📊 API 응답 상태: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API 연결 성공!', data);
                return true;
            } else {
                console.log(`❌ API 연결 실패: ${response.status} ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.log(`🚫 API 연결 오류:`, error);
            if (error.name === 'AbortError') {
                console.log('⏰ API 연결 타임아웃 (5초)');
            }
            return false;
        }
    }
    
    updateApiStatusUI(isConnected) {
        const statusDot = document.getElementById('api-status-dot');
        const statusText = document.getElementById('api-status-text');
        
        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.className = 'w-2 h-2 rounded-full bg-green-400';
                statusText.textContent = 'API 연결됨';
                statusText.className = 'text-xs text-green-100';
            } else {
                statusDot.className = 'w-2 h-2 rounded-full bg-red-400';
                statusText.textContent = '로컬 모드';
                statusText.className = 'text-xs text-red-100';
            }
        }
    }
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 로드 완료');
    window.apiTest = new SimpleApiTest();
});