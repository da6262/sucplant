/**
 * 상품 관리 컴포넌트 스크립트
 * 경산다육식물농장 관리시스템
 */

// 테이블 내 바코드 SVG 렌더링
function renderBarcodeSVGs() {
    const svgs = document.querySelectorAll('.barcode-img[data-barcode]');
    if (!svgs.length) return;
    function doRender() {
        svgs.forEach(svg => {
            const bc = svg.dataset.barcode;
            if (!bc || svg.dataset.rendered) return;
            try {
                window.JsBarcode(svg, bc, { format: 'EAN13', width: 1.2, height: 30, fontSize: 8, margin: 2, displayValue: false });
            } catch(e) {
                try { window.JsBarcode(svg, bc, { format: 'CODE128', width: 1.2, height: 30, fontSize: 8, margin: 2, displayValue: false }); } catch(_) {}
            }
            svg.dataset.rendered = '1';
            // 클릭 시 확대 모달
            svg.style.cursor = 'pointer';
            svg.onclick = () => window.openBarcodeZoom(bc, svg.closest('tr')?.querySelector('.product-name-link')?.textContent?.trim() || bc);
        });
    }
    if (window.JsBarcode) { doRender(); }
    else {
        const t = setInterval(() => { if (window.JsBarcode) { clearInterval(t); doRender(); } }, 200);
        setTimeout(() => clearInterval(t), 5000);
    }
}

// 바코드 확대 모달
window.openBarcodeZoom = function(barcode, productName) {
    const modal = document.getElementById('barcode-zoom-modal');
    if (!modal) return;
    document.getElementById('barcode-zoom-name').textContent = productName || '';
    document.getElementById('barcode-zoom-number').textContent = barcode;
    const svg = document.getElementById('barcode-zoom-svg');
    svg.innerHTML = '';
    delete svg.dataset.rendered;
    try {
        window.JsBarcode(svg, barcode, { format: 'EAN13', width: 3, height: 100, fontSize: 16, margin: 10, displayValue: true });
    } catch(e) {
        window.JsBarcode(svg, barcode, { format: 'CODE128', width: 3, height: 100, fontSize: 16, margin: 10, displayValue: true });
    }
    modal.classList.remove('hidden');
};

