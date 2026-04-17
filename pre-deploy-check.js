#!/usr/bin/env node
/**
 * pre-deploy-check.js — 배포 직전 dist/ 안전성 검증
 *
 * dist/ 를 전수 스캔해 "프로덕션에 절대 들어가면 안 되는 패턴" 을 탐지.
 * 하나라도 걸리면 exit 1 — npm run deploy 가 중단됨.
 *
 *   npm run check
 *
 * 이 검증은 sync-to-dist.js 화이트리스트를 통과한 파일 중에서도
 * 혹시 ALLOW 리스트 자체가 잘못 수정됐거나, 화이트리스트로 들어온
 * 디렉토리 안에 비밀/개발 파일이 섞여 있는 경우를 잡는 2차 방어선.
 */

const fs   = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');

// ─────────────────────────────────────────────
// 금지 패턴 — 파일명 / 경로
// ─────────────────────────────────────────────
const FORBIDDEN_PATHS = [
    /(^|[\/\\])server\.js$/,                     // 로컬 Node 서버
    /\.bat$/i,                                   // Windows 배치
    /\.sh$/i,                                    // Unix 쉘
    /\.ps1$/i,                                   // PowerShell
    /\.env($|\.)/i,                              // 환경변수
    /(^|[\/\\])\.git($|[\/\\])/,                 // git 메타
    /(^|[\/\\])\.claude($|[\/\\])/,              // Claude 설정
    /(^|[\/\\])node_modules($|[\/\\])/,          // npm
    /(^|[\/\\])package(-lock)?\.json$/,          // npm 메타
    /\.config\.js$/,                             // vite/postcss/tailwind
    /CLAUDE\.md$/,
    /(^|[\/\\])archive($|[\/\\])/,               // dev-tools 아카이브
    /deploy-[^\/\\]+\.js$/,                      // 배포 헬퍼
    /data-(extractor|importer)\.js$/,            // 데이터 마이그레이션
    /\.sql$/i,                                   // SQL 스키마 파일
    /(^|[\/\\])hooks($|[\/\\])/,                 // git hooks
    /(^|[\/\\])supabase($|[\/\\])/,              // supabase 로컬 설정
];

// ─────────────────────────────────────────────
// 금지 패턴 — 파일 내용 (잠재적 비밀)
// ─────────────────────────────────────────────
const FORBIDDEN_CONTENT = [
    { re: /service[_-]?role[_-]?key/i,                  desc: 'Supabase service_role 키 의심' },
    { re: /SUPABASE_SERVICE_ROLE/i,                     desc: 'service_role 환경변수명' },
    { re: /BEGIN\s+(RSA|OPENSSH|PRIVATE)\s+PRIVATE\s+KEY/i, desc: 'Private key blob' },
    { re: /-----BEGIN\s+CERTIFICATE-----/,              desc: '인증서 blob' },
    { re: /AWS_SECRET_ACCESS_KEY/i,                     desc: 'AWS 시크릿 키' },
    { re: /AKIA[0-9A-Z]{16}/,                           desc: 'AWS Access Key ID 패턴' },
];

// 내용 스캔 대상 확장자 (이미지·폰트·아이콘 제외)
const CONTENT_SCAN_EXT = new Set([
    '.html', '.js', '.mjs', '.css', '.json', '.md', '.txt', '.xml', '.svg'
]);

// ─────────────────────────────────────────────
// 재귀 워커
// ─────────────────────────────────────────────
function walk(dir, cb) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, cb);
        else if (entry.isFile())  cb(full);
    }
}

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
function main() {
    if (!fs.existsSync(DIST)) {
        console.error('❌ dist/ 없음 — npm run sync 먼저 실행');
        process.exit(1);
    }

    const violations = [];
    let scanned = 0;

    walk(DIST, (full) => {
        scanned++;
        const rel = path.relative(__dirname, full);

        // 1) 경로 패턴
        for (const re of FORBIDDEN_PATHS) {
            if (re.test(rel)) {
                violations.push({ file: rel, reason: `금지 경로 패턴: ${re}` });
                return;
            }
        }

        // 2) 내용 패턴 (텍스트 파일만)
        const ext = path.extname(full).toLowerCase();
        if (!CONTENT_SCAN_EXT.has(ext)) return;

        let content;
        try { content = fs.readFileSync(full, 'utf8'); }
        catch { return; }

        for (const { re, desc } of FORBIDDEN_CONTENT) {
            if (re.test(content)) {
                violations.push({ file: rel, reason: `비밀 의심 패턴: ${desc}` });
                break; // 파일당 1건만 보고
            }
        }
    });

    console.log(`🔍 dist/ 스캔: ${scanned} 파일`);

    if (violations.length === 0) {
        console.log('✅ 안전 — 배포 진행 가능\n');
        process.exit(0);
    }

    console.error(`\n❌ ${violations.length}건 위반 — 배포 중단\n`);
    for (const v of violations) {
        console.error(`  • ${v.file}`);
        console.error(`    └ ${v.reason}`);
    }
    console.error('\n조치:');
    console.error('  1) sync-to-dist.js ALLOW 리스트에서 해당 파일/경로 제외');
    console.error('  2) 실제로 프로덕션에 필요하면 이 스크립트의 FORBIDDEN 패턴 검토');
    process.exit(1);
}

main();
