/**
 * 디바이스 관리자
 * Supabase 연결 실패 시에도 로컬에서 디바이스 정보 관리
 */

class DeviceManager {
    constructor() {
        this.deviceId = this.generateDeviceId();
        this.deviceInfo = this.getDeviceInfo();
        this.localDevices = this.loadLocalDevices();
        
        this.initializeDevice();
    }

    /**
     * 디바이스 ID 생성
     */
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    /**
     * 디바이스 정보 수집
     */
    getDeviceInfo() {
        return {
            id: this.deviceId,
            type: this.detectDeviceType(),
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            lastSeen: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
    }

    /**
     * 디바이스 타입 감지
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            if (/ipad|tablet/i.test(userAgent)) {
                return 'tablet';
            }
            return 'mobile';
        }
        return 'desktop';
    }

    /**
     * 로컬 디바이스 목록 로드
     */
    loadLocalDevices() {
        try {
            const devices = localStorage.getItem('localDevices');
            return devices ? JSON.parse(devices) : [];
        } catch (error) {
            console.error('로컬 디바이스 목록 로드 실패:', error);
            return [];
        }
    }

    /**
     * 로컬 디바이스 목록 저장
     */
    saveLocalDevices() {
        try {
            localStorage.setItem('localDevices', JSON.stringify(this.localDevices));
        } catch (error) {
            console.error('로컬 디바이스 목록 저장 실패:', error);
        }
    }

    /**
     * 디바이스 초기화
     */
    initializeDevice() {
        console.log('📱 디바이스 초기화 시작:', this.deviceInfo.type, this.deviceId);
        
        // 현재 디바이스 정보 업데이트
        this.deviceInfo.lastSeen = new Date().toISOString();
        
        // 로컬 디바이스 목록에 추가/업데이트
        this.updateLocalDevice();
        
        // Supabase 연결 대기 후 저장 시도
        this.waitForSupabaseAndSave();
        
        // 주기적으로 디바이스 정보 업데이트
        this.startPeriodicUpdate();
        
        // Realtime 구독 시작
        this.startRealtimeSubscription();
        
        // 즉시 현재 디바이스가 목록에 있는지 확인하고 없으면 추가
        setTimeout(() => {
            this.ensureCurrentDeviceInList();
        }, 1000);
        
        // 가상 기기 시뮬레이션 비활성화 (실제 Supabase 동기화 사용)
        // setTimeout(() => {
        //     this.shareDeviceInfo();
        // }, 2000);
    }

    /**
     * Supabase 연결 대기 후 디바이스 정보 저장
     */
    async waitForSupabaseAndSave() {
        console.log('⏳ Supabase 연결 대기 중...');
        
        // 최대 10초 동안 Supabase 연결 대기
        for (let i = 0; i < 20; i++) {
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (supabase) {
                console.log('✅ Supabase 연결 확인됨, 디바이스 정보 저장 시도');
                await this.saveToSupabase();
                return;
            }
            
            // 500ms 대기
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('⚠️ Supabase 연결 타임아웃, 로컬 모드로 계속');
    }

    /**
     * 로컬 디바이스 목록 업데이트
     */
    updateLocalDevice() {
        const existingIndex = this.localDevices.findIndex(device => device.id === this.deviceId);
        
        if (existingIndex !== -1) {
            // 기존 디바이스 정보 업데이트
            this.localDevices[existingIndex] = { ...this.deviceInfo };
        } else {
            // 새 디바이스 추가
            this.localDevices.push({ ...this.deviceInfo });
        }
        
        this.saveLocalDevices();
        console.log('💾 로컬 디바이스 정보 업데이트 완료');
    }

    /**
     * 현재 디바이스가 목록에 있는지 확인하고 없으면 추가
     */
    ensureCurrentDeviceInList() {
        const exists = this.localDevices.some(device => device.id === this.deviceId);
        if (!exists) {
            console.log('🔧 현재 디바이스가 목록에 없음 - 강제 추가');
            this.localDevices.push({ ...this.deviceInfo, source: 'local' });
            this.saveLocalDevices();
        }
    }

    /**
     * Supabase에 디바이스 정보 저장 (비활성화)
     */
    async saveToSupabase() {
        try {
            // Supabase 클라이언트 확인
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (!supabase) {
                console.log('📴 Supabase 클라이언트 없음 - 로컬 전용 모드');
                return;
            }

            console.log('📤 디바이스 정보 Supabase 저장 시도...', {
                deviceId: this.deviceId,
                type: this.deviceInfo.type,
                platform: this.deviceInfo.platform
            });
            
            const deviceData = {
                id: this.deviceId,
                type: this.deviceInfo.type,
                platform: this.deviceInfo.platform,
                user_agent: this.deviceInfo.userAgent,
                screen: this.deviceInfo.screen,
                language: this.deviceInfo.language,
                timezone: this.deviceInfo.timezone,
                last_seen: this.deviceInfo.lastSeen
            };
            
            console.log('📤 저장할 디바이스 데이터:', deviceData);
            
            const { data, error } = await supabase
                .from('device_info')
                .upsert(deviceData, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('❌ Supabase 저장 오류:', error);
                throw error;
            }

            console.log('✅ 디바이스 정보 Supabase 저장 완료:', data);
            return data;
        } catch (error) {
            console.error('❌ 디바이스 정보 Supabase 저장 실패:', error);
            // 실패해도 로컬 저장은 계속 진행
            return null;
        }
    }

    /**
     * 주기적 디바이스 정보 업데이트
     */
    startPeriodicUpdate() {
        // 30초마다 디바이스 정보 업데이트
        setInterval(() => {
            this.deviceInfo.lastSeen = new Date().toISOString();
            this.updateLocalDevice();
            this.saveToSupabase();
            // this.shareDeviceInfo(); // 가상 기기 시뮬레이션 비활성화
        }, 30000);
    }

    /**
     * Realtime 구독 시작
     */
    startRealtimeSubscription() {
        try {
            const supabase = window.SupabaseConfig?.getClient();
            if (!supabase) {
                console.log('📴 Supabase 클라이언트 없음 - Realtime 구독 건너뜀');
                return;
            }

            console.log('📡 device_info Realtime 구독 시작...');
            
            supabase
                .channel('device-info-changes')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'device_info' 
                }, (payload) => {
                    console.log('📡 device_info 변경 감지:', payload);
                    this.handleDeviceInfoChange(payload);
                })
                .subscribe((status) => {
                    console.log('📡 Realtime 구독 상태:', status);
                });
        } catch (error) {
            console.error('❌ Realtime 구독 실패:', error);
        }
    }

