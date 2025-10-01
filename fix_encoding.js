const fs = require('fs');

// 파일 읽기
let content = fs.readFileSync('index.html', 'utf8');

// 깨진 한글을 올바른 한글로 교체
content = content.replace(/寃쎌궛\?ㅼ쑁\?앸Ъ\?띿옣/g, '경산다육식물농장');
content = content.replace(/愿由ъ떆\?ㅽ뀥/g, '관리시스템');

// 파일 저장
fs.writeFileSync('index.html', content, 'utf8');

console.log('한글 수정 완료!');
