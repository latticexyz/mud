import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { Description, Headline } from "./styled";

export const Package: React.FC<{
  name: string;
  description: string;
  link?: string;
  href?: string;
  primary?: boolean;
}> = ({ name, description, link, href, primary }) => {
  function setRandomPrimaryColor() {
    const color = `hsl(${Math.floor(Math.random() * 360)} 100% 80%)`;
    document.documentElement.style.setProperty("--primary-color", color);
    document.documentElement.style.setProperty("--secondary-color", "white");
  }

  function resetPrimaryColor() {
    document.documentElement.style.setProperty("--primary-color", "#eb4926");
    document.documentElement.style.setProperty("--secondary-color", "#eb4926");
  }

  return (
    <Link
      to={link ?? "#"}
      onClick={() => {
        if (href) window.location.href = href;
      }}
    >
      <Container
        onMouseEnter={setRandomPrimaryColor}
        onClick={resetPrimaryColor}
        onMouseLeave={resetPrimaryColor}
        primary={primary}
      >
        <Name primary={primary}>{name}</Name>
        <Desc primary={primary}>{description}</Desc>
      </Container>
    </Link>
  );
};

const Link = styled(RouterLink)`
  text-decoration: none;
`;

const Container = styled.div<{ primary?: boolean }>`
  border: 3px solid #fff;
  width: ${(p) => (p.primary ? 250 : 115)}px;
  height: ${(p) => (p.primary ? 250 : 115)}px;
  padding: ${(p) => (p.primary ? 30 : 15)}px;

  :hover {
    border-color: var(--primary-color);
    h2 {
      color: var(--primary-color);
    }
  }
`;

const Desc = styled(Description)<{ primary?: boolean }>`
  font-size: ${(p) => (p.primary ? 20 : 12)}px;
`;

const Name = styled(Headline)<{ primary?: boolean }>`
  font-size: ${(p) => (p.primary ? 30 : 15)}px;
  color: var(--secondary-color);
`;
