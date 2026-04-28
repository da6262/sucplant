# 경산다육식물농장 관리시스템

## 🔁 Git & 문서 워크플로우 (작업 단위 완료 시 필수)

여러 AI 편집기가 동시 작업하므로 원격 동기화를 지연시키지 않는다.

### 1) 커밋 (항상)

**올바른 순서 (반드시 이 순서 준수)**:

```bash
# Step 1 — 커밋 전 워킹트리 정리
git restore dist/                              # dist/ 는 deploy 때마다 재생성 → restore로 초기화
git stash push -- .claude/settings.local.json  # 다른 세션 파일만 stash (dist/ 는 stash 하지 말 것)

# Step 2 — 내 파일만 스테이징 + 커밋
git add <file1> <file2> README.md
git commit -m "feat: ..."

# Step 3 — rebase pull → push
git pull --rebase origin main
git push origin main

# Step 4 — 배포
npm run deploy

# Step 5 — stash 복원
git stash pop
```

- 한 가지 주제 작업이 끝날 때마다 **즉시 커밋**
- 메시지 프리픽스: `fix` / `feat` / `style` / `refactor` / `docs` / `chore`
- 한글 메시지 OK (UTF-8)
- `js/config.js` 패치 버전은 git hook 이 자동 +1
- **내가 편집한 파일만 명시 스테이징** (`git add <file1> <file2>` 형태). `git add .` / `git add -A` 금지 — 다른 AI 편집기 세션의 미커밋 변경이 끼어들면 다른 세션의 작업이 통째로 섞여 들어감
- **dist/ 는 stash 금지, restore 로 초기화** — `npm run sync`가 deploy 때마다 덮어쓰므로 stash해봤자 pop 시 충돌만 발생. `git restore dist/`로 초기화 후 rebase, deploy 후 자동 재생성됨
- **stash 대상**: `dist/` 제외한 다른 세션 파일만 (`js/config.js` 가 modified 상태라면 stash, `.claude/settings.local.json` 등)
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

### 3-1) 배포 (푸시 후 즉시)
- 푸시 완료 후 즉시 다음 시퀀스 실행:
  ```
  npm run deploy
  ```
- `npm run deploy` = `npm run sync` (소스→dist 복사) + `npm run check` (금지 패턴 스캔) + `firebase deploy`
- 배포 실패 시 사용자에게 알림. 성공 시 "✅ 배포 완료" 메시지 출력.
- **배포 없이 푸시만 하면 Firebase 호스팅에 반영 안 됨** — 반드시 deploy 까지 완료

### 3-2) 충돌 해결 (rebase 시)
- `git pull --rebase origin main` 에서 충돌 발생 시:
  1. 충돌 파일 열어서 수동 해결 (원격 = HEAD, 로컬 = 내 커밋)
  2. `config.js` 버전 충돌은 **항상 원격(높은 버전) 유지** — pre-commit hook 이 다시 +1
  3. `README.md` 변경이력 충돌은 **양쪽 모두 보존** (원격 행 + 내 행 합치기)
  4. `git add <해결파일>` → `git rebase --continue`
  5. 해결 불가 시 `git rebase --abort` 후 사용자에게 알림

### 4) CLAUDE.md 업데이트 시점
- 디자인 규칙·아키텍처 함정·Dead code 등 **재사용 가능한 지식**을 발견하면 즉시 이 문서에 추가
- 같은 주제로 두 번 이상 브리핑해야 할 정황이면 규칙화 후 커밋
- 개별 작업 기록은 README 변경이력으로, 영속 규칙은 CLAUDE.md 로 분리

### 5) 작업 시작 전 README 스캔 (필수)
- 수정 대상 파일·기능과 관련된 최근 변경이력(`README.md` 상단 변경이력 테이블의 5~10줄)을 먼저 확인
- 동일 영역에 최근 작업이 있으면 그 맥락 위에 이어서 작업 (되돌리기·재수정·중복 방지)
- 전체 README를 읽을 필요는 없음 — 변경이력 테이블 상단만 훑기
- 다른 AI 편집기의 최근 작업과 충돌 가능성도 이 스캔으로 감지

### 6) 다중 PC 동기화 (집·사무실 전환)
작업자가 여러 PC 를 오가므로 매 PC 첫 세팅·복귀 시 아래 순서 고정.

**처음 clone / 오래 쉬었다가 복귀**
```bash
git pull origin main      # 1) 최신 소스
npm install               # 2) node_modules 복구 (deep-extend 등)
start-server.bat          # 3) 서버 시작 → "🌱 앱 버전: vX.X.XX" 확인
# 4) 브라우저에서 Ctrl+Shift+R (하드 리프레시, 최초 1회)
```

**일상 작업 루틴**
```bash
# 시작
git pull --rebase origin main

# 작업 …

# 완료 (내가 편집한 파일만)
git add <file1> <file2>
git commit -m "..."       # pre-commit hook 이 js/config.js +1 자동
git push origin main

# 웹 배포
npm run deploy            # sync + check + firebase deploy 원샷
```

