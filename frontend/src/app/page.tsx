'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

export default function Home() {
  const { user } = useAuth();
  const revealRefs = useRef<HTMLElement[]>([]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="grain">
      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-text animate-slide-up">
            <div className="hero-badge">
              COMPETITIVE GOAL PLATFORM
            </div>

            <h1 className="hero-title">
              <span>Compete.</span>
              <span>Improve.</span>
              <span>Win.</span>
            </h1>

            <p className="hero-subtitle">
              Get matched with rivals pursuing the same goals. Put skin in the game.
              Follow structured roadmaps. Submit proof. Claim victory.
            </p>

            <div className="hero-actions">
              {user ? (
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="btn btn-primary btn-lg">
                    Start Competing
                  </Link>
                  <Link href="/login" className="btn btn-secondary btn-lg">
                    Explore Challenges
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Floating UI Preview Cards */}
          <div className="hero-visual" style={{ animationDelay: '0.3s' }}>
            {/* Prize Pool Card */}
            <div className="float-card float-card-1">
              <div className="float-card-title">Prize Pool</div>
              <div className="float-card-value">2,450</div>
              <div className="float-card-sub">credits · 1v1 competition</div>
              <div className="float-card-bar">
                <div className="float-card-bar-fill" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="float-card float-card-2">
              <div className="float-card-title">Live Leaderboard</div>
              {[
                { rank: '01', name: 'alex_dev', score: '94%' },
                { rank: '02', name: 'rival_mk', score: '87%' },
                { rank: '03', name: 'code_fury', score: '81%' },
              ].map((row) => (
                <div key={row.rank} className="float-card-row">
                  <span className="float-card-rank">{row.rank}</span>
                  <span className="float-card-dot" />
                  <span className="float-card-name">{row.name}</span>
                  <span className="float-card-score">{row.score}</span>
                </div>
              ))}
            </div>

            {/* Active Challenge Card */}
            <div className="float-card float-card-3">
              <div className="float-card-title">Active Challenge</div>
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  Learn Python in 30 Days
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Week 3 of 4 · 6 milestones
                </div>
              </div>
              <div className="float-card-bar" style={{ marginTop: '12px' }}>
                <div className="float-card-bar-fill" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION DIVIDER ═══ */}
      <div className="section-divider" />

      {/* ═══ PRODUCT CONCEPT ═══ */}
      <section className="landing-section">
        <div className="container">
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '96px', alignItems: 'center' }}>
            <div>
              <div className="section-label">THE CONCEPT</div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '24px', lineHeight: 1.05 }}>
                Goals become competitions.{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  Accountability becomes a game.
                </span>
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem', maxWidth: '460px' }}>
                Rivalry matches you with people chasing the same objectives.
                You deposit credits, follow an AI-generated roadmap, submit proof
                of each milestone, and compete to finish first. The winner takes the prize pool.
              </p>
              <div style={{ marginTop: '32px', display: 'flex', gap: '32px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>1v1</div>
                  <div className="mono-label">Head to Head</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Group</div>
                  <div className="mono-label">Team Battles</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>FFA</div>
                  <div className="mono-label">Free For All</div>
                </div>
              </div>
            </div>

            {/* Concept Visual - Floating Room Preview */}
            <div style={{ position: 'relative' }}>
              <div className="card-premium" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div className="mono-label" style={{ marginBottom: '4px' }}>COMPETITION ROOM</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Python Beginner Challenge</div>
                  </div>
                  <div className="badge badge-green">ACTIVE</div>
                </div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>500</div>
                    <div className="mono-label">Prize Pool</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>2/2</div>
                    <div className="mono-label">Players</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>4w</div>
                    <div className="mono-label">Duration</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '62%' }} />
                </div>
                <div style={{ marginTop: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>62% COMPLETE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION DIVIDER ═══ */}
      <div className="section-divider" />

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="landing-section-alt">
        <div className="container">
          <div className="reveal">
            <div className="section-label">HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '64px', maxWidth: '500px' }}>
              Four steps to your next victory.
            </h2>
          </div>

          <div className="steps-grid reveal">
            {[
              { num: '01', icon: '◎', title: 'Set Your Goal', desc: 'Choose a category, define your objective, and set the difficulty level.' },
              { num: '02', icon: '⥯', title: 'Find Your Rival', desc: 'Get matched with competitors pursuing the same goal at your skill level.' },
              { num: '03', icon: '◈', title: 'Follow the Roadmap', desc: 'AI generates a structured milestone plan. Submit proof at each checkpoint.' },
              { num: '04', icon: '◆', title: 'Claim Victory', desc: 'Complete milestones first. Win the prize pool. Build your reputation.' },
            ].map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-number">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM PREVIEW ═══ */}
      <section className="landing-section">
        <div className="container">
          <div className="reveal">
            <div className="section-label">PLATFORM PREVIEW</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '64px', maxWidth: '600px' }}>
              Built for serious competitors.{' '}
              <span style={{ color: 'var(--text-dim)' }}>Every detail designed for performance.</span>
            </h2>
          </div>

          <div className="preview-container reveal">
            {/* Competition Room Panel */}
            <div className="preview-panel" style={{ width: '380px', transform: 'rotate(-2deg)' }}>
              <div className="preview-panel-header">
                <div className="preview-panel-title">Competition Rooms</div>
                <div className="preview-panel-badge">LIVE</div>
              </div>
              {[
                { title: 'ML Bootcamp Challenge', players: '4/6', pool: '2,000' },
                { title: 'Fitness 30-Day Sprint', players: '2/2', pool: '500' },
                { title: 'Content Creator Race', players: '3/8', pool: '1,200' },
              ].map((room, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: '4px' }}>{room.title}</div>
                  <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    <span>◉ {room.players}</span>
                    <span>◆ {room.pool} credits</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Panel */}
            <div className="preview-panel" style={{ width: '320px', marginTop: '20px', transform: 'rotate(1deg)' }}>
              <div className="preview-panel-header">
                <div className="preview-panel-title">Leaderboard</div>
                <div className="preview-panel-badge">SEASON 1</div>
              </div>
              {[
                { rank: '#1', name: 'nightcoder', wins: 12, rate: '92%' },
                { rank: '#2', name: 'alex_grind', wins: 10, rate: '88%' },
                { rank: '#3', name: 'sarah_dev', wins: 9, rate: '85%' },
                { rank: '#4', name: 'mk_hustle', wins: 7, rate: '78%' },
              ].map((user, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: i === 0 ? 'var(--text-primary)' : 'var(--text-dim)', width: '24px' }}>{user.rank}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: i === 0 ? 600 : 400 }}>{user.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{user.wins}W · {user.rate}</span>
                </div>
              ))}
            </div>

            {/* Roadmap Panel */}
            <div className="preview-panel" style={{ width: '300px', transform: 'rotate(1.5deg)' }}>
              <div className="preview-panel-header">
                <div className="preview-panel-title">Roadmap Progress</div>
              </div>
              {[
                { week: 'Week 1', title: 'Python Basics', done: true },
                { week: 'Week 2', title: 'Data Structures', done: true },
                { week: 'Week 3', title: 'OOP Concepts', done: false },
                { week: 'Week 4', title: 'Final Project', done: false },
              ].map((milestone, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: milestone.done ? 'none' : '1px solid var(--border-light)',
                    background: milestone.done ? 'rgba(255,255,255,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', flexShrink: 0,
                  }}>
                    {milestone.done && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>{milestone.week}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: milestone.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{milestone.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION DIVIDER ═══ */}
      <div className="section-divider" />

      {/* ═══ COMPETITION ARENAS ═══ */}
      <section className="landing-section-alt">
        <div className="container">
          <div className="reveal">
            <div className="section-label">ARENAS</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '48px', maxWidth: '400px' }}>
              Choose your field.
            </h2>
          </div>

          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { name: 'Fitness', desc: 'Strength, endurance, and discipline challenges', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' },
              { name: 'Learning', desc: 'Master new skills and technologies', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
              { name: 'Career', desc: 'Professional growth and milestones', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80' },
              { name: 'Business', desc: 'Launch, build, and scale ventures', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
              { name: 'Finance', desc: 'Savings goals and investment targets', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80' },
              { name: 'Content', desc: 'Creative output and audience growth', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
            ].map((arena) => (
              <div key={arena.name} className="glass-card arena-card">
                <div
                  className="arena-bg"
                  style={{ backgroundImage: `url(${arena.img})` }}
                />
                <div className="arena-title">{arena.name}</div>
                <div className="arena-desc">{arena.desc}</div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '32px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ... and many more incoming
          </div>
        </div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="landing-section">
        <div className="container">
          <div className="reveal">
            <div className="section-label">IN NUMBERS</div>
          </div>
          <div className="metrics-grid reveal">
            {[
              { value: '120K+', label: 'Challenges Created' },
              { value: '45K', label: 'Active Competitors' },
              { value: '78%', label: 'Completion Rate' },
              { value: '$2.4M', label: 'Prizes Distributed' },
            ].map((metric) => (
              <div key={metric.label} className="metric-item">
                <div className="metric-value-wrapper">
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-hover-title">{metric.label}</div>
                </div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '48px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ... and still counting
          </div>
        </div>
      </section>

      {/* ═══ SECTION DIVIDER ═══ */}
      <div className="section-divider" />

      {/* ═══ FINAL CTA ═══ */}
      <section className="cta-section">
        <div className="container reveal">
          <div className="mono-label" style={{ marginBottom: '24px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--text-dim)' }} />
            READY TO COMPETE
            <span style={{ width: '24px', height: '1px', background: 'var(--text-dim)' }} />
          </div>
          <h2 className="cta-title">
            Turn your goals into<br />a competition.
          </h2>
          <p className="cta-subtitle">
            Join the platform where accountability meets competition.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {!user ? (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
