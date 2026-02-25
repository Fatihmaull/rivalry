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
                    <div className="empty-state-title">Please log in</div>
                    <Link href="/login" className="btn btn-primary">Log In</Link>
                </div>
            </div>
        );
    }

    const activeRooms = rooms.filter((r: Room) => r.status === 'active' || r.status === 'waiting');
    const completedRooms = rooms.filter((r: Room) => r.status === 'completed');

    return (
        <div className="page container">
            {/* Welcome Header */}
            <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                    Welcome back, <span className="text-gradient">{user.username}</span> 👋
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Here&apos;s your competition overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-4 stagger" style={{ marginBottom: '32px' }}>
                <div className="stat-card glass-card">
                    <div className="stat-value text-gradient">{stats?.totalWins || 0}</div>
                    <div className="stat-label">Wins</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                        {stats?.totalWins && stats?.totalCompleted
                            ? ((stats.totalWins / stats.totalCompleted) * 100).toFixed(0)
                            : '0'}%
                    </div>
                    <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{Number(stats?.totalPrizeWon || 0).toFixed(0)}</div>
                    <div className="stat-label">Credits Won</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{activeRooms.length}</div>
                    <div className="stat-label">Active Rooms</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <Link href="/goals/new" className="btn btn-primary">🎯 Set New Goal</Link>
                <Link href="/matchmaking" className="btn btn-secondary">⚔️ Find Rival</Link>
                <Link href="/rooms/new" className="btn btn-secondary">🏟️ Create Room</Link>
                <Link href="/wallet" className="btn btn-outline">💰 Wallet</Link>
            </div>

            {/* Active Competitions */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Active Competitions</h2>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />)}
                    </div>
                ) : activeRooms.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚔️</div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No active competitions yet</p>
                        <Link href="/rooms" className="btn btn-primary btn-sm">Browse Rooms</Link>
                    </div>
                ) : (
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeRooms.map((room: Room & { myProgress?: number }) => (
                            <Link key={room.id} href={`/rooms/${room.id}`} className="glass-card glass-card-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{room.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                                        <span className={`status-${room.status}`}>{room.status}</span>
                                        <span>{room.type}</span>
                                        <span>💰 {Number(room.prizePool).toFixed(2)} credits</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="progress-bar" style={{ width: '120px', marginBottom: '4px' }}>
                                        <div className="progress-bar-fill" style={{ width: `${room.myProgress || 0}%` }} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Number(room.myProgress || 0).toFixed(0)}% complete</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Goals */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.3rem' }}>Your Goals</h2>
                    <Link href="/goals/new" className="btn btn-outline btn-sm">+ New Goal</Link>
                </div>
                {goals.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                        <p style={{ color: 'var(--text-muted)' }}>Set your first goal to start competing</p>
                    </div>
                ) : (
                    <div className="grid-2 stagger">
                        {goals.map((goal: Goal) => (
                            <div key={goal.id} className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span className="badge badge-blue">{goal.category}</span>
                                    <span className={`badge badge-${goal.difficulty === 'hard' || goal.difficulty === 'extreme' ? 'red' : goal.difficulty === 'medium' ? 'orange' : 'green'}`}>
                                        {goal.difficulty}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{goal.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goal.goalType} · {goal.timeline.replace('_', ' ')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
