# 🚀 로컬 서버 사용 가이드

## 📋 개요
경산다육식물농장 관리시스템을 **localhost:8000**에서 실행하는 방법을 안내합니다.

## 🎯 왜 localhost:8000을 사용하나요?

### ❌ file:// 프로토콜의 문제점
- CORS (Cross-Origin Resource Sharing) 제한
- Service Worker 지원 안됨
- PWA 기능 사용 불가
- API 호출 제한

### ✅ localhost:8000의 장점
- CORS 문제 해결
- Service Worker 완전 지원
- PWA 기능 정상 작동
- API 호출 자유롭게 가능
- 개발 환경 표준

## 🛠️ 서버 시작 방법

### 방법 1: 배치 파일 사용 (Windows)
```bash
# 프로젝트 폴더에서 실행
start-server.bat
```

### 방법 2: 셸 스크립트 사용 (Mac/Linux)
```bash
# 프로젝트 폴더에서 실행
chmod +x start-server.sh
./start-server.sh
```

### 방법 3: 수동 실행

#### Python이 설치된 경우
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Node.js가 설치된 경우
```bash
# http-server 패키지 설치 (최초 1회)
npm install -g http-server

# 서버 시작
http-server -p 8000 -c-1
```

#### PHP가 설치된 경우
```bash
php -S localhost:8000
```

## 🌐 접속 방법

서버가 시작되면 다음 주소로 접속하세요:

**메인 시스템**: http://localhost:8000/index.html
**데스크톱 버전**: http://localhost:8000/index-desktop.html

## 🔧 API 설정

시스템이 자동으로 localhost:8000을 감지하고 API URL을 설정합니다:

```javascript
// 자동 설정되는 API URL
http://localhost:8000/tables/customers
http://localhost:8000/tables/orders
http://localhost:8000/tables/products
```

## 📱 모바일 테스트

같은 네트워크의 모바일 기기에서 테스트하려면:

1. 컴퓨터의 IP 주소 확인
2. 모바일에서 `http://[컴퓨터IP]:8000` 접속

### IP 주소 확인 방법
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

## 🚨 문제 해결

### 포트 8000이 이미 사용 중인 경우
다른 포트를 사용하세요:
```bash
# 포트 3000 사용
python -m http.server 3000
```

그리고 브라우저에서 `http://localhost:3000`으로 접속

### CORS 오류가 발생하는 경우
- file:// 프로토콜 대신 localhost를 사용하고 있는지 확인
- 서버가 정상적으로 실행되고 있는지 확인

### API 연결이 안 되는 경우
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 콘솔에서 API URL이 올바르게 설정되었는지 확인

## 📝 개발 팁

1. **항상 localhost:8000 사용**: file:// 프로토콜은 피하세요
2. **서버 재시작**: 코드 변경 후 서버를 재시작하세요
3. **브라우저 캐시**: 개발 중에는 브라우저 캐시를 비활성화하세요
4. **모바일 테스트**: 실제 모바일 기기에서 테스트하세요

## 🎉 완료!

이제 경산다육식물농장 관리시스템을 localhost:8000에서 완벽하게 실행할 수 있습니다!


