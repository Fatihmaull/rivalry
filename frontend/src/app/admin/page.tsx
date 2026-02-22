'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.adminGetStats(), api.adminGetActivity(10)])
            .then(([s, a]) => { setStats(s); setActivity(a); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#3b82f6' },
        { label: 'Active Today', value: stats?.activeToday || 0, icon: '🟢', color: '#22c55e' },
        { label: 'Total Rooms', value: stats?.totalRooms || 0, icon: '🏆', color: '#f97316' },
        { label: 'Active Competitions', value: stats?.activeRooms || 0, icon: '⚔️', color: '#ef4444' },
        { label: 'Completed', value: stats?.completedRooms || 0, icon: '✅', color: '#10b981' },
        { label: 'Total Deposits', value: `$${(stats?.totalDeposits || 0).toFixed(0)}`, icon: '💰', color: '#eab308' },
        { label: 'Prize Pool', value: `$${(stats?.totalPrizePool || 0).toFixed(0)}`, icon: '🏅', color: '#8b5cf6' },
        { label: 'Platform Revenue', value: `$${(stats?.platformRevenue || 0).toFixed(0)}`, icon: '📊', color: '#06b6d4' },
        { label: 'Flagged/Disputed', value: stats?.flaggedContent || 0, icon: '⚠️', color: '#f43f5e' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Real-time platform activity and metrics</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {statCards.map(card => (
                    <div key={card.label} style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem',
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</span>
                            <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Activity Feeds */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                {/* Recent Users */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>🆕 Recent Users</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activity?.recentUsers?.slice(0, 8).map((u: any) => (
                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-secondary)' }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.username}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Rooms */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>🏆 Recent Rooms</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activity?.recentRooms?.slice(0, 8).map((r: any) => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-secondary)' }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                                    background: r.status === 'active' ? 'rgba(34,197,94,0.15)' : r.status === 'completed' ? 'rgba(59,130,246,0.15)' : 'rgba(234,179,8,0.15)',
                                    color: r.status === 'active' ? '#22c55e' : r.status === 'completed' ? '#3b82f6' : '#eab308',
                                }}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Large Transactions */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>💰 Large Transactions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activity?.largeTransactions?.slice(0, 8).map((t: any) => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-secondary)' }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.wallet?.user?.username || 'Unknown'}</span>
                                <span style={{ fontWeight: 600, color: t.amount > 0 ? '#22c55e' : '#ef4444' }}>${Math.abs(t.amount).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
