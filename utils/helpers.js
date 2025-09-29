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

// LocalStorage 키 생성 함수
export function getLocalStorageKey(tableName) {
    return `farm_management_${tableName}`;
}

// LocalStorage CRUD 헬퍼 함수들
export function loadLocal(table) {
    try {
        return JSON.parse(localStorage.getItem(table)) || [];
    } catch {
        return [];
    }
}

export function saveLocal(table, rows) {
    localStorage.setItem(table, JSON.stringify(rows));
}

export function upsertOne(table, row, key = 'id') {
    const list = loadLocal(table);
    const i = list.findIndex(x => x[key] === row[key]);
    if (i === -1) {
        list.push(row);
    } else {
        list[i] = row;
    }
    saveLocal(table, list);
}

export function removeOne(table, id, key = 'id') {
    const list = loadLocal(table).filter(x => x[key] !== id);
    saveLocal(table, list);
}
