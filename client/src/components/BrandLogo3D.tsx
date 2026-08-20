import React from 'react';

interface BrandLogo3DProps {
  onClick?: () => void;
  logoSize?: number;
  fontSize?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

export const BrandLogo3D: React.FC<BrandLogo3DProps> = ({
  onClick,
  logoSize = 26,
  fontSize = '16px',
  showText = true,
  style,
}) => {
  return (
    <div
      onClick={onClick}
      className="brand-logo-3d-wrapper fe-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.02em',
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      {/* Blueprint Geometric Logo Mark with Corner Brackets */}
      <span
        className="fe-logo-mark"
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          flexShrink: 0,
        }}
      />

      {/* Blueprint Project Title "FORM ENCLAVE" */}
      {showText && (
        <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
          FORM&nbsp;<span style={{ color: 'var(--accent-primary)' }}>ENCLAVE</span>
        </span>
      )}
    </div>
  );
};
