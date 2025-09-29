// Supabase 서비스 레이어
// 데이터베이스 CRUD 작업 및 API 호출

import { mapTable, getLocalStorageKey, upsertOne, removeOne } from '../utils/helpers.js';
import { getSupabaseClient } from '../config/supabaseConfig.js';

// 데이터 저장 (upsert)
export async function saveRow(tableName, row) {
    const t = mapTable(tableName);
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 저장만 수행');
        return null;
    }
    const { data, error } = await supabase.from(t).upsert(row, { onConflict: 'id' }).select();
    if (error) throw error;
    return data;
}

// 데이터 삭제
export async function deleteRow(tableName, id) {
    const t = mapTable(tableName);
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 삭제만 수행');
        return null;
    }
    const { error } = await supabase.from(t).delete().eq('id', id);
    if (error) throw error;
    return true;
}

// 데이터 조회
export async function loadRows(tableName) {
    const t = mapTable(tableName);
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 로컬 데이터만 사용');
        return [];
    }
    const { data, error } = await supabase.from(t).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

// 초기 1회 동기화
export async function initialSync() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - 초기 동기화 불가');
        return;
    }
    
    const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist', 'farm_channels'];
    console.log('🔄 초기 동기화 시작...');
    
    for (const t of tables) {
        try {
            // 테이블별 정렬 컬럼 분기 처리
            let query = supabase.from(t).select('*');
            
            if (t === 'farm_channels') {
                // farm_channels는 created_at으로 정렬
                query = query.order('created_at', { ascending: true });
            } else if (t === 'farm_categories') {
                // farm_categories는 created_at으로 정렬 (updated_at 없음)
                query = query.order('created_at', { ascending: true });
            } else {
                // 다른 테이블은 updated_at으로 정렬
                query = query.order('updated_at', { ascending: true });
            }
            
            const { data, error } = await query;
            if (error) {
                console.error(`❌ ${t} 초기 로드 실패:`, error);
                // farm_channels 오류 시 기본 데이터 사용
                if (t === 'farm_channels') {
                    console.log('📱 farm_channels 기본 데이터 사용');
                    const defaultChannels = [
                        { id: 1, name: '직접판매', description: '농장에서 직접 판매', icon: 'store', color: 'green', is_active: true },
                        { id: 2, name: '온라인쇼핑몰', description: '온라인 쇼핑몰 판매', icon: 'shopping', color: 'blue', is_active: true },
                        { id: 3, name: '모바일앱', description: '모바일 앱을 통한 판매', icon: 'mobile', color: 'purple', is_active: true }
                    ];
                    localStorage.setItem('channels', JSON.stringify(defaultChannels));
                    console.log(`✅ ${t} 기본 데이터 로드 완료: ${defaultChannels.length}개`);
                }
                continue;
            }
            
            // 로컬 저장 (키 통일)
            const localKey = getLocalStorageKey(t.replace('farm_', ''));
            localStorage.setItem(localKey, JSON.stringify(data || []));
            console.log(`✅ ${t} 초기 로드 완료: ${(data || []).length}개`);
        } catch (error) {
            console.error(`❌ ${t} 초기 로드 오류:`, error);
            // farm_channels 오류 시 기본 데이터 사용
            if (t === 'farm_channels') {
                console.log('📱 farm_channels 기본 데이터 사용');
                const defaultChannels = [
                    { id: 1, name: '직접판매', description: '농장에서 직접 판매', icon: 'store', color: 'green', is_active: true },
                    { id: 2, name: '온라인쇼핑몰', description: '온라인 쇼핑몰 판매', icon: 'shopping', color: 'blue', is_active: true },
                    { id: 3, name: '모바일앱', description: '모바일 앱을 통한 판매', icon: 'mobile', color: 'purple', is_active: true }
                ];
                localStorage.setItem('channels', JSON.stringify(defaultChannels));
                console.log(`✅ ${t} 기본 데이터 로드 완료: ${defaultChannels.length}개`);
            }
        }
    }
    
    console.log('✅ 초기 동기화 완료');
}

// Realtime 구독 설정
export function setupRealtime() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn('⚠️ Supabase 클라이언트 없음 - Realtime 구독 불가');
        return;
    }
    
    const targets = [
        'farm_orders', 'farm_products', 'farm_channels',
        'farm_categories', 'farm_customers', 'farm_waitlist'
    ];
    
    targets.forEach((table) => {
        const ch = supabase.channel(`rt-${table}`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, (p) => {
                console.log(`🟢 ${table} ${p.eventType}`, p.new || p.old);
                applyRealtimeDelta(table, p);
            })
            .subscribe((status) => console.log(`${table} 채널 상태:`, status));
        window[`__rt_${table}`] = ch; // 디버깅용
    });
    
    console.log('✅ Realtime 구독 설정 완료');
}

// Realtime 델타 반영 함수
export function applyRealtimeDelta(table, payload) {
    const localKey = table.replace('farm_', '');
    
    console.log(`🔄 Realtime 델타 적용: ${table} ${payload.eventType}`, payload.new || payload.old);
    
    if (payload.eventType === 'DELETE') {
        removeOne(localKey, payload.old.id);
    } else {
        upsertOne(localKey, payload.new);
    }
    
    // UI 업데이트 트리거
    const event = new CustomEvent('realtimeUpdate', {
        detail: { table: localKey, eventType: payload.eventType, data: payload.new || payload.old }
    });
    window.dispatchEvent(event);
    
    // OrderManagementSystem 인스턴스가 있으면 직접 업데이트
    if (window.orderSystem) {
        console.log(`🔄 ${localKey} 테이블 UI 업데이트 트리거`);
        // 테이블별 UI 업데이트
        switch (localKey) {
            case 'farm_customers':
                window.orderSystem.loadCustomers();
                break;
            case 'farm_orders':
                window.orderSystem.loadOrders();
                break;
            case 'farm_products':
                window.orderSystem.loadProducts();
                break;
            case 'farm_waitlist':
                window.orderSystem.loadWaitlist();
                break;
        }
    }
}
