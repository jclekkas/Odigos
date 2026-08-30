import type { Config } from 'tailwindcss';

/**
 * Provisional design tokens.
 *
 * This palette is a *design exploration*, not a recommended final identity.
 * Colour, type and spacing decisions here would be revisited after brand
 * discovery. Every foreground/background pairing used in the prototype was
 * chosen to clear WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text and UI).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutral ground — avoids the clinical feel of pure white.
        canvas: '#FAF7F2',
        surface: '#FFFFFF',
        sunk: '#F2EDE4',
        // Ink: deep navy-charcoal. 15.4:1 on canvas.
        ink: '#141C26',
        'ink-soft': '#3D4854', // 8.6:1 on canvas
        'ink-muted': '#5A6675', // 5.3:1 on canvas
        line: '#E2DACD',
        'line-strong': '#C9BFAE',
        // Restrained blue-green primary.
        primary: {
          DEFAULT: '#0F5560', // 7.6:1 with white
          deep: '#0A3D46',
          hover: '#0B454E',
          tint: '#E3EEEF',
          border: '#9CC0C4',
          // Faint-but-legible: 3.7:1 on canvas, so large decorative type
          // still clears the AA non-text/large-text floor.
          soft: '#4E858C',
        },
        // Single warm secondary, used sparingly for emphasis only.
        accent: {
          DEFAULT: '#9A4416', // 6.4:1 with white
          tint: '#FBEDE4',
          border: '#E0BCA3',
        },
        // Status colours always pair with an icon + text label.
        notice: { DEFAULT: '#7A5300', tint: '#FDF3DC', border: '#E3C77C' },
        success: { DEFAULT: '#1F5B36', tint: '#E6F1E9' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
      },
      fontSize: {
        // Fluid, but always resolves above 16px for body copy.
        'fluid-display': ['clamp(2.25rem, 1.4rem + 3.6vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'fluid-h1': ['clamp(1.9rem, 1.3rem + 2.6vw, 3rem)', { lineHeight: '1.14', letterSpacing: '-0.018em' }],
        'fluid-h2': ['clamp(1.5rem, 1.15rem + 1.5vw, 2.125rem)', { lineHeight: '1.2', letterSpacing: '-0.012em' }],
        'fluid-h3': ['clamp(1.15rem, 1.05rem + 0.5vw, 1.4rem)', { lineHeight: '1.3' }],
        'fluid-lead': ['clamp(1.0625rem, 1rem + 0.5vw, 1.3125rem)', { lineHeight: '1.6' }],
      },
      maxWidth: {
        // ~68 characters — a comfortable measure for sustained reading.
        measure: '38rem',
        shell: '78rem',
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 28, 38, 0.04), 0 6px 16px -10px rgba(20, 28, 38, 0.14)',
        lift: '0 2px 4px rgba(20, 28, 38, 0.05), 0 12px 28px -14px rgba(20, 28, 38, 0.22)',
        overlay: '0 24px 60px -20px rgba(20, 28, 38, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
