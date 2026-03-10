// 고객 알림 시스템
// 배송 상태 변경 시 자동 알림 발송

export class NotificationSystem {
    constructor() {
        this.notificationTemplates = {
            orderReceived: {
                title: '주문 접수 완료',
                message: '[{customer_name}님] 주문이 접수되었습니다. 주문번호: {order_number}'
            },
            paymentConfirmed: {
                title: '결제 확인',
                message: '[{customer_name}님] 결제가 확인되었습니다. 상품 준비를 시작합니다.'
            },
            shippingStarted: {
                title: '배송 시작',
                message: '[{customer_name}님] 주문하신 상품이 배송을 시작했습니다. 송장번호: {tracking_number}'
            },
            shippingDelayed: {
                title: '배송 지연 안내',
                message: '[{customer_name}님] 죄송합니다. 배송이 지연되고 있습니다. 사유: {delay_reason}'
            },
            shippingCompleted: {
                title: '배송 완료',
                message: '[{customer_name}님] 주문하신 상품이 배송 완료되었습니다. 송장번호: {tracking_number}'
            },
            orderCancelled: {
                title: '주문 취소',
                message: '[{customer_name}님] 주문이 취소되었습니다. 환불 처리를 진행합니다.'
            }
        };
        
        this.notificationSettings = {
            smsEnabled: true,
            emailEnabled: false,
            pushEnabled: false,
            autoNotification: true
        };
    }

    // 알림 템플릿 가져오기
    getNotificationTemplate(type) {
        return this.notificationTemplates[type] || null;
    }

    // 메시지 템플릿 처리
    processMessageTemplate(template, data) {
        try {
            let message = template.message;
            
            // 데이터 치환
            Object.keys(data).forEach(key => {
                const placeholder = `{${key}}`;
                message = message.replace(new RegExp(placeholder, 'g'), data[key] || '');
            });
            
            return message;
        } catch (error) {
            console.error('❌ 메시지 템플릿 처리 실패:', error);
            return template.message;
        }
    }

    // SMS 알림 발송
    async sendSMSNotification(phoneNumber, message) {
        try {
            console.log(`📱 SMS 알림 발송: ${phoneNumber}`);
            
            if (!this.notificationSettings.smsEnabled) {
                console.log('⚠️ SMS 알림이 비활성화되어 있습니다');
                return false;
            }

            // 실제 SMS 발송 (SolAPI 연동)
            if (window.sendSMS) {
                const result = await window.sendSMS(phoneNumber, message);
                console.log('✅ SMS 알림 발송 완료');
                return result;
            } else {
                console.warn('⚠️ SMS 발송 함수를 찾을 수 없습니다');
                return false;
            }

        } catch (error) {
            console.error('❌ SMS 알림 발송 실패:', error);
            return false;
        }
    }

    // 이메일 알림 발송
    async sendEmailNotification(email, subject, message) {
        try {
            console.log(`📧 이메일 알림 발송: ${email}`);
            
            if (!this.notificationSettings.emailEnabled) {
                console.log('⚠️ 이메일 알림이 비활성화되어 있습니다');
                return false;
            }

            // 이메일 발송 로직 (실제 구현 시 이메일 서비스 연동)
            console.log('📧 이메일 발송:', { email, subject, message });
            return true;

        } catch (error) {
            console.error('❌ 이메일 알림 발송 실패:', error);
            return false;
        }
    }

    // 푸시 알림 발송
    async sendPushNotification(userId, title, message) {
        try {
            console.log(`🔔 푸시 알림 발송: ${userId}`);
            
            if (!this.notificationSettings.pushEnabled) {
                console.log('⚠️ 푸시 알림이 비활성화되어 있습니다');
                return false;
            }

            // 푸시 알림 발송 로직 (실제 구현 시 FCM 등 연동)
            console.log('🔔 푸시 알림 발송:', { userId, title, message });
            return true;

        } catch (error) {
            console.error('❌ 푸시 알림 발송 실패:', error);
            return false;
        }
    }