**"예전 버전 나와요" 감별 매트릭스**
| 증상 | 원인 | 해결 |
|---|---|---|
| `npm run deploy` 에서 `MODULE_NOT_FOUND` | `node_modules/` 깨짐 | `npm install` |
| 브라우저에서 옛 화면 | 브라우저 캐시 | `Ctrl+Shift+R` |
| `git pull --rebase` 거부 | 로컬 미커밋 변경 | `git stash → pull → stash pop` |
| 사이드바 버전 배지 옛 값 | server.js 재기동 대기 중 | v3.3.57+ 는 HTML 요청마다 `config.js` 재읽기 — 페이지 새로고침만 하면 최신 |

---

## 프로젝트 개요
경산다육식물농장의 주문/재고/고객 관리 웹앱입니다.

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
- `npm run sync` — 소스 → `dist/` 화이트리스트 기반 동기화 (v3.3.58+)
- `npm run check` — `dist/` 금지 패턴 스캔 (`server.js`·`*.bat`·`*.sql`·비밀 키 등)
- `npm run build` — `sync + check` 원샷 (이전 `deploy-to-web.js` 호출 제거됨)
- `npm run deploy` — `build` + `firebase deploy` (배포 파이프라인 상세는 아래 "빌드·배포 시스템")
- `npm run build-vite` — Vite 프로덕션 빌드 (현재 미사용)
- `npm run serve` — Python http.server (포트 8000, 로컬 임시 확인용)

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
| 필터 | `.filter-bar` `.input-ui` `.select-page-size` `.checkbox-ui` `.chk-danger` `.chk-purple` |
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
- `utils/formatters.js` — `formatDate`, `formatCurrency`, `formatPhone`, `formatQty`, `nullDash`, `emptyDash`, `ensureSupabase` + `window.fmt.*` / `window.ensureSupabase`

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
- 주요 테이블: farm_customers, farm_orders, farm_products, farm_categories, farm_order_items, farm_settings, farm_customer_logs
- `farm_customers.tags TEXT[]` — 고객 태그(v3.3.126+). 예: `{"단골","VIP후보","이탈위험"}`. GIN 인덱스.
- `farm_customer_logs` — 고객 타임라인 통합 테이블(v3.3.126+). `log_type` CHECK 제약: `call/memo/grade_change/tag_change/order_note/etc`. `metadata JSONB` 에 구조화 데이터 저장(등급변동 `{old,new,reason}`, 태그변동 `{added:[],removed:[]}`, 통화 `{direction,duration_sec}` 등). 접근: `window.customerLogsManager.{list,add,remove}`
- **farm_orders 추가 컬럼**: `sms_sent_at` TIMESTAMPTZ (SMS 발송 시각), `printed_at` TIMESTAMPTZ (주문서 출력 시각) — v3.3.83 추가
- **farm_orders 추가 컬럼**: `shipping_method` VARCHAR (택배사, 기본값 '택배'), `customer_address_detail` TEXT (상세주소) — v3.4.5 추가. 주의: `shipping_company` 컬럼은 존재하지 않음 — 택배사는 반드시 `shipping_method` 사용
- **farm_orders 추가 컬럼**: `last_sms_type` VARCHAR (마지막 발송 SMS 템플릿 타입: orderConfirm/paymentConfirm/shippingStart/shippingComplete/custom) — v3.4.19 추가. RPC `get_order_rows`에서도 반환.

- **farm_stock_logs** — 입출고 이력 테이블(v3.4.32+). `type` CHECK: `in/out/adjust/order/cancel/return`. `product_id` FK farm_products, `order_id` FK farm_orders(nullable). `stock_before`/`stock_after`로 변동 전후 기록. 접근: `window.logStockChange(productId, type, qty, {reason, orderId})`, `window.getStockLogs(productId, limit)`
- **farm_products.safe_stock** INT (안전재고, 기본값 5) — v3.4.31 추가

### SMS / 카카오 알림톡 발송 체계 (v3.4.28+)
- **스마트 발송**: `sendSmartMessage()` — 카카오 알림톡 우선 시도, 실패 시 SMS 자동 폴백
- **카카오 채널**: pfId `KA01PF250905143602736PcFaTjYyszo` (경산다육농장, searchId: suplant)
- **카카오 알림톡 템플릿** (Solapi 경유):
  - `orderConfirm` → `KA01TP260418163114740BHO5Pj256DA` (주문 접수 안내)
  - `paymentConfirm` → `KA01TP260418163114819UIuQRGFX7AV` (입금 확인 안내)
  - `shippingStart` → `KA01TP26041816311486081rup0HHQ5K` (배송 시작 안내)
  - `shippingComplete` → `KA01TP260418163114900fOuMkngRGhB` (배송 완료 안내)
  - `waitlistNotify` → `KA01TP250905182859613fufzpibZmgG` (입고 알림, 승인완료)
