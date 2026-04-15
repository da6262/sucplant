// 간단한 정적 파일 서버 (MIME 타입 문제 해결 + 캐시 버스팅)
const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const port = 8000;

// ─────────────────────────────────────────────
// 1. js/config.js에서 버전 한 번만 읽기
// ─────────────────────────────────────────────
let APP_VERSION = '3.2.3'; // 파일 읽기 실패 시 폴백
try {
    const configSrc = fs.readFileSync(path.join(__dirname, 'js', 'config.js'), 'utf8');
    const m = configSrc.match(/_APP_VER\s*=\s*['"]([^'"]+)['"]/);
    if (m) APP_VERSION = m[1];
} catch (e) {
    console.warn('⚠️  config.js 읽기 실패 — 폴백 버전 사용:', APP_VERSION);
}

// ─────────────────────────────────────────────
// 2. HTML 응답에 ?v=VERSION 자동 주입
//    로컬 .js / .css 파일 경로에만 적용
//    CDN(https://, //) 은 건드리지 않음
// ─────────────────────────────────────────────
function injectVersion(htmlContent, version) {
    return htmlContent.replace(
        /((?:src|href)=")(?!https?:\/\/|\/\/|data:|#|mailto:)([^"]+\.(?:js|css))"/g,
        (_, prefix, filePath) => {
            const clean = filePath.split('?')[0]; // 기존 ?v= 제거
            return `${prefix}${clean}?v=${version}"`;
        }
    );
}

// ─────────────────────────────────────────────
// MIME 타입 매핑
// ─────────────────────────────────────────────
const mimeTypes = {
    '.html' : 'text/html; charset=utf-8',
    '.js'   : 'application/javascript',
    '.css'  : 'text/css',
    '.json' : 'application/json',
    '.png'  : 'image/png',
    '.jpg'  : 'image/jpeg',
    '.gif'  : 'image/gif',
    '.svg'  : 'image/svg+xml',
    '.ico'  : 'image/x-icon',
    '.woff' : 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf'  : 'font/ttf',
    '.eot'  : 'application/vnd.ms-fontobject'
};

// ─────────────────────────────────────────────
// 3. 서버
// ─────────────────────────────────────────────
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    if (pathname === '/') pathname = '/index.html';

    const filePath = path.join(__dirname, pathname);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
                return;
            }

            const ext      = path.extname(filePath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            // CORS
            res.setHeader('Access-Control-Allow-Origin',  '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // 캐시 정책
            if (ext === '.js' || ext === '.css') {
                res.setHeader('Cache-Control', 'no-cache');
            }

            // HTML: 버전 주입 후 서빙
            if (ext === '.html') {
                const html = injectVersion(data.toString('utf8'), APP_VERSION);
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(html, 'utf8');
            } else {
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(data);
            }
        });
    });
});

server.listen(port, () => {
    console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다`);
    console.log(`🌱 앱 버전: v${APP_VERSION}`);
    console.log('📁 정적 파일 서빙 + 캐시 버스팅 활성화');
});
