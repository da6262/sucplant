-- device_info 테이블 RLS 정책 확인 및 수정
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 RLS 정책 확인
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

-- 2. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'device_info' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "allow read device_info" ON public.device_info;
DROP POLICY IF EXISTS "allow insert device_info" ON public.device_info;
DROP POLICY IF EXISTS "allow update device_info" ON public.device_info;
DROP POLICY IF EXISTS "allow delete device_info" ON public.device_info;
DROP POLICY IF EXISTS "Enable all operations for device_info" ON public.device_info;

-- 4. RLS 비활성화 (개발용 - 모든 접근 허용)
ALTER TABLE public.device_info DISABLE ROW LEVEL SECURITY;

-- 5. 권한 재설정
GRANT ALL ON public.device_info TO anon, authenticated, service_role;

-- 6. 테이블에 데이터가 있는지 확인
SELECT COUNT(*) as device_count FROM public.device_info;

-- 7. 최근 디바이스 정보 확인
SELECT 
    id,
    type,
    platform,
    last_seen,
    created_at
FROM public.device_info 
ORDER BY last_seen DESC 
LIMIT 10;


