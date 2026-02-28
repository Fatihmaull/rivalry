'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <Link href="/" className="nav-logo">
                        Rivalry
                    </Link>
                    <div className="nav-links">
                        {user ? (
                            <>
                                <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>
                                    Dashboard
                                </Link>
                                <Link href="/rooms" className={`nav-link ${pathname.startsWith('/rooms') ? 'active' : ''}`}>
                                    Rooms
                                </Link>
                                <Link href="/matchmaking" className={`nav-link ${pathname === '/matchmaking' ? 'active' : ''}`}>
                                    Rivals
                                </Link>
                                <Link href="/feed" className={`nav-link ${pathname === '/feed' ? 'active' : ''}`}>
                                    Feed
                                </Link>
                                <Link href="/wallet" className={`nav-link ${pathname === '/wallet' ? 'active' : ''}`}>
                                    Wallet
                                </Link>
                                {user.role === 'super_admin' && (
                                    <Link href="/admin/dashboard" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                        Admin
                                    </Link>
                                )}
                                <Link href={`/profile/${user.id}`} className="avatar avatar-sm" title={user.username}>
                                    {user.username[0].toUpperCase()}
                                </Link>
                                <button onClick={logout} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="nav-link">Log In</Link>
                                <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            {user && (
                <div className="bottom-nav">
                    <Link href="/dashboard" className={`bottom-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
                        <span className="nav-icon">◉</span>
                        Home
                    </Link>
                    <Link href="/rooms" className={`bottom-nav-item ${pathname.startsWith('/rooms') ? 'active' : ''}`}>
                        <span className="nav-icon">◈</span>
                        Rooms
                    </Link>
                    <Link href="/matchmaking" className={`bottom-nav-item ${pathname === '/matchmaking' ? 'active' : ''}`}>
                        <span className="nav-icon">⚡</span>
                        Rivals
                    </Link>
                    <Link href="/feed" className={`bottom-nav-item ${pathname === '/feed' ? 'active' : ''}`}>
                        <span className="nav-icon">◎</span>
                        Feed
                    </Link>
                    <Link href={`/profile/${user.id}`} className={`bottom-nav-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
                        <span className="nav-icon">◆</span>
                        Profile
                    </Link>
                    {user.role === 'super_admin' && (
                        <Link href="/admin/dashboard" className={`bottom-nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}>
                            <span className="nav-icon" style={{ color: 'var(--accent)' }}>⚙</span>
                            Admin
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
