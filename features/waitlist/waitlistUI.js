// 대기자관리 UI 모듈
// 경산다육식물농장 관리시스템 - 대기자 UI 관리

import { waitlistDataManager } from './waitlistData.js';
import { formatDate, formatPhone, formatCurrency } from '../../utils/formatters.js';

/**
 * 대기자관리 UI 클래스
 */
export class WaitlistUI {
    constructor() {
        console.log('🎨 WaitlistUI 초기화');
        this.currentFilter = 'all';
    }

    /**
     * 대기자 등록 모달 열기
     */
    async openWaitlistModal() {
        console.log('📝 대기자 등록 모달 열기');
        const modal = document.getElementById('waitlist-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // 고객 데이터 로드 및 자동완성 설정
            await this.initializeCustomerAutocomplete();
            
            // 주문 등록 폼과 동일한 구조로 대기자 폼 생성
            this.renderWaitlistForm();
        } else {
            console.error('❌ 대기자 모달을 찾을 수 없습니다.');
        }
    }

    /**
     * 대기자 등록 모달 닫기
     */
    closeWaitlistModal() {
        console.log('📝 대기자 등록 모달 닫기');
        const modal = document.getElementById('waitlist-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * 고객 자동완성 초기화
     */
    async initializeCustomerAutocomplete() {
        try {
            console.log('🔍 고객 자동완성 초기화 시작...');
            
            // 고객 데이터 매니저 확인
            if (!window.customerDataManager) {
                console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
                return;
            }
            
            // 고객 데이터 강제 로드 (Supabase 전용)
            console.log('📊 Supabase에서 고객 데이터 로드 시도...');
            try {
                await window.customerDataManager.loadCustomers();
                console.log('✅ Supabase에서 고객 데이터 로드 완료');
            } catch (loadError) {
                console.error('❌ Supabase 고객 데이터 로드 실패:', loadError);
                // 에러가 발생해도 자동완성은 설정 (빈 상태로)
                console.log('⚠️ 고객 데이터 로드 실패했지만 자동완성은 설정합니다');
            }
            
            // 고객 데이터 로드 확인
            const customers = window.customerDataManager.getAllCustomers();
            console.log('📊 로드된 고객 수:', customers.length);
            
            if (customers.length === 0) {
                console.warn('⚠️ 고객 데이터가 없습니다. 고객 데이터를 먼저 등록해주세요.');
            }
            
            // 자동완성 이벤트 리스너 설정
            this.setupCustomerSearch();
            
            console.log('✅ 고객 자동완성 초기화 완료');
            
        } catch (error) {
            console.error('❌ 고객 자동완성 초기화 실패:', error);
            // 에러가 발생해도 자동완성은 설정
            this.setupCustomerSearch();
        }
    }

    /**
     * 대기자 목록 테이블 렌더링
     */
    renderWaitlistTable(waitlistData = null) {
        try {
            console.log('📋 대기자 목록 테이블 렌더링 시작...');
            
            let waitlist;
            if (waitlistData) {
                waitlist = waitlistData;
                console.log('🔍 전달받은 대기자 데이터 사용:', waitlist.length, '개');
            } else {
                console.log('🔍 waitlistDataManager에서 데이터 조회 중...');
                waitlist = waitlistDataManager.getAllWaitlist();
                console.log('🔍 조회된 대기자 데이터:', waitlist.length, '개');
                console.log('🔍 대기자 데이터 상세:', waitlist);
            }
            
            const tbody = document.getElementById('waitlist-tbody');
            
            if (!tbody) {
                console.warn('⚠️ 대기자 테이블 tbody를 찾을 수 없습니다.');
                return;
            }
            
            // 페이지 크기 적용
            const pageSizeEl = document.getElementById('waitlist-page-size');
            const pageSize = pageSizeEl ? parseInt(pageSizeEl.value) : 20;
            const pagedWaitlist = pageSize === 0 ? waitlist : waitlist.slice(0, pageSize);

            // 하단 카운트 업데이트
            const totalEl = document.getElementById('waitlist-status-total');
            const countEl = document.getElementById('waitlist-list-count');
            if (totalEl) totalEl.textContent = String(waitlist.length);
            if (countEl) countEl.textContent = pageSize === 0 || pagedWaitlist.length === waitlist.length
                ? `${waitlist.length}명 표시`
                : `${pagedWaitlist.length} / ${waitlist.length}명 표시`;

            if (pagedWaitlist.length === 0) {
                // 빈 상태 표시 — 공통 유틸 사용 (colspan=9: 번호·고객명·연락처·희망상품·카테고리·희망가격·상태·등록일·관리)
                tbody.innerHTML = window.renderEmptyRow(9, '등록된 대기자가 없습니다.');
            } else {
                // 성능 최적화: DocumentFragment로 일괄 DOM 추가
                const fragment = document.createDocumentFragment();
                pagedWaitlist.forEach((item, index) => {
                    fragment.appendChild(this.createWaitlistRow(item, index));
                });
                tbody.innerHTML = '';
                tbody.appendChild(fragment);
            }

            // 통계 업데이트
            this.updateWaitlistStats();

            console.log(`✅ 대기자 목록 테이블 렌더링 완료: ${pagedWaitlist.length}/${waitlist.length}개`);
        } catch (error) {
            console.error('❌ 대기자 목록 테이블 렌더링 실패:', error);
        }
    }

    /**
     * 대기자 행 생성
     */
    createWaitlistRow(item, index) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        const nd = '<span class="td-null">—</span>';
        row.innerHTML = `
            <td class="px-2.5 td-muted text-center">${index + 1}</td>
            <td class="px-2.5 td-primary td-link">${item.customer_name || nd}</td>
            <td class="px-2.5 td-secondary">${formatPhone(item.customer_phone)}</td>
            <td class="px-2.5 td-primary">${item.product_name || nd}</td>
            <td class="px-2.5 td-secondary">${item.product_category || nd}</td>
            <td class="px-2.5 td-amount text-right text-numeric">${item.expected_price ? formatCurrency(item.expected_price) : nd}</td>
            <td class="px-2.5 text-center">
                <span class="badge ${this.getStatusBadgeClass(item.status)}">${item.status}</span>
            </td>
            <td class="px-2.5 td-muted">${formatDate(item.register_date) || nd}</td>
            <td class="px-2.5 text-center">
                <div class="btn-group">
                    <button onclick="waitlistUI.editWaitlist('${item.id}')"
                            class="btn-icon btn-icon-edit"
                            title="수정">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button onclick="waitlistUI.deleteWaitlist('${item.id}')"
                            class="btn-icon btn-icon-delete"
                            title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    /**
     * 상태 배지 클래스 반환
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            '대기중':   'badge-warning',   // 노랑 — 대기 중
            '연락완료': 'badge-info',       // 파랑 — 연락됨
            '주문전환': 'badge-success',    // 초록 — 완료
            '취소':     'badge-danger',     // 빨강 — 취소
        };
        return statusClasses[status] || 'badge-neutral';
    }

    /**
     * 대기자 통계 업데이트 — 탭 카운트 배지 업데이트
     */
    updateWaitlistStats() {
        try {
            const stats = waitlistDataManager.getWaitlistStats();

            // 탭 카운트 배지 업데이트
            const countAll       = document.getElementById('waitlist-count-all');
            const countWaiting   = document.getElementById('waitlist-count-대기중');
            const countContacted = document.getElementById('waitlist-count-연락완료');
            const countConverted = document.getElementById('waitlist-count-주문전환');
            const countCancelled = document.getElementById('waitlist-count-취소');

            if (countAll)       countAll.textContent       = stats.total;
            if (countWaiting)   countWaiting.textContent   = stats.waiting;
            if (countContacted) countContacted.textContent = stats.contacted;
            if (countConverted) countConverted.textContent = stats.converted;
            if (countCancelled) countCancelled.textContent = stats.cancelled;

            console.log('📊 대기자 통계 업데이트 완료:', stats);
        } catch (error) {
            console.error('❌ 대기자 통계 업데이트 실패:', error);
        }
    }

    /**
     * 대기자 모달 열기
     */
    openWaitlistModal(waitlistId = null) {
        try {
            console.log('📝 대기자 모달 열기:', waitlistId);
            
            // 기존 모달 제거
            this.closeWaitlistModal();
            
            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'waitlist-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = this.createWaitlistModalHTML(waitlistId);
            
            document.body.appendChild(modal);
            
            // 이벤트 리스너 등록
            this.setupWaitlistModalEvents(waitlistId);
            
            console.log('✅ 대기자 모달 열기 완료');
        } catch (error) {
            console.error('❌ 대기자 모달 열기 실패:', error);
        }
    }

    /**
     * 대기자 모달 HTML 생성
     */
    createWaitlistModalHTML(waitlistId) {
        const isEdit = !!waitlistId;
        const waitlist = isEdit ? waitlistDataManager.getWaitlistById(waitlistId) : null;
        
        return `
            <div class="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">
                            <i class="fas fa-clock mr-2 text-orange-600"></i>
                            ${isEdit ? '대기자 정보 수정' : '새 대기자 등록'}
                        </h3>
                        <button onclick="waitlistUI.closeWaitlistModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <form id="waitlist-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">고객명 *</label>
                                <div class="relative">
                                    <input type="text" id="waitlist-customer-name" 
                                           value="${waitlist?.customer_name || ''}"
                                           placeholder="고객명을 입력하세요 (자동완성 지원)"
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                           autocomplete="off"
                                           required>
                                    <div id="waitlist-customer-suggestions" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto hidden">
                                        <!-- 고객 자동완성 목록이 여기에 표시됩니다 -->
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                                <input type="tel" id="waitlist-customer-phone" 
                                       value="${waitlist?.customer_phone || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">희망상품명 *</label>
                                <input type="text" id="waitlist-product-name" 
                                       value="${waitlist?.product_name || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                       required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상품카테고리</label>
                                <input type="text" id="waitlist-product-category" 
                                       value="${waitlist?.product_category || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">희망가격</label>
                                <input type="number" id="waitlist-expected-price" 
                                       value="${waitlist?.expected_price || ''}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                                <select id="waitlist-priority" 
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option value="1" ${waitlist?.priority === 1 ? 'selected' : ''}>높음</option>
                                    <option value="2" ${waitlist?.priority === 2 ? 'selected' : ''}>보통</option>
                                    <option value="3" ${waitlist?.priority === 3 ? 'selected' : ''}>낮음</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">메모</label>
                            <textarea id="waitlist-memo" rows="3" 
                                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">${waitlist?.memo || ''}</textarea>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="waitlistUI.closeWaitlistModal()" 
                                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                취소
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                                ${isEdit ? '수정' : '등록'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * 대기자 모달 이벤트 설정
     */
    setupWaitlistModalEvents(waitlistId) {
        // 고객명 자동완성 이벤트 설정
        this.setupCustomerSearch();
        
        const form = document.getElementById('waitlist-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveWaitlist(waitlistId);
            });
        }
    }

    /**
     * 대기자 모달 닫기
     */
    closeWaitlistModal() {
        try {
            const modal = document.getElementById('waitlist-modal');
            if (modal) {
                modal.remove();
                console.log('✅ 대기자 모달 닫기 완료');
            }
        } catch (error) {
            console.error('❌ 대기자 모달 닫기 실패:', error);
        }
    }

    /**
     * 대기자 저장 (async — addWaitlist/updateWaitlist 결과를 await)
     */
    async saveWaitlist(waitlistId = null) {
        try {
            console.log('💾 대기자 저장:', waitlistId);

            const formData = {
                customer_name: document.getElementById('waitlist-customer-name').value.trim(),
                customer_phone: document.getElementById('waitlist-customer-phone').value.trim(),
                product_name: document.getElementById('waitlist-product-name').value.trim(),
                product_category: document.getElementById('waitlist-product-category').value.trim(),
                expected_price: parseInt(document.getElementById('waitlist-expected-price').value) || 0,
                priority: parseInt(document.getElementById('waitlist-priority').value) || 3,
                memo: document.getElementById('waitlist-memo').value.trim()
            };

            // 필수 필드 검증
            if (!formData.customer_name || !formData.product_name) {
                alert('고객명과 희망상품명은 필수 입력 항목입니다.');
                return;
            }

            // async 함수이므로 반드시 await — Promise를 직접 평가하지 않음
            let result;
            if (waitlistId) {
                result = await waitlistDataManager.updateWaitlist(waitlistId, formData);
            } else {
                result = await waitlistDataManager.addWaitlist(formData);
            }

            this.closeWaitlistModal();

            // 저장 후 테이블 새로고침
            this.renderWaitlistTable(waitlistDataManager.getAllWaitlist());
            this.updateWaitlistStats();

            const msg = waitlistId ? '대기자 정보가 수정되었습니다.' : '새 대기자가 등록되었습니다.';
            if (window.Swal) {
                window.Swal.fire({ icon: 'success', title: '저장 완료', text: msg, timer: 2000, showConfirmButton: false });
            } else {
                alert(msg);
            }
            console.log('✅ 대기자 저장 완료');
        } catch (error) {
            console.error('❌ 대기자 저장 실패:', error);
            alert('대기자 저장 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 대기자 수정
     */
    editWaitlist(waitlistId) {
        console.log('✏️ 대기자 수정:', waitlistId);
        this.openWaitlistModal(waitlistId);
    }

    /**
     * 대기자 삭제 (async — Supabase 삭제 완료 후 UI 갱신)
     */
    async deleteWaitlist(waitlistId) {
        try {
            console.log('🗑️ 대기자 삭제:', waitlistId);

            if (!confirm('정말로 이 대기자를 삭제하시겠습니까?')) return;

            await waitlistDataManager.deleteWaitlist(waitlistId);

            this.renderWaitlistTable(waitlistDataManager.getAllWaitlist());
            this.updateWaitlistStats();

            if (window.Swal) {
                window.Swal.fire({ icon: 'success', title: '삭제 완료', text: '대기자가 삭제되었습니다.', timer: 1500, showConfirmButton: false });
            } else {
                alert('대기자가 삭제되었습니다.');
            }
        } catch (error) {
            console.error('❌ 대기자 삭제 실패:', error);
            alert('대기자 삭제 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 대기자 상태 변경
     */
    updateStatus(waitlistId) {
        try {
            console.log('🔄 대기자 상태 변경:', waitlistId);
            
            const statusOptions = [
                { value: '대기중', label: '대기중', color: 'orange' },
                { value: '연락완료', label: '연락완료', color: 'blue' },
                { value: '주문전환', label: '주문전환', color: 'green' },
                { value: '취소', label: '취소', color: 'red' }
            ];
            
            const currentWaitlist = waitlistDataManager.getWaitlistById(waitlistId);
            if (!currentWaitlist) {
                alert('대기자 정보를 찾을 수 없습니다.');
                return;
            }
            
            const statusList = statusOptions.map(option => 
                `${option.value}:${option.label}:${option.color}`
            ).join('\n');
            
            const newStatus = prompt(
                `현재 상태: ${currentWaitlist.status}\n\n변경할 상태를 선택하세요:\n${statusList}`,
                currentWaitlist.status
            );
            
            if (newStatus && newStatus !== currentWaitlist.status) {
                const success = waitlistDataManager.updateWaitlistStatus(waitlistId, newStatus);
                if (success) {
                    this.renderWaitlistTable();
                    alert('대기자 상태가 변경되었습니다.');
                } else {
                    alert('상태 변경에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('❌ 대기자 상태 변경 실패:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    }

    /**
     * 상태별 필터링
     */
    filterWaitlistByStatus(status) {
        try {
            console.log('🔍 상태별 필터링:', status);
            
            this.currentFilter = status;
            const filteredData = waitlistDataManager.filterWaitlistByStatus(status);
            this.renderWaitlistTable(filteredData);
            
            // 탭 활성화 상태 업데이트
            this.updateFilterTabs(status);
        } catch (error) {
            console.error('❌ 상태별 필터링 실패:', error);
        }
    }

    /**
     * 필터 탭 상태 업데이트
     */
    updateFilterTabs(activeStatus) {
        try {
            document.querySelectorAll('.waitlist-tab-btn').forEach(tab => {
                tab.classList.remove('active');
                const status = tab.id.replace('farm_waitlist-status-', '');
                if (status === activeStatus) {
                    tab.classList.add('active');
                }
            });
        } catch (error) {
            console.error('❌ 필터 탭 상태 업데이트 실패:', error);
        }
    }

    /**
     * 대기자 검색
     */
    searchWaitlist(query) {
        try {
            console.log('🔍 대기자 검색:', query);
            
            const results = waitlistDataManager.searchWaitlist(query);
            this.renderWaitlistTable(results);
            
            // 검색 결과 카운트 업데이트
            const countInfo = document.getElementById('waitlist-count-info');
            if (countInfo) {
                countInfo.textContent = `검색 결과: ${results.length}개 대기자`;
            }
        } catch (error) {
            console.error('❌ 대기자 검색 실패:', error);
        }
    }

    /**
     * 고객 검색 기능 설정
     */
    setupCustomerSearch() {
        try {
            console.log('🔍 대기자 모달 고객 검색 설정');
            
            const customerNameInput = document.getElementById('waitlist-customer-name');
            if (!customerNameInput) {
                console.warn('⚠️ 고객명 입력 필드를 찾을 수 없습니다');
                return;
            }

            let searchTimeout = null;
            let selectedIndex = -1;

        // 고객명 입력 이벤트
        customerNameInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            console.log('🔍 대기자 모달 고객명 입력:', value);
            
            // 이전 타이머 클리어
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // 입력값이 1글자 이상일 때만 검색
            if (value.length >= 1) {
                searchTimeout = setTimeout(() => {
                    console.log('🔍 대기자 모달 고객 검색 시작:', value);
                    this.searchCustomers(value);
                }, 300);
            } else {
                this.hideCustomerSuggestions();
            }
        });

            // 포커스 이벤트
            customerNameInput.addEventListener('focus', (e) => {
                const value = e.target.value.trim();
                if (value.length >= 1) {
                    this.searchCustomers(value);
                }
            });

            // 블러 이벤트 (약간의 지연을 두어 클릭 이벤트가 먼저 실행되도록)
            customerNameInput.addEventListener('blur', (e) => {
                setTimeout(() => {
                    this.hideCustomerSuggestions();
                }, 200);
            });

            // 키보드 이벤트
            customerNameInput.addEventListener('keydown', (e) => {
                const suggestions = document.getElementById('waitlist-customer-suggestions');
                if (!suggestions || suggestions.classList.contains('hidden')) return;

                const items = suggestions.querySelectorAll('.customer-suggestion-item');
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                        this.updateSelectedSuggestion(items, selectedIndex);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        selectedIndex = Math.max(selectedIndex - 1, -1);
                        this.updateSelectedSuggestion(items, selectedIndex);
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (selectedIndex >= 0 && items[selectedIndex]) {
                            items[selectedIndex].click();
                        }
                        break;
                    case 'Escape':
                        this.hideCustomerSuggestions();
                        break;
                }
            });

        } catch (error) {
            console.error('❌ 고객 검색 설정 실패:', error);
        }
    }

    /**
     * 고객 검색 실행
     */
    async searchCustomers(query) {
        try {
            console.log('🔍 고객 검색:', query);
            
            if (!window.customerDataManager) {
                console.warn('⚠️ customerDataManager를 찾을 수 없습니다');
                // 고객 데이터 매니저가 없어도 새 고객 등록 옵션은 표시
                this.showNewCustomerOption(query);
                return;
            }

            // 고객 데이터가 없으면 다시 로드 시도
            let allCustomers = window.customerDataManager.getAllCustomers();
            if (allCustomers.length === 0) {
                console.log('🔄 고객 데이터가 없어서 다시 로드 시도...');
                try {
                    await window.customerDataManager.loadCustomers();
                    allCustomers = window.customerDataManager.getAllCustomers();
                    console.log('📊 재로드된 고객 수:', allCustomers.length);
                } catch (loadError) {
                    console.error('❌ 고객 데이터 재로드 실패:', loadError);
                }
            }

            // 고객 등록과 동일한 검색 로직 사용 (startsWith)
            const matchingCustomers = allCustomers.filter(customer => 
                customer.name.toLowerCase().startsWith(query.toLowerCase())
            );
            
            console.log('📊 검색된 고객 수:', matchingCustomers.length);

            if (matchingCustomers.length > 0) {
                this.showCustomerSuggestions(matchingCustomers, query);
            } else {
                this.showNewCustomerOption(query);
            }

        } catch (error) {
            console.error('❌ 고객 검색 실패:', error);
            // 에러가 발생해도 새 고객 등록 옵션은 표시
            this.showNewCustomerOption(query);
        }
    }

    /**
     * 고객 제안 목록 표시
     */
    showCustomerSuggestions(customers, query) {
        try {
            const suggestionsDiv = document.getElementById('waitlist-customer-suggestions');
            if (!suggestionsDiv) return;

            let html = '';
            
            // 기존 고객 목록
            customers.slice(0, 5).forEach((customer, index) => {
                html += `
                    <div class="customer-suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" 
                         data-customer-id="${customer.id}" 
                         data-customer-name="${customer.name}" 
                         data-customer-phone="${customer.phone || ''}">
                        <div class="flex items-center">
                            <i class="fas fa-user text-gray-400 mr-2"></i>
                            <div>
                                <div class="font-medium text-gray-800">${customer.name}</div>
                                <div class="text-sm text-gray-500">${customer.phone || '연락처 없음'}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            // 새 고객 등록 옵션
            html += `
                <div class="customer-suggestion-item p-3 hover:bg-orange-50 cursor-pointer border-t-2 border-orange-200" 
                     data-action="new-customer" 
                     data-query="${query}">
                    <div class="flex items-center">
                        <i class="fas fa-plus text-orange-500 mr-2"></i>
                        <div>
                            <div class="font-medium text-orange-700">"${query}" 새 고객으로 등록</div>
                            <div class="text-sm text-orange-600">기존 고객이 없으면 새로 등록하세요</div>
                        </div>
                    </div>
                </div>
            `;

            suggestionsDiv.innerHTML = html;
            suggestionsDiv.classList.remove('hidden');

            // 클릭 이벤트 설정
            this.setupSuggestionClickEvents();

        } catch (error) {
            console.error('❌ 고객 제안 표시 실패:', error);
        }
    }

    /**
     * 새 고객 등록 옵션만 표시
     */
    showNewCustomerOption(query) {
        try {
            const suggestionsDiv = document.getElementById('waitlist-customer-suggestions');
            if (!suggestionsDiv) return;

            const html = `
                <div class="customer-suggestion-item p-3 hover:bg-orange-50 cursor-pointer" 
                     data-action="new-customer" 
                     data-query="${query}">
                    <div class="flex items-center">
                        <i class="fas fa-plus text-orange-500 mr-2"></i>
                        <div>
                            <div class="font-medium text-orange-700">"${query}" 새 고객으로 등록</div>
                            <div class="text-sm text-orange-600">기존 고객이 없으므로 새로 등록하세요</div>
                        </div>
                    </div>
                </div>
            `;

            suggestionsDiv.innerHTML = html;
            suggestionsDiv.classList.remove('hidden');

            // 클릭 이벤트 설정
            this.setupSuggestionClickEvents();

        } catch (error) {
            console.error('❌ 새 고객 옵션 표시 실패:', error);
        }
    }

    /**
     * 제안 클릭 이벤트 설정
     */
    setupSuggestionClickEvents() {
        const suggestions = document.querySelectorAll('.customer-suggestion-item');
        suggestions.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const action = item.dataset.action;
                const customerId = item.dataset.customerId;
                const customerName = item.dataset.customerName;
                const customerPhone = item.dataset.customerPhone;
                const query = item.dataset.query;

                if (action === 'new-customer') {
                    // 새 고객 등록으로 이동
                    this.openNewCustomerModal(query);
                } else if (customerId) {
                    // 기존 고객 선택
                    this.selectExistingCustomer(customerName, customerPhone);
                }

                this.hideCustomerSuggestions();
            });
        });
    }

    /**
     * 기존 고객 선택
     */
    selectExistingCustomer(name, phone) {
        try {
            console.log('👤 기존 고객 선택:', name, phone);
            
            const nameInput = document.getElementById('waitlist-customer-name');
            const phoneInput = document.getElementById('waitlist-customer-phone');
            
            if (nameInput) nameInput.value = name;
            if (phoneInput) phoneInput.value = phone;

        } catch (error) {
            console.error('❌ 기존 고객 선택 실패:', error);
        }
    }

    /**
     * 새 고객 등록 모달 열기
     */
    openNewCustomerModal(query) {
        try {
            console.log('➕ 새 고객 등록 모달 열기:', query);
            
            // 대기자 모달 닫기
            this.closeWaitlistModal();
            
            // 고객 등록 완료 후 대기자 등록으로 돌아오는 콜백 함수
            const callback = (customerData) => {
                console.log('🔄 고객 등록 완료 - 대기자 등록으로 돌아가기:', customerData);
                
                // 대기자 모달 다시 열기
                setTimeout(() => {
                    this.openWaitlistModal();
                    
                    // 고객 정보를 대기자 폼에 자동 입력
                    const nameInput = document.getElementById('waitlist-customer-name');
                    const phoneInput = document.getElementById('waitlist-customer-phone');
                    
                    if (nameInput) nameInput.value = customerData.name;
                    if (phoneInput) phoneInput.value = customerData.phone;
                    
                    console.log('📝 대기자 폼에 고객 정보 입력 완료:', {
                        name: customerData.name,
                        phone: customerData.phone
                    });
                }, 100);
            };
            
            // 고객 등록 모달 열기
            if (window.openCustomerModal) {
                window.openCustomerModal(null, query, callback);
            } else {
                console.warn('⚠️ openCustomerModal 함수를 찾을 수 없습니다');
                alert('고객 등록 기능을 사용할 수 없습니다. 고객 관리 모듈이 로드되지 않았습니다.');
            }

        } catch (error) {
            console.error('❌ 새 고객 등록 모달 열기 실패:', error);
        }
    }

    /**
     * 고객 제안 숨기기
     */
    hideCustomerSuggestions() {
        const suggestionsDiv = document.getElementById('waitlist-customer-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.classList.add('hidden');
        }
    }

    /**
     * 선택된 제안 업데이트
     */
    updateSelectedSuggestion(items, selectedIndex) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('bg-orange-50', 'border-orange-200');
            } else {
                item.classList.remove('bg-orange-50', 'border-orange-200');
            }
        });
    }
}

// 싱글톤 인스턴스 생성 및 export
export const waitlistUI = new WaitlistUI();

// 전역에서 사용할 수 있도록 window 객체에 등록
if (typeof window !== 'undefined') {
    window.waitlistUI = waitlistUI;
}
