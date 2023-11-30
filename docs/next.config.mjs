import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
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
      {
        source: "/tutorials/emojimon/getting-started",
        destination: "/guides/emojimon/2-getting-started",
        permanent: false
      },
      {
        source: "/tutorials/emojimon/players-and-movement",
        destination: "/guides/emojimon/3-players-and-movement",
        permanent: false
      },      
      {
        source: "/tutorials/emojimon/map-and-terrain",
        destination: "/guides/emojimon/4-map-and-terrain",
        permanent: false
      },
      {
        source: "/tutorials/emojimon/a-wild-emojimon-appears",
        destination: "/guides/emojimon/5-a-wild-emojimon-appears",
        permanent: false
      },      
      {
        source: "/tutorials/emojimon/make-it-multiplayer",
        destination: "/guides/emojimon/6-advanced#make-it-multiplayer",
        permanent: false
      },
      {
        source: "/tutorials/emojimon/deploy-to-testnet",
        destination: "/cli/deploy",
        permanent: false
      },      
      {
        source: "/tutorials/minimal",
        destination: "/guides/hello-world",
        permanent: false
      },
      {
        source: "/tutorials/minimal/add-table",
        destination: "/guides/hello-world/add-table",
        permanent: false
      },      
      {
        source: "/tutorials/minimal/add-system",
        destination: "/guides/hello-world/add-system",
        permanent: false
      },
      {
        source: "/tutorials/minimal/deploy",
        destination: "/cli/deploy",
        permanent: false
      },      
      {
        source: "/tutorials/walkthrough/minimal-onchain",
        destination: "/templates/typescript/contracts",
        permanent: false
      },
      {
        source: "/reference",
        destination: "/",
        permanent: false
      },
    ];
  },
});
