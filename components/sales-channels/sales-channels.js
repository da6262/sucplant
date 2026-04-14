// 판매채널 관리 컴포넌트
// components/sales-channels/sales-channels.js

class SalesChannelsComponent {
    constructor() {
        this.isInitialized = false;
        console.log('🏪 SalesChannelsComponent 초기화');
    }

    // 컴포넌트 초기화
    async init() {
        try {
            console.log('🔄 판매채널 관리 컴포넌트 초기화 시작...');
            
            // HTML 로드
            await this.loadHTML();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 데이터 로드
            await this.loadChannels();
            
            this.isInitialized = true;
            console.log('✅ 판매채널 관리 컴포넌트 초기화 완료');
            
        } catch (error) {
            console.error('❌ 판매채널 관리 컴포넌트 초기화 실패:', error);
        }
    }

    // HTML 동적 로드
    async loadHTML() {
        try {
            console.log('📦 판매채널 관리 HTML 로드 중...');
            
            const response = await fetch('components/sales-channels/sales-channels.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            
            // channels-section에 HTML 삽입
            const channelsSection = document.getElementById('channels-section');
            if (channelsSection) {
                channelsSection.innerHTML = html;
                console.log('✅ 판매채널 관리 HTML 로드 완료');
            } else {
                throw new Error('channels-section 요소를 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 판매채널 관리 HTML 로드 실패:', error);
            throw error;
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        try {
            console.log('🔗 판매채널 관리 이벤트 리스너 설정 중...');
            
            // 새 채널 추가 버튼
            const addChannelBtn = document.getElementById('add-channel-btn');
            console.log('🔍 add-channel-btn 요소:', addChannelBtn);
            if (addChannelBtn) {
                // 기존 이벤트 리스너 제거
                addChannelBtn.removeEventListener('click', this.openChannelModal);
                // 새 이벤트 리스너 추가
                addChannelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ 새 채널 추가 버튼 클릭됨');
                    this.openChannelModal();
                });
                console.log('✅ 새 채널 추가 버튼 이벤트 리스너 등록 완료');
            } else {
                console.warn('⚠️ add-channel-btn 요소를 찾을 수 없습니다');
            }
            
            // 모달 닫기 버튼
            const closeModalBtn = document.getElementById('close-channel-modal');
            const cancelBtn = document.getElementById('cancel-channel-btn');
            console.log('🔍 모달 닫기 버튼들:', { closeModalBtn, cancelBtn });
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ 모달 닫기 버튼 클릭됨');
                    this.closeChannelModal();
                });
                console.log('✅ 모달 닫기 버튼 이벤트 리스너 등록 완료');
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ 취소 버튼 클릭됨');
                    this.closeChannelModal();
                });
                console.log('✅ 취소 버튼 이벤트 리스너 등록 완료');
            }
            
            // 채널 폼 제출
            const channelForm = document.getElementById('channel-form');
            console.log('🔍 channel-form 요소:', channelForm);
            if (channelForm) {
                channelForm.addEventListener('submit', (e) => this.handleChannelSubmit(e));
                console.log('✅ 채널 폼 제출 이벤트 리스너 등록 완료');
            } else {
                console.warn('⚠️ channel-form 요소를 찾을 수 없습니다');
            }
            
            console.log('✅ 판매채널 관리 이벤트 리스너 설정 완료');
            
        } catch (error) {
            console.error('❌ 판매채널 관리 이벤트 리스너 설정 실패:', error);
        }
    }

    // 채널 데이터 로드
    async loadChannels() {
        try {
            console.log('📋 판매채널 데이터 로드 중...');
            
            if (window.salesChannelsDataManager) {
                const channels = await window.salesChannelsDataManager.loadChannels();
                this.renderChannels(channels);
                this.updateStatistics(channels);
                console.log('✅ 판매채널 데이터 로드 완료');
            } else {
                console.warn('⚠️ salesChannelsDataManager를 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 판매채널 데이터 로드 실패:', error);
        }
    }

    // 채널 목록 렌더링
    renderChannels(channels) {
        try {
            const channelsList = document.getElementById('channels-list');
            if (!channelsList) return;

            if (channels.length === 0) {
                channelsList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-store text-4xl mb-4"></i>
                        <p>등록된 판매채널이 없습니다.</p>
                        <p class="text-sm">새 채널을 추가해보세요.</p>
                    </div>
                `;
                return;
            }

            channelsList.innerHTML = channels.map(channel => `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                             style="background-color: ${this.getColorValue(channel.color)}">
                            <i class="fas fa-${channel.icon}"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${channel.name}</div>
                            <div class="text-sm text-gray-600">${channel.description || '설명 없음'}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${channel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            <i class="fas fa-${channel.is_active ? 'check' : 'pause'} mr-1"></i>
                            ${channel.is_active ? '활성' : '비활성'}
                        </span>
                        <button onclick="salesChannelsComponent.editChannel('${channel.id}')" 
                                class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="salesChannelsComponent.deleteChannel('${channel.id}')" 
                                class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ 채널 목록 렌더링 실패:', error);
        }
    }

    // 통계 업데이트
    updateStatistics(channels) {
        try {
            const totalChannels = channels.length;
            const activeChannels = channels.filter(c => c.is_active).length;
            const inactiveChannels = totalChannels - activeChannels;

            // 통계 업데이트
            const totalCount = document.getElementById('total-channels-count');
            const activeCount = document.getElementById('active-channels-count');
            const inactiveCount = document.getElementById('inactive-channels-count');

            if (totalCount) totalCount.textContent = totalChannels;
            if (activeCount) activeCount.textContent = activeChannels;
            if (inactiveCount) inactiveCount.textContent = inactiveChannels;

        } catch (error) {
            console.error('❌ 통계 업데이트 실패:', error);
        }
    }

    // 채널 모달 열기
    openChannelModal(channelId = null) {
        try {
            console.log('🔍 채널 모달 열기 시도:', channelId);
            
            const modal = document.getElementById('channel-modal');
            const modalTitle = document.getElementById('channel-modal-title');
            const form = document.getElementById('channel-form');
            
            console.log('🔍 모달 요소 확인:', {
                modal: !!modal,
                modalTitle: !!modalTitle,
                form: !!form
            });
            
            if (!modal) {
                console.error('❌ channel-modal 요소를 찾을 수 없습니다');
                return;
            }
            
            if (!form) {
                console.error('❌ channel-form 요소를 찾을 수 없습니다');
                return;
            }

            if (channelId) {
                // 수정 모드
                if (modalTitle) modalTitle.textContent = '채널 수정';
                this.loadChannelForEdit(channelId);
            } else {
                // 추가 모드
                if (modalTitle) modalTitle.textContent = '새 채널 추가';
                form.reset();
                const channelIdInput = document.getElementById('channel-id');
                if (channelIdInput) channelIdInput.value = '';
            }

            // 모달 표시
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.zIndex = '9999';
            
            console.log('✅ 채널 모달 표시 완료');

        } catch (error) {
            console.error('❌ 채널 모달 열기 실패:', error);
        }
    }

    // 채널 모달 닫기
    closeChannelModal() {
        try {
            console.log('🔍 채널 모달 닫기 시도');
            
            const modal = document.getElementById('channel-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                console.log('✅ 채널 모달 닫기 완료');
            } else {
                console.warn('⚠️ channel-modal 요소를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 채널 모달 닫기 실패:', error);
        }
    }

    // 채널 수정용 데이터 로드
    async loadChannelForEdit(channelId) {
        try {
            if (window.salesChannelsDataManager) {
                const channel = window.salesChannelsDataManager.getChannelById(channelId);
                if (channel) {
                    document.getElementById('channel-id').value = channel.id;
                    document.getElementById('channel-name').value = channel.name;
                    document.getElementById('channel-icon').value = channel.icon || 'store';
                    document.getElementById('channel-color').value = channel.color || 'green';
                    document.getElementById('channel-description').value = channel.description || '';
                    document.getElementById('channel-active').checked = channel.is_active;
                }
            }
        } catch (error) {
            console.error('❌ 채널 수정 데이터 로드 실패:', error);
        }
    }

    // 채널 폼 제출 처리
    async handleChannelSubmit(event) {
        try {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const channelData = {
                name: formData.get('channel-name'),
                icon: formData.get('channel-icon'),
                color: formData.get('channel-color'),
                description: formData.get('channel-description'),
                is_active: formData.get('channel-active') === 'on'
            };

            const channelId = formData.get('channel-id');

            if (window.salesChannelsDataManager) {
                if (channelId) {
                    // 수정
                    await window.salesChannelsDataManager.updateChannel(channelId, channelData);
                    console.log('✅ 채널 수정 완료');
                } else {
                    // 추가
                    await window.salesChannelsDataManager.addChannel(channelData);
                    console.log('✅ 채널 추가 완료');
                }

                // 목록 새로고침
                await this.loadChannels();
                
                // 모달 닫기
                this.closeChannelModal();
                
                // 성공 메시지
                if (window.showToast) {
                    window.showToast(channelId ? '채널이 수정되었습니다.' : '채널이 추가되었습니다.', 3000);
                }
            }

        } catch (error) {
            console.error('❌ 채널 저장 실패:', error);
            alert('채널 저장에 실패했습니다: ' + error.message);
        }
    }

    // 채널 수정
    editChannel(channelId) {
        this.openChannelModal(channelId);
    }

    // 채널 삭제
    async deleteChannel(channelId) {
        try {
            if (!confirm('정말로 이 채널을 삭제하시겠습니까?')) {
                return;
            }

            if (window.salesChannelsDataManager) {
                await window.salesChannelsDataManager.deleteChannel(channelId);
                
                // 목록 새로고침
                await this.loadChannels();
                
                // 성공 메시지
                if (window.showToast) {
                    window.showToast('채널이 삭제되었습니다.', 3000);
                }
            }

        } catch (error) {
            console.error('❌ 채널 삭제 실패:', error);
            alert('채널 삭제에 실패했습니다: ' + error.message);
        }
    }

    // 색상 값 가져오기
    getColorValue(colorName) {
        const colors = {
            green: '#10B981',
            blue: '#3B82F6',
            purple: '#8B5CF6',
            orange: '#F59E0B',
            red: '#EF4444',
            yellow: '#EAB308',
            gray: '#6B7280'
        };
        return colors[colorName] || colors.green;
    }
}

// 전역 인스턴스 생성
const salesChannelsComponent = new SalesChannelsComponent();
window.salesChannelsComponent = salesChannelsComponent;

// 전역 함수로 등록 (디버깅용)
window.openChannelModal = (channelId = null) => {
    console.log('🌐 전역 openChannelModal 호출:', channelId);
    if (window.salesChannelsComponent) {
        window.salesChannelsComponent.openChannelModal(channelId);
    } else {
        console.error('❌ salesChannelsComponent가 초기화되지 않았습니다');
    }
};

window.closeChannelModal = () => {
    console.log('🌐 전역 closeChannelModal 호출');
    if (window.salesChannelsComponent) {
        window.salesChannelsComponent.closeChannelModal();
    } else {
        console.error('❌ salesChannelsComponent가 초기화되지 않았습니다');
    }
};

export default salesChannelsComponent;
