# Supabase Edge Function 설정 가이드

## 🚨 보안 수정 완료!

API 키 하드코딩 보안 취약점을 해결하기 위해 Supabase Edge Function을 사용하도록 변경했습니다.

## 📋 설정 단계

### 1. Supabase Edge Function 배포

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트에 로그인
supabase login

# Edge Function 배포
supabase functions deploy send-sms
```

### 2. 환경 변수 설정

Supabase 대시보드에서 다음 환경 변수를 설정하세요:

```bash
# Supabase 대시보드 > Settings > Edge Functions > Environment Variables
SOLAPI_API_KEY=your_api_key_here
SOLAPI_API_SECRET=your_api_secret_here
SOLAPI_FROM_NUMBER=01097456245
```

### 3. RLS (Row Level Security) 설정

Edge Function이 데이터베이스에 접근할 수 있도록 RLS 정책을 설정하세요:

```sql
-- SMS 발송 로그 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Edge Function이 SMS 로그를 기록할 수 있도록 정책 설정
CREATE POLICY "Allow Edge Function to insert SMS logs" ON sms_logs
  FOR INSERT WITH CHECK (true);
```

## 🔧 코드 변경 사항

### Before (보안 취약점)
```javascript
// ❌ 위험: API 키가 클라이언트에 노출
const solapiConfig = {
    apiKey: 'NCS4ZXQ1JWMUPQ3W',
    apiSecret: 'MLER1HFO30FJGXMZLEN9P82TZL6ZWEM2',
    from: '01097456245'
};
```

### After (보안 강화)
```javascript
// ✅ 안전: Supabase Edge Function 사용
const { data, error } = await this.supabase.functions.invoke('send-sms', {
    body: {
        phoneNumber: phoneNumber,
        message: message,
        orderId: orderId
    }
});
```

## 🛡️ 보안 개선 사항

1. **API 키 보호**: 클라이언트에서 API 키가 완전히 제거됨
2. **서버 측 처리**: SMS 발송 로직이 서버에서 안전하게 처리됨
3. **환경 변수**: 민감한 정보가 환경 변수로 관리됨
4. **CORS 설정**: 적절한 CORS 헤더로 보안 강화

## 🧪 테스트

Edge Function이 배포된 후 다음 명령으로 테스트할 수 있습니다:

```bash
# Edge Function 테스트
curl -X POST 'https://your-project.supabase.co/functions/v1/send-sms' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "01012345678",
    "message": "테스트 메시지",
    "orderId": "test-order-id"
  }'
```

## 📝 주의사항

1. **API 키 보안**: 환경 변수에 설정된 API 키는 절대 클라이언트 코드에 노출되지 않습니다.
2. **비용 관리**: SMS 발송 비용을 모니터링하세요.
3. **에러 처리**: Edge Function에서 적절한 에러 처리가 구현되어 있습니다.
4. **로깅**: SMS 발송 로그를 데이터베이스에 기록할 수 있습니다.

## 🚀 배포 후 확인사항

- [ ] Edge Function이 성공적으로 배포되었는지 확인
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] SMS 발송이 정상적으로 작동하는지 테스트
- [ ] 에러 로그가 적절히 기록되는지 확인

