/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "var(--pip-bg)",
          1: "var(--pip-surface-1)",
          2: "var(--pip-surface-2)",
          3: "var(--pip-surface-3)",
          4: "var(--pip-surface-4)",
          5: "var(--pip-surface-5)",
        },
        border: {
          DEFAULT: "var(--pip-border)",
          light: "var(--pip-border-light)",
        },
        accent: {
          DEFAULT: "var(--pip-accent)",
          hover: "var(--pip-accent-hover)",
          pressed: "var(--pip-accent-pressed)",
          muted: "var(--pip-glow)",
        },
        ink: "var(--pip-ink)",
        sky: "var(--pip-sky)",
        ok: "var(--pip-green)",
        rad: "var(--pip-amber)",
        pip: {
          green: "var(--pip-green)",
          dim: "var(--pip-dim)",
          dark: "var(--pip-dark)",
          glow: "var(--pip-glow)",
          amber: "var(--pip-amber)",
          red: "var(--pip-crit)",
          cream: "var(--pip-primary)",
        },
      },
      fontFamily: {
        display: ["var(--pip-font-display)"],
        heading: ["var(--pip-font-heading)"],
        sans: ["var(--pip-font-heading)"],
        mono: ["var(--pip-font-data)"],
      },
      transitionTimingFunction: {
        vault: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pip-pulse": "pipPulse 1.6s infinite",
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
        pipPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
