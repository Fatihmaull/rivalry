'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

const categories = [
    { id: 'fitness', label: 'FITNESS', icon: '◈' },
    { id: 'learning', label: 'LEARNING', icon: '▣' },
    { id: 'career', label: 'CAREER', icon: '◎' },
    { id: 'business', label: 'BUSINESS', icon: '◇' },
    { id: 'finance', label: 'FINANCE', icon: '◆' },
    { id: 'content_creation', label: 'CONTENT', icon: '◉' },
];

export default function NewGoalPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goalType, setGoalType] = useState('skill');
    const [difficulty, setDifficulty] = useState('medium');
    const [timeline, setTimeline] = useState('1_month');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return <div className="page container">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) { setError('Please select a category area'); return; }
        setLoading(true);
        setError('');
        try {
            await api.createGoal({ category, title, description, goalType, difficulty, timeline });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page container" style={{ maxWidth: '640px' }}>
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <div className="mono-label" style={{ marginBottom: '12px' }}>NEW DIRECTIVE</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Declare Your <span className="text-gradient">Goal.</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>
                    Define your objective. This is the first step before launching into an arena.
                </p>
            </div>

            {error && (
                <div className="alert-error animate-slide-up" style={{ marginBottom: '32px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <div style={{ display: 'block', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        AREA OF FOCUS
                    </div>

                    <div className="grid-3" style={{ gap: '12px' }}>
                        {categories.map(cat => (
                            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                                className="glass-card" style={{
                                    padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                                    borderColor: category === cat.id ? 'var(--text-primary)' : 'var(--border-subtle)',
                                    background: category === cat.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                                    transition: 'all var(--transition-fast)'
                                }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', marginBottom: '16px', color: category === cat.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {cat.icon}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', color: category === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {cat.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-premium" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="input-group">
                        <label>Directive Title</label>
                        <input className="input" placeholder="e.g. Master React in 30 Days" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label>Context / Description</label>
                        <textarea className="input" placeholder="Provide additional details or constraints..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                    </div>

                    <div className="grid-2" style={{ gap: '20px' }}>
                        <div className="input-group">
                            <label>Classification</label>
                            <select className="select" value={goalType} onChange={e => setGoalType(e.target.value)}>
                                <option value="skill">Skill Acquisition</option>
                                <option value="habit">Habit Formation</option>
                                <option value="project">Project Execution</option>
                                <option value="challenge">Endurance Challenge</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Difficulty Tier</label>
                            <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                <option value="easy">Routine</option>
                                <option value="medium">Challenging</option>
                                <option value="hard">Difficult</option>
                                <option value="extreme">Extreme</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Target Timeline</label>
                        <select className="select" value={timeline} onChange={e => setTimeline(e.target.value)}>
                            <option value="1_week">1 Week (Sprint)</option>
                            <option value="2_weeks">2 Weeks</option>
                            <option value="1_month">1 Month</option>
                            <option value="3_months">1 Quarter</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ padding: '16px' }}>
                    {loading ? 'INITIALIZING...' : 'COMMIT TO GOAL'}
                </button>
            </form>
        </div>
    );
}
