import { DocsThemeConfig } from "nextra-theme-docs";
import NavLogo from "./components/NavLogo";

const config: DocsThemeConfig = {
  logo: NavLogo,
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
