// 고객 UI 관리
// 고객 목록, 폼, 모달 UI 처리

import { customerDataManager } from './customerData.js';
import { DEFAULT_CUSTOMER_GRADES } from '../settings/settingsData.js';
import { formatDate, formatPhone, formatCurrency, ND } from '../../utils/formatters.js';

// ----------------------------
// 캐시 (매 렌더마다 Supabase 쿼리 반복 방지)
// ----------------------------
let _gradesCache = null;          // 고객등급 설정 캐시
let _lastOrderCache = null;       // 전화번호→최근주문일 캐시
let _lastOrderCacheTime = 0;      // 캐시 타임스탬프
let _unpaidPhonesCache = null;    // 미납(입금대기) 고객 전화번호 집합
let _unpaidPhonesCacheTime = 0;
let _waitlistPhonesCache = null;  // 대기 고객 전화번호 집합
let _waitlistPhonesCacheTime = 0;

// 외부에서 캐시 무효화 (저장/삭제 후 호출)
export function invalidateCustomerUICache() {
    _gradesCache = null;
    _lastOrderCache = null;
    _lastOrderCacheTime = 0;
    _unpaidPhonesCache = null;
    _unpaidPhonesCacheTime = 0;
    _waitlistPhonesCache = null;
    _waitlistPhonesCacheTime = 0;
}

// loadCustomers 와 병렬로 렌더 쿼리 캐시 워밍 (v3.3.67)
export function prefetchCustomerRenderData() {
    fetchLastOrderDatesByPhone().catch(() => {});
    loadCustomerGradesFromSettings().catch(() => {});
}
window.prefetchCustomerRenderData = prefetchCustomerRenderData;

// ----------------------------
// 고객 모달 저장(중복 방지) 유틸
// ----------------------------
let customerModalEventsAbortController = null;

function getCustomerModalElements() {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    const saveBtn = document.getElementById('customer-save-btn');
    return { modal, form, saveBtn };
}

function setButtonLoading(button, isLoading, loadingText = '저장중...') {
    if (!button) return;

    if (isLoading) {
        // 이미 로딩 중이면 재진입 차단
        if (button.disabled) return;
        button.dataset.prevDisabled = String(button.disabled);
        button.dataset.prevHtml = button.innerHTML;
        button.disabled = true;
        button.classList.add('opacity-60', 'cursor-not-allowed');
        button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
    } else {
        button.disabled = false;
        button.classList.remove('opacity-60', 'cursor-not-allowed');
        if (button.dataset.prevHtml) {
            button.innerHTML = button.dataset.prevHtml;
        }
        delete button.dataset.prevDisabled;
        delete button.dataset.prevHtml;
    }
}

function readCustomerFormData() {
    const name = (document.getElementById('customer-form-name')?.value || '').trim();
    const phoneRaw = (document.getElementById('customer-form-phone')?.value || '').trim();
    const phone = phoneRaw.replace(/[^0-9]/g, ''); // 저장은 숫자만 (중복체크 로직과 일치)
    const address = (document.getElementById('customer-form-address')?.value || '').trim();
    const address_detail = (document.getElementById('customer-form-address-detail')?.value || '').trim();
    const email = (document.getElementById('customer-form-email')?.value || '').trim();
    const grade = (document.getElementById('customer-form-grade')?.value || 'GENERAL').trim();
    const registration_date = (document.getElementById('customer-form-registration-date')?.value || '').trim();
    const memo = (document.getElementById('customer-form-memo')?.value || '').trim();

    return { name, phone, address, address_detail, email, grade, registration_date, memo };
}

