// 판매채널 데이터 관리
// features/settings/salesChannelsData.js

class SalesChannelsDataManager {
    constructor() {
        this.channels = [];
        console.log('🏪 SalesChannelsDataManager 초기화');
    }

    // 판매채널 데이터 로드
    async loadChannels() {
        try {
            console.log('📋 판매채널 데이터 로드 시작...');
            
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }

            let res = await window.supabaseClient
                .from('farm_channels')
                .select('*')
                .order('sort_order', { ascending: true });
            if (res.error) {
                res = await window.supabaseClient.from('farm_channels').select('*');
            }
            const { data: channels, error } = res;
            if (error) {
                throw new Error(`판매채널 데이터 로드 실패: ${error.message}`);
            }
            this.channels = (channels || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            console.log(`✅ 판매채널 ${this.channels.length}개 로드 완료`);
            
            return this.channels;
        } catch (error) {
            console.error('❌ 판매채널 데이터 로드 실패:', error);
            this.channels = [];
            throw error;
        }
    }

    // 판매채널 추가
    async addChannel(channelData) {
        try {
            console.log('➕ 판매채널 추가:', channelData);
            
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }

            const { data, error } = await window.supabaseClient
                .from('farm_channels')
                .insert([{
                    name: channelData.name,
                    icon: channelData.icon || 'store',
                    color: channelData.color || 'green',
                    description: channelData.description || '',
                    sort_order: channelData.sort_order || 0,
                    is_active: channelData.is_active !== false
                }])
                .select()
                .single();

            if (error) {
                throw new Error(`판매채널 추가 실패: ${error.message}`);
            }

            this.channels.push(data);
            console.log('✅ 판매채널 추가 완료:', data);
            
            return data;
        } catch (error) {
            console.error('❌ 판매채널 추가 실패:', error);
            throw error;
        }
    }

    // 판매채널 수정
    async updateChannel(channelId, updateData) {
        try {
            console.log('✏️ 판매채널 수정:', channelId, updateData);
            
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }

            const { data, error } = await window.supabaseClient
                .from('farm_channels')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', channelId)
                .select()
                .single();

            if (error) {
                throw new Error(`판매채널 수정 실패: ${error.message}`);
            }

            // 로컬 데이터 업데이트
            const index = this.channels.findIndex(c => c.id === channelId);
            if (index !== -1) {
                this.channels[index] = data;
            }

            console.log('✅ 판매채널 수정 완료:', data);
            
            return data;
        } catch (error) {
            console.error('❌ 판매채널 수정 실패:', error);
            throw error;
        }
    }

    // 판매채널 삭제
    async deleteChannel(channelId) {
        try {
            console.log('🗑️ 판매채널 삭제:', channelId);
            
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }

            const { error } = await window.supabaseClient
                .from('farm_channels')
                .delete()
                .eq('id', channelId);

            if (error) {
                throw new Error(`판매채널 삭제 실패: ${error.message}`);
            }

            // 로컬 데이터에서 제거
            this.channels = this.channels.filter(c => c.id !== channelId);

            console.log('✅ 판매채널 삭제 완료');
            
        } catch (error) {
            console.error('❌ 판매채널 삭제 실패:', error);
            throw error;
        }
    }

    // 활성화된 판매채널만 가져오기
    getActiveChannels() {
        return this.channels.filter(channel => channel.is_active);
    }

    // ID로 판매채널 찾기
    getChannelById(channelId) {
        return this.channels.find(channel => channel.id === channelId);
    }

    // 이름으로 판매채널 찾기
    getChannelByName(name) {
        return this.channels.find(channel => channel.name === name);
    }
}

// 전역 인스턴스 생성
const salesChannelsDataManager = new SalesChannelsDataManager();
window.salesChannelsDataManager = salesChannelsDataManager;

// 전역 함수들 등록 (loadSalesChannels는 settingsUI에서 UI 렌더용으로 등록 — farm_channels 연동)
window.loadSalesChannelsData = () => salesChannelsDataManager.loadChannels();
window.addSalesChannel = (channelData) => salesChannelsDataManager.addChannel(channelData);
window.updateSalesChannel = (channelId, updateData) => salesChannelsDataManager.updateChannel(channelId, updateData);
window.deleteSalesChannel = (channelId) => salesChannelsDataManager.deleteChannel(channelId);
window.getActiveSalesChannels = () => salesChannelsDataManager.getActiveChannels();
window.getSalesChannelById = (channelId) => salesChannelsDataManager.getChannelById(channelId);
window.getSalesChannelByName = (name) => salesChannelsDataManager.getChannelByName(name);

export default salesChannelsDataManager;
