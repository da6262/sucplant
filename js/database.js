// 브라우저 환경용 데이터베이스 관리 모듈
// Supabase를 사용한 클라우드 데이터베이스 연결

// NOTE:
// 이 파일은 (module이 아닌) 일반 스크립트로 로드될 수 있어 전역 스코프에서
// `const/let supabase` 같은 식별자를 선언하면 다른 스크립트와 충돌하여
// `Identifier 'supabase' has already been declared` SyntaxError가 발생할 수 있습니다.
//
// 따라서 여기서는 `supabase` 식별자를 선언/재선언하지 않고,
// 이미 초기화된 전역 클라이언트를 가져와서 사용합니다.

class FarmDatabase {
    constructor() {
        this.initialized = false;
        this.init();
    }

    // Supabase 초기화
    async init() {
        try {
            // 이미 초기화된 전역 클라이언트가 있는지 확인
            if (this.getGlobalClient()) {
                this.initialized = true;
                console.log('✅ Supabase 클라이언트 연결 성공');
                return;
            }

            // Supabase가 로드되지 않았다면 잠시 후 다시 시도
            setTimeout(() => {
                if (this.getGlobalClient()) {
                    this.initialized = true;
                    console.log('✅ Supabase 클라이언트 연결 성공 (지연 로드)');
                } else {
                    console.warn('⚠️ Supabase 클라이언트를 찾을 수 없습니다');
                }
            }, 1000);

        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
        }
    }

    // 전역 Supabase 클라이언트 가져오기
    getGlobalClient() {
        // 선호: window.supabaseClient (프로젝트 전반의 표준)
        if (window.supabaseClient) return window.supabaseClient;
        // 폴백: window.supabase가 이미 client 형태(from 메서드 보유)인 경우
        if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
        return null;
    }

    // Supabase 연결 확인
    ensureConnection() {
        const client = this.getGlobalClient();
        if (!client) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
        }
        return client;
    }

    // 고객 관련 메서드들
    async createCustomer(customerData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_customers')
            .insert([customerData])
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async getCustomers() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_customers')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    async getCustomerById(id) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_customers')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateCustomer(id, customerData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_customers')
            .update({ ...customerData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async deleteCustomer(id) {
        const client = this.ensureConnection();
        const { error } = await client
            .from('farm_customers')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    // 주문 관련 메서드들
    async createOrder(orderData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async getOrders() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_orders')
            .select('*')
            .order('order_date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    async getOrderById(id) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_orders')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateOrder(id, orderData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_orders')
            .update({ ...orderData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async deleteOrder(id) {
        const client = this.ensureConnection();
        const { error } = await client
            .from('farm_orders')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    // 상품 관련 메서드들
    async createProduct(productData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_products')
            .insert([productData])
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async getProducts() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data || [];
    }

    async getProductById(id) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateProduct(id, productData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_products')
            .update({ ...productData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async deleteProduct(id) {
        const client = this.ensureConnection();
        const { error } = await client
            .from('farm_products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    // 대기자 관련 메서드들
    async createWaitlistEntry(waitlistData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_waitlist')
            .insert([waitlistData])
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async getWaitlist() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_waitlist')
            .select('*')
            .order('priority', { ascending: false })
            .order('register_date', { ascending: true });
        
        if (error) throw error;
        return data || [];
    }

    async updateWaitlistEntry(id, waitlistData) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_waitlist')
            .update({ ...waitlistData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    }

    async deleteWaitlistEntry(id) {
        const client = this.ensureConnection();
        const { error } = await client
            .from('farm_waitlist')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    // 통계 쿼리들
    async getOrderStats() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_orders')
            .select('order_status, total_amount');
        
        if (error) throw error;
        
        // 클라이언트에서 그룹화
        const stats = {};
        data.forEach(order => {
            if (!stats[order.order_status]) {
                stats[order.order_status] = { count: 0, total_amount: 0 };
            }
            stats[order.order_status].count++;
            stats[order.order_status].total_amount += order.total_amount || 0;
        });
        
        return Object.entries(stats).map(([status, data]) => ({
            order_status: status,
            count: data.count,
            total_amount: data.total_amount
        }));
    }

    async getCustomerStats() {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_customers')
            .select('grade');
        
        if (error) throw error;
        
        // 클라이언트에서 그룹화
        const stats = {};
        data.forEach(customer => {
            const grade = customer.grade || 'GENERAL';
            stats[grade] = (stats[grade] || 0) + 1;
        });
        
        return Object.entries(stats).map(([grade, count]) => ({
            grade,
            count
        }));
    }

    async getTopProducts(limit = 10) {
        const client = this.ensureConnection();
        const { data, error } = await client
            .from('farm_order_items')
            .select('product_name, quantity');
        if (error) throw error;
        const productSales = {};
        (data || []).forEach(item => {
            const name = item.product_name || '상품';
            productSales[name] = (productSales[name] || 0) + (item.quantity || 0);
        });
        return Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([name, quantity]) => ({ name, quantity }));
    }

    // 데이터베이스 백업 (Supabase에서는 자동 백업)
    async backup(backupPath) {
        console.log('✅ Supabase는 자동 백업을 제공합니다');
        return true;
    }

    // 데이터베이스 복원 (Supabase에서는 관리자 패널에서 처리)
    async restore(backupPath) {
        console.log('⚠️ Supabase 데이터 복원은 관리자 패널에서 처리하세요');
        return true;
    }

    // 데이터베이스 닫기 (Supabase는 자동 관리)
    close() {
        console.log('✅ Supabase 연결은 자동으로 관리됩니다');
        return Promise.resolve();
    }
}

// 전역으로 내보내기
window.FarmDatabase = FarmDatabase;