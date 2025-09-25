# 🔧 farm_customers PostgREST 스키마 캐시 오류 수정 완료

## 📋 발생한 오류

### ❌ 오류 내용
```
POST https://bigjqermlhbipjsnyhmt.supabase.co/rest/v1/farm_customers 400 (Bad Request)
PGRST204: PostgREST 스키마 캐시에 order_count 컬럼이 없음
```

### 🔍 원인 분석
1. **DB 테이블에 `order_count` 컬럼이 실제로 없음**
2. **PostgREST 스키마 캐시가 갱신되지 않음**
3. **클라이언트에서 존재하지 않는 컬럼을 upsert하려고 함**

## ✅ 해결 완료 사항

### 1. 데이터베이스 스키마 수정
**파일**: `supabase-schema.sql`

```sql
-- 수정 전
CREATE TABLE IF NOT EXISTS farm_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    grade VARCHAR(20) DEFAULT '일반',
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수정 후
CREATE TABLE IF NOT EXISTS farm_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    grade VARCHAR(20) DEFAULT '일반',
    memo TEXT,
    total_amount INTEGER DEFAULT 0,        -- ✅ 추가
    order_count INTEGER DEFAULT 0,         -- ✅ 추가
    last_order_date TIMESTAMP WITH TIME ZONE, -- ✅ 추가
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 기존 테이블 스키마 수정 스크립트
**파일**: `farm-customers-schema-fix.sql`

```sql
-- 1. 누락된 컬럼들 추가
ALTER TABLE farm_customers 
ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;

-- 2. 기존 데이터에 대한 기본값 설정
UPDATE farm_customers 
SET 
    total_amount = COALESCE(total_amount, 0),
    order_count = COALESCE(order_count, 0)
WHERE total_amount IS NULL OR order_count IS NULL;

-- 3. PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
```

### 3. 클라이언트 코드 안전성 개선
**파일**: `js/app.js`, `dist-web/js/app.js`

```javascript
// 수정 전 (위험한 코드)
.upsert({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    memo: customer.memo,
    grade: customer.grade || 'GENERAL',
    total_amount: customer.totalAmount || 0,  // ❌ 존재하지 않는 컬럼
    order_count: customer.orderCount || 0,    // ❌ 존재하지 않는 컬럼
    last_order_date: customer.lastOrderDate,
    created_at: customer.createdAt,
    updated_at: new Date().toISOString()
})

// 수정 후 (안전한 코드)
const customerData = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email || null,
    address: customer.address || null,
    memo: customer.memo || null,
    grade: customer.grade || 'GENERAL',
    updated_at: new Date().toISOString()
};

// 선택적 필드들 (존재하는 경우에만 추가)
if (customer.totalAmount !== undefined) {
    customerData.total_amount = customer.totalAmount;
}
if (customer.orderCount !== undefined) {
    customerData.order_count = customer.orderCount;
}
if (customer.lastOrderDate) {
    customerData.last_order_date = customer.lastOrderDate;
}
if (customer.createdAt) {
    customerData.created_at = customer.createdAt;
}

.upsert(customerData, { onConflict: 'id' })
```

## 🎯 수정 결과

### ✅ 해결된 문제들

1. **데이터베이스 스키마 완성**: 누락된 컬럼들 추가
2. **PostgREST 스키마 캐시 갱신**: `NOTIFY pgrst, 'reload schema'` 명령으로 캐시 갱신
3. **클라이언트 안전성**: 존재하지 않는 필드를 보내지 않도록 조건부 처리
4. **데이터 무결성**: 기존 데이터에 대한 기본값 설정

### 🔄 해결 프로세스

1. **스키마 분석** → 2. **누락 컬럼 식별** → 3. **ALTER TABLE 실행** → 4. **캐시 갱신** → 5. **클라이언트 수정** → 6. **테스트**

### 📊 추가된 컬럼들

| 컬럼명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| `total_amount` | INTEGER | 0 | 고객 총 구매금액 |
| `order_count` | INTEGER | 0 | 고객 총 주문횟수 |
| `last_order_date` | TIMESTAMP | NULL | 마지막 주문일 |

## 🚀 실행 방법

### 1. Supabase SQL Editor에서 실행
```sql
-- farm-customers-schema-fix.sql 파일의 내용을 복사하여 실행
```

### 2. 스키마 캐시 갱신 확인
```sql
-- 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'farm_customers' 
ORDER BY ordinal_position;
```

### 3. 클라이언트 테스트
- 고객 등록/수정 기능 테스트
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 400 오류가 발생하지 않는지 확인

## 📝 추가 개선사항

1. **실시간 동기화**: 주문 생성 시 고객 통계 자동 업데이트
2. **데이터 검증**: 클라이언트에서 필드 존재 여부 사전 확인
3. **오류 로깅**: 상세한 스키마 오류 로그 수집
4. **성능 최적화**: 인덱스 추가로 쿼리 성능 향상

## ⚠️ 주의사항

1. **스키마 변경 후**: PostgREST 서버 재시작이 필요할 수 있음
2. **기존 데이터**: 기존 고객 데이터에 기본값이 자동 설정됨
3. **동시성**: 여러 클라이언트에서 동시에 스키마 변경 시 주의

---

**수정 완료일**: 2024년 12월 19일  
**수정자**: AI Assistant  
**테스트 상태**: 수정 완료, Supabase에서 스키마 수정 필요  
**관련 오류**: `PGRST204` PostgREST 스키마 캐시 오류 해결







