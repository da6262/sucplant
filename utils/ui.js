/**
 * 경산다육식물농장 관리시스템 — 공통 UI 렌더러
 * ════════════════════════════════════════════════════════════════
 *  이 파일이 유일한 UI 생산 공장이다.
 *  모든 팝업·폼·배지·버튼은 반드시 이 공장을 통해 생산한다.
 *  raw Tailwind 클래스(py-1, text-xs, text-gray-* 등)는
 *  중앙 명령에 대한 반역으로 간주하며 이 파일에 존재할 수 없다.
 *
 * ─── 채택 현황 ────────────────────────────────────────────────
 *  renderEmptyRow       ✅ 전체 채택
 *  renderFilterBar      ✅ 전체 채택
 *  renderPageHeader     ✅ 전체 채택
 *  renderModal          ✅ v3.4 표준화
 *  renderField          ✅ v3.4 표준화
 *  renderFormSection    ✅ v3.4 표준화
 *  renderBadge          ✅ v3.4 표준화
 *  renderBtnIcon        ✅ v3.4 표준화
 *  renderBtnGroup       ✅ v3.4 표준화
 *  renderConfirmDialog  ✅ v3.4 표준화
 *  renderInfoRow        ✅ v3.4 표준화
 * ────────────────────────────────────────────────────────────────
 */

// ══════════════════════════════════════════════════════════════
// 1. 페이지 헤더
// ══════════════════════════════════════════════════════════════

/**
 * 페이지 상단 헤더 HTML 생성
 * @param {object}  opts
 * @param {string}  opts.title      - 필수: 페이지 제목
 * @param {string}  [opts.subtitle] - 선택: 부제목
 * @param {string}  [opts.actions]  - 선택: 우측 액션 버튼 HTML
 * @returns {string} HTML 문자열
 */
export function renderPageHeader({ title, subtitle = '', actions = '' }) {
    const sub = subtitle ? `<p class="page-subtitle">${subtitle}</p>` : '';
    const act = actions ? `<div class="action-group">${actions}</div>` : '';
    return `
<div class="page-header">
  <div>
    <h2 class="page-title">${title}</h2>
    ${sub}
  </div>
  ${act}
</div>`.trim();
}

// ══════════════════════════════════════════════════════════════
// 2. 필터 바
// ══════════════════════════════════════════════════════════════

/**
 * 필터 바 래퍼 HTML 생성
 * @param {string} innerHtml - 필터 바 내부 HTML
 * @returns {string} HTML 문자열
 */
export function renderFilterBar(innerHtml = '') {
    return `<div class="filter-bar">${innerHtml}</div>`;
}

// ══════════════════════════════════════════════════════════════
// 3. 빈 테이블 행
// ══════════════════════════════════════════════════════════════

/**
 * 빈 테이블 행 HTML 생성
 * @param {number} colspan
 * @param {string} [message]
 * @returns {string} HTML 문자열
 */
export function renderEmptyRow(colspan, message = '데이터가 없습니다') {
    return `
<tr>
  <td colspan="${colspan}" style="padding:40px 8px; text-align:center; color:var(--text-muted); font-size:13px;">
    <i class="fas fa-inbox" style="font-size:24px; display:block; margin-bottom:8px; opacity:0.4;"></i>
    ${message}
  </td>
</tr>`.trim();
}

// ══════════════════════════════════════════════════════════════
// 4. 모달 — 팝업의 유일한 생산 공장
// ══════════════════════════════════════════════════════════════

/**
 * 표준 모달 HTML 생성
 *
 * @param {object}   opts
 * @param {string}   opts.id          - 모달 overlay ID
 * @param {string}   opts.title       - 모달 제목
 * @param {string}   [opts.size]      - 'sm' | 'md'(default) | 'lg' | 'xl' | 'wide'
 * @param {string}   [opts.icon]      - FontAwesome 아이콘 클래스 (예: 'fa-plus')
 * @param {string}   opts.body        - modal-body 내부 HTML
 * @param {string}   [opts.footer]    - modal-footer 내부 HTML (없으면 footer 생략)
 * @param {string}   [opts.closeCall] - X 버튼 onclick 함수 문자열 (기본: overlay 클릭 닫기)
 * @returns {string} HTML 문자열
 */
