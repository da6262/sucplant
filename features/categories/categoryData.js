// 카테고리 데이터 관리 모듈
// features/categories/categoryData.js

class CategoryDataManager {
    constructor() {
        this.categories = [];
        this.loadCategories();
    }

    // 카테고리 데이터 로드
    async loadCategories() {
        try {
            console.log('카테고리 데이터 로드 시작...');
            
            // LocalStorage에서 카테고리 데이터 로드
            const key = this.getLocalStorageKey('categories');
            const data = localStorage.getItem(key);
            this.categories = data ? JSON.parse(data) : [];
            
            console.log(`LocalStorage에서 카테고리 ${this.categories.length}개 로드됨`);
            return this.categories;
            
        } catch (error) {
            console.error('카테고리 데이터 로드 실패:', error);
            this.categories = [];
            return [];
        }
    }

    // 카테고리 데이터 저장
    async saveCategories() {
        try {
            console.log('카테고리 데이터 저장 시작...');
            
            // LocalStorage에 카테고리 데이터 저장
            const key = this.getLocalStorageKey('categories');
            localStorage.setItem(key, JSON.stringify(this.categories));
            console.log('LocalStorage에 카테고리 데이터 저장 완료');
            return true;
            
        } catch (error) {
            console.error('카테고리 데이터 저장 실패:', error);
            return false;
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
            
            // 카테고리명 중복 확인
            const existingCategory = this.categories.find(c => c.name === categoryData.name.trim());
            if (existingCategory) {
                throw new Error('이미 등록된 카테고리명입니다.');
            }
            
            // 새 카테고리 객체 생성
            const newCategory = {
                id: 'category_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: categoryData.name.trim(),
                color: categoryData.color || 'bg-gray-100 text-gray-800',
                description: categoryData.description || '',
                sort_order: this.categories.length + 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 카테고리 배열에 추가
            this.categories.push(newCategory);
            
            // 데이터 저장
            await this.saveCategories();
            
            console.log('새 카테고리 추가 완료:', newCategory);
            return newCategory;
            
        } catch (error) {
            console.error('카테고리 추가 실패:', error);
            throw error;
        }
    }

    // 카테고리 정보 수정
    async updateCategory(categoryId, updateData) {
        try {
            console.log('카테고리 정보 수정:', categoryId, updateData);
            
            const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex === -1) {
                throw new Error('카테고리를 찾을 수 없습니다.');
            }
            
            // 카테고리명 중복 확인 (자신 제외)
            if (updateData.name) {
                const existingCategory = this.categories.find(c => c.name === updateData.name.trim() && c.id !== categoryId);
                if (existingCategory) {
                    throw new Error('이미 등록된 카테고리명입니다.');
                }
            }
            
            // 카테고리 정보 업데이트
            this.categories[categoryIndex] = {
                ...this.categories[categoryIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            // 데이터 저장
            await this.saveCategories();
            
            console.log('카테고리 정보 수정 완료');
            return this.categories[categoryIndex];
            
        } catch (error) {
            console.error('카테고리 수정 실패:', error);
            throw error;
        }
    }

    // 카테고리 삭제
    async deleteCategory(categoryId) {
        try {
            console.log('카테고리 삭제:', categoryId);
            
            const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex === -1) {
                throw new Error('카테고리를 찾을 수 없습니다.');
            }
            
            // 카테고리 배열에서 제거
            this.categories.splice(categoryIndex, 1);
            
            // 데이터 저장
            await this.saveCategories();
            
            console.log('카테고리 삭제 완료');
            return true;
            
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
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

    // LocalStorage 키 생성
    getLocalStorageKey(key) {
        return `sucplant_${key}`;
    }
}

// 카테고리 데이터 매니저 인스턴스 생성
const categoryDataManager = new CategoryDataManager();

// 전역으로 내보내기
export { categoryDataManager, CategoryDataManager };


