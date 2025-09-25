/**
 * 🔐 경산다육식물농장 인증 시스템
 * 
 * 로그인/로그아웃 기능과 페이지 접근 보호를 담당합니다.
 * Supabase Auth를 사용하여 안전한 인증을 제공합니다.
 */

class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.authToken = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15분
        this.lockoutUntil = null;
        
        // 기본 관리자 계정 (실제 운영 시에는 Supabase Auth로 교체)
        this.adminCredentials = {
            username: 'gsfarm',
            password: 'ryubae6677',
            name: '경산다육농장 관리자'
        };
        
        this.init();
    }
    
    /**
     * 인증 시스템 초기화
     */
    init() {
        console.log('🔐 인증 시스템 초기화 중...');
        
        // 강제 로컬 모드와 관계없이 인증 시스템 활성화
        console.log('🔓 인증 시스템은 모든 모드에서 활성화됩니다');
        
        // 로컬 스토리지에서 인증 상태 확인
        this.checkStoredAuth();
        
        // 페이지 로드 시 인증 상태 확인
        this.checkAuthStatus();
        
        // 자동 로그아웃 타이머 설정 (24시간)
        this.setupAutoLogout();
        
        console.log('✅ 인증 시스템 초기화 완료');
    }
    
    /**
     * 로컬 스토리지에서 인증 상태 확인
     */
    checkStoredAuth() {
        try {
            const storedAuth = localStorage.getItem('farm_auth_token');
            const storedUser = localStorage.getItem('farm_current_user');
            const storedTime = localStorage.getItem('farm_auth_time');
            
            if (storedAuth && storedUser && storedTime) {
                const authTime = new Date(storedTime);
                const now = new Date();
                const timeDiff = now - authTime;
                
                // 24시간 이내인지 확인
                if (timeDiff < 24 * 60 * 60 * 1000) {
                    this.authToken = storedAuth;
                    this.currentUser = JSON.parse(storedUser);
                    this.isAuthenticated = true;
                    console.log('✅ 저장된 인증 정보로 자동 로그인');
                    return true;
                } else {
                    // 만료된 인증 정보 삭제
                    this.clearStoredAuth();
                }
            }
        } catch (error) {
            console.error('❌ 저장된 인증 정보 확인 오류:', error);
            this.clearStoredAuth();
        }
        
        return false;
    }
    
    /**
     * 인증 상태 확인 및 페이지 보호
     */
    checkAuthStatus() {
        if (!this.isAuthenticated) {
            this.showLoginModal();
            this.protectPage();
        } else {
            this.hideLoginModal();
            this.showMainContent();
        }
    }
    
    /**
     * 로그인 처리
     */
    async login(username, password) {
        try {
            // 잠금 상태 확인
            if (this.isLockedOut()) {
                throw new Error(`로그인이 잠겨있습니다. ${this.getRemainingLockoutTime()} 후에 다시 시도하세요.`);
            }
            
            // 입력값 검증
            if (!username || !password) {
                throw new Error('사용자명과 비밀번호를 입력해주세요.');
            }
            
            // 관리자 계정 확인
            if (username === this.adminCredentials.username && 
                password === this.adminCredentials.password) {
                
                // 로그인 성공
                this.isAuthenticated = true;
                this.currentUser = {
                    username: this.adminCredentials.username,
                    name: this.adminCredentials.name,
                    role: 'admin',
                    loginTime: new Date()
                };
                this.authToken = this.generateAuthToken();
                
                // 로컬 스토리지에 저장
                this.saveAuthToStorage();
                
                // 로그인 시도 횟수 초기화
                this.loginAttempts = 0;
                this.lockoutUntil = null;
                
                // UI 업데이트
                this.hideLoginModal();
                this.showMainContent();
                this.updateAuthUI();
                
                console.log('✅ 관리자 로그인 성공');
                
                // 환영 메시지
                if (typeof orderSystem !== 'undefined') {
                    orderSystem.showToast(`🌱 ${this.currentUser.name}님, 환영합니다!`, 3000);
                }
                
                return { success: true, message: '로그인 성공' };
                
            } else {
                // 로그인 실패
                this.loginAttempts++;
                
                if (this.loginAttempts >= this.maxLoginAttempts) {
                    this.lockoutUntil = new Date(Date.now() + this.lockoutTime);
                    console.warn('🚫 로그인 시도 횟수 초과로 계정이 잠겼습니다.');
                    throw new Error(`로그인 시도 횟수를 초과했습니다. ${this.getRemainingLockoutTime()} 후에 다시 시도하세요.`);
                }
                
                throw new Error(`잘못된 사용자명 또는 비밀번호입니다. (${this.loginAttempts}/${this.maxLoginAttempts})`);
            }
            
        } catch (error) {
            console.error('❌ 로그인 오류:', error);
            return { success: false, message: error.message };
        }
    }
    
    /**
     * 로그아웃 처리
     */
    logout() {
        console.log('🔓 로그아웃 처리 중...');
        
        this.isAuthenticated = false;
        this.currentUser = null;
        this.authToken = null;
        
        // 로컬 스토리지에서 인증 정보 삭제
        this.clearStoredAuth();
        
        // UI 업데이트
        this.showLoginModal();
        this.hideMainContent();
        this.updateAuthUI();
        
        console.log('✅ 로그아웃 완료');
        
        if (typeof orderSystem !== 'undefined') {
            orderSystem.showToast('🔓 로그아웃되었습니다.', 2000);
        }
    }
    
    /**
     * 인증 토큰 생성
     */
    generateAuthToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return btoa(`${timestamp}_${random}_${this.adminCredentials.username}`);
    }
    
    /**
     * 인증 정보를 로컬 스토리지에 저장
     */
    saveAuthToStorage() {
        try {
            localStorage.setItem('farm_auth_token', this.authToken);
            localStorage.setItem('farm_current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('farm_auth_time', new Date().toISOString());
        } catch (error) {
            console.error('❌ 인증 정보 저장 오류:', error);
        }
    }
    
    /**
     * 로컬 스토리지에서 인증 정보 삭제
     */
    clearStoredAuth() {
        try {
            localStorage.removeItem('farm_auth_token');
            localStorage.removeItem('farm_current_user');
            localStorage.removeItem('farm_auth_time');
        } catch (error) {
            console.error('❌ 인증 정보 삭제 오류:', error);
        }
    }
    
    /**
     * 계정 잠금 상태 확인
     */
    isLockedOut() {
        if (this.lockoutUntil && new Date() < this.lockoutUntil) {
            return true;
        }
        return false;
    }
    
    /**
     * 잠금 해제까지 남은 시간
     */
    getRemainingLockoutTime() {
        if (!this.lockoutUntil) return '0분';
        
        const now = new Date();
        const remaining = this.lockoutUntil - now;
        
        if (remaining <= 0) return '0분';
        
        const minutes = Math.ceil(remaining / (60 * 1000));
        return `${minutes}분`;
    }
    
    /**
     * 자동 로그아웃 타이머 설정
     */
    setupAutoLogout() {
        // 24시간마다 자동 로그아웃 체크
        setInterval(() => {
            if (this.isAuthenticated) {
                const authTime = localStorage.getItem('farm_auth_time');
                if (authTime) {
                    const timeDiff = new Date() - new Date(authTime);
                    if (timeDiff >= 24 * 60 * 60 * 1000) {
                        console.log('⏰ 24시간 경과로 자동 로그아웃');
                        this.logout();
                    }
                }
            }
        }, 60 * 60 * 1000); // 1시간마다 체크
    }
    
    /**
     * 로그인 모달 표시
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    /**
     * 로그인 모달 숨기기
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
        
        // 보호 오버레이 제거
        this.removeProtectionOverlay();
        
        // 보호 모니터 중지
        if (this.protectionMonitor) {
            clearInterval(this.protectionMonitor);
            this.protectionMonitor = null;
        }
    }
    
    /**
     * 보호 오버레이 제거
     */
    removeProtectionOverlay() {
        const overlay = document.getElementById('authProtectionOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    /**
     * 메인 콘텐츠 표시
     */
    showMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // 모든 링크와 버튼 다시 활성화
        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });
        
        console.log('✅ 메인 콘텐츠 활성화 완료');
    }
    
    /**
     * 메인 콘텐츠 숨기기
     */
    hideMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }
    
    /**
     * 페이지 보호
     */
    protectPage() {
        // 메인 콘텐츠 숨기기
        this.hideMainContent();
        
        // 모든 링크와 버튼 비활성화
        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
            if (!link.classList.contains('auth-allowed')) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            }
        });
        
        // 페이지 전체에 오버레이 추가
        this.addProtectionOverlay();
        
        // 주기적으로 페이지 보호 상태 확인
        this.startProtectionMonitor();
    }
    
    /**
     * 보호 오버레이 추가
     */
    addProtectionOverlay() {
        // 기존 오버레이 제거
        const existingOverlay = document.getElementById('authProtectionOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // 새 오버레이 생성
        const overlay = document.createElement('div');
        overlay.id = 'authProtectionOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 40;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            text-align: center;
        `;
        overlay.innerHTML = `
            <div>
                <i class="fas fa-lock" style="font-size: 48px; margin-bottom: 20px; color: #ef4444;"></i>
                <h2 style="margin-bottom: 10px;">🔐 접근이 제한되었습니다</h2>
                <p style="margin-bottom: 20px;">관리자 로그인이 필요합니다</p>
                <p style="font-size: 14px; opacity: 0.8;">로그인 모달을 확인하세요</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    /**
     * 보호 모니터 시작
     */
    startProtectionMonitor() {
        // 기존 모니터 제거
        if (this.protectionMonitor) {
            clearInterval(this.protectionMonitor);
        }
        
        // 1초마다 보호 상태 확인
        this.protectionMonitor = setInterval(() => {
            if (!this.isAuthenticated) {
                // 로그인 모달이 숨겨져 있으면 다시 표시
                const modal = document.getElementById('loginModal');
                if (modal && modal.style.display === 'none') {
                    this.showLoginModal();
                }
                
                // 메인 콘텐츠가 보이면 숨기기
                const mainContent = document.getElementById('mainContent');
                if (mainContent && mainContent.style.display !== 'none') {
                    this.hideMainContent();
                }
                
                // 오버레이가 없으면 추가
                const overlay = document.getElementById('authProtectionOverlay');
                if (!overlay) {
                    this.addProtectionOverlay();
                }
            }
        }, 1000);
    }
    
    /**
     * 인증 UI 업데이트
     */
    updateAuthUI() {
        // 사용자 정보 표시
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.isAuthenticated) {
            userInfo.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-user-circle text-green-600"></i>
                    <span class="text-sm font-medium">${this.currentUser.name}</span>
                    <button onclick="authSystem.logout()" 
                            class="text-red-600 hover:text-red-800 text-sm">
                        <i class="fas fa-sign-out-alt"></i> 로그아웃
                    </button>
                </div>
            `;
        } else if (userInfo) {
            userInfo.innerHTML = '';
        }
    }
    
    /**
     * 비밀번호 변경 (향후 확장용)
     */
    async changePassword(oldPassword, newPassword) {
        // TODO: Supabase Auth 연동 시 구현
        console.log('비밀번호 변경 기능은 향후 구현 예정입니다.');
    }
    
    /**
     * 사용자 권한 확인
     */
    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        // 관리자는 모든 권한
        if (this.currentUser.role === 'admin') return true;
        
        // 향후 다른 역할 추가 시 권한 체크 로직 구현
        return false;
    }
}

// 전역 인증 시스템 인스턴스
window.authSystem = new AuthSystem();

// 페이지 로드 시 인증 상태 확인 (즉시 실행)
(function() {
    // DOM이 로드되면 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.authSystem) {
                window.authSystem.checkAuthStatus();
            }
        });
    } else {
        // DOM이 이미 로드된 경우 즉시 실행
        if (window.authSystem) {
            window.authSystem.checkAuthStatus();
        }
    }
})();

// 로그인 폼 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = await window.authSystem.login(username, password);
            
            if (result.success) {
                // 로그인 성공 시 폼 초기화
                loginForm.reset();
            } else {
                // 에러 메시지 표시
                const errorMsg = document.getElementById('loginError');
                if (errorMsg) {
                    errorMsg.textContent = result.message;
                    errorMsg.style.display = 'block';
                }
            }
        });
    }
});

console.log('🔐 인증 시스템 로드 완료');
