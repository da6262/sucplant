-- 경산다육식물농장 관리시스템 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 고객 테이블
CREATE TABLE IF NOT EXISTS farm_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    email VARCHAR(100),
    memo TEXT,
    grade VARCHAR(20) DEFAULT 'BRONZE',
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블
CREATE TABLE IF NOT EXISTS farm_products (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 주문 테이블
CREATE TABLE IF NOT EXISTS farm_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    order_status VARCHAR(50) DEFAULT '주문접수',
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

-- 4. 카테고리 테이블
CREATE TABLE IF NOT EXISTS farm_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(20),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 대기자 테이블
CREATE TABLE IF NOT EXISTS farm_waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(100),
    expected_price DECIMAL(10,2),
    register_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT '대기중',
    memo TEXT,
    priority INTEGER DEFAULT 0,
    last_contact TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 판매 채널 테이블
CREATE TABLE IF NOT EXISTS farm_channels (
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

-- 7. 주문 상태 테이블
CREATE TABLE IF NOT EXISTS farm_order_statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO farm_categories (name, color, description, sort_order) VALUES
('다육식물', '#10B981', '다육식물 카테고리', 1),
('화분', '#3B82F6', '화분 카테고리', 2),
('용품', '#8B5CF6', '재배용품 카테고리', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO farm_channels (name, icon, color, description, sort_order) VALUES
('쿠팡', 'fas fa-shopping-cart', '#FF6B35', '쿠팡 스마트스토어', 1),
('스마트스토어', 'fas fa-store', '#4F46E5', '네이버 스마트스토어', 2),
('Xplant', 'fas fa-leaf', '#10B981', 'Xplant 플랫폼', 3),
('라이브커머스', 'fas fa-video', '#EF4444', '라이브 방송 판매', 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO farm_order_statuses (name, color, description, sort_order) VALUES
('주문접수', '#6B7280', '새로운 주문이 접수됨', 1),
('입금확인', '#3B82F6', '결제 확인 완료', 2),
('배송준비', '#F59E0B', '상품 포장 준비 중', 3),
('배송시작', '#8B5CF6', '배송 시작', 4),
('배송완료', '#10B981', '배송 완료', 5),
('주문취소', '#EF4444', '주문 취소', 6),
('환불처리', '#DC2626', '환불 처리', 7)
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security) 설정
ALTER TABLE farm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_order_statuses ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모든 데이터에 접근 가능하도록 설정 (개발용)
CREATE POLICY "Enable all access for all users" ON farm_customers FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_products FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_orders FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_categories FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_waitlist FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_channels FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON farm_order_statuses FOR ALL USING (true);

