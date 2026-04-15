# 경산다육식물농장 관리시스템

> White Platter 전문 농장의 주문 · 재고 · 고객을 한 화면에서 관리하는 웹 애플리케이션

[![version](https://img.shields.io/badge/version-v3.2.65-brightgreen)](https://github.com/da6262/sucplant)
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
│   ├── ui.js          # renderPageHeader · renderFilterBar · renderEmptyRow
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
| v3.2.65 | 환경설정 배송 전체 연결 — ①`shippingMethods` 목록 편집 UI 추가(환경설정 배송 탭), ②주문 등록 배송방법 드롭다운 `settings.shipping.shippingMethods` 동적 로드, ③픽업·방문·수령 포함 방법은 자동 배송비 0원 처리, ④배송방법 목록이 기본값(택배·직접배송·픽업)으로 통일 |
| v3.2.63 | 고객관리 CRM 패널 스플릿 뷰 전환 — `position:fixed` 플로팅 오버레이 → 좌(목록)/우(상세) flex 인라인 스플릿 레이아웃, 고객 클릭 시 패널이 옆에 열리며 목록 너비 자동 축소, 지표 카드 3분할(총구매액·주문횟수·단골점수), 액션버튼 역할별 분리(문자/전화=secondary, 주문추가=primary) |
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
