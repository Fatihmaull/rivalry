'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function ProfilePage() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            api.getUser(id as string).catch(() => null),
            api.getUserStats(id as string).catch(() => null),
        ]).then(([p, s]) => {
            setProfile(p);
            setStats(s);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <div className="page container" style={{ maxWidth: '700px' }}>
                <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <div className="empty-state-title">User not found</div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="page container" style={{ maxWidth: '700px' }}>
            {/* Profile Header */}
            <div className="glass-card animate-slide-up" style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
                <div className="avatar avatar-xl" style={{ margin: '0 auto 16px' }}>{profile.username[0].toUpperCase()}</div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>@{profile.username}</h1>
                {profile.bio && <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{profile.bio}</p>}
                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>{profile._count?.followers || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Followers</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{profile._count?.following || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Following</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{profile._count?.participants || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rooms</div>
                    </div>
                </div>
                {!isOwnProfile && currentUser && (
                    <button className="btn btn-primary btn-sm">Follow</button>
                )}
                {isOwnProfile && (
                    <Link href="/wallet" className="btn btn-outline btn-sm">💰 Wallet</Link>
                )}
            </div>

            {/* Stats */}
            <div className="grid-4 stagger" style={{ marginBottom: '24px' }}>
                <div className="stat-card glass-card">
                    <div className="stat-value text-gradient">{stats?.totalWins || 0}</div>
                    <div className="stat-label">Wins</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats?.totalLosses || 0}</div>
                    <div className="stat-label">Losses</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats?.winRate || '0'}%</div>
                    <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{stats?.totalPrizeWon?.toFixed(0) || 0}</div>
                    <div className="stat-label">Prize Won</div>
                </div>
            </div>

            {/* Reputation */}
            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>🏅 Reputation</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-purple)' }}>{stats?.reputationScore || 0}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px' }}>points</span>
                    </div>
                    <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (stats?.reputationScore || 0) / 10)}%` }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span className="badge badge-blue">{profile.profile?.skillLevel || 'beginner'}</span>
                    {stats?.totalCompleted > 5 && <span className="badge badge-green">🔥 Committed</span>}
                    {stats?.totalWins > 3 && <span className="badge badge-orange">🏆 Champion</span>}
                </div>
            </div>

            {/* Goals */}
            {profile.goals?.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>🎯 Active Goals</h2>
                    <div className="grid-2 stagger">
                        {profile.goals.filter((g: any) => g.isActive).map((goal: any) => (
                            <div key={goal.id} className="glass-card" style={{ padding: '16px' }}>
                                <span className="badge badge-blue">{goal.category}</span>
                                <h3 style={{ fontSize: '0.95rem', marginTop: '8px' }}>{goal.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goal.difficulty} · {goal.timeline.replace('_', ' ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
