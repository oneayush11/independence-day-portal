/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        indiawhite: "#FFFFFF",
        indiagreen: "#138808",
        navy: "#0B2545",
        chakra: "#000080",
        cream: "#FFF8EC",
        gold: "#FFD700",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(255,153,51,0.55)",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeSlide: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        wave: "wave 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        fadeSlide: "fadeSlide 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
