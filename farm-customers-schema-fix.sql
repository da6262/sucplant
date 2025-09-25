-- farm_customers 테이블 스키마 수정
-- PostgREST 스키마 캐시 문제 해결을 위한 컬럼 추가

-- 1. 누락된 컬럼들 추가
ALTER TABLE farm_customers 
ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;

-- 2. 기존 데이터에 대한 기본값 설정
UPDATE farm_customers 
SET 
    total_amount = COALESCE(total_amount, 0),
    order_count = COALESCE(order_count, 0)
WHERE total_amount IS NULL OR order_count IS NULL;

-- 3. 컬럼 제약 조건 추가 (선택사항)
ALTER TABLE farm_customers 
ALTER COLUMN total_amount SET NOT NULL,
ALTER COLUMN order_count SET NOT NULL;

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_farm_customers_total_amount ON farm_customers(total_amount);
CREATE INDEX IF NOT EXISTS idx_farm_customers_order_count ON farm_customers(order_count);
CREATE INDEX IF NOT EXISTS idx_farm_customers_grade ON farm_customers(grade);

-- 5. PostgREST 스키마 캐시 갱신을 위한 테이블 새로고침
-- (PostgREST가 자동으로 감지하지만, 명시적으로 갱신)
NOTIFY pgrst, 'reload schema';

-- 6. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'farm_customers' 
ORDER BY ordinal_position;

-- 7. 완료 메시지
SELECT 'farm_customers 테이블 스키마 수정 완료!' as message;







