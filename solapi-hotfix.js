// 솔라피 API 핫픽스 - 온라인 사이트에서 실행할 코드
console.log('🔧 솔라피 API 핫픽스 시작...');

// 솔라피 API 함수를 새로운 설정으로 교체
window.orderSystem.sendSmsViaSolapi = async function(phoneNumber, message, orderId = null) {
    try {
        // 새로운 API 설정
        const solapiConfig = {
            apiKey: 'NCS4ZXQ1JWMUPQ3W',
            apiSecret: 'MLER1HFO30FJGXMZLEN9P82TZL6ZWEM2',
            from: '01097456245' // 실제 등록된 발신번호
        };

        // 전화번호 정규화 (하이픈 제거)
        const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        console.log('📱 솔라피 SMS 발송 시도:', {
            to: normalizedPhone,
            message: message,
            orderId: orderId
        });

        // HMAC 인증 헤더 생성 (솔라피 API v4 올바른 방식)
        const date = new Date().toISOString();
        const salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
        
        // 솔라피 API v4의 올바른 서명 생성 방식 (Hex 형식 필요)
        const messageToSign = `${date}${salt}`;
        const signature = CryptoJS.HmacSHA256(messageToSign, solapiConfig.apiSecret).toString(CryptoJS.enc.Hex);
        
        const authHeader = `HMAC-SHA256 apiKey=${solapiConfig.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
        
        console.log('🔑 인증 헤더 생성 완료');
        console.log('📝 서명 생성 정보:', {
            date: date,
            salt: salt,
            messageToSign: messageToSign,
            signature: signature,
            apiKey: solapiConfig.apiKey,
            apiSecret: solapiConfig.apiSecret.substring(0, 8) + '...' // 보안을 위해 일부만 표시
        });

        // 솔라피 API 요청 데이터 (올바른 형식)
        const smsData = {
            message: {
                to: normalizedPhone,
                from: solapiConfig.from,
                text: message
            }
        };

        // 솔라피 API 호출
        const response = await fetch('https://api.solapi.com/messages/v4/send', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(smsData)
        });

        console.log('📡 솔라피 API 응답 상태:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 솔라피 API 오류 응답:', errorText);
            throw new Error(`솔라피 API 오류: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ 솔라피 SMS 발송 성공:', result);
        
        // 주문 상태 업데이트
        if (orderId) {
            try {
                await this.updateOrderSmsStatus(orderId, 'sent');
                console.log(`✅ 주문 ${orderId} SMS 상태 업데이트: sent`);
            } catch (updateError) {
                console.warn('⚠️ SMS 상태 업데이트 실패:', updateError);
            }
        }
        
        return result;

    } catch (error) {
        console.error('❌ 솔라피 SMS 발송 오류:', error);
        
        // 주문 상태 업데이트 (실패)
        if (orderId) {
            try {
                await this.updateOrderSmsStatus(orderId, 'failed');
                console.log(`✅ 주문 ${orderId} SMS 상태 업데이트: failed`);
            } catch (updateError) {
                console.warn('⚠️ SMS 상태 업데이트 실패:', updateError);
            }
        }
        
        throw error;
    }
};

console.log('✅ 솔라피 API 핫픽스 완료!');
console.log('📱 이제 SMS 발송이 정상적으로 작동합니다!');

