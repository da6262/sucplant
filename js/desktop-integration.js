// 데스크톱 Electron 통합 기능
// Electron 환경에서만 실행되는 기능들

class DesktopIntegration {
    constructor() {
        this.isElectron = typeof require !== 'undefined';
        this.ipcRenderer = null;
        
        if (this.isElectron) {
            try {
                this.ipcRenderer = require('electron').ipcRenderer;
                this.initializeDesktopFeatures();
            } catch (error) {
                console.warn('Electron IPC 초기화 실패:', error);
            }
        }
        
        this.setupAutoSave();
    }

    // 데스크톱 기능 초기화
    initializeDesktopFeatures() {
        console.log('🖥️ 데스크톱 모드 활성화');
        
        // 시스템 알림 지원
        this.setupNotifications();
        
        // 파일 처리 지원
        this.setupFileHandling();
        
        // 단축키 처리
        this.setupShortcuts();
        
        // 상태 모니터링
        this.setupStatusMonitoring();
    }

    // 시스템 알림 설정
    setupNotifications() {
        if (!this.isElectron) return;

        // 기존 showToast 함수 확장
        const originalShowToast = window.orderSystem?.showToast;
        if (originalShowToast) {
            window.orderSystem.showToast = (message, duration = 3000, type = 'info') => {
                // 웹 토스트 표시
                originalShowToast.call(window.orderSystem, message, duration, type);
                
                // 데스크톱 알림도 표시
                this.showDesktopNotification('경산다육식물농장', message);
            };
        }
    }

    // 데스크톱 알림 표시
    async showDesktopNotification(title, body) {
        if (this.ipcRenderer) {
            try {
                await this.ipcRenderer.invoke('show-notification', title, body);
            } catch (error) {
                console.warn('데스크톱 알림 표시 실패:', error);
            }
        }
    }

