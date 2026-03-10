// Supabase 전용 데이터 추출 코드
console.log('📊 Supabase 데이터 추출 시작...');

// 모든 데이터를 Supabase에서 추출
const allData = {
    orders: window.orderDataManager ? window.orderDataManager.getAllOrders() : [],
    customers: window.customerDataManager ? window.customerDataManager.getAllCustomers() : [],
    products: window.productDataManager ? window.productDataManager.getAllProducts() : [],
    categories: window.productDataManager ? window.productDataManager.getAllCategories() : [],
    waitlist: window.waitlistDataManager ? window.waitlistDataManager.getAllWaitlist() : [],
    channels: [], // 채널 데이터는 별도 관리
    orderStatuses: [], // 주문 상태는 별도 관리
    settings: {} // 설정 데이터는 별도 관리
};

console.log('📋 추출된 데이터:', allData);

// 데이터를 JSON 문자열로 변환하여 복사 가능하게 만들기
const dataString = JSON.stringify(allData, null, 2);

// 클립보드에 복사
navigator.clipboard.writeText(dataString).then(() => {
    console.log('✅ 데이터가 클립보드에 복사되었습니다');
    alert('✅ 모든 데이터가 클립보드에 복사되었습니다!\n\n이제 다른 사이트에서 붙여넣기할 수 있습니다.');
}).catch(err => {
    console.error('❌ 클립보드 복사 실패:', err);
    
    // 대안: 텍스트 영역에 표시
    const textarea = document.createElement('textarea');
    textarea.value = dataString;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    console.log('✅ 대안 방법으로 데이터 복사 완료');
    alert('✅ 모든 데이터가 복사되었습니다!\n\n이제 다른 사이트에서 붙여넣기할 수 있습니다.');
});