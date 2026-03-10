/**
 * PWA (Progressive Web App) 관리 모듈
 * 경산다육식물농장 관리시스템
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isAppInstalled = false;
        this.init();
    }

    /**
     * PWA 매니저 초기화
     */
    init() {
        console.log('🚀 PWA Manager 초기화 시작...');
        
        // PWA 설치 이벤트 리스너 등록
        this.setupInstallEventListeners();
        
        // PWA 실행 상태 확인
        this.checkPWAStatus();
        
        // 네트워크 상태 모니터링
        this.setupNetworkMonitoring();
        
        // 서비스 워커 등록
        this.registerServiceWorker();
        
        console.log('✅ PWA Manager 초기화 완료');
    }

    /**
     * PWA 설치 이벤트 리스너 설정
     */
    setupInstallEventListeners() {
        // beforeinstallprompt 이벤트 리스너
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA 설치 가능 상태');
            e.preventDefault();
            this.deferredPrompt = e;
            
            // 설치 버튼 표시
            this.showInstallButton();
        });

        // PWA 설치 완료 이벤트
        window.addEventListener('appinstalled', (evt) => {
            console.log('✅ PWA 설치 완료!');
            this.isAppInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
        });

        // PWA 설치 버튼 클릭 처리
        document.addEventListener('DOMContentLoaded', () => {
            const installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', async () => {
                    await this.handleInstallClick();
                });
            }
        });
    }

    /**
     * PWA 설치 버튼 클릭 처리
     */
    async handleInstallClick() {
        if (this.deferredPrompt) {
            console.log('📱 PWA 설치 시작...');
            this.deferredPrompt.prompt();
            
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`PWA 설치 결과: ${outcome}`);
            
            if (outcome === 'accepted') {
                alert('🎉 경산다육식물농장 앱이 성공적으로 설치되었습니다!\n홈 화면에서 앱을 찾아보세요.');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    /**
     * 설치 버튼 표시
     */
    showInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.innerHTML = '<i class="fas fa-download mr-1"></i>앱 설치';
        }
    }

    /**
     * 설치 버튼 숨기기
     */
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.add('hidden');
        }
    }

    /**
     * 설치 성공 메시지 표시
     */
    showInstallSuccessMessage() {
        setTimeout(() => {
            alert('🌱 경산다육식물농장 앱 설치 완료!\n이제 오프라인에서도 사용할 수 있습니다.\n\n💾 중요: 정기적으로 데이터를 백업해주세요!');
            
            // 자동 백업 알림 설정 (7일마다)
            this.setupAutoBackupReminder();
        }, 1000);
    }

    /**
     * 자동 백업 알림 설정
     */
    setupAutoBackupReminder() {
        // Supabase 전용 - localStorage 제거됨
        const lastBackup = null; // localStorage.getItem('lastBackupDate');
        const today = new Date().toDateString();
        
        if (!lastBackup || new Date(lastBackup).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
            setTimeout(() => {
                if (confirm('📅 데이터 백업을 권장합니다.\n지금 백업하시겠습니까?')) {
                    // 백업 기능 실행
                    if (window.exportToExcel) {
                        window.exportToExcel();
                        // Supabase 전용 - localStorage 제거됨
                        // localStorage.setItem('lastBackupDate', today);
                    }
                }
            }, 5000);
        }
    }

    /**
     * PWA 실행 상태 확인
     */
    checkPWAStatus() {
        if (this.isPWAInstalled()) {
            console.log('🏠 PWA 모드로 실행 중');
            document.body.classList.add('pwa-mode');
            this.applyPWAStyles();
        } else {
            console.log('🌐 브라우저 모드로 실행 중');
            this.checkPWAInstallability();
        }
    }

    /**
     * PWA가 설치되었는지 확인
     */
    isPWAInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone || 
               document.referrer.includes('android-app://');
    }

    /**
     * PWA 설치 가능성 확인
     */
    checkPWAInstallability() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        console.log('모바일 기기:', isMobile);
        console.log('iOS 기기:', isIOS);
        console.log('Android 기기:', isAndroid);
        
        if (isIOS) {
            console.log('🍎 iOS 기기 - Safari에서 수동 설치 가이드 필요');
            this.showIOSInstallGuide();
        }
        
        if (isAndroid) {
            console.log('🤖 Android 기기 - PWA 설치 조건 확인');
            
            if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('이미 PWA로 설치되어 실행 중');
                return;
            }
            
            setTimeout(() => {
                if (!this.deferredPrompt) {
                    console.log('⚠️ beforeinstallprompt 이벤트가 발생하지 않음');
                    this.showManualInstallGuide();
                }
            }, 3000);
        }
    }

    /**
     * iOS 설치 가이드 표시
     */
    showIOSInstallGuide() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>홈에 추가';
            installBtn.onclick = () => {
                alert('📱 iOS 설치 방법:\n\n1. Safari 하단의 공유 버튼(□↗) 탭\n2. "홈 화면에 추가" 선택\n3. "추가" 버튼 탭\n\n🌱 경산다육농장 앱이 홈 화면에 추가됩니다!');
            };
        }
    }

    /**
     * 수동 설치 가이드 표시
     */
    showManualInstallGuide() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.innerHTML = '<i class="fas fa-download mr-1"></i>앱 설치';
            installBtn.onclick = () => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);
                
                let message = '📱 앱 설치 방법:\n\n';
                
                if (isIOS) {
                    message += '🍎 iOS (Safari):\n1. 하단 공유 버튼(□↗) 탭\n2. "홈 화면에 추가" 선택\n3. "추가" 버튼 탭';
                } else if (isAndroid) {
                    message += '🤖 Android (Chrome):\n1. 브라우저 메뉴(⋮) 탭\n2. "홈 화면에 추가" 선택\n3. "설치" 또는 "추가" 버튼 탭';
                } else {
                    message += '💻 PC:\n1. 주소창 옆 설치 아이콘 클릭\n2. "설치" 버튼 클릭';
                }
                
                message += '\n\n🌱 경산다육농장 앱이 홈 화면에 추가됩니다!';
                alert(message);
            };
        }
    }

    /**
     * PWA 전용 스타일 적용
     */
    applyPWAStyles() {
        const pwaStyle = document.createElement('style');
        pwaStyle.textContent = `
            .pwa-mode {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
            }
            .pwa-mode header {
                background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            }
        `;
        document.head.appendChild(pwaStyle);
    }

    /**
     * 서비스 워커 등록
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    console.log('🚀 서비스워커 등록 시작...');
                    
                    // 기존 등록 확인 및 정리
                    const existingRegistration = await navigator.serviceWorker.getRegistration();
                    if (existingRegistration) {
                        console.log('🔄 기존 서비스워커 발견, 업데이트 중...');
                        await existingRegistration.update();
                    }
                    
                    // Service Worker 등록 비활성화됨 (sw.js 파일 삭제됨)
                    console.log('🚫 Service Worker 등록 비활성화됨');
                    
                    console.log('✅ 서비스워커 등록 비활성화 완료!');
                    console.log('📍 Scope: 비활성화됨');
                    
                    // 프리캐시 상태 확인
                    setTimeout(async () => {
                        try {
                            const cacheNames = await caches.keys();
                            console.log('📦 활성 캐시:', cacheNames);
                            
                            for (const cacheName of cacheNames) {
                                const cache = await caches.open(cacheName);
                                const keys = await cache.keys();
                                console.log(`📋 ${cacheName} 캐시 내용:`, keys.map(req => req.url));
                                
                                // 루트 경로 캐시 확인
                                const rootCached = await cache.match('/');
                                const indexCached = await cache.match('./index.html');
                                console.log('🏠 루트(/) 캐시 상태:', !!rootCached);
                                console.log('📄 index.html 캐시 상태:', !!indexCached);
                            }
                        } catch (error) {
                            console.warn('⚠️ 캐시 상태 확인 실패:', error);
                        }
                    }, 2000);
                    
                } catch (error) {
                    console.log('🚫 서비스워커 등록 비활성화됨 (의도적)');
                }
            });
        } else {
            console.warn('⚠️ 서비스워커 미지원 브라우저');
        }
    }

    /**
     * 네트워크 상태 모니터링 설정
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('🌐 온라인 연결됨');
            this.showNetworkStatus('온라인', 'bg-green-500');
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 오프라인 모드');
            this.showNetworkStatus('오프라인', 'bg-amber-500');
        });
    }

    /**
     * 네트워크 상태 표시
     */
    showNetworkStatus(status, bgColor) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `fixed top-4 right-4 ${bgColor} text-white px-3 py-1 rounded-lg text-sm z-50`;
        statusIndicator.innerHTML = `<i class="fas fa-wifi${status === '오프라인' ? '-slash' : ''} mr-1"></i>${status}`;
        document.body.appendChild(statusIndicator);
        
        const timeout = status === '온라인' ? 3000 : 5000;
        setTimeout(() => statusIndicator.remove(), timeout);
    }
}

// PWA 매니저 인스턴스 생성
window.pwaManager = new PWAManager();

// 전역 함수로 노출
window.isPWAInstalled = () => window.pwaManager.isPWAInstalled();
window.showIOSInstallGuide = () => window.pwaManager.showIOSInstallGuide();
window.showManualInstallGuide = () => window.pwaManager.showManualInstallGuide();
