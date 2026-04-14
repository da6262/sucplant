/**
 * 배송비 설정 모듈
 * 배송비 규칙 관리 및 설정
 */

export class ShippingSettingsModule {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.shippingRules = [];
        this.currentEditingRule = null;
    }

    async initialize() {
        try {
            console.log('🚚 배송비 설정 모듈 초기화 중...');
            
            // 배송비 설정 섹션 표시
            this.showShippingSettingsSection();
            
            // 기존 배송비 규칙 로드
            await this.loadShippingRules();
            
            // 이벤트 리스너 연결
            this.attachEventListeners();
            
            console.log('✅ 배송비 설정 모듈 초기화 완료');
        } catch (error) {
            console.error('❌ 배송비 설정 모듈 초기화 실패:', error);
            throw error;
        }
    }

    showShippingSettingsSection() {
        const section = document.getElementById('shipping-settings-section');
        if (section) {
            section.classList.remove('hidden');
            section.style.display = 'block';
        }
    }

    async loadShippingRules() {
        try {
            // 실제 구현에서는 API에서 데이터를 가져와야 함
            // 현재는 예시 데이터 사용
            this.shippingRules = [
                {
                    id: 1,
                    name: '기본 배송비',
                    condition: 'amount',
                    threshold: 0,
                    shippingFee: 3000,
                    isDefault: true
                }
            ];
            
            this.updateShippingRulesTable();
        } catch (error) {
            console.error('❌ 배송비 규칙 로드 실패:', error);
            throw error;
        }
    }

    updateShippingRulesTable() {
        const tbody = document.querySelector('#shipping-rules-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.shippingRules.forEach(rule => {
            const row = this.createShippingRuleRow(rule);
            tbody.appendChild(row);
        });
    }

    createShippingRuleRow(rule) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rule.name}</td>
            <td>${this.getConditionText(rule.condition, rule.threshold)}</td>
            <td>${rule.shippingFee.toLocaleString()}원</td>
            <td>
                <button class="btn btn-sm btn-primary edit-rule" data-rule-id="${rule.id}">
                    수정
                </button>
                <button class="btn btn-sm btn-danger delete-rule" data-rule-id="${rule.id}">
                    삭제
                </button>
            </td>
        `;
        return row;
    }

    getConditionText(condition, threshold) {
        const conditionMap = {
            'amount': `주문금액 ${threshold.toLocaleString()}원 이상`,
            'quantity': `수량 ${threshold}개 이상`,
            'weight': `무게 ${threshold}kg 이상`
        };
        return conditionMap[condition] || condition;
    }

    attachEventListeners() {
        // 배송비 규칙 추가 버튼
        const addRuleButton = document.querySelector('#add-shipping-rule');
        if (addRuleButton) {
            this.eventManager.add(addRuleButton, 'click', () => this.showAddShippingRuleModal());
        }

        // 배송비 규칙 수정/삭제 버튼들
        this.attachRuleActionListeners();
    }

    attachRuleActionListeners() {
        // 수정 버튼
        document.querySelectorAll('.edit-rule').forEach(button => {
            this.eventManager.add(button, 'click', (e) => {
                const ruleId = parseInt(e.target.dataset.ruleId);
                this.editShippingRule(ruleId);
            });
        });

        // 삭제 버튼
        document.querySelectorAll('.delete-rule').forEach(button => {
            this.eventManager.add(button, 'click', (e) => {
                const ruleId = parseInt(e.target.dataset.ruleId);
                this.deleteShippingRule(ruleId);
            });
        });
    }

    async showAddShippingRuleModal() {
        try {
            // 모달 HTML 로드
            await this.loadShippingRuleModalHTML();
            
            // 모달 표시
            this.showShippingRuleModal();
            
            // 이벤트 리스너 연결
            this.attachShippingRuleModalListeners();
            
        } catch (error) {
            console.error('❌ 배송비 규칙 추가 모달 열기 실패:', error);
            throw error;
        }
    }

    async loadShippingRuleModalHTML() {
        const response = await fetch('components/order-management/shipping-rule-modal.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // 모달 컨테이너 찾기 또는 생성
        let modalContainer = document.getElementById('shipping-rule-modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'shipping-rule-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = html;
    }

    showShippingRuleModal() {
        const modal = document.getElementById('shipping-rule-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    attachShippingRuleModalListeners() {
        const modal = document.getElementById('shipping-rule-modal');
        if (!modal) return;

        // 저장 버튼
        const saveButton = modal.querySelector('#save-shipping-rule');
        if (saveButton) {
            this.eventManager.add(saveButton, 'click', () => this.saveShippingRule());
        }

        // 취소 버튼
        const cancelButton = modal.querySelector('#cancel-shipping-rule');
        if (cancelButton) {
            this.eventManager.add(cancelButton, 'click', () => this.closeShippingRuleModal());
        }

        // 닫기 버튼
        const closeButton = modal.querySelector('#close-shipping-rule-modal');
        if (closeButton) {
            this.eventManager.add(closeButton, 'click', () => this.closeShippingRuleModal());
        }

        // 배경 클릭으로 닫기
        this.eventManager.add(modal, 'click', (e) => {
            if (e.target === modal) {
                this.closeShippingRuleModal();
            }
        });

        // ESC 키로 닫기
        this.eventManager.add(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeShippingRuleModal();
            }
        });
    }

    async saveShippingRule() {
        try {
            const form = document.querySelector('#shipping-rule-form');
            if (!form) {
                throw new Error('배송비 규칙 폼을 찾을 수 없습니다.');
            }

            const formData = new FormData(form);
            const ruleData = {
                name: formData.get('rule-name'),
                condition: formData.get('rule-condition'),
                threshold: parseFloat(formData.get('rule-threshold')),
                shippingFee: parseFloat(formData.get('rule-shipping-fee'))
            };

            // 유효성 검사
            if (!this.validateShippingRule(ruleData)) {
                return;
            }

            // 규칙 저장
            if (this.currentEditingRule) {
                // 수정
                await this.updateShippingRule(this.currentEditingRule.id, ruleData);
            } else {
                // 추가
                await this.addShippingRule(ruleData);
            }

            // 모달 닫기
            this.closeShippingRuleModal();
            
            // 테이블 업데이트
            this.updateShippingRulesTable();
            
            console.log('✅ 배송비 규칙 저장 완료');
            
        } catch (error) {
            console.error('❌ 배송비 규칙 저장 실패:', error);
            alert('배송비 규칙 저장 중 오류가 발생했습니다.');
        }
    }

    validateShippingRule(ruleData) {
        if (!ruleData.name.trim()) {
            alert('규칙명을 입력해주세요.');
            return false;
        }
        
        if (!ruleData.condition) {
            alert('조건을 선택해주세요.');
            return false;
        }
        
        if (isNaN(ruleData.threshold) || ruleData.threshold < 0) {
            alert('기준값을 올바르게 입력해주세요.');
            return false;
        }
        
        if (isNaN(ruleData.shippingFee) || ruleData.shippingFee < 0) {
            alert('배송비를 올바르게 입력해주세요.');
            return false;
        }
        
        return true;
    }

    async addShippingRule(ruleData) {
        // 실제 구현에서는 API를 통해 서버에 저장
        const newRule = {
            id: Date.now(), // 임시 ID
            ...ruleData,
            isDefault: false
        };
        
        this.shippingRules.push(newRule);
    }

    async updateShippingRule(ruleId, ruleData) {
        // 실제 구현에서는 API를 통해 서버에 업데이트
        const ruleIndex = this.shippingRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex !== -1) {
            this.shippingRules[ruleIndex] = { ...this.shippingRules[ruleIndex], ...ruleData };
        }
    }

    async deleteShippingRule(ruleId) {
        if (!confirm('이 배송비 규칙을 삭제하시겠습니까?')) {
            return;
        }

        try {
            // 실제 구현에서는 API를 통해 서버에서 삭제
            this.shippingRules = this.shippingRules.filter(rule => rule.id !== ruleId);
            
            // 테이블 업데이트
            this.updateShippingRulesTable();
            
            console.log('✅ 배송비 규칙 삭제 완료');
            
        } catch (error) {
            console.error('❌ 배송비 규칙 삭제 실패:', error);
            alert('배송비 규칙 삭제 중 오류가 발생했습니다.');
        }
    }

    editShippingRule(ruleId) {
        const rule = this.shippingRules.find(r => r.id === ruleId);
        if (!rule) {
            console.error('배송비 규칙을 찾을 수 없습니다:', ruleId);
            return;
        }

        this.currentEditingRule = rule;
        
        // 모달 열기
        this.showAddShippingRuleModal();
        
        // 폼에 기존 데이터 채우기
        this.populateShippingRuleForm(rule);
    }

    populateShippingRuleForm(rule) {
        const form = document.querySelector('#shipping-rule-form');
        if (!form) return;

        form.querySelector('#rule-name').value = rule.name;
        form.querySelector('#rule-condition').value = rule.condition;
        form.querySelector('#rule-threshold').value = rule.threshold;
        form.querySelector('#rule-shipping-fee').value = rule.shippingFee;
    }

    closeShippingRuleModal() {
        const modal = document.getElementById('shipping-rule-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // 이벤트 리스너 정리
        this.eventManager.removeAll();
        
        // 모달 HTML 제거
        const modalContainer = document.getElementById('shipping-rule-modal-container');
        if (modalContainer) {
            modalContainer.remove();
        }
        
        this.currentEditingRule = null;
        console.log('✅ 배송비 규칙 모달 닫기 완료');
    }

    calculateShippingFee(orderAmount, orderQuantity, orderWeight) {
        // 배송비 계산 로직
        for (const rule of this.shippingRules.sort((a, b) => b.threshold - a.threshold)) {
            let conditionMet = false;
            
            switch (rule.condition) {
                case 'amount':
                    conditionMet = orderAmount >= rule.threshold;
                    break;
                case 'quantity':
                    conditionMet = orderQuantity >= rule.threshold;
                    break;
                case 'weight':
                    conditionMet = orderWeight >= rule.threshold;
                    break;
            }
            
            if (conditionMet) {
                return rule.shippingFee;
            }
        }
        
        // 기본 배송비 반환
        return 3000;
    }

    cleanup() {
        this.eventManager.removeAll();
        this.shippingRules = [];
        this.currentEditingRule = null;
        console.log('🧹 배송비 설정 모듈 정리 완료');
    }
}

