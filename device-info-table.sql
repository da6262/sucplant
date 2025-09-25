-- 디바이스 정보 테이블 생성
-- 크로스 디바이스 동기화를 위한 디바이스 관리 테이블

CREATE TABLE IF NOT EXISTS device_info (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
    user_agent TEXT,
    screen TEXT, -- '1920x1080'
    platform TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_info_type ON device_info(type);
CREATE INDEX IF NOT EXISTS idx_device_info_last_seen ON device_info(last_seen);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE device_info ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (개발용)
CREATE POLICY "Allow all operations on device_info" ON device_info
    FOR ALL USING (true) WITH CHECK (true);

-- 테이블 코멘트 추가
COMMENT ON TABLE device_info IS '크로스 디바이스 동기화를 위한 디바이스 정보 관리 테이블';
COMMENT ON COLUMN device_info.id IS '고유 디바이스 ID';
COMMENT ON COLUMN device_info.type IS '디바이스 타입 (mobile, tablet, desktop)';
COMMENT ON COLUMN device_info.user_agent IS '브라우저 User Agent';
COMMENT ON COLUMN device_info.screen IS '화면 해상도 (예: 1920x1080)';
COMMENT ON COLUMN device_info.platform IS '운영체제 플랫폼';
COMMENT ON COLUMN device_info.last_seen IS '마지막 접속 시간';






