// 환경설정 JavaScript
// components/settings/settings.js

// 환경설정 탭 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚙️ 환경설정 JavaScript 로드됨');
    
    // 약간의 지연 후 이벤트 리스너 설정 (DOM이 완전히 로드된 후)
    setTimeout(() => {
        console.log('🔄 이벤트 리스너 설정 시작...');
        setupSettingsTabListeners();
        setupSettingsButtonListeners();
    }, 100);
});

// 페이지 로드 완료 후에도 이벤트 리스너 설정
window.addEventListener('load', function() {
    console.log('🔄 페이지 로드 완료, 이벤트 리스너 재설정...');
    setTimeout(() => {
        setupSettingsTabListeners();
    }, 200);
});

// 스크립트 로드 완료 후 즉시 이벤트 리스너 설정 + 초기 데이터 로드
console.log('🔄 환경설정 스크립트 로드 완료, 이벤트 리스너 설정...');
setTimeout(async () => {
    setupSettingsTabListeners();
    setupSettingsButtonListeners();
    // 첫 진입 시 Supabase에서 최신 설정을 받아온 뒤 폼에 표시
    try {
        if (window.settingsDataManager) {
            await window.settingsDataManager.loadSettings();
        }
    } catch(e) { /* 오프라인 등 실패 시 캐시 사용 */ }
    if (window.loadGeneralSettings) {
        window.loadGeneralSettings();
    }
}, 500);

// 추가적인 이벤트 리스너 설정 (더 강력한 방법)
setTimeout(() => {
    console.log('🔄 추가 이벤트 리스너 설정...');
    
    // SMS 탭을 다시 찾아서 이벤트 리스너 추가
    const smsTab = document.getElementById('settings-tab-sms');
    if (smsTab) {
        console.log('📱 SMS 탭 재발견, 강력한 이벤트 리스너 추가');
        
        // 모든 이벤트 타입에 대해 리스너 추가
        ['click', 'mousedown', 'mouseup'].forEach(eventType => {
            smsTab.addEventListener(eventType, function(e) {
                console.log(`📱 SMS 탭 ${eventType} 이벤트 발생!`);
                e.preventDefault();
                e.stopPropagation();
                window.showSettingsTab('sms');
                return false;
            });
        });
        
        // onclick 속성도 설정
        smsTab.onclick = function(e) {
            console.log('📱 SMS 탭 onclick 속성 실행!');
            e.preventDefault();
            e.stopPropagation();
            window.showSettingsTab('sms');
            return false;
        };
    }
}, 1000);

// 환경설정 탭 이벤트 리스너 설정
function setupSettingsTabListeners() {
    try {
        // 탭 버튼들에 클릭 이벤트 추가
        const tabButtons = document.querySelectorAll('[id^="settings-tab-"]');
        console.log('🔍 찾은 탭 버튼 개수:', tabButtons.length);
        
        tabButtons.forEach((button, index) => {
            console.log(`📱 탭 버튼 ${index + 1}:`, button.id, button.textContent.trim());
            
            // 기존 이벤트 리스너 제거 (중복 방지)
            button.removeEventListener('click', handleTabClick);
            
            // 새 이벤트 리스너 추가
            button.addEventListener('click', handleTabClick);
        });
        
        // SMS 설정 탭에 직접 이벤트 리스너 추가
        const smsTab = document.getElementById('settings-tab-sms');
        if (smsTab) {
            console.log('📱 SMS 설정 탭 발견, 직접 이벤트 리스너 추가');
            
            // 기존 이벤트 리스너 제거
            smsTab.removeEventListener('click', handleSMSTabClick);
            
            // 새 이벤트 리스너 추가
            smsTab.addEventListener('click', handleSMSTabClick);
            
            // 추가적인 이벤트 리스너 (onclick 속성)
            smsTab.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 SMS 설정 탭 onclick 이벤트!');
                window.showSettingsTab('sms');
                return false;
            };
        } else {
            console.warn('⚠️ SMS 설정 탭을 찾을 수 없습니다');
        }
        
        console.log('✅ 환경설정 탭 이벤트 리스너 설정 완료');
    } catch (error) {
        console.error('❌ 환경설정 탭 이벤트 리스너 설정 실패:', error);
    }
}

