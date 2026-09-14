import type { Config } from 'tailwindcss';

// Design tokens for LzgPaw. Colors are fixed by brand guidelines —
// see README.md "Design system" for how each one is meant to be used.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#173F35', // primary brand color — headers, footer, trust/authority
          50: '#EDF2F0',
          100: '#D3E0DA',
          400: '#2E5F51',
          600: '#173F35',
          700: '#102B24',
          900: '#0B1E19',
        },
        cream: '#F8F6F0', // warm off-white — primary page background
        sage: '#DDE9DF', // soft sage — section backgrounds, subtle dividers
        clay: {
          DEFAULT: '#E88B3A', // conversion orange — CTAs only (Add to Cart, Shop Now)
          600: '#D67A2B',
          700: '#B8631F',
        },
        ink: '#17211E', // dark text
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 33, 30, 0.06), 0 8px 24px rgba(23, 63, 53, 0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
