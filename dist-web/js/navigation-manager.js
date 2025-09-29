/**
 * 네비게이션 관리 모듈
 * 브라우저 뒤로가기 버튼 처리 및 PWA 내부 네비게이션 관리
 */

class NavigationManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.history = [];
        this.isInitialized = false;
        this.maxHistorySize = 10;
        
        this.init();
    }

    /**
     * 네비게이션 관리자 초기화
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🧭 네비게이션 관리자 초기화 시작...');
        
        // 현재 탭 상태 확인
        this.detectCurrentTab();
        
        // 브라우저 히스토리 이벤트 리스너 등록
        this.setupHistoryListeners();
        
        // PWA 설치 상태 확인
        this.checkPWAStatus();
        
        this.isInitialized = true;
        console.log('✅ 네비게이션 관리자 초기화 완료');
    }

    /**
     * 현재 활성 탭 감지
     */
    detectCurrentTab() {
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            this.currentTab = activeTab.getAttribute('data-tab') || 'dashboard';
            console.log(`📱 현재 탭 감지: ${this.currentTab}`);
        }
    }

    /**
     * 브라우저 히스토리 이벤트 리스너 설정
     */
    setupHistoryListeners() {
        // popstate 이벤트 (뒤로가기/앞으로가기)
        window.addEventListener('popstate', (event) => {
            console.log('🔄 브라우저 뒤로가기/앞으로가기 감지');
            this.handleBrowserNavigation(event);
        });

        // beforeunload 이벤트 (페이지 종료 전)
        window.addEventListener('beforeunload', (event) => {
            console.log('⚠️ 페이지 종료 시도 감지');
            this.handlePageUnload(event);
        });

        // 페이지 가시성 변경 (PWA에서 중요)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 앱이 백그라운드로 이동');
            } else {
                console.log('📱 앱이 포그라운드로 복귀');
                this.handleAppResume();
            }
        });
    }

    /**
     * 브라우저 네비게이션 처리
     */
    handleBrowserNavigation(event) {
        try {
            // 히스토리에서 이전 상태 복원
            if (this.history.length > 0) {
                const previousState = this.history.pop();
                this.navigateToTab(previousState.tab, false); // 히스토리에 추가하지 않음
                console.log(`🔄 이전 탭으로 복원: ${previousState.tab}`);
            } else {
                // 히스토리가 없으면 대시보드로 이동
                this.navigateToTab('dashboard', false);
                console.log('🔄 히스토리 없음 - 대시보드로 이동');
            }
        } catch (error) {
            console.error('❌ 브라우저 네비게이션 처리 실패:', error);
            // 오류 시 대시보드로 이동
            this.navigateToTab('dashboard', false);
        }
    }

    /**
     * 페이지 종료 처리
     */
    handlePageUnload(event) {
        // PWA에서는 완전 종료를 방지
        if (this.isPWA()) {
            event.preventDefault();
            console.log('📱 PWA 종료 방지 - 앱 내부로 유지');
            
            // 대시보드로 이동
            this.navigateToTab('dashboard', false);
            
            return false;
        }
    }

    /**
     * 앱 복귀 처리
     */
    handleAppResume() {
        // 앱이 포그라운드로 돌아올 때 상태 복원
        this.detectCurrentTab();
        console.log(`📱 앱 복귀 - 현재 탭: ${this.currentTab}`);
    }

    /**
     * 탭 네비게이션
     */
    navigateToTab(tabName, addToHistory = true) {
        try {
            // 현재 탭을 히스토리에 추가
            if (addToHistory && this.currentTab !== tabName) {
                this.addToHistory(this.currentTab);
            }

            // 탭 전환
            this.switchTab(tabName);
            
            // 브라우저 히스토리에 상태 추가
            if (addToHistory) {
                this.pushBrowserHistory(tabName);
            }

            console.log(`🧭 탭 이동: ${this.currentTab} → ${tabName}`);
        } catch (error) {
            console.error('❌ 탭 네비게이션 실패:', error);
        }
    }

    /**
     * 실제 탭 전환
     */
    switchTab(tabName) {
        // 기존 orderSystem의 switchTab 메서드 사용
        if (window.orderSystem && typeof window.orderSystem.switchTab === 'function') {
            window.orderSystem.switchTab(tabName);
        } else {
            // 폴백: 직접 탭 전환
            this.directTabSwitch(tabName);
        }
        
        this.currentTab = tabName;
    }

    /**
     * 직접 탭 전환 (폴백)
     */
    directTabSwitch(tabName) {
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // 모든 섹션 숨기기
        document.querySelectorAll('.tab-section').forEach(section => {
            section.style.display = 'none';
        });

        // 선택된 탭 활성화
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetSection = document.querySelector(`#${tabName}-section`);

        if (targetButton) {
            targetButton.classList.add('active');
        }

        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    /**
     * 히스토리에 상태 추가
     */
    addToHistory(tabName) {
        if (this.history.length >= this.maxHistorySize) {
            this.history.shift(); // 오래된 항목 제거
        }
        
        this.history.push({
            tab: tabName,
            timestamp: Date.now()
        });
        
        console.log(`📚 히스토리 추가: ${tabName} (총 ${this.history.length}개)`);
    }

    /**
     * 브라우저 히스토리에 상태 추가
     */
    pushBrowserHistory(tabName) {
        const state = { tab: tabName, timestamp: Date.now() };
        const url = `${window.location.pathname}#${tabName}`;
        
        history.pushState(state, '', url);
        console.log(`🌐 브라우저 히스토리 추가: ${tabName}`);
    }

    /**
     * PWA 상태 확인
     */
    checkPWAStatus() {
        // PWA 설치 여부 확인
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 PWA 모드 감지 - 네비게이션 보호 활성화');
            this.isPWA = () => true;
        } else {
            console.log('🌐 일반 브라우저 모드');
            this.isPWA = () => false;
        }
    }

    /**
     * PWA 여부 확인
     */
    isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    /**
     * 뒤로가기 버튼 처리
     */
    goBack() {
        if (this.history.length > 0) {
            const previousTab = this.history.pop();
            this.navigateToTab(previousTab.tab, false);
            console.log(`⬅️ 뒤로가기: ${previousTab.tab}`);
        } else {
            // 히스토리가 없으면 대시보드로
            this.navigateToTab('dashboard', false);
            console.log('⬅️ 뒤로가기: 대시보드로 이동');
        }
    }

    /**
     * 히스토리 초기화
     */
    clearHistory() {
        this.history = [];
        console.log('🗑️ 네비게이션 히스토리 초기화');
    }

    /**
     * 현재 상태 정보
     */
    getStatus() {
        return {
            currentTab: this.currentTab,
            historyLength: this.history.length,
            isPWA: this.isPWA(),
            isInitialized: this.isInitialized
        };
    }
}

// 전역 인스턴스 생성
window.navigationManager = new NavigationManager();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 약간의 지연 후 초기화 (다른 스크립트 로딩 대기)
    setTimeout(() => {
        window.navigationManager.init();
    }, 1000);
});

console.log('🧭 네비게이션 관리 모듈 로드 완료');