// 탭 클릭 핸들러
function handleTabClick(event) {
    event.preventDefault();
    const tabName = this.id.replace('settings-tab-', '');
    console.log('📱 환경설정 탭 클릭:', tabName);
    
    // 탭 표시
    if (window.showSettingsTab) {
        window.showSettingsTab(tabName);
    } else {
        console.warn('⚠️ showSettingsTab 함수를 찾을 수 없습니다');
    }
}

// SMS 탭 클릭 핸들러
function handleSMSTabClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('📱 SMS 설정 탭 클릭됨!');
    
    if (window.showSettingsTab) {
        window.showSettingsTab('sms');
    } else {
        console.warn('⚠️ showSettingsTab 함수를 찾을 수 없습니다');
    }
    return false;
}

// 설정 버튼 이벤트 리스너 설정
function setupSettingsButtonListeners() {
    try {
        // 모든 설정 저장 버튼
        const saveAllBtn = document.getElementById('save-all-settings-btn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', function() {
                console.log('💾 모든 설정 저장 버튼 클릭');
                saveAllSettings();
            });
        }
        
        // 설정 초기화 버튼
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('🔄 설정 초기화 버튼 클릭');
                if (confirm('모든 설정을 초기화하시겠습니까?')) {
                    resetAllSettings();
                }
            });
        }
        
        // 배송 설정 저장/취소 버튼 (위임 리스너 1회만 등록, DOM 로드 시점 무관)
        if (!window._settingsDelegatedClickBound) {
            document.addEventListener('click', handleSettingsDelegatedClick);
            window._settingsDelegatedClickBound = true;
        }
        const saveShippingBtn = document.getElementById('save-shipping-settings');
        if (saveShippingBtn) {
            saveShippingBtn.removeAttribute('disabled');
            saveShippingBtn.setAttribute('type', 'button');
        }
        
        console.log('✅ 설정 버튼 이벤트 리스너 설정 완료');
    } catch (error) {
        console.error('❌ 설정 버튼 이벤트 리스너 설정 실패:', error);
    }
}

function handleSettingsDelegatedClick(e) {
    const target = e.target.id ? e.target : e.target.closest('[id]');
    if (!target) return;
    if (target.id === 'save-general-settings') {
        e.preventDefault();
        saveGeneralSettings();
    } else if (target.id === 'cancel-general-settings') {
        e.preventDefault();
        if (window.loadGeneralSettings) window.loadGeneralSettings();
    } else if (target.id === 'save-shipping-settings') {
        e.preventDefault();
        saveShippingSettings();
    } else if (target.id === 'cancel-shipping-settings') {
        e.preventDefault();
        if (window.loadShippingSettings) window.loadShippingSettings();
        else alert('변경사항이 취소되었습니다.');
    }
}

async function saveGeneralSettings() {
    try {
        if (!window.settingsDataManager) {
            alert('설정 저장에 실패했습니다.');
            return;
        }
        const get = (id) => document.getElementById(id);
        const val = (id) => (get(id)?.value ?? '').trim();
        const m = window.settingsDataManager;
        m.settings = m.settings || {};
        m.settings.farm = m.settings.farm || {};
        m.settings.farm.name = val('farm-name') || m.settings.farm.name || '';
        m.settings.farm.owner = val('farm-owner') || m.settings.farm.owner || '';
        m.settings.farm.phone = val('farm-phone');
        m.settings.farm.address = val('farm-address');
        await m.saveSettings();
        alert('일반 설정이 저장되었습니다.');
    } catch (err) {
        console.error('❌ 일반 설정 저장 실패:', err);
        alert('일반 설정 저장에 실패했습니다: ' + (err.message || err));
    }
}

