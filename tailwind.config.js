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
        penguin: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          beak: '#f97316',
          blush: '#fda4af'
        },
        kuromi: {
          dark: '#0e0c15',
          darker: '#08070d',
          surface: '#181424',
          surfaceHover: '#231d36',
          border: '#352b52',
          purple: '#9333ea',
          lightPurple: '#c084fc',
          pink: '#f43f5e',
          hotPink: '#ec4899',
          lilac: '#fae8ff',
          skull: '#f1f5f9'
        }
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        }
      }
    },
  },
  plugins: [],
}
