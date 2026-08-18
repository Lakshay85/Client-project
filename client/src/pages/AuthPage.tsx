import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../Icons';
import { BrandLogo3D } from '../components/BrandLogo3D';
import { ThemeToggle } from '../components/ThemeToggle';

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
    <main className="auth-page">
      <nav className="auth-nav">
        <BrandLogo3D onClick={() => navigate('/')} logoSize={36} fontSize="18px" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle size="sm" />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="arrow-left" size={14} /> Back home
          </button>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-shell">
          {/* Left Column: Visual Teaser & Feature Highlights */}
          <section className="auth-intro">

            <h1>
              {signup ? (
                <>
                  Build & Share<br />
                  <span className="gradient-text">Custom Forms.</span>
                </>
              ) : (
                <>
                  Welcome Back to<br />
                  <span className="gradient-text">Form Enclave.</span>
                </>
              )}
            </h1>
            <p className="auth-subtitle">
              {signup
                ? 'Create a free account to start designing custom forms, restricting submissions by email, and gathering real-time data.'
                : 'Log in to access your form workspace, manage submission restrictions, and inspect real-time responses.'}
            </p>

            <div className="auth-features-list">
              <div className="feature-item">
                <div className="feature-icon"><Icon name="sparkles" size={18} /></div>
                <div>
                  <strong>Drag & Drop Form Builder</strong>
                  <span>Build forms with 18+ rich input fields, pickers & options.</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Icon name="lock" size={18} /></div>
                <div>
                  <strong>Email Access Control</strong>
                  <span>Restrict form submissions by specific user email IDs or domain rules.</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Icon name="chart" size={18} /></div>
                <div>
                  <strong>Analytics & CSV Exports</strong>
                  <span>Inspect responses, view breakdowns & download formatted CSV reports.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Glassmorphic Auth Card */}
          <section className="card auth-card">
            {/* Mode Switch Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${!signup ? 'active' : ''}`}
                onClick={() => {
                  setError('');
                  navigate('/login');
                }}
              >
                Log In
              </button>
              <button
                type="button"
                className={`auth-tab ${signup ? 'active' : ''}`}
                onClick={() => {
                  setError('');
                  navigate('/signup');
                }}
              >
                Create Account
              </button>
            </div>

            <div className="auth-card-header">
              <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
              <p>{signup ? 'Get started in under 30 seconds' : 'Enter your credentials to continue'}</p>
            </div>

            <div className="google-auth-section">
              <button
                type="button"
                className="google-auth-btn"
                onClick={() => {
                  window.location.href = `${apiUrl}/api/auth/google`;
                }}
              >
                <Icon name="google" size={20} />
                <span>{signup ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {signup && (
                <div className="form-group">
                  <label htmlFor="auth-name">Your Full Name</label>
                  <div className="input-icon-wrapper">
                    <Icon name="users" size={16} />
                    <input
                      id="auth-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Alex Morgan"
                      required
                      minLength={2}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Icon name="email" size={16} />
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

              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <div className="input-icon-wrapper">
                  <Icon name="lock" size={16} />
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
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{ right: '16px', width: '32px', height: '32px' }}
                  >
                    <Icon name="eye" size={18} />
                  </button>
                </div>
              </div>

              {error && <div className="form-error auth-error-alert">{error}</div>}

              <button className="form-submit-btn" disabled={loading}>
                {loading ? 'Please wait…' : signup ? 'Create Account' : 'Log In to Workspace'}
              </button>
            </form>

            <div className="auth-footer-switch">
              <span>{signup ? 'Already have an account?' : 'Don’t have an account yet?'}</span>
              <button
                type="button"
                className="switch-link-btn"
                onClick={() => {
                  setError('');
                  navigate(signup ? '/login' : '/signup');
                }}
              >
                {signup ? 'Log in here' : 'Sign up for free'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
