export type ToastType = 'success' | 'error' | 'warning' | 'info';

export const toast = {
    show: (msg: string, type: ToastType = 'info') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('rivalry-toast', { detail: { msg, type } }));
        }
    },
    success: (msg: string) => toast.show(msg, 'success'),
    error: (msg: string) => toast.show(msg, 'error'),
    warning: (msg: string) => toast.show(msg, 'warning'),
    info: (msg: string) => toast.show(msg, 'info'),
};
