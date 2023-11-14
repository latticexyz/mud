import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-supply-mono)"],
      },
      colors: {
        // #FF7612
        mud: "rgb(255, 118, 18)",
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
};

export default config;
