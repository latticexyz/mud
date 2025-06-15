import worldPackageJson from "../../packages/world/package.json" with { type: "json" };

export default {
  introduction: {
    title: "What is MUD?",
    theme: { breadcrumb: false },
  },
  quickstart: {
    title: "Get started",
    theme: { breadcrumb: false },
  },
  protocol: {
    title: "Protocol",
    type: "separator",
  },
  store: "Store",
  world: "World",
  framework: {
    title: "Framework",
    type: "separator",
  },
  config: "Config",
  cli: "CLI",
  "state-query": "State Query",
  indexer: "Indexer",
  "world-explorer": {
    title: "World Explorer",
    theme: { breadcrumb: false },
  },
  "---": {
    title: "", // no title renders as a line
    type: "separator",
  },
  guides: "Guides",
  templates: "Templates",
  "best-practices": "Best Practices",
  contribute: {
    title: "Contribute",
    theme: { breadcrumb: false },
  },
  changelog: "Changelog",
  retrospectives: "Retrospectives",
  audits: "Audits",
  // --------------------
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
