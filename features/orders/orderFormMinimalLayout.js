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
                <div class="form-grid">

                    <!-- 고객 검색 (col-12) -->
                    <div class="form-col-12" style="position:relative;">
                        <label class="form-label">고객 검색</label>
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="order-customer-search" class="form-control" style="flex:1;"
                                   placeholder="이름 또는 연락처 뒷자리"
                                   oninput="searchExistingCustomers(this.value); if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();"
                                   autocomplete="off">
                            <button type="button" onclick="window.openSmsPasteModal()"
                                    class="btn-secondary" style="white-space:nowrap;font-size:12px;padding:4px 10px;"
                                    title="받은 문자를 붙여넣어 자동 입력">
                                <i class="fas fa-paste"></i> 문자입력
                            </button>
                        </div>
                        <div id="customer-search-results" class="xf-dropdown hidden"></div>
                    </div>

                    <!-- 고객명 (col-6) | 연락처 (col-6) -->
                    <div class="form-col-6">
                        <label class="form-label">고객명 <span class="req">*</span></label>
                        <input type="text" id="order-customer-name" class="form-control"
                               placeholder="고객명" required
                               oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                    </div>
                    <div class="form-col-6">
                        <label class="form-label">연락처 <span class="req">*</span></label>
                        <input type="tel" id="order-customer-phone" class="form-control"
                               placeholder="연락처" required
                               oninput="if(window.updateOrderSubmitButtonState) updateOrderSubmitButtonState();">
                    </div>

                    <!-- 주소 (col-12) -->
                    <div class="form-col-12">
                        <label class="form-label">주소 <span class="req">*</span></label>
                        <div class="form-input-group">
                            <input type="text" id="order-customer-address" class="form-control"
                                   placeholder="주소 입력 후 엔터" required
                                   onkeydown="if(event.key==='Enter'){event.preventDefault();openMainAddressSearch();}">
                            <button type="button" onclick="openMainAddressSearch()" class="btn-secondary">
                                주소검색
                            </button>
                        </div>
                    </div>

                    <!-- 상세주소 (col-12) -->
                    <div class="form-col-12">
                        <label class="form-label">상세주소</label>
                        <input type="text" id="order-customer-address-detail" class="form-control"
                               placeholder="상세주소 (선택)">
                    </div>

                    <!-- 추가배송지 (col-12) -->
                    <div class="form-col-12" id="extra-shipping-header-row">
                        <label class="form-label">추가배송지</label>
                        <div id="extra-shipping-list" style="display:flex;flex-direction:column;gap:6px;"></div>
                        <button type="button" onclick="addExtraShipping()"
                                style="margin-top:6px;font-size:11px;color:var(--info);background:none;border:1px dashed #93c5fd;border-radius:var(--radius-sm);padding:4px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
                            + 배송지 추가
                            <span id="extra-shipping-badge" style="display:none;background:var(--badge-info-bg);color:var(--badge-info-txt);border-radius:9px;padding:1px 7px;font-size:10px;"></span>
                        </button>
                    </div>

                    <!-- 채널 (col-6) | 상태 (col-6) -->
                    <div class="form-col-6">
                        <label class="form-label">채널</label>
                        <select id="order-channel" class="form-control"
                                onchange="document.getElementById('order-channel-summary').textContent=this.value">
                            <option value="유튜브">유튜브</option>
                        </select>
                    </div>
                    <div class="form-col-6">
                        <label class="form-label">상태</label>
                        <select id="order-status" class="form-control"
                                onchange="document.getElementById('order-status-summary').textContent=this.value">
                            <option value="입금대기" selected>입금대기</option>
                            <option value="주문접수">주문접수</option>
                            <option value="고객안내">고객안내</option>
                            <option value="입금확인">입금확인</option>
                            <option value="배송준비">배송준비</option>
                            <option value="배송중">배송중</option>
                            <option value="배송완료">배송완료</option>
                            <option value="주문취소">주문취소</option>
                            <option value="환불완료">환불완료</option>
                        </select>
                    </div>

                    <!-- 배송메모 (col-12) -->
                    <div class="form-col-12">
                        <label class="form-label">배송메모</label>
                        <textarea id="order-memo" class="form-control xf-memo" rows="2"
                                  placeholder="배송 관련 메모 (선택)"
                                  oninput="document.getElementById('order-memo-summary').textContent=this.value.trim()||''"></textarea>
                    </div>

                </div>
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
                                           onclick="searchProducts(this.value)"
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
                            <th style="width:54px" class="text-center" title="체크 후 우측 휴지통으로 일괄 삭제">
                                <input type="checkbox" id="cart-select-all" class="checkbox-ui" onchange="window.toggleCartSelectAll && window.toggleCartSelectAll(this.checked)">
                                <button type="button" id="cart-delete-selected-btn" class="btn-icon btn-icon-delete" title="선택 삭제 (체크된 모든 항목 제거)" onclick="window.cartDeleteSelected && window.cartDeleteSelected()" style="margin-left:2px;padding:2px 5px;vertical-align:middle;">
                                    <i class="fas fa-trash" style="font-size:10px;"></i>
                                </button>
                            </th>
                            <th class="text-left">상품명</th>
                            <th class="text-right" style="width:60px">단가</th>
                            <th class="text-center" style="width:82px">수량</th>
                            <th class="text-right" style="width:68px">소계</th>
                            <th style="width:20px"></th>
                        </tr>
                    </thead>
                    <tbody id="cart-items-body">
                        <tr>
                            <td colspan="6" class="text-center td-muted">
                                장바구니가 비어있습니다
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="xf-ft-label">상품합계</td>
                            <td class="xf-ft-val" id="product-total-amount">0원</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="4" class="xf-ft-label">
                                배송비
                                <label class="inline-flex items-center gap-1 ml-2 text-xs text-secondary font-normal cursor-pointer">
                                    <input type="checkbox" id="remote-area-shipping-checkbox"
                                           onchange="window._shippingFeeUserEdited=false; refreshOrderTotal()">
                                    도서산간
                                </label>
                            </td>
                            <td class="xf-ft-val">
                                <input type="number" id="shipping-fee-input" value="0" min="0" step="1" class="xf-num"
                                       oninput="window._shippingFeeUserEdited=true; if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()">원
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="4" class="xf-ft-label">할인</td>
                            <td class="xf-ft-val">
                                <input type="number" id="discount-amount" value="0" min="0" step="1" class="xf-num"
                                       oninput="if(window.normalizeIntegerInput) normalizeIntegerInput(this); refreshOrderTotal()">원
                            </td>
                            <td></td>
                        </tr>
                        <tr class="xf-total-row">
                            <td colspan="4" class="xf-total-label">총금액</td>
                            <td colspan="2" class="xf-total-amount" id="final-total-amount">0원</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- 액션 버튼: 취소(좌) · 저장+문자(우) -->
                <div class="xf-actions">
                    <button type="button" id="order-cancel-btn" onclick="window.closeOrderModal()"
                            class="xf-cancel-btn">
                        취소
                    </button>
                    <button type="button" id="order-save-sms-btn" disabled
                            class="xf-save-btn disabled:opacity-40 disabled:cursor-not-allowed"
                            style="background:#2563EB;"
                            onclick="window._orderSaveAndSMS=true; document.getElementById('order-submit-btn').click();">
                        <i class="fas fa-sms" style="margin-right:4px;"></i>저장+문자
                    </button>
                    <button type="submit" form="order-form" id="order-submit-btn" disabled
                            class="xf-save-btn disabled:opacity-40 disabled:cursor-not-allowed">
                        ✓ 주문 저장
                    </button>
                </div>
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
            /* ── 퀵 상품 그리드 (v3.4.84+) ── */
            .xf-quick-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 6px;
                margin-bottom: 6px;
            }
            .xf-quick-grid-loading {
                grid-column: span 3;
                text-align: center;
                color: var(--text-muted);
                font-size: 12px;
                padding: 10px 0;
            }
            /* 인라인 스타일이 핵심 외관을 정의 — 여기는 충돌 방지를 위해 최소화 */
            #quick-product-buttons button {
                font-family: inherit;
                /* white-space/overflow 강제 제거 — 내부 .truncate 가 한 줄만 자르고 가격·재고 줄은 보호 */
                white-space: normal;
                overflow: visible;
                text-overflow: clip;
            }
            #quick-product-buttons button .truncate {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
            }
            #quick-product-buttons button:hover:not([aria-disabled="true"]) {
                border-color: var(--primary) !important;
                box-shadow: 0 1px 4px rgba(22, 163, 74, 0.15);
            }
            /* ── 액션 그룹(취소·저장) ── */
            .xf-actions {
                display: flex;
                gap: 8px;
                margin-top: 6px;
            }
            /* ── 저장 버튼 ── */
            .xf-save-btn {
                flex: 1;
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
            .xf-save-btn:hover:not(:disabled) { background: var(--primary-hover); }
            .xf-save-btn:active:not(:disabled) { background: #166534; }
            /* ── 취소 버튼 ── */
            .xf-cancel-btn {
                width: 96px;
                padding: 9px 0;
                background: #fff;
                color: #64748B;
                font-size: 14px;
                font-weight: 600;
                border: 1px solid #CBD5E1;
                border-radius: var(--radius-sm);
                cursor: pointer;
                font-family: inherit;
            }
            .xf-cancel-btn:hover { background: var(--bg-lighter); color: var(--text-primary); border-color: var(--text-muted); }
            .xf-cancel-btn:active { background: #F1F5F9; }
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
