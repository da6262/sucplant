# 경산다육식물농장 관리시스템

> White Platter 전문 농장의 주문 · 재고 · 고객을 한 화면에서 관리하는 웹 애플리케이션

[![version](https://img.shields.io/badge/version-v3.3.26-brightgreen)](https://github.com/da6262/sucplant)
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
| ⚙️ **환경설정** | 농장 정보, 배송 설정, 판매 채널, 주문 상태, 고객등급, SMS 템플릿 |

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
│   ├── ui.js          # Standard Form Renderer (16종) — renderModal · renderField · renderBadge · renderBtnIcon 등
│   └── formatters.js  # formatDate · formatPhone · formatCurrency
│
└── styles/
    └── index-inline.css           # 디자인 시스템 (CSS 변수 중앙 제어)
```

---

## UI 통제소 (본진 · Single Source of Truth)

### 🏛 **본진 = `styles/index-inline.css`**

시스템 디자인의 **모든 결정**(색상·여백·폰트·테이블·뱃지·모달·폼)은 이 파일 한 곳에 저장. **여기만 수정하면 전 페이지가 동시에 바뀐다.**

**예:** "초록색을 더 진하게" 요청 시 → `--primary: #16A34A` → `#0F7A36` 한 줄 변경 → 버튼·탭·뱃지·테이블 헤더 모든 초록이 즉시 반영.

### 🔀 역할 분리 — 본진 vs Tailwind

두 시스템이 **각자의 영역만** 담당해야 통제권 유지됨:

| 영역 | 도구 | 예시 |
|---|---|---|
| **브랜드·색상·컴포넌트** | 본진(`styles/index-inline.css`) | `var(--primary)`, `.btn-primary`, `.badge-success`, `.table-ui` |
| **레이아웃·간격·반응형** | Tailwind CDN | `flex`, `gap-2`, `px-4`, `grid-cols-12`, `md:pl-[180px]` |

**절대 금지:**
- ❌ Tailwind 색상 직접 사용: `bg-green-500`, `text-red-600`, `border-blue-400`
- ❌ 인라인 `style=` 에 색상 하드코딩: `style="color:#16a34a"`
- ❌ 브랜드 변경 목적으로 Tailwind 사용 (브랜드는 오직 본진 경유)

### 📐 CSS 변수 핵심 (`styles/index-inline.css :root`)

```css
/* 브랜드·의미 색상 */
--primary: #16A34A     --primary-hover: #15803D
--danger:  #DC2626     --info: #2563EB     --warn: #D97706

/* 텍스트 계층 */
--text-primary:   #1E293B    --text-secondary: #64748B
--text-muted:     #94A3B8    --text-amount:    #0F172A

/* 테이블 */
--tbl-row-height: 30px   --tbl-cell-py: 5px   --tbl-font-size: 13px
--tbl-grid-color: #CBD5E1 (엑셀 격자선)

/* 모양·그림자 */
--radius-sm/md/lg/xl: 4/6/8/12px
--shadow-xs/sm/md/lg
```

> **전체 토큰 목록 + 엄격 규정**은 [CLAUDE.md](./CLAUDE.md) "🎨 디자인 토큰 & UI 통제소" 섹션.

### 🧱 공통 컴포넌트 클래스

| 분류 | 클래스 |
|------|--------|
| 버튼 | `.btn-primary` `.btn-secondary` `.btn-icon` `.btn-icon-edit` `.btn-icon-delete` |
| 배지 | `.badge` + `.badge-success` `.badge-warning` `.badge-danger` `.badge-info` `.badge-purple` `.badge-neutral` |
| 테이블 | `.table-ui` `.td-primary` `.td-secondary` `.td-amount` `.td-muted` `.td-null` `.td-link` |
| 필터 바 | `.filter-bar` `.input-ui` `.btn-search` |
| 상태 탭 | `.status-tab-bar` `.status-tab-btn` `.tab-count` |
| 헤더 | `.page-header` `.action-group` |
| 모달 | `.modal-overlay` `.modal-container` `.modal-sm/md/lg/xl` `.modal-header` `.modal-body` `.modal-footer` `.modal-title` `.modal-close-btn` |
| 폼 그리드 | `.form-grid` `.form-col-4/6/12` `.form-label .req` `.form-control` `.form-helper` `.form-error` |
| 폼 입력 | `.form-input-group.with-unit` `.form-input-unit` `.form-section` `.form-section-inner` `.form-actions` |

### 🏭 표준 렌더러 (`utils/ui.js`)

16종 함수로 HTML 을 프로그램적 생성 — 모듈에서 raw Tailwind 직접 쓰지 말고 이 함수 호출:
- 레이아웃: `renderPageHeader`, `renderFilterBar`, `renderEmptyRow`, `renderModal`
- 폼: `renderField`, `renderFormSection`, `renderFormGrid`, `renderFormActions`
- 뱃지/버튼: `renderBadge`, `renderOrderStatusBadge`, `renderGradeBadge`, `renderBtnIcon`, `renderBtnGroup`, `renderEditDeleteBtns`

### ⚠️ 주의

- 루트의 `tailwind.config.js` 는 **빌드 전용 포맷이라 CDN 런타임에 반영 안 됨** (dead config). 브랜드 색상은 오직 CSS 변수 경유.

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

| 버전 | 내용 |
|------|------|
| v3.3.26 | refactor(Phase 1B 13차): 아이콘 박스용 `.bg-*-accent` 유틸 7종 신설 후 `bg-*-100` bulk 교체 — `styles/index-inline.css` 에 `.bg-info-accent`(#DBEAFE)·`.bg-success-accent`(#DCFCE7)·`.bg-warn-accent`(#FEF3C7)·`.bg-danger-accent`(#FEE2E2)·`.bg-purple-accent`(#F3E8FF)·`.bg-orange-accent`(#FFF7ED)·`.bg-sky-accent`(#E0F2FE) 추가, `--badge-*-bg` 변수 재사용. sed 로 프로덕션 전체 `bg-blue-100`→`bg-info-accent` 등 6종 일괄 교체. 주로 `analyticsDashboard.js`·`shippingManager.js` KPI 카드 아이콘 박스, 기타 배지 스타일 컨테이너. 남은 패턴: 진한 버튼(`bg-blue-600 hover:bg-blue-700`)·input border·dot indicator. 누적 Phase 1B 추정: 710+건/798건(88.9%+) |
| v3.3.25 | refactor(Phase 1B 12차): js/*.js 7파일 bulk ~167건 시맨틱 교체 — 레거시 최상위 JS 들(features 로 이관되지 않은 코드)에 동일 sed 매핑 적용. 영향: `shipping-management.js`(최다 ~62건 교체·90 잔여)·`order-management.js`(~50·48 잔여)·`customer-management.js`(~12·8 잔여)·`admin-auth.js`·`auth-system.js`·`temp-auth-bypass.js`·`supabase-integration.js` 각 소수. 잔여 148건은 `bg-*-100/200`·진한 버튼(`bg-blue-600 text-white hover:*`)·border-*·input focus ring·dot indicator 등 복합 패턴. 누적 Phase 1B: 698건/798건(87.5%) — 단순 시맨틱 교체 거의 마무리 |
| v3.3.24 | refactor(Phase 1B 11차): components/*.js 6파일 bulk ~93건 시맨틱 교체 — 직전 HTML bulk 과 동일 sed 매핑을 JS 파일에도 적용. 영향 파일: `product-management.js`(최다 46+건)·`dashboard.js`(20)·`settings.js`(5)·`sales-channels.js`(3)·`header.js`(0~4)·`navigation.js`·`waitlist-management.js`(각 1). 남은 39건은 `bg-*-100/200`·진한 버튼 Tailwind·`border-*`·조건부 클래스 문자열(`isActive ? 'bg-green-500' : 'bg-gray-300'` 등 dot indicator)·`text-*-700/800`. 누적 Phase 1B: 531건/798건(66.5%) |
| v3.3.23 | refactor(Phase 1B 10차): components/*.html **26개 파일 bulk 시맨틱 교체 약 188건** — sed 로 일괄 처리. ①`text-*` 전면 매핑: `text-gray-400/500` → `text-muted`, `text-gray-600/700` → `text-body`, `text-gray-800/900` → `text-heading`, `text-red-400/500/600` → `text-danger`, `text-blue-500/600` → `text-info`, `text-green-500/600`·`text-emerald-500/600` → `text-brand`, `text-yellow-500/600`·`text-amber-400` → `text-warn`. ②`bg-*-50` 매핑: `bg-gray-50` → `bg-section`, `bg-gray-100` → `bg-page`, `bg-blue-50` → `bg-info`, `bg-red-50` → `bg-danger`, `bg-yellow-50` → `bg-warn`, `bg-green-50`·`bg-emerald-50` → `bg-success`. 영향 파일: `picking-list-modal`(28)·`product-management`(26)·`customer-management`(26)·`order-detail-modal`(23)·`dashboard`(22)·`order-management`(21)·`sales-channels`(19)·`header`(18)·`settings`(15)·`bulk-print-modal`(12)·`common/card`(12)·`customer-modal`(8)·`common/modal`(8)·`order-receipt-modal`(7)·`common/index/form/button`(각 5~6)·`bulk-status-change-modal/packaging-labels-modal`(5) 등 26개 파일. 보류: `bg-*-100/200`(아이콘 박스·진한 배경)·`border-*`·진한 버튼 Tailwind(`bg-blue-600`)·`text-*-700/800`(뱃지 내 진한 글자)·`bg-white`(맥락 많음). 누적 Phase 1B: 438건/798건(54.9%) — 절반 돌파 |
| v3.3.22 | refactor(Phase 1B 9차): `features/shipping/shippingManager.js` 최대 규모 파일 약 68건 시맨틱 교체 — 배송관리 통합 대시보드·추적·라벨·경로최적화·알림 모든 탭. replace_all bulk: `text-gray-400/500/600/700/800` → `text-muted/muted/body/body/heading`, `text-red-600` → `text-danger`, `text-blue-600` → `text-info`, `text-green-600` → `text-brand`, `text-yellow-600` → `text-warn`. 맥락별 수동: ①개요 탭 3개 KPI 카드(`bg-blue-50/green-50/yellow-50` → `bg-info/success/warn`). ②추적 결과 3개 박스(`bg-blue-50/green-50/purple-50` → `bg-info/success` + purple 보류). ③현재 위치·배송 이력 배경 `bg-gray-50` → `bg-section` (다수). ④고객용 추적 링크 박스 `bg-yellow-50` → `bg-warn`. ⑤SMS 발송 이력·상세 스니펫·빈 상태 박스 `bg-gray-50` → `bg-section`(3~4건). 보류 약 30건: 아이콘 박스 `bg-*-100`·진한 버튼 `bg-blue-600/red-600/yellow-600/purple-600/gray-600`(hover 포함, `.btn-*` 공용화 후속)·input `border-gray-300 focus:ring-blue-500`(.input-ui 통합 후속)·`.badge` 없는 상태 배지 4종(`getStatusColor` 반환값, renderBadge 패턴으로 리팩 후속)·뱃지 내 진한 `text-*-700/800` (시맨틱 유틸 미정의)·`bg-purple-50` 보라톤(소수라 유틸 신설 보류). 누적 Phase 1B: 250건/798건(31.3%), 0 시각 회귀 |
| v3.3.21 | feat: 환경설정 배송비에 "도서산간 추가배송비"(`remoteAreaShippingFee`) 정식 도입 — 기존 잘못 네이밍된 `expressShippingFee`(당일배송비 라벨, 주문 폼 미연동 dead) 제거. ①`features/settings/settingsData.js` 기본값 추가(5000원), `components/settings/settings.html` 라벨 "당일배송 배송비"→"도서산간 추가배송비", id `express-shipping-fee`→`remote-area-shipping-fee`. ②`features/settings/settingsUI.js` + `components/settings/settings.js` load/save 경로 모두 신규 키로 교체, `SHIPPING_SETTINGS` 캐시 동기화. ③주문 폼(`features/orders/orderFormMinimalLayout.js`)의 배송비 행에 "도서산간" 체크박스 신설 — 체크 시 `_shippingFeeUserEdited=false` 로 재계산 트리거, 제안 배송비 = 기본배송비(또는 무료배송 기준 충족 시 0원) + 도서산간 추가금. 무료배송 기준이어도 도서산간 추가금은 별도 부과(한국 택배 표준 관행). ④`features/orders/orderForm.js` 3개 재계산 지점(`refreshOrderTotal` L270~, `updateCartTotal` L787~, L2466~) + `SHIPPING_SETTINGS` 전역 초기화/로드 경로 4곳 모두 `remoteAreaShippingFee` 반영. ⑤`features/orders/orderUI.js#clearOrderForm` 에 체크박스 리셋 추가. 레거시 `js/order-management.js`(독립 `shipping_settings` DB 테이블 쓰는 별도 서브시스템) 은 범위 외로 보존 |
| v3.3.20 | refactor(Phase 1B 8차): `features/customers/customerUI.js` 30건 시맨틱 교체 — 고객관리 UI. replace_all 로 bulk 처리: `text-gray-400` → `text-muted`, `text-gray-600` → `text-body`, `text-gray-900` → `text-heading`, `text-red-400/500/600` → `text-danger`, `text-yellow-600` → `text-warn`. 맥락별 수동: ①삭제 모달 안내 `text-gray-500` → `text-muted`, 본문 thead `bg-gray-50` → `bg-section`. ②주문 이력 빈 메시지 `text-gray-500` → `text-muted`(2곳), 상세보기 링크 `text-emerald-600` → `text-brand`. ③VIP 아이콘 `text-yellow-600` → `text-warn`(2곳), 일반 고객 아이콘 `text-green-600`/`text-blue-600` → `text-brand`/`text-info`. ④자동완성 아이템 보조 텍스트 `text-gray-500` → `text-secondary`. 보류 23건: checkbox `focus:ring-red-400`·아이콘 박스 `bg-red-100` 3건·`ring-emerald-500` classList toggle·자동완성 `hover:bg-blue-50` Tailwind variant·선택행 `bg-blue-50 border-blue-200` classList·검색 하이라이트 `bg-yellow-200`·상태 ACTIVE/INACTIVE/SUSPENDED toggle 배열(9건) 각 on/off 세트·`text-gray-300` 아이콘 연한톤·구분선 border. 누적 Phase 1B: 182건/798건(22.8%), 0 시각 회귀 |
| v3.3.19 | refactor(Phase 1B 7차): `features/settings/settingsUI.js` 33건 시맨틱 교체 — 환경설정 페이지 반복 리스트 패턴 일괄 정리. ①탭 토글 로직(L17/30) classList `text-gray-500` → `text-muted`. ②SMS 템플릿 리스트(L129/130/134): 라벨 `text-gray-800` → `text-body`, 프리뷰·변수 표기 `text-gray-400` → `text-muted`, 상세 박스 `bg-gray-50` → `bg-section`. ③고객등급 리스트(L303/313/314/315/316/317): 빈 메시지 → `text-muted`, 등급명 → `text-body`, 금액·할인율 → `text-secondary`, 액션 버튼 기본색 → `text-muted`. ④판매채널 리스트(L437/443/454/455/456/457/458/465): 안내·빈 메시지 → `text-muted`, 채널명 → `text-body`, 설명 → `text-muted`, 오류 메시지 `text-red-500` → `text-danger`. ⑤주문상태 리스트(L515/516/517/518): 동일 패턴. ⑥고객등급 편집 모달(L971/972/978/983/988/993/998): 제목 `text-gray-800` → `text-heading`, 닫기 `text-gray-400` → `text-muted`, 라벨 `text-gray-700` → `text-body` (5건). 보류 15건: 탭 활성 `border-blue-500 text-blue-600` HTML 초기값(remove 전제)·list 구분선 `border-gray-100`·chevron `text-gray-300`·`bg-green-500/bg-gray-300` 조건부 dot indicator·버튼 `hover:text-blue-500/red-500` Tailwind variant·input 복합(`border-gray-300 focus:ring-blue-500`)·취소/저장 버튼. `replace_all` 로 일괄 교체(text-gray-400/700/800 각 배치) 후 맥락별 수동 조정. 누적 Phase 1B: 152건/798건(19.0%), 0 시각 회귀 |
| v3.3.18 | refactor(Phase 1B 6차): `features/orders/orderData.js` 23건 시맨틱 교체 — 주문 테이블 전체. ①빈 상태·오류 메시지(L740/743/744/763/1032): `text-red-600/500` → `text-danger`, `text-gray-500` → `text-muted`, `text-amber-400` → `text-warn`. ②일괄 작업 바(L827/844~853 top 바, L1580/1591~1592 활성 바): `bg-gray-50`·`bg-blue-50` → `bg-section`·`bg-info`, 라벨·카운트 `text-gray-700/600` · `text-blue-600` → `text-body` · `text-info`. ③테이블 행(L1000): D-day 경고 `text-red-600` → `text-danger`. ④상태 편집 드롭다운(L1008) `bg-white` → `bg-card`. ⑤인쇄·SMS 상태 토글(L1016/1019) `text-gray-600` → `text-body` (hover:text-blue-600/green-600 Tailwind variant 보류). ⑥환불 모달 제목 아이콘(L1327) `text-red-500` → `text-danger`. ⑦일괄 상태 변경 모달(L1781/1782/1788/1789/1799/1800) 제목·닫기·안내·카운트·옵션 라벨·설명 전부 시맨틱화. 보류 16건: 일괄 버튼 진한 파랑/빨강/회색(`bg-blue-600 hover:bg-blue-700` 등 3세트 × 2위치)·checkbox `text-green-600 focus:ring-green-500`·조건부 drop-down Tailwind variant·toast `bg-green-500/red-500/blue-500`·`animate-spin border-blue-600`·border 색상 다수. 누적 Phase 1B: 119건/798건(14.9%), 0 시각 회귀 |
| v3.3.17 | refactor(Phase 1B 5차): `features/shipping/analyticsDashboard.js` 29건 교체 — 배송 성과 분석 대시보드 전체 시맨틱화. ①헤더(h2/p) `text-gray-800/600` → `text-heading/body`. ②핵심 지표 4개 KPI 카드: 총 배송(파랑)·완료율(초록)·평균시간(노랑)·지연률(빨강) 각각 `bg-{c}-50` → `bg-info/success/warn/danger`, 아이콘·값 `text-{c}-600` → `text-info/brand/warn/danger`, 라벨 `text-gray-600` → `text-body` (4세트 × 3건 = 12건). ③차트 카드 2개(일별 현황·택배사 성과)·상세 통계 박스 `bg-gray-50` → `bg-section`, `text-gray-800` → `text-heading` (6건). ④상세 통계 테이블 `thead bg-gray-100` → `bg-page`, `tbody bg-white` → `bg-card`, 행 셀 `text-green-600`·`text-red-600`·`text-blue-600` → `text-brand/danger/info` (5건). 보류 4건: 아이콘 박스 `bg-*-100`(--badge-*-bg 와 매핑되나 전용 `.bg-*-accent` 유틸 부재 — 후속 유틸 신설 시 일괄 교체). 누적 Phase 1B: 96건/798건(12.0%), 0 시각 회귀. 이 파일은 KPI 카드 반복 구조로 한 번에 큰 덩어리 교체 가능한 첫 번째 "규칙적" 파일 |
| v3.3.16 | refactor(Phase 1B 4차): `features/orders/orderSearch.js` 16건 교체 — 주문 모달 내 고객 검색 드롭다운(L29/30/39/43 — 고객명·연락처·신규 등록 유도 레이블·안내), 상품 검색 결과(L129/141/145/146/147 — 안내 문구·이미지 placeholder 아이콘·상품명·가격·재고), 선택된 상품 표시(L190/193/194/195/199 — placeholder 아이콘·상품명·가격·추가 확인 텍스트·체크 아이콘), 장바구니 삭제 아이콘(L276) 및 빈 장바구니 메시지(L440) 전부 시맨틱 시스템으로: `text-gray-900`→`text-heading`·`text-gray-500/400`→`text-secondary`/`text-muted`·`text-blue-600`→`text-info`·`text-green-600`→`text-brand`·`text-red-600`→`text-danger`. 보류 14건(Tailwind `hover:bg-*` variant·`border-blue-200`·`bg-blue-600 text-white hover:bg-blue-700` 진한 파랑 버튼·`bg-gray-200` placeholder·`bg-green-50 border-green-200` 동적 toggle·`bg-red-200 hover:bg-red-300` mini trash·`border-gray-300` input·DOM selector `.text-xs.text-gray-500` 2곳 L370/474). 누적 Phase 1B: 67건/798건(8.4%), 0 시각 회귀 |
| v3.3.15 | refactor(Phase 1B 3차): Tailwind 색상 → 시맨틱 유틸 30건 교체 — 3파일 처리. ①`features/orders/orderSMS.js` 9건: SMS 모달 h3 `text-gray-900` → `text-heading`, 라벨 `text-gray-700` → `text-body`(2건), 커스터머 SMS 모달 `text-emerald-500`·`text-gray-600 bg-gray-50`·`text-gray-400`(3건) → `text-brand`·`text-body bg-section`·`text-muted`. ②`features/shipping/routeOptimizer.js` 12건: 배송 경로 카드 헤딩·거리·시간 박스·순서 제목·정류장 리스트 전체 시맨틱화(`text-gray-800`→`text-heading`, `bg-blue-50 text-blue-600`→`bg-info text-info`, `bg-green-50 text-green-600`→`bg-success text-brand`, `bg-gray-50`→`bg-section`, 나머지 gray → heading/body/secondary). ③`features/waitlist/waitlistUI.js` 9건: 고객 제안 드롭다운 아이콘·이름·연락처 gray → muted/heading/secondary, 신규 등록 유도 섹션 orange 톤 6건(2군데 중복 패턴) `text-orange-500/600/700` → `text-warn` 통합. 보류: Tailwind hover:/border-orange-200/checkbox 전용·DOM selector(L155/284/292/715/732/765/896 등). 누적 Phase 1B: 51건/798건(6.4%), 0 시각 회귀 |
| v3.3.14 | refactor(Phase 1B 2차): Tailwind 색상 → 시맨틱 유틸 점진 교체 16건 추가 — `styles/index-inline.css` 에 `.text-secondary` 유틸 보강(신규 `.text-*` 패밀리 11종 체계 완성). 3파일 교체: ①`features/orders/orderForm.js` 4건(readonly 입력 배경 `bg-gray-100` → `bg-page` — 고객 선택 시 이름·연락처·주소·상세 입력 모두). ②`features/products/productUI.js` 5건(상품 검색 자동완성 드롭다운 이름·카테고리·가격 `text-gray-900/500/600` → `text-heading/secondary/secondary`, 수익률 표시 `text-green-600` → `text-brand`, 매입가 안내 `text-gray-500` → `text-secondary`). ③`features/shipping/shippingUI.js` 7건(배송 상태 6종 배지 + default 을 Tailwind 색상쌍 → 시맨틱 `badge-*` variant 로 통합: 주문접수→warning·입금확인→success·배송준비→orange·배송시작→purple·배송완료→sky·주문취소→neutral). 보류 9건(DOM selector·Tailwind hover:variant·checkbox 전용 스타일)은 후속 처리 — 공용 `.product-checkbox` CSS 정의 후 일괄 교체 예정. 누적 Phase 1B 교체: 21건/798건(2.6%), 0 시각 회귀 |
| v3.3.13 | refactor(Phase 1B 시작): Tailwind 색상 하드코딩 → 시맨틱 유틸리티 교체 착수 — `styles/index-inline.css` 에 시맨틱 텍스트 컬러 유틸 10종 신설(`.text-brand/-hover`·`.text-info`·`.text-danger`·`.text-warn`·`.text-heading`·`.text-body`·`.text-muted`·`.text-amount`·`.text-null-soft`). `:root` CSS 변수 기반으로 매핑되어 브랜드 변경 시 단일 지점 제어 가능. 검증 묶음으로 소형 파일 2개 교체: `features/categories/categoryUI.js`(신규 카테고리 추가 옵션 `text-blue-600` → `text-info`), `features/orders/orderUI.js`(장바구니 빈 상태·고객 readonly 배경·삭제 아이콘 `text-gray-500`/`bg-gray-50`/`bg-white`/`text-red-600` → `text-muted`/`bg-section`/`bg-card`/`text-danger`, 4건). Phase 1B 전체 목표: 프로덕션 JS·HTML 798건의 `bg-red-200` 같은 원시 Tailwind 색상 클래스를 CSS 변수 기반 시맨틱 이름으로 점진 교체해 브랜드 통제권 회복. 후속: orderUI.js L482 mini-trash(`bg-red-200 hover:bg-red-300`) 는 `.btn-trash-mini` 공용 유틸 신설 후 일괄 처리 예정 |
| v3.3.12 | refactor: Tailwind 임의 폰트 크기(`text-[Npx]`) 시맨틱 클래스화 — `styles/index-inline.css` 폰트 스케일에 `.text-3xs(9px)`·`.text-2xs(10px)` 신규 추가(기존 `.text-xs(11px)`/`.text-sm(12px)`/`.text-base(13px)` 와 연속). 프로덕션 파일 56건 일괄 교체: `text-[11px]`→`text-xs` 27건, `text-[10px]`→`text-2xs` 23건, `text-[9px]`→`text-3xs` 6건. 영향 파일 10개(`dashboard.html`·`header.html`·`order-management.html`·`order-detail-modal.html`·`sales-channels.html`·`product-management.js`·`orderData.js`·`settingsUI.js`·`settings.js`·`shipping-management.js`). 효과: 임의값 브래킷 구문 제거로 본진(`styles/index-inline.css`) 단일 제어, 작은 글자 크기 정책 변경 시 한 줄 수정으로 전 파일 반영. 남은 Tailwind 임의값은 컬럼 너비(`min-w-[Npx]`)·사이드바 오프셋(`md:pl-[180px]`)·절대 위치 등 개별 특수 케이스로 정당 유지 |
| v3.3.11 | refactor: `border-radius` 하드코딩 일괄 변수화 — 프로덕션 파일 28건 `Npx` → `var(--radius-*)` 교체. `features/orders/orderForm.js` 11건(4/6/8px → sm/md/lg), `features/customers/customerUI.js` 7건(6/8/10px → md/lg/lg), `components/customer-management/customer-modal.html` 5건, `components/settings/settings.css` 3건, `features/orders/orderFormMinimalLayout.js`·`components/modals/waitlist-modal.html` 각 1건. 정당 예외 4건 유지: 뱃지 pill `9px`(header·orderFormMinimalLayout 2건 — `--radius-*` 스케일에 없는 의도적 pill 반경), 스크롤바 thumb `3px`(order-modal — 마이크로 radius 특수), 프린트 템플릿 `6px`(orderPrint — 격리된 print HTML 에 CSS 변수 cascade 안 함). 의미: 모서리 둥글기 전 프로젝트 `--radius-sm/md/lg/xl/full` 스케일로 통일 → 변경 시 `:root` 한 곳만 수정 |
| v3.3.10 | docs: CLAUDE.md 데이터베이스 섹션에 "DB 쿼리는 `window.supabaseClient` 로만 접근 (`window.supabase` 금지)" 영속 규칙 추가. `window.supabase` 가 초기화 경로에 따라 라이브러리 namespace 이거나 client 이거나 타이밍 의존적이라는 함정과 v3.3.9 수정 사례를 명시 — 향후 데이터 매니저 추가 시 동일 실수 재발 방지 |
| v3.3.9 | fix: 상품관리 카테고리 모달 "기존 카테고리" 빈 표시 + 저장 실패 근본 수정 — ①`features/categories/categoryData.js` 전역에서 사용하던 `window.supabase` (라이브러리 객체) 를 `window.supabaseClient` (Supabase 클라이언트 인스턴스) 로 9곳 모두 통일. 기존 참조 혼재로 `index.html:1076` inline init 경로(봉인 `window.supabaseClient` 만 설정) 에서는 `window.supabase.from(...)` 호출이 라이브러리 namespace 에 `.from()` 이 없어 실패, `supabase-config.js` 가 override 할 때까지의 timing 창에서 load/add/update/delete 전부 silent fail. 이제 어느 init 경로든 항상 client 참조. ②`features/categories/categoryUI.js` `loadCategoriesList` 에 on-demand 초기화 fallback 추가 — main.js 의 outer catch 로 빠져 `window.categoryDataManager` 가 미설정된 경우 `window.CategoryMgmt.init()` 즉시 호출로 복구. 3단 방어(manager 존재→init→여전히 없으면 빈 렌더) 로 모달이 블랙박스로 안 보이던 증상 제거 |
| v3.3.8 | refactor+docs: UI 통제소 프레이밍 + 하드코딩 색상 일괄 변수화 — ①README 의 "디자인 시스템" 섹션을 **"UI 통제소(본진·Single Source of Truth)"** 로 리네이밍·확장. `styles/index-inline.css` 가 **본진** 임을 명시, 본진(브랜드·색상·컴포넌트) vs Tailwind(레이아웃·간격·반응형) 역할 분리 원칙 및 금지 사항(`bg-green-500` 같은 Tailwind 색상 사용·인라인 `style=` 색상 하드코딩·브랜드용 Tailwind 금지) 강조. 오래된 값(`--tbl-cell-py:4px`→5px, `--tbl-font-size:12px`→13px) 바로잡음, 누락 토큰(`--danger/info/warn/text-*/radius-*/shadow-*`) 추가. `tailwind.config.js` dead-config 경고 기록(빌드 전용 포맷이라 CDN 미반영). ②`CLAUDE.md` 디자인 토큰 섹션 맨 앞에 역할 분리 원칙 추가. ③프로덕션 파일의 브랜드 색상 하드코딩 일괄 변수화: `customer-modal.html`(탭·통계 `#16a34a/#2563eb/#d97706/#374151/#6b7280` → `var(--primary)/var(--info)/var(--warn)/var(--text-body)/var(--text-secondary)`), `product-modal.html`·`product-management.html`(카테고리 빠른추가 `#2563eb`→`var(--info)`), `order-management.html`(일괄삭제 `#dc2626`→`var(--danger)`), `settings.css`(hover `#dc2626`/`#fef2f2`→`var(--danger)`/`var(--danger-bg)`), `customerUI.js`(삭제 버튼·탭 스타일 → `var(--danger)`/`var(--primary)`), `orderFormMinimalLayout.js`(배송지 추가 버튼·저장 hover·취소 hover → `var(--info)`/`var(--primary-hover)`/`var(--text-muted)` 등), `customer-management.js` Daum 주소 모달(테두리·배경·글자 7개 → `var(--bg-white)`/`var(--border)`/`var(--text-*)`/`var(--radius-lg)`/`var(--shadow-lg)`), `header.html` 사이드바(사용자 정보·새로고침 `#64748b`/`#94a3b8` → `var(--text-secondary)`/`var(--text-muted)`, onmouseover/out 핸들러 포함) |
| v3.3.7 | style+docs: ①주문관리 검색창 크기·배치 정돈 — `components/order-management/order-management.html` 필터 바 `flex-wrap:nowrap; overflow-x:auto` 강제로 `기간·검색·채널` 한 줄 유지(줄바꿈 방지, 좁으면 가로 스크롤). 검색창·채널 select 높이 `30px → 22px` 로 축소해 기간 빠른버튼과 시각 정렬, 검색창 `min-width:180px → width:150px` 고정, 채널 `width:auto` 로 내용 맞춤, placeholder 간결화("고객명/전화 뒷4자리"), 순서 `기간 → 검색 → 채널` 로 재배치. ②`CLAUDE.md` 커밋 워크플로우에 "내가 편집한 파일만 명시 스테이징(`git add <file>`), `git add .`/`-A` 금지, 다른 세션 modified 는 stash→push→pop 으로 분리" 규칙 추가 (다중 AI 편집기 동시 작업 시 타 세션 미커밋 변경 혼입 차단) |
| v3.3.6 | feat: 주문관리 검색 — 고객명 부분일치 또는 전화번호 뒷 4자리로 주문 필터링. `components/order-management/order-management.html` 날짜·채널 필터 바 우측에 `#order-search-input` 추가(placeholder "고객명 또는 전화번호 뒷 4자리"). `features/orders/orderData.js` 생성자에 `_searchTerm` 필드 + `setSearchTerm(term)` 메서드(200ms 디바운스) 신설, `filterOrdersByStatus` 에 검색 블록 추가 — 입력값 소문자화 후 `customer_name` 부분일치, 숫자만 추출해 `customer_phone_last4` 부분일치 OR 조건. 상태·날짜·채널 필터와 조합 적용 |
| v3.3.5 | refactor: 페이지 표시 개수 컨트롤 전역 중앙화 — 4개 탭(주문·고객·상품·대기자)에 중복되던 `<select>` 옵션·change 리스너 로직을 `utils/pageSize.js` 신규 모듈로 통합. `PAGE_SIZE_OPTIONS`(10/20/50/전체) 단일 정의, `window.PageSize.attach(selectId, onChange, initialValue)` 헬퍼 제공 (onchange 할당 방식으로 중복 리스너 자동 방지). `main.js` 에서 side-effect import 로 전역 등록. 각 탭 JS(`components/product-management/product-management.js`, `js/order-management.js`, `js/customer-management.js`, `js/waitlist-management.js`)의 기존 addEventListener/onchange 직결 코드를 `window.PageSize.attach(...)` 호출로 교체. 기본값은 탭별 유지(주문 50, 나머지 20) |
| v3.3.4 | perf+UX 5종 (주문 모달 반응성·UX 개선) — ①주문 저장 후 `새 주문` 재클릭 시 2회 클릭 필요하던 race condition **근본 수정**: `navBtn.click()` 이 이미 주문관리 탭에서도 `loadOrderManagementComponent()` 전체 HTML 재fetch 를 트리거해 그 과정에서 `add-order-btn` 이 DOM 에서 잠시 사라짐이 원인. 저장 후 현재 탭이 orders 면 `orderDataManager.loadOrders()` + `renderOrdersTable()` + 상태 탭 class 토글만 수행(섹션 HTML 무교체) ②`js/order-management.js` `loadOrderManagementComponent` 의 `innerHTML=''` 사전 비우기 + 100ms setTimeout 제거 — 섹션을 파괴 후 재생성하지 않고 fetch 완료 후 한 번에 교체 ③`settingsDataManager.loadSettings()` 메모리 캐시 도입 — 새 주문 모달 열 때마다 `farm_settings` Supabase 쿼리 반복하던 200~500ms 지연 제거 (`forceReloadSettings()` 만 DB 재조회) ④`openOrderModal` 에서 `await window.initOrderForm()` — async 함수 미await 로 폼 초기화 미완성 상태로 모달 노출되던 현상 제거, 모달 재열기 시 `setTimeout 100ms` 및 디버그용 `setTimeout 200ms` DOM 검증 제거 ⑤주문 저장 성공 `alert()` blocking 팝업 → `window.showToast()` 2.5초 자동 소멸 토스트로 교체, 임시저장 alert 도 동일 교체 |
| v3.3.3 | fix 4종 (주문 모달 UX 연쇄 개선) — ①주문 모달 X 버튼 무효화: `closeOrderModal` 이 `classList.add('hidden')` 만 할 뿐 앞서 세팅된 inline `style.display='flex'` 를 지우지 않아 Tailwind `.hidden` 보다 특이도가 높은 inline 이 이김 → `modal.style.display=''` 추가로 정리 ②주문 모달 취소 버튼 부재: `orderFormMinimalLayout.js` 저장 영역을 `.xf-actions` flex 컨테이너로 감싸고 `[취소 96px] [저장 flex:1]` 배치, `.xf-cancel-btn` 스타일(흰 배경·회색 테두리, 디자인 시스템 btn-secondary 톤) 신설 ③신규고객 저장 후 주문 모달이 좌측으로 치우치는 현상: `closeCustomerModal` 내부에 중복으로 `orderModal.style.display='flex'` 를 설정하던 코드를 `.hidden` 클래스 토글로 통일(X 버그와도 정합) ④Daum 모달 DOM 잔존 + body overflow 잔존으로 스크롤바 폭 변동 → 주문 모달 중앙 정렬 틀어짐: `handleCustomerSave` 에서 `daum-address-modal` 제거 + `document.body.style.overflow=''` 복원 추가. 또 Daum 주소 모달을 화면 중앙에서 `calc(50% + 240px)` 위치로 고정하여 고객 등록 모달 우측 옆에 나란히 표시(모달끼리 겹침 방지) |
| v3.3.2 | fix 2종: ①주문→신규고객등록→주문 자동채움 **진짜 원인** 수정 — 저장 핸들러 이원화(`js/customer-management.js` `saveCustomer` vs `features/customers/customerUI.js` `handleCustomerSave`) 중 실제 실행되는 후자에 `tempCustomerName` 분기 + `selectCustomerFromSearch` 직접 호출 로직 이식 ②Daum 주소 검색 모달이 고객 등록 모달 위에서 배경을 검게 덮어 고객 화면이 안 보이는 문제 — `background:rgba(0,0,0,0.5)` 백드롭 제거(`transparent`), `pointer-events:none` 으로 고객 모달 클릭 통과, 모달 박스만 `pointer-events:auto`. 그림자 강화(0 12px 40px rgba 0.35)로 시각 분리 — 커스터 모달 저장 버튼의 실제 핸들러는 `js/customer-management.js`의 `saveCustomer` 가 아니라 `features/customers/customerUI.js` 의 `handleCustomerSave` 였음(저장 버튼 ID `customer-save-btn`에 직접 addEventListener). 기존 `saveCustomer` 내 `tempCustomerName` 분기 및 `selectCustomerFromSearch` 호출 로직이 아예 실행되지 않던 것. `handleCustomerSave` 성공 분기 안에 동일 로직 이식: 저장된 고객의 id·grade 조회 → `closeCustomerModal` → 주문 모달 재표시 → 50ms setTimeout 으로 `selectCustomerFromSearch` 직접 호출(customer_id·readonly·hidden input 완전 동기화) |
| v3.3.0 | chore+fix: MINOR 버전 승격 — PATCH 100+ 도달로 수동 리셋 (v3.2.102 → v3.3.0). 동시에 Daum 주소 검색 팝업 크기 제어: `.open()` 브라우저 팝업(크기 제어 불가) → 자체 중앙 모달(480×500px) + `.embed()` 로 교체. 모달 헤더·X 버튼·배경 클릭 닫기 포함 |
| v3.2.102 | style: 사이드바 버전 배지를 로고 아래로 이동 + 흰색으로 시인성 개선 — 기존 하단 분리 영역(색 #475569·text-center) 제거, 로고 영역 내부 "식물농장 관리" 서브타이틀 아래로 이동, `color:#fff` + `letter-spacing:0.04em` 유지, 크기(10px) 동일 |
| v3.2.101 | fix: 고객 등록 모달 개선 2종 — ①주소 입력창 Enter 시 Daum 임베드(페이지 하단 고정 영역 차지)가 불편 → 별도 팝업 창(`.open()`)으로 전환, 임베드 컨테이너 미사용 ②주문 모달에서 신규 고객 등록 후 재검색 필요 문제(v3.2.98 미해결) — `saveCustomer` `tempCustomerName` 분기에서 `window.selectCustomerFromSearch` 를 **직접 호출**(callback 경로 미등록 케이스 우회), 50ms setTimeout 으로 주문 모달 재표시 직후 DOM 안정화 대기, customer_id·grade 완전 동기화 |
| v3.2.100 | refactor: 레거시 테이블 CSS 클래스 일괄 제거 — `.app-table`(44줄)·`.customer-table`(19줄)·`.tbl-ui`(7줄) 정의 삭제(production 사용처 0), `.customer-row` 자체 `border-bottom`·`transition`·`:hover`·td padding 제거하여 `.table-ui tbody tr` 로부터 상속(선택상태·커서만 유지), Spec ⑥ 공용 selector(`.app-table td, .table-ui td, .tbl-ui td, .customer-table td, .customer-row td`)를 `.table-ui td` 로 축소. CLAUDE.md 107행 "개별 테이블 테두리 직접 지정 금지" 준수, 총 순 -76줄 |
| v3.2.98 | fix: 주문 모달에서 신규 고객 등록 후 재검색 필요 문제 — `saveCustomer`의 `tempCustomerName` 분기가 `customerModalCallback`을 건너뛰고 return 하여 orderForm의 `selectCustomerFromSearch`(customer_id·grade·UI 상태 일괄 동기화) 미호출. 콜백 우선 실행 + 저장된 고객의 id·grade 조회 후 `fullCustomer` 전달하도록 수정 |
| v3.2.97 | fix: 고객 등록 모달 주소 입력 — 타이핑마다 자동 검색으로 혼란 유발 → Enter 키 입력 시만 Daum 오버레이 열리도록 변경 (`oninput` → `onkeydown` + Enter 판별), placeholder 문구도 "Enter 키로 검색" 으로 명시 |
| v3.2.96 | docs: CLAUDE.md 에 Git·문서 워크플로우 섹션 신설 — 작업 단위 완료 시 ①커밋 ②README 변경이력 동일 커밋 포함 ③`pull --rebase` 후 자동 푸시 규칙화. AI 편집기 간 원격 동기화 지연 방지 목적. "주문관리가 기준" 원칙 삭제(특정 탭 기준 대신 공통 규칙으로 평준화). 뱃지 금지 variant(badge-red/yellow/green/blue) 명시, `.table-ui` 엑셀 격자 전역 표준, `.td-link` 색 상속(검정 통일), `px-2 align-middle`·`nullDash` 셀 규칙, Dead code 경고(features/products/productUI.js 미사용) 문서화 |
| v3.4.1 | refactor: `features/orders/orderForm.js` 하드코딩 스타일 전면 제거 — 3177줄→2680줄(-497줄, -15.6%), raw Tailwind 유틸리티 281건→0건. ①레거시 `generateOrderFormHTML` 본체(430줄, 미사용 fallback) 삭제 ②상품 선택 모달 `showProductManagementModal` → `renderModal`+`renderFilterBar` 적용 ③`loadAllProducts` 상품 카드 그리드 재작성 — 상태 메시지 헬퍼 통합·CSS 변수·`renderFormActions` 적용 ④카트 행 3종(`addQuickProductToCart`·`addProductToCart`·`addToCart`) → 삼각 정렬 법칙·`tabular-nums`·`renderBtnIcon`·`renderEmptyRow` 적용 ⑤인기/빠른 상품 카드 → 파란색 강조 제거, primary 초록(`#16A34A`) 통일 ⑥`searchExistingCustomers` 고객 드롭다운 → `renderGradeBadge` 적용 ⑦추가 배송지 행+배지 → `renderBadge` 적용·파란 톤→초록 통일 ⑧CLAUDE.md 확장 — UI/Design System Rules 통합 섹션(Data Form & Header Constitution 8개 조항·경산다육 디자인 가이드라인 4개 섹션·데이터 테이블 표준) |
| v3.4.0 | feat: UI 통제실 확립 — Standard Form Renderer 구축 및 전 파일 반란군 제거. ①`utils/ui.js`에 `renderModal`·`renderField`·`renderFormSection`·`renderFormGrid`·`renderBadge`·`renderOrderStatusBadge`·`renderGradeBadge`·`renderBtnIcon`·`renderBtnGroup`·`renderEditDeleteBtns`·`renderConfirmDialog`·`renderInfoRow` 16종 렌더러 추가 — 모든 팝업·폼·배지·버튼은 이 공장을 통해서만 생산 ②`styles/index-inline.css`에 시맨틱 유틸리티 클래스 추가(`.txt-*` 텍스트 계층 9종·`.bg-card/section`·`.flex-center/between`·`.p-xs/sm/md/lg`·`.r-sm/md/lg`·`.fw-*`) ③CSS 최종 안전망 확장 — raw Tailwind `text-gray-*`/`bg-gray-*`/`text-xs`/`text-sm` 클래스를 CSS 변수로 강제 오버라이드 ④`categoryUI.js` 반란군 전면 교체(빈 상태·카테고리 행·버튼) ⑤`productUI.js` `COMMON_STYLES` 상수 시맨틱 클래스로 교체·상세 패널 `renderModal()` 적용 ⑥`customerUI.js` 주문상태 배지 함수 `badge-*` 변형으로 교체 ⑦`js/order-management.js` 인라인 상태 배지 `badge-*` 교체 ⑧`js/shipping-management.js` `getStatusColor()` → `badge-*` 변형 반환으로 교체 |
| v3.3.2 | refactor: 주문관리 DB 구조 분석 및 레거시 코드 정리 — ①JSONB/정규화 테이블 이중 관리 현황 파악: 쓰기는 이미 `farm_order_items` 단일 SSOT 사용 중, 읽기도 `fetchOrderByIdFromSupabase`에서 `farm_order_items` JOIN으로 정상 처리 ②`orderUI.js` `loadOrderData()`에서 레거시 `order.order_items` JSONB 파싱 디버그 블록 제거 (JSONB 컬럼은 마이그레이션 완료 후 미사용 상태) ③비활성 기능 현황 확인: 로젠택배 내보내기·포장라벨(hidden), 임시저장·미리보기(stub 함수) ④중복 함수 현황 확인: `orderSearch.js`의 고객/상품 검색이 `orderForm.js`에 더 완성된 버전으로 중복 존재 |
| v3.3.1 | 리듬이의주각오 — 고객 삭제 시 FK 제약 처리 방식 변경: 주문 차단 대신 관련 주문의 `customer_id`를 `null`로 초기화 후 고객 삭제 진행 |
| v3.3.0 | refactor: 상품관리 7대 문제 전면 개선 — ①[고] `farm_products.category_id UUID FK` 컬럼 추가 + 기존 데이터 마이그레이션 + 인덱스, `addProduct`/`updateProduct` 동기화 ②[고] Supabase 클라이언트 대기 폴링(0.5s×20회) → `supabase-ready` CustomEvent 기반 교체 ③[중] `_productDataManagerInitializing`/`_categoryDataManagerInitializing` 플래그로 이중 초기화 방지 ④[중] Supabase Realtime `postgres_changes` 구독으로 다중 탭 실시간 동기화 ⑤[중] 상품코드 DB RPC `get_next_product_code()` 적용으로 race condition 해결 ⑥[저] `window.ProductMgmt`/`window.CategoryMgmt` 네임스페이스 추가 ⑦[저] 카테고리 변경 시 `farm_products` SW 캐시도 함께 무효화 |
| v3.2.95 | fix: 주소검색 팝업 → embed 오버레이 전환 — `daum.Postcode().open()` 팝업 방식에서 `.embed()` 인페이지 오버레이 방식으로 변경, `q` 초기 쿼리가 새 창(about:blank)에 전달되지 않던 문제 해결. 주소 입력 후 엔터 시 오버레이가 해당 텍스트로 자동 검색, 배경 클릭·✕ 버튼으로 닫기. 주문 메인 주소·추가 배송지 모두 적용 |
| v3.2.94 | fix: 상품관리 DOM 중첩·display 충돌 구조 수정 |
| v3.2.93 | refactor: 상품관리 테이블 셀 클래스 시맨틱 통일 — `createProductRow()`의 인라인 Tailwind 클래스(`px-2 whitespace-nowrap text-xs font-medium text-gray-800` 등)를 `td-primary`·`td-secondary`·`td-muted`·`td-amount`·`td-num` 시맨틱 클래스로 교체, 고객관리·주문관리와 디자인 시스템 통일 |
| v3.2.92 | fix: 콘솔 오류 완전 제거 — `index.html` 존재하지 않는 스크립트 참조 7개 제거(`auto-waitlist-improvement.js` · `waitlist-data-migration.js` · `waitlist-autocomplete-fix.js` · `waitlist-data-cleanup.js` · `fix-order-data.js` · `fix-module-loading.js` · `web-fallback-system.js`), `loadScriptConditionally` 블록 삭제. fix: `main.js` `updateCategoryDropdown` import 오류 — `categoryUI.js`에서 함수명이 `updateProductCategoryDropdown`으로 변경됐으나 import 미갱신으로 발생한 `SyntaxError` 수정 (별칭 import `as updateCategoryDropdown` 적용) |
| v3.2.91 | feat: 주소 입력 실시간 검색 — 주소 입력창 `readonly`+검색버튼 방식을 타이핑 자동완성으로 전환, 2글자 이상 입력 시 350ms 디바운스 후 Daum 우편번호 iframe 임베드, 주소 선택 시 닫히며 상세주소로 포커스, 외부 클릭 닫기. `onfocus` 핸들러 제거로 모달 열릴 때 빈 값으로 API 호출하는 콘솔 에러 원인 제거 |
| v3.2.90 | feat: 고객 등록/관리 UX 개선 3종 — ①동명이인 허용(전화번호 다르면 등록 가능, 중복 시 confirm 다이얼로그로 전환) ②고객 삭제 FK 방어(주문 내역 있으면 삭제 차단·안내 메시지) ③고객 등록 모달 `form-grid` 컴팩트 디자인 통일 |
| v3.2.89 | fix: 등급관리 버튼 → 환경설정 고객등급 탭 직접 이동 — `showSettingsTab` 셀렉터가 `.settings-tab`(미존재)을 참조해 탭 활성화 실패하던 문제 수정(`[id^="settings-tab-"]` 로 변경), `settings.html` 일반 탭 `active` 하드코딩 제거 |
| v3.2.88 | fix: 상품관리 탭 재방문 시 blank 화면 — `loadProductManagementComponent`의 "이미 로드됨" 재초기화 경로 제거, 매 방문마다 HTML 신규 로드로 outer `display:block`↔inner `display:flex` context 충돌 방지 |
| v3.2.87 | fix: 상품 등록 모달 카테고리 드롭다운 빈 문제 — `ProductManagementComponent.init()`에서 `this.productUI` 생성 후 `window.productUI`에도 할당. `window.updateProductCategoryDropdown`이 `window.productUI` 참조 실패로 카테고리가 표시 안 되던 문제 해결 |
| v3.2.86 | fix: 상품 등록·수정 모달 저장 후 안 닫히고 먹통 — `removeEventListeners()`의 `product-modal` cloneNode 제거(모달은 document.body 소속이라 cloneNode 시 addEventListener 리스너 전부 날아가 저장 버튼 먹통 발생), 저장 버튼만 cloneNode 교체로 중복 리스너 방지. feat: 상품명 클릭 시 읽기전용 상세 패널 표시(이미지·판매가·매입가·마진율·재고·배송옵션·설명·등록일, 수정 버튼 포함) |
| v3.2.85 | fix: 상품관리 `shipping` / `shipping_option` 중복 필드 정리 — `PRODUCT_FORM_FIELDS` · `PRODUCT_TABLE_COLUMNS` · 테이블 렌더링 · 인라인 편집 모두 `shipping_option` 단일 키로 통일, 로컬 메모리 이중 저장 제거, 인라인 편집 이중 쓰기 제거 |
| v3.2.84 | 상품관리 테이블 디자인 시스템 통일 — `#products-section` flex 레이아웃 래퍼 추가, thead 컬럼(8개)↔JS tbody(9개) 불일치 수정(상품코드·사이즈·배송옵션 컬럼 정렬), `td-primary/td-amount/td-num/td-muted/td-secondary` 셀 클래스 적용, `btn-icon-edit/btn-icon-delete` 버튼 통일, 일괄 등록 모달 `style="display:none;"` → `hidden` 수정 |
| v3.2.81 | 상품 등록 모달 레이아웃 개선 — `modal-lg`(720px) → `modal-xl`(960px) 확대, 상품명 col-4→col-6 / 카테고리·사이즈 col-4→col-3으로 비율 조정, `modal-body .form-grid` gap 10px→16px 여백 확대 |
| v3.2.80 | 상품 등록 모달 표시 버그 수정 — `style="display:none;"` → `hidden` 클래스로 통일, `modal-container`의 `scale-95 opacity-0 transition-all` 애니메이션 클래스 제거, `product-modal-content` 불필요한 margin 조작 코드 삭제 |
| v3.2.79 | 대기자 등록 시 고객관리 자동 추가 — 새 대기자 등록 시 동일 전화번호 고객이 없으면 `farm_customers`에 자동 삽입, 중복 방지 로직 포함 |
| v3.2.77 | 대기자 등록 모달 디자인 시스템 적용 — `modal-overlay/container/header/body/footer` 표준 구조, `form-grid` 12컬럼(고객명·연락처·희망상품명·카테고리·희망가격+원·우선순위·메모), `form-control` 42px 통일, `btn-secondary/primary` 버튼, 바깥 클릭 닫기 |
| v3.2.75 | fix: main.js 삭제된 `loadNotificationSettings` import 제거 |
| v3.2.74 | fix: 고객 상세 팝업 DOM 누락 수정 — 컴포넌트 로드 시 `replaceWith(inner)`가 모달을 버리는 문제 수정, `customer-detail-panel`·`customer-grades-modal`을 `#customers-section` 안으로 이동 |
| v3.2.72 | 일반설정 사업자번호·전화번호 인쇄 문서 및 배송 라벨 반영 |
| v3.2.70 | 고객 상세 중앙 팝업 모달 전환 — 고객 클릭 시 860px 중앙 팝업(modal-overlay)으로 표시, 좌(프로필·지표·액션)/우(주문이력·메모) 2컬럼 레이아웃, 바깥 클릭·X 닫기, 스플릿뷰 방식 제거 |
| v3.2.69 | 주문 상세 모달 수정 버튼 클릭 시 상세 모달 미닫힘 수정 — 수정 폼 열기 전 상세 모달 hidden 처리 |
| v3.2.68 | 새 주문 버튼 재방문 먹통 근본 원인 제거 — cleanupOrderEventListeners를 플래그 리셋만 하도록 단순화(cloneNode 제거), initializeOrderManagement 중복 cleanup 제거, loadOrderDetailModal 중복 방지 guard 추가 |
| v3.2.67 | 주문 기본 진입 탭 변경 — 주문관리 열 때 `work_todo`(처리할 주문) 대신 `all`(전체) 탭으로 진입 |
| v3.2.66 | 주문관리 사이드바 배지 추가 — nav 주문관리 버튼 옆에 처리할 주문 건수 실시간 표시, 새 주문 기본 상태 `입금대기` → `주문접수` 변경 |
| v3.2.65 | 환경설정 배송 전체 연결 — ①`shippingMethods` 목록 편집 UI 추가(환경설정 배송 탭), ②주문 등록 배송방법 드롭다운 `settings.shipping.shippingMethods` 동적 로드, ③픽업·방문·수령 포함 방법은 자동 배송비 0원 처리, ④배송방법 목록이 기본값(택배·직접배송·픽업)으로 통일 |
| v3.2.60 | 환경설정 SMS 인증정보 저장 연결 — `save-sms-config-btn` 이벤트 연결, API Key/Secret/발신번호 저장·불러오기 |
| v3.2.59 | 고객 수정 모달 주문이력 탭 복원 — 수정 모달 열 때 주문 내역 탭이 사라지던 문제 수정 |
| v3.2.58 | 상품 등록 모달 애니메이션 복구 — `panelSlideIn` 키프레임 flexbox 기준으로 재작성(`translateY` 방식) |
| v3.2.57 | orderData.js export 복원 — 브랜치 머지 중 삭제된 `renderOrdersTable` 및 모듈 내보내기 복구 |
| v3.2.56 | 폼 디자인 시스템 누락 모달 적용 — 대기자 등록(`waitlist-modal.html`)·상품 등록(`product-modal.html`)에 `form-grid` 12컬럼 레이아웃 적용, 사이즈 미지정 시 `modal-md/lg` 클래스 부여 |
| v3.2.53 | 고객관리 미납/대기 체크박스 필터 구현 — 필터 바에 미납·대기자 체크박스 추가, 미납(unpaid_amount > 0) 및 waitlist 보유 고객 즉시 필터링 |
| v3.2.52 | 주문관리 재방문 시 새 주문·탭·체크박스 버튼 먹통 수정 — addEventListener+플래그 방식 → onclick/onchange 할당으로 교체 |
| v3.2.51 | nav 처리할주문 뱃지 + 진입 기본탭 전체 + 신규주문 기본상태 주문접수 — nav-orders 옆 빨간 숫자 뱃지(99+ 상한), 진입 기본값 work_todo→all, 주문 등록 기본 상태 입금대기→주문접수 |
| v3.2.40 | 주문관리 상태 표시 정리 — 미사용 복합 필터(work_deposit·work_ship_today·work_done) 제거, 상태 배지 색상 단일 소스화(dashboard.js·customerUI.js → orderData.js `getStatusColor()` 위임), '취소'→'주문취소' 상태명 정규화 |
| v3.2.39 | 주문관리 코드 정리 — 일괄 삭제 버튼 추가, 디버그 전역 함수 7개·테스트 함수 8개 window 노출 제거, orderSearch.js 중복 cart 함수 window 등록 6개 제거 |
| v3.2.51 | 폼 디자인 시스템 도입 — 12컬럼 그리드(`form-grid`) · 라벨 상단 고정(Top-Label) · 입력창 42px 높이 통일(`form-control`) · 필드 간격 `gap-y-4`(16px) · 컨테이너 패딩 24px 일원화. 적용: 고객 등록 모달·주문 등록 좌측 패널·판매채널 모달·환경설정 일반/배송/SMS. 신규 CSS: `form-col-6/12`·`form-input-group`·`form-input-unit`·`form-section`·`form-actions`. `modal-body` 패딩 24px 표준화 |
| v3.2.50 | 레거시 DB 테이블 삭제 — `customer_grades`(farm_settings JSONB로 대체), `sales_channels`(farm_channels로 대체), `shipping_settings`(farm_settings로 대체), `device_info`(미사용) 4개 테이블 Supabase에서 완전 삭제. 현재 사용 테이블: farm_customers·orders·order_items·products·categories·waitlist·settings·channels·settings_kv·admin_users |
| v3.2.49 | 환경설정 DB 정리 — 스키마에만 존재하고 앱에서 미사용인 `farm_order_statuses`·`farm_customer_grades` 테이블 식별, `drop-unused-settings-tables.sql` 제거 스크립트 추가. 환경설정 탭별 DB 연결 구조 정리: 일반·배송·주문상태·고객등급·SMS는 `farm_settings` JSONB, 판매채널은 `farm_channels` 전용 테이블로 관리 |
| v3.2.48 | 팝업창 디자인 전면 통일 — 모든 모달을 `modal-overlay/container/header/body/footer` 표준 구조로 마이그레이션, `.modal-footer` `justify-content: flex-end; gap: 8px` 고정, 크기 변형 클래스(`.modal-sm/md/lg/xl`) 추가, 긍정 액션(저장/확인) `btn-primary`(우측 초록), 부정 액션(취소/닫기) `btn-secondary`(좌측 회색) 배치 통일, 인라인 `style="width:..."` 전면 제거, JS 동적 모달(환불·SMS·고객삭제) 포함 11개 파일 적용 |
| v3.2.46 | 고객 전화번호 뒷자리 검색 개선 — 하이픈·공백 제거 후 숫자만 비교, 뒷자리 4자리만 입력해도 검색 가능 |
| v3.2.45 | 주소 검색 기능 추가 — 주문 등록 기본주소 필드에 Daum 우편번호 검색 버튼 추가, 주소 입력 후 엔터로 바로 검색 팝업 오픈(입력값 자동 검색), 추가 배송지도 동일 방식 적용, 폼 오픈 시 스크립트 미리 로드로 팝업 차단 방지 |
| v3.2.36 | 다중 배송지 지원 — 주문 등록 폼에 "배송지 추가" 버튼 추가, 추가 배송지마다 동일 상품으로 주문 자동 분리 생성, 배송지별 재고 개별 차감, 저장 후 총 생성 건수 안내 |
| v3.2.35 | 전역 테이블 CSS 완전 통일 — 전 파일 td `text-xs`·`text-sm`·`py-*` 제거, 모든 table에 `table-ui` 클래스 부여, td inline `style=` 완전 삭제, `tbl-ui`→`table-ui` 통일, 상태 inline 색상→`badge` 시맨틱 클래스 전환 (12개 파일 대상) |
| v3.2.34 | 상품 모달 X버튼·취소버튼 작동 안 하는 버그 수정 — `window.closeProductModal` 폴백에도 존재하지 않는 `product-modal-content` ID 참조 → modal만 숨기도록 통일 |
| v3.2.32 | 주문관리 지브라 패턴 적용 — `.order-list-compact tbody tr:nth-child(even)` CSS 규칙 추가, 과부하·선택 행 시맨틱 클래스(`row-overdue`/`row-selected`) 도입으로 Tailwind bg-* 명시도 충돌 해결, `text-xs` 데드코드 tbody에서 제거 |
| v3.2.31 | 상품관리 버그 3종 수정 — ①새 상품 등록 후 모달 안 닫히는 버그(product-modal-content ID 누락) ②재방문 시 상품 목록 미갱신 ③이벤트 리스너 setTimeout 경쟁 조건 제거 |
| v3.2.30 | 주문관리 로직 15개 결함 수정 — ①toOrderRowSpecFromFallback d_day 문자열→숫자 수정(Fix#15) ②폴백 deliveryStatus 미사용 변수 → fallbackRow 덮어쓰기(Fix#2/#7) ③상태 필터 헬퍼 matchOrderStatusFilter 공유 함수 추출(Fix#8) ④work_todo/work_ship_today 중복 의도 주석(Fix#10) ⑤검증 함수 _DEBUG_ORDER_ROWS 플래그 가드(Fix#14) ⑥customer_address_base↔DB address 컬럼 매핑 주석(Fix#3) ⑦sendOrderSMSFromModal updateOrderStatus 미등록 경고(Fix#11) ⑧order_items JSONB 레거시 주석·SMS 쿼리 중복/채널 TODO(Fix#1/#12/#13) ⑨주문수정 재고 복원→차감 통합(Fix#4) ⑩restoreProductStock DB 직접 조회로 변경(Fix#5/#6) ⑪고객 INSERT youtube/live_order_count 컬럼 제거·grade BRONZE(Fix#9) |
| v3.2.29 | 인라인 클래스 완전 박멸 — shippingUI `py-3/text-sm` 제거·`td-primary/td-secondary/badge/btn-group` 교체, orderData.js tr `py-0/border-b` 무효 속성 제거, 배송 테이블 th 하드코딩 → `.table-ui thead th` CSS 변수 단일 제어, `utils/ui.js` 채택 현황 v3.2.29로 최신화 |
| v3.2.28 | 데이터 행 py-* 완전 제거 — 주문(orderData.js) 전 td `py-1.5` 제거, 배송 테이블 `table-ui` 클래스 추가, 배송 필터바 → `filter-bar` + `status-tab-btn` + `input-ui` 표준 클래스 통일 |
| v3.2.27 | 고객관리 재방문 시 등급관리·고객등록 버튼 먹통 수정 — 재방문 시 이벤트 리스너 재연결 누락 수정, 중복 리스너 누적 방지 |
| v3.2.25 | 빈 행 렌더링 표준화 — `renderEmptyRow()` 전 탭 통일 (고객·상품·배송·주문폼), `utils/ui.js` 채택 현황 문서화 |
| v3.2.24 | README 배지 버전 동기화 |
| v3.2.23 | 주문 워크플로우 개선 — ①주문확인 문자 발송 시 자동 입금대기 전환 ②입금대기 3일+ 경과 행 빨간 강조 ③입금확인 상태 변경 시 SMS 발송 옵션 ④품절 안내 문자 템플릿 추가 ⑤배송시작 문자에 CJ대한통운 배송조회 링크 포함 ⑥환불완료 처리 시 사유 입력 모달 (메모에 자동 기록) |
| v3.2.22 | README 변경이력 정리 |
| v3.2.18 | 테이블 행 간격 CSS 변수 통합 — `--tbl-cell-py` 변수가 Tailwind에 밀리던 특이도 문제 수정, 고객관리·상품관리 `table-ui` 클래스 누락 보완 |
| v3.2.15 | 주문 SMS 실제 발송 수정 — `sendSMS()` → `sendSolapiSMS()` 직접 호출로 변경. 환경설정 SMS탭에 API Key / Secret / 발신번호 필드 추가 |
| v3.2.14 | 새 주문 등록 후 목록 미표시 버그 수정 — 저장 직후 해당 주문 상태 탭으로 즉시 이동 |
| v3.2.13 | 고객관리 등급관리 버튼 먹통 수정 — 탭 재방문 시 이벤트 리스너 재연결 안 되던 버그 수정 |
| v3.2.12 | 커밋 시 버전 자동 증가 — git pre-commit hook으로 `js/config.js` 패치 버전 자동 +1 |
| v3.2.7  | 표시 수 선택 — 고객·주문·상품·대기자 4개 탭 하단에 드롭다운(10/20/50/전체) 추가 |
| v3.2.6  | 고객 목록 주문 추가 버튼 복구 |
| v3.2.5  | 고객 삭제 모달 개선 — 삭제 시 연관 주문 목록 확인, 체크박스로 선택 삭제 |
| v3.2.4  | 대기자 관리 업데이트, 고객 삭제 시 연관 주문 함께 삭제 |
| v3.2.3  | 디자인 시스템 규격화 — 하드코딩 색상 전체 `--primary` 변수로 통일, 필터 바·테이블 행 높이 전역 CSS 변수 제어 |

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
