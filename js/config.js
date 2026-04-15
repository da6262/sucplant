/**
 * 경산다육식물농장 관리시스템 — 전역 설정
 *
 * 버전 번호를 여기 한 곳에서만 변경하세요.
 * server.js가 HTML을 서빙할 때 모든 로컬 JS/CSS 경로에 자동으로 ?v=VERSION을 주입합니다.
 * 사이드바 버전 배지도 이 값을 읽습니다.
 */
const _APP_VER = '3.2.64';           // ← 여기만 수정

window.APP_VERSION = _APP_VER;
window.APP_CONFIG  = {
    version  : _APP_VER,
    appName  : '경산다육식물농장 관리시스템',
    shortName: '경산다육',
    github   : 'https://github.com/da6262/sucplant'
};

console.log(`🌱 경산다육식물농장 관리시스템 v${_APP_VER}`);