async function handleCustomerSave(event) {
    // 버튼 클릭/폼 submit 모두 이 핸들러로 통일
    if (event) event.preventDefault();

    const { saveBtn } = getCustomerModalElements();

    // 클릭 즉시 비활성화 (중복 저장 방지 핵심)
    if (saveBtn?.disabled) return;
    setButtonLoading(saveBtn, true);

    try {
        const customerId = (document.getElementById('customer-id')?.value || '').trim();
        const payload = readCustomerFormData();

        if (!payload.name || !payload.phone) {
            throw new Error('고객명과 전화번호는 필수입니다.');
        }

        // 고객명 중복 검사(등록 시 차단 / 수정 시 confirm 흐름)
        if (window.checkCustomerNameDuplicate) {
            const ok = window.checkCustomerNameDuplicate(payload.name, customerId || null);
            if (!ok) {
                return;
            }
        }

        // 저장 (신규/수정)
        let savedCustomer = null;
        if (customerId) {
            savedCustomer = await customerDataManager.updateCustomer(customerId, payload);
            if (window.showToast) window.showToast('✅ 고객 정보가 수정되었습니다.', 2500);
        } else {
            savedCustomer = await customerDataManager.addCustomer(payload);
            if (window.showToast) window.showToast('✅ 고객이 등록되었습니다.', 2500);
        }

        // 목록/카운트 갱신
        const activeGradeButton = document.querySelector('.customer-tab-btn.active');
        const gradeFilter = activeGradeButton
            ? activeGradeButton.id.replace('customer-grade-', '')
            : 'all';

        await renderCustomersTable(gradeFilter);
        if (window.updateCustomerGradeCounts) {
            await window.updateCustomerGradeCounts();
        }

        // 저장 후 호출자 콜백 실행 (예: 주문 폼에서 신규 고객 등록 흐름 복귀)
        const cb = window.customerModalCallback;
        window.customerModalCallback = null;
        if (typeof cb === 'function') {
            try { cb(savedCustomer); } catch (cbErr) { console.error('❌ customerModalCallback 실행 오류:', cbErr); }
        }

        // 모달 닫기
        closeCustomerModal();
    } catch (error) {
        console.error('❌ 고객 저장 실패:', error);
        if (window.showToast) {
            window.showToast(`❌ 저장 실패: ${error.message}`, 4000);
        } else {
            alert('고객 저장에 실패했습니다: ' + error.message);
        }
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

function initCustomerModalSaveHandlers() {
    const { form, saveBtn } = getCustomerModalElements();
    if (!form || !saveBtn) return;

    // 중복 리스너 방지: 이전 바인딩은 abort로 제거
    if (customerModalEventsAbortController) {
        customerModalEventsAbortController.abort();
    }
    customerModalEventsAbortController = new AbortController();
    const { signal } = customerModalEventsAbortController;

    // 저장 버튼 클릭
    saveBtn.addEventListener('click', handleCustomerSave, { signal });

    // Enter 제출 등 폼 submit도 동일 처리
    form.addEventListener('submit', handleCustomerSave, { signal });
}

// 고객 테이블 렌더링 함수 (등급 필터링 지원)
export async function renderCustomersTable(gradeFilter = 'all', searchTerm = '') {
    console.log(`🎨 고객 테이블 렌더링 시작 (등급 필터: ${gradeFilter})`);
    
    try {
        const allCustomers = customerDataManager.getAllCustomers();
        console.log(`📊 전체 고객 수: ${allCustomers.length}`);
        console.log('📋 고객 데이터:', allCustomers);
        
        // 정렬 적용
        const sortBy = customerDataManager.customerSortBy || 'newest';
        const sortedCustomers = customerDataManager.sortCustomers(sortBy);
        console.log(`📊 정렬 적용: ${sortBy}`);
        
        // 등급 + 검색어 필터링
        const term = (searchTerm || '').toLowerCase().trim();
        let customers = sortedCustomers
            .filter(c => gradeFilter === 'all' || c.grade === gradeFilter)
            .filter(c => !term ||
                (c.name || '').toLowerCase().includes(term) ||
                (c.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''))
            );

        // 미납 / 대기 체크박스 필터
        const filterUnpaid   = document.getElementById('filter-unpaid')?.checked;
        const filterWaitlist = document.getElementById('filter-waitlist')?.checked;
        if (filterUnpaid || filterWaitlist) {
            const [unpaidPhones, waitlistPhones] = await Promise.all([
                filterUnpaid   ? fetchUnpaidPhones()   : Promise.resolve(new Set()),
                filterWaitlist ? fetchWaitlistPhones() : Promise.resolve(new Set()),
            ]);
            customers = customers.filter(c => {
                const phone = (c.phone || '').replace(/\D/g, '');
                if (filterUnpaid   && !unpaidPhones.has(phone))   return false;
                if (filterWaitlist && !waitlistPhones.has(phone)) return false;
                return true;
            });
        }

        console.log(`🎯 필터링된 고객 수: ${customers.length}`);
        
        const container = document.getElementById('customer-list-container');
        if (!container) {
            console.error('❌ 고객 리스트 컨테이너를 찾을 수 없습니다.');
            return;
        }

        // 페이지당 표시 수 적용
        const pageSizeEl = document.getElementById('customer-page-size');
        const pageSize = pageSizeEl ? parseInt(pageSizeEl.value) : 20;
        const pagedCustomers = pageSize === 0 ? customers : customers.slice(0, pageSize);

        // 목록 개수 표시
        const countEl = document.getElementById('customer-list-count');
        if (countEl) countEl.textContent = pageSize === 0 || pagedCustomers.length === customers.length
            ? `${customers.length}명 표시`
            : `${pagedCustomers.length} / ${customers.length}명 표시`;

        // 하단 상태 바
        const totalEl = document.getElementById('customer-status-total');
        const todayEl = document.getElementById('customer-status-today');
        if (totalEl) totalEl.textContent = String(allCustomers.length);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayCount = allCustomers.filter(c => (c.registration_date || '').slice(0, 10) === todayStr).length;
        if (todayEl) todayEl.textContent = String(todayCount);

        if (customers.length === 0) {
            container.innerHTML = window.renderEmptyRow(5, gradeFilter === 'all' ? '등록된 고객이 없습니다.' : '해당 등급 고객이 없습니다.');
            return;
        }

        // 두 쿼리를 병렬로 실행 (캐시 있으면 즉시 반환)
        const [lastOrderMap, grades] = await Promise.all([
            fetchLastOrderDatesByPhone(),
            loadCustomerGradesFromSettings()
        ]);

        // 등급명 맵 (동기 조회)
        const gradeNameMap = Object.fromEntries(grades.map(g => [g.code, g.name]));

        // HTML을 먼저 문자열로 조립한 뒤 한 번에 교체 (깜박임 방지)
        const fragment = document.createDocumentFragment();
        for (const customer of pagedCustomers) {
            const normalized = (customer.grade && String(customer.grade).trim()) || 'GENERAL';
            const gradeDisplayName = gradeNameMap[normalized] || normalized;
            const phoneKey = normalizePhoneForOrder(customer.phone);
            const rawDate = lastOrderMap.get(phoneKey) || customer.last_order_date;
            const lastOrderDate = rawDate ? formatDate(rawDate) : null;
            const tr = document.createElement('tr');
            tr.className = 'customer-row';
            tr.setAttribute('data-customer-id', customer.id);
            const phoneDisplay = formatPhone(customer.phone);
            tr.innerHTML = `
                <td class="td-primary td-link">${escapeHtml(customer.name) || ND}</td>
                <td class="td-secondary">${phoneDisplay || ND}</td>
                <td class="td-muted text-center">${lastOrderDate || ND}</td>
                <td class="text-center"><span class="badge ${getGradeBadgeClass(customer.grade)}">${gradeDisplayName}</span></td>
                <td class="text-center">
                    <div class="btn-group">
                        <button onclick="window.addOrderForCustomer && window.addOrderForCustomer('${customer.id}', '${escapeHtml(customer.name)}', '${escapeHtml(customer.phone || '')}')" class="btn-icon btn-icon-primary" title="주문 추가"><i class="fas fa-cart-plus"></i></button>
                        <button onclick="window.openQuickCallLog && window.openQuickCallLog('${customer.id}', '${escapeHtml(customer.name || '')}', '${escapeHtml(customer.phone || '')}')" class="btn-icon" style="color:var(--info);" title="통화 기록"><i class="fas fa-phone"></i></button>
                        <button onclick="editCustomer('${customer.id}')" class="btn-icon btn-icon-edit" title="수정"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteCustomer('${customer.id}')" class="btn-icon btn-icon-delete" title="삭제"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tr.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                showCustomerDetail(customer.id);
            });
            fragment.appendChild(tr);
        }
        // 기존 내용과 새 내용을 한 번에 교체
        container.innerHTML = '';
        container.appendChild(fragment);

        console.log('✅ 고객 리스트(테이블) 렌더링 완료');
        
    } catch (error) {
        console.error('❌ 고객 리스트 렌더링 실패:', error);
        const container = document.getElementById('customer-list-container');
        if (container) {
            container.innerHTML = `
                <tr><td colspan="5" class="text-center text-danger"><i class="fas fa-exclamation-triangle mr-1"></i>고객 목록을 불러오는 중 오류가 발생했습니다.</td></tr>
            `;
        }
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// formatDate 제거됨 — formatDate() 직접 사용 (v3.3.42)

/** 미납(입금대기) 고객 전화번호 집합 조회 (30초 캐시) */
async function fetchUnpaidPhones() {
    const now = Date.now();
    if (_unpaidPhonesCache && (now - _unpaidPhonesCacheTime) < 30000) return _unpaidPhonesCache;
    const set = new Set();
    if (!window.supabaseClient) return set;
    try {
        const { data, error } = await window.supabaseClient
            .from('farm_orders')
            .select('customer_phone')
            .eq('order_status', '입금대기');
        if (!error && data) {
            data.forEach(r => { if (r.customer_phone) set.add(r.customer_phone.replace(/\D/g, '')); });
        }
    } catch (e) { console.warn('미납 고객 조회 실패:', e); }
    _unpaidPhonesCache = set;
    _unpaidPhonesCacheTime = now;
    return set;
}

/** 대기자 목록에 있는 고객 전화번호 집합 조회 (30초 캐시) */
async function fetchWaitlistPhones() {
    const now = Date.now();
    if (_waitlistPhonesCache && (now - _waitlistPhonesCacheTime) < 30000) return _waitlistPhonesCache;
    const set = new Set();
    if (!window.supabaseClient) return set;
    try {
        const { data, error } = await window.supabaseClient
            .from('farm_waitlist')
            .select('customer_phone')
            .eq('status', '대기중');
        if (!error && data) {
            data.forEach(r => { if (r.customer_phone) set.add(r.customer_phone.replace(/\D/g, '')); });
        }
    } catch (e) { console.warn('대기 고객 조회 실패:', e); }
    _waitlistPhonesCache = set;
    _waitlistPhonesCacheTime = now;
    return set;
}

/** 고객 전화번호별 최근 주문일 맵 조회 (farm_orders 기준) */
function normalizePhoneForOrder(phone) {
    if (phone == null) return '';
    return String(phone).replace(/[-\s]/g, '');
}
async function fetchLastOrderDatesByPhone() {
    // 60초 캐시 — 렌더마다 주문 2000건 재쿼리 방지
    const now = Date.now();
    if (_lastOrderCache && (now - _lastOrderCacheTime) < 60000) {
        return _lastOrderCache;
    }
    const map = new Map();
    if (!window.supabaseClient) return map;
    try {
        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('customer_phone, order_date')
            .order('order_date', { ascending: false })
            .limit(2000);
        if (error || !orders) return map;
        for (const row of orders) {
            const phone = row.customer_phone;
            if (!phone) continue;
            const key = normalizePhoneForOrder(phone);
            const dateStr = row.order_date;
            if (!dateStr) continue;
            const existing = map.get(key);
            if (!existing || new Date(dateStr) > new Date(existing)) {
                map.set(key, dateStr);
            }
        }
    } catch (e) {
        console.warn('최근 주문일 조회 실패:', e);
    }
    _lastOrderCache = map;
    _lastOrderCacheTime = now;
    return map;
}

// 등급 배지 클래스 반환 — badge-rich-* (진한 배경 + 흰 텍스트)
function getGradeBadgeClass(grade) {
    const gradeClasses = {
        'BLACK_DIAMOND':  'badge-rich-black',
        'PURPLE_EMPEROR': 'badge-rich-purple',
        'RED_RUBY':       'badge-rich-red',
        'GREEN_LEAF':     'badge-rich-green',
        'GENERAL':        'badge-rich-blue'
    };
    return gradeClasses[grade] || 'badge-rich-gray';
}

// 등급별 그라데이션 클래스 반환
function getGradeGradient(grade) {
    const gradeGradients = {
        'GENERAL': 'bg-gradient-to-br from-blue-500 to-blue-600',
        'GREEN_LEAF': 'bg-gradient-to-br from-green-500 to-green-600',
        'RED_RUBY': 'bg-gradient-to-br from-red-500 to-red-600',
        'PURPLE_EMPEROR': 'bg-gradient-to-br from-purple-500 to-purple-600',
        'BLACK_DIAMOND': 'bg-gradient-to-br from-gray-700 to-gray-900'
    };
    return gradeGradients[grade] || 'bg-gradient-to-br from-gray-500 to-gray-600';
}

// 고객관리에서 고객등급 정보 로드 (세션 캐시 — 설정 변경 시 invalidateCustomerUICache() 호출)
async function loadCustomerGradesFromSettings() {
    if (_gradesCache) return _gradesCache;
    try {
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('farm_settings')
                .select('settings')
                .eq('id', 1)
                .single();

            if (!error && data?.settings?.customerGrades?.length > 0) {
                _gradesCache = data.settings.customerGrades;
                return _gradesCache;
            }
        }
        _gradesCache = getDefaultCustomerGrades();
        return _gradesCache;
    } catch (error) {
        console.error('❌ 고객등급 로드 실패:', error);
        return getDefaultCustomerGrades();
    }
}

/** 환경설정과 동일한 기본 고객등급 (단일 소스: settingsData.DEFAULT_CUSTOMER_GRADES) */
function getDefaultCustomerGrades() {
    return JSON.parse(JSON.stringify(DEFAULT_CUSTOMER_GRADES));
}

// 등급 표시 이름 반환 (환경설정 연동)
async function getGradeDisplayName(grade) {
    const normalized = (grade && String(grade).trim()) ? String(grade).trim() : 'GENERAL';
    try {
        const grades = await loadCustomerGradesFromSettings();
        const gradeInfo = grades.find(g => g.code === normalized);
        return gradeInfo ? gradeInfo.name : normalized;
    } catch (error) {
        console.error('❌ 등급 표시 이름 로드 실패:', error);
        const gradeNames = {
            'BLACK_DIAMOND': '블랙다이아몬드',
            'PURPLE_EMPEROR': '퍼플엠퍼러',
            'RED_RUBY': '레드루비',
            'GREEN_LEAF': '그린리프',
            'GENERAL': '일반'
        };
        return gradeNames[normalized] || normalized || '일반';
    }
}

// 전화번호 중복 확인 함수
function checkPhoneDuplicate(phoneNumber) {
    try {
        console.log('📞 전화번호 중복 확인:', phoneNumber);
        
        const messageDiv = document.getElementById('phone-duplicate-message');
        const phoneInput = document.getElementById('customer-form-phone');
        
        if (!messageDiv || !phoneInput) {
            console.warn('⚠️ 전화번호 관련 DOM 요소를 찾을 수 없습니다');
            return;
        }
        
        // 전화번호에서 숫자만 추출
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        // 전화번호가 11자리가 아니면 확인하지 않음
        if (cleanPhone.length !== 11) {
            messageDiv.classList.add('hidden');
            phoneInput.style.borderColor = '';
            return;
        }
        
        if (!window.customerDataManager) {
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
            return;
        }
        
        const customers = window.customerDataManager.getAllCustomers();
        const existingCustomer = customers.find(c => c.phone === cleanPhone);
        
        if (existingCustomer) {
            console.log('⚠️ 중복된 전화번호 발견:', existingCustomer);
            
            // 시각적 피드백
            phoneInput.style.borderColor = '#ef4444';
            phoneInput.style.backgroundColor = '#fef2f2';
            
            // 메시지 표시
            messageDiv.innerHTML = `
                <div class="flex items-center text-danger">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    <span>이미 등록된 전화번호입니다. (${existingCustomer.name})</span>
                </div>
            `;
            messageDiv.classList.remove('hidden');
            
        } else {
            console.log('✅ 전화번호 중복 없음');
            
            // 정상 상태로 복원
            phoneInput.style.borderColor = '';
            phoneInput.style.backgroundColor = '';
            messageDiv.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ 전화번호 중복 확인 실패:', error);
    }
}

// 고객 폼에 데이터 채우기 함수
function fillCustomerForm(customer) {
    try {
        console.log('📝 고객 폼 채우기:', customer);
        
        if (!customer) {
            console.error('❌ 고객 데이터가 없습니다.');
            return;
        }
        
        // 폼 필드 매핑
        const fieldMappings = [
            { id: 'customer-form-name', value: customer.name || '' },
            { id: 'customer-form-phone', value: customer.phone || '' },
            { id: 'customer-form-address', value: customer.address || '' },
            { id: 'customer-form-email', value: customer.email || '' },
            { id: 'customer-form-grade', value: customer.grade || 'GENERAL' },
            { id: 'customer-form-registration-date', value: customer.registration_date || '' },
            { id: 'customer-form-memo', value: customer.memo || '' }
        ];
        
        // address_detail 필드는 선택적으로 처리
        const addressDetailField = document.getElementById('customer-form-address-detail');
        if (addressDetailField) {
            addressDetailField.value = customer.address_detail || '';
        }
        
        // 폼 필드 채우기
        let successCount = 0;
        let failCount = 0;
        
        fieldMappings.forEach(mapping => {
            const element = document.getElementById(mapping.id);
            if (element) {
                element.value = mapping.value;
                successCount++;
                console.log(`✅ ${mapping.id} 설정 완료: ${mapping.value}`);
            } else {
                console.warn(`⚠️ 폼 필드를 찾을 수 없습니다: ${mapping.id}`);
                failCount++;
            }
        });

        // 상태 버튼 UI 동기화
        const customerStatus = customer.status || 'ACTIVE';
        const statusHidden = document.getElementById('customer-form-status');
        if (statusHidden) statusHidden.value = customerStatus;
        window.setCustomerStatus(customerStatus);

        // 메모 글자수 업데이트
        window.updateMemoCharCount(customer.memo || '');

        // 추가 정보에 해당하는 값이 있으면 섹션 자동 펼치기
        const hasExtra = !!(customer.email || customer.memo || (customer.status && customer.status !== 'ACTIVE'));
        if (hasExtra) expandExtraInfoSection();

        // 고객 ID 설정 (수정 모드)
        const customerIdField = document.getElementById('customer-id');
        if (customerIdField) {
            customerIdField.value = customer.id;
        }
        
        // 모달 제목 업데이트
        const modalTitle = document.getElementById('customer-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '고객 정보 수정';
        }
        
        console.log(`✅ 고객 폼 채우기 완료 (성공: ${successCount}, 실패: ${failCount})`);
        
        if (failCount > 0) {
            console.warn(`⚠️ ${failCount}개의 폼 필드를 찾을 수 없습니다.`);
        }
        
    } catch (error) {
        console.error('❌ 고객 폼 채우기 실패:', error);
        alert('고객 폼을 채우는 중 오류가 발생했습니다: ' + error.message);
    }
}

// 전역 함수로 등록 (HTML에서 호출 가능하도록)
window.renderCustomersTable = renderCustomersTable;
window.checkPhoneDuplicate = checkPhoneDuplicate;
window.fillCustomerForm = fillCustomerForm;

// 고객에서 바로 주문 추가 (전역)
window.addOrderForCustomer = function(customerId, customerName, customerPhone) {
    if (typeof window.openOrderModal === 'function') {
        window.openOrderModal(null, { customerId, customerName, customerPhone });
    } else if (typeof window.switchTab === 'function') {
        window.switchTab('orders');
        // 탭 전환 후 주문 모달 열기
        setTimeout(() => {
            if (typeof window.openOrderModal === 'function') {
                window.openOrderModal(null, { customerId, customerName, customerPhone });
            }
        }, 400);
    }
};

// 고객 삭제 함수 (전역)
window.deleteCustomer = async function(customerId) {
    console.log('🗑️ 고객 삭제 요청:', customerId);

    // 연관 주문 확인 (상세 정보 포함)
    const { data: orders, error: checkError } = await window.supabaseClient
        .from('farm_orders')
        .select('id, order_number, created_at, order_date, total_amount, order_status')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
    if (checkError) { alert('삭제 확인 중 오류: ' + checkError.message); return; }

    if (orders && orders.length > 0) {
        // 주문 목록 모달 표시 → { selectedIds, deleteCustomer } 반환
        const result = await showDeleteWithOrdersModal(orders);
        if (!result) return;

        // 선택된 주문 삭제
        if (result.selectedIds.length > 0) {
            const { error: delOrderErr } = await window.supabaseClient
                .from('farm_orders')
                .delete()
                .in('id', result.selectedIds);
            if (delOrderErr) { alert('주문 삭제 중 오류: ' + delOrderErr.message); return; }
            console.log(`✅ 주문 ${result.selectedIds.length}건 삭제 완료`);
        }

        // 고객도 삭제하지 않는 경우 (선택 주문만 삭제)
        if (!result.deleteCustomer) {
            if (window.renderCustomersTable) window.renderCustomersTable('all');
            if (window.showToast) window.showToast(`✅ 주문 ${result.selectedIds.length}건이 삭제되었습니다.`, 3000);
            return;
        }
    } else {
        if (!confirm('정말로 이 고객을 삭제하시겠습니까?')) return;
    }

    try {
        if (window.customerDataManager) {
            await window.customerDataManager.deleteCustomer(customerId);
            console.log('✅ 고객 삭제 완료');
            if (window.renderCustomersTable) window.renderCustomersTable('all');
            if (window.showToast) window.showToast('✅ 고객이 삭제되었습니다.', 3000);
        } else {
            alert('고객 데이터 관리자를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ 고객 삭제 실패:', error);
        alert('고객 삭제에 실패했습니다: ' + error.message);
    }
};

// 주문 목록 + 체크박스 선택 삭제 모달
// resolve(null) = 취소
// resolve({ selectedIds, deleteCustomer }) = 확인
function showDeleteWithOrdersModal(orders) {
    return new Promise((resolve) => {
        document.getElementById('delete-with-orders-modal')?.remove();

        const fmt = (d) => d ? d.slice(0, 10) : '-';
        const fmtAmt = (n) => n ? formatCurrency(n) : '-';
        const statusBadge = (s) => {
            // 상태 배지 색상 — orderData.js getStatusColor() 단일 소스 사용 ('취소' → '주문취소' 정규화 포함)
            const _normalizedStatus = s === '취소' ? '주문취소' : s;
            const cls = window.orderDataManager?.getStatusColor?.(_normalizedStatus) || 'badge-neutral';
            return `<span class="badge ${cls}">${s || '-'}</span>`;
        };

        const rows = orders.map((o, i) => `
            <tr data-id="${o.id}">
                <td class="px-2">
                    <input type="checkbox" class="order-chk checkbox-ui chk-danger" data-idx="${i}" checked>
                </td>
                <td class="px-2 td-secondary">${fmt(o.created_at || o.order_date)}</td>
                <td class="px-2 td-primary">${o.order_number || '-'}</td>
                <td class="px-2 text-right font-medium td-amount">${fmtAmt(o.total_amount)}</td>
                <td class="px-2 text-center">${statusBadge(o.order_status)}</td>
            </tr>`).join('');

        const modal = document.createElement('div');
        modal.id = 'delete-with-orders-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="modal-container modal-md">
                <div class="modal-header">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 bg-danger-accent rounded-lg flex items-center justify-center shrink-0">
                            <i class="fas fa-trash text-danger text-sm"></i>
                        </div>
                        <div>
                            <div class="modal-title">고객 삭제</div>
                            <div class="text-xs text-muted">삭제할 주문을 선택하세요 (총 ${orders.length}건)</div>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
                        <table class="w-full table-ui">
                            <thead class="bg-section sticky top-0">
                                <tr>
                                    <th class="px-2"><input type="checkbox" id="chk-all" class="rounded border-gray-300" checked></th>
                                    <th class="px-2 text-left">날짜</th>
                                    <th class="px-2 text-left">주문번호</th>
                                    <th class="px-2 text-right">금액</th>
                                    <th class="px-2 text-center">상태</th>
                                </tr>
                            </thead>
                            <tbody id="order-del-tbody">${rows}</tbody>
                        </table>
                    </div>
                    <p class="mt-2.5 text-xs text-danger">⚠️ 삭제된 주문은 복구할 수 없습니다.</p>
                </div>
                <div class="modal-footer">
                    <button id="btn-cancel-del" class="btn-secondary">취소</button>
                    <button id="btn-del-orders-only" class="btn-secondary" style="border-color:#FCA5A5;color:#DC2626;">선택 주문만 삭제</button>
                    <button id="btn-del-all" class="btn-danger">주문 + 고객 삭제</button>
                </div>
            </div>`;

        document.body.appendChild(modal);

        // 전체 선택 체크박스
        const chkAll = modal.querySelector('#chk-all');
        const getChecked = () => Array.from(modal.querySelectorAll('.order-chk:checked')).map(c => orders[+c.dataset.idx].id);
        chkAll.addEventListener('change', () => {
            modal.querySelectorAll('.order-chk').forEach(c => c.checked = chkAll.checked);
        });
        modal.querySelectorAll('.order-chk').forEach(c => c.addEventListener('change', () => {
            chkAll.checked = modal.querySelectorAll('.order-chk').length === modal.querySelectorAll('.order-chk:checked').length;
        }));

        modal.querySelector('#btn-cancel-del').addEventListener('click', () => { modal.remove(); resolve(null); });
        modal.addEventListener('click', (e) => { if (e.target === modal) { modal.remove(); resolve(null); } });

        modal.querySelector('#btn-del-orders-only').addEventListener('click', () => {
            const selectedIds = getChecked();
            if (!selectedIds.length) { alert('삭제할 주문을 선택하세요.'); return; }
            modal.remove();
            resolve({ selectedIds, deleteCustomer: false });
        });

        modal.querySelector('#btn-del-all').addEventListener('click', () => {
            const selectedIds = getChecked();
            if (!selectedIds.length) { alert('삭제할 주문을 선택하세요.'); return; }
            modal.remove();
            resolve({ selectedIds, deleteCustomer: true });
        });
    });
}

// 고객 수정 함수 (전역)
window.editCustomer = async function(customerId) {
    console.log('✏️ 고객 수정 요청:', customerId);
    
    try {
        // 고객 데이터 가져오기
        if (!window.customerDataManager) {
            console.error('❌ customerDataManager를 찾을 수 없습니다.');
            return;
        }
        
        const customer = window.customerDataManager.getCustomerById(customerId);
        if (!customer) {
            console.error('❌ 고객을 찾을 수 없습니다:', customerId);
            alert('고객을 찾을 수 없습니다.');
            return;
        }
        
        console.log('📝 수정할 고객 정보:', customer);
        
        // 고객 모달이 없으면 동적으로 로드
        let modal = document.getElementById('customer-modal');
        if (!modal) {
            console.log('📦 고객 모달이 없습니다. 동적 로드 시작...');
            try {
                // customer-management.js의 loadCustomerModal 함수 호출
                if (window.loadCustomerModal) {
                    await window.loadCustomerModal();
                } else {
                    console.error('❌ loadCustomerModal 함수를 찾을 수 없습니다');
                    alert('고객 수정 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                    return;
                }
                
                modal = document.getElementById('customer-modal');
                console.log('🔍 로드된 모달 요소:', modal);
                
                if (!modal) {
                    console.error('❌ 고객 모달 로드 실패');
                    alert('고객 수정 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                    return;
                }
            } catch (loadError) {
                console.error('❌ 고객 모달 로드 중 오류:', loadError);
                alert('고객 수정 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
                return;
            }
        }
        
        // 모달 열기
        if (window.openCustomerModal) {
            window.openCustomerModal();
        } else {
            console.warn('⚠️ openCustomerModal 함수를 찾을 수 없습니다');
        }

        // 수정 모드: 탭 표시 + 모달 확장
        setTimeout(() => {
            // 탭 노출
            const tabs = document.getElementById('customer-modal-tabs');
            if (tabs) { tabs.style.display = ''; tabs.classList.remove('hidden'); }
            // 모달 폭 확장 (modal-sm → modal-md)
            const modalContent = document.getElementById('customer-modal-content');
            if (modalContent) {
                modalContent.classList.remove('modal-sm');
                modalContent.classList.add('modal-md');
            }
            // 정보 탭 활성 상태 유지
            window.switchCustomerTab?.('info');
            // 폼 데이터 채우기
            window.fillCustomerForm(customer);
        }, 100);
        
    } catch (error) {
        console.error('❌ 고객 수정 실패:', error);
        alert('고객 수정 중 오류가 발생했습니다: ' + error.message);
    }
};

// 고객 상세 정보 표시 함수 (전역)
window.showCustomerDetail = async function(customerId) {
    console.log('👤 고객 상세 정보 표시:', customerId);
    
    try {
        if (!window.customerDataManager) {
            console.error('❌ customerDataManager를 찾을 수 없습니다.');
            return;
        }
        
        console.log('🔍 customerDataManager 확인됨:', window.customerDataManager);
        console.log('🔍 전체 고객 수:', window.customerDataManager.getAllCustomers().length);
        
        const customer = window.customerDataManager.getCustomerById(customerId);
        console.log('🔍 찾은 고객:', customer);
        
        if (!customer) {
            console.error('❌ 고객을 찾을 수 없습니다:', customerId);
            console.log('🔍 전체 고객 목록:', window.customerDataManager.getAllCustomers());
            return;
        }
        
        console.log('📋 고객 정보:', customer);
        
        // 리스트 카드 선택 상태
        document.querySelectorAll('.customer-list-card').forEach(el => {
            el.classList.toggle('ring-2', el.getAttribute('data-customer-id') === customerId);
            el.classList.toggle('ring-emerald-500', el.getAttribute('data-customer-id') === customerId);
        });
        
        // 패널 열기 (detail-open 클래스 추가)
        const layout = document.querySelector('.customer-admin-layout');
        if (layout) layout.classList.add('detail-open');

        // 1. 오른쪽 패널에 상세 정보 표시
        await showCustomerDetailInPanel(customer);
        
    } catch (error) {
        console.error('❌ 고객 상세 정보 표시 실패:', error);
    }
};

// 고객 상세 정보를 팝업 모달로 표시
async function showCustomerDetailInPanel(customer) {
    try {
        const overlay = document.getElementById('customer-detail-panel');
        const detailContent = document.getElementById('customer-detail-content');
        if (!overlay || !detailContent) return;

        // 모달 타이틀 업데이트
        const titleEl = document.getElementById('crm-modal-title');
        if (titleEl) titleEl.textContent = customer.name || '고객 상세';

        // 오버레이 표시 + 닫기 이벤트
        overlay.classList.remove('hidden');
        const closeBtn = document.getElementById('close-crm-panel');
        const closeModal = () => {
            overlay.classList.add('hidden');
            document.querySelectorAll('tr.bg-emerald-50').forEach(r => r.classList.remove('bg-emerald-50'));
        };
        if (closeBtn) closeBtn.onclick = closeModal;
        overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

        // 등급명 / 주소 / 연락처
        const gradeDisplayName = await getGradeDisplayName(customer.grade);
        const addressFull = [customer.address, customer.address_detail].filter(Boolean).join(' ') || '-';
        const phoneForTel = (customer.phone || '').replace(/[^0-9]/g, '');
        const telHref = phoneForTel ? `tel:${phoneForTel}` : '#';
        const smsPhone = escapeHtml(customer.phone || '');
        const smsName  = escapeHtml(customer.name || '');

        // 팝업 내부: 좌(프로필+태그+지표+액션) / 우(주문이력 + 타임라인) 2컬럼
        detailContent.innerHTML = `
            <div class="crm-popup-grid">

                <!-- ─── 좌: 프로필 + 태그 + 지표 + 액션 ─── -->
                <div style="display:flex;flex-direction:column;gap:12px;">

                    <!-- 프로필 카드 -->
                    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                            <div>
                                <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:4px;">${escapeHtml(customer.name || '-')}</div>
                                <span class="px-2 py-0.5 text-xs font-semibold rounded ${getGradeBadgeClass(customer.grade)}">${gradeDisplayName}</span>
                            </div>
                            <div style="display:flex;gap:4px;">
                                <button onclick="editCustomer('${customer.id}')" class="btn-icon btn-icon-edit" title="수정"><i class="fas fa-pen"></i></button>
                                <button onclick="deleteCustomer('${customer.id}')" class="btn-icon btn-icon-delete" title="삭제"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div style="font-size:13px;color:#4B5563;display:flex;flex-direction:column;gap:6px;">
                            <div><i class="fas fa-phone-alt" style="width:16px;color:#9CA3AF;"></i> ${escapeHtml(customer.phone || '-')}</div>
                            <div style="word-break:break-word;"><i class="fas fa-map-marker-alt" style="width:16px;color:#9CA3AF;"></i> ${escapeHtml(addressFull)}</div>
                            <div><i class="fas fa-calendar-alt" style="width:16px;color:#9CA3AF;"></i> 등록일 ${formatDate(customer.registration_date)}</div>
                        </div>
                    </div>

                    <!-- 태그 영역 -->
                    <div class="customer-tags-card">
                        <div class="customer-tags-header">
                            <span><i class="fas fa-tag" style="color:#9CA3AF;margin-right:6px;"></i>태그</span>
                            <span class="customer-tags-hint">Enter 로 추가</span>
                        </div>
                        <div id="customer-tags-chips" class="customer-tags-chips" data-customer-id="${customer.id}"></div>
                        <input type="text" id="customer-tag-input" class="customer-tag-input"
                               placeholder="예: 단골, VIP후보, 이탈위험" maxlength="20" autocomplete="off">
                    </div>

                    <!-- 핵심 지표 3개 -->
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                        <div style="background:white;border:1px solid #D1FAE5;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:16px;font-weight:700;color:#059669;" id="customer-total-purchase">—</div>
                            <div style="font-size:10px;color:#9CA3AF;margin-top:3px;">총 구매액</div>
                        </div>
                        <div style="background:white;border:1px solid #E5E7EB;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:16px;font-weight:700;color:#374151;" id="customer-order-count">—</div>
                            <div style="font-size:10px;color:#9CA3AF;margin-top:3px;">주문 횟수</div>
                        </div>
                        <div style="background:white;border:1px solid #FEF3C7;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:16px;font-weight:700;color:#D97706;" id="customer-loyalty-score">—</div>
                            <div style="font-size:10px;color:#9CA3AF;margin-top:3px;">단골 점수</div>
                        </div>
                    </div>

                    <!-- 액션 버튼 -->
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        <button type="button"
                            onclick="if(window.openCustomerSMSModal)window.openCustomerSMSModal('${smsPhone}','${smsName}');"
                            class="btn-secondary" style="width:100%;justify-content:center;">
                            <i class="fas fa-sms"></i> 문자 발송
                        </button>
                        <a href="${telHref}" class="btn-secondary" style="width:100%;justify-content:center;text-decoration:none;display:flex;align-items:center;gap:6px;">
                            <i class="fas fa-phone"></i> 전화 연결
                        </a>
                        <button type="button" data-action="order-add" data-customer-id="${customer.id}"
                            class="btn-primary" style="width:100%;justify-content:center;">
                            <i class="fas fa-cart-plus"></i> 주문 추가
                        </button>
                    </div>

                </div>

                <!-- ─── 우: 주문이력 + 타임라인 ─── -->
                <div style="display:flex;flex-direction:column;gap:12px;min-width:0;">

                    <!-- 주문 이력 -->
                    <div style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
                        <div style="padding:10px 14px;border-bottom:1px solid #E5E7EB;background:#F9FAFB;font-size:12px;font-weight:600;color:#374151;">
                            <i class="fas fa-receipt" style="color:#9CA3AF;margin-right:6px;"></i>주문 이력
                        </div>
                        <div style="overflow-y:auto;max-height:220px;background:white;">
                            <div id="customer-orders-list" style="font-size:12px;color:#9CA3AF;padding:12px;">불러오는 중...</div>
                        </div>
                    </div>

                    <!-- 타임라인 (로그) -->
                    <div class="customer-timeline-card" data-customer-id="${customer.id}">
                        <div class="customer-timeline-head">
                            <span><i class="fas fa-stream" style="color:#9CA3AF;margin-right:6px;"></i>타임라인</span>
                            <div class="customer-timeline-tabs" id="customer-timeline-tabs">
                                <button type="button" class="timeline-tab active" data-type="all">전체</button>
                                <button type="button" class="timeline-tab" data-type="memo">메모</button>
                                <button type="button" class="timeline-tab" data-type="call">통화</button>
                                <button type="button" class="timeline-tab" data-type="grade_change">등급</button>
                                <button type="button" class="timeline-tab" data-type="tag_change">태그</button>
                            </div>
                        </div>

                        <!-- 컴포저 — 타입 칩 + 제목 + 저장 (Enter 로 저장) -->
                        <div class="timeline-type-chips" id="customer-log-type-chips" role="radiogroup" aria-label="로그 타입">
                            <button type="button" class="type-chip active" data-type="memo"><i class="fas fa-sticky-note"></i> 메모</button>
                            <button type="button" class="type-chip" data-type="call"><i class="fas fa-phone"></i> 통화</button>
                            <button type="button" class="type-chip" data-type="order_note"><i class="fas fa-receipt"></i> 주문메모</button>
                            <button type="button" class="type-chip" data-type="etc"><i class="fas fa-ellipsis-h"></i> 기타</button>
                        </div>
                        <div class="customer-timeline-composer">
                            <input type="text" id="customer-log-title" class="input-ui"
                                   placeholder="한 줄 요약 — Enter 로 저장" maxlength="200">
                            <button type="button" id="customer-log-save-btn" class="btn-primary"
                                    style="white-space:nowrap;">
                                <i class="fas fa-plus"></i> 추가
                            </button>
                        </div>
                        <textarea id="customer-log-body"
                                  class="customer-timeline-body-input"
                                  placeholder="본문 (선택) — 길게 쓰려면 여기에"></textarea>

                        <!-- 리스트 -->
                        <div id="customer-timeline-list" class="customer-timeline-list">
                            <div class="customer-timeline-empty">불러오는 중...</div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        // 태그 UI 초기화
        initCustomerTagsUI(customer);

        // 타임라인 초기 로드
        const timelineCtx = { customerId: customer.id, currentType: 'all' };
        await reloadCustomerTimeline(timelineCtx);

        // 타임라인 탭 전환
        detailContent.querySelectorAll('#customer-timeline-tabs .timeline-tab').forEach(btn => {
            btn.addEventListener('click', async () => {
                detailContent.querySelectorAll('#customer-timeline-tabs .timeline-tab')
                    .forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                timelineCtx.currentType = btn.dataset.type;
                await reloadCustomerTimeline(timelineCtx);
            });
        });

        // 타입 칩 전환: 클릭 시 active 갱신 + 제목 input 포커스
        const chipsWrap = document.getElementById('customer-log-type-chips');
        const titleInput = document.getElementById('customer-log-title');
        if (chipsWrap) {
            chipsWrap.querySelectorAll('.type-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    chipsWrap.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    if (titleInput) titleInput.focus();
                });
            });
        }

        // 로그 저장 실행 (버튼·Enter 공용)
        const submitLog = async () => {
            const type  = chipsWrap?.querySelector('.type-chip.active')?.dataset.type || 'memo';
            const title = titleInput?.value.trim() || '';
            const body  = document.getElementById('customer-log-body')?.value.trim() || '';
            if (!title && !body) {
                if (window.showToast) window.showToast('제목 또는 본문을 입력하세요.', 2000);
                return;
            }
            try {
                await window.customerLogsManager.add(customer.id, {
                    log_type: type, title, body
                });
                if (titleInput) titleInput.value = '';
                const bodyEl = document.getElementById('customer-log-body');
                if (bodyEl) bodyEl.value = '';
                if (window.showToast) window.showToast('기록이 추가되었습니다.', 1500);
                await reloadCustomerTimeline(timelineCtx);
                if (titleInput) titleInput.focus();
            } catch (e) {
                console.error(e);
                if (window.showToast) window.showToast('기록 추가 실패: ' + (e.message || e), 3000);
            }
        };

        document.getElementById('customer-log-save-btn')?.addEventListener('click', submitLog);
        // 제목 칸에서 Enter = 저장 (body 는 Shift+Enter 없이 줄바꿈 자유)
        titleInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); submitLog(); }
        });

        // 주문 추가 이벤트
        detailContent.querySelector('[data-action="order-add"]')?.addEventListener('click', () => {
            if (typeof window.openOrderModal === 'function')
                window.openOrderModal(null, { customerId: customer.id, customerPhone: customer.phone, customerName: customer.name });
        });

        // 주문내역 로드
        loadCustomerOrders(customer.id);

    } catch (error) {
        console.error('❌ 고객 상세 팝업 업데이트 실패:', error);
    }
}

// ─────────────────────────────────────────────────────────────
// 태그 UI (chip 리스트 + 추가 input)
// ─────────────────────────────────────────────────────────────
function initCustomerTagsUI(customer) {
    const chipsEl = document.getElementById('customer-tags-chips');
    const inputEl = document.getElementById('customer-tag-input');
    if (!chipsEl || !inputEl) return;

    const current = Array.isArray(customer.tags) ? [...customer.tags] : [];

    const renderChips = () => {
        if (current.length === 0) {
            chipsEl.innerHTML = '<span class="customer-tags-empty">태그 없음</span>';
            return;
        }
        chipsEl.innerHTML = current.map((t, i) => `
            <span class="customer-tag-chip">
                ${escapeHtml(t)}
                <button type="button" class="customer-tag-remove" data-idx="${i}" title="삭제">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
        // 삭제 바인딩
        chipsEl.querySelectorAll('.customer-tag-remove').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idx = Number(btn.dataset.idx);
                const removed = current.splice(idx, 1)[0];
                renderChips();
                await persistTags(customer, current, { removed });
            });
        });
    };

    const addTag = async (raw) => {
        const tag = (raw || '').trim();
        if (!tag) return;
        if (tag.length > 20) {
            if (window.showToast) window.showToast('태그는 20자 이하로 입력하세요.', 2000);
            return;
        }
        if (current.includes(tag)) {
            if (window.showToast) window.showToast('이미 있는 태그입니다.', 1500);
            return;
        }
        current.push(tag);
        renderChips();
        inputEl.value = '';
        await persistTags(customer, current, { added: tag });
    };

    inputEl.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            await addTag(inputEl.value);
        }
    });

    renderChips();
}

