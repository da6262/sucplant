/**
 * 모달 관리 모듈
 * 경산다육식물농장 관리시스템
 */

class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    /**
     * 모달 매니저 초기화
     */
    init() {
        console.log('🔄 Modal Manager 초기화 시작...');
        
        // ESC 키로 모달 닫기
        this.setupEscapeKeyHandler();
        
        // 배경 클릭으로 모달 닫기
        this.setupBackgroundClickHandler();
        
        // 모달 닫기 이벤트 리스너 설정
        this.setupModalCloseListeners();
        
        console.log('✅ Modal Manager 초기화 완료');
    }

    /**
     * ESC 키로 모달 닫기 설정
     */
    setupEscapeKeyHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * 배경 클릭으로 모달 닫기 설정
     */
    setupBackgroundClickHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
                const modal = e.target;
                this.closeModal(modal);
            }
        });
    }

    /**
     * 모달 닫기 이벤트 리스너 설정
     */
    setupModalCloseListeners() {
        // 일반적인 모달 닫기 버튼들
        const closeButtons = [
            'close-customer-modal',
            'close-order-modal', 
            'close-product-modal',
            'close-category-modal',
            'close-waitlist-modal',
            'close-sms-modal',
            'close-tracking-import-modal',
            'close-excel-preview-modal',
            'close-product-list-modal',
            'close-bulk-status-modal',
            'close-picking-preview-modal',
            'close-qr-label-preview-modal'
        ];

        closeButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    const modal = button.closest('.fixed.inset-0');
                    if (modal) {
                        this.closeModal(modal);
                    }
                });
            }
        });

        // 취소 버튼들
        const cancelButtons = [
            'customer-modal-cancel',
            'order-modal-cancel',
            'category-modal-cancel',
            'waitlist-modal-cancel',
            'tracking-import-modal-cancel',
            'excel-preview-modal-cancel'
        ];

        cancelButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    const modal = button.closest('.fixed.inset-0');
                    if (modal) {
                        this.closeModal(modal);
                    }
                });
            }
        });
    }

    /**
     * 모달 열기
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.activeModals.add(modal);
            console.log(`✅ 모달 열기: ${modalId}`);
            
            // 모달이 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        } else {
            console.error(`❌ 모달을 찾을 수 없습니다: ${modalId}`);
        }
    }

    /**
     * 모달 닫기
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            this.activeModals.delete(modal);
            console.log('✅ 모달 닫기 완료');
            
            // 모든 모달이 닫혔을 때 body 스크롤 복원
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * 모든 모달 닫기
     */
    closeAllModals() {
        this.activeModals.forEach(modal => {
            modal.classList.add('hidden');
        });
        this.activeModals.clear();
        document.body.style.overflow = '';
        console.log('✅ 모든 모달 닫기 완료');
    }

    /**
     * 특정 모달 ID로 닫기
     */
    closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.closeModal(modal);
        }
    }

    /**
     * 모달이 열려있는지 확인
     */
    isModalOpen(modalId) {
        const modal = document.getElementById(modalId);
        return modal && !modal.classList.contains('hidden');
    }

    /**
     * 활성 모달 개수 반환
     */
    getActiveModalCount() {
        return this.activeModals.size;
    }
}

// 모달 매니저 인스턴스 생성
window.modalManager = new ModalManager();

// 전역 함수로 노출
window.openModal = (modalId) => window.modalManager.openModal(modalId);
window.closeModal = (modal) => window.modalManager.closeModal(modal);
window.closeModalById = (modalId) => window.modalManager.closeModalById(modalId);
window.closeAllModals = () => window.modalManager.closeAllModals();
