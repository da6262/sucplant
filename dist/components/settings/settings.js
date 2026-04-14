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

// 스크립트 로드 완료 후 즉시 이벤트 리스너 설정
console.log('🔄 환경설정 스크립트 로드 완료, 이벤트 리스너 설정...');
setTimeout(() => {
    setupSettingsTabListeners();
    setupSettingsButtonListeners();
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
        const tabButtons = document.querySelectorAll('.settings-tab');
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
    if (target.id === 'save-shipping-settings') {
        e.preventDefault();
        saveShippingSettings();
    } else if (target.id === 'cancel-shipping-settings') {
        e.preventDefault();
        if (window.loadShippingSettings) window.loadShippingSettings();
        else alert('변경사항이 취소되었습니다.');
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
        window.settingsDataManager.settings.shipping.expressShippingFee = get('express-shipping-fee') ? num('express-shipping-fee') : (window.settingsDataManager.settings.shipping.expressShippingFee ?? 5000);
        await window.settingsDataManager.saveSettings();
        if (!window.SHIPPING_SETTINGS) window.SHIPPING_SETTINGS = {};
        window.SHIPPING_SETTINGS.defaultShippingFee = window.settingsDataManager.settings.shipping.defaultShippingFee ?? 3000;
        window.SHIPPING_SETTINGS.freeShippingThreshold = window.settingsDataManager.settings.shipping.freeShippingThreshold ?? 50000;
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
    if (get('express-shipping-fee')) { m.settings.shipping = m.settings.shipping || {}; m.settings.shipping.expressShippingFee = num('express-shipping-fee'); }
    const smsOrder = get('sms-order-confirm'); const smsPay = get('sms-payment-confirm'); const smsStart = get('sms-shipping-start');
    const smsComplete = get('sms-shipping-complete'); const smsWait = get('sms-waitlist-notify');
    if (smsOrder || smsPay || smsStart || smsComplete || smsWait) {
        m.settings.smsTemplates = m.settings.smsTemplates || {};
        if (smsOrder) m.settings.smsTemplates.orderConfirm = smsOrder.value || '';
        if (smsPay) m.settings.smsTemplates.paymentConfirm = smsPay.value || '';
        if (smsStart) m.settings.smsTemplates.shippingStart = smsStart.value || '';
        if (smsComplete) m.settings.smsTemplates.shippingComplete = smsComplete.value || '';
        if (smsWait) m.settings.smsTemplates.waitlistNotify = smsWait.value || '';
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
            document.querySelectorAll('.settings-tab').forEach(tab => {
                tab.classList.remove('border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            
            // 선택된 탭 표시
            const targetTab = document.getElementById(`settings-${tabName}-section`);
            const targetTabButton = document.getElementById(`settings-tab-${tabName}`);
            
            if (targetTab) {
                targetTab.classList.remove('hidden');
                console.log('✅ 환경설정 탭 표시 완료:', tabName);
                
                // 탭 버튼 활성화
                if (targetTabButton) {
                    targetTabButton.classList.remove('border-transparent', 'text-gray-500');
                    targetTabButton.classList.add('border-blue-500', 'text-blue-600');
                }
                
                // SMS 설정 탭인 경우 특별 처리
                if (tabName === 'sms') {
                    loadSMSSettings();
                }
            } else {
                console.warn('⚠️ 환경설정 탭을 찾을 수 없습니다:', tabName);
            }
        } catch (error) {
            console.error('❌ 환경설정 탭 표시 실패:', error);
        }
    };
}

// SMS 설정 로드 함수
async function loadSMSSettings() {
    try {
        console.log('📱 SMS 설정 로드 시작');
        
        // 설정 데이터 매니저에서 SMS 설정 가져오기
        const settings = window.settingsDataManager?.getAllSettings();
        const smsSettings = settings?.smsTemplates || {};
        
        // SMS 템플릿 필드들에 값 설정
        const smsFields = {
            'sms-order-confirm': smsSettings.orderConfirm || '',
            'sms-payment-confirm': smsSettings.paymentConfirm || '',
            'sms-shipping-start': smsSettings.shippingStart || '',
            'sms-shipping-complete': smsSettings.shippingComplete || '',
            'sms-waitlist-notify': smsSettings.waitlistNotify || ''
        };
        
        // 각 필드에 값 설정
        Object.entries(smsFields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        });
        
        // SMS 설정 저장/취소 버튼 이벤트 리스너 추가
        setupSMSSettingsEventListeners();
        
        console.log('✅ SMS 설정 로드 완료');
    } catch (error) {
        console.error('❌ SMS 설정 로드 실패:', error);
    }
}

// SMS 설정 이벤트 리스너 설정
function setupSMSSettingsEventListeners() {
    try {
        // SMS 설정 저장 버튼
        const saveBtn = document.getElementById('save-sms-settings');
        if (saveBtn) {
            saveBtn.onclick = saveSMSSettings;
        }
        
        // SMS 설정 취소 버튼
        const cancelBtn = document.getElementById('cancel-sms-settings');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                loadSMSSettings(); // 원래 값으로 되돌리기
            };
        }
        
        console.log('✅ SMS 설정 이벤트 리스너 설정 완료');
    } catch (error) {
        console.error('❌ SMS 설정 이벤트 리스너 설정 실패:', error);
    }
}

// SMS 설정 저장
async function saveSMSSettings() {
    try {
        console.log('💾 SMS 설정 저장 시작');
        
        // SMS 템플릿 필드들에서 값 가져오기
        const smsTemplates = {
            orderConfirm: document.getElementById('sms-order-confirm')?.value || '',
            paymentConfirm: document.getElementById('sms-payment-confirm')?.value || '',
            shippingStart: document.getElementById('sms-shipping-start')?.value || '',
            shippingComplete: document.getElementById('sms-shipping-complete')?.value || '',
            waitlistNotify: document.getElementById('sms-waitlist-notify')?.value || ''
        };
        
        // 설정 데이터 매니저를 통해 저장
        if (window.settingsDataManager) {
            await window.settingsDataManager.updateSetting('smsTemplates', 'orderConfirm', smsTemplates.orderConfirm);
            await window.settingsDataManager.updateSetting('smsTemplates', 'paymentConfirm', smsTemplates.paymentConfirm);
            await window.settingsDataManager.updateSetting('smsTemplates', 'shippingStart', smsTemplates.shippingStart);
            await window.settingsDataManager.updateSetting('smsTemplates', 'shippingComplete', smsTemplates.shippingComplete);
            await window.settingsDataManager.updateSetting('smsTemplates', 'waitlistNotify', smsTemplates.waitlistNotify);
            
            console.log('✅ SMS 설정 저장 완료');
            alert('SMS 설정이 저장되었습니다.');
        } else {
            console.error('❌ 설정 데이터 매니저를 찾을 수 없습니다');
            alert('설정 저장에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('❌ SMS 설정 저장 실패:', error);
        alert('SMS 설정 저장에 실패했습니다: ' + error.message);
    }
}

// 전역 함수로 등록
window.loadSMSSettings = loadSMSSettings;
window.saveSMSSettings = saveSMSSettings;
