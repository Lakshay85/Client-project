import React from 'react';
import { TransparentLogo } from './TransparentLogo';

interface BrandLogo3DProps {
  onClick?: () => void;
  logoSize?: number;
  fontSize?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

export const BrandLogo3D: React.FC<BrandLogo3DProps> = ({
  onClick,
  logoSize = 56,
  fontSize = '26px',
  showText = false,
  style,
}) => {
  return (
    <div
      onClick={onClick}
      className="brand-logo-3d-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Clean Transparent Logo Image (No Border & No Housing Background) */}
      <TransparentLogo size={logoSize} />

      {/* Stylized Project Title "Form Enclave" (hidden by default) */}
      {showText && (
        <div
          className="brand-title-3d-container"
          style={{
            fontSize,
            fontWeight: 900,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.03em',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          {/* Metallic White "Form" */}
          <span
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline-block',
              filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8))',
              marginRight: '6px',
            }}
          >
            Form
          </span>

          {/* Crisp Cyan "Enclave" */}
          <span
            style={{
              background: 'linear-gradient(180deg, #38BDF8 0%, #22D3EE 40%, #06B6D4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline-block',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
            }}
          >
            Enclave
          </span>
        </div>
      )}
    </div>
  );
};
