import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        ink: "#0a0a0b",
        panel: "#121214",
        line: "#2a2a2e",
        muted: "#8a8a93",
        accent: "#c4a574",
      },
    },
  },
  plugins: [],
} satisfies Config;
