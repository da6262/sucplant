#!/usr/bin/env node

/**
 * Supabase 설정 업데이트 스크립트
 * 
 * 사용법:
 * node supabase-config-update.js
 * 
 * 또는 브라우저에서:
 * await updateSupabaseConfig()
 */

// Supabase 설정 업데이트 함수
window.updateSupabaseConfig = async (config = {}) => {
    console.log('🔧 Supabase 설정 업데이트 시작...');
    
    try {
        // 기본 설정값
        const defaultConfig = {
            url: 'https://your-project.supabase.co',
            anonKey: 'your-anon-key',
            serviceKey: 'your-service-key'
        };
        
        // 사용자 입력값과 기본값 병합
        const newConfig = { ...defaultConfig, ...config };
        
        // 현재 설정 확인
        if (window.SUPABASE_CONFIG) {
            console.log('📋 현재 Supabase 설정:');
            console.log(`  URL: ${window.SUPABASE_CONFIG.url}`);
            console.log(`  Anon Key: ${window.SUPABASE_CONFIG.anonKey ? '설정됨' : '없음'}`);
            console.log(`  Service Key: ${window.SUPABASE_CONFIG.serviceKey ? '설정됨' : '없음'}`);
        }
        
        // 새 설정 적용
        window.SUPABASE_CONFIG = {
            ...window.SUPABASE_CONFIG,
            ...newConfig,
            disabled: false // 프로덕션 모드에서는 API 활성화
        };
        
        console.log('✅ 새 Supabase 설정:');
        console.log(`  URL: ${window.SUPABASE_CONFIG.url}`);
        console.log(`  Anon Key: ${window.SUPABASE_CONFIG.anonKey ? '설정됨' : '없음'}`);
        console.log(`  Service Key: ${window.SUPABASE_CONFIG.serviceKey ? '설정됨' : '없음'}`);
        console.log(`  API 활성화: ${!window.SUPABASE_CONFIG.disabled}`);
        
        // 설정을 LocalStorage에 저장
        localStorage.setItem('supabase_config', JSON.stringify(window.SUPABASE_CONFIG));
        console.log('💾 설정이 LocalStorage에 저장됨');
        
        // 성공 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-cog mr-2"></i>
                <span>Supabase 설정 업데이트 완료!</span>
            </div>
            <div class="text-sm mt-1">API 연결이 활성화되었습니다</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
        
        console.log('✅ Supabase 설정 업데이트 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase 설정 업데이트 실패:', error);
        
        // 실패 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>Supabase 설정 업데이트 실패</span>
            </div>
            <div class="text-sm mt-1">${error.message}</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
        
        return false;
    }
};

// Supabase 연결 테스트 함수
window.testSupabaseConnection = async () => {
    console.log('🧪 Supabase 연결 테스트 시작...');
    
    try {
        if (!window.SUPABASE_CONFIG || window.SUPABASE_CONFIG.disabled) {
            throw new Error('Supabase 설정이 비활성화되어 있습니다');
        }
        
        // 간단한 연결 테스트
        const testUrl = `${window.SUPABASE_CONFIG.url}/rest/v1/`;
        const response = await fetch(testUrl, {
            headers: {
                'apikey': window.SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Supabase 연결 성공!');
            
            // 성공 알림
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>Supabase 연결 성공!</span>
                </div>
                <div class="text-sm mt-1">API 연결이 정상적으로 작동합니다</div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
            
            return true;
        } else {
            throw new Error(`연결 실패: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        
        // 실패 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>Supabase 연결 실패</span>
            </div>
            <div class="text-sm mt-1">${error.message}</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
        
        return false;
    }
};

// 설정 초기화 함수
window.resetSupabaseConfig = () => {
    console.log('🔄 Supabase 설정 초기화...');
    
    window.SUPABASE_CONFIG = {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key',
        serviceKey: 'your-service-key',
        disabled: true // 로컬 모드로 초기화
    };
    
    localStorage.removeItem('supabase_config');
    console.log('✅ Supabase 설정이 초기화되었습니다');
    
    return true;
};

// 브라우저 환경에서 실행되는 경우
if (typeof window !== 'undefined') {
    console.log('🌐 브라우저 환경에서 Supabase 설정 업데이트 스크립트 로드됨');
    console.log('💡 사용법:');
    console.log('   - 설정 업데이트: await updateSupabaseConfig({ url: "https://...", anonKey: "..." })');
    console.log('   - 연결 테스트: await testSupabaseConnection()');
    console.log('   - 설정 초기화: resetSupabaseConfig()');
} else {
    // Node.js 환경에서 실행되는 경우
    console.log('🖥️ Node.js 환경에서 Supabase 설정 업데이트 스크립트 로드됨');
    console.log('⚠️ 이 스크립트는 브라우저 환경에서 실행되어야 합니다.');
    console.log('💡 사용법:');
    console.log('   1. 브라우저에서 index.html 열기');
    console.log('   2. 개발자 도구 콘솔에서: await updateSupabaseConfig({ ... })');
    console.log('   3. 또는 환경설정 → Supabase 설정 업데이트 버튼 클릭');
    
    process.exit(1);
}

