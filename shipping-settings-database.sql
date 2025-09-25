-- 배송비 설정 테이블 생성 및 데이터 삽입
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. farm_shipping_rules 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS farm_shipping_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    min_amount INTEGER,
    max_amount INTEGER,
    shipping_fee INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기본 배송비 설정 데이터 삽입
INSERT INTO farm_shipping_rules (id, name, min_amount, max_amount, shipping_fee, is_active)
VALUES (
    'shipping_settings',
    '기본 배송비 설정',
    50000,  -- 무료배송 기준 금액
    NULL,   -- 최대 금액 제한 없음
    4000,   -- 기본 배송비
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    min_amount = EXCLUDED.min_amount,
    max_amount = EXCLUDED.max_amount,
    shipping_fee = EXCLUDED.shipping_fee,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE farm_shipping_rules ENABLE ROW LEVEL SECURITY;

-- 4. 모든 사용자가 읽기/쓰기 가능하도록 정책 생성
CREATE POLICY "Allow all operations on farm_shipping_rules" ON farm_shipping_rules
    FOR ALL USING (true) WITH CHECK (true);

-- 5. 테이블 정보 확인
SELECT 
    'farm_shipping_rules' as table_name,
    COUNT(*) as record_count,
    '배송비 설정 테이블' as description
FROM farm_shipping_rules;

-- 6. 현재 설정 확인
SELECT * FROM farm_shipping_rules WHERE id = 'shipping_settings';

