-- Supabase에 device_info 테이블 생성
-- SQL Editor에서 실행하세요

-- 1. 디바이스 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.device_info (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
    user_agent TEXT,
    screen TEXT, -- '1920x1080'
    platform TEXT,
    language TEXT,
    timezone TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_device_info_type ON public.device_info(type);
CREATE INDEX IF NOT EXISTS idx_device_info_last_seen ON public.device_info(last_seen);
CREATE INDEX IF NOT EXISTS idx_device_info_platform ON public.device_info(platform);

-- 3. RLS (Row Level Security) 비활성화 (개발용)
ALTER TABLE public.device_info DISABLE ROW LEVEL SECURITY;

-- 4. 권한 설정 (모든 사용자가 읽기/쓰기 가능)
GRANT ALL ON public.device_info TO anon, authenticated, service_role;

-- 5. updated_at 자동 업데이트를 위한 트리거 함수 (이미 있다면 무시)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_device_info_updated_at ON public.device_info;
CREATE TRIGGER update_device_info_updated_at 
    BEFORE UPDATE ON public.device_info 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 테이블 코멘트 추가
COMMENT ON TABLE public.device_info IS '크로스 디바이스 동기화를 위한 디바이스 정보 관리 테이블';
COMMENT ON COLUMN public.device_info.id IS '고유 디바이스 ID';
COMMENT ON COLUMN public.device_info.type IS '디바이스 타입 (mobile, tablet, desktop)';
COMMENT ON COLUMN public.device_info.user_agent IS '브라우저 User Agent';
COMMENT ON COLUMN public.device_info.screen IS '화면 해상도 (예: 1920x1080)';
COMMENT ON COLUMN public.device_info.platform IS '운영체제 플랫폼';
COMMENT ON COLUMN public.device_info.language IS '브라우저 언어 설정';
COMMENT ON COLUMN public.device_info.timezone IS '사용자 시간대';
COMMENT ON COLUMN public.device_info.last_seen IS '마지막 접속 시간';

-- 8. 테이블 생성 확인
SELECT 'device_info 테이블이 성공적으로 생성되었습니다!' as message;

-- 9. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'device_info' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. 권한 확인
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'device_info' 
AND table_schema = 'public';



