// 배송관리 테이블에 송장번호 개별 입력란 강제 생성

console.log('🚀 배송관리 개별 송장번호 입력란 생성 시작...');

// 1. 현재 테이블 상태 확인
function analyzeShippingTable() {
    console.log('🔍 배송 테이블 분석...');
    
    const table = document.getElementById('shipping-table-body');
    if (!table) {
        console.error('❌ 배송 테이블을 찾을 수 없습니다');
        return null;
    }
    
    const rows = table.querySelectorAll('tr');
    console.log(`📋 총 ${rows.length}개 행 발견`);
    
    const analysis = [];
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        console.log(`행 ${index + 1}: ${cells.length}개 셀`);
        
        if (cells.length >= 8) {
            const trackingCell = cells[7]; // 송장번호 컬럼 (8번째)
            const content = trackingCell.innerHTML;
            const hasInput = content.includes('<input');
            const hasSpan = content.includes('<span');
            const text = trackingCell.textContent.trim();
            
            analysis.push({
                rowIndex: index,
                cellCount: cells.length,
                hasInput: hasInput,
                hasSpan: hasSpan,
                content: text,
                fullHTML: content
            });
            
            console.log(`  송장번호 셀: "${text}" (입력란: ${hasInput}, 스팬: ${hasSpan})`);
        }
    });
    
    return analysis;
}

// 2. 송장번호 입력란 강제 생성
function createIndividualTrackingInputs() {
    console.log('📦 개별 송장번호 입력란 생성...');
    
    const table = document.getElementById('shipping-table-body');
    if (!table) {
        console.error('❌ 배송 테이블을 찾을 수 없습니다');
        return;
    }
    
    const rows = table.querySelectorAll('tr');
    let createdCount = 0;
    
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 8) {
            const trackingCell = cells[7];
            const currentContent = trackingCell.textContent.trim();
            
            // "미등록"이거나 빈 값이면 입력란 생성
            if (currentContent === '미등록' || currentContent === '' || currentContent === '-') {
                const uniqueId = `tracking-row-${rowIndex}-${Date.now()}`;
                
                // 새로운 입력란 HTML 생성
                trackingCell.innerHTML = `
                    <div class="flex items-center space-x-1" style="min-width: 140px;">
                        <input type="text" 
                               id="${uniqueId}"
                               placeholder="송장번호 입력"
                               class="tracking-input-field"
                               style="width: 100px; padding: 4px 6px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 4px; font-family: monospace;"
                               onkeypress="if(event.key==='Enter') saveIndividualTracking('${uniqueId}', ${rowIndex})"
                               onblur="saveIndividualTracking('${uniqueId}', ${rowIndex})">
                        <button onclick="saveIndividualTracking('${uniqueId}', ${rowIndex})" 
                                class="tracking-save-btn"
                                style="padding: 4px 6px; font-size: 10px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                title="송장번호 저장">
                            💾
                        </button>
                    </div>
                `;
                
                createdCount++;
                console.log(`✅ 행 ${rowIndex + 1}에 송장번호 입력란 생성 (ID: ${uniqueId})`);
            } else {
                console.log(`ℹ️ 행 ${rowIndex + 1}: 이미 송장번호 있음 ("${currentContent}")`);
            }
        }
    });
    
    console.log(`🎉 총 ${createdCount}개의 송장번호 입력란 생성 완료!`);
    return createdCount;
}

