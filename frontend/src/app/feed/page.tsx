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
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <div className="mono-label" style={{ marginBottom: '8px' }}>COMMUNITY</div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Global <span className="text-gradient">Feed.</span>
                </h1>
            </div>

            {user && (
                <div className="card-premium animate-slide-up" style={{ marginBottom: '32px', padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div className="avatar">{user.username[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="input"
                                placeholder="Share your progress or challenge others..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={3}
                                style={{ resize: 'vertical', marginBottom: '16px', background: 'transparent' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={handlePost} className="btn btn-primary" disabled={posting || !content.trim()}>
                                    {posting ? 'INITIALIZING...' : 'PUBLISH UPDATE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)' }} />)}
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state" style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="empty-state-icon" style={{ fontFamily: 'var(--font-mono)' }}>[ / ]</div>
                    <div className="empty-state-title">Signal Lost</div>
                    <div className="empty-state-text">No updates found in the feed. Be the first to post.</div>
                </div>
            ) : (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map((post: any) => (
                        <div key={post.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="avatar">{post.user?.username?.[0]?.toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>@{post.user?.username}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="badge badge-default" style={{ fontSize: '0.65rem', border: '1px solid var(--border-subtle)' }}>
                                            {post.type.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{post.content}</p>
                                    <div style={{ marginTop: '16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                                        [ {post._count?.comments || 0} COMMENTS ]
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
