/**
 * 기존 Supabase 활성화 및 전환 스크립트
 * 경산다육식물농장 관리시스템 - 기존 Supabase를 Single Source of Truth로 전환
 */

class ExistingSupabaseActivator {
    constructor() {
        this.originalConfig = null;
        this.isActivated = false;
    }

    /**
     * 기존 Supabase 설정 확인
     */
    checkExistingSupabase() {
        console.log('🔍 기존 Supabase 설정 확인...');
        
        const existingConfig = {
            hasSupabaseClient: typeof window.supabase !== 'undefined',
            hasSupabaseConfig: !!window.SUPABASE_CONFIG,
            hasProductionConfig: !!window.SUPABASE_PRODUCTION_CONFIG,
            currentUrl: window.SUPABASE_CONFIG?.url,
            isDisabled: window.SUPABASE_CONFIG?.disabled
        };
        
        console.log('📊 기존 Supabase 상태:', existingConfig);
        return existingConfig;
    }

    /**
     * 기존 Supabase 설정 백업
     */
    backupExistingConfig() {
        console.log('💾 기존 Supabase 설정 백업...');
        
        this.originalConfig = {
            supabaseConfig: window.SUPABASE_CONFIG ? { ...window.SUPABASE_CONFIG } : null,
            productionConfig: window.SUPABASE_PRODUCTION_CONFIG ? { ...window.SUPABASE_PRODUCTION_CONFIG } : null,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('supabase_config_backup', JSON.stringify(this.originalConfig));
        console.log('✅ 기존 설정 백업 완료');
    }

    /**
     * 기존 Supabase 활성화
     */
    activateExistingSupabase() {
        console.log('🚀 기존 Supabase 활성화...');
        
        try {
            // 1. 기존 설정 백업
            this.backupExistingConfig();
            
            // 2. Supabase 설정 활성화
            if (window.SUPABASE_CONFIG) {
                window.SUPABASE_CONFIG.disabled = false;
                console.log('✅ Supabase 설정 활성화');
            }
            
            // 3. 프로덕션 설정 활성화
            if (typeof window.enableSupabaseProduction === 'function') {
                window.enableSupabaseProduction();
                console.log('✅ Supabase 프로덕션 모드 활성화');
            }
            
            // 4. Supabase 클라이언트 초기화
            if (typeof window.initializeSupabaseClient === 'function') {
                window.initializeSupabaseClient();
                console.log('✅ Supabase 클라이언트 초기화');
            }
            
            // 5. 실시간 동기화 활성화
            if (window.realtimeSyncManager) {
                window.realtimeSyncManager.setupRealtimeSubscriptions();
                console.log('✅ 실시간 동기화 활성화');
            }
            
            this.isActivated = true;
            console.log('🎉 기존 Supabase 활성화 완료!');
            
            return true;
        } catch (error) {
            console.error('❌ 기존 Supabase 활성화 실패:', error);
            return false;
        }
    }

    /**
     * 기존 Supabase 비활성화 (롤백)
     */
    deactivateSupabase() {
        console.log('🔄 Supabase 비활성화 (롤백)...');
        
        try {
            // 1. 백업된 설정 복원
            const backup = localStorage.getItem('supabase_config_backup');
            if (backup) {
                const originalConfig = JSON.parse(backup);
                
                if (originalConfig.supabaseConfig) {
                    window.SUPABASE_CONFIG = { ...originalConfig.supabaseConfig };
                }
                
                console.log('✅ 기존 설정 복원 완료');
            }
            
            // 2. Supabase 비활성화
            if (window.SUPABASE_CONFIG) {
                window.SUPABASE_CONFIG.disabled = true;
            }
            
            // 3. 실시간 동기화 비활성화
            if (window.realtimeSyncManager) {
                window.realtimeSyncManager.clearRealtimeSubscriptions();
            }
            
            this.isActivated = false;
            console.log('✅ Supabase 비활성화 완료');
            
            return true;
        } catch (error) {
            console.error('❌ Supabase 비활성화 실패:', error);
            return false;
        }
    }

    /**
     * 기존 Supabase 연결 테스트
     */
    async testExistingSupabase() {
        console.log('🧪 기존 Supabase 연결 테스트...');
        
        try {
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }
            
            const { data, error } = await window.supabase
                .from('farm_customers')
                .select('count')
                .limit(1);
            
            if (error) {
                throw new Error(`Supabase 연결 실패: ${error.message}`);
            }
            
            console.log('✅ 기존 Supabase 연결 테스트 성공');
            return true;
        } catch (error) {
            console.error('❌ 기존 Supabase 연결 테스트 실패:', error);
            return false;
        }
    }