    // 주문 상태 변경 알림
    async sendOrderStatusNotification(orderId, newStatus, additionalData = {}) {
        try {
            console.log(`📢 주문 상태 변경 알림: ${orderId} -> ${newStatus}`);
            
            if (!window.orderDataManager) {
                throw new Error('orderDataManager를 찾을 수 없습니다');
            }

            const order = window.orderDataManager.getOrderById(orderId);
            if (!order) {
                throw new Error('주문 정보를 찾을 수 없습니다');
            }

            // 알림 템플릿 선택
            let templateType = null;
            switch (newStatus) {
                case '주문접수':
                    templateType = 'orderReceived';
                    break;
                case '입금확인':
                    templateType = 'paymentConfirmed';
                    break;
                case '배송중':
                    templateType = 'shippingStarted';
                    break;
                case '배송지연':
                    templateType = 'shippingDelayed';
                    break;
                case '배송완료':
                    templateType = 'shippingCompleted';
                    break;
                case '주문취소':
                    templateType = 'orderCancelled';
                    break;
            }

            if (!templateType) {
                console.log('⚠️ 알림 템플릿이 없습니다:', newStatus);
                return false;
            }

            const template = this.getNotificationTemplate(templateType);
            if (!template) {
                console.log('⚠️ 알림 템플릿을 찾을 수 없습니다:', templateType);
                return false;
            }

            // 알림 데이터 준비
            const notificationData = {
                customer_name: order.customer_name,
                order_number: order.order_number || order.id,
                tracking_number: order.tracking_number || '',
                delay_reason: additionalData.delay_reason || '배송 지연'
            };

            // 메시지 생성
            const message = this.processMessageTemplate(template, notificationData);

            // 알림 발송
            const results = [];
            
            // SMS 발송
            if (order.customer_phone) {
                const smsResult = await this.sendSMSNotification(order.customer_phone, message);
                results.push({ type: 'SMS', success: smsResult });
            }

            // 이메일 발송 (이메일 주소가 있는 경우)
            if (order.customer_email) {
                const emailResult = await this.sendEmailNotification(
                    order.customer_email, 
                    template.title, 
                    message
                );
                results.push({ type: 'Email', success: emailResult });
            }

            // 푸시 알림 (사용자 ID가 있는 경우)
            if (order.customer_id) {
                const pushResult = await this.sendPushNotification(
                    order.customer_id, 
                    template.title, 
                    message
                );
                results.push({ type: 'Push', success: pushResult });
            }

            console.log('✅ 주문 상태 변경 알림 발송 완료:', results);
            return results;

        } catch (error) {
            console.error('❌ 주문 상태 변경 알림 발송 실패:', error);
            return false;
        }
    }

    // 배송 지연 알림
    async sendDelayNotification(orderId, delayReason) {
        try {
            console.log(`⚠️ 배송 지연 알림: ${orderId}`);
            
            const result = await this.sendOrderStatusNotification(orderId, '배송지연', {
                delay_reason: delayReason
            });

            return result;

        } catch (error) {
            console.error('❌ 배송 지연 알림 발송 실패:', error);
            return false;
        }
    }

    // 배송 완료 알림
    async sendDeliveryCompletedNotification(orderId) {
        try {
            console.log(`✅ 배송 완료 알림: ${orderId}`);
            
            const result = await this.sendOrderStatusNotification(orderId, '배송완료');
            return result;

        } catch (error) {
            console.error('❌ 배송 완료 알림 발송 실패:', error);
            return false;
        }
    }

    // 일괄 알림 발송
    async sendBulkNotifications(orders, notificationType) {
        try {
            console.log(`📢 일괄 알림 발송: ${orders.length}개`);
            
            const results = [];
            
            for (const order of orders) {
                const result = await this.sendOrderStatusNotification(order.id, notificationType);
                results.push({ orderId: order.id, result });
                
                // 알림 간격 조절 (API 제한 방지)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('✅ 일괄 알림 발송 완료');
            return results;

        } catch (error) {
            console.error('❌ 일괄 알림 발송 실패:', error);
            return false;
        }
    }

    // 알림 설정 업데이트
    updateNotificationSettings(settings) {
        this.notificationSettings = { ...this.notificationSettings, ...settings };
        console.log('✅ 알림 설정 업데이트 완료');
    }

    // 알림 템플릿 업데이트
    updateNotificationTemplate(type, template) {
        this.notificationTemplates[type] = template;
        console.log(`✅ 알림 템플릿 업데이트 완료: ${type}`);
    }

    // 알림 발송 이력 조회
    async getNotificationHistory(orderId) {
        try {
            console.log(`📋 알림 발송 이력 조회: ${orderId}`);
            
            // 실제 구현 시 데이터베이스에서 이력 조회
            const history = [
                {
                    id: 1,
                    orderId,
                    type: 'SMS',
                    message: '주문이 접수되었습니다.',
                    sentAt: new Date().toISOString(),
                    status: 'success'
                }
            ];

            return history;

        } catch (error) {
            console.error('❌ 알림 발송 이력 조회 실패:', error);
            return [];
        }
    }

    // 알림 통계 조회
    async getNotificationStats(startDate, endDate) {
        try {
            console.log('📊 알림 통계 조회');
            
            // 실제 구현 시 데이터베이스에서 통계 조회
            const stats = {
                totalSent: 0,
                smsSent: 0,
                emailSent: 0,
                pushSent: 0,
                successRate: 0,
                failureRate: 0
            };

            return stats;

        } catch (error) {
            console.error('❌ 알림 통계 조회 실패:', error);
            return null;
        }
    }
}

// 전역 인스턴스 생성
export const notificationSystem = new NotificationSystem();
window.notificationSystem = notificationSystem;