// 배송 설정만 저장 (배송설정 탭의 "저장" 버튼용)
async function saveShippingSettings() {
    try {
        if (!window.settingsDataManager) {
            alert('설정 저장에 실패했습니다.');
            return;
        }
        const get = (id) => document.getElementById(id);
        const num = (id) => Math.max(0, parseInt(get(id)?.value, 10) || 0);
        window.settingsDataManager.settings = window.settingsDataManager.settings || {};
        window.settingsDataManager.settings.shipping = window.settingsDataManager.settings.shipping || {};
        window.settingsDataManager.settings.shipping.defaultShippingFee = get('default-shipping-fee') ? num('default-shipping-fee') : (window.settingsDataManager.settings.shipping.defaultShippingFee ?? 3000);
        window.settingsDataManager.settings.shipping.freeShippingThreshold = get('free-shipping-threshold') ? num('free-shipping-threshold') : (window.settingsDataManager.settings.shipping.freeShippingThreshold ?? 50000);
        window.settingsDataManager.settings.shipping.remoteAreaShippingFee = get('remote-area-shipping-fee') ? num('remote-area-shipping-fee') : (window.settingsDataManager.settings.shipping.remoteAreaShippingFee ?? 5000);
        // 배송 방법 목록
        const methodsInput = get('shipping-methods-input');
        if (methodsInput && methodsInput.value.trim()) {
            window.settingsDataManager.settings.shipping.shippingMethods =
                methodsInput.value.split(',').map(s => s.trim()).filter(Boolean);
        }
        await window.settingsDataManager.saveSettings();
        if (!window.SHIPPING_SETTINGS) window.SHIPPING_SETTINGS = {};
        window.SHIPPING_SETTINGS.defaultShippingFee = window.settingsDataManager.settings.shipping.defaultShippingFee ?? 3000;
        window.SHIPPING_SETTINGS.freeShippingThreshold = window.settingsDataManager.settings.shipping.freeShippingThreshold ?? 50000;
        window.SHIPPING_SETTINGS.remoteAreaShippingFee = window.settingsDataManager.settings.shipping.remoteAreaShippingFee ?? 5000;
        console.log('✅ 배송 설정 저장 완료:', window.SHIPPING_SETTINGS);
        alert('배송 설정이 저장되었습니다.');
    } catch (err) {
        console.error('❌ 배송 설정 저장 실패:', err);
        alert('배송 설정 저장에 실패했습니다: ' + (err.message || err));
    }
}

// 폼 입력값을 settingsDataManager 메모리에만 반영 (저장 전 한 번 호출 후 saveSettings 1회)
function syncFormToSettings() {
    const m = window.settingsDataManager;
    if (!m || !m.settings) return;
    const get = (id) => document.getElementById(id);
    const val = (id) => (get(id) && get(id).value != null) ? String(get(id).value).trim() : '';
    const num = (id) => Math.max(0, parseInt(get(id)?.value, 10) || 0);
    if (get('farm-name')) { m.settings.farm = m.settings.farm || {}; m.settings.farm.name = val('farm-name') || m.settings.farm.name || ''; }
    if (get('farm-owner')) { m.settings.farm = m.settings.farm || {}; m.settings.farm.owner = val('farm-owner') || m.settings.farm.owner || ''; }
    if (get('farm-phone')) { m.settings.farm = m.settings.farm || {}; m.settings.farm.phone = val('farm-phone'); }
    if (get('farm-address')) { m.settings.farm = m.settings.farm || {}; m.settings.farm.address = val('farm-address'); }
    if (get('default-shipping-fee')) { m.settings.shipping = m.settings.shipping || {}; m.settings.shipping.defaultShippingFee = num('default-shipping-fee'); }
    if (get('free-shipping-threshold')) { m.settings.shipping = m.settings.shipping || {}; m.settings.shipping.freeShippingThreshold = num('free-shipping-threshold'); }
    if (get('remote-area-shipping-fee')) { m.settings.shipping = m.settings.shipping || {}; m.settings.shipping.remoteAreaShippingFee = num('remote-area-shipping-fee'); }
    const smsOrder = get('sms-order-confirm'); const smsPay = get('sms-payment-confirm'); const smsStart = get('sms-shipping-start');
    const smsComplete = get('sms-shipping-complete'); const smsWait = get('sms-waitlist-notify'); const smsOos = get('sms-out-of-stock');
    if (smsOrder || smsPay || smsStart || smsComplete || smsWait || smsOos) {
        m.settings.smsTemplates = m.settings.smsTemplates || {};
        if (smsOrder) m.settings.smsTemplates.orderConfirm = smsOrder.value || '';
        if (smsPay) m.settings.smsTemplates.paymentConfirm = smsPay.value || '';
        if (smsStart) m.settings.smsTemplates.shippingStart = smsStart.value || '';
        if (smsComplete) m.settings.smsTemplates.shippingComplete = smsComplete.value || '';
        if (smsWait) m.settings.smsTemplates.waitlistNotify = smsWait.value || '';
        if (smsOos) m.settings.smsTemplates.outOfStock = smsOos.value || '';
    }
    // API 인증정보
    const smsApiKey = val('sms-api-key');
    const smsApiSecret = get('sms-api-secret') ? get('sms-api-secret').value.trim() : '';
    const smsFromNumber = val('sms-from-number');
    if (smsApiKey || smsApiSecret || smsFromNumber) {
        m.settings.smsConfig = m.settings.smsConfig || {};
        if (smsApiKey) m.settings.smsConfig.apiKey = smsApiKey;
        if (smsApiSecret) m.settings.smsConfig.apiSecret = smsApiSecret;
        if (smsFromNumber) m.settings.smsConfig.from = smsFromNumber;
    }
}

