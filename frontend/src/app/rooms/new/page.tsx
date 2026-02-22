'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function NewRoomPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('1v1');
    const [entryDeposit, setEntryDeposit] = useState(10);
    const [proofType, setProofType] = useState('any');
    const [duration, setDuration] = useState('1_month');
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const room = await api.createRoom({ title, description, type, entryDeposit, proofType, duration, maxPlayers: type === '1v1' ? 2 : maxPlayers });
            router.push(`/rooms/${room.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page container" style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '32px' }}>🏟️ Create <span className="text-gradient">Competition Room</span></h1>

            {error && (
                <div style={{ background: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-group">
                    <label>Room Title</label>
                    <input className="input" placeholder="e.g., Python Beginner Challenge" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label>Description</label>
                    <textarea className="input" placeholder="What&apos;s this competition about?" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Room Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { value: '1v1', label: '1v1', emoji: '⚔️' },
                            { value: 'group', label: 'Group', emoji: '👥' },
                            { value: 'free_for_all', label: 'Free for All', emoji: '🏟️' },
                        ].map(t => (
                            <button key={t.value} type="button" onClick={() => { setType(t.value); if (t.value === '1v1') setMaxPlayers(2); }}
                                className="glass-card" style={{
                                    flex: 1, padding: '16px', textAlign: 'center', cursor: 'pointer',
                                    borderColor: type === t.value ? 'var(--accent-blue)' : undefined,
                                    background: type === t.value ? 'var(--accent-blue-glow)' : undefined,
                                }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{t.emoji}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid-2" style={{ gap: '16px' }}>
                    <div className="input-group">
                        <label>💰 Entry Deposit (credits)</label>
                        <input className="input" type="number" min="0" value={entryDeposit} onChange={e => setEntryDeposit(Number(e.target.value))} />
                    </div>
                    {type !== '1v1' && (
                        <div className="input-group">
                            <label>Max Players</label>
                            <input className="input" type="number" min="2" max="50" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Duration</label>
                        <select className="select" value={duration} onChange={e => setDuration(e.target.value)}>
                            <option value="1_week">1 Week</option>
                            <option value="2_weeks">2 Weeks</option>
                            <option value="1_month">1 Month</option>
                            <option value="3_months">3 Months</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Proof Type</label>
                        <select className="select" value={proofType} onChange={e => setProofType(e.target.value)}>
                            <option value="any">Any</option>
                            <option value="photo">Photo Only</option>
                            <option value="link">Link Only</option>
                            <option value="text">Text Only</option>
                        </select>
                    </div>
                </div>

                <div className="glass-card" style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-accent)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Room Summary:</strong> {type} competition, {duration.replace('_', ' ')} duration, {entryDeposit} credits deposit per player.
                        {type === '1v1' ? ' Winner takes all.' : ` Up to ${maxPlayers} players.`}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Creating...' : '🏟️ Create Room'}
                </button>
            </form>
        </div>
    );
}
