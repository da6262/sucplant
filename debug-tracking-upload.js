// 송장번호 엑셀 업로드 디버깅 스크립트

console.log('🔍 송장번호 엑셀 업로드 디버깅 시작...');

// 1단계: 모달 확인
function checkTrackingModal() {
    console.log('📋 1단계: 송장번호 모달 확인');
    
    const modal = document.getElementById('tracking-import-modal');
    const button = document.getElementById('bulk-tracking-shipping-btn');
    
    console.log('모달 존재:', !!modal);
    console.log('버튼 존재:', !!button);
    
    if (modal) {
        console.log('모달 클래스:', modal.className);
    }
    
    if (button) {
        console.log('버튼 텍스트:', button.textContent);
        // 버튼 강제 클릭 테스트
        button.click();
        console.log('✅ 버튼 클릭 완료');
    }
}

// 2단계: 업로드 방식 전환 버튼 확인
function checkUploadMethods() {
    console.log('📊 2단계: 업로드 방식 버튼 확인');
    
    const manualBtn = document.getElementById('upload-method-manual');
    const excelBtn = document.getElementById('upload-method-excel');
    
    console.log('직접입력 버튼:', !!manualBtn);
    console.log('엑셀업로드 버튼:', !!excelBtn);
    
    if (excelBtn) {
        console.log('엑셀 버튼 텍스트:', excelBtn.textContent);
        // 엑셀 모드로 전환 테스트
        excelBtn.click();
        console.log('✅ 엑셀 모드로 전환 시도');
    }
}

// 3단계: 엑셀 업로드 섹션 확인
function checkExcelSection() {
    console.log('📁 3단계: 엑셀 업로드 섹션 확인');
    
    const excelSection = document.getElementById('excel-upload-section');
    const fileInput = document.getElementById('tracking-excel-input');
    
    console.log('엑셀 섹션 존재:', !!excelSection);
    console.log('파일 입력 존재:', !!fileInput);
    
    if (excelSection) {
        console.log('엑셀 섹션 클래스:', excelSection.className);
        console.log('숨김 여부:', excelSection.classList.contains('hidden'));
    }
}

// 4단계: SheetJS 라이브러리 확인
function checkSheetJS() {
    console.log('📚 4단계: SheetJS 라이브러리 확인');
    
    console.log('XLSX 존재:', typeof XLSX !== 'undefined');
    
    if (typeof XLSX === 'undefined') {
        console.error('❌ SheetJS 라이브러리가 로드되지 않았습니다!');
        console.log('🔧 해결방법: 페이지 새로고침 후 다시 시도');
    } else {
        console.log('✅ SheetJS 라이브러리 정상 로드됨');
        console.log('XLSX 버전:', XLSX.version || 'unknown');
    }
}

// 5단계: orderSystem 함수 확인
function checkOrderSystemFunctions() {
    console.log('🔧 5단계: orderSystem 함수 확인');
    
    if (typeof orderSystem === 'undefined') {
        console.error('❌ orderSystem이 정의되지 않았습니다!');
        return;
    }
    
    console.log('switchUploadMethod:', typeof orderSystem.switchUploadMethod);
    console.log('handleExcelFileUpload:', typeof orderSystem.handleExcelFileUpload);
    console.log('clearUploadedFile:', typeof orderSystem.clearUploadedFile);
    console.log('currentExcelData:', orderSystem.currentExcelData);
}

// 전체 테스트 실행
function runFullTest() {
    console.log('🚀 전체 테스트 실행...\n');
    
    checkTrackingModal();
    console.log('\n');
    
    setTimeout(() => {
        checkUploadMethods();
        console.log('\n');
        
        setTimeout(() => {
            checkExcelSection();
            console.log('\n');
            checkSheetJS();
            console.log('\n');
            checkOrderSystemFunctions();
            
            console.log('\n🎯 테스트 완료!');
        }, 1000);
    }, 1000);
}

// 수동으로 엑셀 업로드 섹션 생성 (긴급 해결책)
function createExcelUploadManually() {
    console.log('🛠️ 엑셀 업로드 섹션 수동 생성...');
    
    const modal = document.getElementById('tracking-import-modal');
    if (!modal) {
        console.error('❌ 모달을 찾을 수 없습니다');
        return;
    }
    
    // 기존 내용 확인
    const manualSection = document.getElementById('manual-input-section');
    if (manualSection) {
        console.log('✅ 직접입력 섹션 존재');
    }
    
    const excelSection = document.getElementById('excel-upload-section');
    if (!excelSection) {
        console.log('❌ 엑셀 섹션이 없음 - 수동 생성 필요');
        
        // 긴급 생성 (임시)
        const newDiv = document.createElement('div');
        newDiv.innerHTML = `
            <div style="border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 10px 0;">
                <h3>📊 엑셀 업로드 (임시 버전)</h3>
                <input type="file" id="temp-excel-input" accept=".xlsx,.xls" style="margin: 10px;">
                <br>
                <button onclick="alert('임시 엑셀 업로드 기능입니다')" style="background: green; color: white; padding: 10px; border: none; border-radius: 5px;">
                    테스트 업로드
                </button>
            </div>
        `;
        
        if (manualSection) {
            manualSection.parentNode.insertBefore(newDiv, manualSection.nextSibling);
            console.log('✅ 임시 엑셀 섹션 생성 완료');
        }
    } else {
        console.log('✅ 엑셀 섹션 이미 존재');
    }
}

// 사용법 안내
console.log(`
📋 송장번호 엑셀 업로드 디버깅 도구

🔧 사용 방법:
1. runFullTest() - 전체 상태 확인
2. checkTrackingModal() - 모달 확인
3. checkUploadMethods() - 업로드 방식 확인
4. checkExcelSection() - 엑셀 섹션 확인
5. checkSheetJS() - 라이브러리 확인
6. createExcelUploadManually() - 긴급 생성

🚨 긴급 사용:
createExcelUploadManually()
`);

// 자동 실행
runFullTest();