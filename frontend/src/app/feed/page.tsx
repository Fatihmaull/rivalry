'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (user) {
            api.getFeed().then(setPosts).catch(console.error).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const handlePost = async () => {
        if (!content.trim()) return;
        setPosting(true);
        try {
            const post = await api.createPost({ type: 'update', content });
            setPosts([post, ...posts]);
            setContent('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="page container" style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>📱 <span className="text-gradient">Feed</span></h1>

            {user && (
                <div className="glass-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div className="avatar">{user.username[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                            <textarea className="input" placeholder="Share your progress, challenge others, or celebrate wins..." value={content} onChange={e => setContent(e.target.value)} rows={3} style={{ resize: 'vertical', marginBottom: '12px' }} />
                            <button onClick={handlePost} className="btn btn-primary btn-sm" disabled={posting || !content.trim()}>
                                {posting ? 'Posting...' : '📤 Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />)}
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📱</div>
                    <div className="empty-state-title">Your feed is empty</div>
                    <div className="empty-state-text">Follow other users or post your first update!</div>
                </div>
            ) : (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {posts.map((post: any) => (
                        <div key={post.id} className="glass-card">
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <div className="avatar">{post.user?.username?.[0]?.toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600 }}>@{post.user?.username}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>{post.type}</span>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginTop: '4px' }}>{post.content}</p>
                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        💬 {post._count?.comments || 0} comments
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
