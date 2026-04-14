// 상품관리 JavaScript 함수들
// js/product-management.js

// 상품관리 컴포넌트 동적 로드 함수
async function loadProductManagementComponent() {
    try {
        console.log('🔄 상품관리 컴포넌트 로드 중...');
        
        // 기존 상품관리 섹션이 있으면 제거
        const existingSection = document.getElementById('products-section');
        if (existingSection) {
            console.log('🗑️ 기존 상품관리 섹션 제거');
            existingSection.remove();
        }
        
        // 다른 섹션들은 제거하지 않음 (화면 전환을 위해 유지)
        console.log('📋 다른 섹션들은 화면 전환을 위해 유지');
        
        // 메인 콘텐츠 확인
        const mainContentElement = document.getElementById('mainContent');
        console.log('🔍 메인 콘텐츠 요소:', mainContentElement);
        
        if (!mainContentElement) {
            throw new Error('메인 콘텐츠 영역을 찾을 수 없습니다.');
        }
        
        // 컴포넌트 로드
        console.log('🌐 컴포넌트 파일 요청 중...');
        const response = await fetch('components/product-management/product-management.html');
        console.log('📡 응답 상태:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        console.log('📄 HTML 콘텐츠 길이:', htmlContent.length);
        
        // 메인 콘텐츠에 HTML 삽입
        mainContentElement.innerHTML = htmlContent;
        console.log('✅ HTML 콘텐츠 삽입 완료');
        
        // 동적 컴포넌트임을 표시
        const productSection = document.getElementById('products-section');
        if (productSection) {
            productSection.setAttribute('data-dynamic', 'true');
        }
        
        // 상품관리 스크립트 로드
        await loadProductManagementScript();
        
        // 데이터 매니저 초기화 확인
        if (!window.productDataManager) {
            console.warn('⚠️ productDataManager가 없습니다. 초기화 중...');
            if (window.ProductDataManager) {
                window.productDataManager = new window.ProductDataManager();
                await window.productDataManager.loadProducts();
                console.log('✅ productDataManager 초기화 완료');
            }
        }
        
        console.log('✅ 상품관리 컴포넌트 로드 완료');
        
    } catch (error) {
        console.error('❌ 상품관리 컴포넌트 로드 실패:', error);
        alert('상품관리 컴포넌트를 로드할 수 없습니다.');
    }
}

// 상품관리 스크립트 로드
async function loadProductManagementScript() {
    try {
        console.log('📜 상품관리 스크립트 로드 중...');
        
        // 기존 스크립트가 있으면 제거
        const existingScript = document.getElementById('product-management-script');
        if (existingScript) {
            console.log('🗑️ 기존 상품관리 스크립트 제거');
            existingScript.remove();
        }
        
        // 스크립트 동적 로드
        const script = document.createElement('script');
        script.id = 'product-management-script';
        script.src = 'components/product-management/product-management.js';
        script.type = 'module';
        
        // 로드 완료 이벤트 리스너
        script.onload = () => {
            console.log('✅ 상품관리 스크립트 로드 완료');
            
            // 컴포넌트 초기화
            setTimeout(async () => {
                try {
                    console.log('🏗️ ProductManagementComponent 인스턴스 생성 및 초기화...');
                    
                    // ProductManagementComponent 클래스가 로드되었는지 확인
                    if (window.ProductManagementComponent) {
                        const productManagementComponent = new window.ProductManagementComponent();
                        const container = document.getElementById('products-section');
                        
                        if (container) {
                            await productManagementComponent.init(container);
                            
                            // 전역에 등록하여 다른 곳에서도 접근 가능하도록 함
                            window.productManagementComponent = productManagementComponent;
                            
                            console.log('✅ ProductManagementComponent 초기화 완료');
                            
                            // 이벤트 리스너가 제대로 설정되었는지 확인
                            const addProductBtn = document.getElementById('add-product-btn');
                            if (addProductBtn) {
                                console.log('✅ 상품등록 버튼 발견 및 이벤트 리스너 설정 완료');
                            } else {
                                console.error('❌ 상품등록 버튼을 찾을 수 없습니다');
                            }
                        } else {
                            console.error('❌ products-section 컨테이너를 찾을 수 없습니다');
                        }
                    } else {
                        console.error('❌ ProductManagementComponent 클래스를 찾을 수 없습니다');
                    }
                } catch (error) {
                    console.error('❌ ProductManagementComponent 초기화 실패:', error);
                }
            }, 100);
        };
        
        script.onerror = (error) => {
            console.error('❌ 상품관리 스크립트 로드 실패:', error);
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ 상품관리 스크립트 로드 실패:', error);
    }
}

// 상품 모달 동적 로드 함수
async function loadProductModal() {
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
        
        // 닫기 버튼 이벤트 리스너 추가
        const closeProductBtn = document.getElementById('close-product-modal');
        if (closeProductBtn) {
            closeProductBtn.addEventListener('click', function() {
                console.log('❌ 상품 모달 닫기 버튼 클릭');
                if (window.closeProductModal) {
                    window.closeProductModal();
                }
            });
            console.log('✅ 상품 모달 닫기 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 닫기 버튼을 찾을 수 없습니다.');
        }
        
        // 저장 버튼 이벤트 리스너 추가
        const saveProductBtn = document.getElementById('save-product-btn');
        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', function() {
                console.log('💾 상품 저장 버튼 클릭');
                if (window.productManagementComponent && window.productManagementComponent.saveProduct) {
                    window.productManagementComponent.saveProduct();
                } else {
                    console.warn('⚠️ productManagementComponent 또는 saveProduct 함수를 찾을 수 없습니다');
                }
            });
            console.log('✅ 상품 모달 저장 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 저장 버튼을 찾을 수 없습니다.');
        }
        
        // 모달 배경 클릭 시 닫기
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    console.log('❌ 상품 모달 배경 클릭으로 닫기');
                    if (window.closeProductModal) {
                        window.closeProductModal();
                    }
                }
            });
        }
        
        console.log('✅ 상품 모달 이벤트 리스너 설정 완료');
        
        // 폼 요소 존재 여부 확인
        const requiredFormElements = [
            'product-form-name',
            'product-form-category',
            'product-form-price',
            'product-form-stock'
        ];
        
        const missingElements = requiredFormElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.error('❌ 모달 로드 후 필수 폼 요소를 찾을 수 없습니다:', missingElements);
            console.log('🔍 DOM에서 product-form 요소들 검색:', document.querySelectorAll('[id*="product-form"]'));
        } else {
            console.log('✅ 모든 필수 폼 요소 확인 완료');
        }
        
    } catch (error) {
        console.error('❌ 상품 모달 컴포넌트 로드 실패:', error);
    }
}

// 전역 함수로 등록
window.loadProductManagementComponent = loadProductManagementComponent;
window.loadProductModal = loadProductModal;
