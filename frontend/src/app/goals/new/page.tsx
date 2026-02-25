'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

const categories = [
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'learning', label: 'Learning', emoji: '📚' },
    { id: 'career', label: 'Career', emoji: '💼' },
    { id: 'business', label: 'Business', emoji: '🚀' },
    { id: 'finance', label: 'Finance', emoji: '💰' },
    { id: 'content_creation', label: 'Content Creation', emoji: '🎨' },
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
        if (!category) { setError('Please select a category'); return; }
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
        <div className="page container" style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '32px' }}>
                🎯 Set Your <span className="text-gradient">Goal</span>
            </h1>

            {error && (
                <div style={{ background: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', color: 'var(--accent-red)', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Category</label>
                    <div className="grid-3" style={{ gap: '8px' }}>
                        {categories.map(cat => (
                            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                                className="glass-card" style={{
                                    padding: '16px', textAlign: 'center', cursor: 'pointer',
                                    borderColor: category === cat.id ? 'var(--accent-blue)' : undefined,
                                    background: category === cat.id ? 'var(--accent-blue-glow)' : undefined,
                                }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{cat.emoji}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{cat.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <label>Goal Title</label>
                    <input className="input" placeholder="e.g., Learn Python, Run a Marathon" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label>Description (optional)</label>
                    <textarea className="input" placeholder="Describe your goal..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                </div>

                <div className="grid-2" style={{ gap: '16px' }}>
                    <div className="input-group">
                        <label>Goal Type</label>
                        <select className="select" value={goalType} onChange={e => setGoalType(e.target.value)}>
                            <option value="skill">Skill</option>
                            <option value="habit">Habit</option>
                            <option value="project">Project</option>
                            <option value="challenge">Challenge</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Difficulty</label>
                        <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="extreme">Extreme</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Timeline</label>
                    <select className="select" value={timeline} onChange={e => setTimeline(e.target.value)}>
                        <option value="1_week">1 Week</option>
                        <option value="2_weeks">2 Weeks</option>
                        <option value="1_month">1 Month</option>
                        <option value="3_months">3 Months</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Goal'}
                </button>
            </form>
        </div>
    );
}
