/**
 * 🔄 API 폴백 시스템
 * 
 * Supabase API 호출 실패 시 로컬 스토리지로 폴백하는 시스템입니다.
 * 네트워크 연결이 불안정할 때 데이터 손실을 방지합니다.
 */

class APIFallback {
    constructor() {
        this.isOnline = navigator.onLine;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1초
        this.fallbackData = new Map();
        
        this.setupEventListeners();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 네트워크 연결 복구됨');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 네트워크 연결 끊어짐 - 오프라인 모드 활성화');
        });
    }

    // Supabase 호출 래퍼
    async supabaseCall(operation, tableName, data = null, id = null) {
        try {
            if (!this.isOnline) {
                console.log(`📡 오프라인 모드: ${operation} 작업을 로컬에 저장`);
                return await this.saveToLocalFallback(operation, tableName, data, id);
            }

            // Supabase 호출 시도
            const result = await this.executeSupabaseOperation(operation, tableName, data, id);
            this.retryCount = 0; // 성공 시 재시도 카운트 리셋
            return result;

        } catch (error) {
            console.warn(`⚠️ Supabase 호출 실패, 로컬 폴백 사용:`, error);
            return await this.saveToLocalFallback(operation, tableName, data, id);
        }
    }

    // Supabase 작업 실행
    async executeSupabaseOperation(operation, tableName, data, id) {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }

        const { data: result, error } = await this.performOperation(operation, tableName, data, id);
        
        if (error) {
            throw error;
        }

        return result;
    }

    // 실제 작업 수행
    async performOperation(operation, tableName, data, id) {
        switch (operation) {
            case 'select':
                return await window.supabase.from(tableName).select('*');
            
            case 'insert':
                return await window.supabase.from(tableName).insert(data);
            
            case 'update':
                return await window.supabase.from(tableName).update(data).eq('id', id);
            
            case 'delete':
                return await window.supabase.from(tableName).delete().eq('id', id);
            
            default:
                throw new Error(`지원하지 않는 작업: ${operation}`);
        }
    }

    // 로컬 폴백 저장
    async saveToLocalFallback(operation, tableName, data, id) {
        const fallbackKey = `${tableName}_${operation}_${Date.now()}`;
        const fallbackData = {
            operation,
            tableName,
            data,
            id,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        // 로컬 스토리지에 저장
        localStorage.setItem(fallbackKey, JSON.stringify(fallbackData));
        
        // 메모리에도 저장
        this.fallbackData.set(fallbackKey, fallbackData);

        console.log(`💾 로컬 폴백 저장: ${operation} ${tableName}`);
        
        // 로컬 데이터 반환 (조회 작업의 경우)
        if (operation === 'select') {
            return await this.getLocalData(tableName);
        }

        return { success: true, local: true };
    }

    // 로컬 데이터 조회
    async getLocalData(tableName) {
        try {
            const localData = localStorage.getItem(`local_${tableName}`);
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error(`❌ 로컬 데이터 조회 실패:`, error);
            return [];
        }
    }

    // 로컬 데이터 저장
    async saveLocalData(tableName, data) {
        try {
            localStorage.setItem(`local_${tableName}`, JSON.stringify(data));
            console.log(`💾 로컬 데이터 저장 완료: ${tableName}`);
        } catch (error) {
            console.error(`❌ 로컬 데이터 저장 실패:`, error);
        }
    }

    // 대기 중인 변경사항 동기화
    async syncPendingChanges() {
        if (!this.isOnline) return;

        console.log('🔄 대기 중인 변경사항 동기화 시작...');
        
        for (const [key, fallbackData] of this.fallbackData) {
            try {
                await this.retrySupabaseOperation(fallbackData);
                localStorage.removeItem(key);
                this.fallbackData.delete(key);
                console.log(`✅ 동기화 완료: ${key}`);
            } catch (error) {
                console.warn(`⚠️ 동기화 실패: ${key}`, error);
                fallbackData.retryCount++;
                
                if (fallbackData.retryCount >= this.maxRetries) {
                    console.error(`❌ 최대 재시도 횟수 초과: ${key}`);
                    this.fallbackData.delete(key);
                }
            }
        }
    }

    // Supabase 작업 재시도
    async retrySupabaseOperation(fallbackData) {
        const { operation, tableName, data, id } = fallbackData;
        
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }

        await this.executeSupabaseOperation(operation, tableName, data, id);
    }

    // 헤더 자동 주입
    injectHeaders() {
        if (!window.supabase) return;

        // 원본 fetch 함수 백업
        const originalFetch = window.fetch;
        
        // fetch 함수 래핑
        window.fetch = async (url, options = {}) => {
            // Supabase API 호출인지 확인
            if (url.includes('supabase.co') || url.includes('supabase')) {
                options.headers = {
                    ...options.headers,
                    'apikey': window.SUPABASE_CONFIG?.anonKey || '',
                    'Authorization': `Bearer ${window.SUPABASE_CONFIG?.anonKey || ''}`
                };
            }
            
            return originalFetch(url, options);
        };

        console.log('🔧 API 헤더 자동 주입 활성화');
    }
}

// 전역 API 폴백 인스턴스 생성
window.apiFallback = new APIFallback();

// 헤더 자동 주입 활성화
window.apiFallback.injectHeaders();

console.log('🔄 API 폴백 시스템 로드 완료');
