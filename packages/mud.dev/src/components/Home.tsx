import React from "react";
import styled from "styled-components";
import { Package } from "./Package";
import { Description, Headline } from "./styled";

const packages = [
  { name: "solecs", description: "solidity entity component system", link: "/docs/solecs" },
  { name: "recs", description: "reactive entity component system in typescript", link: "/docs/recs" },
  {
    name: "network",
    description: "typescript library for synchronizing contract and client state",
    link: "/docs/network",
  },
  { name: "services", description: "go chain indexing and streaming services", link: "/docs/services" },
  {
    name: "cli",
    description: "mud command line interface",
    external: "https://github.com/latticexyz/mud/tree/main/packages/cli",
  },
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
        MUD aims to solve all the hard problems of building on-chain games. It is open source and built with
        composability and interoperability in mind.
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
