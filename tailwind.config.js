/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f1',
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
        surface: {
          100: '#1a1a1a',
          200: '#141414',
          300: '#0f0f0f',
          400: '#0a0a0a',
          500: '#050505',
        },
        rank: {
          bronze:      '#cd7f32',
          silver:      '#c0c0c0',
          gold:        '#ffd700',
          platinum:    '#00d4ff',
          diamond:     '#b9f2ff',
          master:      '#9b59b6',
          grandmaster: '#e74c3c',
          challenger:  '#f39c12',
        },
        online:  '#22c55e',
        away:    '#f59e0b',
        offline: '#6b7280',
      },
    },
  },
  plugins: [],
};
