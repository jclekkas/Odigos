import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutral base — soft cream and white, never beige-on-beige.
        cream: {
          50: '#FFFCF5',
          100: '#FFF7E8',
          200: '#FFEFD6',
          300: '#FCE3BC',
        },
        ink: {
          DEFAULT: '#2C2320',
          muted: '#5C5049',
          soft: '#786A61',
        },
        // PRIMARY — a bright tomato coral. Saturated, never terracotta.
        coral: {
          50: '#FFF1ED',
          100: '#FFDED4',
          200: '#FFBBA6',
          300: '#FF9576',
          400: '#FF7350',
          500: '#EE5233',
          600: '#D33E26',
          700: '#B03220',
          800: '#85261A',
        },
        // Sunshine.
        sun: {
          50: '#FFFAE3',
          100: '#FFF3C4',
          200: '#FFE68A',
          300: '#FFD955',
          400: '#FFC531',
          500: '#F2AE12',
          600: '#C08808',
          700: '#8F650A',
        },
        // Cheerful sky.
        sky: {
          50: '#EAF7FD',
          100: '#CFEBFA',
          200: '#9BD7F3',
          300: '#66C0E9',
          400: '#3BA9E0',
          500: '#1E8CC4',
          600: '#16719F',
          700: '#12587B',
        },
        // Fresh grass.
        grass: {
          50: '#EDFAED',
          100: '#D4F2D6',
          200: '#A6E2A9',
          300: '#77CE7D',
          400: '#4CB963',
          500: '#35994C',
          600: '#287A3D',
          700: '#1F5F31',
        },
        // Playful raspberry.
        berry: {
          50: '#FFEFF5',
          100: '#FFD8E5',
          200: '#FFAEC9',
          300: '#FA85AC',
          400: '#F05C90',
          500: '#DB3E74',
          600: '#B92C5C',
          700: '#932246',
        },
      },
      fontFamily: {
        display: ['"Outfit Variable"', 'Outfit', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.7rem, 5.4vw, 4.3rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 4.3vw, 3.4rem)', { lineHeight: '1.05', letterSpacing: '-0.028em' }],
        'display-md': ['clamp(1.9rem, 3.4vw, 2.7rem)', { lineHeight: '1.1', letterSpacing: '-0.024em' }],
        'display-sm': ['clamp(1.5rem, 2.2vw, 1.95rem)', { lineHeight: '1.18', letterSpacing: '-0.018em' }],
        eyebrow: ['0.78rem', { lineHeight: '1.1', letterSpacing: '0.1em' }],
        lede: ['clamp(1.08rem, 1.25vw, 1.26rem)', { lineHeight: '1.6' }],
      },
      maxWidth: {
        prose: '66ch',
      },
      borderRadius: {
        card: '1.75rem',
        blob: '2.75rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 2px 4px rgba(74,45,30,0.05), 0 14px 30px -18px rgba(74,45,30,0.25)',
        lift: '0 3px 6px rgba(74,45,30,0.06), 0 28px 50px -26px rgba(74,45,30,0.35)',
        pop: '0 4px 0 0 rgba(133,38,26,0.28)',
      },
      transitionTimingFunction: {
        somos: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
