-- farm_products 바코드 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.farm_products
    ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'farm_products'
  AND column_name  = 'barcode';
