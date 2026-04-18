// 주문 인쇄 관련 기능
// features/orders/orderPrint.js

// 환경설정에서 농장 정보 읽기
function getFarmInfo() {
    const farm = window.settingsDataManager?.settings?.farm || {};
    return {
        name:           farm.name           || '경산다육식물농장',
        owner:          farm.owner          || '',
        phone:          farm.phone          || '',
        address:        farm.address        || '',
        businessNumber: farm.businessNumber || '',
        bankName:       farm.bankName       || '',
        bankAccount:    farm.bankAccount    || '',
        bankHolder:     farm.bankHolder     || '',
    };
}

// 거래명세서 출력용 HTML 생성
function generateOrderPrintHTML(order) {
    const farm = getFarmInfo();
    const orderDate = new Date(order.order_date || order.created_at || order.createdAt);
    const dateStr = orderDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const productAmount = Number(order.product_amount) || 0;
    const shippingFee = Number(order.shipping_fee) || 0;
    const discountAmount = Number(order.discount_amount) || 0;
    const totalAmount = Number(order.total_amount) || 0;
    const won = (v) => window.fmt ? window.fmt.won(v) : v.toLocaleString() + '원';

    // 상품 행
    let productRows = '';
    if (order.items && order.items.length > 0) {
        productRows = order.items.map((item, i) => {
            const name = item.product_name || item.name || item.title || '상품명 없음';
            const qty = item.quantity || 0;
            const price = item.price || item.unit_price || 0;
            const subtotal = qty * price;
            return `<tr>
                <td class="center">${i + 1}</td>
                <td class="left">${name}</td>
                <td class="center">${qty}</td>
                <td class="right">${won(price)}</td>
                <td class="right bold">${won(subtotal)}</td>
            </tr>`;
        }).join('');
    } else {
        productRows = '<tr><td colspan="5" class="center" style="padding:20px;color:#999;">상품 정보가 없습니다</td></tr>';
    }

    // 입금 안내
    const bankInfo = (farm.bankName && farm.bankAccount)
        ? `<tr><td class="label">입금계좌</td><td colspan="3">${farm.bankName} ${farm.bankAccount}${farm.bankHolder ? ' (' + farm.bankHolder + ')' : ''}</td></tr>`
        : '';

    return `<!DOCTYPE html><html><head>
<title>거래명세서 - ${order.order_number || ''}</title>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif; font-size:11px; color:#222; background:#fff; }
@page { size:A4; margin:12mm 10mm; }
@media print { body { margin:0; } .sheet { box-shadow:none !important; } }

.sheet { max-width:780px; margin:0 auto; padding:28px 32px; }

/* ── 타이틀 ── */
.doc-title { text-align:center; font-size:22px; font-weight:800; letter-spacing:6px; color:#1a1a1a; border-bottom:3px double #222; padding-bottom:10px; margin-bottom:18px; }

/* ── 공급자 / 공급받는자 표 ── */
.info-tbl { width:100%; border-collapse:collapse; border:2px solid #222; margin-bottom:16px; }
.info-tbl td, .info-tbl th { border:1px solid #999; padding:5px 8px; font-size:11px; vertical-align:middle; }
.info-tbl .side-header { width:28px; background:#e8e8e8; text-align:center; font-weight:800; font-size:12px; writing-mode:vertical-lr; letter-spacing:4px; color:#333; }
.info-tbl .field-label { width:68px; background:#f5f5f5; font-weight:600; text-align:center; color:#444; white-space:nowrap; }
.info-tbl .field-value { font-size:11px; color:#222; }
.info-tbl .field-value.addr { font-size:10px; }

/* ── 상품 테이블 ── */
.items { width:100%; border-collapse:collapse; border:1.5px solid #222; margin-bottom:0; }
.items th { background:#2d2d2d; color:#fff; font-size:11px; font-weight:600; padding:7px 6px; text-align:center; }
.items td { padding:7px 6px; border:1px solid #ddd; font-size:11px; }
.items td.center { text-align:center; }
.items td.left { text-align:left; }
.items td.right { text-align:right; font-variant-numeric:tabular-nums; }
.items td.bold { font-weight:700; }
.items tbody tr:nth-child(even) { background:#f9f9f9; }

/* ── 합계 ── */
.totals { width:100%; border-collapse:collapse; border:1.5px solid #222; border-top:none; }
.totals td { padding:6px 10px; font-size:11px; border:1px solid #ddd; }
.totals td.label { width:120px; background:#fafafa; font-weight:600; text-align:right; }
.totals td.value { text-align:right; font-variant-numeric:tabular-nums; width:130px; }
.totals tr.grand td { background:#2d2d2d; color:#fff; font-size:14px; font-weight:800; border-color:#2d2d2d; }

/* ── 메모 ── */
.memo-box { margin-top:14px; padding:10px 14px; border:1px solid #ddd; border-radius:4px; background:#fafafa; }
.memo-box strong { display:block; font-size:11px; color:#555; margin-bottom:4px; }
.memo-box p { font-size:11px; line-height:1.5; }

/* ── 입금 안내 ── */
.bank-box { margin-top:12px; padding:10px 14px; border:1.5px solid #16A34A; border-radius:4px; background:#F0FDF4; }
.bank-box strong { color:#16A34A; font-size:11px; }
.bank-box span { font-size:12px; font-weight:700; color:#222; margin-left:8px; }

/* ── 푸터 ── */
.doc-footer { margin-top:24px; padding-top:12px; border-top:1px solid #ddd; text-align:center; font-size:9px; color:#999; line-height:1.6; }
.stamp-area { text-align:right; margin-top:16px; font-size:11px; color:#555; }
.stamp-area .stamp { display:inline-block; width:60px; height:60px; border:2px solid #c00; border-radius:50%; text-align:center; line-height:56px; font-size:14px; font-weight:800; color:#c00; margin-left:8px; }
</style>
</head><body>
<div class="sheet">
    <div class="doc-title">거 래 명 세 서</div>

    <!-- 공급자 / 공급받는자 표 -->
    <table class="info-tbl">
        <tr>
            <td class="side-header" rowspan="4">공급자</td>
            <td class="field-label">상 호</td>
            <td class="field-value" style="min-width:140px;">${farm.name}</td>
            <td class="field-label">대 표</td>
            <td class="field-value">${farm.owner || '-'}</td>
        </tr>
        <tr>
            <td class="field-label">사업자번호</td>
            <td class="field-value">${farm.businessNumber || '-'}</td>
            <td class="field-label">전 화</td>
            <td class="field-value">${farm.phone || '-'}</td>
        </tr>
        <tr>
            <td class="field-label">주 소</td>
            <td class="field-value addr" colspan="3">${farm.address || '-'}</td>
        </tr>
        <tr>
            <td class="field-label">계 좌</td>
            <td class="field-value" colspan="3">${farm.bankName && farm.bankAccount ? farm.bankName + ' ' + farm.bankAccount + (farm.bankHolder ? ' (' + farm.bankHolder + ')' : '') : '-'}</td>
        </tr>
    </table>
    <table class="info-tbl">
        <tr>
            <td class="side-header" rowspan="3">공급<br>받는<br>자</td>
            <td class="field-label">성 명</td>
            <td class="field-value" style="min-width:140px;">${order.customer_name || '-'}</td>
            <td class="field-label">연 락 처</td>
            <td class="field-value">${order.customer_phone || '-'}</td>
        </tr>
        <tr>
            <td class="field-label">주 소</td>
            <td class="field-value addr" colspan="3">${order.customer_address || '-'}</td>
        </tr>
        <tr>
            <td class="field-label">주문번호</td>
            <td class="field-value">${order.order_number || '-'}</td>
            <td class="field-label">주문일자</td>
            <td class="field-value">${dateStr}</td>
        </tr>
    </table>

    <!-- 상품 목록 -->
    <table class="items">
        <thead><tr>
            <th style="width:36px;">No</th>
            <th>품 명</th>
            <th style="width:50px;">수 량</th>
            <th style="width:90px;">단 가</th>
            <th style="width:100px;">금 액</th>
        </tr></thead>
        <tbody>${productRows}</tbody>
    </table>

    <!-- 합계 -->
    <table class="totals">
        <tr><td class="label">상품합계</td><td class="value">${won(productAmount)}</td>
            <td class="label">배송비</td><td class="value">${won(shippingFee)}</td></tr>
        <tr><td class="label">할인</td><td class="value">${discountAmount > 0 ? '-' + won(discountAmount) : won(0)}</td>
            <td class="label" colspan="2"></td></tr>
        <tr class="grand"><td class="label" style="background:#2d2d2d;text-align:right;">합 계 금 액</td><td class="value" colspan="3" style="text-align:right;">${won(totalAmount)}</td></tr>
    </table>

    <!-- 입금 안내 (계좌 정보가 있으면 표시) -->
    ${(farm.bankName && farm.bankAccount) ? `
    <div class="bank-box">
        <strong>입금계좌</strong><span>${farm.bankName} ${farm.bankAccount}${farm.bankHolder ? ' (' + farm.bankHolder + ')' : ''}</span>
    </div>` : ''}

    <!-- 메모 -->
    ${order.memo ? `
    <div class="memo-box">
        <strong>비 고</strong>
        <p>${order.memo}</p>
    </div>` : ''}

    <!-- 인감 영역 -->
    <div class="stamp-area">
        위 금액을 명세와 같이 ${order.order_status === '입금확인' || order.order_status === '배송완료' ? '영수' : '청구'}합니다.
        <span class="stamp">${order.order_status === '입금확인' || order.order_status === '배송완료' ? '영수' : '청구'}</span>
    </div>

    <!-- 푸터 -->
    <div class="doc-footer">
        ${farm.name}${farm.owner ? ' | 대표: ' + farm.owner : ''}${farm.phone ? ' | ' + farm.phone : ''}<br>
        ${farm.address || ''}${farm.businessNumber ? ' | 사업자등록번호: ' + farm.businessNumber : ''}<br>
        발행일: ${new Date().toLocaleDateString('ko-KR')} | 이 문서는 전산으로 발행되어 , 직인이 없어도 유효합니다.
    </div>
</div>
</body></html>`;
}

