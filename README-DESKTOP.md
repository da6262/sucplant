# 경산다육식물농장 관리시스템 v1.0

> 🌱 **White Platter 전문 데스크톱 애플리케이션**  
> 국내 최초 White Platter 생산 농장을 위한 전문 관리 도구

![버전](https://img.shields.io/badge/version-1.0.0-green)
![플랫폼](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![라이선스](https://img.shields.io/badge/license-MIT-blue)

## 🎯 **프로그램 특징**

### ✨ **완전 오프라인**
- 🔒 **인터넷 불필요**: 모든 기능이 오프라인에서 작동
- 💾 **로컬 데이터베이스**: SQLite 기반 안전한 데이터 저장
- 🛡️ **완전 보안**: 외부 서버 연결 없음, 데이터 유출 불가능

### 🚀 **전문 기능**
- 📋 **주문관리**: White Platter 주문 전문 처리
- 👥 **고객관리**: VIP 등급제 및 단골 고객 관리
- 🌱 **상품관리**: 희귀 다육식물 재고 관리
- ⏰ **대기자관리**: 희귀종 대기자 우선순위 시스템
- 📦 **배송관리**: 피킹&포장 리스트 자동 생성

### ⚡ **사용자 경험**
- 🎨 **모던 UI**: Tailwind CSS 기반 깔끔한 디자인
- ⌨️ **풍부한 단축키**: 키보드만으로 모든 작업 가능
- 💾 **자동 저장**: 30초마다 자동 백업
- 🔄 **드래그 앤 드롭**: 파일을 끌어다 놓기만 하면 데이터 가져오기

## 📥 **설치 방법**

### **Windows**
```bash
# 1. 설치 스크립트 실행
install.bat

# 2. 또는 수동 설치
npm install
npm run build-win
```

### **macOS**
```bash
# 1. 설치 스크립트 실행
chmod +x install.sh
./install.sh

# 2. 또는 수동 설치
npm install
npm run build-mac
```

### **Linux**
```bash
# 1. 설치 스크립트 실행
chmod +x install.sh
./install.sh

# 2. 또는 수동 설치
npm install
npm run build-linux
```

## 🚀 **실행 방법**

### **개발 모드 (권장)**
```bash
npm start
```

### **빌드된 실행 파일**
- **Windows**: `dist/경산다육식물농장 관리시스템 Setup.exe`
- **macOS**: `dist/경산다육식물농장 관리시스템.dmg`
- **Linux**: `dist/경산다육식물농장 관리시스템.AppImage`

## 🎮 **사용법**

### **메인 기능**
| 기능 | 단축키 | 설명 |
|------|--------|------|
| **주문관리** | `Ctrl+1` | 주문 등록, 수정, 상태 변경 |
| **고객관리** | `Ctrl+2` | 고객 정보, 등급 관리 |
| **상품관리** | `Ctrl+3` | White Platter 재고 관리 |
| **대기자관리** | `Ctrl+4` | 희귀종 대기자 목록 |
| **배송관리** | `Ctrl+5` | 피킹&포장 리스트 |

### **데이터 관리**
| 기능 | 단축키 | 설명 |
|------|--------|------|
| **백업** | `Ctrl+B` | 전체 데이터 백업 |
| **가져오기** | `Ctrl+I` | 백업 파일에서 복원 |
| **저장** | `Ctrl+S` | 수동 저장 (자동저장 지원) |
| **새 항목** | `Ctrl+N` | 현재 탭에서 새 항목 생성 |

### **편의 기능**
| 기능 | 단축키 | 설명 |
|------|--------|------|
| **검색** | `Ctrl+F` | 현재 탭에서 검색창 포커스 |
| **새로고침** | `F5` | 현재 탭 새로고침 |
| **출력** | `Ctrl+P` | 피킹/포장 리스트 출력 |
| **도움말** | `F1` | 사용법 및 단축키 안내 |
| **전체화면** | `F11` | 전체화면 토글 |

## 📊 **핵심 기능 상세**

### 🌱 **White Platter 전문 관리**
```
💎 희귀종 관리
├── White Platter (대/중/소) 사이즈별 관리
├── 재고 부족 알림 (5개 이하)
└── 가격 변동 추적

🏆 VIP 고객 시스템  
├── 자동 등급 계산 (구매액/횟수/최근도)
├── 등급별 할인 적용
└── 단골 고객 우대 서비스

📦 전문 배송 시스템
├── 사이즈별 색상 구분 (SX빨강/L파랑/M초록/S노랑)
├── 체크박스 기반 피킹 리스트
└── 로젠택배 연동 포장 라벨
```

### 💾 **데이터 관리**
```
🗄️ SQLite 데이터베이스
├── 자동 백업 (30초마다)
├── 수동 백업 (Ctrl+B)
└── 드래그 앤 드롭 복원

🔄 데이터 이주
├── 웹 버전에서 데이터 가져오기
├── Excel 파일 가져오기/내보내기
└── JSON 형태 백업 파일 지원
```

## 🛠️ **기술 스택**

- **Framework**: Electron 27.0+
- **Database**: SQLite 3.0+
- **UI**: HTML5 + Tailwind CSS
- **Icons**: Font Awesome 6.0+
- **Build**: electron-builder

## 📁 **프로젝트 구조**

```
경산다육식물농장-관리시스템/
├── 📄 main.js                 # Electron package.json   메인 프로세스
├── 📄          # 패키지 설정
├── 📁 js/
│   ├── 📄 app.js              # 메인 애플리케이션 로직
│   ├── 📄 desktop-integration.js  # 데스크톱 통합 기능
│   └── 📄 database.js         # SQLite 데이터베이스 관리
├── 📁 assets/
│   ├── 📄 icon.ico            # Windows 아이콘
│   ├── 📄 icon.icns           # macOS 아이콘
│   └── 📄 icon.png            # Linux 아이콘
├── 📄 index-desktop.html      # 데스크톱용 HTML
├── 📄 install.bat             # Windows 설치 스크립트
├── 📄 install.sh              # macOS/Linux 설치 스크립트
└── 📁 dist/                   # 빌드 결과물
```

## 🌟 **웹 버전과 차이점**

| 특징 | 웹 버전 | 데스크톱 버전 |
|------|---------|--------------|
| **연결** | 인터넷 필요 | 완전 오프라인 |
| **데이터** | 클라우드 서버 | 로컬 SQLite |
| **보안** | API 키 필요 | 외부 연결 없음 |
| **속도** | 네트워크 의존 | 즉시 실행 |
| **백업** | 서버 자동 백업 | 수동/자동 로컬 백업 |
| **접근** | 모든 기기 | 설치된 컴퓨터만 |

## 🔧 **문제 해결**

### **설치 오류**
```bash
# Node.js 버전 확인
node --version  # v16.0 이상 필요

# 캐시 정리 후 재설치
npm cache clean --force
npm install
```

### **실행 오류**
```bash
# 개발 모드로 디버깅
npm start

# 로그 파일 확인 (Windows)
%APPDATA%/gyeongsan-succulent-farm/logs/

# 로그 파일 확인 (macOS)
~/Library/Logs/gyeongsan-succulent-farm/
```

### **데이터 복구**
1. **자동 백업 활용**: 앱이 30초마다 자동 백업
2. **수동 백업**: `Ctrl+B`로 수동 백업 생성
3. **SQLite 복구**: `js/database.js`의 복구 기능 활용

## 📞 **지원**

### **사용 문의**
- 📧 이메일: support@gyeongsan-farm.com
- 📱 전화: 농장 직통 번호
- 🌐 홈페이지: 경산다육식물농장

### **기술 지원**
- 🔧 버그 리포트: GitHub Issues
- 💡 기능 제안: GitHub Discussions
- 📖 매뉴얼: 앱 내 F1 도움말

## 📄 **라이선스**

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🎉 **감사의 말**

**경산다육식물농장**의 White Platter 전문 관리를 위해 개발된 이 시스템이 농장 운영에 도움이 되기를 바랍니다.

국내 최초 White Platter 품종 도입의 선구자인 부대장님의 전문성과 결합하여, 더욱 체계적이고 효율적인 농장 관리를 실현하세요! 🌱✨

---

> 🌿 **"작은 다육식물에서 시작된 꿈이 디지털 혁신으로 이어집니다"**  
> **경산다육식물농장 관리시스템 v1.0** 🏆