-- Supabase 인증 및 스키마 문제 해결
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

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

-- 2. farm_customers 테이블에 phone 필드 unique constraint 추가 (이미 존재하면 무시)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'farm_customers_phone_unique'
    ) THEN
        ALTER TABLE farm_customers 
        ADD CONSTRAINT farm_customers_phone_unique UNIQUE (phone);
    END IF;
END $$;

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
