# 경산다육식물농장 관리시스템

![버전](https://img.shields.io/badge/version-3.2.10-brightgreen)
![기술](https://img.shields.io/badge/stack-Vanilla%20JS%20%2B%20Supabase-blue)

White Platter 전문 농장의 주문·재고·고객 통합 관리 웹앱입니다.

---

## 최근 변경사항 (v3.2.11)

| 항목 | 내용 |
|------|------|
| 고객관리 등급관리 버튼 버그 수정 | 탭 재방문 시 등급관리 버튼 먹통 현상 수정 (cleanup 후 이벤트 리스너 미재연결 문제) |

## 변경사항 (v3.2.10)

| 항목 | 내용 |
|------|------|
| 버전 자동 증가 git hook | 커밋마다 패치 버전 자동 +1, setup-hooks.bat/sh로 설치 |

## 변경사항 (v3.2.7)

| 항목 | 내용 |
|------|------|
| 표시 수 선택 추가 | 주문/상품/고객/대기자 관리 하단바에 10·20·50·전체 표시 수 선택 셀렉터 추가 |

## 변경사항 (v3.2.6)

| 항목 | 내용 |
|------|------|
| 고객 목록 주문 추가 버튼 | 고객 목록 관리 컬럼에 장바구니 버튼 추가, 클릭 시 해당 고객 정보로 주문 모달 바로 열림 |

## 변경사항 (v3.2.5)

| 항목 | 내용 |
|------|------|
| 고객 삭제 모달 개선 | 주문 목록을 체크박스로 표시, 선택 주문만 삭제 / 주문+고객 모두 삭제 / 취소 3가지 옵션 제공 |
| 대기자 관리 업데이트 | 대기자 UI 및 컴포넌트 개선 |

## 변경사항 (v3.2.4)

| 항목 | 내용 |
|------|------|
| 고객 등록 모달 개선 | 필수정보 / 주소 / 추가정보 3섹션 구성, 상태 토글 버튼(활성·비활성·정지), 메모 글자수 카운터, 오늘 날짜 버튼, Ctrl+Enter 저장 |
| 버튼 텍스트 변경 | "새 고객" → "고객 등록" |
| 등급 관리 이동 | 고객관리 화면의 등급 관리 버튼 클릭 시 환경설정 탭으로 이동 |
| 전화번호 색상 통일 | 고객 목록에서 전화번호 색상을 이름과 동일하게 통일 |
| 한글 검색 버그 수정 | IME 조합 중 검색이 안 되던 문제 수정 (`compositionend` 이벤트 추가) |
| 고객 삭제 개선 | 주문이 있는 고객 삭제 시 주문도 함께 삭제하는 확인 다이얼로그 제공 |
| Supabase RLS 수정 | 미인증 상태에서 기본 카테고리/상품 생성 시도 방지 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 언어 | Vanilla JavaScript (ES Modules) |
| 스타일 | Tailwind CSS (CDN) + `styles/index-inline.css` |
| 차트 | Chart.js |
| DB | Supabase (PostgreSQL) |
| 서버 | Node.js 내장 HTTP 서버 (`server.js`) |

---

## 실행 방법

```bash
# Windows
start-server.bat

# macOS / Linux
bash start-server.sh
```

브라우저에서 **http://localhost:8000** 접속

> 개발용 로그인: `admin` / `admin123`

---

## 폴더 구조

```
sucplant/
├── index.html                        # 메인 진입점
├── main.js                           # ES 모듈 진입점 (features/* import)
├── server.js                         # Node.js 정적 파일 서버
├── start-server.bat                  # Windows 실행 스크립트
│
├── js/
│   ├── app.js                        # OrderManagementSystem 클래스 (핵심 오케스트레이터)
│   └── supabase-production-config.js # Supabase 연결 설정
│
├── features/                         # 기능 모듈 (ES Modules)
│   ├── customers/                    # 고객 관리 (CRM, 등급)
│   │   ├── customerData.js
│   │   └── customerUI.js
│   ├── orders/                       # 주문 관리
│   │   ├── orderData.js
│   │   ├── orderUI.js
│   │   ├── orderForm.js
│   │   └── orderFormMinimalLayout.js
│   ├── products/                     # 상품 관리
│   ├── categories/                   # 카테고리 관리
│   ├── shipping/                     # 배송 관리
│   ├── dashboard/                    # 대시보드 데이터
│   ├── waitlist/                     # 대기자 관리 UI
│   └── settings/                    # 환경설정
│
├── components/                       # 탭별 HTML 컴포넌트 (동적 로드)
│   ├── dashboard/
│   ├── order-management/
│   ├── customer-management/
│   ├── product-management/
│   ├── waitlist-management/
│   ├── shipping-management/
│   └── settings/
│
├── utils/
│   └── formatters.js                 # 공통 데이터 포매터 (단일 진실 공급원)
│
└── styles/
    └── index-inline.css              # 디자인 토큰 + 공통 컴포넌트 CSS
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 | 매출 차트, 주문·고객·상품 통계 카드 |
| 주문관리 | 주문 CRUD, 상태 변경, 정렬/필터 |
| 고객관리 | CRM 패널, 등급 관리, 구매 이력, 주문 포함 고객 삭제 |
| 상품관리 | 상품 CRUD, 썸네일, 카테고리·재고 관리 |
| 대기자관리 | 품절 상품 대기 등록, 상태 추적 |
| 배송관리 | 배송 상태 추적 |
| 환경설정 | 시스템 설정, 판매채널 관리 |

---

## 데이터베이스 (Supabase)

`js/supabase-production-config.js` 에 프로젝트 URL과 anon key 설정

```js
const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
```

**주요 테이블**

| 테이블 | 설명 |
|--------|------|
| `farm_customers` | 고객 정보 |
| `farm_orders` | 주문 내역 |
| `farm_products` | 상품 목록 |
| `farm_categories` | 카테고리 |
| `farm_waitlist` | 대기자 목록 |

> 전역 접근: `window.supabaseClient`

---

## 아키텍처

### 탭 전환 흐름

```
사용자 클릭
  → window.switchTab(tabId)
  → loadTabComponent(tabId)     // HTML fetch & DOM 삽입
  → 각 feature 초기화 함수 호출
```

### 전역 등록 규칙

- `features/*` 함수 → `window.*` 전역 등록 (HTML에서 직접 호출)
- `OrderManagementSystem` 메서드 → `window.orderSystem.메서드()` 로 호출
- 공통 포매터 → `window.fmt.date()`, `window.fmt.currency()` 등

---

## 개발 가이드

### CSS 변수 시스템 (`styles/index-inline.css`)

모든 색상·여백·그림자는 반드시 `var()` 사용 — 하드코딩 금지

```css
:root {
  /* 색상 */
  --primary:              #16A34A;   /* 주 색상 (녹색) */
  --primary-hover:        #15803D;
  --primary-accent:       #059669;
  --danger:               #DC2626;   /* 경고/삭제 */
  --info:                 #2563EB;   /* 정보/링크 */

  /* 배경 */
  --bg-page:              #F1F5F9;   /* 페이지 배경 */
  --bg-light:             #F9FAFB;
  --bg-lighter:           #F8FAFC;   /* 테이블 헤더 배경 */

  /* 텍스트 */
  --text-heading:         #111827;
  --text-body:            #374151;
  --border:               #E2E8F0;

  /* 형태 */
  --radius-sm: 4px;  --radius-md: 6px;
  --radius-lg: 8px;  --radius-xl: 12px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.18);

  /* 폰트 */
  --font-sans: 'Noto Sans KR', 'Inter', -apple-system, sans-serif;
}
```

### 공통 클래스

| 클래스 | 용도 |
|--------|------|
| `.page-header` | 각 탭 상단 제목 영역 |
| `.filter-bar` | 검색·필터 입력 묶음 (높이 30px) |
| `.btn-group` | 액션 버튼 묶음 (gap: 8px, center 정렬) |
| `.btn-icon` | 30×30px 아이콘 버튼 |
| `.btn-xs` | 소형 버튼 (padding: 3px 10px) |
| `.text-numeric` | 숫자 데이터 (tabular-nums, bold) |
| `.badge-*` | 상태 배지 |
| `.crm-panel` | 고객 상세 슬라이드 패널 |
| `.th-sortable` | 정렬 가능 테이블 헤더 |
| `.td-null` | 빈 값 표시 (—) |

### 테이블 정렬 기준

| 컬럼 유형 | 정렬 |
|-----------|------|
| 텍스트 (이름, 상품명 등) | `text-left` |
| 숫자 (가격, 수량) | `text-right text-numeric` |
| 배지, 버튼, 상태 | `text-center` |

### 공통 포매터 (`utils/formatters.js`)

모든 데이터 포매팅은 반드시 이 파일을 경유 — `toLocaleString()` 직접 사용 금지

```js
// ES 모듈 import (features/*.js)
import { formatDate, formatCurrency, formatPhone } from '../../utils/formatters.js';

