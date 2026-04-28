-- ============================================================
-- 마이그레이션: 상품준비 → 배송준비 통합 (v3.4.72)
-- ============================================================
-- 배경: 1인 운영 농장에서 "상품준비"와 "배송준비" 단계 분리가 의미 없어
--       하나의 "배송준비" 단계로 통합. 기존 데이터 일괄 변환.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 아래 쿼리 붙여넣고 실행
-- 안전성: UPDATE 만 사용, DROP 없음. 영향 범위: '상품준비' 행만.
-- 롤백 가능: 변환 전에 SELECT COUNT 로 영향받는 행 수 확인 권장.

-- 1단계: 영향받는 주문 건수 확인 (실행 전 SELECT 로 미리 보기)
SELECT COUNT(*) AS migration_target_count
FROM farm_orders
WHERE order_status = '상품준비';

-- 2단계: 일괄 변환 (위 건수 확인 후 실행)
UPDATE farm_orders
SET order_status = '배송준비',
    updated_at  = NOW()
WHERE order_status = '상품준비';

-- 3단계: farm_settings JSONB 의 orderStatuses 배열에서도 상품준비 항목 제거
--   주의: 사용자가 환경설정에서 등급명·색상을 커스텀했을 수 있어
--         이 쿼리는 *기본 라벨이 그대로 인 경우만* 안전 — 검토 후 실행.
UPDATE farm_settings
SET settings = jsonb_set(
    settings,
    '{orderStatuses}',
    (
        SELECT jsonb_agg(elem)
        FROM jsonb_array_elements(settings -> 'orderStatuses') AS elem
        WHERE elem ->> 'value' <> '상품준비'
    )
)
WHERE id = 1
  AND settings ? 'orderStatuses';

-- 4단계: 검증
SELECT order_status, COUNT(*) AS cnt
FROM farm_orders
GROUP BY order_status
ORDER BY cnt DESC;
-- → 결과에 '상품준비' 가 없어야 함

SELECT settings -> 'orderStatuses' AS order_statuses
FROM farm_settings
WHERE id = 1;
-- → 배열에 '상품준비' 가 없어야 함
