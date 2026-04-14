/**
 * 메모리 관리 헬퍼 함수들
 * 간편한 메모리 저장/조회를 위한 유틸리티 함수들
 */

// 메모리 관리자 import
const memoryManager = require('./memory-manager.js');

/**
 * 프로젝트 정보 저장
 * @param {string} key - 키
 * @param {any} value - 값
 * @param {string} description - 설명
 */
function saveProjectInfo(key, value, description = '') {
    return memoryManager.save(`project_${key}`, value, description);
}

/**
 * 프로젝트 정보 조회
 * @param {string} key - 키
 */
function getProjectInfo(key) {
    return memoryManager.get(`project_${key}`);
}

/**
 * 버전 정보 저장
 * @param {string} version - 버전
 * @param {string} description - 설명
 */
function saveVersion(version, description = '') {
    return memoryManager.save('version', version, description);
}

/**
 * 배포 URL 저장
 * @param {string} url - 배포 URL
 * @param {string} description - 설명
 */
function saveDeploymentUrl(url, description = '') {
    return memoryManager.save('deployment_url', url, description);
}

/**
 * 기능 정보 저장
 * @param {string} feature - 기능명
 * @param {string} description - 설명
 */
function saveFeature(feature, description = '') {
    return memoryManager.save(`feature_${feature}`, true, description);
}

/**
 * 설정 저장
 * @param {string} setting - 설정명
 * @param {any} value - 설정값
 * @param {string} description - 설명
 */
function saveSetting(setting, value, description = '') {
    return memoryManager.save(`setting_${setting}`, value, description);
}

/**
 * 모든 프로젝트 정보 조회
 */
function getAllProjectInfo() {
    return memoryManager.getAll().filter(item => 
        item.key.startsWith('project_') || 
        item.key === 'version' || 
        item.key === 'deployment_url' ||
        item.key.startsWith('feature_') ||
        item.key.startsWith('setting_')
    );
}

/**
 * 메모리 초기화 (개발용)
 */
function clearAllMemories() {
    const allMemories = memoryManager.getAll();
    allMemories.forEach(item => {
        memoryManager.delete(item.key);
    });
    console.log('모든 메모리가 삭제되었습니다.');
}

/**
 * 메모리 백업
 */
function backupMemories() {
    const allMemories = memoryManager.getAll();
    const backup = {
        timestamp: new Date().toISOString(),
        count: allMemories.length,
        memories: allMemories
    };
    
    console.log('메모리 백업:', JSON.stringify(backup, null, 2));
    return backup;
}

// 모듈 내보내기
module.exports = {
    saveProjectInfo,
    getProjectInfo,
    saveVersion,
    saveDeploymentUrl,
    saveFeature,
    saveSetting,
    getAllProjectInfo,
    clearAllMemories,
    backupMemories,
    memoryManager
};

// 사용 예시
if (require.main === module) {
    console.log('메모리 헬퍼 도구 테스트');
    
    // 예시 데이터 저장
    saveVersion('5.0', 'SucPlant 버전 5.0');
    saveDeploymentUrl('korsucplant.web.app', '웹 배포 URL');
    saveFeature('order_management', '주문 관리 시스템');
    saveFeature('auth_system', '인증 시스템');
    saveFeature('mobile_support', '모바일 지원');
    saveSetting('database_type', 'Supabase', '데이터베이스 타입');
    
    // 저장된 정보 조회
    console.log('저장된 정보:');
    console.log(getAllProjectInfo());
}


