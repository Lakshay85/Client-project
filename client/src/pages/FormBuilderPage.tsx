import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormBuilder } from '../FormBuilder';
import { Form, FormField } from '../types';

interface FormBuilderPageProps {
  onFormCreated: (shareId: string) => void;
}

export const FormBuilderPage: React.FC<FormBuilderPageProps> = ({ onFormCreated }) => {
  const { formId } = useParams<{ formId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, apiUrl } = useAuth();

  const [loading, setLoading] = useState(!!formId);
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  // Check if template data was passed in location.state
  const templateState = location.state as {
    template?: {
      title: string;
      description: string;
      fields: FormField[];
      accessType?: 'allow_all' | 'allow_only' | 'restrict_specific';
      restrictedEmails?: string[];
    };
  } | null;

  useEffect(() => {
    if (formId && token) {
      setLoading(true);
      fetch(`${apiUrl}/api/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data: { form?: Form; message?: string }) => {
          if (data.form) {
            setEditingForm(data.form);
          } else {
            alert(data.message || 'Failed to load form details.');
            navigate('/dashboard');
          }
        })
        .catch((err) => {
          console.error(err);
          navigate('/dashboard');
        })
        .finally(() => setLoading(false));
    }
  }, [formId, token, apiUrl, navigate]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="card loading-card" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading form editor...</p>
      </div>
    );
  }

  const initialTitle = editingForm?.title || templateState?.template?.title;
  const initialDescription = editingForm?.description || templateState?.template?.description;
  const initialFields = editingForm?.fields || templateState?.template?.fields;
  const initialAccessType = editingForm?.accessType || templateState?.template?.accessType || 'allow_all';
  const initialRestrictedEmails = editingForm?.restrictedEmails || templateState?.template?.restrictedEmails || [];

  return (
    <FormBuilder
      token={token}
      apiUrl={apiUrl}
      onBack={() => navigate(-1)}
      onFormCreated={(shareId) => {
        onFormCreated(shareId);
        navigate('/dashboard');
      }}
      formId={editingForm?.id}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialFields={initialFields}
      initialAccessType={initialAccessType}
      initialRestrictedEmails={initialRestrictedEmails}
    />
  );
};
