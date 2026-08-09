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
import { TiltCard } from './components/TiltCard';
import { Button3D } from './components/Button3D';
import { LandingPage3D } from './components/LandingPage3D';
import { BrandLogo3D } from './components/BrandLogo3D';
import { ActiveFormCard } from './components/ActiveFormCard';
import './styles.css';

type AppView =
  | 'home'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'builder'
  | 'responses-list'
  | 'responses-detail'
  | 'default-forms'
  | 'analytics'
  | 'settings';

type User = { id: string; name: string; email: string };

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareIdFromUrl = urlParams.get('form');

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('formenclave_token') || localStorage.getItem('formguard_token') || localStorage.getItem('ember_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('formenclave_user') || localStorage.getItem('formguard_user') || localStorage.getItem('ember_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const [view, setView] = useState<AppView>(user ? 'dashboard' : 'home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [forms, setForms] = useState<Form[]>([]);
  const [fetchingForms, setFetchingForms] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<{
    title: string;
    description: string;
    fields: FormField[];
    accessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
    restrictedEmails?: string[];
  } | null>(null);

  const [shareModalShareId, setShareModalShareId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const userFromUrl = params.get('user');
    const authErrorFromUrl = params.get('auth_error');

    if (tokenFromUrl && userFromUrl) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userFromUrl)) as User;
        localStorage.setItem('formenclave_token', tokenFromUrl);
        localStorage.setItem('formenclave_user', JSON.stringify(parsedUser));
        setToken(tokenFromUrl);
        setUser(parsedUser);
        setView('dashboard');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to parse user from Google auth redirect', e);
      }
    } else if (authErrorFromUrl) {
      setError(decodeURIComponent(authErrorFromUrl));
      setView('login');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const editExistingForm = async (form: Form) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/forms/${form.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (await response.json()) as { form?: Form; message?: string };
      if (response.ok && data.form) {
        setEditingForm(data.form);
        setActiveTemplate(null);
        setView('builder');
      } else {
        alert(data.message || 'Failed to load form details.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      localStorage.setItem('formenclave_token', data.token);
      localStorage.setItem('formenclave_user', JSON.stringify(data.user));
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
    localStorage.removeItem('formenclave_token');
    localStorage.removeItem('formenclave_user');
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
    setEditingForm(null);
    setActiveTemplate(null);
    setView('builder');
  };

  const useDefaultTemplate = (template: DefaultFormTemplate) => {
    setEditingForm(null);
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
          if (shareId) {
            setShareModalShareId(shareId);
          }
          setView('dashboard');
        }}
        formId={editingForm?.id}
        initialTitle={editingForm?.title || activeTemplate?.title}
        initialDescription={editingForm?.description || activeTemplate?.description}
        initialFields={editingForm?.fields || activeTemplate?.fields}
        initialAccessType={editingForm?.accessType || activeTemplate?.accessType || 'allow_all'}
        initialRestrictedEmails={editingForm?.restrictedEmails || activeTemplate?.restrictedEmails || []}
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

  if (user) {
    return (
      <div className="app-sidebar-layout">
        {copiedToast && (
          <div className="toast-notification">
            <Icon name="check" size={18} /> Link copied to clipboard!
          </div>
        )}

        {/* Left Vertical Sidebar Navigation */}
        <aside className="sidebar-shell">
          <div>
            {/* Sidebar Brand Header with Transparent Logo */}
            <div style={{ padding: '16px 20px 24px' }}>
              <BrandLogo3D logoSize={46} fontSize="22px" onClick={() => setView('dashboard')} />
            </div>

            {/* Sidebar Menu Items */}
            <nav className="sidebar-menu-list">
              <button
                className={`sidebar-menu-item ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                <Icon name="grid" size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`sidebar-menu-item ${view === 'default-forms' ? 'active' : ''}`}
                onClick={() => setView('default-forms')}
              >
                <Icon name="textarea" size={18} />
                <span>My Forms</span>
              </button>
              <button
                className={`sidebar-menu-item ${view === 'responses-list' || view === 'responses-detail' || view === 'analytics' ? 'active' : ''}`}
                onClick={() => setView('responses-list')}
              >
                <Icon name="chart" size={18} />
                <span>Analytics</span>
              </button>
              <button
                className={`sidebar-menu-item ${view === 'settings' ? 'active' : ''}`}
                onClick={() => setView('settings')}
              >
                <Icon name="settings" size={18} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Bottom User Profile */}
          <div className="sidebar-user-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="sidebar-user-name">{user.name.split(' ')[0]}</span>
            </div>
            <Button3D variant="ghost" size="sm" onClick={signOut} title="Sign out">
              <Icon name="logout" size={16} />
            </Button3D>
          </div>
        </aside>

        {/* Right Workspace Main Content Area */}
        <main className="workspace-main-area">
          {/* Top Header Bar */}
          {view !== 'dashboard' && (
            <header className="top-header-bar">
              <h1 className="top-header-title">
                {view === 'default-forms'
                  ? 'Templates Gallery'
                  : view === 'responses-list' || view === 'responses-detail' || view === 'analytics'
                    ? 'Analytics Hub'
                    : view === 'settings'
                      ? 'Portal Settings'
                      : 'Overview'}
              </h1>
              <Button3D
                variant="primary"
                size="md"
                icon={<Icon name="plus" size={18} />}
                onClick={startNewBlankForm}
                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)' }}
              >
                Build New Form
              </Button3D>
            </header>
          )}

          <div className="workspace-content-body">
            {/* Dashboard View */}
            {view === 'dashboard' && (
              <div className="dashboard-content">
                {/* Hero Banner */}
                <header className="dashboard-hero" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)', borderRadius: 'var(--radius-xl)', padding: '40px 32px', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', marginBottom: '28px', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-glass-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#22d3ee', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '16px' }}>
                      <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }}></span>
                      FORM ENCLAVE STUDIO 3D • ACTIVE WORKSPACE
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff', letterSpacing: '-0.02em' }}>Interactive Form Engine</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 24px', maxWidth: '650px', lineHeight: 1.5 }}>
                      Build high-converting multi-step forms with email access control, real-time analytics, and 3D preview.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                    <Button3D variant="primary" size="md" icon={<Icon name="plus" size={18} />} onClick={startNewBlankForm} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)' }}>
                      Build New Form
                    </Button3D>
                    <Button3D variant="secondary" size="md" icon={<Icon name="grid" size={18} />} onClick={() => setView('default-forms')}>
                      Explore Templates
                    </Button3D>
                  </div>
                </header>

                {/* Summary Metric Cards */}
                <div className="metrics-summary-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <TiltCard glowColor="rgba(79, 70, 229, 0.15)" maxRotateX={6} maxRotateY={6}>
                    <div style={{ padding: '24px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL FORMS</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', margin: '6px 0 4px' }}>{forms.length}</div>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="zap" size={14} /> <span>Active in Workspace</span>
                      </div>
                    </div>
                  </TiltCard>
                  <TiltCard glowColor="rgba(139, 92, 246, 0.15)" maxRotateX={6} maxRotateY={6}>
                    <div style={{ padding: '24px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL SUBMISSIONS</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', margin: '6px 0 4px' }}>
                        {forms.reduce((acc, f) => acc + (f.responseCount || 0), 0)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="trending-up" size={14} /> <span>Submissions Collected</span>
                      </div>
                    </div>
                  </TiltCard>
                  <TiltCard glowColor="rgba(245, 158, 11, 0.15)" maxRotateX={6} maxRotateY={6}>
                    <div style={{ padding: '24px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 700, letterSpacing: '0.05em' }}>RESTRICTED FORMS</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', margin: '6px 0 4px' }}>
                        {forms.filter((f) => f.accessType && f.accessType !== 'allow_all').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="lock" size={14} /> <span>Email Access Protection</span>
                      </div>
                    </div>
                  </TiltCard>
                </div>

                {/* Active Forms Section */}
                <section className="forms-grid-section">
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>Your Active Forms</h2>
                    <span className="count-badge" style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: '#e2e8f0', color: '#1e293b', fontWeight: 700 }}>
                      {forms.length} Forms
                    </span>
                  </div>

                  {fetchingForms ? (
                    <div className="card loading-card" style={{ padding: '40px', textAlign: 'center' }}>
                      <div className="spinner"></div>
                      <p>Syncing workspace forms...</p>
                    </div>
                  ) : forms.length === 0 ? (
                    <TiltCard maxRotateX={6} maxRotateY={8}>
                      <div className="empty-forms-card" style={{ padding: '40px', textAlign: 'center', background: '#0f172a', borderRadius: '24px', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}>
                        <div className="empty-icon-box" style={{ margin: '0 auto 16px', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                          <Icon name="textarea" size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>No forms created yet</h3>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Click "Build New Form" or pick a template to start in seconds.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                          <Button3D variant="primary" size="md" icon={<Icon name="plus" size={18} />} onClick={startNewBlankForm}>
                            Build New Form
                          </Button3D>
                          <Button3D variant="secondary" size="md" icon={<Icon name="grid" size={18} />} onClick={() => setView('default-forms')}>
                            Explore Templates
                          </Button3D>
                        </div>
                      </div>
                    </TiltCard>
                  ) : (
                    <div className="forms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                      {forms.map((form) => (
                        <ActiveFormCard
                          key={form.id}
                          form={form}
                          onCopyLink={copyShareLink}
                          onEdit={editExistingForm}
                          onDelete={deleteForm}
                          onViewResponses={(formId) => {
                            setSelectedFormId(formId);
                            setView('responses-detail');
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Responses Hub View */}
            {(view === 'responses-list' || view === 'analytics') && (
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
            )}

            {/* Default Forms Library View */}
            {view === 'default-forms' && (
              <DefaultForms
                onBack={() => setView('dashboard')}
                onUseTemplate={useDefaultTemplate}
              />
            )}

            {/* Settings View Placeholder */}
            {view === 'settings' && (
              <TiltCard maxRotateX={4} maxRotateY={4}>
                <div style={{ padding: '36px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="settings" size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#000000' }}>Portal & Account Settings</h2>
                      <p style={{ margin: 0, color: '#1e293b', fontSize: '14px' }}>Manage workspace permissions, API tokens, and user profile preferences.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
                    <div style={{ padding: '16px', border: '1px solid var(--slate-200)', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Account Email</div>
                      <div style={{ color: 'var(--slate-600)', fontSize: '14px' }}>{user.email}</div>
                    </div>
                    <div style={{ padding: '16px', border: '1px solid var(--slate-200)', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Full Name</div>
                      <div style={{ color: 'var(--slate-600)', fontSize: '14px' }}>{user.name}</div>
                    </div>
                    <div style={{ padding: '16px', border: '1px solid var(--slate-200)', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Google OAuth Status</div>
                      <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="check" size={14} /> Authenticated & Connected
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            )}
          </div>
        </main>

        {/* 3D Glass Share Modal Dialog */}
        {shareModalShareId && (
          <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(10, 13, 20, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <TiltCard maxRotateX={8} maxRotateY={8} glowColor="rgba(79, 70, 229, 0.4)">
              <div className="modal-card" style={{ padding: '36px', width: '100%', maxWidth: '480px', textAlign: 'center', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div className="modal-icon-badge" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 20px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                  <Icon name="check" size={32} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 8px' }}>Form Published Successfully!</h2>
                <p style={{ color: 'var(--slate-600)', fontSize: '14px', margin: '0 0 24px' }}>Your form is live and ready to collect responses from users.</p>

                <div className="share-link-box" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--slate-100)', padding: '6px', borderRadius: '12px', border: '1px solid var(--slate-300)' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?form=${shareModalShareId}`}
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '13px', color: 'var(--slate-800)', fontWeight: 600, outline: 'none' }}
                  />
                  <Button3D variant="primary" size="sm" onClick={() => copyShareLink(shareModalShareId)}>
                    Copy Link
                  </Button3D>
                </div>

                <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a href={`${window.location.origin}/?form=${shareModalShareId}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <Button3D variant="secondary" size="md" style={{ width: '100%' }}>
                      <Icon name="external-link" size={16} /> Open Public Form
                    </Button3D>
                  </a>
                  <Button3D variant="ghost" size="md" onClick={() => setShareModalShareId(null)}>
                    Return to Dashboard
                  </Button3D>
                </div>
              </div>
            </TiltCard>
          </div>
        )}
      </div>
    );
  }

  // Public Landing Home View (for non-authenticated users)
  return (
    <LandingPage3D
      onLogin={() => setView('login')}
      onSignup={() => setView('signup')}
    />
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-page app-shell">
      <nav className="top-nav auth-nav">
        <a className="brand" onClick={() => onMode('home')}>
          <img src="/logo.png" alt="Form Enclave Logo" className="brand-logo-img" />
          form<span>Enclave</span>
        </a>

        <button className="text-button back-home-btn" onClick={() => onMode('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="arrow-left" size={16} /> Back home
        </button>
      </nav>

      <div className="auth-container">
        <div className="auth-shell">
          {/* Left Column: Visual Teaser & Feature Highlights */}
          <section className="auth-intro">
            <div className="auth-badge">
              <span className="live-dot"></span> Secure Form Studio 2.0
            </div>
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
                onClick={() => onMode('login')}
              >
                Log In
              </button>
              <button
                type="button"
                className={`auth-tab ${signup ? 'active' : ''}`}
                onClick={() => onMode('signup')}
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

            <form onSubmit={onSubmit} className="auth-form">

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
                  >
                    <Icon name="eye" size={16} />
                  </button>
                </div>
              </div>

              {error && <div className="form-error auth-error-alert">{error}</div>}

              <button className="coral-button form-submit-btn" disabled={loading}>
                {loading ? 'Please wait…' : signup ? 'Create Account' : 'Log In to Workspace'}
              </button>
            </form>

            <div className="auth-footer-switch">
              <span>{signup ? 'Already have an account?' : 'Don’t have an account yet?'}</span>
              <button type="button" className="switch-link-btn" onClick={() => onMode(signup ? 'login' : 'signup')}>
                {signup ? 'Log in here' : 'Sign up for free'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
