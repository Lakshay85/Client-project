import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo3D } from '../components/BrandLogo3D';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const signup = mode === 'signup';
  const navigate = useNavigate();
  const { apiUrl, login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const endpoint = signup ? 'signup' : 'login';
      const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = (await response.json()) as { token?: string; user?: any; message?: string };
      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message ?? 'Unable to authenticate.');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fe-landing fe-auth-page">
      {/* ── TOP NAV ── */}
      <nav className="fe-nav">
        <div className="fe-wrap fe-nav-inner">
          <BrandLogo3D onClick={() => navigate('/')} logoSize={30} fontSize="17px" />
        </div>
      </nav>

      {/* ── AUTH CONTAINER ── */}
      <section className="fe-auth-section fe-wrap">
        <div className="fe-auth-grid">

          {/* LEFT: COPY & HIGHLIGHTS */}
          <div className="fe-auth-copy">
            <span className="fe-eyebrow">Next-Gen Form Infrastructure</span>
            <h1>
              {signup ? (
                <>
                  Build &amp; Share<br />
                  <span>Custom Forms.</span>
                </>
              ) : (
                <>
                  Welcome Back to<br />
                  <span>Form Enclave.</span>
                </>
              )}
            </h1>
            <p className="fe-lede">
              {signup
                ? 'Create a free account to start designing custom forms, restricting submissions by email, and gathering real-time data.'
                : 'Log in to access your form workspace, manage submission restrictions, and inspect real-time response telemetry.'}
            </p>

            <div className="fe-feature-row">
              <div className="fe-f-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3>Drag &amp; Drop Form Builder</h3>
                <p>Build forms with 18+ rich input fields, pickers &amp; options.</p>
              </div>
            </div>

            <div className="fe-feature-row">
              <div className="fe-f-icon fe-f-icon-amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div>
                <h3>Email Access Control</h3>
                <p>Restrict form submissions by specific user email IDs or domain rules.</p>
              </div>
            </div>

            <div className="fe-feature-row">
              <div className="fe-f-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3>Analytics &amp; CSV Exports</h3>
                <p>Inspect responses, view breakdowns &amp; download formatted CSV reports.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: TERMINAL AUTH CARD */}
          <div className="fe-auth-card-outer">
            <div className="fe-auth-title">
              <span>
                <span className="fe-live-dot" />
                Access Terminal <b>— {signup ? 'Register' : 'Authentication'}</b>
              </span>
              <span>ENC/{signup ? '01' : '02'}</span>
            </div>

            <div className="fe-auth-card">
              {/* TABS */}
              <div className="fe-tabs">
                <button
                  type="button"
                  className={`fe-tab ${!signup ? 'active' : ''}`}
                  onClick={() => {
                    setError('');
                    navigate('/login');
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className={`fe-tab ${signup ? 'active' : ''}`}
                  onClick={() => {
                    setError('');
                    navigate('/signup');
                  }}
                >
                  Create Account
                </button>
              </div>

              <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
              <p className="fe-sub">
                {signup ? 'Get started in under 30 seconds' : 'Enter your credentials to continue'}
              </p>

              {/* GOOGLE OAUTH */}
              <button
                type="button"
                className="fe-btn-oauth"
                onClick={() => {
                  window.location.href = `${apiUrl}/api/auth/google`;
                }}
              >
                <svg width="17" height="17" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z" />
                  <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 27 36.3 24 36.3c-5.2 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 39.6 16.4 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.2-5.7 6.5l6.6 5.4C39.5 37 44 31.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
                </svg>
                {signup ? 'Sign up with Google' : 'Sign in with Google'}
              </button>

              {/* DIVIDER */}
              <div className="fe-divider">
                <span className="fe-div-line" />
                <span>OR</span>
                <span className="fe-div-line" />
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="fe-form">
                {signup && (
                  <div className="fe-field">
                    <label htmlFor="auth-name">Your Full Name</label>
                    <div className="fe-input-shell">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M3.5 20c1-3.6 4-5.5 5.5-5.5s4.5 1.9 5.5 5.5M17 12a2.8 2.8 0 1 0 0-5.6M20.5 20c-.6-2.2-2-3.6-3.5-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      <input
                        id="auth-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Alex Morgan"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                )}

                <div className="fe-field">
                  <label htmlFor="auth-email">Email Address</label>
                  <div className="fe-input-shell">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="m3.5 6 8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <input
                      id="auth-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="fe-field">
                  <label htmlFor="auth-password">Password</label>
                  <div className="fe-input-shell">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="10" width="16" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M7.5 10V7a4.5 4.5 0 1 1 9 0v3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <input
                      id="auth-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={signup ? 'new-password' : 'current-password'}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="fe-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.6" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <div className="fe-auth-error">{error}</div>}

                <button type="submit" className="fe-btn fe-btn-primary fe-btn-submit" disabled={loading}>
                  {loading ? 'Please wait…' : signup ? '→ Create Account' : '→ Log In to Workspace'}
                </button>
              </form>

              {/* FOOTNOTES */}
              <p className="fe-footnote">
                {signup ? 'Already have an account? ' : "Don't have an account yet? "}
                <button
                  type="button"
                  className="fe-switch-link"
                  onClick={() => {
                    setError('');
                    navigate(signup ? '/login' : '/signup');
                  }}
                >
                  {signup ? 'Log in here' : 'Sign up for free'}
                </button>
              </p>

              <p className="fe-legal">
                By continuing you agree to the <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
