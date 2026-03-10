// 경산다육식물농장 관리시스템 - 메인 애플리케이션
console.log('🔍 디버깅 시작 - 페이지 로딩 상태 확인');

// 페이지 로딩 상태 추적
let pageLoadSteps = [];
pageLoadSteps.push('1. HTML 파싱 시작');

// 전역 오류 처리 (강화된 버전)
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript 오류 발생:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
    
    pageLoadSteps.push(`오류: ${e.message} (${e.filename}:${e.lineno})`);
    
    // 빈 화면 방지
    if (!document.body || document.body.innerHTML.trim() === '') {
        console.log('🔄 빈 화면 감지, 기본 콘텐츠 로드 시도...');
        showFallbackContent('JavaScript 오류로 인한 빈 화면');
    }
});

// Promise rejection 처리
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Promise rejection:', e.reason);
    pageLoadSteps.push(`Promise 오류: ${e.reason}`);
});

// 폴백 콘텐츠 표시 함수
function showFallbackContent(reason) {
    const fallbackHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #333; margin-bottom: 20px;">경산다육식물농장 관리시스템</h1>
            <div style="background: #fef2f2; border: 1px solid #f87171; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #dc2626; margin: 0 0 10px 0;">시스템 오류</h2>
                <p style="color: #dc2626; margin: 0 0 10px 0;">${reason}</p>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #dc2626;">디버깅 정보 보기</summary>
                    <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; overflow-x: auto;">${pageLoadSteps.join('\n')}</pre>
                </details>
            </div>
            <button onclick="location.reload()" style="background: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                새로고침
            </button>
        </div>
    `;
    
    if (document.body) {
        document.body.innerHTML = fallbackHTML;
    } else {
        document.write(fallbackHTML);
    }
}

// DOM 로딩 완료 확인 (강화된 버전)
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM 로딩 완료');
    pageLoadSteps.push('2. DOM 로딩 완료');
    
    // body 내용 확인
    setTimeout(() => {
        const bodyContent = document.body ? document.body.innerHTML.trim() : '';
        console.log('🔍 body 내용 길이:', bodyContent.length);
        console.log('🔍 body 내용 미리보기:', bodyContent.substring(0, 200));
        
        if (!document.body || bodyContent === '') {
            console.log('🔄 빈 화면 감지, 폴백 실행...');
            pageLoadSteps.push('3. 빈 화면 감지됨');
            showFallbackContent('페이지 내용이 로드되지 않음');
        } else {
            pageLoadSteps.push('3. 페이지 내용 정상 로드됨');
        }
    }, 1000);
    
    // 5초 후 최종 확인
    setTimeout(() => {
        const bodyContent = document.body ? document.body.innerHTML.trim() : '';
        if (!document.body || bodyContent === '') {
            console.log('🔄 5초 후에도 빈 화면, 최종 폴백 실행...');
            pageLoadSteps.push('4. 5초 후 빈 화면 지속');
            showFallbackContent('페이지 로딩 시간 초과');
        }
    }, 5000);
});

// 페이지 로딩 시작 시점 기록
pageLoadSteps.push('0. 페이지 로딩 시작');
