/**
 * 📱 디바이스 관리자
 * 
 * 디바이스 정보 관리 및 크로스 디바이스 동기화를 담당합니다.
 * 디바이스 식별, 상태 관리, 동기화 설정을 제공합니다.
 */

class DeviceManager {
    constructor() {
        this.deviceId = null;
        this.deviceInfo = null;
        this.deviceType = this.detectDeviceType();
        this.isOnline = navigator.onLine;
        this.lastSeen = new Date().toISOString();
        this.syncCapabilities = {
            realtime: false,
            background: false,
            push: false
        };
        
        this.initialize();
    }

    // 초기화
    async initialize() {
        try {
            console.log('📱 디바이스 관리자 초기화 중...');
            
            // 디바이스 ID 생성/조회
            await this.setupDeviceId();
            
            // 디바이스 정보 수집
            await this.collectDeviceInfo();
            
            // 디바이스 등록
            await this.registerDevice();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 동기화 기능 확인
            await this.checkSyncCapabilities();
            
            console.log('✅ 디바이스 관리자 초기화 완료');
            
        } catch (error) {
            console.error('❌ 디바이스 관리자 초기화 실패:', error);
        }
    }

    // 디바이스 ID 설정
    async setupDeviceId() {
        try {
            // 기존 디바이스 ID 확인
            this.deviceId = localStorage.getItem('device_id');
            
            if (!this.deviceId) {
                // 새 디바이스 ID 생성
                this.deviceId = this.generateDeviceId();
                localStorage.setItem('device_id', this.deviceId);
                console.log('🆕 새 디바이스 ID 생성:', this.deviceId);
            } else {
                console.log('📱 기존 디바이스 ID 사용:', this.deviceId);
            }
            
        } catch (error) {
            console.error('❌ 디바이스 ID 설정 실패:', error);
            throw error;
        }
    }

    // 디바이스 ID 생성
    generateDeviceId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const userAgent = navigator.userAgent.slice(0, 10).replace(/\W/g, '');
        
