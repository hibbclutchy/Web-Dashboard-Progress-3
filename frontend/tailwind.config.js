/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18372a',
        canvas: '#f5f9f6',
        navy: '#092418',
        lavender: '#e4f6eb',
      },
      boxShadow: { soft: '0 18px 45px rgba(22, 81, 51, .08)' },
    },
  },
  plugins: [],
}