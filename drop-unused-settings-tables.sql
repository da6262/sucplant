-- 사용하지 않는 환경설정 전용 테이블 삭제
--
-- 배경:
--   farm_order_statuses, farm_customer_grades 테이블은 schema에 정의되어 있으나
--   앱에서 실제로 사용하지 않음.
--   주문상태·고객등급 데이터는 farm_settings.settings JSONB 컬럼에 저장됨.
--
-- 영향 없음: 앱 코드(features/, components/)에서 이 테이블을 SELECT/INSERT하지 않음.
-- 실행 전: Supabase 대시보드에서 테이블 데이터 없는지 확인 권장

DROP TABLE IF EXISTS farm_order_statuses;
DROP TABLE IF EXISTS farm_customer_grades;
