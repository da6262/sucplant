/**
 * 🔐 경산다육식물농장 관리시스템 인증 시스템
 * Supabase Auth를 사용한 관리자 인증
 */

class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.loginModal = null;
        this.init();
    }

    init() {
        console.log('🔐 인증 시스템 초기화 시작...');
        
        // 로그인 모달 요소 찾기
        this.loginModal = document.getElementById('loginModal');
        
        // 로그인 폼 이벤트 리스너 설정
        this.setupLoginForm();
        
        // 인증 상태 확인
        this.checkAuthStatus();
        
        // 로그아웃 버튼 설정
        this.setupLogoutButton();
        
        console.log('✅ 인증 시스템 초기화 완료');
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    setupLogoutButton() {
        // 로그아웃 버튼이 있으면 이벤트 리스너 추가
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-btn')) {
                this.logout();
            }
        });
    }

    async checkAuthStatus() {
        try {
            // Supabase 클라이언트가 준비될 때까지 대기
            await this.waitForSupabase();
            
            if (window.supabaseClient) {
                const { data: { session }, error } = await window.supabaseClient.auth.getSession();
                
                if (error) {
                    console.error('❌ 인증 상태 확인 실패:', error);
                    this.showLoginModal();
                    return;
                }

                if (session && session.user) {
                    console.log('✅ 인증된 사용자:', session.user.email);
                    this.isAuthenticated = true;
                    this.currentUser = session.user;
                    this.hideLoginModal();
                    this.updateUIForAuthenticatedUser();
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

    async waitForSupabase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkSupabase = () => {
                attempts++;
                if (window.supabaseClient || attempts >= maxAttempts) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            
            checkSupabase();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showError('사용자명과 비밀번호를 입력해주세요.');
            return;
        }

        try {
            console.log('🔐 로그인 시도:', username);
            
            // Supabase Auth 로그인
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: username,
                password: password
            });

            if (error) {
                console.error('❌ 로그인 실패:', error.message);
                this.showError('로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
                return;
            }

            if (data.user) {
                console.log('✅ 로그인 성공:', data.user.email);
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.hideLoginModal();
                this.updateUIForAuthenticatedUser();
                this.showSuccess('로그인되었습니다.');
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
            this.currentUser = null;
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

    updateUIForAuthenticatedUser() {
        // 헤더에 사용자 정보 표시
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            const userInfo = headerContainer.querySelector('.user-info');
            if (userInfo) {
                userInfo.innerHTML = `
                    <span class="text-sm text-body">${this.currentUser.email}</span>
                    <button id="logoutBtn" class="ml-2 text-sm text-danger hover:text-red-800">로그아웃</button>
                `;
            }
        }

        // 메인 콘텐츠 표시
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }

    updateUIForUnauthenticatedUser() {
        // 메인 콘텐츠 숨기기
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }

    showError(message) {
        // SweetAlert2 사용
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
        // SweetAlert2 사용
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

    // 현재 사용자 정보 반환
    getCurrentUser() {
        return this.currentUser;
    }
}

// 전역 인증 시스템 인스턴스
let authSystem = null;

// DOM 로드 완료 후 인증 시스템 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 인증 시스템 초기화 시작...');
    authSystem = new AuthSystem();
    window.authSystem = authSystem;
});

// 전역 함수로 등록
window.AuthSystem = AuthSystem;
window.authSystem = authSystem;

console.log('🔐 인증 시스템 스크립트 로드 완료');