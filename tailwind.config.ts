import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CrisisSwarm Azure-inspired dark theme
        'cs-dark': {
          50: '#F5F7FA',
          100: '#E8EEF5',
          200: '#D1DEEB',
          300: '#B9CEE1',
          400: '#A1BED7',
          600: '#0B1220',
          700: '#080D17',
          800: '#05080E',
          900: '#030506',
        },
        'cs-blue': {
          400: '#00C2FF',
          500: '#0078D4',
          600: '#0063B1',
        },
        'cs-accent': {
          success: '#22C55E',
          danger: '#FF4D4D',
          warning: '#FFA500',
        },
      },
      backgroundColor: {
        'glass': 'rgba(11, 18, 32, 0.5)',
        'glass-light': 'rgba(11, 18, 32, 0.3)',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 120, 212, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 194, 255, 0.2)',
        'glow-sm': '0 0 10px rgba(0, 120, 212, 0.15)',
      },
      borderRadius: {
        'glass': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
