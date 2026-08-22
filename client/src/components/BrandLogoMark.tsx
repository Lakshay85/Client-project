import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface BrandLogoMarkProps {
  size?: number | string;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  size = 28,
  theme,
  className,
  style,
}) => {
  let activeTheme = theme;
  try {
    const themeContext = useTheme();
    if (!activeTheme) {
      activeTheme = themeContext.resolvedTheme;
    }
  } catch {
    if (!activeTheme) {
      activeTheme =
        typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-theme') === 'dark'
          ? 'dark'
          : 'light';
    }
  }

  const isDark = activeTheme === 'dark';

  if (isDark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
      >
        {/* corner-bracket frame */}
        <path
          d="M4 20 V4 H20"
          fill="none"
          stroke="#55D6E8"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60 44 V60 H44"
          fill="none"
          stroke="#55D6E8"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* stacked layer plates */}
        <rect x="10" y="10" width="34" height="34" rx="7" fill="#1C4C63" />
        <rect x="16" y="16" width="34" height="34" rx="7" fill="#55D6E8" />
        <rect x="22" y="22" width="34" height="34" rx="7" fill="#F2B84B" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* corner-bracket frame */}
      <path
        d="M4 20 V4 H20"
        fill="none"
        stroke="#0E7C90"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 44 V60 H44"
        fill="none"
        stroke="#0E7C90"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* stacked layer plates */}
      <rect x="10" y="10" width="34" height="34" rx="7" fill="#0F2438" />
      <rect x="16" y="16" width="34" height="34" rx="7" fill="#0E7C90" />
      <rect x="22" y="22" width="34" height="34" rx="7" fill="#C9861F" />
    </svg>
  );
};

export const BrandTitleLogo: React.FC<{
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 32, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <rect width="64" height="64" rx="14" fill="#0F2438" />

    {/* corner-bracket frame */}
    <path
      d="M10 24 V10 H24"
      fill="none"
      stroke="#55D6E8"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M54 40 V54 H40"
      fill="none"
      stroke="#55D6E8"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* stacked layer plates */}
    <rect x="14" y="14" width="28" height="28" rx="6" fill="#1C4C63" />
    <rect x="19" y="19" width="28" height="28" rx="6" fill="#55D6E8" />
    <rect x="24" y="24" width="28" height="28" rx="6" fill="#F2B84B" />
  </svg>
);
