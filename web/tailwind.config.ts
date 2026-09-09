import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh":     "radial-gradient(at 40% 20%, hsla(248,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(271,100%,77%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(225,100%,70%,0.1) 0px, transparent 50%)",
        "hero-gradient":     "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)",
        "card-gradient":     "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
        "button-gradient":   "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        "gold-gradient":     "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        "text-gradient":     "linear-gradient(135deg, #4338ca 0%, #7c3aed 50%, #6366f1 100%)",
      },
      boxShadow: {
        "glass":    "0 4px 24px -2px rgba(79,70,229,0.12), 0 0 0 1px rgba(79,70,229,0.06)",
        "glow":     "0 0 40px rgba(99,102,241,0.25)",
        "glow-lg":  "0 0 80px rgba(99,102,241,0.3)",
        "gold":     "0 4px 20px rgba(245,158,11,0.3)",
        "lift":     "0 20px 60px -10px rgba(79,70,229,0.3)",
        "card":     "0 2px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(99,102,241,0.08)",
      },
      animation: {
        "float":        "float 6s ease-in-out infinite",
        "pulse-slow":   "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":      "shimmer 2s linear infinite",
        "fade-up":      "fadeUp 0.6s ease-out forwards",
        "gradient-x":   "gradientX 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-16px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
