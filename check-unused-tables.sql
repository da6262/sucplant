-- 사용하지 않는 테이블 확인 스크립트
-- 실행 전에 반드시 백업을 만드세요!

-- 1. 테이블별 데이터 개수 확인
SELECT 
    'orders' as table_name,
    COUNT(*) as row_count,
    'orders 테이블 데이터 개수' as description
FROM orders
UNION ALL
SELECT 
    'customers' as table_name,
    COUNT(*) as row_count,
    'customers 테이블 데이터 개수' as description
FROM customers
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as row_count,
    'products 테이블 데이터 개수' as description
FROM products
UNION ALL
SELECT 
    'waitlist' as table_name,
    COUNT(*) as row_count,
    'waitlist 테이블 데이터 개수' as description
FROM waitlist;

-- 2. 외래키 참조 확인
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (ccu.table_name IN ('orders', 'customers', 'products', 'waitlist')
         OR tc.table_name IN ('orders', 'customers', 'products', 'waitlist'));

-- 3. 테이블 크기 확인
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('orders', 'customers', 'products', 'waitlist')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;




