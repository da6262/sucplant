#!/bin/sh
echo "Git hook 설치 중..."
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "완료: .git/hooks/pre-commit 설치됨"
