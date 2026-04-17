// 간단한 정적 파일 서버 (MIME 타입 문제 해결 + 캐시 버스팅)
const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const port = 8000;

// ─────────────────────────────────────────────
// 1. js/config.js에서 버전 읽기 (HTML 요청마다 호출되어 최신 값 반영)
//    pre-commit hook 이 config.js 를 bump 한 직후에도 서버 재시작 없이
//    다음 페이지 로드부터 새 ?v= 쿼리가 주입되도록 함.
// ─────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'js', 'config.js');
const FALLBACK_VERSION = '3.2.3';

function getAppVersion() {
    try {
        const configSrc = fs.readFileSync(CONFIG_PATH, 'utf8');
        const m = configSrc.match(/_APP_VER\s*=\s*['"]([^'"]+)['"]/);
        return m ? m[1] : FALLBACK_VERSION;
    } catch (e) {
        return FALLBACK_VERSION;
    }
}

// startup 시점 버전 — 로그·README 배지 동기화용 (매 요청 재읽기는 HTML 응답 경로에서 수행)
const STARTUP_VERSION = getAppVersion();

// ─────────────────────────────────────────────
// 2. README.md 배지 자동 동기화
//    _APP_VER 바꾸고 서버 재시작하면 배지도 자동 갱신
// ─────────────────────────────────────────────
try {
    const readmePath = path.join(__dirname, 'README.md');
    const readme     = fs.readFileSync(readmePath, 'utf8');
    const synced     = readme.replace(
        /!\[버전\]\(https:\/\/img\.shields\.io\/badge\/version-[^-]+-brightgreen\)/,
        `![버전](https://img.shields.io/badge/version-${STARTUP_VERSION}-brightgreen)`
    );
    if (synced !== readme) {
        fs.writeFileSync(readmePath, synced, 'utf8');
        console.log(`📝 README.md 버전 배지 자동 동기화 → v${STARTUP_VERSION}`);
    }
} catch (e) {
    console.warn('⚠️  README.md 배지 동기화 실패:', e.message);
}

// ─────────────────────────────────────────────
// 3. HTML 응답에 ?v=VERSION 자동 주입
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
// 4. MIME 타입 매핑
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
// 5. 서버
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

            // 캐시 정책 — 로컬 파일 전체 no-cache (컴포넌트 HTML 포함)
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // HTML: 버전 주입 후 서빙 (매 요청마다 config.js 재읽기 → 최신 버전 반영)
            if (ext === '.html') {
                const html = injectVersion(data.toString('utf8'), getAppVersion());
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
    console.log(`🌱 앱 버전: v${STARTUP_VERSION} (HTML 요청마다 config.js 재읽기)`);
    console.log('📁 정적 파일 서빙 + 캐시 버스팅 활성화');
});