export function renderModal({ id, title, size = 'md', icon = '', body, footer = '', closeCall = '' }) {
    const sizeClass = size === 'sm'   ? 'modal-sm'
                    : size === 'lg'   ? 'modal-lg'
                    : size === 'xl'   ? 'modal-xl'
                    : size === 'wide' ? 'modal-container-wide'
                    :                   'modal-md';

    const iconHtml = icon
        ? `<span style="width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--primary-accent),var(--primary-accent-dark));display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0;"><i class="fas ${icon}"></i></span>`
        : '';

    const closeFn = closeCall || `document.getElementById('${id}')?.remove()`;
    const footerHtml = footer
        ? `<div class="modal-footer">${footer}</div>`
        : '';

    return `
<div class="modal-overlay" id="${id}" onclick="if(event.target===this){${closeFn}}">
  <div class="modal-container ${sizeClass}" onclick="event.stopPropagation()">
    <div class="modal-header">
      <div class="flex-center flex-gap-2">
        ${iconHtml}
        <span class="modal-title">${title}</span>
      </div>
      <button class="modal-close-btn" onclick="${closeFn}" title="닫기">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      ${body}
    </div>
    ${footerHtml}
  </div>
</div>`.trim();
}

// ══════════════════════════════════════════════════════════════
// 5. 폼 필드 — 모든 입력창의 유일한 생산 공장
// ══════════════════════════════════════════════════════════════

/**
 * 표준 폼 필드 HTML 생성 (label + control)
 *
 * @param {object}   opts
 * @param {string}   opts.label        - 라벨 텍스트
 * @param {string}   opts.name         - input name/id
 * @param {string}   [opts.type]       - 'text'|'number'|'tel'|'email'|'date'|'select'|'textarea'|'readonly'
 * @param {string}   [opts.value]      - 초기값
 * @param {string}   [opts.placeholder]
 * @param {boolean}  [opts.required]   - 필수 여부 (* 표시)
 * @param {string}   [opts.helper]     - 도움말 텍스트
 * @param {string}   [opts.error]      - 에러 텍스트
 * @param {Array}    [opts.options]    - select 옵션 배열 [{value, label, selected}]
 * @param {number}   [opts.cols]       - form-col-* (3|4|6|8|12, 기본 6)
 * @param {boolean}  [opts.readonly]
 * @param {boolean}  [opts.disabled]
 * @param {string}   [opts.suffix]     - 우측 단위 텍스트 (예: '원', 'kg')
 * @param {string}   [opts.btnHtml]    - 우측 버튼 HTML (form-input-group 사용)
 * @param {string}   [opts.extraAttrs] - 추가 HTML 속성 문자열
 * @param {number}   [opts.rows]       - textarea rows
 * @returns {string} HTML 문자열
 */
