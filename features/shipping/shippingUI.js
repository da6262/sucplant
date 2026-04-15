// 배송 UI 관리
// 배송 목록, 추적 UI, 라벨 인쇄

import { ShippingData } from './shippingData.js';

export class ShippingUI {
    constructor() {
        this.shippingData = new ShippingData();
        this.currentUploadMethod = 'manual';
        this.excelData = null;
    }

    // 배송 주문 목록 렌더링
    async renderShippingOrders() {
        try {
            console.log('📦 배송 주문 목록 렌더링 시작...');
            
            const orders = await this.shippingData.loadShippingOrders();
            const tbody = document.getElementById('shipping-table-body');
            
            if (!tbody) {
                console.error('❌ 배송 테이블 body를 찾을 수 없습니다');
                return;
            }
            
            if (orders.length === 0) {
                tbody.innerHTML = window.renderEmptyRow(9, '배송할 주문이 없습니다');
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                        <input type="checkbox" class="shipping-order-checkbox rounded text-blue-600 focus:ring-blue-500" 
                               data-order-id="${order.id}">
                    </td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">${order.order_number}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">${this.formatDate(order.created_at)}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${order.customer_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">${order.customer_phone}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">${order.shipping_address}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${order.product_name}</td>
                    <td class="px-4 py-3 text-sm">
                        ${order.tracking_number ? 
                            `<span class="text-green-600 font-mono">${order.tracking_number}</span>` : 
                            '<span class="text-gray-400">미등록</span>'
                        }
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(order.status)}">
                            ${order.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <div class="flex space-x-2">
                            <button onclick="shippingUI.editTrackingNumber('${order.id}')" 
                                    class="text-blue-600 hover:text-blue-800 text-xs">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="shippingUI.viewOrderDetails('${order.id}')" 
                                    class="text-green-600 hover:text-green-800 text-xs">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            console.log(`✅ 배송 주문 ${orders.length}개 렌더링 완료`);
        } catch (error) {
            console.error('❌ 배송 주문 목록 렌더링 실패:', error);
        }
    }

    // 송장번호 일괄입력 모달 열기
    openTrackingImportModal() {
        try {
            console.log('📦 송장번호 일괄입력 모달 열기...');
            
            const modal = document.getElementById('tracking-import-modal');
            if (!modal) {
                console.error('❌ 송장번호 일괄입력 모달을 찾을 수 없습니다');
                return;
            }
            
            // 모달 초기화
            this.resetTrackingImportModal();
            
            // 모달 표시
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            console.log('✅ 송장번호 일괄입력 모달 열기 완료');
        } catch (error) {
            console.error('❌ 송장번호 일괄입력 모달 열기 실패:', error);
        }
    }

    // 송장번호 일괄입력 모달 닫기
    closeTrackingImportModal() {
        try {
            console.log('📦 송장번호 일괄입력 모달 닫기...');
            
            const modal = document.getElementById('tracking-import-modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
                
                // 모달 초기화
                this.resetTrackingImportModal();
            }
            
            console.log('✅ 송장번호 일괄입력 모달 닫기 완료');
        } catch (error) {
            console.error('❌ 송장번호 일괄입력 모달 닫기 실패:', error);
        }
    }

    // 송장번호 일괄입력 모달 초기화
    resetTrackingImportModal() {
        // 수동 입력 방식으로 초기화
        this.switchUploadMethod('manual');
        
        // 입력 필드 초기화
        const textarea = document.getElementById('tracking-import-text');
        if (textarea) {
            textarea.value = '';
        }
        
        // 엑셀 파일 초기화
        const fileInput = document.getElementById('tracking-excel-input');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // 미리보기 영역 숨기기
        const previewArea = document.getElementById('excel-preview-area');
        if (previewArea) {
            previewArea.classList.add('hidden');
        }
    }

    // 업로드 방식 전환
    switchUploadMethod(method) {
        try {
            console.log(`📦 업로드 방식 전환: ${method}`);
            
            this.currentUploadMethod = method;
            
            const manualSection = document.getElementById('manual-input-section');
            const excelSection = document.getElementById('excel-upload-section');
            const manualRadio = document.getElementById('upload-method-manual');
            const excelRadio = document.getElementById('upload-method-excel');
            
            if (method === 'manual') {
                if (manualSection) manualSection.classList.remove('hidden');
                if (excelSection) excelSection.classList.add('hidden');
                if (manualRadio) manualRadio.checked = true;
            } else if (method === 'excel') {
                if (manualSection) manualSection.classList.add('hidden');
                if (excelSection) excelSection.classList.remove('hidden');
                if (excelRadio) excelRadio.checked = true;
            }
            
            console.log(`✅ 업로드 방식 전환 완료: ${method}`);
        } catch (error) {
            console.error('❌ 업로드 방식 전환 실패:', error);
        }
    }

    // 엑셀 파일 업로드 처리
    handleExcelFileUpload(event) {
        try {
            console.log('📦 엑셀 파일 업로드 처리...');
            
            const file = event.target.files[0];
            if (!file) {
                console.log('⚠️ 파일이 선택되지 않았습니다');
                return;
            }
            
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // 엑셀 파일 파싱 (간단한 CSV 형태로 가정)
                    const data = e.target.result;
                    this.parseExcelData(data);
                } catch (error) {
                    console.error('❌ 엑셀 파일 파싱 실패:', error);
                    alert('엑셀 파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.');
                }
            };
            
            reader.readAsText(file);
            
            console.log('✅ 엑셀 파일 업로드 처리 완료');
        } catch (error) {
            console.error('❌ 엑셀 파일 업로드 처리 실패:', error);
        }
    }