// ─── 공통 CSS (상품별 미리보기 양식 기준) ───────────────────────────────────
function _pickingCSS() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Malgun Gothic', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 12px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 2px;
        }
        .invoice-title {
            font-size: 13px;
            color: #666;
            font-weight: normal;
        }
        .summary-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 10px 16px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .summary-item {
            flex: 1;
            text-align: center;
        }
        .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 2px;
        }
        .summary-label {
            font-size: 11px;
            color: #666;
        }
        .section-title {
            background: #f8f9fa;
            padding: 6px 10px;
            margin: 10px 0 0 0;
            border-left: 4px solid #2c5aa0;
            font-size: 12px;
            color: #2c5aa0;
            font-weight: bold;
        }
        .product-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
            margin-bottom: 10px;
        }
        .product-table th {
            background: #2c5aa0;
            color: white;
            padding: 8px 6px;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
        }
        .product-table td {
            padding: 7px 6px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            vertical-align: middle;
            word-break: break-all;
        }
        .product-table td:first-child { font-weight: bold; }
        .product-table td.left { text-align: left; padding-left: 8px; }
        .product-table td.right { text-align: right; font-weight: bold; padding-right: 8px; }
        .product-table tr:nth-child(even) { background: #f8f9fa; }
        .footer {
            margin-top: 16px;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 10px;
            color: #666;
        }
        @media print {
            body { margin: 0; }
            .invoice-container { padding: 15px; }
        }
    `;
}

// ─── 공통 헤더/요약/푸터 ────────────────────────────────────────────────────
function _pickingHeader(farm, title) {
    return `
        <div class="header">
            <div class="company-name">${farm.name}</div>
            <div class="invoice-title">${title}</div>
        </div>`;
}
function _pickingSummary(totalOrders, totalItems, estimatedTime) {
    return `
        <div class="summary-section">
            <div class="summary-item">
                <div class="summary-value">${totalOrders}</div>
                <div class="summary-label">총 주문 건수</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalItems}</div>
                <div class="summary-label">총 상품 수량</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${estimatedTime}</div>
                <div class="summary-label">예상 소요시간</div>
            </div>
        </div>`;
}
function _pickingFooter(farm) {
    return `
        <div class="footer">
            <p>${farm.name}${farm.owner ? ' | 대표: ' + farm.owner : ''}</p>
            ${farm.address || farm.phone ? `<p>${[farm.address, farm.phone].filter(Boolean).join(' | ')}</p>` : ''}
            ${farm.businessNumber ? `<p>사업자등록번호: ${farm.businessNumber}</p>` : ''}
            <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
            <p>이 문서는 컴퓨터로 자동 생성되었습니다.</p>
        </div>`;
}

// 피킹 리스트 HTML 생성 (전체: 상품별 + 고객별)
function generatePickingListHTML(pickingData) {
    const farm = getFarmInfo();
    const { productSummary, customerSummary, totalOrders, totalItems, estimatedTime } = pickingData;

    const productRows = productSummary.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td class="left">${p.name}</td>
            <td>${p.size || '기본'}</td>
            <td>${p.totalQuantity}</td>
            <td>${p.orders.length}</td>
            <td class="right">${window.fmt.won(p.totalAmount)}</td>
        </tr>`).join('');

    const customerRows = customerSummary.flatMap((c, ci) =>
        c.orders.map((order, oi) => {
            const items = (order.items ?? []).map(item => {
                const name = item.product_name || item.name || item.title || '상품명 없음';
                return `${name} x${item.quantity || 1}`;
            }).join(', ');
            return `
        <tr>
            <td>${ci + 1}</td>
            <td class="left">${c.name}</td>
            <td>${c.phone || ''}</td>
            <td class="left">${c.address || ''}</td>
            <td>${order.order_number || ''}</td>
            <td class="left">${items}</td>
            <td class="right">${window.fmt.won(order.total_amount || 0)}</td>
        </tr>`;
        })
    ).join('');

    return `<!DOCTYPE html><html><head>
        <title>피킹 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
        <meta charset="UTF-8">
        <style>${_pickingCSS()}</style>
        </head><body><div class="invoice-container">
        ${_pickingHeader(farm, '피킹 리스트 (PICKING LIST)')}
        ${_pickingSummary(totalOrders, totalItems, estimatedTime)}
        <div class="section-title">상품별 피킹 목록</div>
        <table class="product-table"><thead><tr>
            <th>순번</th><th>상품명</th><th>사이즈</th><th>총 수량</th><th>주문 수</th><th>총 금액</th>
        </tr></thead><tbody>${productRows}</tbody></table>
        <div class="section-title">고객별 주문 목록</div>
        <table class="product-table"><thead><tr>
            <th>순번</th><th>고객명</th><th>전화번호</th><th>주소</th><th>주문번호</th><th>상품 목록</th><th>금액</th>
        </tr></thead><tbody>${customerRows}</tbody></table>
        ${_pickingFooter(farm)}
        </div></body></html>`;
}

