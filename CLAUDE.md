# 경산다육식물농장 관리시스템

## 프로젝트 개요
White Platter 전문 농장의 주문/재고/고객 관리 웹앱입니다.

## 기술 스택
- Vanilla JS (ES 모듈)
- Tailwind CSS (CDN)
- Chart.js
- Supabase (DB)

## 실행 방법
```bash
start-server.bat
```
브라우저에서 http://localhost:8000 접속

### npm 스크립트
- `npm run dev` — Vite 개발 모드
- `npm run build` — 커스텀 배포 빌드 (`deploy-to-web.js`)
- `npm run build-vite` — Vite 프로덕션 빌드
- `npm run deploy` — 빌드 후 Firebase Hosting 배포
- `npm run serve` — Python http.server (포트 8000)

### 배포/유틸 스크립트
- `deploy-to-production.js` — 프로덕션 배포 헬퍼
- `data-extractor.js`, `data-importer.js` — 데이터 마이그레이션

## 폴더 구조
- `index.html` — 메인 진입점
- `main.js` — ES 모듈 진입점, features/* 모듈 import
- `js/app.js` — OrderManagementSystem 클래스 (핵심 오케스트레이터)
- `js/` — 기능별 JS 파일
- `features/` — 기능 모듈 (customers, orders, products, categories, shipping, dashboard)
- `components/` — HTML 컴포넌트 파일 (동적 로드)
- `styles/` — CSS 파일 (`styles/index-inline.css`에 디자인 시스템 CSS 변수 집중)
- `utils/ui.js` — Standard Form Renderer (v3.4) 유틸 모음
- `js/config.js` — 앱 버전 (서버 시작 시 README 뱃지로 자동 동기화)
- `js/supabase-production-config.js` — Supabase URL/키 (env 파일 없음, 하드코딩)
- `js/admin-auth.js` — 관리자 인증 (RPC fallback)
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.firebaserc` (project: `korsucplant`)

## 모듈 규칙
- **features/** 내 각 기능은 `{Feature}Data.js` (로직) + `{Feature}UI.js` (렌더)로 분리
- 데이터 매니저 클래스 네이밍: `{Feature}DataManager` (예: `CustomerDataManager`)
- 전역 함수 등록: `window.deleteCustomer`, `window.editProduct`, `window.saveCustomer` 등
- 포맷 헬퍼: `window.fmt.date()`, `window.fmt.currency()` (레거시: `formatDate`, `formatCurrency`)

## UI/Design System Rules

### Standard Form Renderer (v3.4+)
`utils/ui.js`에서 import — 모듈 내에서 raw Tailwind 클래스 직접 작성 금지, 아래 함수 사용:
- 레이아웃: `renderPageHeader`, `renderFilterBar`, `renderEmptyRow`, `renderModal`
- 폼: `renderField`, `renderFormSection`, `renderFormGrid`, `renderFormActions`
- 뱃지/버튼: `renderBadge`, `renderOrderStatusBadge`, `renderGradeBadge`, `renderBtnIcon`, `renderBtnGroup`, `renderEditDeleteBtns`
- 기타: `renderConfirmDialog`, `renderInfoRow`, `renderSectionTitle`
- 주요 색상은 `styles/index-inline.css`의 CSS 변수 (primary: `#16A34A`)

### Data Form & Header Constitution
모든 데이터 입력 폼·리스트·상세 페이지는 아래 원칙을 100% 준수한다.

1. **12컬럼 그리드(12-column Grid)** — 모든 입력 폼은 `grid-cols-12` 기반으로 설계하며, 필드 중요도에 따라 `col-span`(또는 `renderField`의 `cols` 옵션)을 조절하여 전체 수직 정렬선을 일치시킨다.
2. **스티키 헤더(Sticky Header)** — 모든 데이터 리스트와 상세 페이지 상단 헤더는 `sticky top-0`를 적용하여 스크롤 시에도 맥락(Context)을 놓치지 않게 한다.
3. **섹션 그룹화(Section Grouping)** — 연관된 필드는 `renderFormSection()`으로 묶고, 시각적 위계(Hierarchy)가 명확한 섹션 타이틀을 반드시 포함한다.
4. **고정폭 숫자(Monospace Numbers)** — 가격, 수량, 날짜 등 정렬이 중요한 데이터는 반드시 고정폭 글꼴(Monospace, `tabular-nums` 클래스 또는 `font-variant-numeric: tabular-nums`)을 사용하여 자릿수 시인성을 확보한다.
5. **삼각 정렬 법칙(Alignment Trinity)** — 텍스트는 왼쪽(Left), 숫자는 오른쪽(Right), 상태 및 날짜는 중앙(Center) 정렬을 기본 원칙으로 삼는다.
6. **표준 액션 바(Standard Action Bar)** — 폼의 저장/취소 버튼은 항상 우측 하단에 배치하며, `renderFormActions()` 함수를 통해서만 생성한다.
7. **콘텐츠 생략 정책(Text Truncation, Zero Tolerance)** — 데이터가 칸을 넘칠 경우 `truncate` 클래스를 사용하여 레이아웃 붕괴를 원천 차단한다.
8. **필수 입력 강조(Required Indicator)** — 필수 항목은 별도의 시각적 표식(예: 빨간 점 / `renderField`의 `required: true`로 자동 생성되는 `*` 표기)을 일관되게 적용하여 사용자 실수(User Error)를 방지한다.

### 경산다육 프로젝트 디자인 가이드라인

#### 1. 프로젝트 원칙 (Project Principles)
- **프레임워크**: Tailwind CSS (CDN 방식) 유지. 별도의 빌드 도구 도입 금지.
- **무결성**: 기능 로직 및 데이터 구조(Supabase 등) 변경 금지. 스타일 위주의 리팩토링.
- **일관성**: 모든 페이지와 모달은 정의된 공통 클래스(`@apply` 스타일)를 준수한다.

#### 2. 디자인 시스템 (Design System)
**색상 (Color)**
- Primary: `#16A34A` (초록) — 주요 버튼 및 강조
- Warning: `#F59E0B` (주황) — 주의 및 재고 부족
- Neutral: Gray 계열 — 배경, 텍스트, 테두리

**버튼 (Buttons)**
- `.btn-primary`: 배경 초록, 흰색 글자 — **페이지당 최대 1개**
- `.btn-secondary`: 테두리만 있는 회색/초록 스타일 — 보조 액션

**상태 표시 (Badges)**
- 버튼 형태 금지. 둥근 배지(Pill Badge)로 통일
- Variant: `neutral`(회색), `success`(초록), `warning`(주황), `info`(파랑)

#### 3. 모달 및 폼 표준 (Modal & Form Standards)
- **구조**: [헤더(흰색 배경, Border 하단) — 바디(`p-6`, 2열 그리드) — 푸터(우측 버튼 정렬)] 3단 구성
- **레이아웃**: `md:grid-cols-2`를 기본으로 하되, 폼이 길면 섹션 제목으로 구분
- **입력창**: `.input-ui` 클래스 적용. 라벨(Label)은 상단, 입력창(Input)은 하단 수직 배치
- **아이콘**: Lucide 또는 Heroicons 스타일로 통일. 선 굵기와 크기를 전 페이지 동일하게 유지

#### 4. 데이터 테이블 표준 (Data Table Standard)
**주문관리 화면(`features/orders/orderUI.js`의 테이블)을 모든 데이터 리스트의 표준 레퍼런스로 삼는다.**

- 다른 모든 탭(고객관리·상품관리·대기자·배송관리)의 테이블은 주문관리 테이블의 **컬럼 구조·정렬 규칙·뱃지 사용·액션 버튼 배치·스티키 헤더·행 높이·여백**을 기준으로 맞춘다.
- 불일치 발견 시: 주문관리가 정답. 다른 탭을 주문관리 쪽으로 수정한다 (역방향 금지).
- 주문관리 테이블 자체를 변경할 때는 **전체 탭에 동일 변경을 전파**해야 한다.
- 구체 항목:
  - 테이블 헤더: `sticky top-0`, 배경색·폰트 굵기 통일
  - 상태 컬럼: `renderOrderStatusBadge` 패턴 — 다른 탭은 `renderBadge`·`renderGradeBadge`로 동일 톤
  - 액션 컬럼: 항상 맨 오른쪽, `renderEditDeleteBtns` 사용
  - 숫자(금액/수량): 오른쪽 정렬 + `tabular-nums`
  - 날짜: 중앙 정렬, `fmt.date()` 포맷 사용
  - 빈 상태: `renderEmptyRow`로 통일

#### 5. 공통 컴포넌트 클래스 (Common Classes)
`<style>` 블록 또는 `styles/index-inline.css` 내에 정의되어야 함:
```css
.card-ui  { @apply bg-white rounded-lg shadow-sm border border-gray-200; }
.input-ui { @apply w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500; }
.table-ui { @apply min-w-full divide-y divide-gray-200 hover:bg-gray-50; }
```

## 주요 기능
- 대시보드 (매출 차트, 통계)
- 주문관리
- 고객관리 (CRM, 등급 관리)
- 상품관리
- 대기자관리
- 배송관리
- 환경설정

## 아키텍처 특징
- 네비게이션 클릭 시 컴포넌트 HTML을 동적으로 fetch해서 삽입
- `window.switchTab(tabId)` → `loadTabComponent(tabId)` → 각 컴포넌트 로드 함수 호출
- features/* 함수들은 `window.*`로 전역 등록
- OrderManagementSystem 메서드는 `window.orderSystem.메서드()`로 호출

## 데이터베이스
- Supabase 전용 (localStorage 없음)
- `window.supabaseClient`로 접근
- 주요 테이블: farm_customers, farm_orders, farm_products, farm_categories
- 프로덕션 활성화: `window.enableSupabaseProduction()`
- `supabase-production-config.js`에 `migrationMode: true`, `autoSync: true` 설정됨
- Supabase Realtime 구독 사용 (실시간 알림)

## 고객 등급
씨앗 · 새싹 · 그린 · 골드 · VIP

## 대기자(Waitlist) 상태 흐름
대기중 → 연락완료 → 주문전환

## 개발 시 주의사항
- `server.js`는 로컬 `.js`/`.css`에 `?v=` 쿼리 자동 주입 (캐시 버스팅, CDN URL은 제외)
- 컴포넌트 HTML 파일에는 `index.html` 컨테이너와 동일 ID의 외부 wrapper div 넣지 말 것 (네비게이션 백지 이슈 유발)
- 컴포넌트 동적 로딩 시 Supabase client 초기화에 대한 순환 의존 주의

## GitHub
- https://github.com/da6262/sucplant
