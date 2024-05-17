/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      background: {
        primary: '#191919',
        secondary: '#000000'
      },
      t: {
        primary: '#FFFFFF',
        secondary: '#A9A9A9',
        tertiary: '#191919'
      },
      bt: {
        primary: "#13DD63",
        secondary: "#37ed7f"
      }
    },
    extend: {

    },
  },
  plugins: [],
}