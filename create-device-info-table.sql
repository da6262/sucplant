-- device_info 테이블 생성
CREATE TABLE IF NOT EXISTS public.device_info (
    id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL, -- 'desktop', 'mobile', 'tablet'
    platform TEXT NOT NULL,   -- 'Windows', 'Android', 'iOS', 'macOS', 'Linux'
    browser TEXT,              -- 'Chrome', 'Firefox', 'Safari', 'Edge'
    user_agent TEXT,
    screen_resolution TEXT,   -- '1920x1080', '375x667'
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    sync_status TEXT DEFAULT 'connected', -- 'connected', 'disconnected', 'syncing'
    app_version TEXT,         -- 앱 버전 정보
    location TEXT,            -- 위치 정보 (선택사항)
    notes TEXT                -- 추가 메모
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_info_last_seen ON public.device_info(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_device_info_device_type ON public.device_info(device_type);
CREATE INDEX IF NOT EXISTS idx_device_info_is_active ON public.device_info(is_active);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.device_info ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Enable all operations for device_info" ON public.device_info
    FOR ALL USING (true) WITH CHECK (true);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_device_info_updated_at ON public.device_info;
CREATE TRIGGER update_device_info_updated_at
    BEFORE UPDATE ON public.device_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트 추가
COMMENT ON TABLE public.device_info IS '디바이스 접속 정보 및 동기화 상태 관리';
COMMENT ON COLUMN public.device_info.id IS '고유 디바이스 ID';
COMMENT ON COLUMN public.device_info.device_type IS '디바이스 타입 (desktop, mobile, tablet)';
COMMENT ON COLUMN public.device_info.platform IS '운영체제 플랫폼';
COMMENT ON COLUMN public.device_info.last_seen IS '마지막 접속 시간';
COMMENT ON COLUMN public.device_info.sync_status IS '동기화 상태 (connected, disconnected, syncing)';