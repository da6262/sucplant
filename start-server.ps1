# 경산다육식물농장 관리시스템 로컬 서버 시작 (PowerShell)
Write-Host "🚀 경산다육식물농장 관리시스템 로컬 서버 시작..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 서버 주소: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 중지하려면 Ctrl+C를 누르세요" -ForegroundColor Yellow
Write-Host ""

# Python이 설치되어 있는지 확인
try {
    python --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python으로 서버 시작..." -ForegroundColor Green
        python -m http.server 8000
        exit
    }
} catch {
    # Python이 없음
}

# Node.js가 설치되어 있는지 확인
try {
    node --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js로 서버 시작..." -ForegroundColor Green
        npx http-server -p 8000 -c-1
        exit
    }
} catch {
    # Node.js가 없음
}

# PHP가 설치되어 있는지 확인
try {
    php --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PHP로 서버 시작..." -ForegroundColor Green
        php -S localhost:8000
        exit
    }
} catch {
    # PHP가 없음
}

Write-Host "❌ Python, Node.js, PHP 중 하나를 설치해주세요." -ForegroundColor Red
Write-Host ""
Write-Host "💡 설치 방법:" -ForegroundColor Yellow
Write-Host "   - Python: https://python.org" -ForegroundColor White
Write-Host "   - Node.js: https://nodejs.org" -ForegroundColor White
Write-Host "   - PHP: https://php.net" -ForegroundColor White
Write-Host ""
Read-Host "아무 키나 누르면 종료됩니다"
