/**
 * 🔗 Supabase 통합 모듈
 * 
 * Supabase와의 데이터 동기화 및 통합 관리를 담당합니다.
 * 실시간 업데이트, 오프라인 지원, 데이터 동기화를 제공합니다.
 */

class SupabaseIntegration {
    constructor() {
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.syncInterval = null;
        
        this.setupEventListeners();
        this.initializeConnection();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 네트워크 상태 변경 감지
        window.addEventListener('online', () => {
            console.log('🌐 네트워크 연결 복구 - Supabase 재연결 시도');
            this.initializeConnection();
        });

        window.addEventListener('offline', () => {
            console.log('📡 네트워크 연결 끊어짐 - 오프라인 모드');
            this.connectionStatus = 'offline';
        });

        // 페이지 언로드 시 동기화
        window.addEventListener('beforeunload', () => {
            this.syncAllData();
        });
    }

    // Supabase 연결 초기화
    async initializeConnection() {
        try {
            if (!window.supabase) {
                console.warn('⚠️ Supabase 클라이언트가 없습니다. 설정을 확인해주세요.');
                this.connectionStatus = 'error';
                return false;
            }

            // 연결 테스트
            const { data, error } = await window.supabase
                .from('farm_customers')
                .select('count')
                .limit(1);

            if (error) {
                throw error;
            }

            this.isConnected = true;
            this.connectionStatus = 'connected';
            this.retryCount = 0;
            
            console.log('✅ Supabase 연결 성공');
            
            // 자동 동기화 시작
            this.startAutoSync();
            
            return true;

        } catch (error) {
            console.error('❌ Supabase 연결 실패:', error);
            this.connectionStatus = 'error';
            this.isConnected = false;
            
            // 재시도 로직
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                const delay = Math.pow(2, this.retryCount) * 1000; // 지수 백오프
                console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.retryCount}/${this.maxRetries})`);
                
                setTimeout(() => {
                    this.initializeConnection();
                }, delay);
            }
            
            return false;
        }
    }

    // 자동 동기화 시작
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // 30초마다 동기화
        this.syncInterval = setInterval(() => {
            if (this.isConnected && !this.syncInProgress) {
                this.syncAllData();
            }
        }, 30000);

        console.log('🔄 자동 동기화 시작 (30초 간격)');
    }

    // 자동 동기화 중지
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ 자동 동기화 중지');
        }
    }

    // 모든 데이터 동기화
    async syncAllData() {
        if (this.syncInProgress) {
            console.log('⏳ 동기화가 이미 진행 중입니다.');
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 전체 데이터 동기화 시작...');

        try {
            const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist'];
            const syncPromises = tables.map(table => this.syncTable(table));
            
            await Promise.all(syncPromises);
            
            this.lastSyncTime = new Date().toISOString();
            console.log('✅ 전체 데이터 동기화 완료');
            
            // UI 업데이트
            this.updateSyncStatus('completed');

        } catch (error) {
            console.error('❌ 데이터 동기화 실패:', error);
            this.updateSyncStatus('error');
        } finally {
            this.syncInProgress = false;
        }
    }

    // 특정 테이블 동기화
    async syncTable(tableName) {
        try {
            console.log(`🔄 ${tableName} 테이블 동기화 중...`);
            
            // Supabase에서 데이터 조회
            const { data, error } = await window.supabase
                .from(tableName)
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                throw error;
            }

            // 로컬 스토리지에 저장
            const localKey = `local_${tableName}`;
            localStorage.setItem(localKey, JSON.stringify(data || []));
            
            console.log(`✅ ${tableName} 동기화 완료 (${data?.length || 0}개 레코드)`);
            
            return data;

        } catch (error) {
            console.error(`❌ ${tableName} 동기화 실패:`, error);
            throw error;
        }
    }

    // 데이터 업로드
    async uploadData(tableName, data) {
        try {
            if (!this.isConnected) {
                console.warn('⚠️ Supabase 연결이 없습니다. 로컬에 저장합니다.');
                return await this.saveToLocal(tableName, data);
            }

            const { data: result, error } = await window.supabase
                .from(tableName)
                .insert(data)
                .select();

            if (error) {
                throw error;
            }

            console.log(`✅ ${tableName} 데이터 업로드 완료`);
            return result;

        } catch (error) {
            console.error(`❌ ${tableName} 데이터 업로드 실패:`, error);
            // 실패 시 로컬에 저장
            return await this.saveToLocal(tableName, data);
        }
    }

    // 데이터 업데이트
    async updateData(tableName, id, data) {
        try {
            if (!this.isConnected) {
                console.warn('⚠️ Supabase 연결이 없습니다. 로컬에 저장합니다.');
                return await this.updateLocal(tableName, id, data);
            }

            const { data: result, error } = await window.supabase
                .from(tableName)
                .update(data)
                .eq('id', id)
                .select();

            if (error) {
                throw error;
            }

            console.log(`✅ ${tableName} 데이터 업데이트 완료`);
            return result;

        } catch (error) {
            console.error(`❌ ${tableName} 데이터 업데이트 실패:`, error);
            // 실패 시 로컬에 저장
            return await this.updateLocal(tableName, id, data);
        }
    }

    // 데이터 삭제
    async deleteData(tableName, id) {
        try {
            if (!this.isConnected) {
                console.warn('⚠️ Supabase 연결이 없습니다. 로컬에서 삭제합니다.');
                return await this.deleteLocal(tableName, id);
            }

            const { error } = await window.supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            console.log(`✅ ${tableName} 데이터 삭제 완료`);
            return true;

        } catch (error) {
            console.error(`❌ ${tableName} 데이터 삭제 실패:`, error);
            // 실패 시 로컬에서 삭제
            return await this.deleteLocal(tableName, id);
        }
    }

    // 로컬 저장
    async saveToLocal(tableName, data) {
        try {
            const localKey = `local_${tableName}`;
            const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
            const newData = Array.isArray(data) ? data : [data];
            
            existingData.push(...newData);
            localStorage.setItem(localKey, JSON.stringify(existingData));
            
            console.log(`💾 ${tableName} 로컬 저장 완료`);
            return newData;
        } catch (error) {
            console.error(`❌ ${tableName} 로컬 저장 실패:`, error);
            throw error;
        }
    }

    // 로컬 업데이트
    async updateLocal(tableName, id, data) {
        try {
            const localKey = `local_${tableName}`;
            const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
            const index = existingData.findIndex(item => item.id === id);
            
            if (index !== -1) {
                existingData[index] = { ...existingData[index], ...data, updated_at: new Date().toISOString() };
                localStorage.setItem(localKey, JSON.stringify(existingData));
                console.log(`💾 ${tableName} 로컬 업데이트 완료`);
            }
            
            return existingData[index];
        } catch (error) {
            console.error(`❌ ${tableName} 로컬 업데이트 실패:`, error);
            throw error;
        }
    }

    // 로컬 삭제
    async deleteLocal(tableName, id) {
        try {
            const localKey = `local_${tableName}`;
            const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
            const filteredData = existingData.filter(item => item.id !== id);
            
            localStorage.setItem(localKey, JSON.stringify(filteredData));
            console.log(`💾 ${tableName} 로컬 삭제 완료`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${tableName} 로컬 삭제 실패:`, error);
            throw error;
        }
    }

    // 동기화 상태 업데이트
    updateSyncStatus(status) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = status === 'completed' ? '동기화 완료' : 
                                      status === 'error' ? '동기화 실패' : '동기화 중...';
            statusElement.className = status === 'completed' ? 'text-brand' : 
                                    status === 'error' ? 'text-danger' : 'text-warn';
        }
    }

    // 연결 상태 확인
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            status: this.connectionStatus,
            lastSyncTime: this.lastSyncTime,
            syncInProgress: this.syncInProgress
        };
    }
}

// 전역 Supabase 통합 인스턴스 생성
window.supabaseIntegration = new SupabaseIntegration();

console.log('🔗 Supabase 통합 모듈 로드 완료');
