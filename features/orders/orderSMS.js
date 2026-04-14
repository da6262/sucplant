// 주문 SMS 관련 기능
// features/orders/orderSMS.js

// SMS 템플릿 관리 (기본값, 설정에서 동적으로 로드됨)
const DEFAULT_SMS_TEMPLATES = {
    orderConfirm: {
        name: '주문확인',
        template: '[경산다육식물농장] {customerName}님, 주문이 접수되었습니다.\n\n■ 주문번호 {orderNumber}\n\n■ 주문상세\n\n{orderDetails}\n\n■ 결제 정보\n{paymentInfo}\n\n■ 입금계좌 농협 010-9745-6245-08 (예금주: 경산식물원(배은희))\n\n감사합니다.'
    },
    paymentConfirm: {
        name: '입금확인',
        template: '[경산다육식물농장] {customerName}님, 입금이 확인되었습니다.\n주문번호: {orderNumber}\n배송준비를 시작합니다.'
    },
    shippingStart: {
        name: '배송시작',
        template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송을 시작했습니다.\n주문번호: {orderNumber}\n택배사: {shippingCompany}\n송장번호: {trackingNumber}'
    },
    shippingComplete: {
        name: '배송완료',
        template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송완료되었습니다.\n주문번호: {orderNumber}\n감사합니다.'
    },
    waitlistNotify: {
        name: '대기품목안내',
        template: '[경산다육식물농장] {customerName}님, 대기하신 상품이 입고되었습니다.\n상품명: {productName}\n수량: {quantity}개\n주문 가능합니다.'
    }
};

// 설정에서 SMS 템플릿 가져오기
function getSMSTemplates() {
    try {
        if (window.settingsDataManager) {
            const settings = window.settingsDataManager.getAllSettings();
            const smsTemplates = settings?.smsTemplates || {};
            
            // 설정된 템플릿이 있으면 사용, 없으면 기본값 사용
            return {
                orderConfirm: {
                    name: '주문확인',
                    template: smsTemplates.orderConfirm || DEFAULT_SMS_TEMPLATES.orderConfirm.template
                },
                paymentConfirm: {
                    name: '입금확인',
                    template: smsTemplates.paymentConfirm || DEFAULT_SMS_TEMPLATES.paymentConfirm.template
                },
                shippingStart: {
                    name: '배송시작',
                    template: smsTemplates.shippingStart || DEFAULT_SMS_TEMPLATES.shippingStart.template
                },
                shippingComplete: {
                    name: '배송완료',
                    template: smsTemplates.shippingComplete || DEFAULT_SMS_TEMPLATES.shippingComplete.template
                },
                waitlistNotify: {
                    name: '대기품목안내',
                    template: smsTemplates.waitlistNotify || DEFAULT_SMS_TEMPLATES.waitlistNotify.template
                }
            };
        }
        
        // 설정 매니저가 없으면 기본값 사용
        return DEFAULT_SMS_TEMPLATES;
    } catch (error) {
        console.error('❌ SMS 템플릿 로드 실패:', error);
        return DEFAULT_SMS_TEMPLATES;
    }
}

// SMS 발송 함수
async function sendOrderSMS(orderId, templateType, customMessage = null) {
    try {
        console.log('📱 SMS 발송 시작:', { orderId, templateType, customMessage });
        
        // 주문 정보 가져오기
        const order = await getOrderById(orderId);
        if (!order) {
            throw new Error('주문 정보를 찾을 수 없습니다.');
        }
        
        // SMS 메시지 생성
        let message;
        if (customMessage) {
            message = customMessage;
        } else {
            const smsTemplates = getSMSTemplates();
            const template = smsTemplates[templateType];
            if (!template) {
                throw new Error('SMS 템플릿을 찾을 수 없습니다.');
            }
            message = formatSMSTemplate(template.template, order);
        }
        
        // SMS 발송
        const result = await sendSMS(order.customer_phone, message, templateType);
        
        console.log('✅ SMS 발송 완료:', result);
        return result;
        
    } catch (error) {
        console.error('❌ SMS 발송 실패:', error);
        throw error;
    }
}