// 모든 설정 저장
async function saveAllSettings() {
    try {
        console.log('💾 모든 설정 저장 시작');
        if (!window.settingsDataManager) {
            console.error('❌ 설정 데이터 매니저를 찾을 수 없습니다');
            alert('설정 저장에 실패했습니다.');
            return;
        }
        syncFormToSettings();
        await window.settingsDataManager.saveSettings();
        // 주문 폼 등에서 쓰는 전역 배송비 제안값을 즉시 반영 (새 주문 등록 시 4000 등 이전값 방지)
        const m = window.settingsDataManager;
        if (m && m.settings && m.settings.shipping) {
            if (!window.SHIPPING_SETTINGS) window.SHIPPING_SETTINGS = {};
            window.SHIPPING_SETTINGS.defaultShippingFee = m.settings.shipping.defaultShippingFee ?? 3000;
            window.SHIPPING_SETTINGS.freeShippingThreshold = m.settings.shipping.freeShippingThreshold ?? 50000;
            console.log('✅ SHIPPING_SETTINGS 동기화:', window.SHIPPING_SETTINGS);
        }
        console.log('✅ 모든 설정 저장 완료');
        alert('모든 설정이 저장되었습니다.');
    } catch (error) {
        console.error('❌ 모든 설정 저장 실패:', error);
        alert('설정 저장에 실패했습니다: ' + error.message);
    }
}

// 모든 설정 초기화
async function resetAllSettings() {
    try {
        console.log('🔄 모든 설정 초기화 시작');
        
        if (window.settingsDataManager) {
            await window.settingsDataManager.resetSettings();
            console.log('✅ 모든 설정 초기화 완료');
            alert('모든 설정이 초기화되었습니다.');
            
            // 페이지 새로고침하여 초기화된 설정 반영
            location.reload();
        } else {
            console.error('❌ 설정 데이터 매니저를 찾을 수 없습니다');
            alert('설정 초기화에 실패했습니다.');
        }
    } catch (error) {
        console.error('❌ 모든 설정 초기화 실패:', error);
        alert('설정 초기화에 실패했습니다: ' + error.message);
    }
}

// 전역 함수로 등록
window.saveAllSettings = saveAllSettings;
window.resetAllSettings = resetAllSettings;

