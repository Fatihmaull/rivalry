'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminInterests() {
    const [interests, setInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#3b82f6' });

    const load = () => {
        setLoading(true);
        api.adminGetInterests().then(setInterests).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        try {
            if (editing) { await api.adminUpdateInterest(editing.id, form); }
            else { await api.adminCreateInterest(form); }
            setShowForm(false); setEditing(null); setForm({ name: '', description: '', icon: '', color: '#3b82f6' }); load();
        } catch (e: any) { alert(e.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this interest?')) return;
        try { await api.adminDeleteInterest(id); load(); } catch (e: any) { alert(e.message); }
    };

    const openEdit = (i: any) => {
        setEditing(i); setForm({ name: i.name, description: i.description || '', icon: i.icon || '', color: i.color || '#3b82f6' }); setShowForm(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Interest Management</h1>
                <button onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '', color: '#3b82f6' }); setShowForm(true); }}
                    style={{ padding: '0.5rem 1rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>+ Add Interest</button>
            </div>

            {showForm && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>{editing ? 'Edit' : 'Create'} Interest</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon (emoji)" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)', gridColumn: '1 / -1' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Color:</label>
                            <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={handleSubmit} style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{editing ? 'Update' : 'Create'}</button>
                        <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading interests...</div>
                ) : interests.map(i => (
                    <div key={i.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{i.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {i.popularityScore || 0}</div>
                                </div>
                            </div>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: i.color }} />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{i.description || 'No description'}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button onClick={() => openEdit(i)} style={{ padding: '3px 10px', fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(i.id)} style={{ padding: '3px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