// SMS 템플릿 포맷팅
function formatSMSTemplate(template, order) {
    console.log('📱 SMS 템플릿 포맷팅 시작:', order);
    
    // 주문상세내역 생성
    let orderDetails = '';
    let items = [];
    
    // 품목 단일 소스: order.items (farm_order_items에서 로드됨). order_items JSONB 미사용.
    if (order.items && Array.isArray(order.items)) {
        items = order.items;
    }
    
    // 3. 주문상세내역 생성 (새로운 형식: 각 상품을 줄바꿈으로 구분)
    if (items && items.length > 0) {
        orderDetails = items.map(item => {
            const productName = item.product_name || item.name || '상품';
            const quantity = item.quantity || 1;
            const unitPrice = item.unit_price || item.price || 0;
            const totalPrice = item.total_price || item.total || (quantity * unitPrice);
            
            return `${productName} ${quantity}개 (${totalPrice.toLocaleString()}원)`;
        }).join('\n\n');  // 쉼표 대신 줄바꿈으로 변경
        console.log('✅ 주문상세내역 생성:', orderDetails);
    } else {
        orderDetails = '상품 정보 없음';
        console.warn('⚠️ 주문상세내역을 찾을 수 없습니다');
    }
    
    // 4. 주문금액 확인
    const totalAmount = order.total_amount || 0;
    console.log('💰 주문금액:', totalAmount);
    
    // 5. 결제 정보 생성
    const shippingFee = order.shipping_fee || 0;
    const discountAmount = order.discount_amount || 0;
    
    // 상품금액 = 총금액 - 배송비 + 할인금액
    const productAmount = totalAmount - shippingFee + discountAmount;
    
    // 배송비 텍스트 생성
    let shippingText;
    if (shippingFee === 0) {
        // 무료 배송 조건 확인 (예: 5만원 이상)
        if (productAmount >= 50000) {
            shippingText = `배송비: 0원 (5만원 이상 무료배송)`;
        } else {
            shippingText = `배송비: 0원`;
        }
    } else {
        shippingText = `배송비: ${shippingFee.toLocaleString()}원`;
    }
    
    // 결제 정보 텍스트 조합
    const paymentInfo = `상품금액: ${productAmount.toLocaleString()}원\n${shippingText}\n총 결제금액: ${totalAmount.toLocaleString()}원`;
    console.log('💳 결제 정보:', paymentInfo);
    
    const formattedTemplate = template
        .replace('{customerName}', order.customer_name || '고객')
        .replace('{orderNumber}', order.order_number || order.id)
        .replace('{orderDetails}', orderDetails)
        .replace('{totalAmount}', totalAmount.toLocaleString())
        .replace('{productAmount}', productAmount.toLocaleString())
        .replace('{shippingFee}', shippingFee.toLocaleString())
        .replace('{shippingFeeText}', shippingText)
        .replace('{paymentInfo}', paymentInfo)
        .replace('{shippingCompany}', order.shipping_company || '택배사')
        .replace('{trackingNumber}', order.tracking_number || '송장번호');
    
    console.log('📱 포맷팅된 SMS 템플릿:', formattedTemplate);
    return formattedTemplate;
}

// SMS 발송 (실제 API 호출)
async function sendSMS(phoneNumber, message, templateType = 'custom') {
    try {
        console.log('📱 SMS API 호출:', { phoneNumber, message, templateType });
        
        let result;
        
        // SOLAPI 또는 다른 SMS 서비스 연동
        if (window.solapi) {
            result = await window.solapi.send({
                to: phoneNumber,
                from: '01012345678', // 발신번호
                text: message
            });
            
            console.log('✅ SOLAPI SMS 발송 성공:', result);
        } else {
            // 개발 환경에서는 콘솔에만 출력
            console.log('📱 SMS 발송 (개발 모드):', { phoneNumber, message });
            result = { success: true, messageId: 'dev_' + Date.now() };
        }
        
        // SMS 발송 이력 저장
        if (window.saveSMSHistory) {
            window.saveSMSHistory({
                customerName: '고객', // 실제로는 주문 정보에서 가져와야 함
                phone: phoneNumber,
                message: message,
                type: templateType,
                success: result.success !== false
            });
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ SMS API 호출 실패:', error);
        
        // 실패한 SMS도 이력에 저장
        if (window.saveSMSHistory) {
            window.saveSMSHistory({
                customerName: '고객',
                phone: phoneNumber,
                message: message,
                type: templateType,
                success: false
            });
        }
        
        throw error;
    }
}

// 주문 ID로 주문 정보 가져오기
async function getOrderById(orderId) {
    try {
        console.log('🔍 주문 정보 조회 시작:', orderId);
        
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .eq('id', orderId)
                .single();
            
            if (error) {
                console.error('❌ 주문 정보 조회 실패:', error);
                return null;
            }
            
            console.log('📦 조회된 주문 데이터:', data);
            
            // 품목 단일 소스: farm_order_items에서 로드해 data.items 설정
            const { data: itemsData } = await window.supabaseClient
                .from('farm_order_items')
                .select('*')
                .eq('order_id', data.id);
            data.items = (itemsData || []).map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || '상품명 없음',
                quantity: item.quantity,
                price: item.unit_price,
                total: item.subtotal,
                size: item.size
            }));
            
            // 주문금액 확인 및 로그
            console.log('💰 주문금액 정보:');
            console.log('- total_amount:', data.total_amount);
            console.log('- shipping_fee:', data.shipping_fee);
            console.log('- discount_amount:', data.discount_amount);
            
            return data;
        } else {
            console.warn('⚠️ Supabase가 연결되지 않았습니다');
            return null;
        }
    } catch (error) {
        console.error('❌ 주문 정보 조회 실패:', error);
        return null;
    }
}

