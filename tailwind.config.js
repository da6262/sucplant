/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./dist-web/*.html",
    "./js/**/*.js",
    "./dist-web/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Noto Sans KR', 'sans-serif']
      }
    },
  },
  plugins: [],
}


