// 핸드폰 강제 API 모드 전환 스크립트
// 부대장님 전용 🌱

// 강제 API 모드 전환 함수
window.forceApiMode = async function() {
    console.log('🚀 핸드폰 강제 API 모드 전환 시작...');
    
    // 강제 로컬 모드가 활성화된 경우 차단
    if (window.FORCE_LOCAL_MODE) {
        console.warn('🛑 강제 로컬 모드가 활성화되어 API 모드 전환 불가');
        alert('현재 강제 로컬 모드가 활성화되어 있습니다.\nAPI 모드로 전환할 수 없습니다.');
        return false;
    }
    
    try {
        // 1. 로컬스토리지 백업 (만약을 위해)
        const backup = {};
        const keys = ['customers', 'orders', 'products', 'waitlist', 'categories', 'order_sources'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                backup[key] = JSON.parse(data);
                console.log(`💾 ${key} 백업: ${backup[key].length}개`);
            }
        });
        
        // 2. API 연결 강제 테스트
        console.log('🔗 API 연결 강제 테스트...');
        const response = await fetch('tables/customers?limit=1');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API 연결 성공!', data);
            
            // 3. 모드 스위치 시스템 사용
            if (window.MODE_SWITCH) {
                window.MODE_SWITCH.switchMode('api');
                console.log('✅ 모드 스위치 시스템으로 API 모드 전환 완료');
            } else {
                // 기존 방식 (fallback)
                if (window.app) {
                    window.app.apiAvailable = true;
                    window.app.updateApiStatusUI(true);
                    console.log('🔄 앱 API 상태 강제 업데이트 완료');
                    
                    // 4. 모든 탭 데이터 새로고침
                    await window.app.refreshAllTabs();
                    console.log('🔄 모든 탭 데이터 새로고침 완료');
                }
            }
            
            // 5. 성공 메시지
            alert('🎉 API 모드 전환 성공!\n이제 서버 데이터를 사용합니다.');
            
            return true;
        } else {
            throw new Error(`API 응답 오류: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ API 모드 전환 실패:', error);
        alert('❌ API 모드 전환 실패\n인터넷 연결을 확인해주세요.');
        return false;
    }
};

// 현재 모드 확인 함수
window.checkCurrentMode = function() {
    const isApiMode = window.app && window.app.apiAvailable;
    const mode = isApiMode ? 'API 모드 (서버 데이터)' : '로컬 모드 (기기 저장 데이터)';
    
    console.log(`📊 현재 모드: ${mode}`);
    console.log(`🔗 API 상태: ${isApiMode ? '연결됨' : '연결 안됨'}`);
    
    if (!isApiMode) {
        console.log('💡 API 모드로 전환하려면: forceApiMode() 실행');
    }
    
    return isApiMode;
};

// 버튼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    const forceApiBtn = document.getElementById('force-api-mode-btn');
    
    if (forceApiBtn) {
        forceApiBtn.addEventListener('click', async function() {
            // 현재 모드 먼저 확인
            const isCurrentlyApi = checkCurrentMode();
            
            if (isCurrentlyApi) {
                alert('✅ 이미 API 모드입니다!\n서버 데이터를 사용 중이에요.');
                return;
            }
            
            // 확인 다이얼로그
            const confirm = window.confirm(
                '📱→🌐 API 모드로 전환하시겠습니까?\n\n' +
                '✅ 서버 데이터 사용\n' +
                '✅ 컴퓨터와 동기화\n' +
                '⚠️ 인터넷 연결 필요'
            );
            
            if (confirm) {
                // 버튼 로딩 상태
                const originalText = forceApiBtn.innerHTML;
                forceApiBtn.innerHTML = '🔄 전환중...';
                forceApiBtn.disabled = true;
                
                try {
                    const success = await forceApiMode();
                    if (!success) {
                        forceApiBtn.innerHTML = originalText;
                        forceApiBtn.disabled = false;
                    }
                } catch (error) {
                    forceApiBtn.innerHTML = originalText;
                    forceApiBtn.disabled = false;
                }
            }
        });
    }
});

// 콘솔 도움말 출력
console.log(`
🌱 === 경산다육농장 핸드폰 모드 전환 도구 ===

📱 버튼으로 쉽게: 우상단 "📱→🌐" 버튼 클릭!

📱 콘솔 명령어:
   checkCurrentMode()  // 현재 모드 확인
   forceApiMode()      // API 모드 전환
`);