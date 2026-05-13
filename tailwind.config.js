/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette — cyberpunk dark red
        brand: {
          50: '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff2b2b',
          600: '#ed1515',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
          950: '#4b0404',
        },
        // Surface system
        surface: {
          50: '#f5f5f5',
          100: '#1a1a1a',
          200: '#141414',
          300: '#0f0f0f',
          400: '#0a0a0a',
          500: '#050505',
        },
        // Rank colors
        rank: {
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          platinum: '#00d4ff',
          diamond: '#b9f2ff',
          master: '#9b59b6',
          grandmaster: '#e74c3c',
          challenger: '#f39c12',
        },
        // Status colors
        online: '#22c55e',
        away: '#f59e0b',
        offline: '#6b7280',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['JetBrainsMono', 'Courier'],
        display: ['Rajdhani', 'System'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #c80d0d 0%, #4b0404 100%)',
        'dark-gradient': 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
        'card-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        brand: '0 0 20px rgba(200, 13, 13, 0.3)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 0 40px rgba(200, 13, 13, 0.15)',
      },
    },
  },
  plugins: [],
};
