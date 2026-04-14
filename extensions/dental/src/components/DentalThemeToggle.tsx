import React, { useState, useEffect } from 'react';

export type DentalTheme = 'standard' | 'dental';

interface DentalThemeToggleProps {
  onThemeChange?: (theme: DentalTheme) => void;
}

const DENTAL_CSS_VARS = {
  '--dental-primary': '#0E7490',
  '--dental-primary-light': '#22D3EE',
  '--dental-bg': '#0F172A',
  '--dental-surface': '#1E293B',
  '--dental-accent': '#06B6D4',
  '--dental-text': '#F1F5F9',
  '--dental-text-muted': '#94A3B8',
  '--dental-success': '#10B981',
  '--dental-warning': '#F59E0B',
  '--dental-border': '#334155',
};

export default function DentalThemeToggle({ onThemeChange }: DentalThemeToggleProps) {
  const [theme, setTheme] = useState<DentalTheme>('dental');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dental') {
      Object.entries(DENTAL_CSS_VARS).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      root.classList.add('dental-theme');
    } else {
      Object.keys(DENTAL_CSS_VARS).forEach(key => {
        root.style.removeProperty(key);
      });
      root.classList.remove('dental-theme');
    }
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  return (
    <button
      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors"
      style={{
        background: theme === 'dental' ? 'var(--dental-accent, #06B6D4)' : '#6B7280',
        color: '#FFFFFF',
      }}
      onClick={() => setTheme(prev => (prev === 'dental' ? 'standard' : 'dental'))}
      title={`Switch to ${theme === 'dental' ? 'Standard' : 'Dental'} theme`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 5 9 4 10.5C3 12 2.5 14 3 16C3.5 18 5 19.5 7 20C8.5 20.4 9.5 19.5 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C14.5 19.5 15.5 20.4 17 20C19 19.5 20.5 18 21 16C21.5 14 21 12 20 10.5C19 9 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
      </svg>
      {theme === 'dental' ? 'Dental' : 'Standard'}
    </button>
  );
}
