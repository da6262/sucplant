/**
 * 대기자 관리 모듈
 * 경산다육식물농장 관리시스템 - 대기자 관리 기능
 */

// 대기자 관리 컴포넌트 로드 (성능 최적화)
async function loadWaitlistManagementComponent() {
    try {
        console.log('📋 대기자 관리 컴포넌트 로드 시작...');
        
        // DOM이 완전히 로드될 때까지 대기 (최적화)
        if (document.readyState !== 'complete') {
            console.log('⏳ DOM 로딩 완료 대기 중...');
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve, { once: true });
                }
            });
        }
        
        // mainContent가 존재할 때까지 대기 (최적화: 대기 시간 단축)
        let mainContent = document.getElementById('mainContent');
        let waitCount = 0;
        const maxWait = 20; // 최대 2초 대기로 단축
        
        while (!mainContent && waitCount < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
            mainContent = document.getElementById('mainContent');
            waitCount++;
        }
        
        if (!mainContent) {
            console.error('❌ mainContent 요소를 찾을 수 없습니다. DOM 구조를 확인해주세요.');
            return false;
        }
        
        // 추가 대기 시간 제거 (불필요한 지연)
        
        // 대기자관리 섹션 찾기 (최적화: 불필요한 로그 제거, 대기 시간 단축)
        console.log('🔍 대기자관리 섹션 찾기 시작...');
        
        let waitlistSection = document.getElementById('waitlist-section');
        let retryCount = 0;
        const maxRetries = 5; // 재시도 횟수 단축
        
        // 섹션 찾기 재시도 (최적화)
        while (!waitlistSection && retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 대기 시간 단축
            waitlistSection = document.getElementById('waitlist-section');
            retryCount++;
        }
        
        if (!waitlistSection) {
            console.log('⚠️ 대기자 관리 섹션을 찾을 수 없습니다. 섹션을 생성합니다...');
            
            // 섹션을 직접 생성하는 폴백 로직
            console.log('🔧 대기자관리 섹션을 직접 생성합니다...');
            if (mainContent) {
                // 기존 섹션들이 있는 위치에 삽입
                const existingSections = mainContent.querySelectorAll('.section-content');
                waitlistSection = document.createElement('div');
                waitlistSection.id = 'waitlist-section';
                waitlistSection.className = 'section-content';
                waitlistSection.style.display = 'block';
                waitlistSection.innerHTML = '<!-- 대기자 관리 컴포넌트가 여기에 로드됩니다 -->';
                
                // 기존 섹션들 뒤에 삽입
                if (existingSections.length > 0) {
                    const lastSection = existingSections[existingSections.length - 1];
                    lastSection.insertAdjacentElement('afterend', waitlistSection);
                } else {
                    mainContent.appendChild(waitlistSection);
                }
                
                console.log('✅ 대기자관리 섹션 생성 완료');
            } else {
                console.error('❌ mainContent 요소를 찾을 수 없습니다.');
                console.log('🔍 body의 모든 자식 요소들:', Array.from(document.body.children).map(el => el.id || el.tagName));
                return false;
            }
        } else {
            console.log('✅ 대기자관리 섹션을 찾았습니다:', waitlistSection);
        }
        
        // 이미 로드되었는지 확인
        if (waitlistSection.innerHTML.trim() !== '<!-- 대기자 관리 컴포넌트가 여기에 로드됩니다 -->' && 
            waitlistSection.innerHTML.trim() !== '') {
            console.log('📋 대기자 관리 컴포넌트가 이미 로드되었습니다.');
            return true;
        }
        
        // 기존 모든 섹션 완전 제거 (대기자 관리 전환 시)
        console.log('🗑️ 기존 모든 섹션 제거 시작...');
        const allSections = document.querySelectorAll('[id$="-section"], .tab-content, .content-section, .section-content');
        allSections.forEach(section => {
            if (section.id !== 'waitlist-section') { // 대기자 섹션은 제외
                console.log(`🗑️ 섹션 제거: ${section.id || section.className}`);
                section.style.display = 'none';
                section.style.visibility = 'hidden';
                section.classList.remove('active');
            }
        });
        
        // 컴포넌트 HTML 로드
        console.log('📦 대기자관리 HTML 컴포넌트 로드 시작...');
        const response = await fetch('components/waitlist-management/waitlist-management.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('📦 HTML 로드 완료, 길이:', html.length);
        waitlistSection.innerHTML = html;
        console.log('📦 HTML 삽입 완료');
        
        // 대기자 관리 스크립트 로드
        await loadWaitlistManagementScript();
        
        // 이벤트 리스너 연결
        attachWaitlistEventListeners();
        
        // 데이터 초기화
        await initializeWaitlistData();
        
        console.log('✅ 대기자 관리 컴포넌트 로드 완료');
        return true;
        
    } catch (error) {
        console.error('❌ 대기자 관리 컴포넌트 로드 실패:', error);
        return false;
    }
}

