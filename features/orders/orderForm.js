// 주문 폼 관련 기능
// features/orders/orderForm.js

/** 금액 정책: 원 단위 정수만 허용. 소수 입력 시 제거(반올림 없음). */
function toIntegerWon(value) {
    if (value == null || value === '') return 0;
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.trunc(n);
}

/** 입력 필드를 원 단위 정수로 강제(소수 제거, 음수는 0). */
function normalizeIntegerInput(el) {
    if (!el) return;
    const v = Math.max(0, toIntegerWon(el.value));
    if (String(el.value) !== String(v)) el.value = v;
}

/** 수량 입력: 정수만 허용, 최소 1 (0 이하 입력 시 1로 보정). */
function normalizeQuantityInput(el) {
    if (!el) return;
    const v = Math.max(1, toIntegerWon(el.value));
    if (String(el.value) !== String(v)) el.value = v;
}

// 주문 폼 HTML 생성 (최소 입력·최대 속도 레이아웃 우선)
function generateOrderFormHTML() {
    if (typeof window.generateOrderFormHTMLMinimal === 'function') return window.generateOrderFormHTMLMinimal();
    return `
        <!-- 메인 컨텐츠 - 3단 레이아웃 (레거시) -->
        <div class="space-y-6">
            <!-- 상단: 주문 요약 대시보드 -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-shopping-cart text-blue-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-blue-800">주문 요약</h3>
                            <p class="text-sm text-blue-600">현재 주문 상태를 확인하세요</p>
                        </div>
                    </div>
                    <div class="flex space-x-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600" id="order-summary-total">0원</div>
                            <div class="text-xs text-blue-500">총 주문금액</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-green-600" id="order-summary-items">0개</div>
                            <div class="text-xs text-green-500">상품 수량</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                <!-- 좌측: 고객 정보, 주문 정보 -->
                <div class="space-y-6">
                    <!-- 고객 정보 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user mr-3 text-blue-600"></i>고객 정보
                        </h3>
                        <div class="space-y-4">
                            <!-- 고객명, 연락처 한 줄 배치 -->
                            <div class="grid grid-cols-2 gap-4">
                                <div class="relative">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-search text-blue-500 mr-1"></i>고객명 *
                                        <span class="text-xs text-gray-500 ml-2">(입력 시 자동 검색)</span>
                                    </label>
                                    <div class="relative">
                                        <input type="text" id="order-customer-name" 
                                               class="w-full px-3 py-2 pr-10 border-2 border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                               placeholder="🔍 고객 이름을 입력하세요" required
                                               oninput="searchExistingCustomers(this.value)" autocomplete="off">
                                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                                            <i class="fas fa-user-search"></i>
                                        </div>
                                    </div>
                                    <div id="customer-search-results" class="absolute top-full left-0 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl hidden max-h-48 overflow-y-auto z-30">
                                        <!-- 기존 고객 검색 결과 -->
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
                                    <input type="tel" id="order-customer-phone" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                           placeholder="고객 선택 시 자동 입력됩니다" required readonly>
                                </div>                            </div>
                            <!-- 주소 검색 및 상세주소 한 줄 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">주소 *</label>
                                <div class="flex space-x-2">
                                    <!-- 기본주소 (검색된 주소) -->
                                    <input type="text" id="order-customer-address" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="고객 선택 시 자동 입력됩니다" required readonly>
                                    <!-- 주소는 고객 선택 시 자동 입력되므로 검색 버튼 불필요 -->
                                    <!-- 상세주소 입력 -->
                                    <input type="text" id="order-customer-address-detail" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="상세주소 (동/호수, 건물명 등)">
                                </div>
                            </div>
                            <div id="order-phone-duplicate-message" class="text-sm text-red-600 hidden"></div>
                        </div>
                    </div>

                    <!-- 주문 정보 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-clipboard-list mr-3 text-purple-600"></i>주문 정보
                        </h3>
                        <div class="space-y-4">
                            <!-- 주문상태와 주문채널 한 줄 배치 -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">주문 상태</label>
                                    <select id="order-status" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="주문접수">1. 주문접수</option>
                                        <option value="고객안내">2. 고객안내</option>
                                        <option value="입금대기">3. 입금대기</option>
                                        <option value="입금확인">4. 입금확인</option>
                                        <option value="상품준비">5. 상품준비</option>
                                        <option value="배송준비">6. 배송준비</option>
                                        <option value="배송중">7. 배송중</option>
                                        <option value="배송완료">8. 배송완료</option>
                                        <option value="주문취소">9. 주문취소</option>
                                        <option value="환불완료">10. 환불완료</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">주문 채널</label>
                                    <select id="order-channel" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <!-- 환경설정에서 동적으로 로드됩니다 -->
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">배송 메모</label>
                                <textarea id="order-memo" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                          placeholder="배송 관련 메모 입력..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 중앙: 상품 검색, 장바구니 -->
                <div class="space-y-6">
                    <!-- 상품 검색 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-search mr-3 text-green-600"></i>상품 검색
                        </h3>
                        <div class="space-y-4">
                            <!-- 상품 검색 필터 -->
                            <div class="flex space-x-2 mb-4">
                                <select id="product-category-filter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">전체 카테고리</option>
                                    <!-- 카테고리 옵션들이 동적으로 로드됩니다 -->
                                </select>
                                <select id="product-price-filter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">전체 가격대</option>
                                    <option value="0-10000">1만원 이하</option>
                                    <option value="10000-30000">1-3만원</option>
                                    <option value="30000-50000">3-5만원</option>
                                    <option value="50000-100000">5-10만원</option>
                                    <option value="100000">10만원 이상</option>
                                </select>
                            </div>
                            
                            <!-- 상품 검색 입력 -->
                            <div class="flex space-x-2">
                                <div class="flex-1 relative">
                                    <input type="text" id="product-search" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="상품명, 브랜드, 태그로 검색..."
                                           oninput="searchProducts(this.value)">
                                    <div id="product-search-results" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg hidden max-h-64 overflow-y-auto">
                                        <!-- 상품 검색 결과 (이미지 썸네일 포함) -->
                                    </div>
                                </div>
                                <button id="show-product-list"
                                        class="btn-primary"
                                        onclick="showProductManagementModal()">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                            
                            <!-- 인기 상품 빠른 선택 -->
                            <div class="bg-gray-50 rounded-lg p-3">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">인기 상품</h4>
                                <div id="popular-products" class="flex space-x-2 overflow-x-auto">
                                    <!-- 인기 상품 버튼들이 동적으로 로드됩니다 -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 장바구니 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-shopping-cart mr-3 text-orange-600"></i>장바구니
                        </h3>
                        <div class="space-y-4">
                            <div id="cart-items" class="max-h-64 overflow-y-auto bg-gray-50 rounded-lg border">
                                <!-- 장바구니 표 헤더 -->
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-100 sticky top-0">
                                        <tr class="border-b border-gray-200">
                                            <th class="px-3 py-2 text-left font-medium text-gray-700">상품명</th>
                                            <th class="px-3 py-2 text-right font-medium text-gray-700">단가(원)</th>
                                            <th class="px-3 py-2 text-center font-medium text-gray-700">수량</th>
                                            <th class="px-3 py-2 text-right font-medium text-gray-700">소계(원)</th>
                                            <th class="px-3 py-2 text-center font-medium text-gray-700">삭제</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cart-items-body">
                                        <!-- 장바구니 아이템들이 여기에 표시됩니다 -->
                                        <tr>
                                            <td colspan="5" class="text-center text-gray-500">
                                                <p>장바구니가 비어있습니다</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- 합계 영역: items_subtotal / shipping_fee / discount_amount / total_amount 실시간 일치 -->
                            <div id="order-total-summary" class="bg-blue-50 border border-blue-200 rounded-lg p-4 hidden">
                                <div class="space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">상품합계:</span>
                                        <span id="product-total-amount" class="font-medium tabular-nums">0원</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">배송비:</span>
                                        <span id="shipping-total-amount" class="font-medium tabular-nums">0원</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">할인:</span>
                                        <span id="discount-total-amount" class="font-medium text-red-600 tabular-nums">-0원</span>
                                    </div>
                                    <div class="border-t border-blue-200 pt-2">
                                        <div class="flex justify-between text-lg font-bold">
                                            <span class="text-blue-800">총액:</span>
                                            <span id="final-total-amount" class="text-blue-600 tabular-nums">0원</span>
                                        </div>
                                        <p id="order-total-zero-warning" class="text-amber-600 text-xs mt-1 hidden">총액이 0원으로 처리됨</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">배송 방법</label>
                                    <select id="shipping-method" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                            onchange="updateShippingMethod()">
                                        <option value="택배">택배</option>
                                        <option value="직접배송">직접배송</option>
                                        <option value="방문수령">방문수령 (배송비 무료)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">배송비 (주문별 입력)</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="number" id="shipping-fee-input" step="1" min="0"
                                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                               value="0" oninput="window._shippingFeeUserEdited=true; if(window.normalizeIntegerInput) normalizeIntegerInput(this); updateCartTotal()" onchange="updateCartTotal()"
                                               title="주문별 최종 배송비. 총액 계산에 사용됩니다">
                                        <span class="text-sm text-gray-600">원</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">할인액</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="number" id="discount-amount" step="1" min="0"
                                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                               value="0" oninput="normalizeIntegerInput(this); updateCartTotal()" onchange="updateCartTotal()">
                                        <span class="text-sm text-gray-600">원</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 우측: 주문 설정, 할인, 배송 옵션 -->
                <div class="space-y-6">
                    <!-- 주문 설정 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-cog mr-3 text-purple-600"></i>주문 설정
                        </h3>
                        <div class="space-y-4">
                            <!-- 주문 우선순위 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">주문 우선순위</label>
                                <select id="order-priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="normal">일반</option>
                                    <option value="urgent">긴급</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                            
                            
                            <!-- 결제 방법 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">결제 방법</label>
                                <select id="payment-method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="bank_transfer">계좌이체</option>
                                    <option value="card">카드결제</option>
                                    <option value="cash">현금</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 할인 및 쿠폰 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-tag mr-3 text-red-600"></i>할인 및 쿠폰
                        </h3>
                        <div class="space-y-4">
                            <!-- 쿠폰 적용 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">쿠폰 코드</label>
                                <div class="flex space-x-2">
                                    <input type="text" id="coupon-code" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="쿠폰 코드 입력">
                                    <button type="button" onclick="applyCoupon()" 
                                            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                                        적용
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 할인 옵션 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">할인 옵션</label>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="new-customer-discount" class="mr-2">
                                        <span class="text-sm">신규고객 할인 (5%)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="bulk-order-discount" class="mr-2">
                                        <span class="text-sm">대량주문 할인 (10%)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="loyalty-discount" class="mr-2">
                                        <span class="text-sm">단골고객 할인 (3%)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- 수동 할인 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수동 할인</label>
                                <div class="flex items-center space-x-2">
                                    <input type="number" id="manual-discount" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                           value="0" min="0" onchange="updateCartTotal()">
                                    <span class="text-sm text-gray-600">원</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 주문 메모 및 알림 카드 -->
                    <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-sticky-note mr-3 text-yellow-600"></i>메모 및 알림
                        </h3>
                        <div class="space-y-4">
                            <!-- 주문 메모 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">주문 메모</label>
                                <textarea id="order-notes" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                          placeholder="주문 관련 특이사항을 입력하세요..."></textarea>
                            </div>
                            
                            <!-- 알림 설정 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">알림 설정</label>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="sms-notification" class="mr-2" checked>
                                        <span class="text-sm">SMS 알림 발송</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="email-notification" class="mr-2">
                                        <span class="text-sm">이메일 알림 발송</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="auto-status-update" class="mr-2" checked>
                                        <span class="text-sm">자동 상태 업데이트</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 하단 액션 버튼들 -->
            <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-600">
                            <span class="font-medium">총 상품:</span> <span id="total-items-count">0</span>개
                        </div>
                        <div class="text-sm text-gray-600">
                            <span class="font-medium">총 금액:</span> <span id="total-amount-display" class="text-lg font-bold text-blue-600">0원</span>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button type="button" onclick="clearOrderForm()" 
                                class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <i class="fas fa-eraser mr-2"></i>초기화
                        </button>
                        <button type="button" onclick="saveOrderDraft()" 
                                class="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                            <i class="fas fa-save mr-2"></i>임시저장
                        </button>
                        <button type="button" onclick="previewOrder()" 
                                class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                            <i class="fas fa-eye mr-2"></i>미리보기
                        </button>
                        <button type="submit" form="order-form" data-order-submit="true"
                                class="btn-primary" style="padding: 8px 32px;">
                            <i class="fas fa-check mr-2"></i>주문 등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 쿠폰 적용 함수
function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value;
    if (!couponCode) {
        alert('쿠폰 코드를 입력해주세요.');
        return;
    }
    
    console.log('🎫 쿠폰 적용:', couponCode);
    // 쿠폰 검증 및 할인 적용 로직
    alert('쿠폰이 적용되었습니다.');
    updateCartTotal();
}

// 주문 임시저장 함수
function saveOrderDraft() {
    console.log('💾 주문 임시저장');
    // 임시저장 로직 구현
    alert('주문이 임시저장되었습니다.');
}

// 주문 미리보기 함수
function previewOrder() {
    console.log('👁️ 주문 미리보기');
    // 미리보기 모달 열기 로직
    alert('주문 미리보기 기능은 준비 중입니다.');
}

// 주문 요약 업데이트 함수
function updateOrderSummary() {
    try {
        // data-product-id 속성이 있는 실제 상품 행만 카운트
        const cartItems = document.querySelectorAll('#cart-items-body tr[data-product-id]');
        const totalItems = cartItems.length;
        let totalAmount = 0;
        
        cartItems.forEach(item => {
            const quantity = toIntegerWon(item.querySelector('.quantity-input')?.value);
            const price = toIntegerWon(item.querySelector('td:nth-child(2)')?.textContent?.replace(/[^\d]/g, '') || 0);
            totalAmount += quantity * price;
        });
        
        const shippingFee = toIntegerWon(document.getElementById('shipping-fee-input')?.value);
        const discountAmount = toIntegerWon(document.getElementById('discount-amount')?.value);
        totalAmount = Math.max(0, totalAmount + shippingFee - discountAmount);
        
        // 요약 업데이트
        const summaryTotal = document.getElementById('order-summary-total');
        const summaryItems = document.getElementById('order-summary-items');
        const totalItemsCount = document.getElementById('total-items-count');
        const totalAmountDisplay = document.getElementById('total-amount-display');
        
        if (summaryTotal) summaryTotal.textContent = totalAmount.toLocaleString() + '원';
        if (summaryItems) summaryItems.textContent = totalItems + '개';
        if (totalItemsCount) totalItemsCount.textContent = totalItems;
        if (totalAmountDisplay) totalAmountDisplay.textContent = totalAmount.toLocaleString() + '원';
        
    } catch (error) {
        console.error('❌ 주문 요약 업데이트 실패:', error);
    }
}

// 퀵상품 8개 로드 (최소 레이아웃용)
async function loadQuickProductsForMinimal() {
    const container = document.getElementById('quick-product-buttons');
    if (!container || !window.supabaseClient) return;
    try {
        const { data: products, error } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price')
            .limit(6)
            .order('created_at', { ascending: false });
        if (error || !products || products.length === 0) {
            container.innerHTML = '<div class="col-span-3 text-center text-gray-400 text-xs py-2">등록된 상품이 없습니다</div>';
            return;
        }
        container.innerHTML = products.map(p => {
            const name = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `<button type="button" onclick="addQuickProductToCart('${p.id}','${name}',${parseFloat(p.price)||0})"
                class="min-h-[32px] min-w-[32px] px-2 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 text-xs text-left truncate">${(p.name || '').substring(0, 12)} ${(parseFloat(p.price)||0).toLocaleString()}원</button>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<div class="col-span-3 text-center text-gray-400 text-xs py-2">로드 실패</div>';
    }
}

