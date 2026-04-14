/**
 * 모듈 설정 및 초기화
 * ES6 모듈 시스템을 위한 설정 파일
 */

// 모듈 경로 설정
export const MODULE_PATHS = {
    ORDER_MANAGEMENT: './modules/order-management-module.js',
    ORDER_DETAIL: './modules/order-detail-modal.js',
    PICKING_LIST: './modules/picking-list.js',
    SHIPPING_SETTINGS: './modules/shipping-settings.js'
};

// 모듈 초기화 상태 관리
class ModuleManager {
    constructor() {
        this.initializedModules = new Set();
        this.moduleInstances = new Map();
    }

    async loadModule(moduleName, modulePath) {
        if (this.initializedModules.has(moduleName)) {
            return this.moduleInstances.get(moduleName);
        }

        try {
            const module = await import(modulePath);
            this.initializedModules.add(moduleName);
            this.moduleInstances.set(moduleName, module);
            console.log(`✅ 모듈 로드 완료: ${moduleName}`);
            return module;
        } catch (error) {
            console.error(`❌ 모듈 로드 실패: ${moduleName}`, error);
            throw error;
        }
    }

    isModuleLoaded(moduleName) {
        return this.initializedModules.has(moduleName);
    }

    getModuleInstance(moduleName) {
        return this.moduleInstances.get(moduleName);
    }

    cleanup() {
        this.initializedModules.clear();
        this.moduleInstances.clear();
        console.log('🧹 모듈 매니저 정리 완료');
    }
}

// 전역 모듈 매니저 인스턴스
export const moduleManager = new ModuleManager();

// 모듈 로더 유틸리티 함수들
export const loadOrderManagementModule = () => 
    moduleManager.loadModule('orderManagement', MODULE_PATHS.ORDER_MANAGEMENT);

export const loadOrderDetailModule = () => 
    moduleManager.loadModule('orderDetail', MODULE_PATHS.ORDER_DETAIL);

export const loadPickingListModule = () => 
    moduleManager.loadModule('pickingList', MODULE_PATHS.PICKING_LIST);

export const loadShippingSettingsModule = () => 
    moduleManager.loadModule('shippingSettings', MODULE_PATHS.SHIPPING_SETTINGS);

// 모든 모듈 로드
export const loadAllModules = async () => {
    try {
        await Promise.all([
            loadOrderManagementModule(),
            loadOrderDetailModule(),
            loadPickingListModule(),
            loadShippingSettingsModule()
        ]);
        console.log('✅ 모든 모듈 로드 완료');
    } catch (error) {
        console.error('❌ 모듈 로드 실패:', error);
        throw error;
    }
};

