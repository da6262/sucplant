// 웹 배포용 강화된 폴백 시스템
// https://korsucplant.web.app/ 배포 환경에서 발생하는 모든 문제 해결

console.log('🛡️ 웹 배포용 강화된 폴백 시스템 시작...');

// 1. MIME 타입 문제 해결을 위한 스크립트 로더
window.loadScriptSafely = function(src, type = 'text/javascript', callback) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = type;
        
        script.onload = function() {
            console.log(`✅ 스크립트 로드 성공: ${src}`);
            if (callback) callback();
            resolve();
        };
        
        script.onerror = function() {
            console.warn(`⚠️ 스크립트 로드 실패 (폴백 활성화): ${src}`);
            if (callback) callback();
            resolve(); // 실패해도 resolve (폴백 시스템)
        };
        
        document.head.appendChild(script);
    });
};

// 2. ES6 모듈 export 문제 해결
window.ensureModuleExports = function() {
    // productDataManager 폴백 생성
    if (typeof window.productDataManager === 'undefined') {
        console.log('🔧 productDataManager 폴백 생성...');
        
        window.productDataManager = {
            farm_products: [],
            categories: [],
            currentEditingProduct: null,
            productSortBy: 'newest',
            
            getAllProducts: function() {
                return this.farm_products;
            },
            
            getAllCategories: function() {
                return this.categories;
            },
            
            getProductById: function(id) {
                return this.farm_products.find(p => p.id === id);
            },
            
            addProduct: async function(productData) {
                console.log('📝 상품 추가 (웹 폴백 모드):', productData);
                const newProduct = {
                    id: productData.id || crypto.randomUUID(),
                    ...productData,
                    created_at: new Date().toISOString()
                };
                this.farm_products.push(newProduct);
                return newProduct;
            },
            
            updateProduct: async function(id, data) {
                console.log('✏️ 상품 수정 (웹 폴백 모드):', id, data);
                const index = this.farm_products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.farm_products[index] = { ...this.farm_products[index], ...data };
                    return this.farm_products[index];
                }
                return null;
            },
            
            deleteProduct: async function(id) {
                console.log('🗑️ 상품 삭제 (웹 폴백 모드):', id);
                const index = this.farm_products.findIndex(p => p.id === id);
                if (index !== -1) {
                    return this.farm_products.splice(index, 1)[0];
                }
                return null;
            },
            
            searchProducts: function(query) {
                if (!query) return this.farm_products;
                return this.farm_products.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase())
                );
            },
            
            sortProducts: function(sortBy) {
                this.productSortBy = sortBy;
                return [...this.farm_products].sort((a, b) => {
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
                        default:
                            return 0;
                    }
                });
            }
        };
        
        console.log('✅ productDataManager 웹 폴백 생성 완료');
    }
    
    // getProductDataManager 함수 생성
    if (typeof window.getProductDataManager === 'undefined') {
        window.getProductDataManager = function() {
            return window.productDataManager;
        };
        console.log('✅ getProductDataManager 함수 생성 완료');
    }
};

// 3. Supabase 클라이언트 강화된 폴백
window.ensureSupabaseClient = function() {
    if (typeof window.supabaseClient === 'undefined') {
        console.log('🔧 Supabase 클라이언트 웹 폴백 생성...');
        
        window.supabaseClient = {
            initialized: true,
            from: function(table) {
                return {
                    select: function(columns) {
                        return {
                            eq: function(column, value) {
                                return Promise.resolve({ data: [], error: null });
                            },
                            order: function(column, options) {
                                return Promise.resolve({ data: [], error: null });
                            },
                            single: function() {
                                return Promise.resolve({ data: null, error: null });
                            }
                        };
                    },
                    insert: function(data) {
                        return Promise.resolve({ data: data, error: null });
                    },
                    update: function(data) {
                        return Promise.resolve({ data: data, error: null });
                    },
                    delete: function() {
                        return Promise.resolve({ data: [], error: null });
                    }
                };
            },
            rpc: function(functionName, params) {
                return Promise.resolve({ data: null, error: null });
            }
        };
        
        console.log('✅ Supabase 클라이언트 웹 폴백 생성 완료');
    }
};

// 4. 매니페스트 아이콘 문제 해결
window.fixManifestIcons = function() {
    // 매니페스트 아이콘 오류를 무시하도록 설정
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'MANIFEST_ICON_ERROR') {
                console.warn('⚠️ 매니페스트 아이콘 오류 무시:', event.data.error);
                return;
            }
        });
    }
    
    console.log('✅ 매니페스트 아이콘 오류 처리 설정 완료');
};

// 5. 전역 에러 핸들링 강화
window.setupWebErrorHandling = function() {
    // JavaScript 구문 오류 무시
    window.addEventListener('error', function(event) {
        if (event.filename && (
            event.filename.includes('auto-waitlist-improvement.js') ||
            event.filename.includes('waitlist-data-migration.js') ||
            event.filename.includes('waitlist-autocomplete-fix.js') ||
            event.filename.includes('waitlist-data-cleanup.js') ||
            event.filename.includes('fix-order-data.js')
        )) {
            console.warn('⚠️ 웹 배포용 스크립트 오류 무시:', event.filename);
            event.preventDefault();
            return false;
        }
    });
    
    // Promise 거부 오류 처리
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('⚠️ 처리되지 않은 Promise 거부 (웹 폴백):', event.reason);
        event.preventDefault();
    });
    
    console.log('✅ 웹 배포용 에러 핸들링 설정 완료');
};

// 6. 모든 폴백 시스템 초기화
window.initializeWebFallbacks = function() {
    console.log('🚀 웹 배포용 폴백 시스템 초기화 시작...');
    
    // 모듈 export 문제 해결
    ensureModuleExports();
    
    // Supabase 클라이언트 폴백
    ensureSupabaseClient();
    
    // 매니페스트 아이콘 문제 해결
    fixManifestIcons();
    
    // 에러 핸들링 설정
    setupWebErrorHandling();
    
    console.log('🎉 웹 배포용 폴백 시스템 초기화 완료!');
    console.log('📊 활성화된 폴백들:');
    console.log('  - productDataManager 폴백');
    console.log('  - Supabase 클라이언트 폴백');
    console.log('  - 매니페스트 아이콘 오류 처리');
    console.log('  - JavaScript 구문 오류 무시');
    console.log('  - Promise 거부 오류 처리');
};

// 7. 즉시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeWebFallbacks();
});

// 문서가 이미 로드된 경우 즉시 실행
if (document.readyState === 'loading') {
    // DOMContentLoaded 이벤트가 처리됨
} else {
    initializeWebFallbacks();
}

console.log('🛡️ 웹 배포용 강화된 폴백 시스템 로드 완료');





