import { Metadata } from "next";
import Hero from "./sections/Hero";
import FindUs from "./sections/FindUs";
import Resources from "./sections/Resources";
import TrustedBy from "./sections/TrustedBy/TrustedBy";
import Installation from "./sections/Installation";
import Architecture from "./sections/Architecture";
import Integrations from "./sections/Integrations";
import Ecosystem from "./sections/Ecosystem";
import Changelog from "./sections/Changelog";
import Newsletter from "./sections/Newsletter";

export const metadata: Metadata = {
  title: "MUD | Framework for onchain applications",
  description:
    // eslint-disable-next-line max-len
    "MUD provides you with the tools to build onchain applications and autonomous worlds, with a framework and protocol that simplifies development on Ethereum and other EVM chains.",
  icons: "/images/logos/circle/mud.svg",
};

export default async function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Installation />
      <Architecture />
      <Integrations />
      <Ecosystem />
      <Changelog />
      <Resources />
      <FindUs />
      <Newsletter />
    </>
  );
}
