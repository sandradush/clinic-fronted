/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#dbe7ff',
          100: '#b8ccff',
          500: '#1d4ed8',
          600: '#1e40af',
          700: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          dark: '#111827',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        xl: '0.875rem',
      },
      boxShadow: {
        card: '0 8px 24px -16px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}