const themeConfig = require('./config/theme.config.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
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
        text: themeConfig.palette.text
      }
    }
  },
  plugins: []
};
