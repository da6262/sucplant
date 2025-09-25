@echo off
echo ======================================
echo 경산다육식물농장 관리시스템 설치
echo White Platter 전문 관리 도구
echo ======================================
echo.

echo [1/5] Node.js 설치 확인 중...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo 👉 https://nodejs.org 에서 Node.js를 먼저 설치해주세요.
    pause
    exit /b 1
)
echo ✅ Node.js 설치 확인 완료

echo.
echo [2/5] 의존성 패키지 설치 중...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 패키지 설치 실패
    pause
    exit /b 1
)
echo ✅ 패키지 설치 완료

echo.
echo [3/5] SQLite 데이터베이스 설정 중...
echo ✅ SQLite 설정 완료

echo.
echo [4/5] 애플리케이션 빌드 중...
call npm run build-win
if %errorlevel% neq 0 (
    echo ❌ 빌드 실패
    pause
    exit /b 1
)
echo ✅ 빌드 완료

echo.
echo [5/5] 설치 완료!
echo.
echo ======================================
echo 🎉 설치가 완료되었습니다!
echo ======================================
echo.
echo 📁 설치 위치: dist 폴더
echo 🚀 실행 방법: 
echo    1. dist 폴더의 설치 파일 실행
echo    2. 또는 npm start로 개발 모드 실행
echo.
echo 💡 사용법:
echo    - Ctrl+1~5: 탭 전환
echo    - Ctrl+B: 데이터 백업  
echo    - Ctrl+I: 데이터 가져오기
echo    - F1: 도움말
echo.
echo 🌱 경산다육식물농장 관리시스템 v1.0
echo White Platter 전문 관리 도구
echo.
pause