    /**
     * 기존 데이터 마이그레이션
     */
    async migrateExistingData() {
        console.log('🔄 기존 데이터 마이그레이션...');
        
        try {
            // LocalStorage → Supabase 마이그레이션
            if (typeof window.migrateLocalStorageToSupabase === 'function') {
                const success = await window.migrateLocalStorageToSupabase();
                if (success) {
                    console.log('✅ 기존 데이터 마이그레이션 완료');
                    return true;
                } else {
                    throw new Error('마이그레이션 실패');
                }
            } else {
                console.warn('⚠️ 마이그레이션 함수가 없습니다.');
                return false;
            }
        } catch (error) {
            console.error('❌ 기존 데이터 마이그레이션 실패:', error);
            return false;
        }
    }

    /**
     * 전환 상태 확인
     */
    getActivationStatus() {
        return {
            isActivated: this.isActivated,
            hasBackup: !!localStorage.getItem('supabase_config_backup'),
            supabaseStatus: window.SUPABASE_CONFIG?.disabled === false,
            realtimeStatus: window.realtimeSyncManager?.getSyncStatus(),
            originalConfig: this.originalConfig
        };
    }

    /**
     * 완전한 전환 실행
     */
    async executeFullTransition() {
        console.log('🚀 기존 Supabase 완전 전환 시작...');
        
        try {
            // 1. 기존 설정 확인
            const existingStatus = this.checkExistingSupabase();
            console.log('📊 기존 상태:', existingStatus);
            
            // 2. Supabase 활성화
            const activated = this.activateExistingSupabase();
            if (!activated) {
                throw new Error('Supabase 활성화 실패');
            }
            
            // 3. 연결 테스트
            const connected = await this.testExistingSupabase();
            if (!connected) {
                console.warn('⚠️ Supabase 연결 실패, 로컬 모드로 계속 진행');
            }
            
            // 4. 데이터 마이그레이션
            const migrated = await this.migrateExistingData();
            if (!migrated) {
                console.warn('⚠️ 데이터 마이그레이션 실패, 기존 데이터 유지');
            }
            
            // 5. 최종 상태 확인
            const finalStatus = this.getActivationStatus();
            console.log('📊 최종 상태:', finalStatus);
            
            console.log('🎉 기존 Supabase 전환 완료!');
            return true;
            
        } catch (error) {
            console.error('❌ 기존 Supabase 전환 실패:', error);
            return false;
        }
    }
}

// 전역 인스턴스 생성
window.existingSupabaseActivator = new ExistingSupabaseActivator();

// 편의 함수들
window.activateExistingSupabase = () => window.existingSupabaseActivator.activateExistingSupabase();
window.deactivateSupabase = () => window.existingSupabaseActivator.deactivateSupabase();
window.testExistingSupabase = () => window.existingSupabaseActivator.testExistingSupabase();
window.migrateExistingData = () => window.existingSupabaseActivator.migrateExistingData();
window.executeFullTransition = () => window.existingSupabaseActivator.executeFullTransition();
window.getActivationStatus = () => window.existingSupabaseActivator.getActivationStatus();

console.log('✅ 기존 Supabase 활성화 시스템 로드 완료');
console.log('🚀 사용법: executeFullTransition() - 기존 Supabase 전환 실행');
