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
        <div className="page container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: '1.8rem' }}>⚔️ Competition <span className="text-gradient">Rooms</span></h1>
                {user && <Link href="/rooms/new" className="btn btn-primary">+ Create Room</Link>}
            </div>

            <div className="tabs">
                {['all', 'waiting', 'active', 'completed'].map(s => (
                    <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => { setFilter(s); setLoading(true); }}>
                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />)}
                </div>
            ) : data.rooms.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏟️</div>
                    <div className="empty-state-title">No rooms found</div>
                    <div className="empty-state-text">Be the first to create a competition room!</div>
                    {user && <Link href="/rooms/new" className="btn btn-primary">Create Room</Link>}
                </div>
            ) : (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.rooms.map((room: any) => (
                        <Link key={room.id} href={`/rooms/${room.id}`} className="glass-card glass-card-glow" style={{ display: 'block', textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{room.title}</h3>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        <span className={`badge badge-${room.status === 'active' ? 'green' : room.status === 'waiting' ? 'orange' : 'blue'}`}>
                                            {room.status}
                                        </span>
                                        <span className="badge badge-purple">{room.type}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                                        <span>👥 {room._count?.participants || 0}/{room.maxPlayers}</span>
                                        <span>💰 {Number(room.entryDeposit).toFixed(2)} deposit</span>
                                        <span>🏆 {Number(room.prizePool).toFixed(2)} pool</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    {room.creator?.username && <div>by @{room.creator.username}</div>}
                                    <div>👁️ {room._count?.observers || 0} watching</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
