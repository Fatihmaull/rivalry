'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import { toast } from '../../lib/toast';

export default function WalletPage() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<any>(null);
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<string | null>(null);

    useEffect(() => {
        if (user) api.getWallet().then(setWallet).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    const handleTopUp = async () => {
        setAction('topup');
        try {
            const updated = await api.topUp(amount);
            setWallet(updated);
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setAction(null);
        }
    };

    const handleWithdraw = async () => {
        setAction('withdraw');
        try {
            const updated = await api.withdraw(amount);
            setWallet(updated);
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setAction(null);
        }
    };

    if (!user) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ ! ]</div>
                    <div className="empty-state-title">Authentication Required</div>
                    <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Log In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '700px' }}>
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <div className="mono-label" style={{ marginBottom: '8px' }}>FINANCE</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    <span className="text-gradient">Wallet.</span>
                </h1>
            </div>

            {/* ═══ BALANCE CARD ═══ */}
            <div className="card-premium animate-slide-up" style={{ textAlign: 'center', padding: '64px 24px', marginBottom: '32px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.1em' }}>
                    AVAILABLE BALANCE
                </div>
                <div style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '8px' }}>
                    {Number(wallet?.balance || 0).toFixed(0)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>CREDITS</div>
            </div>

            {/* ═══ ACTIONS ═══ */}
            <div className="glass-card" style={{ marginBottom: '48px', padding: '32px' }}>
                <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label style={{ fontFamily: 'var(--font-mono)' }}>OPERATION AMOUNT</label>
                    <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ fontSize: '1.2rem', padding: '16px' }} />
                </div>
                <div className="grid-2">
                    <button onClick={handleTopUp} className="btn btn-primary btn-lg" disabled={!!action}>
                        {action === 'topup' ? 'PROCESSING...' : 'DEPOSIT FUNDING'}
                    </button>
                    <button onClick={handleWithdraw} className="btn btn-secondary btn-lg" disabled={!!action}>
                        {action === 'withdraw' ? 'PROCESSING...' : 'WITHDRAW FUNDS'}
                    </button>
                </div>
            </div>

            {/* ═══ TRANSACTIONS ═══ */}
            <div className="mono-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                TRANSACTION HISTORY
                <span style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />
            ) : wallet?.transactions?.length ? (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {wallet.transactions.map((tx: any) => {
                        const isPositive = Number(tx.amount) > 0;
                        return (
                            <div key={tx.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `2px solid ${isPositive ? 'var(--text-primary)' : 'var(--text-dim)'}` }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <span className="badge badge-default" style={{ fontSize: '0.65rem', border: '1px solid var(--border-subtle)' }}>
                                            {tx.type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tx.description}</span>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 600, color: isPositive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {isPositive ? '+' : ''}{Number(tx.amount).toFixed(0)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
                    <div className="empty-state-text">No transaction ledger entries found.</div>
                </div>
            )}
        </div>
    );
}
