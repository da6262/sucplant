// 환경설정 데이터 관리
// features/settings/settingsData.js

/** 고객관리·환경설정 공통 기본 고객등급 (단일 소스) */
export const DEFAULT_CUSTOMER_GRADES = [
    { name: '일반', code: 'GENERAL', minAmount: 0, discount: 0, color: '#6B7280', icon: 'fas fa-circle' },
    { name: '그린리프', code: 'GREEN_LEAF', minAmount: 100000, discount: 5, color: '#10B981', icon: 'fas fa-hexagon' },
    { name: '레드루비', code: 'RED_RUBY', minAmount: 300000, discount: 8, color: '#EF4444', icon: 'fas fa-octagon' },
    { name: '퍼플엠퍼러', code: 'PURPLE_EMPEROR', minAmount: 500000, discount: 10, color: '#8B5CF6', icon: 'fas fa-pentagon' },
    { name: '블랙다이아몬드', code: 'BLACK_DIAMOND', minAmount: 1000000, discount: 15, color: '#374151', icon: 'fas fa-square' }
];

class SettingsDataManager {
    constructor() {
        console.log('🚀 SettingsDataManager 생성자 호출됨');
        
        // 기본 설정값들
        this.defaultSettings = {
            // 농장 기본 정보
            farm: {
                name: '경산다육식물농장',
                owner: '부대장',
                phone: '',
                address: '',
                businessNumber: ''
            },
            
            // 시스템 설정
            system: {
                autoBackup: true,
                systemLogs: true,
                debugMode: false,
                dataRetentionDays: 365
            },
            
            // 배송 설정
            shipping: {
                defaultShippingFee: 3000,
                freeShippingThreshold: 50000,
                shippingMethods: ['택배', '직접배송', '픽업']
            },
            
            // 알림 설정
            notifications: {
                emailNotifications: true,
                smsNotifications: true,
                orderAlerts: true,
                lowStockAlerts: true
            },
            
            // SMS 템플릿 설정
            smsTemplates: {
                orderConfirm: '[경산다육식물농장] {customerName}님, 주문이 접수되었습니다.\n\n■ 주문번호 {orderNumber}\n\n■ 주문상세\n\n{orderDetails}\n\n■ 결제 정보\n{paymentInfo}\n\n■ 입금계좌 농협 010-9745-6245-08 (예금주: 경산식물원(배은희))\n\n감사합니다.',
                paymentConfirm: '[경산다육식물농장] {customerName}님, 입금이 확인되었습니다.\n주문번호: {orderNumber}\n배송준비를 시작합니다.',
                shippingStart: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송을 시작했습니다.\n주문번호: {orderNumber}\n택배사: {shippingCompany}\n송장번호: {trackingNumber}',
                shippingComplete: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송완료되었습니다.\n주문번호: {orderNumber}\n감사합니다.',
                waitlistNotify: '[경산다육식물농장] {customerName}님, 대기하신 상품이 입고되었습니다.\n상품명: {productName}\n수량: {quantity}개\n주문 가능합니다.'
            },
            
            // 고객 등급 설정 (DEFAULT_CUSTOMER_GRADES와 동일하게 유지)
            customerGrades: JSON.parse(JSON.stringify(DEFAULT_CUSTOMER_GRADES)),
            
            // 판매 채널: farm_channels 테이블 기준으로 통합됨. 구형 farm_settings.salesChannels 미사용.
            // salesChannels: [],

            // 주문 상태 설정
            orderStatuses: [
                { value: '주문접수', label: '주문접수', color: '#6B7280', description: '새로 접수된 주문' },
                { value: '고객안내', label: '고객안내', color: '#3B82F6', description: '고객에게 안내 완료' },
                { value: '입금대기', label: '입금대기', color: '#F59E0B', description: '입금 대기 중' },
                { value: '입금확인', label: '입금확인', color: '#3B82F6', description: '결제가 확인된 주문' },
                { value: '상품준비', label: '상품준비', color: '#8B5CF6', description: '상품 준비 중' },
                { value: '배송준비', label: '배송준비', color: '#F59E0B', description: '포장 및 배송 준비 중' },
                { value: '배송중', label: '배송중', color: '#8B5CF6', description: '배송이 시작된 주문' },
                { value: '배송완료', label: '배송완료', color: '#10B981', description: '고객에게 배송 완료된 주문' },
                { value: '주문취소', label: '주문취소', color: '#EF4444', description: '취소된 주문' },
                { value: '환불완료', label: '환불완료', color: '#F97316', description: '환불 처리된 주문' }
            ]
        };
        
        this.settings = {};
        this.initializeSettings();
    }
    
