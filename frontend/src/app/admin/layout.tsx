'use client';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/rooms', label: 'Rooms', icon: '🏆' },
    { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
    { href: '/admin/interests', label: 'Interests', icon: '🎯' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/system', label: 'System', icon: '⚙️' },
    { href: '/admin/audit', label: 'Audit Log', icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h2>Admin Access Required</h2>
                    <p>You need admin privileges to access this page.</p>
                    <Link href="/login" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>Sign in as admin →</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: collapsed ? '64px' : '240px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100,
                overflow: 'hidden',
            }}>
                {/* Logo */}
                <div style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minHeight: '64px',
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    {!collapsed && <span style={{ fontWeight: 700, fontSize: '1.1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</span>}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: collapsed ? '0.75rem' : '0.6rem 0.75rem',
                                borderRadius: '8px',
                                background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.15s ease',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle */}
                <button onClick={() => setCollapsed(!collapsed)} style={{
                    padding: '0.75rem', margin: '0.5rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                    borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: '0.85rem',
                }}>
                    {collapsed ? '→' : '← Collapse'}
                </button>

                {/* User info */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {user.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: collapsed ? '64px' : '240px',
                transition: 'margin-left 0.2s ease',
                padding: '1.5rem 2rem',
                maxWidth: '100%',
                overflow: 'auto',
            }}>
                {children}
            </main>
        </div>
    );
}
