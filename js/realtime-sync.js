/**
 * Supabase Realtime 동기화 모듈
 * 기기 간 실시간 데이터 동기화 처리
 */

class RealtimeSync {
    constructor() {
        this.supabase = null;
        this.subscriptions = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Realtime 동기화 초기화
     */
    async initialize() {
        try {
            this.supabase = window.SupabaseConfig.getClient();
            if (!this.supabase) {
                throw new Error('Supabase 클라이언트가 초기화되지 않음');
            }

            console.log('🔄 Realtime 동기화 초기화 시작...');
            
            // 주요 테이블들에 대한 Realtime 구독 설정
            await this.setupTableSubscriptions();
            
            this.isConnected = true;
            console.log('✅ Realtime 동기화 초기화 완료');
            
            return true;
        } catch (error) {
            console.error('❌ Realtime 동기화 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 테이블별 Realtime 구독 설정
     */
    async setupTableSubscriptions() {
        // 6개 farm_* 테이블로 통일
        const tables = [
            'farm_orders',
            'farm_products', 
            'farm_channels',
            'farm_categories',
            'farm_customers',
            'farm_waitlist'
        ];
        
        for (const table of tables) {
            await this.subscribeToTable(table);
        }
    }

    /**
     * 특정 테이블에 대한 Realtime 구독
     */
    async subscribeToTable(tableName) {
        try {
            console.log(`📡 ${tableName} 테이블 Realtime 구독 시작...`);
            
            const subscription = this.supabase
                .channel(`${tableName}_changes`)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: tableName 
                    }, 
                    (payload) => {
                        this.handleTableChange(tableName, payload);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`✅ ${tableName} 테이블 구독 성공`);
                        this.subscriptions.set(tableName, subscription);
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error(`❌ ${tableName} 테이블 구독 실패`);
                    }
                });

        } catch (error) {
            console.error(`❌ ${tableName} 테이블 구독 설정 실패:`, error);
        }
    }

    /**
     * 테이블 변경 이벤트 처리
     */
    handleTableChange(tableName, payload) {
        console.log(`🟢 ${tableName} ${payload.eventType}`, payload.new || payload.old);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        // 테이블명 매핑 (Supabase 테이블명 → 로컬 키)
        const tableMapping = {
            'farm_orders': 'orders',
            'farm_customers': 'customers', 
            'farm_waitlist': 'waitlist',
            'farm_products': 'products',
            'farm_categories': 'categories',
            'farm_channels': 'channels'
        };
        
        const localKey = tableMapping[tableName] || tableName;
        
        // Realtime 델타 반영
        this.applyRealtimeDelta(localKey, payload);
    }

    /**
     * Realtime 델타 반영 (INSERT/UPDATE/DELETE)
     */
    applyRealtimeDelta(table, payload) {
        if (payload.eventType === 'DELETE') {
            this.removeOne(table, payload.old.id);
        } else {
            this.upsertOne(table, payload.new);
        }
        
        // 로컬 저장 + UI 렌더
        this.saveLocal(table, this.loadLocal(table));
        this.renderTable?.(table, this.loadLocal(table));
    }

    /**
     * 로컬 데이터 로드
     */
    loadLocal(table) {
        try {
            return JSON.parse(localStorage.getItem(table)) || [];
        } catch {
            return [];
        }
    }

    /**
     * 로컬 데이터 저장
     */
    saveLocal(table, rows) {
        localStorage.setItem(table, JSON.stringify(rows));
    }

    /**
     * 단일 항목 업서트
     */
    upsertOne(table, row, key = 'id') {
        const list = this.loadLocal(table);
        const i = list.findIndex(x => x[key] === row[key]);
        if (i === -1) {
            list.push(row);
        } else {
            list[i] = { ...list[i], ...row };
        }
        this.saveLocal(table, list);
    }

    /**
     * 단일 항목 제거
     */
    removeOne(table, id, key = 'id') {
        const list = this.loadLocal(table).filter(x => x[key] !== id);
        this.saveLocal(table, list);
    }

