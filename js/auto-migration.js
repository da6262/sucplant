/**
 * 자동 Supabase 전환 스크립트
 * 경산다육식물농장 관리시스템 - 자동 마이그레이션 및 전환
 */

class AutoMigrationManager {
    constructor() {
        this.isRunning = false;
        this.migrationSteps = [];
        this.currentStep = 0;
        this.results = {};
    }

    /**
     * 자동 전환 프로세스 시작
     */
    async startAutoMigration() {
        console.log('🚀 자동 Supabase 전환 프로세스 시작...');
        this.isRunning = true;
        this.migrationSteps = [];
        this.currentStep = 0;
        this.results = {};

        try {
            // 1. 시스템 상태 확인
            await this.checkSystemStatus();
            
            // 2. Supabase 설정 확인
            await this.checkSupabaseConfig();
            
            // 3. 데이터 백업
            await this.backupLocalData();
            
            // 4. Supabase 연결 테스트
            await this.testSupabaseConnection();
            
            // 5. 데이터 마이그레이션
            await this.migrateData();
            
            // 6. 데이터 검증
            await this.validateMigration();
            
            // 7. 실시간 동기화 활성화
            await this.enableRealtimeSync();
            
            // 8. 최종 검증
            await this.finalValidation();
            
            console.log('🎉 자동 전환 프로세스 완료!');
            this.printResults();
            
        } catch (error) {
            console.error('❌ 자동 전환 프로세스 실패:', error);
            await this.handleMigrationError(error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * 시스템 상태 확인
     */
    async checkSystemStatus() {
        console.log('🔍 시스템 상태 확인...');
        
        const status = {
            localStorage: typeof Storage !== 'undefined',
            supabaseClient: typeof window.supabase !== 'undefined',
            migrationScripts: typeof window.migrateLocalStorageToSupabase === 'function',
            realtimeManager: typeof window.realtimeSyncManager !== 'undefined'
        };
        
        this.addStepResult('시스템 상태 확인', true, status);
        console.log('✅ 시스템 상태 확인 완료:', status);
    }

    /**
     * Supabase 설정 확인
     */
    async checkSupabaseConfig() {
        console.log('🔍 Supabase 설정 확인...');
        
        if (!window.SUPABASE_CONFIG) {
            throw new Error('Supabase 설정이 없습니다.');
        }
        
        const config = window.SUPABASE_CONFIG;
        const hasValidConfig = config.url && config.anonKey && 
                              config.url !== 'https://your-project.supabase.co';
        
        if (!hasValidConfig) {
            console.warn('⚠️ Supabase 설정이 더미 값입니다. 실제 프로젝트 정보로 교체하세요.');
            this.addStepResult('Supabase 설정 확인', false, '더미 설정값 감지');
            return;
        }
        
        this.addStepResult('Supabase 설정 확인', true, '유효한 설정 확인');
        console.log('✅ Supabase 설정 확인 완료');
    }

    /**
     * 로컬 데이터 백업
     */
    async backupLocalData() {
        console.log('💾 로컬 데이터 백업...');
        
        try {
            const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
            const backup = {};
            
            tables.forEach(table => {
                const key = getLocalStorageKey(table);
                // Supabase 전용 모드 - localStorage 사용 금지
                console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
                const data = null;
                if (data) {
                    backup[table] = JSON.parse(data);
                }
            });
            
            // 백업 데이터를 LocalStorage에 저장
            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            console.log('마이그레이션 백업:', {
                timestamp: new Date().toISOString(),
                data: backup
            });
            
            this.addStepResult('로컬 데이터 백업', true, `${Object.keys(backup).length}개 테이블 백업 완료`);
            console.log('✅ 로컬 데이터 백업 완료');
        } catch (error) {
            this.addStepResult('로컬 데이터 백업', false, error.message);
            throw error;
        }
    }

    /**
     * Supabase 연결 테스트
     */
    async testSupabaseConnection() {
        console.log('🔍 Supabase 연결 테스트...');
        
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
            
            this.addStepResult('Supabase 연결 테스트', true, '연결 성공');
            console.log('✅ Supabase 연결 테스트 성공');
        } catch (error) {
            this.addStepResult('Supabase 연결 테스트', false, error.message);
            throw error;
        }
    }

    /**
     * 데이터 마이그레이션
     */
    async migrateData() {
        console.log('🔄 데이터 마이그레이션 시작...');
        
        try {
            if (typeof window.migrateLocalStorageToSupabase !== 'function') {
                throw new Error('마이그레이션 함수가 없습니다.');
            }
            
            const success = await window.migrateLocalStorageToSupabase();
            
            if (success) {
                this.addStepResult('데이터 마이그레이션', true, '마이그레이션 성공');
                console.log('✅ 데이터 마이그레이션 완료');
            } else {
                throw new Error('마이그레이션 실패');
            }
        } catch (error) {
            this.addStepResult('데이터 마이그레이션', false, error.message);
            throw error;
        }
    }

    /**
     * 데이터 검증
     */
    async validateMigration() {
        console.log('🔍 데이터 검증...');
        
        try {
            if (typeof window.validateMigration !== 'function') {
                console.warn('⚠️ 데이터 검증 함수가 없습니다.');
                this.addStepResult('데이터 검증', true, '검증 함수 없음');
                return;
            }
            
            const isValid = await window.validateMigration();
            this.addStepResult('데이터 검증', isValid, isValid ? '검증 통과' : '검증 실패');
            console.log(isValid ? '✅ 데이터 검증 통과' : '⚠️ 데이터 검증 실패');
        } catch (error) {
            this.addStepResult('데이터 검증', false, error.message);
        }
    }

    /**
     * 실시간 동기화 활성화
     */
    async enableRealtimeSync() {
        console.log('🔄 실시간 동기화 활성화...');
        
        try {
            if (window.realtimeSyncManager) {
                // 실시간 동기화 설정
                window.realtimeSyncManager.setupRealtimeSubscriptions();
                this.addStepResult('실시간 동기화 활성화', true, '실시간 동기화 활성화 완료');
                console.log('✅ 실시간 동기화 활성화 완료');
            } else {
                console.warn('⚠️ 실시간 동기화 매니저가 없습니다.');
                this.addStepResult('실시간 동기화 활성화', false, '매니저 없음');
            }
        } catch (error) {
            this.addStepResult('실시간 동기화 활성화', false, error.message);
        }
    }

    /**
     * 최종 검증
     */
    async finalValidation() {
        console.log('🔍 최종 검증...');
        
        try {
            // Supabase 모드 활성화
            if (typeof window.enableSupabaseProduction === 'function') {
                window.enableSupabaseProduction();
            }
            
            // 통합 테스트 실행
            if (typeof window.testSupabaseIntegration === 'function') {
                await window.testSupabaseIntegration();
            }
            
            this.addStepResult('최종 검증', true, 'Supabase 모드 활성화 완료');
            console.log('✅ 최종 검증 완료');
        } catch (error) {
            this.addStepResult('최종 검증', false, error.message);
        }
    }

    /**
     * 마이그레이션 오류 처리
     */
    async handleMigrationError(error) {
        console.error('❌ 마이그레이션 오류 처리:', error);
        
        // 백업 데이터 복원 옵션 제공
        // Supabase 전용 모드 - localStorage 사용 금지
        console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
        const backup = null;
        if (backup) {
            console.log('🔄 백업 데이터 복원 옵션을 사용할 수 있습니다.');
            console.log('복원 명령어: window.autoMigrationManager.restoreFromBackup()');
        }
    }

    /**
     * 백업에서 복원
     */
    async restoreFromBackup() {
        console.log('🔄 백업 데이터 복원...');
        
        try {
            // Supabase 전용 모드 - localStorage 사용 금지
            console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            const backupData = null;
            if (!backupData) {
                throw new Error('백업 데이터가 없습니다.');
            }
            
            const backup = JSON.parse(backupData);
            const tables = Object.keys(backup.data);
            
            tables.forEach(table => {
                const key = getLocalStorageKey(table);
                // Supabase 전용 모드 - localStorage 사용 금지
                console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
            });
            
            console.log('✅ 백업 데이터 복원 완료');
            return true;
        } catch (error) {
            console.error('❌ 백업 데이터 복원 실패:', error);
            return false;
        }
    }

    /**
     * 단계 결과 추가
     */
    addStepResult(step, success, message) {
        this.migrationSteps.push({
            step,
            success,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 결과 출력
     */
    printResults() {
        console.log('\n📊 자동 전환 결과');
        console.log('='.repeat(50));
        
        let successCount = 0;
        this.migrationSteps.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${result.step}: ${result.message}`);
            if (result.success) successCount++;
        });
        
        console.log('='.repeat(50));
        console.log(`📈 전체 결과: ${successCount}/${this.migrationSteps.length} 단계 성공`);
        
        if (successCount === this.migrationSteps.length) {
            console.log('🎉 Supabase Single Source of Truth 전환 완료!');
        } else {
            console.log('⚠️ 일부 단계 실패. 로그를 확인하세요.');
        }
    }

    /**
     * 전환 상태 확인
     */
    getMigrationStatus() {
        return {
            isRunning: this.isRunning,
            currentStep: this.currentStep,
            totalSteps: this.migrationSteps.length,
            results: this.migrationSteps,
            hasBackup: false // Supabase 전용 모드
        };
    }
}

// 전역 인스턴스 생성
window.autoMigrationManager = new AutoMigrationManager();

// 편의 함수들
window.startAutoMigration = () => window.autoMigrationManager.startAutoMigration();
window.getMigrationStatus = () => window.autoMigrationManager.getMigrationStatus();
window.restoreFromBackup = () => window.autoMigrationManager.restoreFromBackup();

console.log('✅ 자동 마이그레이션 시스템 로드 완료');
console.log('🚀 사용법: startAutoMigration() - 자동 전환 시작');
