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
        primary: '#0f172a',
        accent: '#0ea5e9'
      }
    }
  },
  plugins: []
};
