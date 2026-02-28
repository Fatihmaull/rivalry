'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { toast } from '../../../lib/toast';

export default function AdminTransactions() {
    const [data, setData] = useState<any>(null);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.adminGetTransactions({ page, type: typeFilter || undefined, status: statusFilter || undefined })
            .then(setData).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [page, typeFilter, statusFilter]);

    const handleAction = async (action: string, id: string) => {
        if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
        try {
            if (action === 'reverse') await api.adminReverseTransaction(id);
            else if (action === 'flag') await api.adminFlagTransaction(id);
            load();
        } catch (e: any) { toast.error(e.message || 'An error occurred'); }
    };

    const thStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-primary)' };
    const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-secondary)' };
    const typeColors: Record<string, string> = { top_up: '#22c55e', deposit: '#3b82f6', withdrawal: '#f97316', prize: '#8b5cf6', tip: '#eab308', platform_fee: '#ef4444', refund: '#06b6d4' };

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Wallet & Transactions</h1>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Types</option>
                    <option value="top_up">Top Up</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option>
                    <option value="prize">Prize</option><option value="tip">Tip</option><option value="platform_fee">Platform Fee</option><option value="refund">Refund</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Status</option>
                    <option value="completed">Completed</option><option value="pending">Pending</option><option value="reversed">Reversed</option><option value="flagged">Flagged</option>
                </select>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>{data?.total || 0} transactions</span>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>ID</th><th style={thStyle}>User</th><th style={thStyle}>Type</th><th style={thStyle}>Amount</th>
                            <th style={thStyle}>Status</th><th style={thStyle}>Description</th><th style={thStyle}>Date</th><th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : data?.transactions?.map((t: any) => (
                            <tr key={t.id}>
                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.id.slice(0, 8)}</td>
                                <td style={tdStyle}>{t.wallet?.user?.username || '—'}</td>
                                <td style={tdStyle}><span style={{ color: typeColors[t.type] || '#fff', fontWeight: 600, fontSize: '0.8rem' }}>{t.type.replace('_', ' ')}</span></td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: Number(t.amount) >= 0 ? '#22c55e' : '#ef4444' }}>{Number(t.amount) >= 0 ? '+' : ''}{Number(t.amount).toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                        background: t.status === 'completed' ? 'rgba(34,197,94,0.15)' : t.status === 'flagged' ? 'rgba(239,68,68,0.15)' : t.status === 'reversed' ? 'rgba(107,114,128,0.15)' : 'rgba(234,179,8,0.15)',
                                        color: t.status === 'completed' ? '#22c55e' : t.status === 'flagged' ? '#ef4444' : t.status === 'reversed' ? '#9ca3af' : '#eab308',
                                    }}>{t.status}</span>
                                </td>
                                <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || '—'}</td>
                                <td style={{ ...tdStyle, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleString()}</td>
                                <td style={tdStyle}>
                                    {t.status === 'completed' && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => handleAction('reverse', t.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(234,179,8,0.15)', color: '#eab308', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reverse</button>
                                            <button onClick={() => handleAction('flag', t.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Flag</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
