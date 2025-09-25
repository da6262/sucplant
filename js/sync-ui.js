/**
 * 동기화 상태 UI 관리
 * 실시간 동기화 상태 표시 및 제어
 */

class SyncUI {
    constructor() {
        this.syncStatusElement = null;
        this.syncIndicator = null;
        this.deviceListElement = null;
        this.isInitialized = false;
        
        this.initializeUI();
        this.setupEventListeners();
    }

    /**
     * UI 초기화
     */
    initializeUI() {
        this.createSyncStatusBar();
        this.createDeviceListModal();
        this.isInitialized = true;
        console.log('🎨 동기화 UI 초기화 완료');
    }

    /**
     * 동기화 상태바 생성
     */
    createSyncStatusBar() {
        // 기존 상태바가 있으면 제거
        const existingBar = document.getElementById('sync-status-bar');
        if (existingBar) {
            existingBar.remove();
        }

        const syncBar = document.createElement('div');
        syncBar.id = 'sync-status-bar';
        syncBar.className = 'fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm';
        syncBar.innerHTML = `
            <div class="flex items-center justify-between px-4 py-2">
                <div class="flex items-center space-x-3">
                    <div id="sync-indicator" class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-gray-400 animate-pulse" id="sync-dot"></div>
                        <span class="text-sm text-gray-600" id="sync-text">동기화 중...</span>
                    </div>
                    <div class="text-xs text-gray-500" id="sync-time"></div>
                </div>
                <div class="flex items-center space-x-2">
                    <button id="sync-manual-btn" class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                        <i class="fas fa-sync-alt mr-1"></i>수동 동기화
                    </button>
                    <button id="sync-devices-btn" class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                        <i class="fas fa-mobile-alt mr-1"></i>디바이스 목록
                    </button>
                    <button id="sync-settings-btn" class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                        <i class="fas fa-cog mr-1"></i>설정
                    </button>
                </div>
            </div>
        `;

        // body에 추가
        document.body.insertBefore(syncBar, document.body.firstChild);
        
        // 메인 콘텐츠에 상단 여백 추가
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.paddingTop = '60px';
        }