// 상품별 피킹만 HTML 생성
function generatePickingOnlyHTML(pickingData) {
    const farm = getFarmInfo();
    const { productSummary, totalOrders, totalItems, estimatedTime } = pickingData;

    const productRows = productSummary.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td class="left">${p.name}</td>
            <td>${p.size || '기본'}</td>
            <td>${p.totalQuantity}</td>
            <td>${p.orders.length}</td>
            <td class="right">${window.fmt.won(p.totalAmount)}</td>
        </tr>`).join('');

    return `<!DOCTYPE html><html><head>
        <title>상품별 피킹 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
        <meta charset="UTF-8">
        <style>${_pickingCSS()}</style>
        </head><body><div class="invoice-container">
        ${_pickingHeader(farm, '상품별 피킹 리스트 (PRODUCT PICKING LIST)')}
        ${_pickingSummary(totalOrders, totalItems, estimatedTime)}
        <div class="section-title">상품별 피킹 목록</div>
        <table class="product-table"><thead><tr>
            <th>순번</th><th>상품명</th><th>사이즈</th><th>총 수량</th><th>주문 수</th><th>총 금액</th>
        </tr></thead><tbody>${productRows}</tbody></table>
        ${_pickingFooter(farm)}
        </div></body></html>`;
}

// 고객별 포장만 HTML 생성
function generatePackagingOnlyHTML(pickingData) {
    const farm = getFarmInfo();
    const { customerSummary, totalOrders, totalItems, estimatedTime } = pickingData;

    let rowIndex = 0;
    const pickingTableRows = customerSummary.flatMap(c =>
        c.orders.flatMap(order =>
            (order.items ?? []).map(item => {
                rowIndex++;
                const name  = item.product_name || item.name || item.title || '상품명 없음';
                const size  = item.size || item.product_size || '기본';
                const qty   = item.quantity || item.qty || 1;
                const price = item.price || 0;
                return `
        <tr>
            <td>${rowIndex}</td>
            <td class="left">${c.name}</td>
            <td>${c.phone || ''}</td>
            <td class="left" style="font-size:10px;max-width:150px;word-break:break-all">${c.address || ''}</td>
            <td>${order.order_number || ''}</td>
            <td class="left">${name}</td>
            <td>${size}</td>
            <td>${qty}</td>
            <td style="text-align:center"><input type="checkbox" style="width:14px;height:14px"></td>
            <td class="right">${window.fmt.won(price)}</td>
        </tr>`;
            })
        )
    ).join('');
    
    return `<!DOCTYPE html><html><head>
        <title>고객별 포장 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
        <meta charset="UTF-8">
        <style>${_pickingCSS()}</style>
        </head><body><div class="invoice-container">
        ${_pickingHeader(farm, '고객별 포장 리스트 (CUSTOMER PACKAGING LIST)')}
        ${_pickingSummary(totalOrders, totalItems, estimatedTime)}
        <div class="section-title">고객별 피킹 목록</div>
        <table class="product-table"><thead><tr>
            <th>순번</th><th>고객명</th><th>전화번호</th><th>주소</th><th>주문번호</th><th>상품명</th><th>사이즈</th><th>수량</th><th>체크</th><th>단가</th>
        </tr></thead><tbody>${pickingTableRows}</tbody></table>
        ${_pickingFooter(farm)}
        </div></body></html>`;
}

// 전역 스코프에 함수 등록
console.log('📦 orderPrint.js 파일 로드 완료 - 전역 함수 등록 시작');
window.generateOrderPrintHTML = generateOrderPrintHTML;
window.generatePickingListHTML = generatePickingListHTML;
window.generatePickingOnlyHTML = generatePickingOnlyHTML;
window.generatePackagingOnlyHTML = generatePackagingOnlyHTML;
console.log('✅ orderPrint.js 전역 함수 등록 완료:', {
    generateOrderPrintHTML: !!window.generateOrderPrintHTML,
    generatePickingListHTML: !!window.generatePickingListHTML,
    generatePickingOnlyHTML: !!window.generatePickingOnlyHTML,
    generatePackagingOnlyHTML: !!window.generatePackagingOnlyHTML
});

