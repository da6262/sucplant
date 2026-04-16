// 고객관리 JavaScript 함수들
// js/customer-management.js

// 고객관리 컴포넌트 동적 로드
async function loadCustomerManagementComponent() {
    try {
        const mainContentElement = document.getElementById('mainContent');
        if (!mainContentElement) throw new Error('메인 콘텐츠 영역을 찾을 수 없습니다.');

        const existingSection = document.getElementById('customers-section');

        // ── 재방문: 이미 내용이 있으면 데이터만 새로고침 + 이벤트 재연결 ──
        if (existingSection && existingSection.dataset.loaded === 'true') {
            console.log('⚡ 고객관리 이미 로드됨 — 데이터 갱신 + 이벤트 재연결');
            if (typeof attachCustomerEventListeners === 'function') attachCustomerEventListeners();
            if (typeof attachCustomerGradesEventListeners === 'function') attachCustomerGradesEventListeners();
            if (window.renderCustomersTable) window.renderCustomersTable('all');
            if (window.customerDataManager) {
                window.customerDataManager.loadCustomers().then(() => {
                    if (window.renderCustomersTable) window.renderCustomersTable('all');
                    if (window.updateCustomerGradeCounts) window.updateCustomerGradeCounts();
                }).catch(() => {});
            }
            return true;
        }

        // ── 최초 로드: HTML fetch + 초기화 ──
        const response = await fetch('components/customer-management/customer-management.html', { cache: 'default' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();

        if (existingSection) {
            // index.html의 빈 placeholder가 있으면 내용을 직접 교체 (ID 중복 방지)
            existingSection.innerHTML = html;
            // customer-management.html 자체가 outer div를 포함하는 경우 내부 섹션으로 교체
            const inner = existingSection.querySelector('#customers-section');
            if (inner) {
                existingSection.replaceWith(inner);
            }
        } else {
            mainContentElement.insertAdjacentHTML('beforeend', html);
        }

        const section = document.getElementById('customers-section');
        if (!section) throw new Error('고객관리 섹션을 찾을 수 없습니다.');

        section.setAttribute('data-dynamic', 'true');

        if (typeof window.initCustomerManagementSection === 'function') {
            await window.initCustomerManagementSection();
        } else {
            await runCustomerManagementInit();
        }

        section.dataset.loaded = 'true';
        console.log('✅ 고객관리 컴포넌트 로드 완료');
        return true;

    } catch (error) {
        console.error('❌ 고객관리 컴포넌트 로드 실패:', error);
        alert('고객관리 화면을 로드할 수 없습니다: ' + error.message);
    }
}

// 고객관리 섹션 초기화 (데이터 로드 + 리스트 렌더 + 이벤트 연결) — index에서 HTML 로드 후 호출 가능
async function runCustomerManagementInit() {
    console.log('🔄 고객관리 초기화 시작');
    const customerListContainer = document.getElementById('customer-list-container');
    if (customerListContainer) {
        customerListContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3"><i class="fas fa-spinner fa-spin text-blue-600 text-lg"></i></div><p class="text-sm font-medium">고객 데이터를 불러오는 중...</p></div>';
    }
    if (window.customerDataManager) {
        try {
            await window.customerDataManager.loadCustomers();
            if (window.renderCustomersTable) window.renderCustomersTable('all');
        } catch (error) {
            console.error('❌ 고객 데이터 로드 실패:', error);
            if (customerListContainer) {
                customerListContainer.innerHTML = '<div class="text-center py-8 text-red-500"><p class="text-sm font-medium">고객 데이터를 불러올 수 없습니다.</p><button onclick="location.reload()" class="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">새로고침</button></div>';
            }
        }
        if (window.updateCustomerGradeCounts) window.updateCustomerGradeCounts();
        if (typeof attachCustomerEventListeners === 'function') attachCustomerEventListeners();
        if (typeof attachCustomerGradesEventListeners === 'function') attachCustomerGradesEventListeners();
        var phoneInput = document.getElementById('customer-form-phone');
        if (phoneInput) phoneInput.addEventListener('input', function() { if (window.formatPhoneNumber) window.formatPhoneNumber(this); });
        var addressSearchBtn = document.getElementById('customer-form-address-search');
        if (addressSearchBtn) addressSearchBtn.addEventListener('click', openAddressSearch);
    }
    console.log('✅ 고객관리 초기화 완료');
}

// 전역 노출 (index에서 HTML만 넣은 뒤 초기화할 때 사용)
window.initCustomerManagementSection = runCustomerManagementInit;

// 고객 저장 함수
async function saveCustomer() {
    try {
        console.log('💾 고객 저장 시작...');
        
        if (!window.customerDataManager) {
            console.error('❌ customerDataManager를 찾을 수 없습니다');
            alert('고객 데이터 관리자를 찾을 수 없습니다.');
            return;
        }
        
        // 폼 데이터 수집
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // 전화번호에서 숫자만 추출
        const phoneInput = document.getElementById('customer-form-phone')?.value || '';
        const phoneNumbers = phoneInput.replace(/[^0-9]/g, '');
        
        const customerData = {
            name: document.getElementById('customer-form-name')?.value || '',
            phone: phoneNumbers, // 숫자만 저장
            address: document.getElementById('customer-form-address')?.value || '',
            address_detail: document.getElementById('customer-form-address-detail')?.value || '', // 상세주소 추가
            email: document.getElementById('customer-form-email')?.value || '',
            grade: document.getElementById('customer-form-grade')?.value || 'GENERAL',
            registration_date: document.getElementById('customer-form-registration-date')?.value || today,
            memo: document.getElementById('customer-form-memo')?.value || ''
        };
        
        console.log('📞 전화번호 처리:', phoneInput, '→', phoneNumbers);
        
        console.log('📅 등록일 자동 설정:', customerData.registration_date);
        
        console.log('📝 수집된 고객 데이터:', customerData);
        
        // 필수 필드 검증
        if (!customerData.name || !customerData.phone) {
            alert('고객명과 전화번호는 필수 입력 항목입니다.');
            return;
        }
        
        // 고객 ID 확인 (수정 모드인지 등록 모드인지 구분)
        const customerId = document.getElementById('customer-id')?.value;
        console.log('🔍 고객 ID:', customerId);
        
        let result;
        
        if (customerId) {
            // 수정 모드
            console.log('✏️ 고객 수정 모드');
            
            // 고객명 중복 검사 (자기 자신 제외)
            if (window.checkCustomerNameDuplicate) {
                const canContinue = window.checkCustomerNameDuplicate(customerData.name, customerId);
                if (!canContinue) {
                    console.log('❌ 사용자가 고객 수정을 취소했습니다');
                    return;
                }
            }
            
            // 고객 수정
            result = await window.customerDataManager.updateCustomer(customerId, customerData);
        } else {
            // 등록 모드
            console.log('➕ 고객 등록 모드');
            
            // 고객명 중복 검사
            if (window.checkCustomerNameDuplicate) {
                const canContinue = window.checkCustomerNameDuplicate(customerData.name);
                if (!canContinue) {
                    console.log('❌ 사용자가 고객 등록을 취소했습니다');
                    return;
                }
            }
            
            // 고객 추가
            result = await window.customerDataManager.addCustomer(customerData);
        }
        
        if (result) {
            console.log('✅ 고객 저장 완료');
            console.log('🔍 tempCustomerName 상태:', window.tempCustomerName);
            alert('고객이 성공적으로 저장되었습니다.');
            
            // 주문 폼에서 온 경우 주문 폼으로 돌아가기
            if (window.tempCustomerName) {
                console.log('🔄 주문 폼으로 돌아가기 - tempCustomerName:', window.tempCustomerName);

                // 저장된 고객의 실제 ID·grade 확보 (callback 및 후속 주문 생성에 필요)
                let newCustomer = null;
                try {
                    const list = window.customerDataManager?.getAllCustomers?.() || window.customerDataManager?.customers || [];
                    newCustomer = list.find(c => c?.phone === customerData.phone) || null;
                } catch (_) {}
                const fullCustomer = {
                    id: newCustomer?.id || result?.id || null,
                    name: customerData.name,
                    phone: customerData.phone,
                    address: customerData.address,
                    address_detail: customerData.address_detail || '',
                    grade: newCustomer?.grade || 'GENERAL'
                };

                // 고객 모달 닫기
                if (window.closeCustomerModal) {
                    window.closeCustomerModal();
                }

                // 주문 모달 다시 표시 — inline display 금지 (closeOrderModal X 버튼 무효화 방지)
                const orderModal = document.getElementById('order-modal');
                if (orderModal) {
                    orderModal.classList.remove('hidden');
                    orderModal.style.display = '';
                }

                // orderForm 의 selectCustomerFromSearch 직접 호출로 customer_id·grade·UI 완전 동기화
                // (기존 callback 메커니즘이 일부 경로에서 등록되지 않는 문제 회피)
                setTimeout(() => {
                    if (typeof window.selectCustomerFromSearch === 'function') {
                        try {
                            console.log('🔄 selectCustomerFromSearch 직접 호출로 고객 완전 동기화');
                            window.selectCustomerFromSearch(
                                fullCustomer.id,
                                fullCustomer.name,
                                fullCustomer.phone,
                                fullCustomer.address,
                                fullCustomer.grade,
                                fullCustomer.address_detail
                            );
                        } catch (err) {
                            console.error('❌ selectCustomerFromSearch 호출 실패:', err);
                        }
                    } else {
                        console.warn('⚠️ selectCustomerFromSearch 미등록 — 필드 직접 채움 폴백');
                        const nameEl = document.getElementById('order-customer-name');
                        const phoneEl = document.getElementById('order-customer-phone');
                        const addrEl  = document.getElementById('order-customer-address');
                        if (nameEl)  nameEl.value  = fullCustomer.name;
                        if (phoneEl) phoneEl.value = fullCustomer.phone;
                        if (addrEl)  addrEl.value  = fullCustomer.address;
                    }
                    // 레거시 callback 있으면 함께 실행
                    if (window.customerModalCallback) {
                        try { window.customerModalCallback(fullCustomer); } catch (_) {}
                        window.customerModalCallback = null;
                    }
                }, 50);  // 주문 모달 재표시 직후 DOM 안정화 대기

                window.tempCustomerName = null;
                console.log('✅ 주문 폼으로 돌아가기 완료');
                return;
            }
            
            // 콜백 함수가 있으면 실행 (대기자 등록에서 온 경우)
            if (window.customerModalCallback) {
                console.log('🔄 고객 등록 완료 - 콜백 실행');
                try {
                    window.customerModalCallback(customerData);
                    console.log('✅ 콜백 실행 완료');
                } catch (callbackError) {
                    console.error('❌ 콜백 실행 실패:', callbackError);
                }
                // 콜백 실행 후 초기화
                window.customerModalCallback = null;
                
                // 콜백 실행 후에도 모달 닫기
                if (window.closeCustomerModal) {
                    console.log('🔄 콜백 실행 후 모달 닫기');
                    window.closeCustomerModal();
                }
                return;
            }
            
            // 일반적인 고객 관리에서 온 경우
            // 모달 닫기
            if (window.closeCustomerModal) {
                console.log('🔄 일반 고객 관리에서 모달 닫기');
                window.closeCustomerModal();
            }
            
            // 테이블 새로고침
            if (window.renderCustomersTable) {
                window.renderCustomersTable('all');
            }
            
            // 등급별 카운트 업데이트
            if (window.updateCustomerGradeCounts) {
                window.updateCustomerGradeCounts();
            }
        } else {
            console.error('❌ 고객 저장 실패');
            alert('고객 저장에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('❌ 고객 저장 중 오류:', error);
        
        // 전화번호 중복 오류인 경우 특별 처리
        if (error.message.includes('이미 등록된 전화번호')) {
            alert('❌ 전화번호 중복 오류\n\n이미 등록된 전화번호입니다.\n다른 전화번호를 입력하거나 기존 고객을 수정해주세요.');
            
            // 전화번호 필드에 포커스
            const phoneInput = document.getElementById('customer-form-phone');
            if (phoneInput) {
                phoneInput.focus();
                phoneInput.select();
            }
        } else if (error.message.includes('이미 등록된 고객명')) {
            alert('❌ 고객명 중복 오류\n\n동일한 이름의 고객이 이미 등록되어 있습니다.\n다른 이름을 사용하거나 기존 고객을 수정해주세요.');
            
            // 고객명 필드에 포커스
            const nameInput = document.getElementById('customer-form-name');
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        } else {
            alert('❌ 고객 저장 중 오류가 발생했습니다:\n\n' + error.message);
        }
    }
}

// 고객등급관리 이벤트 리스너 연결 함수
function attachCustomerGradesEventListeners() {
    console.log('🔄 고객등급관리 이벤트 리스너 연결 중...');
    
    // 등급 관리 → 환경설정 탭으로 이동
    const manageGradesBtn = document.getElementById('manage-customer-grades-btn');
    if (manageGradesBtn) {
        manageGradesBtn.onclick = async () => {
            if (window.switchTab) {
                await window.switchTab('settings');
                if (window.showSettingsTab) {
                    window.showSettingsTab('customers');
                }
            }
        };
        console.log('✅ 고객등급 관리 버튼 → 환경설정 이동으로 연결');
    }
    
    console.log('✅ 고객등급관리 이벤트 리스너 연결 완료');
}

// 고객등급관리 모달 열기 함수
function openCustomerGradesModal() {
    console.log('🔄 고객등급 관리 모달 열기');
    
    const gradesModal = document.getElementById('customer-grades-modal');
    if (gradesModal) {
        gradesModal.classList.remove('hidden');
        
        // 모달이 열릴 때 이벤트 리스너 연결
        attachCustomerGradesModalEventListeners();
        
        // 고객등급 목록 로드
        loadCustomerGrades();
    } else {
        console.error('❌ 고객등급관리 모달을 찾을 수 없습니다');
    }
}

// 고객등급관리 모달 내부 이벤트 리스너 연결
function attachCustomerGradesModalEventListeners() {
    console.log('🔄 고객등급관리 모달 내부 이벤트 리스너 연결 중...');
    
    const closeGradesModal = document.getElementById('close-customer-grades-modal');
    const cancelGradesBtn = document.getElementById('cancel-customer-grades');
    const saveGradesBtn = document.getElementById('save-customer-grades');
    const addGradeBtn = document.getElementById('add-customer-grade-btn');
    
    console.log('🔍 고객등급관리 모달 요소들:', {
        closeGradesModal,
        cancelGradesBtn,
        saveGradesBtn,
        addGradeBtn
    });
    
    // 모달 닫기 함수
    function closeModal() {
        console.log('🔄 고객등급관리 모달 닫기');
        const gradesModal = document.getElementById('customer-grades-modal');
        if (gradesModal) {
            gradesModal.classList.add('hidden');
            gradesModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // X 버튼 닫기 (중복 방지)
    if (closeGradesModal && !closeGradesModal.hasAttribute('data-listener-attached')) {
        closeGradesModal.addEventListener('click', function(e) {
            console.log('🔄 X 버튼 클릭됨');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        closeGradesModal.setAttribute('data-listener-attached', 'true');
        console.log('✅ X 버튼 이벤트 리스너 연결');
    } else if (closeGradesModal) {
        console.log('ℹ️ X 버튼 이벤트 리스너 이미 연결됨');
    } else {
        console.warn('⚠️ X 버튼을 찾을 수 없습니다');
    }
    
    // 취소 버튼 닫기 (중복 방지)
    if (cancelGradesBtn && !cancelGradesBtn.hasAttribute('data-listener-attached')) {
        cancelGradesBtn.addEventListener('click', function(e) {
            console.log('🔄 취소 버튼 클릭됨');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        cancelGradesBtn.setAttribute('data-listener-attached', 'true');
        console.log('✅ 취소 버튼 이벤트 리스너 연결');
    } else if (cancelGradesBtn) {
        console.log('ℹ️ 취소 버튼 이벤트 리스너 이미 연결됨');
    } else {
        console.warn('⚠️ 취소 버튼을 찾을 수 없습니다');
    }
    
    // 저장 버튼 이벤트 리스너 (중복 방지)
    if (saveGradesBtn && !saveGradesBtn.hasAttribute('data-listener-attached')) {
        saveGradesBtn.addEventListener('click', saveCustomerGrades);
        saveGradesBtn.setAttribute('data-listener-attached', 'true');
        console.log('✅ 저장 버튼 이벤트 리스너 연결');
    } else if (saveGradesBtn) {
        console.log('ℹ️ 저장 버튼 이벤트 리스너 이미 연결됨');
    } else {
        console.warn('⚠️ 저장 버튼을 찾을 수 없습니다');
    }
    
    // 등급 추가 버튼 이벤트 리스너 (중복 방지)
    if (addGradeBtn && !addGradeBtn.hasAttribute('data-listener-attached')) {
        addGradeBtn.addEventListener('click', addNewCustomerGrade);
        addGradeBtn.setAttribute('data-listener-attached', 'true');
        console.log('✅ 등급 추가 버튼 이벤트 리스너 연결');
    } else if (addGradeBtn) {
        console.log('ℹ️ 등급 추가 버튼 이벤트 리스너 이미 연결됨');
    } else {
        console.warn('⚠️ 등급 추가 버튼을 찾을 수 없습니다');
    }
    
    // 배경 클릭으로 닫기 (중복 방지)
    const gradesModal = document.getElementById('customer-grades-modal');
    if (gradesModal && !gradesModal.hasAttribute('data-listener-attached')) {
        gradesModal.addEventListener('click', function(e) {
            if (e.target === gradesModal) {
                console.log('🔄 배경 클릭됨');
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            }
        });
        gradesModal.setAttribute('data-listener-attached', 'true');
        console.log('✅ 배경 클릭 이벤트 리스너 연결');
    } else if (gradesModal) {
        console.log('ℹ️ 배경 클릭 이벤트 리스너 이미 연결됨');
    }
    
    console.log('✅ 고객등급관리 모달 내부 이벤트 리스너 연결 완료');
}

// 고객등급 목록 로드 함수 (farm_settings.settings.customerGrades 사용 - 별도 테이블 아님)
async function loadCustomerGrades() {
    console.log('🔄 고객등급 목록 로드 시작...');
    try {
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return;
        }
        
        const { data, error } = await window.supabaseClient
            .from('farm_settings')
            .select('settings')
            .eq('id', 1)
            .single();
        
        if (error) {
            console.error('❌ 고객등급 로드 실패:', error);
            const gradesList = document.getElementById('customer-grades-list');
            if (gradesList) gradesList.innerHTML = '<p class="text-gray-500 text-center py-4">등록된 고객등급이 없습니다.</p>';
            return;
        }
        
        const grades = (data && data.settings && data.settings.customerGrades && Array.isArray(data.settings.customerGrades))
            ? data.settings.customerGrades
            : [];
        
        const gradesList = document.getElementById('customer-grades-list');
        if (gradesList) {
            gradesList.innerHTML = '';
            
            if (grades.length > 0) {
                grades.forEach((grade, index) => {
                    const name = grade.name || '';
                    const color = grade.color || '#6B7280';
                    const icon = grade.icon || 'fas fa-circle';
                    const minAmount = grade.minAmount != null ? grade.minAmount : (grade.min_amount != null ? grade.min_amount : 0);
                    const discount = grade.discount != null ? grade.discount : 0;
                    const id = grade.code || `grade-${index}`;
                    const gradeItem = document.createElement('div');
                    gradeItem.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2';
                    gradeItem.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${color}">
                                <i class="${icon} text-white text-sm"></i>
                            </div>
                            <div>
                                <h5 class="font-medium text-gray-900">${name}</h5>
                                <p class="text-sm text-gray-600">최소 구매액: ${Number(minAmount).toLocaleString()}원 | 할인율: ${discount}%</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button class="edit-grade-btn text-blue-600 hover:text-blue-800 text-sm" data-grade-id="${id}" data-grade-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-grade-btn text-red-600 hover:text-red-800 text-sm" data-grade-id="${id}" data-grade-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    gradesList.appendChild(gradeItem);
                });
            } else {
                gradesList.innerHTML = '<p class="text-gray-500 text-center py-4">등록된 고객등급이 없습니다.</p>';
            }
        }
        
        console.log('✅ 고객등급 목록 로드 완료 (farm_settings 기준)');
    } catch (error) {
        console.error('❌ 고객등급 목록 로드 실패:', error);
    }
}

// 고객등급 자동 계산 및 업데이트 함수
async function updateCustomerGrade(customerId, totalPurchaseAmount) {
    try {
        console.log(`🔄 고객등급 자동 업데이트 시작 - 고객ID: ${customerId}, 총구매액: ${totalPurchaseAmount.toLocaleString()}원`);
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return;
        }
        
        // 현재 고객등급 설정 로드
        const grades = await loadCustomerGradesFromSettings();
        if (!grades || grades.length === 0) {
            console.warn('⚠️ 고객등급 설정을 찾을 수 없습니다');
            return;
        }
        
        // 등급 적용 기간 설정 로드
        const { data: settingsData, error: settingsError } = await window.supabaseClient
            .from('farm_settings')
            .select('settings')
            .eq('id', 1)
            .single();
        
        const gradePeriod = settingsData?.settings?.gradePeriod || 'all';
        console.log('📅 등급 적용 기간:', gradePeriod);
        
        // 기간에 따라 구매금액 재계산 (필요시)
        let calculatedAmount = totalPurchaseAmount;
        if (gradePeriod !== 'all') {
            // 기간별 주문 데이터 조회
            const periodDate = new Date();
            if (gradePeriod === '1year') {
                periodDate.setFullYear(periodDate.getFullYear() - 1);
            } else if (gradePeriod === '6months') {
                periodDate.setMonth(periodDate.getMonth() - 6);
            } else if (gradePeriod === '3months') {
                periodDate.setMonth(periodDate.getMonth() - 3);
            }
            
            const { data: orders, error: ordersError } = await window.supabaseClient
                .from('farm_orders')
                .select('order_amount')
                .eq('customer_id', customerId)
                .gte('created_at', periodDate.toISOString());
            
            if (!ordersError && orders) {
                calculatedAmount = orders.reduce((sum, order) => sum + parseFloat(order.order_amount || 0), 0);
                console.log(`📊 ${gradePeriod} 기간 구매금액:`, calculatedAmount);
            }
        }
        
        // 총 구매금액에 따른 적절한 등급 찾기
        let newGrade = grades[0]; // 기본값: 일반 등급
        const amount = Number(calculatedAmount) || 0;
        
        for (let i = grades.length - 1; i >= 0; i--) {
            const minAmount = Number(grades[i].minAmount ?? grades[i].min_amount ?? 0);
            if (amount >= minAmount) {
                newGrade = grades[i];
                break;
            }
        }
        
        const minVal = Number(newGrade.minAmount ?? newGrade.min_amount ?? 0);
        console.log(`📊 계산된 새 등급: ${newGrade.name} (최소금액: ${minVal.toLocaleString()}원)`);
        
        const gradeCode = newGrade.code || newGrade.grade_code || 'GENERAL';
        const { error } = await window.supabaseClient
            .from('farm_customers')
            .update({ 
                grade: gradeCode,
                updated_at: new Date().toISOString()
            })
            .eq('id', customerId);
        
        if (error) {
            console.error('❌ 고객등급 업데이트 실패:', error);
            return;
        }
        
        console.log(`✅ 고객등급 업데이트 완료: ${newGrade.name} (${newGrade.discount}% 할인)`);
        
        // 고객 목록 새로고침 (현재 페이지가 고객관리인 경우)
        if (window.renderCustomersTable) {
            window.renderCustomersTable('all');
        }
        
        // 고객 등급별 카운트 업데이트
        if (window.updateCustomerGradeCounts) {
            window.updateCustomerGradeCounts();
        }
        
        return newGrade;
        
    } catch (error) {
        console.error('❌ 고객등급 자동 업데이트 실패:', error);
    }
}

// 고객관리에서 고객등급 정보 로드
async function loadCustomerGradesFromSettings() {
    try {
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return getDefaultCustomerGrades();
        }
        
        const { data, error } = await window.supabaseClient
            .from('farm_settings')
            .select('settings')
            .eq('id', 1)
            .single();
        
        if (error) {
            console.warn('⚠️ 고객등급 설정 로드 실패, 기본 등급 사용:', error);
            return getDefaultCustomerGrades();
        }
        
        if (data && data.settings && data.settings.customerGrades) {
            console.log('✅ 고객관리에서 고객등급 로드 완료');
            return data.settings.customerGrades;
        }
        
        return getDefaultCustomerGrades();
        
    } catch (error) {
        console.error('❌ 고객등급 설정 로드 실패:', error);
        return getDefaultCustomerGrades();
    }
}

// 기본 고객등급 정보
function getDefaultCustomerGrades() {
    return [
        { name: '일반', code: 'GENERAL', minAmount: 0, discount: 0, color: '#6B7280', icon: 'fas fa-circle' },
        { name: '그린리프', code: 'GREEN_LEAF', minAmount: 100000, discount: 5, color: '#10B981', icon: 'fas fa-hexagon' },
        { name: '레드루비', code: 'RED_RUBY', minAmount: 300000, discount: 8, color: '#EF4444', icon: 'fas fa-octagon' },
        { name: '퍼플엠퍼러', code: 'PURPLE_EMPEROR', minAmount: 500000, discount: 10, color: '#8B5CF6', icon: 'fas fa-pentagon' },
        { name: '블랙다이아몬드', code: 'BLACK_DIAMOND', minAmount: 1000000, discount: 15, color: '#374151', icon: 'fas fa-square' }
    ];
}

// 고객등급 관리 모달 열기
function openCustomerGradesModal() {
    try {
        console.log('👑 고객등급 관리 모달 열기');
        
        const modal = document.getElementById('customer-grades-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 고객등급 목록 로드
            loadCustomerGradesList();
            
            // 이벤트 리스너 연결
            attachCustomerGradesModalEventListeners();
        } else {
            console.error('❌ 고객등급 관리 모달을 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 고객등급 관리 모달 열기 실패:', error);
    }
}

// 고객등급 관리 모달 닫기
function closeCustomerGradesModal() {
    try {
        console.log('🔄 고객등급 관리 모달 닫기');
        const modal = document.getElementById('customer-grades-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 이벤트 리스너 정리 (선택사항)
            const elements = [
                'close-customer-grades-modal',
                'cancel-customer-grades',
                'save-customer-grades',
                'add-customer-grade-btn'
            ];
            
            elements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element && element.hasAttribute('data-listener-attached')) {
                    // 이벤트 리스너는 자동으로 정리되므로 속성만 제거
                    element.removeAttribute('data-listener-attached');
                }
            });
            
            console.log('✅ 고객등급 관리 모달 닫기 완료');
        } else {
            console.warn('⚠️ 고객등급 관리 모달을 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 고객등급 관리 모달 닫기 실패:', error);
    }
}

// 고객등급 목록 로드
async function loadCustomerGradesList() {
    try {
        console.log('📋 고객등급 목록 로드 중...');
        
        const grades = await loadCustomerGradesFromSettings();
        const gradesList = document.getElementById('customer-grades-list');
        
        if (!gradesList) {
            console.error('❌ 고객등급 목록 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        gradesList.innerHTML = '';
        
        grades.forEach((grade, index) => {
            const gradeCard = document.createElement('div');
            gradeCard.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
            gradeCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white" style="background-color: ${grade.color}">
                            <i class="${grade.icon}"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${grade.name}</h4>
                            <p class="text-sm text-gray-600">최소 구매금액: ${grade.minAmount.toLocaleString()}원</p>
                            <p class="text-sm text-gray-600">할인율: ${grade.discount}%</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="editCustomerGrade(${index})" class="text-blue-600 hover:text-blue-800 transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCustomerGrade(${index})" class="text-red-600 hover:text-red-800 transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            gradesList.appendChild(gradeCard);
        });
        
        console.log('✅ 고객등급 목록 로드 완료:', grades.length + '개');
        
    } catch (error) {
        console.error('❌ 고객등급 목록 로드 실패:', error);
    }
}

// 새 고객등급 추가
function addNewCustomerGrade() {
    console.log('➕ 새 고객등급 추가');
    // TODO: 새 고객등급 추가 폼 구현
}

// 고객등급 편집
function editCustomerGrade(index) {
    console.log('✏️ 고객등급 편집:', index);
    // TODO: 고객등급 편집 폼 구현
}

// 고객등급 삭제
function deleteCustomerGrade(index) {
    console.log('🗑️ 고객등급 삭제:', index);
    // TODO: 고객등급 삭제 확인 및 실행
}

// 고객등급 저장
async function saveCustomerGrades() {
    try {
        console.log('💾 고객등급 저장 중...');
        // TODO: 고객등급 저장 로직 구현
        closeCustomerGradesModal();
    } catch (error) {
        console.error('❌ 고객등급 저장 실패:', error);
    }
}

// 전역 함수로 등록
window.openCustomerGradesModal = openCustomerGradesModal;
window.closeCustomerGradesModal = closeCustomerGradesModal;
window.addNewCustomerGrade = addNewCustomerGrade;
window.editCustomerGrade = editCustomerGrade;
window.deleteCustomerGrade = deleteCustomerGrade;
window.saveCustomerGrades = saveCustomerGrades;

// 고객관리 이벤트 리스너 정리 함수
function cleanupCustomerEventListeners() {
    try {
        console.log('🧹 고객관리 이벤트 리스너 정리 중...');
        
        // 모든 고객관리 관련 이벤트 리스너를 강제로 제거
        const customerElements = [
            'add-customer-btn',
            'customer-search',
            'customer-filter',
            'customer-sort',
            'reset-customer-search',
            'manage-customer-grades-btn',
            'customer-form-phone',
            'customer-form-address-search'
        ];
        
        customerElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                // 기존 이벤트 리스너를 완전히 제거하기 위해 요소를 복제
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
        
        // 고객 등급 탭 버튼들 정리
        const gradeTabs = document.querySelectorAll('.customer-tab-btn');
        gradeTabs.forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
        });
        
        // 고객 테이블 관련 이벤트 리스너 정리
        const customerTable = document.getElementById('customers-table');
        if (customerTable) {
            const newTable = customerTable.cloneNode(true);
            customerTable.parentNode.replaceChild(newTable, customerTable);
        }
        
        // 고객 모달 관련 이벤트 리스너 정리
        const customerModal = document.getElementById('customer-modal');
        if (customerModal) {
            const newModal = customerModal.cloneNode(true);
            customerModal.parentNode.replaceChild(newModal, customerModal);
        }
        
        // 고객등급 모달 관련 이벤트 리스너 정리
        const gradesModal = document.getElementById('customer-grades-modal');
        if (gradesModal) {
            const newModal = gradesModal.cloneNode(true);
            gradesModal.parentNode.replaceChild(newModal, gradesModal);
        }
        
        // 전역 이벤트 리스너 정리
        if (window.customerEventListeners) {
            window.customerEventListeners.forEach(listener => {
                if (listener.element && listener.event && listener.handler) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                }
            });
            window.customerEventListeners = [];
        }
        
        console.log('✅ 고객관리 이벤트 리스너 정리 완료');
    } catch (error) {
        console.error('❌ 고객관리 이벤트 리스너 정리 실패:', error);
    }
}

// 전역 함수로 등록
window.updateCustomerGrade = updateCustomerGrade;
window.loadCustomerGradesFromSettings = loadCustomerGradesFromSettings;
window.cleanupCustomerEventListeners = cleanupCustomerEventListeners;

// 고객관리 이벤트 리스너 연결 함수
function attachCustomerEventListeners() {
    try {
        console.log('🔗 고객관리 이벤트 리스너 연결 시작...');
        
        // 이벤트 리스너 추적 배열 초기화
        if (!window.customerEventListeners) {
            window.customerEventListeners = [];
        }
        
        // 새 고객 등록 버튼
        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.onclick = async function() {
                console.log('➕ 새 고객 등록 버튼 클릭');
                
                // 고객 모달이 없으면 동적으로 로드
                let modal = document.getElementById('customer-modal');
                if (!modal) {
                    console.log('📦 고객 모달이 없습니다. 동적 로드 시작...');
                    try {
                        await loadCustomerModal();
                        modal = document.getElementById('customer-modal');
                        console.log('🔍 로드된 모달 요소:', modal);
                        
                        if (!modal) {
                            console.error('❌ 고객 모달 로드 실패');
                            alert('고객 등록 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                            return;
                        }
                    } catch (loadError) {
                        console.error('❌ 고객 모달 로드 중 오류:', loadError);
                        alert('고객 등록 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
                        return;
                    }
                }
                
                // 모달 열기
                if (window.openCustomerModal) {
                    console.log('🔄 openCustomerModal 함수 호출 중...');
                    await window.openCustomerModal();
                    console.log('✅ openCustomerModal 함수 호출 완료');
                } else {
                    console.warn('⚠️ openCustomerModal 함수를 찾을 수 없습니다');
                    console.log('🔍 window 객체 확인:', Object.keys(window).filter(key => key.includes('Customer')));
                }
            };
            console.log('✅ 새 고객 등록 버튼 이벤트 리스너 연결 완료');
        }
        
        // 고객 검색
        const customerSearch = document.getElementById('customer-search');
        if (customerSearch) {
            let isComposing = false;
            const doSearch = function() {
                const searchTerm = customerSearch.value.trim();
                const activeGradeBtn = document.querySelector('.customer-tab-btn.active');
                const gradeFilter = activeGradeBtn ? activeGradeBtn.id.replace('customer-grade-', '') : 'all';
                if (window.renderCustomersTable) {
                    window.renderCustomersTable(gradeFilter, searchTerm);
                }
            };
            customerSearch.addEventListener('compositionstart', () => { isComposing = true; });
            customerSearch.addEventListener('compositionend', () => {
                isComposing = false;
                doSearch();
            });
            customerSearch.addEventListener('input', function() {
                if (!isComposing) doSearch();
            });
            console.log('✅ 고객 검색 이벤트 리스너 연결 완료');
        }
        
        // 고객 데이터 다운로드 버튼
        const downloadBtn = document.querySelector('button i.fa-download')?.closest('button');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                console.log('📥 고객 데이터 다운로드 버튼 클릭');
                exportCustomerData();
            });
            console.log('✅ 고객 데이터 다운로드 버튼 이벤트 리스너 연결 완료');
        } else {
            console.warn('⚠️ 고객 데이터 다운로드 버튼을 찾을 수 없습니다');
        }
        
        // 고객관리 설정 버튼 (고객관리 섹션 내에서만 찾기)
        const customerSection = document.getElementById('customers-section');
        if (customerSection) {
            // 고객관리 설정 버튼을 더 구체적으로 찾기
            let settingsBtn = customerSection.querySelector('button[id*="customer-settings"], button[class*="customer-settings"]');
            if (!settingsBtn) {
                // ID나 클래스로 찾지 못하면 아이콘으로 찾기 (하지만 환경설정과 구분)
                const cogButtons = customerSection.querySelectorAll('button i.fa-cog');
                cogButtons.forEach(btn => {
                    const button = btn.closest('button');
                    // 환경설정 버튼이 아닌지 확인
                    if (button && !button.id.includes('settings') && !button.classList.contains('settings-tab')) {
                        settingsBtn = button;
                    }
                });
            }
            
            if (settingsBtn) {
                settingsBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('⚙️ 고객관리 설정 버튼 클릭');
                    showCustomerManagementSettings();
                });
                console.log('✅ 고객관리 설정 버튼 이벤트 리스너 연결 완료');
            } else {
                console.log('📋 고객관리 설정 버튼을 찾을 수 없습니다 (정상)');
            }
        } else {
            console.log('📋 고객관리 섹션이 없어서 설정 버튼 이벤트 리스너 건너뜀');
        }
        
        // 고객 정렬
        const customerSort = document.getElementById('customer-sort');
        if (customerSort) {
            customerSort.addEventListener('change', function(e) {
                const sortBy = e.target.value;
                console.log('🔄 고객 정렬 변경:', sortBy);
                
                // 정렬 적용
                if (window.customerDataManager) {
                    window.customerDataManager.customerSortBy = sortBy;
                }
                
                // 현재 활성 등급 필터 확인
                const activeGradeButton = document.querySelector('.customer-tab-btn.active');
                const gradeFilter = activeGradeButton 
                    ? activeGradeButton.id.replace('customer-grade-', '')
                    : 'all';
                
                // 테이블 다시 렌더링 (검색어 유지)
                const searchTerm = (document.getElementById('customer-search')?.value || '').trim();
                if (window.renderCustomersTable) {
                    window.renderCustomersTable(gradeFilter, searchTerm);
                }
            });
            console.log('✅ 고객 정렬 이벤트 리스너 연결 완료');
        }
        
        // 고객 등급별 필터 탭
        const gradeTabs = document.querySelectorAll('.customer-tab-btn');
        gradeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const grade = this.id.replace('customer-grade-', '');
                console.log('🏷️ 고객 등급 필터:', grade);
                
                // 활성 탭 표시
                gradeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 테이블 필터링 (검색어 유지)
                const searchTerm = (document.getElementById('customer-search')?.value || '').trim();
                if (window.renderCustomersTable) {
                    window.renderCustomersTable(grade, searchTerm);
                }
            });
        });
        console.log('✅ 고객 등급 필터 이벤트 리스너 연결 완료');
        
        // 검색 초기화 버튼
        const resetSearchBtn = document.getElementById('reset-customer-search');
        if (resetSearchBtn) {
            resetSearchBtn.addEventListener('click', function() {
                console.log('🔄 고객 검색 초기화');
                
                // 검색 필드 초기화
                if (customerSearch) {
                    customerSearch.value = '';
                }
                
                // 정렬 초기화
                if (customerSort) {
                    customerSort.value = 'newest';
                }
                
                // 전체 탭 활성화
                gradeTabs.forEach(t => t.classList.remove('active'));
                const allTab = document.getElementById('customer-grade-all');
                if (allTab) {
                    allTab.classList.add('active');
                }
                
                // 미납/대기 체크박스 초기화
                const filterUnpaid   = document.getElementById('filter-unpaid');
                const filterWaitlist = document.getElementById('filter-waitlist');
                if (filterUnpaid)   filterUnpaid.checked   = false;
                if (filterWaitlist) filterWaitlist.checked = false;

                // 테이블 초기화
                if (window.renderCustomersTable) {
                    window.renderCustomersTable('all');
                }
            });
            console.log('✅ 고객 검색 초기화 버튼 이벤트 리스너 연결 완료');
        }

        // 미납 / 대기 체크박스 필터
        const filterUnpaidEl   = document.getElementById('filter-unpaid');
        const filterWaitlistEl = document.getElementById('filter-waitlist');
        const doCheckboxFilter = function() {
            const activeGradeBtn = document.querySelector('.customer-tab-btn.active');
            const gradeFilter = activeGradeBtn ? activeGradeBtn.id.replace('customer-grade-', '') : 'all';
            const searchTerm = (document.getElementById('customer-search')?.value || '').trim();
            if (window.renderCustomersTable) window.renderCustomersTable(gradeFilter, searchTerm);
        };
        if (filterUnpaidEl)   filterUnpaidEl.addEventListener('change',   doCheckboxFilter);
        if (filterWaitlistEl) filterWaitlistEl.addEventListener('change', doCheckboxFilter);
        console.log('✅ 미납/대기 체크박스 필터 이벤트 리스너 연결 완료');

        // 고객 모달 저장 버튼
        const saveCustomerBtn = document.querySelector('button[onclick="saveCustomer()"]');
        if (saveCustomerBtn) {
            // 기존 onclick 제거하고 이벤트 리스너 추가
            saveCustomerBtn.removeAttribute('onclick');
            saveCustomerBtn.addEventListener('click', function() {
                console.log('💾 고객 저장 버튼 클릭');
                if (window.saveCustomer) {
                    window.saveCustomer();
                } else {
                    console.warn('⚠️ saveCustomer 함수를 찾을 수 없습니다');
                }
            });
            console.log('✅ 고객 저장 버튼 이벤트 리스너 연결 완료');
        }
        
        // 페이지당 표시 수 — 전역 PageSize 컨트롤 사용
        if (window.PageSize) {
            window.PageSize.attach('customer-page-size', () => {
                const activeGradeBtn = document.querySelector('.customer-tab-btn.active');
                const gradeFilter = activeGradeBtn ? activeGradeBtn.id.replace('customer-grade-', '') : 'all';
                const searchTerm = customerSearch ? customerSearch.value.trim() : '';
                if (window.renderCustomersTable) window.renderCustomersTable(gradeFilter, searchTerm);
            }, 20);
        }

        console.log('✅ 고객관리 이벤트 리스너 연결 완료');

    } catch (error) {
        console.error('❌ 고객관리 이벤트 리스너 연결 실패:', error);
    }
}

