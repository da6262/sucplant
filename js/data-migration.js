// 데이터 마이그레이션 유틸리티
// 컴퓨터 LocalStorage → 웹사이트 서버 API 업로드

class DataMigration {
    constructor() {
        this.apiBase = '';
        this.migrationStatus = {
            customers: { total: 0, success: 0, failed: 0 },
            orders: { total: 0, success: 0, failed: 0 },
            products: { total: 0, success: 0, failed: 0 },
            waitlist: { total: 0, success: 0, failed: 0 },
            categories: { total: 0, success: 0, failed: 0 },
            order_sources: { total: 0, success: 0, failed: 0 }
        };
    }

    // 1. LocalStorage에서 모든 데이터 추출
    extractLocalData() {
        console.log('🔍 LocalStorage 데이터 추출 시작...');
        
        const localData = {
            customers: this.getLocalStorageData('customers'),
            orders: this.getLocalStorageData('orders'), 
            products: this.getLocalStorageData('products'),
            waitlist: this.getLocalStorageData('waitlist'),
            categories: this.getLocalStorageData('categories'),
            order_sources: this.getLocalStorageData('order_sources')
        };

        // 데이터 카운트 출력
        Object.keys(localData).forEach(key => {
            const count = localData[key]?.length || 0;
            console.log(`📊 ${key}: ${count}개`);
            this.migrationStatus[key].total = count;
        });

        return localData;
    }

