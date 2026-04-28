/**
 * Header 컴포넌트 스크립트
 * 경산다육식물농장 관리시스템
 */

class HeaderComponent {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * 컴포넌트 초기화
     */
    init(container, data = {}) {
        if (this.isInitialized) return;
        
        console.log('🏗️ Header 컴포넌트 초기화...');
        
        // DOM이 준비된 후 이벤트 리스너 설정
        setTimeout(() => {
            this.setupEventListeners();
            console.log('✅ Header 이벤트 리스너 설정 완료');
        }, 100);
        
        this.updateUserInfo(data.userInfo);
        this.updateApiStatus(data.apiStatus);
        this.updateVersionBadge();

        this.isInitialized = true;
        console.log('✅ Header 컴포넌트 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새로고침 버튼
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleRefresh();
            });
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 관리자 메뉴 버튼
        const adminMenuBtn = document.getElementById('admin-menu-btn');
        const adminDropdown = document.getElementById('admin-dropdown');
        console.log('🔍 관리자 메뉴 버튼 요소:', adminMenuBtn);
        console.log('🔍 드롭다운 요소:', adminDropdown);
        
        if (adminMenuBtn && adminDropdown) {
            console.log('✅ 관리자 메뉴 이벤트 리스너 설정 중...');
            
            adminMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('🖱️ 관리자 메뉴 버튼 클릭됨');
                adminDropdown.classList.toggle('hidden');
            });

            // 드롭다운 외부 클릭 시 닫기
            document.addEventListener('click', () => {
                if (!adminDropdown.classList.contains('hidden')) {
                    adminDropdown.classList.add('hidden');
                }
            });
            
            console.log('✅ 관리자 메뉴 이벤트 리스너 설정 완료');
        } else {
            console.warn('⚠️ 관리자 메뉴 버튼 또는 드롭다운을 찾을 수 없습니다');
        }

        // 비밀번호 변경 버튼
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }

        // 프로필 버튼
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfile();
            });
        }

        // 드롭다운 로그아웃 버튼
        const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');
        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 사이드바 접기/펼치기 토글
        this.setupSidebarToggle();

        // 비밀번호 변경 모달 관련
        this.setupPasswordChangeModal();
    }

    setupSidebarToggle() {
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.getElementById('mainContent');
        if (!toggleBtn || !sidebar) return;

        const STORAGE_KEY = 'sidebar_collapsed';
        const icon = toggleBtn.querySelector('i');

        const applyState = (collapsed) => {
            if (collapsed) {
                sidebar.classList.add('collapsed');
                if (mainContent) mainContent.style.paddingLeft = '48px';
                if (icon) { icon.classList.remove('fa-chevron-left'); icon.classList.add('fa-chevron-right'); }
            } else {
                sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.style.paddingLeft = '';
                if (icon) { icon.classList.remove('fa-chevron-right'); icon.classList.add('fa-chevron-left'); }
            }
        };

        // 저장된 상태 복원
        applyState(localStorage.getItem(STORAGE_KEY) === '1');

        toggleBtn.addEventListener('click', () => {
            const nowCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem(STORAGE_KEY, nowCollapsed ? '0' : '1');
            applyState(!nowCollapsed);
        });
    }

    /**
     * 새로고침 처리
     */
    handleRefresh() {
        console.log('🔄 페이지 새로고침...');
        
        // 새로고침 애니메이션
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // 페이지 새로고침
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    /**
     * 로그아웃 처리
     */
    handleLogout() {
        console.log('🚪 로그아웃 처리...');
        
        // 로그아웃 확인
        if (confirm('정말 로그아웃하시겠습니까?')) {
            // Supabase 전용 - localStorage 사용 제거됨
            console.log('⚠️ localStorage 사용이 제거되었습니다. Supabase를 사용하세요.');
            
            // 로그인 모달 표시
            this.showLoginModal();
        }
    }

    /**
     * 로그인 모달 표시
     */
    showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }

    /**
     * 사용자 정보 업데이트
     */
    updateUserInfo(userInfo) {
        const userInfoElement = document.getElementById('userInfo');
        if (!userInfoElement || !userInfo) return;

        userInfoElement.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-sm"></i>
                </div>
                <div>
                    <div class="text-sm font-medium">${userInfo.name || '관리자'}</div>
                    <div class="text-xs text-green-100">${userInfo.role || '시스템 관리자'}</div>
                </div>
            </div>
        `;
    }

    /**
     * API 상태 업데이트
     */
    updateApiStatus(apiStatus) {
        const statusDot = document.getElementById('api-status-dot');
        const statusText = document.getElementById('api-status-text');
        
        if (!statusDot || !statusText) return;

        const status = apiStatus || { mode: 'local', connected: false };
        
        // 상태에 따른 스타일 변경
        if (status.mode === 'api' && status.connected) {
            statusDot.className = 'w-2 h-2 rounded-full bg-success-accent';
            statusText.textContent = 'API 연결됨';
        } else if (status.mode === 'api' && !status.connected) {
            statusDot.className = 'w-2 h-2 rounded-full bg-danger-accent animate-pulse';
            statusText.textContent = 'API 연결 실패';
        } else {
            statusDot.className = 'w-2 h-2 rounded-full bg-yellow-400 animate-pulse';
            statusText.textContent = '로컬 모드';
        }
    }

    /**
     * 사이드바 버전 배지 업데이트
     * window.APP_VERSION (js/config.js) 값을 읽어 표시
     */
    updateVersionBadge() {
        const el = document.getElementById('app-version-number');
        if (el) {
            el.textContent = window.APP_VERSION || '—';
        }
    }

    /**
     * 비밀번호 변경 모달 표시
     */
    showChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.style.display = 'flex';
            // 드롭다운 닫기
            const dropdown = document.getElementById('admin-dropdown');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
        }
    }

    /**
     * 비밀번호 변경 모달 설정
     */
    setupPasswordChangeModal() {
        const modal = document.getElementById('changePasswordModal');
        const closeBtn = document.getElementById('closePasswordModal');
        const cancelBtn = document.getElementById('cancelPasswordChange');
        const form = document.getElementById('changePasswordForm');

        // 모달 닫기
        const closeModal = () => {
            if (modal) {
                modal.style.display = 'none';
                form.reset();
                document.getElementById('passwordError').classList.add('hidden');
                document.getElementById('passwordSuccess').classList.add('hidden');
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // 폼 제출
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange();
            });
        }
    }

    /**
     * 비밀번호 변경 처리
     */
    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('passwordError');
        const successDiv = document.getElementById('passwordSuccess');

        // 에러 메시지 초기화
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');

        // 비밀번호 확인 검증
        if (newPassword !== confirmPassword) {
            errorDiv.textContent = '새 비밀번호가 일치하지 않습니다.';
            errorDiv.classList.remove('hidden');
            return;
        }

        // 비밀번호 길이 검증
        if (newPassword.length < 6) {
            errorDiv.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // Supabase를 통한 비밀번호 변경
            if (window.supabaseClient && window.supabaseClient.auth) {
                console.log('🔐 비밀번호 변경 시도...');

                // 현재 비밀번호로 재인증 (선택사항)
                // Supabase는 updateUser를 호출할 때 세션이 유효하면 자동으로 처리

                const { data, error } = await window.supabaseClient.auth.updateUser({
                    password: newPassword
                });

                if (error) {
                    console.error('❌ 비밀번호 변경 실패:', error);
                    errorDiv.textContent = error.message || '비밀번호 변경에 실패했습니다.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                console.log('✅ 비밀번호 변경 성공');
                successDiv.textContent = '비밀번호가 성공적으로 변경되었습니다.';
                successDiv.classList.remove('hidden');

                // 3초 후 모달 닫기
                setTimeout(() => {
                    const modal = document.getElementById('changePasswordModal');
                    if (modal) {
                        modal.style.display = 'none';
                        document.getElementById('changePasswordForm').reset();
                        successDiv.classList.add('hidden');
                    }
                }, 3000);
            } else {
                errorDiv.textContent = 'Supabase 클라이언트가 초기화되지 않았습니다.';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('❌ 비밀번호 변경 중 오류:', error);
            errorDiv.textContent = '비밀번호 변경 중 오류가 발생했습니다.';
            errorDiv.classList.remove('hidden');
        }
    }

    /**
     * 프로필 보기
     */
    showProfile() {
        console.log('👤 프로필 보기');
        // 드롭다운 닫기
        const dropdown = document.getElementById('admin-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        const admin = window.adminAuth?.getCurrentAdmin();
        if (admin && typeof Swal !== 'undefined') {
            Swal.fire({
                title: '관리자 프로필',
                html: `<div class="text-left text-sm" style="line-height:2">
                    <p><b>이메일:</b> ${admin.email || '-'}</p>
                    <p><b>이름:</b> ${admin.user_metadata?.full_name || admin.user_metadata?.name || '-'}</p>
                    <p><b>마지막 로그인:</b> ${admin.last_sign_in_at ? new Date(admin.last_sign_in_at).toLocaleString('ko-KR') : '-'}</p>
                </div>`,
                icon: 'info',
                confirmButtonText: '확인',
                confirmButtonColor: '#16A34A'
            });
        } else {
            if (window.showToast) window.showToast('관리자 정보를 불러올 수 없습니다.', 2000, 'warning');
        }
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        console.log('🗑️ Header 컴포넌트 제거...');
        this.isInitialized = false;
    }
}

// 전역 등록 (index.html의 initializeNavigationAfterScriptsLoaded에서 사용)
window.HeaderComponent = HeaderComponent;

// componentLoader 방식도 유지
if (window.componentLoader) {
    window.componentLoader.registerComponent('header', {
        template: 'components/header/header.html',
        script: 'components/header/header.js',
        init: (container, data) => {
            const headerComponent = new HeaderComponent();
            headerComponent.init(container, data);
            return headerComponent;
        }
    });
}

// 사이드바 로고 적용 (환경설정 farm.logoUrl) + 브라우저 탭 favicon 동기화 (v3.4.74+)
function applySidebarLogo() {
    const farm = window.settingsDataManager?.settings?.farm || {};
    // 로고
    const img = document.getElementById('sidebar-logo-img');
    const icon = document.getElementById('sidebar-logo-icon');
    const box = document.getElementById('sidebar-logo-box');
    if (farm.logoUrl && img) {
        img.src = farm.logoUrl;
        img.classList.remove('hidden');
        if (icon) icon.classList.add('hidden');
        // v3.4.77: 로고 모드 — 흰 배경 + 약한 그림자, 초록 배경 제거 (투명 PNG 비침 방지)
        if (box) {
            box.classList.remove('bg-emerald-500');
            box.style.background = 'var(--bg-white)';
            box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }
    } else if (img) {
        img.classList.add('hidden');
        if (icon) icon.classList.remove('hidden');
        // 아이콘 모드 — 초록 배경 복원
        if (box) {
            box.classList.add('bg-emerald-500');
            box.style.background = '';
            box.style.boxShadow = '0 2px 8px rgba(5,150,105,0.4)';
        }
    }
    // 타이틀/서브타이틀
    const titleEl = document.getElementById('sidebar-title');
    const subtitleEl = document.getElementById('sidebar-subtitle');
    if (titleEl && farm.sidebarTitle) titleEl.textContent = farm.sidebarTitle;
    if (subtitleEl && farm.sidebarSubtitle) subtitleEl.textContent = farm.sidebarSubtitle;

    // 브라우저 탭 favicon 동기화 — 환경설정에 업로드된 농장 로고로 표시
    if (farm.logoUrl) {
        applyFavicon(farm.logoUrl);
    }
    // 브라우저 탭 제목도 농장 이름으로
    if (farm.name) document.title = `${farm.name} - 관리시스템`;
}

// favicon 동적 교체 — 기존 <link rel="icon"> 모두 제거 후 새 링크 삽입
function applyFavicon(url) {
    if (!url) return;
    try {
        document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;
        // 이미지 타입 추정 (확장자 기반)
        if (/\.png(\?|$)/i.test(url)) link.type = 'image/png';
        else if (/\.svg(\?|$)/i.test(url)) link.type = 'image/svg+xml';
        else if (/\.jpe?g(\?|$)/i.test(url)) link.type = 'image/jpeg';
        else if (/\.ico(\?|$)/i.test(url)) link.type = 'image/x-icon';
        document.head.appendChild(link);

        // apple-touch-icon (iOS 홈 화면)
        const apple = document.createElement('link');
        apple.rel = 'apple-touch-icon';
        apple.href = url;
        document.head.appendChild(apple);
    } catch (e) {
        console.warn('favicon 적용 실패:', e);
    }
}
window.applyFavicon = applyFavicon;
// 설정 로드 후 적용 (약간 지연 — settingsDataManager 초기화 대기)
setTimeout(applySidebarLogo, 1500);
// 탭 변경 시에도 재적용 (설정 변경 후 돌아올 때)
document.addEventListener('tabChanged', applySidebarLogo);
window.applySidebarLogo = applySidebarLogo;

console.log('✅ Header 컴포넌트 스크립트 로드 완료');