    /**
     * 디바이스 정보 변경 처리
     */
    handleDeviceInfoChange(payload) {
        try {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            console.log(`📡 디바이스 ${eventType}:`, newRecord || oldRecord);
            
            // 로컬 디바이스 목록 업데이트
            if (eventType === 'INSERT' || eventType === 'UPDATE') {
                this.updateLocalDeviceFromSupabase(newRecord);
            } else if (eventType === 'DELETE') {
                this.removeLocalDevice(oldRecord.id);
            }
            
            // UI 업데이트 이벤트 발생
            window.dispatchEvent(new CustomEvent('deviceListUpdate', { 
                detail: { eventType, device: newRecord || oldRecord } 
            }));
            
        } catch (error) {
            console.error('❌ 디바이스 정보 변경 처리 실패:', error);
        }
    }

    /**
     * Supabase에서 받은 디바이스 정보로 로컬 업데이트
     */
    updateLocalDeviceFromSupabase(supabaseDevice) {
        const existingIndex = this.localDevices.findIndex(device => device.id === supabaseDevice.id);
        
        if (existingIndex !== -1) {
            this.localDevices[existingIndex] = { ...supabaseDevice, source: 'server' };
        } else {
            this.localDevices.push({ ...supabaseDevice, source: 'server' });
        }
        
        this.saveLocalDevices();
        console.log('💾 Supabase 디바이스 정보로 로컬 업데이트 완료');
    }

