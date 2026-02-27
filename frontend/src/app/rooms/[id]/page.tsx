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
            <div className="page container" style={{ maxWidth: '900px' }}>
                <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }} />
                <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ ! ]</div>
                    <div className="empty-state-title">Room Not Found</div>
                    <div className="empty-state-text">This competition either doesn't exist or was removed.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '900px' }}>
            {/* ═══ ROOM HEADER ═══ */}
            <div className="card-premium animate-fade-in" style={{ marginBottom: '32px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <span className={`badge badge-${room.status === 'active' ? 'green' : room.status === 'waiting' ? 'default' : 'default'} ${room.status === 'waiting' ? 'text-glow' : ''}`}>
                                {room.status}
                            </span>
                            <span className="badge badge-default" style={{ border: '1px solid var(--border-subtle)' }}>
                                {room.type}
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.1 }}>
                            {room.title}
                        </h1>
                        {room.description && (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '600px' }}>
                                {room.description}
                            </p>
                        )}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                            CREATED BY <span style={{ color: 'var(--text-muted)' }}>@{room.creator?.username.toUpperCase()}</span>
                            <span style={{ margin: '0 8px' }}>·</span>
                            DURATION <span style={{ color: 'var(--text-muted)' }}>{room.duration?.replace('_', ' ').toUpperCase()}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', minWidth: '180px' }}>
                        <div className="mono-label" style={{ marginBottom: '8px', fontSize: '0.65rem' }}>TOTAL PRIZE POOL</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {Number(room.prizePool).toFixed(0)}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                            CREDITS
                        </div>
                    </div>
                </div>

                {!isParticipant && room.status === 'waiting' && user && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                        <button onClick={handleJoin} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>◈</span>
                            Join Competition ({Number(room.entryDeposit).toFixed(0)} credits)
                        </button>
                    </div>
                )}
            </div>

            {/* ═══ TABS ═══ */}
            <div className="tabs" style={{ marginBottom: '32px' }}>
                {['roadmap', 'leaderboard', 'feed'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'roadmap' ? 'ROADMAP' : t === 'leaderboard' ? 'LEADERBOARD' : 'FEED'}
                    </button>
                ))}
            </div>

            {/* ═══ TAB CONTENT ═══ */}
            {tab === 'roadmap' && (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {room.roadmap?.milestones?.length ? room.roadmap.milestones.map((m: any, idx: number) => {
                        const proofs = m.proofs || [];
                        const myProof = proofs.find((p: any) => p.userId === user?.id);
                        return (
                            <div key={m.id} className="glass-card" style={{
                                borderLeft: myProof ? '3px solid var(--text-primary)' : '3px solid var(--border-subtle)',
                                padding: '24px',
                                opacity: myProof ? 0.6 : 1,
                                transition: 'opacity 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className="mono-label" style={{ color: 'var(--text-primary)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '4px' }}>
                                            WEEK {m.weekNumber}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{m.title}</h3>
                                    </div>
                                    {myProof && <span className="badge badge-default" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>✓ COMPLETED</span>}
                                </div>

                                {m.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>{m.description}</p>}

                                {m.substeps?.length > 0 && (
                                    <ul style={{ paddingLeft: '20px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {m.substeps.map((s: any) => (
                                            <li key={s.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.title}</li>
                                        ))}
                                    </ul>
                                )}

                                {isParticipant && !myProof && room.status === 'active' && (
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                        <input
                                            className="input"
                                            placeholder="Paste link to proof..."
                                            value={proofContents[m.id] || ''}
                                            onChange={e => setProofContents(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            style={{ flex: 1, background: 'transparent' }}
                                        />
                                        <button onClick={() => handleSubmitProof(m.id)} className="btn btn-secondary" disabled={submitting}>
                                            {submitting ? 'Submitting...' : 'Submit Proof'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                            <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ R ]</div>
                            <div className="empty-state-title">Roadmap Pending</div>
                            <div className="empty-state-text">The AI roadmap will generate once the competition starts.</div>
                        </div>
                    )}

                    {isParticipant && room.status === 'active' && room.participants.find((p: any) => p.userId === user?.id)?.progress >= 100 && (
                        <div className="card-premium animate-slide-up" style={{ textAlign: 'center', marginTop: '24px', padding: '48px 24px' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '16px' }}>◆</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 800 }}>All Milestones Completed</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                                You have finished your roadmap. Claim your victory and take the prize pool.
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
                                style={{ padding: '16px 48px', boxShadow: 'var(--shadow-glow)' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : 'CLAIM VICTORY'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'leaderboard' && (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {room.participants?.map((p: any, idx: number) => (
                        <div key={p.id} className="leaderboard-row" style={{ padding: '24px' }}>
                            <span className={`leaderboard-rank ${idx === 0 ? 'text-glow' : ''}`} style={{ width: '40px', color: idx === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {idx === 0 ? '01' : idx === 1 ? '02' : idx === 2 ? '03' : `0${idx + 1}`}
                            </span>
                            <div className="avatar">{p.user?.username?.[0]?.toUpperCase()}</div>
                            <div style={{ flex: 1, paddingLeft: '8px' }}>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>{p.user?.username}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.status.toUpperCase()}</div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div className="progress-bar" style={{ width: '100px', background: 'rgba(255,255,255,0.06)' }}>
                                        <div className="progress-bar-fill" style={{ width: `${p.progress}%`, background: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
                                    </div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {Number(p.progress).toFixed(0)}% DONE
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'feed' && (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {room.feedItems?.length ? room.feedItems.map((item: any) => (
                        <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0
                            }}>
                                {item.type === 'proof_submitted' ? '✓' : item.type === 'player_joined' ? '+' : '◈'}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '4px', lineHeight: 1.5 }}>
                                    {item.content}
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                    {item.type.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                            <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ / ]</div>
                            <div className="empty-state-title">No Activity Yet</div>
                            <div className="empty-state-text">Events will appear here once the room becomes active.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
