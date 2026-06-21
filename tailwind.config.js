/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#FF385C',
        'brand-dark': '#e0314f',
        // Semantic tokens backed by CSS variables — automatically switch in dark mode
        dark:    'rgb(var(--color-dark)    / <alpha-value>)',
        muted:   'rgb(var(--color-muted)   / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border:  'rgb(var(--color-border)  / <alpha-value>)',
        bg:      'rgb(var(--color-bg)      / <alpha-value>)',
        card:    'rgb(var(--color-card)    / <alpha-value>)',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
