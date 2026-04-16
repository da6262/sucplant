/**
 * 🔐 경산다육식물농장 관리시스템 v5.0 - 관리자 인증
 * Supabase Auth를 사용한 관리자 전용 인증 시스템
 */

class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.currentAdmin = null;
        this.loginModal = null;
        this.init();
    }

    init() {
        console.log('🔐 관리자 인증 시스템 v5.0 초기화...');
        
        // 로그인 모달 요소 찾기
        this.loginModal = document.getElementById('loginModal');
        
        // 로그인 폼 이벤트 리스너 설정
        this.setupLoginForm();
        
        // 인증 상태 확인
        this.checkAuthStatus();
        
        console.log('✅ 관리자 인증 시스템 초기화 완료');
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        console.log('🔍 로그인 폼 찾기:', !!loginForm);
        if (loginForm) {
            console.log('✅ 로그인 폼 이벤트 리스너 설정');
            loginForm.addEventListener('submit', (e) => {
                console.log('🔐 로그인 폼 제출 이벤트 감지!');
                e.preventDefault();
                this.handleLogin();
            });
        } else {
            console.error('❌ 로그인 폼을 찾을 수 없습니다!');
        }
    }

    async checkAuthStatus() {
        try {
            console.log('🔍 인증 상태 확인 시작...');
            
            // Supabase 클라이언트가 준비될 때까지 대기
            await this.waitForSupabase();
            
            if (window.supabaseClient && 
                window.supabaseClient.auth && 
                typeof window.supabaseClient.auth.getSession === 'function') {
                const { data: { session }, error } = await window.supabaseClient.auth.getSession();
                
                if (error) {
                    console.error('❌ 인증 상태 확인 실패:', error);
                    this.showLoginModal();
                    return;
                }

                if (session && session.user) {
                    // 관리자 권한 확인
                    const isAdmin = await this.checkAdminRole(session.user);
                    if (isAdmin) {
                        console.log('✅ 관리자 인증됨:', session.user.email);
                        this.isAuthenticated = true;
                        this.currentAdmin = session.user;
                        this.hideLoginModal();
                        this.updateUIForAuthenticatedAdmin();
                    } else {
                        console.log('❌ 관리자 권한 없음');
                        await this.logout();
                        this.showLoginModal();
                    }
                } else {
                    console.log('🔐 인증되지 않은 사용자');
                    this.showLoginModal();
                }
            } else {
                console.warn('⚠️ Supabase 클라이언트가 준비되지 않음');
                this.showLoginModal();
            }
        } catch (error) {
            console.error('❌ 인증 상태 확인 중 오류:', error);
            this.showLoginModal();
        }
    }

    async checkAdminRole(user) {
        try {
            // 1) 권장: SECURITY DEFINER RPC로 관리자 권한 확인 (RLS 영향 최소화)
            if (window.supabaseClient?.rpc) {
                const { data: isAdmin, error: rpcError } = await window.supabaseClient
                    .rpc('is_admin_user', { user_email: user.email });

                if (!rpcError) {
                    return !!isAdmin;
                }

                console.warn('⚠️ is_admin_user RPC 실패 - 테이블 조회로 폴백:', rpcError.message);
            }

            // 2) 폴백: 관리자 테이블에서 사용자 확인 (RLS 설정에 따라 실패할 수 있음)
            const { data, error } = await window.supabaseClient
                .from('admin_users')
                .select('email, role, is_active')
                .eq('email', user.email)
                .eq('is_active', true)
                .maybeSingle();

            if (error) {
                console.log('❌ 관리자 권한 확인 실패:', error.message);
                return false;
            }

            return !!(data && data.role === 'admin');
        } catch (error) {
            console.error('❌ 관리자 권한 확인 중 오류:', error);
            return false;
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkSupabase = () => {
                attempts++;
                
                // Supabase 클라이언트가 존재하고 auth 메서드가 있는지 확인
                if (window.supabaseClient && 
                    window.supabaseClient.auth && 
                    typeof window.supabaseClient.auth.getSession === 'function') {
                    console.log('✅ Supabase 클라이언트 준비 완료');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Supabase 클라이언트 초기화 실패 - 최대 재시도 횟수 초과');
                    resolve();
                } else {
                    console.log(`⏳ Supabase 클라이언트 대기 중... (${attempts}/${maxAttempts})`);
                    setTimeout(checkSupabase, 100);
                }
            };
            
            checkSupabase();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('🔐 로그인 시도:', { username, password: '***' });
        
        // 입력값 검증 (먼저 체크)
        if (!username || !password) {
            console.error('❌ 입력값 없음');
            this.showError('사용자명과 비밀번호를 입력해주세요.');
            return;
        }

        // 이메일 형태가 아니면 안내 (Supabase Auth는 email 기반)
        const looksLikeEmail = typeof username === 'string' && username.includes('@');
        if (!looksLikeEmail && !(username === 'admin' || username === 'dev' || username === 'test')) {
            this.showError('아이디는 이메일로 입력해주세요. (예: admin@korsucplant.com)');
            return;
        }
        
        // 개발용 임시 로그인 (특정 계정만 허용)
        if ((username === 'admin' && password === 'admin123') || 
            (username === 'dev' && password === 'dev123') ||
            (username === 'test' && password === 'test123')) {
            console.log('✅ 개발용 임시 로그인 허용:', username);
            this.isAuthenticated = true;
            this.currentAdmin = {
                email: username + '@admin.com',
                id: 'dev-admin-001',
                user_metadata: { role: 'admin' }
            };
            this.hideLoginModal();
            this.showSuccess('개발용 임시 로그인 성공!');
            return;
        }
        
        // Supabase 인증 시도
        try {
            console.log('🔐 관리자 로그인 시도:', username);
            
            // Supabase Auth 로그인
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: username,
                password: password
            });

            if (error) {
                console.error('❌ 로그인 실패:', error.message);
                this.showError('로그인에 실패했습니다. 관리자 계정을 확인해주세요.');
                return;
            }

            if (data.user) {
                // 관리자 권한 확인
                const isAdmin = await this.checkAdminRole(data.user);
                if (isAdmin) {
                    console.log('✅ 관리자 로그인 성공:', data.user.email);
                    this.isAuthenticated = true;
                    this.currentAdmin = data.user;
                    this.hideLoginModal();
                    this.updateUIForAuthenticatedAdmin();
                    this.showSuccess('관리자로 로그인되었습니다.');
                } else {
                    console.log('❌ 관리자 권한 없음');
                    await this.logout();
                    this.showError('관리자 권한이 없습니다.');
                }
            }
        } catch (error) {
            console.error('❌ 로그인 처리 중 오류:', error);
            this.showError('로그인 처리 중 오류가 발생했습니다.');
        }
    }

    async logout() {
        try {
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient.auth.signOut();
                if (error) {
                    console.error('❌ 로그아웃 실패:', error);
                }
            }
            
            this.isAuthenticated = false;
            this.currentAdmin = null;
            this.showLoginModal();
            this.updateUIForUnauthenticatedUser();
            console.log('✅ 로그아웃 완료');
        } catch (error) {
            console.error('❌ 로그아웃 처리 중 오류:', error);
        }
    }

    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.style.display = 'flex';
        }
    }

    hideLoginModal() {
        if (this.loginModal) {
            this.loginModal.style.display = 'none';
        }
    }

    updateUIForAuthenticatedAdmin() {
        // 헤더에 관리자 정보 표시
        this.updateHeaderForAdmin();
        
        // 메인 콘텐츠 표시
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }

        // 로그아웃 버튼 추가
        this.addLogoutButton();
        
        // 헤더 컴포넌트 이벤트 리스너 초기화
        this.initializeHeaderEvents();
    }

    updateHeaderForAdmin() {
        // userInfo 영역에 관리자 이름 표시
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            // 이메일에 따라 표시 이름 결정
            let displayName = '관리자';
            if (this.currentAdmin.email === 'sucplant75@gmail.com') {
                displayName = '부대장';
            }
            
            userInfoElement.innerHTML = `
                <span class="text-sm text-body">
                    <i class="fas fa-user-shield mr-1"></i>
                    ${displayName}
                </span>
            `;
        }
    }

    addLogoutButton() {
        // 로그아웃: 드롭다운 안의 버튼만 사용 (단독 로그아웃 버튼은 제거됨)
        const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');
        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        // 기존 logout-btn이 있으면 연결 (하위 호환)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    initializeHeaderEvents() {
        console.log('🔧 헤더 이벤트 리스너 초기화 시작...');
        
        // 새로고침 버튼
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            console.log('✅ 새로고침 버튼 발견');
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 새로고침 버튼 클릭');
                location.reload();
            });
        } else {
            console.warn('⚠️ 새로고침 버튼을 찾을 수 없습니다');
        }

        // 관리자 메뉴 버튼
        const adminMenuBtn = document.getElementById('admin-menu-btn');
        const adminDropdown = document.getElementById('admin-dropdown');
        console.log('🔍 관리자 메뉴 버튼:', adminMenuBtn);
        console.log('🔍 드롭다운:', adminDropdown);
        
        if (adminMenuBtn && adminDropdown) {
            console.log('✅ 관리자 메뉴 이벤트 설정 중...');
            
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
            
            console.log('✅ 관리자 메뉴 이벤트 설정 완료');
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
                alert('프로필 기능은 추후 추가될 예정입니다.');
                const dropdown = document.getElementById('admin-dropdown');
                if (dropdown) dropdown.classList.add('hidden');
            });
        }

        // 로그아웃은 addLogoutButton()에서만 바인딩 (드롭다운 로그아웃)

        // 비밀번호 변경 모달 설정
        this.setupPasswordChangeModal();
        
        console.log('✅ 모든 헤더 이벤트 리스너 설정 완료');
    }

    showChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.style.display = 'flex';
            const dropdown = document.getElementById('admin-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
        }
    }

    setupPasswordChangeModal() {
        const modal = document.getElementById('changePasswordModal');
        const closeBtn = document.getElementById('closePasswordModal');
        const cancelBtn = document.getElementById('cancelPasswordChange');
        const form = document.getElementById('changePasswordForm');

        const closeModal = () => {
            if (modal) {
                modal.style.display = 'none';
                if (form) form.reset();
                const errorDiv = document.getElementById('passwordError');
                const successDiv = document.getElementById('passwordSuccess');
                if (errorDiv) errorDiv.classList.add('hidden');
                if (successDiv) successDiv.classList.add('hidden');
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange();
            });
        }
    }

    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('passwordError');
        const successDiv = document.getElementById('passwordSuccess');

        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');

        if (newPassword !== confirmPassword) {
            errorDiv.textContent = '새 비밀번호가 일치하지 않습니다.';
            errorDiv.classList.remove('hidden');
            return;
        }

        if (newPassword.length < 6) {
            errorDiv.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            if (window.supabaseClient && window.supabaseClient.auth) {
                console.log('🔐 비밀번호 변경 시도...');

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

                setTimeout(() => {
                    const modal = document.getElementById('changePasswordModal');
                    if (modal) {
                        modal.style.display = 'none';
                        const form = document.getElementById('changePasswordForm');
                        if (form) form.reset();
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

    updateUIForUnauthenticatedUser() {
        // 메인 콘텐츠 숨기기
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        // 관리자 정보 제거
        const adminUserInfo = document.querySelector('.admin-user-info');
        if (adminUserInfo) {
            adminUserInfo.remove();
        }
    }

    showError(message) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: '오류',
                text: message,
                confirmButtonText: '확인'
            });
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: '성공',
                text: message,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    }

    // 인증 상태 확인 메서드
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // 현재 관리자 정보 반환
    getCurrentAdmin() {
        return this.currentAdmin;
    }
}

// 전역 관리자 인증 시스템 인스턴스
let adminAuth = null;

// 초기화 함수
function initAdminAuth() {
    if (!adminAuth) {
        console.log('🔐 관리자 인증 시스템 v5.0 초기화 시작...');
        adminAuth = new AdminAuth();
        window.adminAuth = adminAuth;
        console.log('✅ adminAuth 인스턴스 생성 완료:', !!adminAuth);
    }
}

// DOM 로드 완료 후 관리자 인증 시스템 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminAuth);
} else {
    // DOM이 이미 로드된 경우 즉시 초기화
    initAdminAuth();
}

// 전역 함수로 등록
window.AdminAuth = AdminAuth;

console.log('🔐 관리자 인증 시스템 v5.0 스크립트 로드 완료');

