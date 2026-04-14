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

// 피킹 리스트 HTML 생성
function generatePickingListHTML(pickingData) {
    const farm = getFarmInfo();
    const { productSummary, customerSummary, totalOrders, totalItems, estimatedTime } = pickingData;
    
    // 상품별 피킹 목록 생성
    const productList = productSummary.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.size || '기본'}</td>
            <td>${product.totalQuantity}</td>
            <td>${product.orders.length}</td>
            <td>${product.totalAmount.toLocaleString()}원</td>
        </tr>
    `).join('');
    
    // 고객별 주문 목록을 통합 테이블로 생성
    const allOrders = [];
    customerSummary.forEach(customer => {
        customer.orders.forEach(order => {
            allOrders.push({
                customerName: customer.name,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                orderNumber: order.order_number || order.id,
                items: (order.items ?? []).map(item => {
                    const productName = item.product_name || item.name || item.title || item.productName || item.product_title || item.item_name || item.goods_name || '상품명 없음';
                    const quantity = item.quantity || item.qty || item.amount || 1;
                    return `${productName} x${quantity}`;
                }).join(', '),
                totalAmount: order.total_amount || 0
            });
        });
    });
    
    const customerList = allOrders.map((order, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${order.customerName}</td>
            <td>${order.customerPhone}</td>
            <td>${order.customerAddress}</td>
            <td>${order.orderNumber}</td>
            <td>${order.items}</td>
            <td>${order.totalAmount.toLocaleString()}원</td>
        </tr>
    `).join('');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>피킹 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Malgun Gothic', 'Segoe UI', Arial, sans-serif; 
                    font-size: 14px; 
                    line-height: 1.6; 
                    color: #1f2937;
                    background: white;
                    margin: 0;
                }
                .picking-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 16px;
                    background: white;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 8px;
                }
                .picking-title {
                    font-size: 18px;
                    color: #333;
                    font-weight: 600;
                }
                .summary-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 30px;
                    padding: 16px;
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                }
                .summary-item {
                    text-align: center;
                    padding: 16px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e40af;
                    margin-bottom: 4px;
                }
                .summary-label {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 500;
                }
                .section-title {
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    color: white;
                    padding: 16px 20px;
                    margin: 24px 0 16px 0;
                    font-weight: 600;
                    border-radius: 8px;
                    font-size: 16px;
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
                }
                .product-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 32px;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    table-layout: fixed;
                }
                .product-table th {
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    color: white;
                    padding: 16px 12px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 14px;
                    white-space: nowrap;
                }
                .product-table th:nth-child(1) { width: 8%; }  /* 순번 */
                .product-table th:nth-child(2) { width: 30%; } /* 상품명 */
                .product-table th:nth-child(3) { width: 12%; } /* 사이즈 */
                .product-table th:nth-child(4) { width: 15%; } /* 수량 */
                .product-table th:nth-child(5) { width: 15%; } /* 주문수 */
                .product-table th:nth-child(6) { width: 20%; } /* 금액 */
                .product-table th:nth-child(7) { width: 15%; } /* 금액 (고객별 포장용) */
                .product-table td {
                    padding: 12px 8px;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                    font-size: 13px;
                    vertical-align: middle;
                    word-wrap: break-word;
                }
                .product-table td:first-child {
                    text-align: center;
                    font-weight: 600;
                    background: #f8fafc;
                }
                .product-table td:nth-child(2) {
                    text-align: left;
                    font-weight: 500;
                    padding-left: 12px;
                }
                .product-table td:last-child {
                    text-align: right;
                    font-weight: 600;
                    color: #059669;
                    padding-right: 12px;
                }
                .product-table tr:nth-child(even) {
                    background: #f8fafc;
                }
                .product-table tr:hover {
                    background: #e0f2fe;
                }
                .customer-card {
                    margin-bottom: 24px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .customer-header {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .customer-info {
                    padding: 12px 20px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e5e7eb;
                }
                .customer-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }
                .customer-table th {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 12px;
                    border: 1px solid #e2e8f0;
                    white-space: nowrap;
                }
                .customer-table th:nth-child(1) { width: 8%; }  /* 순번 */
                .customer-table th:nth-child(2) { width: 15%; } /* 고객명 */
                .customer-table th:nth-child(3) { width: 15%; } /* 전화번호 */
                .customer-table th:nth-child(4) { width: 20%; } /* 주소 */
                .customer-table th:nth-child(5) { width: 12%; } /* 주문번호 */
                .customer-table th:nth-child(6) { width: 20%; } /* 상품목록 */
                .customer-table th:nth-child(7) { width: 10%; } /* 금액 */
                .customer-table td {
                    padding: 10px 8px;
                    border: 1px solid #e2e8f0;
                    font-size: 12px;
                    vertical-align: middle;
                    word-wrap: break-word;
                }
                .customer-table td:first-child {
                    text-align: center;
                    font-weight: 600;
                    background: #f8fafc;
                }
                .customer-table td:nth-child(2) {
                    text-align: left;
                    padding-left: 12px;
                }
                .customer-table td:last-child {
                    text-align: right;
                    font-weight: 600;
                    color: #059669;
                    padding-right: 12px;
                }
                .customer-table tr:nth-child(even) {
                    background: #f8fafc;
                }
                .customer-table tr:hover {
                    background: #e0f2fe;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    padding: 20px;
                    border-top: 2px solid #e5e7eb;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .footer p {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 4px 0;
                }
                @media print {
                    body { margin: 0; background: white; }
                    .picking-container { padding: 16px; box-shadow: none; }
                    .summary-section { break-inside: avoid; }
                    .customer-card { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="picking-container">
                <!-- 헤더 -->
                <div class="header">
                    <div class="company-name">${farm.name}</div>
                    <div class="picking-title">피킹 리스트 (PICKING LIST)</div>
                </div>
                
                <!-- 요약 정보 -->
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
                </div>
                
                <!-- 상품별 피킹 목록 -->
                <div class="section-title">상품별 피킹 목록</div>
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>상품명</th>
                            <th>사이즈</th>
                            <th>총 수량</th>
                            <th>주문 수</th>
                            <th>총 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productList}
                    </tbody>
                </table>
                
                <!-- 고객별 주문 목록 -->
                <div class="section-title">고객별 주문 목록</div>
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>고객명</th>
                            <th>전화번호</th>
                            <th>주소</th>
                            <th>주문번호</th>
                            <th>상품 목록</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerList}
                    </tbody>
                </table>
                
                <!-- 푸터 -->
                <div class="footer">
                    <p>${farm.name} 피킹 리스트</p>
                    <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
                    <p>이 문서는 컴퓨터로 자동 생성되었습니다.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// 상품별 피킹만 HTML 생성
function generatePickingOnlyHTML(pickingData) {
    const farm = getFarmInfo();
    const { productSummary, totalOrders, totalItems, estimatedTime } = pickingData;
    
    const productList = productSummary.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.size || '기본'}</td>
            <td>${product.totalQuantity}</td>
            <td>${product.orders.length}</td>
            <td>${product.totalAmount.toLocaleString()}원</td>
        </tr>
    `).join('');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>상품별 피킹 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                .summary-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .summary-item {
                    flex: 1;
                    text-align: center;
                    margin: 0 10px;
                }
                .summary-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #2c5aa0;
                    margin-bottom: 5px;
                }
                .summary-label {
                    font-size: 12px;
                    color: #666;
                }
                .section-title {
                    background: #f8f9fa;
                    padding: 8px 12px;
                    margin-bottom: 0;
                    border-left: 4px solid #2c5aa0;
                    font-size: 14px;
                    color: #2c5aa0;
                    font-weight: bold;
                }
                .product-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #ddd;
                }
                .product-table th {
                    background: #2c5aa0;
                    color: white;
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                }
                .product-table td {
                    padding: 10px 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                    font-size: 11px;
                }
                .product-table td:first-child {
                    text-align: left;
                }
                .product-table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 2px solid #eee;
                    font-size: 10px;
                    color: #666;
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
                    <div class="invoice-title">상품별 피킹 리스트 (PRODUCT PICKING LIST)</div>
                </div>
                
                <!-- 요약 정보 -->
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
                </div>
                
                <!-- 상품별 피킹 목록 -->
                <div class="section-title">상품별 피킹 목록</div>
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>상품명</th>
                            <th>사이즈</th>
                            <th>총 수량</th>
                            <th>주문 수</th>
                            <th>총 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productList}
                    </tbody>
                </table>
                
                <!-- 푸터 -->
                <div class="footer">
                    <p>${farm.name}${farm.owner ? ' | 대표: ' + farm.owner : ''}</p>
                    ${farm.address || farm.phone ? `<p>${[farm.address, farm.phone].filter(Boolean).join(' | ')}</p>` : ''}
                    <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
                    <p>이 문서는 컴퓨터로 자동 생성되었습니다.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// 고객별 포장만 HTML 생성
function generatePackagingOnlyHTML(pickingData) {
    const farm = getFarmInfo();
    console.log('🔍 generatePackagingOnlyHTML 함수 호출됨:', pickingData);
    const { customerSummary, totalOrders, totalItems, estimatedTime } = pickingData;
    console.log('🔍 고객별 포장 데이터:', { customerSummary, totalOrders, totalItems, estimatedTime });
    
    // 고객별 피킹을 통합 테이블로 생성
    const allPickingItems = [];
    customerSummary.forEach((customer, customerIndex) => {
        customer.orders.forEach((order, orderIndex) => {
            (order.items ?? []).forEach((item, itemIndex) => {
                const productName = item.product_name || item.name || item.title || item.productName || item.product_title || item.item_name || item.goods_name || '상품명 없음';
                const quantity = item.quantity || item.qty || item.amount || 1;
                const size = item.size || item.product_size || '기본';
                const price = item.price || 0;
                
                allPickingItems.push({
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerAddress: customer.address,
                    orderNumber: order.order_number || order.id,
                    productName,
                    size,
                    quantity,
                    price,
                    customerIndex,
                    orderIndex,
                    itemIndex
                });
            });
        });
    });
    
    const pickingTableRows = allPickingItems.map((item, index) => `
        <tr class="picking-row">
            <td class="text-center">${index + 1}</td>
            <td class="font-medium">${item.customerName}</td>
            <td class="text-sm">${item.customerPhone}</td>
            <td class="text-sm">${item.orderNumber}</td>
            <td class="font-medium">${item.productName}</td>
            <td class="text-center">${item.size}</td>
            <td class="text-center font-bold">${item.quantity}</td>
            <td class="text-center">
                <input type="checkbox" class="picking-checkbox" data-customer="${item.customerIndex}" data-order="${item.orderIndex}" data-item="${item.itemIndex}">
            </td>
            <td class="text-right">${item.price.toLocaleString()}원</td>
        </tr>
    `).join('');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>고객별 포장 리스트 - ${new Date().toLocaleDateString('ko-KR')}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                .summary-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .summary-item {
                    flex: 1;
                    text-align: center;
                    margin: 0 10px;
                }
                .summary-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #2c5aa0;
                    margin-bottom: 5px;
                }
                .summary-label {
                    font-size: 12px;
                    color: #666;
                }
                .section-title {
                    background: #f8f9fa;
                    padding: 8px 12px;
                    margin-bottom: 0;
                    border-left: 4px solid #2c5aa0;
                    font-size: 14px;
                    color: #2c5aa0;
                    font-weight: bold;
                }
                .picking-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #ddd;
                }
                .picking-table th {
                    background: #2c5aa0;
                    color: white;
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                }
                .picking-table td {
                    padding: 10px 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                    font-size: 11px;
                }
                .picking-table td:first-child {
                    text-align: left;
                }
                .picking-table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                .picking-checkbox {
                    width: 16px;
                    height: 16px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 2px solid #eee;
                    font-size: 10px;
                    color: #666;
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
                    <div class="invoice-title">고객별 포장 리스트 (CUSTOMER PACKAGING LIST)</div>
                </div>
                
                <!-- 요약 정보 -->
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
                </div>
                
                <!-- 고객별 피킹 목록 -->
                <div class="section-title">고객별 피킹 목록</div>
                <table class="picking-table">
                    <thead>
                        <tr>
                            <th>순번</th>
                            <th>고객명</th>
                            <th>전화번호</th>
                            <th>주문번호</th>
                            <th>상품명</th>
                            <th>사이즈</th>
                            <th>수량</th>
                            <th>체크</th>
                            <th>단가</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pickingTableRows}
                    </tbody>
                </table>
                
                <!-- 푸터 -->
                <div class="footer">
                    <p>${farm.name}${farm.owner ? ' | 대표: ' + farm.owner : ''}</p>
                    ${farm.address || farm.phone ? `<p>${[farm.address, farm.phone].filter(Boolean).join(' | ')}</p>` : ''}
                    <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
                    <p>이 문서는 컴퓨터로 자동 생성되었습니다.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    console.log('✅ generatePackagingOnlyHTML 함수 완료');
    
    // 체크박스 기능을 위한 JavaScript 추가
    const script = `
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 개별 상품 체크박스 이벤트
            document.querySelectorAll('.picking-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const customerIndex = this.dataset.customer;
                    const orderIndex = this.dataset.order;
                    const itemIndex = this.dataset.item;
                    
                    console.log('상품 체크:', {customerIndex, orderIndex, itemIndex, checked: this.checked});
                });
            });
        });
        </script>
    `;
    
    return html.replace('</body>', script + '</body>');
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

