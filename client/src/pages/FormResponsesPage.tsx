import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormResponses } from '../FormResponses';

export const FormResponsesPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { token, apiUrl } = useAuth();

  if (!token || !formId) return null;

  return (
    <FormResponses
      formId={formId}
      token={token}
      apiUrl={apiUrl}
      onBack={() => navigate('/analytics')}
    />
  );
};
