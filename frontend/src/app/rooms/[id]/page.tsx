'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { toast } from '../../../lib/toast';

export default function RoomDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('roadmap');
    const [proofContents, setProofContents] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [inviting, setInviting] = useState(false);

    // Winner Modal State
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [reporting, setReporting] = useState(false);

    // Notification State
    const [hasNotifiedAgree, setHasNotifiedAgree] = useState(false);
    const [hasNotifiedStart, setHasNotifiedStart] = useState(false);
    const [showRoomNotifications, setShowRoomNotifications] = useState(false);

    // Proof Validation State
    const [pendingProofs, setPendingProofs] = useState<any[]>([]);
    const [reviewing, setReviewing] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!id) return;
        const fetchRoomData = async () => {
            try {
                const roomData = await api.getRoom(id as string);
                setRoom(roomData);
                const proofs = await api.getPendingProofs(id as string);
                setPendingProofs(proofs);

                // Show winner modal only once per session if completed
                if (roomData.status === 'completed' && !sessionStorage.getItem(`winnerModal_${roomData.id}`)) {
                    setShowWinnerModal(true);
                    sessionStorage.setItem(`winnerModal_${roomData.id}`, 'true');
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRoomData().finally(() => setLoading(false));
        const interval = setInterval(fetchRoomData, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const myParticipant = room?.participants?.find((p: any) => p.userId === user?.id);
    const isParticipant = !!myParticipant;
    const isCreator = room?.creatorId === user?.id;
    const hasOpenSlots = room?.maxPlayers && room?.participants && room.participants.length < room.maxPlayers;
    const hasAgreed = myParticipant?.hasAgreed;
    const hasStarted = myParticipant?.hasStarted;

    const handleJoin = async () => {
        try {
            const updated = await api.joinRoom(room.id);
            setRoom(updated);
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        }
    };

    const handleSearchUsers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await api.searchUsers(searchQuery);
            setSearchResults(res.filter((u: any) => u.id !== user?.id && !room.participants.some((p: any) => p.userId === u.id)));
        } catch (err: any) {
            toast.error(err.message || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleSendInvite = async (receiverId: string, username: string) => {
        setInviting(true);
        try {
            await api.sendInvite({ receiverId, goalId: room.id, message: `Invited you to join ${room.title}` });
            toast.success(`Invite sent to @${username}`);
            setShowInviteModal(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err: any) {
            toast.error(err.message || 'Failed to send invite');
        } finally {
            setInviting(false);
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
            // Re-fetch pending proofs if it's auto-validated or affects state
            const proofs = await api.getPendingProofs(room.id);
            setPendingProofs(proofs);
            toast.success("Proof submitted for review");
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReviewProof = async (proofId: string, approved: boolean) => {
        setReviewing(prev => ({ ...prev, [proofId]: true }));
        try {
            await api.reviewProof(proofId, approved);
            toast.success(`Proof ${approved ? 'approved' : 'declined'}`);
            // Refresh data
            const [roomData, proofs] = await Promise.all([
                api.getRoom(room.id),
                api.getPendingProofs(room.id)
            ]);
            setRoom(roomData);
            setPendingProofs(proofs);
        } catch (err: any) {
            toast.error(err.message || 'Error reviewing proof');
        } finally {
            setReviewing(prev => ({ ...prev, [proofId]: false }));
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
            <div className="card-premium animate-fade-in" style={{ marginBottom: '32px', padding: '32px', position: 'relative', zIndex: 50, overflow: 'visible' }}>
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

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', minWidth: '180px' }}>
                        {/* Notification Dropdown Container */}
                        <div style={{ position: 'relative', zIndex: 1000 }}>
                            <button
                                onClick={() => setShowRoomNotifications(!showRoomNotifications)}
                                className="btn btn-icon"
                                style={{
                                    background: showRoomNotifications ? 'var(--bg-layer-2)' : 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-medium)',
                                    padding: '10px',
                                    position: 'relative',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '42px',
                                    height: '42px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {room.feedItems?.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        background: 'var(--accent)',
                                        color: '#000',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        border: '2px solid var(--bg-body)'
                                    }}>
                                        {room.feedItems.length > 9 ? '9+' : room.feedItems.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Panel */}
                            {showRoomNotifications && (
                                <div className="glass-card animate-slide-up" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 12px)',
                                    right: 0,
                                    width: '320px',
                                    padding: '0',
                                    zIndex: 100,
                                    background: 'rgba(20, 20, 20, 0.95)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    border: '1px solid var(--border-medium)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Room Feed</h3>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {!room.feedItems?.length ? (
                                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                No activity yet
                                            </div>
                                        ) : (
                                            room.feedItems.map((item: any) => (
                                                <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', flexShrink: 0
                                                    }}>
                                                        {item.type === 'proof_submitted' ? '✓' : item.type === 'player_joined' ? '+' : item.type === 'message' ? '!' : '◈'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                                            {item.content.split('\n\nContent: ')[0]}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'right', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', width: '100%' }}>
                            <div className="mono-label" style={{ marginBottom: '8px', fontSize: '0.65rem' }}>TOTAL PRIZE POOL</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
                                {Number(room.prizePool).toFixed(0)}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                                CREDITS
                            </div>

                            {isCreator && hasOpenSlots && room.status === 'waiting' && (
                                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                                    <button onClick={() => setShowInviteModal(true)} className="btn btn-secondary btn-full" style={{ fontSize: '0.8rem', padding: '10px' }}>
                                        + Invite Rival
                                    </button>
                                </div>
                            )}
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

                {isParticipant && room.status === 'waiting_for_agreement' && !hasAgreed && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                        <button onClick={async () => {
                            try {
                                const updated = await api.agreeToRoadmap(room.id);
                                setRoom(updated);
                                toast.success('Agreed to roadmap');
                            } catch (err: any) {
                                toast.error(err.message || 'Error agreeing to roadmap');
                            }
                        }} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>✓</span>
                            Agree to Roadmap
                        </button>
                    </div>
                )}
                {isParticipant && room.status === 'waiting_for_agreement' && hasAgreed && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="mono-label" style={{ color: 'var(--text-primary)' }}>Waiting for other players to agree...</div>
                        <button
                            onClick={async () => {
                                try {
                                    await api.notifyRoomPlayers(room.id);
                                    toast.success('Notification sent to pending players!');
                                    setHasNotifiedAgree(true);
                                } catch (err: any) {
                                    toast.error(err.message || 'Error sending notification');
                                }
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled={hasNotifiedAgree}
                        >
                            {hasNotifiedAgree ? 'Notified ✓' : 'Notify Them'}
                        </button>
                    </div>
                )}

                {isParticipant && room.status === 'waiting_for_start' && !hasStarted && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                        <button onClick={async () => {
                            try {
                                const updated = await api.startRoom(room.id);
                                setRoom(updated);
                                toast.success('Ready to start!');
                            } catch (err: any) {
                                toast.error(err.message || 'Error starting room');
                            }
                        }} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>▶</span>
                            Start Competition
                        </button>
                    </div>
                )}
                {isParticipant && room.status === 'waiting_for_start' && hasStarted && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="mono-label" style={{ color: 'var(--text-primary)' }}>Waiting for other players to start...</div>
                        <button
                            onClick={async () => {
                                try {
                                    await api.notifyRoomPlayers(room.id);
                                    toast.success('Notification sent to pending players!');
                                    setHasNotifiedStart(true);
                                } catch (err: any) {
                                    toast.error(err.message || 'Error sending notification');
                                }
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled={hasNotifiedStart}
                        >
                            {hasNotifiedStart ? 'Notified ✓' : 'Notify Them'}
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
                                    {myProof && myProof.status === 'approved' && <span className="badge badge-default" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>✓ COMPLETED</span>}
                                    {myProof && myProof.status === 'pending' && <span className="badge badge-default" style={{ border: '1px solid var(--warning)', color: 'var(--warning)', background: 'transparent' }}>PENDING SUBMISSION</span>}
                                    {!myProof && isParticipant && <span className="badge badge-default" style={{ border: '1px solid var(--text-muted)', color: 'var(--text-muted)', background: 'transparent' }}>UNSUBMITTED</span>}
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

                                {/* Pending Proofs Review Section */}
                                {pendingProofs.filter(p => p.milestoneId === m.id).length > 0 && (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>PENDING REVIEWS</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {pendingProofs.filter(p => p.milestoneId === m.id).map(proof => (
                                                <div key={proof.id} style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid var(--border-medium)',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: '16px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                                            {proof.user?.username?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>@{proof.user?.username}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>submitted a proof</span>
                                                    </div>

                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        padding: '12px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.9rem',
                                                        wordBreak: 'break-all',
                                                        borderLeft: '2px solid var(--text-primary)'
                                                    }}>
                                                        {proof.content.startsWith('http') ? (
                                                            <a href={proof.content} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                                                                {proof.content}
                                                            </a>
                                                        ) : (
                                                            proof.content
                                                        )}
                                                    </div>

                                                    {proof.userId !== user?.id && isParticipant && (
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                            <button
                                                                onClick={() => handleReviewProof(proof.id, true)}
                                                                className="btn btn-primary btn-sm"
                                                                disabled={reviewing[proof.id]}
                                                                style={{ flex: 1 }}
                                                            >
                                                                ✓ Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReviewProof(proof.id, false)}
                                                                className="btn btn-secondary btn-sm"
                                                                disabled={reviewing[proof.id]}
                                                                style={{ flex: 1 }}
                                                            >
                                                                ✕ Decline
                                                            </button>
                                                        </div>
                                                    )}
                                                    {proof.userId === user?.id && (
                                                        <div className="mono-label" style={{ color: 'var(--warning)', textAlign: 'right' }}>Waiting for peer review...</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
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
                                        toast.error(err.message || 'An error occurred');
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
                        <div
                            key={item.id}
                            className="glass-card"
                            style={{
                                padding: '20px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                cursor: item.type === 'milestone_completed' ? 'pointer' : 'default',
                                border: item.type === 'milestone_completed' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                                transition: 'transform 0.2s, border-color 0.2s',
                                transform: item.type === 'milestone_completed' ? 'scale(1.01)' : 'none'
                            }}
                            onClick={() => {
                                if (item.type === 'milestone_completed') setShowWinnerModal(true);
                            }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                border: item.type === 'milestone_completed' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', flexShrink: 0,
                                color: item.type === 'milestone_completed' ? 'var(--accent)' : 'var(--text-muted)'
                            }}>
                                {item.type === 'proof_submitted' ? '✓' : item.type === 'player_joined' ? '+' : item.type === 'milestone_completed' ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                ) : '◈'}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '4px', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                    {item.content.includes('\n\nContent: ') ? (
                                        <>
                                            {item.content.split('\n\nContent: ')[0].replace('🏆 ', '')}
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '12px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderLeft: '2px solid var(--text-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.85rem'
                                            }}>
                                                {item.content.split('\n\nContent: ')[1].startsWith('http') ? (
                                                    <a href={item.content.split('\n\nContent: ')[1]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                                                        {item.content.split('\n\nContent: ')[1]}
                                                    </a>
                                                ) : (
                                                    item.content.split('\n\nContent: ')[1]
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        item.content.replace('🏆 ', '').replace('🚨 ', '')
                                    )}
                                </div>
                                {item.mediaUrl && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <img src={item.mediaUrl} alt="Proof Media" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                                    </div>
                                )}
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

            {/* ═══ INVITE MODAL ═══ */}
            {showInviteModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                    <div className="card-premium animate-slide-up" style={{ width: '100%', maxWidth: '500px', margin: '20px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Invite a Rival</h2>
                            <button onClick={() => setShowInviteModal(false)} className="btn-ghost" style={{ fontSize: '1.5rem', padding: '0 8px' }}>×</button>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Search for users by username to invite them to this competition.</p>

                        <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search username..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary" disabled={searching || !searchQuery.trim()}>
                                {searching ? '...' : 'Search'}
                            </button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                            {searchResults.length === 0 && searchQuery && !searching && (
                                <div className="mono-label" style={{ textAlign: 'center', padding: '24px 0' }}>No available users found.</div>
                            )}
                            {searchResults.map((u: any) => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar">{u.username[0].toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>@{u.username}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSendInvite(u.id, u.username)}
                                        className="btn btn-secondary btn-sm"
                                        disabled={inviting}
                                    >
                                        Invite
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ WINNER MODAL ═══ */}
            {showWinnerModal && room?.status === 'completed' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="card-premium animate-slide-up" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                            <button onClick={() => setShowWinnerModal(false)} className="btn-ghost" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '1.5rem', padding: '0 8px' }}>×</button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div className="mono-label" style={{ color: 'var(--accent)' }}>COMPETITION WINNER</div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                                        @{room.participants?.find((p: any) => p.userId === room.winnerId)?.user?.username}
                                    </h2>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '12px' }}>
                                Review the complete trajectory and validated submissions of the winner. Did they truly earn the prize pool?
                            </p>
                        </div>

                        <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Victory Trajectory</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {room.roadmap?.milestones?.map((m: any) => {
                                    const proof = m.proofs?.find((p: any) => p.userId === room.winnerId && p.status === 'approved');
                                    return (
                                        <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <span className="mono-label" style={{ color: 'var(--text-primary)' }}>W{m.weekNumber}</span>
                                                    <span style={{ fontWeight: 600 }}>{m.title}</span>
                                                </div>
                                                {proof ? (
                                                    <span className="badge badge-default" style={{ color: 'var(--text-primary)', border: '1px solid var(--text-primary)' }}>✓ Validated</span>
                                                ) : (
                                                    <span className="badge badge-default" style={{ color: 'var(--text-muted)' }}>Missed</span>
                                                )}
                                            </div>

                                            {proof && (
                                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--text-primary)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                                                    {proof.content.startsWith('http') ? (
                                                        <a href={proof.content} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{proof.content}</a>
                                                    ) : (
                                                        proof.content
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Looks suspicious?</div>
                            </div>
                            <button
                                onClick={async () => {
                                    setReporting(true);
                                    try {
                                        await api.reportWinner(room.id);
                                        toast.success("Flag raised. Admins will review the submissions.");
                                        setShowWinnerModal(false);
                                    } catch (err: any) {
                                        toast.error(err.message || 'Failed to submit report');
                                    } finally {
                                        setReporting(false);
                                    }
                                }}
                                className="btn btn-secondary btn-sm"
                                disabled={reporting}
                                style={{ border: '1px solid var(--warning)', color: 'var(--warning)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                    <line x1="4" y1="22" x2="4" y2="15"></line>
                                </svg>
                                {reporting ? 'Reporting...' : 'Flag & Report Winner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
