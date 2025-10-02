// 고객 UI 관리
// 고객 목록, 폼, 모달 UI 처리

import { customerDataManager } from './customerData.js';

// 고객 테이블 렌더링 함수 (등급 필터링 지원)
export function renderCustomersTable(gradeFilter = 'all') {
    console.log(`🎨 고객 테이블 렌더링 시작 (등급 필터: ${gradeFilter})`);
    
    try {
        const allCustomers = customerDataManager.getAllCustomers();
        console.log(`📊 전체 고객 수: ${allCustomers.length}`);
        console.log('📋 고객 데이터:', allCustomers);
        
        // 등급 필터링 로직
        const customers = (gradeFilter === 'all')
            ? allCustomers
            : allCustomers.filter(c => c.grade === gradeFilter);
        
        console.log(`🎯 필터링된 고객 수: ${customers.length}`);
        
        const tbody = document.getElementById('customer-list-container');
        if (!tbody) {
            console.error('❌ 고객 테이블 body를 찾을 수 없습니다.');
            return;
        }
        
        // 테이블 내용 초기화
        tbody.innerHTML = '';
        
        if (customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        ${gradeFilter === 'all' ? '등록된 고객이 없습니다.' : `${gradeFilter} 등급 고객이 없습니다.`}
                    </td>
                </tr>
            `;
            return;
        }
        
        // 고객 목록 렌더링
        customers.forEach((customer, index) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 cursor-pointer';
            row.setAttribute('data-customer-id', customer.id);
            row.innerHTML = `
                <td class="px-2 py-1.5 text-xs font-medium text-gray-900">${customer.name || '이름 없음'}</td>
                <td class="px-2 py-1.5 text-xs text-gray-900">${customer.phone || '전화번호 없음'}</td>
                <td class="px-2 py-1.5 text-center text-xs">
                    <span class="px-1.5 py-0.5 text-xs font-medium rounded-full ${getGradeBadgeClass(customer.grade)}">
                        ${getGradeDisplayName(customer.grade)}
                    </span>
                </td>
                <td class="px-2 py-1.5 text-center text-xs text-gray-900">
                    <div class="flex justify-center space-x-1">
                        <button onclick="editCustomer('${customer.id}')" class="text-blue-600 hover:text-blue-800 font-medium text-xs px-1.5 py-0.5 rounded">
                            <i class="fas fa-edit mr-0.5"></i>수정
                        </button>
                        <button onclick="deleteCustomer('${customer.id}')" class="text-red-600 hover:text-red-800 font-medium text-xs px-1.5 py-0.5 rounded">
                            <i class="fas fa-trash mr-0.5"></i>삭제
                        </button>
                    </div>
                </td>
            `;
            
            // 고객 행 클릭 이벤트 추가
            row.addEventListener('click', (e) => {
                // 버튼 클릭 시에는 상세 정보 표시하지 않음
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                console.log('👤 고객 선택됨:', customer.id, customer.name);
                showCustomerDetail(customer.id);
            });
            
            tbody.appendChild(row);
        });
        
        console.log('✅ 고객 테이블 렌더링 완료');
        
    } catch (error) {
        console.error('❌ 고객 테이블 렌더링 실패:', error);
        const tbody = document.getElementById('customer-list-container');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-red-500">
                        고객 목록을 불러오는 중 오류가 발생했습니다.
                    </td>
                </tr>
            `;
        }
    }
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

// 등급 표시 이름 반환
function getGradeDisplayName(grade) {
    const gradeNames = {
        'BLACK_DIAMOND': '블랙다이아몬드',
        'PURPLE_EMPEROR': '퍼플엠퍼러',
        'RED_RUBY': '레드루비',
        'GREEN_LEAF': '그린리프',
        'GENERAL': '일반'
    };
    return gradeNames[grade] || grade;
}

// 전역 함수로 등록 (HTML에서 호출 가능하도록)
window.renderCustomersTable = renderCustomersTable;

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
window.editCustomer = function(customerId) {
    console.log('✏️ 고객 수정 요청:', customerId);
    
    if (window.orderSystem) {
        window.orderSystem.openCustomerModal(customerId);
    } else {
        console.error('❌ orderSystem을 찾을 수 없습니다.');
    }
};

// 고객 상세 정보 표시 함수 (전역)
window.showCustomerDetail = function(customerId) {
    console.log('👤 고객 상세 정보 모달 표시:', customerId);
    
    try {
        if (!window.customerDataManager) {
            console.error('❌ customerDataManager를 찾을 수 없습니다.');
            return;
        }
        
        const customer = window.customerDataManager.getCustomerById(customerId);
        if (!customer) {
            console.error('❌ 고객을 찾을 수 없습니다:', customerId);
            return;
        }
        
        console.log('📋 고객 정보:', customer);
        
        // 1. 모달 표시
        const modal = document.getElementById('customer-detail-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // 2. 고객 기본 정보 업데이트
        updateCustomerModalBasicInfo(customer);
        
        // 3. 고객 통계 정보 업데이트
        updateCustomerModalStats(customer);
        
        // 4. 고객 주문 내역 업데이트
        updateCustomerModalOrders(customer);
        
        // 5. 선택된 행 하이라이트
        highlightSelectedCustomerRow(customerId);
        
        console.log('✅ 고객 상세 정보 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 고객 상세 정보 모달 표시 실패:', error);
    }
};

// 고객 기본 정보 업데이트
function updateCustomerBasicInfo(customer) {
    console.log('📝 고객 기본 정보 업데이트:', customer.name);
    
    // 고객명
    const nameElement = document.getElementById('customer-detail-name');
    if (nameElement) {
        nameElement.textContent = customer.name || '이름 없음';
    }
    
    // 고객 등급
    const gradeElement = document.getElementById('customer-detail-grade');
    if (gradeElement) {
        gradeElement.textContent = getGradeDisplayName(customer.grade);
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
        addressElement.textContent = customer.address || '주소 없음';
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
function updateCustomerModalBasicInfo(customer) {
    console.log('📝 모달 고객 기본 정보 업데이트:', customer.name);
    
    // 고객명
    const nameElement = document.getElementById('customer-detail-modal-name');
    if (nameElement) {
        nameElement.textContent = customer.name || '이름 없음';
    }
    
    // 고객 등급
    const gradeElement = document.getElementById('customer-detail-modal-grade');
    if (gradeElement) {
        gradeElement.textContent = getGradeDisplayName(customer.grade);
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
        addressElement.textContent = customer.address || '주소 없음';
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