        this.syncStatusElement = syncBar;
        this.syncIndicator = document.getElementById('sync-indicator');
    }

    /**
     * 디바이스 목록 모달 생성
     */
    createDeviceListModal() {
        const modal = document.createElement('div');
        modal.id = 'device-list-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">연결된 디바이스</h3>
                        <button id="close-device-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-4 overflow-y-auto max-h-80" id="device-list-content">
                        <div class="text-center text-gray-500 py-8">
                            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                            <p>디바이스 목록을 불러오는 중...</p>
                        </div>
                    </div>
                    <div class="flex justify-end p-4 border-t bg-gray-50">
                        <button id="refresh-devices-btn" class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            <i class="fas fa-refresh mr-1"></i>새로고침
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.deviceListElement = modal;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 수동 동기화 버튼
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sync-manual-btn')) {
                this.triggerManualSync();
            }
        });

        // 디바이스 목록 버튼
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sync-devices-btn')) {
                this.showDeviceList();
            }
        });

        // 설정 버튼
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sync-settings-btn')) {
                this.showSyncSettings();
            }
        });

        // 모달 닫기
        document.addEventListener('click', (e) => {
            if (e.target.closest('#close-device-modal') || e.target.id === 'device-list-modal') {
                this.hideDeviceList();
            }
        });

        // 디바이스 목록 새로고침
        document.addEventListener('click', (e) => {
            if (e.target.closest('#refresh-devices-btn')) {
                this.refreshDeviceList();
            }
        });

        // 동기화 상태 업데이트 이벤트
        window.addEventListener('syncStatusUpdate', (e) => {
            this.updateSyncStatus(e.detail);
        });
    }

    /**
     * 수동 동기화 트리거
     */
    async triggerManualSync() {
        const btn = document.getElementById('sync-manual-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>동기화 중...';
        btn.disabled = true;

        try {
            if (window.crossDeviceSync) {
                await window.crossDeviceSync.forceSync();
                this.showNotification('동기화가 완료되었습니다.', 'success');
            }
        } catch (error) {
            this.showNotification('동기화 중 오류가 발생했습니다.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    /**
     * 디바이스 목록 표시
     */
    async showDeviceList() {
        this.deviceListElement.classList.remove('hidden');
        await this.refreshDeviceList();
    }

    /**
     * 디바이스 목록 숨기기
     */
    hideDeviceList() {
        this.deviceListElement.classList.add('hidden');
    }

    /**
     * 디바이스 목록 새로고침
     */
    async refreshDeviceList() {
        const content = document.getElementById('device-list-content');
        content.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>디바이스 목록을 불러오는 중...</p>
            </div>
        `;

        try {
            if (window.deviceManager) {
                const devices = await window.deviceManager.getAllDevices();
                this.renderDeviceList(devices);
            } else {
                content.innerHTML = `
                    <div class="text-center text-red-500 py-8">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>디바이스 관리자를 찾을 수 없습니다.</p>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = `
                <div class="text-center text-red-500 py-8">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>디바이스 목록을 불러올 수 없습니다.</p>
                    <p class="text-sm mt-2">${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * 디바이스 목록 렌더링
     */
    renderDeviceList(devices) {
        const content = document.getElementById('device-list-content');
        
        if (!devices || devices.length === 0) {
            content.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-mobile-alt text-2xl mb-2"></i>
                    <p>연결된 디바이스가 없습니다.</p>
                </div>
            `;
            return;
        }

        const deviceCards = devices.map(device => {
            const isCurrentDevice = device.id === window.deviceManager?.deviceId;
            const lastSeen = new Date(device.lastSeen).toLocaleString();
            const deviceIcon = this.getDeviceIcon(device.type);
            
            return `
                <div class="flex items-center justify-between p-3 border rounded-lg mb-2 ${isCurrentDevice ? 'bg-green-50 border-green-200' : 'bg-gray-50'}">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${deviceIcon}</div>
                        <div>
                            <div class="font-medium text-gray-900">
                                ${this.getDeviceTypeName(device.type)}
                                ${isCurrentDevice ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">현재 기기</span>' : ''}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${device.platform} • ${device.screen}
                            </div>
                            <div class="text-xs text-gray-400">
                                마지막 접속: ${lastSeen}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 rounded-full ${this.isDeviceOnline(device) ? 'bg-green-400' : 'bg-gray-400'}"></div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = deviceCards;
    }

    /**
     * 디바이스 아이콘 가져오기
     */
    getDeviceIcon(type) {
        switch (type) {
            case 'mobile': return '📱';
            case 'tablet': return '📱';
            case 'desktop': return '💻';
            default: return '🖥️';
        }
    }

    /**
     * 디바이스 타입 이름 가져오기
     */
    getDeviceTypeName(type) {
        switch (type) {
            case 'mobile': return '핸드폰';
            case 'tablet': return '태블릿';
            case 'desktop': return '컴퓨터';
            default: return '알 수 없음';
        }
    }

    /**
     * 디바이스 온라인 상태 확인
     */
    isDeviceOnline(device) {
        const lastSeen = new Date(device.lastSeen);
        const now = new Date();
        const diffMinutes = (now - lastSeen) / (1000 * 60);
        return diffMinutes < 5; // 5분 이내 접속 시 온라인으로 간주
    }

    /**
     * 동기화 설정 표시
     */
    showSyncSettings() {
        const currentSettings = {
            syncFrequency: window.crossDeviceSync?.syncFrequency || 30000,
            conflictResolution: window.crossDeviceSync?.conflictResolution || 'server-wins'
        };

        const settings = prompt(
            `동기화 설정을 변경하세요:\n\n` +
            `1. 동기화 주기 (밀리초): ${currentSettings.syncFrequency}\n` +
            `2. 충돌 해결 방식: ${currentSettings.conflictResolution}\n\n` +
            `새로운 동기화 주기를 입력하세요 (기본값: 30000):`,
            currentSettings.syncFrequency.toString()
        );

        if (settings && !isNaN(settings)) {
            const newFrequency = parseInt(settings);
            if (newFrequency >= 10000) { // 최소 10초
                window.crossDeviceSync?.updateSettings({
                    syncFrequency: newFrequency
                });
                this.showNotification('동기화 설정이 업데이트되었습니다.', 'success');
            } else {
                this.showNotification('동기화 주기는 최소 10초 이상이어야 합니다.', 'error');
            }
        }
    }

    /**
     * 동기화 상태 업데이트
     */
    updateSyncStatus(statusData) {
        const syncDot = document.getElementById('sync-dot');
        const syncText = document.getElementById('sync-text');
        const syncTime = document.getElementById('sync-time');

        if (!syncDot || !syncText || !syncTime) return;

        // 상태에 따른 스타일 변경
        switch (statusData.status) {
            case 'success':
                syncDot.className = 'w-3 h-3 rounded-full bg-green-400';
                syncText.textContent = '동기화 완료';
                syncText.className = 'text-sm text-green-600';
                break;
            case 'error':
                syncDot.className = 'w-3 h-3 rounded-full bg-red-400';
                syncText.textContent = '동기화 오류';
                syncText.className = 'text-sm text-red-600';
                break;
            case 'syncing':
                syncDot.className = 'w-3 h-3 rounded-full bg-blue-400 animate-pulse';
                syncText.textContent = '동기화 중...';
                syncText.className = 'text-sm text-blue-600';
                break;
            default:
                syncDot.className = 'w-3 h-3 rounded-full bg-gray-400 animate-pulse';
                syncText.textContent = '대기 중...';
                syncText.className = 'text-sm text-gray-600';
        }

        // 마지막 동기화 시간 표시
        if (statusData.lastSync) {
            const lastSync = new Date(statusData.lastSync);
            syncTime.textContent = `마지막 동기화: ${lastSync.toLocaleTimeString()}`;
        }

        // 동기화 시간 표시
        if (statusData.duration) {
            syncTime.textContent += ` (${statusData.duration}ms)`;
        }
    }

    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white'
        };

        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${message}</span>
                <button class="ml-3 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // 애니메이션으로 표시
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * 동기화 통계 표시
     */
    showSyncStats() {
        if (!window.crossDeviceSync) return;

        const stats = window.crossDeviceSync.getSyncStats();
        const status = window.crossDeviceSync.getSyncStatus();

        let message = `📊 동기화 통계\n\n`;
        message += `마지막 동기화: ${status?.lastSync ? new Date(status.lastSync).toLocaleString() : '없음'}\n`;
        message += `총 레코드 수: ${stats.totalRecords}개\n\n`;
        
        Object.entries(stats.tableStats).forEach(([table, count]) => {
            message += `${table}: ${count}개\n`;
        });

        alert(message);
    }
}

// 전역 인스턴스 생성
window.syncUI = new SyncUI();

console.log('🎨 동기화 UI 모듈 로드 완료');




