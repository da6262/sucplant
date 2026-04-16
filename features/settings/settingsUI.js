// 환경설정 UI 관리
// features/settings/settingsUI.js

// 환경설정 탭 표시
export function showSettingsTab(tabName) {
    try {
        console.log('⚙️ 환경설정 탭 표시:', tabName);
        
        // 모든 탭 숨기기
        document.querySelectorAll('.settings-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('[id^="settings-tab-"]').forEach(tab => {
            tab.classList.remove('active', 'border-blue-500', 'text-blue-600');
            tab.classList.add('border-transparent', 'text-muted');
        });
        
        // 선택된 탭 표시
        const targetTab = document.getElementById(`settings-${tabName}-section`);
        const targetTabButton = document.getElementById(`settings-tab-${tabName}`);
        
        if (targetTab) {
            targetTab.classList.remove('hidden');
            console.log('✅ 환경설정 탭 표시 완료:', tabName);
            
            // 탭 버튼 활성화
            if (targetTabButton) {
                targetTabButton.classList.remove('border-transparent', 'text-muted');
                targetTabButton.classList.add('active');
            }
            
            // 탭별 데이터 로드
            switch(tabName) {
                case 'general':
                    loadGeneralSettings();
                    break;
                case 'shipping':
                    loadShippingSettings();
                    break;
                case 'channels':
                    loadSalesChannels();
                    break;
                case 'orders':
                    loadOrderStatuses();
                    break;
                case 'customers':
                    loadCustomerGrades();
                    break;
                case 'sms':
                    loadSMSSettings();
                    break;
            }
        } else {
            console.warn('⚠️ 환경설정 탭을 찾을 수 없습니다:', tabName);
        }
    } catch (error) {
        console.error('❌ 환경설정 탭 표시 실패:', error);
    }
}

