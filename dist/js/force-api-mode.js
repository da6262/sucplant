/**
 * 🔧 강제 API 모드
 * 
 * Supabase API 모드를 강제로 활성화하고 로컬 모드를 비활성화합니다.
 * 프로덕션 환경에서 사용됩니다.
 */

class ForceAPIMode {
    constructor() {
        this.isAPIMode = false;
        this.isLocalMode = false;
        this.originalMode = null;
        
        this.initialize();
    }

    // 초기화
    initialize() {
        console.log('🔧 강제 API 모드 초기화 중...');
        
        // 현재 모드 확인
        this.checkCurrentMode();
        
        // API 모드 강제 활성화
        this.forceAPIMode();
        
        // 로컬 모드 비활성화
        this.disableLocalMode();
        
        console.log('✅ 강제 API 모드 설정 완료');
    }

    // 현재 모드 확인
    checkCurrentMode() {
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'api') {
            this.isAPIMode = true;
        } else if (mode === 'local') {
            this.isLocalMode = true;
        }
        
        // 로컬 스토리지 확인
        const storedMode = localStorage.getItem('app_mode');
        if (storedMode === 'api') {
            this.isAPIMode = true;
        } else if (storedMode === 'local') {
            this.isLocalMode = true;
        }
        
        this.originalMode = storedMode || 'auto';
        console.log(`📊 현재 모드: ${this.originalMode}, API 모드: ${this.isAPIMode}, 로컬 모드: ${this.isLocalMode}`);
    }

    // API 모드 강제 활성화
    forceAPIMode() {
        try {
            // 로컬 스토리지에 API 모드 저장
            localStorage.setItem('app_mode', 'api');
            localStorage.setItem('force_api_mode', 'true');
            localStorage.setItem('disable_local_mode', 'true');
            
            // 전역 변수 설정
            window.APP_MODE = 'api';
            window.FORCE_API_MODE = true;
            window.DISABLE_LOCAL_MODE = true;
            
            // Supabase 연결 강제
            this.forceSupabaseConnection();
            
            console.log('✅ API 모드 강제 활성화 완료');
            
        } catch (error) {
            console.error('❌ API 모드 강제 활성화 실패:', error);
        }
    }

    // 로컬 모드 비활성화
    disableLocalMode() {
        try {
            // 로컬 모드 관련 설정 비활성화
            localStorage.setItem('disable_local_mode', 'true');
            localStorage.removeItem('local_mode_enabled');
            localStorage.removeItem('offline_mode');
            
            // 전역 변수 설정
            window.DISABLE_LOCAL_MODE = true;
            window.LOCAL_MODE_ENABLED = false;
            window.OFFLINE_MODE = false;
            
            console.log('✅ 로컬 모드 비활성화 완료');
            
        } catch (error) {
            console.error('❌ 로컬 모드 비활성화 실패:', error);
        }
    }

    // Supabase 연결 강제
    forceSupabaseConnection() {
        try {
            // Supabase 설정 확인
            if (!window.SUPABASE_CONFIG) {
                console.warn('⚠️ Supabase 설정이 없습니다. 기본 설정을 사용합니다.');
                this.setDefaultSupabaseConfig();
            }
            
            // Supabase 클라이언트 강제 초기화
            if (typeof supabase !== 'undefined') {
                window.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('✅ Supabase 클라이언트 강제 초기화 완료');
            } else {
                console.warn('⚠️ Supabase 라이브러리가 로드되지 않았습니다.');
            }
            
        } catch (error) {
            console.error('❌ Supabase 연결 강제 실패:', error);
        }
    }

    // 기본 Supabase 설정
    setDefaultSupabaseConfig() {
        window.SUPABASE_CONFIG = {
            url: 'https://your-project.supabase.co',
            anonKey: 'your-anon-key-here'
        };
        console.log('🔧 기본 Supabase 설정 적용');
    }

    // 모드 전환 방지
    preventModeSwitch() {
        // 모드 전환 함수들 오버라이드
        if (window.switchToLocalMode) {
            window.switchToLocalMode = () => {
                console.warn('⚠️ 로컬 모드로 전환할 수 없습니다. API 모드가 강제 활성화되어 있습니다.');
                return false;
            };
        }
        
        if (window.switchToAPIMode) {
            window.switchToAPIMode = () => {
                console.log('✅ 이미 API 모드입니다.');
                return true;
            };
        }
        
        console.log('🔒 모드 전환 방지 설정 완료');
    }

    // API 모드 상태 확인
    checkAPIModeStatus() {
        const status = {
            isAPIMode: this.isAPIMode,
            isLocalMode: this.isLocalMode,
            forceAPIMode: localStorage.getItem('force_api_mode') === 'true',
            disableLocalMode: localStorage.getItem('disable_local_mode') === 'true',
            supabaseConnected: !!window.supabase,
            supabaseConfig: !!window.SUPABASE_CONFIG
        };
        
        console.log('📊 API 모드 상태:', status);
        return status;
    }

    // API 모드 강제 해제 (개발용)
    releaseAPIMode() {
        try {
            localStorage.removeItem('force_api_mode');
            localStorage.removeItem('disable_local_mode');
            localStorage.setItem('app_mode', 'auto');
            
            window.FORCE_API_MODE = false;
            window.DISABLE_LOCAL_MODE = false;
            
            console.log('🔓 API 모드 강제 해제 완료');
            
        } catch (error) {
            console.error('❌ API 모드 강제 해제 실패:', error);
        }
    }
}

// 전역 강제 API 모드 인스턴스 생성
window.forceAPIMode = new ForceAPIMode();

// 모드 전환 방지 활성화
window.forceAPIMode.preventModeSwitch();

console.log('🔧 강제 API 모드 시스템 로드 완료');