async function persistTags(customer, tags, change = {}) {
    try {
        await window.customerDataManager.updateCustomer(customer.id, {
            ...customer,
            tags
        });
        // 메모리 반영
        customer.tags = [...tags];

        // 타임라인에 tag_change 로그 자동 기록
        if (change.added || change.removed) {
            const meta = {};
            if (change.added)   meta.added   = [change.added];
            if (change.removed) meta.removed = [change.removed];
            try {
                await window.customerLogsManager.add(customer.id, {
                    log_type: 'tag_change',
                    title: change.added ? `태그 추가: ${change.added}` : `태그 삭제: ${change.removed}`,
                    metadata: meta
                });
                // 타임라인 새로고침 (로그 탭이 열려 있을 때만 반영)
                const ctxCard = document.querySelector('.customer-timeline-card');
                if (ctxCard) {
                    const activeTab = ctxCard.querySelector('.timeline-tab.active');
                    const type = activeTab?.dataset.type || 'all';
                    if (type === 'all' || type === 'tag_change') {
                        await reloadCustomerTimeline({ customerId: customer.id, currentType: type });
                    }
                }
            } catch (e) {
                console.warn('⚠️ 태그 변경 로그 기록 실패:', e);
            }
        }
    } catch (e) {
        console.error('❌ 태그 저장 실패:', e);
        if (window.showToast) window.showToast('태그 저장 실패', 2500);
    }
}

