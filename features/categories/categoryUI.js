// 카테고리 UI 관리 모듈
// features/categories/categoryUI.js

/* ─────────────────────────────────────────────
   공통 헬퍼: 카테고리 변경 후 전체 드롭다운 동기화
   ───────────────────────────────────────────── */
async function syncAllCategoryDropdowns() {
    // 1) 상품 등록 모달의 카테고리 select
    if (window.updateProductCategoryDropdown) {
        await window.updateProductCategoryDropdown();
    }
    // 2) 상품 목록 페이지의 필터 select
    if (window.productManagementComponent?.updateCategoryFilter) {
        window.productManagementComponent.updateCategoryFilter();
    }
}

/* ─────────────────────────────────────────────
   모달 열기 / 닫기
   ───────────────────────────────────────────── */
export async function openCategoryModal() {
    let modal = document.getElementById('category-modal');

    if (!modal) {
        try {
            await loadCategoryModal();
            modal = document.getElementById('category-modal');
            if (!modal) {
                alert('카테고리 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                return;
            }
        } catch (err) {
            alert('카테고리 모달을 로드하는 중 오류가 발생했습니다: ' + err.message);
            return;
        }
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    await loadCategoriesList();
}

export function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    // 닫을 때도 드롭다운 동기화 (모달에서 변경사항 반영)
    syncAllCategoryDropdowns();
}

/* ─────────────────────────────────────────────
   모달 HTML 동적 로드 (최초 1회)
   ───────────────────────────────────────────── */
export async function loadCategoryModal() {
    try {
        const response = await fetch('components/modals/category-modal.html');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);

        const modal = document.getElementById('category-modal');
        if (!modal) throw new Error('모달이 DOM에 추가되지 않았습니다.');

        // 이벤트 리스너 (한 번만 등록)
        modal.addEventListener('click', e => { if (e.target === modal) closeCategoryModal(); });

        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) addBtn.addEventListener('click', () => addCategory());

        // 로드 직후 목록 표시
        await loadCategoriesList();
    } catch (err) {
        console.error('❌ 카테고리 모달 로드 실패:', err);
        throw err;
    }
}

/* ─────────────────────────────────────────────
   카테고리 목록 로드 & 렌더링
   ───────────────────────────────────────────── */
export async function loadCategoriesList() {
    if (!window.categoryDataManager) {
        console.error('❌ categoryDataManager 없음');
        return;
    }
    await window.categoryDataManager.loadCategories();
    renderCategoriesList(window.categoryDataManager.getAllCategories());
}

