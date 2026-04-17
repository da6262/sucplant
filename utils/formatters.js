/**
 * 경산다육식물농장 관리시스템 — 공통 데이터 포맷터
 *
 * 날짜·금액·전화번호 변환 함수의 단일 소스(Single Source of Truth).
 * 이 파일에서만 정의하고, 나머지 파일은 여기서 import/window.* 로 사용.
 *
 * ES Module → main.js에서 import 후 window.fmt 로 전역 노출.
 * 컴포넌트 JS (components/*) 에서는 window.fmt.date() 형태로 호출.
 */

// ─────────────────────────────────────────────────────────
// 날짜 포맷
// ─────────────────────────────────────────────────────────

/**
 * 날짜 → YYYY-MM-DD 문자열
 * @param {string|Date|null} val
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatDate(val, fallback = '-') {
    if (!val) return fallback;
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return fallback;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * 날짜 → 'YYYY-MM-DD HH:MM' (목록 내 시각 표시용)
 * @param {string|Date|null} val
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatDateTime(val, fallback = '-') {
    if (!val) return fallback;
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return fallback;
    const date = formatDate(d);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${date} ${hh}:${mm}`;
}

// ─────────────────────────────────────────────────────────
// 금액 포맷
// ─────────────────────────────────────────────────────────

/**
 * 금액 → '₩12,345' 형식 (통화 기호 + 천단위 구분)
 * @param {number|string|null} amount
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatCurrency(amount, fallback = '-') {
    if (amount == null || amount === '') return fallback;
    const n = Number(amount);
    if (isNaN(n)) return fallback;
    return '₩' + n.toLocaleString('ko-KR');
}

/**
 * 금액 → '12,345원' 형식 (단위 뒤에 붙이는 스타일)
 * @param {number|string|null} amount
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatWon(amount, fallback = '-') {
    if (amount == null || amount === '') return fallback;
    const n = Number(amount);
    if (isNaN(n)) return fallback;
    return n.toLocaleString('ko-KR') + '원';
}

// ─────────────────────────────────────────────────────────
// 전화번호 포맷
// ─────────────────────────────────────────────────────────

/**
 * 전화번호 → '010-XXXX-XXXX' 형식
 * @param {string|null} phone
 * @param {string} [fallback='-']
 * @returns {string}
 */
export function formatPhone(phone, fallback = '-') {
    if (!phone) return fallback;
    const n = String(phone).replace(/\D/g, '');
    if (n.length === 11) return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
    if (n.length === 9)  return `0${n.slice(0, 2)}-${n.slice(2, 5)}-${n.slice(5)}`;
    return phone; // 알 수 없는 형식은 그대로 반환
}

// ─────────────────────────────────────────────────────────
// 빈 값 처리
// ─────────────────────────────────────────────────────────

/** 빈값 대시 HTML 상수 — 조건부 fallback 용 (`${value || ND}` 패턴) */
export const ND = '<span class="td-null">—</span>';

/**
 * null/undefined/빈 문자열 → HTML '—' 대시 스팬 반환
 * @param {*} val
 * @param {string} [cls='td-null']
 * @returns {string}
 */
export function nullDash(val, cls = 'td-null') {
    return (val == null || val === '' || val === '-')
        ? `<span class="${cls}">—</span>`
        : String(val);
}

/**
 * null/undefined → '-' 텍스트 (HTML 없이)
 * @param {*} val
 * @returns {string}
 */
export function emptyDash(val) {
    return (val == null || val === '') ? '-' : String(val);
}

// ─────────────────────────────────────────────────────────
// 수량 포맷
// ─────────────────────────────────────────────────────────

/**
 * 수량 → 'N개' 형식
 * @param {number|string|null} qty
 * @param {string} [fallback='0개']
 * @returns {string}
 */
export function formatQty(qty, fallback = '0개') {
    if (qty == null || qty === '') return fallback;
    const n = Number(qty);
    if (isNaN(n)) return fallback;
    return n.toLocaleString('ko-KR') + '개';
}
