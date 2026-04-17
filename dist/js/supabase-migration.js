/**
 * LocalStorage → Supabase 데이터 마이그레이션
 * 기존 주문 데이터를 클라우드로 옮기는 기능
 */

class SupabaseMigration {
    constructor() {
        this.migratedCount = 0;
        this.errorCount = 0;
    }

    // LocalStorage에서 모든 데이터 추출
    extractLocalData() {
        console.log('📦 LocalStorage에서 데이터 추출 중...');
        
        const localData = {
            customers: JSON.parse(localStorage.getItem('farm_customers') || localStorage.getItem('customers') || '[]'),
            orders: JSON.parse(localStorage.getItem('farm_orders') || localStorage.getItem('orders') || '[]'),
            products: JSON.parse(localStorage.getItem('farm_products') || localStorage.getItem('products') || '[]'),
            categories: JSON.parse(localStorage.getItem('farm_categories') || localStorage.getItem('categories') || '[]'),
            waitlist: JSON.parse(localStorage.getItem('farm_waitlist') || localStorage.getItem('waitlist') || '[]'),
            channels: JSON.parse(localStorage.getItem('farm_channels') || localStorage.getItem('channels') || '[]'),
            orderStatuses: JSON.parse(localStorage.getItem('farm_order_statuses') || localStorage.getItem('orderStatuses') || '[]')
        };

        console.log('📊 추출된 데이터:');
        Object.keys(localData).forEach(key => {
            console.log(`  ${key}: ${localData[key].length}개`);
        });

        return localData;
    }

    // Supabase에 데이터 업로드
    async uploadToSupabase(tableName, data) {
        if (!data || data.length === 0) {
            console.log(`⚠️ ${tableName}: 업로드할 데이터가 없습니다`);
            return { success: 0, error: 0 };
        }

        console.log(`📤 ${tableName} 업로드 시작: ${data.length}개`);

        let successCount = 0;
        let errorCount = 0;

        try {
            // Supabase API URL
            const supabaseUrl = window.SUPABASE_CONFIG?.url;
            const supabaseKey = window.SUPABASE_CONFIG?.anonKey;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase 설정이 완료되지 않았습니다');
            }

            // 배치로 업로드 (한 번에 100개씩)
            const batchSize = 100;
            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                
                const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(batch)
                });

                if (response.ok) {
                    successCount += batch.length;
                    console.log(`✅ ${tableName} 배치 ${Math.floor(i/batchSize) + 1} 완료: ${batch.length}개`);
                } else {
                    const errorText = await response.text();
                    console.error(`❌ ${tableName} 배치 ${Math.floor(i/batchSize) + 1} 실패:`, response.status, errorText);
                    errorCount += batch.length;
                }

                // API 호출 제한을 위한 지연
                await new Promise(resolve => setTimeout(resolve, 100));
            }

        } catch (error) {
            console.error(`❌ ${tableName} 업로드 실패:`, error);
            errorCount += data.length;
        }

        return { success: successCount, error: errorCount };
    }

    // 전체 마이그레이션 실행
    async migrateAll() {
        try {
            console.log('🚀 === Supabase 마이그레이션 시작 ===');
            
            // Supabase 연결 확인
            if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url) {
                throw new Error('Supabase 설정이 완료되지 않았습니다. 먼저 Supabase 프로젝트를 생성하고 설정해주세요.');
            }

            // 1단계: LocalStorage에서 데이터 추출
            const localData = this.extractLocalData();
            
            // 2단계: 각 테이블별로 업로드
            const results = {};
            
            // 고객 데이터
            if (localData.customers.length > 0) {
                results.customers = await this.uploadToSupabase('farm_customers', localData.customers);
            }
            
            // 주문 데이터
            if (localData.orders.length > 0) {
                results.orders = await this.uploadToSupabase('farm_orders', localData.orders);
            }
            
            // 상품 데이터
            if (localData.products.length > 0) {
                results.products = await this.uploadToSupabase('farm_products', localData.products);
            }
            
            // 카테고리 데이터
            if (localData.categories.length > 0) {
                results.categories = await this.uploadToSupabase('farm_categories', localData.categories);
            }
            
            // 대기자 데이터
            if (localData.waitlist.length > 0) {
                results.waitlist = await this.uploadToSupabase('farm_waitlist', localData.waitlist);
            }
            
            // 판매 채널 데이터
            if (localData.channels.length > 0) {
                results.channels = await this.uploadToSupabase('farm_channels', localData.channels);
            }
            
            // 주문 상태 데이터
            if (localData.orderStatuses.length > 0) {
                results.orderStatuses = await this.uploadToSupabase('farm_order_statuses', localData.orderStatuses);
            }

            // 3단계: 결과 요약
            this.printMigrationResults(results);
            
            console.log('🎉 Supabase 마이그레이션 완료!');
            alert('🎉 데이터 마이그레이션 완료!\n이제 모든 데이터가 클라우드에 저장됩니다.');
            
            return true;
            
        } catch (error) {
            console.error('❌ 마이그레이션 실패:', error);
            alert(`❌ 마이그레이션 실패: ${error.message}`);
            return false;
        }
    }

    // 마이그레이션 결과 출력
    printMigrationResults(results) {
        console.log('📊 === 마이그레이션 결과 ===');
        
        let totalSuccess = 0;
        let totalError = 0;
        
        Object.keys(results).forEach(table => {
            const result = results[table];
            totalSuccess += result.success;
            totalError += result.error;
            
            console.log(`${table}:`);
            console.log(`  ✅ 성공: ${result.success}개`);
            console.log(`  ❌ 실패: ${result.error}개`);
        });
        
        console.log(`📈 총계:`);
        console.log(`  ✅ 성공: ${totalSuccess}개`);
        console.log(`  ❌ 실패: ${totalError}개`);
        
        if (totalError > 0) {
            console.warn('⚠️ 일부 데이터 업로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        }
    }

    // LocalStorage 데이터 백업
    backupLocalData() {
        console.log('💾 LocalStorage 데이터 백업 중...');
        
        const backupData = this.extractLocalData();
        const backupString = JSON.stringify(backupData, null, 2);
        
        // 파일로 다운로드
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `경산다육농장_데이터백업_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ 데이터 백업 완료');
        alert('✅ 데이터 백업 완료!\n백업 파일이 다운로드되었습니다.');
    }
}

// 전역에서 사용할 수 있도록 등록
window.supabaseMigration = new SupabaseMigration();

// 편의 함수들
window.migrateToSupabase = () => window.supabaseMigration.migrateAll();
window.backupLocalData = () => window.supabaseMigration.backupLocalData();





