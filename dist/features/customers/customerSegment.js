// features/customers/customerSegment.js
// 태그·등급 조합으로 고객 세그먼트 필터링 + 일괄 SMS 발송
// 실제 SMS 전송은 window.sendSolapiSMS 재사용, 개별 결과는 farm_customer_logs 에 기록

/**
 * 현재 로드된 고객 목록에서 사용 중인 모든 태그 수집 (중복 제거, 정렬)
 */
export function collectAllCustomerTags() {
    const set = new Set();
    const list = window.customerDataManager?.farm_customers || [];
    for (const c of list) {
        if (Array.isArray(c.tags)) {
            c.tags.forEach(t => { if (t) set.add(t); });
        }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ko'));
}

/**
 * 필터 조건에 맞는 고객 배열 반환
 * @param {{
 *   tags?: string[],      // 선택된 태그들
 *   tagMatch?: 'any'|'all', // 태그 매치 방식 (기본 any)
 *   grades?: string[],    // 선택된 등급 code
 *   requirePhone?: boolean  // 전화번호 없는 고객 제외 (기본 true — SMS 대상이므로)
 * }} criteria
 */
export function filterCustomersByCriteria(criteria = {}) {
    const list = window.customerDataManager?.farm_customers || [];
    const {
        tags = [],
        tagMatch = 'any',
        grades = [],
        requirePhone = true
    } = criteria;

    return list.filter(c => {
        if (requirePhone && !(c.phone && String(c.phone).replace(/\D/g, ''))) return false;
        if (tags.length > 0) {
            const cTags = Array.isArray(c.tags) ? c.tags : [];
            if (tagMatch === 'all') {
                if (!tags.every(t => cTags.includes(t))) return false;
            } else {
                if (!tags.some(t => cTags.includes(t))) return false;
            }
        }
        if (grades.length > 0) {
            if (!grades.includes(c.grade)) return false;
        }
        return true;
    });
}

/**
 * 치환 변수 적용
 * 지원: {customerName} {customerPhone}
 */
export function personalizeMessage(template, customer) {
    if (!template) return '';
    return String(template)
        .replace(/\{customerName\}/g, customer.name || '고객')
        .replace(/\{customerPhone\}/g, customer.phone || '');
}

/**
 * 세그먼트 일괄 SMS 발송
 * @param {Array<Object>} customers  대상 고객 배열
 * @param {string} template          메시지 템플릿 (원본)
 * @param {{
 *   delayMs?: number,               // 발송 간 지연 (기본 200ms)
 *   maxConsecutiveFail?: number,    // 연속 실패 임계 (기본 5) → 초과 시 중단
 *   onProgress?: (done:number,total:number,lastResult?:{ok:boolean,customer:object,error?:string})=>void,
 *   templateKey?: string            // 환경설정 템플릿 key (로그 메타에 기록용)
 * }} opts
 * @returns {Promise<{ sent:number, failed:number, aborted:boolean, errors:Array }>}
 */
export async function sendBulkSMSToSegment(customers, template, opts = {}) {
    const {
        delayMs = 200,
        maxConsecutiveFail = 5,
        onProgress,
        templateKey = null
    } = opts;

    if (!window.sendSolapiSMS) {
        throw new Error('sendSolapiSMS 함수가 없습니다 (SMS API 미구성).');
    }
    if (!Array.isArray(customers) || customers.length === 0) {
        throw new Error('발송 대상이 없습니다.');
    }
    if (!template || !String(template).trim()) {
        throw new Error('메시지 내용이 비어있습니다.');
    }

    let sent = 0;
    let failed = 0;
    let aborted = false;
    let consecutiveFail = 0;
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        const message = personalizeMessage(template, c);

        let ok = false;
        let errMsg = '';
        try {
            await window.sendSolapiSMS(c.phone, message);
            ok = true;
            sent++;
            consecutiveFail = 0;
        } catch (e) {
            failed++;
            consecutiveFail++;
            errMsg = e?.message || String(e);
            errors.push({ customer_id: c.id, name: c.name, error: errMsg });
            console.warn(`⚠️ 일괄 SMS 실패 (${c.name}):`, errMsg);
        }

        // 타임라인 로그 (성공·실패 모두 기록)
        if (window.customerLogsManager) {
            try {
                await window.customerLogsManager.add(c.id, {
                    log_type: 'etc',
                    title: ok
                        ? `일괄 SMS 발송${templateKey ? ' (' + templateKey + ')' : ''}`
                        : `일괄 SMS 실패${templateKey ? ' (' + templateKey + ')' : ''}: ${errMsg}`,
                    body: ok ? message : null,
                    metadata: {
                        category: 'bulk_sms',
                        success: ok,
                        templateKey: templateKey || null,
                        error: ok ? null : errMsg
                    }
                });
            } catch (logErr) {
                console.warn('⚠️ SMS 로그 기록 실패:', logErr);
            }
        }

        if (onProgress) {
            onProgress(i + 1, customers.length, { ok, customer: c, error: errMsg || undefined });
        }

        // 연속 실패 임계 초과 시 중단 (API 키 문제·크레딧 소진 등 추정)
        if (consecutiveFail >= maxConsecutiveFail) {
            aborted = true;
            console.error(`❌ 연속 실패 ${consecutiveFail}건 → 발송 중단`);
            break;
        }

        if (delayMs > 0 && i < customers.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    return { sent, failed, aborted, errors };
}

// 전역 노출
window.customerSegment = {
    collectAllCustomerTags,
    filterCustomersByCriteria,
    personalizeMessage,
    sendBulkSMSToSegment
};
