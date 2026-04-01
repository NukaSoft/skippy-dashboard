/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0b1a0b",
          1: "#0d1f0d",
          2: "#112811",
          3: "#1a3a1a",
          4: "#1f4a1f",
          5: "#255a25",
        },
        border: {
          DEFAULT: "#1a3a1a",
          light: "#255a25",
        },
        accent: {
          DEFAULT: "#18FF62",
          hover: "#7fff7f",
          muted: "rgba(24, 255, 98, 0.15)",
        },
        pip: {
          green: "#18FF62",
          dim: "#0bae0f",
          dark: "#0d2a0d",
          glow: "rgba(24, 255, 98, 0.25)",
          amber: "#FFB642",
          red: "#ff3333",
        },
      },
      fontFamily: {
        heading: ["Monofonto", "Share Tech Mono", "Courier New", "monospace"],
        sans: ["Roboto Mono", "JetBrains Mono", "Consolas", "monospace"],
        mono: ["Roboto Mono", "JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "text-glow": "textGlow 4s ease-in-out infinite",
        "pip-pulse": "pipPulse 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        textGlow: {
          "0%, 100%": { textShadow: "0 0 4px rgba(24, 255, 98, 0.4)" },
          "50%": { textShadow: "0 0 10px #18FF62, 0 0 20px rgba(24, 255, 98, 0.25)" },
        },
        pipPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
