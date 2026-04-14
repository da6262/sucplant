/**
 * 🔄 크로스 디바이스 동기화
 * 
 * 여러 디바이스 간의 데이터 동기화를 관리합니다.
 * 실시간 업데이트와 충돌 해결을 제공합니다.
 */

class CrossDeviceSync {
    constructor() {
        this.deviceId = this.generateDeviceId();
        this.syncChannel = null;
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.pendingChanges = new Map();
        this.conflictResolution = 'server_wins'; // 'server_wins', 'client_wins', 'manual'
        
        this.setupEventListeners();
        this.initializeSync();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 네트워크 상태 변경
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 네트워크 연결 복구 - 동기화 재시작');
            this.startSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 네트워크 연결 끊어짐 - 오프라인 모드');
            this.stopSync();
        });

        // 페이지 언로드 시 동기화
        window.addEventListener('beforeunload', () => {
            this.syncPendingChanges();
        });
    }

    // Supabase 전용 - localStorage 사용 제거됨
    generateDeviceId() {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
        return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 동기화 초기화
    async initializeSync() {
        try {
            console.log(`🔄 크로스 디바이스 동기화 초기화 (디바이스: ${this.deviceId})`);
            
            // Supabase 실시간 구독 설정
            if (window.supabase) {
                await this.setupRealtimeSubscription();
            }
            
            // 로컬 변경사항 감지 설정
            this.setupChangeDetection();
            
            console.log('✅ 크로스 디바이스 동기화 초기화 완료');
            
        } catch (error) {
            console.error('❌ 크로스 디바이스 동기화 초기화 실패:', error);
        }
    }

    // 실시간 구독 설정
    async setupRealtimeSubscription() {
        try {
            const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist'];
            
            for (const table of tables) {
                const channel = window.supabase
                    .channel(`${table}_sync_${this.deviceId}`)
                    .on('postgres_changes', 
                        { event: '*', schema: 'public', table: table },
                        (payload) => this.handleRemoteChange(table, payload)
                    )
                    .subscribe();

                console.log(`📡 ${table} 실시간 구독 설정 완료`);
            }
            
        } catch (error) {
            console.error('❌ 실시간 구독 설정 실패:', error);
        }
    }

    // 원격 변경사항 처리
    async handleRemoteChange(tableName, payload) {
        try {
            console.log(`📥 원격 변경사항 수신: ${tableName}`, payload);
            
            // 자신의 변경사항인지 확인
            if (payload.new && payload.new.device_id === this.deviceId) {
                console.log('🔄 자신의 변경사항이므로 무시');
                return;
            }
            
            // 충돌 해결
            await this.resolveConflict(tableName, payload);
            
            // UI 업데이트
            this.notifyUIUpdate(tableName, payload);
            
        } catch (error) {
            console.error('❌ 원격 변경사항 처리 실패:', error);
        }
    }

    // 충돌 해결
    async resolveConflict(tableName, payload) {
        try {
            const localData = this.getLocalData(tableName);
            const remoteData = payload.new || payload.old;
            
            if (!remoteData) return;
            
            // 로컬 데이터에서 해당 레코드 찾기
            const localRecord = localData.find(item => item.id === remoteData.id);
            
            if (!localRecord) {
                // 로컬에 없는 데이터면 추가
                await this.addLocalData(tableName, remoteData);
                return;
            }
            
            // 타임스탬프 비교
            const localTime = new Date(localRecord.updated_at || localRecord.created_at);
            const remoteTime = new Date(remoteData.updated_at || remoteData.created_at);
            
            if (remoteTime > localTime) {
                // 원격 데이터가 더 최신
                await this.updateLocalData(tableName, remoteData);
                console.log(`✅ ${tableName} 원격 데이터로 업데이트`);
            } else if (localTime > remoteTime) {
                // 로컬 데이터가 더 최신
                await this.pushLocalChange(tableName, localRecord);
                console.log(`✅ ${tableName} 로컬 데이터를 원격으로 푸시`);
            } else {
                // 동일한 시간 - 수동 해결 필요
                console.warn(`⚠️ ${tableName} 충돌 감지 - 수동 해결 필요`);
                await this.handleManualConflict(tableName, localRecord, remoteData);
            }
            
        } catch (error) {
            console.error('❌ 충돌 해결 실패:', error);
        }
    }

    // 수동 충돌 해결
    async handleManualConflict(tableName, localData, remoteData) {
        try {
            // 충돌 알림 표시
            this.showConflictNotification(tableName, localData, remoteData);
            
            // 기본적으로 서버 데이터 사용
            if (this.conflictResolution === 'server_wins') {
                await this.updateLocalData(tableName, remoteData);
            }
            
        } catch (error) {
            console.error('❌ 수동 충돌 해결 실패:', error);
        }
    }

    // 충돌 알림 표시
    showConflictNotification(tableName, localData, remoteData) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
        notification.innerHTML = `
            <div class="flex">
                <div class="flex-1">
                    <strong>충돌 감지!</strong><br>
                    ${tableName}에서 데이터 충돌이 발생했습니다.
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-yellow-700 hover:text-yellow-900">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 변경사항 감지 설정
    setupChangeDetection() {
        // 로컬 스토리지 변경 감지
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('local_')) {
                this.handleLocalChange(event.key, event.newValue);
            }
        });
        
        // 데이터 변경 감지 (커스텀 이벤트)
        document.addEventListener('dataChanged', (event) => {
            this.handleDataChange(event.detail);
        });
    }

    // 로컬 변경사항 처리
    handleLocalChange(key, newValue) {
        try {
            const tableName = key.replace('local_', '');
            const data = JSON.parse(newValue || '[]');
            
            console.log(`📝 로컬 변경사항 감지: ${tableName}`);
            
            // 변경사항을 대기열에 추가
            this.addPendingChange(tableName, data);
            
        } catch (error) {
            console.error('❌ 로컬 변경사항 처리 실패:', error);
        }
    }

    // 데이터 변경 처리
    handleDataChange(changeData) {
        try {
            const { table, action, data } = changeData;
            console.log(`📝 데이터 변경 감지: ${table} ${action}`);
            
            // 변경사항을 대기열에 추가
            this.addPendingChange(table, data, action);
            
        } catch (error) {
            console.error('❌ 데이터 변경 처리 실패:', error);
        }
    }

    // 대기 중인 변경사항 추가
    addPendingChange(tableName, data, action = 'update') {
        const changeId = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.pendingChanges.set(changeId, {
            table: tableName,
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            deviceId: this.deviceId
        });
        
        console.log(`📝 대기 중인 변경사항 추가: ${changeId}`);
        
        // 자동 동기화 시작
        if (this.isOnline && !this.syncInProgress) {
            this.syncPendingChanges();
        }
    }

    // 대기 중인 변경사항 동기화
    async syncPendingChanges() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }
        
        this.syncInProgress = true;
        console.log('🔄 대기 중인 변경사항 동기화 시작...');
        
        try {
            for (const [changeId, change] of this.pendingChanges) {
                await this.syncChange(change);
                this.pendingChanges.delete(changeId);
            }
            
            console.log('✅ 대기 중인 변경사항 동기화 완료');
            
        } catch (error) {
            console.error('❌ 대기 중인 변경사항 동기화 실패:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // 개별 변경사항 동기화
    async syncChange(change) {
        try {
            const { table, action, data, deviceId } = change;
            
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 없습니다.');
            }
            
            // 디바이스 ID 추가
            const dataWithDevice = { ...data, device_id: deviceId };
            
            let result;
            switch (action) {
                case 'insert':
                    result = await window.supabase.from(table).insert(dataWithDevice);
                    break;
                case 'update':
                    result = await window.supabase.from(table).update(dataWithDevice).eq('id', data.id);
                    break;
                case 'delete':
                    result = await window.supabase.from(table).delete().eq('id', data.id);
                    break;
                default:
                    result = await window.supabase.from(table).upsert(dataWithDevice);
            }
            
            if (result.error) {
                throw result.error;
            }
            
            console.log(`✅ ${table} ${action} 동기화 완료`);
            
        } catch (error) {
            console.error(`❌ ${table} ${action} 동기화 실패:`, error);
            throw error;
        }
    }

    // 로컬 데이터 조회
    // Supabase 전용 - localStorage 사용 제거됨
    getLocalData(tableName) {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
        return [];
    }

    // Supabase 전용 - localStorage 사용 제거됨
    async addLocalData(tableName, data) {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
    }

    // Supabase 전용 - localStorage 사용 제거됨
    async updateLocalData(tableName, data) {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
    }

    // 로컬 변경사항 푸시
    async pushLocalChange(tableName, data) {
        try {
            await this.syncChange({
                table: tableName,
                action: 'update',
                data: data,
                deviceId: this.deviceId
            });
        } catch (error) {
            console.error(`❌ 로컬 변경사항 푸시 실패: ${tableName}`, error);
        }
    }

    // UI 업데이트 알림
    notifyUIUpdate(tableName, payload) {
        // 커스텀 이벤트 발생
        const event = new CustomEvent('dataSynced', {
            detail: {
                table: tableName,
                payload: payload,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
        console.log(`📢 UI 업데이트 알림: ${tableName}`);
    }

    // 동기화 시작
    startSync() {
        if (this.isOnline) {
            this.syncPendingChanges();
        }
    }

    // 동기화 중지
    stopSync() {
        this.syncInProgress = false;
        console.log('⏹️ 동기화 중지');
    }

    // 동기화 상태 확인
    getSyncStatus() {
        return {
            deviceId: this.deviceId,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            pendingChanges: this.pendingChanges.size,
            lastSyncTime: new Date().toISOString()
        };
    }
}

// 전역 크로스 디바이스 동기화 인스턴스 생성
window.crossDeviceSync = new CrossDeviceSync();

console.log('🔄 크로스 디바이스 동기화 시스템 로드 완료');
