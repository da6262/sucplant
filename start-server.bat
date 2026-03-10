@echo off
echo 🚀 경산다육식물농장 관리시스템 로컬 서버 시작...
echo.
echo 📍 서버 주소: http://localhost:8000
echo 📍 중지하려면 Ctrl+C를 누르세요
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python으로 서버 시작...
    python -m http.server 8000
    goto :end
)

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js로 서버 시작 (MIME 타입 문제 해결)...
    node server.js
    goto :end
)

REM PHP가 설치되어 있는지 확인
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP로 서버 시작...
    php -S localhost:8000
    goto :end
)

echo ❌ Python, Node.js, PHP 중 하나를 설치해주세요.
echo.
echo 💡 설치 방법:
echo    - Python: https://python.org
echo    - Node.js: https://nodejs.org
echo    - PHP: https://php.net
echo.
pause

:end


