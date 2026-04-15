-- =====================================================
-- farm_products 선택적 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 1. product_code (상품 코드) — 아직 없다면 추가
ALTER TABLE public.farm_products
    ADD COLUMN IF NOT EXISTS product_code VARCHAR(50);

-- 2. status (상품 상태: active / inactive)
ALTER TABLE public.farm_products
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

UPDATE public.farm_products
SET status = 'active'
WHERE status IS NULL;

-- 3. profit_margin (수익률 %)
ALTER TABLE public.farm_products
    ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2) DEFAULT 0;

UPDATE public.farm_products
SET profit_margin = CASE
    WHEN cost > 0 AND price > cost
        THEN ROUND(((price - cost) / price * 100)::NUMERIC, 2)
    ELSE 0
END
WHERE profit_margin IS NULL OR profit_margin = 0;

-- 4. 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'farm_products'
ORDER BY ordinal_position;
