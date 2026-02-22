'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminRooms() {
    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.adminGetRooms({ page, search: search || undefined, status: statusFilter || undefined, type: typeFilter || undefined })
            .then(setData).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [page, statusFilter, typeFilter]);

    const handleAction = async (action: string, roomId: string) => {
        if (!confirm(`Are you sure you want to ${action} this room?`)) return;
        try {
            if (action === 'cancel') await api.adminCancelRoom(roomId);
            else if (action === 'force-end') await api.adminForceEndRoom(roomId);
            else if (action === 'refund') await api.adminRefundRoom(roomId);
            load();
        } catch (e: any) { alert(e.message); }
    };

    const thStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-primary)' };
    const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-secondary)' };
    const statusColors: Record<string, { bg: string; color: string }> = {
        waiting: { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
        active: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
        completed: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
        disputed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        cancelled: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Room Management</h1>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search rooms..."
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', minWidth: '200px' }} />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Status</option>
                    <option value="waiting">Waiting</option><option value="active">Active</option><option value="completed">Completed</option><option value="disputed">Disputed</option><option value="cancelled">Cancelled</option>
                </select>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Types</option>
                    <option value="1v1">1v1</option><option value="group">Group</option><option value="free_for_all">Free For All</option>
                </select>
                <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Search</button>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>{data?.total || 0} rooms total</span>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Room</th><th style={thStyle}>Creator</th><th style={thStyle}>Category</th><th style={thStyle}>Type</th>
                            <th style={thStyle}>Status</th><th style={thStyle}>Players</th><th style={thStyle}>Deposit</th><th style={thStyle}>Prize Pool</th>
                            <th style={thStyle}>Duration</th><th style={thStyle}>Created</th><th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={11} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : data?.rooms?.map((r: any) => {
                            const sc = statusColors[r.status] || statusColors.waiting;
                            return (
                                <tr key={r.id}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.id.slice(0, 8)}...</div>
                                    </td>
                                    <td style={tdStyle}>{r.creator?.username || '—'}</td>
                                    <td style={tdStyle}>{r.goal?.category || '—'}</td>
                                    <td style={tdStyle}><span style={{ fontSize: '0.8rem' }}>{r.type}</span></td>
                                    <td style={tdStyle}><span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{r.status}</span></td>
                                    <td style={tdStyle}>{r._count?.participants || 0}/{r.maxPlayers}</td>
                                    <td style={tdStyle}>${r.entryDeposit}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>${r.prizePool}</td>
                                    <td style={tdStyle}>{r.duration?.replace('_', ' ')}</td>
                                    <td style={{ ...tdStyle, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {(r.status === 'active' || r.status === 'waiting') && (
                                                <>
                                                    <button onClick={() => handleAction('cancel', r.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                    <button onClick={() => handleAction('force-end', r.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(234,179,8,0.15)', color: '#eab308', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>End</button>
                                                    <button onClick={() => handleAction('refund', r.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Refund</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
