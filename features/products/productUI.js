// 상품관리 UI 모듈
// 경산다육식물농장 관리시스템 - 상품 UI 관리

import { getProductDataManager } from './productData.js';

// 공통 상품 폼 필드 정의
const PRODUCT_FORM_FIELDS = [
    { id: 'name', label: '상품명', type: 'text', required: true, placeholder: '예: White Platter (대)' },
    { id: 'category', label: '카테고리', type: 'select', required: true, options: [] },
    { id: 'price', label: '판매가', type: 'number', required: true, min: 0, step: 1000 },
    { id: 'wholesale-price', label: '매입가', type: 'number', min: 0, step: 1000 },
    { id: 'stock', label: '재고수량', type: 'number', required: true, min: 0 },
    { id: 'size', label: '사이즈', type: 'select', options: ['소', '중', '대', '특대', '직접 기입'] },
    { id: 'shipping', label: '배송 옵션', type: 'select', required: true, options: ['일반배송', '당일배송', '직접배송', '픽업'] },
    { id: 'description', label: '상품설명', type: 'textarea', rows: 3 },
    { id: 'image', label: '상품 이미지 URL', type: 'url', placeholder: 'https://example.com/image.jpg' }
];

// 상품 테이블 컬럼 정의 (실제 화면에 표시되는 구조에 맞게 수정)
const PRODUCT_TABLE_COLUMNS = [
    { key: 'checkbox', label: '', width: 'w-12', type: 'checkbox' },
    { key: 'product_code', label: '상품코드', width: 'w-20' },
    { key: 'name', label: '상품명', width: 'w-1/4' },
    { key: 'category', label: '카테고리', width: 'w-1/6' },
    { key: 'size', label: '사이즈', width: 'w-1/6' },
    { key: 'price', label: '판매가', width: 'w-1/6', format: 'currency' },
    { key: 'stock', label: '재고', width: 'w-1/12', format: 'number' },
    { key: 'shipping', label: '배송옵션', width: 'w-1/6' },
    { key: 'actions', label: '관리', width: 'w-1/12', type: 'actions' }
];

// 공통 CSS 클래스 정의
const COMMON_STYLES = {
    table: {
        row: 'hover:bg-gray-50',
        cell: 'px-2.5 text-gray-900',
        cellCenter: 'px-2.5 text-center'
    },
    button: {
        edit: 'p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer border-none bg-transparent',
        delete: 'p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer border-none bg-transparent',
        primary: 'btn-primary',
        secondary: 'btn-secondary'
    },
    form: {
        input: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
        label: 'block text-sm font-medium text-gray-700 mb-1',
        required: 'text-red-500'
    }
};

/**
 * 상품관리 UI 클래스
 */
export class ProductUI {
    constructor() {
        console.log('🎨 ProductUI 초기화');
        this.setupProductNameAutocomplete();
    }
    