window.printSingleBarcode = function() {
    const bc = document.getElementById('barcode-zoom-number')?.textContent;
    const name = document.getElementById('barcode-zoom-name')?.textContent;
    if (!bc) return;
    const svg = document.getElementById('barcode-zoom-svg');
    const svgStr = new XMLSerializer().serializeToString(svg);
    const win = window.open('', '_blank', 'width=400,height=300');
    if (!win) { alert('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>바코드</title>
        <style>body{margin:20px;text-align:center;font-family:sans-serif;}
        p{font-size:13px;font-weight:600;margin-bottom:8px;}
        #btn-print{margin-top:12px;padding:8px 24px;font-size:14px;font-weight:700;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;}
        @media print{#btn-print{display:none;}@page{margin:8mm;}}</style></head><body>
        <p>${name.replace(/</g,'&lt;')}</p>${svgStr}
        <button id="btn-print" onclick="window.print()">🖨 인쇄</button>
        <script>setTimeout(function(){document.getElementById('btn-print')?.click();},200);<\/script>
    </body></html>`);
    win.document.close();
};

// EAN-13 바코드 자동 생성
function generateEAN13() {
    // 기존 최대 번호 조회 후 다음 번호 사용
    const products = window.productDataManager?.farm_products || [];
    const existing = products
        .map(p => p.barcode)
        .filter(b => b && /^8801000\d{6}$/.test(b))
        .map(b => parseInt(b.slice(7, 12)));
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 31;
    const base = '8801000' + String(next).padStart(5, '0');
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
    return base + ((10 - (sum % 10)) % 10);
}

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
        headerCell: '<th class="w-10"><input type="checkbox" id="select-all-products" class="checkbox-ui"></th>',
        render: (p) => `<td class="text-center"><input type="checkbox" class="product-checkbox checkbox-ui" data-product-id="${p.id}"></td>`
    },
    {
        key: 'product_code',
        label: '상품코드',
        thClass: 'w-20',
        render: (p, dash) => {
            const code = p.product_code ? String(p.product_code).replace(/</g, '&lt;') : null;
            return `<td class="td-muted whitespace-nowrap">${code || dash}</td>`;
        }
    },
    {
        key: 'image',
        label: '',
        thClass: 'w-10',
        render: (p) => {
            if (p.image_url) {
                return `<td class="text-center" style="padding:2px;"><img src="${p.image_url}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:4px;border:1px solid #e0e0e0;" onerror="this.style.display='none'"></td>`;
            }
            return `<td class="text-center text-muted" style="padding:2px;"><i class="fas fa-image" style="font-size:14px;color:#ccc;"></i></td>`;
        }
    },
    {
        key: 'name',
        label: '상품명',
        thClass: 'w-36',
        editable: true,
        render: (p, dash) => {
            const name = (p.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const stock = Number(p.stock) || 0;
            const outBadge = stock === 0 ? ' <span class="badge badge-danger" style="font-size:9px;padding:1px 4px;">품절</span>' : '';
            return `<td class="td-primary td-link" data-field="name" data-product-id="${p.id}" style="max-width:180px;cursor:pointer;" onclick="window.openProductDetailModal('${p.id}')"><span class="product-name-link truncate block">${name || dash}</span>${outBadge}</td>`;
        }
    },
    {
        key: 'category',
        label: '카테고리',
        thClass: 'w-24',
        editable: true,
        render: (p, dash) => {
            const cat = p.category ? String(p.category).replace(/</g, '&lt;') : null;
            return `<td class="td-primary" data-field="category" data-product-id="${p.id}">${cat || dash}</td>`;
        }
    },
    {
        key: 'size',
        label: '사이즈',
        thClass: 'w-16',
        render: (p, dash) => {
            const s = p.size ? String(p.size).replace(/</g, '&lt;') : null;
            return `<td class="td-secondary">${s || dash}</td>`;
        }
    },
    // 바코드 컬럼 — 테이블 밀도를 위해 숨김 (바코드 인쇄·모달에서 확인 가능)
    // {
    //     key: 'barcode', label: '바코드', thClass: 'w-32',
    //     render: (p, dash) => { ... }
    // },
    {
        key: 'price',
        label: '판매가',
        thClass: 'w-24',
        editable: true,
        render: (p, dash) => {
            const price = Number(p.price) || 0;
            return `<td class="td-amount text-right text-numeric" data-field="price" data-product-id="${p.id}">${price > 0 ? (window.fmt?.currency(price) || '₩' + price.toLocaleString()) : dash}</td>`;
        }
    },
    {
        key: 'cost',
        label: '매입가',
        thClass: 'w-20',
        render: (p, dash) => {
            const cost = Number(p.cost) || 0;
            return `<td class="td-amount text-right text-numeric">${cost > 0 ? (window.fmt?.currency(cost) || '₩' + cost.toLocaleString()) : dash}</td>`;
        }
    },
    {
        key: 'margin',
        label: '마진',
        thClass: 'w-16',
        render: (p, dash) => {
            const price = Number(p.price) || 0;
            const cost = Number(p.cost) || 0;
            if (price <= 0 || cost <= 0) return `<td class="td-muted text-center">${dash}</td>`;
            const margin = Math.round((price - cost) / price * 100);
            const color = margin >= 50 ? 'color:var(--primary);font-weight:600;' : margin >= 30 ? '' : 'color:var(--danger);';
            return `<td class="td-num text-center" style="${color}">${margin}%</td>`;
        }
    },
    {
        key: 'stock',
        label: '재고',
        thClass: 'w-28',
        editable: true,
        render: (p, dash) => {
            const stock = Number(p.stock) || 0;
            const inputColor = stock === 0 ? 'border-color:var(--danger);color:var(--danger);font-weight:600;'
                             : stock <= 5  ? 'border-color:var(--warn);color:var(--warn);font-weight:600;'
                             : '';
            return `<td class="td-num text-right" data-field="stock" data-product-id="${p.id}" style="padding:2px 4px;">
                <div class="stock-stepper" style="display:inline-flex;align-items:center;justify-content:flex-end;">
                    <button type="button" class="stock-step-btn" data-step="-1" data-product-id="${p.id}"
                        style="width:22px;height:24px;border:1px solid var(--border);background:var(--bg-white);border-radius:3px 0 0 3px;cursor:pointer;font-weight:700;line-height:1;color:var(--text-secondary);"
                        title="1개 차감">−</button>
                    <input type="number" class="stock-inline-input" data-product-id="${p.id}"
                        value="${stock}" min="0"
                        style="width:46px;height:24px;text-align:right;font-size:12px;padding:0 4px;border:1px solid var(--border);border-left:none;border-right:none;outline:none;border-radius:0;${inputColor}"
                        title="값을 입력하고 Enter 또는 포커스 해제 시 저장">
                    <button type="button" class="stock-step-btn" data-step="1" data-product-id="${p.id}"
                        style="width:22px;height:24px;border:1px solid var(--border);background:var(--bg-white);border-radius:0 3px 3px 0;cursor:pointer;font-weight:700;line-height:1;color:var(--primary);"
                        title="1개 추가">+</button>
                </div>
            </td>`;
        }
    },
    // 배송옵션 — 모달에서 확인 가능, 테이블 밀도 위해 숨김
    // {
    //     key: 'shipping_option', label: '배송옵션', thClass: 'w-24',
    //     render: (p, dash) => { ... }
    // },
    {
        key: 'actions',
        headerCell: '<th class="w-20">관리</th>',
        render: (p) => `
            <td class="text-center whitespace-nowrap">
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
        
        // 기존 이벤트 리스너 제거 후 즉시 재바인딩 (데이터 로드 전에 버튼 활성화)
        this.removeEventListeners();
        this.setupPagination();
        this.setupEventListeners();

        // Supabase에서 상품 데이터 로드 (버튼은 이미 동작하는 상태)
        try {
            await this.loadProducts();
        } catch (error) {
            console.error('❌ 상품 데이터 로드 실패:', error);
        }

        this.isInitialized = true;
        console.log('✅ ProductManagement 컴포넌트 초기화 완료');
    }
    
    /**
     * 이벤트 리스너 제거
     */
    removeEventListeners() {
        try {
            console.log('🧹 상품관리 이벤트 리스너 정리 중...');

            // cloneNode 제거 — DOM 교체 시 리스너 탈락 근본 원인.
            // 대신 setupEventListeners에서 dataset.bound 플래그로 중복 방지.
            // 버튼 리스너 해제는 하지 않음 (같은 핸들러가 재등록되어도 무해).

            // 모달만 닫기
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
        // dataset.bound 가드 — 같은 DOM 요소에 리스너 중복 등록 방지
        const bind = (id, handler) => {
            const el = document.getElementById(id);
            if (el && !el.dataset.bound) {
                el.addEventListener('click', handler);
                el.dataset.bound = '1';
            }
        };

        bind('add-product-btn', () => this.openProductModal());
        bind('manage-categories-btn', () => this.openCategoryManagement());
        bind('import-products-btn', () => this.openImportModal());
        bind('export-products-btn', () => this.exportProducts());
        bind('print-barcodes-btn', () => window.openBarcodePrintModal());
        bind('scan-barcode-btn', () => window.openBarcodeScanner());

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

        // 전체 선택 체크박스 — SelectAll 중앙 유틸 사용
        if (window.SelectAll) {
            window.SelectAll.attach('select-all-products', '.product-checkbox', () => {
                this.updateBulkBar();
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

        // 테이블 인라인 편집 (더블클릭) + 재고 스텝퍼 직접 편집
        const tableBody = document.getElementById('products-table-body');
        if (tableBody && !tableBody.dataset.inlineEdit) {
            tableBody.dataset.inlineEdit = '1';
            // 더블클릭 인라인 편집 (재고 셀은 스텝퍼로 직접 편집하므로 제외)
            tableBody.addEventListener('dblclick', (e) => {
                const td = e.target.closest('td[data-field]');
                if (!td || td.querySelector('input,select')) return;
                if (td.dataset.field === 'stock') return;
                this._startInlineEdit(td);
            });

            // 재고 스텝퍼 −/+ 버튼 클릭
            tableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('.stock-step-btn');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();
                const productId = btn.dataset.productId;
                const step = parseInt(btn.dataset.step, 10) || 0;
                this._adjustStock(productId, step);
            });

            // 재고 인풋 키보드 (Enter=저장 / Esc=원복)
            tableBody.addEventListener('keydown', (e) => {
                const input = e.target.closest('.stock-inline-input');
                if (!input) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                } else if (e.key === 'Escape') {
                    const productId = input.dataset.productId;
                    const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
                    input.value = product ? (Number(product.stock) || 0) : 0;
                    input.blur();
                }
            });

            // 재고 인풋 변경 → 저장 (change/blur)
            tableBody.addEventListener('change', (e) => {
                const input = e.target.closest('.stock-inline-input');
                if (!input) return;
                const productId = input.dataset.productId;
                const newVal = Math.max(0, parseInt(input.value, 10) || 0);
                this._setStockDirect(productId, newVal);
            });

            // 재고 인풋 포커스 시 전체 선택 (빠른 덮어쓰기)
            tableBody.addEventListener('focusin', (e) => {
                const input = e.target.closest('.stock-inline-input');
                if (!input) return;
                input.select();
            });
        }
    }

    /** 인라인 편집 시작 */
    _startInlineEdit(td) {
        const field = td.dataset.field;
        const productId = td.dataset.productId;
        const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
        if (!product) return;

        const originalHTML = td.innerHTML;
        const value = product[field] ?? '';

        if (field === 'category') {
            const categories = window.categoryDataManager?.getAllCategories?.() || [];
            const options = categories.map(c =>
                `<option value="${c.name}"${c.name === value ? ' selected' : ''}>${c.name}</option>`
            ).join('');
            td.innerHTML = `<select class="input-ui" style="height:26px;font-size:12px;width:100%;">
                <option value="">선택</option>${options}</select>`;
            const sel = td.querySelector('select');
            sel.focus();
            sel.addEventListener('change', () => this._saveInlineEdit(td, productId, field, sel.value, originalHTML));
            sel.addEventListener('blur', () => { if (td.querySelector('select')) td.innerHTML = originalHTML; });
        } else {
            const type = (field === 'price' || field === 'stock') ? 'number' : 'text';
            const numVal = (field === 'price' || field === 'stock') ? (Number(value) || 0) : value;
            td.innerHTML = `<input type="${type}" class="input-ui" style="height:26px;font-size:12px;width:100%;${type === 'number' ? 'text-align:right;' : ''}" value="${numVal}">`;
            const input = td.querySelector('input');
            input.focus();
            input.select();
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this._saveInlineEdit(td, productId, field, input.value, originalHTML);
                if (e.key === 'Escape') td.innerHTML = originalHTML;
            });
            input.addEventListener('blur', () => { if (td.querySelector('input')) this._saveInlineEdit(td, productId, field, input.value, originalHTML); });
        }
    }

    /** 인라인 편집 저장 */
    async _saveInlineEdit(td, productId, field, newValue, originalHTML) {
        const parsed = (field === 'price' || field === 'stock') ? (Number(newValue) || 0) : String(newValue).trim();
        if (!window.supabaseClient) { td.innerHTML = originalHTML; return; }

        try {
            const { error } = await window.supabaseClient
                .from('farm_products')
                .update({ [field]: parsed })
                .eq('id', productId);

            if (error) throw error;

            // 로컬 데이터도 갱신
            const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
            if (product) product[field] = parsed;

            // 셀 다시 렌더링
            const dash = window.fmt?.ND || '<span class="td-null">—</span>';
            const col = PRODUCT_COLUMNS.find(c => c.key === field);
            if (col && product) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = col.render(product, dash);
                const newTd = tempDiv.querySelector('td');
                td.innerHTML = newTd.innerHTML;
                // data-field, data-product-id 유지
            } else {
                td.innerHTML = originalHTML;
            }

            if (window.showToast) window.showToast('수정 완료', 1500);
        } catch (err) {
            console.error('인라인 수정 실패:', err);
            td.innerHTML = originalHTML;
            if (window.showToast) window.showToast('수정 실패: ' + err.message, 2000, 'error');
        }
    }

    /** 재고 ±1 스텝 조정 */
    async _adjustStock(productId, delta) {
        const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
        if (!product) return;
        const oldStock = Number(product.stock) || 0;
        const newStock = Math.max(0, oldStock + delta);
        if (newStock === oldStock) return;
        await this._writeStock(productId, oldStock, newStock, delta > 0 ? '재고 +1 (수동)' : '재고 -1 (수동)');
    }

    /** 재고 직접 입력 저장 */
    async _setStockDirect(productId, newStock) {
        const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
        if (!product) return;
        const oldStock = Number(product.stock) || 0;
        if (newStock === oldStock) return;
        await this._writeStock(productId, oldStock, newStock, '재고 직접 수정');
    }

    /** 재고 DB 반영 + 입출고 로그 + 시각 갱신 */
    async _writeStock(productId, oldStock, newStock, reason) {
        if (!window.supabaseClient) return;
        const input = document.querySelector(`.stock-inline-input[data-product-id="${productId}"]`);
        try {
            // logStockChange 는 productDataManager.product.stock 을 stock_before 로 읽으므로
            // 로컬 캐시 갱신 전에 먼저 호출해야 정확한 변동 전 값이 기록됨
            const delta = newStock - oldStock;
            const logType = delta > 0 ? 'in' : 'out';
            if (window.logStockChange) {
                await window.logStockChange(productId, logType, Math.abs(delta), { reason });
            }

            const { error } = await window.supabaseClient
                .from('farm_products')
                .update({ stock: newStock, updated_at: new Date().toISOString() })
                .eq('id', productId);
            if (error) throw error;

            // 로컬 캐시 갱신
            const product = window.productDataManager?.getAllProducts()?.find(p => p.id === productId);
            if (product) product.stock = newStock;

            // 인풋 색상/굵기 갱신 (재렌더 없이 바로 반영)
            if (input) {
                input.value = newStock;
                input.style.borderColor = '';
                input.style.color = '';
                input.style.fontWeight = '';
                if (newStock === 0) {
                    input.style.borderColor = 'var(--danger)';
                    input.style.color = 'var(--danger)';
                    input.style.fontWeight = '600';
                } else if (newStock <= 5) {
                    input.style.borderColor = 'var(--warn)';
                    input.style.color = 'var(--warn)';
                    input.style.fontWeight = '600';
                }
            }

            // 상품명 셀 "품절" 뱃지 토글 (0 ↔ 양수 전환 시)
            if ((oldStock === 0) !== (newStock === 0)) {
                const nameTd = document.querySelector(`td[data-field="name"][data-product-id="${productId}"]`);
                if (nameTd) {
                    const existingBadge = nameTd.querySelector('.badge.badge-danger');
                    if (newStock === 0 && !existingBadge) {
                        nameTd.insertAdjacentHTML('beforeend', ' <span class="badge badge-danger" style="font-size:9px;padding:1px 4px;">품절</span>');
                    } else if (newStock > 0 && existingBadge) {
                        existingBadge.remove();
                    }
                }
            }

            if (window.showToast) window.showToast(`재고 ${oldStock} → ${newStock}`, 1200);
        } catch (err) {
            console.error('재고 수정 실패:', err);
            if (input) input.value = oldStock;
            if (window.showToast) window.showToast('재고 수정 실패: ' + err.message, 2000, 'error');
        }
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
            // 헤더 체크박스가 이제 DOM에 존재 → SelectAll 연결
            if (window.SelectAll) {
                window.SelectAll.attach('select-all-products', '.product-checkbox', () => {
                    this.updateBulkBar();
                });
            }
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
                    <td colspan="11" class="px-4 text-center text-muted">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-box text-3xl mb-3 text-gray-300"></i>
                            <p class="text-sm font-medium text-body">등록된 상품이 없습니다</p>
                            <p class="text-xs text-muted mt-1">새 상품을 등록해보세요</p>
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
        renderBarcodeSVGs();
        if (window._renderCategoryStats) window._renderCategoryStats();
    }

    /**
     * 상품 행 생성
     */
    createProductRow(product) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-section transition-colors cursor-pointer';
        row.dataset.productId = product.id;

        // PRODUCT_COLUMNS 단일 스키마에서 모든 셀 생성 — 헤더와 무조건 정합
        row.innerHTML = renderProductRowCells(product, window.fmt?.ND || '<span class="td-null">—</span>');

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
            'in-stock': 'text-brand',
            'low-stock': 'text-warn',
            'out-of-stock': 'text-danger'
        };
        return colors[status] || 'text-body';
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
                    : 'bg-white border-gray-200 text-body hover:bg-section'
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
        const statusColor = product.status === 'active'   ? 'text-brand bg-success'
                          : product.status === 'soldout'  ? 'text-danger bg-danger'
                          : 'text-muted bg-page';

        const profitMargin = product.profit_margin
            ? product.profit_margin + '%'
            : (product.price && product.cost
                ? Math.round((1 - product.cost / product.price) * 100) + '%'
                : '-');

        const imageHtml = product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}" class="w-full h-40 object-cover rounded-lg border border-gray-200">`
            : `<div class="w-full h-40 bg-page rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-4xl"><i class="fas fa-seedling"></i></div>`;

        const panel = document.createElement('div');
        panel.id = 'product-detail-panel';
        panel.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40';
        panel.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col" style="max-height:90vh;">
                <!-- 헤더 -->
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
                    <span class="text-base font-semibold text-heading">상품 상세</span>
                    <div class="flex items-center gap-2">
                        <button id="pd-edit-btn" class="btn-secondary text-xs px-3 py-1.5">
                            <i class="fas fa-edit mr-1"></i>수정
                        </button>
                        <button id="pd-close-btn" class="text-muted hover:text-body p-1 rounded hover:bg-page">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <!-- 본문 -->
                <div class="overflow-y-auto px-5 py-4 space-y-4">
                    ${imageHtml}
                    <div>
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <h2 class="text-lg font-bold text-heading leading-tight">${fmt(product.name)}</h2>
                            <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}">${status}</span>
                        </div>
                        ${product.product_code ? `<p class="text-xs text-muted font-mono">${product.product_code}</p>` : ''}
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-section rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">카테고리</p>
                            <p class="font-medium text-heading">${fmt(product.category)}</p>
                        </div>
                        <div class="bg-section rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">사이즈</p>
                            <p class="font-medium text-heading">${fmt(product.size)}</p>
                        </div>
                        <div class="bg-success rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">판매가</p>
                            <p class="font-semibold text-green-700 text-base">${fmtP(product.price)}</p>
                        </div>
                        <div class="bg-section rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">매입가</p>
                            <p class="font-medium text-heading">${fmtP(product.cost)}</p>
                        </div>
                        <div class="bg-section rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">재고</p>
                            <p class="font-semibold text-heading">${product.stock != null ? product.stock + '개' : '-'}</p>
                        </div>
                        <div class="bg-section rounded-lg p-3">
                            <p class="text-xs text-muted mb-0.5">마진율</p>
                            <p class="font-medium text-heading">${profitMargin}</p>
                        </div>
                        <div class="bg-section rounded-lg p-3 col-span-2">
                            <p class="text-xs text-muted mb-0.5">배송 옵션</p>
                            <p class="font-medium text-heading">${shipping}</p>
                        </div>
                    </div>
                    ${product.description ? `
                    <div class="bg-section rounded-lg p-3 text-sm">
                        <p class="text-xs text-muted mb-1">상품 설명</p>
                        <p class="text-body leading-relaxed whitespace-pre-wrap">${product.description}</p>
                    </div>` : ''}
                    <div class="flex gap-4 text-xs text-muted pt-1 border-t border-gray-100">
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
        // 모바일 더블탭·고스트 클릭 재진입 방지
        if (this._savingProduct) {
            console.log('⏳ 이미 저장 중 — 중복 호출 차단');
            return;
        }
        this._savingProduct = true;
        const saveBtn = document.getElementById('save-product-btn');
        if (saveBtn) saveBtn.disabled = true;
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
                shipping_option: getFormValue('product-form-shipping'),
                barcode: getFormValue('product-form-barcode') || generateEAN13()
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
        } finally {
            this._savingProduct = false;
            const btn = document.getElementById('save-product-btn');
            if (btn) btn.disabled = false;
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
            'product-form-created-at',
            'product-form-barcode'
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
                'product-form-created-at': product.created_at,
                'product-form-barcode': product.barcode || '',
                'product-form-product-code': product.product_code || '',
                'product-form-shipping': product.shipping_option || '일반배송'
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

            // v3.4.82: 무료배송 체크박스 sync
            const freeChk = document.getElementById('product-form-free-shipping');
            if (freeChk) freeChk.checked = (product.shipping_option === '무료배송');

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
        if (!confirm(`정말로 "${product.name}" 상품을 삭제하시겠습니까?`)) return;
        try {
            if (!window.productDataManager) {
                console.error('❌ productDataManager를 찾을 수 없습니다.');
                return;
            }
            await window.productDataManager.deleteProduct(product.id);
            await this.loadProducts();
            console.log('🗑️ 상품 삭제 완료:', product.name);
        } catch (error) {
            const msg = String(error?.message || '');
            // 주문 이력에 묶여 있으면 (FK 제약) — 친절한 안내 + 재고 0 처리 제안
            if (/fk_order_items_product|violates foreign key/i.test(msg)) {
                console.warn('상품 삭제 차단: 주문 이력 존재', product.name);
                let refCount = null;
                try {
                    const { count } = await window.supabaseClient
                        .from('farm_order_items')
                        .select('id', { count: 'exact', head: true })
                        .eq('product_id', product.id);
                    refCount = count;
                } catch (_) { /* 카운트 실패해도 진행 */ }
                const refTxt = (typeof refCount === 'number') ? `${refCount}건의 주문 항목` : '기존 주문';
                const ok = confirm(
                    `"${product.name}" 은(는) ${refTxt} 에서 사용 중이라 삭제할 수 없습니다.\n\n` +
                    `주문 이력 보존을 위해 재고를 0으로 변경하시겠습니까?\n` +
                    `(목록에는 남지만 "품절" 로 표시되어 신규 판매가 차단됩니다)`
                );
                if (ok) {
                    try {
                        await window.supabaseClient
                            .from('farm_products')
                            .update({ stock: 0, updated_at: new Date().toISOString() })
                            .eq('id', product.id);
                        if (window.logStockChange) {
                            const oldStock = Number(product.stock) || 0;
                            if (oldStock > 0) {
                                await window.logStockChange(product.id, 'out', oldStock, { reason: '삭제 시도 → 품절 처리' });
                            }
                        }
                        product.stock = 0;
                        await this.loadProducts();
                        if (window.showToast) window.showToast('품절 처리 완료', 1500);
                    } catch (e2) {
                        console.error('품절 처리 실패:', e2);
                        alert('품절 처리에 실패했습니다: ' + e2.message);
                    }
                }
                return;
            }
            console.error('❌ 상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다: ' + msg);
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
        window._addBulkRow          = () => this._addBulkRow();
        window._bulkInputChanged    = () => this._refreshImportCount();
        window._quickAddRemove      = (i) => this._quickAddRemove(i);
        // 이벤트 (한 번만 등록하도록 플래그)
        if (!modal._importEventsReady) {
            modal._importEventsReady = true;
            this._bindImportEvents();
        }
        // 빠른추가 탭 진입 → 상품명 입력창 포커스
        setTimeout(() => document.getElementById('quick-add-input')?.focus(), 100);
    }

    /** 모달 상태 초기화 */
    _resetImport() {
        // 빠른추가 탭 기본 활성화 (모바일 최적)
        this._switchTab('quick');
        // 빠른추가 입력창·목록 초기화
        const qa = document.getElementById('quick-add-input');
        if (qa) qa.value = '';
        // 표 초기화 — 기본 5행
        const tbody = document.getElementById('bulk-input-tbody');
        if (tbody) { tbody.innerHTML = ''; for (let i = 0; i < 5; i++) this._addBulkRow(); }
        // textarea 비우기
        const ta = document.getElementById('product-paste-textarea');
        if (ta) ta.value = '';
        // 미리보기 숨기기
        document.getElementById('paste-preview-section')?.classList.add('hidden');
        this._renderQuickAddList();
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
        ['quick', 'table', 'manual', 'file'].forEach(t => {
            document.getElementById(`import-tab-${t}`)?.classList.toggle('hidden', t !== tab);
        });
        document.querySelectorAll('.import-tab-btn').forEach(btn => {
            const active = btn.dataset.tab === tab;
            btn.className = `import-tab-btn ${active ? 'btn-primary' : 'btn-secondary'} flex-1`;
            btn.style.cssText = 'justify-content:center;min-width:90px;';
        });
        // 빠른추가 탭 진입 시 입력창 포커스
        if (tab === 'quick') setTimeout(() => document.getElementById('quick-add-input')?.focus(), 50);
        this._refreshImportCount();
    }

    /** 빠른추가: 상품명 하나 추가 */
    _quickAdd() {
        const input = document.getElementById('quick-add-input');
        const name = (input?.value || '').trim();
        if (!name) return;
        const list = window.productImportData && Array.isArray(window.productImportData)
            ? window.productImportData
            : [];
        // 이 세션 안에서 중복 방지
        if (list.some(p => p.name === name)) {
            input.value = '';
            input.focus();
            input.classList.add('border-red-400');
            setTimeout(() => input.classList.remove('border-red-400'), 600);
            return;
        }
        list.push({
            name,
            category: '',
            price: 0,
            cost: 0,
            stock: 0,
            size: '',
            description: '',
            shipping_option: '일반배송',
            status: 'active',
        });
        window.productImportData = list;
        input.value = '';
        input.focus();
        this._renderQuickAddList();
        this._refreshImportCount();
    }

    /** 빠른추가: 한 건 삭제 */
    _quickAddRemove(index) {
        const list = window.productImportData || [];
        list.splice(index, 1);
        window.productImportData = list.length ? list : null;
        this._renderQuickAddList();
        this._refreshImportCount();
    }

    /** 빠른추가: 전체 삭제 */
    _quickAddClear() {
        if (!confirm('누적된 상품을 모두 지울까요?')) return;
        window.productImportData = null;
        this._renderQuickAddList();
        this._refreshImportCount();
    }

    /** 빠른추가: 목록 렌더 */
    _renderQuickAddList() {
        const box = document.getElementById('quick-add-list');
        const countEl = document.getElementById('quick-add-count');
        if (!box) return;
        const list = window.productImportData || [];
        if (countEl) countEl.textContent = `${list.length}개`;
        if (list.length === 0) {
            box.innerHTML = `<div class="p-4 text-center text-xs text-muted">아직 추가된 상품이 없습니다</div>`;
            return;
        }
        const esc = s => String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
        box.innerHTML = list.map((p, i) =>
            `<div class="flex items-center justify-between px-3 py-2 border-b border-gray-100" style="font-size:14px;">
                <span class="td-primary truncate">${i+1}. ${esc(p.name)}</span>
                <button onclick="window._quickAddRemove?.(${i})" class="btn-icon-delete" title="삭제">
                    <i class="fas fa-times"></i>
                </button>
            </div>`
        ).join('');
    }

    /** 붙여넣기 textarea 입력 처리 — 탭/쉼표 라인별 자동 감지, 단일 이름 라인 지원 */
    _onPasteInput() {
        const ta = document.getElementById('product-paste-textarea');
        const text = ta?.value || '';
        if (!text.trim()) {
            window.productImportData = null;
            document.getElementById('paste-preview-section')?.classList.add('hidden');
            this._refreshImportCount();
            return;
        }
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const products = [];
        const seen = new Set();
        for (const line of lines) {
            // 라인마다 구분자 자동 감지: 탭 > 쉼표 > 없음(이름만)
            const cols = line.includes('\t') ? line.split('\t')
                       : line.includes(',')  ? line.split(',')
                       : [line];
            const name = String(cols[0] || '').trim();
            if (!name || name === '상품명') continue; // 헤더·빈 행 스킵
            if (seen.has(name)) continue;              // 같은 텍스트 내 중복 방지
            seen.add(name);
            products.push({
                name,
                category:        String(cols[1] || '').trim(),
                price:           parseFloat(String(cols[2] || '').replace(/,/g, '')) || 0,
                stock:           parseInt(cols[3]) || 0,
                size:            String(cols[4] || '').trim(),
                description:     String(cols[5] || '').trim(),
                cost: 0,
                shipping_option: '일반배송',
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
        const cols = ['상품명','카테고리','판매가','재고','사이즈'];
        const keys = ['name','category','price','stock','size'];
        if (countEl) countEl.textContent = `${products.length}개 상품 인식됨`;
        thead.innerHTML = cols.map(c =>
            `<th class="px-3 text-left whitespace-nowrap">${c}</th>`
        ).join('');
        tbody.innerHTML = products.slice(0, 30).map((p, i) =>
            `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-section'}">` +
            keys.map(k => {
                const v = k === 'price' ? (p[k] || 0).toLocaleString() : (p[k] || '-');
                return `<td class="px-3 td-secondary whitespace-nowrap">${v}</td>`;
            }).join('') +
            '</tr>'
        ).join('') + (products.length > 30
            ? `<tr><td colspan="5" class="px-3 text-center td-muted">... 외 ${products.length - 30}개</td></tr>`
            : '');
        section.classList.remove('hidden');
    }

    /** 카운트 및 버튼 상태 갱신 */
    /** 카테고리 옵션 HTML 생성 */
    _getCategoryOptions() {
        const fromDB = (window.categoryDataManager?.getAllCategories() || []).map(c => c.name);
        const fromProducts = (this.products || []).map(p => p.category).filter(Boolean);
        const cats = [...new Set([...fromDB, ...fromProducts])].sort();
        return '<option value="">선택</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    /** 표 입력 행 추가 */
    _addBulkRow() {
        const tbody = document.getElementById('bulk-input-tbody');
        if (!tbody) return;
        const idx = tbody.children.length + 1;
        const catOpts = this._getCategoryOptions();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center text-muted">${idx}</td>
            <td><input type="text" class="bulk-name form-control" placeholder="상품명" style="font-size:11px;padding:2px 6px;" oninput="window._bulkInputChanged?.()"></td>
            <td><select class="bulk-category form-control" style="font-size:11px;padding:2px 4px;">${catOpts}</select></td>
            <td><input type="number" class="bulk-price form-control" placeholder="0" style="font-size:11px;padding:2px 6px;text-align:right;"></td>
            <td><input type="number" class="bulk-cost form-control" placeholder="0" style="font-size:11px;padding:2px 6px;text-align:right;"></td>
            <td><input type="number" class="bulk-stock form-control" placeholder="0" style="font-size:11px;padding:2px 6px;text-align:right;"></td>
            <td><input type="text" class="bulk-size form-control" placeholder="M" style="font-size:11px;padding:2px 6px;text-align:center;"></td>
            <td class="text-center"><button onclick="this.closest('tr').remove();window._bulkInputChanged?.()" class="text-muted hover:text-danger" style="font-size:11px;"><i class="fas fa-times"></i></button></td>
        `;
        tbody.appendChild(tr);
        tr.querySelector('.bulk-name')?.focus();
    }

    /** 표 입력 데이터 수집 */
    _collectBulkTableData() {
        const rows = document.querySelectorAll('#bulk-input-tbody tr');
        const data = [];
        rows.forEach(tr => {
            const name = tr.querySelector('.bulk-name')?.value?.trim();
            if (!name) return;
            data.push({
                name,
                category: tr.querySelector('.bulk-category')?.value?.trim() || '',
                price: parseInt(tr.querySelector('.bulk-price')?.value) || 0,
                cost_price: parseInt(tr.querySelector('.bulk-cost')?.value) || 0,
                stock: parseInt(tr.querySelector('.bulk-stock')?.value) || 0,
                size: tr.querySelector('.bulk-size')?.value?.trim() || ''
            });
        });
        return data;
    }

    _refreshImportCount() {
        // 표 입력 탭이 활성화돼 있으면 표에서 수집
        const tableTab = document.getElementById('import-tab-table');
        if (tableTab && !tableTab.classList.contains('hidden')) {
            window.productImportData = this._collectBulkTableData();
        }
        const count   = (window.productImportData || []).length;
        const countEl = document.getElementById('import-row-count');
        if (countEl) {
            countEl.textContent  = count > 0 ? `${count}개 등록 예정` : '0개';
            countEl.className    = count > 0 ? 'text-sm font-semibold text-brand' : 'text-sm text-muted';
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

        // 빠른추가: Enter = 추가, 버튼 = 추가, 전체삭제
        const quickInput = document.getElementById('quick-add-input');
        quickInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this._quickAdd(); }
        });
        document.getElementById('quick-add-btn')?.addEventListener('click', () => this._quickAdd());
        document.getElementById('quick-add-clear')?.addEventListener('click', () => this._quickAddClear());

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
        dropZone?.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('border-green-400','bg-success'); });
        dropZone?.addEventListener('dragleave', ()  => { dropZone.classList.remove('border-green-400','bg-success'); });
        dropZone?.addEventListener('drop',      (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-green-400','bg-success');
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

    /** Payhere 양식 템플릿 다운로드 */
    _downloadTemplate() {
        if (typeof XLSX === 'undefined') { alert('엑셀 라이브러리가 로드되지 않았습니다.'); return; }
        const HEADERS = [
            '상품명','카테고리','색 설정','판매탭 노출','재고관리 설정',
            '옵션명1','옵션값1','옵션명2','옵션값2','옵션명3','옵션값3',
            'SKU','바코드','판매가','부가세','원가','수량','안전재고'
        ];
        const EXAMPLE = [
            '에케베리아 치와와','에케베리아','','사용','사용',
            '','','','','','',
            'P001','8801000000012',15000,'',8000,10,''
        ];
        const ws = XLSX.utils.aoa_to_sheet([HEADERS, EXAMPLE]);
        ws['!cols'] = [25,15,8,10,10,8,8,8,8,8,8,12,15,10,6,10,8,10].map(w=>({wch:w}));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '상품등록');
        XLSX.writeFile(wb, 'payhere_상품등록_양식.xlsx');
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
        // RFC4180 준수 파서: 따옴표 내 쉼표·줄바꿈·이스케이프 처리
        const rows = [];
        let row = [], field = '', inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"') {
                    if (text[i+1] === '"') { field += '"'; i++; }
                    else inQuotes = false;
                } else field += c;
            } else {
                if (c === '"') inQuotes = true;
                else if (c === ',') { row.push(field); field = ''; }
                else if (c === '\r') { /* skip */ }
                else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
                else field += c;
            }
        }
        if (field.length || row.length) { row.push(field); rows.push(row); }
        const filtered = rows.filter(r => r.some(c => c && String(c).trim()));
        this._parseRowArrays(filtered);
    }

    _parseRowArrays(rows) {
        // 헤더 행: '상품명' 단어를 포함한 첫 행 (컬럼 순서·위치 무관)
        const hdrIdx = rows.findIndex(r => r.some(c => String(c||'').trim() === '상품명'));
        const products = [];

        if (hdrIdx < 0) {
            // 헤더 없음: 단순 양식 (상품명·카테고리·판매가·재고·사이즈·설명)
            for (let i = 0; i < rows.length; i++) {
                const cols = rows[i];
                const name = String(cols[0]||'').trim();
                if (!name || name === '상품명') continue;
                products.push({
                    name,
                    category:    String(cols[1]||'').trim(),
                    price:       parseFloat(String(cols[2]||'').replace(/,/g,'')) || 0,
                    stock:       parseInt(cols[3]) || 0,
                    size:        String(cols[4]||'').trim(),
                    description: String(cols[5]||'').trim(),
                    cost: 0,
                    shipping_option: '일반배송',
                    status: 'active',
                });
            }
        } else {
            // 헤더 기반 키워드 매핑 — 컬럼 순서·누락 허용
            const hdr = rows[hdrIdx].map(c => String(c||'').trim());
            const findCol = (...names) => {
                for (const n of names) {
                    const idx = hdr.findIndex(h => h === n);
                    if (idx >= 0) return idx;
                }
                return -1;
            };
            const map = {
                name:    findCol('상품명'),
                cat:     findCol('카테고리','분류'),
                sku:     findCol('SKU','상품코드'),
                barcode: findCol('바코드','Barcode'),
                price:   findCol('판매가','가격','Price'),
                cost:    findCol('원가','공급가','Cost'),
                stock:   findCol('재고','수량','Stock'),
                size:    findCol('사이즈','크기','Size'),
                desc:    findCol('설명','상품설명','Description'),
            };
            const pick = (cols, idx) => idx >= 0 ? String(cols[idx]||'').trim() : '';
            for (let i = hdrIdx + 1; i < rows.length; i++) {
                const cols = rows[i];
                const name = pick(cols, map.name);
                // 빈 행·Payhere 안내 행(*/필수/선택) 스킵
                if (!name || name.startsWith('*') || name === '필수' || name === '선택' || name === '상품명') continue;
                products.push({
                    name,
                    category:     pick(cols, map.cat),
                    price:        parseFloat(pick(cols, map.price).replace(/,/g,'')) || 0,
                    cost:         parseFloat(pick(cols, map.cost).replace(/,/g,'')) || 0,
                    stock:        parseInt(pick(cols, map.stock)) || 0,
                    size:         pick(cols, map.size),
                    description:  pick(cols, map.desc),
                    product_code: pick(cols, map.sku),
                    barcode:      pick(cols, map.barcode) || generateEAN13(),
                    shipping_option: '일반배송',
                    status: 'active',
                });
            }
        }
        window.productImportData = products;
        this._showFilePreview(products);
        this._refreshImportCount();
    }

    _showFilePreview(products) {
        const section = document.getElementById('product-import-preview');
        const content = document.getElementById('product-preview-content');
        const countEl = document.getElementById('product-preview-count');
        if (!section || !content) return;
        if (countEl) countEl.textContent = `총 ${products.length}개`;
        const cols = ['상품명','카테고리','판매가','원가','재고','바코드','SKU'];
        const keys = ['name','category','price','cost','stock','barcode','product_code'];
        const numKeys = new Set(['price','cost','stock']);
        let html = `<table class="table-ui"><thead><tr>` +
            cols.map(c => `<th class="whitespace-nowrap">${c}</th>`).join('') +
            `</tr></thead><tbody>` +
            products.slice(0,20).map(p =>
                `<tr>` +
                keys.map(k => {
                    const v = numKeys.has(k) ? (p[k]||0).toLocaleString() : (p[k]||'-');
                    return `<td class="whitespace-nowrap">${v}</td>`;
                }).join('') +
                `</tr>`
            ).join('') +
            (products.length > 20 ? `<tr><td colspan="${cols.length}" class="px-2 text-center td-muted">... 외 ${products.length-20}개</td></tr>` : '') +
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
        let ok = 0, skipped = 0, fail = 0;
        const failRows = [];
        // 기존 DB 상품명 집합 (중복 사전 차단)
        const existingNames = new Set(
            (window.productDataManager?.farm_products || []).map(p => p.name)
        );
        const progress = document.getElementById('product-import-progress');
        progress?.classList.remove('hidden');
        for (let i = 0; i < total; i++) {
            const p = products[i];
            try {
                if (!window.productDataManager) {
                    fail++;
                    failRows.push(`${i+1}행: 데이터 매니저 없음`);
                } else if (!p.name) {
                    skipped++;
                } else if (existingNames.has(p.name)) {
                    // 중복 상품명 → 조용히 건너뛰기
                    skipped++;
                } else {
                    await window.productDataManager.addProduct(p);
                    existingNames.add(p.name); // 엑셀 내 중복도 차단
                    ok++;
                }
            } catch (e) {
                console.error(`상품 등록 실패 [${i}]:`, e);
                fail++;
                failRows.push(`${i+1}행 (${p.name||'이름없음'}): ${e.message||e}`);
            }
            this.updateProgress(i + 1, total);
            await new Promise(r => setTimeout(r, 60));
        }
        progress?.classList.add('hidden');
        this.closeImportModal();

        let msg = `일괄등록 완료\n성공 ${ok}개`;
        if (skipped) msg += ` / 중복 건너뜀 ${skipped}개`;
        if (fail)    msg += ` / 실패 ${fail}개`;
        if (failRows.length) {
            msg += '\n\n[실패 상세]\n' + failRows.slice(0, 10).join('\n');
            if (failRows.length > 10) msg += `\n... 외 ${failRows.length-10}개`;
        }
        alert(msg);
        if (ok > 0) await this.loadProducts();
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
     * 상품 데이터 내보내기 — Payhere 업로드 양식
     */
    exportProducts() {
        if (typeof XLSX === 'undefined') { alert('엑셀 라이브러리가 로드되지 않았습니다.'); return; }
        const products = window.productDataManager?.getAllProducts?.() || [];
        if (products.length === 0) { alert('내보낼 상품이 없습니다.'); return; }

        const HEADERS = [
            '상품명','카테고리','색 설정','판매탭 노출','재고관리 설정',
            '옵션명1','옵션값1','옵션명2','옵션값2','옵션명3','옵션값3',
            'SKU','바코드','판매가','부가세','원가','수량','안전재고'
        ];
        // SKU 유효성: 영문·숫자·-·_ 만, 1~20자
        const skuOk = s => s && /^[A-Za-z0-9_-]{1,20}$/.test(s);
        const seenSku = new Set();
        const getSku = s => {
            if (!skuOk(s)) return null;        // 형식 불일치 → null
            if (seenSku.has(s)) return null;   // 중복 → null
            seenSku.add(s);
            return s;
        };

        // Payhere 카테고리 매핑: 식물류→다육이, 화분→화분, 나머지→기타
        const PLANT_CATS = new Set(['그랩토페들럼','두들레야','에오니움','에케베리아','코노피튬','크라슐라','포퀘리아']);
        const payhereCategory = c => PLANT_CATS.has(c) ? '다육이' : c === '화분' ? '화분' : '기타';

        const dataRows = products.map(p => [
            p.name || '',
            payhereCategory(p.category),
            '초록',      // 색 설정 — Payhere 필수, 초록으로 고정
            '사용',      // 판매탭 노출
            '사용',      // 재고관리 설정
            null,null,null,null,null,null, // 옵션명/값 1~3 — null = 완전 빈칸
            getSku(p.product_code),
            p.barcode || null,
            p.price || 0,
            null,        // 부가세
            p.cost || null,
            p.stock ?? null,
            null,        // 안전재고
        ]);

        const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
        ws['!cols'] = [25,15,8,10,10,8,8,8,8,8,8,12,15,10,6,10,8,10].map(w=>({wch:w}));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '상품목록');
        const today = new Date().toISOString().slice(0,10);
        XLSX.writeFile(wb, `payhere_상품_${today}.xlsx`);
        window.showToast?.(`${products.length}개 상품 내보내기 완료`);
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
            <div class="px-3 py-2 hover:bg-page cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="selectProductNameSuggestion('${suggestion.name}')">
                <div class="text-sm font-medium text-heading">${suggestion.name}</div>
                <div class="text-xs text-muted">${suggestion.category} • ${this.formatCurrency(suggestion.price)}</div>
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

// ── 바코드 인쇄 / 카메라 스캔 전역 함수 ───────────────────────────────
(function() {
    if (window.JsBarcode) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
    document.head.appendChild(s);
})();

window.generateBarcodeForModal = function() {
    const input = document.getElementById('product-form-barcode');
    if (input) input.value = generateEAN13();
};

// ── 재고 일괄 수정 ──
window._productBulkStockAdjust = function() {
    const checked = [...document.querySelectorAll('.product-checkbox:checked')];
    if (checked.length === 0) { alert('상품을 선택해주세요.'); return; }

    const existing = document.getElementById('bulk-stock-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'bulk-stock-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '700';
    modal.innerHTML = `
        <div class="modal-container modal-sm">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-boxes text-info mr-2"></i>재고 일괄 수정</span>
                <button class="modal-close-btn" onclick="document.getElementById('bulk-stock-modal').remove()"><i class="fas fa-times text-sm"></i></button>
            </div>
            <div class="modal-body" style="padding:16px;">
                <p class="text-sm text-secondary mb-3">선택된 <strong class="text-info">${checked.length}개</strong> 상품의 재고를 수정합니다.</p>
                <div class="mb-3">
                    <label class="form-label">수정 방식</label>
                    <select id="bulk-stock-mode" class="form-control">
                        <option value="add">재고 추가 (+)</option>
                        <option value="subtract">재고 차감 (-)</option>
                        <option value="set">재고 설정 (=)</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">수량</label>
                    <input type="number" id="bulk-stock-qty" class="form-control" min="0" value="0" placeholder="수량 입력">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('bulk-stock-modal').remove()">취소</button>
                <button id="bulk-stock-apply" class="btn-primary"><i class="fas fa-check mr-1"></i>적용</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('bulk-stock-apply').addEventListener('click', async () => {
        const mode = document.getElementById('bulk-stock-mode').value;
        const qty = parseInt(document.getElementById('bulk-stock-qty').value) || 0;
        if (qty === 0 && mode !== 'set') { alert('수량을 입력해주세요.'); return; }

        let ok = 0;
        for (const cb of checked) {
            const id = cb.dataset.productId;
            try {
                const product = window.productDataManager?.getProductById(id);
                if (!product) continue;
                let newStock;
                if (mode === 'add') newStock = (Number(product.stock) || 0) + qty;
                else if (mode === 'subtract') newStock = Math.max(0, (Number(product.stock) || 0) - qty);
                else newStock = qty;

                const oldStock = Number(product.stock) || 0;
                await window.supabaseClient.from('farm_products').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', id);
                product.stock = newStock;
                // 입출고 이력 기록
                if (window.logStockChange) {
                    const logType = mode === 'add' ? 'in' : mode === 'subtract' ? 'out' : 'adjust';
                    await window.logStockChange(id, logType, Math.abs(newStock - oldStock), { reason: '재고 일괄 수정 (' + mode + ')' });
                }
                ok++;
            } catch (e) { console.error('재고 수정 실패:', id, e); }
        }

        modal.remove();
        alert(ok + '개 상품 재고 수정 완료');
        if (window.productManagementComponent) window.productManagementComponent.loadProducts();
    });
};

// ── 일괄 삭제 ──
window._productBulkDelete = function() {
    if (window.productManagementComponent) window.productManagementComponent.bulkDeleteProducts();
};

// ── 카테고리별 통계 렌더 ──
window._renderCategoryStats = function() {
    const el = document.getElementById('product-category-stats');
    if (!el) return;
    const products = window.productDataManager?.farm_products || [];
    if (products.length === 0) { el.innerHTML = ''; return; }

    const stats = {};
    let totalStock = 0, outOfStock = 0, lowStock = 0;
    products.forEach(p => {
        const cat = p.category || '미분류';
        if (!stats[cat]) stats[cat] = { count: 0, stock: 0, value: 0 };
        stats[cat].count++;
        stats[cat].stock += Number(p.stock) || 0;
        stats[cat].value += (Number(p.price) || 0) * (Number(p.stock) || 0);
        totalStock += Number(p.stock) || 0;
        if ((Number(p.stock) || 0) === 0) outOfStock++;
        else if ((Number(p.stock) || 0) <= 5) lowStock++;
    });

    const won = (v) => window.fmt?.currency(v) || '₩' + v.toLocaleString();
    const badges = Object.entries(stats).map(([cat, s]) =>
        `<span class="px-2 py-0.5 rounded" style="background:#fff;border:1px solid #e0e0e0;cursor:pointer;" onclick="document.getElementById('product-category-filter').value='${cat}';document.getElementById('product-filter-btn')?.click();">${cat} <strong>${s.count}</strong></span>`
    ).join('');

    el.innerHTML = `
        <span class="text-muted">전체 <strong>${products.length}</strong>종 · 총재고 <strong>${totalStock}</strong>개</span>
        ${outOfStock > 0 ? `<span style="color:var(--danger);"><i class="fas fa-exclamation-circle mr-1"></i>품절 ${outOfStock}</span>` : ''}
        ${lowStock > 0 ? `<span style="color:var(--warn);"><i class="fas fa-exclamation-triangle mr-1"></i>부족 ${lowStock}</span>` : ''}
        <span class="text-gray-300">|</span>
        ${badges}
    `;
};

// ── 상품 상세 모달 (클릭 시 주문 이력·재고 정보 표시) ──
window.openProductDetailModal = async function(productId) {
    const product = window.productDataManager?.getProductById(productId);
    if (!product) return;

    const existing = document.getElementById('product-detail-modal');
    if (existing) existing.remove();

    const won = (v) => window.fmt?.currency(v) || '₩' + Number(v).toLocaleString();
    const price = Number(product.price) || 0;
    const cost = Number(product.cost) || 0;
    const stock = Number(product.stock) || 0;
    const margin = price > 0 && cost > 0 ? Math.round((price - cost) / price * 100) : null;
    const stockValue = price * stock;

    // 최근 주문 이력 조회
    let orderHistoryHtml = '<p class="text-muted text-center py-2">조회 중...</p>';
    const modal = document.createElement('div');
    modal.id = 'product-detail-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '600';
    modal.innerHTML = `
        <div class="modal-container modal-lg" style="max-width:700px;max-height:90vh;display:flex;flex-direction:column;">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-seedling text-brand mr-2"></i>${(product.name || '').replace(/</g,'&lt;')}</span>
                <button class="modal-close-btn" onclick="document.getElementById('product-detail-modal').remove()"><i class="fas fa-times text-sm"></i></button>
            </div>
            <div class="modal-body" style="overflow-y:auto;flex:1;padding:16px;">
                <div class="flex gap-4 mb-4">
                    ${product.image_url ? `<img src="${product.image_url}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #e0e0e0;" onerror="this.style.display='none'">` : ''}
                    <div class="flex-1">
                        <div class="grid grid-cols-3 gap-3 text-sm">
                            <div><span class="text-muted block">카테고리</span><strong>${product.category || '-'}</strong></div>
                            <div><span class="text-muted block">사이즈</span><strong>${product.size || '-'}</strong></div>
                            <div><span class="text-muted block">상품코드</span><strong class="text-xs">${product.product_code || '-'}</strong></div>
                            <div><span class="text-muted block">판매가</span><strong>${won(price)}</strong></div>
                            <div><span class="text-muted block">매입가</span><strong>${cost > 0 ? won(cost) : '-'}</strong></div>
                            <div><span class="text-muted block">마진율</span><strong style="${margin !== null ? (margin >= 50 ? 'color:var(--primary)' : margin < 30 ? 'color:var(--danger)' : '') : ''}">${margin !== null ? margin + '%' : '-'}</strong></div>
                            <div><span class="text-muted block">재고</span><strong style="${stock === 0 ? 'color:var(--danger)' : stock <= 5 ? 'color:var(--warn)' : ''}">${stock}개</strong></div>
                            <div><span class="text-muted block">재고 가치</span><strong>${won(stockValue)}</strong></div>
                            <div><span class="text-muted block">바코드</span><strong class="text-xs">${product.barcode || '-'}</strong></div>
                        </div>
                    </div>
                </div>
                ${product.description ? `<div class="mb-3 p-2 rounded text-sm" style="background:var(--bg-light);border:1px solid var(--border);">${product.description.replace(/</g,'&lt;')}</div>` : ''}
                <div class="flex gap-4 mb-2">
                    <button id="pdt-tab-orders" class="text-sm font-semibold text-info pb-1" style="border-bottom:2px solid var(--info);" onclick="document.getElementById('pdt-orders').classList.remove('hidden');document.getElementById('pdt-stock-logs').classList.add('hidden');this.style.borderBottom='2px solid var(--info)';document.getElementById('pdt-tab-stock').style.borderBottom='none';">
                        <i class="fas fa-history mr-1"></i>주문 이력
                    </button>
                    <button id="pdt-tab-stock" class="text-sm font-semibold text-secondary pb-1" onclick="document.getElementById('pdt-stock-logs').classList.remove('hidden');document.getElementById('pdt-orders').classList.add('hidden');this.style.borderBottom='2px solid var(--info)';document.getElementById('pdt-tab-orders').style.borderBottom='none';window._loadStockLogs('${productId}');">
                        <i class="fas fa-boxes mr-1"></i>입출고 이력
                    </button>
                </div>
                <div id="pdt-orders">${orderHistoryHtml}</div>
                <div id="pdt-stock-logs" class="hidden"><p class="text-muted text-center py-2">탭을 클릭하면 로드됩니다</p></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // 입출고 이력 로드 함수
    window._loadStockLogs = async function(productId) {
        const container = document.getElementById('pdt-stock-logs');
        if (!container) return;
        container.innerHTML = '<p class="text-muted text-center py-2">조회 중...</p>';
        try {
            const logs = await window.getStockLogs(productId, 20);
            if (!logs || logs.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-2">입출고 이력이 없습니다</p>';
                return;
            }
            const TYPE_LABELS = { 'in': '입고', 'out': '출고', 'adjust': '조정', 'order': '주문', 'cancel': '취소', 'return': '반품' };
            const TYPE_COLORS = { 'in': 'color:var(--primary)', 'out': 'color:var(--danger)', 'adjust': '', 'order': 'color:var(--danger)', 'cancel': 'color:var(--primary)', 'return': 'color:var(--warn)' };
            container.innerHTML = `<table class="table-ui w-full text-xs">
                <thead><tr><th>일시</th><th>유형</th><th>수량</th><th>재고 전</th><th>재고 후</th><th>사유</th></tr></thead>
                <tbody>${logs.map(l => `<tr>
                    <td class="text-center">${l.created_at ? new Date(l.created_at).toLocaleString('ko-KR', {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                    <td class="text-center" style="${TYPE_COLORS[l.type] || ''}"><strong>${TYPE_LABELS[l.type] || l.type}</strong></td>
                    <td class="td-num text-right" style="${['out','order'].includes(l.type) ? 'color:var(--danger)' : 'color:var(--primary)'}">${['out','order'].includes(l.type) ? '-' : '+'}${l.quantity}</td>
                    <td class="td-num text-right">${l.stock_before ?? '-'}</td>
                    <td class="td-num text-right">${l.stock_after ?? '-'}</td>
                    <td class="td-secondary">${l.reason || '-'}</td>
                </tr>`).join('')}</tbody>
            </table>`;
        } catch (e) {
            container.innerHTML = '<p class="text-danger text-center py-2">조회 실패</p>';
        }
    };

    // 주문 이력 비동기 로드
    try {
        if (window.supabaseClient) {
            const { data: items } = await window.supabaseClient
                .from('farm_order_items')
                .select('order_id, quantity, subtotal, created_at')
                .eq('product_name', product.name)
                .order('created_at', { ascending: false })
                .limit(10);

            const ordersDiv = document.getElementById('product-detail-orders');
            if (!ordersDiv) return;

            if (!items || items.length === 0) {
                ordersDiv.innerHTML = '<p class="text-muted text-center py-2">주문 이력이 없습니다</p>';
                return;
            }

            // 주문 정보 조회
            const orderIds = [...new Set(items.map(i => i.order_id))];
            const { data: orders } = await window.supabaseClient
                .from('farm_orders')
                .select('id, order_number, customer_name, order_status, created_at')
                .in('id', orderIds);
            const orderMap = {};
            (orders || []).forEach(o => orderMap[o.id] = o);

            ordersDiv.innerHTML = `<table class="table-ui w-full text-xs">
                <thead><tr><th>주문번호</th><th>고객명</th><th>수량</th><th>금액</th><th>상태</th><th>일자</th></tr></thead>
                <tbody>${items.map(i => {
                    const o = orderMap[i.order_id] || {};
                    return `<tr>
                        <td class="td-muted">${o.order_number || '-'}</td>
                        <td class="td-primary">${o.customer_name || '-'}</td>
                        <td class="td-num text-right">${i.quantity}개</td>
                        <td class="td-amount text-right">${won(i.subtotal || 0)}</td>
                        <td class="text-center">${o.order_status || '-'}</td>
                        <td class="text-center">${i.created_at ? new Date(i.created_at).toLocaleDateString('ko-KR') : '-'}</td>
                    </tr>`;
                }).join('')}</tbody>
            </table>`;
        }
    } catch (e) {
        console.error('주문 이력 조회 실패:', e);
        const ordersDiv = document.getElementById('product-detail-orders');
        if (ordersDiv) ordersDiv.innerHTML = '<p class="text-danger text-center py-2">조회 실패</p>';
    }
};

// preSelectedIds: 테이블 체크박스에서 미리 선택할 상품 ID 배열 (없으면 전체 선택)
window.openBarcodePrintModal = function(preSelectedIds, noBarcodeCount = 0) {
    const products = (window.productDataManager?.farm_products || [])
        .filter(p => p.barcode)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));

    const selectedSet = preSelectedIds ? new Set(preSelectedIds.map(String)) : null;

    const list = document.getElementById('barcode-product-list');
    if (!list) return;
    list.innerHTML = products.map(p => {
        const isChecked = selectedSet ? selectedSet.has(String(p.id)) : true;
        return `<label class="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-section" style="border-color:var(--border);">
            <input type="checkbox" class="barcode-check checkbox-ui" data-id="${p.id}"${isChecked ? ' checked' : ''}>
            <span class="text-xs td-primary truncate flex-1">${(p.name||'').replace(/</g,'&lt;')}</span>
            <span class="text-2xs td-muted font-mono">${p.barcode}</span>
        </label>`;
    }).join('');

    document.getElementById('barcode-print-modal')?.classList.remove('hidden');

    // 바코드 없는 상품 제외 경고
    const warnEl = document.getElementById('barcode-no-barcode-warn');
    const msgEl  = document.getElementById('barcode-no-barcode-msg');
    if (warnEl && msgEl) {
        if (noBarcodeCount > 0) {
            msgEl.textContent = `바코드 없는 상품 ${noBarcodeCount}개 제외됨`;
            warnEl.classList.remove('hidden');
        } else {
            warnEl.classList.add('hidden');
        }
    }

    // 전체 선택 버튼 텍스트 초기화
    const selAllBtn = document.getElementById('barcode-select-all-btn');
    if (selAllBtn) selAllBtn.textContent = '전체 선택';

    _initBarcodeSizePicker();
    window.setBarcodePrintMode('label');

    // 체크박스 변경 시 미리보기 업데이트 (이벤트 위임)
    if (list && !list.dataset.previewBound) {
        list.addEventListener('change', () => window.updateBarcodePreview());
        list.dataset.previewBound = '1';
    }
    setTimeout(() => window.updateBarcodePreview(), 50);
};

// 테이블 체크박스 선택 상품으로 바코드 인쇄 모달 열기
window._productBulkPrintBarcodes = function() {
    const checked = [...document.querySelectorAll('.product-checkbox:checked')];
    if (checked.length === 0) { alert('상품을 선택해주세요.'); return; }
    const ids = checked.map(c => c.dataset.productId);
    const noBarcode = ids.filter(id => {
        const p = (window.productDataManager?.farm_products || []).find(x => String(x.id) === String(id));
        return p && !p.barcode;
    });
    if (noBarcode.length > 0 && noBarcode.length === ids.length) {
        alert('선택된 상품에 바코드가 없습니다. 상품 편집에서 바코드를 먼저 설정해주세요.');
        return;
    }
    window.openBarcodePrintModal(ids, noBarcode.length);
};

// 인쇄 모드 전환 (label / a4)
window.setBarcodePrintMode = function(mode) {
    const btnLabel = document.getElementById('barcode-mode-label');
    const btnA4    = document.getElementById('barcode-mode-a4');
    const labelSet = document.getElementById('barcode-label-settings');
    const a4Set    = document.getElementById('barcode-a4-settings');
    const labelHint= document.getElementById('barcode-print-hint');
    const a4Hint   = document.getElementById('barcode-a4-hint');
    if (!btnLabel) return;

    const isA4 = mode === 'a4';
    btnLabel.style.background = isA4 ? '#fff' : 'var(--primary)';
    btnLabel.style.color      = isA4 ? 'var(--text-body)' : '#fff';
    btnA4.style.background    = isA4 ? 'var(--primary)' : '#fff';
    btnA4.style.color         = isA4 ? '#fff' : 'var(--text-body)';

    labelSet.classList.toggle('hidden', isA4);
    a4Set.classList.toggle('hidden', !isA4);
    labelHint.classList.toggle('hidden', isA4);
    a4Hint.classList.toggle('hidden', !isA4);

    document.getElementById('barcode-print-modal').dataset.printMode = mode;
    window.updateA4SizeHint();
};

// A4 모드 라벨 개수 힌트 업데이트
window.updateA4SizeHint = function() {
    // custom 옵션 show/hide
    const preset = document.getElementById('barcode-a4-size-preset')?.value;
    document.getElementById('barcode-a4-size-custom')?.classList.toggle('hidden', preset !== 'custom');

    const el = document.getElementById('barcode-a4-count-hint');
    if (!el) return;
    const { W, H } = _getA4LabelSize();
    const cols = Math.floor(190 / W);
    const rows = Math.floor(277 / H);
    el.textContent = `A4 1장에 약 ${cols * rows}개`;
};

function _getA4LabelSize() {
    const preset = document.getElementById('barcode-a4-size-preset')?.value || '40x20';
    if (preset === 'custom') {
        const W = parseFloat(document.getElementById('barcode-a4-size-w')?.value) || 40;
        const H = parseFloat(document.getElementById('barcode-a4-size-h')?.value) || 20;
        return { W, H };
    }
    const [W, H] = preset.split('x').map(Number);
    return { W, H };
}

function _initBarcodeSizePicker() {
    const preset = document.getElementById('barcode-size-preset');
    const customBox = document.getElementById('barcode-size-custom');
    const wIn = document.getElementById('barcode-size-w');
    const hIn = document.getElementById('barcode-size-h');
    if (!preset || !customBox) return;

    const saved = (() => {
        try { return JSON.parse(localStorage.getItem('barcodeLabelSize') || 'null'); } catch { return null; }
    })();
    if (saved && typeof saved.W === 'number' && typeof saved.H === 'number') {
        const key = `${saved.W}x${saved.H}`;
        const hasOption = [...preset.options].some(o => o.value === key);
        preset.value = hasOption ? key : 'custom';
        if (!hasOption) {
            if (wIn) wIn.value = saved.W;
            if (hIn) hIn.value = saved.H;
        }
    }
    customBox.classList.toggle('hidden', preset.value !== 'custom');

    const _updateHint = () => {
        const hint = document.getElementById('barcode-size-hint');
        if (!hint) return;
        if (preset.value === 'custom') {
            const w = document.getElementById('barcode-size-w')?.value || '?';
            const h = document.getElementById('barcode-size-h')?.value || '?';
            hint.textContent = `${w} × ${h} mm`;
        } else {
            const [w, h] = preset.value.split('x');
            hint.textContent = `${w} × ${h} mm`;
        }
        window.updateBarcodePreview?.();
    };
    _updateHint();

    if (!preset.dataset.bound) {
        preset.addEventListener('change', () => {
            customBox.classList.toggle('hidden', preset.value !== 'custom');
            _updateHint();
        });
        ['barcode-size-w', 'barcode-size-h'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', _updateHint);
        });
        preset.dataset.bound = '1';
    }
}

function _getBarcodeLabelSize() {
    const preset = document.getElementById('barcode-size-preset');
    if (!preset) return { W: 40, H: 20 };
    let W = 40, H = 20;
    if (preset.value === 'custom') {
        W = parseInt(document.getElementById('barcode-size-w')?.value, 10) || 40;
        H = parseInt(document.getElementById('barcode-size-h')?.value, 10) || 20;
    } else {
        const [w, h] = preset.value.split('x').map(n => parseInt(n, 10));
        if (w && h) { W = w; H = h; }
    }
    W = Math.max(10, Math.min(200, W));
    H = Math.max(10, Math.min(200, H));
    try { localStorage.setItem('barcodeLabelSize', JSON.stringify({ W, H })); } catch {}
    return { W, H };
}

window.updateBarcodePreview = function() {
    const box = document.getElementById('barcode-preview-box');
    if (!box || !window.JsBarcode) return;
    const { W, H } = _getBarcodeLabelSize();
    const selected = [...document.querySelectorAll('.barcode-check:checked')].map(c => c.dataset.id);
    const products = (window.productDataManager?.farm_products || [])
        .filter(p => selected.includes(String(p.id)) && p.barcode);
    if (!products.length) {
        box.innerHTML = '<span class="text-xs text-muted">상품을 선택하면<br>미리보기가 표시됩니다</span>';
        return;
    }
    const p = products[0];
    const PX_PER_MM = 3.7795;
    const maxW = 160;
    const scale = Math.min(1, maxW / (W * PX_PER_MM));
    const displayW = Math.round(W * PX_PER_MM * scale);
    const displayH = Math.round(H * PX_PER_MM * scale);
    const bcHeight = Math.max(18, Math.min(80, Math.round(H * 0.6 * 10) / 10));
    const infoFontPt = Math.max(3.5, Math.min(9, (W * H) / 120));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    try {
        window.JsBarcode(svg, p.barcode, { format:'EAN13', width:0.8*scale, height:bcHeight*scale, fontSize:6*scale, margin:1, displayValue:true });
    } catch {
        window.JsBarcode(svg, p.barcode, { format:'CODE128', width:0.8*scale, height:bcHeight*scale, fontSize:6*scale, margin:1, displayValue:true });
    }
    const svgStr = new XMLSerializer().serializeToString(svg);
    const name = (p.name||'').replace(/</g,'&lt;');
    const price = p.price ? Number(p.price).toLocaleString()+'원' : '';
    box.innerHTML = `
        <div class="text-2xs text-muted mb-1">${selected.length}개 선택 · ${W}×${H}mm</div>
        <div style="background:#fff;border:1px solid #CBD5E1;border-radius:4px;width:${displayW}px;height:${displayH}px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:1px 2px 2px;">
            ${svgStr}
            <div style="font-size:${infoFontPt*scale*1.333}px;font-weight:700;text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.1;">${name}&nbsp;${price}</div>
        </div>
        ${products.length>1?`<div class="text-2xs text-muted mt-1">+${products.length-1}개 더</div>`:''}
    `;
};

window.selectAllBarcodes = function(checked) {
    document.querySelectorAll('.barcode-check').forEach(c => c.checked = checked);
};

window.toggleAllBarcodes = function(btn) {
    const allChecked = [...document.querySelectorAll('.barcode-check')].every(c => c.checked);
    const select = !allChecked;
    document.querySelectorAll('.barcode-check').forEach(c => c.checked = select);
    btn.textContent = select ? '전체 해제' : '전체 선택';
};

window.printBarcodeLabels = function() {
    if (!window.JsBarcode) { alert('바코드 라이브러리 로딩 중입니다. 잠시 후 다시 시도해주세요.'); return; }

    const selected = [...document.querySelectorAll('.barcode-check:checked')].map(c => c.dataset.id);
    if (!selected.length) { alert('인쇄할 상품을 선택해주세요.'); return; }

    const printMode = document.getElementById('barcode-print-modal')?.dataset.printMode || 'label';
    if (printMode === 'a4') { window._printBarcodeLabelsA4(selected); return; }

    const products = (window.productDataManager?.farm_products || [])
        .filter(p => selected.includes(String(p.id)) && p.barcode);

    // 사용자 선택 라벨 크기 (기본 40×20mm, localStorage 저장)
    const { W, H } = _getBarcodeLabelSize();
    // EAN-13 at width=1 SVG 폭 ≈ 113px. 라벨 폭으로 스케일 후 목표 바높이(H*0.62) 역산
    const eanSvgW = 113;
    const pxPerMm = 96 / 25.4;
    const scale = (W * pxPerMm) / eanSvgW;
    const bcHeight = Math.max(20, Math.min(150, Math.round((H * pxPerMm * 0.62) / scale)));
    // 이름·가격 폰트 크기 — 라벨 높이 기반, 작은 라벨에 맞게 조정
    const infoFontPt = Math.max(4, Math.min(10, H * 0.35));
    // 가로 패딩: 양쪽 1.5mm (우측 잘림 방지)
    const padH = 1.5;

    const labels = products.map((p, i) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        try {
            window.JsBarcode(svg, p.barcode, {
                format: 'EAN13', width: 1.0, height: bcHeight,
                fontSize: Math.round(bcHeight * 0.22), margin: 1, displayValue: true
            });
        } catch(e) {
            window.JsBarcode(svg, p.barcode, {
                format: 'CODE128', width: 1.0, height: bcHeight,
                fontSize: Math.round(bcHeight * 0.22), margin: 1, displayValue: true
            });
        }
        const svgStr = new XMLSerializer().serializeToString(svg);
        const name  = (p.name || '').replace(/</g,'&lt;');
        const price = p.price ? Number(p.price).toLocaleString() + '원' : '';
        const isLast = i === products.length - 1;
        return `<div class="label${isLast ? '' : ' break'}">
            ${svgStr}
            <div class="info">${name}&nbsp;&nbsp;${price}</div>
        </div>`;
    }).join('');

    const labelCount = products.length;
    const win = window.open('', '_blank', 'width=480,height=360');
    if (!win) { alert('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>바코드 라벨 인쇄</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Malgun Gothic', sans-serif; background: #f8f8f8; }
            #print-bar {
                position: fixed; top: 0; left: 0; right: 0; z-index: 999;
                background: #16a34a; color: #fff;
                display: flex; align-items: center; justify-content: space-between;
                padding: 8px 14px; gap: 10px;
                font-size: 13px;
            }
            #print-bar span { opacity: 0.9; }
            #btn-do-print {
                background: #fff; color: #16a34a;
                border: none; border-radius: 6px;
                padding: 6px 18px; font-size: 14px; font-weight: 700;
                cursor: pointer; white-space: nowrap;
            }
            #btn-do-print:hover { background: #f0fdf4; }
            #preview-area {
                margin-top: 48px; padding: 16px;
                display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
            }
            .label-preview {
                width: ${W * 3.78}px; height: ${H * 3.78}px;
                border: 1px dashed #aaa; background: #fff;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 2px 5px; overflow: hidden;
            }
            .label-preview svg { max-width: 100%; height: auto; display: block; }
            .label-preview .info {
                font-size: ${infoFontPt}pt; font-weight: 700;
                text-align: center; width: 100%;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                margin-top: 1px; line-height: 1.1;
            }
            @media print {
                #print-bar { display: none !important; }
                #preview-area { display: none !important; }
                body { background: #fff; margin: 0; padding: 0; }
                #print-content { display: block !important; }
                @page { size: ${W}mm ${H}mm; margin: 0; }
            }
            #print-content { display: none; }
            .label {
                width: ${W}mm; height: ${H}mm;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 0.5mm ${padH}mm 0.5mm;
                overflow: hidden;
                page-break-after: always;
            }
            .label:last-child { page-break-after: avoid; }
            .label svg { max-width: 100%; height: auto; display: block; }
            .label .info {
                font-size: ${infoFontPt}pt; font-weight: 700;
                text-align: center; width: 100%;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                margin-top: 0.5mm; line-height: 1.1;
            }
        </style></head><body>
        <div id="print-bar">
            <span>라벨 ${labelCount}장 준비됨 (${W}×${H}mm)</span>
            <button id="btn-do-print" onclick="doPrint()">🖨 인쇄</button>
        </div>
        <div id="preview-area">${labels.replace(/class="label[^"]*"/g, 'class="label-preview"')}</div>
        <div id="print-content">${labels}</div>
        <script>
        function doPrint(){
            document.getElementById('btn-do-print').disabled=true;
            document.getElementById('btn-do-print').textContent='인쇄 중...';
            setTimeout(function(){
                window.print();
                window.onafterprint=function(){window.close();};
                var mql=window.matchMedia('print');
                mql.addEventListener('change',function(e){
                    if(!e.matches)setTimeout(function(){window.close();},300);
                });
            },50);
        }
        <\/script>
    </body></html>`);
    win.document.close();
};

// A4 용지 바코드 인쇄
window._printBarcodeLabelsA4 = function(selected) {
    const products = (window.productDataManager?.farm_products || [])
        .filter(p => selected.includes(String(p.id)) && p.barcode);
    if (!products.length) { alert('바코드가 있는 상품이 없습니다.'); return; }

    const { W, H } = _getA4LabelSize();
    const usableW = 190, usableH = 277; // A4 margin 10mm
    const cols = Math.max(1, Math.floor(usableW / W));
    const rows = Math.max(1, Math.floor(usableH / H));
    const perPage = cols * rows;

    const pxPerMm = 96 / 25.4;
    const eanSvgW = 113;
    const scale = (W * pxPerMm) / eanSvgW;
    const bcHeight = Math.max(15, Math.min(120, Math.round((H * pxPerMm * 0.58) / scale)));
    const infoFontPt = Math.max(4, Math.min(9, H * 0.28));

    // 라벨 SVG 생성
    const labelData = products.map(p => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        try {
            window.JsBarcode(svg, p.barcode, { format:'EAN13', width:1.0, height:bcHeight, fontSize:Math.round(bcHeight*0.22), margin:1, displayValue:true });
        } catch(e) {
            window.JsBarcode(svg, p.barcode, { format:'CODE128', width:1.0, height:bcHeight, fontSize:Math.round(bcHeight*0.22), margin:1, displayValue:true });
        }
        return {
            svg: new XMLSerializer().serializeToString(svg),
            name: (p.name||'').replace(/</g,'&lt;'),
            price: p.price ? Number(p.price).toLocaleString()+'원' : ''
        };
    });

    // 미리보기용 HTML (화면 표시)
    const previewHtml = labelData.map(d =>
        `<div style="width:${W*3.78}px;height:${H*3.78}px;border:1px dashed #aaa;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 4px;overflow:hidden;flex-shrink:0;">
            ${d.svg.replace(/<svg /, '<svg style="max-width:100%;height:auto;display:block;" ')}
            <div style="font-size:${infoFontPt}pt;font-weight:700;text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;line-height:1.1;">${d.name}&nbsp;${d.price}</div>
        </div>`
    ).join('');

    // 인쇄용 HTML (A4 페이지별 그리드)
    const printPages = (() => {
        let pages = '';
        for (let i = 0; i < labelData.length; i += perPage) {
            const chunk = labelData.slice(i, i + perPage);
            const cells = chunk.map(d =>
                `<div class="lbl">${d.svg}<div class="lbl-info">${d.name}&nbsp;${d.price}</div></div>`
            ).join('');
            const isLast = i + perPage >= labelData.length;
            pages += `<div class="pg${isLast ? ' last' : ''}">${cells}</div>`;
        }
        return pages;
    })();

    const labelCount = products.length;
    const pageCount = Math.ceil(labelCount / perPage);
    const win = window.open('', '_blank', 'width=720,height=900');
    if (!win) { alert('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>바코드 A4 인쇄</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Malgun Gothic', sans-serif; background: #f4f4f4; }
            #print-bar {
                position: fixed; top: 0; left: 0; right: 0; z-index: 999;
                background: #16a34a; color: #fff;
                display: flex; align-items: center; justify-content: space-between;
                padding: 8px 14px; gap: 10px; font-size: 13px;
            }
            #btn-do-print { background:#fff;color:#16a34a;border:none;border-radius:6px;padding:6px 18px;font-size:14px;font-weight:700;cursor:pointer; }
            #preview-area { margin-top: 54px; padding: 16px; display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; }
            #print-content { display: none; }
            @media print {
                #print-bar, #preview-area { display: none !important; }
                body { background: #fff; }
                #print-content { display: block !important; }
                @page { size: A4; margin: 10mm; }
                .pg { display: flex; flex-wrap: wrap; align-content: flex-start; width: 190mm; page-break-after: always; }
                .pg.last { page-break-after: avoid; }
                .lbl { width: ${W}mm; height: ${H}mm; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.3mm 0.8mm; }
                .lbl svg { max-width: 100%; height: auto; display: block; }
                .lbl-info { font-size: ${infoFontPt}pt; font-weight: 700; text-align: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 0.3mm; line-height: 1.1; }
            }
        </style></head><body>
        <div id="print-bar">
            <span>A4 인쇄 — 라벨 ${labelCount}장 · ${pageCount}페이지 (${cols}열 × ${rows}행, ${W}×${H}mm)</span>
            <button id="btn-do-print" onclick="doPrint()">🖨 인쇄</button>
        </div>
        <div id="preview-area">${previewHtml}</div>
        <div id="print-content">${printPages}</div>
        <script>
        function doPrint(){
            document.getElementById('btn-do-print').disabled=true;
            document.getElementById('btn-do-print').textContent='인쇄 중...';
            setTimeout(function(){
                window.print();
                window.onafterprint=function(){window.close();};
            },50);
        }
        <\/script>
    </body></html>`);
    win.document.close();
};

let _barcodeScanner = null;

window.openBarcodeScanner = function() {
    const modal = document.getElementById('barcode-scan-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const statusEl = document.getElementById('scan-status-text');
    const manualInput = document.getElementById('manual-barcode-input');
    if (manualInput) manualInput.value = '';

    if (!window.Html5Qrcode) {
        if (statusEl) statusEl.textContent = '스캔 라이브러리 로딩 실패. 직접 입력을 이용해 주세요.';
        return;
    }

    if (statusEl) statusEl.textContent = '카메라 시작 중...';

    if (_barcodeScanner) {
        _barcodeScanner.stop().catch(() => {}).finally(() => { _barcodeScanner = null; _startBarcodeCamera(statusEl); });
    } else {
        _startBarcodeCamera(statusEl);
    }
};

function _startBarcodeCamera(statusEl) {
    try {
        _barcodeScanner = new window.Html5Qrcode('barcode-scanner-reader');
        const config = { fps: 10, qrbox: { width: 250, height: 100 } };
        // 후면 카메라 먼저 시도, 실패 시 전면(데스크톱 웹캠) 폴백
        _barcodeScanner.start({ facingMode: 'environment' }, config,
            (decodedText) => { window.processBarcodeResult(decodedText); }, () => {}
        ).then(() => {
            if (statusEl) statusEl.textContent = '카메라를 바코드에 가져다 대세요';
        }).catch(() => {
            _barcodeScanner.start({ facingMode: 'user' }, config,
                (decodedText) => { window.processBarcodeResult(decodedText); }, () => {}
            ).then(() => {
                if (statusEl) statusEl.textContent = '카메라를 바코드에 가져다 대세요';
            }).catch(err => {
                if (statusEl) statusEl.textContent = '카메라 접근 실패. 직접 입력을 이용해 주세요.';
                console.warn('카메라 시작 실패:', err);
            });
        });
    } catch(e) {
        if (statusEl) statusEl.textContent = '스캔 초기화 오류. 직접 입력을 이용해 주세요.';
        console.warn('Html5Qrcode 초기화 오류:', e);
    }
}

window.stopBarcodeScanner = function() {
    document.getElementById('barcode-scan-modal')?.classList.add('hidden');
    if (_barcodeScanner) {
        _barcodeScanner.stop().catch(() => {});
        _barcodeScanner = null;
    }
};

window.processBarcodeResult = function(barcode) {
    if (!barcode || !barcode.trim()) return;
    barcode = barcode.trim();

    window.stopBarcodeScanner();

    const products = window.productDataManager?.farm_products || [];
    const found = products.find(p => p.barcode === barcode);

    if (found) {
        window.showToast?.(`${found.name} 상품을 찾았습니다`, 'success');
        window.openProductModal?.(found.id);
    } else {
        window.showToast?.(`바코드 [${barcode}] — 새 상품 등록 화면으로 이동합니다`, 'info');
        window.openProductModal?.();
        setTimeout(() => {
            const input = document.getElementById('product-form-barcode');
            if (input) {
                input.value = barcode;
                const details = input.closest('details');
                if (details && !details.open) details.open = true;
            }
        }, 400);
    }
};

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
window.renderBarcodeSVGs = renderBarcodeSVGs;

console.log('✅ ProductManagement 컴포넌트 스크립트 로드 완료');
