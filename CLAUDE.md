# 경산다육식물농장 관리시스템

## 🔁 Git & 문서 워크플로우 (작업 단위 완료 시 필수)

여러 AI 편집기가 동시 작업하므로 원격 동기화를 지연시키지 않는다.

### 1) 커밋 (항상)
- 한 가지 주제 작업이 끝날 때마다 **즉시 커밋**
- 메시지 프리픽스: `fix` / `feat` / `style` / `refactor` / `docs` / `chore`
- 한글 메시지 OK (UTF-8)
- `js/config.js` 패치 버전은 git hook 이 자동 +1
- **내가 편집한 파일만 명시 스테이징** (`git add <file1> <file2>` 형태). `git add .` / `git add -A` 금지 — 다른 AI 편집기 세션의 미커밋 변경이 끼어들면 다른 세션의 작업이 통째로 섞여 들어감
- 다른 세션의 modified 파일은 commit 전 `git stash push -- <files>` 로 분리, push 완료 후 `git stash pop` 으로 원복
- README/config 는 내 커밋의 일부로 취급해 같이 스테이징 (변경 이력 동일 커밋 규칙과 정합)

### 2) README 변경이력 (커밋과 동일 커밋에 포함)
- `README.md` 의 "변경 이력" 테이블 **맨 위**에 이번 버전 + 내용 한 줄 추가
- 형식: `| vX.X.X | 구체 내용(무엇을 왜 어떻게) |`
- 상단 **버전 뱃지**(`img.shields.io/badge/version-vX.X.X`) 도 최신 버전으로 함께 갱신
- 별도 `docs:` 커밋 지양 — 기능/수정 커밋에 README 업데이트 포함

### 3) 푸시 (자동)
- 커밋 후 즉시 다음 시퀀스 실행:
  ```
  git pull --rebase origin main
  git push origin main
  ```
- 충돌 발생 시에만 사용자에게 알림. 그 외 자율적으로 푸시까지 완료.
- 원격에 반영돼야 다른 AI 편집기가 최신 규칙·변경을 즉시 받음.

### 4) CLAUDE.md 업데이트 시점
- 디자인 규칙·아키텍처 함정·Dead code 등 **재사용 가능한 지식**을 발견하면 즉시 이 문서에 추가
- 같은 주제로 두 번 이상 브리핑해야 할 정황이면 규칙화 후 커밋
- 개별 작업 기록은 README 변경이력으로, 영속 규칙은 CLAUDE.md 로 분리

### 5) 작업 시작 전 README 스캔 (필수)
- 수정 대상 파일·기능과 관련된 최근 변경이력(`README.md` 상단 변경이력 테이블의 5~10줄)을 먼저 확인
- 동일 영역에 최근 작업이 있으면 그 맥락 위에 이어서 작업 (되돌리기·재수정·중복 방지)
- 전체 README를 읽을 필요는 없음 — 변경이력 테이블 상단만 훑기
- 다른 AI 편집기의 최근 작업과 충돌 가능성도 이 스캔으로 감지

---

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
- **허용 variant**: `neutral`(회색), `success`(초록), `warning`(주황), `info`(파랑), `danger`(빨강), `purple`, `sky`, `orange`
- **금지**: `badge-red`, `badge-yellow`, `badge-green`, `badge-blue` 같은 색상 이름 직접 사용 (시맨틱 이름만 사용)

#### 3. 모달 및 폼 표준 (Modal & Form Standards)
- **구조**: [헤더(흰색 배경, Border 하단) — 바디(`p-6`, 2열 그리드) — 푸터(우측 버튼 정렬)] 3단 구성
- **레이아웃**: `md:grid-cols-2`를 기본으로 하되, 폼이 길면 섹션 제목으로 구분
- **입력창**: `.input-ui` 클래스 적용. 라벨(Label)은 상단, 입력창(Input)은 하단 수직 배치
- **아이콘**: Lucide 또는 Heroicons 스타일로 통일. 선 굵기와 크기를 전 페이지 동일하게 유지

