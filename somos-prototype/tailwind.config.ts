import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral base — soft cream and white, the ground the logo sits on.
        cream: {
          50: '#FFFDF7',
          100: '#FFF8E9',
          200: '#FFF0D6',
          300: '#FBE5BE',
        },
        ink: {
          DEFAULT: '#242C2E',
          muted: '#56605F',
          soft: '#68726F',
        },
        // PRIMARY — the green of the SOMOS wordmark.
        grass: {
          50: '#E9F9F0',
          100: '#CBF0DC',
          200: '#93E2B8',
          300: '#55CE90',
          400: '#22B96F',
          500: '#16A360',
          600: '#0F8347',
          700: '#0B6537',
        },
        // SECONDARY — the blue of "EARLY LEARNING".
        sky: {
          50: '#EAF4FC',
          100: '#CFE6F8',
          200: '#9CCBEF',
          300: '#62ABE1',
          400: '#338FD1',
          500: '#1C74BB',
          600: '#175E99',
          700: '#124876',
        },
        // The icons in the heart: lightbulb yellow, apple red, star pink,
        // star purple, palette teal.
        sun: {
          50: '#FFFAE6',
          100: '#FFF2C2',
          200: '#FFE68C',
          300: '#FFD852',
          400: '#FFC81F',
          500: '#EDB300',
          600: '#B08205',
          700: '#8A6605',
        },
        coral: {
          50: '#FFEEF0',
          100: '#FFD8DD',
          200: '#FFAAB5',
          300: '#F87A8A',
          400: '#EE5165',
          500: '#E23B4E',
          600: '#C02338',
          700: '#99182A',
        },
        berry: {
          50: '#FFEFF8',
          100: '#FFD8ED',
          200: '#FCACD7',
          300: '#F480C0',
          400: '#E5449B',
          500: '#D12F87',
          600: '#AE216D',
          700: '#8B1856',
        },
        grape: {
          50: '#F6EFFA',
          100: '#EADBF2',
          200: '#D2AFE4',
          300: '#B681CF',
          400: '#9B5FBA',
          500: '#8A47A8',
          600: '#703889',
          700: '#5A2C6E',
        },
        teal: {
          50: '#E7F8F6',
          100: '#C6EFEA',
          200: '#8CDFD6',
          300: '#52CCC0',
          400: '#2FB6A8',
          500: '#219C90',
          600: '#187E74',
          700: '#13635B',
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
        soft: '0 2px 4px rgba(36,44,46,0.05), 0 14px 30px -18px rgba(36,44,46,0.22)',
        lift: '0 3px 6px rgba(36,44,46,0.06), 0 28px 50px -26px rgba(36,44,46,0.3)',
        pop: '0 4px 0 0 rgba(11,101,55,0.32)',
      },
      transitionTimingFunction: {
        somos: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
