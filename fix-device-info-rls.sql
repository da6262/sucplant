-- device_info 테이블 RLS 정책 추가
-- Supabase SQL Editor에서 실행

-- 1. RLS 활성화
ALTER TABLE public.device_info ENABLE ROW LEVEL SECURITY;

-- 2. 읽기 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "allow read device_info" ON public.device_info
    FOR SELECT USING (true);

-- 3. 삽입 정책 (모든 사용자가 삽입 가능)
CREATE POLICY "allow insert device_info" ON public.device_info
    FOR INSERT WITH CHECK (true);

-- 4. 업데이트 정책 (모든 사용자가 업데이트 가능)
CREATE POLICY "allow update device_info" ON public.device_info
    FOR UPDATE USING (true) WITH CHECK (true);

-- 5. 삭제 정책 (모든 사용자가 삭제 가능)
CREATE POLICY "allow delete device_info" ON public.device_info
    FOR DELETE USING (true);

-- 6. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_info;

-- 7. 권한 재확인
GRANT ALL ON public.device_info TO anon, authenticated, service_role;

-- 8. 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'device_info';


