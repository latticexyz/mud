const nextra = require("nextra");

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = withNextra({
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: "/what-is-mud",
        destination: "/introduction",
        permanent: false,
      },
      {
        source: "/quick-start",
        destination: "/quickstart",
        permanent: false,
      },
      {
        source: "/store",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/installation",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/reading-and-writing",
        destination: "/store/table-libraries#reading-data",
        permanent: false,
      },
      {
        source: "/store/config",
        destination: "/store/table-libraries#config",
        permanent: false,
      },
      {
        source: "/store/advanced-features",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/indexing",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/spec",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/gas-efficiency",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/using-without-world",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/store/internals",
        destination: "/store/introduction",
        permanent: false,
      },
      {
        source: "/world",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/world/world-101",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/world/config",
        destination: "/cli/config",
        permanent: false,
      },
      {
        source: "/world/deployer",
        destination: "/cli/deploy",
        permanent: false,
      },
      {
        source: "/world/subsystems",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/world/community-computers",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/world/querying",
        destination: "/state-query/introduction",
        permanent: false,
      },
      {
        source: "/world/internals",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/client-side",
        destination: "/state-query/typescript/recs",
        permanent: false,
      },
      {
        source: "/indexer",
        destination: "/services/indexer",
        permanent: false,
      },
      {
        source: "/cli",
        destination: "/cli/tablegen",
        permanent: false,
      },
      {
        source: "/ecs",
        destination: "/guides/emojimon/1-preface-the-ecs-model",
        permanent: false,
      },
      {
        source: "/plugins",
        destination: "/world/introduction",
        permanent: false,
      },
      {
        source: "/tutorials",
        destination: "/guides/hello-world",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon",
        destination: "/guides/emojimon",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/preface-the-ecs-model",
        destination: "/guides/emojimon/1-preface-the-ecs-model",
        permanent: false,
      },
    ];
  },
});
