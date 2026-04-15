# 경산다육식물농장 관리시스템

> White Platter 전문 농장의 주문 · 재고 · 고객을 한 화면에서 관리하는 웹 애플리케이션

[![version](https://img.shields.io/badge/version-v3.2.15-brightgreen)](https://github.com/da6262/sucplant)
[![stack](https://img.shields.io/badge/stack-Vanilla_JS_+_Supabase-blue)](#기술-스택)

---

## 주요 기능

| 탭 | 기능 |
|----|------|
| 📊 **대시보드** | 오늘 현황 요약, 실시간 주문 피드, 재고 알림, 매출 차트 |
| 👥 **고객관리** | CRM 목록, 등급 관리(씨앗·새싹·그린·골드·VIP), 주문 이력, 상담 기록 |
| 📦 **주문관리** | 주문 등록·수정·상태 변경, 피킹 리스트, 일괄 처리, SMS 발송 |
| 🌿 **상품관리** | 상품 등록·재고 관리, 카테고리 분류, 이미지 업로드 |
| ⏳ **대기자관리** | 재입고 대기 등록, 상태 추적(대기중→연락완료→주문전환), 탭 카운트 배지 |
| 🚚 **배송관리** | 배송 현황, 라벨 출력, SMS 일괄 발송 |
| ⚙️ **환경설정** | 농장 정보, 배송 설정, 알림 설정 |

---

## 기술 스택

```
Frontend  : Vanilla JS (ES Modules) + Tailwind CSS (CDN) + Chart.js
Backend   : Supabase (PostgreSQL + RLS + Realtime)
빌드 없음 : index.html 직접 실행 (번들러 불필요)
```

---

## 실행 방법

```bash
# 서버 시작 (Windows)
start-server.bat

# 또는 직접 실행
node server.js

# 브라우저 접속
http://localhost:8000
```

> Supabase 연결이 없으면 데이터 조회·저장 불가. `js/supabase-config.js` 설정 필요.

---

## 폴더 구조

```
sucplant/
├── index.html                      # 메인 진입점 (탭 라우터 포함)
├── main.js                         # ES 모듈 진입점
├── server.js                       # Node.js 정적 서버 (no-cache 헤더)
│
├── features/                       # 기능 모듈
│   ├── customers/   customerData · customerUI
│   ├── orders/      orderData · orderUI · orderForm · orderSMS
│   ├── products/    productData · productUI
│   ├── waitlist/    waitlistData · waitlistUI
│   ├── shipping/    shippingManager
│   ├── dashboard/   dashboardData · dashboardUI
│   └── settings/    settingsUI
│
├── components/                     # 동적 로드 HTML 컴포넌트
│   ├── waitlist-management/
│   ├── product-management/
│   ├── customer-management/
│   ├── order-management/
│   ├── dashboard/
│   ├── settings/
│   ├── modals/
│   └── header · navigation
│
├── js/
│   ├── app.js                      # OrderManagementSystem 오케스트레이터
│   └── supabase-config.js         # Supabase 연결 설정
│
├── utils/
│   ├── ui.js          # renderPageHeader · renderFilterBar · renderEmptyRow
│   └── formatters.js  # formatDate · formatPhone · formatCurrency
│
└── styles/
    └── index-inline.css           # 디자인 시스템 (CSS 변수 중앙 제어)
```

---

## 디자인 시스템 (v3.2.3)

모든 색상·여백·폰트 크기는 CSS 변수 하나로 제어됩니다.

```css
/* styles/index-inline.css :root */
--primary:        #16A34A;   /* 브랜드 그린 — 버튼, 활성 탭 */
--primary-hover:  #15803D;   /* hover 상태 */
--primary-accent: #059669;   /* 에메랄드 — 아이콘, 링크 */

--tbl-cell-py:    4px;       /* 테이블 행 높이 전역 제어 */
--tbl-font-size:  12px;      /* 테이블 폰트 크기 */
```

### 공통 클래스

| 분류 | 클래스 |
|------|--------|
| 버튼 | `.btn-primary` `.btn-secondary` `.btn-icon` `.btn-icon-edit` `.btn-icon-delete` |
| 배지 | `.badge` + `.badge-success` `.badge-warning` `.badge-danger` `.badge-info` `.badge-purple` `.badge-neutral` |
| 테이블 | `.table-ui` `.td-primary` `.td-secondary` `.td-amount` `.td-muted` `.td-null` |
| 필터 바 | `.filter-bar` `.input-ui` `.btn-search` |
| 상태 탭 | `.status-tab-bar` `.status-tab-btn` `.tab-count` |
| 헤더 | `.page-header` `.action-group` |

---

## 아키텍처

- **탭 라우팅**: `switchTab(tabId)` → `loadTabComponent(tabId)` → HTML `fetch()` 동적 삽입
- **전역 등록**: `features/*` 함수 → `window.*` → HTML `onclick=""` 직접 호출
- **오케스트레이터**: `window.orderSystem` (OrderManagementSystem)
- **캐시 방지**: `server.js` 전 응답에 `Cache-Control: no-cache, no-store`

---

## 데이터베이스

| 테이블 | 용도 |
|--------|------|
| `farm_customers` | 고객 정보 (등급, 메모) |
| `farm_orders` | 주문 헤더 |
| `farm_order_items` | 주문 상세 품목 |
| `farm_products` | 상품 목록 |
| `farm_categories` | 카테고리 |
| `farm_waitlist` | 대기자 목록 |
| `farm_settings` | 농장·배송·알림 설정 |

접근: `window.supabaseClient.from('테이블명')`

---

## 변경 이력

### v3.2.18 — 2026-04-15
- **CSS 특이도 문제 해결**: `table tbody td` (spec 3)이 Tailwind `py-*` (spec 10)에 밀려 `--tbl-cell-py` 변수가 적용 안 되던 근본 원인 수정
- **`.table-ui tbody td` (spec 12)**: 모든 Tailwind 단일 클래스를 이겨 CSS 변수가 최우선 제어
- **`table-ui` 클래스 누락 보완**: 고객관리·상품관리 테이블에 `table-ui` 추가
- **하드코딩 `py-1.5` 제거**: `waitlistUI.js` · `productUI.js` td 클래스에서 삭제

### v3.2.15 — 2026-04-15
- **주문 SMS 실제 발송 수정**: `sendSMS()` → `sendSolapiSMS()` 직접 호출. 기존엔 `window.solapi` SDK 없어서 콘솔 로그만 찍히던 버그 수정
- **SMS API 인증정보 환경설정 연동**: 환경설정 SMS탭에 API Key / Secret / 발신번호 필드 추가

### v3.2.14 — 2026-04-15
- **새 주문 등록 후 목록 미표시 버그**: `setTimeout(1000ms)` 경쟁 조건 → `window._pendingOrderStatus` 플래그로 교체

### v3.2.13 — 2026-04-15
- **고객관리 등급관리 버튼 먹통**: 탭 재방문 시 이벤트 리스너 재연결 안 되던 버그 수정

### v3.2.12 — 2026-04-15
- **git pre-commit hook**: 커밋마다 `js/config.js` 패치 버전 자동 +1
- **서버 버전 동기화**: `server.js` 시작 시 README 배지 버전 자동 업데이트

### v3.2.7 — 2026-04-15
- **표시 수 선택**: 고객·주문·상품·대기자 4개 탭 하단에 드롭다운(10/20/50/전체) 추가

### v3.2.5 — 2026-04-15
- **고객 삭제 모달 개선**: 삭제 시 연관 주문 목록 확인, 체크박스로 선택 삭제

### v3.2.3 — 2026-04-15
- **디자인 시스템 규격화**: 하드코딩 색상 전체 `--primary` 변수로 통일, 필터 바·테이블 행 높이 전역 CSS 변수 제어

---

## 개발 가이드

### 새 탭 추가

1. `index.html`에 `<div id="newtab-section">` 추가
2. `loadTabComponent()` switch에 `case 'newtab':` 추가
3. `components/newtab-management/newtab-management.html` 생성
4. `features/newtab/newtabUI.js` 생성 → `window.newtabUI = new NewtabUI()`

### 브랜드 색상 변경

`styles/index-inline.css` `:root` 블록의 `--primary` 값 하나만 수정하면 버튼·배지·탭 전체에 즉시 반영됩니다.

---

*경산다육식물농장 내부 전용 시스템*
