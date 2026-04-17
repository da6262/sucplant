/**
 * 🔧 임시 인증 우회 시스템 (개발용)
 * 관리자 계정 설정 전까지 임시로 사용
 */

// 임시 인증 우회 함수
function bypassAuth() {
    console.log('🔧 임시 인증 우회 활성화');
    
    // 로그인 모달 숨기기
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    // 메인 콘텐츠 표시
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // 헤더에 임시 관리자 정보 표시
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const tempUserInfo = document.createElement('div');
        tempUserInfo.className = 'temp-admin-info flex items-center space-x-4';
        tempUserInfo.innerHTML = `
            <span class="text-sm text-warn">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                임시 관리자 모드 (개발용)
            </span>
            <button onclick="location.reload()" class="text-sm text-info hover:text-blue-800">
                <i class="fas fa-sync-alt mr-1"></i>새로고침
            </button>
        `;
        headerContainer.appendChild(tempUserInfo);
    }
    
    console.log('✅ 임시 인증 우회 완료');
}

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 임시 인증 우회 시스템 로드');
    
    // 3초 후 임시 인증 우회 실행
    setTimeout(() => {
        bypassAuth();
    }, 3000);
});

// 전역 함수로 등록
window.bypassAuth = bypassAuth;

console.log('🔧 임시 인증 우회 스크립트 로드 완료');