    // 엑셀 데이터 파싱
    parseExcelData(data) {
        try {
            console.log('📦 엑셀 데이터 파싱...');
            
            const lines = data.split('\n').filter(line => line.trim());
            const trackingData = [];
            
            lines.forEach((line, index) => {
                if (index === 0) return; // 헤더 스킵
                
                const [orderNumber, trackingNumber] = line.split(',').map(item => item.trim());
                if (orderNumber && trackingNumber) {
                    trackingData.push({
                        orderNumber,
                        trackingNumber
                    });
                }
            });
            
            this.excelData = trackingData;
            this.showExcelPreview(trackingData);
            
            console.log(`✅ 엑셀 데이터 파싱 완료: ${trackingData.length}개`);
        } catch (error) {
            console.error('❌ 엑셀 데이터 파싱 실패:', error);
        }
    }

    // 엑셀 미리보기 표시
    showExcelPreview(data) {
        try {
            console.log('📦 엑셀 미리보기 표시...');
            
            const previewArea = document.getElementById('excel-preview-area');
            const tbody = document.getElementById('excel-preview-tbody');
            
            if (previewArea && tbody) {
                previewArea.classList.remove('hidden');
                
                // 처음 5개만 표시
                const previewData = data.slice(0, 5);
                tbody.innerHTML = previewData.map(item => `
                    <tr>
                        <td class="px-3 py-2">${item.orderNumber}</td>
                        <td class="px-3 py-2 font-mono">${item.trackingNumber}</td>
                    </tr>
                `).join('');
            }
            
            console.log('✅ 엑셀 미리보기 표시 완료');
        } catch (error) {
            console.error('❌ 엑셀 미리보기 표시 실패:', error);
        }
    }