// 대기자 관리 스크립트 로드
async function loadWaitlistManagementScript() {
    try {
        console.log('📋 대기자 관리 스크립트 로드 시작...');
        
        // 이미 로드되었는지 확인
        if (window.waitlistDataManager && window.waitlistUI) {
            console.log('📋 대기자 관리 스크립트가 이미 로드되었습니다.');
            return true;
        }
        
        // waitlistData.js 로드 (이미 HTML에서 로드됨)
        if (!window.waitlistDataManager) {
            console.log('⏳ waitlistDataManager 로드 대기 중...');
        } else {
            console.log('✅ waitlistDataManager 이미 로드됨');
        }
        
        // waitlistUI.js 로드 (이미 HTML에서 로드됨)
        if (!window.waitlistUI) {
            console.log('⏳ waitlistUI 로드 대기 중...');
        } else {
            console.log('✅ waitlistUI 이미 로드됨');
        }
        
        // 스크립트 로드 완료 대기 (최적화: 대기 시간 단축)
        let retryCount = 0;
        const maxRetries = 30; // 최대 3초로 단축
        
        while (retryCount < maxRetries) {
            if (window.waitlistDataManager && window.waitlistUI) {
                console.log('✅ 대기자 관리 스크립트 로드 완료');
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            retryCount++;
        }
        
        console.error('❌ 대기자 관리 스크립트 로드 타임아웃');
        return false;
        
    } catch (error) {
        console.error('❌ 대기자 관리 스크립트 로드 실패:', error);
        return false;
    }
}

// 대기자 관리 이벤트 리스너 연결 함수
function attachWaitlistEventListeners() {
    try {
        console.log('🔗 대기자 관리 이벤트 리스너 연결 시작...');
        
        // 새 대기자 등록 버튼
        const addWaitlistBtn = document.getElementById('add-farm_waitlist-btn');
        if (addWaitlistBtn) {
            addWaitlistBtn.addEventListener('click', async function() {
                console.log('➕ 새 대기자 등록 버튼 클릭');
                
                // 대기자 모달이 없으면 동적으로 로드
                let modal = document.getElementById('waitlist-modal');
                if (!modal) {
                    console.log('📦 대기자 모달이 없습니다. 동적 로드 시작...');
                    try {
                        await loadWaitlistModal();
                        modal = document.getElementById('waitlist-modal');
                        console.log('🔍 로드된 모달 요소:', modal);
                        
                        if (!modal) {
                            console.error('❌ 대기자 모달 로드 실패');
                            alert('대기자 등록 모달을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                            return;
                        }
                    } catch (loadError) {
                        console.error('❌ 대기자 모달 로드 중 오류:', loadError);
                        alert('대기자 등록 모달을 로드하는 중 오류가 발생했습니다: ' + loadError.message);
                        return;
                    }
                }
                
                // 모달 열기
                if (window.waitlistUI && window.waitlistUI.openWaitlistModal) {
                    window.waitlistUI.openWaitlistModal();
                } else {
                    console.warn('⚠️ waitlistUI.openWaitlistModal 함수를 찾을 수 없습니다');
                }
            });
            console.log('✅ 새 대기자 등록 버튼 이벤트 리스너 연결 완료');
        }
        
        // 대기자 검색
        const waitlistSearch = document.getElementById('waitlist-search');
        if (waitlistSearch) {
            waitlistSearch.addEventListener('input', function() {
                const query = this.value.trim();
                if (window.waitlistUI && window.waitlistUI.searchWaitlist) {
                    window.waitlistUI.searchWaitlist(query);
                }
            });
            console.log('✅ 대기자 검색 이벤트 리스너 연결 완료');
        }
        
        // 대기자 검색 초기화
        const resetWaitlistSearch = document.getElementById('reset-waitlist-search');
        if (resetWaitlistSearch) {
            resetWaitlistSearch.addEventListener('click', function() {
                const searchInput = document.getElementById('waitlist-search');
                if (searchInput) {
                    searchInput.value = '';
                    if (window.waitlistUI && window.waitlistUI.renderWaitlistTable) {
                        window.waitlistUI.renderWaitlistTable();
                    }
                }
            });
            console.log('✅ 대기자 검색 초기화 이벤트 리스너 연결 완료');
        }
        
        // 대기자 상태별 필터 탭
        const waitlistTabs = document.querySelectorAll('.farm_waitlist-tab-btn');
        waitlistTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const status = this.id.replace('farm_waitlist-status-', '');
                if (window.waitlistUI && window.waitlistUI.filterWaitlistByStatus) {
                    window.waitlistUI.filterWaitlistByStatus(status);
                }
            });
        });
        console.log('✅ 대기자 상태별 필터 탭 이벤트 리스너 연결 완료');
        
        // 페이지당 표시 수 선택
        const waitlistPageSize = document.getElementById('waitlist-page-size');
        if (waitlistPageSize) {
            waitlistPageSize.addEventListener('change', function() {
                if (window.waitlistUI && window.waitlistUI.renderWaitlistTable) {
                    window.waitlistUI.renderWaitlistTable();
                }
            });
            console.log('✅ 대기자 페이지 크기 선택 이벤트 리스너 연결 완료');
        }

        console.log('🔗 대기자 관리 이벤트 리스너 연결 완료');

    } catch (error) {
        console.error('❌ 대기자 관리 이벤트 리스너 연결 실패:', error);
    }
}

