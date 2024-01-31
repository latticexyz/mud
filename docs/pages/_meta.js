import worldPackageJson from "../../packages/world/package.json" assert { type: "json" };

export default {
  quickstart: "Quickstart",
  introduction: "Introduction",
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
  cli: "CLI",
  "state-query": "State Query",
  services: "Services",
  templates: "Templates",
  guides: "Guides",
  contribute: "Contribute",
  changelog: "Changelog",
  retrospectives: "Retrospectives",
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
