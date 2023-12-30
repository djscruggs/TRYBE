/** @type {import('tailwindcss').Config} */
const colors = require('@mui/material/colors')

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors
      },
    },
  },
  plugins: [],
}