#### 4. 데이터 테이블 표준 (Data Table Standard)
모든 데이터 리스트(주문·고객·상품·대기자·배송)는 아래 공통 규칙을 따른다.

**테이블 전역 스타일 (`.table-ui`)**:
- **엑셀 격자선**: 모든 `<th>/<td>`에 `border-right: 1px solid #CBD5E1`, 테이블 전체 테두리 1px. `styles/index-inline.css`의 `.table-ui` 정의에서 일괄 관리 (개별 테이블에 테두리 직접 지정 금지).
- **컬럼 너비**: `<colgroup>` 사용 금지. `<th>`에 Tailwind 클래스(`w-10`, `w-20`, `w-24`, `min-w-[200px]`) 직접 지정. 가변 컬럼은 `min-w-[Npx]`, 고정 컬럼은 `w-N`.

**셀 렌더링 규칙** (필수):
- 모든 `<td>`에 `px-2 align-middle` 기본 적용
- 빈 값 표기: `const nullDash = '<span class="td-null">—</span>';` 상단 선언 → 값 없을 때 `nullDash` 삽입 (하이픈 문자 `-` 금지)
- 시맨틱 셀 클래스:
  - 주 데이터(이름/상품명/고객명): `td-primary` (+ 클릭 가능 시 `td-link`, 선택적 래퍼 `.customer-name-link` 등)
  - 보조 정보: `td-secondary`
  - ID류(상품코드/주문번호): `td-muted whitespace-nowrap`
  - 금액: `td-amount text-right text-numeric`
  - 숫자: `td-num text-right`
- 상태 컬럼: `renderOrderStatusBadge` 패턴 — 다른 탭은 `renderBadge`·`renderGradeBadge`로 동일 톤
- 액션 컬럼: 항상 맨 오른쪽, `renderEditDeleteBtns` 사용, `whitespace-nowrap`
- 날짜: 중앙 정렬, `fmt.date()` 포맷 사용
- 빈 상태(행 0개): `renderEmptyRow`로 통일
- XSS 방어: 외부 문자열은 `.replace(/</g, '&lt;').replace(/>/g, '&gt;')` 필수

**이름 컬럼 색상 규칙** (`.td-link`):
- `.td-link` 클래스의 `color` 속성은 **제거됨** — `td-primary`(검정) 상속
- 호버 시에만 `color: var(--info)` + `text-decoration: underline`
- 결과: 주문·고객·상품·대기자 **모든 탭의 이름 컬럼은 검정**으로 통일, 클릭 가능성은 호버로 표시

#### 5. 공통 컴포넌트 클래스 (Common Classes)
`<style>` 블록 또는 `styles/index-inline.css` 내에 정의되어야 함:
```css
.card-ui  { @apply bg-white rounded-lg shadow-sm border border-gray-200; }
.input-ui { @apply w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500; }
.table-ui { @apply min-w-full divide-y divide-gray-200 hover:bg-gray-50; }
```

---

## 🎨 디자인 토큰 & UI 통제소 (Single Source of Truth)

### 🏛 역할 분리 — Tailwind vs CSS 통제소

두 시스템을 **영역별로 엄격히 분리**. 섞으면 브랜드 통제권이 무너짐.

| 영역 | 도구 | 예시 |
|---|---|---|
| **브랜드·색상·컴포넌트** | `styles/index-inline.css` CSS 변수 + 컴포넌트 클래스 | `.btn-primary`, `.badge-success`, `var(--primary)`, `.table-ui` |
| **레이아웃·간격·반응형** | Tailwind CDN 유틸리티 | `flex`, `gap-2`, `px-4`, `grid-cols-12`, `md:pl-[180px]` |

**금지 사항:**
- ❌ Tailwind 색상 직접 사용: `bg-green-500`, `text-red-600`, `border-blue-400` 등
- ❌ 인라인 스타일 색상 하드코딩: `style="color:#16a34a"`
- ❌ 브랜드 변경을 위해 Tailwind 색상 사용 (브랜드는 오직 CSS 변수·컴포넌트 클래스 경유)

