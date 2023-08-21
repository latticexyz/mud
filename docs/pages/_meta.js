import worldPackageJson from "../../packages/world/package.json" assert { type: "json" };

export default {
  index: "Overview",
  introduction: "Introduction",
  "quick-start": "Quickstart",
  "what-is-mud": "What is MUD?",
  store: "Store",
  world: "World",
  "client-side": "MUD client",
  indexer: "Indexer",
  "other-env": "Tooling for other environments",
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
