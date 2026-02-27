'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminSystem() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');

    useEffect(() => {
        api.adminGetSystemSettings().then(setSettings).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleUpdate = async (key: string, value: string) => {
        setSaving(key);
        try { await api.adminUpdateSetting(key, value); } catch (e: any) { alert(e.message); }
        setSaving('');
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const icons: Record<string, React.ReactNode> = {
        money: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>,
        bill: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>,
        bank: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>,
        wrench: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
        zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4z" /></svg>,
    };

    const settingsConfig: Record<string, { label: string; description: string; type: 'text' | 'toggle' | 'number'; icon: React.ReactNode; danger?: boolean }> = {
        platform_fee_percent: { label: 'Platform Fee (%)', description: 'Percentage fee charged on prize pool distributions', type: 'number', icon: icons.money },
        min_entry_fee: { label: 'Minimum Entry Fee ($)', description: 'Minimum deposit required to enter competitions', type: 'number', icon: icons.bill },
        max_deposit: { label: 'Maximum Deposit ($)', description: 'Maximum single deposit amount allowed', type: 'number', icon: icons.bank },
        maintenance_mode: { label: 'Maintenance Mode', description: 'Enable to show maintenance page to all users', type: 'toggle', icon: icons.wrench, danger: true },
        platform_active: { label: 'Platform Active', description: 'Master switch — disabling will prevent all activity', type: 'toggle', icon: icons.zap, danger: true },
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading system settings...</div>;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>System Controls</h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSuperAdmin ? (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg> Full access — Super Admin mode</>
                    ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Read-only — Super Admin required for changes</>
                    )}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {settings.map(s => {
                    const config = settingsConfig[s.key] || { label: s.key, description: '', type: 'text', icon: icons.wrench };
                    const isToggle = config.type === 'toggle';
                    const isBoolOn = s.value === 'true';

                    return (
                        <div key={s.key} style={{
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${config.danger && isBoolOn && s.key === 'maintenance_mode' ? 'rgba(239,68,68,0.4)' : 'var(--border-primary)'}`,
                            borderRadius: '12px', padding: '1.25rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                                <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{config.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{config.description}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'flex-end' }}>
                                {isToggle ? (
                                    <button
                                        onClick={() => isSuperAdmin && handleUpdate(s.key, isBoolOn ? 'false' : 'true')}
                                        disabled={!isSuperAdmin || saving === s.key}
                                        style={{
                                            padding: '0.4rem 1.25rem', borderRadius: '20px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                                            background: isBoolOn ? (config.danger ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)') : 'var(--bg-tertiary)',
                                            color: isBoolOn ? (config.danger ? '#ef4444' : '#22c55e') : 'var(--text-muted)',
                                        }}
                                    >
                                        {saving === s.key ? '...' : isBoolOn ? 'ON' : 'OFF'}
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="number" value={s.value}
                                            onChange={e => setSettings(prev => prev.map(p => p.key === s.key ? { ...p, value: e.target.value } : p))}
                                            disabled={!isSuperAdmin}
                                            style={{ width: '80px', padding: '0.4rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--text-primary)', textAlign: 'center' }}
                                        />
                                        <button
                                            onClick={() => handleUpdate(s.key, s.value)}
                                            disabled={!isSuperAdmin || saving === s.key}
                                            style={{ padding: '0.4rem 0.75rem', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: '#fff', cursor: isSuperAdmin ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600 }}
                                        >
                                            {saving === s.key ? '...' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
