// 송장번호 입력 테스트 스크립트

// 콘솔에서 실행할 수 있는 테스트 함수
function testTrackingInput() {
    console.log('📦 송장번호 입력란 테스트 시작...');
    
    // 배송 테이블 확인
    const shippingTable = document.getElementById('shipping-table-body');
    if (!shippingTable) {
        console.error('❌ 배송 테이블을 찾을 수 없습니다');
        return;
    }
    
    console.log('✅ 배송 테이블 발견');
    console.log('현재 테이블 내용:', shippingTable.innerHTML.length, '문자');
    
    // 송장번호 입력란 확인
    const trackingInputs = document.querySelectorAll('input[id^="tracking-"]');
    console.log('📝 송장번호 입력란 개수:', trackingInputs.length);
    
    if (trackingInputs.length === 0) {
        console.error('❌ 송장번호 입력란이 없습니다. 테이블을 다시 렌더링해야 합니다.');
        
        // 강제로 테이블 다시 렌더링
        if (typeof orderSystem !== 'undefined') {
            console.log('🔄 테이블 강제 렌더링...');
            orderSystem.loadShippingOrders();
        }
    } else {
        console.log('✅ 송장번호 입력란들:');
        trackingInputs.forEach((input, index) => {
            console.log(`  ${index + 1}. ID: ${input.id}, 값: "${input.value}"`);
        });
    }
}

// 송장번호 수동 업데이트 테스트
function testUpdateTracking(orderId, trackingNumber) {
    console.log(`📦 송장번호 수동 업데이트 테스트: ${orderId} -> ${trackingNumber}`);
    
    if (typeof orderSystem !== 'undefined' && orderSystem.updateTrackingNumber) {
        orderSystem.updateTrackingNumber(orderId, trackingNumber);
        console.log('✅ 함수 호출 완료');
    } else {
        console.error('❌ orderSystem.updateTrackingNumber 함수를 찾을 수 없습니다');
    }
}

// 배송 테이블 강제 새로고침
function forceRefreshShippingTable() {
    console.log('🔄 배송 테이블 강제 새로고침...');
    
    if (typeof orderSystem !== 'undefined') {
        // 1. 배송 주문 다시 로드
        orderSystem.loadShippingOrders();
        
        // 2. 잠시 후 테이블 확인
        setTimeout(() => {
            testTrackingInput();
        }, 1000);
        
        console.log('✅ 새로고침 요청 완료');
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다');
    }
}

// 송장번호 입력란 수동 생성 (긴급 해결책)
function createTrackingInputsManually() {
    console.log('🛠️ 송장번호 입력란 수동 생성...');
    
    const shippingTable = document.getElementById('shipping-table-body');
    if (!shippingTable) {
        console.error('❌ 배송 테이블을 찾을 수 없습니다');
        return;
    }
    
    // 모든 행 찾기
    const rows = shippingTable.querySelectorAll('tr');
    console.log(`📋 테이블 행 개수: ${rows.length}`);
    
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) { // 송장번호는 8번째 컬럼
            const trackingCell = cells[7]; // 0부터 시작하므로 7번째
            
            // 현재 내용 확인
            const currentContent = trackingCell.innerHTML;
            console.log(`행 ${index + 1} 송장번호 셀:`, currentContent);
            
            // "미등록"이 있으면 입력란으로 교체
            if (currentContent.includes('미등록') || currentContent.includes('text-gray-400')) {
                const orderId = `test-${index + 1}`;
                trackingCell.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <input type="text" 
                               id="tracking-${orderId}"
                               value="" 
                               placeholder="송장번호 입력"
                               class="w-28 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                               onblur="testUpdateTracking('${orderId}', this.value)"
                               onkeypress="if(event.key==='Enter') testUpdateTracking('${orderId}', this.value)">
                        <button onclick="testUpdateTracking('${orderId}', document.getElementById('tracking-${orderId}').value)" 
                                class="px-1 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="저장">
                            <i class="fas fa-save text-xs"></i>
                        </button>
                    </div>
                `;
                console.log(`✅ 행 ${index + 1} 입력란 생성 완료`);
            }
        }
    });
}

// 사용 방법 안내
console.log(`
📦 송장번호 입력란 테스트 도구

사용 방법:
1. testTrackingInput() - 현재 상태 확인
2. forceRefreshShippingTable() - 테이블 새로고침
3. createTrackingInputsManually() - 수동으로 입력란 생성
4. testUpdateTracking('주문ID', '송장번호') - 송장번호 업데이트 테스트

예시:
testTrackingInput()
forceRefreshShippingTable() 
createTrackingInputsManually()
testUpdateTracking('1', '123456789012')
`);

// 즉시 테스트 실행
testTrackingInput();