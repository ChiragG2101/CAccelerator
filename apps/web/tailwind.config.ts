import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: {
          0: '#070A13',
          1: '#0D1324',
          2: '#151D34',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
        info: '#06B6D4',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 8, 23, 0.28)',
      },
    },
  },
  plugins: [],
}

export default config
