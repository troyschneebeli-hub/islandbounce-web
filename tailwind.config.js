/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E2A29",
        sea: "#0B4F4A",
        seaDeep: "#062F2C",
        sand: "#F0E7D3",
        coral: "#FF6B4D",
        coralDeep: "#E5522F",
        brass: "#C9A227",
        foam: "#E4F0EB",
        foamLine: "#BFD8CF",
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