**주의:** 루트의 `tailwind.config.js` 파일은 **빌드 전용 포맷이라 CDN 런타임에 반영 안 됨** (dead config). 건드리지 말고, 브랜드 색상은 오직 CSS 변수로 관리할 것.

---

모든 UI 결정은 아래 5계층으로 관리. **새 코드는 반드시 각 계층 기존 값/클래스 사용**, 하드코딩 금지.

### Layer 1 — CSS 변수 (`styles/index-inline.css` `:root`)

**브랜드·의미 색상**
```
--primary          #16A34A   버튼·활성 탭 (btn-primary)
--primary-hover    #15803D   primary hover
--primary-light    #22C55E   밝은 그린 (btn-search)
--primary-accent   #059669   에메랄드 (nav·아이콘)
--danger           #DC2626   삭제·위험 / --danger-hover / --danger-bg
--info             #2563EB   정보·링크 호버 / --info-bg
--warn             #D97706   경고 / --warn-bg
```

**배경·테두리**
```
--bg-page          #F1F5F9   페이지 배경
--bg-light         #F9FAFB   호버·섹션 배경
--bg-lighter       #F8FAFC   테이블 헤더 배경
--bg-white         #ffffff
--border           #E2E8F0   범용 테두리
--border-light     #F0F0F0   연한 구분선
```

**텍스트 계층**
```
--text-heading     #111827   섹션 제목
--text-primary     #1E293B   핵심 데이터 (td-primary)
--text-body        #374151   본문·버튼 텍스트
--text-secondary   #64748B   보조 정보 (td-secondary)
--text-muted       #94A3B8   부수 정보 (td-muted)
--text-link        #3B82F6   (사용 안 함 — `.td-link` 는 상속으로 검정)
--text-amount      #0F172A   금액 (td-amount)
--text-null        #94A3B8   빈 값 대시 (td-null)
```

**테이블**
```
--tbl-row-height   30px    --tbl-cell-py       5px
--tbl-font-size    13px    --tbl-header-bg     var(--bg-lighter)
--tbl-header-fw    600     --tbl-grid-color    #CBD5E1 (엑셀 격자선)
--tbl-hover-bg     #F0FDF4 --tbl-zebra-bg      #E5E7EB (gray-200, 10% 대비)
```

**뱃지 (배경/텍스트 쌍)**
```
--badge-neutral-bg/txt   --badge-warning-bg/txt
--badge-info-bg/txt      --badge-danger-bg
--badge-purple-bg/txt    --badge-sky-bg/txt
--badge-orange-bg/txt    --badge-green-bg / --badge-gray-txt
```

**모양·그림자**
```
--radius-sm 4px  --radius-md 6px  --radius-lg 8px  --radius-xl 12px  --radius-full 9999px
--shadow-xs  0 1px 2px rgba(0,0,0,0.05)
--shadow-sm  0 1px 4px rgba(0,0,0,0.06)
--shadow-md  0 4px 16px rgba(0,0,0,0.10)
--shadow-lg  0 8px 32px rgba(0,0,0,0.18)
```

**사이드바**: `--sidebar-dark #0f172a` / `--sidebar-mid #1a2744`

---

### Layer 2 — 시맨틱 클래스

