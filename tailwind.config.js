/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        // Her er våre 10 meny-fonter:
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'playfair': ['"Playfair Display"', 'serif'],
        'cormorant': ['"Cormorant Garamond"', 'serif'],
        'dancing': ['"Dancing Script"', 'cursive'],
        'alex': ['"Alex Brush"', 'cursive'],
        'cinzel': ['"Cinzel"', 'serif'],
        'lora': ['"Lora"', 'serif'],
        'montserrat': ['"Montserrat"', 'sans-serif'],
        'oswald': ['"Oswald"', 'sans-serif'],
        'pinyon': ['"Pinyon Script"', 'cursive'],
      }
    },
  },
  plugins: [],
}