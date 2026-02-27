'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminInterests() {
    const [interests, setInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#3b82f6' });

    const getIconSvg = (iconField: string, nameField: string) => {
        const iKey = (iconField || '').toLowerCase().trim();
        const nKey = (nameField || '').toLowerCase().trim();

        const icons: Record<string, React.ReactNode> = {
            research: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
            'sports training': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.9 4.9l14.2 14.2" /><path d="M4.9 19.1L19.1 4.9" /></svg>,
            marketing: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
            design: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12c0-2.6 1-5 2.83-6.88a10 10 0 0 1 7.17-3.12z" /><circle cx="7" cy="10" r="1" /><circle cx="10" cy="6" r="1" /><circle cx="14" cy="6" r="1" /><circle cx="17" cy="10" r="1" /></svg>,
            'language learning': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>,
            fitness: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
            cybersecurity: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
            startup: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
            productivity: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
            'public speaking': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>,
            'skill building': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
            trading: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>,
            programming: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
            'career growth': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
            'reading challenge': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
            writing: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>,
            ai: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
            'mental health': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
            finance: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            entrepreneurship: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>,
            // Default mappings
            gaming: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="4" /><circle cx="16" cy="14" r="1" /><circle cx="18" cy="12" r="1" /><path d="M6 12h4" /><path d="M8 10v4" /></svg>,
            sports: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.9 4.9l14.2 14.2" /><path d="M4.9 19.1L19.1 4.9" /></svg>,
            music: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
            tech: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
            default: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        };

        if (icons[iKey]) return icons[iKey];
        if (icons[nKey]) return icons[nKey];

        return icons.default;
    };

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
                        <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon Name (gaming, sports, tech, etc.)" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)' }} />
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
                                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getIconSvg(i.icon, i.name)}
                                </span>
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
