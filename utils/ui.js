/**
 * 경산다육식물농장 관리시스템 — 공통 UI 렌더러
 *
 * ─── 채택 현황 (v3.2.29) ───────────────────────────────────────────
 *  renderEmptyRow   ✅ 전체 채택 완료
 *    waitlistUI.js · customerUI.js · productUI.js(×2)
 *    shippingUI.js · orderForm.js · shipping-management.js
 *
 *  renderFilterBar  ✅ 구조적 채택 완료
 *    배송관리(shipping-management.js) filter-bar 표준 클래스로 전환.
 *    필터 바 높이·간격·색상 = CSS 변수 단일 제어 달성.
 *    JS 동적 생성 필요 시 이 함수로 wrapping.
 *
 *  renderPageHeader ⬜ 대기
 *    페이지 헤더가 HTML 컴포넌트에 정적으로 선언되어 있어 JS 생성 불필요.
 *
 *  [테이블 표준화 완료 목록]
 *  - table-ui 적용: waitlist · customer · product · shipping(메인+추적)
 *  - order-list-compact 적용: 주문관리
 *  - 전 테이블 th 하드코딩 제거 → .table-ui thead th CSS 변수 단일 제어
 *  - 전 데이터 td py-* / text-sm / text-xs 제거 → CSS 변수 상속
 * ────────────────────────────────────────────────────────────────────
 *
 * 사용 예:
 *   import { renderPageHeader } from '../../utils/ui.js';
 *
 *   container.insertAdjacentHTML('afterbegin', renderPageHeader({
 *       title   : '주문 관리',
 *       subtitle: '전체 주문 내역을 조회합니다',
 *       actions : `<button class="btn-primary" onclick="openOrderModal()">+ 새 주문</button>`
 *   }));
 *
 * 또는 전역 함수로:
 *   window.renderPageHeader({ title: '상품 관리' })
 */

/**
 * 페이지 상단 헤더 HTML 생성
 * @param {object}  opts
 * @param {string}  opts.title      - 필수: 페이지 제목
 * @param {string}  [opts.subtitle] - 선택: 부제목 (page-subtitle)
 * @param {string}  [opts.actions]  - 선택: 우측 액션 버튼 HTML 문자열
 * @returns {string} HTML 문자열
 */
export function renderPageHeader({ title, subtitle = '', actions = '' }) {
    const sub = subtitle
        ? `<p class="page-subtitle">${subtitle}</p>`
        : '';
    const act = actions
        ? `<div class="action-group">${actions}</div>`
        : '';
    return `
<div class="page-header">
  <div>
    <h2 class="page-title">${title}</h2>
    ${sub}
  </div>
  ${act}
</div>`.trim();
}

/**
 * 필터 바 래퍼 HTML 생성
 * @param {string} innerHtml - 필터 바 내부 HTML (input, select, button 등)
 * @returns {string} HTML 문자열
 */
export function renderFilterBar(innerHtml = '') {
    return `<div class="filter-bar">${innerHtml}</div>`;
}

/**
 * 빈 테이블 행 HTML 생성 (no-data 상태)
 * @param {number} colspan   - 테이블 컬럼 수
 * @param {string} [message] - 표시할 메시지
 * @returns {string} HTML 문자열
 */
export function renderEmptyRow(colspan, message = '데이터가 없습니다') {
    return `
<tr>
  <td colspan="${colspan}" class="py-10 text-center text-sm text-gray-400">
    <i class="fas fa-inbox text-2xl mb-2 block opacity-40"></i>
    ${message}
  </td>
</tr>`.trim();
}

// ─── 전역 등록 (ES 모듈 미지원 환경 대응) ───────────────────────
window.renderPageHeader = renderPageHeader;
window.renderFilterBar  = renderFilterBar;
window.renderEmptyRow   = renderEmptyRow;
