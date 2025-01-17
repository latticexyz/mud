import { Config } from "tailwindcss/types/config";

export default {
  content: ["./**/*.{html,js,jsx,ts,tsx}", "!./node_modules"],
  theme: {},
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
