// 환경설정 UI 관리
// features/settings/settingsUI.js

import { ensureSupabase } from '../../utils/formatters.js';

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
                    loadSmsApiConfig();
                    break;
                case 'kakao':
                    loadKakaoSettings();
                    break;
            }
        } else {
            console.warn('⚠️ 환경설정 탭을 찾을 수 없습니다:', tabName);
        }
    } catch (error) {
        console.error('❌ 환경설정 탭 표시 실패:', error);
    }
}

// SMS 설정 로드 (v3.3.139+: 용도별 카드 그리드)
async function loadSMSSettings() {
    try {
        const settings = window.settingsDataManager?.getAllSettings();
        const smsSettings = settings?.smsTemplates || {};

        const container = document.getElementById('sms-templates-list');
        if (!container) return;
        container.innerHTML = '';

        const templates = [
            { key: 'orderConfirm',     label: '주문확인',   icon: 'fa-cart-shopping',  variant: 'info',
              desc: '주문 접수 직후 고객에게 발송',
              vars: ['{customerName}','{orderNumber}','{orderDetails}','{totalAmount}','{shippingFee}','{paymentInfo}'],
              fieldId: 'sms-order-confirm' },
            { key: 'paymentConfirm',   label: '입금확인',   icon: 'fa-check-circle',   variant: 'success',
              desc: '입금 확인 후 주문 확정 알림',
              vars: ['{customerName}','{orderNumber}'],
              fieldId: 'sms-payment-confirm' },
            { key: 'shippingStart',    label: '배송시작',   icon: 'fa-truck',          variant: 'warn',
              desc: '송장 입력·출고 시 발송',
              vars: ['{customerName}','{orderNumber}','{shippingCompany}','{trackingNumber}'],
              fieldId: 'sms-shipping-start' },
            { key: 'shippingComplete', label: '배송완료',   icon: 'fa-check-double',   variant: 'success',
              desc: '배송 완료 확인 알림',
              vars: ['{customerName}','{orderNumber}'],
              fieldId: 'sms-shipping-complete' },
            { key: 'waitlistNotify',   label: '대기품목',   icon: 'fa-bell',           variant: 'purple',
              desc: '재입고·예약 상품 준비됨 알림',
              vars: ['{customerName}','{productName}','{quantity}'],
              fieldId: 'sms-waitlist-notify' },
        ];

        const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

        templates.forEach(tpl => {
            const value = smsSettings[tpl.key] || '';
            const isEmpty = !value.trim();
            const card = document.createElement('div');
            card.className = `sms-card sms-variant-${tpl.variant}`;
            card.id = `sms-item-${tpl.key}`;
            card.dataset.key = tpl.key;

            const varsHtml = tpl.vars.map(v => `<code>${esc(v)}</code>`).join('');
            const bubbleHtml = isEmpty
                ? `<div class="sms-phone-empty"><i class="fas fa-pen-to-square"></i> 빈 템플릿 — 클릭해서 작성</div>`
                : `<div class="sms-bubble">${esc(value)}</div>`;

            // 폰 메시지 말풍선 형태로 렌더 (받는 사람 관점: 왼쪽 정렬 회색 버블)
            card.innerHTML = `
                <div class="sms-card-tab">
                    <span class="sms-tab-icon"><i class="fas ${tpl.icon}"></i></span>
                    <span class="sms-tab-label">${esc(tpl.label)}</span>
                    <span class="sms-tab-desc">${esc(tpl.desc)}</span>
                    <button type="button" class="btn-icon btn-icon-edit sms-card-edit" title="수정"
                        onclick="event.stopPropagation(); editSmsTemplate('${tpl.key}','${tpl.fieldId}','${tpl.vars.join(' ').replace(/'/g,'\\\'')}')">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
                <div class="sms-phone-screen">
                    <div class="sms-phone-sender">경산다육식물농장</div>
                    ${bubbleHtml}
                </div>
                <div class="sms-card-vars">
                    <span class="sms-card-vars-label">치환</span>
                    ${varsHtml}
                </div>
            `;

            // 카드 전체 클릭으로 편집 모달 (✎ 외 영역)
            card.addEventListener('click', (e) => {
                if (e.target.closest('.sms-card-edit')) return;
                if (typeof window.editSmsTemplate === 'function') {
                    window.editSmsTemplate(tpl.key, tpl.fieldId, tpl.vars.join(' '));
                }
            });

            container.appendChild(card);
        });

        console.log('✅ SMS 설정 로드 완료 (카드 그리드)');
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

        // 추가 필드 (v3.3.97)
        const el = (id) => document.getElementById(id);
        if (el('farm-email')) el('farm-email').value = settings.farm.email || '';
        if (el('farm-business-number')) el('farm-business-number').value = settings.farm.businessNumber || '';
        if (el('farm-bank-name')) el('farm-bank-name').value = settings.farm.bankName || '';
        if (el('farm-bank-account')) el('farm-bank-account').value = settings.farm.bankAccount || '';
        if (el('farm-bank-holder')) el('farm-bank-holder').value = settings.farm.bankHolder || '';

        // 사이드바 표시명/설명
        if (el('farm-sidebar-title')) el('farm-sidebar-title').value = settings.farm.sidebarTitle || '';
        if (el('farm-sidebar-subtitle')) el('farm-sidebar-subtitle').value = settings.farm.sidebarSubtitle || '';

        // 로고
        const logoUrl = settings.farm.logoUrl || '';
        if (el('farm-logo-url')) el('farm-logo-url').value = logoUrl;
        const logoImg = el('farm-logo-img');
        const logoPlaceholder = el('farm-logo-placeholder');
        const logoRemoveBtn = el('farm-logo-remove');
        if (logoUrl && logoImg) {
            logoImg.src = logoUrl; logoImg.classList.remove('hidden');
            if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
            if (logoRemoveBtn) logoRemoveBtn.classList.remove('hidden');
        }

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
        const remoteAreaShippingFeeInput = document.getElementById('remote-area-shipping-fee');

        if (defaultShippingFeeInput) defaultShippingFeeInput.value = settings.shipping.defaultShippingFee || 3000;
        if (freeShippingThresholdInput) freeShippingThresholdInput.value = settings.shipping.freeShippingThreshold || 50000;
        if (remoteAreaShippingFeeInput) remoteAreaShippingFeeInput.value = settings.shipping.remoteAreaShippingFee ?? 5000;

        // 로젠택배 설정
        const logenFeeInput = document.getElementById('logen-shipping-fee');
        const logenFreightSelect = document.getElementById('logen-freight-type');
        if (logenFeeInput) logenFeeInput.value = settings.shipping.logenShippingFee ?? 3800;
        if (logenFreightSelect) logenFreightSelect.value = String(settings.shipping.logenFreightType ?? 10);

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
        
        // ID 충돌 방지: customer-management.html 의 customer-grades-list 와 구분하기 위해
        // settings 전용 ID 'settings-customer-grades-list' 를 우선 사용하고,
        // 구형 환경(ID 변경 전 HTML 캐시 등)을 위한 폴백으로 'customer-grades-list' 도 시도
        const container = document.getElementById('settings-customer-grades-list')
                       || document.getElementById('customer-grades-list');
        console.log('📦 컨테이너 요소:', container);
        
        if (!container) {
            console.error('❌ customer-grades-list 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        container.innerHTML = '';

        if (!settings.customerGrades || settings.customerGrades.length === 0) {
            console.warn('⚠️ 고객등급 데이터가 없습니다');
            container.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4 text-xs">고객등급이 없습니다.</td></tr>';
            return;
        }

        const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        settings.customerGrades.forEach((grade, index) => {
            const color = grade.color || '#6B7280';
            const amountStr = window.fmt?.currency(grade.minAmount||0) || (grade.minAmount||0).toLocaleString() + '원';
            const row = document.createElement('tr');
            row.id = `grade-row-${index}`;
            row.innerHTML = `
                <td class="text-center"><span class="w-2 h-2 rounded-full inline-block" style="background:${color};"></span></td>
                <td class="td-primary font-semibold">${_esc(grade.name)}</td>
                <td class="td-amount text-right">${amountStr} 이상</td>
                <td class="td-num text-right">${grade.discount||0}%</td>
                <td class="whitespace-nowrap text-right">
                    <button onclick="startEditGrade(${index})" class="btn-icon btn-icon-edit" title="수정"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteCustomerGrade(${index})" class="btn-icon btn-icon-delete" title="삭제"><i class="fas fa-trash"></i></button>
                </td>
            `;
            container.appendChild(row);
        });
        
        console.log('✅ 고객 등급 관리 로드 완료');

        // "등급 추가" 버튼 리스너: initSettingsEventListeners() 가 never called 라서 여기서 1회 바인딩
        const addGradeBtn = document.getElementById('add-customer-grade-btn');
        if (addGradeBtn && !addGradeBtn.dataset.listenerAdded) {
            addGradeBtn.dataset.listenerAdded = 'true';
            addGradeBtn.addEventListener('click', async function () {
                const name = prompt('등급명을 입력하세요:');
                if (!name || !name.trim()) return;
                try {
                    await window.settingsDataManager.addCustomerGrade({
                        name: name.trim(),
                        code: name.trim().toUpperCase().replace(/\s+/g, '_'),
                        minAmount: 0,
                        discount: 0,
                        color: '#6B7280',
                        icon: 'fas fa-circle'
                    });
                    if (window.invalidateCustomerUICache) window.invalidateCustomerUICache();
                    setTimeout(() => loadCustomerGrades(), 100);
                } catch (error) {
                    console.error('❌ 고객등급 추가 실패:', error);
                    alert('등급 추가에 실패했습니다: ' + (error.message || error));
                }
            });
        }

        // "등급 적용 기간 저장" 버튼 리스너
        const saveGradePeriodBtn = document.getElementById('save-grade-period-btn');
        if (saveGradePeriodBtn && !saveGradePeriodBtn.dataset.listenerAdded) {
            saveGradePeriodBtn.dataset.listenerAdded = 'true';
            saveGradePeriodBtn.addEventListener('click', async function () {
                const periodSelect = document.getElementById('grade-period-select');
                if (!periodSelect) {
                    alert('등급 적용 기간 설정을 찾을 수 없습니다.');
                    return;
                }
                try {
                    ensureSupabase();
                    const period = periodSelect.value;
                    const { data, error } = await window.supabaseClient
                        .from('farm_settings').select('settings').eq('id', 1).single();
                    if (error) throw error;
                    const updatedSettings = { ...data.settings, gradePeriod: period };
                    const { error: updateError } = await window.supabaseClient
                        .from('farm_settings').update({ settings: updatedSettings }).eq('id', 1);
                    if (updateError) throw updateError;
                    await window.forceReloadSettings();
                    alert('✅ 등급 적용 기간이 저장되었습니다.');
                } catch (error) {
                    console.error('❌ 등급 적용 기간 저장 실패:', error);
                    alert('등급 적용 기간 저장에 실패했습니다.');
                }
            });
        }

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
                        
                        ensureSupabase();

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
            container.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4 text-xs">판매채널 모듈을 불러올 수 없습니다.</td></tr>';
            return;
        }
        const channels = await window.salesChannelsDataManager.loadChannels();
        container.innerHTML = '';
        if (!channels || channels.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4 text-xs">판매채널이 없습니다.</td></tr>';
            console.log('✅ 판매 채널 관리 로드 완료 (0개)');
            return;
        }
        const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        channels.forEach((channel, index) => {
            const isActive = channel.is_active !== false;
            const desc = esc2(channel.description||'');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="w-2 h-2 rounded-full inline-block ${isActive ? 'bg-green-500' : 'bg-gray-300'}"></span></td>
                <td class="td-primary">${esc2(channel.name||'')}</td>
                <td class="td-secondary truncate">${desc || '<span class="td-null">—</span>'}</td>
                <td class="whitespace-nowrap text-right">
                    <button onclick="toggleSalesChannelByIndex(${index})" class="btn-icon" title="${isActive?'비활성화':'활성화'}"><i class="fas fa-${isActive?'pause':'play'} text-xs"></i></button>
                    <button onclick="editSalesChannelByIndex(${index})" class="btn-icon btn-icon-edit" title="편집"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteSalesChannelByIndex(${index})" class="btn-icon btn-icon-delete" title="삭제"><i class="fas fa-trash"></i></button>
                </td>
            `;
            container.appendChild(tr);
        });
        console.log('✅ 판매 채널 관리 로드 완료:', channels.length, '개');
    } catch (error) {
        console.error('❌ 판매 채널 관리 로드 실패:', error);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4 text-xs">채널 목록을 불러오지 못했습니다.</td></tr>';
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

        if (!settings.orderStatuses || settings.orderStatuses.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4 text-xs">주문상태가 없습니다.</td></tr>';
            return;
        }

        settings.orderStatuses.forEach((status, index) => {
            const color = status.color || '#6B7280';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="w-2 h-2 rounded-full inline-block" style="background:${color};"></span></td>
                <td class="td-primary">${status.label||''}</td>
                <td class="td-secondary">${status.description||'—'}</td>
                <td class="whitespace-nowrap text-right">
                    <button onclick="editOrderStatus(${index})" class="btn-icon btn-icon-edit" title="수정"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteOrderStatus(${index})" class="btn-icon btn-icon-delete" title="삭제"><i class="fas fa-trash"></i></button>
                </td>
            `;
            container.appendChild(tr);
        });

        // "상태 추가" 버튼 리스너: initSettingsEventListeners() 가 never called 라서 여기서 1회 바인딩
        const addOrderStatusBtn = document.getElementById('add-order-status-btn');
        if (addOrderStatusBtn && !addOrderStatusBtn.dataset.listenerAdded) {
            addOrderStatusBtn.dataset.listenerAdded = 'true';
            addOrderStatusBtn.addEventListener('click', async function () {
                const label = prompt('상태명을 입력하세요:');
                if (!label || !label.trim()) return;
                try {
                    await window.settingsDataManager.addOrderStatus({
                        value: label.trim(),
                        label: label.trim(),
                        color: '#6B7280',
                        description: '새로 추가된 상태'
                    });
                    loadOrderStatuses();
                    // 주문관리 탭의 상태 필터 버튼도 즉시 반영
                    if (window.orderDataManager?.renderStatusTabs) {
                        await window.orderDataManager.renderStatusTabs();
                    }
                } catch (error) {
                    console.error('❌ 주문 상태 추가 실패:', error);
                    alert('주문 상태 추가에 실패했습니다: ' + (error.message || error));
                }
            });
        }

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
        window.settingsDataManager.updateSetting('farm', 'email', document.getElementById('farm-email')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'businessNumber', document.getElementById('farm-business-number')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'bankName', document.getElementById('farm-bank-name')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'bankAccount', document.getElementById('farm-bank-account')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'bankHolder', document.getElementById('farm-bank-holder')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'logoUrl', document.getElementById('farm-logo-url')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'sidebarTitle', document.getElementById('farm-sidebar-title')?.value || '');
        window.settingsDataManager.updateSetting('farm', 'sidebarSubtitle', document.getElementById('farm-sidebar-subtitle')?.value || '');

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

        // 주문 폼 배송비 캐시 즉시 갱신
        if (window.SHIPPING_SETTINGS) {
            window.SHIPPING_SETTINGS.defaultShippingFee = defaultShippingFee;
            window.SHIPPING_SETTINGS.freeShippingThreshold = freeShippingThreshold;
        }

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
                    ensureSupabase();

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
                    
                    ensureSupabase();

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
                    let changedCount = 0;   // 실제 등급이 변경된 고객 수

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
                                const result = await window.updateCustomerGrade(customer.id, totalPurchaseAmount);
                                successCount++;
                                if (result && result.__changed) changedCount++;
                            } else {
                                console.error('❌ updateCustomerGrade 함수를 찾을 수 없습니다');
                                failCount++;
                            }
                        } catch (error) {
                            console.error(`❌ 고객 ${customer.id} 등급 재계산 실패:`, error);
                            failCount++;
                        }
                    }

                    console.log(`✅ 전체 고객 등급 재계산 완료: 성공 ${successCount}건, 실패 ${failCount}건, 등급 변경 ${changedCount}건`);
                    alert(`✅ 전체 고객 등급 재계산이 완료되었습니다!\n\n처리: ${successCount}명\n실패: ${failCount}명\n등급 변경: ${changedCount}명 (나머지는 기존 등급 유지)`);
                    
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
                        if (window.invalidateCustomerUICache) window.invalidateCustomerUICache();

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
                const remoteAreaShippingFee = parseInt(document.getElementById('remote-area-shipping-fee')?.value) || 5000;

                try {
                    await window.settingsDataManager.updateSetting('shipping', 'defaultShippingFee', defaultShippingFee);
                    await window.settingsDataManager.updateSetting('shipping', 'freeShippingThreshold', freeShippingThreshold);
                    await window.settingsDataManager.updateSetting('shipping', 'remoteAreaShippingFee', remoteAreaShippingFee);

                    // 주문 폼 배송비 캐시 즉시 갱신
                    if (window.SHIPPING_SETTINGS) {
                        window.SHIPPING_SETTINGS.defaultShippingFee = defaultShippingFee;
                        window.SHIPPING_SETTINGS.freeShippingThreshold = freeShippingThreshold;
                        window.SHIPPING_SETTINGS.remoteAreaShippingFee = remoteAreaShippingFee;
                    }

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

// ── SMS API 설정 로드/저장 ──
function loadSmsApiConfig() {
    try {
        const cfg = window.settingsDataManager?.getAllSettings()?.smsConfig || {};
        const keyEl = document.getElementById('sms-api-key');
        const secretEl = document.getElementById('sms-api-secret');
        const fromEl = document.getElementById('sms-from-number');
        if (keyEl) keyEl.value = cfg.apiKey || '';
        if (secretEl) secretEl.value = cfg.apiSecret || '';
        if (fromEl) fromEl.value = cfg.from || '';

        // 저장 버튼
        const saveBtn = document.getElementById('save-sms-config-btn');
        if (saveBtn && !saveBtn.dataset.listenerAdded) {
            saveBtn.dataset.listenerAdded = 'true';
            saveBtn.addEventListener('click', async () => {
                const apiKey = document.getElementById('sms-api-key')?.value.trim();
                const apiSecret = document.getElementById('sms-api-secret')?.value.trim();
                const from = document.getElementById('sms-from-number')?.value.trim().replace(/[^0-9]/g, '');
                if (!apiKey || !apiSecret) { alert('API Key와 Secret을 입력해주세요.'); return; }
                try {
                    await window.settingsDataManager.updateSetting('smsConfig', 'apiKey', apiKey);
                    await window.settingsDataManager.updateSetting('smsConfig', 'apiSecret', apiSecret);
                    if (from) await window.settingsDataManager.updateSetting('smsConfig', 'from', from);
                    await window.settingsDataManager.saveSettings();
                    alert('SMS API 설정이 저장되었습니다.');
                } catch (e) {
                    console.error('SMS 설정 저장 실패:', e);
                    alert('저장 실패: ' + e.message);
                }
            });
        }
    } catch (e) {
        console.warn('SMS API 설정 로드 실패:', e);
    }
}

// ── 카카오 알림톡 설정 ──
async function loadKakaoSettings() {
    // 템플릿 상태 확인 버튼
    const checkBtn = document.getElementById('kakao-check-status-btn');
    if (checkBtn && !checkBtn.dataset.listenerAdded) {
        checkBtn.dataset.listenerAdded = 'true';
        checkBtn.addEventListener('click', checkKakaoTemplateStatus);
    }
    // 자동 로드
    await checkKakaoTemplateStatus();
}

async function checkKakaoTemplateStatus() {
    const container = document.getElementById('kakao-templates-list');
    if (!container) return;
    container.innerHTML = '<p class="text-muted text-sm py-2"><i class="fas fa-spinner fa-spin mr-1"></i>조회 중...</p>';

    try {
        const cfg = window.settingsDataManager?.getAllSettings()?.smsConfig || {};
        const apiKey = cfg.apiKey || 'NCSMOXRMGQAODZLK';
        const apiSecret = cfg.apiSecret || '3KYQNOP16SZPKTBXFKPMB9UKTFRWI066';
        const pfId = window.KAKAO_CONFIG?.pfId || 'KA01PF250905143602736PcFaTjYyszo';

        // Solapi API로 템플릿 조회
        const date = new Date().toISOString();
        const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('');
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(apiSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = await crypto.subtle.sign('HMAC', key, enc.encode(date + salt));
        const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
        const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

        const res = await fetch(`https://api.solapi.com/kakao/v2/templates?channelId=${pfId}`, {
            headers: { 'Authorization': authHeader }
        });
        const data = await res.json();
        const templates = (data.templateList || []).filter(t => t.channelId === pfId);

        if (templates.length === 0) {
            container.innerHTML = '<p class="text-muted text-sm py-2">등록된 템플릿이 없습니다.</p>';
            return;
        }

        const STATUS_BADGE = {
            'APPROVED': '<span class="badge badge-success">승인</span>',
            'PENDING': '<span class="badge badge-warning">검수중</span>',
            'REJECTED': '<span class="badge badge-danger">반려</span>',
        };

        container.innerHTML = templates.map(t => `
            <div class="p-3 rounded-lg mb-2" style="border:1px solid var(--border);background:#fff;">
                <div class="flex items-center justify-between mb-1">
                    <strong class="text-sm">${t.name}</strong>
                    ${STATUS_BADGE[t.status] || `<span class="badge badge-neutral">${t.status}</span>`}
                </div>
                <p class="text-xs text-muted" style="white-space:pre-wrap;max-height:60px;overflow:hidden;">${(t.content || '').substring(0, 120)}${t.content?.length > 120 ? '...' : ''}</p>
                <div class="text-xs text-muted mt-1">ID: ${t.templateId}</div>
            </div>
        `).join('');

    } catch (e) {
        console.error('카카오 템플릿 조회 실패:', e);
        container.innerHTML = '<p class="text-danger text-sm py-2">조회 실패: ' + e.message + '</p>';
    }
}

window.loadSmsApiConfig = loadSmsApiConfig;
window.loadKakaoSettings = loadKakaoSettings;

// 전역 함수들 등록
window.showSettingsTab = showSettingsTab;
window.loadGeneralSettings = loadGeneralSettings;
window.loadShippingSettings = loadShippingSettings;
window.loadCustomerGrades = loadCustomerGrades;
window.loadSalesChannels = loadSalesChannels;
window.loadOrderStatuses = loadOrderStatuses;
window.saveSettings = saveSettings;
window.initSettingsEventListeners = initSettingsEventListeners;

// 주문 상태 전역 함수
window.editOrderStatus = function(index) {
    const settings = window.settingsDataManager?.getAllSettings();
    const s = settings?.orderStatuses?.[index];
    if (!s) return;
    const _esc = v => String(v||'').replace(/"/g,'&quot;');
    const modal = document.createElement('div');
    modal.id = 'edit-order-status-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-sm">
            <div class="modal-header">
                <span class="modal-title">주문상태 수정</span>
                <button class="modal-close-btn" onclick="document.getElementById('edit-order-status-modal').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body space-y-3">
                <div><label class="form-label">상태명</label><input type="text" id="edit-os-label" class="form-control" value="${_esc(s.label)}"></div>
                <div><label class="form-label">설명</label><input type="text" id="edit-os-desc" class="form-control" value="${_esc(s.description||'')}"></div>
                <div class="flex items-center gap-3">
                    <div class="flex-1"><label class="form-label">색상</label><input type="color" id="edit-os-color" class="form-control h-9" value="${_esc(s.color||'#6B7280')}"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('edit-order-status-modal').remove()">취소</button>
                <button class="btn-primary" onclick="saveOrderStatus(${index})">저장</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.saveOrderStatus = function(index) {
    const label = document.getElementById('edit-os-label')?.value.trim();
    const description = document.getElementById('edit-os-desc')?.value.trim();
    const color = document.getElementById('edit-os-color')?.value;
    if (!label) { alert('상태명을 입력해주세요.'); return; }
    const settings = window.settingsDataManager?.getAllSettings();
    const existing = settings?.orderStatuses?.[index];
    window.settingsDataManager.updateOrderStatus(index, { ...existing, label, description, color });
    document.getElementById('edit-order-status-modal')?.remove();
    loadOrderStatuses();
    if (window.orderDataManager?.renderStatusTabs) window.orderDataManager.renderStatusTabs();
};

window.deleteOrderStatus = async function(index) {
    if (!confirm('이 주문상태를 삭제하시겠습니까?')) return;
    window.settingsDataManager.deleteOrderStatus(index);
    loadOrderStatuses();
    if (window.orderDataManager?.renderStatusTabs) window.orderDataManager.renderStatusTabs();
};

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
                                   class="input-ui">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">최소 구매금액 (원)</label>
                            <input type="number" id="edit-grade-min-amount" value="${currentGrade.minAmount}" 
                                   class="input-ui">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">할인율 (%)</label>
                            <input type="number" id="edit-grade-discount" value="${currentGrade.discount}" min="0" max="100"
                                   class="input-ui">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">색상</label>
                            <input type="color" id="edit-grade-color" value="${currentGrade.color}" 
                                   class="input-ui">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-body mb-1">아이콘</label>
                            <select id="edit-grade-icon" class="input-ui">
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
                        <button onclick="saveEditGrade(${index})" class="btn-info">
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
        if (window.invalidateCustomerUICache) window.invalidateCustomerUICache();
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

        // 고객관리 탭 캐시 무효화
        if (window.invalidateCustomerUICache) window.invalidateCustomerUICache();

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

            // 고객관리 탭 캐시 무효화
            if (window.invalidateCustomerUICache) window.invalidateCustomerUICache();

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
        <td></td>
        <td><input type="text" id="grade-name-${index}" value="${_esc(g.name)}" class="input-ui text-xs w-full" placeholder="등급명"></td>
        <td><input type="number" id="grade-minamount-${index}" value="${g.minAmount||0}" class="input-ui text-xs text-right w-full" min="0"></td>
        <td><input type="number" id="grade-discount-${index}" value="${g.discount||0}" class="input-ui text-xs text-right w-full" min="0" max="100"></td>
        <td class="whitespace-nowrap text-right">
            <button onclick="saveInlineGrade(${index})" class="btn-primary btn-xs">저장</button>
            <button onclick="cancelEditGrade(${index})" class="btn-secondary btn-xs">취소</button>
        </td>
    `;
    row.querySelector(`#grade-name-${index}`)?.focus();
};

// 고객등급 인라인 편집 취소
window.cancelEditGrade = function(index) {
    loadCustomerGrades();
};

// SMS 템플릿 편집 모달
window.editSmsTemplate = function(key, fieldId, vars) {
    const settings = window.settingsDataManager?.getAllSettings();
    const value = settings?.smsTemplates?.[key] || '';
    const existing = document.getElementById('edit-sms-template-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'edit-sms-template-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-lg">
            <div class="modal-header">
                <span class="modal-title">SMS 템플릿 수정</span>
                <button class="modal-close-btn" onclick="document.getElementById('edit-sms-template-modal').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p class="text-xs text-muted mb-2">사용 가능 변수: <span class="font-mono">${vars}</span></p>
                <textarea id="${fieldId}" class="input-ui resize-y w-full text-sm" rows="10">${value}</textarea>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="document.getElementById('edit-sms-template-modal').remove()">취소</button>
                <button class="btn-primary" onclick="saveSingleSmsTemplate('${key}','${fieldId}')">저장</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// SMS 단일 템플릿 저장
window.saveSingleSmsTemplate = async function(key, fieldId) {
    try {
        const value = document.getElementById(fieldId)?.value || '';
        if (window.settingsDataManager) {
            await window.settingsDataManager.updateSetting('smsTemplates', key, value);
            // 카드 그리드 전체 재렌더 (v3.3.139+: 카드 구조)
            await loadSMSSettings();
            // 모달 닫기
            document.getElementById('edit-sms-template-modal')?.remove();
            if (window.showToast) window.showToast('저장되었습니다.', 2000);
        }
    } catch (error) {
        console.error('❌ SMS 템플릿 저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
};

// ── 농장 로고 업로드 ──
window._handleFarmLogoSelect = async function(input) {
    const file = input.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('farm-logo-img');
        const placeholder = document.getElementById('farm-logo-placeholder');
        const removeBtn = document.getElementById('farm-logo-remove');
        if (img) { img.src = e.target.result; img.classList.remove('hidden'); }
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
        // 사이드바에도 즉시 반영
        const sidebarImg = document.getElementById('sidebar-logo-img');
        const sidebarIcon = document.getElementById('sidebar-logo-icon');
        if (sidebarImg) { sidebarImg.src = e.target.result; sidebarImg.classList.remove('hidden'); }
        if (sidebarIcon) sidebarIcon.classList.add('hidden');
    };
    reader.readAsDataURL(file);

    // 리사이즈 + 업로드
    try {
        if (!window.supabaseClient) { alert('Supabase 미연결'); return; }
        const blob = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height, 400);
                const canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                canvas.getContext('2d').drawImage(img, 0, 0, size, size);
                canvas.toBlob(b => resolve(b), 'image/jpeg', 0.8);
            };
            img.src = URL.createObjectURL(file);
        });

        const fileName = `farm-logo-${Date.now()}.jpg`;
        const { error } = await window.supabaseClient.storage
            .from('product-images')
            .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
        if (error) throw error;

        const { data: urlData } = window.supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);

        const url = urlData?.publicUrl || '';
        document.getElementById('farm-logo-url').value = url;
        console.log('✅ 로고 업로드:', url);
    } catch (e) {
        console.error('로고 업로드 실패:', e);
        alert('로고 업로드 실패: ' + e.message);
    }
};

window._removeFarmLogo = function() {
    const img = document.getElementById('farm-logo-img');
    const placeholder = document.getElementById('farm-logo-placeholder');
    const removeBtn = document.getElementById('farm-logo-remove');
    const urlInput = document.getElementById('farm-logo-url');
    if (img) { img.src = ''; img.classList.add('hidden'); }
    if (placeholder) placeholder.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
    if (urlInput) urlInput.value = '';
    // 사이드바 원복
    const sidebarImg = document.getElementById('sidebar-logo-img');
    const sidebarIcon = document.getElementById('sidebar-logo-icon');
    if (sidebarImg) { sidebarImg.src = ''; sidebarImg.classList.add('hidden'); }
    if (sidebarIcon) sidebarIcon.classList.remove('hidden');
};
