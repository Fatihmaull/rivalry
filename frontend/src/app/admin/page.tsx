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

    if (loading) {
        return (
            <div className="page container-wide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0 },
        { label: 'Active Today', value: stats?.activeToday || 0 },
        { label: 'Total Rooms', value: stats?.totalRooms || 0 },
        { label: 'Active Competitions', value: stats?.activeRooms || 0 },
        { label: 'Completed', value: stats?.completedRooms || 0 },
        { label: 'Total Deposits', value: `$${Number(stats?.totalDeposits || 0).toFixed(0)}` },
        { label: 'Prize Pool', value: `$${Number(stats?.totalPrizePool || 0).toFixed(0)}` },
        { label: 'Platform Revenue', value: `$${Number(stats?.platformRevenue || 0).toFixed(0)}`, color: 'var(--text-secondary)' },
        { label: 'Flagged/Disputed', value: stats?.flaggedContent || 0, color: 'var(--error)' },
    ];

    return (
        <div className="page container-wide">
            {/* ═══ HEADER ═══ */}
            <div className="animate-fade-in" style={{ marginBottom: '48px' }}>
                <div className="mono-label" style={{ marginBottom: '8px' }}>ADMINISTRATION</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                    System <span className="text-gradient">Overview</span>.
                </h1>
            </div>

            {/* ═══ STATS ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }} className="stagger">
                {statCards.map(card => (
                    <div key={card.label} className="glass-card" style={{ padding: '24px' }}>
                        <div className="mono-label" style={{ marginBottom: '16px' }}>{card.label.toUpperCase()}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: card.color || 'var(--text-primary)' }}>
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ DATA LISTS ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px' }}>
                {/* Recent Users */}
                <div>
                    <div className="section-label">RECENT USERS</div>
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activity?.recentUsers?.slice(0, 8).map((u: any) => (
                            <div key={u.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {(!activity?.recentUsers || activity.recentUsers.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent users</div>
                        )}
                    </div>
                </div>

                {/* Recent Rooms */}
                <div>
                    <div className="section-label">RECENT ROOMS</div>
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activity?.recentRooms?.slice(0, 8).map((r: any) => (
                            <div key={r.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.title}
                                </span>
                                <span className="badge" style={{
                                    background: r.status === 'active' ? 'rgba(34,197,94,0.15)' : r.status === 'completed' ? 'rgba(59,130,246,0.15)' : 'rgba(234,179,8,0.15)',
                                    color: r.status === 'active' ? '#22c55e' : r.status === 'completed' ? '#3b82f6' : '#eab308',
                                    border: 'none'
                                }}>
                                    {r.status}
                                </span>
                            </div>
                        ))}
                        {(!activity?.recentRooms || activity.recentRooms.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent rooms</div>
                        )}
                    </div>
                </div>

                {/* Large Transactions */}
                <div>
                    <div className="section-label">LARGE TRANSACTIONS</div>
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activity?.largeTransactions?.slice(0, 8).map((t: any) => (
                            <div key={t.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.wallet?.user?.username || 'Unknown'}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: t.amount > 0 ? '#22c55e' : t.amount < 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                                    {t.amount > 0 ? '+' : ''}{t.amount < 0 ? '-' : ''}${Math.abs(t.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {(!activity?.largeTransactions || activity.largeTransactions.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent transactions</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
