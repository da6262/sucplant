#!/usr/bin/env node

/**
 * 프로덕션 모드 전환 스크립트
 * 
 * 사용법:
 * node production-setup.js
 * 
 * 또는 브라우저에서:
 * await switchToProduction()
 */

// 프로덕션 모드 전환 함수
window.switchToProduction = async () => {
    console.log('🚀 프로덕션 모드 전환 시작...');
    
    try {
        // 1. 개발 모드 요소 숨기기
        console.log('📱 개발 모드 버튼 숨김 중...');
        const devElements = document.querySelectorAll('[data-dev-only]');
        devElements.forEach(el => {
            el.style.display = 'none';
            console.log(`✅ 숨김: ${el.textContent.trim()}`);
        });
        
        // 2. 개발 모드 전용 함수들 비활성화
        console.log('🔧 개발 모드 함수 비활성화 중...');
        if (window.runSmokeTests) {
            window.runSmokeTests = () => {
                console.log('⚠️ 프로덕션 모드: 스모크 테스트 비활성화됨');
                return Promise.resolve(false);
            };
        }
        
        if (window.testApiCrud) {
            window.testApiCrud = () => {
                console.log('⚠️ 프로덕션 모드: API CRUD 테스트 비활성화됨');
                return Promise.resolve(false);
            };
        }
        
        if (window.runRegressionTests) {
            window.runRegressionTests = () => {
                console.log('⚠️ 프로덕션 모드: 회귀 테스트 비활성화됨');
                return Promise.resolve(false);
            };
        }
        
        if (window.showTestReport) {
            window.showTestReport = () => {
                console.log('⚠️ 프로덕션 모드: 테스트 리포트 비활성화됨');
                return false;
            };
        }
        
        if (window.clearTestHistory) {
            window.clearTestHistory = () => {
                console.log('⚠️ 프로덕션 모드: 테스트 히스토리 초기화 비활성화됨');
                return false;
            };
        }
        
        // 3. 프로덕션 모드 플래그 설정
        window.PRODUCTION_MODE = true;
        console.log('🏷️ 프로덕션 모드 플래그 설정됨');
        
        // 4. 성공 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>프로덕션 모드 전환 완료!</span>
            </div>
            <div class="text-sm mt-1">개발 모드 기능이 비활성화되었습니다</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
        
        console.log('✅ 프로덕션 모드 전환 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ 프로덕션 모드 전환 실패:', error);
        
        // 실패 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>프로덕션 모드 전환 실패</span>
            </div>
            <div class="text-sm mt-1">${error.message}</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
        
        return false;
    }
};

// 개발 모드 복원 함수 (필요시)
window.switchToDevelopment = () => {
    console.log('🔧 개발 모드 복원 시작...');
    
    try {
        // 개발 모드 요소 다시 표시
        const devElements = document.querySelectorAll('[data-dev-only]');
        devElements.forEach(el => {
            el.style.display = '';
            console.log(`✅ 표시: ${el.textContent.trim()}`);
        });
        
        // 프로덕션 모드 플래그 해제
        window.PRODUCTION_MODE = false;
        console.log('🏷️ 개발 모드 플래그 설정됨');
        
        console.log('✅ 개발 모드 복원 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ 개발 모드 복원 실패:', error);
        return false;
    }
};

// 프로덕션 모드 상태 확인
window.isProductionMode = () => {
    return window.PRODUCTION_MODE === true;
};

// 브라우저 환경에서 실행되는 경우
if (typeof window !== 'undefined') {
    console.log('🌐 브라우저 환경에서 프로덕션 모드 전환 스크립트 로드됨');
    console.log('💡 사용법:');
    console.log('   - 프로덕션 모드: await switchToProduction()');
    console.log('   - 개발 모드 복원: switchToDevelopment()');
    console.log('   - 상태 확인: isProductionMode()');
} else {
    // Node.js 환경에서 실행되는 경우
    console.log('🖥️ Node.js 환경에서 프로덕션 모드 전환 스크립트 로드됨');
    console.log('⚠️ 이 스크립트는 브라우저 환경에서 실행되어야 합니다.');
    console.log('💡 사용법:');
    console.log('   1. 브라우저에서 index.html 열기');
    console.log('   2. 개발자 도구 콘솔에서: await switchToProduction()');
    console.log('   3. 또는 환경설정 → 프로덕션 모드 전환 버튼 클릭');
    
    process.exit(1);
}