- **SMS 발송 후 DB 기록**: `sms_sent_at` + `last_sms_type` 자동 업데이트
- **템플릿별 상태 자동 전환** (v3.4.71+): orderConfirm→**고객안내**(이전: 입금대기), paymentConfirm→**배송준비**(이전: 입금확인), shippingStart→배송중, shippingComplete→배송완료. 의미: SMS 발송 = 해당 단계 완료. orderConfirm 발송 = 고객에게 안내 갔음 / paymentConfirm 발송 = 입금 확인되었으니 배송 준비 단계 진입
- **일괄 SMS**: 체크박스 선택 → `showBulkSMSModal()` → 템플릿 선택 → 순차 발송 + 진행률 표시
- **카카오 알림톡 silent fallback 함정 (v3.4.70+)**: `sendSmartMessage()` 가 카카오 실패 시 SMS 폴백 후 console.warn 만 찍던 문제 해결. 이제 토스트로 즉시 가시화 + `kakaoError` 필드 반환. 흔한 실패 사유: ① **변수명 불일치** — 우리 코드의 `#{고객명}`/`#{주문번호}`/`#{상품명}`/`#{금액}`/`#{택배사}`/`#{송장번호}` 가 Solapi 어드민 등록 템플릿의 변수명과 **글자 단위로 정확히 일치**해야 함 (한글 띄어쓰기 포함) ② Solapi API Key 알림톡 발송 권한 부족 ③ 카카오 채널-템플릿 미연결. 디버깅: F12 → Console → 발송 시 `⚠️ 카카오 알림톡 실패, SMS 폴백:` 로그에 실제 오류 표시
- **발송 채널 라벨 (v3.4.73+)**: 결과 알림 메시지는 `result.channel === 'kakao' ? '카카오톡' : '문자'` 로 분기 표기. 일괄 발송은 채널별 카운트(`kakaoCount`/`smsCount`) 분리. 단순 "SMS 발송 완료" 처럼 generic 라벨 금지
- **자동 발송 토글 패턴 (v3.4.70+ 송장 / v3.4.73+ 입금확인)**: 일괄 작업 화면에 `<input type="checkbox" id="*-auto-sms">` 토글 + 저장/처리 시 토글 ON 이면 sendOrderSMS 자동 호출. Solapi rate limit 대응 **250ms 간격** 순차 발송 권장. 채널별 카운트 분리 표시
- **`bulkConfirmPayment`** (v3.4.73+): 입금대기 주문 일괄 입금확인. 토글 ON → paymentConfirm 발송 → 상태 배송준비 / OFF → 단순 입금확인 상태 변경
- **송장 조회 URL 자동 삽입 (v3.4.78+)**: `getTrackingUrl(shippingMethod, trackingNumber)` 가 택배사별 조회 URL 패턴 매핑. SMS 템플릿에 `{trackingUrl}` 변수 사용 시 자동 치환. 기존 사용자 템플릿에 `{trackingUrl}` 없어도 송장번호 언급 시 자동으로 `\n조회: <URL>` append (호환). 지원: 로젠·CJ대한통운·한진·우체국·편의점택배. 농장 실사용 택배사(`SHIPPING_COMPANIES`)는 v3.4.79 부터 로젠·우체국·기타 3개로 단순화 — getTrackingUrl 매핑은 5개 그대로 유지하여 향후 사용 시 즉시 동작

### 문자 붙여넣기 → 주문 자동 입력 (v3.4.9+)
- `openSmsPasteModal()` — 주문 등록 폼의 "문자입력" 버튼
- `parseSmsText()` — 이름·전화·주소·메모·상품 자동 파싱 (라벨형/줄별/혼합 양식, 전화번호 공백 구분자 지원)
- `matchProductsFromDB()` — 파싱된 상품명을 `farm_products`와 부분일치 매칭 → 장바구니 자동 추가
- 기존 고객(전화번호 DB 매칭) → `customer_id` 자동 연결, 신규 고객 → `farm_customers` 자동 등록
- "저장+문자" 버튼 — 주문 저장 후 바로 SMS 발송 모달 열기 (주문확인 템플릿 자동 선택)

### 대시보드 차트 (v3.4.36+)
- Chart.js 사용: 매출 추이(선형, 7/30/365일), 주문 상태(도넛), 카테고리별 매출(가로 막대)
- KPI: 오늘/이번달 매출 + 전일/전월 대비 % 화살표, 평균 주문금액, 재구매율, 신규고객
- 워크플로우 카드 6열: 포장대기, 포장중, 배송대기, 재고부족, 연락대기, 신규고객
- 하단: 인기 상품 TOP 5, 최근 주문(실시간), 빠른 액션, 운영 효율, 고객 분석(등급 분포+VIP TOP 5)

