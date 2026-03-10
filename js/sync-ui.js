/**
 * 🎨 동기화 UI 관리
 * 
 * 동기화 상태 표시 및 사용자 인터페이스를 관리합니다.
 * 실시간 동기화 상태, 충돌 해결, 동기화 설정을 제공합니다.
 */

class SyncUI {
    constructor() {
        this.syncStatusElement = null;
        this.syncIndicator = null;
        this.conflictModal = null;
        this.settingsModal = null;
        
        this.setupUI();
        this.setupEventListeners();
    }

    // UI 설정
    setupUI() {
        this.createSyncStatusIndicator();
        this.createConflictModal();
        this.createSettingsModal();
        this.updateSyncStatus('disconnected');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 데이터 동기화 이벤트
        document.addEventListener('dataSynced', (event) => {
            this.handleDataSynced(event.detail);
        });
        
        // 충돌 감지 이벤트
        document.addEventListener('dataConflict', (event) => {
            this.showConflictResolution(event.detail);
        });
        
        // 동기화 상태 변경 이벤트
        document.addEventListener('syncStatusChanged', (event) => {
            this.updateSyncStatus(event.detail.status);
        });
    }

    // 동기화 상태 인디케이터 생성
    createSyncStatusIndicator() {
        // 기존 인디케이터 제거
        const existing = document.getElementById('sync-status-indicator');
        if (existing) {
            existing.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.id = 'sync-status-indicator';
        indicator.className = 'fixed bottom-4 right-4 z-50';
        indicator.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg border p-3 flex items-center space-x-2">
                <div id="sync-status-dot" class="w-3 h-3 rounded-full bg-gray-400"></div>
                <span id="sync-status-text" class="text-sm font-medium text-gray-700">동기화 중...</span>
                <button id="sync-settings-btn" class="text-gray-500 hover:text-gray-700 ml-2" title="동기화 설정">
                    ⚙️
                </button>
            </div>
        `;
        
        document.body.appendChild(indicator);
        this.syncIndicator = indicator;
        
        // 설정 버튼 이벤트
        const settingsBtn = document.getElementById('sync-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSyncSettings();
            });
        }
    }

    // 충돌 해결 모달 생성
    createConflictModal() {
        const modal = document.createElement('div');
        modal.id = 'conflict-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">데이터 충돌 감지</h3>
                        <div class="mb-4">
                            <p class="text-gray-600 mb-2">다음 데이터에서 충돌이 발생했습니다:</p>
                            <div id="conflict-details" class="bg-gray-50 p-3 rounded border"></div>
                        </div>
                        <div class="flex space-x-3">
                            <button id="use-local-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                로컬 데이터 사용
                            </button>
                            <button id="use-remote-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                원격 데이터 사용
                            </button>
                            <button id="merge-btn" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                                수동 병합
                            </button>
                            <button id="cancel-conflict-btn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.conflictModal = modal;
        
        // 이벤트 리스너 설정
        this.setupConflictModalEvents();
    }

    // 동기화 설정 모달 생성
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'sync-settings-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">동기화 설정</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">동기화 주기</label>
                                <select id="sync-interval" class="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="10">10초</option>
                                    <option value="30" selected>30초</option>
                                    <option value="60">1분</option>
                                    <option value="300">5분</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">충돌 해결 방식</label>
                                <select id="conflict-resolution" class="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="server_wins">서버 데이터 우선</option>
                                    <option value="client_wins">클라이언트 데이터 우선</option>
                                    <option value="manual">수동 해결</option>
                                </select>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" id="auto-sync" class="mr-2" checked>
                                <label for="auto-sync" class="text-sm text-gray-700">자동 동기화</label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" id="notify-conflicts" class="mr-2" checked>
                                <label for="notify-conflicts" class="text-sm text-gray-700">충돌 알림</label>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button id="save-sync-settings" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                저장
                            </button>
                            <button id="cancel-sync-settings" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.settingsModal = modal;
        
        // 이벤트 리스너 설정
        this.setupSettingsModalEvents();
    }

    // 충돌 모달 이벤트 설정
    setupConflictModalEvents() {
        const useLocalBtn = document.getElementById('use-local-btn');
        const useRemoteBtn = document.getElementById('use-remote-btn');
        const mergeBtn = document.getElementById('merge-btn');
        const cancelBtn = document.getElementById('cancel-conflict-btn');
        
        if (useLocalBtn) {
            useLocalBtn.addEventListener('click', () => {
                this.resolveConflict('local');
            });
        }
        
        if (useRemoteBtn) {
            useRemoteBtn.addEventListener('click', () => {
                this.resolveConflict('remote');
            });
        }
        
        if (mergeBtn) {
            mergeBtn.addEventListener('click', () => {
                this.showManualMerge();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideConflictModal();
            });
        }
    }

    // 설정 모달 이벤트 설정
    setupSettingsModalEvents() {
        const saveBtn = document.getElementById('save-sync-settings');
        const cancelBtn = document.getElementById('cancel-sync-settings');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSyncSettings();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideSyncSettings();
            });
        }
    }

    // 동기화 상태 업데이트
    updateSyncStatus(status) {
        const statusDot = document.getElementById('sync-status-dot');
        const statusText = document.getElementById('sync-status-text');
        
        if (!statusDot || !statusText) return;
        
        const statusConfig = {
            'connected': {
                dot: 'bg-green-400',
                text: '동기화 완료',
                animation: 'pulse'
            },
            'syncing': {
                dot: 'bg-yellow-400',
                text: '동기화 중...',
                animation: 'spin'
            },
            'disconnected': {
                dot: 'bg-red-400',
                text: '연결 끊어짐',
                animation: 'none'
            },
            'error': {
                dot: 'bg-red-500',
                text: '동기화 오류',
                animation: 'none'
            }
        };
        
        const config = statusConfig[status] || statusConfig['disconnected'];
        
        statusDot.className = `w-3 h-3 rounded-full ${config.dot}`;
        statusText.textContent = config.text;
        
        if (config.animation === 'pulse') {
            statusDot.style.animation = 'pulse 2s infinite';
        } else if (config.animation === 'spin') {
            statusDot.style.animation = 'spin 1s linear infinite';
        } else {
            statusDot.style.animation = 'none';
        }
    }

    // 데이터 동기화 완료 처리
    handleDataSynced(detail) {
        console.log('📢 데이터 동기화 완료:', detail);
        this.updateSyncStatus('connected');
        
        // 성공 알림 표시
        this.showNotification('데이터 동기화 완료', 'success');
    }

    // 충돌 해결 표시
    showConflictResolution(conflictData) {
        const detailsElement = document.getElementById('conflict-details');
        if (detailsElement) {
            detailsElement.innerHTML = `
                <div class="space-y-2">
                    <div><strong>테이블:</strong> ${conflictData.table}</div>
                    <div><strong>로컬 데이터:</strong> <pre class="text-xs bg-blue-50 p-2 rounded">${JSON.stringify(conflictData.local, null, 2)}</pre></div>
                    <div><strong>원격 데이터:</strong> <pre class="text-xs bg-green-50 p-2 rounded">${JSON.stringify(conflictData.remote, null, 2)}</pre></div>
                </div>
            `;
        }
        
        this.conflictModal.classList.remove('hidden');
    }

    // 충돌 해결
    resolveConflict(resolution) {
        console.log(`🔧 충돌 해결: ${resolution}`);
        
        // 충돌 해결 이벤트 발생
        const event = new CustomEvent('conflictResolved', {
            detail: { resolution }
        });
        document.dispatchEvent(event);
        
        this.hideConflictModal();
        this.showNotification(`충돌 해결: ${resolution === 'local' ? '로컬 데이터 사용' : '원격 데이터 사용'}`, 'info');
    }

    // 수동 병합 표시
    showManualMerge() {
        console.log('🔧 수동 병합 모드');
        this.hideConflictModal();
        this.showNotification('수동 병합 모드 활성화', 'info');
    }

    // 충돌 모달 숨기기
    hideConflictModal() {
        this.conflictModal.classList.add('hidden');
    }

    // 동기화 설정 표시
    showSyncSettings() {
        this.settingsModal.classList.remove('hidden');
    }

    // 동기화 설정 숨기기
    hideSyncSettings() {
        this.settingsModal.classList.add('hidden');
    }

    // 동기화 설정 저장
    saveSyncSettings() {
        const interval = document.getElementById('sync-interval').value;
        const resolution = document.getElementById('conflict-resolution').value;
        const autoSync = document.getElementById('auto-sync').checked;
        const notifyConflicts = document.getElementById('notify-conflicts').checked;
        
        // 설정 저장
        localStorage.setItem('sync_interval', interval);
        localStorage.setItem('conflict_resolution', resolution);
        localStorage.setItem('auto_sync', autoSync);
        localStorage.setItem('notify_conflicts', notifyConflicts);
        
        // 설정 적용
        this.applySyncSettings();
        
        this.hideSyncSettings();
        this.showNotification('동기화 설정 저장 완료', 'success');
    }

    // 동기화 설정 적용
    applySyncSettings() {
        const interval = localStorage.getItem('sync_interval') || '30';
        const resolution = localStorage.getItem('conflict_resolution') || 'server_wins';
        const autoSync = localStorage.getItem('auto_sync') === 'true';
        
        // 크로스 디바이스 동기화에 설정 적용
        if (window.crossDeviceSync) {
            window.crossDeviceSync.conflictResolution = resolution;
        }
        
        // 자동 동기화 설정
        if (autoSync && window.crossDeviceSync) {
            window.crossDeviceSync.startSync();
        } else if (!autoSync && window.crossDeviceSync) {
            window.crossDeviceSync.stopSync();
        }
        
        console.log('🔧 동기화 설정 적용:', { interval, resolution, autoSync });
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // 동기화 상태 확인
    getSyncStatus() {
        return {
            status: document.getElementById('sync-status-text')?.textContent || 'unknown',
            isConnected: document.getElementById('sync-status-dot')?.classList.contains('bg-green-400') || false,
            lastUpdate: new Date().toISOString()
        };
    }
}

// 전역 동기화 UI 인스턴스 생성
window.syncUI = new SyncUI();

console.log('🎨 동기화 UI 시스템 로드 완료');
