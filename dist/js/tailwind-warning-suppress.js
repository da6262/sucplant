// Tailwind CSS 프로덕션 경고 메시지 무시
(function() {
    // 즉시 경고 차단 설정
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = function(message) {
        if (typeof message === 'string' && 
            (message.includes('cdn.tailwindcss.com should not be used in production') ||
             message.includes('should not be used in production'))) {
            return; // 이 경고는 무시
        }
        originalWarn.apply(console, arguments);
    };
    
    console.error = function(message) {
        if (typeof message === 'string' && 
            (message.includes('cdn.tailwindcss.com should not be used in production') ||
             message.includes('should not be used in production'))) {
            return; // 이 에러도 무시
        }
        originalError.apply(console, arguments);
    };
    
    // Tailwind CSS 로드 후에도 경고 차단 유지
    window.addEventListener('load', function() {
        console.warn = function(message) {
            if (typeof message === 'string' && 
                (message.includes('cdn.tailwindcss.com should not be used in production') ||
                 message.includes('should not be used in production'))) {
                return;
            }
            originalWarn.apply(console, arguments);
        };
    });
})();
