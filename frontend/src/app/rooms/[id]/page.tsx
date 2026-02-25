'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function RoomDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('roadmap');
    const [proofContents, setProofContents] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) api.getRoom(id as string).then(setRoom).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    const isParticipant = room?.participants?.some((p: any) => p.userId === user?.id);

    const handleJoin = async () => {
        try {
            const updated = await api.joinRoom(room.id);
            setRoom(updated);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmitProof = async (milestoneId: string) => {
        const content = proofContents[milestoneId];
        if (!content?.trim()) return;
        setSubmitting(true);
        try {
            await api.submitProof(milestoneId, { type: 'text', content });
            setProofContents(prev => ({ ...prev, [milestoneId]: '' }));
            const updated = await api.getRoom(room.id);
            setRoom(updated);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page container">
                <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <div className="empty-state-title">Room not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '900px' }}>
            {/* Room Header */}
            <div className="glass-card animate-fade-in" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <span className={`badge badge-${room.status === 'active' ? 'green' : room.status === 'waiting' ? 'orange' : 'blue'}`}>
                                {room.status}
                            </span>
                            <span className="badge badge-purple">{room.type}</span>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{room.title}</h1>
                        {room.description && <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{room.description}</p>}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Created by @{room.creator?.username} · {room.duration?.replace('_', ' ')}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }} className="text-gradient">{Number(room.prizePool).toFixed(2)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRIZE POOL</div>
                    </div>
                </div>
                {!isParticipant && room.status === 'waiting' && user && (
                    <button onClick={handleJoin} className="btn btn-primary" style={{ marginTop: '16px' }}>
                        ⚔️ Join Room ({Number(room.entryDeposit).toFixed(2)} credits)
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                {['roadmap', 'leaderboard', 'feed'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'roadmap' ? '📋 Roadmap' : t === 'leaderboard' ? '🏆 Leaderboard' : '💬 Feed'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'roadmap' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {room.roadmap?.milestones?.length ? room.roadmap.milestones.map((m: any, idx: number) => {
                        const proofs = m.proofs || [];
                        const myProof = proofs.find((p: any) => p.userId === user?.id);
                        return (
                            <div key={m.id} className="glass-card" style={{ borderLeft: myProof ? '3px solid var(--accent-green)' : '3px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Week {m.weekNumber}</span>
                                        <h3 style={{ fontSize: '1rem' }}>{m.title}</h3>
                                    </div>
                                    {myProof && <span className="badge badge-green">✓ Done</span>}
                                </div>
                                {m.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{m.description}</p>}

                                {m.substeps?.length > 0 && (
                                    <ul style={{ paddingLeft: '20px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {m.substeps.map((s: any) => (
                                            <li key={s.id}>{s.title}</li>
                                        ))}
                                    </ul>
                                )}

                                {isParticipant && !myProof && room.status === 'active' && (
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                        <input
                                            className="input"
                                            placeholder="Submit proof..."
                                            value={proofContents[m.id] || ''}
                                            onChange={e => setProofContents(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            style={{ flex: 1 }}
                                        />
                                        <button onClick={() => handleSubmitProof(m.id)} className="btn btn-primary btn-sm" disabled={submitting}>
                                            {submitting ? '...' : 'Submit'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-title">Roadmap generates when room starts</div>
                            <div className="empty-state-text">Waiting for all players to join</div>
                        </div>
                    )}

                    {isParticipant && room.status === 'active' && room.participants.find((p: any) => p.userId === user?.id)?.progress >= 100 && (
                        <div className="glass-card animate-slide-up" style={{ textAlign: 'center', border: '1px solid var(--accent-gold)', background: 'rgba(255, 215, 0, 0.05)', marginTop: '12px' }}>
                            <h3 style={{ marginBottom: '8px' }}>🎉 All milestones reached!</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                You've completed your roadmap. Ready to claim your victory?
                            </p>
                            <button
                                onClick={async () => {
                                    setSubmitting(true);
                                    try {
                                        const updated = await api.completeRoom(room.id);
                                        setRoom(updated);
                                    } catch (err: any) {
                                        alert(err.message);
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', background: 'var(--gradient-primary)' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Claiming...' : '🏆 Finish & Claim Victory'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'leaderboard' && (
                <div className="glass-card">
                    {room.participants?.map((p: any, idx: number) => (
                        <div key={p.id} className="leaderboard-row">
                            <span className={`leaderboard-rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}`}>
                                #{idx + 1}
                            </span>
                            <div className="avatar avatar-sm">{p.user?.username?.[0]?.toUpperCase()}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{p.user?.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.status}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="progress-bar" style={{ width: '100px', marginBottom: '4px' }}>
                                    <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Number(p.progress).toFixed(0)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'feed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {room.feedItems?.length ? room.feedItems.map((item: any) => (
                        <div key={item.id} className="glass-card" style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`badge badge-${item.type === 'proof_submitted' ? 'green' : item.type === 'player_joined' ? 'blue' : 'purple'}`} style={{ fontSize: '0.7rem' }}>
                                    {item.type.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '0.85rem' }}>{item.content}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <div className="empty-state-text">No activity yet</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
