import React, { useState, useEffect, useRef } from 'react';

export type DentalTheme = 'standard' | 'dental';

interface DentalThemeToggleProps {
  onThemeChange?: (theme: DentalTheme) => void;
}

/**
 * OHIF core CSS custom properties (HSL values without the hsl() wrapper).
 * These are defined in platform/ui-next/src/tailwind.css :root and consumed
 * via Tailwind's `hsl(var(--xxx))` pattern for bg-background, text-primary, etc.
 *
 * The dental theme uses a teal/cyan palette designed for dental imaging workflows.
 */
const OHIF_DENTAL_OVERRIDES: Record<string, string> = {
  // Core surfaces
  '--background': '215 28% 6%', // Deep slate-blue (was pure black)
  '--foreground': '210 40% 96%', // Soft white text

  // Cards & panels
  '--card': '215 25% 11%', // Slightly lighter than bg
  '--card-foreground': '210 40% 96%',

  // Popovers, header, nav
  '--popover': '215 30% 10%', // Dark teal-slate
  '--popover-foreground': '210 40% 96%',

  // Primary — teal/cyan accent
  '--primary': '187 72% 47%', // Teal #0E9AAA
  '--primary-foreground': '210 40% 98%',

  // Secondary
  '--secondary': '190 50% 30%', // Darker teal
  '--secondary-foreground': '185 40% 80%',

  // Muted surfaces (sidebars, inactive tabs)
  '--muted': '215 25% 12%', // Dark slate
  '--muted-foreground': '215 20% 60%', // Muted gray-blue text

  // Accent (active states, highlights)
  '--accent': '192 65% 22%', // Deep cyan
  '--accent-foreground': '210 40% 96%',

  // Destructive
  '--destructive': '0 72% 45%', // Bright red
  '--destructive-foreground': '0 0% 98%',

  // Borders
  '--border': '215 20% 18%', // Subtle slate border
  '--input': '215 30% 22%', // Input field bg
  '--ring': '187 72% 47%', // Focus ring = primary teal

  // Highlight (active viewport border)
  '--highlight': '187 74% 55%', // Bright teal

  // Neutrals
  '--neutral': '215 18% 55%',
  '--neutral-light': '190 40% 75%',
  '--neutral-dark': '215 20% 20%',

  // Chart colors — teal-based palette
  '--chart-1': '187 70% 50%',
  '--chart-2': '160 60% 45%',
  '--chart-3': '45 80% 55%',
  '--chart-4': '280 55% 55%',
  '--chart-5': '340 65% 50%',
};

/**
 * Dental-specific CSS variables used by the dental extension components
 * (PracticeHeader, ToothSelector, DentalMeasurementsPanel).
 */
const DENTAL_COMPONENT_VARS: Record<string, string> = {
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

const ALL_OVERRIDES = { ...OHIF_DENTAL_OVERRIDES, ...DENTAL_COMPONENT_VARS };

export default function DentalThemeToggle({ onThemeChange }: DentalThemeToggleProps) {
  const [theme, setTheme] = useState<DentalTheme>('dental');
  const savedOriginals = useRef<Record<string, string>>({});

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dental') {
      // Save original OHIF values before overriding
      const originals: Record<string, string> = {};
      Object.keys(ALL_OVERRIDES).forEach(key => {
        const current = getComputedStyle(root).getPropertyValue(key).trim();
        if (current) {
          originals[key] = current;
        }
      });
      savedOriginals.current = originals;

      // Apply dental overrides
      Object.entries(ALL_OVERRIDES).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      root.classList.add('dental-theme');
    } else {
      // Restore original OHIF values
      Object.keys(ALL_OVERRIDES).forEach(key => {
        const original = savedOriginals.current[key];
        if (original) {
          root.style.setProperty(key, original);
        } else {
          root.style.removeProperty(key);
        }
      });
      root.classList.remove('dental-theme');
    }

    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  const isDental = theme === 'dental';

  return (
    <button
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-200"
      style={{
        background: isDental
          ? 'linear-gradient(135deg, hsl(187 72% 47%) 0%, hsl(192 65% 35%) 100%)'
          : 'linear-gradient(135deg, hsl(214 98% 60%) 0%, hsl(217 79% 40%) 100%)',
        color: '#FFFFFF',
        boxShadow: isDental
          ? '0 1px 3px hsla(187, 72%, 30%, 0.4)'
          : '0 1px 3px hsla(214, 98%, 30%, 0.4)',
      }}
      onClick={() => setTheme(prev => (prev === 'dental' ? 'standard' : 'dental'))}
      title={`Switch to ${isDental ? 'Standard OHIF' : 'Dental'} theme`}
    >
      {isDental ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 5 9 4 10.5C3 12 2.5 14 3 16C3.5 18 5 19.5 7 20C8.5 20.4 9.5 19.5 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C14.5 19.5 15.5 20.4 17 20C19 19.5 20.5 18 21 16C21.5 14 21 12 20 10.5C19 9 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )}
      {isDental ? 'Dental' : 'Standard'}
    </button>
  );
}
