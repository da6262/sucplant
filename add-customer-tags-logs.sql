-- ==========================================================================
--  Phase A — 고객관리 체계화 기반 마이그레이션
--  실행: Supabase SQL Editor 에 이 파일 내용 붙여넣고 Run
--  안전성: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS 로 재실행 가능
-- ==========================================================================

-- 1) farm_customers 에 tags 컬럼 추가 (text array)
--    기존 고객 데이터는 빈 배열로 초기화됨
ALTER TABLE farm_customers
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];

-- 태그 검색 가속용 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_farm_customers_tags
    ON farm_customers USING GIN (tags);


-- 2) farm_customer_logs 신규 테이블
--    콜/상담/등급변동/자동태그 등 고객 타임라인을 한 테이블에 통합
CREATE TABLE IF NOT EXISTS farm_customer_logs (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id   UUID NOT NULL REFERENCES farm_customers(id) ON DELETE CASCADE,

    -- 이벤트 종류 (앱에서 필터·아이콘 분기용)
    --   call         : 통화 기록
    --   memo         : 일반 메모/상담
    --   grade_change : 등급 승격/강등 (수동·자동 모두)
    --   tag_change   : 태그 부여/제거 (자동 RFM 등)
    --   order_note   : 주문 관련 메모
    --   etc          : 기타
    log_type      VARCHAR(20) NOT NULL
                  CHECK (log_type IN ('call','memo','grade_change','tag_change','order_note','etc')),

    title         VARCHAR(200),           -- 한 줄 요약 (목록에 표시)
    body          TEXT,                   -- 상세 내용 (선택)

    -- 구조화 데이터: 등급변동 {old:"씨앗", new:"새싹", reason:"auto_period"}
    --               태그변동 {added:["VIP후보"], removed:[]}
    --               콜     {direction:"in|out", duration_sec:120}
    metadata      JSONB DEFAULT '{}'::JSONB,

    created_by    VARCHAR(100),           -- 입력자(추후 auth 연동) — 지금은 'admin' 하드코딩 가능
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 고객별 타임라인 조회용 인덱스 (최신순)
CREATE INDEX IF NOT EXISTS idx_farm_customer_logs_customer_created
    ON farm_customer_logs (customer_id, created_at DESC);

-- 타입별 필터용
CREATE INDEX IF NOT EXISTS idx_farm_customer_logs_type
    ON farm_customer_logs (log_type);


-- 3) RLS (기존 farm_customers 정책과 동일 패턴 — 전 사용자 전체 접근)
ALTER TABLE farm_customer_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON farm_customer_logs;
CREATE POLICY "Enable all access for all users"
    ON farm_customer_logs FOR ALL USING (true);


-- ==========================================================================
--  검증 쿼리 (실행 후 한 번씩 돌려보기)
-- ==========================================================================
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'farm_customers' AND column_name = 'tags';
--
-- SELECT count(*) FROM farm_customer_logs;      -- 0 이어야 정상
--
-- INSERT INTO farm_customer_logs (customer_id, log_type, title, body, created_by)
--   SELECT id, 'memo', '테스트 로그', '삭제해도 됨', 'admin'
--     FROM farm_customers LIMIT 1;
-- -- 확인 후: DELETE FROM farm_customer_logs WHERE title = '테스트 로그';
