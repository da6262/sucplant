# 경산다육식물농장 관리시스템

## 프로젝트 개요
White Platter 전문 농장의 주문/재고/고객 관리 웹앱입니다.

## 기술 스택
- Vanilla JS (ES 모듈)
- Tailwind CSS (CDN)
- Chart.js
- Supabase (DB)

## 실행 방법
```bash
start-server.bat
```
브라우저에서 http://localhost:8000 접속

## 폴더 구조
- `index.html` — 메인 진입점
- `main.js` — ES 모듈 진입점, features/* 모듈 import
- `js/app.js` — OrderManagementSystem 클래스 (핵심 오케스트레이터)
- `js/` — 기능별 JS 파일
- `features/` — 기능 모듈 (customers, orders, products, categories, shipping, dashboard)
- `components/` — HTML 컴포넌트 파일 (동적 로드)
- `styles/` — CSS 파일

## 주요 기능
- 대시보드 (매출 차트, 통계)
- 주문관리
- 고객관리 (CRM, 등급 관리)
- 상품관리
- 대기자관리
- 배송관리
- 환경설정

## 아키텍처 특징
- 네비게이션 클릭 시 컴포넌트 HTML을 동적으로 fetch해서 삽입
- `window.switchTab(tabId)` → `loadTabComponent(tabId)` → 각 컴포넌트 로드 함수 호출
- features/* 함수들은 `window.*`로 전역 등록
- OrderManagementSystem 메서드는 `window.orderSystem.메서드()`로 호출

## 데이터베이스
- Supabase 전용 (localStorage 없음)
- `window.supabaseClient`로 접근
- 주요 테이블: farm_customers, farm_orders, farm_products, farm_categories

## GitHub
- https://github.com/da6262/sucplant
