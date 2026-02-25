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

    // Handle Google OAuth callback token
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
        <div className="glass-card animate-slide-up" style={{ maxWidth: '440px', width: '100%', padding: '40px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>
                Welcome Back
            </h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
                Log in to your Rivalry account
            </p>

            {error && (
                <div style={{
                    background: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)',
                    borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px',
                    color: 'var(--accent-red)', fontSize: '0.875rem',
                }}>
                    {error}
                </div>
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
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <div style={{ position: 'relative', textAlign: 'center', margin: '24px 0' }}>
                <div style={{ borderTop: '1px solid var(--border)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                <span style={{ background: 'var(--bg-card)', padding: '0 12px', position: 'relative', color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
            </div>

            <a
                href={`${apiUrl}/auth/google`}
                className="btn btn-outline btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
            >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.9 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.3 18.8 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.9 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.4-5.1l-6.2-5.2C29 35.7 26.6 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.7 39.3 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" /></svg>
                Continue with Google
            </a>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--accent-blue)' }}>Sign up</Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Suspense fallback={<div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
