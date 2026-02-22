'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminUsers() {
    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    const load = () => {
        setLoading(true);
        api.adminGetUsers({ page, search: search || undefined, status: statusFilter || undefined, role: roleFilter || undefined, limit: 15 })
            .then(setData).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [page, statusFilter, roleFilter]);

    const handleAction = async (action: string, userId: string) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        setActionLoading(userId);
        try {
            if (action === 'suspend') await api.adminSuspendUser(userId);
            else if (action === 'ban') await api.adminBanUser(userId);
            else if (action === 'activate') await api.adminActivateUser(userId);
            else if (action === 'verify') await api.adminVerifyUser(userId);
            else if (action === 'reset-wallet') await api.adminResetWallet(userId);
            else if (action === 'delete') await api.adminDeleteUser(userId);
            load();
        } catch (e: any) { alert(e.message); }
        setActionLoading('');
    };

    const handleRoleChange = async (userId: string, role: string) => {
        try { await api.adminChangeRole(userId, role); load(); } catch (e: any) { alert(e.message); }
    };

    const thStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-primary)' };
    const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-secondary)' };

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>User Management</h1>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search users..."
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', minWidth: '200px' }} />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Search</button>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>{data?.total || 0} users total</span>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Reputation</th>
                            <th style={thStyle}>Win Rate</th>
                            <th style={thStyle}>Wallet</th>
                            <th style={thStyle}>Rooms</th>
                            <th style={thStyle}>Created</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : data?.users?.map((u: any) => {
                            const wins = u.profile?.totalWins || 0;
                            const losses = u.profile?.totalLosses || 0;
                            const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '0';
                            return (
                                <tr key={u.id}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {u.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{u.username}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{u.email}</td>
                                    <td style={tdStyle}>
                                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                                            style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                            <option value="super_admin">super_admin</option>
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                            background: u.status === 'active' ? 'rgba(34,197,94,0.15)' : u.status === 'suspended' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: u.status === 'active' ? '#22c55e' : u.status === 'suspended' ? '#eab308' : '#ef4444',
                                        }}>{u.status}</span>
                                    </td>
                                    <td style={tdStyle}>{u.profile?.reputationScore || 0}</td>
                                    <td style={tdStyle}>{winRate}%</td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>${(u.wallet?.balance || 0).toFixed(2)}</td>
                                    <td style={tdStyle}>{u._count?.participants || 0}</td>
                                    <td style={{ ...tdStyle, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {u.status === 'active' ? (
                                                <button onClick={() => handleAction('suspend', u.id)} disabled={actionLoading === u.id} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(234,179,8,0.15)', color: '#eab308', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Suspend</button>
                                            ) : (
                                                <button onClick={() => handleAction('activate', u.id)} disabled={actionLoading === u.id} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Activate</button>
                                            )}
                                            {!u.isVerified && (
                                                <button onClick={() => handleAction('verify', u.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Verify</button>
                                            )}
                                            <button onClick={() => handleAction('delete', u.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>← Prev</button>
                    <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {data.totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                        style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Next →</button>
                </div>
            )}
        </div>
    );
}
