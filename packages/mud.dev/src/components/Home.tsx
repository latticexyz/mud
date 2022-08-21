import React from "react";
import styled from "styled-components";
import { Package } from "./Package";
import { Description, Headline } from "./styled";

const packages = [
  { name: "solecs", description: "solidity entity component system", href: "/docs/solecs" },
  { name: "recs", description: "reactive entity component system in typescript", href: "/docs/recs" },
  {
    name: "network",
    description: "typescript library for synchronizing contract and client state",
    href: "/docs/network",
  },
  { name: "services", description: "go chain indexing and streaming services", href: "/docs/services" },
  {
    name: "cli",
    description: "mud command line interface",
    href: "https://github.com/latticexyz/mud/tree/main/packages/cli",
  },
  { name: "phaserx", description: "mud wrapper around phaser 2D game engine", href: "/docs/phaserx" },
  { name: "utils", description: "various utilities", href: "/docs/utils" },
  { name: "std-contracts", description: "mud contract standard library", href: "/docs/std-contracts" },
  { name: "std-client", description: "mud client standard library", href: "/docs/std-client" },
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
  min-width: 300px;

  @media (max-width: 600px) {
    padding: 40px;
  }
`;

const MainHeadline = styled(Headline)`
  font-size: 150px;
  display: inline-block;
  margin-right: 30px;
  vertical-align: sub;

  @media (max-width: 600px) {
    font-size: 100px;
  }
`;

const MainSubheadline = styled(Description)`
  font-size: 45px;
  text-transform: uppercase;
  font-style: italic;
  display: inline-block;
  margin-bottom: 45px;

  @media (max-width: 600px) {
    font-size: 30px;
  }
`;

const MainDescription = styled(Description)`
  font-size: 25px;

  @media (max-width: 600px) {
    font-size: 22px;
  }
`;

const PackageGrid = styled.div`
  margin-top: 60px;
`;

const PackageWrapper = styled.div`
  display: inline-block;
  margin: 20px 20px 0 0;
  vertical-align: bottom;
`;
