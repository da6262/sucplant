// 대시보드형 새 주문 폼 — 1440px 기준 2분할, 전체 스크롤 없음
// 좌: 고객/채널/상태/메모 | 우: 퀵상품/장바구니/금액요약
window.generateOrderFormHTMLMinimal = function () {
    return `
        <div id="order-form-minimal-wrap" class="order-form-dashboard"
             style="max-height: calc(98vh - 100px); min-height: 320px; min-width: 0; flex: 1; display: grid;">
            <input type="hidden" id="order-customer-id" name="customer_id">

            <!-- 좌측: 고객 검색 / 고객 정보 / 채널·상태·메모 (접힘) -->
            <div class="order-dashboard-left flex flex-col gap-1.5 min-h-0 overflow-y-auto">
                <div class="bg-white rounded-lg border border-gray-200 p-2 flex-shrink-0">
                    <label class="block text-xs font-medium text-gray-600 mb-0.5">고객 검색</label>
                    <div class="relative">
                        <input type="text" id="order-customer-search"
                               class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                               placeholder="이름 또는 연락처 뒷자리"
                               oninput="searchExistingCustomers(this.value); if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();" autocomplete="off">
                        <div id="customer-search-results" class="absolute w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg hidden max-h-36 overflow-y-auto z-40 text-sm"></div>
                    </div>
                    <div id="new-customer-inline-section" class="mt-2 p-2 rounded-lg bg-green-50/80 border border-green-100">
                        <div class="text-xs font-medium text-green-800 mb-1">신규 고객 정보 입력</div>
                        <p class="text-[11px] text-gray-600 mb-1">이름·연락처를 입력하면 저장 시 고객이 자동 등록됩니다.</p>
                        <div class="grid grid-cols-2 gap-1">
                            <input type="text" id="order-customer-name" class="px-2 py-1 text-sm border rounded bg-white" placeholder="고객명" required
                                   oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                            <input type="tel" id="order-customer-phone" class="px-2 py-1 text-sm border rounded bg-white" placeholder="연락처" required
                                   oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                        </div>
                        <input type="text" id="order-customer-address" class="w-full mt-0.5 px-2 py-1 text-sm border rounded bg-white" placeholder="주소" required>
                        <input type="text" id="order-customer-address-detail" class="w-full mt-0.5 px-2 py-1 text-sm border rounded bg-white" placeholder="상세주소">
                    </div>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 flex-shrink-0">
                    <details class="group" id="order-channel-details">
                        <summary class="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer list-none select-none hover:bg-gray-50 rounded-t-lg [&::-webkit-details-marker]:hidden">
                            <span class="text-xs text-gray-600">주문 채널</span>
                            <span id="order-channel-summary" class="font-medium text-gray-800 text-sm">유튜브</span>
                            <i class="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform"></i>
                        </summary>
                        <div class="px-2 pb-1.5 pt-0">
                            <select id="order-channel" class="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    onchange="document.getElementById('order-channel-summary').textContent=this.value">
                                <option value="유튜브">유튜브</option>
                            </select>
                        </div>
                    </details>
                    <details class="group border-t border-gray-100">
                        <summary class="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer list-none select-none hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                            <span class="text-xs text-gray-600">주문 상태</span>
                            <span id="order-status-summary" class="font-medium text-gray-800 text-sm">입금대기</span>
                            <i class="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform"></i>
                        </summary>
                        <div class="px-2 pb-1.5 pt-0">
                            <select id="order-status" class="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    onchange="document.getElementById('order-status-summary').textContent=this.value">
                                <option value="입금대기" selected>입금대기</option>
                                <option value="주문접수">주문접수</option>
                                <option value="고객안내">고객안내</option>
                                <option value="입금확인">입금확인</option>
                                <option value="상품준비">상품준비</option>
                                <option value="배송준비">배송준비</option>
                                <option value="배송중">배송중</option>
                                <option value="배송완료">배송완료</option>
                                <option value="주문취소">주문취소</option>
                                <option value="환불완료">환불완료</option>
                            </select>
                        </div>
                    </details>
                    <details class="group border-t border-gray-100">
                        <summary class="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer list-none select-none hover:bg-gray-50 rounded-b-lg [&::-webkit-details-marker]:hidden">
                            <span class="text-xs text-gray-600">배송 메모</span>
                            <span id="order-memo-summary" class="text-gray-500 truncate max-w-[120px] text-xs">메모 없음</span>
                            <i class="fas fa-chevron-down text-gray-400 text-xs group-open:rotate-180 transition-transform flex-shrink-0"></i>
                        </summary>
                        <div class="px-2 pb-1.5 pt-0">
                            <textarea id="order-memo" rows="1" class="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none overflow-y-auto max-h-20"
                                      placeholder="배송 관련 메모"
                                      oninput="var s=document.getElementById('order-memo-summary'); s.textContent=this.value.trim()||'메모 없음'; s.classList.toggle('text-gray-500',!this.value.trim());"></textarea>
                        </div>
                    </details>
                </div>
            </div>

            <!-- 우측: 퀵상품 / 상품검색 / 장바구니 / 금액요약 / 저장 -->
            <div class="order-dashboard-right flex flex-col gap-1.5 min-h-0 min-w-0">
                <div class="bg-white rounded-lg border border-gray-200 p-2 flex-shrink-0">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-gray-600">퀵 상품</span>
                    </div>
                    <div id="quick-product-buttons" class="grid grid-cols-3 gap-1.5">
                        <div class="col-span-3 text-center text-gray-400 text-xs py-3">로딩 중...</div>
                    </div>
                    <div class="border-t border-gray-100 mt-1 pt-1">
                        <div class="relative">
                            <input type="text" id="product-search"
                                   class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                   placeholder="상품 검색 후 클릭하여 추가"
                                   oninput="searchProducts(this.value)" autocomplete="off">
                            <div id="product-search-results" class="absolute z-20 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg hidden max-h-36 overflow-y-auto text-sm"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div class="px-2 py-1 border-b border-gray-100 flex-shrink-0">
                        <span class="text-xs font-medium text-gray-600">장바구니</span>
                    </div>
                    <div class="flex-1 min-h-0 overflow-y-auto border-b border-gray-100">
                        <table class="w-full text-xs cart-table">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th class="px-1.5 py-1 text-left text-xs font-medium text-gray-600">상품명</th>
                                    <th class="px-1.5 py-1 text-left text-xs font-medium text-gray-600 w-16">단가</th>
                                    <th class="px-1.5 py-1 text-center text-xs font-medium text-gray-600 w-28">수량</th>
                                    <th class="px-1.5 py-1 text-right text-xs font-medium text-gray-600 w-20">소계</th>
                                </tr>
                            </thead>
                            <tbody id="cart-items-body">
                                <tr><td colspan="4" class="text-center text-gray-500 py-4 text-xs">장바구니가 비어있습니다</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="p-2 flex-shrink-0 space-y-0.5 border-t border-gray-100 bg-gray-50/50">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-xs text-gray-600">상품합계</span>
                            <span id="product-total-amount" class="font-medium tabular-nums">0원</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <label class="text-xs text-gray-600" for="shipping-fee-input">배송비</label>
                            <span class="flex items-center gap-1"><input type="number" id="shipping-fee-input" value="0" min="0" step="1" class="w-20 px-2 py-1 border rounded text-right text-sm tabular-nums" oninput="window._shippingFeeUserEdited=true; if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()"><span class="text-gray-500 text-xs">원</span></span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <label class="text-xs text-gray-600" for="discount-amount">할인</label>
                            <span class="flex items-center gap-1"><input type="number" id="discount-amount" value="0" min="0" step="1" class="w-20 px-2 py-1 border rounded text-right text-sm tabular-nums" oninput="if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()"><span class="text-gray-500 text-xs">원</span></span>
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-gray-200">
                            <span class="text-xs font-semibold text-gray-800">총금액</span>
                            <span id="final-total-amount" class="text-sm font-bold text-green-600 tabular-nums">0원</span>
                        </div>
                    </div>
                </div>

                <button type="submit" form="order-form" id="order-submit-btn" disabled
                        class="flex-shrink-0 w-full min-h-[36px] py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    <i class="fas fa-check mr-2"></i>주문 저장
                </button>
            </div>
        </div>
        <style>
            .order-form-dashboard {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                overflow: hidden;
                padding: 0.5rem;
                font-size: 14px;
            }
            @media (max-width: 1439px) {
                .order-form-dashboard { grid-template-columns: 1fr; max-height: calc(98vh - 100px); }
            }
            .order-dashboard-left { padding-right: 0.25rem; }
            .order-dashboard-right { padding-left: 0.25rem; }
            #quick-product-buttons button,
            #quick-product-buttons a[role="button"] {
                min-height: 32px;
                min-width: 32px;
                font-size: 13px;
                padding: 0.35rem 0.5rem;
            }
            #order-form-minimal-wrap .quantity-input { font-size: 15px; }
        </style>
    `;
};
