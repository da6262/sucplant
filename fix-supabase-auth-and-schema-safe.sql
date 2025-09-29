-- Supabase 인증 및 스키마 문제 해결 (안전 버전)
-- 이미 존재하는 제약 조건과 정책을 확인하고 생성

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
        RAISE NOTICE 'farm_customers_phone_unique 제약 조건이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_customers_phone_unique 제약 조건이 이미 존재합니다.';
    END IF;
END $$;

-- 3. 새로운 RLS 정책 생성 (익명 사용자도 접근 가능)
-- farm_customers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_customers' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_customers 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_customers RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_customers RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_products' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_products 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_products RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_products RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_orders' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_orders 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_orders RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_orders RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_order_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_order_items' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_order_items 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_order_items RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_order_items RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_categories' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_categories 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_categories RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_categories RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_waitlist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_waitlist' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_waitlist 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_waitlist RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_waitlist RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_channels
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_channels' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_channels 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_channels RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_channels RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_order_statuses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_order_statuses' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_order_statuses 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_order_statuses RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_order_statuses RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_shipping_rules
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_shipping_rules' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_shipping_rules 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_shipping_rules RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_shipping_rules RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- farm_customer_grades
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'farm_customer_grades' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON farm_customer_grades 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'farm_customer_grades RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'farm_customer_grades RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'device_info' 
        AND policyname = 'Allow all operations for anonymous users'
    ) THEN
        CREATE POLICY "Allow all operations for anonymous users" ON device_info 
        FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'device_info RLS 정책이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'device_info RLS 정책이 이미 존재합니다.';
    END IF;
END $$;

-- 5. PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 6. 완료 메시지
SELECT 'Supabase 인증 및 스키마 문제 해결 완료!' as message;

