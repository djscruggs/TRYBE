/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      red: '#EC5F5C',
      darkgrey: '#5F5F5F',
      yellow: '#FDC94C',
      blue: '#3295B7',
      grey: '#C4C4C4'
    }
  },
  plugins: [],
})