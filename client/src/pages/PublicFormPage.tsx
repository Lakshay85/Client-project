import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PublicForm } from '../PublicForm';

export const PublicFormPage: React.FC = () => {
  const { shareId: paramShareId } = useParams<{ shareId?: string }>();
  const [searchParams] = useSearchParams();
  const queryShareId = searchParams.get('form');

  const shareId = paramShareId || queryShareId;
  const navigate = useNavigate();
  const { apiUrl } = useAuth();

  if (!shareId) return null;

  return (
    <PublicForm
      shareId={shareId}
      apiUrl={apiUrl}
      onHomeClick={() => navigate('/')}
    />
  );
};
