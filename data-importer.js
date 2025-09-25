// localhost:8000에서 실행할 데이터 가져오기 코드
console.log('📥 데이터 가져오기 시작...');

// 사용자에게 데이터 입력 요청
const dataString = prompt('온라인 사이트에서 복사한 데이터를 붙여넣으세요:');

if (dataString) {
    try {
        const allData = JSON.parse(dataString);
        
        // 각 데이터를 localStorage에 저장
        if (allData.orders) {
            localStorage.setItem('orders', JSON.stringify(allData.orders));
            console.log('✅ 주문 데이터 저장:', allData.orders.length, '건');
        }
        
        if (allData.customers) {
            localStorage.setItem('customers', JSON.stringify(allData.customers));
            console.log('✅ 고객 데이터 저장:', allData.customers.length, '명');
        }
        
        if (allData.products) {
            localStorage.setItem('products', JSON.stringify(allData.products));
            console.log('✅ 상품 데이터 저장:', allData.products.length, '개');
        }
        
        if (allData.categories) {
            localStorage.setItem('categories', JSON.stringify(allData.categories));
            console.log('✅ 카테고리 데이터 저장:', allData.categories.length, '개');
        }
        
        if (allData.waitlist) {
            localStorage.setItem('waitlist', JSON.stringify(allData.waitlist));
            console.log('✅ 대기자 데이터 저장:', allData.waitlist.length, '명');
        }
        
        if (allData.channels) {
            localStorage.setItem('channels', JSON.stringify(allData.channels));
            console.log('✅ 판매채널 데이터 저장:', allData.channels.length, '개');
        }
        
        if (allData.orderStatuses) {
            localStorage.setItem('orderStatuses', JSON.stringify(allData.orderStatuses));
            console.log('✅ 주문상태 데이터 저장:', allData.orderStatuses.length, '개');
        }
        
        if (allData.settings) {
            localStorage.setItem('settings', JSON.stringify(allData.settings));
            console.log('✅ 설정 데이터 저장');
        }
        
        console.log('🎉 모든 데이터 가져오기 완료!');
        alert('🎉 데이터 가져오기 완료!\n\n페이지를 새로고침하면 데이터가 표시됩니다.');
        
        // 페이지 새로고침
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ 데이터 파싱 오류:', error);
        alert('❌ 데이터 형식이 올바르지 않습니다. 다시 시도해주세요.');
    }
} else {
    console.log('❌ 데이터가 입력되지 않았습니다.');
}

