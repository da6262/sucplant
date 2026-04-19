// features/customers/customerSegmentUI.js
// 일괄 문자 발송 모달 UI (Phase E)
// 데이터 로직은 customerSegment.js 에 위임, 이 파일은 모달 제어만

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * 모달 열기 — 필터 UI 초기화 + 이벤트 바인딩
 */
window.openBulkSMSModal = function () {
    const modal = document.getElementById('bulk-sms-modal');
    if (!modal) { alert('일괄 문자 모달을 찾을 수 없습니다.'); return; }

    // 초기화
    renderTagPicker();
    renderGradePicker();
    populateTemplateSelect();

    const msgEl     = document.getElementById('bulk-sms-message');
    const lenEl     = document.getElementById('bulk-sms-len');
    const sendBtn   = document.getElementById('bulk-sms-send');
    const progress  = document.getElementById('bulk-sms-progress');
    if (msgEl) msgEl.value = '';
    if (lenEl) lenEl.textContent = '0';
    if (progress) progress.classList.add('hidden');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 발송';
    }

    // 초기 미리보기
    refreshMatchedPreview();

    // 이벤트 바인딩 (onclick 덮어쓰기로 중복 방지)
    const close = () => modal.classList.add('hidden');
    document.getElementById('bulk-sms-close').onclick = close;
    document.getElementById('bulk-sms-cancel').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('bulk-sms-tag-all').onchange = refreshMatchedPreview;

    document.getElementById('bulk-sms-template').onchange = onTemplateChange;

    if (msgEl) {
        msgEl.oninput = () => {
            if (lenEl) lenEl.textContent = msgEl.value.length;
            updateSendButtonState();
        };
    }

    if (sendBtn) sendBtn.onclick = performBulkSend;

    modal.classList.remove('hidden');
};

// ─────────────────────────────────────────────────────────────
// 렌더: 태그 / 등급 / 템플릿 드롭다운
// ─────────────────────────────────────────────────────────────

function renderTagPicker() {
    const wrap = document.getElementById('bulk-sms-tags');
    if (!wrap) return;
    const tags = window.customerSegment?.collectAllCustomerTags?.() || [];
    if (tags.length === 0) {
        wrap.innerHTML = '<span class="text-muted text-xs">태그가 등록된 고객이 없습니다.</span>';
        return;
    }
    wrap.innerHTML = tags.map(t => `
        <label class="bulk-sms-chip">
            <input type="checkbox" class="bulk-sms-tag-check" value="${esc(t)}">
            <span>${esc(t)}</span>
        </label>
    `).join('');
    wrap.querySelectorAll('.bulk-sms-tag-check').forEach(cb => {
        cb.addEventListener('change', refreshMatchedPreview);
    });
}

function renderGradePicker() {
    const wrap = document.getElementById('bulk-sms-grades');
    if (!wrap) return;
    const grades = window.settingsDataManager?.settings?.customerGrades || [];
    if (grades.length === 0) {
        wrap.innerHTML = '<span class="text-muted text-xs">환경설정에 등급이 없습니다.</span>';
        return;
    }
    wrap.innerHTML = grades.map(g => {
        const code = g.code || g.grade_code || 'GENERAL';
        return `
            <label class="bulk-sms-chip">
                <input type="checkbox" class="bulk-sms-grade-check" value="${esc(code)}">
                <span>${esc(g.name || code)}</span>
            </label>
        `;
    }).join('');
    wrap.querySelectorAll('.bulk-sms-grade-check').forEach(cb => {
        cb.addEventListener('change', refreshMatchedPreview);
    });
}

function populateTemplateSelect() {
    const sel = document.getElementById('bulk-sms-template');
    if (!sel) return;
    const templates = window.settingsDataManager?.settings?.smsTemplates || {};
    const LABELS = {
        orderConfirm:     '주문확인',
        paymentConfirm:   '입금확인',
        shippingStart:    '배송시작',
        shippingComplete: '배송완료',
        waitlistNotify:   '대기품목',
    };
    sel.innerHTML = '<option value="">직접 작성</option>' +
        Object.keys(templates).map(k => {
            const label = LABELS[k] || k;
            const hasContent = !!(templates[k] && String(templates[k]).trim());
            return `<option value="${esc(k)}"${hasContent ? '' : ' disabled'}>${esc(label)}${hasContent ? '' : ' (비어있음)'}</option>`;
        }).join('');
}

function onTemplateChange(e) {
    const key = e.target.value;
    const msgEl = document.getElementById('bulk-sms-message');
    if (!msgEl) return;
    if (!key) {
        // 직접 작성 모드 — 비우지 않고 현재 내용 유지
        updateSendButtonState();
        return;
    }
    const templates = window.settingsDataManager?.settings?.smsTemplates || {};
    msgEl.value = templates[key] || '';
    document.getElementById('bulk-sms-len').textContent = msgEl.value.length;
    updateSendButtonState();
}

