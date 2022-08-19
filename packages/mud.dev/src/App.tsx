import React from "react";
import styled from "styled-components";
import logo from "./assets/mud-logo.png";
import { Description, Headline, Package } from "./components";

const packages = [
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
  { name: "solecs", description: "a good package", link: "/solecs" },
];

function App() {
  return (
    <Layout>
      <Sidebar>
        <Logo src={logo} alt={"MUD logo"} />
        <LogoText>
          <p>MUD.DEV</p>
        </LogoText>
      </Sidebar>
      <Main>
        <MainHeadline>MUD</MainHeadline>
        <MainDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam. Luis nostrud exercitation ullamco laboris.
        </MainDescription>
        <PackageGrid>
          {packages.map((p) => (
            <PackageWrapper>
              <Package key={p.name} {...p} />
            </PackageWrapper>
          ))}
        </PackageGrid>
      </Main>
    </Layout>
  );
}

export default App;

const Layout = styled.div`
  display: grid;
  min-height: 100vh;
  width: 100%;
  grid-template-columns: 50px 1fr;
`;

const Sidebar = styled.div`
  border-right: 3px solid #fff;
  display: grid;
  grid-template-rows: 50px 1fr;
  justify-content: center;
  grid-gap: 10px;
`;

const Logo = styled.img`
  height: 100%;
  padding: 10px;
`;

const LogoText = styled.div`
  display: grid;
  align-items: start;
  justify-content: center;

  p {
    writing-mode: tb-rl;
    transform: rotate(-180deg);
    font-weight: 700;
  }
`;

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