    // 파일 처리 설정
    setupFileHandling() {
        // 드래그 앤 드롭으로 데이터 가져오기
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = Array.from(e.dataTransfer.files);
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            if (jsonFiles.length > 0) {
                await this.handleDroppedFiles(jsonFiles);
            }
        });
    }

    // 드롭된 파일 처리
    async handleDroppedFiles(files) {
        for (const file of files) {
            try {
                const content = await this.readFileContent(file);
                const data = JSON.parse(content);
                
                // 데이터 유효성 검증
                if (this.isValidBackupData(data)) {
                    const confirmImport = confirm(`"${file.name}" 파일을 가져오시겠습니까?\n기존 데이터가 덮어쓰여집니다.`);
                    
                    if (confirmImport) {
                        await this.importBackupData(data);
                        window.orderSystem?.showToast(`✅ ${file.name} 데이터를 성공적으로 가져왔습니다!`);
                    }
                } else {
                    alert(`"${file.name}"은(는) 올바른 백업 파일이 아닙니다.`);
                }
            } catch (error) {
                console.error('파일 처리 오류:', error);
                alert(`"${file.name}" 파일 처리 중 오류가 발생했습니다.`);
            }
        }
    }

    // 파일 내용 읽기
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // 백업 데이터 유효성 검증
    isValidBackupData(data) {
        return data && (
            Array.isArray(data.customers) ||
            Array.isArray(data.orders) ||
            Array.isArray(data.products) ||
            Array.isArray(data.waitlist)
        );
    }

    // 백업 데이터 가져오기
    async importBackupData(data) {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        // 데이터 복원
        if (data.customers) orderSystem.customers = data.customers;
        if (data.orders) orderSystem.orders = data.orders;
        if (data.products) orderSystem.products = data.products;
        if (data.waitlist) orderSystem.waitlist = data.waitlist;
        if (data.categories) orderSystem.categories = data.categories;
        if (data.orderSources) orderSystem.orderSources = data.orderSources;

        // LocalStorage에 저장
        orderSystem.saveToLocalStorage('farm_customers', orderSystem.customers);
        orderSystem.saveToLocalStorage('orders', orderSystem.orders);
        orderSystem.saveToLocalStorage('products', orderSystem.products);
        orderSystem.saveToLocalStorage('waitlist', orderSystem.waitlist);
        orderSystem.saveToLocalStorage('categories', orderSystem.categories);
        orderSystem.saveToLocalStorage('order_sources', orderSystem.orderSources);

        // UI 새로고침
        orderSystem.renderOrdersTable();
        orderSystem.renderCustomersTable();
        orderSystem.renderProductsTable();
        orderSystem.renderWaitlistTable();
        
        // 카운트 업데이트
        this.updateDataCounts();
    }

    // 단축키 설정
    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 키 조합 처리
            if (e.ctrlKey || e.metaKey) {
                this.handleShortcut(e);
            }
            
            // 기능키 처리
            if (e.key.startsWith('F')) {
                this.handleFunctionKey(e);
            }
        });
    }

    // 단축키 처리
    handleShortcut(e) {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        switch(e.key.toLowerCase()) {
            case 'n': // Ctrl+N - 새 주문
                e.preventDefault();
                if (orderSystem.currentTab === 'orders') {
                    orderSystem.openOrderModal();
                } else if (orderSystem.currentTab === 'farm_customers') {
                    orderSystem.openCustomerModal();
                } else if (orderSystem.currentTab === 'products') {
                    orderSystem.openProductModal();
                }
                break;
                
            case 's': // Ctrl+S - 저장 (자동 저장 트리거)
                e.preventDefault();
                this.saveAllData();
                orderSystem.showToast('💾 모든 데이터가 저장되었습니다.');
                break;
                
            case 'f': // Ctrl+F - 검색 포커스
                e.preventDefault();
                this.focusSearchInput();
                break;
                
            case 'r': // Ctrl+R - 새로고침
                e.preventDefault();
                this.refreshCurrentTab();
                break;
                
            case 'p': // Ctrl+P - 출력
                e.preventDefault();
                this.handlePrint();
                break;
        }
    }

    // 기능키 처리
    handleFunctionKey(e) {
        switch(e.key) {
            case 'F1': // 도움말
                e.preventDefault();
                this.showHelp();
                break;
                
            case 'F5': // 새로고침
                e.preventDefault();
                this.refreshCurrentTab();
                break;
                
            case 'F9': // 빠른 백업
                e.preventDefault();
                this.quickBackup();
                break;
        }
    }

    // 모든 데이터 저장
    saveAllData() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        // 각 데이터 타입별로 저장
        orderSystem.saveToLocalStorage('farm_customers', orderSystem.customers);
        orderSystem.saveToLocalStorage('orders', orderSystem.orders);
        orderSystem.saveToLocalStorage('products', orderSystem.products);
        orderSystem.saveToLocalStorage('waitlist', orderSystem.waitlist);
        orderSystem.saveToLocalStorage('categories', orderSystem.categories);
        orderSystem.saveToLocalStorage('order_sources', orderSystem.orderSources);

        // 마지막 저장 시간 업데이트
        this.updateLastSavedTime();
    }

    // 검색 입력 포커스
    focusSearchInput() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        const currentTab = orderSystem.currentTab;
        let searchInput = null;

        switch(currentTab) {
            case 'orders':
                searchInput = document.getElementById('order-search');
                break;
            case 'farm_customers':
                searchInput = document.getElementById('customer-search');
                break;
            case 'products':
                searchInput = document.getElementById('product-management-search');
                break;
            case 'waitlist':
                searchInput = document.getElementById('waitlist-search');
                break;
        }

        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // 현재 탭 새로고침
    refreshCurrentTab() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        switch(orderSystem.currentTab) {
            case 'orders':
                orderSystem.renderOrdersTable();
                break;
            case 'farm_customers':
                orderSystem.renderCustomersTable();
                break;
            case 'products':
                orderSystem.renderProductsTable();
                break;
            case 'waitlist':
                orderSystem.renderWaitlistTable();
                break;
            case 'shipping':
                orderSystem.renderShippingTable();
                break;
        }

        orderSystem.showToast('🔄 현재 탭이 새로고침되었습니다.');
    }

    // 출력 처리
    handlePrint() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        if (orderSystem.currentTab === 'shipping') {
            // 배송관리에서는 피킹/포장 리스트 출력
            const hasOrders = orderSystem.orders && orderSystem.orders.length > 0;
            if (hasOrders) {
                orderSystem.generatePickingList();
            } else {
                orderSystem.showToast('⚠️ 출력할 주문이 없습니다.');
            }
        } else {
            // 일반 페이지 출력
            window.print();
        }
    }

    // 빠른 백업
    async quickBackup() {
        if (this.ipcRenderer) {
            try {
                const result = await this.ipcRenderer.invoke('export-data');
                if (result.success) {
                    window.orderSystem?.showToast('✅ 데이터 백업이 완료되었습니다!');
                }
            } catch (error) {
                console.error('빠른 백업 오류:', error);
                window.orderSystem?.showToast('❌ 백업 중 오류가 발생했습니다.');
            }
        }
    }

    // 도움말 표시
    showHelp() {
        const helpContent = `
🌱 경산다육식물농장 관리시스템 도움말

📋 주요 기능:
• 주문관리: 주문 등록, 수정, 상태 변경
• 고객관리: 고객 정보, 등급 관리  
• 상품관리: White Platter 재고 관리
• 대기자관리: 희귀종 대기자 목록
• 배송관리: 피킹&포장 리스트

⌨️ 단축키:
• Ctrl+1~5: 탭 전환
• Ctrl+N: 새 항목 추가
• Ctrl+S: 저장
• Ctrl+F: 검색
• Ctrl+P: 출력
• Ctrl+B: 백업
• F1: 도움말
• F5: 새로고침
• F9: 빠른 백업

💾 데이터 관리:
• 자동 저장: 30초마다
• 백업: Ctrl+B 또는 파일 메뉴
• 가져오기: 파일을 드래그하여 드롭

🔒 보안:
• 모든 데이터는 로컬에만 저장
• 외부 서버 연결 없음
• 완전한 오프라인 작동
        `;

        alert(helpContent);
    }

    // 상태 모니터링 설정
    setupStatusMonitoring() {
        // 데이터 변경 감지
        this.setupDataChangeDetection();
        
        // 성능 모니터링
        this.setupPerformanceMonitoring();
        
        // 주기적 상태 업데이트
        setInterval(() => {
            this.updateSystemStatus();
        }, 5000);
    }

    // 데이터 변경 감지
    setupDataChangeDetection() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        // 원본 함수들을 래핑하여 변경 감지
        const originalSaveToLocalStorage = orderSystem.saveToLocalStorage;
        orderSystem.saveToLocalStorage = (key, data) => {
            originalSaveToLocalStorage.call(orderSystem, key, data);
            this.updateLastSavedTime();
            this.updateDataCounts();
        };
    }

    // 성능 모니터링
    setupPerformanceMonitoring() {
        // 메모리 사용량 모니터링 (개발 모드에서만)
        if (process.env.NODE_ENV === 'development') {
            setInterval(() => {
                if (performance.memory) {
                    const memory = performance.memory;
                    console.log('메모리 사용량:', {
                        used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                        total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
                        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
                    });
                }
            }, 30000);
        }
    }

    // 시스템 상태 업데이트
    updateSystemStatus() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        // 데이터 카운트 업데이트
        this.updateDataCounts();
        
        // 상태 텍스트 업데이트
        const statusElement = document.getElementById('status-text');
        if (statusElement) {
            const totalRecords = (orderSystem.customers?.length || 0) + 
                                (orderSystem.orders?.length || 0) + 
                                (orderSystem.products?.length || 0);
            statusElement.textContent = `${totalRecords}개 항목 관리 중`;
        }
    }

    // 데이터 카운트 업데이트
    updateDataCounts() {
        const orderSystem = window.orderSystem;
        if (!orderSystem) return;

        // 각 탭의 카운트 업데이트
        const counts = {
            'orders-count': orderSystem.orders?.length || 0,
            'customers-count': orderSystem.customers?.length || 0,
            'products-count': orderSystem.products?.length || 0,
            'waitlist-count': orderSystem.waitlist?.length || 0,
            'shipping-count': orderSystem.orders?.filter(o => 
                ['배송준비', '배송시작'].includes(o.order_status)).length || 0
        };

        Object.entries(counts).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = count;
            }
        });
    }

    // 마지막 저장 시간 업데이트
    updateLastSavedTime() {
        const element = document.getElementById('last-saved');
        if (element) {
            element.textContent = new Date().toLocaleTimeString('ko-KR');
        }
    }

    // 자동 저장 설정
    setupAutoSave() {
        // 30초마다 자동 저장
        setInterval(() => {
            this.saveAllData();
        }, 30000);

        // 페이지 종료 시 저장
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
    }
}

// 전역 데스크톱 통합 객체 생성
window.desktopIntegration = new DesktopIntegration();

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖥️ 데스크톱 통합 기능 초기화 완료');
    
    // 초기 데이터 카운트 업데이트
    setTimeout(() => {
        window.desktopIntegration?.updateDataCounts();
    }, 1000);
});