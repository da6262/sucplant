#!/bin/bash

echo "🚀 경산다육식물농장 관리시스템 로컬 서버 시작..."
echo ""
echo "📍 서버 주소: http://localhost:8000"
echo "📍 중지하려면 Ctrl+C를 누르세요"
echo ""

# Python이 설치되어 있는지 확인
if command -v python3 &> /dev/null; then
    echo "✅ Python3으로 서버 시작..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python으로 서버 시작..."
    python -m http.server 8000
# Node.js가 설치되어 있는지 확인
elif command -v node &> /dev/null; then
    echo "✅ Node.js로 서버 시작..."
    npx http-server -p 8000 -c-1
# PHP가 설치되어 있는지 확인
elif command -v php &> /dev/null; then
    echo "✅ PHP로 서버 시작..."
    php -S localhost:8000
else
    echo "❌ Python, Node.js, PHP 중 하나를 설치해주세요."
    echo ""
    echo "💡 설치 방법:"
    echo "   - Python: https://python.org"
    echo "   - Node.js: https://nodejs.org"
    echo "   - PHP: https://php.net"
    echo ""
    read -p "계속하려면 Enter를 누르세요..."
fi


