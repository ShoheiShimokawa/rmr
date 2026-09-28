/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        soft: ["Nunito sans", "Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    // "dark"はDaisyUI組み込みテーマではなく、無彩色寄りのグレー基調にしたカスタムテーマ。
    // base-100/200/300はMUI側のパレット(src/theme/appTheme.js)と同じ値に合わせている。
    themes: [
      "light",
      {
        dark: {
          "color-scheme": "dark",
          "base-100": "#171717",
          "base-200": "#101010",
          "base-300": "#0a0a0a",
          "base-content": "#e5e5e5",
          primary: "#ffffff",
          "primary-content": "#0a0a0a",
          secondary: "#a3a3a3",
          "secondary-content": "#0a0a0a",
          accent: "#a3a3a3",
          "accent-content": "#0a0a0a",
          neutral: "#1f1f1f",
          "neutral-content": "#d4d4d4",
          info: "#8a8a8a",
          "info-content": "#0a0a0a",
          success: "#4ade80",
          "success-content": "#052e12",
          warning: "#fbbf24",
          "warning-content": "#451a03",
          error: "#f87171",
          "error-content": "#450a0a",
        },
      },
    ],
    darkTheme: "dark",
    base: false,
    logs: false,
  },
};
