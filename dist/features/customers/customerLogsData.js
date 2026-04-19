// features/customers/customerLogsData.js
// 고객 타임라인(콜·메모·등급변동·태그변동) 데이터 매니저
// farm_customer_logs 테이블 CRUD 만 담당 (UI 는 customerUI.js 에서 렌더)

class CustomerLogsManager {
    constructor() {
        this.table = 'farm_customer_logs';
    }

    _client() {
        if (!window.supabaseClient) {
            throw new Error('supabaseClient 가 초기화되지 않았습니다.');
        }
        return window.supabaseClient;
    }

    /**
     * 고객 타임라인 조회 (최신순)
     * @param {string} customerId
     * @param {{ type?: string, limit?: number }} opts
     */
    async list(customerId, opts = {}) {
        if (!customerId) return [];
        const { type, limit = 100 } = opts;

        let query = this._client()
            .from(this.table)
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (type && type !== 'all') {
            query = query.eq('log_type', type);
        }

        const { data, error } = await query;
        if (error) {
            console.error('❌ 고객 로그 조회 실패:', error);
            throw error;
        }
        return data || [];
    }

    /**
     * 로그 추가
     * @param {string} customerId
     * @param {{ log_type: string, title?: string, body?: string, metadata?: object, created_by?: string }} payload
     */
    async add(customerId, payload) {
        if (!customerId) throw new Error('customerId 가 필요합니다.');
        const ALLOWED = ['call', 'memo', 'grade_change', 'tag_change', 'order_note', 'callback', 'etc'];
        const log_type = payload.log_type;
        if (!ALLOWED.includes(log_type)) {
            throw new Error(`허용되지 않은 log_type: ${log_type}`);
        }

        const row = {
            customer_id: customerId,
            log_type,
            title: (payload.title || '').trim() || null,
            body: (payload.body || '').trim() || null,
            metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
            created_by: payload.created_by || 'admin'
        };

        const { data, error } = await this._client()
            .from(this.table)
            .insert(row)
            .select()
            .single();

        if (error) {
            console.error('❌ 고객 로그 추가 실패:', error);
            throw error;
        }
        return data;
    }

    /**
     * 로그 삭제
     */
    async remove(logId) {
        if (!logId) throw new Error('logId 가 필요합니다.');
        const { error } = await this._client()
            .from(this.table)
            .delete()
            .eq('id', logId);

        if (error) {
            console.error('❌ 고객 로그 삭제 실패:', error);
            throw error;
        }
        return true;
    }

    /**
     * 로그 타입 → UI 메타(라벨·아이콘·색상키) 맵
     */
    static TYPE_META = {
        call:         { label: '통화',     icon: 'fa-phone',       variant: 'info'    },
        memo:         { label: '메모',     icon: 'fa-sticky-note', variant: 'neutral' },
        grade_change: { label: '등급변동', icon: 'fa-crown',       variant: 'warning' },
        tag_change:   { label: '태그변동', icon: 'fa-tag',         variant: 'purple'  },
        order_note:   { label: '주문메모', icon: 'fa-receipt',     variant: 'success' },
        callback:     { label: '콜백대기', icon: 'fa-phone-alt',   variant: 'danger'  },
        etc:          { label: '기타',     icon: 'fa-ellipsis-h',  variant: 'neutral' }
    };

    /**
     * 콜백대기 전체 목록 조회 (완료되지 않은 것만)
     */
    async listPendingCallbacks() {
        const { data, error } = await this._client()
            .from(this.table)
            .select('*, farm_customers(name, phone)')
            .eq('log_type', 'callback')
            .eq('metadata->>done', 'false')
            .order('created_at', { ascending: false });
        if (error) { console.error('❌ 콜백대기 조회 실패:', error); return []; }
        return data || [];
    }

    /**
     * 콜백 완료 처리 (metadata.done = true)
     */
    async completeCallback(logId) {
        const { data: row } = await this._client()
            .from(this.table).select('metadata').eq('id', logId).single();
        const meta = { ...(row?.metadata || {}), done: 'true', done_at: new Date().toISOString() };
        const { error } = await this._client()
            .from(this.table).update({ metadata: meta }).eq('id', logId);
        if (error) throw error;
        return true;
    }
}

export const customerLogsManager = new CustomerLogsManager();
export { CustomerLogsManager };
