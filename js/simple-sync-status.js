/**
 * 📊 간단한 동기화 상태 표시
 * 
 * 동기화 상태를 간단하고 직관적으로 표시합니다.
 * 사용자에게 현재 동기화 상태를 명확하게 알려줍니다.
 */

class SimpleSyncStatus {
    constructor() {
        this.statusElement = null;
        this.isVisible = true;
        this.autoHide = true;
        this.hideDelay = 3000; // 3초 후 자동 숨김
        
        this.setupStatusDisplay();
        this.setupEventListeners();
    }

    // 상태 표시 설정
    setupStatusDisplay() {
        // 기존 상태 표시 제거
        const existing = document.getElementById('simple-sync-status');
        if (existing) {
            existing.remove();
        }
        
        // 상태 표시 요소 생성
        const statusContainer = document.createElement('div');
        statusContainer.id = 'simple-sync-status';
        statusContainer.className = 'fixed top-4 left-4 z-50 transition-all duration-300';
        statusContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg border p-3 flex items-center space-x-2">
                <div id="sync-status-icon" class="text-lg">🔄</div>
                <div>
                    <div id="sync-status-message" class="text-sm font-medium text-gray-700">동기화 중...</div>
                    <div id="sync-status-time" class="text-xs text-gray-500"></div>
                </div>
                <button id="sync-status-close" class="text-gray-400 hover:text-gray-600 ml-2" title="닫기">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(statusContainer);
        this.statusElement = statusContainer;
        
        // 닫기 버튼 이벤트
        const closeBtn = document.getElementById('sync-status-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 동기화 상태 변경 이벤트
        document.addEventListener('syncStatusChanged', (event) => {
            this.updateStatus(event.detail);
        });
        
        // 데이터 동기화 이벤트
        document.addEventListener('dataSynced', (event) => {
            this.showSyncComplete();
        });
        
        // 동기화 오류 이벤트
        document.addEventListener('syncError', (event) => {
            this.showSyncError(event.detail);
        });
        
        // 충돌 감지 이벤트
        document.addEventListener('dataConflict', (event) => {
            this.showConflictDetected();
        });
    }

    // 상태 업데이트
    updateStatus(statusData) {
        const { status, message, details } = statusData;
        
        const iconElement = document.getElementById('sync-status-icon');
        const messageElement = document.getElementById('sync-status-message');
        const timeElement = document.getElementById('sync-status-time');
        
        if (!iconElement || !messageElement || !timeElement) return;
        
        // 상태별 아이콘과 메시지 설정
        const statusConfig = {
            'connected': {
                icon: '✅',
                message: '동기화 완료',
                color: 'text-green-600'
            },
            'syncing': {
                icon: '🔄',
                message: '동기화 중...',
                color: 'text-blue-600'
            },
            'disconnected': {
                icon: '📡',
                message: '연결 끊어짐',
                color: 'text-red-600'
            },
            'error': {
                icon: '❌',
                message: '동기화 오류',
                color: 'text-red-600'
            },
            'conflict': {
                icon: '⚠️',
                message: '충돌 감지',
                color: 'text-yellow-600'
            },
            'offline': {
                icon: '📱',
                message: '오프라인 모드',
                color: 'text-gray-600'
            }
        };
        
        const config = statusConfig[status] || statusConfig['syncing'];
        
        iconElement.textContent = config.icon;
        messageElement.textContent = message || config.message;
        messageElement.className = `text-sm font-medium ${config.color}`;
        timeElement.textContent = new Date().toLocaleTimeString();
        
        // 상태 표시
        this.show();
        
        // 자동 숨김 설정
        if (this.autoHide && status === 'connected') {
            setTimeout(() => {
                this.hide();
            }, this.hideDelay);
        }
    }

    // 동기화 완료 표시
    showSyncComplete() {
        this.updateStatus({
            status: 'connected',
            message: '동기화 완료',
            details: '모든 데이터가 성공적으로 동기화되었습니다.'
        });
    }

    // 동기화 오류 표시
    showSyncError(errorData) {
        this.updateStatus({
            status: 'error',
            message: '동기화 오류',
            details: errorData.message || '알 수 없는 오류가 발생했습니다.'
        });
    }

    // 충돌 감지 표시
    showConflictDetected() {
        this.updateStatus({
            status: 'conflict',
            message: '데이터 충돌 감지',
            details: '다른 디바이스에서 동일한 데이터를 수정했습니다.'
        });
    }

    // 상태 표시
    show() {
        if (this.statusElement) {
            this.statusElement.classList.remove('opacity-0', 'translate-x-[-100%]');
            this.statusElement.classList.add('opacity-100', 'translate-x-0');
            this.isVisible = true;
        }
    }

    // 상태 숨김
    hide() {
        if (this.statusElement) {
            this.statusElement.classList.remove('opacity-100', 'translate-x-0');
            this.statusElement.classList.add('opacity-0', 'translate-x-[-100%]');
            this.isVisible = false;
        }
    }

    // 상태 토글
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // 자동 숨김 설정
    setAutoHide(enabled, delay = 3000) {
        this.autoHide = enabled;
        this.hideDelay = delay;
    }

    // 상태 메시지 직접 설정
    setMessage(message, type = 'info') {
        const iconElement = document.getElementById('sync-status-icon');
        const messageElement = document.getElementById('sync-status-message');
        const timeElement = document.getElementById('sync-status-time');
        
        if (!iconElement || !messageElement || !timeElement) return;
        
        const typeConfig = {
            'info': { icon: 'ℹ️', color: 'text-blue-600' },
            'success': { icon: '✅', color: 'text-green-600' },
            'warning': { icon: '⚠️', color: 'text-yellow-600' },
            'error': { icon: '❌', color: 'text-red-600' }
        };
        
        const config = typeConfig[type] || typeConfig['info'];
        
        iconElement.textContent = config.icon;
        messageElement.textContent = message;
        messageElement.className = `text-sm font-medium ${config.color}`;
        timeElement.textContent = new Date().toLocaleTimeString();
        
        this.show();
    }

    // 현재 상태 조회
    getCurrentStatus() {
        return {
            isVisible: this.isVisible,
            autoHide: this.autoHide,
            hideDelay: this.hideDelay,
            message: document.getElementById('sync-status-message')?.textContent || '',
            time: document.getElementById('sync-status-time')?.textContent || ''
        };
    }

    // 상태 초기화
    reset() {
        this.hide();
        this.setMessage('동기화 준비 중...', 'info');
    }
}

// 전역 간단한 동기화 상태 인스턴스 생성
window.simpleSyncStatus = new SimpleSyncStatus();

// 초기 상태 설정
window.simpleSyncStatus.setMessage('동기화 시스템 준비 중...', 'info');

console.log('📊 간단한 동기화 상태 시스템 로드 완료');
