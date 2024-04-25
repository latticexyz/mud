import { animate } from "./tailwindcss-plugins/animate";
import { borderGradient } from "./tailwindcss-plugins/borderGradient";
import { gridDivideFix } from "./tailwindcss-plugins/gridDivideFix";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [animate, borderGradient, gridDivideFix],
  darkMode: ["selector", ['[data-theme="dark"]']],
};
