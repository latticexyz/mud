import { animate } from "./tailwindcss-plugins/animate";
import { mauve, violet } from "@radix-ui/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...mauve,
        ...violet,
      },
    },
  },
  plugins: [animate],
};
