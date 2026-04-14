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
        console.log(`🔄 직접 탭 전환 시작: ${tabName}`);
        
        // 모든 섹션 강제 숨기기 (최우선)
        this.hideAllSections();
        
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // 선택된 탭 활성화
        const targetButton = document.querySelector(`#tab-${tabName}`);
        const targetSection = document.querySelector(`#${tabName}-section`);

        if (targetButton) {
            targetButton.classList.add('active');
            console.log(`✅ 탭 버튼 활성화: ${tabName}`);
        }

        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.visibility = 'visible';
            targetSection.classList.add('active');
            console.log(`✅ 섹션 표시: ${tabName}-section`);
            
            // 대기자 관리 탭인 경우 컴포넌트 로드
            if (tabName === 'waitlist') {
                this.loadWaitlistComponent();
            }
        } else {
            console.warn(`⚠️ 대상 섹션을 찾을 수 없습니다: ${tabName}-section`);
        }
    }
    
    /**
     * 모든 섹션 강제 숨기기
     */
    hideAllSections() {
        console.log('🗑️ 모든 섹션 강제 숨기기 시작...');
        
        // 모든 가능한 섹션 선택자들
        const selectors = [
            '.section-content',
            '[id$="-section"]',
            '.tab-content',
            '.content-section',
            '#shipping-section',
            '#waitlist-section',
            '#dashboard-section',
            '#customers-section',
            '#orders-section',
            '#products-section'
        ];
        
        selectors.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            sections.forEach(section => {
                section.style.display = 'none';
                section.style.visibility = 'hidden';
                section.style.opacity = '0';
                section.classList.remove('active');
                console.log(`🗑️ 섹션 숨김: ${section.id || section.className}`);
            });
        });
        
        console.log('✅ 모든 섹션 숨기기 완료');
    }
    
    /**
     * 대기자 관리 컴포넌트 로드
     */
    async loadWaitlistComponent() {
        try {
            console.log('📋 대기자 관리 컴포넌트 로드 시작...');
            
            // DOM이 완전히 로드될 때까지 대기
            if (document.readyState !== 'complete') {
                console.log('⏳ DOM 로딩 완료 대기 중...');
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve, { once: true });
                    }
                });
            }
            
            // DOM이 로드될 때까지 대기
            let waitlistSection = document.getElementById('waitlist-section');
            let retryCount = 0;
            const maxRetries = 50; // 재시도 횟수 대폭 증가
            
            while (!waitlistSection && retryCount < maxRetries) {
                console.log(`🔍 대기자 관리 섹션 찾는 중... (${retryCount + 1}/${maxRetries})`);
                console.log(`🔍 DOM 상태: ${document.readyState}`);
                console.log(`🔍 현재 시간: ${new Date().toISOString()}`);
                
                await new Promise(resolve => setTimeout(resolve, 200)); // 대기 시간 증가
                waitlistSection = document.getElementById('waitlist-section');
                retryCount++;
            }
            
            if (!waitlistSection) {
                console.error('❌ 대기자 관리 섹션을 찾을 수 없습니다. DOM 로드 완료 후 다시 시도해주세요.');
                console.log('🔍 현재 DOM 상태 확인:', document.readyState);
                console.log('🔍 waitlist-section 요소 존재 여부:', !!document.getElementById('waitlist-section'));
                console.log('🔍 모든 section-content 요소들:', document.querySelectorAll('.section-content'));
                console.log('🔍 body의 모든 자식 요소들:', Array.from(document.body.children).map(el => el.id || el.tagName));
                return false;
            }
            
            // 이미 로드되었는지 확인
            if (waitlistSection.innerHTML.trim() !== '<!-- 대기자 관리 컴포넌트가 여기에 로드됩니다 -->') {
                console.log('📋 대기자 관리 컴포넌트가 이미 로드되었습니다.');
                return true;
            }
            
            // 대기자 관리 컴포넌트 로드
            if (window.loadWaitlistManagementComponent) {
                await window.loadWaitlistManagementComponent();
                console.log('✅ 대기자 관리 컴포넌트 로드 완료');
                
                // 컴포넌트 로드 후 대기자 데이터 새로고침
                setTimeout(() => {
                    if (window.waitlistUI && window.waitlistDataManager) {
                        console.log('🔄 대기자 데이터 새로고침');
                        const allWaitlist = window.waitlistDataManager.getAllWaitlist();
                        console.log('🔍 새로고침된 대기자 데이터:', allWaitlist.length, '개');
                        window.waitlistUI.renderWaitlistTable(allWaitlist);
                    }
                }, 200);
            } else {
                console.error('❌ loadWaitlistManagementComponent 함수를 찾을 수 없습니다.');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ 대기자 관리 컴포넌트 로드 실패:', error);
            return false;
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