// SMS 설정 로드
async function loadSMSSettings() {
    try {
        const settings = window.settingsDataManager?.getAllSettings();
        const smsSettings = settings?.smsTemplates || {};
        const smsConfig   = settings?.smsConfig    || {};

        // API 인증정보 필드 채우기
        const keyEl    = document.getElementById('sms-api-key');
        const secretEl = document.getElementById('sms-api-secret');
        const fromEl   = document.getElementById('sms-from-number');
        if (keyEl)    keyEl.value    = smsConfig.apiKey    || '';
        if (secretEl) secretEl.value = smsConfig.apiSecret || '';
        if (fromEl)   fromEl.value   = smsConfig.from      || '';

        // 인증정보 저장 버튼 이벤트 연결
        const saveConfigBtn = document.getElementById('save-sms-config-btn');
        if (saveConfigBtn && !saveConfigBtn._bound) {
            saveConfigBtn._bound = true;
            saveConfigBtn.addEventListener('click', async () => {
                try {
                    const apiKey    = (document.getElementById('sms-api-key')?.value    || '').trim();
                    const apiSecret = (document.getElementById('sms-api-secret')?.value || '').trim();
                    const from      = (document.getElementById('sms-from-number')?.value || '').replace(/[^0-9]/g, '');

                    if (!apiKey || !apiSecret || !from) {
                        alert('API Key, API Secret, 발신번호를 모두 입력해주세요.');
                        return;
                    }

                    if (window.settingsDataManager) {
                        await window.settingsDataManager.updateSetting('smsConfig', 'apiKey',    apiKey);
                        await window.settingsDataManager.updateSetting('smsConfig', 'apiSecret', apiSecret);
                        await window.settingsDataManager.updateSetting('smsConfig', 'from',      from);
                        if (window.showToast) window.showToast('✅ SMS 인증정보가 저장되었습니다.', 2500);
                        else alert('SMS 인증정보가 저장되었습니다.');
                    } else {
                        alert('설정 저장에 실패했습니다.');
                    }
                } catch (e) {
                    console.error('SMS 인증정보 저장 실패:', e);
                    alert('저장 실패: ' + e.message);
                }
            });
        }

        const container = document.getElementById('sms-templates-list');
        if (!container) return;
        container.innerHTML = '';

        const templates = [
            { key: 'orderConfirm',    label: '주문확인',    fieldId: 'sms-order-confirm',    vars: '{customerName} {orderNumber} {orderDetails} {totalAmount} {shippingFee} {paymentInfo}' },
            { key: 'paymentConfirm',  label: '입금확인',    fieldId: 'sms-payment-confirm',   vars: '{customerName} {orderNumber}' },
            { key: 'shippingStart',   label: '배송시작',    fieldId: 'sms-shipping-start',    vars: '{customerName} {orderNumber} {shippingCompany} {trackingNumber}' },
            { key: 'shippingComplete',label: '배송완료',    fieldId: 'sms-shipping-complete', vars: '{customerName} {orderNumber}' },
            { key: 'waitlistNotify',  label: '대기품목',    fieldId: 'sms-waitlist-notify',   vars: '{customerName} {productName} {quantity}' },
        ];

        templates.forEach(tpl => {
            const value = smsSettings[tpl.key] || '';
            const preview = value ? value.split('\n')[0].slice(0, 50) + (value.length > 50 ? '…' : '') : '(미설정)';
            const item = document.createElement('div');
            item.id = `sms-item-${tpl.key}`;
            item.className = 'border-b border-gray-100 last:border-0';
            item.innerHTML = `
                <div class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 select-none" onclick="toggleSmsTemplate('${tpl.key}')">
                    <span class="text-xs font-medium text-body w-20 shrink-0">${tpl.label}</span>
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

// SMS 설정 관련 함수들을 전역으로 export
window.loadSMSSettings = loadSMSSettings;
window.saveSMSSettings = saveSMSSettings;

// 일반 설정 로드
export function loadGeneralSettings() {
    try {
        console.log('⚙️ 일반 설정 로드');
        
        const settings = window.settingsDataManager.getAllSettings();
        
        // 농장 정보 로드
        const farmNameInput = document.getElementById('farm-name');
        const farmOwnerInput = document.getElementById('farm-owner');
        const farmPhoneInput = document.getElementById('farm-phone');
        const farmAddressInput = document.getElementById('farm-address');
        
        if (farmNameInput) farmNameInput.value = settings.farm.name || '';
        if (farmOwnerInput) farmOwnerInput.value = settings.farm.owner || '';
        if (farmPhoneInput) farmPhoneInput.value = settings.farm.phone || '';
        if (farmAddressInput) farmAddressInput.value = settings.farm.address || '';
        
        // 시스템 설정 로드
        const autoBackupToggle = document.getElementById('auto-backup');
        const systemLogsToggle = document.getElementById('system-logs');
        const debugModeToggle = document.getElementById('debug-mode');
        
        if (autoBackupToggle) autoBackupToggle.checked = settings.system.autoBackup || false;
        if (systemLogsToggle) systemLogsToggle.checked = settings.system.systemLogs || false;
        if (debugModeToggle) debugModeToggle.checked = settings.system.debugMode || false;
        
        console.log('✅ 일반 설정 로드 완료');
    } catch (error) {
        console.error('❌ 일반 설정 로드 실패:', error);
    }
}

// 배송 설정 로드
export function loadShippingSettings() {
    try {
        console.log('🚚 배송 설정 로드');
        
        const settings = window.settingsDataManager.getAllSettings();
        
        const defaultShippingFeeInput = document.getElementById('default-shipping-fee');
        const freeShippingThresholdInput = document.getElementById('free-shipping-threshold');
        
        if (defaultShippingFeeInput) defaultShippingFeeInput.value = settings.shipping.defaultShippingFee || 3000;
        if (freeShippingThresholdInput) freeShippingThresholdInput.value = settings.shipping.freeShippingThreshold || 50000;

        // 배송 방법 목록
        const methodsInput = document.getElementById('shipping-methods-input');
        if (methodsInput) {
            const methods = settings.shipping.shippingMethods;
            methodsInput.value = Array.isArray(methods) ? methods.join(', ') : '택배, 직접배송, 픽업';
        }

        console.log('✅ 배송 설정 로드 완료');
    } catch (error) {
        console.error('❌ 배송 설정 로드 실패:', error);
    }
}


// 고객 등급 관리
export async function loadCustomerGrades() {
    try {
        console.log('👑 고객 등급 관리 로드');
        
        // Supabase에서 최신 데이터 강제 재로드
        await window.forceReloadSettings();
        
        const settings = window.settingsDataManager.getAllSettings();
        console.log('📋 설정 데이터:', settings);
        console.log('📋 고객등급 데이터:', settings.customerGrades);
        
        // 등급 적용 기간 설정 로드
        const gradePeriodSelect = document.getElementById('grade-period-select');
        if (gradePeriodSelect && settings.gradePeriod) {
            gradePeriodSelect.value = settings.gradePeriod;
            console.log('📅 등급 적용 기간 설정 로드:', settings.gradePeriod);
        }
        
        const container = document.getElementById('customer-grades-list');
        console.log('📦 컨테이너 요소:', container);
        
        if (!container) {
            console.error('❌ customer-grades-list 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        container.innerHTML = '';
        
        if (!settings.customerGrades || settings.customerGrades.length === 0) {
            console.warn('⚠️ 고객등급 데이터가 없습니다');
            container.innerHTML = '<div class="text-muted text-center py-4 text-xs">고객등급이 없습니다.</div>';
            return;
        }

        const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        settings.customerGrades.forEach((grade, index) => {
            const row = document.createElement('div');
            row.id = `grade-row-${index}`;
            row.className = 'flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-0';
            row.innerHTML = `
                <span class="flex-1 text-xs font-medium text-body">${_esc(grade.name)}</span>
                <span class="text-xs text-secondary w-36 text-right">${(grade.minAmount||0).toLocaleString()}원 이상</span>
                <span class="text-xs text-secondary w-10 text-right">${grade.discount||0}%</span>
                <button onclick="startEditGrade(${index})" class="p-1 text-muted hover:text-blue-500 rounded" title="수정"><i class="fas fa-pencil-alt text-xs"></i></button>
                <button onclick="deleteCustomerGrade(${index})" class="p-1 text-muted hover:text-red-500 rounded" title="삭제"><i class="fas fa-trash text-xs"></i></button>
            `;
            container.appendChild(row);
        });
        
        console.log('✅ 고객 등급 관리 로드 완료');
        
        // 전체 고객 등급 재계산 버튼 이벤트 리스너 등록 (여기서 등록!)
        setTimeout(() => {
            const recalculateBtn = document.getElementById('recalculate-all-grades-btn');
            console.log('🔍 고객등급 로드 후 재계산 버튼 찾기:', recalculateBtn);
            
            if (recalculateBtn && !recalculateBtn.dataset.listenerAdded) {
                console.log('✅ 재계산 버튼에 이벤트 리스너 등록');
                recalculateBtn.dataset.listenerAdded = 'true';
                
                recalculateBtn.addEventListener('click', async function() {
                    console.log('🔄 전체 고객 등급 재계산 버튼 클릭됨!');
                    
                    if (!confirm('⚠️ 모든 고객의 등급을 현재 설정된 기간 기준으로 재계산하시겠습니까?\n\n시간이 다소 걸릴 수 있습니다.')) {
                        console.log('❌ 사용자가 재계산을 취소했습니다');
                        return;
                    }
                    
                    try {
                        console.log('🔄 전체 고객 등급 재계산 시작...');
                        this.disabled = true;
                        this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>재계산 중...';
                        
                        if (!window.supabaseClient) {
                            throw new Error('Supabase 클라이언트를 찾을 수 없습니다');
                        }
                        
                        // 1. 모든 고객 조회
                        const { data: customers, error: customersError } = await window.supabaseClient
                            .from('farm_customers')
                            .select('id, phone');
                        
                        if (customersError) throw customersError;
                        
                        if (!customers || customers.length === 0) {
                            alert('재계산할 고객이 없습니다.');
                            return;
                        }
                        
                        console.log(`📊 총 ${customers.length}명의 고객 등급 재계산 시작...`);
                        
                        // 2. 각 고객의 등급 재계산
                        let successCount = 0;
                        let failCount = 0;
                        
                        for (const customer of customers) {
                            try {
                                let totalPurchaseAmount = 0;
                                const phone = (customer.phone || '').trim().replace(/[^0-9]/g, '');
                                if (phone) {
                                    const phoneWithDash = phone.length >= 10
                                        ? `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
                                        : phone;
                                    const { data: orders, error: ordersError } = await window.supabaseClient
                                        .from('farm_orders')
                                        .select('total_amount')
                                        .or(`customer_phone.eq.${phone},customer_phone.eq.${phoneWithDash}`);
                                    
                                    if (ordersError) {
                                        console.error(`❌ 고객 ${customer.id} 주문 조회 실패:`, ordersError);
                                        failCount++;
                                        continue;
                                    }
                                    totalPurchaseAmount = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
                                }
                                console.log(`💰 고객 ${customer.id} 총 구매금액:`, totalPurchaseAmount);
                                
                                if (window.updateCustomerGrade) {
                                    await window.updateCustomerGrade(customer.id, totalPurchaseAmount);
                                    successCount++;
                                } else {
                                    console.error('❌ updateCustomerGrade 함수를 찾을 수 없습니다');
                                    failCount++;
                                }
                            } catch (error) {
                                console.error(`❌ 고객 ${customer.id} 등급 재계산 실패:`, error);
                                failCount++;
                            }
                        }
                        
                        console.log(`✅ 전체 고객 등급 재계산 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
                        alert(`✅ 전체 고객 등급 재계산이 완료되었습니다!\n\n성공: ${successCount}명\n실패: ${failCount}명`);
                        
                        // 고객 목록 새로고침
                        if (window.renderCustomersTable) {
                            window.renderCustomersTable('all');
                        }
                        
                    } catch (error) {
                        console.error('❌ 전체 고객 등급 재계산 실패:', error);
                        alert('전체 고객 등급 재계산에 실패했습니다.');
                    } finally {
                        this.disabled = false;
                        this.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>전체 고객 등급 재계산';
                    }
                });
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ 고객 등급 관리 로드 실패:', error);
    }
}

// 판매 채널 관리 — farm_channels 테이블 기준 단일 소스
export async function loadSalesChannels() {
    const container = document.getElementById('channels-list');
    if (!container) {
        console.error('❌ channels-list 컨테이너를 찾을 수 없습니다');
        return;
    }
    try {
        console.log('🏪 판매 채널 관리 로드 (farm_channels)');
        if (!window.salesChannelsDataManager) {
            container.innerHTML = '<div class="text-muted text-center py-4">판매채널 모듈을 불러올 수 없습니다.</div>';
            return;
        }
        const channels = await window.salesChannelsDataManager.loadChannels();
        container.innerHTML = '';
        if (!channels || channels.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-4">판매채널이 없습니다.</div>';
            console.log('✅ 판매 채널 관리 로드 완료 (0개)');
            return;
        }
        const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        channels.forEach((channel, index) => {
            const isActive = channel.is_active !== false;
            const channelElement = document.createElement('div');
            channelElement.className = 'flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-0';
            channelElement.innerHTML = `
                <div class="w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="text-xs font-medium text-body flex-1">${esc2(channel.name||'')}</span>
                <span class="text-xs text-muted">${esc2(channel.description||'')}</span>
                <button onclick="toggleSalesChannelByIndex(${index})" class="p-1 text-muted hover:text-blue-500 rounded" title="${isActive?'비활성화':'활성화'}"><i class="fas fa-${isActive?'pause':'play'} text-xs"></i></button>
                <button onclick="editSalesChannelByIndex(${index})" class="p-1 text-muted hover:text-blue-500 rounded" title="편집"><i class="fas fa-pencil-alt text-xs"></i></button>
                <button onclick="deleteSalesChannelByIndex(${index})" class="p-1 text-muted hover:text-red-500 rounded" title="삭제"><i class="fas fa-trash text-xs"></i></button>
            `;
            container.appendChild(channelElement);
        });
        console.log('✅ 판매 채널 관리 로드 완료:', channels.length, '개');
    } catch (error) {
        console.error('❌ 판매 채널 관리 로드 실패:', error);
        container.innerHTML = '<div class="text-danger text-center py-4">채널 목록을 불러오지 못했습니다.</div>';
    }

    // 채널 추가 버튼 리스너 (1회만 등록)
    const addChannelBtn = document.getElementById('add-channel-btn');
    if (addChannelBtn && !addChannelBtn._channelBtnBound) {
        addChannelBtn._channelBtnBound = true;
        addChannelBtn.addEventListener('click', async function() {
            const name = prompt('채널명을 입력하세요:');
            if (!name || !name.trim()) return;
            try {
                if (!window.addSalesChannel) {
                    alert('판매채널 모듈을 불러올 수 없습니다.');
                    return;
                }
                await window.addSalesChannel({
                    name: name.trim(),
                    icon: 'store',
                    color: 'green',
                    description: '',
                    sort_order: (window.salesChannelsDataManager?.channels?.length || 0),
                    is_active: true
                });
                await loadSalesChannels();
                console.log('✅ 판매채널 추가 완료:', name.trim());
            } catch (error) {
                console.error('❌ 판매채널 추가 실패:', error);
                alert('채널 추가에 실패했습니다: ' + (error.message || error));
            }
        });
    }
}

// 주문 상태 관리
export function loadOrderStatuses() {
    try {
        console.log('📋 주문 상태 관리 로드');
        
        const settings = window.settingsDataManager.getAllSettings();
        const container = document.getElementById('order-statuses-list');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        settings.orderStatuses.forEach((status, index) => {
            const statusElement = document.createElement('div');
            statusElement.className = 'flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-0';
            statusElement.innerHTML = `
                <div class="w-2 h-2 rounded-full shrink-0" style="background-color:${status.color||'#6B7280'}"></div>
                <span class="text-xs font-medium text-body w-20 shrink-0">${status.label||''}</span>
                <span class="text-xs text-muted flex-1">${status.description||''}</span>
                <button onclick="editOrderStatus(${index})" class="p-1 text-muted hover:text-blue-500 rounded" title="수정"><i class="fas fa-pencil-alt text-xs"></i></button>
                <button onclick="deleteOrderStatus(${index})" class="p-1 text-muted hover:text-red-500 rounded" title="삭제"><i class="fas fa-trash text-xs"></i></button>
            `;
            container.appendChild(statusElement);
        });
        
        console.log('✅ 주문 상태 관리 로드 완료');
    } catch (error) {
        console.error('❌ 주문 상태 관리 로드 실패:', error);
    }
}

// 설정 저장
export function saveSettings() {
    try {
        console.log('💾 설정 저장');
        
        // 일반 설정 저장
        const farmName = document.getElementById('farm-name')?.value || '';
        const farmOwner = document.getElementById('farm-owner')?.value || '';
        const farmPhone = document.getElementById('farm-phone')?.value || '';
        const farmAddress = document.getElementById('farm-address')?.value || '';
        
        window.settingsDataManager.updateSetting('farm', 'name', farmName);
        window.settingsDataManager.updateSetting('farm', 'owner', farmOwner);
        window.settingsDataManager.updateSetting('farm', 'phone', farmPhone);
        window.settingsDataManager.updateSetting('farm', 'address', farmAddress);
        
        // 시스템 설정 저장
        const autoBackup = document.getElementById('auto-backup')?.checked || false;
        const systemLogs = document.getElementById('system-logs')?.checked || false;
        const debugMode = document.getElementById('debug-mode')?.checked || false;
        
        window.settingsDataManager.updateSetting('system', 'autoBackup', autoBackup);
        window.settingsDataManager.updateSetting('system', 'systemLogs', systemLogs);
        window.settingsDataManager.updateSetting('system', 'debugMode', debugMode);
        
        // 배송 설정 저장
        const defaultShippingFee = parseInt(document.getElementById('default-shipping-fee')?.value) || 3000;
        const freeShippingThreshold = parseInt(document.getElementById('free-shipping-threshold')?.value) || 50000;
        
        window.settingsDataManager.updateSetting('shipping', 'defaultShippingFee', defaultShippingFee);
        window.settingsDataManager.updateSetting('shipping', 'freeShippingThreshold', freeShippingThreshold);
        
        console.log('✅ 설정 저장 완료');
        return true;
    } catch (error) {
        console.error('❌ 설정 저장 실패:', error);
        return false;
    }
}

// 환경설정 이벤트 리스너 설정
function initSettingsEventListeners() {
    try {
        console.log('⚙️ 환경설정 이벤트 리스너 설정...');
        
        // 탭 전환 이벤트
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.id.replace('settings-tab-', '');
                showSettingsTab(tabName);
            });
        });
        
        // 모든 설정 저장 버튼
        const saveAllBtn = document.getElementById('save-all-settings-btn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', function() {
                saveSettings();
                alert('✅ 모든 설정이 저장되었습니다.');
            });
        }
        
        // 설정 초기화 버튼
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('⚠️ 모든 설정을 초기화하시겠습니까?')) {
                    window.settingsDataManager.resetSettings();
                    alert('✅ 설정이 초기화되었습니다.');
                    location.reload();
                }
            });
        }
        
        // 채널 추가 버튼 — farm_channels 테이블에 추가
        const addChannelBtn = document.getElementById('add-channel-btn');
        if (addChannelBtn) {
            addChannelBtn.addEventListener('click', async function() {
                const name = prompt('채널명을 입력하세요:');
                if (name && name.trim()) {
                    try {
                        if (!window.addSalesChannel) {
                            alert('판매채널 모듈을 불러올 수 없습니다.');
                            return;
                        }
                        await window.addSalesChannel({
                            name: name.trim(),
                            icon: 'store',
                            color: 'green',
                            description: '',
                            sort_order: (window.salesChannelsDataManager?.channels?.length || 0),
                            is_active: true
                        });
                        await loadSalesChannels();
                        console.log('✅ 판매채널 추가 완료:', name);
                    } catch (error) {
                        console.error('❌ 판매채널 추가 실패:', error);
                        alert('채널 추가에 실패했습니다.');
                    }
                }
            });
        }
        
        // 등급 적용 기간 저장 버튼
        const saveGradePeriodBtn = document.getElementById('save-grade-period-btn');
        if (saveGradePeriodBtn) {
            saveGradePeriodBtn.addEventListener('click', async function() {
                const gradePeriodSelect = document.getElementById('grade-period-select');
                if (!gradePeriodSelect) {
                    alert('❌ 등급 적용 기간 설정을 찾을 수 없습니다.');
                    return;
                }
                
                try {
                    const period = gradePeriodSelect.value;
                    console.log('📅 등급 적용 기간 저장:', period);
                    
                    // Supabase에 저장
                    if (!window.supabaseClient) {
                        throw new Error('Supabase 클라이언트를 찾을 수 없습니다');
                    }
                    
                    const { data, error } = await window.supabaseClient
                        .from('farm_settings')
                        .select('settings')
                        .eq('id', 1)
                        .single();
                    
                    if (error) throw error;
                    
                    const updatedSettings = {
                        ...data.settings,
                        gradePeriod: period
                    };
                    
                    const { error: updateError } = await window.supabaseClient
                        .from('farm_settings')
                        .update({ settings: updatedSettings })
                        .eq('id', 1);
                    
                    if (updateError) throw updateError;
                    
                    // 로컬 설정도 업데이트
                    await window.forceReloadSettings();
                    
                    alert('✅ 등급 적용 기간이 저장되었습니다.');
                    console.log('✅ 등급 적용 기간 저장 완료:', period);
                } catch (error) {
                    console.error('❌ 등급 적용 기간 저장 실패:', error);
                    alert('등급 적용 기간 저장에 실패했습니다.');
                }
            });
        }
        
        // 전체 고객 등급 재계산 버튼
        const recalculateAllGradesBtn = document.getElementById('recalculate-all-grades-btn');
        console.log('🔍 전체 고객 등급 재계산 버튼 찾기:', recalculateAllGradesBtn);
        if (recalculateAllGradesBtn) {
            console.log('✅ 전체 고객 등급 재계산 버튼 이벤트 리스너 등록');
            recalculateAllGradesBtn.addEventListener('click', async function() {
                console.log('🔄 전체 고객 등급 재계산 버튼 클릭됨!');
                if (!confirm('⚠️ 모든 고객의 등급을 현재 설정된 기간 기준으로 재계산하시겠습니까?\n\n시간이 다소 걸릴 수 있습니다.')) {
                    console.log('❌ 사용자가 재계산을 취소했습니다');
                    return;
                }
                
                try {
                    console.log('🔄 전체 고객 등급 재계산 시작...');
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>재계산 중...';
                    
                    if (!window.supabaseClient) {
                        throw new Error('Supabase 클라이언트를 찾을 수 없습니다');
                    }
                    
                    // 1. 모든 고객 조회
                    const { data: customers, error: customersError } = await window.supabaseClient
                        .from('farm_customers')
                        .select('id, phone');
                    
                    if (customersError) throw customersError;
                    
                    if (!customers || customers.length === 0) {
                        alert('재계산할 고객이 없습니다.');
                        return;
                    }
                    
                    console.log(`📊 총 ${customers.length}명의 고객 등급 재계산 시작...`);
                    
                    let successCount = 0;
                    let failCount = 0;
                    
                    for (const customer of customers) {
                        try {
                            let totalPurchaseAmount = 0;
                            const phone = (customer.phone || '').trim().replace(/[^0-9]/g, '');
                            if (phone) {
                                const phoneWithDash = phone.length >= 10
                                    ? `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
                                    : phone;
                                const { data: orders, error: ordersError } = await window.supabaseClient
                                    .from('farm_orders')
                                    .select('total_amount')
                                    .or(`customer_phone.eq.${phone},customer_phone.eq.${phoneWithDash}`);
                                if (!ordersError && orders) {
                                    totalPurchaseAmount = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
                                }
                            }
                            if (window.updateCustomerGrade) {
                                await window.updateCustomerGrade(customer.id, totalPurchaseAmount);
                                successCount++;
                            } else {
                                console.error('❌ updateCustomerGrade 함수를 찾을 수 없습니다');
                                failCount++;
                            }
                        } catch (error) {
                            console.error(`❌ 고객 ${customer.id} 등급 재계산 실패:`, error);
                            failCount++;
                        }
                    }
                    
                    console.log(`✅ 전체 고객 등급 재계산 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
                    alert(`✅ 전체 고객 등급 재계산이 완료되었습니다!\n\n성공: ${successCount}명\n실패: ${failCount}명`);
                    
                    // 고객 목록 새로고침
                    if (window.renderCustomersTable) {
                        window.renderCustomersTable('all');
                    }
                    
                } catch (error) {
                    console.error('❌ 전체 고객 등급 재계산 실패:', error);
                    alert('전체 고객 등급 재계산에 실패했습니다.');
                } finally {
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>전체 고객 등급 재계산';
                }
            });
        }
        
        // 주문 상태 추가 버튼
        const addOrderStatusBtn = document.getElementById('add-order-status-btn');
        if (addOrderStatusBtn) {
            addOrderStatusBtn.addEventListener('click', function() {
                const label = prompt('상태명을 입력하세요:');
                if (label) {
                    window.settingsDataManager.addOrderStatus({
                        value: label,
                        label: label,
                        color: '#6B7280',
                        description: '새로 추가된 상태'
                    });
                    loadOrderStatuses();
                }
            });
        }
        
        // 고객등급 추가 버튼
        const addCustomerGradeBtn = document.getElementById('add-customer-grade-btn');
        if (addCustomerGradeBtn) {
            addCustomerGradeBtn.addEventListener('click', async function() {
                const name = prompt('등급명을 입력하세요:');
                if (name && name.trim() !== '') {
                    try {
                        await window.settingsDataManager.addCustomerGrade({
                            name: name.trim(),
                            code: name.trim().toUpperCase().replace(/\s+/g, '_'),
                            minAmount: 0,
                            discount: 0,
                            color: '#6B7280',
                            icon: 'fas fa-circle'
                        });
                        
                        // 화면 새로고침
                        setTimeout(() => {
                            loadCustomerGrades();
                            console.log('✅ 고객등급 추가 후 화면 새로고침 완료');
                        }, 100);
                        
                        console.log('✅ 고객등급 추가 완료:', name);
                    } catch (error) {
                        console.error('❌ 고객등급 추가 실패:', error);
                        alert('등급 추가에 실패했습니다.');
                    }
                }
            });
        }
        
        // 일반 설정 저장 버튼
        const saveGeneralBtn = document.getElementById('save-general-settings');
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', async function() {
                console.log('🔄 일반 설정 저장');
                const farmName = document.getElementById('farm-name')?.value || '';
                const farmOwner = document.getElementById('farm-owner')?.value || '';
                const farmPhone = document.getElementById('farm-phone')?.value || '';
                const farmAddress = document.getElementById('farm-address')?.value || '';
                
                try {
                    await window.settingsDataManager.updateSetting('farm', 'name', farmName);
                    await window.settingsDataManager.updateSetting('farm', 'owner', farmOwner);
                    await window.settingsDataManager.updateSetting('farm', 'phone', farmPhone);
                    await window.settingsDataManager.updateSetting('farm', 'address', farmAddress);
                    
                    alert('✅ 일반 설정이 Supabase에 저장되었습니다.');
                } catch (error) {
                    console.error('❌ 일반 설정 저장 실패:', error);
                    alert(`❌ 설정 저장에 실패했습니다.\n\n${error.message}`);
                }
            });
        }
        
        // 일반 설정 취소 버튼
        const cancelGeneralBtn = document.getElementById('cancel-general-settings');
        if (cancelGeneralBtn) {
            cancelGeneralBtn.addEventListener('click', function() {
                console.log('🔄 일반 설정 취소');
                loadGeneralSettings();
                alert('❌ 변경사항이 취소되었습니다.');
            });
        }
        
        // 배송 설정 저장 버튼
        const saveShippingBtn = document.getElementById('save-shipping-settings');
        if (saveShippingBtn) {
            saveShippingBtn.addEventListener('click', async function() {
                console.log('🔄 배송 설정 저장');
                const defaultShippingFee = parseInt(document.getElementById('default-shipping-fee')?.value) || 3000;
                const freeShippingThreshold = parseInt(document.getElementById('free-shipping-threshold')?.value) || 50000;
                const expressShippingFee = parseInt(document.getElementById('express-shipping-fee')?.value) || 5000;
                
                try {
                    await window.settingsDataManager.updateSetting('shipping', 'defaultShippingFee', defaultShippingFee);
                    await window.settingsDataManager.updateSetting('shipping', 'freeShippingThreshold', freeShippingThreshold);
                    await window.settingsDataManager.updateSetting('shipping', 'expressShippingFee', expressShippingFee);
                    
                    alert('✅ 배송 설정이 Supabase에 저장되었습니다.');
                } catch (error) {
                    console.error('❌ 배송 설정 저장 실패:', error);
                    alert(`❌ 설정 저장에 실패했습니다.\n\n${error.message}`);
                }
            });
        }
        
        // 배송 설정 취소 버튼
        const cancelShippingBtn = document.getElementById('cancel-shipping-settings');
        if (cancelShippingBtn) {
            cancelShippingBtn.addEventListener('click', function() {
                console.log('🔄 배송 설정 취소');
                loadShippingSettings();
                alert('❌ 변경사항이 취소되었습니다.');
            });
        }
        
        console.log('✅ 환경설정 이벤트 리스너 설정 완료');
    } catch (error) {
        console.error('❌ 환경설정 이벤트 리스너 설정 실패:', error);
    }
}

// 전역 함수들 등록
window.showSettingsTab = showSettingsTab;
window.loadGeneralSettings = loadGeneralSettings;
window.loadShippingSettings = loadShippingSettings;
window.loadCustomerGrades = loadCustomerGrades;
window.loadSalesChannels = loadSalesChannels;
window.loadOrderStatuses = loadOrderStatuses;
window.saveSettings = saveSettings;
window.initSettingsEventListeners = initSettingsEventListeners;

// 판매채널 관련 전역 함수 — farm_channels 기준 (index → id 변환 후 CRUD)
window.toggleSalesChannelByIndex = async function(index) {
    try {
        const mgr = window.salesChannelsDataManager;
        if (!mgr || !mgr.channels || !mgr.channels[index]) {
            alert('토글할 채널을 찾을 수 없습니다.');
            return;
        }
        const ch = mgr.channels[index];
        await window.updateSalesChannel(ch.id, { is_active: !ch.is_active });
        await loadSalesChannels();
    } catch (error) {
        console.error('❌ 판매채널 토글 실패:', error);
        alert('채널 상태 변경에 실패했습니다.');
    }
};

window.editSalesChannelByIndex = async function(index) {
    try {
        const mgr = window.salesChannelsDataManager;
        if (!mgr || !mgr.channels || !mgr.channels[index]) {
            alert('편집할 채널을 찾을 수 없습니다.');
            return;
        }
        const ch = mgr.channels[index];
        const newName = prompt('새 채널명을 입력하세요:', ch.name);
        if (newName && newName.trim() !== '') {
            await window.updateSalesChannel(ch.id, { name: newName.trim() });
            await loadSalesChannels();
        }
    } catch (error) {
        console.error('❌ 판매채널 편집 실패:', error);
        alert('채널 편집에 실패했습니다.');
    }
};

window.deleteSalesChannelByIndex = async function(index) {
    try {
        const mgr = window.salesChannelsDataManager;
        if (!mgr || !mgr.channels || !mgr.channels[index]) {
            alert('삭제할 채널을 찾을 수 없습니다.');
            return;
        }
        if (!confirm('정말로 이 채널을 삭제하시겠습니까?')) return;
        await window.deleteSalesChannel(mgr.channels[index].id);
        await loadSalesChannels();
    } catch (error) {
        console.error('❌ 판매채널 삭제 실패:', error);
        alert('채널 삭제에 실패했습니다.');
    }
};

// 고객등급 관련 전역 함수들
window.editCustomerGrade = async function(index) {
    console.log('🔄 고객등급 편집:', index);
    
    try {
        const settings = window.settingsDataManager.getAllSettings();
        const currentGrade = settings.customerGrades[index];
        
        if (!currentGrade) {
            alert('편집할 등급을 찾을 수 없습니다.');
            return;
        }
        
        // 상세 편집 폼 생성
        const editForm = document.createElement('div');
        editForm.id = 'edit-grade-modal';
        editForm.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        editForm.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-heading">고객등급 편집</h3>
                        <button onclick="closeEditGradeModal()" class="text-muted hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">등급명</label>
                            <input type="text" id="edit-grade-name" value="${currentGrade.name}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">최소 구매금액 (원)</label>
                            <input type="number" id="edit-grade-min-amount" value="${currentGrade.minAmount}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">할인율 (%)</label>
                            <input type="number" id="edit-grade-discount" value="${currentGrade.discount}" min="0" max="100"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">색상</label>
                            <input type="color" id="edit-grade-color" value="${currentGrade.color}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">아이콘</label>
                            <select id="edit-grade-icon" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="fas fa-circle" ${currentGrade.icon === 'fas fa-circle' ? 'selected' : ''}>원형</option>
                                <option value="fas fa-hexagon" ${currentGrade.icon === 'fas fa-hexagon' ? 'selected' : ''}>육각형</option>
                                <option value="fas fa-octagon" ${currentGrade.icon === 'fas fa-octagon' ? 'selected' : ''}>팔각형</option>
                                <option value="fas fa-pentagon" ${currentGrade.icon === 'fas fa-pentagon' ? 'selected' : ''}>오각형</option>
                                <option value="fas fa-square" ${currentGrade.icon === 'fas fa-square' ? 'selected' : ''}>사각형</option>
                                <option value="fas fa-star" ${currentGrade.icon === 'fas fa-star' ? 'selected' : ''}>별</option>
                                <option value="fas fa-diamond" ${currentGrade.icon === 'fas fa-diamond' ? 'selected' : ''}>다이아몬드</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button onclick="closeEditGradeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                            취소
                        </button>
                        <button onclick="saveEditGrade(${index})" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            저장
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(editForm);
        
    } catch (error) {
        console.error('❌ 고객등급 편집 실패:', error);
        alert('등급 편집에 실패했습니다.');
    }
};

// 인라인 저장
window.saveInlineGrade = async function(index) {
    try {
        const name = document.getElementById(`grade-name-${index}`)?.value.trim();
        const minAmount = parseInt(document.getElementById(`grade-minamount-${index}`)?.value) || 0;
        const discount = parseInt(document.getElementById(`grade-discount-${index}`)?.value) || 0;

        if (!name) { alert('등급명을 입력해주세요.'); return; }
        if (discount < 0 || discount > 100) { alert('할인율은 0-100% 사이로 입력해주세요.'); return; }

        const settings = window.settingsDataManager.getAllSettings();
        const existing = settings.customerGrades[index];
        await window.settingsDataManager.updateCustomerGrade(index, {
            ...existing,
            name,
            minAmount,
            discount
        });
        setTimeout(() => { loadCustomerGrades(); }, 100);
    } catch (error) {
        console.error('❌ 고객등급 저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
};

// 편집 모달 닫기
window.closeEditGradeModal = function() {
    const modal = document.getElementById('edit-grade-modal');
    if (modal) {
        modal.remove();
        console.log('✅ 편집 모달 닫기 완료');
    } else {
        console.warn('⚠️ 편집 모달을 찾을 수 없습니다');
    }
};

// 편집 저장
window.saveEditGrade = async function(index) {
    try {
        const name = document.getElementById('edit-grade-name').value.trim();
        const minAmount = parseInt(document.getElementById('edit-grade-min-amount').value) || 0;
        const discount = parseInt(document.getElementById('edit-grade-discount').value) || 0;
        const color = document.getElementById('edit-grade-color').value;
        const icon = document.getElementById('edit-grade-icon').value;
        
        if (!name) {
            alert('등급명을 입력해주세요.');
            return;
        }
        
        if (discount < 0 || discount > 100) {
            alert('할인율은 0-100% 사이로 입력해주세요.');
            return;
        }
        
        // 고객등급 업데이트
        const updatedGrade = {
            name: name,
            code: window.settingsDataManager.getAllSettings().customerGrades[index].code, // 코드는 유지
            minAmount: minAmount,
            discount: discount,
            color: color,
            icon: icon
        };
        
        await window.settingsDataManager.updateCustomerGrade(index, updatedGrade);
        
        console.log('✅ 고객등급 편집 완료:', updatedGrade);
        
        // 모달 닫기
        closeEditGradeModal();
        
        // 화면 새로고침
        setTimeout(() => {
            loadCustomerGrades();
            console.log('✅ 고객등급 편집 후 화면 새로고침 완료');
            alert('고객등급이 성공적으로 수정되었습니다.');
        }, 100);
        
    } catch (error) {
        console.error('❌ 고객등급 편집 실패:', error);
        alert('등급 편집에 실패했습니다.');
    }
};

window.deleteCustomerGrade = async function(index) {
    console.log('🔄 고객등급 삭제:', index);

    try {
        if (confirm('정말로 이 등급을 삭제하시겠습니까?')) {
            // 고객등급 삭제
            await window.settingsDataManager.deleteCustomerGrade(index);

            // 화면 새로고침
            setTimeout(() => {
                loadCustomerGrades();
                console.log('✅ 고객등급 삭제 후 화면 새로고침 완료');
            }, 100);

            console.log('✅ 고객등급 삭제 완료');
        }
    } catch (error) {
        console.error('❌ 고객등급 삭제 실패:', error);
        alert('등급 삭제에 실패했습니다.');
    }
};

// 고객등급 인라인 편집 시작
window.startEditGrade = function(index) {
    const row = document.getElementById(`grade-row-${index}`);
    if (!row) return;
    const settings = window.settingsDataManager.getAllSettings();
    const g = settings.customerGrades[index];
    if (!g) return;
    const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    row.innerHTML = `
        <input type="text" id="grade-name-${index}" value="${_esc(g.name)}" class="input-ui flex-1 text-xs" placeholder="등급명">
        <input type="number" id="grade-minamount-${index}" value="${g.minAmount||0}" class="input-ui w-28 text-xs text-right" min="0">
        <span class="text-xs text-muted shrink-0">원 이상</span>
        <input type="number" id="grade-discount-${index}" value="${g.discount||0}" class="input-ui w-14 text-xs text-right" min="0" max="100">
        <span class="text-xs text-muted shrink-0">%</span>
        <button onclick="saveInlineGrade(${index})" class="btn-primary btn-xs shrink-0">저장</button>
        <button onclick="cancelEditGrade(${index})" class="btn-secondary btn-xs shrink-0">취소</button>
    `;
    row.querySelector(`#grade-name-${index}`)?.focus();
};

