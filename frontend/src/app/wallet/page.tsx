'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';

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
            alert(err.message);
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
            alert(err.message);
        } finally {
            setAction(null);
        }
    };

    if (!user) {
        return (
            <div className="page container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <div className="empty-state-title">Please log in</div>
                    <Link href="/login" className="btn btn-primary">Log In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>💰 <span className="text-gradient">Wallet</span></h1>

            {/* Balance Card */}
            <div className="glass-card animate-slide-up" style={{ textAlign: 'center', padding: '40px', marginBottom: '24px', background: 'var(--gradient-card)', borderColor: 'var(--border-accent)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>AVAILABLE BALANCE</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="text-gradient">
                    {wallet?.balance?.toFixed(2) || '0.00'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>credits</div>
            </div>

            {/* Actions */}
            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label>Amount</label>
                    <input className="input" type="number" min="1" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleTopUp} className="btn btn-primary" style={{ flex: 1 }} disabled={!!action}>
                        {action === 'topup' ? 'Processing...' : '⬆️ Top Up'}
                    </button>
                    <button onClick={handleWithdraw} className="btn btn-outline" style={{ flex: 1 }} disabled={!!action}>
                        {action === 'withdraw' ? 'Processing...' : '⬇️ Withdraw'}
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Transaction History</h2>
            {wallet?.transactions?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {wallet.transactions.map((tx: any) => (
                        <div key={tx.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <span className={`badge badge-${tx.amount > 0 ? 'green' : 'red'}`} style={{ marginRight: '8px' }}>
                                    {tx.type}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tx.description}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state"><div className="empty-state-text">No transactions yet</div></div>
            )}
        </div>
    );
}
