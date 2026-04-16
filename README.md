# 경산다육식물농장 관리시스템

> White Platter 전문 농장의 주문 · 재고 · 고객을 한 화면에서 관리하는 웹 애플리케이션

[![version](https://img.shields.io/badge/version-v3.2.102-brightgreen)](https://github.com/da6262/sucplant)
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

## 디자인 시스템 (v3.2.54+)

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
| **모달** | `.modal-overlay` `.modal-container` `.modal-sm/md/lg/xl` `.modal-header` `.modal-body` `.modal-footer` `.modal-title` `.modal-close-btn` |
| **폼 그리드** | `.form-grid` `.form-col-4/6/12` `.form-label .req` `.form-control` `.form-helper` `.form-error` |
| **폼 입력** | `.form-input-group.with-unit` `.form-input-unit` `.form-section` `.form-section-inner` `.form-actions` |

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
