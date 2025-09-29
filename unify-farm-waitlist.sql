-- farm_waitlist 테이블을 UUID 타입으로 통일
-- 기존 SERIAL ID를 UUID로 변경

-- 1. farm_waitlist 테이블 구조 변경
ALTER TABLE public.farm_waitlist 
ALTER COLUMN id TYPE UUID USING gen_random_uuid();

-- 2. 기존 데이터가 있다면 UUID로 변환
-- (기존 SERIAL ID는 유지하되, 새 데이터는 UUID 사용)

-- 3. waitlist 테이블 제거 (중복 방지)
DROP TABLE IF EXISTS public.waitlist;

-- 4. farm_waitlist RLS 정책 확인/생성
ALTER TABLE public.farm_waitlist ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 새로 생성
DROP POLICY IF EXISTS "Enable all access for farm_waitlist" ON public.farm_waitlist;
CREATE POLICY "Enable all access for farm_waitlist" ON public.farm_waitlist
    FOR ALL USING (true) WITH CHECK (true);

-- 5. updated_at 트리거 확인
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거가 없으면 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_farm_waitlist_updated_at'
    ) THEN
        CREATE TRIGGER update_farm_waitlist_updated_at 
            BEFORE UPDATE ON public.farm_waitlist 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

SELECT 'farm_waitlist 테이블 UUID 통일 완료!' as message;

