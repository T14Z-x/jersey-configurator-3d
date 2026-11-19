/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        athletic: ['Oswald', 'Impact', 'sans-serif'],
        varsity: ['Graduate', 'Georgia', 'serif'],
        condensed: ['Bebas Neue', 'Impact', 'sans-serif'],
        script: ['Pacifico', 'cursive'],
      },
      colors: {
        brand: {
          50: '#fdf2f4',
          100: '#fce7eb',
          500: '#a81c36',
          600: '#800020',
          700: '#640019',
          900: '#3b000f',
        },
      },
    },
  },
  plugins: [],
};
