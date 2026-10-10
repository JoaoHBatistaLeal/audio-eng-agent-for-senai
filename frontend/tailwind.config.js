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
          'slate-dark': '#2c3345',
          'slate-deep': '#1a1f2c',
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
