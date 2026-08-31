import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F8F3EA',
          200: '#F0E8DA',
          300: '#E3D7C4',
        },
        sand: {
          400: '#D3C3AA',
          500: '#B9A588',
        },
        ink: {
          DEFAULT: '#2B2622',
          muted: '#655C52',
          soft: '#75695C',
        },
        clay: {
          50: '#FBF0EB',
          100: '#F5E1D7',
          200: '#E9C3B1',
          400: '#CE7550',
          500: '#C4623F',
          600: '#B75733',
          700: '#95462A',
          800: '#6F3520',
        },
        sage: {
          50: '#F1F4EF',
          100: '#E1E8DD',
          300: '#B4C3AC',
          500: '#82977A',
          600: '#6B8063',
          700: '#54664E',
          800: '#3E4E3F',
        },
        ochre: {
          100: '#FAEDD1',
          300: '#EFD08F',
          500: '#D9A441',
          700: '#A2751F',
        },
        forest: {
          700: '#334436',
          800: '#26332A',
          900: '#1B2620',
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
        soft: '0 1px 2px rgba(43,38,34,0.04), 0 12px 32px -18px rgba(43,38,34,0.28)',
        lift: '0 2px 4px rgba(43,38,34,0.05), 0 26px 50px -24px rgba(43,38,34,0.36)',
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
