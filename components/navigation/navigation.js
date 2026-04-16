/**
 * Navigation 컴포넌트 스크립트
 * 경산다육식물농장 관리시스템
 */

class NavigationComponent {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'dashboard';
        this.settingsMenuOpen = false;
        this.historyEnabled = false;
    }

    /**
     * 컴포넌트 초기화
     */
    init(container, data = {}) {
        if (this.isInitialized) return;
        
        console.log('🏗️ Navigation 컴포넌트 초기화...');
        
        this.setupEventListeners();
        this.setupSettingsMenu();
        this.setupMobileNavigation();
        this.setupHistoryManagement();
        // setupHistoryManagement may have already set currentTab via handleTabChange
        // use currentTab so we don't override a URL-hash-based tab restore
        this.setActiveTab(data.activeTab || this.currentTab);
        
        this.isInitialized = true;
        console.log('✅ Navigation 컴포넌트 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 데스크톱 네비게이션
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.id.replace('nav-', '');
                this.handleTabChange(tabId);
            });
        });

        // 모바일 네비게이션
        const mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
        mobileNavButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.id.replace('mobile-nav-', '');
                this.handleTabChange(tabId);
            });
        });
    }

    /**
     * 설정 메뉴 설정
     */
    setupSettingsMenu() {
        const settingsDropdown = document.getElementById('settings-dropdown');
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');

        if (settingsDropdown && settingsMenu && settingsChevron) {
            settingsDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSettingsMenu();
            });

            // 외부 클릭 시 메뉴 닫기
            document.addEventListener('click', (e) => {
                if (!settingsDropdown.contains(e.target) && !settingsMenu.contains(e.target)) {
                    this.closeSettingsMenu();
                }
            });
        }

        // 설정 메뉴 항목들
        const settingsItems = document.querySelectorAll('#settings-menu button');
        settingsItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.id.replace('settings-', '');
                this.handleSettingsAction(action);
                this.closeSettingsMenu();
            });
        });
    }

    /**
     * 모바일 네비게이션 설정
     */
    setupMobileNavigation() {
        const mobileSettingsToggle = document.getElementById('mobile-settings-toggle');
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsClose = document.getElementById('mobile-settings-close');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');

        if (mobileSettingsToggle && mobileSettingsSheet) {
            mobileSettingsToggle.addEventListener('click', () => {
                this.showMobileSettings();
            });
        }

        if (mobileSettingsClose && mobileSettingsSheet) {
            mobileSettingsClose.addEventListener('click', () => {
                this.hideMobileSettings();
            });
        }

        if (mobileSettingsSheet) {
            mobileSettingsSheet.addEventListener('click', (e) => {
                if (e.target === mobileSettingsSheet) {
                    this.hideMobileSettings();
                }
            });
        }

        // 모바일 설정 항목들
        const mobileSettingsItems = document.querySelectorAll('#mobile-settings-content button');
        mobileSettingsItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.id.replace('mobile-settings-', '');
                this.handleSettingsAction(action);
                this.hideMobileSettings();
            });
        });
    }

    /**
     * 탭 변경 처리
     */
    handleTabChange(tabId, fromHistory = false) {
        console.log(`🔄 탭 변경: ${this.currentTab} → ${tabId}`);
        
        try {
            // 이전 탭 비활성화
            this.setActiveTab(tabId);
            
            // 메인 HTML의 switchTab 함수 호출
            if (window.switchTab) {
                window.switchTab(tabId);
            } else {
                console.warn('⚠️ switchTab 함수를 찾을 수 없습니다.');
                // 폴백: 직접 섹션 전환
                this.directSectionSwitch(tabId);
            }
            
            // 탭 변경 이벤트 발생
            const event = new CustomEvent('tabChanged', {
                detail: { 
                    previousTab: this.currentTab, 
                    currentTab: tabId 
                }
            });
            document.dispatchEvent(event);
            
            this.currentTab = tabId;
            
            // 히스토리에 추가 (뒤로가기에서 온 경우 제외)
            if (!fromHistory) {
                this.pushHistory(tabId);
            }
        } catch (error) {
            console.error('❌ 탭 변경 실패:', error);
            // 최종 폴백: 대시보드로 전환
            this.handleTabChange('dashboard');
        }
    }
    
    /**
     * 직접 섹션 전환 (폴백)
     */
    directSectionSwitch(tabId) {
        console.log(`🔄 직접 섹션 전환: ${tabId}`);
        
        // 모든 섹션 숨기기
        const allSections = document.querySelectorAll('[id$="-section"], .tab-content');
        allSections.forEach(section => {
            section.classList.add('hidden');
            section.style.display = 'none';
            section.style.visibility = 'hidden';
        });
        
        // 선택된 섹션 표시
        const targetSection = document.getElementById(`${tabId}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.style.display = 'block';
            targetSection.style.visibility = 'visible';
            console.log(`✅ 섹션 전환 완료: ${tabId}`);
        } else {
            console.error(`❌ 섹션을 찾을 수 없습니다: ${tabId}-section`);
            // 대시보드로 폴백
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection) {
                dashboardSection.classList.remove('hidden');
                dashboardSection.style.display = 'block';
                dashboardSection.style.visibility = 'visible';
            }
        }
    }

    /**
     * 활성 탭 설정 (선택된 메뉴만 에메랄드 블록 + 흰색 글자)
     */
    setActiveTab(tabId) {
        document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-emerald-600', 'text-white', 'rounded-lg', 'text-heading', 'text-body');
        });

        const activeButton = document.getElementById(`nav-${tabId}`);
        const activeMobileButton = document.getElementById(`mobile-nav-${tabId}`);

        if (activeButton) {
            activeButton.classList.add('active');
        }
        if (activeMobileButton) {
            activeMobileButton.classList.add('active');
        }
    }

    /**
     * 설정 메뉴 토글
     */
    toggleSettingsMenu() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        if (settingsMenu && settingsChevron) {
            this.settingsMenuOpen = !this.settingsMenuOpen;
            
            if (this.settingsMenuOpen) {
                settingsMenu.classList.remove('hidden');
                settingsChevron.style.transform = 'rotate(180deg)';
            } else {
                settingsMenu.classList.add('hidden');
                settingsChevron.style.transform = 'rotate(0deg)';
            }
        }
    }

    /**
     * 설정 메뉴 닫기
     */
    closeSettingsMenu() {
        const settingsMenu = document.getElementById('settings-menu');
        const settingsChevron = document.getElementById('settings-chevron');
        
        if (settingsMenu && settingsChevron) {
            settingsMenu.classList.add('hidden');
            settingsChevron.style.transform = 'rotate(0deg)';
            this.settingsMenuOpen = false;
        }
    }

    /**
     * 모바일 설정 표시
     */
    showMobileSettings() {
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        
        if (mobileSettingsSheet && mobileSettingsContent) {
            mobileSettingsSheet.classList.remove('hidden');
            setTimeout(() => {
                mobileSettingsContent.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    /**
     * 모바일 설정 숨기기
     */
    hideMobileSettings() {
        const mobileSettingsSheet = document.getElementById('mobile-settings-sheet');
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        
        if (mobileSettingsSheet && mobileSettingsContent) {
            mobileSettingsContent.style.transform = 'translateY(100%)';
            setTimeout(() => {
                mobileSettingsSheet.classList.add('hidden');
            }, 300);
        }
    }

    /**
     * 설정 액션 처리
     */
    handleSettingsAction(action) {
        console.log(`⚙️ 설정 액션: ${action}`);
        
        const actionMap = {
            'general': () => this.openGeneralSettings(),
            'shipping': () => this.openShippingSettings(),
            'notifications': () => this.openNotificationSettings(),
            'export': () => this.exportData(),
            'import': () => this.importData()
        };

        const handler = actionMap[action];
        if (handler) {
            handler();
        }
    }

    /**
     * 일반 설정 열기
     */
    openGeneralSettings() {
        console.log('⚙️ 일반 설정 열기');
        // TODO: 일반 설정 모달 구현
    }

    /**
     * 배송 설정 열기
     */
    openShippingSettings() {
        console.log('🚚 배송 설정 열기');
        // TODO: 배송 설정 모달 구현
    }

    /**
     * 알림 설정 열기
     */
    openNotificationSettings() {
        console.log('🔔 알림 설정 열기');
        // TODO: 알림 설정 모달 구현
    }

    /**
     * 데이터 내보내기
     */
    exportData() {
        console.log('📤 데이터 내보내기');
        // TODO: 데이터 내보내기 기능 구현
    }

    /**
     * 데이터 가져오기
     */
    importData() {
        console.log('📥 데이터 가져오기');
        // TODO: 데이터 가져오기 기능 구현
    }

    /**
     * 히스토리 관리 설정
     */
    setupHistoryManagement() {
        console.log('📚 히스토리 관리 설정...');
        
        // URL 해시 변경 감지
        window.addEventListener('popstate', (e) => {
            console.log('⬅️ 뒤로가기 감지:', e.state);
            
            if (e.state && e.state.tab) {
                // 히스토리에서 탭 복원
                this.handleTabChange(e.state.tab, true);
            } else {
                // 기본 해시 확인
                const hash = window.location.hash.slice(1) || 'dashboard';
                this.handleTabChange(hash, true);
            }
        });
        
        // 초기 히스토리 상태 설정 — 항상 대시보드로 시작
        history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
        
        this.historyEnabled = true;
        console.log('✅ 히스토리 관리 활성화');
    }

    /**
     * 히스토리에 탭 추가
     */
    pushHistory(tabId) {
        if (!this.historyEnabled) return;
        
        console.log(`📚 히스토리 추가: ${tabId}`);
        
        // URL 해시 업데이트 및 히스토리에 추가
        const url = `#${tabId}`;
        history.pushState({ tab: tabId }, '', url);
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        console.log('🗑️ Navigation 컴포넌트 제거...');
        this.isInitialized = false;
        this.historyEnabled = false;
    }
}

// 전역 클래스 등록
window.NavigationComponent = NavigationComponent;

// 컴포넌트 등록
if (window.componentLoader) {
    window.componentLoader.registerComponent('navigation', {
        template: 'components/navigation/navigation.html',
        script: 'components/navigation/navigation.js',
        init: (container, data) => {
            const navigationComponent = new NavigationComponent();
            navigationComponent.init(container, data);
            return navigationComponent;
        }
    });
}

console.log('✅ Navigation 컴포넌트 스크립트 로드 완료');
