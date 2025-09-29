# Supabase 인증 및 데이터베이스 오류 해결 가이드

## 🚨 발생한 문제들

1. **401 Unauthorized 오류** - Supabase API 인증 실패
2. **RLS 정책 위반** - Row Level Security 정책 문제
3. **고유 제약 조건 오류** - farm_customers 테이블의 phone 필드 제약 조건 문제
4. **인증 헤더 누락** - API 요청에 인증 정보 부족

## 🔧 해결 방법

### 1단계: Supabase 데이터베이스 스키마 수정

다음 SQL 스크립트를 **Supabase SQL Editor**에서 실행하세요:

```sql
-- 1. 기존 RLS 정책 삭제 (문제가 있는 정책들)
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_customers;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_products;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_orders;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_order_items;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_categories;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_waitlist;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_channels;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_order_statuses;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_shipping_rules;
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_customer_grades;

-- 2. farm_customers 테이블에 phone 필드 unique constraint 추가
ALTER TABLE farm_customers 
ADD CONSTRAINT farm_customers_phone_unique UNIQUE (phone);

-- 3. 새로운 RLS 정책 생성 (익명 사용자도 접근 가능)
CREATE POLICY "Allow all operations for anonymous users" ON farm_customers 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_products 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_orders 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_order_items 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_categories 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_waitlist 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_channels 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_order_statuses 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_shipping_rules 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anonymous users" ON farm_customer_grades 
FOR ALL USING (true) WITH CHECK (true);

-- 4. device_info 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS device_info (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- device_info 테이블에 RLS 정책 추가
ALTER TABLE device_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anonymous users" ON device_info 
FOR ALL USING (true) WITH CHECK (true);

-- 5. PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 6. 완료 메시지
SELECT 'Supabase 인증 및 스키마 문제 해결 완료!' as message;
```

### 2단계: 코드 수정 사항 확인

다음 파일들이 수정되었습니다:

1. **js/supabase-config.js** - 연결 테스트 함수 개선
2. **js/supabase-integration.js** - 오류 처리 및 로깅 개선
3. **js/app.js** - API 연결 테스트 함수 개선

### 3단계: 테스트 방법

1. **브라우저 개발자 도구**를 열고 Console 탭을 확인
2. 페이지를 새로고침하여 초기화 과정 확인
3. 다음 메시지들이 나타나는지 확인:
   - ✅ Supabase 클라이언트 초기화 성공
   - ✅ Supabase 연결 테스트 성공
   - ☁️ Supabase 저장 성공

### 4단계: 문제가 지속되는 경우

만약 여전히 401 오류가 발생한다면:

1. **Supabase 프로젝트 설정** 확인:
   - Settings → API → Project URL과 anon public key 확인
   - js/supabase-config.js의 URL과 키가 올바른지 확인

2. **RLS 정책** 재확인:
   - Supabase Dashboard → Authentication → Policies
   - 모든 테이블에 대해 "Allow all operations for anonymous users" 정책이 있는지 확인

3. **브라우저 캐시** 삭제:
   - Ctrl+Shift+R (강제 새로고침)
   - 또는 브라우저 캐시 완전 삭제

## 🎯 예상 결과

수정 후에는 다음과 같은 결과를 기대할 수 있습니다:

- ✅ 401 Unauthorized 오류 해결
- ✅ RLS 정책 위반 오류 해결  
- ✅ 고유 제약 조건 오류 해결
- ✅ 정상적인 데이터 동기화 작동

## 📞 추가 지원

문제가 지속되면 다음 정보를 확인해주세요:

1. 브라우저 Console의 전체 오류 메시지
2. Supabase Dashboard의 Authentication 로그
3. 네트워크 탭의 API 요청/응답 상태

---

**작성일**: 2024년 12월 19일  
**작성자**: AI Assistant  
**목적**: Supabase 인증 및 데이터베이스 오류 해결