// 인기 상품 로드 함수 (풀 레이아웃용)
async function loadPopularProducts() {
    const quickContainer = document.getElementById('quick-product-buttons');
    if (quickContainer) {
        await loadQuickProductsForMinimal();
        return;
    }
    try {
        const popularProductsContainer = document.getElementById('popular-products');
        if (!popularProductsContainer) return;
        popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400 flex items-center space-x-2"><i class="fas fa-spinner fa-spin"></i><span>로딩 중...</span></div>`;
        if (!window.supabaseClient) {
            popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400">인기 상품을 불러올 수 없습니다</div>`;
            return;
        }
        const { data: orderItemsData, error: orderItemsError } = await window.supabaseClient
            .from('farm_order_items')
            .select('product_name, quantity');
        if (orderItemsError) {
            popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400">인기 상품을 불러올 수 없습니다</div>`;
            return;
        }
        const productCounts = {};
        (orderItemsData || []).forEach(item => {
            if (item.product_name) productCounts[item.product_name] = (productCounts[item.product_name] || 0) + (item.quantity || 1);
        });
        const topProductNames = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name]) => name);
        if (topProductNames.length === 0) {
            popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400">아직 주문 데이터가 없습니다</div>`;
            return;
        }
        const { data: productsData, error: productsError } = await window.supabaseClient
            .from('farm_products')
            .select('id, name, price, image_url, stock')
            .in('name', topProductNames);
        if (productsError || !productsData?.length) {
            popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400">인기 상품이 없습니다</div>`;
            return;
        }
        const sortedProducts = productsData.sort((a, b) => (productCounts[b.name] || 0) - (productCounts[a.name] || 0));
        popularProductsContainer.innerHTML = sortedProducts.map(product => `
            <button onclick="addPopularProduct('${product.id}', '${(product.name||'').replace(/'/g, "\\'")}', ${product.price})"
                    class="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-2 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
                <div class="w-14 h-14 bg-gray-100 rounded-lg mb-1 flex items-center justify-center overflow-hidden">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">` : `<i class="fas fa-seedling text-green-500 text-xl"></i>`}
                </div>
                <div class="text-xs text-center w-20">
                    <div class="font-medium text-gray-800 truncate">${product.name}</div>
                    <div class="text-blue-600 font-semibold">${product.price.toLocaleString()}원</div>
                </div>
            </button>
        `).join('');
    } catch (error) {
        const popularProductsContainer = document.getElementById('popular-products');
        if (popularProductsContainer) popularProductsContainer.innerHTML = `<div class="text-xs text-gray-400">오류가 발생했습니다</div>`;
    }
}

// 퀵상품 클릭 시 장바구니 추가 또는 수량 +1 (4열: 상품명/단가/수량/소계, 수량 0이면 자동 삭제)
function addQuickProductToCart(productId, productName, price) {
    const cartBody = document.getElementById('cart-items-body');
    if (!cartBody) return;
    const unitPrice = parseFloat(price) || 0;
    const existing = cartBody.querySelector(`tr[data-product-id="${productId}"]`);
    if (existing) {
        const qInput = existing.querySelector('.quantity-input');
        if (qInput) {
            const q = Math.max(0, parseInt(qInput.value || 0) + 1);
            qInput.value = q;
            if (q === 0) {
                existing.remove();
                ensureCartEmptyRow(cartBody);
            }
        }
    } else {
        const emptyRow = cartBody.querySelector('tr td[colspan]');
        if (emptyRow) emptyRow.closest('tr')?.remove();
        const tr = document.createElement('tr');
        tr.setAttribute('data-product-id', productId);
        tr.setAttribute('data-price', String(unitPrice));
        tr.setAttribute('data-unit-price', String(unitPrice));
        tr.setAttribute('data-product-name', productName || '');
        const lineTotal = unitPrice * 1;
        tr.innerHTML = `
            <td class="px-2 align-top">${(productName || '').replace(/</g, '&lt;')}</td>
            <td class="px-2 td-secondary align-top tabular-nums">${unitPrice.toLocaleString()}원</td>
            <td class="px-2 text-center align-top whitespace-nowrap">
                <button type="button" class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-sm inline-flex items-center justify-center" onclick="cartQuantityChange('${productId}', -1)">−</button>
                <input type="number" class="quantity-input w-12 text-center border rounded mx-0.5 text-sm" value="1" min="0" onchange="cartQuantityChange('${productId}', 0)">
                <button type="button" class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-sm inline-flex items-center justify-center" onclick="cartQuantityChange('${productId}', 1)">+</button>
            </td>
            <td class="cart-line-total px-2 text-right font-medium tabular-nums align-top">${lineTotal.toLocaleString()}원</td>
        `;
        cartBody.appendChild(tr);
    }
    refreshOrderTotal();
}
function cartQuantityChange(productId, delta) {
    const cartBody = document.getElementById('cart-items-body');
    const row = cartBody?.querySelector(`tr[data-product-id="${productId}"]`);
    if (!row) return;
    const qInput = row.querySelector('.quantity-input');
    if (!qInput) return;
    const q = delta === 0 ? parseInt(qInput.value || 0) : Math.max(0, parseInt(qInput.value || 0) + delta);
    qInput.value = Math.max(0, q);
    if (q === 0) {
        row.remove();
        ensureCartEmptyRow(cartBody);
    }
    refreshOrderTotal();
}
function ensureCartEmptyRow(cartBody) {
    if (!cartBody || cartBody.querySelector('tr[data-product-id]')) return;
    const thCount = cartBody.closest('table')?.querySelectorAll('thead th')?.length || 4;
    cartBody.innerHTML = window.renderEmptyRow(thCount, '장바구니가 비어있습니다');
}
// 라인 소계·상품합계·총금액 실시간 갱신 (원 단위 정수, 단가 스냅샷 기준). updateCartTotal와 동일 규칙 적용.
function refreshOrderTotal() {
    const cartBody = document.getElementById('cart-items-body');
    const discountEl = document.getElementById('discount-amount');
    const shippingInput = document.getElementById('shipping-fee-input');
    const productTotalEl = document.getElementById('product-total-amount');
    const shippingTotalEl = document.getElementById('shipping-total-amount');
    const discountTotalEl = document.getElementById('discount-total-amount');
    const finalTotalEl = document.getElementById('final-total-amount');
    const zeroWarning = document.getElementById('order-total-zero-warning');
    const totalSummary = document.getElementById('order-total-summary');
    if (!cartBody) return;
    let itemsSubtotal = 0;
    cartBody.querySelectorAll('tr[data-product-id]').forEach(tr => {
        const qInput = tr.querySelector('.quantity-input');
        const q = Math.max(1, toIntegerWon(qInput?.value));
        if (qInput && String(qInput.value) !== String(q)) qInput.value = q;
        const unitPrice = toIntegerWon(tr.getAttribute('data-unit-price') || tr.getAttribute('data-price'));
        const lineTotal = unitPrice * q;
        const lineEl = tr.querySelector('.cart-line-total');
        if (lineEl) lineEl.textContent = lineTotal.toLocaleString() + '원';
        itemsSubtotal += lineTotal;
    });
    const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
    const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
    let shippingFee;
    if (shippingInput && !window._shippingFeeUserEdited) {
        shippingFee = itemsSubtotal >= freeThreshold ? 0 : Math.max(0, toIntegerWon(defaultFee));
        shippingInput.value = shippingFee;
    } else {
        shippingFee = Math.max(0, toIntegerWon(shippingInput?.value));
        if (shippingInput && String(shippingInput.value) !== String(shippingFee)) shippingInput.value = shippingFee;
    }
    const discount = Math.max(0, toIntegerWon(discountEl?.value));
    if (discountEl && String(discountEl.value) !== String(discount)) discountEl.value = discount;
    const totalAmount = Math.max(0, itemsSubtotal + shippingFee - discount);
    const rawTotal = itemsSubtotal + shippingFee - discount;
    if (productTotalEl) productTotalEl.textContent = itemsSubtotal.toLocaleString() + '원';
    if (shippingTotalEl) shippingTotalEl.textContent = shippingFee.toLocaleString() + '원';
    if (discountTotalEl) discountTotalEl.textContent = '-' + discount.toLocaleString() + '원';
    if (finalTotalEl) finalTotalEl.textContent = totalAmount.toLocaleString() + '원';
    if (zeroWarning) zeroWarning.classList.toggle('hidden', rawTotal >= 0);
    if (totalSummary) {
        if (itemsSubtotal > 0) totalSummary.classList.remove('hidden');
        else totalSummary.classList.add('hidden');
    }
}
window.addQuickProductToCart = addQuickProductToCart;
window.cartQuantityChange = cartQuantityChange;
window.refreshOrderTotal = refreshOrderTotal;

// 인기 상품 추가 함수 (레거시/풀 폼용)
function addPopularProduct(productId, productName, price) {
    if (document.getElementById('quick-product-buttons')) {
        addQuickProductToCart(productId, productName, price);
        return;
    }
    if (window.addToCart) window.addToCart(productId, productName, price, 1);
    if (window.refreshOrderTotal) window.refreshOrderTotal();
    else if (window.updateCartTotal) window.updateCartTotal();
}

// 주문 폼 초기화
async function initOrderForm() {
    try {
        console.log('📝 주문 폼 초기화 시작');
        
        // 주문 폼 요소 확인
        const orderForm = document.getElementById('order-form');
        console.log('🔍 주문 폼 요소:', orderForm);
        
        if (!orderForm) {
            console.error('❌ 주문 폼 요소를 찾을 수 없습니다');
            return;
        }
        
        // 배송비 환경설정 먼저 로드 (매우 중요!)
        console.log('🚚 배송비 환경설정 로드 중...');
        await initShippingFeeFromSettings();
        console.log('✅ 배송비 환경설정 로드 완료:', SHIPPING_SETTINGS);
        
        // 주문채널: 풀 레이아웃일 때만 farm_channels 로드 (최소 레이아웃은 hidden 기본값 유튜브)
        await initOrderChannelFromSettings();
        // 대시보드형 레이아웃: 퀵상품 로드 + 채널 요약 동기화 + 모달 전체 스크롤 제거 + 하단 버튼 숨김
        if (document.getElementById('quick-product-buttons')) {
            await loadQuickProductsForMinimal();
            window.SHIPPING_SETTINGS = window.SHIPPING_SETTINGS || { defaultShippingFee: 3000, freeShippingThreshold: 50000 };
            const modalFooterSubmit = document.querySelector('#order-modal .border-t button[form="order-form"]');
            if (modalFooterSubmit) modalFooterSubmit.style.display = 'none';
            const scrollArea = document.querySelector('#order-modal .modal-content-scroll');
            if (scrollArea) {
                scrollArea.style.overflow = 'hidden';
                scrollArea.style.maxHeight = 'calc(98vh - 100px)';
                scrollArea.style.display = 'flex';
                scrollArea.style.flexDirection = 'column';
            }
            const formEl = document.getElementById('order-form');
            if (formEl) {
                formEl.style.flex = '1';
                formEl.style.minHeight = '0';
                formEl.style.display = 'flex';
                formEl.style.flexDirection = 'column';
            }
            const formParent = formEl && formEl.parentElement;
            if (formParent) {
                formParent.style.flex = '1';
                formParent.style.minHeight = '0';
                formParent.style.display = 'flex';
            }
            const statusSummary = document.getElementById('order-status-summary');
            if (statusSummary) {
                const statusSelect = document.getElementById('order-status');
                if (statusSelect) statusSummary.textContent = statusSelect.value;
            }
        }
        
        // 인기 상품 로드
        console.log('🔧 인기 상품 로드');
        loadPopularProducts();
        
        // 고객 검색 초기화
        if (window.initCustomerSearch) {
            console.log('🔧 고객 검색 초기화');
            initCustomerSearch();
        }
        
        // 상품 검색 UI 초기화
        if (window.initProductSearchUI) {
            console.log('🔧 상품 검색 UI 초기화');
            initProductSearchUI();
        }
        
        // 폼 유효성 검사 초기화
        if (window.initFormValidation) {
            console.log('🔧 폼 유효성 검사 초기화');
            initFormValidation();
        }
        
        // 주문 폼 제출 이벤트 핸들러 초기화
        if (window.initOrderFormSubmit) {
            console.log('🔧 주문 폼 제출 이벤트 핸들러 초기화');
            initOrderFormSubmit();
        }
        
        // 주문 요약 초기화
        console.log('🔧 주문 요약 초기화');
        updateOrderSummary();
        
        // 이벤트 리스너 설정
        console.log('🔧 이벤트 리스너 설정');
        setupOrderFormEventListeners();
        if (window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();

        // 폼 제출 이벤트 처리 - 주문 등록 버튼 클릭 시에만 처리
        if (orderForm) {
            orderForm.addEventListener('submit', function(event) {
                console.log('📝 폼 제출 이벤트 감지됨');
                console.log('🔍 event.submitter:', event.submitter);
                console.log('🔍 event.submitter type:', event.submitter?.type);
                console.log('🔍 event.submitter form:', event.submitter?.form);
                console.log('🔍 event.submitter onclick:', event.submitter?.getAttribute('onclick'));
                
                // 주문 등록 버튼이 클릭된 경우에만 처리
                const submitButton = event.submitter;
                const isOrderSubmitButton = submitButton && (
                    submitButton.getAttribute('data-order-submit') === 'true' ||
                    (submitButton.type === 'submit' && submitButton.getAttribute('form') === 'order-form') ||
                    (submitButton.type === 'submit' && submitButton.form === orderForm) ||
                    (submitButton.getAttribute('onclick') && submitButton.getAttribute('onclick').includes('handleOrderSubmit'))
                );
                
                console.log('🔍 주문 등록 버튼 여부:', isOrderSubmitButton);
                
                if (isOrderSubmitButton) {
                    console.log('✅ 주문 등록 버튼 클릭으로 폼 제출 처리');
                    // handleOrderSubmit 함수를 직접 호출하고 결과 확인
                    handleOrderSubmit(event).then(result => {
                        if (result === false) {
                            console.log('❌ 주문 제출 실패');
                        } else {
                            console.log('✅ 주문 제출 성공');
                        }
                    }).catch(error => {
                        console.error('❌ 주문 제출 중 오류:', error);
                    });
                } else {
                    console.log('🚫 일반 폼 제출 차단');
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
            console.log('✅ 폼 제출 이벤트 처리 설정 완료');
        }
        
        console.log('✅ 주문 폼 초기화 완료');
        
        // 주문 등록 버튼 확인
        const submitButton = document.querySelector('button[type="submit"][form="order-form"]');
        console.log('🔍 주문 등록 버튼:', submitButton);
        
        if (submitButton) {
            console.log('✅ 주문 등록 버튼 확인 완료');
        } else {
            console.error('❌ 주문 등록 버튼을 찾을 수 없습니다');
        }
        
    } catch (error) {
        console.error('❌ 주문 폼 초기화 실패:', error);
    }
}

// 주문 폼 이벤트 리스너 설정
function setupOrderFormEventListeners() {
    try {
        console.log('🔗 주문 폼 이벤트 리스너 설정');
        
        // 장바구니 변경 시 요약 업데이트
        const cartContainer = document.getElementById('cart-items-body');
        if (cartContainer) {
            cartContainer.addEventListener('change', updateOrderSummary);
            cartContainer.addEventListener('input', updateOrderSummary);
        }
        
        // 배송비 변경 시 요약 업데이트
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (shippingFeeInput) {
            shippingFeeInput.addEventListener('change', updateOrderSummary);
            shippingFeeInput.addEventListener('input', updateOrderSummary);
        }
        
        // 할인액 변경 시 요약 업데이트
        const discountAmountInput = document.getElementById('discount-amount');
        if (discountAmountInput) {
            discountAmountInput.addEventListener('change', updateOrderSummary);
            discountAmountInput.addEventListener('input', updateOrderSummary);
        }
        
        
        console.log('✅ 주문 폼 이벤트 리스너 설정 완료');
        
    } catch (error) {
        console.error('❌ 주문 폼 이벤트 리스너 설정 실패:', error);
    }
}


// 주문채널 옵션 초기화
function initOrderChannelOptions() {
    try {
        const channelSelect = document.getElementById('order-channel');
        if (!channelSelect) return;
        
        // 기본 채널 옵션들
        const defaultChannels = [
            '온라인몰',
            '전화주문',
            '카카오톡',
            '인스타그램',
            '네이버쇼핑',
            '쿠팡',
            '11번가',
            'G마켓',
            '옥션',
            '기타'
        ];
        
        channelSelect.innerHTML = defaultChannels.map(channel => 
            `<option value="${channel}">${channel}</option>`
        ).join('');
        
        console.log('✅ 주문채널 옵션 초기화 완료');
        
    } catch (error) {
        console.error('❌ 주문채널 옵션 초기화 실패:', error);
    }
}

// 배송비 설정 로드
function loadShippingSettings() {
    try {
        if (window.settingsDataManager) {
            window.settingsDataManager.loadSettings().then(settings => {
                const shippingFeeInput = document.getElementById('shipping-fee-input');
                // 주문별 입력: 사용자가 이미 수정했으면 제안값으로 덮어쓰지 않음
                if (shippingFeeInput && settings.shipping?.defaultShippingFee != null && !window._shippingFeeUserEdited) {
                    shippingFeeInput.value = Math.max(0, toIntegerWon(settings.shipping.defaultShippingFee));
                }
            });
        }
        console.log('✅ 배송비 설정 로드 완료');
    } catch (error) {
        console.error('❌ 배송비 설정 로드 실패:', error);
    }
}

// 주문채널: farm_channels DB 연동만 사용 (하드코딩 기본목록 없음)
async function initOrderChannelFromSettings() {
    try {
        const channelSelect = document.getElementById('order-channel');
        if (!channelSelect || channelSelect.tagName !== 'SELECT') return;

        let channels = [];
        if (window.salesChannelsDataManager) {
            try {
                await window.salesChannelsDataManager.loadChannels();
                channels = window.salesChannelsDataManager.getActiveChannels();
            } catch (e) {
                console.warn('⚠️ salesChannelsDataManager 로드 실패:', e);
            }
        }
        // salesChannelsDataManager 없거나 실패 시 Supabase에서 직접 조회 (주문 먼저 열었을 때 대비)
        if (channels.length === 0 && window.supabaseClient) {
            try {
                let res = await window.supabaseClient
                    .from('farm_channels')
                    .select('id, name, is_active')
                    .order('sort_order', { ascending: true });
                if (res.error) {
                    res = await window.supabaseClient
                        .from('farm_channels')
                        .select('id, name, is_active');
                }
                const { data, error } = res;
                if (!error && data && data.length > 0) {
                    channels = data.filter(c => c.is_active !== false).map(c => ({ name: c.name }));
                }
            } catch (e) {
                console.warn('⚠️ farm_channels 직접 조회 실패:', e);
            }
        }

        channelSelect.innerHTML = '<option value="">-- 채널 선택 --</option>';
        if (channels.length > 0) {
            channels.forEach(channel => {
                const name = channel.name || channel;
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                channelSelect.appendChild(option);
            });
            channelSelect.value = '';
            console.log('✅ 주문채널 옵션 로드 완료 (farm_channels):', channels.length, '개');
        } else {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '채널 없음 (환경설정 → 판매채널에서 추가)';
            channelSelect.appendChild(opt);
            channelSelect.value = '';
            console.warn('⚠️ 주문채널: farm_channels에 데이터가 없습니다. 환경설정에서 판매채널을 추가하세요.');
        }
        const chSummary = document.getElementById('order-channel-summary');
        if (chSummary) {
            const sel = document.getElementById('order-channel');
            if (sel) chSummary.textContent = sel.value || '채널 없음';
        }
    } catch (error) {
        console.error('❌ 주문채널 연동 실패:', error);
        const channelSelect = document.getElementById('order-channel');
        if (channelSelect) {
            channelSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '채널 없음 (환경설정 → 판매채널에서 추가)';
            channelSelect.appendChild(opt);
            channelSelect.value = '';
        }
        const chSummary = document.getElementById('order-channel-summary');
        if (chSummary) chSummary.textContent = '채널 없음';
    }
}

// 전역 배송비 설정 변수
let SHIPPING_SETTINGS = {
    defaultShippingFee: 3000,
    freeShippingThreshold: 50000
};

// 배송 방법 변경 처리
function updateShippingMethod() {
    console.log('🚚 배송 방법 변경됨');
    
    const shippingMethod = document.getElementById('shipping-method')?.value;
    console.log('🚚 선택된 배송 방법:', shippingMethod);
    
    // 배송비 자동 재계산
    updateOrderTotalDisplay();
    
    // 주소 필드 처리
    const addressField = document.getElementById('order-customer-address');
    if (shippingMethod === '방문수령') {
        // 방문수령일 경우 주소 입력 비활성화 (선택사항)
        if (addressField) {
            addressField.placeholder = '방문수령 (주소 입력 선택사항)';
        }
        console.log('✅ 방문수령 선택 - 배송비 0원');
    } else {
        // 택배/직접배송일 경우 주소 필수
        if (addressField) {
            addressField.placeholder = '배송 주소를 입력하세요';
        }
    }
}

// 배송비 환경설정 연동 (farm_settings 로드만, 입력란 덮어쓰기는 사용자 미편집 시에만)
async function initShippingFeeFromSettings() {
    try {
        console.log('🚚 배송비 환경설정 연동 초기화 (Supabase farm_settings 전용)');
        
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (!shippingFeeInput) {
            console.warn('⚠️ 배송비 입력 요소를 찾을 수 없습니다');
            return;
        }
        
        if (!window.settingsDataManager) {
            console.error('❌ settingsDataManager를 찾을 수 없습니다');
            return;
        }
        
        try {
            const settings = await window.settingsDataManager.loadSettings();
            
            if (settings && settings.shipping) {
                SHIPPING_SETTINGS.defaultShippingFee = settings.shipping.defaultShippingFee || 3000;
                SHIPPING_SETTINGS.freeShippingThreshold = settings.shipping.freeShippingThreshold || 50000;
                window.SHIPPING_SETTINGS = SHIPPING_SETTINGS;
                console.log('✅ 환경설정에서 배송비 설정 로드 완료:', SHIPPING_SETTINGS);
            }
            // 제안값 주입: 사용자가 한 번이라도 수정했으면 덮어쓰지 않음
            if (!window._shippingFeeUserEdited) {
                const defaultFee = (settings && settings.shipping && settings.shipping.defaultShippingFee) || SHIPPING_SETTINGS.defaultShippingFee || 3000;
                shippingFeeInput.value = Math.max(0, toIntegerWon(defaultFee));
                if (typeof updateShippingFeeDisplay === 'function') updateShippingFeeDisplay(shippingFeeInput.value);
            }
        } catch (error) {
            console.error('❌ 환경설정 배송비 조회 실패:', error);
            if (!window._shippingFeeUserEdited && shippingFeeInput) {
                shippingFeeInput.value = SHIPPING_SETTINGS.defaultShippingFee ?? 3000;
            }
        }
    } catch (error) {
        console.error('❌ 배송비 환경설정 연동 실패:', error);
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            shippingFeeInput.value = SHIPPING_SETTINGS.defaultShippingFee ?? 3000;
        }
    }
}

/** 새 주문 폼 최초 로드 시 1회만 제안값 적용 (환경설정 defaultShippingFee). clearOrderForm() 이후 호출. */
window.applyShippingFeeSuggestionForNewOrder = async function () {
    window._shippingFeeUserEdited = false;
    const el = document.getElementById('shipping-fee-input');
    if (!el) return;
    try {
        if (window.settingsDataManager) {
            const settings = await window.settingsDataManager.loadSettings();
            if (settings && settings.shipping != null) {
                SHIPPING_SETTINGS.defaultShippingFee = settings.shipping.defaultShippingFee ?? 3000;
                SHIPPING_SETTINGS.freeShippingThreshold = settings.shipping.freeShippingThreshold ?? 50000;
                window.SHIPPING_SETTINGS = SHIPPING_SETTINGS;
            }
        }
        if (!window._shippingFeeUserEdited) {
            const defaultFee = Math.max(0, toIntegerWon(SHIPPING_SETTINGS.defaultShippingFee ?? 3000));
            el.value = defaultFee;
            if (typeof window.updateCartTotal === 'function') window.updateCartTotal();
            else if (typeof window.updateOrderTotalDisplay === 'function') window.updateOrderTotalDisplay();
        }
    } catch (e) {
        if (!window._shippingFeeUserEdited) el.value = Math.max(0, toIntegerWon(SHIPPING_SETTINGS.defaultShippingFee ?? 3000));
    }
};

// 배송비 표시 업데이트
function updateShippingFeeDisplay(shippingFee) {
    try {
        const formattedFee = parseInt(shippingFee) || 0;
        console.log('🚚 배송비 표시 업데이트:', formattedFee);
        
        // 주문 총액 업데이트
        updateOrderTotalDisplay();
        
    } catch (error) {
        console.error('❌ 배송비 표시 업데이트 실패:', error);
    }
}

// 주문 총액 표시 업데이트
function updateOrderTotalDisplay() {
    try {
        console.log('💰 주문 총액 표시 업데이트');
        
        const totalSummary = document.getElementById('order-total-summary');
        if (!totalSummary) return;
        
        // 장바구니 아이템들 계산
        const cartItems = document.querySelectorAll('[data-product-id]');
        let productTotal = 0;
        let totalItems = 0;
        
        cartItems.forEach(item => {
            const quantityInput = item.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput?.value || 0);
            const priceText = item.querySelector('.text-xs.text-gray-500')?.textContent || '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            
            productTotal += price * quantity;
            totalItems += quantity;
        });
        
        // 배송비: 사용자가 수정 안 했으면 환경설정 제안(상품합계>=무료배송기준 → 0원, 아니면 기본배송비)
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
        const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
        let shippingFee;
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            const suggested = productTotal >= freeThreshold ? 0 : Math.max(0, toIntegerWon(defaultFee));
            shippingFeeInput.value = suggested;
            shippingFee = suggested;
        } else {
            shippingFee = shippingFeeInput ? Math.max(0, toIntegerWon(shippingFeeInput.value)) : 0;
        }
        
        // 할인액(원 단위 정수), 총액 = max(0, 상품+배송비-할인)
        const discountEl = document.getElementById('discount-amount');
        const discountAmount = toIntegerWon(discountEl?.value);
        if (discountEl && String(discountEl.value) !== String(discountAmount)) discountEl.value = Math.max(0, discountAmount);
        const rawTotal = productTotal + shippingFee - discountAmount;
        const finalTotal = Math.max(0, rawTotal);
        
        // 총액 표시 업데이트
        const productTotalElement = document.getElementById('product-total-amount');
        const shippingTotalElement = document.getElementById('shipping-total-amount');
        const discountTotalElement = document.getElementById('discount-total-amount');
        const finalTotalElement = document.getElementById('final-total-amount');
        const zeroWarning = document.getElementById('order-total-zero-warning');
        
        if (productTotalElement) productTotalElement.textContent = productTotal.toLocaleString() + '원';
        if (shippingTotalElement) shippingTotalElement.textContent = shippingFee.toLocaleString() + '원';
        if (discountTotalElement) discountTotalElement.textContent = '-' + discountAmount.toLocaleString() + '원';
        if (finalTotalElement) finalTotalElement.textContent = finalTotal.toLocaleString() + '원';
        if (zeroWarning) {
            zeroWarning.classList.toggle('hidden', rawTotal >= 0);
        }
        
        // 총액 요약 표시/숨김
        if (productTotal > 0) {
            totalSummary.classList.remove('hidden');
        } else {
            totalSummary.classList.add('hidden');
        }
        
        console.log('💰 주문 총액 업데이트:', {
            상품금액: productTotal,
            배송비: shippingFee,
            할인액: discountAmount,
            최종금액: finalTotal
        });
        
    } catch (error) {
        console.error('❌ 주문 총액 표시 업데이트 실패:', error);
    }
}

// 고객 검색 초기화
function initCustomerSearch() {
    try {
        console.log('🔍 고객 검색 초기화');
        
        // 고객 검색 관련 이벤트 리스너 설정
        const customerNameInput = document.getElementById('order-customer-name');
        if (customerNameInput) {
            // 검색 결과 외부 클릭 시 숨기기
            document.addEventListener('click', (e) => {
                const resultsDiv = document.getElementById('customer-search-results');
                if (resultsDiv && !resultsDiv.contains(e.target) && !customerNameInput.contains(e.target)) {
                    resultsDiv.classList.add('hidden');
                }
            });
        }
        
        console.log('✅ 고객 검색 초기화 완료');
        
    } catch (error) {
        console.error('❌ 고객 검색 초기화 실패:', error);
    }
}

// 상품 검색 UI 초기화
function initProductSearchUI() {
    try {
        console.log('🛍️ 상품 검색 UI 초기화');
        
        // 상품 검색 관련 이벤트 리스너 설정
        const productSearchInput = document.getElementById('product-search');
        if (productSearchInput) {
            // 검색 결과 외부 클릭 시 숨기기
            document.addEventListener('click', (e) => {
                const resultsDiv = document.getElementById('product-search-results');
                if (resultsDiv && !resultsDiv.contains(e.target) && !productSearchInput.contains(e.target)) {
                    resultsDiv.classList.add('hidden');
                }
            });
        }
        
        // 상품 목록 버튼 이벤트
        const showProductListBtn = document.getElementById('show-product-list');
        if (showProductListBtn) {
            showProductListBtn.addEventListener('click', (event) => {
                // 이벤트 전파 방지
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                console.log('📦 상품 목록 모달 표시');
                showProductManagementModal(event);
            });
        }
        
        console.log('✅ 상품 검색 UI 초기화 완료');
        
    } catch (error) {
        console.error('❌ 상품 검색 UI 초기화 실패:', error);
    }
}

// 주문 폼 데이터 수집
async function collectOrderFormData() {
    try {
        // 주소 조합 (기본주소 + 상세주소)
        const baseAddress = document.getElementById('order-customer-address')?.value || '';
        const detailAddress = document.getElementById('order-customer-address-detail')?.value || '';
        const fullAddress = baseAddress + (detailAddress ? ' ' + detailAddress : '');
        
        // 🆕 customer_id 가져오기 (정규화)
        const customerIdInput = document.getElementById('order-customer-id');
        const customerId = customerIdInput?.value || null;
        
        console.log('🔍 customer_id input 요소:', customerIdInput);
        console.log('🔍 customer_id 값:', customerId);
        
        const formData = {
            customer_id: customerId,
            customer_name: document.getElementById('order-customer-name')?.value || '',
            customer_phone: document.getElementById('order-customer-phone')?.value || '',
            customer_address: fullAddress,
            customer_address_base: baseAddress,
            customer_address_detail: detailAddress,
            order_status: document.getElementById('order-status')?.value || '입금대기',
            order_channel: document.getElementById('order-channel')?.value || '',
            shipping_method: document.getElementById('shipping-method')?.value || '택배',
            memo: document.getElementById('order-memo')?.value || '',
            shipping_fee: toIntegerWon(document.getElementById('shipping-fee-input')?.value),
            discount_amount: toIntegerWon(document.getElementById('discount-amount')?.value),
            items: await collectCartItems()
        };
        
        console.log('📝 주문 폼 데이터 수집:', formData);
        console.log('🆔 customer_id:', customerId || '없음 (레거시 방식)');
        return formData;
        
    } catch (error) {
        console.error('❌ 주문 폼 데이터 수집 실패:', error);
        return null;
    }
}

// 장바구니 아이템 수집 (단가 스냅샷·소계 = unit_price * qty, 원 단위 정수만)
async function collectCartItems() {
    try {
        const cartBody = document.getElementById('cart-items-body');
        if (!cartBody) return [];
        const rows = cartBody.querySelectorAll('tr[data-product-id]');
        const items = [];
        for (const row of rows) {
            const quantity = Math.max(1, toIntegerWon(row.querySelector('.quantity-input')?.value));
            const productId = row.getAttribute('data-product-id');
            const productName = row.getAttribute('data-product-name') || row.querySelector('td:first-child')?.textContent?.trim() || '';
            const unitPrice = toIntegerWon(row.getAttribute('data-unit-price') || row.getAttribute('data-price') || 0);
            const lineTotal = unitPrice * quantity;
            const size = row.getAttribute('data-size') || row.getAttribute('data-option-text') || null;
            items.push({
                product_id: productId,
                product_name: productName,
                quantity,
                price: unitPrice,
                total: lineTotal,
                size: size || undefined
            });
        }
        return items;
    } catch (error) {
        console.error('❌ 장바구니 아이템 수집 실패:', error);
        return [];
    }
}

// 상품관리 모달 표시
function showProductManagementModal(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('📦 상품관리 모달 표시');
        
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('product-management-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 상품관리 모달 HTML 생성
        const modalHTML = `
            <div id="product-management-modal" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="fixed inset-0 bg-black bg-opacity-50" onclick="closeProductManagementModal(event)"></div>
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <!-- 헤더 -->
                        <div class="bg-white border-b border-gray-200 px-4 py-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <button onclick="closeProductManagementModal(event)" 
                                            class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                                        <i class="fas fa-times"></i>
                                        <span>닫기</span>
                                    </button>
                                    <div class="h-6 w-px bg-gray-300"></div>
                                    <h1 class="text-lg font-bold text-gray-800">상품 목록</h1>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-gray-500">상품 선택</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 검색 바 -->
                        <div class="p-4 border-b border-gray-200">
                            <div class="flex space-x-2">
                                <input type="text" id="product-modal-search" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="상품명으로 검색..."
                                       oninput="searchProductsInModal(this.value)">
                                <button onclick="loadAllProducts()" 
                                        class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                                    전체 로드
                                </button>
                            </div>
                        </div>
                        
                        <!-- 상품 목록 -->
                        <div class="overflow-y-auto max-h-[calc(80vh-140px)]">
                            <div id="product-modal-list" class="p-4">
                                <div class="text-center text-gray-500 py-8">
                                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                    <p>상품 목록을 불러오는 중...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 상품 목록 로드
        loadAllProducts();
        
        console.log('✅ 상품관리 모달 표시 완료');
        
    } catch (error) {
        console.error('❌ 상품관리 모달 표시 실패:', error);
    }
}

