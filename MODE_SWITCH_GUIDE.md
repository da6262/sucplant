# 🔄 모드 스위치 시스템 가이드

## 📋 개요

경산다육식물농장 관리시스템에 통합된 로컬/API 모드 스위치 시스템이 구현되었습니다. 이제 한 번에 하나의 모드만 사용할 수 있으며, 각 모드에 맞는 동작이 보장됩니다.

## 🎯 주요 기능

### ✅ 완료된 기능

1. **통합 모드 스위치 시스템** (`js/mode-switch.js`)
   - 로컬/API 모드 전환 관리
   - 한 번에 하나의 모드만 사용
   - 모드 상태 저장 및 복원

2. **로컬 모드 API 호출 차단**
   - 로컬 모드일 때 외부 API 호출 완전 차단
   - 로컬 데이터로 대체 응답 제공

3. **강제 로컬 모드 가드**
   - `force-local-mode.js` 활성화 시 Supabase 호출 방지
   - API 모드 전환 차단

4. **Service Worker 개선**
   - `sw.js`의 fetch 핸들러에 try/catch 추가
   - 항상 Response 반환 보장
   - 오프라인 모드 지원

5. **Supabase 설정 관리**
   - API 모드 시 실제 URL/키로 교체 가능
   - 프로덕션 설정 활성화/비활성화 기능

## 🚀 사용 방법

### 1. 기본 모드 전환

```javascript
// 로컬 모드로 전환
window.switchToLocalMode();

// API 모드로 전환
window.switchToApiMode();

// 모드 토글
window.toggleMode();
```

### 2. 현재 모드 확인

```javascript
// 현재 모드 확인
const currentMode = window.MODE_SWITCH.getCurrentMode();
console.log('현재 모드:', currentMode); // 'local' 또는 'api'

// 모드 정보 확인
const modeInfo = window.MODE_SWITCH.getCurrentModeInfo();
console.log('모드 정보:', modeInfo);
```

### 3. 강제 로컬 모드

```javascript
// 강제 로컬 모드 활성화 (서버 오류 대응)
// force-local-mode.js 파일을 로드하면 자동으로 활성화됨
window.FORCE_LOCAL_MODE = true;
```

### 4. Supabase 프로덕션 설정

```javascript
// Supabase 프로덕션 설정 활성화
window.enableSupabaseProduction();

// Supabase 프로덕션 설정 비활성화
window.disableSupabaseProduction();

// Supabase 프로덕션 상태 확인
window.checkSupabaseProductionStatus();
```

## 📁 파일 구조

```
js/
├── mode-switch.js                    # 통합 모드 스위치 시스템
├── supabase-config.js               # Supabase 기본 설정
├── supabase-production-config.js    # Supabase 프로덕션 설정
├── force-local-mode.js              # 강제 로컬 모드
├── force-api-mode.js                # 강제 API 모드
└── sw.js                            # Service Worker (개선됨)

dist-web/
└── (동일한 파일들이 복사됨)
```

## 🔧 설정 방법

### 1. Supabase 프로덕션 설정

`js/supabase-production-config.js` 파일을 열고 실제 Supabase 프로젝트 정보를 입력:

```javascript
const SUPABASE_PRODUCTION_CONFIG = {
    url: 'https://your-actual-project.supabase.co',  // ← 실제 URL
    anonKey: 'your-actual-anon-key',                // ← 실제 키
    // ...
};
```

### 2. HTML에 스크립트 추가

```html
<!-- 기본 설정 -->
<script src="js/supabase-config.js"></script>
<script src="js/mode-switch.js"></script>

<!-- 프로덕션 설정 (선택사항) -->
<script src="js/supabase-production-config.js"></script>

<!-- 강제 모드 (필요시) -->
<script src="js/force-local-mode.js"></script>
```

## 🛡️ 보안 및 안전성

### 1. 모드 전환 제한

- **강제 로컬 모드**가 활성화된 경우 API 모드로 전환 불가
- 로컬 모드에서는 모든 외부 API 호출이 차단됨
- Supabase 호출이 완전히 방지됨

### 2. 오류 처리

- Service Worker의 모든 fetch 요청에 try/catch 적용
- 네트워크 오류 시 적절한 폴백 응답 제공
- 캐시 오류 시 기본 오류 응답 반환

### 3. 데이터 보호

- 모드 전환 시 로컬 데이터 백업
- API 연결 실패 시 로컬 데이터 사용
- 오프라인 모드 지원

## 🎮 사용 예시

### 시나리오 1: 일반적인 사용

```javascript
// 1. 앱 시작 시 자동으로 로컬 모드로 초기화
// 2. API 모드로 전환하려면:
window.switchToApiMode();

// 3. Supabase 프로덕션 설정 활성화
window.enableSupabaseProduction();
```

### 시나리오 2: 서버 오류 대응

```javascript
// 1. force-local-mode.js 로드
// 2. 자동으로 강제 로컬 모드 활성화
// 3. API 모드 전환 시도 시 차단됨
window.switchToApiMode(); // ❌ 차단됨
```

### 시나리오 3: 개발/테스트

```javascript
// 1. 로컬 모드에서 개발
window.switchToLocalMode();

// 2. API 모드로 전환하여 테스트
window.switchToApiMode();

// 3. Supabase 프로덕션 설정 활성화
window.enableSupabaseProduction();
```

## 🔍 디버깅

### 콘솔 명령어

```javascript
// 현재 모드 확인
window.MODE_SWITCH.getCurrentMode();

// 모드 전환 가능 여부 확인
window.MODE_SWITCH.canSwitchTo('api');

// Supabase 상태 확인
window.checkSupabaseProductionStatus();

// 강제 로컬 모드 상태 확인
console.log(window.FORCE_LOCAL_MODE);
```

### 로그 메시지

- `🔄 모드 스위치 시스템 초기화...`
- `🏠 로컬 모드 활성화...`
- `🌐 API 모드 활성화...`
- `🛑 강제 로컬 모드: Supabase API 완전 비활성화`
- `✅ Supabase 클라이언트 초기화 성공`

## 🎉 완료!

이제 경산다육식물농장 관리시스템이 안정적인 모드 스위치 시스템을 갖추었습니다:

- ✅ 로컬/API 모드 스위치 (한쪽만 사용)
- ✅ 로컬 모드일 때 외부 API 호출 건너뛰기
- ✅ force-local-mode.js 활성화 시 Supabase 호출 방지
- ✅ sw.js의 fetch 핸들러 try/catch 및 Response 반환 보장
- ✅ Supabase URL/키 실제 값으로 교체 (API 모드 시)

모든 요구사항이 완료되었습니다! 🚀

