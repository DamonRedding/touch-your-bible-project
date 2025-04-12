/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        secondary: "#5856D6",
        success: "#34C759",
        danger: "#FF3B30",
        warning: "#FF9500",
        info: "#5AC8FA",
        light: "#F2F2F7",
        dark: "#1C1C1E"
      },
      fontFamily: {
        sans: ["System"]
      }
    }
  },
  important: true,
  plugins: []
} 