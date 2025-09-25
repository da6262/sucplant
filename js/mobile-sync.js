// 핸드폰 전용 데이터 동기화 스크립트
// 부대장님 전용 🌱📱

// 핸드폰 데이터를 서버로 업로드하는 함수
window.mobileSync = async function() {
    console.log('📱 핸드폰 데이터 서버 업로드 시작...');
    
    try {
        // 1. 현재 모드 확인
        const isApiMode = window.app && window.app.apiAvailable;
        console.log(`현재 모드: ${isApiMode ? 'API모드' : '로컬모드'}`);
        
        if (!isApiMode) {
            alert('⚠️ 먼저 API 모드로 전환해주세요!\n우상단 "📱→🌐" 버튼을 눌러주세요.');
            return;
        }
        
        // 2. 로컬 데이터 추출
        const localData = {
            customers: JSON.parse(localStorage.getItem('customers') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            waitlist: JSON.parse(localStorage.getItem('waitlist') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            order_sources: JSON.parse(localStorage.getItem('order_sources') || '[]')
        };
        
        console.log('📊 핸드폰 로컬 데이터:');
        Object.keys(localData).forEach(key => {
            console.log(`  ${key}: ${localData[key].length}개`);
        });
        
        // 3. 확인 다이얼로그
        const totalItems = Object.values(localData).reduce((sum, arr) => sum + arr.length, 0);
        const confirm = window.confirm(
            `📱→🌐 핸드폰 데이터 업로드\n\n` +
            `총 ${totalItems}개 항목을 서버에 업로드하시겠습니까?\n\n` +
            `• 주문: ${localData.orders.length}개\n` +
            `• 고객: ${localData.customers.length}개\n` +
            `• 상품: ${localData.products.length}개\n` +
            `• 대기자: ${localData.waitlist.length}개\n\n` +
            `⚠️ 서버 데이터와 병합됩니다.`
        );
        
        if (!confirm) {
            console.log('❌ 사용자 취소');
            return;
        }
        
        // 4. 데이터 마이그레이션 실행
        if (window.dataMigration) {
            console.log('🚀 데이터 마이그레이션 시작...');
            const success = await window.dataMigration.migrate();
            
            if (success) {
                alert('🎉 핸드폰 데이터 업로드 완료!\n\n' +
                      '이제 모든 기기에서 동일한 데이터를 볼 수 있습니다.\n' +
                      '페이지를 새로고침해주세요.');
                
                // 자동 새로고침
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                alert('❌ 업로드 중 오류가 발생했습니다.\n콘솔을 확인해주세요.');
            }
        } else {
            alert('❌ 데이터 마이그레이션 도구를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 핸드폰 동기화 오류:', error);
        alert('❌ 동기화 중 오류 발생\n' + error.message);
    }
};

// 데이터 비교 함수
window.compareData = function() {
    const localData = {
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        waitlist: JSON.parse(localStorage.getItem('waitlist') || '[]')
    };
    
    console.log('📊 핸드폰 로컬 데이터 현황:');
    console.log(`주문: ${localData.orders.length}개`);
    console.log(`고객: ${localData.customers.length}개`);
    console.log(`상품: ${localData.products.length}개`);
    console.log(`대기자: ${localData.waitlist.length}개`);
    
    // 주문 상세 출력
    if (localData.orders.length > 0) {
        console.log('\n📦 주문 목록:');
        localData.orders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.order_number || order.orderNumber} - ${order.total_amount || order.totalAmount}원`);
        });
    }
    
    return localData;
};

console.log(`
📱 === 핸드폰 데이터 동기화 도구 ===

📊 데이터 현황 확인:
   compareData()

🚀 핸드폰 → 서버 업로드:
   mobileSync()

💡 사용 순서:
1. compareData() 로 데이터 확인
2. mobileSync() 로 서버 업로드
3. 완료되면 자동 새로고침
`);