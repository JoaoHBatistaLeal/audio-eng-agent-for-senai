/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          slate: '#8895b3',
          lilac: '#f8f1ff',
          bone: '#ece2d0',
          canvas: '#FBF9FF',
          cream: '#EDEAD0'
        }
      }
    },
  },
  plugins: [],
}
