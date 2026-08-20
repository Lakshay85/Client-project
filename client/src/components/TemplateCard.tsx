import React from 'react';
import { DefaultFormTemplate } from '../defaultFormsData';
import { Icon } from '../Icons';

interface TemplateCardProps {
  template: DefaultFormTemplate;
  onPreview: (template: DefaultFormTemplate) => void;
  onUseTemplate: (template: DefaultFormTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onUseTemplate,
}) => {
  const iconBg = template.iconBg || 'var(--accent-subtle)';
  const iconColor = template.iconColor || 'var(--accent-primary)';

  return (
    <article
      className="card tool-template-card"
      onClick={() => onPreview(template)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 22px 20px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        position: 'relative',
        minHeight: '260px'
      }}
    >
      <div>
        {/* Top Icon Box & Field Counter Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-xs)',
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px dashed var(--accent-border)'
            }}
          >
            <Icon name={template.icon} size={20} />
          </div>

          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              textTransform: 'uppercase'
            }}
          >
            {template.fields.length} fields
          </span>
        </div>

        {/* Card Title */}
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em'
          }}
        >
          {template.title}
        </h3>

        {/* Card Description */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: '0 0 16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {template.description}
        </p>
      </div>

      {/* Action Footer Buttons */}
      <div
        className="tool-card-actions"
        style={{
          display: 'flex',
          gap: '8px',
          paddingTop: '14px',
          borderTop: '1px dashed var(--border-default)',
          marginTop: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="fe-btn fe-btn-ghost"
          style={{
            flex: 1,
            fontSize: '12px',
            padding: '6px 10px',
            height: '32px'
          }}
          onClick={() => onPreview(template)}
        >
          <Icon name="eye" size={13} /> Preview
        </button>

        <button
          type="button"
          className="fe-btn fe-btn-primary"
          style={{
            flex: 1.2,
            fontSize: '12px',
            padding: '6px 10px',
            height: '32px'
          }}
          onClick={() => onUseTemplate(template)}
        >
          <Icon name="plus" size={13} /> Use Form
        </button>
      </div>
    </article>
  );
};
