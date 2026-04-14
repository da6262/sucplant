// 대시보드 컴포넌트 동적 로드 함수
async function loadDashboardComponent() {
    try {
        console.log('🔄 대시보드 컴포넌트 로드 중...');
        
        // 기존 대시보드 섹션이 있으면 제거
        const existingSection = document.getElementById('dashboard-section');
        if (existingSection) {
            console.log('🗑️ 기존 대시보드 섹션 제거');
            existingSection.remove();
        }
        
        // 다른 섹션들은 제거하지 않음 (화면 전환을 위해 유지)
        console.log('📋 다른 섹션들은 화면 전환을 위해 유지');
        
        // 추가로 다른 섹션들도 제거
        const orderSection = document.getElementById('orders-section');
        if (orderSection) {
            console.log('🗑️ 주문관리 섹션 제거');
            orderSection.remove();
        }
        
        const customerSection = document.getElementById('customers-section');
        if (customerSection) {
            console.log('🗑️ 고객관리 섹션 제거');
            customerSection.remove();
        }
        
        const productSection = document.getElementById('products-section');
        if (productSection) {
            console.log('🗑️ 상품관리 섹션 제거');
            productSection.remove();
        }
        
        const shippingSection = document.getElementById('shipping-section');
        if (shippingSection) {
            console.log('🗑️ 배송관리 섹션 제거');
            shippingSection.remove();
        }
        
        const waitlistSection = document.getElementById('waitlist-section');
        if (waitlistSection) {
            console.log('🗑️ 대기자관리 섹션 제거');
            waitlistSection.remove();
        }
        
        // 메인 콘텐츠 확인
        const mainContent = document.getElementById('mainContent');
        console.log('🔍 메인 콘텐츠 요소:', mainContent);
        
        if (!mainContent) {
            throw new Error('메인 콘텐츠 영역을 찾을 수 없습니다.');
        }
        
        // 컴포넌트 로드
        console.log('🌐 컴포넌트 파일 요청 중...');
        const response = await fetch('components/dashboard/dashboard.html');
        console.log('📡 응답 상태:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('📄 HTML 로드 완료, 길이:', html.length);
        
        // HTML을 직접 메인 콘텐츠에 삽입
        mainContent.insertAdjacentHTML('beforeend', html);
        console.log('📝 HTML 삽입 완료');
        
            // 삽입된 섹션을 활성화
            const newSection = document.getElementById('dashboard-section');
            if (newSection) {
                // 다른 모든 섹션 숨기기
                document.querySelectorAll('.section-content').forEach(section => {
                    section.classList.remove('active');
                });
                
                // 대시보드 섹션만 활성화
                newSection.classList.add('active');
                
                // 대시보드 탭 버튼 활성화
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                const dashboardTab = document.getElementById('tab-dashboard');
                if (dashboardTab) {
                    dashboardTab.classList.add('active');
                }
                
                // 모바일 탭 버튼도 활성화
                document.querySelectorAll('.mobile-tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                const mobileDashboardTab = document.getElementById('mobile-tab-dashboard');
                if (mobileDashboardTab) {
                    mobileDashboardTab.classList.add('active');
                }
                
                console.log('✅ 대시보드 컴포넌트 로드 완료');
            
            // 로드 완료 후 추가 초기화
            setTimeout(async () => {
                console.log('🔄 대시보드 초기화 시작');
                
                // 대시보드 이벤트 리스너 연결
                attachDashboardEventListeners();
                
                // 대시보드 데이터 초기화
                if (window.dashboardDataManager) {
                    console.log('📊 대시보드 데이터 로드 중...');
                    await window.dashboardDataManager.loadDashboardData();
                } else {
                    console.warn('⚠️ dashboardDataManager를 찾을 수 없습니다');
                }
                
                console.log('✅ 대시보드 초기화 완료');
            }, 100);
        } else {
            throw new Error('대시보드 섹션을 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 대시보드 컴포넌트 로드 실패:', error);
        console.error('❌ 오류 상세:', error.stack);
        alert('대시보드 화면을 로드할 수 없습니다: ' + error.message);
    }
}

// 대시보드 이벤트 리스너 연결 함수
function attachDashboardEventListeners() {
    try {
        console.log('🔗 대시보드 이벤트 리스너 연결 시작...');
        
        // 새로고침 버튼
        const refreshRealtimeBtn = document.getElementById('refresh-realtime');
        if (refreshRealtimeBtn) {
            refreshRealtimeBtn.addEventListener('click', function() {
                console.log('🔄 실시간 데이터 새로고침');
                if (window.dashboardDataManager && window.dashboardDataManager.refreshDashboard) {
                    window.dashboardDataManager.refreshDashboard();
                }
            });
            console.log('✅ 새로고침 버튼 이벤트 리스너 연결 완료');
        }
        
        // 탭 이동 헬퍼 (mobile-nav-* 또는 nav-* 클릭)
        function goToTab(name) {
            const btn = document.getElementById('mobile-nav-' + name) || document.getElementById('nav-' + name);
            if (btn) btn.click();
        }

        // 빠른 업무 버튼들
        const quickNewOrderBtn = document.getElementById('quick-new-order');
        if (quickNewOrderBtn) {
            quickNewOrderBtn.addEventListener('click', function() {
                goToTab('orders');
                setTimeout(() => { if (window.openOrderModal) window.openOrderModal(); }, 400);
            });
        }

        const quickPickingListBtn = document.getElementById('quick-picking-list');
        if (quickPickingListBtn) {
            quickPickingListBtn.addEventListener('click', function() {
                goToTab('orders');
            });
        }

        const quickPackagingLabelsBtn = document.getElementById('quick-packaging-labels');
        if (quickPackagingLabelsBtn) {
            quickPackagingLabelsBtn.addEventListener('click', function() {
                goToTab('orders');
            });
        }

        const quickNewCustomerBtn = document.getElementById('quick-new-customer');
        if (quickNewCustomerBtn) {
            quickNewCustomerBtn.addEventListener('click', function() {
                goToTab('customers');
                setTimeout(() => { if (window.openCustomerModal) window.openCustomerModal(); }, 400);
            });
        }

        const quickStockUpdateBtn = document.getElementById('quick-stock-update');
        if (quickStockUpdateBtn) {
            quickStockUpdateBtn.addEventListener('click', function() {
                goToTab('products');
            });
        }

        const quickAddWaitlistBtn = document.getElementById('quick-add-waitlist');
        if (quickAddWaitlistBtn) {
            quickAddWaitlistBtn.addEventListener('click', function() {
                goToTab('waitlist');
                setTimeout(() => { if (window.orderSystem && window.orderSystem.openWaitlistModal) window.orderSystem.openWaitlistModal(); }, 400);
            });
        }

        const quickExcelExportBtn = document.getElementById('quick-excel-export');
        if (quickExcelExportBtn) {
            quickExcelExportBtn.addEventListener('click', function() {
                if (window.exportToExcel) window.exportToExcel();
            });
        }
        
        // 핵심 업무 카드 클릭 이벤트
        const packOrdersCard = document.getElementById('pack-orders-card');
        if (packOrdersCard) {
            packOrdersCard.addEventListener('click', function() {
                console.log('📦 포장할 주문 카드 클릭');
                // 주문관리 탭으로 이동하고 포장 상태 필터 적용
                const ordersTab = document.getElementById('tab-orders');
                if (ordersTab) {
                    ordersTab.click();
                }
            });
        }
        
        const shipOrdersCard = document.getElementById('ship-orders-card');
        if (shipOrdersCard) {
            shipOrdersCard.addEventListener('click', function() {
                console.log('🚚 오늘 보낼 택배 카드 클릭');
                // 주문관리 탭으로 이동하고 배송준비 상태 필터 적용
                const ordersTab = document.getElementById('tab-orders');
                if (ordersTab) {
                    ordersTab.click();
                }
            });
        }
        
        const lowStockCard = document.getElementById('low-stock-card');
        if (lowStockCard) {
            lowStockCard.addEventListener('click', function() {
                console.log('⚠️ 재고 부족 상품 카드 클릭');
                // 상품관리 탭으로 이동하고 재고 부족 필터 적용
                const productsTab = document.getElementById('tab-products');
                if (productsTab) {
                    productsTab.click();
                }
            });
        }
        
        const contactWaitlistCard = document.getElementById('contact-waitlist-card');
        if (contactWaitlistCard) {
            contactWaitlistCard.addEventListener('click', function() {
                console.log('📞 연락할 대기자 카드 클릭');
                // 대기자관리 탭으로 이동
                const waitlistTab = document.getElementById('tab-waitlist');
                if (waitlistTab) {
                    waitlistTab.click();
                }
            });
        }
        
        const newCustomersCard = document.getElementById('new-customers-card');
        if (newCustomersCard) {
            newCustomersCard.addEventListener('click', function() {
                console.log('👥 신규 고객 카드 클릭');
                // 고객관리 탭으로 이동
                const customersTab = document.getElementById('tab-customers');
                if (customersTab) {
                    customersTab.click();
                }
            });
        }
        
        console.log('🔗 대시보드 이벤트 리스너 연결 완료');
        
    } catch (error) {
        console.error('❌ 대시보드 이벤트 리스너 연결 실패:', error);
    }
}

// 전역 함수로 등록
window.loadDashboardComponent = loadDashboardComponent;
window.attachDashboardEventListeners = attachDashboardEventListeners;
