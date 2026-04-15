// 주문 데이터 관리
// features/orders/orderData.js

/**
 * get_order_rows 결과 rows에서 탭/상태별 카운트 계산 (단일 소스, 주문관리·대시보드 공유)
 * @param {Array<{order_status?: string}>} rows - get_order_rows RPC 반환 배열
 * @returns {Array<{status_key: string, count: number}>}
 */
function computeCountsFromOrderRows(rows) {
    if (!Array.isArray(rows)) return [];
    const statusNorm = (s) => (s != null && String(s).trim() !== '') ? String(s).trim() : '주문접수';
    const countBy = {};
    rows.forEach((r) => {
        const st = statusNorm(r.order_status);
        countBy[st] = (countBy[st] || 0) + 1;
    });
    const total = rows.length;
    return [
        { status_key: 'all', count: total },
        { status_key: 'work_todo', count: (countBy['상품준비'] || 0) + (countBy['배송준비'] || 0) },
        { status_key: 'work_deposit', count: countBy['입금대기'] || 0 },
        { status_key: 'work_ship_today', count: (countBy['배송준비'] || 0) + (countBy['배송중'] || 0) },
        { status_key: 'work_done', count: countBy['배송완료'] || 0 },
        ...Object.entries(countBy).map(([k, v]) => ({ status_key: k, count: v }))
    ];
}

class OrderDataManager {
    constructor() {
        console.log('🚀 OrderDataManager 생성자 호출됨');
        
        this.farm_orders = [];
        /** @type {Array<{order_id: string, order_created_at: string, d_day: number|null, customer_name: string, customer_phone_last4: string|null, order_items_summary: string, total_amount: number, payment_status: string|null, order_status: string, delivery_status: string}>} */
        this.farm_order_rows = [];
        this.categories = [];
        this.orderSources = [];
        this.farm_waitlist = [];
        this.currentEditingOrder = null;
        this.currentEditingWaitlist = null;
        this.currentShippingFilter = '';
        this.filteredShippingOrders = [];
        this.currentPreviewOrders = null;
        this.currentPreviewType = null;

        // 날짜 필터
        this._dateFrom = null;  // Date 객체 또는 null
        this._dateTo = null;    // Date 객체 또는 null
        
        // Master-Detail 패턴을 위한 선택된 고객 정보
        this.selectedCustomerId = null;
        this.selectedCustomer = null;
        
        // 대시보드 차트 인스턴스
        this.salesTrendChart = null;
        this.salesChannelChart = null;
        this.categorySalesChart = null;
        this.customerAnalysisChart = null;
        
        // 판매 채널 관리
        this.channels = [];
        this.currentEditingChannel = null;
        
        // 주문 상태 관리
        this.orderStatuses = [];
        this.currentEditingOrderStatus = null;
        
        // 표준 주문 상태 목록 (Single Source of Truth)
        this.standardOrderStatuses = [
            { value: '주문접수', label: '주문접수', color: '#6B7280', description: '새로 접수된 주문' },
            { value: '고객안내', label: '고객안내', color: '#3B82F6', description: '고객에게 안내 완료' },
            { value: '입금대기', label: '입금대기', color: '#F59E0B', description: '입금 대기 중' },
            { value: '입금확인', label: '입금확인', color: '#3B82F6', description: '결제가 확인된 주문' },
            { value: '상품준비', label: '상품준비', color: '#8B5CF6', description: '상품 준비 중' },
            { value: '배송준비', label: '배송준비', color: '#F59E0B', description: '포장 및 배송 준비 중' },
            { value: '배송중', label: '배송중', color: '#8B5CF6', description: '배송이 시작된 주문' },
            { value: '배송완료', label: '배송완료', color: '#10B981', description: '고객에게 배송 완료된 주문' },
            { value: '주문취소', label: '주문취소', color: '#EF4444', description: '취소된 주문' },
            { value: '환불완료', label: '환불완료', color: '#F97316', description: '환불 처리된 주문' }
        ];
        
        // 페이지네이션 설정
        this.currentProductsPage = 1;
        this.farm_productsPerPage = 20;  // 기본값: 20개
        
        // 일괄 선택 관리
        this.selectedOrders = new Set();
        this.isAllSelected = false;
    }

