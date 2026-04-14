// 카테고리 데이터 관리 모듈
// features/categories/categoryData.js

class CategoryDataManager {
    constructor() {
        this.categories = [];
        // 데이터 초기화는 지연됨
    }
    
    // 데이터 초기화
    async initializeData() {
        try {
            console.log('🔄 CategoryDataManager 초기화 시작...');
            
            // Supabase 클라이언트 초기화 대기
            await this.ensureSupabaseClient();
            
            await this.loadCategories();
            
            // 카테고리가 없으면 기본 카테고리 생성
            if (this.categories.length === 0) {
                console.log('📝 기본 카테고리 생성 중...');
                await this.createDefaultCategories();
            }
            
            console.log('✅ CategoryDataManager 초기화 완료');
            console.log(`📊 로드된 카테고리 수: ${this.categories.length}`);
        } catch (error) {
            console.error('❌ CategoryDataManager 초기화 실패:', error);
        }
    }
    
    // Supabase 클라이언트 확인 및 초기화
    async ensureSupabaseClient() {
        try {
            // 이미 초기화된 클라이언트가 있는지 확인
            if (window.supabaseClient) {
                console.log('✅ Supabase 클라이언트 이미 초기화됨');
                return true;
            }
            
            // window.supabase가 있는지 확인하고 클라이언트 생성
            if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
                console.log('🔄 Supabase 클라이언트 초기화 시도...');
                window.supabaseClient = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('✅ Supabase 클라이언트 초기화 완료');
                return true;
            }
            
            // Supabase가 로드될 때까지 대기
            console.log('⏳ Supabase 라이브러리 로드 대기 중...');
            let retryCount = 0;
            const maxRetries = 20;
            
            while (retryCount < maxRetries) {
                if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
                    window.supabaseClient = window.supabase.createClient(
                        window.SUPABASE_CONFIG.url,
                        window.SUPABASE_CONFIG.anonKey
                    );
                    console.log('✅ Supabase 클라이언트 초기화 완료 (대기 후)');
                    return true;
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                retryCount++;
            }
            
            console.error('❌ Supabase 클라이언트 초기화 실패 - 최대 재시도 횟수 초과');
            throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
        } catch (error) {
            console.error('❌ Supabase 클라이언트 초기화 실패:', error);
            throw error;
        }
    }
    
    // 기본 카테고리 생성
    async createDefaultCategories() {
        try {
            console.log('📝 기본 카테고리 생성 시작...');
            
            const defaultCategories = [
                {
                    name: '다육식물',
                    color: 'green',
                    description: '다양한 다육식물',
                    sort_order: 1
                },
                {
                    name: '화분',
                    color: 'brown',
                    description: '식물 화분 및 용기',
                    sort_order: 2
                },
                {
                    name: '용품',
                    color: 'blue',
                    description: '식물 관리 용품',
                    sort_order: 3
                },
                {
                    name: '기타',
                    color: 'gray',
                    description: '기타 상품',
                    sort_order: 4
                }
            ];
            
            for (const categoryData of defaultCategories) {
                await this.addCategory(categoryData);
            }
            
            console.log('✅ 기본 카테고리 생성 완료');
        } catch (error) {
            console.error('❌ 기본 카테고리 생성 실패:', error);
        }
    }

    // 카테고리 데이터 로드 (Supabase 전용)
    async loadCategories() {
        try {
            console.log('카테고리 데이터 로드 시작...');
            
            // Supabase에서만 로드
            if (!window.supabase) {
                console.warn('⚠️ Supabase 클라이언트가 없습니다. 로컬 모드로 전환합니다.');
                // 로컬 데이터 로드 시도
                return this.loadFromLocalStorage();
            }
            
            console.log('☁️ Supabase에서 카테고리 데이터 로드 중...');
            const { data, error } = await window.supabase
                .from('farm_categories')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(`Supabase 로드 실패: ${error.message}`);
            }
            
            this.categories = data || [];
            console.log(`✅ Supabase에서 카테고리 ${this.categories.length}개 로드됨`);
            
            return this.categories;
            
        } catch (error) {
            console.error('❌ 카테고리 데이터 로드 실패:', error);
            this.categories = [];
            throw error;
        }
    }

    // Supabase 전용 - localStorage 사용 완전 제거됨
    async loadFromLocalStorage() {
        console.error('❌ localStorage 사용이 완전히 제거되었습니다. Supabase를 사용하세요.');
        throw new Error('localStorage는 더 이상 지원되지 않습니다. Supabase를 사용하세요.');
    }

    // Supabase 전용 - localStorage 저장 완전 제거됨
    async saveToLocalStorage() {
        console.error('❌ localStorage 사용이 완전히 제거되었습니다. Supabase를 사용하세요.');
        throw new Error('localStorage는 더 이상 지원되지 않습니다. Supabase를 사용하세요.');
    }

    /**
     * 카테고리 캐시 무효화
     * Service Worker의 캐시를 삭제하여 최신 데이터를 가져오도록 함
     */
    async invalidateCategoryCache() {
        try {
            console.log('🗑️ 카테고리 캐시 무효화 시작...');
            
            // Service Worker가 있는 경우에만 실행
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // 캐시 API를 직접 사용하여 Supabase 카테고리 관련 캐시 삭제
                const cacheNames = await caches.keys();
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    for (const request of requests) {
                        // Supabase farm_categories 관련 캐시만 삭제
                        if (request.url.includes('supabase.co') && request.url.includes('farm_categories')) {
                            await cache.delete(request);
                            console.log('🗑️ 캐시 삭제됨:', request.url);
                        }
                    }
                }
                
                console.log('✅ 카테고리 캐시 무효화 완료');
            } else {
                console.log('ℹ️ Service Worker가 없습니다. 캐시 무효화 생략');
            }
        } catch (error) {
            console.error('❌ 캐시 무효화 실패:', error);
            // 캐시 무효화 실패는 치명적이지 않으므로 에러를 던지지 않음
        }
    }

    // 카테고리 데이터 저장 (Supabase 전용)
    async saveCategories() {
        try {
            console.log('카테고리 데이터 저장 시작...');
            
            // Supabase에만 저장
            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            console.log('☁️ Supabase에 카테고리 데이터 저장 중...');
            
            // 새 데이터만 삽입 (기존 데이터는 유지)
            if (this.categories.length > 0) {
                const { data, error } = await window.supabase
                    .from('farm_categories')
                    .insert(this.categories)
                    .select();
                
                if (error) {
                    throw new Error(`Supabase 저장 실패: ${error.message}`);
                }
                
                console.log('✅ Supabase에 카테고리 데이터 저장 완료:', data);
            } else {
                console.log('📝 저장할 카테고리 데이터가 없습니다');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ 카테고리 데이터 저장 실패:', error);
            throw error;
        }
    }

    // 새 카테고리 추가
    async addCategory(categoryData) {
        try {
            console.log('새 카테고리 추가:', categoryData);
            
            // 카테고리 데이터 검증
            if (!categoryData.name || !categoryData.name.trim()) {
                throw new Error('카테고리명은 필수입니다.');
            }
            
            // 중복 체크
            const existingCategory = this.categories.find(
                c => c.name.toLowerCase() === categoryData.name.trim().toLowerCase()
            );
            if (existingCategory) {
                throw new Error(`'${categoryData.name}' 카테고리는 이미 존재합니다.`);
            }
            
            // 색상 값 길이 제한 (VARCHAR(20) 제한)
            let colorValue = categoryData.color || 'gray';
            if (colorValue.length > 20) {
                // 긴 색상 값은 기본값으로 대체
                colorValue = 'gray';
            }
            
            // 새 카테고리 객체 생성 (Supabase가 자동으로 UUID 생성)
            const newCategory = {
                name: categoryData.name.trim(),
                color: colorValue,
                description: categoryData.description || '',
                sort_order: this.categories.length + 1
            };
            
            // Supabase에 직접 저장 (일관된 변수명 사용)
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }
            
            console.log('Supabase에 카테고리 저장 시도:', newCategory);
            
            const { data, error } = await window.supabase
                .from('farm_categories')
                .insert([newCategory])
                .select();
            
            if (error) {
                console.error('Supabase 저장 에러 상세:', error);
                throw new Error(`Supabase 저장 실패: ${error.message}`);
            }
            
            if (!data || data.length === 0) {
                throw new Error('Supabase에서 데이터가 반환되지 않았습니다.');
            }
            
            // 로컬 배열에도 추가
            this.categories.push(data[0]);
            
            // 캐시 무효화
            await this.invalidateCategoryCache();
            
            console.log('✅ 새 카테고리 추가 완료:', data[0]);
            console.log('현재 카테고리 목록:', this.categories);
            return data[0];
            
        } catch (error) {
            console.error('❌ 카테고리 추가 실패:', error);
            throw error;
        }
    }

    // 카테고리 정보 수정
    async updateCategory(categoryId, updateData) {
        try {
            console.log('카테고리 정보 수정:', categoryId, updateData);
            
            // 중복 체크 (이름 변경 시)
            if (updateData.name) {
                const existingCategory = this.categories.find(
                    c => c.id !== categoryId && c.name.toLowerCase() === updateData.name.trim().toLowerCase()
                );
                if (existingCategory) {
                    throw new Error(`'${updateData.name}' 카테고리는 이미 존재합니다.`);
                }
            }
            
            // Supabase에서 직접 수정 (일관된 변수명 사용)
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }
            
            const { data, error } = await window.supabase
                .from('farm_categories')
                .update(updateData)
                .eq('id', categoryId)
                .select();
            
            if (error) {
                throw new Error(`Supabase 수정 실패: ${error.message}`);
            }
            
            // 로컬 배열도 업데이트
            const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex !== -1) {
                this.categories[categoryIndex] = data[0];
            }
            
            // 캐시 무효화
            await this.invalidateCategoryCache();
            
            console.log('✅ 카테고리 정보 수정 완료');
            return data[0];
            
        } catch (error) {
            console.error('❌ 카테고리 수정 실패:', error);
            throw error;
        }
    }

    // 카테고리 삭제
    async deleteCategory(categoryId) {
        try {
            console.log('카테고리 삭제:', categoryId);
            
            // Supabase에서 직접 삭제 (일관된 변수명 사용)
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }
            
            const { error } = await window.supabase
                .from('farm_categories')
                .delete()
                .eq('id', categoryId);
            
            if (error) {
                throw new Error(`Supabase 삭제 실패: ${error.message}`);
            }
            
            // 로컬 배열에서도 제거
            const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex !== -1) {
                this.categories.splice(categoryIndex, 1);
            }
            
            // 캐시 무효화
            await this.invalidateCategoryCache();
            
            console.log('✅ 카테고리 삭제 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 카테고리 삭제 실패:', error);
            throw error;
        }
    }

    // 모든 카테고리 조회
    getAllCategories() {
        return this.categories;
    }

    // ID로 카테고리 조회
    getCategoryById(categoryId) {
        return this.categories.find(c => c.id === categoryId);
    }

    // 이름으로 카테고리 조회
    getCategoryByName(name) {
        return this.categories.find(c => c.name === name);
    }

    // Supabase 전용 - localStorage 제거됨
}

// 카테고리 데이터 매니저 인스턴스 생성 (지연 초기화)
let categoryDataManager = null;

// 전역 인스턴스 생성 함수
async function initializeCategoryDataManager() {
    if (!categoryDataManager) {
        categoryDataManager = new CategoryDataManager();
        window.categoryDataManager = categoryDataManager;
        console.log('✅ CategoryDataManager 전역 인스턴스 생성 완료');
        
        // 데이터 초기화
        await categoryDataManager.initializeData();
    }
    return categoryDataManager;
}

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeCategoryDataManager();
    } catch (error) {
        console.error('❌ CategoryDataManager 초기화 실패:', error);
    }
});

// 즉시 사용 가능한 경우를 위한 폴백
if (document.readyState === 'loading') {
    // 문서가 아직 로딩 중이면 위의 이벤트 리스너가 처리
} else {
    // 문서가 이미 로드된 경우 즉시 초기화
    initializeCategoryDataManager().catch(error => {
        console.error('❌ CategoryDataManager 즉시 초기화 실패:', error);
    });
}

// 전역으로 내보내기
export { CategoryDataManager, initializeCategoryDataManager };















