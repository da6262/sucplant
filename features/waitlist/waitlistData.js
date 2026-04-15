// 대기자관리 데이터 모듈
// 경산다육식물농장 관리시스템 - 대기자 데이터 관리

// Supabase 전용 - localStorage 제거됨

/**
 * 대기자 데이터 관리자 클래스
 */
export class WaitlistDataManager {
    constructor() {
        console.log('🎯 WaitlistDataManager 초기화');
        this.farm_waitlist = [];
        this.currentEditingWaitlist = null;
    }

    /**
     * 대기자 목록 로드 (Supabase 전용)
     */
    async loadWaitlist() {
        try {
            console.log('📋 대기자 목록 로드 시작...');

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            // 최적화된 쿼리: 필요한 필드만 선택
            const { data, error } = await window.supabaseClient
                .from('farm_waitlist')
                .select('id, customer_name, customer_phone, product_name, product_category, expected_price, register_date, status, memo, priority, last_contact, created_at, updated_at')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(`Supabase 로드 실패: ${error.message}`);
            }
            
            this.farm_waitlist = data || [];
            console.log(`✅ 대기자 ${this.farm_waitlist.length}개 로드됨`);
            
            return this.farm_waitlist;
            
        } catch (error) {
            console.error('❌ 대기자 목록 로드 실패:', error);
            this.farm_waitlist = [];
            throw error;
        }
    }

    /**
     * 대기자 목록 저장 (Supabase 전용) — 내부 전용, 외부에서 직접 호출 비권장
     */
    async saveWaitlist() {
        try {
            console.log('💾 대기자 목록 저장 시작...');

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            console.log('☁️ Supabase에 대기자 데이터 저장 중...');
            
            // 기존 데이터 삭제 후 새로 삽입
            const { error: deleteError } = await window.supabaseClient
                .from('farm_waitlist')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제
            
            if (deleteError) {
                console.warn('⚠️ 기존 데이터 삭제 실패:', deleteError);
            }
            
            // 새 데이터 삽입 (빈 배열이 아닌 경우에만)
            if (this.farm_waitlist.length > 0) {
                const { data, error } = await window.supabaseClient
                    .from('farm_waitlist')
                    .insert(this.farm_waitlist);
                
                if (error) {
                    throw new Error(`Supabase 저장 실패: ${error.message}`);
                }
                
                console.log('✅ Supabase에 대기자 데이터 저장 완료');
            } else {
                console.log('📝 저장할 대기자 데이터가 없습니다');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ 대기자 목록 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 새 대기자 등록 (Supabase 전용)
     */
    async addWaitlist(waitlistData) {
        try {
            console.log('➕ 새 대기자 등록:', waitlistData);

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다. Supabase 설정을 확인해주세요.');
            }
            
            const newWaitlist = {
                customer_name: waitlistData.customer_name || '',
                customer_phone: waitlistData.customer_phone || '',
                product_name: waitlistData.product_name || '',
                product_category: waitlistData.product_category || '',
                expected_price: waitlistData.expected_price || 0,
                register_date: new Date().toISOString().split('T')[0],
                status: '대기중',
                memo: waitlistData.memo || '',
                priority: waitlistData.priority || 3,
                last_contact: null
                // created_at, updated_at는 Supabase에서 자동 생성
            };
            
            const { data, error } = await window.supabaseClient
                .from('farm_waitlist')
                .insert([newWaitlist])
                .select();
            
            if (error) {
                throw new Error(`Supabase 삽입 실패: ${error.message}`);
            }
            
            // 로컬 배열에도 추가
            this.farm_waitlist.push(data[0]);
            
            console.log('✅ 새 대기자 등록 완료:', data[0]);
            return data[0];
        } catch (error) {
            console.error('❌ 새 대기자 등록 실패:', error);
            throw error;
        }
    }

    /**
     * 대기자 정보 수정 (Supabase 직접 update)
     */
    async updateWaitlist(waitlistId, updateData) {
        try {
            console.log('✏️ 대기자 정보 수정:', waitlistId, updateData);

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다.');
            }

            const payload = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await window.supabaseClient
                .from('farm_waitlist')
                .update(payload)
                .eq('id', waitlistId)
                .select();

            if (error) throw new Error(`Supabase 수정 실패: ${error.message}`);

            // 로컬 배열도 반영
            const index = this.farm_waitlist.findIndex(item => item.id === waitlistId);
            if (index !== -1) {
                this.farm_waitlist[index] = { ...this.farm_waitlist[index], ...payload };
            }

            console.log('✅ 대기자 정보 수정 완료:', data[0]);
            return data[0];
        } catch (error) {
            console.error('❌ 대기자 정보 수정 실패:', error);
            throw error;
        }
    }

    /**
     * 대기자 삭제 (Supabase 직접 delete)
     */
    async deleteWaitlist(waitlistId) {
        try {
            console.log('🗑️ 대기자 삭제:', waitlistId);

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다.');
            }

            const { error } = await window.supabaseClient
                .from('farm_waitlist')
                .delete()
                .eq('id', waitlistId);

            if (error) throw new Error(`Supabase 삭제 실패: ${error.message}`);

            // 로컬 배열에서도 제거
            const index = this.farm_waitlist.findIndex(item => item.id === waitlistId);
            if (index !== -1) this.farm_waitlist.splice(index, 1);

            console.log('✅ 대기자 삭제 완료:', waitlistId);
            return true;
        } catch (error) {
            console.error('❌ 대기자 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * 대기자 검색
     */
    searchWaitlist(query) {
        try {
            console.log('🔍 대기자 검색:', query);
            
            if (!query || query.trim() === '') {
                return this.farm_waitlist;
            }
            
            const searchTerm = query.toLowerCase();
            const results = this.farm_waitlist.filter(item => 
                item.customer_name.toLowerCase().includes(searchTerm) ||
                item.customer_phone.includes(searchTerm) ||
                item.product_name.toLowerCase().includes(searchTerm) ||
                item.product_category.toLowerCase().includes(searchTerm) ||
                (item.memo && item.memo.toLowerCase().includes(searchTerm))
            );
            
            console.log(`🔍 검색 결과: ${results.length}개`);
            return results;
        } catch (error) {
            console.error('❌ 대기자 검색 실패:', error);
            return [];
        }
    }

    /**
     * 상태별 대기자 필터링
     */
    filterWaitlistByStatus(status) {
        try {
            console.log('🔍 상태별 대기자 필터링:', status);
            
            if (status === 'all' || !status) {
                return this.farm_waitlist;
            }
            
            const results = this.farm_waitlist.filter(item => item.status === status);
            console.log(`🔍 ${status} 상태 대기자: ${results.length}개`);
            return results;
        } catch (error) {
            console.error('❌ 상태별 필터링 실패:', error);
            return [];
        }
    }

    /**
     * 대기자 통계
     */
    getWaitlistStats() {
        try {
            const stats = {
                total: this.farm_waitlist.length,
                waiting: this.farm_waitlist.filter(item => item.status === '대기중').length,
                contacted: this.farm_waitlist.filter(item => item.status === '연락완료').length,
                converted: this.farm_waitlist.filter(item => item.status === '주문전환').length,
                cancelled: this.farm_waitlist.filter(item => item.status === '취소').length
            };
            
            console.log('📊 대기자 통계:', stats);
            return stats;
        } catch (error) {
            console.error('❌ 대기자 통계 생성 실패:', error);
            return {
                total: 0,
                waiting: 0,
                contacted: 0,
                converted: 0,
                cancelled: 0
            };
        }
    }

    /**
     * 대기자 ID로 조회
     */
    getWaitlistById(waitlistId) {
        try {
            const waitlist = this.farm_waitlist.find(item => item.id === waitlistId);
            return waitlist || null;
        } catch (error) {
            console.error('❌ 대기자 조회 실패:', error);
            return null;
        }
    }

    /**
     * 모든 대기자 목록 반환
     */
    getAllWaitlist() {
        return this.farm_waitlist;
    }

    /**
     * 대기자 상태 업데이트 (Supabase 직접 update)
     */
    async updateWaitlistStatus(waitlistId, newStatus) {
        try {
            console.log('🔄 대기자 상태 업데이트:', waitlistId, newStatus);

            if (!window.supabaseClient) {
                throw new Error('Supabase가 연결되지 않았습니다.');
            }

            const payload = {
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...(newStatus === '연락완료' ? { last_contact: new Date().toISOString() } : {})
            };

            const { error } = await window.supabaseClient
                .from('farm_waitlist')
                .update(payload)
                .eq('id', waitlistId);

            if (error) throw new Error(`Supabase 상태 수정 실패: ${error.message}`);

            // 로컬 배열도 반영
            const index = this.farm_waitlist.findIndex(item => item.id === waitlistId);
            if (index !== -1) {
                Object.assign(this.farm_waitlist[index], payload);
            }

            console.log('✅ 대기자 상태 업데이트 완료:', waitlistId, newStatus);
            return true;
        } catch (error) {
            console.error('❌ 대기자 상태 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 긴급 데이터 복구 — Supabase에서 재로드 후 UI 갱신
     */
    async emergencyWaitlistRecovery() {
        try {
            console.log('🚨 대기자 데이터 긴급 복구 시작...');
            await this.loadWaitlist();
            if (window.waitlistUI) {
                window.waitlistUI.renderWaitlistTable();
                window.waitlistUI.updateWaitlistStats();
            }
            const msg = `대기자 데이터 복구 완료: ${this.farm_waitlist.length}건`;
            console.log('✅', msg);
            if (window.Swal) {
                window.Swal.fire({ icon: 'success', title: '복구 완료', text: msg, timer: 2000, showConfirmButton: false });
            } else {
                alert(msg);
            }
            return true;
        } catch (error) {
            console.error('❌ 대기자 복구 실패:', error);
            alert('데이터 복구 실패: ' + error.message);
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성 및 export
export const waitlistDataManager = new WaitlistDataManager();

// 전역에서 사용할 수 있도록 window 객체에 등록
if (typeof window !== 'undefined') {
    window.waitlistDataManager = waitlistDataManager;
}









