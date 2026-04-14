/**
 * 🔧 Supabase 설정 파일
 * 
 * Supabase 연결 설정을 관리합니다.
 * 프로덕션과 개발 환경을 자동으로 감지하여 적절한 설정을 사용합니다.
 */

// 환경 감지
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Supabase 설정
const SUPABASE_CONFIG = {
    // 프로덕션 설정
    production: {
        url: 'https://orodbihdndyzgaushsmy.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb2RiaWhkbmR5emdhdXNoc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzkwMzgsImV4cCI6MjA3NTY1NTAzOH0.Sv0_rGrWcu14gkPvFBn1r4WLfFGCSowexuWS3egbfag'
    },
    
    // 개발 설정
    development: {
        url: 'https://orodbihdndyzgaushsmy.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb2RiaWhkbmR5emdhdXNoc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzkwMzgsImV4cCI6MjA3NTY1NTAzOH0.Sv0_rGrWcu14gkPvFBn1r4WLfFGCSowexuWS3egbfag'
    }
};

// 현재 환경에 맞는 설정 선택
const currentConfig = isProduction ? SUPABASE_CONFIG.production : SUPABASE_CONFIG.development;

// 전역 설정 노출
window.SUPABASE_CONFIG = currentConfig;

// Supabase 클라이언트 초기화
let supabaseClient = null;

// Supabase 클라이언트 초기화 함수
function initializeSupabaseClient() {
    try {
        // Supabase 라이브러리 확인 (더 엄격한 검사)
        if (typeof supabase !== 'undefined' && supabase !== null && supabase.createClient) {
            console.log('🔍 Supabase 라이브러리 상태:', {
                'supabase': typeof supabase,
                'supabase.createClient': typeof supabase.createClient,
                'currentConfig': !!currentConfig
            });
            
            supabaseClient = supabase.createClient(currentConfig.url, currentConfig.anonKey);
            window.supabase = supabaseClient;
            window.supabaseClient = supabaseClient; // 추가: window.supabaseClient도 설정
            console.log('✅ Supabase 클라이언트 초기화 완료');
            console.log('🔍 Supabase 클라이언트 상태:', {
                'window.supabase': typeof window.supabase,
                'window.supabaseClient': typeof window.supabaseClient,
                'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG
            });
            return true;
        } else {
            console.error('❌ Supabase 라이브러리가 로드되지 않았습니다:', {
                'typeof supabase': typeof supabase,
                'supabase': supabase,
                'supabase.createClient': supabase ? typeof supabase.createClient : 'N/A'
            });
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        return false;
    }
}

// Supabase 초기화 대기 시스템
let supabaseInitialized = false;
let initializationAttempts = 0;
const maxInitializationAttempts = 20;

// Supabase 초기화 재시도 함수
function retrySupabaseInitialization() {
    if (supabaseInitialized) return;
    
    initializationAttempts++;
    console.log(`🔄 Supabase 초기화 시도 ${initializationAttempts}/${maxInitializationAttempts}`);
    
    // Supabase 라이브러리 상태 확인
    console.log('🔍 현재 Supabase 상태:', {
        'typeof supabase': typeof supabase,
        'supabase': supabase,
        'supabase.createClient': supabase ? typeof supabase.createClient : 'N/A',
        'window.supabase': typeof window.supabase,
        'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG
    });
    
    if (initializeSupabaseClient()) {
        supabaseInitialized = true;
        console.log('✅ Supabase 초기화 성공');
        return;
    }
    
    if (initializationAttempts < maxInitializationAttempts) {
        console.log(`⏳ ${1000}ms 후 재시도...`);
        setTimeout(retrySupabaseInitialization, 1000);
    } else {
        console.error('❌ Supabase 초기화 최대 재시도 횟수 초과');
        console.error('🔍 최종 상태:', {
            'typeof supabase': typeof supabase,
            'supabase': supabase,
            'window.supabase': typeof window.supabase,
            'window.SUPABASE_CONFIG': !!window.SUPABASE_CONFIG
        });
    }
}

// 즉시 초기화 시도 (더 안전한 검사)
if (typeof supabase !== 'undefined' && supabase !== null && typeof supabase.createClient === 'function') {
    console.log('✅ Supabase 라이브러리 즉시 사용 가능, 초기화 진행');
    if (initializeSupabaseClient()) {
        supabaseInitialized = true;
    }
} else {
    console.log('⏳ Supabase 라이브러리 로드 대기 중, 재시도 시작');
    retrySupabaseInitialization();
}

// DOM이 로드된 후 다시 시도
document.addEventListener('DOMContentLoaded', function() {
    if (!supabaseInitialized) {
        console.log('🔄 DOM 로드 후 Supabase 재초기화 시도...');
        retrySupabaseInitialization();
    }
});

// 페이지 로드 완료 후 최종 시도
window.addEventListener('load', function() {
    if (!supabaseInitialized) {
        console.log('🔄 페이지 로드 완료 후 Supabase 최종 초기화 시도...');
        retrySupabaseInitialization();
    }
});

// 설정 업데이트 함수
window.updateSupabaseConfig = function(newConfig) {
    try {
        Object.assign(currentConfig, newConfig);
        window.SUPABASE_CONFIG = currentConfig;
        
        // 클라이언트 재생성
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(currentConfig.url, currentConfig.anonKey);
            window.supabase = supabaseClient;
            console.log('✅ Supabase 설정 업데이트 완료');
        }
    } catch (error) {
        console.error('❌ Supabase 설정 업데이트 실패:', error);
    }
};

// 전역 함수로 등록
window.initializeSupabaseClient = initializeSupabaseClient;

console.log('🔧 Supabase 설정 로드 완료:', currentConfig);
