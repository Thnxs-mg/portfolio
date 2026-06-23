/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './constants.ts',
  ],
  theme: {
    extend: {
      colors: {
        cvDark: '#151621',
        cvAccent: '#b8b2b0',
        cvRed: '#E74C3C',
        cvGrey: '#BDC3C7',
      },
    },
  },
  plugins: [],
};
