// 상품 데이터 관리 모듈
// features/products/productData.js

// LocalStorage 키 생성 함수
function getLocalStorageKey(key) {
    return `sucplant_${key}`;
}

class ProductDataManager {
    constructor() {
        this.farm_products = [];
        this.categories = [];
        this.currentEditingProduct = null;
        this.productSortBy = 'newest'; // 기본값: 최근 등록순
        
        // 데이터 로드 (비동기)
        this.initializeData();
    }
    
    // 데이터 초기화
    async initializeData() {
        try {
            console.log('🔄 ProductDataManager 초기화 시작...');
            
            // Supabase 클라이언트 초기화 시도
            const supabaseInitialized = await this.ensureSupabaseClient();
            
            if (supabaseInitialized) {
                console.log('🌐 Supabase 모드로 데이터 로드...');
                await this.loadProducts();
                await this.loadCategories();
            } else {
                throw new Error('❌ Supabase 초기화 실패. Supabase 연결이 필요합니다.');
            }
            
            // 카테고리가 없으면 기본 카테고리 생성
            if (this.categories.length === 0) {
                console.log('📝 기본 카테고리 생성 중...');
                await this.createDefaultCategories();
            }
            
            console.log('✅ ProductDataManager 초기화 완료');
            console.log(`📊 로드된 상품 수: ${this.farm_products.length}`);
            console.log(`📊 로드된 카테고리 수: ${this.categories.length}`);
        } catch (error) {
            console.error('❌ ProductDataManager 초기화 실패:', error);
            // 최종 폴백: 빈 데이터로 초기화
            this.farm_products = [];
            this.categories = [];
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
            const maxRetries = 20; // 재시도 횟수 조정
            
            while (retryCount < maxRetries) {
                // Supabase 라이브러리와 설정이 모두 있는지 확인
                if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
                    try {
                        window.supabaseClient = window.supabase.createClient(
                            window.SUPABASE_CONFIG.url,
                            window.SUPABASE_CONFIG.anonKey
                        );
                        console.log('✅ Supabase 클라이언트 초기화 완료 (대기 후)');
                        return true;
                    } catch (initError) {
                        console.warn('⚠️ Supabase 클라이언트 생성 실패, 재시도 중...', initError);
                    }
                }
                
                // 더 자세한 디버깅 정보
                console.log(`🔄 재시도 ${retryCount + 1}/${maxRetries}:`, {
                    'window.supabase': typeof window.supabase,
                    'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG,
                    'window.supabaseClient': !!window.supabaseClient
                });
                
                await new Promise(resolve => setTimeout(resolve, 500)); // 대기 시간 조정
                retryCount++;
            }
            
            console.error('❌ Supabase 클라이언트 초기화 실패 - 최대 재시도 횟수 초과');
            console.error('🔍 최종 상태:', {
                'window.supabase': typeof window.supabase,
                'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG,
                'window.supabaseClient': !!window.supabaseClient
            });
            
            // Supabase 전용 모드 - 로컬 폴백 제거
            console.error('❌ Supabase 연결 실패. Supabase 연결이 필요합니다.');
            return false;
        } catch (error) {
            console.error('❌ Supabase 클라이언트 초기화 실패:', error);
            // Supabase 전용 모드 - 로컬 폴백 제거
            console.error('❌ Supabase 연결 실패. Supabase 연결이 필요합니다.');
            return false;
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

    // 상품 데이터 로드 (Supabase 우선, 폴백으로 로컬)
    async loadProducts() {
        try {
            console.log('상품 데이터 로드 시작...');
            
            // Supabase 연결 상태 디버깅
            console.log('🔍 Supabase 연결 상태 확인:');
            console.log('- window.supabaseClient:', typeof window.supabaseClient);
            console.log('- window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
            
            // Supabase에서만 로드 (로컬 모드 완전 제거)
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다. Supabase 연결이 필요합니다.');
            }
            
            console.log('🌐 Supabase에서 상품 데이터 로드 중...');
            
            const { data: products, error } = await window.supabaseClient
                .from('farm_products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(`❌ Supabase 로드 실패: ${error.message}`);
            }
            
            this.farm_products = products || [];
            console.log('🔍 Supabase에서 받은 원본 데이터:', products?.length || 0, '개');
            
            // UUID가 아닌 ID를 UUID로 변환
            this.farm_products = this.farm_products.map(product => {
                if (!product.id || !product.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    product.id = crypto.randomUUID();
                }
                return product;
            });
            
            console.log(`✅ Supabase에서 상품 ${this.farm_products.length}개 로드됨`);
            console.log('🔍 로드된 상품 목록 (처음 3개):', 
                this.farm_products.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
            
            return this.farm_products;
            
        } catch (error) {
            console.error('상품 데이터 로드 실패:', error);
            throw new Error(`❌ 상품 데이터 로드 실패: ${error.message}`);
        }
    }

    // Supabase 전용 - localStorage 사용 제거됨
    async loadFromLocalStorage() {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
        this.farm_products = [];
        return [];
    }

    // Supabase 전용 - localStorage 사용 제거됨
    async loadCategoriesFromLocalStorage() {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
        this.categories = [];
        return [];
    }


    // 카테고리 데이터 로드 (Supabase 전용)
    async loadCategories() {
        try {
            console.log('카테고리 데이터 로드 시작...');
            
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다. Supabase 연결이 필요합니다.');
            }
            
            console.log('🌐 Supabase에서 카테고리 데이터 로드 중...');
            
            const { data: categories, error } = await window.supabaseClient
                .from('farm_categories')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) {
                throw new Error(`❌ Supabase 로드 실패: ${error.message}`);
            }
            
            this.categories = categories || [];
            
            // UUID가 아닌 ID를 UUID로 변환
            this.categories = this.categories.map(category => {
                if (!category.id || !category.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    category.id = crypto.randomUUID();
                }
                return category;
            });
            
            console.log(`✅ Supabase에서 카테고리 ${this.categories.length}개 로드됨`);
            return this.categories;
            
        } catch (error) {
            console.error('❌ 카테고리 데이터 로드 실패:', error);
            throw new Error(`❌ 카테고리 데이터 로드 실패: ${error.message}`);
        }
    }