### 대기자관리 개선 (v3.4.34+)
- 상태 변경: prompt() → 아이콘+색상 드롭다운 모달 (`_applyWaitlistStatus`)
- 주문 전환: "주문전환" 선택 시 주문 등록 폼 자동 열기 + 고객·상품명 채우기
- SMS 연동: "연락완료" 시 입고 알림 발송 제안, 일괄 입고 알림 발송 (`_waitlistBulkSMS`)
- 일괄 작업 바: 입고 알림 / 연락완료 / 주문전환 / 취소

### RPC: `get_order_rows`
- 주문관리 목록의 **단일 데이터 소스** — 목록 렌더링 + 탭 카운트 모두 이 결과 사용
- SQL 정의: `supabase-get-order-rows-rpc.sql` (변경 시 Supabase SQL Editor에서 실행 필요)
- 반환 필드: `order_id`, `order_number`, `order_created_at`, `d_day`, `customer_name`, `customer_phone_last4`, `order_items_summary`, `items_subtotal`, `shipping_fee`, `discount_amount`, `total_amount`, `payment_status`, `order_status`, `delivery_status`, `sms_sent_at`, `printed_at`
- **RPC 필드 추가 시**: SQL 파일의 `RETURNS TABLE` + `SELECT` 양쪽 수정 → Supabase 실행 → JS `renderOrderRow()`에서 사용
- **타입 주의**: `farm_orders.order_number`은 `varchar` — RPC에서 `::TEXT` 캐스트 필수 (v3.3.83에서 타입 불일치 오류 해결)
- 프로덕션 활성화: `window.enableSupabaseProduction()`
- `supabase-production-config.js`에 `migrationMode: true`, `autoSync: true` 설정됨
- Supabase Realtime 구독 사용 (실시간 알림)

## 고객 등급
- **환경설정 기반** — `farm_settings.customerGrades` JSONB 배열에 저장, 사용자가 환경설정 탭에서 이름·최소금액·할인율·색상 자유 편집
- 등급 개수·이름 고정 아님. **현재 운영 중(2026-04 DB 기준)**: 일반(GENERAL·0원·0%) / 그린(GREEN_LEAF·10만원·5%) / 퍼플(PURPLE_EMPEROR·50만원·10%) / 블랙(BLACK_DIAMOND·100만원·15%) — `gradePeriod='all'`(전체 누적)
- **주의: 코드에서 등급명 하드코딩 금지** — `farm_settings` 에서 동적 로드(`loadCustomerGradesFromSettings` / `settingsDataManager.settings.customerGrades`). 실제 등급이 뭔지는 환경설정 또는 `SELECT settings->'customerGrades' FROM farm_settings WHERE id=1` 로 확인
- `farm_customers.grade` 에는 등급 **code**(`GENERAL`·`GREEN_LEAF`·`PURPLE_EMPEROR`·`BLACK_DIAMOND` 등) 저장, 표시 시 settings 의 `name` 으로 변환
- 자동 재계산 경로: `updateCustomerGrade(customerId, totalPurchaseAmount)` — `gradePeriod`(all/1year/6months/3months) 에 따라 기간별 구매액 합산 → 등급 최소금액(`minAmount`) 임계값 비교 → 등급 결정. 환경설정 "전체 고객 등급 재계산" 버튼이 모든 고객 순회 (v3.3.137+: 등급 변동 시 `farm_customer_logs` 에 `grade_change` 로그 자동 기록, 수동 편집에도 동일 훅)

## 대기자(Waitlist) 상태 흐름
대기중 → 연락완료 → 주문전환

## 개발 시 주의사항
- `server.js`는 로컬 `.js`/`.css`에 `?v=` 쿼리 자동 주입 (캐시 버스팅, CDN URL은 제외). **HTML 요청마다 `getAppVersion()` 이 `js/config.js` 를 재읽기** → pre-commit hook bump 나 수동 수정 모두 서버 재시작 없이 다음 페이지 로드부터 반영 (v3.3.57).
- `start-server.bat` 은 **Node.js 우선** — Python 이 떠버리면 `?v=` 주입·MIME 처리·README 동기화 전부 우회되므로 Node 없을 때만 Python 폴백 (v3.3.57).
- 컴포넌트 HTML 파일에는 `index.html` 컨테이너와 동일 ID의 외부 wrapper div 넣지 말 것 — `index.html`의 `<div id="*-section">` 안에 또 `<div id="*-section">`이 들어가면 탭 전환 로직이 내부에 `hidden` 부여하여 빈 화면. 컴포넌트 HTML 외곽은 class만 유지하고 id 제거.
- **크로스 컴포넌트 중복 ID 금지** — 탭 컴포넌트들은 동시에 DOM에 공존하므로 서로 다른 컴포넌트에 같은 `id` 가 있으면 `getElementById` 가 먼저 삽입된 요소를 반환. 사례(v3.3.62): `customer-management.html` 등급관리 모달 내 `id="customer-grades-list"` 와 `settings.html` 의 `id="customer-grades-list"` 충돌 → 환경설정 탭의 등급 목록이 숨겨진 고객관리 모달 안으로 렌더링되어 화면 빈 화면. **컴포넌트별 ID 에 접두사 필수** (예: `settings-customer-grades-list`).
- 컴포넌트 동적 로딩 시 Supabase client 초기화에 대한 순환 의존 주의
- `data-manager` polling 루프 금지. `initialize*DataManager()` 즉시 호출이 기본. 꼭 필요하면 `supabase-ready` CustomEvent 구독.
- 과거 등록된 `sw.js` Service Worker 가 브라우저에 남아 캐시 덮는 문제 방지용 자동 해제 스크립트가 `index.html` `<head>` 에 포함되어 있음 — 제거하지 말 것.

