// 간단한 정적 파일 서버 (MIME 타입 문제 해결)
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8000;

// MIME 타입 매핑
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 기본 경로는 index.html로
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // 파일 경로 구성
    const filePath = path.join(__dirname, pathname);
    
    // 파일 존재 확인
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 404 에러
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        
        // 파일 읽기
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
                return;
            }
            
            // 확장자로 MIME 타입 결정
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';
            
            // CORS 헤더 추가
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // 캐시 헤더 추가 (개발용)
            if (ext === '.js' || ext === '.css') {
                res.setHeader('Cache-Control', 'no-cache');
            }
            
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

server.listen(port, () => {
    console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다`);
    console.log('📁 정적 파일 서빙 중...');
    console.log('🔧 MIME 타입 문제 해결됨');
});




