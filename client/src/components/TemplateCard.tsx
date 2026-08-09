import React from 'react';
import { DefaultFormTemplate } from '../defaultFormsData';
import { Icon } from '../Icons';
import { TiltCard } from './TiltCard';

interface TemplateCardProps {
  template: DefaultFormTemplate;
  onPreview: (template: DefaultFormTemplate) => void;
  onUseTemplate: (template: DefaultFormTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onUseTemplate
}) => {
  return (
    <TiltCard maxRotateX={8} maxRotateY={10} glowColor="rgba(6, 182, 212, 0.2)">
      <article
        className="default-template-card"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: '430px',
          background: 'linear-gradient(145deg, #0e172a 0%, #070c18 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.1)',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Header */}
          <div className="template-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div
              className="template-icon-wrapper"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4'
              }}
            >
              <Icon name={template.icon} size={22} />
            </div>
            <span
              className="template-badge"
              style={{
                fontSize: '11px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              {template.badge}
            </span>
          </div>

          {/* Title */}
          <h3
            className="template-title"
            style={{
              fontSize: '18px',
              fontWeight: 800,
              margin: '0 0 8px',
              color: '#ffffff',
              letterSpacing: '-0.01em',
              height: '50px',
              minHeight: '50px',
              maxHeight: '50px',
              lineHeight: '1.38',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {template.title}
          </h3>

          {/* Description */}
          <p
            className="template-desc"
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: '0 0 16px',
              lineHeight: '1.45',
              height: '38px',
              minHeight: '38px',
              maxHeight: '38px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {template.description}
          </p>

          {/* INCLUDED QUESTIONS Black Container Box */}
          <div
            className="template-fields-summary"
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              marginBottom: '20px',
              height: '106px',
              minHeight: '106px',
              maxHeight: '106px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <span
              className="summary-title"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                display: 'block',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              INCLUDED QUESTIONS ({template.fields.length}):
            </span>
            <div className="fields-tag-list" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
              {template.fields.slice(0, 4).map((f) => (
                <span
                  key={f.id}
                  className="field-type-pill"
                  style={{
                    fontSize: '11px',
                    padding: '3px 9px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {f.label}
                </span>
              ))}
              {template.fields.length > 4 && (
                <span style={{ fontSize: '11px', color: '#06b6d4', alignSelf: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  +{template.fields.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="template-card-actions" style={{ display: 'flex', gap: '12px', marginTop: 'auto', height: '42px' }}>
          <button
            onClick={() => onPreview(template)}
            style={{
              flex: 1,
              background: '#e2e8f0',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '24px',
              padding: '10px 18px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <Icon name="eye" size={15} /> Preview
          </button>
          <button
            onClick={() => onUseTemplate(template)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              borderRadius: '24px',
              padding: '10px 18px',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.5), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3)',
              border: '1px solid rgba(34, 211, 238, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <Icon name="plus" size={15} /> Use Template
          </button>
        </div>
      </article>
    </TiltCard>
  );
};