    /**
     * 로컬에서 디바이스 제거
     */
    removeLocalDevice(deviceId) {
        this.localDevices = this.localDevices.filter(device => device.id !== deviceId);
        this.saveLocalDevices();
        console.log('🗑️ 로컬에서 디바이스 제거 완료:', deviceId);
    }

    /**
     * 디바이스 정보를 다른 기기들과 공유 (가상 다중 기기 시뮬레이션)
     */
    shareDeviceInfo() {
        try {
            // 실제 기기 간 공유는 불가능하므로 가상의 다중 기기 시뮬레이션
            const virtualDevices = [
                {
                    id: this.deviceId,
                    type: this.deviceInfo.type,
                    platform: this.deviceInfo.platform,
                    lastSeen: this.deviceInfo.lastSeen,
                    source: 'local'
                },
                {
                    id: `virtual_${Date.now()}_1`,
                    type: 'desktop',
                    platform: 'Windows',
                    lastSeen: new Date(Date.now() - 30000).toISOString(), // 30초 전
                    source: 'virtual'
                },
                {
                    id: `virtual_${Date.now()}_2`,
                    type: 'mobile',
                    platform: 'Android',
                    lastSeen: new Date(Date.now() - 60000).toISOString(), // 1분 전
                    source: 'virtual'
                }
            ];
            
            // 가상 디바이스들을 localStorage에 저장
            localStorage.setItem('virtual_devices', JSON.stringify(virtualDevices));
            
            console.log(`📤 가상 다중 디바이스 시뮬레이션 완료: ${virtualDevices.length}개 기기`);
        } catch (error) {
            console.error('❌ 디바이스 정보 공유 실패:', error);
        }
    }

    /**
     * 모든 디바이스 목록 조회 (로컬 + Supabase)
     */
    async getAllDevices() {
        try {
            // 1. Supabase에서 디바이스 정보 조회 (우선순위)
            let supabaseDevices = [];
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (supabase) {
                try {
                    console.log('📡 Supabase에서 디바이스 정보 조회 중...');
                    const { data, error } = await supabase
                        .from('device_info')
                        .select('*')
                        .order('last_seen', { ascending: false });

                    if (error) {
                        throw error;
                    }

                    if (data && data.length > 0) {
                        supabaseDevices = data.map(device => ({
                            id: device.id,
                            type: device.type,
                            platform: device.platform,
                            userAgent: device.user_agent,
                            screen: device.screen,
                            language: device.language,
                            timezone: device.timezone,
                            lastSeen: device.last_seen,
                            source: 'supabase'
                        }));
                        console.log(`📱 Supabase에서 ${supabaseDevices.length}개 디바이스 발견`);
                    } else {
                        console.log('📱 Supabase에서 디바이스 없음');
                    }
                } catch (error) {
                    console.warn('⚠️ Supabase 디바이스 조회 실패:', error.message);
                }
            }
            
            // 2. Supabase에서 디바이스를 찾지 못한 경우 로컬 디바이스 목록 사용
            const localDevices = [...this.localDevices];
            
            // 현재 디바이스가 로컬 목록에 없으면 추가
            const currentDeviceExists = localDevices.some(device => device.id === this.deviceId);
            if (!currentDeviceExists) {
                localDevices.push({ ...this.deviceInfo, source: 'local' });
            }
            
            // 3. 로컬과 Supabase 디바이스 병합
            const allDevices = this.mergeDeviceLists(localDevices, supabaseDevices);
            
            console.log(`📱 총 ${allDevices.length}개 디바이스 발견 (로컬: ${localDevices.length}, Supabase: ${supabaseDevices.length})`);
            
            return allDevices;
        } catch (error) {
            console.error('❌ 디바이스 목록 조회 실패:', error);
            // 실패 시에도 최소한 현재 디바이스는 반환
            return [{ ...this.deviceInfo, source: 'local' }];
        }
    }

