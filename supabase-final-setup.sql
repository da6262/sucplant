-- ============================================================
-- 경산다육식물농장 관리시스템 - Supabase 최종 셋업 SQL
-- Supabase SQL Editor에서 이 파일을 실행하세요.
-- ⚠️ 이미 실행한 경우 IF NOT EXISTS / ON CONFLICT 로 안전하게 재실행 가능
-- ============================================================

-- ============================================================
-- 1. updated_at 자동갱신 트리거 함수 (없으면 생성)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- 2. 기본 테이블 보완 (없으면 생성)
-- ============================================================

-- 고객 테이블
CREATE TABLE IF NOT EXISTS public.farm_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    address_detail TEXT,
    email VARCHAR(100),
    memo TEXT,
    grade VARCHAR(20) DEFAULT 'BRONZE',
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.farm_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(20),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 상품 테이블
CREATE TABLE IF NOT EXISTS public.farm_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    size VARCHAR(50),
    shipping_option VARCHAR(50),
    image_url TEXT,
    product_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 판매 채널 테이블
CREATE TABLE IF NOT EXISTS public.farm_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS public.farm_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    order_status VARCHAR(50) DEFAULT '주문접수',
    payment_status VARCHAR(50),
    delivery_status VARCHAR(50),
    tracking_number VARCHAR(100),
    total_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    memo TEXT,
    order_items JSONB,
    order_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대기자 테이블
CREATE TABLE IF NOT EXISTS public.farm_waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(100),
    expected_price DECIMAL(10,2),
    register_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT '대기중',
    memo TEXT,
    priority INTEGER DEFAULT 3,
    last_contact TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. 관계형 개선: FK 컬럼 추가
-- ============================================================

-- farm_orders에 customer_id FK 컬럼 추가
ALTER TABLE public.farm_orders
    ADD COLUMN IF NOT EXISTS customer_id UUID;

-- farm_orders에 channel_id FK 컬럼 추가
ALTER TABLE public.farm_orders
    ADD COLUMN IF NOT EXISTS channel_id UUID;

-- farm_products에 category_id FK 컬럼 추가
ALTER TABLE public.farm_products
    ADD COLUMN IF NOT EXISTS category_id UUID;

-- farm_waitlist에 customer_id FK 컬럼 추가
ALTER TABLE public.farm_waitlist
    ADD COLUMN IF NOT EXISTS customer_id UUID;

-- ============================================================
-- 4. 기존 데이터로 FK 컬럼 값 채우기
-- ============================================================

-- 주문의 customer_id: 전화번호로 고객 매핑
UPDATE public.farm_orders o
SET customer_id = c.id
FROM public.farm_customers c
WHERE c.phone = o.customer_phone
  AND o.customer_id IS NULL;

-- 주문의 channel_id: order_source 문자열로 채널 매핑
UPDATE public.farm_orders o
SET channel_id = ch.id
FROM public.farm_channels ch
WHERE ch.name = o.order_source
  AND o.channel_id IS NULL;

-- 상품의 category_id: category 문자열로 카테고리 매핑
UPDATE public.farm_products p
SET category_id = c.id
FROM public.farm_categories c
WHERE c.name = p.category
  AND p.category_id IS NULL;

-- 대기자의 customer_id: 전화번호로 고객 매핑
UPDATE public.farm_waitlist w
SET customer_id = c.id
FROM public.farm_customers c
WHERE c.phone = w.customer_phone
  AND w.customer_id IS NULL;

-- ============================================================
-- 5. FK 제약조건 추가 (이미 있으면 skip)
-- ============================================================

