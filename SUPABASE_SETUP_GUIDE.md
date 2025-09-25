# 🚀 Supabase 연동 설정 가이드

## 📋 개요
경산다육식물농장 관리시스템에 Supabase(PostgreSQL) 연동이 완료되었습니다!

## 🔧 설정 방법

### 1단계: Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름: `gyeongsan-farm-management`
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (Asia Northeast - Seoul 권장)

### 2단계: 프로젝트 정보 확인
1. Supabase 대시보드 → Settings → API
2. 다음 정보를 복사:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3단계: 설정 파일 업데이트
`js/supabase-config.js` 파일을 열고 다음 부분을 수정:

```javascript
const SUPABASE_CONFIG = {
    // TODO: 실제 Supabase 프로젝트 정보로 교체
    url: 'https://your-project.supabase.co',  // ← 여기에 Project URL 입력
    anonKey: 'your-anon-key-here',           // ← 여기에 anon key 입력
    // ... 나머지는 그대로
};
```

### 4단계: 데이터베이스 테이블 생성
Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- 고객 테이블
CREATE TABLE farm_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    memo TEXT,
    grade TEXT DEFAULT 'GENERAL',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE farm_orders (
    id TEXT PRIMARY KEY,
    order_number TEXT,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    product_name TEXT NOT NULL,
    product_category TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    order_status TEXT DEFAULT '주문접수',
    order_source TEXT,
    shipping_method TEXT,
    tracking_number TEXT,
    memo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 상품 테이블
CREATE TABLE farm_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 카테고리 테이블
CREATE TABLE farm_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 대기자 테이블
CREATE TABLE farm_waitlist (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    product_name TEXT NOT NULL,
    product_category TEXT,
    expected_price DECIMAL(10,2),
    status TEXT DEFAULT '대기중',
    memo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 판매 채널 테이블
CREATE TABLE farm_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 주문 상태 테이블
CREATE TABLE farm_order_statuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 배송 규칙 테이블
CREATE TABLE farm_shipping_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    shipping_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 고객 등급 테이블
CREATE TABLE farm_customer_grades (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE farm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_customer_grades ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (개발용)
CREATE POLICY "Enable all access for all users" ON farm_customers FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_orders FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_products FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_categories FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_waitlist FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_channels FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_order_statuses FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_shipping_rules FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_customer_grades FOR ALL USING (true);
```

## 🎯 기능 특징

### ✅ 구현된 기능
- **하이브리드 저장**: Supabase + IndexedDB 캐시 + LocalStorage 폴백
- **오프라인 지원**: 네트워크 끊김 시 자동으로 로컬 캐시 사용
- **Outbox 패턴**: 오프라인 상태에서의 작업을 온라인 복구 시 자동 동기화
- **점진적 마이그레이션**: 기존 LocalStorage 데이터 자동 보존
- **실시간 동기화**: 온라인 상태에서 실시간 데이터 동기화

### 🔄 동작 방식
1. **온라인 상태**: Supabase → IndexedDB 캐시 → UI
2. **오프라인 상태**: IndexedDB 캐시 → UI
3. **복구 시**: Outbox의 대기 작업들을 Supabase로 자동 동기화

### 🛡️ 안전장치
- Supabase 연결 실패 시 자동으로 LocalStorage 폴백
- IndexedDB 지원하지 않는 브라우저에서도 LocalStorage로 동작
- 모든 데이터 변경사항이 로컬에 캐시되어 데이터 손실 방지

## 🚀 사용법

### 설정 완료 후
1. 브라우저에서 `index.html` 열기
2. 개발자 도구 콘솔에서 다음 메시지 확인:
   ```
   ✅ Supabase 초기화 성공!
   🌐 Supabase 연결 성공!
   ```

### 수동 동기화
```javascript
// 브라우저 콘솔에서 실행
window.supabaseIntegration.forceSync();
```

### 연결 상태 확인
```javascript
// 브라우저 콘솔에서 실행
window.supabaseIntegration.checkConnection();
```

## 🔧 문제 해결

### Supabase 연결 실패 시
1. `js/supabase-config.js`의 URL과 키 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 상태 확인

### 데이터 동기화 문제 시
1. 브라우저 캐시 삭제
2. IndexedDB 초기화: `window.indexedDBCache.clearAllCache()`
3. 수동 동기화 실행

## 📱 모바일 지원
- PWA (Progressive Web App) 지원
- 오프라인 모드에서도 완전한 기능 제공
- 모바일에서도 IndexedDB 캐시로 빠른 성능

## 🎉 완료!
이제 경산다육식물농장 관리시스템이 Supabase와 완전히 연동되었습니다!
- ✅ 클라우드 데이터베이스 (PostgreSQL)
- ✅ 오프라인 지원 (IndexedDB)
- ✅ 실시간 동기화
- ✅ 데이터 백업 및 복구
- ✅ 다중 디바이스 지원

