import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MyFormsPage } from './pages/MyFormsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FormResponsesPage } from './pages/FormResponsesPage';
import { SettingsPage } from './pages/SettingsPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { AuthPage } from './pages/AuthPage';
import { PublicFormPage } from './pages/PublicFormPage';
import { LandingPage3D } from './components/LandingPage3D';
import { TiltCard } from './components/TiltCard';
import { Button3D } from './components/Button3D';
import { Icon } from './Icons';
import { Form, User } from './types';
import './styles.css';

function AppContent() {
  const { user, token, apiUrl, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [forms, setForms] = useState<Form[]>([]);
  const [fetchingForms, setFetchingForms] = useState(false);
  const [shareModalShareId, setShareModalShareId] = useState<string | null>(null);
  const [deleteConfirmFormId, setDeleteConfirmFormId] = useState<string | null>(null);
  const [deletingForm, setDeletingForm] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Handle Google OAuth Redirect & Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const userFromUrl = params.get('user');
    const authErrorFromUrl = params.get('auth_error');

    if (tokenFromUrl && userFromUrl) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userFromUrl)) as User;
        login(tokenFromUrl, parsedUser);
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/dashboard', { replace: true });
      } catch (e) {
        console.error('Failed to parse user from Google auth redirect', e);
      }
    } else if (authErrorFromUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/login', { replace: true });
    }
  }, [login, navigate]);

  // Fetch workspace forms when authenticated
  useEffect(() => {
    if (token && user) {
      fetchUserForms();
    }
  }, [token, user, location.pathname]);

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

  const confirmDeleteForm = (id: string) => {
    setDeleteConfirmFormId(id);
  };

  const executeDeleteForm = async () => {
    if (!token || !deleteConfirmFormId) return;
    setDeletingForm(true);
    try {
      const response = await fetch(`${apiUrl}/api/forms/${deleteConfirmFormId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setForms((prev) => prev.filter((f) => f.id !== deleteConfirmFormId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingForm(false);
      setDeleteConfirmFormId(null);
    }
  };

  const copyShareLink = (shareId: string) => {
    const link = `${window.location.origin}/form/${shareId}`;
    navigator.clipboard.writeText(link);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleEditForm = (form: Form) => {
    navigate(`/builder/${form.id}`);
  };

  const handleFormCreated = (shareId: string) => {
    fetchUserForms();
    if (shareId) {
      setShareModalShareId(shareId);
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const formQuery = queryParams.get('form');

  return (
    <>
      {copiedToast && (
        <div className="toast-notification" style={{ zIndex: 9999 }}>
          <Icon name="check" size={18} /> Link copied to clipboard!
        </div>
      )}

      {/* 3D Glass Delete Confirmation Modal */}
      {deleteConfirmFormId && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 13, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px'
          }}
        >
          <TiltCard
            maxRotateX={8}
            maxRotateY={8}
            glowColor="rgba(239, 68, 68, 0.4)"
            style={{ width: '100%', maxWidth: '440px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div
              className="modal-card"
              style={{
                padding: '32px 28px',
                width: '100%',
                maxWidth: '440px',
                textAlign: 'center',
                background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                color: '#ffffff'
              }}
            >
              <div
                className="modal-icon-badge"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)'
                }}
              >
                <Icon name="trash" size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                Delete Form?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.5 }}>
                Are you sure you want to delete this form? All form fields and collected responses will be permanently deleted.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button3D
                  variant="ghost"
                  size="md"
                  onClick={() => setDeleteConfirmFormId(null)}
                  disabled={deletingForm}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button3D>
                <Button3D
                  variant="danger"
                  size="md"
                  onClick={executeDeleteForm}
                  loading={deletingForm}
                  style={{ flex: 1 }}
                >
                  Delete
                </Button3D>
              </div>
            </div>
          </TiltCard>
        </div>
      )}

      {/* 3D Glass Share Modal Dialog */}
      {shareModalShareId && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 13, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <TiltCard
            maxRotateX={8}
            maxRotateY={8}
            glowColor="rgba(79, 70, 229, 0.4)"
            style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div
              className="modal-card"
              style={{
                padding: '36px',
                width: '100%',
                maxWidth: '480px',
                textAlign: 'center',
                background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                color: '#ffffff'
              }}
            >
              <div
                className="modal-icon-badge"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Icon name="check" size={32} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                Form Published Successfully!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>
                Your form is live and ready to collect responses from users.
              </p>

              <div
                className="share-link-box"
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '6px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/form/${shareModalShareId}`}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <Button3D variant="primary" size="sm" onClick={() => copyShareLink(shareModalShareId)}>
                  Copy Link
                </Button3D>
              </div>

              <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href={`${window.location.origin}/form/${shareModalShareId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
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

      <Routes>
        {/* Public Form Route via Query Param or /form/:shareId */}
        <Route
          path="/"
          element={
            formQuery ? (
              <PublicFormPage />
            ) : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage3D onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />
            )
          }
        />
        <Route path="/form/:shareId" element={<PublicFormPage />} />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="signup" />}
        />

        {/* Protected Dashboard Layout Routes */}
        {user ? (
          <>
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={
                  <DashboardPage
                    forms={forms}
                    fetchingForms={fetchingForms}
                    onCopyLink={copyShareLink}
                    onEditForm={handleEditForm}
                    onDeleteForm={confirmDeleteForm}
                  />
                }
              />
              <Route path="/my-forms" element={<MyFormsPage />} />
              <Route
                path="/analytics"
                element={<AnalyticsPage forms={forms} fetchingForms={fetchingForms} />}
              />
              <Route path="/analytics/:formId" element={<FormResponsesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Standalone Fullscreen Form Builder Routes */}
            <Route
              path="/builder"
              element={<FormBuilderPage onFormCreated={handleFormCreated} />}
            />
            <Route
              path="/builder/:formId"
              element={<FormBuilderPage onFormCreated={handleFormCreated} />}
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