DO $$ BEGIN
    ALTER TABLE public.farm_orders
        ADD CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES public.farm_customers(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.farm_orders
        ADD CONSTRAINT fk_orders_channel
        FOREIGN KEY (channel_id) REFERENCES public.farm_channels(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.farm_products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES public.farm_categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.farm_waitlist
        ADD CONSTRAINT fk_waitlist_customer
        FOREIGN KEY (customer_id) REFERENCES public.farm_customers(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 6. farm_order_items 테이블 생성 (정규화)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.farm_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID,                        -- nullable: 상품이 삭제되어도 주문 기록 유지
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 앱에서 계산해서 저장
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES public.farm_orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES public.farm_products(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- 기존 테이블에 누락된 컬럼 추가 (멱등성 보장)
ALTER TABLE public.farm_order_items ADD COLUMN IF NOT EXISTS product_code VARCHAR(50);
ALTER TABLE public.farm_order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.farm_order_items ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE public.farm_order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================
-- 7. 기존 order_items JSONB → farm_order_items 마이그레이션
-- ============================================================

WITH valid_orders AS (
    SELECT * FROM public.farm_orders
    WHERE order_items IS NOT NULL
      AND jsonb_typeof(order_items) = 'array'
      AND order_items != '[]'::jsonb
)
INSERT INTO public.farm_order_items (
    order_id, product_id, product_name, product_code,
    quantity, unit_price, total_price
)
SELECT
    o.id AS order_id,
    p.id AS product_id,
    COALESCE(item->>'name', item->>'product_name', '알 수 없음') AS product_name,
    p.product_code,
    GREATEST(1, COALESCE((item->>'quantity')::INTEGER, 1)) AS quantity,
    COALESCE((item->>'price')::DECIMAL, (item->>'unit_price')::DECIMAL, 0) AS unit_price,
    COALESCE(
        (item->>'total')::DECIMAL,
        (item->>'total_price')::DECIMAL,
        GREATEST(1, COALESCE((item->>'quantity')::INTEGER, 1)) *
        COALESCE((item->>'price')::DECIMAL, (item->>'unit_price')::DECIMAL, 0)
    ) AS total_price
FROM valid_orders o
CROSS JOIN LATERAL jsonb_array_elements(o.order_items) AS item
LEFT JOIN public.farm_products p
    ON p.name = COALESCE(item->>'name', item->>'product_name')
WHERE NOT EXISTS (
    SELECT 1 FROM public.farm_order_items oi WHERE oi.order_id = o.id
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. 추가 테이블 (보조 마스터 데이터)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.farm_order_statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#6B7280',
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farm_customer_grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    color VARCHAR(20) DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farm_shipping_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_amount DECIMAL(10,2),
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. 기본 마스터 데이터 삽입
-- ============================================================

INSERT INTO public.farm_categories (name, color, description, sort_order) VALUES
('다육식물', '#10B981', '다육식물 카테고리', 1),
('화분', '#3B82F6', '화분 카테고리', 2),
('용품', '#8B5CF6', '재배용품 카테고리', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.farm_channels (name, icon, color, description, sort_order) VALUES
('쿠팡', 'fas fa-shopping-cart', '#FF6B35', '쿠팡 스마트스토어', 1),
('스마트스토어', 'fas fa-store', '#4F46E5', '네이버 스마트스토어', 2),
('Xplant', 'fas fa-leaf', '#10B981', 'Xplant 플랫폼', 3),
('라이브커머스', 'fas fa-video', '#EF4444', '라이브 방송 판매', 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.farm_order_statuses (name, color, description, sort_order) VALUES
('주문접수', '#6B7280', '새로운 주문이 접수됨', 1),
('입금확인', '#3B82F6', '결제 확인 완료', 2),
('배송준비', '#F59E0B', '상품 포장 준비 중', 3),
('배송시작', '#8B5CF6', '배송 시작', 4),
('배송완료', '#10B981', '배송 완료', 5),
('주문취소', '#EF4444', '주문 취소', 6),
('환불처리', '#DC2626', '환불 처리', 7)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.farm_customer_grades (name, description, discount_rate, min_purchase_amount, color, sort_order) VALUES
('BRONZE', '일반 고객', 0, 0, '#CD7F32', 1),
('SILVER', '실버 등급', 5, 100000, '#C0C0C0', 2),
('GOLD', '골드 등급', 10, 300000, '#FFD700', 3),
('VIP', 'VIP 고객', 15, 500000, '#8B5CF6', 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.farm_shipping_rules (name, min_amount, max_amount, shipping_fee, free_shipping_threshold) VALUES
('기본 배송비', 0, NULL, 3000, 50000),
('무료 배송', 50000, NULL, 0, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. 인덱스
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_farm_orders_customer_id   ON public.farm_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_farm_orders_channel_id    ON public.farm_orders(channel_id);
CREATE INDEX IF NOT EXISTS idx_farm_orders_order_date    ON public.farm_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_orders_status        ON public.farm_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_farm_products_category_id ON public.farm_products(category_id);
CREATE INDEX IF NOT EXISTS idx_farm_order_items_order_id ON public.farm_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_farm_order_items_product  ON public.farm_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_farm_waitlist_customer_id ON public.farm_waitlist(customer_id);
CREATE INDEX IF NOT EXISTS idx_farm_waitlist_status      ON public.farm_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_farm_customers_phone      ON public.farm_customers(phone);

-- ============================================================
-- 11. RLS (Row Level Security) — 전체 허용 (개발/운영 공용)
-- ============================================================

ALTER TABLE public.farm_customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_waitlist       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_channels       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_customer_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_shipping_rules ENABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 삭제 후 통일된 정책 적용
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname = 'public' AND tablename LIKE 'farm_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "allow_all" ON public.farm_customers      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_products       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_orders         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_categories     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_waitlist       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_channels       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_order_items    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_order_statuses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_customer_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.farm_shipping_rules FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 12. updated_at 트리거 적용
-- ============================================================

DROP TRIGGER IF EXISTS trg_farm_customers_updated_at      ON public.farm_customers;
DROP TRIGGER IF EXISTS trg_farm_products_updated_at       ON public.farm_products;
DROP TRIGGER IF EXISTS trg_farm_orders_updated_at         ON public.farm_orders;
DROP TRIGGER IF EXISTS trg_farm_order_items_updated_at    ON public.farm_order_items;
DROP TRIGGER IF EXISTS trg_farm_waitlist_updated_at       ON public.farm_waitlist;
DROP TRIGGER IF EXISTS trg_farm_categories_updated_at     ON public.farm_categories;
DROP TRIGGER IF EXISTS trg_farm_channels_updated_at       ON public.farm_channels;

CREATE TRIGGER trg_farm_customers_updated_at
    BEFORE UPDATE ON public.farm_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_products_updated_at
    BEFORE UPDATE ON public.farm_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_orders_updated_at
    BEFORE UPDATE ON public.farm_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_order_items_updated_at
    BEFORE UPDATE ON public.farm_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_waitlist_updated_at
    BEFORE UPDATE ON public.farm_waitlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_categories_updated_at
    BEFORE UPDATE ON public.farm_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_channels_updated_at
    BEFORE UPDATE ON public.farm_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 완료 확인
-- ============================================================
SELECT
    (SELECT COUNT(*) FROM public.farm_customers)      AS 고객수,
    (SELECT COUNT(*) FROM public.farm_orders)         AS 주문수,
    (SELECT COUNT(*) FROM public.farm_order_items)    AS 주문상품수,
    (SELECT COUNT(*) FROM public.farm_products)       AS 상품수,
    (SELECT COUNT(*) FROM public.farm_waitlist)       AS 대기자수,
    (SELECT COUNT(*) FROM public.farm_categories)     AS 카테고리수,
    (SELECT COUNT(*) FROM public.farm_channels)       AS 채널수;
