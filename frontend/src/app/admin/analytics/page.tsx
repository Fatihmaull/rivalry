'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.adminGetAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading analytics...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Analytics Dashboard</h1>

            {/* Top Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Goal Completion Rate', value: `${data?.goalCompletionRate || 0}%`, icon: '🎯', color: '#22c55e' },
                    { label: 'Avg Room Size', value: data?.avgRoomSize?.toFixed(1) || '0', icon: '👥', color: '#3b82f6' },
                    { label: 'User Retention (7d)', value: `${data?.userRetention || 0}%`, icon: '📊', color: '#8b5cf6' },
                    { label: 'Active Goal Rate', value: `${data?.activeGoalRate || 0}%`, icon: '⚡', color: '#f97316' },
                ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{m.label}</span>
                            <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</span>
                    </div>
                ))}
            </div>

            {/* Category Performance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>📊 Top Goal Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data?.topCategories?.map((c: any, idx: number) => (
                            <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '20px' }}>{idx + 1}.</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{c.category}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c._count?.id || c.count || 0}</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 3, background: `hsl(${200 + idx * 30}, 70%, 55%)`, width: `${Math.min(100, ((c._count?.id || c.count || 0) / (data?.topCategories?.[0]?._count?.id || 1)) * 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        )) || <span style={{ color: 'var(--text-muted)' }}>No data available</span>}
                    </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>🏆 Room Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { label: 'Total Rooms Created', value: data?.totalRooms || 0 },
                            { label: 'Active Competitions', value: data?.activeRooms || 0 },
                            { label: 'Completed Rooms', value: data?.completedRooms || 0 },
                            { label: 'Disputed Rooms', value: data?.disputedRooms || 0 },
                            { label: 'Avg Prize Pool', value: `$${(data?.avgPrizePool || 0).toFixed(2)}` },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-secondary)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Users */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>👑 Top Performers</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {data?.topUsers?.slice(0, 8).map((u: any, idx: number) => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx < 3 ? 'var(--gradient-primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rep: {u.profile?.reputationScore || 0}</div>
                                </div>
                            </div>
                        )) || <span style={{ color: 'var(--text-muted)' }}>No data</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
