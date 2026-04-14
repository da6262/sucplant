/**
 * Supabase 통합 테스트 및 검증 스크립트
 * 경산다육식물농장 관리시스템 - Supabase Single Source of Truth 검증
 */

class SupabaseIntegrationTest {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }

    /**
     * 전체 통합 테스트 실행
     */
    async runAllTests() {
        console.log('🧪 Supabase 통합 테스트 시작...');
        this.isRunning = true;
        this.testResults = [];

        try {
            // 1. 기본 연결 테스트
            await this.testSupabaseConnection();
            
            // 2. 데이터 마이그레이션 테스트
            await this.testDataMigration();
            
            // 3. CRUD 작업 테스트
            await this.testCRUDOperations();
            
            // 4. 실시간 동기화 테스트
            await this.testRealtimeSync();
            
            // 5. 오프라인 지원 테스트
            await this.testOfflineSupport();
            
            // 6. 데이터 일관성 테스트
            await this.testDataConsistency();
            
            // 결과 출력
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ 통합 테스트 실패:', error);
        } finally {
            this.isRunning = false;
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

            this.addTestResult('Supabase 연결', true, 'Supabase 서버 연결 성공');
        } catch (error) {
            this.addTestResult('Supabase 연결', false, error.message);
        }
    }

    /**
     * 데이터 마이그레이션 테스트
     */
    async testDataMigration() {
        console.log('🔍 데이터 마이그레이션 테스트...');
        
        try {
            // LocalStorage 데이터 확인
            const localData = JSON.parse(localStorage.getItem('farm_customers') || '[]');
            
            if (localData.length === 0) {
                this.addTestResult('데이터 마이그레이션', true, '로컬 데이터 없음 (정상)');
                return;
            }

            // 마이그레이션 실행
            if (typeof window.migrateLocalStorageToSupabase === 'function') {
                const success = await window.migrateLocalStorageToSupabase();
                this.addTestResult('데이터 마이그레이션', success, 
                    success ? '마이그레이션 성공' : '마이그레이션 실패');
            } else {
                this.addTestResult('데이터 마이그레이션', false, '마이그레이션 함수 없음');
            }
        } catch (error) {
            this.addTestResult('데이터 마이그레이션', false, error.message);
        }
    }

    /**
     * CRUD 작업 테스트
     */
    async testCRUDOperations() {
        console.log('🔍 CRUD 작업 테스트...');
        
        try {
            const testCustomer = {
                name: '테스트 고객',
                phone: '010-0000-0000',
                email: 'test@example.com',
                grade: 'GENERAL'
            };

            // CREATE 테스트
            const { data: insertData, error: insertError } = await window.supabase
                .from('farm_customers')
                .insert(testCustomer)
                .select();

            if (insertError) {
                throw new Error(`CREATE 실패: ${insertError.message}`);
            }

            const customerId = insertData[0].id;
            this.addTestResult('CREATE 작업', true, `고객 생성 성공 (ID: ${customerId})`);

            // READ 테스트
            const { data: readData, error: readError } = await window.supabase
                .from('farm_customers')
                .select('*')
                .eq('id', customerId);

            if (readError || !readData || readData.length === 0) {
                throw new Error('READ 실패');
            }

            this.addTestResult('READ 작업', true, '고객 조회 성공');

            // UPDATE 테스트
            const { error: updateError } = await window.supabase
                .from('farm_customers')
                .update({ name: '수정된 테스트 고객' })
                .eq('id', customerId);

            if (updateError) {
                throw new Error(`UPDATE 실패: ${updateError.message}`);
            }

            this.addTestResult('UPDATE 작업', true, '고객 수정 성공');

            // DELETE 테스트
            const { error: deleteError } = await window.supabase
                .from('farm_customers')
                .delete()
                .eq('id', customerId);

            if (deleteError) {
                throw new Error(`DELETE 실패: ${deleteError.message}`);
            }

            this.addTestResult('DELETE 작업', true, '고객 삭제 성공');

        } catch (error) {
            this.addTestResult('CRUD 작업', false, error.message);
        }
    }

    /**
     * 실시간 동기화 테스트
     */
    async testRealtimeSync() {
        console.log('🔍 실시간 동기화 테스트...');
        
        try {
            if (!window.realtimeSyncManager) {
                throw new Error('실시간 동기화 매니저가 없습니다.');
            }

            const syncStatus = window.realtimeSyncManager.getSyncStatus();
            
            if (syncStatus.activeChannels > 0) {
                this.addTestResult('실시간 동기화', true, 
                    `${syncStatus.activeChannels}개 채널 활성화`);
            } else {
                this.addTestResult('실시간 동기화', false, '활성화된 채널 없음');
            }
        } catch (error) {
            this.addTestResult('실시간 동기화', false, error.message);
        }
    }

    /**
     * 오프라인 지원 테스트
     */
    async testOfflineSupport() {
        console.log('🔍 오프라인 지원 테스트...');
        
        try {
            // 오프라인 큐 시스템 확인
            const queueLength = window.realtimeSyncManager?.syncQueue?.length || 0;
            
            // LocalStorage 폴백 확인
            const hasLocalData = localStorage.getItem('farm_customers') !== null;
            
            if (hasLocalData) {
                this.addTestResult('오프라인 지원', true, 'LocalStorage 폴백 시스템 활성화');
            } else {
                this.addTestResult('오프라인 지원', false, 'LocalStorage 폴백 데이터 없음');
            }
        } catch (error) {
            this.addTestResult('오프라인 지원', false, error.message);
        }
    }

    /**
     * 데이터 일관성 테스트
     */
    async testDataConsistency() {
        console.log('🔍 데이터 일관성 테스트...');
        
        try {
            const tables = ['farm_customers', 'farm_products', 'farm_orders'];
            let consistentTables = 0;

            for (const table of tables) {
                // Supabase 데이터
                const { data: supabaseData, error } = await window.supabase
                    .from(table)
                    .select('*');

                if (error) {
                    console.warn(`⚠️ ${table} Supabase 데이터 로드 실패:`, error);
                    continue;
                }

                // LocalStorage 데이터
                const key = getLocalStorageKey(table);
                const localData = JSON.parse(localStorage.getItem(key) || '[]');

                // 데이터 개수 비교
                if (supabaseData.length === localData.length) {
                    consistentTables++;
                    console.log(`✅ ${table} 데이터 일관성 확인: ${supabaseData.length}개`);
                } else {
                    console.warn(`⚠️ ${table} 데이터 불일치: Supabase(${supabaseData.length}) vs Local(${localData.length})`);
                }
            }

            const isConsistent = consistentTables === tables.length;
            this.addTestResult('데이터 일관성', isConsistent, 
                `${consistentTables}/${tables.length} 테이블 일관성 확인`);

        } catch (error) {
            this.addTestResult('데이터 일관성', false, error.message);
        }
    }

    /**
     * 테스트 결과 추가
     */
    addTestResult(testName, success, message) {
        this.testResults.push({
            test: testName,
            success,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 테스트 결과 출력
     */
    printTestResults() {
        console.log('\n📊 Supabase 통합 테스트 결과');
        console.log('='.repeat(50));
        
        let successCount = 0;
        let totalCount = this.testResults.length;
        
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.message}`);
            if (result.success) successCount++;
        });
        
        console.log('='.repeat(50));
        console.log(`📈 전체 결과: ${successCount}/${totalCount} 테스트 통과`);
        
        if (successCount === totalCount) {
            console.log('🎉 모든 테스트 통과! Supabase Single Source of Truth 전환 완료!');
        } else {
            console.log('⚠️ 일부 테스트 실패. 설정을 확인해주세요.');
        }
        
        // 결과를 LocalStorage에 저장
        localStorage.setItem('supabase_test_results', JSON.stringify({
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: { success: successCount, total: totalCount }
        }));
    }

    /**
     * 특정 테스트만 실행
     */
    async runSpecificTest(testName) {
        console.log(`🧪 ${testName} 테스트 실행...`);
        
        switch (testName) {
            case 'connection':
                await this.testSupabaseConnection();
                break;
            case 'migration':
                await this.testDataMigration();
                break;
            case 'crud':
                await this.testCRUDOperations();
                break;
            case 'realtime':
                await this.testRealtimeSync();
                break;
            case 'offline':
                await this.testOfflineSupport();
                break;
            case 'consistency':
                await this.testDataConsistency();
                break;
            default:
                console.error('❌ 알 수 없는 테스트:', testName);
                return;
        }
        
        this.printTestResults();
    }

    /**
     * 테스트 상태 확인
     */
    getTestStatus() {
        return {
            isRunning: this.isRunning,
            results: this.testResults,
            lastTest: localStorage.getItem('supabase_test_results')
        };
    }
}

// 전역 인스턴스 생성
window.supabaseIntegrationTest = new SupabaseIntegrationTest();

// 편의 함수들
window.testSupabaseIntegration = () => window.supabaseIntegrationTest.runAllTests();
window.testSupabaseConnection = () => window.supabaseIntegrationTest.runSpecificTest('connection');
window.testSupabaseMigration = () => window.supabaseIntegrationTest.runSpecificTest('migration');
window.testSupabaseCRUD = () => window.supabaseIntegrationTest.runSpecificTest('crud');
window.testSupabaseRealtime = () => window.supabaseIntegrationTest.runSpecificTest('realtime');
window.testSupabaseOffline = () => window.supabaseIntegrationTest.runSpecificTest('offline');
window.testSupabaseConsistency = () => window.supabaseIntegrationTest.runSpecificTest('consistency');

console.log('✅ Supabase 통합 테스트 시스템 로드 완료');
console.log('🧪 사용법: testSupabaseIntegration() - 전체 테스트 실행');
