import { animate } from "./tailwindcss-plugins/animate";
import { borderGradient } from "./tailwindcss-plugins/borderGradient";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [animate, borderGradient],
  darkMode: ["selector", ['[data-theme="dark"]']],
};
