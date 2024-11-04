import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-basier-circle)"],
        mono: ["var(--font-supply-mono)"],
        "mono-secondary": ["var(--font-berkeley-mono)"],
      },
      fontSize: {
        // TODO: set based on media queries
        sm: ["18px", "24px"],
        md: ["22px", "31px"],
        xl: ["33px", "40px"],
        "2xl": ["44px", "54px"],
      },
      colors: {
        mud: "#ff7612",
        "mud-dark": "#e56a10",
        "light-gray": "#1a1a1a",
      },
    },
  },
  plugins: [require("./src/tailwindcss-plugins/animate")],
};

export default config;
