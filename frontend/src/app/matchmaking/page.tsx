'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function MatchmakingPage() {
    const { user } = useAuth();
    const [rivals, setRivals] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('find');

    useEffect(() => {
        if (!user) return;
        Promise.all([
            api.findRivals().catch(() => []),
            api.getInvites().catch(() => []),
        ]).then(([r, i]) => {
            setRivals(r);
            setInvites(i);
            setLoading(false);
        });
    }, [user]);

    const handleInvite = async (rivalId: string) => {
        try {
            await api.sendInvite({ receiverId: rivalId, message: "Let's compete!" });
            alert('Invite sent! 🎯');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!user) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <div className="empty-state-title">Please log in to find rivals</div>
                    <Link href="/login" className="btn btn-primary">Log In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>
                🎯 Find Your <span className="text-gradient">Rival</span>
            </h1>

            <div className="tabs">
                <button className={`tab ${tab === 'find' ? 'active' : ''}`} onClick={() => setTab('find')}>
                    ⚔️ Suggested Rivals
                </button>
                <button className={`tab ${tab === 'invites' ? 'active' : ''}`} onClick={() => setTab('invites')}>
                    📩 Invites {invites.length > 0 && <span className="badge badge-red" style={{ marginLeft: '4px' }}>{invites.length}</span>}
                </button>
            </div>

            {tab === 'find' && (
                loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />)}
                    </div>
                ) : rivals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <div className="empty-state-title">No rivals found yet</div>
                        <div className="empty-state-text">Set some goals first so we can match you with similar competitors</div>
                        <Link href="/goals/new" className="btn btn-primary">Set a Goal</Link>
                    </div>
                ) : (
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {rivals.map((rival: any) => (
                            <div key={rival.user.id} className="glass-card glass-card-glow">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="avatar avatar-lg">{rival.user.username[0].toUpperCase()}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>@{rival.user.username}</span>
                                            <span className="badge badge-blue">{rival.matchScore}% match</span>
                                        </div>
                                        {rival.user.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{rival.user.bio}</p>}
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {rival.sharedGoals?.map((g: any, i: number) => (
                                                <span key={i} className="badge badge-purple">{g.category}</span>
                                            ))}
                                            <span className="badge badge-green">{rival.profile?.skillLevel}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleInvite(rival.user.id)} className="btn btn-primary btn-sm">
                                        ⚔️ Challenge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === 'invites' && (
                invites.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📩</div>
                        <div className="empty-state-title">No pending invites</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {invites.map((inv: any) => (
                            <div key={inv.id} className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="avatar">{inv.sender?.username?.[0]?.toUpperCase()}</div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600 }}>@{inv.sender?.username}</span>
                                        {inv.message && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{inv.message}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary btn-sm">Accept</button>
                                        <button className="btn btn-outline btn-sm">Decline</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
