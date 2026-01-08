import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /* ----- Colors mapped from CSS variables ----- */
      colors: {
        /* Background Layers */
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-overlay': 'var(--bg-overlay)',
        
        /* Text Tiers */
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',
        
        /* Border Colors */
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',
        
        /* Accent Colors */
        'accent-cyan': 'var(--accent-cyan)',
        'accent-cyan-hover': 'var(--accent-cyan-hover)',
        'accent-cyan-muted': 'var(--accent-cyan-muted)',
        'accent-purple': 'var(--accent-purple)',
        'accent-purple-hover': 'var(--accent-purple-hover)',
        'accent-purple-muted': 'var(--accent-purple-muted)',
        
        /* Semantic Colors */
        'success': 'var(--color-success)',
        'success-muted': 'var(--color-success-muted)',
        'warning': 'var(--color-warning)',
        'warning-muted': 'var(--color-warning-muted)',
        'error': 'var(--color-error)',
        'error-muted': 'var(--color-error-muted)',
        'info': 'var(--color-info)',
        'info-muted': 'var(--color-info-muted)',
        
        /* Interactive States */
        'hover-overlay': 'var(--hover-overlay)',
        'active-overlay': 'var(--active-overlay)',
        'selected-bg': 'var(--selected-bg)',
      },
      
      /* ----- Spacing (8pt grid) ----- */
      /* Default Tailwind spacing mostly aligns with 8pt grid:
         0=0, 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px */
      
      /* ----- Border Radius ----- */
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      
      /* ----- Box Shadow ----- */
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow-cyan': 'var(--shadow-glow-cyan)',
        'glow-purple': 'var(--shadow-glow-purple)',
      },
      
      /* ----- Font Family ----- */
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      
      /* ----- Transition Duration ----- */
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '250ms',
      },
      
      /* ----- Z-Index Scale ----- */
      zIndex: {
        'base': '0',
        'dropdown': '50',
        'sticky': '100',
        'modal': '200',
        'popover': '300',
        'toast': '400',
      },
      
      /* ----- Typography Scale for consistency ----- */
      fontSize: {
        /* Labels: uppercase tracking-wider */
        'label': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '600' }],
        /* Body text */
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        /* Headings */
        'heading-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'heading': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'heading-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'heading-xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
export default config;
