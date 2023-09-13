import worldPackageJson from "../../packages/world/package.json" assert { type: "json" };

export default {
  index: "Overview",
  introduction: "Introduction",
  "what-is-mud": "What is MUD?",
  "quick-start": "Quickstart",
  store: "Store",
  world: "World",
  client: "MUD client",
  indexer: "Indexer",
  cli: "CLI",
  ecs: "ECS and MUD",
  plugins: "Plugins",
  tutorials: "Tutorials",
  reference: "Reference",
  contribute: "Contribute",
  changelog: "Changelog",
  version: {
    title: worldPackageJson.version,
    type: "menu",
    items: {
      changelog: {
        title: "Changelog",
        href: "/changelog",
      },
      contribute: {
        title: "Contribute",
        href: "/contribute",
      },
    },
  },
  status: {
    title: "Status",
    type: "page",
    href: "https://status.mud.dev",
    newWindow: true,
  },
  community: {
    title: "Community",
    type: "page",
    href: "https://community.mud.dev",
    newWindow: true,
  },
  twitter: {
    title: "Twitter",
    type: "page",
    href: "https://twitter.com/latticexyz",
    newWindow: true,
  },
  discord: {
    title: "Discord",
    type: "page",
    href: "https://lattice.xyz/discord",
    newWindow: true,
  },
};