// 상품관리 모달 닫기
function closeProductManagementModal(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('🗑️ 상품관리 모달 닫기');
        
        const modal = document.getElementById('product-management-modal');
        if (modal) {
            modal.remove();
        }
        
        // 선택된 상품 초기화
        selectedProducts.clear();
        
        console.log('🗑️ 모달 닫기 - 선택된 상품 초기화');
    } catch (error) {
        console.error('❌ 상품관리 모달 닫기 실패:', error);
    }
}

// 모든 상품 로드
async function loadAllProducts() {
    try {
        console.log('📦 모든 상품 로드 시작 (캐시 무효화)');
        
        const productList = document.getElementById('product-modal-list');
        if (!productList) return;
        
        // 로딩 표시
        productList.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>상품 목록을 불러오는 중...</p>
            </div>
        `;
        
        if (window.supabaseClient) {
            // 🔥 캐시 무효화: 타임스탬프 추가하여 항상 최신 데이터 가져오기
            const timestamp = new Date().getTime();
            console.log('🔄 캐시 무효화 타임스탬프:', timestamp);
            
            const { data, error } = await window.supabaseClient
                .from('farm_products')
                .select('id, name, price, image_url, stock, description, shipping_option, updated_at')
                .order('name');
            
            if (error) {
                console.error('❌ 상품 목록 로드 실패:', error);
                productList.innerHTML = `
                    <div class="text-center text-red-500 py-8">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>상품 목록을 불러올 수 없습니다</p>
                        <p class="text-sm">${error.message}</p>
                    </div>
                `;
                return;
            }
            
            if (data && data.length > 0) {
                // 🔍 로드된 상품 데이터 로그
                console.log('📦 로드된 상품 수:', data.length);
                console.log('📦 첫 번째 상품:', data[0]);
                console.log('📦 전체 상품 목록:', data.map(p => `${p.name} (${p.price}원)`).join(', '));
                
                productList.innerHTML = `
                    <!-- 선택된 상품 요약 -->
                    <div id="selected-products-summary" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 hidden">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-blue-800">선택된 상품: <span id="selected-count">0</span>개</span>
                            <button onclick="clearAllSelections()" class="text-xs text-blue-600 hover:text-blue-800">전체 해제</button>
                        </div>
                    </div>
                    
                    <!-- 상품 목록 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${data.map(product => `
                            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-shipping-option="${product.shipping_option || '일반배송'}">
                                <div class="flex items-start space-x-3 mb-3">
                                    <!-- 체크박스 -->
                                    <div class="flex-shrink-0 pt-1">
                                        <input type="checkbox" 
                                               id="product-${product.id}" 
                                               class="product-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                               data-shipping-option="${product.shipping_option || '일반배송'}"
                                               onchange="toggleProductSelection('${product.id}', '${product.name}', ${product.price}, '${product.shipping_option || '일반배송'}')">
                                    </div>
                                    
                                    <!-- 상품 이미지 -->
                                    <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        ${product.image_url ? 
                                            `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">` :
                                            `<i class="fas fa-seedling text-gray-400 text-xl"></i>`
                                        }
                                    </div>
                                    
                                    <!-- 상품 정보 -->
                                    <div class="flex-1 min-w-0">
                                        <h3 class="text-sm font-semibold text-gray-900 mb-1">${product.name}</h3>
                                        <p class="text-lg font-bold text-blue-600">${product.price.toLocaleString()}원</p>
                                    </div>
                                </div>
                                
                                <!-- 재고 및 배송 정보 -->
                                <div class="text-xs text-gray-500 mb-3 space-y-1">
                                    <div><i class="fas fa-box"></i> 재고: ${product.stock || 0}개</div>
                                    ${product.shipping_option && product.shipping_option !== '일반배송' ? 
                                        `<div class="text-blue-600 font-medium"><i class="fas fa-truck"></i> ${product.shipping_option}</div>` : 
                                        ''}
                                </div>
                                
                                <!-- 수량 입력 (체크박스가 선택되었을 때만 표시) -->
                                <div id="quantity-${product.id}" class="hidden">
                                    <label class="block text-xs text-gray-600 mb-1">수량</label>
                                    <div class="flex items-center space-x-2">
                                        <button type="button" onclick="decreaseQuantity('${product.id}')" 
                                                class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-xs">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" 
                                               id="qty-${product.id}" 
                                               class="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center" 
                                               value="1" min="1" max="${product.stock || 999}"
                                               onchange="validateQuantity('${product.id}', ${product.stock || 999})">
                                        <button type="button" onclick="increaseQuantity('${product.id}', ${product.stock || 999})" 
                                                class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-xs">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- 상품 설명 -->
                                ${product.description ? `
                                    <p class="text-xs text-gray-600 line-clamp-2 mt-2">${product.description}</p>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 하단 액션 버튼 -->
                    <div class="mt-6 flex justify-end space-x-3">
                        <button onclick="closeProductManagementModal(event)" 
                                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                            취소
                        </button>
                        <button onclick="addSelectedProductsToCart(event)" 
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                            선택한 상품 장바구니에 추가
                        </button>
                    </div>
                `;
                console.log('✅ 상품 목록 로드 완료:', data.length + '개');
            } else {
                productList.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-box-open text-2xl mb-2"></i>
                        <p>등록된 상품이 없습니다</p>
                    </div>
                `;
            }
        } else {
            console.error('❌ Supabase 클라이언트가 연결되지 않았습니다');
            productList.innerHTML = `
                <div class="text-center text-red-500 py-8">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>데이터베이스 연결이 필요합니다</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ 상품 목록 로드 실패:', error);
    }
}

// 모달에서 상품 검색
function searchProductsInModal(query) {
    try {
        console.log('🔍 모달에서 상품 검색:', query);
        
        // Grid 컨테이너 안의 모든 상품 카드 선택
        const gridContainer = document.querySelector('#product-modal-list .grid');
        if (!gridContainer) {
            console.warn('⚠️ 상품 그리드 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        const productCards = gridContainer.querySelectorAll(':scope > div');
        console.log('📦 검색 대상 상품 카드 수:', productCards.length);
        
        let matchCount = 0;
        productCards.forEach(card => {
            // h3 요소가 없으면 건너뛰기
            const h3Element = card.querySelector('h3');
            if (!h3Element) {
                console.warn('⚠️ h3 요소를 찾을 수 없는 카드:', card);
                return;
            }
            
            const productName = h3Element.textContent.toLowerCase();
            const matches = productName.includes(query.toLowerCase());
            
            if (matches || query.length === 0) {
                card.style.display = 'block';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        console.log('✅ 검색 완료:', matchCount + '개 상품 표시');
        
    } catch (error) {
        console.error('❌ 모달 상품 검색 실패:', error);
    }
}

// 모달에서 상품 선택
function selectProductFromModal(productId, productName, price) {
    try {
        console.log('🛍️ 모달에서 상품 선택:', { productId, productName, price });
        
        // 장바구니에 상품 추가
        if (window.addToCart) {
            window.addToCart(productId, productName, price, 1);
        }
        
        // 모달 닫기
        closeProductManagementModal();
        
        console.log('✅ 상품이 장바구니에 추가되었습니다');
        
    } catch (error) {
        console.error('❌ 모달 상품 선택 실패:', error);
    }
}

// 상품 선택 관련 함수들
let selectedProducts = new Map(); // 선택된 상품들을 저장하는 Map

// 상품 선택 토글
function toggleProductSelection(productId, productName, price, shippingOption = '일반배송') {
    try {
        console.log('🛍️ 상품 선택 토글:', { productId, productName, price, shippingOption });
        
        const checkbox = document.getElementById(`product-${productId}`);
        const quantityDiv = document.getElementById(`quantity-${productId}`);
        
        if (checkbox.checked) {
            // 상품 선택
            selectedProducts.set(productId, {
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                shipping_option: shippingOption
            });
            
            // 수량 입력창 표시
            quantityDiv.classList.remove('hidden');
            
            console.log('✅ 상품 선택됨:', productName);
        } else {
            // 상품 선택 해제
            selectedProducts.delete(productId);
            
            // 수량 입력창 숨기기
            quantityDiv.classList.add('hidden');
            
            console.log('❌ 상품 선택 해제됨:', productName);
        }
        
        // 선택된 상품 요약 업데이트
        updateSelectedProductsSummary();
        
    } catch (error) {
        console.error('❌ 상품 선택 토글 실패:', error);
    }
}

// 수량 증가
function increaseQuantity(productId, maxStock) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        const currentQuantity = parseInt(quantityInput.value) || 1;
        const newQuantity = Math.min(currentQuantity + 1, maxStock);
        
        quantityInput.value = newQuantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = newQuantity;
        }
        
        console.log('📈 수량 증가:', productId, newQuantity);
        
    } catch (error) {
        console.error('❌ 수량 증가 실패:', error);
    }
}

// 수량 감소
function decreaseQuantity(productId) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        const currentQuantity = parseInt(quantityInput.value) || 1;
        const newQuantity = Math.max(currentQuantity - 1, 1);
        
        quantityInput.value = newQuantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = newQuantity;
        }
        
        console.log('📉 수량 감소:', productId, newQuantity);
        
    } catch (error) {
        console.error('❌ 수량 감소 실패:', error);
    }
}

// 수량 유효성 검사
function validateQuantity(productId, maxStock) {
    try {
        const quantityInput = document.getElementById(`qty-${productId}`);
        let quantity = parseInt(quantityInput.value) || 1;
        
        // 최소값, 최대값 검사
        quantity = Math.max(1, Math.min(quantity, maxStock));
        quantityInput.value = quantity;
        
        // 선택된 상품 정보 업데이트
        if (selectedProducts.has(productId)) {
            selectedProducts.get(productId).quantity = quantity;
        }
        
        console.log('✅ 수량 유효성 검사 완료:', productId, quantity);
        
    } catch (error) {
        console.error('❌ 수량 유효성 검사 실패:', error);
    }
}

// 선택된 상품 요약 업데이트
function updateSelectedProductsSummary() {
    try {
        const summaryDiv = document.getElementById('selected-products-summary');
        const countSpan = document.getElementById('selected-count');
        
        if (summaryDiv && countSpan) {
            const selectedCount = selectedProducts.size;
            
            if (selectedCount > 0) {
                summaryDiv.classList.remove('hidden');
                countSpan.textContent = selectedCount;
            } else {
                summaryDiv.classList.add('hidden');
            }
        }
        
        console.log('📊 선택된 상품 요약 업데이트:', selectedProducts.size + '개');
        
    } catch (error) {
        console.error('❌ 선택된 상품 요약 업데이트 실패:', error);
    }
}

// 전체 선택 해제
function clearAllSelections() {
    try {
        console.log('🗑️ 전체 선택 해제');
        
        // 모든 체크박스 해제
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 모든 수량 입력창 숨기기
        const quantityDivs = document.querySelectorAll('[id^="quantity-"]');
        quantityDivs.forEach(div => {
            div.classList.add('hidden');
        });
        
        // 선택된 상품 맵 초기화
        selectedProducts.clear();
        
        // 요약 업데이트
        updateSelectedProductsSummary();
        
        console.log('✅ 전체 선택 해제 완료');
        
    } catch (error) {
        console.error('❌ 전체 선택 해제 실패:', error);
    }
}

// 선택된 상품들을 장바구니에 추가
function addSelectedProductsToCart(event) {
    try {
        // 이벤트 전파 방지
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('🛒 선택된 상품들을 장바구니에 추가:', selectedProducts.size + '개');
        
        if (selectedProducts.size === 0) {
            alert('선택한 상품이 없습니다.');
            return;
        }
        
        // 각 선택된 상품을 장바구니에 추가
        selectedProducts.forEach((product, productId) => {
            if (window.addToCart) {
                window.addToCart(productId, product.name, product.price, product.quantity, product.shipping_option || '일반배송');
            }
        });
        
        // 모달 닫기 (탭 전환 방지)
        closeProductManagementModal();
        
        // 선택된 상품 초기화
        selectedProducts.clear();
        
        console.log('✅ 선택된 상품들이 장바구니에 추가되었습니다');
        
    } catch (error) {
        console.error('❌ 선택된 상품 장바구니 추가 실패:', error);
    }
}

// 전역 스코프에 함수 등록
window.generateOrderFormHTML = generateOrderFormHTML;
window.initOrderForm = initOrderForm;
window.initOrderChannelOptions = initOrderChannelOptions;
window.initShippingFeeFromSettings = initShippingFeeFromSettings;
window.updateShippingFeeDisplay = updateShippingFeeDisplay;
window.updateShippingMethod = updateShippingMethod;
window.initCustomerSearch = initCustomerSearch;
window.initProductSearchUI = initProductSearchUI;
window.collectOrderFormData = collectOrderFormData;
window.collectCartItems = collectCartItems;
window.showProductManagementModal = showProductManagementModal;
window.closeProductManagementModal = closeProductManagementModal;
window.loadAllProducts = loadAllProducts;
window.searchProductsInModal = searchProductsInModal;
window.selectProductFromModal = selectProductFromModal;
window.updateOrderTotalDisplay = updateOrderTotalDisplay;
window.toggleProductSelection = toggleProductSelection;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.validateQuantity = validateQuantity;
window.clearAllSelections = clearAllSelections;
window.addSelectedProductsToCart = addSelectedProductsToCart;
window.handleOrderSubmit = handleOrderSubmit;

// 디버깅 함수들
window.testOrderButton = function() {
    console.log('🧪 주문 등록 버튼 테스트 시작');
    
    // 새 주문 등록 버튼 확인
    const addOrderBtn = document.getElementById('add-order-btn');
    console.log('🔍 새 주문 등록 버튼:', addOrderBtn);
    
    // 주문 모달 확인
    const orderModal = document.getElementById('order-modal');
    console.log('🔍 주문 모달:', orderModal);
    
    // 주문 폼 확인
    const orderForm = document.getElementById('order-form');
    console.log('🔍 주문 폼:', orderForm);
    
    // 주문 등록 버튼 확인
    const submitButton = document.querySelector('button[type="submit"][form="order-form"]');
    const orderSubmitButton = document.querySelector('button[data-order-submit="true"]');
    console.log('🔍 주문 등록 버튼 (form):', submitButton);
    console.log('🔍 주문 등록 버튼 (data):', orderSubmitButton);
    
    // 이벤트 리스너 확인
    console.log('🔍 window.openOrderModal:', !!window.openOrderModal);
    console.log('🔍 window.initOrderForm:', !!window.initOrderForm);
    console.log('🔍 window.handleOrderSubmit:', !!window.handleOrderSubmit);
    
    return {
        addOrderBtn: !!addOrderBtn,
        orderModal: !!orderModal,
        orderForm: !!orderForm,
        submitButton: !!submitButton,
        openOrderModal: !!window.openOrderModal,
        initOrderForm: !!window.initOrderForm,
        handleOrderSubmit: !!window.handleOrderSubmit
    };
};

window.testOrderButtonClick = function() {
    console.log('🧪 주문 등록 버튼 클릭 테스트');
    
    const addOrderBtn = document.getElementById('add-order-btn');
    if (addOrderBtn) {
        console.log('✅ 새 주문 등록 버튼 클릭 시뮬레이션');
        addOrderBtn.click();
    } else {
        console.error('❌ 새 주문 등록 버튼을 찾을 수 없습니다');
    }
};

window.testOrderSubmit = function() {
    console.log('🧪 주문 제출 테스트');
    
    const submitButton = document.querySelector('button[data-order-submit="true"]');
    if (submitButton) {
        console.log('✅ 주문 등록 버튼 클릭 시뮬레이션');
        submitButton.click();
    } else {
        console.error('❌ 주문 등록 버튼을 찾을 수 없습니다');
    }
};

window.testOrderFormSubmit = function() {
    console.log('🧪 주문 폼 제출 테스트');
    
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        console.log('✅ 주문 폼 제출 이벤트 시뮬레이션');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        orderForm.dispatchEvent(submitEvent);
    } else {
        console.error('❌ 주문 폼을 찾을 수 없습니다');
    }
};