| 분류 | 클래스 |
|---|---|
| 버튼 (전체) | `.btn-primary` `.btn-secondary` `.btn-danger` `.btn-info` `.btn-warn` `.btn-neutral` `.btn-purple` `.btn-orange` `.btn-icon` `.btn-icon-edit` `.btn-icon-delete` `.btn-icon-copy` `.btn-search` `.btn-xs` |
| 뱃지 | `.badge` + `.badge-neutral/success/warning/danger/info/purple/sky/orange` |
| 테이블 셀 | `.td-primary` `.td-secondary` `.td-muted` `.td-amount` `.td-num` `.td-null` `.td-link` |
| 테이블 | `.table-ui` (전역 격자선 포함) |
| 필터 | `.filter-bar` `.input-ui` |
| 상태탭 | `.status-tab-bar` `.status-tab-btn` `.tab-count` |
| 헤더 | `.page-header` `.action-group` |
| 모달 | `.modal-overlay` `.modal-container` `.modal-sm/md/lg/xl` `.modal-header/body/footer` `.modal-title` `.modal-close-btn` |
| 폼 | `.form-grid` `.form-col-4/6/12` `.form-label .req` `.form-control` `.form-helper` `.form-error` `.form-input-group` `.form-section` `.form-actions` |
| **텍스트 컬러 유틸** (Phase 1B) | `.text-brand` `.text-brand-hover` `.text-info` `.text-danger` `.text-warn` `.text-heading` `.text-body` `.text-secondary` `.text-muted` `.text-amount` `.text-null-soft` |
| **배경 서피스 유틸** | `.bg-card` `.bg-section` `.bg-page` `.bg-info` `.bg-danger` `.bg-warn` `.bg-success` |
| **배경 액센트 유틸** (Phase 1B·아이콘 박스용) | `.bg-info-accent` `.bg-success-accent` `.bg-warn-accent` `.bg-danger-accent` `.bg-purple-accent` `.bg-orange-accent` `.bg-sky-accent` |
| **폰트 크기** | `.text-3xs(9px)` `.text-2xs(10px)` `.text-xs(11px)` `.text-sm(12px)` `.text-base(13px)` `.text-lg(15px)` `.text-xl(18px)` |

**신규 유틸 정책 (Phase 1B/C 완료 후)**:
- 브랜드·의미 색상은 위 유틸 사용 — `text-gray-500` 같은 raw Tailwind 금지
- 진한 버튼은 `.btn-*` 공용 클래스 사용 — `bg-blue-600 text-white hover:bg-blue-700 ...` 금지
- 아이콘 박스 배경은 `.bg-*-accent` 사용 — `bg-blue-100` 금지
- 오버라이드 레이어(`styles/index-inline.css` L839~)가 구형 Tailwind 색상을 자동 변환하지만, **신규 코드는 처음부터 시맨틱 유틸 사용**

### Layer 3 — 렌더러 (`utils/ui.js`)

16종 표준 렌더러. 모듈 내에서 raw Tailwind 클래스 직접 쓰지 말고 이 함수 사용:
- **레이아웃**: `renderPageHeader`, `renderFilterBar`, `renderEmptyRow`, `renderModal`
- **폼**: `renderField`, `renderFormSection`, `renderFormGrid`, `renderFormActions`
- **뱃지/버튼**: `renderBadge`, `renderOrderStatusBadge`, `renderGradeBadge`, `renderBtnIcon`, `renderBtnGroup`, `renderEditDeleteBtns`
- **기타**: `renderConfirmDialog`, `renderInfoRow`, `renderSectionTitle`

### Layer 4 — 도구 유틸 (`utils/`)

- `utils/pageSize.js` — `window.PageSize.attach(selectId, onChange, initialValue)` 페이지 표시 개수 컨트롤
- `utils/formatters.js` — `formatDate`, `formatCurrency`, `formatPhone`, `formatQty`, `nullDash`, `emptyDash` + `window.fmt.*`

### Layer 5 — 강제 규칙

- **색상 하드코딩 금지** — `#16a34a` 같은 헥스 직접 기재 금지, `var(--primary)` 사용
- **Tailwind 임의값 지양** — `text-[11px]`, `min-w-[200px]` 는 특수 사례에만
- **badge 금지 variant** — `badge-red/yellow/green/blue` 사용 금지, 시맨틱 이름만
- **테이블 컬럼 너비** — 탭별 데이터 특성에 맞춰 개별 관리 (전 탭 통일 금지 — 데이터 폭 다르면 너비 다름)
- **수정 시 반드시 Layer 1 먼저 확인** — 기존 토큰으로 표현 가능하면 토큰 사용
- **신규 토큰 추가** — `:root` 에 추가 + 이 섹션에 문서화 필수

