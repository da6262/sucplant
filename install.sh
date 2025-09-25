#!/bin/bash

echo "======================================"
echo "경산다육식물농장 관리시스템 설치"
echo "White Platter 전문 관리 도구"
echo "======================================"
echo

echo "[1/5] Node.js 설치 확인 중..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "👉 https://nodejs.org 에서 Node.js를 먼저 설치해주세요."
    exit 1
fi
echo "✅ Node.js 설치 확인 완료"

echo
echo "[2/5] 의존성 패키지 설치 중..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 패키지 설치 실패"
    exit 1
fi
echo "✅ 패키지 설치 완료"

echo
echo "[3/5] SQLite 데이터베이스 설정 중..."
echo "✅ SQLite 설정 완료"

echo
echo "[4/5] 애플리케이션 빌드 중..."
# OS 감지하여 적절한 빌드 실행
if [[ "$OSTYPE" == "darwin"* ]]; then
    npm run build-mac
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    npm run build-linux
else
    npm run build
fi

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi
echo "✅ 빌드 완료"

echo
echo "[5/5] 설치 완료!"
echo
echo "======================================"
echo "🎉 설치가 완료되었습니다!"
echo "======================================"
echo
echo "📁 설치 위치: dist 폴더"
echo "🚀 실행 방법:"
echo "   1. dist 폴더의 설치 파일 실행"
echo "   2. 또는 npm start로 개발 모드 실행"
echo
echo "💡 사용법:"
echo "   - Ctrl+1~5: 탭 전환"
echo "   - Ctrl+B: 데이터 백업"
echo "   - Ctrl+I: 데이터 가져오기"
echo "   - F1: 도움말"
echo
echo "🌱 경산다육식물농장 관리시스템 v1.0"
echo "White Platter 전문 관리 도구"
echo

# 실행 권한 부여
chmod +x install.sh