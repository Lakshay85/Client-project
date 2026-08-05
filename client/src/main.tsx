import { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FormBuilder } from './FormBuilder';
import { FormResponses } from './FormResponses';
import { DefaultForms } from './DefaultForms';
import { ResponsesOverview } from './ResponsesOverview';
import { Icon } from './Icons';
import { PublicForm } from './PublicForm';
import { Form, FormField } from './types';
import { DefaultFormTemplate } from './defaultFormsData';
import './styles.css';

type AppView =
  | 'home'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'builder'
  | 'responses-list'
  | 'responses-detail'
  | 'default-forms';

type User = { id: string; name: string; email: string };

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareIdFromUrl = urlParams.get('form');

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('formguard_token') || localStorage.getItem('ember_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('formguard_user') || localStorage.getItem('ember_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const [view, setView] = useState<AppView>(user ? 'dashboard' : 'home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [forms, setForms] = useState<Form[]>([]);
  const [fetchingForms, setFetchingForms] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const [activeTemplate, setActiveTemplate] = useState<{
    title: string;
    description: string;
    fields: FormField[];
  } | null>(null);

  const [shareModalShareId, setShareModalShareId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (token && user && (view === 'dashboard' || view === 'responses-list')) {
      fetchUserForms();
    }
  }, [token, user, view]);

  const fetchUserForms = async () => {
    if (!token) return;
    setFetchingForms(true);
    try {
      const response = await fetch(`${apiUrl}/api/forms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (await response.json()) as { forms?: Form[]; message?: string };
      if (!response.ok) throw new Error(data.message || 'Failed to fetch forms.');
      setForms(data.forms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingForms(false);
    }
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>, mode: 'login' | 'signup') => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const endpoint = mode === 'signup' ? 'signup' : 'login';
      const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = (await response.json()) as { token?: string; user?: User; message?: string };
      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message ?? 'Unable to authenticate.');
      }
      localStorage.setItem('formguard_token', data.token);
      localStorage.setItem('formguard_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setView('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('formguard_token');
    localStorage.removeItem('formguard_user');
    localStorage.removeItem('ember_token');
    localStorage.removeItem('ember_user');
    setToken(null);
    setUser(null);
    setView('home');
  };

  const deleteForm = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this form and all its responses?')) return;
    try {
      const response = await fetch(`${apiUrl}/api/forms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setForms(forms.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = (shareId: string) => {
    const link = `${window.location.origin}/?form=${shareId}`;
    navigator.clipboard.writeText(link);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const startNewBlankForm = () => {
    setActiveTemplate(null);
    setView('builder');
  };

  const useDefaultTemplate = (template: DefaultFormTemplate) => {
    setActiveTemplate({
      title: template.title,
      description: template.description,
      fields: template.fields
    });
    setView('builder');
  };

  if (shareIdFromUrl) {
    return (
      <PublicForm
        shareId={shareIdFromUrl}
        apiUrl={apiUrl}
        onHomeClick={() => {
          window.location.href = window.location.origin;
        }}
      />
    );
  }

  if (view === 'login' || view === 'signup') {
    return (
      <AuthPage
        mode={view}
        onMode={(m) => {
          setError('');
          setView(m);
        }}
        onSubmit={(e) => handleAuthSubmit(e, view as 'login' | 'signup')}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === 'builder' && token) {
    return (
      <FormBuilder
        token={token}
        apiUrl={apiUrl}
        onBack={() => setView('dashboard')}
        onFormCreated={(shareId) => {
          fetchUserForms();
          setShareModalShareId(shareId);
          setView('dashboard');
        }}
        initialTitle={activeTemplate?.title}
        initialDescription={activeTemplate?.description}
        initialFields={activeTemplate?.fields}
      />
    );
  }

  if (view === 'responses-detail' && selectedFormId && token) {
    return (
      <FormResponses
        formId={selectedFormId}
        token={token}
        apiUrl={apiUrl}
        onBack={() => setView('responses-list')}
      />
    );
  }

  return (
    <main className="app-shell">
      {copiedToast && (
        <div className="toast-notification">
          <Icon name="check" size={18} /> Link copied to clipboard!
        </div>
      )}

      {/* Top Navigation Header */}
      <nav className="top-nav">
        <a className="brand" onClick={() => setView(user ? 'dashboard' : 'home')}>
          <div className="brand-logo-icon">F</div>
          form<span>Guard</span>
        </a>

        <div className="nav-actions">
          {user ? (
            <>
              <button
                className={`nav-link ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                My Forms
              </button>
              <button
                className={`nav-link ${view === 'responses-list' || view === 'responses-detail' ? 'active' : ''}`}
                onClick={() => setView('responses-list')}
              >
                Responses
              </button>
              <button
                className={`nav-link ${view === 'default-forms' ? 'active' : ''}`}
                onClick={() => setView('default-forms')}
              >
                Default Forms
              </button>
              <button className="coral-button" onClick={startNewBlankForm}>
                <Icon name="plus" size={16} /> Build New Form
              </button>
              <span className="welcome">Hi, {user.name.split(' ')[0]}</span>
              <button className="text-button" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="text-button" onClick={() => setView('login')}>
                Log in
              </button>
              <button className="dark-button" onClick={() => setView('signup')}>
                Get started →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area based on View */}
      {user && view === 'dashboard' && (
        <div className="dashboard-content">
          <header className="dashboard-hero">
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="hero-glass-badge">
                <span className="live-dot"></span>
                Form Builder Studio 2.0
              </div>
              <h1>Custom Form Builder Studio</h1>
              <p>Build, publish, and collect form submissions with professional drag-and-drop elements.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              <button className="coral-button" onClick={startNewBlankForm}>
                <Icon name="plus" size={18} /> Build New Form
              </button>
              <button className="dark-button" onClick={() => setView('default-forms')}>
                <Icon name="grid" size={18} /> Default Forms
              </button>
            </div>
          </header>

          <section className="forms-grid-section">
            <div className="section-title">
              <h2>Your Form Workspace</h2>
              <span className="count-badge">{forms.length} Forms</span>
            </div>

            {fetchingForms ? (
              <div className="card loading-card">
                <div className="spinner"></div>
                <p>Loading workspace forms...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="card empty-forms-card">
                <div className="empty-icon-box">
                  <Icon name="textarea" size={32} />
                </div>
                <h3>No forms created yet</h3>
                <p>Click "Build New Form" or pick a pre-built "Default Form" to start in seconds.</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="coral-button" onClick={startNewBlankForm}>
                    <Icon name="plus" size={18} /> Build New Form
                  </button>
                  <button className="dark-button" onClick={() => setView('default-forms')}>
                    <Icon name="grid" size={18} /> Default Forms
                  </button>
                </div>
              </div>
            ) : (
              <div className="forms-grid">
                {forms.map((form) => {
                  const shareUrl = `${window.location.origin}/?form=${form.shareId}`;
                  return (
                    <article key={form.id} className="card form-summary-card">
                      <div>
                        <div className="card-top">
                          <div className="form-card-icon-box">
                            <Icon name="textarea" size={22} />
                          </div>
                          <span className="form-status-badge">{form.status}</span>
                        </div>

                        <h3 className="form-card-title">{form.title}</h3>
                        <p className="form-card-desc">
                          {form.description || 'No description provided.'}
                        </p>
                      </div>

                      <div>
                        <div className="form-card-stats">
                          <span className="stat-item">
                            <Icon name="users" size={15} /> {form.responseCount || 0} Registered Users
                          </span>
                          <span className="stat-item">
                            <Icon name="select" size={15} /> {form.fieldCount || 0} Fields
                          </span>
                        </div>

                        <div className="form-card-actions">
                          <button
                            className="dark-button btn-sm"
                            onClick={() => copyShareLink(form.shareId)}
                            title="Copy Public Link"
                          >
                            <Icon name="copy" size={14} /> Copy Link
                          </button>
                          <button
                            className="text-button btn-sm"
                            onClick={() => {
                              setSelectedFormId(form.id);
                              setView('responses-detail');
                            }}
                          >
                            <Icon name="users" size={14} /> Responses ({form.responseCount || 0})
                          </button>
                          <a
                            className="text-button btn-sm"
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Icon name="eye" size={14} /> Preview
                          </a>
                          <button
                            className="text-button btn-sm delete-btn"
                            onClick={() => deleteForm(form.id)}
                            title="Delete Form"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Responses Hub View */}
      {user && view === 'responses-list' && (
        <div className="dashboard-content">
          <ResponsesOverview
            forms={forms}
            fetching={fetchingForms}
            onSelectFormResponses={(formId) => {
              setSelectedFormId(formId);
              setView('responses-detail');
            }}
            onBackToDashboard={() => setView('dashboard')}
            onCreateNewForm={startNewBlankForm}
          />
        </div>
      )}

      {/* Default Forms Library View */}
      {user && view === 'default-forms' && (
        <div className="dashboard-content">
          <DefaultForms
            onBack={() => setView('dashboard')}
            onUseTemplate={useDefaultTemplate}
          />
        </div>
      )}

      {/* Public Landing Home View */}
      {(!user || view === 'home') && !user && (
        <section className="dashboard-content">
          <div className="dashboard-hero">
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="hero-glass-badge">
                <span className="live-dot"></span>
                Next-Gen Glassmorphic Form Engine
              </div>
              <h1>Build forms that anyone can fill.</h1>
              <p>Create custom forms with rich input fields: text, text area, dates, calendar, options, and color pickers. Share your form link instantly!</p>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                <button className="coral-button" onClick={() => setView('signup')}>
                  Get started free →
                </button>
                <button className="text-button" style={{ color: '#fff' }} onClick={() => setView('login')}>
                  Log in to your account
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Share Modal Dialog */}
      {shareModalShareId && (
        <div className="modal-backdrop">
          <div className="card modal-card">
            <div className="modal-icon-badge">
              <Icon name="check" size={28} />
            </div>
            <h2>Form Published Successfully!</h2>
            <p>Your form is now live and ready to accept responses from anyone with the link.</p>

            <div className="share-link-box">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?form=${shareModalShareId}`}
              />
              <button
                className="coral-button"
                onClick={() => copyShareLink(shareModalShareId)}
              >
                Copy Link
              </button>
            </div>

            <div className="modal-actions">
              <a
                className="dark-button"
                href={`${window.location.origin}/?form=${shareModalShareId}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="eye" size={16} /> Open Form Link ↗
              </a>
              <button
                className="text-button"
                onClick={() => setShareModalShareId(null)}
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AuthPage({
  mode,
  onMode,
  onSubmit,
  loading,
  error
}: {
  mode: 'login' | 'signup';
  onMode: (m: AppView) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string;
}) {
  const signup = mode === 'signup';
  return (
    <main className="auth-page app-shell">
      <nav className="top-nav">
        <a className="brand" onClick={() => onMode('home')}>
          <div className="brand-logo-icon">F</div>
          form<span>Guard</span>
        </a>
        <button className="text-button" onClick={() => onMode('home')}>
          ← Back home
        </button>
      </nav>
      <div className="auth-shell">
        <section className="auth-intro">
          <h1>
            {signup ? (
              <>
                Build & Share<br />
                <em>Custom Forms.</em>
              </>
            ) : (
              <>
                Welcome<br />
                <em>Back.</em>
              </>
            )}
          </h1>
          <p>
            {signup
              ? 'Create an account to build shareable forms and collect responses.'
              : 'Log in to manage your forms and view submitted responses.'}
          </p>
        </section>
        <section className="card auth-card">
          <h2>{signup ? 'Create your account' : 'Log in to FormGuard'}</h2>
          <form onSubmit={onSubmit}>
            {signup && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  required
                  minLength={2}
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={signup ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="coral-button form-button" disabled={loading}>
              {loading ? 'Please wait…' : signup ? 'Create Account →' : 'Log In →'}
            </button>
          </form>
          <div className="switch">
            {signup ? 'Already have an account?' : 'New to FormGuard?'}
            <button onClick={() => onMode(signup ? 'login' : 'signup')}>
              {signup ? 'Log in' : 'Create one'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
