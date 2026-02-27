'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useMyRooms, useGoals, useUserStats } from '../../lib/hooks';
import type { Room, Goal, UserStats } from '../../lib/types';

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: rooms = [], isLoading: roomsLoading } = useMyRooms();
    const { data: goals = [], isLoading: goalsLoading } = useGoals();
    const { data: stats } = useUserStats(user?.id);

    const loading = roomsLoading || goalsLoading;

    if (!user) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <div className="empty-state-title">Authentication Required</div>
                    <div className="empty-state-text">Please log in to view your dashboard.</div>
                    <Link href="/login" className="btn btn-primary">Sign In</Link>
                </div>
            </div>
        );
    }

    const activeRooms = rooms.filter((r: Room) => r.status === 'active' || r.status === 'waiting');
    const completedRooms = rooms.filter((r: Room) => r.status === 'completed');

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="page container-wide">
            {/* ═══ HEADER ═══ */}
            <div className="animate-fade-in" style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                    <div className="mono-label" style={{ marginBottom: '8px' }}>DASHBOARD OVERVIEW</div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                        {greeting}, <span className="text-gradient">{user.username}</span>.
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/goals/new" className="btn btn-primary">
                        + New Goal
                    </Link>
                    <Link href="/rooms/new" className="btn btn-secondary">
                        Create Room
                    </Link>
                </div>
            </div>

            {/* ═══ STATS ═══ */}
            <div className="grid-4 stagger" style={{ marginBottom: '48px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '16px' }}>TOTAL WINS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                        {stats?.totalWins || 0}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '16px' }}>WIN RATE</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                        {stats?.totalWins && stats?.totalCompleted
                            ? ((stats.totalWins / stats.totalCompleted) * 100).toFixed(0)
                            : '0'}%
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '16px' }}>CREDITS WON</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-secondary)' }}>
                        {Number(stats?.totalPrizeWon || 0).toFixed(0)}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '16px' }}>ACTIVE ROOMS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                        {activeRooms.length}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px' }} className="responsive-grid-dashboard">
                {/* ═══ MAIN COLUMN ═══ */}
                <div>
                    <div className="section-label">ACTIVE COMPETITIONS</div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />)}
                        </div>
                    ) : activeRooms.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '64px 24px', borderStyle: 'dashed' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.1em' }}>[ NO ACTIVE ROOMS ]</div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Ready to compete?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Join an existing competition or create your own to start earning credits.</p>
                            <Link href="/rooms" className="btn btn-primary">Browse Rooms</Link>
                        </div>
                    ) : (
                        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {activeRooms.map((room: Room & { myProgress?: number }) => (
                                <Link key={room.id} href={`/rooms/${room.id}`} className="card-premium" style={{ display: 'block', textDecoration: 'none', transition: 'transform 0.2s', padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                                <span className={`badge badge-${room.status === 'active' ? 'green' : 'orange'}`}>
                                                    {room.status}
                                                </span>
                                                <span className="badge badge-default">{room.type}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{room.title}</h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                                                {Number(room.prizePool).toFixed(0)}
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px' }}>PRIZE POOL</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className="progress-bar" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', height: '6px' }}>
                                            <div className="progress-bar-fill" style={{ width: `${room.myProgress || 0}%`, background: 'var(--text-primary)' }} />
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', width: '40px', textAlign: 'right' }}>
                                            {Number(room.myProgress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ SIDEBAR ═══ */}
                <div>
                    <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        YOUR GOALS
                        <Link href="/goals/new" style={{ color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Add</Link>
                    </div>

                    {goals.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px', borderStyle: 'dashed' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No goals set yet.</p>
                        </div>
                    ) : (
                        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {goals.map((goal: Goal) => (
                                <div key={goal.id} className="glass-card" style={{ padding: '20px 20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'rgba(255,255,255,0.2)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, paddingRight: '12px' }}>{goal.title}</h4>
                                        <span className={`badge badge-${goal.difficulty === 'hard' || goal.difficulty === 'extreme' ? 'red' : 'default'}`}>
                                            {goal.difficulty}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                        <span>{goal.category.toUpperCase()}</span>
                                        <span>•</span>
                                        <span>{goal.timeline.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="section-label" style={{ marginTop: '48px' }}>QUICK ACTIONS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link href="/matchmaking" className="btn btn-secondary btn-full" style={{ justifyContent: 'space-between' }}>
                            <span>Find Rivals</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>→</span>
                        </Link>
                        <Link href="/wallet" className="btn btn-outline btn-full" style={{ justifyContent: 'space-between' }}>
                            <span>Wallet & Transactions</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 900px) {
                    .responsive-grid-dashboard {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </div>
    );
}
