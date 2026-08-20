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
import { ThemeProvider } from './context/ThemeContext';
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
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { ShareModal } from './components/modals/ShareModal';
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
    const oauthCodeFromUrl = params.get('oauth_code');
    const tokenFromUrl = params.get('token');
    const userFromUrl = params.get('user');
    const authErrorFromUrl = params.get('auth_error');

    if (oauthCodeFromUrl) {
      fetch(`${apiUrl}/api/auth/google/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: oauthCodeFromUrl })
      })
        .then((res) => {
          if (!res.ok) throw new Error('OAuth code exchange failed');
          return res.json();
        })
        .then((data: { token: string; user: User }) => {
          login(data.token, data.user);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/dashboard', { replace: true });
        })
        .catch((e) => {
          console.error('Failed to exchange OAuth code', e);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/login', { replace: true });
        });
    } else if (tokenFromUrl && userFromUrl) {
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
  }, [apiUrl, login, navigate]);

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

      {deleteConfirmFormId && (
        <DeleteConfirmModal
          onConfirm={executeDeleteForm}
          onCancel={() => setDeleteConfirmFormId(null)}
          deleting={deletingForm}
        />
      )}

      {shareModalShareId && (
        <ShareModal
          shareId={shareModalShareId}
          onCopyLink={copyShareLink}
          onClose={() => setShareModalShareId(null)}
        />
      )}

      <Routes>
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

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="signup" />}
        />

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
                    onEditForm={(form: Form) => navigate(`/builder/${form.id}`)}
                    onDeleteForm={(id: string) => setDeleteConfirmFormId(id)}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
