// 강제 로컬 모드 완전 해제 스크립트
// 인증 시스템과 데이터 연동을 위해 사용

console.log('🔓 강제 로컬 모드 해제 시작...');

// 1. 강제 로컬 모드 플래그 완전 해제
window.FORCE_LOCAL_MODE = false;
delete window.FORCE_LOCAL_MODE;

// 2. 로컬 스토리지에서 강제 로컬 모드 관련 데이터 삭제
const keysToRemove = [
    'force_local_mode',
    'FORCE_LOCAL_MODE',
    'local_mode_active',
    'api_disabled'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ ${key} 제거됨`);
    }
});

// 3. 모드 스위치 시스템을 API 모드로 강제 설정
if (window.MODE_SWITCH) {
    window.MODE_SWITCH.currentMode = 'api';
    window.MODE_SWITCH.applyMode('api');
    console.log('✅ 모드 스위치를 API 모드로 설정');
}

// 4. 인증 시스템 활성화 확인
if (window.authSystem) {
    console.log('✅ 인증 시스템 활성화됨');
} else {
    console.warn('⚠️ 인증 시스템이 로드되지 않음');
}

// 5. API 연결 테스트
setTimeout(async () => {
    try {
        console.log('🔗 API 연결 테스트...');
        const response = await fetch('tables/customers?limit=1');
        if (response.ok) {
            console.log('✅ API 연결 성공');
        } else {
            console.warn('⚠️ API 연결 실패:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ API 연결 오류:', error.message);
    }
}, 1000);

console.log('🔓 강제 로컬 모드 해제 완료');
console.log('🔐 인증 시스템과 데이터 연동이 활성화되었습니다');
