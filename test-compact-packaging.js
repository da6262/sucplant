// 컴팩트 포장 리스트 테스트 함수

// 브라우저 콘솔에서 실행할 수 있는 테스트 함수
function testCompactPackaging() {
    console.log('📦 컴팩트 포장 리스트 테스트 시작...');
    
    // 테스트 주문 데이터
    const testOrders = [
        {
            id: '1',
            order_number: 'WP2024080001',
            customer_name: '김다육',
            customer_phone: '010-1234-5678',
            shipping_address: '서울시 강남구 테헤란로 123, 456호',
            total_amount: 75000,
            order_items: JSON.stringify([
                { name: 'White Platter 소품', quantity: 2 },
                { name: 'White Platter 중품', quantity: 1 },
                { name: 'White Sprite 소품', quantity: 3 },
                { name: 'Powdery White 중품', quantity: 1 }
            ])
        },
        {
            id: '2',
            order_number: 'WP2024080002',
            customer_name: '이화분',
            customer_phone: '010-9876-5432',
            shipping_address: '부산시 해운대구 센텀로 456, 789호',
            total_amount: 120000,
            order_items: JSON.stringify([
                { name: 'White Platter 대품', quantity: 2 },
                { name: 'White Platter 중품', quantity: 3 }
            ])
        },
        {
            id: '3',
            order_number: 'WP2024080003',
            customer_name: '박식물',
            customer_phone: '010-5555-7777',
            shipping_address: '대구시 중구 동성로 789, 101호',
            total_amount: 45000,
            order_items: JSON.stringify([
                { name: 'White Sprite 소품', quantity: 5 }
            ])
        }
    ];
    
    // orderSystem이 있는지 확인
    if (typeof orderSystem !== 'undefined' && orderSystem.generateCompactPackagingTable) {
        console.log('✅ orderSystem 발견, 테스트 실행...');
        
        // currentPreviewOrders 설정
        orderSystem.currentPreviewOrders = testOrders;
        
        // 컴팩트 포장 출력 실행
        orderSystem.printPackagingOnly();
        
        console.log('🎉 컴팩트 포장 리스트 출력 완료!');
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다.');
        console.log('수동으로 테스트 데이터 출력...');
        
        // 수동 테스트 창 열기
        const printWindow = window.open('', '_blank');
        const tableHTML = generateTestCompactTable(testOrders);
        
        printWindow.document.write(`
            <html>
            <head>
                <title>컴팩트 포장 리스트 테스트</title>
                <style>
                    /* 테스트용 스타일 */
                    body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 20px; }
                    .customer-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .customer-header { background-color: #f0f8f0; }
                    .customer-header td { padding: 8px 10px; border: 2px solid #333; font-weight: bold; }
                    .products-table { width: 100%; border-collapse: collapse; }
                    .products-table th, .products-table td { border: 1px solid #666; padding: 6px 8px; text-align: center; }
                    .product-cell { width: 33.33%; }
                    .product-name { font-weight: bold; margin-bottom: 2px; }
                    .product-quantity { color: #d63384; font-weight: bold; }
                    .checkbox { width: 15px; height: 15px; border: 2px solid #333; display: inline-block; margin-right: 5px; }
                    .total-amount { font-weight: bold; color: #d63384; }
                    .address-cell { word-break: break-all; }
                </style>
            </head>
            <body>
                <h2>📦 컴팩트 포장 리스트 테스트</h2>
                ${tableHTML}
                <script>
                    console.log('테스트 페이지 로드 완료');
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
}

// 수동 테스트용 테이블 생성 함수
function generateTestCompactTable(orders) {
    let html = '';
    
    orders.forEach((order, index) => {
        const products = JSON.parse(order.order_items);
        
        html += `
            <table class="customer-table">
                <tr class="customer-header">
                    <td style="width: 15%;"><span class="checkbox"></span><strong>주문번호</strong></td>
                    <td style="width: 20%;"><strong>${order.order_number}</strong></td>
                    <td style="width: 15%;"><strong>고객명</strong></td>
                    <td style="width: 20%;"><strong>${order.customer_name}</strong></td>
                    <td style="width: 15%;"><strong>연락처</strong></td>
                    <td style="width: 15%;"><strong>${order.customer_phone}</strong></td>
                </tr>
                <tr>
                    <td><strong>배송주소</strong></td>
                    <td colspan="3" class="address-cell">${order.shipping_address}</td>
                    <td><strong>총금액</strong></td>
                    <td class="total-amount">${Number(order.total_amount).toLocaleString()}원</td>
                </tr>
            </table>
            
            <table class="products-table">
                <thead>
                    <tr>
                        <th class="product-cell">상품명 / 수량</th>
                        <th class="product-cell">상품명 / 수량</th>
                        <th class="product-cell">상품명 / 수량</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (let i = 0; i < products.length; i += 3) {
            html += '<tr>';
            for (let j = 0; j < 3; j++) {
                const product = products[i + j];
                if (product) {
                    html += `
                        <td class="product-cell">
                            <span class="checkbox"></span>
                            <div class="product-name">${product.name}</div>
                            <div class="product-quantity">${product.quantity}개</div>
                        </td>
                    `;
                } else {
                    html += '<td class="product-cell">-</td>';
                }
            }
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        
        if (index < orders.length - 1) {
            html += '<div style="margin: 15px 0; border-bottom: 1px dashed #ccc;"></div>';
        }
    });
    
    return html;
}

// 콘솔에서 사용 방법 안내
console.log(`
📦 컴팩트 포장 리스트 테스트

사용 방법:
1. 브라우저 콘솔(F12)에서 실행:
   testCompactPackaging()

2. 또는 실제 시스템에서:
   - 배송 관리 탭 이동
   - 피킹 리스트 생성
   - "고객별 포장만 출력" 클릭

🎯 결과: 3열 상품 배치 표 형식으로 출력됩니다!
`);