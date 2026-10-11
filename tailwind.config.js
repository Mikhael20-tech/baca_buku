/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'Literata', 'Lora', 'serif'],
      },
      colors: {
        sepia: {
          50: '#fcfbf7',
          100: '#fbf7ed',
          200: '#f3e8ce',
          800: '#533f28',
          900: '#3c2f21',
        }
      }
    },
  },
  plugins: [],
}
