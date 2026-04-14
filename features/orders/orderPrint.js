// 주문 인쇄 관련 기능
// features/orders/orderPrint.js

// 환경설정에서 농장 정보 읽기
function getFarmInfo() {
    const farm = window.settingsDataManager?.settings?.farm || {};
    return {
        name:    farm.name    || '경산다육식물농장',
        owner:   farm.owner   || '',
        phone:   farm.phone   || '',
        address: farm.address || '',
    };
}

// 주문서 출력용 HTML 생성
function generateOrderPrintHTML(order) {
    const farm = getFarmInfo();
    // 주문 상품 목록 생성
    let productList = '';
    if (order.items && order.items.length > 0) {
        productList = order.items.map(item => `
            <tr>
                <td>${item.product_name || item.name || item.title || item.productName || item.product_title || item.item_name || item.goods_name || '상품명 없음'}</td>
                <td>${item.quantity || 0}</td>
                <td>${(item.price || 0).toLocaleString()}원</td>
                <td>${((item.quantity || 0) * (item.price || 0)).toLocaleString()}원</td>
            </tr>
        `).join('');
    } else {
        productList = '<tr><td colspan="4" class="text-center">상품 정보가 없습니다</td></tr>';
    }
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>주문서 - ${order.order_number}</title>
            <meta charset="UTF-8">
            <style>
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
                    padding: 20px;
                    background: white;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2c5aa0;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c5aa0;
                    margin-bottom: 5px;
                }
                .invoice-title {
                    font-size: 18px;
                    color: #666;
                    font-weight: normal;
                }
                .info-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .info-box {
                    flex: 1;
                    margin: 0 10px;
                }
                .info-box h3 {
                    background: #f8f9fa;
                    padding: 8px 12px;
                    margin-bottom: 10px;
                    border-left: 4px solid #2c5aa0;
                    font-size: 14px;
                    color: #2c5aa0;
                }
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .info-table td {
                    padding: 6px 8px;
                    border-bottom: 1px solid #eee;
                    font-size: 11px;
                }
                .info-table td:first-child {
                    background: #f8f9fa;
                    font-weight: bold;
                    width: 80px;
                }
                .items-section {
                    margin-bottom: 30px;
                }
                .items-section h3 {
                    background: #f8f9fa;
                    padding: 8px 12px;
                    margin-bottom: 0;
                    border-left: 4px solid #2c5aa0;
                    font-size: 14px;
                    color: #2c5aa0;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #ddd;
                }
                .items-table th {
                    background: #2c5aa0;
                    color: white;
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                }
                .items-table td {
                    padding: 10px 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                    font-size: 11px;
                }
                .items-table td:first-child {
                    text-align: left;
                }
                .items-table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                .total-section {
                    margin-top: 20px;
                }
                .total-table {
                    width: 100%;
                    max-width: 300px;
                    margin-left: auto;
                    border-collapse: collapse;
                }
                .total-table td {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    font-size: 11px;
                }
                .total-table td:first-child {
                    background: #f8f9fa;
                    font-weight: bold;
                    text-align: right;
                }
                .total-table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                .final-total {
                    background: #2c5aa0 !important;
                    color: white !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 2px solid #eee;
                    font-size: 10px;
                    color: #666;
                }
                .memo-section {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-left: 4px solid #2c5aa0;
                }
                .memo-section h4 {
                    color: #2c5aa0;
                    margin-bottom: 8px;
                    font-size: 12px;
                }
                @media print {
                    body { margin: 0; }
                    .invoice-container { padding: 15px; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <!-- 헤더 -->
                <div class="header">
                    <div class="company-name">${farm.name}</div>
                    <div class="invoice-title">주문서 (ORDER INVOICE)</div>
                </div>
                
                <!-- 정보 섹션 -->
                <div class="info-section">
                    <div class="info-box">
                        <h3>주문 정보</h3>
                        <table class="info-table">
                            <tr><td>주문번호</td><td>${order.order_number}</td></tr>
                            <tr><td>주문일자</td><td>${new Date(order.order_date || order.createdAt).toLocaleDateString('ko-KR')}</td></tr>
                            <tr><td>주문상태</td><td>${order.order_status || order.status || '주문접수'}</td></tr>
                            <tr><td>주문채널</td><td>${order.order_channel || '온라인'}</td></tr>
                        </table>
                    </div>
                    <div class="info-box">
                        <h3>고객 정보</h3>
                        <table class="info-table">
                            <tr><td>고객명</td><td>${order.customer_name}</td></tr>
                            <tr><td>연락처</td><td>${order.customer_phone}</td></tr>
                            <tr><td>주소</td><td>${order.customer_address}</td></tr>
                        </table>
                    </div>
                </div>
                
                <!-- 상품 목록 -->
                <div class="items-section">
                    <h3>주문 상품</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>상품명</th>
                                <th>수량</th>
                                <th>단가</th>
                                <th>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productList}
                        </tbody>
                    </table>
                </div>
                
                <!-- 총액 -->
                <div class="total-section">
                    <table class="total-table">
                        <tr>
                            <td>상품금액</td>
                            <td>${(order.product_amount || 0).toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td>배송비</td>
                            <td>${(order.shipping_fee || 0).toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td>할인액</td>
                            <td>-${(order.discount_amount || 0).toLocaleString()}원</td>
                        </tr>
                        <tr class="final-total">
                            <td>총 금액</td>
                            <td>${(order.total_amount || 0).toLocaleString()}원</td>
                        </tr>
                    </table>
                </div>
                
                <!-- 메모 -->
                ${order.memo ? `
                <div class="memo-section">
                    <h4>배송 메모</h4>
                    <p>${order.memo}</p>
                </div>
                ` : ''}
                
                <!-- 푸터 -->
                <div class="footer">
                    <p>${farm.name}${farm.owner ? ' | 대표: ' + farm.owner : ''}</p>
                    ${farm.address || farm.phone ? `<p>${[farm.address, farm.phone].filter(Boolean).join(' | ')}</p>` : ''}
                    <p>이 주문서는 컴퓨터로 자동 생성되었습니다.</p>
                </div>
            </div>
        </body>
        </html>
    `;
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
            <td class="right">${p.totalAmount.toLocaleString()}원</td>
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
            <td class="right">${(order.total_amount || 0).toLocaleString()}원</td>
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
            <td class="right">${p.totalAmount.toLocaleString()}원</td>
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
            <td>${order.order_number || ''}</td>
            <td class="left">${name}</td>
            <td>${size}</td>
            <td>${qty}</td>
            <td style="text-align:center"><input type="checkbox" style="width:14px;height:14px"></td>
            <td class="right">${price.toLocaleString()}원</td>
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
            <th>순번</th><th>고객명</th><th>전화번호</th><th>주문번호</th><th>상품명</th><th>사이즈</th><th>수량</th><th>체크</th><th>단가</th>
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

