// features/customers/customerRfmData.js
// RFM (Recency / Frequency / Monetary) 분석 + 자동 태그 산출
// 고객별 주문 집계로부터 태그 규칙을 적용해 태그 배열을 반환

/**
 * 자동 태그 규칙 임계값 (기본값)
 * 추후 `farm_settings.rfmThresholds` 로 이관 가능하도록 상단 상수화
 */
export const AUTO_TAG_THRESHOLDS = {
    newMax: 2,           // 주문 1~2건 → 신규
    rebuyMin: 5,         // 주문 5~9건 → 재구매
    rebuyMax: 9,
    regularMin: 10,      // 주문 10건+ → 단골
    churnDays: 90,       // 마지막 주문 후 N일 경과 → 이탈위험
    vipAmount: 500000    // 누적 구매 N원 이상 → VIP후보
};

/**
 * 자동 태그 prefix (수동 태그와 구분 없이 동일 문자열 사용 중.
 * 필요 시 '[자동]신규' 형태로 바꿀 수 있음)
 */
export const AUTO_TAGS = Object.freeze(['미구매', '신규', '재구매', '단골', '이탈위험', 'VIP후보']);

/**
 * 고객 한 명의 RFM 통계로부터 자동 태그 배열 계산
 * @param {{orderCount:number, totalAmount:number, lastOrderDate:Date|string|null}} stats
 * @returns {string[]} 태그 배열
 */
export function computeAutoTagsFromStats(stats, t = AUTO_TAG_THRESHOLDS) {
    const out = [];
    const count = Number(stats?.orderCount) || 0;
    const amount = Number(stats?.totalAmount) || 0;
    const lastDate = stats?.lastOrderDate ? new Date(stats.lastOrderDate) : null;

    // 빈도(F) 구간 — 배타적 단일 태그
    if (count === 0)                                 out.push('미구매');
    else if (count <= t.newMax)                      out.push('신규');
    else if (count >= t.regularMin)                  out.push('단골');
    else if (count >= t.rebuyMin && count <= t.rebuyMax) out.push('재구매');
    // count 가 3~4건인 경우는 태그 없음 (버퍼)

    // 이탈위험 (R)
    if (count > 0 && lastDate && !isNaN(lastDate.getTime())) {
        const days = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (days > t.churnDays) out.push('이탈위험');
    }

    // VIP후보 (M)
    if (amount >= t.vipAmount) out.push('VIP후보');

    return out;
}

/**
 * 전화번호 정규화 (숫자만)
 */
function normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
}

/**
 * 전체 주문을 phone 별로 집계 (1회 쿼리 + 메모리 조인)
 * @returns {Map<string,{orderCount:number,totalAmount:number,lastOrderDate:string|null}>}
 */
async function loadOrderStatsByPhone() {
    if (!window.supabaseClient) throw new Error('supabaseClient 없음');

    // 한 번에 가져와 메모리에서 집계 (Supabase 무료 티어 고려, 페이지네이션 미사용)
    const { data, error } = await window.supabaseClient
        .from('farm_orders')
        .select('customer_phone, total_amount, order_date');
    if (error) throw error;

    const map = new Map();
    for (const row of (data || [])) {
        const key = normalizePhone(row.customer_phone);
        if (!key) continue;
        const prev = map.get(key) || { orderCount: 0, totalAmount: 0, lastOrderDate: null };
        prev.orderCount += 1;
        prev.totalAmount += Number(row.total_amount) || 0;
        const d = row.order_date;
        if (d && (!prev.lastOrderDate || d > prev.lastOrderDate)) {
            prev.lastOrderDate = d;
        }
        map.set(key, prev);
    }
    return map;
}

/**
 * 전체 고객 자동 태그 재계산
 * - 기존 수동 태그(AUTO_TAGS 에 속하지 않는 것)는 보존
 * - 자동 태그 카테고리 내 태그만 추가/제거
 * - 태그가 실제로 변한 고객만 DB UPDATE + `tag_change` 로그 기록
 * @param {{thresholds?: typeof AUTO_TAG_THRESHOLDS, onProgress?: (done:number,total:number)=>void}} opts
 * @returns {Promise<{total:number, changed:number, errors:number}>}
 */
export async function recalcAllAutoTags(opts = {}) {
    const t = opts.thresholds || AUTO_TAG_THRESHOLDS;
    if (!window.customerDataManager) throw new Error('customerDataManager 없음');

    const statsByPhone = await loadOrderStatsByPhone();
    const customers = [...(window.customerDataManager.farm_customers || [])];
    let changed = 0;
    let errors = 0;

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        const phoneKey = normalizePhone(c.phone);
        const stats = statsByPhone.get(phoneKey) || { orderCount: 0, totalAmount: 0, lastOrderDate: null };

        const autoTags = computeAutoTagsFromStats(stats, t);
        const existing = Array.isArray(c.tags) ? c.tags.slice() : [];

        // 기존 수동 태그 유지, 자동 범주 태그만 자동 결과로 교체
        const preserved = existing.filter(tg => !AUTO_TAGS.includes(tg));
        const nextTags  = Array.from(new Set([...preserved, ...autoTags]));

        // 변경 여부 확인 (집합 비교)
        const sameSet = existing.length === nextTags.length
            && existing.every(tg => nextTags.includes(tg));

        if (!sameSet) {
            try {
                const added   = nextTags.filter(tg => !existing.includes(tg));
                const removed = existing.filter(tg => !nextTags.includes(tg));

                await window.customerDataManager.updateCustomer(c.id, {
                    ...c,
                    tags: nextTags
                });

                // tag_change 로그 (자동 재계산)
                if (window.customerLogsManager) {
                    try {
                        const parts = [];
                        if (added.length)   parts.push('+ ' + added.join(', '));
                        if (removed.length) parts.push('− ' + removed.join(', '));
                        await window.customerLogsManager.add(c.id, {
                            log_type: 'tag_change',
                            title: `자동 태그 재계산 (${parts.join(' / ') || '변경 없음'})`,
                            metadata: {
                                added, removed,
                                reason: 'auto_rfm',
                                stats: {
                                    orderCount: stats.orderCount,
                                    totalAmount: stats.totalAmount,
                                    lastOrderDate: stats.lastOrderDate
                                }
                            }
                        });
                    } catch (logErr) {
                        console.warn('⚠️ RFM 태그 로그 기록 실패:', logErr);
                    }
                }

                changed++;
            } catch (e) {
                console.error(`❌ 고객 ${c.id} 자동 태그 저장 실패:`, e);
                errors++;
            }
        }

        if (opts.onProgress) opts.onProgress(i + 1, customers.length);
    }

    return { total: customers.length, changed, errors };
}

// 전역 노출
window.customerRfm = {
    AUTO_TAG_THRESHOLDS,
    AUTO_TAGS,
    computeAutoTagsFromStats,
    recalcAllAutoTags
};
