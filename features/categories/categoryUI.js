// 카테고리 UI 관리 모듈
// features/categories/categoryUI.js

// 카테고리 관리 모달 열기
export function openCategoryModal() {
    console.log('카테고리 관리 모달 열기');
    
    const modal = document.getElementById('category-modal');
    if (!modal) {
        console.error('카테고리 모달을 찾을 수 없습니다.');
        return;
    }
    
    // 모달 표시
    modal.classList.remove('hidden');
    
    // 카테고리 목록 로드 및 표시
    loadCategoriesList();
}

// 카테고리 관리 모달 닫기
export function closeCategoryModal() {
    console.log('카테고리 관리 모달 닫기');
    
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 카테고리 목록 로드 및 표시
export async function loadCategoriesList() {
    try {
        console.log('카테고리 목록 로드 시작...');
        
        if (window.categoryDataManager) {
            await window.categoryDataManager.loadCategories();
            const categories = window.categoryDataManager.getAllCategories();
            renderCategoriesList(categories);
        } else {
            console.error('categoryDataManager를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('카테고리 목록 로드 실패:', error);
    }
}

// 카테고리 목록 렌더링
export function renderCategoriesList(categories) {
    const container = document.getElementById('categories-list');
    if (!container) {
        console.error('카테고리 목록 컨테이너를 찾을 수 없습니다.');
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
                <span class="px-2 py-1 text-xs font-medium rounded-full ${category.color}">
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
            colorSelect.value = 'bg-gray-100 text-gray-800';
            if (descriptionInput) descriptionInput.value = '';
            
            // 카테고리 목록 새로고침
            await loadCategoriesList();
            
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
            option.className = category.color;
            categorySelect.insertBefore(option, categorySelect.lastElementChild);
        });
    }
}

// 전역 함수로 등록
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.addCategory = addCategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;