// ─────────────────────────────────────────────────────────────
// 타임라인 렌더링
// ─────────────────────────────────────────────────────────────
async function reloadCustomerTimeline(ctx) {
    const listEl = document.getElementById('customer-timeline-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="customer-timeline-empty">불러오는 중...</div>';

    try {
        const rows = await window.customerLogsManager.list(ctx.customerId, {
            type: ctx.currentType,
            limit: 100
        });
        renderCustomerTimelineList(listEl, rows, ctx);
    } catch (e) {
        listEl.innerHTML = `<div class="customer-timeline-empty" style="color:var(--danger);">로드 실패: ${escapeHtml(e.message || String(e))}</div>`;
    }
}

function renderCustomerTimelineList(listEl, rows, ctx) {
    if (!rows || rows.length === 0) {
        listEl.innerHTML = '<div class="customer-timeline-empty">기록이 없습니다.</div>';
        return;
    }

    const META = (window.CustomerLogsManager && window.CustomerLogsManager.TYPE_META) || {};
    listEl.innerHTML = rows.map(row => {
        const m = META[row.log_type] || { label: row.log_type, icon: 'fa-circle', variant: 'neutral' };
        const when = formatLogWhen(row.created_at);
        const bodyHtml = row.body ? `<div class="timeline-row-body">${escapeHtml(row.body).replace(/\n/g, '<br>')}</div>` : '';
        const titleHtml = row.title ? `<div class="timeline-row-title">${escapeHtml(row.title)}</div>` : '';
        const metaExtra = renderTimelineMetadata(row);
        return `
            <div class="timeline-row" data-log-id="${row.id}">
                <div class="timeline-row-icon variant-${m.variant}">
                    <i class="fas ${m.icon}"></i>
                </div>
                <div class="timeline-row-main">
                    <div class="timeline-row-head">
                        <span class="badge badge-${m.variant}">${m.label}</span>
                        <span class="timeline-row-when">${when}</span>
                        <button type="button" class="timeline-row-del" data-log-id="${row.id}" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    ${titleHtml}
                    ${bodyHtml}
                    ${metaExtra}
                </div>
            </div>
        `;
    }).join('');

    // 삭제 바인딩
    listEl.querySelectorAll('.timeline-row-del').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('이 기록을 삭제하시겠습니까?')) return;
            try {
                await window.customerLogsManager.remove(btn.dataset.logId);
                await reloadCustomerTimeline(ctx);
            } catch (e) {
                if (window.showToast) window.showToast('삭제 실패: ' + (e.message || e), 2500);
            }
        });
    });
}

