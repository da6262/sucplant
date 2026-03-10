// Supabase 전용 데이터 가져오기 코드
console.log('📥 Supabase 데이터 가져오기 시작...');

// 사용자에게 데이터 입력 요청
const dataString = prompt('온라인 사이트에서 복사한 데이터를 붙여넣으세요:');

if (dataString) {
    try {
        const allData = JSON.parse(dataString);
        
        // Supabase를 통해 데이터 저장
        if (allData.orders && window.orderDataManager) {
            for (const order of allData.orders) {
                await window.orderDataManager.addOrder(order);
            }
            console.log('✅ 주문 데이터 Supabase 저장:', allData.orders.length, '건');
        }
        
        if (allData.customers && window.customerDataManager) {
            for (const customer of allData.customers) {
                await window.customerDataManager.addCustomer(customer);
            }
            console.log('✅ 고객 데이터 Supabase 저장:', allData.customers.length, '명');
        }
        
        if (allData.products && window.productDataManager) {
            for (const product of allData.products) {
                await window.productDataManager.addProduct(product);
            }
            console.log('✅ 상품 데이터 Supabase 저장:', allData.products.length, '개');
        }
        
        if (allData.categories && window.productDataManager) {
            for (const category of allData.categories) {
                await window.productDataManager.addCategory(category);
            }
            console.log('✅ 카테고리 데이터 Supabase 저장:', allData.categories.length, '개');
        }
        
        if (allData.waitlist && window.waitlistDataManager) {
            for (const waitlist of allData.waitlist) {
                await window.waitlistDataManager.addWaitlist(waitlist);
            }
            console.log('✅ 대기자 데이터 Supabase 저장:', allData.waitlist.length, '명');
        }
        
        console.log('✅ 모든 데이터가 Supabase에 저장되었습니다');
        alert('🎉 데이터 가져오기 완료!\n\n모든 데이터가 Supabase에 저장되었습니다.');
        
    } catch (error) {
        console.error('❌ 데이터 가져오기 실패:', error);
        alert('데이터 가져오기에 실패했습니다: ' + error.message);
    }
} else {
    console.log('❌ 데이터가 입력되지 않았습니다');
}