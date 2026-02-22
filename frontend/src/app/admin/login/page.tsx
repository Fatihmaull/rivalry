'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLoginPage() {
    const { login, logout } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.user.role === 'admin' || res.user.role === 'super_admin') {
                router.push('/admin');
            } else {
                logout();
                setError('Access denied. Admin privileges required.');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };


    return (
        <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0b' }}>
            <div className="glass-card animate-slide-up" style={{ maxWidth: '440px', width: '100%', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#fff' }}>
                        Admin Portal
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Secure access for Rivalry administrators
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                        borderRadius: '8px', padding: '12px', marginBottom: '20px',
                        color: '#ef4444', fontSize: '0.875rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Admin Email</label>
                        <input
                            style={{ padding: '12px', background: '#161618', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                            type="email"
                            placeholder="admin@rivalry.app"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            style={{ padding: '12px', background: '#161618', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        ← Back to User Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
