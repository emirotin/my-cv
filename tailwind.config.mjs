/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        zoomAndRotate1: {
          "0%": {
            transform: "scale(1) rotateZ(0)",
            opacity: "1",
          },
          "50%, 100%": {
            transform: "scale(0) rotateZ(359deg)",
            opacity: "0.25",
          },
        },
        zoomAndRotate2: {
          "0%, 50%": {
            transform: "scale(0) rotateZ(359deg)",
            opacity: "0.25",
          },
          "100%": {
            transform: "scale(1) rotateZ(0)",
            opacity: "1",
          },
        },
      },
      animation: {
        tail: "zoomAndRotate1 10s alternate infinite ease-in",
        wind: "zoomAndRotate2 10s alternate infinite ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
