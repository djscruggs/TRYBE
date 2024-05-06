/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const colors = require('tailwindcss/colors')
module.exports = withMT({
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: ['class', '[data-mode="dark"]'],
  mode: 'jit',
  theme: {
    
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: colors.white,
        gray: colors.slate,
        green: colors.emerald,
        purple: colors.violet,
        pink: colors.fuchsia,
        black: colors.black,
        red: '#EC5F5C',
        darkgrey: '#5F5F5F',
        yellow: '#FDC94C',
        blue: '#3295B7',
        grey: '#C4C4C4',
        salmon: '#EEAA94'
      }
    },
  },
  plugins: [],
})