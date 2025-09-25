/**
 * IndexedDB 캐시 레이어
 * 오프라인 지원 및 성능 최적화를 위한 로컬 캐시
 */

class IndexedDBCache {
    constructor() {
        this.dbName = 'FarmManagementCache';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * IndexedDB 초기화
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ IndexedDB 초기화 실패:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ IndexedDB 캐시 초기화 성공');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 캐시 데이터 저장소
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('table', 'table', { unique: false });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Outbox 저장소 (오프라인 동기화용)
                if (!db.objectStoreNames.contains('outbox')) {
                    const outboxStore = db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
                    outboxStore.createIndex('table', 'table', { unique: false });
                    outboxStore.createIndex('operation', 'operation', { unique: false });
                    outboxStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // 메타데이터 저장소
                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * 데이터 캐시 저장
     */
    async setCache(table, data, timestamp = Date.now()) {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            
            const cacheItem = {
                key: table,
                table: table,
                data: data,
                timestamp: timestamp
            };

            const request = store.put(cacheItem);
            
            request.onsuccess = () => {
                console.log(`💾 캐시 저장 완료: ${table}`);
                resolve();
            };
            
            request.onerror = () => {
                console.error(`❌ 캐시 저장 실패: ${table}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 데이터 캐시 조회
     */
    async getCache(table) {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(table);

            request.onsuccess = () => {
                if (request.result) {
                    console.log(`📖 캐시 조회 성공: ${table}`);
                    resolve(request.result.data);
                } else {
                    console.log(`📭 캐시 없음: ${table}`);
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error(`❌ 캐시 조회 실패: ${table}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 캐시 삭제
     */
    async clearCache(table) {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.delete(table);

            request.onsuccess = () => {
                console.log(`🗑️ 캐시 삭제 완료: ${table}`);
                resolve();
            };

            request.onerror = () => {
                console.error(`❌ 캐시 삭제 실패: ${table}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Outbox에 작업 추가 (오프라인 동기화용)
     */
    async addToOutbox(table, operation, data) {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['outbox'], 'readwrite');
            const store = transaction.objectStore('outbox');
            
            const outboxItem = {
                table: table,
                operation: operation, // 'insert', 'update', 'delete'
                data: data,
                timestamp: Date.now(),
                retryCount: 0
            };

            const request = store.add(outboxItem);
            
            request.onsuccess = () => {
                console.log(`📤 Outbox 추가: ${operation} ${table}`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Outbox 추가 실패: ${table}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Outbox에서 작업 조회
     */
    async getOutboxItems() {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['outbox'], 'readonly');
            const store = transaction.objectStore('outbox');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('❌ Outbox 조회 실패:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Outbox에서 작업 삭제
     */
    async removeFromOutbox(id) {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['outbox'], 'readwrite');
            const store = transaction.objectStore('outbox');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`🗑️ Outbox 삭제 완료: ${id}`);
                resolve();
            };

            request.onerror = () => {
                console.error(`❌ Outbox 삭제 실패: ${id}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 캐시 만료 시간 확인
     */
    async isCacheValid(table, maxAge = 5 * 60 * 1000) { // 기본 5분
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(table);

            request.onsuccess = () => {
                if (request.result) {
                    const age = Date.now() - request.result.timestamp;
                    resolve(age < maxAge);
                } else {
                    resolve(false);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * 전체 캐시 초기화
     */
    async clearAllCache() {
        if (!this.isInitialized) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.clear();

            request.onsuccess = () => {
                console.log('🗑️ 전체 캐시 초기화 완료');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ 전체 캐시 초기화 실패:', request.error);
                reject(request.error);
            };
        });
    }
}

// 전역 인스턴스 생성
window.indexedDBCache = new IndexedDBCache();

console.log('📦 IndexedDB 캐시 모듈 로드 완료');
