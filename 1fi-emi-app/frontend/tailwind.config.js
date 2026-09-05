/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161A23",
        paper: "#EEF1F6",
        surface: "#FFFFFF",
        brand: {
          DEFAULT: "#1B2A6B",
          light: "#3C4E9E",
        },
        savings: {
          DEFAULT: "#1E8F6F",
          soft: "#E4F3EE",
        },
        highlight: {
          DEFAULT: "#E2A63B",
          soft: "#FBF1DD",
        },
        line: "#DCE1E9",
        muted: "#6B7280",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
