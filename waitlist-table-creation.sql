-- 대기자 목록 테이블 생성 (앱과 일치하는 스키마)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(100),
    expected_price INTEGER,
    register_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT '대기중',
    memo TEXT,
    priority INTEGER DEFAULT 3,
    last_contact TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_waitlist_customer_name ON public.waitlist(customer_name);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_register_date ON public.waitlist(register_date);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable all access for waitlist" ON public.waitlist
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
CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON public.waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
SELECT 'waitlist 테이블이 성공적으로 생성되었습니다!' as message;
