import React from 'react';
import { useTheme, Theme } from '../context/ThemeContext';
import { Icon } from '../Icons';

interface ThemeToggleProps {
  variant?: 'button' | 'segmented';
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  className = '',
  size = 'md',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { value: Theme; label: string; icon: string }[] = [
      { value: 'light', label: 'Light', icon: 'sun' },
      { value: 'dark', label: 'Dark', icon: 'moon' },
      { value: 'system', label: 'System', icon: 'monitor' },
    ];

    return (
      <div className={`theme-segmented-group ${className}`} role="radiogroup" aria-label="Theme selection">
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`theme-segment-btn ${isActive ? 'active' : ''}`}
              onClick={() => setTheme(opt.value)}
            >
              <Icon name={opt.icon} size={15} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${size === 'sm' ? 'theme-toggle-sm' : ''} ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={size === 'sm' ? 15 : 17} />
    </button>
  );
};