// SMS 템플릿 선택 모달 표시
function showSMSTemplateModal(orderId) {
    try {
        console.log('📱 SMS 템플릿 모달 표시:', orderId);
        
        // 모달 HTML 생성
        const modalHTML = `
            <div id="sms-template-modal" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="fixed inset-0 bg-black bg-opacity-50"></div>
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">SMS 발송</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">템플릿 선택</label>
                                    <select id="sms-template-select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">직접 입력</option>
                                        <option value="orderConfirm">주문확인</option>
                                        <option value="paymentConfirm">입금확인</option>
                                        <option value="shippingStart">배송시작</option>
                                        <option value="shippingComplete">배송완료</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">메시지 내용</label>
                                    <textarea id="sms-message" rows="4" 
                                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                              placeholder="SMS 메시지를 입력하세요..."></textarea>
                                </div>
                                
                                <div class="flex justify-end space-x-3">
                                    <button onclick="closeSMSTemplateModal()" 
                                            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                        취소
                                    </button>
                                    <button onclick="sendOrderSMSFromModal('${orderId}')" 
                                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        발송
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 템플릿 선택 이벤트
        const templateSelect = document.getElementById('sms-template-select');
        const messageTextarea = document.getElementById('sms-message');
        
        templateSelect.addEventListener('change', async (e) => {
            if (e.target.value) {
                const order = await getOrderById(orderId);
                if (order) {
                    const smsTemplates = getSMSTemplates();
                    const template = smsTemplates[e.target.value];
                    const formattedMessage = formatSMSTemplate(template.template, order);
                    messageTextarea.value = formattedMessage;
                }
            }
        });
        
    } catch (error) {
        console.error('❌ SMS 템플릿 모달 표시 실패:', error);
    }
}

// SMS 템플릿 모달 닫기
function closeSMSTemplateModal() {
    const modal = document.getElementById('sms-template-modal');
    if (modal) {
        modal.remove();
    }
}

// 모달에서 SMS 발송
async function sendOrderSMSFromModal(orderId) {
    try {
        const templateSelect = document.getElementById('sms-template-select');
        const messageTextarea = document.getElementById('sms-message');
        
        const templateType = templateSelect.value;
        const customMessage = messageTextarea.value.trim();
        
        if (!customMessage) {
            alert('메시지를 입력해주세요.');
            return;
        }
        
        await sendOrderSMS(orderId, templateType, customMessage);
        
        alert('SMS가 발송되었습니다.');
        closeSMSTemplateModal();
        
    } catch (error) {
        console.error('❌ SMS 발송 실패:', error);
        alert('SMS 발송에 실패했습니다: ' + error.message);
    }
}

// 대기자에게 대기품목 안내 SMS 발송
async function sendWaitlistSMS(waitlistData, productName, quantity) {
    try {
        console.log('📱 대기자 SMS 발송:', { waitlistData, productName, quantity });
        
        const smsTemplates = getSMSTemplates();
        const template = smsTemplates.waitlistNotify;
        if (!template) {
            throw new Error('대기품목 안내 템플릿을 찾을 수 없습니다.');
        }
        
        // 템플릿 포맷팅
        const message = template.template
            .replace('{customerName}', waitlistData.customer_name || '고객')
            .replace('{productName}', productName || '상품')
            .replace('{quantity}', quantity || '1');
        
        // SMS 발송
        const result = await sendSMS(waitlistData.phone, message, 'waitlistNotify');
        
        console.log('✅ 대기자 SMS 발송 완료:', result);
        return result;
        
    } catch (error) {
        console.error('❌ 대기자 SMS 발송 실패:', error);
        throw error;
    }
}

// 전역 스코프에 함수 등록
window.sendOrderSMS = sendOrderSMS;
window.showSMSTemplateModal = showSMSTemplateModal;
window.closeSMSTemplateModal = closeSMSTemplateModal;
window.sendOrderSMSFromModal = sendOrderSMSFromModal;
window.sendWaitlistSMS = sendWaitlistSMS;

// =============================================
// Solapi API 직접 연동 (고객 문자 발송)
// =============================================

const SOLAPI_CONFIG = {
    apiKey: 'NCS4ZXQ1JWMUPQ3W',
    apiSecret: 'MLER1HFO30FJGXMZLEN9P82TZL6ZWEM2',
    from: '01097456245'
};

// Web Crypto API로 HMAC-SHA256 서명 생성
async function _createSolapiSignature(date, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(SOLAPI_CONFIG.apiSecret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${date}${salt}`));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function _randomHex(bytes) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Solapi SMS 발송 (저수준)
async function sendSolapiSMS(phoneNumber, message) {
    const normalizedPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
    if (!normalizedPhone) throw new Error('전화번호가 없습니다.');

    const date = new Date().toISOString();
    const salt = _randomHex(16);
    const signature = await _createSolapiSignature(date, salt);
    const authHeader = `HMAC-SHA256 apiKey=${SOLAPI_CONFIG.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

    const response = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { to: normalizedPhone, from: SOLAPI_CONFIG.from, text: message } })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`솔라피 오류 ${response.status}: ${err}`);
    }
    return await response.json();
}

// 고객 문자 발송 모달
function openCustomerSMSModal(phone, customerName) {
    const existing = document.getElementById('customer-sms-modal');
    if (existing) existing.remove();

    const displayPhone = (phone || '').replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');

    const modal = document.createElement('div');
    modal.id = 'customer-sms-modal';
    modal.className = 'fixed inset-0 z-[600] flex items-center justify-center';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50" id="customer-sms-backdrop"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <i class="fas fa-sms text-emerald-500"></i>
                    <span class="font-semibold text-gray-800 text-sm">문자 발송</span>
                </div>
                <button id="customer-sms-close" class="text-gray-400 hover:text-gray-600 p-1"><i class="fas fa-times text-sm"></i></button>
            </div>
            <div class="px-4 py-3 space-y-2">
                <div class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">
                    <i class="fas fa-user text-gray-400"></i>
                    <span class="font-medium">${escapeHtmlBasic(customerName || '')}</span>
                    <span class="text-gray-400">·</span>
                    <span>${escapeHtmlBasic(displayPhone)}</span>
                </div>
                <div>
                    <textarea id="customer-sms-message" rows="5"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 resize-none"
                        placeholder="[경산다육식물농장] 안녕하세요, ${escapeHtmlBasic(customerName || '고객')}님..."></textarea>
                    <div class="text-right text-xs text-gray-400 mt-0.5"><span id="customer-sms-count">0</span>자</div>
                </div>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-100">
                <button id="customer-sms-cancel" class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">취소</button>
                <button id="customer-sms-send" class="text-xs px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium">
                    <i class="fas fa-paper-plane mr-1"></i>발송
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const msgArea = modal.querySelector('#customer-sms-message');
    const countEl = modal.querySelector('#customer-sms-count');
    const sendBtn = modal.querySelector('#customer-sms-send');
    const close = () => modal.remove();

    modal.querySelector('#customer-sms-backdrop').addEventListener('click', close);
    modal.querySelector('#customer-sms-close').addEventListener('click', close);
    modal.querySelector('#customer-sms-cancel').addEventListener('click', close);
    msgArea.addEventListener('input', () => { countEl.textContent = msgArea.value.length; });
    msgArea.focus();

    sendBtn.addEventListener('click', async () => {
        const message = msgArea.value.trim();
        if (!message) { alert('메시지를 입력해주세요.'); return; }

        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>발송중...';

        try {
            await sendSolapiSMS(phone, message);
            modal.remove();
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 z-[700] px-4 py-2.5 bg-emerald-600 text-white text-sm rounded-lg shadow-lg flex items-center gap-2';
            toast.innerHTML = '<i class="fas fa-check-circle"></i> SMS 발송 완료';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (err) {
            console.error('SMS 발송 실패:', err);
            alert('SMS 발송 실패: ' + err.message);
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i>발송';
        }
    });
}

function escapeHtmlBasic(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// 고객 ID로 문자 발송 (테이블 행에서 사용)
function openCustomerSMSById(customerId) {
    const data = window._customerSMSMap?.[customerId];
    if (!data) { alert('고객 정보를 찾을 수 없습니다.'); return; }
    openCustomerSMSModal(data.phone, data.name);
}

window.sendSolapiSMS = sendSolapiSMS;
window.openCustomerSMSModal = openCustomerSMSModal;
window.openCustomerSMSById = openCustomerSMSById;