### 테이블 지브라(`.table-ui`) 함정
- **odd row 명시 필수** — `tr:nth-child(odd) { background: #fff }` 없으면 홀수 행이 부모 배경을 통과시켜 탭마다 결과 상이. 주문 탭은 `bg-white` 외곽 래퍼 없어 body `bg-slate-100` (`#F1F5F9`) 이 짝수 zebra 와 근색 → 지브라 완전 증발. (v3.3.57 수정)
- **대비 4% 이하는 고휘도·주변광 환경에서 지각 불가** — `#FAFAFA`(2%)·`#F5F5F5`(4%) 는 OLED/고밝기 LCD에서 flatten. `--tbl-zebra-bg` 는 `#E5E7EB`(gray-200, 10%) 유지. 더 낮추려면 DevTools 로 Weber 대비 확인 후.
- 증상 감별: 화면 dim(캡처 overlay, 절전 전이) 때만 보이면 색상 대비 문제. 부모 bg 따라 탭마다 차이나면 odd 명시 누락.

### 주문 등록 장바구니 row 생성기 5곳 동기화 함정 (v3.4.67+)
주문 등록 폼의 `#cart-items-body` 에 행을 삽입하는 코드가 **5곳에 흩어져 있음**. 컬럼 추가/삭제 시 5곳 모두 수정하지 않으면 `colspan` 어긋나 빈 메시지 깨지거나 신규 컬럼 누락:
1. `features/orders/orderForm.js#addQuickProductToCart` — 퀵상품 패널 클릭 시
2. `features/orders/orderForm.js` (라인 ~1714) — 상품 검색 결과 클릭 시 (`removeCartItem` 사용)
3. `features/orders/orderForm.js#window.addToCart` (라인 ~2353) — 외부 호출용 (`removeFromCart(this)` 사용)
4. `features/orders/orderUI.js#addItemToCartDirectly` — 주문 수정 시 기존 아이템 복원
5. `features/orders/orderUI.js` 빈 메시지 행 (`colspan="6"`) — items 비어있을 때

**컬럼 변경 체크리스트**: ① 헤더 `<th>` (`orderFormMinimalLayout.js`) ② tfoot `colspan` ③ 위 5개 row 생성기 ④ `ensureCartEmptyRow` 의 `thCount` 자동 감지는 OK ⑤ 빈 메시지 selector 는 `tr td[colspan="6"], tr td[colspan="5"]` 처럼 양방향 호환으로 작성 (구버전 캐시 대응).

### 전화번호 포맷터(`utils/formatters.js#formatPhone`) 함정
- **9자리 분기는 `!startsWith('0')` 가드 필수** — leading 0 누락된 서울 02 표기(`27771234`)만 보정 목적. 가드 없으면 모바일 입력 중간 상태 9자리(`010000000`)에 다시 `0` prepend → `001-000-0000` 변형 (v3.4.64 수정).
- **10자리 분기는 02 vs 모바일 분리** — `02-XXXX-XXXX`(서울) vs `0XX-XXX-XXXX`(지방·구형 모바일). `startsWith('02')` 체크 필요.
- **`oninput` 콜백에서 호출 시 입력 중간 단계 보존** — 알 수 없는 길이는 원본 그대로 반환 (`return phone`). 사용자 타이핑 흐름 깨지 않도록.
- **지역 전화번호 인식 범위** — `parseSmsText` 의 phoneRe 도 `(0\d{1,2})` 로 모바일+서울+지방 통합 (v3.4.65). 모바일만 검출하던 `(01[016789])` 패턴 사용 금지.

### 재고 0 (품절) 상품 차단 정책 (v3.4.74+)
주문 등록 폼에서 품절 상품 일관 처리:
- **퀵상품 카드** (`loadQuickProductsForMinimal`): `stock <= 0` → 빨강 테두리(`var(--danger)`) + 빨강 배경(`var(--danger-bg)`) + opacity 0.55, onclick 으로 alert 안내 표시 (실제 추가 차단)
- **상품 검색 드롭다운** (`searchProducts`): 동일 시각 처리 + onclick 차단 + 안내 alert
- **`addProductToCart`**: 재고 0 진입 시 `confirm()` 다이얼로그로 사용자 동의 받음 → 사전예약·재입고 후 처리 같은 특수 케이스만 우회 허용
- **검색 드롭다운 카테고리 컬럼 제거**: `<span class="search-result-cat">` 를 v3.4.74에서 삭제 — 학명(그랩토페들럼·크라슐라·포퀘리아 등)이 농장 사용자에게 의미 없고 가독성만 해침

