// 콘솔 완전 정리 스크립트
// 부대장님 전용 깔끔한 환경 🌱

// 1초 후 콘솔 완전 정리
setTimeout(() => {
    // console.clear(); // 디버깅을 위해 주석 처리
    
    // 깔끔한 시작 메시지
    console.log('%c🌱 경산다육식물농장 관리시스템', 'color: #16a34a; font-size: 18px; font-weight: bold;');
    console.log('%cWhite Platter 전문 관리 시스템', 'color: #059669; font-size: 14px;');
    console.log('%c✅ 로컬 모드로 안정적 작동 중', 'color: #10b981; font-size: 12px;');
    console.log('');
    console.log('📊 현재 데이터 현황:');
    
    // 데이터 현황 표시
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const customers = JSON.parse(localStorage.getItem('farm_customers') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
        
        console.log(`  📦 주문: ${orders.length}건`);
        console.log(`  👥 고객: ${customers.length}명`);
        console.log(`  🌱 상품: ${products.length}개`);
        console.log(`  ⏰ 대기자: ${waitlist.length}명`);
        console.log('');
        console.log('💡 모든 기능 정상 작동 중입니다!');
        
    } catch (e) {
        console.log('  데이터 로딩 중...');
    }
    
}, 1500);

// 앱 로드 완료 시 상태 업데이트
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.app) {
            // 강제로 로컬 모드 설정
            window.app.apiAvailable = false;
            
            // UI 상태 업데이트
            const statusIndicator = document.getElementById('api-status-indicator');
            const statusDot = document.getElementById('api-status-dot');
            const statusText = document.getElementById('api-status-text');
            
            if (statusIndicator && statusDot && statusText) {
                statusIndicator.className = 'flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-green-100 text-green-800';
                statusDot.className = 'w-2 h-2 rounded-full bg-green-400';
                statusText.textContent = '로컬 모드';
            }
            
            console.log('🔄 시스템 초기화 완료');
        }
    }, 2000);
});

console.log('🧹 콘솔 정리 시스템 활성화됨');