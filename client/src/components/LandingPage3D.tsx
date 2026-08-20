import React, { useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPage3DProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage3D: React.FC<LandingPage3DProps> = ({ onLogin, onSignup }) => {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // Scroll-reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="fe-landing">
      {/* ── NAV ── */}
      <nav className="fe-nav">
        <div className="fe-wrap fe-nav-inner">
          <div className="fe-logo">
            <span className="fe-logo-mark" />
            FORM&nbsp;ENCLAVE
          </div>
          <div className="fe-nav-links">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing</a>
            <a href="#integrations">Integrations</a>
            <a href="#resources">Resources</a>
          </div>
          <div className="fe-nav-right">
            <ThemeToggle size="sm" className="fe-theme-toggle" />
            <button className="fe-link-inline" onClick={onLogin}>Log in</button>
            <button className="fe-btn fe-btn-primary" onClick={onSignup}>Start Building — Free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="fe-hero fe-wrap">
        <div className="fe-hero-grid">
          <div ref={addRevealRef} data-reveal="">
            <span className="fe-eyebrow">Form Enclave — Build System v2</span>
            <h1 className="fe-hero-h1">
              Draft forms with<br />structural <span>precision.</span>
            </h1>
            <p className="fe-lede">
              A layered build system for forms — 18+ field types, email allow/block lists, and live
              response telemetry, rendered as an interactive structure your users can actually feel.
            </p>
            <div className="fe-hero-cta">
              <button className="fe-btn fe-btn-primary" onClick={onSignup}>→ Start Building Free</button>
              <button className="fe-link-inline" onClick={onLogin}>◇ Log in to your enclave</button>
            </div>
          </div>

          {/* Isometric Panel (Dark accent panel with cyan/amber accents) */}
          <div className="fe-iso-panel" ref={addRevealRef} data-reveal="">
            <div className="fe-iso-title">
              Form Structure <b>— Exploded View</b>
            </div>
            <div className="fe-iso-stage">
              <div className="fe-iso-group">
                <div className="fe-plate fe-plate-0"><span className="fe-cap">CONTAINER</span></div>
                <div className="fe-plate fe-plate-1"><span className="fe-cap">FIELDS × 18</span></div>
                <div className="fe-plate fe-plate-2"><span className="fe-cap">ACCESS GATE</span></div>
                <div className="fe-plate fe-plate-3"><span className="fe-cap">ANALYTICS</span></div>
              </div>
            </div>
            <div className="fe-iso-legend">
              <div className="fe-leg-row">
                <span className="fe-idx">01</span>
                <span className="fe-leg-dot" style={{ background: 'var(--fe-cyan-bright)' }} />
                <b>Container —</b> the shell every form is drafted on
              </div>
              <div className="fe-leg-row">
                <span className="fe-idx">02</span>
                <span className="fe-leg-dot" style={{ background: 'var(--fe-cyan-bright)' }} />
                <b>Fields —</b> short text, number, choice, and more
              </div>
              <div className="fe-leg-row">
                <span className="fe-idx">03</span>
                <span className="fe-leg-dot" style={{ background: 'var(--fe-amber-bright)' }} />
                <b>Access gate —</b> allow-list or block by domain
              </div>
              <div className="fe-leg-row">
                <span className="fe-idx">04</span>
                <span className="fe-leg-dot" style={{ background: 'var(--fe-cyan-bright)' }} />
                <b>Analytics —</b> completion and response signal, live
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── FEATURE CARDS ── */}
      <section className="fe-wrap" id="features">
        <div className="fe-feat-grid">
          <div className="fe-paper-card" ref={addRevealRef} data-reveal="">
            <span className="fe-tag">Layer — Design</span>
            <svg className="fe-icon" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="#12293E" strokeWidth="1.6" />
              <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="#12293E" strokeWidth="1.6" />
              <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="#12293E" strokeWidth="1.6" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="#12293E" strokeWidth="1.6" />
            </svg>
            <h3>Visual Drafting Studio</h3>
            <p>Drag fields onto the canvas, wire up validation, and branch multi-step flows — no code, no guesswork.</p>
          </div>

          <div className="fe-paper-card" ref={addRevealRef} data-reveal="">
            <span className="fe-tag">Layer — Access</span>
            <svg className="fe-icon" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="#12293E" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="#12293E" strokeWidth="1.6" />
              <circle cx="12" cy="15" r="1.4" fill="#12293E" />
            </svg>
            <h3>Email Gatekeeping</h3>
            <p>Allow-list trusted domains or block the rest. Only the right people ever reach submit.</p>
          </div>

          <div className="fe-paper-card" ref={addRevealRef} data-reveal="">
            <span className="fe-tag">Layer — Signal</span>
            <svg className="fe-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V10M11 20V4M18 20v-7" stroke="#12293E" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 20h18" stroke="#12293E" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <h3>Live Response Telemetry</h3>
            <p>Watch completion rates and answers update in real time, then export clean records whenever you need them.</p>
          </div>
        </div>
      </section>

      {/* ── SCALE SECTION ── */}
      <section className="fe-wrap">
        <div className="fe-scale-grid">
          <div className="fe-dash-card" ref={addRevealRef} data-reveal="">
            <div className="fe-dash-head">
              <div className="fe-who">Good morning, Alex</div>
              <div className="fe-range">May 12 – May 18</div>
            </div>
            <div className="fe-stat-row">
              <div className="fe-stat-box"><div className="fe-n">24</div><div className="fe-l">Total forms</div></div>
              <div className="fe-stat-box"><div className="fe-n">1,284</div><div className="fe-l">Responses</div></div>
              <div className="fe-stat-box"><div className="fe-n">87.4%</div><div className="fe-l">Completion</div></div>
              <div className="fe-stat-box"><div className="fe-n">5,742</div><div className="fe-l">Views</div></div>
            </div>
            <div className="fe-spark">
              <div className="fe-l">Responses over time</div>
              <svg width="100%" height="52" viewBox="0 0 320 52" preserveAspectRatio="none">
                <polyline points="0,38 40,30 80,34 120,14 160,20 200,10 240,24 280,16 320,22" fill="none" stroke="#2C6E7C" strokeWidth="2.2" />
              </svg>
            </div>
          </div>

          <div className="fe-scale-copy" ref={addRevealRef} data-reveal="">
            <span className="fe-eyebrow">Operations log</span>
            <h2 style={{ marginTop: '18px' }}>
              Built for scale,<br /><em>wired</em> for control.
            </h2>
            <p>Whether you're shipping your first waitlist form or running an enterprise intake pipeline, Form Enclave scales with the load.</p>
            <ul className="fe-manifest">
              <li><span className="fe-check">✓</span>Unlimited forms &amp; responses</li>
              <li><span className="fe-check">✓</span>Advanced analytics &amp; reports</li>
              <li><span className="fe-check">✓</span>Custom branding &amp; domains</li>
              <li><span className="fe-check">✓</span>Priority support &amp; SLA</li>
            </ul>
            <button className="fe-btn fe-btn-primary" onClick={onSignup}>→ Create Your First Form</button>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="fe-wrap">
        <div className="fe-enclave-panel" ref={addRevealRef} data-reveal="">
          <div>
            <span className="fe-eyebrow fe-eyebrow-amber">Community access</span>
            <h2 style={{ marginTop: '16px' }}>Join a growing enclave of builders.</h2>
            <p>Trade templates, swap validation tricks, and get unstuck fast alongside other people building with Form Enclave.</p>
            <div className="fe-avatars">
              <div className="fe-stack">
                <div className="fe-av">A</div>
                <div className="fe-av">B</div>
                <div className="fe-av">T</div>
                <div className="fe-av">J</div>
              </div>
              <span className="fe-count">+2,014 active this week</span>
            </div>
          </div>
          <div className="fe-seal">
            <div className="fe-seal-inner">
              <span className="fe-big">2,014</span>
              <span className="fe-small">members active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS LEDGER ── */}
      <section className="fe-ledger">
        <div className="fe-wrap fe-ledger-inner" ref={addRevealRef} data-reveal="">
          <div className="fe-ledger-item"><div className="fe-n">25K+</div><div className="fe-l">Active users</div></div>
          <div className="fe-ledger-item"><div className="fe-n">1M+</div><div className="fe-l">Forms created</div></div>
          <div className="fe-ledger-item"><div className="fe-n">50M+</div><div className="fe-l">Responses collected</div></div>
          <div className="fe-ledger-item"><div className="fe-n">150+</div><div className="fe-l">Countries</div></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="fe-wrap fe-footer">
        <div className="fe-logo" style={{ fontSize: '13px' }}>
          <span className="fe-logo-mark" style={{ width: '18px', height: '18px' }} />
          FORM ENCLAVE
        </div>
        <div className="fe-mono">© 2026 Form Enclave — drafted with structural precision.</div>
      </footer>
    </div>
  );
};
