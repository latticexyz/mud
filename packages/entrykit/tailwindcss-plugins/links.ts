import plugin from "tailwindcss/plugin";

// See https://github.com/tailwindlabs/tailwindcss/issues/13400

export const links = plugin(function ({ addVariant }) {
  addVariant("links", "& a[href]:not(.links-unset)");
  addVariant("links", "& a[role='button']");
});
