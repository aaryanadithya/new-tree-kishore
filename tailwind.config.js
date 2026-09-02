/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2196F3",
          dark: "#1976d2",
          light: "#64b5f6",
        },
        secondary: {
          DEFAULT: "#673ab7",
          light: "#7c4dff",
        },
        accent: "#e91e63",
        surname: "#ff9800",
        success: "#4CAF50",
        danger: "#f44336",
        warning: "#ff9800",
        info: "#00bcd4",
      },
      boxShadow: {
        card: "0 6px 24px rgba(0, 0, 0, 0.10)",
        "card-lg": "0 12px 48px rgba(0, 0, 0, 0.15)",
        glow: "0 0 40px rgba(33, 150, 243, 0.25)",
      },
      animation: {
        shimmer: "shimmerBorder 4s ease-in-out infinite",
        pulseIcon: "pulseIcon 2.8s ease-in-out infinite",
        scaleIn: "scaleIn 0.15s cubic-bezier(0.34,1.56,0.64,1)",
        slideUp: "slideUp 0.3s ease",
      },
      keyframes: {
        shimmerBorder: {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "200% 0%" },
        },
        pulseIcon: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.15) rotate(5deg)" },
        },
        scaleIn: {
          from: { transform: "scale(0.9)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
