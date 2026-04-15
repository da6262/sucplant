// 새 주문 폼 — 엑셀 양식 스타일 (좌: 고객/주문 정보 | 우: 상품/장바구니)
window.generateOrderFormHTMLMinimal = function () {
    return `
        <div id="order-form-minimal-wrap" class="xf-wrap">
            <input type="hidden" id="order-customer-id" name="customer_id">
            <span id="order-channel-summary" class="hidden"></span>
            <span id="order-status-summary" class="hidden"></span>
            <span id="order-memo-summary" class="hidden"></span>

            <!-- ── 좌측: 고객/주문 정보 ── -->
            <div class="xf-col">
                <table class="xf-tbl">
                    <colgroup>
                        <col style="width:68px">
                        <col>
                        <col style="width:56px">
                        <col>
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>고객 검색</th>
                            <td colspan="3" class="xf-pos-rel">
                                <input type="text" id="order-customer-search" class="xf-inp"
                                       placeholder="이름 또는 연락처 뒷자리"
                                       oninput="searchExistingCustomers(this.value); if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();"
                                       autocomplete="off">
                                <div id="customer-search-results"
                                     class="xf-dropdown hidden"></div>
                            </td>
                        </tr>
                        <tr>
                            <th>고객명 *</th>
                            <td>
                                <input type="text" id="order-customer-name" class="xf-inp"
                                       placeholder="고객명" required
                                       oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                            </td>
                            <th>연락처 *</th>
                            <td>
                                <input type="tel" id="order-customer-phone" class="xf-inp"
                                       placeholder="연락처" required
                                       oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                            </td>
                        </tr>
                        <tr>
                            <th>주소 *</th>
                            <td colspan="3">
                                <input type="text" id="order-customer-address" class="xf-inp"
                                       placeholder="주소" required>
                            </td>
                        </tr>
                        <tr>
                            <th>상세주소</th>
                            <td colspan="3">
                                <input type="text" id="order-customer-address-detail" class="xf-inp"
                                       placeholder="상세주소 (선택)">
                            </td>
                        </tr>
                        <tr>
                            <th>채널</th>
                            <td>
                                <select id="order-channel" class="xf-inp"
                                        onchange="document.getElementById('order-channel-summary').textContent=this.value">
                                    <option value="유튜브">유튜브</option>
                                </select>
                            </td>
                            <th>상태</th>
                            <td>
                                <select id="order-status" class="xf-inp"
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
                            </td>
                        </tr>
                        <tr>
                            <th>배송메모</th>
                            <td colspan="3">
                                <textarea id="order-memo" class="xf-inp xf-memo" rows="3"
                                          placeholder="배송 관련 메모 (선택)"
                                          oninput="document.getElementById('order-memo-summary').textContent=this.value.trim()||''"></textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ── 우측: 상품 추가 + 장바구니 ── -->
            <div class="xf-col">

                <!-- 퀵 상품 + 검색 -->
                <table class="xf-tbl xf-mb-sm">
                    <tbody>
                        <tr>
                            <th class="xf-th-vtop" style="width:60px">상품 추가</th>
                            <td>
                                <div id="quick-product-buttons" class="xf-quick-grid">
                                    <div class="xf-quick-grid-loading">로딩 중...</div>
                                </div>
                                <div class="xf-pos-rel">
                                    <input type="text" id="product-search" class="xf-inp"
                                           placeholder="클릭하거나 상품명 검색"
                                           oninput="searchProducts(this.value)" autocomplete="off"
                                           onfocus="searchProducts(this.value)"
                                           onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();const f=document.querySelector('#product-search-results [onclick]:not([onclick*=closeProduct])');if(f)f.click();}if(event.key==='Escape'){document.getElementById('product-search-results')?.classList.add('hidden');this.blur();}">
                                    <div id="product-search-results"
                                         class="xf-dropdown xf-dropdown-product hidden"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- 장바구니 -->
                <table class="xf-tbl xf-cart">
                    <thead>
                        <tr>
                            <th class="text-left">상품명</th>
                            <th class="text-right" style="width:60px">단가</th>
                            <th class="text-center" style="width:82px">수량</th>
                            <th class="text-right" style="width:68px">소계</th>
                            <th style="width:20px"></th>
                        </tr>
                    </thead>
                    <tbody id="cart-items-body">
                        <tr>
                            <td colspan="5" class="text-center td-muted">
                                장바구니가 비어있습니다
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="xf-ft-label">상품합계</td>
                            <td class="xf-ft-val" id="product-total-amount">0원</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="xf-ft-label">배송비</td>
                            <td class="xf-ft-val">
                                <input type="number" id="shipping-fee-input" value="0" min="0" step="1" class="xf-num"
                                       oninput="window._shippingFeeUserEdited=true; if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()">원
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="xf-ft-label">할인</td>
                            <td class="xf-ft-val">
                                <input type="number" id="discount-amount" value="0" min="0" step="1" class="xf-num"
                                       oninput="if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()">원
                            </td>
                            <td></td>
                        </tr>
                        <tr class="xf-total-row">
                            <td colspan="3" class="xf-total-label">총금액</td>
                            <td colspan="2" class="xf-total-amount" id="final-total-amount">0원</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- 저장 버튼 -->
                <button type="submit" form="order-form" id="order-submit-btn" disabled
                        class="xf-save-btn disabled:opacity-40 disabled:cursor-not-allowed">
                    ✓ 주문 저장
                </button>
            </div>
        </div>

        <style>
            .xf-wrap {
                display: grid;
                grid-template-columns: 5fr 6fr;
                gap: 10px;
                padding: 12px;
                font-size: 13px;
                font-family: "Malgun Gothic", -apple-system, sans-serif;
                background: #f9fafb;
                box-sizing: border-box;
                min-height: calc(100vh - 50px);
            }
            @media (max-width: 700px) {
                .xf-wrap { grid-template-columns: 1fr; min-height: auto; }
            }
            .xf-col {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            /* ── 테이블 기본 ── */
            .xf-tbl {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            .xf-tbl th, .xf-tbl td {
                border: 1px solid #b0b0b0;
                padding: 4px 6px;
                vertical-align: middle;
            }
            .xf-tbl > tbody > tr > th {
                background: #efefef;
                font-weight: 600;
                color: #333;
                white-space: nowrap;
                text-align: left;
            }
            .xf-tbl > tbody > tr > td {
                background: #fff;
            }
            /* ── 장바구니 ── */
            .xf-cart thead th {
                background: #e4e4e4;
                text-align: center;
                font-size: 12px;
                padding: 4px 5px;
                color: #444;
            }
            .xf-cart tbody {
                display: block;
                max-height: 220px;
                overflow-y: auto;
                width: 100%;
            }
            .xf-cart thead tr,
            .xf-cart tbody tr,
            .xf-cart tfoot tr {
                display: table;
                width: 100%;
                table-layout: fixed;
            }
            .xf-cart thead,
            .xf-cart tfoot {
                display: table;
                width: 100%;
                table-layout: fixed;
            }
            .xf-cart tbody td {
                font-size: 12px;
                padding: 3px 5px;
                background: #fff;
            }
            .xf-cart tfoot td {
                background: #fafafa;
                border-top: 1px solid #b0b0b0;
            }
            .xf-total-row { background: #f5f5f5 !important; }
            .xf-ft-label {
                text-align: right;
                font-size: 12px;
                color: #555;
                padding: 4px 6px;
            }
            .xf-ft-val {
                text-align: right;
                font-size: 12px;
                padding: 4px 6px;
                white-space: nowrap;
            }
            /* ── 입력 공통 ── */
            .xf-inp {
                width: 100%;
                border: none;
                outline: none;
                background: transparent;
                font-size: 13px;
                padding: 1px 2px;
                box-sizing: border-box;
                color: #111;
                font-family: inherit;
            }
            .xf-inp:focus { background: #fffde7; }
            select.xf-inp { cursor: pointer; }
            textarea.xf-inp { display: block; }
            .xf-num {
                width: 68px;
                border: none;
                outline: none;
                background: transparent;
                font-size: 12px;
                text-align: right;
                padding: 1px 2px;
                font-family: inherit;
            }
            .xf-num:focus { background: #fffde7; }
            /* ── 퀵 버튼 ── */
            #quick-product-buttons button {
                font-size: 11px;
                padding: 3px 5px;
                border: 1px solid #c8c8c8;
                background: #f8f8f8;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: left;
            }
            #quick-product-buttons button:hover {
                background: #e8f5e9;
                border-color: #4caf50;
            }
            /* ── 저장 버튼 ── */
            .xf-save-btn {
                width: 100%;
                margin-top: 6px;
                padding: 9px 0;
                background: var(--primary);
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                border: none;
                cursor: pointer;
                letter-spacing: .03em;
                font-family: inherit;
            }
            .xf-save-btn:hover:not(:disabled) { background: #15803d; }
            .xf-save-btn:active:not(:disabled) { background: #166534; }
            /* ── 수량 입력 ── */
            #order-form-minimal-wrap .quantity-input {
                width: 40px;
                text-align: center;
                font-size: 12px;
                border: 1px solid #ccc;
                padding: 1px 2px;
            }
        </style>
    `;
};
