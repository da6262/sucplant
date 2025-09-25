const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 개발 환경 확인
const isDev = process.env.NODE_ENV === 'development';

// 메인 윈도우 변수
let mainWindow;

// 앱 준비 완료 시 실행
app.whenReady().then(() => {
    createMainWindow();
    setupMenu();
    setupIPC();
    
    // macOS에서 독에서 앱 아이콘 클릭 시 윈도우 재생성
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// 모든 윈도우가 닫혔을 때
app.on('window-all-closed', () => {
    // macOS가 아닌 경우 앱 종료
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 메인 윈도우 생성
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        title: '경산다육식물농장 관리시스템 v1.0',
        show: false // 로딩 완료 후 표시
    });

    // HTML 파일 로드
    mainWindow.loadFile('index.html');

    // 개발 환경에서 DevTools 열기
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // 윈도우 로딩 완료 후 표시
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 시작 화면 표시
        showWelcomeMessage();
    });

    // 윈도우 닫기 이벤트
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 환영 메시지 표시
function showWelcomeMessage() {
    mainWindow.webContents.executeJavaScript(`
        setTimeout(() => {
            if (typeof orderSystem !== 'undefined') {
                orderSystem.showToast('🌱 경산다육식물농장 관리시스템에 오신 것을 환영합니다! White Platter 전문 관리 도구입니다.', 5000);
            }
        }, 2000);
    `);
}

