const themeConfig = require('./config/theme.config.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './src/components/**/*.{astro,js,jsx,ts,tsx}',
    './src/pages/**/*.{astro,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: themeConfig.palette.primary,
        accent: themeConfig.palette.accent,
        background: themeConfig.palette.background,
        surface: themeConfig.palette.surface,
        text: themeConfig.palette.text,
        'primary-dark': themeConfig.paletteDark?.primary ?? '#e0e7ff',
        'accent-dark': themeConfig.paletteDark?.accent ?? '#38bdf8',
        'background-dark': themeConfig.paletteDark?.background ?? '#0b1220',
        'surface-dark': themeConfig.paletteDark?.surface ?? '#0f172a',
        'text-dark': themeConfig.paletteDark?.text ?? '#e5e7eb'
      }
    }
  },
  plugins: []
};
