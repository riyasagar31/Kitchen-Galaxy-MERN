export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff5252',
        'primary-hover': '#ff1744', // Darker/richer shade for hover
      }
    },
  },
  plugins: [],
}
