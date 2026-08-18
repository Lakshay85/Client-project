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
  const iconBg = template.iconBg || 'rgba(99, 102, 241, 0.12)';
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
        padding: '24px 20px 20px',
        borderRadius: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        position: 'relative',
        minHeight: '260px'
      }}
    >
      <div>
        {/* Top Icon Box (Matching the Reference Image style) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon name={template.icon} size={20} />
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-default)'
            }}
          >
            {template.fields.length} fields
          </span>
        </div>

        {/* Card Title */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.3,
            letterSpacing: '-0.015em'
          }}
        >
          {template.title}
        </h3>

        {/* Card Description */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
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
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{
            flex: 1,
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 10px',
            color: 'var(--text-secondary)'
          }}
          onClick={() => onPreview(template)}
        >
          <Icon name="eye" size={13} /> Preview
        </button>

        <button
          type="button"
          className="btn btn-3d-primary btn-sm"
          style={{
            flex: 1.2,
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 10px'
          }}
          onClick={() => onUseTemplate(template)}
        >
          <Icon name="plus" size={13} /> Use Form
        </button>
      </div>
    </article>
  );
};
