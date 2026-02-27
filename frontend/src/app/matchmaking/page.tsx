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
            alert('Invite sent.');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!user) {
        return (
            <div className="page container">
                <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ ! ]</div>
                    <div className="empty-state-title">Authentication Required</div>
                    <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Log In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '800px' }}>
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <div className="mono-label" style={{ marginBottom: '8px' }}>MATCHMAKING SYSTEM</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Find Your <span className="text-gradient">Rivals.</span>
                </h1>
            </div>

            <div className="tabs" style={{ marginBottom: '32px' }}>
                <button className={`tab ${tab === 'find' ? 'active' : ''}`} onClick={() => setTab('find')}>
                    SUGGESTED MATCHES
                </button>
                <button className={`tab ${tab === 'invites' ? 'active' : ''}`} onClick={() => setTab('invites')}>
                    PENDING INVITES {invites.length > 0 && <span className="badge badge-default" style={{ marginLeft: '8px', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>{invites.length}</span>}
                </button>
            </div>

            {tab === 'find' && (
                loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)' }} />)}
                    </div>
                ) : rivals.length === 0 ? (
                    <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                        <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ R ]</div>
                        <div className="empty-state-title">No Matches Found</div>
                        <div className="empty-state-text" style={{ maxWidth: '400px' }}>Set some goals first so the algorithm can match you with similar competitors pursuing the same objectives.</div>
                        <Link href="/goals/new" className="btn btn-primary" style={{ marginTop: '24px' }}>Set a Goal</Link>
                    </div>
                ) : (
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {rivals.map((rival: any) => (
                            <div key={rival.user.id} className="glass-card glass-card-glow" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div className="avatar avatar-lg" style={{ border: '1px solid var(--border-medium)', background: 'rgba(255,255,255,0.03)' }}>
                                        {rival.user.username[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>@{rival.user.username}</span>
                                            <span className="badge badge-default" style={{ border: '1px solid var(--border-subtle)' }}>{rival.matchScore}% MATCH</span>
                                        </div>
                                        {rival.user.bio && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>{rival.user.bio}</p>}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {rival.sharedGoals?.map((g: any, i: number) => (
                                                <span key={i} className="badge badge-default" style={{ fontSize: '0.65rem' }}>{g.category.toUpperCase()}</span>
                                            ))}
                                            <span className="badge badge-default" style={{ fontSize: '0.65rem', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>{rival.profile?.skillLevel.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleInvite(rival.user.id)} className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                                        SEND INVITE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === 'invites' && (
                invites.length === 0 ? (
                    <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                        <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ / ]</div>
                        <div className="empty-state-title">Inbox Empty</div>
                        <div className="empty-state-text">You have no pending competition invites.</div>
                    </div>
                ) : (
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {invites.map((inv: any) => (
                            <div key={inv.id} className="glass-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div className="avatar">{inv.sender?.username?.[0]?.toUpperCase()}</div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, fontSize: '1.05rem', display: 'block', marginBottom: '4px' }}>@{inv.sender?.username}</span>
                                        {inv.message && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{inv.message}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn btn-primary">ACCEPT</button>
                                        <button className="btn btn-outline">DECLINE</button>
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