// showSettingsTab 함수가 없을 경우 직접 구현
if (!window.showSettingsTab) {
    window.showSettingsTab = function(tabName) {
        try {
            console.log('⚙️ 환경설정 탭 표시:', tabName);
            
            // 모든 탭 숨기기
            document.querySelectorAll('.settings-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            // 모든 탭 버튼 비활성화
            document.querySelectorAll('[id^="settings-tab-"]').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 선택된 탭 표시
            const targetTab = document.getElementById(`settings-${tabName}-section`);
            const targetTabButton = document.getElementById(`settings-tab-${tabName}`);
            
            if (targetTab) {
                targetTab.classList.remove('hidden');
                console.log('✅ 환경설정 탭 표시 완료:', tabName);
                
                // 탭 버튼 활성화
                if (targetTabButton) {
                    targetTabButton.classList.add('active');
                }
                
                // 탭별 데이터 로드 (설정 캐시가 비어있으면 DB에서 먼저 읽음)
                const ensureSettings = async () => {
                    const s = window.settingsDataManager?.getAllSettings();
                    const isEmpty = !s || (!s.farm?.name && !s.shipping?.defaultShippingFee);
                    if (isEmpty && window.settingsDataManager) {
                        await window.settingsDataManager.loadSettings();
                    }
                };
                (async () => {
                    await ensureSettings();
                    switch (tabName) {
                        case 'general':
                            if (window.loadGeneralSettings) window.loadGeneralSettings();
                            break;
                        case 'shipping':
                            if (window.loadShippingSettings) window.loadShippingSettings();
                            break;
                        case 'channels':
                            if (window.loadSalesChannels) window.loadSalesChannels();
                            break;
                        case 'orders':
                            if (window.loadOrderStatuses) window.loadOrderStatuses();
                            break;
                        case 'customers':
                            if (window.loadCustomerGrades) window.loadCustomerGrades();
                            break;
                        case 'sms':
                            loadSMSSettings();
                            break;
                    }
                })();
            } else {
                console.warn('⚠️ 환경설정 탭을 찾을 수 없습니다:', tabName);
            }
        } catch (error) {
            console.error('❌ 환경설정 탭 표시 실패:', error);
        }
    };
}

// SMS 설정 로드 — 템플릿 리스트 방식 (settingsUI.js와 동일)
async function loadSMSSettings() {
    try {
        const settings = window.settingsDataManager?.getAllSettings();
        const smsSettings = settings?.smsTemplates || {};
        // API 인증정보 필드 채우기
        const smsConfig = settings?.smsConfig || {};
        const apiKeyEl = document.getElementById('sms-api-key');
        const apiSecretEl = document.getElementById('sms-api-secret');
        const fromEl = document.getElementById('sms-from-number');
        if (apiKeyEl) apiKeyEl.value = smsConfig.apiKey || '';
        if (apiSecretEl) apiSecretEl.value = smsConfig.apiSecret || '';
        if (fromEl) fromEl.value = smsConfig.from || '';
        // 인증정보 저장 버튼
        const saveCfgBtn = document.getElementById('save-sms-config-btn');
        if (saveCfgBtn && !saveCfgBtn._smsCfgBound) {
            saveCfgBtn._smsCfgBound = true;
            saveCfgBtn.addEventListener('click', async () => {
                syncFormToSettings();
                await window.settingsDataManager.saveSettings();
                alert('API 인증정보가 저장되었습니다.');
            });
        }
        const container = document.getElementById('sms-templates-list');
        if (!container) return;
        container.innerHTML = '';
        const templates = [
            { key: 'orderConfirm',    label: '주문확인',  fieldId: 'sms-order-confirm',    vars: '{customerName} {orderNumber} {orderDetails} {totalAmount} {shippingFee} {paymentInfo}' },
            { key: 'paymentConfirm',  label: '입금확인',  fieldId: 'sms-payment-confirm',   vars: '{customerName} {orderNumber}' },
            { key: 'shippingStart',   label: '배송시작',  fieldId: 'sms-shipping-start',    vars: '{customerName} {orderNumber} {shippingCompany} {trackingNumber}' },
            { key: 'shippingComplete',label: '배송완료',  fieldId: 'sms-shipping-complete', vars: '{customerName} {orderNumber}' },
            { key: 'waitlistNotify',  label: '대기품목',  fieldId: 'sms-waitlist-notify',   vars: '{customerName} {productName} {quantity}' },
            { key: 'outOfStock',      label: '품절안내',  fieldId: 'sms-out-of-stock',      vars: '{customerName} {orderNumber}' },
        ];
        templates.forEach(tpl => {
            const value = smsSettings[tpl.key] || '';
            const preview = value ? value.split('\n')[0].slice(0, 50) + (value.length > 50 ? '…' : '') : '(미설정)';
            const item = document.createElement('div');
            item.id = `sms-item-${tpl.key}`;
            item.className = 'border-b border-gray-100 last:border-0';
            item.innerHTML = `
                <div class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-section select-none" onclick="toggleSmsTemplate('${tpl.key}')">
                    <span class="text-xs font-medium text-heading w-20 shrink-0">${tpl.label}</span>
                    <span class="sms-preview text-xs text-muted flex-1 truncate">${preview}</span>
                    <i class="fas fa-chevron-down text-gray-300 text-xs" id="sms-chevron-${tpl.key}"></i>
                </div>
                <div class="hidden px-3 pb-3 bg-section" id="sms-detail-${tpl.key}">
                    <p class="text-xs text-muted mb-1.5">변수: ${tpl.vars}</p>
                    <textarea id="${tpl.fieldId}" class="input-ui resize-y w-full text-xs" rows="5">${value}</textarea>
                    <div class="flex justify-end mt-1.5">
                        <button onclick="saveSingleSmsTemplate('${tpl.key}','${tpl.fieldId}')" class="btn-primary btn-xs">저장</button>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('❌ SMS 설정 로드 실패:', error);
    }
}

// 전역 함수로 등록
window.loadSMSSettings = loadSMSSettings;
