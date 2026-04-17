-- ============================================
-- get_order_rows RPC — ORDER_ROW_DATA_SPEC 10필드 규칙대로 100% 채움
-- ============================================
--
-- 규칙:
-- 1) items_subtotal = farm_order_items 의 Σ(subtotal) 로 계산 반환
-- 2) order_items_summary = 대표상품(quantity 최다, 동률이면 created_at/id 오름차순). N=0 "대표상품명", N>0 "대표상품명 외 N건"
-- 3) d_day = KST 날짜 기준 date diff 정수. order_status '배송완료'/'주문취소' 이면 NULL
-- 4) total_amount, shipping_fee, discount_amount, order_status 등 = farm_orders 값 그대로.
--    payment_status / delivery_status = order_status 기반 파생값만 반환 (스키마 변경 없음, DB 컬럼 미참조).
--
-- PGRST203 방지: get_order_rows 오버로드가 2개 있으면 PostgREST가 선택 불가. 기존 모든 시그니처 삭제 후 단일(TEXT) 버전만 생성.
-- 실행 후 NOTIFY pgrst, 'reload schema'; 포함.
-- 검증: 주문관리 새로고침 → /rpc/get_order_rows 200, validateOrderRowSpec() ok true
-- ============================================

-- 기존 get_order_rows 모든 오버로드 삭제 (PGRST203 "Could not choose the best candidate" 해결)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_order_rows'
  )
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.get_order_rows(%s)', r.args);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.get_order_rows(
  p_filter_status TEXT DEFAULT NULL,
  p_limit INT DEFAULT 200,
  p_offset INT DEFAULT 0,
  p_date_from TEXT DEFAULT NULL,
  p_date_to TEXT DEFAULT NULL,
  p_channel TEXT DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  order_created_at TIMESTAMPTZ,
  d_day INT,
  customer_name TEXT,
  customer_phone_last4 TEXT,
  order_items_summary TEXT,
  items_subtotal NUMERIC,
  shipping_fee NUMERIC,
  discount_amount NUMERIC,
  total_amount NUMERIC,
  payment_status TEXT,
  order_status TEXT,
  delivery_status TEXT,
  sms_sent_at TIMESTAMPTZ,
  printed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH order_items_agg AS (
    SELECT
      oi.order_id,
      COUNT(*)::INT AS item_count,
      COALESCE(SUM(oi.total_price), 0)::NUMERIC AS items_subtotal,
      (array_agg(oi.product_name ORDER BY oi.quantity DESC NULLS LAST, oi.created_at ASC NULLS LAST, oi.id ASC))[1] AS rep_name,
      (array_agg(oi.quantity ORDER BY oi.quantity DESC NULLS LAST, oi.created_at ASC NULLS LAST, oi.id ASC))[1] AS rep_qty
    FROM farm_order_items oi
    GROUP BY oi.order_id
  ),
  kst_today AS (
    SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::DATE AS d
  ),
  filtered AS (
    SELECT o.id AS oid
    FROM farm_orders o
    CROSS JOIN kst_today k
    WHERE (
      (p_filter_status IS NULL OR p_filter_status = '' OR p_filter_status = 'all'
        OR (p_filter_status = 'work_todo'     AND COALESCE(o.order_status, '') IN ('상품준비','배송준비'))
        OR (p_filter_status = 'work_deposit'  AND COALESCE(o.order_status, '') = '입금대기')
        OR (p_filter_status = 'work_ship_today' AND COALESCE(o.order_status, '') IN ('배송준비','배송중'))
        OR (p_filter_status = 'work_done'     AND COALESCE(o.order_status, '') = '배송완료')
        OR (p_filter_status NOT IN ('work_todo','work_deposit','work_ship_today','work_done','all') AND COALESCE(o.order_status, '') = p_filter_status))
      AND (p_date_from IS NULL OR TRIM(COALESCE(p_date_from, '')) = '' OR (COALESCE(o.created_at, o.order_date) AT TIME ZONE 'Asia/Seoul') >= (TRIM(p_date_from)::timestamptz))
      AND (p_date_to IS NULL OR TRIM(COALESCE(p_date_to, '')) = '' OR (COALESCE(o.created_at, o.order_date) AT TIME ZONE 'Asia/Seoul') <= (TRIM(p_date_to)::timestamptz))
      AND (p_channel IS NULL OR p_channel = '' OR COALESCE(o.order_channel, '') = p_channel)
      AND (p_search_text IS NULL OR p_search_text = '' OR o.customer_name ILIKE '%' || p_search_text || '%' OR o.customer_phone LIKE '%' || p_search_text || '%' OR o.order_number ILIKE '%' || p_search_text || '%')
    )
    ORDER BY o.order_date DESC NULLS LAST, o.created_at DESC NULLS LAST
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 1000))
    OFFSET GREATEST(0, COALESCE(p_offset, 0))
  )
  SELECT
    o.id AS order_id,
    COALESCE(o.order_number, '') AS order_number,
    COALESCE(o.created_at, o.order_date) AS order_created_at,
    CASE
      WHEN COALESCE(o.order_status, '') IN ('배송완료','주문취소') THEN NULL::INT
      ELSE (k.d - ((COALESCE(o.created_at, o.order_date) AT TIME ZONE 'Asia/Seoul')::DATE))::INT
    END AS d_day,
    COALESCE(NULLIF(TRIM(o.customer_name), ''), '고객명 없음') AS customer_name,
    CASE
      WHEN o.customer_phone IS NULL OR TRIM(o.customer_phone) = '' THEN NULL
      ELSE RIGHT(REGEXP_REPLACE(o.customer_phone, '[^0-9]', '', 'g'), 4)
    END AS customer_phone_last4,
    CASE
      WHEN a.item_count IS NULL OR a.item_count = 0 THEN '-'
      WHEN a.item_count = 1 THEN COALESCE(NULLIF(TRIM(a.rep_name), ''), '상품')
      ELSE COALESCE(NULLIF(TRIM(a.rep_name), ''), '상품') || ' 외 ' || (a.item_count - 1)::TEXT || '건'
    END AS order_items_summary,
    COALESCE(a.items_subtotal, 0)::NUMERIC AS items_subtotal,
    COALESCE(o.shipping_fee, 0)::NUMERIC AS shipping_fee,
    COALESCE(o.discount_amount, 0)::NUMERIC AS discount_amount,
    COALESCE(o.total_amount, 0)::NUMERIC AS total_amount,
    CASE WHEN COALESCE(o.order_status, '') = '입금대기' THEN NULL::TEXT ELSE '입금확인' END AS payment_status,
    COALESCE(NULLIF(TRIM(o.order_status), ''), '주문접수') AS order_status,
    CASE WHEN COALESCE(o.order_status, '') = '배송완료' THEN '배송완료' ELSE '미등록' END AS delivery_status,
    o.sms_sent_at,
    o.printed_at
  FROM farm_orders o
  INNER JOIN filtered f ON f.oid = o.id
  CROSS JOIN kst_today k
  LEFT JOIN order_items_agg a ON a.order_id = o.id
  ORDER BY o.order_date DESC NULLS LAST, o.created_at DESC NULLS LAST;