### 농장 로고 업로드 함정 (v3.4.77+)
이미지 업로드 처리에서 발견된 3중 흐릿함 원인 — 향후 다른 이미지 업로드 작업에도 동일 패턴 적용:
1. **JPEG 변환 + 80% 압축 금지** — 투명 PNG 로고는 JPEG 로 변환 시 알파 채널 사라지고 80% 압축 노이즈로 색감 흐려짐. **PNG 무손실** 사용 (`canvas.toBlob(b, 'image/png')`)
2. **정사각형 강제 늘림 금지** — `drawImage(img, 0, 0, size, size)` 가 가로·세로 다른 이미지를 늘려서 왜곡. **비율 유지** 필수: `Math.min(maxSize/w, maxSize/h, 1)` 로 ratio 계산 → `canvas.width = w * ratio`
3. **imageSmoothingQuality = 'high'** 설정 — 기본 smoothing은 저품질, 고품질 옵션으로 텍스트·선 선명도 확보
4. 사이드바 로고 박스 — 로고 모드일 때 `bg-emerald-500` (초록) → 흰 배경(`var(--bg-white)`)으로 자동 전환 필수. 투명 PNG 로고에 초록 비치는 문제. `applySidebarLogo` (header.js) 와 `_handleFarmLogoSelect` (settingsUI.js) 두 곳 동시 적용

### JS 검색 필터 빈 문자열 함정 (v3.4.83+)
**`''.includes('')` 는 항상 true** — JS 특성. OR 조건 검색에서 한쪽이 빈 문자열로 떨어지면 모든 항목이 통과되어 **필터 무력화**.

사례: 고객명 검색에서 한글 "정진경" 입력 →
```js
(c.phone||'').replace(/\D/g,'').includes(term.replace(/\D/g,''))
// term.replace(/\D/g,'') → '' (한글에는 숫자 없음)
// '01012345678'.includes('') === true → 모든 고객 통과
```

**해결 패턴**: 정규식으로 추출한 부분 검색어가 빈 문자열인지 가드 후 매칭.
```js
const termDigits = term.replace(/\D/g, '');
const phoneMatch = termDigits.length > 0 && phone.includes(termDigits);
```

**적용 영역**: 한글·영문 혼합 OR 검색이 있는 모든 곳 — 고객·상품·주문 검색 등. 새 검색 함수 작성 시 빈 문자열 가드 의식적으로.

### 한글 유사도 검색 (오타 대응) — `findSimilarProducts` 패턴 (v3.4.87+)
한글 한 글자 차이("비얀트" vs "비안트")로 ilike 검색 0건일 때 "혹시 이거?" 제안:

```js
function _toChosung(s) { /* 한글 → 초성(자모) ㅂㅇㅌ */ }
function _similarity(a, b) { /* 글자 집합 교집합 / 합집합 */ }
const score = nameSim * 0.5 + choSim * 0.3 + runBonus * 0.2;
return scored.filter(x => x.score >= 0.5).sort(...).slice(0, limit);
```

- 글자 단위 50% + 초성 단위 30% + 부분 일치 20%
- 임계값 ≥ 0.5 만 통과 → 오용 방지
- `productDataManager` 캐시 사용 (DB 추가 호출 없음)
- 다른 한국어 검색(고객명 오타·카테고리)에도 동일 함수 재사용 가능

### 주문 등록 중 신규 상품 즉시 등록 패턴 (v3.4.85+)
주문 폼 떠나지 않고 카탈로그에 없는 상품 즉시 등록 → 라이브·문자 주문 폭주 처리에 필수:

`openQuickAddProductModal(initialName)` 표준 흐름 (orderForm.js):
1. 검색 결과 0건 시 "<검색어> 신규 상품 등록" 버튼 노출
2. 클릭 → 미니 모달 (이름·가격·재고·무료배송 체크박스)
3. INSERT → `productDataManager.farm_products` 캐시 즉시 push (다음 검색 반영)
4. `addQuickProductToCart` 로 카트 자동 추가
5. 검색창 초기화 + 포커스 복귀
6. 퀵상품 패널 재계산

이 패턴을 다른 "선택 중 즉시 등록" 케이스에도 동일 적용 가능 — 신규 카테고리·신규 SMS 템플릿 등.

