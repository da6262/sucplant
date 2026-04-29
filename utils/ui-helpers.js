// utils/ui-helpers.js

// SweetAlert2가 로드되었는지 확인
const SwalAvailable = typeof Swal !== 'undefined' && !window.SwalDisabled;

export function showToast(message, duration = 2000, icon = 'success') {
    if (SwalAvailable) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: duration,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: icon,
            title: message
        });
    } else {
        // SweetAlert2가 없을 때를 위한 기본 알림
        alert(message);
    }
}

/**
 * 실행취소 토스트 — 삭제 후 5초간 "실행취소" 버튼 표시.
 * soft-delete 패턴: onUndo(복원), onConfirm(실제 DB 삭제) 콜백
 */
export function showUndoToast(message, { onUndo, onConfirm, delayMs = 5000 } = {}) {
    document.getElementById('_undo-toast')?.remove();

    const el = document.createElement('div');
    el.id = '_undo-toast';
    el.className = 'undo-toast';
    el.innerHTML =
        `<span class="undo-toast-msg">${message}</span>` +
        `<button class="undo-toast-btn">실행취소</button>` +
        `<div class="undo-toast-bar"><div class="undo-toast-fill"></div></div>`;
    document.body.appendChild(el);

    // 진행 바 애니메이션
    const fill = el.querySelector('.undo-toast-fill');
    fill.style.transition = `width ${delayMs}ms linear`;
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = '0%'; }));

    let done = false;
    const dismiss = () => el.remove();

    el.querySelector('.undo-toast-btn').onclick = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        dismiss();
        onUndo?.();
    };

    const timer = setTimeout(() => {
        if (done) return;
        done = true;
        dismiss();
        onConfirm?.();
    }, delayMs);

    return dismiss;
}
window.showUndoToast = showUndoToast;

