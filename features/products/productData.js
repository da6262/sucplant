// 상품 데이터 관리 모듈
// features/products/productData.js

class ProductDataManager {
    constructor() {
        this.farm_products = [];
        this.categories = [];
        this.currentEditingProduct = null;
        this.productSortBy = 'newest'; // 기본값: 최근 등록순
    }

    // 상품 데이터 로드 (LocalStorage에서)
    async loadProducts() {
        try {
            console.log('상품 데이터 로드 시작...');
            
            // LocalStorage 폴백
            const key = getLocalStorageKey('farm_products');
            const data = localStorage.getItem(key);
            this.farm_products = data ? JSON.parse(data) : [];
            
            console.log(`LocalStorage에서 상품 ${this.farm_products.length}개 로드됨`);
            return this.farm_products;
            
        } catch (error) {
            console.error('상품 데이터 로드 실패:', error);
            this.farm_products = [];
            return [];
        }
    }

    // 카테고리 데이터 로드
    async loadCategories() {
        try {
            console.log('카테고리 데이터 로드 시작...');
            
            // LocalStorage 폴백
            const key = getLocalStorageKey('categories');
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

    // 상품 데이터 저장
    async saveProducts() {
        try {
            console.log('상품 데이터 저장 시작...');
            
            // LocalStorage 폴백
            const key = getLocalStorageKey('farm_products');
            localStorage.setItem(key, JSON.stringify(this.farm_products));
            console.log('LocalStorage에 상품 데이터 저장 완료');
            return true;
            
        } catch (error) {
            console.error('상품 데이터 저장 실패:', error);
            return false;
        }
    }

    // 카테고리 데이터 저장
    async saveCategories() {
        try {
            console.log('카테고리 데이터 저장 시작...');
            
            // LocalStorage 폴백
            const key = getLocalStorageKey('categories');
            localStorage.setItem(key, JSON.stringify(this.categories));
            console.log('LocalStorage에 카테고리 데이터 저장 완료');
            return true;
            
        } catch (error) {
            console.error('카테고리 데이터 저장 실패:', error);
            return false;
        }
    }

    // 새 상품 추가
    async addProduct(productData) {
        try {
            console.log('새 상품 추가:', productData);
            
            // 상품 데이터 검증
            if (!productData.name || !productData.price) {
                throw new Error('상품명과 판매가는 필수입니다.');
            }
            
            // 상품명 중복 확인
            const existingProduct = this.farm_products.find(p => p.name === productData.name);
            if (existingProduct) {
                throw new Error('이미 등록된 상품명입니다.');
            }
            
            // 새 상품 객체 생성
            const newProduct = {
                id: 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: productData.name.trim(),
                category: productData.category || '',
                size: productData.size || '',
                price: parseInt(productData.price) || 0,
                cost: parseInt(productData.cost) || 0,
                stock: parseInt(productData.stock) || 0,
                shipping_option: productData.shipping_option || '일반배송',
                description: productData.description || '',
                tags: productData.tags || [],
                image_url: productData.image_url || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 상품 목록에 추가
            this.farm_products.push(newProduct);
            
            // 데이터 저장
            await this.saveProducts();
            
            console.log('새 상품 추가 완료:', newProduct);
            return newProduct;
            
        } catch (error) {
            console.error('상품 추가 실패:', error);
            throw error;
        }
    }

    // 상품 정보 수정
    async updateProduct(productId, updateData) {
        try {
            console.log('상품 정보 수정:', productId, updateData);
            
            const productIndex = this.farm_products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                throw new Error('상품을 찾을 수 없습니다.');
            }
            
            // 상품명 중복 확인 (자신 제외)
            if (updateData.name) {
                const existingProduct = this.farm_products.find(p => p.name === updateData.name && p.id !== productId);
                if (existingProduct) {
                    throw new Error('이미 등록된 상품명입니다.');
                }
            }
            
            // 상품 정보 업데이트
            this.farm_products[productIndex] = {
                ...this.farm_products[productIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            // 데이터 저장
            await this.saveProducts();
            
            console.log('상품 정보 수정 완료');
            return this.farm_products[productIndex];
            
        } catch (error) {
            console.error('상품 정보 수정 실패:', error);
            throw error;
        }
    }

    // 상품 삭제
    async deleteProduct(productId) {
        try {
            console.log('상품 삭제:', productId);
            
            const productIndex = this.farm_products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                throw new Error('상품을 찾을 수 없습니다.');
            }
            
            // 상품 삭제
            const deletedProduct = this.farm_products.splice(productIndex, 1)[0];
            
            // 데이터 저장
            await this.saveProducts();
            
            console.log('상품 삭제 완료:', deletedProduct);
            return deletedProduct;
            
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            throw error;
        }
    }

    // 상품 검색
    searchProducts(query) {
        try {
            console.log('상품 검색:', query);
            
            if (!query || query.trim() === '') {
                return this.farm_products;
            }
            
            const searchTerm = query.toLowerCase().trim();
            const filteredProducts = this.farm_products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
            
            console.log(`검색 결과: ${filteredProducts.length}개 상품`);
            return filteredProducts;
            
        } catch (error) {
            console.error('상품 검색 실패:', error);
            return [];
        }
    }

    // 상품 정렬
    sortProducts(sortBy = 'newest') {
        try {
            console.log('상품 정렬:', sortBy);
            
            this.productSortBy = sortBy;
            
            const sortedProducts = [...this.farm_products].sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.created_at) - new Date(a.created_at);
                    case 'oldest':
                        return new Date(a.created_at) - new Date(b.created_at);
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    case 'name_desc':
                        return b.name.localeCompare(a.name);
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'stock_asc':
                        return a.stock - b.stock;
                    case 'stock_desc':
                        return b.stock - a.stock;
                    default:
                        return 0;
                }
            });
            
            console.log(`정렬 완료: ${sortedProducts.length}개 상품`);
            return sortedProducts;
            
        } catch (error) {
            console.error('상품 정렬 실패:', error);
            return this.farm_products;
        }
    }

    // 상품 ID로 조회
    getProductById(productId) {
        return this.farm_products.find(p => p.id === productId);
    }

    // 상품명으로 조회
    getProductByName(name) {
        return this.farm_products.find(p => p.name === name);
    }

    // 모든 상품 조회
    getAllProducts() {
        return this.farm_products;
    }

    // 모든 카테고리 조회
    getAllCategories() {
        return this.categories;
    }
}

// 인스턴스 생성
const productDataManager = new ProductDataManager();

// 전역 인스턴스 생성
window.productDataManager = productDataManager;

// 모듈 내보내기 (ES6 모듈 지원시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDataManager;
}

// ES6 모듈 export
export { productDataManager, ProductDataManager };
