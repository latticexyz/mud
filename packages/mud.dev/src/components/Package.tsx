import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { Description, Headline } from "./styled";

export const Package: React.FC<{ name: string; description: string; link?: string; external?: string }> = ({
  name,
  description,
  link,
  external,
}) => {
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
        if (external) window.open(external);
      }}
    >
      <Container onMouseEnter={setRandomPrimaryColor} onClick={resetPrimaryColor} onMouseLeave={resetPrimaryColor}>
        <Name>{name}</Name>
        <Desc>{description}</Desc>
      </Container>
    </Link>
  );
};

const Link = styled(RouterLink)`
  text-decoration: none;
`;

const Container = styled.div`
  border: 3px solid #fff;
  width: 250px;
  height: 250px;
  padding: 30px;

  :hover {
    border-color: var(--primary-color);
    h2 {
      color: var(--primary-color);
    }
  }
`;

const Desc = styled(Description)`
  font-size: 20px;
`;

const Name = styled(Headline)`
  font-size: 30px;
  color: var(--secondary-color);
`;