window.testCartStatus = function() {
    console.log('🧪 장바구니 상태 테스트');
    
    const cartItems = document.querySelectorAll('[data-product-id]');
    const cartItemsBody = document.getElementById('cart-items-body');
    
    console.log('🔍 장바구니 상태:');
    console.log('  - 장바구니 아이템 수:', cartItems.length);
    console.log('  - 장바구니 테이블 바디:', cartItemsBody);
    
    cartItems.forEach((item, index) => {
        const productId = item.getAttribute('data-product-id');
        const price = item.getAttribute('data-price');
        const quantityInput = item.querySelector('.quantity-input');
        const quantity = quantityInput ? quantityInput.value : 'N/A';
        
        console.log(`  - 아이템 ${index + 1}:`, {
            productId: productId,
            price: price,
            quantity: quantity
        });
    });
    
    // 장바구니 총액 계산 테스트
    if (window.updateCartTotal) {
        console.log('🧪 장바구니 총액 계산 테스트');
        window.updateCartTotal();
    }
    
    return {
        itemCount: cartItems.length,
        cartItemsBody: !!cartItemsBody,
        updateCartTotal: !!window.updateCartTotal
    };
};

// Supabase 연결 테스트 함수
function testSupabaseConnection() {
    try {
        console.log('🧪 Supabase 연결 테스트 시작');
        console.log('🔍 window.supabaseClient:', !!window.supabaseClient);
        console.log('🔍 window.supabase:', !!window.supabase);
        console.log('🔍 window.SUPABASE_CONFIG:', !!window.SUPABASE_CONFIG);
        
        if (window.supabaseClient) {
            console.log('✅ Supabase 클라이언트 존재');
            return true;
        } else {
            console.error('❌ Supabase 클라이언트 없음');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        return false;
    }
}

// 기존 고객 검색 함수 (이름 첫글자·연락처 뒷자리 포함, 1글자부터 검색)
function searchExistingCustomers(query) {
    try {
        // 최소 레이아웃(order-customer-search) 또는 풀 레이아웃(order-customer-name)에서 검색어 읽기
        const searchInput = document.getElementById('order-customer-search') || document.getElementById('order-customer-name');
        const searchValue = (typeof query !== 'undefined' && query !== null ? String(query) : (searchInput ? searchInput.value : '')).trim();
        if (searchValue.length === 0) {
            const resultsDiv = document.getElementById('customer-search-results');
            if (resultsDiv) resultsDiv.classList.add('hidden');
            return;
        }
        if (!testSupabaseConnection()) return;
        if (!window.supabaseClient) return;
        // 1글자부터 검색 (이름 첫글자·연락처 뒷자리)
        const q = searchValue.replace(/\s/g, '%');
            window.supabaseClient
                .from('farm_customers')
                .select('id, name, phone, address, address_detail, grade')
                .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
                .limit(8)
                .then(({ data, error }) => {
                    console.log('🔍 Supabase 검색 결과:', { data, error });
                    
                    if (error) {
                        console.error('❌ 고객 검색 오류:', error);
                        return;
                    }
                    
                    const resultsDiv = document.getElementById('customer-search-results');
                    console.log('🔍 검색 결과 컨테이너:', resultsDiv);
                    
                    if (!resultsDiv) {
                        console.error('❌ 검색 결과 컨테이너를 찾을 수 없습니다');
                        return;
                    }
                    
                    console.log('🔍 검색 결과 데이터:', data);
                    console.log('🔍 데이터 길이:', data ? data.length : 'null');
                    
                    if (data && data.length > 0) {
                        console.log('🔍 검색 결과 있음:', data.length, '개');
                        resultsDiv.innerHTML = data.map(customer => {
                            const addr = (customer.address || '').replace(/'/g, "\\'");
                            const addrDetail = (customer.address_detail || '').replace(/'/g, "\\'");
                            return `
                            <div class="p-3 hover:bg-blue-50 hover:text-blue-900 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors duration-150"
                                 onclick="selectCustomerFromSearch('${customer.id}', '${(customer.name || '').replace(/'/g, "\\'")}', '${(customer.phone || '').replace(/'/g, "\\'")}', '${addr}', '${customer.grade || 'GENERAL'}', '${addrDetail}')">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i class="fas fa-user text-blue-600 text-xs"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                                            <div class="text-xs text-gray-500">${customer.phone}</div>
                                        </div>
                                    </div>
                                    <div class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">${customer.grade || 'GENERAL'}</div>
                                </div>
                            </div>
                        `;
                        }).join('');
                        resultsDiv.classList.remove('hidden');
                        console.log('✅ 검색 결과 표시 완료');
                    } else {
                        console.log('🔍 검색 결과 없음, 인라인 입력 안내');
                        const safeQuery = (searchValue || '').replace(/'/g, "\\'");
                        resultsDiv.innerHTML = `
                            <div class="p-3 text-gray-600 border-b border-gray-100">
                                <div class="text-xs font-medium text-gray-700 mb-1">검색 결과 없음</div>
                                <div class="text-[11px] text-gray-500">아래 고객명·연락처·주소를 직접 입력한 뒤 주문 저장하면 고객이 자동 등록됩니다.</div>
                            </div>
                            <div class="p-2 hover:bg-green-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
                                 onclick="openNewCustomerRegistration('${safeQuery}')">
                                <div class="flex items-center space-x-2 text-xs text-green-700">
                                    <i class="fas fa-plus text-green-600"></i>
                                    <span>"${(searchValue || '').replace(/"/g, '&quot;')}" 로 고객 등록 모달 열기</span>
                                </div>
                            </div>
                        `;
                        resultsDiv.classList.remove('hidden');
                    }
                });
    } catch (error) {
        console.error('❌ 고객 검색 실패:', error);
    }
}

// 고객 검색 결과에서 고객 선택 (주소·상세주소 자동 입력, 수정 불가)
function selectCustomerFromSearch(customerId, name, phone, address, grade, addressDetail) {
    try {
        const nameInput = document.getElementById('order-customer-name');
        const phoneInput = document.getElementById('order-customer-phone');
        const addressInput = document.getElementById('order-customer-address');
        const detailInput = document.getElementById('order-customer-address-detail');
        const searchInput = document.getElementById('order-customer-search');
        if (nameInput) { nameInput.value = name || ''; nameInput.readOnly = true; nameInput.classList.add('bg-gray-100'); }
        if (phoneInput) { phoneInput.value = phone || ''; phoneInput.readOnly = true; phoneInput.classList.add('bg-gray-100'); }
        if (addressInput) { addressInput.value = address || ''; addressInput.readOnly = true; addressInput.classList.add('bg-gray-100'); }
        if (detailInput) { detailInput.value = addressDetail || ''; detailInput.readOnly = true; detailInput.classList.add('bg-gray-100'); }
        if (searchInput) { searchInput.value = name || ''; searchInput.blur(); }
        let customerIdInput = document.getElementById('order-customer-id');
        if (!customerIdInput && document.getElementById('order-form')) {
            customerIdInput = document.createElement('input');
            customerIdInput.type = 'hidden';
            customerIdInput.id = 'order-customer-id';
            customerIdInput.name = 'customer_id';
            document.getElementById('order-form').appendChild(customerIdInput);
        }
        if (customerIdInput) customerIdInput.value = customerId || '';
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) resultsDiv.classList.add('hidden');
        // 버튼 활성화: 고객 선택 완료 시 저장 버튼 활성화
        if (window.updateOrderSubmitButtonState) window.updateOrderSubmitButtonState();
    } catch (error) {
        console.error('❌ 고객 선택 처리 실패:', error);
    }
}

// 신규 고객 등록 모달 열기
function openNewCustomerRegistration(customerName) {
    try {
        console.log('🆕 신규 고객 등록 모달 열기:', customerName);
        
        // 고객명을 임시 저장
        window.tempCustomerName = customerName;
        
        // 주문 모달을 일시적으로 숨기기
        const orderModal = document.getElementById('order-modal');
        if (orderModal) {
            orderModal.style.display = 'none';
        }
        
        // 고객 등록 모달 열기
        if (window.openCustomerModal) {
            window.openCustomerModal(null, customerName, function(newCustomer) {
                // 고객 등록 완료 후 주문 폼에 정보 입력
                if (newCustomer) {
                    selectCustomerFromSearch(
                        newCustomer.id,
                        newCustomer.name,
                        newCustomer.phone,
                        newCustomer.address,
                        newCustomer.grade || 'GENERAL',
                        newCustomer.address_detail || ''
                    );
                }
                
                // 주문 모달 다시 표시
                if (orderModal) {
                    orderModal.style.display = 'block';
                }
            });
        } else {
            console.error('❌ 고객 등록 모달을 열 수 없습니다');
            alert('고객 등록 기능을 사용할 수 없습니다.');
        }
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('customer-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ 신규 고객 등록 모달 열기 실패:', error);
    }
}

// 상품 검색 함수 (완전 구현)
function searchProducts(query) {
    try {
        console.log('🔍 상품 검색:', query);

        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase 클라이언트를 찾을 수 없습니다');
            return;
        }

        // 빈 쿼리: 전체 상품 목록 표시 (클릭 시), 아닌 경우 필터 검색
        const dbQuery = window.supabaseClient
            .from('farm_products')
            .select('id, name, price, stock, category, description, image_url');

        const promise = (!query || query.trim().length === 0)
            ? dbQuery.order('name', { ascending: true }).limit(30)
            : dbQuery.or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`).limit(15);

        promise.then(({ data, error }) => {
                    if (error) {
                        console.error('❌ 상품 검색 오류:', error);
                        return;
                    }

                    const resultsDiv = document.getElementById('product-search-results');
                    if (!resultsDiv) return;

                    if (data && data.length > 0) {
                        resultsDiv.innerHTML = data.map(product => `
                            <div class="search-result-item"
                                 onmousedown="event.preventDefault();"
                                 onclick="addProductToCart('${product.id}', ${JSON.stringify(product.name)}, ${product.price}, ${product.stock}, event)">
                                <span class="search-result-name">${product.name}</span>
                                <span class="search-result-cat">${(product.category||'')}</span>
                                <span class="search-result-price">${product.price.toLocaleString()}원</span>
                                <span class="search-result-stock">재고 ${product.stock}</span>
                            </div>
                        `).join('');
                        resultsDiv.classList.remove('hidden');
                    } else {
                        resultsDiv.innerHTML = `<div class="search-result-empty">검색 결과가 없습니다</div>`;
                        resultsDiv.classList.remove('hidden');
                    }
                });
        
    } catch (error) {
        console.error('❌ 상품 검색 실패:', error);
    }
}

// 상품을 장바구니에 추가
function addProductToCart(productId, productName, price, stock, event) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (stock <= 0) {
            alert('재고가 부족합니다.');
            return;
        }
        // 최소 레이아웃: 2열 장바구니 + 퀵상품 형식으로 추가
        if (document.getElementById('quick-product-buttons') && window.addQuickProductToCart) {
            window.addQuickProductToCart(productId, productName, price);
            const resultsDiv = document.getElementById('product-search-results');
            if (resultsDiv) resultsDiv.classList.add('hidden');
            const searchInput = document.getElementById('product-search');
            if (searchInput) searchInput.value = '';
            return;
        }
        const cartItemsBody = document.getElementById('cart-items-body');
        if (!cartItemsBody) return;
        const existingRow = cartItemsBody.querySelector(`tr[data-product-id="${productId}"]`);
        if (existingRow) {
            // 수량 증가
            const quantityInput = existingRow.querySelector('.quantity-input');
            if (quantityInput) {
                const currentQuantity = parseInt(quantityInput.value) || 0;
                const newQuantity = Math.min(currentQuantity + 1, stock);
                quantityInput.value = newQuantity;
                updateCartItemTotal(existingRow);
            }
        } else {
            // 새 상품 추가
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-product-id', productId);
            newRow.innerHTML = `
                <td class="px-3">
                    <div class="font-medium td-primary">${productName}</div>
                </td>
                <td class="px-3">
                    <span class="td-secondary">${price.toLocaleString()}원</span>
                </td>
                <td class="px-3 text-center">
                    <div class="flex items-center justify-center space-x-1">
                        <button onclick="decreaseQuantity('${productId}')" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs">-</button>
                        <input type="number" class="quantity-input w-12 text-center text-sm border border-gray-300 rounded" 
                               value="1" min="1" max="${stock}" onchange="updateCartItemTotal(this.closest('tr'))">
                        <button onclick="increaseQuantity('${productId}')" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs">+</button>
                    </div>
                </td>
                <td class="px-3">
                    <span class="font-semibold text-blue-600 cart-item-total">${price.toLocaleString()}원</span>
                </td>
                <td class="px-3 text-center">
                    <button onclick="removeCartItem('${productId}')" class="text-red-500 hover:text-red-700 text-xs">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // 빈 메시지 행 제거
            const emptyRow = cartItemsBody.querySelector('tr td[colspan="5"]');
            if (emptyRow && emptyRow.closest('tr')) {
                emptyRow.closest('tr').remove();
            }
            
            cartItemsBody.appendChild(newRow);
        }
        
        // 검색 결과 숨기기
        const resultsDiv = document.getElementById('product-search-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
        // 상품 검색 필드 초기화
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 장바구니 총액 업데이트
        updateCartTotal();
        
        console.log('✅ 상품 장바구니 추가 완료');
        
    } catch (error) {
        console.error('❌ 상품 장바구니 추가 실패:', error);
    }
}

// 신규 고객 정보 미완성 시 주문 저장 버튼 비활성화 (customer_id 없으면 이름+연락처 필수)
function updateOrderSubmitButtonState() {
    const btn = document.getElementById('order-submit-btn');
    if (!btn) return;
    const customerIdEl = document.getElementById('order-customer-id');
    const nameEl = document.getElementById('order-customer-name');
    const phoneEl = document.getElementById('order-customer-phone');
    const customerId = (customerIdEl && customerIdEl.value) ? String(customerIdEl.value).trim() : '';
    const name = (nameEl && nameEl.value) ? String(nameEl.value).trim() : '';
    const phone = (phoneEl && phoneEl.value) ? String(phoneEl.value).trim() : '';
    const canSave = !!customerId || (!!name && !!phone);
    btn.disabled = !canSave;
}

// 전역 함수로 등록
window.searchExistingCustomers = searchExistingCustomers;
window.selectCustomerFromSearch = selectCustomerFromSearch;
window.openNewCustomerRegistration = openNewCustomerRegistration;
window.searchProducts = searchProducts;
window.addProductToCart = addProductToCart;
window.testSupabaseConnection = testSupabaseConnection;
window.handleOrderSubmit = handleOrderSubmit;
window.updateOrderSubmitButtonState = updateOrderSubmitButtonState;

// 주소는 고객 선택 시 자동으로 입력되므로 주소 검색 기능 불필요

// 폼 유효성 검사 및 버튼 활성화 초기화
function initFormValidation() {
    try {
        console.log('🔍 폼 유효성 검사 초기화');
        
        // 필수 필드들
        const requiredFields = [
            'order-customer-name',
            'order-customer-phone', 
            'order-customer-address'
        ];
        
        // 폼 필드 변경 이벤트 리스너 추가
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', validateForm);
                field.addEventListener('change', validateForm);
            }
        });
        
        // 장바구니 변경 이벤트 리스너 추가
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            // MutationObserver로 장바구니 변경 감지
            const observer = new MutationObserver(() => {
                validateForm();
                updateCartTotal(); // 배송비 자동 계산
            });
            observer.observe(cartItems, { childList: true, subtree: true });
        }
        
        // 초기 유효성 검사
        validateForm();
        
        console.log('✅ 폼 유효성 검사 초기화 완료');
        
    } catch (error) {
        console.error('❌ 폼 유효성 검사 초기화 실패:', error);
    }
}