function renderTimelineMetadata(row) {
    const md = row.metadata || {};
    if (row.log_type === 'grade_change' && (md.old || md.new || md.old_label || md.new_label)) {
        const oldTxt = md.old_label || md.old || '?';
        const newTxt = md.new_label || md.new || '?';
        const reasonMap = { auto_period: '자동(기간)', manual: '수동', auto: '자동' };
        const reasonTxt = md.reason ? (reasonMap[md.reason] || md.reason) : '';
        const periodTxt = md.period && md.period !== 'all' ? ` · ${escapeHtml(md.period)}` : '';
        const amountTxt = typeof md.amount === 'number'
            ? ` · ${(md.amount || 0).toLocaleString()}원`
            : '';
        return `<div class="timeline-row-meta">${escapeHtml(oldTxt)} → <strong>${escapeHtml(newTxt)}</strong>${reasonTxt ? ' · ' + escapeHtml(reasonTxt) : ''}${periodTxt}${amountTxt}</div>`;
    }
    if (row.log_type === 'tag_change') {
        const parts = [];
        if (Array.isArray(md.added)   && md.added.length)   parts.push('+ ' + md.added.map(escapeHtml).join(', '));
        if (Array.isArray(md.removed) && md.removed.length) parts.push('− ' + md.removed.map(escapeHtml).join(', '));
        if (parts.length) return `<div class="timeline-row-meta">${parts.join(' / ')}</div>`;
    }
    if (row.log_type === 'call' && md.duration_sec) {
        return `<div class="timeline-row-meta">통화시간 ${Math.round(md.duration_sec/60)}분</div>`;
    }
    return '';
}

function formatLogWhen(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const now = new Date();
        const sameDay = d.toDateString() === now.toDateString();
        if (sameDay) {
            return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
             + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return iso;
    }
}

// reloadCustomerTimeline 을 빠른 다이얼로그에서도 호출 가능하도록 전역 노출
window.reloadCustomerTimeline = reloadCustomerTimeline;

// ─────────────────────────────────────────────────────────────
// 빠른 통화 로그 다이얼로그 (고객 목록 행의 📞 버튼에서 호출)
// 목표: 최소 클릭(행 버튼 → 제목 타이핑 → Enter)으로 저장
// ─────────────────────────────────────────────────────────────
window.openQuickCallLog = function(customerId, customerName, customerPhone) {
    const modal   = document.getElementById('quick-call-log-modal');
    if (!modal) {
        console.warn('⚠️ quick-call-log-modal 요소를 찾을 수 없습니다.');
        return;
    }
    const titleEl = document.getElementById('quick-call-log-title');
    const metaEl  = document.getElementById('quick-call-log-meta');
    const ttl     = document.getElementById('quick-call-log-title-input');
    const body    = document.getElementById('quick-call-log-body-input');

    if (titleEl) titleEl.textContent = `통화 기록 — ${customerName || ''}`;
    if (metaEl) {
        metaEl.innerHTML = customerPhone
            ? `<i class="fas fa-phone-alt" style="margin-right:4px;"></i>${escapeHtml(customerPhone)}`
            : '';
    }
    if (ttl)  ttl.value = '';
    if (body) body.value = '';
    modal.classList.remove('hidden');
    setTimeout(() => ttl?.focus(), 30);

    const close = () => modal.classList.add('hidden');

    const save = async () => {
        const t = (ttl?.value || '').trim();
        const b = (body?.value || '').trim();
        if (!t && !b) {
            if (window.showToast) window.showToast('요약 또는 내용을 입력하세요.', 2000);
            return;
        }
        try {
            await window.customerLogsManager.add(customerId, {
                log_type: 'call',
                title: t,
                body: b
            });
            if (window.showToast) window.showToast('통화 기록 저장됨', 1500);
            close();

            // 상세 모달이 이 고객으로 열려 있으면 타임라인 새로고침
            const panelCard = document.querySelector('.customer-timeline-card');
            if (panelCard && panelCard.dataset.customerId === customerId) {
                const activeTab = panelCard.querySelector('.timeline-tab.active');
                const type = activeTab?.dataset.type || 'all';
                if (type === 'all' || type === 'call') {
                    await window.reloadCustomerTimeline({ customerId, currentType: type });
                }
            }
        } catch (e) {
            console.error(e);
            if (window.showToast) window.showToast('저장 실패: ' + (e.message || e), 2500);
        }
    };

    // 핸들러 바인딩 (onclick 덮어써서 중복 리스너 방지)
    document.getElementById('quick-call-log-close').onclick  = close;
    document.getElementById('quick-call-log-cancel').onclick = close;
    document.getElementById('quick-call-log-save').onclick   = save;
    if (ttl) {
        ttl.onkeydown = (e) => {
            if (e.key === 'Escape') { close(); }
            else if (e.key === 'Enter') { e.preventDefault(); save(); }
        };
    }
    if (body) {
        body.onkeydown = (e) => { if (e.key === 'Escape') close(); };
    }
    modal.onclick = (e) => { if (e.target === modal) close(); };
};

// 고객 핵심 지표 업데이트: 총 구매액 · 주문 횟수 · 단골 점수 (주문 배열 기준)
function updateCustomerTotalPurchaseDisplay(orders) {
    const list = orders || [];
    const total = list.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const count = list.length;
    const loyaltyScore = count * 10; // 단골 점수: 주문 횟수 × 10 (간단 규칙)
    const totalEl = document.getElementById('customer-total-purchase');
    const countEl = document.getElementById('customer-order-count');
    const scoreEl = document.getElementById('customer-loyalty-score');
    if (totalEl) totalEl.textContent = total > 0 ? formatCurrency(total) : '—';
    if (countEl) countEl.textContent = count > 0 ? String(count) + '회' : '—';
    if (scoreEl) scoreEl.textContent = count > 0 ? String(loyaltyScore) + '점' : '—';
}

