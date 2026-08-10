import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DefaultForms } from '../DefaultForms';
import { DefaultFormTemplate } from '../defaultFormsData';

export const MyFormsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (template: DefaultFormTemplate) => {
    navigate('/builder', {
      state: {
        template: {
          title: template.title,
          description: template.description,
          fields: template.fields
        }
      }
    });
  };

  return (
    <DefaultForms
      onBack={() => navigate('/dashboard')}
      onUseTemplate={handleUseTemplate}
    />
  );
};
