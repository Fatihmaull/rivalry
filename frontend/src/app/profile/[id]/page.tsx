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
            <div className="page container" style={{ maxWidth: '800px' }}>
                <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page container">
                <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ ! ]</div>
                    <div className="empty-state-title">User Not Found</div>
                    <div className="empty-state-text">This profile may have been deleted or the URL is incorrect.</div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="page container" style={{ maxWidth: '800px' }}>
            {/* ═══ PROFILE HEADER ═══ */}
            <div className="card-premium animate-fade-in" style={{ textAlign: 'center', padding: '64px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
                {/* Background Pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0, transparent 60%)', pointerEvents: 'none' }} />

                <div className="avatar avatar-xl" style={{ margin: '0 auto 24px', border: '2px solid var(--border-light)', boxShadow: 'var(--shadow-glow)' }}>
                    {profile.username[0].toUpperCase()}
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                    @{profile.username}
                </h1>

                {profile.bio && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                        {profile.bio}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginBottom: '32px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900 }}>{profile._count?.followers || 0}</div>
                        <div className="mono-label" style={{ fontSize: '0.65rem' }}>FOLLOWERS</div>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900 }}>{profile._count?.following || 0}</div>
                        <div className="mono-label" style={{ fontSize: '0.65rem' }}>FOLLOWING</div>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900 }}>{profile._count?.participants || 0}</div>
                        <div className="mono-label" style={{ fontSize: '0.65rem' }}>ARENAS JOINED</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                    {!isOwnProfile && currentUser && (
                        <button className="btn btn-primary btn-lg" style={{ padding: '14px 40px' }}>FOLLOW</button>
                    )}
                    {isOwnProfile && (
                        <Link href="/wallet" className="btn btn-secondary btn-lg" style={{ padding: '14px 40px' }}>
                            VIEW WALLET
                        </Link>
                    )}
                </div>
            </div>

            {/* ═══ STATS GRID ═══ */}
            <div className="grid-4 stagger" style={{ marginBottom: '32px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '12px' }}>VICTORIES</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
                        {stats?.totalWins || 0}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '12px' }}>DEFEATS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-dim)' }}>
                        {stats?.totalLosses || 0}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '12px' }}>WIN RATIO</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                        {stats?.winRate || '0'}%
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '12px' }}>NET EARNINGS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                        {Number(stats?.totalPrizeWon || 0).toFixed(0)}
                    </div>
                </div>
            </div>

            <div className="grid-2 stagger" style={{ gap: '32px' }}>
                {/* ═══ REPUTATION ═══ */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <div className="mono-label" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        REPUTATION SCORE
                        <span style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3.5rem', lineHeight: 1, color: 'var(--text-primary)' }}>
                            {stats?.reputationScore || 0}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PTS</span>
                    </div>

                    <div className="progress-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.04)', marginBottom: '32px' }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (stats?.reputationScore || 0) / 10)}%`, background: 'var(--text-primary)' }} />
                    </div>

                    <div className="mono-label" style={{ marginBottom: '16px' }}>TITLES EARNED</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-default" style={{ border: '1px solid var(--border-light)' }}>
                            {profile.profile?.skillLevel?.toUpperCase() || 'BEGINNER'}
                        </span>
                        {stats?.totalCompleted > 5 && <span className="badge badge-default" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>COMMITTED VETERAN</span>}
                        {stats?.totalWins > 3 && <span className="badge badge-default" style={{ border: '1px solid var(--text-primary)', color: '#000', background: '#fff' }}>CHAMPION</span>}
                    </div>
                </div>

                {/* ═══ GOALS ═══ */}
                <div>
                    <div className="mono-label" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        ACTIVE DIRECTIVES
                        <span style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                    </div>

                    {profile.goals?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {profile.goals.filter((g: any) => g.isActive).map((goal: any) => (
                                <div key={goal.id} className="glass-card" style={{ padding: '24px', borderLeft: '2px solid var(--border-light)' }}>
                                    <span className="badge badge-default" style={{ fontSize: '0.65rem', marginBottom: '12px' }}>{goal.category.toUpperCase()}</span>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>{goal.title}</h3>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        DIFF: {goal.difficulty.toUpperCase()} · TL: {goal.timeline.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <div className="empty-state-text">No active goals found.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
