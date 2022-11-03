import React from "react";
import styled from "styled-components";
import logo from "./assets/mud-logo.png";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Blog, Home, Markdown } from "./components";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <div></div>
        <Announcement href="https://discord.gg/XhZp6HbqNp" target="_blank">
          Join the discord!
        </Announcement>
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
            <MenuAnchor href="https://discord.gg/XhZp6HbqNp" target="_blank">
              discord
            </MenuAnchor>
          </Menu>
        </Sidebar>
        <SidebarPlaceholder />
        <Routes>
          <Route path="/" element={<Home />} />
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

const Announcement = styled.a`
  display: block;
  background-color: var(--primary-color);
  width: 100%;
  height: 20px;
  display: grid;
  justify-content: center;
  align-content: center;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  :hover {
    background-color: #fff;
    color: var(--primary-color);
  }
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
