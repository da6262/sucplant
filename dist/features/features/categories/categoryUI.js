// 카테고리 UI 관리 모듈
// features/categories/categoryUI.js

// 카테고리 관리 모달 열기
export async function openCategoryModal() {
    console.log('카테고리 관리 모달 열기');
    
    let modal = document.getElementById('category-modal');
    
    // 모달이 없으면 동적으로 로드
    if (!modal) {
        console.log('📦 카테고리 모달이 없습니다. 동적 로드 시작...');
        try {
            await loadCategoryModal();
            modal = document.getElementById('category-modal');
            console.log('🔍 로드된 모달 요소:', modal);
            
            if (!modal) {
                console.error('❌ 카테고리 모달 로드 실패 - 모달 요소를 찾을 수 없습니다');
                alert('카테고리 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                return;
            }
        } catch (loadError) {
            console.error('❌ 카테고리 모달 로드 중 오류:', loadError);
            alert('카테고리 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
            return;
        }
    }
    
    // 모달 표시
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // 카테고리 목록 로드 및 표시
    await loadCategoriesList();
}

// 카테고리 모달 동적 로드
export async function loadCategoryModal() {
    try {
        console.log('📦 카테고리 모달 컴포넌트 로드 중...');
        
        // 카테고리 모달 컴포넌트 동적 로드
        const response = await fetch('components/modals/category-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();
        console.log('📦 모달 HTML 로드 완료, 길이:', modalHTML.length);
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 카테고리 모달 컴포넌트 로드 완료');
        
        // 모달이 제대로 추가되었는지 확인
        const modal = document.getElementById('category-modal');
        if (!modal) {
            throw new Error('모달이 DOM에 추가되지 않았습니다.');
        }
        console.log('✅ 모달 DOM 확인 완료');
        
        // 카테고리 목록 로드
        await loadCategoriesList();
        
        console.log('🎯 카테고리 모달 이벤트 리스너 설정 완료');
        
        // 닫기 버튼 이벤트 리스너 추가
        const closeCategoryBtn = document.getElementById('close-category-modal');
        if (closeCategoryBtn) {
            closeCategoryBtn.addEventListener('click', () => {
                console.log('❌ 카테고리 모달 닫기 버튼 클릭');
                closeCategoryModal();
            });
            console.log('✅ 카테고리 모달 닫기 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 닫기 버튼을 찾을 수 없습니다.');
        }
        
        // 모달 배경 클릭 시 닫기
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('🖱️ 모달 배경 클릭 - 모달 닫기');
                    closeCategoryModal();
                }
            });
            console.log('✅ 모달 배경 클릭 이벤트 리스너 추가 완료');
        }
        
        // 저장 완료 버튼 이벤트 리스너 추가
        const saveBtn = document.getElementById('category-modal-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('💾 카테고리 모달 저장 완료 버튼 클릭');
                closeCategoryModal();
            });
            console.log('✅ 저장 완료 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 저장 완료 버튼을 찾을 수 없습니다.');
        }
        
        // 취소 버튼 이벤트 리스너 추가
        const cancelBtn = document.getElementById('category-modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('❌ 카테고리 모달 취소 버튼 클릭');
                closeCategoryModal();
            });
            console.log('✅ 취소 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 취소 버튼을 찾을 수 없습니다.');
        }
        
        // 카테고리 추가 버튼 이벤트 리스너 추가
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', async () => {
                console.log('➕ 카테고리 추가 버튼 클릭');
                try {
                    await addCategory();
                } catch (error) {
                    console.error('❌ 카테고리 추가 실패:', error);
                }
            });
            console.log('✅ 카테고리 추가 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 카테고리 추가 버튼을 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 카테고리 모달 로드 실패:', error);
        throw error;
    }
}