export function renderField({
    label, name, type = 'text', value = '', placeholder = '',
    required = false, helper = '', error = '',
    options = [], cols = 6,
    readonly = false, disabled = false,
    suffix = '', btnHtml = '', extraAttrs = '', rows = 3
}) {
    const req = required ? '<span class="req">*</span>' : '';
    const roAttr = readonly ? ' readonly' : '';
    const disAttr = disabled ? ' disabled' : '';
    const extraA = extraAttrs ? ` ${extraAttrs}` : '';
    const phAttr = placeholder ? ` placeholder="${placeholder}"` : '';

    let controlHtml = '';

    if (type === 'select') {
        const optionsHtml = options.map(o => {
            const sel = (o.selected || String(o.value) === String(value)) ? ' selected' : '';
            return `<option value="${o.value}"${sel}>${o.label}</option>`;
        }).join('');
        controlHtml = `<select id="${name}" name="${name}" class="form-control"${roAttr}${disAttr}${extraA}>${optionsHtml}</select>`;

    } else if (type === 'textarea') {
        const escapedVal = value ? value.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        controlHtml = `<textarea id="${name}" name="${name}" class="form-control xf-memo" rows="${rows}"${roAttr}${disAttr}${phAttr}${extraA}>${escapedVal}</textarea>`;

    } else if (type === 'readonly') {
        const displayVal = value || '<span class="td-null">—</span>';
        controlHtml = `<div class="form-control" style="background:var(--bg-light);color:var(--text-secondary);line-height:40px;cursor:default;">${displayVal}</div>`;

    } else {
        const escapedVal = value ? String(value).replace(/"/g, '&quot;') : '';
        controlHtml = `<input type="${type}" id="${name}" name="${name}" class="form-control" value="${escapedVal}"${phAttr}${roAttr}${disAttr}${extraA}>`;
    }

    // suffix 또는 btnHtml이 있으면 input-group으로 래핑
    if (suffix) {
        controlHtml = `<div class="form-input-group with-unit">${controlHtml}<span class="form-input-unit">${suffix}</span></div>`;
    } else if (btnHtml) {
        controlHtml = `<div class="form-input-group">${controlHtml}${btnHtml}</div>`;
    }

    const helperHtml = helper ? `<p class="form-helper">${helper}</p>` : '';
    const errorHtml  = error  ? `<p class="form-error">${error}</p>` : '';

    return `
<div class="form-col-${cols}">
  <label class="form-label" for="${name}">${label}${req}</label>
  ${controlHtml}
  ${helperHtml}
  ${errorHtml}
</div>`.trim();
}

// ══════════════════════════════════════════════════════════════
// 6. 폼 섹션 그룹
// ══════════════════════════════════════════════════════════════

/**
 * 폼 내 섹션 그룹 HTML 생성
 *
 * @param {object} opts
 * @param {string} opts.title   - 섹션 제목
 * @param {string} opts.inner   - 섹션 내부 HTML (renderField 결과물 나열)
 * @param {number} [opts.cols]  - form-col-* (기본 12)
 * @returns {string} HTML 문자열
 */
export function renderFormSection({ title, inner, cols = 12 }) {
    return `
<div class="form-section form-col-${cols}">
  <div class="form-section-title">${title}</div>
  <div class="form-section-inner">
    ${inner}
  </div>
</div>`.trim();
}

/**
 * 폼 그리드 래퍼 HTML 생성
 * @param {string} innerHtml - renderField / renderFormSection 결과 HTML
 * @returns {string} HTML 문자열
 */
export function renderFormGrid(innerHtml = '') {
    return `<div class="form-grid">${innerHtml}</div>`;
}

/**
 * 폼 액션 버튼 영역 HTML 생성
 * @param {string} innerHtml - 버튼 HTML
 * @returns {string} HTML 문자열
 */
export function renderFormActions(innerHtml = '') {
    return `<div class="form-actions form-col-12">${innerHtml}</div>`;
}

// ══════════════════════════════════════════════════════════════
// 7. 배지 — 모든 상태 표시의 유일한 생산 공장
// ══════════════════════════════════════════════════════════════

/**
 * 표준 상태 배지 HTML 생성
 *
 * 사용 가능한 variant:
 *   neutral | success | warning | info | danger | purple | sky | orange | green | gray
 *   rich-black | rich-purple | rich-red | rich-green | rich-blue | rich-gray
 *
 * @param {string} text      - 배지 텍스트
 * @param {string} [variant] - 배지 색상 변형 (기본: 'neutral')
 * @returns {string} HTML 문자열
 */
export function renderBadge(text, variant = 'neutral') {
    return `<span class="badge badge-${variant}">${text}</span>`;
}

/**
 * 주문 상태 → 배지 자동 매핑
 * @param {string} status
 * @returns {string} HTML 문자열
 */
export function renderOrderStatusBadge(status) {
    const MAP = {
        '주문접수':  ['warning',  '주문접수'],
        '결제완료':  ['info',     '결제완료'],
        '준비중':    ['sky',      '준비중'],
        '배송중':    ['purple',   '배송중'],
        '배송완료':  ['success',  '배송완료'],
        '취소':      ['danger',   '취소'],
        '반품':      ['orange',   '반품'],
        '환불':      ['neutral',  '환불'],
    };
    const [v, label] = MAP[status] || ['neutral', status || '—'];
    return renderBadge(label, v);
}

/**
 * 고객 등급 → 배지 자동 매핑
 * @param {string} grade
 * @returns {string} HTML 문자열
 */
export function renderGradeBadge(grade) {
    const MAP = {
        'VIP':    'rich-purple',
        '단골':   'rich-green',
        '일반':   'neutral',
        '신규':   'info',
        '휴면':   'gray',
    };
    return renderBadge(grade || '일반', MAP[grade] || 'neutral');
}

// ══════════════════════════════════════════════════════════════
// 8. 아이콘 버튼 / 버튼 그룹 — 테이블 행 액션
// ══════════════════════════════════════════════════════════════

/**
 * 아이콘 버튼 HTML 생성 (테이블 행 수정·삭제·복제 등)
 *
 * @param {object} opts
 * @param {string} opts.icon    - FontAwesome 아이콘 클래스 (예: 'fa-pen')
 * @param {string} [opts.variant] - 'edit'|'delete'|'copy'|'primary' (기본: 'edit')
 * @param {string} [opts.title] - tooltip 텍스트
 * @param {string} opts.onclick - onclick 핸들러 문자열
 * @returns {string} HTML 문자열
 */
export function renderBtnIcon({ icon, variant = 'edit', title = '', onclick }) {
    return `<button class="btn-icon btn-icon-${variant}" title="${title}" onclick="${onclick}"><i class="fas ${icon}"></i></button>`;
}

/**
 * 버튼 그룹 컨테이너 HTML 생성
 * @param {string} innerHtml - renderBtnIcon 결과 나열
 * @returns {string} HTML 문자열
 */
export function renderBtnGroup(innerHtml = '') {
    return `<div class="btn-group">${innerHtml}</div>`;
}

/**
 * 표준 편집·삭제 버튼 쌍 생성 (테이블 행 액션에서 가장 빈번한 패턴)
 *
 * @param {string} editCall   - 수정 버튼 onclick
 * @param {string} deleteCall - 삭제 버튼 onclick
 * @returns {string} HTML 문자열
 */
export function renderEditDeleteBtns(editCall, deleteCall) {
    return renderBtnGroup(
        renderBtnIcon({ icon: 'fa-pen',   variant: 'edit',   title: '수정', onclick: editCall }) +
        renderBtnIcon({ icon: 'fa-trash', variant: 'delete', title: '삭제', onclick: deleteCall })
    );
}

// ══════════════════════════════════════════════════════════════
// 9. 확인 다이얼로그
// ══════════════════════════════════════════════════════════════

/**
 * 확인/취소 다이얼로그 HTML 생성
 *
 * @param {object} opts
 * @param {string} opts.id             - 모달 ID
 * @param {string} opts.title          - 다이얼로그 제목
 * @param {string} opts.message        - 본문 메시지 HTML
 * @param {string} [opts.confirmLabel] - 확인 버튼 텍스트 (기본: '확인')
 * @param {string} [opts.cancelLabel]  - 취소 버튼 텍스트 (기본: '취소')
 * @param {string} opts.onConfirm      - 확인 onclick 핸들러 문자열
 * @param {string} [opts.variant]      - 'danger'|'primary' (기본: 'danger')
 * @returns {string} HTML 문자열
 */
export function renderConfirmDialog({
    id, title, message, confirmLabel = '확인',
    cancelLabel = '취소', onConfirm, variant = 'danger'
}) {
    const closeFn = `document.getElementById('${id}')?.remove()`;
    const confirmBtnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';
    const iconClass = variant === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle';
    const iconColor = variant === 'danger' ? 'var(--danger)' : 'var(--info)';

    return renderModal({
        id, title, size: 'sm', closeCall: closeFn,
        body: `
<div class="flex-center flex-gap-3" style="padding:8px 0 16px;">
  <i class="fas ${iconClass}" style="font-size:28px;color:${iconColor};flex-shrink:0;"></i>
  <div class="txt-body">${message}</div>
</div>`,
        footer: `
<button class="btn-secondary" onclick="${closeFn}">${cancelLabel}</button>
<button class="${confirmBtnClass}" onclick="${onConfirm};${closeFn}">${confirmLabel}</button>`
    });
}

// ══════════════════════════════════════════════════════════════
// 10. 정보 행 — 레이블·값 쌍 표시
// ══════════════════════════════════════════════════════════════

/**
 * 라벨·값 정보 행 HTML 생성 (상세 패널 등에서 사용)
 *
 * @param {string} label
 * @param {string|number} value
 * @param {string} [valueClass] - 값에 추가할 CSS 클래스
 * @returns {string} HTML 문자열
 */
export function renderInfoRow(label, value, valueClass = '') {
    const displayVal = (value === null || value === undefined || value === '')
        ? '<span class="td-null">—</span>'
        : value;
    return `
<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--border-light);">
  <span class="txt-muted txt-sm">${label}</span>
  <span class="${valueClass || 'txt-body'}">${displayVal}</span>
</div>`.trim();
}

/**
 * 섹션 소제목 HTML 생성
 * @param {string} title
 * @returns {string} HTML 문자열
 */
export function renderSectionTitle(title) {
    return `<div class="modal-section-title">${title}</div>`;
}

// ══════════════════════════════════════════════════════════════
// 전역 등록 (ES 모듈 미지원 환경 대응)
// ══════════════════════════════════════════════════════════════
window.renderPageHeader     = renderPageHeader;
window.renderFilterBar      = renderFilterBar;
window.renderEmptyRow       = renderEmptyRow;
window.renderModal          = renderModal;
window.renderField          = renderField;
window.renderFormSection    = renderFormSection;
window.renderFormGrid       = renderFormGrid;
window.renderFormActions    = renderFormActions;
window.renderBadge          = renderBadge;
window.renderOrderStatusBadge = renderOrderStatusBadge;
window.renderGradeBadge     = renderGradeBadge;
window.renderBtnIcon        = renderBtnIcon;
window.renderBtnGroup       = renderBtnGroup;
window.renderEditDeleteBtns = renderEditDeleteBtns;
window.renderConfirmDialog  = renderConfirmDialog;
window.renderInfoRow        = renderInfoRow;
window.renderSectionTitle   = renderSectionTitle;
