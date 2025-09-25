-- farm_channels 테이블 수정 및 RLS 정책 설정

-- 1. farm_channels 테이블이 존재하는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS farm_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'store',
    color VARCHAR(20) DEFAULT 'green',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. updated_at 컬럼이 없으면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'farm_channels' AND column_name = 'updated_at') THEN
        ALTER TABLE farm_channels ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. RLS 활성화
ALTER TABLE farm_channels ENABLE ROW LEVEL SECURITY;

-- 4. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_channels;
DROP POLICY IF EXISTS "Enable all access for all users" ON farm_channels;

-- 5. 새로운 정책 생성 (모든 사용자가 모든 작업 가능)
CREATE POLICY "Enable all operations for all users" ON farm_channels FOR ALL USING (true);

-- 6. 기본 데이터 삽입 (없는 경우만)
INSERT INTO farm_channels (name, description, icon, color) VALUES 
('직접판매', '농장에서 직접 판매', 'store', 'green'),
('온라인쇼핑몰', '온라인 쇼핑몰 판매', 'shopping', 'blue'),
('모바일앱', '모바일 앱을 통한 판매', 'mobile', 'purple'),
('전화주문', '전화를 통한 주문', 'phone', 'orange'),
('카카오톡', '카카오톡을 통한 주문', 'chat', 'yellow')
ON CONFLICT (name) DO NOTHING;

-- 7. 테이블 권한 확인
GRANT ALL ON farm_channels TO anon;
GRANT ALL ON farm_channels TO authenticated;
GRANT ALL ON farm_channels TO service_role;

-- 8. 시퀀스 권한 확인
GRANT USAGE, SELECT ON SEQUENCE farm_channels_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE farm_channels_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE farm_channels_id_seq TO service_role;

-- 9. 테이블 상태 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'farm_channels'
ORDER BY ordinal_position;

-- 10. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'farm_channels';

