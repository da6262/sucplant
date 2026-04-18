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
        template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송을 시작했습니다.\n주문번호: {orderNumber}\n택배사: {shippingCompany}\n송장번호: {trackingNumber}\n배송조회: https://trace.cjlogistics.com/web/detail.jsp?slipno={trackingNumber}'
    },
    shippingComplete: {
        name: '배송완료',
        template: '[경산다육식물농장] {customerName}님, 주문하신 상품이 배송완료되었습니다.\n주문번호: {orderNumber}\n감사합니다.'
    },
    waitlistNotify: {
        name: '대기품목안내',
        template: '[경산다육식물농장] {customerName}님, 대기하신 상품이 입고되었습니다.\n상품명: {productName}\n수량: {quantity}개\n주문 가능합니다.'
    },
    outOfStock: {
        name: '품절안내',
        template: '[경산다육식물농장] {customerName}님, 죄송합니다.\n주문하신 상품이 품절되어 배송이 어렵습니다.\n주문번호: {orderNumber}\n빠른 시일 내 재입고 예정이오니 양해 부탁드립니다.\n문의: 010-9745-6245'
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
                },
                outOfStock: {
                    name: '품절안내',
                    template: smsTemplates.outOfStock || DEFAULT_SMS_TEMPLATES.outOfStock.template
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
// Fix #1: farm_orders.order_items JSONB 컬럼은 레거시 — 품목 SSOT는 farm_order_items 테이블.
// SMS 발송 시에도 getOrderById()에서 farm_order_items를 직접 조회해 data.items에 설정함.
// Fix #12: TODO — sendOrderSMS에서 getOrderById()를 호출하지만 orderData.js에서도 동일 조회가 발생할 수 있음.
//          향후 SMS 발송 시 이미 로드된 order 객체를 직접 전달받는 오버로드 추가 검토.
// Fix #13: TODO — templateType별 채널(네이버/라이브) 특화 처리 필요 시 formatSMSTemplate에 channel 파라미터 추가 검토.
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

        // sms_sent_at 타임스탬프 + 발송 타입 기록
        if (window.supabaseClient && orderId) {
            await window.supabaseClient
                .from('farm_orders')
                .update({ sms_sent_at: new Date().toISOString(), last_sms_type: templateType || 'custom' })
                .eq('id', orderId);
            console.log('✅ sms_sent_at + last_sms_type 기록 완료');
        }

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
        .replace('{shippingCompany}', order.shipping_method || '택배사')
        .replace('{trackingNumber}', order.tracking_number || '송장번호');
    
    console.log('📱 포맷팅된 SMS 템플릿:', formattedTemplate);
    return formattedTemplate;
}

