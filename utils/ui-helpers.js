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

