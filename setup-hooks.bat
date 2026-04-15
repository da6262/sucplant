@echo off
echo Git hook 설치 중...
copy /Y hooks\pre-commit .git\hooks\pre-commit
echo 완료: .git\hooks\pre-commit 설치됨
pause
