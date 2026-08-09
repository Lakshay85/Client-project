import React from 'react';

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button3D: React.FC<Button3DProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = `btn-3d-${variant}`;
  const sizeClass = `btn-3d-${size}`;

  return (
    <button
      className={`btn-3d ${variantClass} ${sizeClass} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="btn-3d-bg" />
      <span className="btn-3d-glow" />
      <span className="btn-3d-content">
        {loading ? (
          <svg className="btn-spinner" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          icon && <span className="btn-icon">{icon}</span>
        )}
        <span className="btn-label">{children}</span>
      </span>
    </button>
  );
};
