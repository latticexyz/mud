
import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/day",
        destination: "https://latticexyz.notion.site/MUD-DAY-AT-DEVCON-14-Nov-e62e5f83b8764b4eaf7b0d85f4ad03d5",
        permanent: false,
      },
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
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/players-and-movement",
        destination: "/guides/emojimon/3-players-and-movement",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/map-and-terrain",
        destination: "/guides/emojimon/4-map-and-terrain",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/a-wild-emojimon-appears",
        destination: "/guides/emojimon/5-a-wild-emojimon-appears",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/make-it-multiplayer",
        destination: "/guides/emojimon/6-advanced#make-it-multiplayer",
        permanent: false,
      },
      {
        source: "/tutorials/emojimon/deploy-to-testnet",
        destination: "/cli/deploy",
        permanent: false,
      },
      {
        source: "/tutorials/minimal",
        destination: "/guides/hello-world",
        permanent: false,
      },
      {
        source: "/tutorials/minimal/add-table",
        destination: "/guides/hello-world/add-table",
        permanent: false,
      },
      {
        source: "/tutorials/minimal/add-system",
        destination: "/guides/hello-world/add-system",
        permanent: false,
      },
      {
        source: "/tutorials/minimal/deploy",
        destination: "/cli/deploy",
        permanent: false,
      },
      {
        source: "/tutorials/walkthrough/minimal-onchain",
        destination: "/templates/typescript/contracts",
        permanent: false,
      },
      {
        source: "/reference",
        destination: "/",
        permanent: false,
      },
      {
        source: "/cli/config",
        destination: "/config",
        permanent: false,
      },
      {
        source: "/guides/extending-world",
        destination: "/guides/extending-a-world",
        permanent: false,
      },
      {
        source: "/templates/typescript/getting-started",
        destination: "/quickstart",
        permanent: false,
      },
      {
        source: "/templates/typescript/three",
        destination: "/templates/typescript/threejs",
        permanent: false,
      },
      {
        source: "/hello-world",
        destination: "/guides/hello-world",
        permanent: false,
      },
      {
        source: "/references/store",
        destination: "/store/reference/store",
        permanent: false,
      },
      {
        source: "/references/store-core",
        destination: "/store/reference/store-core",
        permanent: false,
      },
      {
        source: "/store/how-mud-models-data",
        destination: "/store/data-model",
        permanent: false,
      },
      {
        source: "/store/table-hooks",
        destination: "/store/store-hooks",
        permanent: false,
      },
      {
        source: "/guides/best-practices/dividing-into-systems",
        destination: "/best-practices/dividing-into-systems",
        permanent: false,
      },
      {
        source: "/guides/best-practices/system-best-practices",
        destination: "/best-practices/system",
        permanent: false,
      },
      {
        source: "/guides/best-practices/deployment-settings",
        destination: "/best-practices/deployment-settings",
        permanent: false,
      },
      {
        source: "/guides/best-practices/kms",
        destination: "/best-practices/aws-kms",
        permanent: false,
      },
      {
        source: "/services/indexer/postgres-decoded",
        destination: "/indexer/postgres-decoded",
        permanent: false,
      },
      {
        source: "/services/indexer/postgres-event-only",
        destination: "/indexer/postgres-event-only",
        permanent: false,
      },
      {
        source: "/services/indexer/sqlite-indexer",
        destination: "/indexer/sqlite",
        permanent: false,
      },
      {
        source: "/services/indexer/using-indexer",
        destination: "/indexer/using",
        permanent: false,
      },
      {
        source: "/services/indexer",
        destination: "/indexer",
        permanent: false,
      },
    ];
  },
});
