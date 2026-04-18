/**
 * 헤더 체크박스 전체선택/해제 유틸 — 전역 표준
 *
 * 모든 데이터 리스트 탭(주문·고객·상품·대기자·배송)의 헤더 체크박스를
 * 한 곳에서 통일 관리.
 *
 * 동작:
 *  - 헤더 체크박스 클릭 → 전체 선택 (한 번 더 클릭 → 전체 해제)
 *  - 행 체크박스 일부 선택 → 헤더 indeterminate(-) 상태
 *  - 행 체크박스 전부 선택 → 헤더 checked 상태
 *  - 행 체크박스 전부 해제 → 헤더 unchecked 상태
 *
 * 사용 예:
 *   window.SelectAll.attach('select-all-products', '.product-checkbox', onChange);
 *   window.SelectAll.attach('select-all-orders',   '[data-order-id]',   onChange);
 *
 * @param {string}   headerId   - 헤더 <input type="checkbox"> 의 id
 * @param {string}   rowSel     - 행 체크박스 CSS 선택자
 * @param {function} [onChange] - 선택 변경 시 콜백 (checkedIds 배열 전달)
 * @param {function} [getId]    - 행 체크박스에서 ID 추출 함수 (기본: el.dataset.productId || el.dataset.orderId || el.value)
 */
export function attachSelectAll(headerId, rowSel, onChange, getId) {
    const header = document.getElementById(headerId);
    if (!header) return null;

    const getRows = () => [...document.querySelectorAll(rowSel)];

    const extractId = getId || (el =>
        el.dataset.productId || el.dataset.orderId ||
        el.dataset.customerId || el.dataset.waitlistId ||
        el.dataset.shippingId || el.value || ''
    );

    const updateHeader = () => {
        const rows = getRows();
        const checked = rows.filter(r => r.checked);
        if (rows.length === 0) {
            header.checked = false;
            header.indeterminate = false;
        } else if (checked.length === rows.length) {
            header.checked = true;
            header.indeterminate = false;
        } else if (checked.length === 0) {
            header.checked = false;
            header.indeterminate = false;
        } else {
            header.checked = false;
            header.indeterminate = true;
        }
    };

    const notifyChange = () => {
        if (onChange) {
            const ids = getRows().filter(r => r.checked).map(extractId);
            try { onChange(ids); } catch(e) { console.error('SelectAll onChange 실패:', e); }
        }
    };

    // 헤더 클릭 → 전체 선택/해제
    header.onchange = () => {
        getRows().forEach(r => { r.checked = header.checked; });
        header.indeterminate = false;
        notifyChange();
    };

    // 행 체크박스 변경 감지 — 이벤트 위임으로 동적 행도 처리
    const table = header.closest('table') || document;
    const delegateId = `_selectall_${headerId}`;
    if (!table[delegateId]) {
        table[delegateId] = true;
        table.addEventListener('change', e => {
            const row = e.target.closest(rowSel);
            if (!row) return;
            updateHeader();
            notifyChange();
        });
    }

    // 초기 상태 동기화
    updateHeader();

    return { updateHeader, notifyChange };
}

// 전역 노출
if (typeof window !== 'undefined') {
    window.SelectAll = { attach: attachSelectAll };
}
