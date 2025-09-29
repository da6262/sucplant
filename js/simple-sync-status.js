/**
 * 간단한 동기화 상태 표시
 * 상단바가 보이지 않는 경우를 위한 대안
 */

class SimpleSyncStatus {
    constructor() {
        this.statusElement = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createStatusBar());
        } else {
            this.createStatusBar();
        }
    }

    createStatusBar() {
        // 기존 상태바 제거
        const existing = document.getElementById('simple-sync-status');
        if (existing) {
            existing.remove();
        }

        // 상태바 생성
        const statusBar = document.createElement('div');
        statusBar.id = 'simple-sync-status';
        statusBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: linear-gradient(90deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        statusBar.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div id="sync-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; animation: pulse 2s infinite;"></div>
                <span id="sync-status-text">동기화 시스템 로딩 중...</span>
                <span id="sync-status-time" style="font-size: 12px; opacity: 0.8;"></span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="sync-manual-btn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    🔄 수동 동기화
                </button>
                <button id="sync-devices-btn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    📱 디바이스 목록
                </button>
                <button id="sync-reset-btn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    🔧 디바이스 초기화
                </button>
            </div>
        `;

        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            #simple-sync-status button:hover {
                background: rgba(255,255,255,0.3) !important;
            }
        `;
        document.head.appendChild(style);

        // body에 추가
        document.body.insertBefore(statusBar, document.body.firstChild);
        
        // 메인 콘텐츠에 상단 여백 추가
        const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        if (mainContent) {
            mainContent.style.paddingTop = '50px';
        }

        this.statusElement = statusBar;
        this.isVisible = true;
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 상태 설정
        this.updateStatus('loading', '동기화 시스템 초기화 중...');
        
        // 3초 후 디바이스 상태 체크
        setTimeout(() => {
            this.checkDeviceStatus();
        }, 3000);
        
        // 5초 후 추가 체크 (핸드폰용)
        setTimeout(() => {
            this.forceDeviceRegistration();
        }, 5000);
        
        console.log('✅ 간단한 동기화 상태바 생성 완료');
    }

    setupEventListeners() {
        // 수동 동기화 버튼
        const manualBtn = document.getElementById('sync-manual-btn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                this.triggerManualSync();
            });
        }

        // 디바이스 목록 버튼
        const devicesBtn = document.getElementById('sync-devices-btn');
        if (devicesBtn) {
            devicesBtn.addEventListener('click', () => {
                this.showDeviceList();
            });
        }

        // 디바이스 초기화 버튼
        const resetBtn = document.getElementById('sync-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDeviceSync();
            });
        }

        // 동기화 상태 업데이트 이벤트
        window.addEventListener('syncStatusUpdate', (e) => {
            this.updateStatus(e.detail.status, this.getStatusText(e.detail.status));
        });
    }

    updateStatus(status, text) {
        if (!this.statusElement) return;

        const dot = document.getElementById('sync-status-dot');
        const textEl = document.getElementById('sync-status-text');
        const timeEl = document.getElementById('sync-status-time');

        if (dot && textEl && timeEl) {
            // 상태에 따른 점 색상 변경
            switch (status) {
                case 'success':
                    dot.style.background = '#10b981';
                    break;
                case 'error':
                    dot.style.background = '#ef4444';
                    break;
                case 'syncing':
                    dot.style.background = '#3b82f6';
                    break;
                default:
                    dot.style.background = '#fbbf24';
            }

            textEl.textContent = text;
            timeEl.textContent = new Date().toLocaleTimeString();
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'success':
                return '동기화 완료';
            case 'error':
                return '동기화 오류';
            case 'syncing':
                return '동기화 중...';
            default:
                return '동기화 대기 중...';
        }
    }

    async checkDeviceStatus() {
        try {
            if (window.deviceManager) {
                // 강제로 현재 디바이스 추가
                window.deviceManager.ensureCurrentDeviceInList();
                
                // 현재 디바이스만 표시
                const devices = await window.deviceManager.getCurrentDeviceOnly();
                if (devices && devices.length > 0) {
                    this.updateStatus('success', '현재 기기 연결됨');
                } else {
                    // 디바이스가 없으면 강제로 현재 디바이스 추가
                    console.log('🔧 디바이스 목록이 비어있음 - 강제로 현재 디바이스 추가');
                    if (window.deviceManager) {
                        window.deviceManager.localDevices = [window.deviceManager.deviceInfo];
                        window.deviceManager.saveLocalDevices();
                    }
                    this.updateStatus('success', '현재 기기 연결됨');
                }
            } else {
                this.updateStatus('error', '동기화 시스템 오류');
            }
        } catch (error) {
            console.error('디바이스 상태 체크 실패:', error);
            this.updateStatus('error', '디바이스 상태 확인 실패');
        }
    }

    async forceDeviceRegistration() {
        try {
            console.log('🔧 강제 디바이스 등록 시작...');
            
            if (window.deviceManager) {
                // 현재 디바이스 정보 강제 업데이트
                window.deviceManager.deviceInfo.lastSeen = new Date().toISOString();
                
                // 로컬 디바이스 목록에 강제 추가
                const currentDevice = { ...window.deviceManager.deviceInfo, source: 'local' };
                window.deviceManager.localDevices = [currentDevice];
                window.deviceManager.saveLocalDevices();
                
                console.log('✅ 강제 디바이스 등록 완료');
                this.updateStatus('success', '현재 기기 연결됨 (강제 등록)');
                
                // 디바이스 목록 다시 확인
                setTimeout(() => {
                    this.checkDeviceStatus();
                }, 1000);
            }
        } catch (error) {
            console.error('강제 디바이스 등록 실패:', error);
        }
    }

    async triggerManualSync() {
        const btn = document.getElementById('sync-manual-btn');
        if (btn) {
            btn.textContent = '🔄 동기화 중...';
            btn.disabled = true;
        }

        this.updateStatus('syncing', '수동 동기화 실행 중...');

        try {
            if (window.crossDeviceSync) {
                await window.crossDeviceSync.forceSync();
                this.updateStatus('success', '수동 동기화 완료');
                this.showNotification('동기화가 완료되었습니다.', 'success');
            } else {
                throw new Error('동기화 시스템을 찾을 수 없습니다.');
            }
        } catch (error) {
            this.updateStatus('error', '동기화 실패');
            this.showNotification('동기화 중 오류가 발생했습니다.', 'error');
            console.error('동기화 오류:', error);
        } finally {
            if (btn) {
                btn.textContent = '🔄 수동 동기화';
                btn.disabled = false;
            }
        }
    }

    showDeviceList() {
        // 새로운 디바이스 관리자 사용
        if (window.deviceManager) {
            // 강제로 현재 디바이스 추가
            window.deviceManager.ensureCurrentDeviceInList();
            
            // 현재 디바이스만 표시
            window.deviceManager.getCurrentDeviceOnly().then(devices => {
                let message = '📱 현재 디바이스 정보:\n\n';
                if (devices && devices.length > 0) {
                    devices.forEach(device => {
                        const isOnline = window.deviceManager.isDeviceOnline(device);
                        const statusIcon = isOnline ? '🟢' : '🔴';
                        const currentIcon = '👉';
                        
                        message += `${currentIcon} ${statusIcon} ${window.deviceManager.getDeviceTypeName(device.type)} (${device.platform})\n`;
                        message += `   마지막 접속: ${new Date(device.lastSeen).toLocaleString()}\n`;
                        message += `   데이터 소스: ${device.source || 'current'}\n\n`;
                    });
                } else {
                    // 디바이스가 없으면 강제로 현재 디바이스 추가
                    console.log('🔧 디바이스 목록이 비어있음 - 강제로 현재 디바이스 추가');
                    if (window.deviceManager) {
                        window.deviceManager.localDevices = [window.deviceManager.deviceInfo];
                        window.deviceManager.saveLocalDevices();
                        
                        // 다시 시도
                        setTimeout(() => {
                            this.showDeviceList();
                        }, 500);
                        return;
                    }
                    
                    message += '동기화된 기기가 없습니다.\n\n';
                    message += '💡 해결 방법:\n';
                    message += '1. 다른 기기에서 같은 사이트에 접속해보세요\n';
                    message += '2. 인터넷 연결을 확인해주세요\n';
                    message += '3. 페이지를 새로고침해보세요';
                }
                alert(message);
            }).catch(error => {
                alert('디바이스 목록을 불러올 수 없습니다: ' + error.message);
            });
        } else if (window.crossDeviceSync) {
            // 기존 방식으로 폴백
            window.crossDeviceSync.getAllDevices().then(devices => {
                let message = '📱 연결된 디바이스 목록:\n\n';
                if (devices && devices.length > 0) {
                    devices.forEach(device => {
                        const isCurrent = device.id === window.crossDeviceSync?.deviceId;
                        message += `${isCurrent ? '👉 ' : '📱 '}${this.getDeviceTypeName(device.type)} (${device.platform})\n`;
                        message += `   마지막 접속: ${new Date(device.lastSeen).toLocaleString()}\n\n`;
                    });
                } else {
                    message += '연결된 디바이스가 없습니다.';
                }
                alert(message);
            }).catch(error => {
                alert('디바이스 목록을 불러올 수 없습니다: ' + error.message);
            });
        } else {
            alert('디바이스 관리 시스템을 찾을 수 없습니다.');
        }
    }

    getDeviceTypeName(type) {
        switch (type) {
            case 'mobile': return '핸드폰';
            case 'tablet': return '태블릿';
            case 'desktop': return '컴퓨터';
            default: return '알 수 없음';
        }
    }

    async resetDeviceSync() {
        if (!confirm('디바이스 동기화를 초기화하시겠습니까?\n\n이 작업은 현재 기기의 동기화 정보를 재설정합니다.')) {
            return;
        }

        const btn = document.getElementById('sync-reset-btn');
        if (btn) {
            btn.textContent = '🔧 초기화 중...';
            btn.disabled = true;
        }

        this.updateStatus('syncing', '디바이스 동기화 초기화 중...');

        try {
            // 디바이스 관리자 초기화
            if (window.deviceManager) {
                window.deviceManager.resetDevice();
            }

            // 동기화 시스템 강제 재시작
            if (window.crossDeviceSync) {
                await window.crossDeviceSync.forceSync();
            }

            this.updateStatus('success', '디바이스 동기화 초기화 완료');
            this.showNotification('디바이스 동기화가 초기화되었습니다. 잠시 후 다른 기기들이 나타날 것입니다.', 'success');

            // 3초 후 디바이스 목록 자동 표시
            setTimeout(() => {
                this.showDeviceList();
            }, 3000);

        } catch (error) {
            this.updateStatus('error', '초기화 실패');
            this.showNotification('디바이스 초기화 중 오류가 발생했습니다.', 'error');
            console.error('디바이스 초기화 오류:', error);
        } finally {
            if (btn) {
                btn.textContent = '🔧 디바이스 초기화';
                btn.disabled = false;
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 10000;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 애니메이션으로 표시
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    hide() {
        if (this.statusElement) {
            this.statusElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    show() {
        if (this.statusElement) {
            this.statusElement.style.display = 'flex';
            this.isVisible = true;
        }
    }
}

// 전역 인스턴스 생성
window.simpleSyncStatus = new SimpleSyncStatus();

console.log('📱 간단한 동기화 상태 표시 시스템 로드 완료');

