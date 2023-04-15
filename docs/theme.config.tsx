import { DocsThemeConfig } from "nextra-theme-docs";
import Logo from "./components/Logo";

const config: DocsThemeConfig = {
  logo: Logo,
  project: {
    link: "https://github.com/latticexyz/mud",
  },
  chat: {
    link: "https://lattice.xyz/discord",
  },
  docsRepositoryBase: "https://github.com/latticexyz/mud/blob/core/docs/pages'",
  footer: {
    text: "MUD - Engine for Autonomous Worlds",
  },
  primaryHue: 28,
};

export default config;