// SMS 발송 (실제 API 호출) — sendSolapiSMS 직접 사용
async function sendSMS(phoneNumber, message, templateType = 'custom') {
    try {
        console.log('📱 SMS API 호출:', { phoneNumber, message, templateType });

        const result = await sendSolapiSMS(phoneNumber, message);

        console.log('✅ SMS 발송 성공:', result);

        // SMS 발송 이력 저장
        if (window.saveSMSHistory) {
            window.saveSMSHistory({
                customerName: '고객',
                phone: phoneNumber,
                message: message,
                type: templateType,
                success: true
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
async function showSMSTemplateModal(orderId) {
    try {
        console.log('📱 SMS 템플릿 모달 표시:', orderId);

        // 주문 정보 먼저 조회
        const order = await getOrderById(orderId);
        const customerName = order ? (order.customer_name || '고객') : '고객';
        const customerPhone = order ? (order.customer_phone || '-') : '-';
        const phoneFormatted = customerPhone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');

        // 모달 HTML 생성
        const modalHTML = `
            <div id="sms-template-modal" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="fixed inset-0 bg-black bg-opacity-50"></div>
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-heading mb-4">SMS 발송</h3>

                            <div class="mb-4 px-3 py-2 rounded-lg" style="background:var(--bg-light);border:1px solid var(--border);">
                                <div class="flex items-center gap-3 text-sm">
                                    <div><i class="fas fa-user text-muted mr-1"></i><strong>${escapeHtmlBasic(customerName)}</strong></div>
                                    <div><i class="fas fa-phone text-muted mr-1"></i>${escapeHtmlBasic(phoneFormatted)}</div>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-body mb-2">템플릿 선택</label>
                                    <select id="sms-template-select" class="input-ui">
                                        <option value="">직접 입력</option>
                                        <option value="orderConfirm">주문확인</option>
                                        <option value="paymentConfirm">입금확인</option>
                                        <option value="shippingStart">배송시작</option>
                                        <option value="shippingComplete">배송완료</option>
                                        <option value="outOfStock">품절안내</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-body mb-2">메시지 내용</label>
                                    <textarea id="sms-message" rows="4"
                                              class="input-ui resize-none"
                                              placeholder="SMS 메시지를 입력하세요..."></textarea>
                                </div>

                                <div class="flex justify-end space-x-3">
                                    <button onclick="closeSMSTemplateModal()" class="btn-secondary">
                                        취소
                                    </button>
                                    <button onclick="sendOrderSMSFromModal('${orderId}')" class="btn-info">
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
                const o = order || await getOrderById(orderId);
                if (o) {
                    const smsTemplates = getSMSTemplates();
                    const template = smsTemplates[e.target.value];
                    const formattedMessage = formatSMSTemplate(template.template, o);
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
        closeSMSTemplateModal();

        // 템플릿별 상태 자동 전환
        const STATUS_MAP = {
            orderConfirm: '입금대기',
            paymentConfirm: '입금확인',
            shippingStart: '배송중',
            shippingComplete: '배송완료',
        };
        const newStatus = STATUS_MAP[templateType];
        if (newStatus && window.updateOrderStatus) {
            await window.updateOrderStatus(orderId, newStatus);
            console.log(`✅ ${templateType} 발송 → ${newStatus} 상태 자동 전환`);
            alert(`SMS가 발송되었습니다.\n주문 상태가 [${newStatus}](으)로 변경되었습니다.`);
        } else {
            alert('SMS가 발송되었습니다.');
        }
        // 주문 목록 새로고침
        if (window.orderDataManager?.loadOrders) {
            await window.orderDataManager.loadOrders();
            if (window.orderDataManager.renderOrdersTable) window.orderDataManager.renderOrdersTable();
        }

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

// 기본 하드코딩 값 (환경설정 → SMS → API 인증정보에서 덮어씀)
const SOLAPI_CONFIG_DEFAULT = {
    apiKey: 'NCSMOXRMGQAODZLK',
    apiSecret: '3KYQNOP16SZPKTBXFKPMB9UKTFRWI066',
    from: '01097456245'
};

// 런타임에 환경설정 값 우선 사용
function getSolapiConfig() {
    try {
        const saved = window.settingsDataManager?.getAllSettings()?.smsConfig || {};
        return {
            apiKey:    saved.apiKey    || SOLAPI_CONFIG_DEFAULT.apiKey,
            apiSecret: saved.apiSecret || SOLAPI_CONFIG_DEFAULT.apiSecret,
            from:      saved.from      || SOLAPI_CONFIG_DEFAULT.from
        };
    } catch (e) {
        return SOLAPI_CONFIG_DEFAULT;
    }
}

// Web Crypto API로 HMAC-SHA256 서명 생성
async function _createSolapiSignature(date, salt, apiSecret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(apiSecret),
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

    const cfg = getSolapiConfig();
    const date = new Date().toISOString();
    const salt = _randomHex(16);
    const signature = await _createSolapiSignature(date, salt, cfg.apiSecret);
    const authHeader = `HMAC-SHA256 apiKey=${cfg.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

    const response = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { to: normalizedPhone, from: cfg.from, text: message } })
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
    modal.className = 'modal-overlay';
    modal.style.zIndex = '600';
    modal.innerHTML = `
        <div class="modal-container modal-sm">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-sms text-brand mr-2"></i>문자 발송</span>
                <button id="customer-sms-close" class="modal-close-btn"><i class="fas fa-times text-sm"></i></button>
            </div>
            <div class="modal-body space-y-2">
                <div class="flex items-center gap-2 text-xs text-body bg-section rounded px-3 py-2">
                    <i class="fas fa-user text-muted"></i>
                    <span class="font-medium">${escapeHtmlBasic(customerName || '')}</span>
                    <span class="text-muted">·</span>
                    <span>${escapeHtmlBasic(displayPhone)}</span>
                </div>
                <div>
                    <textarea id="customer-sms-message" rows="5"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 resize-none"
                        placeholder="[경산다육식물농장] 안녕하세요, ${escapeHtmlBasic(customerName || '고객')}님..."></textarea>
                    <div class="text-right text-xs text-muted mt-0.5"><span id="customer-sms-count">0</span>자</div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="customer-sms-cancel" class="btn-secondary">취소</button>
                <button id="customer-sms-send" class="btn-primary">
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

    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
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
            toast.className = 'fixed bottom-4 right-4 z-[700] px-4 py-2.5 text-sm rounded-lg shadow-lg flex items-center gap-2 btn-primary';
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

// ─────────────────────────────────────────────
// 일괄 SMS 발송
// ─────────────────────────────────────────────

/**
 * 일괄 SMS 모달 표시 — 선택된 주문들에 대해 템플릿 선택 후 일괄 발송
 */
async function showBulkSMSModal() {
    const dm = window.orderDataManager;
    if (!dm || !dm.selectedOrders || dm.selectedOrders.size === 0) {
        alert('SMS를 보낼 주문을 먼저 선택해주세요.');
        return;
    }

    const selectedIds = Array.from(dm.selectedOrders);
    const count = selectedIds.length;

    // 기존 모달 제거
    const existing = document.getElementById('bulk-sms-modal');
    if (existing) existing.remove();

    const smsTemplates = getSMSTemplates();
    const templateOptions = Object.entries(smsTemplates)
        .map(([key, val]) => `<option value="${key}">${val.name}</option>`)
        .join('');

    const modal = document.createElement('div');
    modal.id = 'bulk-sms-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '700';
    modal.innerHTML = `
        <div class="modal-container modal-md" style="max-width:500px;">
            <div class="modal-header">
                <span class="modal-title"><i class="fas fa-sms text-info mr-2"></i>일괄 SMS 발송</span>
                <button class="modal-close-btn" onclick="document.getElementById('bulk-sms-modal').remove()">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
            <div class="modal-body" style="padding:16px;">
                <p class="text-sm text-secondary mb-3">
                    선택된 <strong class="text-info">${count}건</strong>의 주문에 SMS를 일괄 발송합니다.
                </p>
                <div class="mb-3">
                    <label class="form-label">템플릿 선택</label>
                    <select id="bulk-sms-template" class="form-control">
                        ${templateOptions}
                    </select>
                </div>
                <div>
                    <label class="form-label">메시지 미리보기</label>
                    <textarea id="bulk-sms-preview" class="form-control" rows="6" readonly
                        style="font-size:12px;background:var(--bg-light);"></textarea>
                    <p class="text-xs text-muted mt-1">* 각 주문별로 고객명·주문번호 등이 자동 치환됩니다.</p>
                </div>
                <div id="bulk-sms-progress" class="mt-3 hidden">
                    <div class="flex items-center gap-2 text-sm">
                        <i class="fas fa-spinner fa-spin text-info"></i>
                        <span id="bulk-sms-progress-text">발송 중...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div id="bulk-sms-progress-bar" class="h-2 rounded-full" style="width:0%;background:var(--primary);transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('bulk-sms-modal').remove()">취소</button>
                <button id="bulk-sms-send-btn" class="btn-primary">
                    <i class="fas fa-paper-plane mr-1"></i>${count}건 일괄 발송
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const templateSelect = modal.querySelector('#bulk-sms-template');
    const previewArea = modal.querySelector('#bulk-sms-preview');
    const sendBtn = modal.querySelector('#bulk-sms-send-btn');

    // 템플릿 미리보기 업데이트
    function updatePreview() {
        const key = templateSelect.value;
        const tmpl = smsTemplates[key];
        previewArea.value = tmpl ? tmpl.template : '';
    }
    templateSelect.addEventListener('change', updatePreview);
    updatePreview();

    // 발송
    sendBtn.addEventListener('click', async () => {
        const templateType = templateSelect.value;
        if (!confirm(`${count}건의 주문에 SMS를 발송합니다.\n계속하시겠습니까?`)) return;

        sendBtn.disabled = true;
        const progressDiv = modal.querySelector('#bulk-sms-progress');
        const progressText = modal.querySelector('#bulk-sms-progress-text');
        const progressBar = modal.querySelector('#bulk-sms-progress-bar');
        progressDiv.classList.remove('hidden');

        let success = 0, fail = 0;

        for (let i = 0; i < selectedIds.length; i++) {
            const orderId = selectedIds[i];
            progressText.textContent = `발송 중... (${i + 1}/${count})`;
            progressBar.style.width = ((i + 1) / count * 100) + '%';

            try {
                await sendOrderSMS(orderId, templateType);
                success++;
            } catch (e) {
                console.error(`SMS 발송 실패 (${orderId}):`, e);
                fail++;
            }
        }

        // 템플릿별 상태 자동 전환
        const BULK_STATUS_MAP = {
            orderConfirm: '입금대기',
            paymentConfirm: '입금확인',
            shippingStart: '배송중',
            shippingComplete: '배송완료',
        };
        const bulkNewStatus = BULK_STATUS_MAP[templateType];
        if (bulkNewStatus && window.updateOrderStatus) {
            for (const id of selectedIds) {
                try { await window.updateOrderStatus(id, bulkNewStatus); } catch (e) { /* skip */ }
            }
        }

        modal.remove();

        // 목록 새로고침
        if (dm.loadOrders) {
            await dm.loadOrders();
            if (dm.renderOrdersTable) dm.renderOrdersTable();
        }

        alert(`일괄 SMS 발송 완료\n성공: ${success}건 / 실패: ${fail}건` +
            (templateType === 'orderConfirm' ? '\n상태가 [입금대기]로 변경되었습니다.' : ''));
    });
}

window.showBulkSMSModal = showBulkSMSModal;
window.sendSolapiSMS = sendSolapiSMS;
window.openCustomerSMSModal = openCustomerSMSModal;
window.openCustomerSMSById = openCustomerSMSById;

