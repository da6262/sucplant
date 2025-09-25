// API 500 오류 대응 스크립트
// 서버 오류 시 자동으로 로컬 모드로 전환

// API 500 오류 감지 및 대응
window.handleApiError = function(error, tableName) {
    console.log(`⚠️ API 오류 감지: ${tableName}`, error);
    
    if (error.includes('500') || error.includes('Internal Server Error')) {
        console.log('🔄 서버 오류로 인한 로컬모드 전환');
        
        // 사용자에게 알림
        if (!window.apiErrorNotified) {
            alert(
                '⚠️ 서버 일시적 오류 발생\n\n' +
                '✅ 로컬 데이터로 계속 사용 가능\n' +
                '🔄 서버 복구 시 자동 동기화\n\n' +
                '현재 기기에 저장된 데이터로 작업하세요!'
            );
            window.apiErrorNotified = true;
        }
        
        // 앱 인스턴스가 있으면 로컬모드로 강제 전환
        if (window.app) {
            window.app.apiAvailable = false;
            window.app.updateApiStatusUI(false);
            console.log('🔄 앱을 로컬모드로 전환했습니다');
        }
        
        return true; // 오류 처리됨
    }
    
    return false; // 다른 오류는 기본 처리
};

// 전역 에러 핸들러 등록
window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('500')) {
        handleApiError(event.message, 'unknown');
    }
});

// Fetch 요청 가로채기 (500 오류 자동 처리)
const apiFallbackOriginalFetch = fetch;
window.fetch = async function(...args) {
    try {
        const response = await apiFallbackOriginalFetch(...args);
        
        // 500 오류 감지
        if (response.status === 500) {
            const url = args[0];
            const tableName = url.includes('tables/') ? 
                url.split('tables/')[1].split('?')[0] : 'unknown';
            
            handleApiError('500 Internal Server Error', tableName);
            
            // 로컬 데이터로 대체 응답 생성
            if (url.includes('tables/') && window.app) {
                const localData = window.app.getLocalData(tableName);
                return new Response(JSON.stringify({
                    data: localData,
                    total: localData.length,
                    message: 'local_fallback'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        return response;
    } catch (error) {
        // 네트워크 오류 처리
        const url = args[0];
        if (url && url.includes('tables/')) {
            const tableName = url.split('tables/')[1].split('?')[0];
            handleApiError(error.message, tableName);
        }
        throw error;
    }
};

console.log('🛡️ API 500 오류 대응 시스템 활성화');