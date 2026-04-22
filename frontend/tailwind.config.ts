import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090c10",
        panel: "#0f141b",
        panelAlt: "#111a23",
        line: "#1d2632",
        text: "#e7edf3",
        muted: "#8d9aac",
        accent: "#2ec4b6",
        danger: "#ff6b6b"
      },
      boxShadow: {
        soft: "0 14px 45px rgba(0,0,0,0.34)"
      }
    }
  },
  plugins: []
};

export default config;
