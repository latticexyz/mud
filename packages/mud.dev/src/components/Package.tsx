import styled from "styled-components";
import { Description, Headline } from "./styled";

export const Package: React.FC<{ name: string; description: string; link: string }> = ({ name, description, link }) => {
  return (
    <Link href={link}>
      <Container>
        <Name>{name}</Name>
        <Desc>{description}</Desc>
      </Container>
    </Link>
  );
};

const Link = styled.a`
  text-decoration: none;
`;

const Container = styled.div`
  border: 3px solid #fff;
  width: 250px;
  height: 250px;
  padding: 30px;
`;

const Desc = styled(Description)`
  font-size: 20px;
`;

const Name = styled(Headline)`
  font-size: 30px;
`;