// 폼 유효성 검사 함수
function validateForm() {
    try {
        console.log('🔍 폼 유효성 검사 실행');
        
        // 필수 필드 검사
        const customerName = document.getElementById('order-customer-name')?.value?.trim();
        const customerPhone = document.getElementById('order-customer-phone')?.value?.trim();
        const customerAddress = document.getElementById('order-customer-address')?.value?.trim();
        
        // 장바구니 아이템 검사 - 더 정확한 검사
        const cartItemsBody = document.getElementById('cart-items-body');
        let hasCartItems = false;
        
        if (cartItemsBody) {
            const cartRows = cartItemsBody.querySelectorAll('tr[data-product-id]');
            hasCartItems = cartRows.length > 0;
            
            // 빈 메시지 행이 있는지도 확인
            const emptyMessage = cartItemsBody.querySelector('tr td[colspan="5"]');
            if (emptyMessage) {
                hasCartItems = false;
            }
        }
        
        // 전화번호 형식 검사
        const phonePattern = /^[0-9-+\s()]+$/;
        const isValidPhone = customerPhone && phonePattern.test(customerPhone) && customerPhone.length >= 10;
        
        // 유효성 검사 결과
        const isValid = customerName && isValidPhone && customerAddress && hasCartItems;
        
        console.log('📋 유효성 검사 결과:', {
            customerName: !!customerName,
            customerPhone: !!customerPhone,
            isValidPhone: isValidPhone,
            customerAddress: !!customerAddress,
            hasCartItems: hasCartItems,
            isValid: isValid
        });
        
        // 주문 등록 버튼 활성화/비활성화
        const submitButton = document.querySelector('button[onclick*="handleOrderSubmit"]');
        if (submitButton) {
            if (isValid) {
                submitButton.disabled = false;
                submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
                submitButton.classList.add('hover:bg-blue-700');
            } else {
                submitButton.disabled = true;
                submitButton.classList.add('opacity-50', 'cursor-not-allowed');
                submitButton.classList.remove('hover:bg-blue-700');
            }
        }
        
        // 유효성 검사 실패 시 사용자에게 알림
        if (!isValid) {
            const missingFields = [];
            if (!customerName) missingFields.push('고객명');
            if (!isValidPhone) missingFields.push('올바른 전화번호');
            if (!customerAddress) missingFields.push('주소');
            if (!hasCartItems) missingFields.push('상품');
            
            console.log('⚠️ 누락된 필드:', missingFields);
        }
        
        return isValid;
        
    } catch (error) {
        console.error('❌ 폼 유효성 검사 실패:', error);
        return false;
    }
}

