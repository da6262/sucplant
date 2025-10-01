const fs = require('fs');
const path = require('path');

// 깨진 한글 패턴과 올바른 한글 매핑
const encodingFixes = {
    // 경산다육식물농장 관련
    '寃쎌궛?ㅼ쑁?앸Ъ?띿옣': '경산다육식물농장',
    '愿由ъ떆?ㅽ뀥': '관리시스템',
    '愿由ъ떆?ㅽ뀥': '관리시스템',
    
    // 기타 깨진 한글 패턴들
    '?ㅼ쑁': '다육',
    '?띿옣': '농장',
    '愿': '관',
    '由': '리',
    'ъ떆': '시스',
    '?ㅽ뀥': '템',
    
    // 추가 패턴들
    '?꾨Ц': '전문',
    '?쒖뒪': '시스템',
    '?몄쓽': '기능',
    '?듭떖': '업데이트',
    '?쒕늿': '확인',
    '?뺤씤': '하세요',
    '?섏꽭': '합니다',
    '?⑸땲': '입니다',
    '?꾨즺': '완료',
    '?ㅼ튂': '앱',
    '?붾㈃': '홈스크린',
    '?異붽': '추가',
    '?깆씠': '농장이',
    '?깃났': '설치',
    '?섏뿀': '되었',
    '?듬땲': '습니다',
    '?뮶': '이제',
    '?꾨즺': '완료',
    '?댁젣': '이제',
    '?ㅽ봽': '사용',
    '?쇱씤': '하신',
    '?먯꽌': '통해',
    '?ъ슜': '사용',
    '?덉뒿': '하실',
    '?덈떎': '수',
    '?뺢린': '브라우저',
    '?곸쑝': '에서',
    '?곗씠': '데이터',
    '?諛깆뾽': '복구',
    '?댁＜': '해주',
    '?몄슂': '세요',
    '?뮕': '또한',
    '?덉쟾': '이전',
    '?怨녹': '백업',
    '?蹂닿': '보관',
    '?섏꽭': '하세요',
    '?뙮': '이제',
    '?깆씠': '농장이',
    '?붾㈃': '홈스크린',
    '?異붽': '추가',
    '?⑸땲': '되었습니다',
    '?뮶': '이제',
    '?꾨즺': '완료',
    '?댁젣': '이제',
    '?ㅽ봽': '사용',
    '?쇱씤': '하신',
    '?먯꽌': '통해',
    '?ъ슜': '사용',
    '?덉뒿': '하실',
    '?덈떎': '수',
    '?뺢린': '브라우저',
    '?곸쑝': '에서',
    '?곗씠': '데이터',
    '?諛깆뾽': '복구',
    '?댁＜': '해주',
    '?몄슂': '세요',
    '?뮕': '또한',
    '?덉쟾': '이전',
    '?怨녹': '백업',
    '?蹂닿': '보관',
    '?섏꽭': '하세요'
};

// 파일을 재귀적으로 처리하는 함수
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // node_modules, .git 등은 제외
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist-web') {
                processDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            // 텍스트 파일만 처리
            const ext = path.extname(item).toLowerCase();
            if (['.html', '.js', '.md', '.json', '.sql', '.txt', '.bat', '.sh'].includes(ext)) {
                processFile(fullPath);
            }
        }
    });
}

// 개별 파일 처리 함수
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 각 깨진 패턴을 올바른 한글로 교체
        Object.keys(encodingFixes).forEach(broken => {
            const fixed = encodingFixes[broken];
            if (content.includes(broken)) {
                content = content.replace(new RegExp(broken, 'g'), fixed);
                modified = true;
            }
        });
        
        // 수정된 내용이 있으면 파일 저장
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 수정됨: ${filePath}`);
        }
        
    } catch (error) {
        console.log(`❌ 오류: ${filePath} - ${error.message}`);
    }
}

// 메인 실행
console.log('🔧 한글 인코딩 수정 시작...');
processDirectory('.');
console.log('🎉 한글 인코딩 수정 완료!');