    // 설정 초기화
    async initializeSettings() {
        try {
            // Supabase 클라이언트 확인 및 초기화 시도
            await this.ensureSupabaseClient();
            
            this.settings = await this.loadSettings();
            console.log('✅ 설정 초기화 완료');
        } catch (error) {
            console.error('❌ 설정 초기화 실패:', error);
            this.settings = this.defaultSettings;
        }
    }
    
    // Supabase 클라이언트 확인 및 초기화
    async ensureSupabaseClient() {
        try {
            // 이미 초기화된 클라이언트가 있는지 확인
            if (window.supabaseClient) {
                console.log('✅ Supabase 클라이언트 이미 초기화됨');
                return true;
            }
            
            // window.supabase가 있는지 확인
            if (window.supabase && window.supabase.createClient && window.SUPABASE_CONFIG) {
                console.log('🔄 Supabase 클라이언트 초기화 시도...');
                window.supabaseClient = window.supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('✅ Supabase 클라이언트 초기화 완료');
                return true;
            }
            
            console.warn('⚠️ Supabase 클라이언트 초기화 불가');
            return false;
        } catch (error) {
            console.error('❌ Supabase 클라이언트 초기화 실패:', error);
            return false;
        }
    }
    
    // 설정 로드
    async loadSettings() {
        try {
            const ok = await this.ensureSupabaseClient();
            if (ok && window.supabaseClient) {
                try {
                    const { data, error } = await window.supabaseClient
                        .from('farm_settings')
                        .select('*')
                        .single();
                    
                    if (!error && data) {
                        console.log('✅ Supabase에서 설정 로드 완료');
                        return this.mergeWithDefaults(data.settings);
                    } else {
                        console.log('⚠️ Supabase 설정 없음, 기본값 사용');
                        return this.defaultSettings;
                    }
                } catch (supabaseError) {
                    console.log('⚠️ Supabase 테이블 없음 (farm_settings), 기본값 사용');
                    console.log('💡 farm_settings 테이블을 생성하려면 create-farm-settings-table.sql 파일을 Supabase SQL Editor에서 실행하세요');
                    return this.defaultSettings;
                }
            }
            
            console.log('📋 기본 설정값 사용 (Supabase 미연결)');
            return this.defaultSettings;
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            return this.defaultSettings;
        }
    }
    
    // 기본값과 병합
    mergeWithDefaults(savedSettings) {
        const merged = JSON.parse(JSON.stringify(this.defaultSettings));
        
        // 판매 채널은 farm_channels 테이블 기준으로 통합됨. 구형 salesChannels 키는 사용하지 않음.
        if (!merged.salesChannels) merged.salesChannels = [];
        
        // 깊은 병합
        Object.keys(savedSettings).forEach(key => {
            if (key === 'salesChannels') return; // farm_settings 내 구형 채널 데이터 무시
            if (typeof savedSettings[key] === 'object' && !Array.isArray(savedSettings[key])) {
                merged[key] = { ...merged[key], ...savedSettings[key] };
            } else if (key === 'customerGrades') {
                // 고객등급: DB에 유효한 배열이 있으면 사용, 없으면 공통 기본 5단계 사용 (고객관리와 동일)
                const fromDb = savedSettings[key];
                if (Array.isArray(fromDb) && fromDb.length > 0) {
                    console.log('📋 Supabase에서 저장된 고객등급 사용:', fromDb.length, '개');
                    merged[key] = fromDb;
                } else {
                    console.log('📋 고객등급 없음/비어있음 → 공통 기본 5단계 사용 (고객관리와 동일)');
                    merged[key] = JSON.parse(JSON.stringify(DEFAULT_CUSTOMER_GRADES));
                }
            } else {
                merged[key] = savedSettings[key];
            }
        });
        
        return merged;
    }
    
    // 설정 저장
    async saveSettings() {
        try {
            const ok = await this.ensureSupabaseClient();
            if (!ok || !window.supabaseClient) {
                console.error('❌ Supabase 클라이언트가 없습니다');
                throw new Error('Supabase가 초기화되지 않았습니다. API 모드로 전환하거나 Supabase 설정을 확인하세요.');
            }
            const supabase = window.supabaseClient;
            // 판매 채널은 farm_channels 테이블로 통합. 저장 시 구형 salesChannels 제외
            const settingsToSave = { ...this.settings };
            delete settingsToSave.salesChannels;
            const { error } = await supabase
                .from('farm_settings')
                .upsert({
                    id: 1,
                    settings: settingsToSave,
                    updated_at: new Date().toISOString()
                });
            if (error) {
                console.error('❌ Supabase 설정 저장 실패:', error);
                throw new Error(error.message || 'Supabase 저장 실패');
            }
            console.log('✅ Supabase에 설정 저장 완료');
            return true;
        } catch (error) {
            console.error('❌ 설정 저장 실패:', error);
            throw error;
        }
    }
    
