// 유틸리티 헬퍼 함수들
// 공통으로 사용되는 유틸리티 함수들

// 테이블 이름 통일을 위한 매핑 헬퍼
export const TABLE_MAP = {
    farm_orders: 'farm_orders',
    farm_products: 'farm_products',
    channels: 'farm_channels',
    categories: 'farm_categories',
    farm_customers: 'farm_customers',
    farm_waitlist: 'farm_waitlist',
    // 이미 farm_* 로 들어오면 그대로 반환
    farm_orders: 'farm_orders',
    farm_products: 'farm_products',
    farm_channels: 'farm_channels',
    farm_categories: 'farm_categories',
    farm_customers: 'farm_customers',
    farm_waitlist: 'farm_waitlist',
};

// 테이블명 매핑 함수
export function mapTable(name) { 
    return TABLE_MAP[name] || name; 
}

// Supabase 전용 - LocalStorage 함수들 제거됨
// 모든 데이터는 Supabase를 통해 관리됩니다.

// Supabase 테이블명 매핑
export function getSupabaseTableName(tableName) {
    const tableMapping = {
        'farm_customers': 'farm_customers',
        'farm_orders': 'farm_orders', 
        'farm_products': 'farm_products',
        'farm_categories': 'farm_categories',
        'farm_waitlist': 'farm_waitlist',
        'farm_channels': 'farm_channels',
        'farm_order_statuses': 'farm_order_statuses'
    };
    return tableMapping[tableName] || tableName;
}

// Supabase 전용 - LocalStorage 함수들 제거됨
// 모든 CRUD 작업은 Supabase 데이터 매니저를 통해 수행됩니다.
