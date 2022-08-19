import React from "react";
import styled from "styled-components";
import { Package } from "./Package";
import { Description, Headline } from "./styled";

const packages = [
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
  { name: "solecs", description: "a good package", link: "/docs/solecs" },
];

export function Home() {
  return (
    <Main>
      <MainHeadline>MUD</MainHeadline>
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
`;

const MainHeadline = styled(Headline)`
  font-size: 150px;
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
`;