// 주문 폼 제출 이벤트 핸들러 초기화
function initOrderFormSubmit() {
    try {
        console.log('📝 주문 폼 제출 이벤트 핸들러 초기화');
        
        // 주문 등록 버튼은 onclick으로 처리되므로 별도 이벤트 리스너 불필요
        console.log('✅ 주문 등록 버튼은 onclick으로 처리됨');
        
    } catch (error) {
        console.error('❌ 주문 폼 제출 이벤트 핸들러 초기화 실패:', error);
    }
}

// 주문 제출 처리 함수
async function handleOrderSubmit(event) {
    try {
        console.log('📝 주문 제출 처리 시작');
        console.log('🔍 현재 페이지 URL:', window.location.href);
        console.log('🔍 이벤트 객체:', event);
        
        // 이벤트 기본 동작 차단 (페이지 새로고침 방지)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log('🔒 이벤트 기본 동작 차단 완료');
        }
        
        // 폼 유효성 검사
        console.log('🔍 폼 유효성 검사 시작');
        const isValid = validateForm();
        console.log('📋 폼 유효성 검사 결과:', isValid);
        
        if (!isValid) {
            console.warn('⚠️ 폼 유효성 검사 실패');
            const missingFields = [];
            const customerName = document.getElementById('order-customer-name')?.value?.trim();
            const customerPhone = document.getElementById('order-customer-phone')?.value?.trim();
            const customerAddress = document.getElementById('order-customer-address')?.value?.trim();
            const cartItemsBody = document.getElementById('cart-items-body');
            const hasCartItems = cartItemsBody && cartItemsBody.querySelectorAll('tr[data-product-id]').length > 0;
            
            if (!customerName) missingFields.push('고객명');
            if (!customerPhone) missingFields.push('전화번호');
            if (!customerAddress) missingFields.push('주소');
            if (!hasCartItems) missingFields.push('상품');
            
            console.log('❌ 누락된 필드:', missingFields);
            alert(`다음 항목을 확인해주세요:\n${missingFields.join(', ')}`);
            return false; // 명시적으로 false 반환
        }
        
        console.log('✅ 폼 유효성 검사 통과');
        
        // 주문 데이터 수집
        console.log('📦 주문 데이터 수집 시작');
        const orderData = await collectOrderFormData();
        console.log('📦 수집된 주문 데이터:', orderData);
        
        if (!orderData) {
            console.error('❌ 주문 데이터 수집 실패');
            alert('주문 데이터를 수집하는 중 오류가 발생했습니다.');
            return false;
        }
        
        // 아이템 데이터 검증
        if (!orderData.items || orderData.items.length === 0) {
            console.warn('⚠️ 장바구니에 상품이 없습니다');
            alert('장바구니에 상품을 추가해주세요.');
            return false;
        }
        
        // 금액 검증 추가
        const totalAmount = calculateTotalAmount(orderData);
        console.log('💰 계산된 총 금액:', totalAmount);
        
        if (totalAmount <= 0) {
            console.error('❌ 주문 금액이 0원입니다. 상품 가격을 확인해주세요.');
            alert('주문 금액이 0원입니다. 상품 가격을 확인해주세요.');
            return false;
        }
        
        console.log('✅ 주문 데이터 수집 및 검증 완료');
        
        // 수정 모드인지 확인
        const isEditMode = window.currentEditingOrderId !== null && window.currentEditingOrderId !== undefined;
        console.log('🔍 주문 처리 모드:', isEditMode ? '수정' : '등록');

        // Fix #4: 수정 모드 재고 조정을 위해 저장 전에 기존 아이템 미리 조회
        let oldOrderItems = [];
        if (isEditMode && window.currentEditingOrderId && window.supabaseClient) {
            try {
                const { data: existingItems } = await window.supabaseClient
                    .from('farm_order_items')
                    .select('product_id, product_name, quantity')
                    .eq('order_id', window.currentEditingOrderId);
                oldOrderItems = existingItems || [];
                console.log(`📦 수정 전 기존 아이템 ${oldOrderItems.length}개 조회 완료`);
            } catch (e) {
                console.warn('⚠️ 기존 아이템 조회 실패 (재고 조정 불가):', e);
            }
        }

        let supabaseOrderData;
        
        // 데이터 단일화: 품목은 farm_order_items만 SSOT. 트랜잭션 RPC 우선 사용.
        const itemsPayload = orderData.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || '상품명 없음',
            quantity: Math.max(1, toIntegerWon(item.quantity)),
            price: toIntegerWon(item.price),
            total: toIntegerWon(item.total),
            size: item.size || null
        }));
        
        console.log('🔍 Supabase 클라이언트 확인...');
        if (!window.supabaseClient) {
            if (window.initializeSupabaseClient) {
                const initialized = window.initializeSupabaseClient();
                if (!initialized) throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
            } else {
                throw new Error('Supabase 클라이언트가 연결되지 않았습니다.');
            }
        }
        
        let data = [];
        let orderId = null;
        
        // 단일 트랜잭션 RPC만 사용. 부분 저장 금지 — 실패 시 재시도/에러만.
        const rpcResult = await window.supabaseClient.rpc('upsert_order_with_items', {
            p_order_id: isEditMode ? window.currentEditingOrderId : null,
            p_order_number: isEditMode ? null : (() => {
                const d = new Date();
                const yy = String(d.getFullYear()).slice(2);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
                return `ORD-${yy}${mm}${dd}-${rand}`;
            })(),
            p_order_date: isEditMode ? null : new Date().toISOString(),
            p_customer_id: orderData.customer_id || null,
            p_customer_name: orderData.customer_name || '',
            p_customer_phone: orderData.customer_phone || '',
            p_customer_address: orderData.customer_address || '',
            p_customer_address_detail: orderData.customer_address_detail || null,
            p_order_status: orderData.order_status || '주문접수',
            p_order_channel: orderData.order_channel || '',
            p_memo: orderData.memo || '',
            p_shipping_fee: toIntegerWon(orderData.shipping_fee),
            p_discount_amount: toIntegerWon(orderData.discount_amount),
            p_items: itemsPayload
        });
        if (rpcResult.error) throw new Error(rpcResult.error.message || '주문 저장 실패');
        const payload = rpcResult.data;
        if (!payload || !payload.success || !payload.id) throw new Error('RPC 반환 데이터 없음');
        orderId = payload.id;
        data = [{ id: orderId }];
        console.log('✅ upsert_order_with_items 성공:', orderId, payload.order_row ? '(order_row 반환)' : '');
        if (payload.order_row && window.orderDataManager) {
            try {
                const list = Array.isArray(window.orderDataManager.farm_order_rows) ? window.orderDataManager.farm_order_rows : [];
                const idx = list.findIndex((r) => r.order_id === orderId);
                const row = { ...payload.order_row, order_id: orderId };
                if (idx >= 0) list[idx] = row; else list.unshift(row);
                window.orderDataManager.farm_order_rows = list;
                window.orderDataManager._lastCountRows = window.orderDataManager._computeCountsFromOrderRows(list);
                window.orderDataManager.updateFilterCountsFromRpc(window.orderDataManager._lastCountRows);
            } catch (e) { console.warn('주문 목록 반영 실패:', e?.message); }
        }
        try {
            const { data: validateData } = await window.supabaseClient.rpc('validate_order_total_amount', { p_order_id: orderId });
            if (validateData && !validateData.ok) console.warn('⚠️ 주문 저장 정합성 불일치:', validateData);
        } catch (_) { /* optional */ }

        const savedOrder = data[0] || { id: orderId };
        orderId = savedOrder.id;
        
        // 재고 처리 (신규: 차감 / 수정: 기존 복원 후 신규 차감)
        if (orderId) {
            console.log('📦 재고 처리 시작...');
            try {
                if (!isEditMode) {
                    // 신규 주문: 재고 차감
                    for (const item of orderData.items) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock, name').eq('id', item.product_id).single();
                        if (!p) continue;
                        const newStock = Math.max(0, (p.stock ?? 0) - item.quantity);
                        await window.supabaseClient.from('farm_products').update({ stock: newStock }).eq('id', item.product_id);
                        console.log(`✅ 신규 재고 차감 ${item.product_name}: ${p.stock}개 → ${newStock}개`);
                    }
                } else if (oldOrderItems.length > 0) {
                    // Fix #4: 수정 주문: 기존 아이템 재고 복원 → 신규 아이템 재고 차감
                    for (const item of oldOrderItems) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock').eq('id', item.product_id).single();
                        if (!p) continue;
                        await window.supabaseClient.from('farm_products').update({ stock: (p.stock || 0) + item.quantity }).eq('id', item.product_id);
                        console.log(`✅ 수정 재고 복원 ${item.product_name}: +${item.quantity}개`);
                    }
                    for (const item of orderData.items) {
                        if (!item.product_id) continue;
                        const { data: p } = await window.supabaseClient.from('farm_products').select('stock').eq('id', item.product_id).single();
                        if (!p) continue;
                        const newStock = Math.max(0, (p.stock || 0) - item.quantity);
                        await window.supabaseClient.from('farm_products').update({ stock: newStock }).eq('id', item.product_id);
                        console.log(`✅ 수정 재고 차감 ${item.product_name}: ${p.stock}개 → ${newStock}개`);
                    }
                }
            } catch (stockError) {
                console.error('❌ 재고 처리 중 오류:', stockError);
            }
        }
        
        // 🔥 고객 등급 자동 업데이트 (주문 완료 시)
        if (!isEditMode && orderData.customer_phone) {
            console.log('📊 고객 등급 자동 업데이트 시작...');
            try {
                if (window.updateCustomerGradeAfterOrder) {
                    await window.updateCustomerGradeAfterOrder(orderData.customer_phone, calculateTotalAmount(orderData));
                    console.log('✅ 고객 등급 자동 업데이트 완료');
                } else {
                    console.warn('⚠️ updateCustomerGradeAfterOrder 함수를 찾을 수 없습니다');
                }
            } catch (gradeError) {
                console.error('❌ 고객 등급 업데이트 실패:', gradeError);
                // 등급 업데이트 실패해도 주문은 완료된 상태이므로 계속 진행
            }
        }
        
        // 성공 메시지 표시
        alert(`주문이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다!`);
        
        // 주문 모달 닫기
        if (window.closeOrderModal) {
            window.closeOrderModal();
        }
        
        // 주문 폼 초기화
        console.log('🔄 주문 폼 초기화...');
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.reset();
            console.log('✅ 주문 폼 초기화 완료');
        }
        
        // 장바구니 초기화
        const cartItems = document.getElementById('cart-items-body');
        if (cartItems) {
            cartItems.innerHTML = '';
            console.log('✅ 장바구니 초기화 완료');
        }
        
        // 저장된 주문 상태에 맞는 탭을 글로벌 플래그로 전달
        // initializeOrderManagement가 로드 완료 후 이 값을 읽어 올바른 탭으로 렌더링
        const savedOrderStatus = orderData.order_status || '주문접수';
        window._pendingOrderStatus = isEditMode ? null : savedOrderStatus;

        // 주문관리 탭으로 이동
        const navBtn = document.getElementById('nav-orders');
        if (navBtn) navBtn.click();
        
        console.log('✅ 주문 제출 처리 완료 - 함수 종료');
        return true; // 성공 시 true 반환
        
    } catch (error) {
        console.error('❌ 주문 제출 처리 실패:', error);
        console.error('❌ 에러 스택:', error.stack);
        alert(`주문 등록 중 오류가 발생했습니다: ${error.message}`);
        return false; // 실패 시 false 반환
    }
}

