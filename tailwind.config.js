/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-purple-800',
    '!bg-purple-800',
    '!bg-opacity-100',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
