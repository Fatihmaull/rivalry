'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function RoomsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>({ rooms: [], total: 0 });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params: any = {};
        if (filter !== 'all') params.status = filter;
        api.listRooms(params).then(setData).catch(console.error).finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="page container-wide">
            {/* ═══ HEADER ═══ */}
            <div className="animate-fade-in" style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                    <div className="mono-label" style={{ marginBottom: '8px' }}>COMPETITION LOBBY</div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                        Find your next <span className="text-gradient">battle.</span>
                    </h1>
                </div>
                {user && (
                    <Link href="/rooms/new" className="btn btn-primary">
                        + Create Room
                    </Link>
                )}
            </div>

            {/* ═══ FILTERS ═══ */}
            <div className="tabs" style={{ marginBottom: '32px' }}>
                {['all', 'waiting', 'active', 'completed'].map(s => (
                    <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => { setFilter(s); setLoading(true); }}>
                        {s === 'all' ? 'All Rooms' : s.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* ═══ ROOMS LIST ═══ */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />)}
                </div>
            ) : data.rooms.length === 0 ? (
                <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ ]</div>
                    <div className="empty-state-title">No Competitions Found</div>
                    <div className="empty-state-text">There are currently no rooms matching your filter.</div>
                    {user && <Link href="/rooms/new" className="btn btn-primary">Create Room</Link>}
                </div>
            ) : (
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                    {data.rooms.map((room: any) => (
                        <Link key={room.id} href={`/rooms/${room.id}`} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
                            {/* Room Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span className={`badge badge-${room.status === 'active' ? 'green' : room.status === 'waiting' ? 'default' : 'default'} ${room.status === 'waiting' ? 'text-glow' : ''}`}>
                                        {room.status}
                                    </span>
                                    <span className="badge badge-default" style={{ border: '1px solid var(--border-subtle)' }}>{room.type}</span>
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                                    {room.creator?.username ? `BY @${room.creator.username.toUpperCase()}` : ''}
                                </div>
                            </div>

                            {/* Title & Info */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '16px', lineHeight: 1.3 }}>{room.title}</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <div className="mono-label" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>PLAYERS</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                            {room._count?.participants || 0} / {room.maxPlayers}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mono-label" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>DEPOSIT</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {Number(room.entryDeposit).toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Prize Pool */}
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="mono-label" style={{ fontSize: '0.6rem', marginBottom: '2px' }}>PRIZE POOL</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                                        {Number(room.prizePool).toFixed(0)}
                                    </div>
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', border: '1px solid var(--border-subtle)' }} className="room-arrow">
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-card:hover .room-arrow {
                    background: #ffffff !important;
                }
                .glass-card:hover .room-arrow span {
                    color: #000000 !important;
                }
            `}} />
        </div>
    );
}
