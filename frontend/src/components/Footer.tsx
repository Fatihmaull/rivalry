import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">Rivalry</div>
                        <p className="footer-desc">
                            The competitive goal achievement platform.
                            Turn your ambitions into competitions and prove yourself.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <div className="footer-heading">Platform</div>
                        <div className="footer-links">
                            <Link href="/rooms" className="footer-link">Rooms</Link>
                            <Link href="/matchmaking" className="footer-link">Find Rivals</Link>
                            <Link href="/feed" className="footer-link">Feed</Link>
                            <Link href="/goals/new" className="footer-link">Set Goals</Link>
                        </div>
                    </div>

                    {/* Account */}
                    <div>
                        <div className="footer-heading">Account</div>
                        <div className="footer-links">
                            <Link href="/dashboard" className="footer-link">Dashboard</Link>
                            <Link href="/wallet" className="footer-link">Wallet</Link>
                            <Link href="/signup" className="footer-link">Sign Up</Link>
                            <Link href="/login" className="footer-link">Log In</Link>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <div className="footer-heading">Resources</div>
                        <div className="footer-links">
                            <span className="footer-link">Documentation</span>
                            <span className="footer-link">API</span>
                            <span className="footer-link">Support</span>
                            <span className="footer-link">Community</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} Rivalry. All rights reserved.
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <span className="footer-link" style={{ fontSize: '0.75rem' }}>Terms</span>
                        <span className="footer-link" style={{ fontSize: '0.75rem' }}>Privacy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
