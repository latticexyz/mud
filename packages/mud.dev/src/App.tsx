import React from "react";
import styled from "styled-components";
import logo from "./assets/mud-logo.png";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Blog, Docs, Home, Markdown } from "./components";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Sidebar>
          <Logo src={logo} alt={"MUD logo"} />
          <Menu>
            <LogoText to="/">MUD</LogoText>
            <MenuItem to="/blog">blog</MenuItem>
            <MenuAnchor href="https://github.com/latticexyz/mud" target="_blank">
              github
            </MenuAnchor>
            <MenuAnchor href="https://twitter.com/latticexyz" target="_blank">
              twitter
            </MenuAnchor>
          </Menu>
        </Sidebar>
        <SidebarPlaceholder />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs/*" element={<Docs />} />
          <Route path="/blog/" element={<Blog />} />
          <Route path="/blog/*" element={<Markdown />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

const Layout = styled.div`
  min-height: 100vh;
  display: grid;
  width: 100%;
  grid-template-columns: 50px 1fr;
`;

const Sidebar = styled.div`
  border-right: 3px solid #fff;
  display: grid;
  grid-template-rows: 50px 1fr;
  justify-content: center;
  grid-gap: 10px;
  position: fixed;
  left: 0;
  height: 100%;
  width: 50px;
`;

const SidebarPlaceholder = styled.div``;

const Logo = styled.img`
  height: 100%;
  padding: 10px;
`;

const Menu = styled.div`
  display: grid;
  align-content: start;
  justify-content: center;
  grid-gap: 30px;
`;

const MenuAnchor = styled.a`
  font-family: "Space Grotesk", sans-serif;
  writing-mode: tb-rl;
  transform: rotate(-180deg);
  text-decoration: none;
  color: #fff;
`;

const MenuItem = styled(Link)`
  font-family: "Space Grotesk", sans-serif;
  writing-mode: tb-rl;
  transform: rotate(-180deg);
  text-decoration: none;
  color: #fff;
`;

const LogoText = styled(MenuItem)`
  font-family: "Space Mono", sans-serif;
  font-weight: 700;
  color: var(--primary-color);
`;