// 메뉴 설정
function setupMenu() {
    const template = [
        {
            label: '파일',
            submenu: [
                {
                    label: '데이터 백업',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => exportData()
                },
                {
                    label: '데이터 가져오기',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => importData()
                },
                { type: 'separator' },
                {
                    label: '종료',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: '편집',
            submenu: [
                { label: '실행 취소', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '다시 실행', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: '잘라내기', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '복사', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '붙여넣기', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: '보기',
            submenu: [
                { label: '새로고침', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '강제 새로고침', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: '개발자 도구', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: '실제 크기', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '확대', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '축소', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '전체 화면', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: '관리',
            submenu: [
                {
                    label: '주문 관리',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => switchTab('orders')
                },
                {
                    label: '고객 관리',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => switchTab('customers')
                },
                {
                    label: '상품 관리',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => switchTab('products')
                },
                {
                    label: '대기자 관리',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => switchTab('waitlist')
                },
                {
                    label: '배송 관리',
                    accelerator: 'CmdOrCtrl+5',
                    click: () => switchTab('shipping')
                }
            ]
        },
        {
            label: '도움말',
            submenu: [
                {
                    label: '사용법',
                    click: () => showHelp()
                },
                {
                    label: '정보',
                    click: () => showAbout()
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC 통신 설정
function setupIPC() {
    // 데이터 백업 요청
    ipcMain.handle('export-data', async () => {
        return await exportData();
    });

    // 데이터 가져오기 요청
    ipcMain.handle('import-data', async () => {
        return await importData();
    });

    // 알림 표시 요청
    ipcMain.handle('show-notification', async (event, title, body) => {
        const { Notification } = require('electron');
        if (Notification.isSupported()) {
            new Notification({
                title: title,
                body: body,
                icon: path.join(__dirname, 'assets', 'icon.png')
            }).show();
        }
    });
}

// 탭 전환
function switchTab(tabName) {
    mainWindow.webContents.executeJavaScript(`
        if (typeof orderSystem !== 'undefined') {
            orderSystem.switchTab('${tabName}');
        }
    `);
}

// 데이터 백업
async function exportData() {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: '데이터 백업 저장',
            defaultPath: `경산다육농장_백업_${new Date().toISOString().split('T')[0]}.json`,
            filters: [
                { name: 'JSON 파일', extensions: ['json'] },
                { name: '모든 파일', extensions: ['*'] }
            ]
        });

        if (!result.canceled) {
            // 웹 페이지에서 데이터 추출
            const data = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (typeof orderSystem !== 'undefined') {
                        return {
                            customers: orderSystem.customers || [],
                            orders: orderSystem.orders || [],
                            products: orderSystem.products || [],
                            waitlist: orderSystem.waitlist || [],
                            categories: orderSystem.categories || [],
                            orderSources: orderSystem.orderSources || [],
                            exportDate: new Date().toISOString(),
                            version: '1.0.0'
                        };
                    }
                    return null;
                })()
            `);

            if (data) {
                fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8');
                
                dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: '백업 완료',
                    message: '데이터 백업이 완료되었습니다!',
                    detail: `저장 위치: ${result.filePath}`
                });
                
                return { success: true, path: result.filePath };
            }
        }
        
        return { success: false };
    } catch (error) {
        console.error('데이터 백업 오류:', error);
        dialog.showErrorBox('백업 오류', '데이터 백업 중 오류가 발생했습니다.');
        return { success: false, error: error.message };
    }
}

// 데이터 가져오기
async function importData() {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: '데이터 파일 선택',
            filters: [
                { name: 'JSON 파일', extensions: ['json'] },
                { name: '모든 파일', extensions: ['*'] }
            ],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            // 데이터 유효성 검증
            if (!data.customers && !data.orders && !data.products) {
                throw new Error('올바른 백업 파일이 아닙니다.');
            }

            // 확인 대화상자
            const confirmResult = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: '데이터 가져오기 확인',
                message: '기존 데이터를 모두 덮어쓰시겠습니까?',
                detail: '이 작업은 되돌릴 수 없습니다. 현재 데이터를 백업하는 것을 권장합니다.',
                buttons: ['취소', '백업 후 가져오기', '바로 가져오기'],
                defaultId: 1,
                cancelId: 0
            });

            if (confirmResult.response === 1) {
                // 백업 후 가져오기
                await exportData();
            } else if (confirmResult.response === 0) {
                // 취소
                return { success: false };
            }

            // 웹 페이지에 데이터 로드
            await mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (typeof orderSystem !== 'undefined') {
                        const data = ${JSON.stringify(data)};
                        
                        // 데이터 로드
                        orderSystem.customers = data.customers || [];
                        orderSystem.orders = data.orders || [];
                        orderSystem.products = data.products || [];
                        orderSystem.waitlist = data.waitlist || [];
                        orderSystem.categories = data.categories || [];
                        orderSystem.orderSources = data.orderSources || [];
                        
                        // LocalStorage에 저장
                        localStorage.setItem('farm_management_customers', JSON.stringify(orderSystem.customers));
                        localStorage.setItem('farm_management_orders', JSON.stringify(orderSystem.orders));
                        localStorage.setItem('farm_management_products', JSON.stringify(orderSystem.products));
                        localStorage.setItem('farm_management_waitlist', JSON.stringify(orderSystem.waitlist));
                        localStorage.setItem('farm_management_categories', JSON.stringify(orderSystem.categories));
                        localStorage.setItem('farm_management_order_sources', JSON.stringify(orderSystem.orderSources));
                        
                        // UI 새로고침
                        orderSystem.renderOrdersTable();
                        orderSystem.renderCustomersTable();
                        orderSystem.renderProductsTable();
                        orderSystem.renderWaitlistTable();
                        
                        orderSystem.showToast('🎉 데이터 가져오기 완료! 모든 정보가 복원되었습니다.', 3000);
                        
                        return true;
                    }
                    return false;
                })()
            `);

            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '가져오기 완료',
                message: '데이터 가져오기가 완료되었습니다!',
                detail: `가져온 파일: ${filePath}`
            });

            return { success: true, path: filePath };
        }
        
        return { success: false };
    } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        dialog.showErrorBox('가져오기 오류', `데이터 가져오기 중 오류가 발생했습니다: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// 도움말 표시
function showHelp() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '사용법',
        message: '경산다육식물농장 관리시스템 사용법',
        detail: `
🌱 White Platter 전문 관리 시스템

주요 기능:
• 주문 관리: Ctrl+1 - 주문 등록, 수정, 상태 변경
• 고객 관리: Ctrl+2 - 고객 정보, 등급 관리
• 상품 관리: Ctrl+3 - White Platter 재고 관리
• 대기자 관리: Ctrl+4 - 희귀종 대기자 목록
• 배송 관리: Ctrl+5 - 피킹&포장 리스트

단축키:
• Ctrl+B: 데이터 백업
• Ctrl+I: 데이터 가져오기
• F11: 전체 화면
• F12: 개발자 도구

데이터는 자동으로 저장되며, 정기적으로 백업하시기 바랍니다.
        `
    });
}

// 정보 표시
function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '정보',
        message: '경산다육식물농장 관리시스템',
        detail: `
🏢 경산다육식물농장
🌱 White Platter 전문 생산 농장

버전: 1.0.0
개발: AI Assistant
용도: Cotyledon orbiculata 'White Platter' 전문 관리

© 2025 경산다육식물농장. All rights reserved.

국내 최초 White Platter 품종 도입 및 생산
희귀 다육식물 전문 농장 관리 시스템
        `
    });
}

// 앱 보안 설정
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});