// 고객등급 인라인 편집 취소
window.cancelEditGrade = function(index) {
    loadCustomerGrades();
};

// SMS 템플릿 펼침/접힘 토글
window.toggleSmsTemplate = function(key) {
    const detail = document.getElementById(`sms-detail-${key}`);
    const chevron = document.getElementById(`sms-chevron-${key}`);
    if (!detail) return;
    const isHidden = detail.classList.contains('hidden');
    detail.classList.toggle('hidden', !isHidden);
    if (chevron) {
        chevron.classList.toggle('fa-chevron-down', !isHidden);
        chevron.classList.toggle('fa-chevron-up', isHidden);
    }
};

// SMS 단일 템플릿 저장
window.saveSingleSmsTemplate = async function(key, fieldId) {
    try {
        const value = document.getElementById(fieldId)?.value || '';
        if (window.settingsDataManager) {
            await window.settingsDataManager.updateSetting('smsTemplates', key, value);
            const item = document.getElementById(`sms-item-${key}`);
            if (item) {
                const previewEl = item.querySelector('.sms-preview');
                if (previewEl) {
                    const preview = value ? value.split('\n')[0].slice(0, 50) + (value.length > 50 ? '…' : '') : '(미설정)';
                    previewEl.textContent = preview;
                }
            }
        }
    } catch (error) {
        console.error('❌ SMS 템플릿 저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
};
