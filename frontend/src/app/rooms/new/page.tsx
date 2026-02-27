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
        <div className="page container" style={{ maxWidth: '640px' }}>
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <div className="mono-label" style={{ marginBottom: '12px' }}>NEW COMPETITION</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Create <span className="text-gradient">Arena.</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>
                    Design a competition, set the rules, and invite rivals to join.
                </p>
            </div>

            {error && (
                <div className="alert-error animate-slide-up" style={{ marginBottom: '32px' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                        1 // CORE DETAILS
                    </div>

                    <div className="input-group">
                        <label>Competition Title</label>
                        <input className="input" placeholder="e.g. 100 Days of Code Sprint" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label>Objective Description</label>
                        <textarea className="input" placeholder="Describe the specific goal you are trying to achieve..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                        2 // GAME MECHANICS
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Arena Format</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {[
                                { value: '1v1', label: '1v1 Duel', icon: '◈' },
                                { value: 'group', label: 'Group Battle', icon: '▣' },
                                { value: 'free_for_all', label: 'Free For All', icon: '◎' },
                            ].map(t => (
                                <button key={t.value} type="button" onClick={() => { setType(t.value); if (t.value === '1v1') setMaxPlayers(2); }}
                                    className="glass-card" style={{
                                        flex: 1, padding: '20px 12px', textAlign: 'center', cursor: 'pointer',
                                        borderColor: type === t.value ? 'var(--text-primary)' : 'var(--border-subtle)',
                                        background: type === t.value ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        transition: 'all var(--transition-fast)'
                                    }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', marginBottom: '12px', color: type === t.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t.icon}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: type === t.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid-2" style={{ gap: '24px' }}>
                        <div className="input-group">
                            <label>Entry Deposit (Credits)</label>
                            <input className="input" type="number" min="0" value={entryDeposit} onChange={e => setEntryDeposit(Number(e.target.value))} />
                        </div>
                        {type !== '1v1' ? (
                            <div className="input-group">
                                <label>Max Competitors</label>
                                <input className="input" type="number" min="2" max="50" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
                            </div>
                        ) : <div />}
                    </div>

                    <div className="grid-2" style={{ gap: '24px' }}>
                        <div className="input-group">
                            <label>Timeline</label>
                            <select className="select" value={duration} onChange={e => setDuration(e.target.value)}>
                                <option value="1_week">1 Week</option>
                                <option value="2_weeks">2 Weeks</option>
                                <option value="1_month">1 Month</option>
                                <option value="3_months">3 Months</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Proof Verification</label>
                            <select className="select" value={proofType} onChange={e => setProofType(e.target.value)}>
                                <option value="any">Any Proof type</option>
                                <option value="photo">Photo Evidence</option>
                                <option value="link">Public URL Link</option>
                                <option value="text">Text Description</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card-premium" style={{ marginBottom: '32px', padding: '24px' }}>
                    <div className="mono-label" style={{ marginBottom: '8px' }}>SUMMARY</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        You are creating a <strong style={{ color: 'var(--text-primary)' }}>{type.replace('_', ' ')}</strong> arena lasting <strong style={{ color: 'var(--text-primary)' }}>{duration.replace('_', ' ')}</strong>.
                        Each participant must deposit <strong style={{ color: 'var(--text-primary)' }}>{entryDeposit} credits</strong> to enter.
                        {type === '1v1' ? ' Winner takes all.' : ` Up to ${maxPlayers} players can join.`}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ padding: '16px', fontSize: '1.05rem' }}>
                    {loading ? 'Initializing Arena...' : 'Launch Competition'}
                </button>
            </form>
        </div>
    );
}