    // 특정 설정 업데이트
    async updateSetting(category, key, value) {
        try {
            if (!this.settings[category]) {
                this.settings[category] = {};
            }
            this.settings[category][key] = value;
            await this.saveSettings();
            console.log(`✅ 설정 업데이트: ${category}.${key} = ${value}`);
            return true;
        } catch (error) {
            console.error('❌ 설정 업데이트 실패:', error);
            return false;
        }
    }
    
    // 설정 가져오기
    getSetting(category, key) {
        try {
            return this.settings[category]?.[key];
        } catch (error) {
            console.error('❌ 설정 가져오기 실패:', error);
            return null;
        }
    }
    
    // 전체 설정 가져오기
    getAllSettings() {
        return this.settings;
    }
    
    // 설정 초기화
    resetSettings() {
        try {
            this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
            this.saveSettings();
            console.log('✅ 설정 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ 설정 초기화 실패:', error);
            return false;
        }
    }
    
    // 고객등급 강제 업데이트 (5단계 시스템으로)
    async forceUpdateCustomerGrades() {
        try {
            console.log('🔄 고객등급을 5단계 시스템으로 강제 업데이트');
            this.settings.customerGrades = JSON.parse(JSON.stringify(this.defaultSettings.customerGrades));
            await this.saveSettings();
            console.log('✅ 고객등급 강제 업데이트 완료');
            return true;
        } catch (error) {
            console.error('❌ 고객등급 강제 업데이트 실패:', error);
            return false;
        }
    }
    
    // Supabase에서 설정 강제 재로드
    async forceReloadSettings() {
        try {
            console.log('🔄 Supabase에서 설정 강제 재로드');
            this.settings = await this.loadSettings();
            console.log('✅ 설정 강제 재로드 완료');
            return true;
        } catch (error) {
            console.error('❌ 설정 강제 재로드 실패:', error);
            return false;
        }
    }
    
    // 고객 등급 관리
    addCustomerGrade(grade) {
        try {
            this.settings.customerGrades.push(grade);
            this.saveSettings();
            console.log('✅ 고객 등급 추가:', grade);
            return true;
        } catch (error) {
            console.error('❌ 고객 등급 추가 실패:', error);
            return false;
        }
    }
    
    updateCustomerGrade(index, grade) {
        try {
            this.settings.customerGrades[index] = grade;
            this.saveSettings();
            console.log('✅ 고객 등급 업데이트:', grade);
            return true;
        } catch (error) {
            console.error('❌ 고객 등급 업데이트 실패:', error);
            return false;
        }
    }
    
    deleteCustomerGrade(index) {
        try {
            this.settings.customerGrades.splice(index, 1);
            this.saveSettings();
            console.log('✅ 고객 등급 삭제:', index);
            return true;
        } catch (error) {
            console.error('❌ 고객 등급 삭제 실패:', error);
            return false;
        }
    }
    
    // 판매 채널: farm_channels 테이블로 통합됨. CRUD는 features/settings/salesChannelsData.js 사용.
    // addSalesChannel / updateSalesChannel / deleteSalesChannel 제거됨.

    // 주문 상태 관리
    addOrderStatus(status) {
        try {
            this.settings.orderStatuses.push(status);
            this.saveSettings();
            console.log('✅ 주문 상태 추가:', status);
            return true;
        } catch (error) {
            console.error('❌ 주문 상태 추가 실패:', error);
            return false;
        }
    }
    
    updateOrderStatus(index, status) {
        try {
            this.settings.orderStatuses[index] = status;
            this.saveSettings();
            console.log('✅ 주문 상태 업데이트:', status);
            return true;
        } catch (error) {
            console.error('❌ 주문 상태 업데이트 실패:', error);
            return false;
        }
    }
    
    deleteOrderStatus(index) {
        try {
            this.settings.orderStatuses.splice(index, 1);
            this.saveSettings();
            console.log('✅ 주문 상태 삭제:', index);
            return true;
        } catch (error) {
            console.error('❌ 주문 상태 삭제 실패:', error);
            return false;
        }
    }
}

// 전역 인스턴스 생성
const settingsDataManager = new SettingsDataManager();

// 전역으로 등록
window.settingsDataManager = settingsDataManager;
window.forceUpdateCustomerGrades = () => settingsDataManager.forceUpdateCustomerGrades();
window.forceReloadSettings = () => settingsDataManager.forceReloadSettings();

export { SettingsDataManager, settingsDataManager };

