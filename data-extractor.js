// 온라인 사이트에서 실행할 데이터 추출 코드
console.log('📊 데이터 추출 시작...');

// 모든 데이터 추출
const allData = {
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    customers: JSON.parse(localStorage.getItem('customers') || '[]'),
    products: JSON.parse(localStorage.getItem('products') || '[]'),
    categories: JSON.parse(localStorage.getItem('categories') || '[]'),
    waitlist: JSON.parse(localStorage.getItem('waitlist') || '[]'),
    channels: JSON.parse(localStorage.getItem('channels') || '[]'),
    orderStatuses: JSON.parse(localStorage.getItem('orderStatuses') || '[]'),
    settings: JSON.parse(localStorage.getItem('settings') || '{}')
};

console.log('📋 추출된 데이터:', allData);

// 데이터를 JSON 문자열로 변환하여 복사 가능하게 만들기
const dataString = JSON.stringify(allData, null, 2);
console.log('📄 데이터 문자열:', dataString);

// 클립보드에 복사 (브라우저에서 실행 시)
if (navigator.clipboard) {
    navigator.clipboard.writeText(dataString).then(() => {
        console.log('✅ 데이터가 클립보드에 복사되었습니다!');
        alert('✅ 데이터가 클립보드에 복사되었습니다!\n\n이제 localhost:8000에서 붙여넣기하세요.');
    }).catch(err => {
        console.error('❌ 클립보드 복사 실패:', err);
        console.log('📄 수동으로 복사하세요:', dataString);
    });
} else {
    console.log('📄 수동으로 복사하세요:', dataString);
    alert('📄 콘솔에서 데이터를 복사하세요!');
}

// 전역 변수로도 설정
window.extractedData = allData;
console.log('✅ 데이터 추출 완료! window.extractedData로 접근 가능');
