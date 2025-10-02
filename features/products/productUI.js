// 상품 UI 관리
// features/products/productUI.js

import { productDataManager } from './productData.js';

// 상품 테이블 렌더링 함수
export function renderProductsTable() {
    console.log('🎨 상품 테이블 렌더링 시작');
    
    try {
        const allProducts = productDataManager.getAllProducts();
        console.log(`📊 전체 상품 수: ${allProducts.length}`);
        console.log('📋 상품 데이터 샘플:', allProducts.slice(0, 3));
        
        // 각 상품의 필드 확인
        if (allProducts.length > 0) {
            const sampleProduct = allProducts[0];
            console.log('🔍 샘플 상품 데이터 구조:', {
                id: sampleProduct.id,
                name: sampleProduct.name,
                category: sampleProduct.category,
                size: sampleProduct.size,
                price: sampleProduct.price,
                stock: sampleProduct.stock,
                shipping_option: sampleProduct.shipping_option
            });
        }
        
        const tbody = document.getElementById('products-table-body');
        if (!tbody) {
            console.error('상품 테이블 body를 찾을 수 없습니다.');
            return;
        }
        
        // 테이블 내용 초기화
        tbody.innerHTML = '';
        
        if (allProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-500">
                        등록된 상품이 없습니다.
                    </td>
                </tr>
            `;
            return;
        }
        
        // 상품 목록 렌더링
        allProducts.forEach((product, index) => {
            console.log(`📝 상품 ${index + 1} 렌더링:`, {
                name: product.name,
                category: product.category,
                size: product.size,
                price: product.price,
                stock: product.stock
            });
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-3 py-2 text-center text-sm text-gray-900">
                    <input type="checkbox" class="product-checkbox rounded text-green-600 focus:ring-green-500" value="${product.id}">
                </td>
                <td class="px-3 py-2 text-sm text-gray-900">
                    <input type="number" 
                           class="w-16 p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent" 
                           value="${product.label_quantity || product.stock || 0}" 
                           min="0" 
                           max="999"
                           onchange="updateLabelQuantity('${product.id}', this.value)">
                </td>
                <td class="px-3 py-2 text-sm font-medium text-gray-900">${product.name || '상품명 없음'}</td>
                <td class="px-3 py-2 text-sm text-gray-900">${product.size || '-'}</td>
                <td class="px-3 py-2 text-sm text-gray-900">${product.price ? product.price.toLocaleString() + '원' : '0원'}</td>
                <td class="px-3 py-2 text-sm text-gray-900">${product.stock || 0}개</td>
                <td class="px-3 py-2 text-sm text-gray-900">${getShippingOptionText(product.shipping_option)}</td>
                <td class="px-3 py-2 text-center text-sm text-gray-900">
                    <button onclick="generateQRCode('${product.id}')" class="text-green-600 hover:text-green-800 font-medium text-xs">
                        <i class="fas fa-qrcode mr-1"></i>QR코드
                    </button>
                </td>
                <td class="px-3 py-2 text-center text-sm text-gray-900">
                    <div class="flex justify-center space-x-2">
                        <button onclick="editProduct('${product.id}')" class="text-blue-600 hover:text-blue-800 font-medium text-xs">
                            <i class="fas fa-edit mr-1"></i>수정
                        </button>
                        <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-800 font-medium text-xs">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('상품 테이블 렌더링 완료');
        
    } catch (error) {
        console.error('상품 테이블 렌더링 실패:', error);
    }
}

// QR코드 생성 함수
export function generateQRCode(productId) {
    try {
        console.log('🔍 QR코드 생성:', productId);
        
        const product = productDataManager.getProductById(productId);
        if (!product) {
            console.error('상품을 찾을 수 없습니다:', productId);
            return;
        }
        
        // QR코드 생성 로직 (추후 구현)
        alert(`QR코드 생성: ${product.name}`);
        
    } catch (error) {
        console.error('QR코드 생성 실패:', error);
    }
}

// 라벨수량 업데이트 함수
export function updateLabelQuantity(productId, quantity) {
    try {
        console.log('🏷️ 라벨수량 업데이트:', productId, quantity);
        
        const product = productDataManager.getProductById(productId);
        if (!product) {
            console.error('상품을 찾을 수 없습니다:', productId);
            return;
        }
        
        // 라벨수량 업데이트
        product.label_quantity = parseInt(quantity) || 0;
        
        // 데이터 저장
        productDataManager.saveProducts();
        
        console.log(`✅ 라벨수량 업데이트 완료: ${product.name} → ${product.label_quantity}개`);
        
    } catch (error) {
        console.error('라벨수량 업데이트 실패:', error);
    }
}

// 배송 옵션 텍스트 변환 함수
function getShippingOptionText(shippingOption) {
    const shippingOptions = {
        'always_free': '무료배송',
        'normal': '일반배송',
        'included': '배송비포함',
        'direct': '직접배송'
    };
    
    return shippingOptions[shippingOption] || '일반배송';
}

// 전역 함수로 등록
window.generateQRCode = generateQRCode;
window.updateLabelQuantity = updateLabelQuantity;

// 재고 상태 배지 클래스 반환
function getStockBadgeClass(stock) {
    if (stock === 0) {
        return 'bg-red-100 text-red-800';
    } else if (stock <= 5) {
        return 'bg-yellow-100 text-yellow-800';
    } else {
        return 'bg-green-100 text-green-800';
    }
}

// 재고 상태 텍스트 반환
function getStockStatus(stock) {
    if (stock === 0) {
        return '품절';
    } else if (stock <= 5) {
        return '재고부족';
    } else {
        return '재고충분';
    }
}

// 전역 함수로 등록 (HTML에서 호출 가능하도록)
window.renderProductsTable = renderProductsTable;

// 사이즈 선택 변경 처리 함수
window.handleSizeChange = function() {
    console.log('사이즈 선택 변경 처리');
    
    const sizeSelect = document.getElementById('product-form-size-select');
    const sizeCustom = document.getElementById('product-form-size-custom');
    
    if (!sizeSelect || !sizeCustom) {
        console.error('사이즈 관련 요소를 찾을 수 없습니다.');
        return;
    }
    
    const selectedValue = sizeSelect.value;
    console.log('선택된 사이즈:', selectedValue);
    
    if (selectedValue === 'custom') {
        // 직접 기입 모드
        sizeCustom.classList.remove('hidden');
        sizeCustom.required = true;
        sizeCustom.focus();
    } else {
        // 미리 정의된 사이즈 선택
        sizeCustom.classList.add('hidden');
        sizeCustom.required = false;
        sizeCustom.value = '';
    }
};

// 상품 삭제 함수 (전역)
window.deleteProduct = async function(productId) {
    console.log('상품 삭제 요청:', productId);
    
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        if (window.productDataManager) {
            await window.productDataManager.deleteProduct(productId);
            console.log('상품 삭제 완료');
            
            // 상품 목록 새로고침
            if (window.renderProductsTable) {
                window.renderProductsTable();
            }
            
            // 성공 알림
            if (window.showToast) {
                window.showToast('상품이 삭제되었습니다.', 3000);
            }
        } else {
            console.error('productDataManager를 찾을 수 없습니다.');
            alert('상품 데이터 관리자를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다: ' + error.message);
    }
};

// 상품 수정 함수 (전역)
window.editProduct = function(productId) {
    console.log('상품 수정 요청:', productId);
    
    if (window.orderSystem) {
        window.orderSystem.openProductModal(productId);
    } else {
        console.error('orderSystem을 찾을 수 없습니다.');
    }
};

// 상품 모달 열기 함수
window.openProductModal = async function(productId = null) {
    console.log('상품 모달 열기:', productId ? '수정 모드' : '등록 모드');
    
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');
    const modalTitle = document.getElementById('product-modal-title');
    const productForm = document.getElementById('product-form');
    
    if (!modal || !modalContent || !modalTitle || !productForm) {
        console.error('상품 모달 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 모달 표시
    modal.classList.remove('hidden');
    
    // 모달 초기 위치 및 크기 설정 (고정 크기)
    const centerX = (window.innerWidth - 900) / 2;
    const centerY = (window.innerHeight - 800) / 2;
    
    modalContent.style.position = 'absolute';
    modalContent.style.left = Math.max(50, centerX) + 'px';
    modalContent.style.top = Math.max(50, centerY) + 'px';
    modalContent.style.width = '900px';
    modalContent.style.height = '800px';
    modalContent.style.margin = '0';
    modalContent.style.transform = 'none';
    modalContent.style.resize = 'none';
    
    if (productId) {
        // 수정 모드
        modalTitle.textContent = '상품 정보 수정';
        loadProductData(productId);
    } else {
        // 등록 모드
        modalTitle.textContent = '새 상품 등록';
        clearProductForm();
    }
    
    // 카테고리 데이터 로드 및 목록 업데이트
    if (window.categoryDataManager) {
        await window.categoryDataManager.loadCategories();
        updateCategorySelect();
    } else {
        console.error('categoryDataManager를 찾을 수 없습니다.');
    }
    
    // 드래그 및 리사이즈 기능 초기화
    initModalDragAndResize();
    
    console.log('상품 모달 열기 완료');
};

// 상품 모달 닫기 함수
window.closeProductModal = function() {
    console.log('상품 모달 닫기');
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    console.log('상품 모달 닫기 완료');
};

// 모달 드래그 및 리사이즈 기능 초기화
function initModalDragAndResize() {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');
    const dragHandle = document.getElementById('product-modal-drag-handle');
    const resizeHandle = document.getElementById('product-modal-resize-handle');
    
    if (!modal || !modalContent || !dragHandle || !resizeHandle) {
        console.error('모달 드래그/리사이즈 요소를 찾을 수 없습니다.');
        return;
    }

    // 이미 초기화되었는지 확인
    if (modalContent.dataset.dragInitialized === 'true') {
        console.log('드래그/리사이즈 기능이 이미 초기화됨');
        return;
    }

    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // 드래그 시작
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = modalContent.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        // 드래그 중 커서 변경
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        e.preventDefault();
    });

    // 리사이즈 기능 비활성화 (고정 크기)
    if (resizeHandle) {
        resizeHandle.style.display = 'none';
        resizeHandle.style.cursor = 'default';
    }

    // 드래그 처리
    function handleDrag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newLeft = startLeft + deltaX;
        const newTop = startTop + deltaY;
        
        // 화면 경계 체크
        const maxLeft = window.innerWidth - modalContent.offsetWidth;
        const maxTop = window.innerHeight - modalContent.offsetHeight;
        
        modalContent.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
        modalContent.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
        modalContent.style.position = 'absolute';
        modalContent.style.margin = '0';
        modalContent.style.transform = 'none';
    }

    // 리사이즈 처리
    function handleResize(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newWidth = Math.max(600, startWidth + deltaX);
        const newHeight = Math.max(400, startHeight + deltaY);
        
        // 화면 크기 제한
        const maxWidth = window.innerWidth - modalContent.offsetLeft;
        const maxHeight = window.innerHeight - modalContent.offsetTop;
        
        modalContent.style.width = Math.min(newWidth, maxWidth) + 'px';
        modalContent.style.height = Math.min(newHeight, maxHeight) + 'px';
    }

    // 드래그 중지
    function stopDrag() {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // 리사이즈 중지
    function stopResize() {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }

    // 초기화 완료 표시
    modalContent.dataset.dragInitialized = 'true';
    console.log('모달 드래그/리사이즈 기능 초기화 완료');
}

// 상품 데이터 로드 (수정 모드용)
function loadProductData(productId) {
    console.log('상품 데이터 로드:', productId);
    
    try {
        if (!window.productDataManager) {
            console.error('productDataManager를 찾을 수 없습니다.');
            return;
        }
        
        const product = window.productDataManager.getProductById(productId);
        if (!product) {
            console.error('상품을 찾을 수 없습니다:', productId);
            return;
        }
        
        console.log('상품 정보:', product);
        
    // 폼 필드에 데이터 설정
    document.getElementById('product-form-name').value = product.name || '';
    document.getElementById('product-form-category').value = product.category || '';
    document.getElementById('product-form-price').value = product.price || '';
    document.getElementById('product-form-wholesale-price').value = product.cost || '';
    document.getElementById('product-form-stock').value = product.stock || '';
    
    // 사이즈 처리
    const sizeSelect = document.getElementById('product-form-size-select');
    const sizeCustom = document.getElementById('product-form-size-custom');
    if (sizeSelect && sizeCustom) {
        const productSize = product.size || '';
        if (productSize && !['SX', 'S', 'M', 'L', 'XL'].includes(productSize)) {
            // 커스텀 사이즈인 경우
            sizeSelect.value = 'custom';
            sizeCustom.value = productSize;
            sizeCustom.classList.remove('hidden');
        } else {
            // 미리 정의된 사이즈인 경우
            sizeSelect.value = productSize;
            sizeCustom.classList.add('hidden');
        }
    }
    
    document.getElementById('product-form-shipping').value = product.shipping_option || '';
    document.getElementById('product-form-description').value = product.description || '';
        
        // 상품 ID 저장 (수정 모드용)
        const productIdField = document.getElementById('product-id');
        if (productIdField) {
            productIdField.value = productId;
        }
        
        console.log('상품 데이터 로드 완료');
        
    } catch (error) {
        console.error('상품 데이터 로드 실패:', error);
    }
}

// 상품 폼 초기화
function clearProductForm() {
    console.log('상품 폼 초기화');
    
    // 폼 태그가 제거되었으므로 개별 필드 초기화
    const fields = [
        'product-form-name',
        'product-form-category', 
        'product-form-size-select',
        'product-form-size-custom',
        'product-form-price',
        'product-form-wholesale-price',
        'product-form-stock',
        'product-form-shipping',
        'product-form-description',
        'product-form-image',
        'product-id'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'radio' || field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        }
    });
    
    // 상품 ID 필드 초기화
    const productIdField = document.getElementById('product-id');
    if (productIdField) {
        productIdField.value = '';
    }
    
    // 배송옵션 기본값 설정 (일반배송)
    const shippingSelect = document.getElementById('product-form-shipping');
    if (shippingSelect) {
        shippingSelect.value = 'normal';
    }
    
    console.log('상품 폼 초기화 완료');
}

// 카테고리 선택 옵션 업데이트
function updateCategorySelect() {
    console.log('카테고리 선택 옵션 업데이트');
    
    try {
        if (!window.categoryDataManager) {
            console.error('categoryDataManager를 찾을 수 없습니다.');
            return;
        }
        
        const categories = window.categoryDataManager.getAllCategories();
        const categorySelect = document.getElementById('product-form-category');
        
        if (!categorySelect) {
            console.error('카테고리 선택 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 옵션 제거 (첫 번째 옵션과 새 카테고리 추가 옵션 제외)
        const existingOptions = categorySelect.querySelectorAll('option:not([value=""]):not([value="__ADD_NEW__"])');
        existingOptions.forEach(option => option.remove());
        
        // 카테고리 옵션 추가
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        console.log(`카테고리 옵션 업데이트 완료: ${categories.length}개`);
        
    } catch (error) {
        console.error('카테고리 옵션 업데이트 실패:', error);
    }
}

// 상품 저장 함수
window.saveProduct = async function() {
    console.log('상품 저장 시작');
    
    try {
        const productForm = document.getElementById('product-form');
        if (!productForm) {
            console.error('상품 폼을 찾을 수 없습니다.');
            return;
        }
        
        // 폼 데이터 직접 수집
        const name = document.getElementById('product-form-name')?.value || '';
        const category = document.getElementById('product-form-category')?.value || '';
        const price = parseFloat(document.getElementById('product-form-price')?.value) || 0;
        const wholesalePrice = parseFloat(document.getElementById('product-form-wholesale-price')?.value) || 0;
        const stock = parseInt(document.getElementById('product-form-stock')?.value) || 0;
        const shipping = document.getElementById('product-form-shipping')?.value || '';
        const description = document.getElementById('product-form-description')?.value || '';
        const tags = document.getElementById('product-form-tags')?.value || '';
        const image = document.getElementById('product-form-image')?.value || '';
        
        // 사이즈 데이터 처리
        const sizeSelect = document.getElementById('product-form-size-select');
        const sizeCustom = document.getElementById('product-form-size-custom');
        let sizeValue = '';
        
        if (sizeSelect && sizeCustom) {
            if (sizeSelect.value === 'custom') {
                sizeValue = sizeCustom.value || '';
            } else {
                sizeValue = sizeSelect.value || '';
            }
        }
        
        const productData = {
            name: name,
            category: category,
            price: price,
            cost: wholesalePrice,  // wholesale_price → cost
            stock: stock,
            size: sizeValue,
            shipping_option: shipping,  // shipping → shipping_option
            description: description,
            tags: tags,
            image_url: image  // image → image_url
        };
        
        console.log('저장할 상품 데이터:', productData);
        
        if (!window.productDataManager) {
            console.error('productDataManager를 찾을 수 없습니다.');
            alert('상품 데이터 관리자를 찾을 수 없습니다.');
            return;
        }
        
        const productIdField = document.getElementById('product-id');
        const productId = productIdField ? productIdField.value : null;
        
        if (productId && productId.trim() !== '') {
            // 수정 모드
            console.log('수정 모드 - 상품 정보 업데이트:', productId);
            await window.productDataManager.updateProduct(productId, productData);
            console.log('상품 수정 완료');
            
            if (window.showToast) {
                window.showToast('상품 정보가 수정되었습니다.', 3000);
            }
        } else {
            // 신규 등록 모드
            console.log('신규 등록 모드 - 새 상품 추가');
            await window.productDataManager.addProduct(productData);
            console.log('상품 등록 완료');
            
            if (window.showToast) {
                window.showToast('상품이 성공적으로 등록되었습니다.', 3000);
            }
        }
        
        // 모달 닫기
        window.closeProductModal();
        
        // 상품 목록 새로고침
        console.log('상품 목록 새로고침 시작...');
        
        if (window.productDataManager) {
            await window.productDataManager.loadProducts();
            console.log('상품 데이터 로드 완료');
        }
        
        if (window.renderProductsTable) {
            window.renderProductsTable();
            console.log('상품 목록 새로고침 완료');
        } else {
            console.error('renderProductsTable 함수를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('상품 저장 실패:', error);
        
        // 상품명 중복 오류인 경우 특별 처리
        if (error.message.includes('이미 등록된 상품명')) {
            const productName = document.getElementById('product-form-name')?.value || '입력된 상품명';
            alert(`${productName}은(는) 이미 등록된 상품명입니다.\n다른 상품명을 입력해주세요.`);
        } else {
            alert('상품 저장에 실패했습니다: ' + error.message);
        }
    }
};
