import { DocsThemeConfig } from "nextra-theme-docs";
import Logo from "./components/Logo";

const config: DocsThemeConfig = {
  logo: Logo,
  project: {
    link: "https://github.com/latticexyz/mud",
  },
  docsRepositoryBase: "https://github.com/latticexyz/mud/blob/core/docs/pages",
  head: (
    <>
      <meta property="title" content="MUD documentation" />
    </>
  ),
  footer: {
    text: "MIT 2023 © MUD",
  },
  primaryHue: 28,
};

export default config;
