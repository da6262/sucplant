// 고객 데이터 관리 모듈
// features/customers/customerData.js

// Supabase 전용 - localStorage 완전 제거됨

class CustomerDataManager {
    constructor() {
        this.farm_customers = [];
        this.currentEditingCustomer = null;
        this.customerSortBy = 'newest'; // 기본값: 최근 등록순
        // DB에 address_detail 컬럼이 없는 환경이 있을 수 있어 자동 감지/폴백합니다.
        // - null: 미확인
        // - true: 지원함
        // - false: 지원 안 함(저장 시 address_detail 제거)
        this.supportsAddressDetail = null;
    }

    /** 전화번호 정규화 (숫자만) — 중복 판별용 */
    _normalizePhone(phone) {
        if (phone == null) return '';
        return String(phone).replace(/\D/g, '');
    }

    _sanitizeCustomer(customer) {
        const safeCustomer = { ...customer };
        const normalizedPhone = this._normalizePhone(safeCustomer.phone);

        safeCustomer.name = safeCustomer.name != null ? String(safeCustomer.name).trim() : '';
        safeCustomer.phone = safeCustomer.phone != null ? String(safeCustomer.phone).trim() : '';
        safeCustomer.address = safeCustomer.address != null ? String(safeCustomer.address) : '';
        safeCustomer.address_detail = safeCustomer.address_detail != null ? String(safeCustomer.address_detail) : '';
        safeCustomer.email = safeCustomer.email != null ? String(safeCustomer.email).trim() : '';
        safeCustomer.grade = (safeCustomer.grade && String(safeCustomer.grade).trim()) ? String(safeCustomer.grade).trim() : 'GENERAL';
        safeCustomer.memo = safeCustomer.memo != null ? String(safeCustomer.memo) : '';
        safeCustomer.phone_normalized = normalizedPhone || null;
        safeCustomer.youtube_order_count = Number.isFinite(Number(safeCustomer.youtube_order_count))
            ? Number(safeCustomer.youtube_order_count)
            : 0;
        safeCustomer.live_order_count = Number.isFinite(Number(safeCustomer.live_order_count))
            ? Number(safeCustomer.live_order_count)
            : 0;

        // tags: string[] 정규화 — 공백 제거, 빈 문자열 제외, 중복 제거
        if (Array.isArray(safeCustomer.tags)) {
            const cleaned = safeCustomer.tags
                .filter(t => typeof t === 'string')
                .map(t => t.trim())
                .filter(Boolean);
            safeCustomer.tags = Array.from(new Set(cleaned));
        } else {
            safeCustomer.tags = [];
        }

        return safeCustomer;
    }

    /** 전화번호 기준 중복 제거. 동일 전화번호면 created_at 최신 1건만 유지 */
    _dedupeCustomersByPhone(customers) {
        if (!Array.isArray(customers) || customers.length === 0) return customers;
        const byPhone = new Map();
        for (const c of customers) {
            const key = this._normalizePhone(c.phone) || `no-phone-${c.id}`;
            const existing = byPhone.get(key);
            if (!existing || (c.created_at && existing.created_at && new Date(c.created_at) > new Date(existing.created_at))) {
                byPhone.set(key, c);
            }
        }
        return Array.from(byPhone.values());
    }

