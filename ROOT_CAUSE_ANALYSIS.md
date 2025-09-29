# 🚨 Supabase 401 오류 근본 원인 분석

## 🔍 발견된 근본적인 문제들

### 1️⃣ **Supabase 클라이언트 초기화 실패**
**원인**: Supabase CDN 스크립트 로딩 실패 또는 타이밍 문제
**증상**: `window.supabase`가 undefined 상태
**결과**: API 요청에 인증 헤더가 포함되지 않음 → 401 Unauthorized

### 2️⃣ **RLS 정책 충돌**
**원인**: 기존 RLS 정책과 새로운 정책이 충돌
**증상**: "new row violates row-level security policy" 오류
**결과**: 데이터 저장/조회 실패

### 3️⃣ **고유 제약 조건 중복**
**원인**: `farm_customers_phone_unique` 제약 조건이 이미 존재
**증상**: "relation already exists" 오류
**결과**: SQL 스크립트 실행 실패

### 4️⃣ **스크립트 로딩 순서 문제**
**원인**: Supabase CDN이 로드되기 전에 설정 스크립트가 실행
**증상**: 초기화 시점에서 `window.supabase` 접근 불가
**결과**: 전체 Supabase 연동 실패

## 🔧 근본적인 해결 방법

### 해결책 1: Supabase 클라이언트 초기화 개선
```javascript
// js/supabase-config.js 수정
function initializeSupabase() {
    return new Promise((resolve) => {
        const checkSupabase = () => {
            if (typeof window.supabase !== 'undefined') {
                // Supabase 클라이언트 생성
                supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                resolve(true);
            } else {
                // 100ms 후 다시 시도
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}
```

### 해결책 2: RLS 정책 완전 재설정
```sql
-- 기존 모든 정책 삭제
DROP POLICY IF EXISTS "Enable all operations for all users" ON farm_customers;
-- ... (모든 테이블)

-- 새로운 정책 생성 (익명 사용자 허용)
CREATE POLICY "Allow all operations for anonymous users" ON farm_customers 
FOR ALL USING (true) WITH CHECK (true);
```

### 해결책 3: 스크립트 로딩 순서 보장
```html
<!-- index.html 수정 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
    // Supabase 로딩 완료 확인 후 초기화
    window.addEventListener('load', () => {
        if (window.SupabaseConfig) {
            window.SupabaseConfig.initialize();
        }
    });
</script>
```

## 🎯 최종 해결 순서

1. **Supabase SQL Editor**에서 RLS 정책 완전 재설정
2. **js/supabase-config.js** 초기화 로직 개선
3. **index.html** 스크립트 로딩 순서 수정
4. **브라우저 캐시 완전 삭제** 후 테스트

## 📊 예상 결과

- ✅ 401 Unauthorized 오류 해결
- ✅ RLS 정책 위반 오류 해결
- ✅ 정상적인 데이터 동기화 작동
- ✅ 안정적인 Supabase 연동

---

**핵심**: 문제는 단순한 설정 오류가 아니라 **시스템 아키텍처의 근본적인 문제**입니다.