    // 송장번호 일괄 적용
    async importTrackingNumbers() {
        try {
            console.log('📦 송장번호 일괄 적용 시작...');
            
            let trackingData = [];
            
            if (this.currentUploadMethod === 'manual') {
                // 수동 입력 데이터 처리
                const textarea = document.getElementById('tracking-import-text');
                if (!textarea || !textarea.value.trim()) {
                    alert('송장번호를 입력해주세요.');
                    return;
                }
                
                const lines = textarea.value.split('\n').filter(line => line.trim());
                trackingData = lines.map(line => {
                    const [orderNumber, trackingNumber] = line.split(',').map(item => item.trim());
                    return { orderNumber, trackingNumber };
                }).filter(item => item.orderNumber && item.trackingNumber);
                
            } else if (this.currentUploadMethod === 'excel') {
                // 엑셀 데이터 사용
                if (!this.excelData || this.excelData.length === 0) {
                    alert('엑셀 파일을 먼저 업로드해주세요.');
                    return;
                }
                trackingData = this.excelData;
            }
            
            if (trackingData.length === 0) {
                alert('유효한 송장번호 데이터가 없습니다.');
                return;
            }
            
            // 주문 ID 매핑
            const orders = await this.shippingData.loadShippingOrders();
            const mappedData = trackingData.map(item => {
                const order = orders.find(o => o.order_number === item.orderNumber);
                return order ? { orderId: order.id, trackingNumber: item.trackingNumber } : null;
            }).filter(item => item !== null);
            
            if (mappedData.length === 0) {
                alert('매칭되는 주문을 찾을 수 없습니다.');
                return;
            }
            
            // 일괄 업데이트 실행
            const result = await this.shippingData.bulkUpdateTrackingNumbers(mappedData);
            
            // 결과 표시
            alert(`송장번호 일괄 적용 완료!\n\n성공: ${result.successCount}개\n실패: ${result.failCount}개`);
            
            // 모달 닫기
            this.closeTrackingImportModal();
            
            // 배송 목록 새로고침
            await this.renderShippingOrders();
            
            console.log('✅ 송장번호 일괄 적용 완료');
        } catch (error) {
            console.error('❌ 송장번호 일괄 적용 실패:', error);
            alert('송장번호 일괄 적용 중 오류가 발생했습니다.');
        }
    }

    // 송장번호 수정
    editTrackingNumber(orderId) {
        try {
            console.log(`📦 송장번호 수정: ${orderId}`);
            
            const newTrackingNumber = prompt('새 송장번호를 입력하세요:');
            if (newTrackingNumber && newTrackingNumber.trim()) {
                this.shippingData.updateTrackingNumber(orderId, newTrackingNumber.trim());
                this.renderShippingOrders();
            }
        } catch (error) {
            console.error('❌ 송장번호 수정 실패:', error);
        }
    }

    // 주문 상세 보기
    viewOrderDetails(orderId) {
        try {
            console.log(`📦 주문 상세 보기: ${orderId}`);
            
            // 주문 상세 모달이나 페이지로 이동
            // 현재는 간단한 알림으로 처리
            alert('주문 상세 기능은 추후 구현 예정입니다.');
        } catch (error) {
            console.error('❌ 주문 상세 보기 실패:', error);
        }
    }

    // 로젠택배용 데이터 내보내기
    exportToLogen() {
        try {
            console.log('📦 로젠택배용 데이터 내보내기...');
            
            this.shippingData.exportToLogen();
            
            console.log('✅ 로젠택배용 데이터 내보내기 완료');
        } catch (error) {
            console.error('❌ 로젠택배용 데이터 내보내기 실패:', error);
        }
    }

    // 전체 배송 데이터 빠른 내보내기
    quickExportAll() {
        try {
            console.log('📦 전체 배송 데이터 빠른 내보내기...');
            
            this.shippingData.exportToLogen();
            
            console.log('✅ 전체 배송 데이터 빠른 내보내기 완료');
        } catch (error) {
            console.error('❌ 전체 배송 데이터 빠른 내보내기 실패:', error);
        }
    }

    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    }

    getStatusColor(status) {
        const colors = {
            '주문접수': 'bg-yellow-100 text-yellow-800',
            '입금확인': 'bg-green-100 text-green-800',
            '배송준비': 'bg-orange-100 text-orange-800',
            '배송시작': 'bg-purple-100 text-purple-800',
            '배송완료': 'bg-emerald-100 text-emerald-800',
            '주문취소': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
}

// 전역 인스턴스 생성
export const shippingUI = new ShippingUI();