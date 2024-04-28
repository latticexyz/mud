import plugin from "tailwindcss/plugin";

// See https://github.com/tailwindlabs/tailwindcss/issues/13400

export const gridDivideFix = plugin(function ({ addComponents }) {
  addComponents({
    // TODO: more column/divide sizes (https://tailwindcss.com/docs/plugins#dynamic-variants)
    ".grid-cols-2.divide-y": {
      // this selector is to achieve higher specificity than the divide one, but is gross
      // TODO: make this better
      // TODO: can we do this with vars instead of unsetting a property here?
      "& > :not([hidden]) ~ :not([hidden]):nth-child(-n + 2)": {
        borderTopWidth: "0",
        borderBottomWidth: "0",
      },
    },
  });
});