### 주문 폼 퀵 상품 카드 CSS 충돌 함정 (v3.4.84+)
2줄 flex 카드와 CSS 파일의 텍스트 자르기 옵션이 충돌:
- `.xf-quick-grid` 클래스에 CSS 미정의 → grid 레이아웃 안 됨, 인라인 흐름으로 흩어짐 → `display:grid; grid-template-columns:repeat(3, minmax(0,1fr))` 명시
- `#quick-product-buttons button` 의 `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` 가 카드 내부 다중 줄 텍스트를 가로로 잘라버림 → 버튼은 `white-space:normal` 로 해제, 상품명 줄만 `.truncate` 클래스로 한 줄 처리
- 패턴: 컨테이너 클래스에 CSS 정의 명시 + 인라인 flex 와 충돌하는 외부 CSS 식별·해제

### 환경설정 항목 삭제 — 영향 범위 마이그레이션 패턴 (v3.4.80+)
환경설정의 동적 배열 항목(주문상태·배송방법·고객등급·SMS 템플릿 등) 삭제 시 **DB 잔존 데이터 처리** 필요. 단순 splice 만 하면 기존 데이터가 그대로 남아 화면에 잔존 표시.

**표준 패턴** (`deleteOrderStatus` 가 레퍼런스 구현, settingsUI.js):
1. 삭제 전 영향 범위 카운트 — `supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, value)`
2. 0건이면 단순 confirm 후 splice
3. N건이면 모달 표시 — "어디로 옮길지" 드롭다운 (남은 항목들) → 사용자 선택
4. DB 일괄 UPDATE → settings splice → 관련 UI 모두 새로고침 + 토스트 안내
5. 마지막 1개 항목은 삭제 차단 (전체가 비면 시스템 깨짐)

이 패턴을 다른 설정 항목 삭제(고객등급·배송방법 등)에도 동일 적용 가능. 새로 작성하지 말고 `window.deleteOrderStatus` 코드 참조하여 복제.

### 브라우저 탭 favicon 동기화 (v3.4.74+)
환경설정 농장 로고(`farm.logoUrl`) 가 브라우저 탭 favicon + apple-touch-icon 으로 자동 적용:
- 진입점: `components/header/header.js#applySidebarLogo` 가 `applyFavicon(url)` 호출
- `applyFavicon`: 기존 `link[rel*="icon"]` 모두 제거 후 새 link 삽입, 확장자(.png/.svg/.jpg/.ico)로 type 자동 감지
- `document.title` 도 `${farm.name} - 관리시스템` 으로 동기화
- 적용 시점: 페이지 로드 1.5초 후 (settingsDataManager 초기화 대기) + 탭 전환(`tabChanged` 이벤트) 시 재적용

### 송장번호 엑셀 업로드 (로젠택배 결과 파일) 구조 (v3.4.66+)
로젠택배 「출력완료」 엑셀 파일 (`주문등록_출력(복수건)_출력완료(N)건 (YYYY-MM-DD HHMM시MM분SS초).xlsx`):
- **Row 0**: 파일 제목 단일 셀 (병합)
- **Row 1**: 상위 헤더 그룹 (`수하인`·`송하인` 같은 묶음 라벨) — `운송장번호`·`주문번호` 라벨 포함
- **Row 2**: 서브 헤더 (이름/주소/전화 등 구체 컬럼) — 이 행에도 `운송장번호`·`주문번호` 그대로 표기
- **Row 3+**: 데이터

**핵심 컬럼**: C4=`운송장번호`, C19=`주문번호`(우리 DB의 `farm_orders.order_number` 와 동일 포맷, 예: `ORD-260428-1V0L`), C7~C11=수하인 정보, C23~C27=송하인 정보, C13=`택배운임`, C14=`운임구분`(선불/착불).

**파서 전략** (`uploadTrackingExcel` 참고): 헤더 자동 탐지 — 상위 12행 스캔하여 `(운송장|송장)\s*번호?` + `주문\s*번호` 둘 다 가진 첫 번째 행을 헤더 행으로 채택, 그 다음 행부터 데이터. 다른 택배사(CJ·한진) 파일도 비슷한 라벨 사용하므로 동일 파서 재사용 가능.

### 환경설정 데이터 구조 (farm_settings, Supabase)
- 모든 환경설정은 Supabase `farm_settings` 테이블(id=1)의 `settings` JSONB 컬럼에 단일 JSON 으로 저장
- 최상위 키: `farm`(`name`/`owner`/`phone`/`address`/`email`/`businessNumber`/`bankName`/`bankAccount`/`bankHolder`/`logoUrl`/`sidebarTitle`/`sidebarSubtitle`), `shipping`(`defaultShippingFee`/`freeShippingThreshold`/`remoteAreaShippingFee`/`shippingMethods`/`logenShippingFee`/`logenFreightType`), `orderStatuses`(배열), `customerGrades`(배열), `smsTemplates`, `smsConfig`, `gradePeriod`, `system`
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
| `shipping.logenShippingFee` | 로젠택배 엑셀 내보내기 운임 | `order-management.js#exportLogenExcel()` — 기본값 3800원 (v3.3.80) |
| `shipping.logenFreightType` | 로젠택배 엑셀 운임구분 | 같은 함수 — 10=선불, 20=착불 (v3.3.80) |
| **배송관리 상태 전이** | `shippingManager.js` 등 | **부분 연동** — 색상 매핑은 `renderOrderStatusBadge` 중앙 통합 완료(v3.3.67). 자동 전이(`'배송시작'`/`'배송중'` 하드코딩)·필터 배열·상태 탭은 택배 API 연동 전까지 하드코딩 유지 |

