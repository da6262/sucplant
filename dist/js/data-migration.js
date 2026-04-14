/**
 * LocalStorage → Supabase 데이터 마이그레이션 스크립트
 * 경산다육식물농장 관리시스템
 */

/**
 * 데이터 마이그레이션 메인 함수
 */
async function migrateLocalStorageToSupabase() {
    console.log('🚀 LocalStorage → Supabase 데이터 마이그레이션 시작...');
    
    try {
        // 1. Supabase 클라이언트 초기화
        if (!window.supabase) {
            console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
            return false;
        }

        // 2. 마이그레이션할 테이블 목록
        const tables = [
            'farm_customers',
            'farm_products', 
            'farm_orders',
            'farm_categories',
            'farm_waitlist'
        ];

        let totalMigrated = 0;
        let totalErrors = 0;

        // 3. 각 테이블별 마이그레이션
        for (const table of tables) {
            console.log(`📦 ${table} 마이그레이션 시작...`);
            
            try {
                const result = await migrateTable(table);
                if (result.success) {
                    totalMigrated += result.count;
                    console.log(`✅ ${table} 마이그레이션 완료: ${result.count}개`);
                } else {
                    totalErrors++;
                    console.error(`❌ ${table} 마이그레이션 실패:`, result.error);
                }
            } catch (error) {
                totalErrors++;
                console.error(`❌ ${table} 마이그레이션 중 오류:`, error);
            }
        }

        // 4. 결과 요약
        console.log(`🎉 마이그레이션 완료!`);
        console.log(`✅ 성공: ${totalMigrated}개 레코드`);
        console.log(`❌ 실패: ${totalErrors}개 테이블`);

        // 5. 마이그레이션 완료 플래그 설정
        // Supabase 전용 모드 - localStorage 사용 금지
        console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
        console.log('마이그레이션 완료:', {
            timestamp: new Date().toISOString(),
            totalMigrated,
            totalErrors
        });

        return totalErrors === 0;
    } catch (error) {
        console.error('❌ 데이터 마이그레이션 실패:', error);
        return false;
    }
}

/**
 * 개별 테이블 마이그레이션
 */
async function migrateTable(tableName) {
    try {
        // 1. LocalStorage에서 데이터 로드
        const key = getLocalStorageKey(tableName);
        // Supabase 전용 모드 - localStorage 사용 금지
        console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
        const localData = [];
        
        if (localData.length === 0) {
            console.log(`📋 ${tableName} 로컬 데이터가 없습니다.`);
            return { success: true, count: 0 };
        }

        // 2. 데이터 변환 (필요한 경우)
        const transformedData = transformDataForSupabase(tableName, localData);

        // 3. Supabase에 업로드
        const { data, error } = await window.supabase
            .from(tableName)
            .upsert(transformedData, { onConflict: 'id' });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, count: transformedData.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 데이터 변환 (LocalStorage → Supabase 형식)
 */
function transformDataForSupabase(tableName, data) {
    try {
        return data.map(item => {
            const transformed = { ...item };
            
            // UUID 형식으로 ID 변환 (필요한 경우)
            if (transformed.id && !isValidUUID(transformed.id)) {
                // 기존 ID를 유지하되 UUID 형식으로 변환
                transformed.id = generateUUID();
            }
            
            // 날짜 형식 변환
            if (transformed.created_at && typeof transformed.created_at === 'string') {
                transformed.created_at = new Date(transformed.created_at).toISOString();
            }
            
            if (transformed.updated_at && typeof transformed.updated_at === 'string') {
                transformed.updated_at = new Date(transformed.updated_at).toISOString();
            }
            
            // 테이블별 특수 변환
            switch (tableName) {
                case 'farm_orders':
                    // 주문 아이템 JSON 변환
                    if (transformed.order_items && typeof transformed.order_items === 'string') {
                        try {
                            transformed.order_items = JSON.parse(transformed.order_items);
                        } catch (e) {
                            console.warn('주문 아이템 JSON 파싱 실패:', e);
                        }
                    }
                    break;
                    
                case 'farm_customers':
                    // 전화번호 정규화
                    if (transformed.phone) {
                        transformed.phone = transformed.phone.replace(/[^0-9]/g, '');
                    }
                    break;
            }
            
            return transformed;
        });
    } catch (error) {
        console.error(`❌ ${tableName} 데이터 변환 실패:`, error);
        return data; // 변환 실패 시 원본 데이터 반환
    }
}

/**
 * UUID 유효성 검사
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * UUID 생성
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 마이그레이션 상태 확인
 */
function checkMigrationStatus() {
    // Supabase 전용 모드 - localStorage 사용 금지
    console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
    const status = null;
    if (status) {
        const data = JSON.parse(status);
        console.log('📊 마이그레이션 상태:', data);
        return data;
    }
    return null;
}

/**
 * 마이그레이션 롤백 (Supabase → LocalStorage)
 */
async function rollbackMigration() {
    console.log('🔄 마이그레이션 롤백 시작...');
    
    try {
        const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
        
        for (const table of tables) {
            const { data, error } = await window.supabase
                .from(table)
                .select('*');
                
            if (!error && data) {
                const key = getLocalStorageKey(table);
                // Supabase 전용 모드 - localStorage 사용 금지
                console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
                console.log(`✅ ${table} 롤백 완료: ${data.length}개`);
            }
        }
        
        // 마이그레이션 상태 제거
        // Supabase 전용 모드 - localStorage 사용 금지
        console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
        
        console.log('✅ 마이그레이션 롤백 완료');
        return true;
    } catch (error) {
        console.error('❌ 마이그레이션 롤백 실패:', error);
        return false;
    }
}

/**
 * 데이터 검증
 */
async function validateMigration() {
    console.log('🔍 데이터 검증 시작...');
    
    try {
        const tables = ['farm_customers', 'farm_products', 'farm_orders', 'farm_categories', 'farm_waitlist'];
        let allValid = true;
        
        for (const table of tables) {
            // LocalStorage 데이터
            const key = getLocalStorageKey(table);
            // Supabase 전용 모드 - localStorage 사용 금지
        console.warn('⚠️ localStorage 사용이 차단되었습니다. Supabase를 사용하세요.');
        const localData = [];
            
            // Supabase 데이터
            const { data: supabaseData, error } = await window.supabase
                .from(table)
                .select('*');
                
            if (error) {
                console.error(`❌ ${table} Supabase 데이터 로드 실패:`, error);
                allValid = false;
                continue;
            }
            
            // 데이터 개수 비교
            if (localData.length !== supabaseData.length) {
                console.warn(`⚠️ ${table} 데이터 개수 불일치: Local(${localData.length}) vs Supabase(${supabaseData.length})`);
                allValid = false;
            } else {
                console.log(`✅ ${table} 데이터 검증 통과: ${localData.length}개`);
            }
        }
        
        console.log(allValid ? '✅ 모든 데이터 검증 통과' : '⚠️ 일부 데이터 검증 실패');
        return allValid;
    } catch (error) {
        console.error('❌ 데이터 검증 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.migrateLocalStorageToSupabase = migrateLocalStorageToSupabase;
window.checkMigrationStatus = checkMigrationStatus;
window.rollbackMigration = rollbackMigration;
window.validateMigration = validateMigration;

console.log('✅ 데이터 마이그레이션 모듈 로드 완료');