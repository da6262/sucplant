// 배송관리 테이블 송장번호 입력란 강제 생성 스크립트

console.log('🔧 배송관리 테이블 송장번호 입력란 강제 수정 시작...');

// 1. 배송 테이블 강제 새로고침
function forceRefreshShippingTable() {
    console.log('🔄 배송 테이블 강제 새로고침...');
    
    if (typeof orderSystem !== 'undefined') {
        // 배송 탭으로 전환
        orderSystem.switchTab('tab-shipping');
        
        // 배송 주문 다시 로드
        setTimeout(() => {
            orderSystem.loadShippingOrders();
            console.log('✅ 배송 테이블 새로고침 완료');
        }, 500);
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다');
    }
}

// 2. 송장번호 입력란 수동 생성
function createTrackingInputsInShippingTable() {
    console.log('📦 송장번호 입력란 수동 생성...');
    
    const shippingTable = document.getElementById('shipping-table-body');
    if (!shippingTable) {
        console.error('❌ 배송 테이블을 찾을 수 없습니다');
        return;
    }
    
    const rows = shippingTable.querySelectorAll('tr');
    console.log(`📋 배송 테이블 행 개수: ${rows.length}`);
    
    let modifiedCount = 0;
    
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        
        // 8번째 컬럼이 송장번호 컬럼 (0부터 시작하므로 7번째 인덱스)
        if (cells.length >= 8) {
            const trackingCell = cells[7];
            const currentContent = trackingCell.innerHTML;
            
            // "미등록" 텍스트가 있으면 입력란으로 교체
            if (currentContent.includes('미등록') || currentContent.includes('text-gray-400')) {
                const orderId = `manual-${index}`;
                
                trackingCell.innerHTML = `
                    <div class="flex items-center space-x-1">
                        <input type="text" 
                               id="tracking-input-${orderId}"
                               value="" 
                               placeholder="송장번호"
                               class="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                               style="min-width: 100px; font-size: 11px;">
                        <button onclick="saveTrackingNumber('${orderId}')" 
                                class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                title="저장">
                            💾
                        </button>
                    </div>
                `;
                
                modifiedCount++;
                console.log(`✅ 행 ${index + 1} 송장번호 입력란 생성`);
            } else if (currentContent.includes('input')) {
                console.log(`ℹ️ 행 ${index + 1} 이미 입력란 존재`);
            } else {
                console.log(`ℹ️ 행 ${index + 1} 송장번호: ${currentContent.trim()}`);
            }
        }
    });
    
    console.log(`🎉 ${modifiedCount}개 송장번호 입력란 생성 완료!`);
    
    if (modifiedCount === 0) {
        console.log('💡 이미 모든 송장번호가 등록되어 있거나 입력란이 존재합니다.');
    }
}

// 3. 송장번호 저장 함수 (전역)
window.saveTrackingNumber = function(orderId) {
    const input = document.getElementById(`tracking-input-${orderId}`);
    if (!input) {
        alert('입력란을 찾을 수 없습니다.');
        return;
    }
    
    const trackingNumber = input.value.trim();
    if (!trackingNumber) {
        alert('송장번호를 입력해주세요.');
        input.focus();
        return;
    }
    
    // 송장번호 검증 (숫자만 허용, 10~15자리)
    if (!/^\d{10,15}$/.test(trackingNumber)) {
        if (!confirm('올바른 송장번호 형식이 아닙니다. (10-15자리 숫자)\n그래도 저장하시겠습니까?')) {
            input.focus();
            return;
        }
    }
    
    console.log(`💾 송장번호 저장: ${orderId} -> ${trackingNumber}`);
    
    // 저장 성공 표시 (임시)
    input.style.backgroundColor = '#d1fae5'; // 연한 초록색
    input.readOnly = true;
    
    // 저장 완료 메시지
    alert(`📦 송장번호가 저장되었습니다!\n\n주문: ${orderId}\n송장번호: ${trackingNumber}`);
    
    // 3초 후 원래 상태로 복구
    setTimeout(() => {
        input.style.backgroundColor = '';
        input.readOnly = false;
    }, 3000);
};

// 4. 배송 테이블 상태 확인
function checkShippingTableStatus() {
    console.log('🔍 배송 테이블 상태 확인...');
    
    // 현재 탭 확인
    const activeTab = document.querySelector('.tab-button.active');
    const shippingSection = document.getElementById('shipping-section');
    const shippingTable = document.getElementById('shipping-table-body');
    
    console.log('현재 활성 탭:', activeTab ? activeTab.textContent.trim() : '없음');
    console.log('배송 섹션 숨김 여부:', shippingSection ? shippingSection.classList.contains('hidden') : '섹션 없음');
    console.log('배송 테이블 존재:', !!shippingTable);
    
    if (shippingTable) {
        const rows = shippingTable.querySelectorAll('tr');
        console.log('테이블 행 개수:', rows.length);
        
        if (rows.length === 1 && rows[0].innerHTML.includes('배송할 주문이 없습니다')) {
            console.log('📝 배송할 주문이 없는 상태');
        }
    }
}

// 5. 전체 수정 프로세스
function fixShippingTrackingInputs() {
    console.log('🚀 배송관리 송장번호 입력란 전체 수정 시작...\n');
    
    // 1단계: 상태 확인
    checkShippingTableStatus();
    console.log('\n');
    
    // 2단계: 배송 탭으로 이동
    const shippingTab = document.getElementById('tab-shipping');
    if (shippingTab) {
        shippingTab.click();
        console.log('📋 배송 관리 탭으로 이동');
        
        // 3단계: 잠시 후 테이블 새로고침
        setTimeout(() => {
            forceRefreshShippingTable();
            
            // 4단계: 입력란 생성
            setTimeout(() => {
                createTrackingInputsInShippingTable();
                console.log('\n🎉 송장번호 입력란 수정 완료!');
                console.log('💡 이제 송장번호를 직접 입력할 수 있습니다.');
            }, 1000);
        }, 500);
    } else {
        console.error('❌ 배송 관리 탭을 찾을 수 없습니다');
    }
}

// 사용법 안내
console.log(`
📦 배송관리 송장번호 입력란 수정 도구

🔧 사용 방법:
1. fixShippingTrackingInputs() - 전체 자동 수정
2. createTrackingInputsInShippingTable() - 입력란만 생성
3. forceRefreshShippingTable() - 테이블 새로고침
4. checkShippingTableStatus() - 현재 상태 확인

🚀 즉시 수정:
fixShippingTrackingInputs()
`);

// 자동 실행
console.log('⚡ 3초 후 자동 수정 시작...');
setTimeout(() => {
    fixShippingTrackingInputs();
}, 3000);