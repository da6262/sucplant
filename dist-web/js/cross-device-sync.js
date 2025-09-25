/**
 * 크로스 디바이스 동기화 시스템
 * 핸드폰, 컴퓨터, 태블릿 간의 실시간 데이터 동기화
 */

class CrossDeviceSync {
    constructor() {
        this.syncInterval = null;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.deviceId = this.generateDeviceId();
        this.syncFrequency = 30000; // 30초마다 동기화
        this.isOnline = navigator.onLine;
        this.conflictResolution = 'server-wins'; // 'server-wins', 'client-wins', 'merge'
        
        // 디바이스 정보
        this.deviceInfo = {
            id: this.deviceId,
            type: this.detectDeviceType(),
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            platform: navigator.platform,
            lastSeen: new Date().toISOString()
        };
        
        this.initializeSync();
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
     * 동기화 시스템 초기화
     */
    initializeSync() {
        console.log(`🔄 크로스 디바이스 동기화 초기화 - ${this.deviceInfo.type} (${this.deviceId})`);
        
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 온라인 상태 감지 - 동기화 재개');
            this.startAutoSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 오프라인 상태 감지 - 동기화 일시정지');
            this.stopAutoSync();
        });

        // 페이지 가시성 변경 감지 (탭 전환 시)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ 페이지 활성화 - 동기화 체크');
                this.forceSync();
            }
        });

        // 윈도우 포커스 감지
        window.addEventListener('focus', () => {
            console.log('🎯 윈도우 포커스 - 동기화 체크');
            this.forceSync();
        });

        // 자동 동기화 시작
        this.startAutoSync();
        
        // 초기 동기화 실행
        setTimeout(() => {
            this.forceSync();
        }, 2000);
    }

    /**
     * 자동 동기화 시작
     */
    startAutoSync() {
        // 주기적 동기화 비활성화 (이벤트 기반 동기화로 전환)
        console.log('📴 주기적 동기화 비활성화 - 이벤트 기반 동기화 사용');
        return;
        
        if (!this.isOnline) {
            console.log('📴 오프라인 상태 - 자동 동기화 중단');
            return;
        }

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.syncFrequency);

        console.log(`⏰ 자동 동기화 시작 (${this.syncFrequency/1000}초 간격)`);
    }

    /**
     * 자동 동기화 중지
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ 자동 동기화 중지');
        }
    }

    /**
     * 강제 동기화 (수동 트리거)
     */
    async forceSync() {
        if (this.syncInProgress) {
            console.log('⏳ 동기화 진행 중 - 건너뜀');
            return;
        }

        console.log('🚀 강제 동기화 시작');
        await this.performSync();
    }

    /**
     * 동기화 수행
     */
    async performSync() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        const syncStartTime = Date.now();

        try {
            console.log('🔄 크로스 디바이스 동기화 시작...');
            
            // 1. 디바이스 정보 업데이트
            await this.updateDeviceInfo();
            
            // 2. 서버에서 최신 데이터 가져오기
            const serverData = await this.fetchServerData();
            
            // 3. 로컬 데이터와 비교하여 충돌 해결
            const conflicts = await this.detectConflicts(serverData);
            
            if (conflicts.length > 0) {
                console.log(`⚠️ ${conflicts.length}개 충돌 감지`);
                await this.resolveConflicts(conflicts);
            }
            
            // 4. 로컬 변경사항 서버에 업로드
            await this.uploadLocalChanges();
            
            // 5. 최신 데이터로 로컬 업데이트
            await this.updateLocalData(serverData);
            
            // 6. 동기화 완료 처리
            this.lastSyncTime = new Date();
            this.updateSyncStatus('success', Date.now() - syncStartTime);
            
            console.log('✅ 크로스 디바이스 동기화 완료');
            
        } catch (error) {
            console.error('❌ 동기화 실패:', error);
            this.updateSyncStatus('error', Date.now() - syncStartTime, error.message);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * 디바이스 정보 업데이트
     */
    async updateDeviceInfo() {
        try {
            if (!this.supabase) {
                console.log('📴 Supabase 클라이언트 없음 - 디바이스 기록 건너뜀');
                return;
            }

            console.log('📤 디바이스 정보 업데이트 중...');
            
            const { data, error } = await this.supabase
                .from('device_info')
                .upsert({
                    id: this.deviceId,
                    device_type: this.deviceInfo.type,
                    platform: this.deviceInfo.platform,
                    browser: this.deviceInfo.browser,
                    user_agent: navigator.userAgent,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    last_seen: this.deviceInfo.lastSeen,
                    is_active: true,
                    sync_status: 'connected',
                    app_version: '1.0.0',
                    notes: '경산다육식물농장 관리시스템'
                }, {
                    onConflict: 'id'
                });

            if (error) {
                throw error;
            }

            console.log('✅ 디바이스 정보 업데이트 완료');
            return data;
        } catch (error) {
            console.error('❌ 디바이스 정보 업데이트 실패:', error);
            return null;
        }
    }

    /**
     * 서버에서 최신 데이터 가져오기
     */
    async fetchServerData() {
        const tables = ['customers', 'orders', 'products', 'waitlist', 'farm_categories', 'order_sources'];
        const serverData = {};

        for (const table of tables) {
            try {
                if (window.supabaseIntegration) {
                    const result = await window.supabaseIntegration.loadData(table, true); // 강제 새로고침
                    if (result.success) {
                        serverData[table] = result.data || [];
                    }
                }
            } catch (error) {
                console.error(`❌ ${table} 데이터 가져오기 실패:`, error);
                serverData[table] = [];
            }
        }

        return serverData;
    }

    /**
     * 로컬과 서버 데이터 간 충돌 감지
     */
    async detectConflicts(serverData) {
        const conflicts = [];
        const tables = ['customers', 'orders', 'products', 'waitlist'];

        for (const table of tables) {
            const localData = JSON.parse(localStorage.getItem(table) || '[]');
            const serverTableData = serverData[table] || [];

            // 각 로컬 항목에 대해 서버 데이터와 비교
            for (const localItem of localData) {
                const serverItem = serverTableData.find(item => item.id === localItem.id);
                
                if (serverItem) {
                    // 수정 시간 비교
                    const localModified = new Date(localItem.updated_at || localItem.created_at || 0);
                    const serverModified = new Date(serverItem.updated_at || serverItem.created_at || 0);
                    
                    if (localModified.getTime() !== serverModified.getTime()) {
                        conflicts.push({
                            table: table,
                            id: localItem.id,
                            local: localItem,
                            server: serverItem,
                            localModified: localModified,
                            serverModified: serverModified
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    /**
     * 충돌 해결
     */
    async resolveConflicts(conflicts) {
        console.log(`🔧 ${conflicts.length}개 충돌 해결 시작...`);

        for (const conflict of conflicts) {
            try {
                let resolvedData;

                switch (this.conflictResolution) {
                    case 'server-wins':
                        resolvedData = conflict.server;
                        console.log(`☁️ 서버 데이터 우선: ${conflict.table} - ${conflict.id}`);
                        break;
                    
                    case 'client-wins':
                        resolvedData = conflict.local;
                        console.log(`💻 클라이언트 데이터 우선: ${conflict.table} - ${conflict.id}`);
                        break;
                    
                    case 'merge':
                        resolvedData = this.mergeData(conflict.local, conflict.server);
                        console.log(`🔀 데이터 병합: ${conflict.table} - ${conflict.id}`);
                        break;
                }

                // 해결된 데이터를 로컬에 저장
                const localData = JSON.parse(localStorage.getItem(conflict.table) || '[]');
                const index = localData.findIndex(item => item.id === conflict.id);
                
                if (index !== -1) {
                    localData[index] = resolvedData;
                    localStorage.setItem(conflict.table, JSON.stringify(localData));
                }

            } catch (error) {
                console.error(`❌ 충돌 해결 실패: ${conflict.table} - ${conflict.id}`, error);
            }
        }
    }

    /**
     * 데이터 병합 (간단한 병합 로직)
     */
    mergeData(local, server) {
        const merged = { ...server };
        
        // 로컬에만 있는 필드들 추가
        Object.keys(local).forEach(key => {
            if (!(key in server) && local[key] !== null && local[key] !== undefined) {
                merged[key] = local[key];
            }
        });

        // 최신 수정 시간으로 업데이트
        merged.updated_at = new Date().toISOString();
        
        return merged;
    }

    /**
     * 로컬 변경사항 서버에 업로드
     */
    async uploadLocalChanges() {
        const tables = ['customers', 'orders', 'products', 'waitlist', 'farm_categories', 'order_sources'];

        for (const table of tables) {
            try {
                const localData = JSON.parse(localStorage.getItem(table) || '[]');
                
                if (localData.length > 0 && window.supabaseIntegration) {
                    await window.supabaseIntegration.saveData(table, localData, 'upsert');
                    console.log(`📤 ${table} 로컬 변경사항 업로드 완료`);
                }
            } catch (error) {
                console.error(`❌ ${table} 업로드 실패:`, error);
            }
        }
    }

    /**
     * 로컬 데이터 업데이트
     */
    async updateLocalData(serverData) {
        const tables = ['customers', 'orders', 'products', 'waitlist', 'farm_categories', 'order_sources'];

        for (const table of tables) {
            try {
                const serverTableData = serverData[table] || [];
                localStorage.setItem(table, JSON.stringify(serverTableData));
                console.log(`💾 ${table} 로컬 데이터 업데이트 완료 (${serverTableData.length}개)`);
            } catch (error) {
                console.error(`❌ ${table} 로컬 업데이트 실패:`, error);
            }
        }
    }

    /**
     * 동기화 상태 업데이트
     */
    updateSyncStatus(status, duration, error = null) {
        const statusData = {
            status: status,
            lastSync: this.lastSyncTime,
            duration: duration,
            deviceId: this.deviceId,
            deviceType: this.deviceInfo.type,
            error: error
        };

        localStorage.setItem('syncStatus', JSON.stringify(statusData));
        
        // UI 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent('syncStatusUpdate', { 
            detail: statusData 
        }));
    }

    /**
     * 동기화 상태 조회
     */
    getSyncStatus() {
        const status = localStorage.getItem('syncStatus');
        return status ? JSON.parse(status) : null;
    }

    /**
     * 동기화 설정 변경
     */
    updateSettings(settings) {
        if (settings.syncFrequency) {
            this.syncFrequency = settings.syncFrequency;
            if (this.syncInterval) {
                this.startAutoSync(); // 재시작
            }
        }
        
        if (settings.conflictResolution) {
            this.conflictResolution = settings.conflictResolution;
        }

        console.log('⚙️ 동기화 설정 업데이트:', settings);
    }

    /**
     * 모든 디바이스 정보 조회 (로컬 전용)
     */
    async getAllDevices() {
        try {
            // device_info 테이블이 없으므로 로컬 디바이스 관리자 사용
            if (window.deviceManager) {
                return await window.deviceManager.getAllDevices();
            }
            
            // 폴백: 현재 디바이스 정보만 반환
            return [this.deviceInfo];
        } catch (error) {
            console.error('❌ 디바이스 정보 조회 실패:', error);
            // 실패 시에도 최소한 현재 디바이스는 반환
            return [this.deviceInfo];
        }
    }

    /**
     * 동기화 통계 조회
     */
    getSyncStats() {
        const status = this.getSyncStatus();
        const tables = ['customers', 'orders', 'products', 'waitlist', 'farm_categories', 'order_sources'];
        const stats = {
            lastSync: status?.lastSync || null,
            deviceCount: 0,
            totalRecords: 0,
            tableStats: {}
        };

        // 테이블별 통계
        tables.forEach(table => {
            const data = JSON.parse(localStorage.getItem(table) || '[]');
            stats.tableStats[table] = data.length;
            stats.totalRecords += data.length;
        });

        return stats;
    }
}

// 전역 인스턴스 생성
window.crossDeviceSync = new CrossDeviceSync();

console.log('📱💻📱 크로스 디바이스 동기화 시스템 로드 완료');

// 사용법 안내
console.log(`
🔄 === 크로스 디바이스 동기화 사용법 ===

📊 동기화 상태 확인:
   crossDeviceSync.getSyncStatus()

🚀 수동 동기화:
   crossDeviceSync.forceSync()

📈 동기화 통계:
   crossDeviceSync.getSyncStats()

🔧 설정 변경:
   crossDeviceSync.updateSettings({
       syncFrequency: 60000,  // 1분마다
       conflictResolution: 'server-wins'
   })

📱 연결된 디바이스 목록:
   crossDeviceSync.getAllDevices()

💡 자동 동기화는 30초마다 실행됩니다.
`);