END;
$$;

COMMENT ON FUNCTION public.get_order_rows(text, integer, integer, text, text, text, text) IS 'ORDER_ROW_DATA_SPEC 10필드+정합성. items_subtotal=Σ(subtotal), total_amount=farm_orders.total_amount, d_day=KST일차(완료/취소시NULL), order_items_summary=대표상품명 또는 대표상품명 외 N건.';

GRANT EXECUTE ON FUNCTION public.get_order_rows(text, integer, integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_rows(text, integer, integer, text, text, text, text) TO service_role;

NOTIFY pgrst, 'reload schema';


-- ============================================
-- get_order_status_counts 제거: 카운트는 get_order_rows 단일 소스. 프론트에서 rows 기반 계산.
-- ============================================
-- 기존 DB에 함수가 있으면 제거 (선택 실행).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT pg_get_function_identity_arguments(p.oid) AS args
            FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'get_order_status_counts')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.get_order_status_counts(%s)', r.args);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- ============================================
-- [확인]
-- 1) 이 스크립트 실행 직후 NOTIFY 로 스키마 리로드됨.
-- 2) 앱 주문관리 새로고침 → POST /rest/v1/rpc/get_order_rows 200 확인.
-- 3) 탭 카운트는 get_order_rows 응답 rows에서 클라이언트 집계 (단일 소스).
-- 4) 콘솔에서 verifyOrderCountsMatch() → 목록 행 수 = 탭 카운트(all) 일치 여부 확인.
-- ============================================
