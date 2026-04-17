/**
 * 페이지 표시 개수 컨트롤 — 전역 표준
 *
 * 각 데이터 리스트 탭(주문·고객·상품·대기자)의 "표시 N개" <select> 를 통일 관리.
 * 탭별로 중복된 options 및 이벤트 바인딩 로직을 한 곳으로 집약.
 *
 * 사용 예 (각 탭 JS):
 *   window.PageSize.attach('product-page-size', (n) => {
 *       this.itemsPerPage = n;
 *       this.currentPage = 1;
 *       this.renderProducts();
 *   }, this.itemsPerPage);
 */

export const PAGE_SIZE_OPTIONS = [
    { value: 10, label: '10개' },
    { value: 20, label: '20개' },
    { value: 50, label: '50개' },
    { value: 0,  label: '전체' }
];

export const DEFAULT_PAGE_SIZE = 20;

/**
 * <select> 에 표준 옵션 주입 + change 이벤트 바인딩.
 * 이미 attach 된 select 라도 다시 호출하면 onchange 가 덮어쓰기되어 중복 리스너 없음.
 *
 * @param {string} selectId - 대상 <select> 의 id
 * @param {(size:number)=>void} onChange - 값 변경 시 콜백. 0 = 전체 표시
 * @param {number} [initialValue] - 초기 선택값 (기본 20)
 * @returns {HTMLSelectElement|null}
 */
export function attachPageSizeControl(selectId, onChange, initialValue = DEFAULT_PAGE_SIZE) {
    const sel = document.getElementById(selectId);
    if (!sel) return null;

    // 옵션 통일 주입 (탭 HTML 이 옵션을 다르게 정의해도 표준 강제)
    sel.innerHTML = PAGE_SIZE_OPTIONS
        .map(o => {
            const selected = o.value === initialValue ? ' selected' : '';
            return `<option value="${o.value}"${selected}>${o.label}</option>`;
        })
        .join('');

    // onchange 직접 할당 — 재호출 시 자동 교체로 중복 바인딩 방지
    sel.onchange = () => {
        const parsed = parseInt(sel.value, 10);
        const size = Number.isFinite(parsed) ? parsed : 0;
        try { onChange(size); } catch (e) { console.error('PageSize onChange 실패:', e); }
    };

    return sel;
}

// 전역 노출 (모듈 import 불가한 일반 스크립트에서도 사용)
if (typeof window !== 'undefined') {
    window.PageSize = {
        OPTIONS: PAGE_SIZE_OPTIONS,
        DEFAULT: DEFAULT_PAGE_SIZE,
        attach: attachPageSizeControl
    };
}