// ─────────────────────────────────────────────────────────────
// 미리보기 + 발송 버튼 상태
// ─────────────────────────────────────────────────────────────

function collectCriteria() {
    const tags = [...document.querySelectorAll('.bulk-sms-tag-check:checked')].map(cb => cb.value);
    const grades = [...document.querySelectorAll('.bulk-sms-grade-check:checked')].map(cb => cb.value);
    const tagMatch = document.getElementById('bulk-sms-tag-all')?.checked ? 'all' : 'any';
    return { tags, grades, tagMatch, requirePhone: true };
}

function refreshMatchedPreview() {
    const criteria = collectCriteria();
    const list = window.customerSegment?.filterCustomersByCriteria?.(criteria) || [];

    const countEl = document.getElementById('bulk-sms-match-count');
    if (countEl) countEl.textContent = `${list.length}명`;

    const preview = document.getElementById('bulk-sms-preview');
    if (preview) {
        if (list.length === 0) {
            preview.innerHTML = '<span class="text-muted text-xs">매치된 고객이 없습니다.</span>';
        } else {
            const top = list.slice(0, 24);
            const rest = list.length - top.length;
            preview.innerHTML = top.map(c => `
                <span class="bulk-sms-preview-chip">${esc(c.name || '-')}<span class="bulk-sms-preview-phone">${esc(c.phone || '')}</span></span>
            `).join('') + (rest > 0 ? `<span class="bulk-sms-preview-more">외 ${rest}명</span>` : '');
        }
    }
    updateSendButtonState(list.length);
}

function updateSendButtonState(matchCount) {
    const sendBtn = document.getElementById('bulk-sms-send');
    const msg = document.getElementById('bulk-sms-message')?.value?.trim() || '';
    if (matchCount === undefined) {
        const criteria = collectCriteria();
        matchCount = (window.customerSegment?.filterCustomersByCriteria?.(criteria) || []).length;
    }
    if (sendBtn) sendBtn.disabled = !(matchCount > 0 && msg.length > 0);
}

// ─────────────────────────────────────────────────────────────
// 발송 실행
// ─────────────────────────────────────────────────────────────

async function performBulkSend() {
    const criteria = collectCriteria();
    const customers = window.customerSegment?.filterCustomersByCriteria?.(criteria) || [];
    const template = document.getElementById('bulk-sms-message')?.value || '';
    const templateKey = document.getElementById('bulk-sms-template')?.value || null;

    if (customers.length === 0) return;
    if (!template.trim()) return;

    if (!confirm(`${customers.length}명에게 문자를 발송합니다.\n\n문자 1건당 Solapi 과금이 발생합니다.\n계속하시겠습니까?`)) return;

    const sendBtn = document.getElementById('bulk-sms-send');
    const progress = document.getElementById('bulk-sms-progress');
    const progFill = document.getElementById('bulk-sms-prog-fill');
    const progDone = document.getElementById('bulk-sms-prog-done');
    const progTotal = document.getElementById('bulk-sms-prog-total');

    if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 발송 중…'; }
    if (progress) progress.classList.remove('hidden');
    if (progTotal) progTotal.textContent = customers.length;
    if (progFill) progFill.style.width = '0%';
    if (progDone) progDone.textContent = '0';

    try {
        const result = await window.customerSegment.sendBulkSMSToSegment(customers, template, {
            templateKey,
            delayMs: 200,
            onProgress: (done, total) => {
                if (progDone) progDone.textContent = done;
                if (progFill) progFill.style.width = `${(done / total) * 100}%`;
            }
        });

        const errMsg = result.errors.length > 0
            ? `\n\n실패 상세:\n${result.errors.slice(0, 5).map(e => `• ${e.name}: ${e.error}`).join('\n')}${result.errors.length > 5 ? `\n• … 외 ${result.errors.length - 5}건` : ''}`
            : '';

        alert(
            `📣 일괄 문자 발송 결과\n\n` +
            `대상: ${customers.length}명\n` +
            `성공: ${result.sent}명\n` +
            `실패: ${result.failed}명\n` +
            (result.aborted ? '⚠️ 연속 실패로 중단됨\n' : '') +
            errMsg
        );

        document.getElementById('bulk-sms-modal')?.classList.add('hidden');
    } catch (e) {
        console.error('❌ 일괄 SMS 발송 실패:', e);
        alert('발송 실패: ' + (e.message || e));
    } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 발송'; }
        if (progress) progress.classList.add('hidden');
    }
}
