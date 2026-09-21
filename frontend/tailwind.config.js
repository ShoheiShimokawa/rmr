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
    // "dark"はDaisyUI組み込みテーマをそのまま使う(base-100:#1d232a等)。
    // MUI側のパレット(src/theme/appTheme.js)もこれと同じ値に合わせている。
    themes: ["light", "dark"],
    darkTheme: "dark",
    base: false,
    logs: false,
  },
};
