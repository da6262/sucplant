-- 경산다육식물농장 관리시스템 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 고객 테이블
CREATE TABLE IF NOT EXISTS farm_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    grade VARCHAR(20) DEFAULT '일반',
    memo TEXT,
    total_amount INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블
CREATE TABLE IF NOT EXISTS farm_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    size VARCHAR(50),
    price INTEGER NOT NULL,
    cost INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    shipping_option VARCHAR(50) DEFAULT '일반배송',
    description TEXT,
    tags TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 주문 테이블
CREATE TABLE IF NOT EXISTS farm_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES farm_customers(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    status VARCHAR(50) DEFAULT '주문접수',
    total_amount INTEGER NOT NULL,
    shipping_fee INTEGER DEFAULT 0,
    memo TEXT,
    print_status VARCHAR(50) DEFAULT 'pending',
    sms_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 주문 상품 테이블 (주문-상품 다대다 관계)
CREATE TABLE IF NOT EXISTS farm_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES farm_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES farm_products(id),
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 카테고리 테이블
CREATE TABLE IF NOT EXISTS farm_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT 'green',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 대기자 테이블
CREATE TABLE IF NOT EXISTS farm_waitlist (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    expected_price INTEGER,
    priority VARCHAR(20) DEFAULT '보통',
    memo TEXT,
    status VARCHAR(50) DEFAULT '대기',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 판매 채널 테이블
CREATE TABLE IF NOT EXISTS farm_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'store',
    color VARCHAR(20) DEFAULT 'green',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 주문 상태 테이블
CREATE TABLE IF NOT EXISTS farm_order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT 'gray',
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 배송 규칙 테이블
CREATE TABLE IF NOT EXISTS farm_shipping_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    free_shipping_threshold INTEGER DEFAULT 50000,
    shipping_fee INTEGER DEFAULT 4000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 고객 등급 테이블
CREATE TABLE IF NOT EXISTS farm_customer_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    min_amount INTEGER DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT 'gray',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO farm_categories (name, color) VALUES 
('일반종', 'green'),
('희귀종', 'purple'),
('새싹', 'yellow')
ON CONFLICT (name) DO NOTHING;

INSERT INTO farm_channels (name, description, icon, color) VALUES 
('직접판매', '농장에서 직접 판매', 'store', 'green'),
('온라인쇼핑몰', '온라인 쇼핑몰 판매', 'shopping', 'blue'),
('모바일앱', '모바일 앱을 통한 판매', 'mobile', 'purple')
ON CONFLICT (name) DO NOTHING;

INSERT INTO farm_order_statuses (name, color, sort_order) VALUES 
('주문접수', 'blue', 1),
('결제완료', 'green', 2),
('포장준비', 'yellow', 3),
('배송시작', 'orange', 4),
('배송완료', 'green', 5),
('주문취소', 'red', 6),
('환불처리', 'red', 7)
ON CONFLICT (name) DO NOTHING;

INSERT INTO farm_customer_grades (name, min_amount, discount_rate, color) VALUES 
('일반', 0, 0.00, 'gray'),
('B등급', 100000, 2.00, 'blue'),
('S등급', 300000, 5.00, 'silver'),
('G등급', 500000, 8.00, 'gold'),
('VIP', 1000000, 10.00, 'purple')
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security) 설정
ALTER TABLE farm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_customer_grades ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대해 공개 읽기/쓰기 정책 설정 (개발용)
CREATE POLICY "Enable all operations for all users" ON farm_customers FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_products FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_orders FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_order_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_categories FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_waitlist FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_channels FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_order_statuses FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_shipping_rules FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON farm_customer_grades FOR ALL USING (true);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON farm_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON farm_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON farm_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON farm_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON farm_products(category);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON farm_customers(phone);