        return `device_${timestamp}_${random}_${userAgent}`;
    }

    // 디바이스 정보 수집
    async collectDeviceInfo() {
        try {
            this.deviceInfo = {
                id: this.deviceId,
                type: this.deviceType,
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                online: navigator.onLine,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                createdAt: new Date().toISOString(),
                lastSeen: this.lastSeen
            };
            
            console.log('📊 디바이스 정보 수집 완료:', this.deviceInfo);
            
        } catch (error) {
            console.error('❌ 디바이스 정보 수집 실패:', error);
            throw error;
        }
    }

    // 디바이스 타입 감지
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
            return 'mobile';
        } else if (/tablet|ipad/.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    // 디바이스 등록
    async registerDevice() {
        try {
            if (!window.supabase) {
                console.warn('⚠️ Supabase 클라이언트가 없습니다. 로컬에만 저장합니다.');
                this.saveDeviceInfoLocally();
                return;
            }
            
            // Supabase에 디바이스 정보 저장
            const { data, error } = await window.supabase
                .from('device_info')
                .upsert(this.deviceInfo)
                .select();
            
            if (error) {
                throw error;
            }
            
            console.log('✅ 디바이스 등록 완료:', data);
            
        } catch (error) {
            console.error('❌ 디바이스 등록 실패:', error);
            // 실패 시 로컬에 저장
            this.saveDeviceInfoLocally();
        }
    }

    // 로컬에 디바이스 정보 저장
    saveDeviceInfoLocally() {
        try {
            localStorage.setItem('device_info', JSON.stringify(this.deviceInfo));
            console.log('💾 디바이스 정보 로컬 저장 완료');
        } catch (error) {
            console.error('❌ 디바이스 정보 로컬 저장 실패:', error);
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 온라인/오프라인 상태 변경
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateLastSeen();
            console.log('🌐 디바이스 온라인 상태 변경');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 디바이스 오프라인 상태 변경');
        });
        
        // 창 크기 변경
        window.addEventListener('resize', () => {
            this.updateDeviceInfo();
        });
        
        // 페이지 가시성 변경
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateLastSeen();
            }
        });
        
        // 페이지 언로드 시 마지막 활동 시간 업데이트
        window.addEventListener('beforeunload', () => {
            this.updateLastSeen();
        });
    }

    // 동기화 기능 확인
    async checkSyncCapabilities() {
        try {
            // 실시간 동기화 지원 확인
            this.syncCapabilities.realtime = !!window.supabase;
            
            // 백그라운드 동기화 지원 확인
            this.syncCapabilities.background = 'serviceWorker' in navigator;
            
            // 푸시 알림 지원 확인
            this.syncCapabilities.push = 'PushManager' in window && 'Notification' in window;
            
            console.log('🔍 동기화 기능 확인:', this.syncCapabilities);
            
        } catch (error) {
            console.error('❌ 동기화 기능 확인 실패:', error);
        }
    }

    // 디바이스 정보 업데이트
    updateDeviceInfo() {
        if (this.deviceInfo) {
            this.deviceInfo.viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            this.deviceInfo.lastSeen = new Date().toISOString();
            this.deviceInfo.online = navigator.onLine;
            
            // 로컬에 저장
            this.saveDeviceInfoLocally();
            
            // Supabase에 업데이트 (온라인인 경우)
            if (this.isOnline && window.supabase) {
                this.updateDeviceInfoOnServer();
            }
        }
    }

    // 서버에 디바이스 정보 업데이트
    async updateDeviceInfoOnServer() {
        try {
            if (!window.supabase) return;
            
            const { error } = await window.supabase
                .from('device_info')
                .update({
                    last_seen: this.deviceInfo.lastSeen,
                    online: this.deviceInfo.online,
                    viewport: this.deviceInfo.viewport
                })
                .eq('id', this.deviceId);
            
            if (error) {
                throw error;
            }
            
            console.log('✅ 서버 디바이스 정보 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 서버 디바이스 정보 업데이트 실패:', error);
        }
    }

    // 마지막 활동 시간 업데이트
    updateLastSeen() {
        this.lastSeen = new Date().toISOString();
        this.deviceInfo.lastSeen = this.lastSeen;
        
        // 로컬에 저장
        this.saveDeviceInfoLocally();
        
        // 서버에 업데이트 (온라인인 경우)
        if (this.isOnline && window.supabase) {
            this.updateDeviceInfoOnServer();
        }
    }

    // 디바이스 정보 조회
    getDeviceInfo() {
        return {
            ...this.deviceInfo,
            syncCapabilities: this.syncCapabilities,
            isOnline: this.isOnline
        };
    }

    // 다른 디바이스 목록 조회
    async getOtherDevices() {
        try {
            if (!window.supabase) {
                console.warn('⚠️ Supabase 클라이언트가 없습니다.');
                return [];
            }
            
            const { data, error } = await window.supabase
                .from('device_info')
                .select('*')
                .neq('id', this.deviceId)
                .order('last_seen', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data || [];
            
        } catch (error) {
            console.error('❌ 다른 디바이스 목록 조회 실패:', error);
            return [];
        }
    }

    // 디바이스 동기화 상태 확인
    async getDeviceSyncStatus() {
        try {
            const otherDevices = await this.getOtherDevices();
            const onlineDevices = otherDevices.filter(device => device.online);
            
            return {
                currentDevice: this.getDeviceInfo(),
                otherDevices: otherDevices,
                onlineDevices: onlineDevices,
                totalDevices: otherDevices.length + 1,
                onlineCount: onlineDevices.length + (this.isOnline ? 1 : 0)
            };
            
        } catch (error) {
            console.error('❌ 디바이스 동기화 상태 확인 실패:', error);
            return {
                currentDevice: this.getDeviceInfo(),
                otherDevices: [],
                onlineDevices: [],
                totalDevices: 1,
                onlineCount: this.isOnline ? 1 : 0
            };
        }
    }

    // 디바이스 제거
    async removeDevice(deviceId = null) {
        try {
            const targetDeviceId = deviceId || this.deviceId;
            
            if (window.supabase) {
                const { error } = await window.supabase
                    .from('device_info')
                    .delete()
                    .eq('id', targetDeviceId);
                
                if (error) {
                    throw error;
                }
            }
            
            // 로컬에서도 제거
            if (targetDeviceId === this.deviceId) {
                localStorage.removeItem('device_id');
                localStorage.removeItem('device_info');
            }
            
            console.log('✅ 디바이스 제거 완료:', targetDeviceId);
            
        } catch (error) {
            console.error('❌ 디바이스 제거 실패:', error);
        }
    }

    // 디바이스 상태 알림
    notifyDeviceStatus(status) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg ${
            status === 'online' ? 'bg-green-100 text-green-800 border border-green-200' :
            status === 'offline' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${status === 'online' ? '🌐' : status === 'offline' ? '📡' : '📱'}</span>
                <span>디바이스 ${status === 'online' ? '온라인' : status === 'offline' ? '오프라인' : '상태 변경'}</span>
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
}

// 전역 디바이스 관리자 인스턴스 생성
window.deviceManager = new DeviceManager();

console.log('📱 디바이스 관리자 시스템 로드 완료');
