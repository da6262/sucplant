-- Supabase 스키마 수정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. farm_customers 테이블 ID 컬럼을 TEXT로 변경
ALTER TABLE farm_customers ALTER COLUMN id TYPE TEXT;

-- 2. 누락된 컬럼들 추가
ALTER TABLE farm_customers 
ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;

-- 3. customers 테이블이 있다면 address 컬럼 추가
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS address TEXT;

-- 4. 기존 데이터에 대한 기본값 설정
UPDATE farm_customers 
SET 
    total_amount = COALESCE(total_amount, 0),
    order_count = COALESCE(order_count, 0)
WHERE total_amount IS NULL OR order_count IS NULL;

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_farm_customers_total_amount ON farm_customers(total_amount);
CREATE INDEX IF NOT EXISTS idx_farm_customers_order_count ON farm_customers(order_count);
CREATE INDEX IF NOT EXISTS idx_farm_customers_grade ON farm_customers(grade);

-- 6. PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 7. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'farm_customers' 
ORDER BY ordinal_position;

-- 8. 완료 메시지
SELECT 'Supabase 스키마 수정 완료!' as message;


