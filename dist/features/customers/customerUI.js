// 고객 UI 관리
// 고객 목록, 폼, 모달 UI 처리

import { customerDataManager } from './customerData.js';
import { DEFAULT_CUSTOMER_GRADES } from '../settings/settingsData.js';

// ----------------------------
// 페이지네이션 상태
// ----------------------------
let currentPage = 1;
let PAGE_SIZE = 20;
let filteredCustomersCache = [];

// ----------------------------
// 플로팅 패널 상태
// ----------------------------
let _panelX = null, _panelY = null, _panelW = 380, _panelH = null;

function initFloatingPanelDrag(panel) {
    const handle = panel.querySelector('.customer-detail-drag-handle');
    if (!handle || handle._dragBound) return;
    handle._dragBound = true;
    let sx, sy, sl, st;
    handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        const rect = panel.getBoundingClientRect();
        sx = e.clientX; sy = e.clientY; sl = rect.left; st = rect.top;
        const onMove = (e) => {
            panel.style.left = Math.max(0, sl + e.clientX - sx) + 'px';
            panel.style.top = Math.max(0, st + e.clientY - sy) + 'px';
            panel.style.right = 'auto';
        };
        const onUp = () => {
            _panelX = parseInt(panel.style.left);
            _panelY = parseInt(panel.style.top);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

function initFloatingPanelResize(panel) {
    const handle = panel.querySelector('.customer-detail-resize-handle');
    if (!handle || handle._resizeBound) return;
    handle._resizeBound = true;
    let sx, sy, sw, sh;
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        sx = e.clientX; sy = e.clientY;
        sw = panel.offsetWidth; sh = panel.offsetHeight;
        const onMove = (e) => {
            _panelW = Math.max(260, sw + e.clientX - sx);
            _panelH = Math.max(180, sh + e.clientY - sy);
            panel.style.width = _panelW + 'px';
            panel.style.height = _panelH + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

function applyPanelGeometry(panel) {
    if (_panelX !== null) { panel.style.left = _panelX + 'px'; panel.style.top = _panelY + 'px'; panel.style.right = 'auto'; }
    if (_panelW) panel.style.width = _panelW + 'px';
    if (_panelH) panel.style.height = _panelH + 'px';
}

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
        if (customerId) {
            await customerDataManager.updateCustomer(customerId, payload);
            if (window.showToast) window.showToast('✅ 고객 정보가 수정되었습니다.', 2500);
        } else {
            await customerDataManager.addCustomer(payload);
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
export async function renderCustomersTable(gradeFilter = 'all') {
    console.log(`🎨 고객 테이블 렌더링 시작 (등급 필터: ${gradeFilter})`);
    
    try {
        const allCustomers = customerDataManager.getAllCustomers();
        console.log(`📊 전체 고객 수: ${allCustomers.length}`);
        console.log('📋 고객 데이터:', allCustomers);
        
        // 정렬 적용
        const sortBy = customerDataManager.customerSortBy || 'newest';
        const sortedCustomers = customerDataManager.sortCustomers(sortBy);
        console.log(`📊 정렬 적용: ${sortBy}`);
        
        // 등급 필터링 로직
        const customers = (gradeFilter === 'all')
            ? sortedCustomers
            : sortedCustomers.filter(c => c.grade === gradeFilter);
        
        console.log(`🎯 필터링된 고객 수: ${customers.length}`);
        
        const container = document.getElementById('customer-list-container');
        if (!container) {
            console.error('❌ 고객 리스트 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        container.innerHTML = '';
        
        // 목록 개수 표시
        const countEl = document.getElementById('customer-list-count');
        if (countEl) countEl.textContent = `${customers.length}명`;
        
        // 하단 상태 바: 총 고객 수 · 오늘 신규
        const totalEl = document.getElementById('customer-status-total');
        const todayEl = document.getElementById('customer-status-today');
        if (totalEl) totalEl.textContent = String(allCustomers.length);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayCount = allCustomers.filter(c => (c.registration_date || '').slice(0, 10) === todayStr).length;
        if (todayEl) todayEl.textContent = String(todayCount);
        
        // 캐시 저장 (페이지네이션용) + 페이지 초기화
        filteredCustomersCache = customers;
        // 검색/필터 변경 시 1페이지로 리셋
        const totalPages = PAGE_SIZE === Infinity ? 1 : Math.ceil(filteredCustomersCache.length / PAGE_SIZE);
        if (currentPage > totalPages) currentPage = 1;

        if (filteredCustomersCache.length === 0) {
            container.innerHTML = `
                <div class="px-4 py-8 text-center text-gray-500 text-sm">${gradeFilter === 'all' ? '등록된 고객이 없습니다.' : '해당 등급 고객이 없습니다.'}</div>
            `;
            renderPagination();
            return;
        }

        // 현재 페이지 슬라이스
        const start = (currentPage - 1) * (PAGE_SIZE === Infinity ? 0 : PAGE_SIZE);
        const pageCustomers = PAGE_SIZE === Infinity
            ? filteredCustomersCache
            : filteredCustomersCache.slice(start, start + PAGE_SIZE);

        // 전화번호별 최근 주문일 조회 (farm_orders에서)
        const lastOrderMap = await fetchLastOrderDatesByPhone();

        // 표 생성
        const table = document.createElement('table');
        table.className = 'customer-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="w-8"><input type="checkbox" id="customer-select-all" class="customer-checkbox"></th>
                    <th><button id="sort-by-name-btn" style="background:none;border:none;padding:0;cursor:pointer;font-weight:inherit;font-size:inherit;color:inherit;display:inline-flex;align-items:center;gap:4px;">고객명 <span id="sort-name-arrow" style="font-size:10px;color:#9ca3af;">⇅</span></button></th>
                    <th>등급</th>
                    <th>연락처</th>
                    <th>최근 주문</th>
                    <th class="text-right">관리</th>
                </tr>
            </thead>
            <tbody id="customer-table-body"></tbody>
        `;
        container.appendChild(table);
        const tbody = table.querySelector('tbody');

        // SMS 데이터 맵 초기화 (openCustomerSMSById에서 사용)
        window._customerSMSMap = window._customerSMSMap || {};

        for (const customer of pageCustomers) {
            const gradeDisplayName = await getGradeDisplayName(customer.grade);
            const phoneKey = normalizePhoneForOrder(customer.phone);
            const rawDate = lastOrderMap.get(phoneKey) || customer.last_order_date;
            const phoneFormatted = formatPhone(customer.phone);
            const relDate = relativeDate(rawDate);

            // SMS 맵에 등록
            window._customerSMSMap[customer.id] = {
                phone: (customer.phone || '').replace(/[^0-9]/g, ''),
                name: customer.name || '',
                address: [customer.address, customer.address_detail].filter(Boolean).join(' ')
            };

            const tr = document.createElement('tr');
            tr.className = 'customer-row';
            tr.setAttribute('data-customer-id', customer.id);
            tr.innerHTML = `
                <td onclick="event.stopPropagation()"><input type="checkbox" class="customer-checkbox customer-row-check" value="${customer.id}"></td>
                <td class="font-medium text-gray-900">${escapeHtml(customer.name || '-')}</td>
                <td><span class="px-1.5 py-0.5 text-[10px] font-medium rounded ${getGradeBadgeClass(customer.grade)}">${gradeDisplayName}</span></td>
                <td class="text-gray-600 whitespace-nowrap">${escapeHtml(phoneFormatted)}</td>
                <td class="text-[11px] text-gray-600 whitespace-nowrap">${relDate}</td>
                <td class="text-right row-actions" onclick="event.stopPropagation()">
                    <button onclick="openCustomerSMSById('${customer.id}')" class="p-1 text-emerald-500 hover:bg-emerald-50 rounded inline-flex" title="문자"><i class="fas fa-sms text-xs"></i></button>
                    <button onclick="openOrderForCustomer('${customer.id}')" class="p-1 text-violet-500 hover:bg-violet-50 rounded inline-flex" title="주문 추가"><i class="fas fa-cart-plus text-xs"></i></button>
                    <button onclick="editCustomer('${customer.id}')" class="p-1 text-blue-500 hover:bg-blue-50 rounded" title="수정"><i class="fas fa-edit text-xs"></i></button>
                    <button onclick="deleteCustomer('${customer.id}')" class="p-1 text-red-400 hover:bg-red-50 rounded" title="삭제"><i class="fas fa-trash text-xs"></i></button>
                </td>
            `;
            tr.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return;
                showCustomerDetail(customer.id);
            });
            tbody.appendChild(tr);
        }

        initCheckboxEvents();
        initNameSortBtn();
        renderPagination();
        console.log('✅ 고객 리스트(표) 렌더링 완료');
        
    } catch (error) {
        console.error('❌ 고객 리스트 렌더링 실패:', error);
        const container = document.getElementById('customer-list-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                    </div>
                    <p class="text-sm font-medium">고객 목록을 불러오는 중 오류가 발생했습니다.</p>
                </div>
            `;
        }
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function formatDisplayDate(val) {
    if (!val) return '-';
    const d = typeof val === 'string' ? new Date(val) : val;
    return isNaN(d.getTime()) ? '-' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function formatPhone(phone) {
    const p = String(phone || '').replace(/[^0-9]/g, '');
    if (p.length === 11) return `${p.slice(0,3)}-${p.slice(3,7)}-${p.slice(7)}`;
    if (p.length === 10) return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
    return phone || '-';
}
function relativeDate(dateStr) {
    if (!dateStr) return '-';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (diff === 0) return '오늘';
    if (diff <= 30) return `${diff}일 전`;
    if (diff <= 365) return `${Math.floor(diff / 30)}개월 전`;
    return `${Math.floor(diff / 365)}년 전`;
}
function getGradeAvatarBg(grade) {
    const map = {
        'BLACK_DIAMOND': '#1e293b',
        'PURPLE_EMPEROR': '#7c3aed',
        'RED_RUBY': '#dc2626',
        'GREEN_LEAF': '#16a34a',
        'GENERAL': '#2563eb'
    };
    return map[grade] || '#64748b';
}

/** 고객 전화번호별 최근 주문일 맵 조회 (farm_orders 기준) */
function normalizePhoneForOrder(phone) {
    if (phone == null) return '';
    return String(phone).replace(/[-\s]/g, '');
}
async function fetchLastOrderDatesByPhone() {
    const map = new Map(); // normalizedPhone -> order_date string
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
    return map;
}

// 등급 배지 클래스 반환
function getGradeBadgeClass(grade) {
    const gradeClasses = {
        'BLACK_DIAMOND': 'bg-gray-900 text-white',
        'PURPLE_EMPEROR': 'bg-purple-600 text-white',
        'RED_RUBY': 'bg-red-600 text-white',
        'GREEN_LEAF': 'bg-green-600 text-white',
        'GENERAL': 'bg-blue-600 text-white'
    };
    return gradeClasses[grade] || 'bg-gray-500 text-white';
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

// 고객관리에서 고객등급 정보 로드
async function loadCustomerGradesFromSettings() {
    try {
        console.log('👥 고객관리에서 고객등급 정보 로드 중...');
        
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('farm_settings')
                .select('settings')
                .eq('id', 1)
                .single();
            
            if (error) {
                console.warn('⚠️ 고객등급 설정 로드 실패, 기본값 사용:', error);
                return getDefaultCustomerGrades();
            }
            
            if (data && data.settings && data.settings.customerGrades && Array.isArray(data.settings.customerGrades) && data.settings.customerGrades.length > 0) {
                console.log('✅ 고객관리에서 고객등급 로드됨:', data.settings.customerGrades);
                return data.settings.customerGrades;
            }
        }
        
        console.log('📋 기본 고객등급 사용 (환경설정과 동일한 공통 기본값)');
        return getDefaultCustomerGrades();
        
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
                <div class="flex items-center text-red-600">
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

        // 추가 정보에 데이터 있으면 자동 펼치기
        if (customer.email || customer.memo || (customer.status && customer.status !== 'ACTIVE')) {
            expandExtraInfoSection();
        }

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

// ----------------------------
// 페이지네이션 렌더링
// ----------------------------
function renderPagination() {
    const total = filteredCustomersCache.length;
    const isAll = PAGE_SIZE === Infinity;
    const totalPages = isAll ? 1 : (Math.ceil(total / PAGE_SIZE) || 1);
    const container = document.getElementById('customer-pagination');
    if (!container) return;

    const start = total === 0 ? 0 : (isAll ? 1 : (currentPage - 1) * PAGE_SIZE + 1);
    const end = isAll ? total : Math.min(currentPage * PAGE_SIZE, total);

    // 페이지 크기 버튼
    const sizes = [10, 20, 50, Infinity];
    const labels = { 10: '10명', 20: '20명', 50: '50명', Infinity: '전체' };
    let sizeHtml = sizes.map(s =>
        `<button onclick="setCustomerPageSize(${s === Infinity ? "'all'" : s})" class="page-btn ${PAGE_SIZE === s ? 'active' : ''}">${labels[s]}</button>`
    ).join('');

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = (window.customerDataManager?.getAllCustomers() || []).filter(c => (c.registration_date || c.created_at || '').slice(0, 10) === todayStr).length;

    let html = `<div class="flex items-center gap-1 mr-2">${sizeHtml}</div>`;
    html += `<span class="text-xs text-gray-400 mr-1">|</span>`;
    html += `<span class="text-xs text-gray-500 mr-2">${start}-${end}/${total}명</span>`;
    if (todayCount > 0) html += `<span class="text-[10px] text-emerald-600 mr-1">+${todayCount}</span>`;

    if (!isAll) {
        html += `<button onclick="gotoPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="page-btn">‹</button>`;
        const rangeStart = Math.max(1, currentPage - 2);
        const rangeEnd = Math.min(totalPages, currentPage + 2);
        for (let i = rangeStart; i <= rangeEnd; i++) {
            html += `<button onclick="gotoPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `<button onclick="gotoPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="page-btn">›</button>`;
    }

    container.innerHTML = html;
}
window.renderPagination = renderPagination;

function gotoPage(page) {
    const totalPages = PAGE_SIZE === Infinity ? 1 : (Math.ceil(filteredCustomersCache.length / PAGE_SIZE) || 1);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    const activeTab = document.querySelector('.customer-tab-btn.active');
    const grade = activeTab ? activeTab.id.replace('customer-grade-', '') : 'all';
    window.renderCustomersTable(grade);
}
window.gotoPage = gotoPage;

function setCustomerPageSize(size) {
    PAGE_SIZE = size === 'all' ? Infinity : Number(size);
    currentPage = 1;
    const activeTab = document.querySelector('.customer-tab-btn.active');
    const grade = activeTab ? activeTab.id.replace('customer-grade-', '') : 'all';
    window.renderCustomersTable(grade);
}
window.setCustomerPageSize = setCustomerPageSize;

// ----------------------------
// 체크박스 이벤트
// ----------------------------
function updateBulkBar() {
    const checked = document.querySelectorAll('.customer-row-check:checked');
    const bar = document.getElementById('customer-bulk-bar');
    const countEl = document.getElementById('customer-bulk-count');
    if (!bar) return;
    if (checked.length > 0) {
        bar.classList.remove('hidden');
        if (countEl) countEl.textContent = checked.length;
    } else {
        bar.classList.add('hidden');
    }
}

function initCheckboxEvents() {
    const selectAll = document.getElementById('customer-select-all');
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            document.querySelectorAll('.customer-row-check').forEach(cb => cb.checked = this.checked);
            updateBulkBar();
        });
    }
    document.querySelectorAll('.customer-row-check').forEach(cb => {
        cb.addEventListener('change', updateBulkBar);
    });
}

function initNameSortBtn() {
    const btn = document.getElementById('sort-by-name-btn');
    const arrow = document.getElementById('sort-name-arrow');
    if (!btn) return;

    const currentSort = customerDataManager.customerSortBy || 'newest';
    if (currentSort === 'name_asc') arrow.textContent = '↑';
    else if (currentSort === 'name_desc') arrow.textContent = '↓';
    else arrow.textContent = '⇅';

    btn.addEventListener('click', () => {
        const cur = customerDataManager.customerSortBy || 'newest';
        const next = cur === 'name_asc' ? 'name_desc' : 'name_asc';
        customerDataManager.customerSortBy = next;

        const sortSelect = document.getElementById('customer-sort');
        if (sortSelect) sortSelect.value = next;

        const activeGradeBtn = document.querySelector('.customer-tab-btn.active');
        const gradeFilter = activeGradeBtn ? (activeGradeBtn.id.replace('customer-grade-', '') || 'all') : 'all';
        renderCustomersTable(gradeFilter === 'all' ? undefined : gradeFilter);
    });
}

window.clearCustomerSelection = function () {
    document.querySelectorAll('.customer-row-check, #customer-select-all').forEach(cb => { cb.checked = false; });
    updateBulkBar();
};

window.bulkSendSMS = function () {
    const ids = Array.from(document.querySelectorAll('.customer-row-check:checked')).map(cb => cb.value);
    if (ids.length === 0) return;
    alert(`SMS 발송 기능: ${ids.length}명 선택됨 (추후 구현)`);
};

// 전역 함수로 등록 (HTML에서 호출 가능하도록)
window.renderCustomersTable = renderCustomersTable;
window.checkPhoneDuplicate = checkPhoneDuplicate;
window.fillCustomerForm = fillCustomerForm;

// 고객 행에서 바로 주문 추가 (전역)
window.openOrderForCustomer = function(customerId) {
    const data = window._customerSMSMap?.[customerId];
    if (typeof window.openOrderModal === 'function') {
        window.openOrderModal(null, {
            customerId: customerId,
            customerPhone: data?.phone || '',
            customerName: data?.name || '',
            customerAddress: data?.address || ''
        });
    } else if (typeof window.switchSection === 'function') {
        window.switchSection('orders');
    }
};

// 고객 삭제 함수 (전역)
window.deleteCustomer = async function(customerId) {
    console.log('🗑️ 고객 삭제 요청:', customerId);
    
    if (!confirm('정말로 이 고객을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        if (window.customerDataManager) {
            await window.customerDataManager.deleteCustomer(customerId);
            console.log('✅ 고객 삭제 완료');
            
            // 고객 목록 새로고침
            if (window.renderCustomersTable) {
                window.renderCustomersTable('all');
            }
            
            // 성공 알림
            if (window.showToast) {
                window.showToast('✅ 고객이 삭제되었습니다.', 3000);
            }
        } else {
            console.error('❌ customerDataManager를 찾을 수 없습니다.');
            alert('고객 데이터 관리자를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ 고객 삭제 실패:', error);
        alert('고객 삭제에 실패했습니다: ' + error.message);
    }
};

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
        
        // 잠시 후 폼에 데이터 채우기 (DOM이 완전히 렌더링되도록)
        setTimeout(() => {
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
        
        // 1. 오른쪽 패널에 상세 정보 표시
        await showCustomerDetailInPanel(customer);
        
    } catch (error) {
        console.error('❌ 고객 상세 정보 표시 실패:', error);
    }
};

// 고객 상세 정보를 플로팅 패널에 표시
async function showCustomerDetailInPanel(customer) {
    try {
        console.log('📋 고객 상세 정보 패널 업데이트:', customer.name);

        // detail-open 토글
        const layout = document.querySelector('.customer-admin-layout');
        if (layout) layout.classList.add('detail-open');

        // 선택 행 강조
        document.querySelectorAll('.customer-row').forEach(r => r.classList.remove('selected'));
        const sel = document.querySelector(`.customer-row[data-customer-id="${customer.id}"]`);
        if (sel) { sel.classList.add('selected'); sel.scrollIntoView({ block: 'nearest' }); }

        // 플로팅 패널 설정
        const mainPanel = document.querySelector('.customer-admin-main');
        if (mainPanel) {
            // 드래그 핸들 (최초 1회)
            if (!mainPanel.querySelector('.customer-detail-drag-handle')) {
                const dh = document.createElement('div');
                dh.className = 'customer-detail-drag-handle';
                dh.innerHTML = `
                    <div class="drag-dots"><span></span><span></span><span></span><span></span><span></span><span></span></div>
                    <span class="text-xs font-semibold text-gray-700 flex-1 mx-2 truncate" id="panel-title-name"></span>
                    <button id="panel-fullpage-btn" class="p-1 text-gray-400 hover:text-blue-500 rounded" title="전체화면"><i class="fas fa-expand text-xs"></i></button>
                    <button onclick="closeCustomerDetail()" class="p-1 text-gray-400 hover:text-red-500 rounded" title="닫기"><i class="fas fa-times text-xs"></i></button>
                `;
                mainPanel.insertBefore(dh, mainPanel.firstChild);
                dh.querySelector('#panel-fullpage-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleCustomerPanelFullpage();
                });
                initFloatingPanelDrag(mainPanel);
            }
            // 리사이즈 핸들 (최초 1회)
            if (!mainPanel.querySelector('.customer-detail-resize-handle')) {
                const rh = document.createElement('div');
                rh.className = 'customer-detail-resize-handle';
                mainPanel.appendChild(rh);
                initFloatingPanelResize(mainPanel);
            }
            applyPanelGeometry(mainPanel);
            const titleName = mainPanel.querySelector('#panel-title-name');
            if (titleName) titleName.textContent = customer.name;
        }

        // 고객 상세 정보 컨테이너 찾기
        const detailContent = document.getElementById('customer-detail-content');
        if (!detailContent) return;

        // 등급명 비동기 조회
        const gradeDisplayName = await getGradeDisplayName(customer.grade);
        const addressFull = [customer.address, customer.address_detail].filter(Boolean).join(' ') || '-';
        const phoneForTel = (customer.phone || '').replace(/[^0-9]/g, '');
        const telHref = phoneForTel ? `tel:${phoneForTel}` : '#';

        // 컴팩트 레이아웃
        detailContent.innerHTML = `
            <div class="flex flex-col gap-2">
                <!-- 프로필 행 -->
                <div class="flex items-start gap-2">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-semibold text-gray-900 text-sm">${escapeHtml(customer.name || '-')}</span>
                            <span class="px-1.5 py-0.5 text-[10px] font-medium rounded ${getGradeBadgeClass(customer.grade)}">${gradeDisplayName}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5 space-y-0.5">
                            <div><i class="fas fa-phone-alt w-3 text-gray-400"></i> ${escapeHtml(formatPhone(customer.phone) || '-')}</div>
                            <div class="truncate" title="${escapeHtml(addressFull)}"><i class="fas fa-map-marker-alt w-3 text-gray-400"></i> ${escapeHtml(addressFull)}</div>
                            <div><i class="fas fa-calendar w-3 text-gray-400"></i> 등록 ${customer.registration_date || '-'}</div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 shrink-0 text-right">
                        <div class="text-base font-bold text-emerald-700" id="customer-total-purchase">—</div>
                        <div class="text-[10px] text-gray-400">총구매액</div>
                        <div class="text-sm font-bold text-gray-700" id="customer-order-count">—</div>
                        <div class="text-[10px] text-gray-400">주문수</div>
                    </div>
                </div>
                <!-- 액션 버튼 행 -->
                <div class="flex gap-1 flex-wrap">
                    <button type="button" onclick="openCustomerSMSModal('${phoneForTel}', '${(customer.name||'').replace(/'/g,'')}')" class="flex-1 text-center py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"><i class="fas fa-sms mr-1"></i>문자</button>
                    <a href="${telHref}" class="flex-1 text-center py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"><i class="fas fa-phone mr-1"></i>전화</a>
                    <button type="button" data-action="order-add" data-customer-id="${customer.id}" class="flex-1 text-center py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"><i class="fas fa-cart-plus mr-1"></i>주문</button>
                    <button onclick="editCustomer('${customer.id}')" class="py-1.5 px-3 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCustomer('${customer.id}')" class="py-1.5 px-3 text-xs font-medium bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100"><i class="fas fa-trash"></i></button>
                </div>
                <!-- 주문 이력 -->
                <div class="border border-gray-200 rounded overflow-hidden">
                    <div class="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                        <span class="text-xs font-semibold text-gray-700">주문 이력</span>
                        <div class="flex gap-1">
                            <button id="order-view-orders" class="order-view-tab text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white">건별</button>
                            <button id="order-view-date" class="order-view-tab text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">날짜별</button>
                            <button id="order-view-items" class="order-view-tab text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">전체상품</button>
                        </div>
                    </div>
                    <div class="px-2 pt-1.5 pb-1 border-b border-gray-100 bg-white">
                        <input id="order-item-search" type="text" placeholder="식물 이름 검색..." class="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-400">
                    </div>
                    <div class="overflow-auto" style="max-height:240px">
                        <div id="customer-orders-list" class="text-xs text-gray-500 p-2">불러오는 중...</div>
                    </div>
                </div>
                <!-- 메모 -->
                <div class="border border-gray-200 rounded overflow-hidden">
                    <div class="flex items-center px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                        <span class="text-xs font-semibold text-gray-700">메모</span>
                    </div>
                    <div class="p-1.5">
                        <textarea id="customer-detail-memo" rows="3" class="w-full p-1.5 border border-gray-200 rounded text-xs resize-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" placeholder="상담 내용, 특이사항...">${customer.memo ? escapeHtml(customer.memo) : ''}</textarea>
                        <button type="button" id="customer-memo-save-btn" data-customer-id="${customer.id}" class="mt-1 w-full py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700">저장</button>
                    </div>
                </div>
            </div>
        `;

        // 메모 저장 이벤트
        const memoSaveBtn = document.getElementById('customer-memo-save-btn');
        if (memoSaveBtn) {
            memoSaveBtn.addEventListener('click', async () => {
                const memoEl = document.getElementById('customer-detail-memo');
                const memo = memoEl ? memoEl.value.trim() : '';
                try {
                    await customerDataManager.updateCustomer(customer.id, { ...customer, memo });
                    if (window.showToast) window.showToast('메모가 저장되었습니다.', 2000);
                } catch (e) {
                    if (window.showToast) window.showToast('메모 저장에 실패했습니다.', 2000);
                }
            });
        }
        const orderAddBtn = detailContent.querySelector('[data-action="order-add"]');
        if (orderAddBtn) {
            orderAddBtn.addEventListener('click', () => {
                if (typeof window.openOrderModal === 'function') window.openOrderModal(null, { customerId: customer.id, customerPhone: customer.phone, customerName: customer.name, customerAddress: [customer.address, customer.address_detail].filter(Boolean).join(' ') });
                else if (typeof window.switchSection === 'function') window.switchSection('orders');
            });
        }

        // 주문 이력 뷰 탭 버튼 이벤트
        window._customerOrderViewMode = 'orders';
        window._customerOrderSearch = '';
        const orderViewBtns = detailContent.querySelectorAll('.order-view-tab');
        orderViewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                orderViewBtns.forEach(b => {
                    b.classList.remove('bg-emerald-600', 'text-white');
                    b.classList.add('bg-gray-100', 'text-gray-600');
                });
                btn.classList.remove('bg-gray-100', 'text-gray-600');
                btn.classList.add('bg-emerald-600', 'text-white');
                if (btn.id === 'order-view-orders') window._customerOrderViewMode = 'orders';
                else if (btn.id === 'order-view-date') window._customerOrderViewMode = 'date';
                else if (btn.id === 'order-view-items') window._customerOrderViewMode = 'items';
                reRenderCustomerOrders();
            });
        });

        // 식물명 검색 이벤트
        const orderItemSearchEl = detailContent.querySelector('#order-item-search');
        if (orderItemSearchEl) {
            orderItemSearchEl.addEventListener('input', () => {
                window._customerOrderSearch = orderItemSearchEl.value.trim();
                reRenderCustomerOrders();
            });
        }

        console.log('✅ 고객 상세 정보 패널 업데이트 완료');

        // 주문내역 로드
        loadCustomerOrders(customer.id);
        
    } catch (error) {
        console.error('❌ 고객 상세 정보 패널 업데이트 실패:', error);
    }
}

// 고객 핵심 지표 업데이트: 총 구매액 · 주문 횟수 · 단골 점수 (주문 배열 기준)
function updateCustomerTotalPurchaseDisplay(orders) {
    const list = orders || [];
    const EXCLUDED = ['주문취소', '환불완료'];
    const activeList = list.filter(o => !EXCLUDED.includes(o.order_status));
    const total = activeList.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const count = activeList.length;
    const loyaltyScore = count * 10; // 단골 점수: 주문 횟수 × 10 (간단 규칙)
    const totalEl = document.getElementById('customer-total-purchase');
    const countEl = document.getElementById('customer-order-count');
    const scoreEl = document.getElementById('customer-loyalty-score');
    if (totalEl) totalEl.textContent = total > 0 ? total.toLocaleString() + '원' : '—';
    if (countEl) countEl.textContent = count > 0 ? String(count) + '회' : '—';
    if (scoreEl) scoreEl.textContent = count > 0 ? String(loyaltyScore) + '점' : '—';
}

// 고객 주문내역 로드 함수
async function loadCustomerOrders(customerId) {
    try {
        console.log('🛒 고객 주문내역 로드:', customerId);
        // 새 고객 로드 시 캐시 초기화
        window._customerOrdersCache = null;
        window._customerOrderViewMode = window._customerOrderViewMode || 'orders';
        window._customerOrderSearch = '';

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
        
        console.log('🌐 Supabase에서 주문내역 로드 중...');
        
        // 디버깅: 모든 주문 데이터 먼저 확인
        const { data: allOrders, error: allOrdersError } = await window.supabaseClient
            .from('farm_orders')
            .select('*')
            .order('order_date', { ascending: false })
            .limit(10);
        
        if (allOrdersError) {
            console.error('❌ 전체 주문 데이터 조회 실패:', allOrdersError);
        } else {
            console.log('📊 전체 주문 데이터 샘플:', allOrders?.slice(0, 3));
            if (allOrders && allOrders.length > 0) {
                console.log('📞 주문 데이터의 고객 전화번호 샘플:', allOrders.slice(0, 3).map(order => ({
                    id: order.id,
                    customer_phone: order.customer_phone,
                    customer_name: order.customer_name
                })));
                
                // 주문 아이템 데이터 구조 상세 분석
                console.log('🔍 주문 아이템 데이터 구조 분석:');
                allOrders.slice(0, 3).forEach((order, index) => {
                    console.log(`📦 주문 ${index + 1} 아이템 데이터:`, {
                        orderId: order.id,
                        orderNumber: order.order_number,
                        items: order.items,
                        order_items: order.order_items,
                        itemsType: typeof order.items,
                        order_itemsType: typeof order.order_items,
                        itemsLength: order.items ? order.items.length : 'N/A',
                        order_itemsLength: order.order_items ? order.order_items.length : 'N/A'
                    });
                    
                    // order_items가 JSON 문자열인 경우 파싱 시도
                    if (order.order_items && typeof order.order_items === 'string') {
                        try {
                            const parsedItems = JSON.parse(order.order_items);
                            console.log(`📦 주문 ${index + 1} 파싱된 아이템:`, parsedItems);
                        } catch (e) {
                            console.warn(`⚠️ 주문 ${index + 1} order_items JSON 파싱 실패:`, e);
                        }
                    }
                });
            }
        }
        
        // 고객 전화번호로 주문 검색 (다양한 형식 지원)
        console.log('🔍 고객 전화번호로 주문 검색:', customer.phone);
        
        // 전화번호 정규화 (하이픈 제거, 공백 제거)
        const normalizedPhone = customer.phone.replace(/[-\s]/g, '');
        console.log('📞 정규화된 전화번호:', normalizedPhone);
        
        const { data: ordersData, error } = await window.supabaseClient
            .from('farm_orders')
            .select('*')
            .or(`customer_phone.eq.${customer.phone},customer_phone.eq.${normalizedPhone}`)
            .order('order_date', { ascending: false });
        
        if (error) {
            console.error('❌ Supabase 주문내역 로드 실패:', error);
            throw new Error(`Supabase 주문내역 로드 실패: ${error.message}`);
        }
        
        const orders = ordersData || [];
        console.log(`✅ Supabase에서 주문 ${orders.length}개 로드됨`);
        console.log('🔍 로드된 주문 데이터:', orders);
        
        // 디버깅: 주문 데이터 상세 분석
        if (orders.length > 0) {
            console.log('🔍 주문 데이터 상세 분석:');
            orders.forEach((order, index) => {
                console.log(`📋 주문 ${index + 1}:`, {
                    id: order.id,
                    order_number: order.order_number,
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    total_amount: order.total_amount,
                    order_items_type: typeof order.order_items,
                    order_items_length: order.order_items ? (Array.isArray(order.order_items) ? order.order_items.length : 'not_array') : 'null',
                    order_items_preview: order.order_items ? (typeof order.order_items === 'string' ? order.order_items.substring(0, 100) + '...' : order.order_items) : 'null'
                });
            });
        }
        
        // 전화번호 매칭이 안되는 경우 다른 방법으로 시도
        if (orders.length === 0) {
            console.log('🔄 전화번호 매칭 실패, 대안 방법들 시도...');
            
            // 1. 고객명으로 검색
            console.log('🔍 고객명으로 검색:', customer.name);
            const { data: ordersByName, error: nameError } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .eq('customer_name', customer.name)
                .order('order_date', { ascending: false });
            
            if (!nameError && ordersByName && ordersByName.length > 0) {
                console.log(`✅ 고객명으로 주문 ${ordersByName.length}개 발견`);
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
                    console.log(`🔍 전화번호 형식 시도: ${phoneFormat}`);
                    const { data: ordersByPhone, error: phoneError } = await window.supabaseClient
                        .from('farm_orders')
                        .select('*')
                        .eq('customer_phone', phoneFormat)
                        .order('order_date', { ascending: false });
                    
                    if (!phoneError && ordersByPhone && ordersByPhone.length > 0) {
                        console.log(`✅ 전화번호 형식 ${phoneFormat}로 주문 ${ordersByPhone.length}개 발견`);
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
                    .select('*')
                    .like('customer_phone', `%${phoneDigits.slice(-8)}%`) // 뒤 8자리로 검색
                    .order('order_date', { ascending: false });
                
                if (!partialError && ordersByPartial && ordersByPartial.length > 0) {
                    console.log(`✅ 부분 매칭으로 주문 ${ordersByPartial.length}개 발견`);
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
                <div class="text-center py-8 text-red-500">
                    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                    </div>
                    <p class="text-sm">주문내역을 불러올 수 없습니다.</p>
                    <p class="text-xs text-gray-400 mt-1">오류: ${error.message}</p>
                </div>
            `;
        }
    }
}

// 고객 주문내역 렌더링 함수
async function renderCustomerOrders(orders, container, viewMode, searchQuery) {
    try {
        const mode = viewMode || window._customerOrderViewMode || 'orders';
        const query = (searchQuery !== undefined ? searchQuery : (window._customerOrderSearch || '')).toLowerCase();

        console.log('🎨 고객 주문내역 렌더링:', orders.length, '| 모드:', mode, '| 검색:', query);

        if (orders.length === 0) {
            container.innerHTML = `<p class="text-xs text-gray-500 py-3 px-2 text-center">주문 내역이 없습니다.</p>`;
            return;
        }

        // farm_order_items 테이블에서 상품명 일괄 조회 (캐시 있으면 재사용)
        let ordersWithItems;
        if (window._customerOrdersCache && (orders === window._customerOrdersCache || (window._customerOrdersCache.length > 0 && orders.length > 0 && window._customerOrdersCache[0].id === orders[0].id && window._customerOrdersCache[0].items !== undefined))) {
            ordersWithItems = window._customerOrdersCache;
        } else {
            const orderIds = orders.map(o => o.id).filter(Boolean);
            let itemsByOrderId = {};
            if (orderIds.length > 0 && window.supabaseClient) {
                const { data: allItems } = await window.supabaseClient
                    .from('farm_order_items')
                    .select('order_id, product_name, quantity, unit_price')
                    .in('order_id', orderIds);
                (allItems || []).forEach(item => {
                    if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
                    itemsByOrderId[item.order_id].push(item);
                });
            }
            ordersWithItems = orders.map(order => {
                const items = itemsByOrderId[order.id] || [];
                const itemsInfo = items.length > 0
                    ? items.map(i => `${i.product_name || '상품명 없음'} × ${i.quantity || 1}`).join(', ')
                    : '-';
                return { ...order, items, itemsInfo };
            });
            window._customerOrdersCache = ordersWithItems;
        }

        // ── 건별 모드 ──────────────────────────────────────────────
        if (mode === 'orders') {
            let filtered = ordersWithItems;
            if (query) {
                filtered = ordersWithItems.filter(o => (o.itemsInfo || '').toLowerCase().includes(query));
            }
            if (filtered.length === 0) {
                container.innerHTML = `<p class="text-xs text-gray-500 py-3 px-2 text-center">검색 결과가 없습니다.</p>`;
                return;
            }
            const rowsHTML = filtered.map(order => {
                const orderDate = order.order_date ? formatDisplayDate(order.order_date) : '-';
                const totalAmount = order.total_amount != null ? Number(order.total_amount).toLocaleString() : '0';
                const status = order.order_status || '주문접수';
                const orderId = order.id;
                const productSummary = (order.itemsInfo || '상품 정보 없음').slice(0, 80) + (order.itemsInfo && order.itemsInfo.length > 80 ? '…' : '');
                return `
                    <tr class="hover:bg-gray-50 border-b border-gray-100">
                        <td class="px-2 py-1.5 text-gray-700 whitespace-nowrap">${orderDate}</td>
                        <td class="px-2 py-1.5 text-gray-900 max-w-[180px] truncate" title="${escapeHtml(order.itemsInfo || '')}">${escapeHtml(productSummary)}</td>
                        <td class="px-2 py-1.5 text-gray-900 whitespace-nowrap">${totalAmount}원</td>
                        <td class="px-2 py-1.5"><span class="px-1.5 py-0.5 text-[10px] font-medium rounded ${getOrderStatusBadgeClass(status)}">${status}</span></td>
                        <td class="px-2 py-1.5 text-center whitespace-nowrap">
                            <button type="button" onclick="typeof window.openOrderDetailModal === 'function' ? window.openOrderDetailModal('${orderId}') : window.openOrderModal && window.openOrderModal('${orderId}')" class="text-emerald-600 hover:underline text-xs">보기</button>
                        </td>
                    </tr>
                `;
            }).join('');
            container.innerHTML = `
                <table class="w-full text-xs border-collapse">
                    <thead>
                        <tr class="bg-gray-50 text-gray-600 text-left">
                            <th class="px-2 py-1.5 font-medium">주문일</th>
                            <th class="px-2 py-1.5 font-medium">상품명</th>
                            <th class="px-2 py-1.5 font-medium">금액</th>
                            <th class="px-2 py-1.5 font-medium">상태</th>
                            <th class="px-2 py-1.5 font-medium text-center w-12">보기</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            `;

        // ── 날짜별 모드 ────────────────────────────────────────────
        } else if (mode === 'date') {
            let filtered = ordersWithItems;
            if (query) {
                filtered = ordersWithItems.filter(o => (o.itemsInfo || '').toLowerCase().includes(query));
            }
            if (filtered.length === 0) {
                container.innerHTML = `<p class="text-xs text-gray-500 py-3 px-2 text-center">검색 결과가 없습니다.</p>`;
                return;
            }
            // 날짜별 그룹핑
            const dateGroups = {};
            filtered.forEach(order => {
                const dateKey = order.order_date ? order.order_date.slice(0, 10) : '날짜 없음';
                if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
                dateGroups[dateKey].push(order);
            });
            const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
            const groupsHTML = sortedDates.map(dateKey => {
                const dayOrders = dateGroups[dateKey];
                const dayTotal = dayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                const itemsHTML = dayOrders.map(order => {
                    const totalAmount = order.total_amount != null ? Number(order.total_amount).toLocaleString() : '0';
                    const productSummary = (order.itemsInfo || '상품 정보 없음').slice(0, 60) + (order.itemsInfo && order.itemsInfo.length > 60 ? '…' : '');
                    const orderId = order.id;
                    return `
                        <div class="px-2 py-1 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                            <span class="truncate text-gray-700 mr-2 flex-1" title="${escapeHtml(order.itemsInfo || '')}">${escapeHtml(productSummary)}</span>
                            <span class="text-gray-500 whitespace-nowrap mr-2">${totalAmount}원</span>
                            <button type="button" onclick="typeof window.openOrderDetailModal === 'function' ? window.openOrderDetailModal('${orderId}') : window.openOrderModal && window.openOrderModal('${orderId}')" class="text-emerald-600 hover:underline text-[10px] whitespace-nowrap">보기</button>
                        </div>
                    `;
                }).join('');
                return `
                    <div>
                        <div class="bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500 flex justify-between sticky top-0">
                            <span>${dateKey}</span>
                            <span class="text-gray-400">${dayOrders.length}건 · ${dayTotal.toLocaleString()}원</span>
                        </div>
                        ${itemsHTML}
                    </div>
                `;
            }).join('');
            container.innerHTML = groupsHTML || `<p class="text-xs text-gray-500 py-3 px-2 text-center">주문 내역이 없습니다.</p>`;

        // ── 전체상품 모드 ──────────────────────────────────────────
        } else if (mode === 'items') {
            // 모든 주문의 아이템 펼치기
            const allItemRows = [];
            ordersWithItems.forEach(order => {
                const orderDate = order.order_date ? formatDisplayDate(order.order_date) : '-';
                const items = order.items || [];
                if (items.length === 0) {
                    if (!query) {
                        allItemRows.push({ orderDate, product_name: '상품 정보 없음', quantity: '-', unit_price: '-' });
                    }
                } else {
                    items.forEach(item => {
                        if (!query || (item.product_name || '').toLowerCase().includes(query)) {
                            allItemRows.push({
                                orderDate,
                                orderId: order.id,
                                product_name: item.product_name || '상품명 없음',
                                quantity: item.quantity != null ? item.quantity : '-',
                                unit_price: item.unit_price != null ? Number(item.unit_price).toLocaleString() + '원' : '-'
                            });
                        }
                    });
                }
            });
            if (allItemRows.length === 0) {
                container.innerHTML = `<p class="text-xs text-gray-500 py-3 px-2 text-center">검색 결과가 없습니다.</p>`;
                return;
            }
            const rowsHTML = allItemRows.map(row => `
                <tr class="hover:bg-gray-50 border-b border-gray-100">
                    <td class="px-2 py-1.5 text-gray-500 whitespace-nowrap">${row.orderDate}</td>
                    <td class="px-2 py-1.5 text-gray-900">${escapeHtml(row.product_name)}</td>
                    <td class="px-2 py-1.5 text-gray-700 text-center">${row.quantity}</td>
                    <td class="px-2 py-1.5 text-gray-700 whitespace-nowrap">${row.unit_price}</td>
                </tr>
            `).join('');
            container.innerHTML = `
                <table class="w-full text-xs border-collapse">
                    <thead>
                        <tr class="bg-gray-50 text-gray-600 text-left">
                            <th class="px-2 py-1.5 font-medium">주문일</th>
                            <th class="px-2 py-1.5 font-medium">식물명</th>
                            <th class="px-2 py-1.5 font-medium text-center">수량</th>
                            <th class="px-2 py-1.5 font-medium">단가</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            `;
        }

        console.log('✅ 고객 주문내역 렌더링 완료');

    } catch (error) {
        console.error('❌ 고객 주문내역 렌더링 실패:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                </div>
                <p class="text-sm">주문내역을 표시할 수 없습니다.</p>
            </div>
        `;
    }
}

// 캐시된 데이터로 재렌더링 (DB 재호출 없음)
function reRenderCustomerOrders() {
    const cache = window._customerOrdersCache;
    const container = document.getElementById('customer-orders-list');
    if (!cache || !container) return;
    const mode = window._customerOrderViewMode || 'orders';
    const query = window._customerOrderSearch || '';
    renderCustomerOrders(cache, container, mode, query);
}

// 주문 상태 배지 클래스 반환
function getOrderStatusBadgeClass(status) {
    const statusClasses = {
        '주문접수': 'bg-blue-100 text-blue-800',
        '주문확인': 'bg-yellow-100 text-yellow-800',
        '배송준비': 'bg-purple-100 text-purple-800',
        '배송중': 'bg-orange-100 text-orange-800',
        '배송완료': 'bg-green-100 text-green-800',
        '주문취소': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
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
            iconElement.className = 'fas fa-crown text-lg text-yellow-600';
        } else {
            iconElement.className = 'fas fa-user text-lg text-green-600';
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
        registrationDateElement.textContent = customer.registration_date || '등록일 없음';
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
                element.textContent = stats.totalAmount.toLocaleString() + '원';
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
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-4 text-gray-300"></i>
                <h3 class="text-lg font-medium mb-2 text-gray-600">주문 내역이 없습니다</h3>
                <p class="text-sm text-gray-400">${customer.name}님의 주문 기록이 아직 없습니다.</p>
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
            iconElement.className = 'fas fa-crown text-lg text-yellow-600';
        } else {
            iconElement.className = 'fas fa-user text-lg text-blue-600';
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
        amountElement.textContent = stats.totalAmount.toLocaleString() + '원';
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
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-shopping-cart text-2xl mb-2 text-gray-300"></i>
                <h3 class="text-sm font-medium mb-1 text-gray-600">주문 내역이 없습니다</h3>
                <p class="text-xs text-gray-400">${customer.name}님의 주문 기록이 아직 없습니다.</p>
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
                            <div class="font-medium text-gray-900">${highlightedName}</div>
                            <div class="text-xs text-gray-500">${customer.phone} • ${gradeDisplayName}</div>
                        </div>
                        <div class="text-xs text-gray-400">
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
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다 - 중복 검사 생략 후 저장 계속');
            return true;
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
                // 등록 모드 - 중복된 고객명이 있으면 등록을 막음
                const message = `"${customerName}" 이름의 고객이 이미 등록되어 있습니다.\n\n기존 고객 정보:\n- 전화번호: ${existingCustomer.phone}\n- 등급: ${existingCustomer.grade}\n- 등록일: ${existingCustomer.registration_date}\n\n동일한 이름으로는 등록할 수 없습니다. 다른 이름을 사용하거나 기존 고객을 선택해주세요.`;
                
                alert(message);
                console.log('❌ 중복된 고객명으로 인한 등록 차단');
                return false; // 등록 차단
            }
        }
        
        console.log('✅ 고객명 중복 없음');
        return true; // 중복 없음, 계속 진행
        
    } catch (error) {
        console.error('❌ 고객명 중복 검사 실패:', error);
        return true; // 오류 시 계속 진행
    }
}

// 전화번호 포맷팅 함수
function formatPhoneNumber(input) {
    try {
        console.log('📞 전화번호 포맷팅 시작:', input.value);
        
        // 숫자만 추출
        let value = input.value.replace(/[^0-9]/g, '');
        console.log('🔢 숫자만 추출:', value);
        
        // 길이 제한 (11자리)
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // 포맷팅 적용
        let formatted = '';
        if (value.length >= 1) {
            formatted = value.substring(0, 3);
        }
        if (value.length >= 4) {
            formatted += '-' + value.substring(3, 7);
        }
        if (value.length >= 8) {
            formatted += '-' + value.substring(7, 11);
        }
        
        console.log('📱 포맷팅 결과:', formatted);
        
        // 입력 필드에 포맷팅된 값 설정
        input.value = formatted;
        
    } catch (error) {
        console.error('❌ 전화번호 포맷팅 실패:', error);
    }
}

// 고객명 중복 검사 함수를 전역으로 등록
window.checkCustomerNameDuplicate = checkCustomerNameDuplicate;
window.formatPhoneNumber = formatPhoneNumber;

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

window.setCustomerRegistrationDateToday = function() {
    const dateField = document.getElementById('customer-form-registration-date');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
};

window.setCustomerStatus = function(status) {
    const hiddenInput = document.getElementById('customer-form-status');
    if (hiddenInput) hiddenInput.value = status;
    const styleMap = {
        'ACTIVE':    { on: ['border-green-500',  'bg-green-50',  'text-green-700'],  off: ['border-gray-200', 'bg-white', 'text-gray-500'] },
        'INACTIVE':  { on: ['border-yellow-400', 'bg-yellow-50', 'text-yellow-700'], off: ['border-gray-200', 'bg-white', 'text-gray-500'] },
        'SUSPENDED': { on: ['border-red-400',    'bg-red-50',    'text-red-700'],    off: ['border-gray-200', 'bg-white', 'text-gray-500'] }
    };
    document.querySelectorAll('#customer-modal .customer-status-btn').forEach(btn => {
        const s = styleMap[btn.dataset.status] || styleMap['ACTIVE'];
        if (btn.dataset.status === status) {
            btn.classList.remove(...s.off);
            btn.classList.add(...s.on);
        } else {
            btn.classList.remove(...s.on);
            btn.classList.add(...s.off);
        }
    });
};

window.updateMemoCharCount = function(value) {
    const counter = document.getElementById('memo-char-count');
    if (!counter) return;
    const len = (value || '').length;
    counter.textContent = `${len} / 200`;
    counter.className = len > 180 ? 'text-xs text-red-500 font-medium' : 'text-xs text-gray-400';
};

function resetExtraInfoSection() {
    const content = document.getElementById('extra-info-content');
    const icon = document.getElementById('toggle-extra-info-icon');
    const hint = document.getElementById('extra-info-hint');
    if (content) content.classList.add('hidden');
    if (icon) icon.style.transform = '';
    if (hint) hint.textContent = '클릭하여 펼치기';
}

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

// 고객 등급별 카운트 업데이트 함수 (환경설정 연동)
async function updateCustomerGradeCounts() {
    try {
        console.log('📊 고객 등급별 카운트 업데이트 시작...');
        
        if (!window.customerDataManager) {
            console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
            return;
        }
        
        const customers = window.customerDataManager.getAllCustomers();
        console.log(`📋 전체 고객 수: ${customers.length}`);
        
        // 환경설정에서 고객등급 정보 로드
        const grades = await loadCustomerGradesFromSettings();
        
        // 등급별 카운트 계산
        const gradeCounts = {
            'all': customers.length
        };
        
        // 환경설정의 등급별로 카운트 계산
        grades.forEach(grade => {
            gradeCounts[grade.code] = customers.filter(c => c.grade === grade.code).length;
        });
        
        console.log('📊 등급별 카운트:', gradeCounts);
        
        // 각 등급별 카운트 업데이트
        Object.keys(gradeCounts).forEach(grade => {
            const countElement = document.getElementById(`customer-count-${grade}`);
            if (countElement) {
                countElement.textContent = gradeCounts[grade];
                console.log(`✅ ${grade} 카운트 업데이트: ${gradeCounts[grade]}`);
            } else {
                console.warn(`⚠️ customer-count-${grade} 요소를 찾을 수 없습니다`);
            }
        });
        
        console.log('✅ 고객 등급별 카운트 업데이트 완료');
        
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
        console.log('✅ 고객 정렬 버튼 이벤트 리스너 등록 완료');
    } else {
        console.warn('⚠️ apply-customer-sort 버튼을 찾을 수 없습니다');
    }
    
    // Select 변경 시에도 바로 적용 (선택적)
    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
        console.log('✅ 고객 정렬 select 이벤트 리스너 등록 완료');
    } else {
        console.warn('⚠️ customer-sort 요소를 찾을 수 없습니다');
    }
}

// 페이지 로드 시 이벤트 리스너 설정
window.initCustomerSortListener = initCustomerSortListener;

// DOM 로드 완료 후 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomerSortListener);
} else {
    // 이미 로드된 경우 즉시 실행
    setTimeout(initCustomerSortListener, 100);
}

// 고객 상세 패널 닫기
function closeCustomerDetail() {
    document.querySelector('.customer-admin-layout')?.classList.remove('detail-open');
    document.querySelectorAll('.customer-row').forEach(r => r.classList.remove('selected'));
    const dc = document.getElementById('customer-detail-content');
    if (dc) dc.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <i class="fas fa-user-circle text-4xl opacity-30"></i>
            <p class="text-sm">고객을 선택하면 상세 정보가 표시됩니다</p>
        </div>`;
}
window.closeCustomerDetail = closeCustomerDetail;

function toggleCustomerPanelFullpage() {
    const panel = document.querySelector('.customer-admin-main');
    if (!panel) return;
    const isFullpage = panel.classList.toggle('panel-fullpage');
    const btn = document.getElementById('panel-fullpage-btn');
    if (btn) {
        btn.title = isFullpage ? '패널로 보기' : '전체화면';
        btn.querySelector('i').className = isFullpage ? 'fas fa-compress text-xs' : 'fas fa-expand text-xs';
        btn.classList.toggle('text-blue-500', isFullpage);
        btn.classList.toggle('text-gray-400', !isFullpage);
    }
}
window.toggleCustomerPanelFullpage = toggleCustomerPanelFullpage;
