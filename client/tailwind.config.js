/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-top': 'linear-gradient(0deg, #00AFB9, #0081A7, #BEB2C8, #D7D6D6, #020202)',
        'gradient-right': 'linear-gradient(90deg, #00AFB9, #0081A7, #BEB2C8, #D7D6D6, #020202)',
        'gradient-bottom': 'linear-gradient(180deg, #00AFB9, #0081A7, #BEB2C8, #D7D6D6, #020202)',
        'gradient-left': 'linear-gradient(270deg, #00AFB9, #0081A7, #BEB2C8, #D7D6D6, #020202)',
        'gradient-radial': 'radial-gradient(#00AFB9, #0081A7, #BEB2C8, #D7D6D6, #020202)',
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'heading': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
}
