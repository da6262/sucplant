/**
 * 통합 모드 스위치 시스템
 * 로컬/API 모드 전환 및 관리
 * 경산다육식물농장 관리시스템
 */

// 전역 모드 상태 관리
window.MODE_SWITCH = {
    // 현재 모드 상태
    currentMode: 'local', // 'local' 또는 'api'
    
    // 모드 설정
    config: {
        local: {
            name: '로컬 모드',
            description: '기기 저장 데이터 사용',
            icon: '🏠',
            color: 'blue'
        },
        api: {
            name: 'API 모드', 
            description: '서버 데이터 사용',
            icon: '🌐',
            color: 'green'
        }
    },
    
    // 초기화
    init() {
        console.log('🔄 모드 스위치 시스템 초기화...');
        
        // 로컬스토리지에서 마지막 모드 복원
        const savedMode = localStorage.getItem('farm_mode');
        if (savedMode && (savedMode === 'local' || savedMode === 'api')) {
            this.currentMode = savedMode;
        }
        
        // 강제 로컬 모드 체크
        if (window.FORCE_LOCAL_MODE) {
            this.currentMode = 'local';
            console.log('🛑 강제 로컬 모드 활성화됨');
        }
        
        // 모드 적용
        this.applyMode(this.currentMode);
        
        // UI 업데이트
        this.updateUI();
        
        console.log(`✅ 모드 스위치 초기화 완료: ${this.getCurrentModeInfo().name}`);
    },
    
    // 모드 전환
    switchMode(newMode) {
        if (newMode !== 'local' && newMode !== 'api') {
            console.error('❌ 잘못된 모드:', newMode);
            return false;
        }
        
        // 강제 로컬 모드가 활성화된 경우 API 모드로 전환 불가
        if (window.FORCE_LOCAL_MODE && newMode === 'api') {
            console.warn('🛑 강제 로컬 모드로 인해 API 모드 전환 불가');
            alert('현재 강제 로컬 모드가 활성화되어 있습니다.\nAPI 모드로 전환할 수 없습니다.');
            return false;
        }
        
        console.log(`🔄 모드 전환: ${this.currentMode} → ${newMode}`);
        
        this.currentMode = newMode;
        localStorage.setItem('farm_mode', newMode);
        
        // 모드 적용
        this.applyMode(newMode);
        
        // UI 업데이트
        this.updateUI();
        
        // 앱 새로고침 (필요한 경우)
        if (window.app) {
            window.app.refreshAllTabs();
        }
        
        return true;
    },
    
    // 모드 적용
    applyMode(mode) {
        if (mode === 'local') {
            this.enableLocalMode();
        } else if (mode === 'api') {
            this.enableApiMode();
        }
    },
    
    // 로컬 모드 활성화
    enableLocalMode() {
        console.log('🏠 로컬 모드 활성화...');
        
        // API 호출 차단
        this.blockApiCalls();
        
        // 앱 상태 업데이트
        if (window.app) {
            window.app.apiAvailable = false;
            window.app.updateApiStatusUI(false);
        }
        
        // Supabase 비활성화
        if (window.SUPABASE_CONFIG) {
            window.SUPABASE_CONFIG.disabled = true;
        }
    },
    
    // API 모드 활성화
    enableApiMode() {
        console.log('🌐 API 모드 활성화...');
        
        // API 호출 허용
        this.allowApiCalls();
        
        // 앱 상태 업데이트
        if (window.app) {
            window.app.apiAvailable = true;
            window.app.updateApiStatusUI(true);
        }
        
        // Supabase 활성화
        if (window.SUPABASE_CONFIG) {
            window.SUPABASE_CONFIG.disabled = false;
        }
    },
    
    // API 호출 차단
    blockApiCalls() {
        // 기존 fetch 오버라이드가 있다면 백업
        if (!window.originalFetch) {
            window.originalFetch = window.fetch;
        }
        
        window.fetch = async function(url, options = {}) {
            // API 요청인지 확인
            if (typeof url === 'string' && (url.includes('tables/') || url.includes('/tables/'))) {
                console.log(`🛑 로컬 모드: API 요청 차단 - ${url}`);
                
                // 테이블명 추출
                let tableName = 'unknown';
                if (url.includes('tables/')) {
                    tableName = url.split('tables/')[1].split('?')[0].split('/')[0];
                }
                
                // 로컬 데이터 반환
                return window.MODE_SWITCH.getLocalDataResponse(tableName, options.method || 'GET');
            }
            
            // API가 아닌 요청은 원래대로
            return window.originalFetch(url, options);
        };
    },
    
    // API 호출 허용
    allowApiCalls() {
        if (window.originalFetch) {
            window.fetch = window.originalFetch;
            delete window.originalFetch;
        }
    },
    
    // 로컬 데이터 응답 생성
    getLocalDataResponse(tableName, method) {
        let localData = [];
        
        try {
            const stored = localStorage.getItem(tableName);
            if (stored) {
                localData = JSON.parse(stored);
            }
        } catch (e) {
            console.warn(`❌ ${tableName} 로컬 데이터 로드 실패:`, e);
        }
        
        if (method === 'GET') {
            return new Response(JSON.stringify({
                data: localData,
                total: localData.length,
                message: 'local_mode_data'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // POST, PUT, DELETE 등의 경우 빈 응답
            return new Response(JSON.stringify({
                data: null,
                message: 'local_mode_operation_completed'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    },
    
    // UI 업데이트
    updateUI() {
        const modeInfo = this.getCurrentModeInfo();
        
        // 상태 표시기 업데이트
        const statusIndicator = document.getElementById('api-status-indicator');
        const statusDot = document.getElementById('api-status-dot');
        const statusText = document.getElementById('api-status-text');
        
        if (statusIndicator && statusDot && statusText) {
            const colorClass = modeInfo.color === 'blue' ? 'blue' : 'green';
            statusIndicator.className = `flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-${colorClass}-100 text-${colorClass}-800`;
            statusDot.className = `w-2 h-2 rounded-full bg-${colorClass}-400`;
            statusText.textContent = modeInfo.name;
        }
        
        // 모드 전환 버튼 업데이트
        const switchBtn = document.getElementById('mode-switch-btn');
        if (switchBtn) {
            const nextMode = this.currentMode === 'local' ? 'api' : 'local';
            const nextModeInfo = this.config[nextMode];
            switchBtn.innerHTML = `
                <span class="mr-2">${nextModeInfo.icon}</span>
                ${nextModeInfo.name}로 전환
            `;
        }
    },
    
    // 현재 모드 정보 반환
    getCurrentModeInfo() {
        return this.config[this.currentMode];
    },
    
    // 현재 모드 반환
    getCurrentMode() {
        return this.currentMode;
    },
    
    // 모드 전환 가능 여부 확인
    canSwitchTo(mode) {
        if (window.FORCE_LOCAL_MODE && mode === 'api') {
            return false;
        }
        return true;
    }
};

// 모드 전환 함수 (전역)
window.switchToLocalMode = function() {
    return window.MODE_SWITCH.switchMode('local');
};

window.switchToApiMode = function() {
    return window.MODE_SWITCH.switchMode('api');
};

window.toggleMode = function() {
    const currentMode = window.MODE_SWITCH.getCurrentMode();
    const nextMode = currentMode === 'local' ? 'api' : 'local';
    return window.MODE_SWITCH.switchMode(nextMode);
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 모드 스위치 초기화
    window.MODE_SWITCH.init();
    
    // 모드 전환 버튼 이벤트 리스너
    const switchBtn = document.getElementById('mode-switch-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            const currentMode = window.MODE_SWITCH.getCurrentMode();
            const nextMode = currentMode === 'local' ? 'api' : 'local';
            
            if (!window.MODE_SWITCH.canSwitchTo(nextMode)) {
                alert('현재 강제 로컬 모드가 활성화되어 있습니다.\nAPI 모드로 전환할 수 없습니다.');
                return;
            }
            
            const nextModeInfo = window.MODE_SWITCH.config[nextMode];
            const confirm = window.confirm(
                `🔄 ${nextModeInfo.name}로 전환하시겠습니까?\n\n` +
                `${nextModeInfo.description}\n` +
                `${nextModeInfo.icon} ${nextModeInfo.name}`
            );
            
            if (confirm) {
                window.MODE_SWITCH.switchMode(nextMode);
            }
        });
    }
});

console.log('✅ 모드 스위치 시스템 로드 완료');

