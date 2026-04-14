/**
 * 컴포넌트 로더 시스템
 * 경산다육식물농장 관리시스템 - 컴포넌트 기반 아키텍처
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
        this.componentCache = new Map();
    }

    /**
     * 컴포넌트 등록
     */
    registerComponent(name, component) {
        this.components.set(name, component);
        console.log(`✅ 컴포넌트 등록: ${name}`);
    }

    /**
     * 컴포넌트 로드
     */
    async loadComponent(name, targetElement, data = {}) {
        try {
            if (this.loadedComponents.has(name)) {
                console.log(`📦 컴포넌트 캐시 사용: ${name}`);
                return this.renderComponent(name, targetElement, data);
            }

            const component = this.components.get(name);
            if (!component) {
                throw new Error(`컴포넌트를 찾을 수 없습니다: ${name}`);
            }

            // 컴포넌트 로드
            if (component.template) {
                await this.loadTemplate(component.template);
            }

            if (component.script) {
                await this.loadScript(component.script);
            }

            if (component.style) {
                await this.loadStyle(component.style);
            }

            this.loadedComponents.add(name);
            return this.renderComponent(name, targetElement, data);

        } catch (error) {
            console.error(`❌ 컴포넌트 로드 실패: ${name}`, error);
            return false;
        }
    }

    /**
     * 템플릿 로드
     */
    async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`템플릿 로드 실패: ${templatePath}`);
            }
            const template = await response.text();
            this.componentCache.set(templatePath, template);
            return template;
        } catch (error) {
            console.error(`❌ 템플릿 로드 실패: ${templatePath}`, error);
            return null;
        }
    }

    /**
     * 스크립트 로드
     */
    async loadScript(scriptPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => {
                console.log(`✅ 스크립트 로드 완료: ${scriptPath}`);
                resolve(true);
            };
            script.onerror = () => {
                console.error(`❌ 스크립트 로드 실패: ${scriptPath}`);
                reject(new Error(`스크립트 로드 실패: ${scriptPath}`));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 스타일 로드
     */
    async loadStyle(stylePath) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = stylePath;
            link.onload = () => {
                console.log(`✅ 스타일 로드 완료: ${stylePath}`);
                resolve(true);
            };
            link.onerror = () => {
                console.error(`❌ 스타일 로드 실패: ${stylePath}`);
                reject(new Error(`스타일 로드 실패: ${stylePath}`));
            };
            document.head.appendChild(link);
        });
    }

    /**
     * 컴포넌트 렌더링
     */
    async renderComponent(name, targetElement, data = {}) {
        try {
            const component = this.components.get(name);
            if (!component) {
                throw new Error(`컴포넌트를 찾을 수 없습니다: ${name}`);
            }

            // 템플릿 렌더링
            if (component.template) {
                const template = this.componentCache.get(component.template) || 
                               await this.loadTemplate(component.template);
                
                if (template) {
                    const renderedTemplate = this.processTemplate(template, data);
                    targetElement.innerHTML = renderedTemplate;
                }
            }

            // 컴포넌트 초기화
            if (component.init && typeof component.init === 'function') {
                component.init(targetElement, data);
            }

            console.log(`✅ 컴포넌트 렌더링 완료: ${name}`);
            return true;

        } catch (error) {
            console.error(`❌ 컴포넌트 렌더링 실패: ${name}`, error);
            return false;
        }
    }

    /**
     * 템플릿 처리 (데이터 바인딩)
     */
    processTemplate(template, data) {
        let processedTemplate = template;
        
        // 데이터 바인딩 처리
        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = data[key] || '';
            processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
        });

        return processedTemplate;
    }

    /**
     * 컴포넌트 제거
     */
    unloadComponent(name) {
        if (this.loadedComponents.has(name)) {
            this.loadedComponents.delete(name);
            console.log(`🗑️ 컴포넌트 제거: ${name}`);
        }
    }

    /**
     * 모든 컴포넌트 제거
     */
    unloadAllComponents() {
        this.loadedComponents.clear();
        this.componentCache.clear();
        console.log('🗑️ 모든 컴포넌트 제거 완료');
    }
}

// 전역 컴포넌트 로더 인스턴스
window.componentLoader = new ComponentLoader();

console.log('✅ 컴포넌트 로더 시스템 초기화 완료');
