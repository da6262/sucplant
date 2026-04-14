// 배송 라벨 자동 생성 및 인쇄
// 주문 정보를 바탕으로 배송 라벨 생성

export class LabelGenerator {
    constructor() {
        this.labelTemplate = null;
        this.printSettings = {
            paperSize: 'A4',
            orientation: 'portrait',
            margins: { top: 10, right: 10, bottom: 10, left: 10 }
        };
    }

    // 배송 라벨 생성
    generateShippingLabel(orderData) {
        try {
            console.log(`🏷️ 배송 라벨 생성: ${orderData.id}`);
            
            const labelHTML = this.createLabelHTML(orderData);
            return labelHTML;

        } catch (error) {
            console.error('❌ 배송 라벨 생성 실패:', error);
            throw error;
        }
    }

    // 라벨 HTML 생성
    createLabelHTML(orderData) {
        const labelHTML = `
            <div class="shipping-label" style="
                width: 100mm;
                height: 150mm;
                border: 2px solid #000;
                padding: 5mm;
                font-family: Arial, sans-serif;
                font-size: 10px;
                background: white;
                page-break-after: always;
            ">
                <!-- 발송인 정보 -->
                <div class="sender-info" style="border-bottom: 1px solid #ccc; padding-bottom: 3mm; margin-bottom: 3mm;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2mm;">발송인</div>
                    <div>농장명: ${orderData.farm_name || '스마트팜'}</div>
                    <div>주소: ${orderData.farm_address || '농장 주소'}</div>
                    <div>연락처: ${orderData.farm_phone || '농장 전화번호'}</div>
                </div>

                <!-- 수취인 정보 -->
                <div class="receiver-info" style="border-bottom: 1px solid #ccc; padding-bottom: 3mm; margin-bottom: 3mm;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2mm;">수취인</div>
                    <div>이름: ${orderData.customer_name}</div>
                    <div>연락처: ${orderData.customer_phone}</div>
                    <div>주소: ${orderData.shipping_address}</div>
                </div>

                <!-- 주문 정보 -->
                <div class="order-info" style="border-bottom: 1px solid #ccc; padding-bottom: 3mm; margin-bottom: 3mm;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2mm;">주문 정보</div>
                    <div>주문번호: ${orderData.order_number || orderData.id}</div>
                    <div>주문일: ${new Date(orderData.order_date).toLocaleDateString('ko-KR')}</div>
                    <div>상품: ${orderData.items ? orderData.items.map(item => item.product_name).join(', ') : '상품명'}</div>
                </div>

                <!-- 송장 정보 -->
                <div class="tracking-info" style="border-bottom: 1px solid #ccc; padding-bottom: 3mm; margin-bottom: 3mm;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2mm;">송장 정보</div>
                    <div>송장번호: ${orderData.tracking_number || '미등록'}</div>
                    <div>택배사: ${orderData.carrier || 'CJ대한통운'}</div>
                </div>

                <!-- 특이사항 -->
                <div class="special-notes" style="margin-bottom: 3mm;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2mm;">특이사항</div>
                    <div>${orderData.special_notes || '신선한 농산물입니다. 신속한 배송 부탁드립니다.'}</div>
                </div>

                <!-- QR 코드 영역 -->
                <div class="qr-code" style="text-align: center; margin-top: 3mm;">
                    <div style="font-size: 8px; margin-bottom: 1mm;">배송 추적</div>
                    <div id="qr-${orderData.id}" style="width: 20mm; height: 20mm; margin: 0 auto; border: 1px solid #ccc;"></div>
                </div>
            </div>
        `;

        return labelHTML;
    }

    // QR 코드 생성
    async generateQRCode(orderId, trackingNumber) {
        try {
            console.log(`📱 QR 코드 생성: ${orderId}`);
            
            // QR 코드 생성 (QR.js 라이브러리 사용)
            const qrContainer = document.getElementById(`qr-${orderId}`);
            if (!qrContainer) return;

            // 배송 추적 링크 생성
            const trackingLink = window.trackingAPI ? 
                window.trackingAPI.generateTrackingLink(trackingNumber, 'cj') : 
                `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnb_param=1&wl_ref=${trackingNumber}`;

            // QR 코드 생성 (간단한 텍스트로 대체)
            qrContainer.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    text-align: center;
                ">
                    QR<br/>CODE
                </div>
            `;

            console.log('✅ QR 코드 생성 완료');
            return true;

        } catch (error) {
            console.error('❌ QR 코드 생성 실패:', error);
            return false;
        }
    }

    // 라벨 인쇄
    async printLabel(orderData) {
        try {
            console.log(`🖨️ 라벨 인쇄: ${orderData.id}`);
            
            // 라벨 HTML 생성
            const labelHTML = this.generateShippingLabel(orderData);
            
            // 인쇄용 창 열기
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>배송 라벨 - ${orderData.id}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            .shipping-label { 
                                width: 100mm !important;
                                height: 150mm !important;
                                margin: 0 !important;
                                page-break-after: always;
                            }
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                        }
                    </style>
                </head>
                <body>
                    ${labelHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // 인쇄 대화상자 표시
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

            console.log('✅ 라벨 인쇄 완료');
            return true;

        } catch (error) {
            console.error('❌ 라벨 인쇄 실패:', error);
            throw error;
        }
    }

    // 일괄 라벨 생성
    async generateBulkLabels(orders) {
        try {
            console.log(`🏷️ 일괄 라벨 생성: ${orders.length}개`);
            
            const labelsHTML = orders.map(order => this.generateShippingLabel(order)).join('');
            
            // 인쇄용 창 열기
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>배송 라벨 일괄 인쇄</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            .shipping-label { 
                                width: 100mm !important;
                                height: 150mm !important;
                                margin: 0 !important;
                                page-break-after: always;
                            }
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                        }
                    </style>
                </head>
                <body>
                    ${labelsHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // 인쇄 대화상자 표시
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

            console.log('✅ 일괄 라벨 생성 완료');
            return true;

        } catch (error) {
            console.error('❌ 일괄 라벨 생성 실패:', error);
            throw error;
        }
    }

    // 라벨 템플릿 설정
    setLabelTemplate(template) {
        this.labelTemplate = template;
        console.log('✅ 라벨 템플릿 설정 완료');
    }

    // 인쇄 설정
    setPrintSettings(settings) {
        this.printSettings = { ...this.printSettings, ...settings };
        console.log('✅ 인쇄 설정 업데이트 완료');
    }
}

// 전역 인스턴스 생성
export const labelGenerator = new LabelGenerator();
window.labelGenerator = labelGenerator;

