const fs = require('fs');

// Patch Feed Page
let feedPage = fs.readFileSync('src/app/feed/page.tsx', 'utf8');
feedPage = feedPage.replace(
    /useEffect\(\(\) => \{\r?\n\s+if \(user\) \{\r?\n\s+api\.getFeed\(\)\.then\(setPosts\)\.catch\(console\.error\)\.finally\(\(\) => setLoading\(false\)\);\r?\n\s+\} else \{\r?\n\s+setLoading\(false\);\r?\n\s+\}\r?\n\s+\}, \[user\]\);/g,
    `useEffect(() => {
        const fetchFeed = () => {
            if (user) {
                api.getFeed().then(setPosts).catch(console.error).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        };
        fetchFeed();
        const interval = setInterval(fetchFeed, 10000);
        return () => clearInterval(interval);
    }, [user]);`
);
feedPage = feedPage.replace(
    /<p style=\{\{ fontSize: '0\.95rem', lineHeight: 1\.6, color: 'var\(--text-secondary\)' \}\}>\{post\.content\}<\/p>/g,
    `<p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{post.content}</p>
                                    
                                    {post.imageUrl && (
                                        <div style={{ marginTop: '16px' }}>
                                            <img src={post.imageUrl} alt="Post media" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                                        </div>
                                    )}`
);
feedPage = feedPage.replace(
    /<div style=\{\{ marginTop: '16px', fontSize: '0\.75rem', fontFamily: 'var\(--font-mono\)', color: 'var\(--text-dim\)', borderTop: '1px solid var\(--border-subtle\)', paddingTop: '12px' \}\}>/g,
    `<div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
                                            <button 
                                                className={\`btn-ghost \${post.userVote === 1 ? 'text-primary' : ''}\`}
                                                style={{ padding: '4px', color: post.userVote === 1 ? '#10b981' : 'var(--text-muted)' }}
                                                onClick={async () => {
                                                    const newVote = post.userVote === 1 ? 0 : 1;
                                                    const res = await api.votePost(post.id, newVote);
                                                    setPosts(posts.map(p => p.id === post.id ? { ...p, score: res.score, userVote: res.userVote } : p));
                                                }}
                                            >▲</button>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: '20px', textAlign: 'center', color: post.score > 0 ? '#10b981' : post.score < 0 ? '#ef4444' : 'var(--text-primary)' }}>
                                                {post.score || 0}
                                            </span>
                                            <button 
                                                className={\`btn-ghost \${post.userVote === -1 ? 'text-primary' : ''}\`}
                                                style={{ padding: '4px', color: post.userVote === -1 ? '#ef4444' : 'var(--text-muted)' }}
                                                onClick={async () => {
                                                    const newVote = post.userVote === -1 ? 0 : -1;
                                                    const res = await api.votePost(post.id, newVote);
                                                    setPosts(posts.map(p => p.id === post.id ? { ...p, score: res.score, userVote: res.userVote } : p));
                                                }}
                                            >▼</button>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>`
);
fs.writeFileSync('src/app/feed/page.tsx', feedPage);


// Patch Room Detail Page
let roomPage = fs.readFileSync('src/app/rooms/[id]/page.tsx', 'utf8');
roomPage = roomPage.replace(
    /useEffect\(\(\) => \{\r?\n\s+if \(id\) api\.getRoom\(id as string\)\.then\(setRoom\)\.catch\(console\.error\)\.finally\(\(\) => setLoading\(false\)\);\r?\n\s+\}, \[id\]\);/g,
    `useEffect(() => {
        if (!id) return;
        const fetchRoom = () => api.getRoom(id as string).then(setRoom).catch(console.error);
        fetchRoom().finally(() => setLoading(false));
        const interval = setInterval(fetchRoom, 5000);
        return () => clearInterval(interval);
    }, [id]);`
);
roomPage = roomPage.replace(
    /\{item\.content\}\r?\n\s+<\/div>\r?\n\s+<div style=\{\{ fontFamily: 'var\(--font-mono\)', fontSize: '0\.65rem', color: 'var\(--text-dim\)' \}\}>/g,
    `{item.content}
                                </div>
                                {item.mediaUrl && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <img src={item.mediaUrl} alt="Proof Media" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                                    </div>
                                )}
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>`
);
fs.writeFileSync('src/app/rooms/[id]/page.tsx', roomPage);
console.log('Patch complete.');