    /**
     * INSERT 이벤트 처리
     */
    handleInsert(tableName, newRecord) {
        // 운영 모드에서는 간소화된 로그
        if (this.isProductionMode()) {
            console.log(`➕ ${tableName} 새 데이터 추가`);
        } else {
            console.log(`➕ ${tableName} 새 데이터 추가:`, newRecord);
        }
        
        // 로컬 데이터 업데이트
        this.updateLocalData(tableName, newRecord, 'insert');
        
        // UI 업데이트
        this.triggerUIUpdate(tableName);
    }

    /**
     * UPDATE 이벤트 처리
     */
    handleUpdate(tableName, newRecord, oldRecord) {
        console.log(`🔄 ${tableName} 데이터 업데이트:`, { old: oldRecord, new: newRecord });
        
        // 로컬 데이터 업데이트
        this.updateLocalData(tableName, newRecord, 'update');
        
        // UI 업데이트
        this.triggerUIUpdate(tableName);
    }

    /**
     * DELETE 이벤트 처리
     */
    handleDelete(tableName, oldRecord) {
        console.log(`🗑️ ${tableName} 데이터 삭제:`, oldRecord);
        
        // 로컬 데이터 업데이트
        this.updateLocalData(tableName, oldRecord, 'delete');
        
        // UI 업데이트
        this.triggerUIUpdate(tableName);
    }

    /**
     * 로컬 데이터 업데이트
     */
    updateLocalData(tableName, record, operation) {
        try {
            // IndexedDB 캐시 업데이트
            if (window.indexedDBCache) {
                window.indexedDBCache.updateCache(tableName, record, operation);
            }
            
            // LocalStorage 업데이트
            this.updateLocalStorage(tableName, record, operation);
            
            console.log(`💾 ${tableName} 로컬 데이터 업데이트 완료 (${operation})`);
        } catch (error) {
            console.error(`❌ ${tableName} 로컬 데이터 업데이트 실패:`, error);
        }
    }

    /**
     * LocalStorage 업데이트
     */
    updateLocalStorage(tableName, record, operation) {
        const storageKey = `farm_management_${tableName}`;
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        let updatedData;
        switch (operation) {
            case 'insert':
                updatedData = [...existingData, record];
                break;
            case 'update':
                updatedData = existingData.map(item => 
                    item.id === record.id ? record : item
                );
                break;
            case 'delete':
                updatedData = existingData.filter(item => item.id !== record.id);
                break;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }

    /**
     * UI 업데이트 트리거
     */
    triggerUIUpdate(tableName) {
        // 커스텀 이벤트 발생
        const event = new CustomEvent('realtimeUpdate', {
            detail: { table: tableName }
        });
        window.dispatchEvent(event);
        
        console.log(`🎨 ${tableName} UI 업데이트 트리거`);
    }

    /**
     * 연결 상태 확인
     */
    isRealtimeConnected() {
        return this.isConnected && this.subscriptions.size > 0;
    }

    /**
     * 운영 모드 확인
     */
    isProductionMode() {
        return window.location.hostname === 'korsucplant.web.app' || 
               process.env.NODE_ENV === 'production';
    }

    /**
     * 구독 해제
     */
    unsubscribe() {
        console.log('📴 Realtime 구독 해제 중...');
        
        this.subscriptions.forEach((subscription, tableName) => {
            this.supabase.removeChannel(subscription);
            console.log(`📴 ${tableName} 구독 해제 완료`);
        });
        
        this.subscriptions.clear();
        this.isConnected = false;
        
        console.log('✅ 모든 Realtime 구독 해제 완료');
    }

    /**
     * 재연결 시도
     */
    async reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ 최대 재연결 시도 횟수 초과');
            return false;
        }
        
        this.reconnectAttempts++;
        console.log(`🔄 Realtime 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        // 기존 구독 해제
        this.unsubscribe();
        
        // 잠시 대기 후 재연결
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 재연결 시도
        return await this.initialize();
    }
}

// 전역 인스턴스 생성
window.realtimeSync = new RealtimeSync();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // Supabase 초기화 완료 후 Realtime 시작
    setTimeout(async () => {
        if (window.SupabaseConfig && window.SupabaseConfig.getClient()) {
            await window.realtimeSync.initialize();
        }
    }, 2000);
});

console.log('🔄 Realtime 동기화 모듈 로드 완료');
