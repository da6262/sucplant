/**
 * 폼 관리 모듈
 * 경산다육식물농장 관리시스템
 */

class FormManager {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    /**
     * 폼 매니저 초기화
     */
    init() {
        console.log('🔄 Form Manager 초기화 시작...');
        
        // 빠른등록 폼 이벤트 리스너 설정
        this.setupInlineProductForm();
        
        // 카테고리 관리 폼 이벤트 리스너 설정
        this.setupCategoryForm();
        
        // 일반 폼 이벤트 리스너 설정
        this.setupGeneralFormListeners();
        
        console.log('✅ Form Manager 초기화 완료');
    }

    /**
     * 빠른등록 폼 설정
     */
    setupInlineProductForm() {
        // 빠른등록 토글 버튼
        const toggleInlineFormBtn = document.getElementById('toggle-inline-product-form');
        const inlineForm = document.getElementById('inline-product-form');
        const inlineFormToggleText = document.getElementById('inline-form-toggle-text');
        
        if (toggleInlineFormBtn && inlineForm) {
            toggleInlineFormBtn.addEventListener('click', () => {
                console.log('🔄 빠른등록 버튼 클릭');
                
                if (inlineForm.classList.contains('hidden')) {
                    // 폼 열기
                    inlineForm.classList.remove('hidden');
                    inlineFormToggleText.textContent = '빠른등록 닫기';
                    console.log('✅ 빠른등록 폼 열기');
                } else {
                    // 폼 닫기
                    inlineForm.classList.add('hidden');
                    inlineFormToggleText.textContent = '빠른 등록';
                    console.log('✅ 빠른등록 폼 닫기');
                }
            });
        }

        // 빠른등록 폼 닫기 버튼
        const closeInlineFormBtn = document.getElementById('close-inline-form');
        if (closeInlineFormBtn && inlineForm) {
            closeInlineFormBtn.addEventListener('click', () => {
                console.log('🔄 빠른등록 폼 닫기 버튼 클릭');
                inlineForm.classList.add('hidden');
                inlineFormToggleText.textContent = '빠른 등록';
                console.log('✅ 빠른등록 폼 닫기 완료');
            });
        }

        // 빠른등록 폼 제출
        const inlineProductForm = document.getElementById('inline-product-form-element');
        if (inlineProductForm) {
            inlineProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInlineProductSubmit();
            });
        }

        // 빠른등록 폼 취소
        const cancelInlineProductBtn = document.getElementById('cancel-inline-product');
        if (cancelInlineProductBtn) {
            cancelInlineProductBtn.addEventListener('click', () => {
                this.resetInlineProductForm();
            });
        }

        // 카테고리 빠른 추가 기능
        this.setupQuickCategoryAdd();
    }

    /**
     * 카테고리 빠른 추가 설정
     */
    setupQuickCategoryAdd() {
        const quickAddCategoryBtn = document.getElementById('quick-add-category-inline');
        const inlineNewCategoryInput = document.getElementById('inline-new-category-input');
        const saveInlineQuickCategoryBtn = document.getElementById('save-inline-quick-category');
        const cancelInlineQuickCategoryBtn = document.getElementById('cancel-inline-quick-category');
        
        // 새 카테고리 추가 버튼
        if (quickAddCategoryBtn && inlineNewCategoryInput) {
            quickAddCategoryBtn.addEventListener('click', () => {
                console.log('🔄 새 카테고리 추가 버튼 클릭');
                inlineNewCategoryInput.classList.remove('hidden');
                console.log('✅ 새 카테고리 입력 필드 표시');
            });
        }
        
        // 새 카테고리 저장 버튼
        if (saveInlineQuickCategoryBtn) {
            saveInlineQuickCategoryBtn.addEventListener('click', () => {
                this.handleQuickCategorySave();
            });
        }
        
        // 새 카테고리 취소 버튼
        if (cancelInlineQuickCategoryBtn) {
            cancelInlineQuickCategoryBtn.addEventListener('click', () => {
                this.cancelQuickCategoryAdd();
            });
        }
    }

    /**
     * 빠른 카테고리 저장 처리
     */
    handleQuickCategorySave() {
        const categoryName = document.getElementById('inline-quick-category-name').value.trim();
        const categoryColor = document.getElementById('inline-quick-category-color').value;
        
        if (!categoryName) {
            alert('카테고리명을 입력해주세요.');
            return;
        }
        
        // 카테고리 추가 로직 (기존 시스템과 연동)
        if (window.orderSystem && window.orderSystem.addCategory) {
            window.orderSystem.addCategory(categoryName, categoryColor);
        }
        
        // 폼 초기화 및 숨김
        this.cancelQuickCategoryAdd();
        
        // 카테고리 옵션 다시 로드
        this.loadInlineCategoryOptions();
        
        console.log('✅ 빠른 카테고리 추가 완료');
    }

    /**
     * 빠른 카테고리 추가 취소
     */
    cancelQuickCategoryAdd() {
        const inlineNewCategoryInput = document.getElementById('inline-new-category-input');
        if (inlineNewCategoryInput) {
            inlineNewCategoryInput.classList.add('hidden');
        }
        
        // 입력 필드 초기화
        document.getElementById('inline-quick-category-name').value = '';
        document.getElementById('inline-quick-category-color').value = 'bg-green-100 text-green-800';
    }

    /**
     * 인라인 카테고리 옵션 로드
     */
    loadInlineCategoryOptions() {
        const inlineCategorySelect = document.getElementById('inline-product-category');
        if (!inlineCategorySelect) return;
        
        // 기존 옵션 제거 (첫 번째 옵션 제외)
        while (inlineCategorySelect.children.length > 1) {
            inlineCategorySelect.removeChild(inlineCategorySelect.lastChild);
        }
        
        // 카테고리 옵션 추가
        if (window.orderSystem && window.orderSystem.categories) {
            window.orderSystem.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                inlineCategorySelect.appendChild(option);
            });
        }
    }

    /**
     * 인라인 상품 등록 처리
     */
    handleInlineProductSubmit() {
        const formData = this.getInlineProductFormData();
        
        if (!this.validateInlineProductForm(formData)) {
            return;
        }
        
        // 상품 등록 로직 (기존 시스템과 연동)
        if (window.orderSystem && window.orderSystem.addProduct) {
            window.orderSystem.addProduct(formData);
        }
        
        // 폼 초기화
        this.resetInlineProductForm();
        
        console.log('✅ 빠른 상품 등록 완료');
    }

    /**
     * 인라인 상품 폼 데이터 수집
     */
    getInlineProductFormData() {
        return {
            name: document.getElementById('inline-product-name').value.trim(),
            category: document.getElementById('inline-product-category').value,
            size: document.getElementById('inline-product-size').value,
            price: parseInt(document.getElementById('inline-product-price').value) || 0,
            wholesalePrice: parseInt(document.getElementById('inline-product-wholesale-price').value) || 0,
            stock: parseInt(document.getElementById('inline-product-stock').value) || 0,
            shipping: document.getElementById('inline-product-shipping').value
        };
    }

    /**
     * 인라인 상품 폼 검증
     */
    validateInlineProductForm(data) {
        if (!data.name) {
            alert('상품명을 입력해주세요.');
            return false;
        }
        
        if (!data.category) {
            alert('카테고리를 선택해주세요.');
            return false;
        }
        
        if (!data.price || data.price <= 0) {
            alert('올바른 판매가를 입력해주세요.');
            return false;
        }
        
        if (!data.stock || data.stock < 0) {
            alert('올바른 재고수량을 입력해주세요.');
            return false;
        }
        
        if (!data.shipping) {
            alert('배송 옵션을 선택해주세요.');
            return false;
        }
        
        return true;
    }

    /**
     * 인라인 상품 폼 초기화
     */
    resetInlineProductForm() {
        try {
            document.getElementById('inline-product-name').value = '';
            document.getElementById('inline-product-category').value = '';
            document.getElementById('inline-product-size').value = '';
            document.getElementById('inline-product-price').value = '';
            document.getElementById('inline-product-wholesale-price').value = '';
            document.getElementById('inline-product-stock').value = '';
            document.getElementById('inline-product-shipping').value = '';
            
            // 새 카테고리 입력 필드 숨김
            const newCategoryInput = document.getElementById('inline-new-category-input');
            if (newCategoryInput) {
                newCategoryInput.classList.add('hidden');
            }
            
            console.log('✅ 빠른등록 폼 초기화 완료');
        } catch (error) {
            console.error('❌ 빠른등록 폼 초기화 실패:', error);
        }
    }

    /**
     * 카테고리 폼 설정
     */
    setupCategoryForm() {
        // 카테고리 추가 버튼
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.handleAddCategory();
            });
        }

        // 카테고리 모달 저장 버튼
        const categoryModalSave = document.getElementById('category-modal-save');
        if (categoryModalSave) {
            categoryModalSave.addEventListener('click', () => {
                console.log('🔄 카테고리 모달 저장 완료 버튼 클릭');
                window.modalManager.closeModalById('category-modal');
                console.log('✅ 카테고리 모달 닫기 완료');
            });
        }
    }

    /**
     * 카테고리 추가 처리
     */
    handleAddCategory() {
        const categoryName = document.getElementById('new-category-name').value.trim();
        const categoryColor = document.getElementById('new-category-color').value;
        const categoryDescription = document.getElementById('new-category-description').value.trim();
        
        if (!categoryName) {
            alert('카테고리명을 입력해주세요.');
            return;
        }
        
        // 카테고리 추가 로직 (기존 시스템과 연동)
        if (window.orderSystem && window.orderSystem.addCategory) {
            window.orderSystem.addCategory(categoryName, categoryColor, categoryDescription);
        }
        
        // 폼 초기화
        document.getElementById('new-category-name').value = '';
        document.getElementById('new-category-color').value = 'bg-purple-100 text-purple-800';
        document.getElementById('new-category-description').value = '';
        
        console.log('✅ 카테고리 추가 완료');
    }

    /**
     * 일반 폼 이벤트 리스너 설정
     */
    setupGeneralFormListeners() {
        // 폼 제출 시 기본 동작 방지
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                e.preventDefault();
                console.log('폼 제출 이벤트 감지:', e.target.id);
            }
        });
    }

    /**
     * 폼 검증
     */
    validateForm(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        for (const [fieldId, rule] of Object.entries(rules)) {
            const field = form.querySelector(`#${fieldId}`);
            if (!field) continue;
            
            const value = field.value.trim();
            
            if (rule.required && !value) {
                alert(`${rule.label}을(를) 입력해주세요.`);
                field.focus();
                return false;
            }
            
            if (rule.minLength && value.length < rule.minLength) {
                alert(`${rule.label}은(는) 최소 ${rule.minLength}자 이상 입력해주세요.`);
                field.focus();
                return false;
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                alert(`${rule.label} 형식이 올바르지 않습니다.`);
                field.focus();
                return false;
            }
        }
        
        return true;
    }

    /**
     * 폼 초기화
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            console.log(`✅ 폼 초기화 완료: ${formId}`);
        }
    }
}

// 폼 매니저 인스턴스 생성
window.formManager = new FormManager();

// 전역 함수로 노출
window.resetInlineProductForm = () => window.formManager.resetInlineProductForm();
window.addCategory = () => window.formManager.handleAddCategory();
