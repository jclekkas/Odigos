import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',
          100: '#FFF8EC',
          200: '#FDF0DE',
          300: '#F7E4CB',
        },
        sand: {
          400: '#E7D3B4',
          500: '#CDB894',
        },
        ink: {
          DEFAULT: '#2E2A25',
          muted: '#61574D',
          soft: '#75695C',
        },
        // Primary accent — a bright, warm coral rather than a burnt clay.
        clay: {
          50: '#FFF1EB',
          100: '#FFE1D5',
          200: '#FFC3AC',
          400: '#EC6136',
          500: '#DC5329',
          600: '#CB4A26',
          700: '#A63A1C',
          800: '#7C2B14',
        },
        // Fresh leaf green (kept under the `sage` name used across the site).
        sage: {
          50: '#EFF8EC',
          100: '#DCF0D6',
          300: '#A6D89D',
          500: '#6DBB66',
          600: '#4E9C4B',
          700: '#3B7A3F',
          800: '#2F6234',
        },
        // Sunshine.
        ochre: {
          50: '#FFFAE8',
          100: '#FFF2CD',
          300: '#FFDC7C',
          500: '#F5B92E',
          700: '#8A6209',
        },
        // Sky.
        sky: {
          50: '#EDF7FC',
          100: '#D6ECF6',
          300: '#96D0E8',
          500: '#45A8D2',
          700: '#1D6787',
        },
        // Blossom.
        blossom: {
          50: '#FEEFF4',
          100: '#FBDCE6',
          300: '#F2AAC2',
          700: '#A03C5C',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Figtree Variable"', 'Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.55rem, 5.1vw, 4.05rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.15rem, 4.1vw, 3.3rem)', { lineHeight: '1.06', letterSpacing: '-0.022em' }],
        'display-md': ['clamp(1.85rem, 3.4vw, 2.65rem)', { lineHeight: '1.12', letterSpacing: '-0.018em' }],
        'display-sm': ['clamp(1.45rem, 2.2vw, 1.85rem)', { lineHeight: '1.2', letterSpacing: '-0.012em' }],
        eyebrow: ['0.75rem', { lineHeight: '1.1', letterSpacing: '0.16em' }],
        lede: ['clamp(1.06rem, 1.25vw, 1.24rem)', { lineHeight: '1.62' }],
      },
      maxWidth: {
        prose: '68ch',
      },
      borderRadius: {
        card: '1.15rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(76,58,38,0.04), 0 12px 30px -18px rgba(76,58,38,0.22)',
        lift: '0 2px 4px rgba(76,58,38,0.05), 0 26px 48px -26px rgba(76,58,38,0.3)',
      },
      transitionTimingFunction: {
        somos: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--acc-h)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