    /**
     * 상품명 자동완성 기능 설정
     */
    setupProductNameAutocomplete() {
        try {
            console.log('🔍 상품명 자동완성 기능 설정 중...');
            
            const nameInput = document.getElementById('product-form-name');
            const suggestionsContainer = document.getElementById('product-name-suggestions');
            const duplicateWarning = document.getElementById('product-name-duplicate-warning');
            
            if (!nameInput || !suggestionsContainer) {
                console.warn('⚠️ 상품명 자동완성 요소를 찾을 수 없습니다');
                return;
            }
            
            let debounceTimer = null;
            let currentSuggestions = [];
            let selectedIndex = -1;
            
            // 입력 이벤트 리스너
            nameInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // 디바운스 처리 (300ms 지연)
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    if (query.length >= 2) {
                        await this.searchProductNames(query);
                    } else {
                        this.hideSuggestions();
                        this.hideDuplicateWarning();
                    }
                }, 300);
            });
            
            // 포커스 이벤트
            nameInput.addEventListener('focus', async (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    await this.searchProductNames(query);
                }
            });
            
            // 포커스 아웃 이벤트 (지연 처리)
            nameInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.hideSuggestions();
                }, 200);
            });
            
            // 키보드 이벤트
            nameInput.addEventListener('keydown', (e) => {
                if (!suggestionsContainer.classList.contains('hidden')) {
                    switch (e.key) {
                        case 'ArrowDown':
                            e.preventDefault();
                            this.navigateSuggestions(1);
                            break;
                        case 'ArrowUp':
                            e.preventDefault();
                            this.navigateSuggestions(-1);
                            break;
                        case 'Enter':
                            e.preventDefault();
                            this.selectSuggestion();
                            break;
                        case 'Escape':
                            this.hideSuggestions();
                            break;
                    }
                }
            });
            
            console.log('✅ 상품명 자동완성 기능 설정 완료');
            
        } catch (error) {
            console.error('❌ 상품명 자동완성 설정 실패:', error);
        }
    }
    
    /**
     * 상품명 검색
     */
    async searchProductNames(query) {
        try {
            console.log('🔍 상품명 검색:', query);
            
            const productDataManager = getProductDataManager();
            if (!productDataManager) {
                console.warn('⚠️ productDataManager를 찾을 수 없습니다');
                return;
            }
            
            // 모든 상품에서 검색
            const allProducts = productDataManager.getAllProducts();
            const suggestions = allProducts
                .filter(product => 
                    product.name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5) // 최대 5개 제안
                .map(product => ({
                    name: product.name,
                    category: product.category,
                    price: product.price
                }));
            
            console.log('📊 검색 결과:', suggestions.length, '개');
            
            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
                
                // 정확히 일치하는 상품명이 있는지 확인
                const exactMatch = suggestions.find(s => s.name.toLowerCase() === query.toLowerCase());
                if (exactMatch) {
                    this.showDuplicateWarning();
                } else {
                    this.hideDuplicateWarning();
                }
            } else {
                this.hideSuggestions();
                this.hideDuplicateWarning();
            }
            
        } catch (error) {
            console.error('❌ 상품명 검색 실패:', error);
        }
    }
    
    /**
     * 제안 표시
     */
    showSuggestions(suggestions) {
        const container = document.getElementById('product-name-suggestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium text-gray-900">${suggestion.name}</div>
                        <div class="text-xs text-gray-500">${suggestion.category}</div>
                    </div>
                    <div class="text-sm text-gray-600">${suggestion.price.toLocaleString()}원</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion.name);
            });
            
            container.appendChild(item);
        });
        
        container.classList.remove('hidden');
    }
    
    /**
     * 제안 숨기기
     */
    hideSuggestions() {
        const container = document.getElementById('product-name-suggestions');
        if (container) {
            container.classList.add('hidden');
        }
    }
    
    /**
     * 중복 경고 표시
     */
    showDuplicateWarning() {
        const warning = document.getElementById('product-name-duplicate-warning');
        if (warning) {
            warning.classList.remove('hidden');
        }
    }
    
    /**
     * 중복 경고 숨기기
     */
    hideDuplicateWarning() {
        const warning = document.getElementById('product-name-duplicate-warning');
        if (warning) {
            warning.classList.add('hidden');
        }
    }
    
    /**
     * 제안 선택
     */
    selectSuggestion(suggestionName = null) {
        const nameInput = document.getElementById('product-form-name');
        if (nameInput) {
            if (suggestionName) {
                nameInput.value = suggestionName;
            }
            nameInput.focus();
        }
        this.hideSuggestions();
    }
    
    /**
     * 제안 네비게이션
     */
    navigateSuggestions(direction) {
        // 키보드 네비게이션 구현 (필요시)
        console.log('🔍 제안 네비게이션:', direction);
    }

    /**
     * 공통 폼 필드 생성
     */
    generateFormField(field) {
        const { id, label, type, required, placeholder, min, step, rows, options } = field;
        
        let inputElement = '';
        const requiredText = required ? ` <span class="${COMMON_STYLES.form.required}">*</span>` : '';
        
        switch (type) {
            case 'select':
                inputElement = `
                    <select id="product-form-${id}" ${required ? 'required' : ''}
                            class="${COMMON_STYLES.form.input}">
                        <option value="">${label} 선택</option>
                        ${options ? options.map(option => `<option value="${option}">${option}</option>`).join('') : ''}
                    </select>
                `;
                break;
            case 'textarea':
                inputElement = `
                    <textarea id="product-form-${id}" rows="${rows || 3}" placeholder="${placeholder || ''}"
                              class="${COMMON_STYLES.form.input} resize-none"></textarea>
                `;
                break;
            default:
                inputElement = `
                    <input type="${type}" id="product-form-${id}" placeholder="${placeholder || ''}" 
                           ${required ? 'required' : ''} ${min ? `min="${min}"` : ''} ${step ? `step="${step}"` : ''}
                           class="${COMMON_STYLES.form.input}">
                `;
        }
        
        return `
            <div>
                <label class="${COMMON_STYLES.form.label}">${label}${requiredText}</label>
                ${inputElement}
            </div>
        `;
    }

    /**
     * 폼 검증 로직
     */
    validateProductForm() {
        const errors = [];
        
        console.log('🔍 폼 검증 시작');
        
        // 필수 필드 검증
        PRODUCT_FORM_FIELDS.forEach(field => {
            if (field.required) {
                const element = document.getElementById(`product-form-${field.id}`);
                console.log(`🔍 필드 검증: ${field.id}`, {
                    element: !!element,
                    value: element ? element.value : 'null',
                    trimmed: element ? element.value.trim() : 'null'
                });
                
                if (!element || !element.value.trim()) {
                    const errorMsg = `${field.label}은(는) 필수 입력 항목입니다.`;
                    errors.push(errorMsg);
                    console.log('❌ 필수 필드 오류:', errorMsg);
                }
            }
        });
        
        // 숫자 필드 검증
        const priceElement = document.getElementById('product-form-price');
        const stockElement = document.getElementById('product-form-stock');
        
        if (priceElement && priceElement.value && isNaN(Number(priceElement.value))) {
            const errorMsg = '판매가는 숫자로 입력해주세요.';
            errors.push(errorMsg);
            console.log('❌ 숫자 필드 오류:', errorMsg);
        }
        
        if (stockElement && stockElement.value && isNaN(Number(stockElement.value))) {
            const errorMsg = '재고수량은 숫자로 입력해주세요.';
            errors.push(errorMsg);
            console.log('❌ 숫자 필드 오류:', errorMsg);
        }
        
        // URL 검증
        const imageElement = document.getElementById('product-form-image');
        if (imageElement && imageElement.value) {
            try {
                new URL(imageElement.value);
            } catch {
                const errorMsg = '상품 이미지 URL 형식이 올바르지 않습니다.';
                errors.push(errorMsg);
                console.log('❌ URL 필드 오류:', errorMsg);
            }
        }
        
        console.log('🔍 폼 검증 결과:', errors);
        return errors;
    }

    /**
     * 상품 모달 열기
     */
    async openProductModal(productId = null) {
        try {
            console.log('📦 상품 모달 열기:', productId);
            console.log('🔍 productId 타입:', typeof productId);
            console.log('🔍 productId 값:', productId);
            
            let modal = document.getElementById('product-modal');
            console.log('🔍 기존 모달 요소:', modal);
            
            // 모달이 없으면 동적으로 로드
            if (!modal) {
                console.log('📦 상품 모달이 없습니다. 동적 로드 시작...');
                try {
                    await this.loadProductModal();
                    modal = document.getElementById('product-modal');
                    console.log('🔍 로드된 모달 요소:', modal);
                    
                    if (!modal) {
                        console.error('❌ 상품 모달 로드 실패 - 모달 요소를 찾을 수 없습니다');
                        alert('상품 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                        return;
                    }
                } catch (loadError) {
                    console.error('❌ 상품 모달 로드 중 오류:', loadError);
                    alert('상품 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
                    return;
                }
            }
            
            // 모달 표시
            console.log('📦 모달 표시 중...');
            modal.classList.remove('hidden');

            // 카테고리 드롭다운 초기화
            console.log('🔄 카테고리 드롭다운 초기화 중...');
            await this.initCategoryOptions();
            console.log('✅ 카테고리 드롭다운 초기화 완료');
            
            // 카테고리 이벤트 리스너 설정 (모달을 열 때마다 재설정)
            this.setupCategoryEventListeners();
            
            // 완전한 중앙 정렬을 위한 추가 스타일
            const modalContent = document.getElementById('product-modal-content');
            if (modalContent) {
                modalContent.style.marginLeft = 'auto';
                modalContent.style.marginRight = 'auto';
                modalContent.style.marginTop = '0';
                modalContent.style.marginBottom = '0';
            }
            
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

            // 잠시 대기 후 데이터 로드 (DOM이 완전히 렌더링되도록)
            setTimeout(async () => {
                if (productId) {
                    console.log('📝 기존 상품 수정 모드');
                    await this.loadProductData(productId);
                } else {
                    console.log('➕ 새 상품 등록 모드');
                    this.resetProductForm();
                    this.setupProductCodePreview();
                    await this.initCategoryOptions();
                }
            }, 100);
            
            console.log('✅ 상품 모달 열기 완료');
        } catch (error) {
            console.error('❌ 상품 모달 열기 실패:', error);
            alert('상품 모달을 열 수 없습니다. 오류: ' + error.message);
        }
    }

    /**
     * 상품 모달 동적 로드
     */
    async loadProductModal() {
        try {
            console.log('📦 상품 모달 컴포넌트 로드 중...');
            
            // 상품 모달 컴포넌트 동적 로드
            const response = await fetch('components/product-management/product-modal.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const modalHTML = await response.text();
            console.log('📦 모달 HTML 로드 완료, 길이:', modalHTML.length);
            
            // 모달을 body에 추가
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('✅ 상품 모달 컴포넌트 로드 완료');
            
            // 모달이 제대로 추가되었는지 확인
            const modal = document.getElementById('product-modal');
            if (!modal) {
                throw new Error('모달이 DOM에 추가되지 않았습니다.');
            }
            console.log('✅ 모달 DOM 확인 완료');
            
            // 저장 버튼 이벤트 리스너 추가
            const saveProductBtn = document.getElementById('save-product-btn');
            if (saveProductBtn) {
                saveProductBtn.addEventListener('click', () => {
                    console.log('💾 상품 저장 버튼 클릭');
                    this.saveProduct();
                });
                console.log('✅ 상품 저장 버튼 이벤트 리스너 추가 완료');
            } else {
                console.warn('⚠️ 저장 버튼을 찾을 수 없습니다.');
            }
            
            // 닫기 버튼 이벤트 리스너 추가
            const closeProductBtn = document.getElementById('close-product-modal');
            if (closeProductBtn) {
                closeProductBtn.addEventListener('click', () => {
                    console.log('❌ 상품 모달 닫기 버튼 클릭');
                    this.closeProductModal();
                });
                console.log('✅ 상품 모달 닫기 버튼 이벤트 리스너 추가 완료');
            } else {
                console.warn('⚠️ 닫기 버튼을 찾을 수 없습니다.');
            }
            
            // 모달 배경 클릭 시 닫기
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        console.log('🖱️ 모달 배경 클릭 - 모달 닫기');
                        this.closeProductModal();
                    }
                });
                console.log('✅ 모달 배경 클릭 이벤트 리스너 추가 완료');
            }
            
            // 카테고리 선택 이벤트 리스너 추가
            const categorySelect = document.getElementById('product-form-category');
            if (categorySelect) {
                categorySelect.addEventListener('change', (e) => {
                    if (e.target.value === '__ADD_NEW__') {
                        console.log('➕ 새 카테고리 추가 선택됨');
                        this.openCategoryModalFromProduct();
                    }
                });
                console.log('✅ 카테고리 선택 이벤트 리스너 추가 완료');
            }
            
            // 빠른 카테고리 추가 버튼 이벤트 리스너
            const quickAddCategoryBtn = document.getElementById('modal-quick-add-category-btn');
            if (quickAddCategoryBtn) {
                quickAddCategoryBtn.addEventListener('click', () => {
                    console.log('⚡ 빠른 카테고리 추가 버튼 클릭');
                    this.openCategoryModalFromProduct();
                });
                console.log('✅ 빠른 카테고리 추가 버튼 이벤트 리스너 추가 완료');
            }
            
        } catch (error) {
            console.error('❌ 상품 모달 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 상품 코드 미리보기 이벤트 설정
     */
    setupProductCodePreview() {
        const nameInput = document.getElementById('product-form-name');
        if (nameInput) {
            // 상품명 입력 시 상품 코드 미리보기 표시
            nameInput.addEventListener('input', async () => {
                if (nameInput.value.trim().length > 0) {
                    const productCode = await this.generateProductCode();
                    this.showProductCodePreview(productCode);
                } else {
                    this.hideProductCodePreview();
                }
            });
            
            console.log('✅ 상품 코드 미리보기 이벤트 설정 완료');
        }
    }

    /**
     * 수익률 계산 및 표시
     */
    calculateModalProfitMargin() {
        try {
            console.log('💰 수익률 계산 시작');
            
            const priceInput = document.getElementById('product-form-price');
            const costInput = document.getElementById('product-form-wholesale-price');
            const marginDisplay = document.getElementById('modal-profit-margin');
            
            if (!priceInput || !costInput || !marginDisplay) {
                console.warn('⚠️ 수익률 계산 필드를 찾을 수 없습니다');
                return;
            }
            
            const price = parseFloat(priceInput.value) || 0;
            const cost = parseFloat(costInput.value) || 0;
            
            if (price > 0 && cost > 0) {
                const profit = price - cost;
                const margin = (profit / price) * 100;
                
                marginDisplay.innerHTML = `
                    <span class="text-green-600 font-medium">
                        💰 수익: ${profit.toLocaleString()}원 (${margin.toFixed(1)}%)
                    </span>
                `;
                console.log('✅ 수익률 계산 완료:', { profit, margin });
            } else if (price > 0) {
                marginDisplay.innerHTML = `
                    <span class="text-gray-500">
                        💰 매입가를 입력하면 수익률을 계산합니다
                    </span>
                `;
            } else {
                marginDisplay.innerHTML = '';
            }
        } catch (error) {
            console.error('❌ 수익률 계산 실패:', error);
        }
    }

    /**
     * 사이즈 선택 변경 처리
     */
    handleSizeChange() {
        try {
            console.log('📏 사이즈 선택 변경 처리');
            
            const sizeSelect = document.getElementById('product-form-size-select');
            const sizeCustom = document.getElementById('product-form-size-custom');
            
            console.log('🔍 sizeSelect 요소:', sizeSelect);
            console.log('🔍 sizeCustom 요소:', sizeCustom);
            console.log('🔍 선택된 값:', sizeSelect?.value);
            
            if (!sizeSelect || !sizeCustom) {
                console.warn('⚠️ 사이즈 필드를 찾을 수 없습니다');
                return;
            }
            
            if (sizeSelect.value === 'custom') {
                console.log('🔧 직접 기입 모드 활성화 중...');
                sizeCustom.classList.remove('hidden');
                sizeCustom.focus();
                console.log('✅ 직접 기입 모드 활성화 완료');
            } else {
                console.log('🔧 직접 기입 모드 비활성화 중...');
                sizeCustom.classList.add('hidden');
                sizeCustom.value = '';
                console.log('✅ 직접 기입 모드 비활성화 완료');
            }
        } catch (error) {
            console.error('❌ 사이즈 변경 처리 실패:', error);
        }
    }

    /**
     * 카테고리 옵션 초기화
     */
    async initCategoryOptions() {
        try {
            console.log('🔍 카테고리 옵션 초기화 시작...');
            
            const categorySelect = document.getElementById('product-form-category');
            if (!categorySelect) {
                console.warn('⚠️ 카테고리 선택 필드를 찾을 수 없습니다');
                return;
            }

            // 기존 옵션 제거 (첫 번째와 마지막 옵션 제외)
            while (categorySelect.children.length > 2) {
                categorySelect.removeChild(categorySelect.children[1]);
            }

            if (window.categoryDataManager) {
                console.log('✅ categoryDataManager 발견');
                
                // 항상 최신 카테고리 데이터를 로드
                console.log('📥 카테고리 데이터 로드 중...');
                try {
                    await window.categoryDataManager.loadCategories();
                    console.log('✅ 카테고리 데이터 로드 완료');
                } catch (error) {
                    console.error('❌ 카테고리 데이터 로드 실패:', error);
                    return;
                }
                
                const categories = window.categoryDataManager.getAllCategories();
                console.log('📊 로드된 카테고리 수:', categories.length);
                console.log('📊 카테고리 목록:', categories.map(c => c.name));
                
                if (categories.length === 0) {
                    console.warn('⚠️ 로드된 카테고리가 없습니다');
                    return;
                }
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    option.className = `bg-${category.color}-100 text-${category.color}-800`;
                    categorySelect.insertBefore(option, categorySelect.lastElementChild);
                    console.log(`✅ 카테고리 옵션 추가: ${category.name}`);
                });
                
                console.log('✅ 카테고리 옵션 초기화 완료');
            } else {
                console.warn('⚠️ categoryDataManager를 찾을 수 없습니다');
                console.log('🔍 사용 가능한 전역 객체들:', Object.keys(window).filter(key => key.includes('category') || key.includes('Category')));
                
                // categoryDataManager가 없으면 직접 Supabase에서 카테고리 로드
                if (window.supabaseClient) {
                    console.log('🔄 Supabase에서 직접 카테고리 로드 시도...');
                    try {
                        const { data, error } = await window.supabaseClient
                            .from('farm_categories')
                            .select('*')
                            .order('created_at', { ascending: false });
                        
                        if (error) {
                            console.error('❌ Supabase 카테고리 로드 실패:', error);
                            return;
                        }
                        
                        console.log('📊 Supabase에서 로드된 카테고리 수:', data.length);
                        
                        data.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category.name;
                            option.textContent = category.name;
                            option.className = `bg-${category.color}-100 text-${category.color}-800`;
                            categorySelect.insertBefore(option, categorySelect.lastElementChild);
                            console.log(`✅ 카테고리 옵션 추가: ${category.name}`);
                        });
                        
                        console.log('✅ Supabase 직접 로드 완료');
                    } catch (error) {
                        console.error('❌ Supabase 직접 로드 실패:', error);
                    }
                } else {
                    console.error('❌ Supabase 클라이언트도 찾을 수 없습니다');
                }
            }
        } catch (error) {
            console.error('❌ 카테고리 옵션 초기화 실패:', error);
        }
    }

    /**
     * 상품 모달 닫기
     */
    closeProductModal() {
        try {
            console.log('📦 상품 모달 닫기');
            
            const modal = document.getElementById('product-modal');
            if (modal) {
                modal.classList.add('hidden');

            // 폼 초기화
                this.resetProductForm();
                
                console.log('✅ 상품 모달 닫기 완료');
            } else {
                console.warn('⚠️ 상품 모달을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 상품 모달 닫기 실패:', error);
        }
    }

    /**
     * 상품 폼 초기화
     */
    resetProductForm() {
        try {
            console.log('🔄 상품 폼 초기화');
            
            // 폼 필드들 초기화 (안전하게 처리)
            const formFields = [
                'product-form-name',
                'product-form-category', 
                'product-form-price',
                'product-form-wholesale-price',
                'product-form-stock',
                'product-form-size-select',
                'product-form-size-custom',
                'product-form-shipping',
                'product-form-description',
                'product-form-image',
                'product-form-id',
                'product-form-created-at'
            ];
            
            formFields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) {
                    if (fieldId === 'product-form-shipping') {
                        // 배송옵션은 일반배송을 기본값으로 설정
                        element.value = '일반배송';
                    } else {
                        element.value = '';
                    }
                } else {
                    console.warn(`⚠️ 폼 필드를 찾을 수 없습니다: ${fieldId}`);
                }
            });
            
            // 사이즈 필드 초기화
            const sizeSelectElement = document.getElementById('product-form-size-select');
            const sizeCustomElement = document.getElementById('product-form-size-custom');
            
            if (sizeSelectElement) {
                sizeSelectElement.value = '';
            } else {
                console.warn('⚠️ product-form-size-select 요소를 찾을 수 없습니다.');
            }
            
            if (sizeCustomElement) {
                sizeCustomElement.classList.add('hidden');
                sizeCustomElement.value = '';
            } else {
                console.warn('⚠️ product-form-size-custom 요소를 찾을 수 없습니다.');
            }
            
            console.log('✅ 상품 폼 초기화 완료');
        } catch (error) {
            console.error('❌ 상품 폼 초기화 실패:', error);
        }
    }

    /**
     * 상품 데이터 로드 (수정 모드용)
     */
    async loadProductData(productId) {
        try {
            console.log('📦 상품 데이터 로드 시작:', productId);
            const productDataManager = getProductDataManager();
            console.log('🔍 productDataManager 존재 여부:', typeof productDataManager);
            
            if (!productDataManager) {
                console.error('❌ productDataManager를 찾을 수 없습니다.');
                alert('상품 데이터 관리자를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
                return;
            }
            
            if (!productDataManager.getProductById) {
                console.error('❌ getProductById 함수를 찾을 수 없습니다.');
                alert('상품 조회 함수를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
                return;
            }
            
            // 상품 데이터가 로드되지 않았다면 먼저 로드
            if (!productDataManager.farm_products || productDataManager.farm_products.length === 0) {
                console.log('🔄 상품 데이터가 없어서 먼저 로드합니다...');
                await productDataManager.loadProducts();
            }
            
            const product = productDataManager.getProductById(productId);
            console.log('🔍 찾은 상품:', product);
            console.log('🔍 상품 데이터 타입:', typeof product);
            console.log('🔍 상품 데이터 키들:', product ? Object.keys(product) : '없음');
            
            if (!product) {
                console.error('❌ 상품을 찾을 수 없습니다:', productId);
                console.log('🔍 전체 상품 목록:', productDataManager.getAllProducts());
                console.log('🔍 상품 목록 길이:', productDataManager.getAllProducts().length);
                alert('상품을 찾을 수 없습니다. 상품 ID: ' + productId);
                return;
            }
            
            console.log('📝 상품 폼 채우기 시작');
            
            // 먼저 카테고리 옵션 초기화
            console.log('🔍 카테고리 옵션 초기화 중...');
            await this.initCategoryOptions();
            console.log('✅ 카테고리 옵션 초기화 완료');
            
            // 그 다음 폼 채우기
            console.log('🔄 상품 폼 채우기 시작...');
            this.fillProductForm(product);
            
            console.log('✅ 상품 데이터 로드 완료');
            
        } catch (error) {
            console.error('❌ 상품 데이터 로드 실패:', error);
            alert('상품 데이터를 로드할 수 없습니다. 오류: ' + error.message);
        }
    }

    /**
     * 상품 수정을 위한 폼 채우기
     */
    fillProductForm(product) {
        try {
            console.log('📝 상품 폼 채우기 시작:', product);
            console.log('🔍 상품 데이터 구조:', JSON.stringify(product, null, 2));
            
            if (!product) {
                console.error('❌ 상품 데이터가 없습니다.');
                return;
            }
            
            // DOM이 완전히 로드될 때까지 잠시 대기
            setTimeout(() => {
                console.log('🔄 DOM 로드 완료 후 폼 채우기 시작');
                
                // 폼 필드 매핑
                const fieldMappings = [
                    { id: 'product-form-id', value: product.id || '' },
                    { id: 'product-form-created-at', value: product.created_at || '' },
                    { id: 'product-form-name', value: product.name || '' },
                    { id: 'product-form-category', value: product.category || '' },
                    { id: 'product-form-price', value: product.price || '' },
                    { id: 'product-form-wholesale-price', value: product.cost || '' },
                    { id: 'product-form-stock', value: product.stock || '' },
                    { id: 'product-form-shipping', value: product.shipping_option || product.shipping || '' },
                    { id: 'product-form-description', value: product.description || '' },
                    { id: 'product-form-image', value: product.image_url || '' }
                ];
                
                // 사이즈 처리 (기존 값이 표준 사이즈인지 확인)
                const standardSizes = ['SX', 'S', 'M', 'L', 'XL'];
                const productSize = product.size || '';
                const sizeSelect = document.getElementById('product-form-size-select');
                const sizeCustom = document.getElementById('product-form-size-custom');
                
                console.log('🔍 사이즈 처리 시작:', productSize);
                console.log('🔍 sizeSelect 존재:', !!sizeSelect);
                console.log('🔍 sizeCustom 존재:', !!sizeCustom);
                
                if (sizeSelect && sizeCustom) {
                    if (standardSizes.includes(productSize)) {
                        // 표준 사이즈인 경우
                        sizeSelect.value = productSize;
                        sizeCustom.classList.add('hidden');
                        console.log(`✅ 표준 사이즈 설정: ${productSize}`);
                    } else if (productSize) {
                        // 직접 입력된 사이즈인 경우
                        sizeSelect.value = 'custom';
                        sizeCustom.value = productSize;
                        sizeCustom.classList.remove('hidden');
                        console.log(`✅ 커스텀 사이즈 설정: ${productSize}`);
                    } else {
                        // 사이즈가 없는 경우
                        sizeSelect.value = '';
                        sizeCustom.classList.add('hidden');
                        console.log('✅ 사이즈 없음');
                    }
                } else {
                    console.warn('⚠️ 사이즈 관련 폼 요소를 찾을 수 없습니다.');
                    console.log('🔍 DOM에서 사이즈 요소 검색:');
                    console.log('  - product-form-size-select:', document.getElementById('product-form-size-select'));
                    console.log('  - product-form-size-custom:', document.getElementById('product-form-size-custom'));
                }
                
                // 폼 필드 채우기
                let successCount = 0;
                let failCount = 0;
                
                console.log('🔄 폼 필드 채우기 시작...');
                fieldMappings.forEach(mapping => {
                    const element = document.getElementById(mapping.id);
                    console.log(`🔍 ${mapping.id} 검색 결과:`, element);
                    
                    if (element) {
                        element.value = mapping.value;
                        successCount++;
                        console.log(`✅ ${mapping.id} 설정 완료: ${mapping.value}`);
                        
                        // 값이 제대로 설정되었는지 확인
                        if (element.value !== mapping.value) {
                            console.warn(`⚠️ ${mapping.id} 값 설정 실패. 예상: ${mapping.value}, 실제: ${element.value}`);
                        }
                    } else {
                        console.warn(`⚠️ 폼 필드를 찾을 수 없습니다: ${mapping.id}`);
                        failCount++;
                    }
                });
                
                console.log(`✅ 상품 폼 채우기 완료 (성공: ${successCount}, 실패: ${failCount})`);
                
                if (failCount > 0) {
                    console.warn(`⚠️ ${failCount}개의 폼 필드를 찾을 수 없습니다.`);
                    console.log('🔍 사용 가능한 폼 필드들:');
                    const allInputs = document.querySelectorAll('#product-form input, #product-form select, #product-form textarea');
                    allInputs.forEach(input => {
                        console.log(`  - ${input.id}: ${input.type || input.tagName}`);
                    });
                }
                
                // 폼이 제대로 채워졌는지 최종 확인
                console.log('🔍 최종 폼 상태 확인:');
                const nameField = document.getElementById('product-form-name');
                const priceField = document.getElementById('product-form-price');
                const categoryField = document.getElementById('product-form-category');
                
                console.log(`  - 상품명: ${nameField ? nameField.value : '없음'}`);
                console.log(`  - 가격: ${priceField ? priceField.value : '없음'}`);
                console.log(`  - 카테고리: ${categoryField ? categoryField.value : '없음'}`);
                
            }, 200); // DOM 로드 대기 시간 증가
            
        } catch (error) {
            console.error('❌ 상품 폼 채우기 실패:', error);
            alert('상품 폼을 채우는 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 상품 저장
     */
    async saveProduct() {
        try {
            console.log('💾 상품 저장 시작');
            const productDataManager = getProductDataManager();
            console.log('🔍 productDataManager 존재 여부:', typeof productDataManager);
            console.log('🔍 productDataManager.addProduct 존재 여부:', typeof productDataManager?.addProduct);
            
            // 폼 검증
            const validationErrors = this.validateProductForm();
            if (validationErrors.length > 0) {
                console.error('❌ 폼 검증 실패:', validationErrors);
                alert('입력 오류:\n' + validationErrors.join('\n'));
                return false;
            }
            
            // 폼 데이터 수집
            const productData = this.collectProductFormData();
            console.log('📋 수집된 상품 데이터:', productData);
            
            if (!productData) {
                console.error('❌ 상품 데이터 수집 실패');
                return false;
            }
            
            // 중복 상품명 검증
            if (productDataManager) {
                const existingProducts = productDataManager.getAllProducts();
                const duplicateProduct = existingProducts.find(p => 
                    p.name.toLowerCase() === productData.name.toLowerCase() && 
                    p.id !== productData.id
                );
                
                if (duplicateProduct) {
                    console.log('⚠️ 중복된 상품명 발견:', duplicateProduct);
                    alert(`이미 등록된 상품명입니다.\n\n기존 상품: ${duplicateProduct.name}\n카테고리: ${duplicateProduct.category}\n가격: ${duplicateProduct.price.toLocaleString()}원`);
                    return false;
                }
            }
            
            // productDataManager를 통해 저장
            if (productDataManager) {
                console.log('✅ productDataManager 사용');
                console.log('🔄 addProduct 호출 시작...');
                await productDataManager.addProduct(productData);
                console.log('✅ 상품 저장 완료');
                
                // 모달 닫기
                this.closeProductModal();
                
                // 상품 목록 새로고침
                console.log('🔄 상품 목록 새로고침 시작...');
                if (window.renderProductsTable) {
                    console.log('✅ renderProductsTable 함수 호출');
                    window.renderProductsTable();
                } else {
                    console.error('❌ renderProductsTable 함수를 찾을 수 없습니다');
                }
                
                alert('상품이 성공적으로 저장되었습니다!');
                return true;
            } else {
                console.error('❌ productDataManager를 찾을 수 없습니다');
                return false;
            }
        } catch (error) {
            console.error('❌ 상품 저장 실패:', error);
            alert('상품 저장에 실패했습니다: ' + error.message);
            return false;
        }
    }

    /**
     * 폼 데이터 수집
     */
    collectProductFormData() {
        try {
            console.log('📋 상품 폼 데이터 수집');
            
            // 안전한 폼 데이터 수집 함수
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
            
            // 상품 코드 생성
            const productCode = this.generateProductCode();
            
            // 사이즈 처리 (선택된 값 또는 직접 입력값)
            const sizeSelect = getFormValue('product-form-size-select');
            const sizeCustom = getFormValue('product-form-size-custom');
            const size = sizeSelect === 'custom' ? sizeCustom : sizeSelect;
            
            const productData = {
                id: getFormValue('product-form-id') || null,
                product_code: productCode,
                name: getFormValue('product-form-name'),
                category: getFormValue('product-form-category'),
                price: getFormNumber('product-form-price', 0),
                cost: getFormNumber('product-form-wholesale-price', 0),
                stock: getFormNumber('product-form-stock', 0),
                size: size,
                shipping_option: getFormValue('product-form-shipping'),
                description: getFormValue('product-form-description'),
                image_url: getFormValue('product-form-image'),
                created_at: getFormValue('product-form-created-at') || new Date().toISOString()
            };
            
            console.log('✅ 상품 데이터 수집 완료:', productData);
            return productData;
        } catch (error) {
            console.error('❌ 상품 데이터 수집 실패:', error);
                return null;
            }
    }

    /**
     * 상품 코드 자동 생성 (P001, P002, P003...)
     */
    async generateProductCode() {
        try {
            console.log('🔢 상품 코드 생성 시작');
            
            // 기존 상품들의 코드를 가져와서 다음 번호 계산
            const productDataManager = getProductDataManager();
            if (productDataManager) {
                const products = productDataManager.getAllProducts();
                console.log('📊 기존 상품 수:', products.length);
                console.log('📊 상품 코드들:', products.map(p => ({ id: p.id, product_code: p.product_code, type: typeof p.product_code })));
                
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
                
                console.log('✅ 상품 코드 생성 완료:', productCode, '(기존 코드 수:', existingCodes.length, ')');
                return productCode;
            } else {
                // productDataManager가 없으면 기본값
                console.warn('⚠️ productDataManager를 찾을 수 없습니다. 기본 코드 사용');
                return 'P001';
            }
        } catch (error) {
            console.error('❌ 상품 코드 생성 실패:', error);
            return 'P001'; // 기본값
        }
    }

    /**
     * 상품 코드 미리보기 표시
     */
    showProductCodePreview(productCode) {
        const codeDisplay = document.getElementById('product-code-display');
        const codeValue = document.getElementById('product-code-value');
        
        if (codeDisplay && codeValue) {
            codeValue.textContent = productCode;
            codeDisplay.classList.remove('hidden');
            console.log('✅ 상품 코드 미리보기 표시:', productCode);
        }
    }

    /**
     * 상품 코드 미리보기 숨김
     */
    hideProductCodePreview() {
        const codeDisplay = document.getElementById('product-code-display');
        if (codeDisplay) {
            codeDisplay.classList.add('hidden');
            console.log('✅ 상품 코드 미리보기 숨김');
        }
    }

    /**
     * 상품 필터 기능 초기화
     */
    initProductFilters() {
        try {
            console.log('🔍 상품 필터 기능 초기화 중...');
            
            // 검색 필드
            const searchInput = document.getElementById('product-management-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    this.debounceSearch();
                });
            }
            
            // 카테고리 필터
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
                this.loadCategoryFilterOptions();
            }
            
            // 재고 상태 필터
            const stockFilter = document.getElementById('product-stock-filter');
            if (stockFilter) {
                stockFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
            
            // 가격 범위 필터
            const priceFilter = document.getElementById('product-price-filter');
            if (priceFilter) {
                priceFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
            
            // 정렬 필터
            const sortFilter = document.getElementById('product-sort');
            if (sortFilter) {
                sortFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
            
            // 필터 적용 버튼
            const filterBtn = document.getElementById('product-filter-btn');
            if (filterBtn) {
                filterBtn.addEventListener('click', () => {
                    this.applyFilters();
                });
            }
            
            // 초기화 버튼
            const resetBtn = document.getElementById('reset-product-search');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetFilters();
                });
            }

            // 페이지당 표시 수 선택
            const productPageSizeEl = document.getElementById('product-page-size');
            if (productPageSizeEl && !productPageSizeEl._pageSizeListened) {
                productPageSizeEl._pageSizeListened = true;
                productPageSizeEl.addEventListener('change', () => {
                    this.renderProductsTable();
                });
            }

            console.log('✅ 상품 필터 기능 초기화 완료');
        } catch (error) {
            console.error('❌ 상품 필터 기능 초기화 실패:', error);
        }
    }

    /**
     * 카테고리 필터 옵션 로드
     */
    loadCategoryFilterOptions() {
        try {
            const categoryFilter = document.getElementById('category-filter');
            if (!categoryFilter) return;
            
            // 기존 옵션 제거 (첫 번째 옵션 제외)
            while (categoryFilter.children.length > 1) {
                categoryFilter.removeChild(categoryFilter.lastChild);
            }
            
            // 카테고리 데이터 로드
            const productDataManager = getProductDataManager();
            if (productDataManager) {
                const categories = productDataManager.getAllCategories();
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
                console.log('✅ 카테고리 필터 옵션 로드 완료');
            }
        } catch (error) {
            console.error('❌ 카테고리 필터 옵션 로드 실패:', error);
        }
    }

    /**
     * 검색 디바운스
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
        try {
            console.log('🔍 상품 필터 적용 중...');
            
            const productDataManager = getProductDataManager();
            if (!productDataManager) {
                console.warn('⚠️ productDataManager가 없습니다');
                return;
            }

            // 필터 값 수집
            const searchTerm = document.getElementById('product-management-search')?.value.toLowerCase() || '';
            const categoryFilter = document.getElementById('category-filter')?.value || '';
            const stockFilter = document.getElementById('product-stock-filter')?.value || '';
            const priceFilter = document.getElementById('product-price-filter')?.value || '';
            const sortFilter = document.getElementById('product-sort')?.value || 'newest';
            
            // 모든 상품 가져오기
            let filteredProducts = [...productDataManager.getAllProducts()];
            
            // 검색 필터
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm))
                );
            }
            
            // 카테고리 필터
            if (categoryFilter) {
                filteredProducts = filteredProducts.filter(product => 
                    product.category === categoryFilter
                );
            }
            
            // 재고 상태 필터
            if (stockFilter) {
                filteredProducts = filteredProducts.filter(product => {
                    const stock = product.stock || 0;
                    switch (stockFilter) {
                        case 'in-stock':
                            return stock > 10;
                        case 'low-stock':
                            return stock > 0 && stock <= 10;
                        case 'out-of-stock':
                            return stock === 0;
                        default:
                            return true;
                    }
                });
            }
            
            // 가격 범위 필터
            if (priceFilter) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = product.price || 0;
                    switch (priceFilter) {
                        case '0-10000':
                            return price <= 10000;
                        case '10000-30000':
                            return price > 10000 && price <= 30000;
                        case '30000-50000':
                            return price > 30000 && price <= 50000;
                        case '50000+':
                            return price > 50000;
                        default:
                            return true;
                    }
                });
            }
            
            // 정렬
            filteredProducts = this.sortProducts(filteredProducts, sortFilter);
            
            // 테이블 렌더링
            this.renderFilteredProductsTable(filteredProducts);
            
            console.log(`✅ 필터 적용 완료: ${filteredProducts.length}개 상품`);
        } catch (error) {
            console.error('❌ 필터 적용 실패:', error);
        }
    }

    /**
     * 상품 정렬
     */
    sortProducts(products, sortBy) {
        try {
            return products.sort((a, b) => {
                switch (sortBy) {
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    case 'name_desc':
                        return b.name.localeCompare(a.name);
                    case 'price_asc':
                        return (a.price || 0) - (b.price || 0);
                    case 'price_desc':
                        return (b.price || 0) - (a.price || 0);
                    case 'newest':
                    default:
                        return new Date(b.created_at) - new Date(a.created_at);
                }
            });
        } catch (error) {
            console.error('❌ 상품 정렬 실패:', error);
            return products;
        }
    }

    /**
     * 필터된 상품 테이블 렌더링
     */
    renderFilteredProductsTable(products) {
        try {
            const tbody = document.getElementById('products-table-body');
            if (!tbody) return;
            
            if (products.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center py-8 text-gray-500">
                            <i class="fas fa-search text-4xl mb-2"></i><br>
                            검색 결과가 없습니다
                        </td>
                    </tr>
                `;
                return;
            }
            
            // 상품 목록 렌더링
            tbody.innerHTML = products.map(product => `
                <tr class="${COMMON_STYLES.table.row}" data-product-id="${product.id}">
                    ${PRODUCT_TABLE_COLUMNS.map(column => {
                        if (column.type === 'checkbox') {
                            return `
                                <td class="${COMMON_STYLES.table.cellCenter}">
                                    <input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500" data-product-id="${product.id}">
                                </td>
                            `;
                        }
                        
                        if (column.type === 'actions') {
                            return `
                                <td class="${COMMON_STYLES.table.cellCenter}">
                                    <button data-action="edit" data-product-id="${product.id}" class="${COMMON_STYLES.button.edit}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button data-action="delete" data-product-id="${product.id}" class="${COMMON_STYLES.button.delete}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            `;
                        }
                        
                        const value = product[column.key];
                        let formattedValue = value || '-';
                        
                        // 배송옵션 값 변환
                        if (column.key === 'shipping' && value) {
                            const shippingMap = {
                                'always_free': '무료배송',
                                'normal': '일반배송',
                                'included': '배송비포함',
                                'direct': '직접배송'
                            };
                            formattedValue = shippingMap[value] || value;
                        } else if (column.format === 'currency' && value) {
                            formattedValue = `${value.toLocaleString()}원`;
                        } else if (column.format === 'number' && value) {
                            formattedValue = `${value}개`;
                        }
                        
                        return `<td class="${COMMON_STYLES.table.cell}">${formattedValue}</td>`;
                    }).join('')}
                </tr>
            `).join('');
            
            // 이벤트 리스너 추가
            this.attachProductTableEventListeners();
            
        } catch (error) {
            console.error('❌ 필터된 상품 테이블 렌더링 실패:', error);
        }
    }

    /**
     * 필터 초기화
     */
    resetFilters() {
        try {
            console.log('🔄 필터 초기화 중...');
            
            // 모든 필터 필드 초기화
            const searchInput = document.getElementById('product-management-search');
            const categoryFilter = document.getElementById('category-filter');
            const stockFilter = document.getElementById('product-stock-filter');
            const priceFilter = document.getElementById('product-price-filter');
            const sortFilter = document.getElementById('product-sort');
            
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (stockFilter) stockFilter.value = '';
            if (priceFilter) priceFilter.value = '';
            if (sortFilter) sortFilter.value = 'newest';
            
            // 전체 상품 테이블 렌더링
            this.renderProductsTable();
            
            console.log('✅ 필터 초기화 완료');
        } catch (error) {
            console.error('❌ 필터 초기화 실패:', error);
        }
    }

    /**
     * 상품 테이블 렌더링
     */
    renderProductsTable() {
    try {
        console.log('🎨 상품 테이블 렌더링 시작...');
        
        const tbody = document.getElementById('products-table-body');
        if (!tbody) {
            console.error('❌ 상품 테이블 body를 찾을 수 없습니다');
            return;
        }
        
        // 상품 데이터 로드
        const productDataManager = getProductDataManager();
        if (productDataManager) {
            const products = productDataManager.getAllProducts();
            console.log('📊 로드된 상품 수:', products.length);
                console.log('📋 상품 데이터:', products);

            // 페이지 크기 적용
            const pageSizeEl = document.getElementById('product-page-size');
            const pageSize = pageSizeEl ? parseInt(pageSizeEl.value) : 20;
            const pagedProducts = pageSize === 0 ? products : products.slice(0, pageSize);

            // 하단 카운트 업데이트
            const productTotalEl = document.getElementById('product-status-total');
            const productCountEl = document.getElementById('product-list-count');
            if (productTotalEl) productTotalEl.textContent = String(products.length);
            if (productCountEl) productCountEl.textContent = pageSize === 0 || pagedProducts.length === products.length
                ? `${products.length}개 표시`
                : `${pagedProducts.length} / ${products.length}개 표시`;

            if (products.length === 0) {
                tbody.innerHTML = `
                    <tr>
                            <td colspan="9" class="text-center py-8 text-gray-500">
                            <i class="fas fa-box text-4xl mb-2"></i><br>
                            등록된 상품이 없습니다
                        </td>
                    </tr>
                `;
                return;
            }

                // 상품 목록 렌더링 (컬럼 정의 + 공통 스타일 사용)
                console.log('🎨 상품 테이블 HTML 생성 중...');
            tbody.innerHTML = pagedProducts.map(product => `
                    <tr class="${COMMON_STYLES.table.row}" data-product-id="${product.id}">
                        ${PRODUCT_TABLE_COLUMNS.map(column => {
                            if (column.type === 'checkbox') {
                                return `
                                    <td class="${COMMON_STYLES.table.cellCenter}">
                                        <input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500" data-product-id="${product.id}">
                                    </td>
                                `;
                            }
                            
                            if (column.type === 'actions') {
                                return `
                                    <td class="${COMMON_STYLES.table.cellCenter}">
                                        <button data-action="edit" data-product-id="${product.id}" class="${COMMON_STYLES.button.edit}">
                            <i class="fas fa-edit"></i>
                        </button>
                                        <button data-action="delete" data-product-id="${product.id}" class="${COMMON_STYLES.button.delete}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                                `;
                            }
                            
                            
                            const value = product[column.key];
                            let formattedValue = value || '-';
                            
                            // Promise 객체 처리
                            if (value && typeof value === 'object' && value.constructor === Promise) {
                                formattedValue = '로딩중...';
                            } else if (value && typeof value === 'object' && value.toString && value.toString().includes('[object Promise]')) {
                                formattedValue = 'P' + Date.now().toString().slice(-6);
                            } else if (column.key === 'shipping' && value) {
                                // 배송옵션 값 변환
                                const shippingMap = {
                                    'always_free': '무료배송',
                                    'normal': '일반배송',
                                    'included': '배송비포함',
                                    'direct': '직접배송'
                                };
                                formattedValue = shippingMap[value] || value;
                            } else if (column.format === 'currency' && value) {
                                formattedValue = `${value.toLocaleString()}원`;
                            } else if (column.format === 'number' && value) {
                                formattedValue = `${value}개`;
                            } else if (column.format === 'percentage' && value) {
                                formattedValue = `${value}%`;
                            } else if (column.format === 'date' && value) {
                                formattedValue = new Date(value).toLocaleDateString();
                            }
                            
                            return `<td class="${COMMON_STYLES.table.cell}">${formattedValue}</td>`;
                        }).join('')}
                </tr>
            `).join('');
            
            console.log('✅ 상품 테이블 렌더링 완료');
                
                // 이벤트 리스너 추가
                console.log('🔗 상품 테이블 이벤트 리스너 추가 중...');
                this.attachProductTableEventListeners();
                console.log('✅ 상품 테이블 이벤트 리스너 추가 완료');
                
                // 필터 기능 초기화
                this.initProductFilters();
        } else {
            console.error('❌ productDataManager를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 상품 테이블 렌더링 실패:', error);
    }
    }

    /**
     * 상품 테이블 이벤트 리스너 추가
     */
    attachProductTableEventListeners() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) {
            console.error('❌ products-table-body를 찾을 수 없습니다');
            return;
        }
        
        console.log('🔗 상품 테이블 이벤트 리스너 추가 중...');
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        tbody.removeEventListener('click', this.handleTableClick);
        
        // 이벤트 위임을 사용하여 동적으로 생성된 버튼들에 이벤트 리스너 추가
        this.handleTableClick = (e) => {
            console.log('🖱️ 테이블 클릭 이벤트:', e.target);
            console.log('🔍 클릭된 요소:', e.target.tagName, e.target.className);
            
            const button = e.target.closest('button[data-action]');
            console.log('🔍 찾은 버튼:', button);
            
            if (!button) {
                console.log('❌ data-action 속성이 있는 버튼을 찾을 수 없습니다');
                return;
            }
            
            const action = button.dataset.action;
            const productId = button.dataset.productId;
            console.log('🎯 액션:', action, '상품ID:', productId);
            
            if (action === 'edit') {
                console.log('✏️ 상품 수정 시작:', productId);
                e.preventDefault();
                e.stopPropagation();
                this.openProductModal(productId);
            } else if (action === 'delete') {
                console.log('🗑️ 상품 삭제 시작:', productId);
                e.preventDefault();
                e.stopPropagation();
                this.deleteProduct(productId);
            } else {
                console.log('❓ 알 수 없는 액션:', action);
            }
        };
        
        tbody.addEventListener('click', this.handleTableClick);
        console.log('✅ 상품 테이블 이벤트 리스너 추가 완료');
    }

    /**
     * 인라인 편집 설정
     */
    setupInlineEditing() {
        try {
            console.log('✏️ 인라인 편집 설정 중...');
            
            // 편집 가능한 필드 클릭 이벤트
            document.querySelectorAll('.inline-edit-container').forEach(container => {
                const display = container.querySelector('.inline-edit-display');
                const input = container.querySelector('.inline-edit-input');
                
                if (display && input) {
                    display.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.startInlineEdit(container);
                    });
                    
                    // 입력 필드 이벤트
                    input.addEventListener('blur', (e) => {
                        this.saveInlineEdit(container);
                    });
                    
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            this.saveInlineEdit(container);
                        } else if (e.key === 'Escape') {
                            this.cancelInlineEdit(container);
                        }
                    });
                }
            });
            
            console.log('✅ 인라인 편집 설정 완료');
        } catch (error) {
            console.error('❌ 인라인 편집 설정 실패:', error);
        }
    }

    /**
     * 인라인 편집 시작
     */
    startInlineEdit(container) {
        try {
            const display = container.querySelector('.inline-edit-display');
            const input = container.querySelector('.inline-edit-input');
            
            if (display && input) {
                display.classList.add('hidden');
                input.classList.remove('hidden');
                input.focus();
                input.select();
                console.log('✏️ 인라인 편집 시작');
            }
        } catch (error) {
            console.error('❌ 인라인 편집 시작 실패:', error);
        }
    }

    /**
     * 인라인 편집 저장
     */
    async saveInlineEdit(container) {
        try {
            const productId = container.dataset.productId;
            const field = container.dataset.field;
            const input = container.querySelector('.inline-edit-input');
            const display = container.querySelector('.inline-edit-display');
            
            if (!productId || !field || !input || !display) {
                console.warn('⚠️ 인라인 편집 저장 실패: 필수 요소 누락');
                return;
            }
            
            const newValue = input.value.trim();
            const originalValue = input.dataset.original;
            
            // 값이 변경되지 않았으면 편집 모드 종료
            if (newValue === originalValue) {
                this.cancelInlineEdit(container);
                return;
            }
            
            // 상품 데이터 업데이트
            const productDataManager = getProductDataManager();
            if (productDataManager) {
                const product = productDataManager.getProductById(productId);
                if (product) {
                    // 필드별 데이터 타입 변환
                    let convertedValue = newValue;
                    if (field === 'price' || field === 'stock') {
                        convertedValue = parseInt(newValue) || 0;
                    }
                    
                    // 상품 데이터 업데이트
                    product[field] = convertedValue;
                    if (field === 'shipping') {
                        product.shipping_option = convertedValue;
                    }
                    
                    // Supabase에 저장
                    await productDataManager.saveProducts();
                    
                    // 화면 업데이트
                    this.updateInlineDisplay(container, field, convertedValue);
                    
                    console.log(`✅ ${field} 필드 업데이트 완료: ${convertedValue}`);
                }
            }
            
            // 편집 모드 종료
            this.cancelInlineEdit(container);
            
        } catch (error) {
            console.error('❌ 인라인 편집 저장 실패:', error);
            this.cancelInlineEdit(container);
        }
    }

    /**
     * 인라인 편집 취소
     */
    cancelInlineEdit(container) {
        try {
            const display = container.querySelector('.inline-edit-display');
            const input = container.querySelector('.inline-edit-input');
            
            if (display && input) {
                // 원래 값으로 복원
                input.value = input.dataset.original;
                
                // 편집 모드 종료
                display.classList.remove('hidden');
                input.classList.add('hidden');
                
                console.log('❌ 인라인 편집 취소');
            }
        } catch (error) {
            console.error('❌ 인라인 편집 취소 실패:', error);
        }
    }

    /**
     * 인라인 표시 업데이트
     */
    updateInlineDisplay(container, field, value) {
        try {
            const display = container.querySelector('.inline-edit-display');
            const input = container.querySelector('.inline-edit-input');
            
            if (display && input) {
                // 표시 값 포맷팅
                let formattedValue = value || '-';
                if (field === 'price' && value) {
                    formattedValue = `${value.toLocaleString()}원`;
                } else if (field === 'stock' && value) {
                    formattedValue = `${value}개`;
                }
                
                // 화면 업데이트
                display.textContent = formattedValue;
                input.value = value;
                input.dataset.original = value;
                
                console.log(`✅ ${field} 표시 업데이트: ${formattedValue}`);
            }
        } catch (error) {
            console.error('❌ 인라인 표시 업데이트 실패:', error);
        }
    }

    /**
     * 상품 삭제
     */
    async deleteProduct(productId) {
        try {
            console.log('🗑️ 상품 삭제 시작:', productId);
            
            if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
                return;
            }
            
            const productDataManager = getProductDataManager();
            if (productDataManager) {
                await productDataManager.deleteProduct(productId);
                console.log('✅ 상품 삭제 완료');
                
                // 테이블 새로고침
                this.renderProductsTable();
                
                // 성공 알림
                if (window.showToast) {
                    window.showToast('✅ 상품이 삭제되었습니다.', 3000);
                }
            } else {
                console.error('❌ productDataManager를 찾을 수 없습니다.');
                alert('상품 데이터 관리자를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 카테고리 이벤트 리스너 설정
     */
    setupCategoryEventListeners() {
        try {
            console.log('🎯 카테고리 이벤트 리스너 설정 시작');
            
            // 카테고리 선택 이벤트 리스너
            const categorySelect = document.getElementById('product-form-category');
            if (categorySelect) {
                console.log('🔍 카테고리 선택 필드 발견:', categorySelect);
                console.log('🔍 현재 옵션 수:', categorySelect.options.length);
                
                // 이미 리스너가 추가되었는지 확인
                if (!categorySelect.dataset.listenerAdded) {
                    // 핸들러 함수 정의
                    const handleCategoryChange = (e) => {
                        console.log('🔔 카테고리 선택 변경됨:', e.target.value);
                        if (e.target.value === '__ADD_NEW__') {
                            console.log('➕ 새 카테고리 추가 선택됨 - 모달 열기 시작');
                            e.preventDefault();
                            e.stopPropagation();
                            this.openCategoryModalFromProduct();
                        }
                    };
                    
                    categorySelect.addEventListener('change', handleCategoryChange);
                    categorySelect.dataset.listenerAdded = 'true';
                    
                    console.log('✅ 카테고리 선택 이벤트 리스너 추가 완료');
                } else {
                    console.log('ℹ️ 카테고리 선택 이벤트 리스너가 이미 등록되어 있습니다');
                }
            } else {
                console.error('❌ 카테고리 선택 필드를 찾을 수 없습니다!');
            }
            
            // 빠른 카테고리 추가 버튼 이벤트 리스너
            const quickAddCategoryBtn = document.getElementById('modal-quick-add-category-btn');
            if (quickAddCategoryBtn) {
                console.log('🔍 빠른 카테고리 추가 버튼 발견:', quickAddCategoryBtn);
                
                // 이미 리스너가 추가되었는지 확인
                if (!quickAddCategoryBtn.dataset.listenerAdded) {
                    // 핸들러 함수 정의
                    const handleQuickAdd = (e) => {
                        console.log('⚡ 빠른 카테고리 추가 버튼 클릭됨');
                        e.preventDefault();
                        e.stopPropagation();
                        this.openCategoryModalFromProduct();
                    };
                    
                    quickAddCategoryBtn.addEventListener('click', handleQuickAdd);
                    quickAddCategoryBtn.dataset.listenerAdded = 'true';
                    
                    console.log('✅ 빠른 카테고리 추가 버튼 이벤트 리스너 추가 완료');
                } else {
                    console.log('ℹ️ 빠른 카테고리 추가 버튼 이벤트 리스너가 이미 등록되어 있습니다');
                }
            } else {
                console.warn('⚠️ 빠른 카테고리 추가 버튼을 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 카테고리 이벤트 리스너 설정 실패:', error);
        }
    }

    /**
     * 상품 모달에서 카테고리 관리 모달 열기
     */
    async openCategoryModalFromProduct() {
        try {
            console.log('🏷️ 상품 모달에서 카테고리 관리 모달 열기');
            
            // 현재 선택 초기화 (다시 선택하지 않도록)
            const categorySelect = document.getElementById('product-form-category');
            if (categorySelect) {
                categorySelect.value = '';
            }
            
            // 상품 모달 숨기기
            const productModal = document.getElementById('product-modal');
            if (productModal) {
                productModal.classList.add('hidden');
                console.log('✅ 상품 모달 숨김');
            }

            // 카테고리 관리 모달 열기
            if (window.openCategoryModal) {
                await window.openCategoryModal();
                console.log('✅ 카테고리 관리 모달 열림');

                // 카테고리 모달이 닫힐 때를 감지하기 위한 옵저버 설정
                this.setupCategoryModalObserver();
            } else {
                console.error('❌ openCategoryModal 함수를 찾을 수 없습니다');
                // 상품 모달 다시 표시
                if (productModal) {
                    productModal.classList.remove('hidden');
                }
            }
            
        } catch (error) {
            console.error('❌ 카테고리 모달 열기 실패:', error);
            // 오류 발생 시 상품 모달 다시 표시
            const productModal = document.getElementById('product-modal');
            if (productModal) {
                productModal.classList.remove('hidden');
            }
        }
    }

    /**
     * 카테고리 모달 감시 설정 (닫힐 때 상품 모달 다시 열기)
     */
    setupCategoryModalObserver() {
        try {
            console.log('👀 카테고리 모달 감시 설정');
            
            const categoryModal = document.getElementById('category-modal');
            if (!categoryModal) {
                console.warn('⚠️ 카테고리 모달을 찾을 수 없습니다');
                return;
            }
            
            // MutationObserver로 모달의 display 속성 변화 감지
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                        const isHidden = categoryModal.style.display === 'none' || 
                                       categoryModal.classList.contains('hidden');
                        
                        if (isHidden) {
                            console.log('✅ 카테고리 모달이 닫혔습니다. 상품 모달 다시 열기');
                            
                            // 상품 모달 다시 표시
                            const productModal = document.getElementById('product-modal');
                            if (productModal) {
                                productModal.style.display = 'flex';
                                console.log('✅ 상품 모달 다시 표시됨');
                            }
                            
                            // 카테고리 드롭다운 업데이트
                            this.initCategoryOptions();
                            
                            // 옵저버 정리
                            observer.disconnect();
                            console.log('✅ 카테고리 모달 감시 종료');
                        }
                    }
                });
            });
            
            // 모달 감시 시작
            observer.observe(categoryModal, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            
            console.log('✅ 카테고리 모달 감시 시작');
            
        } catch (error) {
            console.error('❌ 카테고리 모달 감시 설정 실패:', error);
        }
    }
}

// ProductUI 인스턴스 생성
const productUI = new ProductUI();

// export 추가
export { productUI };

// renderProductsTable 함수 export
export function renderProductsTable() {
    productUI.renderProductsTable();
}

// 전역 함수로 등록
window.openProductModal = function(productId = null) {
    productUI.openProductModal(productId);
};

window.closeProductModal = function() {
    console.log('🔄 window.closeProductModal 호출됨');
    console.log('🔍 productUI 존재 여부:', typeof productUI);
    
    if (productUI && productUI.closeProductModal) {
        productUI.closeProductModal();
    } else {
        console.error('❌ productUI 또는 closeProductModal 함수가 없습니다');
    }
};

// 카테고리 드롭다운 업데이트 함수를 전역으로 등록
window.updateProductCategoryDropdown = async function() {
    if (window.productUI && window.productUI.initCategoryOptions) {
        console.log('🔄 상품 모달 카테고리 드롭다운 업데이트 중...');
        await window.productUI.initCategoryOptions();
        console.log('✅ 상품 모달 카테고리 드롭다운 업데이트 완료');
    } else {
        console.warn('⚠️ productUI.initCategoryOptions를 찾을 수 없습니다');
    }
};

window.saveProduct = function() {
    console.log('🔄 window.saveProduct 호출됨');
    console.log('🔍 productUI 존재 여부:', typeof productUI);
    console.log('🔍 productUI.saveProduct 존재 여부:', typeof productUI?.saveProduct);
    
    if (productUI && productUI.saveProduct) {
        console.log('✅ productUI.saveProduct 호출 시작');
        productUI.saveProduct().then(result => {
            console.log('✅ productUI.saveProduct 완료:', result);
        }).catch(error => {
            console.error('❌ productUI.saveProduct 실패:', error);
            alert('상품 저장 중 오류가 발생했습니다: ' + error.message);
        });
    } else {
        console.error('❌ productUI 또는 saveProduct 함수가 없습니다');
        console.log('productUI 객체:', productUI);
        alert('상품 저장 기능을 사용할 수 없습니다.');
    }
};

window.calculateModalProfitMargin = function() {
    if (productUI && productUI.calculateModalProfitMargin) {
        productUI.calculateModalProfitMargin();
    } else {
        console.error('❌ productUI 또는 calculateModalProfitMargin 함수가 없습니다');
    }
};

window.handleSizeChange = function() {
    if (productUI && productUI.handleSizeChange) {
        productUI.handleSizeChange();
    } else {
        console.error('❌ productUI 또는 handleSizeChange 함수가 없습니다');
    }
};

window.renderProductsTable = function() {
    productUI.renderProductsTable();
};