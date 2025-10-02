// 고객 데이터 관리 모듈
// features/customers/customerData.js

// LocalStorage 키 생성 함수
function getLocalStorageKey(key) {
    return `farm_management_${key}`;
}

class CustomerDataManager {
    constructor() {
        this.farm_customers = [];
        this.currentEditingCustomer = null;
        this.customerSortBy = 'newest'; // 기본값: 최근 등록순
    }

    // 고객 데이터 로드 (LocalStorage 전용)
    async loadCustomers() {
        try {
            console.log('👥 고객 데이터 로드 시작...');
            
            // LocalStorage에서 직접 로드 (키 통일: farm_customers)
            const data = localStorage.getItem('farm_customers');
            this.farm_customers = data ? JSON.parse(data) : [];
            
            console.log(`📦 LocalStorage에서 고객 ${this.farm_customers.length}개 로드됨`);
            return this.farm_customers;
            
        } catch (error) {
            console.error('❌ 고객 데이터 로드 실패:', error);
            this.farm_customers = [];
            return [];
        }
    }

    // 고객 데이터 저장 (LocalStorage 전용)
    async saveCustomers() {
        try {
            console.log('💾 고객 데이터 저장 시작...');
            
            // LocalStorage에 직접 저장 (키 통일: farm_customers)
            localStorage.setItem('farm_customers', JSON.stringify(this.farm_customers));
            console.log('✅ LocalStorage에 고객 데이터 저장 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 고객 데이터 저장 실패:', error);
            return false;
        }
    }

    // 새 고객 추가
    async addCustomer(customerData) {
        try {
            console.log('➕ 새 고객 추가:', customerData);
            
            // 고객 데이터 검증
            if (!customerData.name || !customerData.phone) {
                throw new Error('고객명과 전화번호는 필수입니다.');
            }
            
            // 전화번호 중복 확인
            const existingCustomer = this.farm_customers.find(c => c.phone === customerData.phone);
            if (existingCustomer) {
                throw new Error('이미 등록된 전화번호입니다.');
            }
            
            // 새 고객 객체 생성
            const newCustomer = {
                id: 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: customerData.name.trim(),
                phone: customerData.phone.trim(),
                address: customerData.address || '',
                email: customerData.email || '',
                grade: customerData.grade || 'GENERAL',
                registration_date: new Date().toISOString().split('T')[0],
                memo: customerData.memo || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 고객 목록에 추가
            this.farm_customers.push(newCustomer);
            
            // 데이터 저장
            await this.saveCustomers();
            
            console.log('✅ 새 고객 추가 완료:', newCustomer);
            return newCustomer;
            
        } catch (error) {
            console.error('❌ 고객 추가 실패:', error);
            throw error;
        }
    }

    // 고객 정보 수정
    async updateCustomer(customerId, updateData) {
        try {
            console.log('✏️ 고객 정보 수정:', customerId, updateData);
            
            const customerIndex = this.farm_customers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                throw new Error('고객을 찾을 수 없습니다.');
            }
            
            // 전화번호 중복 확인 (자신 제외)
            if (updateData.phone) {
                const existingCustomer = this.farm_customers.find(c => c.phone === updateData.phone && c.id !== customerId);
                if (existingCustomer) {
                    throw new Error('이미 등록된 전화번호입니다.');
                }
            }
            
            // 고객 정보 업데이트
            this.farm_customers[customerIndex] = {
                ...this.farm_customers[customerIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            // 데이터 저장
            await this.saveCustomers();
            
            console.log('✅ 고객 정보 수정 완료');
            return this.farm_customers[customerIndex];
            
        } catch (error) {
            console.error('❌ 고객 정보 수정 실패:', error);
            throw error;
        }
    }

    // 고객 삭제
    async deleteCustomer(customerId) {
        try {
            console.log('🗑️ 고객 삭제:', customerId);
            
            const customerIndex = this.farm_customers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                throw new Error('고객을 찾을 수 없습니다.');
            }
            
            // 고객 삭제
            const deletedCustomer = this.farm_customers.splice(customerIndex, 1)[0];
            
            // 데이터 저장
            await this.saveCustomers();
            
            console.log('✅ 고객 삭제 완료:', deletedCustomer);
            return deletedCustomer;
            
        } catch (error) {
            console.error('❌ 고객 삭제 실패:', error);
            throw error;
        }
    }

    // 고객 검색
    searchCustomers(query) {
        try {
            console.log('🔍 고객 검색:', query);
            
            if (!query || query.trim() === '') {
                return this.farm_customers;
            }
            
            const searchTerm = query.toLowerCase().trim();
            const filteredCustomers = this.farm_customers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                (customer.address && customer.address.toLowerCase().includes(searchTerm))
            );
            
            console.log(`🔍 검색 결과: ${filteredCustomers.length}개 고객`);
            return filteredCustomers;
            
        } catch (error) {
            console.error('❌ 고객 검색 실패:', error);
            return [];
        }
    }

    // 고객 정렬
    sortCustomers(sortBy = 'newest') {
        try {
            console.log('📊 고객 정렬:', sortBy);
            
            this.customerSortBy = sortBy;
            
            const sortedCustomers = [...this.farm_customers].sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.created_at) - new Date(a.created_at);
                    case 'oldest':
                        return new Date(a.created_at) - new Date(b.created_at);
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    case 'name_desc':
                        return b.name.localeCompare(a.name);
                    case 'phone_asc':
                        return a.phone.localeCompare(b.phone);
                    case 'phone_desc':
                        return b.phone.localeCompare(a.phone);
                    default:
                        return 0;
                }
            });
            
            console.log(`📊 정렬 완료: ${sortedCustomers.length}개 고객`);
            return sortedCustomers;
            
        } catch (error) {
            console.error('❌ 고객 정렬 실패:', error);
            return this.farm_customers;
        }
    }

    // 고객 통계
    getCustomerStats() {
        try {
            const totalCustomers = this.farm_customers.length;
            const newCustomers = this.farm_customers.filter(c => {
                const createdDate = new Date(c.created_at);
                const today = new Date();
                const diffTime = today - createdDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7; // 최근 7일
            }).length;
            
            const gradeStats = this.farm_customers.reduce((acc, customer) => {
                acc[customer.grade] = (acc[customer.grade] || 0) + 1;
                return acc;
            }, {});
            
            return {
                total: totalCustomers,
                new: newCustomers,
                byGrade: gradeStats
            };
            
        } catch (error) {
            console.error('❌ 고객 통계 생성 실패:', error);
            return { total: 0, new: 0, byGrade: {} };
        }
    }

    // 고객 ID로 조회
    getCustomerById(customerId) {
        return this.farm_customers.find(c => c.id === customerId);
    }

    // 고객 전화번호로 조회
    getCustomerByPhone(phone) {
        return this.farm_customers.find(c => c.phone === phone);
    }

    // 모든 고객 조회
    getAllCustomers() {
        return this.farm_customers;
    }

    // 고객 데이터 초기화
    async clearAllCustomers() {
        try {
            console.log('🗑️ 모든 고객 데이터 삭제...');
            this.farm_customers = [];
            await this.saveCustomers();
            console.log('✅ 모든 고객 데이터 삭제 완료');
            return true;
        } catch (error) {
            console.error('❌ 고객 데이터 삭제 실패:', error);
            return false;
        }
    }
}

// 인스턴스 생성
const customerDataManager = new CustomerDataManager();

// 전역 인스턴스 생성
window.customerDataManager = customerDataManager;

// 모듈 내보내기 (ES6 모듈 지원시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerDataManager;
}

// ES6 모듈 export
export { customerDataManager, CustomerDataManager };