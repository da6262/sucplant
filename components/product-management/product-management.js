/**
 * 상품 관리 컴포넌트 스크립트
 * 경산다육식물농장 관리시스템
 */

/**
 * 상품 테이블 컬럼 단일 소스
 * 헤더 <th> 와 행 <td> 둘 다 이 배열에서 파생 (header/body 불일치 원천 차단).
 * 컬럼 추가·제거·순서 변경 시 이 배열만 수정하면 됨.
 *
 * 각 컬럼:
 *   - headerCell: 커스텀 <th> HTML (체크박스 등 특수 케이스)
 *     또는 label + thClass 로 기본 <th> 자동 생성
 *   - render(product, nullDash): 전체 <td>...</td> HTML 반환
 */
const PRODUCT_COLUMNS = [
    {
        key: 'checkbox',
        headerCell: '<th class="text-center w-10"><input type="checkbox" id="select-all-products" class="rounded border-gray-300 text-green-600 focus:ring-green-500"></th>',
        render: (p) => `<td class="px-2 text-center align-middle"><input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500 focus:ring-1" data-product-id="${p.id}"></td>`
    },
    {
        key: 'product_code',
        label: '상품코드',
        thClass: 'text-left w-20',
        render: (p, dash) => {
            const code = p.product_code ? String(p.product_code).replace(/</g, '&lt;') : null;
            return `<td class="px-2 td-muted align-middle whitespace-nowrap">${code || dash}</td>`;
        }
    },
    {
        key: 'name',
        label: '상품명',
        thClass: 'text-left min-w-[200px]',
        render: (p, dash) => {
            const name = (p.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<td class="px-2 td-primary td-link align-middle"><span class="product-name-link">${name || dash}</span></td>`;
        }
    },
    {
        key: 'category',
        label: '카테고리',
        thClass: 'text-left w-24',
        render: (p, dash) => {
            const cat = p.category ? String(p.category).replace(/</g, '&lt;') : null;
            return `<td class="px-2 align-middle">${cat ? `<span class="badge badge-info">${cat}</span>` : dash}</td>`;
        }
    },
    {
        key: 'size',
        label: '사이즈',
        thClass: 'text-left w-16',
        render: (p, dash) => {
            const s = p.size ? String(p.size).replace(/</g, '&lt;') : null;
            return `<td class="px-2 td-secondary align-middle">${s || dash}</td>`;
        }
    },
    {
        key: 'price',
        label: '판매가',
        thClass: 'text-right w-24',
        render: (p, dash) => {
            const price = Number(p.price) || 0;
            return `<td class="px-2 td-amount text-right text-numeric align-middle">${price > 0 ? '₩' + price.toLocaleString() : dash}</td>`;
        }
    },
    {
        key: 'stock',
        label: '재고',
        thClass: 'text-right w-20',
        render: (p, dash) => {
            const stock = Number(p.stock) || 0;
            return `<td class="px-2 td-num text-right align-middle">${stock > 0 ? stock + '개' : dash}</td>`;
        }
    },
    {
        key: 'shipping_option',
        label: '배송옵션',
        thClass: 'text-left w-24',
        render: (p, dash) => {
            const ship = p.shipping_option ? String(p.shipping_option).replace(/</g, '&lt;') : null;
            return `<td class="px-2 td-secondary align-middle">${ship || dash}</td>`;
        }
    },
    {
        key: 'actions',
        headerCell: '<th class="text-center w-20">관리</th>',
        render: (p) => `
            <td class="px-2 text-center align-middle whitespace-nowrap">
                <div class="btn-group">
                    <button class="edit-product-btn btn-icon btn-icon-edit" data-product-id="${p.id}" title="수정"><i class="fas fa-pen"></i></button>
                    <button class="duplicate-product-btn btn-icon btn-icon-copy" data-product-id="${p.id}" title="복제"><i class="fas fa-copy"></i></button>
                    <button class="delete-product-btn btn-icon btn-icon-delete" data-product-id="${p.id}" title="삭제"><i class="fas fa-trash"></i></button>
                </div>
            </td>`
    }
];

// 헤더 <th> HTML 생성 (단일 소스 → <thead>)
function renderProductTableHeader() {
    return PRODUCT_COLUMNS.map(c =>
        c.headerCell || `<th class="${c.thClass || ''}">${c.label || ''}</th>`
    ).join('');
}

// 행 <td> HTML 생성 (단일 소스 → <tr>)
function renderProductRowCells(product, nullDash) {
    return PRODUCT_COLUMNS.map(c => c.render(product, nullDash)).join('');
}

// ProductUI 동적 import를 위한 함수
async function loadProductUIModule() {
    try {
        const module = await import('./../../features/products/productUI.js');
        return module.ProductUI;
    } catch (error) {
        console.error('❌ ProductUI 모듈 로드 실패:', error);
        return null;
    }
}

class ProductManagementComponent {
    constructor() {
        this.isInitialized = false;
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 0;
        this.sortField = 'created_at';
        this.sortOrder = 'desc';
        this.productUI = null; // ProductUI 인스턴스
    }

    /**
     * 컴포넌트 초기화
     */
    async init(container, data = {}) {
        console.log('🏗️ ProductManagement 컴포넌트 초기화...');
        
        // ProductUI 인스턴스 생성
        try {
            const ProductUIClass = await loadProductUIModule();
            if (ProductUIClass) {
                this.productUI = new ProductUIClass();
                window.productUI = this.productUI; // 전역 참조 등록
                console.log('✅ ProductUI 인스턴스 생성 완료');
            } else {
                console.warn('⚠️ ProductUI 클래스를 로드할 수 없습니다');
            }
        } catch (error) {
            console.error('❌ ProductUI 인스턴스 생성 실패:', error);
        }
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        this.removeEventListeners();
        
        // Supabase에서 상품 데이터 로드
        try {
            await this.loadProducts();
        } catch (error) {
            console.error('❌ 상품 데이터 로드 실패:', error);
        }
        
        this.setupPagination();
        this.setupEventListeners();

        this.isInitialized = true;
        console.log('✅ ProductManagement 컴포넌트 초기화 완료');
    }
    
    /**
     * 이벤트 리스너 제거
     */
    removeEventListeners() {
        try {
            console.log('🧹 상품관리 이벤트 리스너 정리 중...');
            
            // 상품 등록 버튼 정리
            const addProductBtn = document.getElementById('add-product-btn');
            if (addProductBtn) {
                const newBtn = addProductBtn.cloneNode(true);
                addProductBtn.parentNode.replaceChild(newBtn, addProductBtn);
            }
            
            // 카테고리 관리 버튼 정리
            const manageCategoriesBtn = document.getElementById('manage-categories-btn');
            if (manageCategoriesBtn) {
                const newBtn = manageCategoriesBtn.cloneNode(true);
                manageCategoriesBtn.parentNode.replaceChild(newBtn, manageCategoriesBtn);
            }
            
            // 일괄 등록 버튼 정리
            const importBtn = document.getElementById('import-products-btn');
            if (importBtn) {
                const newBtn = importBtn.cloneNode(true);
                importBtn.parentNode.replaceChild(newBtn, importBtn);
            }
            
            // 내보내기 버튼 정리
            const exportBtn = document.getElementById('export-products-btn');
            if (exportBtn) {
                const newBtn = exportBtn.cloneNode(true);
                exportBtn.parentNode.replaceChild(newBtn, exportBtn);
            }
            
            // 상품 테이블 정리
            const productTable = document.getElementById('products-table-body');
            if (productTable) {
                const newTable = productTable.cloneNode(true);
                productTable.parentNode.replaceChild(newTable, productTable);
            }
            
            // 상품 모달은 document.body에 위치하므로 cloneNode 대신 클래스/스타일만 초기화
            // (cloneNode를 쓰면 addEventListener 기반 리스너가 전부 날아가 저장 버튼 먹통 발생)
            const productModal = document.getElementById('product-modal');
            if (productModal) {
                productModal.style.display = 'none';
                productModal.classList.add('hidden');
            }

            // 전역 이벤트 리스너 정리
            if (window.productEventListeners) {
                window.productEventListeners.forEach(listener => {
                    if (listener.element && listener.event && listener.handler) {
                        listener.element.removeEventListener(listener.event, listener.handler);
                    }
                });
                window.productEventListeners = [];
            }
            
            console.log('✅ 상품관리 이벤트 리스너 정리 완료');
        } catch (error) {
            console.error('❌ 상품관리 이벤트 리스너 정리 실패:', error);
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('🔧 이벤트 리스너 설정 시작...');
        
        // 상품 등록 버튼
        const addProductBtn = document.getElementById('add-product-btn');
        console.log('🔍 add-product-btn 요소:', addProductBtn);
        
        if (addProductBtn) {
            console.log('✅ 상품등록 버튼 이벤트 리스너 등록');
            
            // 기존 이벤트 리스너 제거 (중복 방지)
            addProductBtn.removeEventListener('click', this.handleAddProductClick);
            
            // 새로운 이벤트 리스너 추가
            this.handleAddProductClick = () => {
                console.log('🔄 상품등록 버튼 클릭됨!');
                this.openProductModal();
            };
            
            addProductBtn.addEventListener('click', this.handleAddProductClick);
            console.log('✅ 상품등록 버튼 이벤트 리스너 등록 완료');
        } else {
            console.error('❌ add-product-btn 요소를 찾을 수 없습니다');
            console.log('🔍 현재 DOM 상태 확인:');
            console.log('- products-section:', document.getElementById('products-section'));
            console.log('- 모든 버튼들:', document.querySelectorAll('button[id*="product"]'));
        }

        // 카테고리 관리 버튼
        const manageCategoriesBtn = document.getElementById('manage-categories-btn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                this.openCategoryManagement();
            });
        }

        // 일괄 등록 버튼
        const importBtn = document.getElementById('import-products-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.openImportModal();
            });
        }

        // 내보내기 버튼
        const exportBtn = document.getElementById('export-products-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportProducts();
            });
        }

        // 검색 및 필터
        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('product-category-filter');
        const stockFilter = document.getElementById('product-stock-filter');
        const priceFilter = document.getElementById('product-price-filter');
        const filterBtn = document.getElementById('product-filter-btn');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.debounceSearch();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (stockFilter) {
            stockFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // 페이지당 표시 개수 — 전역 PageSize 컨트롤 사용 (options·리스너 중앙 관리)
        if (window.PageSize) {
            window.PageSize.attach('product-page-size', (size) => {
                this.itemsPerPage = size;
                this.currentPage = 1;
                this.updatePagination();
                this.renderProducts();
            }, this.itemsPerPage);
        }

        // 필터 초기화 버튼
        const filterResetBtn = document.getElementById('product-filter-reset-btn');
        if (filterResetBtn) {
            filterResetBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                if (stockFilter) stockFilter.value = '';
                if (priceFilter) priceFilter.value = '';
                this.applyFilters();
            });
        }

        // 전체 선택 체크박스
        const selectAllCheckbox = document.getElementById('select-all-products');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // 일괄 삭제 버튼
        const bulkDeleteBtn = document.getElementById('product-bulk-delete-btn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteProducts());
        }

        // 일괄 선택 해제 버튼
        const bulkClearBtn = document.getElementById('product-bulk-clear-btn');
        if (bulkClearBtn) {
            bulkClearBtn.addEventListener('click', () => {
                this.toggleSelectAll(false);
                const cb = document.getElementById('select-all-products');
                if (cb) cb.checked = false;
                this.updateBulkBar();
            });
        }

        // 상품명 실시간 중복 체크 (모달이 로드된 후에 설정)
        this.setupProductNameDuplicateCheck();
    }

    /**
     * 상품 데이터 로드 (Supabase 전용)
     */
    async loadProducts() {
        try {
            console.log('📊 상품 데이터 로드 중...');
            
            // productDataManager 가 없으면 즉시 강제 초기화 — polling 제거 (응답성 개선)
            if (!window.productDataManager && window.initializeProductDataManager) {
                console.log('🔄 productDataManager 즉시 초기화...');
                await window.initializeProductDataManager();
            }
            
            // Supabase에서 상품 데이터 로드
            if (window.productDataManager) {
                console.log('✅ productDataManager 발견, 상품 데이터 로드 시작...');
                await window.productDataManager.loadProducts();
                this.products = window.productDataManager.getAllProducts();
                console.log(`📦 로드된 상품 수: ${this.products.length}`);
            } else {
                console.warn('⚠️ productDataManager를 찾을 수 없습니다. 빈 목록으로 초기화합니다.');
                this.products = [];
            }
            
            this.filteredProducts = [...this.products];
            this.updatePagination();
            this.renderProducts();
            this.updateCategoryFilter();

            console.log(`✅ 상품 데이터 로드 완료: ${this.products.length}개`);
            
        } catch (error) {
            console.error('❌ 상품 데이터 로드 실패:', error);
            this.products = [];
            this.filteredProducts = [];
            this.renderProducts();
        }
    }

    /**
     * 상품 목록 렌더링
     */
    renderProducts() {
        console.log('📋 상품 목록 렌더링 시작...');
        console.log('🔍 렌더링할 상품 수:', this.filteredProducts.length);

        // 헤더 <tr> 을 스키마에서 주입 (단일 소스 보장 — HTML 재fetch 후에도 정합)
        const headerRow = document.getElementById('products-table-header');
        if (headerRow && !headerRow.dataset.rendered) {
            headerRow.innerHTML = renderProductTableHeader();
            headerRow.dataset.rendered = 'true';
        }

        const tbody = document.getElementById('products-table-body');
        console.log('🔍 tbody 요소:', tbody);

        if (!tbody) {
            console.error('❌ products-table-body 요소를 찾을 수 없습니다!');
            return;
        }

        // itemsPerPage === 0 이면 전체 표시
        const pageProducts = this.itemsPerPage === 0
            ? this.filteredProducts
            : this.filteredProducts.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        
        console.log(`📄 현재 페이지: ${this.currentPage}, 표시할 상품: ${pageProducts.length}개`);

        tbody.innerHTML = '';

        if (pageProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-4 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-box text-3xl mb-3 text-gray-300"></i>
                            <p class="text-sm font-medium text-gray-600">등록된 상품이 없습니다</p>
                            <p class="text-xs text-gray-500 mt-1">새 상품을 등록해보세요</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        pageProducts.forEach((product, index) => {
            try {
                console.log(`🔨 상품 행 생성 중 (${index + 1}/${pageProducts.length}):`, product.name);
                const row = this.createProductRow(product);
                tbody.appendChild(row);
                console.log(`✅ 상품 행 추가 완료: ${product.name}`);
            } catch (error) {
                console.error(`❌ 상품 행 생성 실패 (${product.name}):`, error);
            }
        });

        console.log(`✅ 총 ${pageProducts.length}개 상품 행 렌더링 완료`);
        this.updatePaginationInfo();
        this.updateFooterStats();
    }

    /**
     * 상품 행 생성
     */
    createProductRow(product) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors cursor-pointer';
        row.dataset.productId = product.id;

        // PRODUCT_COLUMNS 단일 스키마에서 모든 셀 생성 — 헤더와 무조건 정합
        const nullDash = '<span class="td-null">—</span>';
        row.innerHTML = renderProductRowCells(product, nullDash);

        this.addRowEventListeners(row, product);
        return row;
    }

    /**
     * 행 이벤트 리스너 추가
     */
    addRowEventListeners(row, product) {
        // 상품명 클릭 → 상세 패널
        const nameLink = row.querySelector('.product-name-link');
        if (nameLink) {
            nameLink.addEventListener('click', () => {
                this.openProductDetailPanel(product);
            });
        }

        // 편집 버튼
        const editBtn = row.querySelector('.edit-product-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editProduct(product);
            });
        }

        // 복제 버튼
        const duplicateBtn = row.querySelector('.duplicate-product-btn');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => {
                this.duplicateProduct(product);
            });
        }

        // 삭제 버튼
        const deleteBtn = row.querySelector('.delete-product-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteProduct(product);
            });
        }

        // 체크박스
        const checkbox = row.querySelector('.product-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                this.updateSelectAllState();
                this.updateBulkBar();
            });
        }
    }

    /**
     * 재고 상태 확인
     */
    getStockStatus(stock) {
        if (stock === 0) return 'out-of-stock';
        if (stock <= 5) return 'low-stock';
        return 'in-stock';
    }

    /**
     * 재고 상태 색상
     */
    getStockColor(status) {
        const colors = {
            'in-stock': 'text-green-600',
            'low-stock': 'text-yellow-600',
            'out-of-stock': 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    }

    /**
     * 재고 상태 텍스트
     */
    getStockStatusText(status) {
        const texts = {
            'in-stock': '재고 있음',
            'low-stock': '재고 부족',
            'out-of-stock': '품절'
        };
        return texts[status] || '알 수 없음';
    }

    /**
     * 디바운스 검색
     */
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('product-category-filter')?.value || '';
        const stockFilter = document.getElementById('product-stock-filter')?.value || '';
        const priceFilter = document.getElementById('product-price-filter')?.value || '';

        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            
            const matchesStock = !stockFilter || this.getStockStatus(product.stock) === stockFilter;
            
            const matchesPrice = !priceFilter || this.matchesPriceRange(product.price, priceFilter);

            return matchesSearch && matchesCategory && matchesStock && matchesPrice;
        });

        this.currentPage = 1;
        this.updatePagination();
        this.renderProducts();
    }

    /**
     * 가격 범위 매칭
     */
    matchesPriceRange(price, range) {
        const priceNum = parseFloat(price) || 0;
        
        switch (range) {
            case '0-10000':
                return priceNum <= 10000;
            case '10000-30000':
                return priceNum > 10000 && priceNum <= 30000;
            case '30000-50000':
                return priceNum > 30000 && priceNum <= 50000;
            case '50000+':
                return priceNum > 50000;
            default:
                return true;
        }
    }

    /**
     * 페이지네이션 설정
     */
    setupPagination() {
        const prevBtn = document.getElementById('products-pagination-prev');
        const nextBtn = document.getElementById('products-pagination-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                }
            });
        }
    }

    /**
     * 페이지네이션 업데이트
     */
    updatePagination() {
        this.totalPages = this.itemsPerPage === 0
            ? 1
            : Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        this.renderPaginationNumbers();
    }

    /**
     * 페이지네이션 번호 렌더링
     */
    renderPaginationNumbers() {
        const container = document.getElementById('products-pagination-numbers');
        const prevBtn   = document.getElementById('products-pagination-prev');
        const nextBtn   = document.getElementById('products-pagination-next');
        if (!container) return;

        // 전체 보기 또는 1페이지뿐이면 페이지 버튼 숨김
        const hide = this.itemsPerPage === 0 || this.totalPages <= 1;
        container.innerHTML = '';
        if (prevBtn) prevBtn.style.display = hide ? 'none' : '';
        if (nextBtn) nextBtn.style.display = hide ? 'none' : '';
        if (hide) return;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage   = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `px-2 py-1 text-xs border rounded transition-colors ${
                i === this.currentPage
                    ? 'status-tab-btn active'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.renderProducts();
            });
            container.appendChild(pageBtn);
        }
    }

    /**
     * 페이지네이션 정보 업데이트
     */
    updatePaginationInfo() {
        const infoElement = document.getElementById('products-pagination-info');
        if (!infoElement) return;
        const total = this.filteredProducts.length;
        if (total === 0) { infoElement.textContent = ''; return; }
        if (this.itemsPerPage === 0) {
            infoElement.textContent = `전체 ${total}개`;
            return;
        }
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex   = Math.min(this.currentPage * this.itemsPerPage, total);
        infoElement.textContent = `${startIndex}-${endIndex} / ${total}개`;
    }

    /**
     * 카테고리 필터 드롭다운 갱신
     */
    updateCategoryFilter() {
        const sel = document.getElementById('product-category-filter');
        if (!sel) return;
        const current = sel.value;

        // 상품에 쓰인 카테고리 + DB 카테고리 전부 합산
        const fromProducts = this.products.map(p => p.category).filter(Boolean);
        const fromDB = (window.categoryDataManager?.getAllCategories() || []).map(c => c.name);
        const cats = [...new Set([...fromProducts, ...fromDB])].sort();

        sel.innerHTML = '<option value="">전체 카테고리</option>' +
            cats.map(c => `<option value="${c}"${c === current ? ' selected' : ''}>${c}</option>`).join('');
    }

    /**
     * 하단 푸터 통계 업데이트
     */
    updateFooterStats() {
        const total = this.filteredProducts.length;
        const low   = this.filteredProducts.filter(p => { const s = this.getStockStatus(p.stock); return s === 'low-stock'; }).length;
        const out   = this.filteredProducts.filter(p => { const s = this.getStockStatus(p.stock); return s === 'out-of-stock'; }).length;
        const elTotal = document.getElementById('product-status-total');
        const elLow   = document.getElementById('product-status-low');
        const elOut   = document.getElementById('product-status-out');
        if (elTotal) elTotal.textContent = total;
        if (elLow)   elLow.textContent   = low;
        if (elOut)   elOut.textContent   = out;
    }

    /**
     * 일괄처리 바 상태 업데이트
     */
    updateBulkBar() {
        const checked = document.querySelectorAll('.product-checkbox:checked').length;
        const bar     = document.getElementById('product-bulk-bar');
        const countEl = document.getElementById('product-bulk-count');
        if (bar)     bar.classList.toggle('hidden', checked === 0);
        if (countEl) countEl.textContent = checked;
    }

    /**
     * 선택 상품 일괄 삭제
     */
    async bulkDeleteProducts() {
        const checked = [...document.querySelectorAll('.product-checkbox:checked')];
        if (checked.length === 0) return;
        if (!confirm(`선택한 ${checked.length}개 상품을 삭제하시겠습니까?`)) return;
        for (const cb of checked) {
            const id = cb.dataset.productId;
            try {
                if (window.productDataManager) await window.productDataManager.deleteProduct(id);
            } catch (e) { console.error('삭제 실패:', id, e); }
        }
        await this.loadProducts();
    }

    /**
     * 전체 선택 토글
     */
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    /**
     * 전체 선택 상태 업데이트
     */
    updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
        const selectAllCheckbox = document.getElementById('select-all-products');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        }
    }

    /**
     * 상품 모달 열기
     */
    async openProductModal(productId = null) {
        try {
            console.log('📝 상품 등록 모달 열기:', productId);
            
            // 모달은 product-management.html에 인라인으로 포함됨
            const modal = document.getElementById('product-modal');
            if (!modal) {
                console.error('❌ product-modal을 찾을 수 없습니다');
                return;
            }
            
            if (modal) {
                console.log('✅ 상품 모달 발견, 표시 중...');
                
                // 모달 표시
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                
                // 애니메이션을 위한 약간의 지연
                setTimeout(() => {
                    const modalContent = document.getElementById('product-modal-content');
                    if (modalContent) {
                        modalContent.classList.remove('scale-95', 'opacity-0');
                        modalContent.classList.add('scale-100', 'opacity-100');
                    }
                }, 10);
                
                // 모달 제목 설정
                const modalTitle = document.getElementById('product-modal-title');
                if (modalTitle) {
                    if (productId) {
                        modalTitle.textContent = '상품 수정';
                        console.log('📝 모달 제목을 "상품 수정"으로 설정');
                    } else {
                        modalTitle.textContent = '새 상품 등록';
                        console.log('➕ 모달 제목을 "새 상품 등록"으로 설정');
                    }
                }
                
                // 폼 초기화
                this.resetProductForm();
                
                // 카테고리 드롭다운 초기화
                console.log('🔄 카테고리 드롭다운 초기화 중...');
                if (window.updateProductCategoryDropdown) {
                    await window.updateProductCategoryDropdown();
                }
                console.log('✅ 카테고리 드롭다운 초기화 완료');
                
                // 카테고리 이벤트 리스너 설정 (새 카테고리 추가 기능)
                console.log('🔄 카테고리 이벤트 리스너 설정 중...');
                if (this.productUI && typeof this.productUI.setupCategoryEventListeners === 'function') {
                    this.productUI.setupCategoryEventListeners();
                    console.log('✅ 카테고리 이벤트 리스너 설정 완료');
                } else {
                    console.error('❌ ProductUI 또는 setupCategoryEventListeners를 찾을 수 없습니다');
                    console.log('🔍 this.productUI:', this.productUI);
                    
                    // 대체 방법: 직접 이벤트 리스너 등록
                    this.setupCategoryEventListenersFallback();
                }
                
                // 상품명 중복 체크 기능 설정
                console.log('🔄 상품명 중복 체크 기능 설정 중...');
                this.setupProductNameDuplicateCheck();
                console.log('✅ 상품명 중복 체크 기능 설정 완료');
                
                // 수정 모드인 경우 데이터 로드
                if (productId) {
                    await this.loadProductForEdit(productId);
                }
                
                // ESC 키로 모달 닫기 이벤트 추가
                this.setupModalKeyboardEvents();
                
                // 저장 버튼 이벤트 리스너 추가
                this.setupModalSaveButton();
                
                console.log('✅ 상품 모달 열기 완료');
            } else {
                console.error('❌ 상품 모달을 찾을 수 없습니다');
                console.log('🔍 DOM에서 product-modal 검색 결과:', document.querySelectorAll('[id*="product-modal"]'));
            }
        } catch (error) {
            console.error('❌ 상품 모달 열기 실패:', error);
            alert('상품 등록 모달을 열 수 없습니다. 오류: ' + error.message);
        }
    }

    /**
     * 상품 편집
     */
    async editProduct(product) {
        console.log('✏️ 상품 편집:', product.name);
        await this.openProductModal(product.id);
    }

    /**
     * 상품 상세 패널 열기 (읽기 전용)
     */
    openProductDetailPanel(product) {
        const old = document.getElementById('product-detail-panel');
        if (old) old.remove();

        const shippingMap = {
            'always_free': '무료배송', 'normal': '일반배송',
            'included': '배송비포함', 'direct': '직접배송',
            '일반배송': '일반배송', '당일배송': '당일배송',
            '직접배송': '직접배송', '픽업': '픽업'
        };
        const statusMap = { 'active': '판매중', 'inactive': '판매중지', 'soldout': '품절' };

        const fmt   = v => (v != null && v !== '') ? v : '-';
        const fmtP  = v => v ? Number(v).toLocaleString() + '원' : '-';
        const fmtD  = v => v ? new Date(v).toLocaleDateString('ko-KR') : '-';

        const shipping = shippingMap[product.shipping_option] || product.shipping_option || '-';
        const status   = statusMap[product.status] || product.status || '-';
        const statusColor = product.status === 'active'   ? 'text-green-600 bg-green-50'
                          : product.status === 'soldout'  ? 'text-red-500 bg-red-50'
                          : 'text-gray-500 bg-gray-100';

        const profitMargin = product.profit_margin
            ? product.profit_margin + '%'
            : (product.price && product.cost
                ? Math.round((1 - product.cost / product.price) * 100) + '%'
                : '-');

        const imageHtml = product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}" class="w-full h-40 object-cover rounded-lg border border-gray-200">`
            : `<div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-4xl"><i class="fas fa-seedling"></i></div>`;

        const panel = document.createElement('div');
        panel.id = 'product-detail-panel';
        panel.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40';
        panel.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col" style="max-height:90vh;">
                <!-- 헤더 -->
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
                    <span class="text-base font-semibold text-gray-800">상품 상세</span>
                    <div class="flex items-center gap-2">
                        <button id="pd-edit-btn" class="btn-secondary text-xs px-3 py-1.5">
                            <i class="fas fa-edit mr-1"></i>수정
                        </button>
                        <button id="pd-close-btn" class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <!-- 본문 -->
                <div class="overflow-y-auto px-5 py-4 space-y-4">
                    ${imageHtml}
                    <div>
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <h2 class="text-lg font-bold text-gray-900 leading-tight">${fmt(product.name)}</h2>
                            <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}">${status}</span>
                        </div>
                        ${product.product_code ? `<p class="text-xs text-gray-400 font-mono">${product.product_code}</p>` : ''}
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">카테고리</p>
                            <p class="font-medium text-gray-800">${fmt(product.category)}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">사이즈</p>
                            <p class="font-medium text-gray-800">${fmt(product.size)}</p>
                        </div>
                        <div class="bg-green-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">판매가</p>
                            <p class="font-semibold text-green-700 text-base">${fmtP(product.price)}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">매입가</p>
                            <p class="font-medium text-gray-800">${fmtP(product.cost)}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">재고</p>
                            <p class="font-semibold text-gray-900">${product.stock != null ? product.stock + '개' : '-'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-[11px] text-gray-400 mb-0.5">마진율</p>
                            <p class="font-medium text-gray-800">${profitMargin}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3 col-span-2">
                            <p class="text-[11px] text-gray-400 mb-0.5">배송 옵션</p>
                            <p class="font-medium text-gray-800">${shipping}</p>
                        </div>
                    </div>
                    ${product.description ? `
                    <div class="bg-gray-50 rounded-lg p-3 text-sm">
                        <p class="text-[11px] text-gray-400 mb-1">상품 설명</p>
                        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${product.description}</p>
                    </div>` : ''}
                    <div class="flex gap-4 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                        <span>등록일 ${fmtD(product.created_at)}</span>
                        <span>수정일 ${fmtD(product.updated_at)}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        panel.querySelector('#pd-close-btn').addEventListener('click', () => panel.remove());
        panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
        panel.querySelector('#pd-edit-btn').addEventListener('click', () => {
            panel.remove();
            this.editProduct(product);
        });
    }

    /**
     * 상품 폼 초기화
     */
    resetProductForm() {
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
            // 숨겨진 필드들 초기화
            document.getElementById('product-form-id').value = '';
            document.getElementById('product-form-created-at').value = '';
        }
    }

    /**
     * 상품 저장
     */
    async saveProduct() {
        try {
            console.log('💾 상품 저장 시작...');
            
            // 안전한 폼 데이터 수집
            const getFormValue = (elementId, defaultValue = '') => {
                const element = document.getElementById(elementId);
                return element ? element.value : defaultValue;
            };
            
            const getFormNumber = (elementId, defaultValue = 0) => {
                const element = document.getElementById(elementId);
                if (!element) return defaultValue;
                const value = parseFloat(element.value);
                return isNaN(value) ? defaultValue : value;
            };
            
            const formData = {
                id: getFormValue('product-form-id'), // 수정 모드용 ID 추가
                name: getFormValue('product-form-name'),
                category: getFormValue('product-form-category'),
                price: getFormNumber('product-form-price', 0),
                cost: getFormNumber('product-form-wholesale-price', 0), // 올바른 ID 사용
                stock: getFormNumber('product-form-stock', 0),
                description: getFormValue('product-form-description'),
                size: getFormValue('product-form-size-select'),
                shipping_option: getFormValue('product-form-shipping')
            };
            
            console.log('📋 수집된 폼 데이터:', formData);
            
            // 필수 필드 검증
            if (!formData.name || !formData.category) {
                alert('상품명과 카테고리는 필수 입력 항목입니다.');
                return;
            }
            
            // 폼 요소 존재 여부 확인
            const requiredElements = [
                'product-form-name',
                'product-form-category', 
                'product-form-price',
                'product-form-stock'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                console.error('❌ 필수 폼 요소를 찾을 수 없습니다:', missingElements);
                alert('상품 등록 폼이 완전히 로드되지 않았습니다. 페이지를 새로고침해주세요.');
                return;
            }
            
            console.log('📝 저장할 상품 데이터:', formData);
            
            // 수정 모드인지 확인 (ID가 있고 유효한 값인지 확인)
            const isEditMode = formData.id && formData.id.trim() !== '' && formData.id !== 'undefined';
            console.log('🔍 저장 모드:', isEditMode ? '수정' : '등록');
            console.log('🔍 폼 데이터 ID:', formData.id);
            
            // Supabase를 통한 상품 저장/수정
            if (window.productDataManager) {
                if (isEditMode) {
                    console.log('🌐 Supabase를 통한 상품 수정 시작...');
                    await window.productDataManager.updateProduct(formData.id, formData);
                    console.log('✅ Supabase 상품 수정 완료');
                } else {
                    console.log('🌐 Supabase를 통한 상품 등록 시작...');
                    await window.productDataManager.addProduct(formData);
                    console.log('✅ Supabase 상품 등록 완료');
                }
                
                // 모달 닫기
                this.closeProductModal();
                
                // 상품 목록 새로고침
                await this.loadProducts();
                
                alert(`상품이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다.`);
            } else {
                console.error('❌ productDataManager를 찾을 수 없습니다');
                alert('상품 데이터 관리자를 찾을 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 상품 저장 실패:', error);
            
            // 중복 상품명 에러인 경우 특별 처리
            if (error.message.includes('이미 등록된 상품명입니다')) {
                // 에러 메시지에 기존 상품 정보가 포함되어 있으므로 그대로 표시
                alert(error.message);
            } else {
                // 기타 에러의 경우 일반적인 메시지 표시
                alert('상품 저장 중 오류가 발생했습니다: ' + error.message);
            }
        }
    }

    /**
     * 상품 모달 닫기
     */
    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        // 즉시 숨김 (style + class 이중 처리)
        modal.style.display = 'none';
        modal.classList.add('hidden');

        // 애니메이션 초기 상태 복원 (다음 열기를 위해)
        const modalContent = document.getElementById('product-modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
        }
    }
    
    /**
     * 모달 키보드 이벤트 설정
     */
    setupModalKeyboardEvents() {
        // ESC 키로 모달 닫기
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                this.closeProductModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // 모달 배경 클릭으로 닫기
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.closeProductModal();
                }
            });
        }
    }
    
    /**
     * 모달 저장 버튼 이벤트 설정
     */
    setupModalSaveButton() {
        const saveBtn = document.getElementById('save-product-btn');
        if (saveBtn) {
            // cloneNode로 버튼을 교체해 기존 리스너를 완전히 제거
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

            // 새로운 이벤트 리스너 추가
            this.handleSaveProduct = async () => {
                await this.saveProduct();
            };
            newSaveBtn.addEventListener('click', this.handleSaveProduct);
            console.log('✅ 모달 저장 버튼 이벤트 리스너 등록 완료');
        }
    }

    /**
     * 편집용 상품 데이터 로드
     */
    async loadProductForEdit(productId) {
        try {
            console.log('📝 편집용 상품 데이터 로드:', productId);
            
            if (window.productDataManager) {
                const product = window.productDataManager.getProductById(productId);
                if (product) {
                    console.log('📦 편집할 상품 데이터:', product);
                    
                    // 폼 필드들이 로드될 때까지 기다리기
                    await this.waitForFormFields();
                    
                    // 폼 필드에 데이터 채우기
                    this.fillProductForm(product);
                    
                    console.log('✅ 편집용 상품 데이터 로드 완료');
                } else {
                    console.error('❌ 상품을 찾을 수 없습니다:', productId);
                }
            } else {
                console.error('❌ productDataManager를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 편집용 상품 데이터 로드 실패:', error);
        }
    }
    
    // 폼 필드들이 로드될 때까지 기다리는 함수
    async waitForFormFields() {
        const requiredFields = [
            'product-form-name',
            'product-form-category', 
            'product-form-price',
            'product-form-wholesale-price', // 실제 HTML 필드 ID
            'product-form-stock',
            'product-form-description',
            'product-form-image',
            'product-form-id',
            'product-form-created-at'
        ];
        
        let retryCount = 0;
        const maxRetries = 50; // 5초 대기 (시간 증가)
        
        console.log('🔍 폼 필드 로드 대기 시작...');
        console.log('🔍 찾는 필드들:', requiredFields);
        
        while (retryCount < maxRetries) {
            const missingFields = requiredFields.filter(fieldId => !document.getElementById(fieldId));
            
            if (missingFields.length === 0) {
                console.log('✅ 모든 폼 필드 로드 완료');
                return;
            }
            
            if (retryCount % 10 === 0) { // 10번마다 로그 출력
                console.log(`🔄 폼 필드 로드 대기 중... (${retryCount + 1}/${maxRetries})`);
                console.log('❌ 누락된 필드들:', missingFields);
                
                // DOM 구조 디버깅
                console.log('🔍 현재 DOM에서 찾을 수 있는 폼 필드들:');
                const allFormFields = document.querySelectorAll('#product-form input, #product-form select, #product-form textarea');
                allFormFields.forEach(field => {
                    console.log(`  - ${field.id}: ${field.type || field.tagName}`);
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            retryCount++;
        }
        
        console.error('❌ 폼 필드 로드 타임아웃');
        throw new Error('상품 폼 필드들을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
    }
    
    // 상품 폼에 데이터 채우는 함수
    fillProductForm(product) {
        try {
            const fields = {
                'product-form-name': product.name || '',
                'product-form-category': product.category || '',
                'product-form-price': product.price || '',
                'product-form-wholesale-price': product.cost || '', // 실제 HTML 필드 ID
                'product-form-stock': product.stock || '',
                'product-form-description': product.description || '',
                'product-form-image': product.image_url || '',
                'product-form-id': product.id,
                'product-form-created-at': product.created_at
            };
            
            Object.entries(fields).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                    console.log(`✅ ${fieldId} 설정:`, value);
                } else {
                    console.warn(`⚠️ ${fieldId} 필드를 찾을 수 없습니다`);
                }
            });
            
        } catch (error) {
            console.error('❌ 상품 폼 데이터 채우기 실패:', error);
        }
    }

    /**
     * 상품 복제
     */
    async duplicateProduct(product) {
        if (confirm(`"${product.name}" 상품을 복제하시겠습니까?`)) {
            try {
                const duplicatedProduct = {
                    ...product,
                    id: this.generateUUID(),
                    name: `${product.name} (복사본)`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                // productDataManager를 통해 복제
                if (window.productDataManager) {
                    await window.productDataManager.addProduct(duplicatedProduct);
                    await this.loadProducts(); // 데이터 새로고침
                    console.log('📋 상품 복제 완료:', duplicatedProduct.name);
                } else {
                    console.error('❌ productDataManager를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('❌ 상품 복제 실패:', error);
                alert('상품 복제에 실패했습니다: ' + error.message);
            }
        }
    }

    /**
     * 상품 삭제
     */
    async deleteProduct(product) {
        if (confirm(`정말로 "${product.name}" 상품을 삭제하시겠습니까?`)) {
            try {
                // productDataManager를 통해 삭제
                if (window.productDataManager) {
                    await window.productDataManager.deleteProduct(product.id);
                    await this.loadProducts(); // 데이터 새로고침
                    console.log('🗑️ 상품 삭제 완료:', product.name);
                } else {
                    console.error('❌ productDataManager를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('❌ 상품 삭제 실패:', error);
                alert('상품 삭제에 실패했습니다: ' + error.message);
            }
        }
    }

    /** 일괄 등록 모달 열기 */
    openImportModal() {
        const modal = document.getElementById('product-import-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        this._resetImport();
        // 전역 함수 등록 (HTML onclick에서 호출)
        window._closeProductImport  = () => this.closeImportModal();
        window._switchImportTab     = (t) => this._switchTab(t);
        window._onPasteInput        = () => this._onPasteInput();
        // 이벤트 (한 번만 등록하도록 플래그)
        if (!modal._importEventsReady) {
            modal._importEventsReady = true;
            this._bindImportEvents();
        }
        // 붙여넣기 textarea 포커스
        setTimeout(() => document.getElementById('product-paste-textarea')?.focus(), 100);
    }

    /** 모달 상태 초기화 */
    _resetImport() {
        // 붙여넣기 탭 활성화
        this._switchTab('manual');
        // textarea 비우기
        const ta = document.getElementById('product-paste-textarea');
        if (ta) ta.value = '';
        // 미리보기 숨기기
        document.getElementById('paste-preview-section')?.classList.add('hidden');
        // 파일 탭 초기화
        const fi = document.getElementById('product-excel-input');
        if (fi) fi.value = '';
        document.getElementById('product-upload-area-content')?.classList.remove('hidden');
        document.getElementById('product-upload-file-info')?.classList.add('hidden');
        document.getElementById('product-import-preview')?.classList.add('hidden');
        // 진행바 숨기기
        document.getElementById('product-import-progress')?.classList.add('hidden');
        window.productImportData = null;
        this._refreshImportCount();
    }

    /** 탭 전환 */
    _switchTab(tab) {
        const manualBtn = document.getElementById('product-upload-method-manual');
        const fileBtn   = document.getElementById('product-upload-method-excel');
        const manualSec = document.getElementById('product-manual-input-section');
        const fileSec   = document.getElementById('product-excel-upload-section');
        const isManual  = tab === 'manual';
        manualBtn?.classList.toggle('border-green-500', isManual);
        manualBtn?.classList.toggle('text-green-600',   isManual);
        manualBtn?.classList.toggle('border-transparent', !isManual);
        manualBtn?.classList.toggle('text-gray-400',    !isManual);
        fileBtn?.classList.toggle('border-green-500',   !isManual);
        fileBtn?.classList.toggle('text-green-600',     !isManual);
        fileBtn?.classList.toggle('border-transparent',  isManual);
        fileBtn?.classList.toggle('text-gray-400',       isManual);
        manualSec?.classList.toggle('hidden', !isManual);
        fileSec?.classList.toggle('hidden',    isManual);
        this._refreshImportCount();
    }

    /** 붙여넣기 textarea 입력 처리 */
    _onPasteInput() {
        const ta = document.getElementById('product-paste-textarea');
        const text = ta?.value?.trim() || '';
        if (!text) {
            window.productImportData = null;
            document.getElementById('paste-preview-section')?.classList.add('hidden');
            this._refreshImportCount();
            return;
        }
        // 탭 구분(엑셀) 또는 쉼표 구분 자동 감지
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const useTab = lines[0]?.includes('\t');
        const products = [];
        for (const line of lines) {
            const cols = useTab ? line.split('\t') : line.split(',');
            const name     = String(cols[0] || '').trim();
            const category = String(cols[1] || '').trim();
            // 헤더행 자동 감지 (숫자가 아닌 첫 줄 건너뜀)
            if (!name || name === '상품명') continue;
            if (!category || category === '카테고리') continue;
            products.push({
                name,
                category,
                price:           parseFloat(String(cols[2] || '').replace(/,/g, '')) || 0,
                cost:            parseFloat(String(cols[3] || '').replace(/,/g, '')) || 0,
                stock:           parseInt(cols[4]) || 0,
                size:            String(cols[5] || '').trim(),
                shipping_option: String(cols[6] || '일반배송').trim() || '일반배송',
                description:     String(cols[7] || '').trim(),
            });
        }
        window.productImportData = products;
        this._showPastePreview(products);
        this._refreshImportCount();
    }

    /** 붙여넣기 결과 미리보기 */
    _showPastePreview(products) {
        const section  = document.getElementById('paste-preview-section');
        const countEl  = document.getElementById('paste-preview-count');
        const thead    = document.getElementById('paste-preview-thead');
        const tbody    = document.getElementById('paste-preview-tbody');
        if (!section || !thead || !tbody) return;
        if (products.length === 0) {
            section.classList.add('hidden');
            return;
        }
        const cols = ['상품명','카테고리','판매가','매입가','재고','사이즈','배송옵션','설명'];
        const keys = ['name','category','price','cost','stock','size','shipping_option','description'];
        if (countEl) countEl.textContent = `${products.length}개 상품 인식됨`;
        thead.innerHTML = cols.map(c =>
            `<th class="px-3 text-left whitespace-nowrap">${c}</th>`
        ).join('');
        tbody.innerHTML = products.slice(0, 30).map((p, i) =>
            `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">` +
            keys.map(k => {
                const v = (k === 'price' || k === 'cost') ? (p[k] || 0).toLocaleString() : (p[k] || '-');
                return `<td class="px-3 td-secondary whitespace-nowrap">${v}</td>`;
            }).join('') +
            '</tr>'
        ).join('') + (products.length > 30
            ? `<tr><td colspan="8" class="px-3 text-center td-muted">... 외 ${products.length - 30}개</td></tr>`
            : '');
        section.classList.remove('hidden');
    }

    /** 카운트 및 버튼 상태 갱신 */
    _refreshImportCount() {
        const count   = (window.productImportData || []).length;
        const countEl = document.getElementById('import-row-count');
        if (countEl) {
            countEl.textContent  = count > 0 ? `${count}개 등록 예정` : '0개';
            countEl.className    = count > 0 ? 'text-sm font-semibold text-green-600' : 'text-sm text-gray-400';
        }
        const btn = document.getElementById('product-import-start');
        if (btn) btn.disabled = count === 0;
    }

    /** 이벤트 바인딩 (최초 1회) */
    _bindImportEvents() {
        // ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('product-import-modal')?.style.display !== 'none') {
                this.closeImportModal();
            }
        });

        // 붙여넣기 textarea
        document.getElementById('product-paste-textarea')?.addEventListener('input', () => this._onPasteInput());

        // 등록 시작
        document.getElementById('product-import-start')?.addEventListener('click', () => this.startProductImport());

        // 파일 업로드 탭 이벤트
        const dropZone  = document.getElementById('product-drop-zone');
        const fileInput = document.getElementById('product-excel-input');
        dropZone?.addEventListener('click', (e) => {
            if (!e.target.closest('#product-remove-file-btn')) fileInput?.click();
        });
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files[0]) this._handleFileUpload(e.target.files[0]);
        });
        dropZone?.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('border-green-400','bg-green-50'); });
        dropZone?.addEventListener('dragleave', ()  => { dropZone.classList.remove('border-green-400','bg-green-50'); });
        dropZone?.addEventListener('drop',      (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-green-400','bg-green-50');
            const f = e.dataTransfer.files[0];
            if (f) this._handleFileUpload(f);
        });
        document.getElementById('product-remove-file-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (fileInput) fileInput.value = '';
            document.getElementById('product-upload-area-content')?.classList.remove('hidden');
            document.getElementById('product-upload-file-info')?.classList.add('hidden');
            document.getElementById('product-import-preview')?.classList.add('hidden');
            window.productImportData = null;
            this._refreshImportCount();
        });
        document.getElementById('download-product-template-btn')?.addEventListener('click', () => this._downloadTemplate());
    }

    /** CSV 양식 다운로드 */
    _downloadTemplate() {
        const bom = '\uFEFF';
        const header = '상품명,카테고리,판매가,매입가,재고,사이즈,배송옵션,설명';
        const rows = [
            'White Platter 대,다육식물,15000,8000,20,대,일반배송,예쁜 화이트 플래터',
            '에케베리아 소,다육식물,5000,2000,50,소,일반배송,소형 에케베리아',
            '세덤 혼합,다육식물,3000,1500,100,,일반배송,',
        ];
        const blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '상품_일괄등록_양식.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    /** 파일 업로드 처리 */
    _handleFileUpload(file) {
        document.getElementById('product-upload-area-content')?.classList.add('hidden');
        document.getElementById('product-upload-file-info')?.classList.remove('hidden');
        const nameEl = document.getElementById('product-upload-file-name');
        const sizeEl = document.getElementById('product-upload-file-size');
        if (nameEl) nameEl.textContent = file.name;
        if (sizeEl) sizeEl.textContent = this._fmtSize(file.size);

        const reader = new FileReader();
        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.onload = (e) => this._parseCsvText(e.target.result);
            reader.readAsText(file, 'UTF-8');
        } else if (/\.xlsx?$/i.test(file.name)) {
            reader.onload = (e) => {
                if (typeof XLSX !== 'undefined') {
                    try {
                        const wb   = XLSX.read(e.target.result, { type: 'array' });
                        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
                        this._parseRowArrays(rows);
                    } catch (err) { alert('Excel 파일 읽기 실패: ' + err.message); }
                } else {
                    alert('Excel(.xlsx) 지원을 위한 라이브러리가 없습니다.\nCSV로 저장 후 업로드해주세요.');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('지원 형식: .csv, .xlsx, .xls');
        }
    }

    _parseCsvText(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        this._parseRowArrays(lines.map(l => l.split(',')));
    }

    _parseRowArrays(rows) {
        const products = [];
        for (const cols of rows) {
            const name     = String(cols[0] || '').trim();
            const category = String(cols[1] || '').trim();
            if (!name || name === '상품명') continue;
            if (!category || category === '카테고리') continue;
            products.push({
                name, category,
                price:           parseFloat(String(cols[2] || '').replace(/,/g, '')) || 0,
                cost:            parseFloat(String(cols[3] || '').replace(/,/g, '')) || 0,
                stock:           parseInt(cols[4]) || 0,
                size:            String(cols[5] || '').trim(),
                shipping_option: String(cols[6] || '일반배송').trim() || '일반배송',
                description:     String(cols[7] || '').trim(),
            });
        }
        window.productImportData = products;
        this._showFilePreview(products);
        this._refreshImportCount();
    }

    _showFilePreview(products) {
        const section  = document.getElementById('product-import-preview');
        const content  = document.getElementById('product-preview-content');
        const countEl  = document.getElementById('product-preview-count');
        if (!section || !content) return;
        if (countEl) countEl.textContent = `총 ${products.length}개`;
        const cols = ['상품명','카테고리','판매가','매입가','재고','사이즈','배송옵션'];
        const keys = ['name','category','price','cost','stock','size','shipping_option'];
        let html = `<table class="table-ui"><thead><tr>` +
            cols.map(c => `<th class="whitespace-nowrap">${c}</th>`).join('') +
            `</tr></thead><tbody>` +
            products.slice(0, 20).map(p =>
                `<tr>` +
                keys.map(k => `<td class="${(k.includes('price')||k.includes('cost'))?'num':''} whitespace-nowrap">${k.includes('price')||k.includes('cost')?(p[k]||0).toLocaleString():(p[k]||'-')}</td>`).join('') +
                `</tr>`
            ).join('') +
            (products.length > 20 ? `<tr><td colspan="7" class="px-2 text-center td-muted">... 외 ${products.length-20}개</td></tr>` : '') +
            `</tbody></table>`;
        content.innerHTML = html;
        section.classList.remove('hidden');
    }

    _fmtSize(b) {
        if (!b) return '0 B';
        const k = 1024, s = ['B','KB','MB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
    }

    /** 일괄 등록 실행 */
    async startProductImport() {
        const products = window.productImportData || [];
        if (products.length === 0) {
            alert('등록할 상품이 없습니다.\n상품명과 카테고리를 입력(또는 붙여넣기)하세요.');
            return;
        }
        const total = products.length;
        let ok = 0, fail = 0;
        const progress = document.getElementById('product-import-progress');
        progress?.classList.remove('hidden');
        for (let i = 0; i < total; i++) {
            try {
                if (window.productDataManager) { await window.productDataManager.addProduct(products[i]); ok++; }
                else fail++;
            } catch { fail++; }
            this.updateProgress(i + 1, total);
            await new Promise(r => setTimeout(r, 60));
        }
        progress?.classList.add('hidden');
        this.closeImportModal();
        if (ok > 0) {
            alert(`일괄등록 완료!\n성공 ${ok}개${fail ? ' / 실패 ' + fail + '개' : ''}`);
            await this.loadProducts();
        } else {
            alert(`등록에 실패했습니다 (${fail}개 오류)`);
        }
    }

    updateProgress(current, total) {
        const bar  = document.getElementById('product-progress-bar');
        const text = document.getElementById('product-progress-text');
        if (bar)  bar.style.width  = `${Math.round(current / total * 100)}%`;
        if (text) text.textContent = `${current} / ${total}`;
    }

    /** 모달 닫기 */
    closeImportModal() {
        const modal = document.getElementById('product-import-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
        window.productImportData = null;
    }

    // 하위 호환 alias
    setupImportModalEvents() {}
    resetImportModal()       { this._resetImport(); }

    /**
     * 상품 데이터 내보내기
     */
    exportProducts() {
        console.log('📤 상품 데이터 내보내기');
        // TODO: Excel 내보내기 구현
    }

    /**
     * UUID 생성
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 날짜 포맷팅
     */
    formatDate(dateString) {
        // 공통 포맷터 위임 (utils/formatters.js → window.formatDate)
        return (window.fmt?.date ?? window.formatDate ?? ((v) => v ? v.slice(0,10) : '-'))(dateString);
    }

    /**
     * 통화 포맷팅
     */
    formatCurrency(amount) {
        // 공통 포맷터 위임 (utils/formatters.js → window.formatCurrency)
        return (window.fmt?.currency ?? window.formatCurrency ?? ((v) => '₩' + Number(v).toLocaleString()))(amount);
    }

    /**
     * 카테고리 관리 모달 열기
     */
    openCategoryManagement() {
        console.log('📂 카테고리 관리 모달 열기');
        
        try {
            // 카테고리 관리 모달 열기
            if (window.openCategoryModal) {
                window.openCategoryModal();
            } else {
                console.error('❌ openCategoryModal 함수를 찾을 수 없습니다');
                alert('카테고리 관리 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
            }
        } catch (error) {
            console.error('❌ 카테고리 관리 모달 열기 실패:', error);
            alert('카테고리 관리 모달을 열 수 없습니다: ' + error.message);
        }
    }

    /**
     * 상품명 실시간 중복 체크 설정
     */
    setupProductNameDuplicateCheck() {
        console.log('🔍 상품명 실시간 중복 체크 설정 시작...');
        
        // 상품명 입력 필드가 로드될 때까지 대기
        const checkForNameField = () => {
            const nameField = document.getElementById('product-form-name');
            if (nameField) {
                console.log('✅ 상품명 입력 필드 발견, 이벤트 리스너 설정 중...');
                
                // 기존 이벤트 리스너 제거 (중복 방지)
                nameField.removeEventListener('input', this.handleProductNameInput);
                nameField.removeEventListener('blur', this.handleProductNameBlur);
                nameField.removeEventListener('focus', this.handleProductNameFocus);
                
                // 새로운 이벤트 리스너 추가
                this.handleProductNameInput = (e) => {
                    this.checkProductNameDuplicate(e.target.value);
                };
                
                this.handleProductNameBlur = (e) => {
                    this.hideProductNameSuggestions();
                };
                
                this.handleProductNameFocus = (e) => {
                    if (e.target.value) {
                        this.showProductNameSuggestions(e.target.value);
                    }
                };
                
                nameField.addEventListener('input', this.handleProductNameInput);
                nameField.addEventListener('blur', this.handleProductNameBlur);
                nameField.addEventListener('focus', this.handleProductNameFocus);
                
                console.log('✅ 상품명 실시간 중복 체크 설정 완료');
            } else {
                // 필드가 아직 로드되지 않았으면 다시 시도
                setTimeout(checkForNameField, 100);
            }
        };
        
        checkForNameField();
    }

    /**
     * 상품명 중복 체크
     */
    checkProductNameDuplicate(productName) {
        try {
            console.log('🔍 상품명 중복 체크:', productName);
            
            if (!productName || productName.trim() === '') {
                this.hideDuplicateWarning();
                this.hideProductNameSuggestions();
                return;
            }
            
            const trimmedName = productName.trim();
            
            // 현재 편집 중인 상품 ID 가져오기
            const currentProductId = document.getElementById('product-form-id')?.value;
            
            // 중복 상품 찾기 (자기 자신 제외)
            const duplicateProduct = this.products.find(p => 
                p.name === trimmedName && p.id !== currentProductId
            );
            
            if (duplicateProduct) {
                console.log('⚠️ 중복된 상품명 발견:', duplicateProduct);
                this.showDuplicateWarning(duplicateProduct);
            } else {
                console.log('✅ 상품명 중복 없음');
                this.hideDuplicateWarning();
            }
            
            // 자동완성 제안 표시
            this.showProductNameSuggestions(trimmedName);
            
        } catch (error) {
            console.error('❌ 상품명 중복 체크 실패:', error);
        }
    }

    /**
     * 중복 경고 표시
     */
    showDuplicateWarning(duplicateProduct) {
        const warningElement = document.getElementById('product-name-duplicate-warning');
        if (warningElement) {
            warningElement.classList.remove('hidden');
            warningElement.innerHTML = `
                <i class="fas fa-exclamation-triangle mr-1"></i>
                이미 등록된 상품명입니다 (카테고리: ${duplicateProduct.category}, 가격: ${this.formatCurrency(duplicateProduct.price)})
            `;
        }
        
        // 상품명 입력 필드 스타일 변경
        const nameField = document.getElementById('product-form-name');
        if (nameField) {
            nameField.classList.add('border-orange-500', 'bg-orange-50');
            nameField.classList.remove('border-gray-300');
        }
    }

    /**
     * 중복 경고 숨김
     */
    hideDuplicateWarning() {
        const warningElement = document.getElementById('product-name-duplicate-warning');
        if (warningElement) {
            warningElement.classList.add('hidden');
        }
        
        // 상품명 입력 필드 스타일 복원
        const nameField = document.getElementById('product-form-name');
        if (nameField) {
            nameField.classList.remove('border-orange-500', 'bg-orange-50');
            nameField.classList.add('border-gray-300');
        }
    }

    /**
     * 상품명 자동완성 제안 표시
     */
    showProductNameSuggestions(query) {
        try {
            if (!query || query.trim() === '') {
                this.hideProductNameSuggestions();
                return;
            }
            
            const trimmedQuery = query.trim().toLowerCase();
            
            // 유사한 상품명 찾기
            const suggestions = this.products
                .filter(product => 
                    product.name.toLowerCase().includes(trimmedQuery) &&
                    product.name.toLowerCase() !== trimmedQuery
                )
                .slice(0, 5) // 최대 5개 제안
                .map(product => ({
                    name: product.name,
                    category: product.category,
                    price: product.price
                }));
            
            if (suggestions.length > 0) {
                this.renderProductNameSuggestions(suggestions);
            } else {
                this.hideProductNameSuggestions();
            }
            
        } catch (error) {
            console.error('❌ 상품명 자동완성 실패:', error);
        }
    }

    /**
     * 상품명 자동완성 제안 렌더링
     */
    renderProductNameSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('product-name-suggestions');
        if (!suggestionsContainer) return;
        
        const html = suggestions.map(suggestion => `
            <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="selectProductNameSuggestion('${suggestion.name}')">
                <div class="text-sm font-medium text-gray-900">${suggestion.name}</div>
                <div class="text-xs text-gray-500">${suggestion.category} • ${this.formatCurrency(suggestion.price)}</div>
            </div>
        `).join('');
        
        suggestionsContainer.innerHTML = html;
        suggestionsContainer.classList.remove('hidden');
    }

    /**
     * 상품명 자동완성 제안 숨김
     */
    hideProductNameSuggestions() {
        const suggestionsContainer = document.getElementById('product-name-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.add('hidden');
        }
    }

    /**
     * 상품명 제안 선택
     */
    selectProductNameSuggestion(productName) {
        const nameField = document.getElementById('product-form-name');
        if (nameField) {
            nameField.value = productName;
            nameField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        this.hideProductNameSuggestions();
    }

    /**
     * 카테고리 이벤트 리스너 설정 (대체 방법)
     */
    setupCategoryEventListenersFallback() {
        try {
            console.log('🔄 대체 방법으로 카테고리 이벤트 리스너 설정 시작...');
            
            const categorySelect = document.getElementById('product-form-category');
            if (categorySelect) {
                console.log('🔍 카테고리 선택 필드 발견');
                
                // 이미 리스너가 추가되었는지 확인
                if (!categorySelect.dataset.listenerAdded) {
                    // 핸들러 함수 정의
                    const handleCategoryChange = async (e) => {
                        console.log('🔔 카테고리 선택 변경됨:', e.target.value);
                        if (e.target.value === '__ADD_NEW__') {
                            console.log('➕ 새 카테고리 추가 선택됨 - 모달 열기 시작');
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // 선택 초기화
                            categorySelect.value = '';
                            
                            // 상품 모달 숨기기
                            const productModal = document.getElementById('product-modal');
                            if (productModal) {
                                productModal.style.display = 'none';
                                console.log('✅ 상품 모달 숨김');
                            }
                            
                            // 카테고리 관리 모달 열기
                            if (window.openCategoryModal) {
                                await window.openCategoryModal();
                                console.log('✅ 카테고리 관리 모달 열림');
                                
                                // 카테고리 모달 닫기 이벤트 설정
                                const categoryModal = document.getElementById('category-modal');
                                if (categoryModal) {
                                    const observer = new MutationObserver((mutations) => {
                                        mutations.forEach((mutation) => {
                                            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                                                const isHidden = categoryModal.classList.contains('hidden') || 
                                                               categoryModal.style.display === 'none';
                                                if (isHidden && productModal) {
                                                    console.log('🔄 카테고리 모달이 닫힘 - 상품 모달 다시 표시');
                                                    productModal.style.display = 'flex';
                                                    
                                                    // 카테고리 드롭다운 업데이트
                                                    if (window.updateProductCategoryDropdown) {
                                                        window.updateProductCategoryDropdown();
                                                    }
                                                    
                                                    observer.disconnect();
                                                }
                                            }
                                        });
                                    });
                                    
                                    observer.observe(categoryModal, { attributes: true, attributeFilter: ['class', 'style'] });
                                }
                            } else {
                                console.error('❌ openCategoryModal 함수를 찾을 수 없습니다');
                                // 상품 모달 다시 표시
                                if (productModal) {
                                    productModal.style.display = 'flex';
                                }
                            }
                        }
                    };
                    
                    categorySelect.addEventListener('change', handleCategoryChange);
                    categorySelect.dataset.listenerAdded = 'true';
                    
                    console.log('✅ 대체 방법으로 카테고리 선택 이벤트 리스너 추가 완료');
                } else {
                    console.log('ℹ️ 카테고리 선택 이벤트 리스너가 이미 등록되어 있습니다');
                }
            } else {
                console.error('❌ 카테고리 선택 필드를 찾을 수 없습니다!');
            }
            
        } catch (error) {
            console.error('❌ 대체 방법으로 카테고리 이벤트 리스너 설정 실패:', error);
        }
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        console.log('🗑️ ProductManagement 컴포넌트 제거...');
        this.isInitialized = false;
    }
}

// 전역 함수들 등록
window.clearProductUploadFile = function() {
    document.getElementById('product-excel-input').value = '';
    document.getElementById('product-upload-area-content').classList.remove('hidden');
    document.getElementById('product-upload-file-info').classList.add('hidden');
    
    // 미리보기 숨김
    if (window.productManagementComponent) {
        window.productManagementComponent.hidePreview();
        window.productManagementComponent.updateImportButtonState();
    }
};

// 상품명 제안 선택 함수
window.selectProductNameSuggestion = function(productName) {
    if (window.productManagementComponent) {
        window.productManagementComponent.selectProductNameSuggestion(productName);
    }
};

// 전역에 ProductManagementComponent 클래스 등록
window.ProductManagementComponent = ProductManagementComponent;

// 컴포넌트 등록
if (window.componentLoader) {
    window.componentLoader.registerComponent('product-management', {
        template: 'components/product-management/product-management.html',
        script: 'components/product-management/product-management.js',
        init: async (container, data) => {
            const productManagementComponent = new ProductManagementComponent();
            await productManagementComponent.init(container, data);
            
            // 전역에 등록
            window.productManagementComponent = productManagementComponent;
            console.log('✅ productManagementComponent 전역 등록 완료');
            
            return productManagementComponent;
        }
    });
}

// 전역 함수들 등록
window.openProductModal = (productId = null) => {
    if (window.productManagementComponent) {
        window.productManagementComponent.openProductModal(productId);
    }
};

window.closeProductModal = () => {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    // 컴포넌트 메서드도 추가 호출 (폼 초기화 등)
    if (window.productManagementComponent) {
        window.productManagementComponent.closeProductModal();
    }
};

// 카테고리 관리 함수들
window.openCategoryManagement = () => {
    if (window.productManagementComponent) {
        window.productManagementComponent.openCategoryManagement();
    }
};

// 상품관리 이벤트 리스너 정리 함수
function cleanupProductEventListeners() {
    try {
        console.log('🧹 상품관리 이벤트 리스너 정리 중...');
        
        // ProductManagementComponent 인스턴스가 있으면 정리
        if (window.productManagementComponent && window.productManagementComponent.removeEventListeners) {
            window.productManagementComponent.removeEventListeners();
        }
        
        // 전역 이벤트 리스너 정리
        if (window.productEventListeners) {
            window.productEventListeners.forEach(listener => {
                if (listener.element && listener.event && listener.handler) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            window.productEventListeners = [];
        }
        
        console.log('✅ 상품관리 이벤트 리스너 정리 완료');
    } catch (error) {
        console.error('❌ 상품관리 이벤트 리스너 정리 실패:', error);
    }
}

// 전역 함수로 등록
window.cleanupProductEventListeners = cleanupProductEventListeners;

// 상품 관리 컴포넌트 동적 로드 함수
async function loadProductManagementComponent() {
    try {
        console.log('📋 상품 관리 컴포넌트 로드 시작...');
        
        let productsContainer = document.getElementById('products-section');
        if (!productsContainer) {
            console.error('❌ products-section 요소를 찾을 수 없습니다');
            return false;
        }
        
        // 항상 HTML을 새로 로드 (재방문 시 flex context 깨짐 방지)
        console.log('📋 상품 관리 HTML 로드 중...');

        // HTML 로드
        const response = await fetch('components/product-management/product-management.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        productsContainer.innerHTML = html;
        console.log('📦 HTML 로드 완료');

        // 고객관리와 동일한 패턴: inner div를 outer와 교체 (ID 중복·display 충돌 방지)
        const inner = productsContainer.querySelector('#products-section');
        if (inner) {
            productsContainer.replaceWith(inner);
            productsContainer = inner;
            console.log('🔄 products-section outer → inner replaceWith 완료');
        }

        // 컴포넌트 초기화
        if (window.ProductManagementComponent) {
            const productManagementComponent = new window.ProductManagementComponent();
            await productManagementComponent.init(productsContainer);
            // 전역에 저장
            window.productManagementComponent = productManagementComponent;
            console.log('✅ 상품 관리 컴포넌트 초기화 완료');
        } else {
            console.error('❌ ProductManagementComponent를 찾을 수 없습니다');
        }

        return true;
        
    } catch (error) {
        console.error('❌ 상품 관리 컴포넌트 로드 실패:', error);
        return false;
    }
}

// 상품 모달 로드 함수
async function loadProductModal() {
    try {
        console.log('📦 상품 모달 로드 시작...');
        
        // 모달이 이미 존재하는지 확인
        let modal = document.getElementById('product-modal');
        if (modal) {
            console.log('✅ 상품 모달이 이미 존재합니다');
            return true;
        }
        
        // 모달 HTML 로드
        const response = await fetch('components/product-management/product-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // body에 모달 추가
        document.body.insertAdjacentHTML('beforeend', html);
        
        console.log('✅ 상품 모달 HTML 로드 완료');
        return true;
        
    } catch (error) {
        console.error('❌ 상품 모달 로드 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.loadProductModal = loadProductModal;
window.loadProductManagementComponent = loadProductManagementComponent;

console.log('✅ ProductManagement 컴포넌트 스크립트 로드 완료');
