'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminAudit() {
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.adminGetAuditLogs(page).then(setData).catch(console.error).finally(() => setLoading(false));
    }, [page]);

    const actionColors: Record<string, string> = {
        suspend_user: '#eab308', ban_user: '#ef4444', activate_user: '#22c55e', verify_user: '#3b82f6',
        change_role: '#8b5cf6', delete_user: '#ef4444', reset_wallet: '#f97316', cancel_room: '#ef4444',
        force_end_room: '#eab308', refund_room: '#06b6d4', freeze_wallet: '#ef4444', unfreeze_wallet: '#22c55e',
        reverse_transaction: '#f97316', flag_transaction: '#ef4444', update_system_setting: '#8b5cf6',
        create_interest: '#22c55e', update_interest: '#3b82f6', delete_interest: '#ef4444',
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Audit Log</h1>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit logs...</div>
                ) : !data?.logs?.length ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs yet</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {data.logs.map((log: any, idx: number) => (
                            <div key={log.id} style={{
                                padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                borderBottom: idx < data.logs.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                            }}>
                                {/* Timeline dot */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: actionColors[log.action] || '#6b7280' }} />
                                    {idx < data.logs.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border-secondary)', marginTop: '4px', minHeight: '20px' }} />}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{log.admin?.username || 'System'}</span>
                                            <span style={{
                                                margin: '0 0.5rem',
                                                padding: '1px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                background: `${actionColors[log.action] || '#6b7280'}20`,
                                                color: actionColors[log.action] || '#6b7280',
                                            }}>{log.action.replace(/_/g, ' ')}</span>
                                            {log.targetId && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.targetId.slice(0, 8)}...</span>}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                    {log.details && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {data && data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>← Prev</button>
                    <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {data.totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Next →</button>
                </div>
            )}
        </div>
    );
}