    // 상품 정보 조회 함수 (product_id로 상품명 찾기)
    async getProductNameById(productId) {
        try {
            if (!productId) {
                console.warn('⚠️ product_id가 없습니다');
                return null;
            }
            
            console.log(`🔍 상품 정보 조회: ${productId}`);
            
            // Supabase 클라이언트 확인
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 없습니다');
                return null;
            }
            
            // farm_products 테이블에서 상품 정보 조회
            const { data: product, error } = await window.supabaseClient
                .from('farm_products')
                .select('id, name, price, size, description, category')
                .eq('id', productId)
                .single();
            
            if (error) {
                console.error('❌ 상품 정보 조회 실패:', error);
                return null;
            }
            
            if (!product) {
                console.warn('⚠️ 상품을 찾을 수 없습니다:', productId);
                return null;
            }
            
            console.log('✅ 상품 정보 조회 성공:', product);
            return product;
            
        } catch (error) {
            console.error('❌ 상품 정보 조회 중 오류:', error);
            return null;
        }
    }

    // 주문 캐시 무효화 (Service Worker 캐시 삭제)
    async invalidateOrderCache() {
        try {
            console.log('🗑️ 주문 캐시 무효화 시작...');
            
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                console.log('📦 사용 가능한 캐시:', cacheNames);
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    for (const request of requests) {
                        // Supabase farm_orders, farm_order_items 관련 요청 삭제
                        if (request.url.includes('farm_orders') || 
                            request.url.includes('farm_order_items')) {
                            await cache.delete(request);
                            console.log('🗑️ 주문 캐시 삭제:', request.url);
                        }
                    }
                }
                
                console.log('✅ 주문 캐시 무효화 완료');
            } else {
                console.log('⚠️ Cache API를 사용할 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 주문 캐시 무효화 실패:', error);
        }
    }

    // 주문 데이터 로드 — get_order_rows 단일 소스. 목록·카운트 모두 이 결과로 처리.
    async loadOrders() {
        this._loadErrorMessage = null;
        try {
            console.log('📋 OrderDataManager: 주문 목록 로드 (get_order_rows 단일 소스, 카운트=rows 기반)');
            if (!window.supabaseClient) {
                if (window.initializeSupabaseClient) {
                    const initialized = window.initializeSupabaseClient();
                    if (!initialized) throw new Error('Supabase가 연결되지 않았습니다.');
                } else {
                    throw new Error('Supabase가 연결되지 않았습니다.');
                }
            }
            this._lastLoadedFilter = 'all';
            const pLimit = 2000;
            const pOffset = 0;
            const payload = {
                p_filter_status: 'all',
                p_limit: pLimit,
                p_offset: pOffset,
                p_date_from: null,
                p_date_to: null,
                p_channel: null,
                p_search_text: null
            };
            console.log('[get_order_rows] 요청 payload(7키):', JSON.stringify(payload));
            const { data: rows, error: rpcError } = await window.supabaseClient.rpc('get_order_rows', payload);
            const listLength = Array.isArray(rows) ? rows.length : 0;
            console.log('[get_order_rows] response rows length:', listLength, rpcError ? '(error: ' + (rpcError.code || rpcError.message) + ')' : '');
            if (rpcError) {
                const isRpcNotFound = (rpcError.code === 'PGRST202' || (rpcError.message && rpcError.message.includes('Could not find the function')));
                if (isRpcNotFound) {
                    // 개발/디버그 모드에서만 폴백 허용
                    const allowFallback = window.ENABLE_ORDER_FALLBACK === true || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    if (allowFallback) {
                        console.warn('⚠️ get_order_rows RPC 없음 — 개발 모드에서 폴백 사용. Supabase SQL Editor에서 supabase-get-order-rows-rpc.sql 실행 권장.');
                        const list = await this._loadOrdersFallback('all', pLimit, pOffset);
                        this.farm_order_rows = list;
                        this._warnTotalAmountMismatch(list);
                        this._lastCountRows = this._computeCountsFromOrderRows(list);
                        this.updateFilterCountsFromRpc(this._lastCountRows);
                        console.log(`✅ 주문 목록 폴백: ${list.length}건`);
                        return list;
                    } else {
                        // 프로덕션: RPC 없으면 에러만 표시 (폴백 사용 안 함)
                        console.error('❌ get_order_rows RPC 없음 — 프로덕션에서는 폴백 비활성화. Supabase SQL Editor에서 supabase-get-order-rows-rpc.sql 실행 필요.');
                        this.farm_order_rows = [];
                        this._lastCountRows = [];
                        this.updateFilterCountsFromRpc([]);
                        throw new Error('주문 목록을 불러올 수 없습니다. 관리자에게 문의하세요.');
                    }
                }
                const errMsg = rpcError.message || rpcError.error_description || String(rpcError);
                const errCode = rpcError.code || rpcError.error || '';
                console.error('❌ get_order_rows RPC 실패:', errCode, errMsg, rpcError);
                this.farm_order_rows = [];
                this._lastCountRows = [];
                this.updateFilterCountsFromRpc([]);
                const friendlyError = new Error(errMsg || 'get_order_rows 호출 실패');
                friendlyError.code = errCode;
                friendlyError.original = rpcError;
                this._loadErrorMessage = (errCode ? `[${errCode}] ` : '') + errMsg;
                throw friendlyError;
            }
            // RPC 성공: 결과를 그대로 사용 (계산 없음)
            const list = Array.isArray(rows) ? rows : [];
            this.farm_order_rows = list;
            this._warnTotalAmountMismatch(list);
            this._lastCountRows = this._computeCountsFromOrderRows(list);
            this.updateFilterCountsFromRpc(this._lastCountRows);
            this._loadErrorMessage = null;
            console.log(`✅ get_order_rows: ${list.length}건 (카운트=get_order_rows rows 기반)`);
            return list;
        } catch (error) {
            const msg = error && (error.message || error.error_description || String(error));
            console.error('❌ OrderDataManager: 주문 목록 로드 실패:', msg, error);
            this.farm_order_rows = [];
            this._lastCountRows = [];
            this._loadErrorMessage = msg || '주문 목록 로드 실패';
            throw error;
        }
    }

    /** get_order_rows 결과 rows에서 탭/상태별 카운트 계산 (공유 함수 사용) */
    _computeCountsFromOrderRows(rows) {
        return computeCountsFromOrderRows(rows);
    }

    /**
     * 폴백: get_order_rows RPC 없을 때 farm_orders + farm_order_items 직접 조회 후 동일 행 스펙으로 변환.
     * 
     * ⚠️ 경고: 프로덕션에서는 사용하지 않음. 개발/디버그 모드에서만 활성화됨.
     * RPC가 없으면 Supabase SQL Editor에서 supabase-get-order-rows-rpc.sql 실행 필요.
     */
    async _loadOrdersFallback(filterStatus, pLimit, pOffset) {
        const sb = window.supabaseClient;
        if (!sb) return [];
        const { data: orders, error: ordersErr } = await sb
            .from('farm_orders')
            .select('id, created_at, order_date, order_number, customer_name, customer_phone, order_status, shipping_fee, discount_amount, total_amount, tracking_number')
            .order('order_date', { ascending: false })
            .limit(Math.min(pLimit + 200, 1000));
        if (ordersErr || !Array.isArray(orders)) return [];
        const orderIds = orders.map(o => o.id);
        let items = [];
        if (orderIds.length > 0) {
            const res = await sb
                .from('farm_order_items')
                .select('order_id, product_name, quantity, subtotal')
                .in('order_id', orderIds);
            if (!res.error && Array.isArray(res.data)) items = res.data;
        }
        const itemsByOrder = {};
        items.forEach((it) => {
                const oid = it.order_id;
                if (!itemsByOrder[oid]) itemsByOrder[oid] = { sum: 0, list: [] };
                itemsByOrder[oid].sum += Number(it.subtotal) || 0;
                itemsByOrder[oid].list.push({ product_name: it.product_name, quantity: it.quantity });
        });
        const kstToday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        kstToday.setHours(0, 0, 0, 0);
        const statusNorm = (s) => (s && String(s).trim()) || '주문접수';
        const matchFilter = (st) => {
            if (!filterStatus || filterStatus === 'all') return true;
            if (filterStatus === 'work_todo') return st === '상품준비' || st === '배송준비';
            if (filterStatus === 'work_deposit') return st === '입금대기';
            if (filterStatus === 'work_ship_today') return st === '배송준비' || st === '배송중';
            if (filterStatus === 'work_done') return st === '배송완료';
            return st === filterStatus;
        };
        const rows = [];
        for (const o of orders) {
            const st = statusNorm(o.order_status);
            if (!matchFilter(st)) continue;
            const agg = itemsByOrder[o.id] || { sum: 0, list: [] };
            const itemsSubtotal = agg.sum;
            const ship = Number(o.shipping_fee) || 0;
            const disc = Number(o.discount_amount) || 0;
            const totalAmount = Math.max(0, itemsSubtotal + ship - disc);
            const created = o.created_at || o.order_date;
            // 주의: _loadOrdersFallback은 RPC get_order_rows 실패 시 폴백용
            // 정상 동작 시에는 get_order_rows RPC를 사용하여 서버에서 계산한 값을 받아야 함
            // d_day: 서버에서 계산한 값이 없으므로 클라이언트에서 계산 (RPC 사용 권장)
            let dDay = null;
            if (st !== '배송완료' && st !== '주문취소' && created) {
                const d = new Date(created);
                d.setHours(0, 0, 0, 0);
                dDay = Math.floor((kstToday - d) / (24 * 60 * 60 * 1000));
            }
            const phone = String(o.customer_phone || '');
            const phoneLast4 = phone.replace(/\D/g, '').slice(-4) || null;
            let summary = '-';
            if (agg.list.length === 1) summary = (agg.list[0].product_name || '상품') + ' × ' + (agg.list[0].quantity || 0);
            else if (agg.list.length > 1) summary = (agg.list[0].product_name || '상품') + ' 외 ' + (agg.list.length - 1) + '건';
            // payment_status: 서버에서 계산한 값이 없으므로 클라이언트에서 계산 (RPC 사용 권장)
            const paymentStatus = st === '입금대기' ? null : '입금확인';
            // delivery_status: 서버에서 계산한 값이 없으므로 클라이언트에서 계산 (RPC 사용 권장)
            // 참고: RPC get_order_rows는 '미등록' 또는 '배송완료'만 반환하지만, 폴백에서는 tracking_number도 고려
            const deliveryStatus = st === '배송완료' ? '배송완료' : (o.tracking_number && String(o.tracking_number).trim() ? '송장입력' : '미등록');
            // 폴백 전용 변환 함수 사용
            const fallbackRow = this.toOrderRowSpecFromFallback({
                id: o.id,
                created_at: created,
                order_date: created,
                customer_name: o.customer_name,
                customer_phone: o.customer_phone,
                order_status: st,
                shipping_fee: ship,
                discount_amount: disc,
                total_amount: totalAmount,
                items_subtotal: itemsSubtotal,
                items: agg.list.map(it => ({ product_name: it.product_name, quantity: it.quantity, total: it.quantity * (itemsSubtotal / (agg.list.reduce((s, i) => s + i.quantity, 0) || 1)) }))
            });
            // 폴백에서 계산한 summary로 덮어쓰기
            fallbackRow.order_items_summary = summary;
            rows.push(fallbackRow);
        }
        return rows.slice(pOffset || 0, (pOffset || 0) + (pLimit || 500));
    }

    _warnTotalAmountMismatch(rows) {
        if (!Array.isArray(rows)) return;
        rows.forEach((r) => {
            const items = Number(r.items_subtotal) || 0;
            const ship = Number(r.shipping_fee) || 0;
            const disc = Number(r.discount_amount) || 0;
            const expected = Math.max(0, items + ship - disc);
            const actual = Number(r.total_amount) || 0;
            if (Math.abs(actual - expected) > 0.01) {
                console.warn(`[주문 목록 정합성] order_id=${r.order_id} total_amount 불일치: 기대=${expected}, 실제=${actual} (items_subtotal=${items}, shipping_fee=${ship}, discount_amount=${disc})`);
            }
        });
    }

    updateFilterCountsFromRpc(countRows) {
        if (!Array.isArray(countRows)) return;
        const map = {};
        countRows.forEach((row) => { map[row.status_key] = Number(row.count) || 0; });
        const statusKeys = ['all', 'work_todo', 'work_deposit', 'work_ship_today', 'work_done', '주문접수', '고객안내', '입금대기', '입금확인', '상품준비', '배송준비', '배송중', '배송완료', '주문취소', '환불완료'];
        statusKeys.forEach((key) => {
            const el = document.getElementById(`count-${key}`);
            if (el) el.textContent = map[key] != null ? map[key] : 0;
        });
    }

    // 주문 아이템들에 상품명 정보 보강
    async enrichOrderItemsWithProductNames() {
        try {
            console.log('🔍 주문 아이템 상품명 보강 시작');
            
            let enrichedCount = 0;
            let totalItems = 0;
            
            for (const order of this.farm_orders) {
                const items = order.items ?? [];
                if (Array.isArray(items)) {
                    for (const item of items) {
                        totalItems++;
                        if (item._needsProductNameLookup && item.product_id) {
                            console.log(`🔍 상품명 조회: ${item.product_id}`);
                            const productInfo = await this.getProductNameById(item.product_id);
                            if (productInfo) {
                                item.product_name = productInfo.name;
                                if (productInfo.size) {
                                    item.size = productInfo.size;
                                }
                                item._needsProductNameLookup = false;
                                enrichedCount++;
                                console.log(`✅ 상품명 보강 완료: ${item.product_name} (사이즈: ${productInfo.size || '기본'})`);
                            } else {
                                // 상품 조회 실패 시 대체 상품명 생성
                                item.product_name = `상품_${item.product_id.substring(0, 8)}`;
                                item._needsProductNameLookup = false;
                                enrichedCount++;
                                console.log(`🔄 대체 상품명 생성: ${item.product_name}`);
                            }
                        }
                    }
                }
            }
            
            console.log(`✅ 상품명 보강 완료: ${enrichedCount}/${totalItems}개 아이템 처리`);
            
        } catch (error) {
            console.error('❌ 주문 아이템 상품명 보강 실패:', error);
        }
    }

    // 주문 상태별 필터링 — get_order_rows 단일 소스: 항상 'all'로 로드된 farm_order_rows를 클라이언트에서 status별 필터
    filterOrdersByStatus(status) {
        try {
            const rows = Array.isArray(this.farm_order_rows) ? this.farm_order_rows : [];
            const norm = (s) => (s != null && String(s).trim() !== '') ? String(s).trim() : '주문접수';

            let filtered;
            if (!status || status === 'all') filtered = rows;
            else if (status === 'work_todo') filtered = rows.filter((r) => { const st = norm(r.order_status); return st === '상품준비' || st === '배송준비'; });
            else if (status === 'work_deposit') filtered = rows.filter((r) => norm(r.order_status) === '입금대기');
            else if (status === 'work_ship_today') filtered = rows.filter((r) => { const st = norm(r.order_status); return st === '배송준비' || st === '배송중'; });
            else if (status === 'work_done') filtered = rows.filter((r) => norm(r.order_status) === '배송완료');
            else filtered = rows.filter((r) => norm(r.order_status) === status);

            // 날짜 필터 적용
            if (this._dateFrom || this._dateTo) {
                filtered = filtered.filter(r => {
                    const dateStr = r.order_created_at || r.order_date;
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    if (this._dateFrom && d < this._dateFrom) return false;
                    if (this._dateTo && d > this._dateTo) return false;
                    return true;
                });
            }

            return filtered;
        } catch (error) {
            console.error('❌ OrderDataManager: filterOrdersByStatus 실패:', error);
            return [];
        }
    }

    // 필터 카운트 업데이트 — get_order_rows rows 기반 계산 결과(_lastCountRows) 사용
    updateFilterCounts() {
        try {
            if (Array.isArray(this._lastCountRows) && this._lastCountRows.length > 0) {
                this.updateFilterCountsFromRpc(this._lastCountRows);
                return;
            }
            this.updateFilterCountsFromRpc([]);
        } catch (error) {
            console.error('❌ OrderDataManager: 필터 카운트 업데이트 실패:', error);
        }
    }

    // 주문 데이터 저장 (Supabase 전용)
    async saveOrders() {
        try {
            console.log('💾 OrderDataManager: 주문 데이터 저장 시작');
            
            // Supabase 연결 확인
            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            console.log('☁️ Supabase에 주문 데이터 저장 중...');
            
            // 기존 데이터 삭제 후 새로 삽입 (upsert 방식)
            const { error: deleteError } = await window.supabaseClient
                .from('farm_orders')
                .delete()
                .neq('id', 0); // 모든 데이터 삭제
            
            if (deleteError) {
                console.warn('⚠️ 기존 주문 데이터 삭제 실패:', deleteError);
            }
            
            // 새 데이터 삽입
            const { error: insertError } = await window.supabaseClient
                .from('farm_orders')
                .insert(this.farm_orders);
            
            if (insertError) {
                throw new Error(`Supabase 주문 데이터 저장 실패: ${insertError.message}`);
            }
            
            console.log('✅ Supabase에 주문 데이터 저장 완료');
            
            // 캐시 무효화
            await this.invalidateOrderCache();
            
            return true;
            
        } catch (error) {
            console.error('❌ OrderDataManager: 주문 데이터 저장 실패:', error);
            throw error; // 오류를 다시 던져서 호출자에게 알림
        }
    }

    // 주문 추가
    async addOrder(orderData) {
        try {
            console.log('➕ OrderDataManager: 주문 추가 시작', orderData);
            
            const newOrder = {
                ...orderData,
                id: orderData.id || `order_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.farm_orders.push(newOrder);
            await this.saveOrders();
            
            // 캐시 무효화
            await this.invalidateOrderCache();
            
            console.log('✅ OrderDataManager: 주문 추가 완료');
            return newOrder;
            
        } catch (error) {
            console.error('❌ OrderDataManager: 주문 추가 실패:', error);
            throw error;
        }
    }

    // 주문 수정
    async updateOrder(orderId, updateData) {
        try {
            console.log('✏️ OrderDataManager: 주문 수정 시작', orderId, updateData);
            
            const orderIndex = this.farm_orders.findIndex(order => order.id === orderId);
            if (orderIndex === -1) {
                throw new Error('주문을 찾을 수 없습니다.');
            }
            
            this.farm_orders[orderIndex] = {
                ...this.farm_orders[orderIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            await this.saveOrders();
            
            // 캐시 무효화
            await this.invalidateOrderCache();
            
            console.log('✅ OrderDataManager: 주문 수정 완료');
            return this.farm_orders[orderIndex];
            
        } catch (error) {
            console.error('❌ OrderDataManager: 주문 수정 실패:', error);
            throw error;
        }
    }

    // 주문 삭제
    async deleteOrder(orderId) {
        try {
            console.log('🗑️ OrderDataManager: 주문 삭제 시작', orderId);
            
            // 🔥 삭제 전에 재고 복원 처리
            console.log('📦 주문 삭제 전 재고 복원 시작...');
            await this.restoreProductStock(orderId);
            
            // Supabase에서 삭제
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient
                    .from('farm_orders')
                    .delete()
                    .eq('id', orderId);
                
                if (error) {
                    throw new Error(`Supabase 주문 삭제 실패: ${error.message}`);
                }
                
                console.log('✅ Supabase에서 주문 삭제 완료');
            }
            
            // 로컬 배열에서도 삭제
            const orderIndex = this.farm_orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                this.farm_orders.splice(orderIndex, 1);
                console.log('✅ 로컬 배열에서 주문 삭제 완료');
            }
            
            // 캐시 무효화
            await this.invalidateOrderCache();
            
            console.log('✅ OrderDataManager: 주문 삭제 완료');
            return true;
            
        } catch (error) {
            console.error('❌ OrderDataManager: 주문 삭제 실패:', error);
            throw error;
        }
    }

    // 주문 조회
    getOrderById(orderId) {
        return (this.farm_orders || []).find(order => order.id === orderId);
    }

    // 목록은 RPC 단일 소스이므로 상세는 필요 시 Supabase에서 1건 조회
    async fetchOrderByIdFromSupabase(orderId) {
        if (!window.supabaseClient || !orderId) return null;
        try {
            const { data: order, error: orderErr } = await window.supabaseClient
                .from('farm_orders')
                .select('*')
                .eq('id', orderId)
                .single();
            if (orderErr || !order) return null;
            const { data: items } = await window.supabaseClient
                .from('farm_order_items')
                .select('*')
                .eq('order_id', orderId);
            const normalizedItems = (items || []).map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || '상품명 없음',
                quantity: item.quantity,
                price: item.unit_price,
                total: item.subtotal,
                size: item.size
            }));
            return {
                ...order,
                items: normalizedItems,
                status: order.order_status || order.status || '주문접수',
                total_amount: order.total_amount != null ? Number(order.total_amount) : 0,
                shipping_fee: order.shipping_fee != null ? Number(order.shipping_fee) : 0,
                discount_amount: order.discount_amount != null ? Number(order.discount_amount) : 0
            };
        } catch (e) {
            console.error('❌ fetchOrderByIdFromSupabase 실패:', e);
            return null;
        }
    }

    // 모든 주문 조회 (목록은 farm_order_rows 사용 권장)
    getAllOrders() {
        return this.farm_orders || [];
    }

    // 주문 테이블 렌더링 (기본: 현재 선택된 탭 = work_todo)
    renderOrdersTable(status) {
        try {
            const filterStatus = status !== undefined && status !== null ? status : this.getCurrentFilterStatus();
            const filteredOrders = this.filterOrdersByStatus(filterStatus);
            console.log(`📊 렌더링할 주문 수: ${filteredOrders.length}개`);

            // 페이지 크기 적용
            const pageSizeEl = document.getElementById('order-page-size');
            const pageSize = pageSizeEl ? parseInt(pageSizeEl.value) : 50;
            const pagedOrders = pageSize === 0 ? filteredOrders : filteredOrders.slice(0, pageSize);

            // 하단 상태 바 업데이트
            const orderTotalEl = document.getElementById('order-status-total');
            const orderCountEl = document.getElementById('order-list-count');
            if (orderTotalEl) orderTotalEl.textContent = String(filteredOrders.length);
            if (orderCountEl) orderCountEl.textContent = pageSize === 0 || pagedOrders.length === filteredOrders.length
                ? `${filteredOrders.length}건 표시`
                : `${pagedOrders.length} / ${filteredOrders.length}건 표시`;
            
            // 테이블 바디 요소 찾기
            const tableBody = document.getElementById('orders-table-body');
            console.log('🔍 테이블 바디 요소 확인:', tableBody);
            console.log('🔍 테이블 바디 부모 요소:', tableBody?.parentElement);
            console.log('🔍 테이블 바디 현재 내용:', tableBody?.innerHTML?.substring(0, 100));
            
            if (!tableBody) {
                console.error('❌ orders-table-body 요소를 찾을 수 없습니다.');
                console.log('🔍 DOM에서 테이블 관련 요소들:');
                console.log('  - orders-table-body:', document.getElementById('orders-table-body'));
                console.log('  - orders-table:', document.getElementById('orders-table'));
                console.log('  - order-management:', document.getElementById('order-management'));
                console.log('  - orders-section:', document.getElementById('orders-section'));
                console.log('  - 전체 DOM 구조 확인:');
                const allTables = document.querySelectorAll('table');
                allTables.forEach((table, index) => {
                    console.log(`    테이블 ${index + 1}:`, table.id, table.className);
                });
                return;
            }
            
            // 일괄 작업 버튼 영역 렌더링
            this.renderBulkActionButtons(filteredOrders.length);
            
            // 테이블 내용 렌더링
            if (filteredOrders.length === 0) {
                const isEmpty = !this._loadErrorMessage;
                const message = isEmpty ? '등록된 주문이 없습니다.' : '주문 목록을 불러올 수 없습니다.';
                const detail = this._loadErrorMessage ? `<p class="mt-1 text-red-600 text-[11px] max-w-md mx-auto">${String(this._loadErrorMessage).replace(/</g, '&lt;')}</p>` : '';
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" class="px-4 py-6 text-center text-gray-500 text-xs">
                            <i class="fas ${isEmpty ? 'fa-inbox' : 'fa-exclamation-triangle'} text-2xl ${isEmpty ? 'text-gray-300' : 'text-amber-400'} mb-1 block"></i>
                            <p>${message}</p>
                            ${detail}
                        </td>
                    </tr>
                `;
            } else {
                // 각 주문 행을 렌더링
                console.log('🔄 주문 행 렌더링 시작...');
                const rowsHTML = pagedOrders.map((order, index) => {
                    try {
                        console.log(`📝 주문 ${index + 1}/${filteredOrders.length} 렌더링:`, order.id);
                        const rowHTML = this.renderOrderRow(order);
                        console.log(`✅ 주문 ${index + 1} 렌더링 완료, HTML 길이:`, rowHTML.length);
                        return rowHTML;
                    } catch (rowError) {
                        console.error(`❌ 주문 ${order.id} 행 렌더링 실패:`, rowError);
                        return `
                            <tr>
                                <td colspan="9" class="px-6 py-4 text-center text-red-500">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    주문 데이터 오류 (ID: ${order.id})
                                </td>
                            </tr>
                        `;
                    }
                }).join('');
                
                console.log('📝 전체 HTML 생성 완료, 길이:', rowsHTML.length);
                console.log('🔍 HTML 미리보기:', rowsHTML.substring(0, 200));
                
                // 테이블 바디에 HTML 삽입
                tableBody.innerHTML = rowsHTML;
                console.log('✅ 테이블 바디 HTML 삽입 완료');
                
                // 삽입 후 확인
                console.log('🔍 삽입 후 테이블 바디 내용:', tableBody.innerHTML.substring(0, 200));
                console.log('🔍 삽입 후 테이블 바디 자식 요소 수:', tableBody.children.length);
            }
            
            console.log('✅ OrderDataManager: 주문 테이블 렌더링 완료');
            
        } catch (error) {
            console.error('❌ OrderDataManager: 주문 테이블 렌더링 실패:', error);
        }
    }
    
    // 일괄 작업 버튼 영역 렌더링
    renderBulkActionButtons(totalOrders) {
        try {
            const bar = document.getElementById('bulk-action-bar');
            const countEl = document.getElementById('bulk-selected-count');
            if (bar && countEl) {
                const n = this.selectedOrders.size;
                countEl.textContent = n;
                bar.classList.toggle('hidden', n === 0);
                return;
            }
            let bulkActionContainer = document.getElementById('bulk-action-container');
            if (!bulkActionContainer) {
                // 여러 위치에서 테이블 컨테이너 찾기
                let tableContainer = document.querySelector('.orders-table-container') || 
                                   document.getElementById('orders-table')?.parentElement ||
                                   document.querySelector('#order-management .table-container') ||
                                   document.querySelector('#order-management .overflow-x-auto') ||
                                   document.querySelector('#orders-section .overflow-x-auto') ||
                                   document.querySelector('#orders-section') ||
                                   document.querySelector('#order-management');
                
                if (!tableContainer) {
                    // 주문 관리 섹션 찾기
                    const orderManagement = document.getElementById('order-management');
                    const ordersSection = document.getElementById('orders-section');
                    if (orderManagement) {
                        tableContainer = orderManagement;
                    } else if (ordersSection) {
                        tableContainer = ordersSection;
                    }
                }
                
                if (tableContainer) {
                    bulkActionContainer = document.createElement('div');
                    bulkActionContainer.id = 'bulk-action-container';
                    bulkActionContainer.className = 'mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200';
                    tableContainer.insertBefore(bulkActionContainer, tableContainer.firstChild);
                    console.log('✅ 일괄 작업 버튼 컨테이너 생성 완료');
                } else {
                    console.error('❌ 테이블 컨테이너를 찾을 수 없습니다');
                    return;
                }
            }
            
            if (bulkActionContainer) {
                const selectedCount = this.selectedOrders.size;
                const isAnySelected = selectedCount > 0;
                
                bulkActionContainer.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <input type="checkbox" id="select-all-orders" class="rounded text-green-600 focus:ring-green-500 focus:ring-2" 
                                       ${this.isAllSelected ? 'checked' : ''} 
                                       onchange="toggleSelectAllOrders()">
                                <label for="select-all-orders" class="text-sm font-medium text-gray-700 cursor-pointer">
                                    전체 선택 (${totalOrders}개)
                                </label>
                            </div>
                            ${isAnySelected ? `
                                <div class="text-sm text-gray-600">
                                    <span class="font-semibold text-blue-600">${selectedCount}개</span> 선택됨
                                </div>
                            ` : ''}
                        </div>
                        
                        ${isAnySelected ? `
                            <div class="flex items-center space-x-2">
                                <div class="relative">
                                    <button onclick="showBulkStatusChangeModal()" 
                                            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                                        <i class="fas fa-edit"></i>
                                        <span>상태 변경</span>
                                    </button>
                                </div>
                                
                                <div class="relative">
                                    <button onclick="showBulkDeleteModal()" 
                                            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2">
                                        <i class="fas fa-trash"></i>
                                        <span>일괄 삭제</span>
                                    </button>
                                </div>
                                
                                <button onclick="clearSelectedOrders()" 
                                        class="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-times"></i>
                                    <span>선택 해제</span>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                console.log('✅ 일괄 작업 버튼 영역 렌더링 완료');
            }
            
        } catch (error) {
            console.error('❌ 일괄 작업 버튼 영역 렌더링 실패:', error);
        }
    }

    // 상품 요약 1줄: 단일 "상품명 × 수량", 복수 "대표상품 외 N건"
    getOrderProductSummary(order) {
        const items = order.items || [];
        if (!items.length) return '-';
        const first = items[0];
        const name = (first.product_name || '상품').trim() || '상품';
        const qty = first.quantity != null ? first.quantity : 1;
        if (items.length === 1) return name + ' × ' + qty;
        return name + ' 외 ' + (items.length - 1) + '건';
    }

    // 주문일 기준 D-Day (D+0, D+1 ...), D+2 이상 경고
    getOrderDDay(order) {
        const raw = order.order_date || order.created_at || order.createdAt;
        if (!raw) return { text: '-', warn: false };
        const d = new Date(raw);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diff = Math.floor((today - d) / (24 * 60 * 60 * 1000));
        return { text: 'D+' + diff, warn: diff >= 2 };
    }

    // SMS/출력 상태 텍스트 및 툴팁 (sms_sent_at, printed_at 없으면 미발송/출력대기)
    getSmsStatus(order) {
        const at = order.sms_sent_at;
        if (!at) return { label: '미발송', tip: '클릭하여 SMS 발송' };
        try {
            const t = new Date(at);
            const str = t.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return { label: '발송완료(' + str + ')', tip: '마지막 발송: ' + t.toLocaleString('ko-KR') };
        } catch (e) { return { label: '발송완료', tip: '' }; }
    }
    getPrintStatus(order) {
        const at = order.printed_at;
        if (!at) return { label: '출력대기', tip: '클릭하여 주문서 출력' };
        try {
            const t = new Date(at);
            return { label: '출력완료', tip: '마지막 출력: ' + t.toLocaleString('ko-KR') };
        } catch (e) { return { label: '출력완료', tip: '' }; }
    }

    // 주문 행 렌더링 (운영자 작업 화면: 고객명·상품요약 중심, D-Day, SMS/출력 상태, 밀도 조정)
    // ORDER_ROW_DATA_SPEC 10필드 row 객체(order_id, order_items_summary 등)와 legacy 주문 객체 모두 지원
    renderOrderRow(order) {
        try {
            const isRowSpec = order.order_id != null && order.order_items_summary !== undefined;
            const rowId = isRowSpec ? order.order_id : order.id;
            const orderStatus = order.order_status !== undefined ? order.order_status : (order.status || order.order_status || '주문접수');
            const statusColor = this.getStatusColor(orderStatus);
            const customerName = (order.customer_name || '고객명 없음').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const totalAmount = Number(order.total_amount) || 0;
            let orderNumber;
            if (order.order_number) {
                orderNumber = order.order_number.toString().replace(/</g, '&lt;');
            } else {
                // 주문번호 없는 기존 주문: 생성일+ID 끝 4자리로 폴백 번호 생성
                const createdAt = order.order_created_at || order.created_at;
                const uid = isRowSpec ? order.order_id : order.id;
                if (createdAt && uid) {
                    const d = new Date(createdAt);
                    const yy = String(d.getFullYear()).slice(2);
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd2 = String(d.getDate()).padStart(2, '0');
                    const shortId = uid.replace(/-/g, '').slice(-4).toUpperCase();
                    orderNumber = `ORD-${yy}${mm}${dd2}-${shortId}`;
                } else {
                    orderNumber = '-';
                }
            }
            const productSummary = isRowSpec
                ? String(order.order_items_summary ?? '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                : this.getOrderProductSummary(order).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            let ddayText, ddayWarn;
            if (isRowSpec) {
                if (order.d_day == null) {
                    ddayText = '-';
                    ddayWarn = false;
                } else {
                    ddayText = 'D+' + order.d_day;
                    ddayWarn = order.d_day >= 2;
                }
            } else {
                const dday = this.getOrderDDay(order);
                ddayText = dday.text;
                ddayWarn = dday.warn;
            }
            // 장기 미입금 강조: 입금대기 상태 + 3일 이상 경과
            const dNum = isRowSpec ? order.d_day : (ddayText !== '-' ? parseInt(ddayText.replace('D+','')) : null);
            const isOverdue = orderStatus === '입금대기' && dNum != null && dNum >= 3;

            const smsStatus = isRowSpec ? { label: '미발송', tip: '클릭하여 SMS 발송' } : this.getSmsStatus(order);
            const printStatus = isRowSpec ? { label: '출력대기', tip: '클릭하여 주문서 출력' } : this.getPrintStatus(order);
            const isSelected = this.selectedOrders.has(rowId);

            const nullDash = '<span class="td-null">—</span>';
            const rowBg = isSelected ? 'bg-indigo-50' : (isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50');
            return `
                <tr class="${rowBg} transition-colors border-b border-gray-100 cursor-pointer py-0"
                    onclick="openOrderDetailModal('${rowId}')"
                    title="클릭하여 주문 상세 보기">
                    <td class="px-2 text-center align-middle" onclick="event.stopPropagation()">
                        <input type="checkbox" class="order-checkbox rounded text-green-600 focus:ring-green-500 focus:ring-1"
                               data-order-id="${rowId}" ${isSelected ? 'checked' : ''}
                               onchange="toggleOrderSelection('${rowId}')">
                    </td>
                    <td class="px-2 text-center td-num ${(ddayWarn || isOverdue) ? 'text-red-600 font-semibold' : ''}">${ddayText === '-' ? nullDash : ddayText}${isOverdue ? ' ⚠' : ''}</td>
                    <td class="px-2 td-primary td-link">${customerName === '고객명 없음' ? nullDash : customerName}</td>
                    <td class="px-2 td-secondary" title="${productSummary}"><div class="max-w-[150px] truncate">${productSummary || nullDash}</div></td>
                    <td class="px-2 td-muted whitespace-nowrap">${orderNumber === '-' ? nullDash : orderNumber}</td>
                    <td class="px-2 td-amount text-right text-numeric">${totalAmount > 0 ? '₩' + totalAmount.toLocaleString() : nullDash}</td>
                    <td class="px-2 text-center align-middle relative" onclick="event.stopPropagation()">
                        <span class="badge ${statusColor} cursor-pointer"
                              onclick="event.stopPropagation(); toggleOrderStatusEdit('${rowId}', '${orderStatus}')" title="클릭하여 상태 변경">${orderStatus}</span>
                        <div id="status-edit-${rowId}" class="absolute left-0 top-full hidden z-50 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] max-h-48 overflow-y-auto">
                            ${this.standardOrderStatuses.map(s => `
                                <button class="w-full text-left px-2 text-xs hover:bg-gray-50 ${orderStatus === s.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}" 
                                        onclick="event.stopPropagation(); changeOrderStatus('${rowId}', '${s.value}')">${s.label}</button>
                            `).join('')}
                        </div>
                    </td>
                    <td class="px-2 text-center align-middle" onclick="event.stopPropagation()">
                        <span class="text-[11px] text-gray-600 cursor-pointer hover:text-blue-600" title="${printStatus.tip}" onclick="printOrder('${rowId}')">${printStatus.label}</span>
                    </td>
                    <td class="px-2 text-center align-middle" onclick="event.stopPropagation()">
                        <span class="text-[11px] text-gray-600 cursor-pointer hover:text-green-600" title="${smsStatus.tip}" onclick="sendSms('${rowId}')">${smsStatus.label}</span>
                    </td>
                    <td class="px-2 text-center align-middle whitespace-nowrap" onclick="event.stopPropagation()">
                        <div class="btn-group">
                            <button class="btn-icon btn-icon-edit" onclick="editOrder('${rowId}')" title="수정"><i class="fas fa-pen"></i></button>
                            <button class="btn-icon btn-icon-delete" onclick="deleteOrder('${rowId}')" title="삭제"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        } catch (error) {
            const rid = order.order_id ?? order.id;
            console.error(`❌ 주문 ${rid} 행 렌더링 실패:`, error);
            return `<tr><td colspan="10" class="px-4 py-2 text-center text-red-500 text-xs">주문 데이터 오류</td></tr>`;
        }
    }
    
    /**
     * ORDER_ROW_DATA_SPEC 13필드 row로 변환 (RPC get_order_rows 결과 전용).
     * 서버에서 계산한 값을 그대로 사용 (계산 없음, 매핑만).
     * 
     * 사용: loadOrders()에서 RPC 성공 시에만 호출.
     */
    toOrderRowSpecFromRpc(order) {
        // RPC get_order_rows 결과는 이미 ORDER_ROW_DATA_SPEC 13필드 형식이므로 그대로 반환
        return {
            order_id: order.order_id,
            order_created_at: order.order_created_at,
            d_day: order.d_day,
            customer_name: order.customer_name,
            customer_phone_last4: order.customer_phone_last4,
            order_items_summary: order.order_items_summary,
            items_subtotal: order.items_subtotal,
            shipping_fee: order.shipping_fee,
            discount_amount: order.discount_amount,
            total_amount: order.total_amount,
            payment_status: order.payment_status,
            order_status: order.order_status,
            delivery_status: order.delivery_status
        };
    }

    /**
     * ORDER_ROW_DATA_SPEC 13필드 row로 변환 (폴백 전용).
     * _loadOrdersFallback()에서만 사용. 클라이언트에서 계산 포함.
     * 
     * 경고: 프로덕션에서는 _loadOrdersFallback() 사용을 피하고 RPC만 사용해야 함.
     */
    toOrderRowSpecFromFallback(order) {
        const orderStatus = order.status || order.order_status || '주문접수';
        const createdAt = order.order_date || order.created_at || order.createdAt;
        const dday = this.getOrderDDay(order);
        const phone = String(order.customer_phone || '');
        const phoneLast4 = phone.replace(/\D/g, '').slice(-4);

        // 클라이언트 계산 (폴백 전용)
        const payment_status = orderStatus === '입금대기' ? null : '입금확인';
        const delivery_status = orderStatus === '배송완료' ? '배송완료' : '미등록';

        const itemsSub = order.items_subtotal != null ? Number(order.items_subtotal) : (Array.isArray(order.items) ? order.items.reduce((s, i) => s + (Number(i.total) || 0), 0) : 0);
        const ship = Number(order.shipping_fee) || 0;
        const disc = Number(order.discount_amount) || 0;
        return {
            order_id: order.id,
            order_created_at: createdAt ? new Date(createdAt).toISOString() : null,
            d_day: dday.text,
            customer_name: (order.customer_name || '').trim() || '고객명 없음',
            customer_phone_last4: phoneLast4,
            order_items_summary: this.getOrderProductSummary(order),
            items_subtotal: itemsSub,
            shipping_fee: ship,
            discount_amount: disc,
            total_amount: Number(order.total_amount) || 0,
            payment_status,
            order_status: orderStatus,
            delivery_status
        };
    }

    /**
     * @deprecated toOrderRowSpecFromRpc() 또는 toOrderRowSpecFromFallback() 사용 권장
     * 레거시 호환성 유지용. RPC 결과인지 자동 판단하지만, 명시적 분리 사용 권장.
     */
    toOrderRowSpec(order) {
        // RPC 결과인지 확인 (order_id와 order_items_summary가 있으면 RPC 결과로 간주)
        if (order.order_id != null && order.order_items_summary !== undefined) {
            return this.toOrderRowSpecFromRpc(order);
        }
        return this.toOrderRowSpecFromFallback(order);
    }

    /**
     * 현재 주문관리 목록(필터 적용된 목록)을 ORDER_ROW_DATA_SPEC 13개 필드만 담은 JSON 배열로 반환
     */
    getOrderRowSpecList() {
        const status = this.getCurrentFilterStatus();
        const orders = this.filterOrdersByStatus(status);
        // RPC 결과는 이미 ORDER_ROW_DATA_SPEC 형식이므로 그대로 사용 (계산 없음)
        return orders.map(o => this.toOrderRowSpecFromRpc(o));
    }

    // 상태별 배지 클래스 반환 — badge-* 시맨틱 컬러 팔레트
    getStatusColor(status) {
        const statusColors = {
            '주문접수': 'badge-warning',   // 노랑 — 처리 대기
            '고객안내': 'badge-info',       // 파랑 — 안내 중
            '입금대기': 'badge-orange',     // 주황 — 결제 대기
            '입금확인': 'badge-success',    // 초록 — 확인 완료
            '상품준비': 'badge-purple',     // 보라 — 처리 중
            '배송준비': 'badge-info',       // 파랑 — 출고 준비
            '배송중':   'badge-sky',        // 하늘 — 이동 중
            '배송완료': 'badge-success',    // 초록 — 완료
            '주문취소': 'badge-neutral',    // 회색 — 무효
            '환불완료': 'badge-danger',     // 빨강 — 반환
        };
        return statusColors[status] || 'badge-neutral';
    }

    // Supabase 실시간 동기화 설정
    setupRealtimeSync() {
        try {
            console.log('🔄 OrderDataManager: 실시간 동기화 설정 시작');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 없어 실시간 동기화를 설정할 수 없습니다.');
                return;
            }
            
            // farm_orders 테이블 변경 감지
            const subscription = window.supabaseClient
                .channel('farm_orders_changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'farm_orders' 
                    }, 
                    (payload) => {
                        console.log('🔄 주문 데이터 변경 감지:', payload);
                        
                        // 데이터 다시 로드
                        this.loadOrders().then(() => {
                            // 테이블 다시 렌더링
                            this.renderOrdersTable();
                            // 필터 카운트 업데이트
                            this.updateFilterCounts();
                            console.log('✅ 실시간 동기화 완료');
                        });
                    }
                )
                .subscribe();
            
            console.log('✅ OrderDataManager: 실시간 동기화 설정 완료');
            return subscription;
            
        } catch (error) {
            console.error('❌ OrderDataManager: 실시간 동기화 설정 실패:', error);
        }
    }

    // 주문상태 편집 토글
    toggleOrderStatusEdit(orderId, currentStatus) {
        // 다른 열린 편집창 닫기
        document.querySelectorAll('[id^="status-edit-"]').forEach(element => {
            if (element.id !== `status-edit-${orderId}`) {
                element.classList.add('hidden');
            }
        });
        
        // 현재 편집창 토글
        const editElement = document.getElementById(`status-edit-${orderId}`);
        if (editElement) {
            editElement.classList.toggle('hidden');
        }
    }
    
    // 주문상태 편집창 닫기
    closeOrderStatusEdit(orderId) {
        const editElement = document.getElementById(`status-edit-${orderId}`);
        if (editElement) {
            editElement.classList.add('hidden');
        }
    }
    
    // 주문상태 변경
    async changeOrderStatus(orderId, newStatus, refundReason = null) {
        // 환불완료 시 사유 입력 모달 먼저 표시
        if (newStatus === '환불완료' && refundReason === null) {
            this._showRefundReasonModal(orderId);
            return;
        }

        try {
            console.log('주문상태 변경:', { orderId, newStatus });

            // 로딩 상태 표시
            const statusElement = document.querySelector(`[onclick*="toggleOrderStatusEdit('${orderId}'"]`);
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <div class="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span>변경 중...</span>
                    </div>
                `;
            }

            // Supabase 클라이언트 확인
            if (!window.supabaseClient) {
                console.error('❌ Supabase 클라이언트가 연결되지 않았습니다');
                alert('데이터베이스 연결이 필요합니다.');
                return;
            }

            // 업데이트 데이터 구성 (환불 사유 있으면 memo에 추가)
            const updateData = {
                order_status: newStatus,
                updated_at: new Date().toISOString()
            };
            if (refundReason) {
                const { data: ord } = await window.supabaseClient
                    .from('farm_orders').select('memo').eq('id', orderId).single();
                const prevMemo = ord?.memo || '';
                const dateStr = new Date().toLocaleDateString('ko-KR');
                updateData.memo = prevMemo
                    ? `${prevMemo}\n[환불사유 ${dateStr}] ${refundReason}`
                    : `[환불사유 ${dateStr}] ${refundReason}`;
            }

            // Supabase 업데이트
            const { error } = await window.supabaseClient
                .from('farm_orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) {
                console.error('❌ 주문상태 업데이트 실패:', error);
                alert('주문상태 업데이트에 실패했습니다: ' + error.message);
                return;
            }

            console.log('✅ 주문상태 업데이트 완료');

            // 주문 취소/환불 시 고객 구매 금액 차감 및 재고 복원 처리
            if (newStatus === '주문취소' || newStatus === '환불완료') {
                await this.handleOrderCancellation(orderId);
                await this.restoreProductStock(orderId);
            }

            const orderIndex = (this.farm_orders || []).findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                this.farm_orders[orderIndex].order_status = newStatus;
                this.farm_orders[orderIndex].status = newStatus;
                this.farm_orders[orderIndex].updated_at = new Date().toISOString();
            }
            await this.invalidateOrderCache();
            this.closeOrderStatusEdit(orderId);
            await this.loadOrders();
            this.renderOrdersTable();
            this.updateFilterCounts();

            // 성공 메시지
            this.showStatusChangeSuccess(orderId, newStatus);

            // 입금확인 시 SMS 발송 옵션 제공
            if (newStatus === '입금확인') {
                setTimeout(() => {
                    if (confirm('입금확인 문자를 발송할까요?')) {
                        if (window.showSMSTemplateModal) {
                            window.showSMSTemplateModal(orderId);
                            setTimeout(() => {
                                const sel = document.getElementById('sms-template-select');
                                if (sel) { sel.value = 'paymentConfirm'; sel.dispatchEvent(new Event('change')); }
                            }, 150);
                        }
                    }
                }, 300);
            }

        } catch (error) {
            console.error('❌ 주문상태 변경 실패:', error);
            alert('주문상태 변경에 실패했습니다: ' + error.message);
        }
    }

    // 환불 사유 입력 모달
    _showRefundReasonModal(orderId) {
        const existing = document.getElementById('refund-reason-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'refund-reason-modal';
        modal.className = 'fixed inset-0 z-[600] flex items-center justify-center';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
            <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span class="font-semibold text-gray-800 text-sm"><i class="fas fa-undo text-red-500 mr-2"></i>환불 사유 입력</span>
                    <button id="refund-modal-close" class="text-gray-400 hover:text-gray-600 p-1"><i class="fas fa-times text-sm"></i></button>
                </div>
                <div class="px-4 py-3">
                    <textarea id="refund-reason-input" rows="3"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 resize-none"
                        placeholder="환불 사유를 입력하세요 (예: 상품 불량, 단순 변심 등)"></textarea>
                </div>
                <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-100">
                    <button id="refund-modal-cancel" class="btn-secondary">취소</button>
                    <button id="refund-modal-confirm" class="btn-primary"><i class="fas fa-check mr-1"></i>환불완료 처리</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelector('#refund-modal-close').addEventListener('click', close);
        modal.querySelector('#refund-modal-cancel').addEventListener('click', close);
        modal.querySelector('#refund-modal-confirm').addEventListener('click', async () => {
            const reason = modal.querySelector('#refund-reason-input').value.trim();
            modal.remove();
            await this.changeOrderStatus(orderId, '환불완료', reason || '사유 없음');
        });
        modal.querySelector('#refund-reason-input').focus();
    }
    
    // 상태 변경 성공 메시지 표시
    showStatusChangeSuccess(orderId, newStatus) {
        // 임시 성공 메시지 표시
        const statusElement = document.querySelector(`[onclick*="toggleOrderStatusEdit('${orderId}'"]`);
        if (statusElement) {
            const statusColor = this.getStatusColor(newStatus);
            statusElement.innerHTML = `
                <span class="badge ${statusColor} cursor-pointer"
                      onclick="toggleOrderStatusEdit('${orderId}', '${newStatus}')"
                      title="클릭하여 주문상태 변경">
                    ${newStatus}
                </span>
            `;
            
            // 성공 애니메이션
            statusElement.classList.add('animate-bounce');
            setTimeout(() => {
                statusElement.classList.remove('animate-bounce');
            }, 1000);
            
            // 성공 토스트 메시지 표시
            this.showToastMessage(`주문상태가 "${newStatus}"로 변경되었습니다.`, 'success');
        }
    }
    
    // 주문 취소/환불 시 고객 구매 금액 차감 처리
    async handleOrderCancellation(orderId) {
        try {
            console.log('🔄 주문 취소/환불 처리 시작:', orderId);
            
            // 주문 정보 조회
            const order = this.farm_orders.find(o => o.id === orderId);
            if (!order) {
                console.error('❌ 주문을 찾을 수 없습니다:', orderId);
                return;
            }
            
            // 고객 전화번호와 주문 금액 확인
            const customerPhone = order.customer_phone;
            const orderAmount = order.total_amount || 0;
            
            if (!customerPhone || orderAmount <= 0) {
                console.warn('⚠️ 고객 정보 또는 주문 금액이 없습니다:', { customerPhone, orderAmount });
                return;
            }
            
            console.log(`💰 고객 구매 금액 차감 처리: ${customerPhone}, ${orderAmount.toLocaleString()}원`);
            
            // 고객 구매 금액 차감 및 등급 재계산
            await this.deductCustomerPurchaseAmount(customerPhone, orderAmount);
            
        } catch (error) {
            console.error('❌ 주문 취소/환불 처리 실패:', error);
        }
    }
    
    // 고객 구매 금액 차감 및 등급 재계산
    async deductCustomerPurchaseAmount(customerPhone, deductAmount) {
        try {
            console.log(`🔄 고객 구매 금액 차감 시작: ${customerPhone}, 차감액: ${deductAmount.toLocaleString()}원`);
            
            if (!window.supabaseClient) {
                console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
                return;
            }
            
            // 고객 정보 조회
            const { data: customer, error: customerError } = await window.supabaseClient
                .from('farm_customers')
                .select('id, phone, total_purchase_amount, grade')
                .eq('phone', customerPhone)
                .single();
            
            if (customerError || !customer) {
                console.warn('⚠️ 고객 정보를 찾을 수 없습니다:', customerPhone);
                return;
            }
            
            // 총 구매금액에서 차감 (0보다 작아지지 않도록)
            const currentAmount = customer.total_purchase_amount || 0;
            const newTotalAmount = Math.max(0, currentAmount - deductAmount);
            
            console.log(`📊 고객 총 구매금액 차감: ${currentAmount.toLocaleString()}원 → ${newTotalAmount.toLocaleString()}원`);
            
            // 고객등급 재계산 및 업데이트
            if (window.updateCustomerGrade) {
                await window.updateCustomerGrade(customer.id, newTotalAmount);
                console.log('✅ 고객 구매 금액 차감 및 등급 재계산 완료');
            } else {
                console.warn('⚠️ updateCustomerGrade 함수를 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 고객 구매 금액 차감 실패:', error);
        }
    }
    
    // 주문 취소/환불 시 상품 재고 복원
    // Fix #5/#6: farm_order_items를 DB에서 직접 조회 (this.farm_orders.items에 의존하지 않음)
    async restoreProductStock(orderId) {
        try {
            console.log('🔄 상품 재고 복원 시작:', orderId);

            if (!window.supabaseClient) {
                console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
                return;
            }

            // farm_order_items에서 직접 조회 (메모리의 farm_orders.items에 의존하지 않음)
            const { data: orderItems, error: itemsError } = await window.supabaseClient
                .from('farm_order_items')
                .select('product_id, product_name, quantity')
                .eq('order_id', orderId);

            if (itemsError) {
                console.error('❌ 주문 아이템 조회 실패:', itemsError);
                return;
            }
            if (!orderItems || orderItems.length === 0) {
                console.warn('⚠️ 복원할 주문 아이템이 없습니다:', orderId);
                return;
            }

            console.log(`📦 재고 복원할 상품 수: ${orderItems.length}개`);

            for (const item of orderItems) {
                try {
                    const quantity = parseInt(item.quantity) || 0;
                    if (!item.product_id || quantity <= 0) continue;

                    const { data: product } = await window.supabaseClient
                        .from('farm_products')
                        .select('id, name, stock')
                        .eq('id', item.product_id)
                        .maybeSingle();

                    if (!product) {
                        console.warn(`⚠️ 상품을 찾을 수 없습니다 (id: ${item.product_id}, 이름: ${item.product_name})`);
                        continue;
                    }

                    const newStock = (product.stock || 0) + quantity;
                    const { error: updateError } = await window.supabaseClient
                        .from('farm_products')
                        .update({ stock: newStock, updated_at: new Date().toISOString() })
                        .eq('id', product.id);

                    if (updateError) {
                        console.error(`❌ 재고 복원 실패: ${product.name}`, updateError);
                    } else {
                        console.log(`✅ 재고 복원: ${product.name} (+${quantity}개) → ${newStock}개`);
                    }
                } catch (itemError) {
                    console.error('❌ 아이템 재고 복원 오류:', itemError);
                }
            }

            console.log('✅ 상품 재고 복원 완료');

        } catch (error) {
            console.error('❌ 상품 재고 복원 실패:', error);
        }
    }

    // 전체 선택 토글
    toggleSelectAllOrders() {
        try {
            console.log('🔄 전체 선택 토글 시작');
            
            const selectAllCheckbox = document.getElementById('select-all-orders');
            if (!selectAllCheckbox) {
                console.error('❌ 전체 선택 체크박스를 찾을 수 없습니다');
                return;
            }
            
            this.isAllSelected = selectAllCheckbox.checked;
            console.log('📊 전체 선택 상태:', this.isAllSelected);
            
            // 현재 필터링된 주문들 가져오기
            const currentStatus = this.getCurrentFilterStatus();
            const filteredOrders = this.filterOrdersByStatus(currentStatus);
            
            if (this.isAllSelected) {
                // 모든 주문 선택
                filteredOrders.forEach(order => {
                    this.selectedOrders.add(order.id);
                });
                console.log(`✅ ${filteredOrders.length}개 주문 전체 선택 완료`);
            } else {
                // 모든 선택 해제
                this.selectedOrders.clear();
                console.log('✅ 모든 주문 선택 해제 완료');
            }
            
            // 체크박스 상태 업데이트
            document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                checkbox.checked = this.isAllSelected;
            });
            
            // 일괄 작업 버튼 영역 다시 렌더링 (강제로 표시)
            this.renderBulkActionButtons(filteredOrders.length);
            
            // 선택된 주문이 있으면 일괄 작업 버튼 강제 표시
            if (this.selectedOrders.size > 0) {
                this.forceShowBulkActionButtons();
            }
            
            console.log('✅ 전체 선택 토글 완료');
            
        } catch (error) {
            console.error('❌ 전체 선택 토글 실패:', error);
        }
    }
    
    // 일괄 작업 버튼 강제 표시
    forceShowBulkActionButtons() {
        try {
            console.log('🔄 일괄 작업 버튼 강제 표시');
            
            let bulkActionContainer = document.getElementById('bulk-action-container');
            if (!bulkActionContainer) {
                // 주문 관리 섹션에 직접 추가
                const orderManagement = document.getElementById('order-management') || document.getElementById('orders-section');
                if (orderManagement) {
                    bulkActionContainer = document.createElement('div');
                    bulkActionContainer.id = 'bulk-action-container';
                    bulkActionContainer.className = 'mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-lg';
                    orderManagement.insertBefore(bulkActionContainer, orderManagement.firstChild);
                    console.log('✅ 일괄 작업 버튼 컨테이너 강제 생성 완료');
                }
            }
            
            if (bulkActionContainer) {
                const selectedCount = this.selectedOrders.size;
                bulkActionContainer.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-gray-600">
                                <span class="font-semibold text-blue-600">${selectedCount}개</span> 주문이 선택되었습니다
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <button onclick="showBulkStatusChangeModal()" 
                                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 shadow-md">
                                <i class="fas fa-edit"></i>
                                <span>상태 변경</span>
                            </button>
                            
                            <button onclick="showBulkDeleteModal()" 
                                    class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 shadow-md">
                                <i class="fas fa-trash"></i>
                                <span>일괄 삭제</span>
                            </button>
                            
                            <button onclick="clearSelectedOrders()" 
                                    class="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2 shadow-md">
                                <i class="fas fa-times"></i>
                                <span>선택 해제</span>
                            </button>
                        </div>
                    </div>
                `;
                console.log('✅ 일괄 작업 버튼 강제 표시 완료');
            }
            
        } catch (error) {
            console.error('❌ 일괄 작업 버튼 강제 표시 실패:', error);
        }
    }
    
    // 개별 주문 선택 토글
    toggleOrderSelection(orderId) {
        try {
            console.log('🔄 개별 주문 선택 토글:', orderId);
            
            if (this.selectedOrders.has(orderId)) {
                this.selectedOrders.delete(orderId);
                console.log('✅ 주문 선택 해제:', orderId);
            } else {
                this.selectedOrders.add(orderId);
                console.log('✅ 주문 선택:', orderId);
            }
            
            // 현재 필터링된 주문들 가져오기
            const currentStatus = this.getCurrentFilterStatus();
            const filteredOrders = this.filterOrdersByStatus(currentStatus);
            
            // 전체 선택 체크박스 상태 업데이트
            const selectAllCheckbox = document.getElementById('select-all-orders');
            if (selectAllCheckbox) {
                const allFilteredSelected = filteredOrders.every(order => this.selectedOrders.has(order.id));
                selectAllCheckbox.checked = allFilteredSelected;
                this.isAllSelected = allFilteredSelected;
            }
            
            // 일괄 작업 버튼 영역 다시 렌더링
            this.renderBulkActionButtons(filteredOrders.length);
            
            // 선택된 주문이 있으면 일괄 작업 버튼 강제 표시
            if (this.selectedOrders.size > 0) {
                this.forceShowBulkActionButtons();
            }
            
            console.log('✅ 개별 주문 선택 토글 완료');
            
        } catch (error) {
            console.error('❌ 개별 주문 선택 토글 실패:', error);
        }
    }
    
    // 선택된 주문들 해제
    clearSelectedOrders() {
        try {
            console.log('🔄 선택된 주문들 해제 시작');
            
            this.selectedOrders.clear();
            this.isAllSelected = false;
            
            // 체크박스 상태 업데이트
            document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            const selectAllCheckbox = document.getElementById('select-all-orders');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            
            // 현재 필터링된 주문들 가져오기
            const currentStatus = this.getCurrentFilterStatus();
            const filteredOrders = this.filterOrdersByStatus(currentStatus);
            
            // 일괄 작업 버튼 영역 다시 렌더링
            this.renderBulkActionButtons(filteredOrders.length);
            
            console.log('✅ 선택된 주문들 해제 완료');
            
        } catch (error) {
            console.error('❌ 선택된 주문들 해제 실패:', error);
        }
    }
    
    // 현재 필터 상태 가져오기 (활성화된 status-tab-btn 기준)
    getCurrentFilterStatus() {
        const active = document.querySelector('.status-tab-btn.active');
        if (active && active.id && active.id.startsWith('status-')) {
            return active.id.replace('status-', '');
        }
        return 'work_todo';
    }
    
    // 선택 주문 일괄 상태 변경 (한 번에 적용, 모달 없음)
    async bulkSetStatus(newStatus) {
        const ids = Array.from(this.selectedOrders);
        if (!ids.length) return;
        try {
            for (const orderId of ids) {
                await this.changeOrderStatus(orderId, newStatus);
            }
            this.clearSelectedOrders();
            const current = this.getCurrentFilterStatus();
            this.renderOrdersTable(current);
            this.updateFilterCounts();
        } catch (e) {
            console.error('❌ 일괄 상태 변경 실패:', e);
            alert('일괄 상태 변경 중 오류가 발생했습니다.');
        }
    }

    // 일괄 상태 변경 모달 표시
    showBulkStatusChangeModal() {
        try {
            const selectedCount = this.selectedOrders.size;
            if (selectedCount === 0) {
                alert('선택된 주문이 없습니다.');
                return;
            }
            
            // 모달 HTML 생성
            const modalHTML = `
                <div id="bulk-status-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">일괄 상태 변경</h3>
                                <button onclick="closeBulkStatusModal()" class="text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div class="mb-4">
                                <p class="text-sm text-gray-600 mb-3">
                                    <span class="font-semibold text-blue-600">${selectedCount}개</span> 주문의 상태를 변경합니다.
                                </p>
                                
                                <div class="space-y-2 max-h-64 overflow-y-auto">
                                    ${this.standardOrderStatuses.map(status => `
                                        <button class="w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-300" 
                                                onclick="executeBulkStatusChange('${status.value}')">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-4 h-4 rounded-full shadow-sm" style="background-color: ${status.color}"></div>
                                                <div class="flex-1">
                                                    <div class="font-medium text-gray-900">${status.label}</div>
                                                    <div class="text-xs text-gray-500">${status.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="flex justify-end space-x-2">
                                <button onclick="closeBulkStatusModal()" 
                                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 기존 모달 제거
            const existingModal = document.getElementById('bulk-status-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 새 모달 추가
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            console.log('✅ 일괄 상태 변경 모달 표시 완료');
            
        } catch (error) {
            console.error('❌ 일괄 상태 변경 모달 표시 실패:', error);
        }
    }
    
    // 일괄 상태 변경 실행
    async executeBulkStatusChange(newStatus) {
        try {
            console.log('🔄 일괄 상태 변경 실행:', newStatus);
            
            const selectedOrderIds = Array.from(this.selectedOrders);
            if (selectedOrderIds.length === 0) {
                alert('선택된 주문이 없습니다.');
                return;
            }
            
            // 확인 대화상자
            const confirmed = confirm(`선택된 ${selectedOrderIds.length}개 주문의 상태를 "${newStatus}"로 변경하시겠습니까?`);
            if (!confirmed) {
                return;
            }
            
            // 로딩 상태 표시
            this.showToastMessage('주문 상태를 변경하는 중...', 'info');
            
            let successCount = 0;
            let errorCount = 0;
            
            // 각 주문의 상태 변경
            for (const orderId of selectedOrderIds) {
                try {
                    await this.changeOrderStatus(orderId, newStatus);
                    successCount++;
                } catch (error) {
                    console.error(`❌ 주문 ${orderId} 상태 변경 실패:`, error);
                    errorCount++;
                }
            }
            
            // 결과 표시
            if (errorCount === 0) {
                this.showToastMessage(`${successCount}개 주문의 상태가 "${newStatus}"로 변경되었습니다.`, 'success');
            } else {
                this.showToastMessage(`${successCount}개 성공, ${errorCount}개 실패`, 'error');
            }
            
            // 선택 해제
            this.clearSelectedOrders();
            
            // 모달 닫기
            this.closeBulkStatusModal();
            
            console.log('✅ 일괄 상태 변경 실행 완료');
            
        } catch (error) {
            console.error('❌ 일괄 상태 변경 실행 실패:', error);
            this.showToastMessage('일괄 상태 변경에 실패했습니다.', 'error');
        }
    }
    
    // 일괄 상태 변경 모달 닫기
    closeBulkStatusModal() {
        const modal = document.getElementById('bulk-status-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // 일괄 삭제 모달 표시
    showBulkDeleteModal() {
        try {
            console.log('🔄 일괄 삭제 모달 표시');
            
            const selectedCount = this.selectedOrders.size;
            if (selectedCount === 0) {
                alert('선택된 주문이 없습니다.');
                return;
            }
            
            // 확인 대화상자
            const confirmed = confirm(`선택된 ${selectedCount}개 주문을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
            if (!confirmed) {
                return;
            }
            
            this.executeBulkDelete();
            
        } catch (error) {
            console.error('❌ 일괄 삭제 모달 표시 실패:', error);
        }
    }
    
    // 일괄 삭제 실행
    async executeBulkDelete() {
        try {
            console.log('🔄 일괄 삭제 실행');
            
            const selectedOrderIds = Array.from(this.selectedOrders);
            if (selectedOrderIds.length === 0) {
                alert('선택된 주문이 없습니다.');
                return;
            }
            
            // 로딩 상태 표시
            this.showToastMessage('주문을 삭제하는 중...', 'info');
            
            let successCount = 0;
            let errorCount = 0;
            
            // 각 주문 삭제
            for (const orderId of selectedOrderIds) {
                try {
                    await this.deleteOrder(orderId);
                    successCount++;
                } catch (error) {
                    console.error(`❌ 주문 ${orderId} 삭제 실패:`, error);
                    errorCount++;
                }
            }
            
            // 결과 표시
            if (errorCount === 0) {
                this.showToastMessage(`${successCount}개 주문이 삭제되었습니다.`, 'success');
            } else {
                this.showToastMessage(`${successCount}개 성공, ${errorCount}개 실패`, 'error');
            }
            
            // 선택 해제
            this.clearSelectedOrders();
            
            // 테이블 다시 렌더링
            this.renderOrdersTable();
            this.updateFilterCounts();
            
            console.log('✅ 일괄 삭제 실행 완료');
            
        } catch (error) {
            console.error('❌ 일괄 삭제 실행 실패:', error);
            this.showToastMessage('일괄 삭제에 실패했습니다.', 'error');
        }
    }

    // 토스트 메시지 표시
    showToastMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 애니메이션으로 표시
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 초기화 함수
    async init() {
        console.log('🚀 OrderDataManager 초기화 시작...');
        
        try {
            // 주문 데이터 로드
            await this.loadOrders();
            
            // 실시간 동기화 설정
            this.setupRealtimeSync();
            
            console.log('✅ OrderDataManager 초기화 완료!');
            return true;
        } catch (error) {
            console.error('❌ OrderDataManager 초기화 실패:', error);
            return false;
        }
    }
}

// 인스턴스 생성
const orderDataManager = new OrderDataManager();

// 전역 인스턴스 생성
window.orderDataManager = orderDataManager;
/** 대시보드 등에서 get_order_rows 기반 카운트 사용 (단일 소스) */
window.computeCountsFromOrderRows = computeCountsFromOrderRows;

// 전역 함수들 등록
window.toggleOrderStatusEdit = (orderId, currentStatus) => {
    orderDataManager.toggleOrderStatusEdit(orderId, currentStatus);
};

window.closeOrderStatusEdit = (orderId) => {
    orderDataManager.closeOrderStatusEdit(orderId);
};

window.changeOrderStatus = (orderId, newStatus) => {
    orderDataManager.changeOrderStatus(orderId, newStatus);
};

// 일괄 선택 관련 전역 함수들
window.toggleSelectAllOrders = () => {
    orderDataManager.toggleSelectAllOrders();
};

window.toggleOrderSelection = (orderId) => {
    orderDataManager.toggleOrderSelection(orderId);
};

window.bulkSetStatus = (status) => {
    if (window.orderDataManager && window.orderDataManager.bulkSetStatus) {
        window.orderDataManager.bulkSetStatus(status);
    }
};
window.clearSelectedOrders = () => {
    orderDataManager.clearSelectedOrders();
};

window.showBulkStatusChangeModal = () => {
    orderDataManager.showBulkStatusChangeModal();
};

window.executeBulkStatusChange = (newStatus) => {
    orderDataManager.executeBulkStatusChange(newStatus);
};

window.closeBulkStatusModal = () => {
    orderDataManager.closeBulkStatusModal();
};

window.showBulkDeleteModal = () => {
    orderDataManager.showBulkDeleteModal();
};

var ORDER_ROW_ORDER_STATUS_ALLOWED = ['주문접수','고객안내','입금대기','입금확인','상품준비','배송준비','배송중','배송완료','주문취소'];
var ORDER_ROW_DELIVERY_STATUS_ALLOWED = ['미등록','배송완료'];
var ORDER_ROW_PAYMENT_STATUS_ALLOWED = ['입금확인'];

/**
 * ORDER_ROW_DATA_SPEC 검증. Enum 범위 밖 값이 있으면 로그/에러로 즉시 검출.
 */
window.validateOrderRowSpec = function () {
    if (!window.orderDataManager) {
        console.warn('orderDataManager 없음');
        return { ok: false };
    }
    var dm = window.orderDataManager;
    var filterStatus = dm.getCurrentFilterStatus();
    var orders = dm.filterOrdersByStatus(filterStatus);
    // RPC 결과는 이미 ORDER_ROW_DATA_SPEC 형식이므로 그대로 사용 (계산 없음)
    var rows = orders.map(function (o) { return dm.toOrderRowSpecFromRpc(o); });

    var FIELD_NAMES = ['order_id', 'order_created_at', 'd_day', 'customer_name', 'customer_phone_last4', 'order_items_summary', 'items_subtotal', 'shipping_fee', 'discount_amount', 'total_amount', 'payment_status', 'order_status', 'delivery_status'];
    var NULL_ALLOWED = { d_day: true, payment_status: true, customer_phone_last4: true };
    var summary = {};
    var enumObserved = { order_status: new Set(), payment_status: new Set(), delivery_status: new Set() };
    var failCount = 0;
    var enumFailOrders = [];

    FIELD_NAMES.forEach(function (f) {
        summary[f] = { undefined: 0, null: 0 };
    });
    rows.forEach(function (r) {
        var hasFail = false;
        FIELD_NAMES.forEach(function (f) {
            var v = r[f];
            if (v === undefined) { summary[f].undefined += 1; if (!NULL_ALLOWED[f]) hasFail = true; }
            else if (v === null) { summary[f].null += 1; if (!NULL_ALLOWED[f]) hasFail = true; }
            if (f === 'order_status' && v != null) { enumObserved.order_status.add(v); if (ORDER_ROW_ORDER_STATUS_ALLOWED.indexOf(v) === -1) { hasFail = true; enumFailOrders.push({ order_id: r.order_id, field: 'order_status', value: v }); } }
            if (f === 'payment_status' && v != null) { enumObserved.payment_status.add(v); if (ORDER_ROW_PAYMENT_STATUS_ALLOWED.indexOf(v) === -1) { hasFail = true; enumFailOrders.push({ order_id: r.order_id, field: 'payment_status', value: v }); } }
            if (f === 'delivery_status' && v != null) { enumObserved.delivery_status.add(v); if (ORDER_ROW_DELIVERY_STATUS_ALLOWED.indexOf(v) === -1) { hasFail = true; enumFailOrders.push({ order_id: r.order_id, field: 'delivery_status', value: v }); } }
        });
        if (hasFail) failCount += 1;
    });

    if (enumFailOrders.length) {
        console.error('validateOrderRowSpec — Enum 범위 밖 값 검출:', enumFailOrders);
    }

    var dDaySummaryChecks = { dDayMismatch: [], summarySample: [] };
    rows.forEach(function (r) {
        var st = r.order_status;
        var expectDdayNull = st === '배송완료' || st === '주문취소';
        if (expectDdayNull && r.d_day != null) {
            dDaySummaryChecks.dDayMismatch.push({ order_id: r.order_id, order_status: st, d_day: r.d_day, expected: null });
        }
        if (dDaySummaryChecks.summarySample.length < 5 && r.order_items_summary != null) {
            dDaySummaryChecks.summarySample.push({ order_id: r.order_id, order_items_summary: r.order_items_summary });
        }
    });
    if (dDaySummaryChecks.dDayMismatch.length) {
        console.warn('validateOrderRowSpec — d_day 규칙 불일치(완료/취소는 null 기대):', dDaySummaryChecks.dDayMismatch);
    }

    console.log('validateOrderRowSpec — filterStatus:', filterStatus, '| 검사 건수:', rows.length);
    console.table(rows.slice(0, 20));
    console.log('--- 필드별 누락(undefined/null) 집계 ---');
    console.log(summary);
    console.log('--- Enum observed ---');
    console.log('order_status:', Array.from(enumObserved.order_status));
    console.log('payment_status:', Array.from(enumObserved.payment_status));
    console.log('delivery_status:', Array.from(enumObserved.delivery_status));
    console.log('--- d_day/summary 검증 (ORDER_ROW_DATA_SPEC 규칙) ---');
    console.log('d_day 불일치 건수:', dDaySummaryChecks.dDayMismatch.length, '(완료/취소 시 null 기대)');
    console.log('order_items_summary 샘플:', dDaySummaryChecks.summarySample);
    console.log('--- 검증 요약 ---');
    console.log('failCount:', failCount, '/', rows.length);

    return {
        ok: failCount === 0,
        failCount: failCount,
        total: rows.length,
        summary: summary,
        enumObserved: {
            order_status: Array.from(enumObserved.order_status),
            payment_status: Array.from(enumObserved.payment_status),
            delivery_status: Array.from(enumObserved.delivery_status)
        },
        enumFailOrders: enumFailOrders,
        dDaySummaryChecks: dDaySummaryChecks
    };
};

/**
 * 테스트용: 주문관리 테이블에 실제로 전달되는 "렌더링 직전 데이터"(filteredOrders)를 콘솔에 출력.
 * renderOrdersTable과 동일: farm_order_rows 우선(있으면) → filterOrdersByStatus(getCurrentFilterStatus()).
 * 개발자 콘솔에서 수동 호출. ORDER_ROW_DATA_SPEC / 10개 필드와 무관.
 */
window.logRenderedOrderRows = function () {
    if (!window.orderDataManager) {
        console.warn('orderDataManager 없음');
        return;
    }
    var filterStatus = orderDataManager.getCurrentFilterStatus();
    var filteredOrders = orderDataManager.filterOrdersByStatus(filterStatus);
    var useRows = Array.isArray(orderDataManager.farm_order_rows) && orderDataManager.farm_order_rows.length > 0;
    console.log('주문관리 테이블 렌더링 직전 데이터 (filteredOrders)');
    console.log('filterStatus:', filterStatus, '| count:', filteredOrders.length);
    console.log('data source:', useRows ? 'farm_order_rows → filterOrdersByStatus' : 'farm_orders → filterOrdersByStatus');
    console.log(filteredOrders);
    return filteredOrders;
};

/**
 * 현재 화면에 보이는 목록과 동일 건수의 ORDER_ROW_DATA_SPEC 10필드 JSON 출력.
 * getOrderRowSpecList() = 단일 소스(get_order_rows) 기반 필터 결과와 동일.
 */
window.logOrderRowSpec = function () {
    if (!window.orderDataManager) {
        console.warn('orderDataManager 없음');
        return [];
    }
    var rows = orderDataManager.getOrderRowSpecList();
    console.log('ORDER_ROW_DATA_SPEC (10 fields), 전체 건수:', rows.length);
    console.table(rows);
    console.log(JSON.stringify(rows, null, 2));
    return rows;
};

/**
 * 검증: 목록 행 수와 탭 카운트(all) 일치 여부. 카운트는 get_order_rows rows 기반이므로 일치해야 함.
 */
window.verifyOrderCountsMatch = function () {
    if (!window.orderDataManager) {
        console.warn('orderDataManager 없음');
        return null;
    }
    var dm = window.orderDataManager;
    var listLen = Array.isArray(dm.farm_order_rows) ? dm.farm_order_rows.length : 0;
    var countRows = dm._lastCountRows || [];
    var allRow = countRows.find(function (r) { return r.status_key === 'all'; });
    var countAll = allRow != null ? Number(allRow.count) : NaN;
    var statusKeys = ['주문접수','고객안내','입금대기','입금확인','상품준비','배송준비','배송중','배송완료','주문취소','환불완료'];
    var sumByStatus = 0;
    statusKeys.forEach(function (k) {
        var r = countRows.find(function (x) { return x.status_key === k; });
        if (r) sumByStatus += Number(r.count) || 0;
    });
    var ok = (listLen === countAll && sumByStatus === countAll);
    console.log('verifyOrderCountsMatch — 목록 행 수 = 탭 카운트(all) 일치 여부');
    console.log('  목록 행 수(farm_order_rows.length):', listLen);
    console.log('  탭 카운트(status_key=all):', countAll);
    console.log('  상태별 count 합계(주문접수~환불완료):', sumByStatus);
    console.log('  일치:', ok ? '예' : '아니오');
    return { listLen: listLen, countAll: countAll, sumByStatus: sumByStatus, ok: ok };
};

/**
 * 검증용: 상위 n건 샘플만 d_day / order_items_summary / items_subtotal 중심으로 콘솔 출력.
 * get_order_rows 규칙대로 나오는지 확인. 예: logOrderRowSpecSamples(3)
 */
window.logOrderRowSpecSamples = function (n) {
    if (!window.orderDataManager) {
        console.warn('orderDataManager 없음');
        return [];
    }
    n = Math.max(1, parseInt(n, 10) || 3);
    var rows = orderDataManager.getOrderRowSpecList();
    var samples = rows.slice(0, n);
    console.log('logOrderRowSpecSamples(' + n + ') — d_day / order_items_summary / items_subtotal / payment_status / delivery_status (DB 저장값 우선 반환 검증)');
    samples.forEach(function (r, i) {
        console.log('샘플 ' + (i + 1) + ':', {
            order_id: r.order_id,
            order_status: r.order_status,
            payment_status: r.payment_status,
            delivery_status: r.delivery_status,
            d_day: r.d_day,
            order_items_summary: r.order_items_summary,
            items_subtotal: r.items_subtotal,
            total_amount: r.total_amount
        });
    });
    return samples;
};

// 디버깅용 전역 함수들
window.debugBulkActions = function() {
    console.log('🔍 일괄 작업 디버깅 시작');
    
    const selectedCount = orderDataManager.selectedOrders.size;
    console.log('📊 선택된 주문 수:', selectedCount);
    console.log('📊 선택된 주문 ID들:', Array.from(orderDataManager.selectedOrders));
    
    const bulkContainer = document.getElementById('bulk-action-container');
    console.log('📦 일괄 작업 컨테이너:', bulkContainer);
    
    if (bulkContainer) {
        console.log('📦 컨테이너 내용:', bulkContainer.innerHTML);
    }
    
    // 강제로 일괄 작업 버튼 표시
    if (selectedCount > 0) {
        orderDataManager.forceShowBulkActionButtons();
        console.log('✅ 일괄 작업 버튼 강제 표시 완료');
    }
    
    return {
        selectedCount: selectedCount,
        bulkContainer: bulkContainer,
        selectedOrders: Array.from(orderDataManager.selectedOrders)
    };
};

window.forceShowBulkButtons = function() {
    console.log('🔄 일괄 작업 버튼 강제 표시');
    orderDataManager.forceShowBulkActionButtons();
};

// 고객 구매 금액 차감 함수 전역 등록
window.deductCustomerPurchaseAmount = (customerPhone, deductAmount) => {
    return orderDataManager.deductCustomerPurchaseAmount(customerPhone, deductAmount);
};

// 상품 재고 복원 함수 전역 등록
window.restoreProductStock = (orderId) => {
    return orderDataManager.restoreProductStock(orderId);
};

// 고객 구매 금액 수동 조정 함수 (관리자용)
window.adjustCustomerPurchaseAmount = async (customerPhone, adjustmentAmount, reason = '') => {
    try {
        console.log(`🔧 고객 구매 금액 수동 조정: ${customerPhone}, 조정액: ${adjustmentAmount.toLocaleString()}원, 사유: ${reason}`);
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase 클라이언트를 찾을 수 없습니다');
            return false;
        }
        
        // 고객 정보 조회
        const { data: customer, error: customerError } = await window.supabaseClient
            .from('farm_customers')
            .select('id, phone, total_purchase_amount, grade')
            .eq('phone', customerPhone)
            .single();
        
        if (customerError || !customer) {
            console.warn('⚠️ 고객 정보를 찾을 수 없습니다:', customerPhone);
            return false;
        }
        
        // 총 구매금액 조정
        const currentAmount = customer.total_purchase_amount || 0;
        const newTotalAmount = Math.max(0, currentAmount + adjustmentAmount);
        
        console.log(`📊 고객 총 구매금액 조정: ${currentAmount.toLocaleString()}원 → ${newTotalAmount.toLocaleString()}원`);
        
        // 고객등급 재계산 및 업데이트
        if (window.updateCustomerGrade) {
            await window.updateCustomerGrade(customer.id, newTotalAmount);
            console.log('✅ 고객 구매 금액 조정 완료');
            return true;
        } else {
            console.warn('⚠️ updateCustomerGrade 함수를 찾을 수 없습니다');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 고객 구매 금액 조정 실패:', error);
        return false;
    }
};

// 주문상태 편집창 외부 클릭 시 닫기 이벤트 리스너
document.addEventListener('click', (e) => {
    if (!e.target.closest('[id^="status-edit-"]') && !e.target.closest('[onclick*="toggleOrderStatusEdit"]')) {
        document.querySelectorAll('[id^="status-edit-"]').forEach(element => {
            element.classList.add('hidden');
        });
    }
});

// 디버깅 함수들
window.debugOrderTable = function() {
    console.log('🔍 주문 테이블 디버깅 시작');
    
    // 테이블 바디 요소 확인
    const tableBody = document.getElementById('orders-table-body');
    console.log('📋 테이블 바디:', tableBody);
    
    if (tableBody) {
        console.log('📋 테이블 바디 부모:', tableBody.parentElement);
        console.log('📋 테이블 바디 내용 길이:', tableBody.innerHTML.length);
        console.log('📋 테이블 바디 자식 요소 수:', tableBody.children.length);
        console.log('📋 테이블 바디 첫 번째 자식:', tableBody.firstElementChild);
    }
    
    // 주문 데이터 확인
    console.log('📊 전체 주문 수:', orderDataManager.farm_orders.length);
    console.log('📊 필터링된 주문 수:', orderDataManager.filterOrdersByStatus('all').length);
    
    // 테이블 렌더링 강제 실행
    console.log('🔄 테이블 렌더링 강제 실행');
    orderDataManager.renderOrdersTable('all');
    
    return {
        tableBody: tableBody,
        orderCount: orderDataManager.farm_orders.length,
        filteredCount: orderDataManager.filterOrdersByStatus('all').length
    };
};

window.forceRenderOrders = function() {
    console.log('🔄 주문 테이블 강제 렌더링');
    if (window.orderDataManager) {
        window.orderDataManager.renderOrdersTable('all');
    } else {
        console.error('❌ orderDataManager를 찾을 수 없습니다');
    }
};

// 모듈 내보내기
// renderOrdersTable 함수를 별도로 export
export function renderOrdersTable(status = 'all') {
    return orderDataManager.renderOrdersTable(status);
}

export { orderDataManager, OrderDataManager };