formatDate(value)       // '2024-01-15'
formatDateTime(value)   // '2024-01-15 09:30'
formatCurrency(amount)  // '₩12,345'
formatWon(amount)       // '12,345원'
formatPhone(number)     // '010-1234-5678'
formatQty(count)        // '3개'
nullDash(value)         // <span class="td-null">—</span>

// 전역 접근 (components/*.js 클래스 내부)
window.fmt.date(value)
window.fmt.currency(amount)
window.fmt.phone(number)
window.fmt.qty(count)
window.fmt.nullDash(value)
```

---

## 버전 관리

**커밋할 때마다 버전이 자동으로 올라갑니다. 아무것도 수동으로 바꿀 필요 없습니다.**

```
git commit 발생
      │
      ├── hooks/pre-commit → js/config.js 패치 버전 자동 +1
      ├── server.js 시작 시 → README.md 배지 자동 동기화
      ├── 네비게이션바 배지 → window.APP_VERSION 자동 반영
      └── 로컬 JS/CSS 경로 → ?v=X.X.X 캐시 버스팅 자동 삽입
```

| 파일 | 역할 |
|------|------|
| `js/config.js` | 버전 단일 저장소 (`_APP_VER`) |
| `hooks/pre-commit` | 커밋 시 패치 버전 자동 증가 |
| `server.js` | 서버 시작 시 README 배지 자동 동기화 + JS/CSS 캐시 버스팅 |

### 처음 클론 후 hook 설치 (최초 1회만)

```bash
# Windows
setup-hooks.bat

# macOS / Linux
bash setup-hooks.sh
```

설치 후에는 `git commit` 할 때마다 버전이 자동으로 올라갑니다.

---

## GitHub

**https://github.com/da6262/sucplant**

```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```
