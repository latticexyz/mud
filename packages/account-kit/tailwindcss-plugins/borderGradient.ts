import plugin from "tailwindcss/plugin";

export const borderGradient = plugin(function ({ addUtilities }) {
  addUtilities({
    "@property --tw-border-gradient-angle": {
      syntax: "'<angle>'",
      inherits: "true",
      initialValue: "0deg",
    },
    "@property --tw-conic-gradient-angle": {
      syntax: "'<angle>'",
      inherits: "true",
      initialValue: "0deg",
    },
    "@keyframes border-gradient": {
      to: { "--tw-border-gradient-angle": "360deg" },
    },
    ".border-gradient": {
      borderColor: "transparent",
      background: `
        padding-box linear-gradient(
          var(--tw-gradient-from),
          var(--tw-gradient-from)
        ),
        border-box conic-gradient(
          from var(--tw-border-gradient-angle),
          var(--tw-gradient-from),
          var(--tw-gradient-to),
          var(--tw-gradient-from)
        )
      `,
      // background: `
      //   padding-box linear-gradient(
      //     var(--tw-gradient-from),
      //     var(--tw-gradient-from)
      //   ),
      //   border-box linear-gradient(
      //     var(--tw-border-gradient-angle),
      //     var(--tw-gradient-from),
      //     var(--tw-gradient-to)
      //   )
      // `,
      animation: "border-gradient 2s linear infinite",
    },
  });
});
