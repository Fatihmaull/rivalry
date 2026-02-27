'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(email, username, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    // Password strength
    const getStrength = () => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 6) s++;
        if (password.length >= 10) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    };

    const strength = getStrength();
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

    return (
        <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card animate-slide-up" style={{ maxWidth: '420px', width: '100%', padding: '48px 40px' }}>
                <div className="mono-label" style={{ marginBottom: '24px', textAlign: 'center', justifyContent: 'center' }}>
                    CREATE ACCOUNT
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.03em' }}>
                    Join Rivalry
                </h1>
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '36px', fontSize: '0.9rem' }}>
                    Create your account and start competing
                </p>

                {error && (
                    <div className="alert-error">{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Username</label>
                        <input className="input" type="text" placeholder="your_handle" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        {password && (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} style={{
                                            height: '2px',
                                            flex: 1,
                                            borderRadius: '1px',
                                            background: i <= strength ? 'rgba(255,255,255,' + (0.2 + strength * 0.15) + ')' : 'rgba(255,255,255,0.06)',
                                            transition: 'background 0.3s',
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                                    {strengthLabels[strength]}
                                </span>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '4px' }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
