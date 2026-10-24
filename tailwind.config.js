/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#EDF4EE",
        navy: { DEFAULT: "#12294A", 50: "#F1F4F9", 100: "#DCE4F0", 200: "#B7C5DD", 600: "#1D3C6B", 700: "#16315A", 800: "#12294A", 900: "#0C1D36" },
        mint: { DEFAULT: "#3DBE8F", 50: "#EEF9F4", 100: "#D9F2E7", 200: "#B5E5D0", 500: "#3DBE8F", 600: "#2FA478", 700: "#26835F" },
      },
      fontFamily: { sans: ["var(--font-jakarta)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(18,41,74,.04), 0 12px 32px -12px rgba(18,41,74,.14)" },
    },
  },
  plugins: [],
};