// 고객 주문내역 로드 함수
async function loadCustomerOrders(customerId) {
    try {
        console.log('🛒 고객 주문내역 로드:', customerId);
        
        const ordersList = document.getElementById('customer-orders-list');
        if (!ordersList) {
            console.error('❌ 주문내역 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 고객 정보 조회 (ID로 고객 정보 가져오기)
        if (!window.customerDataManager) {
            throw new Error('customerDataManager를 찾을 수 없습니다.');
        }
        
        const customer = window.customerDataManager.getCustomerById(customerId);
        if (!customer) {
            throw new Error('고객 정보를 찾을 수 없습니다.');
        }
        
        console.log('👤 고객 정보 확인:', customer.name, customer.phone);
        console.log('🔍 고객 전화번호 형식:', customer.phone, typeof customer.phone);
        
        // Supabase에서 주문 데이터 로드
        if (!window.supabase || !window.supabaseClient) {
            throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
        }
        
        // 전화번호 정규화 (하이픈 제거, 공백 제거)
        const normalizedPhone = customer.phone.replace(/[-\s]/g, '');

        const { data: ordersData, error } = await window.supabaseClient
            .from('farm_orders')
            .select('*, farm_order_items(*)')
            .or(`customer_phone.eq.${customer.phone},customer_phone.eq.${normalizedPhone}`)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('❌ 주문내역 로드 실패:', error);
            throw new Error(`주문내역 로드 실패: ${error.message}`);
        }

        const orders = ordersData || [];
        orders.forEach(o => { o.items = o.farm_order_items || []; });
        
        // 전화번호 매칭이 안되는 경우 다른 방법으로 시도
        if (orders.length === 0) {
            console.log('🔄 전화번호 매칭 실패, 대안 방법들 시도...');
            
            // 1. 고객명으로 검색
            const { data: ordersByName, error: nameError } = await window.supabaseClient
                .from('farm_orders')
                .select('*, farm_order_items(*)')
                .eq('customer_name', customer.name)
                .order('order_date', { ascending: false });

            if (!nameError && ordersByName && ordersByName.length > 0) {
                ordersByName.forEach(o => { o.items = o.farm_order_items || []; });
                updateCustomerTotalPurchaseDisplay(ordersByName);
                await renderCustomerOrders(ordersByName, ordersList);
                return;
            }
            
            // 2. 전화번호 형식 변환 후 재시도
            console.log('🔍 전화번호 형식 변환 후 재시도...');
            const phoneVariations = [
                customer.phone,
                customer.phone.replace(/[^0-9]/g, ''), // 숫자만
                customer.phone.replace(/[^0-9]/g, '').replace(/^0/, ''), // 앞자리 0 제거
                customer.phone.replace(/[^0-9]/g, '').replace(/^82/, '0'), // 82를 0으로
                customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '82'), // 0을 82로
            ].filter((phone, index, arr) => arr.indexOf(phone) === index); // 중복 제거
            
            console.log('📞 시도할 전화번호 형식들:', phoneVariations);
            
            for (const phoneFormat of phoneVariations) {
                if (phoneFormat && phoneFormat !== customer.phone) {
                    const { data: ordersByPhone, error: phoneError } = await window.supabaseClient
                        .from('farm_orders')
                        .select('*, farm_order_items(*)')
                        .eq('customer_phone', phoneFormat)
                        .order('order_date', { ascending: false });

                    if (!phoneError && ordersByPhone && ordersByPhone.length > 0) {
                        ordersByPhone.forEach(o => { o.items = o.farm_order_items || []; });
                        updateCustomerTotalPurchaseDisplay(ordersByPhone);
                        await renderCustomerOrders(ordersByPhone, ordersList);
                        return;
                    }
                }
            }
            
            // 3. 부분 매칭으로 검색 (LIKE 사용)
            console.log('🔍 부분 매칭으로 검색...');
            const phoneDigits = customer.phone.replace(/[^0-9]/g, '');
            if (phoneDigits.length >= 8) { // 최소 8자리 이상일 때만
                const { data: ordersByPartial, error: partialError } = await window.supabaseClient
                    .from('farm_orders')
                    .select('*, farm_order_items(*)')
                    .like('customer_phone', `%${phoneDigits.slice(-8)}%`)
                    .order('order_date', { ascending: false });

                if (!partialError && ordersByPartial && ordersByPartial.length > 0) {
                    ordersByPartial.forEach(o => { o.items = o.farm_order_items || []; });
                    updateCustomerTotalPurchaseDisplay(ordersByPartial);
                    await renderCustomerOrders(ordersByPartial, ordersList);
                    return;
                }
            }
            
            console.log('❌ 모든 매칭 방법 실패');
            updateCustomerTotalPurchaseDisplay([]);
            await renderCustomerOrders([], ordersList);
            return;
        }
        
        // 주문내역 렌더링
        updateCustomerTotalPurchaseDisplay(orders);
        await renderCustomerOrders(orders, ordersList);
        
    } catch (error) {
        console.error('❌ 고객 주문내역 로드 실패:', error);
        updateCustomerTotalPurchaseDisplay([]);
        const ordersList = document.getElementById('customer-orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div class="text-center py-8 text-danger">
                    <div class="w-12 h-12 bg-danger-accent rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-danger text-lg"></i>
                    </div>
                    <p class="text-sm">주문내역을 불러올 수 없습니다.</p>
                    <p class="text-xs text-muted mt-1">오류: ${error.message}</p>
                </div>
            `;
        }
    }
}

// 고객 주문내역 렌더링 함수
async function renderCustomerOrders(orders, container) {
    try {
        console.log('🎨 고객 주문내역 렌더링:', orders.length);
        
        if (orders.length === 0) {
            container.innerHTML = `<p class="text-xs text-muted py-3 px-2 text-center">주문 내역이 없습니다.</p>`;
            return;
        }
        
        // order.items는 loadCustomerOrders에서 farm_order_items로 pre-attach됨
        const ordersWithItems = orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const itemsInfo = items.length > 0
                ? items.map(item => {
                    const name = item.product_name || item.name || '상품명 없음';
                    const quantity = item.quantity || 1;
                    return `${name} × ${quantity}`;
                  }).join(', ')
                : '상품 정보 없음';
            return { ...order, itemsInfo };
        });
        
        // 주문 이력 테이블: 주문일 | 상품명 | 금액 | 상태 (보기 링크 포함)
        const rowsHTML = ordersWithItems.map(order => {
            const orderDate = order.order_date ? formatDate(order.order_date) : '-';
            const totalAmount = order.total_amount != null ? formatCurrency(order.total_amount) : '₩0';
            const status = order.order_status || '주문접수';
            const orderId = order.id;
            const productSummary = (order.itemsInfo || '상품 정보 없음').slice(0, 80) + (order.itemsInfo && order.itemsInfo.length > 80 ? '…' : '');
            return `
                <tr>
                    <td class="px-2 td-secondary whitespace-nowrap">${orderDate}</td>
                    <td class="px-2 td-primary max-w-[180px] truncate" title="${escapeHtml(order.itemsInfo || '')}">${escapeHtml(productSummary)}</td>
                    <td class="px-2 td-amount text-right text-numeric whitespace-nowrap">${totalAmount}</td>
                    <td class="px-2"><span class="badge ${getOrderStatusBadgeClass(status)}">${status}</span></td>
                    <td class="px-2 text-center whitespace-nowrap">
                        <button type="button" onclick="typeof window.openOrderDetailModal === 'function' ? window.openOrderDetailModal('${orderId}') : window.openOrderModal && window.openOrderModal('${orderId}')" class="text-brand hover:underline text-xs">보기</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = `
            <table class="table-ui">
                <thead>
                    <tr>
                        <th>주문일</th>
                        <th>상품명</th>
                        <th class="th-num">금액</th>
                        <th>상태</th>
                        <th class="text-center w-12">보기</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        `;
        
        console.log('✅ 고객 주문내역 렌더링 완료');
        
    } catch (error) {
        console.error('❌ 고객 주문내역 렌더링 실패:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-danger">
                <div class="w-12 h-12 bg-danger-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-exclamation-triangle text-danger text-lg"></i>
                </div>
                <p class="text-sm">주문내역을 표시할 수 없습니다.</p>
            </div>
        `;
    }
}

// 주문 상태 배지 — 통제실 renderOrderStatusBadge 사용
// 이 함수는 legacy 호출 호환용으로만 유지 (클래스 반환 방식)
function getOrderStatusBadgeClass(status) {
    const MAP = {
        '주문접수': 'badge-info',
        '주문확인': 'badge-warning',
        '배송준비': 'badge-purple',
        '배송중':   'badge-orange',
        '배송완료': 'badge-success',
        '주문취소': 'badge-danger',
    };
    return MAP[status] || 'badge-neutral';
}

// 고객 기본 정보 업데이트
async function updateCustomerBasicInfo(customer) {
    console.log('📝 고객 기본 정보 업데이트:', customer.name);
    
    // 고객명
    const nameElement = document.getElementById('customer-detail-name');
    if (nameElement) {
        nameElement.textContent = customer.name || '이름 없음';
    }
    
    // 고객 등급
    const gradeElement = document.getElementById('customer-detail-grade');
    if (gradeElement) {
        gradeElement.textContent = await getGradeDisplayName(customer.grade);
        gradeElement.className = `inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getGradeBadgeClass(customer.grade)}`;
    }
    
    // 고객 아이콘 (등급에 따라 변경)
    const iconElement = document.getElementById('customer-detail-icon');
    if (iconElement) {
        if (customer.grade === 'VIP') {
            iconElement.className = 'fas fa-crown text-lg text-warn';
        } else {
            iconElement.className = 'fas fa-user text-lg text-brand';
        }
    }
    
    // 수정 버튼 이벤트 연결
    const editBtn = document.getElementById('edit-customer-btn');
    if (editBtn) {
        editBtn.onclick = () => {
            if (window.orderSystem) {
                window.orderSystem.openCustomerModal(customer.id);
            }
        };
    }
    
    // 연락처 정보 업데이트
    const phoneElement = document.getElementById('customer-detail-phone');
    if (phoneElement) {
        phoneElement.textContent = customer.phone || '전화번호 없음';
    }
    
    const emailElement = document.getElementById('customer-detail-email');
    if (emailElement) {
        emailElement.textContent = customer.email || '이메일 없음';
    }
    
    const addressElement = document.getElementById('customer-detail-address');
    if (addressElement) {
    addressElement.textContent = [customer.address, customer.address_detail].filter(Boolean).join(' ') || '주소 없음';
    }
    
    const memoElement = document.getElementById('customer-detail-memo');
    if (memoElement) {
        memoElement.textContent = customer.memo || '메모 없음';
    }
    
    const registrationDateElement = document.getElementById('customer-detail-registration-date');
    if (registrationDateElement) {
        registrationDateElement.textContent = formatDate(customer.registration_date) || '등록일 없음';
    }
}

// 고객 통계 정보 업데이트
function updateCustomerStats(customer) {
    console.log('📊 고객 통계 정보 업데이트:', customer.name);
    
    // 임시 통계 데이터 (실제로는 주문 데이터에서 계산)
    const stats = {
        totalOrders: 0,
        totalAmount: 0,
        lastOrderDate: '없음'
    };
    
    // 통계 정보를 HTML에 업데이트
    const statsElements = document.querySelectorAll('[id^="customer-stat-"]');
    statsElements.forEach(element => {
        const statType = element.id.replace('customer-stat-', '');
        switch(statType) {
            case 'orders':
                element.textContent = stats.totalOrders;
                break;
            case 'amount':
                element.textContent = formatCurrency(stats.totalAmount);
                break;
            case 'last-order':
                element.textContent = stats.lastOrderDate;
                break;
        }
    });
}

// 고객 주문 내역 업데이트
function updateCustomerOrders(customer) {
    console.log('📦 고객 주문 내역 업데이트:', customer.name);
    
    // 주문 내역 컨테이너
    const ordersContainer = document.getElementById('customer-orders-content');
    if (ordersContainer) {
        ordersContainer.innerHTML = `
            <div class="text-center py-8 text-muted">
                <i class="fas fa-shopping-cart text-4xl mb-4 text-gray-300"></i>
                <h3 class="text-lg font-medium mb-2 text-body">주문 내역이 없습니다</h3>
                <p class="text-sm text-muted">${customer.name}님의 주문 기록이 아직 없습니다.</p>
            </div>
        `;
    }
}

// 선택된 고객 행 하이라이트
function highlightSelectedCustomerRow(customerId) {
    console.log('🎯 선택된 고객 행 하이라이트:', customerId);
    
    // 모든 행의 하이라이트 제거
    const allRows = document.querySelectorAll('[data-customer-id]');
    allRows.forEach(row => {
        row.classList.remove('bg-blue-50', 'border-blue-200');
        row.classList.add('hover:bg-gray-50');
    });
    
    // 선택된 행 하이라이트
    const selectedRow = document.querySelector(`[data-customer-id="${customerId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('bg-blue-50', 'border-blue-200');
        selectedRow.classList.remove('hover:bg-gray-50');
    }
}

// 모달용 고객 기본 정보 업데이트
async function updateCustomerModalBasicInfo(customer) {
    console.log('📝 모달 고객 기본 정보 업데이트:', customer.name);
    
    // 고객명
    const nameElement = document.getElementById('customer-detail-modal-name');
    if (nameElement) {
        nameElement.textContent = customer.name || '이름 없음';
    }
    
    // 고객 등급
    const gradeElement = document.getElementById('customer-detail-modal-grade');
    if (gradeElement) {
        gradeElement.textContent = await getGradeDisplayName(customer.grade);
        gradeElement.className = `inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getGradeBadgeClass(customer.grade)}`;
    }
    
    // 고객 아이콘 (등급에 따라 변경)
    const iconElement = document.getElementById('customer-detail-modal-icon');
    if (iconElement) {
        if (customer.grade === 'VIP') {
            iconElement.className = 'fas fa-crown text-lg text-warn';
        } else {
            iconElement.className = 'fas fa-user text-lg text-info';
        }
    }
    
    // 수정 버튼 이벤트 연결
    const editBtn = document.getElementById('edit-customer-from-detail');
    if (editBtn) {
        editBtn.onclick = () => {
            // 모달 닫기
            closeCustomerDetailModal();
            // 수정 모달 열기
            if (window.orderSystem) {
                window.orderSystem.openCustomerModal(customer.id);
            }
        };
    }
    
    // 연락처 정보 업데이트
    const phoneElement = document.getElementById('customer-detail-modal-phone');
    if (phoneElement) {
        phoneElement.textContent = customer.phone || '전화번호 없음';
    }
    
    
    const addressElement = document.getElementById('customer-detail-modal-address');
    if (addressElement) {
        addressElement.textContent = [customer.address, customer.address_detail].filter(Boolean).join(' ') || '주소 없음';
    }
    
    const memoElement = document.getElementById('customer-detail-modal-memo');
    if (memoElement) {
        memoElement.textContent = customer.memo || '메모 없음';
    }
    
    const registrationDateElement = document.getElementById('customer-detail-modal-registration-date');
    if (registrationDateElement) {
        registrationDateElement.textContent = customer.registration_date || '등록일 없음';
    }
}

// 모달용 고객 통계 정보 업데이트
function updateCustomerModalStats(customer) {
    console.log('📊 모달 고객 통계 정보 업데이트:', customer.name);
    
    // 임시 통계 데이터 (실제로는 주문 데이터에서 계산)
    const stats = {
        totalOrders: 0,
        totalAmount: 0,
        lastOrderDate: '없음'
    };
    
    // 통계 정보를 모달 HTML에 업데이트
    const ordersElement = document.getElementById('customer-detail-modal-orders');
    if (ordersElement) {
        ordersElement.textContent = stats.totalOrders;
    }
    
    const amountElement = document.getElementById('customer-detail-modal-amount');
    if (amountElement) {
        amountElement.textContent = formatCurrency(stats.totalAmount);
    }
    
    const lastOrderElement = document.getElementById('customer-detail-modal-last-order');
    if (lastOrderElement) {
        lastOrderElement.textContent = stats.lastOrderDate;
    }
}

// 모달용 고객 주문 내역 업데이트
function updateCustomerModalOrders(customer) {
    console.log('📦 모달 고객 주문 내역 업데이트:', customer.name);
    
    // 주문 내역 컨테이너
    const ordersContainer = document.getElementById('customer-detail-modal-orders-content');
    if (ordersContainer) {
        ordersContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-shopping-cart text-2xl mb-2 text-gray-300"></i>
                <h3 class="text-sm font-medium mb-1 text-body">주문 내역이 없습니다</h3>
                <p class="text-xs text-muted">${customer.name}님의 주문 기록이 아직 없습니다.</p>
            </div>
        `;
    }
}

// 고객 상세 정보 모달 닫기
function closeCustomerDetailModal() {
    console.log('🚪 고객 상세 정보 모달 닫기');
    const modal = document.getElementById('customer-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 모달 닫기 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 모달 닫기 버튼
    const closeBtn = document.getElementById('close-customer-detail-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCustomerDetailModal);
    }
    
    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById('customer-detail-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCustomerDetailModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('customer-detail-modal');
            if (modal && !modal.classList.contains('hidden')) {
                closeCustomerDetailModal();
            }
        }
    });
});

// 고객등급 옵션 동적 로드
async function loadCustomerGradeOptions() {
    try {
        console.log('⚙️ 고객등급 옵션 로드 중...');
        
        const gradeSelect = document.getElementById('customer-form-grade');
        if (!gradeSelect) {
            console.warn('⚠️ 고객등급 선택 요소를 찾을 수 없습니다');
            return;
        }
        
        // 환경설정에서 고객등급 정보 로드
        const grades = await loadCustomerGradesFromSettings();
        
        // 기존 옵션 제거
        gradeSelect.innerHTML = '';
        
        // 새로운 옵션 추가
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.code;
            option.textContent = `${getGradeEmoji(grade.code)} ${grade.name}`;
            gradeSelect.appendChild(option);
        });
        
        console.log('✅ 고객등급 옵션 로드 완료:', grades.length + '개');
        
    } catch (error) {
        console.error('❌ 고객등급 옵션 로드 실패:', error);
    }
}

// 등급별 이모지 반환
function getGradeEmoji(grade) {
    const emojis = {
        'GENERAL': '🙋‍♂️',
        'GREEN_LEAF': '🟢',
        'RED_RUBY': '🔴',
        'PURPLE_EMPEROR': '🟣',
        'BLACK_DIAMOND': '💎'
    };
    return emojis[grade] || '⭐';
}

// 고객 모달 열기 함수
export async function openCustomerModal(customerId = null, tempName = null, callback = null) {
    try {
        console.log('📂 고객 모달 열기 시작...');
        
        // 콜백 함수 저장
        if (callback) {
            window.customerModalCallback = callback;
        }
        
        // 모달이 없으면 동적으로 로드
        let modal = document.getElementById('customer-modal');
        if (!modal) {
            console.log('📦 고객 모달이 없습니다. 동적 로드 시작...');
            try {
                if (window.loadCustomerModal) {
                    await window.loadCustomerModal();
                    modal = document.getElementById('customer-modal');
                    console.log('🔍 로드된 모달 요소:', modal);
                    
                    if (!modal) {
                        console.error('❌ 고객 모달 로드 실패');
                        alert('고객 등록 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                        return;
                    }
                } else {
                    console.error('❌ loadCustomerModal 함수를 찾을 수 없습니다');
                    alert('고객 등록 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                    return;
                }
            } catch (loadError) {
                console.error('❌ 고객 모달 로드 중 오류:', loadError);
                alert('고객 등록 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
                return;
            }
        }
        
        // 모달 표시
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        // 모달 콘텐츠는 이미 올바른 상태로 설정되어 있음
        console.log('✅ 모달 표시 완료');
        
        // 새 고객 모드: 탭 숨기기 + 모달 크기 원복
        const tabsEl = document.getElementById('customer-modal-tabs');
        if (tabsEl) { tabsEl.style.display = 'none'; tabsEl.classList.add('hidden'); }
        const modalContentEl = document.getElementById('customer-modal-content');
        if (modalContentEl) {
            modalContentEl.classList.remove('modal-md');
            modalContentEl.classList.add('modal-sm');
        }
        // 정보 탭 활성화 (주문이력 패널 숨김)
        window.switchCustomerTab?.('info');

        // 모달 내용 초기화
        document.getElementById('customer-modal-title').textContent = '새 고객 등록';
        document.getElementById('customer-form').reset();
        document.getElementById('customer-id').value = '';
        
        // 임시 저장된 고객명이 있으면 자동으로 채우기
        if (tempName || window.tempCustomerName) {
            const customerNameField = document.getElementById('customer-form-name');
            if (customerNameField) {
                customerNameField.value = tempName || window.tempCustomerName;
                console.log('📝 임시 저장된 고객명 자동 입력:', tempName || window.tempCustomerName);
            }
        }
        
        // 중복 확인 메시지 숨기기
        const phoneDuplicateMessage = document.getElementById('phone-duplicate-message');
        if (phoneDuplicateMessage) {
            phoneDuplicateMessage.classList.add('hidden');
        }
        
        // 등록일 자동 설정
        const today = new Date().toISOString().split('T')[0];
        const registrationDateField = document.getElementById('customer-form-registration-date');
        if (registrationDateField) {
            registrationDateField.value = today;
        }
        
        // 고객등급 옵션 동적 로드
        await loadCustomerGradeOptions();
        
        // 저장 이벤트(중복 방지 + 즉시 disabled) 바인딩
        initCustomerModalSaveHandlers();

        // 추가 정보 섹션 초기화 (접힌 상태)
        resetExtraInfoSection();

        // 상태 버튼 초기화 (활성)
        window.setCustomerStatus('ACTIVE');

        // 메모 글자수 초기화
        window.updateMemoCharCount('');

        // 이름 필드 자동 포커스
        setTimeout(() => {
            const nameField = document.getElementById('customer-form-name');
            if (nameField) nameField.focus();
        }, 80);

        // Ctrl+Enter 저장 단축키
        const modalContent = document.getElementById('customer-modal-content');
        if (modalContent) {
            modalContent.onkeydown = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    const saveBtn = document.getElementById('customer-save-btn');
                    if (saveBtn && !saveBtn.disabled) saveBtn.click();
                }
            };
        }

        console.log('✅ 고객 모달 열기 완료');
        
    } catch (error) {
        console.error('❌ 고객 모달 열기 실패:', error);
    }
}

// 고객명 자동완성 관련 변수
let autocompleteTimeout = null;
let selectedAutocompleteIndex = -1;

// 고객명 자동완성 기능
function handleCustomerNameInput(value) {
    try {
        console.log('🔍 고객명 입력:', value);
        
        // 이전 타이머 클리어
        if (autocompleteTimeout) {
            clearTimeout(autocompleteTimeout);
        }
        
        // 입력값이 1글자 이상일 때만 자동완성 검색
        if (value.trim().length >= 1) {
            // 300ms 후에 자동완성 검색 실행 (타이핑 중단 시)
            autocompleteTimeout = setTimeout(async () => {
                await searchCustomerNames(value.trim());
            }, 300);
        } else {
            // 입력값이 없으면 자동완성 숨기기
            hideAutocomplete();
        }
        
    } catch (error) {
        console.error('❌ 고객명 입력 처리 실패:', error);
    }
}

// 고객명 자동완성 포커스 처리
async function handleCustomerNameFocus(value) {
    try {
        console.log('🎯 고객명 포커스:', value);
        
        // 입력값이 있으면 자동완성 표시
        if (value.trim().length >= 1) {
            await searchCustomerNames(value.trim());
        }
        
    } catch (error) {
        console.error('❌ 고객명 포커스 처리 실패:', error);
    }
}

// 고객명 자동완성 블러 처리
function handleCustomerNameBlur() {
    try {
        console.log('👁️ 고객명 블러');
        
        // 약간의 지연을 두고 자동완성 숨기기 (클릭 이벤트가 먼저 실행되도록)
        setTimeout(() => {
            hideAutocomplete();
        }, 150);
        
    } catch (error) {
        console.error('❌ 고객명 블러 처리 실패:', error);
    }
}

// 고객명 검색 및 자동완성 표시
async function searchCustomerNames(searchTerm) {
    try {
        console.log('🔍 고객명 검색:', searchTerm);
        
        if (!window.customerDataManager) {
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
            return;
        }
        
        const customers = window.customerDataManager.getAllCustomers();
        console.log('📊 전체 고객 수:', customers.length);
        
        // 검색어로 시작하는 고객명 필터링 (대소문자 구분 없음)
        const matchingCustomers = customers.filter(customer => 
            customer.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
        
        console.log('🎯 매칭된 고객 수:', matchingCustomers.length);
        
        if (matchingCustomers.length > 0) {
            await showAutocomplete(matchingCustomers, searchTerm);
        } else {
            hideAutocomplete();
        }
        
    } catch (error) {
        console.error('❌ 고객명 검색 실패:', error);
    }
}

// 자동완성 드롭다운 표시
async function showAutocomplete(customers, searchTerm) {
    try {
        const autocompleteDiv = document.getElementById('customer-name-autocomplete');
        if (!autocompleteDiv) {
            console.warn('⚠️ 자동완성 드롭다운을 찾을 수 없습니다');
            return;
        }
        
        // 자동완성 항목 생성
        let html = '';
        for (const customer of customers) {
            const highlightedName = highlightSearchTerm(customer.name, searchTerm);
            // 환경설정에서 등급명 가져오기
            const gradeDisplayName = await getGradeDisplayName(customer.grade);
            
            html += `
                <div class="autocomplete-item px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                     data-customer-id="${customer.id}" 
                     data-customer-name="${customer.name}"
                     data-customer-phone="${customer.phone}"
                     data-customer-grade="${customer.grade}"
                     onclick="selectAutocompleteItem(this)">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="font-medium text-heading">${highlightedName}</div>
                            <div class="text-xs text-secondary">${customer.phone} • ${gradeDisplayName}</div>
                        </div>
                        <div class="text-xs text-muted">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                </div>
            `;
        }
        
        autocompleteDiv.innerHTML = html;
        autocompleteDiv.classList.remove('hidden');
        
        // 선택된 인덱스 초기화
        selectedAutocompleteIndex = -1;
        
        console.log('✅ 자동완성 드롭다운 표시 완료');
        
    } catch (error) {
        console.error('❌ 자동완성 표시 실패:', error);
    }
}

// 자동완성 드롭다운 숨기기
function hideAutocomplete() {
    try {
        const autocompleteDiv = document.getElementById('customer-name-autocomplete');
        if (autocompleteDiv) {
            autocompleteDiv.classList.add('hidden');
            autocompleteDiv.innerHTML = '';
        }
        selectedAutocompleteIndex = -1;
    } catch (error) {
        console.error('❌ 자동완성 숨기기 실패:', error);
    }
}

// 자동완성 항목 선택
function selectAutocompleteItem(element) {
    try {
        console.log('✅ 자동완성 항목 선택:', element);
        
        const customerName = element.getAttribute('data-customer-name');
        const customerPhone = element.getAttribute('data-customer-phone');
        const customerGrade = element.getAttribute('data-customer-grade');
        
        // 고객명 입력 필드에 값 설정
        const nameInput = document.getElementById('customer-form-name');
        if (nameInput) {
            nameInput.value = customerName;
        }
        
        // 전화번호도 자동으로 채우기 (선택사항)
        const phoneInput = document.getElementById('customer-form-phone');
        if (phoneInput && customerPhone) {
            phoneInput.value = customerPhone;
        }
        
        // 등급도 자동으로 설정 (선택사항)
        const gradeSelect = document.getElementById('customer-form-grade');
        if (gradeSelect && customerGrade) {
            gradeSelect.value = customerGrade;
        }
        
        // 자동완성 숨기기
        hideAutocomplete();
        
        // 포커스를 전화번호 필드로 이동
        if (phoneInput) {
            phoneInput.focus();
        }
        
        console.log('✅ 자동완성 선택 완료');
        
    } catch (error) {
        console.error('❌ 자동완성 선택 실패:', error);
    }
}

// 검색어 하이라이트
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200 font-semibold">$1</span>');
}



// 고객명 중복 검사 및 제안 함수
function checkCustomerNameDuplicate(customerName, excludeCustomerId = null) {
    try {
        console.log('🔍 고객명 중복 검사:', customerName, '제외 ID:', excludeCustomerId);
        
        if (!window.customerDataManager) {
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
            return false;
        }
        
        const customers = window.customerDataManager.getAllCustomers();
        // 수정 모드인 경우 자기 자신을 제외하고 검사
        const existingCustomer = customers.find(c => 
            c.name === customerName.trim() && c.id !== excludeCustomerId
        );
        
        if (existingCustomer) {
            console.log('⚠️ 중복된 고객명 발견:', existingCustomer);
            
            // 수정 모드인 경우 다른 메시지 표시
            if (excludeCustomerId) {
                const message = `"${customerName}" 이름의 다른 고객이 이미 등록되어 있습니다.\n\n기존 고객 정보:\n- 전화번호: ${existingCustomer.phone}\n- 등급: ${existingCustomer.grade}\n- 등록일: ${existingCustomer.registration_date}\n\n정말로 수정하시겠습니까?`;
                
                const choice = confirm(message + '\n\n확인: 수정 계속\n취소: 수정 취소');
                
                if (choice) {
                    console.log('✅ 사용자가 수정 계속하기로 선택');
                    return true; // 계속 진행
                } else {
                    console.log('❌ 사용자가 수정 취소');
                    return false; // 취소
                }
            } else {
                // 등록 모드 - 같은 이름이 있어도 전화번호가 다르면 등록 허용 (확인만)
                const message = `"${customerName}" 이름의 고객이 이미 등록되어 있습니다.\n\n기존 고객 정보:\n- 전화번호: ${existingCustomer.phone}\n- 등급: ${existingCustomer.grade}\n\n다른 사람이 맞으면 확인을 눌러 계속 등록하세요.`;
                return confirm(message); // 확인 → 계속, 취소 → 중단
            }
        }
        
        console.log('✅ 고객명 중복 없음');
        return true; // 중복 없음, 계속 진행
        
    } catch (error) {
        console.error('❌ 고객명 중복 검사 실패:', error);
        return true; // 오류 시 계속 진행
    }
}

// 고객명 중복 검사 함수를 전역으로 등록
window.checkCustomerNameDuplicate = checkCustomerNameDuplicate;
// formatPhoneNumber: utils/formatters.js의 window.fmt.phone / window.formatPhone 사용
window.formatPhoneNumber = function(input) {
    if (!input) return;
    const formatted = (window.fmt && window.fmt.phone)
        ? window.fmt.phone(input.value)
        : (window.formatPhone ? window.formatPhone(input.value) : input.value);
    input.value = formatted;
};

// 키보드 네비게이션 처리
function handleCustomerNameKeydown(event) {
    try {
        const autocompleteDiv = document.getElementById('customer-name-autocomplete');
        if (!autocompleteDiv || autocompleteDiv.classList.contains('hidden')) {
            return;
        }
        
        const items = autocompleteDiv.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, items.length - 1);
                updateAutocompleteSelection(items);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
                updateAutocompleteSelection(items);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < items.length) {
                    selectAutocompleteItem(items[selectedAutocompleteIndex]);
                }
                break;
                
            case 'Escape':
                event.preventDefault();
                hideAutocomplete();
                break;
        }
        
    } catch (error) {
        console.error('❌ 키보드 네비게이션 처리 실패:', error);
    }
}

// 자동완성 선택 상태 업데이트
function updateAutocompleteSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedAutocompleteIndex) {
            item.classList.add('bg-blue-50', 'border-blue-200');
            item.classList.remove('hover:bg-blue-50');
        } else {
            item.classList.remove('bg-blue-50', 'border-blue-200');
            item.classList.add('hover:bg-blue-50');
        }
    });
}

// 자동완성 관련 함수들을 전역으로 등록
window.handleCustomerNameInput = handleCustomerNameInput;
window.handleCustomerNameFocus = handleCustomerNameFocus;
window.handleCustomerNameBlur = handleCustomerNameBlur;
window.handleCustomerNameKeydown = handleCustomerNameKeydown;
window.selectAutocompleteItem = selectAutocompleteItem;

// ====== 고객 폼 UX 헬퍼 함수 ======

// 추가 정보 섹션 토글 (접기/펼치기)
window.toggleCustomerExtraInfo = function() {
    const content = document.getElementById('extra-info-content');
    const icon = document.getElementById('toggle-extra-info-icon');
    const hint = document.getElementById('extra-info-hint');
    if (!content) return;
    const isHidden = content.classList.contains('hidden');
    if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
        if (hint) hint.textContent = '클릭하여 접기';
    } else {
        content.classList.add('hidden');
        if (icon) icon.style.transform = '';
        if (hint) hint.textContent = '클릭하여 펼치기';
    }
};

// 등록일 오늘로 빠른 설정
window.setCustomerRegistrationDateToday = function() {
    const dateField = document.getElementById('customer-form-registration-date');
    if (dateField) {
        dateField.value = new Date().toISOString().split('T')[0];
    }
};

// 고객 상태 버튼 선택 (hidden input + 버튼 UI 동기화)
window.setCustomerStatus = function(status) {
    const hiddenInput = document.getElementById('customer-form-status');
    if (hiddenInput) hiddenInput.value = status;

    const styleMap = {
        'ACTIVE':    { on: ['border-green-500',  'bg-green-50',  'text-green-700'],  off: ['border-gray-200', 'bg-white', 'text-gray-500'] },
        'INACTIVE':  { on: ['border-yellow-400', 'bg-yellow-50', 'text-yellow-700'], off: ['border-gray-200', 'bg-white', 'text-gray-500'] },
        'SUSPENDED': { on: ['border-red-400',    'bg-red-50',    'text-red-700'],    off: ['border-gray-200', 'bg-white', 'text-gray-500'] }
    };

    document.querySelectorAll('#customer-modal .customer-status-btn').forEach(btn => {
        const btnStatus = btn.dataset.status;
        const s = styleMap[btnStatus] || styleMap['ACTIVE'];
        if (btnStatus === status) {
            btn.classList.remove(...s.off);
            btn.classList.add(...s.on);
        } else {
            btn.classList.remove(...s.on);
            btn.classList.add(...s.off);
        }
    });
};

// 메모 글자 수 카운터 업데이트
window.updateMemoCharCount = function(value) {
    const counter = document.getElementById('memo-char-count');
    if (!counter) return;
    const len = (value || '').length;
    counter.textContent = `${len} / 200`;
    counter.className = len > 180
        ? 'text-xs text-danger font-medium'
        : 'text-xs text-muted';
};

// 추가 정보 섹션 내부 상태 리셋 유틸
function resetExtraInfoSection() {
    const content = document.getElementById('extra-info-content');
    const icon = document.getElementById('toggle-extra-info-icon');
    const hint = document.getElementById('extra-info-hint');
    if (content) content.classList.add('hidden');
    if (icon) icon.style.transform = '';
    if (hint) hint.textContent = '클릭하여 펼치기';
}

// 추가 정보 섹션 펼치기 유틸
function expandExtraInfoSection() {
    const content = document.getElementById('extra-info-content');
    const icon = document.getElementById('toggle-extra-info-icon');
    const hint = document.getElementById('extra-info-hint');
    if (content && content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
        if (hint) hint.textContent = '클릭하여 접기';
    }
}

// 고객 폼 초기화 함수
function resetCustomerForm() {
    try {
        console.log('🔄 고객 폼 초기화');
        
        // 폼 필드들 초기화
        const formFields = [
            'customer-form-name',
            'customer-form-phone', 
            'customer-form-address',
            'customer-form-address-detail',
            'customer-form-email',
            'customer-form-memo'
        ];
        
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        // 등급을 일반으로 설정
        const gradeField = document.getElementById('customer-form-grade');
        if (gradeField) {
            gradeField.value = 'GENERAL';
        }
        
        // 등록일을 현재 시점으로 설정
        const dateField = document.getElementById('customer-form-registration-date');
        if (dateField) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            dateField.value = today;
            console.log('📅 등록일 자동 설정:', today);
        }

        // 상태 초기화 (활성)
        const statusField = document.getElementById('customer-form-status');
        if (statusField) statusField.value = 'ACTIVE';
        window.setCustomerStatus('ACTIVE');

        // 메모 글자수 초기화
        window.updateMemoCharCount('');

        // 추가 정보 섹션 접기
        resetExtraInfoSection();

        // 고객 ID 초기화 (새 고객 등록)
        const customerIdField = document.getElementById('customer-id');
        if (customerIdField) {
            customerIdField.value = '';
        }
        
        // 모달 제목 업데이트
        const modalTitle = document.getElementById('customer-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '새 고객 등록';
        }
        
        console.log('✅ 고객 폼 초기화 완료');
        
    } catch (error) {
        console.error('❌ 고객 폼 초기화 실패:', error);
    }
}

// 고객 모달 닫기 함수
// ── 고객 모달 탭 전환 ──────────────────────────────────────
window.switchCustomerTab = function(tab) {
    const infoForm    = document.getElementById('customer-form');
    const ordersPane  = document.getElementById('customer-orders-tab-content');
    const infoBtn     = document.getElementById('customer-tab-info');
    const ordersBtn   = document.getElementById('customer-tab-orders');
    const footer      = document.getElementById('customer-modal-footer');

    const activeStyle   = 'border-bottom:2px solid #16a34a;color:#16a34a;';
    const inactiveStyle = 'border-bottom:2px solid transparent;color:#6b7280;';

    if (tab === 'info') {
        infoForm   && (infoForm.style.display   = '');
        ordersPane && (ordersPane.style.display = 'none');
        footer     && (footer.style.display     = '');
        if (infoBtn)   infoBtn.style.cssText   += activeStyle;
        if (ordersBtn) ordersBtn.style.cssText += inactiveStyle;
    } else {
        infoForm   && (infoForm.style.display   = 'none');
        ordersPane && (ordersPane.style.display = '');
        footer     && (footer.style.display     = 'none');
        if (infoBtn)   infoBtn.style.cssText   += inactiveStyle;
        if (ordersBtn) ordersBtn.style.cssText += activeStyle;
        // 주문이력 로드
        const customerId = document.getElementById('customer-id')?.value;
        if (customerId) _loadCustomerOrdersForModal(customerId);
    }
};

async function _loadCustomerOrdersForModal(customerId) {
    const tbody = document.getElementById('cmod-orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center td-muted" style="padding:16px;">불러오는 중...</td></tr>';

    try {
        const customer = window.customerDataManager?.getCustomerById(customerId);
        if (!customer || !window.supabaseClient) throw new Error('데이터 없음');

        const normalizedPhone = (customer.phone || '').replace(/\D/g, '');
        const { data: orders, error } = await window.supabaseClient
            .from('farm_orders')
            .select('order_date, total_amount, order_status, farm_order_items(product_name, quantity)')
            .or(`customer_phone.eq.${customer.phone},customer_phone.eq.${normalizedPhone}`)
            .order('order_date', { ascending: false })
            .limit(100);
        if (error) throw error;

        const list = orders || [];
        const total = list.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
        const count = list.length;
        const avg   = count > 0 ? Math.round(total / count) : 0;
        const last  = list[0]?.order_date?.slice(0, 10) || '-';

        const fmtA = n => n > 0 ? formatCurrency(n) : '—';
        const el = id => document.getElementById(id);
        if (el('cmod-stat-total')) el('cmod-stat-total').textContent = fmtA(total);
        if (el('cmod-stat-count')) el('cmod-stat-count').textContent = count > 0 ? count + '회' : '—';
        if (el('cmod-stat-avg'))   el('cmod-stat-avg').textContent   = fmtA(avg);
        if (el('cmod-stat-last'))  el('cmod-stat-last').textContent  = last;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center td-muted" style="padding:16px;">주문 내역이 없습니다</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(o => {
            const items = o.farm_order_items || [];
            const names = items.length > 0
                ? items.slice(0, 2).map(i => i.product_name || '').join(', ') + (items.length > 2 ? ` 외 ${items.length - 2}` : '')
                : '-';
            const statusCls = window.orderDataManager?.getStatusColor?.(o.order_status) || 'badge-neutral';
            return `<tr>
                <td class="td-secondary">${(o.order_date || '').slice(0, 10)}</td>
                <td class="td-primary" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(names)}">${escapeHtml(names)}</td>
                <td class="td-amount text-right text-numeric">${o.total_amount ? formatCurrency(o.total_amount) : ND}</td>
                <td class="text-center"><span class="badge ${statusCls}">${o.order_status || '-'}</span></td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('주문이력 로드 실패:', e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger" style="padding:16px;">불러오기 실패</td></tr>';
    }
}

export function closeCustomerModal() {
    try {
        console.log('🔄 고객 모달 닫기');
        
        const modal = document.getElementById('customer-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            console.log('✅ 고객 모달 숨김 완료');
        } else {
            console.warn('⚠️ 고객 모달을 찾을 수 없습니다');
        }
        
        // 탭 숨기기 + 모달 크기 원복
        const tabsEl = document.getElementById('customer-modal-tabs');
        if (tabsEl) { tabsEl.style.display = 'none'; tabsEl.classList.add('hidden'); }
        const modalContentEl = document.getElementById('customer-modal-content');
        if (modalContentEl) {
            modalContentEl.classList.remove('modal-md');
            modalContentEl.classList.add('modal-sm');
        }

        // 주문 폼에서 온 경우 주문 모달 다시 표시
        if (window.tempCustomerName) {
            const orderModal = document.getElementById('order-modal');
            if (orderModal) {
                orderModal.style.display = 'flex';
                console.log('📦 주문 모달 다시 표시 (고객 모달 취소)');
            }
            // 임시 저장된 고객명 초기화
            window.tempCustomerName = null;
        }
        
        console.log('✅ 고객 모달 닫기 완료');
        
    } catch (error) {
        console.error('❌ 고객 모달 닫기 실패:', error);
    }
}

// 전역 함수로 등록
window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.renderCustomersTable = renderCustomersTable;

// 등급 탭 버튼 동적 생성 (환경설정 customerGrades 기반)
async function renderGradeTabs() {
    const slot = document.getElementById('customer-grade-dynamic-slot');
    if (!slot) return;

    const grades = await loadCustomerGradesFromSettings();
    slot.innerHTML = grades.map(g => {
        const colorStyle = g.color ? `style="color:${g.color}"` : '';
        return `<button id="customer-grade-${g.code}" class="customer-tab-btn px-2 py-0.5 rounded text-xs text-body hover:opacity-80" data-grade="${g.code}" ${colorStyle}>${g.name} <span id="customer-count-${g.code}">0</span></button>`;
    }).join('');

    // 이벤트 위임 (1회만)
    if (!slot.dataset.delegated) {
        slot.addEventListener('click', (e) => {
            const btn = e.target.closest('.customer-tab-btn');
            if (!btn) return;
            document.querySelectorAll('.customer-tab-btn').forEach(b => b.classList.remove('active', 'font-medium', 'bg-success'));
            btn.classList.add('active', 'font-medium', 'bg-success');
            const searchTerm = (document.getElementById('customer-search')?.value || '').trim();
            renderCustomersTable(btn.dataset.grade || 'all', searchTerm);
        });
        slot.dataset.delegated = 'true';
    }
}

// 고객 등급별 카운트 업데이트 함수 (환경설정 연동)
async function updateCustomerGradeCounts() {
    try {
        console.log('📊 고객 등급별 카운트 업데이트 시작...');

        if (!window.customerDataManager) {
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
            return;
        }

        // 등급 탭 동적 생성 (DOM 보장)
        await renderGradeTabs();

        const customers = window.customerDataManager.getAllCustomers();

        // 환경설정에서 고객등급 정보 로드
        const grades = await loadCustomerGradesFromSettings();

        // 등급별 카운트 계산
        const gradeCounts = { 'all': customers.length };
        grades.forEach(grade => {
            gradeCounts[grade.code] = customers.filter(c => c.grade === grade.code).length;
        });

        // 각 등급별 카운트 업데이트
        Object.keys(gradeCounts).forEach(grade => {
            const countElement = document.getElementById(`customer-count-${grade}`);
            if (countElement) {
                countElement.textContent = gradeCounts[grade];
            }
        });

        // "전체" 카운트
        const allCount = document.getElementById('customer-count-all');
        if (allCount) allCount.textContent = customers.length;

    } catch (error) {
        console.error('❌ 고객 등급별 카운트 업데이트 실패:', error);
    }
}

window.updateCustomerGradeCounts = updateCustomerGradeCounts;

// 고객 정렬 이벤트 리스너 설정
function initCustomerSortListener() {
    const sortSelect = document.getElementById('customer-sort');
    const applySortBtn = document.getElementById('apply-customer-sort');
    
    // 정렬 적용 함수
    const applySort = () => {
        if (sortSelect) {
            const sortBy = sortSelect.value;
            console.log('📊 고객 정렬 적용:', sortBy);
            
            // 정렬 적용
            customerDataManager.customerSortBy = sortBy;
            
            // 현재 활성 등급 필터 확인
            const activeGradeButton = document.querySelector('.customer-tab-btn.active');
            const gradeFilter = activeGradeButton 
                ? activeGradeButton.id.replace('customer-grade-', '')
                : 'all';
            
            // 테이블 다시 렌더링
            renderCustomersTable(gradeFilter);
            
            // 시각적 피드백
            if (applySortBtn) {
                applySortBtn.innerHTML = '<i class="fas fa-check mr-1"></i>완료!';
                setTimeout(() => {
                    applySortBtn.innerHTML = '<i class="fas fa-sort mr-1"></i>정렬';
                }, 1000);
            }
        }
    };
    
    // 정렬 버튼 클릭 이벤트
    if (applySortBtn) {
        applySortBtn.addEventListener('click', applySort);
    }

    // Select 변경 시에도 바로 적용
    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }
    // 요소가 없으면 조용히 종료 (고객관리 컴포넌트 동적 로드 후 재호출됨)
}

// 전역 등록 — 고객관리 컴포넌트 로드 완료 시점에 호출됨
window.initCustomerSortListener = initCustomerSortListener;