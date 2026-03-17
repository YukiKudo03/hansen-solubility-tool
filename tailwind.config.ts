import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/renderer/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        md3: {
          primary: '#1976D2',
          'on-primary': '#FFFFFF',
          'primary-container': '#D1E4FF',
          'on-primary-container': '#001D36',
          secondary: '#535F70',
          'on-secondary': '#FFFFFF',
          'secondary-container': '#D7E3F7',
          'on-secondary-container': '#101C2B',
          surface: '#F8F9FF',
          'surface-dim': '#D8DAE0',
          'surface-container-lowest': '#FFFFFF',
          'surface-container-low': '#F2F3F9',
          'surface-container': '#ECEDF3',
          'surface-container-high': '#E6E8EE',
          'surface-container-highest': '#E1E2E8',
          'on-surface': '#191C20',
          'on-surface-variant': '#43474E',
          outline: '#73777F',
          'outline-variant': '#C3C7CF',
          error: '#BA1A1A',
          'on-error': '#FFFFFF',
          'error-container': '#FFDAD6',
        },
      },
      borderRadius: {
        'md3-sm': '8px',
        'md3-md': '12px',
        'md3-lg': '16px',
        'md3-xl': '28px',
      },
      fontSize: {
        'md3-display-sm': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'md3-headline-sm': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'md3-title-lg': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'md3-title-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'md3-title-sm': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'md3-body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'md3-body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'md3-body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'md3-label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'md3-label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'md3-label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};

export default config;