    // 상품 데이터 저장 (Supabase 우선, 폴백으로 로컬)
    async saveProducts() {
        try {
            console.log('상품 데이터 저장 시작...');
            
            // Supabase에만 저장 (로컬 모드 완전 제거)
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다. Supabase 연결이 필요합니다.');
            }
            
            console.log('🌐 Supabase에 상품 데이터 저장 중...');
            
            // 데이터 정리 (누락된 컬럼 처리)
            const cleanedProducts = this.farm_products.map(product => {
                // UUID가 아닌 ID를 UUID로 변환
                let productId = product.id;
                if (!productId || !productId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    productId = crypto.randomUUID();
                }
                
                return {
                    id: productId,
                    product_code: product.product_code || this.generateProductCode(product.name),
                    name: product.name,
                    price: product.price,
                    cost: product.cost || 0,
                    description: product.description || '',
                    category: product.category || '',
                    size: product.size || '',
                    stock: product.stock || 0,
                    image_url: product.image_url || '',
                    tags: product.tags || '',
                    shipping_option: product.shipping_option || 'normal',
                    shipping: product.shipping || product.shipping_option || 'normal',
                    status: product.status || 'active',
                    profit_margin: product.profit_margin || 0,
                    created_at: product.created_at || new Date().toISOString(),
                    updated_at: product.updated_at || new Date().toISOString()
                };
            });
            
            // Upsert 방식으로 데이터 저장 (기존 데이터 업데이트, 새 데이터 삽입)
            const { error: upsertError } = await window.supabaseClient
                .from('farm_products')
                .upsert(cleanedProducts, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                });
            