// 전화번호 숫자만 정규화 (중복 조회/UNIQUE용)
function normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
}

// 폴백용: customer_id 없을 때 phone_normalized로 조회 후 없으면 신규 생성. 카운트는 0 (입금확인 시 트리거만).
async function ensureCustomerFromOrderData(orderData) {
    if (!window.supabaseClient || !orderData.customer_name || !orderData.customer_phone) return null;
    const name = String(orderData.customer_name || '').trim();
    const phone = String(orderData.customer_phone || '').trim();
    if (!name || !phone) return null;
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm) return null;
    try {
        const { data: existing } = await window.supabaseClient
            .from('farm_customers')
            .select('id')
            .eq('phone_normalized', phoneNorm)
            .maybeSingle();
        if (existing && existing.id) {
            console.log('📌 phone_normalized 기존 고객 연결:', existing.id);
            return existing.id;
        }
        // Fix #3: orderData에서는 customer_address_base로 구분하지만
        // farm_customers 테이블의 실제 컬럼명은 'address' — DB 저장 시 매핑
        const insertRow = {
            name,
            phone,
            address: orderData.customer_address_base != null ? orderData.customer_address_base : (orderData.customer_address || ''),
            address_detail: orderData.customer_address_detail || null,
            grade: 'BRONZE'
            // Fix #9: youtube_order_count / live_order_count 컬럼은 farm_customers 테이블에 없으므로 제거
        };
        const { data: inserted, error } = await window.supabaseClient
            .from('farm_customers')
            .insert([insertRow])
            .select('id')
            .single();
        if (error) {
            if (error.code === '23505') {
                const { data: byNorm } = await window.supabaseClient.from('farm_customers').select('id').eq('phone_normalized', phoneNorm).maybeSingle();
                if (byNorm && byNorm.id) return byNorm.id;
            }
            console.error('❌ 고객 자동 생성 실패:', error);
            return null;
        }
        if (inserted && inserted.id) {
            console.log('✅ 신규 고객 생성(카운트 0):', inserted.id);
            return inserted.id;
        }
        return null;
    } catch (e) {
        console.error('❌ ensureCustomerFromOrderData 실패:', e);
        return null;
    }
}