// 3. 송장번호 저장 함수 (전역)
window.saveIndividualTracking = function(inputId, rowIndex) {
    console.log(`💾 송장번호 저장 시도: ${inputId}, 행: ${rowIndex + 1}`);
    
    const input = document.getElementById(inputId);
    if (!input) {
        console.error('❌ 입력란을 찾을 수 없습니다:', inputId);
        alert('입력란을 찾을 수 없습니다.');
        return;
    }
    
    const trackingNumber = input.value.trim();
    
    if (!trackingNumber) {
        console.log('⚠️ 빈 송장번호');
        alert('송장번호를 입력해주세요.');
        input.focus();
        return;
    }
    
    // 기본 검증 (숫자만, 8-20자리)
    if (!/^\d{8,20}$/.test(trackingNumber)) {
        if (!confirm(`송장번호 형식을 확인해주세요.\n"${trackingNumber}"\n\n그래도 저장하시겠습니까?`)) {
            input.focus();
            return;
        }
    }
    
    console.log(`✅ 송장번호 저장: 행 ${rowIndex + 1} -> ${trackingNumber}`);
    
    // 시각적 피드백
    input.style.backgroundColor = '#dcfce7'; // 연한 초록
    input.style.borderColor = '#16a34a';
    
    // 저장 버튼 비활성화
    const saveBtn = input.parentNode.querySelector('.tracking-save-btn');
    if (saveBtn) {
        saveBtn.innerHTML = '✅';
        saveBtn.disabled = true;
        saveBtn.style.backgroundColor = '#16a34a';
    }
    
    // 성공 알림
    const message = `📦 송장번호 저장 완료!\n\n행: ${rowIndex + 1}번\n송장번호: ${trackingNumber}`;
    
    // 짧은 토스트 메시지 (3초)
    showToastMessage(message);
    
    // 실제 데이터 저장 (orderSystem이 있을 경우)
    if (typeof orderSystem !== 'undefined' && orderSystem.orders) {
        try {
            // 해당 행의 주문 데이터 찾기
            const tableRow = input.closest('tr');
            const orderNumberCell = tableRow.querySelector('td:nth-child(2)'); // 주문번호는 2번째 컬럼
            
            if (orderNumberCell) {
                const orderNumber = orderNumberCell.textContent.trim();
                console.log(`🔍 주문번호로 데이터 찾기: ${orderNumber}`);
                
                const order = orderSystem.orders.find(o => o.order_number === orderNumber);
                if (order) {
                    console.log(`📋 주문 데이터 발견:`, order);
                    
                    // orderSystem의 함수 호출
                    if (orderSystem.updateTrackingNumber) {
                        orderSystem.updateTrackingNumber(order.id, trackingNumber);
                    }
                } else {
                    console.warn(`⚠️ 주문번호 ${orderNumber}에 해당하는 데이터를 찾을 수 없습니다`);
                }
            }
        } catch (error) {
            console.error('❌ 실제 데이터 저장 중 오류:', error);
        }
    }
    
    // 3초 후 원래 상태로 복구
    setTimeout(() => {
        input.style.backgroundColor = '';
        input.style.borderColor = '';
        if (saveBtn && !saveBtn.disabled) {
            saveBtn.innerHTML = '💾';
            saveBtn.style.backgroundColor = '#2563eb';
        }
    }, 3000);
};

// 4. 토스트 메시지 표시
function showToastMessage(message) {
    // 기존 토스트 제거
    const existingToast = document.getElementById('tracking-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.id = 'tracking-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message.replace(/\n/g, ' ');
    
    document.body.appendChild(toast);
    
    // 3초 후 제거
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// 5. 전체 프로세스 실행
function setupIndividualTrackingInputs() {
    console.log('🚀 개별 송장번호 입력란 설정 시작...\n');
    
    // 1단계: 배송 탭으로 이동
    const shippingTab = document.getElementById('tab-shipping');
    if (shippingTab) {
        shippingTab.click();
        console.log('📋 배송 관리 탭으로 이동');
    }
    
    // 2단계: 테이블 분석
    setTimeout(() => {
        const analysis = analyzeShippingTable();
        console.log('\n');
        
        // 3단계: 입력란 생성
        if (analysis) {
            const createdCount = createIndividualTrackingInputs();
            
            if (createdCount > 0) {
                console.log('\n🎉 송장번호 개별 입력란 설정 완료!');
                console.log('💡 이제 각 주문마다 송장번호를 직접 입력할 수 있습니다.');
                console.log('💾 입력 후 Enter키 또는 💾 버튼을 클릭하세요.');
                
                showToastMessage(`✅ ${createdCount}개의 송장번호 입력란이 생성되었습니다!`);
            } else {
                console.log('\n📝 이미 모든 주문에 송장번호가 등록되어 있습니다.');
                showToastMessage('📝 모든 주문에 송장번호가 이미 등록되어 있습니다.');
            }
        }
    }, 1000);
}

// 사용법 안내
console.log(`
📦 개별 송장번호 입력란 생성 도구

🔧 사용 방법:
1. setupIndividualTrackingInputs() - 전체 자동 설정
2. createIndividualTrackingInputs() - 입력란만 생성
3. analyzeShippingTable() - 테이블 상태 분석

🚀 즉시 실행:
setupIndividualTrackingInputs()
`);

// 3초 후 자동 실행
console.log('⚡ 3초 후 자동 설정 시작...');
setTimeout(() => {
    setupIndividualTrackingInputs();
}, 3000);