    // LocalStorage에서 특정 키 데이터 가져오기
    getLocalStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error(`❌ ${key} 데이터 파싱 오류:`, error);
        }
        return [];
    }

    // 2. 서버로 데이터 업로드
    async migrateToServer(localData) {
        console.log('🚀 서버 업로드 시작...');
        
        try {
            // 기본 데이터부터 업로드 (카테고리, 주문출처)
            await this.uploadCategories(localData.categories);
            await this.uploadOrderSources(localData.order_sources);
            
            // 메인 데이터 업로드
            await this.uploadProducts(localData.products);
            await this.uploadCustomers(localData.customers);
            await this.uploadOrders(localData.orders);
            await this.uploadWaitlist(localData.waitlist);
            
            console.log('✅ 모든 데이터 업로드 완료!');
            this.printMigrationSummary();
            
        } catch (error) {
            console.error('❌ 마이그레이션 중 오류:', error);
            throw error;
        }
    }

    // 카테고리 업로드
    async uploadCategories(categories) {
        if (!categories || categories.length === 0) {
            console.log('⚠️ 업로드할 카테고리가 없습니다');
            return;
        }

        console.log(`📂 카테고리 업로드 시작: ${categories.length}개`);
        
        for (const category of categories) {
            try {
                const response = await fetch('tables/farm_categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: category.name,
                        color: category.color || '#22c55e',
                        description: category.description || ''
                    })
                });

                if (response.ok) {
                    this.migrationStatus.categories.success++;
                    console.log(`✅ 카테고리 업로드 성공: ${category.name}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.categories.failed++;
                console.error(`❌ 카테고리 업로드 실패: ${category.name}`, error);
            }
        }
    }

    // 주문 출처 업로드
    async uploadOrderSources(sources) {
        if (!sources || sources.length === 0) {
            console.log('⚠️ 업로드할 주문 출처가 없습니다');
            return;
        }

        console.log(`📋 주문 출처 업로드 시작: ${sources.length}개`);
        
        for (const source of sources) {
            try {
                const response = await fetch('tables/order_sources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: source.name,
                        description: source.description || ''
                    })
                });

                if (response.ok) {
                    this.migrationStatus.order_sources.success++;
                    console.log(`✅ 주문 출처 업로드 성공: ${source.name}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.order_sources.failed++;
                console.error(`❌ 주문 출처 업로드 실패: ${source.name}`, error);
            }
        }
    }

    // 상품 업로드
    async uploadProducts(products) {
        if (!products || products.length === 0) {
            console.log('⚠️ 업로드할 상품이 없습니다');
            return;
        }

        console.log(`🌱 상품 업로드 시작: ${products.length}개`);
        
        for (const product of products) {
            try {
                const response = await fetch('tables/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: product.name,
                        price: product.price || 0,
                        description: product.description || '',
                        category: product.category || '일반종',
                        stock: product.stock || 0,
                        image_url: product.image_url || '',
                        shipping_option: product.shipping_option || 'normal'
                    })
                });

                if (response.ok) {
                    this.migrationStatus.products.success++;
                    console.log(`✅ 상품 업로드 성공: ${product.name}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.products.failed++;
                console.error(`❌ 상품 업로드 실패: ${product.name}`, error);
            }
        }
    }

    // 고객 업로드
    async uploadCustomers(customers) {
        if (!customers || customers.length === 0) {
            console.log('⚠️ 업로드할 고객이 없습니다');
            return;
        }

        console.log(`👥 고객 업로드 시작: ${customers.length}개`);
        
        for (const customer of customers) {
            try {
                const response = await fetch('tables/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: customer.name,
                        phone: customer.phone,
                        address: customer.address || '',
                        email: customer.email || '',
                        grade: customer.grade || 'GENERAL',
                        registration_date: customer.registration_date || customer.created_at || new Date().toISOString().split('T')[0],
                        memo: customer.memo || ''
                    })
                });

                if (response.ok) {
                    this.migrationStatus.customers.success++;
                    console.log(`✅ 고객 업로드 성공: ${customer.name}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.customers.failed++;
                console.error(`❌ 고객 업로드 실패: ${customer.name}`, error);
            }
        }
    }

    // 주문 업로드
    async uploadOrders(orders) {
        if (!orders || orders.length === 0) {
            console.log('⚠️ 업로드할 주문이 없습니다');
            return;
        }

        console.log(`📦 주문 업로드 시작: ${orders.length}개`);
        
        for (const order of orders) {
            try {
                // order_items 처리 (문자열이면 파싱, 배열이면 그대로)
                let orderItems = order.order_items;
                if (typeof orderItems === 'string') {
                    try {
                        orderItems = JSON.parse(orderItems);
                    } catch {
                        orderItems = [];
                    }
                }
                if (!Array.isArray(orderItems)) {
                    orderItems = [];
                }

                const response = await fetch('tables/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_number: order.order_number,
                        order_date: order.order_date || new Date().toISOString(),
                        customer_name: order.customer_name,
                        customer_phone: order.customer_phone,
                        customer_address: order.customer_address || '',
                        order_items: orderItems,
                        total_amount: order.total_amount || 0,
                        order_status: order.order_status || '주문접수',
                        tracking_number: order.tracking_number || '',
                        memo: order.memo || '',
                        shipping_fee: order.shipping_fee || 0,
                        discount_amount: order.discount_amount || 0,
                        order_source: order.order_source || ''
                    })
                });

                if (response.ok) {
                    this.migrationStatus.orders.success++;
                    console.log(`✅ 주문 업로드 성공: ${order.order_number}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.orders.failed++;
                console.error(`❌ 주문 업로드 실패: ${order.order_number}`, error);
            }
        }
    }

    // 대기자 업로드
    async uploadWaitlist(waitlist) {
        if (!waitlist || waitlist.length === 0) {
            console.log('⚠️ 업로드할 대기자가 없습니다');
            return;
        }

        console.log(`⏰ 대기자 업로드 시작: ${waitlist.length}개`);
        
        for (const wait of waitlist) {
            try {
                const response = await fetch('tables/waitlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_name: wait.customer_name,
                        customer_phone: wait.customer_phone,
                        product_name: wait.product_name,
                        product_category: wait.product_category || '일반종',
                        expected_price: wait.expected_price || 0,
                        register_date: wait.register_date || new Date().toISOString(),
                        status: wait.status || '대기중',
                        memo: wait.memo || '',
                        priority: wait.priority || 3,
                        last_contact: wait.last_contact || null
                    })
                });

                if (response.ok) {
                    this.migrationStatus.waitlist.success++;
                    console.log(`✅ 대기자 업로드 성공: ${wait.customer_name}`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                this.migrationStatus.waitlist.failed++;
                console.error(`❌ 대기자 업로드 실패: ${wait.customer_name}`, error);
            }
        }
    }

    // 마이그레이션 결과 요약 출력
    printMigrationSummary() {
        console.log('\n🎉 === 데이터 마이그레이션 완료 요약 ===');
        
        let totalSuccess = 0;
        let totalFailed = 0;
        
        Object.keys(this.migrationStatus).forEach(key => {
            const stat = this.migrationStatus[key];
            if (stat.total > 0) {
                console.log(`📊 ${key}: ${stat.success}/${stat.total} 성공 (실패: ${stat.failed})`);
                totalSuccess += stat.success;
                totalFailed += stat.failed;
            }
        });
        
        console.log(`\n✅ 전체 성공: ${totalSuccess}개`);
        console.log(`❌ 전체 실패: ${totalFailed}개`);
        console.log(`📈 성공률: ${totalSuccess > 0 ? Math.round(totalSuccess / (totalSuccess + totalFailed) * 100) : 0}%`);
        
        if (totalFailed === 0) {
            console.log('\n🎊 모든 데이터가 성공적으로 마이그레이션되었습니다!');
        } else {
            console.log('\n⚠️ 일부 데이터 업로드가 실패했습니다. 수동으로 재시도하세요.');
        }
    }

    // 전체 마이그레이션 실행
    async migrate() {
        try {
            console.log('🚀 === 데이터 마이그레이션 시작 ===');
            console.log('⏰ 예상 소요 시간: 10-15분');
            
            // 1단계: LocalStorage 데이터 추출
            const localData = this.extractLocalData();
            
            // 2단계: 서버로 업로드
            await this.migrateToServer(localData);
            
            console.log('🎉 마이그레이션 완료! 이제 모든 기기에서 동일한 데이터를 볼 수 있습니다.');
            
            return true;
        } catch (error) {
            console.error('💥 마이그레이션 중 치명적 오류:', error);
            return false;
        }
    }
}

// 전역에서 사용할 수 있도록 윈도우 객체에 추가
window.dataMigration = new DataMigration();

// 사용법을 콘솔에 출력
console.log("🔧 === 데이터 마이그레이션 사용법 ===");
console.log("");
console.log("1. 현재 컴퓨터 브라우저에서 다음 명령어를 실행하세요:");
console.log("   dataMigration.migrate()");
console.log("");
console.log("2. 마이그레이션이 완료되면 핸드폰에서 새로고침하세요!");
console.log("");
console.log("💡 문제가 있다면 다음 명령어로 데이터 확인:");
console.log("   dataMigration.extractLocalData()");