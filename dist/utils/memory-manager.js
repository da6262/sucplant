/**
 * 메모리 관리 도구
 * 프로젝트 정보와 설정을 저장하고 관리합니다.
 */

class MemoryManager {
    constructor() {
        this.memories = new Map();
        this.loadMemories();
    }

    /**
     * 메모리 저장
     * @param {string} key - 메모리 키
     * @param {any} value - 저장할 값
     * @param {string} description - 설명 (선택사항)
     */
    save(key, value, description = '') {
        const memory = {
            value: value,
            description: description,
            timestamp: new Date().toISOString(),
            id: this.generateId()
        };
        
        this.memories.set(key, memory);
        this.saveToFile();
        console.log(`메모리 저장됨: ${key}`);
        return memory;
    }

    /**
     * 메모리 조회
     * @param {string} key - 메모리 키
     * @returns {any} 저장된 값
     */
    get(key) {
        const memory = this.memories.get(key);
        return memory ? memory.value : null;
    }

    /**
     * 메모리 삭제
     * @param {string} key - 메모리 키
     */
    delete(key) {
        const deleted = this.memories.delete(key);
        if (deleted) {
            this.saveToFile();
            console.log(`메모리 삭제됨: ${key}`);
        }
        return deleted;
    }

    /**
     * 모든 메모리 조회
     * @returns {Array} 모든 메모리 목록
     */
    getAll() {
        return Array.from(this.memories.entries()).map(([key, memory]) => ({
            key,
            ...memory
        }));
    }

    /**
     * 메모리 검색
     * @param {string} query - 검색어
     * @returns {Array} 검색 결과
     */
    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const [key, memory] of this.memories.entries()) {
            if (key.toLowerCase().includes(lowerQuery) || 
                memory.description.toLowerCase().includes(lowerQuery)) {
                results.push({ key, ...memory });
            }
        }
        
        return results;
    }

    /**
     * 메모리를 파일에 저장
     */
    saveToFile() {
        try {
            const data = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                memories: Object.fromEntries(this.memories)
            };
            
            // Node.js 환경에서 파일 저장
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', 'data', 'memories.json');
                
                // 디렉토리 생성
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error('메모리 저장 실패:', error);
        }
    }

    /**
     * 파일에서 메모리 로드
     */
    loadMemories() {
        try {
            // Node.js 환경에서 파일 로드
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', 'data', 'memories.json');
                
                if (fs.existsSync(filePath)) {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.memories = new Map(Object.entries(data.memories || {}));
                }
            }
        } catch (error) {
            console.error('메모리 로드 실패:', error);
        }
    }

    /**
     * 고유 ID 생성
     * @returns {string} 고유 ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 메모리 통계
     * @returns {Object} 메모리 통계 정보
     */
    getStats() {
        return {
            total: this.memories.size,
            oldest: this.getOldestMemory(),
            newest: this.getNewestMemory()
        };
    }

    /**
     * 가장 오래된 메모리
     * @returns {Object|null}
     */
    getOldestMemory() {
        let oldest = null;
        for (const memory of this.memories.values()) {
            if (!oldest || new Date(memory.timestamp) < new Date(oldest.timestamp)) {
                oldest = memory;
            }
        }
        return oldest;
    }

    /**
     * 가장 최근 메모리
     * @returns {Object|null}
     */
    getNewestMemory() {
        let newest = null;
        for (const memory of this.memories.values()) {
            if (!newest || new Date(memory.timestamp) > new Date(newest.timestamp)) {
                newest = memory;
            }
        }
        return newest;
    }
}

// 전역 인스턴스 생성
const memoryManager = new MemoryManager();

// 브라우저 환경에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
    window.memoryManager = memoryManager;
}

// Node.js 환경에서 사용할 수 있도록 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = memoryManager;
}

// 사용 예시
console.log('메모리 관리 도구가 로드되었습니다.');

// 예시 사용법:
// memoryManager.save('project_version', '5.0', '프로젝트 버전');
// memoryManager.save('deployment_url', 'korsucplant.web.app', '배포 URL');
// console.log(memoryManager.get('project_version')); // '5.0'


