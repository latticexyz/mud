/** @type {import('tailwindcss').Config} */
export default {
  important: "#mud-dev-tools",
  corePlugins: {
    // We include this manually so we can prefix it
    preflight: false,
  },
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
