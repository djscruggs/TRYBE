/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const colors = require('tailwindcss/colors')
module.exports = withMT({
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: ['class', '[data-mode="dark"]'],
  mode: 'jit',
  theme: {
    
    extend: {
      fontFamily: {
        'sans': ['Source Sans Pro', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
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
        yellow: '#F5C44E',
        blue: '#3295B7',
        grey: '#C4C4C4',
        salmon: '#EEAA94',
        teal: '#1A525C'
      },
      opacity: {
        '01': '.01',
        '02': '.02',
        '03': '.03',
        '04': '.04',
        '05': '.05',
        '06': '.06',
        '07': '.07',
        '08': '.08',
        '09': '.09',
      }
    },
  },
  
  plugins: [],
})