/**
 * 💾 IndexedDB 캐시 관리 시스템
 * 
 * 로컬 데이터 캐싱과 오프라인 지원을 제공합니다.
 * Supabase와의 동기화를 위한 로컬 스토리지 역할을 합니다.
 */

class IndexedDBCache {
    constructor() {
        this.dbName = 'SucPlantCache';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
    }

    // 데이터베이스 초기화
    async init() {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ IndexedDB 열기 실패:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ IndexedDB 초기화 완료');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 테이블별 오브젝트 스토어 생성
                const tables = ['customers', 'orders', 'products', 'categories', 'waitlist', 'order_sources'];
                
                tables.forEach(tableName => {
                    if (!db.objectStoreNames.contains(tableName)) {
                        const store = db.createObjectStore(tableName, { keyPath: 'id' });
                        store.createIndex('updated_at', 'updated_at', { unique: false });
                        store.createIndex('created_at', 'created_at', { unique: false });
                    }
                });

                // 캐시 메타데이터 스토어
                if (!db.objectStoreNames.contains('cache_metadata')) {
                    db.createObjectStore('cache_metadata', { keyPath: 'key' });
                }
            };
        });
    }

    // 데이터 저장
    async save(tableName, data) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            
            const request = store.put({
                ...data,
                cached_at: new Date().toISOString()
            });

            request.onsuccess = () => {
                console.log(`✅ ${tableName} 데이터 캐시 저장 완료`);
                resolve();
            };

            request.onerror = () => {
                console.error(`❌ ${tableName} 데이터 캐시 저장 실패:`, request.error);
                reject(request.error);
            };
        });
    }

    // 데이터 조회
    async get(tableName, id) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`❌ ${tableName} 데이터 조회 실패:`, request.error);
                reject(request.error);
            };
        });
    }

    // 모든 데이터 조회
    async getAll(tableName) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error(`❌ ${tableName} 전체 데이터 조회 실패:`, request.error);
                reject(request.error);
            };
        });
    }

    // 데이터 삭제
    async delete(tableName, id) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`✅ ${tableName} 데이터 삭제 완료`);
                resolve();
            };

            request.onerror = () => {
                console.error(`❌ ${tableName} 데이터 삭제 실패:`, request.error);
                reject(request.error);
            };
        });
    }

    // 테이블 전체 삭제
    async clearTable(tableName) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log(`✅ ${tableName} 테이블 전체 삭제 완료`);
                resolve();
            };

            request.onerror = () => {
                console.error(`❌ ${tableName} 테이블 전체 삭제 실패:`, request.error);
                reject(request.error);
            };
        });
    }

    // 캐시 메타데이터 저장
    async setCacheMetadata(key, value) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache_metadata'], 'readwrite');
            const store = transaction.objectStore('cache_metadata');
            const request = store.put({ key, value, updated_at: new Date().toISOString() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 캐시 메타데이터 조회
    async getCacheMetadata(key) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache_metadata'], 'readonly');
            const store = transaction.objectStore('cache_metadata');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// 전역 캐시 인스턴스 생성
window.indexedDBCache = new IndexedDBCache();

// 초기화
window.indexedDBCache.init().then(() => {
    console.log('✅ IndexedDB 캐시 시스템 준비 완료');
}).catch(error => {
    console.error('❌ IndexedDB 캐시 시스템 초기화 실패:', error);
});

console.log('💾 IndexedDB 캐시 시스템 로드 완료');
