/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Carrusel del Dashboard
      keyframes: {
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 250ms ease-out",
        "slide-in-left": "slide-in-left 250ms ease-out",
      },
    },
  },
  plugins: [],
};


