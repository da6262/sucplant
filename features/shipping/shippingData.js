// 배송 데이터 관리
// 배송 추적, 송장번호, 배송 상태

export class ShippingData {
    constructor() {
        this.shippingOrders = [];
        this.trackingData = [];
    }

    // 배송 주문 로드
    async loadShippingOrders() {
        try {
            console.log('📦 배송 주문 로드 시작...');
            
            // 로컬 스토리지에서 주문 데이터 가져오기
            const ordersData = localStorage.getItem('farm_orders');
            if (ordersData) {
                const orders = JSON.parse(ordersData);
                // 배송 가능한 주문만 필터링 (입금확인, 배송준비, 배송시작 상태)
                this.shippingOrders = orders.filter(order => 
                    ['입금확인', '배송준비', '배송시작', '배송완료'].includes(order.status)
                );
                console.log(`✅ 배송 주문 ${this.shippingOrders.length}개 로드 완료`);
            } else {
                console.log('⚠️ 주문 데이터가 없습니다');
                this.shippingOrders = [];
            }
            
            return this.shippingOrders;
        } catch (error) {
            console.error('❌ 배송 주문 로드 실패:', error);
            return [];
        }
    }

    // 송장번호 업데이트
    async updateTrackingNumber(orderId, trackingNumber) {
        try {
            console.log(`📦 송장번호 업데이트: ${orderId} -> ${trackingNumber}`);
            
            // 로컬 스토리지에서 주문 데이터 가져오기
            const ordersData = localStorage.getItem('farm_orders');
            if (ordersData) {
                const orders = JSON.parse(ordersData);
                const orderIndex = orders.findIndex(order => order.id === orderId);
                
                if (orderIndex !== -1) {
                    // 송장번호 업데이트
                    orders[orderIndex].tracking_number = trackingNumber;
                    orders[orderIndex].status = '배송시작';
                    orders[orderIndex].updated_at = new Date().toISOString();
                    
                    // 로컬 스토리지에 저장
                    localStorage.setItem('farm_orders', JSON.stringify(orders));
                    
                    console.log(`✅ 송장번호 업데이트 완료: ${orderId}`);
                    return true;
                } else {
                    console.error(`❌ 주문을 찾을 수 없습니다: ${orderId}`);
                    return false;
                }
            } else {
                console.error('❌ 주문 데이터가 없습니다');
                return false;
            }
        } catch (error) {
            console.error('❌ 송장번호 업데이트 실패:', error);
            return false;
        }
    }

    // 일괄 송장번호 업데이트
    async bulkUpdateTrackingNumbers(trackingData) {
        try {
            console.log(`📦 일괄 송장번호 업데이트 시작: ${trackingData.length}개`);
            
            let successCount = 0;
            let failCount = 0;
            
            for (const item of trackingData) {
                const success = await this.updateTrackingNumber(item.orderId, item.trackingNumber);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
            
            console.log(`✅ 일괄 업데이트 완료: 성공 ${successCount}개, 실패 ${failCount}개`);
            return { successCount, failCount };
        } catch (error) {
            console.error('❌ 일괄 송장번호 업데이트 실패:', error);
            return { successCount: 0, failCount: trackingData.length };
        }
    }

    // 배송 상태 업데이트
    async updateShippingStatus(orderId, status) {
        try {
            console.log(`📦 배송 상태 업데이트: ${orderId} -> ${status}`);
            
            const ordersData = localStorage.getItem('farm_orders');
            if (ordersData) {
                const orders = JSON.parse(ordersData);
                const orderIndex = orders.findIndex(order => order.id === orderId);
                
                if (orderIndex !== -1) {
                    orders[orderIndex].status = status;
                    orders[orderIndex].updated_at = new Date().toISOString();
                    
                    localStorage.setItem('farm_orders', JSON.stringify(orders));
                    
                    console.log(`✅ 배송 상태 업데이트 완료: ${orderId}`);
                    return true;
                } else {
                    console.error(`❌ 주문을 찾을 수 없습니다: ${orderId}`);
                    return false;
                }
            } else {
                console.error('❌ 주문 데이터가 없습니다');
                return false;
            }
        } catch (error) {
            console.error('❌ 배송 상태 업데이트 실패:', error);
            return false;
        }
    }

    // 배송 데이터 내보내기 (로젠택배용)
    exportToLogen() {
        try {
            console.log('📦 로젠택배용 배송 데이터 내보내기...');
            
            const exportData = this.shippingOrders.map(order => ({
                주문번호: order.order_number,
                고객명: order.customer_name,
                전화번호: order.customer_phone,
                주소: order.shipping_address,
                상품명: order.product_name,
                수량: order.quantity,
                송장번호: order.tracking_number || '',
                상태: order.status
            }));
            
            // CSV 형태로 변환
            const csvContent = this.convertToCSV(exportData);
            
            // 파일 다운로드
            this.downloadCSV(csvContent, `배송데이터_${new Date().toISOString().split('T')[0]}.csv`);
            
            console.log('✅ 배송 데이터 내보내기 완료');
            return true;
        } catch (error) {
            console.error('❌ 배송 데이터 내보내기 실패:', error);
            return false;
        }
    }

    // CSV 변환
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // 헤더 추가
        csvRows.push(headers.join(','));
        
        // 데이터 추가
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // 쉼표나 따옴표가 포함된 경우 따옴표로 감싸기
                return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    // CSV 파일 다운로드
    downloadCSV(content, filename) {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}