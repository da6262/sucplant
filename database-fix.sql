-- 경산다육식물농장 고객등급 설정 테이블 수정
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 farm_customer_grades 테이블에 settings 컬럼 추가
ALTER TABLE farm_customer_grades 
ADD COLUMN IF NOT EXISTS settings JSONB;

-- 2. 고객등급 설정을 위한 새로운 테이블 생성 (더 명확한 구조)
CREATE TABLE IF NOT EXISTS farm_grade_settings (
    id TEXT PRIMARY KEY DEFAULT 'grade_thresholds',
    green_leaf_threshold INTEGER DEFAULT 100000,
    red_ruby_threshold INTEGER DEFAULT 200000,
    purple_emperor_threshold INTEGER DEFAULT 500000,
    black_diamond_threshold INTEGER DEFAULT 1000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 기본 설정 데이터 삽입
INSERT INTO farm_grade_settings (id, green_leaf_threshold, red_ruby_threshold, purple_emperor_threshold, black_diamond_threshold)
VALUES ('grade_thresholds', 100000, 200000, 500000, 1000000)
ON CONFLICT (id) DO UPDATE SET
    green_leaf_threshold = EXCLUDED.green_leaf_threshold,
    red_ruby_threshold = EXCLUDED.red_ruby_threshold,
    purple_emperor_threshold = EXCLUDED.purple_emperor_threshold,
    black_diamond_threshold = EXCLUDED.black_diamond_threshold,
    updated_at = NOW();

-- 4. RLS 설정
ALTER TABLE farm_grade_settings ENABLE ROW LEVEL SECURITY;

-- 5. 모든 사용자가 읽기/쓰기 가능하도록 설정 (개발용)
CREATE POLICY "Enable all access for all users" ON farm_grade_settings FOR ALL USING (true);

-- 6. 기존 farm_customer_grades 테이블도 RLS 설정
ALTER TABLE farm_customer_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for all users" ON farm_customer_grades FOR ALL USING (true);