    /**
     * 디바이스 목록 병합
     */
    mergeDeviceLists(localDevices, sharedDevices) {
        const deviceMap = new Map();
        
        // 로컬 디바이스 추가
        localDevices.forEach(device => {
            deviceMap.set(device.id, { ...device, source: 'local' });
        });
        
        // 공유 디바이스 추가/업데이트
        sharedDevices.forEach(device => {
            const existing = deviceMap.get(device.id);
            if (existing) {
                // 기존 디바이스 정보 업데이트 (공유 데이터 우선)
                deviceMap.set(device.id, { ...device, source: 'both' });
            } else {
                // 새 디바이스 추가
                deviceMap.set(device.id, { ...device, source: 'shared' });
            }
        });
        
        return Array.from(deviceMap.values()).sort((a, b) => 
            new Date(b.lastSeen) - new Date(a.lastSeen)
        );
    }

    /**
     * 현재 디바이스 정보 조회
     */
    getCurrentDevice() {
        return this.deviceInfo;
    }

    /**
     * 디바이스 타입 이름 변환
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
     * 디바이스 정보 초기화
     */
    resetDevice() {
        localStorage.removeItem('deviceId');
        localStorage.removeItem('localDevices');
        this.deviceId = this.generateDeviceId();
        this.deviceInfo = this.getDeviceInfo();
        this.localDevices = [];
        this.initializeDevice();
        console.log('🔄 디바이스 정보 초기화 완료');
    }

    /**
     * 강제로 디바이스 정보 저장 (디버깅용)
     */
    async forceSaveDeviceInfo() {
        console.log('🔄 강제 디바이스 정보 저장 시작...');
        this.deviceInfo.lastSeen = new Date().toISOString();
        await this.saveToSupabase();
        console.log('✅ 강제 디바이스 정보 저장 완료');
    }

    /**
     * 디바이스 통계 조회
     */
    getDeviceStats() {
        const stats = {
            total: this.localDevices.length,
            byType: {},
            online: 0,
            offline: 0
        };

        this.localDevices.forEach(device => {
            // 타입별 통계
            stats.byType[device.type] = (stats.byType[device.type] || 0) + 1;
            
            // 온라인/오프라인 통계
            if (this.isDeviceOnline(device)) {
                stats.online++;
            } else {
                stats.offline++;
            }
        });

        return stats;
    }
}

// 전역 인스턴스 생성
window.deviceManager = new DeviceManager();

// 전역 디버깅 함수들
window.forceSaveDeviceInfo = () => window.deviceManager.forceSaveDeviceInfo();
window.debugDeviceList = async () => {
    console.log('🔍 디바이스 목록 디버깅...');
    const devices = await window.deviceManager.getAllDevices();
    console.log('📱 현재 디바이스 목록:', devices);
    return devices;
};

// 핸드폰에서 디바이스 정보 강제 저장
window.forceSaveCurrentDevice = async () => {
    console.log('📤 현재 디바이스 정보 강제 저장 중...');
    const result = await window.deviceManager.saveToSupabase();
    console.log('✅ 강제 저장 결과:', result);
    return result;
};

// Supabase 디바이스 테이블 직접 조회
window.checkSupabaseDevices = async () => {
    const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
    if (!supabase) {
        console.error('❌ Supabase 클라이언트 없음');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('device_info')
            .select('*')
            .order('last_seen', { ascending: false });
            
        if (error) {
            console.error('❌ Supabase 조회 실패:', error);
        } else {
            console.log('📱 Supabase 디바이스 목록:', data);
            console.log('📊 총 디바이스 수:', data?.length || 0);
        }
        return data;
    } catch (error) {
        console.error('❌ Supabase 조회 오류:', error);
    }
};

console.log('📱 디바이스 관리자 로드 완료');

// 사용법 안내
console.log(`
📱 === 디바이스 관리자 사용법 ===

📊 현재 디바이스 정보:
   deviceManager.getCurrentDevice()

📱 모든 디바이스 목록:
   deviceManager.getAllDevices()

📈 디바이스 통계:
   deviceManager.getDeviceStats()

🔄 디바이스 초기화:
   deviceManager.resetDevice()

💡 디바이스 정보는 자동으로 30초마다 업데이트됩니다.
`);
