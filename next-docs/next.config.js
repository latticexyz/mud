import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
  async redirects() {
    return [
      {
        source: "/what-is-mud",
        destination: "/introduction",
        permanent: true,
      },
    ];
  },
});
