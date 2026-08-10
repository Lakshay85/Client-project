import React, { useEffect, useRef } from 'react';
import { Icon } from '../Icons';
import { Button3D } from './Button3D';
import { TiltCard } from './TiltCard';
import { BrandLogo3D } from './BrandLogo3D';

interface LandingPage3DProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage3D: React.FC<LandingPage3DProps> = ({ onLogin, onSignup }) => {
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Animated Globe Canvas Effect
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = 360;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots: { x: number; y: number; z: number; radius: number }[] = [];
    const numDots = 280;
    const radius = 120;

    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(-1 + (2 * i) / numDots);
      const theta = Math.sqrt(numDots * Math.PI) * phi;
      dots.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        radius: 1.5 + Math.random() * 1.5,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      rotation += 0.008;

      // Draw Orbiting Platform Ring Behind
      ctx.beginPath();
      ctx.ellipse(cx, cy + 90, 150, 45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Pedestal Glow Ellipse
      const glowGrad = ctx.createRadialGradient(cx, cy + 90, 10, cx, cy + 90, 160);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 90, 160, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render Globe Dot Cloud
      dots.forEach((dot) => {
        // Rotate around Y axis
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const x1 = dot.x * cosR - dot.z * sinR;
        const z1 = dot.z * cosR + dot.x * sinR;

        // Perspective scale
        const fov = 300;
        const scale = fov / (fov + z1);
        const px = cx + x1 * scale;
        const py = cy + dot.y * scale;

        const alpha = Math.max(0.1, (z1 + radius) / (radius * 2));

        ctx.beginPath();
        ctx.arc(px, py, dot.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = z1 > 0 ? `rgba(45, 212, 191, ${alpha * 0.9})` : `rgba(16, 185, 129, ${alpha * 0.4})`;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = z1 > 0 ? 8 : 0;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="landing-3d-wrapper" style={{ background: '#070A0F', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* 1. Top Glass Navigation Bar */}
      <nav className="landing-nav-bar" style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(7, 10, 15, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandLogo3D logoSize={54} fontSize="26px" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        {/* Center Nav Links */}
        <div className="nav-center-links" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a href="#features" className="nav-item-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>Features</a>
          <a href="#templates" className="nav-item-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>Templates</a>
          <a href="#pricing" className="nav-item-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>Pricing</a>
          <a href="#integrations" className="nav-item-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>Integrations</a>
          <a href="#resources" className="nav-item-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Resources <Icon name="arrow-down" size={12} />
          </a>
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button onClick={onLogin} style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '8px 16px' }}>
            Log in
          </button>
          <Button3D variant="primary" size="sm" onClick={onSignup} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 4px 18px rgba(6, 182, 212, 0.45)', color: '#ffffff', border: '1px solid rgba(34, 211, 238, 0.4)' }}>
            Get Started
          </Button3D>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* 2. Hero Glassmorphism Banner Section */}
        <section className="hero-3d-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '48px', alignItems: 'center', padding: '60px 40px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)', margin: '30px 0 60px', position: 'relative', overflow: 'hidden' }}>

          {/* Glassmorphism Ambient Orbs */}
          <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          {/* Left Column: Hero Text & Styled Buttons */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.35)', backdropFilter: 'blur(12px)', color: '#22d3ee', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '24px' }}>
              {/* <span className="pulse-emerald-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} /> */}
              FORM ENCLAVE MANAGEMENT PORTAL
            </div>

            <h1 style={{ fontSize: '54px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 24px', color: '#ffffff' }}>
              Create 3D Interactive Forms That <span style={{ color: '#06b6d4', background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Convert.</span>
            </h1>

            <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 36px', maxWidth: '540px' }}>
              Build multi-step forms with 18+ input types, email whitelisting & blacklisting, real-time analytics, and smooth 3D perspective animations.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Start Building Free (Cyan/Teal Gradient Button) */}
              <Button3D variant="primary" size="lg" onClick={onSignup} icon={<Icon name="arrow-right" size={16} />} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 6px 24px rgba(6, 182, 212, 0.45)', color: '#ffffff', border: '1px solid rgba(34, 211, 238, 0.4)', padding: '14px 28px', fontSize: '15px', fontWeight: 800 }}>
                Start Building Free
              </Button3D>

              {/* Log In to Account (Frosted Light White Glass Pill Button) */}
              <Button3D variant="ghost" size="lg" onClick={onLogin} icon={<Icon name="users" size={16} />} style={{ background: 'rgba(241, 245, 249, 0.92)', backdropFilter: 'blur(12px)', color: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)', padding: '14px 28px', fontSize: '15px', fontWeight: 800 }}>
                Log In to Account
              </Button3D>
            </div>
          </div>

          {/* Right Column: 3D Stage & Floating Form Mockup */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)', filter: 'blur(50px)', top: '-40px' }} />

            <TiltCard maxRotateX={15} maxRotateY={20} glowColor="rgba(16, 185, 129, 0.35)" style={{ width: '100%', maxWidth: '520px' }}>
              {/* 3D Tilted Device Container */}
              <div className="device-mockup-3d" style={{ background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.2)', padding: '20px', position: 'relative' }}>

                {/* Mockup Header Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Icon name="textarea" size={16} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Customer Feedback Form</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>Preview</span>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: '#10b981', color: '#fff', fontWeight: 700 }}>Publish</span>
                  </div>
                </div>

                {/* Mockup Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px' }}>
                  {/* Left Sidebar Fields palette */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Add Fields</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="text" size={12} /> Short Text
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="email" size={12} /> Email
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="number" size={12} /> Number
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="select" size={12} /> Multiple Choice
                      </div>
                    </div>
                  </div>

                  {/* Right Form Card Mockup */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>How satisfied are you?</div>
                    <div style={{ display: 'flex', gap: '6px', color: '#10b981', marginBottom: '16px' }}>
                      <span>★</span><span>★</span><span>★</span><span>★</span><span style={{ color: '#475569' }}>★</span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Your Message</div>
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                      Type your message here...
                    </div>

                    <button style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
                      Submit Form
                    </button>
                  </div>
                </div>

                {/* Floating 3D Badge Overlay */}
                <div className="floating-3d-overlay" style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)', animation: 'floatBadge 4s ease-in-out infinite' }}>
                  <Icon name="check" size={38} />
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* 3. 3D Feature Cards Grid */}
        <section id="features" style={{ padding: '60px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>

            {/* Feature 1 */}
            <TiltCard glowColor="rgba(16, 185, 129, 0.25)" maxRotateX={10} maxRotateY={12}>
              <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '24px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                  <Icon name="drag" size={30} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff' }}>Visual Drag & Drop Studio</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Customize questions, validation rules, multi-step sections, and active field options effortlessly.
                </p>
              </div>
            </TiltCard>

            {/* Feature 2 */}
            <TiltCard glowColor="rgba(59, 130, 246, 0.25)" maxRotateX={10} maxRotateY={12}>
              <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '24px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                  <Icon name="lock" size={30} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff' }}>Email Access Control</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Restrict form completions strictly to authorized email whitelist addresses or blacklist untrusted domains.
                </p>
              </div>
            </TiltCard>

            {/* Feature 3 */}
            <TiltCard glowColor="rgba(168, 85, 247, 0.25)" maxRotateX={10} maxRotateY={12}>
              <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(16, 185, 129, 0.2))', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: '24px', boxShadow: '0 10px 20px -5px rgba(168, 85, 247, 0.3)' }}>
                  <Icon name="chart" size={30} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff' }}>Real-time Analytics</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Inspect user responses instantly, analyze metrics charts, and export records into clean CSV sheets.
                </p>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* 4. Dashboard Showcase & Powerful Tools Section */}
        <section style={{ padding: '80px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>

          {/* Left: 3D Tilted Interactive Dashboard Showcase Card */}
          <TiltCard maxRotateX={12} maxRotateY={15} glowColor="rgba(16, 185, 129, 0.3)">
            <div style={{ background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>

              {/* Dashboard Inner Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Icon name="grid" size={14} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Dashboard</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                  May 12 - May 18
                </div>
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>Good morning, Alex</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px' }}>Here's what's happening with your forms today.</p>

              {/* 4 Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Total Forms</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '2px 0' }}>24</div>
                  <div style={{ fontSize: '9px', color: '#10b981' }}>+12%</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Responses</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '2px 0' }}>1,284</div>
                  <div style={{ fontSize: '9px', color: '#10b981' }}>+18%</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Completion</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '2px 0' }}>87.4%</div>
                  <div style={{ fontSize: '9px', color: '#10b981' }}>+5%</div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Views</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '2px 0' }}>5,742</div>
                  <div style={{ fontSize: '9px', color: '#10b981' }}>+22%</div>
                </div>
              </div>

              {/* Chart Simulation */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px' }}>Responses Over Time</div>
                <svg viewBox="0 0 400 100" style={{ width: '100%', height: '80px' }}>
                  <path d="M 0 70 Q 50 60, 100 40 T 200 30 T 300 20 T 400 10" fill="none" stroke="#10b981" strokeWidth="3" />
                  <circle cx="100" cy="40" r="4" fill="#10b981" />
                  <circle cx="200" cy="30" r="4" fill="#10b981" />
                  <circle cx="300" cy="20" r="4" fill="#10b981" />
                  <circle cx="400" cy="10" r="4" fill="#10b981" />
                </svg>
              </div>
            </div>
          </TiltCard>

          {/* Right: Powerful Tools Content & Features List */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', marginBottom: '12px' }}>BUILT FOR SCALE</div>
            <h2 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', color: '#ffffff' }}>
              Powerful Tools. <span style={{ color: '#10b981' }}>Designed</span> for You.
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 28px' }}>
              Whether you're a startup, a growing business, or an enterprise team, Form Enclave scales with you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {[
                'Unlimited forms & responses',
                'Advanced analytics & reports',
                'Custom branding & domains',
                'Priority support & SLA'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#e2e8f0', fontWeight: 600 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <Icon name="check" size={14} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button3D variant="primary" size="lg" onClick={onSignup} icon={<Icon name="arrow-right" size={16} />} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 6px 24px rgba(6, 182, 212, 0.45)', color: '#ffffff', border: '1px solid rgba(34, 211, 238, 0.4)', fontWeight: 800 }}>
              Create Your First Form
            </Button3D>
          </div>
        </section>

        {/* 5. 3D Global Network Canvas & Community */}
        <section style={{ padding: '60px 0', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'center', paddingLeft: '32px', paddingRight: '32px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 16px', color: '#ffffff' }}>Join a Global Community of Learners</h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 28px' }}>
              Connect with peers, share knowledge, and grow together in our vibrant study groups and form workspace network.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['Alex', 'Sam', 'Taylor', 'Jordan'].map((name, i) => (
                  <div key={i} style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, #10b981, #06b6d4)`, border: '2px solid #0F172A', marginLeft: i > 0 ? '-10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                    {name[0]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>+2k Active Members</span>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={globeCanvasRef} style={{ width: '100%', height: '360px', pointerEvents: 'none' }} />
          </div>
        </section>

        {/* 6. Bottom 3D Stat Counters Bar */}
        <section style={{ paddingBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(16, 185, 129, 0.2)">
              <div style={{ background: '#0F172A', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="users" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>25K+</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Active Users</div>
                </div>
              </div>
            </TiltCard>

            <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(16, 185, 129, 0.2)">
              <div style={{ background: '#0F172A', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="textarea" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>1M+</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Forms Created</div>
                </div>
              </div>
            </TiltCard>

            <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(16, 185, 129, 0.2)">
              <div style={{ background: '#0F172A', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trending-up" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>50M+</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Responses Collected</div>
                </div>
              </div>
            </TiltCard>

            <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(16, 185, 129, 0.2)">
              <div style={{ background: '#0F172A', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="url" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>150+</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Countries</div>
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

      </div>
    </div>
  );
};
