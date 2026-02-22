'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero Background Glow */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero Section */}
      <section className="container" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '60px', position: 'relative' }}>
        <div className="animate-slide-up">
          <span className="badge badge-blue" style={{ marginBottom: '24px', display: 'inline-flex' }}>
            🔥 Turn Goals Into Competitions
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
            Compete. Stay<br />
            <span className="text-gradient">Accountable.</span><br />
            Win.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Get matched with rivals pursuing similar goals. Put skin in the game.
            Follow structured roadmaps. Submit proof. Win prizes.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start Competing →
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container" style={{ paddingBottom: '60px' }}>
        <div className="grid-3 stagger" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">85%</div>
            <div className="stat-label">Higher Goal Completion</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>3x</div>
            <div className="stat-label">More Consistent</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>$$$</div>
            <div className="stat-label">Real Stakes</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '48px' }}>
          How It <span className="text-gradient">Works</span>
        </h2>
        <div className="grid-4 stagger">
          {[
            { step: '01', emoji: '🎯', title: 'Set Your Goal', desc: 'Choose a category, set your difficulty and timeline' },
            { step: '02', emoji: '⚔️', title: 'Find a Rival', desc: 'Get matched with someone pursuing the same goal' },
            { step: '03', emoji: '💰', title: 'Put Skin In The Game', desc: 'Deposit credits to join the competition room' },
            { step: '04', emoji: '🏆', title: 'Win The Prize', desc: 'Complete milestones first and claim the prize pool' },
          ].map((item) => (
            <div key={item.step} className="glass-card glass-card-glow" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{item.emoji}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>
                STEP {item.step}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '48px' }}>
          Choose Your <span className="text-gradient">Arena</span>
        </h2>
        <div className="grid-3 stagger">
          {[
            { emoji: '💪', name: 'Fitness', color: '#FF6B6B' },
            { emoji: '📚', name: 'Learning', color: '#4ECDC4' },
            { emoji: '💼', name: 'Career', color: '#45B7D1' },
            { emoji: '🚀', name: 'Business', color: '#96CEB4' },
            { emoji: '💰', name: 'Finance', color: '#FFD93D' },
            { emoji: '🎨', name: 'Content Creation', color: '#DDA0DD' },
          ].map((cat) => (
            <div key={cat.name} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
              borderLeft: `3px solid ${cat.color}`,
            }}>
              <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
              <span style={{ fontWeight: 600 }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingBottom: '100px', textAlign: 'center' }}>
        <div className="glass-card" style={{
          padding: '60px 32px',
          background: 'var(--gradient-card)',
          borderColor: 'var(--border-accent)',
          maxWidth: '700px', margin: '0 auto',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
            Ready to Prove Yourself?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
            Join thousands of people who are crushing their goals through the power of rivalry.
          </p>
          {!user && (
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create Free Account →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
