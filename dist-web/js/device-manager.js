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
     * 디바이스 ID 생성 (고유성 보장)
     */
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            // 더 안정적인 디바이스 ID 생성
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            const fingerprint = this.generateDeviceFingerprint();
            deviceId = `device_${fingerprint}_${timestamp}_${random}`;
            localStorage.setItem('deviceId', deviceId);
            console.log('🆔 새로운 디바이스 ID 생성:', deviceId);
        } else {
            console.log('🆔 기존 디바이스 ID 사용:', deviceId);
        }
        return deviceId;
    }

    /**
     * 디바이스 지문 생성 (하드웨어 기반 고유 식별)
     */
    generateDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.platform,
            navigator.hardwareConcurrency || 'unknown'
        ].join('|');
        
        // 간단한 해시 생성
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit 정수로 변환
        }
        
        return Math.abs(hash).toString(36);
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
        
        // 주기적 세션 정리 (30분마다)
        this.startPeriodicCleanup();
        
        // Realtime 구독 시작
        this.startRealtimeSubscription();
        
        // 페이지 종료 시 정리
        this.setupPageUnloadCleanup();
        
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
                    onConflict: 'id'
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
     * 주기적 세션 정리 시작
     */
    startPeriodicCleanup() {
        // 30분마다 오래된 세션 정리
        setInterval(() => {
            this.cleanupOldSessions();
            this.cleanupDuplicateSessions();
        }, 30 * 60 * 1000); // 30분
    }

    /**
     * 페이지 종료 시 정리 설정
     */
    setupPageUnloadCleanup() {
        // 페이지 종료 시 현재 디바이스 세션 정리
        window.addEventListener('beforeunload', () => {
            this.cleanupCurrentSession();
        });

        // 페이지 숨김 시에도 정리 (탭 전환 등)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.cleanupCurrentSession();
            }
        });
    }

    /**
     * 현재 세션 정리
     */
    async cleanupCurrentSession() {
        try {
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (!supabase) return;

            // 현재 디바이스의 오래된 세션들 정리
            await this.cleanupDuplicateSessions();
            console.log('🧹 페이지 종료 시 세션 정리 완료');
        } catch (error) {
            console.error('❌ 세션 정리 오류:', error);
        }
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
                    
                    // 더 안전한 쿼리 방식 사용
                    const { data, error } = await supabase
                        .from('device_info')
                        .select('id, type, platform, user_agent, screen, language, timezone, last_seen, created_at')
                        .order('last_seen', { ascending: false })
                        .limit(50); // 성능을 위해 제한

                    if (error) {
                        console.warn('⚠️ Supabase 쿼리 오류:', error.message);
                        throw error;
                    }

                    if (data && data.length > 0) {
                        supabaseDevices = data.map(device => {
                            // 안전한 데이터 변환
                            return {
                                id: device.id || 'unknown',
                                type: device.type || 'desktop',
                                platform: device.platform || 'Unknown',
                                userAgent: device.user_agent || navigator.userAgent,
                                screen: device.screen || `${screen.width}x${screen.height}`,
                                language: device.language || navigator.language,
                                timezone: device.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                                lastSeen: device.last_seen || new Date().toISOString(),
                                created_at: device.created_at || new Date().toISOString(),
                                source: 'supabase'
                            };
                        });
                        console.log(`📱 Supabase에서 ${supabaseDevices.length}개 디바이스 발견`);
                    } else {
                        console.log('📱 Supabase에서 디바이스 없음');
                    }
                } catch (error) {
                    console.warn('⚠️ Supabase 디바이스 조회 실패:', error.message);
                    // Supabase 오류 시에도 계속 진행
                }
            } else {
                console.log('📴 Supabase 클라이언트 없음 - 로컬 모드');
            }
            
            // 2. 로컬 디바이스 목록 준비
            const localDevices = [...this.localDevices];
            
            // 현재 디바이스가 로컬 목록에 없으면 추가
            const currentDeviceExists = localDevices.some(device => device.id === this.deviceId);
            if (!currentDeviceExists) {
                const currentDevice = { 
                    ...this.deviceInfo, 
                    source: 'local',
                    lastSeen: this.deviceInfo.lastSeen || new Date().toISOString()
                };
                localDevices.push(currentDevice);
                console.log('🔧 현재 디바이스를 로컬 목록에 추가');
            }
            
            // 3. 로컬과 Supabase 디바이스 병합
            const allDevices = this.mergeDeviceLists(localDevices, supabaseDevices);
            
            console.log(`📱 총 ${allDevices.length}개 디바이스 발견 (로컬: ${localDevices.length}, Supabase: ${supabaseDevices.length})`);
            
            return allDevices;
        } catch (error) {
            console.error('❌ 디바이스 목록 조회 실패:', error);
            // 실패 시에도 최소한 현재 디바이스는 반환
            const fallbackDevice = { 
                ...this.deviceInfo, 
                source: 'fallback',
                lastSeen: this.deviceInfo.lastSeen || new Date().toISOString()
            };
            return [fallbackDevice];
        }
    }

    /**
     * 디바이스 목록 병합
     */
    mergeDeviceLists(localDevices, sharedDevices) {
        const deviceMap = new Map();
        
        // 로컬 디바이스 추가
        localDevices.forEach(device => {
            if (device && device.id) {
                deviceMap.set(device.id, { 
                    ...device, 
                    source: device.source || 'local',
                    lastSeen: device.lastSeen || new Date().toISOString()
                });
            }
        });
        
        // 공유 디바이스 추가/업데이트
        sharedDevices.forEach(device => {
            if (device && device.id) {
                const existing = deviceMap.get(device.id);
                if (existing) {
                    // 기존 디바이스 정보 업데이트 (공유 데이터 우선)
                    deviceMap.set(device.id, { 
                        ...device, 
                        source: 'both',
                        lastSeen: device.lastSeen || existing.lastSeen || new Date().toISOString()
                    });
                } else {
                    // 새 디바이스 추가
                    deviceMap.set(device.id, { 
                        ...device, 
                        source: device.source || 'shared',
                        lastSeen: device.lastSeen || new Date().toISOString()
                    });
                }
            }
        });
        
        // 정렬 및 반환 (안전한 날짜 비교)
        return Array.from(deviceMap.values()).sort((a, b) => {
            try {
                const dateA = new Date(a.lastSeen || 0);
                const dateB = new Date(b.lastSeen || 0);
                return dateB - dateA; // 최신순
            } catch (error) {
                console.warn('⚠️ 디바이스 정렬 오류:', error);
                return 0;
            }
        });
    }

    /**
     * 현재 디바이스 정보 조회
     */
    getCurrentDevice() {
        return this.deviceInfo;
    }

    /**
     * 현재 디바이스만 반환 (다른 기기들 제외)
     */
    async getCurrentDeviceOnly() {
        try {
            // 현재 디바이스 정보를 최신으로 업데이트
            this.deviceInfo.lastSeen = new Date().toISOString();
            this.updateLocalDevice();
            
            // 현재 디바이스만 반환
            const currentDevice = { 
                ...this.deviceInfo, 
                source: 'current',
                lastSeen: this.deviceInfo.lastSeen || new Date().toISOString()
            };
            
            console.log('📱 현재 디바이스만 반환:', currentDevice);
            return [currentDevice];
        } catch (error) {
            console.error('❌ 현재 디바이스 조회 실패:', error);
            // 실패 시에도 최소한 현재 디바이스는 반환
            const fallbackDevice = { 
                ...this.deviceInfo, 
                source: 'fallback',
                lastSeen: this.deviceInfo.lastSeen || new Date().toISOString()
            };
            return [fallbackDevice];
        }
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
     * 오래된 디바이스 세션 정리 (1시간 이상 비활성)
     */
    async cleanupOldSessions() {
        try {
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (!supabase) {
                console.log('📴 Supabase 클라이언트 없음 - 세션 정리 건너뜀');
                return;
            }

            // 1시간 이상 비활성 디바이스 삭제
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            
            console.log('🧹 오래된 디바이스 세션 정리 중...');
            const { data, error } = await supabase
                .from('device_info')
                .delete()
                .lt('last_seen', oneHourAgo);

            if (error) {
                console.warn('⚠️ 세션 정리 실패:', error.message);
            } else {
                console.log('✅ 오래된 세션 정리 완료');
            }
        } catch (error) {
            console.error('❌ 세션 정리 오류:', error);
        }
    }

    /**
     * 현재 디바이스의 중복 세션 정리
     */
    async cleanupDuplicateSessions() {
        try {
            const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
            if (!supabase) {
                return;
            }

            // 현재 디바이스와 같은 플랫폼/해상도의 오래된 세션들 찾기
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            
            const { data: oldSessions, error: queryError } = await supabase
                .from('device_info')
                .select('id')
                .eq('platform', this.deviceInfo.platform)
                .eq('screen', this.deviceInfo.screen)
                .lt('last_seen', oneHourAgo);

            if (queryError) {
                console.warn('⚠️ 중복 세션 조회 실패:', queryError.message);
                return;
            }

            if (oldSessions && oldSessions.length > 0) {
                console.log(`🧹 ${oldSessions.length}개의 중복 세션 정리 중...`);
                
                const { error: deleteError } = await supabase
                    .from('device_info')
                    .delete()
                    .in('id', oldSessions.map(s => s.id));

                if (deleteError) {
                    console.warn('⚠️ 중복 세션 삭제 실패:', deleteError.message);
                } else {
                    console.log('✅ 중복 세션 정리 완료');
                }
            }
        } catch (error) {
            console.error('❌ 중복 세션 정리 오류:', error);
        }
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

// 중복 디바이스 세션 수동 정리
window.cleanupDuplicateDevices = async () => {
    console.log('🧹 중복 디바이스 세션 정리 시작...');
    if (window.deviceManager) {
        await window.deviceManager.cleanupOldSessions();
        await window.deviceManager.cleanupDuplicateSessions();
        console.log('✅ 중복 디바이스 정리 완료');
    } else {
        console.error('❌ 디바이스 관리자를 찾을 수 없습니다.');
    }
};

// 모든 디바이스 세션 초기화
window.resetAllDeviceSessions = async () => {
    console.log('🔄 모든 디바이스 세션 초기화 시작...');
    const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
    if (!supabase) {
        console.error('❌ Supabase 클라이언트 없음');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('device_info')
            .delete()
            .neq('id', 'dummy'); // 모든 레코드 삭제
        
        if (error) {
            console.error('❌ 세션 초기화 실패:', error);
        } else {
            console.log('✅ 모든 디바이스 세션 초기화 완료');
            // 페이지 새로고침으로 목록 업데이트
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('❌ 세션 초기화 오류:', error);
    }
};

// 강력한 디바이스 정리 (중복 + 오래된 것 모두)
window.aggressiveDeviceCleanup = async () => {
    console.log('🧹 강력한 디바이스 정리 시작...');
    const supabase = window.supabaseClient || window.SupabaseConfig?.getClient();
    if (!supabase) {
        console.error('❌ Supabase 클라이언트 없음');
        return;
    }
    
    try {
        // 1. 30분 이상 비활성 디바이스 삭제
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { error: oldError } = await supabase
            .from('device_info')
            .delete()
            .lt('last_seen', thirtyMinutesAgo);
        
        if (oldError) {
            console.warn('⚠️ 오래된 디바이스 삭제 실패:', oldError.message);
        } else {
            console.log('✅ 오래된 디바이스 삭제 완료');
        }
        
        // 2. 중복 디바이스 정리 (같은 플랫폼/해상도)
        const { data: devices, error: queryError } = await supabase
            .from('device_info')
            .select('id, platform, screen, last_seen')
            .order('last_seen', { ascending: false });
        
        if (queryError) {
            console.warn('⚠️ 디바이스 조회 실패:', queryError.message);
            return;
        }
        
        // 중복 그룹 찾기
        const deviceGroups = {};
        devices.forEach(device => {
            const key = `${device.platform}_${device.screen}`;
            if (!deviceGroups[key]) {
                deviceGroups[key] = [];
            }
            deviceGroups[key].push(device);
        });
        
        // 각 그룹에서 최신 것만 남기고 나머지 삭제
        for (const [key, group] of Object.entries(deviceGroups)) {
            if (group.length > 1) {
                const toDelete = group.slice(1); // 최신 것 제외하고 삭제
                const idsToDelete = toDelete.map(d => d.id);
                
                const { error: deleteError } = await supabase
                    .from('device_info')
                    .delete()
                    .in('id', idsToDelete);
                
                if (deleteError) {
                    console.warn(`⚠️ 중복 디바이스 삭제 실패 (${key}):`, deleteError.message);
                } else {
                    console.log(`✅ ${key} 그룹에서 ${toDelete.length}개 중복 삭제`);
                }
            }
        }
        
        console.log('🎉 강력한 디바이스 정리 완료');
        
        // 페이지 새로고침으로 목록 업데이트
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ 강력한 정리 오류:', error);
    }
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
