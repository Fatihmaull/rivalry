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

    const settingsConfig: Record<string, { label: string; description: string; type: 'text' | 'toggle' | 'number'; icon: string; danger?: boolean }> = {
        platform_fee_percent: { label: 'Platform Fee (%)', description: 'Percentage fee charged on prize pool distributions', type: 'number', icon: '💰' },
        min_entry_fee: { label: 'Minimum Entry Fee ($)', description: 'Minimum deposit required to enter competitions', type: 'number', icon: '💵' },
        max_deposit: { label: 'Maximum Deposit ($)', description: 'Maximum single deposit amount allowed', type: 'number', icon: '🏦' },
        maintenance_mode: { label: 'Maintenance Mode', description: 'Enable to show maintenance page to all users', type: 'toggle', icon: '🔧', danger: true },
        platform_active: { label: 'Platform Active', description: 'Master switch — disabling will prevent all activity', type: 'toggle', icon: '⚡', danger: true },
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading system settings...</div>;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>System Controls</h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                    {isSuperAdmin ? '🔓 Full access — Super Admin mode' : '🔒 Read-only — Super Admin required for changes'}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {settings.map(s => {
                    const config = settingsConfig[s.key] || { label: s.key, description: '', type: 'text', icon: '⚙️' };
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
