import React from "react";
import styled from "styled-components";
import logo from "./assets/mud-logo.png";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Docs, Home } from "./components";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Sidebar>
          <Logo src={logo} alt={"MUD logo"} />
          <LogoText>
            <a href="/">MUD.DEV</a>
          </LogoText>
        </Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs/:packageName" element={<Docs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
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

  a {
    writing-mode: tb-rl;
    transform: rotate(-180deg);
    font-weight: 700;
    text-decoration: none;
    color: #fff;
  }
`;