### `initSettingsEventListeners()` 함정 (never-called)
- `features/settings/settingsUI.js:572` 에 정의, `window.initSettingsEventListeners` 로 export 되었으나 **호출처 없음**
- 환경설정 탭의 버튼 리스너(`add-order-status-btn`, `add-customer-grade-btn`, `save-grade-period-btn` 등)가 이 함수 안에 갇혀 있었음
- **해결 패턴**: 각 탭 load 함수(`loadOrderStatuses`, `loadCustomerGrades`) 내부에서 `dataset.listenerAdded` guard 후 개별 바인딩 (기존 동작하는 `add-channel-btn`·`recalculate-all-grades-btn` 과 동일 패턴)
- 새 환경설정 버튼 추가 시: `initSettingsEventListeners` 에 넣지 말고 **해당 탭의 `loadXXX()` 함수 안에서 guard 바인딩**할 것

### 바코드 관련 함수 위치 (v3.3.156+)
- `openBarcodePrintModal`, `printBarcodeLabels`, `openBarcodeScanner`, `stopBarcodeScanner`, `processBarcodeResult` — **`components/product-management/product-management.js`** 맨 아래 전역 등록
- 과거 `product-management.html` 의 `<script>` 블록에 있었으나 `innerHTML` 로드 시 미실행 문제로 이전 (v3.3.156). HTML `<script>` 블록에 이 함수들 재삽입 금지.

### Payhere 내보내기 카테고리 매핑 규칙 (v3.3.157+)
- `exportProducts()` 내 `payhereCategory(c)` 함수: 식물 속명(그랩토페들럼·두들레야·에오니움·에케베리아·코노피튬·크라슐라·포퀘리아) → `'다육이'`, `'화분'` → `'화분'`, 나머지(용토·기타 등) → `'기타'`
- 새 카테고리 추가 시 이 매핑 함수도 함께 업데이트할 것

### 상품 테이블 렌더링 이중 경로 주의
- `features/products/productUI.js` 의 `renderProductsTable` / `PRODUCT_TABLE_COLUMNS` — **활성 코드** (과거 "Dead Code" 기록은 오래되어 부정확)
- `components/product-management/product-management.js` 의 `createProductRow` — 동적 로드 시 사용
- 두 경로가 공존하며 각각의 사용 시점이 다름. 상품 테이블 수정 시 **양쪽 모두 확인**

### 루트 디버그/테스트 파일
- 프로덕션에서 참조되지 않는 루트 debug/test HTML·JS 25개는 `archive/dev-tools/` 로 이동 완료 (v3.3.41)
- `inventory-modal.html`, `allowed-users-management.html`, `system-admin.html` 은 기능성 이름이라 보류

### 빌드·배포 시스템 (v3.3.58+)
**dist/ 는 자동 생성물. 절대 수동 편집 금지.**

워크플로우:
```bash
npm run sync      # 소스 → dist/ 화이트리스트 기반 복사
npm run check     # dist/ 안전성 검증 (금지 패턴 스캔)
npm run build     # sync + check 원샷
npm run deploy    # build + firebase deploy
```

**`sync-to-dist.js` 화이트리스트 정책**:
- `ALLOW_FILES` / `ALLOW_DIRS` 에 명시된 항목만 dist/ 에 복사됨
- 새 파일·폴더 추가 시 이 리스트에 명시적으로 등록 필요
- 블랙리스트가 아니므로 `server.js`·`*.bat`·`.env` 등은 구조적으로 유출 불가

**`pre-deploy-check.js` 2차 방어선**:
- dist/ 전수 스캔, 금지 경로 패턴 + 비밀 추정 내용 패턴 탐지
- 위반 건 감지 시 exit 1 → 배포 자동 중단

**이전 구조(수동 관리) 제거된 함정**:
- `"build": "node deploy-to-web.js"` → 파일 부재로 작동 안 하던 것 → 정상 작동하는 sync+check 로 대체
- `deploy-to-production.js` 는 **브라우저 런타임 전용** (여전히 Node CLI 빌드 아님, 무관)
- 과거 `dist/` 는 수동 편집되어 2개월 drift 누적 → 이제 소스가 진리, dist 는 파생물

**Firebase 설정**:
- `firebase.json` 의 `hosting.ignore` 에 `server.js`·`*.bat`·`*.sh`·`*.sql`·`.env*` 등 3중 방어 추가
- 화이트리스트(sync) + 패턴 스캐너(check) + Firebase ignore 3중으로 실수 유출 차단

## GitHub
- https://github.com/da6262/sucplant