export function renderCategoriesList(categories) {
    const container = document.getElementById('categories-list');
    if (!container) return;

    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div style="padding:32px 8px;text-align:center;color:var(--text-muted);font-size:13px;">
                <i class="fas fa-tag" style="font-size:24px;display:block;margin-bottom:10px;opacity:0.4;"></i>
                등록된 카테고리가 없습니다. 위에서 추가해보세요.
            </div>`;
        return;
    }

    const COLOR_MAP = {
        green: '#16a34a', blue: '#2563eb', red: '#dc2626', yellow: '#ca8a04',
        purple: '#9333ea', pink: '#db2777', indigo: '#4338ca', gray: '#6b7280',
        brown: '#92400e', orange: '#ea580c'
    };

    container.innerHTML = categories.map(cat => `
        <div id="cat-row-${cat.id}" class="flex-between p-xs bg-card border-std r-md"
             style="transition:background 0.1s;gap:8px;">
            <!-- 보기 모드 -->
            <div class="cat-view flex-center flex-gap-2" style="flex:1;min-width:0;">
                <span class="badge r-full fw-medium"
                      style="background:${COLOR_MAP[cat.color] || '#6b7280'};color:#fff;">
                    ${cat.name}
                </span>
                <span class="txt-secondary txt-xs" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${cat.description || ''}</span>
            </div>
            <!-- 수정 모드 (기본 hidden) -->
            <div class="cat-edit hidden flex-center flex-gap-2" style="flex:1;margin-right:8px;">
                <input type="text" id="edit-name-${cat.id}" value="${cat.name}"
                       class="input-ui" style="max-width:130px;" placeholder="카테고리명">
                <select id="edit-color-${cat.id}" class="input-ui" style="max-width:90px;">
                    ${['green','blue','red','yellow','purple','pink','indigo','gray','brown','orange']
                        .map(c => `<option value="${c}"${c === cat.color ? ' selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <!-- 버튼 -->
            <div class="cat-view-btns btn-group">
                <button onclick="window.startEditCategory('${cat.id}')"
                        class="btn-icon btn-icon-edit" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="window.deleteCategory('${cat.id}')"
                        class="btn-icon btn-icon-delete" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cat-edit-btns hidden btn-group">
                <button onclick="window.confirmEditCategory('${cat.id}')"
                        class="btn-icon btn-icon-primary" title="저장">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="window.cancelEditCategory('${cat.id}')"
                        class="btn-icon" style="color:var(--text-secondary);background:var(--bg-light);" title="취소">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/* ─────────────────────────────────────────────
   인라인 수정 (수정/저장/취소)
   ───────────────────────────────────────────── */
export function startEditCategory(categoryId) {
    const row = document.getElementById(`cat-row-${categoryId}`);
    if (!row) return;
    row.querySelector('.cat-view').classList.add('hidden');
    row.querySelector('.cat-view-btns').classList.add('hidden');
    row.querySelector('.cat-edit').classList.remove('hidden');
    row.querySelector('.cat-edit-btns').classList.remove('hidden');
    row.querySelector(`#edit-name-${categoryId}`)?.focus();
}

export function cancelEditCategory(categoryId) {
    const row = document.getElementById(`cat-row-${categoryId}`);
    if (!row) return;
    row.querySelector('.cat-view').classList.remove('hidden');
    row.querySelector('.cat-view-btns').classList.remove('hidden');
    row.querySelector('.cat-edit').classList.add('hidden');
    row.querySelector('.cat-edit-btns').classList.add('hidden');
}

export async function confirmEditCategory(categoryId) {
    try {
        const nameInput  = document.getElementById(`edit-name-${categoryId}`);
        const colorInput = document.getElementById(`edit-color-${categoryId}`);
        const newName  = nameInput?.value.trim();
        const newColor = colorInput?.value || 'gray';

        if (!newName) { alert('카테고리명을 입력해주세요.'); nameInput?.focus(); return; }

        if (!window.categoryDataManager) throw new Error('categoryDataManager 없음');
        await window.categoryDataManager.updateCategory(categoryId, { name: newName, color: newColor });

        await loadCategoriesList();
        await syncAllCategoryDropdowns();
    } catch (err) {
        console.error('❌ 카테고리 수정 실패:', err);
        alert('카테고리 수정 실패: ' + err.message);
    }
}

/* ─────────────────────────────────────────────
   새 카테고리 추가
   ───────────────────────────────────────────── */
export async function addCategory() {
    try {
        const nameInput  = document.getElementById('new-category-name');
        const colorInput = document.getElementById('new-category-color');
        const descInput  = document.getElementById('new-category-description');

        if (!nameInput || !colorInput) {
            console.error('카테고리 입력 필드 없음');
            return;
        }

        const name  = nameInput.value.trim();
        const color = colorInput.value || 'gray';
        const desc  = descInput?.value.trim() || '';

        if (!name) { alert('카테고리명을 입력해주세요.'); nameInput.focus(); return; }

        if (!window.categoryDataManager) throw new Error('categoryDataManager 없음');
        await window.categoryDataManager.addCategory({ name, color, description: desc });

        // 입력 필드 초기화
        nameInput.value = '';
        colorInput.value = 'gray';
        if (descInput) descInput.value = '';

        await loadCategoriesList();
        await syncAllCategoryDropdowns();

    } catch (err) {
        console.error('❌ 카테고리 추가 실패:', err);
        alert('카테고리 추가 실패: ' + err.message);
    }
}

/* ─────────────────────────────────────────────
   카테고리 삭제
   ───────────────────────────────────────────── */
export async function deleteCategory(categoryId) {
    try {
        if (!window.categoryDataManager) throw new Error('categoryDataManager 없음');

        const cat = window.categoryDataManager.getCategoryById(categoryId);
        if (!cat) return;
        if (!confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) return;

        await window.categoryDataManager.deleteCategory(categoryId);
        await loadCategoriesList();
        await syncAllCategoryDropdowns();

    } catch (err) {
        console.error('❌ 카테고리 삭제 실패:', err);
        alert('카테고리 삭제 실패: ' + err.message);
    }
}

/* ─────────────────────────────────────────────
   상품 모달용 카테고리 드롭다운 업데이트
   ───────────────────────────────────────────── */
export async function updateProductCategoryDropdown() {
    try {
        const sel = document.getElementById('product-form-category');
        if (!sel) return;

        if (!window.categoryDataManager) {
            if (window.initializeCategoryDataManager) {
                await window.initializeCategoryDataManager();
            } else {
                return;
            }
        }

        await window.categoryDataManager.loadCategories();
        const categories = window.categoryDataManager.getAllCategories();

        sel.innerHTML = '<option value="">카테고리 선택</option>';

        const seen = new Set();
        categories.forEach(cat => {
            if (!seen.has(cat.name)) {
                const opt = document.createElement('option');
                opt.value = cat.name;
                opt.textContent = cat.name;
                sel.appendChild(opt);
                seen.add(cat.name);
            }
        });

        // 마지막 옵션: 새 카테고리 추가
        const addOpt = document.createElement('option');
        addOpt.value = '__ADD_NEW__';
        addOpt.textContent = '+ 새 카테고리 추가';
        addOpt.className = 'text-blue-600 font-medium';
        sel.appendChild(addOpt);

    } catch (err) {
        console.error('❌ 카테고리 드롭다운 업데이트 실패:', err);
    }
}

/* ─────────────────────────────────────────────
   전역 등록
   ───────────────────────────────────────────── */
window.openCategoryModal          = openCategoryModal;
window.closeCategoryModal         = closeCategoryModal;
window.addCategory                = addCategory;
window.deleteCategory             = deleteCategory;
window.startEditCategory          = startEditCategory;
window.cancelEditCategory         = cancelEditCategory;
window.confirmEditCategory        = confirmEditCategory;
window.updateProductCategoryDropdown = updateProductCategoryDropdown;
// 구버전 호환
window.editCategory               = startEditCategory;
