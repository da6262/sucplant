@echo off
echo Tailwind CSS 빌드 시작...

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js가 설치되어 있지 않습니다. Node.js를 설치한 후 다시 시도하세요.
    pause
    exit /b 1
)

REM npm이 설치되어 있는지 확인
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm이 설치되어 있지 않습니다. npm을 설치한 후 다시 시도하세요.
    pause
    exit /b 1
)

REM Tailwind CSS 패키지 설치
echo Tailwind CSS 패키지 설치 중...
npm install -D tailwindcss postcss autoprefixer

REM Tailwind CSS 빌드
echo Tailwind CSS 빌드 중...
npx tailwindcss -i ./src/input.css -o ./dist/tailwind.css --minify

if %errorlevel% equ 0 (
    echo ✅ Tailwind CSS 빌드 완료: dist/tailwind.css
    echo 이제 HTML 파일에서 CDN 대신 로컬 CSS 파일을 사용할 수 있습니다.
) else (
    echo ❌ Tailwind CSS 빌드 실패
)

pause


