import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 데이터 파싱
    const { phoneNumber, message, orderId } = await req.json()

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: '전화번호와 메시지가 필요합니다.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 환경 변수에서 API 키 가져오기
    const apiKey = Deno.env.get('SOLAPI_API_KEY')
    const apiSecret = Deno.env.get('SOLAPI_API_SECRET')
    const fromNumber = Deno.env.get('SOLAPI_FROM_NUMBER')

    if (!apiKey || !apiSecret || !fromNumber) {
      console.error('❌ SMS API 설정이 누락되었습니다.')
      return new Response(
        JSON.stringify({ error: 'SMS 서비스 설정이 누락되었습니다.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 전화번호 정규화
    const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '')
    
    // 솔라피 API 요청 데이터
    const smsData = {
      message: {
        to: normalizedPhone,
        from: fromNumber,
        text: message
      }
    }

    console.log('📱 SMS 발송 시도:', {
      to: normalizedPhone,
      message: message,
      orderId: orderId
    })

    // HMAC 인증 헤더 생성
    const date = new Date().toISOString()
    const salt = crypto.getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
    
    const messageToSign = `${date}${salt}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(apiSecret)
    const messageData = encoder.encode(messageToSign)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signatureHex}`

    // 솔라피 API 호출
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smsData)
    })

    console.log('📡 솔라피 API 응답 상태:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 솔라피 API 오류 응답:', errorText)
      throw new Error(`SMS 발송 실패: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ 솔라피 SMS 발송 성공:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS가 성공적으로 발송되었습니다.',
        data: result 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ SMS 발송 실패:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

