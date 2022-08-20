import React from "react";
import styled from "styled-components";
import { Package } from "./Package";
import { Description, Headline } from "./styled";

const packages = [
  { name: "solecs", description: "solidity entity component system", link: "/docs/solecs" },
  { name: "recs", description: "reactive typescript entity component system", link: "/docs/recs" },
  {
    name: "network",
    description: "typescript library for synchronizing contract and client state",
    link: "/docs/network",
  },
  { name: "services", description: "go chain indexing and streaming services", link: "/docs/services" },
  { name: "cli", description: "mud command line interface", link: "/docs/cli" },
  { name: "phaserx", description: "mud wrapper around phaser 2D game engine", link: "/docs/phaserx" },
  { name: "utils", description: "various utilities", link: "/docs/utils" },
  { name: "std-contracts", description: "mud contract standard library", link: "/docs/std-contracts" },
  { name: "std-client", description: "mud client standard library", link: "/docs/std-contracts" },
];

export function Home() {
  return (
    <Main>
      <MainHeadline>MUD</MainHeadline>
      <MainSubheadline>
        An engine for
        <br />
        autonomous worlds
      </MainSubheadline>
      <MainDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam. Luis nostrud exercitation ullamco laboris.
      </MainDescription>
      <PackageGrid>
        {packages.map((p) => (
          <PackageWrapper key={p.name}>
            <Package {...p} />
          </PackageWrapper>
        ))}
      </PackageGrid>
    </Main>
  );
}

const Main = styled.div`
  padding: 20px 100px;
  max-width: 1600px;
`;

const MainHeadline = styled(Headline)`
  font-size: 150px;
  display: inline-block;
  margin-right: 30px;
  vertical-align: sub;
`;

const MainSubheadline = styled(Description)`
  font-size: 45px;
  text-transform: uppercase;
  font-style: italic;
  display: inline-block;
  margin-bottom: 45px;
`;

const MainDescription = styled(Description)`
  font-size: 25px;
`;

const PackageGrid = styled.div`
  margin-top: 60px;
`;

const PackageWrapper = styled.div`
  display: inline-block;
  margin: 20px 20px 0 0;
  vertical-align: bottom;
`;