    // 고객 데이터 로드 (Supabase 전용) - 안전한 방식으로 개선
    async loadCustomers() {
        try {
            console.log('👥 고객 데이터 로드 시작...');
            
            // Supabase 연결 상태 확인
            console.log('🔍 Supabase 연결 상태 확인:');
            console.log('- window.supabase:', !!window.supabase);
            console.log('- window.supabaseClient:', !!window.supabaseClient);
            console.log('- window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 연결되지 않음. 로컬 백업에서 로드 시도...');
                return await this.loadFromBackup();
            }
            
            console.log('☁️ Supabase에서 고객 데이터 로드 중...');
            
            // 타임아웃 설정 (10초)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Supabase 쿼리 타임아웃')), 10000);
            });
            
            const queryPromise = window.supabaseClient
                .from('farm_customers')
                .select('*')
                .order('created_at', { ascending: false });
            
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
            
            if (error) {
                console.error('❌ Supabase 쿼리 오류:', error);
                console.warn('⚠️ Supabase 로드 실패. 로컬 백업에서 로드 시도...');
                return await this.loadFromBackup();
            }
            
            // 로드 후 grade 없음(null/빈값) → 'GENERAL'(일반)으로 통일, 상세주소 항상 보존
            let list = (data || []).map(c => this._sanitizeCustomer(c));
            // 전화번호 기준 중복 제거 (같은 사람이 두 번 나오는 현상 방지) — 최신(created_at) 1건만 유지
            this.farm_customers = this._dedupeCustomersByPhone(list);
            console.log(`✅ Supabase에서 고객 ${this.farm_customers.length}개 로드됨 (중복 제거 후)`);
            
            // 백업은 비동기로 (로딩 블로킹 제거 — v3.3.67)
            this.saveToBackup().catch(e => console.warn('⚠️ 백업 저장 실패:', e));
            
            return this.farm_customers;
            
        } catch (error) {
            console.error('❌ 고객 데이터 로드 실패:', error);
            console.warn('⚠️ 로컬 백업에서 로드 시도...');
            return await this.loadFromBackup();
        }
    }
    
    // 로컬 백업에서 데이터 로드
    async loadFromBackup() {
        try {
            console.log('🔄 Supabase 백업에서 고객 데이터 로드 시도...');
            
            // Supabase에서 백업 데이터 조회
            if (window.supabaseDataManager && window.supabaseDataManager.initialized) {
                try {
                    const backupData = await window.supabaseDataManager.getData('customer_backups', {});
                    if (backupData && backupData.length > 0) {
                        // 가장 최근 백업 사용
                        const latestBackup = backupData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                        const raw = latestBackup.data || [];
                        let list = raw.map(c => this._sanitizeCustomer(c));
                        this.farm_customers = this._dedupeCustomersByPhone(list);
                        console.log(`✅ Supabase 백업에서 고객 ${this.farm_customers.length}개 로드됨 (${latestBackup.backup_date}, 중복 제거 후)`);
                    } else {
                        console.warn('⚠️ Supabase 백업이 없습니다.');
                        this.farm_customers = [];
                    }
                } catch (error) {
                    console.error('❌ Supabase 백업 로드 실패:', error);
                    this.farm_customers = [];
                }
            } else {
                console.warn('⚠️ Supabase가 초기화되지 않았습니다.');
                this.farm_customers = [];
            }
            
            return this.farm_customers;
            
        } catch (error) {
            console.error('❌ 로컬 백업 로드 실패:', error);
            this.farm_customers = [];
            return this.farm_customers;
        }
    }
    
    // Supabase 백업 저장 (localStorage 대신 Supabase 사용)
    async saveToBackup() {
        try {
            console.log('💾 Supabase 백업 저장 시작...');
            // Supabase에 백업 데이터 저장
            if (window.supabaseDataManager && window.supabaseDataManager.initialized) {
                const backupData = {
                    backup_date: new Date().toISOString().split('T')[0],
                    data: this.farm_customers,
                    created_at: new Date().toISOString()
                };
                
                await window.supabaseDataManager.saveData('customer_backups', backupData);
                console.log('✅ Supabase 백업 저장 완료');
            } else {
                console.warn('⚠️ Supabase가 초기화되지 않았습니다. 백업을 건너뜁니다.');
            }
        } catch (error) {
            console.error('❌ Supabase 백업 저장 실패:', error);
        }
    }

    // 고객 데이터 저장 (Supabase 전용) - 안전한 방식으로 개선
    async saveCustomers() {
        try {
            console.log('💾 고객 데이터 저장 시작...');
            
            // Supabase 연결 상태 확인
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            // 연결 테스트
            const { data: testData, error: testError } = await window.supabaseClient
                .from('farm_customers')
                .select('id')
                .limit(1);
            
            if (testError) {
                throw new Error(`Supabase 연결 실패: ${testError.message}`);
            }
            
            console.log('☁️ Supabase에 고객 데이터 저장 중...');
            
            // 안전한 저장 방식: upsert 사용 (기존 데이터 삭제하지 않음)
            if (this.farm_customers.length > 0) {
                const normalizedCustomers = this.farm_customers.map(c => this._sanitizeCustomer(c));
                this.farm_customers = normalizedCustomers;

                const customersToSave = (this.supportsAddressDetail === false)
                    ? normalizedCustomers.map(c => {
                        // eslint-disable-next-line no-unused-vars
                        const { address_detail, ...rest } = c;
                        return rest;
                    })
                    : normalizedCustomers;

                let { data, error } = await window.supabaseClient
                    .from('farm_customers')
                    .upsert(customersToSave, { 
                        onConflict: 'id',
                        ignoreDuplicates: false 
                    });
                
                if (error) {
                    console.error('❌ Supabase upsert 실패:', error);
                    // address_detail 컬럼이 DB에 없을 때 폴백: 상세주소 제외 후 재시도
                    const msg = String(error.message || '');
                    if (msg.includes("address_detail") && msg.includes("Could not find")) {
                        console.warn('⚠️ DB에 address_detail 컬럼이 없어 폴백 저장을 시도합니다. (상세주소는 저장되지 않음)');
                        this.supportsAddressDetail = false;

                        const customersWithoutDetail = this.farm_customers.map(c => {
                            // eslint-disable-next-line no-unused-vars
                            const { address_detail, ...rest } = c;
                            return rest;
                        });

                        const retry = await window.supabaseClient
                            .from('farm_customers')
                            .upsert(customersWithoutDetail, {
                                onConflict: 'id',
                                ignoreDuplicates: false
                            });

                        if (retry.error) {
                            console.error('❌ 폴백 저장도 실패:', retry.error);
                            throw new Error(`Supabase 저장 실패: ${retry.error.message}`);
                        }

                        // 사용자에게 마이그레이션 안내 (가능하면 Toast 사용)
                        if (window.showToast) {
                            window.showToast('⚠️ DB에 상세주소 컬럼이 없어 상세주소는 저장되지 않았습니다. 관리자에게 컬럼 추가를 요청하세요.', 5000);
                        } else {
                            console.warn('⚠️ DB에 상세주소 컬럼이 없어 상세주소는 저장되지 않았습니다. add-address-detail-column.sql 실행 필요');
                        }

                        data = retry.data;
                    } else {
                        throw new Error(`Supabase 저장 실패: ${error.message}`);
                    }
                } else {
                    // 정상 저장이 되었다면(그리고 이전에 미확인이었다면) 지원함으로 마킹
                    if (this.supportsAddressDetail === null) {
                        this.supportsAddressDetail = true;
                    }
                }
                
                console.log('✅ Supabase에 고객 데이터 저장 완료');
            } else {
                console.log('📝 저장할 고객 데이터가 없습니다');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ 고객 데이터 저장 실패:', error);
            
            // Supabase 백업 저장 (긴급 상황 대비)
            try {
                await this.saveToBackup();
            } catch (backupError) {
                console.error('❌ Supabase 백업 저장 실패:', backupError);
            }
            
            throw error; // 오류를 다시 던져서 호출자에게 알림
        }
    }

    // Supabase 전용 - localStorage 캐시 제거됨

    // 새 고객 추가
    async addCustomer(customerData) {
        try {
            console.log('➕ 새 고객 추가:', customerData);
            
            // 고객 데이터 검증
            if (!customerData.name || !customerData.phone) {
                throw new Error('고객명과 전화번호는 필수입니다.');
            }
            
            // (전화번호·고객명 중복은 UI 레이어에서 confirm으로 처리)
            
            // 새 고객 객체 생성
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const nowISO = now.toISOString();
            
            const newCustomer = {
                // UUID 생성 (Supabase 호환)
                id: crypto.randomUUID(),
                name: customerData.name.trim(),
                phone: customerData.phone.trim(),
                address: customerData.address || '',
                address_detail: customerData.address_detail || '', // 상세주소 추가
                email: customerData.email || '',
                grade: customerData.grade || 'GENERAL',
                registration_date: customerData.registration_date || today, // DATE 형식
                memo: customerData.memo || '',
                phone_normalized: this._normalizePhone(customerData.phone),
                youtube_order_count: 0,
                live_order_count: 0,
                created_at: nowISO
            };
            
            console.log('📅 고객 등록일 설정:', newCustomer.registration_date);
            
            // 고객 목록에 추가
            this.farm_customers.push(newCustomer);
            
            // 데이터 저장
            await this.saveCustomers();
            
            console.log('✅ 새 고객 추가 완료:', newCustomer);
            return newCustomer;
            
        } catch (error) {
            console.error('❌ 고객 추가 실패:', error);
            console.error('❌ 에러 상세:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
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

            console.log('🔍 수정할 고객 인덱스:', customerIndex);
            console.log('🔍 기존 고객 정보:', this.farm_customers[customerIndex]);

            // (전화번호 중복은 UI 레이어에서 경고 표시로 처리)

            // 수동 등급 변경 감지 (updateData 에 grade 가 명시되고 이전 값과 다를 때)
            const prevGrade = this.farm_customers[customerIndex].grade;
            const incomingGrade = typeof updateData.grade === 'string' ? updateData.grade.trim() : '';
            const gradeChangedManually = incomingGrade && incomingGrade !== prevGrade;

            // 고객 정보 업데이트
            this.farm_customers[customerIndex] = this._sanitizeCustomer({
                ...this.farm_customers[customerIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            });

            // 데이터 저장
            await this.saveCustomers();

            console.log('✅ 고객 정보 수정 완료');

            // 수동 등급 변경 시 타임라인 로그 기록 (환경설정 등급명 기반)
            if (gradeChangedManually && window.customerLogsManager) {
                try {
                    const gradesList = window.settingsDataManager?.settings?.customerGrades || [];
                    const gradeLabel = (code) => {
                        if (!code) return '-';
                        const found = gradesList.find(g => (g.code || g.grade_code) === code);
                        return found?.name || code;
                    };
                    await window.customerLogsManager.add(customerId, {
                        log_type: 'grade_change',
                        title: `등급 변동 (수동): ${gradeLabel(prevGrade)} → ${gradeLabel(incomingGrade)}`,
                        metadata: {
                            old: prevGrade,
                            new: incomingGrade,
                            old_label: gradeLabel(prevGrade),
                            new_label: gradeLabel(incomingGrade),
                            reason: 'manual'
                        }
                    });
                } catch (e) {
                    console.warn('⚠️ 수동 등급 변동 로그 기록 실패:', e);
                }
            }

            return this.farm_customers[customerIndex];
            
        } catch (error) {
            console.error('❌ 고객 정보 수정 실패:', error);
            console.error('❌ 에러 상세:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
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

            const deletedCustomer = this.farm_customers.splice(customerIndex, 1)[0];

            // Supabase에서 실제 row 삭제 (upsert는 삭제 불가)
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }

            // 외래키 제약 해제: 관련 주문의 customer_id를 null로 설정
            await window.supabaseClient
                .from('farm_orders')
                .update({ customer_id: null })
                .eq('customer_id', customerId);

            const { error } = await window.supabaseClient
                .from('farm_customers')
                .delete()
                .eq('id', customerId);

            if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);

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
                (customer.phone || '').replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
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
                    case 'grade_high': {
                        const gradeOrder = { BLACK_DIAMOND: 0, PURPLE_EMPEROR: 1, RED_RUBY: 2, GREEN_LEAF: 3, GENERAL: 4 };
                        const ga = gradeOrder[a.grade] ?? 5;
                        const gb = gradeOrder[b.grade] ?? 5;
                        return ga !== gb ? ga - gb : a.name.localeCompare(b.name);
                    }
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
    
    // 데이터 복구 기능
    async recoverData() {
        try {
            console.log('🔄 고객 데이터 복구 시작...');
            
            // 1. Supabase 백업에서 최신 데이터 찾기
            if (!window.supabaseDataManager || !window.supabaseDataManager.initialized) {
                throw new Error('Supabase가 초기화되지 않았습니다.');
            }
            
            const backupData = await window.supabaseDataManager.getData('customer_backups', {});
            if (!backupData || backupData.length === 0) {
                throw new Error('복구할 백업 데이터가 없습니다.');
            }
            
            // 가장 최근 백업 사용
            const latestBackup = backupData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            const backupCustomers = latestBackup.data || [];
            
            console.log(`📦 백업 데이터 발견: ${backupCustomers.length}개 고객 (${latestBackup.backup_date})`);
            
            // 2. 메모리에 로드
            this.farm_customers = backupData;
            
            // 3. Supabase에 복구 시도
            if (window.supabaseClient) {
                try {
                    const { data, error } = await window.supabaseClient
                        .from('farm_customers')
                        .upsert(backupData, { onConflict: 'id' });
                    
                    if (error) {
                        console.warn('⚠️ Supabase 복구 실패:', error);
                    } else {
                        console.log('✅ Supabase에 데이터 복구 완료');
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ Supabase 복구 중 오류:', supabaseError);
                }
            }
            
            console.log('✅ 고객 데이터 복구 완료');
            return this.farm_customers;
            
        } catch (error) {
            console.error('❌ 고객 데이터 복구 실패:', error);
            throw error;
        }
    }
    
    // 백업 목록 조회 (Supabase 전용)
    async getBackupList() {
        try {
            if (!window.supabaseDataManager || !window.supabaseDataManager.initialized) {
                console.warn('⚠️ Supabase가 초기화되지 않았습니다.');
                return [];
            }
            
            const backupData = await window.supabaseDataManager.getData('customer_backups', {});
            return backupData.map(backup => ({
                key: backup.id,
                date: backup.backup_date,
                count: backup.data ? backup.data.length : 0,
                size: JSON.stringify(backup.data || []).length,
                created_at: backup.created_at
            })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (error) {
            console.error('❌ 백업 목록 조회 실패:', error);
            return [];
        }
    }
}

// Supabase 연결 상태 확인 함수
function checkSupabaseConnection() {
    try {
        console.log('🔍 Supabase 연결 상태 확인:');
        console.log('- window.supabase:', !!window.supabase);
        console.log('- window.supabaseClient:', !!window.supabaseClient);
        console.log('- window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트가 연결되지 않았습니다');
            return false;
        }
        
        console.log('✅ Supabase 클라이언트 연결됨');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase 연결 확인 실패:', error);
        return false;
    }
}

// 인스턴스 생성
const customerDataManager = new CustomerDataManager();

// 전역 인스턴스 생성
window.customerDataManager = customerDataManager;
window.checkSupabaseConnection = checkSupabaseConnection;

// 긴급 데이터 복구 함수들
window.recoverCustomerData = async function() {
    try {
        console.log('🚨 긴급 고객 데이터 복구 시작...');
        const recoveredData = await customerDataManager.recoverData();
        console.log(`✅ 복구 완료: ${recoveredData.length}개 고객`);
        alert(`고객 데이터 복구 완료!\n복구된 고객 수: ${recoveredData.length}명`);
        return recoveredData;
    } catch (error) {
        console.error('❌ 데이터 복구 실패:', error);
        alert('데이터 복구에 실패했습니다: ' + error.message);
        return [];
    }
};

window.showBackupList = function() {
    try {
        const backups = customerDataManager.getBackupList();
        console.log('📦 백업 목록:', backups);
        
        if (backups.length === 0) {
            alert('백업 데이터가 없습니다.');
            return;
        }
        
        let message = '📦 백업 데이터 목록:\n\n';
        backups.forEach((backup, index) => {
            message += `${index + 1}. ${backup.date}\n`;
            message += `   - 고객 수: ${backup.count}명\n`;
            message += `   - 크기: ${Math.round(backup.size / 1024)}KB\n\n`;
        });
        
        alert(message);
        return backups;
    } catch (error) {
        console.error('❌ 백업 목록 조회 실패:', error);
        alert('백업 목록 조회에 실패했습니다.');
        return [];
    }
};

// 모듈 내보내기 (ES6 모듈 지원시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerDataManager;
}

// ES6 모듈 export
export { customerDataManager, CustomerDataManager };
