'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
    id: string;
    msg: string;
    type: ToastType;
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const handleToast = (e: Event) => {
            const customEvent = e as CustomEvent<{ msg: string; type: ToastType }>;
            const newToast: ToastData = {
                id: Math.random().toString(36).substring(2, 9),
                msg: customEvent.detail.msg,
                type: customEvent.detail.type,
            };

            setToasts((prev) => [...prev, newToast]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
            }, 4000);
        };

        window.addEventListener('rivalry-toast', handleToast);
        return () => window.removeEventListener('rivalry-toast', handleToast);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none',
        }}>
            {toasts.map((t) => (
                <div key={t.id} className={`toast-item animate-slide-up bg-surface boarder-subtle text-primary`} onClick={() => removeToast(t.id)} style={{
                    minWidth: '280px',
                    maxWidth: '400px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-glass)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-lg)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {t.type === 'success' && <span style={{ color: '#10b981' }}>✓</span>}
                    {t.type === 'error' && <span style={{ color: '#ef4444' }}>✕</span>}
                    {t.type === 'warning' && <span style={{ color: '#f59e0b' }}>!</span>}
                    {t.type === 'info' && <span style={{ color: '#3b82f6' }}>i</span>}

                    <span style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
                        {t.msg}
                    </span>
                </div>
            ))}
        </div>
    );
}
