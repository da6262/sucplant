@echo off
echo 🚀 경산다육식물농장 관리시스템 로컬 서버 시작...
echo.
echo 📍 서버 주소: http://localhost:8000
echo 📍 중지하려면 Ctrl+C를 누르세요
echo.

REM Node.js 우선 — server.js 가 버전 주입·MIME 처리·README 동기화 수행
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js로 서버 시작 (버전 주입·MIME·README 동기화)...
    node server.js
    goto :end
)

REM Node.js 없을 때만 Python 폴백 (?v= 주입 없음 주의)
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Node.js 없음 — Python 폴백 (버전 주입·캐시 버스팅 미동작)
    python -m http.server 8000
    goto :end
)

REM 최후 폴백 PHP
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Node.js/Python 없음 — PHP 폴백
    php -S localhost:8000
    goto :end
)

echo ❌ Node.js, Python, PHP 중 하나를 설치해주세요.
echo.
echo 💡 권장: Node.js (커스텀 server.js 기능 전체 동작)
echo    - Node.js: https://nodejs.org
echo    - Python:  https://python.org
echo    - PHP:     https://php.net
echo.
pause

:end
