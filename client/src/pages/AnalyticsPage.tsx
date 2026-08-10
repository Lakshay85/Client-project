import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '../types';
import { ResponsesOverview } from '../ResponsesOverview';

interface AnalyticsPageProps {
  forms: Form[];
  fetchingForms: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ forms, fetchingForms }) => {
  const navigate = useNavigate();

  return (
    <ResponsesOverview
      forms={forms}
      fetching={fetchingForms}
      onSelectFormResponses={(formId) => navigate(`/analytics/${formId}`)}
      onBackToDashboard={() => navigate('/dashboard')}
      onCreateNewForm={() => navigate('/builder')}
    />
  );
};
