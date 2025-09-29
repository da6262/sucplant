// SQLite 데이터베이스 관리 모듈
// Electron 환경에서 로컬 SQLite 데이터베이스 사용

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

class FarmDatabase {
    constructor() {
        this.db = null;
        this.dbPath = path.join(app.getPath('userData'), 'farm_management.db');
        this.init();
    }

    // 데이터베이스 초기화
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 실패:', err);
                    reject(err);
                } else {
                    console.log('✅ SQLite 데이터베이스 연결 성공:', this.dbPath);
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // 테이블 생성
    async createTables() {
        const tables = [
            // 고객 테이블
            `CREATE TABLE IF NOT EXISTS farm_customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                address TEXT,
                email TEXT,
                grade TEXT DEFAULT 'GENERAL',
                registration_date TEXT,
                memo TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 주문 테이블
            `CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                order_number TEXT UNIQUE NOT NULL,
                order_date DATETIME,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                customer_address TEXT,
                order_items TEXT, -- JSON 형태로 저장
                total_amount REAL,
                order_status TEXT DEFAULT '주문접수',
                tracking_number TEXT,
                memo TEXT,
                shipping_fee REAL DEFAULT 0,
                discount_amount REAL DEFAULT 0,
                order_source TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 상품 테이블
            `CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                category TEXT,
                stock INTEGER DEFAULT 0,
                image_url TEXT,
                shipping_option TEXT DEFAULT 'normal',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 카테고리 테이블
            `CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                color TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 주문 출처 테이블
            `CREATE TABLE IF NOT EXISTS order_sources (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 대기자 테이블
            `CREATE TABLE IF NOT EXISTS waitlist (
                id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                product_name TEXT NOT NULL,
                product_category TEXT,
                expected_price REAL,
                register_date DATETIME,
                status TEXT DEFAULT '대기중',
                memo TEXT,
                priority INTEGER DEFAULT 3,
                last_contact DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const tableSQL of tables) {
            await this.runQuery(tableSQL);
        }

        // 인덱스 생성
        await this.createIndexes();
        
        // 초기 데이터 삽입
        await this.insertInitialData();
        
        console.log('✅ 모든 테이블 생성 완료');
    }

    // 인덱스 생성
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_farm_customers_phone ON farm_customers(phone)',
            'CREATE INDEX IF NOT EXISTS idx_farm_customers_grade ON farm_customers(grade)',
            'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)',
            'CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)',
            'CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_phone)',
            'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
            'CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status)',
            'CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist(priority)'
        ];

        for (const indexSQL of indexes) {
            await this.runQuery(indexSQL);
        }
    }

    // 초기 데이터 삽입
    async insertInitialData() {
        // 카테고리 초기 데이터
        const categories = [
            { id: 'rare', name: '희귀종', color: '#ef4444', description: 'White Platter 등 희귀 다육식물' },
            { id: 'common', name: '일반종', color: '#22c55e', description: '일반적인 다육식물 품종' },
            { id: 'seedling', name: '새싹', color: '#3b82f6', description: '어린 다육식물 및 삽목' }
        ];

        for (const category of categories) {
            await this.insertIfNotExists('categories', category);
        }

        // 주문 출처 초기 데이터
        const orderSources = [
            { id: 'youtube', name: '유튜브', description: '경산다육TV 채널' },
            { id: 'band', name: '밴드', description: '네이버 밴드 커뮤니티' },
            { id: 'naver', name: '네이버', description: '네이버 쇼핑/블로그' },
            { id: 'phone', name: '전화', description: '전화 주문' },
            { id: 'sms', name: '문자', description: 'SMS 문자 주문' },
            { id: 'sns', name: 'SNS', description: '인스타그램/페이스북' },
            { id: 'visit', name: '방문', description: '농장 직접 방문' }
        ];

        for (const source of orderSources) {
            await this.insertIfNotExists('order_sources', source);
        }
    }

    // 쿼리 실행 (Promise 래퍼)
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('SQL 실행 오류:', err, sql);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // 데이터 조회
    getAll(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('데이터 조회 오류:', err, sql);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 단일 데이터 조회
    getOne(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('데이터 조회 오류:', err, sql);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 존재하지 않을 때만 삽입
    async insertIfNotExists(tableName, data) {
        const existing = await this.getOne(`SELECT id FROM ${tableName} WHERE id = ?`, [data.id]);
        if (!existing) {
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);
            
            await this.runQuery(
                `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
                values
            );
        }
    }

    // CRUD 메서드들

    // 고객 관련
    async createCustomer(customerData) {
        const columns = Object.keys(customerData).join(', ');
        const placeholders = Object.keys(customerData).map(() => '?').join(', ');
        const values = Object.values(customerData);
        
        return await this.runQuery(
            `INSERT INTO farm_customers (${columns}) VALUES (${placeholders})`,
            values
        );
    }

    async getCustomers() {
        return await this.getAll('SELECT * FROM farm_customers ORDER BY created_at DESC');
    }

    async getCustomerById(id) {
        return await this.getOne('SELECT * FROM farm_customers WHERE id = ?', [id]);
    }

    async updateCustomer(id, customerData) {
        const setClause = Object.keys(customerData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(customerData), id];
        
        return await this.runQuery(
            `UPDATE farm_customers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    async deleteCustomer(id) {
        return await this.runQuery('DELETE FROM farm_customers WHERE id = ?', [id]);
    }

    // 주문 관련
    async createOrder(orderData) {
        const columns = Object.keys(orderData).join(', ');
        const placeholders = Object.keys(orderData).map(() => '?').join(', ');
        const values = Object.values(orderData);
        
        return await this.runQuery(
            `INSERT INTO farm_orders (${columns}) VALUES (${placeholders})`,
            values
        );
    }

    async getOrders() {
        return await this.getAll('SELECT * FROM farm_orders ORDER BY order_date DESC');
    }

    async getOrderById(id) {
        return await this.getOne('SELECT * FROM farm_orders WHERE id = ?', [id]);
    }

    async updateOrder(id, orderData) {
        const setClause = Object.keys(orderData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(orderData), id];
        
        return await this.runQuery(
            `UPDATE farm_orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    async deleteOrder(id) {
        return await this.runQuery('DELETE FROM farm_orders WHERE id = ?', [id]);
    }

    // 상품 관련
    async createProduct(productData) {
        const columns = Object.keys(productData).join(', ');
        const placeholders = Object.keys(productData).map(() => '?').join(', ');
        const values = Object.values(productData);
        
        return await this.runQuery(
            `INSERT INTO products (${columns}) VALUES (${placeholders})`,
            values
        );
    }

    async getProducts() {
        return await this.getAll('SELECT * FROM products ORDER BY name');
    }

    async getProductById(id) {
        return await this.getOne('SELECT * FROM products WHERE id = ?', [id]);
    }

    async updateProduct(id, productData) {
        const setClause = Object.keys(productData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(productData), id];
        
        return await this.runQuery(
            `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    async deleteProduct(id) {
        return await this.runQuery('DELETE FROM products WHERE id = ?', [id]);
    }

    // 대기자 관련
    async createWaitlistEntry(waitlistData) {
        const columns = Object.keys(waitlistData).join(', ');
        const placeholders = Object.keys(waitlistData).map(() => '?').join(', ');
        const values = Object.values(waitlistData);
        
        return await this.runQuery(
            `INSERT INTO waitlist (${columns}) VALUES (${placeholders})`,
            values
        );
    }

    async getWaitlist() {
        return await this.getAll('SELECT * FROM waitlist ORDER BY priority DESC, register_date ASC');
    }

    async updateWaitlistEntry(id, waitlistData) {
        const setClause = Object.keys(waitlistData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(waitlistData), id];
        
        return await this.runQuery(
            `UPDATE waitlist SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    async deleteWaitlistEntry(id) {
        return await this.runQuery('DELETE FROM waitlist WHERE id = ?', [id]);
    }

    // 통계 쿼리들
    async getOrderStats() {
        const stats = await this.getAll(`
            SELECT 
                order_status,
                COUNT(*) as count,
                SUM(total_amount) as total_amount
            FROM farm_orders 
            GROUP BY order_status
        `);
        
        return stats;
    }

    async getCustomerStats() {
        const stats = await this.getAll(`
            SELECT 
                grade,
                COUNT(*) as count
            FROM farm_customers 
            GROUP BY grade
        `);
        
        return stats;
    }

    async getTopProducts(limit = 10) {
        // 주문 아이템에서 상품별 판매량 계산 (JSON 파싱 필요)
        const orders = await this.getAll('SELECT order_items FROM farm_orders');
        const productSales = {};
        
        orders.forEach(order => {
            try {
                const items = JSON.parse(order.order_items || '[]');
                items.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
                });
            } catch (error) {
                // JSON 파싱 실패 시 무시
            }
        });
        
        return Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([name, quantity]) => ({ name, quantity }));
    }

    // 데이터베이스 백업
    async backup(backupPath) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            const source = fs.createReadStream(this.dbPath);
            const destination = fs.createWriteStream(backupPath);
            
            source.pipe(destination);
            
            destination.on('close', () => {
                console.log('✅ 데이터베이스 백업 완료:', backupPath);
                resolve(backupPath);
            });
            
            destination.on('error', (err) => {
                console.error('❌ 데이터베이스 백업 실패:', err);
                reject(err);
            });
        });
    }

    // 데이터베이스 복원
    async restore(backupPath) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            
            // 현재 데이터베이스 닫기
            this.db.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // 백업 파일로 교체
                const source = fs.createReadStream(backupPath);
                const destination = fs.createWriteStream(this.dbPath);
                
                source.pipe(destination);
                
                destination.on('close', async () => {
                    try {
                        // 데이터베이스 다시 연결
                        await this.init();
                        console.log('✅ 데이터베이스 복원 완료');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
                
                destination.on('error', (err) => {
                    console.error('❌ 데이터베이스 복원 실패:', err);
                    reject(err);
                });
            });
        });
    }

    // 데이터베이스 닫기
    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('데이터베이스 닫기 오류:', err);
                    } else {
                        console.log('✅ 데이터베이스 연결 종료');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = FarmDatabase;