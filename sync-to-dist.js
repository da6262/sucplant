#!/usr/bin/env node
/**
 * sync-to-dist.js — 소스 → dist/ 화이트리스트 기반 동기화
 *
 * Firebase Hosting public 경로(`dist/`)를 소스에서 자동 재구성.
 * ALLOW 리스트에 명시된 항목만 복사 — 언급 없는 파일은 절대 포함되지 않음.
 *
 *   npm run sync
 *
 * 왜 화이트리스트인가:
 *   블랙리스트(빼먹기 쉬움)는 server.js / *.bat / .env 실수 유출 위험.
 *   화이트리스트는 "깜빡해서 추가 안 됨" = 파일 누락(안전),
 *                  "깜빡해서 제외 안 됨" 자체가 불가능.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ─────────────────────────────────────────────
// 화이트리스트 — 여기 있는 것만 웹에 배포됨
// 새 파일 추가 시 이 리스트에 명시해야 dist 로 반영됨
// ─────────────────────────────────────────────
const ALLOW_FILES = [
    'index.html',
    'main.js',
    'manifest.json',
    'sw.js',
    'offline-fallback.html',
    'favicon.ico',
];

const ALLOW_DIRS = [
    'components',
    'features',
    'js',
    'utils',
    'styles',
    'icons',
    'libs',
    'assets',
    'services',
    'config',
];

// ─────────────────────────────────────────────
// 복사 유틸
// ─────────────────────────────────────────────
function copyFileSafe(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

function copyDirRecursive(srcDir, destDir) {
    let count = 0;
    if (!fs.existsSync(srcDir)) return count;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const src  = path.join(srcDir,  entry.name);
        const dest = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            count += copyDirRecursive(src, dest);
        } else if (entry.isFile()) {
            copyFileSafe(src, dest);
            count++;
        }
    }
    return count;
}

function rmDistSafe() {
    if (!fs.existsSync(DIST)) return;
    // 보호: DIST 가 정확히 <root>/dist 인지 검증 (절대 외부 경로 삭제 금지)
    const resolved = path.resolve(DIST);
    const rootRes  = path.resolve(ROOT);
    if (!resolved.startsWith(rootRes + path.sep) || path.basename(resolved) !== 'dist') {
        throw new Error(`SAFETY: DIST path suspicious, refusing to rm: ${resolved}`);
    }
    fs.rmSync(DIST, { recursive: true, force: true });
}

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
function main() {
    const t0 = Date.now();
    console.log('🧹 dist/ 초기화');
    rmDistSafe();
    fs.mkdirSync(DIST, { recursive: true });

    let totalFiles = 0;

    console.log('📄 단일 파일 복사');
    for (const name of ALLOW_FILES) {
        const src  = path.join(ROOT, name);
        const dest = path.join(DIST, name);
        if (!fs.existsSync(src)) {
            console.warn(`  ⚠️  누락: ${name} (소스에 없음, 건너뜀)`);
            continue;
        }
        copyFileSafe(src, dest);
        console.log(`  ✅ ${name}`);
        totalFiles++;
    }

    console.log('📁 디렉토리 복사');
    for (const dir of ALLOW_DIRS) {
        const srcDir  = path.join(ROOT, dir);
        const destDir = path.join(DIST, dir);
        if (!fs.existsSync(srcDir)) {
            console.log(`  ⏭  ${dir}/ (소스에 없음, 건너뜀)`);
            continue;
        }
        const n = copyDirRecursive(srcDir, destDir);
        console.log(`  ✅ ${dir}/ (${n} 파일)`);
        totalFiles += n;
    }

    const ms = Date.now() - t0;
    console.log(`\n✨ 동기화 완료: ${totalFiles} 파일, ${ms}ms`);
    console.log(`   다음 단계: npm run check → npm run deploy`);
}

main();
