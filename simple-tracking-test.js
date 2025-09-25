// 간단한 송장번호 테스트 기능

console.log('📦 간단한 송장번호 테스트 시작...');

// 테스트용 송장번호 일괄 등록
function quickTrackingTest() {
    console.log('🚀 송장번호 일괄 테스트 시작...');
    
    if (typeof orderSystem === 'undefined') {
        console.error('❌ orderSystem을 찾을 수 없습니다');
        return;
    }
    
    // 테스트 데이터
    const testData = [
        { orderNumber: 'WP2024080001', trackingNumber: '1234567890123' },
        { orderNumber: 'WP2024080002', trackingNumber: '1234567890124' },
        { orderNumber: 'WP2024080003', trackingNumber: '1234567890125' }
    ];
    
    console.log('📋 테스트 데이터:', testData);
    
    // 현재 주문 확인
    console.log('현재 주문 수:', orderSystem.orders?.length || 0);
    
    if (!orderSystem.orders || orderSystem.orders.length === 0) {
        console.log('⚠️ 주문이 없어서 샘플 주문 생성 중...');
        
        // 샘플 주문 생성
        orderSystem.orders = [
            {
                id: '1',
                order_number: 'WP2024080001',
                customer_name: '김다육',
                order_status: '포장준비',
                tracking_number: ''
            },
            {
                id: '2', 
                order_number: 'WP2024080002',
                customer_name: '이화분',
                order_status: '포장준비',
                tracking_number: ''
            },
            {
                id: '3',
                order_number: 'WP2024080003', 
                customer_name: '박식물',
                order_status: '포장준비',
                tracking_number: ''
            }
        ];
        
        orderSystem.saveToLocalStorage('orders', orderSystem.orders);
        console.log('✅ 샘플 주문 생성 완료');
    }
    
    // 송장번호 일괄 등록
    let successCount = 0;
    
    testData.forEach(data => {
        const order = orderSystem.orders.find(o => o.order_number === data.orderNumber);
        if (order) {
            order.tracking_number = data.trackingNumber;
            order.order_status = '배송시작';
            order.status = '배송시작';
            order.updated_at = Date.now();
            successCount++;
            console.log(`✅ ${data.orderNumber} -> ${data.trackingNumber}`);
        } else {
            console.log(`❌ 주문번호 찾기 실패: ${data.orderNumber}`);
        }
    });
    
    // 로컬 저장
    if (successCount > 0) {
        orderSystem.saveToLocalStorage('orders', orderSystem.orders);
        console.log('💾 로컬 저장 완료');
        
        // 테이블 새로고침
        if (orderSystem.loadShippingOrders) {
            orderSystem.loadShippingOrders();
            console.log('🔄 배송 테이블 새로고침');
        }
        
        alert(`✅ ${successCount}개 송장번호 등록 완료!\n\n배송관리 탭에서 확인해보세요.`);
    }
}

// 개별 송장번호 테스트
function testSingleTracking(orderNumber, trackingNumber) {
    console.log(`📦 개별 송장번호 테스트: ${orderNumber} -> ${trackingNumber}`);
    
    if (typeof orderSystem === 'undefined') {
        console.error('❌ orderSystem을 찾을 수 없습니다');
        return;
    }
    
    const order = orderSystem.orders?.find(o => o.order_number === orderNumber);
    if (!order) {
        console.error('❌ 주문번호를 찾을 수 없습니다:', orderNumber);
        return;
    }
    
    // 송장번호 업데이트
    order.tracking_number = trackingNumber;
    order.order_status = '배송시작';
    order.status = '배송시작';
    order.updated_at = Date.now();
    
    // 로컬 저장
    orderSystem.saveToLocalStorage('orders', orderSystem.orders);
    
    // 테이블 새로고침
    if (orderSystem.loadShippingOrders) {
        orderSystem.loadShippingOrders();
    }
    
    console.log('✅ 송장번호 등록 완료');
    alert(`✅ 송장번호 등록 완료!\n${orderNumber} -> ${trackingNumber}`);
}

// 현재 주문 상태 확인
function checkOrderStatus() {
    console.log('📋 현재 주문 상태 확인...');
    
    if (typeof orderSystem === 'undefined') {
        console.error('❌ orderSystem을 찾을 수 없습니다');
        return;
    }
    
    const orders = orderSystem.orders || [];
    console.log('총 주문 수:', orders.length);
    
    orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.order_number} - ${order.customer_name} - ${order.order_status} - 송장번호: ${order.tracking_number || '없음'}`);
    });
    
    const withTracking = orders.filter(o => o.tracking_number).length;
    console.log(`송장번호 있는 주문: ${withTracking}개`);
}

console.log(`
📦 송장번호 테스트 도구

🔧 사용 방법:
1. quickTrackingTest() - 일괄 송장번호 테스트
2. testSingleTracking('주문번호', '송장번호') - 개별 테스트
3. checkOrderStatus() - 현재 주문 상태 확인

🚀 즉시 테스트:
quickTrackingTest()
`);

// 자동 실행
checkOrderStatus();