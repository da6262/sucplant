/**
 * Supabase 전용 백업/복구 관리 모듈
 * localStorage 사용 금지 - Supabase만 사용
 * 경산다육식물농장 관리시스템
 */

class SupabaseBackupManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.init();
    }

    /**
     * Supabase 백업 매니저 초기화
     */
    async init() {
        console.log('🔄 Supabase Backup Manager 초기화 시작...');
        
        try {
            // Supabase 클라이언트 초기화
            if (window.supabase) {
                this.supabase = window.supabase;
                this.initialized = true;
                console.log('✅ Supabase 클라이언트 연결 완료');
            } else {
                console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
                return;
            }
            
            // 백업 관련 이벤트 리스너 설정
            this.setupBackupEventListeners();
            
            // 복구 관련 이벤트 리스너 설정
            this.setupRestoreEventListeners();
            
            console.log('✅ Supabase Backup Manager 초기화 완료');
        } catch (error) {
            console.error('❌ Supabase Backup Manager 초기화 실패:', error);
        }
    }

    /**
     * 백업 이벤트 리스너 설정
     */
    setupBackupEventListeners() {
        // 긴급 백업 버튼
        const emergencyBackupBtn = document.getElementById('emergency-backup-main');
        if (emergencyBackupBtn) {
            emergencyBackupBtn.addEventListener('click', () => {
                this.performEmergencyBackup();
            });
        }

        // JSON 백업 버튼
        const jsonBackupBtn = document.getElementById('json-backup-btn');
        if (jsonBackupBtn) {
            jsonBackupBtn.addEventListener('click', () => {
                this.performJSONBackup();
            });
        }

        // Excel 백업 버튼
        const excelBackupBtn = document.getElementById('excel-backup-btn');
        if (excelBackupBtn) {
            excelBackupBtn.addEventListener('click', () => {
                this.performExcelBackup();
            });
        }

        // API 동기화 버튼
        const apiSyncBtn = document.getElementById('api-sync-btn');
        if (apiSyncBtn) {
            apiSyncBtn.addEventListener('click', () => {
                this.performAPISync();
            });
        }

        // 브라우저 동기화 버튼
        const browserSyncBtn = document.getElementById('browser-sync-btn');
        if (browserSyncBtn) {
            browserSyncBtn.addEventListener('click', async () => {
                await this.performBrowserSync();
            });
        }

        // 스마트 동기화 버튼
        const smartSyncBtn = document.getElementById('smart-sync-btn');
        if (smartSyncBtn) {
            smartSyncBtn.addEventListener('click', async () => {
                await this.performSmartSync();
            });
        }

        // 강제 업데이트 버튼
        const forceUpdateBtn = document.getElementById('force-app-update');
        if (forceUpdateBtn) {
            forceUpdateBtn.addEventListener('click', () => {
                this.performForceAppUpdate();
            });
        }
    }

    /**
     * 복구 이벤트 리스너 설정
     */
    setupRestoreEventListeners() {
        // 백업 파일 선택 버튼
        const selectBackupFileBtn = document.getElementById('select-backup-file');
        const backupRestoreInput = document.getElementById('backup-restore-input');
        
        if (selectBackupFileBtn) {
            selectBackupFileBtn.addEventListener('click', () => {
                backupRestoreInput.click();
            });
        }

        if (backupRestoreInput) {
            backupRestoreInput.addEventListener('change', (e) => {
                this.handleBackupFileSelection(e);
            });
        }

        // 복구 시작 버튼
        const restoreBackupDataBtn = document.getElementById('restore-backup-data');
        if (restoreBackupDataBtn) {
            restoreBackupDataBtn.addEventListener('click', () => {
                this.performDataRestore();
            });
        }

        // 선택된 파일 제거 버튼
        const clearSelectedFileBtn = document.getElementById('clear-selected-file');
        if (clearSelectedFileBtn) {
            clearSelectedFileBtn.addEventListener('click', () => {
                this.clearSelectedBackupFile();
            });
        }
    }

    /**
     * 긴급 백업 수행
     */
    async performEmergencyBackup() {
        try {
            console.log('🚨 긴급 백업 시작...');
            
            // 모든 데이터 수집
            const backupData = await this.collectAllData();
            
            // JSON 파일로 다운로드
            this.downloadJSONBackup(backupData, 'emergency-backup');
            
            console.log('✅ 긴급 백업 완료');
            alert('🚨 긴급 백업이 완료되었습니다!\n파일이 자동으로 다운로드됩니다.');
            
        } catch (error) {
            console.error('❌ 긴급 백업 실패:', error);
            alert('❌ 긴급 백업에 실패했습니다. 다시 시도해주세요.');
        }
    }

    /**
     * JSON 백업 수행
     */
    async performJSONBackup() {
        try {
            console.log('📄 JSON 백업 시작...');
            
            const backupData = await this.collectAllData();
            this.downloadJSONBackup(backupData, 'data-backup');
            
            console.log('✅ JSON 백업 완료');
            alert('📄 JSON 백업이 완료되었습니다!');
            
        } catch (error) {
            console.error('❌ JSON 백업 실패:', error);
            alert('❌ JSON 백업에 실패했습니다.');
        }
    }

    /**
     * Excel 백업 수행
     */
    async performExcelBackup() {
        try {
            console.log('📊 Excel 백업 시작...');
            
            if (window.exportToExcel) {
                await window.exportToExcel();
                console.log('✅ Excel 백업 완료');
            } else {
                throw new Error('Excel 내보내기 기능을 사용할 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ Excel 백업 실패:', error);
            alert('❌ Excel 백업에 실패했습니다.');
        }
    }

    /**
     * API 동기화 수행
     */
    async performAPISync() {
        try {
            console.log('🌐 API 동기화 시작...');
            
            if (window.orderDataManager && window.orderDataManager.syncToApi) {
                await window.orderDataManager.syncToApi();
                console.log('✅ API 동기화 완료');
                alert('🌐 API 동기화가 완료되었습니다!');
            } else {
                throw new Error('API 동기화 기능을 사용할 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ API 동기화 실패:', error);
            alert('❌ API 동기화에 실패했습니다.');
        }
    }

    /**
     * 브라우저 동기화 수행
     */
    async performBrowserSync() {
        try {
            console.log('🔄 브라우저 동기화 시작...');
            
            if (window.orderDataManager && window.orderDataManager.syncFromApiToLocal) {
                await window.orderDataManager.syncFromApiToLocal();
                console.log('✅ 브라우저 동기화 완료');
                alert('🔄 브라우저 동기화가 완료되었습니다!');
            } else {
                throw new Error('브라우저 동기화 기능을 사용할 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 브라우저 동기화 실패:', error);
            alert('❌ 브라우저 동기화에 실패했습니다.');
        }
    }

    /**
     * 스마트 동기화 수행
     */
    async performSmartSync() {
        try {
            console.log('🧠 스마트 동기화 시작...');
            
            if (window.orderDataManager && window.orderDataManager.smartBrowserSync) {
                await window.orderDataManager.smartBrowserSync();
                console.log('✅ 스마트 동기화 완료');
                alert('🧠 스마트 동기화가 완료되었습니다!');
            } else {
                throw new Error('스마트 동기화 기능을 사용할 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 스마트 동기화 실패:', error);
            alert('❌ 스마트 동기화에 실패했습니다.');
        }
    }

    /**
     * 강제 앱 업데이트 수행
     */
    performForceAppUpdate() {
        try {
            console.log('🔄 강제 앱 업데이트 시작...');
            
            // 캐시 클리어
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }
            
            // Supabase 전용 - 데이터베이스 캐시 정리
            this.clearSupabaseCache();
            
            // 페이지 새로고침
            location.reload();
            
        } catch (error) {
            console.error('❌ 강제 업데이트 실패:', error);
            alert('❌ 강제 업데이트에 실패했습니다.');
        }
    }

    /**
     * 모든 데이터 수집
     */
    async collectAllData() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {}
        };

        try {
            // 주문 데이터
            if (window.orderDataManager && window.orderDataManager.orders) {
                backupData.data.orders = window.orderDataManager.orders;
            }

            // 고객 데이터
            if (window.orderDataManager && window.orderDataManager.customers) {
                backupData.data.customers = window.orderDataManager.customers;
            }

            // 상품 데이터
            if (window.orderDataManager && window.orderDataManager.products) {
                backupData.data.products = window.orderDataManager.products;
            }

            // 카테고리 데이터
            if (window.orderDataManager && window.orderDataManager.categories) {
                backupData.data.categories = window.orderDataManager.categories;
            }

            // Supabase 전용 - 설정 데이터는 Supabase에서 가져옴
            const settingsData = await this.getSupabaseSettings();
            backupData.data.settings = settingsData;
            backupData.data.lastBackup = new Date().toISOString();

            return backupData;

        } catch (error) {
            console.error('❌ 데이터 수집 실패:', error);
            throw error;
        }
    }

    /**
     * JSON 백업 다운로드
     */
    downloadJSONBackup(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 백업 파일 선택 처리
     */
    handleBackupFileSelection(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('📁 백업 파일 선택:', file.name);
        
        // 파일 정보 표시
        this.showSelectedFileInfo(file);
        
        // 파일 미리보기
        this.previewBackupFile(file);
        
        // 복구 버튼 활성화
        const restoreBtn = document.getElementById('restore-backup-data');
        if (restoreBtn) {
            restoreBtn.disabled = false;
        }
    }

    /**
     * 선택된 파일 정보 표시
     */
    showSelectedFileInfo(file) {
        const fileInfo = document.getElementById('selected-file-info');
        const fileName = document.getElementById('selected-file-name');
        const fileDetails = document.getElementById('selected-file-details');
        
        if (fileInfo && fileName && fileDetails) {
            fileName.textContent = file.name;
            fileDetails.textContent = `${(file.size / 1024).toFixed(1)}KB • ${new Date(file.lastModified).toLocaleString()}`;
            fileInfo.classList.remove('hidden');
        }
    }

    /**
     * 백업 파일 미리보기
     */
    previewBackupFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.backupData = data;
                
                // 미리보기 내용 표시
                const preview = document.getElementById('backup-preview');
                const previewContent = document.getElementById('backup-preview-content');
                
                if (preview && previewContent) {
                    previewContent.innerHTML = `
                        <div class="text-sm">
                            <div><strong>백업 날짜:</strong> ${new Date(data.timestamp).toLocaleString()}</div>
                            <div><strong>버전:</strong> ${data.version}</div>
                            <div><strong>주문 수:</strong> ${data.data.orders?.length || 0}개</div>
                            <div><strong>고객 수:</strong> ${data.data.customers?.length || 0}개</div>
                            <div><strong>상품 수:</strong> ${data.data.products?.length || 0}개</div>
                            <div><strong>카테고리 수:</strong> ${data.data.categories?.length || 0}개</div>
                        </div>
                    `;
                    preview.classList.remove('hidden');
                }
                
                // 복구 옵션 표시
                const restoreOptions = document.getElementById('restore-options');
                if (restoreOptions) {
                    restoreOptions.classList.remove('hidden');
                }
                
            } catch (error) {
                console.error('❌ 백업 파일 파싱 실패:', error);
                alert('❌ 백업 파일이 손상되었거나 형식이 올바르지 않습니다.');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 데이터 복구 수행
     */
    async performDataRestore() {
        if (!this.backupData) {
            alert('❌ 복구할 백업 파일을 먼저 선택해주세요.');
            return;
        }

        const restoreMode = document.querySelector('input[name="restore-mode"]:checked')?.value || 'replace';
        const backupCurrent = document.getElementById('backup-current-before-restore')?.checked || false;

        if (!confirm(`⚠️ 데이터 복구를 시작하시겠습니까?\n모드: ${restoreMode === 'replace' ? '전체 교체' : '병합'}\n현재 데이터 백업: ${backupCurrent ? '예' : '아니오'}`)) {
            return;
        }

        try {
            console.log('🔄 데이터 복구 시작...');

            // 현재 데이터 백업 (선택적)
            if (backupCurrent) {
                await this.performEmergencyBackup();
            }

            // 복구 모드에 따른 처리
            if (restoreMode === 'replace') {
                await this.replaceAllData(this.backupData);
            } else {
                await this.mergeData(this.backupData);
            }

            console.log('✅ 데이터 복구 완료');
            alert('✅ 데이터 복구가 완료되었습니다!\n페이지를 새로고침합니다.');
            
            // 페이지 새로고침
            location.reload();

        } catch (error) {
            console.error('❌ 데이터 복구 실패:', error);
            alert('❌ 데이터 복구에 실패했습니다.');
        }
    }

    /**
     * 모든 데이터 교체
     */
    async replaceAllData(backupData) {
        if (window.orderDataManager) {
            if (backupData.data.orders) {
                window.orderDataManager.orders = backupData.data.orders;
            }
            if (backupData.data.customers) {
                window.orderDataManager.customers = backupData.data.customers;
            }
            if (backupData.data.products) {
                window.orderDataManager.products = backupData.data.products;
            }
            if (backupData.data.categories) {
                window.orderDataManager.categories = backupData.data.categories;
            }
            
            // 로컬 스토리지에 저장
            await window.orderDataManager.saveAllData();
        }
    }

    /**
     * 데이터 병합
     */
    async mergeData(backupData) {
        if (window.orderDataManager) {
            // 기존 데이터와 병합 (중복 제거)
            if (backupData.data.orders) {
                const existingOrders = window.orderDataManager.orders || [];
                const mergedOrders = [...existingOrders, ...backupData.data.orders];
                window.orderDataManager.orders = this.removeDuplicates(mergedOrders, 'id');
            }
            
            // 다른 데이터도 동일하게 처리...
            
            // 로컬 스토리지에 저장
            await window.orderDataManager.saveAllData();
        }
    }

    /**
     * 중복 제거
     */
    removeDuplicates(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }

    /**
     * 선택된 백업 파일 제거
     */
    clearSelectedBackupFile() {
        const fileInput = document.getElementById('backup-restore-input');
        const fileInfo = document.getElementById('selected-file-info');
        const preview = document.getElementById('backup-preview');
        const restoreOptions = document.getElementById('restore-options');
        const restoreBtn = document.getElementById('restore-backup-data');
        
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.classList.add('hidden');
        if (preview) preview.classList.add('hidden');
        if (restoreOptions) restoreOptions.classList.add('hidden');
        if (restoreBtn) restoreBtn.disabled = true;
        
        this.backupData = null;
        console.log('✅ 선택된 백업 파일 제거 완료');
    }

    /**
     * Supabase 캐시 정리
     */
    async clearSupabaseCache() {
        if (!this.initialized) {
            console.warn('⚠️ Supabase가 초기화되지 않았습니다.');
            return;
        }

        try {
            console.log('🔄 Supabase 캐시 정리 시작...');
            
            // Supabase 클라이언트 캐시 정리
            if (this.supabase && this.supabase.realtime) {
                // 실시간 연결 정리
                this.supabase.realtime.disconnect();
                console.log('✅ Supabase 실시간 연결 정리 완료');
            }
            
            console.log('✅ Supabase 캐시 정리 완료');
        } catch (error) {
            console.error('❌ Supabase 캐시 정리 실패:', error);
        }
    }

    /**
     * Supabase 설정 데이터 조회
     */
    async getSupabaseSettings() {
        if (!this.initialized) {
            console.warn('⚠️ Supabase가 초기화되지 않았습니다.');
            return { theme: 'light', language: 'ko' };
        }

        try {
            const { data, error } = await this.supabase
                .from('farm_settings')
                .select('*')
                .eq('key', 'system_settings')
                .single();

            if (error && error.code !== 'PGRST116') { // 데이터 없음 에러가 아닌 경우
                throw error;
            }

            return data ? data.value : { theme: 'light', language: 'ko' };
        } catch (error) {
            console.error('❌ Supabase 설정 조회 실패:', error);
            return { theme: 'light', language: 'ko' };
        }
    }

    /**
     * Supabase 데이터 백업
     */
    async performSupabaseBackup() {
        if (!this.initialized) {
            throw new Error('Supabase가 초기화되지 않았습니다.');
        }

        try {
            console.log('🔄 Supabase 데이터 백업 시작...');
            
            const tables = ['farm_customers', 'farm_orders', 'farm_products', 'farm_categories', 'farm_waitlist'];
            const backupData = {
                version: '2.1',
                source: '경산다육식물농장',
                type: 'supabase_backup',
                created_at: new Date().toISOString(),
                data: {}
            };

            // 각 테이블에서 데이터 조회
            for (const table of tables) {
                try {
                    const { data, error } = await this.supabase
                        .from(table)
                        .select('*');

                    if (error) throw error;

                    backupData.data[table] = data || [];
                    console.log(`✅ ${table} 테이블 백업 완료: ${data?.length || 0}개 레코드`);
                } catch (error) {
                    console.error(`❌ ${table} 테이블 백업 실패:`, error);
                    backupData.data[table] = [];
                }
            }

            // 백업 파일 생성
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const link = document.createElement('a');
            link.href = url;
            link.download = `경산다육농장_Supabase백업_${timestamp}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            console.log('✅ Supabase 백업 완료');
            return backupData;
        } catch (error) {
            console.error('❌ Supabase 백업 실패:', error);
            throw error;
        }
    }
}

// Supabase 백업 매니저 인스턴스 생성
window.backupManager = new SupabaseBackupManager();

// 전역 함수로 노출
window.performEmergencyBackup = () => window.backupManager.performEmergencyBackup();
window.performJSONBackup = () => window.backupManager.performJSONBackup();
window.performExcelBackup = () => window.backupManager.performExcelBackup();
window.performAPISync = () => window.backupManager.performAPISync();
window.performForceAppUpdate = () => window.backupManager.performForceAppUpdate();
window.handleBackupFileSelection = (e) => window.backupManager.handleBackupFileSelection(e);
window.performDataRestore = () => window.backupManager.performDataRestore();
window.clearSelectedBackupFile = () => window.backupManager.clearSelectedBackupFile();

// 백업 섹션 표시 함수
window.showBackupSection = function() {
    try {
        console.log('🔄 백업 섹션 표시 중...');
        
        // DOM이 완전히 로드될 때까지 대기
        const waitForElement = (selector, timeout = 5000) => {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
                
                const observer = new MutationObserver(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        observer.disconnect();
                        resolve(element);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        };
        
        // 백업 섹션을 찾을 때까지 대기
        waitForElement('#backup-section').then(() => {
            // 모든 섹션 숨기기
            const sections = document.querySelectorAll('.section-content');
            sections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // 백업 섹션 표시
            const backupSection = document.getElementById('backup-section');
            if (backupSection) {
                backupSection.classList.remove('hidden');
                console.log('✅ 백업 섹션이 표시되었습니다.');
            } else {
                console.error('❌ 백업 섹션을 찾을 수 없습니다.');
            }
        }).catch((error) => {
            console.error('❌ 백업 섹션을 찾을 수 없습니다:', error);
        });
        
        // 탭 활성화 상태 업데이트
        const allTabs = document.querySelectorAll('.tab-button, .mobile-tab-button');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 백업 탭 활성화
        const backupTab = document.getElementById('tab-backup');
        const mobileBackupTab = document.getElementById('mobile-tab-backup');
        
        if (backupTab) {
            backupTab.classList.add('active');
        }
        if (mobileBackupTab) {
            mobileBackupTab.classList.add('active');
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ 백업 섹션 표시 실패:', error);
    }
};
