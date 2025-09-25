#!/usr/bin/env node

/**
 * 통합 프로덕션 모드 전환 스크립트
 * 
 * 사용법:
 * node deploy-to-production.js
 * 
 * 또는 브라우저에서:
 * await deployToProduction()
 */

// 통합 프로덕션 모드 전환 함수
window.deployToProduction = async (supabaseConfig = {}) => {
    console.log('🚀 통합 프로덕션 모드 전환 시작...');
    
    try {
        // 1. 프로덕션 모드 전환
        console.log('📱 1단계: 프로덕션 모드 전환...');
        const productionResult = await window.switchToProduction();
        if (!productionResult) {
            throw new Error('프로덕션 모드 전환 실패');
        }
        
        // 2. Supabase 설정 업데이트 (설정이 제공된 경우)
        if (supabaseConfig && (supabaseConfig.url || supabaseConfig.anonKey)) {
            console.log('🔧 2단계: Supabase 설정 업데이트...');
            const configResult = await window.updateSupabaseConfig(supabaseConfig);
            if (!configResult) {
                console.warn('⚠️ Supabase 설정 업데이트 실패, 계속 진행...');
            }
        } else {
            console.log('⏭️ 2단계: Supabase 설정 업데이트 건너뜀 (설정 없음)');
        }
        
        // 3. 시스템 재초기화
        console.log('🔄 3단계: 시스템 재초기화...');
        if (window.orderSystem && window.orderSystem.emergencyDataRecovery) {
            await window.orderSystem.emergencyDataRecovery();
            console.log('✅ 시스템 재초기화 완료');
        }
        
        // 4. 최종 상태 확인
        console.log('🔍 4단계: 최종 상태 확인...');
        const isProduction = window.isProductionMode();
        const hasSupabase = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.disabled;
        
        console.log(`📊 최종 상태:`);
        console.log(`  프로덕션 모드: ${isProduction ? '✅ 활성화' : '❌ 비활성화'}`);
        console.log(`  Supabase API: ${hasSupabase ? '✅ 활성화' : '❌ 비활성화'}`);
        
        // 5. 성공 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-rocket mr-2"></i>
                <span>프로덕션 모드 전환 완료!</span>
            </div>
            <div class="text-sm mt-1">시스템이 실사용 모드로 전환되었습니다</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
        
        console.log('🎉 통합 프로덕션 모드 전환 완료!');
        return {
            success: true,
            productionMode: isProduction,
            supabaseEnabled: hasSupabase,
            message: '프로덕션 모드 전환 성공'
        };
        
    } catch (error) {
        console.error('❌ 통합 프로덕션 모드 전환 실패:', error);
        
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
        setTimeout(() => notification.remove(), 10000);
        
        return {
            success: false,
            error: error.message,
            message: '프로덕션 모드 전환 실패'
        };
    }
};

// 개발 모드 복원 함수
window.restoreToDevelopment = async () => {
    console.log('🔧 개발 모드 복원 시작...');
    
    try {
        // 1. 개발 모드 복원
        const devResult = window.switchToDevelopment();
        if (!devResult) {
            throw new Error('개발 모드 복원 실패');
        }
        
        // 2. Supabase 설정 초기화
        window.resetSupabaseConfig();
        
        // 3. 성공 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-tools mr-2"></i>
                <span>개발 모드 복원 완료!</span>
            </div>
            <div class="text-sm mt-1">시스템이 개발 모드로 복원되었습니다</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
        
        console.log('✅ 개발 모드 복원 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ 개발 모드 복원 실패:', error);
        return false;
    }
};

// 현재 모드 상태 확인 함수
window.getSystemStatus = () => {
    const isProduction = window.isProductionMode();
    const hasSupabase = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.disabled;
    const supabaseUrl = window.SUPABASE_CONFIG?.url || '설정 없음';
    
    const status = {
        mode: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
        supabase: {
            enabled: hasSupabase,
            url: supabaseUrl
        },
        timestamp: new Date().toISOString()
    };
    
    console.log('📊 시스템 상태:');
    console.log(`  모드: ${status.mode}`);
    console.log(`  Supabase: ${status.supabase.enabled ? '활성화' : '비활성화'}`);
    console.log(`  URL: ${status.supabase.url}`);
    console.log(`  확인 시간: ${status.timestamp}`);
    
    return status;
};

// 브라우저 환경에서 실행되는 경우
if (typeof window !== 'undefined') {
    console.log('🌐 브라우저 환경에서 통합 프로덕션 모드 전환 스크립트 로드됨');
    console.log('💡 사용법:');
    console.log('   - 프로덕션 모드: await deployToProduction({ url: "https://...", anonKey: "..." })');
    console.log('   - 개발 모드 복원: await restoreToDevelopment()');
    console.log('   - 상태 확인: getSystemStatus()');
    console.log('');
    console.log('🚀 빠른 시작:');
    console.log('   await deployToProduction() // 기본 설정으로 프로덕션 모드 전환');
} else {
    // Node.js 환경에서 실행되는 경우
    console.log('🖥️ Node.js 환경에서 통합 프로덕션 모드 전환 스크립트 로드됨');
    console.log('⚠️ 이 스크립트는 브라우저 환경에서 실행되어야 합니다.');
    console.log('💡 사용법:');
    console.log('   1. 브라우저에서 index.html 열기');
    console.log('   2. 개발자 도구 콘솔에서: await deployToProduction()');
    console.log('   3. 또는 환경설정 → 프로덕션 모드 전환 버튼 클릭');
    
    process.exit(1);
}