// 대기자 모달 로드
async function loadWaitlistModal() {
    try {
        console.log('📦 대기자 모달 로드 시작...');
        
        // 모달 HTML 로드
        const response = await fetch('components/waitlist-management/waitlist-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 모달 컨테이너 생성
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        
        // 기존 모달 제거
        const existingModal = document.getElementById('waitlist-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 추가
        document.body.appendChild(modalContainer.firstElementChild);
        
        console.log('✅ 대기자 모달 로드 완료');
        return true;
        
    } catch (error) {
        console.error('❌ 대기자 모달 로드 실패:', error);
        return false;
    }
}

// 대기자 데이터 초기화 (성능 최적화)
async function initializeWaitlistData() {
    try {
        console.log('📋 대기자 데이터 초기화 시작...');
        
        // 병렬로 데이터 로드와 UI 준비
        const promises = [];
        
        if (window.waitlistDataManager) {
            promises.push(window.waitlistDataManager.loadWaitlist());
        }
        
        // 모든 작업을 병렬로 실행
        await Promise.all(promises);
        
        // UI 렌더링은 데이터 로드 완료 후
        if (window.waitlistUI) {
            window.waitlistUI.renderWaitlistTable();
            console.log('✅ 대기자 UI 렌더링 완료');
        }
        
        console.log('📋 대기자 데이터 초기화 완료');
        return true;
        
    } catch (error) {
        console.error('❌ 대기자 데이터 초기화 실패:', error);
        return false;
    }
}

// 전역 함수로 등록
window.loadWaitlistManagementComponent = loadWaitlistManagementComponent;
window.attachWaitlistEventListeners = attachWaitlistEventListeners;
window.loadWaitlistModal = loadWaitlistModal;
window.initializeWaitlistData = initializeWaitlistData;



