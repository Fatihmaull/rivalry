'use client';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Overview', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
    { href: '/admin/users', label: 'Users', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { href: '/admin/rooms', label: 'Rooms', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg> },
    { href: '/admin/transactions', label: 'Transactions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg> },
    { href: '/admin/interests', label: 'Interests', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> },
    { href: '/admin/analytics', label: 'Analytics', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg> },
    { href: '/admin/system', label: 'System', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg> },
    { href: '/admin/audit', label: 'Audit Log', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
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
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--text-primary)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
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
                    color: 'var(--primary)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
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
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
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
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.15s ease',
                }}>
                    {collapsed ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            <span>Collapse</span>
                        </>
                    )}
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
