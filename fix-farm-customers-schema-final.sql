-- farm_customers 테이블 최종 스키마 수정
-- 모든 누락된 컬럼 추가 및 데이터 타입 수정

-- 1. 누락된 컬럼들 추가
ALTER TABLE farm_customers 
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. ID 컬럼을 SERIAL에서 UUID로 변경 (정수 범위 초과 방지)
-- 기존 데이터가 있다면 백업 후 변경
DO $$
BEGIN
    -- ID 컬럼이 SERIAL인 경우에만 변경
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_customers' 
        AND column_name = 'id' 
        AND data_type = 'integer'
    ) THEN
        -- 임시 컬럼 추가
        ALTER TABLE farm_customers ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT gen_random_uuid();
        
        -- 기존 데이터 복사
        UPDATE farm_customers SET new_id = gen_random_uuid() WHERE new_id IS NULL;
        
        -- 기존 ID 컬럼 삭제
        ALTER TABLE farm_customers DROP COLUMN IF EXISTS id;
        
        -- 새 ID 컬럼을 기본키로 설정
        ALTER TABLE farm_customers RENAME COLUMN new_id TO id;
        ALTER TABLE farm_customers ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 3. 기존 데이터에 대한 기본값 설정
UPDATE farm_customers 
SET 
    registration_date = COALESCE(registration_date, NOW()),
    total_amount = COALESCE(total_amount, 0),
    order_count = COALESCE(order_count, 0),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    registration_date IS NULL OR 
    total_amount IS NULL OR 
    order_count IS NULL OR 
    created_at IS NULL OR 
    updated_at IS NULL;

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_farm_customers_phone ON farm_customers(phone);
CREATE INDEX IF NOT EXISTS idx_farm_customers_grade ON farm_customers(grade);
CREATE INDEX IF NOT EXISTS idx_farm_customers_registration_date ON farm_customers(registration_date);

-- 5. PostgREST 스키마 캐시 갱신
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

SELECT 'farm_customers 테이블 스키마 수정 완료!' as message;