// 고객 데이터 내보내기 함수
function exportCustomerData() {
    try {
        console.log('📥 고객 데이터 내보내기 시작...');
        
        if (!window.customerDataManager) {
            console.error('❌ customerDataManager를 찾을 수 없습니다');
            alert('고객 데이터를 불러올 수 없습니다.');
            return;
        }
        
        const customers = window.customerDataManager.getAllCustomers();
        console.log('📊 내보낼 고객 수:', customers.length);
        
        if (customers.length === 0) {
            alert('내보낼 고객 데이터가 없습니다.');
            return;
        }
        
        // 등급 표시명 변환 함수
        const getGradeDisplayName = (grade) => {
            const gradeMap = {
                'bronze': '브론즈',
                'silver': '실버', 
                'gold': '골드',
                'platinum': '플래티넘',
                'diamond': '다이아몬드'
            };
            return gradeMap[grade] || grade || '미지정';
        };

        // CSV 형식으로 변환
        const headers = ['이름', '전화번호', '이메일', '주소', '등급', '등록일', '메모'];
        const csvContent = [
            headers.join(','),
            ...customers.map(customer => [
                `"${customer.name || ''}"`,
                `"${customer.phone || ''}"`,
                `"${customer.email || ''}"`,
                `"${customer.address || ''}"`,
                `"${getGradeDisplayName(customer.grade)}"`,
                `"${customer.registration_date || ''}"`,
                `"${customer.memo || ''}"`
            ].join(','))
        ].join('\n');
        
        // 파일 다운로드
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `고객목록_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ 고객 데이터 내보내기 완료');
        
    } catch (error) {
        console.error('❌ 고객 데이터 내보내기 실패:', error);
        alert('고객 데이터를 내보내는 중 오류가 발생했습니다.');
    }
}

// 고객관리 설정 표시 함수
function showCustomerManagementSettings() {
    try {
        console.log('⚙️ 고객관리 설정 표시...');
        
        // 간단한 설정 옵션들을 표시하는 모달 또는 패널
        const settingsOptions = [
            '고객 등급 관리',
            '고객 필드 설정',
            '데이터 백업 설정',
            '알림 설정',
            '내보내기 형식 설정'
        ];
        
        let settingsHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">고객관리 설정</h3>
                            <button onclick="closeSettingsModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
        `;
        
        settingsOptions.forEach((option, index) => {
            settingsHTML += `
                <button onclick="handleSettingsOption('${option}')" 
                        class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center">
                        <i class="fas fa-cog text-gray-400 mr-3"></i>
                        <span class="text-gray-700">${option}</span>
                    </div>
                </button>
            `;
        });
        
        settingsHTML += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 기존 설정 모달이 있으면 제거
        const existingModal = document.getElementById('customer-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 설정 모달 추가
        const modal = document.createElement('div');
        modal.id = 'customer-settings-modal';
        modal.innerHTML = settingsHTML;
        document.body.appendChild(modal);
        
        console.log('✅ 고객관리 설정 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 고객관리 설정 표시 실패:', error);
        alert('설정을 불러오는 중 오류가 발생했습니다.');
    }
}

// 설정 모달 닫기 함수
function closeSettingsModal() {
    const modal = document.getElementById('customer-settings-modal');
    if (modal) {
        modal.remove();
    }
}

// 설정 옵션 처리 함수
function handleSettingsOption(option) {
    console.log('⚙️ 설정 옵션 선택:', option);
    
    switch(option) {
        case '고객 등급 관리':
            alert('고객 등급 관리 기능은 환경설정에서 사용할 수 있습니다.');
            break;
        case '고객 필드 설정':
            alert('고객 필드 설정 기능은 개발 중입니다.');
            break;
        case '데이터 백업 설정':
            alert('데이터 백업 설정 기능은 환경설정에서 사용할 수 있습니다.');
            break;
        case '알림 설정':
            alert('알림 설정 기능은 개발 중입니다.');
            break;
        case '내보내기 형식 설정':
            alert('내보내기 형식 설정 기능은 개발 중입니다.');
            break;
        default:
            alert('선택한 설정 옵션: ' + option);
    }
    
    closeSettingsModal();
}

// 이전 방식 모달 함수는 features/customers/customerUI.js로 이동됨

// 전역 함수 등록은 features/customers/customerUI.js에서 처리됨

// 고객 모달 동적 로드 함수
async function loadCustomerModal() {
    try {
        console.log('📦 고객 모달 컴포넌트 로드 중...');
        
        // 기존 모달이 있으면 제거하고 새로 로드
        const existingModal = document.getElementById('customer-modal');
        if (existingModal) {
            console.log('🔄 기존 모달 제거 중...');
            existingModal.remove();
        }
        
        // 고객 모달 컴포넌트 동적 로드 (강력한 캐시 방지)
        const timestamp = new Date().getTime();
        const randomId = Math.random().toString(36).substring(7);
        const version = 'v' + Date.now();
        const response = await fetch(`components/customer-management/customer-modal.html?t=${timestamp}&r=${randomId}&v=${version}&bust=${Math.random()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'If-Modified-Since': '0'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHTML = await response.text();
        console.log('📦 모달 HTML 로드 완료, 길이:', modalHTML.length);
        console.log('🔍 모달 HTML 내용 확인:', modalHTML.includes('grid-cols-3') ? '✅ 3열 레이아웃 포함' : '❌ 3열 레이아웃 없음');
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 고객 모달 컴포넌트 로드 완료');
        
        // 모달이 제대로 추가되었는지 확인
        const modal = document.getElementById('customer-modal');
        if (!modal) {
            throw new Error('모달이 DOM에 추가되지 않았습니다.');
        }
        console.log('✅ 모달 DOM 확인 완료');
        
        // 저장 버튼 이벤트 리스너 추가
        const saveCustomerBtn = document.querySelector('button[onclick="saveCustomer()"]');
        if (saveCustomerBtn) {
            saveCustomerBtn.removeAttribute('onclick');
            saveCustomerBtn.addEventListener('click', function() {
                console.log('💾 고객 저장 버튼 클릭');
                if (window.saveCustomer) {
                    window.saveCustomer();
                } else {
                    console.warn('⚠️ saveCustomer 함수를 찾을 수 없습니다');
                }
            });
            console.log('✅ 고객 저장 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 저장 버튼을 찾을 수 없습니다.');
        }
        
        // 닫기 버튼 이벤트 리스너 추가
        const closeCustomerBtn = document.getElementById('close-customer-modal');
        if (closeCustomerBtn) {
            closeCustomerBtn.addEventListener('click', function() {
                console.log('❌ 고객 모달 닫기 버튼 클릭');
                if (window.closeCustomerModal) {
                    window.closeCustomerModal();
                }
            });
            console.log('✅ 고객 모달 닫기 버튼 이벤트 리스너 추가 완료');
        } else {
            console.warn('⚠️ 닫기 버튼을 찾을 수 없습니다.');
        }
        
        // 모달 배경 클릭 시 닫기
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('🖱️ 모달 배경 클릭 - 모달 닫기');
                    if (window.closeCustomerModal) {
                        window.closeCustomerModal();
                    }
                }
            });
            console.log('✅ 모달 배경 클릭 이벤트 리스너 추가 완료');
        }
        
    } catch (error) {
        console.error('❌ 고객 모달 로드 실패:', error);
        throw error;
    }
}

// Daum 우편번호 서비스 로드
function loadDaumPostcodeService() {
    return new Promise((resolve, reject) => {
        // 이미 로드되어 있으면 바로 resolve
        if (typeof daum !== 'undefined' && daum.Postcode) {
            console.log('✅ Daum 우편번호 서비스 이미 로드됨');
            resolve();
            return;
        }
        
        console.log('📦 Daum 우편번호 서비스 로드 중...');
        
        // 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => {
            console.log('✅ Daum 우편번호 서비스 로드 완료');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Daum 우편번호 서비스 로드 실패');
            reject(new Error('Daum 우편번호 서비스 로드 실패'));
        };
        
        document.head.appendChild(script);
    });
}

// 주소 검색 함수
async function openAddressSearch() {
    try {
        console.log('🔍 주소 검색 시작');
        
        // Daum 우편번호 서비스 로드
        await loadDaumPostcodeService();
        
        // Daum 우편번호 서비스 사용
        if (typeof daum !== 'undefined' && daum.Postcode) {
            console.log('✅ Daum 우편번호 서비스 사용');
            
            const postcode = new daum.Postcode({
                width: '100%',
                height: '100%',
                maxSuggestItems: 5,
                showMoreHName: true,
                hideMapBtn: false,
                hideEngBtn: false,
                alwaysShowEngAddr: false,
                submitMode: true,
                oncomplete: function(data) {
                    console.log('🎯 ===== 주소 검색 oncomplete 이벤트 실행 =====');
                    console.log('📍 주소 검색 완료:', data);
                    console.log('📍 선택된 주소 데이터:', {
                        roadAddress: data.roadAddress,
                        jibunAddress: data.jibunAddress,
                        buildingName: data.buildingName,
                        zonecode: data.zonecode
                    });
                    console.log('🔍 이벤트 실행 시간:', new Date().toLocaleTimeString());
                    
                    // 주소 필드에 값 설정
                    console.log('🔍 주소 필드 찾기 시작...');
                    const addressField = document.getElementById('customer-form-address');
                    console.log('🔍 주소 필드 요소:', addressField);
                    
                    if (addressField) {
                        // 도로명 주소 우선, 없으면 지번 주소
                        let addr = data.roadAddress || data.jibunAddress || '';
                        console.log('🔍 설정할 주소:', addr);
                        addressField.value = addr;
                        console.log('✅ 주소 설정 완료:', addr);
                        console.log('🔍 주소 필드 현재 값:', addressField.value);
                        
                        // 주소 필드에 시각적 피드백 추가
                        addressField.style.backgroundColor = '#f0f9ff';
                        addressField.style.borderColor = '#3b82f6';
                        setTimeout(() => {
                            addressField.style.backgroundColor = '';
                            addressField.style.borderColor = '';
                        }, 2000);
                        
                        // 주소 필드에 입력 이벤트 발생시키기
                        console.log('🔍 입력 이벤트 발생 시도...');
                        addressField.dispatchEvent(new Event('input', { bubbles: true }));
                        addressField.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('✅ 입력 이벤트 발생 완료');
                    } else {
                        console.error('❌ 주소 필드를 찾을 수 없습니다!');
                    }
                    
                    // 상세주소 필드 포커스 및 안내
                    console.log('🔍 상세주소 필드 찾기 시작...');
                    const detailField = document.getElementById('customer-form-address-detail');
                    console.log('🔍 상세주소 필드 요소:', detailField);
                    
                    if (detailField) {
                        console.log('🔍 상세주소 필드 포커스 준비...');
                        // 잠시 후 포커스 이동 (DOM 업데이트 대기)
                        setTimeout(() => {
                            console.log('🔍 상세주소 필드 포커스 실행...');
                            detailField.focus();
                            detailField.placeholder = '상세주소를 입력하세요 (예: 101동 201호)';
                            detailField.style.backgroundColor = '#fef3c7';
                            detailField.style.borderColor = '#f59e0b';
                            console.log('✅ 상세주소 필드 포커스 완료');
                        }, 100);
                        
                        // 사용자에게 안내 메시지 표시
                        setTimeout(() => {
                            console.log('🔍 사용자 안내 메시지 표시...');
                            if (window.showToast) {
                                window.showToast('✅ 주소가 설정되었습니다. 상세주소를 입력해주세요.', 3000);
                                console.log('✅ 토스트 메시지 표시 완료');
                            } else {
                                alert('주소가 설정되었습니다. 상세주소를 입력해주세요.');
                                console.log('✅ 알림 메시지 표시 완료');
                            }
                        }, 200);
                    } else {
                        console.error('❌ 상세주소 필드를 찾을 수 없습니다!');
                    }
                    
                    // 주소 선택 후 창 닫기 (자동으로 닫히므로 수동 닫기 시도하지 않음)
                    console.log('🔒 주소 검색 창은 자동으로 닫힙니다');
                    console.log('🔍 postcode 객체:', postcode);
                    
                    // 주소 검색 창은 oncomplete 이벤트 후 자동으로 닫히므로
                    // 수동으로 닫기 시도하지 않음
                    
                    console.log('🎯 ===== 주소 검색 oncomplete 이벤트 완료 =====');
                },
                onresize: function(size) {
                    console.log('📏 주소 검색 창 크기 조정:', size);
                },
                onclose: function(state) {
                    console.log('❌ 주소 검색 창 닫기:', state);
                    
                    // 주소 검색 창이 닫힐 때 사용자에게 안내
                    if (state === 'FORCE_CLOSE') {
                        console.log('⚠️ 사용자가 주소 검색을 취소했습니다');
                        // 취소 시에는 안내 메시지만 표시하고 모달은 그대로 유지
                        if (window.showToast) {
                            window.showToast('주소 검색이 취소되었습니다.', 2000);
                        }
                    } else if (state === 'COMPLETE') {
                        console.log('✅ 주소 검색이 정상적으로 완료되었습니다');
                        // 정상 완료 시에는 추가 처리가 필요 없음
                    }
                }
            });
            
            // 주소 검색 창 열기
            postcode.open();
            
        } else {
            console.warn('⚠️ Daum 우편번호 서비스가 로드되지 않았습니다');
            
            // 대체 방법: 사용자 입력으로 주소 받기
            const userAddress = prompt('주소를 입력해주세요:');
            if (userAddress) {
                const addressField = document.getElementById('customer-form-address');
                if (addressField) {
                    addressField.value = userAddress;
                    console.log('✅ 수동 주소 입력 완료:', userAddress);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ 주소 검색 실패:', error);
        alert('주소 검색 중 오류가 발생했습니다: ' + error.message);
    }
}

// 주소 입력 시 Enter 키 → 자체 중앙 모달(420×460)로 Daum 검색 임베드
window.handleAddressInput = async function(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) return;

    try {
        await loadDaumPostcodeService();
    } catch (e) {
        console.warn('Daum 우편번호 로드 실패:', e);
        return;
    }
    if (typeof daum === 'undefined' || !daum.Postcode) return;

    // 하단 임베드 컨테이너 숨김 유지
    const legacyContainer = document.getElementById('address-embed-container');
    if (legacyContainer) { legacyContainer.classList.add('hidden'); legacyContainer.innerHTML = ''; }

    // 기존 모달 있으면 제거
    document.getElementById('daum-address-modal')?.remove();

    // 드래그 가능한 주소 검색 모달 (고객 모달 우측 옆)
    // 고객 모달 modal-sm 420px 기준: 중앙 + 240px = 우측 옆
    // 헤더에는 드래그 핸들만(X 제거) — Daum embed 내부에 기본 닫기 버튼 있어 중복 방지
    const overlay = document.createElement('div');
    overlay.id = 'daum-address-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:transparent;z-index:1000000;pointer-events:none;';
    overlay.innerHTML = `
        <div id="daum-address-box"
             style="position:fixed;right:20px;top:60px;background:var(--bg-white);border-radius:var(--radius-lg);width:500px;height:580px;max-width:calc(100vw - 40px);max-height:calc(100vh - 80px);display:flex;flex-direction:column;box-shadow:var(--shadow-lg);pointer-events:auto;border:1px solid var(--border);">
            <div id="daum-address-header"
                 style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid var(--border);background:var(--bg-lighter);font-size:11px;cursor:move;user-select:none;flex-shrink:0;">
                <span style="color:var(--text-muted);"><i class="fas fa-grip-lines" style="margin-right:4px;"></i>드래그로 이동</span>
                <button type="button" id="daum-address-close" aria-label="닫기"
                        style="border:none;background:transparent;font-size:16px;cursor:pointer;color:var(--text-secondary);padding:0 6px;line-height:1;">&times;</button>
            </div>
            <div id="daum-address-embed" style="flex:1;min-height:0;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();

    // X 버튼 닫기 (내 헤더 X — Daum embed 내부에는 자체 X 없음)
    overlay.querySelector('#daum-address-close').addEventListener('click', closeModal);

    // ESC 닫기
    const onEsc = (ev) => { if (ev.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onEsc); } };
    document.addEventListener('keydown', onEsc);

    // 드래그 이동 구현
    const box = overlay.querySelector('#daum-address-box');
    const header = overlay.querySelector('#daum-address-header');
    let dragState = null;
    header.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const rect = box.getBoundingClientRect();
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            boxLeft: rect.left,
            boxTop: rect.top
        };
        box.style.left = rect.left + 'px';
        box.style.top = rect.top + 'px';
        e.preventDefault();
    });
    const onMouseMove = (e) => {
        if (!dragState) return;
        const nx = dragState.boxLeft + (e.clientX - dragState.startX);
        const ny = dragState.boxTop + (e.clientY - dragState.startY);
        // 화면 경계 안으로 제한
        const maxX = window.innerWidth - box.offsetWidth - 4;
        const maxY = window.innerHeight - box.offsetHeight - 4;
        box.style.left = Math.max(4, Math.min(nx, maxX)) + 'px';
        box.style.top  = Math.max(4, Math.min(ny, maxY)) + 'px';
    };
    const onMouseUp = () => { dragState = null; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 모달 제거 시 drag 리스너도 함께 제거
    const observer = new MutationObserver(() => {
        if (!document.contains(overlay)) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onEsc);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true });

    new daum.Postcode({
        oncomplete: function(data) {
            const addr = data.roadAddress || data.jibunAddress || '';
            const addressField = document.getElementById('customer-form-address');
            if (addressField) {
                addressField.value = addr;
                addressField.style.backgroundColor = '#f0f9ff';
                addressField.style.borderColor = '#3b82f6';
                setTimeout(() => {
                    addressField.style.backgroundColor = '';
                    addressField.style.borderColor = '';
                }, 2000);
            }
            closeModal();
            const detailField = document.getElementById('customer-form-address-detail');
            if (detailField) {
                setTimeout(() => { detailField.focus(); detailField.placeholder = '동, 호수 등 상세주소 입력'; }, 50);
            }
        },
        onclose: function() {
            // Daum 내부 닫기 버튼 클릭 시 우리 overlay 도 제거
            closeModal();
        },
        width: '100%',
        height: '100%',
    }).embed(overlay.querySelector('#daum-address-embed'), { q: trimmed, autoClose: true });
};

// 주소 검색창 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    const container = document.getElementById('address-embed-container');
    const addressField = document.getElementById('customer-form-address');
    if (container && !container.classList.contains('hidden') &&
        !container.contains(e.target) && e.target !== addressField) {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
});

// 전역 함수로 등록 (강제로 덮어쓰기)
window.loadCustomerManagementComponent = loadCustomerManagementComponent;
window.saveCustomer = saveCustomer; // 🔥 이 함수가 실제로 고객을 저장합니다
window.attachCustomerEventListeners = attachCustomerEventListeners;
window.loadCustomerModal = loadCustomerModal;
window.openAddressSearch = openAddressSearch;

console.log('✅ customer-management.js: saveCustomer 함수 등록 완료');
console.log('📋 window.saveCustomer:', typeof window.saveCustomer);