            if (upsertError) {
                throw new Error(`❌ Supabase 저장 실패: ${upsertError.message}`);
            }
            
            console.log('✅ Supabase에 상품 데이터 저장 완료');
            
            // 캐시 무효화 (Service Worker가 최신 데이터를 가져오도록)
            await this.invalidateProductCache();
            
            return true;
            
        } catch (error) {
            console.error('❌ 상품 데이터 저장 실패:', error);
            throw new Error(`❌ 상품 데이터 저장 실패: ${error.message}`);
        }
    }

    // Supabase 전용 - localStorage 사용 완전 제거됨
    async saveToLocalStorage() {
        console.error('❌ localStorage 사용이 완전히 제거되었습니다. Supabase를 사용하세요.');
        throw new Error('localStorage는 더 이상 지원되지 않습니다. Supabase를 사용하세요.');
    }

    /**
     * 상품 캐시 무효화
     * Service Worker의 캐시를 삭제하여 최신 데이터를 가져오도록 함
     */
    async invalidateProductCache() {
        try {
            console.log('🗑️ 상품 캐시 무효화 시작...');
            
            // Service Worker가 있는 경우에만 실행
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // 캐시 API를 직접 사용하여 Supabase 상품 관련 캐시 삭제
                const cacheNames = await caches.keys();
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    for (const request of requests) {
                        // Supabase farm_products 관련 캐시만 삭제
                        if (request.url.includes('supabase.co') && request.url.includes('farm_products')) {
                            await cache.delete(request);
                            console.log('🗑️ 캐시 삭제됨:', request.url);
                        }
                    }
                }
                
                console.log('✅ 상품 캐시 무효화 완료');
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
            
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다. Supabase 연결이 필요합니다.');
            }
            
            console.log('🌐 Supabase에 카테고리 데이터 저장 중...');
            
            // 데이터 정리 (누락된 컬럼 처리)
            const cleanedCategories = this.categories.map(category => {
                // UUID가 아닌 ID를 UUID로 변환
                let categoryId = category.id;
                if (!categoryId || !categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    categoryId = crypto.randomUUID();
                }
                
                return {
                    id: categoryId,
                    name: category.name,
                    color: category.color || 'blue',
                    description: category.description || '',
                    sort_order: category.sort_order || 0,
                    created_at: category.created_at || new Date().toISOString(),
                    updated_at: category.updated_at || new Date().toISOString()
                };
            });
            
            // Upsert 방식으로 데이터 저장 (기존 데이터 업데이트, 새 데이터 삽입)
            const { error: upsertError } = await window.supabaseClient
                .from('farm_categories')
                .upsert(cleanedCategories, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                });
            
            if (upsertError) {
                throw new Error(`❌ Supabase 저장 실패: ${upsertError.message}`);
            }
            
            console.log('✅ Supabase에 카테고리 데이터 저장 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 카테고리 데이터 저장 실패:', error);
            throw new Error(`❌ 카테고리 데이터 저장 실패: ${error.message}`);
        }
    }

    // 로컬 스토리지에 카테고리 데이터 저장
    // Supabase 전용 - localStorage 사용 제거됨
    async saveCategoriesToLocalStorage() {
        console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
        return false;
    }

    // 새 상품 추가
    async addProduct(productData) {
        try {
            console.log('새 상품 추가:', productData);
            
            // 상품 데이터 검증
            if (!productData.name || !productData.price) {
                throw new Error('상품명과 판매가는 필수입니다.');
            }
            
            // 수정 모드인지 확인 (ID가 있고 유효한 UUID 형식인지 확인)
            const hasValidId = productData.id && productData.id.trim() !== '' && productData.id !== 'undefined';
            const existingProduct = hasValidId ? this.farm_products.find(p => p.id === productData.id) : null;
            const isEditMode = hasValidId && existingProduct;
            
            console.log('🔍 상품 모드 확인:', {
                productId: productData.id,
                hasValidId: hasValidId,
                isEditMode: isEditMode,
                existingProduct: !!existingProduct,
                productName: productData.name
            });
            
            if (isEditMode) {
                // 수정 모드: 기존 상품 업데이트
                console.log('✏️ 수정 모드로 전환');
                return await this.updateProduct(productData.id, productData);
            } else {
                // 새 상품 추가 모드: 중복 확인 (자기 자신 제외)
                console.log('➕ 새 상품 추가 모드');
                const duplicateProduct = this.farm_products.find(p => p.name === productData.name && p.id !== productData.id);
                if (duplicateProduct) {
                    console.log('⚠️ 중복된 상품명 발견:', duplicateProduct);
                    const duplicateInfo = `상품명: ${duplicateProduct.name}\n카테고리: ${duplicateProduct.category}\n가격: ${duplicateProduct.price}원\n재고: ${duplicateProduct.stock}개`;
                    throw new Error(`이미 등록된 상품명입니다.\n\n기존 상품 정보:\n${duplicateInfo}\n\n다른 상품명을 사용하거나 기존 상품을 수정해주세요.`);
                }
            }
            
            // 새 상품 객체 생성
            const newProduct = {
                id: productData.id || crypto.randomUUID(),
                product_code: productData.product_code || await this.generateSequentialProductCode(),
                name: productData.name.trim(),
                category: productData.category || '',
                size: productData.size || '',
                price: parseInt(productData.price) || 0,
                cost: parseInt(productData.cost) || 0,
                stock: parseInt(productData.stock) || 0,
                shipping_option: productData.shipping_option || '일반배송',
                shipping: productData.shipping_option || '일반배송', // 테이블 표시용
                description: productData.description || '',
                tags: productData.tags || [],
                image_url: productData.image_url || '',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 수익률 계산
            if (newProduct.price > 0 && newProduct.cost > 0) {
                newProduct.profit_margin = Math.round(((newProduct.price - newProduct.cost) / newProduct.price) * 100);
            } else {
                newProduct.profit_margin = 0;
            }
            
            // Supabase에 직접 저장
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다.');
            }
            
            console.log('🌐 Supabase에 상품 저장 중...');
            
            const { data, error } = await window.supabaseClient
                .from('farm_products')
                .insert([newProduct])
                .select();
            
            if (error) {
                throw new Error(`❌ Supabase 저장 실패: ${error.message}`);
            }
            
            if (!data || data.length === 0) {
                throw new Error('Supabase에서 데이터가 반환되지 않았습니다.');
            }
            
            // 로컬 배열에도 추가
            this.farm_products.push(data[0]);
            
            // 캐시 무효화
            await this.invalidateProductCache();
            
            console.log('✅ 새 상품 추가 완료:', data[0]);
            return data[0];
            
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
            
            // Supabase에서 직접 수정
            if (!window.supabaseClient) {
                throw new Error('❌ Supabase 클라이언트가 없습니다.');
            }
            
            const updatedProductData = {
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            console.log('🌐 Supabase에서 상품 수정 중...');
            
            const { data, error } = await window.supabaseClient
                .from('farm_products')
                .update(updatedProductData)
                .eq('id', productId)
                .select();
            
            if (error) {
                throw new Error(`❌ Supabase 수정 실패: ${error.message}`);
            }
            
            // 로컬 배열도 업데이트
            this.farm_products[productIndex] = {
                ...this.farm_products[productIndex],
                ...data[0]
            };
            
            // 캐시 무효화
            await this.invalidateProductCache();
            
            console.log('✅ 상품 정보 수정 완료');
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
            
            const deletedProduct = this.farm_products[productIndex];
            
            // Supabase에서 삭제
            if (window.supabaseClient) {
                console.log('🌐 Supabase에서 상품 삭제 중...');
                
                const { error: deleteError } = await window.supabaseClient
                    .from('farm_products')
                    .delete()
                    .eq('id', productId);
                
                if (deleteError) {
                    throw new Error(`❌ Supabase 삭제 실패: ${deleteError.message}`);
                }
                
                console.log('✅ Supabase에서 상품 삭제 완료');
            } else {
                throw new Error('❌ Supabase 클라이언트가 없습니다.');
            }
            
            // 메모리에서도 제거
            this.farm_products.splice(productIndex, 1);
            
            // 캐시 무효화
            await this.invalidateProductCache();
            
            console.log('상품 삭제 완료:', deletedProduct.name);
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

    // ID로 상품 찾기
    getProductById(productId) {
        try {
            console.log('🔍 getProductById 호출:', productId);
            console.log('🔍 현재 farm_products 길이:', this.farm_products?.length || 0);
            console.log('🔍 farm_products 존재 여부:', !!this.farm_products);
            
            if (!this.farm_products || this.farm_products.length === 0) {
                console.warn('⚠️ farm_products가 비어있습니다');
                return null;
            }
            
            const foundProduct = this.farm_products.find(product => product.id === productId);
            console.log('🔍 찾은 상품:', foundProduct);
            
            if (foundProduct) {
                console.log('✅ 상품 찾기 성공:', foundProduct.name);
            } else {
                console.warn('⚠️ 상품을 찾을 수 없습니다. 사용 가능한 ID들:', 
                    this.farm_products.map(p => p.id).slice(0, 5));
            }
            
            return foundProduct;
        } catch (error) {
            console.error('❌ 상품 찾기 실패:', error);
            return null;
        }
    }

    // 상품 코드 생성 (타임스탬프 방식)
    generateProductCode(productName) {
        try {
            const timestamp = Date.now().toString().slice(-6);
            const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase();
            return `P${timestamp}${randomStr}`;
        } catch (error) {
            console.error('상품 코드 생성 실패:', error);
            return `P${Date.now()}`;
        }
    }

    // 순차적 상품 코드 생성 (P001, P002, P003...)
    async generateSequentialProductCode() {
        try {
            console.log('🔢 순차적 상품 코드 생성 시작');
            
            // 기존 상품들의 코드를 가져와서 다음 번호 계산
            const products = this.farm_products;
            console.log('📊 기존 상품 수:', products.length);
            
            // 기존 상품 코드들에서 숫자 추출
            const existingCodes = products
                .map(product => product.product_code)
                .filter(code => {
                    // 타입 검사: 문자열이고 'P'로 시작하는지 확인
                    return code && typeof code === 'string' && code.startsWith('P');
                })
                .map(code => {
                    const match = code.match(/P(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => num > 0);
            
            // 다음 번호 계산
            console.log('🔍 기존 코드들:', existingCodes);
            const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
            const productCode = `P${nextNumber.toString().padStart(3, '0')}`;
            
            console.log('✅ 순차적 상품 코드 생성 완료:', productCode, '(기존 코드 수:', existingCodes.length, ')');
            return productCode;
            
        } catch (error) {
            console.error('❌ 순차적 상품 코드 생성 실패:', error);
            return 'P001';
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

    // 새 카테고리 추가
    async addCategory(categoryData) {
        try {
            console.log('새 카테고리 추가:', categoryData);
            
            // 카테고리 데이터 검증
            if (!categoryData.name) {
                throw new Error('카테고리명은 필수입니다.');
            }
            
            // 중복 확인
            const existingCategory = this.categories.find(c => c.name === categoryData.name);
            if (existingCategory) {
                throw new Error('이미 존재하는 카테고리명입니다.');
            }
            
            // 새 카테고리 객체 생성
            const newCategory = {
                id: categoryData.id || crypto.randomUUID(),
                name: categoryData.name.trim(),
                color: categoryData.color || 'blue',
                description: categoryData.description || '',
                sort_order: categoryData.sort_order || this.categories.length,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 카테고리 목록에 추가
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
                const existingCategory = this.categories.find(c => c.name === updateData.name && c.id !== categoryId);
                if (existingCategory) {
                    throw new Error('이미 존재하는 카테고리명입니다.');
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
            console.error('카테고리 정보 수정 실패:', error);
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
            
            // 해당 카테고리를 사용하는 상품이 있는지 확인
            const productsUsingCategory = this.farm_products.filter(p => p.category === this.categories[categoryIndex].name);
            if (productsUsingCategory.length > 0) {
                throw new Error(`이 카테고리를 사용하는 상품이 ${productsUsingCategory.length}개 있습니다. 먼저 상품의 카테고리를 변경해주세요.`);
            }
            
            // 카테고리 삭제
            const deletedCategory = this.categories.splice(categoryIndex, 1)[0];
            
            // 데이터 저장
            await this.saveCategories();
            
            console.log('카테고리 삭제 완료:', deletedCategory);
            return deletedCategory;
            
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
            throw error;
        }
    }

    // ID로 카테고리 찾기
    getCategoryById(categoryId) {
        try {
            return this.categories.find(category => category.id === categoryId);
        } catch (error) {
            console.error('카테고리 찾기 실패:', error);
            return null;
        }
    }

    // 이름으로 카테고리 찾기
    getCategoryByName(name) {
        try {
            return this.categories.find(category => category.name === name);
        } catch (error) {
            console.error('카테고리 찾기 실패:', error);
            return null;
        }
    }
}

// 인스턴스 생성 (지연 초기화)
let productDataManager = null;

// 전역 인스턴스 생성 함수
async function initializeProductDataManager() {
    if (!productDataManager) {
        productDataManager = new ProductDataManager();
        window.productDataManager = productDataManager;
        console.log('✅ ProductDataManager 전역 인스턴스 생성 완료');
    }
    return productDataManager;
}

// 전역으로 등록하여 다른 곳에서 접근 가능하도록
window.initializeProductDataManager = initializeProductDataManager;

// productDataManager getter 함수
function getProductDataManager() {
    return productDataManager;
}

// Supabase 초기화 대기 함수
async function waitForSupabase(maxWaitTime = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
        if (window.supabaseClient && window.SUPABASE_CONFIG) {
            console.log('✅ Supabase 준비 완료');
            return true;
        }
        
        console.log('⏳ Supabase 초기화 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.warn('⚠️ Supabase 초기화 대기 시간 초과');
    return false;
}

// DOMContentLoaded 이벤트에서 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔄 ProductDataManager 초기화 시작...');
        
        // Supabase 초기화 대기
        const supabaseReady = await waitForSupabase();
        if (!supabaseReady) {
            throw new Error('❌ Supabase가 준비되지 않았습니다. Supabase 연결이 필요합니다.');
        }
        console.log('✅ Supabase 준비됨, ProductDataManager 초기화 진행');
        
        await initializeProductDataManager();
    } catch (error) {
        console.error('❌ ProductDataManager 초기화 실패:', error);
    }
});

// 즉시 사용 가능한 경우를 위한 폴백
if (document.readyState === 'loading') {
    // 문서가 아직 로딩 중이면 위의 이벤트 리스너가 처리
} else {
    // 문서가 이미 로드된 경우 즉시 초기화
    (async () => {
        try {
            console.log('🔄 ProductDataManager 즉시 초기화 시작...');
            
            // Supabase 초기화 대기
            const supabaseReady = await waitForSupabase();
            if (!supabaseReady) {
                throw new Error('❌ Supabase가 준비되지 않았습니다. Supabase 연결이 필요합니다.');
            }
            console.log('✅ Supabase 준비됨, ProductDataManager 즉시 초기화 진행');
            
            await initializeProductDataManager();
        } catch (error) {
            console.error('❌ ProductDataManager 즉시 초기화 실패:', error);
        }
    })();
}

// 모듈 내보내기 (ES6 모듈 지원시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDataManager;
}

// ES6 모듈 export
export { ProductDataManager, initializeProductDataManager, getProductDataManager };

// productDataManager를 기본 export로도 제공
export default productDataManager;
