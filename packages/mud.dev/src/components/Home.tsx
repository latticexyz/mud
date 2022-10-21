import React from "react";
import styled from "styled-components";
import { Package } from "./Package";
import { Description, Headline } from "./styled";

const packages = [
  { name: "solecs", description: "solidity entity component system", href: "/docs/solecs", primary: true },
  { name: "recs", description: "reactive entity component system in typescript", href: "/docs/recs", primary: true },
  {
    name: "network",
    description: "typescript library for synchronizing contract and client state",
    href: "/docs/network",
    primary: true,
  },
  { name: "services", description: "indexing services", href: "/docs/services" },
  {
    name: "cli",
    description: "command line interface",
    href: "https://github.com/latticexyz/mud/tree/main/packages/cli",
  },
  { name: "phaserx", description: "phaser wrapper", href: "/docs/phaserx" },
  { name: "utils", description: "various utilities", href: "/docs/utils" },
  { name: "std-contracts", description: "contract std lib", href: "/docs/std-contracts" },
  { name: "std-client", description: "client std lib", href: "/docs/std-client" },
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
          <PackageWrapper key={p.name} primary={p.primary}>
            <Package {...p} />
          </PackageWrapper>
        ))}
        <IFrame
          src="https://www.youtube.com/embed/j-_Zf8o5Wlo"
          title="MUD in theory"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></IFrame>
        <IFrame
          src="https://www.youtube.com/embed/mv3jA4USZtg"
          title="MUD in practice"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></IFrame>
      </PackageGrid>
    </Main>
  );
}

const IFrame = styled.iframe`
  max-width: 790px;
  width: 100%;
  border: 3px solid #fff;
  margin-top: 20px;
  height: 400px;
  grid-column: 1 / -1;
`;

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
  display: grid;
  grid-template-columns: repeat(6, auto);
  grid-template-rows: repeat(6, auto);
  justify-content: start;
  align-content: start;
  grid-gap: 20px;

  @media (max-width: 1020px) {
    grid-template-columns: repeat(4, auto);
  }

  @media (max-width: 770px) {
    grid-template-columns: repeat(2, auto);
    width: 250px;
  }
`;

const PackageWrapper = styled.div<{ primary?: boolean }>`
  display: inline-block;
  vertical-align: bottom;
  grid-column: span ${(p) => (p.primary ? 2 : 1)};
  grid-row: span ${(p) => (p.primary ? 2 : 1)};
`;
