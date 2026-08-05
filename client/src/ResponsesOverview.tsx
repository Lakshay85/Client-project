import { useState } from 'react';
import { Form } from './types';
import { Icon } from './Icons';

interface ResponsesOverviewProps {
  forms: Form[];
  fetching: boolean;
  onSelectFormResponses: (formId: string) => void;
  onBackToDashboard: () => void;
  onCreateNewForm: () => void;
}

export function ResponsesOverview({
  forms,
  fetching,
  onSelectFormResponses,
  onBackToDashboard,
  onCreateNewForm
}: ResponsesOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);
  const activeFormsCount = forms.filter((f) => f.status === 'published').length;

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="responses-overview-page">
      {/* Header Toolbar */}
      <header className="responses-hub-header">
        <div className="header-left">
          <button className="text-button back-btn" onClick={onBackToDashboard}>
            ← Dashboard
          </button>
          <div>
            <h1>Registered Users & Responses Hub</h1>
            <p>Select any of your built forms below to inspect submitted entries and registered respondents.</p>
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="responses-metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-box coral">
            <Icon name="textarea" size={24} />
          </div>
          <div>
            <span className="metric-value">{forms.length}</span>
            <span className="metric-title">Built Forms</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box dark">
            <Icon name="users" size={24} />
          </div>
          <div>
            <span className="metric-value">{totalResponses}</span>
            <span className="metric-title">Registered Submissions</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box green">
            <Icon name="check" size={24} />
          </div>
          <div>
            <span className="metric-value">{activeFormsCount}</span>
            <span className="metric-title">Active Published Forms</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="responses-hub-controls card">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input
            type="text"
            placeholder="Search your built forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Built Forms Section */}
      <section className="built-forms-responses-section">
        {fetching ? (
          <div className="card loading-card">
            <div className="spinner"></div>
            <p>Loading your built forms list...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="card empty-forms-card">
            <div className="empty-icon-box">
              <Icon name="users" size={32} />
            </div>
            <h3>{searchTerm ? 'No forms matching search' : 'No forms created yet'}</h3>
            <p>
              {searchTerm
                ? 'Try searching with a different title or clear the filter.'
                : 'Build your first form to start collecting responses and registered user entries.'}
            </p>
            {!searchTerm && (
              <button className="coral-button" onClick={onCreateNewForm}>
                <Icon name="plus" size={18} /> Build New Form
              </button>
            )}
          </div>
        ) : (
          <div className="built-forms-grid">
            {filteredForms.map((form) => {
              const respCount = form.responseCount || 0;
              return (
                <article key={form.id} className="card built-form-response-card">
                  <div className="built-form-card-top">
                    <div className="form-card-icon">
                      <Icon name="textarea" size={22} />
                    </div>
                    <span className={`status-pill ${form.status}`}>{form.status}</span>
                  </div>

                  <h3 className="built-form-title">{form.title}</h3>
                  <p className="built-form-desc">
                    {form.description || 'No description provided.'}
                  </p>

                  <div className="built-form-stats">
                    <span className="stat-badge responses-highlight">
                      <Icon name="users" size={15} /> <strong>{respCount}</strong> Registered Users / Submissions
                    </span>
                    <span className="stat-badge">
                      <Icon name="select" size={15} /> {form.fieldCount || 0} Fields
                    </span>
                  </div>

                  <div className="built-form-footer">
                    <button
                      className="coral-button btn-full"
                      onClick={() => onSelectFormResponses(form.id)}
                    >
                      View Registered Users & Responses →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
