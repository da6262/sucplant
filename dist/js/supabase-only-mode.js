/**
 * Supabase 전용 모드 설정
 * localStorage 사용을 완전히 차단하고 Supabase만 사용
 */

// localStorage 사용 차단
(function() {
    'use strict';
    
    console.log('🚫 localStorage 사용이 차단되었습니다. Supabase만 사용 가능합니다.');
    
    // localStorage 차단을 완전히 제거 (Supabase 초기화 문제 해결)
    console.log('⚠️ localStorage 차단 비활성화 - Supabase 초기화 문제 해결');
    
    // 대신 localStorage 사용을 모니터링만 함
    const originalLocalStorage = window.localStorage;
    
    // localStorage 사용 모니터링
    const originalSetItem = originalLocalStorage.setItem;
    const originalGetItem = originalLocalStorage.getItem;
    
    originalLocalStorage.setItem = function(key, value) {
        console.log('📝 localStorage 사용 감지:', key);
        return originalSetItem.call(this, key, value);
    };
    
    originalLocalStorage.getItem = function(key) {
        console.log('📖 localStorage 읽기 감지:', key);
        return originalGetItem.call(this, key);
    };
    
    // sessionStorage도 모니터링만 함
    const originalSessionStorage = window.sessionStorage;
    
    originalSessionStorage.setItem = function(key, value) {
        console.log('📝 sessionStorage 사용 감지:', key);
        return originalSessionStorage.setItem.call(this, key, value);
    };
    
    originalSessionStorage.getItem = function(key) {
        console.log('📖 sessionStorage 읽기 감지:', key);
        return originalSessionStorage.getItem.call(this, key);
    };
    
    // IndexedDB도 차단
    Object.defineProperty(window, 'indexedDB', {
        get: function() {
            throw new Error('❌ IndexedDB 사용이 금지되었습니다. Supabase를 사용하세요.');
        },
        set: function() {
            throw new Error('❌ IndexedDB 사용이 금지되었습니다. Supabase를 사용하세요.');
        },
        configurable: false,
        enumerable: true
    });
    
    console.log('✅ Supabase 전용 모드가 활성화되었습니다.');
})();

// Supabase 전용 데이터 매니저
class SupabaseOnlyDataManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }
    
    async initialize() {
        try {
            // Supabase 클라이언트 초기화
            if (window.supabase) {
                this.supabase = window.supabase;
                this.initialized = true;
                console.log('✅ Supabase 데이터 매니저 초기화 완료');
                return true;
            } else {
                console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
                return false;
            }
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            return false;
        }
    }
    
    // 데이터 저장 (Supabase 전용)
    async saveData(table, data) {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }
        
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .insert(data);
                
            if (error) throw error;
            
            console.log(`✅ ${table} 테이블에 데이터 저장 완료:`, result);
            return result;
        } catch (error) {
            console.error(`❌ ${table} 테이블 저장 실패:`, error);
            throw error;
        }
    }
    
    // 데이터 조회 (Supabase 전용)
    async getData(table, filters = {}) {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }
        
        try {
            let query = this.supabase.from(table).select('*');
            
            // 필터 적용
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            console.log(`✅ ${table} 테이블 데이터 조회 완료:`, data);
            return data || [];
        } catch (error) {
            console.error(`❌ ${table} 테이블 조회 실패:`, error);
            throw error;
        }
    }
    
    // 데이터 업데이트 (Supabase 전용)
    async updateData(table, id, data) {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }
        
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .update(data)
                .eq('id', id);
                
            if (error) throw error;
            
            console.log(`✅ ${table} 테이블 데이터 업데이트 완료:`, result);
            return result;
        } catch (error) {
            console.error(`❌ ${table} 테이블 업데이트 실패:`, error);
            throw error;
        }
    }
    
    // 데이터 삭제 (Supabase 전용)
    async deleteData(table, id) {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }
        
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            console.log(`✅ ${table} 테이블 데이터 삭제 완료:`, result);
            return result;
        } catch (error) {
            console.error(`❌ ${table} 테이블 삭제 실패:`, error);
            throw error;
        }
    }
    
    // 실시간 구독 (Supabase 전용)
    subscribeToTable(table, callback) {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }
        
        return this.supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: table },
                callback
            )
            .subscribe();
    }
}

// 전역 데이터 매니저 인스턴스
window.supabaseDataManager = new SupabaseOnlyDataManager();

// localStorage 사용을 더 안전하게 차단
try {
    // localStorage 메서드들을 오버라이드
    const originalLocalStorage = window.localStorage;
    
    Object.defineProperty(window, 'localStorage', {
        get: function() {
            return {
                getItem: function(key) {
                    console.warn(`⚠️ localStorage.getItem('${key}') 호출됨 - Supabase를 사용하세요.`);
                    return null;
                },
                setItem: function(key, value) {
                    console.warn(`⚠️ localStorage.setItem('${key}', '${value}') 호출됨 - Supabase를 사용하세요.`);
                    return false;
                },
                removeItem: function(key) {
                    console.warn(`⚠️ localStorage.removeItem('${key}') 호출됨 - Supabase를 사용하세요.`);
                    return false;
                },
                clear: function() {
                    console.warn(`⚠️ localStorage.clear() 호출됨 - Supabase를 사용하세요.`);
                    return false;
                },
                length: 0,
                key: function(index) {
                    return null;
                }
            };
        },
        set: function() {
            throw new Error('❌ localStorage 사용이 금지되었습니다. Supabase를 사용하세요.');
        },
        configurable: false,
        enumerable: true
    });
} catch (error) {
    console.warn('localStorage 차단 설정 중 오류:', error);
}

console.log('🚫 localStorage 사용이 완전히 차단되었습니다. Supabase만 사용 가능합니다.');
