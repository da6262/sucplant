/**
 * Supabase 데이터 동기화 모듈
 * LocalStorage와 Supabase 간의 데이터 동기화 처리
 */

// 읽기 전용 테이블 목록
const READ_ONLY_TABLES = ['farm_categories', 'farm_order_statuses'];

class SupabaseIntegration {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.retryDelay = 1000; // 1초
        this.maxRetries = 3;
        
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 온라인 상태 감지 - 동기화 시작');
            this.syncOutbox();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 오프라인 상태 감지');
        });
    }

    /**
     * 데이터 저장 (Supabase + 캐시)
     */
    async saveData(table, data, operation = 'upsert') {
        try {
            // 읽기 전용 테이블 체크
            if (READ_ONLY_TABLES.includes(table) && operation !== 'select') {
                console.warn(`[READONLY] ${table}는 읽기 전용 — ${operation} 무시`);
                return { success: true, data: null, error: null }; // 성공처럼 통과시켜 UI 깨짐 방지
            }
            
            // 1. IndexedDB 캐시에 저장
            await window.indexedDBCache.setCache(table, data);
            
            // 2. 온라인 상태면 Supabase에 직접 저장
            if (this.isOnline) {
                await this.saveToSupabase(table, data, operation);
            } else {
                // 3. 오프라인이면 Outbox에 추가
                await window.indexedDBCache.addToOutbox(table, operation, data);
                console.log(`📤 오프라인 모드: ${table} 데이터를 Outbox에 저장`);
            }
            
            return { success: true, cached: true };
        } catch (error) {
            console.error(`❌ 데이터 저장 실패 (${table}):`, error);
            
            // 오프라인 모드로 폴백
            if (this.isOnline) {
                await window.indexedDBCache.addToOutbox(table, operation, data);
                console.log(`📤 네트워크 오류: ${table} 데이터를 Outbox에 저장`);
            }
            
            return { success: false, error: error.message, cached: true };
        }
    }

    /**
     * 데이터 조회 (캐시 우선, Supabase 폴백)
     */
    async loadData(table, forceRefresh = false) {
        try {
            // 1. 캐시에서 조회 (강제 새로고침이 아닌 경우)
            if (!forceRefresh) {
                const cachedData = await window.indexedDBCache.getCache(table);
                if (cachedData) {
                    console.log(`📖 캐시에서 데이터 로드: ${table}`);
                    return { success: true, data: cachedData, source: 'cache' };
                }
            }

            // 2. 온라인 상태면 Supabase에서 조회
            if (this.isOnline) {
                const supabaseData = await this.loadFromSupabase(table);
                if (supabaseData.success) {
                    // 캐시에 저장
                    await window.indexedDBCache.setCache(table, supabaseData.data);
                    console.log(`☁️ Supabase에서 데이터 로드: ${table}`);
                    return { ...supabaseData, source: 'supabase' };
                }
            }

            // 3. 캐시 데이터가 있으면 사용 (오프라인 모드)
            const fallbackData = await window.indexedDBCache.getCache(table);
            if (fallbackData) {
                console.log(`📱 오프라인 모드: 캐시 데이터 사용 ${table}`);
                return { success: true, data: fallbackData, source: 'cache-offline' };
            }

            return { success: false, error: '데이터를 찾을 수 없음', source: 'none' };
        } catch (error) {
            console.error(`❌ 데이터 로드 실패 (${table}):`, error);
            return { success: false, error: error.message, source: 'error' };
        }
    }

    /**
     * Supabase에 데이터 저장
     */
    async saveToSupabase(table, data, operation) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않음');
        }

        const tableName = window.SupabaseConfig.getTableName(table);
        console.log(`💾 Supabase 저장 시도: ${tableName}, 작업: ${operation}`);
        
        // 날짜 필드 정리 (배열인 경우 각 항목 처리)
        const processedData = Array.isArray(data) 
            ? data.map(item => this.cleanDateFields(item))
            : this.cleanDateFields(data);
        
        // UUID 타입 테이블 처리 (farm_waitlist)
        if (tableName === 'farm_waitlist' && operation === 'insert') {
            const processedWithUUID = Array.isArray(processedData) 
                ? processedData.map(item => {
                    // UUID가 없거나 유효하지 않은 경우 새로 생성
                    if (!item.id || typeof item.id !== 'string' || item.id.length < 36) {
                        item.id = crypto.randomUUID();
                    }
                    return item;
                })
                : (() => {
                    if (!processedData.id || typeof processedData.id !== 'string' || processedData.id.length < 36) {
                        processedData.id = crypto.randomUUID();
                    }
                    return processedData;
                })();
            processedData = processedWithUUID;
        }
        
        let result;
        switch (operation) {
            case 'insert':
                // farm_customers 테이블의 경우 id 제거하여 자동생성
                if (tableName === 'farm_customers') {
                    const safeData = Array.isArray(processedData) 
                        ? processedData.map(item => {
                            const { id: _drop, ...payload } = item;
                            return payload;
                        })
                        : (() => {
                            const { id: _drop, ...payload } = processedData;
                            return payload;
                        })();
                    result = await supabase.from(tableName).insert(safeData).select('id').single();
                } else {
                    result = await supabase.from(tableName).insert(processedData);
                }
                break;
            case 'update':
                result = await supabase.from(tableName).update(processedData).eq('id', processedData.id);
                break;
            case 'delete':
                result = await supabase.from(tableName).delete().eq('id', processedData.id);
                break;
            case 'upsert':
            default:
                // farm_customers 테이블의 경우 upsert 대신 phone 기준으로 처리
                if (tableName === 'farm_customers') {
                    const safeData = Array.isArray(processedData) 
                        ? processedData.map(item => {
                            const { id: _drop, ...payload } = item;
                            return payload;
                        })
                        : (() => {
                            const { id: _drop, ...payload } = processedData;
                            return payload;
                        })();
                    result = await supabase.from(tableName).upsert(safeData, { onConflict: 'phone' });
                } else {
                    result = await supabase.from(tableName).upsert(processedData);
                }
                break;
        }

        if (result.error) {
            throw new Error(`Supabase 저장 실패: ${result.error.message}`);
        }

        console.log(`☁️ Supabase 저장 성공: ${tableName}`);
        return result.data;
    }

    /**
     * 날짜 필드 정리 (Unix 타임스탬프를 ISO 문자열로 변환)
     */
    cleanDateFields(item) {
        if (!item || typeof item !== 'object') return item;
        
        const cleaned = { ...item };
        
        // 날짜 필드들을 ISO 문자열로 변환
        const dateFields = ['created_at', 'updated_at', 'register_date', 'last_contact'];
        
        dateFields.forEach(field => {
            if (cleaned[field]) {
                // Unix 타임스탬프인 경우 (숫자 또는 숫자 문자열)
                if (typeof cleaned[field] === 'number' || /^\d+$/.test(cleaned[field])) {
                    cleaned[field] = new Date(parseInt(cleaned[field])).toISOString();
                }
                // 이미 ISO 문자열인 경우 그대로 유지
                else if (typeof cleaned[field] === 'string' && cleaned[field].includes('T')) {
                    // 이미 올바른 형식
                }
                // 날짜 문자열인 경우 ISO로 변환
                else if (typeof cleaned[field] === 'string') {
                    cleaned[field] = new Date(cleaned[field]).toISOString();
                }
            }
        });
        
        return cleaned;
    }

    /**
     * Supabase에서 데이터 조회
     */
    async loadFromSupabase(table) {
        const supabase = window.SupabaseConfig.getClient();
        if (!supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않음');
        }

        const tableName = window.SupabaseConfig.getTableName(table);
        const { data, error } = await supabase.from(tableName).select('*');

        if (error) {
            throw new Error(`Supabase 조회 실패: ${error.message}`);
        }

        return { success: true, data: data || [] };
    }

    /**
     * Outbox 동기화 (오프라인에서 온라인으로 전환 시)
     */
    async syncOutbox() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 Outbox 동기화 시작...');

        try {
            const outboxItems = await window.indexedDBCache.getOutboxItems();
            console.log(`📦 동기화할 항목: ${outboxItems.length}개`);

            for (const item of outboxItems) {
                try {
                    await this.saveToSupabase(item.table, item.data, item.operation);
                    await window.indexedDBCache.removeFromOutbox(item.id);
                    console.log(`✅ 동기화 완료: ${item.operation} ${item.table}`);
                } catch (error) {
                    console.error(`❌ 동기화 실패: ${item.operation} ${item.table}`, error);
                    
                    // 재시도 횟수 증가
                    item.retryCount = (item.retryCount || 0) + 1;
                    if (item.retryCount >= this.maxRetries) {
                        console.error(`🚫 최대 재시도 횟수 초과: ${item.id}`);
                        await window.indexedDBCache.removeFromOutbox(item.id);
                    }
                }
            }

            console.log('🎉 Outbox 동기화 완료');
        } catch (error) {
            console.error('❌ Outbox 동기화 실패:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * 데이터 삭제
     */
    async deleteData(table, id) {
        try {
            // 1. 캐시에서 삭제
            const cachedData = await window.indexedDBCache.getCache(table);
            if (cachedData) {
                const filteredData = cachedData.filter(item => item.id !== id);
                await window.indexedDBCache.setCache(table, filteredData);
            }

            // 2. 온라인 상태면 Supabase에서 삭제
            if (this.isOnline) {
                await this.saveToSupabase(table, { id }, 'delete');
            } else {
                // 3. 오프라인이면 Outbox에 추가
                await window.indexedDBCache.addToOutbox(table, 'delete', { id });
            }

            return { success: true };
        } catch (error) {
            console.error(`❌ 데이터 삭제 실패 (${table}):`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 연결 상태 확인
     */
    async checkConnection() {
        if (!this.isOnline) {
            return { connected: false, reason: 'offline' };
        }

        try {
            const result = await window.SupabaseConfig.checkConnection();
            return result;
        } catch (error) {
            return { connected: false, reason: 'error', error: error.message };
        }
    }

    /**
     * 수동 동기화 트리거
     */
    async forceSync() {
        console.log('🔄 수동 동기화 시작...');
        await this.syncOutbox();
        
        // 모든 테이블 캐시 무효화 및 재로드
        const tables = Object.keys(window.SupabaseConfig.config.tables);
        for (const table of tables) {
            await window.indexedDBCache.clearCache(table);
        }
        
        console.log('🎉 수동 동기화 완료');
    }
}

// 전역 인스턴스 생성
window.supabaseIntegration = new SupabaseIntegration();

console.log('📦 Supabase 통합 모듈 로드 완료');