---

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
- **DB 쿼리는 오직 `window.supabaseClient` 로만 접근**. `window.supabase` 사용 금지 — 초기화 경로(index.html inline vs supabase-config.js)에 따라 `window.supabase` 가 라이브러리 namespace(`.from()` 없음) 이거나 client 이거나 타이밍 의존적. `window.supabaseClient` 는 항상 client 인스턴스로만 설정되므로 안전. 함정 사례: v3.3.9 에서 categoryData.js 가 `window.supabase.from(...)` 호출로 일부 init 경로에서 silent fail 하던 버그 수정
- 주요 테이블: farm_customers, farm_orders, farm_products, farm_categories
- 프로덕션 활성화: `window.enableSupabaseProduction()`
- `supabase-production-config.js`에 `migrationMode: true`, `autoSync: true` 설정됨
- Supabase Realtime 구독 사용 (실시간 알림)

## 고객 등급
씨앗 · 새싹 · 그린 · 골드 · VIP

## 대기자(Waitlist) 상태 흐름
대기중 → 연락완료 → 주문전환

## 개발 시 주의사항
- `server.js`는 로컬 `.js`/`.css`에 `?v=` 쿼리 자동 주입 (캐시 버스팅, CDN URL은 제외). **HTML 요청마다 `getAppVersion()` 이 `js/config.js` 를 재읽기** → pre-commit hook bump 나 수동 수정 모두 서버 재시작 없이 다음 페이지 로드부터 반영 (v3.3.57).
- `start-server.bat` 은 **Node.js 우선** — Python 이 떠버리면 `?v=` 주입·MIME 처리·README 동기화 전부 우회되므로 Node 없을 때만 Python 폴백 (v3.3.57).
- 컴포넌트 HTML 파일에는 `index.html` 컨테이너와 동일 ID의 외부 wrapper div 넣지 말 것 — `index.html`의 `<div id="*-section">` 안에 또 `<div id="*-section">`이 들어가면 탭 전환 로직이 내부에 `hidden` 부여하여 빈 화면. 컴포넌트 HTML 외곽은 class만 유지하고 id 제거.
- 컴포넌트 동적 로딩 시 Supabase client 초기화에 대한 순환 의존 주의
- `data-manager` polling 루프 금지. `initialize*DataManager()` 즉시 호출이 기본. 꼭 필요하면 `supabase-ready` CustomEvent 구독.
- 과거 등록된 `sw.js` Service Worker 가 브라우저에 남아 캐시 덮는 문제 방지용 자동 해제 스크립트가 `index.html` `<head>` 에 포함되어 있음 — 제거하지 말 것.

### 테이블 지브라(`.table-ui`) 함정
- **odd row 명시 필수** — `tr:nth-child(odd) { background: #fff }` 없으면 홀수 행이 부모 배경을 통과시켜 탭마다 결과 상이. 주문 탭은 `bg-white` 외곽 래퍼 없어 body `bg-slate-100` (`#F1F5F9`) 이 짝수 zebra 와 근색 → 지브라 완전 증발. (v3.3.57 수정)
- **대비 4% 이하는 고휘도·주변광 환경에서 지각 불가** — `#FAFAFA`(2%)·`#F5F5F5`(4%) 는 OLED/고밝기 LCD에서 flatten. `--tbl-zebra-bg` 는 `#E5E7EB`(gray-200, 10%) 유지. 더 낮추려면 DevTools 로 Weber 대비 확인 후.
- 증상 감별: 화면 dim(캡처 overlay, 절전 전이) 때만 보이면 색상 대비 문제. 부모 bg 따라 탭마다 차이나면 odd 명시 누락.