// 총 주문 금액 계산 (원 단위 정수, total_amount = max(0, items_subtotal + shipping_fee - discount_amount))
function calculateTotalAmount(orderData) {
    try {
        let itemsSubtotal = 0;
        orderData.items.forEach(item => {
            itemsSubtotal += toIntegerWon(item.total);
        });
        const shippingFee = toIntegerWon(orderData.shipping_fee);
        const discountAmount = toIntegerWon(orderData.discount_amount);
        return Math.max(0, itemsSubtotal + shippingFee - discountAmount);
    } catch (error) {
        console.error('❌ 총 주문 금액 계산 실패:', error);
        return 0;
    }
}

// 장바구니 관련 함수들 추가
window.addToCart = function(productId, productName, price, quantity = 1, shippingOption = '일반배송') {
    try {
        const unitPrice = Math.max(0, toIntegerWon(price));
        const qty = Math.max(1, toIntegerWon(quantity));
        console.log('🛒 장바구니에 상품 추가:', { productId, productName, unitPrice, qty, shippingOption });
        
        const cartItemsBody = document.getElementById('cart-items-body');
        if (!cartItemsBody) {
            console.error('❌ 장바구니 테이블 바디를 찾을 수 없습니다');
            return;
        }
        
        const emptyMessage = cartItemsBody.querySelector('tr td[colspan="5"]');
        if (emptyMessage) emptyMessage.remove();
        
        const row = document.createElement('tr');
        row.setAttribute('data-product-id', productId);
        row.setAttribute('data-product-name', productName || '');
        row.setAttribute('data-unit-price', unitPrice);
        row.setAttribute('data-price', unitPrice);
        row.setAttribute('data-shipping-option', shippingOption);
        const subtotal = unitPrice * qty;
        row.innerHTML = `
            <td class="px-2">${(productName || '').replace(/</g, '&lt;')}</td>
            <td class="px-2 text-right tabular-nums td-secondary">${unitPrice.toLocaleString()}</td>
            <td class="px-2 text-center">
                <input type="number" class="quantity-input w-12 text-xs text-center border rounded" 
                       value="${qty}" min="1" step="1"
                       oninput="window.normalizeQuantityInput(this); updateCartTotal()" onchange="updateCartTotal()">
            </td>
            <td class="px-2 text-right tabular-nums cart-line-total">${subtotal.toLocaleString()}원</td>
            <td class="px-2 text-center">
                <button type="button" onclick="removeFromCart(this)" class="text-red-600 hover:text-red-800 text-xs" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        cartItemsBody.appendChild(row);
        
        // 총액 업데이트
        if (window.updateCartTotal) {
            window.updateCartTotal();
        } else if (window.updateOrderTotalDisplay) {
            window.updateOrderTotalDisplay();
        }
        
        console.log('✅ 장바구니에 상품 추가 완료');
        
    } catch (error) {
        console.error('❌ 장바구니 상품 추가 실패:', error);
    }
};

window.removeFromCart = function(buttonOrProductId) {
    try {
        let row;
        
        // buttonOrProductId가 문자열(productId)인지 DOM 요소(button)인지 확인
        if (typeof buttonOrProductId === 'string') {
            // productId로 상품 찾기
            row = document.querySelector(`tr[data-product-id="${buttonOrProductId}"]`);
        } else if (buttonOrProductId && typeof buttonOrProductId.closest === 'function') {
            // button 요소인 경우
            row = buttonOrProductId.closest('tr');
        } else {
            console.error('❌ 잘못된 매개변수 타입:', typeof buttonOrProductId);
            return;
        }
        
        if (row) {
            row.remove();
            
            // 장바구니가 비어있으면 빈 메시지 표시
            const cartItemsBody = document.getElementById('cart-items-body');
            if (cartItemsBody && cartItemsBody.children.length === 0) {
                cartItemsBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-gray-500">
                            <p>장바구니가 비어있습니다</p>
                        </td>
                    </tr>
                `;
            }
            
            // 총액 업데이트
            if (window.updateCartTotal) {
                window.updateCartTotal();
            } else if (window.updateOrderTotalDisplay) {
                window.updateOrderTotalDisplay();
            }
            
            console.log('✅ 장바구니에서 상품 제거 완료');
        } else {
            console.warn('⚠️ 제거할 상품을 찾을 수 없습니다');
        }
    } catch (error) {
        console.error('❌ 장바구니 상품 제거 실패:', error);
    }
};

window.updateCartTotal = async function() {
    try {
        const cartItems = document.querySelectorAll('#cart-items-body tr[data-product-id]');
        let itemsSubtotal = 0;

        cartItems.forEach((item) => {
            const quantityInput = item.querySelector('.quantity-input');
            const quantity = Math.max(1, toIntegerWon(quantityInput?.value));
            if (quantityInput && String(quantityInput.value) !== String(quantity)) quantityInput.value = quantity;

            const unitPrice = toIntegerWon(item.getAttribute('data-unit-price') || item.getAttribute('data-price'));
            const subtotal = unitPrice * quantity;
            itemsSubtotal += subtotal;

            const lineTotalCell = item.querySelector('.cart-line-total');
            if (lineTotalCell) lineTotalCell.textContent = subtotal.toLocaleString() + '원';
        });

        // 배송비: 입력란 값만 사용. 사용자가 수정 안 했을 때만 환경설정 제안으로 한 번 설정(덮어쓰기 금지 유지)
        const shippingFeeInput = document.getElementById('shipping-fee-input');
        const freeThreshold = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.freeShippingThreshold) || 50000;
        const defaultFee = (window.SHIPPING_SETTINGS && window.SHIPPING_SETTINGS.defaultShippingFee) || 3000;
        let shippingFee;
        if (shippingFeeInput && !window._shippingFeeUserEdited) {
            const suggested = itemsSubtotal >= freeThreshold ? 0 : Math.max(0, toIntegerWon(defaultFee));
            shippingFeeInput.value = suggested;
            shippingFee = suggested;
        } else {
            shippingFee = shippingFeeInput ? Math.max(0, toIntegerWon(shippingFeeInput.value)) : 0;
        }

        // 할인: 입력란 값만 사용(자동 덮어쓰기 금지). 원 단위 정수로만 정규화
        const discountInput = document.getElementById('discount-amount');
        const discountAmount = Math.max(0, toIntegerWon(discountInput?.value));
        if (discountInput && String(discountInput.value) !== String(discountAmount)) discountInput.value = discountAmount;

        const totalAmount = Math.max(0, itemsSubtotal + shippingFee - discountAmount);
        const rawTotal = itemsSubtotal + shippingFee - discountAmount;

        const productTotalElement = document.getElementById('product-total-amount');
        const shippingTotalElement = document.getElementById('shipping-total-amount');
        const discountTotalElement = document.getElementById('discount-total-amount');
        const finalTotalElement = document.getElementById('final-total-amount');
        const zeroWarning = document.getElementById('order-total-zero-warning');

        if (productTotalElement) productTotalElement.textContent = itemsSubtotal.toLocaleString() + '원';
        if (shippingTotalElement) shippingTotalElement.textContent = shippingFee.toLocaleString() + '원';
        if (discountTotalElement) discountTotalElement.textContent = '-' + discountAmount.toLocaleString() + '원';
        if (finalTotalElement) finalTotalElement.textContent = totalAmount.toLocaleString() + '원';
        if (zeroWarning) zeroWarning.classList.toggle('hidden', rawTotal >= 0);

        const totalSummary = document.getElementById('order-total-summary');
        if (totalSummary) {
            if (itemsSubtotal > 0) totalSummary.classList.remove('hidden');
            else totalSummary.classList.add('hidden');
        }
    } catch (error) {
        console.error('❌ 장바구니 총액 업데이트 실패:', error);
    }
};

// 전역 함수로 등록
window.toIntegerWon = toIntegerWon;
window.normalizeIntegerInput = normalizeIntegerInput;
window.normalizeQuantityInput = normalizeQuantityInput;
window.initFormValidation = initFormValidation;
window.validateForm = validateForm;
window.initOrderFormSubmit = initOrderFormSubmit;
window.updateShippingFeeDisplay = updateShippingFeeDisplay;
window.initOrderChannelFromSettings = initOrderChannelFromSettings;

/** 주문 저장 정합성 검증: DB의 total_amount vs Σ(subtotal)+shipping_fee-discount. 콘솔에서 validateOrderTotalAmount(orderId) 호출 가능 */
window.validateOrderTotalAmount = async function (orderId) {
    if (!orderId || !window.supabaseClient) {
        console.warn('orderId 또는 supabaseClient 없음');
        return null;
    }
    const { data, error } = await window.supabaseClient.rpc('validate_order_total_amount', { p_order_id: orderId });
    if (error) {
        console.warn('validate_order_total_amount 오류:', error);
        return { ok: false, error: error.message };
    }
    console.log('주문 정합성 검증:', data);
    return data;
};
