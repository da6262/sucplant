-- farm_customers 테이블 스키마 수정
-- PostgREST 스키마 캐시 문제 해결을 위한 컬럼 추가

-- 1. 누락된 컬럼들 추가
ALTER TABLE farm_customers 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS memo TEXT,
ADD COLUMN IF NOT EXISTS grade VARCHAR(20) DEFAULT 'GENERAL',
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. 기존 데이터에 대한 기본값 설정
UPDATE farm_customers 
SET 
    address = COALESCE(address, ''),
    email = COALESCE(email, ''),
    memo = COALESCE(memo, ''),
    grade = COALESCE(grade, 'GENERAL'),
    registration_date = COALESCE(registration_date, NOW()),
    total_amount = COALESCE(total_amount, 0),
    order_count = COALESCE(order_count, 0),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    address IS NULL OR 
    email IS NULL OR 
    memo IS NULL OR 
    grade IS NULL OR 
    registration_date IS NULL OR 
    total_amount IS NULL OR 
    order_count IS NULL OR 
    created_at IS NULL OR 
    updated_at IS NULL;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_farm_customers_grade ON farm_customers(grade);
CREATE INDEX IF NOT EXISTS idx_farm_customers_total_amount ON farm_customers(total_amount);
CREATE INDEX IF NOT EXISTS idx_farm_customers_order_count ON farm_customers(order_count);
CREATE INDEX IF NOT EXISTS idx_farm_customers_registration_date ON farm_customers(registration_date);

-- 4. PostgREST 스키마 캐시 갱신을 위한 테이블 새로고침
-- (PostgREST가 자동으로 감지하지만, 명시적으로 갱신)
NOTIFY pgrst, 'reload schema';

-- 5. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'farm_customers' 
ORDER BY ordinal_position;

-- 6. 완료 메시지
SELECT 'farm_customers 테이블 스키마 수정 완료!' as message;







