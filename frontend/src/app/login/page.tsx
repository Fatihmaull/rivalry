'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function LoginForm() {
    const { login, refreshUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            api.setToken(token);
            refreshUser().then(() => router.push('/dashboard'));
        }
    }, [searchParams, refreshUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.user.role === 'admin' || res.user.role === 'super_admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    return (
        <div className="glass-card animate-slide-up" style={{ maxWidth: '420px', width: '100%', padding: '48px 40px' }}>
            <div className="mono-label" style={{ marginBottom: '24px', textAlign: 'center', justifyContent: 'center' }}>
                SIGN IN
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.03em' }}>
                Welcome back
            </h1>
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '36px', fontSize: '0.9rem' }}>
                Log in to your Rivalry account
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
                    <label>Password</label>
                    <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '4px' }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ position: 'relative', textAlign: 'center', margin: '28px 0' }}>
                <div style={{ borderTop: '1px solid var(--border-subtle)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                <span style={{ background: 'var(--bg-card)', padding: '0 16px', position: 'relative', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>OR</span>
            </div>

            <a
                href={`${apiUrl}/auth/google`}
                className="btn btn-secondary btn-full"
                style={{ textDecoration: 'none' }}
            >
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#999" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.9 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" /></svg>
                Continue with Google
            </a>

            <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)' }}>Sign up</Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Suspense fallback={<div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
