import { DocsThemeConfig } from "nextra-theme-docs";
import NavLogo from "./components/NavLogo";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: NavLogo,
  useNextSeoProps() {
    const { asPath } = useRouter();
    return {
      titleTemplate: asPath === "/" ? "%s" : "%s – MUD",
    };
  },
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