### 환경설정 데이터 구조 (farm_settings, Supabase)
- 모든 환경설정은 Supabase `farm_settings` 테이블(id=1)의 `settings` JSONB 컬럼에 단일 JSON 으로 저장
- 최상위 키: `farm`, `shipping`(`defaultShippingFee`/`freeShippingThreshold`/`remoteAreaShippingFee`/`shippingMethods`), `orderStatuses`(배열), `customerGrades`(배열), `smsTemplates`, `smsConfig`, `gradePeriod`, `system`
- CRUD: `settingsDataManager.updateSetting(section, key, value)` → 메모리 변경 후 `saveSettings()` → 전체 JSON upsert
- **캐시 주의**: `settingsDataManager.loadSettings()` 는 `Object.keys(this.settings).length > 0` 일 때 캐시 반환 → DB 강제 재조회는 `window.forceReloadSettings()` 사용 (v3.3.28 에서 빈 객체 truthy 버그 수정됨)

### 환경설정 ↔ UI 연동 현황
| 설정 키 | UI 소비처 | 연동 방식 |
|---|---|---|
| `shipping.*` | 주문 등록 폼 배송비 제안 | `orderForm.js#initShippingFeeFromSettings` → `SHIPPING_SETTINGS` 캐시 |
| `shipping.shippingMethods` | 주문 등록 폼 배송방법 드롭다운 | `loadShippingMethodsFromSettings()` 동적 `<option>` 주입 |
| `orderStatuses` | 주문 등록 폼 상태 드롭다운 | `populateOrderStatusSelectFromSettings()` 동적 `<option>` 주입 (v3.3.40) |
| `orderStatuses` | 주문관리 상단 상태 탭 + 카운트 | `orderData.js#renderStatusTabs()` → `#status-tab-dynamic-slot` 동적 버튼 (v3.3.40) |
| `customerGrades` | 고객등급 표시 | `customerUI.js:405` **직접 쿼리** (settingsDataManager 경유 안 함 — 별도 `_gradesCache`) |
| `smsTemplates` | SMS 발송 모달 | `orderSMS.js` 에서 `settingsDataManager` 참조 |
| **배송관리 상태 전이** | `shippingManager.js` 등 | **미연동 (하드코딩)** — 후속 리팩 필요 |

### `initSettingsEventListeners()` 함정 (never-called)
- `features/settings/settingsUI.js:572` 에 정의, `window.initSettingsEventListeners` 로 export 되었으나 **호출처 없음**
- 환경설정 탭의 버튼 리스너(`add-order-status-btn`, `add-customer-grade-btn`, `save-grade-period-btn` 등)가 이 함수 안에 갇혀 있었음
- **해결 패턴**: 각 탭 load 함수(`loadOrderStatuses`, `loadCustomerGrades`) 내부에서 `dataset.listenerAdded` guard 후 개별 바인딩 (기존 동작하는 `add-channel-btn`·`recalculate-all-grades-btn` 과 동일 패턴)
- 새 환경설정 버튼 추가 시: `initSettingsEventListeners` 에 넣지 말고 **해당 탭의 `loadXXX()` 함수 안에서 guard 바인딩**할 것

### 상품 테이블 렌더링 이중 경로 주의
- `features/products/productUI.js` 의 `renderProductsTable` / `PRODUCT_TABLE_COLUMNS` — **활성 코드** (과거 "Dead Code" 기록은 오래되어 부정확)
- `components/product-management/product-management.js` 의 `createProductRow` — 동적 로드 시 사용
- 두 경로가 공존하며 각각의 사용 시점이 다름. 상품 테이블 수정 시 **양쪽 모두 확인**

### 루트 디버그/테스트 파일
- 프로덕션에서 참조되지 않는 루트 debug/test HTML·JS 25개는 `archive/dev-tools/` 로 이동 완료 (v3.3.41)
- `inventory-modal.html`, `allowed-users-management.html`, `system-admin.html` 은 기능성 이름이라 보류

### 빌드 시스템 참고
- `package.json` 의 `"build": "node deploy-to-web.js"` → **파일 부재로 작동 안 함**
- `deploy-to-production.js` 는 **브라우저 런타임 전용** (Node CLI 빌드 아님)
- `dist/` 폴더는 수동 관리 (git 추적 중, firebase hosting public 경로)
- 배포: `dist/` 를 수동 동기화 후 `firebase deploy` 직접 실행

## GitHub
- https://github.com/da6262/sucplant