// 카테고리 관리 모달 닫기
export function closeCategoryModal() {
    console.log('카테고리 관리 모달 닫기');
    
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// 카테고리 목록 로드 및 표시
export async function loadCategoriesList() {
    try {
        console.log('📥 카테고리 목록 로드 시작...');
        
        if (window.categoryDataManager) {
            console.log('✅ categoryDataManager 발견');
            await window.categoryDataManager.loadCategories();
            const categories = window.categoryDataManager.getAllCategories();
            console.log(`📊 로드된 카테고리 수: ${categories.length}`);
            renderCategoriesList(categories);
        } else {
            console.error('❌ categoryDataManager를 찾을 수 없습니다!');
        }
        
    } catch (error) {
        console.error('❌ 카테고리 목록 로드 실패:', error);
    }
}

// 카테고리 목록 렌더링
export function renderCategoriesList(categories) {
    console.log('📋 카테고리 목록 렌더링 시작, 카테고리 수:', categories.length);
    console.log('📋 카테고리 목록:', categories);
    
    const container = document.getElementById('categories-list');
    console.log('🔍 categories-list 컨테이너:', container);
    
    if (!container) {
        console.error('❌ categories-list 컨테이너를 찾을 수 없습니다!');
        console.log('🔍 현재 DOM에 있는 모든 ID:', 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-tag text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg font-medium">등록된 카테고리가 없습니다</p>
                <p class="text-sm">새 카테고리를 추가해보세요</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex items-center space-x-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-${category.color}-100 text-${category.color}-800">
                    ${category.name}
                </span>
                ${category.description ? `<span class="text-sm text-gray-600">${category.description}</span>` : ''}
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="editCategory('${category.id}')" 
                        class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    <i class="fas fa-edit mr-1"></i>수정
                </button>
                <button onclick="deleteCategory('${category.id}')" 
                        class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash mr-1"></i>삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 새 카테고리 추가
export async function addCategory() {
    try {
        console.log('새 카테고리 추가 시작...');
        
        const nameInput = document.getElementById('new-category-name');
        const colorSelect = document.getElementById('new-category-color');
        const descriptionInput = document.getElementById('new-category-description');
        
        if (!nameInput || !colorSelect) {
            console.error('카테고리 입력 필드를 찾을 수 없습니다.');
            return;
        }
        
        const categoryData = {
            name: nameInput.value.trim(),
            color: colorSelect.value,
            description: descriptionInput ? descriptionInput.value.trim() : ''
        };
        
        // 유효성 검사
        if (!categoryData.name) {
            alert('카테고리명을 입력해주세요.');
            nameInput.focus();
            return;
        }
        
        if (window.categoryDataManager) {
            await window.categoryDataManager.addCategory(categoryData);
            
            // 입력 필드 초기화
            nameInput.value = '';
            colorSelect.value = 'gray';
            if (descriptionInput) descriptionInput.value = '';
            
            // 카테고리 목록 새로고침
            await loadCategoriesList();
            
            // 상품 모달의 카테고리 드롭다운도 업데이트
            if (window.updateProductCategoryDropdown) {
                await window.updateProductCategoryDropdown();
            }
            
            // 성공 메시지
            alert('✅ 카테고리가 추가되었습니다!');
            
        } else {
            console.error('categoryDataManager를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('카테고리 추가 실패:', error);
        alert(`❌ 카테고리 추가 실패: ${error.message}`);
    }
}

// 카테고리 수정
export async function editCategory(categoryId) {
    try {
        console.log('카테고리 수정:', categoryId);
        
        if (window.categoryDataManager) {
            const category = window.categoryDataManager.getCategoryById(categoryId);
            if (category) {
                const newName = prompt('카테고리명을 수정하세요:', category.name);
                if (newName && newName.trim() !== category.name) {
                    await window.categoryDataManager.updateCategory(categoryId, { name: newName.trim() });
                    await loadCategoriesList();
                    
                    // 상품 모달의 카테고리 드롭다운도 업데이트
                    if (window.updateProductCategoryDropdown) {
                        await window.updateProductCategoryDropdown();
                    }
                    
                    alert('✅ 카테고리가 수정되었습니다!');
                }
            }
        }
        
    } catch (error) {
        console.error('카테고리 수정 실패:', error);
        alert(`❌ 카테고리 수정 실패: ${error.message}`);
    }
}

// 카테고리 삭제
export async function deleteCategory(categoryId) {
    try {
        console.log('카테고리 삭제:', categoryId);
        
        if (window.categoryDataManager) {
            const category = window.categoryDataManager.getCategoryById(categoryId);
            if (category) {
                if (confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
                    await window.categoryDataManager.deleteCategory(categoryId);
                    await loadCategoriesList();
                    
                    // 상품 모달의 카테고리 드롭다운도 업데이트
                    if (window.updateProductCategoryDropdown) {
                        await window.updateProductCategoryDropdown();
                    }
                    
                    alert('✅ 카테고리가 삭제되었습니다!');
                }
            }
        }
        
    } catch (error) {
        console.error('카테고리 삭제 실패:', error);
        alert(`❌ 카테고리 삭제 실패: ${error.message}`);
    }
}

// 카테고리 드롭다운 업데이트
export function updateCategoryDropdown() {
    const categorySelect = document.getElementById('product-form-category');
    if (!categorySelect) return;
    
    // 기존 옵션 제거 (첫 번째와 마지막 옵션 제외)
    while (categorySelect.children.length > 2) {
        categorySelect.removeChild(categorySelect.children[1]);
    }
    
    if (window.categoryDataManager) {
        const categories = window.categoryDataManager.getAllCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            option.className = `bg-${category.color}-100 text-${category.color}-800`;
            categorySelect.insertBefore(option, categorySelect.lastElementChild);
        });
    }
}

// 상품 모달용 카테고리 드롭다운 업데이트 함수
export async function updateProductCategoryDropdown() {
    try {
        console.log('🔄 상품 모달 카테고리 드롭다운 업데이트 시작...');
        console.trace('🔍 호출 스택:'); // 호출 위치 추적
        
        const categorySelect = document.getElementById('product-form-category');
        if (!categorySelect) {
            console.warn('⚠️ product-form-category 요소를 찾을 수 없습니다');
            return;
        }
        
        console.log('🔍 업데이트 전 옵션 수:', categorySelect.children.length);
        
        // 카테고리 데이터 매니저가 없으면 초기화
        if (!window.categoryDataManager) {
            console.log('🔄 CategoryDataManager 초기화 중...');
            if (window.initializeCategoryDataManager) {
                await window.initializeCategoryDataManager();
            } else {
                console.error('❌ initializeCategoryDataManager 함수를 찾을 수 없습니다');
                return;
            }
        }
        
        // 카테고리 데이터 로드
        if (window.categoryDataManager) {
            await window.categoryDataManager.loadCategories();
            const categories = window.categoryDataManager.getAllCategories();
            
            console.log(`📊 로드된 카테고리 수: ${categories.length}`);
            
            // ✅ 개선: 모든 옵션을 완전히 초기화
            categorySelect.innerHTML = '';
            
            // 첫 번째 옵션 추가 (카테고리 선택)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '카테고리 선택';
            categorySelect.appendChild(defaultOption);
            
            // 카테고리 옵션 추가 (중복 체크)
            const addedCategories = new Set();
            categories.forEach(category => {
                // 중복 방지
                if (!addedCategories.has(category.name)) {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    option.className = `text-${category.color}-800`;
                    categorySelect.appendChild(option);
                    addedCategories.add(category.name);
                }
            });
            
            // 마지막 옵션 추가 (새 카테고리 추가)
            const addNewOption = document.createElement('option');
            addNewOption.value = '__ADD_NEW__';
            addNewOption.textContent = '+ 새 카테고리 추가';
            addNewOption.className = 'text-blue-600 font-medium';
            categorySelect.appendChild(addNewOption);
            
            console.log(`✅ 상품 모달 카테고리 드롭다운 업데이트 완료 (${addedCategories.size}개)`);
            console.log('🔍 업데이트 후 옵션 수:', categorySelect.children.length);
        } else {
            console.error('❌ categoryDataManager를 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 상품 모달 카테고리 드롭다운 업데이트 실패:', error);
    }
}

// 전역 함수로 등록
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.addCategory = addCategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.updateProductCategoryDropdown = updateProductCategoryDropdown;

// 카테고리 추가 함수를 전역으로도 등록 (onclick 이벤트용)
window.addCategory = addCategory;















