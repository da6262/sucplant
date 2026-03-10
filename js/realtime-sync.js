/**
 * 실시간 동기화 및 오프라인 지원 시스템
 * 경산다육식물농장 관리시스템 - Supabase Realtime 통합
 */

// LocalStorage 키 생성 함수
function getLocalStorageKey(key) {
    return `sucplant_${key}`;
}

class RealtimeSyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.realtimeChannels = [];
        this.syncInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    /**
     * 실시간 동기화 시스템 초기화
     */
    init() {
        console.log('🔄 실시간 동기화 시스템 초기화...');
        
        // 온라인/오프라인 상태 감지
        this.setupOnlineOfflineListeners();
        
        // Supabase 클라이언트 초기화 대기 (지연 실행)
        setTimeout(() => {
            this.waitForSupabaseClient();
        }, 1000);
        
        // 주기적 동기화 설정
        this.setupPeriodicSync();
        
        console.log('✅ 실시간 동기화 시스템 초기화 완료');
    }

    /**
     * Supabase 클라이언트 초기화 대기
     */
    async waitForSupabaseClient() {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            // Supabase 클라이언트가 제대로 초기화되었는지 확인
            if (this.isSupabaseClientReady()) {
                console.log('✅ Supabase 클라이언트 준비 완료');
                this.setupRealtimeSubscriptions();
                this.processSyncQueue();
                return;
            }
            
            // Supabase 클라이언트 강제 초기화 시도
            if (window.ensureSupabaseGlobalClient) {
                console.log('🔄 Supabase 클라이언트 강제 초기화 시도...');
                try {
                    const success = await window.ensureSupabaseGlobalClient();
                    if (success && this.isSupabaseClientReady()) {
                        console.log('✅ Supabase 클라이언트 강제 초기화 완료');
                        this.setupRealtimeSubscriptions();
                        this.processSyncQueue();
                        return;
                    }
                } catch (error) {
                    console.error('❌ Supabase 클라이언트 강제 초기화 실패:', error);
                }
            }
            
            console.log(`⏳ Supabase 클라이언트 대기 중... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        console.warn('⚠️ Supabase 클라이언트 초기화 시간 초과');
    }

    /**
     * Supabase 클라이언트 준비 상태 확인
     */
    isSupabaseClientReady() {
        return window.supabase && 
               typeof window.supabase.from === 'function' && 
               window.SUPABASE_CONFIG && 
               !window.SUPABASE_CONFIG.disabled;
    }

    /**
     * 실시간 구독 설정
     */
    setupRealtimeSubscriptions() {
        try {
            if (!this.isSupabaseClientReady()) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
                return;
            }

            const tables = [
                'farm_customers',
                'farm_products', 
                'farm_orders',
                'farm_categories',
                'farm_waitlist'
            ];

            tables.forEach(tableName => {
                const channel = window.supabase
                    .channel(`${tableName}_realtime`)
                    .on('postgres_changes', 
                        { 
                            event: '*', 
                            schema: 'public', 
                            table: tableName 
                        }, 
                        (payload) => {
                            console.log(`🔄 ${tableName} 실시간 변경 감지:`, payload);
                            this.handleRealtimeChange(tableName, payload);
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log(`✅ ${tableName} 실시간 구독 성공`);
                        } else {
                            console.warn(`⚠️ ${tableName} 실시간 구독 실패:`, status);
                        }
                    });

                this.realtimeChannels.push({ table: tableName, channel });
            });

            console.log('✅ 모든 테이블 실시간 구독 설정 완료');
        } catch (error) {
            console.error('❌ 실시간 구독 설정 실패:', error);
        }
    }

    /**
     * 실시간 변경 처리
     */
    handleRealtimeChange(tableName, payload) {
        try {
            console.log(`🔄 ${tableName} 변경 처리:`, payload.eventType);
            
            switch (payload.eventType) {
                case 'INSERT':
                    this.handleInsert(tableName, payload.new);
                    break;
                case 'UPDATE':
                    this.handleUpdate(tableName, payload.new, payload.old);
                    break;
                case 'DELETE':
                    this.handleDelete(tableName, payload.old);
                    break;
            }
            
            // UI 새로고침
            this.refreshUI();
            
        } catch (error) {
            console.error(`❌ ${tableName} 변경 처리 실패:`, error);
        }
    }

    /**
     * INSERT 이벤트 처리
     */
    handleInsert(tableName, newRecord) {
        try {
            const key = getLocalStorageKey(tableName);
            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            const localData = [];
            
            // 중복 확인
            const exists = localData.find(item => item.id === newRecord.id);
            if (!exists) {
                localData.push(newRecord);
                console.log(`✅ ${tableName} 새 레코드 추가:`, newRecord.id);
            }
        } catch (error) {
            console.error(`❌ ${tableName} INSERT 처리 실패:`, error);
        }
    }

    /**
     * UPDATE 이벤트 처리
     */
    handleUpdate(tableName, newRecord, oldRecord) {
        try {
            const key = getLocalStorageKey(tableName);
            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            const localData = [];
            
            const index = localData.findIndex(item => item.id === newRecord.id);
            if (index !== -1) {
                localData[index] = newRecord;
                console.log(`✅ ${tableName} 레코드 업데이트:`, newRecord.id);
            }
        } catch (error) {
            console.error(`❌ ${tableName} UPDATE 처리 실패:`, error);
        }
    }

    /**
     * DELETE 이벤트 처리
     */
    handleDelete(tableName, oldRecord) {
        try {
            const key = getLocalStorageKey(tableName);
            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            const localData = [];
            
            const filteredData = localData.filter(item => item.id !== oldRecord.id);
            console.log(`✅ ${tableName} 레코드 삭제:`, oldRecord.id);
        } catch (error) {
            console.error(`❌ ${tableName} DELETE 처리 실패:`, error);
        }
    }

    /**
     * UI 새로고침
     */
    refreshUI() {
        try {
            // 주문 시스템 새로고침
            if (window.orderSystem && typeof window.orderSystem.refreshAllTabs === 'function') {
                window.orderSystem.refreshAllTabs();
            }
            
            // 고객 데이터 새로고침
            if (window.customerDataManager && typeof window.customerDataManager.loadCustomers === 'function') {
                window.customerDataManager.loadCustomers();
            }
            
            // 상품 데이터 새로고침
            if (window.productDataManager && typeof window.productDataManager.loadProducts === 'function') {
                window.productDataManager.loadProducts();
            }
            
            console.log('🔄 UI 새로고침 완료');
        } catch (error) {
            console.error('❌ UI 새로고침 실패:', error);
        }
    }

    /**
     * 온라인/오프라인 상태 감지 설정
     */
    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            console.log('🌐 온라인 상태 복구');
            this.isOnline = true;
            this.processSyncQueue();
            this.setupRealtimeSubscriptions();
        });

        window.addEventListener('offline', () => {
            console.log('📴 오프라인 상태 감지');
            this.isOnline = false;
            this.clearRealtimeSubscriptions();
        });
    }

    /**
     * 주기적 동기화 설정
     */
    setupPeriodicSync() {
        // 30초마다 동기화 체크
        this.syncInterval = setInterval(() => {
            if (this.isOnline && window.supabase) {
                this.syncAllData();
            }
        }, 30000);
        
        console.log('⏰ 주기적 동기화 설정 완료 (30초 간격)');
    }

    /**
     * 전체 데이터 동기화
     */
    async syncAllData() {
        try {
            if (!this.isOnline) {
                console.log('⚠️ 동기화 불가: 오프라인 상태');
                return false;
            }
            
            if (!this.isSupabaseClientReady()) {
                console.log('⚠️ 동기화 불가: Supabase 클라이언트 미연결');
                return false;
            }
            
            if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.disabled) {
                console.log('⚠️ 동기화 불가: Supabase 비활성화됨');
                return false;
            }

            console.log('🔄 전체 데이터 동기화 시작...');
            
            const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
            let successCount = 0;

            for (const table of tables) {
                try {
                    const success = await this.syncTable(table);
                    if (success) successCount++;
                } catch (error) {
                    console.error(`❌ ${table} 동기화 실패:`, error);
                }
            }

            console.log(`✅ 전체 동기화 완료: ${successCount}/${tables.length} 테이블`);
            return successCount === tables.length;
        } catch (error) {
            console.error('❌ 전체 데이터 동기화 실패:', error);
            return false;
        }
    }

    /**
     * 개별 테이블 동기화
     */
    async syncTable(tableName) {
        try {
            // Supabase 클라이언트 상태 확인
            if (!this.isSupabaseClientReady()) {
                console.warn(`⚠️ ${tableName} 동기화 건너뜀: Supabase 클라이언트가 초기화되지 않음`);
                return false;
            }

            // Supabase에서 최신 데이터 로드
            const { data, error } = await window.supabase
                .from(tableName)
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                console.error(`❌ ${tableName} Supabase 로드 실패:`, error);
                return false;
            }

            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            
            console.log(`✅ ${tableName} 동기화 완료: ${data?.length || 0}개`);
            return true;
        } catch (error) {
            console.error(`❌ ${tableName} 동기화 실패:`, error);
            return false;
        }
    }

    /**
     * 오프라인 큐 처리
     */
    async processSyncQueue() {
        try {
            if (!this.isOnline || this.syncQueue.length === 0) {
                return;
            }

            console.log(`🔄 오프라인 큐 처리: ${this.syncQueue.length}개 작업`);
            
            const queue = [...this.syncQueue];
            this.syncQueue = [];
            
            for (const operation of queue) {
                try {
                    await this.executeOperation(operation);
                } catch (error) {
                    console.error('❌ 큐 작업 실행 실패:', error);
                    // 실패한 작업을 다시 큐에 추가
                    this.syncQueue.push(operation);
                }
            }
            
            console.log('✅ 오프라인 큐 처리 완료');
        } catch (error) {
            console.error('❌ 오프라인 큐 처리 실패:', error);
        }
    }

    /**
     * 큐 작업 실행
     */
    async executeOperation(operation) {
        try {
            // Supabase 클라이언트 상태 확인
            if (!this.isSupabaseClientReady()) {
                console.warn('⚠️ 큐 작업 건너뜀: Supabase 클라이언트가 초기화되지 않음');
                return;
            }

            const { table, action, data } = operation;
            
            switch (action) {
                case 'insert':
                    await window.supabase.from(table).insert(data);
                    break;
                case 'update':
                    await window.supabase.from(table).update(data).eq('id', data.id);
                    break;
                case 'delete':
                    await window.supabase.from(table).delete().eq('id', data.id);
                    break;
            }
            
            console.log(`✅ 큐 작업 실행 완료: ${table}.${action}`);
        } catch (error) {
            console.error('❌ 큐 작업 실행 실패:', error);
            throw error;
        }
    }

    /**
     * 오프라인 작업 큐에 추가
     */
    addToQueue(table, action, data) {
        const operation = {
            table,
            action,
            data,
            timestamp: Date.now()
        };
        
        this.syncQueue.push(operation);
        console.log(`📝 오프라인 큐에 추가: ${table}.${action}`);
    }

    /**
     * 실시간 구독 해제
     */
    clearRealtimeSubscriptions() {
        try {
            if (!this.isSupabaseClientReady()) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않아 구독 해제를 건너뜁니다.');
                this.realtimeChannels = [];
                return;
            }

            this.realtimeChannels.forEach(({ table, channel }) => {
                window.supabase.removeChannel(channel);
                console.log(`✅ ${table} 실시간 구독 해제`);
            });
            
            this.realtimeChannels = [];
            console.log('✅ 모든 실시간 구독 해제 완료');
        } catch (error) {
            console.error('❌ 실시간 구독 해제 실패:', error);
        }
    }

    /**
     * 동기화 상태 확인
     */
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            queueLength: this.syncQueue.length,
            activeChannels: this.realtimeChannels.length,
            lastSync: 'Supabase 전용 모드'
        };
    }

    /**
     * 시스템 정리
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.clearRealtimeSubscriptions();
        console.log('✅ 실시간 동기화 시스템 정리 완료');
    }
}

// 전역 인스턴스 생성 (지연 실행)
setTimeout(() => {
    window.realtimeSyncManager = new RealtimeSyncManager();
    console.log('✅ 실시간 동기화 시스템 로드 완료');
}, 500);

// 재시작 함수 추가
window.restartRealtimeSync = function() {
    if (window.realtimeSyncManager) {
        window.realtimeSyncManager.destroy();
    }
    window.realtimeSyncManager = new RealtimeSyncManager();
    console.log('🔄 실시간 동기화 시스템 재시작 완료');
};
