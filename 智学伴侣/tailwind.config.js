/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#D4AF37", // Gold as primary
        secondary: "#111111", // Dark as secondary
        "black-main": "#050505",
        "black-card": "#121212",
        "black-light": "#1E1E1E",
        "gold-300": "#F4C430",
        "gold-400": "#EBC75E",
        "gold-500": "#D4AF37",
        "gold-600": "#AA8C2C",
        warning: "#F59E0B",
        danger: "#EF4444",
        "tech-blue": "#2563EB",
        "success-green": "#10B981",
        "warning-orange": "#F59E0B",
        "error-red": "#EF4444",
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F4C430 0%, #D4AF37 50%, #AA8C2C 100%)',
        'black-gradient': 'linear-gradient(to bottom, #1a1a1a, #000000)',
      },
      fontFamily: {
        sans: ["Inter", "Source Han Sans CN", "sans-serif"],
      },
    },
  },
  plugins: [],
};
