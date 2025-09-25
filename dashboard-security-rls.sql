-- ============================================
-- 대시보드 보안 강화: RLS (Row Level Security) 정책
-- ============================================
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요.
-- 허용된 사용자만 대시보드 데이터에 접근할 수 있도록 합니다.

-- 1. 허용 사용자 테이블 생성 (이미 있으면 무시)
CREATE TABLE IF NOT EXISTS allowed_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 대표 계정 등록 (이미 있으면 무시)
INSERT INTO allowed_users (email, note)
VALUES ('sucplant75@gmail.com', '대표 계정')
ON CONFLICT (email) DO NOTHING;

-- 3. 대시보드에서 읽는 테이블들에 RLS 활성화
ALTER TABLE farm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_waitlist ENABLE ROW LEVEL SECURITY;

-- 4. 기존 정책이 있다면 삭제 (중복 방지)
DROP POLICY IF EXISTS "dashboard_select_allowed_only" ON farm_orders;
DROP POLICY IF EXISTS "dashboard_select_allowed_only" ON farm_customers;
DROP POLICY IF EXISTS "dashboard_select_allowed_only" ON farm_products;
DROP POLICY IF EXISTS "dashboard_select_allowed_only" ON farm_waitlist;

-- 5. 허용된 사용자만 SELECT 허용하는 정책 생성
CREATE POLICY "dashboard_select_allowed_only" ON farm_orders
FOR SELECT USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "dashboard_select_allowed_only" ON farm_customers
FOR SELECT USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "dashboard_select_allowed_only" ON farm_products
FOR SELECT USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "dashboard_select_allowed_only" ON farm_waitlist
FOR SELECT USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

-- 6. 추가 보안: INSERT/UPDATE/DELETE도 제한 (필요시)
-- 주문 관리 권한 (INSERT/UPDATE만 허용)
CREATE POLICY "dashboard_orders_manage_allowed_only" ON farm_orders
FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

-- 고객 관리 권한 (INSERT/UPDATE만 허용)
CREATE POLICY "dashboard_customers_manage_allowed_only" ON farm_customers
FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

-- 상품 관리 권한 (INSERT/UPDATE만 허용)
CREATE POLICY "dashboard_products_manage_allowed_only" ON farm_products
FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

-- 대기목록 관리 권한 (INSERT/UPDATE만 허용)
CREATE POLICY "dashboard_waitlist_manage_allowed_only" ON farm_waitlist
FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM allowed_users au 
        WHERE au.email = (auth.jwt() ->> 'email')
    )
);

-- 7. 허용 사용자 관리 함수 (선택사항)
-- 새로운 사용자를 허용 목록에 추가하는 함수
CREATE OR REPLACE FUNCTION add_allowed_user(user_email TEXT, user_note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO allowed_users (email, note)
    VALUES (user_email, user_note)
    ON CONFLICT (email) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 허용 사용자 목록 조회 함수
CREATE OR REPLACE FUNCTION get_allowed_users()
RETURNS TABLE(id INTEGER, email TEXT, note TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email, au.note, au.created_at
    FROM allowed_users au
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 허용 사용자 제거 함수
CREATE OR REPLACE FUNCTION remove_allowed_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM allowed_users WHERE email = user_email;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 실행 완료 후 확인사항:
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users에서 
--    허용할 사용자들의 이메일을 확인하세요.
-- 
-- 2. 허용 사용자 추가:
--    SELECT add_allowed_user('user@example.com', '직원 계정');
-- 
-- 3. 허용 사용자 목록 확인:
--    SELECT * FROM get_allowed_users();
-- 
-- 4. 허용 사용자 제거:
--    SELECT remove_allowed_user('user@example.com');
-- 
-- 5. 테스트: 허용되지 않은 계정으로 로그인하여 
--    대시보드 접근이 차단되는지 확인하세요.
-- ============================================







