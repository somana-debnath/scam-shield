/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        primary: { DEFAULT: token('primary'), soft: token('primary-soft'), ink: token('primary-ink') },
        safe: { DEFAULT: token('safe'), soft: token('safe-soft'), ink: token('safe-ink'), on: token('safe-on') },
        scam: { DEFAULT: token('scam'), soft: token('scam-soft'), ink: token('scam-ink'), on: token('scam-on') },
        sun: { DEFAULT: token('sun'), soft: token('sun-soft') },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px -6px rgb(var(--shadow) / 0.14)',
        lift: '0 2px 4px rgb(var(--shadow) / 0.06), 0 20px 48px -12px rgb(var(--shadow) / 0.28)',
        phone: '0 0 0 2px rgb(var(--shadow) / 0.08), 0 40px 80px -20px rgb(var(--shadow) / 0.45)',
      },
    },
  },
  plugins: [],
};
